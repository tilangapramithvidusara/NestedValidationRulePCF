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
  };

  useEffect(() => {
    console.log("SECCCC", sections);
  }, [sections]);
  return (
    <div>
      <div className="nestedBtns">
        <Button onClick={addNestedComponent}> + Add </Button>
        <Button onClick={addNestedComponent}> + Add Nested</Button>
      </div>
      {sections.map((section) => (
        <div key={section.key}>
          <SectionContainer
            sectionLevel={section.key}
            conditionData={conditionData}
            setConditionData={setConditionData}
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
