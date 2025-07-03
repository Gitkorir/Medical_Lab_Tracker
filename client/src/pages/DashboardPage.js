import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
    const { user, isAuthenticated } = useAuth();
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSummaryData = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/dashboard/summary');
            setSummaryData(response.data);
        } catch (err) {
            setError('Failed to fetch dashboard summary. Please try again later.');
            console.error('Error fetching dashboard summary:', err.response?.data || err.message);
            // If the error is due to authentication, you might want to log out
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                // Optionally handle logout or token refresh if needed
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchSummaryData();
    }, [fetchSummaryData]);

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading dashboard data...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>{error}</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '20px' }}>
                Dashboard Overview
            </h2>

            {user && (
                <p style={{ fontSize: '1.1em', marginBottom: '30px' }}>
                    Welcome, <span style={{ fontWeight: 'bold', color: '#007bff' }}>{user.name}</span> ({user.role})! Here's a quick summary of your lab data.
                </p>
            )}

            {summaryData ? (
                <div style={summaryGridStyle}>
                    <div style={summaryCardStyle}>
                        <h3>Total Patients</h3>
                        <p style={summaryValueStyle}>{summaryData.patientCount}</p>
                    </div>
                    <div style={summaryCardStyle}>
                        <h3>Total Lab Tests</h3>
                        <p style={summaryValueStyle}>{summaryData.testCount}</p>
                    </div>
                    <div style={{ ...summaryCardStyle, backgroundColor: summaryData.abnormalCount > 0 ? '#ffe0e6' : '#e6ffe0', borderColor: summaryData.abnormalCount > 0 ? '#dc3545' : '#28a745' }}>
                        <h3>Abnormal Results</h3>
                        <p style={{ ...summaryValueStyle, color: summaryData.abnormalCount > 0 ? '#dc3545' : '#28a745' }}>
                            {summaryData.abnormalCount}
                        </p>
                    </div>
                </div>
            ) : (
                <p style={{ textAlign: 'center', color: '#6c757d' }}>No summary data available.</p>
            )}

            <div style={{ marginTop: '50px', textAlign: 'center', color: '#6c757d' }}>
                <p>Use the navigation above to manage patients, lab tests, and reference ranges.</p>
            </div>
        </div>
    );
}

const summaryGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    justifyContent: 'center'
};

const summaryCardStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '25px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '150px'
};

const summaryValueStyle = {
    fontSize: '2.5em',
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: '15px'
};

export default DashboardPage;