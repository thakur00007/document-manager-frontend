import React, { useEffect, useState, type JSX } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Loading } from "./";
import type { AuthState } from "../store/auth/authSlice";

interface AuthLayoutProps {
  authenicated?: boolean;
  children: React.ReactNode;
}

function AuthLayout({
  authenicated = true,
  children,
}: AuthLayoutProps): JSX.Element {
  const { status: authStatus }: AuthState = useSelector(
    (state: { auth: AuthState }) => state.auth
  );
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    if (authenicated && authStatus !== authenicated) {
      navigate("/signin");
      return;
    } else if (!authenicated && authStatus !== authenicated) {
      navigate("/dashboard");
      return;
    }
    setLoading(false);
  }, [authenicated, authStatus, navigate]);

  return <>{loading ? <Loading /> : children}</>;
}

export default AuthLayout;
