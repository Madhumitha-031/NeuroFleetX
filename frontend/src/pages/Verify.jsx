import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Verify = () => {
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
    const [message, setMessage] = useState('Verifying your application...');
    const navigate = useNavigate();

    useEffect(() => {
        const verifyAccount = async () => {
            if (!code) {
                setMessage("Invalid verification link.");
                return;
            }
            try {
                await axios.get(`http://localhost:9090/api/auth/verify?code=${code}`);
                setMessage("Verification Successful! Accessing your account...");
                setTimeout(() => navigate('/login'), 2000);
            } catch (err) {
                setMessage("Verification Failed. Link expired or invalid.");
            }
        };
        verifyAccount();
    }, [code, navigate]);

    return (
        <div className="container" style={{ padding: '8rem 1rem', textAlign: 'center' }}>
            <div className="card shadowed" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <h2 className="mb-4">NeuroFleetX Verify</h2>
                <div style={{ padding: '1.5rem', background: 'var(--secondary-color)', borderRadius: '12px', fontWeight: 'bold' }}>
                    {message}
                </div>
            </div>
        </div>
    );
};

export default Verify;
