import React, { useEffect, useState } from "react";
import DropDown from "../Components/commonComponents/DropDown";
import { Button, Card, Checkbox, Input, Pagination, Radio, Select, Switch } from "antd";
import RowContainer from "./rowContainer";
import CheckBox from "../Components/commonComponents/CheckBox";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import NumberInputField from "../Components/commonComponents/NumberInputField";
import sampleInputQuestion from "../SampleData/sampleInputQuestion";
import { updateAllLevelActionsArray } from "../Utils/utilsHelper";
import { loadAllQuestionsInSurvey } from "../XRMRequests/xrmRequests";
import { dbConstants } from "../constants/dbConstants";
import type { SelectProps } from "antd";
import type { SizeType } from 'antd/es/config-provider/SizeContext';

interface NestedRowProps {
  children: React.ReactNode;
}

const gridStyle: React.CSSProperties = {
  width: '5%',
  textAlign: 'center',
  height: '2px'
};

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
  setValidation: any;
  setSaveAsIsNested: any;
  imageUrls: any;
  suerveyIsPublished: any;
  currentQuestionDetails: any;
  handleSectionRemove: any;
  languageConstants: any;
  tabType: any;
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
  setValidation,
  setSaveAsIsNested,
  imageUrls,
  suerveyIsPublished,
  currentQuestionDetails,
  handleSectionRemove,
  languageConstants,
  tabType,
}: SectionProps) {
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
  const [minMaxValidation, setMinMaxValidation] = useState<any>(true);
  const [defaultActions, setDefaultActions] = useState<any[]>([]);
  const [checkedReferences, setCheckedReferences] = useState<any>(false);
  const [radioDefaultValOption, setRadioDefaultValOption] = useState<any>();

  const options: SelectProps["options"] = [];
  const [size, setSize] = useState<SizeType>('middle');

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

  useEffect(() => {
    let releatedFields = _nestedRows.find(
      (x: { [x: string]: any }) => x[sectionLevel]
    );
    if (releatedFields) {
      let releatedSection = releatedFields[sectionLevel];
      let releatedActions = releatedFields[sectionLevel]?.actions;
      console.log("ACTSSSSS releatedFields", releatedActions);
      // if (actions && actions.length)
      // if (actions && actions.length && releatedSection?.fields?.length) {
      _setNestedRows(
        updateAllLevelActionsArray(_nestedRows, sectionLevel, [
          {
            checkBoxValues: actions && actions.length ? actions : [],
            minMax:
              releatedActions.map((x: { minMax: any }) => x?.minMax)[0] || null,
          },
        ])
      );
      // }
    }
  }, [actions]);

  useEffect(() => {
    console.log("Min Max Rendering ..... ", minMaxValue);
    console.log("Min Max Rendering minValue ..... ", minValue?.input);
    console.log("Min Max Rendering maxValue ..... ", maxValue?.input);
    console.log("Min Max Rendering Only minValue ..... ", minValue);

    if (minValue?.input || maxValue?.input) {
      setMinMaxValue({ minValue: minValue?.input, maxValue: maxValue?.input });
      let releatedFields = _nestedRows.find(
        (x: { [x: string]: any }) => x[sectionLevel]
      );
      if (releatedFields) {
        const previousActions = releatedFields[sectionLevel]?.actions?.map(
          (obj: { checkBoxValues: any }) => obj.checkBoxValues
        );
        const minMaxDisplay = {
          minValue: minValue?.input,
          maxValue: maxValue?.input,
        };
        console.log("MINMAX", minMaxDisplay);
        _setNestedRows(
          updateAllLevelActionsArray(_nestedRows, sectionLevel, [
            {
              checkBoxValues: previousActions[0] || [],
              minMax: minMaxDisplay,
            },
          ])
        );
      }
    }
    if (minValue?.input && minValue?.input)
      setValidation((prev: any) => {
        return { ...prev, ["minMaxValidation"]: true };
      });
    if (!minValue?.input && !minValue?.input)
      setValidation((prev: any) => {
        return { ...prev, ["minMaxValidation"]: true };
      });
  }, [minValue, maxValue]);

  useEffect(() => {
    if (
      typeof minMaxValue?.minValue === "number" &&
      typeof minMaxValue?.maxValue === "number" &&
      minMaxValue?.maxValue < minMaxValue?.minValue
    ) {
      setMinMaxValidation(false);
    } else {
      setMinMaxValidation(true);
    }
    // if (!minMaxValidation) setValidation((prev: any) => { return { ...prev, ["minMaxValidation"]: false } });
    // else if (typeof minMaxValue?.minValue === 'number' && typeof minMaxValue?.maxValue === 'number' && minMaxValue?.maxValue < minMaxValue?.minValue) setValidation((prev: any) => { return { ...prev, ["minMaxValidation"]: false } });
    // else { setValidation((prev: any) => { return { ...prev, ["minMaxValidation"]: true } }) }
  }, [minMaxValue]);

  // useEffect(() => {
  //   // if (!maxCheckboxEnabled && !minCheckboxEnabled) setValidation((prev: any) => { return { ...prev, ["minMaxValidation"]: true } })
  //   if (!maxCheckboxEnabled && !minCheckboxEnabled) setValidation((prev: any) => { return { ...prev, ["minMaxValidation"]: true } })
  //   else if(!maxCheckboxEnabled || !minCheckboxEnabled) setValidation((prev: any) => { return { ...prev, ["minMaxValidation"]: false } })
  //   else if(maxCheckboxEnabled && minCheckboxEnabled) setValidation((prev: any) => { return { ...prev, ["minMaxValidation"]: true } })
  // }, [maxCheckboxEnabled, minCheckboxEnabled])

  // const handleSectionRemove = () => {
  //     setDeleteSectionKey(sectionLevel)
  // }

  useEffect(() => {
    let releatedFields = _nestedRows?.find(
      (x: { [x: string]: any }) => x[sectionLevel]
    );
    if (
      releatedFields &&
      sectionLevel &&
      releatedFields[sectionLevel] &&
      currentPossitionDetails
    ) {
      let releatedActions = releatedFields[sectionLevel]?.actions;
      _setNestedRows(
        updateAllLevelActionsArray(_nestedRows, sectionLevel, [
          {
            checkBoxValues: releatedActions.map(
              (x: any) => x?.checkBoxValues
            )[0],
            minMax:
              releatedActions.map((x: { minMax: any }) => x?.minMax)[0] || null,
          },
        ])
      );
      setMinCheckboxEnabled(
        _nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]
          ?.actions[0]?.minMax?.minValue || false
      );
      setToggledEnableMin(
        typeof _nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]
          ?.actions[0]?.minMax?.minValue !== "string"
      );
      setMaxCheckboxEnabled(
        _nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]
          ?.actions[0]?.minMax?.maxValue || false
      );
      setToggledEnableMax(
        typeof _nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]
          ?.actions[0]?.minMax?.maxValue !== "string"
      );
      setMinMaxValue({
        minValue: _nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]
          ?.actions[0]?.minMax?.minValue,
        maxValue: _nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]
          ?.actions[0]?.minMax?.maxValue,
      });
      setMinValue({
        input: _nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]
          ?.actions[0]?.minMax?.minValue,
        changedId: "",
        fieldName: "minValue",
      });
      setMaxValue({
        input: _nestedRows?.find((x: any) => x[sectionLevel])?.[sectionLevel]
          ?.actions[0]?.minMax?.maxValue,
        changedId: "",
        fieldName: "maxValue",
      });
    } else {
      setToggledEnableMin(true);
      setToggledEnableMax(true);
    }
  }, []);

  useEffect(() => {
    setDefaultActions(
      currentPossitionDetails &&
        currentPossitionDetails?.currentPosition === "question"
        ? [
            {
              label: languageConstants?.actionLbl,
              value: "show",
            },
            {
              label: languageConstants?.showInDoc,
              value: "OutPutDoc:Show",
            },
          ]
        : [
            {
              label: languageConstants?.actionLbl,
              value: "show",
            },
          ]
    );
  }, [currentPossitionDetails, languageConstants]);

  useEffect(() => {
    console.log("currentQuestionDetails ", currentQuestionDetails);
  }, [currentQuestionDetails]);

  // useEffect(() => {
  //   setMinValue({ input: "", changedId: "", fieldName: "minValue" })
  // }, [toggleEnableMin])

  // useEffect(() => {
  //   setMaxValue({ input: "", changedId: "", fieldName: "maxValue" })
  // }, [toggleEnableMax])

  // useEffect(() => {
  //   if(!minCheckboxEnabled) setMinValue({ input: null, changedId: "", fieldName: "minValue" })
  // }, [minCheckboxEnabled])

  // useEffect(() => {
  //   if(!maxCheckboxEnabled) setMaxValue({ input: null, changedId: "", fieldName: "maxValue" })
  // }, [maxCheckboxEnabled])

  const handleMinMaxWhenToggleChanged = (minValue: any, maxValue: any) => {
    setMinMaxValue((prev: any) => ({ ...prev, minValue, maxValue }));
    let releatedFields = _nestedRows.find(
      (x: { [x: string]: any }) => x[sectionLevel]
    );
    if (releatedFields) {
      const previousActions = releatedFields[sectionLevel]?.actions?.map(
        (obj: { checkBoxValues: any }) => obj.checkBoxValues
      );
      const minMaxDisplay = { minValue, maxValue };
      console.log("MINMAX", minMaxDisplay);
      _setNestedRows(
        updateAllLevelActionsArray(_nestedRows, sectionLevel, [
          {
            checkBoxValues: previousActions[0] || [],
            minMax: !minValue && !maxValue ? null : minMaxDisplay,
          },
        ])
      );
    }
  };

  const toggleEnableOnClickMin = () => {
    console.log("DFFOnCLICK");
    setToggledEnableMin(!toggleEnableMin);
    setMinValue({ input: "", changedId: "", fieldName: "minValue" });
    handleMinMaxWhenToggleChanged(null, null);
  };

  const toggleEnableOnClickMax = () => {
    setToggledEnableMax(!toggleEnableMax);
    setMaxValue({ input: "", changedId: "", fieldName: "maxValue" });
    handleMinMaxWhenToggleChanged(null, null);
  };

  const onChangeCheckBoxMin = (e: any) => {
    setMinCheckboxEnabled(e.target.checked);
    if (!e.target.checked) {
      setMinValue({ input: "", changedId: "", fieldName: "minValue" });
      handleMinMaxWhenToggleChanged(null, null);
    } else {
      if (!minValue?.input) {
        setValidation((prev: any) => {
          return { ...prev, ["minMaxValidation"]: false };
        });
      }
    }
  };

  const onChangeCheckBoxMax = (e: any) => {
    setMaxCheckboxEnabled(e.target.checked);
    console.log("EEEEEE", e);
    if (!e.target.checked) {
      setMaxValue({ input: "", changedId: "", fieldName: "maxValue" });
      handleMinMaxWhenToggleChanged(null, null);
    } else {
      if (!maxValue?.input) {
        setValidation((prev: any) => {
          return { ...prev, ["minMaxValidation"]: false };
        });
      }
    }
  };

  const onChangeRefrences = (e: any) => {
    console.log("References cliecked", e);
    setCheckedReferences(e);
    if(!e) setRadioDefaultValOption(null);
  };

  const handleDefaultNumberChange = (value: string[]) => {
    console.log(`selected ${value}`);
  };

  for (let i = 10; i < 36; i++) {
    options.push({
      label: i.toString(36) + i,
      value: i.toString(36) + i,
    });
  }

  useEffect(() => {
    console.log("options", options);
  }, [options]);

  const onReferencesActionChanged = (e: any) => {
    console.log("onReferencesActionChanged", e);
    setRadioDefaultValOption(e?.target?.value);
  };

  const onDefaultNumberClick = (e: any) => {
    console.log("EEDDDDDD", e?.target?.innerText);

  }
  return (
    <div>
      {rows &&
        rows.length &&
        rows.map((row, index) => (
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
            setSaveAsIsNested={setSaveAsIsNested}
            imageUrls={imageUrls}
            suerveyIsPublished={suerveyIsPublished}
            languageConstants={languageConstants}
          />
        ))}

      {tabType === dbConstants?.tabTypes?.validationTab ? (
        <div className="action-container">
          <div className="w-100 flex-start">
            <div className="subTitle w-10">
              {languageConstants?.actionsLabelConstants}
            </div>
            <div className="flex-row">
              <CheckBox
                checkboxDefaultSelectedValues={
                  _nestedRows
                    ?.find((x: any) => x[sectionLevel])
                    ?.[sectionLevel]?.actions[0]?.checkBoxValues?.map(
                      (obj: any) => ({ value: obj[Object.keys(obj)[0]]?.value })
                    )
                    ?.map((x: any) => x?.value) || []
                }
                checkboxValuesFromConfig={defaultActions}
                setCheckboxValues={setActions}
                isDisabled={suerveyIsPublished}
              />
            </div>
          </div>
          {currentPossitionDetails &&
            currentPossitionDetails?.currentPosition === "question" &&
            currentQuestionDetails?.questionType !== "Header" &&
            currentQuestionDetails?.questionType !== "List" &&
            currentQuestionDetails?.questionType !== "Date" && (
              <div className="subTitle mt-10 mb-30 w-100 flex-start">
                <div className="subTitle w-10 ml-10">
                  {currentQuestionDetails?.questionType === "String"
                    ? `${languageConstants?.minMaxFieldStringConstants}  `
                    : `${languageConstants?.minMaxFieldConstants}  `}{" "}
                </div>
                <div className="flex-start">
                  <div className="flex-start mr-30">
                    <div style={{ marginRight: "10px", marginLeft: "10px" }}>
                      {" "}
                      <Checkbox
                        onChange={(e) => onChangeCheckBoxMin(e)}
                        // defaultChecked={_nestedRows?.find((x: { [x: string]: any; }) => x[sectionLevel])[sectionLevel]?.actions[0]?.minMax?.minValue}
                        defaultChecked={
                          _nestedRows?.find((x: any) => x[sectionLevel])?.[
                            sectionLevel
                          ]?.actions[0]?.minMax?.minValue || false
                        }
                        disabled={suerveyIsPublished}
                      />{" "}
                    </div>
                    <div style={{ marginRight: "10px" }}>
                      <Switch
                        className="custom-toggle"
                        checkedChildren={languageConstants?.valueLabel}
                        unCheckedChildren="Question"
                        onChange={() => toggleEnableOnClickMin()}
                        disabled={
                          suerveyIsPublished
                            ? suerveyIsPublished
                            : !minCheckboxEnabled
                        }
                        defaultChecked={
                          typeof _nestedRows?.find(
                            (x: any) => x[sectionLevel]
                          )?.[sectionLevel]?.actions[0]?.minMax?.minValue !==
                          "string"
                        }
                      />
                    </div>

                    <div className="minmaxText">
                      {currentQuestionDetails?.questionType === "String"
                        ? `${languageConstants?.minLengthStringConstants}`
                        : `${languageConstants?.minLengthConstants}`}
                    </div>
                    {toggleEnableMin ? (
                      <NumberInputField
                        selectedValue={
                          _nestedRows?.find((x: any) => x[sectionLevel])?.[
                            sectionLevel
                          ]?.actions[0]?.minMax?.minValue
                        }
                        handleNumberChange={{}}
                        defaultDisabled={
                          suerveyIsPublished
                            ? suerveyIsPublished
                            : !minCheckboxEnabled
                        }
                        setInputNumber={setMinValue}
                        changedId={undefined}
                        fieldName={"minValue"}
                        validatingSuccess={minMaxValidation}
                      />
                    ) : (
                      <DropDown
                        dropDownData={
                          questionList && questionList?.length
                            ? questionList.filter(
                                (ques: any) => ques?.questionType === "Numeric"
                              )
                            : []
                        }
                        isDisabled={
                          suerveyIsPublished
                            ? suerveyIsPublished
                            : !minCheckboxEnabled
                        }
                        setExpression={setMinValue}
                        changedId={undefined}
                        fieldName={"minValue"}
                        selectedValue={
                          _nestedRows?.find((x: any) => x[sectionLevel])?.[
                            sectionLevel
                          ]?.actions[0]?.minMax?.minValue || ""
                        }
                      />
                    )}
                  </div>

                  <div className="flex-start">
                    <div style={{ marginRight: "10px" }}>
                      {" "}
                      <Checkbox
                        onChange={(e) => onChangeCheckBoxMax(e)}
                        defaultChecked={
                          _nestedRows?.find((x: any) => x[sectionLevel])?.[
                            sectionLevel
                          ]?.actions[0]?.minMax?.maxValue
                        }
                        disabled={suerveyIsPublished}
                      />{" "}
                    </div>
                    <div style={{ marginRight: "10px" }}>
                      <Switch
                        className="custom-toggle"
                        checkedChildren={languageConstants?.valueLabel}
                        unCheckedChildren="Question"
                        onChange={() => toggleEnableOnClickMax()}
                        disabled={
                          suerveyIsPublished
                            ? suerveyIsPublished
                            : !maxCheckboxEnabled
                        }
                        defaultChecked={
                          typeof _nestedRows?.find(
                            (x: any) => x[sectionLevel]
                          )?.[sectionLevel]?.actions[0]?.minMax?.maxValue !==
                          "string"
                        }
                      />
                    </div>

                    <div className="minmaxText">
                      {currentQuestionDetails?.questionType === "String"
                        ? `${languageConstants?.maxLengthStringConstants}`
                        : `${languageConstants?.maxLengthConstants}`}
                    </div>
                    {toggleEnableMax ? (
                      <NumberInputField
                        selectedValue={
                          _nestedRows?.find((x: any) => x[sectionLevel])?.[
                            sectionLevel
                          ]?.actions[0]?.minMax?.maxValue || ""
                        }
                        handleNumberChange={{}}
                        defaultDisabled={
                          suerveyIsPublished
                            ? suerveyIsPublished
                            : !maxCheckboxEnabled
                        }
                        setInputNumber={setMaxValue}
                        changedId={undefined}
                        fieldName={"maxValue"}
                        validatingSuccess={minMaxValidation}
                      />
                    ) : (
                      <DropDown
                        dropDownData={
                          questionList && questionList?.length
                            ? questionList.filter(
                                (ques: any) => ques?.questionType === "Numeric"
                              )
                            : []
                        }
                        isDisabled={
                          suerveyIsPublished
                            ? suerveyIsPublished
                            : !maxCheckboxEnabled
                        }
                        setExpression={setMaxValue}
                        changedId={undefined}
                        fieldName={"maxValue"}
                        selectedValue={
                          _nestedRows?.find((x: any) => x[sectionLevel])?.[
                            sectionLevel
                          ]?.actions[0]?.minMax?.maxValue || ""
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
      ) : (
        <div className="default-acts">
          <div className="referneces-acts">
            <div className="mr-10">Add Question References :</div>
            <div>
              <Switch defaultChecked={false} onChange={onChangeRefrences} />
            </div>
          </div>
          <div className="referneces-checkbx">
            <Radio.Group
              onChange={onReferencesActionChanged}
                value={checkedReferences ? radioDefaultValOption : null}
                disabled={!checkedReferences}
            >
              <Radio value={"CLE_Q"}>Clear Question</Radio>
              <Radio value={"ADD_V"}>Add value or set value</Radio>
              <Radio value={"VAL_Q"}>Value from another question</Radio>
              <Radio value={"MAT_F"}>Mathematical formula</Radio>
            </Radio.Group>
            </div>
            <div className="default-options"> 
              {radioDefaultValOption === "MAT_F" ? (
                <div>
            <div>
              <Select
                mode="tags"
                      allowClear
                      size={size}
                style={{ width: "50%" }}
                placeholder="Please select"
                // defaultValue={['a10', 'c12']}
                onChange={handleDefaultNumberChange}
                options={questionList}
              />
                  </div>
                  {/* <div className="num-input-wrap">
        <div className="num-input">1</div>
      </div> */}
                  <div className="numberlist">
                        <Card onClick={(e) => onDefaultNumberClick(e)}>
                        <Card.Grid style={gridStyle} defaultValue={0}>0</Card.Grid>
                        <Card.Grid style={gridStyle} defaultValue={1}>1</Card.Grid>
                        <Card.Grid style={gridStyle} defaultValue={2}>2</Card.Grid>
                        <Card.Grid style={gridStyle} defaultValue={3}>3</Card.Grid>
                        <Card.Grid style={gridStyle} defaultValue={4}>4</Card.Grid>
                        <Card.Grid style={gridStyle} defaultValue={5}>5</Card.Grid>
                        <Card.Grid style={gridStyle} defaultValue={6}>6</Card.Grid>
                        <Card.Grid style={gridStyle} defaultValue={7}>7</Card.Grid>
                        <Card.Grid style={gridStyle} defaultValue={8}>8</Card.Grid>
                        <Card.Grid style={gridStyle} defaultValue={9}>9</Card.Grid>
                    </Card>
                    <Card onClick={(e) => onDefaultNumberClick(e)}>
                        <Card.Grid style={gridStyle} defaultValue={0}>+</Card.Grid>
                        <Card.Grid style={gridStyle} defaultValue={1}>-</Card.Grid>
                        <Card.Grid style={gridStyle} defaultValue={2}>x</Card.Grid>
                        <Card.Grid style={gridStyle} defaultValue={3}>/</Card.Grid>
                      </Card>
                  </div>
                  
                 
                  </div>
          ) : radioDefaultValOption === "ADD_V" ? (
                <Input
                  placeholder="Add Value"
                    width={'50%'}
                />
                ) : radioDefaultValOption === "VAL_Q" ? (
                    <div>
                    <div>
            <Select
              showSearch
              placeholder="Select a Question"
              optionFilterProp="children"
              // onChange={onChange}
              // onSearch={onSearch}
              // filterOption={filterOption}
              size="middle"
              options={questionList}
                      />
                     
                      </div>
                     
                      </div>
          ) : (
            <div> </div>
              )}
              </div>
        </div>
      )}
    </div>
  );
}
export default SectionContainer;
