import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const authToken = sessionStorage.getItem("authToken");

  if (!user || !authToken) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
