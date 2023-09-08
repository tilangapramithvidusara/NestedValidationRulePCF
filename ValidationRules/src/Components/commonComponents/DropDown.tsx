import React, { useEffect, useState } from "react";
import { Select } from "antd";

interface DropDownCommonProps {
  dropDownData: any[];
  isDisabled: boolean;
  setExpression: any;
  changedId: any;
  fieldName: any;
  selectedValue: any;
}

const DropDown: React.FC<DropDownCommonProps> = ({ dropDownData, isDisabled, setExpression, changedId, fieldName, selectedValue }) => {
  return (
    <div>
      <Select
        showSearch
        // style={{ width: '150px' }}
        style={fieldName === 'expression' ? { width: '100px' } : fieldName === 'condition' ? { width: '150px' } : { width: '150px' }}
        placeholder={fieldName === 'expression' ? "": "Value"}
        optionFilterProp="children"
        filterOption={(input, option) => (option?.label ?? "").includes(input)}
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? "")
            .toLowerCase()
            .localeCompare((optionB?.label ?? "").toLowerCase())
        }
        options={dropDownData}
        disabled={isDisabled ? isDisabled : false}
        onChange={(input, option) => setExpression({ input: option.value, changedId, fieldName })}
        value={selectedValue}
        
      />
    </div>
  );
};

export default DropDown;
