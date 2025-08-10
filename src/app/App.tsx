import React, { useRef } from 'react';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { WbsTree } from '../components/WbsTree/WbsTree';
import { GanttChart } from '../components/GanttChart/GanttChart';
import { TaskCard } from '../components/TaskCard/TaskCard';
import { Toaster } from '../components/Toast/Toaster';
import { useInitialLoad } from './useInitialLoad';
import { useDataStore } from '../store/dataStore';
import './App.css';

export const App: React.FC = () => {
  const { reload, openFile } = useInitialLoad();
  const wbsScrollRef = useRef<HTMLDivElement>(null);
  const ganttScrollRef = useRef<HTMLDivElement>(null);
  const projects = useDataStore(state => state.projects);
  const isLoading = useDataStore(state => state.isLoading);
  
  // Sync vertical scroll between WBS and Gantt
  const handleWbsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (ganttScrollRef.current && wbsScrollRef.current) {
      const scrollTop = (e.target as HTMLDivElement).scrollTop;
      // Only sync vertical scroll
      ganttScrollRef.current.scrollTop = scrollTop;
    }
  };
  
  const handleGanttScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (wbsScrollRef.current && ganttScrollRef.current) {
      const scrollTop = (e.target as HTMLDivElement).scrollTop;
      // Only sync vertical scroll
      wbsScrollRef.current.scrollTop = scrollTop;
    }
  };
  
  return (
    <div className="app">
      <Toolbar 
        onOpenFile={openFile}
        onSelectProject={(projectId) => { void reload(projectId); }}
      />
      
      <div className="app-main">
        {projects.length === 0 && !isLoading ? (
          <div className="app-empty">
            Excelファイルを読み込んでいません。上部の「ファイルを開く」ボタンからファイルを選択してください。
          </div>
        ) : null}
        <div className="app-panel app-panel-left">
          <WbsTree scrollRef={wbsScrollRef} onScroll={handleWbsScroll} />
        </div>
        
        <div className="app-splitter" />
        
        <div className="app-panel app-panel-right">
          <GanttChart scrollRef={ganttScrollRef} onScroll={handleGanttScroll} />
        </div>
      </div>
      
      <TaskCard />
      <Toaster />
    </div>
  );
};