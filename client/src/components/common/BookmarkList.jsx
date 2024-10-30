import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { Box, ListItem, ListItemButton, Typography } from '@mui/material';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { setBookmarkList } from '../../redux/features/bookmarkSlice';
import boardApi from '../../api/boardApi';

const BookmarkList = () => {
  const dispatch = useDispatch();
  const bookmarks = useSelector((state) => state.bookmarks.value);
  const { boardId } = useParams();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await boardApi.getBookmarks();
        dispatch(setBookmarkList(res));
      } catch (err) {
        handleApiError('Error fetching bookmarks: ', err);
      }
    };
    fetchBookmarks();
  }, [dispatch]);

  useEffect(() => {
    const index = bookmarks.findIndex((item) => item.id === boardId);
    setActiveIndex(index);
  }, [bookmarks, boardId]);

  const onDragEnd = async ({ source, destination }) => {
    try {
      const newList = [...bookmarks];
      const [removed] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, removed);

      const activeItemIndex = newList.findIndex((item) => item.id === boardId);
      setActiveIndex(activeItemIndex);

      dispatch(setBookmarkList(newList));
      await boardApi.updateBookmarkPosition({ boards: newList });
    } catch (err) {
      handleApiError('Error updating bookmark position: ', err);
    }
  };

  const handleApiError = (message, error) => {
    console.error(message, error);
    alert(error.message);
  };

  return (
    <>
      <ListItem>
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant='body2' fontWeight='700'>
            Bookmarks
          </Typography>
        </Box>
      </ListItem>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={'list-board-droppable'}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {bookmarks.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <ListItemButton
                      ref={provided.innerRef}
                      {...provided.dragHandleProps}
                      {...provided.draggableProps}
                      selected={index === activeIndex}
                      component={Link}
                      to={`/boards/${item.id}`}
                      sx={{ pl: '20px', cursor: snapshot.isDragging ? 'grab' : 'pointer!important' }}
                    >
                      <Typography variant='body2' fontWeight='700' sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.icon} {item.title}
                      </Typography>
                    </ListItemButton>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default BookmarkList;
