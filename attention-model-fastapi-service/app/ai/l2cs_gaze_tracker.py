import os
import numpy as np
import base64
from typing import Dict, Tuple, Optional
import math
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

# PyTorch import 시도
try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    from torch.autograd import Variable
    from torchvision import transforms
    import torchvision
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("PyTorch not available, using dummy gaze analysis")

if TORCH_AVAILABLE:
    class L2CSModel(nn.Module):
        """L2CS-Net 모델 구조"""
        def __init__(self, block, layers, num_bins):
            self.inplanes = 64
            super(L2CSModel, self).__init__()
            self.conv1 = nn.Conv2d(3, 64, kernel_size=7, stride=2, padding=3, bias=False)
            self.bn1 = nn.BatchNorm2d(64)
            self.relu = nn.ReLU(inplace=True)
            self.maxpool = nn.MaxPool2d(kernel_size=3, stride=2, padding=1)
            self.layer1 = self._make_layer(block, 64, layers[0])
            self.layer2 = self._make_layer(block, 128, layers[1], stride=2)
            self.layer3 = self._make_layer(block, 256, layers[2], stride=2)
            self.layer4 = self._make_layer(block, 512, layers[3], stride=2)
            self.avgpool = nn.AdaptiveAvgPool2d((1, 1))

            self.fc_yaw_gaze = nn.Linear(512 * block.expansion, num_bins)
            self.fc_pitch_gaze = nn.Linear(512 * block.expansion, num_bins)
            
            # 추가 fine-tuning 레이어 (학습된 모델과 일치)
            self.fc_finetune = nn.Linear(512 * block.expansion + 3, 3)
            
            # 가중치 초기화
            for m in self.modules():
                if isinstance(m, nn.Conv2d):
                    n = m.kernel_size[0] * m.kernel_size[1] * m.out_channels
                    m.weight.data.normal_(0, math.sqrt(2. / n))
                elif isinstance(m, nn.BatchNorm2d):
                    m.weight.data.fill_(1)
                    m.bias.data.zero_()

        def _make_layer(self, block, planes, blocks, stride=1):
            downsample = None
            if stride != 1 or self.inplanes != planes * block.expansion:
                downsample = nn.Sequential(
                    nn.Conv2d(self.inplanes, planes * block.expansion,
                              kernel_size=1, stride=stride, bias=False),
                    nn.BatchNorm2d(planes * block.expansion),
                )

            layers = []
            layers.append(block(self.inplanes, planes, stride, downsample))
            self.inplanes = planes * block.expansion
            for i in range(1, blocks):
                layers.append(block(self.inplanes, planes))

            return nn.Sequential(*layers)

        def forward(self, x):
            x = self.conv1(x)
            x = self.bn1(x)
            x = self.relu(x)
            x = self.maxpool(x)

            x = self.layer1(x)
            x = self.layer2(x)
            x = self.layer3(x)
            x = self.layer4(x)
            x = self.avgpool(x)
            x = x.view(x.size(0), -1)

            # gaze prediction
            pre_yaw_gaze = self.fc_yaw_gaze(x)
            pre_pitch_gaze = self.fc_pitch_gaze(x)
            
            # fine-tuning layer (만약 사용된다면)
            # fc_finetune는 2051 입력을 예상하므로 여기서는 사용하지 않음
            # 실제 학습된 모델 구조에 따라 추후 조정 가능
            
            return pre_yaw_gaze, pre_pitch_gaze
else:
    # PyTorch가 없을 때 더미 클래스
    class L2CSModel:
        def __init__(self, *args, **kwargs):
            pass

