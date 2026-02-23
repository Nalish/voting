import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { theme } from "./theme";
import PrivateRoute from "./components/PrivateRoute";

// Voter pages
import LandingPage from "./pages/voter/LandingPage";
import DeviceCheckPage from "./pages/voter/DeviceCheckPage";
import MobilePage from "./pages/voter/MobilePage";
import BallotPage from "./pages/voter/BallotPage";
import ConfirmationPage from "./pages/voter/ConfirmationPage";

// Admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ResultsPage from "./pages/admin/ResultsPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Voter routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/vote" element={<DeviceCheckPage />} />
          <Route path="/vote/mobile" element={<MobilePage />} />
          <Route path="/vote/ballot" element={<BallotPage />} />
          <Route path="/vote/confirmation" element={<ConfirmationPage />} />

          {/* Admin routes — protected */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/results"
            element={
              <PrivateRoute>
                <ResultsPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;