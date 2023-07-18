import React, { useEffect, useState } from "react";
import DropDown from "../Components/commonComponents/DropDown";
import FieldInput from "../Components/commonComponents/FieldInput";
import { Button } from "antd";
import { expressionSampleData } from "../SampleData/expressionSampleData";
import { operationalSampleData } from "../SampleData/operationalSampleData";
import { sampleInputQuestion } from "../SampleData/sampleInputQuestion";
import NumberInputField from "../Components/commonComponents/NumberInputField";
import {
  generateOutputString,
  getNearestParentByItems,
  getParentIds,
  removeByKey,
  updateAllLevelArray,
  updateByParentId,
  updateFieldByLevel,
} from "../Utils/utilsHelper";
interface NestedRowProps {
  children: React.ReactNode;
}

interface TableRowProps {
  rowIndex: number;
  rowData: any;
  setRowData: any;
  addRow: any;
  addNestedRow: any;
  sectionLevel: number;
  setConditionData: any;
  _setNestedRows: any;
  _nestedRows: any;
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
  addNestedRow,
  sectionLevel,
  setConditionData,
  _setNestedRows,
  _nestedRows,
}) => {
  const [nestedRows, setNestedRows] = useState<React.ReactNode[]>([]);
  const [indexLevel, setIndexLevel] = useState<any>(1);
  const [collapse, setCollapse] = useState<any>({ state: false, fieldId: 0 });
  const [parentId, setParentId] = useState<number>(0);
  const [fieldValue, setFieldValue] = useState<any>();
  const [showActionOutput, setShowActionOutput] = useState<any>();

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
    console.log("KKKKKKKKKKK", releatedFields);
    if (releatedFields) {
      let newRow = {
        field: "",
        condition: "",
        value: "",
        sort: 1,
        level: idGenerator(level, hasNested, []),
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
      let newRow = {
        field: "",
        condition: "",
        value: "",
        sort: 1,
        level: idGenerator(level, hasNested, releatedFields),
        hasNested: false,
        innerConditions: [],
        collapse: false,
      };

      const _parentIds = getParentIds(releatedFields[0], level);
      if (_parentIds && _parentIds.length) setParentId(_parentIds[0]);

      const parentIds = releatedFields.map((lvl: { level: any }) => lvl.level);
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
            console.log("LLLLLLLL", newData);
            const newFields = [...releatedFields, newRow];
            console.log(
              "newData[existingLevel1Index]",
              newData[existingLevel1Index]
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
        const nearestId = getNearestParentByItems(releatedFields, level);
        if (nearestId) {
          setNestedRows(
            updateByParentId(releatedFields, nearestId.level, newRow)
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
        .map(
          (obj: { [key: string]: { value: any } }) =>
            Object.values(obj)[0]?.value
        )
        .filter((value: any) => value)
        .join(" && ") || null;
    console.log("checkBoxValueString", checkBoxValueString);

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

    // if (minValue != null ) {
    //   minMaxString = ` min=${minValue}"`;
    // }
    // if (maxValue != null) {
    //   minMaxString = ` max="${maxValue}"`;
    // }
    // if(minValue && maxValue) minMaxString = `min=${minValue} && max="${maxValue}"`;

    setShowActionOutput(displayArray.join(" && "));
    displayArray = [];
  }, [_nestedRows]);

  useEffect(() => {
    console.log("DDDDDDDD", showActionOutput);
  }, [showActionOutput]);

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
          hasNested: false,
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
    _setNestedRows(updateConditionCollapse(_nestedRows, number, collapse));
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
    // if (conditions && conditions.length) {
    // let releatedFields = conditions.find((x) => x[sectionLevel]);
    // if (releatedFields) {
    //   releatedFields = releatedFields[sectionLevel].fields;
    return conditions.map((condition: any) => (
      <div key={condition.level}>
        <div style={{ display: "flex", marginBottom: "2%" }}>
          {/* <Button
                onClick={() =>
                  setCollapse({
                    state: !condition.collapse?.state,
                    fieldId: condition?.level,
                  })
                }
              >
                Collapse
              </Button> */}
          {/* <Button onClick={() => collapseHandle(condition.level, false)}>Expand</Button> */}
        </div>

        {!condition?.collapse ? (
          <div>
            <div style={{ display: "flex", marginBottom: "3%" }}>
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
            <div className="loop">
              <div
                style={{
                  marginBottom: "1%",
                  marginTop: "2%",
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
                  marginBottom: "3%",
                }}
              >
                <div className="condition-label">
                  <DropDown
                    dropDownData={expressionSampleData}
                    isDisabled={condition?.level === 1 ? true : false}
                    setExpression={setFieldValue}
                    changedId={condition?.level}
                    fieldName={"expression"}
                  />{" "}
                </div>

                <div className="condition-label">
                  <FieldInput
                    sampleData={sampleInputQuestion}
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
                  />
                </div>
                <div className="condition-label">
                  <NumberInputField
                    selectedValue={{}}
                    handleNumberChange={{}}
                    defaultDisabled={false}
                    setInputNumber={setFieldValue}
                    changedId={condition?.level}
                    fieldName={"value"}
                  />{" "}
                </div>
                <div className="condition-label">
                  <Button
                    className="btn-default"
                    onClick={() => _handleDeleteRow(condition?.level)}
                  >
                    {" "}
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div> </div>
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
    // }
    // }
  };
  // return<div><div> {generateOutputString(_nestedRows)}</div>{}</div>;
  return (
    <div>
      <div style={{ textAlign: "left" }}>
        {" "}
        {"if(" +
          generateOutputString(
            _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
              ?.fields || []
          ) +
          ")"}{" "}
      </div>
      <div style={{ textAlign: "left" }}>
        {" "}
        {"{ " + showActionOutput + " }"}{" "}
      </div>
      {renderNestedConditions(
        _nestedRows?.find((x: any[]) => x[sectionLevel])?.[sectionLevel]
          ?.fields || []
      )}
    </div>
  );
};

export default RowContainer;
