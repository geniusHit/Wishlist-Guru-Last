import React from 'react';
import { Text, TextField, Select, AlphaCard } from '@shopify/polaris';
import BorderController from '../../hooks/useBorderController';
import ColorPickerController from '../../hooks/useColorPickerController';
import RangeController from '../../hooks/useRangeController';
import SingleFieldController from '../../hooks/useSingleFieldController'

const CustomSettingStyle = ({ showDiv, setSaveBar, control, myLanguage, hideWidth }) => {

    const alignType = [
        { value: "left", label: myLanguage.left },
        { value: "right", label: myLanguage.right },
        { value: "center", label: myLanguage.center }
    ]

    return (
        <>
            {!showDiv &&
                <AlphaCard>
                    <div className='custom-margin'>
                        <Text variant="headingMd" as="h2">{myLanguage.notificationButtonSetting}</Text>
                        <p>{myLanguage.notificationButtonSettingSubHeading}</p>
                    </div>
                    <ColorPickerController
                        control={control}
                        controllerName={`bgColor`}
                        id={`bgColor`}
                        label={myLanguage.styleBackgroundColor}
                        setSaveBar={setSaveBar}
                    />
                    {hideWidth ? <></> :
                        <RangeController
                            control={control}
                            controllerName={`widthValue`}
                            id={`widthValue`}
                            selectControllerName={`widthUnit`}
                            label={myLanguage.styleWidth}
                            setSaveBar={setSaveBar}
                            unit={"percent"}
                        />}
                    <RangeController
                        control={control}
                        controllerName={`borderRadius`}
                        selectControllerName={`borderRadiusUnit`}
                        label={myLanguage.styleBorderRadius}
                        max={100}
                        setSaveBar={setSaveBar}
                        unit={"pixel"}
                    />
                    <RangeController
                        control={control}
                        controllerName={`paddingTopBottom`}
                        selectControllerName={`paddingTopBottomUnit`}
                        label={myLanguage.paddingTopAndBottom}
                        max={1000} setSaveBar={setSaveBar}
                        unit={"pixel"}
                    />
                    <RangeController
                        control={control}
                        controllerName={`paddingLeftRight`}
                        selectControllerName={`paddingLeftRightUnit`}
                        label={myLanguage.paddingLeftRight}
                        max={1000}
                        setSaveBar={setSaveBar} unit={"pixel"}
                    />
                    <RangeController control={control}
                        controllerName={`marginTopBottom`}
                        selectControllerName={`marginTopBottomUnit`}
                        label={myLanguage.marginTopBottom}
                        max={100}
                        setSaveBar={setSaveBar}
                        unit={"pixel"}
                    />
                    <RangeController
                        control={control}
                        controllerName={`marginLeftRight`}
                        selectControllerName={`marginLeftRightUnit`}
                        label={myLanguage.marginLeftRight}
                        max={100}
                        setSaveBar={setSaveBar}
                        unit={"pixel"}
                    />
                    <BorderController
                        control={control}
                        controllerName={`borderInput`}
                        id={`borderInput`}
                        controllerBorderUnitName={`borderInputUnit`}
                        label={myLanguage.styleBorder}
                        controllerBorderName={`borderType`}
                        controllerBorderColor={`notificationBorderColor`}
                        setSaveBar={setSaveBar}
                        units={"pixel"}
                        myLanguage={myLanguage}
                    />
                </AlphaCard>
            }

            <AlphaCard>
                <div className='custom-margin'>
                    <Text variant="headingMd" as="h2">{myLanguage.notificationTextSetting}</Text>
                    <p>{myLanguage.notificationTextSettingSubHeading}</p>
                </div>
                <RangeController
                    control={control}
                    controllerName={`fontSize`}
                    id={`fontSize`}
                    selectControllerName={`fontSizeUnit`}
                    label={myLanguage.styleFontSize}
                    setSaveBar={setSaveBar}
                />
                <ColorPickerController
                    control={control}
                    controllerName={`textColor`}
                    id={`textColor`}
                    label={myLanguage.styleTextColor}
                    setSaveBar={setSaveBar}
                />
                <div className='custom-margin' >
                    <SingleFieldController
                        name={`fontFamily`}
                        control={control}
                    >
                        {({ field }) => (
                            <TextField
                                label={myLanguage.styleFontFamily}
                                id='fontFamily'
                                value={field.value}
                                onChange={(newValue) => {
                                    setSaveBar(true);
                                    field.onChange(newValue);
                                }}
                            />
                        )}
                    </SingleFieldController>
                </div>
                <SingleFieldController
                    name={`textAlign`}
                    control={control}
                    defaultValue="left"
                >
                    {({ field }) => (
                        <Select
                            label={myLanguage.styleTextAlign}
                            options={alignType}
                            onChange={(fieldvalue) => {
                                setSaveBar(true);
                                field.onChange(fieldvalue);
                            }}
                            value={field.value}
                        />
                    )}
                </SingleFieldController>
            </AlphaCard>
        </>
    )
}

export default CustomSettingStyle;