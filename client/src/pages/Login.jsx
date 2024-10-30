import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import authApi from '../api/authApi';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [usernameErrText, setUsernameErrText] = useState('');
  const [passwordErrText, setPasswordErrText] = useState('');
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState('');

  const handleInputChange = (e) => {
    setUsernameErrText('');
    setPasswordErrText('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const username = data.get('username').trim();
    const password = data.get('password').trim();

    if (!username) {
      setUsernameErrText('Username cannot be empty');
      return;
    }

    if (!password) {
      setPasswordErrText('Password cannot be empty');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.login({ username, password });
      localStorage.setItem('token', res.token);
      navigate('/');
    } catch (err) {
      if (err.errors) {
        const errors = err.errors;
        
        errors.forEach(e => {
          if (e.path === 'username') {
            setUsernameErrText(e.msg);
          } else if (e.path === 'password') {
            setPasswordErrText(e.msg);
          } else {
            setErrorModalContent(e.msg);
            setOpenErrorModal(true);
          }
        });
      } else {
        handleApiError('Unexpected error occurred: ', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (message, error) => {
    console.error(message, error);
    setErrorModalContent(message, error);
    setOpenErrorModal(true);
  };

  const handleCloseErrorModal = () => {
    setOpenErrorModal(false);
  };

  return (
    <>
      <Box
        component='form'
        sx={{ mt: 1 }}
        onSubmit={handleSubmit}
        noValidate
      >
        <TextField
          margin='normal'
          required
          fullWidth
          id='username'
          label='Username'
          name='username'
          disabled={loading}
          error={usernameErrText !== ''}
          helperText={usernameErrText}
          onChange={handleInputChange}
        />
        <TextField
          margin='normal'
          required
          fullWidth
          id='password'
          label='Password'
          name='password'
          type='password'
          disabled={loading}
          error={passwordErrText !== ''}
          helperText={passwordErrText}
          onChange={handleInputChange}
        />
        <LoadingButton
          sx={{ mt: 3, mb: 2 }}
          variant='outlined'
          fullWidth
          color='success'
          type='submit'
          loading={loading}
        >
          Login
        </LoadingButton>
      </Box>
      <Button
        component={Link}
        to='/signup'
        sx={{
          textTransform: 'none',
          color: '#0FFF50'
        }}
      >
        Haven't created an account yet? Sign Up!
      </Button>

      {/* Error Modal */}
      <Dialog open={openErrorModal} onClose={handleCloseErrorModal}>
        <DialogTitle style={{color: '#0FFF50'}}>Error</DialogTitle>
        <DialogContent>
          <Box color='error.main'>
            {errorModalContent}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorModal} style={{color: '#0FFF50'}}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Login;
