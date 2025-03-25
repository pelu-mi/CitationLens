import { useEffect, useState } from "react";
import { RadialTree } from "../../components/RadialTree/RadialTree";
import { Typography } from "@mui/material";
import { fetchDomainsHierarchy } from "../../services/api/home/fetchDomainsHierarchy";

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
