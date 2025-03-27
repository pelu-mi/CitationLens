import { Route, Routes } from "react-router";
import { HomePage } from "./HomePage/HomePage";
import { InfluentialPage } from "./InfluentialPage/InfluentialPage";
import { PageLayout } from "../components/PageLayout/PageLayout";

export const Root = () => {
  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<HomePage />}>
          <Route path="*" />
          <Route path=":domainId" />
        </Route>
        <Route path="/influential" element={<InfluentialPage />}>
          <Route path=":subfieldId/" />
          <Route path=":subfieldId/:tabName" />
        </Route>
      </Routes>
    </PageLayout>
  );
};
