import { useGetMeQuery } from "./features/auth/authApi";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";
import AdminRoutes from "./pages/admin/routes/AdminRoutes";

function App() {
  const { isLoading } = useGetMeQuery();

  // ⏳ wait until auth session check is complete
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-textPrimary font-medium animate-pulse">
          Checking session...
        </div>
      </div>
    );
  }

  return <>
    <AppRoutes />
    <AdminRoutes />
  </>
}

export default App;