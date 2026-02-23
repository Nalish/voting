import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import {
  HowToVote,
  CheckCircle,
  Warning,
  Person,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { voteApi } from "../../api/vote.api";

// Define your candidates here
const CANDIDATES = [
  {
    id: "candidate_a",
    name: "John Smith",
    position: "Chief Executive Officer",
    department: "Executive",
  },
  {
    id: "candidate_b",
    name: "Sarah Johnson",
    position: "Head of Operations",
    department: "Operations",
  },
  {
    id: "candidate_c",
    name: "Michael Chen",
    position: "Director of Technology",
    department: "Technology",
  },
];

const BallotPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get sessionId and biometricId passed from DeviceCheckPage
  const { sessionId, biometricId } = location.state as {
    sessionId: string;
    biometricId: string;
  };

  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Guard — if no session or biometric, redirect back
  if (!sessionId || !biometricId) {
    navigate("/vote");
    return null;
  }

  const handleSubmit = () => {
    if (!selectedCandidate) {
      setError("Please select a candidate before submitting.");
      return;
    }
    setError("");
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);

      const candidate = CANDIDATES.find((c) => c.id === selectedCandidate);
      if (!candidate) throw new Error("Invalid candidate");

      const result = await voteApi.cast(
        sessionId,
        biometricId,
        candidate.name
      );

      // Navigate to confirmation with vote details
      navigate("/vote/confirmation", {
        state: {
          voteId: result.voteId,
          votedAt: result.votedAt,
          candidateName: candidate.name,
        },
      });
    } catch (err: any) {
      setConfirmOpen(false);
      if (err.response?.data?.message === "You have already voted") {
        setError("You have already cast a vote. Each employee can only vote once.");
      } else {
        setError("Failed to submit your vote. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCandidateData = CANDIDATES.find(
    (c) => c.id === selectedCandidate
  );

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
        <Box flex={1} />
        <Chip
          label="Identity Verified"
          icon={<CheckCircle />}
          sx={{
            backgroundColor: "secondary.main",
            color: "white",
            fontWeight: 600,
            "& .MuiChip-icon": { color: "white" },
          }}
        />
      </Box>

      <Container maxWidth={false} sx={{ py: 6, flex: 1, px: 6 }}>

        {/* Title */}
        <Box textAlign="center" mb={5}>
          <Typography variant="h4" fontWeight={700} color="primary.main" mb={1}>
            Official Ballot
          </Typography>
          <Typography color="text.secondary">
            Select one candidate and submit your vote. This action cannot be
            undone.
          </Typography>
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, maxWidth: 700, mx: "auto" }}>
            {error}
          </Alert>
        )}

        {/* Ballot Card */}
        <Card sx={{ maxWidth: 700, mx: "auto" }}>
          <CardContent sx={{ p: 4 }}>

            {/* Election title */}
            <Box
              sx={{
                backgroundColor: "primary.main",
                borderRadius: 2,
                p: 2,
                mb: 3,
                textAlign: "center",
              }}
            >
              <Typography variant="h6" fontWeight={700} color="white">
                Company Leadership Election 2026
              </Typography>
              <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                Select one candidate below
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Candidates */}
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={selectedCandidate}
                onChange={(e) => setSelectedCandidate(e.target.value)}
              >
                {CANDIDATES.map((candidate, index) => (
                  <Box key={candidate.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        mb: 2,
                        cursor: "pointer",
                        border: "2px solid",
                        borderColor:
                          selectedCandidate === candidate.id
                            ? "primary.main"
                            : "divider",
                        backgroundColor:
                          selectedCandidate === candidate.id
                            ? "#F0F4FF"
                            : "white",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "primary.light",
                          backgroundColor: "#F8FAFF",
                        },
                      }}
                      onClick={() => setSelectedCandidate(candidate.id)}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: "16px !important",
                        }}
                      >
                        {/* Candidate number */}
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            backgroundColor:
                              selectedCandidate === candidate.id
                                ? "primary.main"
                                : "grey.200",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            fontWeight={700}
                            color={
                              selectedCandidate === candidate.id
                                ? "white"
                                : "text.secondary"
                            }
                          >
                            {index + 1}
                          </Typography>
                        </Box>

                        {/* Candidate icon */}
                        <Person
                          sx={{
                            fontSize: 40,
                            color:
                              selectedCandidate === candidate.id
                                ? "primary.main"
                                : "grey.400",
                            flexShrink: 0,
                          }}
                        />

                        {/* Candidate info */}
                        <Box flex={1}>
                          <Typography fontWeight={700} fontSize={16}>
                            {candidate.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {candidate.position}
                          </Typography>
                          <Chip
                            label={candidate.department}
                            size="small"
                            sx={{
                              mt: 0.5,
                              backgroundColor: "#E8EDF8",
                              color: "primary.main",
                              fontWeight: 600,
                              fontSize: 11,
                            }}
                          />
                        </Box>

                        {/* Radio */}
                        <FormControlLabel
                          value={candidate.id}
                          control={
                            <Radio
                              sx={{
                                color: "primary.main",
                                "&.Mui-checked": {
                                  color: "primary.main",
                                },
                              }}
                            />
                          }
                          label=""
                          sx={{ mr: 0 }}
                        />
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            {/* Warning */}
            <Alert
              severity="warning"
              icon={<Warning />}
              sx={{ mb: 3 }}
            >
              <Typography fontWeight={600}>Important</Typography>
              <Typography variant="body2">
                Once submitted, your vote cannot be changed or withdrawn.
                Please make sure you have selected the correct candidate.
              </Typography>
            </Alert>

            {/* Submit Button */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={!selectedCandidate}
              onClick={handleSubmit}
              startIcon={<HowToVote />}
              sx={{ py: 1.5, fontSize: 16 }}
            >
              Submit My Vote
            </Button>

          </CardContent>
        </Card>

      </Container>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => !submitting && setConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning sx={{ color: "warning.main" }} />
            <Typography fontWeight={700}>Confirm Your Vote</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography color="text.secondary" mb={3}>
            You are about to cast your vote for:
          </Typography>

          {selectedCandidateData && (
            <Card
              sx={{
                backgroundColor: "#F0F4FF",
                border: "2px solid",
                borderColor: "primary.main",
                mb: 3,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Person sx={{ fontSize: 48, color: "primary.main" }} />
                  <Box>
                    <Typography fontWeight={700} fontSize={18}>
                      {selectedCandidateData.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedCandidateData.position}
                    </Typography>
                    <Chip
                      label={selectedCandidateData.department}
                      size="small"
                      sx={{
                        mt: 0.5,
                        backgroundColor: "primary.main",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          <Alert severity="error">
            <Typography fontWeight={600}>This action is final</Typography>
            <Typography variant="body2">
              Once you confirm, your vote cannot be changed. Each employee
              can only vote once.
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setConfirmOpen(false)}
            disabled={submitting}
            fullWidth
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <HowToVote />
              )
            }
            fullWidth
            sx={{ backgroundColor: "secondary.main" }}
          >
            {submitting ? "Submitting..." : "Confirm Vote"}
          </Button>
        </DialogActions>
      </Dialog>

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

export default BallotPage;
