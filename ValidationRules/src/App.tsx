import React, { useEffect, useState } from 'react'
import SearchWithSort from './Components/searchWithSort/searchWithSort';
import DropDown from './Components/dropDown/dropDown';
import CheckBox from './Components/checkbox/checkbox';

import TableRow from './Components/tableRow/tableRow';

import sampleInputQuestion from './SampleData/sampleInputQuestion';
import operationsSampleData from './SampleData/OperationsSampleData';
import expressionSampleData from './SampleData/expressionSampleData';
import showHideSampleData from './SampleData/showHideSampleData';

import { Button, Input, InputNumber } from 'antd';

interface Row {
  column1: string;
  column2: string;
  column3: string;
  column4: string;
  column5: string;
  column6: string;
}

interface Item {
  index: any;
  question: any;
  expression: any;
  operation: any;
  showhide: any;
  answerType: any;
}


export default function App() {
  // const props = { requiredProp: "bar" };
  const [rows, setRows] = useState<Row[]>([{
    column1: '',
    column2: '',
    column3: '',
    column4: '',
    column5: '',
    column6: ''
  }]);
  const [question, setQuestion] = useState<string | null>(null);
  const [expression, setExpression] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [showhide, setShowHide] = useState<string | null>(null);
  const [answerType, setAnswerType] = useState<string | null>(null);
  const [finalOutput, setFinalOutput] = useState<any[]>([]);
  const [checkboxValues, setCheckboxValues] = useState<any[]>([]);
  const [displayText, setDisplayText] = useState<any[]>([]);

  const addRow = () => {
    setRows([...rows, {
      column1: '',
      column2: '',
      column3: '',
      column4: '',
      column5: '',
      column6: ''
    }]);
    console.log("ROWWWW", rows)
  };

  const handleInputChange = (index: number, column: any) => {
    console.log("Calleddd", index, column)
    const updatedKey = Object.keys(column)[0];
    const updatedValue = Object.values(column)[0];

    const array = []
    array.push({ id: index, question, expression, operation, showhide, answerType })
    console.log("Calleddd array", array)

    const newItem: Item = {
      index: index,
      question: question,
      expression: expression,
      operation: operation,
      showhide: showhide,
      answerType: answerType
    };
    if (finalOutput && finalOutput.length) {
      let newState = [...finalOutput];
      newState[index][updatedKey] = updatedValue;
      setFinalOutput(newState)

    } else {
      setFinalOutput(prevItems => [...prevItems, newItem]);
    }

    if (finalOutput && finalOutput.length) {
      let outputVal = ""
      finalOutput.map(quesOutput => {
        if (quesOutput?.question) {
          outputVal = `if(${quesOutput?.question} ${quesOutput?.expression || ''} ${quesOutput?.answerType || ''} ${quesOutput?.operation || ''})`
          setDisplayText(prevItems => [...prevItems, outputVal]);
        }
      })
    }
  };

  useEffect(() => {
    console.log("DJFIssIFSS", checkboxValues)

  }, [finalOutput, checkboxValues])

  return (
    <>
      {/* <div>{question} {expression} {operation} {showhide} {answerType}</div> */}
      <div className='pcf-wrapper'>
        <div className='tableComponent'>

          <div>{"if("}{finalOutput.map((quesOutput, index) => {
            if (quesOutput?.question) {
              return `${quesOutput?.question} ${quesOutput?.expression || ''} ${quesOutput?.answerType || ''} ${finalOutput[index+1]?.operation || ''} `
            }
          })}{"){"}</div>
          <div>{checkboxValues.map(val => (` ${val} `))}</div>{`}`}
          <div className='row clearfix'>
            <div className='col-md-12 column'>
              <table className='table table-bordered table-hover'>
                <thead>
                  <tr>
                    <th> And/OR</th>
                    <th> Field </th>
                    <th> Operator </th>
                    <th> Value </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <TableRow
                      key={index}
                      row={row}
                      index={index}
                      handleInputChange={handleInputChange}
                      onQuestionChanged={setQuestion}
                      onExpressionChanged={setExpression}
                      onAnswerTypeChanged={setAnswerType}
                      onShowHideChanged={setShowHide}
                      onOperationChanged={setOperation}
                    />
                  ))}
                </tbody>
                <Button onClick={addRow}>Add Row</Button>
              </table>
            </div>
          </div>
        </div>
        
        <div className='actionfields'>
          <div style={{ marginTop: "5%", textAlign: "left" }}> 
            <div>Actions</div> 
            <div>
            <CheckBox
            setCheckboxValues={setCheckboxValues}
            />
            </div>
         
            </div>
        </div>
      </div>
    </>
  )
}
