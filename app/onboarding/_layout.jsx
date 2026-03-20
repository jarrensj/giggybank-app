import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useSettingsStore } from '../../src/stores/settingsStore';

// Import slides
import WelcomeSlide from './slides/welcome';
import ProblemSlide from './slides/problem';
import TrackTripsSlide from './slides/track-trips';
import RealEarningsSlide from './slides/real-earnings';
import TaxSetupSlide from './slides/tax-setup';
import PrivacySlide from './slides/privacy';
import GetStartedSlide from './slides/get-started';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_SLIDES = 7;

export default function OnboardingLayout() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const updateSetting = useSettingsStore((state) => state.updateSetting);

  const [currentSlide, setCurrentSlide] = useState(0);

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentSlide(slideIndex);
  };

  const goToSlide = (index) => {
    scrollRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  const handleNext = () => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      goToSlide(currentSlide + 1);
    }
  };

  const handleSkip = () => {
    goToSlide(TOTAL_SLIDES - 1);
  };

  const handleComplete = () => {
    updateSetting('onboardingComplete', true);
    router.replace('/(tabs)/today');
  };

  const isLastSlide = currentSlide === TOTAL_SLIDES - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      {!isLastSlide && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        <View style={styles.slide}>
          <WelcomeSlide />
        </View>
        <View style={styles.slide}>
          <ProblemSlide />
        </View>
        <View style={styles.slide}>
          <TrackTripsSlide />
        </View>
        <View style={styles.slide}>
          <RealEarningsSlide />
        </View>
        <View style={styles.slide}>
          <TaxSetupSlide />
        </View>
        <View style={styles.slide}>
          <PrivacySlide />
        </View>
        <View style={styles.slide}>
          <GetStartedSlide onComplete={handleComplete} />
        </View>
      </ScrollView>

      {/* Progress Dots */}
      <View style={styles.progressContainer}>
        <View style={styles.dotsContainer}>
          {Array.from({ length: TOTAL_SLIDES }).map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToSlide(index)}
              style={[
                styles.dot,
                index === currentSlide && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        {!isLastSlide && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  dotActive: {
    backgroundColor: '#3B82F6',
    width: 24,
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
