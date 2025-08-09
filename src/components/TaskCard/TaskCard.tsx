import React from 'react';
import { useDataStore } from '../../store/dataStore';
import { useUiStore } from '../../store/uiStore';
import { formatDate } from '../../utils/date';
import './TaskCard.css';

export const TaskCard: React.FC = () => {
  const { showTaskCard, taskCardId, closeTaskCard } = useUiStore();
  const getTaskById = useDataStore(state => state.getTaskById);
  const tasks = useDataStore(state => state.tasks);
  
  if (!showTaskCard || !taskCardId) return null;
  
  const task = getTaskById(taskCardId);
  if (!task) return null;
  
  // Resolve predecessor names
  const predecessors = task.predecessorIds.map(id => {
    const pred = tasks.find(t => t.taskId === id);
    return pred ? { id, name: pred.name } : { id, name: `ID: ${id}` };
  });
  
  return (
    <div className="task-card-overlay" onClick={closeTaskCard}>
      <div className="task-card" onClick={e => e.stopPropagation()}>
        <div className="task-card-header">
          <h2 className="task-card-title">
            {task.isCritical && <span className="task-card-critical-badge">クリティカル</span>}
            {task.name}
          </h2>
          <button className="task-card-close" onClick={closeTaskCard}>
            ✕
          </button>
        </div>
        
        <div className="task-card-body">
          <div className="task-card-section">
            <h3>基本情報</h3>
            <div className="task-card-field">
              <label>ID:</label>
              <span>{task.taskId}</span>
            </div>
            <div className="task-card-field">
              <label>タスク名:</label>
              <span>{task.name}</span>
            </div>
            {task.class1 && (
              <div className="task-card-field">
                <label>分類1:</label>
                <span>{task.class1}</span>
              </div>
            )}
            {task.class2 && (
              <div className="task-card-field">
                <label>分類2:</label>
                <span>{task.class2}</span>
              </div>
            )}
            {task.class3 && (
              <div className="task-card-field">
                <label>分類3:</label>
                <span>{task.class3}</span>
              </div>
            )}
          </div>
          
          <div className="task-card-section">
            <h3>日程</h3>
            {task.start && (
              <div className="task-card-field">
                <label>開始日:</label>
                <span>{formatDate(task.start)}</span>
              </div>
            )}
            {task.finish && (
              <div className="task-card-field">
                <label>終了日:</label>
                <span>{formatDate(task.finish)}</span>
              </div>
            )}
            {task.effortDays !== undefined && (
              <div className="task-card-field">
                <label>工数（人日）:</label>
                <span>{task.effortDays}</span>
              </div>
            )}
          </div>
          
          {predecessors.length > 0 && (
            <div className="task-card-section">
              <h3>前工程</h3>
              <ul className="task-card-list">
                {predecessors.map(pred => (
                  <li key={pred.id}>
                    {pred.name} (ID: {pred.id})
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="task-card-section">
            <h3>状態</h3>
            {task.assignedTo && (
              <div className="task-card-field">
                <label>担当:</label>
                <span>{task.assignedTo}</span>
              </div>
            )}
            {task.progress !== undefined && (
              <div className="task-card-field">
                <label>進捗:</label>
                <div className="task-card-progress">
                  <div className="task-card-progress-bar">
                    <div 
                      className="task-card-progress-fill"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="task-card-progress-text">{task.progress}%</span>
                </div>
              </div>
            )}
          </div>
          
          {(task.detail || task.note) && (
            <div className="task-card-section">
              <h3>説明</h3>
              {task.detail && (
                <div className="task-card-field">
                  <label>詳細:</label>
                  <p className="task-card-text">{task.detail}</p>
                </div>
              )}
              {task.note && (
                <div className="task-card-field">
                  <label>備考:</label>
                  <p className="task-card-text">{task.note}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
