const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const assetsDir = path.join(__dirname, '..', 'public', 'proposal-assets');

function getBase64Image(filename) {
  const filePath = path.join(assetsDir, filename);
  if (!fs.existsSync(filePath)) return '';
  const ext = path.extname(filename).replace('.', '');
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/${ext};base64,${data}`;
}

const therapistImg = getBase64Image('screen_therapist_full.png');
const adminImg = getBase64Image('screen_admin.png');
const clientPcImg = getBase64Image('screen_client_pc.png');
const clientMobileImg = getBase64Image('screen_client_mobile.png');

const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hcare CRM 맞춤형 바디케어 & 운동지도 시스템 개발 제안서</title>
  <style>
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background-color: #f8fafc;
      line-height: 1.6;
      font-size: 13.5px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px 48px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    /* Print settings */
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }

    @media print {
      body {
        background: #ffffff;
      }
      .container {
        padding: 0;
        box-shadow: none;
        max-width: 100%;
      }
      .page-break {
        page-break-before: always;
        break-before: page;
        padding-top: 20px;
      }
      .no-break {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }

    /* Header & Branding */
    .header {
      border-bottom: 2px solid #0d9488;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .badge-top {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #f0fdfa;
      color: #0d9488;
      border: 1px solid #ccfbf1;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .header h1 {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      line-height: 1.3;
    }
    .header p {
      margin-top: 8px;
      color: #64748b;
      font-size: 14.5px;
    }
    .header-meta {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 18px;
    }
    .meta-item .label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
    }
    .meta-item .value {
      font-size: 14px;
      color: #0f172a;
      font-weight: 700;
      margin-top: 2px;
    }

    /* Demo Callout Banner */
    .demo-banner {
      background: linear-gradient(135deg, #0f172a 0%, #134e4a 100%);
      color: #ffffff;
      border-radius: 14px;
      padding: 20px 24px;
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
    }
    .demo-banner-content h3 {
      font-size: 16px;
      font-weight: 700;
      color: #5eead4;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .demo-banner-content p {
      font-size: 13px;
      color: #cbd5e1;
      margin-top: 6px;
      line-height: 1.5;
    }
    .demo-btn {
      background: #0d9488;
      color: #ffffff;
      text-decoration: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
      border: 1px solid #14b8a6;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }

    /* Section Styles */
    .section {
      margin-bottom: 36px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
    }
    .section-title .num-badge {
      background: #0d9488;
      color: #ffffff;
      font-size: 12px;
      width: 22px;
      height: 22px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
    }

    /* Question Cards */
    .q-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #0d9488;
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 18px;
    }
    .q-title {
      font-size: 14.5px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 10px;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .q-title .badge-q {
      background: #0d9488;
      color: #ffffff;
      font-size: 11px;
      padding: 2px 7px;
      border-radius: 4px;
      font-weight: 700;
    }
    .q-answer {
      font-size: 13px;
      color: #334155;
      line-height: 1.65;
    }
    .q-answer p {
      margin-bottom: 8px;
    }
    .q-answer p:last-child {
      margin-bottom: 0;
    }
    .highlight-box {
      background: #f0fdfa;
      border: 1px solid #ccfbf1;
      border-radius: 8px;
      padding: 10px 14px;
      margin: 10px 0;
      font-size: 12.5px;
      color: #0f766e;
    }

    /* Screen Breakdown & UI Callout Section */
    .screen-block {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 28px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .screen-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .screen-header h3 {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .screen-tag {
      background: #e2e8f0;
      color: #334155;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }

    /* Browser Mockup Window */
    .mockup-window {
      background: #1e293b;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #334155;
      margin-bottom: 18px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      position: relative;
    }
    .mockup-titlebar {
      background: #0f172a;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #334155;
    }
    .mockup-dots {
      display: flex;
      gap: 5px;
    }
    .mockup-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
    }
    .dot-red { background: #ef4444; }
    .dot-yellow { background: #eab308; }
    .dot-green { background: #22c55e; }
    .mockup-url {
      background: #1e293b;
      color: #94a3b8;
      font-size: 11px;
      padding: 2px 12px;
      border-radius: 4px;
      font-family: monospace;
      margin-left: 10px;
      flex-grow: 1;
      max-width: 450px;
    }

    .mockup-content {
      position: relative;
      background: #f8fafc;
      line-height: 0;
    }
    .mockup-content img {
      width: 100%;
      height: auto;
      display: block;
    }

    /* Orange Badges (Canon manual style) */
    .badge-pin {
      position: absolute;
      background: #ea580c;
      color: #ffffff;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-size: 13px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4), 0 0 0 2px #ffffff;
      z-index: 10;
    }

    /* Table for Callouts */
    .callout-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      margin-top: 10px;
    }
    .callout-table th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      text-align: left;
      padding: 8px 12px;
      border-top: 1px solid #e2e8f0;
      border-bottom: 2px solid #cbd5e1;
    }
    .callout-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
      line-height: 1.5;
    }
    .col-num {
      width: 44px;
      text-align: center;
    }
    .table-pin {
      background: #ea580c;
      color: #ffffff;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .col-title {
      font-weight: 700;
      color: #0f172a;
      width: 190px;
    }
    .col-desc {
      color: #334155;
    }
    .col-value {
      color: #0d9488;
      font-weight: 600;
      width: 210px;
    }

    /* UI/UX Design Policy Box (Crucial User Requirement) */
    .policy-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-left: 5px solid #2563eb;
      border-radius: 12px;
      padding: 22px 24px;
      margin: 28px 0;
    }
    .policy-title {
      font-size: 15.5px;
      font-weight: 800;
      color: #1e3a8a;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .policy-content {
      font-size: 13px;
      color: #1e293b;
      line-height: 1.7;
    }
    .policy-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 14px;
    }
    .policy-card {
      background: #ffffff;
      border: 1px solid #dbeafe;
      border-radius: 8px;
      padding: 14px;
    }
    .policy-card h4 {
      font-size: 13px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .policy-card p {
      font-size: 12.5px;
      color: #475569;
      line-height: 1.55;
    }

    /* Architecture & Milestones */
    .milestone-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      margin: 12px 0;
    }
    .milestone-table th {
      background: #f1f5f9;
      padding: 9px 12px;
      font-weight: 700;
      text-align: left;
      border-bottom: 2px solid #cbd5e1;
    }
    .milestone-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      line-height: 1.5;
    }
    .badge-done {
      background: #dcfce7;
      color: #15803d;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
    }

    /* Checklist & Footer */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin: 18px 0;
    }
    .summary-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      text-align: center;
    }
    .summary-box .num {
      font-size: 24px;
      font-weight: 800;
      color: #0d9488;
    }
    .summary-box .lbl {
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      margin-top: 4px;
    }
    .summary-box .sub {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 2px;
    }

    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      margin-top: 36px;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
    }
  </style>
</head>
<body>

<div class="container">

  <!-- Header -->
  <header class="header">
    <div class="badge-top">🚀 위시켓 맞춤 지원서 & 사전 검증 모범 제안서</div>
    <h1>1:1 맞춤형 바디케어 & 운동지도 솔루션 (Hcare CRM)</h1>
    <p>14년 임상 물리치료 노하우를 IT 시스템으로 표준화하는 전문가용 맞춤 CRM 및 고객 스마트폰 알림장 솔루션</p>

    <div class="header-meta">
      <div class="meta-item">
        <div class="label">총 제안 예산</div>
        <div class="value">120만 원 (VAT/수수료 포함)</div>
      </div>
      <div class="meta-item">
        <div class="label">납품 목표 일정</div>
        <div class="value">11월 20일 이전 조기 완료</div>
      </div>
      <div class="meta-item">
        <div class="label">심사 지원 목표</div>
        <div class="value">11월 23일 정부 창업지원 심사</div>
      </div>
      <div class="meta-item">
        <div class="label">지적재산권 및 소유권</div>
        <div class="value">소스코드 & DB 100% 양도</div>
      </div>
    </div>
  </header>

  <!-- Live Demo Banner -->
  <div class="demo-banner">
    <div class="demo-banner-content">
      <h3>✨ 즉시 체험 가능한 실시간 웹 시연 데모 구축 완료</h3>
      <p>대표님께서 복잡한 개발 용어 없이 직접 마우스로 신체 항목을 체크하고 3D 바디맵 회전 및 운동 처방을 테스트해 보실 수 있도록 데모를 실시간 배포해 두었습니다.</p>
    </div>
    <a href="https://hcare-crm.vercel.app/therapist" target="_blank" class="demo-btn">시연 데모 바로가기 ↗</a>
  </div>

  <!-- =========================================================================
       SECTION 1: 위시켓 사전 검증 질문 3개 완벽 답변
       ========================================================================= -->
  <section class="section">
    <h2 class="section-title"><span class="num-badge">1</span> 위시켓 사전 검증 질문 3대 핵심 답변</h2>

    <!-- Q1 -->
    <div class="q-card no-break">
      <div class="q-title">
        <span class="badge-q">질문 1 (핵심 기능)</span>
        고객의 신체 관찰 항목을 복수 선택하면, 사전에 등록된 기준에 따라 관련 근육·수기 관리 방법·운동 프로그램이 표시되고 관리사가 최종 선택하는 웹앱을 개발할 수 있나요?
      </div>
      <div class="q-answer">
        <p><b>네, 100% 완벽히 구현 가능하며, 대표님께서 직접 만져보고 판단하실 수 있도록 실시간 인터랙티브 웹 데모를 이미 완성해 두었습니다.</b></p>
        <p>특히 단순 텍스트 나열에 그치지 않고, <b>관찰 항목을 체크하는 즉시 3D 인체 모델에서 타겟 근육(승모근, 견갑거근, 두판상근 등)이 붉은색 네온으로 시각 점등</b>되며 마우스로 360° 회전 및 부위별 확대가 가능한 <b>'3D 인터랙티브 바디 맵(Body Map)'</b>을 탑재하여, 현장 관리사의 전문성과 고객의 시각적 신뢰를 극대화했습니다.</p>
        <div class="highlight-box">
          📍 <b>핵심 보안 통제</b>: 전문 수기 관리 방법과 내부 임상 메모는 관리사/관리자에게만 노출되며, 고객 화면에는 오직 이해하기 쉬운 홈운동 영상과 알림장 안내만 노출되도록 철저히 권한이 분리되어 있습니다.
        </div>
      </div>
    </div>

    <!-- Q2 -->
    <div class="q-card no-break">
      <div class="q-title">
        <span class="badge-q">질문 2 (예산 범위)</span>
        부가세 및 수수료를 포함한 총예산 120만 원 내에서 구현 가능한 기능은 무엇인가요? 부족하다면 필수 기능 구현에 필요한 추가 비용도 알려주세요.
      </div>
      <div class="q-answer">
        <p>11월 23일 정부 창업지원사업 심사위원 시연 및 사업성 검증이 목표이신 만큼, <b>추가 비용 0원으로 총예산 120만 원(위시켓 수수료 및 원천징수 세금 일체 포함) 내에서 공고에 기재된 4대 핵심 기능을 100% 모두 구현하여 납품</b>합니다.</p>
        <p>핵심 아키텍처와 프로토타입 설계를 이미 마쳤기 때문에 예산 내에서 아래 항목이 전부 포함됩니다:</p>
        <ul style="margin-left: 20px; margin-top: 6px; font-size: 12.5px; color: #334155;">
          <li><b>관리사용 CRM 웹(PC·태블릿)</b>: 고객 프로필/특이사항, 회차 차감, 3D 바디맵, 다중 관찰 체크 & 프로그램 자동 추천 매칭</li>
          <li><b>관리자 마스터 설정 웹</b>: 관찰 항목 CRUD, 관리 프로그램·홈운동 자료실, 노코드 연결 기준(매트릭스) 가중치 편집기</li>
          <li><b>고객 전용 PC 와이드 대시보드 & 스마트폰 모바일 웹</b>: 잔여 회차 확인, 3D 관리 부위 열람, 유튜브 운동 영상 재생, 일일 완료 체크</li>
          <li><b>결과물 양도</b>: <b>전체 원본 소스코드 100% 소유권 이전</b>, 클라우드 무중단 배포 세팅, 비개발자용 화면 캡처 운영 매뉴얼</li>
        </ul>
      </div>
    </div>

    <!-- Q3 -->
    <div class="q-card no-break">
      <div class="q-title">
        <span class="badge-q">질문 3 (확장성 & AI)</span>
        개발 완료 후 제가 직접 관리 프로그램과 체크리스트 기준을 추가·수정할 수 있나요? 향후 AI 연동도 가능한 구조인가요?
      </div>
      <div class="q-answer">
        <p><b>네, 두 가지 모두 완벽히 지원되도록 설계되어 있습니다.</b></p>
        <p>1. <b>대표님 직접 무제한 추가·수정 (노코드 방식 운영)</b>: 개발자에게 매번 비용을 지불하지 않고도, 관리자 화면(<code>/admin</code>)에서 엑셀을 다루듯 클릭 몇 번으로 관찰 항목을 추가하고, 어떤 프로그램과 매칭될지 우선순위 가중치를 손쉽게 직접 변경하실 수 있습니다.</p>
        <p>2. <b>AI 연동 및 모바일 앱 확장 구조 (비개발자 눈높이 설명)</b>: 이번 시제품을 개발하고 버리는 일회성 코드가 아니라, 데이터·추천 로직·화면이 레고 블록처럼 분리된 <b>표준 모듈형 아키텍처</b>로 제작됩니다. 추후 모바일 앱(iOS/Android) 출시나 인공지능(AI API) 고도화 시 기존 코드를 100% 재사용할 수 있습니다.</p>
      </div>
    </div>
  </section>

  <!-- =========================================================================
       SECTION 2: 4대 핵심 화면 상세 UI 명세 & 인터랙티브 콜아웃 가이드
       (Canon Manual Reference Style)
       ========================================================================= -->
  <div class="page-break"></div>

  <section class="section">
    <h2 class="section-title"><span class="num-badge">2</span> 4대 핵심 화면 상세 UI 명세 & 기능 가이드</h2>
    <p style="color: #64748b; font-size: 13px; margin-bottom: 20px;">
      실제 구축된 서비스 화면별 상세 캡처와 함께 각 영역의 기능 및 임상·사업적 가치를 번호별로 상세히 설명해 드립니다.
    </p>

    <!-- Screen 1: Therapist CRM -->
    <div class="screen-block no-break">
      <div class="screen-header">
        <h3>화면 1: 관리사용 1:1 맞춤 케어 CRM & 3D 바디맵 화면</h3>
        <span class="screen-tag">접속 경로: /therapist</span>
      </div>

      <div class="mockup-window">
        <div class="mockup-titlebar">
          <div class="mockup-dots">
            <span class="mockup-dot dot-red"></span>
            <span class="mockup-dot dot-yellow"></span>
            <span class="mockup-dot dot-green"></span>
          </div>
          <div class="mockup-url">https://hcare-crm.vercel.app/therapist</div>
        </div>
        <div class="mockup-content">
          <img src="${therapistImg}" alt="관리사 CRM 화면">
          <!-- Orange Badges -->
          <div class="badge-pin" style="top: 13%; left: 32%;">1</div>
          <div class="badge-pin" style="top: 42%; left: 38%;">2</div>
          <div class="badge-pin" style="top: 45%; left: 78%;">3</div>
          <div class="badge-pin" style="top: 80%; left: 45%;">4</div>
        </div>
      </div>

      <table class="callout-table">
        <thead>
          <tr>
            <th class="col-num">번호</th>
            <th class="col-title">주요 기능 영역</th>
            <th class="col-desc">상세 동작 및 사용 시나리오</th>
            <th class="col-value">임상 & 사업적 가치</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="col-num"><span class="table-pin">1</span></td>
            <td class="col-title">고객 프로필 & 핵심 주의사항</td>
            <td class="col-desc">고객명, 직업군(사무직 장시간 모니터), 잔여 회차(7/10회), 주 호소 증상, 선호 압/온열, 금기·주의사항(경추 급격한 신전 금지)을 한눈에 브리핑합니다.</td>
            <td class="col-value">상담 시작 전 10초 만에 고객 상태 파악 및 안전사고 원천 방지</td>
          </tr>
          <tr>
            <td class="col-num"><span class="table-pin">2</span></td>
            <td class="col-title">신체·움직임 다중 관찰 체크</td>
            <td class="col-desc">경추·어깨, 흉추·견갑, 요추·골반, 하지·보행 4개 부위별 관찰 항목을 복수로 체크합니다. 클릭 즉시 타겟 근육과 관리 프로그램이 매칭됩니다.</td>
            <td class="col-value">관리사 주관적 감에 의존하지 않는 표준화된 임상 데이터 축적</td>
          </tr>
          <tr>
            <td class="col-num"><span class="table-pin">3</span></td>
            <td class="col-title">3D 인터랙티브 인체 바디맵</td>
            <td class="col-desc">관찰 항목 체크 시 관련 타겟 근육(승모근, 견갑거근 등)이 네온 크림슨(붉은색)으로 실시간 발광 점등됩니다. 360° 마우스 드래그 회전, 휠 확대/축소, 5대 카메라 앵글을 지원합니다.</td>
            <td class="col-value">고객에게 신체 불균형 부위를 3차원 시각적으로 납득시켜 재등록률 극대화</td>
          </tr>
          <tr>
            <td class="col-num"><span class="table-pin">4</span></td>
            <td class="col-title">추천 프로그램 & 세션 저장</td>
            <td class="col-desc">우선순위 추천 프로그램 중 이번 회차 적용 프로그램을 선택하고 맞춤 홈운동(유튜브 연동)을 배정한 뒤, 통증 지수(VAS) 및 내부 메모를 기록하여 저장합니다.</td>
            <td class="col-value">원클릭 잔여 회차 자동 차감 및 고객 스마트폰 알림장 즉시 배정</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Screen 2: Admin RuleMatrix -->
    <div class="screen-block no-break">
      <div class="screen-header">
        <h3>화면 2: 관리자 연결 기준 매트릭스 & 콘텐츠 마스터 스튜디오</h3>
        <span class="screen-tag">접속 경로: /admin</span>
      </div>

      <div class="mockup-window">
        <div class="mockup-titlebar">
          <div class="mockup-dots">
            <span class="mockup-dot dot-red"></span>
            <span class="mockup-dot dot-yellow"></span>
            <span class="mockup-dot dot-green"></span>
          </div>
          <div class="mockup-url">https://hcare-crm.vercel.app/admin</div>
        </div>
        <div class="mockup-content">
          <img src="${adminImg}" alt="관리자 설정 화면">
          <!-- Orange Badges -->
          <div class="badge-pin" style="top: 15%; left: 16%;">1</div>
          <div class="badge-pin" style="top: 35%; left: 18%;">2</div>
          <div class="badge-pin" style="top: 33%; left: 75%;">3</div>
          <div class="badge-pin" style="top: 15%; left: 35%;">4</div>
        </div>
      </div>

      <table class="callout-table">
        <thead>
          <tr>
            <th class="col-num">번호</th>
            <th class="col-title">주요 기능 영역</th>
            <th class="col-desc">상세 동작 및 사용 시나리오</th>
            <th class="col-value">임상 & 사업적 가치</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="col-num"><span class="table-pin">1</span></td>
            <td class="col-title">노코드 연결 기준 (RuleMatrix)</td>
            <td class="col-desc">왼쪽에서 신체 관찰 항목을 고르고, 오른쪽에서 연결할 케어 프로그램의 중요도 가중치(0~5점)를 클릭하여 실시간 지정합니다.</td>
            <td class="col-value">개발자 수정 요청 없이 대표님이 1초 만에 알고리즘 추천 규칙 변경</td>
          </tr>
          <tr>
            <td class="col-num"><span class="table-pin">2</span></td>
            <td class="col-title">신체 관찰 체크리스트 관리</td>
            <td class="col-desc">부위별 관찰 항목을 자유롭게 추가·수정하고 활성/비활성 토글을 제어합니다.</td>
            <td class="col-value">14년 임상 물리치료 노하우를 체계적인 디지털 에셋으로 자산화</td>
          </tr>
          <tr>
            <td class="col-num"><span class="table-pin">3</span></td>
            <td class="col-title">관리 프로그램 & 수기 가이드</td>
            <td class="col-desc">케어 프로그램명, 타겟 근육(33개 해부학 부위), 관리 기법, 내부 주의사항을 등록하고 수정합니다.</td>
            <td class="col-value">소속 관리사들의 관리 수준을 상향 표준화하여 서비스 품질 균일화</td>
          </tr>
          <tr>
            <td class="col-num"><span class="table-pin">4</span></td>
            <td class="col-title">홈운동 영상 자료실 (YouTube)</td>
            <td class="col-desc">유튜브 영상 URL을 입력하면 썸네일이 자동 추출되며, 운동 세트 수 및 안전 주의사항을 지정할 수 있습니다.</td>
            <td class="col-value">대표님이 검증한 양질의 홈트레이닝 영상을 고객에게 공식 배포</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Screen 3: Customer PC Dashboard -->
    <div class="page-break"></div>
    <div class="screen-block no-break">
      <div class="screen-header">
        <h3>화면 3: 고객 전용 와이드 PC 대시보드 화면</h3>
        <span class="screen-tag">접속 경로: /my (PC 와이드 뷰)</span>
      </div>

      <div class="mockup-window">
        <div class="mockup-titlebar">
          <div class="mockup-dots">
            <span class="mockup-dot dot-red"></span>
            <span class="mockup-dot dot-yellow"></span>
            <span class="mockup-dot dot-green"></span>
          </div>
          <div class="mockup-url">https://hcare-crm.vercel.app/my?view=pc</div>
        </div>
        <div class="mockup-content">
          <img src="${clientPcImg}" alt="고객 PC 화면">
          <!-- Orange Badges -->
          <div class="badge-pin" style="top: 18%; left: 17%;">1</div>
          <div class="badge-pin" style="top: 18%; left: 49%;">2</div>
          <div class="badge-pin" style="top: 55%; left: 16%;">3</div>
          <div class="badge-pin" style="top: 55%; left: 53%;">4</div>
          <div class="badge-pin" style="top: 55%; left: 85%;">5</div>
        </div>
      </div>

      <table class="callout-table">
        <thead>
          <tr>
            <th class="col-num">번호</th>
            <th class="col-title">주요 기능 영역</th>
            <th class="col-desc">상세 동작 및 사용 시나리오</th>
            <th class="col-value">임상 & 사업적 가치</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="col-num"><span class="table-pin">1</span></td>
            <td class="col-title">1:1 멤버십 패키지 현황 카드</td>
            <td class="col-desc">회원명, 패키지 이용 현황(3회 이용 / 총 10회), 게이지 바, 잔여 7회, 유효기간을 직관적으로 확인합니다.</td>
            <td class="col-value">이용 투명성 제공 및 잔여 회차 소진 시 재결제 자연 유도</td>
          </tr>
          <tr>
            <td class="col-num"><span class="table-pin">2</span></td>
            <td class="col-title">주간 홈운동 루틴 트래커</td>
            <td class="col-desc">최근 7일간의 요일별 운동 실천 여부를 달력 도트와 달성률로 시각화하여 보여줍니다.</td>
            <td class="col-value">고객의 능동적 참여를 유도하는 게이미피케이션 동기부여</td>
          </tr>
          <tr>
            <td class="col-num"><span class="table-pin">3</span></td>
            <td class="col-title">나의 3D 집중 케어 부위 뷰어</td>
            <td class="col-desc">오늘 관리사에게 케어받은 타겟 근육(승모근, 견갑거근, 능형근 등)이 붉은색으로 점등된 3D 모델을 고객이 직접 360° 회전하며 관찰합니다.</td>
            <td class="col-value">단순 마사지가 아닌 의학적 근거에 기반한 1:1 케어임을 고객이 체감</td>
          </tr>
          <tr>
            <td class="col-num"><span class="table-pin">4</span></td>
            <td class="col-title">맞춤 홈운동 & 인라인 유튜브 재생</td>
            <td class="col-desc">유튜브 썸네일 확인 후 별도 창 이동 없이 화면 내에서 즉시 고화질 영상을 시청하고 [오늘 운동 완료 체크]를 클릭합니다.</td>
            <td class="col-value">가장 직관적인 홈트레이닝 환경을 구축하여 일일 실천율 대폭 상승</td>
          </tr>
          <tr>
            <td class="col-num"><span class="table-pin">5</span></td>
            <td class="col-title">누적 방문·관리 이력 타임라인</td>
            <td class="col-desc">회차별 케어 일자, 담당 관리사, 통증 지표 호전 추이(VAS 6 ➔ 3), 관리사 공개 코멘트를 영구 열람합니다.</td>
            <td class="col-value">고객 본인의 몸이 실제로 좋아지고 있음을 입증하는 데이터 자산 형성</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Screen 4: Customer Mobile View -->
    <div class="screen-block no-break">
      <div class="screen-header">
        <h3>화면 4: 고객 전용 모바일 스마트폰 뷰 (알림장 모드)</h3>
        <span class="screen-tag">접속 경로: /my (스마트폰 모바일 뷰)</span>
      </div>

      <div style="display: flex; gap: 24px; align-items: flex-start;">
        <div class="mockup-window" style="width: 300px; flex-shrink: 0;">
          <div class="mockup-titlebar">
            <div class="mockup-dots">
              <span class="mockup-dot dot-red"></span>
              <span class="mockup-dot dot-yellow"></span>
              <span class="mockup-dot dot-green"></span>
            </div>
            <div class="mockup-url">Mobile App View</div>
          </div>
          <div class="mockup-content">
            <img src="${clientMobileImg}" alt="고객 모바일 화면">
            <!-- Orange Badges -->
            <div class="badge-pin" style="top: 25%; left: 35%;">1</div>
            <div class="badge-pin" style="top: 60%; left: 45%;">2</div>
          </div>
        </div>

        <div style="flex-grow: 1;">
          <table class="callout-table">
            <thead>
              <tr>
                <th class="col-num">번호</th>
                <th class="col-title">모바일 특화 영역</th>
                <th class="col-desc">상세 동작 및 모바일 UX 최적화 포인트</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="col-num"><span class="table-pin">1</span></td>
                <td class="col-title">스마트폰 헤더 & 잔여 회차</td>
                <td class="col-desc">앱스토어 설치 없이 카카오톡 링크 클릭만으로 즉시 열리며, 고객명과 잔여 이용 횟수를 모바일 최상단에 큼직하게 표시합니다.</td>
              </tr>
              <tr>
                <td class="col-num"><span class="table-pin">2</span></td>
                <td class="col-title">모바일 터치 3D 바디맵</td>
                <td class="col-desc">손가락 터치 제스처로 자유롭게 인체를 회전하고 확대할 수 있어, 퇴근길 지하철이나 침대에서도 오늘의 케어 부위를 감각적으로 확인합니다.</td>
              </tr>
              <tr>
                <td class="col-num"><span class="table-pin">3</span></td>
                <td class="col-title">원터치 유튜브 홈운동 수행 체크</td>
                <td class="col-desc">모바일 전체화면으로 홈운동을 시청한 후 [오늘 운동 완료 체크] 버튼을 탭하면 실시간 체크 완료가 서버에 저장됩니다.</td>
              </tr>
              <tr>
                <td class="col-num"><span class="table-pin">4</span></td>
                <td class="col-title">관리사 일대일 모바일 알림장</td>
                <td class="col-desc">관리사가 남긴 당일 스트레칭 팁과 주의사항이 카카오톡 메시지처럼 깔끔한 카드 형태로 배달되어 고객 만족도를 극대화합니다.</td>
              </tr>
            </tbody>
          </table>

          <div class="highlight-box" style="margin-top: 14px;">
            💡 <b>PWA(웹앱) 바로가기 홈화면 추가 지원</b>: 고객 스마트폰의 사파리/크롬 브라우저에서 '홈 화면에 추가'를 누르면 네이티브 앱 아이콘처럼 설치되어 손쉽게 접근할 수 있습니다.
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- =========================================================================
       SECTION 3: 비개발자 대표님을 위한 UI/UX 디자인 유연성 및 현실적 제약 조율 정책
       (사용자 요청 문구 반영)
       ========================================================================= -->
  <div class="page-break"></div>

  <section class="section">
    <h2 class="section-title"><span class="num-badge">3</span> UI/UX 디자인 유연성 및 현실적 제약 조율 가이드</h2>

    <div class="policy-box no-break">
      <div class="policy-title">
        <span>🎨</span> 비개발자 대표님 맞춤 UI/UX 정책 (디자인 만족도 극대화 & 납기 준수 보장)
      </div>
      <div class="policy-content">
        <p style="font-size: 13.5px; font-weight: 600; color: #1e3a8a; margin-bottom: 8px;">
          "서비스 UI 디자인은 대표님이 원하시는 톤앤매너/스타일(브랜드 컬러, 레이아웃, 분위기)에 맞춰 최대한 유연하게 반영해 드릴 수 있습니다. 다만 정해진 예산(120만 원)과 납기(11/23 심사) 내에서 무한정 수정할 수는 없으므로, 초기 기획 및 피드백 단계(1~2회 집중 조율)를 거쳐 핵심 기능 구현을 해치지 않는 범위 내에서 최적의 맞춤 디자인으로 완성해 드립니다."
        </p>
        <p>
          비개발자이신 대표님 입장에서 '원하는 디자인 깔'이 제대로 나올지 걱정되시는 것은 너무나 당연합니다. 개발자가 일방적으로 만든 투박한 디자인을 강요하거나, 반대로 잦은 디자인 번복으로 인해 11월 23일 심사 일정을 놓치는 일이 없도록 <b>상호 신뢰 기반의 명확한 디자인 조율 프로토콜</b>을 운영합니다.
        </p>

        <div class="policy-grid">
          <div class="policy-card">
            <h4>✨ 100% 반영 가능한 맞춤 디자인 요소</h4>
            <ul style="margin-left: 16px; margin-top: 4px; font-size: 12px; color: #475569;">
              <li><b>브랜드 고유 컬러</b>: 대표님 클리닉의 메인/서브 컬러 테마 완벽 적용 (Teal, Blue, Beige, Black 등)</li>
              <li><b>로고 & 파비콘</b>: 대표님이 보유하신 브랜드 로고 파일 적용</li>
              <li><b>현장 중심 UI 레이아웃</b>: 관리사가 터치하기 편한 버튼 크기, 폰트 사이즈 가독성 최적화</li>
              <li><b>고객 커뮤니케이션 톤앤매너</b>: 고객 알림장 및 메뉴명의 친근체/격식체 맞춤</li>
            </ul>
          </div>

          <div class="policy-card">
            <h4>🛡️ 예산 및 일정을 지키기 위한 협업 원칙</h4>
            <ul style="margin-left: 16px; margin-top: 4px; font-size: 12px; color: #475569;">
              <li><b>1주차 집중 디자인 합의 (1~2회)</b>: 레퍼런스 스타일과 폰트/컬러를 사전에 조율하여 확정</li>
              <li><b>핵심 기능 우선주의</b>: 11/23 심사 통과를 위해 3D 바디맵, 추천 매트릭스 알고리즘을 최우선 완성</li>
              <li><b>무한 번복 방지</b>: 기본 와이어프레임 확정 후 코딩 단계에서는 기능 무결성에 집중하여 일정 펑크 원천 방지</li>
              <li><b>납기 보장</b>: 11월 20일 이전 최종 완료하여 3~5일간 여유로운 리허설 보장</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- =========================================================================
       SECTION 4: 기술 스택, 소스코드 100% 양도 및 클라우드 유지비
       ========================================================================= -->
  <section class="section no-break">
    <h2 class="section-title"><span class="num-badge">4</span> 기술 아키텍처 & 소스코드 100% 양도 계획</h2>

    <table class="milestone-table">
      <thead>
        <tr>
          <th style="width: 140px;">구분</th>
          <th style="width: 170px;">선정 기술스택</th>
          <th>선택 이유 (비개발자 대표님 & 추후 합류할 개발자 모두를 위한 설명)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight: 700;">Frontend</td>
          <td><b>Next.js 15 (React 19, TypeScript)</b></td>
          <td>
            네이버·토스 등 국내외 빅테크 기업들이 사용하는 글로벌 표준 웹 기술입니다. 특정 사설 솔루션에 갇히지 않으며, 모든 화면이 모듈화되어 있어 추후 모바일 앱(React Native) 출시 시 화면 코드를 그대로 재사용할 수 있습니다.
          </td>
        </tr>
        <tr>
          <td style="font-weight: 700;">3D 바디 엔진</td>
          <td><b>HTML5 Canvas 3D Mesh Engine</b></td>
          <td>
            외부 유료 라이선스나 무거운 3D 파일 없이 가볍고 부드럽게 360° 회전 및 근육 발광을 구현합니다. 모바일 저사양 기기에서도 렉 없이 초고속으로 로딩됩니다.
          </td>
        </tr>
        <tr>
          <td style="font-weight: 700;">Backend & DB</td>
          <td><b>PostgreSQL & Supabase</b></td>
          <td>
            철저한 행 단위 보안(RLS)이 적용되어 고객은 본인 데이터만, 관리사는 담당 고객만 열람할 수 있습니다. 벤더 종속 없이 언제든 데이터베이스를 100% 엑셀(CSV)이나 SQL로 추출·이전할 수 있습니다.
          </td>
        </tr>
        <tr>
          <td style="font-weight: 700;">인프라 & 서버비</td>
          <td><b>Vercel Edge Cloud</b></td>
          <td>
            <b>초기 월 서버 비용 0원</b> (초기 관리사 1~3인, 고객 수십 명 기준 무료 티어로 충분). 심사 당일 접속 폭주 대비 유료 업그레이드를 하더라도 월 2~3만 원 수준으로 매우 경제적입니다.
          </td>
        </tr>
      </tbody>
    </table>

    <div class="highlight-box" style="margin-top: 14px;">
      💼 <b>지적재산권 및 소스코드 100% 이전 확약</b>: 개발 완료 후 GitHub 전체 소스코드와 데이터베이스 권한을 대표님 계정으로 100% 양도해 드립니다. 추후 다른 개발자가 보더라도 5분 만에 구조를 파악할 수 있도록 <b>[아키텍처 구조도], [데이터베이스 명세서], [설치 실행 가이드(README)]</b>를 코드 내에 깔끔하게 문서화하여 인수인계합니다.
    </div>
  </section>

  <!-- =========================================================================
       SECTION 5: 3주간 마일스톤 일정 & 계약/세금 증빙 안내
       ========================================================================= -->
  <div class="page-break"></div>

  <section class="section no-break">
    <h2 class="section-title"><span class="num-badge">5</span> 개발 일정 (11/20 조기 납품) & 계약 방식</h2>

    <table class="milestone-table">
      <thead>
        <tr>
          <th style="width: 100px;">주차</th>
          <th style="width: 160px;">마일스톤</th>
          <th>세부 작업 내용 및 산출물</th>
          <th style="width: 90px; text-align: center;">진행 상태</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight: 700;">프로토타입</td>
          <td>핵심 시연용 데모 구축</td>
          <td>4대 화면 설계, 3D 인체 바디맵 엔진, 관찰 항목 매칭 로직, 실시간 배포 완료</td>
          <td style="text-align: center;"><span class="badge-done">구축 완료</span></td>
        </tr>
        <tr>
          <td style="font-weight: 700;">1주차</td>
          <td>기획 동결 & DB 구축</td>
          <td>대표님의 실제 14년 임상 체크리스트 데이터 반영, 클리닉 디자인 톤앤매너 1차 조율, 회원/지점 DB 모델링</td>
          <td style="text-align: center;"><span style="color: #0d9488; font-weight: 700;">착수 대기</span></td>
        </tr>
        <tr>
          <td style="font-weight: 700;">2주차</td>
          <td>관리사 & 관리자 완성</td>
          <td>관리사용 회차별 차감/저장, 관리자 노코드 RuleMatrix 가중치 편집기, 유튜브 썸네일 자동 연동 완성</td>
          <td style="text-align: center;"><span style="color: #64748b; font-weight: 600;">예정</span></td>
        </tr>
        <tr>
          <td style="font-weight: 700;">3주차 (11/20)</td>
          <td>고객 모바일 & 심사 리허설</td>
          <td>고객 스마트폰 알림장 완성, 권한 보안 검증, 11/23 창업지원 심사용 시연 리허설 지원, 소스코드 및 매뉴얼 인수인계</td>
          <td style="text-align: center;"><span style="color: #64748b; font-weight: 600;">11/20 조기완료</span></td>
        </tr>
      </tbody>
    </table>

    <div class="q-card" style="margin-top: 20px;">
      <div class="q-title" style="color: #0f172a;">
        <span>📋</span> 위시켓 계약 방식 및 정부 창업지원금 세금 증빙 (프리랜서 3.3%)
      </div>
      <div class="q-answer">
        <p>
          개인 프리랜서 전문가 신분으로 위시켓에 등록되어 있어, <b>위시켓의 안전 결제(에스크로) 시스템을 통해 [프리랜서 용역 계약(사업소득세 3.3% 원천징수 공제)] 방식으로 투명하게 계약 및 정산</b>이 진행됩니다.
        </p>
        <p>
          정부 창업지원사업(예비창업패키지, 초기창업패키지, 기관 창업지원금 등)에서도 위시켓 플랫폼을 통한 프리랜서 계약 및 <b>[위시켓 표준 용역계약서, 과업완료확인서, 3.3% 원천징수영수증, 거래내역서]</b> 제출을 통해 사업비 집행이 정상 승인됩니다. 대표님의 소속 주관기관 매니저님께 제출하실 견적서, 과업계획서, 완료보고서 등 모든 행정 서류를 빈틈없이 협조해 드립니다.
        </p>
      </div>
    </div>

    <!-- Summary Statistics Grid -->
    <div class="summary-grid">
      <div class="summary-box">
        <div class="num">100%</div>
        <div class="lbl">요구 기능 구현율</div>
        <div class="sub">2-1 ~ 2-4 전 기능 포함</div>
      </div>
      <div class="summary-box">
        <div class="num">0원</div>
        <div class="lbl">초기 월 서버 유지비</div>
        <div class="sub">Vercel 무료 티어 최적화</div>
      </div>
      <div class="summary-box">
        <div class="num">11/20</div>
        <div class="lbl">조기 완료 목표일</div>
        <div class="sub">11/23 심사 전 리허설 완비</div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <p><b>Hcare CRM 맞춤형 바디케어 & 운동지도 솔루션 개발 제안서</b></p>
    <p style="margin-top: 4px;">본 제안서 및 시연 데모는 위시켓 프로젝트 심사위원 시연 및 대표님의 성공적인 사업 검증을 위해 사전 제작되었습니다.</p>
    <p style="margin-top: 8px; color: #0d9488; font-weight: 700;">실시간 시연 데모: https://hcare-crm.vercel.app/therapist</p>
  </footer>

</div>

</body>
</html>`;

const outHtmlPath = path.join(__dirname, '..', 'docs', 'PROPOSAL_DOCUMENT.html');
fs.writeFileSync(outHtmlPath, htmlContent, 'utf8');
console.log(`✓ Generated HTML proposal: ${outHtmlPath} (${fs.statSync(outHtmlPath).size} bytes)`);

// Now render to PDF using Chrome headless
const pdfPath = path.join(__dirname, '..', 'Hcare_CRM_제안서.pdf');
console.log('Generating PDF via headless Chrome...');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
try {
  execSync(
    `"${chromePath}" --headless --disable-gpu --no-sandbox --no-pdf-header-footer --print-to-pdf="${pdfPath}" "file:///${outHtmlPath.replace(/\\\\/g, '/')}"`,
    { timeout: 30000, stdio: 'inherit' }
  );
  if (fs.existsSync(pdfPath)) {
    console.log(`✓ Successfully generated PDF: ${pdfPath} (${fs.statSync(pdfPath).size} bytes)`);
  } else {
    console.error('PDF file was not created');
  }
} catch (e) {
  console.error('PDF Generation Error:', e.message);
}
