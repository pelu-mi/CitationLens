import { Route, Routes } from "react-router";
import { HomePage } from "./HomePage/HomePage";
import { InfluentialPage } from "./InfluentialPage/InfluentialPage";
import { PageLayout } from "../components/PageLayout/PageLayout";

export const Root = () => {
  return (
    <PageLayout>
      <Routes>
        <Route path="/*" element={<HomePage />} />
        <Route path="/influential/:subfieldId" element={<InfluentialPage />} />
      </Routes>
    </PageLayout>
  );
};
