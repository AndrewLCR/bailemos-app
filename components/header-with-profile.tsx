import { useLanguage } from "@/context/LanguageContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";
import { IconSymbol } from "./ui/icon-symbol";

type Props = {
  title: string;
  subtitle?: string;
  /** When true, shows a back button on the left that calls router.back() */
  showBackButton?: boolean;
};

export function HeaderWithProfile({ title, subtitle, showBackButton }: Props) {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <View style={styles.header}>
      {showBackButton ? (
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          accessibilityLabel={t("common", "back") ?? "Back"}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
      ) : null}
      <View
        style={[styles.titleWrap, showBackButton && styles.titleWrapWithBack]}
      >
        <ThemedText type="title" style={styles.title}>
          {title}
        </ThemedText>
        {subtitle != null && (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        )}
      </View>
      <Pressable
        onPress={() => router.push("/(tabs)/profile")}
        style={({ pressed }) => [
          styles.profileButton,
          pressed && styles.pressed,
        ]}
        accessibilityLabel={t("tabs", "profile")}
      >
        <IconSymbol size={26} name="person.fill" color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#010b24",
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
    marginRight: 8,
  },
  titleWrap: { flex: 1 },
  titleWrapWithBack: { marginLeft: 0 },
  title: { color: "#ffffff" },
  subtitle: {
    fontSize: 15,
    opacity: 0.8,
    marginTop: 2,
    color: "#ffffff",
  },
  profileButton: {
    padding: 8,
    marginRight: -8,
  },
  pressed: { opacity: 0.7 },
});
