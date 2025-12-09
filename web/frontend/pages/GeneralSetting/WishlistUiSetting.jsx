import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import useAppMetafield from '../../hooks/useAppMetafield';
import useUtilityFunction from '../../hooks/useUtilityFunction';
import { Controller, useForm } from 'react-hook-form';
import SkeletonPage1 from '../SkeletonPage1';
import { Frame, Page, RadioButton, Text, LegacyCard, Tabs, Select, Checkbox, TextField, Grid, AlphaCard } from '@shopify/polaris';
import SaveBar from '../SaveBar';
import Swal from 'sweetalert2';
import loaderGif from "../loaderGreen.gif";
import SingleFieldController from '../../hooks/useSingleFieldController';
import WishlistBasic from './WishlistUiCss';
import CustomStyle from '../CustomStyle';
import CustomHoverSetting from '../CustomHoverSetting';
import CssFilterConverter from "css-filter-converter";
import Footer from '../Footer';
import ColorPickerController from '../../hooks/useColorPickerController';
import RangeController from '../../hooks/useRangeController';
import BorderController from '../../hooks/useBorderController';
import CustomStyle2 from '../CustomStyle2';
import CustomHoverSetting2 from '../CustomHoverSetting2';
import Toggle from 'react-toggle';

const WishlistUiSetting = () => {

    let cartButtoniconColorHover;

    const { handleSubmit, watch, control, reset, formState: { errors } } = useForm();
    const appMetafield = useAppMetafield();
    const [saveBar, setSaveBar] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const utilityFunction = useUtilityFunction();
    const [currentPlan, setCurrentPlan] = useState(0);
    const existingData = useRef([]);
    const existingButtonSettingData = useRef([]);

    const watchAllFields = watch();
    const [myLanguage, setMyLanguage] = useState({});
    const [shareModalBtn, setShareModalBtn] = useState(0);
    const [cartBtn, setCartBtn] = useState(0);
    const [viewBtn, setViewBtn] = useState(0);
    const [isHeaderIconTrue, setIsHeaderIconTrue] = useState(false);
    let generalData = null;


    useEffect(() => {
        useEffectLite();
    }, []);

    async function useEffectLite() {
        const getCurrentPlan = await appMetafield.getCurrentPlan();
        setCurrentPlan(parseInt(getCurrentPlan.currentPlan));
        await utilityFunction.getPlanFirst();
        await utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
        });
        getAllAppDataMetafields();
    }






    const alignType = [
        { value: "left", label: myLanguage.left },
        { value: "right", label: myLanguage.right },
        { value: "center", label: myLanguage.center },
    ]

    const imageOption = [
        { value: "default", label: myLanguage.wmsImageDefault },
        { value: "image-fit-to-content", label: myLanguage.wmsImageFitToGrid },
    ]


    async function getAllAppDataMetafields() {
        const dataArray = await appMetafield.getAllAppMetafields();

        let buttonData = null;

        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "general-setting") {
                utilityFunction.goToSectionFxn();
                let checkElement = document.querySelector(".dontRunAgain");
                if (checkElement === null) {
                    utilityFunction.upgradeButtonFxn();
                }
                let dData = JSON.parse(dataArray[i].node.value);
                generalData = dData;
                existingData.current = dData;
                setIsLoading(true);
            }

            if (dataArray[i].node.key === "wishlist-button-setting") {
                let dData = JSON.parse(dataArray[i].node.value);
                buttonData = dData;
                existingButtonSettingData.current = dData;
            }

        }




        // console.log("buttonData = ", buttonData)
        // console.log("generalData = ", generalData)

        {/* Style for Modal buttons start*/ }
        setIsHeaderIconTrue(generalData?.isModalSettingsOn === "yes" ? true : false)
        {/* Style for Modal buttons end*/ }


        if (generalData) {
            // merge both and reset
            reset({
                wishlistDisplay: generalData.wishlistDisplay,
                wlBgColor: generalData.wlBgColor,
                wlTextColor: generalData?.wlTextColor?.color ? generalData?.wlTextColor?.color : generalData.wlTextColor,
                wlCrossColor: generalData.wlCrossColor,
                wlTextAlign: generalData.wlTextAlign,
                wlWidthInput: generalData.wlWidthInput,
                wlWidthUnit: generalData.wlWidthUnit,
                wlPaddingTopBottom: generalData.wlPaddingTopBottom,
                wlPaddingTopBottomUnit: generalData.wlPaddingTopBottomUnit,
                wlPaddingLeftRight: generalData.wlPaddingLeftRight,
                wlPaddingLeftRightUnit: generalData.wlPaddingLeftRightUnit,
                wishlistUiCheck: generalData.wishlistUiCheck,
                shareWishBtnfontFamily: generalData.shareWishBtnfontFamily,
                shareWishBtnfontSize: generalData.shareWishBtnfontSize,
                shareWishBtntextColor: generalData.shareWishBtntextColor,
                shareWishBtnfontSizeUnit: generalData.shareWishBtnfontSizeUnit,
                shareWishBtnhoverTextColor: generalData.shareWishBtnhoverTextColor,
                hideViewAs: generalData.hideViewAs,
                hideGrid: generalData.hideGrid,
                hideSearch: generalData.hideSearch,
                // hideFilter: generalData.hideFilter,
                wlHeadingFontFamily: generalData.wlHeadingFontFamily,
                wlHeadingFontWt: generalData.wlHeadingFontWt,
                wlTextFontFamily: generalData.wlTextFontFamily,
                wlTextFontWt: generalData.wlTextFontWt,
                continueShoppingLink: generalData.continueShoppingLink,
                hideLoginText: generalData?.hideLoginText,
                gridAlignment: generalData?.gridAlignment,
                gridBorderRadius: generalData?.gridBorderRadius || "0",
                gridBgColor: generalData?.gridBgColor || "#FFFFFF",
                gridGap: generalData?.gridGap || "5",
                gridImageView: generalData?.gridImageView,
                gridBorderInput: generalData?.gridBorderInput || "1",
                gridBorderType: generalData?.gridBorderType || "solid",
                gridBorderColor: generalData?.gridBorderColor || "#291f1f1f",
                showProductOption: generalData?.showProductOption || "yes",
                downloadCsv: generalData?.downloadCsv || "no",
                modalLayerBgColor: generalData?.modalLayerBgColor || generalData.wlBgColor,
                modalBottomButtonBgColor: generalData?.modalBottomButtonBgColor || generalData.wlBgColor,
                mwCheckIconBg: generalData?.mwCheckIconBg || "",
                mwCheckIconColor: generalData?.mwCheckIconColor || "",
                /* Style for Modal buttons start*/
                modalBottomButtonBgColor: generalData?.modalBottomButtonBgColor,
                modalButtonPaddingTopBottomUnit: generalData?.modalButtonPaddingTopBottomUnit,
                modalButtonbgColor: generalData?.modalButtonbgColor,
                modalButtonborderColor: generalData?.modalButtonborderColor,
                modalButtonborderInput: generalData?.modalButtonborderInput,
                modalButtonborderInputUnit: generalData?.modalButtonborderInputUnit,
                modalButtonborderRadius: generalData?.modalButtonborderRadius,
                modalButtonborderRadiusUnit: generalData?.modalButtonborderRadiusUnit,
                modalButtonborderType: generalData?.modalButtonborderType,
                modalButtonfontFamily: generalData?.modalButtonfontFamily,
                modalButtonfontSize: generalData?.modalButtonfontSize,
                modalButtonfontSizeUnit: generalData?.modalButtonfontSizeUnit,
                modalButtonfontWeight: generalData?.modalButtonfontWeight,
                modalButtonmarginLeftRight: generalData?.modalButtonmarginLeftRight,
                modalButtonmarginLeftRightUnit: generalData?.modalButtonmarginLeftRightUnit,
                modalButtonmarginTopBottom: generalData?.modalButtonmarginTopBottom,
                modalButtonmarginTopBottomUnit: generalData?.modalButtonmarginTopBottomUnit,
                modalButtonpaddingLeftRight: generalData?.modalButtonpaddingLeftRight,
                modalButtonpaddingLeftRightUnit: generalData?.modalButtonpaddingLeftRightUnit,
                modalButtonpaddingTopBottom: generalData?.modalButtonpaddingTopBottom,
                modalButtontextAlign: generalData?.modalButtontextAlign,
                modalButtontextColor: generalData?.modalButtontextColor,
                modalLayerBgColor: generalData?.modalLayerBgColor,
                modalButtonhoverBgColor: generalData?.modalButtonhoverBgColor,
                modalButtonhoverBorderColor: generalData?.modalButtonhoverBorderColor,
                modalButtonhoverBorderInput: generalData?.modalButtonhoverBorderInput,
                modalButtonhoverBorderInputUnit: generalData?.modalButtonhoverBorderInputUnit,
                modalButtonhoverBorderType: generalData?.modalButtonhoverBorderType,
                modalButtonhoverTextColor: generalData?.modalButtonhoverTextColor,
                /* Style for Modal buttons end*/


                ...(buttonData && {
                    cartButtonbgColor: buttonData.cartButtonStyle.bgColor,
                    cartButtonborderInput: buttonData.cartButtonStyle.border.value,
                    cartButtonborderInputUnit: buttonData.cartButtonStyle.border.unit,
                    cartButtonborderRadius: buttonData.cartButtonStyle.borderRadius.value,
                    cartButtonborderRadiusUnit: buttonData.cartButtonStyle.borderRadius.unit,
                    cartButtonborderType: buttonData.cartButtonStyle.border.type,
                    cartButtonborderColor: buttonData.cartButtonStyle.border.color,
                    cartButtonfontFamily: buttonData.cartButtonStyle.fontFamily,
                    cartButtonfontWeight: buttonData.cartButtonStyle.fontWeight,
                    cartButtonfontSize: buttonData.cartButtonStyle.fontSize.value,
                    cartButtontextColor: buttonData.cartButtonStyle.textColor,
                    cartButtonfontSizeUnit: buttonData.cartButtonStyle.fontSize.unit,
                    cartButtonnborderColor: buttonData.cartButtonStyle.border.color,
                    cartButtonhover: buttonData.cartButtonStyle.hover.hoverValue,
                    cartButtonhoverBgColor: buttonData.cartButtonStyle.hover.bgColor,
                    cartButtonhoverBorderColor: buttonData.cartButtonStyle.hover.border.color,
                    cartButtonhoverBorderInput: buttonData.cartButtonStyle.hover.border.value,
                    cartButtonhoverBorderInputUnit: buttonData.cartButtonStyle.hover.border.unit,
                    cartButtonhoverBorderType: buttonData.cartButtonStyle.hover.border.type,
                    cartButtonhoverTextColor: buttonData.cartButtonStyle.hover.textColor,
                    cartButtonhoverFontSize: buttonData.cartButtonStyle.hover.fontSize.value,
                    cartButtonhoverFontSizeUnit: buttonData.cartButtonStyle.hover.fontSize.unit,
                    cartButtonmarginLeftRight: buttonData.cartButtonStyle.marginLeftRight.value,
                    cartButtonmarginLeftRightUnit: buttonData.cartButtonStyle.marginLeftRight.unit,
                    cartButtonmarginTopBottom: buttonData.cartButtonStyle.marginTopBottom.value,
                    cartButtonmarginTopBottomUnit: buttonData.cartButtonStyle.marginTopBottom.unit,
                    cartButtonpaddingLeftRight: buttonData.cartButtonStyle.paddingLeftRight.value,
                    cartButtonpaddingLeftRightUnit: buttonData.cartButtonStyle.paddingLeftRight.unit,
                    cartButtonpaddingTopBottom: buttonData.cartButtonStyle.paddingTopBottom.value,
                    cartButtonpaddingTopBottomUnit: buttonData.cartButtonStyle.paddingTopBottom.unit,
                    cartButtontextAlign: buttonData.cartButtonStyle.textAlign,
                    cartButtoniconSize: buttonData.cartButtonStyle.iconSize,
                    cartButtoniconPosition: buttonData.cartButtonStyle.iconPosition,

                    iconColor: convertColor(watchAllFields.iconColor),
                }),
            })
        }
    }

    {/* Style for Modal buttons start*/ }
    async function handleChangeHeaderIcon(e) {
        setIsHeaderIconTrue(e.target.checked);
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        let dataUpdate = { ...generalData, isModalSettingsOn: e.target.checked === true ? "yes" : "no" }
        const getAppMetafieldId = await appMetafield.getAppMetafieldId();
        const saveIconLocation = {
            key: "general-setting",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: JSON.stringify(dataUpdate)
        }
        appMetafield.createAppMetafield(saveIconLocation).then(() => {
            Swal.close();
        });
    }
    /* Style for Modal buttons end*/

    const convertColor = (color) => {
        if (/^#[0-9A-F]{3}$/i.test(color)) {
            color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
        }
        if (/^#[0-9A-F]{6}$/i.test(color)) {
            return CssFilterConverter.hexToFilter(color);
        } else if (/^rgb\(\d+,\s*\d+,\s*\d+\)$/i.test(color)) {
            return CssFilterConverter.hexToFilter(color);
        } else {
            return CssFilterConverter.keywordToFilter(color);
        }
    };

    useMemo(() => {
        // iconColor = convertColor(watchAllFields.iconColor);
        // iconColorHover = convertColor(watchAllFields.hovericonColor);
        // cartButtoniconColor = convertColor(watchAllFields.cartButtoniconColor);
        cartButtoniconColorHover = convertColor(watchAllFields.cartButtonhovericonColor);
        // activeBtniconColor = convertColor(watchAllFields.activeBtniconColor);
        // iconSizeValue = calculateSizeValue(watchAllFields.iconSize);
        // carticonSizeValue = calculateSizeValue(watchAllFields.cartButtoniconSize, watchAllFields.cartButtonfontSize);

    }, [watchAllFields]);

    const saveToMetafield = async (data) => {
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        console.log("data = ", data)
        console.log("watch() = ", watch())

        const textColor = convertColor(watchAllFields.wlTextColor);
        let mergedData = { ...existingData.current };
        mergedData.wishlistDisplay = data.wishlistDisplay;
        mergedData.wlBgColor = data.wlBgColor;
        mergedData.wlTextColor = { filterColor: textColor.color, color: data.wlTextColor };
        mergedData.wlCrossColor = data.wlCrossColor
        mergedData.wlCrossFilter = (await CssFilterConverter.hexToFilter(data.wlCrossColor)).color;
        mergedData.wlTextAlign = data.wlTextAlign;
        mergedData.wlWidthInput = data.wlWidthInput;
        mergedData.wlWidthUnit = data.wlWidthUnit;
        mergedData.wlPaddingTopBottom = data.wlPaddingTopBottom;
        mergedData.wlPaddingTopBottomUnit = data.wlPaddingTopBottomUnit;
        mergedData.wlPaddingLeftRight = data.wlPaddingLeftRight;
        mergedData.wlPaddingLeftRightUnit = data.wlPaddingLeftRightUnit;
        mergedData.wishlistUiCheck = true;
        mergedData.shareWishBtnfontFamily = data.shareWishBtnfontFamily;
        mergedData.shareWishBtnfontSize = data.shareWishBtnfontSize;
        mergedData.shareWishBtntextColor = data.shareWishBtntextColor;
        mergedData.shareWishBtnfontSizeUnit = data.shareWishBtnfontSizeUnit;
        mergedData.shareWishBtnhoverTextColor = data.shareWishBtnhoverTextColor;
        mergedData.shareBtnIconColor = (await CssFilterConverter.hexToFilter(data.shareWishBtntextColor)).color;
        mergedData.shareBtnIconHoverColor = (await CssFilterConverter.hexToFilter(data.shareWishBtnhoverTextColor)).color;
        mergedData.hideViewAs = data.hideViewAs;
        mergedData.hideGrid = data.hideGrid;
        mergedData.hideSearch = data.hideSearch;
        // mergedData.hideFilter = data?.hideFilter;
        mergedData.wlHeadingFontFamily = data.wlHeadingFontFamily;
        mergedData.wlHeadingFontWt = data.wlHeadingFontWt;
        mergedData.wlTextFontFamily = data.wlTextFontFamily;
        mergedData.wlTextFontWt = data.wlTextFontWt;
        mergedData.continueShoppingLink = data.continueShoppingLink;
        mergedData.hideLoginText = data?.hideLoginText;
        mergedData.gridAlignment = data?.gridAlignment;
        mergedData.gridBorderRadius = data?.gridBorderRadius;
        mergedData.gridBgColor = data?.gridBgColor;
        mergedData.gridGap = data?.gridGap;
        mergedData.gridImageView = data?.gridImageView;
        mergedData.gridBorderInput = data?.gridBorderInput;
        mergedData.gridBorderType = data?.gridBorderType;
        mergedData.gridBorderColor = data?.gridBorderColor;
        mergedData.showProductOption = data?.showProductOption;
        mergedData.downloadCsv = data?.downloadCsv;
        mergedData.modalLayerBgColor = data?.modalLayerBgColor;
        mergedData.modalBottomButtonBgColor = data?.modalBottomButtonBgColor;
        mergedData.mwCheckIconBg = data?.mwCheckIconBg;
        mergedData.mwCheckIconColor = data?.mwCheckIconColor;

        {/* Style for Modal buttons start*/ }
        mergedData.modalBottomButtonBgColor = data?.modalBottomButtonBgColor;
        mergedData.modalButtonPaddingTopBottomUnit = data?.modalButtonPaddingTopBottomUnit;
        mergedData.modalButtonbgColor = data?.modalButtonbgColor;
        mergedData.modalButtonborderColor = data?.modalButtonborderColor;
        mergedData.modalButtonborderInput = data?.modalButtonborderInput;
        mergedData.modalButtonborderInputUnit = data?.modalButtonborderInputUnit;
        mergedData.modalButtonborderRadius = data?.modalButtonborderRadius;
        mergedData.modalButtonborderRadiusUnit = data?.modalButtonborderRadiusUnit;
        mergedData.modalButtonborderType = data?.modalButtonborderType;
        mergedData.modalButtonfontFamily = data?.modalButtonfontFamily;
        mergedData.modalButtonfontSize = data?.modalButtonfontSize;
        mergedData.modalButtonfontSizeUnit = data?.modalButtonfontSizeUnit;
        mergedData.modalButtonfontWeight = data?.modalButtonfontWeight;
        mergedData.modalButtonmarginLeftRight = data?.modalButtonmarginLeftRight;
        mergedData.modalButtonmarginLeftRightUnit = data?.modalButtonmarginLeftRightUnit;
        mergedData.modalButtonmarginTopBottom = data?.modalButtonmarginTopBottom;
        mergedData.modalButtonmarginTopBottomUnit = data?.modalButtonmarginTopBottomUnit;
        mergedData.modalButtonpaddingLeftRight = data?.modalButtonpaddingLeftRight;
        mergedData.modalButtonpaddingLeftRightUnit = data?.modalButtonpaddingLeftRightUnit;
        mergedData.modalButtonpaddingTopBottom = data?.modalButtonpaddingTopBottom;
        mergedData.modalButtontextAlign = data?.modalButtontextAlign;
        mergedData.modalButtontextColor = data?.modalButtontextColor;
        mergedData.modalLayerBgColor = data?.modalLayerBgColor;
        mergedData.modalButtonhoverBgColor = data?.modalButtonhoverBgColor;
        mergedData.modalButtonhoverBorderColor = data?.modalButtonhoverBorderColor;
        mergedData.modalButtonhoverBorderInput = data?.modalButtonhoverBorderInput;
        mergedData.modalButtonhoverBorderInputUnit = data?.modalButtonhoverBorderInputUnit;
        mergedData.modalButtonhoverBorderType = data?.modalButtonhoverBorderType;
        mergedData.modalButtonhoverTextColor = data?.modalButtonhoverTextColor;
        {/* Style for Modal buttons end*/ }


        // this is for the cart button style
        let mergedButttonSettingData = { ...existingButtonSettingData.current };
        mergedButttonSettingData.cartButtonStyle = {
            bgColor: data.cartButtonbgColor,
            textColor: data.cartButtontextColor,
            fontSize: { value: data.cartButtonfontSize, unit: data.cartButtonfontSizeUnit },
            fontFamily: data.cartButtonfontFamily,
            fontWeight: data.cartButtonfontWeight,
            customCartButton: data.customCartButton,
            borderRadius: {
                value: data.cartButtonborderRadius,
                unit: data.cartButtonborderRadiusUnit
            },
            paddingTopBottom: {
                value: data.cartButtonpaddingTopBottom,
                unit: data.cartButtonpaddingTopBottomUnit
            },
            paddingLeftRight: {
                value: data.cartButtonpaddingLeftRight,
                unit: data.cartButtonpaddingLeftRightUnit
            },
            marginTopBottom: {
                value: data.cartButtonmarginTopBottom,
                unit: data.cartButtonmarginTopBottomUnit,

            },
            marginLeftRight: {
                value: data.cartButtonmarginLeftRight,
                unit: data.cartButtonmarginLeftRightUnit,

            },
            // width: { value: data.cartButtonwidthValue, unit: data.cartButtonwidthUnit },
            border: {
                value: data.cartButtonborderInput,
                unit: data.cartButtonborderInputUnit,
                type: data.cartButtonborderType,
                color: data.cartButtonborderColor
            },
            textAlign: data.cartButtontextAlign,
            iconColor: convertColor(data.cartButtontextColor),
            hover: {
                hoverValue: data.cartButtonhover,
                bgColor: data.cartButtonhoverBgColor,
                textColor: data.cartButtonhoverTextColor,
                iconColor: convertColor(data.cartButtonhoverTextColor),
                border: {
                    value: data.cartButtonhoverBorderInput,
                    unit: data.cartButtonhoverBorderInputUnit,
                    type: data.cartButtonhoverBorderType,
                    color: data.cartButtonhoverBorderColor
                },
                fontSize: {
                    value: data.cartButtonhoverFontSize,
                    unit: data.cartButtonhoverFontSizeUnit
                }
            }
        }

        const getAppMetafieldId = await appMetafield.getAppMetafieldId();
        const generalSettingMetadata = {
            key: "general-setting",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: JSON.stringify(mergedData),
        };
        const buttonSettingMetadata = {
            key: "wishlist-button-setting",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: JSON.stringify(mergedButttonSettingData),
        };
        // Save general settings
        await appMetafield.createAppMetafield(generalSettingMetadata);
        // Save button settings
        await appMetafield.createAppMetafield(buttonSettingMetadata);

        Swal.fire({
            icon: "success",
            title: myLanguage.swalHeading,
            text: myLanguage.swalText,
            confirmButtonText: myLanguage.swalOk,
        });

        setSaveBar(false);

        console.log("mergedData = ", mergedData)
        console.log("mergedButttonSettingData = ", mergedButttonSettingData)
    };

    const showModalHanlder = useCallback(
        (selectedTabIndex) => {
            setShareModalBtn(selectedTabIndex)
        },
        []
    );


    const shareModalBtnArr = [
        {
            content: myLanguage.regular,
            data: <CustomStyle reset={reset} isloading={isloading} Controller={Controller} control={control} hoverOption={true} formName={"shareWishBtn"} setSaveBar={setSaveBar} watchAllFields={watchAllFields} myLanguage={myLanguage} showLess={true} />,
            id: 'regular-1',
        },
        {
            content: myLanguage.hover,
            data: <CustomHoverSetting Controller={Controller} control={control} setSaveBar={setSaveBar} watchAllFields={watchAllFields} formName={"shareWishBtn"} myLanguage={myLanguage} showLess={true} />,
            id: 'hover-2',
        }
    ];


    // --------------this is for the new cart button style----------- 
    const cartBtnArr = [
        {
            content: myLanguage.regular,
            data: <CustomStyle reset={reset} isloading={isloading} Controller={Controller} control={control} hoverOption={true} myLanguage={myLanguage} formName={"cartButton"} setSaveBar={setSaveBar} watchAllFields={watchAllFields} />,
            id: 'regular-1',
        },
        {
            content: myLanguage.hover,
            data: <CustomHoverSetting Controller={Controller} control={control} setSaveBar={setSaveBar} watchAllFields={watchAllFields} formName={"cartButton"} myLanguage={myLanguage} />,
            id: 'hover-2',
        },

    ];

    // Style for Modal buttons start
    const ClearModalBtnArr = [
        {
            content: myLanguage.regular,
            data: <CustomStyle2 reset={reset} isloading={isloading} Controller={Controller} control={control} hoverOption={true} myLanguage={myLanguage} formName={"modalButton"} setSaveBar={setSaveBar} watchAllFields={watchAllFields} />,
            id: 'regular-1',
        },
        {
            content: myLanguage.hover,
            data: <CustomHoverSetting2 Controller={Controller} control={control} setSaveBar={setSaveBar} watchAllFields={watchAllFields} formName={"modalButton"} myLanguage={myLanguage} />,
            id: 'hover-2',
        },

    ];
    // Style for Modal buttons end

    const cartBtnHandler = useCallback(
        (selectedTabIndex) => {
            setCartBtn(selectedTabIndex)
        },
        []
    );

    const viewBtnHandler = useCallback(
        (selectedTabIndex) => {
            setViewBtn(selectedTabIndex)
        },
        []
    );

    return (
        <div className='wf-dashboard wf-dashboard-buttonSetting wf-ui-settings'>
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    <form onSubmit={handleSubmit(saveToMetafield)}>
                        {(saveBar) ? <SaveBar save={myLanguage.save} /> : ""}
                        <Page fullWidth
                            title={myLanguage.overValueB4}
                            subtitle={myLanguage.overValue4}
                            backAction={{ onAction: () => history.back() }}
                        >
                            <div id="wishlist-ui-section">
                                <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                    <div className='custom-margin'>
                                        <Text variant="headingMd" as="h2">{myLanguage.wishlistUIHeading}</Text>
                                        <p>{myLanguage.wishlistUiTypeText}</p>
                                    </div>
                                    <div className='wishlistUi-TyleInner'>
                                        <SingleFieldController
                                            name="wishlistDisplay"
                                            control={control}  >
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.wishlistUIValue1}
                                                    value={field.value}
                                                    id="modal"
                                                    checked={field.value === "modal" && true}
                                                    onChange={() => {
                                                        field.onChange("modal"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="wishlistDisplay"
                                            control={control}  >
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.wishlistUIValue2}
                                                    value={field.value}
                                                    id="page"
                                                    checked={field.value === "page" && true}
                                                    onChange={() => {
                                                        field.onChange("page"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                            <SingleFieldController
                                                name="wishlistDisplay"
                                                control={control}  >
                                                {({ field }) =>
                                                    <RadioButton
                                                        label={myLanguage.wishlistUIValue3}
                                                        value={field.value}
                                                        id="drawer"
                                                        checked={field.value === "drawer" && true} onChange={() => {
                                                            field.onChange("drawer"),
                                                                setSaveBar(true);
                                                        }}
                                                    />
                                                }
                                            </SingleFieldController>
                                        </div>
                                    </div>

                                    <div className='endColorPicker'>
                                        <WishlistBasic myLanguage={myLanguage} control={control} setSaveBar={setSaveBar} watchAllFields={watchAllFields} currentPlan={currentPlan} />
                                    </div>


                                    <Grid>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                            <SingleFieldController name='continueShoppingLink' control={control}  >
                                                {({ field }) => (<TextField className='input-field-css' label={myLanguage.continueShoppingLinkHeading} id='continueShoppingLink' value={field.value} onChange={(newValue) => {
                                                    setSaveBar(true);
                                                    field.onChange(newValue);
                                                }} />)}
                                            </SingleFieldController>
                                        </Grid.Cell>

                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>

                                            <div style={{ color: "#012167", marginBottom: "10px" }}>
                                                <Text variant="headingSm" as="h6">{myLanguage.productOptionHeading} {myLanguage.availableInPremium}</Text>
                                            </div>

                                            <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"}`} style={{ display: "flex", gap: "70px" }}>
                                                <SingleFieldController
                                                    name="showProductOption"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.styleHoverYes}
                                                            value={field.value}
                                                            id="yes"
                                                            checked={field.value === "yes" && true}
                                                            onChange={() => {
                                                                field.onChange("yes"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>
                                                <SingleFieldController
                                                    name="showProductOption"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.styleHoverNo}
                                                            value={field.value}
                                                            id="no"
                                                            checked={field.value === "no" && true}
                                                            onChange={() => {
                                                                field.onChange("no"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>
                                            </div>
                                        </Grid.Cell>
                                    </Grid>


                                    <Grid>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>

                                            <div style={{ color: "#012167", marginBottom: "10px" }}>
                                                <Text variant="headingSm" as="h6">{myLanguage.downloadCsv} {myLanguage.availableInPremium} </Text>
                                            </div>

                                            <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"}`} style={{ display: "flex", gap: "70px" }}>
                                                <SingleFieldController
                                                    name="downloadCsv"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.styleHoverYes}
                                                            value={field.value}
                                                            id="yes1"
                                                            checked={field.value === "yes" && true}
                                                            onChange={() => {
                                                                field.onChange("yes"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>
                                                <SingleFieldController
                                                    name="downloadCsv"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.styleHoverNo}
                                                            value={field.value}
                                                            id="no1"
                                                            checked={field.value === "no" && true}
                                                            onChange={() => {
                                                                field.onChange("no"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>
                                            </div>

                                        </Grid.Cell>

                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>

                                            <ColorPickerController
                                                control={control}
                                                controllerName={`modalLayerBgColor`}
                                                id={`modalLayerBgColor`}
                                                label={myLanguage.modalInnerDivBg}
                                                setSaveBar={setSaveBar}
                                            />

                                        </Grid.Cell>
                                    </Grid>


                                    <Grid>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>

                                            <ColorPickerController
                                                control={control}
                                                controllerName={`modalBottomButtonBgColor`}
                                                id={`modalBottomButtonBgColor`}
                                                label={myLanguage.modalBottomDivBg}
                                                setSaveBar={setSaveBar}
                                            />

                                        </Grid.Cell>
                                    </Grid>

                                    <br />
                                    <div className='custom-margin'>
                                        <Text variant="headingMd" as="h2">{myLanguage.wmsHeading}</Text>
                                        <p>{myLanguage.wmsSubHeading}</p>
                                    </div>

                                    <Grid>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>

                                            <SingleFieldController
                                                name={"gridAlignment"}
                                                control={control}
                                                defaultValue="center">
                                                {({ field }) => (
                                                    <Select
                                                        label={myLanguage.wmsGridAlignment}
                                                        options={alignType}
                                                        onChange={(fieldvalue) => {
                                                            setSaveBar(true);
                                                            field.onChange(fieldvalue);
                                                        }}
                                                        value={field.value}
                                                    />
                                                )}
                                            </SingleFieldController>

                                            <SingleFieldController
                                                name={"gridImageView"}
                                                control={control}
                                                defaultValue="default">
                                                {({ field }) => (
                                                    <Select
                                                        label={myLanguage.wmsImageRender}
                                                        options={imageOption}
                                                        onChange={(fieldvalue) => {
                                                            setSaveBar(true);
                                                            field.onChange(fieldvalue);
                                                        }}
                                                        value={field.value}
                                                    />
                                                )}
                                            </SingleFieldController>

                                            <RangeController
                                                control={control}
                                                controllerName={`gridBorderRadius`}
                                                selectControllerName={`gridBorderRadiusUnit`}
                                                label={myLanguage.wmsGridBorderRadius}
                                                max={100}
                                                setSaveBar={setSaveBar}
                                                unit={"pixel"}
                                            />

                                        </Grid.Cell>

                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>

                                            <ColorPickerController
                                                control={control}
                                                controllerName={`gridBgColor`}
                                                id={`gridBgColor1`}
                                                label={myLanguage.wmsGridBg}
                                                setSaveBar={setSaveBar}
                                            />

                                            <RangeController
                                                control={control}
                                                controllerName={`gridGap`}
                                                selectControllerName={`gridGapUnit`}
                                                label={myLanguage.wmsGridGap}
                                                max={100}
                                                setSaveBar={setSaveBar}
                                                unit={"pixel"}
                                            />

                                            <BorderController control={control} controllerName={`gridBorderInput`} id={`gridBorderInput`} controllerBorderUnitName={`gridBorderInputUnit`} label={myLanguage.styleBorder} controllerBorderName={`gridBorderType`} controllerBorderColor={`gridBorderColor`} setSaveBar={setSaveBar} unit={"pixel"} myLanguage={myLanguage} />

                                        </Grid.Cell>
                                    </Grid>



                                    <br />
                                    <div className='custom-margin'>
                                        <Text variant="headingMd" as="h2">{myLanguage.styleMW}</Text>
                                        <p>{myLanguage.styleMWSub}</p>
                                    </div>

                                    <Grid>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                            <ColorPickerController
                                                control={control}
                                                controllerName={`mwCheckIconBg`}
                                                id={`mwCheckIconBg`}
                                                label={myLanguage.smwOne}
                                                setSaveBar={setSaveBar}
                                            />
                                        </Grid.Cell>

                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                            <ColorPickerController
                                                control={control}
                                                controllerName={`mwCheckIconColor`}
                                                id={`mwCheckIconColor`}
                                                label={myLanguage.smwTwo}
                                                setSaveBar={setSaveBar}
                                            />
                                        </Grid.Cell>
                                    </Grid>



                                    <br />
                                    <div >
                                        <div className='custom-margin'>
                                            <Text variant="headingMd" as="h2">{myLanguage.atcStyleHeading}</Text>
                                            <p>{myLanguage.atcStyleText}</p>
                                        </div>

                                        <Tabs tabs={cartBtnArr} selected={cartBtn} onSelect={cartBtnHandler} fitted>
                                            <LegacyCard.Section >
                                                {cartBtnArr[cartBtn].data}
                                            </LegacyCard.Section>
                                        </Tabs>
                                    </div>
                                </div>

                                {/* Style for Modal buttons start*/}
                                <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                    <div >
                                        <div className='custom-margin'>
                                            <div>
                                                <Toggle
                                                    checked={isHeaderIconTrue}
                                                    onChange={handleChangeHeaderIcon}
                                                    icons={false}
                                                    disabled={false} />
                                            </div>
                                            <Text variant="headingMd" as="h2">Styles for the Clear Wishlist, Add all items to cart and View cart button</Text>
                                            <p>{myLanguage.atcStyleText}</p>
                                        </div>

                                        <Tabs tabs={ClearModalBtnArr} selected={viewBtn} onSelect={viewBtnHandler} fitted>
                                            <LegacyCard.Section >
                                                {ClearModalBtnArr[viewBtn].data}
                                            </LegacyCard.Section>
                                        </Tabs>
                                    </div>
                                </div>
                                {/* Style for Modal buttons end */}

                                <div className='wf-style-wishbtn  wishlist-ui-grid1'>
                                    <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                        <div className='custom-margin'>
                                            <Text variant="headingMd" as="h2">{myLanguage.customiseShareModalButtonText}</Text>
                                            <p>{myLanguage.stylesShareButtonText}</p>
                                        </div>
                                        <Tabs tabs={shareModalBtnArr} selected={shareModalBtn} onSelect={showModalHanlder} fitted >
                                            <LegacyCard.Section >
                                                {shareModalBtnArr[shareModalBtn].data}
                                            </LegacyCard.Section>
                                        </Tabs>
                                    </div>
                                </div>

                                <div className='wf-style-wishbtn  wishlist-ui-grid1'>
                                    <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                        <div className='custom-margin'>
                                            <Text variant="headingMd" as="h2">{myLanguage.HideActionHeading}</Text>
                                            <p>{myLanguage.HideActionSubHeading}</p>
                                        </div>

                                        <div className='wishlistUi-TyleInner'>
                                            <SingleFieldController
                                                name="hideViewAs"
                                                control={control}
                                            >
                                                {({ field }) =>
                                                    <Checkbox
                                                        label={myLanguage.HideViewAs}
                                                        value={"view as"}
                                                        id="view_as"
                                                        checked={field.value}
                                                        onChange={(checked) => {
                                                            field.onChange(checked),
                                                                setSaveBar(true);
                                                        }}
                                                    />
                                                }
                                            </SingleFieldController>

                                            <SingleFieldController
                                                name="hideGrid"
                                                control={control}
                                            >
                                                {({ field }) =>
                                                    <Checkbox
                                                        label={myLanguage.HideGrid}
                                                        value={"grid"}
                                                        id="grid"
                                                        checked={field.value}
                                                        onChange={(checked) => {
                                                            field.onChange(checked),
                                                                setSaveBar(true);
                                                        }}
                                                    />
                                                }
                                            </SingleFieldController>

                                            <SingleFieldController
                                                name="hideSearch"
                                                control={control}
                                            >
                                                {({ field }) =>
                                                    <Checkbox
                                                        label={myLanguage.HideSearch}
                                                        value={"search"}
                                                        id="search"
                                                        checked={field.value}
                                                        onChange={(checked) => {
                                                            field.onChange(checked),
                                                                setSaveBar(true);
                                                        }}
                                                    />
                                                }
                                            </SingleFieldController>

                                            <SingleFieldController
                                                name="hideLoginText"
                                                control={control}
                                            >
                                                {({ field }) =>
                                                    <Checkbox
                                                        label={myLanguage.hideLoginText}
                                                        value={"loginText"}
                                                        id="loginText"
                                                        checked={field.value}
                                                        onChange={(checked) => {
                                                            field.onChange(checked),
                                                                setSaveBar(true);
                                                        }}
                                                    />
                                                }
                                            </SingleFieldController>







                                            {/* <SingleFieldController
                                                name="hideFilter"
                                                control={control}
                                            >
                                                {({ field }) =>
                                                    <Checkbox
                                                        label={"Hide filter option"}
                                                        value={"filter"}
                                                        id="filter"
                                                        checked={field.value}
                                                        onChange={(checked) => {
                                                            field.onChange(checked),
                                                                setSaveBar(true);
                                                        }}
                                                    />
                                                }
                                            </SingleFieldController> */}

                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div style={{ marginTop: "40px" }}>
                                <Footer myLanguage={myLanguage} />
                            </div>
                        </Page>
                    </form>
                </Frame>
            }
        </div >
    )
}


export default WishlistUiSetting;