import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import MasaDepanPage from './pages/MasaDepanPage';
import ProfilPage from './pages/ProfilPage';
import TutorialPage from './pages/TutorialPage';
import QuizPlayPage from './pages/QuizPlayPage';
import UsahaPage from './pages/UsahaPage';
import TipsUsahaPage from './pages/TipsUsahaPage';
import TipsKeuanganPage from './pages/TipsKeuanganPage';
import KalkulatorUsahaPage from './pages/KalkulatorUsahaPage';
import Beranda from './pages/beranda';

import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageContentPage from './pages/admin/ManageContentPage';
import ManageQuizPage from './pages/admin/ManageQuizPage';
import ManageUserPage from './pages/admin/ManageUserPage';
import ManageAdminPage from './pages/admin/ManageAdminPage';
import ManageVideoTutorialPage from './pages/admin/ManageVideoTutorialPage';
import BosniaPage from './pages/bosnia';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

function UserRouteGuard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout />;
}

/* Redirect ke /dashboard jika sudah login, tampil Beranda jika belum */
const Home = () => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Beranda />;
};

/* Redirect ke /dashboard jika sudah login, tampil login jika belum */
const LoginGuard = () => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#1C1F3A',
                  color: '#E8E8F0',
                  border: '1px solid rgba(108,99,255,0.25)',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  fontSize: '13px',
                  fontWeight: '600',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                },
                success: {
                  iconTheme: { primary: '#00E676', secondary: '#1C1F3A' },
                  style: {
                    border: '1px solid rgba(0,230,118,0.3)',
                  },
                },
                error: {
                  iconTheme: { primary: '#FF5252', secondary: '#1C1F3A' },
                  style: {
                    border: '1px solid rgba(255,82,82,0.3)',
                  },
                },
                loading: {
                  iconTheme: { primary: '#6C63FF', secondary: '#1C1F3A' },
                },
              }}
            />
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginGuard />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Public & Guest Access Pages */}
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
              </Route>

              {/* Protected User Pages */}
              <Route element={<UserRouteGuard />}>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/masa-depan" element={<MasaDepanPage />} />
                <Route path="/tutorial" element={<TutorialPage />} />
                <Route path="/usaha" element={<UsahaPage />} />
                <Route path="/usaha/memulai" element={<TipsUsahaPage />} />
                <Route path="/usaha/keuangan" element={<TipsKeuanganPage />} />
                <Route path="/usaha/kalkulator" element={<KalkulatorUsahaPage />} />
                <Route path="/profil" element={<ProfilPage />} />
                <Route path="/quiz/:id" element={<QuizPlayPage />} />
              </Route>

              {/* Admin Pages */}
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<ManageUserPage />} />
                <Route path="/admin/admins" element={<ManageAdminPage />} />
                <Route path="/admin/lowongan" element={<ManageContentPage kategoriProp="lowongan" />} />
                <Route path="/admin/tutorial" element={<ManageContentPage kategoriProp="tutorial" />} />
                <Route path="/admin/video-tutorials" element={<ManageVideoTutorialPage />} />
                <Route path="/admin/usaha" element={<ManageContentPage kategoriProp="usaha" />} />
                <Route path="/admin/keuangan" element={<ManageContentPage kategoriProp="keuangan" />} />
                <Route path="/admin/kuis" element={<ManageQuizPage />} />
              </Route>

              {/* Secret page */}
              <Route path="/WhyWouldYouCheckThisPageMate" element={<BosniaPage />} />

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
