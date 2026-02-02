import { getEnrollmentStatus } from "@/api/enrollment";
import { EnrollmentModal } from "@/components/EnrollmentModal";
import { HeaderWithProfile } from "@/components/header-with-profile";
import { ThemedText } from "@/components/themed-text";
import { AppButton } from "@/components/ui/app-button";
import { AuthContext } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAcademy } from "@/hooks/useAcademy";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useLocalSearchParams, usePathname } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = 260;

function normalizeParam(value: string | string[] | undefined): string {
  if (value == null) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export default function AcademyDetailScreen() {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  const pathname = usePathname();
  const params = useLocalSearchParams<{ academyId?: string }>();
  const paramId = normalizeParam(params.academyId);
  const idFromPath = pathname
    ? pathname.split("/").filter(Boolean).pop() ?? ""
    : "";
  const academyId =
    paramId || (idFromPath && decodeURIComponent(idFromPath)) || "";
  const { academy, loading, error, refresh } = useAcademy(academyId);
  const [enrollModalVisible, setEnrollModalVisible] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (!academyId) return;
    let cancelled = false;
    getEnrollmentStatus(academyId).then((r) => {
      if (cancelled) return;
      const fromApi = r.enrolled;
      const fromUser =
        (
          user as {
            academyId?: string;
            enrolledAcademyId?: string;
            academyName?: string;
          } | null
        )?.academyId === academyId ||
        (
          user as {
            academyId?: string;
            enrolledAcademyId?: string;
            academyName?: string;
          } | null
        )?.enrolledAcademyId === academyId ||
        (academy &&
          (
            user as {
              academyId?: string;
              enrolledAcademyId?: string;
              academyName?: string;
            } | null
          )?.academyName === academy.name);
      setIsEnrolled(fromApi || !!fromUser);
    });
    return () => {
      cancelled = true;
    };
  }, [academyId, academy?.name, academy, user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <HeaderWithProfile title={t("common", "academy")} showBackButton />
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#4f2984" />
          <ThemedText style={styles.loaderText}>
            {t("common", "loading")}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !academy) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <HeaderWithProfile title={t("common", "academy")} showBackButton />
        <View style={styles.center}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <ThemedText onPress={refresh} style={styles.retry}>
            {t("common", "tapToRetry")}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!academy) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <HeaderWithProfile title={t("common", "academy")} showBackButton />
        <View style={styles.center}>
          <ThemedText style={styles.notFound}>
            {t("academies", "academyNotFound")}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const locationStr =
    typeof academy.location === "string" ? academy.location : "";
  const stylesList = academy.styles ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <HeaderWithProfile title={academy.name} showBackButton />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image with title overlay */}
        <View style={styles.heroWrap}>
          {academy.imageUrl ? (
            <Image
              source={{ uri: academy.imageUrl }}
              style={styles.heroImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <MaterialIcons
                name="business"
                size={64}
                color="rgba(255,255,255,0.5)"
              />
            </View>
          )}
          <View style={styles.heroGradient} />
          <View style={styles.heroTitleWrap}>
            <ThemedText type="title" style={styles.heroTitle}>
              {academy.name}
            </ThemedText>
          </View>
        </View>

        {/* Info tabs: Schedule, Tutors, Reviews */}
        <View style={styles.infoTabs}>
          <View style={styles.infoTab}>
            <MaterialIcons name="event-note" size={24} color="#FFFFFF" />
            <ThemedText style={styles.infoTabLabel}>
              {t("academies", "schedule")}
            </ThemedText>
          </View>
          <View style={styles.infoTab}>
            <MaterialIcons name="people" size={24} color="#FFFFFF" />
            <ThemedText style={styles.infoTabLabel}>
              {t("academies", "tutors")}
            </ThemedText>
          </View>
          <View style={styles.infoTab}>
            <MaterialIcons name="rate-review" size={24} color="#FFFFFF" />
            <ThemedText style={styles.infoTabLabel}>
              {t("academies", "reviews")}
            </ThemedText>
          </View>
        </View>

        {/* Description */}
        {academy.description ? (
          <ThemedText style={styles.description}>
            {academy.description}
          </ThemedText>
        ) : null}

        {/* Action buttons: Join, Review */}
        <View style={styles.actions}>
          <View style={styles.actionButtonWrap}>
            <AppButton
              text={
                isEnrolled
                  ? t("academies", "alreadyEnrolled")
                  : t("academies", "enroll")
              }
              shape="rounded"
              onPress={() => !isEnrolled && setEnrollModalVisible(true)}
              backgroundColor="#4f2983"
              textColor="#ffffff"
              disabled={isEnrolled}
            />
          </View>
          <View style={styles.actionButtonWrap}>
            <AppButton
              text={t("academies", "review")}
              shape="rounded"
              onPress={() => {}}
              backgroundColor="#1d489b"
              textColor="#ffffff"
              variant="outline"
            />
          </View>
        </View>

        {/* Location */}
        {locationStr ? (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t("common", "location")}
            </ThemedText>
            <View style={styles.row}>
              <MaterialIcons name="location-on" size={22} color="#FFFFFF" />
              <ThemedText style={styles.rowText}>{locationStr}</ThemedText>
            </View>
          </View>
        ) : null}

        {/* Styles / Rhythms */}
        {stylesList.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t("academies", "rhythms")}
            </ThemedText>
            <View style={styles.chipRow}>
              {stylesList.map((s) => (
                <View key={s} style={styles.chip}>
                  <ThemedText style={styles.chipText}>{s.trim()}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Payment info */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("academies", "paymentInfo")}
          </ThemedText>
          <ThemedText style={styles.paymentText}>
            {t("academies", "paymentInfoPlaceholder")}
          </ThemedText>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      <EnrollmentModal
        visible={enrollModalVisible}
        onClose={() => setEnrollModalVisible(false)}
        academyId={academyId}
        initialFullName={user?.name}
        initialEmail={user?.email}
        onSuccess={() => setIsEnrolled(true)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#010b24" },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loaderText: { fontSize: 16, color: "#FFFFFF" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  notFound: { fontSize: 16, color: "#FFFFFF", textAlign: "center" },
  errorText: { fontSize: 16, color: "#FFFFFF", textAlign: "center" },
  retry: { marginTop: 12, color: "#FFFFFF", fontWeight: "600" },
  scroll: { flex: 1, backgroundColor: "#010b24" },
  scrollContent: { paddingBottom: 32 },
  heroWrap: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    position: "relative",
    backgroundColor: "#1a1a2e",
  },
  heroImage: { width: "100%", height: "100%" },
  heroPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a2e",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  heroTitleWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  heroTitle: { color: "#ffffff", fontSize: 26, fontWeight: "700" },
  infoTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  infoTab: {
    alignItems: "center",
    gap: 8,
  },
  infoTabLabel: { fontSize: 13, color: "#FFFFFF", textTransform: "lowercase" },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#FFFFFF",
    opacity: 0.95,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  actionButtonWrap: {
    flex: 1,
  },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { marginBottom: 10, color: "#ffffff", fontSize: 18 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowText: { fontSize: 16, color: "#FFFFFF", flex: 1 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(79, 41, 132, 0.4)",
    borderWidth: 1,
    borderColor: "#4f2984",
  },
  chipText: { fontSize: 14, color: "#FFFFFF", fontWeight: "500" },
  paymentText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  bottomPad: { height: 24 },
});
