import { RouterProvider } from "react-router";
import { router } from "./routes";
import { I18nProvider } from "./utils/i18n";
import { BuyMeACoffeeTab } from "./components/BuyMeACoffee";

export default function App() {
  return (
    <I18nProvider>
      <RouterProvider router={router} />
      <BuyMeACoffeeTab />
    </I18nProvider>
  );
}
