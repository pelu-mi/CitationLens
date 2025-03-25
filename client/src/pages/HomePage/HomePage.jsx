import { useEffect, useState } from "react";
import { openAlexApiClient } from "../../services/openAlexApiClient";
import { RadialTree } from "../../components/RadialTree/RadialTree";
import { Typography } from "@mui/material";

async function fetchAllOpenAlexData(endpoint) {
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

async function fetchDomainsHierarchy() {
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
export const HomePage = () => {
  const [treeData, setTreeData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const hierarchyData = await fetchDomainsHierarchy();
        setTreeData(hierarchyData);
      } catch (err) {
        setError(err);
        console.error("Failed to load OpenAlex hierarchy:", err);
      }
    };

    getData();
  }, []);
  return (
    <>
      <Typography
        variant="h4"
        sx={{
          wordWrap: "break-word",
          marginY: 4,
          textTransform: "capitalize",
        }}
      >
        Overview
      </Typography>

      <RadialTree data={treeData} />
    </>
  );
};
