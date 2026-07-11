// PerformanceCard - Reusable gradient card for displaying performance metrics
import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/useAppTheme';

interface PerformanceCardProps {
  title: string;
  mainValue: string;
  subtitle: string;
  stats: {
    label: string;
    value: string;
  }[];
  delay?: number;
  compact?: boolean;
}

export function PerformanceCard({
  title,
  mainValue,
  subtitle,
  stats,
  delay = 0,
  compact = false,
}: PerformanceCardProps) {
  const { colors } = useAppTheme();

  return (
    <Animated.View entering={FadeInDown.delay(delay)} className="rounded-2xl overflow-hidden mb-4">
      <LinearGradient
        colors={colors.primary.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: compact ? 20 : 32 }}
      >
        <Text
          className={compact ? "text-base font-bold mb-3 text-center" : "text-lg font-bold mb-6 text-center"}
          style={{ color: colors.text.white }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>

        <View className={compact ? "items-center mb-3" : "items-center mb-6"}>
          <Text className={compact ? "text-4xl font-bold" : "text-5xl font-bold"} style={{ color: colors.text.white }}>
            {mainValue}
          </Text>
          <Text
            className={compact ? "text-sm mt-1 font-semibold" : "text-base mt-2 font-semibold"}
            style={{ color: colors.text.white, opacity: 0.9 }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        </View>

        <View className={compact ? "rounded-xl p-3 flex-row items-center justify-between" : "rounded-xl p-4 flex-row items-center justify-between"} style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
          {stats.map((stat, index) => (
            <View key={stat.label} className="flex-row items-center flex-1">
              {index > 0 && <View className={compact ? "w-px h-8 mr-2" : "w-px h-12 mr-2"} style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />}
              <View className="flex-1 items-center">
                <Text className="text-xs font-semibold mb-1.5" style={{ color: colors.text.white, opacity: 0.8 }}>{stat.label}</Text>
                <Text className={compact ? "text-base font-bold" : "text-xl font-bold"} style={{ color: colors.text.white }}>
                  {stat.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
