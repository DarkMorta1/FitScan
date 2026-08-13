import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute, PublicRoute, OnboardingRoute } from '@/components/layout/ProtectedRoute';

import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import OnboardingPage from '@/pages/OnboardingPage';
import DashboardPage from '@/pages/DashboardPage';
import FoodSearchPage from '@/pages/FoodSearchPage';
import FoodDetailPage from '@/pages/FoodDetailPage';
import FoodScannerPage from '@/pages/FoodScannerPage';
import MenuScannerPage from '@/pages/MenuScannerPage';
import ResultPage from '@/pages/ResultPage';
import RecommendationsPage from '@/pages/RecommendationsPage';
import MealHistoryPage from '@/pages/MealHistoryPage';
import WorkoutsPage from '@/pages/WorkoutsPage';
import ProgressPage from '@/pages/ProgressPage';
import SettingsPage from '@/pages/SettingsPage';
import AdminPage from '@/pages/AdminPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
              </Route>

              <Route element={<OnboardingRoute />}>
                <Route path="/onboarding" element={<OnboardingPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/foods" element={<FoodSearchPage />} />
                  <Route path="/foods/:id" element={<FoodDetailPage />} />
                  <Route path="/scanner" element={<FoodScannerPage />} />
                  <Route path="/menu-scanner" element={<MenuScannerPage />} />
                  <Route path="/results/:id" element={<ResultPage />} />
                  <Route path="/recommendations" element={<RecommendationsPage />} />
                  <Route path="/meals" element={<MealHistoryPage />} />
                  <Route path="/workouts" element={<WorkoutsPage />} />
                  <Route path="/progress" element={<ProgressPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute adminOnly />}>
                <Route element={<AppLayout />}>
                  <Route path="/admin" element={<AdminPage />} />
                </Route>
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
