import { addDays, diffDays } from '../../utils/date';
export function deriveDisplayData(tasks, dependencies, zoom, containerWidth, rangeBeforeDays = 7, rangeAfterDays = 45) {
    const rowHeight = 32;
    const headerHeight = 60;
    // Find date range from all task dates (both original and calculated)
    let minDate = null;
    let maxDate = null;
    for (const task of tasks) {
        // Check all possible date fields
        const dates = [
            task.earlyStart,
            task.earlyFinish,
            task.lateStart,
            task.lateFinish,
            task.start,
            task.finish
        ].filter(d => d != null);
        for (const date of dates) {
            if (!minDate || date < minDate) {
                minDate = date;
            }
            if (!maxDate || date > maxDate) {
                maxDate = date;
            }
        }
    }
    // Add padding to date range
    if (!minDate)
        minDate = new Date();
    if (!maxDate)
        maxDate = addDays(minDate, 30);
    const startDate = addDays(minDate, -rangeBeforeDays);
    const endDate = addDays(maxDate, rangeAfterDays);
    // Calculate scale
    const totalDays = diffDays(startDate, endDate) + 1;
    let pixelsPerDay;
    switch (zoom) {
        case 'day':
            pixelsPerDay = 60;
            break;
        case 'week':
            pixelsPerDay = 20;
            break;
        case 'month':
            pixelsPerDay = 8;
            break;
        default:
            pixelsPerDay = 20;
    }
    const width = totalDays * pixelsPerDay;
    const timeScale = {
        startDate,
        endDate,
        scale: zoom,
        width,
        getX: (date) => {
            const days = diffDays(startDate, date);
            return days * pixelsPerDay;
        },
        getDate: (x) => {
            const days = Math.floor(x / pixelsPerDay);
            return addDays(startDate, days);
        }
    };
    // Create bars
    const bars = [];
    const taskIndexMap = new Map();
    tasks.forEach((task, index) => {
        taskIndexMap.set(task.taskId, index);
        const start = task.earlyStart || task.start;
        const finish = task.earlyFinish || task.finish;
        if (start && finish) {
            const x = timeScale.getX(start);
            const endX = timeScale.getX(addDays(finish, 1)); // Include the finish day
            const width = endX - x;
            const y = index * rowHeight;
            const progressWidth = task.progress ? width * (task.progress / 100) : 0;
            bars.push({
                taskId: task.taskId,
                x,
                y,
                width,
                height: rowHeight - 8,
                progressWidth,
                isCritical: task.isCritical || false
            });
        }
    });
    return {
        bars,
        timeScale,
        dependencies,
        rowHeight,
        headerHeight
    };
}
