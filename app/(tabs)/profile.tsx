import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthContext } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, useRouter } from "expo-router";
import { useContext } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getInitials(name: string | undefined): string {
  if (!name || !name.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const { locale, setLocale, t } = useLanguage();
  const router = useRouter();
  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            {t("profile", "title")}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {t("profile", "subtitle")}
          </ThemedText>
        </View>

        {user && (
          <>
            <ThemedView style={styles.card}>
              <View style={[styles.avatar, { backgroundColor: tint + "25" }]}>
                <ThemedText style={[styles.avatarText, { color: tint }]}>
                  {getInitials(user.name)}
                </ThemedText>
              </View>
              <ThemedText type="defaultSemiBold" style={styles.name}>
                {user.name ?? t("profile", "user")}
              </ThemedText>
              {user.email && (
                <ThemedText style={styles.email}>{user.email}</ThemedText>
              )}
              {user.role && (
                <View style={styles.roleBadge}>
                  <ThemedText style={styles.roleText}>{user.role}</ThemedText>
                </View>
              )}
            </ThemedView>

            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {t("profile", "account")}
              </ThemedText>
              <Link href="/(tabs)/book" asChild>
                <Pressable
                  style={({ pressed }) => [pressed && styles.rowPressed]}
                >
                  <ThemedView style={styles.row}>
                    <MaterialIcons name="event" size={22} color={iconColor} />
                    <ThemedText style={styles.rowLabel}>
                      {t("profile", "myBookings")}
                    </ThemedText>
                    <MaterialIcons
                      name="chevron-right"
                      size={22}
                      color={iconColor}
                    />
                  </ThemedView>
                </Pressable>
              </Link>
            </View>
          </>
        )}

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("profile", "settings")}
          </ThemedText>
          <ThemedView style={styles.row}>
            <MaterialIcons name="language" size={22} color={iconColor} />
            <ThemedText style={styles.rowLabel}>
              {t("profile", "language")}
            </ThemedText>
            <View style={styles.languageOptions}>
              <Pressable
                style={[
                  styles.langChip,
                  locale === "en" && styles.langChipActive,
                ]}
                onPress={() => setLocale("en")}
              >
                <ThemedText
                  style={[
                    styles.langChipText,
                    locale === "en" && styles.langChipTextActive,
                  ]}
                >
                  {t("profile", "languageEnglish")}
                </ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.langChip,
                  locale === "es" && styles.langChipActive,
                ]}
                onPress={() => setLocale("es")}
              >
                <ThemedText
                  style={[
                    styles.langChipText,
                    locale === "es" && styles.langChipTextActive,
                  ]}
                >
                  {t("profile", "languageSpanish")}
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("profile", "session")}
          </ThemedText>
          <Pressable
            style={({ pressed }) => [pressed && styles.rowPressed]}
            onPress={handleLogout}
          >
            <ThemedView style={[styles.row, styles.logoutRow]}>
              <MaterialIcons name="logout" size={22} color="#dc2626" />
              <ThemedText style={styles.logoutText}>
                {t("profile", "logOut")}
              </ThemedText>
            </ThemedView>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#010b24" },
  scroll: { flex: 1, backgroundColor: "#010b24" },
  scrollContent: { paddingBottom: 32 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: "#010b24",
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.8,
    marginTop: 2,
  },
  card: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "600",
  },
  name: {
    fontSize: 20,
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    opacity: 0.8,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(10, 126, 164, 0.15)",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0a7ea4",
    textTransform: "capitalize",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  rowPressed: { opacity: 0.7 },
  rowLabel: {
    flex: 1,
    fontSize: 16,
  },
  logoutRow: {
    borderColor: "rgba(220, 38, 38, 0.2)",
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: "#dc2626",
    fontWeight: "500",
  },
  languageOptions: {
    flexDirection: "row",
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
  },
  langChipActive: {
    backgroundColor: "#0a7ea4",
    borderColor: "#0a7ea4",
  },
  langChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  langChipTextActive: {
    color: "#fff",
  },
});
