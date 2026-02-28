import { Navigate, BrowserRouter, Routes, Route } from "react-router-dom";
import { MachinesProvider } from "./context/MachinesContext";
import { AlertsProvider } from "./context/AlertsContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import MachineDetail from "./pages/MachineDetail";
import MachinesPage from "./pages/MachinesPage";
import ReportsPage from "./pages/ReportsPage";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import AuthPage from "./pages/AuthPage";
import AlertsPage from "./pages/AlertsPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import AboutPage from "./pages/AboutPage";
import FeaturesPage from "./pages/FeaturesPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import StatusPage from "./pages/StatusPage";
import StarField from "./components/StarField";

// Stars only in dark mode — needs to be inside ThemeProvider
function DarkStars() {
  const { isDark } = useTheme();
  return isDark ? <StarField /> : null;
}

// Redirect logged-in users away from /login
function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

// Redirect unauthenticated users to /login
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <>
      <DarkStars />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />

          {/* Protected routes — wrapped in both MachinesProvider and AlertsProvider */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MachinesProvider>
                <AlertsProvider>
                  <Dashboard />
                </AlertsProvider>
              </MachinesProvider>
            </ProtectedRoute>
          } />
          <Route path="/machine/:id" element={
            <ProtectedRoute>
              <MachinesProvider>
                <AlertsProvider>
                  <MachineDetail />
                </AlertsProvider>
              </MachinesProvider>
            </ProtectedRoute>
          } />
          <Route path="/alerts" element={
            <ProtectedRoute>
              <MachinesProvider>
                <AlertsProvider>
                  <AlertsPage />
                </AlertsProvider>
              </MachinesProvider>
            </ProtectedRoute>
          } />
          <Route path="/machines" element={
            <ProtectedRoute>
              <MachinesProvider>
                <AlertsProvider>
                  <MachinesPage />
                </AlertsProvider>
              </MachinesProvider>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <MachinesProvider>
                <AlertsProvider>
                  <ReportsPage />
                </AlertsProvider>
              </MachinesProvider>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />

          {/* Public info pages */}
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/status" element={<StatusPage />} />

          {/* Catch-all */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

