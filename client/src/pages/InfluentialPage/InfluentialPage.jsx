import { Divider, Typography } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import FaceIcon from "@mui/icons-material/Face";
import ArticleIcon from "@mui/icons-material/Article";
import ApartmentIcon from "@mui/icons-material/Apartment";
import { InfluBreadcrumbs } from "./units/InfluBreadcrumbs/InfluBreadcrumbs";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { InstitutionsTab } from "./tabs/InstitutionsTab/InstitutionsTab";
import { WorksTab } from "./tabs/WorksTab/WorksTab";
import { AuthorsTab } from "./tabs/AuthorsTab/AuthorsTab";

const getTabValue = (name) => {
  switch (name) {
    case "authors":
      return 1;
    case "works":
      return 2;
    default:
      return 0;
  }
};

export const InfluentialPage = () => {
  const { subfieldId, tabName } = useParams();
  const {
    state: { subfieldName },
  } = useLocation();
  const [tabValue, setTabValue] = useState(getTabValue(tabName));
  const navigate = useNavigate();

  const handleClickTab = (tabName) => {
    navigate(`/influential/${subfieldId}/${tabName}`, {
      state: { subfieldName },
    });
    setTabValue(getTabValue(tabName));
  };

  const renderTabContent = (tabValue) => {
    switch (tabValue) {
      case 1:
        return <AuthorsTab />;
      case 2:
        return <WorksTab />;
      default:
        return <InstitutionsTab />;
    }
  };

  return (
    <>
      <InfluBreadcrumbs />
      <Typography
        variant="h4"
        sx={{
          wordWrap: "break-word",
          marginTop: 1,
          marginBottom: 4,
        }}
      >
        {subfieldName}
      </Typography>

      {/* Tabs */}
      <Tabs value={tabValue} aria-label="influential tabs" centered>
        <Tab
          icon={<ApartmentIcon />}
          iconPosition="start"
          label="Institutions"
          onClick={() => handleClickTab("institutions")}
        />
        <Tab
          icon={<FaceIcon />}
          iconPosition="start"
          label="Authors"
          onClick={() => handleClickTab("authors")}
        />
        <Tab
          icon={<ArticleIcon />}
          iconPosition="start"
          label="Works"
          onClick={() => handleClickTab("works")}
        />
      </Tabs>
      <Divider />

      {renderTabContent(tabValue)}
    </>
  );
};
