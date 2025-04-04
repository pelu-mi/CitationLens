import { Divider, Grid2 } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import { openAlexApiClient } from "../../../../services/openAlexApiClient";
import { Loader } from "../../../../components/Loader/Loader";
import { AuthorsScatterplot } from "../../../../components/AuthorsScatterplot/AuthorsScatterplot";
import { TopicSelector } from "../../../../components/TopicSelector/TopicSelector";

export const AuthorsTab = () => {
  const { subfieldId } = useParams();
  const location = useLocation();
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    state: { subfieldName },
  } = location;

  // Fetch authors when selected topic changes
  useEffect(() => {
    const fetchAuthors = async () => {
      if (!selectedTopicId) return;

      try {
        setLoading(true);
        setAuthors([]);
        const response = await openAlexApiClient.get(`/authors`, {
          params: {
            filter: `topics.id:${selectedTopicId}`,
            sort: "cited_by_count:desc",
            per_page: 50,
          },
        });

        setAuthors(response.data.results);
      } catch (error) {
        console.error("Error fetching authors:", error);
        setAuthors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, [selectedTopicId]);

  const handleTopicSelected = (topicId) => {
    setSelectedTopicId(topicId);
  };

  return (
    <Grid2
      container
      wrap="no-wrap"
      sx={{
        height: "calc(100vh - 280px)",
      }}
    >
      <TopicSelector
        subfieldId={subfieldId}
        selectedTopicId={selectedTopicId}
        onTopicSelected={handleTopicSelected}
        subfieldName={subfieldName}
        routePath={`/influential/${subfieldId}/authors`}
      />

      <Divider orientation="vertical" />

      <Grid2
        size={9}
        paddingX={4}
        paddingBottom={3}
        paddingTop={6}
        display="flex"
        justifyContent="center"
        alignItems="center"
        overflow="auto"
      >
        {loading || authors.length === 0 ? (
          <Loader />
        ) : (
          <AuthorsScatterplot authors={authors} />
        )}
      </Grid2>
    </Grid2>
  );
};
