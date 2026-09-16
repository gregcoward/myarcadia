#!/usr/bin/env bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

NAMESPACE=${1:-"gregs-finance"}
METHOD=${2:-"external"}
REGISTRY=${3:-"docker.io/gregcoward/myarcadia:latest"}

echo -e "${BLUE}=== Greg's Finance Company - OpenShift Deployment Helper ===${NC}"
echo -e "Namespace/Project: ${YELLOW}${NAMESPACE}${NC}"
echo -e "Deployment Method: ${YELLOW}${METHOD}${NC}"
echo -e "Target Registry:   ${YELLOW}${REGISTRY}${NC}\n"

# Check if oc CLI is installed
if ! command -v oc &> /dev/null; then
    echo -e "${RED}Error: 'oc' CLI tool not found in PATH.${NC}"
    echo "Please ensure you have logged in to OpenShift using 'oc login'."
    exit 1
fi

# Create project/namespace if it doesn't exist
if ! oc get project "${NAMESPACE}" &> /dev/null; then
    echo -e "${BLUE}Creating project '${NAMESPACE}'...${NC}"
    oc new-project "${NAMESPACE}" || oc create ns "${NAMESPACE}"
else
    echo -e "${BLUE}Using existing project '${NAMESPACE}'...${NC}"
    oc project "${NAMESPACE}"
fi

if [ "${METHOD}" == "external" ] || [ "${METHOD}" == "docker" ]; then
    echo -e "\n${BLUE}1. Building container image locally: ${REGISTRY}...${NC}"
    if command -v docker &> /dev/null; then
        docker build -t "${REGISTRY}" .
        echo -e "${BLUE}2. Pushing container image to Docker Hub...${NC}"
        docker push "${REGISTRY}"
    elif command -v podman &> /dev/null; then
        podman build -t "${REGISTRY}" .
        echo -e "${BLUE}2. Pushing container image to Docker Hub...${NC}"
        podman push "${REGISTRY}"
    else
        echo -e "${RED}Error: Neither 'docker' nor 'podman' CLI was found for container build.${NC}"
        exit 1
    fi

    echo -e "\n${BLUE}3. Applying OpenShift Deployment, Service, and Route manifests...${NC}"
    oc apply -f openshift/deployment.yaml
    oc apply -f openshift/service.yaml
    oc apply -f openshift/route.yaml

    echo -e "${BLUE}4. Updating Deployment container image to ${REGISTRY}...${NC}"
    oc set image deployment/arcadia-web arcadia-web="${REGISTRY}"

elif [ "${METHOD}" == "openshift-build" ]; then
    echo -e "\n${BLUE}1. Applying OpenShift ImageStream & BuildConfig...${NC}"
    oc apply -f openshift/buildconfig.yaml

    echo -e "\n${BLUE}2. Starting binary build directly inside OpenShift...${NC}"
    if ! oc start-build arcadia-web --from-dir=. --follow; then
        echo -e "\n${YELLOW}========================================================================${NC}"
        echo -e "${YELLOW}Notice: OpenShift in-cluster build failed (likely because internal image registry is disabled on this cluster).${NC}"
        echo -e "${YELLOW}Switching automatically to Docker Hub build & deploy method (${REGISTRY})...${NC}"
        echo -e "${YELLOW}========================================================================${NC}\n"

        echo -e "${BLUE}Building container image locally: ${REGISTRY}...${NC}"
        docker build -t "${REGISTRY}" . || podman build -t "${REGISTRY}" .

        echo -e "${BLUE}Pushing container image to Docker Hub...${NC}"
        docker push "${REGISTRY}" || podman push "${REGISTRY}"

        echo -e "${BLUE}Applying OpenShift Manifests...${NC}"
        oc apply -f openshift/deployment.yaml
        oc apply -f openshift/service.yaml
        oc apply -f openshift/route.yaml

        oc set image deployment/arcadia-web arcadia-web="${REGISTRY}"
    else
        echo -e "\n${BLUE}3. Applying Deployment, Service, and Route...${NC}"
        oc apply -f openshift/deployment.yaml
        oc apply -f openshift/service.yaml
        oc apply -f openshift/route.yaml

        IMAGE_STREAM_URL=$(oc get is arcadia-web -o jsonpath='{.status.dockerImageRepository}' 2>/dev/null || echo "")
        if [ -n "${IMAGE_STREAM_URL}" ]; then
            echo -e "${BLUE}Updating Deployment container image to ${IMAGE_STREAM_URL}:latest...${NC}"
            oc set image deployment/arcadia-web arcadia-web="${IMAGE_STREAM_URL}:latest"
        fi
    fi
fi

echo -e "\n${GREEN}=== Deployment Triggered Successfully! ===${NC}"
echo -e "Waiting for rollout to complete..."
oc rollout status deployment/arcadia-web --timeout=120s || true

echo -e "\n${GREEN}=== OpenShift Route URL ===${NC}"
ROUTE_URL=$(oc get route arcadia-web -o jsonpath='{.spec.host}' 2>/dev/null || echo "")
if [ -n "${ROUTE_URL}" ]; then
    echo -e "Application is live at: ${YELLOW}https://${ROUTE_URL}${NC}"
else
    echo -e "Run ${YELLOW}oc get route arcadia-web${NC} to get your live URL."
fi
