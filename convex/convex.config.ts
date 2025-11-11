import { defineApp } from 'convex/server';

// Temporarily comment out Resend component to test direct usage
// import resend from '@convex-dev/resend/convex.config';

const app = defineApp();
// app.use(resend);

export default app;
