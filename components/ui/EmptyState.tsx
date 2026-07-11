import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function EmptyState({
  icon = 'information-circle',
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  const { colors } = useAppTheme();

  if (compact) {
    return (
      <View className="rounded-lg p-4 items-center" style={{ backgroundColor: colors.background.tertiary }}>
        <Ionicons name={icon} size={24} color={colors.text.secondary} />
        <Text className="text-sm mt-2 text-center" style={{ color: colors.text.secondary }}>
          {message}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: colors.background.tertiary }}>
        <Ionicons name={icon} size={40} color={colors.text.secondary} />
      </View>

      <Text className="text-xl font-bold mb-2 text-center" style={{ color: colors.text.primary }}>
        {title}
      </Text>
      <Text className="text-base text-center mb-6" style={{ color: colors.text.secondary }}>
        {message}
      </Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="rounded-xl px-6 py-3"
          style={{ backgroundColor: colors.primary.light }}
        >
          <Text className="font-semibold" style={{ color: colors.text.white }}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
