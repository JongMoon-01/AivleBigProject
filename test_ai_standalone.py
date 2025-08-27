#!/usr/bin/env python3
"""
AI 집중도 분석 시스템 독립 테스트 스크립트
MobileNet과 L2CS 모델을 사용한 통합 분석 테스트
"""

import requests
import base64
import json
import time
import sys
import os
from datetime import datetime

# API 서버 설정
API_BASE_URL = "http://localhost:8000"

def check_server_health():
    """서버 상태 확인"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ 서버가 정상적으로 실행 중입니다.")
            return True
        else:
            print(f"❌ 서버 응답 오류: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ 서버에 연결할 수 없습니다. FastAPI 서버가 실행 중인지 확인하세요.")
        print("   실행 명령: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        return False
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return False

def load_test_image(image_path=None):
    """테스트용 이미지 로드 및 Base64 인코딩"""
    # 웹캠 사용 시도
    try:
        import cv2
        
        if image_path and os.path.exists(image_path):
            print(f"📷 이미지 파일 로드: {image_path}")
            image = cv2.imread(image_path)
        else:
            print("📷 웹캠에서 이미지 캡처 중...")
            cap = cv2.VideoCapture(0)
            ret, image = cap.read()
            cap.release()
            
            if not ret:
                print("❌ 웹캠에서 이미지를 캡처할 수 없습니다.")
                return None
        
        # Base64 인코딩
        _, buffer = cv2.imencode('.jpg', image)
        base64_image = base64.b64encode(buffer).decode('utf-8')
        print("✅ 이미지 준비 완료")
        return f"data:image/jpeg;base64,{base64_image}"
        
    except ImportError:
        print("⚠️ OpenCV가 설치되지 않았습니다. 더미 이미지를 사용합니다.")
        # 1x1 픽셀 흰색 이미지 (테스트용)
        dummy_image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="
        return dummy_image

def test_mobilenet_analysis(base64_image):
    """MobileNet 감정 분석 테스트"""
    print("\n" + "="*50)
    print("🧠 MobileNet 감정 분석 테스트")
    print("="*50)
    
    url = f"{API_BASE_URL}/api/mobilenet/analyze"
    data = {
        "base64_image": base64_image,
        "user_id": "test_user",
        "session_id": f"test_session_{int(time.time())}"
    }
    
    try:
        start_time = time.time()
        response = requests.post(url, json=data, timeout=10)
        processing_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 분석 성공 (처리 시간: {processing_time:.2f}초)")
            print(f"📊 감정: {result.get('emotion', 'N/A')}")
            print(f"📊 신뢰도: {result.get('confidence', 0):.2%}")
            print(f"📊 집중도 점수: {result.get('attention_score', 0)}/100")
            print(f"📊 얼굴 감지: {'✅' if result.get('face_detected') else '❌'}")
            
            if 'emotion_scores' in result:
                print("\n감정별 점수:")
                for emotion, score in result['emotion_scores'].items():
                    print(f"  - {emotion}: {score:.2%}")
            
            return True
        else:
            print(f"❌ 분석 실패: {response.status_code}")
            print(f"   응답: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return False

def test_integrated_analysis(base64_image):
    """통합 집중도 분석 테스트 (감정 + 시선)"""
    print("\n" + "="*50)
    print("🎯 통합 집중도 분석 테스트 (MobileNet + L2CS)")
    print("="*50)
    
    url = f"{API_BASE_URL}/api/integrated/analyze"
    data = {
        "base64_image": base64_image,
        "user_id": "test_user",
        "session_id": f"test_session_{int(time.time())}"
    }
    
    try:
        start_time = time.time()
        response = requests.post(url, json=data, timeout=15)
        processing_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 분석 성공 (처리 시간: {processing_time:.2f}초)")
            print(f"📊 통합 집중도 점수: {result.get('integrated_attention_score', 0):.1f}/100")
            print(f"📊 집중도 레벨: {result.get('attention_level', 'N/A')}")
            
            # 감정 데이터
            if 'emotion_data' in result:
                emotion = result['emotion_data']
                print(f"\n감정 분석:")
                print(f"  - 감정: {emotion.get('emotion', 'N/A')}")
                print(f"  - 신뢰도: {emotion.get('confidence', 0):.2%}")
                print(f"  - 감정 기반 집중도: {emotion.get('emotion_based_attention', 0)}")
            
            # 시선 데이터
            if 'gaze_data' in result:
                gaze = result['gaze_data']
                print(f"\n시선 분석:")
                print(f"  - Yaw (좌우): {gaze.get('yaw', 0):.1f}°")
                print(f"  - Pitch (상하): {gaze.get('pitch', 0):.1f}°")
                print(f"  - 시선 기반 집중도: {gaze.get('gaze_attention_score', 0):.1f}")
            
            print(f"\n⏱️ 처리 시간: {result.get('processing_time', processing_time):.3f}초")
            return True
        else:
            print(f"❌ 분석 실패: {response.status_code}")
            print(f"   응답: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return False

def test_history_api():
    """히스토리 API 테스트"""
    print("\n" + "="*50)
    print("📚 히스토리 API 테스트")
    print("="*50)
    
    # MobileNet 히스토리
    url = f"{API_BASE_URL}/api/mobilenet/history?user_id=test_user&limit=5"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            history = response.json()
            print(f"✅ MobileNet 히스토리: {len(history)}개 항목")
        else:
            print(f"❌ MobileNet 히스토리 조회 실패: {response.status_code}")
    except Exception as e:
        print(f"❌ 오류: {e}")
    
    # 통합 분석 히스토리
    url = f"{API_BASE_URL}/api/integrated/history?user_id=test_user&limit=5"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            history = response.json()
            print(f"✅ 통합 분석 히스토리: {len(history)}개 항목")
        else:
            print(f"❌ 통합 분석 히스토리 조회 실패: {response.status_code}")
    except Exception as e:
        print(f"❌ 오류: {e}")

def test_statistics_api():
    """통계 API 테스트"""
    print("\n" + "="*50)
    print("📈 통계 API 테스트")
    print("="*50)
    
    # MobileNet 통계
    url = f"{API_BASE_URL}/api/mobilenet/statistics?user_id=test_user"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ MobileNet 통계:")
            print(f"  - 총 분석: {stats.get('total_analyses', 0)}회")
            print(f"  - 평균 집중도: {stats.get('average_attention', 0):.1f}")
            print(f"  - 얼굴 감지율: {stats.get('face_detection_rate', 0):.1f}%")
        else:
            print(f"❌ MobileNet 통계 조회 실패: {response.status_code}")
    except Exception as e:
        print(f"❌ 오류: {e}")
    
    # 통합 분석 통계
    url = f"{API_BASE_URL}/api/integrated/statistics?user_id=test_user"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ 통합 분석 통계:")
            print(f"  - 총 분석: {stats.get('total_analyses', 0)}회")
            print(f"  - 평균 통합 집중도: {stats.get('average_integrated_attention', 0):.1f}")
        else:
            print(f"❌ 통합 분석 통계 조회 실패: {response.status_code}")
    except Exception as e:
        print(f"❌ 오류: {e}")

def main():
    """메인 테스트 실행"""
    print("\n" + "="*60)
    print("🚀 AI 집중도 분석 시스템 독립 테스트")
    print("="*60)
    print(f"시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 1. 서버 상태 확인
    if not check_server_health():
        print("\n⚠️ 서버가 실행되지 않았습니다.")
        print("다음 명령으로 서버를 시작하세요:")
        print("cd attention-model-fastapi-service && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        sys.exit(1)
    
    # 2. 테스트 이미지 준비
    image_path = None  # 특정 이미지를 사용하려면 경로 지정
    base64_image = load_test_image(image_path)
    if not base64_image:
        print("❌ 테스트 이미지를 준비할 수 없습니다.")
        sys.exit(1)
    
    # 3. 각 API 테스트
    test_results = []
    
    # MobileNet 테스트
    result = test_mobilenet_analysis(base64_image)
    test_results.append(("MobileNet 감정 분석", result))
    time.sleep(1)  # API 부하 방지
    
    # 통합 분석 테스트
    result = test_integrated_analysis(base64_image)
    test_results.append(("통합 집중도 분석", result))
    time.sleep(1)
    
    # 히스토리 테스트
    test_history_api()
    
    # 통계 테스트
    test_statistics_api()
    
    # 4. 테스트 결과 요약
    print("\n" + "="*60)
    print("📋 테스트 결과 요약")
    print("="*60)
    
    for test_name, success in test_results:
        status = "✅ 성공" if success else "❌ 실패"
        print(f"{test_name}: {status}")
    
    total_tests = len(test_results)
    passed_tests = sum(1 for _, success in test_results if success)
    
    print(f"\n총 {total_tests}개 테스트 중 {passed_tests}개 통과")
    print(f"종료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if passed_tests == total_tests:
        print("\n🎉 모든 테스트가 성공적으로 완료되었습니다!")
        return 0
    else:
        print(f"\n⚠️ {total_tests - passed_tests}개 테스트가 실패했습니다.")
        return 1

if __name__ == "__main__":
    sys.exit(main())