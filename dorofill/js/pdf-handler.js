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
 * PDF 페이지에 텍스트를 삽입
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
async function addTextToPdf(page, text, x, y, options = {}) {
    try {
        // pdf-lib 로드 확인
        checkPdfLib();

        // 옵션 기본값 설정
        const {
            size = PDF_CONFIG.fontSize.body,
            color = PDF_CONFIG.colors.black,
            isBold = false
        } = options;

        // PDF 문서 가져오기 (페이지에서 역참조)
        const pdfDoc = page.doc;

        // 폰트 임베드 (Helvetica 또는 HelveticaBold)
        // 주의: Helvetica는 영문/숫자만 지원, 한글은 별도 폰트 필요
        const fontName = isBold
            ? PDFLib.StandardFonts.HelveticaBold
            : PDFLib.StandardFonts.Helvetica;
        const font = await pdfDoc.embedFont(fontName);

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
 * PDFDocument를 파일로 다운로드
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

        // 다운로드 링크 생성 및 클릭
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

        console.log(`PDF 다운로드 완료: ${fullFilename}`);

        // 성공 토스트 메시지 (app.js의 showToast 사용)
        if (typeof showToast === 'function') {
            showToast(`${fullFilename} 다운로드 완료`, 'success');
        }

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
// 내보내기 (전역 함수로 사용)
// ==========================================================================

// 모든 함수는 전역 스코프에서 사용 가능
// window 객체에 명시적으로 할당할 필요 없음 (script 태그로 로드 시 자동 전역화)

console.log('pdf-handler.js 로드 완료');
