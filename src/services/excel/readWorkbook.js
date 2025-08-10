import * as XLSX from 'xlsx';
export async function readWorkbook(path) {
    try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const cacheBustingPath = `${path}?t=${timestamp}`;
        const response = await fetch(cacheBustingPath, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch Excel file: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        // Read workbook with cellDates option to parse dates correctly
        const workbook = XLSX.read(data, {
            type: 'array',
            cellDates: true,
            dateNF: 'yyyy/m/d'
        });
        return workbook;
    }
    catch (error) {
        console.error('Failed to read workbook:', error);
        throw new Error(`Excelファイルの読み込みに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export function getSheetNames(workbook) {
    return workbook.SheetNames;
}
export async function readWorkbookFromFile(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, {
            type: 'array',
            cellDates: true,
            dateNF: 'yyyy/m/d'
        });
        return workbook;
    }
    catch (error) {
        console.error('Failed to read workbook from file:', error);
        throw new Error(`ローカルファイルからのExcel読み込みに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export function getSheet(workbook, sheetName) {
    return workbook.Sheets[sheetName];
}
export function sheetToJson(sheet) {
    return XLSX.utils.sheet_to_json(sheet, {
        raw: false, // Get formatted strings
        dateNF: 'yyyy/m/d'
    });
}
