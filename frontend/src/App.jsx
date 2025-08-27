// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import DashBoard from "./pages/DashBoard";
import JoinGames from "./pages/JoinGames";
import CreateGames from "./pages/CreateGames";
import Layout from "./components/Layout";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

function ProtectedRoute({ children }) {
  const { user } = useUser();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`http://localhost:8080/dashboard/${user.id}`);
        setProfile(res.data.profile);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  if (!profile?.name && location.pathname !== "/profile") {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

function App() {
  return (
   <Layout>
    <Routes>
      {/* Login Page */}
      <Route path="/login" element={<LoginPage />} />

      {/* Profile Page */}
      <Route
        path="/profile"
        element={
            <Layout>
          
            <ProfilePage />
          </Layout>
        }
      />

      {/* Protected Routes with Navbar */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
          
              <HomePage />
            
            
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            
              <DashBoard />
            
          </ProtectedRoute>
        }
      />

      <Route
        path="/joingame"
        element={
          <ProtectedRoute>
            
              <JoinGames />
            
          </ProtectedRoute>
        }
      />

      <Route
        path="/creategame"
        element={
          <ProtectedRoute>
           
              <CreateGames />
            
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </Layout>
    
    
  );
}

export default App;
