import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import FindChefsPage from "./pages/FindChefsPage";
import ProfilePage from "./pages/ProfilePage";
import MenuPage from "./pages/MenuPage";
import CreateMenuPage from "./pages/CreateMenuPage";
import MenuDetailsPage from "./pages/MenuDetailsPage";
import ChefSubscriptionsPage from "./pages/ChefSubscriptionsPage";
import MySubscriptionsPage from "./pages/MySubscriptionsPage";
import SubscriptionDetailsPage from "./pages/SubscriptionDetailsPage";
import ChefMenusPage from "./pages/ChefMenusPage";

import { useAuthStore } from "./store/authStore";
import LoadingSpinner from "./components/LoadingSpinner";
// handling logged out user to protect routes
const ProtectRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};
// handling logged in user to protect routes
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const { checkAuth, isCheckingAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log("isAuthenticated", isAuthenticated);
  console.log("user", user);
  if (isCheckingAuth) return <LoadingSpinner />;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 relative overflow-hidden">
      <Routes>
        <Route
          path="/"
          element={
            <ProtectRoute>
              <HomePage />
            </ProtectRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectAuthenticatedUser>
              <SignUpPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectAuthenticatedUser>
              <LoginPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route
          path="/forgot-password"
          element={
            <RedirectAuthenticatedUser>
              <ForgotPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticatedUser>
              <ResetPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/find-chefs"
          element={
            <ProtectRoute>
              <FindChefsPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectRoute>
              <ProfilePage />
            </ProtectRoute>
          }
        />
        <Route
          path="/menus"
          element={
            <ProtectRoute>
              <MenuPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/menus/new"
          element={
            <ProtectRoute>
              <CreateMenuPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/menus/:menuId"
          element={
            <ProtectRoute>
              <MenuDetailsPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/chef/subscriptions"
          element={
            <ProtectRoute>
              <ChefSubscriptionsPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/my-subscriptions"
          element={
            <ProtectRoute>
              <MySubscriptionsPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/subscriptions/:subscriptionId"
          element={
            <ProtectRoute>
              <SubscriptionDetailsPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/chefs/:chefId/menus"
          element={
            <ProtectRoute>
              <ChefMenusPage />
            </ProtectRoute>
          }
        />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
