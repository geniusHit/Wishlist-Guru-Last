import { Text, TextField } from '@shopify/polaris';
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import CustomColourPicker from '../pages/CustomColourPicker';


const ColorPickerController = ({ controllerName, control, id, label, setSaveBar }) => {

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
        <>
            <Controller
                name={controllerName}
                control={control}
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                    <>
                        <div className='wf-wishlist-range-box'>
                            <TextField
                                id={id}
                                label={label}
                                value={value} onChange={(newValue) => {
                                    colorCheckCode(newValue);
                                    setSaveBar(true)
                                    onChange(newValue);
                                }} />

                            <CustomColourPicker
                                changeColor={value}
                                defaultColor={value}
                                onColorChange={(newValue) => { onChange(newValue), setSaveBar(true) }}
                            />
                            <span style={{ color: "red" }}>
                                <Text variant="headingXs" as="h6">{colorError}</Text>
                            </span>
                        </div>
                    </>
                )
                }
            />
        </>
    )
}

export default ColorPickerController