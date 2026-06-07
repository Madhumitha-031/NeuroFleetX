import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await axios.post('http://localhost:9090/api/auth/login', {
                username: formData.username,
                password: formData.password
            });

            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userRole', user.role);

            window.dispatchEvent(new Event('authChange'));

            if (user.role === 'SUPERUSER') {
                navigate('/superuser/dashboard');
            } else if (user.role === 'DRIVER') {
                navigate('/driver/dashboard');
            } else if (user.role === 'MANAGER') {
                navigate('/manager/dashboard');
            } else {
                navigate('/customer/dashboard');
            }
        } catch (err) {
            console.error(err);
            setError("Login failed. Check credentials.");
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <h2 className="text-center mb-4">Welcome Back</h2>

                {error && <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="form-label">Email / Username</label>
                        <input
                            type="text"
                            name="username"
                            className="form-input"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Login
                    </button>
                </form>
                <p className="text-center mt-4" style={{ fontSize: '0.9rem' }}>
                    Don't have an account? <a href="/register" style={{ color: 'var(--primary-color)' }}>Register</a>
                </p>
                <p className="text-center" style={{ fontSize: '0.9rem' }}>
                    <a href="/forgot-password" style={{ color: '#64748b' }}>Forgot Password?</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
