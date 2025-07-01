import React, { useState } from "react";
import api from "../api";

export default function RegisterForm({ onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async e => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (password !== confirm) {
      setError("Passwords do not match."); return;
    }
    try {
      await api.post("/auth/register", { name, email, password });
      setSuccess("Registration successful! You can log in.");
      setTimeout(onBack, 1300);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
        err.response?.data?.error ||
        "Registration failed."
      );
    }
  };

  return (
    <div className="login-form-wrap">
      <form className="login-form-card" onSubmit={handleRegister}>
        <h3 className="form-title">Register</h3>
        <div className="form-group">
          <label>Name
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
          </label>
        </div>
        <div className="form-group">
          <label>Email
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
        </div>
        <div className="form-group">
          <label>Password
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
        </div>
        <div className="form-group">
          <label>Confirm Password
            <input className="form-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </label>
        </div>
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}
        <div className="form-actions">
          <button type="submit" className="form-submit-btn">Register</button>
          <button type="button" className="form-cancel-btn" onClick={onBack}>Back to Login</button>
        </div>
      </form>
    </div>
  );
}