import { ThemedText } from "@/components/themed-text";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AcademyDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    academyId: string;
    name?: string;
    description?: string;
    location?: string;
    styles?: string;
  }>();

  const name = params.name ?? "Academy";
  const description = params.description ?? "";
  const location = params.location ?? "";
  const styleList = params.styles ? params.styles.split(",") : [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>
          {name}
        </ThemedText>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {location ? (
          <View style={styles.row}>
            <MaterialIcons name="location-on" size={22} color="#9BA1A6" />
            <ThemedText style={styles.rowText}>{location}</ThemedText>
          </View>
        ) : null}
        {description ? (
          <ThemedText style={styles.description}>{description}</ThemedText>
        ) : null}
        {styleList.length > 0 ? (
          <View style={styles.stylesSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Styles
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#010b24" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#010b24",
  },
  backButton: { padding: 4 },
  pressed: { opacity: 0.7 },
  headerTitle: { flex: 1, color: "#ffffff" },
  scroll: { flex: 1, backgroundColor: "#010b24" },
  scrollContent: { padding: 16, paddingBottom: 32 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  rowText: { fontSize: 16, color: "#ECEDEE", flex: 1 },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#ECEDEE",
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
});
