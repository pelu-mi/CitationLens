/**
 * @component InfluentialPage
 * @description Page for displaying influential institutions, authors, and works in a subfield
 * with tab navigation
 */

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

/**
 * Convert tab name to numerical value for Tabs component
 */
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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const topicParam = searchParams.get("topic");

  /**
   * Handle tab click and update URL
   */
  const handleClickTab = (tabName, param) => {
    let destination = `/influential/${subfieldId}/${tabName}`;

    if (param) {
      destination += `?topic=${param}`;
    }

    navigate(destination, {
      state: { subfieldName },
    });
    setTabValue(getTabValue(tabName));
  };

  /**
   * Render appropriate tab content based on selected tab
   */
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
          marginBottom: 3,
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
          onClick={() => handleClickTab("institutions", topicParam || null)}
        />
        <Tab
          icon={<FaceIcon />}
          iconPosition="start"
          label="Authors"
          onClick={() => handleClickTab("authors", topicParam || null)}
        />
        <Tab
          icon={<ArticleIcon />}
          iconPosition="start"
          label="Works"
          onClick={() => handleClickTab("works", topicParam || null)}
        />
      </Tabs>
      <Divider />

      {renderTabContent(tabValue)}
    </>
  );
};
