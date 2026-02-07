import type { ClassItem } from "@/api/classes";
import type { LeaderFollowerRole } from "@/components/ClassDetailModal";
import { ClassDetailModal } from "@/components/ClassDetailModal";
import { FeedItemCard } from "@/components/feed/FeedItemCard";
import { HeaderWithProfile } from "@/components/header-with-profile";
import { ThemedText } from "@/components/themed-text";
import { useLanguage } from "@/context/LanguageContext";
import {
  useBookings,
  useCancelClassBooking,
  useClassBookings,
  useCreateClassBooking,
} from "@/hooks/useBookings";
import { useClasses } from "@/hooks/useClasses";
import { useFeed } from "@/hooks/useFeed";
import type { FeedItem } from "@/types/feed";
import { isEvent } from "@/types/feed";
import { useCallback, useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";

const TODAY_PILL_BG = "#4f2984";

/** Accepts "18:00" or "Mon 18:00" (schedule from API). */
function formatTime(scheduleOrTime: string | undefined): string {
  if (!scheduleOrTime || typeof scheduleOrTime !== "string") return "";
  const s = scheduleOrTime.trim();
  const timePart = s.includes(" ") ? s.split(" ").pop() ?? s : s;
  const [h, m] = timePart.split(":");
  const hour = parseInt(h, 10);
  if (Number.isNaN(hour)) return scheduleOrTime;
  const am = hour < 12;
  const h12 = hour % 12 || 12;
  const min = m ?? "00";
  return `${h12}:${min} ${am ? "AM" : "PM"}`;
}

function TodaySection({
  classes,
  loading,
  userAcademyName,
  onClassPress,
}: {
  classes: ClassItem[];
  loading: boolean;
  userAcademyName: string | undefined;
  onClassPress: (cls: ClassItem) => void;
}) {
  const { t } = useLanguage();
  const isEnrolled = !!userAcademyName;

  return (
    <View style={styles.todaySection}>
      <View style={styles.todayCard}>
        <ThemedText type="subtitle" style={styles.todaySectionTitle}>
          {t("common", "today")}
        </ThemedText>
        {!isEnrolled ? (
          <ThemedText style={styles.todaySectionEmpty}>
            {t("feed", "todaySectionEmpty")}
          </ThemedText>
        ) : loading ? (
          <View style={styles.todayCarousel}>
            <ActivityIndicator size="small" color="#ffffff" />
          </View>
        ) : classes.length === 0 ? (
          <ThemedText style={styles.todaySectionEmpty}>
            {t("feed", "noEventsToday")}
          </ThemedText>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.todayCarousel}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {classes.map((cls) => (
              <TouchableOpacity
                key={cls._id}
                style={styles.todayPill}
                activeOpacity={0.85}
                onPress={() => onClassPress(cls)}
              >
                <ThemedText style={styles.todayPillTitle} numberOfLines={1}>
                  {formatTime(cls.schedule ?? cls.time)} - {cls.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  const { items, loading, error, refresh } = useFeed();
  const { bookings, refresh: refreshBookings } = useBookings();
  const {
    classes,
    loading: classesLoading,
    refresh: refreshClasses,
  } = useClasses();
  const { classBookings, refresh: refreshClassBookings } = useClassBookings();
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  const handleBookingSuccess = useCallback(async () => {
    await refreshClassBookings();
    refreshBookings();
    refreshClasses();
    setSelectedClass(null);
  }, [refreshBookings, refreshClasses, refreshClassBookings]);

  const { create: createClassBookingFn, submitting: bookingSubmitting } =
    useCreateClassBooking(handleBookingSuccess);

  const { cancel: cancelClassBookingFn, submitting: cancelSubmitting } =
    useCancelClassBooking(handleBookingSuccess);

  const existingClassBooking = useMemo(() => {
    if (!selectedClass) return null;
    const selectedId = String(selectedClass._id);
    return (
      classBookings.find((b) => {
        const cid = b.classId;
        if (cid == null) return false;
        const id =
          typeof cid === "string"
            ? cid
            : typeof cid === "object" && cid !== null && "_id" in cid
              ? String((cid as { _id: unknown })._id)
              : String(cid);
        return id === selectedId;
      }) ?? null
    );
  }, [selectedClass, classBookings]);

  const handleBookClass = useCallback(
    async (classId: string, role: LeaderFollowerRole) => {
      try {
        await createClassBookingFn(classId, { role });
      } catch {
        Alert.alert(
          t("book", "bookingFailed"),
          t("book", "bookingFailedMessage")
        );
      }
    },
    [createClassBookingFn, t]
  );

  const handleCancelClass = useCallback(
    async (bookingId: string) => {
      try {
        await cancelClassBookingFn(bookingId);
      } catch {
        Alert.alert(
          t("book", "bookingFailed"),
          t("feed", "cancelBookingFailedMessage")
        );
      }
    },
    [cancelClassBookingFn, t]
  );

  const isRegisteredToAcademy = (user && bookings.length > 0) ?? false;
  const feedItems = useMemo(() => {
    if (isRegisteredToAcademy) return items;
    return items.filter((item): item is FeedItem => isEvent(item));
  }, [items, isRegisteredToAcademy]);

  const handleRefresh = () => {
    refresh();
    refreshBookings();
    refreshClasses();
    refreshClassBookings();
  };

  if (loading && items.length === 0) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>
          {t("feed", "loadingFeed")}
        </ThemedText>
      </SafeAreaView>
    );
  }

  if (error && items.length === 0) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <ThemedText onPress={handleRefresh} style={styles.retry}>
          {t("common", "tapToRetry")}
        </ThemedText>
      </SafeAreaView>
    );
  }

  const userAcademyName =
    (
      user as {
        academyName?: string;
        enrolledAcademy?: { name?: string };
      } | null
    )?.academyName ??
    (
      user as {
        academyName?: string;
        enrolledAcademy?: { name?: string };
      } | null
    )?.enrolledAcademy?.name;

  const listHeader = (
    <TodaySection
      classes={classes}
      loading={classesLoading}
      userAcademyName={userAcademyName}
      onClassPress={setSelectedClass}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ClassDetailModal
        visible={!!selectedClass}
        onClose={() => setSelectedClass(null)}
        classItem={selectedClass}
        existingBooking={existingClassBooking ?? null}
        onBook={handleBookClass}
        onCancel={handleCancelClass}
        submitting={bookingSubmitting}
        cancelSubmitting={cancelSubmitting}
      />
      <HeaderWithProfile
        title={t("feed", "title")}
        subtitle={
          isRegisteredToAcademy
            ? t("feed", "academiesAndEvents")
            : t("feed", "events")
        }
      />
      <FlatList<FeedItem>
        data={feedItems}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <FeedItemCard key={item._id} item={item} />}
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
                ? t("feed", "noAcademiesOrEvents")
                : t("feed", "noEvents")}
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
  },
  list: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  todaySection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  todayCard: {
    backgroundColor: "rgba(79, 41, 132, 0.35)",
    borderRadius: 12,
    padding: 16,
    overflow: "hidden",
  },
  todaySectionTitle: {
    color: "#ffffff",
    marginBottom: 12,
    opacity: 0.9,
  },
  todaySectionEmpty: {
    color: "#ffffff",
    fontSize: 15,
    opacity: 0.85,
    lineHeight: 22,
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
    maxWidth: 250,
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
