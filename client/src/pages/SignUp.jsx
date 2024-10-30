import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import authApi from '../api/authApi';

const SignUp = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState('');

  const validateForm = () => {
    let valid = true;

    if (!username) {
      setUsernameError('Username cannot be empty');
      valid = false;
    } else {
      setUsernameError('');
    }

    if (!password) {
      setPasswordError('Password cannot be empty');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password cannot be empty');
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords must match');
      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.signUp({ username, password, confirmPassword });
      localStorage.setItem('token', res.token);
      navigate('/');
    } catch (err) {
      if (err.errors) {
        const errors = err.errors;

        errors.forEach(e => {
          if (e.path === 'username') {
            setUsernameError(e.msg);
          } else if (e.path === 'password') {
            setPasswordError(e.msg);
          } else if (e.path === 'confirmPassword') {
            setConfirmPasswordError(e.msg);
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
          value={username}
          disabled={loading}
          error={!!usernameError}
          helperText={usernameError}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          margin='normal'
          required
          fullWidth
          id='password'
          label='Password'
          name='password'
          type='password'
          value={password}
          disabled={loading}
          error={!!passwordError}
          helperText={passwordError}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          margin='normal'
          required
          fullWidth
          id='confirmPassword'
          label='Confirm Password'
          name='confirmPassword'
          type='password'
          value={confirmPassword}
          disabled={loading}
          error={!!confirmPasswordError}
          helperText={confirmPasswordError}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <LoadingButton
          sx={{ mt: 3, mb: 2 }}
          variant='outlined'
          fullWidth
          color='success'
          type='submit'
          loading={loading}
        >
          Sign Up
        </LoadingButton>
      </Box>
      <Button
        component={Link}
        to='/login'
        sx={{
          textTransform: 'none',
          color: '#0FFF50'
        }}
      >
        Have an account already? Login!
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

export default SignUp;
