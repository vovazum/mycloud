import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
 TableRow, 
  Paper, 
  Typography,
  IconButton, 
  CircularProgress, 
  Alert, 
  TextField, 
  Dialog, 
  DialogActions,
  DialogContent, 
  DialogTitle, 
  Button,
  Tooltip, 
  Snackbar,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Download, 
  Delete, 
  Edit, 
  Link as LinkIcon, 
  Visibility, 
  Refresh,
  Close,
  ContentCopy,
  MoreVert,
  Share,
  DriveFileRenameOutline
} from '@mui/icons-material';

const API_BASE = 'http://localhost:8000';

const getCSRFToken = () => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue || '';
};

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dialogTab, setDialogTab] = useState(0);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/files/`,
        { withCredentials: true }
      );
      setFiles(Array.isArray(response.data?.files) ? response.data.files : []);
    } catch (err) {
      console.error('Ошибка при загрузке файлов:', err);
      setError('Не удалось загрузить файлов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDownload = async (fileId) => {
    try {
      setDownloadingId(fileId);
      setError(null);
      
      const fileInfo = files.find(f => f.id === fileId);
      if (!fileInfo) {
        throw new Error('Файл не найден');
      }

      window.open(`${API_BASE}/api/files/${fileId}/`, '_blank');
      
      setTimeout(() => {
        fetchFiles();
      }, 1000);
      
    } catch (err) {
      console.error('Ошибка скачивания:', err);
      setError('Ошибка при скачивании файла');
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreview = (fileId) => {
    window.open(`${API_BASE}/api/files/${fileId}/?preview=1`, '_blank');
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот файл?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_BASE}/api/files/${fileId}/`,
        { 
          withCredentials: true,
          headers: {
            'X-CSRFToken': getCSRFToken()
          }
        }
      );
      setSnackbarMessage('Файл успешно удален');
      setSnackbarOpen(true);
      await fetchFiles();
    } catch (err) {
      console.error('Ошибка при удалении файла:', err);
      setError(err.response?.data?.error || 'Ошибка при удалении файла');
    }
  };

  const handleRename = async () => {
    if (!newFileName.trim()) {
      setError('Имя файла не может быть пустым');
      return;
    }

    try {
      await axios.patch(
        `${API_BASE}/api/files/${editingFile.id}/`,
        { original_name: newFileName.trim() },
        { 
          withCredentials: true,
          headers: {
            'X-CSRFToken': getCSRFToken(),
            'Content-Type': 'application/json'
          }
        }
      );
      setSnackbarMessage('Файл успешно переименован');
      setSnackbarOpen(true);
      setEditingFile(null);
      setNewFileName('');
      await fetchFiles();
    } catch (err) {
      console.error('Ошибка при переименовании:', err);
      setError(err.response?.data?.error || 'Ошибка при переименовании файла');
    }
  };

  const handleEditComment = async () => {
    try {
      await axios.patch(
        `${API_BASE}/api/files/${editingFile.id}/`,
        { comment: newComment },
        { 
          withCredentials: true,
          headers: {
            'X-CSRFToken': getCSRFToken(),
            'Content-Type': 'application/json'
          }
        }
      );
      setSnackbarMessage('Комментарий успешно обновлен');
      setSnackbarOpen(true);
      setEditingFile(null);
      setNewComment('');
      await fetchFiles();
    } catch (err) {
      console.error('Ошибка при обновлении:', err);
      setError(err.response?.data?.error || 'Ошибка при обновлении комментария');
    }
  };

  const handleCopyLink = async (file) => {
    try {
      if (file.download_link) {
        const shareLink = `${API_BASE}/api/download/${file.download_link}/`;
        await navigator.clipboard.writeText(shareLink);
        setSnackbarMessage('Ссылка скопирована в буфер обмена');
        setSnackbarOpen(true);
      } else {
        setError('У этого файла нет ссылки для скачивания');
      }
    } catch (err) {
      console.error('Ошибка копирования:', err);
      setError('Не удалось скопировать ссылку');
    }
  };

  const handleMenuOpen = (event, file) => {
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFile(null);
  };

  const handleEditDialogOpen = (file, tabIndex = 0) => {
    setEditingFile(file);
    setNewComment(file.comment || '');
    setNewFileName(file.original_name);
    setDialogTab(tabIndex);
  };

  const handleDialogTabChange = (event, newValue) => {
    setDialogTab(newValue);
  };

  const formatFileSize = (bytes) => {
    if (bytes === null || bytes === undefined || isNaN(bytes) || bytes === 0) {
      return '0 KB';
    }
    
    const bytesNum = Number(bytes);
    
    if (bytesNum < 1024 * 1024) {
      const sizeKB = bytesNum / 1024;
      return `${sizeKB.toFixed(2)} KB`;
    }
    
    const sizeMB = bytesNum / (1024 * 1024);
    return `${sizeMB.toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Еще не скачивался';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding="20px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Мои файлы</Typography>
        <Button 
          variant="outlined" 
          startIcon={<Refresh />}
          onClick={fetchFiles}
        >
          Обновить
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Имя файла</TableCell>
              <TableCell>Комментарий</TableCell>
              <TableCell>Размер</TableCell>
              <TableCell>Дата загрузки</TableCell>
              <TableCell>Последнее скачивание</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.length > 0 ? (
              files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>{file.original_name}</TableCell>
                  <TableCell>{file.comment || '-'}</TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>{formatDate(file.upload_date)}</TableCell>
                  <TableCell>{formatDate(file.last_download_date)}</TableCell>
                  <TableCell>
                    <Tooltip title="Скачать">
                      <IconButton 
                        onClick={() => handleDownload(file.id)}
                        disabled={downloadingId === file.id}
                      >
                        {downloadingId === file.id ? (
                          <CircularProgress size={24} />
                        ) : (
                          <Download />
                        )}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Просмотр в браузере">
                      <IconButton onClick={() => handlePreview(file.id)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Копировать ссылку">
                      <IconButton onClick={() => handleCopyLink(file)}>
                        <LinkIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Дополнительные действия">
                      <IconButton onClick={(e) => handleMenuOpen(e, file)}>
                        <MoreVert />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography>Нет загруженных файлов</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Меню дополнительных действий */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleEditDialogOpen(selectedFile, 0);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <DriveFileRenameOutline fontSize="small" />
          </ListItemIcon>
          <ListItemText>Переименовать файл</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          handleEditDialogOpen(selectedFile, 1);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать комментарий</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          handleCopyLink(selectedFile);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Копировать ссылку</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          handleDelete(selectedFile.id);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      {/* Диалог редактирования файла */}
      <Dialog open={Boolean(editingFile)} onClose={() => setEditingFile(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактирование файла</DialogTitle>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={dialogTab} onChange={handleDialogTabChange}>
            <Tab label="Переименовать" />
            <Tab label="Комментарий" />
          </Tabs>
        </Box>

        <DialogContent>
          {dialogTab === 0 && (
            <TextField
              autoFocus
              margin="dense"
              label="Имя файла"
              fullWidth
              variant="outlined"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
          
          {dialogTab === 1 && (
            <TextField
              autoFocus
              margin="dense"
              label="Комментарий"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setEditingFile(null)}>Отмена</Button>
          <Button 
            onClick={dialogTab === 0 ? handleRename : handleEditComment}
            variant="contained"
            disabled={dialogTab === 0 && !newFileName.trim()}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
};

export default FileList;