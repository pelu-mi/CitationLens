/**
 * @component ThemeProvider
 * @description Wraps the application with Material UI theme provider and global styles
 */

import {
  CssBaseline,
  GlobalStyles,
  ThemeProvider as MuiThemeProvider,
  css,
} from "@mui/material";
import "@fontsource/inter/300.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import getTheme from "./theme";

/**
 * Theme Provider
 */
export const ThemeProvider = ({ children }) => {
  const theme = getTheme("light");

  return (
    <MuiThemeProvider theme={theme}>
      <GlobalStyles
        styles={css`
          html,
          body,
          #root {
            scroll-behavior: smooth;
          }

          body {
            font-family: "Inter", Arial, sans-serif;
          }
        `}
      />
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
