import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Original TailAdmin pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";

// Setec pages
import SetecLogin from "./pages/Setec/Login";
import SetecDashboard from "./pages/Setec/Dashboard";
import Students from "./pages/Setec/Students";
import StaffPage from "./pages/Setec/Staff";
import Items from "./pages/Setec/Items";
import Borrowing from "./pages/Setec/Borrowing";
import Returns from "./pages/Setec/Returns";
import History from "./pages/Setec/History";

// Protected route — redirects to /setec/login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/setec/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* ── Setec Login (public) ── */}
          <Route path="/setec/login" element={<SetecLogin />} />

          {/* ── Setec Protected Pages ── */}
          <Route element={<AppLayout />}>
            <Route path="/setec" element={<ProtectedRoute><SetecDashboard /></ProtectedRoute>} />
            <Route path="/setec/students"  element={<ProtectedRoute><Students /></ProtectedRoute>} />
            <Route path="/setec/staff"     element={<ProtectedRoute><StaffPage /></ProtectedRoute>} />
            <Route path="/setec/items"     element={<ProtectedRoute><Items /></ProtectedRoute>} />
            <Route path="/setec/borrowing" element={<ProtectedRoute><Borrowing /></ProtectedRoute>} />
            <Route path="/setec/returns"   element={<ProtectedRoute><Returns /></ProtectedRoute>} />
            <Route path="/setec/history"   element={<ProtectedRoute><History /></ProtectedRoute>} />
          </Route>

          {/* ── Original TailAdmin pages ── */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            <Route path="/profile"       element={<UserProfiles />} />
            <Route path="/calendar"      element={<Calendar />} />
            <Route path="/blank"         element={<Blank />} />
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/basic-tables"  element={<BasicTables />} />
            <Route path="/alerts"        element={<Alerts />} />
            <Route path="/avatars"       element={<Avatars />} />
            <Route path="/badge"         element={<Badges />} />
            <Route path="/buttons"       element={<Buttons />} />
            <Route path="/images"        element={<Images />} />
            <Route path="/videos"        element={<Videos />} />
            <Route path="/line-chart"    element={<LineChart />} />
            <Route path="/bar-chart"     element={<BarChart />} />
          </Route>

          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*"       element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
