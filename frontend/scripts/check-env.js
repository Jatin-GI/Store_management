const isVercel = Boolean(process.env.VERCEL);
const apiUrl = process.env.VITE_API_URL;

if (isVercel && !apiUrl) {
  console.error(
    "\nBuild failed: VITE_API_URL is not set on Vercel.\n" +
      "Go to Settings → Environment Variables and add:\n" +
      "  Name:  VITE_API_URL  (exact spelling, all caps)\n" +
      "  Value: https://store-management-ncun.onrender.com/api/v1\n" +
      "Then redeploy.\n",
  );
  process.exit(1);
}

if (isVercel && apiUrl.includes("localhost")) {
  console.error(
    "\nBuild failed: VITE_API_URL must not use localhost on Vercel.\n" +
      `Current value: ${apiUrl}\n`,
  );
  process.exit(1);
}

if (apiUrl) {
  console.log(`VITE_API_URL OK: ${apiUrl}`);
}
