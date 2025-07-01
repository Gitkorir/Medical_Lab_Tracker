import React, { useState } from "react";
import api from "../api";

export default function AddPatientModal({ onPatientAdded, onCancel }) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/patients/",
        { name, dob, gender },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Patient added successfully!");
      setName("");
      setDob("");
      setGender("");
      if (onPatientAdded) onPatientAdded(res.data.data); // .data.data for your backend
      window.dispatchEvent(new Event("dashboardUpdate"));
    } catch (err) {
      setError(
        err.response?.data?.msg ||
        err.response?.data?.error ||
        "Failed to add patient"
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form className="add-patient-form-card" onSubmit={handleSubmit}>
          <h3 className="form-title">Add New Patient</h3>
          <div className="form-group">
            <label>Name
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
            </label>
          </div>
          <div className="form-group">
            <label>Date of Birth
              <input className="form-input" type="date" value={dob} onChange={e => setDob(e.target.value)} required />
            </label>
          </div>
          <div className="form-group">
            <label>Gender
              <select className="form-input" value={gender} onChange={e => setGender(e.target.value)} required>
                <option value="">--Select--</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}
          <div className="form-actions">
            <button type="submit" className="form-submit-btn">Add Patient</button>
            <button type="button" className="form-cancel-btn" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1112;
        }
        .modal-content {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 2px 32px #0002;
          padding: 2rem 2.2rem 2rem 2.2rem;
          max-width: 410px;
          width: 100%;
        }
        .add-patient-form-card {
          width: 100%;
        }
        .form-title {
          color: #17803e;
          font-weight: bold;
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
          text-align: center;
        }
        .form-group {
          margin-bottom: 1.1rem;
        }
        .form-input {
          width: 100%;
          padding: 10px 8px;
          margin-top: 5px;
          font-size: 1rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #fafcff;
          transition: border 0.2s;
        }
        .form-input:focus {
          border: 1.5px solid #16a34a;
          outline: none;
        }
        .form-error {
          color: #b91c1c;
          margin-bottom: 7px;
          font-weight: 500;
        }
        .form-success {
          color: #17803e;
          margin-bottom: 7px;
          font-weight: 500;
        }
        .form-actions {
          display: flex;
          gap: 0.6rem;
          justify-content: flex-end;
          margin-top: 1.2rem;
        }
        .form-submit-btn {
          background: #16a34a;
          color: #fff;
          padding: 11px 21px;
          border: none;
          border-radius: 8px;
          font-size: 1.03rem;
          font-weight: bold;
          transition: background 0.2s;
        }
        .form-submit-btn:hover {
          background: #137d37;
        }
        .form-cancel-btn {
          background: #efefef;
          color: #17803e;
          padding: 11px 18px;
          border: none;
          border-radius: 8px;
          font-size: 1.02rem;
          font-weight: 500;
          transition: background 0.2s;
        }
        .form-cancel-btn:hover {
          background: #e2e9ee;
        }
      `}</style>
    </div>
  );
}