import axios from "axios";
import type { ApiResponse, VoteResult, VoteCount } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

export const voteApi = {

  cast: async (
    sessionId: string,
    biometricId: string,
    voteChoice: string
  ): Promise<VoteResult> => {
    const res = await axios.post<ApiResponse<VoteResult>>(
      `${BASE_URL}/api/vote/cast`,
      { sessionId, biometricId, voteChoice }
    );
    return res.data.data!;
  },

  getResults: async (token: string): Promise<{ results: VoteCount[]; total: number }> => {
    const res = await axios.get(`${BASE_URL}/api/vote/results`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  },

  getCount: async (token: string): Promise<number> => {
    const res = await axios.get(`${BASE_URL}/api/vote/count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data.total;
  },
};