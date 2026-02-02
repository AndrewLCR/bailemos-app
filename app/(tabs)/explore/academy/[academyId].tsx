import { getEnrollmentStatus } from "@/api/enrollment";
import { EnrollmentModal } from "@/components/EnrollmentModal";
import { HeaderWithProfile } from "@/components/header-with-profile";
import { ThemedText } from "@/components/themed-text";
import { AppButton } from "@/components/ui/app-button";
import { AuthContext } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAcademy } from "@/hooks/useAcademy";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function normalizeParam(value: string | string[] | undefined): string {
  if (value == null) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export default function AcademyDetailScreen() {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  const params = useLocalSearchParams<{
    academyId?: string;
    name?: string;
    description?: string;
    location?: string;
    styles?: string;
  }>();
  const academyId = normalizeParam(params.academyId);
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

  const name = academy.name;
  const description = academy.description ?? "";
  const location = typeof academy.location === "string" ? academy.location : "";
  const styleList = academy.styles ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <HeaderWithProfile title={name} showBackButton />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {location ? (
          <View style={styles.row}>
            <MaterialIcons name="location-on" size={22} color="#FFFFFF" />
            <ThemedText style={styles.rowText}>{location}</ThemedText>
          </View>
        ) : null}
        {description ? (
          <ThemedText style={styles.description}>{description}</ThemedText>
        ) : null}
        {styleList.length > 0 ? (
          <View style={styles.stylesSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t("common", "styles")}
            </ThemedText>
            <View style={styles.chipRow}>
              {styleList.map((s) => (
                <View key={s} style={styles.chip}>
                  <ThemedText style={styles.chipText}>{s.trim()}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.enrollSection}>
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
  scroll: { flex: 1, backgroundColor: "#010b24" },
  scrollContent: { padding: 16, paddingBottom: 32 },
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
  errorText: { fontSize: 16, color: "#FFFFFF", textAlign: "center" },
  retry: { marginTop: 12, color: "#FFFFFF", fontWeight: "600" },
  notFound: { fontSize: 16, color: "#FFFFFF", textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  rowText: { fontSize: 16, color: "#FFFFFF", flex: 1 },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 24,
  },
  stylesSection: { marginBottom: 24 },
  sectionTitle: { marginBottom: 10, color: "#ffffff" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(79, 41, 132, 0.4)",
    borderWidth: 1,
    borderColor: "#4f2984",
  },
  chipText: { fontSize: 14, color: "#ffffff", fontWeight: "500" },
  enrollSection: { marginTop: 8 },
});
