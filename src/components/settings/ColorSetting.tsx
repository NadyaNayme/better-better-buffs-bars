import React, { useCallback } from "react";
import { rgbToHex } from "../../lib/colorUtils";
import type { Color } from "../../types/Color";

interface ColorSettingProps {
  label: string;
  value: Color;
  onChange: (color: Color) => void;
}

const ColorSetting: React.FC<ColorSettingProps> = ({ label, value, onChange }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    onChange({ r, g, b });
  }, [onChange]);

  return (
    <label style={{ display: "flex", alignItems: "center" }}>
      {label}
      <input
        type="color"
        value={rgbToHex(value)}
        onChange={handleChange}
        style={{ marginLeft: "8px" }}
      />
    </label>
  );
};

export default React.memo(ColorSetting);