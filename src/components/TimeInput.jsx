import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function TimeInput({
  label,
  hours,
  minutes,
  onChangeHours,
  onChangeMinutes,
  error,
  style,
}) {
  const handleHoursChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const num = parseInt(cleaned, 10);
    if (cleaned === '' || (num >= 0 && num <= 24)) {
      onChangeHours(cleaned);
    }
  };

  const handleMinutesChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const num = parseInt(cleaned, 10);
    if (cleaned === '' || (num >= 0 && num <= 59)) {
      onChangeMinutes(cleaned);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <View style={[styles.inputWrapper, error && styles.inputError]}>
          <TextInput
            style={styles.input}
            value={hours}
            onChangeText={handleHoursChange}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            returnKeyType="done"
            maxLength={2}
          />
          <Text style={styles.suffix}>hr</Text>
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={[styles.inputWrapper, error && styles.inputError]}>
          <TextInput
            style={styles.input}
            value={minutes}
            onChangeText={handleMinutesChange}
            placeholder="00"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            returnKeyType="done"
            maxLength={2}
          />
          <Text style={styles.suffix}>min</Text>
        </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
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
    textAlign: 'center',
  },
  suffix: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  separator: {
    fontSize: 24,
    color: '#9CA3AF',
    marginHorizontal: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});
