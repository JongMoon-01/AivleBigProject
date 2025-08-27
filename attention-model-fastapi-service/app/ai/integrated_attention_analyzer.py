import numpy as np
from typing import Dict, Optional, Tuple
from .mobilenet_processor import MobilenetProcessor
from .l2cs_gaze_tracker import L2CSGazeTracker
import json

class IntegratedAttentionAnalyzer:
    """
    감정 분석(MobileNet)과 시선 분석(L2CS-Net)을 통합하여 
    종합적인 집중도를 계산하는 분석기
    """
    
    def __init__(self, 
                 emotion_weight: float = 0.6, 
                 gaze_weight: float = 0.4,
                 mobilenet_path: str = "/workspace/AivleBigProject/Mobilenet_model_trained.keras",
                 l2cs_path: str = "/workspace/AivleBigProject/extracted_models/2. 학습 모델 파일/l2cs_trained.pkl"):
        """
        통합 집중도 분석기 초기화
        
        Args:
            emotion_weight: 감정 분석 가중치 (기본값: 0.6)
            gaze_weight: 시선 분석 가중치 (기본값: 0.4)  
            mobilenet_path: MobileNet 모델 경로
            l2cs_path: L2CS-Net 모델 경로
        """
        self.emotion_weight = emotion_weight
        self.gaze_weight = gaze_weight
        
        # 가중치 정규화
        total_weight = emotion_weight + gaze_weight
        self.emotion_weight = emotion_weight / total_weight
        self.gaze_weight = gaze_weight / total_weight
        
        # 개별 분석기 초기화
        self.emotion_analyzer = MobilenetProcessor(model_path=mobilenet_path)
        self.gaze_tracker = L2CSGazeTracker(model_path=l2cs_path)
        
        # 집중도 레벨 임계값
        self.attention_thresholds = {
            'very_high': 90,    # 매우 높음
            'high': 75,         # 높음  
            'medium': 60,       # 보통
            'low': 40,          # 낮음
            'very_low': 0       # 매우 낮음
        }
        
        print("Integrated Attention Analyzer initialized successfully")
    
    def set_weights(self, emotion_weight: float, gaze_weight: float):
        """
        가중치 수동 설정
        
        Args:
            emotion_weight: 감정 분석 가중치 (0-1)
            gaze_weight: 시선 분석 가중치 (0-1)
        """
        # 정규화
        total = emotion_weight + gaze_weight
        if total > 0:
            self.emotion_weight = emotion_weight / total
            self.gaze_weight = gaze_weight / total
        else:
            self.emotion_weight = 0.6
            self.gaze_weight = 0.4
    
    def calculate_dynamic_weights(self, emotion_result: Dict, gaze_result: Dict, use_dynamic: bool = False) -> Tuple[float, float]:
        """
        분석 결과의 신뢰도를 기반으로 동적 가중치 계산
        
        Args:
            emotion_result: 감정 분석 결과
            gaze_result: 시선 분석 결과
            use_dynamic: 동적 가중치 사용 여부 (기본값: False)
            
        Returns:
            (emotion_weight, gaze_weight): 가중치 튜플
        """
        # 사용자가 설정한 가중치 사용 (동적 조정 없음)
        if not use_dynamic:
            return self.emotion_weight, self.gaze_weight
        
        # 동적 가중치 계산 (use_dynamic=True일 때만)
        emotion_w = self.emotion_weight
        gaze_w = self.gaze_weight
        
        # 얼굴 감지 실패 시 가중치 조정
        if not emotion_result.get('face_detected', False):
            emotion_w *= 0.3  # 감정 분석 가중치 대폭 감소
            gaze_w = 1.0 - emotion_w
        
        if not gaze_result.get('face_detected', False):
            gaze_w *= 0.3  # 시선 분석 가중치 대폭 감소
            emotion_w = 1.0 - gaze_w
        
        # 신뢰도 기반 조정
        emotion_confidence = emotion_result.get('confidence', 0.5)
        gaze_confidence = gaze_result.get('confidence', 0.5)
        
        # 신뢰도가 높은 쪽의 가중치 증가
        if emotion_confidence > gaze_confidence + 0.2:
            emotion_w = min(0.8, emotion_w + 0.1)
            gaze_w = 1.0 - emotion_w
        elif gaze_confidence > emotion_confidence + 0.2:
            gaze_w = min(0.8, gaze_w + 0.1)
            emotion_w = 1.0 - gaze_w
        
        # 정규화
        total = emotion_w + gaze_w
        if total > 0:
            emotion_w /= total
            gaze_w /= total
        
        return emotion_w, gaze_w
    
    def calculate_attention_bonus(self, emotion_result: Dict, gaze_result: Dict) -> float:
        """
        감정과 시선이 모두 집중적일 때 보너스 점수 계산
        
        Args:
            emotion_result: 감정 분석 결과
            gaze_result: 시선 분석 결과
            
        Returns:
            보너스 점수 (0-10)
        """
        bonus = 0.0
        
        # 두 분석 모두 성공했을 때만 보너스 적용
        if (emotion_result.get('face_detected', False) and 
            gaze_result.get('face_detected', False)):
            
            emotion_score = emotion_result.get('attention_score', 0)
            gaze_score = gaze_result.get('attention_score', 0)
            
            # 둘 다 높은 점수일 때 시너지 보너스
            if emotion_score >= 80 and gaze_score >= 80:
                bonus = min(10, (emotion_score + gaze_score - 160) * 0.1)
            
            # 감정이 '집중'이고 시선도 정면일 때 추가 보너스
            if (emotion_result.get('emotion') == '집중' and 
                abs(gaze_result.get('gaze_angles_deg', {}).get('yaw', 0)) < 10 and
                abs(gaze_result.get('gaze_angles_deg', {}).get('pitch', 0)) < 10):
                bonus += 5
        
        return min(10, bonus)  # 최대 10점 보너스
    
    def get_attention_level(self, attention_score: float) -> str:
        """집중도 점수를 레벨로 변환"""
        if attention_score >= self.attention_thresholds['very_high']:
            return 'very_high'
        elif attention_score >= self.attention_thresholds['high']:
            return 'high'
        elif attention_score >= self.attention_thresholds['medium']:
            return 'medium'
        elif attention_score >= self.attention_thresholds['low']:
            return 'low'
        else:
            return 'very_low'
    
    def get_attention_message(self, attention_level: str, emotion: str, gaze_score: float) -> str:
        """집중도 레벨에 따른 메시지 생성"""
        messages = {
            'very_high': [
                "완벽한 집중 상태입니다! 이 상태를 계속 유지해보세요.",
                "매우 높은 집중도를 보이고 있습니다. 훌륭해요!",
                "최고의 학습 상태입니다. 지금처럼 계속해주세요."
            ],
            'high': [
                "좋은 집중 상태입니다. 계속 유지해보세요.",
                "집중도가 높습니다. 잘하고 있어요!",
                "안정적인 학습 상태를 보이고 있습니다."
            ],
            'medium': [
                "보통 수준의 집중도입니다. 조금 더 집중해보세요.",
                "집중도를 높일 여지가 있습니다.",
                "자세를 바로잡고 화면에 집중해보세요."
            ],
            'low': [
                "집중도가 다소 떨어지고 있습니다. 잠시 휴식을 취해보세요.",
                "산만해 보입니다. 주변 환경을 정리해보세요.",
                "집중하기 어려운 상태인 것 같습니다. 환경을 점검해보세요."
            ],
            'very_low': [
                "집중도가 매우 낮습니다. 충분한 휴식이 필요해 보입니다.",
                "학습하기 어려운 상태입니다. 잠시 쉬어가세요.",
                "컨디션을 회복한 후 다시 시작해보세요."
            ]
        }
        
        # 감정별 특별 메시지
        if emotion == '졸음':
            return "졸음이 감지되었습니다. 잠시 휴식을 취하거나 스트레칭을 해보세요."
        elif emotion == '지루함':
            return "지루함이 감지되었습니다. 학습 방법을 바꿔보거나 잠시 쉬어보세요."
        elif emotion == '혼란':
            return "혼란스러워 보입니다. 이해가 안 되는 부분이 있다면 다시 복습해보세요."
        
        import random
        return random.choice(messages.get(attention_level, messages['medium']))
    
    def analyze_integrated_attention(self, base64_image: str) -> Dict:
        """
        통합 집중도 분석 수행
        
        Args:
            base64_image: Base64 인코딩된 이미지
            
        Returns:
            통합 분석 결과 딕셔너리
        """
        result = {
            'timestamp': None,
            'integrated_attention_score': 0,
            'attention_level': 'very_low',
            'attention_message': '',
            'emotion_analysis': {},
            'gaze_analysis': {},
            'weights_used': {'emotion': self.emotion_weight, 'gaze': self.gaze_weight},
            'bonus_score': 0,
            'analysis_success': False
        }
        
        try:
            import datetime
            result['timestamp'] = datetime.datetime.now().isoformat()
            
            # 1. 감정 분석 수행
            print("Performing emotion analysis...")
            emotion_result = self.emotion_analyzer.analyze_emotion(base64_image)
            result['emotion_analysis'] = emotion_result
            
            # 2. 시선 분석 수행  
            print("Performing gaze analysis...")
            gaze_result = self.gaze_tracker.analyze_gaze(base64_image)
            result['gaze_analysis'] = gaze_result
            
            # 3. 동적 가중치 계산
            dynamic_emotion_weight, dynamic_gaze_weight = self.calculate_dynamic_weights(
                emotion_result, gaze_result
            )
            result['weights_used'] = {
                'emotion': round(dynamic_emotion_weight, 3),
                'gaze': round(dynamic_gaze_weight, 3)
            }
            
            # 4. 기본 집중도 점수 계산
            emotion_score = emotion_result.get('attention_score', 0)
            gaze_score = gaze_result.get('attention_score', 0)
            
            base_attention_score = (
                emotion_score * dynamic_emotion_weight + 
                gaze_score * dynamic_gaze_weight
            )
            
            # 5. 보너스 점수 계산
            bonus_score = self.calculate_attention_bonus(emotion_result, gaze_result)
            result['bonus_score'] = round(bonus_score, 1)
            
            # 6. 최종 집중도 점수
            final_attention_score = min(100, base_attention_score + bonus_score)
            result['integrated_attention_score'] = round(final_attention_score, 1)
            
            # 7. 집중도 레벨 및 메시지
            attention_level = self.get_attention_level(final_attention_score)
            result['attention_level'] = attention_level
            result['attention_message'] = self.get_attention_message(
                attention_level, 
                emotion_result.get('emotion', '알 수 없음'),
                gaze_score
            )
            
            # 8. 분석 성공 여부
            result['analysis_success'] = (
                emotion_result.get('face_detected', False) or 
                gaze_result.get('face_detected', False)
            )
            
            print(f"Integrated attention analysis completed. Score: {final_attention_score}")
            
        except Exception as e:
            print(f"Error in integrated attention analysis: {e}")
            result['error'] = str(e)
        
        return result
    
    def get_analysis_summary(self, analysis_results: list) -> Dict:
        """
        여러 분석 결과의 요약 통계 계산
        
        Args:
            analysis_results: 분석 결과 리스트
            
        Returns:
            요약 통계 딕셔너리
        """
        if not analysis_results:
            return {'error': 'No analysis results provided'}
        
        successful_analyses = [r for r in analysis_results if r.get('analysis_success', False)]
        
        if not successful_analyses:
            return {'error': 'No successful analyses found'}
        
        # 집중도 점수 통계
        attention_scores = [r['integrated_attention_score'] for r in successful_analyses]
        
        summary = {
            'total_analyses': len(analysis_results),
            'successful_analyses': len(successful_analyses),
            'success_rate': round(len(successful_analyses) / len(analysis_results) * 100, 1),
            'attention_statistics': {
                'mean': round(np.mean(attention_scores), 1),
                'median': round(np.median(attention_scores), 1),
                'std': round(np.std(attention_scores), 1),
                'min': round(np.min(attention_scores), 1),
                'max': round(np.max(attention_scores), 1)
            },
            'attention_level_distribution': {},
            'emotion_distribution': {},
            'average_weights': {'emotion': 0, 'gaze': 0}
        }
        
        # 집중도 레벨 분포
        levels = [r['attention_level'] for r in successful_analyses]
        for level in ['very_high', 'high', 'medium', 'low', 'very_low']:
            count = levels.count(level)
            summary['attention_level_distribution'][level] = {
                'count': count,
                'percentage': round(count / len(successful_analyses) * 100, 1)
            }
        
        # 감정 분포
        emotions = [r['emotion_analysis'].get('emotion', '알 수 없음') for r in successful_analyses]
        unique_emotions = list(set(emotions))
        for emotion in unique_emotions:
            count = emotions.count(emotion)
            summary['emotion_distribution'][emotion] = {
                'count': count,
                'percentage': round(count / len(successful_analyses) * 100, 1)
            }
        
        # 평균 가중치
        avg_emotion_weight = np.mean([r['weights_used']['emotion'] for r in successful_analyses])
        avg_gaze_weight = np.mean([r['weights_used']['gaze'] for r in successful_analyses])
        summary['average_weights'] = {
            'emotion': round(avg_emotion_weight, 3),
            'gaze': round(avg_gaze_weight, 3)
        }
        
        return summary
    
    def get_system_info(self) -> Dict:
        """시스템 정보 반환"""
        return {
            'analyzer_version': '1.0.0',
            'emotion_model': self.emotion_analyzer.emotion_labels if hasattr(self.emotion_analyzer, 'emotion_labels') else 'MobileNet',
            'gaze_model': 'L2CS-Net',
            'default_weights': {
                'emotion': self.emotion_weight,
                'gaze': self.gaze_weight
            },
            'attention_thresholds': self.attention_thresholds,
            'emotion_model_info': getattr(self.emotion_analyzer, 'model', None) is not None,
            'gaze_model_info': self.gaze_tracker.get_model_info()
        }