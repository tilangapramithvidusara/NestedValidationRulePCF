import * as React from "react";
import operationsSampleData from '../SampleData/sampleInputQuestion';
import { dbConstants } from "../constants/dbConstants";
import { LogicNewSample, questionArraySample } from "../SampleData/SampleLogicData";
import { filterKeys } from "../constants/filterKeys";

declare global {
  interface Window {
    Xrm: any;
  }
}

export const loadAllQuestionsInSurvey = async () => {
  try {    
    const templateID = await window.parent.Xrm.Page.ui._formContext.getAttribute("gyde_surveytemplate").getValue()[0].id.replace("{", "").replace("}", "");
    const result = await window.parent.Xrm.WebApi.retrieveMultipleRecords("gyde_surveytemplatechaptersectionquestion", "?$select=gyde_name,gyde_answertype,gyde_shortname,statecode,gyde_label&$filter= _gyde_surveytemplate_value eq " + templateID);
    return {
      error: false,
      data: result?.entities?.length > 0 ? result?.entities : []
    }
    
  } catch (error) {
    return {
      error: true,
      data: questionArraySample
    }
  }
}

export const getCurrentState = async () => {
  try {    
    const entityTypeName = window.parent.Xrm.Page.ui._formContext.contextToken.entityTypeName
    console.log("entityTypeName State ===========> ", entityTypeName);
    const updatedId = parent.Xrm.Page.ui.formContext.data.entity.getId().replace("{", "").replace("}", "");
    let currentPosition;
    let currentName;
    let currentEntityNme;
    if (entityTypeName.includes('question')) {
      currentPosition = 'question';
      currentEntityNme = dbConstants?.question?.fieldName;
      
    }
    else if (entityTypeName.includes('section')) {
      currentPosition = 'section';
      currentEntityNme = dbConstants?.section?.fieldName;
    }
    else if (entityTypeName.includes('chapter')) {
      currentPosition = 'chapter';
      currentEntityNme = dbConstants?.chapter?.fieldName;
    }
    if (currentEntityNme && updatedId) {
      let result = await window.parent.Xrm.WebApi.retrieveRecord(currentEntityNme, updatedId);
      currentName = result?.gyde_name;
    }

      // return { id: updatedId, currentPosition };
    // });
    return {
      error: false,
      data: [{ id: updatedId, currentPosition, currentName }]
    }
  } catch (error) {
    console.log("error ========> ", operationsSampleData);
    return {
      error: true,
      data: []
    }
  }
}

export const saveValidationRules = async(validationRuleData: object) => {
  try {
    const id = await window.parent.Xrm.Page.ui._formContext.data.entity.getId().replace("{", "").replace("}", "");
    const currentEntity = await window.parent.Xrm.Page.ui._formContext.contextToken.entityTypeName;    
  } catch (error) {
    console.log("save error =========> ", error);
    
  }
}
  
  export const fetchRequest = async (
    entityLogicalName: any,
    id: string,
    columnsNames:string
  ): Promise<any> => {
    try {
      let result = await window.parent.Xrm.WebApi.retrieveRecord(entityLogicalName, id, columnsNames);
      let _result : any = {}
      if (result?.gyde_validationrule) _result = result[dbConstants.question.gyde_minmaxvalidationrule];
      else if(result?.gyde_visibilityrule) _result = result[dbConstants.common.gyde_visibilityrule];
      else if (result?.gyde_documentoutputrule) _result = result[dbConstants.question.gyde_documentOutputRule];
      else if(result?.gyde_questionresponsedefaultrule) _result = result[dbConstants.question.gyde_defaultValueFormula];
      if (typeof _result === 'object') {
        _result = {}
      } else { 
        _result = JSON.parse(_result);
      }
      
  
      return { error: false, data: _result, loading: false };
    } catch (error: any) {
      // handle error conditions
      console.log("error",error);
      return { error: true, data: [], loading: false };
    }
  };
  
  export const saveRequest = async (
    entityLogicalName: any,
    id: string,
    data:any
  ): Promise<any> => {
    try {
      let result
      result = await window.parent.Xrm.WebApi.updateRecord(entityLogicalName, id, data);
      return { error: false, data: result, loading: false };
    } catch (error: any) {
      return { error: true, data: [], loading: false };
    }
  };

export const updateDataRequest = async (
  entityLogicalName: any,
  id: any,
  data: any
): Promise<any> => {
  try {
    const result = await window.parent.Xrm.WebApi.updateRecord(
      entityLogicalName,
      id,
      data
    );
    console.log("update result",result);
    return { error: false, data: result };
  } catch (error: any) {
    console.log("update error",error);
    return { error: true, data: {} };
  }
};

