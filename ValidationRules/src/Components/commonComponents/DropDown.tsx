import React, { useEffect, useState } from "react";
import { Select } from "antd";

interface DropDownCommonProps {
  dropDownData: any[];
  isDisabled: boolean
}

const DropDown: React.FC<DropDownCommonProps> = ({ dropDownData, isDisabled }) => {
  return (
    <div>
      <Select
        showSearch
        style={{ width: 200 }}
        placeholder="Search to Select"
        optionFilterProp="children"
        filterOption={(input, option) => (option?.label ?? "").includes(input)}
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? "")
            .toLowerCase()
            .localeCompare((optionB?.label ?? "").toLowerCase())
        }
        options={dropDownData}
        disabled={isDisabled ? isDisabled : false}
      />
    </div>
  );
};

export default DropDown;
