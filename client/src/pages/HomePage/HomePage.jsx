import { useEffect, useState } from "react";
import { RadialTree } from "../../components/RadialTree/RadialTree";
import { Box, Typography } from "@mui/material";
import { fetchDomainsHierarchy } from "../../services/api/home/fetchDomainsHierarchy";
import { Loader } from "../../components/Loader/Loader";

export const HomePage = () => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const hierarchyData = await fetchDomainsHierarchy();
        setTreeData(hierarchyData);
      } catch (err) {
        setError(err);
        console.error("Failed to load OpenAlex hierarchy:", err);
      } finally {
        setLoading(false);
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

      <Box sx={{ width: "100%", height: "80vh" }}>
        {loading ? <Loader /> : <RadialTree data={treeData} />}
      </Box>
    </>
  );
};
