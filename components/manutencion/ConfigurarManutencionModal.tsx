import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Currency } from '@/types/app';

interface ConfigurarManutencionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    currency: Currency;
    frequency: 'mensual' | 'quincenal';
    due_date: string;
  }) => Promise<void>;
}

const currencyOptions = [
  { label: 'Peso Chileno (CLP)', value: 'CLP' },
  { label: 'Peso Argentino (ARS)', value: 'ARS' },
  { label: 'Peso Mexicano (MXN)', value: 'MXN' },
  { label: 'Euro (EUR)', value: 'EUR' },
];

const frequencyOptions = [
  { label: 'Mensual', value: 'mensual' },
  { label: 'Quincenal', value: 'quincenal' },
];

export default function ConfigurarManutencionModal({
  visible,
  onClose,
  onSubmit,
}: ConfigurarManutencionModalProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('CLP');
  const [frequency, setFrequency] = useState<'mensual' | 'quincenal'>('mensual');
  const [dueDay, setDueDay] = useState('1');

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Debes ingresar un monto válido');
      return;
    }

    const day = parseInt(dueDay);
    if (isNaN(day) || day < 1 || day > 28) {
      Alert.alert('Error', 'El día debe estar entre 1 y 28');
      return;
    }

    setLoading(true);
    try {
      // Calcular la próxima fecha de vencimiento
      const today = new Date();
      let nextDueDate = new Date(today.getFullYear(), today.getMonth(), day);

      // Si ya pasó el día este mes, usar el próximo mes
      if (nextDueDate < today) {
        nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, day);
      }

      await onSubmit({
        amount: parseFloat(amount),
        currency,
        frequency,
        due_date: nextDueDate.toISOString().split('T')[0],
      });

      // Reset form
      setAmount('');
      setCurrency('CLP');
      setFrequency('mensual');
      setDueDay('1');

      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo configurar la manutención');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Configurar Manutención">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Input
          label="Monto acordado"
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
          label="Frecuencia de pago"
          value={frequency}
          options={frequencyOptions}
          onChange={(value) => setFrequency(value as 'mensual' | 'quincenal')}
        />

        <Input
          label={frequency === 'mensual' ? 'Día del mes (1-28)' : 'Día de pago (1-28)'}
          value={dueDay}
          onChangeText={setDueDay}
          keyboardType="numeric"
          placeholder="1"
          helperText={
            frequency === 'mensual'
              ? 'Día del mes en que vence el pago'
              : 'Día en que vence cada quincena (1 y 15 típicamente)'
          }
        />

        <Button
          title={loading ? 'Configurando...' : 'Guardar Configuración'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    marginTop: 8,
  },
});
