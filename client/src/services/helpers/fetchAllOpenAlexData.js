import { openAlexApiClient } from "../openAlexApiClient";

export async function fetchAllOpenAlexData(endpoint) {
  const allResults = [];
  let page = 1;
  let hasMoreResults = true;

  while (hasMoreResults) {
    try {
      const response = await openAlexApiClient.get(endpoint, {
        params: {
          page: page,
          per_page: 200,
        },
      });

      const results = response.data.results;
      allResults.push(...results);

      // Check if we've fetched all results
      if (results.length < 200) {
        hasMoreResults = false;
      } else {
        page++;
      }
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      throw error;
    }
  }

  return allResults;
}
