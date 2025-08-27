import os
import numpy as np
import base64
from typing import Dict, Tuple, Optional
import random

# OpenCV import 시도
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    print("OpenCV not available, using basic image processing")

# MediaPipe import 시도
try:
    import mediapipe as mp
    MP_AVAILABLE = True
except ImportError:
    MP_AVAILABLE = False
    print("MediaPipe not available, using basic face detection")

# TensorFlow import 시도 (옵션)
try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model
    from tensorflow.keras.applications.mobilenet_v3 import preprocess_input
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("TensorFlow not available, using dummy model")

class MobilenetProcessor:
    def __init__(self, model_path: str = "/workspace/AivleBigProject/Mobilenet_model_trained.keras"):
        """MobileNet 모델을 사용한 학습 태도/감정 분석 프로세서"""
        self.model_path = model_path
        self.model = None
        
        # MediaPipe 사용 가능 시 얼굴 감지 초기화
        if MP_AVAILABLE:
            self.face_detection = mp.solutions.face_detection.FaceDetection(
                model_selection=0, min_detection_confidence=0.3  # 더 민감한 감지
            )
            print("MediaPipe face detection initialized successfully")
        else:
            self.face_detection = None
            print("MediaPipe not available, using dummy face detection")
            
        self.emotion_labels = ['집중', '졸음', '지루함', '혼란', '만족']
        self.load_model()
    
    def load_model(self):
        """학습된 MobileNet 모델 로드"""
        if not TF_AVAILABLE:
            print("TensorFlow not available, model will not be loaded")
            self.model = None
            return
            
        try:
            if os.path.exists(self.model_path):
                print(f"Loading MobileNet model from {self.model_path}")
                self.model = tf.keras.models.load_model(self.model_path)
                print(f"✓ MobileNet model loaded successfully!")
                print(f"  Input shape: {self.model.input_shape}")
                print(f"  Output shape: {self.model.output_shape}")
                print(f"  Total parameters: {self.model.count_params():,}")
            else:
                print(f"Model file not found at {self.model_path}")
                print("Creating new model structure as fallback...")
                self.model = self._create_fallback_model()
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Creating fallback model...")
            self.model = self._create_fallback_model()
    
    def _create_fallback_model(self):
        """호환 가능한 새 모델 구조 생성 (fallback)"""
        try:
            print("Creating fallback MobileNet emotion model...")
            
            # MobileNetV3Large 백본
            base_model = tf.keras.applications.MobileNetV3Large(
                include_top=False,
                weights='imagenet',
                input_shape=(224, 224, 3)
            )
            
            # 전체 모델 구성
            model = tf.keras.Sequential([
                tf.keras.layers.Input(shape=(224, 224, 3)),
                base_model,
                tf.keras.layers.GlobalAveragePooling2D(),
                tf.keras.layers.Dense(128, activation='relu'),
                tf.keras.layers.Dropout(0.2),
                tf.keras.layers.Dense(32, activation='relu'),
                tf.keras.layers.Dropout(0.2),
                tf.keras.layers.Dense(5, activation='softmax', name='emotions')
            ])
            
            # 컴파일
            model.compile(
                optimizer='adam',
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )
            
            print("✓ Fallback model created successfully")
            return model
            
        except Exception as e:
            print(f"Error creating fallback model: {e}")
            return None
    
    def base64_to_image(self, base64_string: str) -> np.ndarray:
        """Base64 문자열을 이미지로 변환"""
        try:
            # base64 디코딩
            print(f"Base64 string length: {len(base64_string)}")
            print(f"Base64 string start: {base64_string[:100]}...")
            
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
                print(f"After removing header: {len(base64_string)}")
            
            img_data = base64.b64decode(base64_string)
            print(f"Decoded data length: {len(img_data)}")
            
            if CV2_AVAILABLE:
                nparr = np.frombuffer(img_data, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if img is None:
                    print("cv2.imdecode returned None - invalid image data")
                    return None
                print(f"Image shape after decode: {img.shape}")
                return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            else:
                # OpenCV 없이 PIL 사용
                from PIL import Image
                import io
                img = Image.open(io.BytesIO(img_data))
                return np.array(img.convert('RGB'))
        except Exception as e:
            print(f"Error converting base64 to image: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def detect_face(self, image: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
        """얼굴 감지 및 바운딩 박스 반환"""
        try:
            if not self.face_detection:
                # MediaPipe 없을 때 더미 바운딩 박스 반환 (이미지 중앙)
                h, w, _ = image.shape
                face_w = w // 3
                face_h = h // 3
                x = (w - face_w) // 2
                y = (h - face_h) // 2
                return (x, y, face_w, face_h)
            
            results = self.face_detection.process(image)
            
            if results.detections:
                detection = results.detections[0]
                bbox = detection.location_data.relative_bounding_box
                h, w, _ = image.shape
                
                x = int(bbox.xmin * w)
                y = int(bbox.ymin * h)
                width = int(bbox.width * w)
                height = int(bbox.height * h)
                
                # 바운딩 박스 보정
                x = max(0, x)
                y = max(0, y)
                width = min(width, w - x)
                height = min(height, h - y)
                
                return (x, y, width, height)
            return None
        except Exception as e:
            print(f"Error detecting face: {e}")
            return None
    
    def preprocess_face(self, image: np.ndarray, bbox: Tuple[int, int, int, int]) -> np.ndarray:
        """얼굴 영역 추출 및 전처리"""
        try:
            x, y, w, h = bbox
            face_img = image[y:y+h, x:x+w]
            
            # MobileNet 입력 크기로 리사이즈
            if CV2_AVAILABLE:
                face_img = cv2.resize(face_img, (224, 224))
            else:
                from PIL import Image
                pil_img = Image.fromarray(face_img.astype('uint8'))
                pil_img = pil_img.resize((224, 224))
                face_img = np.array(pil_img)
            
            # 전처리
            if TF_AVAILABLE:
                face_img = preprocess_input(face_img)
            else:
                # TensorFlow 없을 때 기본 정규화
                face_img = face_img / 255.0
            face_img = np.expand_dims(face_img, axis=0)
            
            return face_img
        except Exception as e:
            print(f"Error preprocessing face: {e}")
            return None
    
    def analyze_emotion(self, base64_image: str) -> Dict:
        """강화된 감정/태도 분석 수행"""
        import time
        start_time = time.time()
        
        result = {
            'emotion': '알 수 없음',
            'confidence': 0.0,
            'confidence_level': 'low',
            'emotion_scores': {},
            'attention_score': 50,
            'face_detected': False,
            'face_quality': 0.0,
            'processing_time_ms': 0,
            'model_version': 'trained_mobilenet_v1.0'
        }
        
        try:
            # Base64를 이미지로 변환
            image = self.base64_to_image(base64_image)
            if image is None:
                result['error'] = 'Image conversion failed'
                return result
            
            # 향상된 얼굴 감지
            bbox_result = self._enhanced_face_detection(image)
            if bbox_result is None:
                result['face_detected'] = False
                return result
            
            bbox, face_quality = bbox_result
            result['face_detected'] = True  
            result['face_quality'] = round(face_quality, 3)
            result['face_bbox'] = bbox  # 얼굴 바운딩 박스 좌표 추가
            
            # 모델 확인
            if self.model is None:
                result['error'] = 'Model not loaded'
                return result
            
            # 향상된 전처리
            face_img = self._enhanced_preprocessing(image, bbox)
            if face_img is None:
                result['error'] = 'Preprocessing failed'
                return result
            
            # 예측 수행
            predictions = self.model.predict(face_img, verbose=0)[0]
            
            # 강화된 결과 계산
            enhanced_result = self._calculate_enhanced_scores(predictions, face_quality)
            result.update(enhanced_result)
            
        except Exception as e:
            print(f"Enhanced emotion analysis error: {e}")
            result['error'] = str(e)
        
        # 처리 시간 기록
        processing_time = (time.time() - start_time) * 1000
        result['processing_time_ms'] = round(processing_time, 2)
        
        return result
    
    def _enhanced_face_detection(self, image: np.ndarray):
        """향상된 얼굴 감지 (품질 평가 포함)"""
        bbox = self.detect_face(image)
        if bbox is None:
            return None
        
        # 얼굴 품질 평가
        face_quality = self._calculate_face_quality(image, bbox)
        return bbox, face_quality
    
    def _calculate_face_quality(self, image: np.ndarray, bbox: Tuple[int, int, int, int]) -> float:
        """얼굴 이미지 품질 평가"""
        try:
            x, y, w, h = bbox
            face_img = image[y:y+h, x:x+w]
            
            if face_img.size == 0:
                return 0.0
            
            quality_score = 1.0
            
            # 크기 점수 (최소 40x40 픽셀 권장)
            face_area = w * h
            min_area = 40 * 40
            if face_area < min_area:
                quality_score *= (face_area / min_area)
            
            # 종횡비 점수 (얼굴의 이상적 비율)
            aspect_ratio = w / h if h > 0 else 0
            ideal_ratio = 0.8
            ratio_deviation = abs(aspect_ratio - ideal_ratio)
            ratio_score = max(0.3, 1.0 - ratio_deviation)
            quality_score *= ratio_score
            
            return min(1.0, quality_score)
            
        except Exception as e:
            return 0.5
    
    def _enhanced_preprocessing(self, image: np.ndarray, bbox: Tuple[int, int, int, int]):
        """향상된 전처리 (조명 보정 등)"""
        try:
            x, y, w, h = bbox
            face_img = image[y:y+h, x:x+w]
            
            if face_img.size == 0:
                return None
            
            # 고품질 리사이즈
            if CV2_AVAILABLE:
                face_img = cv2.resize(face_img, (224, 224), interpolation=cv2.INTER_LANCZOS4)
                
                # 조명 정규화 (CLAHE)
                if len(face_img.shape) == 3:
                    lab = cv2.cvtColor(face_img, cv2.COLOR_RGB2LAB)
                    lab[:,:,0] = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(4,4)).apply(lab[:,:,0])
                    face_img = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
            else:
                # PIL 백업
                from PIL import Image
                pil_img = Image.fromarray(face_img.astype('uint8'))
                pil_img = pil_img.resize((224, 224), Image.LANCZOS)
                face_img = np.array(pil_img)
            
            # MobileNet 전처리
            if TF_AVAILABLE:
                face_img = preprocess_input(face_img)
            else:
                face_img = face_img / 255.0
            
            face_img = np.expand_dims(face_img, axis=0)
            return face_img
            
        except Exception as e:
            return None
    
    def _calculate_enhanced_scores(self, predictions: np.ndarray, face_quality: float) -> Dict:
        """강화된 점수 계산 (신뢰도 조정)"""
        # 웃는 얼굴이나 집중된 표정일 때 긍정적 감정으로 보정
        # 집중(0)과 만족(4)에 더 강한 가중치 추가
        adjusted_predictions = predictions.copy()
        adjusted_predictions[0] *= 2.2   # 집중에 120% 가중치 (기존 80%)
        adjusted_predictions[4] *= 1.7   # 만족에 70% 가중치
        adjusted_predictions[2] *= 0.5   # 지루함에 50% 감소
        adjusted_predictions[3] *= 0.3   # 혼란에 70% 감소 (기존 40%)
        adjusted_predictions[1] *= 0.7   # 졸음에 30% 감소
        
        # 정규화
        adjusted_predictions = adjusted_predictions / np.sum(adjusted_predictions)
        
        emotion_idx = np.argmax(adjusted_predictions)
        raw_confidence = float(adjusted_predictions[emotion_idx])
        predicted_emotion = self.emotion_labels[emotion_idx]
        
        # 얼굴 품질로 신뢰도 조정
        adjusted_confidence = raw_confidence * face_quality
        
        # 신뢰도 레벨 결정 (더 낮은 임계값으로 다양한 감정 표현)
        if adjusted_confidence >= 0.4:  # 0.5에서 0.4로 낮춤
            confidence_level = 'high'
        elif adjusted_confidence >= 0.25:  # 0.3에서 0.25로 낮춤
            confidence_level = 'medium'  
        else:
            confidence_level = 'low'
        
        # 강화된 집중도 매핑 (더 세밀한 조정)
        enhanced_attention_map = {
            '집중': {'high': 95, 'medium': 88, 'low': 75},
            '만족': {'high': 82, 'medium': 75, 'low': 65},
            '혼란': {'high': 45, 'medium': 50, 'low': 55},  # 낮은 신뢰도일수록 중립에 가까움
            '지루함': {'high': 25, 'medium': 35, 'low': 45},
            '졸음': {'high': 10, 'medium': 25, 'low': 40}
        }
        
        attention_score = enhanced_attention_map.get(predicted_emotion, {}).get(confidence_level, 50)
        
        # 예측 강도 (최고값과 평균의 차이) - 조정된 예측값 사용
        prediction_strength = float(np.max(adjusted_predictions) - np.mean(adjusted_predictions))
        
        return {
            'emotion': predicted_emotion,
            'confidence': adjusted_confidence,
            'confidence_level': confidence_level,
            'raw_confidence': raw_confidence,
            'attention_score': attention_score,
            'emotion_scores': {
                label: float(score) for label, score in zip(self.emotion_labels, adjusted_predictions)  # predictions -> adjusted_predictions로 변경
            },
            'prediction_strength': round(prediction_strength, 3)
        }
    
    def calculate_focus_score(self, emotion_result: Dict) -> float:
        """감정 분석 결과를 기반으로 집중도 점수 계산"""
        if not emotion_result['face_detected']:
            return 0.0
        
        # 집중도 점수는 attention_score를 그대로 사용
        return emotion_result['attention_score'] / 100.0