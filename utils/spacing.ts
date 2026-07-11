import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

/**
 * Standardized spacing scale using responsive units
 * Based on wp() for consistency across screen sizes
 */
export const spacing = {
  // Horizontal spacing
  xs: wp(1),    // ~4px
  sm: wp(2),    // ~8px
  md: wp(3),    // ~12px
  lg: wp(4),    // ~16px
  xl: wp(5),    // ~20px
  '2xl': wp(8), // ~32px
  '3xl': wp(12), // ~48px

  // Vertical spacing
  vxs: hp(0.5),  // ~4px
  vsm: hp(1),    // ~8px
  vmd: hp(1.5),  // ~12px
  vlg: hp(2),    // ~16px
  vxl: hp(2.5),  // ~20px
  'v2xl': hp(4), // ~32px
} as const;

/**
 * Card/container padding based on context
 */
export const containerPadding = {
  screen: wp(5),     // 20px - main screen padding
  card: wp(4),       // 16px - card internal padding
  section: wp(3),    // 12px - section spacing
} as const;
