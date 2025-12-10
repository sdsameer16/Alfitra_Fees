import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SnackbarProvider } from 'notistack';

// Theme
import theme from './theme/theme';

// Context Providers
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/common/PrivateRoute';

// Auth Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Student Pages
import Dashboard from './components/dashboard/Dashboard';
import StudentList from './components/students/StudentList';
import StudentForm from './components/students/StudentForm';
import StudentDetails from './components/students/StudentDetails';

// Fee Pages
import FeeList from './components/fees/FeeList';
import FeePayment from './components/fees/FeePayment';
import FeeReceipt from './components/fees/FeeReceipt';
import FeeManagement from './components/fees/FeeManagement';

// Report Pages
import Reports from './components/reports/Reports';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <SnackbarProvider maxSnack={3}>
          <CssBaseline />
          <Router>
            <AuthProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Layout />
                    </PrivateRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  
                  {/* Student Routes */}
                  <Route path="students">
                    <Route index element={<StudentList />} />
                    <Route path="new" element={<StudentForm />} />
                    <Route path=":id" element={<StudentDetails />} />
                    <Route path=":id/edit" element={<StudentForm />} />
                  </Route>

                  {/* Fee Routes */}
                  <Route path="fees">
                    <Route index element={<FeeList />} />
                    <Route path="pay" element={<FeePayment />} />
                    <Route path="receipt/:id" element={<FeeReceipt />} />
                    <Route path="management" element={<FeeManagement />} />
                  </Route>

                  {/* Report Routes */}
                  <Route path="reports" element={<Reports />} />

                  {/* Default redirect to dashboard for unknown routes */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </AuthProvider>
          </Router>
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
