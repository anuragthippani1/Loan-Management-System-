import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LoanTracker = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLoanDetails();
  }, [id]);

  const fetchLoanDetails = async () => {
    try {
      const response = await axios.get(`/api/loans/${id}`);
      setLoan(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching loan details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) return;

    setSubmitting(true);
    try {
      await axios.post(`/api/loans/${id}/payment`, { amount: Number(paymentAmount) });
      await fetchLoanDetails();
      setPaymentDialog(false);
      setPaymentAmount('');
    } catch (err) {
      console.error('Error making payment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateProgress = () => {
    if (!loan) return 0;
    return ((loan.amount - loan.remainingAmount) / loan.amount) * 100;
  };

  const getChartData = () => {
    if (!loan) return null;

    const labels = loan.paymentHistory.map(payment => 
      new Date(payment.date).toLocaleDateString()
    );

    const data = loan.paymentHistory.map((payment, index) => {
      const previousPayments = loan.paymentHistory
        .slice(0, index + 1)
        .reduce((sum, p) => sum + p.amount, 0);
      return previousPayments;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Cumulative Payments',
          data,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!loan) {
    return (
      <Box p={3}>
        <Typography>Loan not found</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Loan Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Loan Type: {loan.loanType}</Typography>
            <Typography variant="subtitle1">Amount: ${loan.amount}</Typography>
            <Typography variant="subtitle1">Interest Rate: {loan.interestRate}%</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Term: {loan.term} years</Typography>
            <Typography variant="subtitle1">EMI: ${loan.emiAmount}</Typography>
            <Typography variant="subtitle1">Status: {loan.status}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment Progress
        </Typography>
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={calculateProgress()} 
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {calculateProgress().toFixed(1)}% Paid (${loan.amount - loan.remainingAmount} of ${loan.amount})
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment History
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loan.paymentHistory.map((payment, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  <TableCell>${payment.amount}</TableCell>
                  <TableCell>{payment.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {loan.status === 'active' && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setPaymentDialog(true)}
          sx={{ mb: 3 }}
        >
          Make Payment
        </Button>
      )}

      {getChartData() && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Payment Trend
          </Typography>
          <Box sx={{ height: 300 }}>
            <Line
              data={getChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Amount ($)'
                    }
                  }
                }
              }}
            />
          </Box>
        </Paper>
      )}

      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)}>
        <DialogTitle>Make Payment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Payment Amount"
            type="number"
            fullWidth
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            InputProps={{
              startAdornment: '$'
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button 
            onClick={handlePayment} 
            variant="contained" 
            disabled={submitting || !paymentAmount || paymentAmount <= 0}
          >
            {submitting ? <CircularProgress size={24} /> : 'Submit Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoanTracker; 