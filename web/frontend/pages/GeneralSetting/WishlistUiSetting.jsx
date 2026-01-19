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
import Toggle from 'react-toggle';
import { Constants } from '../../../backend/constants/constant';
import useApi from '../../hooks/useApi';

const WishlistUiSetting = () => {

    const { serverURL } = Constants;
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
    const [clearBtn, setClearBtn] = useState(0);
    const [genData, setGenData] = useState({});
    const [isHeaderIconTrue, setIsHeaderIconTrue] = useState(false);
    const [isMetafieldTrue, setIsMetafieldTrue] = useState(false);
    const shopApi = useApi();
    const [metaArr, setMetaArr] = useState([]);
    const metaRef = useRef([]);

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

        let shop = await shopApi.shop();
        await getMetaObjectSql(shop);
        await getAllAppDataMetafields();
    }


    async function getMetaObjectSql(shop) {
        // console.log("shop.shopName ==== ", shop)
        try {
            let response = await fetch(`${serverURL}/wf-get-unique-metafields`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shop.shopName,
                }),
            });
            let results = await response.json();
            setMetaArr(results?.uniqueKeys || []);
            metaRef.current = results?.uniqueKeys || [];
            // setMetaArr(prev => [...new Set([...prev, ...(results?.uniqueKeys || [])])]);

            // setMetaArr(prev => {
            //     const updated = results?.uniqueKeys || [];
            //     console.log("prev:", prev);
            //     console.log("updated:", updated);
            //     return updated;
            // });

            // await getAllAppDataMetafields();

        } catch (error) {
            console.log("error", error);
        }
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

        let generalData = null;
        let buttonData = null;

        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "general-setting") {
                utilityFunction.goToSectionFxn();
                let checkElement = document.querySelector(".dontRunAgain");
                if (checkElement === null) {
                    utilityFunction.upgradeButtonFxn();
                }
                let dData = JSON.parse(dataArray[i].node.value);
                setGenData(dData);
                generalData = dData;
                existingData.current = dData;
                setIsLoading(true);
                setIsHeaderIconTrue(dData?.clearBtnStyleActive === "yes" ? true : false);
                setIsMetafieldTrue(dData?.metafieldActive === "yes" ? true : false);

            }

            if (dataArray[i].node.key === "wishlist-button-setting") {
                let dData = JSON.parse(dataArray[i].node.value);
                buttonData = dData;
                existingButtonSettingData.current = dData;
            }
        }

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

                ...metaRef.current.reduce((acc, key) => {
                    acc[key] = generalData[key];
                    return acc;
                }, {}),

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

                    clearButtonbgColor: buttonData?.clearButtonStyle?.bgColor || "#FFFFFF",
                    clearButtonborderInput: buttonData?.clearButtonStyle?.border.value || "1",
                    clearButtonborderInputUnit: buttonData?.clearButtonStyle?.border.unit || "px",
                    clearButtonborderRadius: buttonData?.clearButtonStyle?.borderRadius.value || "5",
                    clearButtonborderRadiusUnit: buttonData?.clearButtonStyle?.borderRadius.unit || "px",
                    clearButtonborderType: buttonData?.clearButtonStyle?.border.type || "solid",
                    clearButtonborderColor: buttonData?.clearButtonStyle?.border.color || "#000000",
                    clearButtonfontFamily: buttonData?.clearButtonStyle?.fontFamily || "",
                    clearButtonfontWeight: buttonData?.clearButtonStyle?.fontWeight || "normal",
                    clearButtonfontSize: buttonData?.clearButtonStyle?.fontSize.value || "15",
                    clearButtontextColor: buttonData?.clearButtonStyle?.textColor || "#000000",
                    clearButtonfontSizeUnit: buttonData?.clearButtonStyle?.fontSize.unit || "px",
                    clearButtonnborderColor: buttonData?.clearButtonStyle?.border.color || "#000000",
                    clearButtonhover: buttonData?.clearButtonStyle?.hover.hoverValue || "",
                    clearButtonhoverBgColor: buttonData?.clearButtonStyle?.hover.bgColor || "#000000",
                    clearButtonhoverBorderColor: buttonData?.clearButtonStyle?.hover.border.color || "#797979",
                    clearButtonhoverBorderInput: buttonData?.clearButtonStyle?.hover.border.value || "1",
                    clearButtonhoverBorderInputUnit: buttonData?.clearButtonStyle?.hover.border.unit || "px",
                    clearButtonhoverBorderType: buttonData?.clearButtonStyle?.hover.border.type || "solid",
                    clearButtonhoverTextColor: buttonData?.clearButtonStyle?.hover.textColor || "#FFFFFF",
                    clearButtonhoverFontSize: buttonData?.clearButtonStyle?.hover.fontSize.value || "15",
                    clearButtonhoverFontSizeUnit: buttonData?.clearButtonStyle?.hover.fontSize.unit || "px",
                    clearButtonmarginLeftRight: buttonData?.clearButtonStyle?.marginLeftRight.value || "0",
                    clearButtonmarginLeftRightUnit: buttonData?.clearButtonStyle?.marginLeftRight.unit || "px",
                    clearButtonmarginTopBottom: buttonData?.clearButtonStyle?.marginTopBottom.value || "07",
                    clearButtonmarginTopBottomUnit: buttonData?.clearButtonStyle?.marginTopBottom.unit || "px",
                    clearButtonpaddingLeftRight: buttonData?.clearButtonStyle?.paddingLeftRight.value || "10",
                    clearButtonpaddingLeftRightUnit: buttonData?.clearButtonStyle?.paddingLeftRight.unit || "px",
                    clearButtonpaddingTopBottom: buttonData?.clearButtonStyle?.paddingTopBottom.value || "8",
                    clearButtonpaddingTopBottomUnit: buttonData?.clearButtonStyle?.paddingTopBottom.unit || "px",
                    clearButtontextAlign: buttonData?.clearButtonStyle?.textAlign || "center",
                    // clearButtoniconSize: buttonData?.clearButtonStyle?.iconSize,
                    // clearButtoniconPosition: buttonData?.clearButtonStyle?.iconPosition,

                }),
            })
        }
    }

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
        // console.log("DAATTAA --- ", data)

        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });

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
        mergedData.clearBtnStyleActive = isHeaderIconTrue === true ? "yes" : "no";
        mergedData.metafieldActive = isMetafieldTrue === true ? "yes" : "no";

        if (metaArr.length !== 0) {
            metaArr.forEach(key => {
                mergedData[key] = data[key];
            });
        }

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

        mergedButttonSettingData.clearButtonStyle = {
            bgColor: data.clearButtonbgColor,
            textColor: data.clearButtontextColor,
            fontSize: { value: data.clearButtonfontSize, unit: data.clearButtonfontSizeUnit },
            fontFamily: data.clearButtonfontFamily,
            fontWeight: data.clearButtonfontWeight,
            customCartButton: data.customCartButton,
            borderRadius: {
                value: data.clearButtonborderRadius,
                unit: data.clearButtonborderRadiusUnit
            },
            paddingTopBottom: {
                value: data.clearButtonpaddingTopBottom,
                unit: data.clearButtonpaddingTopBottomUnit
            },
            paddingLeftRight: {
                value: data.clearButtonpaddingLeftRight,
                unit: data.clearButtonpaddingLeftRightUnit
            },
            marginTopBottom: {
                value: data.clearButtonmarginTopBottom,
                unit: data.clearButtonmarginTopBottomUnit,

            },
            marginLeftRight: {
                value: data.clearButtonmarginLeftRight,
                unit: data.clearButtonmarginLeftRightUnit,

            },
            // width: { value: data.clearButtonwidthValue, unit: data.clearButtonwidthUnit },
            border: {
                value: data.clearButtonborderInput,
                unit: data.clearButtonborderInputUnit,
                type: data.clearButtonborderType,
                color: data.clearButtonborderColor
            },
            textAlign: data.clearButtontextAlign,
            iconColor: convertColor(data.clearButtontextColor),
            hover: {
                hoverValue: data.clearButtonhover,
                bgColor: data.clearButtonhoverBgColor,
                textColor: data.clearButtonhoverTextColor,
                iconColor: convertColor(data.clearButtonhoverTextColor),
                border: {
                    value: data.clearButtonhoverBorderInput,
                    unit: data.clearButtonhoverBorderInputUnit,
                    type: data.clearButtonhoverBorderType,
                    color: data.clearButtonhoverBorderColor
                },
                fontSize: {
                    value: data.clearButtonhoverFontSize,
                    unit: data.clearButtonhoverFontSizeUnit
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

    const cartBtnHandler = useCallback(
        (selectedTabIndex) => {
            setCartBtn(selectedTabIndex)
        },
        []
    );


    const clearBtnArr = [
        {
            content: myLanguage.regular,
            data: <CustomStyle reset={reset} isloading={isloading} Controller={Controller} control={control} hoverOption={true} myLanguage={myLanguage} formName={"clearButton"} setSaveBar={setSaveBar} watchAllFields={watchAllFields} />,
            id: 'regular-1',
        },
        {
            content: myLanguage.hover,
            data: <CustomHoverSetting Controller={Controller} control={control} setSaveBar={setSaveBar} watchAllFields={watchAllFields} formName={"clearButton"} myLanguage={myLanguage} />,
            id: 'hover-2',
        },
    ];

    const clearBtnHandler = useCallback(
        (selectedTabIndex) => {
            setClearBtn(selectedTabIndex)
        },
        []
    );

    async function handleChangeHeaderIcon(e) {
        setIsHeaderIconTrue(e.target.checked);
        setSaveBar(true);
    };

    async function handleChangeSelectMetafield(e) {
        setIsMetafieldTrue(e.target.checked);
        setSaveBar(true);
    };

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
                                    {/* <div>
                                        <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"}`} >
                                            <div className='custom-margin'>
                                                <Text variant="headingMd" as="h2">Select metafield to show in the modal's grid</Text>
                                                <p>Select metafield to show in the modal's grid</p>
                                            </div>
                                            {metaArr.length !== 0 ?
                                                metaArr.map((data, index) => {
                                                    return (
                                                        <SingleFieldController
                                                            key={index}
                                                            name={data}
                                                            control={control}
                                                        >
                                                            {({ field }) =>
                                                                <Checkbox
                                                                    label={data}
                                                                    value={data}
                                                                    id={data}
                                                                    checked={field.value}
                                                                    onChange={(checked) => {
                                                                        field.onChange(checked),
                                                                            setSaveBar(true);
                                                                    }}
                                                                />
                                                            }
                                                        </SingleFieldController>)
                                                })
                                                :
                                                <i>No metafields available</i>
                                            }
                                        </div>
                                    </div> */}

                                </div>



                                <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                    <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"}`} >
                                        <div className='custom-margin' style={{ display: "flex", gap: "40px" }}>
                                            <div style={{ width: "95%" }}>
                                                <Text variant="headingMd" as="h2">Select metafield to show in the modal's grid</Text>
                                                <p>Choose metafields you want to show in the modal's product grid</p>
                                            </div>
                                            <div style={{ width: "5%", paddingTop: "20px" }}> <Toggle
                                                checked={isMetafieldTrue}
                                                onChange={handleChangeSelectMetafield}
                                                icons={false}
                                                disabled={false} />
                                            </div>
                                        </div>

                                        {metaArr.length !== 0 ?
                                            metaArr.map((data, index) => {
                                                return (
                                                    <SingleFieldController
                                                        key={index}
                                                        name={data}
                                                        control={control}
                                                    >
                                                        {({ field }) =>
                                                            <Checkbox
                                                                label={data}
                                                                value={data}
                                                                id={data}
                                                                checked={field.value}
                                                                onChange={(checked) => {
                                                                    field.onChange(checked),
                                                                        setSaveBar(true);
                                                                }}
                                                            />
                                                        }
                                                    </SingleFieldController>)
                                            })
                                            :
                                            <i>No metafields available</i>
                                        }
                                    </div>
                                </div>





                                <div className='wf-style-wishbtn wishlist-ui-grid2'>
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

                                <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                    <div >
                                        <div className='custom-margin' style={{ display: "flex", gap: "40px" }}>
                                            <div style={{ width: "95%" }}>
                                                <Text variant="headingMd" as="h2">Styles for Clear Wishlist Button and Other Buttons in the Modal</Text>
                                                <p>You can customize and style the Clear Wishlist button and other buttons in the modal here. (To activate these settings, enable the toggle; otherwise, the modal buttons will use the reverse style of the cart buttons.)</p>
                                            </div>
                                            <div style={{ width: "5%", paddingTop: "20px" }}> <Toggle
                                                checked={isHeaderIconTrue}
                                                onChange={handleChangeHeaderIcon}
                                                icons={false}
                                                disabled={false} />
                                            </div>
                                        </div>

                                        <Tabs tabs={clearBtnArr} selected={clearBtn} onSelect={clearBtnHandler} fitted>
                                            <LegacyCard.Section >
                                                {clearBtnArr[clearBtn].data}
                                            </LegacyCard.Section>
                                        </Tabs>
                                    </div>
                                </div>

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