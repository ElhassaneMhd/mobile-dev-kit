// Grade Summary Card - Reusable card for displaying grade summaries
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/useAppTheme';

interface GradeSummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: string;
  icon?: string;
  onPress?: () => void;
  delay?: number;
  compact?: boolean;
}

export function GradeSummaryCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  color,
  icon,
  onPress,
  delay = 0,
  compact = false,
}: GradeSummaryCardProps) {
  const { colors } = useAppTheme();
  const Container = onPress ? TouchableOpacity : View;
  const cardColor = color || colors.primary.light;

  const getTrendColor = (trendType: 'up' | 'down' | 'stable'): string => {
    switch (trendType) {
      case 'up': return colors.success.light;
      case 'down': return colors.error.light;
      case 'stable': return colors.text.secondary;
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay)}>
      <Container
        style={[
          compact ? styles.cardCompact : styles.card,
          {
            backgroundColor: colors.surface.primary,
            borderColor: onPress ? colors.border.secondary : colors.border.primary
          }
        ]}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={compact ? styles.headerCompact : styles.header}>
          {icon && (
            <View style={[compact ? styles.iconContainerCompact : styles.iconContainer, { backgroundColor: cardColor + '20' }]}>
              <Ionicons name={icon as any} size={compact ? 20 : 24} color={cardColor} />
            </View>
          )}
          <Text
            style={[compact ? styles.titleCompact : styles.title, { color: colors.text.secondary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </View>

        <Text style={[compact ? styles.valueCompact : styles.value, { color: cardColor }]}>{value}</Text>

        {(subtitle || trend) && (
          <View style={styles.footer}>
            {subtitle && <Text style={[compact ? styles.subtitleCompact : styles.subtitle, { color: colors.text.tertiary }]}>{subtitle}</Text>}
            {trend && trendValue && (
              <View style={[styles.trendContainer, { backgroundColor: getTrendColor(trend) + '20' }]}>
                <Ionicons
                  name={getTrendIcon(trend)}
                  size={compact ? 12 : 14}
                  color={getTrendColor(trend)}
                />
                <Text style={[styles.trendValue, { color: getTrendColor(trend) }]}>
                  {trendValue}
                </Text>
              </View>
            )}
          </View>
        )}
      </Container>
    </Animated.View>
  );
}

function getTrendIcon(trend: 'up' | 'down' | 'stable'): any {
  switch (trend) {
    case 'up': return 'trending-up';
    case 'down': return 'trending-down';
    case 'stable': return 'remove';
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardCompact: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  headerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerCompact: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  titleCompact: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  valueCompact: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: {
    fontSize: 13,
  },
  subtitleCompact: {
    fontSize: 11,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
  },
});
