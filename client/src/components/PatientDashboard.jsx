import React, { useEffect, useState } from 'react';
import axios from '../api';

function PatientDashboard() {
  const [summary, setSummary] = useState({
    patientCount: 0,
    testCount: 0,
    abnormalCount: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/dashboard/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSummary(res.data);
      } catch (err) {
        console.error('Failed to load dashboard summary', err);
      }
    };

    fetchStats();
  }, []);

  const Card = ({ title, value, color }) => (
    <div className={`bg-${color}-100 border-l-4 border-${color}-500 text-${color}-700 p-4 shadow rounded`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl">{value}</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-700">📋 Patient Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card title="🧑‍🤝‍🧑 Patients" value={summary.patientCount} color="blue" />
        <Card title="🧪 Test Results" value={summary.testCount} color="green" />
        <Card title="⚠️ Abnormal Results" value={summary.abnormalCount} color="red" />
      </div>
    </div>
  );
}

export default PatientDashboard;
