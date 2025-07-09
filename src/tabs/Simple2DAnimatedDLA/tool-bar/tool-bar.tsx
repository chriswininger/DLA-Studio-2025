import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../store';
import { setSelectedTool } from '../simple-2d-animated-dla-slice';
import type { RootState } from '../../../store';
import type { Simple2DAnimatedDLAUIState, Simple2DAnimatedDLATool } from '../simple-2d-animated-dla-slice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaintBrush, faEraser, faShapes } from '@fortawesome/free-solid-svg-icons';
import './tool-bar.css';

const ToolBar: React.FC = () => {
  const dispatch = useDispatch();
  const selectedTool = useAppSelector((state: RootState) => 
    (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).selectedTool
  );

  return (
    <div className="dlasim_tool-container">
      <button
        className={`dlasim_tool-btn${selectedTool === 'brush' ? ' selected' : ' unselected'}`}
        onClick={() => handleSelectTool('brush')}
        aria-label="Paint Brush Tool"
        type="button"
      >
        <FontAwesomeIcon 
          icon={faPaintBrush} 
          className="dlasim_tool-icon" 
          color={selectedTool === 'brush' ? '#FB8158' : '#EB2EA4'} 
        />
      </button>
      <button
        className={`dlasim_tool-btn${selectedTool === 'eraser' ? ' selected' : ' unselected'}`}
        onClick={() => handleSelectTool('eraser')}
        aria-label="Eraser Tool"
        type="button"
      >
        <FontAwesomeIcon 
          icon={faEraser} 
          className="dlasim_tool-icon" 
          color={selectedTool === 'eraser' ? '#FB8158' : '#EB2EA4'} 
        />
      </button>
      <button
        className={`dlasim_tool-btn${selectedTool === 'spawn-shapes' ? ' selected' : ' unselected'}`}
        onClick={() => handleSelectTool('spawn-shapes')}
        aria-label="Spawn Shapes Tool"
        type="button"
      >
        <FontAwesomeIcon 
          icon={faShapes} 
          className="dlasim_tool-icon" 
          color={selectedTool === 'spawn-shapes' ? '#FB8158' : '#EB2EA4'} 
        />
      </button>
    </div>
  );

  function handleSelectTool(tool: Simple2DAnimatedDLATool) {
    dispatch(setSelectedTool(tool));
  }
};

export default ToolBar; 