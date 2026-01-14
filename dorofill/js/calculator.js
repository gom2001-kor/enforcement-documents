/**
 * DoroFill - Calculator
 * 자동 계산 로직 (과태료, 날짜 계산 등)
 */

const CALCULATOR = {
    // 과태료 기준표 (예시)
    fineRates: {
        first: 300000,    // 1차 위반
        second: 600000,   // 2차 위반
        third: 1000000    // 3차 이상
    },

    /**
     * 과태료 계산
     * @param {number} violationCount - 위반 횟수
     * @param {number} overweightKg - 초과 중량 (kg)
     * @returns {number} 과태료 금액
     */
    calculateFine(violationCount, overweightKg = 0) {
        let baseFine = this.fineRates.first;
        if (violationCount === 2) baseFine = this.fineRates.second;
        if (violationCount >= 3) baseFine = this.fineRates.third;

        // 초과 중량에 따른 추가 과태료 (예시)
        const additionalFine = Math.floor(overweightKg / 1000) * 50000;

        return baseFine + additionalFine;
    },

    /**
     * 금액 포맷팅 (원화)
     * @param {number} amount - 금액
     * @returns {string} 포맷된 금액 문자열
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    },

    /**
     * 납부 기한 계산 (적발일로부터 n일 후)
     * @param {Date} detectionDate - 적발일
     * @param {number} days - 기한 일수
     * @returns {Date} 납부 기한
     */
    calculateDueDate(detectionDate, days = 30) {
        const dueDate = new Date(detectionDate);
        dueDate.setDate(dueDate.getDate() + days);
        return dueDate;
    },

    /**
     * 초과 중량 계산
     * @param {number} actualWeight - 실제 중량
     * @param {number} allowedWeight - 허용 중량
     * @returns {number} 초과 중량
     */
    calculateOverweight(actualWeight, allowedWeight) {
        return Math.max(0, actualWeight - allowedWeight);
    },

    /**
     * 초과율 계산
     * @param {number} actualWeight - 실제 중량
     * @param {number} allowedWeight - 허용 중량
     * @returns {string} 초과율 (%)
     */
    calculateOverweightPercentage(actualWeight, allowedWeight) {
        if (allowedWeight <= 0) return '0%';
        const percentage = ((actualWeight - allowedWeight) / allowedWeight) * 100;
        return Math.max(0, percentage).toFixed(1) + '%';
    },

    /**
     * 총중량 자동 계산
     * 1~8축 하중을 합산하여 총중량 계산
     * @param {Array<string|number>} axleValues - 축하중 배열
     * @returns {number} 총중량 (소수점 2자리)
     */
    calculateTotalWeight(axleValues) {
        // 빈 값이나 NaN 처리
        const total = axleValues.reduce((sum, value) => {
            const num = parseFloat(value);
            return sum + (isNaN(num) ? 0 : num);
        }, 0);

        return parseFloat(total.toFixed(2));
    },

    /**
     * 실시간 계산 바인딩
     * 축하중 입력 필드들에 이벤트 리스너 등록
     * @param {Array<string>} axleInputIds - 축하중 input ID 배열
     * @param {string} totalWeightId - 총중량 input ID
     * @param {Object} options - 옵션 설정
     * @param {number} [options.limit] - 위반 기준값 (기본값: null, 체크하지 않음)
     * @param {Function} [options.onCalculate] - 계산 후 실행할 콜백 함수
     */
    bindTotalWeightCalculation(axleInputIds, totalWeightId, options = {}) {
        const axleInputs = axleInputIds
            .map(id => document.getElementById(id))
            .filter(input => input !== null); // null 요소 필터링

        const totalWeightInput = document.getElementById(totalWeightId);

        if (!totalWeightInput) {
            console.warn(`[Calculator] 총중량 input을 찾을 수 없습니다: ${totalWeightId}`);
            return;
        }

        // 계산 함수
        const calculateAndUpdate = () => {
            const values = axleInputs.map(inp => inp.value);
            const total = this.calculateTotalWeight(values);
            totalWeightInput.value = total;

            // 위반 체크 (limit이 설정된 경우에만)
            if (options.limit && typeof window.checkViolation === 'function') {
                window.checkViolation(totalWeightInput, total, options.limit);
            } else if (options.limit && typeof VALIDATOR !== 'undefined' && typeof VALIDATOR.checkViolation === 'function') {
                VALIDATOR.checkViolation(totalWeightInput, total, options.limit);
            }

            // 콜백 함수 실행
            if (typeof options.onCalculate === 'function') {
                options.onCalculate(total, axleInputs, totalWeightInput);
            }
        };

        // 모든 축하중 필드에 input 이벤트 등록
        axleInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', calculateAndUpdate);
            }
        });

        // 초기 계산 실행 (선택적)
        if (options.calculateOnInit) {
            calculateAndUpdate();
        }

        // 바인딩 해제 함수 반환 (필요시 cleanup 가능)
        return () => {
            axleInputs.forEach(input => {
                if (input) {
                    input.removeEventListener('input', calculateAndUpdate);
                }
            });
        };
    }
};
