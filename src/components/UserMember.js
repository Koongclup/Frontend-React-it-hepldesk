import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Button, Table, TableContainer, TableHead,
    TableBody, TableCell, TableRow, Paper, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Select, MenuItem, InputLabel, FormControl,
    TablePagination, TableSortLabel, IconButton, Tooltip, InputAdornment
} from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import ResponsiveAppBar from './ResponsiveAppBar'; // Adjust the path as necessary
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search'; // Import SearchIcon from Material-UI
import * as XLSX from 'xlsx';

const UserMember = () => {
    const [members, setMember] = useState([]);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [updateMember, setupdateMember] = useState({ id: '', fullname: '', level: '', position: '', department: '' });
    const [newUser, setNewUser] = useState({ fullname: '', password: '', level: '', position: '', department: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [orderBy, setOrderBy] = useState('fullname');
    const [order, setOrder] = useState('asc');

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/members', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMember(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
            Swal.fire('Error', 'Failed to fetch members', 'error');
        }
    };

    const handleDeleteMember = async (id) => {
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
                    await axios.delete(`http://localhost:5000/api/members/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    Swal.fire('Deleted!', 'User deleted successfully', 'success');
                    fetchMembers();
                } catch (error) {
                    console.error('Error deleting user:', error);
                    Swal.fire('Error', 'Failed to delete user', 'error');
                }
            }
        });
    };

    const handleEditUser = (member) => {
        setupdateMember(member);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setupdateMember({ id: '', fullname: '', level: '', position: '', department: '' });
    };

    const handleAddUser = () => {
        setOpenAddDialog(true);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setNewUser({ fullname: '', password: '', level: '', position: '', department: '' });
    };

    const saveNewUser = async () => {
        if (!newUser.fullname || !newUser.password || !newUser.level || !newUser.position || !newUser.department) {
            Swal.fire('Error', 'All fields are required', 'error');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/members', newUser, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Swal.fire('Success', 'User added successfully', 'success');
            handleCloseAddDialog();
            fetchMembers(); // Refresh the user list after adding
        } catch (error) {
            Swal.fire('Error', 'Failed to add user', 'error');
        }
    };

    const saveEditedUser = async () => {
        if (!updateMember.fullname || !updateMember.level || !updateMember.position || !updateMember.department) {
            Swal.fire('Error', 'All fields are required', 'error');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/members/${updateMember.id}`, updateMember, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Swal.fire('Success', 'User updated successfully', 'success');
            handleCloseEditDialog();
            fetchMembers(); // Refresh the user list after editing
        } catch (error) {
            Swal.fire('Error', 'Failed to update user', 'error');
        }
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setPage(0);
    };

    const handleSortRequest = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrderBy(property);
        setOrder(isAsc ? 'desc' : 'asc');
    };

    const sortedMembers = members.sort((a, b) => {
        const isAsc = order === 'asc';
        if (orderBy === 'fullname') {
            return isAsc ? a.fullname.localeCompare(b.fullname) : b.fullname.localeCompare(a.fullname);
        }
        return 0;
    });

    const filteredMembers = sortedMembers.filter((member) =>
        (member.fullname && member.fullname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (member.level && member.level.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (member.position && member.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (member.department && member.department.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const paginatedMembers = filteredMembers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredMembers);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
        XLSX.writeFile(workbook, 'member.xlsx');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <ResponsiveAppBar />
            <Container maxWidth="xl" sx={{ marginTop: '2rem' }}>
                <Typography variant="h4" gutterBottom>User Management</Typography>
                <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Button variant="contained" color="primary" onClick={handleAddUser}>Add User</Button>
                    </Box>
                    <Box display="flex" alignItems="center">
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
                        <Tooltip title="Print">
                            <IconButton onClick={handlePrint}>
                                <PrintIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Export to Excel">
                            <IconButton onClick={handleExportExcel}>
                                <FileDownloadIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'fullname'}
                                        direction={orderBy === 'fullname' ? order : 'asc'}
                                        onClick={() => handleSortRequest('fullname')}
                                    >
                                        Full Name
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Position</TableCell>
                                <TableCell>Level</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>{member.fullname}</TableCell>
                                    <TableCell>{member.position}</TableCell>
                                    <TableCell>{member.level}</TableCell>
                                    <TableCell>{member.department}</TableCell>
                                    <TableCell>
                                        <Button variant="outlined" color="primary" onClick={() => handleEditUser(member)}>Edit</Button>
                                        <Button variant="outlined" color="secondary" onClick={() => handleDeleteMember(member.id)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredMembers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                />
            </Container>

            {/* Add User Dialog */}
            <Dialog open={openAddDialog} onClose={handleCloseAddDialog} component="main" maxWidth="xs">
                <DialogTitle>Add User</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Full Name"
                        value={newUser.fullname}
                        onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Level</InputLabel>
                        <Select
                            value={newUser.level}
                            onChange={(e) => setNewUser({ ...newUser, level: e.target.value })}
                        >
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={newUser.position}
                            onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                        >
                            <MenuItem value="Y">Active</MenuItem>
                            <MenuItem value="N">Not Active</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Department"
                        value={newUser.department}
                        onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddDialog}>Cancel</Button>
                    <Button onClick={saveNewUser} color="primary">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Full Name"
                        value={updateMember.fullname}
                        onChange={(e) => setupdateMember({ ...updateMember, fullname: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Position"
                        value={updateMember.position}
                        onChange={(e) => setupdateMember({ ...updateMember, position: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Level"
                        value={updateMember.level}
                        onChange={(e) => setupdateMember({ ...updateMember, level: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Department"
                        value={updateMember.department}
                        onChange={(e) => setupdateMember({ ...updateMember, department: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog}>Cancel</Button>
                    <Button onClick={saveEditedUser} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UserMember;
