import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../config/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchLoans();
    }
  }, [isAuthenticated]);

  const fetchLoans = async () => {
    try {
      const response = await api.get('/api/loans/my-loans');
      setLoans(response.data);
      setError('');
    } catch (err) {
      setError('Error fetching loans');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome to Loan Management System
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Please login or register to manage your loans
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
            sx={{ mr: 2 }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </Box>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">My Loans</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/apply')}
            >
              Apply for New Loan
            </Button>
          </Box>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Typography color="error">{error}</Typography>
          </Grid>
        )}

        {loans.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No loans found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Start by applying for a new loan
              </Typography>
            </Paper>
          </Grid>
        ) : (
          loans.map((loan) => (
            <Grid item xs={12} md={6} lg={4} key={loan._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)} Loan
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    Amount: ${loan.amount}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    EMI: ${loan.emiAmount}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    Status: {loan.status}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Remaining Amount: ${loan.remainingAmount}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/loans/${loan._id}`)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard; 