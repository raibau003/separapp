import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { validateMessage } from '@/lib/claude';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Message {
  id: string;
  family_id: string;
  sender_id: string;
  sender: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  content: string;
  created_at: string;
  read_at?: string | null;
  filtered: boolean;
}

interface SendMessageParams {
  content: string;
  familyId: string;
  senderId: string;
}

/**
 * Hook para mensajería en tiempo real con filtro de IA
 * Los mensajes son inmutables (no se pueden editar ni eliminar)
 */
export function useMensajeria(familyId: string, userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  /**
   * Cargar mensajes históricos
   */
  const loadMessages = useCallback(async () => {
    if (!familyId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('messages')
        .select(
          `
          *,
          sender:sender_id(id, full_name, avatar_url)
        `
        )
        .eq('family_id', familyId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  /**
   * Enviar mensaje con filtro de IA
   */
  const sendMessage = async ({ content, familyId, senderId }: SendMessageParams) => {
    if (!content.trim()) {
      throw new Error('El mensaje no puede estar vacío');
    }

    try {
      setSending(true);

      // Filtrar mensaje con IA
      console.log('🔍 Filtrando mensaje...');
      const filterResult = await validateMessage(content.trim());

      if (!filterResult.isAppropriate) {
        // Si el mensaje es bloqueado, lanzar error con sugerencia
        throw new Error(
          filterResult.reason || 'El mensaje contiene contenido inapropiado'
        );
      }

      // Insertar mensaje en la base de datos
      const { data, error } = await supabase
        .from('messages')
        .insert({
          family_id: familyId,
          sender_id: senderId,
          content: content.trim(),
          filtered: filterResult.severity === 'warning',
        })
        .select(
          `
          *,
          sender:sender_id(id, full_name, avatar_url)
        `
        )
        .single();

      if (error) throw error;

      console.log('✅ Mensaje enviado');

      // El mensaje se agregará automáticamente vía Realtime
      return data;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    } finally {
      setSending(false);
    }
  };

  /**
   * Marcar mensajes como leídos
   */
  const markAsRead = async (messageIds: string[]) => {
    if (messageIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds)
        .is('read_at', null);

      if (error) throw error;

      console.log(`✅ ${messageIds.length} mensajes marcados como leídos`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  /**
   * Marcar todos los mensajes del otro usuario como leídos
   */
  const markAllAsRead = async () => {
    const unreadMessages = messages.filter(
      (msg) => !msg.read_at && msg.sender_id !== userId
    );

    if (unreadMessages.length > 0) {
      await markAsRead(unreadMessages.map((msg) => msg.id));
    }
  };

  /**
   * Obtener cantidad de mensajes no leídos
   */
  const getUnreadCount = useCallback(() => {
    return messages.filter((msg) => !msg.read_at && msg.sender_id !== userId).length;
  }, [messages, userId]);

  /**
   * Configurar suscripción en tiempo real
   */
  useEffect(() => {
    if (!familyId) return;

    // Cargar mensajes iniciales
    loadMessages();

    // Configurar suscripción a nuevos mensajes
    console.log('📡 Suscribiendo a mensajes en tiempo real...');

    const channel = supabase
      .channel(`messages:${familyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `family_id=eq.${familyId}`,
        },
        async (payload) => {
          console.log('📨 Nuevo mensaje recibido:', payload);

          // Obtener datos completos del mensaje con el sender
          const { data: newMessage } = await supabase
            .from('messages')
            .select(
              `
              *,
              sender:sender_id(id, full_name, avatar_url)
            `
            )
            .eq('id', payload.new.id)
            .single();

          if (newMessage) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          console.log('✏️ Mensaje actualizado:', payload);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('📡 Estado de suscripción:', status);
      });

    channelRef.current = channel;

    // Cleanup al desmontar
    return () => {
      console.log('📡 Desuscribiendo de mensajes...');
      channel.unsubscribe();
    };
  }, [familyId, loadMessages]);

  /**
   * Marcar mensajes como leídos cuando el usuario ve la conversación
   */
  useEffect(() => {
    if (messages.length > 0) {
      markAllAsRead();
    }
  }, [messages.length]);

  return {
    messages,
    loading,
    sending,
    sendMessage,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    refresh: loadMessages,
  };
}
