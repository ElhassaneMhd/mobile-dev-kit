/**
 * Grade Utilities - Unified grade color and mention system
 *
 * This module provides consistent grade coloring across the mobile app
 * based on the Moroccan university grading system (0-20 scale)
 */

export type GradeRange = 'EXCELLENT' | 'TRES_BIEN' | 'BIEN' | 'ASSEZ_BIEN' | 'PASSABLE' | 'FAILED' | 'UNDEFINED';

export interface GradeColor {
  primary: string;
  background: string;
  border: string;
}

/**
 * Grade color palette based on Moroccan university mentions
 *
 * Grading scale:
 * - 18-20: Excellent (Purple)
 * - 16-18: Tres Bien (Green)
 * - 14-16: Bien (Blue)
 * - 12-14: Assez Bien (Cyan)
 * - 10-12: Passable (Amber)
 * - <10: Failed (Red)
 */
const GRADE_COLORS: Record<GradeRange, GradeColor> = {
  EXCELLENT: {
    primary: '#8B5CF6',      // Violet-500 - Purple for top grades
    background: '#EDE9FE',   // Violet-100
    border: '#C4B5FD',       // Violet-300
  },
  TRES_BIEN: {
    primary: '#10B981',      // Emerald-500 - Green for very good
    background: '#D1FAE5',   // Emerald-100
    border: '#6EE7B7',       // Emerald-300
  },
  BIEN: {
    primary: '#3B82F6',      // Blue-500 - Blue for good
    background: '#DBEAFE',   // Blue-100
    border: '#93C5FD',       // Blue-300
  },
  ASSEZ_BIEN: {
    primary: '#06B6D4',      // Cyan-500 - Cyan for fairly good
    background: '#CFFAFE',   // Cyan-100
    border: '#67E8F9',       // Cyan-300
  },
  PASSABLE: {
    primary: '#F59E0B',      // Amber-500 - Amber for passing
    background: '#FEF3C7',   // Amber-100
    border: '#FCD34D',       // Amber-300
  },
  FAILED: {
    primary: '#EF4444',      // Red-500 - Red for failing
    background: '#FEE2E2',   // Red-100
    border: '#FCA5A5',       // Red-300
  },
  UNDEFINED: {
    primary: '#9CA3AF',      // Gray-400 - Gray for not graded
    background: '#F3F4F6',   // Gray-100
    border: '#D1D5DB',       // Gray-300
  },
};

/**
 * Get grade range based on score
 * @param grade - Grade value (0-20 scale)
 * @returns Grade range category
 */
export function getGradeRange(grade?: number | null): GradeRange {
  if (grade === undefined || grade === null) return 'UNDEFINED';

  if (grade >= 18) return 'EXCELLENT';
  if (grade >= 16) return 'TRES_BIEN';
  if (grade >= 14) return 'BIEN';
  if (grade >= 12) return 'ASSEZ_BIEN';
  if (grade >= 10) return 'PASSABLE';
  return 'FAILED';
}

/**
 * Get primary color for a grade
 * @param grade - Grade value (0-20 scale)
 * @returns Hex color string
 */
export function getGradeColor(grade?: number | null): string {
  const range = getGradeRange(grade);
  return GRADE_COLORS[range].primary;
}

/**
 * Get complete color set for a grade
 * @param grade - Grade value (0-20 scale)
 * @returns GradeColor object with primary, background, and border colors
 */
export function getGradeColors(grade?: number | null): GradeColor {
  const range = getGradeRange(grade);
  return GRADE_COLORS[range];
}

/**
 * Get French mention label for a grade
 * @param grade - Grade value (0-20 scale)
 * @returns French mention text
 */
export function getGradeMention(grade?: number | null): string {
  const range = getGradeRange(grade);

  const mentions: Record<GradeRange, string> = {
    EXCELLENT: 'Excellent',
    TRES_BIEN: 'Tres Bien',
    BIEN: 'Bien',
    ASSEZ_BIEN: 'Assez Bien',
    PASSABLE: 'Passable',
    FAILED: 'Echec',
    UNDEFINED: 'Non note',
  };

  return mentions[range];
}

/**
 * Check if a grade is passing (>= 10/20)
 * @param grade - Grade value (0-20 scale)
 * @returns True if grade is passing
 */
export function isPassingGrade(grade?: number | null): boolean {
  if (grade === undefined || grade === null) return false;
  return grade >= 10;
}

/**
 * Format grade for display
 * @param grade - Grade value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted grade string
 */
export function formatGrade(grade?: number | null, decimals: number = 2): string {
  if (grade === undefined || grade === null) return '-';
  return grade.toFixed(decimals);
}

/**
 * Get grade percentage (for 20-point scale)
 * @param grade - Grade value (0-20 scale)
 * @returns Percentage (0-100)
 */
export function getGradePercentage(grade?: number | null): number {
  if (grade === undefined || grade === null) return 0;
  return (grade / 20) * 100;
}

/**
 * Get text color contrast for accessibility
 * @param grade - Grade value (0-20 scale)
 * @returns Hex color string for text (white or black)
 */
export function getGradeTextColor(grade?: number | null): string {
  const range = getGradeRange(grade);
  // All our primary colors are vibrant enough to need white text
  return '#FFFFFF';
}
