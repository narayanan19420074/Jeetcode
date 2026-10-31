# JeetCode launch checklist

Tick each item before the public launch. Items marked (code) need a change in the repo, the rest are dashboard settings.

## 1. Test on a real phone
- [ ] Render deploy log is green (web and judge)
- [ ] Sign up, verify email, log in, log out
- [ ] Forgot password: code arrives, code + new password works, old link also works
- [ ] Google and GitHub sign in
- [ ] Solve one coding problem and one aptitude question
- [ ] Dashboard calendar: "Today ends in" counts down to midnight IST
- [ ] Streak goes up after an Accepted submission
- [ ] Phone: login page and home page look right in light and dark mode

## 2. Hosting (Render)
- [ ] Move to a paid plan, or add a keep-alive ping (free services sleep after 15 minutes idle)
- [ ] Judge service can handle more than one submission at a time (free plan: 1)
- [ ] `branch:` in `render.yaml` points to `main`, and `main` has the code you want live (code)
- [ ] Custom domain and HTTPS working

## 3. Environment variables (Render dashboard)
- [ ] `MONGODB_URI`
- [ ] `JUDGE_SERVICE_URL` and `JUDGE_SERVICE_TOKEN` (same token on both services)
- [ ] `TURNSTILE_SECRET_KEY` and `VITE_TURNSTILE_SITE_KEY`
- [ ] `BREVO_API_KEY`, `MAIL_FROM_EMAIL` (verified sender in Brevo), `APP_URL`
- [ ] `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
- [ ] `REDIS_URL` (shared rate limits and the submission queue)
- [ ] `FREE_ACCESS_UNTIL` set to the end of the launch offer, or removed

## 4. Payments (Razorpay)
- [ ] Live mode keys: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- [ ] `RAZORPAY_WEBHOOK_SECRET` matches the webhook in the Razorpay dashboard
- [ ] `RAZORPAY_PLAN_ID_MONTHLY` and `RAZORPAY_PLAN_ID_YEARLY` are live plans
- [ ] One real payment tested end to end, and a cancellation

## 5. Safety net
- [ ] MongoDB Atlas backups on
- [ ] Uptime monitor on `/api/health` (UptimeRobot or similar) with an alert to your phone
- [ ] A support email address that is checked daily (Help & Support page)
- [ ] Privacy Policy, Terms and Refund pages reviewed

## 6. Later (not needed for launch)
- [ ] Remember me on sign in (code)
- [ ] Sign in with email code (code)
- [ ] Sign in with phone number and OTP (needs an SMS provider, decide first) (code)
