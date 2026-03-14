import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { MaintenancePayment } from '@/types/app';
import { formatCurrency, formatDate } from '@/lib/utils';

interface RegistrarPagoModalProps {
  visible: boolean;
  onClose: () => void;
  payment: MaintenancePayment | null;
  onSubmit: (paymentId: string, receiptUri?: string) => Promise<void>;
}

export default function RegistrarPagoModal({
  visible,
  onClose,
  payment,
  onSubmit,
}: RegistrarPagoModalProps) {
  const [loading, setLoading] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | undefined>();

  if (!payment) return null;

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos para adjuntar el comprobante.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para tomar la foto del comprobante.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(payment.id, receiptUri);

      // Reset form
      setReceiptUri(undefined);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el pago');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Registrar Pago">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Información del pago */}
        <View style={styles.paymentInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Monto:</Text>
            <Text style={styles.value}>
              {formatCurrency(payment.amount, payment.currency)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Frecuencia:</Text>
            <Text style={styles.value}>{payment.frequency}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha de vencimiento:</Text>
            <Text style={styles.value}>{formatDate(payment.due_date)}</Text>
          </View>
        </View>

        {/* Comprobante */}
        <Text style={styles.sectionTitle}>Comprobante de pago (opcional)</Text>
        {receiptUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: receiptUri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setReceiptUri(undefined)}
            >
              <Ionicons name="close-circle" size={32} color="#D63031" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.imageButton} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={24} color="#6C63FF" />
              <Text style={styles.imageButtonText}>Tomar foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
              <Ionicons name="images" size={24} color="#6C63FF" />
              <Text style={styles.imageButtonText}>Galería</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.note}>
          <Ionicons name="information-circle" size={20} color="#6C63FF" />
          <Text style={styles.noteText}>
            El comprobante ayuda a mantener un registro claro de los pagos realizados.
          </Text>
        </View>

        <Button
          title={loading ? 'Registrando...' : 'Registrar Pago'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  paymentInfo: {
    backgroundColor: '#F0EFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#636E72',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 12,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EFFF',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  imageButtonText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  note: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 16,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#636E72',
    lineHeight: 18,
  },
  submitButton: {
    marginTop: 8,
  },
});
