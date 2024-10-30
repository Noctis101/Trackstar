import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import Loading from '../common/Loading';
import authUtils from '../../utils/authUtils';
import assets from '../../assets';

const AuthLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuth = await authUtils.isAuthenticated();
        if (!isAuth) {
          setLoading(false);
        } else {
          navigate('/');
        }
      } catch (err) {
        handleError('Error during authentication: ', err);
      }
    };
    checkAuthentication();
  }, [navigate]);

  const handleError = (message, error) => {
    console.error(message, error);
    alert(error.message);
  };

  return (
    loading ? (
      <Loading fullHeight />
    ) : (
      <Container component='main' maxWidth='xs'>
        <Box sx={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column'
        }}>
          <img src={assets.images.logo} style={{ width: '100px' }} alt='app logo' />
          <Outlet />
        </Box>
      </Container>
    )
  );
};

export default AuthLayout;
