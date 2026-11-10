import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { I18nProvider } from "./utils/i18n";
import { BuyMeACoffeeTab } from "./components/BuyMeACoffee";
import { updatePageMeta } from "./utils/pageMeta";

export default function App() {
  // Listen for route changes and scroll to top
  useEffect(() => {
    updatePageMeta(router.state.location.pathname);
    const unsubscribe = router.subscribe(state => {
      updatePageMeta(state.location.pathname);
      window.scrollTo(0, 0);
    });
    return unsubscribe;
  }, []);

  return (
    <I18nProvider>
      <RouterProvider router={router} />
      <BuyMeACoffeeTab />
    </I18nProvider>
  );
}
