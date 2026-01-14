/**
 * DoroFill - PDF Handler
 * PDF 생성 및 처리 로직 (pdf-lib 사용)
 * 
 * 의존성: pdf-lib (CDN: https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js)
 * 
 * 주요 기능:
 * - PDF 템플릿 로드 (사용자 업로드 파일)
 * - 텍스트 삽입
 * - PDF 다운로드
 */

// ==========================================================================
// 설정 상수
// ==========================================================================

/**
 * PDF 문서 기본 설정
 * @constant {Object}
 */
const PDF_CONFIG = {
    // A4 크기 (포인트 단위: 1pt = 1/72 인치)
    pageWidth: 595.28,   // 210mm
    pageHeight: 841.89,  // 297mm

    // 여백 설정
    margin: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    },

    // 폰트 크기 설정
    fontSize: {
        title: 18,      // 제목
        subtitle: 14,   // 부제목
        body: 11,       // 본문
        small: 9        // 작은 글씨
    },

    // 기본 색상 (RGB 0-1 범위)
    colors: {
        black: { r: 0, g: 0, b: 0 },
        gray: { r: 0.5, g: 0.5, b: 0.5 },
        red: { r: 0.93, g: 0.27, b: 0.27 },
        blue: { r: 0.15, g: 0.39, b: 0.92 }
    }
};

// ==========================================================================
// 유틸리티 함수
// ==========================================================================

/**
 * pdf-lib 라이브러리 로드 확인
 * @throws {Error} 라이브러리가 로드되지 않은 경우
 */
function checkPdfLib() {
    if (typeof PDFLib === 'undefined') {
        throw new Error('pdf-lib 라이브러리가 로드되지 않았습니다. CDN 스크립트를 확인하세요.');
    }
}

/**
 * 오늘 날짜를 YYYYMMDD 형식으로 반환
 * @returns {string} 날짜 문자열 (예: "20260113")
 */
function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

/**
 * 페이지별 좌표 가져오기 (AI 좌표 우선, 수동 좌표 폴백)
 * @param {number} pageNum - 페이지 번호 (1 또는 2)
 * @returns {Object} 좌표 객체
 */
function getPageCoordinates(pageNum) {
    const pageKey = `page${pageNum}`;

    // AI 분석 좌표 우선 확인
    if (typeof GeminiAnalyzer !== 'undefined' && GeminiAnalyzer.hasCoordinates()) {
        const aiCoords = GeminiAnalyzer.loadCoordinates();
        if (aiCoords && aiCoords[pageKey]) {
            console.log(`[좌표] 페이지 ${pageNum}: AI 분석 좌표 사용`);
            // AI 좌표와 수동 좌표를 병합 (AI 우선, 누락된 필드는 수동 좌표 사용)
            const manualCoords = PDF_COORDINATES?.[pageKey] || {};
            return { ...manualCoords, ...aiCoords[pageKey] };
        }
    }

    // 수동 좌표 사용
    console.log(`[좌표] 페이지 ${pageNum}: 수동 좌표 사용`);
    return PDF_COORDINATES?.[pageKey] || {};
}


// ==========================================================================
// 기능 1: PDF 템플릿 로드
// ==========================================================================

/**
 * 사용자가 업로드한 PDF 파일을 로드하여 PDFDocument 객체로 반환
 * 
 * @param {File} file - 사용자가 선택한 PDF 파일 (input[type="file"]에서 가져옴)
 * @returns {Promise<PDFLib.PDFDocument>} 로드된 PDF 문서 객체
 * @throws {Error} 파일 읽기 실패 또는 PDF 파싱 실패 시
 * 
 * @example
 * // HTML: <input type="file" id="pdfInput" accept=".pdf">
 * const fileInput = document.getElementById('pdfInput');
 * const file = fileInput.files[0];
 * const pdfDoc = await loadPdfTemplate(file);
 */
async function loadPdfTemplate(file) {
    try {
        // pdf-lib 로드 확인
        checkPdfLib();

        // 파일 유효성 검사
        if (!file) {
            throw new Error('파일이 선택되지 않았습니다.');
        }

        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            throw new Error('PDF 파일만 업로드할 수 있습니다.');
        }

        // File 객체를 ArrayBuffer로 변환
        const arrayBuffer = await file.arrayBuffer();

        // PDFDocument.load()로 PDF 문서 로드
        // ignoreEncryption: true - 암호화된 PDF도 시도 (비밀번호 없는 경우만)
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, {
            ignoreEncryption: true
        });

        console.log(`PDF 템플릿 로드 완료: ${file.name} (${pdfDoc.getPageCount()}페이지)`);

        return pdfDoc;

    } catch (error) {
        console.error('PDF 템플릿 로드 실패:', error);

        // 사용자 친화적 에러 메시지
        if (error.message.includes('encrypted')) {
            throw new Error('암호로 보호된 PDF는 열 수 없습니다.');
        } else if (error.message.includes('Invalid')) {
            throw new Error('손상되었거나 유효하지 않은 PDF 파일입니다.');
        }

        throw error;
    }
}

// ==========================================================================
// 기능 2: 페이지 가져오기
// ==========================================================================

/**
 * PDF 문서에서 특정 페이지를 가져옴
 * 
 * @param {PDFLib.PDFDocument} pdfDoc - PDF 문서 객체
 * @param {number} pageNumber - 페이지 번호 (0부터 시작, 0 = 첫 번째 페이지)
 * @returns {PDFLib.PDFPage} 해당 페이지 객체
 * @throws {Error} 유효하지 않은 페이지 번호
 * 
 * @example
 * const page = getPdfPage(pdfDoc, 0); // 첫 번째 페이지
 * const page2 = getPdfPage(pdfDoc, 1); // 두 번째 페이지
 */
function getPdfPage(pdfDoc, pageNumber = 0) {
    try {
        const pages = pdfDoc.getPages();
        const totalPages = pages.length;

        // 페이지 번호 유효성 검사
        if (pageNumber < 0 || pageNumber >= totalPages) {
            throw new Error(`유효하지 않은 페이지 번호입니다. (0~${totalPages - 1} 사이 입력)`);
        }

        return pages[pageNumber];

    } catch (error) {
        console.error('페이지 가져오기 실패:', error);
        throw error;
    }
}

/**
 * PDF 문서의 총 페이지 수 반환
 * 
 * @param {PDFLib.PDFDocument} pdfDoc - PDF 문서 객체
 * @returns {number} 총 페이지 수
 */
function getPageCount(pdfDoc) {
    return pdfDoc.getPageCount();
}

// ==========================================================================
// 기능 3: 텍스트 삽입
// ==========================================================================

/**
 * PDF 페이지에 텍스트를 삽입 (한글 지원)
 * 
 * @param {PDFLib.PDFPage} page - 텍스트를 추가할 페이지
 * @param {string} text - 삽입할 텍스트
 * @param {number} x - X 좌표 (왼쪽에서부터, 포인트 단위)
 * @param {number} y - Y 좌표 (아래에서부터, 포인트 단위 - PDF는 좌하단이 원점)
 * @param {Object} options - 텍스트 옵션
 * @param {number} [options.size=11] - 폰트 크기
 * @param {Object} [options.color={r:0,g:0,b:0}] - RGB 색상 (0-1 범위)
 * @param {boolean} [options.isBold=false] - 볼드체 여부
 * @returns {Promise<void>}
 * 
 * @example
 * // 기본 텍스트
 * await addTextToPdf(page, '안녕하세요', 100, 700);
 * 
 * // 볼드 + 큰 글씨 + 빨간색
 * await addTextToPdf(page, '중요!', 100, 650, { 
 *     size: 16, 
 *     isBold: true, 
 *     color: { r: 1, g: 0, b: 0 } 
 * });
 */

// 캐시된 폰트 (한번 로드 후 재사용)
let cachedKoreanFont = null;
let cachedKoreanFontBold = null;

async function addTextToPdf(page, text, x, y, options = {}) {
    try {
        // pdf-lib 로드 확인
        checkPdfLib();

        // 빈 텍스트 무시
        if (!text || text.trim() === '') {
            return;
        }

        // 옵션 기본값 설정
        const {
            size = PDF_CONFIG.fontSize.body,
            color = PDF_CONFIG.colors.black,
            isBold = false
        } = options;

        // PDF 문서 가져오기 (페이지에서 역참조)
        const pdfDoc = page.doc;

        // 한글 포함 여부 확인
        const hasKorean = /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(text);

        let font;

        if (hasKorean) {
            // ============================================================
            // 한글 폰트 로드 (Noto Sans KR)
            // ============================================================

            // fontkit 등록 (한번만)
            if (typeof fontkit !== 'undefined' && !pdfDoc.fonts) {
                pdfDoc.registerFontkit(fontkit);
            }

            // 캐시된 폰트 사용 또는 새로 로드
            const cacheKey = isBold ? 'bold' : 'regular';

            if (!cachedKoreanFont && !isBold) {
                // Noto Sans KR Regular 로드
                const fontUrl = 'https://cdn.jsdelivr.net/gh/nickshanks/Allsorts@master/user/test-fonts/NotoSansKR-Regular.otf';
                try {
                    const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
                    cachedKoreanFont = await pdfDoc.embedFont(fontBytes);
                } catch (e) {
                    console.warn('[폰트] Noto Sans KR 로드 실패, Helvetica 대체 사용');
                    // 한글 제거 후 영문만 출력
                    const asciiOnly = text.replace(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g, '?');
                    font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
                    page.drawText(asciiOnly, { x, y, size, font, color: PDFLib.rgb(color.r, color.g, color.b) });
                    return;
                }
            }

            if (!cachedKoreanFontBold && isBold) {
                // Noto Sans KR Bold 로드
                const fontUrl = 'https://cdn.jsdelivr.net/gh/nickshanks/Allsorts@master/user/test-fonts/NotoSansKR-Bold.otf';
                try {
                    const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
                    cachedKoreanFontBold = await pdfDoc.embedFont(fontBytes);
                } catch (e) {
                    console.warn('[폰트] Noto Sans KR Bold 로드 실패, Regular 사용');
                    cachedKoreanFontBold = cachedKoreanFont;
                }
            }

            font = isBold ? (cachedKoreanFontBold || cachedKoreanFont) : cachedKoreanFont;

            // 폰트 로드 실패 시 fallback
            if (!font) {
                console.warn('[폰트] 한글 폰트 없음, 영문만 출력');
                const asciiOnly = text.replace(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g, '?');
                font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
                page.drawText(asciiOnly, { x, y, size, font, color: PDFLib.rgb(color.r, color.g, color.b) });
                return;
            }

        } else {
            // ============================================================
            // 영문/숫자만: 기본 Helvetica 사용 (가벼움)
            // ============================================================
            const fontName = isBold
                ? PDFLib.StandardFonts.HelveticaBold
                : PDFLib.StandardFonts.Helvetica;
            font = await pdfDoc.embedFont(fontName);
        }

        // 텍스트 그리기
        page.drawText(text, {
            x: x,
            y: y,
            size: size,
            font: font,
            color: PDFLib.rgb(color.r, color.g, color.b)
        });

    } catch (error) {
        console.error('텍스트 삽입 실패:', error);
        throw new Error(`텍스트 삽입 중 오류가 발생했습니다: ${error.message}`);
    }
}

/**
 * 여러 줄의 텍스트를 PDF 페이지에 삽입 (자동 줄바꿈)
 * 
 * @param {PDFLib.PDFPage} page - 텍스트를 추가할 페이지
 * @param {string[]} lines - 삽입할 텍스트 배열 (각 요소가 한 줄)
 * @param {number} x - X 좌표
 * @param {number} y - 시작 Y 좌표 (첫 줄 위치)
 * @param {Object} options - 텍스트 옵션
 * @param {number} [options.lineHeight=14] - 줄 간격
 * @returns {Promise<number>} 마지막 Y 좌표 (다음 내용 시작 위치)
 */
async function addMultilineText(page, lines, x, y, options = {}) {
    const { lineHeight = 14, ...textOptions } = options;
    let currentY = y;

    for (const line of lines) {
        await addTextToPdf(page, line, x, currentY, textOptions);
        currentY -= lineHeight;
    }

    return currentY;
}

// ==========================================================================
// 기능 4: PDF 다운로드
// ==========================================================================

/**
 * PDFDocument를 파일로 다운로드 (크로스 브라우저 호환)
 * 
 * iOS Safari에서는 a.download 속성이 제대로 작동하지 않아
 * DataURL 방식과 새 탭 열기를 조합하여 처리합니다.
 * 
 * @param {PDFLib.PDFDocument} pdfDoc - 다운로드할 PDF 문서
 * @param {string} filename - 파일명 (확장자 제외, 자동으로 .pdf 추가됨)
 * @returns {Promise<void>}
 * 
 * @example
 * // 적발 보고서 다운로드
 * await downloadPdf(pdfDoc, '적발보고서');
 * // 결과: "적발보고서_20260113.pdf" 다운로드
 */
async function downloadPdf(pdfDoc, filename = '문서') {
    try {
        // PDFDocument를 Uint8Array로 변환
        const pdfBytes = await pdfDoc.save();

        // 파일명 생성 (한글 + 날짜 + .pdf)
        const dateStr = getTodayString();
        const fullFilename = `${filename}_${dateStr}.pdf`;

        // Blob 생성
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        // 브라우저 감지
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
        const isIOSSafari = isIOS && isSafari;

        if (isIOSSafari) {
            // =================================================================
            // iOS Safari 대응: DataURL 방식 + 새 탭 열기
            // iOS Safari에서는 a.download가 작동하지 않음
            // =================================================================
            console.log('[downloadPdf] iOS Safari 감지 - DataURL 방식 사용');

            const reader = new FileReader();
            reader.onloadend = function () {
                // 새 탭에서 PDF 열기 (사용자가 저장해야 함)
                const pdfWindow = window.open('', '_blank');
                if (pdfWindow) {
                    pdfWindow.location.href = reader.result;

                    if (typeof showToast === 'function') {
                        showToast('PDF가 열렸습니다. 공유 버튼을 눌러 저장하세요.', 'info', 5000);
                    }
                } else {
                    // 팝업 차단 시 fallback
                    const link = document.createElement('a');
                    link.href = reader.result;
                    link.download = fullFilename;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            };
            reader.onerror = function () {
                throw new Error('PDF 변환 중 오류가 발생했습니다.');
            };
            reader.readAsDataURL(blob);

        } else if (isIOS) {
            // =================================================================
            // iOS Chrome/Firefox 등: Blob URL + 새 탭
            // =================================================================
            console.log('[downloadPdf] iOS 기타 브라우저 - Blob URL + 새 탭');

            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');

            setTimeout(() => URL.revokeObjectURL(url), 60000);

            if (typeof showToast === 'function') {
                showToast('PDF가 열렸습니다. 공유 버튼을 눌러 저장하세요.', 'info', 5000);
            }

        } else {
            // =================================================================
            // 일반 브라우저 (Android, Desktop): 표준 다운로드
            // =================================================================
            console.log('[downloadPdf] 표준 다운로드 방식');

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fullFilename;

            // DOM에 추가하고 클릭 (일부 브라우저 호환성)
            document.body.appendChild(link);
            link.click();

            // 정리
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);

            if (typeof showToast === 'function') {
                showToast(`${fullFilename} 다운로드 완료`, 'success');
            }
        }

        console.log(`PDF 다운로드 처리 완료: ${fullFilename}`);

    } catch (error) {
        console.error('PDF 다운로드 실패:', error);

        if (typeof showToast === 'function') {
            showToast('PDF 다운로드에 실패했습니다', 'error');
        }

        throw new Error('PDF 다운로드 중 오류가 발생했습니다.');
    }
}

/**
 * PDF를 브라우저 새 탭에서 미리보기
 * 
 * @param {PDFLib.PDFDocument} pdfDoc - 미리볼 PDF 문서
 * @returns {Promise<void>}
 */
async function previewPdf(pdfDoc) {
    try {
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // 새 탭에서 열기
        window.open(url, '_blank');

        // URL 정리는 일정 시간 후 (탭이 열리는 동안 유지)
        setTimeout(() => URL.revokeObjectURL(url), 60000);

    } catch (error) {
        console.error('PDF 미리보기 실패:', error);
        throw new Error('PDF 미리보기 중 오류가 발생했습니다.');
    }
}

// ==========================================================================
// 새 PDF 문서 생성 (템플릿 없이)
// ==========================================================================

/**
 * 빈 PDF 문서 생성
 * 
 * @returns {Promise<PDFLib.PDFDocument>} 새 PDF 문서
 */
async function createPdfDocument() {
    try {
        checkPdfLib();
        return await PDFLib.PDFDocument.create();
    } catch (error) {
        console.error('PDF 문서 생성 실패:', error);
        throw error;
    }
}

/**
 * PDF 문서에 새 페이지 추가
 * 
 * @param {PDFLib.PDFDocument} pdfDoc - PDF 문서
 * @param {number} [width=595.28] - 페이지 너비 (기본: A4)
 * @param {number} [height=841.89] - 페이지 높이 (기본: A4)
 * @returns {PDFLib.PDFPage} 추가된 페이지
 */
function addPage(pdfDoc, width = PDF_CONFIG.pageWidth, height = PDF_CONFIG.pageHeight) {
    return pdfDoc.addPage([width, height]);
}

// ==========================================================================
// 공통 헬퍼 함수: PDF 생성 로직 재사용
// ==========================================================================

/**
 * 위반 기준 상수
 * @constant {Object}
 */
const VIOLATION_LIMITS = {
    AXLE: 11.00,   // 축하중 제한 (톤) - 이 값 초과 시 위반
    TOTAL: 44.00   // 총중량 제한 (톤) - 이 값 초과 시 위반
};

/**
 * PDF 생성 시작 처리
 * 로딩 인디케이터 표시 및 템플릿 로드
 * 
 * @param {File} templateFile - 업로드된 PDF 템플릿
 * @param {string} loadingMessage - 로딩 메시지
 * @returns {Promise<PDFLib.PDFDocument>} 로드된 PDF 문서
 */
async function startPdfGeneration(templateFile, loadingMessage) {
    if (typeof showLoading === 'function') {
        showLoading(loadingMessage);
    }
    return await loadPdfTemplate(templateFile);
}

/**
 * PDF 생성 완료 처리
 * 다운로드 및 성공 메시지 표시
 * 
 * @param {PDFLib.PDFDocument} pdfDoc - PDF 문서
 * @param {string} filename - 파일명 (확장자 제외)
 * @param {string} successMessage - 성공 메시지
 */
async function completePdfGeneration(pdfDoc, filename, successMessage) {
    await downloadPdf(pdfDoc, filename);

    if (typeof hideLoading === 'function') {
        hideLoading();
    }
    if (typeof showToast === 'function') {
        showToast(successMessage, 'success');
    }
}

/**
 * PDF 생성 오류 처리
 * 
 * @param {Error} error - 에러 객체
 * @param {string} context - 에러 발생 컨텍스트
 */
function handlePdfError(error, context) {
    console.error(`[${context}] PDF 생성 실패:`, error);

    if (typeof hideLoading === 'function') {
        hideLoading();
    }
    if (typeof showToast === 'function') {
        showToast('PDF 생성 중 오류가 발생했습니다: ' + error.message, 'error');
    }
}

