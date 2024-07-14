import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import View from './components/View';
import Home from './components/Home';
import UserManagement from './components/UserManagement';
import UserMember from './components/UserMember';
import Report from './components/Report';
import IncidentForm from './components/Incident-Form';
import Time from './components/Times';
import Cardview from './components/Cardviews';
import AdminManagement from './components/AdminManagement';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/time" element={<Time />} />
                <Route path="/dashboard" element={<AdminDashboard />} />
                <Route path="/Management" element={<AdminManagement />} />
                <Route path="/User" element={<UserManagement />} />
                <Route path="/Member" element={<UserMember />} />
                <Route path="/รายงาน" element={<Report />} />
                <Route path="/รายละเอียด" element={<View />} />
                <Route path="/UserDashboard" element={<UserDashboard />} />
                <Route path="/ข้อมูล" element={<Cardview />} />
                <Route path="/incident-form/:id?" element={<IncidentForm />} />
                <Route path="/เพิ่ม/:id?" element={<Home />} />
                <Route path="/ข้อมูล/:id?" element={<Time />} />
                <Route path="/" element={<View />} />
            </Routes>
        </Router>
    );
}

export default App;