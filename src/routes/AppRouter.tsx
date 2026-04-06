import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/useAppDispatch";
import { ROUTES } from "./routes";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import Dashboard from "../pages/Dashboard/Dashboard";
import PageManagement from "../pages/Dashboard/PageManagement";
import Home from "../pages/Home/Home";
import Settings from "../pages/Settings/Settings";

function ProtectedRoute({ children }: { readonly children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />;
}

function Protected({ children }: { readonly children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />

        <Route path={ROUTES.DASHBOARD} element={<Protected><Dashboard /></Protected>} />
        <Route path={ROUTES.PAGES_MANAGEMENT} element={<Protected><PageManagement /></Protected>} />
        <Route path={ROUTES.PAGE_EDITOR} element={<Protected><Home /></Protected>} />
        <Route path={ROUTES.SETTINGS} element={<Protected><Settings /></Protected>} />

        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
