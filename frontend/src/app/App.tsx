import { RouterProvider } from "react-router";
import { router } from "./routes";
import { I18nProvider } from "./utils/i18n";

export default function App() {
  return (
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>
  );
}
