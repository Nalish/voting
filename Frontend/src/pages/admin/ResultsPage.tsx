import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Typography,
    Grid,
    Alert,
    CircularProgress,
    Divider,
    Chip,
    IconButton,
    Tooltip,
    LinearProgress,
} from "@mui/material";
import {
    HowToVote,
    AdminPanelSettings,
    Refresh,
    Logout,
    EmojiEvents,
    Person,
    ArrowBack,
    Schedule,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { voteApi } from "../../api/vote.api";
import type { VoteCount } from "../../types";

// Candidate colors for chart bars
const CANDIDATE_COLORS = [
    "#1F3864",
    "#2E5FA3",
    "#4CAF50",
    "#FF9800",
    "#E91E63",
];

const ResultsPage = () => {
    const navigate = useNavigate();

    const [results, setResults] = useState<VoteCount[]>([]);
    const [totalVotes, setTotalVotes] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [lastUpdated, setLastUpdated] = useState<string>("");

    const adminName = localStorage.getItem("admin_name") || "Admin";
    const token = localStorage.getItem("admin_token") || "";

    // Fetch results
    const fetchResults = async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            setError("");

            const data = await voteApi.getResults(token);

            // Sort by vote count descending
            const sorted = [...data.results].sort(
                (a, b) => Number(b.count) - Number(a.count)
            );

            setResults(sorted);
            setTotalVotes(data.total);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (err: any) {
            if (err.response?.status === 401) {
                handleLogout();
            } else {
                setError("Failed to load results. Please refresh.");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Auto refresh every 30 seconds
    useEffect(() => {
        fetchResults();
        const interval = setInterval(() => fetchResults(true), 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_name");
        localStorage.removeItem("admin_email");
        navigate("/admin/login");
    };

    // Calculate percentage for each candidate
    const getPercentage = (count: number): number => {
        if (totalVotes === 0) return 0;
        return Math.round((count / totalVotes) * 100);
    };

    // Get winner — first in sorted array
    const winner = results.length > 0 ? results[0] : null;

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
                    py: 2,
                    px: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <HowToVote sx={{ color: "white", fontSize: 36 }} />
                <Typography variant="h5" fontWeight={700} color="white" flex={1}>
                    Company Voting System
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" color="white" fontWeight={600}>
                        {adminName}
                    </Typography>
                    <Chip
                        label="Admin"
                        icon={<AdminPanelSettings sx={{ color: "white !important" }} />}
                        sx={{
                            backgroundColor: "rgba(255,255,255,0.2)",
                            color: "white",
                            fontWeight: 600,
                        }}
                    />
                    <Tooltip title="Logout">
                        <IconButton onClick={handleLogout} sx={{ color: "white" }}>
                            <Logout />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Container maxWidth={false} sx={{ py: 5, px: 6, flex: 1 }}>

                {/* Page Title */}
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={4}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton
                            onClick={() => navigate("/admin/dashboard")}
                            sx={{
                                backgroundColor: "primary.main",
                                color: "white",
                                "&:hover": { backgroundColor: "primary.dark" },
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" fontWeight={700} color="primary.main">
                                Election Results
                            </Typography>
                            <Typography color="text.secondary">
                                Company Leadership Election 2026 — Live Results
                            </Typography>
                        </Box>
                    </Box>
                    <Box display="flex" gap={2} alignItems="center">
                        {lastUpdated && (
                            <Box display="flex" alignItems="center" gap={1}>
                                <Schedule sx={{ fontSize: 16, color: "text.secondary" }} />
                                <Typography variant="body2" color="text.secondary">
                                    Updated: {lastUpdated}
                                </Typography>
                            </Box>
                        )}
                        <Tooltip title="Refresh Results">
                            <IconButton
                                onClick={() => fetchResults(true)}
                                disabled={refreshing}
                                sx={{
                                    backgroundColor: "primary.main",
                                    color: "white",
                                    "&:hover": { backgroundColor: "primary.dark" },
                                }}
                            >
                                {refreshing ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    <Refresh />
                                )}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Error */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Loading */}
                {loading ? (
                    <Box textAlign="center" mt={10}>
                        <CircularProgress size={60} />
                        <Typography mt={2} color="text.secondary">
                            Loading results...
                        </Typography>
                    </Box>
                ) : (
                    <>

                        {/* Total votes summary */}
                        <Grid container spacing={3} mb={4}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Card
                                    sx={{
                                        backgroundColor: "primary.main",
                                        color: "white",
                                        height: "100%",
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <HowToVote sx={{ color: "white" }} />
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "rgba(255,255,255,0.8)" }}
                                                fontWeight={600}
                                            >
                                                Total Votes Cast
                                            </Typography>
                                        </Box>
                                        <Typography variant="h3" fontWeight={700} color="white">
                                            {totalVotes}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "rgba(255,255,255,0.7)" }}
                                        >
                                            Across all candidates
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Card sx={{ height: "100%" }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <EmojiEvents sx={{ color: "#FF9800" }} />
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                fontWeight={600}
                                            >
                                                Current Leader
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="h5"
                                            fontWeight={700}
                                            color="primary.main"
                                        >
                                            {winner ? winner.choice : "No votes yet"}
                                        </Typography>
                                        {winner && (
                                            <Typography variant="body2" color="text.secondary">
                                                {winner.count} votes —{" "}
                                                {getPercentage(Number(winner.count))}% of total
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Card sx={{ height: "100%" }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <Person sx={{ color: "primary.main" }} />
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                fontWeight={600}
                                            >
                                                Candidates
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="h3"
                                            fontWeight={700}
                                            color="primary.main"
                                        >
                                            {results.length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            With votes recorded
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Results Breakdown */}
                        <Card sx={{ mb: 4 }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    mb={3}
                                >
                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                        color="primary.main"
                                    >
                                        Vote Breakdown
                                    </Typography>
                                    <Chip
                                        label="Live"
                                        sx={{
                                            backgroundColor: "#E8F5E9",
                                            color: "#2E7D32",
                                            fontWeight: 700,
                                            animation: "pulse 2s infinite",
                                        }}
                                    />
                                </Box>
                                <Divider sx={{ mb: 3 }} />

                                {results.length === 0 ? (
                                    <Box textAlign="center" py={4}>
                                        <HowToVote
                                            sx={{ fontSize: 60, color: "grey.300", mb: 2 }}
                                        />
                                        <Typography color="text.secondary">
                                            No votes have been cast yet.
                                        </Typography>
                                    </Box>
                                ) : (
                                    results.map((result, index) => {
                                        const percentage = getPercentage(Number(result.count));
                                        const isWinner = index === 0;
                                        const color =
                                            CANDIDATE_COLORS[index % CANDIDATE_COLORS.length];

                                        return (
                                            <Box key={result.choice} mb={4}>
                                                {/* Candidate row */}
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="space-between"
                                                    mb={1}
                                                >
                                                    <Box display="flex" alignItems="center" gap={1.5}>
                                                        {/* Rank */}
                                                        <Box
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                borderRadius: "50%",
                                                                backgroundColor: isWinner
                                                                    ? "#FF9800"
                                                                    : color,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {isWinner ? (
                                                                <EmojiEvents
                                                                    sx={{ fontSize: 18, color: "white" }}
                                                                />
                                                            ) : (
                                                                <Typography
                                                                    fontWeight={700}
                                                                    color="white"
                                                                    fontSize={14}
                                                                >
                                                                    {index + 1}
                                                                </Typography>
                                                            )}
                                                        </Box>

                                                        {/* Name */}
                                                        <Typography fontWeight={700} fontSize={16}>
                                                            {result.choice}
                                                        </Typography>

                                                        {/* Winner badge */}
                                                        {isWinner && totalVotes > 0 && (
                                                            <Chip
                                                                label="Leading"
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: "#FFF3E0",
                                                                    color: "#E65100",
                                                                    fontWeight: 700,
                                                                    fontSize: 11,
                                                                }}
                                                            />
                                                        )}
                                                    </Box>

                                                    {/* Vote count and percentage */}
                                                    <Box textAlign="right">
                                                        <Typography fontWeight={700} color={color}>
                                                            {result.count} votes
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            {percentage}%
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {/* Progress bar */}
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={percentage}
                                                    sx={{
                                                        height: 12,
                                                        borderRadius: 6,
                                                        backgroundColor: "#F0F4FF",
                                                        "& .MuiLinearProgress-bar": {
                                                            backgroundColor: isWinner ? "#FF9800" : color,
                                                            borderRadius: 6,
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        );
                                    })
                                )}
                            </CardContent>
                        </Card>

                        {/* Winner Announcement */}
                        {winner && totalVotes > 0 && (
                            <Card
                                sx={{
                                    mb: 4,
                                    border: "2px solid",
                                    borderColor: "#FF9800",
                                    backgroundColor: "#FFF8E1",
                                }}
                            >
                                <CardContent sx={{ p: 4, textAlign: "center" }}>
                                    <EmojiEvents
                                        sx={{ fontSize: 60, color: "#FF9800", mb: 1 }}
                                    />
                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                        color="#E65100"
                                        mb={1}
                                    >
                                        Current Leader
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        fontWeight={700}
                                        color="primary.main"
                                        mb={1}
                                    >
                                        {winner.choice}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {winner.count} votes —{" "}
                                        {getPercentage(Number(winner.count))}% of total votes cast
                                    </Typography>
                                    <Alert severity="info" sx={{ mt: 3, textAlign: "left" }}>
                                        <Typography variant="body2">
                                            This is a live count and may change as more votes are
                                            cast. Final results will be confirmed once polls close.
                                        </Typography>
                                    </Alert>
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <Box display="flex" gap={2}>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBack />}
                                onClick={() => navigate("/admin/dashboard")}
                                size="large"
                            >
                                Back to Dashboard
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Refresh />}
                                onClick={() => fetchResults(true)}
                                disabled={refreshing}
                                size="large"
                            >
                                Refresh Results
                            </Button>
                        </Box>

                    </>
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

export default ResultsPage;
