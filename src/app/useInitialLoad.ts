import { useEffect, useCallback, useRef } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useDataStore } from '../store/dataStore';
import { useUiStore } from '../store/uiStore';
import { loadConfig } from '../services/config/loadConfig';
import { readWorkbook, readWorkbookFromFile } from '../services/excel/readWorkbook';
import { readHolidays } from '../services/excel/readHolidays';
import { loadExcelProjects } from '../features/projects/loadExcelProjects';
import { parseTasks } from '../features/tasks/parseTasks';
import { validateTasks } from '../features/tasks/validateTasks';
import { buildGraph } from '../features/schedule/buildGraph';
import { computeCpm } from '../features/schedule/computeCpm';
import { deriveDisplayData } from '../features/schedule/deriveDisplayData';
import * as XLSX from 'xlsx';

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
  const workbookRef = useRef<XLSX.WorkBook | null>(null);
  
  const loadFromWorkbook = useCallback(async (workbook: XLSX.WorkBook, forceProjectId?: string) => {
    try {
      setLoading(true);
      setLoadError(null);
      clearData();
      
      // Keep the workbook for future operations (e.g., project switch)
      workbookRef.current = workbook;
      
      // Ensure config exists for auxiliary settings
      let currentConfigLocal = config;
      if (!currentConfigLocal) {
        currentConfigLocal = await loadConfig();
        initializeSettings(currentConfigLocal);
      }
      
      // Load holidays
      const holidays = readHolidays(workbook, currentConfigLocal.holidaySheetNames);
      setHolidays(holidays);
      
      // Load projects
      const projects = loadExcelProjects(workbook, currentConfigLocal.holidaySheetNames);
      setProjects(projects);
      
      if (projects.length === 0) {
        showToast({ type: 'warning', message: 'プロジェクトシートが見つかりません' });
        setLoading(false);
        return;
      }
      
      // Select project
      let selectedProjectId = forceProjectId;
      if (!selectedProjectId) {
        const currentSettings = useSettingsStore.getState().settings;
        if (currentSettings.selectedProjectId && projects.find(p => p.projectId === currentSettings.selectedProjectId)) {
          selectedProjectId = currentSettings.selectedProjectId;
        } else {
          const firstProject = projects[0];
          if (!firstProject) {
            showToast({ type: 'warning', message: 'プロジェクトシートが見つかりません' });
            setLoading(false);
            return;
          }
          selectedProjectId = firstProject.projectId;
          useSettingsStore.getState().setSelectedProject(selectedProjectId);
        }
      } else {
        useSettingsStore.getState().setSelectedProject(selectedProjectId);
      }
      
      // Load tasks for selected project
      const tasks = parseTasks(workbook, selectedProjectId);
      if (tasks.length === 0) {
        showToast({ type: 'warning', message: 'タスクが見つかりません' });
        setTasks([]);
        setLoading(false);
        return;
      }
      
      // Validate tasks
      const errors = validateTasks(tasks);
      setErrors(errors);
      if (errors.length > 0) {
        for (const error of errors) {
          showToast({ type: 'error', message: error.message, duration: 10000 });
        }
        if (errors.some(e => e.type === 'circular_dependency')) {
          setLoading(false);
          return;
        }
      }
      
      setTasks(tasks);
      
      // Build dependency graph
      const graph = buildGraph(tasks);
      setGraph(graph);
      
      // Compute CPM and derive display data
      try {
        const cpmResult = computeCpm(graph);
        setCpmResult(cpmResult);
        const displayData = deriveDisplayData(
          cpmResult.tasks,
          graph.edges,
          settings.zoom,
          1200,
          (currentConfigLocal?.rangeBeforeDays) || 7,
          (currentConfigLocal?.rangeAfterDays) || 45
        );
        setDisplayData(displayData);
        showToast({ type: 'success', message: `プロジェクト「${selectedProjectId}」を読み込みました` });
      } catch (error) {
        showToast({ type: 'error', message: 'スケジュール計算でエラーが発生しました' });
        console.error('CPM computation error:', error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '不明なエラーが発生しました';
      setLoadError(message);
      showToast({ type: 'error', message, duration: 0 });
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  }, [config, settings.zoom]);
  
  const loadData = useCallback(async (forceProjectId?: string) => {
    // Ensure forceProjectId is a string or undefined (not an event object)
    if (forceProjectId && typeof forceProjectId !== 'string') {
      console.warn('Invalid forceProjectId type, ignoring:', forceProjectId);
      forceProjectId = undefined;
    }
    
    try {
      // If a workbook is already in memory, reuse it; otherwise load from config path
      if (workbookRef.current) {
        await loadFromWorkbook(workbookRef.current, forceProjectId);
      } else {
        // Ensure config exists and load default path
        let currentConfig = config;
        if (!currentConfig) {
          currentConfig = await loadConfig();
          initializeSettings(currentConfig);
        }
        if (!currentConfig.excelPath) {
          showToast({ type: 'info', message: 'Excelファイルが未設定です。上部の「ファイルを開く」から選択してください。' });
          setLoading(false);
          return;
        }
        const workbook = await readWorkbook(currentConfig.excelPath);
        await loadFromWorkbook(workbook, forceProjectId);
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
    }
  }, [config, loadFromWorkbook]);
  
  const openFile = useCallback(async (file: File) => {
    try {
      const workbook = await readWorkbookFromFile(file);
      await loadFromWorkbook(workbook);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ファイルの読み込みに失敗しました';
      setLoadError(message);
      showToast({ type: 'error', message, duration: 0 });
    }
  }, [loadFromWorkbook]);
  
  // Initial load: if config has excelPath, auto-load; otherwise wait for file selection
  useEffect(() => {
    (async () => {
      let currentConfig = config;
      if (!currentConfig) {
        currentConfig = await loadConfig();
        initializeSettings(currentConfig);
      }
      if (currentConfig.excelPath) {
        await loadData();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  
  return { reload: loadData, openFile };
}
