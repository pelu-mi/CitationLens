import {
  Box,
  Divider,
  Grid2,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { fetchAllOpenAlexData } from "../../../../services/helpers/fetchAllOpenAlexData";
import { extractId } from "../../../../utils/extractId";
import { openAlexApiClient } from "../../../../services/openAlexApiClient";
import { Loader } from "../../../../components/Loader/Loader";
import { AuthorsScatterplot } from "../../../../components/AuthorsScatterplot/AuthorsScatterplot";

export const AuthorsTab = () => {
  const { subfieldId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    state: { subfieldName },
  } = location;

  // Fetch topics when component mounts or subfieldId changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const topicParam = searchParams.get("topic");

    const loadTopics = async () => {
      try {
        setLoading(true);
        // Construct endpoint with subfieldId
        const endpoint = `topics?filter=subfield.id:${subfieldId}`;
        const topicsData = await fetchAllOpenAlexData(endpoint);

        // Transform topics data into list items
        const topicsList = topicsData.map((topic) => ({
          label: topic.display_name,
          id: extractId(topic.id),
        }));

        setTopics(topicsList);

        // Set selected index based on URL parameter or default to first item
        if (topicParam) {
          const matchingTopic = topicsList.find(
            (topic) => extractId(topic.id) === topicParam
          );
          if (matchingTopic) {
            setSelectedTopicId(topicParam);
          } else if (topicsList.length > 0) {
            const firstTopicId = topicsList[0].id;
            setSelectedTopicId(firstTopicId);
          }
        } else if (topicsList.length > 0) {
          const firstTopicId = topicsList[0].id;
          setSelectedTopicId(firstTopicId);
        }
      } catch (error) {
        console.error("Error loading topics:", error);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    if (subfieldId) {
      loadTopics();
    }
  }, [subfieldId, location.search, navigate, subfieldName]);

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

  const handleListItemClick = (topicId) => {
    // Navigate with the topic ID as a query parameter
    navigate(`/influential/${subfieldId}/authors?topic=${topicId}`, {
      state: {
        subfieldName,
      },
    });

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
      <Grid2
        size={3}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            margin: 2,
          }}
        >
          {topics.length > 1 ? "Topics" : "Topic"}{" "}
          {topics.length > 0 && `(${topics.length})`}
        </Typography>

        <Divider />

        {topics.length === 0 ? (
          <Loader />
        ) : (
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
            }}
          >
            <List
              sx={{
                width: "100%",
                p: 0,
              }}
            >
              {topics.map((topic) => (
                <ListItemButton
                  key={topic.id}
                  selected={selectedTopicId === topic.id}
                  onClick={() => handleListItemClick(topic.id)}
                >
                  <ListItemText primary={topic.label} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        )}
      </Grid2>

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
