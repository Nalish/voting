import axios from "axios";
import type { ApiResponse, Admin } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

export const authApi = {

  login: async (email: string, password: string): Promise<{ token: string; admin: Admin }> => {
    const res = await axios.post<ApiResponse<{ token: string; admin: Admin }>>(
      `${BASE_URL}/api/auth/login`,
      { email, password }
    );
    return res.data.data!;
  },

  register: async (email: string, password: string, name: string): Promise<Admin> => {
    const res = await axios.post<ApiResponse<Admin>>(
      `${BASE_URL}/api/auth/register`,
      { email, password, name }
    );
    return res.data.data!;
  },
};