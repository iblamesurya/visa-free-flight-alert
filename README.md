# ✈️ Visa-Free Flight Price Tracker & Email Alert Service

A Vercel-deployable serverless flight scanner and automated email alert system built for Indian passport holders. It checks round-trip flight prices for visa-free, visa-on-arrival, and easy e-visa countries and **mails your inbox automatically** whenever flights drop below **₹10,000 or ₹15,000**.

---

## 🌟 Key Features

- **Automated Vercel Serverless Cron**: Runs daily on Vercel without needing your local computer to stay powered on.
- **Direct HTML Email Alerts**: Delivers beautifully styled HTML flight deal summaries with direct **Google Flights** and **Skyscanner** booking links.
- **Visa-Free Country Database**: Covers top budget destinations for Indian citizens (Thailand, Malaysia, Sri Lanka, Nepal, Vietnam, Maldives, Mauritius, Kazakhstan, Kenya, Oman, Seychelles, Indonesia/Bali).
- **Budget Threshold Filters**: Easily set alerts for flights under **₹10,000** or **₹15,000** round-trip.
- **Interactive Web Dashboard**: Preview deals, change origin city (DEL, BOM, BLR, HYD, MAA, CCU), adjust budget limits, and trigger instant test email alerts.
- **Flexible Email Support**: Native integration with **Resend** (Vercel recommended, 3,000 free emails/month) or standard **Nodemailer SMTP** (Gmail App Password, SendGrid, Mailgun, etc.).

---

## 📁 Project Structure

```
├── api/
│   ├── check-flights.js  # Serverless endpoint to scan flight deals
│   ├── cron.js           # Serverless Vercel Cron trigger endpoint
│   └── test-email.js     # Endpoint for sending manual test emails
├── lib/
│   ├── flightScanner.js  # Visa-free country dataset & price calculation engine
│   └── email.js          # Resend & Nodemailer HTML email builder
├── public/
│   ├── index.html        # Web Dashboard UI
│   ├── style.css         # Dark glassmorphism styling
│   └── app.js            # Interactive UI logic & API handler
├── vercel.json           # Vercel serverless routes & cron schedule
├── server.js             # Local Express development server
└── package.json          # Node dependencies & scripts
```

---

## 🚀 Quick Start (Local Development)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your email address:
   ```env
   RECIPIENT_EMAIL=your-email@gmail.com
   RESEND_API_KEY=re_123456789_your_key_here
   ```

3. **Start the Local Server**:
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## ☁️ Deploying to Vercel (Step-by-Step)

### Option A: Via Vercel Web Dashboard (Recommended)

1. **Push to GitHub**:
   Upload this project repository to your GitHub account.

2. **Import into Vercel**:
   - Go to [Vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository.
   - Click **Deploy**.

3. **Set Environment Variables**:
   In your Vercel Project Settings &rarr; **Environment Variables**, add:
   - `RECIPIENT_EMAIL` : `your-email@gmail.com`
   - `RESEND_API_KEY` : Sign up for free at [resend.com](https://resend.com) (takes 30 seconds) to get an API key.

4. **Automated Cron active**:
   `vercel.json` contains the daily cron trigger:
   ```json
   "crons": [
     {
       "path": "/api/cron",
       "schedule": "0 8 * * *"
     }
   ]
   ```
   Vercel will now automatically check flight prices every day at 8:00 AM UTC and email you whenever flights drop below your target price!

---

### Option B: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

---

## 📧 Email Provider Setup

### Using Resend (Recommended)
1. Sign up for free at [Resend.com](https://resend.com).
2. Copy your API key starting with `re_...`.
3. Add `RESEND_API_KEY=re_...` in your Vercel Environment Variables.

### Using Gmail SMTP (Alternative)
Add the following to your Vercel Environment Variables:
- `SMTP_HOST` = `smtp.gmail.com`
- `SMTP_PORT` = `587`
- `SMTP_USER` = `your-gmail@gmail.com`
- `SMTP_PASS` = `your-gmail-app-password` (Generate via Google Account Security &rarr; App Passwords)

---

## 💡 How It Works

1. **Scanner Engine (`lib/flightScanner.js`)**: Evaluates low-cost routes from major Indian hubs (DEL, BOM, BLR, HYD, MAA, CCU) to 12 top visa-free destinations.
2. **Deal Filter**: Isolates round-trip deals under ₹10,000 (🔥 Hot Deal) and ₹15,000 (⚡ Great Deal).
3. **Automated Email Dispatcher (`lib/email.js`)**: Formats an HTML email notification containing destination flags, allowed stay duration, travel dates, and one-click booking buttons for Google Flights and Skyscanner.

---

## 📜 License

MIT License. Free for personal & commercial use.
