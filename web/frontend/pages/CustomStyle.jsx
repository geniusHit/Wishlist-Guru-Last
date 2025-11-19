import React from 'react';
import { Grid, RangeSlider, Text, TextField, Select, AlphaCard } from '@shopify/polaris';
import BorderController from '../hooks/useBorderController';
import ColorPickerController from '../hooks/useColorPickerController';
import RangeController from '../hooks/useRangeController';
import SingleFieldController from '../hooks/useSingleFieldController'

const CustomStyle = ({ aloneIcon, setSaveBar, control, showCount, formName, myLanguage, showLess, showWidth = false, onlyTextButton }) => {

    const units = [
        { value: "px", label: "px" },
        { value: "%", label: "%" },
        { value: "rem", label: "rem" }
    ];

    // const borderType = [
    //     { value: "dotted", label: myLanguage.borderDotted },
    //     { value: "dashed", label: myLanguage.borderDashed },
    //     { value: "solid", label: myLanguage.borderSolid },
    //     { value: "double", label: myLanguage.borderDouble },
    //     { value: "groove", label: myLanguage.borderGroove },
    //     { value: "ridge", label: myLanguage.borderRidge },
    //     { value: "inset", label: myLanguage.borderInset },
    //     { value: "outset", label: myLanguage.borderOutset },
    //     { value: "hidden", label: myLanguage.borderHidden },
    //     { value: "none", label: myLanguage.borderNone }
    // ];

    const alignType = [{ value: "left", label: myLanguage.left },
    { value: "right", label: myLanguage.right },
    { value: "center", label: myLanguage.center }]

    const selectOptions = [{
        value: "no", label: "no",
    },
    {
        value: "yes", label: "yes"
    }]



    const fontWt = [
        { value: "light", label: myLanguage.lightFw },
        { value: "normal", label: myLanguage.normalFw },
        { value: "semi-bold", label: myLanguage.semiFw },
        { value: "bold", label: myLanguage.boldFw },
        { value: "bolder", label: myLanguage.bolderFw }
    ]




    return (
        <>
            <Grid>

                {showLess === true ? <></> :
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>

                        <div className='endColorPicker'>
                            <AlphaCard>
                                <div className='custom-margin'>
                                    <Text variant="headingMd" as="h3">{myLanguage.buttonSetting}</Text>
                                    <p>{myLanguage.buttonSettingSubHeading}</p>
                                </div>


                                <div className={`${onlyTextButton && 'disableOneByOne'}`}>
                                    <ColorPickerController control={control} controllerName={`${formName}bgColor`} id={`${formName}bgColor`} label={myLanguage.styleBackgroundColor} setSaveBar={setSaveBar} />
                                </div>

                                {showWidth &&
                                    <div className={`${aloneIcon && 'disableOneByOne'}`}>
                                        <RangeController control={control} controllerName={`${formName}widthValue`} id={`${formName}widthValue`} selectControllerName={`${formName}widthUnit`} label={myLanguage.styleWidth} setSaveBar={setSaveBar} unit={"pixel/%/rem"} max={100} />
                                    </div>}

                                <RangeController control={control} controllerName={`${formName}borderRadius`} selectControllerName={`${formName}borderRadiusUnit`} label={myLanguage.styleBorderRadius} max={100} setSaveBar={setSaveBar} unit={"pixel"} />

                                {/* <div className={`${aloneIcon && 'disableOneByOne'}`}> */}
                                <RangeController control={control} controllerName={`${formName}paddingTopBottom`} selectControllerName={`${formName}PaddingTopBottomUnit`} label={myLanguage.paddingTopAndBottom} max={100} setSaveBar={setSaveBar} unit={"pixel"} />

                                <div className={`${aloneIcon && 'disableOneByOne'}`}>
                                    <RangeController control={control} controllerName={`${formName}paddingLeftRight`} selectControllerName={`${formName}paddingLeftRightUnit`} label={myLanguage.paddingLeftRight} max={100} setSaveBar={setSaveBar} unit={"pixel"} />
                                </div>

                                <RangeController control={control} controllerName={`${formName}marginTopBottom`} selectControllerName={`${formName}marginTopBottomUnit`} label={myLanguage.marginTopBottom} max={100} setSaveBar={setSaveBar} unit={"pixel"} />

                                <div className={`${aloneIcon && 'disableOneByOne'}`}>
                                    <RangeController control={control} controllerName={`${formName}marginLeftRight`} selectControllerName={`${formName}marginLeftRightUnit`} label={myLanguage.marginLeftRight} max={100} setSaveBar={setSaveBar} unit={"pixel"} />
                                </div>

                                {/* </div> */}

                                <div className={`${onlyTextButton && 'disableOneByOne'}`}>
                                    <BorderController control={control} controllerName={`${formName}borderInput`} id={`${formName}borderInput`} controllerBorderUnitName={`${formName}borderInputUnit`} label={myLanguage.styleBorder} controllerBorderName={`${formName}borderType`} controllerBorderColor={`${formName}borderColor`} setSaveBar={setSaveBar} unit={"pixel"} myLanguage={myLanguage} />
                                </div>

                            </AlphaCard>
                        </div>
                    </Grid.Cell>}


                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>
                    <div className='endColorPicker'>
                        <AlphaCard>
                            <div className='custom-margin'>
                                <Text variant="headingMd" as="h3">{myLanguage.textSetting}</Text>
                                <p>{myLanguage.textSettingSubHeading}</p>
                            </div>
                            <ColorPickerController control={control} controllerName={`${formName}textColor`} id={`${formName}textColor`} label={myLanguage.styleTextColor} setSaveBar={setSaveBar} />
                            <div className={`${aloneIcon && 'disableOneByOne'}`}>
                                <RangeController control={control} controllerName={`${formName}fontSize`} id={`${formName}fontSize`} selectControllerName={`${formName}fontSizeUnit`} label={myLanguage.styleFontSize} setSaveBar={setSaveBar} />
                            </div>

                            <div className={`${aloneIcon && 'disableOneByOne'} `}>
                                <SingleFieldController name={`${formName}fontFamily`} control={control}  >
                                    {({ field }) => (<TextField className='input-field-css' label={myLanguage.styleFontFamily} id='fontFamily' value={field.value} onChange={(newValue) => {
                                        setSaveBar(true);
                                        field.onChange(newValue);
                                    }} />)}
                                </SingleFieldController>
                            </div>





                            {/* ----------------font weight for button----------- */}

                            {/* {showLess === true ? <></> :
                                <div className={`${aloneIcon && 'disableOneByOne'} `}>
                                    <SingleFieldController name={`${formName}fontWeight`} control={control}  >
                                        {({ field }) => (<TextField className='input-field-css' label={myLanguage.fontWeight} id='fontWeight' value={field.value} onChange={(newValue) => {
                                            setSaveBar(true);
                                            field.onChange(newValue);
                                        }} />)}
                                    </SingleFieldController>
                                </div>} */}


                            {showLess === true ? <></> :
                                <SingleFieldController
                                    name={`${formName}fontWeight`}
                                    control={control}
                                    defaultValue="semi-bold"
                                >
                                    {({ field }) => (
                                        <Select
                                            label={myLanguage.fontWeight}
                                            options={fontWt}
                                            onChange={(fieldvalue) => {
                                                setSaveBar(true);
                                                field.onChange(fieldvalue);
                                            }}
                                            value={field.value}
                                        />
                                    )}
                                </SingleFieldController>}






                            {showLess === true ? <></> :

                                <div className={`border-input-field border-input-field-full `}>
                                    <SingleFieldController name={`${formName}textAlign`} control={control} defaultValue="left" >
                                        {({ field }) => (<Select
                                            label={myLanguage.styleTextAlign}
                                            options={alignType}
                                            onChange={(fieldvalue) => {
                                                setSaveBar(true);
                                                field.onChange(fieldvalue);
                                            }}
                                            value={field.value}
                                        />)}
                                    </SingleFieldController></div>}

                        </AlphaCard>
                    </div>
                </Grid.Cell>


                {formName === "" && <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>
                    <div className='endColorPicker'>
                        <AlphaCard>
                            <div className='custom-margin'>
                                <Text variant="headingMd" as="h3">{myLanguage.iconSetting}</Text>
                                <p>{myLanguage.iconSettingSubHeading}</p>
                            </div>
                            <div className='border-input-field border-input-field-full'>
                                <ColorPickerController control={control} controllerName={`${formName}iconColor`} id={`${formName}iconColor`} label={myLanguage.iconColor} setSaveBar={setSaveBar} />
                            </div>
                            <div className="border-input-field border-input-field-full">
                                <SingleFieldController name={`${formName}iconSize`} control={control} defaultValue={"small"} >
                                    {({ field }) => (<Select
                                        options={[
                                            { label: myLanguage.small, value: 'small' },
                                            { label: myLanguage.medium, value: 'medium' },
                                            { label: myLanguage.large, value: 'large' },

                                        ]}
                                        value={field.value || "small"}
                                        label={myLanguage.iconSize}
                                        onChange={(newValue) => {
                                            setSaveBar(true);
                                            field.onChange(newValue);
                                        }}
                                    />)}
                                </SingleFieldController>
                            </div>
                            <div className="border-input-field border-input-field-full">
                                <SingleFieldController name={`${formName}iconPosition`} control={control} defaultValue={"small"} >
                                    {({ field }) => (<Select
                                        options={[
                                            { label: myLanguage.left, value: 'left' },
                                            { label: myLanguage.right, value: 'right' },

                                        ]}
                                        value={field.value || "left"}
                                        label={myLanguage.iconPosition}
                                        onChange={(newValue) => {
                                            setSaveBar(true);
                                            field.onChange(newValue);
                                        }}
                                    />)}
                                </SingleFieldController>
                            </div>
                        </AlphaCard>
                    </div>
                </Grid.Cell >}
            </Grid >
        </>
    )
}

export default CustomStyle;