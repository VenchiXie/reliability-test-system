import { createRoot } from "react-dom/client";
import App from "./App";
// import React, { Suspense } from "react";
// import { RouterProvider } from "react-router-dom";
// import router from "./router/index.js";
import responsiveLayout from "./config/responsiveLayout";
import "./styles/index.css";

responsiveLayout();
const root = createRoot(document.getElementById("root"));
root.render(
  //<RouterProvider router={router}></RouterProvider>
  <App />
);
