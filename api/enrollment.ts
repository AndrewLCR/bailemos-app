import { API_BASE } from "@/constants/api";
import axios from "axios";

export interface SubmitEnrollmentPayload {
  academyId: string;
  fullName: string;
  phone: string;
  email: string;
  idNumber: string;
  /** Base64 data URL or file URI; backend stores and uses for notifications */
  voucherImage: string;
}

export interface SubmitEnrollmentResponse {
  success: boolean;
  message?: string;
  enrollmentId?: string;
  /** True when backend rejects because user is already enrolled */
  alreadyEnrolled?: boolean;
}

export interface EnrollmentStatusResponse {
  enrolled: boolean;
}

/**
 * Check if the current user is already enrolled in an academy.
 * Backend: GET /academy/:academyId/enrollment → { enrolled: boolean }
 * Also accepts { status: "approved" | "pending" } as enrolled.
 * Returns { enrolled: false } on 404 or when not implemented.
 */
export async function getEnrollmentStatus(
  academyId: string
): Promise<EnrollmentStatusResponse> {
  try {
    const res = await axios.get<EnrollmentStatusResponse & { status?: string }>(
      `${API_BASE}/academy/${academyId}/enrollment`
    );
    const data = res.data;
    if (!data || typeof data !== "object") return { enrolled: false };
    if (typeof data.enrolled === "boolean") return { enrolled: data.enrolled };
    if (data.status === "approved" || data.status === "pending") {
      return { enrolled: true };
    }
    return { enrolled: false };
  } catch {
    return { enrolled: false };
  }
}

function isAlreadyEnrolledMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("already enrolled") ||
    lower.includes("duplicate") ||
    lower.includes("already registered")
  );
}

/**
 * Submit academy enrollment. Backend should:
 * - Store enrollment and voucher (unique per user + academy)
 * - Return 409 or message "Already enrolled" when user already enrolled
 * - Notify the academy (push notification + email)
 */
export async function submitEnrollment(
  payload: SubmitEnrollmentPayload
): Promise<SubmitEnrollmentResponse> {
  try {
    const res = await axios.post<
      SubmitEnrollmentResponse & { success?: boolean; message?: string }
    >(`${API_BASE}/academy/${payload.academyId}/enroll`, {
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email,
      idNumber: payload.idNumber,
      voucherImage: payload.voucherImage,
    });
    const data = res.data;
    if (data && typeof data === "object" && data.success === false) {
      const msg = data.message ?? "Enrollment failed";
      return {
        success: false,
        message: msg,
        alreadyEnrolled: isAlreadyEnrolledMessage(msg),
      };
    }
    return { ...data, success: true };
  } catch (err: unknown) {
    const status = axios.isAxiosError(err) ? err.response?.status : undefined;
    const message =
      (axios.isAxiosError(err) && err.response?.data?.message) ||
      (err instanceof Error ? err.message : "Enrollment failed");
    const msgStr = String(message);
    return {
      success: false,
      message: msgStr,
      alreadyEnrolled: status === 409 || isAlreadyEnrolledMessage(msgStr),
    };
  }
}
