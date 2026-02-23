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
} from "@mui/material";
import {
  HowToVote,
  AdminPanelSettings,
  BarChart,
  Refresh,
  Logout,
  CheckCircle,
  Schedule,
  People,
  TrendingUp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { voteApi } from "../../api/vote.api";

interface DashboardStats {
  totalVotes: number;
  lastUpdated: string;
}

const StatCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) => (
  <Card sx={{ height: "100%" }}>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            backgroundColor: `${color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ color }}>{icon}</Box>
        </Box>
      </Box>
      <Typography variant="h4" fontWeight={700} color={color} mb={0.5}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    totalVotes: 0,
    lastUpdated: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const adminName = localStorage.getItem("admin_name") || "Admin";
  const adminEmail = localStorage.getItem("admin_email") || "";
  const token = localStorage.getItem("admin_token") || "";

  // Fetch stats
  const fetchStats = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError("");

      const total = await voteApi.getCount(token);

      setStats({
        totalVotes: total,
        lastUpdated: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError("Failed to load dashboard data. Please refresh.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto refresh every 30 seconds
  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_name");
    localStorage.removeItem("admin_email");
    navigate("/admin/login");
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

        {/* Admin info */}
        <Box display="flex" alignItems="center" gap={2}>
          <Box textAlign="right">
            <Typography variant="body2" color="white" fontWeight={600}>
              {adminName}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
              {adminEmail}
            </Typography>
          </Box>
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
          <Box>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              Election Dashboard
            </Typography>
            <Typography color="text.secondary">
              Company Leadership Election 2026 — Live Overview
            </Typography>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            {stats.lastUpdated && (
              <Typography variant="body2" color="text.secondary">
                Last updated: {stats.lastUpdated}
              </Typography>
            )}
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={() => fetchStats(true)}
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
              Loading dashboard data...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Stat Cards */}
          <Grid container spacing={3} mb={4}>
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    <StatCard
      title="Total Votes Cast"
      value={stats.totalVotes}
      icon={<HowToVote />}
      color="#1F3864"
      subtitle="Votes recorded so far"
    />
  </Grid>
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    <StatCard
      title="Election Status"
      value="Active"
      icon={<CheckCircle />}
      color="#4CAF50"
      subtitle="Polls are currently open"
    />
  </Grid>
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    <StatCard
      title="Candidates"
      value={3}
      icon={<People />}
      color="#2E5FA3"
      subtitle="Running for election"
    />
  </Grid>
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    <StatCard
      title="Auto Refresh"
      value="30s"
      icon={<TrendingUp />}
      color="#FF9800"
      subtitle="Dashboard updates automatically"
    />
  </Grid>
</Grid>

            {/* Quick Actions */}
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="primary.main"
                  mb={3}
                >
                  Quick Actions
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<BarChart />}
                    onClick={() => navigate("/admin/results")}
                    sx={{ px: 4 }}
                  >
                    View Full Results
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Refresh />}
                    onClick={() => fetchStats(true)}
                    disabled={refreshing}
                    sx={{ px: 4 }}
                  >
                    Refresh Data
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    color="error"
                    startIcon={<Logout />}
                    onClick={handleLogout}
                    sx={{ px: 4 }}
                  >
                    Logout
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Election Info */}
          <Grid container spacing={3}>
  <Grid size={{ xs: 12, md: 6 }}>
    <Box mb={2}>
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={600}
        mb={0.5}
      >
        Election Name
      </Typography>
      <Typography fontWeight={600}>
        Company Leadership Election 2026
      </Typography>
    </Box>
    <Box mb={2}>
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={600}
        mb={0.5}
      >
        Voting Method
      </Typography>
      <Typography fontWeight={600}>
        Fingerprint Biometric Verification
      </Typography>
    </Box>
    <Box>
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={600}
        mb={0.5}
      >
        Status
      </Typography>
      <Chip
        label="Polls Open"
        icon={<CheckCircle />}
        sx={{
          backgroundColor: "#E8F5E9",
          color: "#2E7D32",
          fontWeight: 700,
          "& .MuiChip-icon": { color: "#2E7D32" },
        }}
      />
    </Box>
  </Grid>
  <Grid size={{ xs: 12, md: 6 }}>
    <Box mb={2}>
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={600}
        mb={0.5}
      >
        Security
      </Typography>
      <Typography fontWeight={600}>
        Biometric Hash + Duplicate Detection
      </Typography>
    </Box>
    <Box mb={2}>
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={600}
        mb={0.5}
      >
        Cross-Device Support
      </Typography>
      <Typography fontWeight={600}>
        QR Code Handoff for Laptops Without Sensors
      </Typography>
    </Box>
    <Box>
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={600}
        mb={0.5}
      >
        Auto Refresh
      </Typography>
      <Box display="flex" alignItems="center" gap={1}>
        <Schedule sx={{ fontSize: 18, color: "primary.main" }} />
        <Typography fontWeight={600}>
          Every 30 seconds
        </Typography>
      </Box>
    </Box>
  </Grid>
</Grid>

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

export default DashboardPage;
