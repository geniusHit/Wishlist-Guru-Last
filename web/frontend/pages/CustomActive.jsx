import React, { useState } from 'react';
import { Text, Collapsible, Select, TextField, AlphaCard, Grid, RangeSlider } from '@shopify/polaris';
import BorderController from '../hooks/useBorderController';
import ColorPickerController from '../hooks/useColorPickerController';
import RangeController from '../hooks/useRangeController';

const CustomActive = ({ aloneIcon, control, setSaveBar, watchAllFields, myLanguage, formName, onlyTextButton }) => {


    const units = [
        { value: "px", label: "px" },
        { value: "pt", label: "pt" },
        { value: "em", label: "em" }
    ];

    const datas = [
        { value: "dotted", label: "Dotted" },
        { value: "dashed", label: "Dashed" },
        { value: "solid", label: "Solid" },
        { value: "double", label: "Double" },
        { value: "groove", label: "Groove" },
        { value: "ridge", label: "Ridge" },
        { value: "inset", label: "Inset" },
        { value: "outset", label: "Outset" },
        { value: "hidden", label: "Hidden" },
        { value: "none", label: "None" }
    ];
    return (
        <>
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                    <div className='endColorPicker'>
                        <AlphaCard>
                            <div className='custom-margin'>
                                <Text variant="headingMd" as="h3">{myLanguage.buttonSetting}</Text>
                                <p>{myLanguage.buttonSettingSubHeading}</p>
                            </div>
                            <div className={`${onlyTextButton && 'disableOneByOne'}`}>
                                <ColorPickerController control={control} controllerName={`${formName}bgColor`} id={`${formName}bgColor`} label={myLanguage.styleBackgroundColor} setSaveBar={setSaveBar} />
                                <BorderController control={control} controllerName={`${formName}borderInput`} id={`${formName}borderInput`} controllerBorderUnitName={`${formName}borderInputUnit`} label={myLanguage.styleBorder} controllerBorderName={`${formName}borderType`} controllerBorderColor={`${formName}borderColor`} setSaveBar={setSaveBar} units={"pixel"} myLanguage={myLanguage} />
                            </div>
                        </AlphaCard>
                    </div>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                    <div className='endColorPicker'>
                        <AlphaCard>
                            <div className={`${aloneIcon && 'disableOneByOne'}`}>
                                {/* <RangeController control={control} controllerName={`${formName}fontSize`} id={`${formName}fontSize`} selectControllerName={`${formName}fontSizeUnit`} label={myLanguage.styleFontSize} setSaveBar={setSaveBar} max={100} /> */}
                                <div className='custom-margin'>
                                    <Text variant="headingMd" as="h3">{myLanguage.textSetting}</Text>
                                    <p>{myLanguage.textSettingSubHeading}</p>
                                </div>

                                <ColorPickerController control={control} controllerName={`${formName}textColor`} id={`${formName}textColor`} label={myLanguage.styleTextColor} setSaveBar={setSaveBar} />
                            </div>
                        </AlphaCard>
                    </div>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                    <div className='endColorPicker'>
                        <AlphaCard>

                            <div className='custom-margin'>
                                <Text variant="headingMd" as="h3">{myLanguage.iconSetting}</Text>
                                <p>{myLanguage.iconSettingSubHeading}</p>
                            </div>

                            <ColorPickerController control={control} controllerName={`${formName}iconColor`} id={`${formName}iconColor`} label={myLanguage.iconColor} setSaveBar={setSaveBar} />

                        </AlphaCard>
                    </div>
                </Grid.Cell>
            </Grid>
        </>
    )
}

export default CustomActive