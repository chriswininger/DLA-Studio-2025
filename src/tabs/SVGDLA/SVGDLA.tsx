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

    console.log('Cluster data:', dlaCluster);
    const svgLines: string[] = [];

    // Iterate through all cluster entries
    Object.values(dlaCluster).forEach((entry) => {
      const { point, parent } = entry;
      
      // Skip the root entry (it has no parent to connect to)
      if (parent === 'ROOT') {
        return;
      }
      
      // Get the parent point
      const parentPoint = parent.point;
      
      // Draw a simple line from parent to child point
      svgLines.push(`<line x1="${parentPoint.x}" y1="${parentPoint.y}" x2="${point.x}" y2="${point.y}" stroke="#00d8ff" stroke-width="1" />`);
    });

    const svgContentString = svgLines.join('\n');
    setSvgContent(svgContentString);
    
    console.log('Generated SVG with', svgLines.length, 'line segments');
  }
};

export default SVGDLA; 