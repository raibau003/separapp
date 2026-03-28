import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyStore } from '@/store/familyStore';
// Stripe disabled for web support
// import {
//   getPaymentMethods,
//   getWalletTransactions,
//   setDefaultPaymentMethod,
//   deletePaymentMethod,
// } from '@/lib/stripe';
import { getSettlements, getCurrentMonthSettlement } from '@/lib/settlements';
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/styles';
// import AgregarTarjetaModal from '@/components/wallet/AgregarTarjetaModal'; // Stripe not supported on web yet

interface PaymentMethod {
  id: string;
  card_brand: string;
  card_last4: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created_at: string;
  from_user: { full_name: string; avatar_url: string | null };
  to_user: { full_name: string; avatar_url: string | null };
}

interface Settlement {
  id: string;
  settlement_month: string;
  difference: number;
  status: string;
  debtor: { full_name: string };
  creditor: { full_name: string };
}

export default function WalletScreen() {
  const { user, profile } = useAuth();
  const { currentFamily } = useFamilyStore();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [currentSettlement, setCurrentSettlement] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  useEffect(() => {
    if (user && currentFamily) {
      loadWalletData();
    }
  }, [user, currentFamily]);

  const loadWalletData = async () => {
    if (!user || !currentFamily) return;

    try {
      setLoading(true);

      // Stripe disabled for web - only load settlements
      const [setts, currentSett] = await Promise.all([
        getSettlements(currentFamily.id, 6),
        getCurrentMonthSettlement(currentFamily.id),
      ]);

      setPaymentMethods([]); // Stripe not available on web
      setTransactions([]); // Stripe not available on web
      setSettlements(setts || []);
      setCurrentSettlement(currentSett);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      Alert.alert('Error', 'No se pudo cargar la información del wallet');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleSetDefaultCard = async (methodId: string) => {
    // Stripe disabled for web
    Alert.alert('No disponible', 'Esta funcionalidad aún no está disponible en web');
    // if (!user) return;

    // try {
    //   await setDefaultPaymentMethod(user.id, methodId);
    //   await loadWalletData();
    //   Alert.alert('Éxito', 'Tarjeta predeterminada actualizada');
    // } catch (error) {
    //   console.error('Error setting default card:', error);
    //   Alert.alert('Error', 'No se pudo actualizar la tarjeta predeterminada');
    // }
  };

  const handleDeleteCard = async (methodId: string) => {
    if (!user) return;

    Alert.alert(
      'Eliminar Tarjeta',
      '¿Estás seguro de que deseas eliminar esta tarjeta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Stripe disabled for web
              // await deletePaymentMethod(methodId, user.id);
              await loadWalletData();
              Alert.alert('Éxito', 'Tarjeta eliminada');
            } catch (error) {
              console.error('Error deleting card:', error);
              Alert.alert('Error', 'No se pudo eliminar la tarjeta');
            }
          },
        },
      ]
    );
  };

  const formatAmount = (amount: number, currency: string = 'CLP') => {
    if (currency === 'CLP') {
      return `$${amount.toLocaleString('es-CL')}`;
    }
    return `${currency} ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      case 'amex':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'completed':
        return '#4CAF50';
      case 'pending':
      case 'processing':
        return '#FF9800';
      case 'failed':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'Exitoso';
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'Procesando';
      case 'failed':
        return 'Fallido';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.success]} style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <Text style={styles.headerSubtitle}>Gestiona tus pagos y tarjetas</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Liquidación Actual */}
        {currentSettlement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Liquidación del Mes Actual</Text>
            <View style={styles.settlementCard}>
              <View style={styles.settlementRow}>
                <Text style={styles.settlementLabel}>Deudor:</Text>
                <Text style={styles.settlementValue}>
                  {currentSettlement.debtor.full_name}
                </Text>
              </View>
              <View style={styles.settlementRow}>
                <Text style={styles.settlementLabel}>Acreedor:</Text>
                <Text style={styles.settlementValue}>
                  {currentSettlement.creditor.full_name}
                </Text>
              </View>
              <View style={styles.settlementRow}>
                <Text style={styles.settlementLabel}>Monto:</Text>
                <Text style={[styles.settlementAmount, { color: '#6C63FF' }]}>
                  {formatAmount(currentSettlement.difference)}
                </Text>
              </View>
              <View style={styles.settlementRow}>
                <Text style={styles.settlementLabel}>Estado:</Text>
                <Text
                  style={[
                    styles.settlementStatus,
                    { color: getStatusColor(currentSettlement.status) },
                  ]}
                >
                  {getStatusText(currentSettlement.status)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Tarjetas Guardadas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tarjetas Guardadas</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddCardModal(true)}
            >
              <Ionicons name="add-circle" size={24} color="#6C63FF" />
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {paymentMethods.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>No tienes tarjetas guardadas</Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setShowAddCardModal(true)}
              >
                <Text style={styles.primaryButtonText}>Agregar Tarjeta</Text>
              </TouchableOpacity>
            </View>
          ) : (
            paymentMethods.map((method) => (
              <View key={method.id} style={styles.cardItem}>
                <View style={styles.cardInfo}>
                  <Ionicons
                    name={getCardIcon(method.card_brand)}
                    size={32}
                    color="#6C63FF"
                  />
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardBrand}>
                      {method.card_brand.toUpperCase()}
                    </Text>
                    <Text style={styles.cardNumber}>•••• {method.card_last4}</Text>
                    <Text style={styles.cardExpiry}>
                      Exp: {method.card_exp_month}/{method.card_exp_year}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  {method.is_default ? (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Predeterminada</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleSetDefaultCard(method.id)}
                    >
                      <Text style={styles.setDefaultText}>
                        Establecer como predeterminada
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDeleteCard(method.id)}>
                    <Ionicons name="trash-outline" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Historial de Transacciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Transacciones</Text>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>
                No hay transacciones registradas
              </Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <View key={tx.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Ionicons
                    name={
                      tx.transaction_type === 'charge'
                        ? 'arrow-down-circle'
                        : 'arrow-up-circle'
                    }
                    size={24}
                    color={
                      tx.transaction_type === 'charge' ? '#F44336' : '#4CAF50'
                    }
                  />
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionDescription}>
                      {tx.description || 'Sin descripción'}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(tx.created_at)}
                    </Text>
                    <Text style={styles.transactionUsers}>
                      {tx.from_user?.full_name} → {tx.to_user?.full_name}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          tx.transaction_type === 'charge'
                            ? '#F44336'
                            : '#4CAF50',
                      },
                    ]}
                  >
                    {tx.transaction_type === 'charge' ? '-' : '+'}
                    {formatAmount(tx.amount, tx.currency)}
                  </Text>
                  <Text
                    style={[
                      styles.transactionStatus,
                      { color: getStatusColor(tx.status) },
                    ]}
                  >
                    {getStatusText(tx.status)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Historial de Liquidaciones */}
        {settlements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Liquidaciones Anteriores (últimas 6)
            </Text>
            {settlements.map((settlement) => (
              <View key={settlement.id} style={styles.settlementItem}>
                <View style={styles.settlementInfo}>
                  <Text style={styles.settlementMonth}>
                    {new Date(settlement.settlement_month).toLocaleDateString(
                      'es-CL',
                      {
                        month: 'long',
                        year: 'numeric',
                      }
                    )}
                  </Text>
                  <Text style={styles.settlementUsers}>
                    {settlement.debtor.full_name} → {settlement.creditor.full_name}
                  </Text>
                </View>
                <View style={styles.settlementRight}>
                  <Text style={styles.settlementAmountSmall}>
                    {formatAmount(settlement.difference)}
                  </Text>
                  <Text
                    style={[
                      styles.settlementStatusSmall,
                      { color: getStatusColor(settlement.status) },
                    ]}
                  >
                    {getStatusText(settlement.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal para Agregar Tarjeta - Disabled on web */}
      {/* <AgregarTarjetaModal
        visible={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
        onSuccess={() => {
          setShowAddCardModal(false);
          loadWalletData();
        }}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.surface,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.surface,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  section: {
    marginBottom: spacing.xxxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.sm,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  settlementCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    ...shadows.md,
  },
  settlementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  settlementLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  settlementValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  settlementAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settlementStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardDetails: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  cardNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  cardExpiry: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  defaultBadgeText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  setDefaultText: {
    color: colors.primary,
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  transactionUsers: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionStatus: {
    fontSize: 12,
    marginTop: spacing.sm,
  },
  settlementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  settlementInfo: {
    flex: 1,
  },
  settlementMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  settlementUsers: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  settlementRight: {
    alignItems: 'flex-end',
  },
  settlementAmountSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  settlementStatusSmall: {
    fontSize: 12,
    marginTop: spacing.sm,
  },
});
