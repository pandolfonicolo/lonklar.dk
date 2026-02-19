import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { I18nProvider } from "./utils/i18n";
import { BuyMeACoffeeTab } from "./components/BuyMeACoffee";

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
      <RouterProvider router={router} />
      <BuyMeACoffeeTab />
    </I18nProvider>
  );
}
