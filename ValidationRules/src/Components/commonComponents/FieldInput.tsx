import React from 'react';
import { Select, Tooltip } from 'antd';
import sampleInputQuestion from '../../SampleData/sampleInputQuestion';

interface SearchSortProps {
    sampleData: any[]; // Adjust the type/interface as needed
    selectedValue: any,
    overrideSearch: boolean,
    setFieldValue: any,
    changedId: any,
    fieldName: any
    isDisabled: any
}
  
const FieldInput: React.FC<SearchSortProps> = ({sampleData, selectedValue, overrideSearch, setFieldValue, changedId, fieldName, isDisabled}) => {

    const searchFilterSort = (optionA: any, optionB: any) => {
        return (optionA?.value ?? '')?.toLowerCase().localeCompare((optionB?.value ?? '')?.toLowerCase());
    }

    const searchFilterOption = (input: any, option: any) => {
        console.log("orppPP option", input, option);
        return (option?.value ?? '')?.toLowerCase()?.includes(input?.toLowerCase())
    }
    
    const onChangeSearchEvent = (input: any, option: any) => {
        setFieldValue({input, changedId, fieldName})
    }
    const renderToolTip = (label: string) => {
        console.log("LABELLLL", label)
        return <Tooltip placement="topLeft" title="saeseff" />;
    };
    return (
        <div>
        <Select
            showSearch={overrideSearch ? overrideSearch : true}
            style={{ width: '200px' }}
            placeholder="Value"
            optionFilterProp="children"
            filterOption={searchFilterOption}
            filterSort={searchFilterSort}
            onChange={onChangeSearchEvent}
            defaultValue={selectedValue}
            disabled={isDisabled}
        >
            {sampleData?.map((option: any) => (
                <Select.Option
                    key={option?.value}
                    value={option?.value}
                    onMouseEnter={() => renderToolTip(option?.value)}
                    title={option?.questionLabel}
                >
                    {option?.value}
                </Select.Option>
            ))}
        </Select>
    </div>
    )
}

export default FieldInput;