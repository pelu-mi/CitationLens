import { Route, Routes } from "react-router";
import { HomePage } from "./HomePage/HomePage";
import { InfluentialPage } from "./InfluentialPage/InfluentialPage";
import { PageLayout } from "../components/PageLayout/PageLayout";

export const Root = () => {
  return (
    <Routes>
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
