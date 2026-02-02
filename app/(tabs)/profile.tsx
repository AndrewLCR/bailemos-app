import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthContext } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { Link, useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CARD_PURPLE = "#4f2983";
const CARD_BLUE = "#1d489b";
const AVATAR_PINK = "#ec407a";

const PICKER_OPTIONS = {
  allowsEditing: true,
  aspect: [1, 1] as [number, number],
  quality: 0.8,
  base64: true,
};

function formatDDMM(
  dateInput: string | Date | number | undefined
): string | null {
  if (dateInput == null) return null;
  let d: Date;
  if (typeof dateInput === "number") {
    d = new Date(dateInput);
  } else if (typeof dateInput === "string") {
    const cleaned = dateInput.replace(/\d+$/, "").trim();
    d = new Date(cleaned);
  } else {
    d = dateInput;
  }
  if (Number.isNaN(d.getTime())) return null;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

export default function ProfileScreen() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const { locale, setLocale, t } = useLanguage();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const showAvatarOptions = () => {
    if (uploading) return;
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        setUploading(true);
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        await updateUser({ avatar: dataUrl });
        setUploading(false);
      };
      input.click();
      return;
    }
    Alert.alert(t("profile", "changeProfilePhoto"), undefined, [
      {
        text: t("profile", "takePhoto"),
        onPress: () => pickImage("camera"),
      },
      {
        text: t("profile", "chooseFromLibrary"),
        onPress: () => pickImage("library"),
      },
      { text: t("profile", "cancel"), style: "cancel" },
    ]);
  };

  const pickImage = async (source: "camera" | "library") => {
    const { status } =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("profile", "changeProfilePhoto"),
        "Permission to access camera/photos is required."
      );
      return;
    }
    setUploading(true);
    try {
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
          : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
      if (result.canceled || !result.assets?.[0]) {
        return;
      }
      const asset = result.assets[0];
      const avatar = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      await updateUser({ avatar });
    } finally {
      setUploading(false);
    }
  };

  const avatarUri = user?.avatar ?? null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: avatar, name */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.avatarWrap,
              pressed && styles.pressed,
            ]}
            onPress={showAvatarOptions}
            accessibilityRole="button"
            accessibilityLabel={t("profile", "changeProfilePhoto")}
          >
            <View style={[styles.avatar, { backgroundColor: AVATAR_PINK }]}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <MaterialIcons name="person" size={40} color="#FFFFFF" />
              )}
            </View>
          </Pressable>
          <ThemedText
            type="defaultSemiBold"
            style={styles.headerName}
            numberOfLines={1}
          >
            {user?.name ?? t("profile", "user")}
          </ThemedText>
        </View>

        {/* Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t("profile", "sessions")}
            </ThemedText>
            <ThemedText style={styles.sectionLink}>
              {t("profile", "more")} &gt;
            </ThemedText>
          </View>
          <View style={styles.cardsRow}>
            <View style={[styles.cardLarge, { backgroundColor: CARD_PURPLE }]}>
              <ThemedText style={styles.cardLabel}>
                {t("profile", "scheduled")}
              </ThemedText>
              <ThemedText style={styles.cardValueLarge}>5</ThemedText>
            </View>
            <View style={styles.cardsColumn}>
              <View style={[styles.cardSmall, { backgroundColor: CARD_BLUE }]}>
                <ThemedText style={styles.cardLabel}>
                  {t("profile", "thisMonth")}
                </ThemedText>
                <ThemedText style={styles.cardValue}>14</ThemedText>
              </View>
              <View style={[styles.cardSmall, { backgroundColor: CARD_BLUE }]}>
                <ThemedText style={styles.cardLabel}>
                  {t("profile", "lastMonth")}
                </ThemedText>
                <ThemedText style={styles.cardValue}>22</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Membership */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t("profile", "membership")}
            </ThemedText>
            <ThemedText style={styles.sectionLink}>
              {t("profile", "viewHistory")} &gt;
            </ThemedText>
          </View>
          <View style={styles.academyBar}>
            <ThemedText style={styles.academyBarLabel}>
              {t("profile", "enrolledAcademy")}
            </ThemedText>
            <ThemedText style={styles.academyBarName} numberOfLines={1}>
              {user?.enrolledAcademy?.name ?? t("profile", "noAcademyEnrolled")}
            </ThemedText>
          </View>
          <View style={styles.cardsRowThree}>
            <View style={[styles.cardThird, { backgroundColor: CARD_PURPLE }]}>
              <ThemedText style={styles.cardLabel}>
                {t("profile", "status")}
              </ThemedText>
              <ThemedText style={styles.cardValue}>
                {user?.enrolledAcademy?.status
                  ? t("profile", "active")
                  : t("profile", "noAcademyEnrolled")}
              </ThemedText>
            </View>
            <View style={[styles.cardThird, { backgroundColor: CARD_BLUE }]}>
              <ThemedText style={styles.cardLabel}>
                {t("profile", "nextPayment")}
              </ThemedText>
              <ThemedText style={styles.cardValue}>
                {formatDDMM(user?.enrolledAcademy?.nextPaymentDate) ??
                  t("profile", "nextPaymentNa")}
              </ThemedText>
            </View>
            <View style={[styles.cardThird, { backgroundColor: CARD_PURPLE }]}>
              <ThemedText style={styles.cardLabel}>
                {t("profile", "bonuses")}
              </ThemedText>
              <ThemedText style={styles.cardValue}>0</ThemedText>
            </View>
          </View>
        </View>

        {/* Locker rental */}
        <View style={styles.section}>
          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, { marginBottom: 12 }]}
          >
            {t("profile", "lockerRental")}
          </ThemedText>
          <Pressable
            style={({ pressed }) => [
              styles.lockerButton,
              pressed && styles.pressed,
            ]}
          >
            <ThemedText style={styles.lockerButtonText}>
              {t("profile", "exploreRentalOptions")}
            </ThemedText>
          </Pressable>
        </View>

        {/* My bookings (kept) */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("profile", "account")}
          </ThemedText>
          <Link href="/(tabs)/book" asChild>
            <Pressable style={({ pressed }) => [pressed && styles.rowPressed]}>
              <ThemedView style={styles.row}>
                <MaterialIcons name="event" size={22} color="#FFFFFF" />
                <ThemedText style={styles.rowLabel}>
                  {t("profile", "myBookings")}
                </ThemedText>
                <MaterialIcons name="chevron-right" size={22} color="#FFFFFF" />
              </ThemedView>
            </Pressable>
          </Link>
        </View>

        {/* Language (kept) */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("profile", "language")}
          </ThemedText>
          <ThemedView style={styles.row}>
            <MaterialIcons name="language" size={22} color="#FFFFFF" />
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

        {/* Logout (kept) */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("profile", "session")}
          </ThemedText>
          <Pressable
            style={({ pressed }) => [pressed && styles.rowPressed]}
            onPress={handleLogout}
          >
            <ThemedView style={[styles.row, styles.logoutRow]}>
              <MaterialIcons name="logout" size={22} color="#FFFFFF" />
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
  pressed: { opacity: 0.8 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: "#010b24",
  },
  avatarWrap: {},
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  headerName: {
    flex: 1,
    fontSize: 20,
    color: "#FFFFFF",
  },
  settingsBtn: {
    padding: 4,
  },

  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    marginBottom: 0,
  },
  sectionLink: {
    fontSize: 15,
    color: "#FFFFFF",
    opacity: 0.9,
  },

  academyBar: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  academyBarLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.7,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  academyBarName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  cardsRow: {
    flexDirection: "row",
    gap: 10,
    overflow: "visible",
  },
  cardLarge: {
    flex: 1.15,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    minHeight: 168,
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "visible",
  },
  cardsColumn: {
    flex: 1,
    gap: 10,
  },
  cardSmall: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    justifyContent: "space-between",
    minHeight: 79,
    alignItems: "center",
  },
  cardsRowThree: {
    flexDirection: "row",
    gap: 10,
  },
  cardThird: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    minHeight: 80,
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.95,
    textAlign: "center",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  cardValueLarge: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    paddingVertical: 0,
    marginVertical: 0,
  },

  lockerButton: {
    backgroundColor: CARD_PURPLE,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  lockerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  rowPressed: { opacity: 0.7 },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
  logoutRow: {
    borderColor: "rgba(255,255,255,0.12)",
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
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
    borderColor: "rgba(255,255,255,0.3)",
  },
  langChipActive: {
    backgroundColor: CARD_BLUE,
    borderColor: CARD_BLUE,
  },
  langChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  langChipTextActive: {
    color: "#FFFFFF",
  },
});
