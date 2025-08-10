import { Task } from '../../models/types';
import { parseDate, addDays } from '../../utils/date';
import * as XLSX from 'xlsx';
import { getSheet, sheetToJson } from '../../services/excel/readWorkbook';

interface RawTaskRow {
  'ID': any;
  'タスク名': any;
  '詳細'?: any;
  '備考'?: any;
  '分類1'?: any;
  '分類2'?: any;
  '分類3'?: any;
  '開始日'?: any;
  '終了日'?: any;
  '工数（人日）'?: any;
  '前工程'?: any;
  '担当'?: any;
  '進捗（%）'?: any;
}

export function parseTasks(
  workbook: XLSX.WorkBook,
  projectId: string
): Task[] {
  const sheet = getSheet(workbook, projectId);
  if (!sheet) {
    throw new Error(`Sheet "${projectId}" not found`);
  }
  
  const rows = sheetToJson<RawTaskRow>(sheet);
  const tasks: Task[] = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) {
      console.warn(`Row ${i + 2}: empty row`);
      continue;
    }
    
    // Parse ID (required)
    const taskId = parseTaskId(row['ID']);
    if (taskId === undefined) {
      console.warn(`Row ${i + 2}: Invalid or missing ID`);
      continue;
    }
    
    // Parse task name (required)
    const name = parseString(row['タスク名']);
    if (!name) {
      console.warn(`Row ${i + 2}: Missing task name`);
      continue;
    }
    
    // Parse dates
    const start = parseDate(row['開始日']);
    let finish = parseDate(row['終了日']);
    const effortDays = parseNumber(row['工数（人日）']);
    
    // Calculate finish date from start + effort if finish is missing
    if (start && !finish && effortDays !== undefined) {
      finish = addDays(start, effortDays - 1); // -1 because start day counts as day 1
    }
    
    // Parse predecessors
    const predecessorIds = parsePredecessors(row['前工程']);
    
    // Parse progress
    let progress = parseNumber(row['進捗（%）']);
    if (progress !== undefined) {
      // Handle both decimal (0.5) and percentage (50) formats
      if (progress <= 1) {
        progress = progress * 100;
      }
      progress = Math.max(0, Math.min(100, progress));
    }
    
    const task: Task = {
      taskId,
      projectId,
      name,
      detail: parseString(row['詳細']),
      note: parseString(row['備考']),
      class1: parseString(row['分類1']),
      class2: parseString(row['分類2']),
      class3: parseString(row['分類3']),
      start,
      finish,
      effortDays,
      predecessorIds,
      assignedTo: parseString(row['担当']),
      progress,
      isCritical: false,
      isSummary: false
    };
    
    tasks.push(task);
  }
  
  return tasks;
}

function parseTaskId(value: any): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  
  const num = Number(value);
  if (!isNaN(num) && Number.isInteger(num)) {
    return num;
  }
  
  return undefined;
}

function parseString(value: any): string | undefined {
  if (value === null || value === undefined) return undefined;
  
  const str = String(value).trim();
  return str || undefined;
}

function parseNumber(value: any): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  
  const num = Number(value);
  if (!isNaN(num)) {
    return num;
  }
  
  return undefined;
}

function parsePredecessors(value: any): number[] {
  if (!value) return [];
  
  const str = String(value).trim();
  if (!str) return [];
  
  // Split by comma and parse each ID
  const ids: number[] = [];
  const parts = str.split(',');
  
  for (const part of parts) {
    const id = parseTaskId(part.trim());
    if (id !== undefined) {
      ids.push(id);
    }
  }
  
  return ids;
}
