import React from 'react';
import { RangeSlider, TextField, Select } from '@shopify/polaris';
import { Controller } from 'react-hook-form';

const RangeController = ({ controllerName, id, control, selectControllerName, label, max, setSaveBar, unit }) => {
    let units;

    if (unit === "percent") {
        units = [{ label: '%', value: '%' }];
    } else if (unit === "pixel") {
        units = [{ label: 'px', value: 'px' }];
    } else if (unit === "pixel/%/rem") {
        units = [
            { label: 'px', value: 'px' },
            { label: '%', value: '%' },
            { label: 'rem', value: 'rem' }

        ];
    } else {
        units = [
            { label: 'px', value: 'px' },
            { label: '%', value: '%' },
            { label: 'em', value: 'em' },
            { label: 'rem', value: 'rem' }
        ];
    }

    return (
        // <Controller
        //     name={controllerName}
        //     control={control}
        //     defaultValue={1}
        //     render={({ field: { onChange, value } }) => (
        //         <div className='wf-wishlist-range-box'>
        //             <div className='wf-range-slider'>
        //                 <RangeSlider
        //                     id={id}
        //                     label={label}
        //                     min={0}
        //                     max={max}
        //                     // step={4}
        //                     value={value === "" ? 0 : value}
        //                     onChange={(newValue) => {
        //                         setSaveBar(true);
        //                         onChange(newValue === "" ? 0 : newValue);
        //                     }}
        //                 />
        //             </div>
        //             <div className='wf-range-input'>
        //                 <TextField
        //                     value={parseInt(value, 10) > max ? max : parseInt(value, 10) || 0}
        //                     onChange={(newValue) => {
        //                         // console.log("dddddddddd", value)
        //                         setSaveBar(true);
        //                         onChange(newValue > max ? max : parseInt(newValue, 10) || 0);
        //                     }}
        //                 />
        //             </div>
        //             <Controller
        //                 name={selectControllerName}
        //                 control={control}
        //                 defaultValue={units[0].value}
        //                 render={({ field: { onChange, value } }) => (
        //                     <Select
        //                         options={units}
        //                         value={value ? value : units[0].value}
        //                         onChange={(newValue) => {
        //                             setSaveBar(true);
        //                             onChange(newValue);
        //                         }}
        //                     />
        //                 )}
        //             />
        //         </div>
        //     )}
        // />

        <Controller
            name={controllerName}
            control={control}
            defaultValue={1}
            render={({ field: { onChange, value } }) => (
                <div className='wf-wishlist-range-box'>
                    <div className='wf-range-slider'>
                        <RangeSlider
                            id={id}
                            label={label}
                            min={0}
                            max={max}
                            value={value === "" ? 0 : value}
                            onChange={(newValue) => {
                                setSaveBar(true);
                                onChange(newValue === "" ? 0 : newValue);
                            }}
                        />
                    </div>
                    <div className='wf-range-input'>
                        <TextField
                            value={parseInt(value, 10) > max ? max : parseInt(value, 10) || 0}
                            onChange={(newValue) => {
                                // console.log("dddddddddd", value)
                                setSaveBar(true);
                                onChange(newValue > max ? max : parseInt(newValue, 10) || 0);
                            }}
                        />
                        <Controller
                            name={selectControllerName}
                            control={control}
                            defaultValue={units[0].value}
                            render={({ field: { onChange, value } }) => (
                                <Select
                                    options={units}
                                    value={value ? value : units[0].value}
                                    onChange={(newValue) => {
                                        setSaveBar(true);
                                        onChange(newValue);
                                    }}
                                />
                            )}
                        />
                    </div>
                </div>
            )}
        />

    );
};

export default RangeController;
