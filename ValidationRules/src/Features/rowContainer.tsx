import React, { useEffect, useState } from "react";
import DropDown from "../Components/commonComponents/DropDown";
import FieldInput from "../Components/commonComponents/FieldInput";
import { Button, Input, Space, Spin, notification } from "antd";
import { expressionSampleData } from "../SampleData/expressionSampleData";
import { operationalSampleData } from "../SampleData/operationalSampleData";
import { sampleInputQuestion } from "../SampleData/sampleInputQuestion";
import NumberInputField from "../Components/commonComponents/NumberInputField";
import FieldStringInputProps from "../Components/commonComponents/StringInput";
// import deleteImg from "../assets/delete.png";
import dayjs from 'dayjs';

import {
  _updateExpressionByParentId,
  findGroupId,
  generateOutputString,
  getAllChildrenIDs,
  getNearestParentByItems,
  getNestedParentLevel,
  removeByKey,
  updateAllLevelArray,
  updateByParentId,
  updateFieldByLevel,
} from "../Utils/utilsHelper";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { getListAnswersByQuestionId } from "../XRMRequests/xrmRequests";
import ListDropDown from "../Components/commonComponents/ListDropDown";
import { dbConstants } from "../constants/dbConstants";
import DatePickerCustom from "../Components/commonComponents/DatePickerCustom";
import moment from "moment";
import tabsConfigs from "../configs/tabsConfigs";
interface NestedRowProps {
  children: React.ReactNode;
}

interface TableRowProps {
  rowIndex: number;
  rowData: any;
  setRowData: any;
  addRow: any;
  isNested: any;
  sectionLevel: number;
  setConditionData: any;
  _setNestedRows: any;
  _nestedRows: any;
  questionList: any;
  handleSectionRemove: any;
  setSaveAsIsNested: any;
  imageUrls: any;
  suerveyIsPublished: any;
  languageConstants: any;
  tabType: any;
  currentQuestionDetails: any
}

interface Condition {
  field: string;
  condition: string;
  value: string;
  sort: number;
  level: number;
  hasNested: boolean;
  innerConditions: Condition[];
}

