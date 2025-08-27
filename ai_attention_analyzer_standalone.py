#!/usr/bin/env python3
"""
AI 기반 집중도 분석 시스템 - 독립 실행 스크립트
MobileNet(감정 분석) + L2CS(시선 추적) 통합 분석

이 스크립트는 FastAPI 서버 없이 직접 AI 모델을 실행하여
집중도를 분석할 수 있는 독립형 프로그램입니다.
"""

import os
import sys
import time
import json
import base64
import numpy as np
from datetime import datetime
from typing import Dict, Tuple, Optional, List
import warnings
warnings.filterwarnings('ignore')

# ========================= 패키지 임포트 =========================
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    print("⚠️ OpenCV가 설치되지 않았습니다. pip install opencv-python")

try:
    import tensorflow as tf
    from tensorflow import keras
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("⚠️ TensorFlow가 설치되지 않았습니다. pip install tensorflow")

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    from torchvision import transforms
    import torchvision
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("⚠️ PyTorch가 설치되지 않았습니다. pip install torch torchvision")

try:
    import mediapipe as mp
    MP_AVAILABLE = True
except ImportError:
    MP_AVAILABLE = False
    print("⚠️ MediaPipe가 설치되지 않았습니다. pip install mediapipe")

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("⚠️ Pillow가 설치되지 않았습니다. pip install Pillow")

# ========================= MobileNet 감정 분석 클래스 =========================
class MobileNetEmotionAnalyzer:
    """MobileNet을 사용한 감정 기반 집중도 분석"""
    
    def __init__(self, model_path: str = "Mobilenet_model_trained.keras"):
        self.model_path = model_path
        self.model = None
        self.emotions = ['집중', '졸음', '지루함', '혼란', '만족']
        self.emotion_to_attention = {
            '집중': 100,
            '만족': 80,
            '혼란': 60,
            '지루함': 40,
            '졸음': 20
        }
        self.load_model()
    
    def load_model(self):
        """MobileNet 모델 로드"""
        if not TF_AVAILABLE:
            print("❌ TensorFlow가 없어 MobileNet을 로드할 수 없습니다.")
            return
        
        try:
            if os.path.exists(self.model_path):
                self.model = keras.models.load_model(self.model_path)
                print(f"✅ MobileNet 모델 로드 완료: {self.model_path}")
            else:
                print(f"❌ MobileNet 모델 파일을 찾을 수 없습니다: {self.model_path}")
        except Exception as e:
            print(f"❌ MobileNet 모델 로드 실패: {e}")
    
    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """이미지 전처리 (224x224 크기, 정규화)"""
        try:
            # 크기 조정
            if image.shape[:2] != (224, 224):
                image = cv2.resize(image, (224, 224))
            
            # 정규화 (0-1 범위)
            image = image.astype('float32') / 255.0
            
            # 배치 차원 추가
            image = np.expand_dims(image, axis=0)
            
            return image
        except Exception as e:
            print(f"이미지 전처리 오류: {e}")
            return None
    
    def apply_emotion_weights(self, predictions: np.ndarray) -> np.ndarray:
        """감정 예측에 가중치 적용 (긍정적 감정 강화)"""
        weights = np.array([2.2, 0.7, 0.5, 0.3, 1.7])  # 집중, 졸음, 지루함, 혼란, 만족
        weighted = predictions * weights
        normalized = weighted / np.sum(weighted)
        return normalized
    
    def analyze_emotion(self, image: np.ndarray) -> Dict:
        """감정 분석 수행"""
        result = {
            'emotion': '알수없음',
            'confidence': 0.0,
            'attention_score': 0,
            'emotion_scores': {},
            'face_detected': False
        }
        
        if self.model is None:
            print("⚠️ MobileNet 모델이 로드되지 않았습니다.")
            return result
        
        try:
            # 이미지 전처리
            processed_image = self.preprocess_image(image)
            if processed_image is None:
                return result
            
            # 예측
            predictions = self.model.predict(processed_image, verbose=0)[0]
            
            # 가중치 적용
            weighted_predictions = self.apply_emotion_weights(predictions)
            
            # 최고 점수 감정 찾기
            max_idx = np.argmax(weighted_predictions)
            emotion = self.emotions[max_idx]
            confidence = float(weighted_predictions[max_idx])
            
            # 감정별 점수
            emotion_scores = {
                self.emotions[i]: float(weighted_predictions[i]) 
                for i in range(len(self.emotions))
            }
            
            # 집중도 점수 계산
            attention_score = self.emotion_to_attention.get(emotion, 50)
            
            result.update({
                'emotion': emotion,
                'confidence': confidence,
                'attention_score': attention_score,
                'emotion_scores': emotion_scores,
                'face_detected': True
            })
            
        except Exception as e:
            print(f"감정 분석 오류: {e}")
        
        return result

