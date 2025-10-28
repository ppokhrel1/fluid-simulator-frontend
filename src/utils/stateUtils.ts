// utils/stateUtils.ts
export interface AppState {
  lastRoute?: string;
  modelData?: any;
  uploadProgress?: any;
  tempData?: any;
  uploadSession?: any;
}

const STATE_KEY = 'fluidSimulatorState';

export const saveAppState = (state: Partial<AppState>) => {
  try {
    const existingState = getAppState();
    const newState = { ...existingState, ...state };
    localStorage.setItem(STATE_KEY, JSON.stringify(newState));
    console.log('✅ App state saved:', newState);
  } catch (error) {
    console.error('❌ Failed to save app state:', error);
  }
};

export const getAppState = (): AppState => {
  try {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      console.log('✅ App state restored:', state);
      return state;
    }
  } catch (error) {
    console.error('❌ Failed to restore app state:', error);
  }
  return {};
};

export const clearAppState = () => {
  try {
    localStorage.removeItem(STATE_KEY);
    console.log('✅ App state cleared');
  } catch (error) {
    console.error('❌ Failed to clear app state:', error);
  }
};

// Auto-save current route
export const saveCurrentRoute = (path: string) => {
  saveAppState({ lastRoute: path });
};

// Get last route (for redirect after refresh)
export const getLastRoute = (): string => {
  const state = getAppState();
  return state.lastRoute || '/';
};