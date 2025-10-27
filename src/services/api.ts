// services/api.ts
import axios from 'axios';
import config from '~/config/constants';

// Use environment variables with REACT_APP_ prefix
const API_BASE_URL = config.apiUrl;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const modelsAPI = {
  // Upload model
  upload: async (formData: FormData) => {
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get all models
  getAll: async (limit: number = 100, offset: number = 0) => {
    const response = await api.get(`/models/?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  // Get single model
  get: async (modelId: number) => {
    const response = await api.get(`/models/${modelId}`);
    return response.data;
  },

  // Download model file
  download: async (modelId: number) => {
    const response = await api.get(`/models/${modelId}/download`, {
      responseType: 'blob',
    });
    return response;
  },

  // Update model status (admin only)
  updateStatus: async (modelId: number, status: string) => {
    const response = await api.put(`/models/${modelId}/status`, { status });
    return response.data;
  },

  // Delete model (admin only)
  delete: async (modelId: number) => {
    const response = await api.delete(`/models/${modelId}`);
    return response.data;
  },
};

export const componentsAPI = {
  create: async (modelId: number, component: any) => {
    const response = await api.post(`/models/${modelId}/components`, component);
    return response.data;
  },

  getByModel: async (modelId: number) => {
    const response = await api.get(`/models/${modelId}/components`);
    return response.data;
  },

  update: async (componentId: number, updateData: any) => {
    const response = await api.put(`/components/${componentId}`, updateData);
    return response.data;
  },
};

export const analysisAPI = {
  create: async (result: any) => {
    const response = await api.post('/analysis/results', result);
    return response.data;
  },

  getByComponent: async (componentId: number) => {
    const response = await api.get(`/components/${componentId}/analysis`);
    return response.data;
  },
};

// ====== ENHANCED BACKEND INTEGRATION ======
// Commerce System API (NOW AVAILABLE!)
export const commerceAPI = {
  designs: {
    getAll: async (category?: string, limit: number = 100, offset: number = 0) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(category && { category })
      });
      const response = await api.get(`/commerce/designs?${params}`);
      return response.data;
    },
    
    // ✅ FRONTEND FORM COMPATIBLE - Use this endpoint for SellDesignModal
    sellDesign: async (formData: any) => {
      const response = await api.post('/commerce/designs/sell', {
        designName: formData.designName,        // ✅ Frontend field name
        description: formData.description,
        price: formData.price,                  // ✅ String OK - auto-converts
        category: formData.category,
        fileOrigin: formData.fileOrigin,
        licenseType: formData.licenseType,
        originDeclaration: formData.originDeclaration,
        qualityAssurance: formData.qualityAssurance,
        technicalSpecs: formData.technicalSpecs || '',
        tags: formData.tags || '',
        instructions: formData.instructions || ''
      });
      return response.data;
    },
    
    // Direct API endpoint (for programmatic creation)
    create: async (designData: any) => {
      const response = await api.post('/commerce/designs', designData);
      return response.data;
    },
    
    get: async (designId: string) => {
      const response = await api.get(`/commerce/designs/${designId}`);
      return response.data;
    },
    
    update: async (designId: string, updates: any) => {
      const response = await api.put(`/commerce/designs/${designId}`, updates);
      return response.data;
    },
    
    like: async (designId: string) => {
      const response = await api.post(`/commerce/designs/${designId}/like`);
      return response.data;
    }
  },
  
  cart: {
    get: async () => {
      const response = await api.get('/commerce/cart');
      return response.data;
    },
    
    add: async (cartItem: any) => {
      const response = await api.post('/commerce/cart', {
        design_id: cartItem.designId,
        name: cartItem.name,
        price: cartItem.price,           // Number required
        original_price: cartItem.originalPrice || null,
        size: cartItem.size,
        color: cartItem.color,
        icon: cartItem.icon,
        quantity: cartItem.quantity || 1
      });
      return response.data;
    },
    
    update: async (cartItemId: string, updates: any) => {
      const response = await api.put(`/commerce/cart/${cartItemId}`, updates);
      return response.data;
    },
    
    remove: async (cartItemId: string) => {
      const response = await api.delete(`/commerce/cart/${cartItemId}`);
      return response.data;
    },
    
    clear: async () => {
      const response = await api.delete('/commerce/cart');
      return response.data;
    }
  },
  
  sales: {
    checkout: async () => {
      const response = await api.post('/commerce/checkout');
      return response.data;
    },
    
    getPurchases: async () => {
      const response = await api.get('/commerce/sales/purchases');
      return response.data;
    },
    
    getSellerSales: async () => {
      const response = await api.get('/commerce/sales/seller');
      return response.data;
    }
  },
  
  payouts: {
    get: async () => {
      const response = await api.get('/commerce/payouts');
      return response.data;
    },
    
    request: async (payoutData: any) => {
      const response = await api.post('/commerce/payouts', {
        amount: payoutData.amount,
        method: payoutData.method,        // paypal|stripe|bank_transfer
        fees: payoutData.fees || 0.00,
        net_amount: payoutData.netAmount,
        payout_account: payoutData.payoutAccount || null
      });
      return response.data;
    }
  }
};

// AI Chatbot System API (NOW AVAILABLE!)
export const chatAPI = {
  sessions: {
    getAll: async () => {
      const response = await api.get('/chat/sessions');
      return response.data;
    },
    
    create: async (modelId?: number) => {
      const response = await api.post('/chat/sessions', {
        model_id: modelId || null
      });
      return response.data;
    },
    
    get: async (sessionId: string) => {
      const response = await api.get(`/chat/sessions/${sessionId}`);
      return response.data;
    },
    
    update: async (sessionId: string, updates: any) => {
      const response = await api.put(`/chat/sessions/${sessionId}`, updates);
      return response.data;
    },
    
    delete: async (sessionId: string) => {
      const response = await api.delete(`/chat/sessions/${sessionId}`);
      return response.data;
    }
  },
  
  messages: {
    get: async (sessionId: string, limit: number = 50, offset: number = 0) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      const response = await api.get(`/chat/sessions/${sessionId}/messages?${params}`);
      return response.data;
    },
    
    send: async (sessionId: string, message: string, messageType: string = 'text') => {
      const response = await api.post(`/chat/sessions/${sessionId}/messages`, {
        message: message,
        message_type: messageType
      });
      return response.data;
    }
  }
};

// 3D Labeling System API (NOW AVAILABLE!)
export const labelsAPI = {
  getForModel: async (modelId: number) => {
    const response = await api.get(`/labels/models/${modelId}/labels`);
    return response.data;
  },
  
  create: async (modelId: number, labelData: any) => {
    const response = await api.post(`/labels/models/${modelId}/labels`, {
      position_x: labelData.position[0],
      position_y: labelData.position[1],
      position_z: labelData.position[2],
      text: labelData.text,
      category: labelData.category
    });
    return response.data;
  },
  
  get: async (labelId: string) => {
    const response = await api.get(`/labels/labels/${labelId}`);
    return response.data;
  },
  
  update: async (labelId: string, updates: any) => {
    const response = await api.put(`/labels/labels/${labelId}`, updates);
    return response.data;
  },
  
  delete: async (labelId: string) => {
    const response = await api.delete(`/labels/labels/${labelId}`);
    return response.data;
  },
  
  getByUser: async (userId: number) => {
    const response = await api.get(`/labels/labels/user/${userId}`);
    return response.data;
  },
  
  getByCategory: async (category: string) => {
    const response = await api.get(`/labels/labels/category/${category}`);
    return response.data;
  },
  
  getAISuggestions: async (modelId: number) => {
    const response = await api.post(`/labels/models/${modelId}/ai-suggestions`);
    return response.data;
  }
};

export default api;