import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import { 
  TextField, 
  Button, 
  Typography, 
  Box,
  Alert
} from '@mui/material';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const result = await login(credentials);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        // Обработка ошибок с бэкенда
        setErrors(result.error || {});
      }
    } catch (error) {
      setErrors({ non_field_errors: ['Ошибка соединения с сервером'] });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Вход в систему
      </Typography>

      {/* Общие ошибки */}
      {errors.non_field_errors && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.non_field_errors}
        </Alert>
      )}

      {errors.detail && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.detail}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Логин"
          fullWidth
          margin="normal"
          name="username"
          value={credentials.username}
          onChange={handleChange}
          error={!!errors.username}
          helperText={errors.username}
          required
        />
        
        <TextField
          label="Пароль"
          type="password"
          fullWidth
          margin="normal"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          required
        />
        
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth
          size="large"
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
        </Button>
      </form>
    </Box>
  );
};

export default Login;