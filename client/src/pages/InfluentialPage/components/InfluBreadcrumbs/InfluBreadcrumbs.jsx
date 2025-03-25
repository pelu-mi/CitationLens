import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";

export const InfluBreadcrumbs = () => {
  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mt: 4, fontSize: 12 }}>
      <Link underline="hover" color="inherit" href="/">
        Overview
      </Link>
      <Typography></Typography>
    </Breadcrumbs>
  );
};
