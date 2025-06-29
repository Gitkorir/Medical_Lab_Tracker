import React, { useEffect, useState } from "react";
import api from "../api";
import './ReferenceRangeManager.css';

const ReferenceRangeManager = () => {
  const [ranges, setRanges] = useState([]);
  const [form, setForm] = useState({ test_type: "", parameter: "", min_value: "", max_value: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchRanges();
  }, []);

  const fetchRanges = async () => {
    const res = await api.get("/reference_ranges/");
    setRanges(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/reference_ranges/${editingId}`, form);
    } else {
      await api.post("/reference_ranges/", form);
    }
    setForm({ test_type: "", parameter: "", min_value: "", max_value: "" });
    setEditingId(null);
    fetchRanges();
  };

  const handleEdit = (range) => {
    setForm(range);
    setEditingId(range.id);
  };

  const handleDelete = async (id) => {
    await api.delete(`/reference_ranges/${id}`);
    fetchRanges();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🧑‍⚕️ Reference Range Admin</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">
        {["test_type", "parameter", "min_value", "max_value"].map((field) => (
          <input
            key={field}
            type={field.includes("value") ? "number" : "text"}
            step="any"
            placeholder={field.replace("_", " ")}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="border p-2 rounded"
          />
        ))}
        <button type="submit" className="col-span-2 bg-blue-600 text-white p-2 rounded">
          {editingId ? "Update Range" : "Add Range"}
        </button>
      </form>

      <table className="w-full text-left border border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Test Type</th>
            <th className="border p-2">Parameter</th>
            <th className="border p-2">Min</th>
            <th className="border p-2">Max</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {ranges.map((r) => (
            <tr key={r.id}>
              <td className="border p-2">{r.test_type}</td>
              <td className="border p-2">{r.parameter}</td>
              <td className="border p-2">{r.min_value ?? "—"}</td>
              <td className="border p-2">{r.max_value ?? "—"}</td>
              <td className="border p-2 space-x-2">
                <button onClick={() => handleEdit(r)} className="text-blue-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReferenceRangeManager;
