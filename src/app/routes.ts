import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Dashboard } from "./pages/Dashboard";
import { CapitalIntelligence } from "./pages/CapitalIntelligence";
import { Groups } from "./pages/Groups";
import { GroupDetail } from "./pages/GroupDetail";
import { ShuraBot } from "./pages/ShuraBot";
import { Wallet } from "./pages/Wallet";
import { Profile } from "./pages/Profile";
import { Marketplace } from "./pages/Marketplace";
import { MarketplaceDetail } from "./pages/MarketplaceDetail";
import { JoinGroup } from "./pages/JoinGroup";
import { CreateGroup } from "./pages/CreateGroup";
import { Contribute } from "./pages/Contribute";
import { NotFound } from "./pages/NotFound";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import OnboardingPage from "./pages/OnboardingPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  // Auth Routes (No protection)
  {
    path: "/auth/login",
    Component: LoginPage,
  },
  {
    path: "/auth/register",
    Component: RegisterPage,
  },
  // Onboarding (Requires auth but not full KYC)
  {
    path: "/onboarding",
    Component: () => (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
  // Protected Routes
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: () => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "capital-intelligence",
        Component: () => (
          <ProtectedRoute>
            <CapitalIntelligence />
          </ProtectedRoute>
        ),
      },
      {
        path: "groups",
        Component: () => (
          <ProtectedRoute>
            <Groups />
          </ProtectedRoute>
        ),
      },
      {
        path: "groups/create",
        Component: () => (
          <ProtectedRoute>
            <CreateGroup />
          </ProtectedRoute>
        ),
      },
      {
        path: "groups/:groupId",
        Component: () => (
          <ProtectedRoute>
            <GroupDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "groups/:groupId/contribute",
        Component: () => (
          <ProtectedRoute>
            <Contribute />
          </ProtectedRoute>
        ),
      },
      {
        path: "groups/:groupId/join",
        Component: () => (
          <ProtectedRoute>
            <JoinGroup />
          </ProtectedRoute>
        ),
      },
      {
        path: "marketplace",
        Component: () => (
          <ProtectedRoute>
            <Marketplace />
          </ProtectedRoute>
        ),
      },
      {
        path: "marketplace/:groupId",
        Component: () => (
          <ProtectedRoute>
            <MarketplaceDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "shurabot",
        Component: () => (
          <ProtectedRoute>
            <ShuraBot />
          </ProtectedRoute>
        ),
      },
      {
        path: "wallet",
        Component: () => (
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        Component: () => (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