class L2CSGazeTracker:
    def __init__(self, model_path: str = "/workspace/AivleBigProject/extracted_models/2. 학습 모델 파일/l2cs_trained.pkl"):
        """L2CS-Net을 사용한 고급 시선 분석 프로세서"""
        self.model_path = model_path
        self.model = None
        self.device = None
        self.num_bins = 90  # L2CS-Net default bins
        self.bin_width = 4  # degrees per bin
        
        # MediaPipe 얼굴 감지 초기화
        if MP_AVAILABLE:
            self.face_mesh = mp.solutions.face_mesh.FaceMesh(
                static_image_mode=True,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            print("MediaPipe face mesh initialized for L2CS")
        else:
            self.face_mesh = None
            
        # 이미지 전처리 변환
        if TORCH_AVAILABLE:
            self.transform = transforms.Compose([
                transforms.ToPILImage(),
                transforms.Resize(448),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]
                )
            ])
        
        self.load_model()
    
    def load_model(self):
        """L2CS-Net 모델 로드"""
        if not TORCH_AVAILABLE:
            print("PyTorch not available, L2CS model will not be loaded")
            return
            
        try:
            # 디바이스 설정
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            print(f"L2CS model will use device: {self.device}")
            
            if os.path.exists(self.model_path):
                # 모델 구조 생성 (ResNet50 기본)
                if TORCH_AVAILABLE:
                    self.model = L2CSModel(
                        torchvision.models.resnet.Bottleneck, 
                        [3, 4, 6, 3], 
                        self.num_bins
                    )
                else:
                    self.model = L2CSModel()
                
                # 모델 가중치 로드
                saved_state_dict = torch.load(
                    self.model_path, 
                    map_location=self.device,
                    weights_only=True
                )
                
                # 호환되지 않는 레이어 제외 (finetune layer)
                model_state_dict = self.model.state_dict()
                filtered_state_dict = {}
                
                for key, value in saved_state_dict.items():
                    if key in model_state_dict and model_state_dict[key].shape == value.shape:
                        filtered_state_dict[key] = value
                    elif key.startswith('fc_finetune'):
                        print(f"Skipping incompatible layer: {key} (shape: {value.shape})")
                    else:
                        if key in model_state_dict:
                            print(f"Shape mismatch for {key}: expected {model_state_dict[key].shape}, got {value.shape}")
                        else:
                            print(f"Unknown layer: {key}")
                
                # 가중치 로드
                missing_keys, unexpected_keys = self.model.load_state_dict(filtered_state_dict, strict=False)
                if missing_keys:
                    print(f"Missing keys: {missing_keys}")
                if unexpected_keys:
                    print(f"Unexpected keys: {unexpected_keys}")
                self.model.to(self.device)
                self.model.eval()
                print(f"L2CS-Net model loaded successfully from {self.model_path}")
                
            else:
                print(f"L2CS model file not found at {self.model_path}")
                self.model = None
                
        except Exception as e:
            print(f"Error loading L2CS model: {e}")
            self.model = None
    
    def base64_to_image(self, base64_string: str) -> Optional[np.ndarray]:
        """Base64 문자열을 이미지로 변환"""
        try:
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            img_data = base64.b64decode(base64_string)
            
            if CV2_AVAILABLE:
                nparr = np.frombuffer(img_data, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if img is None:
                    print("L2CS: cv2.imdecode returned None - invalid image data")
                    return None
                return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            else:
                from PIL import Image
                import io
                img = Image.open(io.BytesIO(img_data))
                return np.array(img.convert('RGB'))
        except Exception as e:
            print(f"L2CS: Error converting base64 to image: {e}")
            return None
    
    def detect_face_landmarks(self, image: np.ndarray) -> Optional[Dict]:
        """얼굴 랜드마크 감지"""
        try:
            if not self.face_mesh:
                # MediaPipe 없을 때 중앙 영역 반환
                h, w, _ = image.shape
                return {
                    'face_box': [w//4, h//4, w//2, h//2],
                    'left_eye': [w//3, h//2],
                    'right_eye': [2*w//3, h//2]
                }
            
            results = self.face_mesh.process(image)
            
            if results.multi_face_landmarks:
                landmarks = results.multi_face_landmarks[0]
                h, w, _ = image.shape
                
                # 얼굴 바운딩 박스 계산
                x_coords = [landmark.x * w for landmark in landmarks.landmark]
                y_coords = [landmark.y * h for landmark in landmarks.landmark]
                
                face_box = [
                    int(min(x_coords)),
                    int(min(y_coords)),
                    int(max(x_coords) - min(x_coords)),
                    int(max(y_coords) - min(y_coords))
                ]
                
                # 눈 랜드마크 추출 (대략적인 인덱스)
                left_eye = [
                    int(landmarks.landmark[33].x * w),
                    int(landmarks.landmark[33].y * h)
                ]
                right_eye = [
                    int(landmarks.landmark[362].x * w),
                    int(landmarks.landmark[362].y * h)
                ]
                
                return {
                    'face_box': face_box,
                    'left_eye': left_eye,
                    'right_eye': right_eye,
                    'landmarks': landmarks
                }
            
            return None
            
        except Exception as e:
            print(f"Error detecting face landmarks: {e}")
            return None
    
    def gazeto3d(self, gaze_angles: Tuple[float, float]) -> np.ndarray:
        """시선 각도를 3D 벡터로 변환"""
        yaw, pitch = gaze_angles
        gaze_vector = np.zeros(3)
        gaze_vector[0] = -np.cos(pitch) * np.sin(yaw)
        gaze_vector[1] = -np.sin(pitch)
        gaze_vector[2] = -np.cos(pitch) * np.cos(yaw)
        return gaze_vector
    
    def calculate_angular_error(self, pred_gaze: Tuple[float, float], true_gaze: Tuple[float, float]) -> float:
        """두 시선 각도 사이의 각도 오차 계산"""
        pred_vector = self.gazeto3d(pred_gaze)
        true_vector = self.gazeto3d(true_gaze)
        
        dot_product = np.sum(pred_vector * true_vector)
        dot_product = np.clip(dot_product, -0.9999999, 0.9999999)
        
        return np.arccos(dot_product) * 180 / np.pi
    
    def predict_gaze(self, face_image: np.ndarray) -> Optional[Tuple[float, float]]:
        """얼굴 이미지에서 시선 방향 예측"""
        try:
            if not TORCH_AVAILABLE or self.model is None:
                # 더미 시선 예측 (정면 시선 기준 약간의 변동)
                yaw = random.uniform(-15, 15) * np.pi / 180  # -15도 ~ 15도
                pitch = random.uniform(-10, 10) * np.pi / 180  # -10도 ~ 10도
                return (yaw, pitch)
            
            # 이미지 전처리
            input_tensor = self.transform(face_image).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                # 모델 예측
                yaw_pred, pitch_pred = self.model(input_tensor)
                
                # Softmax 적용
                softmax = nn.Softmax(dim=1)
                yaw_predicted = softmax(yaw_pred)
                pitch_predicted = softmax(pitch_pred)
                
                # 빈 인덱스 생성
                idx_tensor = torch.arange(self.num_bins, dtype=torch.float32).to(self.device)
                
                # 연속값 예측 (빈에서 각도로 변환)
                yaw_deg = torch.sum(yaw_predicted * idx_tensor, 1).cpu().numpy()[0] * self.bin_width - 180
                pitch_deg = torch.sum(pitch_predicted * idx_tensor, 1).cpu().numpy()[0] * self.bin_width - 180
                
                # 라디안 변환
                yaw_rad = yaw_deg * np.pi / 180
                pitch_rad = pitch_deg * np.pi / 180
                
                return (yaw_rad, pitch_rad)
                
        except Exception as e:
            print(f"Error in gaze prediction: {e}")
            return None
    
    def calculate_attention_score(self, gaze_angles: Tuple[float, float]) -> float:
        """시선 각도에서 집중도 점수 계산"""
        yaw, pitch = gaze_angles
        
        # 라디안을 도로 변환
        yaw_deg = abs(yaw * 180 / np.pi)
        pitch_deg = abs(pitch * 180 / np.pi)
        
        # 집중도 계산 (정면 시선일수록 높은 점수)
        # 시선이 중앙(0,0)에서 멀어질수록 점수 감소
        max_angle = 30  # 최대 허용 각도 (도)
        
        # 유클리드 거리 계산
        angle_distance = np.sqrt(yaw_deg**2 + pitch_deg**2)
        
        # 집중도 점수 계산 (0-100)
        if angle_distance <= max_angle:
            attention_score = 100 * (1 - angle_distance / max_angle)
        else:
            attention_score = 0
        
        return max(0, min(100, attention_score))
    
    def analyze_gaze(self, base64_image: str) -> Dict:
        """Base64 이미지에서 시선 분석 수행"""
        result = {
            'face_detected': False,
            'gaze_angles_deg': {'yaw': 0, 'pitch': 0},
            'gaze_angles_rad': {'yaw': 0, 'pitch': 0},
            'gaze_vector': [0, 0, -1],  # 기본값: 정면
            'attention_score': 0,
            'confidence': 0.0,
            'model_info': 'L2CS-Net'
        }
        
        try:
            # Base64를 이미지로 변환
            image = self.base64_to_image(base64_image)
            if image is None:
                return result
            
            # 얼굴 랜드마크 감지
            face_data = self.detect_face_landmarks(image)
            if face_data is None:
                return result
            
            result['face_detected'] = True
            result['face_bbox'] = face_data['face_box']  # 얼굴 바운딩 박스 좌표 추가
            
            # 얼굴 영역 추출
            face_box = face_data['face_box']
            x, y, w, h = face_box
            
            # 얼굴 영역 확장 (시선 분석을 위해)
            margin = 20
            x = max(0, x - margin)
            y = max(0, y - margin)
            w = min(image.shape[1] - x, w + 2 * margin)
            h = min(image.shape[0] - y, h + 2 * margin)
            
            face_image = image[y:y+h, x:x+w]
            
            # 시선 예측
            gaze_angles = self.predict_gaze(face_image)
            if gaze_angles is None:
                return result
            
            yaw_rad, pitch_rad = gaze_angles
            yaw_deg = yaw_rad * 180 / np.pi
            pitch_deg = pitch_rad * 180 / np.pi
            
            # 시선 벡터 계산
            gaze_vector = self.gazeto3d((yaw_rad, pitch_rad))
            
            # 집중도 점수 계산
            attention_score = self.calculate_attention_score((yaw_rad, pitch_rad))
            
            # 신뢰도 계산 (각도가 정면에 가까울수록 높음)
            angle_distance = np.sqrt(yaw_deg**2 + pitch_deg**2)
            confidence = max(0.1, 1.0 - angle_distance / 45.0)  # 45도 이상에서 최소 신뢰도
            
            result.update({
                'gaze_angles_deg': {'yaw': round(yaw_deg, 2), 'pitch': round(pitch_deg, 2)},
                'gaze_angles_rad': {'yaw': round(yaw_rad, 4), 'pitch': round(pitch_rad, 4)},
                'gaze_vector': [round(v, 4) for v in gaze_vector],
                'attention_score': round(attention_score, 1),
                'confidence': round(confidence, 3)
            })
            
        except Exception as e:
            print(f"Error in gaze analysis: {e}")
        
        return result
    
    def get_model_info(self) -> Dict:
        """모델 정보 반환"""
        return {
            'model_name': 'L2CS-Net',
            'model_type': 'ResNet50-based Gaze Estimation',
            'input_size': '448x448',
            'output_bins': self.num_bins,
            'bin_width_deg': self.bin_width,
            'range_deg': '±180',
            'pytorch_available': TORCH_AVAILABLE,
            'model_loaded': self.model is not None,
            'device': str(self.device) if self.device else 'None'
        }