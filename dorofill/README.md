# DoroFill

운행제한 위반 적발 서류 PDF 자동 작성 시스템

## 📋 프로젝트 개요

DoroFill은 운행제한 위반 차량 적발 시 필요한 서류를 빠르고 정확하게 작성할 수 있도록 도와주는 웹 애플리케이션입니다.

### 주요 기능
- **적발 보고서 작성**: 운행제한 위반 차량 적발 보고서 PDF 생성
- **위반 진술서 작성**: 운행제한 위반 진술서 PDF 생성
- **자동 계산**: 과태료, 초과 중량 자동 계산
- **입력 검증**: 차량번호, 날짜 등 자동 유효성 검사

## 🛠 기술 스택

- **HTML5** - 시맨틱 마크업
- **TailwindCSS** (CDN) - 스타일링
- **Vanilla JavaScript** - 프레임워크 없이 순수 JS
- **pdf-lib** (CDN) - PDF 생성 및 처리
- **Noto Sans KR** - 한글 폰트

## 📁 폴더 구조

```
dorofill/
├── index.html           # 메인 화면 (문서 선택)
├── report.html          # 적발 보고서 작성
├── statement.html       # 위반 진술서 작성
├── css/
│   └── styles.css       # 커스텀 스타일
├── js/
│   ├── app.js           # 공통 로직
│   ├── pdf-handler.js   # PDF 처리
│   ├── calculator.js    # 자동 계산
│   └── validator.js     # 위반 체크
├── assets/              # PDF 템플릿 (추후 추가)
└── README.md
```

## 🚀 시작하기

### 로컬 실행
1. 프로젝트 폴더를 웹 서버에서 실행하거나
2. `index.html`을 브라우저에서 직접 열기

### VS Code Live Server 사용 시
1. VS Code에서 폴더 열기
2. Live Server 확장 설치
3. `index.html` 우클릭 → "Open with Live Server"

## 📱 반응형 디자인

모바일 우선(Mobile First) 반응형 디자인으로 구현되어 모든 기기에서 최적화된 경험을 제공합니다.

## 📄 라이선스

© 2026 DoroFill. All rights reserved.
