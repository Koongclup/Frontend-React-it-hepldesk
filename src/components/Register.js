import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const switchToLogin = () => {
        navigate('/login');
    };

    const validate = () => {
        const errors = {};
        if (!username) {
            errors.username = 'Username is required';
        }
        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        if (!role) {
            errors.role = 'Role is required';
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/register', { username, password, role });
            Swal.fire('Success', 'Registration successful', 'success');
            navigate('/login');
        } catch (error) {
            Swal.fire('Error', 'Registration failed', 'error');
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ marginTop: '5rem' }}>
            <Typography variant="h4" gutterBottom>Register</Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    error={!!errors.username}
                    helperText={errors.username}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    error={!!errors.role}
                    helperText={errors.role}
                    fullWidth
                    margin="normal"
                />
                <Button type="submit" variant="contained" color="primary">Register</Button>
            </form>
            <Box mt={2}>
                <Typography variant="body2">
                    Already have an account? <Button onClick={switchToLogin} color="primary">Login</Button>
                </Typography>
            </Box>
        </Container>
    );
};

export default Register;
