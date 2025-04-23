/**
 * @component Loader
 * @description A flexible loading indicator component that displays either circular or linear progress based on provided props.
 */

import { Box, CircularProgress, LinearProgress } from "@mui/material";

/**
 * Loader
 */
export const Loader = ({ type = "circular", sx }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      ...sx,
    }}
  >
    {type === "circular" && <CircularProgress />}
    {type === "linear" && (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    )}
  </Box>
);
