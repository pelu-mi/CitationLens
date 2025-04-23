/**
 * @component InstitutionsTab
 * @description Tab component for displaying influential institutions as a bar chart
 * with topic selection
 */

import { Divider, Grid2 } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import { Loader } from "../../../../components/Loader/Loader";
import { openAlexApiClient } from "../../../../services/openAlexApiClient";
import { TopicSelector } from "../../../../components/TopicSelector/TopicSelector";
import { InstitutionsBarChart } from "../../../../components/InstitutionsBarChart/InstitutionsBarChart";

/**
 * Institutions Tab
 */
export const InstitutionsTab = () => {
  const { subfieldId } = useParams();
  const location = useLocation();
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    state: { subfieldName },
  } = location;

  /**
   * Fetch institutions data when selected topic changes
   */
  useEffect(() => {
    const fetchInstitutions = async () => {
      if (!selectedTopicId) return;

      try {
        setLoading(true);
        setInstitutions([]);
        const response = await openAlexApiClient.get(`/works`, {
          params: {
            filter: `primary_topic.subfield.id:${subfieldId},primary_topic.id:${selectedTopicId}`,
            group_by: "authorships.institutions.lineage",
            per_page: 100,
          },
        });

        setInstitutions(response.data.group_by);
      } catch (error) {
        console.error("Error fetching institutions:", error);
        setError("Failed to fetch institutions data");
        setInstitutions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, [selectedTopicId, subfieldId]);

  /**
   * Handle topic selection
   */
  const handleTopicSelected = (topicId) => {
    setSelectedTopicId(topicId);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Grid2
      container
      wrap="no-wrap"
      sx={{
        height: "calc(100vh - 259px - 30px)",
      }}
    >
      <TopicSelector
        subfieldId={subfieldId}
        selectedTopicId={selectedTopicId}
        onTopicSelected={handleTopicSelected}
        subfieldName={subfieldName}
        routePath={`/influential/${subfieldId}/institutions`}
      />

      <Divider orientation="vertical" />

      <Grid2
        size={9}
        paddingX={2}
        paddingTop={2}
        display="flex"
        justifyContent="center"
        alignItems="center"
        overflow="auto"
      >
        {loading || institutions.length === 0 ? (
          <Loader />
        ) : (
          <InstitutionsBarChart data={institutions} />
        )}
      </Grid2>
    </Grid2>
  );
};
