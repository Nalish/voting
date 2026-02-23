import axios from "axios";
import type { ApiResponse, Session } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

export const sessionApi = {

  // Called when laptop has no fingerprint
  generateQRSession: async (): Promise<Session> => {
    const res = await axios.post<ApiResponse<Session>>(
      `${BASE_URL}/api/session/generate/qr`
    );
    return res.data.data!;
  },

  // Called when laptop has fingerprint
  generateDirectSession: async (): Promise<Session> => {
    const res = await axios.post<ApiResponse<Session>>(
      `${BASE_URL}/api/session/generate/direct`
    );
    return res.data.data!;
  },

  // Mark session as scanned
  markScanned: async (sessionId: string): Promise<void> => {
    await axios.post(`${BASE_URL}/api/session/${sessionId}/scan`);
  },

  // Get session status
  getStatus: async (sessionId: string): Promise<string> => {
    const res = await axios.get(
      `${BASE_URL}/api/session/${sessionId}/status`
    );
    return res.data.data.status;
  },
};