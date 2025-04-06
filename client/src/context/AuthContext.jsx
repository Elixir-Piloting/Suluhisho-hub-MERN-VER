import { createContext, useState, useEffect } from 'react';
import api from '../utils/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  // Check if user is logged in based on cookies
  const checkAuth = async () => {
    try {
      const res = await api.get('/auth'); // This will automatically send cookies
      if (res.data.success) {
        setLoggedIn(true);
        setUser(res.data.user);
      } else {
        setLoggedIn(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth(); // Re-check on page load to persist the login state
  }, []); // Run only once when the app is loaded

  return (
    <AuthContext.Provider value={{ user, loggedIn, setUser, setLoggedIn, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
