import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Box, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { setBoards } from '../redux/features/boardSlice';
import { setBookmarkList } from '../redux/features/bookmarkSlice';
import EmojiSelector from '../components/common/EmojiSelector';
import Board from '../components/common/Board';
import boardApi from '../api/boardApi';

let timer;
const timeout = 500;

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState([]);
  const [isBookmark, setIsBookmark] = useState(false);
  const [icon, setIcon] = useState('');
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState('');

  const boards = useSelector((state) => state.board.value);
  const bookmarkList = useSelector((state) => state.bookmarks.value);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await boardApi.getOne(boardId);
        setTitle(res.title);
        setDescription(res.description);
        setSections(res.sections);
        setIsBookmark(res.bookmark);
        setIcon(res.icon);
      } catch (err) {
        handleApiError('Error retrieving board: ', err);
      }
    };
    fetchBoard();
  }, [boardId]);

  const handleIconChange = async (newIcon) => {
    let temp = [...boards];
    const index = temp.findIndex(e => e.id === boardId);
    temp[index] = { ...temp[index], icon: newIcon };

    if (isBookmark) {
      let tempBookmark = [...bookmarkList];
      const bookmarkIndex = tempBookmark.findIndex(e => e.id === boardId);
      tempBookmark[bookmarkIndex] = { ...tempBookmark[bookmarkIndex], icon: newIcon };
      dispatch(setBookmarkList(tempBookmark));
    }

    setIcon(newIcon);
    dispatch(setBoards(temp));
    try {
      await boardApi.update(boardId, { icon: newIcon });
    } catch (err) {
      handleApiError('Error updating board icon: ', err);
    }
  };

  const updateTitle = async (e) => {
    clearTimeout(timer);

    const newTitle = e.target.value;
    setTitle(newTitle);

    let temp = [...boards];
    const index = temp.findIndex(e => e.id === boardId);
    temp[index] = { ...temp[index], title: newTitle };

    if (isBookmark) {
      let tempBookmark = [...bookmarkList];
      const bookmarkIndex = tempBookmark.findIndex(e => e.id === boardId);
      tempBookmark[bookmarkIndex] = { ...tempBookmark[bookmarkIndex], title: newTitle };
      dispatch(setBookmarkList(tempBookmark));
    }

    dispatch(setBoards(temp));

    timer = setTimeout(async () => {
      try {
        await boardApi.update(boardId, { title: newTitle });
      } catch (err) {
        handleApiError('Error updating title: ', err);
      }
    }, timeout);
  };

  const updateDescription = async (e) => {
    clearTimeout(timer);

    const newDescription = e.target.value;
    setDescription(newDescription);

    timer = setTimeout(async () => {
      try {
        await boardApi.update(boardId, { description: newDescription });
      } catch (err) {
        handleApiError('Error updating description: ', err);
      }
    }, timeout);
  };

  const toggleBookmark = async () => {
    try {
      const updatedBoard = await boardApi.update(boardId, { bookmark: !isBookmark });
      const updatedBookmarkList = isBookmark ? removeBookmark(updatedBoard) : addBookmark(updatedBoard);
      dispatch(setBookmarkList(updatedBookmarkList));
      setIsBookmark(!isBookmark);
    } catch (err) {
      handleApiError('Error toggling bookmark: ', err);
    }
  };

  const removeBookmark = (board) => {
    return bookmarkList.filter((item) => item.id !== board.id);
  };

  const addBookmark = (board) => {
    return [board, ...bookmarkList];
  };

  const deleteBoard = async () => {
    try {
      await boardApi.delete(boardId);
      const updatedBoards = boards.filter((item) => item.id !== boardId);
      if (isBookmark) {
        const updatedBookmarkList = removeBookmark({ id: boardId });
        dispatch(setBookmarkList(updatedBookmarkList));
      }
      const newBoardId = updatedBoards.length === 0 ? '/boards' : `/boards/${updatedBoards[0].id}`;
      navigate(newBoardId);
      dispatch(setBoards(updatedBoards));
    } catch (err) {
      handleApiError('Error deleting board: ', err);
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <IconButton variant='outlined' onClick={toggleBookmark}>
          {isBookmark ? <StarOutlinedIcon color='warning' /> : <StarBorderOutlinedIcon />}
        </IconButton>
        <IconButton variant='outlined' color='error' onClick={deleteBoard}>
          <DeleteOutlinedIcon />
        </IconButton>
      </Box>
      <Box sx={{ padding: '10px 50px' }}>
        <Box>
          <EmojiSelector icon={icon} onChange={handleIconChange} />
          <TextField
            value={title}
            onChange={updateTitle}
            placeholder='Untitled'
            variant='outlined'
            fullWidth
            sx={{
              '& .MuiOutlinedInput-input': { padding: 0 },
              '& .MuiOutlinedInput-notchedOutline': { border: 'unset ' },
              '& .MuiOutlinedInput-root': { fontSize: '2rem', fontWeight: '700' },
            }}
          />
          <TextField
            value={description}
            onChange={updateDescription}
            placeholder='Add a description'
            variant='outlined'
            multiline
            fullWidth
            sx={{
              '& .MuiOutlinedInput-input': { padding: 0 },
              '& .MuiOutlinedInput-notchedOutline': { border: 'unset ' },
              '& .MuiOutlinedInput-root': { fontSize: '0.8rem' },
            }}
          />
        </Box>
        <Box>
          <Board data={sections} boardId={boardId} />
        </Box>
      </Box>

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

export default Dashboard;
