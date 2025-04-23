/**
 * @component PageLayout
 * @description Consistent layout structure with navigation, content container and footer
 */

import { Container, css, GlobalStyles, Link, Typography } from "@mui/material";
import { NavBar } from "../NavBar/NavBar";

export const PageLayout = ({ children, disableFullHeight }) => {
  return (
    <>
      {/* Apply full-height styles unless disabled */}
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

      {/* Navigation bar component */}
      <NavBar />

      {/* Main content container with top padding to account for fixed navbar */}
      <Container sx={{ paddingTop: "64px", height: "100%" }}>
        {children}
      </Container>

      {/* Footer with attribution */}
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
