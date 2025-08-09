// データモデル定義

export interface Project {
  projectId: string; // シート名
  name: string;
  calendarId?: string;
}

export interface Task {
  taskId: number; // ID列
  projectId: string;
  name: string; // タスク名
  detail?: string; // 詳細
  note?: string; // 備考
  class1?: string; // 分類1
  class2?: string; // 分類2
  class3?: string; // 分類3
  start?: Date; // 開始日
  finish?: Date; // 終了日
  effortDays?: number; // 工数（人日）
  predecessorIds: number[]; // 前工程
  assignedTo?: string; // 担当
  progress?: number; // 進捗（%）
  
  // 計算結果
  isCritical?: boolean;
  isSummary?: boolean;
  earlyStart?: Date;
  earlyFinish?: Date;
  lateStart?: Date;
  lateFinish?: Date;
  totalFloat?: number;
}

export interface Holiday {
  date: Date;
  name?: string;
}

export interface Calendar {
  weekends: number[]; // 0=日曜, 6=土曜
  holidays: Holiday[];
}

export interface AppConfig {
  excelPath: string;
  holidaySheetNames: string[];
  ui?: {
    defaultZoom?: 'day' | 'week' | 'month';
    showHolidays?: boolean;
    showCriticalPath?: boolean;
  };
  rangeBeforeDays?: number;
  rangeAfterDays?: number;
}

export interface RuntimeSettings {
  selectedProjectId?: string;
  zoom: 'day' | 'week' | 'month';
  showHolidays: boolean;
  showCriticalPath: boolean;
  showTodayLine: boolean;
  expandedGroups: Set<string>;
}

export interface ValidationError {
  type: 'missing_column' | 'duplicate_id' | 'invalid_type' | 'invalid_reference' | 'circular_dependency';
  message: string;
  details?: any;
}

export interface DependencyEdge {
  from: number;
  to: number;
  isCritical?: boolean;
}

export interface GanttBar {
  taskId: number;
  x: number;
  y: number;
  width: number;
  height: number;
  progressWidth: number;
  isCritical: boolean;
}

export interface TimeScale {
  startDate: Date;
  endDate: Date;
  scale: 'day' | 'week' | 'month';
  getX: (date: Date) => number;
  getDate: (x: number) => Date;
  width: number;
}
