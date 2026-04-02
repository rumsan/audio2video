# GitHub Actions Workflow Setup Guide

This document explains how to configure the Docker build and push workflows with HashiCorp Vault integration.

## Overview

Two workflows are configured:
- **build-docker-main.yml** — Triggered on pushes to `main` branch, tags image as `latest` and with commit SHA
- **build-docker-stage.yml** — Triggered on pushes to `stage` branch, tags image as `stage` and `stage-{SHA}`

Both workflows:
- Fetch secrets from HashiCorp Vault
- Build multi-architecture images (linux/amd64, linux/arm64)
- Push to Docker Hub
- Cache build layers using GitHub Actions cache

## Prerequisites

1. **GitHub Repository** — Ensure this repository is on GitHub
2. **Docker Hub Account** — Account with push permissions
3. **HashiCorp Vault** — Instance with JWT auth enabled
4. **GitHub OIDC Provider** — Vault configured to trust GitHub

## GitHub Secrets Configuration

Add these credentials as GitHub repository secrets:

### Settings → Secrets and variables → Actions

| Secret Name | Value | Description |
|---|---|---|
| `VAULT_ADDR` | `https://vault.example.com` | Your Vault server address |
| `VAULT_ROLE` | `github-audio2video` | Vault JWT role for this project |

**How to add secrets:**
1. Go to your GitHub repository → Settings
2. Navigate to Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the name and value above

## Vault Configuration

### 1. Enable JWT Auth Method (if not already enabled)

```bash
vault auth enable jwt
```

### 2. Configure GitHub as JWT Provider

```bash
vault write auth/jwt/config \
  oidc_discovery_url="https://token.actions.githubusercontent.com" \
  bound_issuer="https://token.actions.githubusercontent.com"
```

### 3. Create JWT Role for This Project

```bash
vault write auth/jwt/role/github-audio2video \
  bound_audiences="https://github.com/rumsan" \
  user_claim="actor" \
  role_type="jwt" \
  policies="default,audio2video-main,audio2video-stage" \
  bound_subject="repo:rumsan/audio2video:*"
```

For specific branches, use more restrictive bounds:

```bash
# Main branch only
vault write auth/jwt/role/github-audio2video-main \
  bound_audiences="https://github.com/rumsan" \
  user_claim="actor" \
  role_type="jwt" \
  policies="default,audio2video-main" \
  bound_subject="repo:rumsan/audio2video:ref:refs/heads/main"

# Stage branch only
vault write auth/jwt/role/github-audio2video-stage \
  bound_audiences="https://github.com/rumsan" \
  user_claim="actor" \
  role_type="jwt" \
  policies="default,audio2video-stage" \
  bound_subject="repo:rumsan/audio2video:ref:refs/heads/stage"
```

### 4. Create Secret Paths in Vault

#### Main Branch Secrets

```bash
vault kv put secret/data/audio2video/main \
  dockerhub_username="your-dockerhub-username" \
  dockerhub_token="your-dockerhub-token" \
  api_key="your-secret-api-key" \
  base_url="https://audio2video.example.com" \
  cache_dir="/app/cache" \
  output_dir="/app/output"
```

#### Stage Branch Secrets

```bash
vault kv put secret/data/audio2video/stage \
  dockerhub_username="your-dockerhub-username" \
  dockerhub_token="your-dockerhub-token" \
  api_key="your-stage-api-key" \
  base_url="https://stage-audio2video.example.com" \
  cache_dir="/app/cache" \
  output_dir="/app/output"
```

### 5. Create Vault Policies

#### audio2video-main Policy

```hcl
path "secret/data/audio2video/main" {
  capabilities = ["read"]
}
```

#### audio2video-stage Policy

```hcl
path "secret/data/audio2video/stage" {
  capabilities = ["read"]
}
```

Save as `policy-main.hcl` and `policy-stage.hcl`, then apply:

```bash
vault policy write audio2video-main policy-main.hcl
vault policy write audio2video-stage policy-stage.hcl
```

## Workflow Variables

The workflows accept the following environment variables from Vault:

| Variable | Required | Description |
|---|---|---|
| `dockerhub_username` | Yes | Docker Hub username for authentication |
| `dockerhub_token` | Yes | Docker Hub access token (create in Hub account settings) |
| `api_key` | No | API_KEY passed as build arg (useful for build-time config) |
| `base_url` | No | BASE_URL passed as build arg |

Additional variables can be added by:
1. Adding them to the Vault secret paths
2. Adding them to the `secrets:` block in the workflow
3. Using them in build args or as environment variables

## Docker Hub Setup

1. **Create/Use Docker Hub Account**
2. **Create Access Token** (not password):
   - Go to Docker Hub → Account Settings → Security
   - Click "New Access Token"
   - Give it a descriptive name: `github-audio2video`
   - Select "Read & Write" permissions
   - Copy the token and add it to Vault

## Testing the Workflows

1. **Push to stage branch** to test the stage workflow:
   ```bash
   git checkout -b stage
   git push -u origin stage
   ```

2. **Push to main branch** to test the main workflow:
   ```bash
   git push origin main
   ```

3. **Monitor execution** — Go to GitHub Actions tab to view workflow runs

4. **Check Docker Hub** — Verify images are pushed with correct tags

## Troubleshooting

### Workflow fails with "Vault authentication failed"

- Verify `VAULT_ADDR` and `VAULT_ROLE` secrets are set correctly
- Check Vault JWT role has correct `bound_subject` (should match your repo path)
- Ensure Vault policies allow reading the secret paths

### Docker Hub login fails

- Verify `dockerhub_token` in Vault is correct and not a personal password
- Check Docker Hub account has push permissions
- Verify token has "Read & Write" scope

### Multi-arch build fails

- Ensure `docker/setup-buildx-action@v3` runs correctly
- Check Docker Hub supports multi-arch repositories
- Review Docker build logs in GitHub Actions

### Image doesn't appear on Docker Hub

- Check workflow completed successfully (green checkmark)
- Verify Docker credentials in Vault
- Check Docker Hub repository exists and is public/accessible

## Additional Configuration

### Custom Build Arguments

To add more build arguments, modify the `build-args:` section:

```yaml
build-args: |
  API_KEY=${{ env.API_KEY }}
  BASE_URL=${{ env.BASE_URL }}
  CUSTOM_VAR=${{ env.CUSTOM_VAR }}
```

### Scheduled Builds

To trigger builds on a schedule, add:

```yaml
on:
  push:
    branches:
      - main
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

### Notifications

Add a final step to notify on build completion:

```yaml
- name: Notify on completion
  if: always()
  run: |
    echo "Build completed with status: ${{ job.status }}"
    # Add curl to notification webhook, Slack, etc.
```
