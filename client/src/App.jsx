import { useRoutes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GuardDashboard from './pages/GuardDashboard';
import ProfilePage from './pages/ProfilePage';

function App() {
  const routes = useRoutes([
    // ── Routes WITHOUT Global Navbar/Footer ── 
    { index: true, element: <Home /> },
    { path: "login", element: <Login /> },
    { path: "register", element: <RegisterPage /> },

    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "admin", element: <AdminDashboard /> },
        { path: "student", element: <StudentDashboard /> },
        { path: "guard", element: <GuardDashboard /> },
        { path: "profile", element: <ProfilePage /> },
        // Fallback or alias for old dashboard link
        { path: "dashboard", element: <StudentDashboard /> },
      ],
    },
  ]);

  return (
    <AuthProvider>
      {routes}
    </AuthProvider>
  );
}

export default App;
