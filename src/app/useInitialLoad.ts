import { useEffect, useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useDataStore } from '../store/dataStore';
import { useUiStore } from '../store/uiStore';
import { loadConfig } from '../services/config/loadConfig';
import { readWorkbook } from '../services/excel/readWorkbook';
import { readHolidays } from '../services/excel/readHolidays';
import { loadExcelProjects } from '../features/projects/loadExcelProjects';
import { parseTasks } from '../features/tasks/parseTasks';
import { validateTasks } from '../features/tasks/validateTasks';
import { buildGraph } from '../features/schedule/buildGraph';
import { computeCpm } from '../features/schedule/computeCpm';
import { deriveDisplayData } from '../features/schedule/deriveDisplayData';

export function useInitialLoad() {
  const { config, settings, initializeSettings } = useSettingsStore();
  const { 
    setProjects, 
    setTasks, 
    setHolidays, 
    setGraph,
    setCpmResult,
    setDisplayData,
    setErrors,
    setLoading,
    setLoadError,
    clearData
  } = useDataStore();
  const { showToast } = useUiStore();
  
  const loadData = useCallback(async (forceProjectId?: string) => {
    // Ensure forceProjectId is a string or undefined (not an event object)
    if (forceProjectId && typeof forceProjectId !== 'string') {
      console.warn('Invalid forceProjectId type, ignoring:', forceProjectId);
      forceProjectId = undefined;
    }
    
    try {
      setLoading(true);
      setLoadError(null);
      clearData();
      
      // Always use the current config (don't reload config on data refresh)
      let currentConfig = config;
      if (!currentConfig) {
        currentConfig = await loadConfig();
        initializeSettings(currentConfig);
      }
      
      // Load Excel workbook
      const workbook = await readWorkbook(currentConfig.excelPath);
      
      // Load holidays
      const holidays = readHolidays(workbook, currentConfig.holidaySheetNames);
      setHolidays(holidays);
      
      // Load projects
      const projects = loadExcelProjects(workbook, currentConfig.holidaySheetNames);
      setProjects(projects);
      
      if (projects.length === 0) {
        showToast({
          type: 'warning',
          message: 'プロジェクトシートが見つかりません'
        });
        setLoading(false);
        return;
      }
      
      // Select project
      let selectedProjectId = forceProjectId;
      
      // If no project is forced, use the current selection from settings
      if (!selectedProjectId) {
        // Get the latest settings state
        const currentSettings = useSettingsStore.getState().settings;
        
        if (currentSettings.selectedProjectId && projects.find(p => p.projectId === currentSettings.selectedProjectId)) {
          // Use the currently selected project
          selectedProjectId = currentSettings.selectedProjectId;
        } else {
          // Use the first project in sheet order
          selectedProjectId = projects[0].projectId;
          // Update the settings store with the selected project
          useSettingsStore.getState().setSelectedProject(selectedProjectId);
        }
      } else {
        // Update the settings store with the forced project
        useSettingsStore.getState().setSelectedProject(selectedProjectId);
      }
      
      // Load tasks for selected project
      const tasks = parseTasks(workbook, selectedProjectId);
      
      if (tasks.length === 0) {
        showToast({
          type: 'warning',
          message: 'タスクが見つかりません'
        });
        setTasks([]);
        setLoading(false);
        return;
      }
      
      // Validate tasks
      const errors = validateTasks(tasks);
      setErrors(errors);
      
      if (errors.length > 0) {
        for (const error of errors) {
          showToast({
            type: 'error',
            message: error.message,
            duration: 10000
          });
        }
        
        // Continue with valid tasks if possible
        if (errors.some(e => e.type === 'circular_dependency')) {
          setLoading(false);
          return;
        }
      }
      
      setTasks(tasks);
      
      // Build dependency graph
      const graph = buildGraph(tasks);
      setGraph(graph);
      
      // Compute CPM
      try {
        const cpmResult = computeCpm(graph);
        setCpmResult(cpmResult);
        
        // Derive display data
        const displayData = deriveDisplayData(
          cpmResult.tasks,
          graph.edges,
          settings.zoom,
          1200, // Default container width
          currentConfig.rangeBeforeDays || 7,
          currentConfig.rangeAfterDays || 45
        );
        setDisplayData(displayData);
        
        showToast({
          type: 'success',
          message: `プロジェクト「${selectedProjectId}」を読み込みました`
        });
        
        // Ensure the UI reflects the correct project
        console.log('Loaded project:', selectedProjectId);
      } catch (error) {
        showToast({
          type: 'error',
          message: 'スケジュール計算でエラーが発生しました'
        });
        console.error('CPM computation error:', error);
      }
      
    } catch (error) {
      const message = error instanceof Error ? error.message : '不明なエラーが発生しました';
      setLoadError(message);
      showToast({
        type: 'error',
        message,
        duration: 0
      });
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  }, [config]);
  
  // Initial load
  useEffect(() => {
    loadData();
  }, []);
  
  // Update display data when zoom changes
  useEffect(() => {
    const cpmResult = useDataStore.getState().cpmResult;
    const graph = useDataStore.getState().graph;
    const currentSettings = useSettingsStore.getState().settings;
    
    if (cpmResult && graph) {
      const displayData = deriveDisplayData(
        cpmResult.tasks,
        graph.edges,
        currentSettings.zoom,
        1200,
        config?.rangeBeforeDays || 7,
        config?.rangeAfterDays || 45
      );
      setDisplayData(displayData);
    }
  }, [settings.zoom, config]);
  
  return { reload: loadData };
}
