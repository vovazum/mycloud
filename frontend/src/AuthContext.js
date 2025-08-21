import React, { createContext, useState, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
  });

  // Функция регистрации
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/register/', userData);
      
      if (response.status === 201) {
        // После успешной регистрации автоматически входим
        const loginResponse = await api.post('/api/login/', {
          username: userData.username,
          password: userData.password
        });
        
        if (loginResponse.status === 200) {
          const profileResponse = await api.get('/api/profile/');
          setUser(profileResponse.data);
          return { success: true };
        }
      }
      return { success: false, error: response.data };
    } catch (err) {
      const errorData = err.response?.data || { detail: 'Ошибка регистрации' };
      setError(errorData);
      return { 
        success: false, 
        error: errorData
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Функция входа
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/login/', credentials);
      
      if (response.status === 200) {
        const profileResponse = await api.get('/api/profile/');
        setUser(profileResponse.data);
        return { success: true };
      }
      return { success: false, error: response.data };
    } catch (err) {
      const errorData = err.response?.data || { detail: 'Ошибка входа' };
      setError(errorData);
      return { 
        success: false, 
        error: errorData
      };
    } finally {
      setLoading(false);
    }
  }, []);

// Улучшенная функция выхода с CSRF обработкой
const logout = useCallback(async () => {
  try {
    // Получаем CSRF токен из cookies
    const getCsrfToken = () => {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
      return cookieValue || '';
    };

    // Пытаемся выполнить logout на сервере
    await api.post('/api/logout/', {}, {
      timeout: 3000,
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
      validateStatus: (status) => {
        return status === 200 || status === 403 || status === 401;
      }
    });
  } catch (err) {
    // Игнорируем ошибки таймаута и сетевые ошибки
    if (err.code !== 'ECONNABORTED' && !axios.isCancel(err)) {
      console.warn('Logout warning:', err.message);
    }
  } finally {
    // Всегда очищаем состояние пользователя
    setUser(null);
    setError(null);
    
    // Очищаем localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}, []);

  // Проверка аутентификации
  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/api/profile/', {
        validateStatus: (status) => status === 200 || status === 403 || status === 401
      });
      
      if (response.status === 200) {
        setUser(response.data);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch {
      setUser(null);
      return false;
    }
  }, []);

  // Функция для очистки ошибок
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isAdmin: user?.is_admin || false,
        register,
        login,
        logout,
        checkAuth,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};