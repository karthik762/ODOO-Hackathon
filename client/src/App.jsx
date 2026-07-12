import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Departments from './pages/Departments';
import Categories from './pages/Categories';
import Users from './pages/Users';
import AssetDirectory from './pages/AssetDirectory';
import AssetDetails from './pages/AssetDetails';
import RegisterAsset from './pages/RegisterAsset';
import EditAsset from './pages/EditAsset';
import Bookings from './pages/Bookings';
import Maintenance from './pages/Maintenance';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { Toaster } from 'react-hot-toast';
import './App.css';

/**
 * App Layout routing
 */
function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/departments" 
            element={
              <PrivateRoute>
                <Layout>
                  <Departments />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/categories" 
            element={
              <PrivateRoute>
                <Layout>
                  <Categories />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={['Admin']}>
                  <Layout>
                    <Users />
                  </Layout>
                </RoleRoute>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/assets" 
            element={
              <PrivateRoute>
                <Layout>
                  <AssetDirectory />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/assets/new" 
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={['Admin', 'AssetManager']}>
                  <Layout>
                    <RegisterAsset />
                  </Layout>
                </RoleRoute>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/assets/:id" 
            element={
              <PrivateRoute>
                <Layout>
                  <AssetDetails />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/assets/:id/edit" 
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={['Admin', 'AssetManager']}>
                  <Layout>
                    <EditAsset />
                  </Layout>
                </RoleRoute>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/bookings" 
            element={
              <PrivateRoute>
                <Layout>
                  <Bookings />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/maintenance" 
            element={
              <PrivateRoute>
                <Layout>
                  <Maintenance />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
