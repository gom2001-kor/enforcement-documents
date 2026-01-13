/**
 * DoroFill - PDF 좌표 설정
 * 적발보고서 및 진술서 PDF 템플릿의 텍스트 삽입 좌표
 * 
 * 좌표 시스템:
 * - PDF 원점은 좌하단 (0, 0)
 * - x: 왼쪽에서 오른쪽으로 증가
 * - y: 아래에서 위로 증가
 * - 단위: 포인트 (pt), 1pt = 1/72 인치
 * - A4 크기: 595 x 841 pt
 * 
 * 주의: 이 좌표는 예상값이며, 실제 PDF와 맞지 않으면 조정이 필요합니다.
 */

const PDF_COORDINATES = {

    // PDF 기본 정보
    pageSize: {
        width: 595,
        height: 841
    },

    // =========================================================================
    // 페이지 1: 운행제한 위반 적발 보고서
    // =========================================================================
    page1: {
        // --- 적발 일시 ---
        // 년, 월, 일, 시, 분 각각 따로 입력
        dateYear: { x: 285, y: 755, size: 11 },      // 2026
        dateMonth: { x: 330, y: 755, size: 11 },     // 01
        dateDay: { x: 365, y: 755, size: 11 },       // 13
        dateHour: { x: 400, y: 755, size: 11 },      // 23
        dateMinute: { x: 435, y: 755, size: 11 },    // 30

        // --- 적발 장소 ---
        location: { x: 145, y: 728, size: 10 },      // 적발위치 (주소)
        checkpoint: { x: 145, y: 710, size: 10 },    // 검문소명

        // --- 운전자 정보 ---
        driverName: { x: 145, y: 680, size: 11 },       // 성명
        driverAddress: { x: 145, y: 662, size: 10 },    // 주소  
        phoneFixed: { x: 145, y: 644, size: 10 },       // 일반전화번호
        phoneMobile: { x: 350, y: 644, size: 10 },      // 휴대전화번호

        // --- 차량 정보 ---
        vehicleType: { x: 145, y: 612, size: 11 },      // 차종
        vehicleRoute: { x: 300, y: 612, size: 10 },     // 운행경로
        plateNumber: { x: 145, y: 594, size: 11 },      // (차량) 등록번호
        cargo: { x: 350, y: 594, size: 10 },            // 적재물

        // --- 차량규격 (너비, 높이, 길이) ---
        // 측정결과
        widthMeasured: { x: 195, y: 548, size: 10 },
        heightMeasured: { x: 275, y: 548, size: 10 },
        lengthMeasured: { x: 355, y: 548, size: 10 },
        // 위반내역
        widthViolation: { x: 195, y: 530, size: 10 },
        heightViolation: { x: 275, y: 530, size: 10 },
        lengthViolation: { x: 355, y: 530, size: 10 },

        // --- 차량중량 (1축 ~ 8축, 총중량) ---
        // 측정결과 행
        axle1Measured: { x: 170, y: 488, size: 9 },
        axle2Measured: { x: 210, y: 488, size: 9 },
        axle3Measured: { x: 250, y: 488, size: 9 },
        axle4Measured: { x: 290, y: 488, size: 9 },
        axle5Measured: { x: 330, y: 488, size: 9 },
        axle6Measured: { x: 370, y: 488, size: 9 },
        axle7Measured: { x: 410, y: 488, size: 9 },
        axle8Measured: { x: 450, y: 488, size: 9 },
        totalWeightMeasured: { x: 515, y: 488, size: 9 },

        // 위반내역 행
        axle1Violation: { x: 170, y: 470, size: 9 },
        axle2Violation: { x: 210, y: 470, size: 9 },
        axle3Violation: { x: 250, y: 470, size: 9 },
        axle4Violation: { x: 290, y: 470, size: 9 },
        axle5Violation: { x: 330, y: 470, size: 9 },
        axle6Violation: { x: 370, y: 470, size: 9 },
        axle7Violation: { x: 410, y: 470, size: 9 },
        axle8Violation: { x: 450, y: 470, size: 9 },
        totalWeightViolation: { x: 515, y: 470, size: 9 },

        // --- 하단 작성자 정보 ---
        authorYear: { x: 450, y: 155, size: 10 },
        authorMonth: { x: 480, y: 155, size: 10 },
        authorDay: { x: 510, y: 155, size: 10 },
        authorOffice: { x: 190, y: 135, size: 10 },
        authorPosition: { x: 190, y: 118, size: 10 },
        authorName: { x: 190, y: 100, size: 11 },
    },

    // =========================================================================
    // 페이지 2: 운행제한 위반 진술서
    // =========================================================================
    page2: {
        // --- 적발 일시 ---
        dateYear: { x: 285, y: 755, size: 11 },
        dateMonth: { x: 330, y: 755, size: 11 },
        dateDay: { x: 365, y: 755, size: 11 },
        dateHour: { x: 400, y: 755, size: 11 },
        dateMinute: { x: 435, y: 755, size: 11 },

        // --- 적발 장소 ---
        location: { x: 145, y: 728, size: 10 },
        checkpoint: { x: 145, y: 710, size: 10 },

        // --- 차량 정보 (진술서는 간략) ---
        vehicleType: { x: 145, y: 680, size: 11 },
        plateNumber: { x: 280, y: 680, size: 11 },

        // --- 차량규격 ---
        widthMeasured: { x: 195, y: 598, size: 10 },
        heightMeasured: { x: 275, y: 598, size: 10 },
        lengthMeasured: { x: 355, y: 598, size: 10 },
        widthViolation: { x: 195, y: 580, size: 10 },
        heightViolation: { x: 275, y: 580, size: 10 },
        lengthViolation: { x: 355, y: 580, size: 10 },

        // --- 차량중량 ---
        axle1Measured: { x: 170, y: 538, size: 9 },
        axle2Measured: { x: 210, y: 538, size: 9 },
        axle3Measured: { x: 250, y: 538, size: 9 },
        axle4Measured: { x: 290, y: 538, size: 9 },
        axle5Measured: { x: 330, y: 538, size: 9 },
        axle6Measured: { x: 370, y: 538, size: 9 },
        axle7Measured: { x: 410, y: 538, size: 9 },
        axle8Measured: { x: 450, y: 538, size: 9 },
        totalWeightMeasured: { x: 515, y: 538, size: 9 },

        axle1Violation: { x: 170, y: 520, size: 9 },
        axle2Violation: { x: 210, y: 520, size: 9 },
        axle3Violation: { x: 250, y: 520, size: 9 },
        axle4Violation: { x: 290, y: 520, size: 9 },
        axle5Violation: { x: 330, y: 520, size: 9 },
        axle6Violation: { x: 370, y: 520, size: 9 },
        axle7Violation: { x: 410, y: 520, size: 9 },
        axle8Violation: { x: 450, y: 520, size: 9 },
        totalWeightViolation: { x: 515, y: 520, size: 9 },

        // --- 진술인 정보 (최대 3명) ---
        statementYear: { x: 450, y: 275, size: 10 },
        statementMonth: { x: 480, y: 275, size: 10 },
        statementDay: { x: 510, y: 275, size: 10 },

        // 진술인 1
        witness1Office: { x: 190, y: 255, size: 10 },
        witness1Position: { x: 190, y: 238, size: 10 },
        witness1Name: { x: 280, y: 238, size: 11 },

        // 진술인 2
        witness2Office: { x: 190, y: 218, size: 10 },
        witness2Position: { x: 190, y: 201, size: 10 },
        witness2Name: { x: 280, y: 201, size: 11 },

        // 진술인 3
        witness3Office: { x: 190, y: 181, size: 10 },
        witness3Position: { x: 190, y: 164, size: 10 },
        witness3Name: { x: 280, y: 164, size: 11 },
    }
};

