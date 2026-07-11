import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "@/contexts/AppStateContext";
import { useUser } from "@/hooks/useUserProfile";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import useAppTheme from "@/hooks/useAppTheme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

export type AppSidebarProps = {
  isVisible: boolean;
  onClose: () => void;
};

const AppSidebar: React.FC<AppSidebarProps> = ({ isVisible, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [imageError, setImageError] = useState(false);
    const { colors, isDarkMode } = useAppTheme();
  
  // Reanimated values
  const translateX = useSharedValue(DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  // Get complete user profile from useUser hook
  const { profile } = useUser();
  
  // Use profile data or fallback to auth user
  const userData = profile || user;

  useEffect(() => {
    console.log('AppSidebar Reanimated - visibility:', isVisible);
    if (isVisible) {
      // Animate in
      translateX.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      // Animate out
      translateX.value = withTiming(DRAWER_WIDTH, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [isVisible]);

  // Animated styles
  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (profile?.profile_photo_url && profile.profile_photo_url.trim() !== "") {
      return profile.profile_photo_url;
    }

    const fullName = userData?.first_name && userData?.last_name 
      ? `${userData.first_name} ${userData.last_name}`
      : userData?.first_name || userData?.email || "User";
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0F4C75&color=fff&size=128`;
  };

  // Get formatted user name
  const getFormattedName = () => {
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    } else if (userData?.first_name) {
      return userData.first_name;
    }
    return "Utilisateur";
  };
  
  // Get user role badge
  const getUserRoleBadge = () => {
    const role = userData?.role;
    if (!role) return null;

    const roleConfig = {
      student: { icon: "school", color: colors.primary.light, label: "Étudiant" },
      teacher: { icon: "book", color: colors.success.light, label: "Enseignant" },
      admin: { icon: "shield-checkmark", color: colors.warning.light, label: "Administrateur" },
    };

    const config = roleConfig[role as keyof typeof roleConfig];
    if (!config) return null;

    return (
      <View style={[styles.roleBadge, { backgroundColor: `${config.color}15` }]}>
        <Ionicons name={config.icon as any} size={wp(3)} color={config.color} />
        <Text style={[styles.roleText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  const isActive = (path: string) => {
    return pathname?.includes(path);
  };

  const handleNavigation = (path: string) => {
    try {
      router.push(path as any);
      onClose();
    } catch (error) {
      console.error('Navigation error:', error);
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(public)/onboarding");
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View style={[styles.drawer, { backgroundColor: colors.background.primary, height: Platform.OS === 'android' ? '100%' : SCREEN_HEIGHT }, drawerStyle]}>
        <SafeAreaView style={[styles.safeArea, Platform.OS === 'android' && { flex: 1 }]} edges={Platform.OS === 'android' ? ['top'] : undefined}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border.primary }]}>
              <TouchableOpacity
                style={[styles.profileImageContainer, { backgroundColor: colors.primary.oceanBlue50, borderColor: colors.primary.oceanBlue700 }]}
                onPress={() => handleNavigation("/profile/profile")}
              >
                {!imageError ? (
                  <Image
                    source={{ uri: getProfileImageUrl() }}
                    style={styles.profileImage}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Image
                    source={require("@assets/images/mix/user.jpg")}
                    style={styles.profileImage}
                    contentFit="cover"
                  />
                )}
                <View style={[styles.profileBadge, { backgroundColor: colors.primary.oceanBlue700, borderColor: colors.background.primary }]}>
                  <Ionicons name="person" size={wp(3)} color={colors.text.white} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleNavigation("/profile/profile")}>
                <Text style={[styles.userName, { color: colors.text.primary }]}>{getFormattedName()}</Text>
                {userData?.phone && (
                  <Text style={[styles.userPhone, { color: colors.primary.light }]}>{userData.phone}</Text>
                )}
                <Text style={[styles.userEmail, { color: colors.text.secondary }]}>{userData?.email || "Pas d'email"}</Text>

                {getUserRoleBadge()}

                {userData?.is_verified && (
                  <View style={[styles.verifiedBadge, { backgroundColor: colors.success.light + '15' }]}>
                    <Ionicons name="checkmark-circle" size={wp(3)} color={colors.success.light} />
                    <Text style={[styles.verifiedText, { color: colors.success.dark }]}>Vérifié</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Menu */}
            <View style={styles.menuContainer}>
              <Text style={[styles.menuHeader, { color: colors.text.tertiary }]}>MENU PRINCIPAL</Text>

              {/* Dashboard */}
              <TouchableOpacity
                style={[styles.menuItem, isActive("/") && { backgroundColor: colors.primary.oceanBlue50 }]}
                onPress={() => handleNavigation("/(main)/")}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.primary.oceanBlue50 }, isActive("/") && { backgroundColor: colors.primary.oceanBlue700 }]}>
                  <Ionicons
                    name="home"
                    size={wp(4.5)}
                    color={isActive("/") ? colors.text.white : colors.primary.oceanBlue700}
                  />
                </View>
                <Text style={[styles.menuText, { color: colors.text.primary }, isActive("/") && { fontWeight: "600", color: colors.primary.oceanBlue700 }]}>
                  Tableau de bord
                </Text>
              </TouchableOpacity>

              {/* Schedule */}
              <TouchableOpacity
                style={[styles.menuItem, isActive("/timetable") && { backgroundColor: colors.primary.oceanBlue50 }]}
                onPress={() => handleNavigation("/(main)/timetable")}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.primary.oceanBlue50 }, isActive("/timetable") && { backgroundColor: colors.primary.oceanBlue700 }]}>
                  <Ionicons
                    name="calendar"
                    size={wp(4.5)}
                    color={isActive("/timetable") ? colors.text.white : colors.primary.oceanBlue700}
                  />
                </View>
                <Text style={[styles.menuText, { color: colors.text.primary }, isActive("/timetable") && { fontWeight: "600", color: colors.primary.oceanBlue700 }]}>
                  Mon emploi du temps
                </Text>
              </TouchableOpacity>

              {/* Attendance History */}
              <TouchableOpacity
                style={[styles.menuItem, isActive("/attendance") && { backgroundColor: colors.primary.oceanBlue50 }]}
                onPress={() => handleNavigation("/(main)/attendance")}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.primary.oceanBlue50 }, isActive("/attendance") && { backgroundColor: colors.primary.oceanBlue700 }]}>
                  <Ionicons
                    name="checkbox"
                    size={wp(4.5)}
                    color={isActive("/attendance") ? colors.text.white : colors.primary.oceanBlue700}
                  />
                </View>
                <Text style={[styles.menuText, { color: colors.text.primary }, isActive("/attendance") && { fontWeight: "600", color: colors.primary.oceanBlue700 }]}>
                  Présences
                </Text>
              </TouchableOpacity>

              {/* Justifications */}
              <TouchableOpacity
                style={[styles.menuItem, isActive("/justifications") && { backgroundColor: colors.primary.oceanBlue50 }]}
                onPress={() => handleNavigation("/(main)/justifications")}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.primary.oceanBlue50 }, isActive("/justifications") && { backgroundColor: colors.primary.oceanBlue700 }]}>
                  <Ionicons
                    name="document-text"
                    size={wp(4.5)}
                    color={isActive("/justifications") ? colors.text.white : colors.primary.oceanBlue700}
                  />
                </View>
                <Text style={[styles.menuText, { color: colors.text.primary }, isActive("/justifications") && { fontWeight: "600", color: colors.primary.oceanBlue700 }]}>
                  Justifications
                </Text>
              </TouchableOpacity>

              {/* Notifications */}
              <TouchableOpacity
                style={[styles.menuItem, isActive("/notifications") && { backgroundColor: colors.primary.oceanBlue50 }]}
                onPress={() => handleNavigation("/(main)/notifications")}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.primary.oceanBlue50 }, isActive("/notifications") && { backgroundColor: colors.primary.oceanBlue700 }]}>
                  <Ionicons
                    name="notifications"
                    size={wp(4.5)}
                    color={isActive("/notifications") ? colors.text.white : colors.primary.oceanBlue700}
                  />
                </View>
                <Text style={[styles.menuText, { color: colors.text.primary }, isActive("/notifications") && { fontWeight: "600", color: colors.primary.oceanBlue700 }]}>
                  Notifications
                </Text>
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: colors.border.primary }]} />

              {/* Profile */}
              <TouchableOpacity
                style={[styles.menuItem, isActive("/profile") && { backgroundColor: colors.primary.oceanBlue50 }]}
                onPress={() => handleNavigation("/profile/profile")}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.primary.oceanBlue50 }, isActive("/profile") && { backgroundColor: colors.primary.oceanBlue700 }]}>
                  <Ionicons
                    name="person"
                    size={wp(4.5)}
                    color={isActive("/profile") ? colors.text.white : colors.primary.oceanBlue700}
                  />
                </View>
                <Text style={[styles.menuText, { color: colors.text.primary }, isActive("/profile") && { fontWeight: "600", color: colors.primary.oceanBlue700 }]}>
                  Profil
                </Text>
              </TouchableOpacity>

              {/* Settings */}
              <TouchableOpacity
                style={[styles.menuItem, isActive("/settings") && { backgroundColor: colors.primary.oceanBlue50 }]}
                onPress={() => handleNavigation("/settings")}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.primary.oceanBlue50 }, isActive("/settings") && { backgroundColor: colors.primary.oceanBlue700 }]}>
                  <Ionicons
                    name="settings"
                    size={wp(4.5)}
                    color={isActive("/settings") ? colors.text.white : colors.primary.oceanBlue700}
                  />
                </View>
                <Text style={[styles.menuText, { color: colors.text.primary }, isActive("/settings") && { fontWeight: "600", color: colors.primary.oceanBlue700 }]}>
                  Paramètres
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border.primary }]}>
            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error.light }]} onPress={handleLogout}>
              <Ionicons name="log-out" size={wp(4.5)} color={colors.text.white} />
              <Text style={[styles.logoutText, { color: colors.text.white }]}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
  },
  profileImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
    position: "relative",
  },
  profileImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  profileBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
    textAlign: "center",
  },
  userPhone: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 2,
  },
  userEmail: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: "center",
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 3,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: "center",
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 3,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 10,
  },
  menuHeader: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 6,
    borderRadius: 10,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  logoutText: {
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
});

export default AppSidebar;
