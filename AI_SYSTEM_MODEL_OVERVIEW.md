# AI 통합 집중도 분석 시스템 - 모델 개요

## 시스템 구조 개요

본 시스템은 **감정 인식**과 **시선 추적** 두 가지 AI 모델을 통합하여 실시간으로 학습자의 집중도를 측정하는 시스템입니다.

---

## 1. 감정 인식 모델 (MobileNet 기반)

### 📋 모델 기본 정보
- **모델명**: MobileNet V1 기반 감정 분류 모델
- **파일 경로**: `Mobilenet_model_trained.keras`
- **입력 크기**: 224×224×3 (RGB 이미지)
- **출력 클래스**: 5개 감정 상태 ['집중', '졸음', '지루함', '혼란', '만족']

### 🏗️ 아키텍처 구조
1. **기반 모델**: MobileNet V1 (ImageNet 사전 훈련)
   - Depthwise Separable Convolution 사용으로 경량화
   - 총 파라미터: 약 4.2M개
   
2. **추가 레이어**:
   ```
   MobileNet Base → Global Average Pooling → Dense(128) → Dropout(0.5) → Dense(5, softmax)
   ```

3. **특징 추출 과정**:
   - Conv2D + BatchNorm + ReLU 패턴 반복
   - Depthwise와 Pointwise 컨볼루션으로 연산량 감소
   - Feature map 크기: 224×224 → 112×112 → 56×56 → ... → 7×7

### 🔬 학습 및 최적화
- **전이 학습**: ImageNet 가중치로 초기화 후 감정 데이터로 Fine-tuning
- **데이터 증강**: 회전, 밝기 조정, 수평 뒤집기 등
- **손실 함수**: Categorical Crossentropy
- **옵티마이저**: Adam (학습률: 0.001)

### ⚙️ 예측 후처리
- **가중치 보정**: 긍정적 감정 강화
  - 집중: ×2.2 (120% 증가)
  - 만족: ×1.7 (70% 증가)
  - 혼란: ×0.3 (70% 감소)
  - 지루함: ×0.5 (50% 감소)
  - 졸음: ×0.7 (30% 감소)

---

## 2. 시선 추적 모델 (L2CS-Net)

### 📋 모델 기본 정보
- **모델명**: L2CS-Net (Learning to Learn Calibrated Spatial-Angular Gaze)
- **파일 경로**: `extracted_models/2. 학습 모델 파일/l2cs_trained.pkl`
- **입력 크기**: 448×448×3 (RGB 얼굴 이미지)
- **출력**: Yaw, Pitch 각도 (90개 빈으로 분할)

### 🏗️ 아키텍처 구조
1. **기반 구조**: ResNet50 백본
   ```
   Conv2d(7×7) → BatchNorm → ReLU → MaxPool
   → ResNet Blocks (3,4,6,3 layers)
   → AdaptiveAvgPool → FC layers
   ```

2. **시선 예측 헤드**:
   - `fc_yaw_gaze`: 수평 시선 각도 (90 bins)
   - `fc_pitch_gaze`: 수직 시선 각도 (90 bins)
   - 각 빈은 4도 간격으로 ±180도 범위 커버

### 🧮 각도 계산 원리
1. **빈 분류**: Softmax를 통해 90개 빈 중 확률 분포 생성
2. **연속값 변환**: 
   ```
   각도 = Σ(빈_확률 × 빈_인덱스) × 4° - 180°
   ```
3. **3D 벡터 변환**:
   ```
   gaze_x = -cos(pitch) × sin(yaw)
   gaze_y = -sin(pitch)
   gaze_z = -cos(pitch) × cos(yaw)
   ```

### 📊 집중도 점수 계산
- **정면 시선 기준**: (0°, 0°)에서 멀어질수록 점수 감소
- **계산 공식**:
  ```
  각도_거리 = √(yaw² + pitch²)
  집중도 = 100 × (1 - 각도_거리/30°)  // 30도 이내에서 선형 감소
  ```

---

## 3. 얼굴 검출 시스템

