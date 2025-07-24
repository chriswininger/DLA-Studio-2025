import React, { useState, useEffect } from 'react';
import './color-chooser.css';

interface ColorChooserProps {
  color: string; // hex string, e.g. #2ce2e6
  onChange: (color: string) => void;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return [
    (num >> 16) & 0xff,
    (num >> 8) & 0xff,
    num & 0xff
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

const ColorChooser: React.FC<ColorChooserProps> = ({ color, onChange }) => {
  const [rgb, setRgb] = useState<[number, number, number]>(hexToRgb(color));
  const [hex, setHex] = useState(color.startsWith('#') ? color : '#' + color);

  // Sync local state if parent color changes
  useEffect(() => {
    setRgb(hexToRgb(color));
    setHex(color.startsWith('#') ? color : '#' + color);
  }, [color]);

  // When RGB changes, update hex and notify parent
  useEffect(() => {
    const newHex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    setHex(newHex);
    onChange(newHex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rgb]);

  // When hex changes, update RGB if valid
  useEffect(() => {
    if (/^#([0-9a-fA-F]{6})$/.test(hex)) {
      setRgb(hexToRgb(hex));
      onChange(hex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hex]);

  const handleRgbChange = (idx: number, value: number) => {
    const clamped = clamp(value, 0, 255);
    setRgb(prev => prev.map((v, i) => (i === idx ? clamped : v)) as [number, number, number]);
  };

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    setHex(val);
  };

  return (
    <div className="dlasim-color-chooser">
      <div className="dlasim-color-chooser-preview" style={{ background: hex }} />
      <div className="dlasim-color-chooser-fields">
        <div className="dlasim-color-chooser-row">
          <label>R</label>
          <input type="range" min={0} max={255} value={rgb[0]} onChange={e => handleRgbChange(0, Number(e.target.value))} />
          <input type="number" min={0} max={255} value={rgb[0]} onChange={e => handleRgbChange(0, Number(e.target.value))} />
        </div>
        <div className="dlasim-color-chooser-row">
          <label>G</label>
          <input type="range" min={0} max={255} value={rgb[1]} onChange={e => handleRgbChange(1, Number(e.target.value))} />
          <input type="number" min={0} max={255} value={rgb[1]} onChange={e => handleRgbChange(1, Number(e.target.value))} />
        </div>
        <div className="dlasim-color-chooser-row">
          <label>B</label>
          <input type="range" min={0} max={255} value={rgb[2]} onChange={e => handleRgbChange(2, Number(e.target.value))} />
          <input type="number" min={0} max={255} value={rgb[2]} onChange={e => handleRgbChange(2, Number(e.target.value))} />
        </div>
        <div className="dlasim-color-chooser-row">
          <label>Hex</label>
          <input type="text" value={hex} onChange={handleHexInput} maxLength={7} />
        </div>
      </div>
    </div>
  );
};

export default ColorChooser; 