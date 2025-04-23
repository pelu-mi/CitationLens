/**
 * @component NavBar.styled
 * @description Styled components for the navigation bar.
 */

import { AppBar, Button, styled } from "@mui/material";
import { LogoIcon } from "../Icon/icons/LogoIcon";

// Styling for App bar
export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: "none",
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.default,
}));

// Styling for Navigation Logo
export const StyledNavLogo = styled(LogoIcon)(({ theme }) => ({
  marginRight: 24,
  cursor: "pointer",
  height: "42px",
  width: "auto",
}));
