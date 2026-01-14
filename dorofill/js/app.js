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
// Form Data Collection & Validation
// ==========================================================================

/**
 * 필드 ID 설정 (수정 용이하도록 중앙 관리)
 */
const FORM_FIELD_IDS = {
    report: {
        // 적발 정보
        datetime: 'reportDatetime',
        location: 'reportLocation',

        // 운전자 정보
        driverName: 'driverName',
        driverAddress: 'driverAddress',
        phoneFixed: 'phoneFixed',
        phoneMobile: 'phoneMobile',

        // 차량 정보
        vehicleType: 'vehicleType',
        plateNumber: 'plateNumber',
        route: 'route',
        cargo: 'cargo',

        // 차량규격 (측정, 허용, 위반)
        widthMeasured: 'widthMeasured',
        widthAllowed: 'widthAllowed',
        widthViolation: 'widthViolation',
        heightMeasured: 'heightMeasured',
        heightAllowed: 'heightAllowed',
        heightViolation: 'heightViolation',
        lengthMeasured: 'lengthMeasured',
        lengthAllowed: 'lengthAllowed',
        lengthViolation: 'lengthViolation',

        // 작성자 정보
        authorDate: 'authorDate',
        authorOffice: 'authorOffice',
        authorPosition: 'authorPosition',
        authorName: 'authorName',
    },
    statement: {
        // 적발 정보 (보고서와 공유 가능)
        datetime: 'statementDatetime',
        location: 'statementLocation',

        // 사건 정보
        vehicleType: 'statementVehicleType',
        plateNumber: 'statementPlateNumber',

        // 작성자 정보
        authorDate: 'statementAuthorDate',
        authorOffice: 'statementAuthorOffice',
        authorPosition: 'statementAuthorPosition',
        authorName: 'statementAuthorName',
    }
};

/**
 * 안전하게 요소 값 가져오기
 * @param {string} id - 요소 ID
 * @returns {string} 요소 값 또는 빈 문자열
 */
function getElementValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
}

/**
 * HTML 폼에서 모든 입력값 수집
 * @param {string} formType - 'report' 또는 'statement'
 * @returns {Object} 폼 데이터 객체
 */
function collectFormData(formType) {
    const data = {};

    if (formType === 'report') {
        // ===== 적발 보고서 필드 수집 =====

        // 적발 정보
        data.datetime = getElementValue('reportDatetime');
        data.location = getElementValue('reportLocation');

        // 운전자 정보
        data.driverName = getElementValue('driverName');
        data.driverAddress = getElementValue('driverAddress');
        data.phoneFixed = getElementValue('phoneFixed');
        data.phoneMobile = getElementValue('phoneMobile');

        // 차량 정보
        data.vehicleType = getElementValue('vehicleType');
        data.plateNumber = getElementValue('plateNumber');
        data.route = getElementValue('route');
        data.cargo = getElementValue('cargo');

        // 차량규격 (측정, 허용, 위반)
        data.widthMeasured = getElementValue('widthMeasured');
        data.widthAllowed = getElementValue('widthAllowed');
        data.widthViolation = getElementValue('widthViolation');
        data.heightMeasured = getElementValue('heightMeasured');
        data.heightAllowed = getElementValue('heightAllowed');
        data.heightViolation = getElementValue('heightViolation');
        data.lengthMeasured = getElementValue('lengthMeasured');
        data.lengthAllowed = getElementValue('lengthAllowed');
        data.lengthViolation = getElementValue('lengthViolation');

        // 차량중량 (1~8축)
        for (let i = 1; i <= 8; i++) {
            data[`axle${i}Measured`] = getElementValue(`axle${i}Measured`);
            data[`axle${i}Violation`] = getElementValue(`axle${i}Violation`);
        }

        // 총중량
        data.totalWeightMeasured = getElementValue('totalWeightMeasured');
        data.totalWeightViolation = getElementValue('totalWeightViolation');

        // 작성자 정보
        data.authorDate = getElementValue('authorDate');
        data.authorOffice = getElementValue('authorOffice');
        data.authorPosition = getElementValue('authorPosition');
        data.authorName = getElementValue('authorName');

    } else if (formType === 'statement') {
        // ===== 위반 진술서 필드 수집 =====

        // 적발 정보
        data.datetime = getElementValue('statementDatetime');
        data.location = getElementValue('statementLocation');

        // 차량 정보
        data.vehicleType = getElementValue('statementVehicleType');
        data.plateNumber = getElementValue('statementPlateNumber');

        // 작성자 정보
        data.authorDate = getElementValue('statementAuthorDate');
        data.authorOffice = getElementValue('statementAuthorOffice');
        data.authorPosition = getElementValue('statementAuthorPosition');
        data.authorName = getElementValue('statementAuthorName');

        // 진술인 배열 수집
        data.witnesses = collectWitnesses();
    }

    return data;
}

