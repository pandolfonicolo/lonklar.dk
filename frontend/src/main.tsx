
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { router } from "./app/routes";
import "./styles/index.css";

// Keep the useful server HTML visible while the initial lazy route loads.
const render = () => createRoot(document.getElementById("root")!).render(<App />);
if (router.state.initialized) render();
else {
  const unsubscribe = router.subscribe(state => {
    if (!state.initialized) return;
    unsubscribe();
    render();
  });
}
