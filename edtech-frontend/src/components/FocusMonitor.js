import React, { useState, useEffect, useCallback } from 'react';

const FocusMonitor = ({ userId, isActive = true }) => {
  const [currentFocusScore, setCurrentFocusScore] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  const [settings, setSettings] = useState({
    lowThreshold: 30,      // 집중도 30% 이하 시 경고
    criticalThreshold: 15, // 집중도 15% 이하 시 긴급 경고
    monitoringInterval: 5000, // 5초마다 체크
    alertCooldown: 30000   // 30초 쿨다운
  });
  const [lastAlertTime, setLastAlertTime] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setPermissionGranted(true);
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setPermissionGranted(permission === 'granted');
        });
      }
    }
  }, []);

  // 집중도 데이터 가져오기 (FastAPI 연동)
  const fetchCurrentFocusScore = useCallback(async () => {
    try {
      // FastAPI 서버에서 실시간 집중도 데이터 가져오기
      const response = await fetch(`http://localhost:8001/api/focus-monitor/current-score/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        const score = data.focus_score;
        setCurrentFocusScore(score);
        return score;
      } else {
        // API 호출 실패 시 시뮬레이션 데이터 사용
        console.warn('FastAPI 연결 실패, 시뮬레이션 데이터 사용');
        const simulatedScore = Math.floor(Math.random() * 100);
        setCurrentFocusScore(simulatedScore);
        return simulatedScore;
      }
    } catch (error) {
      console.error('집중도 데이터 가져오기 실패:', error);
      // 네트워크 오류 시 시뮬레이션 데이터 사용
      const simulatedScore = Math.floor(Math.random() * 100);
      setCurrentFocusScore(simulatedScore);
      return simulatedScore;
    }
  }, [userId]);

  // 브라우저 알림 발송
  const sendBrowserNotification = (title, body, type = 'warning') => {
    if (!permissionGranted) return;

    const notification = new Notification(title, {
      body,
      icon: type === 'critical' ? '🚨' : '⚠️',
      badge: '/favicon.ico',
      tag: 'focus-alert',
      requireInteraction: type === 'critical',
      silent: false
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // 5초 후 자동 닫기 (긴급이 아닌 경우)
    if (type !== 'critical') {
      setTimeout(() => notification.close(), 5000);
    }
  };

  // 집중도별 맞춤 메시지 생성 (시간대 고려)
  const generateFocusMessage = (score, type) => {
    const currentHour = new Date().getHours();
    
    const baseMessages = {
      critical: [
        `🚨 집중도 위험 수준 (${score}%) - 즉시 5-10분 휴식을 권장합니다`,
        `🚨 매우 낮은 집중도 (${score}%) - 가벼운 스트레칭이나 심호흡을 해보세요`,
        `🚨 긴급 알림 (${score}%) - 잠시 학습을 멈추고 휴식을 취하세요`,
        `🚨 집중도 임계점 (${score}%) - 물을 마시고 목을 돌려보세요`
      ],
      warning: [
        `⚠️ 집중도 저하 감지 (${score}%) - 2-3분 휴식 후 계속하세요`,
        `⚠️ 주의 필요 (${score}%) - 바른 자세로 앉아보세요`,
        `⚠️ 집중력 회복 필요 (${score}%) - 깊게 숨을 들이마셔보세요`,
        `⚠️ 피로 징후 (${score}%) - 잠시 눈을 감고 휴식하세요`,
        `⚠️ 집중도 개선 필요 (${score}%) - 화면에서 눈을 돌려 먼 곳을 바라보세요`
      ]
    };

    // 시간대별 추가 메시지
    const timeSpecificMessages = {
      morning: { // 6-12시
        critical: [`🚨 오전 집중도 급락 (${score}%) - 아침 루틴을 점검해보세요`],
        warning: [`⚠️ 오전 피로감 (${score}%) - 가벼운 모닝 스트레칭을 해보세요`]
      },
      afternoon: { // 12-18시
        critical: [`🚨 오후 집중력 한계 (${score}%) - 점심 후 졸음, 10분 파워냅을 고려하세요`],
        warning: [`⚠️ 오후 슬럼프 (${score}%) - 따뜻한 차 한 잔과 함께 잠시 휴식하세요`]
      },
      evening: { // 18-24시
        critical: [`🚨 저녁 과로 징후 (${score}%) - 오늘은 여기서 마무리하는 것을 권장합니다`],
        warning: [`⚠️ 저녁 피로 누적 (${score}%) - 목과 어깨 마사지를 해보세요`]
      }
    };

    let timeCategory = 'morning';
    if (currentHour >= 12 && currentHour < 18) timeCategory = 'afternoon';
    else if (currentHour >= 18) timeCategory = 'evening';

    // 기본 메시지와 시간대별 메시지 결합
    const allMessages = [
      ...baseMessages[type],
      ...(timeSpecificMessages[timeCategory][type] || [])
    ];
    
    return allMessages[Math.floor(Math.random() * allMessages.length)];
  };

  // 시각적 경고 표시 및 서버에 저장
  const showVisualAlert = async (type, score) => {
    const message = generateFocusMessage(score, type);
    
    const alertData = {
      id: Date.now(),
      type,
      score,
      timestamp: new Date(),
      message
    };

    setAlertHistory(prev => [alertData, ...prev.slice(0, 9)]); // 최근 10개만 유지

    // FastAPI 서버에 알림 저장
    try {
      await fetch(`http://localhost:8001/api/focus-monitor/alert/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alert_type: type,
          focus_score: score,
          message: alertData.message
        })
      });
    } catch (error) {
      console.error('알림 저장 실패:', error);
    }

    // 페이지 전체에 경고 효과
    if (type === 'critical') {
      document.body.style.animation = 'focus-alert-critical 0.5s ease-in-out 3';
    } else {
      document.body.style.animation = 'focus-alert-warning 0.3s ease-in-out 2';
    }

    setTimeout(() => {
      document.body.style.animation = '';
    }, 2000);
  };

  // 집중도 분석 및 알림 처리
  const analyzeAndAlert = useCallback(async () => {
    if (!isActive) return;

    const score = await fetchCurrentFocusScore();
    if (score === null) return;

    const now = Date.now();
    const timeSinceLastAlert = now - lastAlertTime;

    // 쿨다운 시간 확인
    if (timeSinceLastAlert < settings.alertCooldown) return;

    // 긴급 경고 (15% 이하)
    if (score <= settings.criticalThreshold) {
      const message = generateFocusMessage(score, 'critical');
      sendBrowserNotification(
        '🚨 집중도 긴급 경고',
        message,
        'critical'
      );
      showVisualAlert('critical', score);
      setLastAlertTime(now);
    }
    // 일반 경고 (30% 이하)
    else if (score <= settings.lowThreshold) {
      const message = generateFocusMessage(score, 'warning');
      sendBrowserNotification(
        '⚠️ 집중도 저하 알림',
        message,
        'warning'
      );
      showVisualAlert('warning', score);
      setLastAlertTime(now);
    }
  }, [isActive, fetchCurrentFocusScore, settings, lastAlertTime, permissionGranted]);

  // 정기적 모니터링
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(analyzeAndAlert, settings.monitoringInterval);
    return () => clearInterval(interval);
  }, [analyzeAndAlert, settings.monitoringInterval, isActive]);

  // CSS 애니메이션 스타일 추가
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes focus-alert-warning {
        0%, 100% { background-color: transparent; }
        50% { background-color: rgba(255, 193, 7, 0.1); }
      }
      
      @keyframes focus-alert-critical {
        0%, 100% { background-color: transparent; }
        50% { background-color: rgba(220, 53, 69, 0.15); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="focus-monitor">
      {/* 현재 집중도 표시 */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">실시간 집중도 모니터링</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">{isActive ? '모니터링 중' : '비활성'}</span>
          </div>
        </div>
        
        {currentFocusScore !== null && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900">{currentFocusScore}%</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentFocusScore <= 15 ? 'bg-red-100 text-red-800' :
                currentFocusScore <= 30 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {currentFocusScore <= 15 ? '매우 낮음' :
                 currentFocusScore <= 30 ? '낮음' :
                 currentFocusScore <= 60 ? '보통' : '좋음'}
              </span>
            </div>
            
            {/* 집중도 프로그레스 바 */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  currentFocusScore <= 15 ? 'bg-red-500' :
                  currentFocusScore <= 30 ? 'bg-yellow-500' :
                  currentFocusScore <= 60 ? 'bg-blue-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.max(currentFocusScore, 5)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 경고 설정 */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
        <h4 className="text-md font-semibold text-gray-800 mb-3">경고 설정</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">일반 경고 임계값</label>
            <input
              type="range"
              min="10"
              max="50"
              value={settings.lowThreshold}
              onChange={(e) => setSettings(prev => ({...prev, lowThreshold: parseInt(e.target.value)}))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-600">{settings.lowThreshold}% 이하</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">긴급 경고 임계값</label>
            <input
              type="range"
              min="5"
              max="25"
              value={settings.criticalThreshold}
              onChange={(e) => setSettings(prev => ({...prev, criticalThreshold: parseInt(e.target.value)}))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-600">{settings.criticalThreshold}% 이하</span>
          </div>
        </div>
      </div>

      {/* 집중도 개선 권장사항 */}
      {currentFocusScore <= 30 && (
        <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
          <h4 className="text-md font-semibold text-orange-800 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            집중도 개선 가이드
          </h4>
          <div className="space-y-2 text-sm text-orange-700">
            <div className="flex items-start space-x-2">
              <span className="text-orange-500">•</span>
              <span><strong>즉시 실천:</strong> 바른 자세로 앉고 어깨를 펴세요</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-orange-500">•</span>
              <span><strong>호흡법:</strong> 4초 들이마시고 4초 참고 4초 내쉬기</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-orange-500">•</span>
              <span><strong>시선 관리:</strong> 20-20-20 법칙 (20분마다 20피트 거리를 20초간)</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-orange-500">•</span>
              <span><strong>환경 점검:</strong> 조명, 온도, 소음 수준 확인</span>
            </div>
            {currentFocusScore <= 15 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-800">
                  <span className="mr-2">🚨</span>
                  <strong>긴급 권장: 5-10분 완전 휴식 필요</strong>
                </div>
                <p className="text-red-700 text-xs mt-1">
                  컴퓨터에서 완전히 떨어져 가벼운 산책이나 스트레칭을 해보세요
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 최근 알림 히스토리 */}
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h4 className="text-md font-semibold text-gray-800 mb-3">최근 알림</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {alertHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">알림 기록이 없습니다.</p>
          ) : (
            alertHistory.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'critical' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{alert.message}</span>
                  <span className="text-xs text-gray-500">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusMonitor;