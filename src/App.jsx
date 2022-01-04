import * as React from "react";
import { Route, Routes } from "react-router-dom";
import Container from '@mui/material/Container';
import Initial from "./scenes/Initial.jsx";
import Editor from "./scenes/Editor.jsx";
import Process from "./scenes/Process.jsx";
import "@fontsource/roboto";

const App = ()=> {
  return (
  <div className="App" style={{
    display: "flex",
    flexFlow: "row",
    minHeight: "100%",
    justifyContent: "stretch",
    backgroundColor: "#EAEEF3"
  }}>
    <Container 
      maxWidth="xl"
      disableGutters={true}
      sx={{
        padding: "1.5rem 2rem"
      }}>
      <Routes>
        <Route path="/" element={<Initial />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/process" element={<Process />} />
      </Routes>
    </Container>
  </div>
  );
}

export default App;