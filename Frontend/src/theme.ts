import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1F3864",       // dark blue — professional, trustworthy
      light: "#2E5FA3",
      dark: "#152847",
    },
    secondary: {
      main: "#4CAF50",       // green — success, vote confirmed
    },
    error: {
      main: "#D32F2F",
    },
    background: {
      default: "#F5F8FF",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 24px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        },
      },
    },
  },
});