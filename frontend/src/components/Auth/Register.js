import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import { 
  TextField, 
  Button, 
  Typography, 
  Box,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    password2: '',
    showPassword: false,
    showPassword2: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'username':
        if (!value) {
          newErrors.username = 'Логин обязателен';
        } else if (!/^[a-zA-Z][a-zA-Z0-9]{3,19}$/.test(value)) {
          newErrors.username = 'Логин должен быть 4-20 символов, начинаться с буквы и содержать только латинские буквы и цифры';
        } else {
          delete newErrors.username;
        }
        break;
        
      case 'email':
        if (!value) {
          newErrors.email = 'Email обязателен';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Некорректный email';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = 'Пароль обязателен';
        } else if (value.length < 6) {
          newErrors.password = 'Пароль должен быть не менее 6 символов';
        } else if (!/[A-Z]/.test(value)) {
          newErrors.password = 'Пароль должен содержать хотя бы одну заглавную букву';
        } else if (!/[0-9]/.test(value)) {
          newErrors.password = 'Пароль должен содержать хотя бы одну цифру';
        } else if (!/[^A-Za-z0-9]/.test(value)) {
          newErrors.password = 'Пароль должен содержать хотя бы один специальный символ';
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'password2':
        if (value !== formData.password) {
          newErrors.password2 = 'Пароли не совпадают';
        } else {
          delete newErrors.password2;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Валидация при изменении
    if (name !== 'full_name') {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверка всех полей перед отправкой
    validateField('username', formData.username);
    validateField('email', formData.email);
    validateField('password', formData.password);
    validateField('password2', formData.password2);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setLoading(true);

    try {
      const result = await register(formData);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors(result.error || {});
      }
    } catch (error) {
      setErrors({ non_field_errors: ['Ошибка соединения с сервером'] });
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setFormData({ ...formData, showPassword: !formData.showPassword });
  };

  const handleClickShowPassword2 = () => {
    setFormData({ ...formData, showPassword2: !formData.showPassword2 });
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Регистрация
      </Typography>

      {errors.non_field_errors && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.non_field_errors}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Логин"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
            required
          />

          <TextField
            label="Полное имя"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            error={!!errors.full_name}
            helperText={errors.full_name}
            required
          />

          <TextField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            required
          />

          <FormControl variant="outlined" error={!!errors.password}>
            <InputLabel htmlFor="password">Пароль</InputLabel>
            <OutlinedInput
              id="password"
              name="password"
              type={formData.showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Пароль"
            />
            <FormHelperText>{errors.password}</FormHelperText>
          </FormControl>

          <FormControl variant="outlined" error={!!errors.password2}>
            <InputLabel htmlFor="password2">Подтвердите пароль</InputLabel>
            <OutlinedInput
              id="password2"
              name="password2"
              type={formData.showPassword2 ? 'text' : 'password'}
              value={formData.password2}
              onChange={handleChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword2}
                    edge="end"
                  >
                    {formData.showPassword2 ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Подтвердите пароль"
            />
            <FormHelperText>{errors.password2}</FormHelperText>
          </FormControl>

          {Object.keys(errors)
            .filter(key => !['username', 'full_name', 'email', 'password', 'password2', 'non_field_errors'].includes(key))
            .map(key => (
              <Alert key={key} severity="error">
                {Array.isArray(errors[key]) ? errors[key].join(' ') : errors[key]}
              </Alert>
          ))}

          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            disabled={loading || Object.keys(errors).length > 0}
            fullWidth
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default Register;