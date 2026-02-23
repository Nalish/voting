import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";
import {
  HowToVote,
  Fingerprint,
  QrCode,
  CheckCircle,
  Security,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    label: "Open the voting page",
    description: "Access the voting system from your laptop or phone.",
    icon: <HowToVote />,
  },
  {
    label: "Verify your identity",
    description:
      "Scan your fingerprint directly on your device. If your laptop has no fingerprint sensor, a QR code will appear — scan it with your phone to verify on your phone instead.",
    icon: <Fingerprint />,
  },
  {
    label: "Cast your vote",
    description:
      "Select your choice and submit. Your vote is final and cannot be changed.",
    icon: <QrCode />,
  },
  {
    label: "Confirmation",
    description:
      "You will receive a unique vote reference number as proof your vote was recorded.",
    icon: <CheckCircle />,
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
        width:"100%"
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
        <HowToVote sx={{ color: "white", fontSize: 36 }} />
        <Typography variant="h5" fontWeight={700} color="white">
          Company Voting System
        </Typography>
      </Box>

      <Container maxWidth={false} sx={{ py: 6, flex: 1 }}>

        {/* Hero */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight={700} color="primary.main" mb={2}>
            Welcome to the Company Election
          </Typography>
          <Typography variant="h6" color="text.secondary" maxWidth={600} mx="auto">
            Your vote is secure, private, and protected by fingerprint biometric
            verification. Each employee can only vote once.
          </Typography>
        </Box>

        {/* How it works */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={600} color="primary.main" mb={3}>
              How It Works
            </Typography>
            <Stepper orientation="vertical">
              {steps.map((step) => (
                <Step key={step.label} active={true}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {step.icon}
                      </Box>
                    )}
                  >
                    <Typography fontWeight={600}>{step.label}</Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography color="text.secondary" mb={2}>
                      {step.description}
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card
          sx={{
            mb: 4,
            border: "1px solid",
            borderColor: "primary.light",
            backgroundColor: "#F0F4FF",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Security sx={{ color: "primary.main" }} />
              <Typography fontWeight={600} color="primary.main">
                Privacy Notice
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              This system collects a cryptographic hash of your fingerprint —
              not the fingerprint image itself. This hash is used solely to
              prevent duplicate votes and cannot be reverse-engineered back to
              your fingerprint. Your vote choice is stored separately and cannot
              be linked back to you after submission.
            </Typography>
          </CardContent>
        </Card>

        {/* CTA */}
        <Box textAlign="center">
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/vote")}
            startIcon={<HowToVote />}
            sx={{ px: 6, py: 1.5, fontSize: 18 }}
          >
            Start Voting
          </Button>
          <Typography variant="body2" color="text.secondary" mt={2}>
            By proceeding, you agree to the biometric data usage described above.
          </Typography>
        </Box>

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

export default LandingPage;