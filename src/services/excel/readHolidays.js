import { parseDate } from '../../utils/date';
import { getSheet, sheetToJson } from './readWorkbook';
export function readHolidays(workbook, sheetNames) {
    const holidays = [];
    // Find holiday sheet (case-insensitive)
    const holidaySheetName = workbook.SheetNames.find(name => sheetNames.some(pattern => name.toLowerCase() === pattern.toLowerCase()));
    if (!holidaySheetName) {
        console.log('Holiday sheet not found');
        return holidays;
    }
    const sheet = getSheet(workbook, holidaySheetName);
    if (!sheet)
        return holidays;
    const rows = sheetToJson(sheet);
    for (const row of rows) {
        // Try different column names for date
        const dateValue = row['日付'] || row['Date'] || row['date'];
        const date = parseDate(dateValue);
        if (date) {
            const name = row['名称'] || row['Name'] || row['name'] || '';
            holidays.push({ date, name });
        }
    }
    // Sort holidays by date
    holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
    return holidays;
}
