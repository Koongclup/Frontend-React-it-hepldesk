import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import ResponsiveAppBar from './ResponsiveAppBar';

const IncidentForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('open');
    const [alert, setAlert] = useState({ show: false, severity: '', message: '' });
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:5000/api/incidents/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(response => {
                    const incident = response.data;
                    setTitle(incident.title);
                    setDescription(incident.description);
                    setStatus(incident.status);
                })
                .catch(error => {
                    showAlert('error', 'Failed to fetch incident');
                });
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation checks
        if (!title.trim()) {
            showAlert('error', 'Title is required.');
            return;
        }

        if (!description.trim()) {
            showAlert('error', 'Description is required.');
            return;
        }

        const incidentData = { title, description, status };

        try {
            if (id) {
                await axios.put(`http://localhost:5000/api/incidents/${id}`, incidentData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                showAlert('success', 'Incident updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/incidents', incidentData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                showAlert('success', 'Incident created successfully');
            }
            navigate('/dashboard');
        } catch (error) {
            if (error.response) {
                showAlert('error', error.response.data.message || 'Failed to save incident');
            } else if (error.request) {
                console.log(error.request);
                showAlert('error', 'No response received from server');
            } else {
                console.log('Error', error.message);
                showAlert('error', error.message || 'Failed to send request');
            }
        }
    };

    const showAlert = (severity, message) => {
        setAlert({ show: true, severity, message });
        setTimeout(() => {
            setAlert({ show: false, severity: '', message: '' });
        }, 5000); // 5000 milliseconds = 5 seconds
    };

    return (
        <>
            <ResponsiveAppBar />
        <Container maxWidth="md" sx={{ marginTop: '3rem' }}>
            <Typography variant="h4" gutterBottom>{id ? 'Edit Incident' : 'Create Incident'}</Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                    error={title.trim() === ''}
                    helperText={title.trim() === '' ? 'Title is required' : ' '}
                />
                <TextField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                    error={description.trim() === ''}
                    helperText={description.trim() === '' ? 'Description is required' : ' '}
                />
                <TextField
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <Button type="submit" variant="contained" color="primary">{id ? 'Update' : 'Create'}</Button>
            </form>
            {alert.show && (
                <Alert severity={alert.severity} onClose={() => setAlert({ show: false, severity: '', message: '' })} sx={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    {alert.message}
                </Alert>
            )}
        </Container>
        </>
    );
};

export default IncidentForm;
