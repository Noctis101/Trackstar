import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { setBoards } from '../redux/features/boardSlice';
import boardApi from '../api/boardApi';


const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState('');

  const createBoard = async () => {
    setLoading(true)
    try {
      const res = await boardApi.create();
      dispatch(setBoards([res]));
      navigate(`/boards/${res.id}`);
    } catch (err) {
      handleApiError('Error creating task board: ', err);
    } finally {
      setLoading(false);
    }
  }

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
      <Box sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <LoadingButton
          variant='outlined'
          color='success'
          onClick={createBoard}
          loading={loading}
        >
          Click here to create your first board
        </LoadingButton>
      </Box>

      {/* Error Modal */}
      <Dialog open={openErrorModal} onClose={handleCloseErrorModal}>
        <DialogTitle style={{ color: '#0FFF50' }}>Error</DialogTitle>
        <DialogContent>
          <Box color='error.main'>
            {errorModalContent}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorModal} style={{ color: '#0FFF50' }}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Home;