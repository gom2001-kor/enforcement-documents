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
    }
};
