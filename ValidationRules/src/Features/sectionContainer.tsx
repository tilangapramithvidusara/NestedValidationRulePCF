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
}

function SectionContainer({
  sectionLevel,
  conditionData,
  setConditionData,
  _setNestedRows,
  _nestedRows,
  isNested
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
  const [questionList, setQuestionList] = useState<any[]>([]);

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

  useEffect(() => {
    console.log("nestedRows from sectionnnnn", _nestedRows[sectionLevel]);
    let releatedFields = _nestedRows.find((x: { [x: string]: any; }) => x[sectionLevel]);
      if (releatedFields) {
        releatedFields = releatedFields[sectionLevel].actions
        console.log("Section actions from section field ", releatedFields)
      }
  }, [_nestedRows]);

  useEffect(() => {
    loadQuestionHandler();
  }, []);

  useEffect(() => {
      console.log("questionList", questionList)
  }, [questionList])

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
  

  const loadQuestionHandler = async () => {
    const result = await loadAllQuestionsInSurvey();
    console.log('resss =====> ', result);
    
    let questionListArray = result.data || [];
    // Check if 'result.data' exists and has 'entities' property
    if (questionListArray && questionListArray.length) {
        const formattedQuestionList = questionListArray.map((quesNme:any) => {
            return { label: quesNme.gyde_name, value: quesNme.gyde_name, questionType: 'numeric'}
        })
        formattedQuestionList && formattedQuestionList.length && setQuestionList(formattedQuestionList);
    } else {
      // Handle the case when 'entities' property is not present
      setQuestionList([]);
    }
  };

  return (
    <div>
      {rows.map((row, index) => (
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
        />
      ))}

      <div className="action-container">
        <div className="w-100">
          <div className="subTitle mb-15">Actions</div>
          <div className="flex-row">
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
                  value: "OutPutDoc:Show",
                },
              ]}
              setCheckboxValues={setActions}
            />
          </div>
        </div>

        <div className="subTitle mt-10 mb-30 w-100">
          <div className="subTitle mb-15">Min/Max Field</div>
          <div className="flex-row-start">
          <div className="mb-15 flex-wrap w-33">
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

            <div className="minmaxText">Min:</div>
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
                    isDisabled={!minCheckboxEnabled}
                    setExpression={setMinValue}
                    changedId={undefined}
                    fieldName={"minValue"} selectedValue={undefined}                />
            )}
          </div>

          <div className="mb-15 flex-wrap w-33">
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

            <div className="minmaxText">Max:</div>
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
                    isDisabled={!maxCheckboxEnabled}
                    setExpression={setMaxValue}
                    changedId={undefined}
                    fieldName={"maxValue"} selectedValue={undefined}                />
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SectionContainer;