/**
 * 동적으로 추가된 모든 진술인 정보 수집
 * @returns {Array<Object>} 진술인 배열
 */
function collectWitnesses() {
    const witnesses = [];
    const witnessCards = document.querySelectorAll('[data-witness-index]');

    witnessCards.forEach(card => {
        const index = card.dataset.witnessIndex;
        const witness = {
            office: getElementValue(`witness${index}Office`),
            position: getElementValue(`witness${index}Position`),
            name: getElementValue(`witness${index}Name`),
        };

        // 적어도 이름이 있는 경우만 추가
        if (witness.name) {
            witnesses.push(witness);
        }
    });

    return witnesses;
}

/**
 * 필수 필드 검증 규칙
 */
const VALIDATION_RULES = {
    report: {
        required: [
            { field: 'datetime', label: '적발 일시' },
            { field: 'location', label: '적발 위치' },
            { field: 'driverName', label: '운전자 성명' },
            { field: 'plateNumber', label: '차량 등록번호' },
            { field: 'authorName', label: '작성자 성명' },
        ],
        optional: [
            'driverAddress', 'phoneFixed', 'phoneMobile', 'vehicleType',
            'route', 'cargo', 'authorDate', 'authorOffice', 'authorPosition'
        ]
    },
    statement: {
        required: [
            { field: 'datetime', label: '적발 일시' },
            { field: 'location', label: '적발 위치' },
        ],
        minWitnesses: 1
    }
};

/**
 * 필수 필드가 모두 입력되었는지 확인
 * @param {Object} data - 폼 데이터
 * @param {string} formType - 폼 유형 ('report' 또는 'statement')
 * @returns {Object} { valid: boolean, errors: Array<string>, missingFields: Array<string> }
 */
