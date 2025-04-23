/**
 * @component App
 * @description Root application component that provides routing and theming context
 */

import { BrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { ThemeProvider } from "./context/ThemeProvider/ThemeProvider";

/**
 * Sets up the core application structure with routing and theme configuration
 */
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
