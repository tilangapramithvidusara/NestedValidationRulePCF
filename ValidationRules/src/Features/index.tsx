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
import {
  updateDataRequest,
  getCurrentState,
  getCurrentId,
  fetchRequest,
  saveRequest,
} from "../XRMRequests/xrmRequests";
import { dbConstants } from "../constants/dbConstants";
import { normalConverter } from "../Utils/dbFormatToJson";

const ParentComponent: React.FC = () => {
  const [conditionData, setConditionData] = useState<any[]>([]);

  // Get From XRM Requests
  const [sections, setSections] = useState<any[]>([]);
  const [isLoadData, setIsLoadData] = useState<boolean>(false);
  const [_nestedRows, _setNestedRows] = useState<any>([]);
  const [isNested, setIsNested] = useState<any>();
  const [currentPossitionDetails, setCurrentPossitionDetails] = useState<any>({currentPosition:"question"});
  const [_visibilityRulePrev, _setVisibilityRulePrev] = useState<any[]>([]);
  const [_minMaxPrev, _setMinMaxPrev] = useState<any[]>([]);
  const [_validationRulePrev, _setValidationRulePrev] = useState<any[]>([]);

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
    setSections(
      _nestedRows
        .map((item: {}) => Object.keys(item))
        .flat()
        .map((key: any) => ({ key: parseInt(key) }))
    );
  }, [_nestedRows]);

  // for retrieve purpose
  useEffect(() => {
    setSections(
      _nestedRows
        .map((item: {}) => Object.keys(item))
        .flat()
        .map((key: any) => ({ key: parseInt(key) }))
    );
    _getCurrentState();
  }, []);

  useEffect(() => {
    if (_visibilityRulePrev?.length) {
      let key = 1
      _visibilityRulePrev.forEach((dbData) => {
        _setNestedRows((prevData: any) => { 

          if (dbData?.validation) { 
            console.log("dbData?.validation", dbData?.validation);
            const validationFormattedData : any = []
            dbData?.validation?.forEach((valData: any) => {
              console.log("Validation DB Dataaa Converting---->>>> ", valData);
              validationFormattedData.push(...normalConverter([valData]))
            })

            return [
              ...prevData, {
                [key++]: {
                  actions: [
                    {
                      checkBoxValues: [
                        {
                          show: {
                            logicalName: "Enable",
                            value: "enable",
                          },
                        },
                      ],
                    },
                  ],
                  fields: validationFormattedData,
                }
              }
            ]
          }
          if (dbData?.visibility) {
            const validationFormattedData : any = []
            dbData?.visibility?.forEach((valData:any) => {
              // validationFormattedData.push(...convertMinMaxDBFormatToJSON(valData))
              console.log("Visibility DB Dataaa Converting---->>>> ", valData);
              validationFormattedData.push(...normalConverter([valData]))

            })
            return [
              ...prevData, {
                [key++]: {
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
                  fields: validationFormattedData,
                }
              }
            ]
          }
          if (dbData?.minMax) {
            const validationFormattedData : any = []
            dbData?.minMax?.forEach((valData:any) => {
              console.log("Min Max DB Dataaa Converting---->>>> ", valData);
              validationFormattedData.push(normalConverter([valData]))
            })
            return [
              ...prevData, {
                [key++]: {
                  actions: [
                    {
                      minMax: {
                        logicalName: "minMax",
                        minValue: 12,
                        maxValue: 21,
                      },
                    },
                  ],
                  fields: validationFormattedData,
                }
              }
            ]
          }          
        });
      })
        
    }
  }, [_visibilityRulePrev]); 

  const getRequestedData = async () => {
    let visibilityRulePreviousValues: any = '[{"and":[{"eq":[{"var":"NTemp_C01_04_Q_04_3333333333"},3]},{"eq":[{"var":"NTemp_C01_04_Q_04"},4]}]}]';
    let minMaxPreviousValues: any = '[{ "or": [{ "and": [{ "==": [{ "var": "Q_120_100" }, "3"] }, { "==": [{ "var": "Q_140_100" }, "10"] }, { "==": [{ "var": "Q_130_100" }, "10"] } ] }, { "==": [{ "var": "Q_110_100" }, "3"] } ] }]'
    let validationRulePreviousValues: any = '[{"and":[{"eq":[{"var":"NTemp_C01_04_Q_04"},3]},{"eq":[{"var":"NTemp_C01_04_Q_04"},4]}]}]'

    let logicalName;
    if (currentPossitionDetails?.currentPosition === "chapter") {
      logicalName = dbConstants.chapter.fieldName;
    } else if (currentPossitionDetails?.currentPosition === "section") {
      logicalName = dbConstants.section.fieldName;
    } else if (currentPossitionDetails?.currentPosition === "question") {
      logicalName = dbConstants.question.fieldName;
    }

    if (logicalName && currentPossitionDetails?.id && (currentPossitionDetails?.currentPosition === "chapter" || currentPossitionDetails?.currentPosition === "section")) {
      visibilityRulePreviousValues = await fetchRequest(
        logicalName,
        currentPossitionDetails?.id,
        `?$select=${dbConstants.common.gyde_visibilityrule}`
      );
      validationRulePreviousValues = await fetchRequest(
        logicalName,
        currentPossitionDetails?.id,
        `?$select=${dbConstants.common.gyde_validationrule}`
      );
    } else if (logicalName && currentPossitionDetails?.id && currentPossitionDetails?.currentPosition === "question") {
      minMaxPreviousValues = await fetchRequest(
        logicalName,
        currentPossitionDetails?.id,
        `?$select=${dbConstants.question.gyde_minmaxvalidationrule}`
      );

      visibilityRulePreviousValues = await fetchRequest(
        logicalName,
        currentPossitionDetails?.id,
        `?$select=${dbConstants.common.gyde_visibilityrule}`
      );

      validationRulePreviousValues = await fetchRequest(
        logicalName,
        currentPossitionDetails?.id,
        `?$select=${dbConstants.common.gyde_validationrule}`
      );
    }
    
    console.log("visibilityRulePreviousValues -----> ", visibilityRulePreviousValues);
    console.log("minMaxPreviousValues _result -----> ", minMaxPreviousValues);
    console.log("validationRulePreviousValues _result -----> ", validationRulePreviousValues);

    if (visibilityRulePreviousValues?.data?.length) _setVisibilityRulePrev((prevData:any) => [...prevData, {visibility: JSON.parse(visibilityRulePreviousValues?.data)}]);
    if(minMaxPreviousValues?.data?.length) _setVisibilityRulePrev((prevData:any) => [...prevData, {minMax: JSON.parse(minMaxPreviousValues?.data)}]);
    if(validationRulePreviousValues?.data?.length) _setVisibilityRulePrev((prevData:any) => [...prevData, {validation: JSON.parse(validationRulePreviousValues?.data)}]);
  };
  useEffect(() => {
    console.log("currentId ----->", currentPossitionDetails);
    getRequestedData();
  }, [currentPossitionDetails]);

  const _getCurrentState = async () => {
    const result = await getCurrentState();
    console.log("Current State Details ----> ", result);
    if (result?.data?.length) setCurrentPossitionDetails(result?.data[0]);
  };
  const saveVisibilityData = async (visibilityRule: any, minMaxRule: any, outputDocShow:any, minMaxDBFormatArray:any) => {
    let logicalName;
    if (currentPossitionDetails?.currentPosition === "question") {
      logicalName = dbConstants.question.fieldName;
    } else if (currentPossitionDetails?.currentPosition === "section") {
      logicalName = dbConstants.section.fieldName;
    } else if (currentPossitionDetails?.currentPosition === "chapter") {
      logicalName = dbConstants.chapter.fieldName;
    }
    console.log("logicalName when saving", logicalName)
    console.log("logicalName when saving currentPossitionDetails", currentPossitionDetails)

    if (currentPossitionDetails?.id && (currentPossitionDetails.currentPosition === "section" || currentPossitionDetails?.currentPosition === "chapter")) {
      await saveRequest(
        logicalName,
        currentPossitionDetails?.id,
        {
          [dbConstants.common.gyde_visibilityrule]:
            JSON.stringify(visibilityRule),
        }
      );
    } else if(currentPossitionDetails?.id && currentPossitionDetails?.currentPosition === "question") {
      await saveRequest(
        logicalName,
        currentPossitionDetails?.id,
        {
          [dbConstants.common.gyde_visibilityrule]:
            JSON.stringify(visibilityRule),
        }
      );
      await saveRequest(
        logicalName,
        currentPossitionDetails?.id,
        { [dbConstants.question.gyde_minmaxvalidationrule]: JSON.stringify(minMaxRule) }
      );
      await saveRequest(
        logicalName,
        currentPossitionDetails?.id,
        {
          [dbConstants.common.gyde_validationrule]:
            JSON.stringify(visibilityRule),
        }
      );
      await saveRequest(
        logicalName,
        currentPossitionDetails?.id,
        {
          [dbConstants.question.gyde_documentOutputRule]:
            JSON.stringify(outputDocShow),
        }
      );
    }
  };
  const handleSaveLogic = () => {
    const minMaxDBFormatArray: any = [];
    const visibilityRule: any = [];
    const outputDocShow: any = [];
    const validationRule: any = [];
    const sampleRetrieveFormat: any = [];

    _nestedRows.forEach((sec: any) => {
      console.log("SECCCC", sec);
      const key = Object.keys(sec)[0]
      if (sec[key]?.actions[0]?.checkBoxValues) {
        console.log("checkBoxValues when saving ----> ", sec[key]?.actions[0]?.checkBoxValues[0]);
        if (sec[key]?.actions[0]?.checkBoxValues[0]["show"]) {
          console.log("Show saving logic", convertJSONFormatToDBFormat(sec[key], true));
          visibilityRule.push(convertJSONFormatToDBFormat(sec[key], true))
        }
        if (sec[key]?.actions[0]?.checkBoxValues[0]["outputDoc"]) {
          console.log("outputDoc saving logic", convertJSONFormatToDBFormat(sec[key], true));
          outputDocShow.push(convertJSONFormatToDBFormat(sec[key], false))
        }
        if (sec[key]?.actions[0]?.checkBoxValues[0]["enable"]) {
          console.log("enable saving logic", convertJSONFormatToDBFormat(sec[key], true));
          validationRule.push(convertJSONFormatToDBFormat(sec[key], true))
        }
      }

      if (sec[key]?.actions[0]?.minMax) {
        console.log("Min Max when saving ----> ", sec[key].actions[0]?.minMax);

        const minMax = sec[key]?.actions[0]?.minMax;
        let minValue = minMax?.min;
        let maxValue = minMax?.max;
        if (minMax) {
          if (typeof minMax.min === "string") {
            minValue = {
              var: minMax?.min,
            };
          } else if (typeof minMax.max === "string") {
            maxValue = {
              var: minMax?.max,
            };
          }
          minMaxDBFormatArray.push({
            if: [
              convertJSONFormatToDBFormat(sec[key], false),
              [
                {
                  type: "MINIMUM_LENGTH",
                  value: minValue,
                  inclusive: true,
                },
                {
                  type: "MAXIMUM_LENGTH",
                  value: maxValue,
                  inclusive: true,
                },
              ],
            ],
          });
        }
      }
    });

    console.log("Save MinMax Reqq ------> ", minMaxDBFormatArray);
    console.log("Save Visibility Rule Reqq ------> ", visibilityRule);
    console.log("Save outputDocShow Rule Reqq ------> ", outputDocShow);
    console.log("Save validationRule Rule Reqq ------> ", validationRule);

    if (
      (visibilityRule && visibilityRule.length) ||
      (minMaxDBFormatArray && minMaxDBFormatArray.length) ||
      (outputDocShow && outputDocShow.length) ||
      (validationRule && validationRule.length)
    ) {
      console.log("DATA Saving visibilityRule", visibilityRule);
      console.log("DATA Saving validationRule", validationRule);
      console.log("DATA Saving outputDocShow", outputDocShow);
      console.log("DATA Saving minMaxDBFormatArray", minMaxDBFormatArray);
      saveVisibilityData(visibilityRule, validationRule, outputDocShow, minMaxDBFormatArray);
    }
  };

  return (
    <div className="validation-wrap">
      {currentPossitionDetails && (
        <div>
          <div className="nestedBtns">
            <Button className="mr-10 btn-default" onClick={addComponent}>
              + Add
            </Button>
            <Button className="btn-default" onClick={addNestedComponent}>
              + Add Nested
            </Button>
          </div>
          {sections?.length > 0 &&
            sections.map((section) => (
              <div key={section.key} className="nested-wrap">
                <SectionContainer
                  sectionLevel={section.key}
                  conditionData={conditionData}
                  setConditionData={setConditionData}
                  _setNestedRows={_setNestedRows}
                  _nestedRows={_nestedRows}
                  isNested={isNested}
                  currentPossitionDetails={currentPossitionDetails}
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
      )}
    </div>
  );
};

export default ParentComponent;
