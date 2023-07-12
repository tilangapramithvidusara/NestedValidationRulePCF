import React, { useEffect, useState } from "react";
import DropDown from "../Components/commonComponents/DropDown";
import { Button, Checkbox, Switch } from "antd";
import RowContainer from "./rowContainer";
import CheckBox from "../Components/commonComponents/CheckBox";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import NumberInputField from "../Components/commonComponents/NumberInputField";
import sampleInputQuestion from "../SampleData/sampleInputQuestion";
interface NestedRowProps {
  children: React.ReactNode;
}

interface Row {
  level: number;
  column1: string;
  column2: string;
  column3: string;
  column4: string;
  column5: string;
  column6: string;
  innerConditions: any;
}

interface SectionProps {
  sectionLevel: number;
  conditionData: any;
  setConditionData: any;
}

function SectionContainer({
  sectionLevel,
  conditionData,
  setConditionData,
}: SectionProps) {
  const [nestedRows, setNestedRows] = useState<React.ReactNode[]>([]);
  const [rowData, setRowData] = useState<any>();

  const [toggleEnableMin, setToggledEnableMin] = useState<any | null>(false);
  const [toggleEnableMax, setToggledEnableMax] = useState<any | null>(false);
  const [minCheckboxEnabled, setMinCheckboxEnabled] = useState<any | null>(
    false
  );
  const [maxCheckboxEnabled, setMaxCheckboxEnabled] = useState<any | null>(
    false
  );

  const [rows, setRows] = useState<Row[]>([
    {
      level: 1,
      column1: "",
      column2: "",
      column3: "",
      column4: "",
      column5: "",
      column6: "",
      innerConditions: "",
    },
  ]);

  // const NestedRow: React.FC<NestedRowProps> = ({ children }) => {
  //   return (
  //     <div style={{ display: 'flex', flexDirection: 'row' }}>
  //       {children}
  //     </div>
  //   );
  // };

  useEffect(() => {
    console.log("nestedRows", nestedRows);
  }, [nestedRows]);

  useEffect(() => {
    console.log("sectionLevel", sectionLevel);
    console.log("conditionData", conditionData);
  }, [sectionLevel, conditionData]);

  const handleAddRow = (index: number) => {};

  const addRow = () => {
    setRows(
      (prevRows) =>
        [
          ...prevRows,
          {
            level: "",
            column1: "",
            column2: "",
            column3: "",
            column4: "",
            column5: "",
            column6: "",
            innerConditions: "",
          },
        ] as Row[]
    );
  };

  const addNestedRow = () => {
    setRows(
      (prevRows) =>
        [
          ...prevRows,
          {
            level: 1,
            column1: "",
            column2: "",
            column3: "",
            column4: "",
            column5: "",
            column6: "",
            innerConditions: "",
          },
        ] as Row[]
    );
  };

  return (
    <div>
      {rows.map((row, index) => (
        <RowContainer
          rowIndex={index}
          rowData={rowData}
          setRowData={setRowData}
          addRow={addRow}
          addNestedRow={addNestedRow}
          sectionLevel={sectionLevel}
        />
      ))}

      <div className="action-container">
        <div>
          <div className="subTitle mb-15">Actions</div>
          <div>
            <CheckBox
              checkboxDefaultSelectedValues={["", "outPutDoc"]}
              checkboxValuesFromConfig={[
                {
                  displayName: "Show",
                  value: "show",
                },
                {
                  displayName: "Enable",
                  value: "enable",
                },
                {
                  displayName: "Show in Document",
                  value: "showInDocument",
                },
              ]}
            />
          </div>
        </div>

        <div className="subTitle mt-20 mb-30">
          <div className="subTitle mb-15">Min/Max Field</div>

          <div className="mb-15 flex-wrap">
            <div style={{ marginRight: "10px" }}>
              {" "}
              <Checkbox
                onChange={(e) => setMinCheckboxEnabled(e.target.checked)}
              />{" "}
            </div>
            <div style={{ marginRight: "10px" }}>
              <Switch
                className="custom-toggle"
                checkedChildren="Value"
                unCheckedChildren="Question"
                onChange={() => setToggledEnableMin(!toggleEnableMin)}
                disabled={!minCheckboxEnabled}
              />
            </div>

            <div className="minmaxText">Min Value:</div>
            {toggleEnableMin ? (
              <NumberInputField
                selectedValue={{}}
                handleNumberChange={{}}
                defaultDisabled={!minCheckboxEnabled}
              />
            ) : (
              <DropDown dropDownData={sampleInputQuestion} />
            )}
          </div>

          <div className="mb-15 flex-wrap">
            <div style={{ marginRight: "10px" }}>
              {" "}
              <Checkbox
                onChange={(e) => setMaxCheckboxEnabled(e.target.checked)}
              />{" "}
            </div>
            <div style={{ marginRight: "10px" }}>
              <Switch
                className="custom-toggle"
                checkedChildren="Value"
                unCheckedChildren="Question"
                onChange={() => setToggledEnableMax(!toggleEnableMax)}
                disabled={!maxCheckboxEnabled}
              />
            </div>

            <div className="minmaxText">Max Value:</div>
            {toggleEnableMax ? (
              <NumberInputField
                selectedValue={{}}
                handleNumberChange={{}}
                defaultDisabled={!maxCheckboxEnabled}
              />
            ) : (
              <DropDown dropDownData={sampleInputQuestion} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
JSON.stringify;
export default SectionContainer;
