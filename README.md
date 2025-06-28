# Job Portal

## Deployment on Vercel

This project is ready to deploy on [Vercel](https://vercel.com/). Follow these steps:

### 1. Environment Variables
Set the following environment variables in your Vercel project settings:

- `MONGODB_URI`: Your MongoDB connection string
- `NEXTAUTH_SECRET`: A strong secret for NextAuth (can be generated with `openssl rand -base64 32`)

If you use any OAuth providers with NextAuth, add their respective client IDs and secrets as well.

### 2. Deploy
- Push your code to GitHub, GitLab, or Bitbucket.
- Import your repository into Vercel.
- During setup, Vercel will detect this is a Next.js app.
- Set the environment variables as described above.
- Click "Deploy".

### 3. After Deployment
- Your API routes and authentication will work out of the box.
- If you need to seed your database, run the seed script locally or set up a one-time Vercel Serverless Function.

---

For more details, see the [Next.js deployment documentation](https://nextjs.org/docs/deployment) and [Vercel documentation](https://vercel.com/docs/concepts/projects/environment-variables). 