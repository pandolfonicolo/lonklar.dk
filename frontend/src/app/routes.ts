import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Wizard } from "./pages/Wizard";
import { Results } from "./pages/Results";
import { HowItWorks } from "./pages/HowItWorks";
import { QuickOverview } from "./pages/QuickOverview";
import { Feedback } from "./pages/Feedback";
import { About } from "./pages/About";
import { AdminFeedback } from "./pages/AdminFeedback";
import { NotFound } from "./pages/NotFound";

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
    path: "/how-it-works",
    Component: HowItWorks,
  },
  {
    path: "/about",
    Component: About,
  },
  {
    path: "/contact",
    Component: Feedback,
  },
  {
    path: "/admin/feedback",
    Component: AdminFeedback,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);