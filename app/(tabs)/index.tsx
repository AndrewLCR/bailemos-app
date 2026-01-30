import { FeedItemCard } from "@/components/feed/FeedItemCard";
import { ThemedText } from "@/components/themed-text";
import { useBookings } from "@/hooks/useBookings";
import { useFeed } from "@/hooks/useFeed";
import type { Booking } from "@/types/booking";
import type { FeedItem } from "@/types/feed";
import { isEvent } from "@/types/feed";
import { useContext, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";

const TODAY_PILL_BG = "#4f2984";

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const am = hour < 12;
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${am ? "AM" : "PM"}`;
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function TodaySection({ bookings }: { bookings: Booking[] }) {
  const todayStr = getTodayDateString();
  const todayBookings = useMemo(
    () =>
      bookings.filter(
        (b) => b.status !== "cancelled" && b.eventDate === todayStr,
      ),
    [bookings, todayStr],
  );

  if (todayBookings.length === 0) return null;

  return (
    <View style={styles.todaySection}>
      <ThemedText type="subtitle" style={styles.todaySectionTitle}>
        Today
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.todayCarousel}
      >
        {todayBookings.map((booking) => (
          <View key={booking.id} style={styles.todayPill}>
            <ThemedText style={styles.todayPillTitle} numberOfLines={2}>
              {booking.eventTitle}
            </ThemedText>
            <ThemedText style={styles.todayPillTime}>
              {formatTime(booking.eventTime)}
            </ThemedText>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useContext(AuthContext);
  const { items, loading, error, refresh } = useFeed();
  const { bookings, refresh: refreshBookings } = useBookings();

  const isRegisteredToAcademy = (user && bookings.length > 0) ?? false;
  const feedItems = useMemo(() => {
    if (isRegisteredToAcademy) return items;
    return items.filter((item): item is FeedItem => isEvent(item));
  }, [items, isRegisteredToAcademy]);

  const handleRefresh = () => {
    refresh();
    refreshBookings();
  };

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
        <ThemedText onPress={handleRefresh} style={styles.retry}>
          Tap to retry
        </ThemedText>
      </SafeAreaView>
    );
  }

  const listHeader =
    isRegisteredToAcademy && user ? <TodaySection bookings={bookings} /> : null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Feed
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {isRegisteredToAcademy ? "Academies & events" : "Events"}
        </ThemedText>
      </View>
      <FlatList<FeedItem>
        data={feedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedItemCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            refreshing={loading && items.length > 0}
            onRefresh={handleRefresh}
            tintColor="#0a7ea4"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText style={styles.emptyText}>
              {isRegisteredToAcademy
                ? "No academies or events yet."
                : "No events yet."}
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#010b24",
  },
  headerTitle: {
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.8,
    marginTop: 2,
    color: "#ffffff",
  },
  list: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  todaySection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  todaySectionTitle: {
    color: "#ffffff",
    marginBottom: 12,
    opacity: 0.9,
  },
  todayCarousel: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 16,
  },
  todayPill: {
    backgroundColor: TODAY_PILL_BG,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 140,
    maxWidth: 180,
  },
  todayPillTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  todayPillTime: {
    color: "#ffffff",
    fontSize: 13,
    opacity: 0.9,
    marginTop: 4,
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
    color: "#ffffff",
  },
});
