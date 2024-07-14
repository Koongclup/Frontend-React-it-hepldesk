import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Table, TableContainer, TableHead, TableBody, TableCell, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [editingUser, setEditingUser] = useState({ id: '', username: '' });
    const [newUser, setNewUser] = useState({ username: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/users/${id}`);
            Swal.fire('Success', 'User deleted successfully', 'success');
            fetchUsers(); // Refresh the user list after deletion
        } catch (error) {
            Swal.fire('Error', 'Failed to delete user', 'error');
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setEditingUser({ id: '', username: '' });
    };

    const handleAddUser = () => {
        setOpenAddDialog(true);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setNewUser({ username: '' });
    };

    const saveNewUser = async () => {
        try {
            await axios.post('http://localhost:5000/api/users', newUser);
            Swal.fire('Success', 'User added successfully', 'success');
            handleCloseAddDialog();
            fetchUsers(); // Refresh the user list after adding
        } catch (error) {
            Swal.fire('Error', 'Failed to add user', 'error');
        }
    };

    const saveEditedUser = async () => {
        try {
            await axios.put(`http://localhost:5000/api/users/${editingUser.id}`, editingUser);
            Swal.fire('Success', 'User updated successfully', 'success');
            handleCloseEditDialog();
            fetchUsers(); // Refresh the user list after editing
        } catch (error) {
            Swal.fire('Error', 'Failed to update user', 'error');
        }
    };

    return (
        <>
            <ResponsiveAppBar />

            <Container  maxWidth="xl" sx={{ marginTop: '2rem' }}>
            <Typography variant="h4" gutterBottom>User Management</Typography>
            <Box mb={2}>
                <Button variant="contained" color="primary" onClick={handleAddUser}>Add User</Button>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>
                                    <Button variant="outlined" color="primary" onClick={() => handleEditUser(user)}>Edit</Button>
                                    <Button variant="outlined" color="secondary" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add User Dialog */}
            <Dialog open={openAddDialog} onClose={handleCloseAddDialog} component="main" maxWidth="xs"  >
                <DialogTitle>Add User</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
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
                        label="Username"
                        value={editingUser.username}
                        onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog}>Cancel</Button>
                    <Button onClick={saveEditedUser} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </Container>
        </>
    );
};

export default UserManagement;
