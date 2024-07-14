import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import ResponsiveAppBar from './ResponsiveAppBar'; // Adjust the path as necessary

const IncidentTable = () => {
    const [incidents, setIncidents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/incidents', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setIncidents(response.data);
            } catch (error) {
                Swal.fire('Error', 'Failed to fetch incidents', 'error');
            }
        };

        fetchIncidents();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/incidents/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setIncidents(incidents.filter(incident => incident.id !== id));
            Swal.fire('Deleted!', 'Incident has been deleted.', 'success');
        } catch (error) {
            Swal.fire('Error', 'Error deleting incident', 'error');
        }
    };

    return (
        
        <>
            <ResponsiveAppBar />
        <Container>
            <Typography variant="h4" gutterBottom>Incident Management</Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/incident-form')}>Create Incident</Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {incidents.map((incident) => (
                        <TableRow key={incident.id}>
                            <TableCell>{incident.title}</TableCell>
                            <TableCell>{incident.description}</TableCell>
                            <TableCell>{incident.status}</TableCell>
                            <TableCell>
                                <Button color="primary" onClick={() => navigate(`/incident-form/${incident.id}`)}>Edit</Button>
                                <Button color="secondary" onClick={() => handleDelete(incident.id)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Container>
        </>
    );
};

export default IncidentTable;
