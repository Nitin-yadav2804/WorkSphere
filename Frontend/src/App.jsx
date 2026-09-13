import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";
import { getProfile } from "./services/authService";
import { setCredentials, logout } from "./store/authSlice";

function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;

      try {
        const response = await getProfile();

        dispatch(
          setCredentials({
            token,
            user: response.user,
          })
        );
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error.response?.data || error.message
        );

        dispatch(logout());
      }
    };

    loadProfile();
  }, [token, dispatch]);

  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;