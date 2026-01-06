'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  InputAdornment,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import api from '@/lib/api';

interface Skill {
  _id: string;
  name: string;
  category: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchSkills();
  }, [page]);

  const fetchSkills = async () => {
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '10',
      };
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get('/admin/skills', { params });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch skills');
      }

      setSkills(response.data?.skills || []);
      setTotalPages(response.data?.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
      setError('Failed to load skills');
    }
  };

  const handleOpenDialog = (skill?: Skill) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData({
        name: skill.name,
        category: skill.category,
        description: skill.description || '',
        isActive: skill.isActive,
      });
    } else {
      setEditingSkill(null);
      setFormData({
        name: '',
        category: '',
        description: '',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSkill(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.category.trim()) {
      setError('Name and category are required');
      return;
    }

    try {
      const url = editingSkill ? `/admin/skills/${editingSkill._id}` : '/admin/skills';
      const method = editingSkill ? 'put' : 'post';

      const response = await api[method](url, formData);

      if (response.success) {
        setSuccess(editingSkill ? 'Skill updated successfully' : 'Skill created successfully');
        handleCloseDialog();
        setPage(1);
        fetchSkills();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to save skill');
      }
    } catch (err) {
      console.error('Failed to save skill:', err);
      setError('Failed to save skill');
    }
  };

  const handleDelete = async (skillId: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) {
      return;
    }

    try {
      const response = await api.delete(`/admin/skills/${skillId}`);

      if (response.success) {
        setSuccess('Skill deleted successfully');
        setPage(1);
        fetchSkills();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to delete skill');
      }
    } catch (err) {
      console.error('Failed to delete skill:', err);
      setError('Failed to delete skill');
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Skills Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Skill
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Skills Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {skills.map((skill) => (
              <TableRow key={skill._id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="500">
                    {skill.name}
                  </Typography>
                </TableCell>
                <TableCell>{skill.category}</TableCell>
                <TableCell>
                  {skill.description ? (
                    <Typography variant="body2" color="text.secondary" sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {skill.description}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No description
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={skill.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    color={skill.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(skill)}
                    title="Edit"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(skill._id)}
                    title="Delete"
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSkill ? 'Edit Skill' : 'Add New Skill'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Skill Name"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Category"
            fullWidth
            required
            placeholder="e.g., Frontend, Backend, DevOps"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            placeholder="Optional description of the skill"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSkill ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
