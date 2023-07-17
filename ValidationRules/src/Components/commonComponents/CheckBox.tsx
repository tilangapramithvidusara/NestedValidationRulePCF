import React, { useEffect } from 'react';
import { Checkbox, Col, Row } from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';

interface CheckBoxProps {
  checkboxDefaultSelectedValues: any,
  checkboxValuesFromConfig: any
}

function CheckBox({
  checkboxDefaultSelectedValues,
  checkboxValuesFromConfig,
}: CheckBoxProps) {

  useEffect(() => {
    console.log("checkboxValuesFromConfig", checkboxValuesFromConfig)
  }, [checkboxValuesFromConfig])

  return (
   <>
      {
        checkboxValuesFromConfig && checkboxValuesFromConfig.length > 0 && checkboxValuesFromConfig.map((configAction: any) => (
          <Checkbox.Group
          style={{ display: 'block', marginBottom: '10px' }}
          className="actionWrap"
          defaultValue={checkboxDefaultSelectedValues}
        >
          <Row>
            <Col span={24}>
              <Checkbox value={configAction.value}>{configAction?.displayName && <span className='checkboxLabel'>{configAction?.displayName}</span>} </Checkbox>
            </Col>
          </Row>
          
          </Checkbox.Group>
        ))
      }
       </>
  );
}

export default CheckBox;
