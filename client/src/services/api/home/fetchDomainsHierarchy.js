import { fetchAllOpenAlexData } from "../../helpers/fetchAllOpenAlexData";

export async function fetchDomainsHierarchy() {
  try {
    // Fetch domains, fields, and subfields using Axios
    const [domainsData, fieldsData, subfieldsData] = await Promise.all([
      fetchAllOpenAlexData("/domains"),
      fetchAllOpenAlexData("/fields"),
      fetchAllOpenAlexData("/subfields"),
    ]);

    // Create a map of fields to their subfields
    const subfieldsMap = subfieldsData.reduce((acc, subfield) => {
      if (subfield.field) {
        const fieldId = subfield.field.id;
        if (!acc[fieldId]) {
          acc[fieldId] = [];
        }
        acc[fieldId].push({
          name: subfield.display_name,
          id: subfield.id,
        });
      }
      return acc;
    }, {});

    // Transform domains and fields
    const transformedDomains = domainsData.map((domain) => ({
      name: domain.display_name,
      id: domain.id,
      children: domain.fields.map((field) => {
        // Find the corresponding field details
        const fieldDetails = fieldsData.find((f) => f.id === field.id);

        return {
          name: fieldDetails.display_name,
          id: fieldDetails.id,
          children: subfieldsMap[fieldDetails.id] || [],
        };
      }),
    }));

    // Create the final hierarchical structure
    return {
      name: "",
      children: transformedDomains,
    };
  } catch (error) {
    console.error("Error fetching OpenAlex hierarchy:", error);
    return null;
  }
}
