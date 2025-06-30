# IntelliView Frontend

IntelliView is your AI-powered interview companion. This frontend application is built with **Next.js 14**, **Tailwind CSS**, **ShadCN**, and **Framer Motion** to deliver a modern, responsive, and interactive interface. It connects to a serverless backend powered by AWS Lambda, DynamoDB, Amazon Bedrock, and other AWS services to simulate technical interviews and deliver real-time AI feedback.

## 🚀 Features

* 🎙️ Real-Time Interview Simulation (DSA, System Design, Behavioral)
* 🧠 AI-Powered Feedback via Claude (Amazon Bedrock)
* 📈 Skill Analytics Dashboard (aggregated feedback & trends)
* 🔐 Secure Auth with Amazon Cognito
* 🎨 Animated UI with Framer Motion & Tailwind
* 💾 Persistent session tracking and review history

---

## 📁 Project Structure

```
intelliview-frontend/
├── app/               # Next.js 14 app directory (routing)
│   ├── review/        # Session review page
│   ├── sessions/      # Overall sessions page
│   ├── app/           # Main dashboard
│   ├── interview/     # Interview Page
│   └── page.tsx       # Landing page
├── components/        # Shared UI components
├── lib/               # OIDC & API helpers
├── public/            # Static assets
├── styles/            # Global Tailwind styles
├── next.config.js     # Next.js config
└── README.md
```

---

## 🛠️ Built With

* **Frontend:** Next.js 14, React, TypeScript
* **Styling:** Tailwind CSS, ShadCN, Framer Motion
* **Authentication:** Amazon Cognito
* **Backend (External):** AWS Lambda, DynamoDB, API Gateway, EventBridge, Amazon Bedrock (Claude)
* **Deployment:** Vercel (or any other platform)

---

## 🧪 Environment Variables

Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_LAMBDA_ENDPOINT=https://your-api-url
NEXT_PUBLIC_COGNITO_DOMAIN=https://your-cognito-domain
NEXT_PUBLIC_CLIENT_ID=your-client-id
NEXT_PUBLIC_REDIRECT_IN=http://localhost:3000/app
NEXT_PUBLIC_REDIRECT_OUT=http://localhost:3000
```

---

## 🧪 Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🔍 Key Pages

* `/` – Landing Page
* `/app` – Main Dashboard (post-login)
* `/review?sessionId=...` – Session review view
* `/sessions` – Overall sessions display

---

## 🔐 Authentication Flow

IntelliView uses Amazon Cognito for OAuth2 login. Upon login, a JWT token is saved and passed in requests to authorize users and fetch their session/feedback data.

---

## 🧠 Feedback + Analytics Flow

* **Interview Session:** Stored in DynamoDB by a Lambda function.
* **Claude Feedback:** Triggered post-session to evaluate user answers.
* **Review Page:** Fetches message history + Claude analysis.
* **Skill Dashboard:** Aggregates data across sessions using another Lambda.

---

## 📸 Preview

<img width="1799" alt="image" src="https://github.com/user-attachments/assets/004d486f-d8da-4ba0-8b4d-c5daba3d558c" />
<img width="1799" alt="image" src="https://github.com/user-attachments/assets/bc1e8518-f92f-48df-9cee-1ad1c62e071d" />
<img width="1799" alt="image" src="https://github.com/user-attachments/assets/b1cad959-f218-480a-8534-a77fb6e21201" />


---

## 🌐 Live Demo

[https://intelliview-frontend.vercel.app/app](https://intelliview-frontend.vercel.app/app)

## 🧠 Backend Repository

[https://github.com/AvishKaushik/intelliview-backend](https://github.com/AvishKaushik/intelliview-backend)

---

## 📄 License

MIT License

---

## ✨ Contributors

* Avish Kaushik

PRs welcome 🙌
