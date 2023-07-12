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

const RowContainer: React.FC<TableRowProps> = ({
  rowIndex,
  rowData,
  setRowData,
  addRow,
  addNestedRow,
  sectionLevel
}) => {
  const [nestedRows, setNestedRows] = useState<React.ReactNode[]>([]);
  const [indexLevel, setIndexLevel] = useState<any>(1);
  const [_nestedRows, _setNestedRows] = useState<any>([
    // {
    // "field": "Question01",
    // "condition": "",
    // "value": "",
    // "sort": 1,
    // "level": 1,
    // "hasNested": true,
    // "expression": "",
    // "innerConditions": 
    //     [
    //         {
    //             "field":  "Question 01 01",
    //             "condition": "",
    //             "value": "",
    //             "sort": 1,
    //             "level": 11,
    //             "hasNested": true,
    //             "expression": "AND",
    //             "innerConditions": [
    //                 {
    //                     "field": "Question 01 01 01",
    //                     "condition": "",
    //                     "value": "",
    //                     "sort": 1,
    //                     "hasNested": false,
    //                     "level": 111,
    //                     "expression": ""
    //                 },
    //                 {
    //                     "field": "Question 01 01 02",
    //                     "condition": "",
    //                     "value": "",
    //                     "sort": 1,
    //                     "level": 112,
    //                     "expression": "AND"
    //                 },
    //                 {
    //                     "field": "Question 01 01 03",
    //                     "condition": "",
    //                     "value": "",
    //                     "sort": 1,
    //                     "level": 113,
    //                     "hasNested": true,
    //                     "expression": "OR",
    //                     "innerConditions": [{
    //                         "field": "Question 01 01 03 01",
    //                         "condition": "",
    //                         "value": "",
    //                         "sort": 1,
    //                         "level": 1131
    //                     }]
    //                 }
    //         ]
    //     },
    //     {
    //         "field": "Question 02",
    //         "condition": "",
    //         "value": "",
    //         "sort": 1,
    //         "level": 12,
    //         "hasNested": false,
    //         "expression": "AND"
    //     }
    // ]  
    // }
  ]);

  const NestedRow: React.FC<NestedRowProps> = ({ children }) => {
    return (
      <div style={{ display: "contents", flexDirection: "row", marginLeft: '5%' }}>{children}</div>
    );
  };

      // Function to add or replace object at the parent level 113
// Function to add or replace object at the parent level 113
  
  function addConditionToNested(data: string | any[], targetLevel: any, newCondition: any) {
    console.log("parentLevel", targetLevel);
    console.log("newObj", newCondition)
    console.log("conditionArray", data)

  for (let i = 0; i < data.length; i++) {
    const obj = data[i];


      addConditionToNested(obj.innerConditions, targetLevel, newCondition);
    

    if (obj.level === targetLevel) {
      if (obj.hasNested) {
        obj.innerConditions.push(newCondition);
      } else {
        console.log("DDD", obj)
        obj.hasNested = true;
        obj.innerConditions = [newCondition];
      }
    }
  }
    return data;
}
  
  function addObjectToParentLevel(conditionArray: any[], newObj: any, parentLevel: number) {
    console.log("parentLevel", parentLevel);
    console.log("newObj", newObj)
    console.log("conditionArray", conditionArray)

  const updatedArray = conditionArray.map((cond: { innerConditions: any[] }) => {
      cond.innerConditions = cond.innerConditions.map((condition: any) => {
        if (condition.level === parentLevel) {
          const existingObjectIndex = condition.innerConditions.findIndex(
            (item: { level: any }) => item.level === newObj.level
          );
          if (existingObjectIndex !== -1) {
            condition.innerConditions[existingObjectIndex] = newObj;
          } else {
            if (!condition.innerConditions) {
              condition.innerConditions = [];
            }
            condition.innerConditions.push(newObj);
          }
        } else {
          addObjectToParentLevel(condition.innerConditions, newObj, parentLevel);
        }
        return condition;
      });

    return cond;
  });

  return updatedArray;
  }

  const idGenerator = (parentLevel: number, hasNested: boolean) => {
    let newKey 
    if(hasNested) {
      newKey = parseInt(parentLevel+`1`)
    }
    else {
      newKey = parentLevel + 1
    }
    console.log("New Key", newKey)
    return newKey;
  }


  const _handleAddRow = (level: number, nestedLevel: number, hasNested: boolean, expression: string = "") => {
  const newKey = idGenerator(level, hasNested);
  let newRow = {
    "field": "Question 01",
    "condition": "sssssddds",
    "value": "",
    "sort": 1,
    "level": newKey,
    "hasNested": hasNested,
    "innerConditions": []
  };

  const parentLevelToAdd = level;

  // if (!_nestedRows[0]?.innerConditions?.length && hasNested) {
  //   _setNestedRows([{
  //     "field": "Question02",
  //     "condition": "",
  //     "value": "",
  //     "sort": 1,
  //     "level": 1,
  //     "hasNested": true,
  //     "expression": "",
  //     "innerConditions": [
  //       {
  //         "field":  "Question 03",
  //         "condition": "",
  //         "value": "",
  //         "sort": 1,
  //         "level": 11,
  //         "hasNested": true,
  //         "expression": "AND",
  //         "innerConditions": []
  //       }
  //     ]  
  //   }]);
  // } else {
    _setNestedRows(addConditionToNested(_nestedRows, parentLevelToAdd, newRow));
  // }
};
  useEffect(() => {
    console.log("NESTED", _nestedRows)
    
  }, [_nestedRows])

  useEffect(() => {
    _setNestedRows([{
      "field": "Question01",
    "condition": "",
    "value": "",
    "level": sectionLevel,
    "hasNested": true,
    "expression": "",
      "innerConditions": []
  }])
  }, [sectionLevel]);

  useEffect(() => {
    console.log("rowData", rowData);
  }, [rowData]);


  const renderNestedConditions = (conditions: any[], marginLeft = 0) => {
    return conditions.map((condition: any) => (
      <div key={condition.level}>
         <div style={{display:'flex', marginBottom: '3%'}}>
          <Button className="mr-10 btn-default" onClick={() => _handleAddRow(condition.level, condition.level + 1, false, "AND")}>+ Add</Button>
          <Button className="btn-default" onClick={() => _handleAddRow(condition.level, condition.level + 1, true, "AND")}>+ Add Nested</Button>
        </div>
        <div className="loop">
          <div style={{marginBottom: "1%", marginTop: "2%", display: "flex"}}>
            <div className="condition-label">And/Or </div>
            <div className="condition-label">Field </div>
            <div className="condition-label">Operator</div>
            <div className="condition-label">Value </div>

          </div>
          <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '3%' }}>
            <div className="condition-label"><DropDown dropDownData={expressionSampleData} /> </div>
            <div className="condition-label"><FieldInput sampleData={sampleInputQuestion} selectedValue={condition.field} /> </div>
            <div className="condition-label"><DropDown dropDownData={operationalSampleData} /></div>
            <div className="condition-label"><DropDown dropDownData={expressionSampleData} /> </div>
          </div>
       </div>
        {condition.hasNested && (
          <div style={{ paddingLeft: '30px' }}>
              {renderNestedConditions(condition.innerConditions, marginLeft + 5)}
          </div>
        )}
       
      </div>
    ));
  };
  

  return (
    <div>
        {renderNestedConditions(_nestedRows)}
    </div>
  );
};

export default RowContainer;
