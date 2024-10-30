import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/features/userSlice';
import authUtils from '../../utils/authUtils';
import { Box } from '@mui/material';
import Loading from '../common/Loading';
import Sidebar from '../common/Sidebar';

const AppLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const user = await authUtils.isAuthenticated();
        if (!user) {
          navigate('/login');
        } else {
          dispatch(setUser(user));
        }
      } catch (err) {
        handleError('Error during authentication: ', err);
      } finally {
        setLoading(false);
      }
    };
    checkAuthentication();
  }, [navigate, dispatch]);

  const handleError = (message, error) => {
    console.error(message, error);
    alert(error.message);
  };

  return loading ? (
    <Loading fullHeight />
  ) : (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 1, width: 'max-content' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
