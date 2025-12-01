# Git Upload Guide - LoveUnsent Project

## Prerequisites
- Git installed on your system
- GitHub/GitLab/Bitbucket account
- Repository created on GitHub (if not already)

## Step-by-Step Guide

### 1. Initialize Git (if not already done)
```bash
# Navigate to your project directory
cd c:\project\loveunsent

# Initialize git repository
git init
```

### 2. Create .gitignore File
Make sure you have a `.gitignore` file to exclude unnecessary files:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Production
build/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env*.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
Thumbs.db
```

### 3. Add All Files to Git
```bash
# Add all files to staging
git add .

# Or add specific files
git add src/
git add package.json
git add README.md
```

### 4. Create Your First Commit
```bash
# Commit with a meaningful message
git commit -m "Initial commit: LoveUnsent e-commerce platform with authentication, PIN validation, and email verification"
```

### 5. Create a Repository on GitHub

**Option A: Via GitHub Website**
1. Go to https://github.com
2. Click "+" → "New repository"
3. Name: `loveunsent`
4. Description: "Handwritten letter e-commerce platform"
5. Choose Public or Private
6. **DO NOT** initialize with README (you already have code)
7. Click "Create repository"

**Option B: Via GitHub CLI**
```bash
# Install GitHub CLI first: https://cli.github.com/
gh repo create loveunsent --public --source=. --remote=origin
```

### 6. Connect Local Repository to GitHub
```bash
# Add remote repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/loveunsent.git

# Or if using SSH
git remote add origin git@github.com:YOUR_USERNAME/loveunsent.git

# Verify remote
git remote -v
```

### 7. Push to GitHub
```bash
# Push to main branch
git push -u origin main

# Or if your default branch is master
git push -u origin master
```

### 8. If You Get Branch Name Error
```bash
# Rename branch to main
git branch -M main

# Then push
git push -u origin main
```

## Common Issues & Solutions

### Issue 1: "failed to push some refs"
```bash
# Pull first, then push
git pull origin main --rebase
git push -u origin main
```

### Issue 2: Authentication Failed
```bash
# Use Personal Access Token instead of password
# Generate token at: https://github.com/settings/tokens
# Use token as password when prompted
```

### Issue 3: Large Files Error
```bash
# If you have large files, use Git LFS
git lfs install
git lfs track "*.psd"
git add .gitattributes
git commit -m "Add Git LFS"
```

## Subsequent Updates

### After Making Changes
```bash
# 1. Check what changed
git status

# 2. Add changed files
git add .

# 3. Commit with message
git commit -m "Add Amazon-style login button and PIN code validation"

# 4. Push to GitHub
git push
```

## Useful Git Commands

### Check Status
```bash
git status
```

### View Commit History
```bash
git log
git log --oneline
```

### Create a New Branch
```bash
git checkout -b feature/new-feature
```

### Switch Branches
```bash
git checkout main
```

### Merge Branch
```bash
git checkout main
git merge feature/new-feature
```

### Undo Last Commit (keep changes)
```bash
git reset --soft HEAD~1
```

### Discard Local Changes
```bash
git checkout -- filename
```

## Best Practices

### Commit Messages
```bash
# Good commit messages
git commit -m "Add: Amazon-style email verification system"
git commit -m "Fix: Profile update issue for mobile login users"
git commit -m "Update: Header with Amazon-style login button"
git commit -m "Docs: Add comprehensive API documentation"

# Bad commit messages
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

### Commit Frequency
- Commit after completing a feature
- Commit after fixing a bug
- Commit before making major changes
- Don't commit broken code

### Branch Strategy
```bash
# Main branch: Production-ready code
main

# Development branch: Integration branch
git checkout -b develop

# Feature branches: New features
git checkout -b feature/authentication
git checkout -b feature/pin-validation

# Bugfix branches: Bug fixes
git checkout -b bugfix/profile-update

# Hotfix branches: Urgent fixes
git checkout -b hotfix/security-patch
```

## Environment Variables

**IMPORTANT**: Never commit `.env` files!

Create `.env.example` instead:
```bash
# Copy your .env file
cp .env .env.example

# Remove sensitive values from .env.example
# Then commit .env.example
git add .env.example
git commit -m "Add environment variables template"
```

## Recommended Commit for Current State

```bash
# Add all files
git add .

# Commit with comprehensive message
git commit -m "Feature: Complete authentication and verification system

- Implemented unified Amazon-style auth flow
- Added PIN code validation with auto-fill
- Implemented smart email verification
- Fixed profile update for mobile users
- Added Amazon-style login button in header
- Fixed homepage access in private browser
- Added comprehensive documentation"

# Push to GitHub
git push -u origin main
```

## GitHub Repository Setup

### Add README.md
Create a good README with:
- Project description
- Features
- Installation instructions
- Environment variables
- Tech stack
- Screenshots

### Add LICENSE
Choose appropriate license:
- MIT License (permissive)
- GPL (copyleft)
- Apache 2.0 (patent protection)

### Add CONTRIBUTING.md
Guidelines for contributors

### Add .github/workflows
Set up CI/CD with GitHub Actions

## Quick Reference

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/loveunsent.git

# Pull latest changes
git pull

# Push changes
git push

# Create branch
git checkout -b branch-name

# Delete branch
git branch -d branch-name

# View branches
git branch -a

# Stash changes
git stash
git stash pop
```

## Need Help?

- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com/
- Git Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf

---

**Ready to upload?** Run the commands in the "Step-by-Step Guide" section above!
