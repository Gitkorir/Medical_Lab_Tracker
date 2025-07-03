import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function LabTestFormPage() {
    const { id: patientId } = useParams(); // Get patient ID from URL
    const navigate = useNavigate();

    const [parameter, setParameter] = useState('');
    const [resultValue, setResultValue] = useState('');
    const [unit, setUnit] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [patientName, setPatientName] = useState(''); // To display patient name
    const [referenceRanges, setReferenceRanges] = useState([]); // For dropdown of known parameters

    // Fetch patient name and reference ranges on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch patient name
                const patientRes = await axios.get(`/patients/${patientId}`);
                setPatientName(patientRes.data.name);

                // Fetch reference ranges to pre-populate 'parameter' dropdown
                const refRes = await axios.get('/reference_ranges');
                // FIX: Access the 'data' array from the response object
                setReferenceRanges(refRes.data.data); // <-- FIX IS HERE
            } catch (err) {
                setError('Failed to load necessary data (patient or reference ranges).');
                console.error('Error fetching data for lab test form:', err.response?.data || err.message);
                // Optionally redirect if essential data is missing
                // navigate(`/patients/${patientId}`); // Removed this to allow error message to show
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [patientId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (!patientId) {
            setError('Patient ID is missing.');
            setLoading(false);
            return;
        }

        // Basic validation
        if (!parameter || resultValue === '' || !unit) { // Changed resultValue check to allow 0
            setError('All fields are required.');
            setLoading(false);
            return;
        }

        // Ensure resultValue is a number
        const numericResultValue = parseFloat(resultValue);
        if (isNaN(numericResultValue)) {
            setError('Result value must be a number.');
            setLoading(false);
            return;
        }

        const labTestData = {
            patient_id: patientId,
            parameter,
            result_values: {
                value: numericResultValue,
                unit
            },
            // date_conducted is handled by backend default
        };

        try {
            await axios.post('/tests', labTestData);
            setMessage('Lab test added successfully!');
            // Optionally clear form or navigate back
            setParameter('');
            setResultValue('');
            setUnit('');
            navigate(`/patients/${patientId}`); // Go back to patient details
        } catch (err) {
            setError('Failed to add lab test. Please check your input and try again.');
            console.error('Error adding lab test:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !patientName) return <div style={{ padding: '20px' }}>Loading form data...</div>;
    if (error) return <div style={{ color: 'red', padding: '20px' }}>{error}</div>; // Display fetch error

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Add Lab Test for {patientName}</h2>
            <form onSubmit={handleSubmit}>
                <div style={formGroupStyle}>
                    <label htmlFor="parameter" style={labelStyle}>Test Parameter:</label>
                    <select
                        id="parameter"
                        value={parameter}
                        onChange={(e) => {
                            setParameter(e.target.value);
                            // Optionally set unit automatically if reference range has it
                            const selectedRange = referenceRanges.find(r => r.parameter === e.target.value);
                            if (selectedRange) {
                                setUnit(selectedRange.units);
                            }
                        }}
                        required
                        style={inputStyle}
                    >
                        <option value="">Select Test Parameter</option>
                        {/* Ensure referenceRanges is an array before mapping */}
                        {Array.isArray(referenceRanges) && referenceRanges.map(range => (
                            <option key={range.id} value={range.parameter}>
                                {range.parameter} ({range.units})
                            </option>
                        ))}
                    </select>
                </div>
                <div style={formGroupStyle}>
                    <label htmlFor="resultValue" style={labelStyle}>Result Value:</label>
                    <input
                        type="number"
                        step="0.01" // Allow decimal values
                        id="resultValue"
                        value={resultValue}
                        onChange={(e) => setResultValue(e.target.value)}
                        required
                        style={inputStyle}
                    />
                </div>
                <div style={formGroupStyle}>
                    <label htmlFor="unit" style={labelStyle}>Unit:</label>
                    <input
                        type="text"
                        id="unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="e.g., g/dL, mg/dL"
                        required
                        style={inputStyle}
                    />
                </div>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
                <button type="submit" disabled={loading} style={{ ...submitButtonStyle, backgroundColor: loading ? '#ccc' : '#28a745' }}>
                    {loading ? 'Adding...' : 'Add Lab Test'}
                </button>
                <button type="button" onClick={() => navigate(`/patients/${patientId}`)} style={{ ...submitButtonStyle, backgroundColor: '#6c757d', marginLeft: '10px' }}>
                    Cancel
                </button>
            </form>
        </div>
    );
}

const formGroupStyle = {
    marginBottom: '15px'
};

const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box'
};

const submitButtonStyle = {
    padding: '10px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
};

export default LabTestFormPage;