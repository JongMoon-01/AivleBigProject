#!/bin/bash

# EdTech Platform Azure AKS Deployment Script
# Usage: ./deploy.sh

set -e

echo "========================================"
echo "EdTech Platform Deployment to Azure AKS"
echo "========================================"

# Configuration
ACR_NAME="edtechacr"
ACR_LOGIN_SERVER="${ACR_NAME}.azurecr.io"
RESOURCE_GROUP="edtech-rg"
AKS_CLUSTER_NAME="edtech-aks"
VERSION_TAG="v1"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    print_error "Azure CLI is not installed. Please install it first."
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install it first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install it first."
    exit 1
fi

print_message "Logging into Azure..."
az login

print_message "Setting subscription..."
# az account set --subscription "YOUR-SUBSCRIPTION-ID"

print_message "Getting AKS credentials..."
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER_NAME --overwrite-existing

print_message "Logging into Azure Container Registry..."
az acr login --name $ACR_NAME

print_message "Ensuring AKS can pull from ACR (attach ACR)..."
set +e
az aks update -n $AKS_CLUSTER_NAME -g $RESOURCE_GROUP --attach-acr $ACR_NAME >/dev/null 2>&1
if [ $? -ne 0 ]; then
    print_warning "Could not attach ACR to AKS automatically. It may already be attached or you may lack permissions. Continuing..."
fi
set -e

# Build and push Docker images
print_message "Building and pushing Docker images..."

# Frontend
print_message "Building frontend image..."
cd AivleBigProject/edtech_merge/edtech-frontend
docker build -t ${ACR_LOGIN_SERVER}/edtech-frontend:${VERSION_TAG} .
docker push ${ACR_LOGIN_SERVER}/edtech-frontend:${VERSION_TAG}
cd ../../..

# Quiz Generator
print_message "Building quiz-generator image..."
cd AivleBigProject/edtech_merge/quiz-generator
docker build -t ${ACR_LOGIN_SERVER}/quiz-generator:${VERSION_TAG} .
docker push ${ACR_LOGIN_SERVER}/quiz-generator:${VERSION_TAG}
cd ../../..

# Deploy to Kubernetes
print_message "Deploying to Kubernetes..."

# Create namespace if it doesn't exist
kubectl create namespace edtech --dry-run=client -o yaml | kubectl apply -f -
kubectl config set-context --current --namespace=edtech

# Apply secrets first
print_warning "Applying API secrets..."
print_warning "Make sure to update the api-secrets.yaml with your actual API key!"
kubectl apply -f AivleBigProject/k8s/api-secrets.yaml

# Deploy ChromaDB (Storage -> Deployment -> Service)
print_message "Deploying ChromaDB..."
kubectl apply -f AivleBigProject/k8s/chroma-pvc.yaml
sleep 5
kubectl apply -f AivleBigProject/k8s/chromadb-deployment.yaml
kubectl apply -f AivleBigProject/k8s/chromadb-service.yaml

# Wait for ChromaDB to be ready
print_message "Waiting for ChromaDB to be ready..."
kubectl wait --for=condition=ready pod -l app=chromadb --timeout=120s

# Deploy Quiz Generator
print_message "Deploying Quiz Generator..."
kubectl apply -f AivleBigProject/k8s/quiz-generator-deployment.yaml
kubectl apply -f AivleBigProject/k8s/quiz-generator-service.yaml

# Wait for Quiz Generator to be ready
print_message "Waiting for Quiz Generator to be ready..."
kubectl wait --for=condition=ready pod -l app=quiz-generator --timeout=120s

# Deploy Frontend
print_message "Deploying Frontend..."
kubectl apply -f AivleBigProject/k8s/frontend-deployment.yaml
kubectl apply -f AivleBigProject/k8s/frontend-service.yaml

# Wait for Frontend to be ready
print_message "Waiting for Frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=edtech-frontend --timeout=120s

# Get service information
print_message "Getting service endpoints..."
echo ""
echo "========================================"
echo "Deployment Complete!"
echo "========================================"
echo ""

print_message "Services Status:"
kubectl get services

echo ""
print_message "Pods Status:"
kubectl get pods

echo ""
print_message "Getting External IP (this may take a few minutes)..."
echo ""

# Wait for frontend external IP only (backend is ClusterIP and reachable via frontend proxy)
for i in {1..30}; do
    FRONTEND_IP=$(kubectl get service frontend-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    FRONTEND_HOSTNAME=$(kubectl get service frontend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    if [ -n "$FRONTEND_IP" ] || [ -n "$FRONTEND_HOSTNAME" ]; then
        break
    fi
    echo -ne "\rWaiting for frontend external IP... ($i/30)"
    sleep 10
done

echo ""
echo ""
echo "========================================"
echo "Access URL:"
echo "========================================"
if [ -n "$FRONTEND_IP" ]; then
  echo "Frontend: http://${FRONTEND_IP}"
else
  echo "Frontend: http://${FRONTEND_HOSTNAME}"
fi
echo "(Backend is internal: accessed via /api proxy from the frontend)"
echo ""
echo "========================================"

print_message "Deployment script completed successfully!"
print_warning "Remember to update the OPENAI_API_KEY in api-secrets.yaml!"