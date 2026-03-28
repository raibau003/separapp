import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import GastoCard from '@/components/gastos/GastoCard';
import NuevoGastoModal from '@/components/gastos/NuevoGastoModal';
import DetalleGastoModal from '@/components/gastos/DetalleGastoModal';
import { Expense } from '@/types/app';
import { formatCurrency } from '@/lib/utils';
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/styles';

export default function GastosScreen() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detalleModalVisible, setDetalleModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    if (!user) return;

    setLoading(true);
    await Promise.all([loadFamilyAndChildren(), loadExpenses()]);
    setLoading(false);
  };

  const loadFamilyAndChildren = async () => {
    if (!user) return;

    // Obtener familia del usuario
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single();

    if (familyMember) {
      setFamilyId(familyMember.family_id);

      // Obtener hijos de la familia
      const { data: childrenData } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', familyMember.family_id);

      setChildren(childrenData || []);
    }
  };

  const loadExpenses = async () => {
    if (!user) return;

    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single();

    if (!familyMember) return;

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('family_id', familyMember.family_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading expenses:', error);
    } else {
      setExpenses(data || []);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const handleCreateExpense = async (data: any) => {
    if (!user || !familyId) return;

    const { error } = await supabase
      .from('expenses')
      .insert({
        family_id: familyId,
        child_id: data.child_id,
        declared_by: user.id,
        amount: data.amount,
        currency: data.currency,
        category: data.category,
        description: data.description,
        status: 'pending',
      });

    if (error) {
      throw error;
    }

    await loadExpenses();
    Alert.alert('¡Listo!', 'Gasto creado exitosamente');
  };

  const handleExpensePress = (expense: Expense) => {
    setSelectedExpense(expense);
    setDetalleModalVisible(true);
  };

  const handleApproveExpense = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('expenses')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    await loadExpenses();
  };

  const handleRejectExpense = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('expenses')
      .update({
        status: 'rejected',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    await loadExpenses();
  };

  const totalPending = expenses
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalApproved = expenses
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Mis Gastos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {expenses.length > 0 && (
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pendientes</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalPending)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Aprobados</Text>
            <Text style={[styles.summaryValue, styles.summaryValueApproved]}>
              {formatCurrency(totalApproved)}
            </Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.emptyState}>
          <Text>Cargando...</Text>
        </View>
      ) : expenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color="#B2BEC3" />
          <Text style={styles.emptyStateTitle}>No hay gastos registrados</Text>
          <Text style={styles.emptyStateText}>
            Toca el botón + para agregar tu primer gasto
          </Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GastoCard expense={item} onPress={() => handleExpensePress(item)} />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      <NuevoGastoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateExpense}
        children={children}
      />

      <DetalleGastoModal
        visible={detalleModalVisible}
        onClose={() => {
          setDetalleModalVisible(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        onApprove={handleApproveExpense}
        onReject={handleRejectExpense}
        currentUserId={user?.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summary: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.warning,
  },
  summaryValueApproved: {
    color: colors.success,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xl,
  },
  list: {
    padding: spacing.lg,
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
