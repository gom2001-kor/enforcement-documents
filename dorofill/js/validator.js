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
    }
};
