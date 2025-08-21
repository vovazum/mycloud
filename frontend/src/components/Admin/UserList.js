import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Chip,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Delete, AdminPanelSettings, Person, FolderOpen } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Функция для получения CSRF токена из cookies
  const getCsrfToken = () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue || '';
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8000/api/admin/users/',
          { 
            withCredentials: true,
            headers: {
              'X-CSRFToken': getCsrfToken()
            }
          }
        );
        setUsers(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке пользователей:', err);
        setError('Не удалось загрузить список пользователей');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (userId, currentStatus) => {
    try {
      const csrfToken = getCsrfToken();
      const response = await axios.patch(
        `http://localhost:8000/api/admin/users/${userId}/`,
        { is_admin: !currentStatus },
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !user.is_admin } 
          : user
      ));
    } catch (err) {
      console.error('Ошибка при изменении прав администратора:', err);
      let errorMessage = 'Не удалось изменить права администратора';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 403) {
        errorMessage = 'Доступ запрещен. Недостаточно прав.';
      }
      
      alert(errorMessage);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      const csrfToken = getCsrfToken();
      await axios.delete(
        `http://localhost:8000/api/admin/users/${userId}/`,
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrfToken
          }
        }
      );
      setUsers(users.filter(user => user.id !== userId));
      alert('Пользователь успешно удален');
    } catch (err) {
      console.error('Ошибка при удалении пользователя:', err);
      let errorMessage = 'Не удалось удалить пользователя';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 403) {
        errorMessage = 'Доступ запрещен. Недостаточно прав.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Пользователь не найден';
      }
      
      alert(errorMessage);
    }
  };

  const handleViewFiles = (userId) => {
    navigate(`/admin/user-files/${userId}`);
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Имя пользователя</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Полное имя</TableCell>
            <TableCell>Дата регистрации</TableCell>
            <TableCell>Администратор</TableCell>
            <TableCell>Файлы</TableCell>
            <TableCell>Размер хранилища</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{formatDate(user.date_joined)}</TableCell>
              <TableCell>
                <Chip
                  icon={user.is_admin ? <AdminPanelSettings /> : <Person />}
                  label={user.is_admin ? 'Да' : 'Нет'}
                  color={user.is_admin ? 'primary' : 'default'}
                  variant={user.is_admin ? 'filled' : 'outlined'}
                />
              </TableCell>
              <TableCell>{user.file_count || 0}</TableCell>
              <TableCell>{formatSize(user.total_size || 0)}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                    color={user.is_admin ? 'secondary' : 'primary'}
                    title={user.is_admin ? 'Убрать права администратора' : 'Сделать администратором'}
                    size="small"
                  >
                    {user.is_admin ? <AdminPanelSettings /> : <Person />}
                  </IconButton>
                  
                  <IconButton 
                    onClick={() => handleViewFiles(user.id)}
                    color="info"
                    title="Просмотреть файлы"
                    size="small"
                  >
                    <FolderOpen />
                  </IconButton>
                  
                  <IconButton 
                    onClick={() => handleDeleteUser(user.id)}
                    color="error"
                    title="Удалить пользователя"
                    size="small"
                    disabled={user.is_admin} // Запрещаем удаление администраторов
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserList;