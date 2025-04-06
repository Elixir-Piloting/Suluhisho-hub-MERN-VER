// components/ProtectedRoute.jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { loggedIn } = useContext(AuthContext);

  if (!loggedIn) {
    return <Navigate to="/signin" />;
  }

  return children;
};

export default ProtectedRoute;
