import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Wizard } from "./pages/Wizard";
import { Results } from "./pages/Results";
import { Methodology } from "./pages/Methodology";
import { QuickOverview } from "./pages/QuickOverview";
import { Feedback } from "./pages/Feedback";
import { NotFound } from "./pages/NotFound";
import { DesignSystemShowcase } from "./pages/DesignSystem";
import { StyleGuide } from "./pages/StyleGuide";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/wizard/:serviceId",
    Component: Wizard,
  },
  {
    path: "/results/:serviceId",
    Component: Results,
  },
  {
    path: "/quick-overview",
    Component: QuickOverview,
  },
  {
    path: "/methodology",
    Component: Methodology,
  },
  {
    path: "/feedback",
    Component: Feedback,
  },
  {
    path: "/design-system",
    Component: DesignSystemShowcase,
  },
  {
    path: "/style-guide",
    Component: StyleGuide,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);