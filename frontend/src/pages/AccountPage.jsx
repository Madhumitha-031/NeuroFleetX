import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountSettings from '../components/AccountSettings';

const AccountPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background-color)' }}>
            <nav style={{
                padding: '20px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--surface-color)',
                borderBottom: '1.5px solid var(--border-color)'
            }}>
                <h1 style={{ color: 'var(--primary-color)', margin: 0, fontWeight: 900 }}>NeuroFleetX</h1>
                <button
                    onClick={() => navigate(userRole === 'SUPERUSER' ? '/superuser/dashboard' : userRole === 'AGENT' ? '/agent/dashboard' : '/client/dashboard')}
                    className="btn btn-secondary"
                >
                    Back to Dashboard
                </button>
            </nav>

            <div className="container" style={{ padding: '2rem' }}>
                <AccountSettings userRole={userRole} />
            </div>
        </div>
    );
};

export default AccountPage;
