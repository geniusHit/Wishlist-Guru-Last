import { Grid, Text, Select, TextField } from '@shopify/polaris';
import React from 'react';
import ColorPickerController from '../../hooks/useColorPickerController'
import RangeController from '../../hooks/useRangeController'
import SingleFieldController from '../../hooks/useSingleFieldController'



const WishlistUiBasic = ({ myLanguage, control, watchAllFields, setSaveBar, currentPlan }) => {
    const alignType = [
        { value: "left", label: myLanguage.left },
        { value: "right", label: myLanguage.right },
        { value: "center", label: myLanguage.center },
    ]

    const fontWt = [
        { value: "light", label: myLanguage.lightFw },
        { value: "normal", label: myLanguage.normalFw },
        { value: "semi-bold", label: myLanguage.semiFw },
        { value: "bold", label: myLanguage.boldFw },
        { value: "bolder", label: myLanguage.bolderFw }
    ]

    return (
        <>
            <div className='custom-margin'>
                <Text variant="headingMd" as="h2"> {myLanguage.wishlistUIStyleHeading}</Text>
                <p>{myLanguage.wishlistUIStyleText}</p>
            </div>
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                    <ColorPickerController
                        control={control}
                        controllerName={`wlBgColor`}
                        id={`bgColor1`}
                        label={myLanguage.styleBackgroundColor}
                        setSaveBar={setSaveBar}
                    />

                    <ColorPickerController
                        control={control}
                        controllerName={`wlTextColor`}
                        id={`textColor1`}
                        label={myLanguage.wishlistUIStyleTextColor}
                        setSaveBar={setSaveBar}
                    />


                    <SingleFieldController
                        name={"wlTextAlign"}
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


                    <div className={`${currentPlan < 2 && 'disableOneByOne'}`}>
                        <SingleFieldController name='wlHeadingFontFamily' control={control}  >
                            {({ field }) => (<TextField className='input-field-css' label={myLanguage.headingFontFamily} id='fontFamily' value={field.value} onChange={(newValue) => {
                                setSaveBar(true);
                                field.onChange(newValue);
                            }} />)}
                        </SingleFieldController>

                        <SingleFieldController
                            name={"wlHeadingFontWt"}
                            control={control}
                            defaultValue="semi-bold"
                        >
                            {({ field }) => (
                                <Select
                                    label={myLanguage.headingFontWt}
                                    options={fontWt}
                                    onChange={(fieldvalue) => {
                                        setSaveBar(true);
                                        field.onChange(fieldvalue);
                                    }}
                                    value={field.value}
                                />
                            )}
                        </SingleFieldController>
                    </div>
                </Grid.Cell>

                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                    <div className={`${watchAllFields.wishlistDisplay === "modal" ? '' : 'not-allowed-class'}`}>
                        <div className={`wishlist-location-style ${watchAllFields.wishlistDisplay === "modal" ? '' : 'disable-block77'}`} >
                            <RangeController
                                control={control}
                                controllerName={`wlWidthInput`}
                                id={`wlWidthInput`}
                                selectControllerName={`wlWidthUnit`}
                                label={myLanguage.wishlistUIStyleWidth}
                                setSaveBar={setSaveBar}
                            />
                        </div>
                    </div>

                    <RangeController
                        control={control}
                        controllerName={`wlPaddingTopBottom`}
                        selectControllerName={`wlPaddingTopBottomUnit`}
                        label={myLanguage.paddingTopAndBottom}
                        max={1000}
                        setSaveBar={setSaveBar}
                        unit={"pixel"}
                    />

                    <RangeController
                        control={control}
                        controllerName={`wlPaddingLeftRight`}
                        selectControllerName={`wlPaddingLeftRightUnit`}
                        label={myLanguage.paddingLeftRight}
                        max={1000}
                        setSaveBar={setSaveBar}
                        unit={"pixel"}
                    />

                    <ColorPickerController
                        control={control}
                        controllerName={`wlCrossColor`}
                        id={`crossColor`}
                        label={myLanguage.wishlistUIStyleCrossColor}
                        setSaveBar={setSaveBar}
                    />

                    <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                        <SingleFieldController name='wlTextFontFamily' control={control}  >
                            {({ field }) => (<TextField className='input-field-css' label={myLanguage.textFontFamily} id='fontFamily' value={field.value} onChange={(newValue) => {
                                setSaveBar(true);
                                field.onChange(newValue);
                            }} />)}
                        </SingleFieldController>

                        <SingleFieldController
                            name={"wlTextFontWt"}
                            control={control}
                            defaultValue="normal"
                        >
                            {({ field }) => (
                                <Select
                                    label={myLanguage.textFontWt}
                                    options={fontWt}
                                    onChange={(fieldvalue) => {
                                        setSaveBar(true);
                                        field.onChange(fieldvalue);
                                    }}
                                    value={field.value}
                                />
                            )}
                        </SingleFieldController>
                    </div>
                </Grid.Cell>
            </Grid>
        </>
    )
}

export default WishlistUiBasic;