import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { Plus } from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, loggedIn, setLoggedIn, setUser } = useContext(AuthContext);

  const handleLogout = async () => {
    const res = await api.post('/auth/logout');
    if (res.data.success) {
      setLoggedIn(false);
      setUser(null);
      navigate('/signin');
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Suluhisho Hub</a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li><a onClick={() => document.getElementById("my_modal_3").showModal()}> <Plus/> </a></li>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          {loggedIn && user && <li><a>{user.username}</a></li>}
          {loggedIn
            ? <li onClick={handleLogout}><a>Logout</a></li>
            : <li><a href="/signin">Login</a></li>}
        </ul>
      </div>
      
    </div>
  );
};