export const getCurrentId = async (
): Promise<any> => {
  try {
    let id = await window.parent.Xrm.Page.ui.formContext.data.entity.getId();
    console.log("GUILDD", id);
    id = id.replace("{", "").replace("}", "");
    return { error: false, data: id };
  } catch (e) {
    console.log("GetId error", e);
    return { error: true, data: {} };
  }
};


export const getListAnswersByQuestionId = async (questionGuid: any): Promise<any> => {
  try {
    let listAnswers = await window.parent.Xrm.WebApi.retrieveMultipleRecords("gyde_surveytemplatequestionanswer", "?$filter=_gyde_relatedquestion_value eq " + questionGuid)
    console.log("listAnswers", listAnswers)
    
        for (var i = 0; i < listAnswers.entities.length; i++) {
          var result = listAnswers.entities[i];
          // Columns
          var gyde_surveytemplatequestionanswerid = result["gyde_surveytemplatequestionanswerid"];
        }
    return {
      error: false, data: listAnswers
    };
  } catch (e) {
    console.log("GetQuestion error", e);
    return { error: true, data: {} };
  }

}


export const getPublishedStatus = async (currentPositionDetails: any) : Promise<any> => {
  try {
    let currentStatus;
    let statusCode;
    let currnetGuid;

    let currentFieldName;
    let currentIdKey;
    let expectedStatusCodeForPublished;
    let isPublished = false;

    if (currentPositionDetails?.id && currentPositionDetails?.currentPosition) {
      if (currentPositionDetails?.currentPosition === 'question') {
        currentFieldName = dbConstants.question.fieldName
        currentIdKey = "gyde_surveytemplatechaptersectionid";
        expectedStatusCodeForPublished = dbConstants.question.publishedStatus;

      } else if (currentPositionDetails?.currentPosition === 'section') {
        currentFieldName = dbConstants.section.fieldName
        currentIdKey = "gyde_surveytemplatechaptersectionid"
        expectedStatusCodeForPublished = dbConstants.section.publishedStatus;

      } else if (currentPositionDetails?.currentPosition === 'chapter') {
        currentFieldName = dbConstants.chapter.fieldName
        currentIdKey = "gyde_surveytemplatechapterid"
        expectedStatusCodeForPublished = dbConstants.chapter.publishedStatus;
      }

      console.log("currentFieldName", currentFieldName);
      console.log("currentIdKey" , currentIdKey)

      if (currentFieldName && currentIdKey) {
        currentStatus = await window.parent.Xrm.WebApi.retrieveRecord(currentFieldName, currentPositionDetails?.id, "?$select=statuscode");
        console.log("current Published Status", currentStatus )
        currnetGuid = currentStatus[currentIdKey];
        statusCode = currentStatus[dbConstants.common.statusCode];
        isPublished = statusCode === expectedStatusCodeForPublished
      }
    }

    return { error: false, data: { currentStatus, isPublished, currnetGuid } }

  } catch (e) {
    console.log("Published Status Error", e);
    return { error: true, data: {} }
  }
}

export const loadResourceString = async () : Promise<any> => {

  const url = await window.parent.Xrm.Utility.getGlobalContext().getClientUrl();
  const language = await window.parent.Xrm.Utility.getGlobalContext().userSettings.languageId
  const webResourceUrl = `${url}/WebResources/gyde_localizedstrings.${language}.resx`;
  const mapper: any = [];

  try {
    const response = await fetch(`${webResourceUrl}`);
    const data = await response.text();
    console.log("Web Res Dataaa", data);
    console.log("Filter Keyssss", filterKeys);
    filterKeys?.map((filterKey: string, index: number) => {
      const parser = new DOMParser();
      // Parse the XML string
      const xmlDoc = parser.parseFromString(data, "text/xml");
      // Find the specific data element with the given key
      const dataNode: any = xmlDoc.querySelector(`data[name="${filterKey}"]`);
      // Extract the value from the data element
      const value: any = dataNode?.querySelector("value").textContent;
      console.log('data ====> ', index, value); 
      if (index && value) {
        mapper.push({ [filterKey]: value });
      }
    });
    
    return {
      error: false, data: mapper
    }
  } catch (e) {
    console.log("Language Translation Error", e);
    return {
      error: true, data: {}
    }
  }
  }

  export const closeTab = async () : Promise<any> =>{
      var formContext =  window?.parent?.Xrm.Page;
      // Check if the form context is available
      if (formContext.ui && formContext.ui.close) {
          formContext.ui.close();
      } else {
          console.error("formContext.ui.close is not available.");
      }
  }
