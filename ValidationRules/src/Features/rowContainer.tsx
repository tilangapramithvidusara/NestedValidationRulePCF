import React, { useEffect, useState } from "react";
import DropDown from "../Components/commonComponents/DropDown";
import FieldInput from "../Components/commonComponents/FieldInput";
import { Button } from "antd";
import { expressionSampleData } from "../SampleData/expressionSampleData";
import { operationalSampleData } from "../SampleData/operationalSampleData";
import { sampleInputQuestion } from "../SampleData/sampleInputQuestion";
import NumberInputField from "../Components/commonComponents/NumberInputField";
// import deleteImg from "../assets/delete.png";

import {
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
}) => {
  const [nestedRows, setNestedRows] = useState<React.ReactNode[]>([]);
  const [collapse, setCollapse] = useState<any>({ state: false, fieldId: 0 });
  const [fieldValue, setFieldValue] = useState<any>();
  const [showActionOutput, setShowActionOutput] = useState<any>();
  const [questionType, setQuestionType] = useState<any>();
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

  // This function is used to if the object has innerCondition at least one obj hasNested need to true
  // const updateHasNested = (data: Condition[]) => {
  //   data?.forEach((condition) => {
  //     if (condition?.innerConditions?.length > 0) {
  //       condition.hasNested = true;
  //     }
  //     updateHasNested(condition?.innerConditions);
  //   });
  // };

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
      newKey = highestLevel + 1;
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
    let releatedFields = _nestedRows.find((x: any[]) => x[sectionLevel]);
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
        hasNested: hasNested,
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

  useEffect(() => {
    console.log("fieldValuefieldValuefieldValue", fieldValue);
    if (fieldValue) {
      const existingLevel1Index = _nestedRows.findIndex(
        (item: any) => sectionLevel in item
      );
      const currentActions = _nestedRows.map(
        (prevData: any, index: number) => prevData[sectionLevel]?.actions
      );

      if (existingLevel1Index !== -1) {
        _setNestedRows((prevData: any) => {
          const newData = [...prevData];
          console.log("LLLLLLLL", newData);
          newData[existingLevel1Index] = {
            [sectionLevel]: {
              fields: updateFieldByLevel(
                newData.find((x) => x[sectionLevel])[sectionLevel].fields,
                fieldValue?.changedId,
                {
                  fieldName: fieldValue?.fieldName,
                  fieldValue: fieldValue.input,
                  questionType: fieldValue?.questionType
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
    // );
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

    let releatedFields = _nestedRows.find((x: any[]) => x[sectionLevel]);
    if (releatedFields) {
      releatedFields = releatedFields[sectionLevel].fields;
      const nearestIdParentObject = getNearestParentByItems(
        releatedFields,
        level
      );
      console.log("Clicked Level normal nearestIdParentObject", nearestIdParentObject);

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
            console.log(
              "prevData---->",
              prevData
            );

            console.log(
              "newData---->",
              newData
            );

            console.log(
              "newFields---->",
              newFields
            );

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
    console.log("Collapse number", number);
    console.log("Collapse number", collapse);

    // handleLevelCollapse(number, collapse);

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

  useEffect(() => {
    console.log("DDDDDggggg", collapse);
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


  const renderNestedConditions = (conditions: any[], marginLeft = 0) => {
    console.log("conditions----->", conditions);
    if (conditions && conditions?.length) {
      return conditions.map((condition: any) => (
        <div key={condition.level}>
          {/* <div style={{ display: "flex", marginBottom: "2%" }}>
          {
            !collapse.state ? <CaretDownOutlined
              style={{color:"#0093FE"}}
            onClick={() =>
              setCollapse({
                state: true,
                fieldId: condition?.level,
              })
            }
            /> : <CaretRightOutlined
            style={{color:"#0093FE"}}
            onClick={() =>
              setCollapse({
                state: false,
                fieldId: condition?.level,
              })
            }
              />
          }
        </div> */}

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
                    onClick={() => _handleAddRow(condition?.level, false, "AND")}
                  >
                    + Add
                  </Button>
                  <Button
                    className="btn-default"
                    onClick={() =>
                      _handleAddNestedRow(condition?.level, true, "AND")
                    }
                  >
                    + Add Nested
                  </Button>
                </div>
              </div>
              <div className="loop">
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  <div className="condition-label">And/Or </div>
                  <div className="condition-label">Field </div>
                  <div className="condition-label">Operator</div>
                  <div className="condition-label">Value </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="condition-label">
                    <DropDown
                      dropDownData={expressionSampleData}
                      isDisabled={condition?.level === 1 ? true : false}
                      setExpression={setFieldValue}
                      changedId={condition?.level}
                      fieldName={"expression"}
                      selectedValue={condition?.expression}
                    />{" "}
                  </div>

                  <div className="condition-label">
                    <FieldInput
                      sampleData={
                        questionList && questionList.length
                          ? questionList
                          : sampleInputQuestion
                      }
                      selectedValue={condition?.field}
                      overrideSearch={false}
                      setFieldValue={setFieldValue}
                      changedId={condition?.level}
                      fieldName={"field"}
                    />{" "}
                  </div>
                  <div className="condition-label">
                    <DropDown
                      dropDownData={operationalSampleData}
                      isDisabled={false}
                      setExpression={setFieldValue}
                      changedId={condition?.level}
                      fieldName={"condition"}
                      selectedValue={condition?.condition}
                    />
                  </div>
                  <div className="condition-label">
                    {
                      questionList.find((x: { value: string; }) => x.value === condition?.field)?.questionType === "numeric" ?
                        <NumberInputField
                          selectedValue={condition?.value}
                          handleNumberChange={{}}
                          defaultDisabled={false}
                          setInputNumber={setFieldValue}
                          changedId={condition?.level}
                          fieldName={"value"}
                        /> : questionList.find((x: { value: string; }) => x.value === condition?.field)?.questionType === "text" ?
                          <FieldInput
                            sampleData={
                              questionList && questionList.length
                                ? questionList
                                : sampleInputQuestion
                            }
                            selectedValue={condition?.field}
                            overrideSearch={false}
                            setFieldValue={setFieldValue}
                            changedId={condition?.level}
                            fieldName={"value"}
                          /> :
                          <NumberInputField
                            selectedValue={condition?.value}
                            handleNumberChange={{}}
                            defaultDisabled={false}
                            setInputNumber={setFieldValue}
                            changedId={condition?.level}
                            fieldName={"value"}
                        />
                    }
                  </div>
                  
                  <div className="condition-label">
                    <Button
                      className="btn-default"
                      onClick={() => _handleDeleteRow(condition?.level)}
                      disabled={condition?.level === 1 ? true : false}
                    >
                      {" "}
                      Remove
                    </Button>
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
                      isDisabled={condition?.level === 1 ? true : false}
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
            {renderNestedConditions(condition?.innerConditions, marginLeft + 5)}
          </div>
        </div>
      ));
    }
    // }
    // }
  };
  return (
    <div>
      <div style={{ textAlign: "left" }}>
        {" "}
        {
          _nestedRows && _nestedRows?.length && "if(" + generateOutputString(
            _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
              ?.fields || []
          ) + ")" 
          }{" "}
      </div>
      <div style={{ textAlign: "left", marginBottom: "10px" }}>
        {" "}
        { showActionOutput && ("{ " + showActionOutput + " }") }{" "}
      </div>
      {_nestedRows && _nestedRows?.length && renderNestedConditions(
        _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
          ?.fields || []
      )}
    </div>
  );
};

export default RowContainer;


