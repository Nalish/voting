import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  Fingerprint,
  HowToVote,
  CheckCircle,
  Error as ErrorIcon,
  Refresh,
} from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import { sessionApi } from "../../api/session.api";
import { biometricApi } from "../../api/biometric.api";

type PageStatus =
  | "validating"    // checking session is valid
  | "ready"         // session valid, ready to scan
  | "scanning"      // fingerprint scan in progress
  | "success"       // fingerprint verified
  | "already-voted" // duplicate detected
  | "expired"       // session expired
  | "error";        // something went wrong

const MobilePage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session") || "";

  const [status, setStatus] = useState<PageStatus>("validating");
  const [error, setError] = useState<string>("");

  // ─── Step 1: Validate session when page loads ─────────────────────
  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setError("Invalid QR code. Please go back to your laptop and try again.");
      return;
    }
    validateSession();
  }, [sessionId]);

  const validateSession = async () => {
    try {
      setStatus("validating");
      const sessionStatus = await sessionApi.getStatus(sessionId);

      if (sessionStatus === "completed") {
        setStatus("already-voted");
        return;
      }

      if (sessionStatus === "expired") {
        setStatus("expired");
        return;
      }

      // Mark session as scanned — notifies laptop via WebSocket
      await sessionApi.markScanned(sessionId);
      setStatus("ready");
    } catch {
      setStatus("expired");
    }
  };

  // ─── Step 2: Trigger fingerprint scan ────────────────────────────
  const startFingerprintScan = async () => {
    try {
      setStatus("scanning");

      // Trigger WebAuthn fingerprint scan on phone
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "Company Voting System" },
          user: {
            id: new Uint8Array(16),
            name: "voter",
            displayName: "Voter",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error("No credential returned");
      }

      // Extract biometric data
      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialId = credential.id;
      const publicKey = btoa(
        String.fromCharCode(
          ...new Uint8Array(
            response.getPublicKey() || new ArrayBuffer(0)
          )
        )
      );
      const fingerprintHash = btoa(
        String.fromCharCode(
          ...new Uint8Array(response.clientDataJSON)
        )
      );

      // Send to backend
      await biometricApi.verify(
        sessionId,
        credentialId,
        publicKey,
        fingerprintHash
      );

      setStatus("success");
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Fingerprint scan was cancelled. Please try again.");
        setStatus("ready");
        return;
      }
      if (err.response?.data?.message === "You have already voted") {
        setStatus("already-voted");
        return;
      }
      setError("Fingerprint verification failed. Please try again.");
      setStatus("error");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "primary.main",
          py: 3,
          px: 4,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <HowToVote sx={{ color: "white", fontSize: 32 }} />
        <Typography variant="h6" fontWeight={700} color="white">
          Company Voting System
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ py: 6, flex: 1 }}>

        {/* Validating session */}
        {status === "validating" && (
          <Box textAlign="center" mt={8}>
            <CircularProgress size={60} />
            <Typography variant="h6" mt={3} color="text.secondary">
              Validating your session...
            </Typography>
            <LinearProgress sx={{ mt: 3, borderRadius: 2 }} />
          </Box>
        )}

        {/* Ready to scan */}
        {status === "ready" && (
          <Card>
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <Fingerprint
                sx={{ fontSize: 100, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h5" fontWeight={700} color="primary.main" mb={1}>
                Verify Your Identity
              </Typography>
              <Typography color="text.secondary" mb={4}>
                Place your finger on your phone's fingerprint sensor to
                verify your identity and proceed to vote.
              </Typography>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<Fingerprint />}
                onClick={startFingerprintScan}
                sx={{ py: 1.5, fontSize: 16 }}
              >
                Scan Fingerprint
              </Button>
              {error && (
                <Alert severity="warning" sx={{ mt: 2, textAlign: "left" }}>
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Scanning in progress */}
        {status === "scanning" && (
          <Box textAlign="center" mt={8}>
            <Box
              sx={{
                position: "relative",
                display: "inline-flex",
                mb: 3,
              }}
            >
              <CircularProgress size={120} thickness={2} />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Fingerprint sx={{ fontSize: 60, color: "primary.main" }} />
              </Box>
            </Box>
            <Typography variant="h6" color="primary.main" fontWeight={600}>
              Scanning...
            </Typography>
            <Typography color="text.secondary" mt={1}>
              Keep your finger on the sensor
            </Typography>
          </Box>
        )}

        {/* Success */}
        {status === "success" && (
          <Card
            sx={{
              border: "2px solid",
              borderColor: "secondary.main",
              textAlign: "center",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <CheckCircle
                sx={{ fontSize: 80, color: "secondary.main", mb: 2 }}
              />
              <Typography variant="h5" fontWeight={700} color="secondary.main" mb={2}>
                Identity Verified!
              </Typography>
              <Alert severity="success" sx={{ mb: 3, textAlign: "left" }}>
                Your fingerprint has been verified successfully.
              </Alert>
              <Box
                sx={{
                  backgroundColor: "#F0F4FF",
                  borderRadius: 2,
                  p: 3,
                  border: "1px solid",
                  borderColor: "primary.light",
                }}
              >
                <Typography fontWeight={600} color="primary.main" mb={1}>
                  What happens next?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your laptop screen will automatically update and show the
                  ballot page. Please return to your laptop to cast your vote.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Already voted */}
        {status === "already-voted" && (
          <Card
            sx={{
              border: "2px solid",
              borderColor: "error.main",
              textAlign: "center",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <ErrorIcon
                sx={{ fontSize: 80, color: "error.main", mb: 2 }}
              />
              <Typography variant="h5" fontWeight={700} color="error.main" mb={2}>
                Already Voted
              </Typography>
              <Alert severity="error" sx={{ textAlign: "left" }}>
                A vote has already been recorded for this fingerprint. Each
                employee can only vote once.
              </Alert>
              <Typography
                variant="body2"
                color="text.secondary"
                mt={3}
              >
                If you believe this is an error, please contact your
                election administrator.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Session expired */}
        {status === "expired" && (
          <Card sx={{ textAlign: "center" }}>
            <CardContent sx={{ p: 4 }}>
              <ErrorIcon
                sx={{ fontSize: 80, color: "warning.main", mb: 2 }}
              />
              <Typography variant="h5" fontWeight={700} color="warning.main" mb={2}>
                QR Code Expired
              </Typography>
              <Alert severity="warning" sx={{ mb: 3, textAlign: "left" }}>
                This QR code has expired. QR codes are only valid for 5
                minutes for security reasons.
              </Alert>
              <Typography color="text.secondary" mb={3}>
                Please go back to your laptop and refresh the page to
                generate a new QR code.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {status === "error" && (
          <Card sx={{ textAlign: "center" }}>
            <CardContent sx={{ p: 4 }}>
              <ErrorIcon
                sx={{ fontSize: 80, color: "error.main", mb: 2 }}
              />
              <Typography variant="h5" fontWeight={700} color="error.main" mb={2}>
                Something Went Wrong
              </Typography>
              <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
                {error || "An unexpected error occurred. Please try again."}
              </Alert>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={validateSession}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

      </Container>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: "primary.main",
          py: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="white">
          © 2026 Company Voting System — Powered by Biometric Security
        </Typography>
      </Box>
    </Box>
  );
};

export default MobilePage;
