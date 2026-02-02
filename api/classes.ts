import { API_BASE } from "@/constants/api";
import axios from "axios";

export interface ClassItem {
  _id: string;
  name: string;
  /** Time only "18:00" or full schedule "Mon 18:00" */
  time?: string;
  /** API format e.g. "Mon 18:00" */
  schedule?: string;
  date?: string;
  academyName?: string;
}

export async function fetchClasses(): Promise<ClassItem[]> {
  const res = await axios.get<ClassItem[]>(`${API_BASE}/academy/classes`);
  if (!Array.isArray(res?.data)) return [];
  return res.data;
}
