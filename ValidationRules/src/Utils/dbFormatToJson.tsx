const sampleArr = {
  and: [
    {
      or: [
        {
          eq: [
            {
              var: "Q_110_100_111",
            },
            "22",
          ],
        },
        {
          and: [
            {
              eq: [
                {
                  var: "Q_110_100_222",
                },
                "2",
              ],
            },
            {
              eq: [
                {
                  var: "Q_120_100_333",
                },
                "3",
              ],
            },
          ],
        },
        {
          eq: [
            {
              var: "Q_120_100_444",
            },
            "32",
          ],
        },
        {
          and: [
            {
              eq: [
                {
                  var: "Q_110_100_555",
                },
                "2",
              ],
            },
            {
              eq: [
                {
                  var: "Q_120_100_666",
                },
                "3",
              ],
            },
            {
              and: [
                {
                  eq: [
                    {
                      var: "Q_110_100_777",
                    },
                    "2",
                  ],
                },
                {
                  eq: [
                    {
                      var: "Q_120_100_888",
                    },
                    "3",
                  ],
                },
              ],
            },
          ],
        },
      ],
    }
    // {
    //   eq: [
    //     {
    //       var: "Q_130_100_999",
    //     },
    //     "10",
    //   ],
    // },
    // {
    //   eq: [
    //     {
    //       var: "Q_140_101111100",
    //     },
    //     "101",
    //   ],
    // },
  ],
};

// Break to levels

const convertDbFormatToJSON = (_sampleArr: any, level: any) => {
    const resArray: any= [];
    const travese = (arr: any) => {
      const key = Object.keys(arr)[0]
      console.log("KEYYYY", key)
      if (key === 'and' || key === 'or') {
        let primaryKey: string;
        arr[key].forEach((x: { [x: string]: any[]; }, index: any) => {
          const childKey = Object.keys(x)[0]
          if (Object.keys(x)[0] === "and" || Object.keys(x)[0] === "or") {
            primaryKey = Object.keys(x)[0]
          }
          if (x[primaryKey]) {
            const rqObjs = x[primaryKey].filter((x: { eq: any; }) => x.eq);
            // console.log("rqObjs", rqObjs);
            resArray.push({ operator: primaryKey, values: rqObjs, level: level++ });
          }
          travese(x)
        })
      }
      return resArray
    }
    const gg = travese(_sampleArr)
    console.log("GGGG", gg)
  
    // //
    function buildNestedStructure(arr: any[], parentLevel: number) : any {
      // console.log("SDDDDDDDD", arr)
      const children = arr.filter((item: { level: any; }) => item.level === parentLevel + 1);
      if (children.length === 0) {
        return [];
      }
  
      return children.map((child: { level: any; }) => {
        return {
          ...child,
          children: buildNestedStructure(arr, child.level),
        };
      });
    }
  
    const _structeredArr = buildNestedStructure(travese(sampleArr), 0)

    const convertObj = (inputJSON: any[]) => {
  
      inputJSON.forEach((parentObj: { values?: any; level?: any; operator?: any; innerConditions?: any; children?: any; }) => {
        let lastIndex = 0
        let currentFieldValues = parentObj.values.map((y: { eq: any[]; }, index: number) => {
          lastIndex = index
          return {
            field: y.eq[0].var,
            condition: Object.keys(parentObj)[0],
            value: y.eq[1],
            sort: 1,
            level: parentObj.level,
            expression: parentObj.operator,
            innerConditions: [],
            hasNested: false
          }
        
        })
        parentObj.innerConditions = currentFieldValues
          parentObj.innerConditions[lastIndex].temps = parentObj?.children[0] || {}
          parentObj.innerConditions[lastIndex].hasNested = true 
          parentObj.innerConditions[lastIndex].level = parseInt(parentObj.level + `1`);
        const tempchild = parentObj.children
        delete parentObj.children
        delete parentObj.values
        delete parentObj.level
        delete parentObj.operator
        convertObj(tempchild)
      })
    
    }
  
    convertObj(_structeredArr)
    console.log("---M ",JSON.stringify(_structeredArr, null, 2))
  
    function removeTempsAndMoveInnerConditions(jsonData: any[]) {
      console.log("JSON", jsonData)
      if (!Array.isArray(jsonData)) {
        return;
      }
  
      jsonData.forEach((item) => {
        if (Object.prototype.hasOwnProperty.call(item, "temps")) {
          const temps = item.temps;
          delete item.temps;
          item.innerConditions = temps?.innerConditions;
          removeTempsAndMoveInnerConditions(item.innerConditions);
        } else if (Array.isArray(item.innerConditions)) {
          removeTempsAndMoveInnerConditions(item.innerConditions);
        }
      });
    }
  
    removeTempsAndMoveInnerConditions(_structeredArr[0].innerConditions)
    return _structeredArr[0].innerConditions
};



const normalConverter = (sampleArr: any) => {
    const parentLevelKey : any = Object.keys(sampleArr);
    const parentLvlArray: any = [];
    let level = 0
    sampleArr[parentLevelKey].forEach((obj: { eq?: any; }) => {
   
   if(Object.keys(obj)[0] === 'eq') {
        // console.log(obj)
        parentLvlArray.push({
          field: obj.eq[0].var,
        condition: Object.keys(obj)[0],
        value: obj.eq[1], 
        sort: 1,
        level: level++,
        expression: parentLevelKey[0],
        innerConditions:[]
        })
    }else {
       console.log(obj)
       parentLvlArray.push(...convertDbFormatToJSON(obj, level++));
    }
    });
    console.log("DDDDDFEFFEEFUHFE", parentLvlArray)
    return parentLvlArray
  } 

export { convertDbFormatToJSON, normalConverter };
