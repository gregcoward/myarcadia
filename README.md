# Greg's Finance Company Web Application

A full-stack sample web application for **Greg's Finance Company** (inspired by the F5 Arcadia microservices architecture pattern). Embedded with a **Flowise AI Chatbot** widget and built for non-root execution on **Red Hat OpenShift** and **Kubernetes**.

GitHub Repository: [https://github.com/gregcoward/myarcadia](https://github.com/gregcoward/myarcadia)

---

## Table of Contents
1. [Overview & Features](#overview--features)
2. [Using the Application](#using-the-application)
3. [Flowise AI Chatbot Integration & Configuration](#flowise-ai-chatbot-integration--configuration)
4. [Customization & Code Update Guide](#customization--code-update-guide)
   - [Modifying UI Layout & Themes](#modifying-ui-layout--themes)
   - [Adding, Editing, or Removing Users](#adding-editing-or-removing-users)
   - [Adding New Tabs, Pages, or API Endpoints](#adding-new-tabs-pages-or-api-endpoints)
5. [Building Container Images](#building-container-images)
   - [Building with Podman or Docker](#building-with-podman-or-docker)
   - [Building inside OpenShift (BuildConfig / ImageStream)](#building-inside-openshift-buildconfig--imagestream)
6. [Deploying to OpenShift & Kubernetes](#deploying-to-openshift--kubernetes)
   - [OpenShift Deployment (Automated & Manual)](#openshift-deployment-automated--manual)
   - [Standard Kubernetes Deployment (kubectl)](#standard-kubernetes-deployment-kubectl)
7. [Repository File Map](#repository-file-map)

---

## Overview & Features

- **Frontend Portal**: Banking dashboard for Greg's Finance Company featuring portfolio balances, checking & savings accounts, recent transactions log, money transfer interface, refer-a-friend card, and microservice health status monitor.
- **Embedded AI Chatbot**: Integrated Flowise Chatbot widget connecting to the Flowise AI Guardrails backend via a JS module script.
- **OpenShift Non-Root Security**: Uses `nginxinc/nginx-unprivileged:alpine` listening on non-privileged TCP port `8080`, fully compliant with OpenShift's restricted `SecurityContextConstraints` (SCC).
- **Multi-Cloud Ready**: Complete manifests for both OpenShift (`Route`, `BuildConfig`, `ImageStream`) and standard Kubernetes (`Deployment`, `Service`, `Ingress`).

---

## Using the Application

### 1. Dashboard Tab
- **Portfolio Summary**: Displays total portfolio balance, percentage growth, and individual account cards (Checking and Savings).
- **Recent Transactions**: Lists completed financial transactions, categories, and targeted backend API endpoints (`/api/transfer`, `/app3/referral`, `/files/payroll`). Click **Refresh** to trigger a mock data refresh.

### 2. Money Transfer Tab
- Select source account (Checking or Savings).
- Enter recipient name/account ID, transfer amount ($), and optional memo.
- Click **Send Transfer**. The transfer payload is sent to the `/api/v1/transfer` endpoint, displays a success notification banner, and dynamically prepends the new transaction to the **Recent Transactions** table on the Dashboard.

### 3. Refer-a-Friend Tab
- Copy your unique referral URL (`https://gregs-finance.apps.openshift.com/invite/JD-8902`) to the clipboard with one click.
- Enter a friend's email address and click **Send Invitation**. Dispatches an invitation request to `/app3/referral` and updates referral status notifications.

### 4. Microservices Status Tab
- Displays real-time operational status for Greg's Finance Company microservices:
  - **Main Web Frontend** (`/`)
  - **Backend Service** (`/files`)
  - **Money Transfer API** (`/api`)
  - **Referral Service** (`/app3`)

### 5. Flowise AI Assistant (Chat Bubble)
- Click the floating chat bubble icon in the bottom-right corner of the web page to open the interactive AI assistant powered by Flowise.
- Ask questions about banking products, financial advice, or transfer policies.

---

## Flowise AI Chatbot Integration & Configuration

The Flowise Chatbot is initialized near the bottom of [`src/index.html`](src/index.html):

```html
<script type="module">
    import Chatbot from "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js"
    Chatbot.init({
        chatflowid: "890c94ce-5c7a-4efa-9038-e5b530c212f3",
        apiHost: "https://flowise-local-ai-lab.apps.ai-guardrails.bd.f5.com",
    })
</script>
```

### Customizing Chatbot Parameters
You can customize the chatbot appearance and behavior by passing additional options to `Chatbot.init()`:

```js
Chatbot.init({
    chatflowid: "YOUR_CHATFLOW_ID",
    apiHost: "https://your-flowise-instance.com",
    theme: {
        button: {
            backgroundColor: "#38bdf8",
            right: 20,
            bottom: 20,
            size: 48,
        },
        chatWindow: {
            title: "Greg's AI Financial Assistant",
            welcomeMessage: "Hello! How can I assist you with Greg's Finance Company today?",
            backgroundColor: "#0f172a",
            height: 600,
            width: 400,
            fontSize: 15,
            userMessage: {
                backgroundColor: "#38bdf8",
                textColor: "#0f172a"
            },
            textInput: {
                placeholder: "Type your question...",
                backgroundColor: "#1e293b",
                textColor: "#f8fafc",
                sendButtonColor: "#38bdf8"
            }
        }
    }
})
```

---

## Customization & Code Update Guide

### Modifying UI Layout & Themes

#### 1. Color Palette & Styles ([`src/styles.css`](src/styles.css))
All design tokens are defined as CSS variables at the top of `src/styles.css`:

```css
:root {
    --bg-primary: #0f172a;       /* Main dark background */
    --bg-secondary: #1e293b;     /* Card & dropdown background */
    --border-color: #334155;     /* Border lines */
    --text-primary: #f8fafc;     /* Main white text */
    --text-secondary: #94a3b8;   /* Muted gray text */
    --accent-blue: #38bdf8;      /* Primary brand accent */
    --accent-green: #4ade80;     /* Positive transaction accent */
}
```
To change to a light theme or custom brand colors, simply edit these variable values.

---

### Adding, Editing, or Removing Users

Currently, user state is managed in two places for demonstration purposes:

#### 1. Static User Display ([`src/index.html`](src/index.html))
To edit the logged-in user profile displayed in the top navbar:

```html
<!-- Line 47 in src/index.html -->
<div class="user-profile">
    <div class="avatar">JD</div>
    <div class="user-info">
        <span class="user-name">Jane Doe</span>
        <span class="user-status">Premium Tier</span>
    </div>
</div>
```

#### 2. Account Balances & Dropdown Options
To modify or add user accounts in the transfer form dropdown:

```html
<!-- In src/index.html inside #source-account select element -->
<select id="source-account" class="form-input" required>
    <option value="checking">Checking Account (•••• 4829) - $24,150.25</option>
    <option value="savings">Savings Account (•••• 9102) - $104,300.55</option>
    <option value="investment">Investment Account (•••• 7710) - $50,000.00</option>
</select>
```

#### 3. Dynamic User Management (`src/app.js`)
To connect to a real backend database or manage dynamic users in JS:

```javascript
// Example: Dynamically setting user profile in src/app.js
const currentUser = {
    name: "Alex Smith",
    initials: "AS",
    tier: "Gold Tier",
    referralCode: "AS-9921"
};

document.querySelector('.user-name').textContent = currentUser.name;
document.querySelector('.avatar').textContent = currentUser.initials;
document.querySelector('.user-status').textContent = currentUser.tier;
```

---

### Adding New Tabs, Pages, or API Endpoints

1. **Add Navbar Button in [`src/index.html`](src/index.html)**:
   ```html
   <button class="nav-btn" data-tab="loans">Loans & Mortgages</button>
   ```

2. **Add Tab Content Section in [`src/index.html`](src/index.html)**:
   ```html
   <section id="loans" class="tab-content">
       <div class="page-header">
           <h2>Mortgage & Loan Services</h2>
       </div>
       <div class="section-card">
           <p>Apply for low-rate mortgages directly with Greg's Finance Company.</p>
       </div>
   </section>
   ```
   *The tab switching mechanism in `src/app.js` will automatically detect and bind new `data-tab` buttons without code modifications.*

---

## Building Container Images

### Building with Podman or Docker

```bash
# Navigate to repository root
cd sampleapp

# Build container image
podman build -t quay.io/your-user/gregs-finance-web:v1.0 .
# OR
docker build -t quay.io/your-user/gregs-finance-web:v1.0 .

# Test run locally on port 8080
podman run -d -p 8080:8080 --name gregs-finance-app quay.io/your-user/gregs-finance-web:v1.0

# Verify local container endpoint
curl http://localhost:8080/healthz

# Push image to remote registry (Quay, Docker Hub, Harbor)
podman push quay.io/your-user/gregs-finance-web:v1.0
```

---

### Building inside OpenShift (BuildConfig / ImageStream)

OpenShift can build container images directly inside the cluster using your local source directory or Git URL:

```bash
# 1. Apply OpenShift BuildConfig & ImageStream manifests
oc apply -f openshift/buildconfig.yaml

# 2. Trigger binary build from your local repository directory
oc start-build arcadia-web --from-dir=. --follow

# 3. Verify ImageStream tag creation
oc get is arcadia-web
```

---

## Deploying to OpenShift & Kubernetes

### OpenShift Deployment (Automated & Manual)

#### Option A: Using `deploy.sh` Script (Automated)
```bash
# Log in to OpenShift cluster
oc login https://api.your-cluster.com:6443 --token=YOUR_OCP_TOKEN

# Execute deployment helper script
./deploy.sh gregs-finance openshift-build
```

#### Option B: Manual Step-by-Step OpenShift Deployment
```bash
# 1. Create OpenShift Project
oc new-project gregs-finance

# 2. Create ImageStream & BuildConfig
oc apply -f openshift/buildconfig.yaml

# 3. Build container image in-cluster
oc start-build arcadia-web --from-dir=. --follow

# 4. Apply Deployment, Service, and Route
oc apply -f openshift/deployment.yaml
oc apply -f openshift/service.yaml
oc apply -f openshift/route.yaml

# 5. Link Deployment to built ImageStream tag
IMAGE_URL=$(oc get is arcadia-web -o jsonpath='{.status.dockerImageRepository}')
oc set image deployment/arcadia-web arcadia-web=${IMAGE_URL}:latest

# 6. Check application rollout status & retrieve public URL
oc rollout status deployment/arcadia-web
oc get route arcadia-web
```

---

### Standard Kubernetes Deployment (kubectl)

To deploy on standard Kubernetes clusters (EKS, GKE, AKS, minikube, kind):

```bash
# 1. Create namespace
kubectl create namespace gregs-finance
kubectl config set-context --current --namespace=gregs-finance

# 2. Apply Deployment & Service
kubectl apply -f openshift/deployment.yaml
kubectl apply -f openshift/service.yaml

# 3. Update container image to public image path
kubectl set image deployment/arcadia-web arcadia-web=quay.io/your-user/gregs-finance-web:v1.0

# 4. (Optional) Create standard Kubernetes Ingress if not using OpenShift Route
kubectl expose deployment arcadia-web --type=LoadBalancer --name=arcadia-web-lb
```

---

## Repository File Map

| Path | Purpose |
| :--- | :--- |
| [`Dockerfile`](Dockerfile) | Multi-stage unprivileged NGINX build file (port 8080). |
| [`nginx.conf`](nginx.conf) | Unprivileged web server configuration with security headers & `/healthz` probe. |
| [`deploy.sh`](deploy.sh) | Automated OpenShift deployment helper script. |
| [`src/index.html`](src/index.html) | Main HTML document & Flowise Chatbot embed code. |
| [`src/styles.css`](src/styles.css) | Custom CSS styling & color design tokens. |
| [`src/app.js`](src/app.js) | Interactive UI tab switcher & mock API transfer handlers. |
| [`openshift/deployment.yaml`](openshift/deployment.yaml) | Kubernetes Deployment with readiness/liveness probes & non-root SCC. |
| [`openshift/service.yaml`](openshift/service.yaml) | Kubernetes ClusterIP Service listening on port 8080. |
| [`openshift/route.yaml`](openshift/route.yaml) | OpenShift Route with Edge TLS termination. |
| [`openshift/buildconfig.yaml`](openshift/buildconfig.yaml) | OpenShift BuildConfig and ImageStream resources. |
| [`openshift/kustomization.yaml`](openshift/kustomization.yaml) | Kustomize bundle manifest. |

---

## Support & Contributions

To push updates to GitHub:
```bash
git add .
git commit -m "Update application features and documentation"
git push origin main
```
Repository URL: [https://github.com/gregcoward/myarcadia](https://github.com/gregcoward/myarcadia)