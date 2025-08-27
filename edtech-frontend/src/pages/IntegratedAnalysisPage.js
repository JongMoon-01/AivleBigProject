import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IntegratedWebcamAnalysis from '../components/IntegratedWebcamAnalysis';

const IntegratedAnalysisPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    userId: 'student1',
    userName: '학생',
    sessionId: null,
  });

  // 세션 ID 생성
  useEffect(() => {
    const sessionId = `integrated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setUserInfo(prev => ({ ...prev, sessionId }));
  }, []);


  // 히스토리 다운로드
  const downloadHistory = async () => {
    try {
      const response = await fetch(`http://8000-jongmoon01-aivlebigproj-nlz155kcbyd.ws-us121.gitpod.io/api/analyze/integrated/history?user_id=${userInfo.userId}`);
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `integrated_analysis_${userInfo.userId}_${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('히스토리 다운로드 실패:', error);
    }
  };

  // 히스토리 삭제
  const clearHistory = async () => {
    if (window.confirm('모든 분석 히스토리를 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`http://8000-jongmoon01-aivlebigproj-nlz155kcbyd.ws-us121.gitpod.io/api/integrated/history/clear?user_id=${userInfo.userId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          const data = await response.json();
          alert(`${data.deleted_records}개의 기록이 삭제되었습니다.`);
        }
      } catch (error) {
        console.error('히스토리 삭제 실패:', error);
      }
    }
  };


  return (
    <div className="container mx-auto py-8 px-4">
      {/* 페이지 헤더 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">통합 집중도 분석</h1>
            <p className="text-gray-600 mt-2">
              감정 분석과 시선 추적을 통합하여 정확한 집중도를 측정합니다
            </p>
            <div className="mt-2 flex gap-4 text-sm text-gray-500">
              <span>🔹 MobileNet 감정 분석</span>
              <span>🔹 L2CS-Net 시선 추적</span>
              <span>🔹 동적 가중치 적용</span>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={downloadHistory}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              데이터 다운로드
            </button>
            
            <button
              onClick={clearHistory}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              히스토리 삭제
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              뒤로가기
            </button>
          </div>
        </div>
      </div>

      {/* 사용자 정보 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-600">사용자 ID</span>
            <p className="text-lg font-semibold">{userInfo.userId}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">사용자명</span>
            <p className="text-lg font-semibold">{userInfo.userName}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">세션 ID</span>
            <p className="text-sm font-semibold text-gray-500">
              {userInfo.sessionId?.substring(0, 25)}...
            </p>
          </div>
        </div>
      </div>


      {/* 통합 웹캠 분석 컴포넌트 */}
      <IntegratedWebcamAnalysis 
        userId={userInfo.userId} 
        sessionId={userInfo.sessionId}
      />

      {/* 사용 안내 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">통합 분석 시스템 안내</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-700">
          <div>
            <h4 className="font-medium mb-2">🎯 분석 방식</h4>
            <ul className="space-y-1 text-sm">
              <li>• 감정 분석: MobileNet 기반 5가지 감정 분석</li>
              <li>• 시선 분석: L2CS-Net 기반 시선 방향 추적</li>
              <li>• 통합 점수: 동적 가중치를 적용한 최종 집중도</li>
              <li>• 보너스 시스템: 높은 집중도 시 추가 점수 부여</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">⚙️ 사용법</h4>
            <ul className="space-y-1 text-sm">
              <li>• 웹캠 권한 허용 후 '통합 분석 시작' 클릭</li>
              <li>• 가중치 슬라이더로 감정/시선 비율 조정 가능</li>
              <li>• 실시간으로 개별 분석 결과와 통합 점수 확인</li>
              <li>• 차트를 통해 시간별 집중도 변화 추적</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedAnalysisPage;