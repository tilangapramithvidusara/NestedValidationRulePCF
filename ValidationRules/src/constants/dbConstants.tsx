export const dbConstants = {
  chapter: {
    fieldName: "gyde_surveytemplatechapter",
    publishedStatus: 528670001
  },
  section: {
    fieldName: "gyde_surveytemplatechaptersection",
    publishedStatus: 528670001
  },
  question: {
    fieldName: "gyde_surveytemplatechaptersectionquestion",
    gyde_minmaxvalidationrule: "gyde_validationrule",
    gyde_documentOutputRule: "gyde_documentoutputrule",
    gyde_defaultValueFormula: "gyde_questionresponsedefaultrule",
    publishedStatus: 528670001
  },
  common: {
    gyde_validationrule: "gyde_validationrule",
    gyde_visibilityrule: "gyde_visibilityrule",
    statusCode: "statuscode",
    dateFormat: "YYYY-MM-DD",
  },
  questionTypes: {
    numericQuestion: "Numeric",
    stringQuestion: "String",
    listQuestion: "List",
    dateTimeQuestion: "Date",
    gridQuestion: "Grid"
  },
  tabTypes: {
    validationTab: "validationTab",
    defaultValueTab: "defaultValueTab"
  }
};
