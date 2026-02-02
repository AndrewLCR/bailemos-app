import { submitEnrollment } from "@/api/enrollment";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AppButton } from "@/components/ui/app-button";
import { useLanguage } from "@/context/LanguageContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

const VOUCHER_PICKER_OPTIONS = {
  allowsEditing: true,
  aspect: [4, 3] as [number, number],
  quality: 0.8,
  base64: true,
};

export interface EnrollmentModalProps {
  visible: boolean;
  onClose: () => void;
  academyId: string;
  initialFullName?: string;
  initialEmail?: string;
  onSuccess?: () => void;
}

export function EnrollmentModal({
  visible,
  onClose,
  academyId,
  initialFullName = "",
  initialEmail = "",
  onSuccess,
}: EnrollmentModalProps) {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [idNumber, setIdNumber] = useState("");
  const [voucherUri, setVoucherUri] = useState<string | null>(null);
  const [voucherBase64, setVoucherBase64] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setFullName(initialFullName);
      setEmail(initialEmail);
    }
  }, [visible, initialFullName, initialEmail]);

  const resetForm = () => {
    setFullName(initialFullName);
    setEmail(initialEmail);
    setPhone("");
    setIdNumber("");
    setVoucherUri(null);
    setVoucherBase64(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const pickVoucher = async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        setVoucherUri(dataUrl);
        setVoucherBase64(dataUrl);
      };
      input.click();
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "",
        "Permission to access photos is required for the voucher."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync(
      VOUCHER_PICKER_OPTIONS
    );
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setVoucherUri(asset.uri);
    setVoucherBase64(
      asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri
    );
  };

  const handleSubmit = async () => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedId = idNumber.trim();
    if (!trimmedName) {
      Alert.alert(
        t("academies", "enrollmentFailed"),
        "Please enter your full name."
      );
      return;
    }
    if (!trimmedPhone) {
      Alert.alert(
        t("academies", "enrollmentFailed"),
        "Please enter your phone number."
      );
      return;
    }
    if (!trimmedEmail) {
      Alert.alert(
        t("academies", "enrollmentFailed"),
        "Please enter your email."
      );
      return;
    }
    if (!trimmedId) {
      Alert.alert(
        t("academies", "enrollmentFailed"),
        "Please enter your ID number."
      );
      return;
    }
    if (!voucherBase64) {
      Alert.alert(
        t("academies", "enrollmentFailed"),
        "Please upload the payment voucher."
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitEnrollment({
        academyId,
        fullName: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        idNumber: trimmedId,
        voucherImage: voucherBase64,
      });
      if (res.success) {
        handleClose();
        Alert.alert(
          t("academies", "enrollmentSuccess"),
          t("academies", "enrollmentSuccessMessage")
        );
        onSuccess?.();
      } else if (res.alreadyEnrolled) {
        handleClose();
        Alert.alert(
          t("academies", "alreadyEnrolled"),
          t("academies", "alreadyEnrolledMessage")
        );
        onSuccess?.();
      } else {
        Alert.alert(
          t("academies", "enrollmentFailed"),
          res.message ?? "Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContentWrap}
        >
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                {t("academies", "enrollmentFormTitle")}
              </ThemedText>
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <MaterialIcons name="close" size={28} color="#FFFFFF" />
              </Pressable>
            </View>
            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.field}>
                <ThemedText style={styles.fieldLabel}>
                  {t("academies", "fullName")}
                </ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder={t("academies", "fullNamePlaceholder")}
                  placeholderTextColor="#9BA1A6"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.field}>
                <ThemedText style={styles.fieldLabel}>
                  {t("academies", "phone")}
                </ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder={t("academies", "phonePlaceholder")}
                  placeholderTextColor="#9BA1A6"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.field}>
                <ThemedText style={styles.fieldLabel}>
                  {t("academies", "email")}
                </ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder={t("academies", "emailPlaceholder")}
                  placeholderTextColor="#9BA1A6"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.field}>
                <ThemedText style={styles.fieldLabel}>
                  {t("academies", "idNumber")}
                </ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder={t("academies", "idNumberPlaceholder")}
                  placeholderTextColor="#9BA1A6"
                  value={idNumber}
                  onChangeText={setIdNumber}
                />
              </View>
              <View style={styles.field}>
                <ThemedText style={styles.fieldLabel}>
                  {t("academies", "paymentVoucher")}
                </ThemedText>
                <ThemedText style={styles.fieldHint}>
                  {t("academies", "paymentVoucherHint")}
                </ThemedText>
                <Pressable
                  onPress={pickVoucher}
                  style={[
                    styles.voucherButton,
                    voucherUri && styles.voucherButtonFilled,
                  ]}
                >
                  {voucherUri ? (
                    <Image
                      source={{ uri: voucherUri }}
                      style={styles.voucherPreview}
                      resizeMode="cover"
                    />
                  ) : (
                    <>
                      <MaterialIcons
                        name="add-photo-alternate"
                        size={40}
                        color="#9BA1A6"
                      />
                      <ThemedText style={styles.voucherButtonText}>
                        {t("academies", "paymentVoucher")}
                      </ThemedText>
                    </>
                  )}
                </Pressable>
              </View>
              <View style={styles.submitWrap}>
                <AppButton
                  text={
                    submitting
                      ? t("common", "loading")
                      : t("academies", "submitEnrollment")
                  }
                  shape="rounded"
                  onPress={handleSubmit}
                  backgroundColor="#4f2983"
                  textColor="#ffffff"
                  disabled={submitting}
                />
              </View>
            </ScrollView>
          </ThemedView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContentWrap: { maxHeight: "90%" },
  modalContent: {
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: { color: "#FFFFFF", marginBottom: 0 },
  pressed: { opacity: 0.8 },
  formScroll: { maxHeight: 400 },
  formScrollContent: { paddingBottom: 24 },
  field: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 6,
  },
  fieldHint: { fontSize: 12, color: "#9BA1A6", marginBottom: 6 },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#FFFFFF",
  },
  voucherButton: {
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  voucherButtonFilled: {
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.2)",
    padding: 0,
  },
  voucherPreview: { width: "100%", height: "100%", borderRadius: 10 },
  voucherButtonText: { fontSize: 14, color: "#9BA1A6" },
  submitWrap: { marginTop: 24 },
});
