import React, { useEffect, useState } from "react";
import DropDown from "../Components/commonComponents/DropDown";
import { Button, Checkbox, Switch } from "antd";
import RowContainer from "./rowContainer";
import CheckBox from "../Components/commonComponents/CheckBox";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import NumberInputField from "../Components/commonComponents/NumberInputField";
import sampleInputQuestion from "../SampleData/sampleInputQuestion";
import { updateAllLevelActionsArray } from "../Utils/utilsHelper";
import { loadAllQuestionsInSurvey } from "../XRMRequests/xrmRequests";
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
  isNested: any;
  currentPossitionDetails: any;
  questionList: any;
  setValidation: any
}

function SectionContainer({
  sectionLevel,
  conditionData,
  setConditionData,
  _setNestedRows,
  _nestedRows,
  isNested,
  currentPossitionDetails,
  questionList,
  setValidation
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

  const [defaultActions, setDefaultActions] = useState<any[]>([]);

  // const [rows, setRows] = useState<Row[]>(_nestedRows?.find((x: { [x: string]: any; }) => x[sectionLevel])[sectionLevel]?.fields);
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

  // useEffect(() => {
    // setDefaultActions([
    //   {
    //     label: "Show",
    //     value: "show",
    //   },
    //   {
    //     label: "Show in Document",
    //     value: "OutPutDoc:Show",
    //   },
    // ]);

  // }, [_nestedRows]);


  useEffect(() => {
    console.log("questionList rowsrowsrows", rows)
  }, [rows])
  
  useEffect(() => {
    console.log("ACTSSSSS", actions);
    let releatedFields = _nestedRows.find((x: { [x: string]: any; }) => x[sectionLevel]);
    if (releatedFields) {
      releatedFields = releatedFields[sectionLevel].actions
      console.log("ACTSSSSS releatedFields", releatedFields);
      // if (actions && actions.length)
        _setNestedRows(
        updateAllLevelActionsArray(_nestedRows, sectionLevel, [
          {
            checkBoxValues: actions,
            minMax: releatedFields.map((x: { minMax: any; }) => x?.minMax)[0] || {}
          }
        ])
        );
    }
   
  }, [actions]);

  useEffect(() => {
    setMinMaxValue({ minValue: minValue?.input, maxValue: maxValue?.input });
    let releatedFields = _nestedRows.find((x: { [x: string]: any; }) => x[sectionLevel]);
    if (releatedFields) {
      const previousActions = releatedFields[sectionLevel]?.actions?.map((obj: { checkBoxValues: any; }) => obj.checkBoxValues)
      _setNestedRows(
        updateAllLevelActionsArray(_nestedRows, sectionLevel, [
          {
            checkBoxValues: previousActions[0] || [],
            minMax: { minValue: minValue?.input, maxValue: maxValue?.input }
          }
        ])
      );
    }
  }, [minValue, maxValue]);

  // useEffect(() => {
  //     setValidation((prevValidation: any) => ({
  //       ...prevValidation,
  //       ["minMaxValidation"]:
  //         minMaxValue?.maxValue && minMaxValue?.minValue ||
  //         (typeof minMaxValue?.maxValue !== 'string' && typeof minMaxValue?.minValue !== 'string' && minMaxValue?.maxValue >= minMaxValue?.minValue)
  //     }));

  // }, [minMaxValue])


  const handleSectionRemove = () => {
    if(_nestedRows?.length >= 2) _setNestedRows((prevNestedRows: any) =>
         prevNestedRows.filter((key: any) => parseInt(Object.keys(key)[0]) !== sectionLevel)
      );
  }

  useEffect(() => {
    setMinCheckboxEnabled(_nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]?.actions[0]?.minMax?.minValue || false);
    setToggledEnableMin(typeof _nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]?.actions[0]?.minMax?.minValue !== 'string')
    setMaxCheckboxEnabled(_nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]?.actions[0]?.minMax?.maxValue || false);
    setToggledEnableMax(typeof _nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]?.actions[0]?.minMax?.maxValue !== 'string')
  }, []);

  return (
    <div>
      {rows && rows.length && rows.map((row, index) => (
        <RowContainer
          rowIndex={index}
          rowData={rowData}
          setRowData={setRowData}
          addRow={addRow}
          isNested={isNested}
          sectionLevel={sectionLevel}
          setConditionData={setConditionData}
          _setNestedRows={_setNestedRows}
          _nestedRows={_nestedRows}
          questionList={questionList}
          handleSectionRemove={handleSectionRemove}
        />
      ))}

      <div className="action-container">
        <div className="w-100 flex-start">
          <div className="subTitle w-10">Actions</div>
          <div className="flex-row">
            <CheckBox
                checkboxDefaultSelectedValues={
                  _nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]?.actions[0]?.checkBoxValues
                    ?.map((obj: any) => ({ value: obj[Object.keys(obj)[0]]?.value }))
                    ?.map((x: any) => x?.value) || []
                }checkboxValuesFromConfig={[
                {
                  label: "Show",
                  value: "show",
                },
                // {
                //   label: "Enable",
                //   value: "enable",
                // },
                {
                  label: "Show in Document",
                  value: "OutPutDoc:Show",
                },
              ]}
              setCheckboxValues={setActions}
            />
          </div>
        </div>
        {
          currentPossitionDetails && currentPossitionDetails?.currentPosition === "question" &&
              
          <div className="subTitle mt-10 mb-30 w-100 flex-start">
            <div className="subTitle w-10">Min/Max Field</div>
            <div className="flex-start">
              <div className="flex-start mr-30">
                <div style={{ marginRight: "10px" }}>
                  {" "}
                  <Checkbox
                      onChange={(e) => setMinCheckboxEnabled(e.target.checked)}
                      // defaultChecked={_nestedRows?.find((x: { [x: string]: any; }) => x[sectionLevel])[sectionLevel]?.actions[0]?.minMax?.minValue}
                      defaultChecked={_nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]?.actions[0]?.minMax?.minValue || false}
                  />{" "}
                </div>
                <div style={{ marginRight: "10px" }}>
                  <Switch
                    className="custom-toggle"
                    checkedChildren="Value"
                    unCheckedChildren="Question"
                    onChange={() => setToggledEnableMin(!toggleEnableMin)}
                      disabled={!minCheckboxEnabled}
                      defaultChecked={typeof _nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]?.actions[0]?.minMax?.minValue !== 'string'}
                  />
                </div>

                <div className="minmaxText">Min:</div>
                {toggleEnableMin ? (
                  <NumberInputField
                    selectedValue={_nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]?.actions[0]?.minMax?.minValue}
                    handleNumberChange={{}}
                    defaultDisabled={!minCheckboxEnabled}
                    setInputNumber={setMinValue}
                    changedId={undefined}
                    fieldName={"minValue"}
                  />
                ) : (
                  <DropDown
                    dropDownData={questionList}
                    isDisabled={!minCheckboxEnabled}
                    setExpression={setMinValue}
                    changedId={undefined}
                    fieldName={"minValue"}
                    selectedValue={_nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]?.actions[0]?.minMax?.minValue || ''}
                  />
                )}
              </div>

              <div className="flex-start">
                <div style={{ marginRight: "10px" }}>
                  {" "}
                  <Checkbox
                      onChange={(e) => setMaxCheckboxEnabled(e.target.checked)}
                      defaultChecked={_nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]?.actions[0]?.minMax?.maxValue}
                  />{" "}
                </div>
                <div style={{ marginRight: "10px" }}>
                  <Switch
                    className="custom-toggle"
                    checkedChildren="Value"
                    unCheckedChildren="Question"
                    onChange={() => setToggledEnableMax(!toggleEnableMax)}
                      disabled={!maxCheckboxEnabled}
                      defaultChecked={typeof _nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]?.actions[0]?.minMax?.maxValue !== 'string'}
                  />
                </div>

                <div className="minmaxText">Max:</div>
                {toggleEnableMax ? (
                  <NumberInputField
                    selectedValue={_nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]?.actions[0]?.minMax?.maxValue || ''}
                    handleNumberChange={{}}
                    defaultDisabled={!maxCheckboxEnabled}
                    setInputNumber={setMaxValue}
                    changedId={undefined}
                    fieldName={"maxValue"} />
                ) : (
                  <DropDown
                    dropDownData={questionList}
                    isDisabled={!maxCheckboxEnabled}
                    setExpression={setMaxValue}
                    changedId={undefined}
                    fieldName={"maxValue"}
                    selectedValue={_nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]?.actions[0]?.minMax?.maxValue || ''}
                      />
                )}
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  );
}
export default SectionContainer;
