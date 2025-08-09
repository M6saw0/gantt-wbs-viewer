import { create } from 'zustand';
import { RuntimeSettings, AppConfig } from '../models/types';
import { loadRuntimeSettings, saveRuntimeSettings } from '../services/storage/runtimeSettings';

interface SettingsStore {
  config: AppConfig | null;
  settings: RuntimeSettings;
  
  initializeSettings: (config: AppConfig) => void;
  setSelectedProject: (projectId: string) => void;
  setZoom: (zoom: 'day' | 'week' | 'month') => void;
  toggleHolidays: () => void;
  toggleCriticalPath: () => void;
  toggleTodayLine: () => void;
  toggleGroup: (groupId: string) => void;
  expandAllGroups: () => void;
  collapseAllGroups: () => void;
}

const defaultSettings: RuntimeSettings = {
  selectedProjectId: undefined,
  zoom: 'day',
  showHolidays: true,
  showCriticalPath: true,
  showTodayLine: true,
  expandedGroups: new Set<string>()
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  config: null,
  settings: defaultSettings,
  
  initializeSettings: (config: AppConfig) => {
    const savedSettings = loadRuntimeSettings();
    
    const settings: RuntimeSettings = {
      ...defaultSettings,
      zoom: savedSettings.zoom || config.ui?.defaultZoom || 'day',
      showHolidays: savedSettings.showHolidays ?? config.ui?.showHolidays ?? true,
      showCriticalPath: savedSettings.showCriticalPath ?? config.ui?.showCriticalPath ?? true,
      showTodayLine: savedSettings.showTodayLine ?? true,
      selectedProjectId: savedSettings.selectedProjectId,
      expandedGroups: savedSettings.expandedGroups || new Set<string>()
    };
    
    set({ config, settings });
    saveRuntimeSettings(settings);
  },
  
  setSelectedProject: (projectId: string) => {
    set(state => {
      const newSettings = { ...state.settings, selectedProjectId: projectId };
      saveRuntimeSettings(newSettings);
      return { settings: newSettings };
    });
  },
  
  setZoom: (zoom: 'day' | 'week' | 'month') => {
    set(state => {
      const newSettings = { ...state.settings, zoom };
      saveRuntimeSettings(newSettings);
      return { settings: newSettings };
    });
  },
  
  toggleHolidays: () => {
    set(state => {
      const newSettings = { ...state.settings, showHolidays: !state.settings.showHolidays };
      saveRuntimeSettings(newSettings);
      return { settings: newSettings };
    });
  },
  
  toggleCriticalPath: () => {
    set(state => {
      const newSettings = { ...state.settings, showCriticalPath: !state.settings.showCriticalPath };
      saveRuntimeSettings(newSettings);
      return { settings: newSettings };
    });
  },
  
  toggleTodayLine: () => {
    set(state => {
      const newSettings = { ...state.settings, showTodayLine: !state.settings.showTodayLine };
      saveRuntimeSettings(newSettings);
      return { settings: newSettings };
    });
  },
  
  toggleGroup: (groupId: string) => {
    set(state => {
      const newGroups = new Set(state.settings.expandedGroups);
      if (newGroups.has(groupId)) {
        newGroups.delete(groupId);
      } else {
        newGroups.add(groupId);
      }
      const newSettings = { ...state.settings, expandedGroups: newGroups };
      saveRuntimeSettings(newSettings);
      return { settings: newSettings };
    });
  },
  
  expandAllGroups: () => {
    set(state => {
      // This will be populated with actual group IDs from data store
      const newSettings = { ...state.settings, expandedGroups: new Set<string>() };
      saveRuntimeSettings(newSettings);
      return { settings: newSettings };
    });
  },
  
  collapseAllGroups: () => {
    set(state => {
      const newSettings = { ...state.settings, expandedGroups: new Set<string>() };
      saveRuntimeSettings(newSettings);
      return { settings: newSettings };
    });
  }
}));