function validateFormData(data, formType) {
    const errors = [];
    const missingFields = [];
    const rules = VALIDATION_RULES[formType];

    if (!rules) {
        console.warn(`[Validation] 알 수 없는 폼 유형: ${formType}`);
        return { valid: true, errors: [], missingFields: [] };
    }

    // 필수 필드 검사
    if (rules.required) {
        rules.required.forEach(({ field, label }) => {
            if (!data[field] || data[field].trim() === '') {
                errors.push(`${label}을(를) 입력해주세요.`);
                missingFields.push(field);
            }
        });
    }

    // 진술서 특수 검증: 최소 진술인 수
    if (formType === 'statement' && rules.minWitnesses) {
        if (!data.witnesses || data.witnesses.length < rules.minWitnesses) {
            errors.push(`진술인을 ${rules.minWitnesses}명 이상 입력해주세요.`);
            missingFields.push('witnesses');
        }
    }

    // 차량 번호 형식 검증 (선택적)
    if (data.plateNumber && typeof VALIDATOR !== 'undefined' && VALIDATOR.isValidVehicleNumber) {
        if (!VALIDATOR.isValidVehicleNumber(data.plateNumber)) {
            errors.push('올바른 차량번호 형식이 아닙니다. (예: 12가1234, 서울12가1234)');
        }
    }

    // 전화번호 형식 검증 (선택적, 입력된 경우만)
    if (data.phoneMobile && typeof VALIDATOR !== 'undefined' && VALIDATOR.isValidPhone) {
        if (!VALIDATOR.isValidPhone(data.phoneMobile)) {
            errors.push('올바른 휴대폰 번호 형식이 아닙니다.');
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors,
        missingFields: missingFields
    };
}

/**
 * 검증 오류를 사용자에게 표시
 * @param {Array<string>} errors - 오류 메시지 배열
 * @param {Object} options - 옵션
 * @param {number} [options.duration=5000] - 자동 제거 시간 (ms)
 * @param {boolean} [options.scrollToError=true] - 첫 번째 오류로 스크롤
 */
function showValidationErrors(errors, options = {}) {
    const { duration = 5000, scrollToError = true } = options;

    if (!errors || errors.length === 0) return;

    const errorHtml = errors.map(err => `<li class="flex items-start gap-2">
        <span class="text-red-500 mt-0.5">•</span>
        <span>${err}</span>
    </li>`).join('');

    const message = `
        <div class="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-4 animate-fade-in">
            <div class="flex items-center gap-2 mb-2">
                <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <h3 class="font-bold text-red-700 dark:text-red-400">입력 오류</h3>
            </div>
            <ul class="text-red-600 dark:text-red-300 text-sm space-y-1 ml-1">
                ${errorHtml}
            </ul>
        </div>
    `;

    // 에러 컨테이너 찾기 또는 생성
    let errorContainer = document.getElementById('errorContainer');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'errorContainer';
        // 페이지 상단에 추가
        const main = document.querySelector('main') || document.body;
        main.insertBefore(errorContainer, main.firstChild);
    }

    errorContainer.innerHTML = message;

    // 에러 컨테이너로 스크롤
    if (scrollToError) {
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 지정 시간 후 자동 제거
    if (duration > 0) {
        setTimeout(() => {
            errorContainer.innerHTML = '';
        }, duration);
    }
}

/**
 * 검증 오류 제거
 */
function clearValidationErrors() {
    const errorContainer = document.getElementById('errorContainer');
    if (errorContainer) {
        errorContainer.innerHTML = '';
    }
}

/**
 * 첫 번째 오류 필드로 스크롤 및 포커스
 * @param {Array<string>} missingFields - 누락된 필드 ID 배열
 */
function focusFirstErrorField(missingFields) {
    if (!missingFields || missingFields.length === 0) return;

    // FORM_FIELD_IDS에서 실제 ID 찾기
    for (const fieldKey of missingFields) {
        // report 타입에서 먼저 찾기
        const reportId = FORM_FIELD_IDS.report?.[fieldKey];
        const statementId = FORM_FIELD_IDS.statement?.[fieldKey];
        const actualId = reportId || statementId || fieldKey;

        const element = document.getElementById(actualId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
            // 시각적 하이라이트
            element.classList.add('ring-2', 'ring-red-500', 'ring-offset-2');
            setTimeout(() => {
                element.classList.remove('ring-2', 'ring-red-500', 'ring-offset-2');
            }, 3000);
            break;
        }
    }
}

/**
 * 폼 데이터 수집 및 검증 통합 함수
 * @param {string} formType - 'report' 또는 'statement'
 * @returns {Object} { data: Object|null, valid: boolean, errors: Array<string> }
 */
function collectAndValidateForm(formType) {
    clearValidationErrors();

    const data = collectFormData(formType);
    const validation = validateFormData(data, formType);

    if (!validation.valid) {
        showValidationErrors(validation.errors);
        focusFirstErrorField(validation.missingFields);
        return { data: null, valid: false, errors: validation.errors };
    }

    return { data: data, valid: true, errors: [] };
}

// ==========================================================================
// Local Storage Auto-Save & Restore
// ==========================================================================

/** 자동 저장 인터벌 ID (중복 방지용) */
let autoSaveIntervalId = null;

/** 자동 저장 설정 */
const AUTO_SAVE_CONFIG = {
    interval: 5000,  // 5초마다 저장
    prefix: 'dorofill_',
    suffix: '_autosave'
};

/**
 * 현재 페이지의 폼 타입 판단
 * @returns {string|null} 'report', 'statement', 또는 null
 */
function getCurrentFormType() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('report')) return 'report';
    if (path.includes('statement')) return 'statement';
    return null;
}

