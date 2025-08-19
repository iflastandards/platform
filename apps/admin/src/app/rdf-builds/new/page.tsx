'use client';

import { useState } from 'react';
import { Create } from '@refinedev/mui';
import { useForm } from '@refinedev/react-hook-form';
import { useNavigation } from '@refinedev/core';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateRdfBuildSchema } from '@/../../packages/contracts/schemas/RdfBuild.zod';

/**
 * RDF Builds Create Page
 * Form for creating a new RDF build job
 */
export default function RdfBuildsCreatePage() {
  const { list } = useNavigation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const {
    refineCore: { onFinish, formLoading },
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateRdfBuildSchema),
    defaultValues: {
      namespaceId: '',
      vocabularyId: '',
      format: 'turtle',
      includeDeprecated: false,
      includeHistory: false,
      compression: false,
    },
  });

  const handleFormSubmit = (data: any) => {
    setFormData(data);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    if (formData) {
      await onFinish(formData);
      list('rdf-builds');
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setFormData(null);
  };

  return (
    <>
      <Create
        isLoading={formLoading}
        saveButtonProps={{
          onClick: handleSubmit(handleFormSubmit),
        }}
        title="Create RDF Build"
      >
        <Box
          component="form"
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            {...register('namespaceId')}
            label="Namespace ID"
            error={!!errors.namespaceId}
            helperText={errors.namespaceId?.message}
            required
            fullWidth
          />

          <TextField
            {...register('vocabularyId')}
            label="Vocabulary ID (Optional)"
            error={!!errors.vocabularyId}
            helperText={errors.vocabularyId?.message}
            fullWidth
          />

          <FormControl fullWidth error={!!errors.format}>
            <InputLabel>Format</InputLabel>
            <Select
              {...register('format')}
              defaultValue="turtle"
              label="Format"
            >
              <MenuItem value="turtle">Turtle</MenuItem>
              <MenuItem value="jsonld">JSON-LD</MenuItem>
              <MenuItem value="ntriples">N-Triples</MenuItem>
              <MenuItem value="rdfxml">RDF/XML</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                {...register('includeDeprecated')}
                defaultChecked={false}
              />
            }
            label="Include Deprecated Terms"
          />

          <FormControlLabel
            control={
              <Checkbox
                {...register('includeHistory')}
                defaultChecked={false}
              />
            }
            label="Include History"
          />

          <FormControlLabel
            control={
              <Checkbox {...register('compression')} defaultChecked={false} />
            }
            label="Enable Compression"
          />

          {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
        </Box>
      </Create>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={handleCancel}>
        <DialogTitle>Confirm RDF Build</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to create this RDF build job?
          </DialogContentText>
          {formData && (
            <Box sx={{ mt: 2 }}>
              <strong>Configuration:</strong>
              <ul>
                <li>Namespace: {formData.namespaceId}</li>
                {formData.vocabularyId && (
                  <li>Vocabulary: {formData.vocabularyId}</li>
                )}
                <li>Format: {formData.format}</li>
                <li>
                  Include Deprecated:{' '}
                  {formData.includeDeprecated ? 'Yes' : 'No'}
                </li>
                <li>
                  Include History: {formData.includeHistory ? 'Yes' : 'No'}
                </li>
                <li>Compression: {formData.compression ? 'Yes' : 'No'}</li>
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
