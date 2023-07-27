import * as React from "react";
import operationsSampleData from '../SampleData/sampleInputQuestion';

import { LogicNewSample, questionArraySample } from "../SampleData/SampleLogicData";

declare global {
  interface Window {
    Xrm: any;
  }
}

export const loadAllQuestionsInSurvey = async () => {
  console.log('come');
  
  try {
    console.log('come2');
    
    // const templateID = await window.parent.Xrm.Page.ui._formContext.getAttribute("gyde_surveytemplate").getValue()[0].id.replace("{", "").replace("}", "");
    // console.log('template id =========> ', templateID);
    // const result = await window.parent.Xrm.WebApi.retrieveMultipleRecords("gyde_surveytemplatechaptersectionquestion", "?$select=gyde_name,gyde_answertype,gyde_shortname&$filter= _gyde_surveytemplate_value eq " + templateID);
    // console.log("result ===========> ", result);
    console.log('result.entities=====> ', questionArraySample);
    
    return {
      error: false,
      data: questionArraySample
      // result?.entities?.length > 0 ? result?.entities : []
    }
    
  } catch (error) {
    console.log("error ========> ", operationsSampleData);
    return {
      error: true,
      // data: [],
      data: operationsSampleData
    }
  }
}

export const getCurrentState = async () => {
  try {    
    let result = await window.parent.Xrm.Page.ui._formContext.getAttribute("gyde_relatedsurveytemplateitem").getValue()
    console.log("Current State ===========> ", result);
    result = result?.map((obj: any) => {
      const updatedId = obj?.id.replace("{", "").replace("}", "");
      let currentPosition;
      
      if (obj?.entityType.includes('question')) currentPosition = 'question';
      else if (obj?.entityType.includes('section')) currentPosition = 'section';
      else if (obj?.entityType.includes('chapter')) currentPosition = 'chapter';
      return { ...obj, id: updatedId, currentPosition };
    });

    return {
      error: false,
      data: result
    }
    
  } catch (error) {
    console.log("error ========> ", operationsSampleData);
    return {
      error: true,
      data: []
    }
  }
}


//     window.parent.Xrm.WebApi.retrieveMultipleRecords("gyde_surveytemplatechaptersectionquestion", "?$select=gyde_name,gyde_answertype,gyde_shortname&$filter= _gyde_surveytemplate_value eq " + templateID).then(
//     function success(result: { entities: string | any[]; }) {
//         console.log("xrm questions =======> ", result)
//         for (var i = 0; i < result.entities.length; i++) {
//             console.log(result.entities[i]);
//         }

//     },
//     function (error: { message: any; }) {
//         console.log(error.message);
//     }
// );

export const saveValidationRules = async(validationRuleData: object) => {
  try {
    // Xrm.Page.ui._formContext.contextToken.entityTypeName
    // Xrm.Page.ui._formContext.data.entity.getId()

    const id = await window.parent.Xrm.Page.ui._formContext.data.entity.getId().replace("{", "").replace("}", "");
    const currentEntity = await window.parent.Xrm.Page.ui._formContext.contextToken.entityTypeName;
    console.log("validation rules data ===========> ", validationRuleData);
    
  } catch (error) {
    console.log("save error =========> ", error);
    
  }
}

//     window.parent.Xrm.WebApi.retrieveMultipleRecords("gyde_surveytemplatechaptersectionquestion", "?$select=gyde_name,gyde_answertype,gyde_shortname&$filter= _gyde_surveytemplate_value eq " + templateID).then(
//     function success(result: { entities: string | any[]; }) {
//         console.log("xrm questions =======> ", result)
//         for (var i = 0; i < result.entities.length; i++) {
//             console.log(result.entities[i]);
//         }

//     },
//     function (error: { message: any; }) {
//         console.log(error.message);
//     }
// );

// export const fetchRecordId = async (

//   ): Promise<any> => {
//     try {
//       const result = await window.parent.Xrm.Page.ui.formContext.data.entity.getId();
//       // const str = '{AC3FE85C-90E5-ED11-A7C7-000D3A338DD2}';
//       console.log("result in fetch record id",result);
//       const removedBrackets = result.replace(/[{}]/g, '');
  
//       console.log("removedBrackets",removedBrackets);
//       return { error: false, data: removedBrackets, loading: false };
//     } catch (error: any) {
//       // handle error conditions
//       console.log("error",error);
//       return { error: true, data: [], loading: false };
//     }
//   };
  
  export const fetchRequest = async (
    entityLogicalName: any,
    id: string,
    columnsNames:string
  ): Promise<any> => {
    try {
      const result = await window.parent.Xrm.WebApi.retrieveRecord(entityLogicalName,id,columnsNames);
      console.log("result in fetch request json parse..",result);
      console.log("gyde_name..",result.gyde_visibilityrule);
      return { error: false, data: result?.gyde_visibilityrule, loading: false };
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
      const result = await window.parent.Xrm.WebApi.updateRecord(entityLogicalName,id,data);
      return { error: false, data: result, loading: false };
    } catch (error: any) {
      // handle error conditions
      console.log("error",error);
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