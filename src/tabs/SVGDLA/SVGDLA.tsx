import React from 'react';
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

export const SVGDLA: React.FC = () => {
  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 500;
  const dispatch = useAppDispatch();

  // Get cluster data from Redux
  const dlaCluster = useAppSelector((state: RootState) => 
    (state.simple2dAnimatedDla as any).dlaCluster as ClusterMap
  );
  
  // Get line length, SVG content, selected tool, and square size from Redux
  const { lineLength, svgContent, selectedTool, squareSize } = useAppSelector((state: RootState) => 
    state.svgDla as SVGDLAUIState
  );

  // Scaling factor for the visualization
  const scaleFactor = lineLength;

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
          </div>
          
          <ToolOptions />
        </div>
      </div>
      <div className="svgdla-button-container">
        <button onClick={generateSVG}>
          Generate SVG
        </button>
      </div>
    </div>
  );

  function generateSVG() {
    if (!dlaCluster || Object.keys(dlaCluster).length === 0) {
      console.log('No cluster data available');
      return;
    }

    if (selectedTool === 'draw-with-squares') {
      generateSVGWithSquares();
      return;
    }

    console.log('Cluster data:', dlaCluster);
    const svgLines: string[] = [];

    // Calculate the center of all points
    const points = Object.values(dlaCluster).map(entry => entry.point);
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    // Iterate through all cluster entries
    Object.values(dlaCluster).forEach((entry) => {
      const { point, parent } = entry;
      
      // Skip the root entry (it has no parent to connect to)
      if (parent === 'ROOT') {
        return;
      }
      
      // Get the parent point
      const parentPoint = parent.point;
      
      // Scale from center: translate to origin, scale, then translate back
      const scaledParentX = (parentPoint.x - centerX) * scaleFactor + centerX;
      const scaledParentY = (parentPoint.y - centerY) * scaleFactor + centerY;
      const scaledPointX = (point.x - centerX) * scaleFactor + centerX;
      const scaledPointY = (point.y - centerY) * scaleFactor + centerY;
      
      // Draw a simple line from parent to child point with scaling
      svgLines.push(`<line x1="${scaledParentX}" y1="${scaledParentY}" x2="${scaledPointX}" y2="${scaledPointY}" stroke="#00d8ff" stroke-width="1" />`);
    });

    const svgContentString = svgLines.join('\n');
    dispatch(setSvgContent(svgContentString));
    
    console.log('Generated SVG with', svgLines.length, 'line segments');
  }

  function generateSVGWithSquares() {
    if (!dlaCluster || Object.keys(dlaCluster).length === 0) {
      console.log('No cluster data available');
      return;
    }

    const svgSquares: string[] = [];

    // Calculate the center of all points
    const points = Object.values(dlaCluster).map(entry => entry.point);
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    // Draw a square for each point
    Object.values(dlaCluster).forEach((entry) => {
      const { point } = entry;
      // Scale from center: translate to origin, scale, then translate back
      const scaledX = (point.x - centerX) * scaleFactor + centerX;
      const scaledY = (point.y - centerY) * scaleFactor + centerY;
      // Offset so the square is centered on the point
      const x = scaledX - squareSize / 2;
      const y = scaledY - squareSize / 2;
      svgSquares.push(`<rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="#00d8ff" />`);
    });

    const svgContentString = svgSquares.join('\n');
    dispatch(setSvgContent(svgContentString));
    console.log('Generated SVG with', svgSquares.length, 'squares');
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