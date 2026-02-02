import { AcademyCard } from "@/components/feed/AcademyCard";
import { HeaderWithProfile } from "@/components/header-with-profile";
import { ThemedText } from "@/components/themed-text";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAcademies } from "@/hooks/useAcademies";
import type { Academy } from "@/types/feed";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AcademiesScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { academies, loading, error, refresh } = useAcademies();
  const [query, setQuery] = useState("");
  const searchBg = useThemeColor({}, "background");
  const searchBorder = useThemeColor(
    { light: "#e5e5e5", dark: "#2a2a2a" },
    "text"
  );
  const inputColor = useThemeColor({}, "text");

  const filteredAcademies = useMemo(() => {
    if (!query.trim()) return academies;
    const q = query.trim().toLowerCase();
    return academies.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (typeof a.location === "string" &&
          a.location.toLowerCase().includes(q)) ||
        (a.styles ?? []).some((s) => s.toLowerCase().includes(q))
    );
  }, [academies, query]);

  const handleAcademyPress = (academy: Academy) => {
    const id = academy?._id ? String(academy._id) : "";
    if (!id) return;
    router.push(`/(tabs)/academies/academy/${encodeURIComponent(id)}`);
  };

  if (loading && academies.length === 0) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>
          {t("academies", "loadingAcademies")}
        </ThemedText>
      </SafeAreaView>
    );
  }

  if (error && academies.length === 0) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <ThemedText onPress={refresh} style={styles.retry}>
          {t("common", "tapToRetry")}
        </ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <HeaderWithProfile
        title={t("academies", "title")}
        subtitle={t("academies", "subtitle")}
      />
      <View
        style={[
          styles.searchWrap,
          { backgroundColor: searchBg, borderColor: searchBorder },
        ]}
      >
        <MaterialIcons name="search" size={22} color="#FFFFFF" />
        <TextInput
          style={[styles.searchInput, { color: inputColor }]}
          placeholder={t("academies", "searchPlaceholder")}
          placeholderTextColor="#FFFFFF"
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <FlatList<Academy>
        data={filteredAcademies}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleAcademyPress(item)}
            style={({ pressed }) => [pressed && styles.cardPressed]}
          >
            <AcademyCard academy={item} />
          </Pressable>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && academies.length > 0}
            onRefresh={refresh}
            tintColor="#0a7ea4"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText style={styles.emptyText}>
              {query.trim()
                ? t("academies", "noMatch")
                : t("academies", "noAcademies")}
            </ThemedText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#010b24",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#010b24",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  list: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  cardPressed: {
    opacity: 0.85,
  },
  loadingText: {
    marginTop: 8,
    color: "#ffffff",
  },
  errorText: {
    textAlign: "center",
    paddingHorizontal: 24,
    color: "#ffffff",
  },
  retry: {
    marginTop: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  empty: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.8,
    color: "#ffffff",
  },
});
