import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import BuildingDesignFormPage from './pages/BuildingDesignFormPage';
import SustainabilityAnalysisPage from './pages/SustainabilityAnalysisPage';
import AIRecommendationsPage from './pages/AIRecommendationsPage';
import DesignComparisonPage from './pages/DesignComparisonPage';
import DesignOptimizationPage from './pages/DesignOptimizationPage';
import ReportsPage from './pages/ReportsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create-project" element={<CreateProjectPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/create-design/:projectId" element={<BuildingDesignFormPage />} />
            <Route path="/analysis/:projectId" element={<SustainabilityAnalysisPage />} />
            <Route path="/recommendations/:designId" element={<AIRecommendationsPage />} />
            <Route path="/compare" element={<DesignComparisonPage />} />
            <Route path="/optimize" element={<DesignOptimizationPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:projectId" element={<ReportsPage />} />
            <Route path="/profile" element={<ProfileSettingsPage />} />
          </Route>

          {/* Auth Layout */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
