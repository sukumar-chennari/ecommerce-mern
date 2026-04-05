import { useGetMeQuery } from "./features/auth/authApi";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { useNotificationListener } from "./components/ui/useNotificationListener";


function App() {
  const { isLoading } = useGetMeQuery();
  useNotificationListener();
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
    <Toaster position="top-right" reverseOrder={false} />

    <AppRoutes />
  </>
}

export default App;