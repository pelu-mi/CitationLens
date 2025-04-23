/**
 * @component HomePage
 * @description Displays an interactive visualization of academic domains hierarchy using a radial tree.
 */

import { useEffect, useState } from "react";
import { RadialTree } from "../../components/RadialTree/RadialTree";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import { fetchDomainsHierarchy } from "../../services/api/home/fetchDomainsHierarchy";
import { Loader } from "../../components/Loader/Loader";
import { useNavigate, useParams } from "react-router";
import { extractId } from "../../utils/extractId";

export const HomePage = () => {
  const { domainId } = useParams();
  const navigate = useNavigate();

  // State variables
  const [treeData, setTreeData] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch domain hierarchy data and set initial domain
   */
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const hierarchyData = await fetchDomainsHierarchy();
        setTreeData(hierarchyData);

        // Find the initial domain from URL or default to first domain
        let initialDomain = null;
        if (domainId) {
          initialDomain = hierarchyData.find(
            (domain) => extractId(domain.id) === domainId
          );
        }

        initialDomain = initialDomain || hierarchyData[0];
        setSelectedDomain(initialDomain);
      } catch (err) {
        setError(err);
        console.error("Failed to load OpenAlex hierarchy:", err);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [domainId]);

  /**
   *  Handle domain selection and update URL
   */
  const handleDomainChange = (event, newDomain) => {
    if (newDomain) {
      setSelectedDomain(newDomain);
      navigate(`/${extractId(newDomain.id)}`);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px - 30px)",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        mt={3}
        mb={2}
      >
        <Typography
          variant="h4"
          sx={{
            wordWrap: "break-word",
            textTransform: "capitalize",
          }}
        >
          Domain Overview
        </Typography>
        <Autocomplete
          value={selectedDomain}
          onChange={handleDomainChange}
          sx={{ width: { xs: "100%", sm: 300 } }}
          id="domain-options"
          options={treeData}
          getOptionLabel={(option) => option?.display_name || ""}
          renderInput={(params) => <TextField {...params} label="Domain" />}
          isOptionEqualToValue={(option, value) =>
            extractId(option?.id) === extractId(value?.id)
          }
          disableClearable
        />
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Loader />
          </Box>
        ) : (
          <RadialTree data={selectedDomain} />
        )}
      </Box>
    </Box>
  );
};
