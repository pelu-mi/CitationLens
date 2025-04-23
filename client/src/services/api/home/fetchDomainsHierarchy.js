/**
 * @function fetchDomainsHierarchy
 * @description Fetches and structures the academic domains hierarchy from OpenAlex API
 */

import { fetchAllOpenAlexData } from "../../helpers/fetchAllOpenAlexData";

export async function fetchDomainsHierarchy() {
  try {
    // Fetch domains and fields using Axios
    const [domainsData, fieldsData] = await Promise.all([
      fetchAllOpenAlexData("/domains"),
      fetchAllOpenAlexData("/fields"),
    ]);

    // Create a map of domains to their fields
    const fieldsMap = fieldsData.reduce((acc, field) => {
      if (field.domain) {
        const domainId = field.domain.id;
        if (!acc[domainId]) {
          acc[domainId] = [];
        }
        acc[domainId].push({
          display_name: field.display_name,
          id: field.id,
          children: field.subfields,
        });
      }
      return acc;
    }, {});

    // Transform domains and fields into hierarchical structure
    const transformedDomains = domainsData.map((domain) => ({
      display_name: domain.display_name,
      id: domain.id,
      children: fieldsMap[domain.id],
    }));

    return transformedDomains;
  } catch (error) {
    console.error("Error fetching OpenAlex hierarchy:", error);
    return null;
  }
}
