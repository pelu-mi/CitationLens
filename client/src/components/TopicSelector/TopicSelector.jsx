/**
 * @component TopicSelector
 * @description Displays a searchable list of topics for a specific subfield with selection capability
 */

import {
  Box,
  Divider,
  Grid2,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { fetchAllOpenAlexData } from "../../services/helpers/fetchAllOpenAlexData";
import { extractId } from "../../utils/extractId";
import { Loader } from "../Loader/Loader";

/**
 * Topic Selector
 */
export const TopicSelector = ({
  subfieldId,
  selectedTopicId,
  onTopicSelected,
  subfieldName,
  routePath,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  // Flag to block navigation-triggered reloads when user clicks
  const isUserAction = useRef(false);
  // Internal selected ID that doesn't depend on the prop
  const [internalSelectedId, setInternalSelectedId] = useState(selectedTopicId);

  /**
   * Sync internal state with props when they change
   */
  useEffect(() => {
    // Only update from props if not from user click
    if (!isUserAction.current) {
      setInternalSelectedId(selectedTopicId);
    } else {
      // Reset the flag after handling
      isUserAction.current = false;
    }
  }, [selectedTopicId]);

  /**
   * Fetch topics when component mounts or subfieldId changes
   */
  useEffect(() => {
    if (!subfieldId) return;

    const searchParams = new URLSearchParams(location.search);
    const topicParam = searchParams.get("topic");

    const loadTopics = async () => {
      try {
        setLoading(true);
        // Construct endpoint with subfieldId
        const endpoint = `topics?filter=subfield.id:${subfieldId}`;
        const topicsData = await fetchAllOpenAlexData(endpoint);

        // Transform topics data into list items
        const topicsList = topicsData
          .sort((a, b) => b.works_count - a.works_count)
          .map((topic) => ({
            label: topic.display_name,
            worksCount: topic.works_count,
            id: extractId(topic.id),
          }));

        setTopics(topicsList);
        setFilteredTopics(topicsList);

        // Set selected index based on URL parameter or default to first item
        let topicToSelect = null;

        if (topicParam) {
          const matchingTopic = topicsList.find(
            (topic) => extractId(topic.id) === topicParam
          );
          if (matchingTopic) {
            topicToSelect = topicParam;
          } else if (topicsList.length > 0) {
            topicToSelect = topicsList[0].id;
          }
        } else if (topicsList.length > 0) {
          topicToSelect = topicsList[0].id;
        }

        if (topicToSelect) {
          setInternalSelectedId(topicToSelect);
          // Avoid triggering this on initial load if not necessary
          if (topicToSelect !== selectedTopicId && onTopicSelected) {
            onTopicSelected(topicToSelect);
          }
        }
      } catch (error) {
        console.error("Error loading topics:", error);
        setTopics([]);
        setFilteredTopics([]);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, [subfieldId]);

  /**
   * Filter topics based on search term
   */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTopics(topics);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = topics.filter((topic) =>
      topic.label.toLowerCase().includes(lowerSearchTerm)
    );

    setFilteredTopics(filtered);
  }, [topics, searchTerm]);

  /**
   * Handle topic selection and update URL
   */
  const handleListItemClick = (topicId) => {
    // Set user action flag
    isUserAction.current = true;

    // Only process if it's actually a new selection
    if (topicId !== internalSelectedId) {
      // Update internal state
      setInternalSelectedId(topicId);

      // Call parent callback before navigation
      if (onTopicSelected) {
        onTopicSelected(topicId);
      }

      // Navigate with the topic ID as a query parameter
      navigate(`${routePath}?topic=${topicId}`, {
        state: {
          subfieldName,
        },
        replace: true,
      });
    }
  };

  /**
   * Handle search input changes
   */
  const handleSearchTopics = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  return (
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

      <TextField
        placeholder="Search topics"
        sx={{ mx: 2, mb: 2 }}
        value={searchTerm}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        onChange={handleSearchTopics}
      />

      <Divider />

      {loading ? (
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
            {filteredTopics.length > 0 ? (
              filteredTopics.map((topic) => (
                <ListItemButton
                  key={topic.id}
                  selected={internalSelectedId === topic.id}
                  onClick={() => handleListItemClick(topic.id)}
                >
                  <ListItemText
                    primary={topic.label}
                    secondary={
                      topic.worksCount > 1
                        ? `(${topic.worksCount.toLocaleString()} works)`
                        : `(${topic.worksCount.toLocaleString()} work)`
                    }
                    slotProps={{
                      primary: {
                        fontWeight: internalSelectedId === topic.id ? 600 : 400,
                      },
                    }}
                  />
                </ListItemButton>
              ))
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                mx={2}
                my={3}
              >
                <SearchOffIcon
                  color="disabled"
                  sx={{ width: 50, height: 50 }}
                />
                <Typography variant="button" color="textDisabled">
                  No Topics Found
                </Typography>
              </Box>
            )}
          </List>
        </Box>
      )}
    </Grid2>
  );
};
