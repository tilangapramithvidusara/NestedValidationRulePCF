import React, { useEffect, useState } from "react";
import configs from "../configs/actionMapper";
import toggleWithCheckboxMapper from "../configs/toggleWithCheckboxMapper";
import {
  convertJSONFormatToDBFormat,
  convertMinMaxDBFormatToJSON,
} from "../Utils/logics.utils";
import sampleOutputData from "../SampleData/SampleOutputData";
import utilHelper from "../utilHelper/utilHelper";
// import removeIcon from '../assets/delete.png';
import { Button } from "antd";
import RowContainer from "./rowContainer";
import SectionContainer from "./sectionContainer";

type MinMaxFieldValues = {
  minValue: any;
  maxValue: any;
  sectionKey: any;
  questionName: any;
};

const ParentComponent: React.FC = () => {
  const [conditionData, setConditionData] = useState<any[]>([]);

  // Get From XRM Requests
  const [sections, setSections] = useState<any[]>([]);
  const [isLoadData, setIsLoadData] = useState<boolean>(false);
  const [_nestedRows, _setNestedRows] = useState<any>([
    //     {
    //         1 : {
    //             "fields": [
    //               {
    //                  "field":"Ques01",
    //                  "condition":"==",
    //                  "value":null,
    //                  "sort":1,
    //                  "level":1,
    //                  "hasNested":true,
    //                  "expression":"or",
    //                  "collapse":false,
    //                  "innerConditions":[
    //                     {
    //                        "field":"Ques02",
    //                        "condition":"==",
    //                        "value":21,
    //                        "sort":1,
    //                        "level":2,
    //                        "hasNested":false,
    //                        "expression":"eq",
    //                        "collapse":false,
    //                        "innerConditions":[
    //                        ]
    //                     },
    //                     {
    //                        "field":"Ques03",
    //                        "condition":"==",
    //                        "value":31,
    //                        "sort":1,
    //                        "level":2,
    //                        "hasNested":false,
    //                        "expression":"eq",
    //                        "collapse":false,
    //                        "innerConditions":[
    //                        ]
    //                     },
    //                     {
    //                        "field":"Ques04",
    //                        "condition":"==",
    //                        "value":null,
    //                        "sort":1,
    //                        "level":2,
    //                        "hasNested":true,
    //                        "expression":"and",
    //                        "collapse":false,
    //                        "innerConditions":[
    //                           {
    //                              "field":"Ques05",
    //                              "condition":"==",
    //                              "value":41,
    //                              "sort":1,
    //                              "level":3,
    //                              "hasNested":false,
    //                              "expression":"eq",
    //                              "collapse":false,
    //                              "innerConditions":[
    //                              ]
    //                           },
    //                           {
    //                              "field":"Ques06",
    //                              "condition":"==",
    //                              "value":51,
    //                              "sort":1,
    //                              "level":3,
    //                              "hasNested":false,
    //                              "expression":"eq",
    //                              "collapse":false,
    //                              "innerConditions":[
    //                              ]
    //                           }
    //                        ]
    //                     }
    //                  ]
    //               },
    //               {
    //                  "field":"Ques07",
    //                  "condition":"==",
    //                  "value":null,
    //                  "sort":1,
    //                  "level":1,
    //                  "hasNested":true,
    //                  "expression":"and",
    //                  "collapse":false,
    //                  "innerConditions":[
    //                     {
    //                        "field":"Ques08",
    //                        "condition":"==",
    //                        "value":61,
    //                        "sort":1,
    //                        "level":2,
    //                        "hasNested":false,
    //                        "expression":"eq",
    //                        "collapse":false,
    //                        "innerConditions":[
    //                        ]
    //                     },
    //                     {
    //                        "field":"Ques09",
    //                        "condition":"==",
    //                        "value":61,
    //                        "sort":1,
    //                        "level":2,
    //                        "hasNested":false,
    //                        "expression":"eq",
    //                        "collapse":false,
    //                        "innerConditions":[
    //                        ]
    //                     }
    //                  ]
    //               },
    //               {
    //                  "field":"Ques10",
    //                  "condition":"==",
    //                  "value":71,
    //                  "sort":1,
    //                  "level":1,
    //                  "hasNested":false,
    //                  "expression":"eq",
    //                  "collapse":false,
    //                  "innerConditions":[
    //                  ]
    //               }
    //            ],
    //             "actions": [
    //                         {
    //                             "checkBoxValues": [{
    //                                 "show":{
    //                                     "logicalName": "Show",
    //                                     "value": "show"
    //                                 },
    //                                 "outputDoc": {
    //                                     "logicalName": "outputDoc",
    //                                     "value": "outputDoc"
    //                                 },
    //                                 "enable": {
    //                                     "logicalName": "EnableField",
    //                                     "value": "enable"
    //                                 }
    //                             }],
    //                             "minMax": {
    //                                 "logicalName": "minMax",
    //                                 "minValue":12,
    //                                 "maxValue": 21
    //                             }
    //                         }
    //                 ]
    //         }
    //     },
    //     {
    //         2: {
    //             "fields":[{
    //                 "field": "Question 02",
    //                 "condition": "",
    //                 "value": "",
    //                 "sort": 1,
    //                 "level": 2,
    //                 "hasNested": false,
    //                 "expression": "AND",
    //                 "innerConditions": [],
    //                 "collapse": false
    //             }],
    //             "actions": [
    //               {
    //                   "checkBoxValues": [{
    //                       "show":{
    //                           "logicalName": "Show",
    //                           "value": "show"
    //                       },
    //                       "outputDoc": {
    //                           "logicalName": "outputDoc",
    //                           "value": "outputDoc"
    //                       },
    //                       "enable": {
    //                           "logicalName": "EnableField",
    //                           "value": "enable"
    //                       }
    //                   }],
    //                   "minMax": {
    //                       "logicalName": "minMax",
    //                       "minValue":12222,
    //                       "maxValue": 2122
    //                   }
    //               }
    //       ]
    //     }
    // }
  ]);
  const [isNested, setIsNested] = useState<any>();

  let addNestedComponent = () => {
    setSections([
      ...sections,
      {
        key:
          sections && sections.length
            ? Math.max(...sections.map((item) => item.key)) + 1
            : 1,
      },
    ]);
    setIsNested(true);
  };

  let addComponent = () => {
    setSections([
      ...sections,
      {
        key:
          sections && sections.length
            ? Math.max(...sections.map((item) => item.key)) + 1
            : 1,
      },
    ]);

    setIsNested(false);
  };

  useEffect(() => {
    console.log("SECCCC", sections);
  }, [sections]);
  useEffect(() => {
    console.log("SECCCC _nestedRows", _nestedRows);
  }, [_nestedRows]);

  // for retrieve purpose
  useEffect(() => {
    setSections(
      _nestedRows
        .map((item: {}) => Object.keys(item))
        .flat()
        .map((key: any) => ({ key: parseInt(key) }))
    );
  }, []);

  const handleSaveLogic = () => {
    const minMaxDBFormatArray: any = [];
    const visibilityRule: any = [];
    const sampleRetrieveFormat: any = [];

    _nestedRows.forEach((sectionResult: any) => {
      const key = Object.keys(sectionResult)[0];
      const minMax = sectionResult[key]?.actions[0]?.minMax;
      minMaxDBFormatArray.push({
        if: [
          convertJSONFormatToDBFormat(sectionResult[key], false),
          minMax?.minValue,
        ],
      });
      visibilityRule.push(
        convertJSONFormatToDBFormat(sectionResult[key], false)
      );
    });
    console.log("Save MinMax Reqq ------> ", minMaxDBFormatArray);
    console.log("Save Visibility Rule Reqq ------> ", visibilityRule);
    if (visibilityRule && visibilityRule.length) {
      visibilityRule?.forEach((x: any, index: any) => {
        console.log("sample Retrieve Format xxxxReqq ------> ", x);
        sampleRetrieveFormat.push({
          [index + 1]: {
            fields: convertMinMaxDBFormatToJSON(x),
            actions: [
              {
                checkBoxValues: [
                  {
                    show: {
                      logicalName: "Show",
                      value: "show",
                    },
                  },
                ],
              },
            ],
          },
        });
      });
    }
    // if(sampleRetrieveFormat && sampleRetrieveFormat.length) _setNestedRows(sampleRetrieveFormat);
  };

  return (
    <div>
      <div className="nestedBtns">
        <Button className="mr-10 btn-default" onClick={addComponent}>
          + Add
        </Button>
        <Button className="btn-default" onClick={addNestedComponent}>
          + Add Nested
        </Button>
      </div>
      {
        sections?.length > 0 &&
        sections.map((section) => (
          <div key={section.key} className="nested-wrap">
            <SectionContainer
              sectionLevel={section.key}
              conditionData={conditionData}
              setConditionData={setConditionData}
              _setNestedRows={_setNestedRows}
              _nestedRows={_nestedRows}
              isNested={isNested}
            />
          </div>
        ))}

      {_nestedRows?.length > 0 && (
        <div className="text-right">
          <Button onClick={handleSaveLogic} className="mr-10 btn-primary">
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default ParentComponent;
