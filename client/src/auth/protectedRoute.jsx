import { Navigate } from "react-router-dom";
import { useAuth } from "./authContext";

/*
  ProtectedRoute component
  -Restricts access to specific routes based on user authentication and role
  -Redirects to the login page if the user is not logged in
  -Checks if the user’s role matches one of the allowedRoles
  -Redirects to the home page if the user doesn’t have permission
  -Renders the protected content (children) if access is granted
*/
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role?.toLowerCase();
  const allowed = allowedRoles.map((r) => r.toLowerCase());

  if (!allowed.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}