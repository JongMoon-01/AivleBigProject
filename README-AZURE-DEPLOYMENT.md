# Azure 배포 가이드

## 수정 사항 요약

### 1. Frontend 수정
- **QuizModal.js**: API 호출 URL을 상대 경로로 변경
  - `http://localhost:8082/api/quiz/` → `/api/quiz/`
  - Nginx 프록시를 통해 백엔드로 자동 라우팅

### 2. Backend 수정
- **main.py**: CORS 설정을 환경변수로 유연하게 변경
  - `CORS_ORIGINS` 환경변수로 허용할 origin 설정 가능
  - 기본값: 모든 origin 허용 (`*`)

### 3. Kubernetes 설정
- Docker 이미지 버전을 v2로 업데이트
- 프론트엔드와 백엔드 모두 LoadBalancer 타입으로 노출

## 배포 방법

### 사전 준비
1. Azure CLI 설치
2. Docker Desktop 설치 및 실행
3. kubectl 설치

### 배포 스크립트 실행

#### Windows (PowerShell)
```powershell
cd AivleBigProject
.\deploy-azure.ps1
```

#### Linux/Mac (Bash)
```bash
cd AivleBigProject
chmod +x deploy-azure.sh
./deploy-azure.sh
```

### 수동 배포 단계

1. **Azure 로그인**
```bash
az login
az acr login --name edtechacr
```

2. **Docker 이미지 빌드 및 푸시**
```bash
# Frontend
cd edtech_merge/edtech-frontend
docker build -t edtechacr.azurecr.io/edtech-frontend:v2 .
docker push edtechacr.azurecr.io/edtech-frontend:v2

# Backend
cd ../quiz-generator
docker build -t edtechacr.azurecr.io/quiz-generator:v2 .
docker push edtechacr.azurecr.io/quiz-generator:v2
```

3. **AKS 클러스터 연결**
```bash
az aks get-credentials --resource-group edtech-rg --name edtech-aks
```

4. **Kubernetes 리소스 배포**
```bash
cd ../../k8s
kubectl apply -f api-secrets.yaml
kubectl apply -f chroma-pvc.yaml
kubectl apply -f chromadb-deployment.yaml
kubectl apply -f chromadb-service.yaml
kubectl apply -f quiz-generator-deployment.yaml
kubectl apply -f quiz-generator-service.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
```

5. **배포 확인**
```bash
# Pod 상태 확인
kubectl get pods

# 서비스 외부 IP 확인
kubectl get services
```

## 중요 사항

### OpenAI API Key 설정
`k8s/api-secrets.yaml` 파일에서 실제 API 키로 변경:
```bash
echo -n "your-actual-api-key" | base64
```
생성된 base64 값을 `api-secrets.yaml`의 `openai-key` 필드에 입력

### 문제 해결

#### Pod가 시작되지 않는 경우
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

#### 이미지 Pull 실패
```bash
# ACR 인증 확인
az acr login --name edtechacr

# 이미지 존재 확인
az acr repository list --name edtechacr
```

#### 서비스 접속 불가
```bash
# 외부 IP 할당 확인 (EXTERNAL-IP가 pending이 아닌지)
kubectl get service frontend-service

# Nginx 설정 확인
kubectl exec -it <frontend-pod> -- cat /etc/nginx/conf.d/default.conf
```

## 배포 후 테스트

1. Frontend 서비스의 EXTERNAL-IP 확인
2. 브라우저에서 `http://<EXTERNAL-IP>` 접속
3. 퀴즈 생성 기능 테스트

## 유지보수

### 이미지 업데이트
```bash
# 새 버전 빌드 및 푸시
docker build -t edtechacr.azurecr.io/edtech-frontend:v3 .
docker push edtechacr.azurecr.io/edtech-frontend:v3

# Deployment 업데이트
kubectl set image deployment/edtech-frontend frontend=edtechacr.azurecr.io/edtech-frontend:v3
```

### 롤백
```bash
kubectl rollout undo deployment/edtech-frontend
kubectl rollout undo deployment/quiz-generator
```

### 로그 모니터링
```bash
# 실시간 로그
kubectl logs -f deployment/quiz-generator
kubectl logs -f deployment/edtech-frontend

# 최근 100줄
kubectl logs --tail=100 deployment/quiz-generator
```