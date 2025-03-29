import { Typography } from "@mui/material";
import { openAlexApiClient } from "../../../../services/openAlexApiClient";
import { useParams } from "react-router";
import { useEffect, useState } from "react";

export const WorksTab = () => {
  const { subfieldId } = useParams();

  const [works, setWorks] = useState([]);
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch works when selected topic changes
  useEffect(() => {
    const fetchWorks = async () => {
      if (!subfieldId) return;

      try {
        setLoading(true);
        setCitations([]);
        const response = await openAlexApiClient.get(`/works`, {
          params: {
            filter: `primary_topic.subfield.id:${subfieldId}`,
            sort: "cited_by_count:desc",
            per_page: 200,
          },
        });

        // Store the works in a map for quick lookup
        const worksMap = new Map();
        const worksList = response.data.results.map((work) => {
          worksMap.set(work.id, work.display_name); // Store display name for quick reference
          return {
            id: work.id,
            name: work.display_name, // Use name instead of URL
            cited_by_count: work.cited_by_count,
            primary_topic: work.primary_topic.display_name,
            subfield: work.primary_topic.subfield.display_name,
            referenced_works: work.referenced_works || [], // Store referenced works (array of links)
          };
        });

        // Build citation
        const citationsList = [];
        worksList.forEach((work) => {
          if (work.referenced_works.length > 0) {
            work.referenced_works.forEach((referencedWork) => {
              if (worksMap.has(referencedWork)) {
                citationsList.push({
                  source: work.name, // The work making the reference
                  target: worksMap.get(referencedWork), // The work being referenced (get name from worksMap)
                });
              }
            });
          }
        });

        setWorks(worksList);
        setCitations(citationsList);
      } catch (error) {
        console.error("Error fetching authors:", error);
        setCitations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, [subfieldId]);

  return (
    <>
      <Typography
        variant="h5"
        sx={{
          wordWrap: "break-word",
          marginTop: 1,
          marginBottom: 4,
          textTransform: "capitalize",
        }}
      >
        Works
      </Typography>
    </>
  );
};
