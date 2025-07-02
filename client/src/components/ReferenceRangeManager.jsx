import React, { useState, useEffect, useCallback } from "react";
import api from "../api";

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 20;
const MAX_PER_PAGE = 100;

const ReferenceRangeManager = () => {
  // Form state
  const [form, setForm] = useState({
    parameter: "",
    normal_min: "",
    normal_max: "",
    units: "",
  });

  // Data state
  const [ranges, setRanges] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [pagination, setPagination] = useState({
    page: DEFAULT_PAGE,
    per_page: DEFAULT_PER_PAGE,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false,
  });

  // Sanitize and validate pagination before API call
  const getSafePagination = () => {
    let page = Number(pagination.page) || DEFAULT_PAGE;
    let per_page = Number(pagination.per_page) || DEFAULT_PER_PAGE;
    if (page < 1) page = DEFAULT_PAGE;
    if (per_page < 1 || per_page > MAX_PER_PAGE) per_page = DEFAULT_PER_PAGE;
    return { page, per_page };
  };

  // Fetch reference ranges
  const fetchRanges = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const { page, per_page } = getSafePagination();
    const params = { page, per_page };
    if (searchTerm && typeof searchTerm === "string" && searchTerm.trim() !== "") {
      params.parameter = searchTerm.trim();
    }

    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/reference_ranges/", { params, headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setRanges(res.data.data || []);
      setPagination(prev => ({
        ...prev,
        ...res.data.pagination,
        page: res.data.pagination?.page || page,
        per_page: res.data.pagination?.per_page || per_page,
      }));
    } catch (err) {
      let msg = "Failed to fetch reference ranges. Please try again.";
      if (err.response?.data?.error) msg = err.response.data.error;
      setErrors({ fetch: msg });
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line
  }, [pagination.page, pagination.per_page, searchTerm]);

  useEffect(() => {
    fetchRanges();
    // eslint-disable-next-line
  }, [pagination.page, pagination.per_page, searchTerm]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!form.parameter.trim()) newErrors.parameter = "Parameter is required";
    if (!form.units.trim()) newErrors.units = "Units are required";

    const normalMin = parseFloat(form.normal_min);
    const normalMax = parseFloat(form.normal_max);

    if (isNaN(normalMin) || normalMin < 0) {
      newErrors.normal_min = "Normal min must be a valid positive number";
    }
    if (isNaN(normalMax) || normalMax < 0) {
      newErrors.normal_max = "Normal max must be a valid positive number";
    }
    if (!isNaN(normalMin) && !isNaN(normalMax) && normalMin >= normalMax) {
      newErrors.normal_max = "Normal max must be greater than normal min";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle form submit (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      parameter: form.parameter.trim(),
      normal_min: parseFloat(form.normal_min),
      normal_max: parseFloat(form.normal_max),
      units: form.units.trim(),
    };

    try {
      setSubmitting(true);
      setErrors({});
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (editingId) {
        await api.put(`/api/reference_ranges/${editingId}`, payload, { headers });
        setSuccessMessage("Reference range updated successfully!");
        setEditingId(null);
      } else {
        await api.post("/api/reference_ranges/", payload, { headers });
        setSuccessMessage("Reference range added successfully!");
      }

      resetForm();
      fetchRanges();
    } catch (err) {
      if (err.response?.data?.details) {
        setErrors(err.response.data.details);
      } else if (err.response?.data?.error) {
        setErrors({ submit: err.response.data.error });
      } else {
        setErrors({ submit: "Failed to save reference range. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (range) => {
    setForm({
      parameter: range.parameter,
      normal_min: range.normal_min.toString(),
      normal_max: range.normal_max.toString(),
      units: range.units,
    });
    setEditingId(range.id);
    setErrors({});
    setSuccessMessage("");
  };

  // Handle delete
  const handleDelete = async (id, parameter) => {
    if (!window.confirm(`Are you sure you want to delete the reference range for ${parameter}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await api.delete(`/api/reference_ranges/${id}`, { headers });
      setSuccessMessage("Reference range deleted successfully!");
      fetchRanges();
    } catch (err) {
      setErrors({ delete: "Failed to delete reference range. Please try again." });
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      parameter: "",
      normal_min: "",
      normal_max: "",
      units: "",
    });
    setEditingId(null);
    setErrors({});
  };

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: DEFAULT_PAGE }));
  };

  // Auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Pagination navigation
  const handlePageChange = (delta) => {
    setPagination(prev => {
      let newPage = (prev.page || DEFAULT_PAGE) + delta;
      if (newPage < 1) newPage = 1;
      if (prev.pages && newPage > prev.pages) newPage = prev.pages;
      return { ...prev, page: newPage };
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Reference Range Management
      </h2>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errors.fetch && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.fetch}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-lg rounded-lg mb-8">
        <h3 className="text-lg font-semibold mb-4">
          {editingId ? "Edit Reference Range" : "Add New Reference Range"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parameter *
            </label>
            <input
              type="text"
              name="parameter"
              value={form.parameter}
              onChange={handleChange}
              placeholder="e.g., Hemoglobin"
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.parameter ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={submitting}
            />
            {errors.parameter && (
              <p className="text-red-500 text-xs mt-1">{errors.parameter}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Units *
            </label>
            <input
              type="text"
              name="units"
              value={form.units}
              onChange={handleChange}
              placeholder="e.g., g/dL"
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.units ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={submitting}
            />
            {errors.units && (
              <p className="text-red-500 text-xs mt-1">{errors.units}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Normal Min *
            </label>
            <input
              type="number"
              name="normal_min"
              value={form.normal_min}
              onChange={handleChange}
              placeholder="0.0"
              step="0.01"
              min="0"
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.normal_min ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={submitting}
            />
            {errors.normal_min && (
              <p className="text-red-500 text-xs mt-1">{errors.normal_min}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Normal Max *
            </label>
            <input
              type="number"
              name="normal_max"
              value={form.normal_max}
              onChange={handleChange}
              placeholder="0.0"
              step="0.01"
              min="0"
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.normal_max ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={submitting}
            />
            {errors.normal_max && (
              <p className="text-red-500 text-xs mt-1">{errors.normal_max}</p>
            )}
          </div>
        </div>

        {errors.submit && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.submit}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${
              submitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting ? 'Saving...' : editingId ? 'Update Range' : 'Add Range'}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search parameters..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full md:w-64 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Reference Ranges List */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <h3 className="text-lg font-semibold p-4 bg-gray-50 border-b">
          Existing Reference Ranges ({pagination.total})
        </h3>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : ranges.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No reference ranges found matching your search.' : 'No reference ranges added yet.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Range</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ranges.map((range) => (
                    <tr key={range.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{range.parameter}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {range.normal_min} - {range.normal_max}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{range.units}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(range)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(range.id, range.parameter)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.pages} 
                  ({pagination.total} total)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(-1)}
                    disabled={!pagination.has_prev}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={!pagination.has_next}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReferenceRangeManager;