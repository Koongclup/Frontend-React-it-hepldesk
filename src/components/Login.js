import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Avatar, Snackbar } from '@mui/material';
import { Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Slide from '@mui/material/Slide';
import axios from 'axios';
import NavbarOut from './NavbarOut'; // Adjust the path as necessary

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const navigate = useNavigate();

    const validate = () => {
        const errors = {};
        if (!username) {
            errors.username = 'Username is required';
        }
        if (!password) {
            errors.password = 'Password is required';
        }
        return errors;
    };

    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        try {
            const response = await axios.post('http://localhost:5000/api/login', { username, password });
            localStorage.setItem('token', response.data.token);  // Store token in localStorage
            setAlertSeverity('success');
            setAlertMessage('Login successful');
            setAlertOpen(true);
            // Redirect based on role
            if (response.data.role === 'user') {
                navigate('/UserDashboard');
            } else if (response.data.role === 'admin') {
                setAlertSeverity('success');
                setAlertMessage('Login successful');
                setAlertOpen(true);
                navigate('/dashboard');
            }
        } catch (error) {
            setAlertSeverity('error');
            setAlertMessage('Username หรือ Password ไม่ถูกต้อง');
            setAlertOpen(true);
        }
    };

    return (
        <>
            <NavbarOut />
            <Container component="main" maxWidth="xs" sx={{ marginTop: '6rem' }}>
                <Box
                    sx={{
                        marginTop: 9,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, width: 56, height: 56, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h4">
                        Sign in
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            fullWidth
                            margin="normal"
                            error={!!errors.username}
                            helperText={errors.username}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                            error={!!errors.password}
                            helperText={errors.password}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                    </form>
                </Box>
                <Box mt={2}>
                    <Typography variant="body2">
                        Don't have an account? <Button onClick={() => navigate('/register')} color="primary">Register</Button>
                    </Typography>
                </Box>

                <Snackbar
                    open={alertOpen}
                    autoHideDuration={6000}
                    onClose={handleAlertClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    TransitionComponent={Slide}
                >
                    <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: '100%' }}>
                        {alertMessage}
                    </Alert>
                </Snackbar>
            </Container>
        </>

    );
};

export default Login;
