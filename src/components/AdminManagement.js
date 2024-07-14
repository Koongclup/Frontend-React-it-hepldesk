import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    Container, Button, Table, TableBody, TableCell, TableHead, TableRow,
    Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography,
    IconButton, Box, Card, Grid, CardContent, TablePagination, InputAdornment, Select, MenuItem, FormControl, InputLabel, Snackbar, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import ResponsiveAppBar from './ResponsiveAppBar';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

const AdminManagement = () => {
    const [incidents, setIncidents] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentIncident, setCurrentIncident] = useState({ title: '', description: '', status: 'open' });
    const [isEdit, setIsEdit] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [incidentStats, setIncidentStats] = useState({ total: 0, open: 0, inprogress: 0, closed: 0 });
    const [alert, setAlert] = useState({ open: false, severity: '', message: '' });
    const tableRef = useRef();

    const fetchIncidents = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/incidents', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIncidents(response.data);
        } catch (error) {
            console.error('Error fetching incidents:', error);
            showAlert('error', 'Failed to fetch incidents');
        }
    }, []);

    const fetchIncidentStats = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/incidents/stats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIncidentStats(response.data);
        } catch (error) {
            console.error('Error fetching incident stats:', error);
            showAlert('error', 'Failed to fetch incident stats');
        }
    }, []);

    useEffect(() => {
        fetchIncidents();
        fetchIncidentStats();
    }, [fetchIncidents, fetchIncidentStats]);

    const handleOpen = (incident = { title: '', description: '', status: 'open' }) => {
        setCurrentIncident(incident);
        setIsEdit(!!incident.id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentIncident({ title: '', description: '', status: 'open' });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!currentIncident.title.trim() || !currentIncident.description.trim() || !currentIncident.status.trim()) {
                showAlert('warning', 'Please check input');
                return;
            }

            if (isEdit) {
                await axios.put(`http://localhost:5000/api/incidents/${currentIncident.id}`, currentIncident, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                showAlert('success', 'Incident updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/incidents', currentIncident, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                showAlert('success', 'Incident added successfully');
            }
            fetchIncidents();
            fetchIncidentStats();
            handleClose();
        } catch (error) {
            console.error('Error saving incident:', error);
            showAlert('error', 'Failed to save incident');
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
                    showAlert('success', 'Incident deleted successfully');
                    fetchIncidents();
                    fetchIncidentStats();
                } catch (error) {
                    console.error('Error deleting incident:', error);
                    showAlert('error', 'Failed to delete incident');
                }
            }
        });
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredIncidents = useMemo(() => incidents.filter(
        (incident) =>
            incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            incident.description.toLowerCase().includes(searchQuery.toLowerCase())
    ), [incidents, searchQuery]);

    const paginatedIncidents = useMemo(() => filteredIncidents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filteredIncidents, page, rowsPerPage]);

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredIncidents);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidents');
        XLSX.writeFile(workbook, 'incidents.xlsx');
    };

    const handlePrint = useReactToPrint({
        content: () => tableRef.current,
    });

    const showAlert = (severity, message) => {
        setAlert({ open: true, severity, message });
    };

    const handleAlertClose = () => {
        setAlert({ open: false, severity: '', message: '' });
    };

    return (
        <>
            <ResponsiveAppBar />
            <Container maxWidth="xl" sx={{ marginTop: '2rem' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3} sm={6}>
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
                    <Grid item xs={12} md={3} sm={6}>
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
                    <Grid item xs={12} md={3} sm={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    In Progress Incidents
                                </Typography>
                                <Typography variant="h4" component="div">
                                    {incidentStats.inprogress}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3} sm={6}>
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
            <Container maxWidth="xl" sx={{ marginTop: '2rem' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
                    <Typography variant="h4">Incident Management</Typography>
                    <Box>
                        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ marginRight: 1 }}>
                            Print
                        </Button>
                        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportExcel} sx={{ marginRight: 1 }}>
                            Export to Excel
                        </Button>
                        <TextField
                            variant="outlined"
                            size="small"
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
                        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ marginLeft: 1 }}>
                            Add Incident
                        </Button>
                    </Box>
                </Box>
                <Table ref={tableRef}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created Date</TableCell>
                            <TableCell>Request By</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedIncidents.map((incident) => (
                            <TableRow key={incident.id}>
                                <TableCell>{incident.title}</TableCell>
                                <TableCell>{incident.description}</TableCell>
                                <TableCell>{incident.jobtype}</TableCell>
                                <TableCell>{incident.status}</TableCell>
                                <TableCell>{incident.create_date}</TableCell>
                                <TableCell>{incident.requestby}</TableCell>
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
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={currentIncident.status}
                                onChange={(e) => setCurrentIncident({ ...currentIncident, status: e.target.value })}
                                disabled={!isEdit} // Disable when adding new incident
                            >
                                <MenuItem value="in progress">In Progress</MenuItem>
                                <MenuItem value="closed">Closed</MenuItem>
                            </Select>
                        </FormControl>
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
                <Snackbar
                    open={alert.open}
                    autoHideDuration={6000}
                    onClose={handleAlertClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert onClose={handleAlertClose} severity={alert.severity} sx={{ width: '100%' }}>
                        {alert.message}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
};

export default AdminManagement;