/**
 * 적발 일시 삽입 (년, 월, 일, 시, 분)
 * 
 * @param {PDFLib.PDFPage} page - PDF 페이지
 * @param {Object} datetime - 파싱된 날짜/시간 객체
 * @param {Object} coords - 좌표 설정 객체
 */
async function insertDatetimeFields(page, datetime, coords) {
    await addTextToPdf(page, datetime.year, coords.dateYear.x, coords.dateYear.y, { size: coords.dateYear.size });
    await addTextToPdf(page, datetime.month, coords.dateMonth.x, coords.dateMonth.y, { size: coords.dateMonth.size });
    await addTextToPdf(page, datetime.day, coords.dateDay.x, coords.dateDay.y, { size: coords.dateDay.size });
    await addTextToPdf(page, datetime.hour, coords.dateHour.x, coords.dateHour.y, { size: coords.dateHour.size });
    await addTextToPdf(page, datetime.minute, coords.dateMinute.x, coords.dateMinute.y, { size: coords.dateMinute.size });
}

/**
 * 차량규격 삽입 (너비, 높이, 길이 - 측정결과 및 위반내역)
 * 
 * @param {PDFLib.PDFPage} page - PDF 페이지
 * @param {Object} formData - 폼 데이터
 * @param {Object} coords - 좌표 설정 객체
 */
async function insertVehicleSpecs(page, formData, coords) {
    const specFields = ['widthMeasured', 'heightMeasured', 'lengthMeasured',
        'widthViolation', 'heightViolation', 'lengthViolation'];

    for (const field of specFields) {
        if (formData[field] && coords[field]) {
            const value = parseFloat(formData[field]);
            if (!isNaN(value)) {
                await addTextToPdf(
                    page,
                    value.toFixed(2),
                    coords[field].x,
                    coords[field].y,
                    { size: coords[field].size }
                );
            }
        }
    }
}

/**
 * 축하중 측정값 삽입 (1~8축, 조건부 굵기 + 색상)
 * 
 * @param {PDFLib.PDFPage} page - PDF 페이지
 * @param {Object} formData - 폼 데이터
 * @param {Object} coords - 좌표 설정 객체
 * @returns {Promise<number>} 총 측정중량
 */
async function insertAxleMeasurements(page, formData, coords) {
    let totalMeasured = 0;

    for (let i = 1; i <= 8; i++) {
        const fieldName = `axle${i}Measured`;
        const axleValue = parseFloat(formData[fieldName]);

        if (!isNaN(axleValue) && axleValue > 0 && coords[fieldName]) {
            totalMeasured += axleValue;
            const isViolation = axleValue > VIOLATION_LIMITS.AXLE;

            await addTextToPdf(
                page,
                axleValue.toFixed(2),
                coords[fieldName].x,
                coords[fieldName].y,
                {
                    size: coords[fieldName].size,
                    isBold: isViolation,
                    color: isViolation ? PDF_CONFIG.colors.red : PDF_CONFIG.colors.black
                }
            );
        }
    }

    return totalMeasured;
}

/**
 * 축하중 위반내역 삽입 (1~8축)
 * 
 * @param {PDFLib.PDFPage} page - PDF 페이지
 * @param {Object} formData - 폼 데이터
 * @param {Object} coords - 좌표 설정 객체
 * @returns {Promise<number>} 총 위반중량
 */
async function insertAxleViolations(page, formData, coords) {
    let totalViolation = 0;

    for (let i = 1; i <= 8; i++) {
        const fieldName = `axle${i}Violation`;
        const axleValue = parseFloat(formData[fieldName]);

        if (!isNaN(axleValue) && axleValue > 0 && coords[fieldName]) {
            totalViolation += axleValue;
            await addTextToPdf(
                page,
                axleValue.toFixed(2),
                coords[fieldName].x,
                coords[fieldName].y,
                { size: coords[fieldName].size }
            );
        }
    }

    return totalViolation;
}

/**
 * 총중량 삽입 (측정값 및 위반값, 조건부 굵기 + 색상)
 * 
 * @param {PDFLib.PDFPage} page - PDF 페이지
 * @param {number} totalMeasured - 총 측정중량
 * @param {number} totalViolation - 총 위반중량
 * @param {Object} coords - 좌표 설정 객체
 */
async function insertTotalWeights(page, totalMeasured, totalViolation, coords) {
    // 총중량 측정결과
    if (totalMeasured > 0 && coords.totalWeightMeasured) {
        const isTotalViolation = totalMeasured > VIOLATION_LIMITS.TOTAL;

        await addTextToPdf(
            page,
            totalMeasured.toFixed(2),
            coords.totalWeightMeasured.x,
            coords.totalWeightMeasured.y,
            {
                size: coords.totalWeightMeasured.size,
                isBold: isTotalViolation,
                color: isTotalViolation ? PDF_CONFIG.colors.red : PDF_CONFIG.colors.black
            }
        );
    }

    // 총중량 위반내역
    if (totalViolation > 0 && coords.totalWeightViolation) {
        await addTextToPdf(
            page,
            totalViolation.toFixed(2),
            coords.totalWeightViolation.x,
            coords.totalWeightViolation.y,
            { size: coords.totalWeightViolation.size }
        );
    }
}

