import React from 'react';
import { useDataStore } from '../../store/dataStore';
import { useSettingsStore } from '../../store/settingsStore';
import './Toolbar.css';

interface ToolbarProps {
  onReload: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onReload }) => {
  const projects = useDataStore(state => state.projects);
  const isLoading = useDataStore(state => state.isLoading);
  const { settings, setSelectedProject, setZoom, toggleHolidays, toggleCriticalPath, toggleTodayLine } = useSettingsStore();
  
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    if (projectId) {
      setSelectedProject(projectId);
      // Force reload with the new project
      (onReload as any)(projectId);
    }
  };
  
  const handleZoomChange = (zoom: 'day' | 'week' | 'month') => {
    setZoom(zoom);
  };
  
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <div className="toolbar-item">
          <label htmlFor="project-select">プロジェクト:</label>
          <select
            id="project-select"
            value={settings.selectedProjectId || (projects.length > 0 ? projects[0].projectId : '')}
            onChange={handleProjectChange}
            disabled={isLoading}
            className="toolbar-select"
          >
            {projects.map(project => (
              <option key={project.projectId} value={project.projectId}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={() => onReload()}
          disabled={isLoading}
          className="toolbar-button toolbar-button-primary"
        >
          {isLoading ? '読込中...' : '再読込'}
        </button>
      </div>
      
      <div className="toolbar-section">
        <div className="toolbar-item">
          <label>ズーム:</label>
          <div className="toolbar-button-group">
            <button
              onClick={() => handleZoomChange('day')}
              className={`toolbar-button ${settings.zoom === 'day' ? 'toolbar-button-active' : ''}`}
              disabled={isLoading}
            >
              日
            </button>
            <button
              onClick={() => handleZoomChange('week')}
              className={`toolbar-button ${settings.zoom === 'week' ? 'toolbar-button-active' : ''}`}
              disabled={isLoading}
            >
              週
            </button>
            <button
              onClick={() => handleZoomChange('month')}
              className={`toolbar-button ${settings.zoom === 'month' ? 'toolbar-button-active' : ''}`}
              disabled={isLoading}
            >
              月
            </button>
          </div>
        </div>
        
        <div className="toolbar-item">
          <button
            onClick={toggleHolidays}
            className={`toolbar-button toolbar-toggle ${settings.showHolidays ? 'toolbar-toggle-on' : ''}`}
            disabled={isLoading}
          >
            祝日
          </button>
        </div>
        
        <div className="toolbar-item">
          <button
            onClick={toggleCriticalPath}
            className={`toolbar-button toolbar-toggle ${settings.showCriticalPath ? 'toolbar-toggle-on' : ''}`}
            disabled={isLoading}
          >
            クリティカルパス
          </button>
        </div>
        
        <div className="toolbar-item">
          <button
            onClick={toggleTodayLine}
            className={`toolbar-button toolbar-toggle ${settings.showTodayLine ? 'toolbar-toggle-on' : ''}`}
            disabled={isLoading}
          >
            今日
          </button>
        </div>
      </div>
    </div>
  );
};
