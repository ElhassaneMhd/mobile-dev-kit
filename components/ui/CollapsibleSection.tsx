import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useAppTheme } from '@/hooks/useAppTheme';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  itemCount: number;
  initialShowCount?: number;
  viewAllRoute?: string;
  onViewAll?: () => void;
}

export function CollapsibleSection({
  title,
  children,
  itemCount,
  initialShowCount = 3,
  viewAllRoute,
  onViewAll,
}: CollapsibleSectionProps) {
  const { colors } = useAppTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldShowToggle = itemCount > initialShowCount;
  const displayedItems = isExpanded ? itemCount : Math.min(itemCount, initialShowCount);

  return (
    <View>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
        {viewAllRoute && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={{ color: colors.primary.dark, fontSize: wp(3.5) }}>Voir tout</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Children (limited by displayedItems) */}
      {React.Children.toArray(children).slice(0, displayedItems)}

      {/* Show More/Less Toggle */}
      {shouldShowToggle && (
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: colors.surface.secondary }]}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, { color: colors.primary.fadedBlue }]}>
            {isExpanded ? 'Afficher moins' : `Afficher ${itemCount - initialShowCount} de plus`}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.primary.fadedBlue}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  toggleText: {
    fontSize: wp(3.5),
    fontWeight: '600',
    marginRight: 8,
  },
});
