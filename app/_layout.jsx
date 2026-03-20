import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useEntriesStore } from '../src/stores/entriesStore';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  const onboardingComplete = useSettingsStore((state) => state.onboardingComplete);
  const settingsHydrated = useSettingsStore((state) => state._hasHydrated);
  const entriesHydrated = useEntriesStore((state) => state._hasHydrated);

  // Hydrate stores on app start
  useEffect(() => {
    const hydrate = async () => {
      await Promise.all([
        useSettingsStore.getState().hydrate(),
        useEntriesStore.getState().hydrate(),
      ]);
      setIsReady(true);
    };
    hydrate();
  }, []);

  // Handle navigation based on onboarding state
  useEffect(() => {
    if (!isReady) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!onboardingComplete && !inOnboarding) {
      // Not onboarded yet, redirect to onboarding
      router.replace('/onboarding');
    } else if (onboardingComplete && inOnboarding) {
      // Already onboarded but on onboarding screen, go to main app
      router.replace('/(tabs)/today');
    }
  }, [isReady, onboardingComplete, segments]);

  // Show loading while hydrating
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F9FAFB' },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="onboarding"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="add-trip"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="add-day-total"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="edit-entry"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootLayoutNav />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});
