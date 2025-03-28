import {
  Box,
  Divider,
  Grid2,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useState } from "react";

export const AuthorsTab = () => {
  const [selectedIndex, setSelectedIndex] = useState(1);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  return (
    <Grid2
      container
      wrap="no-wrap"
      sx={{
        height: "calc(100vh - 280px)",
      }}
    >
      <Grid2
        size={3}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            margin: 2,
          }}
        >
          Topics (34)
        </Typography>

        <Divider />

        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
          }}
        >
          <List
            sx={{
              width: "100%",
              p: 0,
            }}
          >
            {[
              { label: "Trash", index: 1 },
              { label: "Spam", index: 2 },
              { label: "Trash", index: 3 },
              { label: "Spam", index: 4 },
              { label: "Trash", index: 5 },
              { label: "Spam", index: 6 },
              { label: "Trash", index: 7 },
              { label: "Spam", index: 8 },
              { label: "Trash", index: 9 },
              { label: "Spam", index: 10 },
              { label: "Trash", index: 11 },
              { label: "Spam", index: 12 },
              { label: "Trash", index: 3 },
              { label: "Spam", index: 14 },
              { label: "Trash", index: 15 },
              { label: "Spam", index: 16 },
            ].map((item, idx) => (
              <ListItemButton
                key={idx}
                selected={selectedIndex === item.index}
                onClick={(event) => handleListItemClick(event, item.index)}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Grid2>

      <Divider orientation="vertical" />

      <Grid2 size={9} padding={2}>
        Scatterplot here
      </Grid2>
    </Grid2>
  );
};
