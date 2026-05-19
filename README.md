# SwasthAI Frontend

React frontend for SwasthAI — AI-powered health and fitness platform.

## Tech Stack

- **React 18** — UI framework
- **React Router DOM** — Client-side routing
- **Axios** — HTTP requests
- **Vite** — Build tool
- **Pure CSS** — Styling (no external UI libraries)

## Pages

| Page | Route | Description |
|---|---|---|
| Login | `/` | Authentication with split-screen layout |
| Register | `/register` | Account creation with password strength indicator |
| Dashboard | `/dashboard` | Feature cards + professional footer |
| Diet Plan | `/diet` | BMI form + AI meal plan with protein tracking |
| Meal Swap | `/meal-swap` | Adjust meals after unhealthy eating |
| AI Coach | `/chat` | Persistent chat with history |
| Profile | `/profile` | BMI tracking + saved diet plan |

## Local Setup

```bash
npm install
npm run dev
```

Runs at: `http://localhost:5173`

> Make sure backend is running at `http://localhost:5000`

## Project Structure

```
src/
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Diet.jsx
│   ├── Chat.jsx
│   ├── Profile.jsx
│   └── MealSwap.jsx
├── styles/
│   ├── Auth.css
│   ├── Chat.css
│   ├── Dashboard.css
│   ├── Diet.css
│   ├── MealSwap.css
│   └── Profile.css
├── services/
│   └── api.js       # Axios instance
├── App.jsx
├── index.css
└── main.jsx
```

## Build for Production

```bash
npm run build
```

Output in `dist/` folder — deploy to Vercel.

## Design

- **Theme**: Purple gradient (`#667eea` → `#764ba2`)
- **Responsive**: Mobile-first, works on all screen sizes
- **Animations**: Fade-in, hover effects, smooth transitions
