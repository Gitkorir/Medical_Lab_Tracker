import React, { useEffect, useState } from 'react';
import axios from '../api';

function ReferenceRangeManager() {
  const [ranges, setRanges] = useState([]);
  const [newRange, setNewRange] = useState({ test_type: '', min_value: '', max_value: '', units: '' });

  const fetchRanges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/reference_ranges/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRanges(response.data);
    } catch (error) {
      console.error('Error fetching ranges:', error);
    }
  };

  const handleAddRange = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/reference_ranges/', newRange, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewRange({ test_type: '', min_value: '', max_value: '', units: '' });
      fetchRanges();
    } catch (error) {
      console.error('Error adding range:', error);
    }
  };

  useEffect(() => {
    fetchRanges();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">🧪 Manage Test Reference Ranges</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-white p-4 shadow rounded">
        <input
          type="text"
          placeholder="Test Type"
          className="border p-2 rounded"
          value={newRange.test_type}
          onChange={(e) => setNewRange({ ...newRange, test_type: e.target.value })}
        />
        <input
          type="text"
          placeholder="Min Value"
          className="border p-2 rounded"
          value={newRange.min_value}
          onChange={(e) => setNewRange({ ...newRange, min_value: e.target.value })}
        />
        <input
          type="text"
          placeholder="Max Value"
          className="border p-2 rounded"
          value={newRange.max_value}
          onChange={(e) => setNewRange({ ...newRange, max_value: e.target.value })}
        />
        <input
          type="text"
          placeholder="Units"
          className="border p-2 rounded"
          value={newRange.units}
          onChange={(e) => setNewRange({ ...newRange, units: e.target.value })}
        />
        <button
          onClick={handleAddRange}
          className="col-span-1 sm:col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          ➕ Add Range
        </button>
      </div>

      <div className="bg-white shadow rounded p-4">
        <h3 className="text-lg font-semibold mb-2">📋 Current Ranges</h3>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Test</th>
              <th className="p-2 border">Min</th>
              <th className="p-2 border">Max</th>
              <th className="p-2 border">Units</th>
            </tr>
          </thead>
          <tbody>
            {ranges.map((range) => (
              <tr key={range.id}>
                <td className="p-2 border">{range.test_type}</td>
                <td className="p-2 border">{range.min_value}</td>
                <td className="p-2 border">{range.max_value}</td>
                <td className="p-2 border">{range.units}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReferenceRangeManager;
