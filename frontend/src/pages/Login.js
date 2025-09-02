import React from "react";
import AuthForm from "../components/AuthForm.js";

const Login = () => {
  const handleLogin = (data) => {
    console.log("Logging in:", data);
  };

  return (
    <AuthForm type="login" onSubmit={handleLogin} />
  );
};

export default Login;
