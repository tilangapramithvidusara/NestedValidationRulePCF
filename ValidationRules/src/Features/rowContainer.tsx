import React, { useEffect, useState } from "react";
import DropDown from "../Components/commonComponents/DropDown";
import FieldInput from "../Components/commonComponents/FieldInput";
import { Button } from "antd";
import { expressionSampleData } from "../SampleData/expressionSampleData";
import { operationalSampleData } from "../SampleData/operationalSampleData";
import { sampleInputQuestion } from "../SampleData/sampleInputQuestion";
import NumberInputField from "../Components/commonComponents/NumberInputField";

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
}) => {
  const [nestedRows, setNestedRows] = useState<React.ReactNode[]>([]);
  const [indexLevel, setIndexLevel] = useState<any>(1);
  const [collapse, setCollapse] = useState<any>(false);

  const [_nestedRows, _setNestedRows] = useState<any>([
    // {
    //    "field":"",
    //    "condition":"",
    //    "value":"",
    //    "level":1,
    //    "hasNested":true,
    //    "expression":"",
    //    "collapse":false,
    //    "innerConditions":[
    //       {
    //          "field":"",
    //          "condition":"",
    //          "value":"",
    //          "sort":1,
    //          "level":11,
    //          "hasNested":true,
    //          "collapse":false,
    //          "innerConditions":[
    //             {
    //                "field":"",
    //                "condition":"",
    //                "value":"",
    //                "sort":1,
    //                "level":111,
    //                "hasNested":true,
    //                "collapse":true,
    //                "innerConditions":[
    //                   {
    //                      "field":"",
    //                      "condition":"",
    //                      "value":"",
    //                      "sort":1,
    //                      "level":11111,
    //                      "hasNested":true,
    //                      "collapse":false,
    //                      "innerConditions":[
                            
    //                      ]
    //                   }
    //                ]
    //             },
    //             {
    //                "field":"",
    //                "condition":"",
    //                "value":"",
    //                "sort":1,
    //                "level":111,
    //                "hasNested":true,
    //                "collapse":true,
    //                "innerConditions":[
                      
    //                ]
    //             }
    //          ]
    //       }
    //    ]
    // },
    // {
    //    "field":"",
    //    "condition":"",
    //    "value":"",
    //    "sort":1,
    //    "level":2,
    //    "hasNested":false,
    //    "collapse":false,
    //    "innerConditions":[
          
    //    ]
    // }
 ]);

  function containsOnlyOneDigit(str: string) {
    return /^\d$/.test(str);
  }

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
  const updateHasNested = (data: Condition[]) => {
    data.forEach((condition) => {
      if (condition.innerConditions.length > 0) {
        condition.hasNested = true;
      }
      updateHasNested(condition.innerConditions);
    });
  };

  function addObjectToParentLevel(
    conditionArray: any[],
    newObj: any,
    parentLevel: any
  ) {
    if (containsOnlyOneDigit(parentLevel.toString()) && !newObj.hasNested) {
      const updatedArray = [...conditionArray, newObj];
      _setNestedRows(updatedArray);
    } else {
      const parentCondition = findConditionByLevel(parentLevel, conditionArray);

      if (parentCondition) {
        if (newObj.hasNested) {
          const updatedConditions = [
            ...parentCondition.innerConditions,
            newObj,
          ];
          parentCondition.innerConditions = updatedConditions;
        } else {
          const updatedConditions = [...conditionArray, newObj];
          _setNestedRows(updatedConditions);
        }

        const updatedData = [...conditionArray];

        updateHasNested(updatedData);
        _setNestedRows(updatedData);
      } else {
        console.log("Parent condition not found!");
      }
    }
  }

  const idGenerator = (parentLevel: number, hasNested: boolean) => {
    let newKey;
    if (hasNested) {
      newKey = parseInt(parentLevel + `1`);
    } else {
      const highestLevel = _nestedRows.reduce(
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
    nestedLevel: number,
    hasNested: boolean,
    expression: string = ""
  ) => {
    console.log("Clicked Level ", level);

    const newKey = idGenerator(level, hasNested);
    let newRow = {
      field: "",
      condition: "",
      value: "",
      sort: 1,
      level: newKey,
      hasNested: hasNested,
      innerConditions: [],
      collapse: false
    };

    addObjectToParentLevel(_nestedRows, newRow, level);
  };



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
    nestedLevel: number,
    hasNested: boolean,
    expression: string = ""
  ) => {
    console.log("Clicked Level ", level);

    const newKey = idGenerator(level, hasNested);
    let newRow = {
      field: "",
      condition: "",
      value: "",
      sort: 1,
      level: newKey+100,
      hasNested: hasNested,
      innerConditions: [],
      collapse: false
    };

    // addObjectToParentLevel(_nestedRows, newRow, level);
    const updatedData = addConditionToData(_nestedRows, level, newRow);
    _setNestedRows(updatedData);
  };

  useEffect(() => {
    console.log("NESTED", _nestedRows);
  }, [_nestedRows]);

  useEffect(() => {
    console.log("SectionLevell");
    _setNestedRows((prevNestedRows: any) => [
      ...prevNestedRows,
      {
        field: "",
        condition: "",
        value: "",
        level: sectionLevel,
        hasNested: true,
        expression: "",
        innerConditions: [],
        collapse: false
      },
    ]);
  }, [sectionLevel]);

  useEffect(() => {
    console.log("rowData", rowData);
  }, [rowData]);

  const collapseHandle = (number: any, collapse: boolean) => {
    console.log("Collapse number", number);
    console.log("Collapse number", collapse);

    handleLevelCollapse(number, collapse)
  }


  const handleLevelCollapse = (level: number, collapse: boolean) => {
    _setNestedRows(updateConditionCollapse(_nestedRows, level, collapse));
  };
  
  const updateConditionCollapse = (conditions: any, level: number, collapse: boolean): Condition[] => {
    return conditions.map((condition: any) => {
      if (condition.level === level) {
        return { ...condition, collapse };
      }
      if (condition.innerConditions.length > 0) {
        const updatedInnerConditions = updateConditionCollapse(condition.innerConditions, level, collapse);
        return { ...condition, innerConditions: updatedInnerConditions };
      }
      return condition;
    });
  };
  
  const renderNestedConditions = (conditions: any[], marginLeft = 0) => {
    console.log("conditions----->", conditions);
    if (conditions && conditions.length) {
      return conditions.map((condition: any) => (
        <div key={condition.level}>
          <div style={{ display: "flex", marginBottom: "2%" }}>
            <Button onClick={() => collapseHandle(condition.level, true)}>Collapse</Button>
            {/* <Button onClick={() => collapseHandle(condition.level, false)}>Expand</Button> */}
          </div>
          
          {
            !condition.collapse ? <div>
            <div style={{ display: "flex", marginBottom: "3%" }}>
              
              <Button
                className="mr-10 btn-default"
                onClick={() =>
                  _handleAddNestedRow(
                    condition.level,
                    condition.level + 1,
                    false,
                    "AND"
                  )
                }
              >
                + Add
              </Button>
              <Button
                className="btn-default"
                onClick={() =>
                  _handleAddNestedRow(
                    condition.level,
                    condition.level + 1,
                    true,
                    "AND"
                  )
                }
              >
                + Add Nested
              </Button>
            </div>
            <div className="loop">
              <div
                style={{ marginBottom: "1%", marginTop: "2%", display: "flex" }}
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
                    <DropDown dropDownData={expressionSampleData} isDisabled={condition.level === 1 ? true : false} />{" "}
                </div>
                
                <div className="condition-label">
                  <FieldInput
                    sampleData={sampleInputQuestion}
                    selectedValue={condition.field}
                    overrideSearch={false}
                  />{" "}
                </div>
                <div className="condition-label">
                  <DropDown dropDownData={operationalSampleData} isDisabled={false} />
                </div>
                <div className="condition-label">
                  <NumberInputField
                    selectedValue={{}}
                    handleNumberChange={{}}
                    defaultDisabled={false}
                  />{" "}
                </div>
              </div>
              </div>
            </div> : <div> </div>
          }

          {condition.hasNested && (
            <div style={{ paddingLeft: "30px" }}>
              {renderNestedConditions(
                condition.innerConditions,
                marginLeft + 5
              )}
            </div>
          )}
        </div>
      ));
    }
  };

  return <div>{renderNestedConditions(_nestedRows)}</div>;
};

export default RowContainer;
