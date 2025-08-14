#!/bin/bash

# Azure Container Registry 정보
ACR_NAME="edtechacr"
ACR_URL="${ACR_NAME}.azurecr.io"
RESOURCE_GROUP="edtech-rg"
AKS_CLUSTER="edtech-aks"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Azure EdTech 배포 스크립트 ===${NC}"

# 1. Azure 로그인 확인
echo -e "${YELLOW}1. Azure 로그인 확인...${NC}"
if ! az account show &>/dev/null; then
    echo -e "${RED}Azure에 로그인되어 있지 않습니다. 로그인을 진행합니다.${NC}"
    az login
fi

# 2. ACR 로그인
echo -e "${YELLOW}2. Azure Container Registry 로그인...${NC}"
az acr login --name $ACR_NAME

# 3. Docker 이미지 빌드 및 푸시
echo -e "${YELLOW}3. Docker 이미지 빌드 및 푸시...${NC}"

# Frontend 빌드
echo -e "${GREEN}Frontend 이미지 빌드 중...${NC}"
cd edtech_merge/edtech-frontend
docker build -t ${ACR_URL}/edtech-frontend:v2 .
docker push ${ACR_URL}/edtech-frontend:v2
echo -e "${GREEN}Frontend 이미지 푸시 완료${NC}"

# Backend (Quiz Generator) 빌드
echo -e "${GREEN}Quiz Generator 이미지 빌드 중...${NC}"
cd ../quiz-generator
docker build -t ${ACR_URL}/quiz-generator:v2 .
docker push ${ACR_URL}/quiz-generator:v2
echo -e "${GREEN}Quiz Generator 이미지 푸시 완료${NC}"

# ChromaDB 이미지 푸시 (공식 이미지 사용)
echo -e "${GREEN}ChromaDB 이미지 푸시 중...${NC}"
docker pull chromadb/chroma:latest
docker tag chromadb/chroma:latest ${ACR_URL}/chromadb:latest
docker push ${ACR_URL}/chromadb:latest
echo -e "${GREEN}ChromaDB 이미지 푸시 완료${NC}"

# 4. AKS 자격 증명 가져오기
echo -e "${YELLOW}4. AKS 클러스터 자격 증명 가져오기...${NC}"
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER --overwrite-existing

# 5. Kubernetes 리소스 배포
echo -e "${YELLOW}5. Kubernetes 리소스 배포...${NC}"
cd ../../k8s

# Secret 생성 (OpenAI API Key)
echo -e "${GREEN}API Secrets 배포 중...${NC}"
kubectl apply -f api-secrets.yaml

# ChromaDB 배포
echo -e "${GREEN}ChromaDB 배포 중...${NC}"
kubectl apply -f chroma-pvc.yaml
kubectl apply -f chromadb-deployment.yaml
kubectl apply -f chromadb-service.yaml

# Quiz Generator 배포
echo -e "${GREEN}Quiz Generator 배포 중...${NC}"
kubectl apply -f quiz-generator-deployment.yaml
kubectl apply -f quiz-generator-service.yaml

# Frontend 배포
echo -e "${GREEN}Frontend 배포 중...${NC}"
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

# 6. 배포 상태 확인
echo -e "${YELLOW}6. 배포 상태 확인...${NC}"
kubectl get pods
kubectl get services

# 7. 외부 IP 주소 가져오기 (잠시 대기 필요)
echo -e "${YELLOW}7. 외부 IP 주소 확인 중... (최대 2분 소요)${NC}"
for i in {1..24}; do
    FRONTEND_IP=$(kubectl get service frontend-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    if [ ! -z "$FRONTEND_IP" ]; then
        break
    fi
    echo -n "."
    sleep 5
done
echo ""

if [ ! -z "$FRONTEND_IP" ]; then
    echo -e "${GREEN}=== 배포 완료 ===${NC}"
    echo -e "${GREEN}Frontend URL: http://${FRONTEND_IP}${NC}"
    echo -e "${YELLOW}브라우저에서 위 URL로 접속하세요.${NC}"
else
    echo -e "${YELLOW}외부 IP 할당 대기 중입니다. 다음 명령어로 확인하세요:${NC}"
    echo "kubectl get service frontend-service"
fi

echo -e "${GREEN}=== 유용한 명령어 ===${NC}"
echo "# Pod 상태 확인"
echo "kubectl get pods -w"
echo ""
echo "# 로그 확인"
echo "kubectl logs -f deployment/quiz-generator"
echo "kubectl logs -f deployment/edtech-frontend"
echo ""
echo "# 서비스 상태 확인"
echo "kubectl get services"
echo ""
echo "# 재배포 (이미지 업데이트 후)"
echo "kubectl rollout restart deployment/quiz-generator"
echo "kubectl rollout restart deployment/edtech-frontend"