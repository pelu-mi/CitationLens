import { Route, Routes } from "react-router";
import { HomePage } from "./HomePage/HomePage";

export const Root = () => {
  return (
    <Routes>
      <Route path="/*" element={<HomePage />} />
      <Route
        path="/influential/:subfieldId"
        element={<div>Influential page</div>}
      />
    </Routes>
  );
};
