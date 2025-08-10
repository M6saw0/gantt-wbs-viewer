const DEFAULT_CONFIG = {
    holidaySheetNames: ['祝日', 'Holidays'],
    ui: {
        defaultZoom: 'week',
        showHolidays: true,
        showCriticalPath: true,
        showTodayLine: true
    },
    rangeBeforeDays: 7,
    rangeAfterDays: 45
};
export async function loadConfig() {
    try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`/config/app.config.json?t=${timestamp}`, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        if (!response.ok) {
            console.warn('Config file not found, using defaults');
            return DEFAULT_CONFIG;
        }
        const config = await response.json();
        // Merge with defaults to ensure all fields exist
        return {
            ...DEFAULT_CONFIG,
            ...config,
            ui: {
                ...DEFAULT_CONFIG.ui,
                ...config.ui
            }
        };
    }
    catch (error) {
        console.error('Failed to load config:', error);
        return DEFAULT_CONFIG;
    }
}
