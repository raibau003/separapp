import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyStore } from '@/store/familyStore';
import { useMensajeria } from '@/hooks/useMensajeria';
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/styles';

export default function MensajesScreen() {
  const { user, profile } = useAuth();
  const { currentFamily } = useFamilyStore();
  const flatListRef = useRef<FlatList>(null);

  const [messageText, setMessageText] = useState('');

  const { messages, loading, sending, sendMessage, getUnreadCount } = useMensajeria(
    currentFamily?.id || '',
    user?.id || ''
  );

  // Auto-scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!messageText.trim() || !currentFamily || !user) return;

    try {
      await sendMessage({
        content: messageText,
        familyId: currentFamily.id,
        senderId: user.id,
      });

      setMessageText('');
    } catch (error: any) {
      Alert.alert(
        '❌ Mensaje Bloqueado',
        error.message || 'El mensaje no pudo ser enviado',
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
      });
    }
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isOwnMessage = item.sender_id === user?.id;
    const showDate =
      index === 0 ||
      formatDate(item.created_at) !== formatDate(messages[index - 1]?.created_at);

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{formatDate(item.created_at)}</Text>
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            isOwnMessage ? styles.ownMessage : styles.otherMessage,
          ]}
        >
          {!isOwnMessage && (
            <Text style={styles.senderName}>{item.sender.full_name}</Text>
          )}
          <Text style={styles.messageText}>{item.content}</Text>
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>{formatTime(item.created_at)}</Text>
            {isOwnMessage && (
              <Ionicons
                name={item.read_at ? 'checkmark-done' : 'checkmark'}
                size={16}
                color={item.read_at ? '#4CAF50' : '#BDBDBD'}
              />
            )}
            {item.filtered && (
              <Ionicons
                name="shield-checkmark"
                size={14}
                color="#FF9800"
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (!currentFamily) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#BDBDBD" />
          <Text style={styles.emptyStateTitle}>No hay familia configurada</Text>
          <Text style={styles.emptyStateText}>
            Crea o únete a una familia para comenzar a comunicarte
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.success]} style={styles.header}>
        <Text style={styles.headerTitle}>Mensajería</Text>
        <Text style={styles.headerSubtitle}>
          Comunicación constructiva y respetuosa
        </Text>
      </LinearGradient>

      {/* Filtro IA Badge */}
      <View style={styles.aiBadge}>
        <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
        <Text style={styles.aiBadgeText}>
          Protegido con filtro de IA - Mensajes inmutables
        </Text>
      </View>

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-outline" size={64} color="#BDBDBD" />
          <Text style={styles.emptyStateTitle}>No hay mensajes</Text>
          <Text style={styles.emptyStateText}>
            Envía el primer mensaje para comenzar la conversación
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje respetuoso..."
          placeholderTextColor="#BDBDBD"
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
          editable={!sending}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!messageText.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Ionicons name="send" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.surface,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.surface,
    opacity: 0.9,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  aiBadgeText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  messagesList: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  messageContainer: {
    maxWidth: '75%',
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  messageText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  messageTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
