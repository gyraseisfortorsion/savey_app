import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export function TypingIndicator() {
  const { colors } = useAppTheme();
  const anims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(anim, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={[styles.bubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.dots}>
        {anims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { backgroundColor: colors.textSecondary, transform: [{ translateY: anim }] }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    padding: 12,
    marginBottom: 4,
  },
  dots: { flexDirection: 'row', gap: 5, alignItems: 'center', height: 16 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
