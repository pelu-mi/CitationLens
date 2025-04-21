/**
 * Import Modules
 */
import PropTypes from "prop-types";

import { Container, css, GlobalStyles, Link, Typography } from "@mui/material";
import { NavBar } from "../NavBar/NavBar";

/**
 * Page Layout
 */
export const PageLayout = ({ children, disableFullHeight }) => {
  return (
    <>
      {!disableFullHeight && (
        <GlobalStyles
          styles={css`
            html,
            body,
            #root {
              height: 100%;
              overflow-x: hidden;
            }
          `}
        />
      )}

      <NavBar />
      <Container sx={{ paddingTop: "64px", height: "100%" }}>
        {children}
      </Container>
      <Typography
        variant="subtitle2"
        textAlign="center"
        sx={{ opacity: 0.4, background: "#efefef", paddingY: "4px" }}
      >
        Powered by{" "}
        <Link href="https://docs.openalex.org/" target="_blank">
          OpenAlex
        </Link>
        , {new Date().getFullYear()}
      </Typography>
    </>
  );
};

// Specify types of props to be received by PageLayout
PageLayout.propTypes = {
  children: PropTypes.node,
  disableFullHeight: PropTypes.bool,
};
