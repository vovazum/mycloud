//frontend/src/components/Admin/UserFiles.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { ArrowBack, Download, Description, Visibility, Delete } from '@mui/icons-material';

const UserFiles = () => {
  const [files, setFiles] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userId } = useParams();
  const navigate = useNavigate();

  const getCsrfToken = () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue || '';
  };

  useEffect(() => {
    const fetchUserFiles = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/admin/users/${userId}/files/`,
          { withCredentials: true }
        );
        setUser(response.data.user);
        setFiles(response.data.files);
      } catch (err) {
        console.error('Ошибка при загрузке файлов пользователя:', err);
        setError('Не удалось загрузить файлы пользователя');
      } finally {
        setLoading(false);
      }
    };
    fetchUserFiles();
  }, [userId]);

  const handleDownload = async (fileId, fileName) => {
    try {
      // Используем административный endpoint для скачивания
      window.open(`http://localhost:8000/api/admin/files/${fileId}/`, '_blank');
    } catch (err) {
      console.error('Ошибка при скачивании файла:', err);
      setError('Ошибка при скачивании файла');
    }
  };

  const handlePreview = (fileId) => {
    // Для просмотра используем параметр preview
    window.open(`http://localhost:8000/api/admin/files/${fileId}/?preview=1`, '_blank');
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот файл?')) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8000/api/admin/files/${fileId}/`,
        { 
          withCredentials: true,
          headers: {
            'X-CSRFToken': getCsrfToken()
          }
        }
      );
      
      // Обновляем список файлов
      const response = await axios.get(
        `http://localhost:8000/api/admin/users/${userId}/files/`,
        { withCredentials: true }
      );
      setFiles(response.data.files);
      
      alert('Файл успешно удален');
    } catch (err) {
      console.error('Ошибка при удалении файла:', err);
      setError(err.response?.data?.error || 'Ошибка при удалении файла');
    }
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Никогда';
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin')}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          Назад к списку пользователей
        </Button>
        
        {user && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Файлы пользователя: {user.username}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <Chip 
                icon={<Description />}
                label={`Файлов: ${files.length}`} 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                label={`Общий размер: ${formatSize(files.reduce((sum, file) => sum + (file.size || 0), 0))}`} 
                color="secondary" 
                variant="outlined"
              />
              <Chip 
                label={`Email: ${user.email}`} 
                variant="outlined"
              />
              <Chip 
                label={`Полное имя: ${user.full_name}`} 
                variant="outlined"
              />
              <Chip 
                label={`Администратор: ${user.is_admin ? 'Да' : 'Нет'}`} 
                color={user.is_admin ? 'primary' : 'default'}
                variant="outlined"
              />
            </Box>
          </Paper>
        )}

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Имя файла</TableCell>
                  <TableCell>Размер</TableCell>
                  <TableCell>Комментарий</TableCell>
                  <TableCell>Дата загрузки</TableCell>
                  <TableCell>Последнее скачивание</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body1" sx={{ py: 3 }}>
                        У пользователя нет файлов
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Description sx={{ mr: 1, color: 'text.secondary' }} />
                          {file.original_name}
                        </Box>
                      </TableCell>
                      <TableCell>{formatSize(file.size)}</TableCell>
                      <TableCell>{file.comment || '-'}</TableCell>
                      <TableCell>{formatDate(file.upload_date)}</TableCell>
                      <TableCell>{formatDate(file.last_download_date)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Скачать">
                            <IconButton
                              onClick={() => handleDownload(file.id, file.original_name)}
                              size="small"
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Просмотреть">
                            <IconButton
                              onClick={() => handlePreview(file.id)}
                              size="small"
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Удалить">
                            <IconButton
                              onClick={() => handleDeleteFile(file.id)}
                              color="error"
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserFiles;