import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { AdminPanel } from '../components/AdminPanel';

export const AdminPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={3}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          aria-label="Admin configuration page"
        >
          Admin Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage transaction types, categories, payment modes, and accounts
        </Typography>
      </Box>
      <AdminPanel />
    </Container>
  );
};
