import React, { useState } from 'react';
import { Form, Alert } from 'react-bootstrap';
import type { UploadedModel } from '../../types';

interface UploadModelFormProps {
  onUpload: (model: UploadedModel, file: File) => void; // Add file parameter
  onCancel: () => void;
}

const UploadModelForm: React.FC<UploadModelFormProps> = ({ onUpload, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [webLink, setWebLink] = useState('');
  const [tags, setTags] = useState('');
  const [thumbnail, setThumbnail] = useState('');
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a valid file.');
      return;
    }

    const newModel: UploadedModel = {
      id: Date.now().toString(),
      name: name || file.name,
      fileName: file.name,
      uploadDate: new Date().toISOString(),
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
      analysisStatus: 'pending',
      lastOpened: null,
      thumbnail,
      tags: tags.split(',').map(t => t.trim()).filter((t): t is string => t.length > 0),
      description,
      webLink
    };

    // Pass both the model metadata AND the actual file
    onUpload(newModel, file);

    // Reset form
    setFile(null);
    setName('');
    setDescription('');
    setWebLink('');
    setTags('');
    setThumbnail('');
    setError('');
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
          placeholder="Add any description or notes"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Web Link</Form.Label>
        <Form.Control 
          type="url" 
          value={webLink} 
          onChange={(e) => setWebLink(e.target.value)} 
          placeholder="Optional: link to external resource"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Tags</Form.Label>
        <Form.Control 
          type="text" 
          value={tags} 
          onChange={(e) => setTags(e.target.value)} 
          placeholder="Comma-separated tags (e.g., aerospace, wing)"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Thumbnail URL</Form.Label>
        <Form.Control 
          type="url" 
          value={thumbnail} 
          onChange={(e) => setThumbnail(e.target.value)} 
          placeholder="Optional: thumbnail image URL"
        />
      </Form.Group>

      <div className="d-flex justify-content-between">
        <button type="button" className={getButtonClass('secondary')} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={getButtonClass('primary')}>
          Upload Model
        </button>
      </div>
    </Form>
  );
};

export default UploadModelForm;