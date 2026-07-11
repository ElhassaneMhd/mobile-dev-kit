import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useAppTheme } from '@/hooks/useAppTheme';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  };
  onPress: () => void;
}

export function StatCard({
  icon,
  iconColor,
  iconBgColor,
  label,
  value,
  subtitle,
  trend,
  onPress,
}: StatCardProps) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: colors.surface.primary }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Level 1: Icon */}
      <View style={{ alignItems: 'center', marginBottom: wp(2) }}>
        <View style={[styles.statIconContainer, { backgroundColor: iconBgColor }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>

        {/* Level 2: Label */}
        <Text
          style={[styles.statLabel, { color: colors.text.secondary, marginTop: wp(1), textAlign: 'center' }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
      </View>

      {/* Level 3: Value + Subtitle */}
      <View style={{ alignItems: 'center' }}>
        {trend ? (
          <View style={styles.statValueRow}>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {value}
            </Text>
            <Ionicons name={trend.icon} size={16} color={trend.color} />
          </View>
        ) : (
          <Text style={[styles.statValue, { color: colors.text.primary }]}>
            {value}
          </Text>
        )}
        <Text style={[styles.statSubtext, { color: colors.text.secondary }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 16,
    padding: wp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: wp(2.8),
    textAlign: 'center',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: wp(5),
    fontWeight: 'bold',
  },
  statSubtext: {
    fontSize: wp(2.8),
    marginTop: 4,
  },
});
