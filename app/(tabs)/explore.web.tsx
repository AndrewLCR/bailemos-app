import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNearby } from "@/hooks/useNearby";
import type { NearbyPlace } from "@/types/nearby";
import { isNearbyAcademy } from "@/types/nearby";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getPlaceTitle(place: NearbyPlace): string {
  return place.type === "academy" ? place.name : place.title;
}

function getPlaceSubtitle(place: NearbyPlace): string {
  return place.location;
}

export default function NearbyScreenWeb() {
  const { places, loading, error, refresh } = useNearby();
  const [query, setQuery] = useState("");
  const searchBg = useThemeColor({}, "background");
  const searchBorder = useThemeColor(
    { light: "#e5e5e5", dark: "#2a2a2a" },
    "text",
  );
  const inputColor = useThemeColor({}, "text");

  const filteredPlaces = useMemo(() => {
    if (!query.trim()) return places;
    const q = query.trim().toLowerCase();
    return places.filter((p) => {
      const title = getPlaceTitle(p).toLowerCase();
      const location = p.location.toLowerCase();
      const styles = isNearbyAcademy(p) ? p.styles.join(" ").toLowerCase() : "";
      return title.includes(q) || location.includes(q) || styles.includes(q);
    });
  }, [places, query]);

  if (loading && places.length === 0) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading…</ThemedText>
      </SafeAreaView>
    );
  }

  if (error && places.length === 0) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <ThemedText onPress={refresh} style={styles.retry}>
          Tap to retry
        </ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View
        style={[
          styles.searchWrap,
          { backgroundColor: searchBg, borderColor: searchBorder },
        ]}
      >
        <MaterialIcons name="search" size={22} color="#687076" />
        <TextInput
          style={[styles.searchInput, { color: inputColor }]}
          placeholder="Search academies & events…"
          placeholderTextColor="#687076"
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <FlatList<NearbyPlace>
        data={filteredPlaces}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ThemedView style={styles.listCard}>
            <ThemedText type="defaultSemiBold">
              {getPlaceTitle(item)}
            </ThemedText>
            <ThemedText style={styles.listSubtitle}>
              {getPlaceSubtitle(item)}
            </ThemedText>
            <ThemedText style={styles.listType}>
              {item.type === "academy" ? "Academy" : "Event"}
            </ThemedText>
          </ThemedView>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText style={styles.emptyText}>
              No places match your search.
            </ThemedText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
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
    marginTop: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  listCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  listSubtitle: { fontSize: 14, opacity: 0.8, marginTop: 2 },
  listType: { fontSize: 12, opacity: 0.6, marginTop: 4 },
  empty: { paddingVertical: 48, alignItems: "center" },
  emptyText: { fontSize: 16, opacity: 0.8 },
  loadingText: { marginTop: 8 },
  errorText: { textAlign: "center", paddingHorizontal: 24 },
  retry: { marginTop: 12, color: "#0a7ea4", fontWeight: "600" },
});
