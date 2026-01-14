/**
 * DoroFill - Gemini AI PDF Analyzer
 * 
 * Gemini 2.0 Flash를 사용하여 PDF 템플릿을 분석하고
 * 각 필드의 정확한 좌표를 자동으로 추출합니다.
 * 
 * 의존성:
 * - PDF.js (CDN): PDF → 이미지 변환
 * - Gemini API Key (localStorage에 저장됨)
 */

// ==========================================================================
// 설정 상수
// ==========================================================================

const GEMINI_CONFIG = {
    apiKeyStorage: 'dorofill_gemini_api_key',
    coordinatesStorage: 'dorofill_ai_coordinates',
    model: 'gemini-2.0-flash',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
};

// PDF 필드 정의 (Gemini가 찾아야 할 필드들)
const PDF_FIELDS = {
    page1: {
        // 적발 일시
        dateYear: { label: '적발 일시 - 년도', type: 'number', example: '2026' },
        dateMonth: { label: '적발 일시 - 월', type: 'number', example: '01' },
        dateDay: { label: '적발 일시 - 일', type: 'number', example: '14' },
        dateHour: { label: '적발 일시 - 시', type: 'number', example: '23' },
        dateMinute: { label: '적발 일시 - 분', type: 'number', example: '30' },

        // 적발 장소
        location: { label: '적발 위치/장소', type: 'text', example: '국도 17호선 청주시' },

        // 운전자 정보
        driverName: { label: '운전자 성명', type: 'text', example: '홍길동' },
        driverAddress: { label: '운전자 주소', type: 'text', example: '서울시 강남구' },
        phoneFixed: { label: '일반전화번호', type: 'tel', example: '02-123-4567' },
        phoneMobile: { label: '휴대전화번호', type: 'tel', example: '010-1234-5678' },

        // 차량 정보
        vehicleType: { label: '차종', type: 'text', example: '5톤 카고' },
        plateNumber: { label: '차량 등록번호', type: 'text', example: '12가1234' },
        vehicleRoute: { label: '운행경로', type: 'text', example: '서울 → 부산' },
        cargo: { label: '적재물', type: 'text', example: '철근' },

        // 차량규격 (측정결과/위반내역)
        widthMeasured: { label: '너비 측정결과', type: 'number', example: '2.50' },
        heightMeasured: { label: '높이 측정결과', type: 'number', example: '4.00' },
        lengthMeasured: { label: '길이 측정결과', type: 'number', example: '16.70' },
        widthViolation: { label: '너비 위반내역', type: 'number', example: '0.00' },
        heightViolation: { label: '높이 위반내역', type: 'number', example: '0.00' },
        lengthViolation: { label: '길이 위반내역', type: 'number', example: '0.00' },

        // 축하중 측정결과
        axle1Measured: { label: '1축 측정결과', type: 'number', example: '10.50' },
        axle2Measured: { label: '2축 측정결과', type: 'number', example: '10.50' },
        axle3Measured: { label: '3축 측정결과', type: 'number', example: '10.50' },
        axle4Measured: { label: '4축 측정결과', type: 'number', example: '10.50' },
        axle5Measured: { label: '5축 측정결과', type: 'number', example: '' },
        axle6Measured: { label: '6축 측정결과', type: 'number', example: '' },
        axle7Measured: { label: '7축 측정결과', type: 'number', example: '' },
        axle8Measured: { label: '8축 측정결과', type: 'number', example: '' },

        // 축하중 위반내역
        axle1Violation: { label: '1축 위반내역', type: 'number', example: '0.00' },
        axle2Violation: { label: '2축 위반내역', type: 'number', example: '0.00' },
        axle3Violation: { label: '3축 위반내역', type: 'number', example: '0.00' },
        axle4Violation: { label: '4축 위반내역', type: 'number', example: '0.00' },
        axle5Violation: { label: '5축 위반내역', type: 'number', example: '' },
        axle6Violation: { label: '6축 위반내역', type: 'number', example: '' },
        axle7Violation: { label: '7축 위반내역', type: 'number', example: '' },
        axle8Violation: { label: '8축 위반내역', type: 'number', example: '' },

        // 총중량
        totalWeightMeasured: { label: '총중량 측정결과', type: 'number', example: '42.00' },
        totalWeightViolation: { label: '총중량 위반내역', type: 'number', example: '0.00' },

        // 작성자 정보
        authorYear: { label: '작성일 - 년도', type: 'number', example: '2026' },
        authorMonth: { label: '작성일 - 월', type: 'number', example: '01' },
        authorDay: { label: '작성일 - 일', type: 'number', example: '14' },
        authorOffice: { label: '작성자 소속', type: 'text', example: '한국도로공사' },
        authorPosition: { label: '작성자 직급', type: 'text', example: '주임' },
        authorName: { label: '작성자 성명', type: 'text', example: '김단속' }
    },
    page2: {
        // 위반 진술서 필드
        witness1Office: { label: '진술인1 소속', type: 'text', example: '한국도로공사' },
        witness1Position: { label: '진술인1 직급', type: 'text', example: '주임' },
        witness1Name: { label: '진술인1 성명', type: 'text', example: '박진술' },
        witness2Office: { label: '진술인2 소속', type: 'text', example: '' },
        witness2Position: { label: '진술인2 직급', type: 'text', example: '' },
        witness2Name: { label: '진술인2 성명', type: 'text', example: '' },
        witness3Office: { label: '진술인3 소속', type: 'text', example: '' },
        witness3Position: { label: '진술인3 직급', type: 'text', example: '' },
        witness3Name: { label: '진술인3 성명', type: 'text', example: '' }
    }
};

