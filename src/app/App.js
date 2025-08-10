import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { WbsTree } from '../components/WbsTree/WbsTree';
import { GanttChart } from '../components/GanttChart/GanttChart';
import { TaskCard } from '../components/TaskCard/TaskCard';
import { Toaster } from '../components/Toast/Toaster';
import { useInitialLoad } from './useInitialLoad';
import { useDataStore } from '../store/dataStore';
import './App.css';
export const App = () => {
    const { reload, openFile } = useInitialLoad();
    const wbsScrollRef = useRef(null);
    const ganttScrollRef = useRef(null);
    const projects = useDataStore(state => state.projects);
    const isLoading = useDataStore(state => state.isLoading);
    // Sync vertical scroll between WBS and Gantt
    const handleWbsScroll = (e) => {
        if (ganttScrollRef.current && wbsScrollRef.current) {
            const scrollTop = e.target.scrollTop;
            // Only sync vertical scroll
            ganttScrollRef.current.scrollTop = scrollTop;
        }
    };
    const handleGanttScroll = (e) => {
        if (wbsScrollRef.current && ganttScrollRef.current) {
            const scrollTop = e.target.scrollTop;
            // Only sync vertical scroll
            wbsScrollRef.current.scrollTop = scrollTop;
        }
    };
    return (_jsxs("div", { className: "app", children: [_jsx(Toolbar, { onOpenFile: openFile, onSelectProject: (projectId) => { void reload(projectId); } }), _jsxs("div", { className: "app-main", children: [projects.length === 0 && !isLoading ? (_jsx("div", { className: "app-empty", children: "Excel\u30D5\u30A1\u30A4\u30EB\u3092\u8AAD\u307F\u8FBC\u3093\u3067\u3044\u307E\u305B\u3093\u3002\u4E0A\u90E8\u306E\u300C\u30D5\u30A1\u30A4\u30EB\u3092\u958B\u304F\u300D\u30DC\u30BF\u30F3\u304B\u3089\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002" })) : null, _jsx("div", { className: "app-panel app-panel-left", children: _jsx(WbsTree, { scrollRef: wbsScrollRef, onScroll: handleWbsScroll }) }), _jsx("div", { className: "app-splitter" }), _jsx("div", { className: "app-panel app-panel-right", children: _jsx(GanttChart, { scrollRef: ganttScrollRef, onScroll: handleGanttScroll }) })] }), _jsx(TaskCard, {}), _jsx(Toaster, {})] }));
};
