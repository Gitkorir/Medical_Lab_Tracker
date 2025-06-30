import React, { useState } from "react";
import api from "../api";

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      const token = res.data.access_token;
      // ✅ Store full "Bearer <token>" string
      localStorage.setItem("token", `Bearer ${token}`);
      onLoginSuccess(); // notify App that login succeeded
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Invalid credentials or server error.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 border p-6 rounded shadow">
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
    </div>
  );
};

export default LoginPage;