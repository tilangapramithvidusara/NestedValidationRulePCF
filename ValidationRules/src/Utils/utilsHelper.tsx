const getAllIds = (data: any[] = [], result: any[] = []) => {
  for (let item of data) {
    if (item.level) {
      result.push(item.level);
    }
    if (item.hasNested && item.innerConditions) {
      getAllIds(item.innerConditions, result);
    }
  }
  return result;
};

const getParentIds = (object: any, level: number) => {
  let ids: number[] | undefined;
  if (!object || typeof object !== "object") return; // no object
  if (object.level === level) return []; // id found
  return object.innerConditions.some((o: any) => (ids = getParentIds(o, level))) // call recursive function
    ? [...ids!, object.level] // if found, take ids
    : undefined; // otherwise return falsy
};

const updateByParentId = (data: any, parentId: any, newObj: any) => {
  console.log("------------>", data, parentId, newObj);
  data.forEach((i: { level: any; innerConditions: any[], hasNested: any }) => {
    if (i.level == parentId) {
        i.innerConditions = [...i.innerConditions, newObj];
        if (i?.innerConditions?.length > 0) {
            i.hasNested = true;
          }
    } else {
      updateByParentId(i.innerConditions, parentId, newObj);
    }
  });
    
    

    
    
  console.log("------------ data>", data);
  const newArr = [...data];
  return newArr;
};

const getNearestParentByItems = (
  items: any,
  id: any,
  parent = null
): any | null => {
  for (let item of items) {
    let res =
      item.level === id
        ? parent
        : item.innerConditions &&
          getNearestParentByItems(item.innerConditions, id, item);
    if (res) return res;
  }
  return null;
};

const generateOutputString = (conditions: string | any[]) => {
  let expression = "";

  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i];
    const previousCondition = conditions[i - 1];

    if (condition.hasNested) {
      const innerExpression = generateOutputString(condition.innerConditions);
      //   expression += `(${condition.field} ${condition.condition} ${condition.value} ${innerExpression})`;
        console.log("DDDDDD", innerExpression)
      expression += `${
        condition?.expression ? condition?.expression : ""
      } (${condition.field} ${condition.condition} ${
        condition.value
      } ${innerExpression && innerExpression.length ? ` ${innerExpression} ` : ""} )`;
    } else {
      //   expression += condition.field;
      expression += ` ${
        condition?.expression ? condition?.expression : ""
      } ${condition.field} ${condition.condition} ${condition.value}`;
    }

    //   if (i !== conditions.length - 1) {
    //     expression += ` ${condition.expression ? condition.expression : ""} `;
    //   }
  }

  return expression;
};

const updateFieldByLevel = (
  array: any,
  targetLevel: any,
  updatedField: any
) => {
  for (let item of array) {
    if (item.level === targetLevel) {
      const { fieldName, fieldValue } = updatedField;
      if (fieldName && fieldValue) item[fieldName] = fieldValue;
    }

    if (item.innerConditions && item.innerConditions.length > 0) {
      updateFieldByLevel(item.innerConditions, targetLevel, updatedField);
    }
  }
  const newArr = [...array];
  return newArr;
};

const updateAllLevelArray = (
  _nestedRows: any[],
  sectionLevel: any,
  newRow: any
) => {
  const existingLevel1Index = _nestedRows.findIndex(
    (item: any) => sectionLevel in item
  );

  if (existingLevel1Index !== -1) {
    return _nestedRows.map((prevData: any, index: number) => {
      const existingActions = prevData[sectionLevel]?.actions;
      if (index === existingLevel1Index) {
        return {
          ...prevData,
          [sectionLevel]: {
            fields: newRow,
              actions: _nestedRows.find((x: any) => x[sectionLevel])?.[sectionLevel]?.actions || [],
          },
        };
      }
      return prevData;
    });
  } else {
    return [
      {
        [sectionLevel]: {
          fields: newRow,
              actions: _nestedRows.find((x: any) => x[sectionLevel])?.[sectionLevel]?.actions || [],
        },
      },
      ..._nestedRows,
    ];
  }
};

const updateAllLevelActionsArray = (
  _nestedRows: any[],
  sectionLevel: any,
  actionList: any
) => {
  const existingLevel1Index = _nestedRows.findIndex(
    (item: any) => sectionLevel in item
  );
    console.log("actionListactionListactionList", actionList)
  if (existingLevel1Index !== -1) {
    return _nestedRows.map((prevData: any, index: number) => {
      if (index === existingLevel1Index) {
        const existanceFields = prevData[sectionLevel].fields;
        return {
          ...prevData,
          [sectionLevel]: {
            fields: existanceFields,
            actions: actionList,
          },
        };
      }
      return prevData;
    });
  } else {
    return [
      {
            [sectionLevel]: {
                actions: actionList,
                fields: _nestedRows?.find((x: { [x: string]: any; }) => x[sectionLevel])[sectionLevel]?.fields || [],
        },
      },
      ..._nestedRows,
    ];
  }
};

const removeByKey = (removeArray: any[], removingKey: any): any[] => {
    return removeArray
      .filter(a => a.level !== removingKey)
      .map(e => {
        return { ...e, innerConditions: removeByKey(e.innerConditions || [], removingKey) };
      });
};
  



const findGroupId = (o: any, id: any): any => {
    console.log("ooooooooooo", o)
    console.log("ooooooooooo", id)

    if (o?.level == id) {
      return o;
    }
  
    if (Array.isArray(o)) {
      o = {
        innerConditions: o
      }
    }
  
    let results = [];
    for (let c of o.innerConditions ?? []) {
      results.push(findGroupId(c, id))
    }
  
    return results.filter(r => r !== undefined)[0];
  }
  
  const getAllChildrenIDs = (o: any) : any => {
    if (o?.innerConditions === undefined)
      return [];
    let ids = [];
    for (let c of o.innerConditions ?? []) {
      ids.push(c.level);
      for (let id of getAllChildrenIDs(c))
        ids.push(id);
    }
    return ids;
  }


  const updateCollapseByParentId = (data: any, parentId: any, collapse: any) => {
    console.log("------------>", data, parentId, collapse);
    data.forEach((i: { level: any; innerConditions: any[], collapse: any }) => {
      if (i.level == parentId) {
         i.collapse = collapse;
      } else {
        updateCollapseByParentId(i.innerConditions, parentId, collapse);
      }
    });
    console.log("------------ data>", data);
    const newArr = [...data];
    return newArr;
  };

export {
  getAllIds,
  getParentIds,
  updateByParentId,
  getNearestParentByItems,
  generateOutputString,
  updateFieldByLevel,
  updateAllLevelArray,
    updateAllLevelActionsArray,
    removeByKey,
    findGroupId,
    getAllChildrenIDs,
    updateCollapseByParentId
};
