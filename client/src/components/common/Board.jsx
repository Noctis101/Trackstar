import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Box, Button, Typography, Divider, TextField, IconButton, Card, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import sectionApi from '../../api/sectionApi';
import taskApi from '../../api/taskApi';
import Task from './Task';

let timer;
const timeout = 500;

const Board = props => {
  const boardId = props.boardId;
  const [data, setData] = useState([]);
  const [selectedTask, setSelectedTask] = useState(undefined);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState('');

  useEffect(() => {
    setData(props.data)
  }, [props.data])

  const onDragEnd = async ({ source, destination }) => {
    if (!destination) return;

    const sourceColumnIndex = data.findIndex(e => e.id === source.droppableId);
    const destinationColumnIndex = data.findIndex(e => e.id === destination.droppableId);
    const sourceColumn = data[sourceColumnIndex];
    const destinationColumn = data[destinationColumnIndex];

    const sourceSectionId = sourceColumn.id;
    const destinationSectionId = destinationColumn.id;

    const sourceTasks = [...sourceColumn.tasks];
    const destinationTasks = [...destinationColumn.tasks];

    if (source.droppableId !== destination.droppableId) {
      const [removed] = sourceTasks.splice(source.index, 1);
      destinationTasks.splice(destination.index, 0, removed);
      data[sourceColumnIndex].tasks = sourceTasks;
      data[destinationColumnIndex].tasks = destinationTasks;
    } else {
      const [removed] = destinationTasks.splice(source.index, 1);
      destinationTasks.splice(destination.index, 0, removed);
      data[destinationColumnIndex].tasks = destinationTasks;
    }

    try {
      await taskApi.updatePosition(boardId, {
        resourceList: sourceTasks,
        destinationList: destinationTasks,
        resourceSectionId: sourceSectionId,
        destinationSectionId: destinationSectionId
      })
      setData(data);
    } catch (err) {
      handleApiError('Error updating section: ', err);
    }
  };

  const createSection = async () => {
    try {
      const section = await sectionApi.create(boardId);
      setData([...data, section]);
    } catch (err) {
      handleApiError('Error creating section: ', err);
    }
  }

  const deleteSection = async (sectionId) => {
    try {
      await sectionApi.delete(boardId, sectionId);
      const newData = [...data].filter(e => e.id !== sectionId);
      setData(newData);
    } catch (err) {
      handleApiError('Error deleting section: ', err);
    }
  };

  const updateSectionTitle = async (e, sectionId) => {
    clearTimeout(timer);

    const newTitle = e.target.value;
    const newData = [...data];
    const index = newData.findIndex(e => e.id === sectionId);
    newData[index].title = newTitle;
    setData(newData);

    timer = setTimeout(async () => {
      try {
        await sectionApi.update(boardId, sectionId, { title: newTitle });
      } catch (err) {
        handleApiError('Error updating section title: ', err);
      }
    }, timeout);
  };

  const createTask = async (sectionId) => {
    try {
      const task = await taskApi.create(boardId, { sectionId });
      const newData = [...data];
      const index = newData.findIndex(e => e.id === sectionId);
      newData[index].tasks.unshift(task);
      setData(newData);
    } catch (err) {
      handleApiError('Error creating task: ', err);
    }
  };

  const onUpdateTask = (task) => {
    const newData = [...data];
    const sectionIndex = newData.findIndex(e => e.id === task.section.id);
    const taskIndex = newData[sectionIndex].tasks.findIndex(e => e.id === task.id);
    newData[sectionIndex].tasks[taskIndex] = task;
    setData(newData);
  }

  const onDeleteTask = (task) => {
    const newData = [...data];
    const sectionIndex = newData.findIndex(e => e.id === task.section.id);
    const taskIndex = newData[sectionIndex].tasks.findIndex(e => e.id === task.id);
    newData[sectionIndex].tasks.splice(taskIndex, 1);
    setData(newData);
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Button onClick={createSection}>
          Add section
        </Button>
        <Typography variant='body2' fontWeight='700'>
          {data.length} Sections
        </Typography>
      </Box>
      <Divider sx={{ margin: '10px 0' }} />
      <DragDropContext onDragEnd={onDragEnd}>
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          width: 'calc(100vw - 400px)',
          overflowX: 'auto'
        }}>
          {
            data.map(section => (
              <div key={section.id} style={{ width: '300px' }}>
                <Droppable key={section.id} droppableId={section.id}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{ width: '300px', padding: '10px', marginRight: '10px' }}
                    >
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}>
                        <TextField
                          value={section.title}
                          onChange={(e) => updateSectionTitle(e, section.id)}
                          placeholder='Untitled'
                          variant='outlined'
                          sx={{
                            flexGrow: 1,
                            '& .MuiOutlinedInput-input': { padding: 0 },
                            '& .MuiOutlinedInput-notchedOutline': { border: 'unset ' },
                            '& .MuiOutlinedInput-root': { fontSize: '1rem', fontWeight: '700' }
                          }}
                        />
                        <IconButton
                          variant='outlined'
                          size='small'
                          sx={{
                            color: 'gray',
                            '&:hover': { color: 'green' }
                          }}
                          onClick={() => createTask(section.id)}
                        >
                          <AddOutlinedIcon />
                        </IconButton>
                        <IconButton
                          variant='outlined'
                          size='small'
                          sx={{
                            color: 'gray',
                            '&:hover': { color: 'red' }
                          }}
                          onClick={() => deleteSection(section.id)}
                        >
                          <DeleteOutlinedIcon />
                        </IconButton>
                      </Box>
                      {/* Tasks */}
                      {
                        section.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  padding: '10px',
                                  marginBottom: '10px',
                                  cursor: snapshot.isDragging ? 'grab' : 'pointer!important'
                                }}
                                onClick={() => setSelectedTask(task)}
                              >
                                <Typography>
                                  {task.title === '' ? 'Untitled' : task.title}
                                </Typography>
                              </Card>
                            )}
                          </Draggable>
                        ))
                      }
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </div>
            ))
          }
        </Box>
      </DragDropContext>
      <Task
        task={selectedTask}
        boardId={boardId}
        onClose={() => setSelectedTask(undefined)}
        onUpdate={onUpdateTask}
        onDelete={onDeleteTask}
      />

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

export default Board;
