import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Divider,
  Alert,
  Chip,
} from "@mui/material";
import {
  CheckCircle,
  HowToVote,
  ContentCopy,
  Done,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Get vote details passed from BallotPage
  const { voteId, votedAt, candidateName } = location.state as {
    voteId: string;
    votedAt: string;
    candidateName: string;
  };

  // Guard — if no vote details, redirect back
  useEffect(() => {
    if (!voteId) {
      navigate("/");
    }
  }, [voteId]);

  // Format the voted time
  const formattedTime = new Date(votedAt).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Copy vote reference to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(voteId);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

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
        <HowToVote sx={{ color: "white", fontSize: 36 }} />
        <Typography variant="h5" fontWeight={700} color="white">
          Company Voting System
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ py: 8, flex: 1 }}>

        {/* Success Icon */}
        <Box textAlign="center" mb={4}>
          <CheckCircle
            sx={{
              fontSize: 100,
              color: "secondary.main",
              mb: 2,
            }}
          />
          <Typography variant="h4" fontWeight={700} color="secondary.main" mb={1}>
            Vote Cast Successfully!
          </Typography>
          <Typography color="text.secondary" fontSize={16}>
            Your vote has been securely recorded. Thank you for participating
            in the company election.
          </Typography>
        </Box>

        {/* Vote Details Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>

            <Typography
              variant="h6"
              fontWeight={700}
              color="primary.main"
              mb={3}
            >
              Vote Receipt
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Candidate voted for */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography color="text.secondary" fontWeight={500}>
                Voted For
              </Typography>
              <Chip
                label={candidateName}
                sx={{
                  backgroundColor: "primary.main",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Time voted */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={2}
            >
              <Typography color="text.secondary" fontWeight={500}>
                Time of Vote
              </Typography>
              <Typography
                fontWeight={600}
                textAlign="right"
                maxWidth={220}
                fontSize={14}
              >
                {formattedTime}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Vote reference */}
            <Box mb={1}>
              <Typography color="text.secondary" fontWeight={500} mb={1}>
                Vote Reference Number
              </Typography>
              <Box
                sx={{
                  backgroundColor: "#F5F8FF",
                  border: "1px solid",
                  borderColor: "primary.light",
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography
                  fontFamily="monospace"
                  fontSize={13}
                  color="primary.main"
                  sx={{
                    wordBreak: "break-all",
                    flex: 1,
                  }}
                >
                  {voteId}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleCopy}
                  startIcon={copied ? <Done /> : <ContentCopy />}
                  sx={{
                    flexShrink: 0,
                    borderColor: copied ? "secondary.main" : "primary.main",
                    color: copied ? "secondary.main" : "primary.main",
                    minWidth: 100,
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Save this reference number as proof your vote was recorded.
              </Typography>
            </Box>

          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography fontWeight={600} mb={0.5}>
            What happens next?
          </Typography>
          <Typography variant="body2">
            Votes will be counted once the election period closes. Results
            will be announced by the election administrator. Your vote is
            anonymous — it cannot be traced back to you.
          </Typography>
        </Alert>

        {/* Security Note */}
        <Card
          sx={{
            mb: 4,
            backgroundColor: "#F0F4FF",
            border: "1px solid",
            borderColor: "primary.light",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography fontWeight={600} color="primary.main" mb={1}>
              Your Vote is Secure
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your fingerprint biometric was used only to verify your identity
              and prevent duplicate votes. It is stored as a one-way hash and
              cannot be reversed. Your vote choice is stored separately and
              is not linked to your identity in any reports or exports.
            </Typography>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <Box textAlign="center">
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/")}
            startIcon={<HowToVote />}
            sx={{ px: 6 }}
          >
            Back to Home
          </Button>
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

export default ConfirmationPage;
