import { FeedItemCard } from "@/components/feed/FeedItemCard";
import { ThemedText } from "@/components/themed-text";
import { useFeed } from "@/hooks/useFeed";
import type { FeedItem } from "@/types/feed";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { items, loading, error, refresh } = useFeed();

  if (loading && items.length === 0) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading feed…</ThemedText>
      </SafeAreaView>
    );
  }

  if (error && items.length === 0) {
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
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Feed
        </ThemedText>
        <ThemedText style={styles.subtitle}>Academies & events</ThemedText>
      </View>
      <FlatList<FeedItem>
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedItemCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && items.length > 0}
            onRefresh={refresh}
            tintColor="#0a7ea4"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText style={styles.emptyText}>
              No academies or events yet.
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
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    color: "#000000",
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.8,
    marginTop: 2,
  },
  list: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  loadingText: {
    marginTop: 8,
  },
  errorText: {
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retry: {
    marginTop: 12,
    color: "#0a7ea4",
    fontWeight: "600",
  },
  empty: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.8,
  },
});
