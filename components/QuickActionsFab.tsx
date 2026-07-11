import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { router } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/contexts/AppStateContext';
import Animated, { 
  FadeIn, 
  FadeInDown,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface QuickAction {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  description: string;
  highlight?: boolean;
}

// Student actions
const STUDENT_ACTIONS: QuickAction[] = [
  {
    id: 'scan',
    label: 'Scanner QR',
    icon: 'qr-code',
    route: '/(main)/scanner',
    description: 'Valider ma présence',
    highlight: true,
  },
  {
    id: 'grades',
    label: 'Notes',
    icon: 'school',
    route: '/(main)/grades',
    description: 'Voir mes résultats',
  },
  {
    id: 'recommendations',
    label: 'Recommandations',
    icon: 'ribbon',
    route: '/(main)/recommendations',
    description: 'Lettres de recommandation',
  },
  {
    id: 'justifications',
    label: 'Justificatifs',
    icon: 'document-text',
    route: '/(main)/justifications',
    description: 'Mes justificatifs',
  },
  {
    id: 'history',
    label: 'Historique',
    icon: 'list',
    route: '/(main)/attendance-history',
    description: 'Voir mes présences',
  },
  {
    id: 'schedule',
    label: 'Planning',
    icon: 'calendar',
    route: '/(main)/timetable',
    description: 'Emploi du temps',
  },
];

// Professor actions
const PROFESSOR_ACTIONS: QuickAction[] = [
  {
    id: 'start-session',
    label: 'Démarrer Séance',
    icon: 'qr-code',
    route: '/(professor)/start-session',
    description: 'Scanner et présence',
    highlight: true,
  },
  {
    id: 'sessions',
    label: 'Mes Séances',
    icon: 'calendar',
    route: '/(professor)/sessions',
    description: 'Voir mes séances',
  },
  {
    id: 'grades-entry',
    label: 'Saisir Notes',
    icon: 'create',
    route: '/(professor)/grades-entry',
    description: 'Entrer les notes',
  },
  {
    id: 'recommendations',
    label: 'Recommandations',
    icon: 'ribbon',
    route: '/(professor)/recommendations',
    description: 'Lettres demandées',
  },
  {
    id: 'modules',
    label: 'Mes Modules',
    icon: 'book',
    route: '/(professor)/modules',
    description: 'Voir mes modules',
  },
  {
    id: 'reports',
    label: 'Rapports',
    icon: 'bar-chart',
    route: '/(professor)/reports',
    description: 'Statistiques',
  },
];

// Map roles to actions (extend this when roles are added)
const ROLE_ACTIONS: Record<string, QuickAction[]> = {
  ETUDIANT: STUDENT_ACTIONS,
  ENSEIGNANT: PROFESSOR_ACTIONS,
  // Add other roles as needed
};

export default function QuickActionsFab() {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useAppTheme();
  const { user } = useAuth();

  // Get actions based on user role (default to student actions)
  const getUserActions = () => {
    if (!user?.role) {
      console.log('🎯 [FAB] No user role, defaulting to student actions');
      return STUDENT_ACTIONS;
    }

    const roleLower = user.role.toLowerCase();
    console.log('🎯 [FAB] User role:', user.role, '(lowercase:', roleLower + ')');

    // Check if role is teacher/professor
    if (roleLower === 'enseignant' || roleLower === 'teacher' || roleLower === 'professor') {
      console.log('🎯 [FAB] Using PROFESSOR_ACTIONS');
      return PROFESSOR_ACTIONS;
    }

    // Default to student actions
    console.log('🎯 [FAB] Using STUDENT_ACTIONS');
    return STUDENT_ACTIONS;
  };

  const actions = getUserActions();
  const dynamicStyles = createStyles(colors);

  const handleActionPress = (route: string) => {
    setIsOpen(false);
    router.push(route as any);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={dynamicStyles.backdrop}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsOpen(false)}
          />
        </Animated.View>
      )}

      {/* FAB Container */}
      <View style={dynamicStyles.fabContainer}>
        {/* Action Buttons */}
        {isOpen && (
          <Animated.View
            entering={SlideInDown.duration(300).springify()}
            exiting={SlideOutDown.duration(200)}
            style={dynamicStyles.actionsContainer}
          >
            {actions.map((action, index) => (
              <ActionButton
                key={action.id}
                action={action}
                index={index}
                totalActions={actions.length}
                onPress={handleActionPress}
                colors={colors}
              />
            ))}
          </Animated.View>
        )}

        {/* Main FAB Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsOpen(!isOpen)}
          style={dynamicStyles.fabButton}
        >
          <LinearGradient
            colors={isOpen ? [colors.surface.secondary, colors.surface.secondary] : colors.primary.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={dynamicStyles.fabGradient}
          >
            <Animated.View
              style={[
                dynamicStyles.fabIconContainer,
                useAnimatedStyle(() => ({
                  transform: [{ rotate: withSpring(isOpen ? '90deg' : '0deg') }],
                })),
              ]}
            >
              <Ionicons
                name={isOpen ? 'close' : 'flash'}
                size={28}
                color={isOpen ? colors.text.primary : '#FFFFFF'}
              />
            </Animated.View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );
}

interface ActionButtonProps {
  action: QuickAction;
  index: number;
  totalActions: number;
  onPress: (route: string) => void;
  colors: any;
}

function ActionButton({ action, index, totalActions, onPress, colors }: ActionButtonProps) {
  const delay = (totalActions - index - 1) * 50;

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress(action.route)}
        style={[
          createStyles(colors).actionButton,
          action.highlight && { borderColor: colors.primary.light, borderWidth: 2 },
        ]}
      >
        <View
          style={[
            createStyles(colors).actionIconContainer,
            { backgroundColor: action.highlight ? colors.primary.light + '20' : colors.surface.elevated },
          ]}
        >
          <Ionicons
            name={action.icon}
            size={20}
            color={action.highlight ? colors.primary.light : colors.text.secondary}
          />
        </View>
        <View style={createStyles(colors).actionTextContainer}>
          <Text style={createStyles(colors).actionLabel}>{action.label}</Text>
          <Text style={createStyles(colors).actionDescription}>{action.description}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  fabContainer: {
    position: 'absolute',
    bottom: hp(10),
    right: wp(4),
    zIndex: 999,
    alignItems: 'flex-end',
  },
  actionsContainer: {
    marginBottom: hp(2),
    gap: hp(1.5),
    alignItems: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.primary,
    borderRadius: 24,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    gap: wp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: wp(60),
  },
  actionIconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionLabel: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: colors.text.primary,
  },
  actionDescription: {
    fontSize: wp(3),
    color: colors.text.secondary,
    marginTop: hp(0.2),
  },
  fabButton: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: wp(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
