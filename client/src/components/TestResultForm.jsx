import React, { useState, useEffect } from "react";
import AddPatient from "./AddPatient";
import api from "../api";

export default function TestResultForm() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [parameter, setParameter] = useState("");
  const [resultValue, setResultValue] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // Use correct API prefix
        const token = localStorage.getItem("token");
        const res = await api.get("/api/patients/", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          params: {
              page: 1,
              per_page: 20,
          },
       });

        setPatients(Array.isArray(res.data) ? res.data : []);
      } catch {
        setPatients([]);
      }
    };
    fetchPatients();
  }, []);

  // When a new patient is added, add to list and select it
  const handlePatientAdded = (newPatient) => {
    setPatients(prev => [...prev, newPatient]);
    setSelectedPatient(newPatient.id);
    setShowAddPatient(false);
    window.dispatchEvent(new Event("dashboardUpdate"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (!selectedPatient) {
      setError("Please select a patient.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to add a test result.");
      setLoading(false);
      return;
    }

    if (!parameter.trim()) {
      setError("Please enter the test parameter.");
      setLoading(false);
      return;
    }
    if (!resultValue.trim()) {
      setError("Please enter the result value.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        patient_id: selectedPatient,
        parameter,
        result_values: { value: resultValue }
      };
      // Use correct API prefix
      await api.post("/api/tests/", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage("Test result added!");
      setParameter("");
      setResultValue("");
      window.dispatchEvent(new Event("dashboardUpdate"));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else if (
        err.response &&
        err.response.data &&
        (err.response.data.error || err.response.data.msg)
      ) {
        setError(err.response.data.error || err.response.data.msg);
      } else {
        setError("Network or server error.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-result-form-wrap">
      <form className="test-result-form-card" onSubmit={handleSubmit}>
        <div className="form-header">
          <span className="form-icon">🧪</span>
          <span className="form-title">Add Test Result</span>
        </div>
        <div className="form-group">
          <label className="form-label">
            Patient
            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              <select
                className="form-input"
                value={selectedPatient}
                onChange={e => setSelectedPatient(e.target.value)}
                required
              >
                <option value="">-- Select Patient --</option>
                {patients.map((p) => (
                  <option value={p.id} key={p.id}>{p.name}</option>
                ))}
              </select>
              <button
                type="button"
                className="add-patient-btn"
                onClick={() => setShowAddPatient(true)}
                disabled={loading}
              >
                + Add Patient
              </button>
            </div>
          </label>
        </div>
        <div className="form-group">
          <label className="form-label">
            Parameter
            <input
              className="form-input"
              value={parameter}
              onChange={e => setParameter(e.target.value)}
              placeholder="e.g., Hemoglobin"
              required
              disabled={loading}
            />
          </label>
        </div>
        <div className="form-group">
          <label className="form-label">
            Result Value
            <input
              className="form-input"
              value={resultValue}
              onChange={e => setResultValue(e.target.value)}
              placeholder="e.g., 13.5"
              required
              disabled={loading}
            />
          </label>
        </div>
        {error && <div className="form-error">{error}</div>}
        {message && <div className="form-success">{message}</div>}
        <button type="submit" className="form-submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit Result"}
        </button>
      </form>
      {showAddPatient && (
        <AddPatient
          onPatientAdded={handlePatientAdded}
          onCancel={() => setShowAddPatient(false)}
        />
      )}
      <style>
        {`
        .test-result-form-wrap {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 70vh;
          margin-top: 40px;
        }
        .test-result-form-card {
          max-width: 410px;
          width: 100%;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 2px 16px #0001;
          padding: 2.2rem 1.7rem 1.7rem 1.7rem;
          margin: 0 auto;
          border: 1px solid #e5e7eb;
        }
        .form-header {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
          justify-content: center;
        }
        .form-icon {
          font-size: 2.1rem;
          margin-right: 11px;
        }
        .form-title {
          font-size: 1.45rem;
          font-weight: 700;
          color: #17803e;
        }
        .form-group {
          margin-bottom: 1.35rem;
        }
        .form-label {
          font-size: 1.03rem;
          font-weight: 600;
          color: #333;
          display: block;
        }
        .form-input {
          width: 100%;
          padding: 11px 9px;
          margin-top: 6px;
          font-size: 1.05rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #fafcff;
          transition: border 0.2s;
        }
        .form-input:focus {
          border: 1.5px solid #16a34a;
          outline: none;
        }
        .add-patient-btn {
          padding: 9px 13px;
          font-size: 1.01rem;
          border: none;
          background: #f1f6fa;
          color: #17803e;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }
        .add-patient-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .add-patient-btn:hover:not(:disabled) {
          background: #e2e9ee;
        }
        .form-error {
          color: #b91c1c;
          margin-bottom: 10px;
          font-weight: 500;
        }
        .form-success {
          color: #17803e;
          margin-bottom: 10px;
          font-weight: 500;
        }
        .form-submit-btn {
          width: 100%;
          background: #16a34a;
          color: #fff;
          padding: 14px;
          border: none;
          border-radius: 8px;
          font-size: 1.06rem;
          font-weight: bold;
          margin-top: 10px;
          transition: background 0.2s;
        }
        .form-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .form-submit-btn:hover:not(:disabled) {
          background: #137d37;
        }
        @media (max-width: 700px) {
          .test-result-form-card { max-width: 97vw; padding: 1.1rem; }
          .form-title { font-size: 1.22rem; }
        }
        `}
      </style>
    </div>
  );
}