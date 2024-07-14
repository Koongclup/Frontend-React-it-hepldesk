import React, { useState, useEffect , useCallback } from 'react';
import {
    Container, Typography, Box, Button, Table, TableContainer, TableHead,
    TableBody, TableCell, TableRow, Paper, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Select, MenuItem, InputLabel, FormControl,
    TablePagination, TableSortLabel, IconButton, Tooltip, InputAdornment,
    Grid, Card, CardContent
} from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import ResponsiveAppBar from './ResponsiveAppBar'; // Adjust the path as necessary
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search'; // Import SearchIcon from Material-UI
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';


const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [updateUser, setUpdateUser] = useState({ id: '', username: '', role: '', actives: '' });
    const [newUser, setNewUser] = useState({ username: '', password: '', role: '', actives: '' });
    const [validationErrors, setValidationErrors] = useState({ username: '', password: '', role: '', actives: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [orderBy, setOrderBy] = useState('username');
    const [order, setOrder] = useState('asc');
    const navigate = useNavigate();
   
    const fetchUsers = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            Swal.fire('Error', 'Failed to fetch users', 'error');
        }
    }, []);

    const fetchUserStats = useCallback(() => {
        const total = users.length;
        const active = users.filter(user => user.actives === 'Y').length;
        const inactive = total - active;
        setUserStats({ total, active, inactive });
    }, [users]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        fetchUserStats();
    }, [users, fetchUserStats]);

    const handleDeleteUser = async (id) => {
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
                    await axios.delete(`http://localhost:5000/api/users/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    Swal.fire('Deleted!', 'User deleted successfully', 'success');
                    fetchUsers();
                } catch (error) {
                    console.error('Error deleting user:', error);
                    Swal.fire('Error', 'Failed to delete user', 'error');
                }
            }
        });
    };

    const handleEditUser = (user) => {
        setUpdateUser(user);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setUpdateUser({ id: '', username: '', role: '', actives: '' });
    };

    const handleAddUser = () => {
        setOpenAddDialog(true);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setNewUser({ username: '', password: '', role: '', actives: '' });
        setValidationErrors({ username: '', password: '', role: '', actives: '' });
    };
    const validateUser = (user) => {
        const errors = { username: '', password: '', role: '', actives: '' };
        if (!user.username) errors.username = 'Username is required';
        if (!user.password) errors.password = 'Password is required';
        if (!user.role) errors.role = 'Role is required';
        if (!user.actives) errors.actives = 'Status is required';
        return errors;
    };

    const saveNewUser = async () => {
        const errors = validateUser(newUser);
        setValidationErrors(errors);

        if (Object.values(errors).some(error => error !== '')) {
            Swal.fire('Error', 'Please correct the errors in the form', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/users', newUser, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Swal.fire('Success', 'User added successfully', 'success');
            handleCloseAddDialog();
            fetchUsers(); // Refresh the user list after adding
        } catch (error) {
            Swal.fire('Error', 'Failed to add user', 'error');
        }
    };

    const saveEditedUser = async () => {
        if (!updateUser.username || !updateUser.role || !updateUser.actives) {
            Swal.fire('Error', 'All fields are required', 'error');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/users/${updateUser.id}`, updateUser, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Swal.fire('Success', 'User updated successfully', 'success');
            handleCloseEditDialog();
            fetchUsers(); // Refresh the user list after editing
        } catch (error) {
            //Swal.fire('Error', 'Failed to update user', 'error');
            
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

    const sortedUsers = users.sort((a, b) => {
        const isAsc = order === 'asc';
        if (orderBy === 'username') {
            return isAsc ? a.username.localeCompare(b.username) : b.username.localeCompare(a.username);
        }
        return 0;
    });

    const filteredUsers = sortedUsers.filter(
        (user) =>
            (user.username?.toLowerCase().includes(searchQuery.toLowerCase()) || '') &&
            (user.role?.toLowerCase().includes(searchQuery.toLowerCase()) || '') &&
            (user.actives?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
    );

    const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredUsers);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
        XLSX.writeFile(workbook, 'users.xlsx');
    };

    const handlePrint = () => {
        window.print();
    };
     const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

    return (
        <>
            <ResponsiveAppBar />
            <Container maxWidth="xl" sx={{ marginTop: '2rem' }}>

            <Typography variant="h4" gutterBottom>User Management  <Button variant="outlined" color="error" onClick={handleGoBack}>back</Button></Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    Total Users
                                </Typography>
                                <Typography variant="h4" component="div">
                                    {userStats.total}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    Active Users
                                </Typography>
                                <Typography variant="h4" component="div">
                                    {userStats.active}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    Inactive Users
                                </Typography>
                                <Typography variant="h4" component="div">
                                    {userStats.inactive}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                
                <Box my={2} display="flex" justifyContent="space-between" alignItems="center">
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
                                        active={orderBy === 'username'}
                                        direction={orderBy === 'username' ? order : 'asc'}
                                        onClick={() => handleSortRequest('username')}
                                    >
                                        Username
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>{user.actives === 'Y' ? 'Active' : 'Not Active'}</TableCell>
                                    <TableCell align="right">
                                        <Button variant="outlined" color="primary" onClick={() => handleEditUser(user)}>
                                            
                                            Edit</Button>
                                        <Button variant="outlined" color="secondary" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredUsers.length}
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
                        label="Username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        fullWidth
                        margin="normal"

                        error={Boolean(validationErrors.username)}
                        helperText={validationErrors.username}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        fullWidth
                        margin="normal"
                        error={Boolean(validationErrors.password)}
                        helperText={validationErrors.password}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                        {validationErrors.role && (
                            <Typography color="error">{validationErrors.role}</Typography>
                        )}
                    </FormControl>

                    <TextField
                        label="Status"
                        value={newUser.actives = 'Active'}
                        onChange={(e) => setNewUser({ ...newUser, actives: e.target.value='Y'  })}
                        fullWidth
                        margin="normal"

                        error={Boolean(validationErrors.actives)}
                        helperText={validationErrors.actives}
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
                        label="Username"
                        value={updateUser.username}
                        onChange={(e) => setUpdateUser({ ...updateUser, username: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={updateUser.role}
                            onChange={(e) => setUpdateUser({ ...updateUser, role: e.target.value })}
                        >
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={updateUser.actives}
                            onChange={(e) => setUpdateUser({ ...updateUser, actives: e.target.value })}
                        >
                            <MenuItem value="Y">Active</MenuItem>
                            <MenuItem value="N">Not Active</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="New Password"
                        type="password"
                        value={updateUser.password}
                        onChange={(e) => setUpdateUser({ ...updateUser, password: e.target.value })}
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

export default UserManagement;
