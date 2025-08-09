import { Project } from '../../models/types';
import { getSheetNames } from '../../services/excel/readWorkbook';
import * as XLSX from 'xlsx';

export function loadExcelProjects(
  workbook: XLSX.WorkBook,
  holidaySheetNames: string[]
): Project[] {
  const sheetNames = getSheetNames(workbook);
  
  // Filter out holiday sheets (case-insensitive)
  const projectSheets = sheetNames.filter(name => 
    !holidaySheetNames.some(pattern => 
      name.toLowerCase() === pattern.toLowerCase()
    )
  );
  
  // Create project objects
  const projects: Project[] = projectSheets.map(sheetName => ({
    projectId: sheetName,
    name: sheetName,
    calendarId: 'default'
  }));
  
  return projects;
}
