import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Fingerprint,
  QrCode2,
  HowToVote,
  Refresh,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { sessionApi } from "../../api/session.api";
import { connectSocket, getSocket } from "../../utils/socket";

type DeviceStatus = "checking" | "has-fingerprint" | "no-fingerprint";
type FlowStatus =
  | "idle"
  | "generating"
  | "waiting-scan"
  | "phone-connected"
  | "verified"
  | "error";

const DeviceCheckPage = () => {
  const navigate = useNavigate();

  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>("checking");
  const [flowStatus, setFlowStatus] = useState<FlowStatus>("idle");
  const [sessionId, setSessionId] = useState<string>("");
  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [biometricId, setBiometricId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(300);

  useEffect(() => {
    const detectSensor = async () => {
      try {
        const available =
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setDeviceStatus(available ? "has-fingerprint" : "no-fingerprint");
      } catch {
        setDeviceStatus("no-fingerprint");
      }
    };
    detectSensor();
  }, []);

  useEffect(() => {
    if (deviceStatus === "has-fingerprint") {
      startDirectFlow();
    } else if (deviceStatus === "no-fingerprint") {
      startQRFlow();
    }
  }, [deviceStatus]);

  const startQRFlow = async () => {
    try {
      setFlowStatus("generating");
      setError("");
      const session = await sessionApi.generateQRSession();
      setSessionId(session.sessionId);
      setQrCodeImage(session.qrCodeImage || "");
      setFlowStatus("waiting-scan");
      connectSocket();
      const socket = getSocket();
      socket.emit("join:session", session.sessionId);
      socket.on("session:scanned", () => setFlowStatus("phone-connected"));
      socket.on("biometric:verified", ({ biometricId }: { biometricId: string }) => {
        setBiometricId(biometricId);
        setFlowStatus("verified");
      });
      socket.on("session:expired", () => {
        setError("QR code has expired. Please refresh to generate a new one.");
        setFlowStatus("error");
      });
    } catch {
      setError("Failed to generate QR code. Please try again.");
      setFlowStatus("error");
    }
  };

  const startDirectFlow = async () => {
    try {
      setFlowStatus("generating");
      setError("");
      const session = await sessionApi.generateDirectSession();
      setSessionId(session.sessionId);
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "Company Voting System" },
          user: { id: new Uint8Array(16), name: "voter", displayName: "Voter" },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (credential) {
        const response = credential.response as AuthenticatorAttestationResponse;
        const credentialId = credential.id;
        const publicKey = btoa(
          String.fromCharCode(
            ...new Uint8Array(response.getPublicKey() || new ArrayBuffer(0))
          )
        );
        const fingerprintHash = btoa(
          String.fromCharCode(...new Uint8Array(response.clientDataJSON))
        );
        const { biometricApi } = await import("../../api/biometric.api");
        const result = await biometricApi.verify(
          session.sessionId,
          credentialId,
          publicKey,
          fingerprintHash
        );
        setBiometricId(result.biometricId);
        setFlowStatus("verified");
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Fingerprint scan was cancelled. Please try again.");
      } else {
        setError("Fingerprint verification failed. Please try again.");
      }
      setFlowStatus("error");
    }
  };

  useEffect(() => {
    if (flowStatus !== "waiting-scan") return;
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [flowStatus]);

  useEffect(() => {
    if (flowStatus === "verified" && biometricId && sessionId) {
      setTimeout(() => {
        navigate("/vote/ballot", { state: { sessionId, biometricId } });
      }, 1500);
    }
  }, [flowStatus, biometricId, sessionId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",              // ← use viewport width
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: "primary.main",
          py: 3,
          px: 4,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexShrink: 0,
        }}
      >
        <HowToVote sx={{ color: "white", fontSize: 36 }} />
        <Typography variant="h5" fontWeight={700} color="white">
          Company Voting System
        </Typography>
      </Box>

      {/* Main Content — full width, centered content inside */}
      <Box
        sx={{
          width: "100%",
          flex: 1,
          py: 6,
          px: { xs: 2, md: 8 },       // ← responsive padding
          display: "flex",
          flexDirection: "column",
          alignItems: "center",        // ← center content horizontally
        }}
      >

        {/* Checking device */}
        {deviceStatus === "checking" && (
          <Box textAlign="center" mt={10}>
            <CircularProgress size={60} />
            <Typography variant="h6" mt={3} color="text.secondary">
              Checking your device capabilities...
            </Typography>
          </Box>
        )}

        {/* QR Flow */}
        {deviceStatus === "no-fingerprint" && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={3}
            width="100%"
            maxWidth={600}
          >
            <Typography variant="h4" fontWeight={700} color="primary.main" textAlign="center">
              Scan with Your Phone
            </Typography>
            <Typography color="text.secondary" textAlign="center">
              Your device does not have a fingerprint sensor. Please scan the
              QR code below with your phone to verify your identity.
            </Typography>

            {flowStatus === "generating" && (
              <Box textAlign="center" mt={4}>
                <CircularProgress />
                <Typography mt={2} color="text.secondary">
                  Generating QR code...
                </Typography>
              </Box>
            )}

            {flowStatus === "waiting-scan" && qrCodeImage && (
              <Card sx={{ p: 2, textAlign: "center", width: "100%" }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} justifyContent="center" mb={2}>
                    <QrCode2 sx={{ color: "primary.main" }} />
                    <Typography fontWeight={600} color="primary.main">
                      Scan this QR code with your phone
                    </Typography>
                  </Box>
                  <Box
                    component="img"
                    src={qrCodeImage}
                    alt="Voting QR Code"
                    sx={{
                      width: 280,
                      height: 280,
                      border: "2px solid",
                      borderColor: "primary.light",
                      borderRadius: 2,
                    }}
                  />
                  <Typography
                    mt={2}
                    color={timeLeft < 60 ? "error" : "text.secondary"}
                    fontWeight={600}
                  >
                    Expires in: {formatTime(timeLeft)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Open your phone camera and point it at the QR code
                  </Typography>
                </CardContent>
              </Card>
            )}

            {flowStatus === "phone-connected" && (
              <Alert severity="info" sx={{ width: "100%" }}>
                <Typography fontWeight={600}>Phone Connected!</Typography>
                <Typography variant="body2">
                  Please scan your fingerprint on your phone to continue.
                </Typography>
              </Alert>
            )}

            {flowStatus === "verified" && (
              <Alert severity="success" sx={{ width: "100%" }}>
                <Typography fontWeight={600}>Fingerprint Verified!</Typography>
                <Typography variant="body2">
                  Taking you to the ballot page...
                </Typography>
              </Alert>
            )}

            {flowStatus === "error" && (
              <Box textAlign="center" width="100%">
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={() => {
                    setTimeLeft(300);
                    setFlowStatus("idle");
                    startQRFlow();
                  }}
                >
                  Generate New QR Code
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Direct Flow */}
        {deviceStatus === "has-fingerprint" && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={3}
            width="100%"
            maxWidth={600}
          >
            <Typography variant="h4" fontWeight={700} color="primary.main" textAlign="center">
              Scan Your Fingerprint
            </Typography>
            <Typography color="text.secondary" textAlign="center">
              Your device supports fingerprint scanning. Please place your
              finger on the sensor to verify your identity.
            </Typography>

            {flowStatus === "generating" && (
              <Box textAlign="center" mt={4}>
                <Fingerprint sx={{ fontSize: 120, color: "primary.main", opacity: 0.8 }} />
                <CircularProgress sx={{ mt: 2 }} />
                <Typography mt={2} color="text.secondary">
                  Waiting for fingerprint scan...
                </Typography>
              </Box>
            )}

            {flowStatus === "verified" && (
              <Alert severity="success" sx={{ width: "100%" }}>
                <Typography fontWeight={600}>Fingerprint Verified!</Typography>
                <Typography variant="body2">
                  Taking you to the ballot page...
                </Typography>
              </Alert>
            )}

            {flowStatus === "error" && (
              <Box textAlign="center" width="100%">
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
                <Button
                  variant="contained"
                  startIcon={<Fingerprint />}
                  onClick={startDirectFlow}
                >
                  Try Again
                </Button>
              </Box>
            )}
          </Box>
        )}

      </Box>

      {/* Footer */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: "primary.main",
          py: 2,
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <Typography variant="body2" color="white">
          © 2026 Company Voting System — Powered by Biometric Security
        </Typography>
      </Box>
    </Box>
  );
};

export default DeviceCheckPage;