// 좌표 조정 유틸리티
const CoordinateUtils = {
    /**
     * 특정 페이지의 모든 좌표를 오프셋만큼 이동
     */
    offsetPage(pageKey, offsetX, offsetY) {
        const page = PDF_COORDINATES[pageKey];
        if (!page) return;

        Object.keys(page).forEach(fieldKey => {
            page[fieldKey].x += offsetX;
            page[fieldKey].y += offsetY;
        });
    },

    /**
     * 특정 필드의 좌표를 조정
     */
    adjustField(pageKey, fieldKey, newX, newY) {
        if (PDF_COORDINATES[pageKey] && PDF_COORDINATES[pageKey][fieldKey]) {
            PDF_COORDINATES[pageKey][fieldKey].x = newX;
            PDF_COORDINATES[pageKey][fieldKey].y = newY;
        }
    },

    /**
     * 좌표 정보를 콘솔에 출력 (디버깅용)
     */
    printCoordinates(pageKey) {
        const page = PDF_COORDINATES[pageKey];
        if (!page) {
            console.log('페이지를 찾을 수 없습니다:', pageKey);
            return;
        }

        console.log(`=== ${pageKey} 좌표 ===`);
        Object.entries(page).forEach(([key, value]) => {
            console.log(`${key}: x=${value.x}, y=${value.y}, size=${value.size}`);
        });
    }
};

console.log('pdf-coordinates.js 로드 완료');
