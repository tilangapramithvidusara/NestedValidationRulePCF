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
  getPublishedStatus,
} from "../XRMRequests/xrmRequests";
import { dbConstants } from "../constants/dbConstants";
import { normalConverter } from "../Utils/dbFormatToJson";
import { hasNullFields } from "../Utils/utilsHelper";
// import NotificationPopup from "../Components/NotificationPopup";

const ParentComponent = ({
  imageUrl,
  imageUrl1,
  imageUrl2,
}: {
  imageUrl: string;
  imageUrl1: string;
  imageUrl2: string;
}) => {
  const [conditionData, setConditionData] = useState<any[]>([]);

  // Get From XRM Requests
  const [sections, setSections] = useState<any[]>([]);
  const [isLoadData, setIsLoadData] = useState<boolean>(false);
  const [_nestedRows, _setNestedRows] = useState<any>([]);
  const [isNested, setIsNested] = useState<any>();
  const [currentPossitionDetails, setCurrentPossitionDetails] = useState<any>();
  // const [currentPossitionDetails, setCurrentPossitionDetails] = useState<any>({
  //   currentPosition: "question",
  // });
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
  const [suerveyIsPublished, setSuerveyIsPublished] = useState<boolean>(false);
  const [currentQuestionDetails, setCurrentQuestionDetails] = useState<any>(null);

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
          quesNme
          // quesNme[
          //   "gyde_answertype@OData.Community.Display.V1.FormattedValue"
          // ] !== "Grid" &&
          // quesNme[
          //   "gyde_answertype@OData.Community.Display.V1.FormattedValue"
          // ] !== "Header"
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
        setIsApiDataLoaded(false);
    } else {
      setQuestionList([]);
      setIsApiDataLoaded(false);
    }
    
  };

  useEffect(() => {
    console.log("currentPossitionDetails 1", currentPossitionDetails);
    console.log("questionList 1", questionList);

    if (questionList && questionList?.length && currentPossitionDetails?.currentPosition === "question") {
        const currnetQuestionDetails = questionList?.find(ques => ques?.questionId === currentPossitionDetails?.id?.toLowerCase())
        setCurrentQuestionDetails(currnetQuestionDetails)
    }
  }, [questionList, currentPossitionDetails]);

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
    console.log(
      "imageUrl, imageUrl1, imageUrl2",
      imageUrl,
      imageUrl1,
      imageUrl2
    );
  }, []);

  useEffect(() => {
    console.log("_visibilityRulePrev", _visibilityRulePrev);
    if (_visibilityRulePrev?.length) {
      let key = 30;
      _visibilityRulePrev.forEach((dbData) => {
        console.log("Loading Visibility Data", dbData);
        _setNestedRows((prevData: any) => {
          let visibilityString = dbData?.visibility?.if?.length ? dbData?.visibility?.if : [dbData?.visibility]
          console.log("visibilityString", visibilityString);
          if (visibilityString) {
            // const visibilityString = dbData?.visibility?.if;
            const showUpdatedDataArray: any[] = [];
            let visibilityDta = visibilityString;
            let refactorDta = visibilityDta;
            const isRetrieveAsNormal = visibilityDta?.some(
              (x: any) => x?.or?.length || x?.and?.length
            );
            const isFirstExp = visibilityDta?.some(
              (x: any) => !Object.keys(x)[0]
            );
            const isAllAreNormal = visibilityDta?.every((x: { or: any[] }) => {
              const keys = x?.or?.map((x: {}) => Object.keys(x)[0]);
              return keys?.includes("and") || keys?.includes("or");
            });
            const isNestedIfs = visibilityDta?.some((x: {}) => Object.keys(x)[0] === 'if')
            console.log("Fetch Type isRetrieveAsNormal ", isRetrieveAsNormal);
            console.log("Fetch Type isFirstExp", isFirstExp);
            console.log("Fetch Type isAllAreNormal", isAllAreNormal);
            console.log("Fetch Type isNestedIfs", isNestedIfs);

            if (isNestedIfs) {
              refactorDta = removeIfKeyAndGetDbProperty(visibilityDta);
            }
            else if (isAllAreNormal) {
              refactorDta = visibilityDta[0]?.or;
            } else if (isRetrieveAsNormal) {
              // refactorDta = visibilityDta[0]?.or?.length ? visibilityDta[0]?.or : visibilityDta[0]?.and
              refactorDta = visibilityDta;
            } else if (isFirstExp) {
              // refactorDta = visibilityDta;
              refactorDta = [{ or: Object.values(visibilityDta[0])[0] }];
            } else {
              refactorDta = removeIfKeyAndGetDbProperty(visibilityDta);
            }

            console.log(
              "Visibility DB Dataaa Converting refactorDtaaaa",
              refactorDta
            );
            if (refactorDta && refactorDta?.length) {
              refactorDta?.forEach((fieldDta: any): any => {
                console.log("Each Section Field Data", fieldDta);
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
          let docRuleOutput = dbData?.docRuleOutput?.if?.length ? dbData?.docRuleOutput?.if : [dbData?.docRuleOutput]
          console.log("docRuleOutput String", docRuleOutput);
          if (docRuleOutput) {
            // docRuleOutput = dbData?.docRuleOutput?.if;
            const showUpdatedDocOutputDataArray: any[] = [];
            let docOutputDta = docRuleOutput;
            // const refactorDta = removeIfKeyAndGetDbProperty(docOutputDta);
            // let visibilityDta = docOutputDta;
            console.log("Document Data Converting ---->>>> ", docOutputDta);
            const isRetrieveAsNormal = docRuleOutput?.some(
              (x: any) => x?.or?.length || x?.and?.length
            );
            const isFirstExp = docRuleOutput?.some(
              (x: any) => !Object.keys(x)[0]
            );
            const isAllAreNormal = docRuleOutput?.every((x: { or: any[] }) => {
              const keys = x?.or?.map((x: {}) => Object.keys(x)[0]);
              return keys?.includes("and") || keys?.includes("or");
            });
            const isNestedIfs = docRuleOutput?.some((x: {}) => Object.keys(x)[0] === 'if')

            console.log("Fetch Type isRetrieveAsNormal ", isRetrieveAsNormal);
            console.log("Fetch Type isFirstExp", isFirstExp);
            console.log("Fetch Type isAllAreNormal", isAllAreNormal);
            console.log("Fetch Type isNestedIfs", isNestedIfs);

            if (isNestedIfs) {
              docOutputDta = removeIfKeyAndGetDbProperty(docRuleOutput);
            }
            else if (isAllAreNormal) {
              docOutputDta = docRuleOutput[0]?.or;
            } else if (isRetrieveAsNormal) {
              // refactorDta = visibilityDta[0]?.or?.length ? visibilityDta[0]?.or : visibilityDta[0]?.and
              docOutputDta = docRuleOutput;
            } else if (isFirstExp) {
              // refactorDta = visibilityDta;
              docOutputDta = [{ or: Object.values(docRuleOutput[0])[0] }];
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
          if (dbData?.minMax?.length?.if) {
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
    if (visibilityRulePreviousValues?.data && Object.keys(visibilityRulePreviousValues?.data).length !== 0) {
      console.log(
        "visibilityRulePreviousValues -----> ",
        visibilityRulePreviousValues
      );
      let _visibilityRulePreviousValues = JSON.parse(
        JSON.stringify(visibilityRulePreviousValues)
      );
      _setVisibilityRulePrev((prevData: any) => [
        ...prevData,
        { visibility: _visibilityRulePreviousValues?.data },
      ]);
    }

    if (minMaxPreviousValues?.data && Object.keys(minMaxPreviousValues?.data).length !== 0) {
      let _minMaxPreviousValues = JSON.parse(
        JSON.stringify(minMaxPreviousValues)
      );
      _setMinMaxRulePrev((prevData: any) => [
        ...prevData,
        { minMax: _minMaxPreviousValues?.data },
      ]);
    }

    // if (validationRulePreviousValues?.data?.length) _setEnabledPrev((prevData: any) => [...prevData, { validation: validationRulePreviousValues?.data }]);
    if (documentOutputRule?.data && Object.keys(documentOutputRule?.data).length !== 0) {
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
    //     visibility:
    //     {"if":[{"and":[{"==":[{"var":"IDGR1_C1_S1_002"},"3"]},{"==":[{"var":"IDGR1_C1_S1_003"},"Y"]}]},{"if":[{"or":[{"==":[{"var":"IDGR1_C1_S1_002"},"222"]},{"==":[{"var":"IDGR1_C1_S1_002"},"344"]},{"and":[{"==":[{"var":"IDGR1_C1_S1_002"},"4444"]},{"==":[{"var":"IDGR1_C1_S1_003"},"Y"]},{"and":[{"==":[{"var":"IDGR1_C1_S1_002"},"444"]},{"==":[{"var":"IDGR1_C1_S1_002"},"5555"]}]}]}]},{"if":[{"and":[{"==":[{"var":"IDGR1_C1_S1_002"},"1234"]},{"==":[{"var":"IDGR1_C1_S1_002"},"33"]},{"and":[{"==":[{"var":"IDGR1_C1_S1_002"},"222"]},{"==":[{"var":"IDGR1_C1_S1_002"},"1234"]}]}]}]}]}]}
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
    // _setDocumentOutputRulePrev((prevData: any) => [...prevData, { docRuleOutput: [ { "if": [ { "and": [ { "==": [ { "var": "NTemp_C01_s01_rd" }, "1111 " ] }, { "==": [ { "var": "NTemp_C01_s01_rd" }, " 1223" ] }, { "or": [ { "==": [ { "var": "NTemp_C01_s01_rd" }, " 4455" ] }, { "==": [ { "var": "NTemp_C01_s01_rd" }, "2445" ] } ] } ] } ] } ]}]);
    // _setEnabledPrev((prevData: any) => [...prevData, {validation: JSON.parse("[{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]},{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]}]},{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]},{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]}]}]}]}]") }]);
  };
  const getCurrentPublishedStatus = async () => {
    
    const { data = null } = await getPublishedStatus(currentPossitionDetails);
    console.log("Published Status", data);
    if(data?.isPublished) setSuerveyIsPublished(data?.isPublished);
  }
  useEffect(() => {
    console.log("currentId ----->", currentPossitionDetails);

    getRequestedData();
    loadQuestionHandler();
    if (currentPossitionDetails) {
      getCurrentPublishedStatus();
    }


  }, [currentPossitionDetails]);

  useEffect(() => {
    console.log("deleteSectionKey", deleteSectionKey);
    if (deleteSectionKey) {
      _setNestedRows((prevNestedRows: any) => {
        if (prevNestedRows && prevNestedRows.length === 1) {
          saveVisibilityData({}, {}, {}, {});
        }
        return prevNestedRows.filter(
          (key: any) => parseInt(Object.keys(key)[0]) !== deleteSectionKey
        )
      }
        
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
      console.log("Before Saving visibilityRule", visibilityRule);
      console.log("Before Saving minMaxDBFormatArray", minMaxDBFormatArray)
      console.log("Before Saving outputDocShow", outputDocShow)
     
        await saveRequest(logicalName, currentPossitionDetails?.id, {
          [dbConstants.common.gyde_visibilityrule]:
            JSON.stringify(visibilityRule),
        });
      
     
        await saveRequest(logicalName, currentPossitionDetails?.id, {
          [dbConstants.question.gyde_minmaxvalidationrule]:
            JSON.stringify(minMaxDBFormatArray),
        });
    
    
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

    let isVisibilityNested: any = [];
    let isShowInDocNested: any = [];
    let isMinMaxNested: any = [];

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
          showIfCount = showIfCount + 1;
          isVisibilityNested.push(
            sec[key]?.fields?.some(
              (flds: { hasNested: any }) => flds?.hasNested
            )
          );
          const _visibility = convertJSONFormatToDBFormat(sec[key], true);
          visibilityRuleNormal.push(_visibility);
          visibilityRule = findAndUpdateLastNestedIf(
            visibilityRule,
            { if: [_visibility] },
            false
          );
        }
        if (isOutputDocShowExists) {
          outputDocShowCount = outputDocShowCount + 1;
          const _outputDocShow = convertJSONFormatToDBFormat(sec[key], true);
          isShowInDocNested.push(
            sec[key]?.fields?.some(
              (flds: { hasNested: any }) => flds?.hasNested
            )
          );
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
        isMinMaxNested.push(
          sec[key]?.fields?.some((flds: { hasNested: any }) => flds?.hasNested)
        );
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
    console.log(
      "Show saving logic Validation Rule Normal",
      validationRuleNormal
    );

    console.log("Show saving logic OutputDoc Show", outputDocShow);
    console.log(
      "Show saving logic Output Doc Show Normal",
      outputDocShowNormal
    );

    console.log("Show saving logic Min Max Rule", minMaxDBFormatArray);

    let savedVisibilityRuleFinalFormat: any = [];
    let savedValidationRuleFinalFormat : any = [];
    let savedOutputDocShowRuleFinalFormat: any = [];
    let savedMinMaxRuleFinalFormat;

    if (
      isVisibilityNested.length &&
      isVisibilityNested.length > 0 &&
      !isVisibilityNested.some((x: any) => x)
    ) {
      if (
        visibilityRuleNormal.length === 1
      ) {
        // savedVisibilityRuleFinalFormat = visibilityRuleNormal;
        savedVisibilityRuleFinalFormat = {
          if: visibilityRuleNormal
        };

      } else {
        savedVisibilityRuleFinalFormat = {
          if: [
            {
              or: visibilityRuleNormal,
            },
          ]
        };
      }
    } else {
      savedVisibilityRuleFinalFormat = visibilityRule[0];
    }
    if (
      isShowInDocNested.length &&
      isShowInDocNested.length > 0 &&
      !isShowInDocNested.some((x: any) => x)
    ) {
      if (
        outputDocShowNormal.length === 1
      ) {
        savedOutputDocShowRuleFinalFormat = {
          if: outputDocShowNormal
        };
      } else {
        savedOutputDocShowRuleFinalFormat = {
          if: [
            {
              or: outputDocShowNormal,
            }
          ]
        }
      }
    } else {
      savedOutputDocShowRuleFinalFormat = outputDocShow[0];
    }
    if (
      isMinMaxNested.length &&
      isMinMaxNested.length > 0 &&
      !isMinMaxNested.some((x: any) => x)
    ) {
      savedMinMaxRuleFinalFormat = minMaxDBFormatArray;
    } else {
      savedMinMaxRuleFinalFormat = minMaxDBFormatArray;
    }

    console.log(
      "savedVisibilityRuleFinalFormat",
      savedVisibilityRuleFinalFormat
    );
    console.log(
      "savedValidationRuleFinalFormat",
      savedValidationRuleFinalFormat
    );

    console.log(
      "savedOutputDocShowRuleFinalFormat",
      savedOutputDocShowRuleFinalFormat
    );
    console.log("savedMinMaxRuleFinalFormat", savedMinMaxRuleFinalFormat);

    if (
      validation?.minMaxValidation &&
      validation.andOrValidation &&
      validation.nestingLevelValidation
    ) {
      saveVisibilityData(
        savedVisibilityRuleFinalFormat ? savedVisibilityRuleFinalFormat : {},
        savedValidationRuleFinalFormat ? savedValidationRuleFinalFormat : {},
        savedOutputDocShowRuleFinalFormat ? savedOutputDocShowRuleFinalFormat : {},
        !savedMinMaxRuleFinalFormat?.length ? undefined : savedMinMaxRuleFinalFormat
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
                <Button
                  className="mr-10 btn-default"
                  onClick={addComponent}
                  disabled={suerveyIsPublished}>
                  + Add
                </Button>
                <Button className="btn-default" onClick={addNestedComponent} disabled={suerveyIsPublished}>
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
                      suerveyIsPublished={suerveyIsPublished}
                      currentQuestionDetails={currentQuestionDetails}
                    />
                  </div>
                ))}

              {_nestedRows?.length > 0 && (
                <div className="text-right">
                  <Button
                    onClick={handleSaveLogic}
                    className="mr-10 btn-primary"
                    disabled={suerveyIsPublished}
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
            <div>Questions Loading!</div>
              <div style={{marginTop: '10px'}}>
              <Spin />
            </div>
          </div>
        </Space>
      )}
    </div>
  );
};

export default ParentComponent;
