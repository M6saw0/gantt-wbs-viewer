import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDataStore } from '../../store/dataStore';
import { useUiStore } from '../../store/uiStore';
import './WbsTree.css';
export const WbsTree = ({ scrollRef, onScroll }) => {
    const tasks = useDataStore(state => state.tasks);
    const { selectedTaskId, hoveredTaskId, selectTask, hoverTask, openTaskCard } = useUiStore();
    const handleRowClick = (taskId) => {
        selectTask(taskId);
        openTaskCard(taskId);
    };
    const handleRowHover = (taskId) => {
        hoverTask(taskId);
    };
    // Format classification display
    const formatClassification = (task) => {
        const parts = [];
        if (task.class1)
            parts.push(task.class1);
        if (task.class2)
            parts.push(task.class2);
        if (task.class3)
            parts.push(task.class3);
        return parts.length > 0 ? parts.join(' / ') : '-';
    };
    return (_jsxs("div", { className: "wbs-tree", children: [_jsxs("div", { className: "wbs-header", children: [_jsx("div", { className: "wbs-header-cell wbs-col-id", children: "ID" }), _jsx("div", { className: "wbs-header-cell wbs-col-class", children: "\u5206\u985E" }), _jsx("div", { className: "wbs-header-cell wbs-col-name", children: "\u30BF\u30B9\u30AF\u540D" }), _jsx("div", { className: "wbs-header-cell wbs-col-assignee", children: "\u62C5\u5F53" }), _jsx("div", { className: "wbs-header-cell wbs-col-progress", children: "\u9032\u6357" })] }), _jsx("div", { className: "wbs-body", ref: scrollRef, onScroll: onScroll, children: _jsx("div", { style: { height: `${tasks.length * 32}px`, position: 'relative' }, children: tasks.map((task, index) => (_jsxs("div", { className: `wbs-row ${task.taskId === selectedTaskId ? 'wbs-row-selected' : ''} ${task.taskId === hoveredTaskId ? 'wbs-row-hovered' : ''} ${task.isCritical ? 'wbs-row-critical' : ''}`, style: { top: `${index * 32}px` }, onClick: () => handleRowClick(task.taskId), onMouseEnter: () => handleRowHover(task.taskId), onMouseLeave: () => hoverTask(null), children: [_jsx("div", { className: "wbs-col-id", children: task.taskId }), _jsx("div", { className: "wbs-col-class", children: formatClassification(task) }), _jsxs("div", { className: "wbs-col-name", children: [task.isCritical && _jsx("span", { className: "wbs-critical-icon", children: "\u26A0" }), _jsx("span", { className: "wbs-task-name", children: task.name })] }), _jsx("div", { className: "wbs-col-assignee", children: task.assignedTo || '-' }), _jsx("div", { className: "wbs-col-progress", children: task.progress !== undefined ? (_jsxs("div", { className: "wbs-progress-bar", children: [_jsx("div", { className: "wbs-progress-fill", style: { width: `${task.progress}%` } }), _jsxs("span", { className: "wbs-progress-text", children: [task.progress, "%"] })] })) : ('-') }), _jsx("div", { className: "wbs-row-border" })] }, task.taskId))) }) })] }));
};
