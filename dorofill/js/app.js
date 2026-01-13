/**
 * DoroFill - App.js
 * 공통 애플리케이션 로직
 */

// ==========================================================================
// Configuration
// ==========================================================================
const APP_CONFIG = {
    appName: 'DoroFill',
    version: '1.0.0',
    storagePrefix: 'dorofill_',
};

// ==========================================================================
// Utility Functions
// ==========================================================================

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Format date to Korean format
 * @param {Date} date - Date object
 * @returns {string} Formatted date string (YYYY년 MM월 DD일)
 */
function formatDateKorean(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
}

/**
 * Format time to Korean format
 * @param {Date} date - Date object
 * @returns {string} Formatted time string (HH시 MM분)
 */
function formatTimeKorean(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}시 ${minutes}분`;
}

/**
 * Format date for input field (YYYY-MM-DD)
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format time for input field (HH:MM)
 * @param {Date} date - Date object
 * @returns {string} Formatted time string
 */
function formatTimeInput(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// ==========================================================================
// Local Storage Functions
// ==========================================================================

/**
 * Save data to local storage
 * @param {string} key - Storage key
 * @param {any} data - Data to save
 */
function saveToStorage(key, data) {
    try {
        const fullKey = APP_CONFIG.storagePrefix + key;
        localStorage.setItem(fullKey, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save to storage:', error);
    }
}

/**
 * Load data from local storage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Loaded data or default value
 */
function loadFromStorage(key, defaultValue = null) {
    try {
        const fullKey = APP_CONFIG.storagePrefix + key;
        const data = localStorage.getItem(fullKey);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Failed to load from storage:', error);
        return defaultValue;
    }
}

/**
 * Remove data from local storage
 * @param {string} key - Storage key
 */
function removeFromStorage(key) {
    try {
        const fullKey = APP_CONFIG.storagePrefix + key;
        localStorage.removeItem(fullKey);
    } catch (error) {
        console.error('Failed to remove from storage:', error);
    }
}

/**
 * Clear all app data from local storage
 */
function clearAllStorage() {
    try {
        Object.keys(localStorage)
            .filter(key => key.startsWith(APP_CONFIG.storagePrefix))
            .forEach(key => localStorage.removeItem(key));
    } catch (error) {
        console.error('Failed to clear storage:', error);
    }
}

// ==========================================================================
// Toast Notification
// ==========================================================================

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type ('success', 'error', 'info', 'warning')
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    
    // Toast styles
    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    const icons = {
        success: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
        error: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
        warning: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
        info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
    };

    toast.innerHTML = `
        <div class="fixed top-20 left-4 right-4 z-[100] flex justify-center animate-fade-in">
            <div class="${bgColors[type]} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-sm">
                ${icons[type]}
                <span class="text-sm font-medium">${message}</span>
            </div>
        </div>
    `;

    document.body.appendChild(toast);

    // Remove after duration
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ==========================================================================
// Loading Indicator
// ==========================================================================

/**
 * Show loading overlay
 * @param {string} message - Loading message
 */
function showLoading(message = '처리 중...') {
    // Remove existing loading
    hideLoading();

    const loading = document.createElement('div');
    loading.id = 'loading-overlay';
    loading.innerHTML = `
        <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center">
            <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col items-center gap-4 max-w-xs mx-4">
                <div class="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                <p class="text-white text-sm font-medium">${message}</p>
            </div>
        </div>
    `;
    document.body.appendChild(loading);
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.remove();
    }
}

// ==========================================================================
// Confirmation Dialog
// ==========================================================================

/**
 * Show confirmation dialog
 * @param {string} message - Confirmation message
 * @param {Function} onConfirm - Callback on confirm
 * @param {Function} onCancel - Callback on cancel
 */
function showConfirm(message, onConfirm, onCancel = null) {
    const dialog = document.createElement('div');
    dialog.id = 'confirm-dialog';
    dialog.innerHTML = `
        <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full animate-fade-in">
                <p class="text-white text-center mb-6">${message}</p>
                <div class="flex gap-3">
                    <button id="confirm-cancel" class="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors">
                        취소
                    </button>
                    <button id="confirm-ok" class="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors">
                        확인
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);

    // Event listeners
    document.getElementById('confirm-cancel').addEventListener('click', () => {
        dialog.remove();
        if (onCancel) onCancel();
    });

    document.getElementById('confirm-ok').addEventListener('click', () => {
        dialog.remove();
        onConfirm();
    });
}

// ==========================================================================
// Form Utilities
// ==========================================================================

/**
 * Get form data as object
 * @param {HTMLFormElement} form - Form element
 * @returns {Object} Form data object
 */
function getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

/**
 * Reset form and clear all inputs
 * @param {HTMLFormElement} form - Form element
 */
function resetForm(form) {
    form.reset();
    // Clear any custom error states
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    form.querySelectorAll('.error-message').forEach(el => el.remove());
}

// ==========================================================================
// Initialization
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log(`${APP_CONFIG.appName} v${APP_CONFIG.version} initialized`);
    
    // Set current date/time defaults if needed
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const timeInputs = document.querySelectorAll('input[type="time"]');
    
    const now = new Date();
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = formatDateInput(now);
        }
    });
    
    timeInputs.forEach(input => {
        if (!input.value) {
            input.value = formatTimeInput(now);
        }
    });
});

// ==========================================================================
// Export for module usage (if needed)
// ==========================================================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APP_CONFIG,
        generateId,
        formatDateKorean,
        formatTimeKorean,
        formatDateInput,
        formatTimeInput,
        saveToStorage,
        loadFromStorage,
        removeFromStorage,
        clearAllStorage,
        showToast,
        showLoading,
        hideLoading,
        showConfirm,
        getFormData,
        resetForm
    };
}
