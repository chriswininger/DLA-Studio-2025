import React from 'react';

const SVGDLA: React.FC = () => {
  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 500;

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
        >
          {/* SVG content will go here */}
        </svg>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => console.log('Generate SVG clicked')}>
          Generate SVG
        </button>
      </div>
    </div>
  );
};

export default SVGDLA; 