# ========================= L2CS 시선 추적 클래스 =========================
class L2CSGazeAnalyzer:
    """L2CS-Net을 사용한 시선 기반 집중도 분석"""
    
    def __init__(self, model_path: str = "extracted_models/2. 학습 모델 파일/l2cs_trained.pkl"):
        self.model_path = model_path
        self.model = None
        self.device = None
        self.num_bins = 90
        self.bin_width = 4  # degrees per bin
        self.load_model()
    
    def load_model(self):
        """L2CS 모델 로드"""
        if not TORCH_AVAILABLE:
            print("❌ PyTorch가 없어 L2CS를 로드할 수 없습니다.")
            return
        
        try:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            print(f"🖥️ L2CS 디바이스: {self.device}")
            
            if os.path.exists(self.model_path):
                # ResNet50 기반 모델 구조 생성
                self.model = self.create_l2cs_model()
                
                # 가중치 로드
                saved_state = torch.load(self.model_path, map_location=self.device, weights_only=True)
                
                # 호환 가능한 가중치만 로드
                model_state = self.model.state_dict()
                compatible_state = {}
                for key, value in saved_state.items():
                    if key in model_state and model_state[key].shape == value.shape:
                        compatible_state[key] = value
                
                self.model.load_state_dict(compatible_state, strict=False)
                self.model.to(self.device)
                self.model.eval()
                print(f"✅ L2CS 모델 로드 완료: {self.model_path}")
            else:
                print(f"❌ L2CS 모델 파일을 찾을 수 없습니다: {self.model_path}")
        except Exception as e:
            print(f"❌ L2CS 모델 로드 실패: {e}")
    
    def create_l2cs_model(self):
        """L2CS 모델 구조 생성"""
        class L2CSNet(nn.Module):
            def __init__(self, num_bins=90):
                super(L2CSNet, self).__init__()
                # ResNet50 백본
                resnet = torchvision.models.resnet50(pretrained=False)
                self.backbone = nn.Sequential(*list(resnet.children())[:-2])
                self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
                
                # Gaze prediction heads
                self.fc_yaw_gaze = nn.Linear(2048, num_bins)
                self.fc_pitch_gaze = nn.Linear(2048, num_bins)
            
            def forward(self, x):
                x = self.backbone(x)
                x = self.avgpool(x)
                x = x.view(x.size(0), -1)
                yaw = self.fc_yaw_gaze(x)
                pitch = self.fc_pitch_gaze(x)
                return yaw, pitch
        
        return L2CSNet(self.num_bins)
    
    def preprocess_image(self, image: np.ndarray) -> torch.Tensor:
        """이미지 전처리 (448x448 크기, 정규화)"""
        transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize(448),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        return transform(image).unsqueeze(0)
    
    def analyze_gaze(self, image: np.ndarray) -> Dict:
        """시선 분석 수행"""
        result = {
            'yaw': 0.0,
            'pitch': 0.0,
            'attention_score': 0.0,
            'gaze_vector': [0, 0, -1],
            'confidence': 0.0,
            'face_detected': False
        }
        
        if self.model is None:
            print("⚠️ L2CS 모델이 로드되지 않았습니다.")
            return result
        
        try:
            # 이미지 전처리
            input_tensor = self.preprocess_image(image).to(self.device)
            
            with torch.no_grad():
                # 모델 예측
                yaw_pred, pitch_pred = self.model(input_tensor)
                
                # Softmax 적용
                yaw_prob = F.softmax(yaw_pred, dim=1)
                pitch_prob = F.softmax(pitch_pred, dim=1)
                
                # 연속값 계산
                idx_tensor = torch.arange(self.num_bins, dtype=torch.float32).to(self.device)
                yaw_deg = torch.sum(yaw_prob * idx_tensor, dim=1).cpu().numpy()[0] * self.bin_width - 180
                pitch_deg = torch.sum(pitch_prob * idx_tensor, dim=1).cpu().numpy()[0] * self.bin_width - 180
                
                # 3D 시선 벡터 계산
                yaw_rad = np.radians(yaw_deg)
                pitch_rad = np.radians(pitch_deg)
                
                gaze_x = -np.cos(pitch_rad) * np.sin(yaw_rad)
                gaze_y = -np.sin(pitch_rad)
                gaze_z = -np.cos(pitch_rad) * np.cos(yaw_rad)
                
                # 집중도 점수 계산 (정면일수록 높음)
                angle_distance = np.sqrt(yaw_deg**2 + pitch_deg**2)
                attention_score = max(0, 100 * (1 - angle_distance / 30))
                
                # 신뢰도 계산
                confidence = max(0.1, 1.0 - angle_distance / 45.0)
                
                result.update({
                    'yaw': float(yaw_deg),
                    'pitch': float(pitch_deg),
                    'attention_score': float(attention_score),
                    'gaze_vector': [float(gaze_x), float(gaze_y), float(gaze_z)],
                    'confidence': float(confidence),
                    'face_detected': True
                })
                
        except Exception as e:
            print(f"시선 분석 오류: {e}")
        
        return result

