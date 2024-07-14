import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, Grid, CardContent } from '@mui/material';
import axios from 'axios';
//import Swal from 'sweetalert2';
import NavbarOut from './NavbarOut'; // Adjust the path as necessary
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const Dashboard = () => {
    const [incidentStats, setIncidentStats] = useState({ total: 0, inprogress: 0, closed: 0 });
    const [incidentData, setIncidentData] = useState([]);
    const [jobTypeData, setJobTypeData] = useState([]);

    useEffect(() => {
        fetchIncidentStats();
        fetchIncidentData();
       
    }, []);

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

    const fetchIncidentData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/jobnews');
            setIncidentData(response.data);
            setJobTypeData(response.data);
        } catch (error) {
            console.error('Error fetching incident data:', error);
        }
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

    const getJobTypeData = () => {
        const jobTypeCount = jobTypeData.reduce((acc, job) => {
            acc[job.jobtype] = (acc[job.jobtype] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(jobTypeCount).map(([jobtype, count]) => ({
            name: jobtype,
            y: count
        }));
    };

    const getJobTypeSeriesData = () => {
        const jobTypeCount = jobTypeData.reduce((acc, job) => {
            acc[job.jobtype] = (acc[job.jobtype] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(jobTypeCount).map(([type, count]) => ({
            name: type,
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
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                showInLegend: true,
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                    distance: 20,
                    filter: {
                        property: 'percentage',
                        operator: '>',
                        value: 4
                    }
                }
            }
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
        plotOptions: {
            column: {
                allowPointSelect: true,
                cursor: 'pointer',
                showInLegend: true,
                dataLabels: {
                    enabled: true,
                }
            }
        },
        series: getStatusSeriesData()
    };

    const jobTypePieOptions = {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Job Type Distribution'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                showInLegend: true,
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                    distance: 20,
                    filter: {
                        property: 'percentage',
                        operator: '>',
                        value: 4
                    }
                }
            }
        },
        series: [{
            name: 'Jobs',
            colorByPoint: true,
            data: getJobTypeData()
        }]
    };

    const jobTypeColumnOptions = {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Job Type Count'
        },
        xAxis: {
            categories: ['Type']
        },
        yAxis: {
            title: {
                text: 'Count'
            }
        },
        plotOptions: {
            column: {
                allowPointSelect: true,
                cursor: 'pointer',
                showInLegend: true,
                dataLabels: {
                    enabled: true,
                }
            }
        },
        series: getJobTypeSeriesData()
    };

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

                <Grid container spacing={3} sx={{ marginTop: '2rem' }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <div>
                                    <HighchartsReact
                                        highcharts={Highcharts}
                                        options={jobTypePieOptions}
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
                                        options={jobTypeColumnOptions}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default Dashboard;