// ==========================================================================
// API 키 관리
// ==========================================================================

/**
 * 저장된 Gemini API 키 가져오기
 * @returns {string|null} API 키 또는 null
 */
function getGeminiApiKey() {
    return localStorage.getItem(GEMINI_CONFIG.apiKeyStorage);
}

/**
 * API 키가 설정되어 있는지 확인
 * @returns {boolean}
 */
function hasGeminiApiKey() {
    const key = getGeminiApiKey();
    return key && key.length > 0;
}

// ==========================================================================
// PDF → 이미지 변환
// ==========================================================================

/**
 * PDF 파일을 이미지(Base64)로 변환
 * PDF.js 라이브러리 사용
 * 
 * @param {File} pdfFile - PDF 파일
 * @param {number} pageNum - 페이지 번호 (1부터 시작)
 * @param {number} scale - 스케일 (기본값: 2.0 for better quality)
 * @returns {Promise<{base64: string, width: number, height: number}>}
 */
async function pdfToImage(pdfFile, pageNum = 1, scale = 2.0) {
    // PDF.js 로드 확인
    if (typeof pdfjsLib === 'undefined') {
        throw new Error('PDF.js 라이브러리가 로드되지 않았습니다.');
    }

    // ArrayBuffer로 변환
    const arrayBuffer = await pdfFile.arrayBuffer();

    // PDF 문서 로드
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // 페이지 가져오기
    const page = await pdf.getPage(pageNum);

    // 뷰포트 설정
    const viewport = page.getViewport({ scale });

    // Canvas 생성
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // PDF 페이지를 Canvas에 렌더링
    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;

    // Canvas → Base64
    const base64 = canvas.toDataURL('image/png').split(',')[1];

    return {
        base64,
        width: viewport.width,
        height: viewport.height,
        originalWidth: viewport.width / scale,
        originalHeight: viewport.height / scale
    };
}

// ==========================================================================
// Gemini AI 분석
// ==========================================================================

/**
 * Gemini API에 이미지 분석 요청
 * 
 * @param {string} base64Image - Base64 인코딩된 이미지
 * @param {Object} fields - 찾아야 할 필드 목록
 * @param {number} pageNum - 페이지 번호
 * @returns {Promise<Object>} 필드별 좌표 객체
 */
async function analyzeImageWithGemini(base64Image, fields, pageNum) {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error('Gemini API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.');
    }

    // 프롬프트 생성
    const fieldList = Object.entries(fields)
        .map(([key, info]) => `- "${key}": ${info.label}`)
        .join('\n');

    const prompt = `당신은 PDF 양식 분석 전문가입니다. 이 이미지는 한국의 운행제한 위반 적발 보고서/진술서 양식입니다.

각 필드가 텍스트를 입력해야 하는 위치의 정확한 좌표를 찾아주세요.
좌표는 PDF 좌표계를 사용합니다 (좌하단이 원점, 단위는 포인트).

**이미지 크기 정보:**
- 이 이미지는 A4 PDF를 2배 스케일로 렌더링한 것입니다.
- 원본 A4 크기: 595 x 842 포인트
- 따라서 좌표를 응답할 때 이미지 픽셀 좌표를 2로 나누어 PDF 좌표로 변환해주세요.
- Y 좌표는 PDF 좌표계로 변환해주세요 (842 - y/2).

**분석해야 할 필드 목록:**
${fieldList}

**응답 형식:**
다음 JSON 형식으로만 응답해주세요. 다른 텍스트는 포함하지 마세요.
{
  "fieldName1": { "x": 100, "y": 700, "size": 11 },
  "fieldName2": { "x": 150, "y": 680, "size": 11 },
  ...
}

**참고사항:**
- x: 텍스트 시작 x 좌표 (왼쪽에서부터)
- y: 텍스트 기준선 y 좌표 (아래에서부터, PDF 좌표계)
- size: 권장 폰트 크기 (보통 9-12 사이)
- 필드를 찾을 수 없으면 해당 필드는 응답에서 제외해주세요.
- 테이블 셀 내부의 정확한 입력 위치를 찾아주세요.`;

    try {
        const response = await fetch(
            `${GEMINI_CONFIG.apiEndpoint}/${GEMINI_CONFIG.model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: 'image/png',
                                    data: base64Image
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.1,  // 낮은 온도로 일관된 응답
                        maxOutputTokens: 4096
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API 오류: ${errorData.error?.message || '알 수 없는 오류'}`);
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error('Gemini 응답에서 텍스트를 찾을 수 없습니다.');
        }

        // JSON 추출 및 파싱
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Gemini 응답에서 JSON을 찾을 수 없습니다.');
        }

        const coordinates = JSON.parse(jsonMatch[0]);
        console.log(`[Gemini] 페이지 ${pageNum} 분석 완료: ${Object.keys(coordinates).length}개 필드`);

        return coordinates;

    } catch (error) {
        console.error('[Gemini] 분석 실패:', error);
        throw error;
    }
}