# ========================= 얼굴 감지 클래스 =========================
class FaceDetector:
    """MediaPipe를 사용한 얼굴 감지"""
    
    def __init__(self):
        self.face_detector = None
        if MP_AVAILABLE:
            self.face_detector = mp.solutions.face_detection.FaceDetection(
                model_selection=0,
                min_detection_confidence=0.3
            )
            print("✅ MediaPipe 얼굴 감지 초기화 완료")
    
    def detect_face(self, image: np.ndarray) -> Optional[np.ndarray]:
        """얼굴 영역 감지 및 추출"""
        if self.face_detector is None:
            # MediaPipe 없으면 전체 이미지 반환
            return image
        
        try:
            results = self.face_detector.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            
            if results.detections:
                detection = results.detections[0]
                bbox = detection.location_data.relative_bounding_box
                h, w, _ = image.shape
                
                # 바운딩 박스 계산
                x = int(bbox.xmin * w)
                y = int(bbox.ymin * h)
                width = int(bbox.width * w)
                height = int(bbox.height * h)
                
                # 마진 추가
                margin = 20
                x = max(0, x - margin)
                y = max(0, y - margin)
                width = min(w - x, width + 2 * margin)
                height = min(h - y, height + 2 * margin)
                
                # 얼굴 영역 추출
                face_image = image[y:y+height, x:x+width]
                return face_image
            
        except Exception as e:
            print(f"얼굴 감지 오류: {e}")
        
        return None

