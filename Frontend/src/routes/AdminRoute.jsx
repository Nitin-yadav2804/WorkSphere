import { useSelector } from "react-redux";
import PageLoading from "../components/ui/PageLoading";
import { Navigate, Outlet } from "react-router-dom";

function AdminRoute() {
  const { user, token } = useSelector(state => state.auth);

  if (token && !user) return <PageLoading>Loading account...</PageLoading>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;