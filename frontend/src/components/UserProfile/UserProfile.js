import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { Delete, Edit, Save, Cancel, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const getCsrfToken = () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue || '';
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/profile/',
        { withCredentials: true }
      );
      setUser(response.data);
      setFormData({
        username: response.data.username,
        email: response.data.email,
        full_name: response.data.full_name || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
      setError('Не удалось загрузить данные профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    // Валидация
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('Новые пароли не совпадают');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name
      };

      // Если меняется пароль, добавляем поля
      if (formData.newPassword) {
        updateData.current_password = formData.currentPassword;
        updateData.new_password = formData.newPassword;
      }

      const response = await axios.patch(
        'http://localhost:8000/api/profile/',
        updateData,
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': getCsrfToken(),
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Данные успешно обновлены');
      setEditing(false);
      await fetchUserProfile(); // Обновляем данные

    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      setError(err.response?.data?.error || 'Ошибка при обновлении профиля');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user.username) {
      setError('Для подтверждения введите ваш username');
      return;
    }

    try {
      await axios.delete(
        'http://localhost:8000/api/profile/',
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': getCsrfToken()
          }
        }
      );

      // Перенаправляем на главную страницу
      navigate('/');
      alert('Ваш аккаунт был успешно удален');

    } catch (err) {
      console.error('Ошибка при удалении аккаунта:', err);
      setError(err.response?.data?.error || 'Ошибка при удалении аккаунта');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:8000/api/logout/',
        {},
        { withCredentials: true }
      );
      navigate('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const cancelEdit = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      full_name: user?.full_name || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 3 }}>
          Не удалось загрузить данные пользователя
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Мой профиль</Typography>
          
          {!editing ? (
            <Button
              startIcon={<Edit />}
              onClick={() => setEditing(true)}
              variant="outlined"
            >
              Редактировать
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<Cancel />}
                onClick={cancelEdit}
                variant="outlined"
                color="secondary"
              >
                Отмена
              </Button>
              <Button
                startIcon={<Save />}
                onClick={handleSave}
                variant="contained"
              >
                Сохранить
              </Button>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Имя пользователя"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            disabled={!editing}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={!editing}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Полное имя"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            disabled={!editing}
            margin="normal"
          />

          {editing && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Смена пароля
              </Typography>
              
              <TextField
                fullWidth
                label="Текущий пароль"
                name="currentPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleInputChange}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <Tooltip title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
              
              <TextField
                fullWidth
                label="Новый пароль"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleInputChange}
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Подтвердите новый пароль"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                margin="normal"
              />
            </>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Информация об аккаунте
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              label={`ID: ${user.id}`} 
              variant="outlined" 
            />
            <Chip 
              label={`Дата регистрации: ${new Date(user.date_joined).toLocaleDateString('ru-RU')}`} 
              variant="outlined" 
            />
            <Chip 
              label={`Статус: ${user.is_admin ? 'Администратор' : 'Пользователь'}`} 
              color={user.is_admin ? 'primary' : 'default'}
              variant="outlined"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={handleLogout}
              variant="outlined"
              color="primary"
            >
              Выйти
            </Button>

            <Button
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
              variant="outlined"
              color="error"
            >
              Удалить аккаунт
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Удаление аккаунта</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Это действие невозможно отменить. Все ваши файлы и данные будут безвозвратно удалены.
          </Typography>
          <Typography variant="body2" color="error" gutterBottom>
            Для подтверждения введите ваш username: <strong>{user.username}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Введите username для подтверждения"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            disabled={deleteConfirm !== user.username}
          >
            Удалить аккаунт
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile;