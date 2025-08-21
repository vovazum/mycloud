import React from 'react';
import { 
  Typography, 
  Box,
  Button,
  useTheme,
  Container
} from '@mui/material';
import { Link } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Home = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 4,
          px: 2
        }}
      >
        <CloudUploadIcon 
          sx={{ 
            fontSize: 64, 
            color: theme.palette.primary.main,
            mb: 3 
          }} 
        />
        
        <Typography 
          variant="h3" 
          sx={{
            fontWeight: 500,
            color: theme.palette.text.primary,
            mb: 2
          }}
        >
          CloudVault
        </Typography>
        
        <Typography 
          variant="h6"
          sx={{
            color: theme.palette.text.secondary,
            lineHeight: 1.6,
            mb: 3,
            fontWeight: 400
          }}
        >
          Простое и безопасное хранилище для ваших файлов
        </Typography>
        
        <Typography 
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            lineHeight: 1.6,
            mb: 4,
            maxWidth: '400px'
          }}
        >
          Загружайте, храните и делитесь файлами с уверенностью. Ваши данные в безопасности.
        </Typography>
        
        <Button
          component={Link}
          to="/register"
          variant="contained"
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontSize: '1.1rem',
            fontWeight: 500,
            textTransform: 'none',
          }}
        >
          Начать использовать
        </Button>
      </Box>
    </Container>
  );
};

export default Home;