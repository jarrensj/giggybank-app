import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function PriceInput({
  label,
  value,
  onChangeText,
  placeholder = '0.00',
  error,
  style,
}) {
  const handleChange = (text) => {
    // Remove non-numeric characters except decimal
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    // Limit decimal places to 2
    if (parts[1]?.length > 2) {
      return;
    }
    onChangeText(cleaned);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <Text style={styles.prefix}>$</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  prefix: {
    fontSize: 18,
    color: '#6B7280',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});
