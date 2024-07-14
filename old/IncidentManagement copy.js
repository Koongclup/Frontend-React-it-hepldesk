import React, { useState, useEffect } from 'react';
import { Container, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, IconButton, Box, Card, Grid, CardContent, TablePagination, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import Swal from 'sweetalert2';
import ResponsiveAppBar from '../src/components/ResponsiveAppBar'; // Adjust the path as necessary

const IncidentManagement = () => {
    const [incidents, setIncidents] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentIncident, setCurrentIncident] = useState({ title: '', description: '' });
    const [isEdit, setIsEdit] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [incidentStats, setIncidentStats] = useState({ total: 0, open: 0, closed: 0 });

    useEffect(() => {
        fetchIncidents();
        fetchIncidentStats();
    }, []);

    const fetchIncidents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/incidents', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIncidents(response.data);
        } catch (error) {
            console.error('Error fetching incidents:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to fetch incidents',
                icon: 'error',
                position: 'right-top',
                confirmButtonText: 'OK',
            });
        }
    };

    const fetchIncidentStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/incidents/stats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIncidentStats(response.data);
        } catch (error) {
            console.error('Error fetching incident stats:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to fetch incident stats',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    const handleOpen = (incident = { title: '', description: '' }) => {
        setCurrentIncident(incident);
        setIsEdit(!!incident.id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentIncident({ title: '', description: '' });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            if (isEdit) {
                await axios.put(`http://localhost:5000/api/incidents/${currentIncident.id}`, currentIncident, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                Swal.fire('Updated!', 'Incident updated successfully', 'success');
            } else {
                await axios.post('http://localhost:5000/api/incidents', currentIncident, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                Swal.fire('Added!', 'Incident added successfully', 'success');
            }
            fetchIncidents();
            fetchIncidentStats(); // Fetch updated incident stats
            handleClose();
        } catch (error) {
            console.error('Error saving incident:', error);
            Swal.fire('Error', 'Failed to save incident', 'error');
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('token');
                    await axios.delete(`http://localhost:5000/api/incidents/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    Swal.fire('Deleted!', 'Incident deleted successfully', 'success');
                    fetchIncidents();
                    fetchIncidentStats(); // Fetch updated incident stats
                } catch (error) {
                    console.error('Error deleting incident:', error);
                    Swal.fire('Error', 'Failed to delete incident', 'error');
                }
            }
        });
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setPage(0); // Reset to the first page whenever search query changes
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredIncidents = incidents.filter(
        (incident) =>
            incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            incident.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedIncidents = filteredIncidents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <>
            <ResponsiveAppBar />

            <Container sx={{ marginTop: '2rem' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    Total Incidents
                                </Typography>
                                <Typography variant="h4" component="div">
                                    {incidentStats.total}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    Open Incidents
                                </Typography>
                                <Typography variant="h4" component="div">
                                    {incidentStats.open}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    Closed Incidents
                                </Typography>
                                <Typography variant="h4" component="div">
                                    {incidentStats.closed}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            <Container sx={{ marginTop: '2rem' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
                    <Typography variant="h4">Incident Management</Typography>
                    <TextField
                        variant="outlined"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                        Add Incident
                    </Button>
                </Box>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedIncidents.map((incident) => (
                            <TableRow key={incident.id}>
                                <TableCell>{incident.title}</TableCell>
                                <TableCell>{incident.description}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleOpen(incident)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="secondary" onClick={() => handleDelete(incident.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredIncidents.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{isEdit ? 'Edit Incident' : 'Add Incident'}</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Title"
                            value={currentIncident.title}
                            onChange={(e) => setCurrentIncident({ ...currentIncident, title: e.target.value })}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Description"
                            value={currentIncident.description}
                            onChange={(e) => setCurrentIncident({ ...currentIncident, description: e.target.value })}
                            fullWidth
                            margin="normal"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} color="primary">
                            {isEdit ? 'Save Changes' : 'Add Incident'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </>
    );
};

export default IncidentManagement;