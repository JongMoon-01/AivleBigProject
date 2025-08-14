# Azure Container Registry 정보
$ACR_NAME = "edtechacr"
$ACR_URL = "${ACR_NAME}.azurecr.io"
$RESOURCE_GROUP = "edtech-rg"
$AKS_CLUSTER = "edtech-aks"

Write-Host "=== Azure EdTech 배포 스크립트 ===" -ForegroundColor Green

# 1. Azure 로그인 확인
Write-Host "1. Azure 로그인 확인..." -ForegroundColor Yellow
try {
    az account show | Out-Null
} catch {
    Write-Host "Azure에 로그인되어 있지 않습니다. 로그인을 진행합니다." -ForegroundColor Red
    az login
}

# 2. ACR 로그인
Write-Host "2. Azure Container Registry 로그인..." -ForegroundColor Yellow
az acr login --name $ACR_NAME

# 3. Docker 이미지 빌드 및 푸시
Write-Host "3. Docker 이미지 빌드 및 푸시..." -ForegroundColor Yellow

# Frontend 빌드
Write-Host "Frontend 이미지 빌드 중..." -ForegroundColor Green
Set-Location "edtech_merge\edtech-frontend"
docker build -t "${ACR_URL}/edtech-frontend:v2" .
docker push "${ACR_URL}/edtech-frontend:v2"
Write-Host "Frontend 이미지 푸시 완료" -ForegroundColor Green

# Backend (Quiz Generator) 빌드
Write-Host "Quiz Generator 이미지 빌드 중..." -ForegroundColor Green
Set-Location "..\quiz-generator"
docker build -t "${ACR_URL}/quiz-generator:v2" .
docker push "${ACR_URL}/quiz-generator:v2"
Write-Host "Quiz Generator 이미지 푸시 완료" -ForegroundColor Green

# ChromaDB 이미지 푸시 (공식 이미지 사용)
Write-Host "ChromaDB 이미지 푸시 중..." -ForegroundColor Green
docker pull chromadb/chroma:latest
docker tag chromadb/chroma:latest "${ACR_URL}/chromadb:latest"
docker push "${ACR_URL}/chromadb:latest"
Write-Host "ChromaDB 이미지 푸시 완료" -ForegroundColor Green

# 4. AKS 자격 증명 가져오기
Write-Host "4. AKS 클러스터 자격 증명 가져오기..." -ForegroundColor Yellow
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER --overwrite-existing

# 5. Kubernetes 리소스 배포
Write-Host "5. Kubernetes 리소스 배포..." -ForegroundColor Yellow
Set-Location "..\..\k8s"

# Secret 생성 (OpenAI API Key)
Write-Host "API Secrets 배포 중..." -ForegroundColor Green
kubectl apply -f api-secrets.yaml

# ChromaDB 배포
Write-Host "ChromaDB 배포 중..." -ForegroundColor Green
kubectl apply -f chroma-pvc.yaml
kubectl apply -f chromadb-deployment.yaml
kubectl apply -f chromadb-service.yaml

# Quiz Generator 배포
Write-Host "Quiz Generator 배포 중..." -ForegroundColor Green
kubectl apply -f quiz-generator-deployment.yaml
kubectl apply -f quiz-generator-service.yaml

# Frontend 배포
Write-Host "Frontend 배포 중..." -ForegroundColor Green
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

# 6. 배포 상태 확인
Write-Host "6. 배포 상태 확인..." -ForegroundColor Yellow
kubectl get pods
kubectl get services

# 7. 외부 IP 주소 가져오기 (잠시 대기 필요)
Write-Host "7. 외부 IP 주소 확인 중... (최대 2분 소요)" -ForegroundColor Yellow
$FRONTEND_IP = ""
for ($i = 1; $i -le 24; $i++) {
    $FRONTEND_IP = kubectl get service frontend-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null
    if ($FRONTEND_IP) {
        break
    }
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 5
}
Write-Host ""

if ($FRONTEND_IP) {
    Write-Host "=== 배포 완료 ===" -ForegroundColor Green
    Write-Host "Frontend URL: http://${FRONTEND_IP}" -ForegroundColor Green
    Write-Host "브라우저에서 위 URL로 접속하세요." -ForegroundColor Yellow
} else {
    Write-Host "외부 IP 할당 대기 중입니다. 다음 명령어로 확인하세요:" -ForegroundColor Yellow
    Write-Host "kubectl get service frontend-service"
}

Write-Host "`n=== 유용한 명령어 ===" -ForegroundColor Green
Write-Host "# Pod 상태 확인"
Write-Host "kubectl get pods -w"
Write-Host ""
Write-Host "# 로그 확인"
Write-Host "kubectl logs -f deployment/quiz-generator"
Write-Host "kubectl logs -f deployment/edtech-frontend"
Write-Host ""
Write-Host "# 서비스 상태 확인"
Write-Host "kubectl get services"
Write-Host ""
Write-Host "# 재배포 (이미지 업데이트 후)"
Write-Host "kubectl rollout restart deployment/quiz-generator"
Write-Host "kubectl rollout restart deployment/edtech-frontend"

# 원래 디렉토리로 돌아가기
Set-Location ".."