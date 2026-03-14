import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaintenancePayment } from '@/types/app';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PagoCardProps {
  payment: MaintenancePayment;
  onPress: () => void;
}

const statusColors: Record<string, string> = {
  pending: '#FF9800',
  paid: '#00B894',
  late: '#D63031',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  late: 'Atrasado',
};

const statusIcons: Record<string, any> = {
  pending: 'time-outline',
  paid: 'checkmark-circle',
  late: 'alert-circle',
};

export default function PagoCard({ payment, onPress }: PagoCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[payment.status] },
          ]}
        >
          <Ionicons
            name={statusIcons[payment.status]}
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.statusText}>{statusLabels[payment.status]}</Text>
        </View>
        <Text style={styles.frequency}>
          {payment.frequency === 'mensual' ? 'Mensual' : 'Quincenal'}
        </Text>
      </View>

      <Text style={styles.amount}>
        {formatCurrency(payment.amount, payment.currency)}
      </Text>

      <View style={styles.dates}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Vence:</Text>
          <Text style={styles.dateValue}>{formatDate(payment.due_date)}</Text>
        </View>
        {payment.paid_date && (
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Pagado:</Text>
            <Text style={[styles.dateValue, styles.datePaid]}>
              {formatDate(payment.paid_date)}
            </Text>
          </View>
        )}
      </View>

      {payment.receipt_url && (
        <View style={styles.receiptIndicator}>
          <Ionicons name="document-attach" size={16} color="#00B894" />
          <Text style={styles.receiptText}>Con comprobante</Text>
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  frequency: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '600',
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 12,
  },
  dates: {
    flexDirection: 'row',
    gap: 16,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: '#636E72',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 13,
    color: '#2D3436',
    fontWeight: '500',
  },
  datePaid: {
    color: '#00B894',
  },
  receiptIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
  },
  receiptText: {
    fontSize: 12,
    color: '#00B894',
    marginLeft: 4,
    fontWeight: '500',
  },
});
