import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import Modal from './Modal';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export default function Select({ label, value, options, onChange, placeholder, error }: SelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.select, error && styles.selectError]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectText, !selectedOption && styles.placeholder]}>
          {selectedOption ? selectedOption.label : placeholder || 'Seleccionar'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#636E72" />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={label || 'Seleccionar'}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              option.value === value && styles.optionSelected,
            ]}
            onPress={() => {
              onChange(option.value);
              setModalVisible(false);
            }}
          >
            <Text
              style={[
                styles.optionText,
                option.value === value && styles.optionTextSelected,
              ]}
            >
              {option.label}
            </Text>
            {option.value === value && (
              <Ionicons name="checkmark" size={20} color="#6C63FF" />
            )}
          </TouchableOpacity>
        ))}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  select: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE6E9',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectError: {
    borderColor: '#D63031',
  },
  selectText: {
    fontSize: 16,
    color: '#2D3436',
  },
  placeholder: {
    color: '#B2BEC3',
  },
  errorText: {
    fontSize: 12,
    color: '#D63031',
    marginTop: 4,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  optionSelected: {
    backgroundColor: '#F0EFFF',
  },
  optionText: {
    fontSize: 16,
    color: '#2D3436',
  },
  optionTextSelected: {
    color: '#6C63FF',
    fontWeight: '600',
  },
});