/**
 * 차량중량 전체 삽입 (측정결과 + 위반내역 + 총중량, 조건부 굵기 적용)
 * 
 * @param {PDFLib.PDFPage} page - PDF 페이지
 * @param {Object} formData - 폼 데이터
 * @param {Object} coords - 좌표 설정 객체
 */
async function insertAxleWeights(page, formData, coords) {
    // 축하중 측정결과 삽입 및 총합 계산
    const totalMeasured = await insertAxleMeasurements(page, formData, coords);

    // 축하중 위반내역 삽입 및 총합 계산
    const totalViolation = await insertAxleViolations(page, formData, coords);

    // 총중량 삽입
    await insertTotalWeights(page, totalMeasured, totalViolation, coords);
}

/**
 * 진술인 정보 삽입 (동적 개수, 최대 3명)
 * 
 * @param {PDFLib.PDFPage} page - PDF 페이지
 * @param {Array<Object>} witnesses - 진술인 배열 [{office, position, name}, ...]
 * @param {Object} coords - 좌표 설정 객체
 */
async function insertWitnesses(page, witnesses, coords) {
    if (!witnesses || witnesses.length === 0) return;

    const maxWitnesses = Math.min(witnesses.length, 3);

    for (let i = 0; i < maxWitnesses; i++) {
        const w = witnesses[i];
        const witnessNum = i + 1;

        // 소속
        if (w.office && coords[`witness${witnessNum}Office`]) {
            await addTextToPdf(
                page,
                w.office,
                coords[`witness${witnessNum}Office`].x,
                coords[`witness${witnessNum}Office`].y,
                { size: coords[`witness${witnessNum}Office`].size }
            );
        }

        // 직급
        if (w.position && coords[`witness${witnessNum}Position`]) {
            await addTextToPdf(
                page,
                w.position,
                coords[`witness${witnessNum}Position`].x,
                coords[`witness${witnessNum}Position`].y,
                { size: coords[`witness${witnessNum}Position`].size }
            );
        }

        // 성명
        if (w.name && coords[`witness${witnessNum}Name`]) {
            await addTextToPdf(
                page,
                w.name,
                coords[`witness${witnessNum}Name`].x,
                coords[`witness${witnessNum}Name`].y,
                { size: coords[`witness${witnessNum}Name`].size }
            );
        }
    }
}

// ==========================================================================
// 기능 5: 적발 보고서 PDF 생성 (메인 함수)
// ==========================================================================

/**
 * 적발 보고서 PDF 생성 메인 함수
 * 
 * 이 함수는 사용자가 입력한 폼 데이터를 PDF 템플릿에 채워넣고 다운로드합니다.
 * 위반 기준(축하중 > 11.00톤, 총중량 > 44.00톤)을 초과한 값은 굵은 글씨로 표시됩니다.
 * 
 * @param {File} templateFile - 사용자가 업로드한 PDF 템플릿 파일
 * @param {Object} formData - 폼에서 수집한 데이터 객체
 * @param {string} formData.reportDatetime - 적발 일시 ("2026-01-13T23:30" 형식)
 * @param {string} formData.reportLocation - 적발 위치
 * @param {string} formData.driverName - 운전자 성명
 * @param {string} formData.driverAddress - 운전자 주소
 * @param {string} formData.phoneFixed - 일반전화번호
 * @param {string} formData.phoneMobile - 휴대전화번호
 * @param {string} formData.vehicleType - 차종
 * @param {string} formData.plateNumber - 차량 등록번호
 * @param {string} formData.route - 운행경로
 * @param {string} formData.cargo - 적재물
 * @param {string} formData.widthMeasured - 너비 측정결과 (m)
 * @param {string} formData.heightMeasured - 높이 측정결과 (m)
 * @param {string} formData.lengthMeasured - 길이 측정결과 (m)
 * @param {string} formData.widthViolation - 너비 위반내역 (m)
 * @param {string} formData.heightViolation - 높이 위반내역 (m)
 * @param {string} formData.lengthViolation - 길이 위반내역 (m)
 * @param {string} formData.axle1Measured ~ axle8Measured - 1~8축 측정결과 (톤)
 * @param {string} formData.axle1Violation ~ axle8Violation - 1~8축 위반내역 (톤)
 * @param {string} formData.authorDate - 작성 년월일 ("2026-01-13" 형식)
 * @param {string} formData.authorOffice - 작성자 소속
 * @param {string} formData.authorPosition - 작성자 직급
 * @param {string} formData.authorName - 작성자 성명
 * @returns {Promise<void>}
 * 
 * @example
 * // HTML에서 사용
 * const templateFile = document.getElementById('pdfTemplateInput').files[0];
 * const formData = collectFormData(); // 폼 데이터 수집 함수
 * await generateReportPdf(templateFile, formData);
 */
