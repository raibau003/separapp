import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '@/types/app';
import { formatCurrency, formatDate } from '@/lib/utils';

interface GastoCardProps {
  expense: Expense;
  onPress: () => void;
}

const categoryIcons: Record<string, string> = {
  educacion: 'school',
  salud: 'medical',
  ropa: 'shirt',
  alimentacion: 'restaurant',
  deporte: 'football',
  transporte: 'car',
  otros: 'ellipsis-horizontal',
};

const categoryLabels: Record<string, string> = {
  educacion: 'Educación',
  salud: 'Salud',
  ropa: 'Ropa',
  alimentacion: 'Alimentación',
  deporte: 'Deporte',
  transporte: 'Transporte',
  otros: 'Otros',
};

const statusColors: Record<string, string> = {
  pending: '#FF9800',
  approved: '#00B894',
  rejected: '#D63031',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

export default function GastoCard({ expense, onPress }: GastoCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <Ionicons
            name={categoryIcons[expense.category] as any}
            size={16}
            color="#6C63FF"
          />
          <Text style={styles.categoryText}>
            {categoryLabels[expense.category]}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[expense.status] },
          ]}
        >
          <Text style={styles.statusText}>{statusLabels[expense.status]}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {expense.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.amount}>
          {formatCurrency(expense.amount, expense.currency)}
        </Text>
        <Text style={styles.date}>{formatDate(expense.created_at)}</Text>
      </View>

      {expense.receipt_url && (
        <View style={styles.receiptIndicator}>
          <Ionicons name="image" size={16} color="#636E72" />
          <Text style={styles.receiptText}>Con boleta</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '600',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#2D3436',
    marginBottom: 12,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  date: {
    fontSize: 12,
    color: '#636E72',
  },
  receiptIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
  },
  receiptText: {
    fontSize: 12,
    color: '#636E72',
    marginLeft: 4,
  },
});
