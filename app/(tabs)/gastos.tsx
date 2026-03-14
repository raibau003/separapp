import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import GastoCard from '@/components/gastos/GastoCard';
import NuevoGastoModal from '@/components/gastos/NuevoGastoModal';
import { Expense } from '@/types/app';
import { formatCurrency } from '@/lib/utils';

export default function GastosScreen() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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
    // TODO: Navegar a detalle del gasto
    Alert.alert('Detalle del gasto', `Monto: ${formatCurrency(expense.amount, expense.currency)}`);
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
  },
  summaryLabel: {
    fontSize: 12,
    color: '#636E72',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  summaryValueApproved: {
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
