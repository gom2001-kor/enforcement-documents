/**
 * DoroFill - PDF 채우기 함수
 * 적발보고서 및 진술서 PDF에 데이터를 삽입하는 함수들
 * 
 * 의존성:
 * - pdf-lib (CDN)
 * - pdf-handler.js
 * - pdf-coordinates.js
 */

// ==========================================================================
// 데이터 포맷 유틸리티
// ==========================================================================

/**
 * datetime-local 값을 분리된 날짜/시간 객체로 변환
 * @param {string} datetimeStr - "2026-01-13T23:30" 형식
 * @returns {Object} { year, month, day, hour, minute }
 */
function parseDatetime(datetimeStr) {
    if (!datetimeStr) return { year: '', month: '', day: '', hour: '', minute: '' };

    const [datePart, timePart] = datetimeStr.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = (timePart || '00:00').split(':');

    return {
        year: year || '',
        month: month || '',
        day: day || '',
        hour: hour || '',
        minute: minute || ''
    };
}

/**
 * date 값을 분리된 날짜 객체로 변환
 * @param {string} dateStr - "2026-01-13" 형식
 * @returns {Object} { year, month, day }
 */
function parseDate(dateStr) {
    if (!dateStr) return { year: '', month: '', day: '' };

    const [year, month, day] = dateStr.split('-');
    return { year: year || '', month: month || '', day: day || '' };
}

/**
 * 숫자 값을 안전하게 문자열로 변환
 * @param {any} value - 변환할 값
 * @param {number} decimals - 소수점 자릿수
 * @returns {string}
 */
function formatNumber(value, decimals = 2) {
    if (value === null || value === undefined || value === '') return '';
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return num.toFixed(decimals);
}

// ==========================================================================
// 적발 보고서 PDF 생성
// ==========================================================================

/**
 * 적발 보고서 PDF 생성
 * 
 * @param {Object} formData - 폼 데이터 객체
 * @param {File} templateFile - PDF 템플릿 파일
 * @returns {Promise<PDFLib.PDFDocument>} 완성된 PDF 문서
 */
