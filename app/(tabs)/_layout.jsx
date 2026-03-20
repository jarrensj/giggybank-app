import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Home, Calendar, Clock, Settings, Plus } from 'lucide-react-native';

function TabBarIcon({ icon: Icon, color, size = 24 }) {
  return <Icon color={color} size={size} strokeWidth={2} />;
}

function FloatingAddButton() {
  const router = useRouter();

  return (
    <View style={styles.floatingButtonContainer}>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push('/add-trip')}
        activeOpacity={0.8}
      >
        <Plus color="#FFFFFF" size={28} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            height: 80,
            paddingTop: 8,
            paddingBottom: 24,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="today"
          options={{
            title: 'Today',
            tabBarIcon: ({ color }) => <TabBarIcon icon={Home} color={color} />,
          }}
        />
        <Tabs.Screen
          name="week"
          options={{
            title: 'Week',
            tabBarIcon: ({ color }) => <TabBarIcon icon={Calendar} color={color} />,
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarIcon: () => null,
            tabBarButton: () => <FloatingAddButton />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color }) => <TabBarIcon icon={Clock} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <TabBarIcon icon={Settings} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
