import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import Card from '@/components/ui/Card';
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/styles';

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
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  logoutIcon: {
    padding: spacing.sm,
  },
  quickStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  actionCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionCardTitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  actionCardAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  actionCardText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionButton: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  actionButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionButtonText: {
    ...typography.smallBold,
    color: colors.text,
    textAlign: 'center',
  },
});
