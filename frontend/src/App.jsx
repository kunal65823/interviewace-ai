import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MarketingLayout from '@/layouts/MarketingLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ProtectedRoute, AdminRoute, GuestRoute } from '@/components/ProtectedRoute';

// Marketing pages
import LandingPage from '@/pages/LandingPage';
import FeaturesPage from '@/pages/FeaturesPage';
import PricingPage from '@/pages/PricingPage';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// App pages
import DashboardPage from '@/pages/DashboardPage';
import ResumeAnalyzerPage from '@/pages/ResumeAnalyzerPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import RoadmapPage from '@/pages/RoadmapPage';
import ReportsPage from '@/pages/ReportsPage';
import ProfilePage from '@/pages/ProfilePage';

// Mock interview pages
import MockInterviewSetupPage from '@/pages/mockInterview/MockInterviewSetupPage';
import MockInterviewSessionPage from '@/pages/mockInterview/MockInterviewSessionPage';
import MockInterviewResultsPage from '@/pages/mockInterview/MockInterviewResultsPage';

// Admin pages
import AdminPanelPage from '@/pages/admin/AdminPanelPage';

// Misc
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      {/* Marketing routes */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Route>

      {/* Guest-only auth routes */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Reset password is accessible regardless of auth state (recovery link) */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected dashboard routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
          <Route path="/mock-interview" element={<MockInterviewSetupPage />} />
          <Route path="/mock-interview/session/:id" element={<MockInterviewSessionPage />} />
          <Route path="/mock-interview/results/:id" element={<MockInterviewResultsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanelPage />} />
          </Route>
        </Route>
      </Route>

      {/* Redirects */}
      <Route path="/home" element={<Navigate to="/" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