async function generateReportPdf(templateFile, formData) {
    try {
        // =====================================================================
        // Step 1: PDF 생성 시작 (로딩 + 템플릿 로드)
        // =====================================================================
        console.log('[generateReportPdf] PDF 생성 시작');
        const pdfDoc = await startPdfGeneration(templateFile, 'PDF 생성 중...');
        const page = getPdfPage(pdfDoc, 0);  // 첫 번째 페이지 (적발 보고서)
        const coords = getPageCoordinates(1);  // AI 좌표 우선, 수동 좌표 폴백

        // =====================================================================
        // Step 2: 일시 데이터 파싱
        // =====================================================================
        const datetime = parseDatetimeForPdf(formData.reportDatetime);
        const authorDate = parseDateForPdf(formData.authorDate);

        // =====================================================================
        // Step 3: 기본 정보 삽입 (적발 일시 + 장소)
        // =====================================================================
        console.log('[generateReportPdf] 기본 정보 삽입 중');
        await insertDatetimeFields(page, datetime, coords);

        if (formData.reportLocation) {
            await addTextToPdf(page, formData.reportLocation, coords.location.x, coords.location.y, { size: coords.location.size });
        }

        // =====================================================================
        // Step 4: 운전자 정보 삽입
        // =====================================================================
        console.log('[generateReportPdf] 운전자 정보 삽입 중');

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

        // =====================================================================
        // Step 5: 차량 정보 삽입
        // =====================================================================
        console.log('[generateReportPdf] 차량 정보 삽입 중');

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

        // =====================================================================
        // Step 6: 차량규격 삽입 (너비, 높이, 길이) - 공통 헬퍼 사용
        // =====================================================================
        console.log('[generateReportPdf] 차량규격 삽입 중');
        await insertVehicleSpecs(page, formData, coords);

        // =====================================================================
        // Step 7: 차량중량 삽입 (측정결과 + 위반내역 + 총중량) - 공통 헬퍼 사용
        // =====================================================================
        console.log('[generateReportPdf] 차량중량 삽입 중');
        await insertAxleWeights(page, formData, coords);

        // =====================================================================
        // Step 8: 작성자 정보 삽입
        // =====================================================================
        console.log('[generateReportPdf] 작성자 정보 삽입 중');

        // 작성 년월일
        await addTextToPdf(page, authorDate.year, coords.authorYear.x, coords.authorYear.y, { size: coords.authorYear.size });
        await addTextToPdf(page, authorDate.month, coords.authorMonth.x, coords.authorMonth.y, { size: coords.authorMonth.size });
        await addTextToPdf(page, authorDate.day, coords.authorDay.x, coords.authorDay.y, { size: coords.authorDay.size });

        // 소속, 직급, 성명
        if (formData.authorOffice) {
            await addTextToPdf(page, formData.authorOffice, coords.authorOffice.x, coords.authorOffice.y, { size: coords.authorOffice.size });
        }
        if (formData.authorPosition) {
            await addTextToPdf(page, formData.authorPosition, coords.authorPosition.x, coords.authorPosition.y, { size: coords.authorPosition.size });
        }
        if (formData.authorName) {
            await addTextToPdf(page, formData.authorName, coords.authorName.x, coords.authorName.y, { size: coords.authorName.size });
        }

        // =====================================================================
        // Step 9: PDF 생성 완료 (다운로드 + 성공 메시지)
        // =====================================================================
        console.log('[generateReportPdf] PDF 다운로드 시작');
        await completePdfGeneration(pdfDoc, '적발보고서', 'PDF가 생성되었습니다!');

        console.log('[generateReportPdf] 적발 보고서 PDF 생성 완료');

    } catch (error) {
        handlePdfError(error, 'generateReportPdf');
        throw error;
    }
}

// ==========================================================================
// 기능 6: 진술서 PDF 생성 (메인 함수)
// ==========================================================================

/**
 * 위반 진술서 PDF 생성 메인 함수
 * 
 * 진술서는 PDF의 두 번째 페이지(page2)에 작성됩니다.
 * 진술인 정보는 최대 3명까지 PDF에 삽입됩니다.
 * 
 * @param {File} templateFile - 사용자가 업로드한 PDF 템플릿 파일
 * @param {Object} formData - 폼에서 수집한 데이터 객체
 * @param {Array<Object>} witnesses - 진술인 정보 배열
 * @param {string} witnesses[].office - 진술인 소속
 * @param {string} witnesses[].position - 진술인 직급
 * @param {string} witnesses[].name - 진술인 성명
 * @returns {Promise<void>}
 * 
 * @example
 * const witnesses = [
 *   { office: '보은국토관리사무소', position: '운행제한단속원', name: '이용준' },
 *   { office: '보은국토관리사무소', position: '운행제한단속원', name: '김철수' }
 * ];
 * await generateStatementPdf(templateFile, formData, witnesses);
 */
