import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Expense } from '@/types/app';
import { formatCurrency, formatDate } from '@/lib/utils';

interface DetalleGastoModalProps {
  visible: boolean;
  onClose: () => void;
  expense: Expense | null;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  currentUserId?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  educacion: 'Educación',
  salud: 'Salud',
  ropa: 'Ropa',
  alimentacion: 'Alimentación',
  deporte: 'Deporte/Actividades',
  transporte: 'Transporte',
  otros: 'Otros',
};

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  educacion: 'school',
  salud: 'medical',
  ropa: 'shirt',
  alimentacion: 'restaurant',
  deporte: 'football',
  transporte: 'car',
  otros: 'ellipsis-horizontal',
};

const CATEGORY_COLORS: Record<string, string> = {
  educacion: '#6C63FF',
  salud: '#D63031',
  ropa: '#FF6584',
  alimentacion: '#00B894',
  deporte: '#FF9800',
  transporte: '#0984E3',
  otros: '#636E72',
};

export default function DetalleGastoModal({
  visible,
  onClose,
  expense,
  onApprove,
  onReject,
  currentUserId,
}: DetalleGastoModalProps) {
  const [loading, setLoading] = useState(false);

  if (!expense) return null;

  const canApprove = expense.status === 'pending' && expense.declared_by !== currentUserId;
  const categoryColor = CATEGORY_COLORS[expense.category] || '#636E72';
  const categoryIcon = CATEGORY_ICONS[expense.category] || 'ellipsis-horizontal';
  const categoryLabel = CATEGORY_LABELS[expense.category] || expense.category;

  const handleApprove = async () => {
    if (!onApprove) return;

    Alert.alert(
      'Aprobar gasto',
      `¿Estás seguro de aprobar este gasto de ${formatCurrency(expense.amount, expense.currency)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar',
          style: 'default',
          onPress: async () => {
            setLoading(true);
            try {
              await onApprove(expense.id);
              onClose();
              Alert.alert('¡Listo!', 'Gasto aprobado exitosamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo aprobar el gasto');
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (!onReject) return;

    Alert.alert(
      'Rechazar gasto',
      '¿Estás seguro de rechazar este gasto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await onReject(expense.id);
              onClose();
              Alert.alert('Gasto rechazado', 'El gasto ha sido rechazado');
            } catch (error) {
              Alert.alert('Error', 'No se pudo rechazar el gasto');
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = () => {
    switch (expense.status) {
      case 'approved':
        return '#00B894';
      case 'rejected':
        return '#D63031';
      default:
        return '#FF9800';
    }
  };

  const getStatusLabel = () => {
    switch (expense.status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'Pendiente';
    }
  };

  const getStatusIcon = () => {
    switch (expense.status) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      default:
        return 'time';
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Detalle del Gasto">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
          <Ionicons name={getStatusIcon()} size={20} color={getStatusColor()} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusLabel()}
          </Text>
        </View>

        {/* Monto */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Monto</Text>
          <Text style={styles.amount}>{formatCurrency(expense.amount, expense.currency)}</Text>
        </View>

        {/* Categoría */}
        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <Ionicons name="pricetag" size={20} color="#636E72" />
            <Text style={styles.labelText}>Categoría</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Ionicons name={categoryIcon} size={18} color={categoryColor} />
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {categoryLabel}
            </Text>
          </View>
        </View>

        {/* Fecha */}
        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <Ionicons name="calendar" size={20} color="#636E72" />
            <Text style={styles.labelText}>Fecha</Text>
          </View>
          <Text style={styles.valueText}>{formatDate(expense.created_at)}</Text>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color="#636E72" />
            <Text style={styles.sectionTitle}>Descripción</Text>
          </View>
          <Text style={styles.description}>{expense.description}</Text>
        </View>

        {/* Boleta/Comprobante */}
        {expense.receipt_url && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="receipt" size={20} color="#636E72" />
              <Text style={styles.sectionTitle}>Comprobante</Text>
            </View>
            <Image source={{ uri: expense.receipt_url }} style={styles.receiptImage} />
            <TouchableOpacity style={styles.viewFullButton}>
              <Ionicons name="expand" size={18} color="#6C63FF" />
              <Text style={styles.viewFullText}>Ver en tamaño completo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Datos OCR (si existen) */}
        {expense.ocr_data && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="scan" size={20} color="#636E72" />
              <Text style={styles.sectionTitle}>Datos escaneados</Text>
            </View>
            <View style={styles.ocrData}>
              <Text style={styles.ocrText}>
                Monto detectado: {expense.ocr_data.amount || 'N/A'}
              </Text>
              <Text style={styles.ocrText}>
                Comercio: {expense.ocr_data.merchant || 'N/A'}
              </Text>
              <Text style={styles.ocrText}>Fecha: {expense.ocr_data.date || 'N/A'}</Text>
            </View>
          </View>
        )}

        {/* Botones de acción */}
        {canApprove && (
          <View style={styles.actions}>
            <Button
              title={loading ? 'Procesando...' : 'Aprobar Gasto'}
              onPress={handleApprove}
              loading={loading}
              style={styles.approveButton}
            />
            <Button
              title="Rechazar"
              onPress={handleReject}
              loading={loading}
              style={styles.rejectButton}
              variant="outline"
            />
          </View>
        )}

        {/* Información de aprobación */}
        {expense.status !== 'pending' && expense.approved_at && (
          <View style={styles.approvalInfo}>
            <Ionicons
              name={expense.status === 'approved' ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={expense.status === 'approved' ? '#00B894' : '#D63031'}
            />
            <Text style={styles.approvalText}>
              {expense.status === 'approved' ? 'Aprobado' : 'Rechazado'} el{' '}
              {formatDate(expense.approved_at)}
            </Text>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#DFE6E9',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelText: {
    fontSize: 15,
    color: '#636E72',
  },
  valueText: {
    fontSize: 15,
    color: '#2D3436',
    fontWeight: '500',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
  },
  description: {
    fontSize: 15,
    color: '#2D3436',
    lineHeight: 22,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  viewFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    padding: 8,
  },
  viewFullText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '500',
  },
  ocrData: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  ocrText: {
    fontSize: 14,
    color: '#636E72',
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  approveButton: {
    backgroundColor: '#00B894',
  },
  rejectButton: {
    borderColor: '#D63031',
  },
  approvalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  approvalText: {
    fontSize: 13,
    color: '#636E72',
  },
});
