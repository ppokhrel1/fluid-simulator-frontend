import config from '~/config/constants';
import type { UploadResponse } from '../types/geometry';

const API_BASE = config.apiUrl + 'api/v1/geometry';

class GeometryAPI {
  async uploadGeometry(file: File, name: string, description: string = ''): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('description', description);

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/upload-geometry`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Note: Your backend doesn't have these endpoints yet, but keeping for future
  async getGeometry(geometryId: string): Promise<any> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/geometry/${geometryId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch geometry' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async deleteGeometry(geometryId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/geometry/${geometryId}`, {
      method: 'DELETE',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Delete failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
  }
}

export const geometryAPI = new GeometryAPI();