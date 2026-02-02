import { API_BASE } from "@/constants/api";
import axios from "axios";

/**
 * Update the current user's profile (e.g. avatar).
 * Backend should persist to DB and return updated user or accept avatar as URL/base64.
 */
export async function updateProfile(updates: {
  avatar?: string;
  name?: string;
}): Promise<{
  success: boolean;
  user?: Record<string, unknown>;
  error?: string;
}> {
  try {
    const res = await axios.patch(`${API_BASE}/auth/profile`, updates);
    const user = res.data?.user ?? res.data;
    return { success: true, user };
  } catch (err: unknown) {
    const message =
      (axios.isAxiosError(err) && err.response?.data?.message) ||
      (err instanceof Error ? err.message : "Failed to update profile");
    return { success: false, error: String(message) };
  }
}
