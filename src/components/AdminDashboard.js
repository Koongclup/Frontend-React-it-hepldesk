import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Typography, Grid, Card, CardContent, Table, TableContainer, TableHead, TableBody, TableRow, TableCell, TablePagination, TextField, Button, Box, InputAdornment } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import ResponsiveAppBar from './ResponsiveAppBar';

import GetAppIcon from '@mui/icons-material/GetApp';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const AdminDashboard = () => {
    const [incidents, setIncidents] = useState([]);
    const [usersCount, setUsersCount] = useState(0);
    const [incidentData, setIncidentData] = useState([]);

    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5000/api/jobnews')
            .then(response => {
                setIncidentData(response.data);
            })
            .catch(error => {
                console.error('Error fetching incident data:', error);
            });
    }, []);

    const handleRequestError = useCallback((error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            Swal.fire('Session Timeout', 'Please log in again', 'warning').then(() => {
                navigate('/รายละเอียด');
            });
        } else {
            Swal.fire('Error', 'Something went wrong', 'error');
            console.error('Request error:', error);
        }
    }, [navigate]);

    const fetchIncidents = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/incidents', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setIncidents(response.data);
        } catch (error) {
            handleRequestError(error);
        }
    }, [handleRequestError]);

    const fetchUsersCount = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/users/count', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUsersCount(response.data.count);
        } catch (error) {
            handleRequestError(error);
        }
    }, [handleRequestError]);

    useEffect(() => {
        fetchIncidents();
        fetchUsersCount();
    }, [fetchIncidents, fetchUsersCount]);

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
                    await axios.delete(`http://localhost:5000/api/incidents/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    Swal.fire('Deleted!', 'Incident deleted successfully', 'success');
                    fetchIncidents();
                } catch (error) {
                    Swal.fire('Error', 'Failed to delete incident', 'error');
                    console.error('Delete incident error:', error);
                }
            }
        });
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredIncidents = useMemo(() => {
        return incidents.filter(incident =>
            incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [incidents, searchTerm]);

    const paginatedIncidents = useMemo(() => {
        return filteredIncidents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredIncidents, page, rowsPerPage]);

    const handleExportToExcel = () => {
        // Implement export functionality
        console.log('Implement export to Excel');
    };

    const handlePrint = () => {
        // Implement print functionality
        window.print();
    };

    const getStatusData = () => {
        const statusCount = incidentData.reduce((acc, incident) => {
            acc[incident.status] = (acc[incident.status] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(statusCount).map(([status, count]) => ({
            name: status,
            y: count
        }));
    };

    const getStatusSeriesData = () => {
        const statusCount = incidentData.reduce((acc, incident) => {
            acc[incident.status] = (acc[incident.status] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(statusCount).map(([status, count]) => ({
            name: status,
            data: [count]
        }));
    };

    const pieOptions = {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Incident Status Distribution'
        },
        series: [{
            name: 'Incidents',
            colorByPoint: true,
            data: getStatusData()
        }]
    };

    const columnOptions = {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Incident Status Count'
        },
        xAxis: {
            categories: ['Status']
        },
        yAxis: {
            title: {
                text: 'Count'
            }
        },
        series: getStatusSeriesData()
    };

    return (
        <>
            <ResponsiveAppBar />
            <Container maxWidth="xl" sx={{ marginTop: '2rem' }}>
                <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card onClick={() => navigate('/Management')}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Total Incidents
                                </Typography>
                                <Typography variant="h4">{incidents.length}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card onClick={() => navigate('/User')}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Total Users
                                </Typography>
                                <Typography variant="h4">{usersCount}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card onClick={() => navigate('/Member')}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Active Users
                                </Typography>
                                <Typography variant="h4">6</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            <Container maxWidth="xl" sx={{ marginTop: '2rem' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <div>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={pieOptions}
                                    />

                                </div>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={8}>
                        <Card>
                            <CardContent>
                                <div className="mixed-chart">
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={columnOptions}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            <Container maxWidth="xl" sx={{ marginTop: '2rem' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
                    <Typography variant="h4">Incident Management</Typography>
                    <Box>
                        <Button color="primary" variant="outlined" startIcon={<AddIcon />} onClick={() => navigate(`/incident-form/`)}>Add</Button>
                        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ marginRight: 1 }}>
                            Print
                        </Button>
                        <Button variant="outlined" startIcon={<GetAppIcon />} onClick={handleExportToExcel} sx={{ marginRight: 1 }}>
                            Excel
                        </Button>
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedIncidents.map((incident) => (
                                <TableRow key={incident.id}>
                                    <TableCell>{incident.title}</TableCell>
                                    <TableCell>{incident.description}</TableCell>
                                    <TableCell>{incident.status}</TableCell>
                                    <TableCell align="right">
                                        <Button color="primary" onClick={() => navigate(`/incident-form/${incident.id}`)}>Edit</Button>
                                        <Button color="secondary" onClick={() => handleDelete(incident.id)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredIncidents.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                />
            </Container>
        </>
    );
};

export default AdminDashboard;
