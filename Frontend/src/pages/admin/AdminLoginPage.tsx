import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  HowToVote,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth.api";

const AdminLoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const { token, admin } = await authApi.login(email, password);
      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_name", admin.name);
      localStorage.setItem("admin_email", admin.email);
      navigate("/admin/dashboard");
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (err.response?.status === 429) {
        setError("Too many login attempts. Please wait 15 minutes.");
      } else {
        setError("Login failed. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",               // ← full width
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header — full width */}
      <Box
        sx={{
          width: "100%",             // ← full width
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

      {/* Center the login card vertically and horizontally */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",        // ← vertical center
          justifyContent: "center",    // ← horizontal center
          py: 4,
          px: 2,
        }}
      >
        <Card sx={{ width: "100%", maxWidth: 480 }}>
          <CardContent sx={{ p: 5 }}>

            {/* Icon and Title */}
            <Box textAlign="center" mb={4}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  backgroundColor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <AdminPanelSettings sx={{ fontSize: 40, color: "white" }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                Admin Login
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Sign in to manage the election and view results
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Email Field */}
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "primary.main" }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              sx={{ mb: 4 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "primary.main" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Login Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleLogin}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <AdminPanelSettings />
                )
              }
              sx={{ py: 1.5, fontSize: 16, mb: 3 }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Security Note */}
            <Box
              sx={{
                backgroundColor: "#F0F4FF",
                borderRadius: 2,
                p: 2,
                border: "1px solid",
                borderColor: "primary.light",
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                This area is restricted to authorized election administrators
                only. All login attempts are logged and monitored.
              </Typography>
            </Box>

          </CardContent>
        </Card>
      </Box>

      {/* Footer — full width */}
      <Box
        sx={{
          width: "100%",             // ← full width
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

export default AdminLoginPage;