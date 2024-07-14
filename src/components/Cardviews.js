import React, { useState, useEffect } from 'react';
import { Container, Button, TextField, Typography, Box, Card, Grid, CardContent, InputAdornment, Pagination ,Avatar} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
//import Swal from 'sweetalert2';
import NavbarOut from './NavbarOut'; // Adjust the path as necessary
import { useNavigate } from 'react-router-dom';
import { deepOrange } from '@mui/material/colors'; // Import deepOrange color

const Cardview = () => {
    const [incidents, setIncidents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(6); // Rows per page is constant, no need for setRowsPerPage
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
            console.error('Error fetching incidents:', error);/*
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
            console.error('Error fetching incident stats:', error); /*
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
        setPage(1); // Reset to the first page whenever search query changes
    };

    const handleChangePage = (event, value) => {
        setPage(value);
    };

    const filteredIncidents = incidents.filter(
        (incident) =>
            incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            incident.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedIncidents = filteredIncidents.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    return (
        <>
            <NavbarOut />
            <Container maxWidth="xl" sx={{ marginTop: '2rem', marginBottom: '3rem' }}>
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
                <Grid container spacing={3}>
                    {paginatedIncidents.map((incident) => (
                        <Grid item xs={12} sm={6} md={4} key={incident.id}>
                            <Card>
                                <CardContent>
                                    
                                <Avatar  sx={{ bgcolor: deepOrange[500] }}>{incident.id}</Avatar>
                                
                                    <Typography variant="h6" component="div">
                                        {incident.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {incident.description}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        <strong>Type:</strong> {incident.jobtype}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        <strong>Request:</strong> {incident.requestby}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        <strong>Status:</strong> {incident.status}
                                    </Typography>
                                    <Box display="flex" justifyContent="space-between" mt={2}>
                                        <Button color="primary" onClick={() => navigate(`/เพิ่ม/${incident.id}`)}>View</Button>
                                        <Button color="primary" onClick={() => navigate(`/ข้อมูล/${incident.id}`)}>Time</Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <Box display="flex" justifyContent="center" my={4}>
                    <Pagination
                        count={Math.ceil(filteredIncidents.length / rowsPerPage)}
                        page={page}
                        onChange={handleChangePage}
                        color="primary"
                    />
                </Box>
            </Container>
        </>
    );
};

export default Cardview;
