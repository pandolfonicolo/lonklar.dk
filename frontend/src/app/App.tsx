import { useEffect, useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { I18nProvider } from "./utils/i18n";
import { BuyMeACoffeeTab } from "./components/BuyMeACoffee";

export default function App() {
  const [initialized, setInitialized] = useState(router.state.initialized);
  // Listen for route changes and scroll to top
  useEffect(() => {
    const unsubscribe = router.subscribe(state => {
      setInitialized(state.initialized);
      window.scrollTo(0, 0);
    });
    return unsubscribe;
  }, []);

  return (
    <I18nProvider>
      {!initialized && <div role="status" className="min-h-[75vh] grid place-content-center text-center text-muted-foreground">LønKlar · Loading… / Indlæser…</div>}
      <RouterProvider router={router} />
      <BuyMeACoffeeTab />
    </I18nProvider>
  );
}
