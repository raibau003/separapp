import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ExpenseCategory, Currency } from '@/types/app';

interface NuevoGastoModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    currency: Currency;
    category: ExpenseCategory;
    description: string;
    receipt_uri?: string;
  }) => Promise<void>;
  children?: { id: string; full_name: string }[];
}

const categoryOptions = [
  { label: 'Educación', value: 'educacion' },
  { label: 'Salud', value: 'salud' },
  { label: 'Ropa', value: 'ropa' },
  { label: 'Alimentación', value: 'alimentacion' },
  { label: 'Deporte', value: 'deporte' },
  { label: 'Transporte', value: 'transporte' },
  { label: 'Otros', value: 'otros' },
];

const currencyOptions = [
  { label: 'Peso Chileno (CLP)', value: 'CLP' },
  { label: 'Peso Argentino (ARS)', value: 'ARS' },
  { label: 'Peso Mexicano (MXN)', value: 'MXN' },
  { label: 'Euro (EUR)', value: 'EUR' },
];

export default function NuevoGastoModal({ visible, onClose, onSubmit, children = [] }: NuevoGastoModalProps) {
  const [loading, setLoading] = useState(false);
  const [childId, setChildId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('CLP');
  const [category, setCategory] = useState<ExpenseCategory>('otros');
  const [description, setDescription] = useState('');
  const [receiptUri, setReceiptUri] = useState<string | undefined>();

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos para adjuntar la boleta.');
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
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para tomar la foto de la boleta.');
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
    if (!childId) {
      Alert.alert('Error', 'Debes seleccionar un hijo');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Debes ingresar un monto válido');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Debes ingresar una descripción');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        amount: parseFloat(amount),
        currency,
        category,
        description: description.trim(),
        receipt_uri: receiptUri,
      });

      // Reset form
      setChildId('');
      setAmount('');
      setCurrency('CLP');
      setCategory('otros');
      setDescription('');
      setReceiptUri(undefined);

      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el gasto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const childOptions = children.map(child => ({
    label: child.full_name,
    value: child.id,
  }));

  return (
    <Modal visible={visible} onClose={onClose} title="Nuevo Gasto">
      <ScrollView showsVerticalScrollIndicator={false}>
        {children.length > 0 && (
          <Select
            label="Hijo"
            value={childId}
            options={childOptions}
            onChange={setChildId}
            placeholder="Selecciona un hijo"
          />
        )}

        <Input
          label="Monto"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0"
        />

        <Select
          label="Moneda"
          value={currency}
          options={currencyOptions}
          onChange={(value) => setCurrency(value as Currency)}
        />

        <Select
          label="Categoría"
          value={category}
          options={categoryOptions}
          onChange={(value) => setCategory(value as ExpenseCategory)}
        />

        <Input
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          placeholder="¿En qué se gastó?"
          multiline
          numberOfLines={3}
          style={styles.textArea}
        />

        <Text style={styles.label}>Boleta o comprobante (opcional)</Text>
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

        <Button
          title={loading ? 'Creando...' : 'Crear Gasto'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
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
  submitButton: {
    marginTop: 8,
  },
});
