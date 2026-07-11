import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useAppTheme } from "@/hooks/useAppTheme";

type StickyHeaderProps = {
  title: string;
  subtitle?: string;
  showBackIcon?: boolean;
  onBackPress?: () => void;
  backIconName?: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
  style?: any;
  titleStyle?: any;
};

/**
 * StickyHeader - Clean header with back navigation and optional right element
 */
export default function StickyHeader({
  title,
  subtitle,
  showBackIcon = true,
  onBackPress,
  backIconName = "arrow-back",
  rightElement,
  style,
  titleStyle
}: StickyHeaderProps) {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <View style={[
      styles.header,
      {
        backgroundColor: colors.surface.primary,
        borderBottomColor: colors.border.primary
      },
      style
    ]}>
      <View style={styles.content}>
        {showBackIcon && (
          <TouchableOpacity
            onPress={onBackPress || (() => router.back())}
            style={styles.backButton}
          >
            <Ionicons name={backIconName} size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, { color: colors.text.primary }, titleStyle]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.subtitle, { color: colors.text.secondary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          )}
        </View>

        {rightElement && (
          <View style={styles.rightElement}>
            {rightElement}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingTop: hp(6),
    paddingBottom: hp(2),
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  rightElement: {
    marginLeft: 12,
  },
});