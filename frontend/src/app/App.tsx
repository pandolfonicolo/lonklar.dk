import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { I18nProvider } from "./utils/i18n";
import { BuyMeACoffeeTab } from "./components/BuyMeACoffee";
import { FreshnessProvider } from "./utils/freshness";
import { DataFreshness } from "./components/DataFreshness";

export default function App() {
  // Listen for route changes and scroll to top
  useEffect(() => {
    const unsubscribe = router.subscribe(() => {
      window.scrollTo(0, 0);
    });
    return unsubscribe;
  }, []);

  return (
    <I18nProvider>
      <FreshnessProvider>
        <RouterProvider router={router} />
        <footer className="border-t border-border bg-secondary/20 px-4 py-5 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto"><DataFreshness /></div>
        </footer>
        <BuyMeACoffeeTab />
      </FreshnessProvider>
    </I18nProvider>
  );
}
