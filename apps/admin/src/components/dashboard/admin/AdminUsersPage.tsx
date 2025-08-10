'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';

export function AdminUsersPage() {
  // Mock data - in production this would come from API
  const users = [
    { id: 1, name: 'John Smith', email: 'john@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'editor', status: 'active' },
    { id: 3, name: 'Mike Davis', email: 'mike@example.com', role: 'reviewer', status: 'pending' },
    { id: 4, name: 'Jennifer Lee', email: 'jennifer@example.com', role: 'translator', status: 'active' },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          component={Link}
          href="/dashboard/admin/users/invite"
        >
          Invite User
        </Button>
      </Box>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Users
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip label={user.role} size="small" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.status} 
                        size="small" 
                        color={user.status === 'active' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton size="small" aria-label={`Edit ${user.name}`}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" aria-label={`Delete ${user.name}`}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}