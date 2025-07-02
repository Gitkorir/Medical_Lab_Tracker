import React, { useState } from "react";
import api from "../api";

// Registration form component
const RegisterForm = ({ onBack, onRegisterSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await api.post("/api/auth/register", { name, email, password });
      setSuccess("Registration successful! You can log in.");
      setTimeout(() => {
        setSuccess("");
        if (onRegisterSuccess) onRegisterSuccess();
        if (onBack) onBack();
      }, 1100);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
        err.response?.data?.error ||
        "Registration failed."
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 border p-6 rounded shadow bg-white bg-opacity-90">
      <h2 className="text-xl font-bold mb-4 text-center">📝 Register</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-700 mb-2">{success}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-2 rounded"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full border p-2 rounded"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Register
        </button>
      </form>
      <div className="text-center mt-4">
        <span>Already have an account?{" "}</span>
        <button
          type="button"
          className="text-blue-600 underline"
          onClick={onBack}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

const backgroundImageUrl =
  "https://imgs.search.brave.com/ch6C2IfZOuNlcCtIQYLNvkOYWTaBY3NIYDnpRbjQiT0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvOTA5/OTA4ODMwL3Bob3Rv/L21pY3Jvc2NvcGUt/d2l0aC1sYWItZ2xh/c3N3YXJlLmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz1wS2NS/QlN0MVpXTHJVa1R0/Y3VUZlZKUlJ1VU0t/V1UzR2Qzdzl0dTB2/LVBZPQ";

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/login", {
        email,
        password,
      });
      const token = res.data.access_token;
      localStorage.setItem("token", token);
      onLoginSuccess();
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Invalid credentials or server error.");
    }
  };

  if (showRegister) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <RegisterForm
          onBack={() => setShowRegister(false)}
          onRegisterSuccess={() => setShowRegister(false)}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-md w-full border p-6 rounded shadow bg-white bg-opacity-90">
        <h2 className="text-xl font-bold mb-4 text-center">🧑‍⚕️ Login</h2>
        {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Login
          </button>
        </form>
        <div className="text-center mt-4">
          <span>Don't have an account?{" "}</span>
          <button
            type="button"
            className="text-green-700 underline"
            onClick={() => setShowRegister(true)}
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;