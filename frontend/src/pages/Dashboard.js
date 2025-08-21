
import React, { useState } from 'react';
import { Container, Typography, Tabs, Tab, Box } from '@mui/material';
import FileList from '../components/FileManager/FileList';
import FileUpload from '../components/FileManager/FileUpload';
import UserProfile from '../components/UserProfile/UserProfile';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleUploadSuccess = () => {
    // Можно добавить логику обновления списка файлов
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Личный кабинет
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Мои файлы" />
          <Tab label="Загрузить файл" />
          <Tab label="Мой профиль" />
        </Tabs>
      </Box>

      {activeTab === 0 && <FileList />}
      {activeTab === 1 && <FileUpload onUploadSuccess={handleUploadSuccess} />}
      {activeTab === 2 && <UserProfile />}
    </Container>
  );
};

export default Dashboard;