/**
 * 자동 저장 키 생성
 * @param {string} formType - 폼 타입
 * @returns {string} 스토리지 키
 */
function getAutoSaveKey(formType) {
    return `${AUTO_SAVE_CONFIG.prefix}${formType}${AUTO_SAVE_CONFIG.suffix}`;
}

/**
 * 폼 데이터를 localStorage에 저장
 * @param {string} formType - 'report' 또는 'statement'
 * @returns {boolean} 저장 성공 여부
 */
function saveFormData(formType) {
    if (!formType) return false;

    try {
        const data = collectFormData(formType);
        const key = getAutoSaveKey(formType);

        // 타임스탬프 추가
        data._savedAt = new Date().toISOString();

        localStorage.setItem(key, JSON.stringify(data));
        console.log(`[자동 저장] ${new Date().toLocaleTimeString()}`);
        return true;
    } catch (error) {
        console.error('[자동 저장] 저장 실패:', error);
        return false;
    }
}

/**
 * 5초마다 폼 데이터를 localStorage에 저장
 * @param {string} formType - 'report' 또는 'statement'
 * @returns {number} interval ID
 */
function startAutoSave(formType) {
    if (!formType) return null;

    // 기존 인터벌 정리
    if (autoSaveIntervalId) {
        clearInterval(autoSaveIntervalId);
    }

    // 즉시 한 번 저장
    saveFormData(formType);

    // 주기적 저장 시작
    autoSaveIntervalId = setInterval(() => {
        saveFormData(formType);
    }, AUTO_SAVE_CONFIG.interval);

    console.log(`[자동 저장] 시작됨 (${AUTO_SAVE_CONFIG.interval / 1000}초 간격)`);
    return autoSaveIntervalId;
}

/**
 * 자동 저장 중지
 */
function stopAutoSave() {
    if (autoSaveIntervalId) {
        clearInterval(autoSaveIntervalId);
        autoSaveIntervalId = null;
        console.log('[자동 저장] 중지됨');
    }
}

/**
 * 저장된 데이터가 있는지 확인
 * @param {string} formType - 폼 타입
 * @returns {Object|null} 저장된 데이터 또는 null
 */
function getSavedFormData(formType) {
    if (!formType) return null;

    try {
        const key = getAutoSaveKey(formType);
        const savedData = localStorage.getItem(key);

        if (!savedData) return null;

        const data = JSON.parse(savedData);
        return data;
    } catch (error) {
        console.error('[자동 저장] 데이터 읽기 실패:', error);
        return null;
    }
}

/**
 * 저장된 데이터를 폼에 복원
 * @param {string} formType - 폼 타입
 * @param {Object} data - 복원할 데이터 (없으면 localStorage에서 가져옴)
 * @returns {boolean} 복원 성공 여부
 */
function restoreFormData(formType, data = null) {
    if (!formType) return false;

    try {
        const savedData = data || getSavedFormData(formType);
        if (!savedData) return false;

        // 각 필드에 값 채우기
        Object.keys(savedData).forEach(fieldId => {
            // 내부 필드(_로 시작) 건너뛰기
            if (fieldId.startsWith('_')) return;
            // 배열(witnesses)은 별도 처리
            if (fieldId === 'witnesses') return;

            const element = document.getElementById(fieldId);
            if (element && savedData[fieldId]) {
                element.value = savedData[fieldId];
            }
        });

        // 진술인 복원 (statement인 경우)
        if (formType === 'statement' && savedData.witnesses && savedData.witnesses.length > 0) {
            restoreWitnesses(savedData.witnesses);
        }

        // 복원 후 계산 트리거
        setTimeout(() => {
            triggerCalculationsAfterRestore();
        }, 100);

        return true;
    } catch (error) {
        console.error('[자동 저장] 복원 실패:', error);
        return false;
    }
}

/**
 * 진술인 데이터 복원
 * @param {Array<Object>} witnesses - 진술인 배열
 */
