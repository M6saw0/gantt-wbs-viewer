import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useUiStore } from '../../store/uiStore';
import { formatDate, isWeekend, isHoliday, getToday, addDays } from '../../utils/date';
import './GanttChart.css';

interface GanttChartProps {
  scrollRef?: React.RefObject<HTMLDivElement>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({ scrollRef, onScroll }) => {
  const displayData = useDataStore(state => state.displayData);
  const holidays = useDataStore(state => state.holidays);
  const graph = useDataStore(state => state.graph);
  const tasks = useDataStore(state => state.tasks);
  const { settings } = useSettingsStore();
  const { hoveredTaskId, selectedTaskId, hoverTask, openTaskCard } = useUiStore();
  
  const svgRef = useRef<SVGSVGElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 600 });
  const [isInitialScrollSet, setIsInitialScrollSet] = useState(false);
  
  // Calculate which tasks and edges should be highlighted
  const highlightedElements = useMemo(() => {
    const highlightedTasks = new Set<number>();
    const highlightedEdges = new Set<string>();
    
    if (hoveredTaskId && graph) {
      // Add the hovered task
      highlightedTasks.add(hoveredTaskId);
      
      // Find and add all predecessors
      const task = tasks.find(t => t.taskId === hoveredTaskId);
      if (task) {
        const addPredecessors = (taskId: number) => {
          const currentTask = tasks.find(t => t.taskId === taskId);
          if (currentTask) {
            for (const predId of currentTask.predecessorIds) {
              highlightedTasks.add(predId);
              highlightedEdges.add(`${predId}-${taskId}`);
              // Recursively add predecessors of predecessors
              addPredecessors(predId);
            }
          }
        };
        addPredecessors(hoveredTaskId);
      }
    }
    
    return { tasks: highlightedTasks, edges: highlightedEdges };
  }, [hoveredTaskId, graph, tasks]);
  
  useEffect(() => {
    const handleResize = () => {
      if (scrollRef?.current) {
        const rect = scrollRef.current.getBoundingClientRect();
        setViewBox(prev => ({ ...prev, width: rect.width, height: rect.height }));
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scrollRef]);
  
  // Set initial scroll position to today - 7 days
  useEffect(() => {
    if (displayData && scrollRef?.current && !isInitialScrollSet) {
      const today = getToday();
      const targetDate = addDays(today, -7);
      const scrollX = displayData.timeScale.getX(targetDate);
      
      // Set horizontal scroll position
      scrollRef.current.scrollLeft = Math.max(0, scrollX);
      setIsInitialScrollSet(true);
    }
  }, [displayData, scrollRef, isInitialScrollSet]);
  
  // Reset initial scroll flag when display data changes (e.g., project switch)
  useEffect(() => {
    setIsInitialScrollSet(false);
  }, [displayData]);
  
  if (!displayData) {
    return <div className="gantt-chart gantt-empty">データがありません</div>;
  }
  
  const { timeScale, bars, rowHeight, headerHeight } = displayData;
  const totalHeight = tasks.length * rowHeight;
  
  // Render horizontal grid lines for rows
  const renderRowGridLines = () => {
    const lines: JSX.Element[] = [];
    
    for (let i = 0; i <= tasks.length; i++) {
      const y = i * rowHeight;
      lines.push(
        <line
          key={`row-grid-${i}`}
          x1={0}
          y1={y}
          x2={timeScale.width}
          y2={y}
          className="gantt-row-grid-line"
        />
      );
    }
    
    return lines;
  };
  
  // Render vertical grid lines
  const renderVerticalGridLines = () => {
    const elements: JSX.Element[] = [];
    const { startDate, endDate, scale } = timeScale;
    
    let currentDate = new Date(startDate);
    let x = 0;
    
    while (currentDate <= endDate) {
      const nextDate = scale === 'month' 
        ? new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
        : addDays(currentDate, scale === 'week' ? 7 : 1);
      
      const nextX = timeScale.getX(nextDate);
      
      // Grid line
      elements.push(
        <line
          key={`vgrid-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={totalHeight}
          className="gantt-grid-line"
        />
      );
      
      currentDate = nextDate;
      x = nextX;
    }
    
    return elements;
  };
  
  // Render time axis
  const renderTimeAxis = () => {
    const elements: JSX.Element[] = [];
    const { startDate, endDate, scale } = timeScale;
    
    let currentDate = new Date(startDate);
    let x = 0;
    
    while (currentDate <= endDate) {
      const nextDate = scale === 'month' 
        ? new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
        : addDays(currentDate, scale === 'week' ? 7 : 1);
      
      const nextX = timeScale.getX(nextDate);
      const width = nextX - x;
      
      // Time label
      const label = scale === 'month'
        ? formatDate(currentDate, 'YYYY/M')
        : scale === 'week'
        ? formatDate(currentDate, 'M/D')
        : formatDate(currentDate, 'M/D');
      
      elements.push(
        <text
          key={`label-${x}`}
          x={x + width / 2}
          y={headerHeight / 2}
          className="gantt-time-label"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {label}
        </text>
      );
      
      currentDate = nextDate;
      x = nextX;
    }
    
    return elements;
  };
  
  // Render weekend and holiday bands
  const renderCalendarBands = () => {
    if (!settings.showHolidays) return null;
    
    const elements: JSX.Element[] = [];
    const { startDate, endDate } = timeScale;
    const holidayDates = holidays.map(h => h.date);
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const x = timeScale.getX(currentDate);
      const nextDate = addDays(currentDate, 1);
      const width = timeScale.getX(nextDate) - x;
      
      if (isWeekend(currentDate)) {
        elements.push(
          <rect
            key={`weekend-${x}`}
            x={x}
            y={0}
            width={width}
            height={totalHeight}
            className="gantt-weekend-band"
          />
        );
      } else if (isHoliday(currentDate, holidayDates)) {
        elements.push(
          <rect
            key={`holiday-${x}`}
            x={x}
            y={0}
            width={width}
            height={totalHeight}
            className="gantt-holiday-band"
          />
        );
      }
      
      currentDate = nextDate;
    }
    
    return <g className="gantt-calendar-bands">{elements}</g>;
  };
  
  // Render today line
  const renderTodayLine = () => {
    if (!settings.showTodayLine) return null;
    
    const today = getToday();
    // Position at the middle of the day
    const x = timeScale.getX(today) + (timeScale.getX(addDays(today, 1)) - timeScale.getX(today)) / 2;
    
    if (x < 0 || x > timeScale.width) return null;
    
    return (
      <line
        x1={x}
        y1={0}
        x2={x}
        y2={totalHeight}
        className="gantt-today-line"
      />
    );
  };
  
  // Render task bars
  const renderBars = () => {
    return bars.map(bar => {
      const task = tasks.find(t => t.taskId === bar.taskId);
      if (!task) return null;
      
      const isHovered = hoveredTaskId === bar.taskId;
      const isSelected = selectedTaskId === bar.taskId;
      const isHighlighted = highlightedElements.tasks.has(bar.taskId);
      const shouldHighlight = settings.showCriticalPath && bar.isCritical;
      
      // Apply dimming when something is hovered but this task is not highlighted
      const isDimmed = hoveredTaskId !== null && !isHighlighted;
      
      return (
        <g
          key={`bar-${bar.taskId}`}
          className={`gantt-bar-group ${isDimmed ? 'gantt-dimmed' : ''}`}
          onMouseEnter={() => hoverTask(bar.taskId)}
          onMouseLeave={() => hoverTask(null)}
          onClick={() => openTaskCard(bar.taskId)}
        >
          <rect
            x={bar.x}
            y={bar.y + 4}
            width={bar.width}
            height={bar.height}
            rx={4}
            className={`gantt-bar ${shouldHighlight ? 'gantt-bar-critical' : ''} ${isHovered ? 'gantt-bar-hovered' : ''} ${isSelected ? 'gantt-bar-selected' : ''}`}
          />
          
          {bar.progressWidth > 0 && (
            <rect
              x={bar.x}
              y={bar.y + 4}
              width={bar.progressWidth}
              height={bar.height}
              rx={4}
              className="gantt-bar-progress"
            />
          )}
          
          <text
            x={bar.x + 4}
            y={bar.y + bar.height / 2 + 4}
            className="gantt-bar-label"
            dominantBaseline="middle"
          >
            {task.name}
          </text>
        </g>
      );
    });
  };
  
  // Render dependency lines
  const renderDependencies = () => {
    if (!graph) return null;
    
    const lines: JSX.Element[] = [];
    
    for (const edge of graph.edges) {
      const fromBar = bars.find(b => b.taskId === edge.from);
      const toBar = bars.find(b => b.taskId === edge.to);
      
      if (!fromBar || !toBar) continue;
      
      const fromX = fromBar.x + fromBar.width;
      const fromY = fromBar.y + fromBar.height / 2 + 4;
      const toX = toBar.x;
      const toY = toBar.y + toBar.height / 2 + 4;
      
      const isHighlighted = highlightedElements.edges.has(`${edge.from}-${edge.to}`);
      const isDimmed = hoveredTaskId !== null && !isHighlighted;
      
      // Create arrow path
      const midX = (fromX + toX) / 2;
      const path = `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX - 8} ${toY}`;
      
      lines.push(
        <g key={`dep-${edge.from}-${edge.to}`} className={isDimmed ? 'gantt-dimmed' : ''}>
          <path
            d={path}
            className={`gantt-dependency ${edge.isCritical && settings.showCriticalPath ? 'gantt-dependency-critical' : ''} ${isHighlighted ? 'gantt-dependency-highlighted' : ''}`}
            fill="none"
          />
          <polygon
            points={`${toX},${toY} ${toX - 8},${toY - 4} ${toX - 8},${toY + 4}`}
            className={`gantt-dependency-arrow ${edge.isCritical && settings.showCriticalPath ? 'gantt-dependency-critical' : ''} ${isHighlighted ? 'gantt-dependency-highlighted' : ''}`}
          />
        </g>
      );
    }
    
    return <g className="gantt-dependencies">{lines}</g>;
  };
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    
    // Sync header horizontal scroll
    if (headerRef.current) {
      headerRef.current.scrollLeft = target.scrollLeft;
    }
    
    // Call parent's onScroll handler if provided
    if (onScroll) {
      onScroll(e);
    }
  };
  
  return (
    <div className="gantt-container">
      <div className="gantt-header" ref={headerRef}>
        <svg
          width={timeScale.width}
          height={headerHeight}
          className="gantt-header-svg"
        >
          {renderTimeAxis()}
          {renderVerticalGridLines().map(line => 
            React.cloneElement(line, { y2: headerHeight })
          )}
        </svg>
      </div>
      <div className="gantt-chart" ref={scrollRef} onScroll={handleScroll}>
        <div className="gantt-scroll-content" style={{ width: timeScale.width, height: totalHeight }}>
          <svg
            ref={svgRef}
            width={timeScale.width}
            height={totalHeight}
            className="gantt-svg"
          >
            {renderCalendarBands()}
            {renderVerticalGridLines()}
            {renderRowGridLines()}
            {renderTodayLine()}
            {renderDependencies()}
            {renderBars()}
          </svg>
        </div>
      </div>
    </div>
  );
};