# ========================= 통합 집중도 분석기 =========================
class IntegratedAttentionAnalyzer:
    """MobileNet과 L2CS를 통합한 집중도 분석"""
    
    def __init__(self, 
                 mobilenet_path: str = "Mobilenet_model_trained.keras",
                 l2cs_path: str = "extracted_models/2. 학습 모델 파일/l2cs_trained.pkl"):
        
        print("\n" + "="*60)
        print("🚀 AI 통합 집중도 분석 시스템 초기화")
        print("="*60)
        
        self.emotion_analyzer = MobileNetEmotionAnalyzer(mobilenet_path)
        self.gaze_analyzer = L2CSGazeAnalyzer(l2cs_path)
        self.face_detector = FaceDetector()
        
        # 가중치 설정
        self.emotion_weight = 0.6
        self.gaze_weight = 0.4
        
        # 분석 히스토리
        self.history = []
        
        print("✅ 시스템 초기화 완료\n")
    
    def analyze_image(self, image: np.ndarray) -> Dict:
        """이미지에서 통합 집중도 분석"""
        result = {
            'timestamp': datetime.now().isoformat(),
            'integrated_attention_score': 0.0,
            'attention_level': '매우 낮음',
            'emotion_data': None,
            'gaze_data': None,
            'face_detected': False,
            'processing_time': 0.0
        }
        
        start_time = time.time()
        
        try:
            # 얼굴 감지
            face_image = self.face_detector.detect_face(image)
            if face_image is None:
                print("⚠️ 얼굴을 감지할 수 없습니다.")
                return result
            
            result['face_detected'] = True
            
            # 병렬 분석 시뮬레이션 (실제로는 순차적)
            # 감정 분석
            emotion_result = self.emotion_analyzer.analyze_emotion(face_image)
            result['emotion_data'] = {
                'emotion': emotion_result['emotion'],
                'confidence': emotion_result['confidence'],
                'emotion_based_attention': emotion_result['attention_score'],
                'emotion_scores': emotion_result['emotion_scores']
            }
            
            # 시선 분석
            gaze_result = self.gaze_analyzer.analyze_gaze(face_image)
            result['gaze_data'] = {
                'yaw': gaze_result['yaw'],
                'pitch': gaze_result['pitch'],
                'gaze_attention_score': gaze_result['attention_score'],
                'gaze_vector': gaze_result['gaze_vector'],
                'confidence': gaze_result['confidence']
            }
            
            # 통합 점수 계산
            emotion_score = emotion_result['attention_score']
            gaze_score = gaze_result['attention_score']
            
            integrated_score = (emotion_score * self.emotion_weight + 
                              gaze_score * self.gaze_weight)
            
            # 레벨 결정
            if integrated_score >= 85:
                level = "매우 높음"
            elif integrated_score >= 70:
                level = "높음"
            elif integrated_score >= 50:
                level = "보통"
            elif integrated_score >= 30:
                level = "낮음"
            else:
                level = "매우 낮음"
            
            result['integrated_attention_score'] = float(integrated_score)
            result['attention_level'] = level
            result['weights'] = {
                'emotion_weight': self.emotion_weight,
                'gaze_weight': self.gaze_weight
            }
            
        except Exception as e:
            print(f"통합 분석 오류: {e}")
        
        result['processing_time'] = time.time() - start_time
        
        # 히스토리에 추가
        self.history.append(result)
        
        return result
    
    def analyze_from_file(self, image_path: str) -> Dict:
        """파일에서 이미지 로드 후 분석"""
        if not CV2_AVAILABLE:
            print("❌ OpenCV가 필요합니다.")
            return None
        
        try:
            image = cv2.imread(image_path)
            if image is None:
                print(f"❌ 이미지를 로드할 수 없습니다: {image_path}")
                return None
            
            return self.analyze_image(image)
        except Exception as e:
            print(f"파일 분석 오류: {e}")
            return None
    
    def analyze_from_webcam(self, duration: int = 10) -> List[Dict]:
        """웹캠에서 실시간 분석 (지정된 시간 동안)"""
        if not CV2_AVAILABLE:
            print("❌ OpenCV가 필요합니다.")
            return []
        
        results = []
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("❌ 웹캠을 열 수 없습니다.")
            return []
        
        print(f"\n📷 웹캠 분석 시작 ({duration}초 동안)")
        print("ESC 키를 누르면 종료됩니다.\n")
        
        start_time = time.time()
        frame_count = 0
        
        try:
            while (time.time() - start_time) < duration:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # 5프레임마다 분석 (성능 최적화)
                if frame_count % 5 == 0:
                    result = self.analyze_image(frame)
                    results.append(result)
                    
                    # 결과 출력
                    self.print_result(result)
                
                # 화면에 프레임 표시 (선택적)
                cv2.imshow('Webcam - Press ESC to exit', frame)
                
                # ESC 키 확인
                if cv2.waitKey(1) & 0xFF == 27:
                    break
                
                frame_count += 1
                
        except KeyboardInterrupt:
            print("\n⚠️ 사용자가 중단했습니다.")
        finally:
            cap.release()
            cv2.destroyAllWindows()
        
        return results
    
    def print_result(self, result: Dict):
        """분석 결과를 보기 좋게 출력"""
        print("\n" + "-"*50)
        print(f"⏰ {result['timestamp']}")
        print(f"🎯 통합 집중도: {result['integrated_attention_score']:.1f}/100 ({result['attention_level']})")
        
        if result['emotion_data']:
            emotion = result['emotion_data']
            print(f"😊 감정: {emotion['emotion']} (신뢰도: {emotion['confidence']:.1%})")
            print(f"   감정 기반 집중도: {emotion['emotion_based_attention']}")
        
        if result['gaze_data']:
            gaze = result['gaze_data']
            print(f"👁️ 시선: Yaw={gaze['yaw']:.1f}°, Pitch={gaze['pitch']:.1f}°")
            print(f"   시선 기반 집중도: {gaze['gaze_attention_score']:.1f}")
        
        print(f"⚡ 처리 시간: {result['processing_time']:.3f}초")
    
    def get_statistics(self) -> Dict:
        """분석 통계 반환"""
        if not self.history:
            return {
                'total_analyses': 0,
                'average_integrated_attention': 0,
                'average_emotion_attention': 0,
                'average_gaze_attention': 0
            }
        
        total = len(self.history)
        
        # 통합 점수 평균
        integrated_scores = [h['integrated_attention_score'] for h in self.history]
        avg_integrated = np.mean(integrated_scores)
        
        # 감정 점수 평균
        emotion_scores = [h['emotion_data']['emotion_based_attention'] 
                         for h in self.history if h['emotion_data']]
        avg_emotion = np.mean(emotion_scores) if emotion_scores else 0
        
        # 시선 점수 평균
        gaze_scores = [h['gaze_data']['gaze_attention_score'] 
                      for h in self.history if h['gaze_data']]
        avg_gaze = np.mean(gaze_scores) if gaze_scores else 0
        
        # 감정 분포
        emotion_counts = {}
        for h in self.history:
            if h['emotion_data']:
                emotion = h['emotion_data']['emotion']
                emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        emotion_distribution = {
            emotion: (count / total * 100) 
            for emotion, count in emotion_counts.items()
        }
        
        return {
            'total_analyses': total,
            'average_integrated_attention': float(avg_integrated),
            'average_emotion_attention': float(avg_emotion),
            'average_gaze_attention': float(avg_gaze),
            'emotion_distribution': emotion_distribution,
            'attention_level_distribution': self.get_level_distribution()
        }
    
    def get_level_distribution(self) -> Dict:
        """집중도 레벨 분포"""
        levels = [h['attention_level'] for h in self.history]
        total = len(levels)
        
        if total == 0:
            return {}
        
        level_counts = {}
        for level in levels:
            level_counts[level] = level_counts.get(level, 0) + 1
        
        return {
            level: (count / total * 100)
            for level, count in level_counts.items()
        }
    
    def save_results(self, filename: str = "attention_analysis_results.json"):
        """분석 결과를 JSON 파일로 저장"""
        try:
            data = {
                'analysis_history': self.history,
                'statistics': self.get_statistics(),
                'timestamp': datetime.now().isoformat()
            }
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f"\n✅ 결과가 {filename}에 저장되었습니다.")
        except Exception as e:
            print(f"❌ 결과 저장 실패: {e}")

