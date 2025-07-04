import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // To check for admin role

function ReferenceRangePage() {
    const { user } = useAuth();
    const isAdmin = user && user.role === 'admin';

    const [referenceRanges, setReferenceRanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Form states for adding new range
    const [newTestType, setNewTestType] = useState('');
    const [newParameter, setNewParameter] = useState('');
    const [newNormalMinValue, setNewNormalMinValue] = useState(''); // Changed to normal_min
    const [newNormalMaxValue, setNewNormalMaxValue] = useState(''); // Changed to normal_max
    const [newUnits, setNewUnits] = useState('');

    const fetchReferenceRanges = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/reference_ranges');
            // Correctly access the 'data' array from the response object
            setReferenceRanges(response.data.data); // <-- FIX: Access response.data.data
        } catch (err) {
            setError('Failed to fetch reference ranges.');
            console.error('Error fetching reference ranges:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAdmin) { // Only fetch if admin
            fetchReferenceRanges();
        } else {
            setError("You don't have permission to view this page.");
            setLoading(false);
        }
    }, [fetchReferenceRanges, isAdmin]);

    const handleAddReferenceRange = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (!isAdmin) {
            setError("You don't have permission to add reference ranges.");
            return;
        }

        // Basic validation
        if (!newTestType || !newParameter || newNormalMinValue === '' || newNormalMaxValue === '' || !newUnits) {
            setError('All fields are required for a new reference range.');
            return;
        }
        if (isNaN(parseFloat(newNormalMinValue)) || isNaN(parseFloat(newNormalMaxValue))) {
            setError('Min and Max values must be numbers.');
            return;
        }

        const newRange = {
            test_type: newTestType,
            parameter: newParameter,
            normal_min: parseFloat(newNormalMinValue), // Changed to normal_min
            normal_max: parseFloat(newNormalMaxValue), // Changed to normal_max
            units: newUnits
        };

        try {
            const response = await axios.post('/reference_ranges', newRange);
            setMessage('Reference range added successfully!');
            // Add the new range to the local state (response.data.data contains the new range object)
            setReferenceRanges(prevRanges => [...prevRanges, response.data.data]); // <-- FIX: Access response.data.data
            // Clear form
            setNewTestType('');
            setNewParameter('');
            setNewNormalMinValue('');
            setNewNormalMaxValue('');
            setNewUnits('');
        } catch (err) {
            setError('Failed to add reference range. Make sure it does not already exist or all fields are correct.');
            console.error('Error adding reference range:', err.response?.data || err.message);
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading reference ranges...</div>;
    // Specific error for non-admins, otherwise show generic error for API issues
    if (error && !isAdmin) return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Reference Ranges</h2>

            {isAdmin ? (
                <>
                    <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd',minHeight:'10px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                        <h3>Add New Reference Range</h3>
                        <form onSubmit={handleAddReferenceRange}>
                            <div style={formGroupStyle}>
                                <label htmlFor="newTestType" style={labelStyle}>Test Type:</label>
                                <input type="text" id="newTestType" value={newTestType} onChange={(e) => setNewTestType(e.target.value)} required style={inputStyle} />
                            </div>
                            <div style={formGroupStyle}>
                                <label htmlFor="newParameter" style={labelStyle}>Parameter:</label>
                                <input type="text" id="newParameter" value={newParameter} onChange={(e) => setNewParameter(e.target.value)} required style={inputStyle} />
                            </div>
                            <div style={formGroupStyle}>
                                <label htmlFor="newNormalMinValue" style={labelStyle}>Min Value (Normal):</label>
                                <input type="number" step="0.01" id="newNormalMinValue" value={newNormalMinValue} onChange={(e) => setNewNormalMinValue(e.target.value)} required style={inputStyle} />
                            </div>
                            <div style={formGroupStyle}>
                                <label htmlFor="newNormalMaxValue" style={labelStyle}>Max Value (Normal):</label>
                                <input type="number" step="0.01" id="newNormalMaxValue" value={newNormalMaxValue} onChange={(e) => setNewNormalMaxValue(e.target.value)} required style={inputStyle} />
                            </div>
                            <div style={formGroupStyle}>
                                <label htmlFor="newUnits" style={labelStyle}>Units:</label>
                                <input type="text" id="newUnits" value={newUnits} onChange={(e) => setNewUnits(e.target.value)} required style={inputStyle} />
                            </div>
                            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
                            <button type="submit" style={submitButtonStyle}>Add Range</button>
                        </form>
                    </div>

                    <h3>Existing Reference Ranges</h3>
                    {referenceRanges.length === 0 ? (
                        <p>No reference ranges defined.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f2f2f2' }}>
                                    <th style={tableHeaderStyle}>Test Type</th>
                                    <th style={tableHeaderStyle}>Parameter</th>
                                    <th style={tableHeaderStyle}>Min Value</th>
                                    <th style={tableHeaderStyle}>Max Value</th>
                                    <th style={tableHeaderStyle}>Units</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referenceRanges.map(range => (
                                    <tr key={range.id} style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={tableCellStyle}>{range.test_type}</td>
                                        <td style={tableCellStyle}>{range.parameter}</td>
                                        <td style={tableCellStyle}>{range.normal_min}</td> {/* Changed to normal_min */}
                                        <td style={tableCellStyle}>{range.normal_max}</td> {/* Changed to normal_max */}
                                        <td style={tableCellStyle}>{range.units}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            ) : (
                <p style={{ color: 'red' }}>You do not have permission to view or manage reference ranges.</p>
            )}
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
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
};

const tableHeaderStyle = {
    padding: '12px',
    border: '1px solid #ddd',
    textAlign: 'left',
    backgroundColor: '#e6e6e6'
};

const tableCellStyle = {
    padding: '12px',
    border: '1px solid #ddd',
    textAlign: 'left'
};

export default ReferenceRangePage;
