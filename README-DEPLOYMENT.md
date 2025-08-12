# Azure AKS Deployment Guide

## 🚀 Quick Start

```bash
# 전체 자동 배포
chmod +x deploy.sh
./deploy.sh
```

## 📁 프로젝트 구조

```
AivleBigProject/
├── edtech_merge/
│   ├── edtech-frontend/
│   │   ├── Dockerfile          # Frontend 컨테이너 이미지
│   │   └── nginx.conf          # Nginx 설정
│   └── quiz-generator/
│       └── Dockerfile          # Backend 컨테이너 이미지
├── k8s/                        # Kubernetes 매니페스트
│   ├── api-secrets.yaml        # API 키 저장
│   ├── chroma-pvc.yaml         # ChromaDB 영구 스토리지
│   ├── chromadb-deployment.yaml
│   ├── chromadb-service.yaml
│   ├── quiz-generator-deployment.yaml
│   ├── quiz-generator-service.yaml
│   ├── frontend-deployment.yaml
│   └── frontend-service.yaml
└── deploy.sh                   # 배포 자동화 스크립트
```

## 🔧 사전 준비사항

1. **Azure CLI 설치**
   ```bash
   # Windows
   winget install -e --id Microsoft.AzureCLI
   
   # macOS
   brew install azure-cli
   
   # Linux
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. **kubectl 설치**
   ```bash
   # Windows
   winget install -e --id Kubernetes.kubectl
   
   # macOS
   brew install kubectl
   
   # Linux
   sudo snap install kubectl --classic
   ```

3. **Docker 설치**
   - [Docker Desktop](https://www.docker.com/products/docker-desktop) 다운로드 및 설치

## 📝 설정 변경

### 1. API Key 설정
```bash
# OpenAI API 키를 Base64로 인코딩
echo -n "your-actual-openai-api-key" | base64

# k8s/api-secrets.yaml 파일 수정
# openai-key: 위에서 얻은 Base64 값으로 교체
```

### 2. Azure Container Registry 설정
```bash
# deploy.sh 파일 수정
ACR_NAME="your-acr-name"  # 실제 ACR 이름으로 변경
RESOURCE_GROUP="your-rg"  # 실제 리소스 그룹으로 변경
AKS_CLUSTER_NAME="your-aks"  # 실제 AKS 클러스터 이름으로 변경
```

## 🚀 수동 배포 단계

### 1. Azure 로그인 및 설정
```bash
az login
az account set --subscription "YOUR-SUBSCRIPTION-ID"
az aks get-credentials --resource-group edtech-rg --name edtech-aks
```

### 2. Docker 이미지 빌드 및 푸시
```bash
# ACR 로그인
az acr login --name edtechacr

# Frontend 이미지
cd AivleBigProject/edtech_merge/edtech-frontend
docker build -t edtechacr.azurecr.io/edtech-frontend:v1 .
docker push edtechacr.azurecr.io/edtech-frontend:v1

# Backend 이미지
cd ../quiz-generator
docker build -t edtechacr.azurecr.io/quiz-generator:v1 .
docker push edtechacr.azurecr.io/quiz-generator:v1
```

### 3. Kubernetes 리소스 배포
```bash
cd ../../..

# Namespace 생성
kubectl create namespace edtech
kubectl config set-context --current --namespace=edtech

# Secrets 배포
kubectl apply -f AivleBigProject/k8s/api-secrets.yaml

# ChromaDB 배포
kubectl apply -f AivleBigProject/k8s/chroma-pvc.yaml
kubectl apply -f AivleBigProject/k8s/chromadb-deployment.yaml
kubectl apply -f AivleBigProject/k8s/chromadb-service.yaml

# Quiz Generator 배포
kubectl apply -f AivleBigProject/k8s/quiz-generator-deployment.yaml
kubectl apply -f AivleBigProject/k8s/quiz-generator-service.yaml

# Frontend 배포
kubectl apply -f AivleBigProject/k8s/frontend-deployment.yaml
kubectl apply -f AivleBigProject/k8s/frontend-service.yaml
```

## 🔍 배포 확인

```bash
# Pod 상태 확인
kubectl get pods

# 서비스 확인
kubectl get services

# 로그 확인
kubectl logs -l app=quiz-generator
kubectl logs -l app=edtech-frontend
kubectl logs -l app=chromadb

# External IP 확인
kubectl get service frontend-service
kubectl get service quiz-generator-service
```

## 🔧 트러블슈팅

### Pod이 시작되지 않는 경우
```bash
# Pod 상세 정보 확인
kubectl describe pod <pod-name>

# 이벤트 확인
kubectl get events --sort-by='.lastTimestamp'
```

### 이미지 Pull 실패
```bash
# ACR 연결 확인
az acr check-health --name edtechacr

# AKS와 ACR 연결
az aks update -n edtech-aks -g edtech-rg --attach-acr edtechacr
```

### PVC 문제
```bash
# PVC 상태 확인
kubectl get pvc

# Storage Class 확인
kubectl get storageclass
```

## 🧹 리소스 정리

```bash
# 전체 리소스 삭제
kubectl delete namespace edtech

# 또는 개별 삭제
kubectl delete -f AivleBigProject/k8s/
```

## 📊 모니터링

```bash
# 리소스 사용량 확인
kubectl top nodes
kubectl top pods

# 실시간 모니터링
kubectl get pods --watch
```

## 🔐 보안 참고사항

1. **Secrets 관리**: 프로덕션 환경에서는 Azure Key Vault 사용 권장
2. **네트워크 정책**: 필요시 NetworkPolicy 설정으로 트래픽 제한
3. **RBAC**: 역할 기반 접근 제어 설정
4. **이미지 스캔**: 컨테이너 이미지 취약점 스캔 수행

## 📝 업데이트 방법

```bash
# 새 버전 이미지 빌드 및 푸시
docker build -t edtechacr.azurecr.io/edtech-frontend:v2 .
docker push edtechacr.azurecr.io/edtech-frontend:v2

# Deployment 업데이트
kubectl set image deployment/edtech-frontend frontend=edtechacr.azurecr.io/edtech-frontend:v2

# 롤아웃 상태 확인
kubectl rollout status deployment/edtech-frontend
```