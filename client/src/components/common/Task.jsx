import React, { useEffect, useRef, useState } from 'react';
import { Backdrop, Fade, IconButton, Modal, Box, TextField, Typography, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Moment from 'moment';
import taskApi from '../../api/taskApi';
import './Task.css';

const modalStyle = {
  outline: 'none',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  border: '0px solid #000',
  boxShadow: 24,
  p: 1,
  height: '80%'
}

let timer;
const timeout = 500;
let isModalClosed = false;

const Task = props => {
  const boardId = props.boardId;
  const [task, setTask] = useState(props.task);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState('');
  const editorWrapperRef = useRef();

  useEffect(() => {
    setTask(props.task);
    setTitle(props.task !== undefined ? props.task.title : '');
    setContent(props.task !== undefined ? props.task.content : '');
    if (props.task !== undefined) {
      isModalClosed = false;

      updateEditorHeight();
    }
  }, [props.task]);

  const updateEditorHeight = () => {
    setTimeout(() => {
      if (editorWrapperRef.current) {
        const box = editorWrapperRef.current;
        box.querySelector('.ck-editor__editable_inline').style.height = (box.offsetHeight - 50) + 'px';
      }
    }, timeout);
  };

  const onClose = () => {
    isModalClosed = true;
    props.onUpdate(task);
    props.onClose();
  };

  const deleteTask = async () => {
    try {
      await taskApi.delete(boardId, task.id);
      props.onDelete(task);
      setTask(undefined);
    } catch (err) {
      handleApiError('Error deleting task: ', err);
    }
  };

  const updateTaskTitle = async (e) => {
    clearTimeout(timer);
    const newTitle = e.target.value;

    timer = setTimeout(async () => {
      try {
        await taskApi.update(boardId, task.id, { title: newTitle });
      } catch (err) {
        handleApiError('Error updating task title ', err);
      }
    }, timeout);

    task.title = newTitle;
    setTitle(newTitle);
    props.onUpdate(task);
  };

  const updateTaskContent = async (event, editor) => {
    clearTimeout(timer);
    const data = editor.getData();

    console.log({ isModalClosed });

    if (!isModalClosed) {
      timer = setTimeout(async () => {
        try {
          await taskApi.update(boardId, task.id, { content: data });
        } catch (err) {
          handleApiError('Unexpected error occurred: ', err);
        }
      }, timeout);

      task.content = data;
      setContent(data);
      props.onUpdate(task);
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
      <Modal
        open={task !== undefined}
        onClose={onClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500
          }
        }}
      >
        <Fade in={task !== undefined}>
          <Box sx={modalStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
              <IconButton variant='outlined' color='error' onClick={deleteTask}>
                <DeleteOutlinedIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column', padding: '2rem 5rem 5rem' }}>
              <TextField
                value={title}
                onChange={updateTaskTitle}
                placeholder='Untitled'
                variant='outlined'
                fullWidth
                sx={{ width: '100%', '& .MuiOutlinedInput-input': { padding: 0 }, '& .MuiOutlinedInput-notchedOutline': { border: 'unset ' }, '& .MuiOutlinedInput-root': { fontSize: '2.5rem', fontWeight: '700' }, marginBottom: '10px' }}
              />
              <Typography variant='body2' fontWeight='700'>
                {task !== undefined ? Moment(task.createdAt).format('YYYY-MM-DD') : ''}
              </Typography>
              <Divider sx={{ margin: '1.5rem 0' }} />
              <Box ref={editorWrapperRef} sx={{ position: 'relative', height: '80%', overflowX: 'hidden', overflowY: 'auto', color: '#0FFF50' }}>
                <CKEditor
                  editor={ClassicEditor}
                  data={content}
                  config={{ placeholder: 'Please enter the details of the task here.' }}
                  onChange={updateTaskContent}
                  onFocus={updateEditorHeight}
                  onBlur={updateEditorHeight}
                />
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>

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
};

export default Task;
