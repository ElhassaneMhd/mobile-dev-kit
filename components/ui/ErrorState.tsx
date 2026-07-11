import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ErrorType, parseError } from '@/utils/errorUtils';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/contexts/AppStateContext';

interface ErrorStateProps {
  error: any;
  onRetry?: () => void;
  compact?: boolean;
  title?: string;
}

export function ErrorState({ error, onRetry, compact = false, title }: ErrorStateProps) {
  const appError = parseError(error);
  const { colors } = useAppTheme();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/sign-in');
  };

  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (appError.type) {
      case ErrorType.NETWORK:
        return 'cloud-offline';
      case ErrorType.AUTHENTICATION:
        return 'lock-closed';
      case ErrorType.AUTHORIZATION:
        return 'shield-checkmark';
      case ErrorType.NOT_FOUND:
        return 'search';
      case ErrorType.SERVER:
        return 'server';
      default:
        return 'alert-circle';
    }
  };

  const getColor = (): string => {
    switch (appError.type) {
      case ErrorType.NETWORK:
        return colors.warning.light;
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return colors.error.light;
      case ErrorType.NOT_FOUND:
        return colors.text.tertiary;
      case ErrorType.SERVER:
        return colors.error.dark;
      default:
        return colors.warning.light;
    }
  };

  if (compact) {
    return (
      <View
        className="rounded-lg p-3 flex-row items-center"
        style={{ backgroundColor: colors.error.light + '15', borderWidth: 1, borderColor: colors.error.light + '30' }}
      >
        <Ionicons name={getIcon()} size={20} color={getColor()} />
        <Text className="text-sm ml-2 flex-1" style={{ color: colors.error.dark }}>
          {appError.userMessage}
        </Text>
        {appError.canRetry && onRetry && (
          <TouchableOpacity onPress={onRetry} className="ml-2">
            <Ionicons name="refresh" size={20} color={getColor()} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-6">
      <View
        className="items-center justify-center w-20 h-20 rounded-full mb-4"
        style={{ backgroundColor: `${getColor()}15` }}
      >
        <Ionicons name={getIcon()} size={40} color={getColor()} />
      </View>

      {title && (
        <Text className="text-xl font-bold mb-2 text-center" style={{ color: colors.text.primary }}>
          {title}
        </Text>
      )}

      <Text className="text-base text-center mb-6" style={{ color: colors.text.secondary }}>
        {appError.userMessage}
      </Text>

      {appError.canRetry && onRetry && (
      <TouchableOpacity 
          className="mt-4 rounded-xl px-6 py-3 flex-row items-center"
          style={{ backgroundColor: colors.error.light }}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.text.white} />
          <Text className="font-semibold ml-2" style={{ color: colors.text.white }}>
            Se deconnecter
          </Text>
        </TouchableOpacity>

      )}

      {(appError.type === ErrorType.AUTHENTICATION || appError.type === ErrorType.AUTHORIZATION) && (
        <TouchableOpacity 
          className="mt-4 rounded-xl px-6 py-3 flex-row items-center"
          style={{ backgroundColor: colors.error.light }}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.text.white} />
          <Text className="font-semibold ml-2" style={{ color: colors.text.white }}>
            Se deconnecter
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
