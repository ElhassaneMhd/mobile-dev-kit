import React from 'react';
import { View, Text } from 'react-native';
import type { JustificationStatus } from '@/services';
import type { GradeStatus } from '@/types/grade';

type AllowedStatus = JustificationStatus | GradeStatus;

interface StatusBadgeProps {
  status: AllowedStatus;
  size?: 'small' | 'medium' | 'large';
}

const STATUS_CONFIG: Record<AllowedStatus, { label: string; bgColor: string; textColor: string }> = {
  // Justification statuses
  PENDING: {
    label: 'En attente',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
  APPROVED: {
    label: 'Approuvée',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  REJECTED: {
    label: 'Refusée',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
  // Grade statuses
  PUBLISHED: {
    label: 'Publiée',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  VALIDATED: {
    label: 'Validée',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  DRAFT: {
    label: 'Brouillon',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  },
};

const SIZE_CLASSES = {
  small: 'px-2 py-0.5',
  medium: 'px-3 py-1',
  large: 'px-4 py-1.5',
};

const TEXT_SIZE_CLASSES = {
  small: 'text-xs',
  medium: 'text-sm',
  large: 'text-base',
};

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View className={`rounded-full ${config.bgColor} ${SIZE_CLASSES[size]}`}>
      <Text className={`${config.textColor} ${TEXT_SIZE_CLASSES[size]} font-semibold`}>
        {config.label}
      </Text>
    </View>
  );
}
