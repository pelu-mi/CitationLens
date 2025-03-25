import { Route, Routes } from "react-router";
import { HomePage } from "./HomePage/HomePage";

export const Root = () => {
  return (
    <Routes>
      <Route path="/*" element={<HomePage />} />
    </Routes>
  );
};
