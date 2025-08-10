import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useSettingsStore } from '../../store/settingsStore';
import './Toolbar.css';
export const Toolbar = ({ onOpenFile, onSelectProject }) => {
    const projects = useDataStore(state => state.projects);
    const isLoading = useDataStore(state => state.isLoading);
    const { settings, setSelectedProject, setZoom, toggleHolidays, toggleCriticalPath, toggleTodayLine } = useSettingsStore();
    const fileInputRef = useRef(null);
    const handleProjectChange = (e) => {
        const projectId = e.target.value;
        if (projectId) {
            setSelectedProject(projectId);
            // Force reload with the new project using current workbook
            onSelectProject(projectId);
        }
    };
    const handleZoomChange = (zoom) => {
        setZoom(zoom);
    };
    const handleOpenFileClick = () => {
        fileInputRef.current?.click();
    };
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onOpenFile(file);
            // Allow selecting the same file again later
            e.currentTarget.value = '';
        }
    };
    return (_jsxs("div", { className: "toolbar", children: [_jsxs("div", { className: "toolbar-section", children: [_jsxs("div", { className: "toolbar-item", children: [_jsx("input", { type: "file", ref: fileInputRef, style: { display: 'none' }, accept: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", onChange: handleFileChange, disabled: isLoading }), _jsx("button", { onClick: handleOpenFileClick, disabled: isLoading, className: "toolbar-button toolbar-button-primary", children: isLoading ? '読込中...' : 'ファイルを開く' })] }), _jsxs("div", { className: "toolbar-item", children: [_jsx("label", { htmlFor: "project-select", children: "\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8:" }), _jsx("select", { id: "project-select", value: settings.selectedProjectId || (projects.length > 0 && projects[0] ? projects[0].projectId : ''), onChange: handleProjectChange, disabled: isLoading, className: "toolbar-select", children: projects.map(project => (_jsx("option", { value: project.projectId, children: project.name }, project.projectId))) })] })] }), _jsxs("div", { className: "toolbar-section", children: [_jsxs("div", { className: "toolbar-item", children: [_jsx("label", { children: "\u30BA\u30FC\u30E0:" }), _jsxs("div", { className: "toolbar-button-group", children: [_jsx("button", { onClick: () => handleZoomChange('day'), className: `toolbar-button ${settings.zoom === 'day' ? 'toolbar-button-active' : ''}`, disabled: isLoading, children: "\u65E5" }), _jsx("button", { onClick: () => handleZoomChange('week'), className: `toolbar-button ${settings.zoom === 'week' ? 'toolbar-button-active' : ''}`, disabled: isLoading, children: "\u9031" }), _jsx("button", { onClick: () => handleZoomChange('month'), className: `toolbar-button ${settings.zoom === 'month' ? 'toolbar-button-active' : ''}`, disabled: isLoading, children: "\u6708" })] })] }), _jsx("div", { className: "toolbar-item", children: _jsx("button", { onClick: toggleHolidays, className: `toolbar-button toolbar-toggle ${settings.showHolidays ? 'toolbar-toggle-on' : ''}`, disabled: isLoading, children: "\u795D\u65E5" }) }), _jsx("div", { className: "toolbar-item", children: _jsx("button", { onClick: toggleCriticalPath, className: `toolbar-button toolbar-toggle ${settings.showCriticalPath ? 'toolbar-toggle-on' : ''}`, disabled: isLoading, children: "\u30AF\u30EA\u30C6\u30A3\u30AB\u30EB\u30D1\u30B9" }) }), _jsx("div", { className: "toolbar-item", children: _jsx("button", { onClick: toggleTodayLine, className: `toolbar-button toolbar-toggle ${settings.showTodayLine ? 'toolbar-toggle-on' : ''}`, disabled: isLoading, children: "\u4ECA\u65E5" }) })] })] }));
};
