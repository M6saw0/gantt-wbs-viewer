import { getSheetNames } from '../../services/excel/readWorkbook';
export function loadExcelProjects(workbook, holidaySheetNames) {
    const sheetNames = getSheetNames(workbook);
    // Filter out holiday sheets (case-insensitive)
    const projectSheets = sheetNames.filter(name => !holidaySheetNames.some(pattern => name.toLowerCase() === pattern.toLowerCase()));
    // Create project objects
    const projects = projectSheets.map(sheetName => ({
        projectId: sheetName,
        name: sheetName,
        calendarId: 'default'
    }));
    return projects;
}
