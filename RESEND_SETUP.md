# 📧 Resend Setup Guide for Love Unsent OTP

## ✅ What I've Done

1. ✅ Installed `resend` package
2. ✅ Updated `emailService.ts` to use Resend instead of NodeMailer
3. ✅ Fixed OTP model (added `verified` and `attempts` fields)
4. ✅ Added enhanced logging for debugging

---

## 🚀 Setup Instructions

### Step 1: Get Your Resend API Key

1. **Sign up for Resend** (if you haven't already)
   - Go to: https://resend.com/
   - Click "Sign Up" or "Get Started"
   - Sign up with GitHub (recommended) or email

2. **Create an API Key**
   - After logging in, go to: https://resend.com/api-keys
   - Click "Create API Key"
   - Name it: `loveunsent-production` or similar
   - **Copy the API key** (starts with `re_...`)
   - ⚠️ **Important**: Save it securely - you won't see it again!

3. **Verify Your Domain** (for production emails)
   - Go to: https://resend.com/domains
   - Click "Add Domain"
   - Add your domain: `loveunsent.com` (or whatever your domain is)
   - Follow the DNS configuration steps
   - Wait for verification (usually takes a few minutes)

   **OR** use the default sender for testing:
   - You can use `onboarding@resend.dev` to test (limited to 100 emails/day)

---

### Step 2: Configure Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/[your-username]/loveunsent/settings/environment-variables

2. **Add these environment variables:**

   ```
   Variable Name: RESEND_API_KEY
   Value: re_your_api_key_here
   Environment: Production, Preview, Development
   ```

   ```
   Variable Name: EMAIL_FROM
   Value: Love Unsent <noreply@loveunsent.com>
   Environment: Production, Preview, Development
   ```

   **Note**: If your domain isn't verified yet, use:
   ```
   EMAIL_FROM=Love Unsent <onboarding@resend.dev>
   ```

3. **Optional - Add Master OTP for Testing:**

   ```
   Variable Name: MASTER_OTP
   Value: 123456
   Environment: Preview, Development (NOT Production!)
   ```

---

### Step 3: Deploy to Vercel

Run these commands to deploy:

```bash
# 1. Stage all changes
git add -A

# 2. Commit
git commit -m "Integrate Resend for email OTP delivery"

# 3. Push to deploy
git push origin main
```

---

### Step 4: Test on Production

1. **Wait for Vercel deployment** to complete
2. **Go to**: https://loveunsent.vercel.app/login (or wherever your login is)
3. **Try Email OTP flow**:
   - Enter your email
   - Click "Send OTP"
   - Check your inbox for the OTP email
   - Enter the code
   - Should successfully log in! ✅

---

## 🔍 Debugging

### Check Vercel Function Logs

If something goes wrong:

1. Go to: https://vercel.com/[your-username]/loveunsent
2. Click "Deployments" → Latest deployment
3. Click "Functions" tab
4. Look for `/api/auth/email/send-otp`
5. Check the logs - you should see:
   ```
   📧 Email OTP created for user@example.com: 123456
   ✅ Email OTP sent successfully via Resend to: user@example.com
   📧 Message ID: abc123...
   ```

### Common Errors & Solutions

**Error: "Failed to send OTP"**
- ✅ Check that `RESEND_API_KEY` is set on Vercel
- ✅ Make sure the API key is valid
- ✅ Check Resend dashboard for any errors

**Error: "Invalid sender email"**
- ✅ If domain not verified, use `onboarding@resend.dev`
- ✅ Or verify your domain in Resend dashboard

**Error: "Invalid or expired OTP"**
- ✅ This should be fixed now with the model update
- ✅ Make sure you deployed the latest changes

---

## 📊 Resend Benefits

✅ **Easy Setup**: Just one API key  
✅ **Reliable**: 99.9% uptime  
✅ **Fast**: Emails delivered in < 1 second  
✅ **Free Tier**: 3,000 emails/month  
✅ **Great DX**: Beautiful dashboard, logs, and analytics  
✅ **No SMTP hassles**: No ports, no authentication issues  

---

## 💡 Local Development

For local development, the email service will automatically log OTPs to the console if `RESEND_API_KEY` is not set:

```
═══════════════════════════════════════
📧 DEV MODE - EMAIL OTP
Email: test@example.com
OTP Code: 123456
═══════════════════════════════════════
```

Just copy the code from the console and use it!

---

## 📝 Files Changed

- ✅ `src/lib/emailService.ts` - Now uses Resend
- ✅ `src/models/OTP.ts` - Added `verified` and `attempts` fields
- ✅ `src/app/api/auth/email/send-otp/route.ts` - Enhanced logging
- ✅ `src/app/api/auth/mobile/send-otp/route.ts` - Enhanced logging
- ✅ `package.json` - Added `resend` dependency

---

## ✅ Checklist

Before deploying:

- [ ] Installed `resend` package (`npm install resend`)
- [ ] Got Resend API key from https://resend.com/api-keys
- [ ] Added `RESEND_API_KEY` to Vercel environment variables
- [ ] Added `EMAIL_FROM` to Vercel environment variables
- [ ] Committed and pushed changes to GitHub
- [ ] Waited for Vercel deployment to complete
- [ ] Tested email OTP on production

After deploying:

- [ ] Email OTP works ✅
- [ ] Mobile OTP works ✅
- [ ] Both login flows work ✅

---

## 🆘 Need Help?

If you encounter any issues:

1. Check Vercel function logs (as described above)
2. Check Resend dashboard: https://resend.com/emails
3. Share the error logs with me

Happy coding! 🚀