async function fillReportPdf(formData, templateFile) {
    try {
        // 템플릿 로드
        const pdfDoc = await loadPdfTemplate(templateFile);
        const page = getPdfPage(pdfDoc, 0); // 첫 번째 페이지
        const coords = PDF_COORDINATES.page1;

        // 날짜/시간 파싱
        const datetime = parseDatetime(formData.reportDatetime);
        const authorDate = parseDate(formData.authorDate);

        // === 적발 일시 ===
        await addTextToPdf(page, datetime.year, coords.dateYear.x, coords.dateYear.y, { size: coords.dateYear.size });
        await addTextToPdf(page, datetime.month, coords.dateMonth.x, coords.dateMonth.y, { size: coords.dateMonth.size });
        await addTextToPdf(page, datetime.day, coords.dateDay.x, coords.dateDay.y, { size: coords.dateDay.size });
        await addTextToPdf(page, datetime.hour, coords.dateHour.x, coords.dateHour.y, { size: coords.dateHour.size });
        await addTextToPdf(page, datetime.minute, coords.dateMinute.x, coords.dateMinute.y, { size: coords.dateMinute.size });

        // === 적발 장소 ===
        if (formData.reportLocation) {
            await addTextToPdf(page, formData.reportLocation, coords.location.x, coords.location.y, { size: coords.location.size });
        }

        // === 운전자 정보 ===
        if (formData.driverName) {
            await addTextToPdf(page, formData.driverName, coords.driverName.x, coords.driverName.y, { size: coords.driverName.size });
        }
        if (formData.driverAddress) {
            await addTextToPdf(page, formData.driverAddress, coords.driverAddress.x, coords.driverAddress.y, { size: coords.driverAddress.size });
        }
        if (formData.phoneFixed) {
            await addTextToPdf(page, formData.phoneFixed, coords.phoneFixed.x, coords.phoneFixed.y, { size: coords.phoneFixed.size });
        }
        if (formData.phoneMobile) {
            await addTextToPdf(page, formData.phoneMobile, coords.phoneMobile.x, coords.phoneMobile.y, { size: coords.phoneMobile.size });
        }

        // === 차량 정보 ===
        if (formData.vehicleType) {
            await addTextToPdf(page, formData.vehicleType, coords.vehicleType.x, coords.vehicleType.y, { size: coords.vehicleType.size });
        }
        if (formData.plateNumber) {
            await addTextToPdf(page, formData.plateNumber, coords.plateNumber.x, coords.plateNumber.y, { size: coords.plateNumber.size });
        }
        if (formData.route) {
            await addTextToPdf(page, formData.route, coords.vehicleRoute.x, coords.vehicleRoute.y, { size: coords.vehicleRoute.size });
        }
        if (formData.cargo) {
            await addTextToPdf(page, formData.cargo, coords.cargo.x, coords.cargo.y, { size: coords.cargo.size });
        }

        // === 차량규격 ===
        const specFields = ['widthMeasured', 'heightMeasured', 'lengthMeasured', 'widthViolation', 'heightViolation', 'lengthViolation'];
        for (const field of specFields) {
            if (formData[field] && coords[field]) {
                await addTextToPdf(page, formatNumber(formData[field]), coords[field].x, coords[field].y, { size: coords[field].size });
            }
        }

        // === 차량중량 ===
        const weightFields = [
            'axle1Measured', 'axle2Measured', 'axle3Measured', 'axle4Measured',
            'axle5Measured', 'axle6Measured', 'axle7Measured', 'axle8Measured',
            'axle1Violation', 'axle2Violation', 'axle3Violation', 'axle4Violation',
            'axle5Violation', 'axle6Violation', 'axle7Violation', 'axle8Violation'
        ];

        for (const field of weightFields) {
            if (formData[field] && coords[field]) {
                await addTextToPdf(page, formatNumber(formData[field]), coords[field].x, coords[field].y, { size: coords[field].size });
            }
        }

        // 총중량 계산
        let totalMeasured = 0;
        let totalViolation = 0;
        for (let i = 1; i <= 8; i++) {
            totalMeasured += parseFloat(formData[`axle${i}Measured`]) || 0;
            totalViolation += parseFloat(formData[`axle${i}Violation`]) || 0;
        }

        if (totalMeasured > 0) {
            await addTextToPdf(page, formatNumber(totalMeasured), coords.totalWeightMeasured.x, coords.totalWeightMeasured.y, { size: coords.totalWeightMeasured.size });
        }
        if (totalViolation > 0) {
            await addTextToPdf(page, formatNumber(totalViolation), coords.totalWeightViolation.x, coords.totalWeightViolation.y, { size: coords.totalWeightViolation.size });
        }

        // === 작성자 정보 ===
        await addTextToPdf(page, authorDate.year, coords.authorYear.x, coords.authorYear.y, { size: coords.authorYear.size });
        await addTextToPdf(page, authorDate.month, coords.authorMonth.x, coords.authorMonth.y, { size: coords.authorMonth.size });
        await addTextToPdf(page, authorDate.day, coords.authorDay.x, coords.authorDay.y, { size: coords.authorDay.size });

        if (formData.authorOffice) {
            await addTextToPdf(page, formData.authorOffice, coords.authorOffice.x, coords.authorOffice.y, { size: coords.authorOffice.size });
        }
        if (formData.authorPosition) {
            await addTextToPdf(page, formData.authorPosition, coords.authorPosition.x, coords.authorPosition.y, { size: coords.authorPosition.size });
        }
        if (formData.authorName) {
            await addTextToPdf(page, formData.authorName, coords.authorName.x, coords.authorName.y, { size: coords.authorName.size });
        }

        console.log('적발 보고서 PDF 생성 완료');
        return pdfDoc;

    } catch (error) {
        console.error('적발 보고서 PDF 생성 실패:', error);
        throw error;
    }
}

// ==========================================================================
// 진술서 PDF 생성
// ==========================================================================

/**
 * 진술서 PDF 생성
 * 
 * @param {Object} formData - 폼 데이터 객체
 * @param {Array} witnesses - 진술인 데이터 배열
 * @param {File} templateFile - PDF 템플릿 파일
 * @returns {Promise<PDFLib.PDFDocument>} 완성된 PDF 문서
 */
