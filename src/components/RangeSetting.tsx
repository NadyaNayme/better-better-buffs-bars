import React from "react";

interface RangeSettingProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

const RangeSetting: React.FC<RangeSettingProps> = ({ label, value, min = 0, max = 100, onChange }) => {
  return (
    <label style={{ display: "flex", flexDirection: "column" }}>
      {label}: {value}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
};

export default React.memo(RangeSetting);