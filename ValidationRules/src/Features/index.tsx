import React, { useEffect, useState } from "react";
import configs from "../configs/actionMapper";
import toggleWithCheckboxMapper from "../configs/toggleWithCheckboxMapper";
import {
  convertJSONFormatToDBFormat,
  convertMinMaxDBFormatToJSON,
  findAndUpdateLastNestedIf,
  removeIfKeyAndGetDbProperty,
  removeMinMaxIfKeyAndGetDbProperty,
} from "../Utils/logics.utils";
import sampleOutputData from "../SampleData/SampleOutputData";
import utilHelper from "../utilHelper/utilHelper";
// import removeIcon from '../assets/delete.png';
import { Button, notification, Space, Spin,  Alert } from "antd";
import RowContainer from "./rowContainer";
import SectionContainer from "./sectionContainer";
import {
  updateDataRequest,
  getCurrentState,
  getCurrentId,
  fetchRequest,
  saveRequest,
  loadAllQuestionsInSurvey,
} from "../XRMRequests/xrmRequests";
import { dbConstants } from "../constants/dbConstants";
import { normalConverter } from "../Utils/dbFormatToJson";
// import NotificationPopup from "../Components/NotificationPopup";

const ParentComponent: React.FC = () => {
  const [conditionData, setConditionData] = useState<any[]>([]);

  // Get From XRM Requests
  const [sections, setSections] = useState<any[]>([]);
  const [isLoadData, setIsLoadData] = useState<boolean>(false);
  const [_nestedRows, _setNestedRows] = useState<any>([]);
  const [isNested, setIsNested] = useState<any>();
  const [currentPossitionDetails, setCurrentPossitionDetails] = useState<any>({
    currentPosition: "question",
  });
  const [_visibilityRulePrev, _setVisibilityRulePrev] = useState<any[]>([]);
  const [_enabledRulePrev, _setEnabledPrev] = useState<any[]>([]);
  const [_documentOutputRulePrev, _setDocumentOutputRulePrev] = useState<any[]>(
    []
  );
  const [_minMaxRulePrev, _setMinMaxRulePrev] = useState<any[]>([]);

  const [_minMaxPrev, _setMinMaxPrev] = useState<any[]>([]);
  const [_validationRulePrev, _setValidationRulePrev] = useState<any[]>([]);
  const [isApiDataLoaded, setIsApiDataLoaded] = useState<boolean>(false);
  const [api, contextHolder]: any = notification.useNotification();
  const [questionList, setQuestionList] = useState<any[]>([]);
  const [deleteSectionKey, setDeleteSectionKey] = useState<any>();
  const [validation, setValidation] = useState<any>({
    minMaxValidation: true,
    andOrValidation: true,
    nestingLevelValidation: true
  });

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

  const loadQuestionHandler = async () => {
    const result = await loadAllQuestionsInSurvey();
    console.log('resss =====> ', result);
    
    let questionListArray = result.data || [];
    if (questionListArray && questionListArray.length) {
        const formattedQuestionList = questionListArray.map((quesNme:any) => {
            return { label: quesNme.gyde_name, value: quesNme.gyde_name, questionType: quesNme["gyde_answertype@OData.Community.Display.V1.FormattedValue"], questionId: quesNme?.gyde_surveytemplatechaptersectionquestionid}
        })
        formattedQuestionList && formattedQuestionList.length && setQuestionList(formattedQuestionList);
    } else {
      setQuestionList([]);
    }
  };

  useEffect(() => {
    console.log("SECCCC", sections);
  }, [sections]);

  useEffect(() => {
    console.log("questionList", questionList);
  }, [questionList]);

  useEffect(() => {
    console.log("SECCCC _nestedRows", _nestedRows);
    setSections(
      _nestedRows
        ?.map((item: {}) => Object.keys(item))
        ?.flat()
        ?.map((key: any) => ({ key: parseInt(key) }))
    );
    if(!_nestedRows?.length) setIsApiDataLoaded(true);
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
    console.log("Validation Data xxxxx", validation);
  }, [validation]);

  useEffect(() => {

    if (_visibilityRulePrev?.length) {
      let key = 30;
      _visibilityRulePrev.forEach((dbData) => {
        console.log("LOADINGGG", dbData);
        _setNestedRows((prevData: any) => {
          if (dbData?.visibility?.length) {
            const visibilityString = dbData.visibility;
            const showUpdatedDataArray: any[] = [];
            console.log(
              "Visibility visibilityString ---->>>> ",
              visibilityString
            );
            let visibilityDta = visibilityString;
            console.log("Visibility visibilityDta  ---->>>> ", visibilityDta);
            console.log(
              "Visibility DB Dataaa Converting ---->>>> ",
              visibilityDta
            );
            const refactorDta = removeIfKeyAndGetDbProperty(visibilityDta);
            console.log(
              "Visibility DB Dataaa Converting refactorDta---->>>> ",
              refactorDta
            );
            refactorDta?.forEach((fieldDta): any => {
              console.log(
                "Visibility DB Dataaa Converting refactorDta fieldDta---->>>> ",
                fieldDta
              );
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
                },
              });
            });

            console.log(
              "Validation DB Dataaa showUpdatedDataArray ",
              showUpdatedDataArray
            );

            if (showUpdatedDataArray && showUpdatedDataArray.length) {
              console.log(
                "Validation DB Dataaa showUpdatedDataArray ",
                showUpdatedDataArray
              );
              console.log("Validation DB Dataaa showUpdatedDataArray ", [
                ...prevData,
                showUpdatedDataArray,
              ]);
              return [...prevData, ...showUpdatedDataArray];
            }
          }
        });
      });
    }
    setIsApiDataLoaded(true);
  }, [_visibilityRulePrev]);

  useEffect(() => {
    if (_documentOutputRulePrev?.length) {

      let key = 1;
      _documentOutputRulePrev.forEach((dbData) => {
        console.log("LOADINGGG", dbData);
        _setNestedRows((prevData: any) => {
          if (dbData?.docRuleOutput?.length) {
            const docRuleOutput = dbData?.docRuleOutput;
            const showUpdatedDocOutputDataArray: any[] = [];
            let docOutputDta = docRuleOutput;
            const refactorDta = removeIfKeyAndGetDbProperty(docOutputDta);
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
                },
              });
            });
            console.log(
              "Validation DB Dataaa showUpdatedDataArray ",
              showUpdatedDocOutputDataArray
            );
            if (
              showUpdatedDocOutputDataArray &&
              showUpdatedDocOutputDataArray.length
            ) {
              console.log(
                "Validation DB Dataaa showUpdatedDataArray ",
                showUpdatedDocOutputDataArray
              );
              console.log("Validation DB Dataaa showUpdatedDataArray ", [
                ...prevData,
                showUpdatedDocOutputDataArray,
              ]);
              return [...prevData, ...showUpdatedDocOutputDataArray];
            }
          }
        });
      });
      setIsApiDataLoaded(true);
    }
  }, [_documentOutputRulePrev]);

  // useEffect(() => {
  //   if (_enabledRulePrev?.length) {
  //     let key = 10;
  //     _enabledRulePrev.forEach((dbData) => {
  //       console.log("LOADINGGG", dbData)
  //       _setNestedRows((prevData: any) => {
  //         if (dbData?.validation?.length) {
  //           const visibilityString = dbData?.validation;
  //           const showUpdatedValidationDataArray: any[] = [];
  //           let validationDta = visibilityString;
  //           const refactorDta = removeIfKeyAndGetDbProperty(validationDta)
  //           refactorDta?.forEach((fieldDta): any => {
  //             showUpdatedValidationDataArray.push({
  //               [key++]: {
  //                 actions: [
  //                   {
  //                     checkBoxValues: [
  //                       {
  //                         enable: {
  //                           logicalName: "Enable",
  //                           value: "enable",
  //                         },
  //                       },
  //                     ],
  //                   },
  //                 ],
  //                 fields: normalConverter([fieldDta]),
  //               }
  //             })
  //           })

  //           console.log("Validation DB Dataaa showUpdatedDataArray ", showUpdatedValidationDataArray);

  //           if (showUpdatedValidationDataArray && showUpdatedValidationDataArray.length) {
  //             console.log("Validation DB Dataaa showUpdatedDataArray ", showUpdatedValidationDataArray);
  //             console.log("Validation DB Dataaa showUpdatedDataArray ", [...prevData, showUpdatedValidationDataArray]);
  //             return [...prevData, ...showUpdatedValidationDataArray]
  //           }
  //         }
  //       });
  //     })
  //   }
  // }, [_enabledRulePrev])

  useEffect(() => {
    if (_minMaxRulePrev?.length) {
      let key = 20;
      _minMaxRulePrev.forEach((dbData) => {
        console.log("LOADINGGG _minMaxRulePrev", dbData);
        _setNestedRows((prevData: any) => {
          if (dbData?.minMax) {
            const minMax = dbData?.minMax;
            const minMaxOutputDataArray: any[] = [];
            let minMaxDta = minMax;
            const refactorDta = removeMinMaxIfKeyAndGetDbProperty(minMaxDta);
            console.log("refactorDta Min Maxxx", refactorDta);
            refactorDta?.forEach((fieldDta: any): any => {
              const minimumLength = fieldDta?.minMax?.find(
                (x: { type: string }) => x?.type === "MINIMUM_LENGTH"
              );
              const maximumLength = fieldDta?.minMax?.find(
                (x: { type: string }) => x?.type === "MAXIMUM_LENGTH"
              );
              
              if ((minimumLength?.value && maximumLength?.value) || (minimumLength?.value?.var?.minValue && maximumLength?.value?.var?.maxValue)) {
                console.log("minimumLength Min ", minimumLength);
                console.log("maximumLength Max ", maximumLength);

                minMaxOutputDataArray.push({
                  [key++]: {
                    actions: [
                      {
                        minMax: {
                          logicalName: "minMax",
                          minValue:
                            minimumLength?.value?.var ? minimumLength?.value?.var : minimumLength.value,
                          maxValue:
                          maximumLength?.value?.var? maximumLength?.value?.var : maximumLength.value,
                        },
                      },
                    ],
                    fields: normalConverter([fieldDta?.ifConditions]),
                  },
                });
                }
            
            });
            console.log(
              "Validation DB Dataaa showUpdatedDataArray ",
              minMaxOutputDataArray
            );
            if (minMaxOutputDataArray && minMaxOutputDataArray.length) {
              console.log(
                "Validation DB Dataaa showUpdatedDataArray ",
                minMaxOutputDataArray
              );
              console.log("Validation DB Dataaa showUpdatedDataArray ", [
                ...prevData,
                minMaxOutputDataArray,
              ]);
              return [...prevData, ...minMaxOutputDataArray];
            }
          }
        });
      });
      setIsApiDataLoaded(true);
    }
  }, [_minMaxRulePrev]);

  const openNotificationWithIcon = (type: any, message: any) => {
    api[type]({
      message: type,
      description: message,
    });
  };

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

    if (
      logicalName &&
      currentPossitionDetails?.id &&
      (currentPossitionDetails?.currentPosition === "chapter" ||
        currentPossitionDetails?.currentPosition === "section")
    ) {
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
    } else if (
      logicalName &&
      currentPossitionDetails?.id &&
      currentPossitionDetails?.currentPosition === "question"
    ) {
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

      // validationRulePreviousValues = await fetchRequest(
      //   logicalName,
      //   currentPossitionDetails?.id,
      //   `?$select=${dbConstants.common.gyde_validationrule}`
      // );
      documentOutputRule = await fetchRequest(
        logicalName,
        currentPossitionDetails?.id,
        `?$select=${dbConstants.question.gyde_documentOutputRule}`
      );
    }

    console.log(
      "visibilityRulePreviousValues -----> ",
      visibilityRulePreviousValues
    );
    console.log("minMaxPreviousValues _result -----> ", minMaxPreviousValues);
    console.log(
      "validationRulePreviousValues _result -----> ",
      validationRulePreviousValues
    );

    if (visibilityRulePreviousValues?.data?.length)
      _setVisibilityRulePrev((prevData: any) => [
        ...prevData,
        { visibility: visibilityRulePreviousValues?.data },
      ]);
    if (minMaxPreviousValues?.data?.length)
      _setMinMaxRulePrev((prevData: any) => [
        ...prevData,
        { minMax: minMaxPreviousValues?.data },
      ]);
    // if (validationRulePreviousValues?.data?.length) _setEnabledPrev((prevData: any) => [...prevData, { validation: validationRulePreviousValues?.data }]);
    if (documentOutputRule?.data?.length)
      _setDocumentOutputRulePrev((prevData: any) => [
        ...prevData,
        { docRuleOutput: documentOutputRule?.data },
      ]);
    //test
    // _setVisibilityRulePrev((prevData: any) => [...prevData, {visibility: JSON.parse("[{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]},{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]}]},{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]},{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]}]}]}]}]") }]);
    // _setMinMaxRulePrev((prevData: any) => [...prevData, {minMax: [{"if":[{"and":[{"==":[{"var":"26862_C1_S1_001"},4]},{"==":[{"var":"26862_C1_S1_001"},5]},{"and":[{"==":[{"var":"26862_C1_S1_001"},6]}]}]},[{"type":"MINIMUM_LENGTH","value":13,"inclusive":true},{"type":"MAXIMUM_LENGTH","value":3,"inclusive":true}],{"if":[{"and":[{"==":[{"var":"26862_C1_S1_001"},4]},{"==":[{"var":"26862_C1_S1_001"},4]}]},[{"type":"MINIMUM_LENGTH","value":1,"inclusive":true},{"type":"MAXIMUM_LENGTH","value":2,"inclusive":true}]]}]}] }]);
    // _setMinMaxRulePrev((prevData: any) => [...prevData, {minMax: [{"if":[{"and":[{"==":[{"var":"26862_C1_S1_002"},4]},{"==":[{"var":"26862_C1_S1_001"},5]},{"and":[{"==":[{"var":"26862_C1_S1_002"},7]}]}]},[{"type":"MINIMUM_LENGTH","value":1,"inclusive":true},{"type":"MAXIMUM_LENGTH","value":{"var":"26862_C1_S1_002"},"inclusive":true}]]}]}]);
    // _setDocumentOutputRulePrev((prevData: any) => [...prevData, {docRuleOutput: JSON.parse("[{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]},{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]}]},{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]},{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]}]}]}]}]") }]);
    // _setEnabledPrev((prevData: any) => [...prevData, {validation: JSON.parse("[{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]},{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]}]},{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]},{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]}]}]}]}]") }]);
   
    
  };
  useEffect(() => {
    console.log("currentId ----->", currentPossitionDetails);
    getRequestedData();
    loadQuestionHandler();
  }, [currentPossitionDetails]);

  useEffect(() => {
    console.log("deleteSectionKey", deleteSectionKey)
    if(deleteSectionKey) 
    if (deleteSectionKey && _nestedRows?.length >= 2) {
      _setNestedRows((prevNestedRows: any) =>
         prevNestedRows.filter((key: any) => parseInt(Object.keys(key)[0]) !== deleteSectionKey)
      );
      setSections((prev: any) => prev.filter((prevKeys: any) => prevKeys.key !== deleteSectionKey))
    }
  }, [deleteSectionKey]);


  const _getCurrentState = async () => {
    const result = await getCurrentState();
    console.log("Current State Details ----> ", result);
    if (result?.data?.length) setCurrentPossitionDetails(result?.data[0]);
  };

  const saveVisibilityData = async (
    visibilityRule: any,
    validationRule: any,
    outputDocShow: any,
    minMaxDBFormatArray: any
  ) => {
    let logicalName;
    if (currentPossitionDetails?.currentPosition === "question") {
      logicalName = dbConstants.question.fieldName;
    } else if (currentPossitionDetails?.currentPosition === "section") {
      logicalName = dbConstants.section.fieldName;
    } else if (currentPossitionDetails?.currentPosition === "chapter") {
      logicalName = dbConstants.chapter.fieldName;
    }
    console.log("logicalName when saving", logicalName);
    console.log(
      "logicalName when saving currentPossitionDetails",
      currentPossitionDetails
    );

    if (
      currentPossitionDetails?.id &&
      (currentPossitionDetails.currentPosition === "section" ||
        currentPossitionDetails?.currentPosition === "chapter")
    ) {
      await saveRequest(logicalName, currentPossitionDetails?.id, {
        [dbConstants.common.gyde_visibilityrule]:
          JSON.stringify(visibilityRule),
      });
    } else if (
      currentPossitionDetails?.id &&
      currentPossitionDetails?.currentPosition === "question"
    ) {
      await saveRequest(logicalName, currentPossitionDetails?.id, {
        [dbConstants.common.gyde_visibilityrule]:
          JSON.stringify(visibilityRule),
      });
      await saveRequest(logicalName, currentPossitionDetails?.id, {
        [dbConstants.question.gyde_minmaxvalidationrule]:
          JSON.stringify(minMaxDBFormatArray),
      });
      // await saveRequest(
      //   logicalName,
      //   currentPossitionDetails?.id,
      //   {
      //     [dbConstants.common.gyde_validationrule]:
      //       JSON.stringify(validationRule),
      //   }
      // );
      await saveRequest(logicalName, currentPossitionDetails?.id, {
        [dbConstants.question.gyde_documentOutputRule]:
          JSON.stringify(outputDocShow),
      });
    }
    openNotificationWithIcon("success", "Data Saved!");
  };
  const handleSaveLogic = () => {
    let minMaxDBFormatArray: any = [];
    let visibilityRule: any = [];
    let outputDocShow: any = [];
    let validationRule: any = [];
    let sampleRetrieveFormat: any = [];

    _nestedRows.forEach((sec: any) => {
      console.log("SECCCCCCCC", sec);
      const key = Object.keys(sec)[0];

      const checkboxValues = sec[key]?.actions[0]?.checkBoxValues;
      const minMaxExists =
        Object.keys(sec[key]?.actions[0]?.minMax || {}).length !== 0;
      const isShowExists = checkboxValues?.some(
        (x: any) => Object.keys(x)[0] === "show"
      );
      const isOutputDocShowExists = checkboxValues?.some(
        (x: any) => Object.keys(x)[0] === "OutPutDoc:Show"
      );
      const isEnableExists = checkboxValues?.some(
        (x: any) => Object.keys(x)[0] === "enable"
      );
      console.log("checkboxValues ----> ", checkboxValues);
      console.log("minMaxExists ----> ", minMaxExists);
      console.log("isShowExists ----> ", isShowExists);
      console.log("isOutputDocShowExists ----> ", isOutputDocShowExists);
      console.log("isEnableExists ----> ", isEnableExists);

      if (checkboxValues) {
        console.log(
          "checkBoxValues when saving ----> ",
          sec[key]?.actions[0]?.checkBoxValues[0]
        );
        if (isShowExists) {
          console.log(
            "Show saving logic",
            convertJSONFormatToDBFormat(sec[key], true)
          );
          visibilityRule = findAndUpdateLastNestedIf(
            visibilityRule,
            { if: [convertJSONFormatToDBFormat(sec[key], true)] },
            false
          );
          console.log("Show saving logic visibilityRule", visibilityRule);
        }
        if (isOutputDocShowExists) {
          console.log(
            "outputDoc saving logic",
            convertJSONFormatToDBFormat(sec[key], true)
          );
          outputDocShow = findAndUpdateLastNestedIf(
            outputDocShow,
            { if: [convertJSONFormatToDBFormat(sec[key], true)] },
            false
          );
          // outputDocShow.push(convertJSONFormatToDBFormat(sec[key], false))
        }
        if (isEnableExists) {
          console.log(
            "enable saving logic",
            convertJSONFormatToDBFormat(sec[key], true)
          );
          validationRule = findAndUpdateLastNestedIf(
            validationRule,
            { if: [convertJSONFormatToDBFormat(sec[key], true)] },
            false
          );
          // validationRule.push(convertJSONFormatToDBFormat(sec[key], true))
        }
      }

      if (minMaxExists) {
        console.log("Min Max when saving ----> ", sec[key].actions[0]?.minMax);

        const minMax = sec[key]?.actions[0]?.minMax;
        let minValue = minMax?.minValue;
        let maxValue = minMax?.maxValue;
        console.log("Min Max ", minMax);

        if (minMax && minMax?.minValue && minMax?.maxValue) {
          if (typeof minMax.minValue === "string") {
            minValue = {
              var: minMax?.minValue,
            };
          }
          if (typeof minMax.maxValue === "string") {
            maxValue = {
              var: minMax?.maxValue,
            };
          }
          minMaxDBFormatArray = findAndUpdateLastNestedIf(
            minMaxDBFormatArray,
            {
              if: [
                convertJSONFormatToDBFormat(sec[key], true),
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
            },
            true
          );
        }
      }
    });

    console.log("Save MinMax Reqq ------> ", minMaxDBFormatArray);
    console.log("Save Visibility Rule Reqq ------> ", visibilityRule);
    console.log("Save outputDocShow Rule Reqq ------> ", outputDocShow);
    console.log("Save validationRule Rule Reqq ------> ", validationRule);

    if (validation?.minMaxValidation && validation.andOrValidation && validation.nestingLevelValidation) {
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
  
        saveVisibilityData(
          visibilityRule,
          validationRule,
          outputDocShow,
          minMaxDBFormatArray
        );
      }
    } else {
      openNotificationWithIcon("error", "Validation Must be passed!")
    }

  };

  return (
    <div>
      {contextHolder}
      <div>
      </div>
      {isApiDataLoaded ? (
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
                      questionList={questionList}
                      setValidation={setValidation}
                      setDeleteSectionKey={setDeleteSectionKey}
                    />
                  </div>
                ))}

              {_nestedRows?.length > 0 && (
                <div className="text-right">
                  <Button
                    onClick={handleSaveLogic}
                    className="mr-10 btn-primary"
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <Space size="middle">
          {" "}
          <Spin />{" "}
        </Space>
      )}
    </div>
  );
};

export default ParentComponent;