async function fillStatementPdf(formData, witnesses, templateFile) {
    try {
        // 템플릿 로드
        const pdfDoc = await loadPdfTemplate(templateFile);
        const page = getPdfPage(pdfDoc, 1); // 두 번째 페이지 (진술서)
        const coords = PDF_COORDINATES.page2;

        // 날짜/시간 파싱
        const datetime = parseDatetime(formData.reportDatetime);
        const today = new Date();
        const statementDate = {
            year: today.getFullYear().toString(),
            month: String(today.getMonth() + 1).padStart(2, '0'),
            day: String(today.getDate()).padStart(2, '0')
        };

        // === 적발 일시 ===
        await addTextToPdf(page, datetime.year, coords.dateYear.x, coords.dateYear.y, { size: coords.dateYear.size });
        await addTextToPdf(page, datetime.month, coords.dateMonth.x, coords.dateMonth.y, { size: coords.dateMonth.size });
        await addTextToPdf(page, datetime.day, coords.dateDay.x, coords.dateDay.y, { size: coords.dateDay.size });
        await addTextToPdf(page, datetime.hour, coords.dateHour.x, coords.dateHour.y, { size: coords.dateHour.size });
        await addTextToPdf(page, datetime.minute, coords.dateMinute.x, coords.dateMinute.y, { size: coords.dateMinute.size });

        // === 적발 장소 ===
        if (formData.reportLocation) {
            await addTextToPdf(page, formData.reportLocation, coords.location.x, coords.location.y, { size: coords.location.size });
        }

        // === 차량 정보 ===
        if (formData.vehicleType) {
            await addTextToPdf(page, formData.vehicleType, coords.vehicleType.x, coords.vehicleType.y, { size: coords.vehicleType.size });
        }
        if (formData.plateNumber) {
            await addTextToPdf(page, formData.plateNumber, coords.plateNumber.x, coords.plateNumber.y, { size: coords.plateNumber.size });
        }

        // === 차량규격 ===
        const specFields = ['widthMeasured', 'heightMeasured', 'lengthMeasured', 'widthViolation', 'heightViolation', 'lengthViolation'];
        for (const field of specFields) {
            if (formData[field] && coords[field]) {
                await addTextToPdf(page, formatNumber(formData[field]), coords[field].x, coords[field].y, { size: coords[field].size });
            }
        }

        // === 차량중량 ===
        const weightFields = [
            'axle1Measured', 'axle2Measured', 'axle3Measured', 'axle4Measured',
            'axle5Measured', 'axle6Measured', 'axle7Measured', 'axle8Measured',
            'axle1Violation', 'axle2Violation', 'axle3Violation', 'axle4Violation',
            'axle5Violation', 'axle6Violation', 'axle7Violation', 'axle8Violation'
        ];

        for (const field of weightFields) {
            if (formData[field] && coords[field]) {
                await addTextToPdf(page, formatNumber(formData[field]), coords[field].x, coords[field].y, { size: coords[field].size });
            }
        }

        // 총중량 계산
        let totalMeasured = 0;
        let totalViolation = 0;
        for (let i = 1; i <= 8; i++) {
            totalMeasured += parseFloat(formData[`axle${i}Measured`]) || 0;
            totalViolation += parseFloat(formData[`axle${i}Violation`]) || 0;
        }

        if (totalMeasured > 0) {
            await addTextToPdf(page, formatNumber(totalMeasured), coords.totalWeightMeasured.x, coords.totalWeightMeasured.y, { size: coords.totalWeightMeasured.size });
        }
        if (totalViolation > 0) {
            await addTextToPdf(page, formatNumber(totalViolation), coords.totalWeightViolation.x, coords.totalWeightViolation.y, { size: coords.totalWeightViolation.size });
        }

        // === 진술 날짜 ===
        await addTextToPdf(page, statementDate.year, coords.statementYear.x, coords.statementYear.y, { size: coords.statementYear.size });
        await addTextToPdf(page, statementDate.month, coords.statementMonth.x, coords.statementMonth.y, { size: coords.statementMonth.size });
        await addTextToPdf(page, statementDate.day, coords.statementDay.x, coords.statementDay.y, { size: coords.statementDay.size });

        // === 진술인 정보 (최대 3명) ===
        if (witnesses && witnesses.length > 0) {
            for (let i = 0; i < Math.min(witnesses.length, 3); i++) {
                const w = witnesses[i];
                const witnessNum = i + 1;

                if (w.office && coords[`witness${witnessNum}Office`]) {
                    await addTextToPdf(page, w.office, coords[`witness${witnessNum}Office`].x, coords[`witness${witnessNum}Office`].y, { size: coords[`witness${witnessNum}Office`].size });
                }
                if (w.position && coords[`witness${witnessNum}Position`]) {
                    await addTextToPdf(page, w.position, coords[`witness${witnessNum}Position`].x, coords[`witness${witnessNum}Position`].y, { size: coords[`witness${witnessNum}Position`].size });
                }
                if (w.name && coords[`witness${witnessNum}Name`]) {
                    await addTextToPdf(page, w.name, coords[`witness${witnessNum}Name`].x, coords[`witness${witnessNum}Name`].y, { size: coords[`witness${witnessNum}Name`].size });
                }
            }
        }

        console.log('진술서 PDF 생성 완료');
        return pdfDoc;

    } catch (error) {
        console.error('진술서 PDF 생성 실패:', error);
        throw error;
    }
}

console.log('pdf-generator.js 로드 완료');
