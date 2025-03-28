/**
 * Import Modules
 */
import PropTypes from "prop-types";

import { Container, css, GlobalStyles } from "@mui/material";
import { NavBar } from "../NavBar/NavBar";

/**
 * Page Layout
 */
export const PageLayout = ({ children }) => {
  return (
    <>
      <GlobalStyles
        styles={css`
          html,
          body,
          #root {
            height: 100%;
          }
        `}
      />

      <NavBar />
      <Container sx={{ paddingTop: "64px", height: "100%" }}>
        {children}
      </Container>
    </>
  );
};

// Specify types of props to be received by PageLayout
PageLayout.propTypes = {
  children: PropTypes.node,
  disableFullHeight: PropTypes.bool,
};
