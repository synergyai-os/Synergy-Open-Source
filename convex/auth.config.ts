export default {
  providers: [
    {
      domain: process.env.SITE_URL,  // ✅ Changed from CONVEX_SITE_URL
      applicationID: "convex",
    },
  ],
};