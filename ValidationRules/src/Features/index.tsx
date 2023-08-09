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
import { Button, notification, Space, Spin } from "antd";
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
import { hasNullFields } from "../Utils/utilsHelper";
// import NotificationPopup from "../Components/NotificationPopup";

const ParentComponent = ({imageUrl, imageUrl1, imageUrl2}: {imageUrl: string, imageUrl1: string, imageUrl2: string}) => {
  const [conditionData, setConditionData] = useState<any[]>([]);

  // Get From XRM Requests
  const [sections, setSections] = useState<any[]>([]);
  const [isLoadData, setIsLoadData] = useState<boolean>(false);
  const [_nestedRows, _setNestedRows] = useState<any>([]);
  const [isNested, setIsNested] = useState<any>();
  // const [currentPossitionDetails, setCurrentPossitionDetails] = useState<any>();
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
    nestingLevelValidation: true,
  });
  const [saveAsIsNested, setSaveAsIsNested] = useState<boolean>(false);
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
    setSaveAsIsNested(true);
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
    setIsApiDataLoaded(true);
    const result = await loadAllQuestionsInSurvey();
    console.log("resss =====> ", result);
    let questionListArray = result.data || [];
    if (questionListArray && questionListArray.length) {
      const formattedQuestionList = questionListArray.map((quesNme: any) => {
        if (
          quesNme &&
          quesNme[
            "gyde_answertype@OData.Community.Display.V1.FormattedValue"
          ] !== "Grid" &&
          quesNme[
            "gyde_answertype@OData.Community.Display.V1.FormattedValue"
          ] !== "Header"
        )
          return {
            label: quesNme.gyde_name,
            value: quesNme.gyde_name,
            questionType:
              quesNme[
                "gyde_answertype@OData.Community.Display.V1.FormattedValue"
              ],
            questionId: quesNme?.gyde_surveytemplatechaptersectionquestionid,
          };
      });
      formattedQuestionList &&
        formattedQuestionList.length &&
        setQuestionList(formattedQuestionList?.filter((x: any) => x));
    } else {
      setQuestionList([]);
    }
    setIsApiDataLoaded(false);
  };

  useEffect(() => {
    console.log("SECCCC", sections);
  }, [sections]);

  useEffect(() => {
    console.log("questionList", questionList);
  }, [questionList]);

  useEffect(() => {
    setSections(
      _nestedRows
        ?.map((item: {}) => Object.keys(item))
        ?.flat()
        ?.map((key: any) => ({ key: parseInt(key) }))
        .sort((a: { key: number }, b: { key: number }) => a.key - b.key)
    );
    if (_nestedRows?.length === 0 || !_nestedRows?.length)
      setIsApiDataLoaded(false);
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
    console.log("imageUrl, imageUrl1, imageUrl2", imageUrl, imageUrl1, imageUrl2)
  }, []);

  useEffect(() => {
    console.log("_visibilityRulePrev", _visibilityRulePrev)
    if (_visibilityRulePrev?.length) {
      let key = 30;
      _visibilityRulePrev.forEach((dbData) => {
        console.log("Loading Visibility Data", dbData);
        _setNestedRows((prevData: any) => {
          if (dbData?.visibility?.length) {
            const visibilityString = dbData.visibility;
            const showUpdatedDataArray: any[] = [];
            let visibilityDta = visibilityString;
            let refactorDta = visibilityDta;
            const isRetrieveAsNormal = visibilityDta?.some(
              (x: any) => x?.or?.length || x?.and?.length
            );
            const isFirstExp = visibilityDta?.some(
              (x: any) => !Object.keys(x)[0]
            );
            const isAllAreNormal = visibilityDta?.every((x: { or: any[]; }) => {
              const keys = x?.or?.map((x: {}) => Object.keys(x)[0])
                return keys?.includes('and') || keys?.includes('or')
              })
            console.log("Fetch Type isRetrieveAsNormal ", isRetrieveAsNormal);
            console.log("Fetch Type isFirstExp", isFirstExp);
            console.log("Fetch Type isAllAreNormal", isAllAreNormal);

            if (isAllAreNormal) {
              refactorDta = visibilityDta[0]?.or
            } else if (isRetrieveAsNormal) {
              // refactorDta = visibilityDta[0]?.or?.length ? visibilityDta[0]?.or : visibilityDta[0]?.and
              refactorDta = visibilityDta;
            } else if (isFirstExp) { 
              // refactorDta = visibilityDta;
              refactorDta = [ { or: Object.values(visibilityDta[0])[0] } ]
            } else {
              refactorDta = removeIfKeyAndGetDbProperty(visibilityDta);
            }

            console.log(
              "Visibility DB Dataaa Converting refactorDtaaaa",
              refactorDta
            );
            if (refactorDta && refactorDta?.length) {
              refactorDta?.forEach((fieldDta: any): any => {
                console.log(
                  "Each Section Field Data",
                  fieldDta
                );
                let _fieldDta = JSON.parse(JSON.stringify(fieldDta));

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
                    fields: normalConverter([_fieldDta]),
                  },
                });
              });
  
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
            
          }
        });
      });
      setIsApiDataLoaded(false);
    }
  }, [_visibilityRulePrev]);

  useEffect(() => {
    if (_documentOutputRulePrev?.length) {
      let key = 1;
      _documentOutputRulePrev.forEach((dbData) => {
        console.log("Loading Document Output Data", dbData);
        _setNestedRows((prevData: any) => {
          if (dbData?.docRuleOutput?.length) {
            const docRuleOutput = dbData?.docRuleOutput;
            const showUpdatedDocOutputDataArray: any[] = [];
            let docOutputDta = docRuleOutput;
            // const refactorDta = removeIfKeyAndGetDbProperty(docOutputDta);
            // let visibilityDta = docOutputDta;
            console.log(
              "Document Data Converting ---->>>> ",
              docOutputDta
            );
            const isRetrieveAsNormal = docRuleOutput?.some(
              (x: any) => x?.or?.length || x?.and?.length
            );
            const isFirstExp = docRuleOutput?.some(
              (x: any) => !Object.keys(x)[0]
            );
            const isAllAreNormal = docRuleOutput?.every((x: { or: any[]; }) => {
              const keys = x?.or?.map((x: {}) => Object.keys(x)[0])
                return keys?.includes('and') || keys?.includes('or')
              })
            console.log("Fetch Type isRetrieveAsNormal ", isRetrieveAsNormal);
            console.log("Fetch Type isFirstExp", isFirstExp);
            console.log("Fetch Type isAllAreNormal", isAllAreNormal);

            if (isAllAreNormal) {
              docOutputDta = docRuleOutput[0]?.or
            } else if (isRetrieveAsNormal) {
              // refactorDta = visibilityDta[0]?.or?.length ? visibilityDta[0]?.or : visibilityDta[0]?.and
              docOutputDta = docRuleOutput;
            } else if (isFirstExp) { 
              // refactorDta = visibilityDta;
              docOutputDta = [ { or: Object.values(docRuleOutput[0])[0] } ]
            } else {
              docOutputDta = removeIfKeyAndGetDbProperty(docRuleOutput);
            }

            if (docOutputDta && docOutputDta?.length) {
              docOutputDta?.forEach((fieldDta: any): any => {
                console.log("Document Output DB Dataaa Converting", fieldDta);
                let _fieldDta = JSON.parse(JSON.stringify(fieldDta));

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
                    fields: normalConverter([_fieldDta]),
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
          }
        });
      });
      setIsApiDataLoaded(false);
    }
  }, [_documentOutputRulePrev]);

  useEffect(() => {
    if (_minMaxRulePrev?.length) {
      let key = 20;
      _minMaxRulePrev.forEach((dbData) => {
        console.log("Loading _minMaxRulePrev", dbData);
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

              if (
                (minimumLength?.value && maximumLength?.value) ||
                (minimumLength?.value?.var?.minValue &&
                  maximumLength?.value?.var?.maxValue)
              ) {
                console.log("minimumLength Min ", minimumLength);
                console.log("maximumLength Max ", maximumLength);

                minMaxOutputDataArray.push({
                  [key++]: {
                    actions: [
                      {
                        minMax: {
                          logicalName: "minMax",
                          minValue: minimumLength?.value?.var
                            ? minimumLength?.value?.var
                            : minimumLength.value,
                          maxValue: maximumLength?.value?.var
                            ? maximumLength?.value?.var
                            : maximumLength.value,
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
      setIsApiDataLoaded(false);
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
    setIsApiDataLoaded(false);
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
    if (visibilityRulePreviousValues?.data?.length) {
      console.log(
        "visibilityRulePreviousValues -----> ",
        visibilityRulePreviousValues
      );
      let _visibilityRulePreviousValues = JSON.parse(JSON.stringify(visibilityRulePreviousValues));
      _setVisibilityRulePrev((prevData: any) => [
        ...prevData,
        { visibility: _visibilityRulePreviousValues?.data },
      ]);
    }
      
    if (minMaxPreviousValues?.data?.length) {
      let _minMaxPreviousValues = JSON.parse(JSON.stringify(minMaxPreviousValues));
      _setMinMaxRulePrev((prevData: any) => [
        ...prevData,
        { minMax: _minMaxPreviousValues?.data },
      ]);
    }
      
    // if (validationRulePreviousValues?.data?.length) _setEnabledPrev((prevData: any) => [...prevData, { validation: validationRulePreviousValues?.data }]);
    if (documentOutputRule?.data?.length) {
      let _documentOutputRule = JSON.parse(JSON.stringify(documentOutputRule));
      _setDocumentOutputRulePrev((prevData: any) => [
        ...prevData,
        { docRuleOutput: _documentOutputRule?.data },
      ]);
    }
     
    //test
    // _setVisibilityRulePrev((prevValue) => [
    //   ...prevValue,
    //   {
    //     visibility: [{ "or": [ { "or": [ { "==": [ { "var": "NTemp_C01_s01_rd" }, " 2213" ] }, { "==": [ { "var": "NTemp_C01_s01_rd" }, " 2aws" ] } ] }, { "and": [ { "==": [ { "var": "NTemp_C01_04_Q_04" }, "2023-08-02" ] }, { "==": [ { "var": "NTemp_C01_s01_rd" }, "2qawd" ] }, { "==": [ { "var": "NTemp_C01_s01_rd" }, "22213" ] } ] } ] }]
    //   }
    // ])
    
    // _setVisibilityRulePrev((prevValue) => [
    //   ...prevValue,
    //   {
    //     visibility: [ { "or": [ { "==": [ { "var": "NTemp_C01_s01_rd" }, " 222" ] }, { "==": [ { "var": "NTemp_C01_s01_rd" }, "222" ] }, { "==": [ { "var": "NTemp_C01_s01_rd" }, " 222123" ] } ] }, { "and": [ { "==": [ { "var": "NTemp_C01_04_Q_04" }, "2023-08-08" ] }, { "==": [ { "var": "NTemp_C01_04_Q_04" }, "2023-08-23" ] }, { "==": [ { "var": "NTemp_C2_S1_Q1" }, " 222" ] } ] } ]
    //   }
    // ])
    // _setVisibilityRulePrev((prevData: any) => [
    //   ...prevData,
    //   {
    //     visibility: [ { "": [ { "==": [ { "var": "NTemp_C01_04_Q_04" }, "2023-08-08" ] } ] } ],
    //   },
    // ]);
    // _setMinMaxRulePrev((prevData: any) => [...prevData, {minMax: [{"if":[{"and":[{"==":[{"var":"NTemp_C01_04_Q_04"},"2021-10-10"]},{"==":[{"var":"NTemp_C01_04_Q_04"},5]},{"and":[{"==":[{"var":"26862_C1_S1_001"},6]}]}]},[{"type":"MINIMUM_LENGTH","value":13,"inclusive":true},{"type":"MAXIMUM_LENGTH","value":3,"inclusive":true}],{"if":[{"and":[{"==":[{"var":"26862_C1_S1_001"},4]},{"==":[{"var":"26862_C1_S1_001"},4]}]},[{"type":"MINIMUM_LENGTH","value":1,"inclusive":true},{"type":"MAXIMUM_LENGTH","value":2,"inclusive":true}]]}]}] }]);
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
    console.log("deleteSectionKey", deleteSectionKey);
    if (deleteSectionKey) {
      _setNestedRows((prevNestedRows: any) =>
        prevNestedRows.filter(
          (key: any) => parseInt(Object.keys(key)[0]) !== deleteSectionKey
        )
      );
      setSections((prev: any) =>
        prev.filter((prevKeys: any) => prevKeys.key !== deleteSectionKey)
      );
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
    let minMaxDBFormatArrayNormal: any = [];

    let visibilityRule: any = [];
    let visibilityRuleNormal: any = [];

    let outputDocShow: any = [];
    let outputDocShowNormal: any = [];

    let validationRule: any = [];
    let validationRuleNormal: any = [];

    let showIfCount = 0;
    let outputDocShowCount = 0;

    if (!validation.minMaxValidation) {
      openNotificationWithIcon("error", "MinMax Validation Must be passed!");
      return;
    }

    const isAtLeastOneActionNotEmpty = _nestedRows?.map((item: any[]) => {
      const actions = Object.values(item)[0]?.actions;
      return actions && Array.isArray(actions) && actions?.length > 0;
    });

    if (!isAtLeastOneActionNotEmpty.some((x: boolean) => x === true)) {
      openNotificationWithIcon("error", "One Action(s) Has to be selected!");
      return;
    }

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

      let prepareForValidation = JSON.parse(JSON.stringify(sec[key].fields));
      console.log("prepareForValidation", prepareForValidation);
      prepareForValidation[0].expression = "Emp";
      const _hasNullFields = hasNullFields(prepareForValidation);
      if (_hasNullFields) {
        openNotificationWithIcon("error", "Fields cannot be empty!");
        return;
      }

      if (checkboxValues) {
        console.log(
          "checkBoxValues when saving ----> ",
          sec[key]?.actions[0]?.checkBoxValues[0]
        );
        if (isShowExists) {
          // showIfCount = showIfCount + 1;
          // const _visibility = convertJSONFormatToDBFormat(sec[key], true);
          // if (showIfCount > 1) {
          //   visibilityRule = findAndUpdateLastNestedIf(
          //     visibilityRule,
          //     { if: [_visibility] },
          //     false
          //   );
          // } else {
          //   visibilityRuleNormal.push(_visibility);
          //   visibilityRule = findAndUpdateLastNestedIf(
          //     visibilityRule,
          //     { if: [_visibility] },
          //     false
          //   );
          // }
          showIfCount = showIfCount + 1;
          const _visibility = convertJSONFormatToDBFormat(sec[key], true);
            visibilityRuleNormal.push(_visibility);
            visibilityRule = findAndUpdateLastNestedIf(
              visibilityRule,
              { if: [_visibility] },
              false
            )
        }
        if (isOutputDocShowExists) {
          outputDocShowCount = outputDocShowCount + 1;
          const _outputDocShow = convertJSONFormatToDBFormat(sec[key], true);

          // if (outputDocShowCount > 1) {
          //   outputDocShow = findAndUpdateLastNestedIf(
          //     outputDocShow,
          //     { if: [_outputDocShow] },
          //     false
          //   );
          // } else {
          //   outputDocShowNormal.push(_outputDocShow);
          //   outputDocShow = findAndUpdateLastNestedIf(
          //     outputDocShow,
          //     { if: [_outputDocShow] },
          //     false
          //   );
          // }
            outputDocShowNormal.push(_outputDocShow);
            outputDocShow = findAndUpdateLastNestedIf(
              outputDocShow,
              { if: [_outputDocShow] },
              false
            );
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
          validationRuleNormal.push(
            convertJSONFormatToDBFormat(sec[key], true)
          );
          // validationRule.push(convertJSONFormatToDBFormat(sec[key], true))
        }
      }

      if (minMaxExists) {
        console.log("Min Max when saving ----> ", sec[key].actions[0]?.minMax);
        const _minMaxDbFormarFields = convertJSONFormatToDBFormat(
          sec[key],
          true
        );
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
                _minMaxDbFormarFields,
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



    console.log("Show saving logic visibilityRule", visibilityRule);
    console.log("Show saving logic visibilityRuleNormal", visibilityRuleNormal);

    console.log("Show saving logic ValidationRule", validationRule);
    console.log("Show saving logic Validation Rule Normal", validationRuleNormal);

    console.log("Show saving logic OutputDoc Show", outputDocShow);
    console.log("Show saving logic Output Doc Show Normal", outputDocShowNormal);

    console.log("Show saving logic Min Max Rule", minMaxDBFormatArray);
    
    let savedVisibilityRuleFinalFormat;
    let savedValidationRuleFinalFormat;
    let savedOutputDocShowRuleFinalFormat;
    let savedMinMaxRuleFinalFormat;

    if (!saveAsIsNested) {
      if (visibilityRuleNormal.length > 0 && Object.keys(visibilityRuleNormal[0])[0] === "") {
          savedVisibilityRuleFinalFormat = visibilityRuleNormal
      }
      else {
        savedVisibilityRuleFinalFormat = [{
          "or": visibilityRuleNormal
        }]
      }
      
      if (validationRuleNormal.length > 0 &&  Object.keys(validationRuleNormal[0])[0] === "") {
        savedValidationRuleFinalFormat = validationRuleNormal
      }
      else {
        savedValidationRuleFinalFormat = [{
          "or": validationRuleNormal
        }]
      }

      if (outputDocShowNormal.length > 0 && Object.keys(outputDocShowNormal[0])[0] === "") {
        savedOutputDocShowRuleFinalFormat = outputDocShowNormal
      }
      else {
        savedOutputDocShowRuleFinalFormat = [{
          "or": outputDocShowNormal
        }]
      }
  
        savedMinMaxRuleFinalFormat = minMaxDBFormatArray
    } else {
      // if (
      //   (visibilityRule && visibilityRule.length) ||
      //   (minMaxDBFormatArray && minMaxDBFormatArray.length) ||
      //   (outputDocShow && outputDocShow.length) ||
      //   (validationRule && validationRule.length) ||
      //   (visibilityRuleNormal && visibilityRuleNormal.length) ||
      //   (outputDocShowNormal && outputDocShowNormal.length)
      // ) {
        console.log("DATA Saving visibilityRule", visibilityRule);
        console.log("DATA Saving validationRule", validationRule);
        console.log("DATA Saving outputDocShow", outputDocShow);
        console.log("DATA Saving minMaxDBFormatArray", minMaxDBFormatArray);

        savedVisibilityRuleFinalFormat = visibilityRule
        savedValidationRuleFinalFormat = validationRule
        savedOutputDocShowRuleFinalFormat = outputDocShow
        savedMinMaxRuleFinalFormat = minMaxDBFormatArray

        // saveVisibilityData(
        //   showIfCount > 1 ? visibilityRule : visibilityRuleNormal,
        //   validationRule,
        //   outputDocShowCount > 1 ? outputDocShow : outputDocShowNormal,
        //   minMaxDBFormatArray
        // );
      // }
    }


    console.log("savedVisibilityRuleFinalFormat", savedVisibilityRuleFinalFormat);
    console.log("savedValidationRuleFinalFormat", savedValidationRuleFinalFormat);

    console.log("savedOutputDocShowRuleFinalFormat", savedOutputDocShowRuleFinalFormat);
    console.log("savedMinMaxRuleFinalFormat", savedMinMaxRuleFinalFormat);

    if (validation?.minMaxValidation &&
      validation.andOrValidation &&
      validation.nestingLevelValidation) {
      saveVisibilityData(
        savedVisibilityRuleFinalFormat,
        savedValidationRuleFinalFormat,
        savedOutputDocShowRuleFinalFormat,
        savedMinMaxRuleFinalFormat
          );
    } else {
      openNotificationWithIcon("error", "Validation Must be passed!");
    }
  };

  return (
    <div>
      {contextHolder}
      <div></div>
      {!isApiDataLoaded ? (
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
                      setSaveAsIsNested={setSaveAsIsNested}
                      imageUrls={{ imageUrl, imageUrl1, imageUrl2 }}
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
            <div>
              <div>
              Questions Loading!
              </div>
              <div>
              <Spin />
              </div>
            
          </div>
        </Space>
      )}
    </div>
  );
};

export default ParentComponent;
