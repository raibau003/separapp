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
      <LinearGradient colors={['#6C63FF', '#4CAF50']} style={styles.header}>
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
                  selectedColor: '#6C63FF',
                },
              }}
              theme={{
                todayTextColor: '#6C63FF',
                selectedDayBackgroundColor: '#6C63FF',
                selectedDayTextColor: '#FFFFFF',
                arrowColor: '#6C63FF',
                monthTextColor: '#212121',
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

            {/* Add Event Button (placeholder) */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                // TODO: Abrir modal de crear evento
                console.log('Crear nuevo evento');
              }}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Agregar Evento</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  calendar: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  legend: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#757575',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 12,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTypeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  eventTypeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  eventLocationText: {
    fontSize: 13,
    color: '#757575',
  },
  eventCreatedBy: {
    fontSize: 11,
    color: '#BDBDBD',
    fontStyle: 'italic',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
});
