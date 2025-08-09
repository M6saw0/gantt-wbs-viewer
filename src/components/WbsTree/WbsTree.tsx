import React from 'react';
import { useDataStore } from '../../store/dataStore';
import { useUiStore } from '../../store/uiStore';
import './WbsTree.css';

interface WbsTreeProps {
  scrollRef?: React.RefObject<HTMLDivElement>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const WbsTree: React.FC<WbsTreeProps> = ({ scrollRef, onScroll }) => {
  const tasks = useDataStore(state => state.tasks);
  const { selectedTaskId, hoveredTaskId, selectTask, hoverTask, openTaskCard } = useUiStore();
  
  const handleRowClick = (taskId: number) => {
    selectTask(taskId);
    openTaskCard(taskId);
  };
  
  const handleRowHover = (taskId: number) => {
    hoverTask(taskId);
  };
  
  // Format classification display
  const formatClassification = (task: any) => {
    const parts = [];
    if (task.class1) parts.push(task.class1);
    if (task.class2) parts.push(task.class2);
    if (task.class3) parts.push(task.class3);
    return parts.length > 0 ? parts.join(' / ') : '-';
  };
  
  return (
    <div className="wbs-tree">
      <div className="wbs-header">
        <div className="wbs-header-cell wbs-col-id">ID</div>
        <div className="wbs-header-cell wbs-col-class">分類</div>
        <div className="wbs-header-cell wbs-col-name">タスク名</div>
        <div className="wbs-header-cell wbs-col-assignee">担当</div>
        <div className="wbs-header-cell wbs-col-progress">進捗</div>
      </div>
      
      <div className="wbs-body" ref={scrollRef} onScroll={onScroll}>
        <div style={{ height: `${tasks.length * 32}px`, position: 'relative' }}>
          {tasks.map((task, index) => (
            <div
              key={task.taskId}
              className={`wbs-row ${
                task.taskId === selectedTaskId ? 'wbs-row-selected' : ''
              } ${
                task.taskId === hoveredTaskId ? 'wbs-row-hovered' : ''
              } ${
                task.isCritical ? 'wbs-row-critical' : ''
              }`}
              style={{ top: `${index * 32}px` }}
              onClick={() => handleRowClick(task.taskId)}
              onMouseEnter={() => handleRowHover(task.taskId)}
              onMouseLeave={() => hoverTask(null)}
            >
            <div className="wbs-col-id">{task.taskId}</div>
            <div className="wbs-col-class">{formatClassification(task)}</div>
            <div className="wbs-col-name">
              {task.isCritical && <span className="wbs-critical-icon">⚠</span>}
              <span className="wbs-task-name">{task.name}</span>
            </div>
            <div className="wbs-col-assignee">{task.assignedTo || '-'}</div>
            <div className="wbs-col-progress">
              {task.progress !== undefined ? (
                <div className="wbs-progress-bar">
                  <div 
                    className="wbs-progress-fill"
                    style={{ width: `${task.progress}%` }}
                  />
                  <span className="wbs-progress-text">{task.progress}%</span>
                </div>
              ) : (
                '-'
              )}
            </div>
            
            {/* Horizontal grid line */}
            <div className="wbs-row-border" />
          </div>
          ))}
        </div>
      </div>
    </div>
  );
};