export const rateLimit = ({
  interval = 60 * 1000, // 1 minute
  //   uniqueTokenPerInterval = 500,
  maxRequests = 100,
} = {}) => {
  const tokenCache = new Map();

  return {
    check: async (req: Request, limit: number = maxRequests) => {
      if (process.env.DISABLE_RATE_LIMIT === "true") {
        return true;
      }

      const token = req.headers.get("authorization") || req.url;
      const now = Date.now();

      const tokenCount = tokenCache.get(token) || [0];
      if (tokenCount[0] === 0) {
        tokenCache.set(token, [1, now]);
        return true;
      }

      const [count, timestamp] = tokenCount;

      if (now - timestamp > interval) {
        // Reset if interval has passed
        tokenCache.set(token, [1, now]);
        return true;
      }

      if (count >= limit) {
        return false;
      }

      tokenCache.set(token, [count + 1, timestamp]);
      return true;
    },
  };
};
