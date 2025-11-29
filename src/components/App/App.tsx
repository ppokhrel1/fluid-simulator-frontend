import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { AuthProvider, useAuth } from "~/contexts/AuthContext";
import { saveCurrentRoute } from "../../utils/stateUtils";

import ObjectInteractionApp from "../3dShapes/ImageInteraction";
import UserDashboard from "../Auth/UserDashboard";
import ComprehensiveBackendTester from "../common/ComprehensiveBackendTester";
import ErrorBoundary from "../common/ErrorBoundary";
import LoginPage from "../listings/LoginPage";
import ModelsListPage from "../listings/ModelsListing";
import { UpdateModelDemo } from "../listings/UploadModelDemo";
import UploadPage from "../listings/UploadPage";
import MainPageApp from "../ModelRender/mainPage";

import "./App.css";

import { GeometryProvider } from "~/contexts/GeometryContext";
import { ObjectStudioProvider } from "~/hooks/useObjectStudio";
import Simple3DViewer from "../robotics_loader/Simple3dViewer";
import GeometryProviderHome from "../simulation_outputs/home";

// ---------- TYPES ----------

export interface ModelData {
  id?: string | number;
  name?: string;
  url?: string;
  [key: string]: any;
}

// ---------- APP CONTENT ----------

const AppContent: React.FC = () => {
  const { loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    saveCurrentRoute(location.pathname);
  }, [location.pathname]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <div style={{ fontSize: 48 }}>🌊</div>
        <div style={{ fontSize: 18, marginTop: 10, color: "#0aa4ff" }}>
          Loading Fluid Simulator...
        </div>
        <div style={{ fontSize: 14, marginTop: 5, color: "#666" }}>
          Restoring your session
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MainPageApp />} />

      <Route
        path="/feed"
        element={
          <ModelsListPage
            onModelSelect={(model: ModelData) =>
              console.log("Model selected:", model)
            }
            onBackToMain={() => window.history.back()}
          />
        }
      />

      <Route path="/upload" element={<UploadPage />} />
      <Route path="/upload-demo" element={<UpdateModelDemo />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={<UserDashboard onBack={() => window.history.back()} />}
      />

      <Route path="/test-backend" element={<ComprehensiveBackendTester />} />

      <Route
        path="/developer"
        element={
          <ObjectStudioProvider>
            <ObjectInteractionApp />
          </ObjectStudioProvider>
        }
      />

      <Route path="/3d-viewer" element={<Simple3DViewer />} />

      <Route
        path="/simulations"
        element={
          <GeometryProvider>
            <GeometryProviderHome />
          </GeometryProvider>
        }
      />

      {/* 404 fallback example */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
};

// ---------- ROOT APP ----------

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
