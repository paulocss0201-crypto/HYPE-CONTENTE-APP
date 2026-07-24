import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useBrandStore } from "@/store/brandStore";

export function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequireOnboarding() {
  const onboardingComplete = useBrandStore((s) => s.profile.onboardingComplete);
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

export function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingComplete = useBrandStore((s) => s.profile.onboardingComplete);
  if (isAuthenticated) return <Navigate to={onboardingComplete ? "/" : "/onboarding"} replace />;
  return <>{children}</>;
}
