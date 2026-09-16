# Greg's Finance Company Web Application

A full-stack sample web application for **Greg's Finance Company** (inspired by the F5 Arcadia microservices architecture pattern). Embedded with a **Flowise AI Chatbot** widget and built for non-root execution on **Red Hat OpenShift** and **Kubernetes**.

GitHub Repository: [https://github.com/gregcoward/myarcadia](https://github.com/gregcoward/myarcadia)

---

## Table of Contents
1. [Overview & Features](#overview--features)
2. [User Credentials & Authentication Screen](#user-credentials--authentication-screen)
3. [Using the Application](#using-the-application)
4. [Flowise AI Chatbot Integration & Configuration](#flowise-ai-chatbot-integration--configuration)
5. [Customization & Code Update Guide](#customization--code-update-guide)
   - [Modifying UI Layout & Themes](#modifying-ui-layout--themes)
   - [Adding, Editing, or Removing Users](#adding-editing-or-removing-users)
   - [Adding New Tabs, Pages, or API Endpoints](#adding-new-tabs-pages-or-api-endpoints)
6. [Building Container Images](#building-container-images)
   - [Building with Podman or Docker](#building-with-podman-or-docker)
   - [Building inside OpenShift (BuildConfig / ImageStream)](#building-inside-openshift-buildconfig--imagestream)
7. [Deploying to OpenShift & Kubernetes](#deploying-to-openshift--kubernetes)
   - [OpenShift Deployment (Automated & Manual)](#openshift-deployment-automated--manual)
   - [Standard Kubernetes Deployment (kubectl)](#standard-kubernetes-deployment-kubectl)
8. [Repository File Map](#repository-file-map)

---

## Overview & Features

- **User Authentication Screen**: Full-screen modal login interface with session persistence (`sessionStorage`), error handling, and pre-configured demo account quick-fill chips.
- **Frontend Portal**: Banking dashboard for Greg's Finance Company featuring portfolio balances, checking & savings accounts, recent transactions log, money transfer interface, refer-a-friend card, and microservice health status monitor.
- **Embedded AI Chatbot**: Integrated Flowise Chatbot widget connecting to the Flowise AI Guardrails backend via a JS module script.
- **OpenShift Non-Root Security**: Uses `nginxinc/nginx-unprivileged:alpine` listening on non-privileged TCP port `8080`, fully compliant with OpenShift's restricted `SecurityContextConstraints` (SCC).
- **Multi-Cloud Ready**: Complete manifests for both OpenShift (`Route`, `BuildConfig`, `ImageStream`) and standard Kubernetes (`Deployment`, `Service`, `Ingress`).

---

## User Credentials & Authentication Screen

The application includes an authentication screen that prompts for user login upon opening. You can sign in using either of the demo accounts below (or click the quick-login chips on the sign-in modal):

| Account Name | Role / Tier | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **Jane Doe** | Premium Tier | `jane.doe@gregsfinance.com` | `password123` |
| **Alex Smith** | Standard Tier | `alex.smith@gregsfinance.com` | `admin123` |

### Auth Session & Logout
- **Session Persistence**: Logging in saves the active session state in `sessionStorage`. Reloading or navigating tabs preserves the logged-in session.
- **Logging Out**: Click the **Log Out** button in the top navbar user profile area to clear session storage and return to the login screen.

---

## Using the Application

### 1. Login Screen
- Enter valid credentials or click one of the quick-login chips (**Jane Doe** or **Alex Smith**).
- Click **Sign In** to unlock the main banking dashboard.

### 2. Dashboard Tab
- **Portfolio Summary**: Displays user-specific total portfolio balance, percentage growth, and individual checking/savings accounts.
- **Recent Transactions**: Lists completed financial transactions, categories, and targeted backend API endpoints (`/api/transfer`, `/app3/referral`, `/files/payroll`). Click **Refresh** to trigger a mock data refresh.

### 3. Money Transfer Tab
- Select source account (Checking or Savings).
- Enter recipient name/account ID, transfer amount ($), and optional memo.
- Click **Send Transfer**. The transfer payload is sent to the `/api/v1/transfer` endpoint, displays a success notification banner, and dynamically prepends the new transaction to the **Recent Transactions** table on the Dashboard.

### 4. Refer-a-Friend Tab
- Copy your user-specific referral URL (`https://gregs-finance.apps.openshift.com/invite/<USER_CODE>`) to the clipboard with one click.
- Enter a friend's email address and click **Send Invitation**. Dispatches an invitation request to `/app3/referral`.

### 5. Microservices Status Tab
- Displays real-time operational status for Greg's Finance Company microservices:
  - **Main Web Frontend** (`/`)
  - **Backend Service** (`/files`)
  - **Money Transfer API** (`/api`)
  - **Referral Service** (`/app3`)

### 6. Flowise AI Assistant (Chat Bubble)
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

---

## Customization & Code Update Guide

### Modifying UI Layout & Themes

All design tokens are defined as CSS variables at the top of [`src/styles.css`](src/styles.css):

```css
:root {
    --bg-primary: #0f172a;       /* Main dark background */
    --bg-secondary: #1e293b;     /* Card & dropdown background */
    --border-color: #334155;     /* Border lines */
    --text-primary: #f8fafc;     /* Main white text */
    --accent-blue: #38bdf8;      /* Primary brand accent */
}
```

---

### Adding, Editing, or Removing Users

User accounts and credentials are defined in the `USERS_DB` object inside [`src/app.js`](src/app.js):

```javascript
const USERS_DB = {
    'jane.doe@gregsfinance.com': {
        email: 'jane.doe@gregsfinance.com',
        password: 'password123',
        name: 'Jane Doe',
        avatar: 'JD',
        status: 'Premium Tier',
        checkingNum: '•••• 4829',
        checkingBalance: 24150.25,
        savingsNum: '•••• 9102',
        savingsBalance: 104300.55,
        referralCode: 'JD-8902'
    },
    // Add new user here
};
```

To add a new user:
1. Open `src/app.js`.
2. Add a new key-value pair to `USERS_DB` with email, password, name, balances, and referral code.
3. (Optional) Add a quick-login chip in `src/index.html` under `.quick-chips`.

---

## Building Container Images

### Building with Docker or Podman (Docker Hub)

```bash
# Build container image tagged for Docker Hub (linux/amd64 architecture)
docker build --platform linux/amd64 -t gregcoward/myarcadia:latest .

# Test run locally on port 8080
docker run -d -p 8080:8080 --name gregs-finance-app gregcoward/myarcadia:latest

# Verify local health endpoint
curl http://localhost:8080/healthz

# Log in to Docker Hub and push the image
docker login -u gregcoward
docker push gregcoward/myarcadia:latest
```

---

### Building inside OpenShift (BuildConfig / ImageStream)

```bash
# Apply OpenShift BuildConfig & ImageStream
oc apply -f openshift/buildconfig.yaml

# Trigger binary build inside OpenShift
oc start-build arcadia-web --from-dir=. --follow
```

---

## Deploying to OpenShift & Kubernetes

### OpenShift Deployment Options

#### Option A: External Docker Hub Build (Recommended)
If your OpenShift cluster does not have an internal image registry enabled (or raises `InvalidOutputReference` during `oc start-build`), use the `external` deployment mode:

```bash
# 1. Log in to your OpenShift cluster
oc login https://api.ai-guardrails.bd.f5.com:6443

# 2. Build local container, push to Docker Hub, and deploy to OpenShift
./deploy.sh gregs-finance external
```

#### Option B: In-Cluster OpenShift Build
If internal ImageStreams are configured on your OpenShift cluster:

```bash
./deploy.sh gregs-finance openshift-build
```

> **Note on `InvalidOutputReference` Error**: If `oc start-build` fails with `build failed: InvalidOutputReference: Output image could not be resolved`, the cluster does not have an internal image registry service running. The updated `./deploy.sh` script automatically detects this error and falls back to building via `docker` / `podman` and pushing to `docker.io/gregcoward/myarcadia:latest`.

---

## Repository File Map

| Path | Purpose |
| :--- | :--- |
| [`Dockerfile`](Dockerfile) | Multi-stage unprivileged NGINX build file (port 8080). |
| [`nginx.conf`](nginx.conf) | Unprivileged web server configuration with security headers & `/healthz` probe. |
| [`deploy.sh`](deploy.sh) | Automated OpenShift deployment helper script. |
| [`src/index.html`](src/index.html) | Main HTML document with Login Modal & Flowise Chatbot embed code. |
| [`src/styles.css`](src/styles.css) | Custom CSS styling & modal screen styles. |
| [`src/app.js`](src/app.js) | Authentication state manager, tab switcher & mock API handlers. |
| [`openshift/deployment.yaml`](openshift/deployment.yaml) | Kubernetes Deployment with readiness/liveness probes & non-root SCC. |
| [`openshift/service.yaml`](openshift/service.yaml) | Kubernetes ClusterIP Service listening on port 8080. |
| [`openshift/route.yaml`](openshift/route.yaml) | OpenShift Route with Edge TLS termination. |
| [`openshift/buildconfig.yaml`](openshift/buildconfig.yaml) | OpenShift BuildConfig and ImageStream resources. |

---

## Support & Contributions

To push updates to GitHub:
```bash
git add .
git commit -m "Add user authentication screen and credentials"
git push origin main
```
Repository URL: [https://github.com/gregcoward/myarcadia](https://github.com/gregcoward/myarcadia)