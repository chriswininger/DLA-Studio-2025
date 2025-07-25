import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import type { RootState } from '../../store';
import type { SVGDLAUIState } from './svg-dla-slice';
import { setSvgContent } from './svg-dla-slice';
import type { ClusterMap } from '../../dla/dla';
import LineLengthControls from './line-length-controls/line-length-controls';
import SquareSizeControls from './square-size-controls/square-size-controls';
import './SVGDLA.css';
import { setSelectedTool } from './svg-dla-slice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faSquare } from '@fortawesome/free-solid-svg-icons';
import { getColorForDistance } from '../DistanceGradient/distance-gradient-slice';

export const SVGDLA: React.FC = () => {
  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 500;
  const dispatch = useAppDispatch();

  // Get cluster data from Redux
  const dlaCluster = useAppSelector((state: RootState) => 
    (state.simple2dAnimatedDla as any).dlaCluster as ClusterMap
  );
  
  // Get line length, SVG content, selected tool, and square size from Redux
  const { lineLength, svgContent, selectedTool, squareSize, showCircles, circleRadius } = useAppSelector((state: RootState) => 
    state.svgDla as SVGDLAUIState
  );
  // Get colorStops from Redux
  const colorStops = useAppSelector((state: RootState) => (state.distanceGradient as any).colorStops);

  // Automatically generate SVG when any relevant state changes
  useEffect(() => {
    generateSVG();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dlaCluster, selectedTool, lineLength, squareSize, showCircles, circleRadius, colorStops]);

  return (
    <div className="dlasim-svgdla-tab">
      <div className="dlasim-flex-row">
        <ToolBar />

        <div className="svgdla-main-content">
          {/* SVG container */}
          <div className="svgdla-svg-container">
            <svg
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="svgdla-svg"
              viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            >
              {/* SVG content will be generated here */}
            </svg>

            {/* Remove Generate SVG button, keep Download SVG */}
            <div className="svgdla-button-container">
              <button onClick={downloadSVG}>Download SVG</button>
            </div>
          </div>
          
          <ToolOptions />
        </div>
      </div>
    </div>
  );

  function generateSVG() {
    if (!dlaCluster || Object.keys(dlaCluster).length === 0) {
      console.log('No cluster data available');
      return;
    }

    switch (selectedTool) {
      case 'draw-with-lines':
        generateWithLines();
        break;
      case 'draw-with-squares':
        generateSVGWithSquares();
        break;
      default:
        console.log('no generation strategy selected');
    }
  }

  function generateWithLines() {
    console.log('Cluster data:', dlaCluster);
    const svgLines: string[] = [];
    const svgCircles: string[] = [];

    // Calculate the center of all points
    const entries = Object.values(dlaCluster);
    const points = entries.map(entry => entry.point);
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    // Compute min/max distance for color gradient
    const distances = entries.map(entry => entry.distance ?? 0);
    const minDistance = Math.min(...distances);
    const maxDistance = Math.max(...distances);

    // Iterate through all cluster entries
    entries.forEach((entry) => {
      const { point, parent } = entry;
      // Skip the root entry (it has no parent to connect to)
      if (parent === 'ROOT') {
        return;
      }
      // Get the parent point
      const parentPoint = parent.point;
      // Scale from center: translate to origin, scale, then translate back
      const scaledParentX = (parentPoint.x - centerX) * lineLength + centerX;
      const scaledParentY = (parentPoint.y - centerY) * lineLength + centerY;
      const scaledPointX = (point.x - centerX) * lineLength + centerX;
      const scaledPointY = (point.y - centerY) * lineLength + centerY;
      // Draw a simple line from parent to child point with scaling
      svgLines.push(`<line x1="${scaledParentX}" y1="${scaledParentY}" x2="${scaledPointX}" y2="${scaledPointY}" stroke="#00d8ff" stroke-width="1" />`);
      // Draw a circle at the parent point, colored by distance, using the Redux radius
      if (showCircles) {
        const color = getColorForDistance(colorStops, parent.distance ?? 0, minDistance, maxDistance);
        svgCircles.push(`<circle cx="${scaledParentX}" cy="${scaledParentY}" r="${circleRadius}" fill="none" stroke="${color}" stroke-width="1" />`);
      }
    });

    const svgContentString = svgLines.concat(svgCircles).join('\n');
    dispatch(setSvgContent(svgContentString));
    console.log('Generated SVG with', svgLines.length, 'line segments and', svgCircles.length, 'circles');
  }

  function generateSVGWithSquares() {
    console.info("generating svg using squares");
    const svgSquares: string[] = [];

    // Calculate the center of all points
    const entries = Object.values(dlaCluster);
    const points = entries.map(entry => entry.point);
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    // 1. Find the minimum distance between any two points
    let minDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < minDist) minDist = dist;
      }
    }
    // 2. Compute scaling factor
    const scalingFactor = squareSize / minDist;

    // Compute min/max distance for color gradient
    const distances = entries.map(entry => entry.distance ?? 0);
    const minDistance = Math.min(...distances);
    const maxDistance = Math.max(...distances);

    // 3. Draw a square at each scaled point, colored by distance
    entries.forEach((entry) => {
      const { point, distance } = entry;
      const scaledX = (point.x - centerX) * scalingFactor + centerX;
      const scaledY = (point.y - centerY) * scalingFactor + centerY;
      const x = scaledX - squareSize / 2;
      const y = scaledY - squareSize / 2;
      const color = getColorForDistance(colorStops, distance ?? 0, minDistance, maxDistance);
      svgSquares.push(`<rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="${color}" />`);
    });

    const svgContentString = svgSquares.join('\n');
    dispatch(setSvgContent(svgContentString));
    console.log('Generated SVG with', svgSquares.length, 'squares');
  }

  function downloadSVG() {
    // Wrap the svgContent in a full SVG element
    const svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}">`;
    const svgFooter = '</svg>';
    const fullSVG = `${svgHeader}\n${svgContent}\n${svgFooter}`;

    const blob = new Blob([fullSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dla-output.svg';
    document.body.appendChild(a); // Required for Firefox
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

const ToolBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedTool = useAppSelector((state: RootState) => (state.svgDla as SVGDLAUIState).selectedTool);

  return (
    <div className="dlasim_tool-container">
      <button
        className={`dlasim_tool-btn${selectedTool === 'draw-with-lines' ? ' selected' : ' unselected'}`}
        onClick={() => dispatch(setSelectedTool('draw-with-lines'))}
        aria-label="Draw with Lines Tool"
        type="button"
      >
        <FontAwesomeIcon
          icon={faArrowUp}
          className="dlasim_tool-icon"
          color={selectedTool === 'draw-with-lines' ? '#FB8158' : '#EB2EA4'}
        />
      </button>
      <button
        className={`dlasim_tool-btn${selectedTool === 'draw-with-squares' ? ' selected' : ' unselected'}`}
        onClick={() => dispatch(setSelectedTool('draw-with-squares'))}
        aria-label="Draw with Squares Tool"
        type="button"
      >
        <FontAwesomeIcon
          icon={faSquare}
          className="dlasim_tool-icon"
          color={selectedTool === 'draw-with-squares' ? '#FB8158' : '#EB2EA4'}
        />
      </button>
    </div>
  );
};

const ToolOptions: React.FC = () => {
  const selectedTool = useAppSelector((state: RootState) => state.svgDla.selectedTool);

  switch(selectedTool) {
    case 'draw-with-lines':
      return <LineLengthControls />
    case 'draw-with-squares':
      return <SquareSizeControls />
    default:
      return null;
  }
}