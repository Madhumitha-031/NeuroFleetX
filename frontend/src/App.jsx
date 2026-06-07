import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DriverDashboard from './pages/DriverDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Verify from './pages/Verify';
import SuperuserDashboard from './pages/SuperuserDashboard';
import Profile from './pages/Profile';
import AccountPage from './pages/AccountPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const AppContent = () => {
    const location = useLocation();
    const isDashboard = location.pathname.includes('dashboard');
    const isLoggedIn = !!localStorage.getItem('token');

    return (
        <div className="App">
            {!isDashboard && <Navbar />}
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/driver/dashboard" element={<DriverDashboard />} />
                <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                <Route path="/superuser/dashboard" element={<SuperuserDashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify" element={<Verify />} />
            </Routes>
        </div>
    );
};

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AppContent />
            </ThemeProvider>
        </Router>
    );
}

export default App;
