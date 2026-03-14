import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { scheduleLocalNotification } from '@/lib/notifications';

export type EventType = 'custody' | 'medical' | 'school' | 'activity' | 'other';

export interface CalendarEvent {
  id: string;
  family_id: string;
  title: string;
  description?: string;
  event_type: EventType;
  start_date: string;
  end_date?: string;
  all_day: boolean;
  location?: string;
  created_by: string;
  created_by_profile?: {
    id: string;
    full_name: string;
  };
  created_at: string;
}

export interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
    events?: CalendarEvent[];
  };
}

/**
 * Hook para gestionar el calendario compartido
 */
export function useCalendario(familyId: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  /**
   * Cargar eventos del calendario
   */
  const loadEvents = useCallback(async () => {
    if (!familyId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('calendar_events')
        .select(
          `
          *,
          created_by_profile:created_by(id, full_name)
        `
        )
        .eq('family_id', familyId)
        .order('start_date', { ascending: true });

      if (error) throw error;

      setEvents(data || []);
      updateMarkedDates(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  /**
   * Actualizar fechas marcadas para el calendario
   */
  const updateMarkedDates = (events: CalendarEvent[]) => {
    const marked: MarkedDates = {};

    events.forEach((event) => {
      const startDate = event.start_date.split('T')[0];

      if (!marked[startDate]) {
        marked[startDate] = {
          marked: true,
          dotColor: getEventColor(event.event_type),
          events: [],
        };
      }

      marked[startDate].events?.push(event);
    });

    setMarkedDates(marked);
  };

  /**
   * Obtener color por tipo de evento
   */
  const getEventColor = (type: EventType): string => {
    switch (type) {
      case 'custody':
        return '#6C63FF'; // Morado
      case 'medical':
        return '#F44336'; // Rojo
      case 'school':
        return '#FF9800'; // Naranja
      case 'activity':
        return '#4CAF50'; // Verde
      case 'other':
        return '#757575'; // Gris
      default:
        return '#757575';
    }
  };

  /**
   * Obtener nombre del tipo de evento
   */
  const getEventTypeName = (type: EventType): string => {
    switch (type) {
      case 'custody':
        return 'Custodia';
      case 'medical':
        return 'Médico';
      case 'school':
        return 'Escolar';
      case 'activity':
        return 'Actividad';
      case 'other':
        return 'Otro';
      default:
        return 'Otro';
    }
  };

  /**
   * Crear nuevo evento
   */
  const createEvent = async (
    eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'family_id'>
  ) => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          family_id: familyId,
        })
        .select(
          `
          *,
          created_by_profile:created_by(id, full_name)
        `
        )
        .single();

      if (error) throw error;

      // Programar notificación 1 día antes
      await scheduleEventNotification(data);

      await loadEvents();
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  /**
   * Actualizar evento
   */
  const updateEvent = async (
    eventId: string,
    updates: Partial<CalendarEvent>
  ) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', eventId);

      if (error) throw error;

      await loadEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  /**
   * Eliminar evento
   */
  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      await loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  /**
   * Obtener eventos de una fecha específica
   */
  const getEventsForDate = (date: string): CalendarEvent[] => {
    return events.filter((event) => event.start_date.startsWith(date));
  };

  /**
   * Programar notificación para un evento
   */
  const scheduleEventNotification = async (event: CalendarEvent) => {
    try {
      const eventDate = new Date(event.start_date);
      const oneDayBefore = new Date(eventDate);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      oneDayBefore.setHours(18, 0, 0, 0); // 6 PM del día anterior

      const now = new Date();

      if (oneDayBefore > now) {
        await scheduleLocalNotification({
          title: `📅 Recordatorio: ${event.title}`,
          body: `Mañana: ${event.description || getEventTypeName(event.event_type)}`,
          data: {
            type: 'calendar_event',
            event_id: event.id,
          },
          trigger: oneDayBefore,
        });

        console.log(`✅ Notificación programada para ${event.title}`);
      }
    } catch (error) {
      console.error('Error scheduling event notification:', error);
    }
  };

  /**
   * Obtener próximos eventos
   */
  const getUpcomingEvents = (limit: number = 5): CalendarEvent[] => {
    const now = new Date();
    return events
      .filter((event) => new Date(event.start_date) >= now)
      .slice(0, limit);
  };

  /**
   * Obtener eventos de custodia del mes
   */
  const getCustodyEventsForMonth = (month: Date): CalendarEvent[] => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    return events.filter((event) => {
      if (event.event_type !== 'custody') return false;

      const eventDate = new Date(event.start_date);
      return eventDate >= firstDay && eventDate <= lastDay;
    });
  };

  /**
   * Cargar eventos al montar el componente
   */
  useEffect(() => {
    loadEvents();

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel('calendar_events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: `family_id=eq.${familyId}`,
        },
        () => {
          loadEvents();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [familyId, loadEvents]);

  return {
    events,
    markedDates,
    loading,
    selectedDate,
    setSelectedDate,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getEventColor,
    getEventTypeName,
    getUpcomingEvents,
    getCustodyEventsForMonth,
    refresh: loadEvents,
  };
}
