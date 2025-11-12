import config from '~/config/constants';
import type { SimulationResponse } from '../types/geometry';

const API_BASE = `${config.apiUrl.replace(/\/$/, '')}/api/v1`;
console.log(API_BASE)
class SimulationAPI {
  async simulateFlow(
    file: File,
    velocity: number,
    direction_x: number,
    direction_y: number,
    direction_z: number,
    resolution: number
  ): Promise<SimulationResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('velocity', velocity.toString());
    formData.append('direction_x', direction_x.toString());
    formData.append('direction_y', direction_y.toString());
    formData.append('direction_z', direction_z.toString());
    formData.append('resolution', resolution.toString());

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/simulations/simulate-flow`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Simulation failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async quickDemo(
    geometryType: string,
    velocity: number,
    resolution: number
  ): Promise<SimulationResponse> {
    const formData = new FormData();
    formData.append('geometry_type', geometryType);
    formData.append('velocity', velocity.toString());
    formData.append('resolution', resolution.toString());

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/simulations/quick-demo`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Quick demo failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getSimulation(simulationId: string): Promise<any> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/simulations/simulation/${simulationId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch simulation' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

export const simulationAPI = new SimulationAPI();