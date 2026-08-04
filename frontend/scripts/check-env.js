const isVercel = Boolean(process.env.VERCEL);
let apiUrl = process.env.VITE_API_URL?.trim();

if (apiUrl) {
  const match = apiUrl.match(/^https?:\/\/[^/]+\/api\/v1/);
  if (match) apiUrl = match[0];
}

if (isVercel && !apiUrl) {
  console.error(
    "\nBuild failed: VITE_API_URL is not set on Vercel.\n" +
      "Go to Settings → Environment Variables and add:\n" +
      "  Name:  VITE_API_URL\n" +
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

if (isVercel && /api\/v1.*https?:\/\//.test(process.env.VITE_API_URL)) {
  console.error(
    "\nBuild failed: VITE_API_URL looks duplicated.\n" +
      "Use only ONE URL:\n" +
      "  https://store-management-ncun.onrender.com/api/v1\n",
  );
  process.exit(1);
}

if (apiUrl) {
  console.log(`VITE_API_URL OK: ${apiUrl}`);
}
