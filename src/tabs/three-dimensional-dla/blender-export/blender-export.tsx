import React from 'react';
import type { DLA3DState } from '../dla-3d';
import { extractPaths, generateBlenderScript } from './blender-export-utils';
import './blender-export.css';

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
    if (!dlaStateRef.current) return;

    const paths = extractPaths(dlaStateRef.current.cluster);
    if (paths.length === 0) return;

    const script = generateBlenderScript(paths);
    const blob = new Blob([script], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'dla_paths.py';
    a.click();
    URL.revokeObjectURL(url);
  }
}

export default BlenderExport;
