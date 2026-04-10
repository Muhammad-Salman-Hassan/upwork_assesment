import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { login } from "../store/slices/authSlice";
import { ROUTES } from "./routes";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import Dashboard from "../pages/Dashboard/Dashboard";
import PageManagement from "../pages/Dashboard/PageManagement";
import Home from "../pages/Home/Home";
import CreateOffer from "../pages/Offers/CreateOffer";
import Settings from "../pages/Settings/Settings";

function AuthRehydrator() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) return;
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");
    if (!token || !raw) return;
    try {
      const user = JSON.parse(raw);
      dispatch(login({
        id: user.id,
        username: user.username,
        email: user.meta?.email ?? "",
        fullname: user.meta?.fullname ?? "",
        phone: user.meta?.phone ?? "",
        role: user.meta?.role ?? "",
      }));
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [dispatch, isAuthenticated]);

  return null;
}

function ProtectedRoute({ children }: { readonly children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const hasToken = Boolean(localStorage.getItem("token"));
  return isAuthenticated || hasToken ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />;
}

function Protected({ children }: { readonly children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthRehydrator />
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />

        <Route path={ROUTES.DASHBOARD} element={<Protected><Dashboard /></Protected>} />
        <Route path={ROUTES.PAGES_MANAGEMENT} element={<Protected><PageManagement /></Protected>} />
        <Route path={ROUTES.PAGE_EDITOR} element={<Protected><Home /></Protected>} />
        <Route path={ROUTES.OFFERS} element={<Protected><CreateOffer /></Protected>} />
        <Route path={ROUTES.SETTINGS} element={<Protected><Settings /></Protected>} />

        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
