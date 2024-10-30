import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Drawer, IconButton, List, ListItem, ListItemButton, Typography } from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { setBoards } from '../../redux/features/boardSlice';
import assets from '../../assets/index';
import boardApi from '../../api/boardApi';
import BookmarkList from './BookmarkList';

const Sidebar = () => {
  const user = useSelector((state) => state.user.value);
  const boards = useSelector((state) => state.board.value);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { boardId } = useParams();
  const [activeIndex, setActiveIndex] = useState(0);

  const sidebarWidth = 250;

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await boardApi.getAll();
        dispatch(setBoards(res));
      } catch (err) {
        handleApiError('Error retrieving boards: ', err);
      }
    };
    fetchBoards();
  }, [dispatch]);

  useEffect(() => {
    const activeItemIndex = boards.findIndex(board => board.id === boardId);
    if (boards.length > 0 && boardId === undefined) {
      navigate(`/boards/${boards[0].id}`);
    }
    setActiveIndex(activeItemIndex);
  }, [boards, boardId, navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const onDragEnd = async ({ source, destination }) => {
    const updatedBoards = Array.from(boards);
    const [removed] = updatedBoards.splice(source.index, 1);
    updatedBoards.splice(destination.index, 0, removed);
    const activeItemIndex = updatedBoards.findIndex(board => board.id === boardId);
    setActiveIndex(activeItemIndex);
    dispatch(setBoards(updatedBoards));
    try {
      await boardApi.updatePosition({ boards: updatedBoards });
    } catch (err) {
      handleApiError('Error updating position: ', err);
    }
  };

  const handleApiError = (message, error) => {
    console.error(message, error);
    alert(error.message);
  };

  const addBoard = async () => {
    try {
      const newBoard = await boardApi.create();
      const updatedBoards = [newBoard, ...boards];
      dispatch(setBoards(updatedBoards));
      navigate(`/boards/${newBoard.id}`);
    } catch (err) {
      console.log(err);
      handleApiError(err);
    }
  };

  return (
    <Drawer
      container={window.document.body}
      variant='permanent'
      open={true}
      sx={{
        width: sidebarWidth,
        height: '100vh',
        '& > div': { borderRight: 'none' }
      }}
    >
      <List
        disablePadding
        sx={{
          width: sidebarWidth,
          height: '100vh',
          backgroundColor: assets.colors.secondary
        }}
      >
        <ListItem>
          <Box sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant='body2' fontWeight='700'>
              {user.username}
            </Typography>
            <IconButton onClick={logout}>
              <LogoutOutlinedIcon fontSize='small' />
            </IconButton>
          </Box>
        </ListItem>
        <Box sx={{ paddingTop: '10px' }} />
        <BookmarkList />
        <Box sx={{ paddingTop: '10px' }} />
        <ListItem>
          <Box sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant='body2' fontWeight='700'>
              Private
            </Typography>
            <IconButton onClick={addBoard}>
              <AddBoxOutlinedIcon fontSize='small' />
            </IconButton>
          </Box>
        </ListItem>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable key={'list-board-droppable-key'} droppableId={'list-board-droppable'}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {
                  boards.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <ListItemButton
                          ref={provided.innerRef}
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                          selected={index === activeIndex}
                          component={Link}
                          to={`/boards/${item.id}`}
                          sx={{
                            pl: '20px',
                            cursor: snapshot.isDragging ? 'grab' : 'pointer!important'
                          }}
                        >
                          <Typography
                            variant='body2'
                            fontWeight='700'
                            sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {item.icon} {item.title}
                          </Typography>
                        </ListItemButton>
                      )}
                    </Draggable>
                  ))
                }
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </List>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#292929'
        }}
      >
        <img
          src={assets.images.verticalLogo}
          style={{backgroundColor: '#292929'}}
        />
      </div>
    </Drawer>
  );
};

export default Sidebar;
