import React, { useState } from "react";
import api from "../api";

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.access_token;
      localStorage.setItem("token", `Bearer ${token}`);
      onLoginSuccess(); // callback to redirect or show dashboard
    } catch (err) {
      setErrorMsg("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">🔐 Login</h2>
      {errorMsg && <p className="text-red-600">{errorMsg}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          className="border w-full p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="border w-full p-2 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white w-full p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
