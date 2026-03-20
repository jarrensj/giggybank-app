import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useEntriesStore } from '../stores/entriesStore';

// Platform colors for visual distinction
const PLATFORM_COLORS = {
  uber: '#000000',
  lyft: '#FF00BF',
  doordash: '#FF3008',
  instacart: '#43B02A',
  grubhub: '#F63440',
  postmates: '#000000',
  amazon_flex: '#FF9900',
};

export default function PlatformDropdown({
  label,
  value, // platformId
  onChange,
  style,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const platforms = useEntriesStore((state) => state.platforms);

  const selectedPlatform = platforms.find((p) => p.id === value);

  const handleSelect = (platformId) => {
    onChange(platformId);
    setShowPicker(false);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.inputWrapper}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        {selectedPlatform ? (
          <View style={styles.selectedRow}>
            <View
              style={[
                styles.platformDot,
                { backgroundColor: PLATFORM_COLORS[selectedPlatform.id] || '#6B7280' },
              ]}
            />
            <Text style={styles.selectedText}>{selectedPlatform.name}</Text>
          </View>
        ) : (
          <Text style={styles.placeholderText}>Select platform</Text>
        )}
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Select Platform</Text>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {platforms.map((platform) => {
                const isSelected = platform.id === value;
                return (
                  <TouchableOpacity
                    key={platform.id}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() => handleSelect(platform.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.platformDot,
                        { backgroundColor: PLATFORM_COLORS[platform.id] || '#6B7280' },
                      ]}
                    />
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {platform.name}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
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
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  selectedText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  chevron: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  optionRowSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#3B82F6',
  },
  checkmark: {
    fontSize: 18,
    color: '#3B82F6',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
