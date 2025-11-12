// utils/uploadPersistence.ts
import { saveAppState, getAppState } from './stateUtils';

export interface UploadSession {
  id: string;
  fileName: string;
  fileData: string; // Base64 encoded file data
  fileType: string;
  fileSize: number;
  formData: {
    name: string;
    description: string;
    tags: string;
    projectName: string;
    designer: string;
    revision: string;
    units: string;
    scaleFactor: number;
  };
  uploadProgress?: number;
  uploadedModel?: any;
  timestamp: number;
}

const UPLOAD_SESSION_KEY = 'uploadSession';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit for localStorage

// Convert File to base64 string for storage
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:type/subtype;base64, prefix
    };
    reader.onerror = error => reject(error);
  });
};

// Convert base64 string back to File
const base64ToFile = (base64: string, fileName: string, fileType: string): File => {
  try {
    console.log('🔄 Converting base64 to file:', {
      fileName,
      fileType,
      base64Length: base64.length
    });
    
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const file = new File([byteArray], fileName, { type: fileType });
    
    console.log('✅ File conversion successful:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    return file;
  } catch (error) {
    console.error('❌ Failed to convert base64 to file:', error);
    throw error;
  }
};

// Save upload session to localStorage
export const saveUploadSession = async (
  file: File,
  formData: UploadSession['formData'],
  uploadProgress?: number,
  uploadedModel?: any
): Promise<string> => {
  try {
    // Check file size limit
    if (file.size > MAX_FILE_SIZE) {
      console.warn('⚠️ File too large for persistence, skipping save');
      return '';
    }

    const sessionId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileData = await fileToBase64(file);
    
    const session: UploadSession = {
      id: sessionId,
      fileName: file.name,
      fileData,
      fileType: file.type,
      fileSize: file.size,
      formData,
      uploadProgress,
      uploadedModel,
      timestamp: Date.now()
    };

    localStorage.setItem(UPLOAD_SESSION_KEY, JSON.stringify(session));
    console.log('✅ Upload session saved:', {
      id: sessionId,
      fileName: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      progress: uploadProgress
    });

    // Also save to app state
    saveAppState({ uploadSession: session });
    
    return sessionId;
  } catch (error) {
    console.error('❌ Failed to save upload session:', error);
    return '';
  }
};

// Get saved upload session
export const getUploadSession = (): UploadSession | null => {
  try {
    const saved = localStorage.getItem(UPLOAD_SESSION_KEY);
    if (saved) {
      const session: UploadSession = JSON.parse(saved);
      
      // Check if session is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - session.timestamp > maxAge) {
        console.warn('⚠️ Upload session expired, clearing');
        clearUploadSession();
        return null;
      }
      
      console.log('✅ Upload session restored:', {
        id: session.id,
        fileName: session.fileName,
        size: `${(session.fileSize / 1024 / 1024).toFixed(2)}MB`,
        age: `${Math.round((Date.now() - session.timestamp) / 1000 / 60)}min ago`
      });
      
      return session;
    }
  } catch (error) {
    console.error('❌ Failed to restore upload session:', error);
    clearUploadSession();
  }
  return null;
};

// Restore File object from session
export const restoreFileFromSession = (session: UploadSession): File | null => {
  try {
    console.log('🔄 Restoring file from session:', {
      fileName: session.fileName,
      fileType: session.fileType,
      dataLength: session.fileData.length
    });
    
    const file = base64ToFile(session.fileData, session.fileName, session.fileType);
    console.log('✅ File restored successfully:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    return file;
  } catch (error) {
    console.error('❌ Failed to restore file from session:', error);
    return null;
  }
};

// Clear upload session
export const clearUploadSession = () => {
  try {
    localStorage.removeItem(UPLOAD_SESSION_KEY);
    console.log('✅ Upload session cleared');
    
    // Also clear from app state
    const appState = getAppState();
    if (appState.uploadSession) {
      delete appState.uploadSession;
      saveAppState(appState);
    }
  } catch (error) {
    console.error('❌ Failed to clear upload session:', error);
  }
};

// Update upload progress
export const updateUploadProgress = (progress: number) => {
  try {
    const session = getUploadSession();
    if (session) {
      session.uploadProgress = progress;
      localStorage.setItem(UPLOAD_SESSION_KEY, JSON.stringify(session));
      console.log(`📈 Upload progress: ${progress}%`);
    }
  } catch (error) {
    console.error('❌ Failed to update upload progress:', error);
  }
};

// Mark upload as completed
export const markUploadComplete = (uploadedModel: any) => {
  try {
    const session = getUploadSession();
    if (session) {
      session.uploadedModel = uploadedModel;
      session.uploadProgress = 100;
      localStorage.setItem(UPLOAD_SESSION_KEY, JSON.stringify(session));
      console.log('✅ Upload marked as complete:', uploadedModel);
    }
  } catch (error) {
    console.error('❌ Failed to mark upload complete:', error);
  }
};

// Check if there's an active upload session
export const hasActiveUploadSession = (): boolean => {
  const session = getUploadSession();
  return session !== null && (!session.uploadProgress || session.uploadProgress < 100);
};

// Get upload session info for display
export const getUploadSessionInfo = (): { fileName: string; progress: number; model?: any } | null => {
  const session = getUploadSession();
  if (session) {
    return {
      fileName: session.fileName,
      progress: session.uploadProgress || 0,
      model: session.uploadedModel
    };
  }
  return null;
};