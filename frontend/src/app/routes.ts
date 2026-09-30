import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/wizard/:serviceId",
    lazy: async () => ({ Component: (await import("./pages/Wizard")).Wizard }),
  },
  {
    path: "/results/:serviceId",
    lazy: async () => ({ Component: (await import("./pages/Results")).Results }),
  },
  {
    path: "/quick-overview",
    lazy: async () => ({ Component: (await import("./pages/QuickOverview")).QuickOverview }),
  },
  {
    path: "/how-it-works",
    lazy: async () => ({ Component: (await import("./pages/HowItWorks")).HowItWorks }),
  },
  {
    path: "/about",
    lazy: async () => ({ Component: (await import("./pages/About")).About }),
  },
  {
    path: "/contact",
    lazy: async () => ({ Component: (await import("./pages/Feedback")).Feedback }),
  },
  {
    path: "/admin/feedback",
    lazy: async () => ({ Component: (await import("./pages/AdminFeedback")).AdminFeedback }),
  },
  {
    path: "*",
    lazy: async () => ({ Component: (await import("./pages/NotFound")).NotFound }),
  },
]);
