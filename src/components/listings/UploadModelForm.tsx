import React, { useState } from 'react';
import { Form, Alert, Spinner } from 'react-bootstrap';
import { modelsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
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
  const [projectName, setProjectName] = useState('');
  const [designer, setDesigner] = useState('');
  const [revision, setRevision] = useState('');
  const [units, setUnits] = useState('meters');
  const [scaleFactor, setScaleFactor] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    console.log('Selected file:', selectedFile); // Debug log
    
    if (!selectedFile) {
      console.log('No file selected'); // Debug log
      setError('Please select a file');
      return;
    }

    const ext = selectedFile.name.split('.').pop()?.toLowerCase() ?? '';
    const validTypes = ['stl', 'obj', 'glb', 'gltf', 'step', 'stp'];

    if (!validTypes.includes(ext)) {
      setError('Unsupported file type. Allowed: STL, OBJ, GLB, GLTF, STEP, STP');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    console.log('File state set:', selectedFile.name); // Debug log
    
    if (!name) {
      setName(selectedFile.name.replace(/\.[^/.]+$/, "")); // Remove extension
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form with file:', "hello"); // Debug log
    // Enhanced validation
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    if (!user) {
      setError('User not authenticated');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a model name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name || file.name);
      formData.append('description', description);
      formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)));
      formData.append('project_name', projectName);
      formData.append('designer', designer);
      formData.append('revision', revision);
      formData.append('units', units);
      formData.append('scale_factor', scaleFactor.toString());
      formData.append('components', '[]'); // Empty components array for now

      const model = await modelsAPI.upload(formData);
      onUpload(model, file);
      
      // Reset form
      setFile(null);
      setName('');
      setDescription('');
      setTags('');
      setProjectName('');
      setDesigner('');
      setRevision('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const getButtonClass = (variant: 'primary' | 'secondary') =>
    `btn ${variant === 'primary' ? 'btn-primary text-white' : 'btn-secondary text-white'} rounded`;

  return (
    <Form onSubmit={handleSubmit} className="p-3 bg-light rounded">
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>3D Model File *</Form.Label>
        <Form.Control 
          type="file" 
          accept=".stl,.obj,.glb,.gltf,.step,.stp" 
          onChange={handleFileChange} 
          required
          disabled={loading}
        />
        {file && (
          <Form.Text className="text-success">
            Selected: {file.name}
          </Form.Text>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Model Name *</Form.Label>
        <Form.Control 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter model name"
          required
          disabled={loading}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3} 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Optional description"
          disabled={loading}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Tags</Form.Label>
        <Form.Control 
          type="text" 
          value={tags} 
          onChange={(e) => setTags(e.target.value)} 
          placeholder="Comma-separated tags: aerodynamics, vehicle, etc."
          disabled={loading}
        />
      </Form.Group>

      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Project Name</Form.Label>
            <Form.Control 
              type="text" 
              value={projectName} 
              onChange={(e) => setProjectName(e.target.value)} 
              disabled={loading}
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Designer</Form.Label>
            <Form.Control 
              type="text" 
              value={designer} 
              onChange={(e) => setDesigner(e.target.value)} 
              disabled={loading}
            />
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Revision</Form.Label>
            <Form.Control 
              type="text" 
              value={revision} 
              onChange={(e) => setRevision(e.target.value)} 
              disabled={loading}
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Units</Form.Label>
            <Form.Select 
              value={units} 
              onChange={(e) => setUnits(e.target.value)}
              disabled={loading}
            >
              <option value="meters">Meters</option>
              <option value="millimeters">Millimeters</option>
              <option value="inches">Inches</option>
              <option value="feet">Feet</option>
            </Form.Select>
          </Form.Group>
        </div>
      </div>

      <Form.Group className="mb-3">
        <Form.Label>Scale Factor</Form.Label>
        <Form.Control 
          type="number" 
          step="0.1"
          min="0.1"
          max="10"
          value={scaleFactor} 
          onChange={(e) => setScaleFactor(parseFloat(e.target.value))}
          disabled={loading}
        />
      </Form.Group>

      <div className="d-flex justify-content-between">
        <button 
          type="button" 
          className={getButtonClass('secondary')} 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className={getButtonClass('primary')}
          disabled={!file || loading}
          onClick={handleSubmit}
        >
          {loading ? <Spinner animation="border" size="sm" /> : 'Upload Model'}
        </button>
      </div>
    </Form>
  );
};

export default UploadModelForm;