const RowContainer: React.FC<TableRowProps> = ({
  rowIndex,
  rowData,
  setRowData,
  addRow,
  isNested,
  sectionLevel,
  setConditionData,
  _setNestedRows,
  _nestedRows,
  questionList,
  handleSectionRemove,
  setSaveAsIsNested,
  imageUrls,
  suerveyIsPublished,
  languageConstants,
  tabType,
  currentQuestionDetails
}) => {
  const [nestedRows, setNestedRows] = useState<React.ReactNode[]>([]);
  const [collapse, setCollapse] = useState<any>({ state: false, fieldId: 0 });
  const [fieldValue, setFieldValue] = useState<any>();
  const [showActionOutput, setShowActionOutput] = useState<any>();
  const [questionType, setQuestionType] = useState<any>();
  const [isLoad, setIsLoad] = useState<boolean>(false);
  const [dropDownQuestionList, setDropDownQuestionList]  = useState<any>();

  const [answersDropDownData, setAnswersDropDownData] = useState<any[]>([]);
  const [api, contextHolder]: any = notification.useNotification();
  const [listAnsersWithQuestionIds, setListAnsersWithQuestionIds] = useState<any>();
  const [listQuestionLoading, setListQuestionLoading]  = useState<any>(false);

  const [listQuestionIds, setListQuestionIds]  = useState<any>();

  const findConditionByLevel = (
    level: any,
    conditions: any
  ): Condition | null => {
    for (const condition of conditions) {
      if (condition.level === level) {
        return condition;
      } else if (condition.hasNested) {
        const foundCondition = findConditionByLevel(
          level,
          condition.innerConditions
        );
        if (foundCondition) {
          return foundCondition;
        }
      }
    }
    return null;
  };

  const idGenerator = (
    parentLevel: number,
    hasNested: boolean,
    nestedRowArray: any
  ) => {
    let newKey;
    if (hasNested) {
      newKey = parseInt(parentLevel + `1`);
    } else {
      const highestLevel = nestedRowArray.reduce(
        (maxLevel: number, obj: { level: number }) => {
          return obj.level > maxLevel ? obj.level : maxLevel;
        },
        0
      );
      newKey = highestLevel + 100;
    }
    console.log("New Key", newKey);
    return newKey;
  };

  const _handleAddNestedRow = (
    level: number,
    hasNested: boolean,
    expression: string = ""
  ) => {
    console.log(" Nested Clicked Level ", level);
    setSaveAsIsNested(true)
    let releatedFields = _nestedRows?.find((x: any[]) => x[sectionLevel]);
    if (releatedFields) {
      const nearestNestedIdParentId = getNestedParentLevel(
        releatedFields[sectionLevel].fields,
        level
      )[0];
      let higestLevel;
      let childArrays;
      if (nearestNestedIdParentId?.innerConditions?.length) {
        childArrays = nearestNestedIdParentId.innerConditions.map(
          (x: { level: any }) => x.level
        );
        higestLevel = Math.max(...childArrays);
      }

      if (
        higestLevel &&
        (higestLevel === idGenerator(level, hasNested, []) ||
          childArrays.includes(idGenerator(level, hasNested, [])))
      ) {
        higestLevel = higestLevel + 1;
      } else {
        higestLevel = idGenerator(level, hasNested, []);
      }
      let newRow = {
        field: "",
        condition: "",
        value: "",
        sort: 1,
        level: higestLevel,
        hasNested: false,
        innerConditions: [],
        collapse: false,
      };
      _setNestedRows(
        updateAllLevelArray(
          _nestedRows,
          sectionLevel,
          updateByParentId(releatedFields[sectionLevel].fields, level, newRow)
        )
      );

      console.log("NESTED", _nestedRows);
    }
  };

  const fieldValueSetToNestedRows = (fieldValue: any) => {
    const existingLevel1Index = _nestedRows.findIndex(
      (item: any) => sectionLevel in item
    );
    const currentActions = _nestedRows.map(
      (prevData: any, index: number) => prevData[sectionLevel]?.actions
    );

    if (existingLevel1Index !== -1) {
      console.log("FIELDDDSADD", fieldValue)
      _setNestedRows((prevData: any) => {
        const newData = [...prevData];
        newData[existingLevel1Index] = {
          [sectionLevel]: {
            fields: updateFieldByLevel(
              newData.find((x) => x[sectionLevel])[sectionLevel].fields,
              fieldValue?.changedId,
              {
                fieldName: fieldValue?.fieldName,
                fieldValue: typeof fieldValue?.input === "string"
                ? fieldValue?.input.trim()
                : fieldValue?.input,
                questionType: fieldValue?.questionType,
              }
            ),
            actions:
              _nestedRows?.find((x: { [x: string]: any }) => x[sectionLevel])[
                sectionLevel
              ]?.actions || [],
          },
        };
        return newData;
      });
    }
  }

  const openNotificationWithIcon = (type: any, message: any) => {
    api[type]({
      message: type,
      description: message,
    });
  };

  useEffect(() => {
    console.log("fieldValue", fieldValue);
    if (fieldValue) {
      fieldValueSetToNestedRows(fieldValue)
    }
    // Added validation, If the same level expression Changed other child has to be changed
    if (fieldValue?.fieldName === 'expression') {
      console.log("fieldValue Exp", fieldValue);
      let releatedFields = _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]?.fields;
      if (releatedFields) {
        let _collapseList = getAllChildrenIDs(
          findGroupId(
            _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
              ?.fields,
            fieldValue.changedId
          )
        );
        console.log("Expressions numbers", [..._collapseList, fieldValue.changedId]);
        _collapseList = [..._collapseList, fieldValue.changedId];
            const nearestIdParentObject = getNearestParentByItems(
            releatedFields,
            fieldValue.changedId
          );
          console.log(
            "nearestIdParentObject",
            nearestIdParentObject
          );

        // Changed expression to the nearest parent expression
        if (nearestIdParentObject) {
          const sameLevelInnerConditions = nearestIdParentObject?.innerConditions;
          console.log("sameLevelInnerConditions", sameLevelInnerConditions);
          let sameLevelIds = sameLevelInnerConditions.map((x: any) => x?.level);
          console.log("sameLevelIds", sameLevelIds);
          // sameLevelIds = [...sameLevelIds, nearestIdParentObject?.level]
          const fields = _updateExpressionByParentId(
            _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
              ?.fields,
            sameLevelIds,
            fieldValue.input
          );
          _setNestedRows(updateAllLevelArray(_nestedRows, sectionLevel, fields));
        } else {
          const parentExpressions = releatedFields?.map((lvl: any) => lvl?.expression);
          let parentIds = releatedFields?.map((lvl: any) => lvl?.level);
          
          if (releatedFields?.length > 1) {
            const firstExp = releatedFields[1]?.expression
            const initialEmptyFieldId = releatedFields[0]?.level;
            parentIds = parentIds?.filter((item: any) => item !== initialEmptyFieldId)
            console.log("parentExpressions", parentExpressions)
            console.log("parentExpressions firstExp", firstExp)
            console.log("parentExpressions firstExp", firstExp !== fieldValue.input)

            if (firstExp !== fieldValue.input && parentIds.length) {
              openNotificationWithIcon("error", "First Selected Expression cannot be changed!");
            const fields = _updateExpressionByParentId(
              _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
                ?.fields,
              parentIds,
              firstExp
            );
            _setNestedRows(updateAllLevelArray(_nestedRows, sectionLevel, fields));
            }
            
          }
        }
      }
    }
  }, [fieldValue]);

  useEffect(() => {
    if (fieldValue?.fieldName === "field") {
      const resss: any = fetchFieldData(fieldValue?.input);

      // When the field value get change need to empty value field
      let _fieldValue : any = fieldValue;
      _fieldValue.input = " "
      _fieldValue.fieldName = 'value'
      fieldValueSetToNestedRows(_fieldValue)
    }
  }, [fieldValue]);

  const addConditionToData = (
    data: any[],
    level: number,
    condition: any
  ): any[] => {
    return data.map((item) => {
      if (item.level === level) {
        // If the item matches the specified level and has nested conditions
        item.innerConditions.push(condition); // Add the newCondition to its innerConditions
      } else if (item.innerConditions.length > 0) {
        // If the item has nested conditions, recursively call the function on its innerConditions
        item.innerConditions = addConditionToData(
          item.innerConditions,
          level,
          condition
        );
      }
      return item;
    });
  };

  const _handleAddRow = (
    level: number,
    hasNested: boolean,
    expression: string = ""
  ) => {
    console.log("Clicked Level normal ", level);

    let releatedFields = _nestedRows?.find((x: any[]) => x[sectionLevel]);
    if (releatedFields) {
      releatedFields = releatedFields[sectionLevel].fields;
      const nearestIdParentObject = getNearestParentByItems(
        releatedFields,
        level
      );
      console.log(
        "Clicked Level normal nearestIdParentObject",
        nearestIdParentObject
      );

      let higestLevel;
      if (nearestIdParentObject?.innerConditions?.length)
        higestLevel = Math.max(
          ...nearestIdParentObject.innerConditions.map(
            (x: { level: any }) => x.level
          )
        );

      console.log("nearestId --------------> ", higestLevel);
      let newRow = {
        field: "",
        condition: "",
        value: "",
        sort: 1,
        level: higestLevel
          ? higestLevel + 1
          : idGenerator(level, hasNested, releatedFields),
        hasNested: false,
        innerConditions: [],
        collapse: false,
      };

      const parentIds = releatedFields.map((lvl: { level: any }) => lvl.level);
      console.log("parent Ids -----> ", parentIds);
      if (parentIds.includes(level)) {
        // _setNestedRows([..._nestedRows, newRow]);

        const existingLevel1Index = _nestedRows.findIndex(
          (item: any) => sectionLevel in item
        );
        console.log("existingLevel1Index", existingLevel1Index);
        if (existingLevel1Index !== -1) {
          const currentFields = _nestedRows.map(
            (prevData: any, index: number) => prevData[sectionLevel]?.actions
          );

          _setNestedRows((prevData: any) => {
            const newData = [...prevData];
            const newFields = [...releatedFields, newRow];
            console.log("prevData---->", prevData);

            console.log("newData---->", newData);

            console.log("newFields---->", newFields);

            newData[existingLevel1Index] = {
              [sectionLevel]: {
                fields: newFields,
                actions:
                  _nestedRows?.find(
                    (x: { [x: string]: any }) => x[sectionLevel]
                  )[sectionLevel]?.actions || [],
              },
            };
            return newData;
          });
        }
      } else {
        if (nearestIdParentObject) {
          setNestedRows(
            updateByParentId(
              releatedFields,
              nearestIdParentObject.level,
              newRow
            )
          );
        }
      }
    }
  };

  useEffect(() => {
    console.log("NESTED", _nestedRows);
    setShowActionOutput(
      _nestedRows
        ?.find((x: any[]) => x[sectionLevel])
        ?.[sectionLevel]?.actions?.map((obj: {}) => Object.keys(obj)[0])
        .join(" && ")
    );

    const item = _nestedRows?.find((x: any[]) => x[sectionLevel])?.[
      sectionLevel
    ]?.actions[0];
    console.log("checkBoxValueString item", item);

    const checkBoxValueString: string =
      item?.checkBoxValues
        ?.map(
          (obj: { [key: string]: { value: any } }) =>
            Object.values(obj)[0]?.value
        )
        .filter((value: any) => value)
        .join(" && ") || null;

    const minValue = item?.minMax?.minValue
      ? `min=${item?.minMax?.minValue}`
      : null;
    const maxValue = item?.minMax?.maxValue
      ? `max=${item?.minMax?.maxValue}`
      : null;

    let displayArray = [];
    if (minValue) displayArray.push(minValue);
    if (maxValue) displayArray.push(maxValue);
    if (checkBoxValueString) displayArray.push(checkBoxValueString);

    setShowActionOutput(displayArray.join(" && "));
    displayArray = [];
  }, [_nestedRows]);

  useEffect(() => {
    console.log("sectionLevelsectionLevel", sectionLevel);
    _setNestedRows(
      updateAllLevelArray(_nestedRows, sectionLevel, [
        {
          field: "",
          condition: "",
          value: "",
          sort: 1,
          level: 1,
          hasNested: isNested,
          expression: "",
          innerConditions: [],
          collapse: false,
          actions: [],
        },
      ])
    );
  }, [sectionLevel]);

  const collapseHandle = (number: any, collapse: boolean) => {
    let _collapseList = getAllChildrenIDs(
      findGroupId(
        _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
          ?.fields,
        number
      )
    );
    console.log("_collapseList number", [..._collapseList, number]);
    _collapseList = [..._collapseList, number];
    if (_collapseList && _collapseList.length) {
      if (
        _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]?.fields
          ?.length
      ) {
        const fields = _updateCollapseByParentId(
          _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
            ?.fields,
          _collapseList,
          collapse
        );
        console.log("FIELDSSSSSSSS", fields);
        _setNestedRows(updateAllLevelArray(_nestedRows, sectionLevel, fields));
      }
    }
  };

  const _updateCollapseByParentId = (
    _data: any,
    parentIds: any,
    collapse: any
  ) => {
    console.log("------------>", _data, parentIds, collapse);
    parentIds?.forEach((x: any) => {
      _data?.map((i: { level: any; innerConditions: any[]; collapse: any }) => {
        if (x === i.level) {
          i.collapse = collapse;
        } else {
          _updateCollapseByParentId(i?.innerConditions, parentIds, collapse);
        }
      });
    });

    console.log("------------ data>", _data);
    const newArr = _data ? [..._data] : [];
    return newArr;
  };

  const updateConditionCollapse = (
    conditions: Condition[],
    level: number,
    collapse: boolean
  ): Condition[] => {
    return conditions.map((condition) => {
      if (condition.level === level) {
        return { ...condition, collapse };
      }
      if (condition.innerConditions.length > 0) {
        const updatedInnerConditions = updateConditionCollapse(
          condition.innerConditions,
          level,
          collapse
        );
        return {
          ...condition,
          innerConditions: updatedInnerConditions,
          collapse,
        };
      }
      return condition;
    });
  };

  const fetchFieldData = async (questionId: any) => {
    try {
      // Make a request to the backend to fetch the data
      
      const questionDetails = dropDownQuestionList?.find(
        (x: any) => x.value === questionId
      );
      console.log("questionDetails", questionDetails);
      if (questionDetails?.questionType === dbConstants.questionTypes.listQuestion ) {
        setIsLoad(true);
        const response = await getListAnswersByQuestionId(
          questionDetails?.questionId
        );
        let dropDownData = [];
        if (response?.data?.entities) {
          dropDownData = response?.data.entities.map((x: any) => {
            return {
              label: x.gyde_answervalue,
              value: x.gyde_answervalue,
            };
          });
        }
        if (dropDownData && dropDownData?.length) {
          setAnswersDropDownData(dropDownData);
        }
        setIsLoad(false);
      }
     
      
    } catch (error) {
      console.error("Error fetching data:", error);
      // setSelectedFieldData([]); // Reset the data to an empty array in case of an error
    }
  };

  useEffect(() => {
    if (collapse.fieldId !== 0) {
      collapseHandle(collapse.fieldId, collapse.state);
    }
  }, [collapse]);

  const _handleDeleteRow = (level: any) => {
    let releatedFields = _nestedRows.find((x: any[]) => x[sectionLevel]);
    if (releatedFields) {
      _setNestedRows(
        updateAllLevelArray(
          _nestedRows,
          sectionLevel,
          removeByKey(releatedFields[sectionLevel].fields, level)
        )
      );
    }
  };

  useEffect(() => {
    if (questionList && questionList.length) {
      const listQuestions = questionList?.filter((x: any) => x["questionType"] === dbConstants?.questionTypes?.listQuestion)?.map((x: any) => x?.value);
      let releatedFields = _nestedRows?.find((x: any[]) => x[sectionLevel]);
      if (releatedFields) {
        const fields = releatedFields[sectionLevel]?.fields?.map((x: any) => x?.field);
        const matchedValues = listQuestions?.filter((value: any) => fields?.includes(value));
        console.log("matchedValues", matchedValues);
        console.log("matchedValues listQuestions", listQuestions);
        console.log("matchedValues fields", fields);

        if (matchedValues && matchedValues?.length) setListQuestionIds(matchedValues);
      }
      setDropDownQuestionList(questionList?.filter((quesNme: any) =>
        quesNme &&
        quesNme["questionType"] !== "Grid" &&
        quesNme["questionType"] !== "Header"
      ))
    }
  }, [questionList]);

  useEffect(() => {
    console.log("setListQuestionIds", listQuestionIds)
    if (listQuestionIds && listQuestionIds?.length) {
      setListQuestionLoading(true);
      fetchQuestionDetails(listQuestionIds);
    }
  }, [listQuestionIds]);


  // useEffect(() => {
  //   // const questionList = 
  //   let releatedFields = _nestedRows?.find((x: any[]) => x[sectionLevel]);
  //   if (releatedFields) {
  //     console.log("releatedFieldsreleatedFields", releatedFields)
  //     const feilds = releatedFields[sectionLevel]?.fields?.map((x: any) => x?.field)
  //     console.log("feildsfeilds", feilds);
      
  //     if (feilds && feilds?.length) fetchQuestionDetails(feilds)
  //   }
  // }, [questionList]);


  const fetchQuestionDetails = async (questionIds: any) => {
    const questionListArray: any = [];
  
    await Promise.all(
      questionIds?.map(async (questionId: any) => {
        const questionDetails = questionList?.find(
          (x: any) => x.value === questionId
        );
  
        if (questionDetails?.questionType === dbConstants.questionTypes.listQuestion) {
          setIsLoad(true);
  
          const response = await getListAnswersByQuestionId(
            questionDetails?.questionId
          );
  
          let dropDownData = [];
          if (response?.data?.entities) {
            dropDownData = response?.data.entities.map((x: any) => ({
              label: x.gyde_answervalue,
              value: x.gyde_answervalue,
            }));
            questionListArray.push({ questionId, listAnswers: dropDownData });
            setIsLoad(false);
          }
        }
      })
    );
  
    if (questionListArray && questionListArray?.length) {
      setListAnsersWithQuestionIds(questionListArray);
      
    }
    setListQuestionLoading(false);
  };
  

  useEffect(() => {
    console.log("listAnsersWithQuestionIds", listAnsersWithQuestionIds);
  }, [listAnsersWithQuestionIds])

  useEffect(() => {
    console.log("answersDropDownData", answersDropDownData);
  }, [answersDropDownData])
  
  const renderNestedConditions = (conditions: any[], marginLeft = 0) => {
    console.log("conditions----->", conditions);

    if (conditions && conditions?.length) {
      
      return conditions.map((condition: any, index: any) => {
        // fetchFieldData(condition?.field);
        return <>
          <div key={condition.level}>
            {!condition?.collapse ? (
              <div className="collapse-wrap">
                <div className="flex-col-start">
                  <div className="flex-row-start">
                    {!condition.state && (
                      <CaretDownOutlined
                        style={{ color: "#0093FE" }}
                        onClick={() =>
                          setCollapse({
                            state: true,
                            fieldId: condition?.level,
                          })
                        }
                      />
                    )}
                    <div className="validation-text"></div>
                  </div>
                  <div className="flex-row-start mb-15">
                    <Button
                      className="mr-10 btn-default"
                      onClick={() =>
                        _handleAddRow(condition?.level, false, "AND")
                      }
                      disabled={suerveyIsPublished}
                    >
                      {"+ " + languageConstants?.ExpressionBuilder_AddButton}
                    </Button>
                    <Button
                      className="btn-default"
                      onClick={() =>
                        _handleAddNestedRow(condition?.level, true, "AND")
                      }
                      disabled={tabType === dbConstants?.tabTypes?.defaultValueTab ? true : suerveyIsPublished ? suerveyIsPublished : condition?.level === 1 ? true : false}
                    >
                      {"+ " + languageConstants?.ExpressionBuilder_AddNestedButton}
                    </Button>
                  </div>
                </div>
                <div className="loop">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    <div className="mr-20">
                      <div className="condition-label">{languageConstants?.ExpressionBuilder_AndorLabel} </div>
                      <DropDown
                        dropDownData={expressionSampleData}
                        isDisabled={suerveyIsPublished ? suerveyIsPublished : condition?.level === 1 ? true : false}
                        setExpression={setFieldValue}
                        changedId={condition?.level}
                        fieldName={"expression"}
                        selectedValue={condition?.expression}
                      />{" "}
                    </div>

                    <div className="mr-20">
                      <div className="condition-label">{languageConstants?.ExpressionBuilder_FieldLabel} </div>
                      <FieldInput
                        sampleData={
                          dropDownQuestionList && dropDownQuestionList.length && dropDownQuestionList?.filter((x: { value: any; }) => x?.value !== currentQuestionDetails?.value)
                          
                        }
                        selectedValue={condition?.field}
                        overrideSearch={false}
                        setFieldValue={setFieldValue}
                        changedId={condition?.level}
                        fieldName={"field"}
                        isDisabled={suerveyIsPublished}
                      />{" "}
                    </div>
                    <div className="mr-20">
                      <div className="condition-label">{languageConstants?.ExpressionBuilder_OperatorLabel} </div>
                      {dropDownQuestionList?.find(
                        (x: { value: string }) => x?.value === condition?.field
                      )?.questionType === dbConstants.questionTypes.stringQuestion || dropDownQuestionList?.find(
                        (x: { value: string }) => x?.value === condition?.field
                      )?.questionType === dbConstants.questionTypes.listQuestion ?
                        <DropDown
                          dropDownData={operationalSampleData[0]?.options?.filter((item: { value: string; }) => item?.value === "==" || item?.value === "!=")}
                          isDisabled={suerveyIsPublished ? suerveyIsPublished : false}
                          setExpression={setFieldValue}
                          changedId={condition?.level}
                          fieldName={"condition"}
                          selectedValue={condition?.condition}
                        /> :
                        dropDownQuestionList?.find(
                          (x: { value: string }) => x?.value === condition?.field
                        )?.questionType === dbConstants.questionTypes.dateTimeQuestion ?
                          <DropDown
                            dropDownData={operationalSampleData[0]?.options?.filter((item: { value: string; }) => item?.value === "==")}
                            isDisabled={suerveyIsPublished ? suerveyIsPublished : false}
                            setExpression={setFieldValue}
                            changedId={condition?.level}
                            fieldName={"condition"}
                            selectedValue={condition?.condition}
                          />
                        :
                        <DropDown
                          dropDownData={operationalSampleData}
                          isDisabled={suerveyIsPublished ? suerveyIsPublished : false}
                          setExpression={setFieldValue}
                          changedId={condition?.level}
                          fieldName={"condition"}
                          selectedValue={condition?.condition}
                        />
                      }
                    
                    </div>
                    
                    <div className="mr-20">
                      <div className="condition-label">{languageConstants?.ExpressionBuilder_ValueLabel}  </div>
                    {!isLoad ? <div> 
                      
                      {dropDownQuestionList?.find(
                        (x: { value: string }) => x?.value === condition?.field
                      )?.questionType === dbConstants.questionTypes.numericQuestion ? (
                        <NumberInputField
                          selectedValue={condition?.value}
                          handleNumberChange={{}}
                          defaultDisabled={suerveyIsPublished ? suerveyIsPublished : false}
                          setInputNumber={setFieldValue}
                          changedId={condition?.level}
                          fieldName={"value"}
                          validatingSuccess={true}
                        />
                      ) : dropDownQuestionList?.find(
                        (x: { value: string }) => x?.value === condition?.field
                      )?.questionType === dbConstants.questionTypes.stringQuestion ? (
                        <FieldStringInputProps
                          sampleData={
                            dropDownQuestionList && dropDownQuestionList.length && dropDownQuestionList
                          }
                          selectedValue={condition?.value}
                          overrideSearch={false}
                          setFieldValue={setFieldValue}
                          changedId={condition?.level}
                          fieldName={"value"}
                          isDisabled={suerveyIsPublished}
                        />
                      ) : dropDownQuestionList?.find(
                        (x: { value: string }) => x?.value === condition?.field
                      )?.questionType === dbConstants.questionTypes.dateTimeQuestion ? (
                        <DatePickerCustom
                          isDisabled={suerveyIsPublished ? suerveyIsPublished : false}
                          setFieldValue={setFieldValue}
                          changedId={condition?.level}
                          fieldName={"value"}
                          selectedValue={condition?.value ? condition?.value : moment()}
                    
                        />
                      ) : dropDownQuestionList?.find(
                        (x: { value: string }) => x?.value === condition?.field
                      )?.questionType === dbConstants.questionTypes.listQuestion ? (
                        <ListDropDown
                                    dropDownData={{}}
                                    isDisabled={suerveyIsPublished ? suerveyIsPublished : false}
                                    setFieldValue={setFieldValue}
                                    changedId={condition?.level}
                                    fieldName={"value"}
                                    selectedValue={condition?.value}
                                    listDropDownData={
                                      answersDropDownData.concat(listAnsersWithQuestionIds?.find((x: any) => x?.questionId === condition?.field)?.listAnswers)?.filter(x => x)
                        }
                        />
                      ) : (
                        <FieldStringInputProps
                          sampleData={
                            dropDownQuestionList && dropDownQuestionList.length && dropDownQuestionList
                          }
                          selectedValue={condition?.value}
                          overrideSearch={false}
                          setFieldValue={setFieldValue}
                          changedId={condition?.level}
                          fieldName={"value"}
                          isDisabled={suerveyIsPublished}
                        />
                      )}

                      </div> : <div>
          <Space size="middle">
            <Spin />
          </Space>
        </div>
                    }
                    
                     
                    </div>

                    <div className="custom-btn-wrap">
                      {
                        (suerveyIsPublished || condition?.level === 1) ?
                          // <img
                          //   // src={imageUrls?.imageUrl} alt="icon"
                          //   width={'15px'}
                          //   height={'15px'}
                          // >
                          // </img>
                          <></>
                          :
                          <div className="flex-wrap">  
                            <img
                            src={imageUrls?.imageUrl} alt="icon"
                            onClick={() => _handleDeleteRow(condition?.level)}
                            height={'15px'}
                            />
                            <span className="remove-text">{languageConstants?.ExpressionBuilder_RemoveButton} </span>
                          </div>
                         
                      }
                      {/* <Button
                      className="btn-default"
                      onClick={() => _handleDeleteRow(condition?.level)}
                      disabled={suerveyIsPublished ? suerveyIsPublished : condition?.level === 1 ? true : false}
                    >
                     
                      Remove
                      <img
                        src={imageUrls.imageUrl} alt="icon"
                        onClick={() => _handleDeleteRow(condition?.level)}
                        disabled={suerveyIsPublished ? suerveyIsPublished : condition?.level === 1 ? true : false}
                      />
                    </Button> */}
                      {/* <a><img src={deleteImg} className="delete-img" alt="delete"/></a> */}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-row-start mb-10 collapse-wrap custom-width">
                {!condition.state && (
                  <div>
                    <CaretRightOutlined
                      style={{ color: "#0093FE" }}
                      onClick={() =>
                        setCollapse({
                          state: false,
                          fieldId: condition?.level,
                        })
                      }
                    />
                    <div className="condition-label">
                      <DropDown
                        dropDownData={expressionSampleData}
                        isDisabled={suerveyIsPublished ? suerveyIsPublished : condition?.level === 1 ? true : false}
                        setExpression={setFieldValue}
                        changedId={condition?.level}
                        fieldName={"expression"}
                        selectedValue={condition?.expression}
                      />{" "}
                    </div>
                  </div>
                )}
                <div className="validation-text"></div>
              </div>
            )}

            {/* {condition.hasNested && (
            <div style={{ paddingLeft: "30px" }}>
              {renderNestedConditions(
                condition.innerConditions,
                marginLeft + 5
              )}
            </div>
          )} */}
            <div style={{ paddingLeft: "30px" }}>
              {
                !listQuestionLoading && renderNestedConditions(condition?.innerConditions, marginLeft + 5)
              }
              
            </div>
          </div>
        </>  
    });
    }
    // }
    // }
  };
  useEffect(() => {
    console.log("isApiDataLoaded isLoad", isLoad)
  }, [isLoad])
  return (
    <div>
            {contextHolder}
        <div>
          <div className="flex-wrap mb-10">
              <div className="text-left">
                {" "}
                {_nestedRows &&
                  _nestedRows?.length &&
                  "if(" +
                    generateOutputString(
                      _nestedRows?.find((x: any[]) => x[sectionLevel])?.[
                        sectionLevel
                      ]?.fields || []
                    ) +
                ")"}{" "}
              
              <div> 
              {" "}
                {showActionOutput && "{ " + showActionOutput + " }"}{" "}
              </div>
            </div>
            

            <div>
             
                
              <div>

              { suerveyIsPublished ?
                <img
                  src={imageUrls?.imageUrl} alt="icon"
                  height={'15px'}
                >
                  </img> :
                  <div className="flex-wrap">
                    <img
                        src={imageUrls?.imageUrl} alt="icon"
                      height={'15px'}
                      onClick={() => handleSectionRemove(sectionLevel, tabType)}
                        /> 
                    <span className="remove-text">{languageConstants?.ExpressionBuilder_RemoveButton} </span>
                  </div>
                }
                
                  {/* <Button
                    className="btn-default"
                  onClick={() => handleSectionRemove(sectionLevel)}
                  disabled={suerveyIsPublished}
                  >
                    {" "}
                    Remove Section
                  </Button> */}
                </div>
              </div>
         </div>
          {_nestedRows &&
            _nestedRows?.length &&
            renderNestedConditions(
              _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
                ?.fields || []
            )}
        
        </div>
    
    </div>
  );
};

export default RowContainer;
