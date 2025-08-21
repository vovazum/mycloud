import React from 'react';
import { Typography, Container } from '@mui/material';
import UserList from '../components/Admin/UserList';

const AdminPanel = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Панель администратора
      </Typography>
      <UserList />
    </Container>
  );
};

export default AdminPanel; 