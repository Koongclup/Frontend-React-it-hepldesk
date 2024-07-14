import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from '../src/components/Login';
import Register from '../src/components/Register';
import AdminDashboard from '../src/components/AdminDashboard';
import UserManagement from '../src/components/UserManagement';
import Report from '../src/components/Report';
import IncidentForm from '../src/components/IncidentForm';
import IncidentTable from '../src/components/IncidentTable';
import IncidentManagement from '../src/components/IncidentManagement';
import AdminManagement from '../src/components/AdminManagement';


function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    // Removed handleLogout function

    const handleLogin = (token) => {
        setIsLoggedIn(true);
        localStorage.setItem('token', token);
    };

    const PrivateRoute = ({ element }) => {
        return isLoggedIn ? element : <Navigate to="/login" />;
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<PrivateRoute element={<AdminDashboard />} />} />
                <Route path="/user-management" element={<PrivateRoute element={<UserManagement />} />} />
                <Route path="/report" element={<PrivateRoute element={<Report />} />} />
                <Route path="/usermanagement" element={<PrivateRoute element={<UserManagement />} />} />
                <Route path="/adminmanagement" element={<PrivateRoute element={<AdminManagement />} />} />
                <Route path="/incidents" element={<PrivateRoute element={<IncidentManagement />} />} />
                <Route path="/incidentform/:id?" element={<PrivateRoute element={<IncidentForm />} />} />
                <Route path="/incidenttable" element={<PrivateRoute element={<IncidentTable />} />} />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;


