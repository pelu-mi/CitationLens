import { Typography } from "@mui/material";
import { InfluBreadcrumbs } from "./components/InfluBreadcrumbs/InfluBreadcrumbs";

export const InfluentialPage = () => {
  return (
    <>
      <InfluBreadcrumbs />
      <Typography
        variant="h4"
        sx={{
          wordWrap: "break-word",
          marginTop: 1,
          marginButtom: 4,
          textTransform: "capitalize",
        }}
      >
        Influentials
      </Typography>
    </>
  );
};
