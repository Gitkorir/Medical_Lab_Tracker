import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import useAuth to get user for created_by

function PatientFormPage() {
    const { id } = useParams(); // Get ID from URL for editing
    const navigate = useNavigate();
    const { user } = useAuth(); // Get the current user to set 'created_by'

    const [name, setName] = useState('');
    const [dob, setDob] = useState(''); // YYYY-MM-DD format
    const [gender, setGender] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const isEditMode = Boolean(id); // True if ID exists, means we are editing

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            const fetchPatient = async () => {
                try {
                    const response = await axios.get(`/patients/${id}`);
                    const patientData = response.data;
                    setName(patientData.name);
                    // Ensure DOB is in YYYY-MM-DD format for input type="date"
                    setDob(patientData.dob); // Backend sends 'YYYY-MM-DD' directly
                    setGender(patientData.gender);
                } catch (err) {
                    setError('Failed to fetch patient data for editing.');
                    console.error('Error fetching patient:', err.response?.data || err.message);
                    navigate('/patients'); // Redirect if patient not found
                } finally {
                    setLoading(false);
                }
            };
            fetchPatient();
        }
    }, [id, isEditMode, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        // Ensure DOB is valid
        if (!dob || isNaN(new Date(dob))) {
            setError('Please enter a valid Date of Birth (YYYY-MM-DD).');
            setLoading(false);
            return;
        }

        const patientData = {
            name,
            dob, // Backend expects 'YYYY-MM-DD'
            gender,
            created_by: user ? user.id : null // Set the creator ID from auth context
        };

        if (!user || !user.id) {
            setError('User not authenticated. Please log in.');
            setLoading(false);
            return;
        }

        try {
            if (isEditMode) {
                await axios.put(`/patients/${id}`, patientData);
                setMessage('Patient updated successfully!');
            } else {
                await axios.post('/patients', patientData);
                setMessage('Patient added successfully!');
                // Clear form after successful creation
                setName('');
                setDob('');
                setGender('');
            }
            navigate('/patients'); // Navigate back to patient list after success
        } catch (err) {
            setError(`Failed to ${isEditMode ? 'update' : 'add'} patient.`);
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} patient:`, err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) return <div>Loading patient data...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>{isEditMode ? 'Edit Patient' : 'Add New Patient'}</h2>
            <form onSubmit={handleSubmit}>
                <div style={formGroupStyle}>
                    <label htmlFor="name" style={labelStyle}>Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={inputStyle}
                    />
                </div>
                <div style={formGroupStyle}>
                    <label htmlFor="dob" style={labelStyle}>Date of Birth:</label>
                    <input
                        type="date" // This input type is perfect for YYYY-MM-DD
                        id="dob"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                        style={inputStyle}
                    />
                </div>
                <div style={formGroupStyle}>
                    <label htmlFor="gender" style={labelStyle}>Gender:</label>
                    <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                        style={inputStyle}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
                <button type="submit" disabled={loading} style={{ ...submitButtonStyle, backgroundColor: loading ? '#ccc' : '#007bff' }}>
                    {loading ? 'Saving...' : (isEditMode ? 'Update Patient' : 'Add Patient')}
                </button>
                <button type="button" onClick={() => navigate('/patients')} style={{ ...submitButtonStyle, backgroundColor: '#6c757d', marginLeft: '10px' }}>
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

export default PatientFormPage;