import React, { useEffect, useState } from "react";
import DropDown from "../Components/commonComponents/DropDown";
import {
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Switch,
} from "antd";
import RowContainer from "./rowContainer";
import CheckBox from "../Components/commonComponents/CheckBox";
import NumberInputField from "../Components/commonComponents/NumberInputField";
import { updateAllLevelActionsArray } from "../Utils/utilsHelper";
import { dbConstants } from "../constants/dbConstants";
import type { SelectProps } from "antd";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import moment from "moment";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import mathOperators from "../configs/mathOperators";
import { generalConstants } from "../constants/generalConstants";
dayjs.extend(customParseFormat);

const { Option } = Select;

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
  setDefaultTabValidationPassed: any;
  setMinMaxCheckboxEnabled: any;
  currentListQuestionAnswers?: any;
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
  setDefaultTabValidationPassed,
  setMinMaxCheckboxEnabled,
  currentListQuestionAnswers,
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
  const [checkedReferencesQuesOrVal, setCheckedReferencesQuesOrVal] =
    useState<any>(false);
  const [radioDefaultValOption, setRadioDefaultValOption] = useState<any>();
  const [addValue, setAddValue] = useState<any>(null);
  const [defaultMathematicalOperators, setDefaultMathematicalOperators] =
    useState<any>();
  const [selectedValues, setSelectedValues] = useState<any>([]);
  const options: SelectProps["options"] = [];
  const [pickQuestionDefault, setPickQuestionDefault] = useState<any>();
  const [pickOperatorDefault, setPickOperatorDefault] = useState<any>();
  const [pickQuestion2Default, setPickQuestion2Default] = useState<any>();
  const [defaultActionSetWhenRetriving, setDefaultActionSetWhenRetriving] =
    useState<any>();
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
      (field: { [field: string]: any }) => field[sectionLevel]
    );
    if (releatedFields) {
      let releatedSection = releatedFields[sectionLevel];
      let releatedActions = releatedFields[sectionLevel]?.actions;
      _setNestedRows(
        updateAllLevelActionsArray(_nestedRows, sectionLevel, [
          {
            checkBoxValues: actions && actions.length ? actions : [],
            minMax:
              releatedActions.map(
                (action: { minMax: any }) => action?.minMax
              )[0] || null,
          },
        ])
      );
      // }
    }
  }, [actions]);

  useEffect(() => {
    if (minValue?.input || maxValue?.input) {
      setMinMaxValue({ minValue: minValue?.input, maxValue: maxValue?.input });
      let releatedFields = _nestedRows.find(
        (field: { [field: string]: any }) => field[sectionLevel]
      );
      if (releatedFields) {
        const previousActions = releatedFields[sectionLevel]?.actions?.map(
          (obj: { checkBoxValues: any }) => obj.checkBoxValues
        );
        const minMaxDisplay = {
          minValue: minValue?.input,
          maxValue: maxValue?.input,
        };
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
        return { ...prev, [generalConstants.MIN_MAX_VALIDATION]: true };
      });
    if (!minValue?.input && !minValue?.input)
      setValidation((prev: any) => {
        return { ...prev, [generalConstants.MIN_MAX_VALIDATION]: true };
      });
  }, [minValue, maxValue]);

  useEffect(() => {
    if (Number(minMaxValue?.maxValue) < Number(minMaxValue?.minValue)) {
      setMinMaxValidation(false);
    } else {
      setMinMaxValidation(true);
    }
  }, [minMaxValue]);

  useEffect(() => {
    let releatedFields = _nestedRows?.find(
      (relatedField: { [relatedField: string]: any }) =>
        relatedField[sectionLevel]
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
              (relatedAction: any) => relatedAction?.checkBoxValues
            )[0],
            minMax:
              releatedActions.map(
                (relatedAction: { minMax: any }) => relatedAction?.minMax
              )[0] || null,
          },
        ])
      );

      let releatedActionsForSefaultValue =
        releatedFields[sectionLevel]?.actions;
      if (
        releatedActionsForSefaultValue &&
        releatedActionsForSefaultValue?.length &&
        releatedActionsForSefaultValue[0]?.type
      ) {
        setDefaultActionSetWhenRetriving(releatedActionsForSefaultValue[0]);
        // setRadioDefaultValOption(defaultActionSetWhenRetriving?.type)
        setRadioDefaultValOption(releatedActionsForSefaultValue[0]?.type);
        setCheckedReferences(true);
        if (
          releatedActionsForSefaultValue[0]?.type === generalConstants.MAT_F
        ) {
          if (!releatedActionsForSefaultValue?.[0]?.value) return;
          const operator: any = Object.keys(
            releatedActionsForSefaultValue[0]?.value
          )[0];

          if (operator === generalConstants.ZERO) {
            const values = releatedActionsForSefaultValue[0].value;
            const array = [values[0], values[1], values[2]];
            setDefaultMathematicalOperators(array);
            setSelectedValues(array);
            setPickQuestionDefault(values[0]);
            setPickOperatorDefault(values[1]);
            setPickQuestion2Default(values[2]);
            setTimeout(() => {
              setCheckedReferencesQuesOrVal(
                questionList?.filter((ques: any) => ques?.value === values[2])
                  ?.length
                  ? true
                  : false
              );
            }, 1000);
          } else {
            const values = releatedActionsForSefaultValue[0].value[operator];
            const array = [
              values[0]?.var,
              operator,
              values[1]?.var ? values[1]?.var : values[1],
            ];

            setDefaultMathematicalOperators(array);
            setSelectedValues(array);
            setPickQuestionDefault(values[0]?.var);
            setPickOperatorDefault(operator);
            setPickQuestion2Default(
              values[1]?.var ? values[1]?.var : values[1]
            );
            setCheckedReferencesQuesOrVal(
              questionList?.filter(
                (ques: any) =>
                  ques?.value === values[1] || ques?.value === values[1]?.var
              )?.length
                ? true
                : false
            );
          }
        } else {
          setAddValue(releatedActionsForSefaultValue[0]?.value);
        }
      } else {
        setDefaultActionSetWhenRetriving(
          radioDefaultValOption
            ? { type: radioDefaultValOption }
            : { type: generalConstants.DISABLE }
        );
      }

      setMinCheckboxEnabled(
        _nestedRows?.find((row: any) => row[sectionLevel])?.[sectionLevel]
          ?.actions[0]?.minMax?.minValue || false
      );
      setToggledEnableMin(
        typeof _nestedRows?.find((row: any) => row[sectionLevel])?.[
          sectionLevel
        ]?.actions[0]?.minMax?.minValue !== generalConstants.STRING ||
          _nestedRows?.find((row: any) => row[sectionLevel])?.[sectionLevel]
            ?.actions[0]?.minMax?.minValue === generalConstants.ZERO
      );
      setMaxCheckboxEnabled(
        _nestedRows?.find((row: any) => row[sectionLevel])?.[sectionLevel]
          ?.actions[0]?.minMax?.maxValue || false
      );
      setToggledEnableMax(
        typeof _nestedRows?.find((row: any) => row[sectionLevel])?.[
          sectionLevel
        ]?.actions[0]?.minMax?.maxValue !== generalConstants.STRING ||
          _nestedRows?.find((row: any) => row[sectionLevel])?.[sectionLevel]
            ?.actions[0]?.minMax?.minValue === generalConstants.ZERO
      );
      setMinMaxValue({
        minValue: _nestedRows?.find((row: any) => row[sectionLevel])?.[
          sectionLevel
        ]?.actions[0]?.minMax?.minValue,
        maxValue: _nestedRows?.find((row: any) => row[sectionLevel])?.[
          sectionLevel
        ]?.actions[0]?.minMax?.maxValue,
      });
      setMinValue({
        input: _nestedRows?.find((row: any) => row[sectionLevel])?.[
          sectionLevel
        ]?.actions[0]?.minMax?.minValue,
        changedId: "",
        fieldName: generalConstants.MIN_VALUE,
      });
      setMaxValue({
        input: _nestedRows?.find((row: any) => row[sectionLevel])?.[
          sectionLevel
        ]?.actions[0]?.minMax?.maxValue,
        changedId: "",
        fieldName: generalConstants.MAX_VALUE,
      });
    } else {
      setToggledEnableMin(true);
      setToggledEnableMax(true);
      setDefaultActionSetWhenRetriving(
        radioDefaultValOption
          ? { type: radioDefaultValOption }
          : { type: generalConstants.DISABLE }
      );
    }
  }, []);

  useEffect(() => {
    setDefaultActions(
      currentPossitionDetails &&
        currentPossitionDetails?.currentPosition === generalConstants.QUESTION
        ? [
            {
              label: languageConstants?.ExpressionBuilder_ActionLbl,
              value: generalConstants.SHOW_SIMPLE,
            },
            {
              label: languageConstants?.ExpressionBuilder_ShowInDoc,
              value: generalConstants.OUTPUTDOC_SHOW,
            },
          ]
        : [
            {
              label: languageConstants?.ExpressionBuilder_ActionLbl,
              value: generalConstants.SHOW_SIMPLE,
            },
          ]
    );
  }, [currentPossitionDetails, languageConstants]);

  const handleMinMaxWhenToggleChanged = (minValue: any, maxValue: any) => {
    setMinMaxValue((prev: any) => ({ ...prev, minValue, maxValue }));
    let releatedFields = _nestedRows.find(
      (row: { [row: string]: any }) => row[sectionLevel]
    );
    if (releatedFields) {
      const previousActions = releatedFields[sectionLevel]?.actions?.map(
        (obj: { checkBoxValues: any }) => obj.checkBoxValues
      );
      const minMaxDisplay = { minValue, maxValue };
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
    setToggledEnableMin(!toggleEnableMin);
    setMinValue({
      input: "",
      changedId: "",
      fieldName: generalConstants.MIN_VALUE,
    });
    handleMinMaxWhenToggleChanged(null, null);
  };

  const toggleEnableOnClickMax = () => {
    setToggledEnableMax(!toggleEnableMax);
    setMaxValue({
      input: "",
      changedId: "",
      fieldName: generalConstants.MAX_VALUE,
    });
    handleMinMaxWhenToggleChanged(null, null);
  };

  const onChangeCheckBoxMin = (e: any) => {
    setMinCheckboxEnabled(e.target.checked);
    setMinMaxCheckboxEnabled((prev: any) => {
      return { ...prev, [generalConstants.MIN_CHECKBOX]: e.target.checked };
    });

    if (!e.target.checked) {
      setMinValue({
        input: "",
        changedId: "",
        fieldName: generalConstants.MIN_VALUE,
      });
      handleMinMaxWhenToggleChanged(null, null);
    } else {
      if (!minValue?.input) {
        setValidation((prev: any) => {
          return { ...prev, [generalConstants.MIN_MAX_VALIDATION]: false };
        });
      }
    }
  };

  const onChangeCheckBoxMax = (e: any) => {
    setMaxCheckboxEnabled(e.target.checked);
    setMinMaxCheckboxEnabled((prev: any) => {
      return { ...prev, [generalConstants.MAX_CHECKBOX]: e.target.checked };
    });
    if (!e.target.checked) {
      setMaxValue({
        input: "",
        changedId: "",
        fieldName: generalConstants.MAX_VALUE,
      });
      handleMinMaxWhenToggleChanged(null, null);
    } else {
      if (!maxValue?.input) {
        setValidation((prev: any) => {
          return { ...prev, [generalConstants.MIN_MAX_VALIDATION]: false };
        });
      }
    }
  };

  const onChangeRefrences = (e: any) => {
    setCheckedReferences(e);
    if (!e) {
      setRadioDefaultValOption(null);
      _setNestedRows(updateAllLevelActionsArray(_nestedRows, sectionLevel, []));
    }
    setSelectedValues([]);
    setPickOperatorDefault(null);
    setPickQuestionDefault(null);
    setPickQuestion2Default(null);
    setDefaultActionSetWhenRetriving(
      e ? { type: radioDefaultValOption } : { type: generalConstants.DISABLE }
    );
  };

  const onChangeRefrencesPickValOrQues = (e: any) => {
    setCheckedReferencesQuesOrVal(e);
    setPickQuestion2Default(null);
  };

  for (let i = 10; i < 36; i++) {
    options.push({
      label: i.toString(36) + i,
      value: i.toString(36) + i,
    });
  }

  const onReferencesActionChanged = (e: any) => {
    setRadioDefaultValOption(e?.target?.value);
    setDefaultActionSetWhenRetriving({ type: e?.target?.value });
    setSelectedValues([]);

    setPickOperatorDefault(null);
    setPickQuestionDefault(null);
    setPickQuestion2Default(null);
    if (
      currentQuestionDetails?.questionType ===
        dbConstants?.questionTypes?.dateTimeQuestion &&
      e?.target?.value === generalConstants.ADD_V
    ) {
      setAddValue(moment().format(dbConstants?.common?.dateFormat));
    } else if (
      currentQuestionDetails?.questionType ===
        dbConstants?.questionTypes?.numericQuestion &&
      e?.target?.value === generalConstants.ADD_V
    ) {
      setAddValue(0);
    } else {
      setAddValue(null);
    }
  };

  const handleMathematicalOperator = (e: any) => {
    setPickOperatorDefault(e);
  };

  useEffect(() => {
    if (radioDefaultValOption === generalConstants.CLE_Q) {
      _setNestedRows(
        updateAllLevelActionsArray(_nestedRows, sectionLevel, [
          {
            type: generalConstants.CLE_Q,
            value: null,
          },
        ])
      );
    } else if (radioDefaultValOption === generalConstants.ADD_V) {
      _setNestedRows(
        updateAllLevelActionsArray(_nestedRows, sectionLevel, [
          {
            type: generalConstants.ADD_V,
            value: addValue,
          },
        ])
      );
    } else if (radioDefaultValOption === generalConstants.VAL_Q) {
      _setNestedRows(
        updateAllLevelActionsArray(_nestedRows, sectionLevel, [
          {
            type: generalConstants.VAL_Q,
            value: addValue,
          },
        ])
      );
    } else if (
      radioDefaultValOption === generalConstants.MAT_F &&
      addValue?.length
    ) {
      _setNestedRows(
        updateAllLevelActionsArray(_nestedRows, sectionLevel, [
          {
            type: generalConstants.MAT_F,
            value: addValue,
          },
        ])
      );
    } else {
      if (radioDefaultValOption) {
        _setNestedRows(
          updateAllLevelActionsArray(_nestedRows, sectionLevel, [
            {
              type: generalConstants.MAT_F,
              value: addValue,
            },
          ])
        );
      }
    }
  }, [radioDefaultValOption, addValue]);

  useEffect(() => {
    if (radioDefaultValOption === generalConstants.MAT_F && checkedReferences) {
      if (pickOperatorDefault && pickQuestion2Default && pickQuestionDefault) {
        setAddValue([
          pickQuestionDefault,
          pickOperatorDefault,
          pickQuestion2Default,
        ]);
        setDefaultTabValidationPassed(true);
      } else {
        setDefaultTabValidationPassed(false);
      }
    } else {
      setDefaultTabValidationPassed(true);
    }
  }, [pickOperatorDefault, pickQuestionDefault, pickQuestion2Default]);

  useEffect(() => {
    _nestedRows.forEach((item: any) => {
      Object.values(item).forEach((innerItem: any) => {
        innerItem.actions.forEach((action: any) => {
          if (action?.type === generalConstants.ADD_V) {
            const utcDateString: any = action.value;
            const utcDate: any = moment.utc(utcDateString);
            const formattedDate: any = utcDate
              .local()
              .format(generalConstants.DATE_FORMAT);
            action.value = formattedDate;
            setAddValue(formattedDate);
          }
        });
      });
    });
  }, []);

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
            tabType={tabType}
            currentQuestionDetails={currentQuestionDetails}
          />
        ))}

      {tabType === dbConstants?.tabTypes?.validationTab ? (
        <div className="action-container">
          <div className="w-100 flex-start">
            <div className="subTitle w-10">
              {languageConstants?.ExpressionBuilder_ActionsLabelConstants}
            </div>
            <div className="flex-row">
              <CheckBox
                checkboxDefaultSelectedValues={
                  _nestedRows
                    ?.find((row: any) => row[sectionLevel])
                    ?.[sectionLevel]?.actions[0]?.checkBoxValues?.map(
                      (obj: any) => ({
                        value: obj[Object.keys(obj)[0]]?.value,
                      })
                    )
                    ?.map((row: any) => row?.value) || []
                }
                checkboxValuesFromConfig={defaultActions}
                setCheckboxValues={setActions}
                isDisabled={suerveyIsPublished}
              />
            </div>
          </div>
          {currentPossitionDetails &&
            currentPossitionDetails?.currentPosition ===
              generalConstants.QUESTION &&
            currentQuestionDetails?.questionType !== generalConstants.HEADER &&
            currentQuestionDetails?.questionType !== generalConstants.LIST &&
            currentQuestionDetails?.questionType !== generalConstants.DATE && (
              <div className="subTitle mt-10 mb-30 w-100 flex-start">
                <div className="subTitle w-10 ml-10">
                  {currentQuestionDetails?.questionType ===
                  generalConstants.SSTRING
                    ? `${languageConstants?.ExpressionBuilder_MinMaxFieldStringConstants}  `
                    : `${languageConstants?.ExpressionBuilder_MinMaxFieldConstants}  `}{" "}
                </div>
                <div className="flex-start">
                  <div className="flex-start mr-30">
                    <div style={{ marginRight: "10px", marginLeft: "10px" }}>
                      {" "}
                      <Checkbox
                        onChange={(e) => onChangeCheckBoxMin(e)}
                        // defaultChecked={_nestedRows?.find((x: { [x: string]: any; }) => x[sectionLevel])[sectionLevel]?.actions[0]?.minMax?.minValue}
                        defaultChecked={
                          _nestedRows?.find((row: any) => row[sectionLevel])?.[
                            sectionLevel
                          ]?.actions[0]?.minMax?.minValue || false
                        }
                        disabled={suerveyIsPublished}
                      />{" "}
                    </div>
                    <div style={{ marginRight: "10px" }}>
                      <Switch
                        className="custom-toggle"
                        checkedChildren={
                          languageConstants?.ExpressionBuilder_ValueLabel
                        }
                        unCheckedChildren="Question"
                        onChange={() => toggleEnableOnClickMin()}
                        disabled={
                          suerveyIsPublished
                            ? suerveyIsPublished
                            : !minCheckboxEnabled
                        }
                        defaultChecked={
                          typeof _nestedRows?.find(
                            (row: any) => row[sectionLevel]
                          )?.[sectionLevel]?.actions[0]?.minMax?.minValue !==
                            generalConstants.STRING ||
                          _nestedRows?.find((row: any) => row[sectionLevel])?.[
                            sectionLevel
                          ]?.actions[0]?.minMax?.minValue ===
                            generalConstants.ZERO
                        }
                      />
                    </div>

                    <div className="minmaxText">
                      {currentQuestionDetails?.questionType ===
                      generalConstants.SSTRING
                        ? `${
                            languageConstants?.ExpressionBuilder_MinLengthStringConstants +
                            ":"
                          }`
                        : `${languageConstants?.ExpressionBuilder_MinLengthConstants}` +
                          ":"}
                    </div>
                    {toggleEnableMin ? (
                      <NumberInputField
                        selectedValue={
                          _nestedRows?.find((row: any) => row[sectionLevel])?.[
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
                        fieldName={generalConstants.MIN_VALUE}
                        validatingSuccess={minMaxValidation}
                      />
                    ) : (
                      <DropDown
                        dropDownData={
                          questionList && questionList?.length
                            ? questionList.filter(
                                (ques: any) =>
                                  ques?.questionType ===
                                  generalConstants.NUMERIC
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
                        fieldName={generalConstants.MIN_VALUE}
                        selectedValue={
                          _nestedRows?.find((row: any) => row[sectionLevel])?.[
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
                          _nestedRows?.find((row: any) => row[sectionLevel])?.[
                            sectionLevel
                          ]?.actions[0]?.minMax?.maxValue
                        }
                        disabled={suerveyIsPublished}
                      />{" "}
                    </div>
                    <div style={{ marginRight: "10px" }}>
                      <Switch
                        className="custom-toggle"
                        checkedChildren={
                          languageConstants?.ExpressionBuilder_ValueLabel
                        }
                        unCheckedChildren="Question"
                        onChange={() => toggleEnableOnClickMax()}
                        disabled={
                          suerveyIsPublished
                            ? suerveyIsPublished
                            : !maxCheckboxEnabled
                        }
                        defaultChecked={
                          typeof _nestedRows?.find(
                            (row: any) => row[sectionLevel]
                          )?.[sectionLevel]?.actions[0]?.minMax?.maxValue !==
                            generalConstants.STRING ||
                          _nestedRows?.find((row: any) => row[sectionLevel])?.[
                            sectionLevel
                          ]?.actions[0]?.minMax?.maxValue ===
                            generalConstants.ZERO
                        }
                      />
                    </div>

                    <div className="minmaxText">
                      {currentQuestionDetails?.questionType ===
                      generalConstants.SSTRING
                        ? `${languageConstants?.ExpressionBuilder_MaxLengthStringConstants}`
                        : `${languageConstants?.ExpressionBuilder_MaxLengthConstants}` +
                          " :"}
                    </div>
                    {toggleEnableMax ? (
                      <NumberInputField
                        selectedValue={
                          _nestedRows?.find((row: any) => row[sectionLevel])?.[
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
                        fieldName={generalConstants.MAX_VALUE}
                        validatingSuccess={minMaxValidation}
                      />
                    ) : (
                      <DropDown
                        dropDownData={
                          questionList && questionList?.length
                            ? questionList.filter(
                                (ques: any) =>
                                  ques?.questionType ===
                                  generalConstants.NUMERIC
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
                        fieldName={generalConstants.MAX_VALUE}
                        selectedValue={
                          _nestedRows?.find((row: any) => row[sectionLevel])?.[
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
          {defaultActionSetWhenRetriving && (
            <>
              <div className="referneces-acts">
                <div className="mr-10">
                  {languageConstants?.ExpressionBuilder_AddQuesRef + " :"}
                </div>
                <div>
                  <Switch
                    defaultChecked={
                      defaultActionSetWhenRetriving?.type ===
                      generalConstants.DISABLE
                        ? false
                        : true
                    }
                    onChange={onChangeRefrences}
                    disabled={suerveyIsPublished}
                  />
                </div>
              </div>
              <div className="referneces-checkbx">
                <Radio.Group
                  onChange={onReferencesActionChanged}
                  value={checkedReferences ? radioDefaultValOption : null}
                  disabled={
                    suerveyIsPublished ? suerveyIsPublished : !checkedReferences
                  }
                  defaultValue={defaultActionSetWhenRetriving?.type}
                >
                  <Radio value={generalConstants.CLE_Q}>
                    {languageConstants?.ExpressionBuilder_ClrQues}
                  </Radio>
                  <Radio value={generalConstants.ADD_V}>
                    {languageConstants?.ExpressionBuilder_AddValOrSetVal}
                  </Radio>

                  {currentQuestionDetails?.questionType !==
                    dbConstants?.questionTypes?.listQuestion && (
                    <Radio value={generalConstants.VAL_Q}>
                      {languageConstants?.ExpressionBuilder_ValFromAnotherQues}
                    </Radio>
                  )}

                  {currentQuestionDetails?.questionType ===
                    dbConstants?.questionTypes?.numericQuestion && (
                    <Radio value={generalConstants.MAT_F}>
                      {languageConstants?.ExpressionBuilder_MatheFormula}
                    </Radio>
                  )}
                </Radio.Group>
              </div>
              <div className="default-options">
                {radioDefaultValOption === generalConstants.MAT_F ? (
                  <div>
                    <div className="select-ques-one">
                      <div className="mr-11">
                        {" "}
                        {languageConstants?.ExpressionBuilder_SelectaQuestion +
                          " "}{" "}
                        :{" "}
                      </div>
                      <div>
                        <Select
                          allowClear
                          style={{ width: "200px" }}
                          placeholder={
                            languageConstants?.ExpressionBuilder_SelectQuestions
                          }
                          // value={selectedValues}
                          // onChange={handleSelectChange}
                          onChange={(e) => setPickQuestionDefault(e)}
                          disabled={suerveyIsPublished}
                          defaultValue={pickQuestionDefault}
                          options={questionList?.filter(
                            (que: any) =>
                              que["questionType"] ===
                              dbConstants?.questionTypes?.numericQuestion
                          )}
                        >
                          {/* {selectedValues.map((value: any) => (
                            <Option key={value} value={value}>
                              {value}
                            </Option>
                          ))} */}
                        </Select>
                      </div>
                    </div>

                    <div className="select-ques-one">
                      <div className="mr-11">
                        {" "}
                        {languageConstants?.ExpressionBuilder_SelectaOperator +
                          " "}{" "}
                        :{" "}
                      </div>
                      <div>
                        <Select
                          allowClear
                          style={{ width: "100px" }}
                          placeholder={
                            languageConstants?.ExpressionBuilder_PickaOperator
                          }
                          value={pickOperatorDefault}
                          onChange={(e) => setPickOperatorDefault(e)}
                          disabled={suerveyIsPublished}
                          defaultValue={pickOperatorDefault}
                          options={mathOperators}
                        >
                          {/* {selectedValues.map((value: any) => (
                            <Option key={value} value={value}>
                              {value}
                            </Option>
                          ))} */}
                        </Select>
                      </div>

                      <div className="numberlist">
                        <div className="exp-input-wrap">
                          <div
                            className="num-input"
                            onClick={() => handleMathematicalOperator("+")}
                          >
                            +
                          </div>
                          <div
                            className="num-input"
                            onClick={() => handleMathematicalOperator("-")}
                          >
                            -
                          </div>
                          <div
                            className="num-input"
                            onClick={() => handleMathematicalOperator("*")}
                          >
                            *
                          </div>
                          <div
                            className="num-input"
                            onClick={() => handleMathematicalOperator("/")}
                          >
                            /
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="select-ques-one">
                      <div className="mr-10">
                        {" "}
                        {languageConstants?.ExpressionBuilder_PickaValueorQuestion +
                          " "}{" "}
                        :{" "}
                      </div>

                      <Switch
                        defaultChecked={
                          questionList?.filter(
                            (ques: any) => ques?.value === pickQuestion2Default
                          )?.length
                            ? true
                            : false
                        }
                        onChange={onChangeRefrencesPickValOrQues}
                        disabled={suerveyIsPublished}
                      />
                    </div>
                    <div className="select-ques-one">
                      {checkedReferencesQuesOrVal ? (
                        <>
                          <div className="mr-15">
                            {" "}
                            {languageConstants?.ExpressionBuilder_SelectaQuestion +
                              " "}{" "}
                            :{" "}
                          </div>

                          <Select
                            allowClear
                            style={{ width: "200px" }}
                            placeholder={
                              languageConstants?.ExpressionBuilder_SelectaQuestion
                            }
                            // value={pickOperatorDefault}
                            onChange={(e) => setPickQuestion2Default(e)}
                            // onChange={handleSelectChange}
                            disabled={suerveyIsPublished}
                            defaultValue={pickQuestion2Default}
                            options={questionList?.filter(
                              (que: any) =>
                                que["questionType"] ===
                                dbConstants?.questionTypes?.numericQuestion
                            )}
                          >
                            {selectedValues.map((value: any) => (
                              <Option key={value} value={value}>
                                {value}
                              </Option>
                            ))}
                          </Select>
                        </>
                      ) : (
                        <>
                          <div className="mr-36">
                            {" "}
                            {languageConstants?.ExpressionBuilder_SelectAValue +
                              " "}{" "}
                            :{" "}
                          </div>
                          <Input
                            type="number"
                            disabled={suerveyIsPublished}
                            placeholder={
                              languageConstants?.ExpressionBuilder_AddValue
                            }
                            style={{ width: "200px" }}
                            onChange={(e) =>
                              setPickQuestion2Default(e?.target?.value)
                            }
                            defaultValue={pickQuestion2Default}
                          />
                        </>
                      )}
                    </div>
                  </div>
                ) : radioDefaultValOption === generalConstants.ADD_V ? (
                  currentQuestionDetails?.questionType ===
                  dbConstants?.questionTypes?.numericQuestion ? (
                    <InputNumber
                      type="number"
                      placeholder={
                        languageConstants?.ExpressionBuilder_AddValue
                      }
                      disabled={suerveyIsPublished}
                      style={{ width: "50%" }}
                      onChange={(e: any) => {
                        setAddValue(e);
                      }}
                      defaultValue={defaultActionSetWhenRetriving?.value}
                      value={addValue}
                    />
                  ) : currentQuestionDetails?.questionType ===
                    generalConstants.DATE ? (
                    <Space direction="vertical" size={17}>
                      <DatePicker
                        disabled={suerveyIsPublished}
                        defaultValue={
                          defaultActionSetWhenRetriving?.value &&
                          moment(
                            defaultActionSetWhenRetriving?.value,
                            dbConstants?.common?.dateFormat
                          ).isValid()
                            ? dayjs(
                                moment(
                                  defaultActionSetWhenRetriving?.value,
                                  dbConstants?.common?.dateFormat
                                ).format(dbConstants?.common?.dateFormat)
                              )
                            : dayjs(
                                moment().format(dbConstants?.common?.dateFormat)
                              )
                        }
                        format={dbConstants?.common?.dateFormat}
                        // disabled={isDisabled}
                        onChange={(input, option) => setAddValue(input)}
                        style={{ width: "150px" }}
                      />
                    </Space>
                  ) : currentQuestionDetails?.questionType === "List" ? (
                    // <Space direction="vertical" size={50}>
                    <Select
                      showSearch
                      placeholder={languageConstants?.selectaQues}
                      optionFilterProp="children"
                      style={{ width: "30%" }}
                      onChange={(e: any) => setAddValue(e)}
                      disabled={suerveyIsPublished}
                      options={
                        currentListQuestionAnswers &&
                        currentListQuestionAnswers?.listAnswers?.length &&
                        currentListQuestionAnswers?.listAnswers
                      }
                      value={!addValue ? null : addValue}
                    />
                  ) : (
                    // </Space>
                    <Input
                      disabled={suerveyIsPublished}
                      placeholder={languageConstants?.addValue}
                      style={{ width: "50%" }}
                      onChange={(e: any) => {
                        setAddValue(e?.target?.value);
                      }}
                      defaultValue={
                        defaultActionSetWhenRetriving?.type ===
                        generalConstants.ADD_V
                          ? defaultActionSetWhenRetriving?.value
                          : null
                      }
                      value={addValue}
                    />
                  )
                ) : radioDefaultValOption === generalConstants.VAL_Q ? (
                  <div>
                    <div>
                      <Select
                        showSearch
                        placeholder={languageConstants?.selectaQues}
                        optionFilterProp="children"
                        // onChange={onChange}
                        // onSearch={onSearch}
                        // filterOption={filterOption}
                        // defaultValue={
                        //   defaultActionSetWhenRetriving?.type === "VAL_Q"
                        //     ? defaultActionSetWhenRetriving?.value
                        //     : null
                        // }
                        style={{ width: "50%" }}
                        onChange={(e: any) => setAddValue(e)}
                        disabled={suerveyIsPublished}
                        options={
                          currentQuestionDetails?.questionType ===
                          generalConstants.NUMERIC
                            ? questionList?.filter(
                                (ques: any) =>
                                  ques["questionType"] ===
                                    dbConstants?.questionTypes
                                      ?.numericQuestion &&
                                  ques["questionType"] !==
                                    dbConstants?.questionTypes?.gridQuestion
                              )
                            : currentQuestionDetails?.questionType ===
                              generalConstants.DATE
                            ? questionList?.filter(
                                (ques: any) =>
                                  ques["questionType"] ===
                                    dbConstants?.questionTypes
                                      ?.dateTimeQuestion &&
                                  ques["questionType"] !==
                                    dbConstants?.questionTypes?.gridQuestion
                              )
                            : questionList?.filter(
                                (qlist: any) =>
                                  qlist["questionType"] !==
                                  dbConstants?.questionTypes?.gridQuestion
                              )
                        }
                        value={!addValue ? null : addValue}
                      />
                    </div>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
export default SectionContainer;