function restoreWitnesses(witnesses) {
    if (!witnesses || !Array.isArray(witnesses)) return;

    witnesses.forEach((witness, index) => {
        const witnessIndex = index + 1;

        // 진술인 카드가 있는지 확인, 없으면 추가 필요
        const officeInput = document.getElementById(`witness${witnessIndex}Office`);
        const positionInput = document.getElementById(`witness${witnessIndex}Position`);
        const nameInput = document.getElementById(`witness${witnessIndex}Name`);

        if (officeInput) officeInput.value = witness.office || '';
        if (positionInput) positionInput.value = witness.position || '';
        if (nameInput) nameInput.value = witness.name || '';
    });
}

/**
 * 복원 후 계산 트리거
 */
function triggerCalculationsAfterRestore() {
    // 축하중 입력 필드에 input 이벤트 발생시켜 총중량 재계산
    for (let i = 1; i <= 8; i++) {
        const measured = document.getElementById(`axle${i}Measured`);
        const violation = document.getElementById(`axle${i}Violation`);

        if (measured && measured.value) {
            measured.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (violation && violation.value) {
            violation.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    // 위반 체크도 실행
    if (typeof VALIDATOR !== 'undefined' && VALIDATOR.bindViolationChecks) {
        // 이미 바인딩됨, 값만 체크
        const totalMeasured = document.getElementById('totalWeightMeasured');
        const totalViolation = document.getElementById('totalWeightViolation');

        if (totalMeasured && totalMeasured.value) {
            totalMeasured.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (totalViolation && totalViolation.value) {
            totalViolation.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
}

/**
 * 저장된 데이터 삭제 (PDF 생성 완료 후 호출)
 * @param {string} formType - 폼 타입
 */
function clearSavedFormData(formType) {
    if (!formType) return;

    try {
        const key = getAutoSaveKey(formType);
        localStorage.removeItem(key);
        console.log('[자동 저장] 데이터 삭제됨');
    } catch (error) {
        console.error('[자동 저장] 삭제 실패:', error);
    }
}

/**
 * 저장된 데이터 복원 확인 모달 표시
 * @param {string} formType - 폼 타입
 * @param {Object} savedData - 저장된 데이터
 */
function showRestoreConfirmation(formType, savedData) {
    // 저장 시간 포맷팅
    let savedTimeText = '';
    if (savedData._savedAt) {
        const savedDate = new Date(savedData._savedAt);
        savedTimeText = `저장 시간: ${savedDate.toLocaleDateString('ko-KR')} ${savedDate.toLocaleTimeString('ko-KR')}`;
    }

    const formTypeName = formType === 'report' ? '적발 보고서' : '위반 진술서';

    showConfirm(
        `이전에 작성 중이던 ${formTypeName} 데이터가 있습니다.\n${savedTimeText}\n\n불러오시겠습니까?`,
        () => {
            // 확인: 데이터 복원
            if (restoreFormData(formType, savedData)) {
                showToast('이전 작성 내용을 불러왔습니다.', 'success');
            } else {
                showToast('데이터 복원에 실패했습니다.', 'error');
            }
        },
        () => {
            // 취소: 새로 시작
            clearSavedFormData(formType);
            showToast('새로운 문서를 작성합니다.', 'info');
        }
    );
}

/**
 * 페이지 로드 시 자동 저장/복원 초기화
 * @param {string} formType - 폼 타입
 */
function initializeAutoSave(formType) {
    if (!formType) return;

    // 저장된 데이터 확인
    const savedData = getSavedFormData(formType);

    if (savedData) {
        // 복원 확인 모달 표시
        showRestoreConfirmation(formType, savedData);
    }

    // 자동 저장 시작
    startAutoSave(formType);

    // 페이지 떠날 때 저장
    window.addEventListener('beforeunload', () => {
        saveFormData(formType);
    });
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

    // 자동 저장/복원 초기화 (report 또는 statement 페이지에서만)
    const formType = getCurrentFormType();
    if (formType) {
        // 약간의 지연 후 초기화 (다른 스크립트 로드 완료 대기)
        setTimeout(() => {
            initializeAutoSave(formType);
        }, 500);
    }
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
