import React, { useEffect, useState } from "react";
import configs from "../configs/actionMapper";
import toggleWithCheckboxMapper from "../configs/toggleWithCheckboxMapper";

import sampleOutputData from "../SampleData/SampleOutputData";
import utilHelper from "../utilHelper/utilHelper";
// import removeIcon from '../assets/delete.png';
import { Button } from "antd";
import RowContainer from "./rowContainer";
import SectionContainer from "./sectionContainer";

type MinMaxFieldValues = {
  minValue: any;
  maxValue: any;
  sectionKey: any;
  questionName: any;
};

const ParentComponent: React.FC = () => {
  const [conditionData, setConditionData] = useState<any[]>([]);

  // Get From XRM Requests
  const [sections, setSections] = useState<any[]>([]);
  const [_nestedRows, _setNestedRows] = useState<any>([]);
  const [isNested, setIsNested] = useState<any>();

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
  return (
    <div>
      <div className="nestedBtns">
        <Button className="mr-10 btn-default"  onClick={addComponent}> + Add </Button>
        <Button className="btn-default"  onClick={addNestedComponent}> + Add Nested</Button>
      </div>
      {sections.map((section) => (
        <div key={section.key} className="nested-wrap">
          <SectionContainer
            sectionLevel={section.key}
            conditionData={conditionData}
            setConditionData={setConditionData}
            _setNestedRows={_setNestedRows}
            _nestedRows={_nestedRows}
            isNested={isNested}
          />
        </div>
      ))}

      {/* <div className="text-left">
        <Button onClick={handleAddSection} className="btnAddRow">
          Add Clause
        </Button>
      </div>
      <div className="text-left">
        <Button onClick={handleAddSection} className="btnAddRow">
          Add Nested Clause
        </Button>
      </div> */}
    </div>
  );
};

export default ParentComponent;
