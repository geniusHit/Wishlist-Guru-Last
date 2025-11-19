import { Select, TextField, Text } from '@shopify/polaris';
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import CustomColourPicker from '../pages/CustomColourPicker';


const useBorderController = ({ controllerName, control, id, controllerBorderUnitName, label, controllerBorderName, controllerBorderColor, setSaveBar, unit, myLanguage }) => {
    let units

    if (unit === "percent") {
        units = [

            { label: '%', value: '%' },

        ];
    }
    else if (unit === "pixel") {
        units = [

            { label: 'px', value: 'px' },

        ];
    }

    else {
        units = [
            { label: 'px', value: 'px' },
            { label: '%', value: '%' },
            { label: 'em', value: 'em' },
            { label: 'rem', value: 'rem' },
        ];
    }

    const borderType = [
        { value: "dotted", label: myLanguage.borderDotted },
        { value: "dashed", label: myLanguage.borderDashed },
        { value: "solid", label: myLanguage.borderSolid },
        { value: "double", label: myLanguage.borderDouble },
        { value: "groove", label: myLanguage.borderGroove },
        { value: "ridge", label: myLanguage.borderRidge },
        { value: "inset", label: myLanguage.borderInset },
        { value: "outset", label: myLanguage.borderOutset },
        { value: "hidden", label: myLanguage.borderHidden },
        { value: "none", label: myLanguage.borderNone }
    ];


    const [colorError, setColorError] = useState('');

    function colorCheckCode(value) {
        const hexRegex = /^#[0-9A-F]{6}$/i;
        if (!hexRegex.test(value)) {
            setColorError('Invalid color hex code!');
        } else {
            setColorError('');
        }
    };


    return (
        // <>
        //     <div className='border-input-field'>
        //         <Controller
        //             name={controllerName}
        //             control={control}
        //             defaultValue=""
        //             render={({ field: { onChange, value } }) => (

        //                 <TextField
        //                     label={label}
        //                     id={id}
        //                     value={parseInt(value, 10) || 0}
        //                     onChange={(newValue) => {
        //                         setSaveBar(true)
        //                         onChange(newValue);
        //                     }} />
        //             )} />

        //         <Controller
        //             name={controllerBorderUnitName}
        //             control={control}
        //             defaultValue="px"
        //             render={({ field: { onChange, value } }) => (
        //                 <Select
        //                     options={units}
        //                     onChange={(value) => {
        //                         setSaveBar(true)
        //                         onChange(value);
        //                     }}
        //                     value={value}
        //                 />
        //             )}
        //         />

        //         <Controller
        //             name={controllerBorderName}
        //             control={control}
        //             defaultValue="dotted"
        //             render={({ field: { onChange, value } }) => (
        //                 <Select
        //                     options={borderType}
        //                     onChange={(value) => {
        //                         setSaveBar(true)
        //                         onChange(value);
        //                     }}
        //                     value={value}
        //                 />
        //             )}
        //         />

        //         <Controller
        //             name={controllerBorderColor}
        //             control={control}
        //             defaultValue=""
        //             render={({ field: { onChange, value } }) => (
        //                 <div className='input-field-colorpicker'>
        //                     <TextField
        //                         value={value}
        //                         onChange={(newValue) => {
        //                             setSaveBar(true)
        //                             onChange(newValue);
        //                         }}
        //                     />

        //                     <CustomColourPicker
        //                         changeColor={value}
        //                         defaultColor={value}
        //                         onColorChange={(newValue) => { setSaveBar(true), onChange(newValue) }}
        //                     />
        //                 </div>
        //             )}
        //         />

        //     </div>
        // </>



        <>
            <div className='border-input-field'>
                <Controller
                    name={controllerName}
                    control={control}
                    defaultValue=""
                    render={({ field: { onChange, value } }) => (
                        <div className='wf-range-input'>
                            <TextField
                                label={label}
                                id={id}
                                value={parseInt(value, 10) || 0}
                                onChange={(newValue) => {
                                    setSaveBar(true)
                                    onChange(newValue);
                                }} />
                        </div>
                    )} />

                <Controller
                    name={controllerBorderUnitName}
                    control={control}
                    defaultValue="px"
                    render={({ field: { onChange, value } }) => (
                        <Select
                            options={units}
                            onChange={(value) => {
                                setSaveBar(true)
                                onChange(value);
                            }}
                            value={value}
                        />
                    )}
                />

                <Controller
                    name={controllerBorderName}
                    control={control}
                    defaultValue="dotted"
                    render={({ field: { onChange, value } }) => (
                        <Select
                            options={borderType}
                            onChange={(value) => {
                                setSaveBar(true)
                                onChange(value);
                            }}
                            value={value}
                        />
                    )}
                />

                <Controller
                    name={controllerBorderColor}
                    control={control}
                    defaultValue=""
                    render={({ field: { onChange, value } }) => (
                        <div className='input-field-colorpicker'>
                            <TextField
                                value={value}
                                onChange={(newValue) => {
                                    colorCheckCode(newValue);
                                    setSaveBar(true)
                                    onChange(newValue);
                                }}
                            />

                            <CustomColourPicker
                                changeColor={value}
                                defaultColor={value}
                                onColorChange={(newValue) => { setSaveBar(true), onChange(newValue) }}
                            />
                        </div>
                    )}
                />

            </div>
            <span style={{ color: "red" }}>
                <Text variant="headingXs" as="h6">{colorError}</Text>
            </span>
        </>


    )
}

export default useBorderController