# ========================= 메인 실행 함수 =========================
def main():
    """메인 실행 함수"""
    print("\n" + "="*70)
    print(" AI 기반 통합 집중도 분석 시스템 ")
    print(" MobileNet (감정) + L2CS (시선) ")
    print("="*70)
    
    # 분석기 초기화
    analyzer = IntegratedAttentionAnalyzer()
    
    while True:
        print("\n📋 분석 옵션을 선택하세요:")
        print("1. 이미지 파일 분석")
        print("2. 웹캠 실시간 분석 (10초)")
        print("3. 웹캠 단일 프레임 분석")
        print("4. 통계 보기")
        print("5. 결과 저장")
        print("6. 종료")
        
        choice = input("\n선택 (1-6): ").strip()
        
        if choice == '1':
            # 이미지 파일 분석
            image_path = input("이미지 파일 경로를 입력하세요: ").strip()
            if os.path.exists(image_path):
                result = analyzer.analyze_from_file(image_path)
                if result:
                    analyzer.print_result(result)
            else:
                print(f"❌ 파일을 찾을 수 없습니다: {image_path}")
        
        elif choice == '2':
            # 웹캠 실시간 분석
            duration = input("분석 시간(초, 기본값 10): ").strip()
            duration = int(duration) if duration.isdigit() else 10
            results = analyzer.analyze_from_webcam(duration)
            
            if results:
                print(f"\n📊 총 {len(results)}개 프레임 분석 완료")
                stats = analyzer.get_statistics()
                print(f"평균 통합 집중도: {stats['average_integrated_attention']:.1f}")
        
        elif choice == '3':
            # 웹캠 단일 프레임 분석
            if CV2_AVAILABLE:
                cap = cv2.VideoCapture(0)
                print("\n📷 스페이스바를 눌러 캡처, ESC로 취소")
                
                while True:
                    ret, frame = cap.read()
                    if not ret:
                        break
                    
                    cv2.imshow('Press SPACE to capture, ESC to cancel', frame)
                    key = cv2.waitKey(1) & 0xFF
                    
                    if key == 32:  # 스페이스바
                        result = analyzer.analyze_image(frame)
                        analyzer.print_result(result)
                        break
                    elif key == 27:  # ESC
                        print("취소되었습니다.")
                        break
                
                cap.release()
                cv2.destroyAllWindows()
            else:
                print("❌ OpenCV가 필요합니다.")
        
        elif choice == '4':
            # 통계 보기
            stats = analyzer.get_statistics()
            print("\n📊 분석 통계")
            print("="*50)
            print(f"총 분석 횟수: {stats['total_analyses']}")
            print(f"평균 통합 집중도: {stats['average_integrated_attention']:.1f}")
            print(f"평균 감정 집중도: {stats['average_emotion_attention']:.1f}")
            print(f"평균 시선 집중도: {stats['average_gaze_attention']:.1f}")
            
            if stats['emotion_distribution']:
                print("\n감정 분포:")
                for emotion, percentage in stats['emotion_distribution'].items():
                    print(f"  {emotion}: {percentage:.1f}%")
            
            if stats['attention_level_distribution']:
                print("\n집중도 레벨 분포:")
                for level, percentage in stats['attention_level_distribution'].items():
                    print(f"  {level}: {percentage:.1f}%")
        
        elif choice == '5':
            # 결과 저장
            filename = input("저장할 파일명 (기본값: attention_analysis_results.json): ").strip()
            filename = filename if filename else "attention_analysis_results.json"
            analyzer.save_results(filename)
        
        elif choice == '6':
            # 종료
            print("\n👋 프로그램을 종료합니다.")
            break
        
        else:
            print("❌ 잘못된 선택입니다. 다시 선택해주세요.")

if __name__ == "__main__":
    # 필수 패키지 확인
    required_packages = []
    if not CV2_AVAILABLE:
        required_packages.append("opencv-python")
    if not TF_AVAILABLE:
        required_packages.append("tensorflow")
    if not TORCH_AVAILABLE:
        required_packages.append("torch torchvision")
    if not MP_AVAILABLE:
        required_packages.append("mediapipe")
    if not PIL_AVAILABLE:
        required_packages.append("Pillow")
    
    if required_packages:
        print("\n⚠️ 다음 패키지들을 설치해주세요:")
        print(f"pip install {' '.join(required_packages)}")
        print("\n설치 후 다시 실행해주세요.")
        sys.exit(1)
    
    main()