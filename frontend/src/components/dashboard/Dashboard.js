import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Alert,
  TextField
} from '@mui/material';
import {
  People as PeopleIcon,
  Payment as PaymentIcon,
  School as SchoolIcon,
  AttachMoney as MoneyIcon,
  Upgrade as UpgradeIcon
} from '@mui/icons-material';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { useAuth } from '../../context/AuthContext';
import { studentsAPI, feesAPI } from '../../services/api';

const StatCard = ({ title, value, icon: Icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card elevation={3}>
      <CardContent sx={{ pb: { xs: 2, md: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography 
              variant={{ xs: "h5", md: "h4" }} 
              component="div"
              sx={{ 
                fontSize: { xs: '1.5rem', md: '2.125rem' },
                fontWeight: 'bold',
                wordBreak: 'break-word'
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: '50%',
              width: { xs: 48, md: 56 },
              height: { xs: 48, md: 56 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
            }}
          >
            <Icon fontSize="large" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFeesCollected: 0,
    pendingFees: 0,
    feeDefaulters: 0,
    loading: true,
    error: null
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [classDistribution, setClassDistribution] = useState([]);
  const [monthlyCollection, setMonthlyCollection] = useState([]);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [promoteResult, setPromoteResult] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true }));
        
        // Fetch basic stats
        const [studentsRes, feesRes, defaultersRes] = await Promise.all([
          studentsAPI.getStudents(),
          feesAPI.getFeeSummary(),
          studentsAPI.getFeeDefaulters()
        ]);

        // Calculate fee payment distribution (paid vs pending)
        let totalPaidAmount = 0;
        let totalPendingAmount = 0;
        
        studentsRes.data.data.forEach(student => {
          const paidAmount = student.fee?.paidAmount || 0;
          const totalFee = student.fee?.totalFee || 0;
          const pendingAmount = Math.max(0, totalFee - paidAmount);
          
          totalPaidAmount += paidAmount;
          totalPendingAmount += pendingAmount;
        });

        setClassDistribution([
          {
            id: 'paid',
            label: 'Fees Collected',
            value: totalPaidAmount,
            color: '#4CAF50'
          },
          {
            id: 'pending',
            label: 'Pending Fees',
            value: totalPendingAmount,
            color: '#FF9800'
          }
        ]);

        // Update stats with calculated values
        setStats({
          totalStudents: studentsRes.data.count || 0,
          totalFeesCollected: totalPaidAmount,
          pendingFees: totalPendingAmount,
          feeDefaulters: defaultersRes.data.count || 0,
          loading: false,
          error: null
        });

        // Fetch recent payments and calculate monthly collection
        const paymentsRes = await feesAPI.getFees({
          _sort: 'paymentDate:desc',
          _limit: 50  // Get more data for monthly calculation
        });
        const allPayments = paymentsRes.data.data || [];
        setRecentPayments(allPayments.slice(0, 5)); // Keep only 5 for recent payments
        
        // Calculate monthly collection data
        const monthlyData = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Initialize last 6 months
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          const monthLabel = monthNames[date.getMonth()];
          monthlyData[monthKey] = { month: monthLabel, fees: 0 };
        }
        
        // Aggregate payments by month
        allPayments.forEach(payment => {
          if (payment.paymentDate) {
            const paymentDate = new Date(payment.paymentDate);
            const monthKey = `${paymentDate.getFullYear()}-${paymentDate.getMonth()}`;
            if (monthlyData[monthKey]) {
              monthlyData[monthKey].fees += payment.totalAmount || 0;
            }
          }
        });
        
        setMonthlyCollection(Object.values(monthlyData));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data. Please try again.'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  const handlePromoteAll = async () => {
    if (confirmText !== 'PROMOTEALL') {
      setPromoteResult({
        success: false,
        message: 'Please type PROMOTEALL to confirm this action.'
      });
      return;
    }

    try {
      setPromoting(true);
      const response = await studentsAPI.promoteAllStudents();
      setPromoteResult(response.data);
      setPromoteDialogOpen(false);
      setConfirmText(''); // Reset confirmation text
      
      // Refresh dashboard data
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Error promoting students:', error);
      setPromoteResult({
        success: false,
        message: 'Failed to promote students. Please try again.'
      });
    } finally {
      setPromoting(false);
    }
  };

  const handleDialogClose = () => {
    setPromoteDialogOpen(false);
    setConfirmText(''); // Reset confirmation text when closing
  };

  if (stats.loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (stats.error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{stats.error}</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography 
        variant={{ xs: "h5", md: "h4" }} 
        gutterBottom
        sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}
      >
        Welcome back, {user?.name || 'User'}!
      </Typography>
      <Typography color="textSecondary" paragraph>
        Here's what's happening with your school today.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={PeopleIcon}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Fees Collected"
            value={`₹${stats.totalFeesCollected.toLocaleString()}`}
            icon={MoneyIcon}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pending Fees"
            value={`₹${stats.pendingFees.toLocaleString()}`}
            icon={PaymentIcon}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Fee Defaulters"
            value={stats.feeDefaulters}
            icon={SchoolIcon}
            color={theme.palette.error.main}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: { xs: 1.5, md: 2 }, height: { xs: 300, md: 400 } }}>
            <Typography 
              variant={{ xs: "subtitle1", md: "h6" }} 
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Monthly Fee Collection
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)' }}>
              <ResponsiveBar
                data={monthlyCollection}
                keys={['fees']}
                indexBy="month"
                margin={isMobile 
                  ? { top: 10, right: 10, bottom: 40, left: 45 }
                  : { top: 20, right: 20, bottom: 50, left: 60 }
                }
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={[theme.palette.primary.main]}
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Month',
                  legendPosition: 'middle',
                  legendOffset: 40,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Amount (₹)',
                  legendPosition: 'middle',
                  legendOffset: -50,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor="white"
                animate={true}
                motionStiffness={90}
                motionDamping={15}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: { xs: 1.5, md: 2 }, height: { xs: 300, md: 400 } }}>
            <Typography 
              variant={{ xs: "subtitle1", md: "h6" }} 
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Fee Collection Status
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)' }}>
              {classDistribution.length > 0 ? (
                <ResponsivePie
                  data={classDistribution}
                  margin={isMobile 
                    ? { top: 10, right: 10, bottom: 60, left: 10 }
                    : { top: 20, right: 20, bottom: 80, left: 20 }
                  }
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="text.primary"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor="white"
                  arcLinkLabel={(d) => `₹${d.value.toLocaleString('en-IN')}`}
                  arcLabel={(d) => `₹${d.value.toLocaleString('en-IN')}`}
                  valueFormat={(value) => `₹${value.toLocaleString('en-IN')}`}
                  colors={[
                    theme.palette.primary.main,
                    theme.palette.secondary.main,
                    theme.palette.success.main,
                    theme.palette.warning.main,
                    theme.palette.error.main,
                    theme.palette.info.main,
                  ]}
                  animate={true}
                  motionStiffness={90}
                  motionDamping={15}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 60,
                      itemsSpacing: 0,
                      itemWidth: 100,
                      itemHeight: 18,
                      itemTextColor: theme.palette.text.secondary,
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: 18,
                      symbolShape: 'circle',
                    },
                  ]}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography color="textSecondary">No students yet. Add some students to see distribution.</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Payments */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Fee Payments
        </Typography>
        {recentPayments.length > 0 ? (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Receipt #</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Student</th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Payment Mode</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment._id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={{ padding: '12px 8px' }}>{payment.receiptNumber}</td>
                    <td style={{ padding: '12px 8px' }}>
                      {payment.student?.firstName && payment.student?.lastName 
                        ? `${payment.student.firstName} ${payment.student.lastName}`
                        : 'N/A'}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                      ₹{payment.totalAmount?.toLocaleString() || '0'}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 8px' }}>{payment.paymentMode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        ) : (
          <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
            No recent payments found.
          </Typography>
        )}
      </Paper>

      {/* Promote All Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          color="warning"
          size="large"
          startIcon={<UpgradeIcon />}
          onClick={() => setPromoteDialogOpen(true)}
          sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
        >
          Promote All Students (End Academic Year)
        </Button>
      </Box>

      {/* Promotion Result Alert */}
      {promoteResult && (
        <Alert 
          severity={promoteResult.success ? "success" : "error"}
          sx={{ mt: 2 }}
          onClose={() => setPromoteResult(null)}
        >
          {promoteResult.message}
        </Alert>
      )}

      {/* Promote All Confirmation Dialog */}
      <Dialog
        open={promoteDialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          End Academic Year & Promote All Students
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This action will:
            <br />• Move all pending fee balances to "Arrears" 
            <br />• Reset current year fee structures
            <br />• Prepare students for the new academic year
            <br /><br />
            <strong>⚠️ WARNING: This action cannot be undone!</strong>
          </DialogContentText>
          
          <Alert severity="error" sx={{ mb: 2 }}>
            To confirm this action, please type <strong>PROMOTEALL</strong> in the box below:
          </Alert>
          
          <TextField
            fullWidth
            label="Type PROMOTEALL to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="PROMOTEALL"
            variant="outlined"
            error={confirmText !== '' && confirmText !== 'PROMOTEALL'}
            helperText={
              confirmText !== '' && confirmText !== 'PROMOTEALL' 
                ? 'Please type exactly PROMOTEALL' 
                : ''
            }
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button 
            onClick={handlePromoteAll} 
            color="warning" 
            variant="contained"
            disabled={promoting || confirmText !== 'PROMOTEALL'}
          >
            {promoting ? 'Processing...' : 'Promote All Students'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
