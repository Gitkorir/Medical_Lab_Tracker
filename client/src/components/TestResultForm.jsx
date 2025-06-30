import React, { useState, useEffect } from 'react';
import axios from '../api';

function TestResultForm() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patient_id: '',
    test_type: '',
    result_values: {},
  });

  const [testValue, setTestValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/patients/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data);
      } catch (err) {
        console.error('Error fetching patients:', err);
      }
    };
    fetchPatients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      patient_id: form.patient_id,
      test_type: form.test_type,
      result_values: { value: parseFloat(testValue) },
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post('/tests/', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('✅ Test result submitted');
      setForm({ patient_id: '', test_type: '', result_values: {} });
      setTestValue('');
    } catch (error) {
      console.error('Submission error:', error);
      alert('❌ Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow p-6 rounded mt-8">
      <h2 className="text-2xl font-bold text-green-700 mb-4">➕ Add Test Result</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-medium">Patient</label>
          <select
            required
            className="w-full border p-2 rounded"
            value={form.patient_id}
            onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
          >
            <option value="">-- Select Patient --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Test Type</label>
          <input
            required
            type="text"
            placeholder="e.g., Hemoglobin"
            className="w-full border p-2 rounded"
            value={form.test_type}
            onChange={(e) => setForm({ ...form, test_type: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Result Value</label>
          <input
            required
            type="number"
            step="0.01"
            placeholder="e.g., 13.5"
            className="w-full border p-2 rounded"
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          {loading ? 'Submitting...' : 'Submit Result'}
        </button>
      </form>
    </div>
  );
}

export default TestResultForm;
