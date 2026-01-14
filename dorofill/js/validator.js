/**
 * DoroFill - Validator
 * 폼 유효성 검사 및 위반 체크 로직
 */

const VALIDATOR = {
    // 에러 메시지
    messages: {
        required: '필수 입력 항목입니다.',
        invalidVehicleNumber: '올바른 차량번호 형식이 아닙니다.',
        invalidPhone: '올바른 전화번호 형식이 아닙니다.',
        invalidDate: '올바른 날짜 형식이 아닙니다.',
        invalidWeight: '올바른 중량 값을 입력하세요.',
        futureDate: '미래 날짜는 입력할 수 없습니다.'
    },

    /**
     * 필수값 검사
     * @param {string} value - 검사할 값
     * @returns {boolean} 유효 여부
     */
    isRequired(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },

    /**
     * 차량번호 형식 검사 (한국)
     * @param {string} vehicleNumber - 차량번호
     * @returns {boolean} 유효 여부
     */
    isValidVehicleNumber(vehicleNumber) {
        if (!vehicleNumber) return false;
        // 패턴: 12가1234, 서울12가1234, 123가1234 등
        const patterns = [
            /^\d{2,3}[가-힣]\d{4}$/,          // 12가1234, 123가1234
            /^[가-힣]{2}\d{2}[가-힣]\d{4}$/   // 서울12가1234
        ];
        return patterns.some(p => p.test(vehicleNumber.replace(/\s/g, '')));
    },

    /**
     * 전화번호 형식 검사
     * @param {string} phone - 전화번호
     * @returns {boolean} 유효 여부
     */
    isValidPhone(phone) {
        if (!phone) return false;
        const cleaned = phone.replace(/[-\s]/g, '');
        return /^0\d{9,10}$/.test(cleaned);
    },

    /**
     * 날짜 유효성 검사
     * @param {string} dateStr - 날짜 문자열
     * @returns {boolean} 유효 여부
     */
    isValidDate(dateStr) {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
    },

    /**
     * 미래 날짜 검사
     * @param {string} dateStr - 날짜 문자열
     * @returns {boolean} 미래 날짜 여부
     */
    isFutureDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return date > today;
    },

    /**
     * 숫자 검사
     * @param {any} value - 검사할 값
     * @returns {boolean} 숫자 여부
     */
    isNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    /**
     * 폼 전체 유효성 검사
     * @param {Object} formData - 폼 데이터
     * @param {Object} rules - 검사 규칙
     * @returns {Object} { isValid, errors }
     */
    validateForm(formData, rules) {
        const errors = {};

        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = formData[field];

            if (fieldRules.required && !this.isRequired(value)) {
                errors[field] = this.messages.required;
                continue;
            }

            if (value && fieldRules.vehicleNumber && !this.isValidVehicleNumber(value)) {
                errors[field] = this.messages.invalidVehicleNumber;
            }

            if (value && fieldRules.phone && !this.isValidPhone(value)) {
                errors[field] = this.messages.invalidPhone;
            }

            if (value && fieldRules.date) {
                if (!this.isValidDate(value)) {
                    errors[field] = this.messages.invalidDate;
                } else if (fieldRules.noFuture && this.isFutureDate(value)) {
                    errors[field] = this.messages.futureDate;
                }
            }
        }

        return { isValid: Object.keys(errors).length === 0, errors };
    },

    /**
     * 에러 메시지 표시
     * @param {string} fieldId - 필드 ID
     * @param {string} message - 에러 메시지
     */
    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.add('border-red-500');

        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) existingError.remove();

        const errorEl = document.createElement('p');
        errorEl.className = 'error-message text-red-400 text-xs mt-1';
        errorEl.textContent = message;
        field.parentNode.appendChild(errorEl);
    },

    /**
     * 에러 메시지 제거
     * @param {string} fieldId - 필드 ID
     */
    clearError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.remove('border-red-500');
        const errorEl = field.parentNode.querySelector('.error-message');
        if (errorEl) errorEl.remove();
    },

    /**
     * 모든 에러 제거
     */
    clearAllErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.border-red-500').forEach(el => {
            el.classList.remove('border-red-500');
        });
    },

    // ===== 중량 위반 체크 관련 =====

    // 중량 제한 상수
    WEIGHT_LIMITS: {
        AXLE: 11.00,    // 축하중 제한 (톤)
        TOTAL: 44.00    // 총중량 제한 (톤)
    },

    /**
     * 위반 여부 체크
     * @param {string|number} value - 체크할 값
     * @param {number} limit - 제한 값
     * @returns {boolean} 위반 여부
     */
    isViolation(value, limit) {
        const num = parseFloat(value);
        return !isNaN(num) && num > limit;
    },

    /**
     * 시각적 강조 적용
     * @param {HTMLElement} inputElement - 대상 input 요소
     * @param {boolean} isViolating - 위반 여부
     */
    applyViolationHighlight(inputElement, isViolating) {
        if (!inputElement) return;

        if (isViolating) {
            // 위반 스타일 적용
            inputElement.classList.add('font-bold', 'text-red-600', 'bg-red-50', 'border-red-500');
            inputElement.classList.remove('border-gray-300');
            this.showWarningIcon(inputElement);
        } else {
            // 정상 스타일 복원
            inputElement.classList.remove('font-bold', 'text-red-600', 'bg-red-50', 'border-red-500');
            inputElement.classList.add('border-gray-300');
            this.hideWarningIcon(inputElement);
        }
    },

    /**
     * 경고 아이콘 표시
     * @param {HTMLElement} inputElement - 대상 input 요소
     */
    showWarningIcon(inputElement) {
        if (!inputElement || !inputElement.parentElement) return;

        // 이미 아이콘이 있으면 중복 생성 방지
        const existingIcon = inputElement.parentElement.querySelector('.warning-icon');
        if (existingIcon) return;

        // ⚠️ 아이콘 생성
        const icon = document.createElement('span');
        icon.className = 'warning-icon absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 text-sm pointer-events-none';
        icon.innerHTML = '⚠️';
        icon.title = '기준 초과!';

        // input의 부모 요소는 relative 포지션이어야 함
        inputElement.parentElement.style.position = 'relative';
        inputElement.parentElement.appendChild(icon);
    },

    /**
     * 경고 아이콘 제거
     * @param {HTMLElement} inputElement - 대상 input 요소
     */
    hideWarningIcon(inputElement) {
        if (!inputElement || !inputElement.parentElement) return;
        const icon = inputElement.parentElement.querySelector('.warning-icon');
        if (icon) icon.remove();
    },

    /**
     * 위반 체크 실행
     * @param {HTMLElement} inputElement - 대상 input 요소
     * @param {string|number} value - 체크할 값
     * @param {number} limit - 제한 값
     * @returns {boolean} 위반 여부
     */
    checkViolation(inputElement, value, limit) {
        const isViolating = this.isViolation(value, limit);
        this.applyViolationHighlight(inputElement, isViolating);
        return isViolating;
    },

    /**
     * 모든 중량 필드에 자동 적용
     * 페이지 로드 시 모든 중량 필드에 위반 체크 바인딩
     * @param {Object} options - 옵션 설정
     * @param {string} [options.axleMeasuredPrefix] - 측정결과 축하중 ID 접두사 (기본값: 'axle')
     * @param {string} [options.axleMeasuredSuffix] - 측정결과 축하중 ID 접미사 (기본값: 'Measured')
     * @param {string} [options.axleViolationPrefix] - 위반내역 축하중 ID 접두사 (기본값: 'axle')
     * @param {string} [options.axleViolationSuffix] - 위반내역 축하중 ID 접미사 (기본값: 'Violation')
     * @param {number} [options.axleCount] - 축 개수 (기본값: 8)
     */
    bindViolationChecks(options = {}) {
        const {
            axleMeasuredPrefix = 'axle',
            axleMeasuredSuffix = 'Measured',
            axleViolationPrefix = 'axle',
            axleViolationSuffix = 'Violation',
            axleCount = 8
        } = options;

        const self = this;

        // 축하중 input 이벤트 핸들러
        const handleAxleInput = (e) => {
            self.checkViolation(e.target, e.target.value, self.WEIGHT_LIMITS.AXLE);
        };

        // 1~8축 하중 (측정결과)
        for (let i = 1; i <= axleCount; i++) {
            const input = document.getElementById(`${axleMeasuredPrefix}${i}${axleMeasuredSuffix}`);
            if (input) {
                input.addEventListener('input', handleAxleInput);
            }
        }

        // 1~8축 하중 (위반내역)
        for (let i = 1; i <= axleCount; i++) {
            const input = document.getElementById(`${axleViolationPrefix}${i}${axleViolationSuffix}`);
            if (input) {
                input.addEventListener('input', handleAxleInput);
            }
        }

        // 총중량 Observer 설정 (프로그래밍 방식 값 변경 감지용)
        this.setupTotalWeightObserver('totalWeightMeasured');
        this.setupTotalWeightObserver('totalWeightViolation');
    },

    /**
     * 총중량 필드에 MutationObserver 설정
     * input 이벤트와 프로그래밍 방식 값 변경 모두 감지
     * @param {string} elementId - 총중량 input ID
     */
    setupTotalWeightObserver(elementId) {
        const totalWeightInput = document.getElementById(elementId);
        if (!totalWeightInput) return;

        const self = this;

        // input 이벤트 핸들러 (수동 입력용)
        const handleInput = () => {
            self.checkViolation(totalWeightInput, totalWeightInput.value, self.WEIGHT_LIMITS.TOTAL);
        };

        totalWeightInput.addEventListener('input', handleInput);

        // Object.defineProperty를 사용하여 value 변경 감지
        // (MutationObserver는 value 속성 변경을 감지하지 못함)
        const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
        const originalSet = descriptor.set;

        Object.defineProperty(totalWeightInput, 'value', {
            get: descriptor.get,
            set: function (newValue) {
                originalSet.call(this, newValue);
                // 값 설정 후 위반 체크 실행
                self.checkViolation(totalWeightInput, newValue, self.WEIGHT_LIMITS.TOTAL);
            },
            configurable: true
        });
    },

    /**
     * 모든 위반 하이라이트 제거
     */
    clearAllViolationHighlights() {
        document.querySelectorAll('.warning-icon').forEach(el => el.remove());
        document.querySelectorAll('.font-bold.text-red-600').forEach(el => {
            el.classList.remove('font-bold', 'text-red-600', 'bg-red-50', 'border-red-500');
            el.classList.add('border-gray-300');
        });
    }
};

// 전역 함수로도 노출 (calculator.js에서 사용 가능하도록)
window.checkViolation = function (inputElement, value, limit) {
    return VALIDATOR.checkViolation(inputElement, value, limit);
};

// WEIGHT_LIMITS도 전역으로 노출
window.WEIGHT_LIMITS = VALIDATOR.WEIGHT_LIMITS;

// 페이지 로드 시 자동 바인딩
document.addEventListener('DOMContentLoaded', () => {
    // report.html 페이지에서만 실행
    if (document.getElementById('totalWeightMeasured') || document.getElementById('axle1Measured')) {
        VALIDATOR.bindViolationChecks();
    }
});
