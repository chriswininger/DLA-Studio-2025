import React, { useState } from 'react';
import { useAppSelector } from '../../store';
import type { RootState } from '../../store';

const SVGDLA: React.FC = () => {
  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 500;
  const [svgContent, setSvgContent] = useState<string>('');

  // Get cluster data from Redux
  const dlaCluster = useAppSelector((state: RootState) => 
    (state.simple2dAnimatedDla as any).dlaCluster
  );

  const generateSVG = () => {
    if (!dlaCluster || dlaCluster.length === 0) {
      console.log('No cluster data available');
      return;
    }

    // Parse cluster points from string format
    const points: { x: number; y: number }[] = dlaCluster.map((pointStr: string) => {
      const [x, y] = pointStr.split(',').map(Number);
      return { x, y };
    });

    console.log('Parsed points:', points.length);

    // Create SVG line segments with unit length of 2 pixels
    const segmentLength = 2;
    const svgLines: string[] = [];

    points.forEach((point) => {
      // Create a small line segment centered on each point
      const halfLength = segmentLength / 2;
      
      // Horizontal line segment
      const x1 = point.x - halfLength;
      const y1 = point.y;
      const x2 = point.x + halfLength;
      const y2 = point.y;
      
      svgLines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#00d8ff" stroke-width="1" />`);
    });

    const svgContentString = svgLines.join('\n');
    setSvgContent(svgContentString);
    
    console.log('Generated SVG with', svgLines.length, 'line segments');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h2>SVG DLA</h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <svg
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ 
            border: '1px solid #ccc', 
            background: '#111',
            display: 'block'
          }}
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        >
          {/* SVG content will be generated here */}
        </svg>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={generateSVG}>
          Generate SVG
        </button>
      </div>
    </div>
  );
};

export default SVGDLA; 