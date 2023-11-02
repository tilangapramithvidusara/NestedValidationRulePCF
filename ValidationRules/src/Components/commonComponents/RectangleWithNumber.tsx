import React from "react";

interface RectangleWithNumberProps {
    number: any; // Adjust the type/interface as needed
    separate: any,
}

const RectangleWithNumber: React.FC<RectangleWithNumberProps> = ({ number, separate }) => {
    const rectangleClasses = `rectangle ${separate ? 'separate' : 'reachable'}`;
  
    return (
      <div className={rectangleClasses}>
        {number}
      </div>
    );
}
  
export default RectangleWithNumber;