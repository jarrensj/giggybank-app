import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function NumberInput({
  label,
  value,
  onChangeText,
  placeholder = '0',
  suffix,
  error,
  allowDecimal = true,
  style,
}) {
  const handleChange = (text) => {
    if (allowDecimal) {
      // Allow decimal numbers
      const cleaned = text.replace(/[^0-9.]/g, '');
      const parts = cleaned.split('.');
      if (parts.length > 2) return;
      if (parts[1]?.length > 2) return;
      onChangeText(cleaned);
    } else {
      // Only integers
      const cleaned = text.replace(/[^0-9]/g, '');
      onChangeText(cleaned);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
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
  input: {
    flex: 1,
    fontSize: 18,
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  suffix: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});
