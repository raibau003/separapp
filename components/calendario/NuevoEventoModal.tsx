import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { TextInput } from 'react-native';
import { useCalendario } from '@/hooks/useCalendario';
import { Calendar } from 'react-native-calendars';
import { z } from 'zod';

interface NuevoEventoModalProps {
  visible: boolean;
  onClose: () => void;
  familyId: string;
  children?: any[];
}

const eventSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  start_date: z.string().min(1, 'La fecha es requerida'),
  event_type: z.enum(['custody', 'medical', 'school', 'activity', 'other']),
  description: z.string().optional(),
  all_day: z.boolean().default(true),
  created_by: z.string(),
});

export function NuevoEventoModal({
  visible,
  onClose,
  familyId,
  children = [],
}: NuevoEventoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<
    'custody' | 'medical' | 'school' | 'activity' | 'other'
  >('custody');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const { createEvent } = useCalendario(familyId);

  const eventTypes = [
    { value: 'custody', label: '👨‍👩‍👧 Custodia' },
    { value: 'medical', label: '🏥 Médico' },
    { value: 'school', label: '🎓 Escolar' },
    { value: 'activity', label: '🏃 Actividad' },
    { value: 'other', label: '📌 Otro' },
  ];

  const handleCreate = async () => {
    try {
      // Validación básica
      if (!title.trim()) {
        Alert.alert('Error', 'Por favor ingresa un título para el evento');
        return;
      }

      if (!selectedDate) {
        Alert.alert('Error', 'Por favor selecciona una fecha');
        return;
      }

      // Obtener el user_id actual (simplificado: usar un placeholder)
      // En producción, obtener desde authStore
      setLoading(true);

      await createEvent({
        title: title.trim(),
        description: description.trim(),
        event_type: eventType,
        start_date: selectedDate + 'T00:00:00',
        end_date: selectedDate + 'T23:59:59',
        all_day: true,
        created_by: '', // Será asignado por el servidor
        created_by_profile: { id: '', full_name: '' },
        created_at: new Date().toISOString(),
        id: '',
        family_id: familyId,
      });

      Alert.alert('Éxito', 'Evento creado correctamente');
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'No se pudo crear el evento');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEventType('custody');
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nuevo evento</Text>
          <TouchableOpacity onPress={handleCreate} disabled={loading}>
            <Text style={[styles.saveButton, loading && styles.disabled]}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Título */}
          <View style={styles.section}>
            <Text style={styles.label}>Título del evento *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Custodia con papá"
              value={title}
              onChangeText={setTitle}
              editable={!loading}
              placeholderTextColor="#999"
            />
          </View>

          {/* Tipo de evento */}
          <View style={styles.section}>
            <Text style={styles.label}>Tipo de evento *</Text>
            <View style={styles.eventTypeGrid}>
              {eventTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.eventTypeButton,
                    eventType === type.value && styles.eventTypeButtonActive,
                  ]}
                  onPress={() => setEventType(type.value as any)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.eventTypeButtonText,
                      eventType === type.value &&
                        styles.eventTypeButtonTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Fecha */}
          <View style={styles.section}>
            <Text style={styles.label}>Fecha del evento *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowCalendar(!showCalendar)}
              disabled={loading}
            >
              <Text style={styles.dateButtonText}>{selectedDate}</Text>
            </TouchableOpacity>

            {showCalendar && (
              <View style={styles.calendarContainer}>
                <Calendar
                  onDayPress={(day) => {
                    setSelectedDate(day.dateString);
                    setShowCalendar(false);
                  }}
                  markedDates={{
                    [selectedDate]: {
                      selected: true,
                      selectedColor: '#6C63FF',
                    },
                  }}
                  minDate={new Date().toISOString().split('T')[0]}
                  theme={{
                    backgroundColor: '#FFFFFF',
                    calendarBackground: '#FFFFFF',
                    textSectionTitleColor: '#636E72',
                    selectedDayBackgroundColor: '#6C63FF',
                    selectedDayTextColor: '#FFFFFF',
                    todayTextColor: '#6C63FF',
                    dayTextColor: '#2D3436',
                    textDisabledColor: '#D0D0D0',
                  }}
                />
              </View>
            )}
          </View>

          {/* Descripción */}
          <View style={styles.section}>
            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Agrega detalles adicionales..."
              value={description}
              onChangeText={setDescription}
              editable={!loading}
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6C63FF" />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 50,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DFE6E9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
  },
  cancelButton: {
    color: '#636E72',
    fontSize: 16,
  },
  saveButton: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE6E9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D3436',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  eventTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventTypeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE6E9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  eventTypeButtonActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  eventTypeButtonText: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
  },
  eventTypeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE6E9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '500',
  },
  calendarContainer: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
