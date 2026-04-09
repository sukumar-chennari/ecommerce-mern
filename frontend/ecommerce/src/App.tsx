import { useGetMeQuery } from "./features/auth/authApi";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { useNotificationListener } from "./components/ui/useNotificationListener";


function App() {
  const { isLoading } = useGetMeQuery();
  useNotificationListener();
  console.log("app rendered");
  // ⏳ wait until auth session check is complete
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-textPrimary font-medium animate-pulse">
            Checking session...
          </div>
        </div>
      ) : (
        <AppRoutes />
      )}
    </>
  );
}

export default App;