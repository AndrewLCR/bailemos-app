import { MyBookingItem } from "@/api/booking";
import type { ClassItem } from "@/api/classes";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AppButton } from "@/components/ui/app-button";
import { useLanguage } from "@/context/LanguageContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

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

export type LeaderFollowerRole = "leader" | "follower";

export interface ClassDetailModalProps {
  visible: boolean;
  onClose: () => void;
  classItem: ClassItem | null;
  onBook: (classId: string, role: LeaderFollowerRole) => void;
  submitting?: boolean;
  existingBooking: MyBookingItem | null;
}

export function ClassDetailModal({
  visible,
  onClose,
  classItem,
  onBook,
  submitting = false,
  existingBooking,
}: ClassDetailModalProps) {
  const { t } = useLanguage();
  const [role, setRole] = useState<LeaderFollowerRole | null>(null);

  if (!visible || !classItem) return null;

  const handleClose = () => {
    setRole(null);
    onClose();
  };

  const handleBook = () => {
    if (!role) return;
    onBook(classItem._id, role);
  };

  const timeStr = formatTime(classItem.schedule ?? classItem.time);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable
          style={styles.modalContentWrap}
          onPress={(e) => e.stopPropagation()}
        >
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                {t("feed", "classDetail")}
              </ThemedText>
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <MaterialIcons name="close" size={28} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.infoBlock}>
              <ThemedText style={styles.className}>{classItem.name}</ThemedText>
              {timeStr ? (
                <ThemedText style={styles.infoRow}>
                  {t("book", "time")}: {timeStr}
                </ThemedText>
              ) : null}
              {classItem.academyName ? (
                <ThemedText style={styles.infoRow}>
                  {t("common", "academy")}: {classItem.academyName}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.roleSection}>
              <ThemedText style={styles.roleLabel}>
                {t("feed", "goingAs")}
              </ThemedText>
              <View style={styles.roleRow}>
                <Pressable
                  onPress={() => setRole("leader")}
                  style={[
                    styles.rolePill,
                    role === "leader" && styles.rolePillSelected,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.rolePillText,
                      role === "leader" && styles.rolePillTextSelected,
                    ]}
                  >
                    {t("feed", "leader")}
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => setRole("follower")}
                  style={[
                    styles.rolePill,
                    role === "follower" && styles.rolePillSelected,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.rolePillText,
                      role === "follower" && styles.rolePillTextSelected,
                    ]}
                  >
                    {t("feed", "follower")}
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            <View style={styles.submitWrap}>
              <AppButton
                text={
                  submitting
                    ? t("common", "loading")
                    : t("feed", "bookThisClass")
                }
                shape="rounded"
                onPress={handleBook}
                backgroundColor="#4f2983"
                textColor="#ffffff"
                disabled={submitting || !role}
              />
            </View>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContentWrap: {
    maxHeight: "90%",
  },
  modalContent: {
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: { color: "#FFFFFF", marginBottom: 0 },
  pressed: { opacity: 0.8 },
  infoBlock: {
    marginBottom: 24,
  },
  className: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  infoRow: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
  },
  roleSection: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  roleRow: {
    flexDirection: "row",
    gap: 12,
  },
  rolePill: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  rolePillSelected: {
    borderColor: "#4f2983",
    backgroundColor: "rgba(79, 41, 131, 0.35)",
  },
  rolePillText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
  },
  rolePillTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  submitWrap: { marginTop: 8 },
});
