import React, { useState, useEffect } from 'react';
import { Container, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog,
     DialogActions, DialogContent, DialogTitle, TextField, Typography,  Box, Card, Grid, CardContent, TablePagination, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

/*
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; */
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import Swal from 'sweetalert2';
import NavbarOut from './NavbarOut'; // Adjust the path as necessary
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const Dashboard = () => {
    const [incidents, setIncidents] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentIncident, setCurrentIncident] = useState({ title: '', description: '' });
    const [isEdit, setIsEdit] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [incidentStats, setIncidentStats] = useState({ total: 0, inprogress: 0, closed: 0 });

    useEffect(() => {
        fetchIncidents();
        fetchIncidentStats();
    }, []);

    const [incidentData, setIncidentData] = useState([]);

    useEffect(() => {
      axios.get('http://localhost:5000/api/jobnews')
        .then(response => {
          setIncidentData(response.data);
        })
        .catch(error => {
          console.error('Error fetching incident data:', error);
        });
    }, []);
  
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
  

    const fetchIncidents = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/jobnews');
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
            const response = await axios.get('http://localhost:5000/api/jobnews/stats');
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
          
            // Check if title or description is empty
            if (!currentIncident.title.trim() || !currentIncident.description.trim()) {
                Swal.fire({
                    
                    title: '<span style="color:#ffc107">Please check input</span>',
                    showConfirmButton: false,
                    timer: 1500,
                    position: 'top-end',
                   
                    customClass: {
                      title: 'text-center'
                    }
                  });
                  
                return;
            }
    
            if (isEdit) {
                await axios.put(`http://localhost:5000/api/jobnews/${currentIncident.id}`, currentIncident);
                Swal.fire('Updated!', 'Incident updated successfully', 'success');
            } else {
                await axios.post('http://localhost:5000/api/jobnews', currentIncident);
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
    
    /*
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
                    
                    await axios.delete(`http://localhost:5000/api/jobnews/${id}`);
                    Swal.fire('Deleted!', 'Incident deleted successfully', 'success');
                    fetchIncidents();
                    fetchIncidentStats(); // Fetch updated incident stats
                } catch (error) {
                    console.error('Error deleting incident:', error);
                    Swal.fire('Error', 'Failed to delete incident', 'error');
                }
            }
        });
    }; */

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

                <Grid container spacing={3} sx={{ marginTop: '2rem' }}>
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

            <Container maxWidth="xl"  sx={{ marginTop: '2rem' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
                    <Typography variant="h4">Incident Management</Typography>
                    <TextField
                        variant="outlined"
                        size="small" // Small input field size
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
                            <TableCell>Type</TableCell>
                            <TableCell>Request</TableCell>
                            <TableCell>Status</TableCell>
                           {/* <TableCell align="right">Actions</TableCell> */ }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedIncidents.map((incident) => (
                            <TableRow key={incident.id}>
                                <TableCell>{incident.title}</TableCell>
                                <TableCell>{incident.description}</TableCell>
                               
                                <TableCell>{incident.jobtype}</TableCell>
                                <TableCell>{incident.requestby}</TableCell>
                                <TableCell>{incident.status}</TableCell>
                               {/* <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleOpen(incident)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="secondary" onClick={() => handleDelete(incident.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell> */}
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

export default Dashboard;
