import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function PatientListPage() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const fetchPatients = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/patients');
            setPatients(response.data);
        } catch (err) {
            setError('Failed to fetch patients. Please try again later.');
            console.error('Error fetching patients:', err.response?.data || err.message);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                // You might want to automatically log out or refresh token here
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const handleDelete = async (patientId) => {
        if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
            try {
                await axios.delete(`/patients/${patientId}`);
                setPatients(patients.filter(patient => patient.id !== patientId));
                alert('Patient deleted successfully!');
            } catch (err) {
                setError('Failed to delete patient.');
                console.error('Error deleting patient:', err.response?.data || err.message);
            }
        }
    };

    if (loading) return <div>Loading patients...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Patients</h2>
            {/* THIS IS THE BUTTON TO ADD A NEW PATIENT */}
            <button
                onClick={() => navigate('/patients/new')}
                style={{
                    marginBottom: '20px',
                    padding: '10px 15px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Add New Patient
            </button>

            {patients.length === 0 ? (
                <p>No patients found. Add a new one!</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={tableHeaderStyle}>Name</th>
                            <th style={tableHeaderStyle}>Date of Birth</th>
                            <th style={tableHeaderStyle}>Gender</th>
                            <th style={tableHeaderStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map(patient => (
                            <tr key={patient.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={tableCellStyle}>{patient.name}</td>
                                <td style={tableCellStyle}>{new Date(patient.dob).toLocaleDateString()}</td>
                                <td style={tableCellStyle}>{patient.gender}</td>
                                <td style={tableCellStyle}>
                                    <Link to={`/patients/${patient.id}`} style={actionButtonStyle}>View Details</Link>
                                    <Link to={`/patients/edit/${patient.id}`} style={actionButtonStyle}>Edit</Link>
                                    <button onClick={() => handleDelete(patient.id)} style={{ ...actionButtonStyle, backgroundColor: '#dc3545' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

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
    marginRight: '10px',
    padding: '8px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
};

export default PatientListPage;