### 🎯 MediaPipe Face Detection
- **라이브러리**: Google MediaPipe
- **모델**: BlazeFace (모바일 최적화)
- **검출 신뢰도**: 0.3 (민감도 향상)
- **기능**: 
  - 실시간 얼굴 바운딩 박스 검출
  - 468개 얼굴 랜드마크 추출 (선택적)

### 📐 좌표 변환 과정
1. **원본 좌표**: MediaPipe 상대 좌표 (0~1)
2. **절대 좌표**: 이미지 크기(640×480) 기준 변환
3. **미러링 보정**: 웹캠 미러 효과 고려한 X축 반전
4. **캔버스 스케일링**: 화면 크기에 맞는 최종 좌표

---

## 4. 통합 집중도 계산 알고리즘

### 🔄 가중 평균 방식
```
통합_집중도 = (감정_점수 × 감정_가중치) + (시선_점수 × 시선_가중치)
기본 가중치: 감정 60%, 시선 40%
```

### 📈 레벨 분류
- **매우 높음**: 85점 이상
- **높음**: 70~84점
- **보통**: 50~69점
- **낮음**: 30~49점
- **매우 낮음**: 30점 미만

### 🎁 보너스 시스템
- **일관성 보너스**: 연속적으로 높은 집중도 유지 시
- **안정성 보너스**: 점수 변동이 적을 때
- **최대 보너스**: +10점

---

## 5. 실시간 처리 파이프라인

### 📊 데이터 흐름
```
웹캠 프레임 → Base64 인코딩 → FastAPI 서버
         ↓
얼굴 검출 → 얼굴 영역 추출 → 전처리
         ↓
    병렬 처리
감정 분석 (MobileNet) | 시선 분석 (L2CS)
         ↓
    결과 통합 → 가중 평균 → 최종 점수
         ↓
WebSocket → 프론트엔드 → 실시간 시각화
```

### ⚡ 성능 최적화
- **비동기 처리**: 감정/시선 분석 병렬 실행
- **배치 추론**: GPU 활용 시 배치 크기 조정
- **메모리 관리**: 임시 텐서 정리 및 재사용
- **품질 필터링**: 낮은 품질 얼굴 자동 제외

---

## 6. 기술적 특징

### 🚀 장점
1. **경량화**: MobileNet 사용으로 실시간 처리 가능
2. **정확도**: 전이 학습 및 후처리 보정으로 성능 향상
3. **안정성**: 여러 모델 조합으로 단일 모델 한계 극복
4. **확장성**: 모듈형 구조로 새로운 분석 기법 추가 용이

### 🔧 개선 가능 영역
1. **데이터셋 확장**: 더 다양한 연령, 인종, 환경 데이터
2. **모델 경량화**: 추가 양자화 또는 지식 증류
3. **다중 얼굴 처리**: 여러 명 동시 분석 기능
4. **개인화**: 사용자별 집중도 패턴 학습

---

## 📁 관련 파일 구조

```
/workspace/AivleBigProject/
├── Mobilenet_model_trained.keras          # 감정 인식 모델
├── extracted_models/
│   └── 2. 학습 모델 파일/
│       └── l2cs_trained.pkl              # 시선 추적 모델
├── attention-model-fastapi-service/
│   └── app/ai/
│       ├── mobilenet_processor.py        # MobileNet 처리기
│       ├── l2cs_gaze_tracker.py         # L2CS 처리기
│       └── integrated_attention_analyzer.py  # 통합 분석기
└── edtech-frontend/src/components/
    └── IntegratedWebcamAnalysis.js       # 프론트엔드 UI
```

---

## 📚 참고 문헌 및 기술

- **MobileNet**: Howard, A. G. et al. "MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications" (2017)
- **L2CS-Net**: Abdelrahman, A. A. et al. "L2CS-Net: Fine-Grained Gaze Estimation in Unconstrained Environments" (2022)
- **MediaPipe**: Google AI, "MediaPipe Face Detection"
- **FastAPI**: Modern, fast web framework for building APIs
- **React**: Frontend framework for user interface

---

*문서 생성일: 2025-08-25*
*시스템 버전: v1.0*