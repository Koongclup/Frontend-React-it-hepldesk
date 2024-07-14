import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Alert, Grid, FormControl } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';
import ErrorBoundary from './ErrorBoundary';  // Import the ErrorBoundary component
import Outbar from './NavbarOut'; // Adjust the path as necessary

const IncidentForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('OPEN');
    const [requestby, setRequestBy] = useState(null);
    const [jobType, setJobType] = useState(null);
    const [incidentTypes, setIncidentTypes] = useState([]);
    const [listusers, setListUsers] = useState([]);
    const [alert, setAlert] = useState({ show: false, severity: '', message: '' });
    const [errors, setErrors] = useState({})
    const navigate = useNavigate();
    const { id } = useParams();
    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:5000/api/jobnews/${id}`)
                .then(response => {
                    const incident = response.data;
                    setTitle(incident.title);
                    setDescription(incident.description);
                    setStatus(incident.status);
                    const requestType = incidentTypes.find(type => type.list_unit === incident.jobtype);
                    const requestUser = listusers.find(user => user.fullname === incident.requestby);
                    setJobType(requestType);
                    setRequestBy(requestUser);
                })
                .catch(error => {
                    showAlert('error', 'Failed to fetch incident');
                });
        }
    }, [id, incidentTypes, listusers]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/typeincidents')
            .then(response => {
                setIncidentTypes(response.data);
            })
            .catch(error => {
                //showAlert('error', 'Failed to fetch incident types');
            });
    }, []);

    useEffect(() => {
        axios.get('http://localhost:5000/api/listusers')
            .then(response => {
                setListUsers(response.data);
            })
            .catch(error => {
                //showAlert('error', 'Failed to fetch users');
            });
    }, []);

    const validateIncident = () => {
        const errors = {};

        if (!title) {
            errors.title = 'Title is required';
        }
        if (!description) {
            errors.description = 'Description is required';
        }
        if (!requestby) {
            errors.requestby = 'Request By is required';
        }
        if (!status) {
            errors.status = 'status By is required';
        }
        if (!jobType) {
            errors.jobType = 'Type is required';
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateIncident();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const incidentData = {
            title,
            description,
            status,
            requestby: requestby ? requestby.fullname : '',
            jobtype: jobType ? jobType.list_unit : ''
        };

        try {
            if (id) {
                await axios.put(`http://localhost:5000/api/incidents/${id}`, incidentData);
                showAlert('success', 'Incident updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/jobnews', incidentData);
                showAlert('success', 'Incident created successfully');
            }

            // Clear form fields and reset state after successful submit
            setTitle('');
            setDescription('');
            setStatus('open');
            setRequestBy(null);
            setJobType(null);
           

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

    const backView = () => {
        navigate(-1); // Navigate back to the previous page
    };

    return (
        <div>
            <Outbar />
            <ErrorBoundary>
                <Container maxWidth="lg" sx={{ marginTop: '3rem' }}>
                    <Typography variant="h4" gutterBottom>{id ? 'Edit Incident' : 'Create Incident'}</Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={7} sm={7}>
                                <TextField
                                    label="Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    
                                    error={!!errors.title}
                                    helperText={errors.title}
                                />
                            </Grid>

                            <Grid item xs={5} sm={5}>
                                <FormControl fullWidth margin="normal">
                                    <Autocomplete
                                        options={incidentTypes}
                                        getOptionLabel={(option) => option.list_unit}
                                        value={jobType}
                                        onChange={(e, newValue) => setJobType(newValue)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Type"
                                                
                                                error={!!errors.jobType}
                                                helperText={errors.jobType}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={12}>
                                <TextField
                                    label="Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    
                                    error={!!errors.description}
                                    helperText={errors.description}
                                />
                            </Grid>

                            <Grid item xs={6} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <Autocomplete
                                        options={listusers}
                                        getOptionLabel={(option) => option.fullname}
                                        value={requestby}
                                        onChange={(e, newValue) => setRequestBy(newValue)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Request By"
                                              
                                                error={!!errors.requestby}
                                                helperText={errors.requestby}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Grid>

                            <Grid item xs={6} sm={6}>
                                <TextField
                                    label="Status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    readOnly=  "true"                                    
                                    error={!!errors.status}
                                    helperText={errors.status}
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                        <Button type="submit" variant="contained" color="primary" sx={{ marginTop: '16px', mr: 2 }}>
                            {id ? 'OK' : 'Create'}
                        </Button>
                        <Button variant="outlined" color="primary" onClick={backView} sx={{ marginTop: '16px' }}>
                            Back to Previous Page
                        </Button>
                    </form>
                    {alert.show && (
                        <Alert
                            severity={alert.severity}
                            onClose={() => setAlert({ show: false, severity: '', message: '' })}
                            sx={{ position: 'absolute', top: '1rem', right: '1rem' }}
                        >
                            {alert.message}
                        </Alert>
                    )}
                </Container>
            </ErrorBoundary>
        </div>
    );
};

export default IncidentForm;
