import React from "react";
import type { DLA3DState } from "../dla-3d";
import { extractPaths, generateBlenderScript } from "./blender-export-utils";
import "./blender-export.css";

interface BlenderExportProps {
  dlaStateRef: React.RefObject<DLA3DState | null>;
}

function BlenderExport({ dlaStateRef }: BlenderExportProps) {
  const hasCluster = dlaStateRef.current
    ? Object.keys(dlaStateRef.current.cluster).length > 1
    : false;

  return (
    <button
      className="dlasim-blender-export-button"
      onClick={handleExport}
      disabled={!hasCluster}
      title="Download a Blender Python script that recreates the cluster as NURBS paths"
    >
      Export to Blender
    </button>
  );

  function handleExport() {
    console.info("handle export invoked");
    if (!dlaStateRef.current) return;
    console.info("exporting to blender started");

    const paths = extractPaths(dlaStateRef.current.cluster);
    console.info("extracted paths: ", paths.length);
    if (paths.length === 0) return;

    console.info("generate script");
    const script = generateBlenderScript(paths);
    console.info("build blob");
    const blob = new Blob([script], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);

    console.info("creating link to download element");
    const a = document.createElement("a");
    a.href = url;
    a.download = "dla_paths.py";
    console.info("simulating click to trigger download");
    a.click();
    URL.revokeObjectURL(url);
  }
}

export default BlenderExport;