// ==========================================================================
// 메인 분석 함수
// ==========================================================================

/**
 * PDF 템플릿을 분석하여 모든 필드의 좌표를 추출
 * 
 * @param {File} pdfFile - PDF 템플릿 파일
 * @param {Function} onProgress - 진행 상황 콜백 (optional)
 * @returns {Promise<Object>} 페이지별 좌표 데이터
 */
async function analyzePdfTemplate(pdfFile, onProgress = null) {
    // API 키 확인
    if (!hasGeminiApiKey()) {
        throw new Error('Gemini API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.');
    }

    const result = {
        analyzedAt: new Date().toISOString(),
        filename: pdfFile.name,
        page1: {},
        page2: {}
    };

    try {
        // 페이지 1 분석
        if (onProgress) onProgress('페이지 1 이미지 변환 중...');
        const image1 = await pdfToImage(pdfFile, 1);

        if (onProgress) onProgress('페이지 1 AI 분석 중...');
        result.page1 = await analyzeImageWithGemini(image1.base64, PDF_FIELDS.page1, 1);

        // 페이지 2가 있는지 확인
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        if (pdf.numPages >= 2) {
            if (onProgress) onProgress('페이지 2 이미지 변환 중...');
            const image2 = await pdfToImage(pdfFile, 2);

            if (onProgress) onProgress('페이지 2 AI 분석 중...');
            result.page2 = await analyzeImageWithGemini(image2.base64, PDF_FIELDS.page2, 2);
        }

        // 결과 저장
        saveCoordinates(result);

        if (onProgress) onProgress('분석 완료!');

        console.log('[Gemini] PDF 분석 완료:', result);
        return result;

    } catch (error) {
        console.error('[Gemini] PDF 분석 실패:', error);
        throw error;
    }
}

// ==========================================================================
// 좌표 저장/불러오기
// ==========================================================================

/**
 * 분석된 좌표를 localStorage에 저장
 * @param {Object} coordinates - 좌표 데이터
 */
function saveCoordinates(coordinates) {
    try {
        localStorage.setItem(GEMINI_CONFIG.coordinatesStorage, JSON.stringify(coordinates));
        console.log('[좌표] 저장 완료');
    } catch (e) {
        console.error('[좌표] 저장 실패:', e);
    }
}

/**
 * 저장된 좌표 불러오기
 * @returns {Object|null} 좌표 데이터 또는 null
 */
function loadCoordinates() {
    try {
        const saved = localStorage.getItem(GEMINI_CONFIG.coordinatesStorage);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error('[좌표] 불러오기 실패:', e);
        return null;
    }
}

/**
 * AI 분석 좌표가 저장되어 있는지 확인
 * @returns {boolean}
 */
function hasAiCoordinates() {
    return loadCoordinates() !== null;
}

/**
 * 특정 필드의 좌표 가져오기 (AI 좌표 우선, 수동 좌표 폴백)
 * @param {string} fieldName - 필드 이름
 * @param {number} pageNum - 페이지 번호 (1 또는 2)
 * @returns {Object|null} { x, y, size } 또는 null
 */
function getFieldCoordinate(fieldName, pageNum = 1) {
    // AI 분석 좌표 먼저 확인
    const aiCoords = loadCoordinates();
    const pageKey = `page${pageNum}`;

    if (aiCoords && aiCoords[pageKey] && aiCoords[pageKey][fieldName]) {
        return aiCoords[pageKey][fieldName];
    }

    // 수동 좌표 폴백 (PDF_COORDINATES가 정의되어 있다면)
    if (typeof PDF_COORDINATES !== 'undefined') {
        const manualCoords = PDF_COORDINATES[pageKey];
        if (manualCoords && manualCoords[fieldName]) {
            return manualCoords[fieldName];
        }
    }

    return null;
}

/**
 * 저장된 좌표 삭제
 */
function clearCoordinates() {
    localStorage.removeItem(GEMINI_CONFIG.coordinatesStorage);
    console.log('[좌표] 삭제 완료');
}

// ==========================================================================
// Export (전역 객체로 노출)
// ==========================================================================

window.GeminiAnalyzer = {
    // API 키 관리
    getApiKey: getGeminiApiKey,
    hasApiKey: hasGeminiApiKey,

    // PDF 분석
    analyzePdf: analyzePdfTemplate,
    pdfToImage: pdfToImage,

    // 좌표 관리
    loadCoordinates,
    saveCoordinates,
    clearCoordinates,
    hasCoordinates: hasAiCoordinates,
    getFieldCoordinate,

    // 설정
    config: GEMINI_CONFIG,
    fields: PDF_FIELDS
};
