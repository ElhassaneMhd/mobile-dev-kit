// Grade Progress Bar - Visual representation of grades
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { getGradeColor } from '@/utils/gradeUtils';

interface GradeProgressBarProps {
  label: string;
  grade?: number;
  maxGrade?: number;
  weight?: number;
  showPercentage?: boolean;
}

export function GradeProgressBar({
  label,
  grade,
  maxGrade = 20,
  weight,
  showPercentage = false,
}: GradeProgressBarProps) {
  const percentage = grade !== undefined ? (grade / maxGrade) * 100 : 0;
  const color = getGradeColor(grade);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${percentage}%`, {
        damping: 15,
        stiffness: 100,
      }),
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>
          {label}
          {weight && <Text style={styles.weight}> ({weight}%)</Text>}
        </Text>
        <Text style={[styles.grade, { color }]}>
          {grade !== undefined ? `${grade.toFixed(1)}/${maxGrade}` : '-'}
        </Text>
      </View>

      <View style={styles.barContainer}>
        <Animated.View style={[styles.bar, { backgroundColor: color }, animatedStyle]} />
      </View>

      {showPercentage && grade !== undefined && (
        <Text style={styles.percentage}>{percentage.toFixed(0)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  weight: {
    fontSize: 12,
    color: '#6B7280',
  },
  grade: {
    fontSize: 15,
    fontWeight: '700',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'right',
  },
});
