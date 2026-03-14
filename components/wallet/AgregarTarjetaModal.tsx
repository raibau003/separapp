import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { useAuth } from '@/hooks/useAuth';
import { createStripeCustomer, attachPaymentMethod } from '@/lib/stripe';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AgregarTarjetaModal({ visible, onClose, onSuccess }: Props) {
  const { user, profile } = useAuth();
  const { createPaymentMethod } = useStripe();

  const [cardValid, setCardValid] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddCard = async () => {
    if (!user || !profile) {
      Alert.alert('Error', 'Debes estar autenticado para agregar una tarjeta');
      return;
    }

    if (!cardValid) {
      Alert.alert('Error', 'Por favor completa los datos de la tarjeta');
      return;
    }

    setLoading(true);

    try {
      // 1. Crear PaymentMethod con Stripe
      const { paymentMethod, error: pmError } = await createPaymentMethod({
        paymentMethodType: 'Card',
      });

      if (pmError) {
        throw new Error(pmError.message);
      }

      if (!paymentMethod) {
        throw new Error('No se pudo crear el método de pago');
      }

      // 2. Crear o obtener Stripe Customer ID
      let customerId = profile.stripe_customer_id;

      if (!customerId) {
        customerId = await createStripeCustomer(
          user.id,
          profile.email,
          profile.full_name
        );
      }

      // 3. Adjuntar PaymentMethod al Customer y guardar en DB
      await attachPaymentMethod(user.id, paymentMethod.id, isDefault);

      Alert.alert(
        'Éxito',
        'Tarjeta agregada correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error adding card:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo agregar la tarjeta. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCardValid(false);
      setIsDefault(false);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Agregar Tarjeta</Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Ionicons name="close" size={28} color="#212121" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Ingresa los datos de tu tarjeta de crédito o débito
            </Text>

            {/* Stripe CardField */}
            <View style={styles.cardFieldContainer}>
              <CardField
                postalCodeEnabled={false}
                placeholders={{
                  number: '4242 4242 4242 4242',
                }}
                cardStyle={{
                  backgroundColor: '#FFFFFF',
                  textColor: '#212121',
                  borderColor: '#E0E0E0',
                  borderWidth: 1,
                  borderRadius: 8,
                }}
                style={styles.cardField}
                onCardChange={(cardDetails) => {
                  setCardValid(cardDetails.complete);
                }}
              />
            </View>

            {/* Set as Default Switch */}
            <View style={styles.defaultSwitch}>
              <Text style={styles.defaultLabel}>
                Establecer como tarjeta predeterminada
              </Text>
              <Switch
                value={isDefault}
                onValueChange={setIsDefault}
                trackColor={{ false: '#E0E0E0', true: '#6C63FF' }}
                thumbColor={isDefault ? '#FFFFFF' : '#BDBDBD'}
                disabled={loading}
              />
            </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
              <Text style={styles.securityText}>
                Tu información está protegida con encriptación de nivel bancario.
                No almacenamos tu número de tarjeta completo.
              </Text>
            </View>

            {/* Test Card Info (solo en desarrollo) */}
            {__DEV__ && (
              <View style={styles.testCardInfo}>
                <Text style={styles.testCardTitle}>
                  💳 Tarjetas de prueba (solo desarrollo)
                </Text>
                <Text style={styles.testCardText}>
                  • Éxito: 4242 4242 4242 4242
                </Text>
                <Text style={styles.testCardText}>
                  • Declinada: 4000 0000 0000 0002
                </Text>
                <Text style={styles.testCardText}>
                  • Cualquier CVV y fecha futura
                </Text>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.cancelButton, loading && styles.buttonDisabled]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.addButton,
                  (!cardValid || loading) && styles.buttonDisabled,
                ]}
                onPress={handleAddCard}
                disabled={!cardValid || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.addButtonText}>Agregar Tarjeta</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 20,
  },
  cardFieldContainer: {
    marginBottom: 20,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 10,
  },
  defaultSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
  },
  defaultLabel: {
    fontSize: 16,
    color: '#212121',
    flex: 1,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  securityText: {
    fontSize: 13,
    color: '#4CAF50',
    marginLeft: 10,
    flex: 1,
  },
  testCardInfo: {
    backgroundColor: '#FFF9C4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDD835',
  },
  testCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 8,
  },
  testCardText: {
    fontSize: 12,
    color: '#F57F17',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#6C63FF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
