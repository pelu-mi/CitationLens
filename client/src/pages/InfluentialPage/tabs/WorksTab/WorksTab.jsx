/**
 * @component WorksTab
 * @description Tab component for displaying academic works as a force-directed graph
 * with topic selection
 */

import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { Divider, Grid2 } from "@mui/material";
import { useLocation } from "react-router";
import { openAlexApiClient } from "../../../../services/openAlexApiClient";
import { Loader } from "../../../../components/Loader/Loader";
import { ForceDirectedGraph } from "../../../../components/ForceDirectedGraph/ForceDirectedGraph";
import { TopicSelector } from "../../../../components/TopicSelector/TopicSelector";

export const WorksTab = () => {
  const { subfieldId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [works, setWorks] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const subfieldName = location.state?.subfieldName;

  /**
   * Fetch works when selected topic changes
   */
  useEffect(() => {
    const fetchWorks = async () => {
      if (!subfieldId || !selectedTopicId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await openAlexApiClient.get(`/works`, {
          params: {
            filter: `primary_topic.subfield.id:${subfieldId},primary_topic.id:${selectedTopicId}`,
            sort: "cited_by_count:desc",
            per_page: 200,
          },
        });

        if (response.data && response.data.results) {
          setWorks(response.data.results);
        }
      } catch (error) {
        console.error("Error fetching works:", error);
        setError("Failed to fetch works data");
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, [subfieldId, selectedTopicId]);

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
        routePath={`/influential/${subfieldId}/works`}
      />

      <Divider orientation="vertical" />

      <Grid2
        size={9}
        display="flex"
        justifyContent="center"
        alignItems="center"
        overflow="hidden"
      >
        {loading || works.length === 0 ? (
          <Loader />
        ) : (
          <div style={{ width: "100%", height: "100%" }}>
            <ForceDirectedGraph works={works} />
          </div>
        )}
      </Grid2>
    </Grid2>
  );
};
