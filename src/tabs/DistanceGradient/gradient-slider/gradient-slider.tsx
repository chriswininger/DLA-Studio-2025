import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { updateColorStop } from '../distance-gradient-slice';
import './gradient-slider.css';

function GradientSlider() {
  const dispatch = useDispatch();
  const { colorStops } = useSelector((state: RootState) => state.distanceGradient);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedStop, setDraggedStop] = useState<string | null>(null);

  // Sort color stops by position
  const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);

  // Generate gradient CSS
  const gradientStops = sortedStops
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ');
  
  const gradientStyle = {
    background: `linear-gradient(to right, ${gradientStops})`
  };


  // Add global mouse event listeners
  React.useEffect(() => {
    if (draggedStop) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedStop]);

  return (
    <div className="gradient-slider-container">
      <div 
        ref={containerRef}
        className="gradient-bar"
        style={gradientStyle}
        onMouseMove={handleMouseMove}
      >
        {sortedStops.map((stop) => (
          <div
            key={stop.id}
            className={`gradient-handle ${draggedStop === stop.id ? 'dragging' : ''}`}
            style={{
              left: `${stop.position}%`,
              backgroundColor: stop.color,
              borderColor: stop.color
            }}
            onMouseDown={(e) => handleMouseDown(e, stop.id)}
          />
        ))}
      </div>
      
      <div className="gradient-axis">
        {sortedStops.map((stop) => (
          <div
            key={stop.id}
            className={`value-label ${draggedStop === stop.id ? 'active' : ''}`}
            style={{ left: `${stop.position}%` }}
          >
            <span className="value-text">{stop.position}</span>
          </div>
        ))}
      </div>
    </div>
  );

  function handleMouseDown(e: React.MouseEvent, stopId: string) {
    e.preventDefault();
    setDraggedStop(stopId);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!draggedStop || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    dispatch(updateColorStop({ id: draggedStop, field: 'position', value: Math.round(percentage) }));
  }

  function handleMouseUp() {
    setDraggedStop(null);
  }
}

export default GradientSlider; 