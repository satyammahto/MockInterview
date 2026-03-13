
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Project Structure

```text
MockInterview/
├── app/                  # Next.js App Router root
│   ├── (dashboard)/      # Route group for dashboard
│   ├── architecture/     # Route for architecture page
│   ├── fonts/            # Custom fonts
│   ├── favicon.ico       # App Favicon
│   ├── globals.css       # Global CSS styles
│   ├── layout.tsx        # Root layout component
│   └── page.tsx          # Root page component
├── backend/              # Python FastAPI Backend
│   ├── models/           # Database models
│   ├── routers/          # API route definitions
│   ├── services/         # Core AI services (TTS, STT, generation)
│   ├── config.py         # Backend configuration settings
│   ├── database.py       # Database connection logic
│   ├── main.py           # FastAPI application entry point
│   └── requirements.txt  # Python dependencies
├── components/           # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── Navbar.tsx        # Navigation bar
│   ├── Sidebar.tsx       # Sidebar component
│   └── theme-provider.tsx# Theme provider for dark/light mode
├── lib/                  # Utility functions
│   └── utils.ts          # Shared helpers
├── public/               # Static assets
├── components.json       # shadcn/ui configuration
├── next.config.ts        # Next.js configuration
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```
