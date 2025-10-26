import React, { useState } from 'react';
import { Form, Alert } from 'react-bootstrap';
import type { UploadedModel } from '../../types';

interface UploadModelFormProps {
  onUpload: (model: UploadedModel, file: File) => void;
  onCancel: () => void;
}

const UploadModelForm: React.FC<UploadModelFormProps> = ({ onUpload, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop()?.toLowerCase() ?? '';
    const validTypes = ['stl', 'obj', 'glb', 'gltf', 'step', 'stp'];

    if (!validTypes.includes(ext)) {
      setError('Unsupported file type. Allowed: STL, OBJ, GLB, GLTF, STEP, STP');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setName(selectedFile.name);
    setError('');

    // Immediately trigger upload
    const newModel: UploadedModel = {
      id: Date.now().toString(),
      name: selectedFile.name,
      fileName: selectedFile.name,
      uploadDate: new Date().toISOString(),
      fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
      type: ext,
      analysisStatus: 'pending',
      lastOpened: null,
      thumbnail: '',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      description,
      webLink: ''
    };

    onUpload(newModel, selectedFile);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Optional: keep the submit if you want metadata edits to apply
  };

  const getButtonClass = (variant: 'primary' | 'secondary') =>
    `btn ${variant === 'primary' ? 'btn-primary text-white' : 'btn-secondary text-white'} rounded`;

  return (
    <Form onSubmit={handleSubmit} className="p-3 bg-light rounded">
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>3D Model File</Form.Label>
        <Form.Control 
          type="file" 
          accept=".stl,.obj,.glb,.gltf,.step,.stp" 
          onChange={handleFileChange} 
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Optional, will use file name if empty"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3} 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Optional notes"
        />
      </Form.Group>

      <div className="d-flex justify-content-between">
        <button type="button" className={getButtonClass('secondary')} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={getButtonClass('primary')}>
          Save Metadata
        </button>
      </div>
    </Form>
  );
};

export default UploadModelForm;
