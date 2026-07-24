import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth, RequireOnboarding, RedirectIfAuthenticated } from "@/router/guards";

import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { Onboarding } from "@/pages/Onboarding";
import { Dashboard } from "@/pages/Dashboard";
import { CreateContent } from "@/pages/CreateContent";
import { ReelsGenerator } from "@/pages/generators/ReelsGenerator";
import { CarouselGenerator } from "@/pages/generators/CarouselGenerator";
import { StoriesGenerator } from "@/pages/generators/StoriesGenerator";
import { Repurpose } from "@/pages/Repurpose";
import { Ideas } from "@/pages/Ideas";
import { CalendarPage } from "@/pages/Calendar";
import { KanbanPage } from "@/pages/Kanban";
import { DesignHub } from "@/pages/DesignHub";
import { DesignStudio } from "@/pages/DesignStudio";
import { Projects } from "@/pages/Projects";
import { Brand } from "@/pages/Brand";
import { Favorites } from "@/pages/Favorites";
import { Plans } from "@/pages/Plans";
import { Settings } from "@/pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <Login />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuthenticated>
              <Register />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <RedirectIfAuthenticated>
              <ForgotPassword />
            </RedirectIfAuthenticated>
          }
        />

        <Route element={<RequireAuth />}>
          <Route path="/onboarding" element={<Onboarding />} />

          <Route element={<RequireOnboarding />}>
            <Route path="/design/studio/:id" element={<DesignStudio />} />

            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<CreateContent />} />
              <Route path="/create/reels" element={<ReelsGenerator />} />
              <Route path="/create/carousel" element={<CarouselGenerator />} />
              <Route path="/create/stories" element={<StoriesGenerator />} />
              <Route path="/repurpose" element={<Repurpose />} />
              <Route path="/ideas" element={<Ideas />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/organizacao" element={<KanbanPage />} />
              <Route path="/design" element={<DesignHub />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/brand" element={<Brand />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
