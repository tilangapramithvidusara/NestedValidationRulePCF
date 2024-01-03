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
import {
  Button,
  MenuProps,
  notification,
  Radio,
  Select,
  Space,
  Spin,
  Modal,
} from "antd";
import SectionContainer from "./sectionContainer";
import {
  getCurrentState,
  fetchRequest,
  saveRequest,
  loadAllQuestionsInSurvey,
  getPublishedStatus,
  loadResourceString,
  getListAnswersByQuestionId,
  closeTab,
} from "../XRMRequests/xrmRequests";
import { dbConstants } from "../constants/dbConstants";
import { normalConverter } from "../Utils/dbFormatToJson";
import { hasNullFields, hasNullFieldsDefault } from "../Utils/utilsHelper";
import { languageConstantsForCountry } from "../constants/languageConstants";
import tabsConfigs from "../configs/tabsConfigs";
import { ExclamationCircleFilled } from "@ant-design/icons";
import operationalSampleData from "../SampleData/operationalSampleData";

const { confirm } = Modal;

const ParentComponent = ({
  imageUrl,
  imageUrl1,
  imageUrl2,
}: {
  imageUrl?: string;
  imageUrl1?: string;
  imageUrl2?: string;
}) => {
  const [conditionData, setConditionData] = useState<any[]>([]);

  // Get From XRM Requests
  const [sections, setSections] = useState<any[]>([]);
  const [defaultSections, setDefaultSections] = useState<any[]>([]);
  const [_nestedRows, _setNestedRows] = useState<any>([]);
  const [_defaultRows, _setDefaultRows] = useState<any>([]);
  const [isNested, setIsNested] = useState<any>();
  // const [currentPossitionDetails, setCurrentPossitionDetails] = useState<any>();
  const [currentPossitionDetails, setCurrentPossitionDetails] = useState<any>({
    currentPosition: "question",
    questionType: "List",
    id: "ddd",
  });
  const [_visibilityRulePrev, _setVisibilityRulePrev] = useState<any[]>([]);
  const [_enabledRulePrev, _setEnabledPrev] = useState<any[]>([]);
  const [_documentOutputRulePrev, _setDocumentOutputRulePrev] = useState<any[]>(
    []
  );
  const [_visibilityAndDocOutput, _setVisibilityAndDocOutput] = useState<any[]>(
    []
  );
  const [_defaultValueRule, _setDefaultValueRule] = useState<any[]>([]);
  const [_minMaxRulePrev, _setMinMaxRulePrev] = useState<any>([]);

  const [_minMaxPrev, _setMinMaxPrev] = useState<any>([]);
  const [_validationRulePrev, _setValidationRulePrev] = useState<any[]>([]);
  const [isApiDataLoaded, setIsApiDataLoaded] = useState<boolean>(false);
  const [api, contextHolder]: any = notification.useNotification();
  const [questionList, setQuestionList] = useState<any[]>([]);
  const [validation, setValidation] = useState<any>({
    minMaxValidation: true,
    andOrValidation: true,
    nestingLevelValidation: true,
  });
  const [saveAsIsNested, setSaveAsIsNested] = useState<boolean>(false);
  const [suerveyIsPublished, setSuerveyIsPublished] = useState<boolean>(false);
  const [currentQuestionDetails, setCurrentQuestionDetails] = useState<any>();
  const [minMaxCheckBoxEnabled, setMinMaxCheckboxEnabled] = useState<any>({
    minCheckbox: false,
    maxCheckbox: false,
  });
  const [currentListQuestionAnswers, setCurrentListQuestionAnswers] =
    useState();

  //   const [currentQuestionDetails, setCurrentQuestionDetails] = useState<any>({
  //     "label": "TSDTem_C01_S01_date",
  //     "value": "TSDTem_C01_S01_date",
  //     "questionType": "List",
  //     "questionId": "b76bc889-6d66-ee11-9ae7-6045bdd0ef22",
  //     "questionLabel": "date"
  // });
  const [selectedLanguage, setSelectedLanguage] = useState<any>("en");
  const [selectedTab, setSelectedTab] = useState<any>("vr");
  const [localTest, setLocalTest] = useState(true);
  const [languageConstants, setLanguageConstants] = useState<any>(
    languageConstantsForCountry.en
  );
  const [defaultTabValidationPassed, setDefaultTabValidationPassed] =
    useState(true);

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

  let addDefaultComponent = () => {
    setDefaultSections([
      ...defaultSections,
      {
        key:
          defaultSections && defaultSections.length
            ? Math.max(...defaultSections.map((item) => item.key)) + 1
            : 1,
      },
    ]);
  };

  const loadQuestionHandler = async () => {
    setIsApiDataLoaded(true);
    const result = await loadAllQuestionsInSurvey();
    console.log("resss =====> ", result);
    let questionListArray = result.data || [];
    if (
      questionListArray &&
      questionListArray.length &&
      currentPossitionDetails
    ) {
      const formattedQuestionList = questionListArray
        .map((quesNme: any) => {
          if (quesNme)
            return {
              label: quesNme.gyde_name,
              value: quesNme.gyde_name,
              questionType:
                quesNme[
                  "gyde_answertype@OData.Community.Display.V1.FormattedValue"
                ],
              questionId: quesNme?.gyde_surveytemplatechaptersectionquestionid,
              questionLabel: quesNme?.gyde_label,
            };
        })
        ?.filter((secQues: any) => {
          if (currentPossitionDetails?.currentPosition !== "question") {
            let result = currentPossitionDetails?.currentName;
            // if (currentPossitionDetails?.currentPosition === "question") {
            //   const value = currentPossitionDetails?.currentName;
            //   const index = value.lastIndexOf("_");
            //   result = value.substring(0, index);
            // }
            console.log(result);
            console.log("Quering Ress", secQues?.value?.includes(result));
            if (secQues?.value && result)
              return !secQues?.value?.includes(result);
          } else {
            return secQues;
          }
        })
        ?.filter((x: any) => x);
      if (formattedQuestionList && formattedQuestionList?.length) {
        formattedQuestionList?.sort(function (
          a: { label: string },
          b: { label: string }
        ) {
          var labelA = a?.label?.toLowerCase();
          var labelB = b?.label?.toLowerCase();
          if (labelA < labelB) {
            return -1;
          }
          if (labelA > labelB) {
            return 1;
          }
          return 0;
        });
        setQuestionList(formattedQuestionList);
      }

      setIsApiDataLoaded(false);
    } else {
      setQuestionList([]);
      setIsApiDataLoaded(false);
    }
  };

  useEffect(() => {
    if (
      questionList &&
      questionList?.length &&
      currentPossitionDetails?.currentPosition === "question" &&
      !localTest
    ) {
      const currnetQuestionDetails = questionList?.find(
        (ques) =>
          ques?.questionId === currentPossitionDetails?.id?.toLowerCase()
      );
      setCurrentQuestionDetails(currnetQuestionDetails);
    }
  }, [questionList, currentPossitionDetails]);

  const getCurrentQuestionListAnswers = async () => {
    const response = await getListAnswersByQuestionId(
      currentQuestionDetails?.questionId
    );
    if (response?.data?.entities) {
      setCurrentListQuestionAnswers((prev: any) => {
        return {
          ...prev,
          questionId: currentQuestionDetails?.questionId,
          listAnswers: response?.data.entities.map((x: any) => {
            return {
              label: x.gyde_answervalue,
              value: x.gyde_answervalue,
            };
          }),
        };
      });
    }
  };
  useEffect(() => {
    if (currentQuestionDetails?.questionId) {
      getCurrentQuestionListAnswers();
    }
  }, [currentQuestionDetails]);

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

  useEffect(() => {
    setDefaultSections(
      _defaultRows
        ?.map((item: {}) => Object.keys(item))
        ?.flat()
        ?.map((key: any) => ({ key: parseInt(key) }))
        .sort((a: { key: number }, b: { key: number }) => a.key - b.key)
    );
    if (_defaultRows?.length === 0 || !_defaultRows?.length)
      setIsApiDataLoaded(false);
  }, [_defaultRows]);

  // for retrieve purpose
  useEffect(() => {
    setSections(
      _nestedRows
        .map((item: {}) => Object.keys(item))
        .flat()
        .map((key: any) => ({ key: parseInt(key) }))
    );
    _getCurrentState();
    messageHandler();
  }, []);

  // This useEffect is responsible for Convert DB Format to our JSON format
  useEffect(() => {
    console.log("_visibilityRulePrev", _visibilityRulePrev);
    if (_visibilityRulePrev?.length) {
      let key = 45;
      _visibilityRulePrev.forEach((dbData) => {
        _setNestedRows((prevData: any) => {
          let visibilityString = dbData?.visibility?.if?.length
            ? dbData?.visibility?.if
            : dbData?.visibility?.length
            ? dbData?.visibility
            : [dbData?.visibility];
          if (visibilityString) {
            // const visibilityString = dbData?.visibility?.if;
            const showUpdatedDataArray: any[] = [];
            let visibilityDta = visibilityString;
            let refactorDta = visibilityDta;
            const isRetrieveAsNormal = visibilityDta?.some(
              (x: any) => x?.or?.length || x?.and?.length
            );
            const isFirstExpWithEmptyStringKey = visibilityDta?.some(
              (x: any) => !Object.keys(x)[0]
            );
            const isFirstExpWithoutEmptyStringKey = visibilityDta?.some(
              (x: any) => (x[Object.keys(x)[0]] as any[])?.length === 2
            );
            const isAllAreNormal = visibilityDta?.every((x: { or: any[] }) => {
              const keys = x?.or?.map((x: {}) => Object.keys(x)[0]);
              return keys?.includes("and") || keys?.includes("or");
            });
            const isNestedIfs = visibilityDta?.some(
              (x: {}) => Object.keys(x)[0] === "if"
            );

            if (isNestedIfs) {
              refactorDta = removeIfKeyAndGetDbProperty(visibilityDta);
            } else if (isAllAreNormal) {
              refactorDta = visibilityDta[0]?.or;
            } else if (isRetrieveAsNormal) {
              // refactorDta = visibilityDta[0]?.or?.length ? visibilityDta[0]?.or : visibilityDta[0]?.and
              refactorDta = visibilityDta;
            } else if (isFirstExpWithoutEmptyStringKey) {
              refactorDta = [{ or: [visibilityString[0]] }];
            } else if (isFirstExpWithEmptyStringKey) {
              // refactorDta = visibilityDta;
              refactorDta = [{ or: Object.values(visibilityDta[0])[0] }];
            } else {
              refactorDta = removeIfKeyAndGetDbProperty(visibilityDta);
            }

            if (refactorDta && refactorDta?.length) {
              refactorDta?.forEach((fieldDta: any): any => {
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
                return [...prevData, ...showUpdatedDataArray];
              }
            }
          }
        });
      });
      setIsApiDataLoaded(false);
    }
  }, [_visibilityRulePrev]);

  // This useEffect is responsible for Convert DB Format to our JSON format
  useEffect(() => {
    if (_documentOutputRulePrev?.length) {
      let key = 1;
      _documentOutputRulePrev.forEach((dbData) => {
        _setNestedRows((prevData: any) => {
          let docRuleOutput = dbData?.docRuleOutput?.if?.length
            ? dbData?.docRuleOutput?.if
            : [dbData?.docRuleOutput];
          if (docRuleOutput) {
            // docRuleOutput = dbData?.docRuleOutput?.if;
            const showUpdatedDocOutputDataArray: any[] = [];
            let docOutputDta = docRuleOutput;
            // const refactorDta = removeIfKeyAndGetDbProperty(docOutputDta);
            // let visibilityDta = docOutputDta;
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
            const isNestedIfs = docRuleOutput?.some(
              (x: {}) => Object.keys(x)[0] === "if"
            );

            const isFirstExpWithEmptyStringKey = docRuleOutput?.some(
              (x: any) => !Object.keys(x)[0]
            );
            const isFirstExpWithoutEmptyStringKey = docRuleOutput?.some(
              (x: any) => (x[Object.keys(x)[0]] as any[])?.length === 2
            );

            if (isNestedIfs) {
              docOutputDta = removeIfKeyAndGetDbProperty(docRuleOutput);
            } else if (isAllAreNormal) {
              docOutputDta = docRuleOutput[0]?.or;
            } else if (isRetrieveAsNormal) {
              // refactorDta = visibilityDta[0]?.or?.length ? visibilityDta[0]?.or : visibilityDta[0]?.and
              docOutputDta = docRuleOutput;
            } else if (isFirstExpWithoutEmptyStringKey) {
              docOutputDta = [{ or: [docRuleOutput[0]] }];
            } else if (isFirstExpWithEmptyStringKey) {
              // refactorDta = visibilityDta;
              docOutputDta = [{ or: Object.values(docRuleOutput[0])[0] }];
            } else if (isFirstExp) {
              // refactorDta = visibilityDta;
              docOutputDta = [{ or: Object.values(docRuleOutput[0])[0] }];
            } else {
              docOutputDta = removeIfKeyAndGetDbProperty(docRuleOutput);
            }

            if (docOutputDta && docOutputDta?.length) {
              docOutputDta?.forEach((fieldDta: any): any => {
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
              if (
                showUpdatedDocOutputDataArray &&
                showUpdatedDocOutputDataArray.length
              ) {
                return [...prevData, ...showUpdatedDocOutputDataArray];
              }
            }
          }
        });
      });
      setIsApiDataLoaded(false);
    }
  }, [_documentOutputRulePrev]);

  // This useEffect is responsible for Convert DB Format to our JSON format
  useEffect(() => {
    if (_minMaxRulePrev?.length) {
      let key = 15;

      _minMaxRulePrev?.forEach((dbData: any) => {
        _setNestedRows((prevData: any) => {
          const minMax = dbData?.minMax;
          const minMaxOutputDataArray: any[] = [];
          let minMaxDta = minMax;
          if (minMaxDta?.length) {
            const minObj = minMaxDta?.find(
              (minMax: any) =>
                minMax?.type === "MINIMUM_LENGTH" || minMax?.type === "MINIMUM"
            );
            const maxObj = minMaxDta?.find(
              (minMax: any) =>
                minMax?.type === "MAXIMUM_LENGTH" || minMax?.type === "MAXIMUM"
            );
            let _refactorDtaMin = removeMinMaxIfKeyAndGetDbProperty([
              minObj?.value,
            ]);
            let _refactorDtaMax = removeMinMaxIfKeyAndGetDbProperty([
              maxObj?.value,
            ]);
            const refactoredMinMax =
              _refactorDtaMin[0]?.ifConditions ||
              _refactorDtaMax[0]?.ifConditions;
            let _minMaxArrayStr = refactoredMinMax?.length
              ? refactoredMinMax
              : [refactoredMinMax];

            const isRetrieveAsNormal = _minMaxArrayStr?.some(
              (x: any) => x?.or?.length || x?.and?.length
            );
            // const isFirstExp = _minMaxArrayStr?.some(
            //   (x: any) => !Object.keys(x)[0]
            // );
            const isFirstExp = operationalSampleData[0]?.options?.some(
              (x: any) => x?.value === Object.keys(refactoredMinMax)[0]
            );

            const isAllAreNormal = _minMaxArrayStr?.every(
              (x: { or: any[] }) => {
                const keys = x?.or?.map((x: {}) => Object.keys(x)[0]);
                return keys?.includes("and") || keys?.includes("or");
              }
            );
            const isNestedIfs = _minMaxArrayStr?.some(
              (x: {}) => Object.keys(x)[0] === "if"
            );

            let _minMaxArray;
            if (isNestedIfs) {
              _minMaxArray = removeIfKeyAndGetDbProperty(_minMaxArrayStr);
            } else if (isAllAreNormal) {
              _minMaxArray = _minMaxArrayStr[0]?.or;
            } else if (isRetrieveAsNormal) {
              // refactorDta = visibilityDta[0]?.or?.length ? visibilityDta[0]?.or : visibilityDta[0]?.and
              _minMaxArray = _minMaxArrayStr;
            } else if (isFirstExp) {
              // refactorDta = visibilityDta;
              // _minMaxArray = [{ or: Object.values(_minMaxArrayStr[0])[0] }];
              _minMaxArray = [{ or: [refactoredMinMax] }];
            } else {
              _minMaxArray = removeIfKeyAndGetDbProperty(_minMaxArrayStr);
            }

            if (_minMaxArray && _minMaxArray?.length) {
              _minMaxArray?.forEach((fieldDta: any): any => {
                let _fieldDta = JSON.parse(JSON.stringify(fieldDta));

                minMaxOutputDataArray.push({
                  [key++]: {
                    actions: [
                      {
                        minMax: {
                          logicalName: "minMax",
                          minValue: _refactorDtaMin[0]?.minMax?.var
                            ? _refactorDtaMin[0]?.minMax?.var
                            : _refactorDtaMin[0]?.minMax,
                          maxValue: _refactorDtaMax[0]?.minMax?.var
                            ? _refactorDtaMax[0]?.minMax?.var
                            : _refactorDtaMax[0]?.minMax,
                        },
                      },
                    ],
                    fields: normalConverter([_fieldDta]),
                  },
                });
              });
            }
            if (minMaxOutputDataArray && minMaxOutputDataArray.length) {
              return [...prevData, ...minMaxOutputDataArray];
            }
          }
        });
      });
      setIsApiDataLoaded(false);
    }
  }, [_minMaxRulePrev]);

  // This useEffect is responsible for Convert DB Format to our JSON format
  useEffect(() => {
    if (_defaultValueRule && _defaultValueRule?.length) {
      let key = 100;
      // const __defaultValRule = _defaultValueRule?.defaultValRule;
      let __defaultValueRule = JSON.parse(JSON.stringify(_defaultValueRule));

      __defaultValueRule?.forEach((defTriggers: any) => {
        const triggers = defTriggers?.defaultValRule?.triggers
          ? defTriggers?.defaultValRule?.triggers
          : defTriggers?.defaultValRule;

        if (triggers && triggers?.length) {
          for (const trigger of triggers) {
            _setDefaultRows((prevData: any) => {
              let defaultString = [trigger?.rule?.rule];
              let defaultAction = trigger?.action?.value;
              let actionMap: any;
              if (!defaultAction && defaultAction !== 0) {
                actionMap = {
                  type: "CLE_Q",
                  value: null,
                };
              } else if (typeof defaultAction === "object") {
                if (defaultAction?.var) {
                  actionMap = {
                    type: "VAL_Q",
                    value: defaultAction?.var,
                  };
                } else {
                  actionMap = {
                    type: "MAT_F",
                    value: defaultAction,
                  };
                }
              } else {
                actionMap = {
                  type: "ADD_V",
                  value: defaultAction,
                };
              }
              if (defaultString) {
                // const visibilityString = dbData?.visibility?.if;
                const defaultDataArray: any[] = [];
                let visibilityDta = JSON.parse(JSON.stringify(defaultString));
                let _refactorDta = JSON.parse(JSON.stringify(defaultString));
                const isRetrieveAsNormal = visibilityDta?.some(
                  (x: any) => x?.or?.length || x?.and?.length
                );
                const isFirstExpWithEmptyStringKey = visibilityDta?.some(
                  (x: any) => !Object.keys(x)[0]
                );
                const isFirstExpWithoutEmptyStringKey = visibilityDta?.some(
                  (x: any) => (x[Object.keys(x)[0]] as any[])?.length === 2
                );
                const isAllAreNormal = visibilityDta?.every(
                  (x: { or: any[] }) => {
                    const keys = x?.or?.map((x: {}) => Object.keys(x)[0]);
                    return keys?.includes("and") || keys?.includes("or");
                  }
                );
                const isNestedIfs = visibilityDta?.some(
                  (x: {}) => Object.keys(x)[0] === "if"
                );

                if (isNestedIfs) {
                  _refactorDta = removeIfKeyAndGetDbProperty(visibilityDta);
                } else if (isAllAreNormal) {
                  _refactorDta = visibilityDta[0]?.or;
                } else if (isRetrieveAsNormal) {
                  _refactorDta = visibilityDta;
                } else if (isFirstExpWithoutEmptyStringKey) {
                  _refactorDta = [{ or: [defaultString[0]] }];
                } else if (isFirstExpWithEmptyStringKey) {
                  _refactorDta = [{ or: Object.values(visibilityDta[0])[0] }];
                } else {
                  _refactorDta = removeIfKeyAndGetDbProperty(visibilityDta);
                }
                if (_refactorDta && _refactorDta?.length) {
                  _refactorDta?.forEach((fieldDta: any): any => {
                    let _fieldDta = JSON.parse(JSON.stringify(fieldDta));

                    defaultDataArray.push({
                      [key++]: {
                        actions: [actionMap],
                        fields: normalConverter([_fieldDta]),
                      },
                    });
                  });

                  if (defaultDataArray && defaultDataArray.length) {
                    return [...prevData, ...defaultDataArray];
                  }
                }
              }
            });
          }
        }

        // });
      });
    }
  }, [_defaultValueRule]);

  // This useEffect is responsible for Convert DB Format to our JSON format
  useEffect(() => {
    console.log("_visibilityAndDocOutput", _visibilityAndDocOutput);
    if (_visibilityAndDocOutput?.length) {
      let key = 700;
      _visibilityAndDocOutput.forEach((dbData) => {
        if (
          dbData &&
          dbData?.visibilityAndDocRuleOutput &&
          Object.keys(dbData?.visibilityAndDocRuleOutput).length === 0
        )
          return;
        _setNestedRows((prevData: any) => {
          let visibilityAndDocRuleOutput = dbData?.visibilityAndDocRuleOutput
            ?.if?.length
            ? dbData?.visibilityAndDocRuleOutput?.if
            : [dbData?.visibilityAndDocRuleOutput];
          if (visibilityAndDocRuleOutput) {
            const showUpdatedDocOutputDataArray: any[] = [];
            let docOutputDta = visibilityAndDocRuleOutput;
            const isRetrieveAsNormal = visibilityAndDocRuleOutput?.some(
              (x: any) => x?.or?.length || x?.and?.length
            );
            const isFirstExp = visibilityAndDocRuleOutput?.some(
              (x: any) => !Object.keys(x)[0]
            );
            const isAllAreNormal = visibilityAndDocRuleOutput?.every(
              (x: { or: any[] }) => {
                const keys = x?.or?.map((x: {}) => Object.keys(x)[0]);
                return keys?.includes("and") || keys?.includes("or");
              }
            );
            const isNestedIfs = visibilityAndDocRuleOutput?.some(
              (x: {}) => Object.keys(x)[0] === "if"
            );

            const isFirstExpWithEmptyStringKey =
              visibilityAndDocRuleOutput?.some((x: any) => !Object.keys(x)[0]);
            const isFirstExpWithoutEmptyStringKey =
              visibilityAndDocRuleOutput?.some(
                (x: any) => (x[Object.keys(x)[0]] as any[])?.length === 2
              );
            if (isNestedIfs) {
              docOutputDta = removeIfKeyAndGetDbProperty(
                visibilityAndDocRuleOutput
              );
            } else if (isAllAreNormal) {
              docOutputDta = visibilityAndDocRuleOutput[0]?.or;
            } else if (isRetrieveAsNormal) {
              // refactorDta = visibilityDta[0]?.or?.length ? visibilityDta[0]?.or : visibilityDta[0]?.and
              docOutputDta = visibilityAndDocRuleOutput;
            } else if (isFirstExpWithoutEmptyStringKey) {
              docOutputDta = [{ or: [visibilityAndDocRuleOutput[0]] }];
            } else if (isFirstExpWithEmptyStringKey) {
              // refactorDta = visibilityDta;
              docOutputDta = [
                { or: Object.values(visibilityAndDocRuleOutput[0])[0] },
              ];
            } else if (isFirstExp) {
              // refactorDta = visibilityDta;
              docOutputDta = [
                { or: Object.values(visibilityAndDocRuleOutput[0])[0] },
              ];
            } else {
              docOutputDta = removeIfKeyAndGetDbProperty(
                visibilityAndDocRuleOutput
              );
            }

            if (docOutputDta && docOutputDta?.length) {
              docOutputDta?.forEach((fieldDta: any): any => {
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
              if (
                showUpdatedDocOutputDataArray &&
                showUpdatedDocOutputDataArray.length
              ) {
                return [...prevData, ...showUpdatedDocOutputDataArray];
              }
            }
          }
        });
      });
      setIsApiDataLoaded(false);
    }
  }, [_visibilityAndDocOutput]);

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
    let defaultValueRule: any;
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
      documentOutputRule = await fetchRequest(
        logicalName,
        currentPossitionDetails?.id,
        `?$select=${dbConstants.question.gyde_documentOutputRule}`
      );

      let defaultValueLogicalName =
        dbConstants?.question?.gyde_defaultValueFormula;
      if (defaultValueLogicalName) {
        defaultValueRule = await fetchRequest(
          logicalName,
          currentPossitionDetails?.id,
          `?$select=${defaultValueLogicalName}`
        );
      }
    }

    if (
      minMaxPreviousValues?.data &&
      Object.keys(minMaxPreviousValues?.data).length !== 0
    ) {
      let _minMaxPreviousValues = JSON.parse(
        JSON.stringify(minMaxPreviousValues)
      );
      _setMinMaxRulePrev((prevData: any) => [
        ...prevData,
        { minMax: _minMaxPreviousValues?.data },
      ]);
    }
    if (
      documentOutputRule?.data &&
      visibilityRulePreviousValues?.data &&
      JSON.stringify(documentOutputRule?.data) ===
        JSON.stringify(visibilityRulePreviousValues?.data)
    ) {
      let _visibilityAndDocRuleOutput = JSON.parse(
        JSON.stringify(documentOutputRule?.data)
      );

      // _visibilityAndDocRuleOutput = JSON.parse(_visibilityAndDocRuleOutput)
      _setVisibilityAndDocOutput((prevData: any) => [
        ...prevData,
        { visibilityAndDocRuleOutput: _visibilityAndDocRuleOutput },
      ]);
    } else {
      if (
        visibilityRulePreviousValues?.data &&
        Object.keys(visibilityRulePreviousValues?.data).length !== 0
      ) {
        let _visibilityRulePreviousValues = JSON.parse(
          JSON.stringify(visibilityRulePreviousValues)
        );
        _setVisibilityRulePrev((prevData: any) => [
          ...prevData,
          { visibility: _visibilityRulePreviousValues?.data },
        ]);
      }
      if (
        documentOutputRule?.data &&
        Object.keys(documentOutputRule?.data).length !== 0
      ) {
        let _documentOutputRule = JSON.parse(
          JSON.stringify(documentOutputRule)
        );
        _setDocumentOutputRulePrev((prevData: any) => [
          ...prevData,
          { docRuleOutput: _documentOutputRule?.data },
        ]);
      }
    }

    if (
      defaultValueRule?.data &&
      Object.keys(defaultValueRule?.data).length !== 0
    ) {
      let _defaultValueRule = JSON.parse(JSON.stringify(defaultValueRule));
      _setDefaultValueRule((prevData: any) => [
        ...prevData,
        { defaultValRule: _defaultValueRule?.data },
      ]);
    }
    //test
    // _setVisibilityRulePrev((prevValue) => [
    //   ...prevValue,
    //   {
    //     visibility:
    //     {"if":[{"and":[{"==":[{"var":"AS_Tst_C01_S01_Q01"},22]},{"==":[{"var":"AS_Tst_C01_S01_Q01"},333]},{"or":[{"==":[{"var":"AS_Tst_C01_S01_Q01"},444]},{"==":[{"var":"AS_Tst_C01_S01_Q01"},444]}]}]},{"if":[{"":[{"==":[{"var":"AS_Tst_C01_S01_Q01"},66666]}]},{"if":[{"":[{"==":[{"var":"AS_Tst_C01_S01_Q01"},55555]}]}]}]}]}
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
    //     visibility: { "if": [ { "or": [ { "==": [ { "var": "TDSsur_C02_S01_NO1" }, 4 ] }, { "==": [ { "var": "TDSsur_C02_S01_NO1" }, 3 ] }, { "and": [ { "==": [ { "var": "TDSsur_C02_S01_NO1" }, 3 ] } ] } ] } ] }
    //   },
    // ]);
    // _setMinMaxRulePrev((prevData: any) => [...prevData, {minMax: [ [ { "type": "MINIMUM_LENGTH", "value": { "if": [ { "": [ { "==": [ { "var": "NTemp_C01_04_Q_04" }, "2023-08-18" ] } ] }, 2 ] } }, { "type": "MAXIMUM_LENGTH", "value": { "if": [ { "": [ { "==": [ { "var": "NTemp_C01_04_Q_04" }, "2023-08-18" ] } ] }, null ] } } ] ]}]);
    // _setMinMaxRulePrev((prevData: any) => [...prevData, {minMax: [{"type":"MINIMUM","value":{"if":[{"or":[{"==":[{"var":"TDSwi_C01_S01_str"},"12"]},{"==":[{"var":"TDSwi_C01_S01_str"},"byr"]}]},2]}},{"type":"MAXIMUM","value":{"if":[{"or":[{"==":[{"var":"TDSwi_C01_S01_str"},"12"]},{"==":[{"var":"TDSwi_C01_S01_str"},"byr"]}]},5]}}]}]);
    // _setDocumentOutputRulePrev((prevData: any) => [...prevData, { docRuleOutput: [ { "if": [ { "and": [ { "==": [ { "var": "NTemp_C01_s01_rd" }, "1111 " ] }, { "==": [ { "var": "NTemp_C01_s01_rd" }, " 1223" ] }, { "or": [ { "==": [ { "var": "NTemp_C01_s01_rd" }, " 4455" ] }, { "==": [ { "var": "NTemp_C01_s01_rd" }, "2445" ] } ] } ] } ] } ]}]);
    // _setEnabledPrev((prevData: any) => [...prevData, {validation: JSON.parse("[{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]},{\"==\":[{\"var\":\"CE_ACM_CM_Q2\"},5]}]},{\"if\":[{\"and\":[{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]},{\"==\":[{\"var\":\"CE_ACM_CM_01\"},4]}]}]}]}]") }]);
    // _setDefaultValueRule((prevData: any) => [...prevData, { defaultValRule: {"triggers":[{"id":"trigger_1","rule":{"type":"QUESTION_RESPONSE","rule":{"==":[{"var":"TSDTem_C01_S01_list"},"2"]}}, "action": { "type": "SET_QUESTION_RESPONSE", "questionId": "Q_002", "value": { "+": [ { "var": "NTemp_C01_s01_rd" }, "NTemp_C01_s01_qr3" ] } } }]}  }] )
    // _setDefaultValyeRule([ { "id": "trigger_1", "rule": { "type": "QUESTION_RESPONSE", "rule": { "and": [ { "==": [ { "var": "NTemp_C01_04_Q_04" }, "2023-10-02" ] }, { "==": [ { "var": "NTemp_C01_s01_rd" }, "333" ] } ] } }, "action": { "type": "SET_QUESTION_RESPONSE", "questionId": "Q_002", "value": { "+": [ { "var": "NTemp_C01_s01_rd" }, "NTemp_C01_s01_qr3" ] } } } ])
    // _setDefaultValueRule((prevData: any) => [...prevData, { defaultValRule: {"triggers":[{"id":"trigger_1","rule":{"type":"QUESTION_RESPONSE","rule":{"==":[{"var":"TDSTem_C01_S01_Str"},"89"]}},"action":{"type":"SET_QUESTION_RESPONSE","value":{"/":[{"var":"TDSTem_C01_S01_NO"},"TDSTem_C01_S01_NO"]}}}]}  }] )
  };
  const getCurrentPublishedStatus = async () => {
    const { data = null } = await getPublishedStatus(currentPossitionDetails);
    if (data?.isPublished) setSuerveyIsPublished(data?.isPublished);
  };

  useEffect(() => {
    if (currentPossitionDetails) {
      getRequestedData();
    }

    loadQuestionHandler();
    if (currentPossitionDetails) {
      getCurrentPublishedStatus();
    }
  }, [currentPossitionDetails]);

  const handleSectionRemove = (deleteSectionKey: any, tab: any) => {
    if (tab === dbConstants?.tabTypes?.validationTab) {
      if (deleteSectionKey) {
        _setNestedRows((prevNestedRows: any) => {
          if (prevNestedRows && prevNestedRows.length === 1) {
            saveVisibilityData({}, {}, {}, {}, {});
          }
          return prevNestedRows.filter(
            (key: any) => parseInt(Object.keys(key)[0]) !== deleteSectionKey
          );
        });
        setSections((prev: any) =>
          prev.filter((prevKeys: any) => prevKeys.key !== deleteSectionKey)
        );
      }
    } else {
      if (deleteSectionKey) {
        _setDefaultRows((prevNestedRows: any) => {
          return prevNestedRows.filter(
            (key: any) => parseInt(Object.keys(key)[0]) !== deleteSectionKey
          );
        });
        setDefaultSections((prev: any) =>
          prev.filter((prevKeys: any) => prevKeys.key !== deleteSectionKey)
        );
      }
    }
  };

  const _getCurrentState = async () => {
    const result = await getCurrentState();
    console.log("Current State Details ----> ", result);
    if (result?.data?.length) setCurrentPossitionDetails(result?.data[0]);
  };

  const saveVisibilityData = async (
    visibilityRule: any,
    validationRule: any,
    outputDocShow: any,
    minMaxDBFormatArray: any,
    defaultValueRuleNormal: any
  ) => {
    let logicalName;

    if (currentPossitionDetails?.currentPosition === "question") {
      logicalName = dbConstants.question.fieldName;
    } else if (currentPossitionDetails?.currentPosition === "section") {
      logicalName = dbConstants.section.fieldName;
    } else if (currentPossitionDetails?.currentPosition === "chapter") {
      logicalName = dbConstants.chapter.fieldName;
    }

    if (
      currentPossitionDetails?.id &&
      (currentPossitionDetails.currentPosition === "section" ||
        currentPossitionDetails?.currentPosition === "chapter")
    ) {
      await saveRequest(logicalName, currentPossitionDetails?.id, {
        [dbConstants.common.gyde_visibilityrule]:
          Object.keys(visibilityRule).length === 0
            ? ""
            : JSON.stringify(visibilityRule),
      });
    } else if (
      currentPossitionDetails?.id &&
      currentPossitionDetails?.currentPosition === "question"
    ) {
      console.log("Before Saving visibilityRule", visibilityRule);
      console.log("Before Saving minMaxDBFormatArray", minMaxDBFormatArray);
      console.log("Before Saving outputDocShow", outputDocShow);

      if (visibilityRule) {
        await saveRequest(logicalName, currentPossitionDetails?.id, {
          [dbConstants.common.gyde_visibilityrule]:
            Object.keys(visibilityRule).length === 0
              ? ""
              : JSON.stringify(visibilityRule),
        });
      }

      if (minMaxDBFormatArray) {
        await saveRequest(logicalName, currentPossitionDetails?.id, {
          [dbConstants.question.gyde_minmaxvalidationrule]:
            Object.keys(minMaxDBFormatArray).length === 0
              ? ""
              : JSON.stringify(minMaxDBFormatArray),
        });
      }
      if (outputDocShow) {
        await saveRequest(logicalName, currentPossitionDetails?.id, {
          [dbConstants.question.gyde_documentOutputRule]:
            Object.keys(outputDocShow).length === 0
              ? ""
              : JSON.stringify(outputDocShow),
        });
      }
      console.log("defaultValueRuleNormal", defaultValueRuleNormal);
      if (defaultValueRuleNormal) {
        await saveRequest(logicalName, currentPossitionDetails?.id, {
          [dbConstants?.question?.gyde_defaultValueFormula]:
            Object.keys(defaultValueRuleNormal).length === 0
              ? ""
              : JSON.stringify(defaultValueRuleNormal),
        });
      }
    }
    openNotificationWithIcon(
      "success",
      languageConstants?.ExpressionBuilder_DataSaved
    );
  };

  const createActionObject = (actionType: any, value: any) => {
    let actionObject = {};
    if (actionType === "CLE_Q") {
      return {
        type: "SET_QUESTION_RESPONSE",
        questionId: currentQuestionDetails?.value,
        value: null,
      };
    } else if (actionType === "ADD_V") {
      return {
        type: "SET_QUESTION_RESPONSE",
        questionId: currentQuestionDetails?.value,
        value: value,
      };
    } else if (actionType === "VAL_Q") {
      return {
        type: "SET_QUESTION_RESPONSE",
        questionId: currentQuestionDetails?.value,
        value: {
          var: value,
        },
      };
    } else if (actionType === "MAT_F") {
      return {
        type: "SET_QUESTION_RESPONSE",
        questionId: currentQuestionDetails?.value,
        value: {
          [value[1]]: [
            {
              var: value[0],
            },
            value[2],
          ],
        },
      };
    }
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

    let defaultValueRule: any = [];
    let defaultValueRuleNormal: any = [];
    let defaultTriggers: any;

    let isfieldsHasEmptyFields = false;
    let isfieldsHasEmptyFieldsDefault = false;
    let isAddValuefieldsHasEmptyActionsDefault = false;
    let isReferencesEmpty = false;
    let isAtleastActionSelectedIfTheFieldsAreNotEmpty = false;

    let isActionIsNotAllowedForQuestion: any = [];

    let minMaxExmptyIfTheCheckBoxIsEnabled = false;
    const sortedData = [..._nestedRows].sort((a, b) => {
      const aKey = Object.keys(a)[0];
      const bKey = Object.keys(b)[0];
      return parseInt(aKey) - parseInt(bKey);
    });

    const sortedDataForDefaultValue = [..._defaultRows].sort((a, b) => {
      const aKey = Object.keys(a)[0];
      const bKey = Object.keys(b)[0];
      return parseInt(aKey) - parseInt(bKey);
    });

    sortedDataForDefaultValue.forEach((sec: any) => {
      const key = Object.keys(sec)[0];

      const defaultActionSet = sec[key]?.actions[0];
      if (!defaultActionSet) {
        isReferencesEmpty = true;
        return;
      }
      const typeOfAction = defaultActionSet?.type;
      let prepareForValidation = JSON.parse(JSON.stringify(sec[key].fields));
      prepareForValidation[0].expression = "Emp";
      const _hasNullFields = hasNullFieldsDefault(prepareForValidation);

      if (_hasNullFields) {
        isfieldsHasEmptyFieldsDefault = true;
        return;
      }

      if (
        typeOfAction !== "CLE_Q" &&
        !defaultActionSet?.value &&
        defaultActionSet?.value !== 0
      ) {
        console.log("Rej 2", defaultActionSet?.value);
        isfieldsHasEmptyFieldsDefault = true;
        return;
      }

      if (typeOfAction === "MAT_F" && !defaultTabValidationPassed) {
        console.log("Rej 3");
        isfieldsHasEmptyFieldsDefault = true;
        return;
      }

      if (
        typeOfAction === "ADD_V" &&
        !defaultActionSet?.value &&
        currentQuestionDetails?.questionType ===
          dbConstants?.questionTypes?.numericQuestion &&
        defaultActionSet?.value !== 0
      ) {
        isAddValuefieldsHasEmptyActionsDefault = true;
        console.log("Rej 4");
        return;
      }

      let _defaultValue: any = convertJSONFormatToDBFormat(sec[key], true);
      _defaultValue = _defaultValue?.exp;
      const __defaultValue = JSON.parse(JSON.stringify(_defaultValue));
      const _rule = __defaultValue[""]?.length
        ? __defaultValue[""][0]
        : _defaultValue;

      const triggerId = defaultValueRuleNormal?.length + 1;
      const value = defaultActionSet?.value;
      const actionObj = createActionObject(typeOfAction, value);

      const obj = {
        id: `trigger_${triggerId}`,
        rule: {
          type: "QUESTION_RESPONSE",
          rule: _rule,
        },
        action: actionObj,
      };
      defaultValueRuleNormal.push(obj);
    });
    if (defaultValueRuleNormal && defaultValueRuleNormal?.length) {
      defaultTriggers = defaultValueRuleNormal;
    }

    sortedData.forEach((sec: any) => {
      const key = Object.keys(sec)[0];

      const checkboxValues = sec[key]?.actions[0]?.checkBoxValues;
      const minMaxExists =
        Object.keys(sec[key]?.actions[0]?.minMax || {}).length !== 0;
      if (minMaxExists) {
        if (
          minMaxCheckBoxEnabled?.minCheckbox &&
          (!sec[key]?.actions[0]?.minMax?.minValue ||
            !sec[key]?.actions[0]?.minMax)
        ) {
          minMaxExmptyIfTheCheckBoxIsEnabled = true;
        }
        if (
          minMaxCheckBoxEnabled?.maxCheckbox &&
          (!sec[key]?.actions[0]?.minMax?.maxValue ||
            !sec[key]?.actions[0]?.minMax)
        ) {
          minMaxExmptyIfTheCheckBoxIsEnabled = true;
        }
      }

      const isShowExists = checkboxValues?.some(
        (x: any) => Object.keys(x)[0] === "show"
      );
      const isOutputDocShowExists = checkboxValues?.some(
        (x: any) => Object.keys(x)[0] === "OutPutDoc:Show"
      );
      const isEnableExists = checkboxValues?.some(
        (x: any) => Object.keys(x)[0] === "enable"
      );

      let prepareForValidation = JSON.parse(JSON.stringify(sec[key].fields));
      if (
        !isShowExists &&
        !isOutputDocShowExists &&
        !isEnableExists &&
        !minMaxExists &&
        prepareForValidation?.length
      ) {
        isAtleastActionSelectedIfTheFieldsAreNotEmpty = true;
        return;
      }
      prepareForValidation[0].expression = "Emp";
      const _hasNullFields = hasNullFields(prepareForValidation);
      if (_hasNullFields) {
        isfieldsHasEmptyFields = true;
        return;
      }

      if (checkboxValues) {
        if (isShowExists) {
          showIfCount = showIfCount + 1;
          isVisibilityNested.push(
            sec[key]?.fields?.some(
              (flds: { hasNested: any }) => flds?.hasNested
            )
          );
          let _visibility: any = convertJSONFormatToDBFormat(
            sec[key],
            true,
            currentQuestionDetails
          );
          isActionIsNotAllowedForQuestion.push(_visibility?.validation);
          _visibility = _visibility?.exp;
          console.log(
            "Validation Return visibility",
            isActionIsNotAllowedForQuestion
          );
          const __visibility = JSON.parse(JSON.stringify(_visibility));
          console.log("Pushing visibility", __visibility);
          visibilityRuleNormal.push(
            __visibility[""]?.length ? __visibility[""][0] : _visibility
          );
          visibilityRule = findAndUpdateLastNestedIf(
            visibilityRule,
            { if: [_visibility] },
            false
          );
        }
        if (isOutputDocShowExists) {
          outputDocShowCount = outputDocShowCount + 1;
          let _outputDocShow: any = convertJSONFormatToDBFormat(sec[key], true);
          _outputDocShow = _outputDocShow?.exp;
          const __outputDocShow = JSON.parse(JSON.stringify(_outputDocShow));

          isShowInDocNested.push(
            sec[key]?.fields?.some(
              (flds: { hasNested: any }) => flds?.hasNested
            )
          );
          // outputDocShowNormal.push(_outputDocShow);
          outputDocShowNormal.push(
            __outputDocShow[""]?.length
              ? __outputDocShow[""][0]
              : _outputDocShow
          );
          outputDocShow = findAndUpdateLastNestedIf(
            outputDocShow,
            { if: [_outputDocShow] },
            false
          );
        }
      }

      if (minMaxExists) {
        console.log("Min Max when saving ----> ", sec[key].actions[0]?.minMax);
        isMinMaxNested.push(
          sec[key]?.fields?.some((flds: { hasNested: any }) => flds?.hasNested)
        );
        const _minMaxDbFormarFields: any = convertJSONFormatToDBFormat(
          sec[key],
          true
        );
        const minMax = sec[key]?.actions[0]?.minMax;
        let minValue = minMax?.minValue || null;
        let maxValue = minMax?.maxValue || null;
        if (minMax) {
          if (minValue && typeof minValue === "string" && minValue !== "0") {
            minValue = {
              var: minMax?.minValue,
            };
          }
          if (maxValue && typeof maxValue === "string" && minValue !== "0") {
            maxValue = {
              var: minMax?.maxValue,
            };
          }
          const formattingForMin = [];
          const formattingForMax = [];
          formattingForMin.push(
            _minMaxDbFormarFields?.exp[""]?.length
              ? _minMaxDbFormarFields?.exp[""][0]
              : _minMaxDbFormarFields?.exp,
            minValue
          );
          formattingForMax.push(
            _minMaxDbFormarFields?.exp[""]?.length
              ? _minMaxDbFormarFields?.exp[""][0]
              : _minMaxDbFormarFields?.exp,
            maxValue
          );
          minMaxDBFormatArray.push(
            {
              type: typeof minValue === "string" ? "MINIMUM_LENGTH" : "MINIMUM",
              value: { if: formattingForMin },
            },
            {
              type: typeof minValue === "string" ? "MAXIMUM_LENGTH" : "MAXIMUM",
              value: { if: formattingForMax },
            }
          );
        }
      }
    });

    let savedVisibilityRuleFinalFormat: any = [];
    let savedValidationRuleFinalFormat: any = [];
    let savedOutputDocShowRuleFinalFormat: any = [];
    let savedMinMaxRuleFinalFormat;

    if (
      isVisibilityNested.length &&
      isVisibilityNested.length > 0 &&
      !isVisibilityNested.some((x: any) => x)
    ) {
      if (visibilityRuleNormal.length === 1) {
        if (visibilityRuleNormal[0][""] && visibilityRuleNormal[0][""][0]) {
          savedVisibilityRuleFinalFormat = visibilityRuleNormal[0][""][0];
        } else {
          savedVisibilityRuleFinalFormat = visibilityRuleNormal[0];
        }
      } else {
        savedVisibilityRuleFinalFormat = {
          or: visibilityRuleNormal,
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
      if (outputDocShowNormal.length === 1) {
        // savedOutputDocShowRuleFinalFormat = {
        //   if: outputDocShowNormal
        // };

        if (outputDocShowNormal[0][""] && outputDocShowNormal[0][""][0]) {
          savedOutputDocShowRuleFinalFormat = outputDocShowNormal[0][""][0];
        } else {
          savedOutputDocShowRuleFinalFormat = outputDocShowNormal[0];
        }
      } else {
        savedOutputDocShowRuleFinalFormat = {
          // if: [
          //   {
          or: outputDocShowNormal,
          //     },
          //   ]
        };
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

    if (isActionIsNotAllowedForQuestion?.some((val: any) => val)) {
      openNotificationWithIcon(
        "error",
        languageConstants?.ExpressionBuilder_SameQuesRefForCurrentQuestion
      );
      return;
    }

    if (isAtleastActionSelectedIfTheFieldsAreNotEmpty) {
      openNotificationWithIcon(
        "error",
        languageConstants?.ExpressionBuilder_AtLeastOneActionNeedToSelect
      );
      return;
    }
    if (isAddValuefieldsHasEmptyActionsDefault) {
      openNotificationWithIcon(
        "error",
        languageConstants?.ExpressionBuilder_AddValErrorMessage
      );
      return;
    }
    if (isReferencesEmpty) {
      openNotificationWithIcon(
        "error",
        languageConstants?.ExpressionBuilder_DefaultValueErrorMessage
      );
      return;
    }
    if (isfieldsHasEmptyFieldsDefault) {
      openNotificationWithIcon(
        "error",
        languageConstants?.ExpressionBuilder_DefaultValueErrorMessageFieldEmpty
      );
      return;
    }

    if (isfieldsHasEmptyFields) {
      openNotificationWithIcon(
        "error",
        languageConstants?.ExpressionBuilder_ValidationRuleFieldEmpty
      );
      return;
    }

    if (minMaxExmptyIfTheCheckBoxIsEnabled) {
      openNotificationWithIcon(
        "error",
        languageConstants?.ExpressionBuilder_ValidationMustPassed
      );
      return;
    }

    if (
      validation?.minMaxValidation &&
      validation.andOrValidation &&
      validation.nestingLevelValidation
    ) {
      saveVisibilityData(
        savedVisibilityRuleFinalFormat ? savedVisibilityRuleFinalFormat : {},
        savedValidationRuleFinalFormat ? savedValidationRuleFinalFormat : {},
        savedOutputDocShowRuleFinalFormat
          ? savedOutputDocShowRuleFinalFormat
          : {},
        !savedMinMaxRuleFinalFormat?.length ? {} : savedMinMaxRuleFinalFormat,
        defaultTriggers ? defaultTriggers : {}
      );
    } else {
      openNotificationWithIcon(
        "error",
        languageConstants?.ExpressionBuilder_ValidationMustPassed
      );
      return;
    }
  };

  const messageHandler = async () => {
    try {
      const languageConstantsFromResTable = await loadResourceString();
      if (languageConstantsFromResTable?.data && languageConstants?.length) {
        const mergedObject = languageConstantsFromResTable?.data.reduce(
          (result: any, currentObject: any) => {
            return Object.assign(result, currentObject);
          },
          {}
        );
        if (Object.keys(mergedObject).length) {
          const originalConstants = languageConstants[0];
          const updatedValues = mergedObject[0];

          for (const key in updatedValues) {
            if (key in updatedValues && key in originalConstants) {
              originalConstants[key] = updatedValues[key];
            }
          }
          setLanguageConstants(originalConstants);
        }
      }
    } catch (error) {
      console.log("error ====>", error);
    }
  };
  const clearItems = async (): Promise<void> => {
    if (selectedTab === "vr") {
      await saveVisibilityData({}, {}, {}, {}, false);
      _setNestedRows(null);
    }

    if (selectedTab === "dv") {
      await saveVisibilityData(false, false, false, false, {});
      _setDefaultRows(null);
    }
  };

  const handleSaveAndClose = async () => {
    setIsApiDataLoaded(true);
    await handleSaveLogic();
    setIsApiDataLoaded(false);
    await closeTab();
  };
  const showPromiseConfirm: any = async () => {
    confirm({
      title: "Do you want to clear the creation rule?",
      icon: <ExclamationCircleFilled />,
      content:
        `When the OK button is clicked, all the rule associated with ${
          selectedTab === "vr" ? " Validation rule " : " Default rule"
        }` + " will be deleted.",
      onOk() {
        return clearItems();
      },
      onCancel() {},
    });
  };

  return (
    <div>
      {contextHolder}
      {/* <div className="country-lan">
        <Radio.Group
          options={countryMappedConfigs}
          onChange = { (e) => languageChangeHandler(e)}
          value={selectedLanguage}
          optionType="button"
          buttonStyle="solid"
      />

      </div> */}

      {currentPossitionDetails?.currentPosition === "question" &&
        currentQuestionDetails?.questionType !== "Grid" && (
          <div className="tabs-configs">
            <Radio.Group
              options={tabsConfigs?.map((tab: any) => {
                if (tab.value === "vr") {
                  return {
                    ...tab,
                    label:
                      languageConstants?.ExpressionBuilder_ValidationRuleTab,
                  };
                } else if (tab.value === "dv") {
                  return {
                    ...tab,
                    label: languageConstants?.ExpressionBuilder_DefaultValueTab,
                  };
                }
              })}
              onChange={(e) => setSelectedTab(e?.target?.value)}
              value={selectedTab}
              optionType="button"
              buttonStyle="solid"
            />
          </div>
        )}

      <div className="validation-wrap">
        <div style={{ textAlign: "right", position: "relative", top: "33px" }}>
          <Space wrap>
            <Button onClick={showPromiseConfirm}>Reset</Button>
          </Space>
        </div>
        {selectedTab === "vr" ? (
          <>
            {!isApiDataLoaded ? (
              <div>
                {currentPossitionDetails && (
                  <div>
                    <div className="nestedBtns">
                      <Button
                        className="mr-10 btn-default"
                        onClick={addComponent}
                        disabled={suerveyIsPublished}
                      >
                        {"+ " + languageConstants?.ExpressionBuilder_AddButton}
                      </Button>
                      <Button
                        className="btn-default"
                        onClick={addNestedComponent}
                        disabled={suerveyIsPublished}
                      >
                        {"+ " +
                          languageConstants?.ExpressionBuilder_AddNestedButton}
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
                            // setDeleteSectionKey={setDeleteSectionKey}
                            setSaveAsIsNested={setSaveAsIsNested}
                            imageUrls={{ imageUrl, imageUrl1, imageUrl2 }}
                            suerveyIsPublished={suerveyIsPublished}
                            currentQuestionDetails={currentQuestionDetails}
                            handleSectionRemove={handleSectionRemove}
                            languageConstants={languageConstants}
                            tabType={dbConstants?.tabTypes?.validationTab}
                            setDefaultTabValidationPassed={
                              setDefaultTabValidationPassed
                            }
                            // setDefaultActionSetWhenRetriving={setDefaultActionSetWhenRetriving}
                            // defaultActionSetWhenRetriving={defaultActionSetWhenRetriving}
                            setMinMaxCheckboxEnabled={setMinMaxCheckboxEnabled}
                          />
                        </div>
                      ))}

                    {_nestedRows?.length > 0 && (
                      <>
                        <div style={{ display: "flex", textAlign: "right" }}>
                          <div className="text-right">
                            <Button
                              onClick={handleSaveLogic}
                              className="btn-primary"
                              disabled={suerveyIsPublished}
                            >
                              {
                                languageConstants?.ExpressionBuilder_SaveButtonConstants
                              }
                            </Button>
                          </div>
                          <div className="save-close">
                            <Button
                              onClick={handleSaveAndClose}
                              className="btn-primary"
                              disabled={suerveyIsPublished}
                            >
                              {
                                languageConstants?.ExpressionBuilder_SaveAndCloseButton
                              }
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Space size="middle">
                <div>
                  <div>
                    {
                      languageConstants?.ExpressionBuilder_QuestionsLoadingConstants
                    }
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <Spin />
                  </div>
                </div>
              </Space>
            )}
          </>
        ) : (
          <>
            {!isApiDataLoaded ? (
              <div>
                {((currentPossitionDetails && currentQuestionDetails) ||
                  localTest) && (
                  <div>
                    <div className="nestedBtns">
                      <Button
                        className="mr-10 btn-default"
                        onClick={() => addDefaultComponent()}
                        disabled={suerveyIsPublished}
                      >
                        {"+ " + languageConstants?.ExpressionBuilder_AddButton}
                      </Button>
                    </div>
                    {/* <div> Default Tab </div> */}
                    {defaultSections?.length > 0 &&
                      defaultSections.map((section) => (
                        <div key={section.key} className="nested-wrap">
                          <SectionContainer
                            sectionLevel={section.key}
                            conditionData={conditionData}
                            setConditionData={setConditionData}
                            _setNestedRows={_setDefaultRows}
                            _nestedRows={_defaultRows}
                            isNested={isNested}
                            currentPossitionDetails={currentPossitionDetails}
                            questionList={questionList}
                            setValidation={setValidation}
                            // setDeleteSectionKey={setDeleteSectionKey}
                            setSaveAsIsNested={setSaveAsIsNested}
                            imageUrls={{ imageUrl, imageUrl1, imageUrl2 }}
                            suerveyIsPublished={suerveyIsPublished}
                            currentQuestionDetails={currentQuestionDetails}
                            handleSectionRemove={handleSectionRemove}
                            languageConstants={languageConstants}
                            tabType={dbConstants?.tabTypes?.defaultValueTab}
                            setDefaultTabValidationPassed={
                              setDefaultTabValidationPassed
                            }
                            // setDefaultActionSetWhenRetriving={setDefaultActionSetWhenRetriving}
                            // defaultActionSetWhenRetriving={defaultActionSetWhenRetriving}
                            setMinMaxCheckboxEnabled={setMinMaxCheckboxEnabled}
                            currentListQuestionAnswers={
                              currentListQuestionAnswers
                            }
                          />
                        </div>
                      ))}
                    <div className="text-right">
                      <Button
                        onClick={handleSaveLogic}
                        className="btn-primary"
                        disabled={suerveyIsPublished}
                      >
                        {
                          languageConstants?.ExpressionBuilder_SaveButtonConstants
                        }
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Space size="middle">
                <div>
                  <div>
                    {
                      languageConstants?.ExpressionBuilder_QuestionsLoadingConstants
                    }
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <Spin />
                  </div>
                </div>
              </Space>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ParentComponent;
