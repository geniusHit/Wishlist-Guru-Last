import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Routes from "./Routes";

import { QueryProvider, PolarisProvider } from "./components";
import MyRoutes from "./pages/MyRoutes";
import "./pages/MyStyle.css"
import "./pages/custom-Style.css";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  const { t } = useTranslation();

  return (
    <PolarisProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}>
        <QueryProvider>
          {/* <NavMenu> */}
          {/* <a href="/" rel="home" />
            <a href="/pagename">{t("NavigationMenu.pageName")}</a> */}

          <MyRoutes />

          {/* </NavMenu> */}
          <Routes pages={pages} />
        </QueryProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
