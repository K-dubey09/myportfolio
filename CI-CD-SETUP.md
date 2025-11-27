# CI/CD Pipeline Setup Guide

This document provides comprehensive instructions for setting up and configuring the CI/CD pipeline for your portfolio project.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [GitHub Secrets Configuration](#github-secrets-configuration)
4. [Deployment Platforms](#deployment-platforms)
5. [Docker Deployment](#docker-deployment)
6. [Monitoring and Notifications](#monitoring-and-notifications)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The CI/CD pipeline includes:

- ✅ **Automated Testing**: Run tests on every push and PR
- 🔍 **Code Quality Checks**: ESLint, Prettier, CodeQL
- 🔒 **Security Scanning**: npm audit, dependency scanning
- 🏗️ **Automated Builds**: Build frontend and backend
- 🐳 **Docker Support**: Container images for deployment
- 🚀 **Multi-platform Deployment**: Vercel, Netlify, Render, SSH
- 🔄 **Preview Deployments**: Automatic PR previews
- 📊 **Dependency Management**: Automated dependency updates

---

## 📦 Prerequisites

- GitHub repository with proper access
- Node.js 18.x or higher
- Docker (optional, for containerized deployment)
- Accounts on deployment platforms (Vercel, Netlify, Render, etc.)

---

## 🔐 GitHub Secrets Configuration

Go to **Settings → Secrets and variables → Actions** in your GitHub repository and add these secrets:

### Required Secrets

#### Frontend Environment Variables
```
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Optional Deployment Secrets

#### Vercel Deployment
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

**To get Vercel token:**
1. Go to https://vercel.com/account/tokens
2. Create a new token
3. Copy and add to GitHub secrets

#### Netlify Deployment
```
NETLIFY_AUTH_TOKEN=your-netlify-token
NETLIFY_SITE_ID=your-site-id
```

**To get Netlify token:**
1. Go to https://app.netlify.com/user/applications
2. Create a new personal access token
3. Copy and add to GitHub secrets

#### Render Deployment
```
RENDER_DEPLOY_HOOK=https://api.render.com/deploy/srv-xxx
```

**To get Render deploy hook:**
1. Go to your Render service dashboard
2. Settings → Deploy Hook
3. Copy the webhook URL

#### Docker Hub
```
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-password
```

#### SSH Deployment
```
SSH_HOST=your-server-ip
SSH_USERNAME=your-ssh-username
SSH_PRIVATE_KEY=your-ssh-private-key
SSH_PORT=22
DEPLOY_PATH=/path/to/deployment/directory
```

**To generate SSH key:**
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions"
# Copy the private key to SSH_PRIVATE_KEY secret
# Add public key to your server's ~/.ssh/authorized_keys
```

#### Notifications
```
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

#### Code Analysis (Optional)
```
SONAR_TOKEN=your-sonarcloud-token
CODECOV_TOKEN=your-codecov-token
```

#### Production URL
```
PRODUCTION_URL=https://your-production-domain.com
PREVIEW_API_URL=https://your-staging-api-url.com
```

---

## 🚀 Deployment Platforms

### 1. Vercel (Recommended for Frontend)

**Setup Steps:**

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   cd frontend
   vercel link
   ```

4. Get your tokens and IDs from `.vercel/project.json`

5. Add secrets to GitHub (see above)

**Automatic Deployment:**
- Push to `main` branch triggers production deployment
- Pull requests create preview deployments

---

### 2. Netlify (Alternative Frontend)

**Setup Steps:**

1. Create a new site on Netlify
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Get site ID from Site settings
6. Generate personal access token
7. Add secrets to GitHub

**Configuration:**
- Build command: `npm run build`
- Publish directory: `frontend/dist`
- Node version: 18.x

---

### 3. Render (Recommended for Backend)

**Setup Steps:**

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Root Directory: `backend`
4. Add environment variables
5. Copy deploy hook URL
6. Add to GitHub secrets

**Environment Variables for Render:**
```
NODE_ENV=production
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-bucket
```

---

### 4. SSH Deployment (VPS/Dedicated Server)

**Server Setup:**

1. Install Node.js and PM2 on server:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

2. Clone repository:
   ```bash
   git clone https://github.com/k-dubey09/myportfolio.git
   cd myportfolio
   ```

3. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

4. Setup PM2:
   ```bash
   cd backend
   pm2 start server.js --name portfolio
   pm2 save
   pm2 startup
   ```

5. Setup Nginx (optional):
   ```bash
   sudo apt install nginx
   # Configure nginx as reverse proxy
   ```

**GitHub Actions will automatically:**
- Pull latest code
- Install dependencies
- Build frontend
- Restart PM2 process

---

## 🐳 Docker Deployment

### Local Docker Build

**Build images:**
```bash
# Build frontend
docker build -f Dockerfile.frontend -t portfolio-frontend .

# Build backend
docker build -f Dockerfile.backend -t portfolio-backend .
```

**Run with Docker Compose:**
```bash
docker-compose up -d
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Docker Hub Deployment

1. Add Docker Hub credentials to GitHub secrets
2. Workflow will automatically build and push images
3. Pull and run on your server:
   ```bash
   docker pull yourusername/portfolio-frontend:latest
   docker pull yourusername/portfolio-backend:latest
   docker-compose up -d
   ```

---

## 📊 Monitoring and Notifications

### Slack Notifications

1. Create a Slack webhook:
   - Go to https://api.slack.com/apps
   - Create new app
   - Enable Incoming Webhooks
   - Copy webhook URL

2. Add to GitHub secrets as `SLACK_WEBHOOK`

3. Receive notifications for:
   - Deployment success/failure
   - Build status
   - Test results

### GitHub Actions Dashboard

Monitor your workflows at:
```
https://github.com/k-dubey09/myportfolio/actions
```

---

## 🔧 Workflow Customization

### Enable/Disable Workflows

Edit `.github/workflows/*.yml` files:

**Disable a workflow:**
```yaml
# Add to top of workflow file
on:
  workflow_dispatch: # Manual trigger only
```

**Change trigger branches:**
```yaml
on:
  push:
    branches: [main, develop, staging] # Add your branches
```

### Modify Build Steps

**Add custom build steps:**
```yaml
- name: Custom build step
  run: |
    npm run custom-script
  working-directory: ./frontend
```

---

## 🐛 Troubleshooting

### Build Failures

**Issue**: Dependencies installation fails
```bash
# Solution: Clear cache and retry
# In GitHub Actions, go to Actions → Caches → Clear
```

**Issue**: Build artifacts not found
```bash
# Solution: Check build directory in workflow
# Ensure FRONTEND_DIR and BACKEND_DIR are correct
```

### Deployment Failures

**Issue**: Vercel deployment fails
```bash
# Solution: Check Vercel token validity
# Regenerate token if expired
```

**Issue**: SSH connection timeout
```bash
# Solution: Verify server IP and SSH key
# Test connection locally:
ssh -i ~/.ssh/id_rsa user@server-ip
```

### Secret Issues

**Issue**: Secret not found
```bash
# Solution: Verify secret name matches exactly
# Secrets are case-sensitive
# Check repository settings → Secrets
```

---

## 📝 Workflow Files Overview

### Main Workflows

1. **`ci-cd.yml`**: Main CI/CD pipeline
   - Runs on push to main/develop
   - Builds, tests, and deploys

2. **`test.yml`**: Automated testing
   - Runs on all branches
   - Multiple Node versions

3. **`preview-deploy.yml`**: PR previews
   - Creates preview deployments for PRs
   - Comments deployment URL on PR

4. **`code-quality.yml`**: Code analysis
   - ESLint, Prettier checks
   - Security scanning

5. **`dependency-update.yml`**: Automated updates
   - Weekly dependency checks
   - Creates update PRs

---

## 🎉 Getting Started

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Setup CI/CD pipeline"
   git push origin main
   ```

2. **Configure secrets** (see above section)

3. **Watch the workflow run** in Actions tab

4. **Monitor deployment** on your chosen platform

5. **Access your deployed application!**

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Render Documentation](https://render.com/docs)
- [Docker Documentation](https://docs.docker.com)
- [PM2 Documentation](https://pm2.keymetrics.io/docs)

---

## 💡 Best Practices

1. **Use environment-specific configurations**
2. **Keep secrets secure** - never commit them
3. **Test locally before pushing**
4. **Use preview deployments for PRs**
5. **Monitor logs regularly**
6. **Keep dependencies updated**
7. **Use semantic versioning for releases**

---

## 🆘 Support

For issues or questions:
- Check GitHub Actions logs
- Review deployment platform logs
- Open an issue in the repository
- Check the troubleshooting section above

---

**Happy Deploying! 🚀**
