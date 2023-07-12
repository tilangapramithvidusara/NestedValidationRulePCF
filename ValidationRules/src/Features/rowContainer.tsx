import React, { useEffect, useState } from "react";
import DropDown from "../Components/commonComponents/DropDown";
import FieldInput from "../Components/commonComponents/FieldInput";
import { Button } from "antd";
import { expressionSampleData } from "../SampleData/expressionSampleData";
import { operationalSampleData } from "../SampleData/operationalSampleData";
import { sampleInputQuestion } from "../SampleData/sampleInputQuestion";

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
function addObjectToParentLevel(conditionArray: any[], newObj: any, parentLevel: number) {
  const updatedArray = conditionArray.map((cond: { innerConditions: any[] }) => {
    if (cond.innerConditions) {
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
    }
    return cond;
  });

  return updatedArray;
}


const _handleAddRow = (level: number, nestedLevel: number, hasNested: boolean, expression: string = "") => {
  let newRow = {
    "field": "Question 01",
    "condition": "sssssddds",
    "value": "",
    "sort": 1,
    "level": 111
  };

  const parentLevelToAdd = level;

  if (!_nestedRows[0]?.innerConditions?.length && hasNested) {
    _setNestedRows([{
      "field": "Question02",
      "condition": "",
      "value": "",
      "sort": 1,
      "level": 1,
      "hasNested": true,
      "expression": "",
      "innerConditions": [
        {
          "field":  "Question 03",
          "condition": "",
          "value": "",
          "sort": 1,
          "level": 11,
          "hasNested": true,
          "expression": "AND",
          "innerConditions": []
        }
      ]  
    }]);
  } else {
    const updatedRows = addObjectToParentLevel(_nestedRows, newRow, parentLevelToAdd);
    _setNestedRows(updatedRows);
  }
};
  
-



  useEffect(() => {
    console.log("NESTED", _nestedRows)
    
  }, [_nestedRows])

  const handleAddRow = (level: number, nested: boolean) => {
    // setNestedRows((prevRows) => {
    //   const updatedRows = [...prevRows];
    //   console.log("SSSSSS", prevRows)
    //   updatedRows.splice(
    //     indexLevel + 1,
    //     0,
    //     <NestedRow key={level + `${indexLevel}`}>
    //       <div style={{
    //         marginLeft: '5%'            
    //       }}>
    //         {nested ? (
    //           <div>
    //             <td>
    //               And/OR <DropDown dropDownData={expressionSampleData} />
    //             </td>
    //           </div>
    //         ) : null}
    //         <td>
    //           <DropDown dropDownData={sampleInputQuestion}/>
    //         </td>
    //         <td>
    //           <DropDown dropDownData={operationalSampleData}/>
    //         </td>
    //         <td>
    //           <DropDown dropDownData={expressionSampleData}/>
    //         </td>
    //         <div style={{display: "flex"}}>
    //           <Button onClick={() => handleAddRow(indexLevel - 1, true)}>
    //             + Add Nested
    //           </Button>
              
    //           <Button onClick={() => handleAddRow(indexLevel, false)}>
    //             + Add
    //           </Button>
    //         </div>
    //       </div>
    //     </NestedRow>
    //   );
    //   if (nested) setIndexLevel((x: number) => x++);
    //   else setIndexLevel((x: number) => x++);
    //   return updatedRows;
    // });
  };

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
        <div style={{marginBottom: "1%", marginTop: "2%", display: "flex"}}>
          <div style={{marginRight: "15%"}}>And/Or </div>
          <div style={{marginRight: "16%"}}>Field </div>
          <div style={{marginRight: "16%"}}>Operator</div>
          <div style={{marginRight: "20%"}}>Value </div>

        </div>
        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '3%' }}>
        <div style={{marginRight: "1%"}}><DropDown dropDownData={expressionSampleData} /> </div>
          <div style={{marginRight: "2%"}}><FieldInput sampleData={sampleInputQuestion} selectedValue={condition.field} /> </div>
          <div style={{marginRight: "2%"}}><DropDown dropDownData={operationalSampleData} /></div>
          <div style={{ marginRight: "2%" }}><DropDown dropDownData={expressionSampleData} /> </div>
        </div>

        {condition.hasNested && (
          <div style={{ marginLeft: "10%" }}>
              {renderNestedConditions(condition.innerConditions, marginLeft + 5)}
          </div>
        )}
        <div style={{display:'flex', marginBottom: '3%'}}>
          <Button onClick={() => _handleAddRow(condition.level, condition.level + 1, false, "AND")}>+ Add</Button>
          <Button onClick={() => _handleAddRow(condition.level, condition.level + 1, true, "AND")}>+ Add Nested</Button>
        </div>
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
