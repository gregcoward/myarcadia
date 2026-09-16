#!/usr/bin/env bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

NAMESPACE=${1:-"gregs-finance"}
METHOD=${2:-"openshift-build"}

echo -e "${BLUE}=== Greg's Finance Company - OpenShift Deployment Helper ===${NC}"
echo -e "Namespace/Project: ${YELLOW}${NAMESPACE}${NC}"
echo -e "Deployment Method: ${YELLOW}${METHOD}${NC}\n"

# Check if oc CLI is installed
if ! command -v oc &> /dev/null; then
    echo -e "${YELLOW}Warning: 'oc' CLI tool not found in PATH.${NC}"
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

if [ "${METHOD}" == "openshift-build" ]; then
    echo -e "\n${BLUE}1. Applying OpenShift ImageStream & BuildConfig...${NC}"
    oc apply -f openshift/buildconfig.yaml

    echo -e "\n${BLUE}2. Starting binary build directly inside OpenShift...${NC}"
    oc start-build arcadia-web --from-dir=. --follow

    echo -e "\n${BLUE}3. Applying Deployment, Service, and Route...${NC}"
    oc apply -f openshift/deployment.yaml
    oc apply -f openshift/service.yaml
    oc apply -f openshift/route.yaml

    # Update Deployment image to point to internal ImageStream
    IMAGE_STREAM_URL=$(oc get is arcadia-web -o jsonpath='{.status.dockerImageRepository}')
    if [ -n "${IMAGE_STREAM_URL}" ]; then
        echo -e "${BLUE}Updating Deployment container image to ${IMAGE_STREAM_URL}:latest...${NC}"
        oc set image deployment/arcadia-web arcadia-web="${IMAGE_STREAM_URL}:latest"
    fi

elif [ "${METHOD}" == "external" ]; then
    REGISTRY=${3:-"quay.io/your-user/arcadia-web:latest"}
    echo -e "\n${BLUE}Building container image locally: ${REGISTRY}...${NC}"
    podman build -t "${REGISTRY}" . || docker build -t "${REGISTRY}" .

    echo -e "${BLUE}Pushing container image: ${REGISTRY}...${NC}"
    podman push "${REGISTRY}" || docker push "${REGISTRY}"

    echo -e "\n${BLUE}Applying Kubernetes/OpenShift Manifests...${NC}"
    oc apply -f openshift/deployment.yaml
    oc apply -f openshift/service.yaml
    oc apply -f openshift/route.yaml

    oc set image deployment/arcadia-web arcadia-web="${REGISTRY}"
fi

echo -e "\n${GREEN}=== Deployment Triggered Successfully! ===${NC}"
echo -e "Waiting for rollout to complete..."
oc rollout status deployment/arcadia-web --timeout=120s || true

echo -e "\n${GREEN}=== Route URL ===${NC}"
ROUTE_URL=$(oc get route arcadia-web -o jsonpath='{.spec.host}' 2>/dev/null || echo "")
if [ -n "${ROUTE_URL}" ]; then
    echo -e "Application is live at: ${YELLOW}https://${ROUTE_URL}${NC}"
else
    echo -e "Run ${YELLOW}oc get route arcadia-web${NC} to get your live URL."
fi
