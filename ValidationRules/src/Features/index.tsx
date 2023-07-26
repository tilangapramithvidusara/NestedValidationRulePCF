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
import {updateDataRequest, getCurrentState, getCurrentId, fetchRequest, saveRequest} from "../XRMRequests/xrmRequests";
import { dbConstants } from "../constants/dbConstants";

const ParentComponent: React.FC = () => {
  const [conditionData, setConditionData] = useState<any[]>([]);

  // Get From XRM Requests
  const [sections, setSections] = useState<any[]>([]);
  const [isLoadData, setIsLoadData] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<any>();
  const [_nestedRows, _setNestedRows] = useState<any>([]);
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
    _getCurrentState()
  }, []);

  const getRequestedData = async () => {
    const currentState = await _getCurrentState();
    let result
    let _result;
    let logicalName;
    if (currentState === 'c') { 
      logicalName = dbConstants.chapter.fieldName;
    } else if (currentState === 's') {
      logicalName = dbConstants.section.fieldName;
    } else if (currentState === 'q') {
      logicalName = dbConstants.question.fieldName;
    } else {
      logicalName = dbConstants.section.fieldName;
    }

    result = await fetchRequest(logicalName, "a4ef3ba6-bc26-ee11-9965-6045bdd0ef22", `?$select=${dbConstants.common.gyde_visibilityrule}`);
    _result = await fetchRequest(logicalName, "a4ef3ba6-bc26-ee11-9965-6045bdd0ef22", `?$select=${dbConstants.common.gyde_min}`);
    console.log("resultresult -----> ", result);
    console.log("resultresult _result -----> ", _result);

    if (result?.data || _result?.data) {
      const formattedData = JSON.parse(result?.data);
      const _formattedData = JSON.parse(_result?.data);

      let sampleRetrieveFormat: any = [];
      let _sampleRetrieveFormat: any = [];
      let secKey = 0;
      formattedData?.forEach((x: any, index: any) => {
        console.log("sample Retrieve Format xxxxReqqqqqq ------> ", x);
        secKey++
        sampleRetrieveFormat.push({
          [secKey]: {
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


      _formattedData?.forEach((x: any, index: any) => {
        console.log("sample Retrieve Format xxxxReqqqqqq 1234c ------> ", x);
        secKey++
        _sampleRetrieveFormat.push({
          [secKey]: {
            fields: convertMinMaxDBFormatToJSON(x[0]),
            actions: [
              {
                checkBoxValues: [
                  {
                    minMax: {
                      logicalName: "minMax",
                      minValue: x?.if[1]?.value,
                      maxValue: x?.if[1]?.value
                  }
                  },
                ],
              },
            ],
          },
        });
      });

      
      if (sampleRetrieveFormat
        && sampleRetrieveFormat.length
        && _sampleRetrieveFormat
        && _sampleRetrieveFormat.length) _setNestedRows([...sampleRetrieveFormat, ..._sampleRetrieveFormat])

    }
    console.log("KKKKKKKKK", result);
  }
  useEffect(() => {
    console.log("currentId ----->", currentId);
    getRequestedData()
  }, [currentId]);

  const _getCurrentState = async () => {
    const result = await getCurrentState();
    const currentId = await getCurrentId();
    console.log("REDDDDDDD", result);
    console.log("REDDDDDDD", JSON.stringify(result));
    console.log("REDDDDDDD currentId", currentId);

    if (currentId?.data) setCurrentId(currentId?.data);
    if (result.data.includes('question')) {
      console.log("Question -------> ");
      return "q"
    } else if (result.data.includes('section')) {
      console.log("Section -------> ");
      return "s"
    } else if (result.data.includes('chapter')) {
      console.log("Chapter -------> ");
      return "c"
    }
}

  const saveVisibilityData = async (visibilityRule: any, minMaxRule: any) => {
    const currentState = await _getCurrentState();
    const currentId = await getCurrentId();
    console.log("REDDDDDDD", currentState);
    console.log("REDDDDDDD q1111 ", currentId);
    console.log("REDDDDDDD currentId", currentId);

    if (currentId?.data) setCurrentId(currentId?.data);
    let logicalName;
    if (currentState === 'q') {
      logicalName = dbConstants.question.fieldName;
    } else if (currentState === 's') {
      logicalName = dbConstants.section.fieldName;
    } 
    else if (currentState === 'c') { 
      logicalName = dbConstants.chapter.fieldName;
    } else {
      logicalName = dbConstants.section.fieldName;
    }

    await saveRequest(logicalName, currentId ? currentId : "a4ef3ba6-bc26-ee11-9965-6045bdd0ef22", { [dbConstants.question.minMax]: JSON.stringify(minMaxRule) });
    await saveRequest(logicalName, currentId ? currentId : "a4ef3ba6-bc26-ee11-9965-6045bdd0ef22", { [dbConstants.common.gyde_validationrule]: JSON.stringify(visibilityRule) })
    await saveRequest(logicalName, currentId ? currentId : "a4ef3ba6-bc26-ee11-9965-6045bdd0ef22", { [dbConstants.common.gyde_visibilityrule]: JSON.stringify(visibilityRule) });

  }
  const handleSaveLogic = () => {
    const minMaxDBFormatArray: any = [];
    const visibilityRule: any = [];
    const sampleRetrieveFormat: any = [];

    _nestedRows.forEach((sectionResult: any) => {
      const key = Object.keys(sectionResult)[0];
      const minMax = sectionResult[key]?.actions[0]?.minMax;
      let minValue = minMax?.min;
      let maxValue = minMax?.max;
      if (minMax) {
        if (typeof minMax.min === "string") {
          minValue = {
              "var": minMax?.min
          }
        } else if (typeof minMax.max === "string") {
          maxValue = {
            "var": minMax?.max
        }
        }
      }
      minMaxDBFormatArray.push({
        if: [
          convertJSONFormatToDBFormat(sectionResult[key], false),
          [
            {
               "type":"MINIMUM_LENGTH",
               "value": minValue,
               "inclusive":true
            },
            {
               "type":"MAXIMUM_LENGTH",
               "value": maxValue,
               "inclusive":true
            }
         ]
        ],
      });
      visibilityRule.push(
        convertJSONFormatToDBFormat(sectionResult[key], false)
      );
    });
    console.log("Save MinMax Reqq ------> ", minMaxDBFormatArray);
    console.log("Save Visibility Rule Reqq ------> ", visibilityRule);
    if (visibilityRule && visibilityRule.length || minMaxDBFormatArray && minMaxDBFormatArray.length) {
      saveVisibilityData(visibilityRule, minMaxDBFormatArray);
    }
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
        <div className="text-left">
          <Button onClick={handleSaveLogic} className="mr-10 btn-default">
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default ParentComponent;
