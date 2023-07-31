import React, { useEffect, useState } from "react";
import configs from "../configs/actionMapper";
import toggleWithCheckboxMapper from "../configs/toggleWithCheckboxMapper";
import {
  convertJSONFormatToDBFormat,
  convertMinMaxDBFormatToJSON,
  findAndUpdateLastNestedIf,
  removeIfKeyAndGetDbProperty,
} from "../Utils/logics.utils";
import sampleOutputData from "../SampleData/SampleOutputData";
import utilHelper from "../utilHelper/utilHelper";
// import removeIcon from '../assets/delete.png';
import { Button, notification, Space  } from "antd";
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
import NotificationPopup from "../Components/NotificationPopup";

const ParentComponent: React.FC = () => {
  const [conditionData, setConditionData] = useState<any[]>([]);

  // Get From XRM Requests
  const [sections, setSections] = useState<any[]>([]);
  const [isLoadData, setIsLoadData] = useState<boolean>(false);
  const [_nestedRows, _setNestedRows] = useState<any>([]);
  const [isNested, setIsNested] = useState<any>();
  const [currentPossitionDetails, setCurrentPossitionDetails] = useState<any>({currentPosition:"question"});
  const [_visibilityRulePrev, _setVisibilityRulePrev] = useState<any[]>([]);
  const [_enabledRulePrev, _setEnabledPrev] = useState<any[]>([]);
  const [_documentOutputRulePrev, _setDocumentOutputRulePrev] = useState<any[]>([]);
  const [_minMaxRulePrev, _setMinMaxRulePrev] = useState<any[]>([]);

  const [_minMaxPrev, _setMinMaxPrev] = useState<any[]>([]);
  const [_validationRulePrev, _setValidationRulePrev] = useState<any[]>([]);
  const [isSaveSuccess, setIsSaveSuccess] = useState<boolean>(false);

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
      let key = 30;
      _visibilityRulePrev.forEach((dbData) => {
        console.log("LOADINGGG", dbData)
        _setNestedRows((prevData: any) => {
          // if (dbData?.validation) {
          //   const visibilityString = dbData?.validation;
          //   const showUpdatedValidationDataArray: any[] = [];
          //   let validationDta = visibilityString;
          //   const refactorDta = removeIfKeyAndGetDbProperty(validationDta)
          //   refactorDta?.forEach((fieldDta): any => {
          //     showUpdatedValidationDataArray.push({
          //       [key++]: {
          //         actions: [
          //           {
          //             checkBoxValues: [
          //               {
          //                 enable: {
          //                   logicalName: "Enable",
          //                   value: "enable",
          //                 },
          //               },
          //             ],
          //           },
          //         ],
          //         fields: normalConverter([fieldDta]),
          //       }
          //     })
          //   })
            
          //   console.log("Validation DB Dataaa showUpdatedDataArray ", showUpdatedValidationDataArray);

          //   if (showUpdatedValidationDataArray && showUpdatedValidationDataArray.length) {
          //     console.log("Validation DB Dataaa showUpdatedDataArray ", showUpdatedValidationDataArray);
          //     console.log("Validation DB Dataaa showUpdatedDataArray ", [...prevData, showUpdatedValidationDataArray]);
          //     return [...prevData, ...showUpdatedValidationDataArray]
          //   }
          // }
            // console.log("dbData?.validation", dbData?.validation);
            // const validationFormattedData : any = []
            // dbData?.validation?.forEach((valData: any) => {
            //   console.log("Validation DB Dataaa Converting---->>>> ", valData);
            //   validationFormattedData.push(...normalConverter([valData]))
            // })
            // enableUpdatedDataArray.push({
            //   [key++]: {
            //     actions: [
            //       {
            //         checkBoxValues: [
            //           {
            //             show: {
            //               logicalName: "Enable",
            //               value: "enable",
            //             },
            //           },
            //         ],
            //       },
            //     ],
            //     fields: validationFormattedData,
            //   }
            // })
            // if (enableUpdatedDataArray && enableUpdatedDataArray.length) {
            //   console.log("Validation DB Dataaa updatedDataArray ", enableUpdatedDataArray);
            //   console.log("Validation DB Dataaa updatedDataArray ", [...prevData, ...enableUpdatedDataArray]);
            //   return [...prevData, ...enableUpdatedDataArray]
            // }
           
          
          if (dbData?.visibility?.length) {
            const visibilityString = dbData.visibility;
            const showUpdatedDataArray: any[] = [];
            console.log("Visibility visibilityString ---->>>> ", visibilityString);
            let visibilityDta = visibilityString;
            console.log("Visibility visibilityDta  ---->>>> ", visibilityDta);
            // visibilityDta.forEach((valData:any) => {
              // validationFormattedData.push(...convertMinMaxDBFormatToJSON(valData))
              console.log("Visibility DB Dataaa Converting ---->>>> ", visibilityDta);
              const refactorDta = removeIfKeyAndGetDbProperty(visibilityDta)
            console.log("Visibility DB Dataaa Converting refactorDta---->>>> ", refactorDta);
            refactorDta?.forEach((fieldDta): any => {
              // const validationFormattedData : any = []
                console.log("Visibility DB Dataaa Converting refactorDta fieldDta---->>>> ", fieldDta);
                // console.log("Visibility DB Dataaa Converting refactorDta fieldDta dssedfse---->>>> ", normalConverter([fieldDta]));

                // validationFormattedData.push(normalConverter([fieldDta]))
                // console.log("Visibility DB Dataaa Converting refactorDta fieldDta validationFormattedData---->>>> ", validationFormattedData);
                // if (validationFormattedData && validationFormattedData.length)
                  showUpdatedDataArray.push({
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
                      fields: normalConverter([fieldDta]),
                    }
                })
              })
            
              console.log("Validation DB Dataaa showUpdatedDataArray ", showUpdatedDataArray);

            if (showUpdatedDataArray && showUpdatedDataArray.length) {
              console.log("Validation DB Dataaa showUpdatedDataArray ", showUpdatedDataArray);
              console.log("Validation DB Dataaa showUpdatedDataArray ", [...prevData, showUpdatedDataArray]);
              return [...prevData, ...showUpdatedDataArray]
            }
          }

          // if (dbData?.docRuleOutput) {
          //   const docRuleOutput = dbData?.docRuleOutput;
          //   const showUpdatedDocOutputDataArray: any[] = [];
          //   let docOutputDta = docRuleOutput;
          //     const refactorDta = removeIfKeyAndGetDbProperty(docOutputDta)
          //   refactorDta?.forEach((fieldDta): any => {
          //     showUpdatedDocOutputDataArray.push({
          //           [key++]: {
          //             actions: [
          //               {
          //                 checkBoxValues: [
          //                   {
          //                     "OutPutDoc:Show": {
          //                         logicalName: "Show in Document",
          //                         value: "OutPutDoc:Show",
          //                       },
          //                   },
          //                 ],
          //               },
          //             ],
          //             fields: normalConverter([fieldDta]),
          //           }
          //       })
          //     })
            
          //     console.log("Validation DB Dataaa showUpdatedDataArray ", showUpdatedDocOutputDataArray);

          //   if (showUpdatedDocOutputDataArray && showUpdatedDocOutputDataArray.length) {
          //     console.log("Validation DB Dataaa showUpdatedDataArray ", showUpdatedDocOutputDataArray);
          //     console.log("Validation DB Dataaa showUpdatedDataArray ", [...prevData, showUpdatedDocOutputDataArray]);
          //     return [...prevData, ...showUpdatedDocOutputDataArray]
          //   }

          //   // const validationFormattedData : any = []
          //   // dbData?.docRuleOutput?.forEach((valData:any) => {
          //   //   // validationFormattedData.push(...convertMinMaxDBFormatToJSON(valData))
          //   //   console.log("Document OUTPUT DB Dataaa Converting---->>>> ", valData);
          //   //   console.log("Document OUTPUT DB Dataaa Converting normalConverter([valData])---->>>> ", normalConverter([valData]));

          //   //   validationFormattedData.push({...normalConverter([valData])})

          //   // })
          //   // return [
          //   //   ...prevData, {
          //   //     [key++]: {
          //   //       actions: [
          //   //         {
          //   //           checkBoxValues: [
          //   //             {
          //   //               "OutPutDoc:Show": {
          //   //                 logicalName: "Show in Document",
          //   //                 value: "OutPutDoc:Show",
          //   //               },
          //   //             },
          //   //           ],
          //   //         },
          //   //       ],
          //   //       fields: validationFormattedData,
          //   //     }
          //   //   }
          //   // ]
          // }

          // if (dbData?.minMax) {

          //   const minMax = dbData?.minMax;
          //   const minMaxOutputDataArray: any[] = [];
          //   let minMaxDta = minMax;
          //     const refactorDta = removeIfKeyAndGetDbProperty(minMaxDta)
          //   refactorDta?.forEach((fieldDta): any => {
          //     minMaxOutputDataArray.push({
          //           [key++]: {
          //             actions: [
          //               {
          //                 minMax: {
          //                   logicalName: "minMax",
          //                   minValue: 12,
          //                   maxValue: 21,
          //                 },
          //               },
          //             ],
          //             fields: normalConverter([fieldDta]),
          //           }
          //       })
          //     })
            
          //     console.log("Validation DB Dataaa showUpdatedDataArray ", minMaxOutputDataArray);

          //   if (minMaxOutputDataArray && minMaxOutputDataArray.length) {
          //     console.log("Validation DB Dataaa showUpdatedDataArray ", minMaxOutputDataArray);
          //     console.log("Validation DB Dataaa showUpdatedDataArray ", [...prevData, minMaxOutputDataArray]);
          //     return [...prevData, ...minMaxOutputDataArray]
          //   }

          //   // const validationFormattedData : any = []
          //   // dbData?.minMax?.forEach((valData:any) => {
          //   //   console.log("Min Max DB Dataaa Converting---->>>> ", valData);
          //   //   validationFormattedData.push(normalConverter([valData]))
          //   // })
          //   // return [
          //   //   ...prevData, {
          //   //     [key++]: {
          //         // actions: [
          //         //   {
          //         //     minMax: {
          //         //       logicalName: "minMax",
          //         //       minValue: 12,
          //         //       maxValue: 21,
          //         //     },
          //         //   },
          //         // ],
          //   //       fields: validationFormattedData,
          //   //     }
          //   //   }
          //   // ]
          // }          
        });
      })
        
    }
  }, [_visibilityRulePrev]); 


  useEffect(() => {
    if (_documentOutputRulePrev?.length) {
      let key = 1;
      _documentOutputRulePrev.forEach((dbData) => {
        console.log("LOADINGGG", dbData)
        _setNestedRows((prevData: any) => {
          if (dbData?.docRuleOutput?.length) {
            const docRuleOutput = dbData?.docRuleOutput;
            const showUpdatedDocOutputDataArray: any[] = [];
            let docOutputDta = docRuleOutput;
              const refactorDta = removeIfKeyAndGetDbProperty(docOutputDta)
            refactorDta?.forEach((fieldDta): any => {
              showUpdatedDocOutputDataArray.push({
                    [key++]: {
                      actions: [
                        {
                          checkBoxValues: [
                            {
                              "OutPutDoc:Show": {
                                  logicalName: "Show in Document",
                                  value: "OutPutDoc:Show",
                                },
                            },
                          ],
                        },
                      ],
                      fields: normalConverter([fieldDta]),
                    }
                })
              })
              console.log("Validation DB Dataaa showUpdatedDataArray ", showUpdatedDocOutputDataArray);
            if (showUpdatedDocOutputDataArray && showUpdatedDocOutputDataArray.length) {
              console.log("Validation DB Dataaa showUpdatedDataArray ", showUpdatedDocOutputDataArray);
              console.log("Validation DB Dataaa showUpdatedDataArray ", [...prevData, showUpdatedDocOutputDataArray]);
              return [...prevData, ...showUpdatedDocOutputDataArray]
            }
          }      
        });
      })
    }
  }, [_documentOutputRulePrev])

  useEffect(() => {
    if (_enabledRulePrev?.length) {
      let key = 10;
      _enabledRulePrev.forEach((dbData) => {
        console.log("LOADINGGG", dbData)
        _setNestedRows((prevData: any) => {
          if (dbData?.validation?.length) {
            const visibilityString = dbData?.validation;
            const showUpdatedValidationDataArray: any[] = [];
            let validationDta = visibilityString;
            const refactorDta = removeIfKeyAndGetDbProperty(validationDta)
            refactorDta?.forEach((fieldDta): any => {
              showUpdatedValidationDataArray.push({
                [key++]: {
                  actions: [
                    {
                      checkBoxValues: [
                        {
                          enable: {
                            logicalName: "Enable",
                            value: "enable",
                          },
                        },
                      ],
                    },
                  ],
                  fields: normalConverter([fieldDta]),
                }
              })
            })
            
            console.log("Validation DB Dataaa showUpdatedDataArray ", showUpdatedValidationDataArray);

            if (showUpdatedValidationDataArray && showUpdatedValidationDataArray.length) {
              console.log("Validation DB Dataaa showUpdatedDataArray ", showUpdatedValidationDataArray);
              console.log("Validation DB Dataaa showUpdatedDataArray ", [...prevData, showUpdatedValidationDataArray]);
              return [...prevData, ...showUpdatedValidationDataArray]
            }
          }
        });
      })
    }
  }, [_enabledRulePrev])

  useEffect(() => {
    if (_minMaxRulePrev?.length) {
      let key = 20;
      _minMaxRulePrev.forEach((dbData) => {
        console.log("LOADINGGG _minMaxRulePrev", dbData)
        _setNestedRows((prevData: any) => {
          if (dbData?.minMax) {
            const minMax = dbData?.minMax;
            const minMaxOutputDataArray: any[] = [];
            let minMaxDta = minMax;
              const refactorDta = removeIfKeyAndGetDbProperty(minMaxDta)
            refactorDta?.forEach((fieldDta): any => {
              minMaxOutputDataArray.push({
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
                      fields: normalConverter([fieldDta]),
                    }
                })
              })
              console.log("Validation DB Dataaa showUpdatedDataArray ", minMaxOutputDataArray);
            if (minMaxOutputDataArray && minMaxOutputDataArray.length) {
              console.log("Validation DB Dataaa showUpdatedDataArray ", minMaxOutputDataArray);
              console.log("Validation DB Dataaa showUpdatedDataArray ", [...prevData, minMaxOutputDataArray]);
              return [...prevData, ...minMaxOutputDataArray]
            }
          }          
        });
      })
        
    }


  }, [_minMaxRulePrev])

  const getRequestedData = async () => {
    let visibilityRulePreviousValues: any;
    let minMaxPreviousValues: any;
    let validationRulePreviousValues: any;
    let documentOutputRule: any;

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
      // validationRulePreviousValues = await fetchRequest(
      //   logicalName,
      //   currentPossitionDetails?.id,
      //   `?$select=${dbConstants.common.gyde_validationrule}`
      // );
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
      documentOutputRule = await fetchRequest(
        logicalName,
        currentPossitionDetails?.id,
        `?$select=${dbConstants.question.gyde_documentOutputRule}`
      );
    }
    
    console.log("visibilityRulePreviousValues -----> ", visibilityRulePreviousValues);
    console.log("minMaxPreviousValues _result -----> ", minMaxPreviousValues);
    console.log("validationRulePreviousValues _result -----> ", validationRulePreviousValues);

    if (visibilityRulePreviousValues?.data?.length) _setVisibilityRulePrev((prevData:any) => [...prevData, {visibility: visibilityRulePreviousValues?.data}]);
    if (minMaxPreviousValues?.data?.length) _setMinMaxRulePrev((prevData:any) => [...prevData, {minMax: minMaxPreviousValues?.data}]);
    if (validationRulePreviousValues?.data?.length) _setEnabledPrev((prevData: any) => [...prevData, { validation: validationRulePreviousValues?.data }]);
    if (documentOutputRule?.data?.length) _setDocumentOutputRulePrev((prevData: any) => [...prevData, { docRuleOutput: documentOutputRule?.data }]);
    
    //test 
    // _setVisibilityRulePrev((prevData: any) => [...prevData, {visibility: JSON.parse("[{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]},{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]}]},{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]},{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]}]}]}]}]") }]);
    // _setMinMaxRulePrev((prevData: any) => [...prevData, {minMax: JSON.parse("[{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]},{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]}]},{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]},{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]}]}]}]}]") }]);
    // _setDocumentOutputRulePrev((prevData: any) => [...prevData, {docRuleOutput: JSON.parse("[{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]},{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]}]},{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]},{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]}]}]}]}]") }]);
    // _setEnabledPrev((prevData: any) => [...prevData, {validation: JSON.parse("[{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]},{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]}]},{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]},{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]}]}]}]}]") }]);

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

  const saveVisibilityData = async (visibilityRule: any, validationRule: any, outputDocShow:any, minMaxDBFormatArray:any) => {
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
        { [dbConstants.question.gyde_minmaxvalidationrule]: JSON.stringify(minMaxDBFormatArray) }
      );
      await saveRequest(
        logicalName,
        currentPossitionDetails?.id,
        {
          [dbConstants.common.gyde_validationrule]:
            JSON.stringify(validationRule),
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
    setIsSaveSuccess(true)
  };
  const handleSaveLogic = () => {
    let minMaxDBFormatArray: any = [];
    let visibilityRule: any = [];
    let outputDocShow: any = [];
    let validationRule: any = [];
    let sampleRetrieveFormat: any = [];

    _nestedRows.forEach((sec: any) => {
      console.log("SECCCCCCCC", sec);
      const key = Object.keys(sec)[0]
      if (sec[key]?.actions[0]?.checkBoxValues) {
        console.log("checkBoxValues when saving ----> ", sec[key]?.actions[0]?.checkBoxValues[0]);
        if (sec[key]?.actions[0]?.checkBoxValues[0]["show"]) {
          console.log("Show saving logic", convertJSONFormatToDBFormat(sec[key], true));
          // visibilityRule.push({if: convertJSONFormatToDBFormat(sec[key], true)});
          visibilityRule = findAndUpdateLastNestedIf(visibilityRule, { if: [convertJSONFormatToDBFormat(sec[key], true)] })
          
          console.log("Show saving logic visibilityRule", visibilityRule);

        }
        if (sec[key]?.actions[0]?.checkBoxValues[0]["OutPutDoc:Show"]) {
          console.log("outputDoc saving logic", convertJSONFormatToDBFormat(sec[key], true));
          outputDocShow = findAndUpdateLastNestedIf(outputDocShow, { if: [convertJSONFormatToDBFormat(sec[key], true)] })
          // outputDocShow.push(convertJSONFormatToDBFormat(sec[key], false))
        }
        if (sec[key]?.actions[0]?.checkBoxValues[0]["enable"]) {
          console.log("enable saving logic", convertJSONFormatToDBFormat(sec[key], true));
          validationRule = findAndUpdateLastNestedIf(validationRule, { if: [convertJSONFormatToDBFormat(sec[key], true)] })
          // validationRule.push(convertJSONFormatToDBFormat(sec[key], true))
        }
      }

      if (sec[key]?.actions[0]?.minMax) {
        console.log("Min Max when saving ----> ", sec[key].actions[0]?.minMax);

        const minMax = sec[key]?.actions[0]?.minMax;
        let minValue = minMax?.minValue;
        let maxValue = minMax?.maxValue;
        if (minMax) {
          if (typeof minMax.min === "string") {
            minValue = {
              var: minMax,
            };
          } else if (typeof minMax.max === "string") {
            maxValue = {
              var: maxValue,
            };
          }
          minMaxDBFormatArray = findAndUpdateLastNestedIf(minMaxDBFormatArray,
            {
              if: [convertJSONFormatToDBFormat(sec[key], true), [
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
          ]] })

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
      {
        isSaveSuccess &&
          <div>
            <NotificationPopup
              notificationType={"success"}
              notificationContent={"Validation Data Saved!"}
            />
          </div>
      }
      
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
