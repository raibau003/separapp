import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import PagoCard from '@/components/manutencion/PagoCard';
import ConfigurarManutencionModal from '@/components/manutencion/ConfigurarManutencionModal';
import RegistrarPagoModal from '@/components/manutencion/RegistrarPagoModal';
import { MaintenancePayment } from '@/types/app';
import { formatCurrency } from '@/lib/utils';

export default function ManutencionScreen() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<MaintenancePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [configurarModalVisible, setConfigurarModalVisible] = useState(false);
  const [registrarModalVisible, setRegistrarModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<MaintenancePayment | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, [user]);

  const loadPayments = async () => {
    if (!user) return;

    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single();

    if (!familyMember) {
      setLoading(false);
      return;
    }

    setFamilyId(familyMember.family_id);

    const { data, error } = await supabase
      .from('maintenance_payments')
      .select('*')
      .eq('family_id', familyMember.family_id)
      .order('due_date', { ascending: false});

    if (error) {
      console.error('Error loading payments:', error);
    } else {
      setPayments(data || []);
    }

    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const handlePaymentPress = (payment: MaintenancePayment) => {
    if (payment.status === 'pending' || payment.status === 'late') {
      setSelectedPayment(payment);
      setRegistrarModalVisible(true);
    } else {
      Alert.alert(
        'Pago de Manutención',
        `Monto: ${formatCurrency(payment.amount, payment.currency)}\nEstado: Pagado`
      );
    }
  };

  const handleConfigurarManutencion = async (data: any) => {
    if (!user || !familyId) return;

    const { error } = await supabase
      .from('maintenance_payments')
      .insert({
        family_id: familyId,
        amount: data.amount,
        currency: data.currency,
        frequency: data.frequency,
        due_date: data.due_date,
        status: 'pending',
      });

    if (error) {
      throw error;
    }

    await loadPayments();
    Alert.alert('¡Listo!', 'Manutención configurada exitosamente');
  };

  const handleRegistrarPago = async (paymentId: string, receiptUri?: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('maintenance_payments')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
        paid_by: user.id,
        receipt_url: receiptUri || null,
      })
      .eq('id', paymentId);

    if (error) {
      throw error;
    }

    await loadPayments();
    Alert.alert('¡Listo!', 'Pago registrado exitosamente');
  };

  const totalPending = payments
    .filter(p => p.status === 'pending' || p.status === 'late')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Manutención</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setConfigurarModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {payments.length > 0 && (
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Ionicons name="hourglass-outline" size={20} color="#FF9800" />
            <Text style={styles.summaryLabel}>Pendientes</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalPending)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#00B894" />
            <Text style={styles.summaryLabel}>Pagados</Text>
            <Text style={[styles.summaryValue, styles.summaryValuePaid]}>
              {formatCurrency(totalPaid)}
            </Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.emptyState}>
          <Text>Cargando...</Text>
        </View>
      ) : payments.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={64} color="#B2BEC3" />
          <Text style={styles.emptyStateTitle}>No hay pagos registrados</Text>
          <Text style={styles.emptyStateText}>
            Configura los pagos de manutención para comenzar
          </Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PagoCard payment={item} onPress={() => handlePaymentPress(item)} />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      <ConfigurarManutencionModal
        visible={configurarModalVisible}
        onClose={() => setConfigurarModalVisible(false)}
        onSubmit={handleConfigurarManutencion}
      />

      <RegistrarPagoModal
        visible={registrarModalVisible}
        onClose={() => {
          setRegistrarModalVisible(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
        onSubmit={handleRegistrarPago}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DFE6E9',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3436',
  },
  addButton: {
    backgroundColor: '#6C63FF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summary: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#636E72',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  summaryValuePaid: {
    color: '#00B894',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#DFE6E9',
    marginHorizontal: 20,
  },
  list: {
    padding: 16,
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
    color: '#2D3436',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
  },
});
