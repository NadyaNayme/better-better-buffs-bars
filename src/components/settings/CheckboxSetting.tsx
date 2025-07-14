import React from "react";

interface CheckboxSettingProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const CheckboxSetting: React.FC<CheckboxSettingProps> = ({ label, checked, onChange }) => {
  return (
    <label style={{ display: "flex", alignItems: "center" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginRight: "8px" }}
      />
      {label}
    </label>
  );
};

export default React.memo(CheckboxSetting);