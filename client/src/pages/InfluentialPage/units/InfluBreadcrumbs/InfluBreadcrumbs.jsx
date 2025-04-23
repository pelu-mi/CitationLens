/**
 * @component InfluBreadcrumbs
 * @description Displays navigation breadcrumbs.
 */

import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";

/**
 * InfluBreadcrumbs
 */
export const InfluBreadcrumbs = () => {
  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mt: 4, fontSize: 12 }}>
      <Link underline="hover" color="inherit" href="/">
        Domain Overview
      </Link>
      <Typography></Typography>
    </Breadcrumbs>
  );
};
