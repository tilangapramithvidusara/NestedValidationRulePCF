import React, { useEffect, useState } from 'react';
import { InputNumber } from 'antd';

interface NumberInputField {
    selectedValue: any;
  handleNumberChange: any;
  defaultDisabled: any
}

const FieldInput: React.FC<NumberInputField> = ({
    selectedValue,
  handleNumberChange,
  defaultDisabled
}) => {

  const numberFormatter = (value: number | undefined) => {
    if (value) {
      return String(value).replace(/[^0-9]/g, ''); // Remove non-numeric characters
    }
    return '';
  };

  const numberParser = (displayValue: string | undefined): number => {
    if (displayValue) {
      const parsedValue = parseInt(displayValue, 10);
      if (!isNaN(parsedValue)) {
        return parsedValue;
      }
    }
    return NaN; // Return a default value if the parsing fails
  };

  return (
    <div>
      <InputNumber
        formatter={numberFormatter}
        parser={numberParser}
        onChange={handleNumberChange}
        disabled={defaultDisabled}
      />
    </div>
  );
};

export default FieldInput;
