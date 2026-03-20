import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function DatePickerField({
  label,
  value, // YYYY-MM-DD string
  onChange,
  style,
}) {
  const [showPicker, setShowPicker] = useState(false);

  const selectedDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Select date';
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDayPress = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
    setShowPicker(false);
  };

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const days = [];

    // Empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Day cells
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = dateStr === value;
      const cellDate = new Date(viewYear, viewMonth, day);
      const isToday = cellDate.toDateString() === today.toDateString();
      const isFuture = cellDate > today;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isSelected && styles.dayCellSelected,
            isToday && !isSelected && styles.dayCellToday,
          ]}
          onPress={() => !isFuture && handleDayPress(day)}
          disabled={isFuture}
        >
          <Text
            style={[
              styles.dayText,
              isSelected && styles.dayTextSelected,
              isFuture && styles.dayTextDisabled,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.inputWrapper}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.dateText}>{formatDisplayDate(value)}</Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
                <Text style={styles.navButtonText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthYearText}>
                {MONTHS[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                <Text style={styles.navButtonText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Day labels */}
            <View style={styles.weekRow}>
              {DAYS.map((day) => (
                <View key={day} style={styles.dayCell}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.daysGrid}>{renderCalendar()}</View>

            {/* Today button */}
            <TouchableOpacity
              style={styles.todayButton}
              onPress={() => {
                const today = new Date();
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth());
                handleDayPress(today.getDate());
              }}
            >
              <Text style={styles.todayButtonText}>Today</Text>
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
  dateText: {
    fontSize: 16,
    color: '#111827',
  },
  icon: {
    fontSize: 20,
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
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 28,
    color: '#3B82F6',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellSelected: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    color: '#111827',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dayTextDisabled: {
    color: '#D1D5DB',
  },
  todayButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  todayButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
