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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "capital-intelligence", Component: CapitalIntelligence },
      { path: "groups", Component: Groups },
      { path: "groups/create", Component: CreateGroup },
      { path: "groups/:groupId", Component: GroupDetail },
      { path: "groups/:groupId/contribute", Component: Contribute },
      { path: "groups/:groupId/join", Component: JoinGroup },
      { path: "marketplace", Component: Marketplace },
      { path: "marketplace/:groupId", Component: MarketplaceDetail },
      { path: "shurabot", Component: ShuraBot },
      { path: "wallet", Component: Wallet },
      { path: "profile", Component: Profile },
      { path: "*", Component: NotFound },
    ],
  },
]);
