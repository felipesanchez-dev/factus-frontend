"use client";

import { useEffect } from "react";

const LEAFLET_CSS_ID = "leaflet-css";
const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

export function useLeafletCSS() {
  useEffect(() => {
    if (document.getElementById(LEAFLET_CSS_ID)) return;
    const link = document.createElement("link");
    link.id = LEAFLET_CSS_ID;
    link.rel = "stylesheet";
    link.href = LEAFLET_CSS_URL;
    link.crossOrigin = "";
    document.head.appendChild(link);
  }, []);
}
