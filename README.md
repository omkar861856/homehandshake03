This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Environment Variables Setup

Before running the application, you need to set up your environment variables. Copy the template file and configure it:

```bash
cp env.template .env.local
```

Then edit `.env.local` with your actual values:

- **Clerk Authentication**: Get your keys from [Clerk Dashboard](https://dashboard.clerk.com/)
- **Ayrshare Integration**: Configure your Ayrshare API keys and domain
- **N8N Webhooks**: Set your N8N webhook URLs for video processing

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Run Development Server

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

## Security Features

- ✅ All API keys and secrets use environment variables
- ✅ No hardcoded credentials in source code
- ✅ Webhook URLs are configurable via environment variables
- ✅ Proper authentication middleware for protected routes

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

**Important**: Make sure to configure all environment variables in your Vercel deployment settings.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
