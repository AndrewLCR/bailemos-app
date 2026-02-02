import { ThemedText } from "@/components/themed-text";
import { useLanguage } from "@/context/LanguageContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookingSuccessScreen() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="check-circle" size={80} color="#22c55e" />
        </View>
        <ThemedText type="title" style={styles.title}>
          {t("book", "youAreBooked")}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {t("book", "youAreBookedSubtitle")}
        </ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.replace("/(tabs)/book")}
        >
          <ThemedText style={styles.buttonText}>
            {t("book", "backToBook")}
          </ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#010b24" },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#010b24",
  },
  iconWrap: { marginBottom: 24 },
  title: { textAlign: "center", marginBottom: 8 },
  subtitle: {
    fontSize: 16,
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#0a7ea4",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonPressed: { opacity: 0.9 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
