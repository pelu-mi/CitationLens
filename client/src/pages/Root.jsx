/**
 * @component Root
 * @description Main routing component that defines application routes and layouts
 */

import { Route, Routes } from "react-router";
import { HomePage } from "./HomePage/HomePage";
import { InfluentialPage } from "./InfluentialPage/InfluentialPage";
import { PageLayout } from "../components/PageLayout/PageLayout";

/**
 * Root
 */
export const Root = () => {
  return (
    <Routes>
      {/* Home route with optional domain parameter */}
      <Route
        path="/"
        element={
          <PageLayout disableFullHeight>
            <HomePage />
          </PageLayout>
        }
      >
        <Route path="*" />
        <Route path=":domainId" />
      </Route>

      {/* Influential page routes with subfield and tab parameters */}
      <Route
        path="/influential"
        element={
          <PageLayout disableFullHeight>
            <InfluentialPage />
          </PageLayout>
        }
      >
        <Route path=":subfieldId/" />
        <Route path=":subfieldId/:tabName" />
      </Route>
    </Routes>
  );
};
