// Mention Badge Component - Displays academic mention (Très Bien, Bien, etc.)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Mention } from '@/types/grade';
import { useAppTheme } from '@/hooks/useAppTheme';

interface MentionBadgeProps {
  mention?: Mention;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export function MentionBadge({ mention, size = 'medium', showIcon = true }: MentionBadgeProps) {
  const { colors } = useAppTheme();

  const MENTION_CONFIG: Record<Mention, { label: string; color: string; icon: string }> = {
    EXCELLENT: { label: 'Excellent', color: colors.primary.dark, icon: 'star' },
    TRES_BIEN: { label: 'Très Bien', color: colors.success.light, icon: 'trophy' },
    BIEN: { label: 'Bien', color: colors.primary.light, icon: 'ribbon' },
    ASSEZ_BIEN: { label: 'Assez Bien', color: colors.warning.light, icon: 'thumbs-up' },
    PASSABLE: { label: 'Passable', color: colors.text.secondary, icon: 'checkmark-circle' },
  };

  if (!mention) {
    return (
      <View style={[styles.badge, styles[size], { backgroundColor: colors.error.light, borderColor: colors.error.light }]}>
        {showIcon && <Ionicons name="close-circle" size={getSizeValue(size, 14, 16, 20)} color={colors.text.white} />}
        <Text style={[styles.label, styles[`${size}Text`], { color: colors.text.white }]}>
          Non admis
        </Text>
      </View>
    );
  }

  const config = MENTION_CONFIG[mention];

  return (
    <View style={[styles.badge, styles[size], { backgroundColor: config.color + '20', borderColor: config.color }]}>
      {showIcon && (
        <Ionicons name={config.icon as any} size={getSizeValue(size, 14, 16, 20)} color={config.color} />
      )}
      <Text style={[styles.label, styles[`${size}Text`], { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

function getSizeValue(size: string, small: number, medium: number, large: number): number {
  switch (size) {
    case 'small': return small;
    case 'large': return large;
    default: return medium;
  }
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  large: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  label: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 11,
  },
  mediumText: {
    fontSize: 13,
  },
  largeText: {
    fontSize: 15,
  },
});
