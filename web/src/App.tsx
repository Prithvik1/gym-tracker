import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TrainingLevel from './pages/TrainingLevel';
import Home from './pages/Home';
import LogWorkout from './pages/LogWorkout';
import WorkoutHistory from './pages/WorkoutHistory';
import SplitInsights from './pages/SplitInsights';
import Coach from './pages/Coach';
import Profile from './pages/Profile';

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to={user.training_level ? '/' : '/training-level'} replace />;
  return children;
}

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.training_level) return <Navigate to="/" replace />;
  return children;
}

function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.training_level) return <Navigate to="/training-level" replace />;
  return <Layout />;
}

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="center-page">
        <span className="spinner" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestOnly>
            <Signup />
          </GuestOnly>
        }
      />
      <Route
        path="/training-level"
        element={
          <RequireOnboarding>
            <TrainingLevel />
          </RequireOnboarding>
        }
      />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Home />} />
        <Route path="/log" element={<LogWorkout />} />
        <Route path="/history" element={<WorkoutHistory />} />
        <Route path="/insights" element={<SplitInsights />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
