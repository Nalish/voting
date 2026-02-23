// Session
export interface Session {
  sessionId: string;
  qrCodeImage?: string;      // only present in QR flow
  flowType: "qr" | "direct";
}

// Biometric
export interface BiometricResult {
  biometricId: string;
}

// Vote
export interface VoteResult {
  voteId: string;
  votedAt: string;
}

// Admin
export interface Admin {
  id: string;
  email: string;
  name: string;
}

// Results
export interface VoteCount {
  choice: string;
  count: number;
}

// API Response shape — matches your backend
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}