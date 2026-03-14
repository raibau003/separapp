import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import Card from '@/components/ui/Card';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pendingExpenses: 0,
    pendingExpensesCount: 0,
    pendingPayments: 0,
    childrenCount: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
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

    const familyId = familyMember.family_id;

    // Cargar gastos pendientes
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount')
      .eq('family_id', familyId)
      .eq('status', 'pending');

    // Cargar pagos pendientes
    const { data: payments } = await supabase
      .from('maintenance_payments')
      .select('amount')
      .eq('family_id', familyId)
      .in('status', ['pending', 'late']);

    // Cargar hijos
    const { data: children } = await supabase
      .from('children')
      .select('id')
      .eq('family_id', familyId);

    setStats({
      pendingExpenses: expenses?.reduce((sum, e) => sum + e.amount, 0) || 0,
      pendingExpensesCount: expenses?.length || 0,
      pendingPayments: payments?.reduce((sum, p) => sum + p.amount, 0) || 0,
      childrenCount: children?.length || 0,
    });

    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Hola 👋</Text>
          <Text style={styles.subtitle}>{user?.email?.split('@')[0]}</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutIcon}>
          <Ionicons name="log-out-outline" size={24} color="#D63031" />
        </TouchableOpacity>
      </View>

      {/* Resumen Rápido */}
      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="receipt" size={24} color="#FF9800" />
          </View>
          <Text style={styles.statValue}>{stats.pendingExpensesCount}</Text>
          <Text style={styles.statLabel}>Gastos pendientes</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#F0EFFF' }]}>
            <Ionicons name="people" size={24} color="#6C63FF" />
          </View>
          <Text style={styles.statValue}>{stats.childrenCount}</Text>
          <Text style={styles.statLabel}>Hijos</Text>
        </View>
      </View>

      {/* Gastos Pendientes */}
      {stats.pendingExpensesCount > 0 && (
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/gastos')}
          style={styles.actionCard}
        >
          <View style={styles.actionCardContent}>
            <View>
              <Text style={styles.actionCardTitle}>Gastos por revisar</Text>
              <Text style={styles.actionCardAmount}>
                {formatCurrency(stats.pendingExpenses)}
              </Text>
              <Text style={styles.actionCardText}>
                {stats.pendingExpensesCount} {stats.pendingExpensesCount === 1 ? 'gasto' : 'gastos'} pendiente
                {stats.pendingExpensesCount === 1 ? '' : 's'} de aprobación
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#6C63FF" />
          </View>
        </TouchableOpacity>
      )}

      {/* Manutención Pendiente */}
      {stats.pendingPayments > 0 && (
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/manutencion')}
          style={styles.actionCard}
        >
          <View style={styles.actionCardContent}>
            <View>
              <Text style={styles.actionCardTitle}>Manutención pendiente</Text>
              <Text style={styles.actionCardAmount}>
                {formatCurrency(stats.pendingPayments)}
              </Text>
              <Text style={styles.actionCardText}>
                Tienes pagos de manutención pendientes
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#FF9800" />
          </View>
        </TouchableOpacity>
      )}

      {/* Acciones Rápidas */}
      <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/gastos')}
        >
          <View style={[styles.actionButtonIcon, { backgroundColor: '#F0EFFF' }]}>
            <Ionicons name="add" size={28} color="#6C63FF" />
          </View>
          <Text style={styles.actionButtonText}>Nuevo Gasto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/manutencion')}
        >
          <View style={[styles.actionButtonIcon, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="wallet" size={28} color="#00B894" />
          </View>
          <Text style={styles.actionButtonText}>Ver Pagos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/calendario')}
        >
          <View style={[styles.actionButtonIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="calendar" size={28} color="#FF9800" />
          </View>
          <Text style={styles.actionButtonText}>Calendario</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/mensajes')}
        >
          <View style={[styles.actionButtonIcon, { backgroundColor: '#FCE4EC' }]}>
            <Ionicons name="chatbubbles" size={28} color="#FF6584" />
          </View>
          <Text style={styles.actionButtonText}>Mensajes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  subtitle: {
    fontSize: 16,
    color: '#636E72',
    marginTop: 4,
  },
  logoutIcon: {
    padding: 8,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#636E72',
    textAlign: 'center',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionCardTitle: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 4,
  },
  actionCardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },
  actionCardText: {
    fontSize: 13,
    color: '#636E72',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginTop: 16,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    textAlign: 'center',
  },
});
