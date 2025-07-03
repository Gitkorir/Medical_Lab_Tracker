import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function PatientDetailPage() {
    const { id } = useParams(); // Get patient ID from URL
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [labTests, setLabTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPatientData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch patient details
            const patientRes = await axios.get(`/patients/${id}`);
            setPatient(patientRes.data);

            // Fetch lab tests for this patient
            const testsRes = await axios.get(`/tests/${id}`); // Your API is /api/tests/<patient_id>
            setLabTests(testsRes.data);

        } catch (err) {
            setError('Failed to fetch patient data or lab tests. Patient may not exist.');
            console.error('Error fetching patient/tests:', err.response?.data || err.message);
            // Optionally redirect if patient not found (e.g., 404)
            if (err.response && err.response.status === 404) {
                navigate('/patients'); // Redirect back to list if not found
            }
        } finally {
            setLoading(false);
        }
    }, [id, navigate]); // Depend on id to refetch when ID changes

    useEffect(() => {
        fetchPatientData();
    }, [fetchPatientData]);

    if (loading) return <div style={{ padding: '20px' }}>Loading patient details...</div>;
    if (error) return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
    if (!patient) return <div style={{ padding: '20px' }}>Patient not found.</div>;

    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate('/patients')} style={{ marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                &larr; Back to Patients
            </button>

            <h2 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '20px' }}>
                Patient Details: {patient.name}
            </h2>
            <div style={detailSectionStyle}>
                <p><strong>Name:</strong> {patient.name}</p>
                <p><strong>Date of Birth:</strong> {new Date(patient.dob).toLocaleDateString()}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>
                <p><strong>Total Tests:</strong> {patient.test_count || labTests.length}</p> {/* Use backend count if available, otherwise frontend */}
                <p><strong>Abnormal Tests:</strong> {patient.abnormal_count || labTests.filter(test => test.flagged).length}</p> {/* Similar logic */}
                <Link to={`/patients/edit/${patient.id}`} style={actionButtonStyle}>Edit Patient</Link>
            </div>

            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', marginTop: '40px', marginBottom: '20px' }}>
                Lab Tests
            </h3>
            <button onClick={() => navigate(`/patients/${patient.id}/add-test`)} style={{ marginBottom: '20px', padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Add New Lab Test
            </button>

            {labTests.length === 0 ? (
                <p>No lab tests recorded for this patient.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={tableHeaderStyle}>Parameter</th>
                            <th style={tableHeaderStyle}>Result</th>
                            <th style={tableHeaderStyle}>Unit</th>
                            <th style={tableHeaderStyle}>Date Conducted</th>
                            <th style={tableHeaderStyle}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {labTests.map(test => (
                            <tr key={test.id} style={{ borderBottom: '1px solid #ddd', backgroundColor: test.flagged ? '#ffe0e6' : 'inherit' }}>
                                <td style={tableCellStyle}>{test.parameter}</td>
                                <td style={tableCellStyle}>{test.result_values?.value}</td>
                                <td style={tableCellStyle}>{test.result_values?.unit}</td>
                                <td style={tableCellStyle}>{new Date(test.date_conducted).toLocaleDateString()}</td>
                                <td style={{ ...tableCellStyle, color: test.flagged ? 'red' : 'green', fontWeight: test.flagged ? 'bold' : 'normal' }}>
                                    {test.flagged ? 'Abnormal' : 'Normal'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const detailSectionStyle = {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #eee'
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

const actionButtonStyle = {
    marginTop: '15px',
    padding: '8px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
};

export default PatientDetailPage;