async function generateStatementPdf(templateFile, formData, witnesses = []) {
    try {
        // =====================================================================
        // Step 1: PDF 생성 시작 (로딩 + 템플릿 로드)
        // =====================================================================
        console.log('[generateStatementPdf] PDF 생성 시작');
        const pdfDoc = await startPdfGeneration(templateFile, '진술서 PDF 생성 중...');
        const page = getPdfPage(pdfDoc, 1);  // 두 번째 페이지 (진술서)
        const coords = getPageCoordinates(2);  // AI 좌표 우선, 수동 좌표 폴백

        // =====================================================================
        // Step 2: 일시 데이터 파싱
        // =====================================================================
        const datetime = parseDatetimeForPdf(formData.reportDatetime);

        // 진술 작성일 (오늘 날짜)
        const today = new Date();
        const statementDate = {
            year: today.getFullYear().toString(),
            month: String(today.getMonth() + 1).padStart(2, '0'),
            day: String(today.getDate()).padStart(2, '0')
        };

        // =====================================================================
        // Step 3: 기본 정보 삽입 (적발 일시 + 장소)
        // =====================================================================
        console.log('[generateStatementPdf] 기본 정보 삽입 중');
        await insertDatetimeFields(page, datetime, coords);

        if (formData.reportLocation) {
            await addTextToPdf(page, formData.reportLocation, coords.location.x, coords.location.y, { size: coords.location.size });
        }

        // =====================================================================
        // Step 4: 차량 정보 삽입
        // =====================================================================
        console.log('[generateStatementPdf] 차량 정보 삽입 중');

        if (formData.vehicleType) {
            await addTextToPdf(page, formData.vehicleType, coords.vehicleType.x, coords.vehicleType.y, { size: coords.vehicleType.size });
        }
        if (formData.plateNumber) {
            await addTextToPdf(page, formData.plateNumber, coords.plateNumber.x, coords.plateNumber.y, { size: coords.plateNumber.size });
        }

        // =====================================================================
        // Step 5: 차량규격 삽입 (너비, 높이, 길이) - 공통 헬퍼 사용
        // =====================================================================
        console.log('[generateStatementPdf] 차량규격 삽입 중');
        await insertVehicleSpecs(page, formData, coords);

        // =====================================================================
        // Step 6: 차량중량 삽입 (측정결과 + 위반내역 + 총중량) - 공통 헬퍼 사용
        // =====================================================================
        console.log('[generateStatementPdf] 차량중량 삽입 중');
        await insertAxleWeights(page, formData, coords);

        // =====================================================================
        // Step 7: 진술 작성일 삽입 (오늘 날짜)
        // =====================================================================
        console.log('[generateStatementPdf] 진술 작성일 삽입 중');
        await addTextToPdf(page, statementDate.year, coords.statementYear.x, coords.statementYear.y, { size: coords.statementYear.size });
        await addTextToPdf(page, statementDate.month, coords.statementMonth.x, coords.statementMonth.y, { size: coords.statementMonth.size });
        await addTextToPdf(page, statementDate.day, coords.statementDay.x, coords.statementDay.y, { size: coords.statementDay.size });

        // =====================================================================
        // Step 8: 진술인 정보 삽입 (최대 3명) - 공통 헬퍼 사용
        // =====================================================================
        console.log('[generateStatementPdf] 진술인 정보 삽입 중');
        await insertWitnesses(page, witnesses, coords);

        // =====================================================================
        // Step 9: PDF 생성 완료 (다운로드 + 성공 메시지)
        // =====================================================================
        console.log('[generateStatementPdf] PDF 다운로드 시작');
        await completePdfGeneration(pdfDoc, '위반진술서', '진술서 PDF가 생성되었습니다!');

        console.log('[generateStatementPdf] 진술서 PDF 생성 완료');

    } catch (error) {
        handlePdfError(error, 'generateStatementPdf');
        throw error;
    }
}

// ==========================================================================
// 날짜/시간 파싱 유틸리티 함수
// ==========================================================================

/**
 * datetime-local 값을 분리된 날짜/시간 객체로 변환
 * @param {string} datetimeStr - "2026-01-13T23:30" 형식
 * @returns {Object} { year, month, day, hour, minute }
 */
function parseDatetimeForPdf(datetimeStr) {
    if (!datetimeStr) {
        return { year: '', month: '', day: '', hour: '', minute: '' };
    }

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
function parseDateForPdf(dateStr) {
    if (!dateStr) {
        return { year: '', month: '', day: '' };
    }

    const [year, month, day] = dateStr.split('-');
    return { year: year || '', month: month || '', day: day || '' };
}

// ==========================================================================
// 내보내기 (전역 함수로 사용)
// ==========================================================================

// 모든 함수는 전역 스코프에서 사용 가능
// window 객체에 명시적으로 할당할 필요 없음 (script 태그로 로드 시 자동 전역화)

console.log('pdf-handler.js 로드 완료');
