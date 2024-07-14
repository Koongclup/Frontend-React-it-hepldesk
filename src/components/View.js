import React, { useState, useEffect } from 'react';
import { Container, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, Box, Card, Grid, CardContent, TablePagination, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
//import Swal from 'sweetalert2';
import NavbarOut from './NavbarOut'; // Adjust the path as necessary
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [incidents, setIncidents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [incidentStats, setIncidentStats] = useState({ total: 0, inprogress: 0, closed: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        fetchIncidents();
        fetchIncidentStats();
    }, []);

    const fetchIncidents = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/jobnews');
            // Sort incidents by id in descending order
            const sortedIncidents = response.data.sort((a, b) => b.id - a.id);
            setIncidents(sortedIncidents);
        } catch (error) {
            console.error('Error fetching incidents:', error); /*
            Swal.fire({
                title: 'Error',
                text: 'Failed to fetch incidents',
                icon: 'error',
                position: 'right-top',
                confirmButtonText: 'OK',
            }); */
        }
    };

    const fetchIncidentStats = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/jobnews/stats');
            setIncidentStats(response.data);
        } catch (error) {
            console.error('Error fetching incident stats:', error);
            /*
            Swal.fire({
                title: 'Error',
                text: 'Failed to fetch incident stats',
                icon: 'error',
                confirmButtonText: 'OK',
            }); */
        }
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
            <NavbarOut />
            <Container maxWidth="xl" sx={{ marginTop: '2rem' }}>
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
                                    In progress Incidents
                                </Typography>
                                <Typography variant="h4" component="div">
                                    {incidentStats.inprogress}
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

            <Container maxWidth="xl" sx={{ marginTop: '2rem' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
                    <Typography variant="h4">Incident Management</Typography>
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
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate(`/เพิ่ม`)}>
                        Add Incident
                    </Button>
                </Box>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Id</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Request</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedIncidents.map((incident) => (
                            <TableRow key={incident.id}>
                                <TableCell>I#{incident.id}</TableCell>
                                <TableCell>{incident.title}</TableCell>
                                <TableCell>{incident.description}</TableCell>
                                <TableCell>{incident.jobtype}</TableCell>
                                <TableCell>{incident.requestby}</TableCell>
                                <TableCell>{incident.status}</TableCell>
                                <TableCell align="right">
                                    <Button color="primary" onClick={() => navigate(`/เพิ่ม/${incident.id}`)}>View</Button>
                                    <Button color="primary" onClick={() => navigate(`/ข้อมูล/${incident.id}`)}>time</Button>
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
            </Container>
        </>
    );
};

export default Dashboard;
