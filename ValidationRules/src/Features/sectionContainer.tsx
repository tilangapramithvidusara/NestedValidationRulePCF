import React, { useEffect, useState } from "react";
import DropDown from "../Components/commonComponents/DropDown";
import { Button, Checkbox, Switch } from "antd";
import RowContainer from "./rowContainer";
import CheckBox from "../Components/commonComponents/CheckBox";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import NumberInputField from "../Components/commonComponents/NumberInputField";
import sampleInputQuestion from "../SampleData/sampleInputQuestion";
import { updateAllLevelActionsArray } from "../Utils/utilsHelper";
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
  _setNestedRows: any;
  _nestedRows: any;
}

function SectionContainer({
  sectionLevel,
  conditionData,
  setConditionData,
  _setNestedRows,
  _nestedRows
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
  const [actions, setActions] = useState<any>([]);
  const [minValue, setMinValue] = useState<any>();
  const [maxValue, setMaxValue] = useState<any>();
  const [minMaxValue, setMinMaxValue] = useState<any>();

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
    console.log("nestedRows from sectionnnnn", _nestedRows[sectionLevel]);
    let releatedFields = _nestedRows.find((x: { [x: string]: any; }) => x[sectionLevel]);
      if (releatedFields) {
        releatedFields = releatedFields[sectionLevel].actions
        console.log("Section actions from section field ", releatedFields)
      }
  }, [_nestedRows]);

  useEffect(() => {
    console.log("sectionLevel", sectionLevel);
    console.log("conditionData", conditionData);
  }, [sectionLevel, conditionData]);

  useEffect(() => {
    console.log("ACTSSSSS", actions);
    let releatedFields = _nestedRows.find((x: { [x: string]: any; }) => x[sectionLevel]);
    if (releatedFields) {
      releatedFields = releatedFields[sectionLevel].actions
      console.log("ACTSSSSS releatedFields", releatedFields);
      let resultArray = [
        {
          checkBoxValues: actions,
          minMax: releatedFields.map((x: { minMax: any; }) => x?.minMax)[0] || {}
        }
      ];
      if (actions && actions.length) _setNestedRows(
        updateAllLevelActionsArray(_nestedRows, sectionLevel, resultArray)
      );
    }
   
  }, [actions]);

  useEffect(() => {
    setMinMaxValue({ minValue: minValue?.input, maxValue: maxValue?.input });
    let releatedFields = _nestedRows.find((x: { [x: string]: any; }) => x[sectionLevel]);
    if (releatedFields) {
      const previousActions = releatedFields[sectionLevel]?.actions?.map((obj: { checkBoxValues: any; }) => obj.checkBoxValues)

      let resultArray = [
        {
          checkBoxValues: previousActions[0] || [],
          minMax: { minValue: minValue?.input, maxValue: maxValue?.input }
        }
      ];

      // const hasMinMax = releatedFields.find((item: any) => "minMax" in item);
      // if (!hasMinMax) {
      //   releatedFields.push({
      //     "minMax": {
      //       "min": minMaxValue.minValue,
      //       "max": minMaxValue.maxValue
      //     }
      //   });
      // } else {
      //   releatedFields.map((x: any) => {
      //     if (x?.minMax) {
      //       x.minMax.min = minMaxValue?.minValue || x.minMax.min;
      //       x.minMax.max = minMaxValue.maxValue || x.minMax.max
      //     }
      //   });
      // }
      
      _setNestedRows(
        updateAllLevelActionsArray(_nestedRows, sectionLevel, resultArray)
      );
    }
    
  }, [minValue, maxValue]);
  
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
          setConditionData={setConditionData}
          _setNestedRows={_setNestedRows}
          _nestedRows={_nestedRows}
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
                  label: "Show",
                  value: "show",
                },
                {
                  label: "Enable",
                  value: "enable",
                },
                {
                  label: "Show in Document",
                  value: "showInDocument",
                },
              ]}
              setCheckboxValues={setActions}
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
                setInputNumber={setMinValue}
                changedId={undefined}
                fieldName={"minValue"}
              />
            ) : (
                <DropDown
                  dropDownData={sampleInputQuestion}
                  isDisabled={true}
                  setExpression={setMinValue}
                  changedId={undefined}
                  fieldName={"minValue"}
                />
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
                setInputNumber={setMaxValue}
                changedId={undefined}
                fieldName={"maxValue"} />
            ) : (
                <DropDown
                  dropDownData={sampleInputQuestion}
                  isDisabled={false}
                  setExpression={setMaxValue}
                  changedId={undefined}
                  fieldName={"maxValue"}
                />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
JSON.stringify;
export default SectionContainer;
