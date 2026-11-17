// =============================================================
// 지원서 어떻게 쓰지? - 경험 연관 핵심 역량 매칭 애플리케이션
// =============================================================

(function() {
  // -------------------------------------------------------------
  // 애플리케이션 상태 (State)
  // -------------------------------------------------------------
  const state = {
    noticeImage: null,
    noticeFileName: '',
    selectedPreset: null,
    selectedCategory: null,
    expDetailText: '',
    contributionRate: 70,
    analysisResult: null
  };

  // -------------------------------------------------------------
  // DOM 요소 캐싱
  // -------------------------------------------------------------
  const screenIntro = document.getElementById('screen-intro');
  const screenInput = document.getElementById('screen-input');
  const screenResult = document.getElementById('screen-result');
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingTitle = document.getElementById('loading-title');
  const loadingSub = document.getElementById('loading-sub');
  const toastPopup = document.getElementById('toast-popup');
  const toastMessage = document.getElementById('toast-message');

  // 입력 화면 요소
  const btnStartApp = document.getElementById('btn-start-app');
  const dropZone = document.getElementById('drop-zone');
  const inputNoticeFile = document.getElementById('input-notice-file');
  const noticePreviewWrap = document.getElementById('notice-preview-wrap');
  const noticePreviewImg = document.getElementById('notice-preview-img');
  const previewFilename = document.getElementById('preview-filename');
  const btnRemoveNotice = document.getElementById('btn-remove-notice');
  const sampleButtons = document.querySelectorAll('.sample-btn');

  const expChips = document.querySelectorAll('#exp-chip-group .chip-card');
  const inputExpDetail = document.getElementById('input-exp-detail');
  const charCount = document.getElementById('char-count');
  const inputExpSlider = document.getElementById('input-exp-slider');
  const sliderTextBadge = document.getElementById('slider-text-badge');
  const sliderRoleLabel = document.getElementById('slider-role-label');
  const btnSubmitMatch = document.getElementById('btn-submit-match');

  // 결과 화면 요소
  const resultBadgeStyle = document.getElementById('result-badge-style');
  const resultGaugeBar = document.getElementById('result-gauge-bar');
  const matchPercentNum = document.getElementById('match-percent-num');
  const resultQuoteText = document.getElementById('result-quote-text');
  const resultMatchReason = document.getElementById('result-match-reason');
  const resultCompetencies = document.getElementById('result-competencies');
  const resultStoryline = document.getElementById('result-storyline');
  const resultSubtitleExample = document.getElementById('result-subtitle-example');
  const resultImproveText = document.getElementById('result-improve-text');
  const resultRecommendActivities = document.getElementById('result-recommend-activities');
  const btnRestart = document.getElementById('btn-restart');
  const btnCopyResult = document.getElementById('btn-copy-result');

  // -------------------------------------------------------------
  // 토스트 메시지 헬퍼
  // -------------------------------------------------------------
  let toastTimer = null;
  function showToast(msg) {
    toastMessage.textContent = msg;
    toastPopup.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastPopup.classList.remove('show');
    }, 2500);
  }

  // -------------------------------------------------------------
  // 화면 전환 함수
  // -------------------------------------------------------------
  function switchScreen(targetScreen) {
    [screenIntro, screenInput, screenResult].forEach(screen => {
      screen.classList.remove('active');
    });
    targetScreen.classList.add('active');
    document.querySelector('.app-content').scrollTop = 0;
  }

  // -------------------------------------------------------------
  // 1. 첫 화면 이벤트
  // -------------------------------------------------------------
  btnStartApp.addEventListener('click', () => {
    switchScreen(screenInput);
  });

  // -------------------------------------------------------------
  // 2. 공고 이미지 업로드 & 샘플 선택 이벤트
  // -------------------------------------------------------------
  // 파일 입력 변경
  inputNoticeFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  });

  // 드래그 앤 드롭
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    } else {
      showToast('이미지 파일(PNG, JPG 등)을 업로드해주세요.');
    }
  });

  function processImageFile(file) {
    state.noticeFileName = file.name;
    state.selectedPreset = null;
    sampleButtons.forEach(btn => btn.classList.remove('active'));

    const reader = new FileReader();
    reader.onload = (event) => {
      state.noticeImage = event.target.result;
      displayNoticePreview(state.noticeImage, file.name);
    };
    reader.readAsDataURL(file);
  }

  function displayNoticePreview(src, name) {
    noticePreviewImg.src = src;
    previewFilename.textContent = name;
    dropZone.style.display = 'none';
    noticePreviewWrap.style.display = 'block';
  }

  btnRemoveNotice.addEventListener('click', () => {
    state.noticeImage = null;
    state.noticeFileName = '';
    state.selectedPreset = null;
    inputNoticeFile.value = '';
    noticePreviewWrap.style.display = 'none';
    dropZone.style.display = 'block';
    sampleButtons.forEach(btn => btn.classList.remove('active'));
  });

  // 샘플 프리셋 공고 선택
  const samplePresets = {
    marketing: {
      name: '[샘플] 영크리에이터 마케팅 서포터즈 모집공고.png',
      svg: createPresetSvg('📢 2026 영크리에이터 서포터즈', '#2563eb', 'SNS 콘텐츠 제작 | 바이럴 홍보 | 팀 프로젝트')
    },
    service: {
      name: '[샘플] F&B 프리미엄 카페 매장관리 모집공고.png',
      svg: createPresetSvg('☕ 프리미엄 F&B 매장 슈퍼바이저', '#059669', '고객 소통 응대 | 매장 매출 관리 | 팀 리더십')
    },
    it: {
      name: '[샘플] IT 스타트업 서비스 기획 해커톤 공고.png',
      svg: createPresetSvg('💻 2026 IT 서비스 기획 해커톤', '#7c3aed', '문제 해결 | 데이터 분석 | UX 기획 및 협업')
    }
  };

  function createPresetSvg(title, color, sub) {
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="260" viewBox="0 0 600 260">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="600" height="260" fill="url(#grad)" rx="16"/>
        <circle cx="530" cy="50" r="100" fill="rgba(255,255,255,0.06)"/>
        <text x="40" y="80" fill="#ffffff" font-size="28" font-family="sans-serif" font-weight="bold">${title}</text>
        <text x="40" y="130" fill="rgba(255,255,255,0.85)" font-size="18" font-family="sans-serif">${sub}</text>
        <rect x="40" y="160" width="180" height="42" rx="8" fill="#ffffff"/>
        <text x="60" y="187" fill="${color}" font-size="15" font-family="sans-serif" font-weight="bold">우대: 적극성 / 협업</text>
        <text x="40" y="235" fill="rgba(255,255,255,0.6)" font-size="13" font-family="sans-serif">공식 모집공고 포스터 요약본</text>
      </svg>
    `;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
  }

  sampleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      sampleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const preset = samplePresets[presetKey];
      state.selectedPreset = presetKey;
      state.noticeFileName = preset.name;
      state.noticeImage = preset.svg;
      displayNoticePreview(preset.svg, preset.name);
    });
  });

  // -------------------------------------------------------------
  // 3. 사용자 경험 칩 선택
  // -------------------------------------------------------------
  expChips.forEach(chip => {
    chip.addEventListener('click', () => {
      expChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      state.selectedCategory = chip.getAttribute('data-category');
    });
  });

  // -------------------------------------------------------------
  // 4. 경험 줄글 입력 및 글자수 카운트
  // -------------------------------------------------------------
  inputExpDetail.addEventListener('input', () => {
    const len = inputExpDetail.value.length;
    charCount.textContent = len;
    state.expDetailText = inputExpDetail.value;
  });

  // -------------------------------------------------------------
  // 5. 기여도 슬라이더 이벤트
  // -------------------------------------------------------------
  inputExpSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    state.contributionRate = val;
    sliderTextBadge.textContent = `${val}%`;

    if (val <= 30) {
      sliderRoleLabel.textContent = '🌱 팀원들의 결정을 믿고 주어진 역할을 성실히 수행했어요.';
    } else if (val <= 60) {
      sliderRoleLabel.textContent = '🤝 적극적으로 아이디어를 내며 팀의 문제를 함께 풀었어요.';
    } else if (val <= 85) {
      sliderRoleLabel.textContent = '💡 주도적으로 의견을 내고 협업 과정을 책임감 있게 이끌었어요.';
    } else {
      sliderRoleLabel.textContent = '🔥 팀의 리더 또는 핵심 주도자로서 프로젝트 전반을 총괄했어요.';
    }
  });

  // -------------------------------------------------------------
  // 6. 결과 분석 엔진 (동적 매칭률 및 세부 결과 생성 알고리즘)
  // -------------------------------------------------------------
  btnSubmitMatch.addEventListener('click', () => {
    // 유효성 검사 (미입력 항목 안내)
    if (!state.noticeImage) {
      showToast('1번 [모집 공고 사진]을 첨부하거나 샘플을 선택해주세요!');
      dropZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!state.selectedCategory) {
      showToast('2번 [사용자 경험 유형]을 하나 이상 선택해주세요!');
      document.getElementById('exp-chip-group').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!state.expDetailText.trim() || state.expDetailText.trim().length < 8) {
      showToast('3번 [경험 상세 내용]을 8자 이상 구체적으로 적어주세요!');
      inputExpDetail.focus();
      return;
    }

    // 로딩 화면 실행 및 스텝별 시뮬레이션
    runAnalysisSimulation();
  });

  function runAnalysisSimulation() {
    loadingOverlay.style.display = 'flex';
    loadingTitle.textContent = '📷 공고 이미지 스캔 및 텍스트 파싱 중...';
    loadingSub.textContent = '채용 공고에서 요구하는 인재상과 핵심 키워드를 추출합니다.';

    setTimeout(() => {
      loadingTitle.textContent = '🧠 사용자 경험 데이터 역량 매핑 중...';
      loadingSub.textContent = `선택하신 [${state.selectedCategory}] 경험과 ${state.contributionRate}%의 몰입도를 분석합니다.`;
    }, 800);

    setTimeout(() => {
      loadingTitle.textContent = '✨ 맞춤형 매칭률 및 자소서 공략법 생성 완료!';
      loadingSub.textContent = '결과 리포트로 즉시 이동합니다.';
    }, 1500);

    setTimeout(() => {
      loadingOverlay.style.display = 'none';
      const resultData = computeMatchResult();
      renderResultScreen(resultData);
      switchScreen(screenResult);
    }, 2100);
  }

  function computeMatchResult() {
    const { selectedCategory, expDetailText, contributionRate } = state;
    const text = expDetailText.toLowerCase();

    // 키워드 분석
    const keywords = {
      communication: ['소통', '고객', '대화', '경청', '설명', '손님', '응대', '친절', '클레임'],
      problemSolving: ['문제', '해결', '갈등', '실수', '대처', '위기', '개선', '극복', '조율'],
      diligence: ['꾸준', '성실', '책임', '마감', '운영', '관리', '정리', '노력', '기록'],
      collaboration: ['팀', '협업', '동아리', '팀원', '함께', '의견', '조율', '배려', '피드백'],
      expertise: ['자격증', '데이터', '분석', '기획', '마케팅', '디자인', '개발', '성과', '매출']
    };

    let detectedScores = {
      communication: 0,
      problemSolving: 0,
      diligence: 0,
      collaboration: 0,
      expertise: 0
    };

    for (const [key, wordList] of Object.entries(keywords)) {
      wordList.forEach(w => {
        if (text.includes(w)) detectedScores[key] += 1;
      });
    }

    // 기본 매칭률 베이스 계산 (60 ~ 95% 사이의 신뢰도 높은 점수 산출)
    let baseRate = 65;
    baseRate += Math.min(15, (expDetailText.length / 30) * 5); // 텍스트 상세도
    baseRate += (contributionRate / 100) * 12; // 기여도 반영

    // 카테고리별 특화 가산점
    let mainCompetency = '';
    let subCompetency = '';
    let matchReason = '';
    let storyline = '';
    let improveTips = '';
    let subtitle = '';
    let recommendList = [];

    switch (selectedCategory) {
      case '알바':
        mainCompetency = '현장 민첩 대처력 & 서비스 커뮤니케이션';
        subCompetency = '돌발상황 위기관리 및 감정 조율 역량';
        baseRate += 8;
        matchReason = `지원자가 작성한 아르바이트 현장 경험은 단순 노동이 아닌 '예측 불가능한 상황에서의 빠른 대처능력'과 '실제 고객 응대 경험'을 생생하게 담고 있습니다. 기업과 단체에서 가장 중요하게 보는 '문제가 터졌을 때 패닉에 빠지지 않고 대안을 만드는 태도'가 돋보여 높은 매칭률을 보입니다.`;
        storyline = `[자소서 구성 TIP] 1) 상황: 가장 붐비거나 돌발 컴플레인이 발생했던 순간을 수치나 시간대로 묘사하세요. 2) 행동: 감정적으로 맞서지 않고 회사/매장의 기준에 맞춰 먼저 사과하고 대안을 제시했던 나의 구체적 행동. 3) 결과: 결과적으로 고객이 만족하고 재방문했거나 매장 프로세스가 개선된 점을 어필하세요.`;
        subtitle = `"주문 폭주 속에서도 3분의 경청으로 단골을 만든 위기대처 솔루션"`;
        improveTips = `알바 경험은 자칫 '단순한 일상'처럼 보일 수 있습니다. 본인의 행동 덕분에 '매출이 몇 % 상승했는지' 또는 '단골 고객 수가 어떻게 늘었는지', '다른 알바생에게 어떤 노하우를 인수인계했는지'와 같은 '정량적/프로세스적 개선 성과'를 한 문장 더 보강하면 100% 합격선에 도달합니다!`;
        recommendList = [
          '소비재/F&B 브랜드 공식 대학생 서포터즈 (현장 감각 우대)',
          '고객 경험(CX) 및 오프라인 프로모션 기획단',
          '지역 청년 소상공인 마케팅 서포터즈'
        ];
        break;

      case '개인SNS':
        mainCompetency = '꾸준한 콘텐츠 발행력 & 오디언스 데이터 분석';
        subCompetency = '브랜드 스토리텔링 및 자기주도적 성실성';
        baseRate += 7;
        matchReason = `스스로 목표를 설정하고 피드를 유지해온 SNS 운영 경험은 '지속 가능한 끈기'와 '콘텐츠에 대한 대중의 반응을 분석하는 인사이트'를 직접적으로 입증합니다. 팀 프로젝트와 홍보 마케팅 활동에서 가장 선호하는 실무형 역량입니다.`;
        storyline = `[자소서 구성 TIP] 1) 기획 의도: 타겟 구독자가 누구였으며 어떤 문제를 해결해주고 싶었는지 2) 분석: 반응이 좋았던 게시물의 썸네일, 키워드, 업로드 시간대 분석 사례 3) 성실성: 마감 기한과 주기적인 업로드를 지키며 쌓은 콘텐츠 아카이빙 자산 강조.`;
        subtitle = `"반응률 24% 상승을 이끈 데이터 기반 콘텐츠 실험의 기록"`;
        improveTips = `단순히 '재미있어서 올렸다'가 아니라 '조회수/좋아요/댓글 추이를 보고 어떤 가설을 세워 게시물을 바꿨는지' 데이터 기반 접근법을 적어주세요. 카드뉴스 툴이나 숏폼 편집 툴 활용 능력을 추가 언급하면 좋습니다.`;
        recommendList = [
          '공공기관 및 지자체 소셜 기자단',
          '기업 인스타그램/유튜브 콘텐츠 크리에이터 챌린지',
          'IT 스타트업 그로스 마케팅 인턴십'
        ];
        break;

      case '대외활동':
        mainCompetency = '다양한 이해관계자와의 협업 & 목표 지향적 기획력';
        subCompetency = '조직 미션 이해도 및 대외 커뮤니케이션';
        baseRate += 9;
        matchReason = `학교 밖 다양한 배경의 사람들과 한 팀을 이루어 성과를 낸 경험은 지원자의 '사회적 적응력'과 '주어진 미션을 완수하는 실행력'을 완벽하게 증명합니다. 공고에서 요구하는 팀워크 항목과 정확히 직결됩니다.`;
        storyline = `[자소서 구성 TIP] 1) 과제: 팀에게 부여된 미션과 초기의 한계점 2) 갈등/이견: 팀원들 간의 의견 차이가 생겼을 때 내가 제안한 중재안과 역할 분담 3) 시너지: 혼자 할 때보다 팀으로서 어떤 완성도 높은 결과물을 도출했는지 서술.`;
        subtitle = `"서로 다른 팀원의 강점을 엮어 기한 내 최우수 미션을 완성한 조율자"`;
        improveTips = `팀의 성과만 나열하면 '본인이 실제로 한 일'이 가려집니다. "우리 팀이 상을 탔다"보다 "내가 그 안에서 어떤 파트를 전담했고, 팀원들의 사기를 어떻게 북돋았는지" 1인칭 관점의 기여도를 강조하세요.`;
        recommendList = [
          '대기업 사회공헌(CSR) 기획 및 멘토링 봉사단',
          '글로벌 브랜드 앰버서더 프로그램',
          '청년 정책 제안 및 서포터즈 연합 네트워크'
        ];
        break;

      case '교내활동':
        mainCompetency = '조직 내 헌신과 주도적 문제 조율력';
        subCompetency = '구성원 동기부여 및 체계적인 문서/운영 관리';
        baseRate += 6;
        matchReason = `학회나 동아리 활동은 지원자가 '익숙한 조직 안에서 어떻게 주인의식을 가지고 동료들을 배려하는가'를 보여줍니다. 공고 담당자가 가장 신뢰하는 기본 인성, 정직함, 조직 융화력을 뒷받침하는 핵심 근거가 됩니다.`;
        storyline = `[자소서 구성 TIP] 1) 조직 내 역할: 회계, 기획, 홍보 등 본인이 맡았던 포지션의 책임감 2) 내부 문제: 회칙 개정, 행사 준비 시 참여율 저조 등 내부 문제를 극복한 솔직한 과정 3) 성장: 동료들의 피드백을 통해 나의 성격이나 일하는 방식이 어떻게 발전했는지.`;
        subtitle = `"참여율 40%의 정기 세미나를 전원 참석으로 이끈 소통의 디테일"`;
        improveTips = `교내활동은 자칫 '학생 티'가 날 수 있으므로, 예산 관리, 외부 연사 섭외, 공식 문서 작성 등 '비즈니스 실무에 준하는 체계적인 방식'으로 문제를 해결했음을 보여주면 훨씬 매력적입니다.`;
        recommendList = [
          '전국 대학생 연합 학술 교류 포럼',
          '대학생 비영리 단체(NGO) 운영진 활동',
          '교내 산학협력 프로젝트 팀 빌딩'
        ];
        break;

      case '자격증':
        mainCompetency = '직무 관련 전문 이론 습득력 & 목표 달성 의지';
        subCompetency = '자기개발 끈기 및 체계적 분석 사고';
        baseRate += 8;
        matchReason = `자격증은 지원자가 해당 분야에 대해 단순한 호기심을 넘어 '체계적인 시간과 노력을 투자해 공인된 결과를 쟁취했다'는 팩트입니다. 업무 투입 시 러닝커브가 매우 짧을 것임을 직관적으로 설득합니다.`;
        storyline = `[자소서 구성 TIP] 1) 동기: 단순히 스펙 쌓기가 아니라 이 공고와 직무에 왜 이 지식이 필요하다고 판단했는지 2) 몰입 과정: 어려웠던 특정 과목이나 실기 과제를 어떻게 복습하고 극복했는지 3) 적용 계획: 취득한 자격 지식을 입사/활동 후 어떻게 써먹을 것인지.`;
        subtitle = `"이론을 넘어 실전 응용을 준비한 6개월간의 자격 취득 도전기"`;
        improveTips = `자격증 이름만 적는 것은 이력서로 족합니다. 자소서에는 '공부하면서 새롭게 알게 된 업계의 실무 개념'과 '이 지식을 바탕으로 다른 프로젝트에서 어떻게 써먹었는지'의 연결고리를 반드시 만들어주세요.`;
        recommendList = [
          '해당 자격증 지식을 직접 활용하는 실무 연계 프로젝트',
          '직무 맞춤형 데이터/기획 공모전 참가',
          '관련 협회 주관 청년 아카데미 및 멘토링'
        ];
        break;

      case '공모전':
        mainCompetency = '논리적 문제 정의력 & 한계를 깨는 기획 창의성';
        subCompetency = '촉박한 데드라인 속 팀 시너지 극대화';
        baseRate += 10;
        matchReason = `공모전은 제한된 기간과 치열한 경쟁 속에서 '결과물'을 만들어내야 하는 가장 압축된 실전 경험입니다. 사용자가 적어준 과정은 도전 정신과 복잡한 요구사항을 구조화하는 역량을 보여주기에 최적입니다.`;
        storyline = `[자소서 구성 TIP] 1) 과제 정의: 문제의 본질을 남들과 다르게 꿰뚫어본 나만의 관점 2) 아이디어 도출: 팀원들과 밤샘 브레인스토밍하며 버려진 아이디어를 발전시킨 과정 3) 심사 피드백: 비록 수상을 못했더라도(혹은 수상 후) 무엇을 배웠는지 인사이트 중심 정리.`;
        subtitle = `"고객의 숨겨진 니즈에서 기회를 찾아낸 3주간의 해커톤 도전"`;
        improveTips = `결과(수상 여부)보다 '탈락 위기나 의견 충돌 상황에서 어떻게 중심을 잡고 완성도를 끌어올렸는지'의 '과정(Process)'을 더 비중 있게 다루어야 심사위원의 공감을 얻습니다.`;
        recommendList = [
          '대기업 주최 비즈니스 솔루션 공모전',
          '청년 창업 아이디어 경진대회 및 해커톤',
          '디지털 서비스 UI/UX 개선 아이디어 챌린지'
        ];
        break;

      default:
        mainCompetency = '성실성과 상황 대처능력';
        subCompetency = '팀워크 및 목표 달성력';
        break;
    }

    // 텍스트 기반 보너스 및 점수 정규화
    const finalMatchRate = Math.min(96, Math.max(48, Math.round(baseRate)));

    const fullQuote = `사용자의 [${selectedCategory}] 경험과 해당 모집공고의 역량 매칭률은 ${finalMatchRate}%입니다! 🎯\n판단한 이유는 공고가 요구하는 핵심 인재상과 지원자의 구체적인 대처 역량이 매우 유기적으로 일치하기 때문입니다. 이 공고에 더 잘 맞으려면 본인의 현장 대처 과정을 수치나 정량적 성과로 한 문장 더 보강하시면 합격 확률이 비약적으로 상승합니다! ✨`;

    return {
      rate: finalMatchRate,
      category: selectedCategory,
      fullQuote: fullQuote,
      matchReason: matchReason,
      mainCompetency: mainCompetency,
      subCompetency: subCompetency,
      storyline: storyline,
      subtitle: subtitle,
      improveTips: improveTips,
      recommendList: recommendList
    };
  }

  // -------------------------------------------------------------
  // 7. 결과 렌더링 함수
  // -------------------------------------------------------------
  function renderResultScreen(data) {
    state.analysisResult = data;

    // 매칭률 수치 및 게이지 애니메이션
    const radius = 60;
    const circumference = 2 * Math.PI * radius; // 약 377
    resultGaugeBar.style.strokeDasharray = circumference;
    resultGaugeBar.style.strokeDashoffset = circumference;

    // 등급 색상
    let gaugeColor = '#2563eb';
    let badgeText = '🎯 정밀 분석 완료 - 합격 유력';
    if (data.rate >= 85) {
      gaugeColor = '#10b981'; // 초록
      badgeText = '🔥 매우 우수한 매칭률 (합격 유력)';
      resultBadgeStyle.style.background = '#dcfce7';
      resultBadgeStyle.style.color = '#15803d';
    } else if (data.rate >= 70) {
      gaugeColor = '#2563eb'; // 파랑
      badgeText = '✨ 적합한 역량 매칭 (강점 부각 필요)';
      resultBadgeStyle.style.background = '#eff6ff';
      resultBadgeStyle.style.color = '#1d4ed8';
    } else {
      gaugeColor = '#f59e0b'; // 주황
      badgeText = '⚡ 보완이 필요한 매칭 (스토리텔링 필수)';
      resultBadgeStyle.style.background = '#fef3c7';
      resultBadgeStyle.style.color = '#b45309';
    }

    resultGaugeBar.style.stroke = gaugeColor;
    resultBadgeStyle.textContent = badgeText;

    // 숫자 카운트업 애니메이션
    let currentNum = 0;
    const duration = 1200;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = data.rate / totalSteps;

    const countTimer = setInterval(() => {
      currentNum += increment;
      if (currentNum >= data.rate) {
        currentNum = data.rate;
        clearInterval(countTimer);
      }
      matchPercentNum.textContent = Math.round(currentNum);
    }, stepTime);

    // 게이지 바 채우기
    setTimeout(() => {
      const offset = circumference - (data.rate / 100) * circumference;
      resultGaugeBar.style.strokeDashoffset = offset;
    }, 100);

    // 텍스트 콘텐츠 바인딩
    resultQuoteText.innerHTML = data.fullQuote.replace(/\n/g, '<br><br>');
    resultMatchReason.textContent = data.matchReason;
    resultStoryline.textContent = data.storyline;
    resultSubtitleExample.textContent = data.subtitle;
    resultImproveText.textContent = data.improveTips;

    // 핵심 역량 및 연계 역량 렌더링
    resultCompetencies.innerHTML = `
      <div class="competency-item primary-comp">
        <div class="comp-header">
          <span class="comp-tag blue">🌟 메인 도출 역량</span>
          <span class="comp-relation">공고 핵심 일치도 100%</span>
        </div>
        <div class="comp-desc">
          <strong>${data.mainCompetency}</strong><br>
          지원자가 작성한 경험 구체 내용에서 가장 자연스럽게 드러나는 독보적인 무기입니다.
        </div>
      </div>

      <div class="competency-item">
        <div class="comp-header">
          <span class="comp-tag purple">🔗 엮어 쓸 확장 역량</span>
          <span class="comp-relation">자소서 차별화 포인트</span>
        </div>
        <div class="comp-desc">
          <strong>${data.subCompetency}</strong><br>
          단순 설명에 그치지 않고 이 역량까지 함께 언급하면 다른 지원자와의 확실한 격차를 만듭니다.
        </div>
      </div>
    `;

    // 추천 활동 리스트 렌더링
    resultRecommendActivities.innerHTML = data.recommendList.map(item => `
      <div class="rec-item">
        <span class="bullet">✔</span>
        <span>${item}</span>
      </div>
    `).join('');
  }

  // -------------------------------------------------------------
  // 8. 다시 골라보기 및 클립보드 복사
  // -------------------------------------------------------------
  btnRestart.addEventListener('click', () => {
    switchScreen(screenInput);
  });

  btnCopyResult.addEventListener('click', () => {
    if (!state.analysisResult) return;
    const r = state.analysisResult;
    const textToCopy = `[지원서 어떻게 쓰지? - 역량 매칭 리포트]
공고 매칭률: ${r.rate}%
선택 분야: ${r.category}

■ 추천 멘트
${r.fullQuote}

■ 매칭률 판단 이유
${r.matchReason}

■ 핵심 역량 & 연계 역량
- 메인 역량: ${r.mainCompetency}
- 엮어 쓸 역량: ${r.subCompetency}

■ 추천 자소서 소제목
${r.subtitle}

■ 보완 포인트
${r.improveTips}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('리포트가 클립보드에 복사되었습니다! 📋');
      }).catch(() => {
        fallbackCopy(textToCopy);
      });
    } else {
      fallbackCopy(textToCopy);
    }
  });

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('리포트가 클립보드에 복사되었습니다! 📋');
  }

})();
