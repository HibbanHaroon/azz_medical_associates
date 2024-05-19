// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          "&.MuiContainer-maxWidthMd": {
            maxWidth: "700px",
          },
        },
      },
    },
  },
  palette: {
    primary: {
      main: "#0D3276",
    },
    success: {
      main: "#008000",
    },
  },
});

export default theme;
