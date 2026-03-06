import { useState } from "react";
import { useLoginMutation } from "../features/auth/authApi";
import { useDispatch } from "react-redux";
import { setUser } from "../features/auth/authSlice";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";


const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [login, { isLoading, error }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/"} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setUser(res.user));
      if (res.user.role === "admin") {
        console.log("admin logged in");
        navigate("/admin");
      } else {
        console.log("user logged in");
        navigate("/");
      }
    } catch (err) {
      // handled via RTK Query error
      console.error("Login failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card>
        <div className="w-[360px] space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-textPrimary">
              Welcome Back
            </h1>
            <p className="text-sm text-textMuted mt-1">
              Login to continue shopping
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="text-sm text-danger">
                Invalid email or password
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Login;