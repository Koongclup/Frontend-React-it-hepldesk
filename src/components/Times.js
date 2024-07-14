import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import LanguageIcon from '@mui/icons-material/Language';
import RepeatIcon from '@mui/icons-material/Repeat';
import Typography from '@mui/material/Typography';
import NavbarOut from './NavbarOut'; // Adjust the path as necessary
import Swal from 'sweetalert2';
import { GlobalStyles, Button, Box } from '@mui/material';

const TimelineComponent = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [createdate, setCreatedate] = useState('');
    const [jobtype, setJobType] = useState('');
    const [solve, setSolve] = useState('');
    const [received, setReceived] = useState('');
    const [receiveddate, setReceiveddate] = useState('');
    const [endjob, setEndjob] = useState('');
    const [enddate, setEndjobdate] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:5000/api/jobnews/${id}`)
                .then(response => {
                    const incident = response.data;
                    setTitle(incident.title);
                    setDescription(incident.description);
                    setCreatedate(incident.create_date);
                    setStatus(incident.status);
                    setJobType(incident.jobtype);
                    setSolve(incident.solve ? incident.solve : 'ยังไม่รับงาน');
                    setReceived(incident.received);
                    setReceiveddate(incident.received_date);
                    setEndjob(incident.endjob);
                    setEndjobdate(incident.end_date);
                })
                .catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to fetch incident data.',
                        confirmButtonText: 'OK',
                    });
                    console.error('Failed to fetch incident:', error);
                });
        }
    }, [id]);

    const backView = () => {
        navigate(-1); // Navigate back to the previous page
    };

    return (
        <>
            <GlobalStyles styles={{ body: { fontFamily: 'Kanit, sans-serif' } }} />
            <NavbarOut />
            
            <Timeline position="alternate" sx={{ marginTop: '4rem' }}>
                <IconButton onClick={backView} color="primary" sx={{ fontWeight: 'bold' }}>
                    Incident : {id}
                </IconButton>
                <TimelineItem>
                    <TimelineOppositeContent
                        sx={{ m: 'auto 0' }}
                        align="right"
                        variant="body2"
                        color="text.secondary"
                    >
                        {createdate}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                        <TimelineConnector />
                        <TimelineDot>
                            <AccountCircleIcon />
                        </TimelineDot>
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="h6" component="span">
                            Incident
                        </Typography>
                        <Typography>เรื่อง : {title}</Typography>
                        <Typography>ประเภท : {jobtype}</Typography>
                        <Typography>รายละเอียด : {description}</Typography>
                    </TimelineContent>
                </TimelineItem>
                {status !== 'open' && (
                    <TimelineItem>
                        <TimelineOppositeContent
                            sx={{ m: 'auto 0' }}
                            variant="body2"
                            color="text.secondary"
                        >
                            {receiveddate}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineConnector />
                            <TimelineDot color="primary">
                                <LaptopMacIcon />
                            </TimelineDot>
                            <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent sx={{ py: '12px', px: 2 }}>
                            <Typography variant="h6" component="span">
                                Analyze
                            </Typography>
                            <Typography>{received}</Typography>
                        </TimelineContent>
                    </TimelineItem>
                )}
                {status === 'closed' && (
                    <TimelineItem>
                        <TimelineOppositeContent
                            sx={{ m: 'auto 0' }}
                            align="right"
                            variant="body2"
                            color="text.secondary"
                        >
                            {enddate}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineConnector />
                            <TimelineDot color="primary" variant="outlined">
                                <LanguageIcon />
                            </TimelineDot>
                            <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
                        </TimelineSeparator>
                        <TimelineContent sx={{ py: '12px', px: 2 }}>
                            <Typography variant="h6" component="span">
                                End Job
                            </Typography>
                            <Typography>{solve}</Typography>
                            <Typography>{endjob}</Typography>
                        </TimelineContent>
                    </TimelineItem>
                )}
                <TimelineItem>
                    <TimelineSeparator>
                        <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
                        <TimelineDot color="secondary">
                            <RepeatIcon />
                        </TimelineDot>
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="h6" component="span">
                            Status
                        </Typography>
                        <Typography>{status}</Typography>
                    </TimelineContent>
                </TimelineItem>
            </Timeline>

            <Box display="flex" justifyContent="center" m={2}>
                <Button variant="contained" color="primary" onClick={backView}>
                    Back to Previous Page
                </Button>
            </Box>
        </>
    );
};

export default TimelineComponent;
