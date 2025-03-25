import { BrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { ThemeProvider } from "./context/ThemeProvider/ThemeProvider";

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
