const STORAGE_KEY = 'gantt-runtime-settings';
export function loadRuntimeSettings() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored)
            return {};
        const parsed = JSON.parse(stored);
        // Convert expandedGroups array back to Set
        if (parsed.expandedGroups && Array.isArray(parsed.expandedGroups)) {
            parsed.expandedGroups = new Set(parsed.expandedGroups);
        }
        return parsed;
    }
    catch (error) {
        console.error('Failed to load runtime settings:', error);
        return {};
    }
}
export function saveRuntimeSettings(settings) {
    try {
        // Convert Set to array for JSON serialization
        const toStore = {
            ...settings,
            expandedGroups: Array.from(settings.expandedGroups)
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    }
    catch (error) {
        console.error('Failed to save runtime settings:', error);
    }
}
export function clearRuntimeSettings() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    }
    catch (error) {
        console.error('Failed to clear runtime settings:', error);
    }
}
