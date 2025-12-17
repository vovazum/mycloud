//frontend/src/components/FileManager/FileUpload.js
import React, { useState } from 'react';
import axios from 'axios';
import {
  Button, Typography, Box, LinearProgress,
  Alert, TextField, Snackbar, IconButton as MuiIconButton
} from '@mui/material';
import { CloudUpload, Close } from '@mui/icons-material';

const API_BASE = 'http://localhost:8000';

const getCSRFToken = () => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue || '';
};

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setSuccess('');
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Пожалуйста, выберите файл для загрузки');
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Файл слишком большой. Максимальный размер 50MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('comment', comment);

    try {
      setUploadProgress(0);
      setError('');
      setSuccess('');

      // Получаем CSRF токен
      await axios.get(`${API_BASE}/api/csrf/`, {
        withCredentials: true
      });

      const response = await axios.post(
        `${API_BASE}/api/files/upload/`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-CSRFToken': getCSRFToken()
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      setSuccess('Файл успешно загружен');
      setFile(null);
      setComment('');
      setUploadProgress(0);
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                         err.response?.data?.detail || 
                         'Ошибка при загрузке файла';
      setError(errorMessage);
      setUploadProgress(0);
    }
  };

  return (
    <Box sx={{ mt: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Загрузить новый файл
      </Typography>
      
      <input
        accept="*/*"
        style={{ display: 'none' }}
        id="file-upload-input"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload-input">
        <Button
          variant="outlined"
          component="span"
          startIcon={<CloudUpload />}
          sx={{ mb: 2 }}
        >
          Выбрать файл
        </Button>
      </label>
      
      {file && (
        <Box sx={{ mb: 2 }}>
          <Typography>Выбран файл: {file.name}</Typography>
          <Typography variant="body2">
            Размер: {(file.size / (1024 * 1024)).toFixed(2)} MB
          </Typography>
        </Box>
      )}
      
      <TextField
        label="Комментарий к файлу"
        fullWidth
        multiline
        rows={2}
        value={comment}
        onChange={handleCommentChange}
        sx={{ mb: 2 }}
      />
      
      {uploadProgress > 0 && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
          />
          <Typography variant="body2" align="center">
            Загружено: {uploadProgress}%
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert 
          severity="error"
          action={
            <MuiIconButton
              size="small"
              color="inherit"
              onClick={() => setError('')}
            >
              <Close fontSize="small" />
            </MuiIconButton>
          }
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success"
          action={
            <MuiIconButton
              size="small"
              color="inherit"
              onClick={() => setSuccess('')}
            >
              <Close fontSize="small" />
            </MuiIconButton>
          }
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}
      
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={!file || uploadProgress > 0}
        fullWidth
      >
        Загрузить файл
      </Button>
      
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        Максимальный размер файла: 50MB
      </Typography>
    </Box>
  );
};

export default FileUpload;