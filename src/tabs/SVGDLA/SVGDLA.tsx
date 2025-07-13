import React, { useState } from 'react';
import { useAppSelector } from '../../store';
import type { RootState } from '../../store';
import type { SVGDLAUIState } from './svg-dla-slice';
import type { ClusterMap } from '../../dla/dla';
import LineLengthControls from './line-length-controls/line-length-controls';
import './SVGDLA.css';

const SVGDLA: React.FC = () => {
  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 500;
  const [svgContent, setSvgContent] = useState<string>('');

  // Get cluster data from Redux
  const dlaCluster = useAppSelector((state: RootState) => 
    (state.simple2dAnimatedDla as any).dlaCluster as ClusterMap
  );
  
  // Get line length from Redux
  const lineLength = useAppSelector((state: RootState) => 
    (state.svgDla as SVGDLAUIState).lineLength
  );

  return (
    <div className="svgdla-container">
      <h2>SVG DLA</h2>
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
        {/* Line length controls */}
        <LineLengthControls />
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

    // Parse cluster points from ClusterMap format
    const points: { x: number; y: number }[] = Object.values(dlaCluster).map(entry => entry.point);

    console.log('Parsed points:', points.length);
    const svgLines: string[] = [];

    points.forEach((point) => {
      // Create a horizontal line segment centered on each point
      const halfLength = lineLength / 2;
      
      // Horizontal line segment - y coordinates should be the same
      const x1 = point.x - halfLength;
      const y1 = point.y;
      const x2 = point.x + halfLength;
      const y2 = point.y;
      
      svgLines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#00d8ff" stroke-width="1" />`);
    });

    const svgContentString = svgLines.join('\n');
    setSvgContent(svgContentString);
    
    console.log('Generated SVG with', svgLines.length, 'line segments');
  }
};

export default SVGDLA; 