import axios from "axios";
import type { ApiResponse, BiometricResult } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

export const biometricApi = {
  verify: async (
    sessionId: string,
    credentialId: string,
    publicKey: string,
    fingerprintHash: string
  ): Promise<BiometricResult> => {
    const res = await axios.post<ApiResponse<BiometricResult>>(
      `${BASE_URL}/api/biometric/verify`,
      { sessionId, credentialId, publicKey, fingerprintHash }
    );
    return res.data.data!;
  },
};