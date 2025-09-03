import React from "react";
import AuthForm from "../components/AuthForm.js";

const Register = () => {
  const handleSignup = (data) => {
    console.log('Signup data:', data);
    // Handle signup logic here
  };

  return <AuthForm type="signup" onSubmit={handleSignup} />;
};

export default Register;
