import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyStore } from '@/store/familyStore';
import { useCalendario, CalendarEvent } from '@/hooks/useCalendario';
import { NuevoEventoModal } from '@/components/calendario/NuevoEventoModal';
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/styles';

// Configurar calendario en español
LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
  monthNamesShort: [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ],
  dayNames: [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

export default function CalendarioScreen() {
  const { user } = useAuth();
  const { currentFamily } = useFamilyStore();

  const {
    events,
    markedDates,
    loading,
    selectedDate,
    setSelectedDate,
    getEventsForDate,
    getEventColor,
    getEventTypeName,
    refresh,
  } = useCalendario(currentFamily?.id || '');

  const [refreshing, setRefreshing] = useState(false);
  const [showNewEventModal, setShowNewEventModal] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const renderEvent = (event: CalendarEvent) => {
    const color = getEventColor(event.event_type);

    return (
      <View key={event.id} style={[styles.eventCard, { borderLeftColor: color }]}>
        <View style={styles.eventHeader}>
          <View style={[styles.eventTypeBadge, { backgroundColor: color }]}>
            <Text style={styles.eventTypeBadgeText}>
              {getEventTypeName(event.event_type)}
            </Text>
          </View>
          {!event.all_day && (
            <Text style={styles.eventTime}>{formatTime(event.start_date)}</Text>
          )}
        </View>
        <Text style={styles.eventTitle}>{event.title}</Text>
        {event.description && (
          <Text style={styles.eventDescription}>{event.description}</Text>
        )}
        {event.location && (
          <View style={styles.eventLocation}>
            <Ionicons name="location-outline" size={14} color="#757575" />
            <Text style={styles.eventLocationText}>{event.location}</Text>
          </View>
        )}
        {event.created_by_profile && (
          <Text style={styles.eventCreatedBy}>
            Creado por {event.created_by_profile.full_name}
          </Text>
        )}
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
            Crea o únete a una familia para ver el calendario compartido
          </Text>
        </View>
      </View>
    );
  }

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.success]} style={styles.header}>
        <Text style={styles.headerTitle}>Calendario</Text>
        <Text style={styles.headerSubtitle}>Eventos y custodia compartida</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Calendar */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C63FF" />
          </View>
        ) : (
          <>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={{
                ...markedDates,
                [selectedDate]: {
                  ...markedDates[selectedDate],
                  selected: true,
                  selectedColor: colors.primary,
                },
              }}
              theme={{
                todayTextColor: colors.primary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.surface,
                arrowColor: colors.primary,
                monthTextColor: colors.text,
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
              }}
              style={styles.calendar}
            />

            {/* Legend */}
            <View style={styles.legend}>
              <Text style={styles.legendTitle}>Tipos de eventos:</Text>
              <View style={styles.legendItems}>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: '#6C63FF' }]}
                  />
                  <Text style={styles.legendText}>Custodia</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: '#F44336' }]}
                  />
                  <Text style={styles.legendText}>Médico</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: '#FF9800' }]}
                  />
                  <Text style={styles.legendText}>Escolar</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: '#4CAF50' }]}
                  />
                  <Text style={styles.legendText}>Actividad</Text>
                </View>
              </View>
            </View>

            {/* Selected Date Events */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {formatDate(selectedDate)}
              </Text>

              {selectedDateEvents.length === 0 ? (
                <View style={styles.noEventsContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={48}
                    color="#BDBDBD"
                  />
                  <Text style={styles.noEventsText}>
                    No hay eventos para este día
                  </Text>
                </View>
              ) : (
                selectedDateEvents.map((event) => renderEvent(event))
              )}
            </View>

            {/* Add Event Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowNewEventModal(true)}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Agregar Evento</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* New Event Modal */}
      {currentFamily && (
        <NuevoEventoModal
          visible={showNewEventModal}
          onClose={() => setShowNewEventModal(false)}
          familyId={currentFamily.id}
        />
      )}
    </View>
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
  content: {
    flex: 1,
  },
  loadingContainer: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  calendar: {
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  legend: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
    textTransform: 'capitalize',
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  noEventsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  eventTypeBadge: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  eventTypeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.surface,
    textTransform: 'uppercase',
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  eventLocationText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  eventCreatedBy: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xl,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
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
});
