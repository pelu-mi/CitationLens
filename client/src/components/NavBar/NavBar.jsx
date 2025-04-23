/**
 * @component NavBar
 * @description Application navigation bar.
 */

import { Box, Container, Toolbar } from "@mui/material";
import { StyledAppBar, StyledNavLogo } from "./NavBar.styled";
import { useNavigate } from "react-router";

/**
 * NavBar
 */
export const NavBar = () => {
  const navigate = useNavigate();

  return (
    <StyledAppBar position="fixed">
      <Container sx={{ height: "100%" }}>
        <Toolbar disableGutters>
          <Box
            sx={{
              flexGrow: 1,
              alignItems: "center",
              display: { xs: "flex" },
            }}
          >
            <StyledNavLogo onClick={() => navigate("/")} />
          </Box>
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};
