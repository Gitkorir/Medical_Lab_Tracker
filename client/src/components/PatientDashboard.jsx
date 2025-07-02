import React, { useEffect, useState } from 'react';
import axios from '../api';

function PatientDashboard() {
  const [summary, setSummary] = useState({
    patientCount: 0,
    testCount: 0,
    abnormalCount: 0
  });
  const [view, setView] = useState(""); // '', 'patients', 'tests', 'abnormal'
  const [patients, setPatients] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch summary
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/dashboard/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(res.data);
    } catch (err) {
      // ignore for now
    }
  };

  // Fetch patients
  const fetchPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  // Fetch test results
  const fetchTests = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/tests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load test results");
    } finally {
      setLoading(false);
    }
  };

  // On mount and dashboardUpdate
  useEffect(() => {
    fetchStats();
    const handler = () => fetchStats();
    window.addEventListener("dashboardUpdate", handler);
    return () => window.removeEventListener("dashboardUpdate", handler);
  }, []);

  // Open modal/list content when clicking a box
  const handleBoxClick = (type) => {
    setError("");
    setView(type);
    if (type === "patients") fetchPatients();
    if (type === "tests" || type === "abnormal") fetchTests();
  };

  // List of patients, now with test and abnormal counts
  const renderPatients = () => (
    <div className="modal-list">
      <div className="modal-header">
        <b>Patients List</b>
        <button className="close-btn" onClick={() => setView("")}>✕</button>
      </div>
      {loading ? <div>Loading...</div> : error ? <div>{error}</div> : (
        <table className="modal-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Test Results</th>
              <th>Abnormal</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#888" }}>No patients found.</td>
              </tr>
            ) : (
              patients.map(p => (
                <tr key={p.id} className={p.abnormal_count > 0 ? "flagged-row" : ""}>
                  <td>{p.name}</td>
                  <td>{p.dob}</td>
                  <td>{p.gender}</td>
                  <td>{p.test_count}</td>
                  <td>
                    {p.abnormal_count > 0
                      ? <span className="flagged-label">⚠️ {p.abnormal_count}</span>
                      : <span className="normal-label">0</span>
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
  // List of test results, with flagging
  const renderTestResults = (onlyAbnormal = false) => (
    <div className="modal-list">
      <div className="modal-header">
        <b>{onlyAbnormal ? "Abnormal" : "All"} Test Results</b>
        <button className="close-btn" onClick={() => setView("")}>✕</button>
      </div>
      {loading ? <div>Loading...</div> : error ? <div>{error}</div> : (
        <table className="modal-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Parameter</th>
              <th>Value</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {testResults
              .filter(t => onlyAbnormal ? t.flagged : true)
              .map(t => (
                <tr key={t.id} className={t.flagged ? "flagged-row" : ""}>
                  <td>{t.patient_name || t.patient?.name}</td>
                  <td>{t.parameter}</td>
                  <td>{t.result_values?.value}</td>
                  <td>{t.date_conducted ? (""+t.date_conducted).split("T")[0] : ""}</td>
                  <td>
                    {t.flagged
                      ? <span className="flagged-label">⚠️ Abnormal</span>
                      : <span className="normal-label">Normal</span>
                    }
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Main render
  return (
    <div>
      <h2 className="dashboard-title">📝 Patient Dashboard</h2>
      <div className="dashboard-cards">
        <div className="dashboard-card" onClick={() => handleBoxClick("patients")} style={{ cursor:"pointer" }}>
          <div>🧑‍🤝‍🧑 Patients</div>
          <div className="dashboard-count">{summary.patientCount}</div>
        </div>
        <div className="dashboard-card dashboard-card-green" onClick={() => handleBoxClick("tests")} style={{ cursor:"pointer" }}>
          <div>📝 Test Results</div>
          <div className="dashboard-count">{summary.testCount}</div>
        </div>
        <div className="dashboard-card dashboard-card-red" onClick={() => handleBoxClick("abnormal")} style={{ cursor:"pointer" }}>
          <div>⚠️ Abnormal Results</div>
          <div className="dashboard-count">{summary.abnormalCount}</div>
        </div>
      </div>

      {/* Conditional modals/lists */}
      {view === "patients" && renderPatients()}
      {view === "tests" && renderTestResults(false)}
      {view === "abnormal" && renderTestResults(true)}

      <style>
        {`
        .dashboard-title {
          font-size: 2rem;
          margin: 1.5rem 0 2rem 0;
          font-weight: bold;
        }
        .dashboard-cards {
          display: flex;
          gap: 1.2rem;
          flex-wrap: wrap;
        }
        .dashboard-card {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px #0001;
          padding: 1.5rem 2.5rem;
          min-width: 170px;
          min-height: 120px;
          font-size: 1.18rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1.5px solid #e5e7eb;
          transition: box-shadow 0.18s;
        }
        .dashboard-card:hover {
          box-shadow: 0 4px 16px #0002;
        }
        .dashboard-card-green {
          background: #e7fbee;
          border-color: #b9f3cf;
        }
        .dashboard-card-red {
          background: #ffeaea;
          border-color: #ffd3d3;
        }
        .dashboard-count {
          font-size: 2.2rem;
          color: #17803e;
          font-weight: bold;
          margin-top: 10px;
        }
        .dashboard-card-red .dashboard-count {
          color: #c81c1c;
        }
        /* Modal/List Styling */
        .modal-list {
          position: fixed;
          top: 65px;
          left: 0;
          right: 0;
          margin: 0 auto;
          max-width: 650px;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          box-shadow: 0 4px 32px #0002;
          border-radius: 12px;
          padding: 1.5rem 1.7rem 1.3rem 1.7rem;
          z-index: 1111;
          animation: fadeIn 0.2s;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.2rem;
          margin-bottom: 1.1rem;
        }
        .close-btn {
          font-size: 1.3rem;
          background: none;
          border: none;
          color: #b91c1c;
          cursor: pointer;
        }
        .modal-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 1rem;
        }
        .modal-table th, .modal-table td {
          border-bottom: 1px solid #e5e7eb;
          padding: 7px 6px;
          text-align: left;
        }
        .modal-table th {
          background: #f4f8fa;
        }
        .flagged-row {
          background: #fff4f5;
        }
        .flagged-label {
          color: #c81c1c;
          font-weight: bold;
        }
        .normal-label {
          color: #17803e;
          font-weight: 500;
        }
        @media (max-width: 700px) {
          .dashboard-cards { flex-direction: column; }
          .dashboard-card { width: 100%; min-width: 0; }
          .modal-list { max-width: 97vw; padding: 1.2rem; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(18px);}
          to { opacity: 1; transform: none;}
        }
        `}
      </style>
    </div>
  );
}

export default PatientDashboard;