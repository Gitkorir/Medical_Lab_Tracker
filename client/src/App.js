import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import DashboardPage from './pages/DashboardPage';
import PatientListPage from './pages/PatientListPage';
import PatientFormPage from './pages/PatientFormPage';
import PatientDetailPage from './pages/PatientDetailPage';
import LabTestFormPage from './pages/LabTestFormPage'; // New: For adding lab tests
import ReferenceRangePage from './pages/ReferenceRangePage'; // Assuming this component exists

// A simple PrivateRoute component
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    const { isAuthenticated, logout, user } = useAuth();

    return (
        <Router>
            <nav style={navStyle}>
                <ul style={ulStyle}>
                    <li style={liStyle}><Link to="/" style={navLinkStyle}>Home</Link></li>
                    {isAuthenticated && (
                        <>
                            <li style={liStyle}><Link to="/dashboard" style={navLinkStyle}>Dashboard</Link></li>
                            <li style={liStyle}><Link to="/patients" style={navLinkStyle}>Patients</Link></li>
                            {user?.role === 'admin' && (
                                <li style={liStyle}><Link to="/reference-ranges" style={navLinkStyle}>Reference Ranges</Link></li>
                            )}
                        </>
                    )}
                </ul>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {isAuthenticated ? (
                        <>
                            <span style={{ marginRight: '15px', color: '#555' }}>Hello, {user?.name || 'User'}</span>
                            <button onClick={logout} style={logoutButtonStyle}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ ...navLinkStyle, marginRight: '15px' }}>Login</Link>
                            <Link to="/register" style={navLinkStyle}>Register</Link>
                        </>
                    )}
                </div>
            </nav>

            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegistrationPage />} />
                <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                    <PrivateRoute><DashboardPage /></PrivateRoute>
                } />
                <Route path="/patients" element={
                    <PrivateRoute><PatientListPage /></PrivateRoute>
                } />
                <Route path="/patients/new" element={
                    <PrivateRoute><PatientFormPage /></PrivateRoute>
                } />
                <Route path="/patients/edit/:id" element={
                    <PrivateRoute><PatientFormPage /></PrivateRoute>
                } />
                <Route path="/patients/:id" element={
                    <PrivateRoute><PatientDetailPage /></PrivateRoute>
                } />
                <Route path="/patients/:id/add-test" element={
                    <PrivateRoute><LabTestFormPage /></PrivateRoute>
                } />
                <Route path="/reference-ranges" element={
                    <PrivateRoute>
                        {user?.role === 'admin' ? <ReferenceRangePage /> : <Navigate to="/dashboard" replace />}
                    </PrivateRoute>
                } />
            </Routes>
        </Router>
    );
}

const navStyle = {
    backgroundColor: '#f8f9fa',
    padding: '10px 20px',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const ulStyle = {
    display: 'flex',
    listStyle: 'none',
    padding: 0,
    margin: 0
};

const liStyle = {
    marginRight: '15px'
};

const navLinkStyle = {
    color: '#007bff',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
    fontSize: '16px'
};

const logoutButtonStyle = {
    ...navLinkStyle,
    background: 'none',
    border: 'none',
    cursor: 'pointer'
};

export default App;
