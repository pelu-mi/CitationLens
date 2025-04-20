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

  const [treeData, setTreeData] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const hierarchyData = await fetchDomainsHierarchy();
        setTreeData(hierarchyData);

        // Find the initial domain
        let initialDomain = null;
        if (domainId) {
          initialDomain = hierarchyData.find(
            (domain) => extractId(domain.id) === domainId
          );
        }

        // If no domain found from URL, use the first domain
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
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        p={2}
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
