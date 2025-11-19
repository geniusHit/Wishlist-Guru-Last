import React, { useEffect, useState, useRef, useMemo, Suspense } from 'react';
import { Frame, AlphaCard, Button, Page, Text, Grid, RadioButton, Select, Tabs, LegacyCard, Checkbox, Collapsible } from '@shopify/polaris';
import { Controller, useForm } from "react-hook-form";
import CssFilterConverter from "css-filter-converter";
import Swal from "sweetalert2";
import loaderGif from "./loaderGreen.gif"
import SkeletonPage1 from './SkeletonPage1';
import useAppMetafield from '../hooks/useAppMetafield';
import SaveBar from './SaveBar';
import useUtilityFunction from '../hooks/useUtilityFunction';
import DemoProduct from './DemoProduct';
import CustomStyle from './CustomStyle'
import { useCallback } from 'react';
import CustomHoverSetting from './CustomHoverSetting';
import CustomActive from './CustomActive';
import SingleFieldController from "../hooks/useSingleFieldController";
import Footer from './Footer';
import useApi from '../hooks/useApi';
import SingleController from '../hooks/useSingleFieldController';
import { Link } from 'react-router-dom';

const ButtonSetting = () => {
    let iconColor;
    let iconColorHover;
    // let cartButtoniconColor;
    // let cartButtoniconColorHover;
    let iconSizeValue;
    let carticonSizeValue;
    let activeBtniconColor;
    const shopApi = useApi()
    const [myLanguage, setMyLanguage] = useState({});
    const { handleSubmit, watch, control, reset, setValue, formState: { errors } } = useForm();
    const appMetafield = useAppMetafield();
    const [saveBar, setSaveBar] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const utilityFunction = useUtilityFunction();
    const [wishlistTextDirection, setWishlistTextDirection] = useState("");
    const watchAllFields = watch();
    const [cartBtn, setCartBtn] = useState(0);
    const [shopData, setShopData] = useState("")
    // const [shareModalBtn, setShareModalBtn] = useState(0);
    const [wishlistBtn, setWishlistBtn] = useState(0);
    const [getThemeId, setGetThemeId] = useState('');
    const existingButtonSettingData = useRef([]);

    // const [collectionData, setCollectionData] = useState({});
    const collectionData = useRef({});
    const [currentPlan, setCurrentPlan] = useState();

    const whiteFilter = 'brightness(0) saturate(100%) invert(100%) sepia(71%) saturate(0%) hue-rotate(305deg) brightness(104%) contrast(101%)';
    const blackFilter = 'brightness(0) saturate(100%) invert(0%) sepia(94%) saturate(7477%) hue-rotate(339deg) brightness(106%) contrast(106%)';
    const [aloneIcon, setAloneIcon] = useState(false);

    // const [pdpIcon, setPdpIcon] = useState("No")
    // const [pdpIconPosition, setPdpIconPosition] = useState("top-left")

    // const [iconBesideTitle, setIconBesideTitle] = useState("off")
    // const [iconBesideAddToCart, setIconBesideAddToCart] = useState("off")

    useEffect(() => {
        useEffectLite();
    }, []);

    async function useEffectLite() {
        const shopData = await shopApi.shop();
        setShopData(shopData)
        const getCurrentPlan = await appMetafield.getCurrentPlan();
        setCurrentPlan(parseInt(getCurrentPlan.currentPlan));

        await utilityFunction.getPlanFirst();
        await utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
        });
        getAllAppDataMetafields();

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

    const calculateSizeValue = (size, fontSize) => {
        // switch (size) {
        //     case "small":
        //         return (parseInt(fontSize) * 60) / 100;
        //     case "medium":
        //         return fontSize;
        //     default:
        //         return (parseInt(fontSize) * 150) / 100;
        // }
        switch (size) {
            case "small":
                return 15;
            case "medium":
                return 20;
            default:
                return 25;
        }
    };

    useMemo(() => {
        iconColor = convertColor(watchAllFields.iconColor);
        iconColorHover = convertColor(watchAllFields.hovericonColor);
        // cartButtoniconColor = convertColor(watchAllFields.cartButtoniconColor);
        // cartButtoniconColorHover = convertColor(watchAllFields.cartButtonhovericonColor);
        activeBtniconColor = convertColor(watchAllFields.activeBtniconColor);
        iconSizeValue = calculateSizeValue(watchAllFields.iconSize);
        carticonSizeValue = calculateSizeValue(watchAllFields.cartButtoniconSize, watchAllFields.cartButtonfontSize);

    }, [watchAllFields]);

    const animationBtn = [{ value: "none", label: myLanguage.animationNone },
    { value: "shake-side", label: myLanguage.animation1 },
    { value: "shake-up", label: myLanguage.animation2 },
    { value: "rotate", label: myLanguage.animation3 },
    { value: "fade-in", label: myLanguage.animation4 },
    { value: "fade-out", label: myLanguage.animation5 }]

    const options = [
        { value: "icon-top-left", label: myLanguage.cpRadio1 },
        { value: "icon-top-right", label: myLanguage.cpRadio2 },
        { value: "icon-bottom-left", label: myLanguage.cpRadio3 },
        { value: "icon-bottom-right", label: myLanguage.cpRadio4 }
    ];

    const options2 = [
        { value: "left", label: myLanguage.pdpLeftSideOfTitle },
        { value: "right", label: myLanguage.pdpRightSideOfTitle },
        { value: "no", label: myLanguage.countBtnSetting3 },
    ];

    const options3 = [
        { value: "left", label: myLanguage.pdpAddToCartLeft },
        { value: "right", label: myLanguage.pdpAddToCartRight },
        { value: "no", label: myLanguage.countBtnSetting3 },
    ];

    const pdpIconPositionOptions = [
        { value: "yes", label: myLanguage.styleHoverYes },
        { value: "no", label: myLanguage.styleHoverNo },
    ]

    async function getAllAppDataMetafields() {
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "general-setting") {
                let dData = JSON.parse(dataArray[i].node.value);
                setWishlistTextDirection(dData.wishlistTextDirection);
            };
            if (dataArray[i].node.key === "current-theme-name") {
                let dData = JSON.parse(dataArray[i].node.value);
                setGetThemeId(dData?.id);
            }
            if (dataArray[i].node.key === "wishlist-button-setting") {
                // setIsLoading(true);
                utilityFunction.goToSectionFxn();
                let dData = JSON.parse(dataArray[i].node.value);
                existingButtonSettingData.current = dData;
                let shouldSave = false;

                if (!dData.showCount) {
                    dData.showCount = "no";
                    shouldSave = true
                }
                shouldSave && saveMetaFxn(dData)
                reset({
                    buttonTypeRadio: dData.buttonTypeRadio,
                    iconType: dData.iconType,
                    borderInput: dData.border.value,
                    borderInputUnit: dData.border.unit,
                    borderRadius: dData.borderRadius.value,
                    borderRadiusUnit: dData.borderRadius.unit,
                    borderType: dData.border.type,
                    bgColor: dData.bgColor,
                    textColor: dData.textColor,
                    fontWeight: dData.fontWeight,
                    animationType: dData.animationType,
                    customCartButton: dData.cartButtonStyle.customCartButton,
                    fontFamily: dData.fontFamily,
                    fontSize: dData.fontSize.value,
                    fontSizeUnit: dData.fontSize.unit,
                    hover: dData.hover.hoverValue,
                    hoverBgColor: dData.hover.bgColor,
                    hoverBorderColor: dData.hover.border.color,
                    hoverBorderInput: dData.hover.border.value,
                    hoverBorderInputUnit: dData.hover.border.unit,
                    hoverBorderType: dData.hover.border.type,
                    hoverTextColor: dData.hover.textColor,
                    marginLeftRight: dData.marginLeftRight.value,
                    marginLeftRightUnit: dData.marginLeftRight.unit,
                    marginTopBottom: dData.marginTopBottom.value,
                    marginTopBottomUnit: dData.marginTopBottom.unit,
                    borderColor: dData.border.color,
                    paddingLeftRight: dData.paddingLeftRight.value,
                    paddingLeftRightUnit: dData.paddingLeftRight.unit,
                    paddingTopBottom: dData.paddingTopBottom.value,
                    paddingTopBottomUnit: dData.paddingTopBottom.unit,
                    textAlign: dData.textAlign,
                    widthUnit: dData?.width?.unit || "%",
                    widthValue: dData?.width?.value || "100",

                    iconColor: dData?.iconColor?.color ? dData?.iconColor?.color : (await CssFilterConverter.filterToHex(dData.iconColor)).color,
                    hovericonColor: dData.hover.iconColor.color ? dData.hover.iconColor.color : (await CssFilterConverter.filterToHex(dData.hover.iconColor)).color,

                    iconSize: dData.iconSize,
                    iconPosition: dData.iconPosition,
                    // cartButtoniconSize: dData.cartButtonStyle.iconSize,
                    // cartButtoniconPosition: dData.cartButtonStyle.iconPosition,

                    activeBtnbgColor: dData.activeBtn.bgColor,
                    activeBtnborderColor: dData.activeBtn.border.color,
                    activeBtnborderInput: dData.activeBtn.border.value,
                    activeBtnborderInputUnit: dData.activeBtn.border.unit,
                    activeBtnborderType: dData.activeBtn.border.type,
                    activeBtntextColor: dData.activeBtn.textColor,


                    activeBtniconColor: dData?.activeBtn?.iconColor?.color ? dData?.activeBtn?.iconColor?.color : (await CssFilterConverter.filterToHex(dData.activeBtn.iconColor)).color,

                    wishlistButtonCheck: dData.wishlistButtonCheck,
                    // showCount: dData?.showCount || "no",
                    // showCount: dData?.showCount === "yes" && "increaseNdecrease" || "no"

                    showCount: dData?.showCount === "yes" ? "increaseNdecrease" || "no" : dData?.showCount,

                    pdpIcon: dData?.pdpIconOnImage?.icon || "no",
                    pdpIconPosition: dData?.pdpIconOnImage?.position || "",

                    iconBesideTitle: dData?.iconBesideTitle || "no",
                    iconBesideAddToCart: dData?.iconBesideAddToCart || "no",

                })
                dData.buttonTypeRadio === "icon" && setAloneIcon(true)
                setIsLoading(true);
            }
            if (dataArray[i].node.key === "collection-setting") {
                let val = JSON.parse(dataArray[i].node.value);
                collectionData.current = val;
            }

            let checkElement = document.querySelector(".dontRunAgain");
            if (checkElement === null) {
                utilityFunction.upgradeButtonFxn();
            }
        }
    };

    async function saveMetaFxn(data) {
        const getAppMetafieldId = await appMetafield.getAppMetafieldId();
        const appMetadata = {
            key: "wishlist-button-setting",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: JSON.stringify(data)
        };
        await appMetafield.createAppMetafield(appMetadata)

    }

    const goToProductPage = () => {
        window.open(`https://${shopData.domain}/admin/themes/${getThemeId}/editor?template=product&addAppBlockId=2c17f518-d350-4883-a154-c9a194a4a585/app-block&target=mainSection`, "_blank");
    };

    let onlyTextButton = watchAllFields.buttonTypeRadio === "icon-text" || watchAllFields.buttonTypeRadio === "text";

    function styleFxn() {
        let styleTag = document.getElementById("customStyle");
        const bgButton = watchAllFields.buttonTypeRadio === "icon-text-button" || watchAllFields.buttonTypeRadio === "text-button"
        const plainButton = watchAllFields.buttonTypeRadio === "icon-text" || watchAllFields.buttonTypeRadio === "text"

        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = "customStyle";
            document.getElementsByTagName("head")[0].appendChild(styleTag);
        }

        let cssContent = `
            .skeleton-div .default-regular-btn {
                display: flex;
                align-items: center;
                justify-content: ${watchAllFields.textAlign === "center" ? "center" : watchAllFields.textAlign === "left" ? "start" : "end"};
                gap: 10px;
                flex-direction: ${watchAllFields.iconPosition === "right" ? "row-reverse" : "row"};
                background-color: ${wishlistBtn === 1 ? watchAllFields.hoverBgColor : watchAllFields.bgColor};
                color: ${wishlistBtn === 1 ? watchAllFields.hoverTextColor : watchAllFields.textColor};
                font-size: ${watchAllFields.fontSize}${watchAllFields.fontSizeUnit};
                font-family: ${watchAllFields.fontFamily};
                padding: ${watchAllFields.paddingTopBottom}${watchAllFields.paddingTopBottomUnit} ${watchAllFields.paddingLeftRight}${watchAllFields.paddingLeftRightUnit} ${watchAllFields.paddingTopBottom}${watchAllFields.paddingTopBottomUnit} ${watchAllFields.paddingLeftRight}${watchAllFields.paddingLeftRightUnit};
                cursor:pointer;
                font-weight: 400;
                width: 100%;

                ${(watchAllFields.showCount === "no" && !plainButton) && `border: ${wishlistBtn === 1 ? `${watchAllFields.hoverBorderInput}${watchAllFields.hoverBorderInputUnit} ${watchAllFields.hoverBorderType} ${watchAllFields.hoverBorderColor}` : `${watchAllFields.borderInput}${watchAllFields.borderInputUnit} ${watchAllFields.borderType} ${watchAllFields.borderColor}`};`}

                ${watchAllFields.showCount === "no" && `border-radius: ${watchAllFields.borderRadius}${watchAllFields.borderRadiusUnit};

                margin: ${watchAllFields.marginTopBottom}${watchAllFields.marginTopBottomUnit} ${watchAllFields.marginLeftRight}${watchAllFields.marginLeftRightUnit} ${watchAllFields.marginTopBottom}${watchAllFields.marginTopBottomUnit} ${watchAllFields.marginLeftRight}${watchAllFields.marginLeftRightUnit};`}
                
            }

            .iconDiv {
                width: 40px;
                height: 40px;
                background-color: ${wishlistBtn === 2 ? watchAllFields.activeBtnbgColor : wishlistBtn === 1 ? watchAllFields.hoverBgColor : watchAllFields.bgColor};
                display: flex;
                align-items: center;
                justify-content: center;
                cursor:pointer;
                margin: ${watchAllFields.textAlign === "center" ? "0 auto" : watchAllFields.textAlign === "left" ? "0" : "0 0 0 auto"};

                ${watchAllFields.showCount === "no" && `border-radius: ${watchAllFields.borderRadius}${watchAllFields.borderRadiusUnit};`}
                border: ${wishlistBtn === 2 ? `${watchAllFields.activeBtnborderInput}${watchAllFields.activeBtnborderInputUnit} ${watchAllFields.activeBtnborderType} ${watchAllFields.activeBtnborderColor}` : wishlistBtn === 1 ? `${watchAllFields.hoverBorderInput}${watchAllFields.hoverBorderInputUnit} ${watchAllFields.hoverBorderType} ${watchAllFields.hoverBorderColor}` : `${watchAllFields.borderInput}${watchAllFields.borderInputUnit} ${watchAllFields.borderType} ${watchAllFields.borderColor}`};
            }

            .btnIcon {
                filter: ${wishlistBtn === 2 ? activeBtniconColor.color : wishlistBtn === 1 ? iconColorHover.color : iconColor.color};
                width: ${iconSizeValue}px;
                height: ${iconSizeValue}px;
            }

            .skeleton-div .btnIconAlone{
                filter: ${wishlistBtn === 2 ? activeBtniconColor.color : wishlistBtn === 1 ? iconColorHover.color : iconColor.color};               
                 width: 20px;
                height: 20px;
            }

            .skeleton-div .default-active-btn {
                display: flex;
                align-items: center;
                justify-content: ${watchAllFields.textAlign === "center" ? "center" : watchAllFields.textAlign === "left" ? "start" : "end"};
                gap: 10px;
                flex-direction: ${watchAllFields.iconPosition === "right" ? "row-reverse" : "row"};
                background-color: ${wishlistBtn === 1 ? watchAllFields.hoverBgColor : watchAllFields.activeBtnbgColor};
                font-family: ${watchAllFields.fontFamily};
                padding: ${watchAllFields.paddingTopBottom}${watchAllFields.paddingTopBottomUnit} ${watchAllFields.paddingLeftRight}${watchAllFields.paddingLeftRightUnit} ${watchAllFields.paddingTopBottom}${watchAllFields.paddingTopBottomUnit} ${watchAllFields.paddingLeftRight}${watchAllFields.paddingLeftRightUnit};
                cursor:pointer;
                font-weight: 400;
                color: ${wishlistBtn === 1 ? watchAllFields.hoverTextColor : watchAllFields.activeBtntextColor};
                font-size: ${watchAllFields.fontSize}${watchAllFields.fontSizeUnit};
                width: 100%;
                
                ${(watchAllFields.showCount === "no" && !plainButton) && `border: ${wishlistBtn === 1 ? `${watchAllFields.hoverBorderInput}${watchAllFields.hoverBorderInputUnit} ${watchAllFields.hoverBorderType} ${watchAllFields.hoverBorderColor}` : `${watchAllFields.activeBtnborderInput}${watchAllFields.activeBtnborderInputUnit} ${watchAllFields.activeBtnborderType} ${watchAllFields.activeBtnborderColor}`};`}

                ${watchAllFields.showCount === "no" && `border-radius: ${watchAllFields.borderRadius}${watchAllFields.borderRadiusUnit};
                margin: ${watchAllFields.marginTopBottom}${watchAllFields.marginTopBottomUnit} ${watchAllFields.marginLeftRight}${watchAllFields.marginLeftRightUnit} ${watchAllFields.marginTopBottom}${watchAllFields.marginTopBottomUnit} ${watchAllFields.marginLeftRight}${watchAllFields.marginLeftRightUnit};`}

                
            }

            .staticIconDiv {
                width: 40px;
                height: 40px;
                background-color: black;
                border: 1px solid black;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor:pointer;
            }

            .whiteIcon,
            .staticIcon{
                filter: ${whiteFilter};
                width: 20px;
                height: 20px;
            }
            .blackIcon {
                filter: ${blackFilter};
                width: 20px;
                height: 20px;
            }

            .skeleton-div {
                margin:auto;
            }

            ${watchAllFields.showCount !== "no" && `
                .skeleton-div {
                    ${!plainButton && `border: ${wishlistBtn === 0 ? `${watchAllFields.borderInput}${watchAllFields.borderInputUnit} ${watchAllFields.borderType} ${watchAllFields.borderColor}` : wishlistBtn === 1 ? `${watchAllFields.hoverBorderInput}${watchAllFields.hoverBorderInputUnit} ${watchAllFields.hoverBorderType} ${watchAllFields.hoverBorderColor}` : `${watchAllFields.activeBtnborderInput}${watchAllFields.activeBtnborderInputUnit} ${watchAllFields.activeBtnborderType} ${watchAllFields.activeBtnborderColor}`};`}
                    
                    border-radius: ${watchAllFields.borderRadius}${watchAllFields.borderRadiusUnit};
                    ${watchAllFields.buttonTypeRadio === "icon" ? `margin: ${watchAllFields.textAlign === "center" ? "0 auto" : watchAllFields.textAlign === "left" ? "0" : "0 0 0 auto"};
                    margin-top: ${watchAllFields.marginTopBottom}${watchAllFields.marginTopBottomUnit};
                    margin-bottom: ${watchAllFields.marginTopBottom}${watchAllFields.marginTopBottomUnit};

                    
                    ` : `margin: ${watchAllFields.marginTopBottom}${watchAllFields.marginTopBottomUnit} ${watchAllFields.marginLeftRight}${watchAllFields.marginLeftRightUnit} ${watchAllFields.marginTopBottom}${watchAllFields.marginTopBottomUnit} ${watchAllFields.marginLeftRight}${watchAllFields.marginLeftRightUnit};`}
                    width: ${watchAllFields.buttonTypeRadio === "icon" ? "max-content" : "100%"};
                }

                .skeleton-div .default-active-btn,
                .skeleton-div .default-regular-btn,
                .skeleton-div .iconDiv{
                    border-radius: ${watchAllFields.borderRadius}${watchAllFields.borderRadiusUnit} 0 0 ${watchAllFields.borderRadius}${watchAllFields.borderRadiusUnit};
                }

                #wf-count-demo{
                    min-width: 35px;
                    font-size: ${watchAllFields.fontSize}${watchAllFields.fontSizeUnit};
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-family: ${watchAllFields.fontFamily};
                    cursor:pointer;
                    font-weight: 400;

                    border-radius: 0 ${watchAllFields.borderRadius}${watchAllFields.borderRadiusUnit} ${watchAllFields.borderRadius}${watchAllFields.borderRadiusUnit} 0;

                    ${bgButton ? `background-color: ${wishlistBtn === 0 ? watchAllFields.textColor : wishlistBtn === 1 ? watchAllFields.hoverTextColor : watchAllFields.activeBtntextColor};` : plainButton ? `background-color: ${wishlistBtn === 0 ? "transparent" : wishlistBtn === 1 ? "transparent" : "transparent"};` : `background-color: ${wishlistBtn === 0 ? watchAllFields.iconColor : wishlistBtn === 1 ? watchAllFields.hovericonColor : watchAllFields.activeBtniconColor};`}
                    

                    ${bgButton ? `color: ${wishlistBtn === 0 ? watchAllFields.bgColor : wishlistBtn === 1 ? watchAllFields.hoverBgColor : watchAllFields.activeBtnbgColor};` : plainButton ? `color: ${wishlistBtn === 0 ? watchAllFields.textColor : wishlistBtn === 1 ? watchAllFields.hoverTextColor : watchAllFields.activeBtntextColor}};` : `color: ${wishlistBtn === 0 ? watchAllFields.bgColor : wishlistBtn === 1 ? watchAllFields.hoverBgColor : watchAllFields.activeBtnbgColor};`}
                    }
            `}
        `;

        styleTag.innerHTML = cssContent;
    }

    styleFxn();

    function textButtonFxn() {
        return <div className={`${wishlistBtn == 2 ? "default-active-btn" : "default-regular-btn"} ${watchAllFields.animationType === "none" && `animation-none`} ${watchAllFields.animationType === "shake-side" && `animation-shake-side`} ${watchAllFields.animationType === "shake-up" && `animation-shake-up`} ${watchAllFields.animationType === "rotate" && `animation-rotate`} ${watchAllFields.animationType === "fade-in" && `animation-fade_in `} ${watchAllFields.animationType === "fade-out" && `animation-fade_out`}`}>{wishlistBtn == 2 ? `${myLanguage.alreadyAdded}` : `${myLanguage.buttonText}`}</div>
    };

    function iconTextButtonFxn(data) {
        return <div className={`${wishlistBtn == 2 ? "default-active-btn" : "default-regular-btn"} ${watchAllFields.animationType === "none" && ''} ${watchAllFields.animationType === "shake-side" && `animation-shake-side`} ${watchAllFields.animationType === "shake-up" && `animation-shake-up`} ${watchAllFields.animationType === "rotate" && `animation-rotate`} ${watchAllFields.animationType === "fade-in" && `animation-fade_in `} ${watchAllFields.animationType === "fade-out" && `animation-fade_out`}`}> <div className={`chooseicon ${data !== "" ? 'whiteIcon' : 'btnIcon'} ${wishlistBtn === 2 ? (watchAllFields.iconType === "heart" ? `heartICON2` : watchAllFields.iconType === "star" ? `starICON2` : watchAllFields.iconType === "save" ? `saveICON2` : "") : (watchAllFields.iconType === "heart" ? `heartICON` : watchAllFields.iconType === "star" ? `starICON` : watchAllFields.iconType === "save" ? `saveICON` : "")}`}></div>{wishlistBtn == 2 ? `${myLanguage.alreadyAdded}` : `${myLanguage.buttonText}`}</div>
    };

    function textFxn() {
        return <div style={{ backgroundColor: "transparent", border: "none" }} className={`${wishlistBtn == 2 ? "default-active-btn" : "default-regular-btn"} ${watchAllFields.animationType === "none" && ''} ${watchAllFields.animationType === "shake-side" && `text-button-main`} ${watchAllFields.animationType === "shake-up" && `text-button-main-up`} ${watchAllFields.animationType === "rotate" && `text-button-main-ripple`} ${watchAllFields.animationType === "fade-in" && `text-button-main-fade_in`} ${watchAllFields.animationType === "fade-out" && `text-button-main-fade_out`}`}>{wishlistBtn == 2 ? `${myLanguage.alreadyAdded}` : `${myLanguage.buttonText}`}{watchAllFields.showCount !== "no" ? <div id='wf-count-demo'>12</div> : ""}</div>
    };

    function iconTextFxn(data) {
        return <div style={{ backgroundColor: "transparent", border: "none" }} className={`${wishlistBtn == 2 ? "default-active-btn" : "default-regular-btn"} ${watchAllFields.animationType === "none" && ''} ${watchAllFields.animationType === "shake-side" && `animation-shake-side`} ${watchAllFields.animationType === "shake-up" && `animation-shake-up`} ${watchAllFields.animationType === "rotate" && `animation-rotate`} ${watchAllFields.animationType === "fade-in" && `animation-fade_in `} ${watchAllFields.animationType === "fade-out" && `animation-fade_out`}`}> <div className={`chooseicon ${data !== "" ? 'blackIcon' : 'btnIcon'} ${wishlistBtn === 2 ? (watchAllFields.iconType === "heart" ? `heartICON2` : watchAllFields.iconType === "star" ? `starICON2` : watchAllFields.iconType === "save" ? `saveICON2` : "") : (watchAllFields.iconType === "heart" ? `heartICON` : watchAllFields.iconType === "star" ? `starICON` : watchAllFields.iconType === "save" ? `saveICON` : "")}`}></div>{wishlistBtn == 2 ? `${myLanguage.alreadyAdded}` : `${myLanguage.buttonText}`}{watchAllFields.showCount !== "no" ? <div id='wf-count-demo'>12</div> : ""}</div>
    };

    function iconFxn(data) {
        return <div className={`${data !== "" ? 'staticIconDiv' : 'iconDiv'}`}><div className={`chooseicon ${data !== "" ? 'staticIcon' : 'btnIconAlone'} ${wishlistBtn === 2 ? (watchAllFields.iconType === "heart" ? `heartICON2` : watchAllFields.iconType === "star" ? `starICON2` : watchAllFields.iconType === "save" ? `saveICON2` : "") : (watchAllFields.iconType === "heart" ? `heartICON` : watchAllFields.iconType === "star" ? `starICON` : watchAllFields.iconType === "save" ? `saveICON` : "")} ${watchAllFields.animationType === "none" && ""} ${watchAllFields.animationType === "shake-side" && `icon-shake-side`} ${watchAllFields.animationType === "shake-up" && `icon-shake-up`} ${watchAllFields.animationType === "rotate" && `icon-rotate`} ${watchAllFields.animationType === "fade-in" && `icon-fade_in`} ${watchAllFields.animationType === "fade-out" && `icon-fade_out`}`}></div></div>
    };

    const selectedBtn = {
        textButtonFxn: textButtonFxn,
        iconTextButtonFxn: iconTextButtonFxn,
        textFxn: textFxn,
        iconTextFxn: iconTextFxn,
        iconFxn: iconFxn
    }

    const wishlistBtnArr = [
        {
            content: myLanguage.regular,
            data: <CustomStyle reset={reset} isloading={isloading} Controller={Controller} control={control} hoverOption={true} formName="" setSaveBar={setSaveBar} watchAllFields={watchAllFields} myLanguage={myLanguage} showCount={watchAllFields.showCount} aloneIcon={aloneIcon} showWidth={true} onlyTextButton={onlyTextButton} />,
            id: 'regular-1',
        },
        {
            content: myLanguage.hover,
            data: <CustomHoverSetting Controller={Controller} control={control} setSaveBar={setSaveBar} watchAllFields={watchAllFields} formName={""} myLanguage={myLanguage} aloneIcon={aloneIcon} onlyTextButton={onlyTextButton} />,
            id: 'hover-2',
        },
        {
            content: myLanguage.active,
            data: <CustomActive Controller={Controller} control={control} setSaveBar={setSaveBar} watchAllFields={watchAllFields} formName={"activeBtn"} myLanguage={myLanguage} aloneIcon={aloneIcon} onlyTextButton={onlyTextButton} />,
            id: 'active-3',
        },
    ];


    const wishlistBtnHandler = useCallback(
        (selectedTabIndex) => {
            setWishlistBtn(selectedTabIndex)
        },
        []
    );

    const saveToMetafield = async (data) => {
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });

        const getAppMetafieldId = await appMetafield.getAppMetafieldId();


        let mergedButttonSettingData = { ...existingButtonSettingData.current };

        mergedButttonSettingData.wishlistButtonCheck = true;
        mergedButttonSettingData.type = data.buttonTypeRadio;
        mergedButttonSettingData.iconColor = { filterColor: iconColor.color, color: data.iconColor };
        mergedButttonSettingData.iconType = data.iconType;
        mergedButttonSettingData.animationType = data.animationType;
        mergedButttonSettingData.bgColor = data.bgColor;
        mergedButttonSettingData.textColor = data.textColor;
        mergedButttonSettingData.fontSize = { value: data.fontSize, unit: data.fontSizeUnit };
        mergedButttonSettingData.buttonTypeRadio = data.buttonTypeRadio;
        mergedButttonSettingData.fontFamily = data.fontFamily;
        mergedButttonSettingData.fontWeight = data.fontWeight;
        mergedButttonSettingData.borderRadius = {
            value: data.borderRadius,
            unit: data.borderRadiusUnit
        };
        mergedButttonSettingData.paddingTopBottom = {
            value: data.paddingTopBottom,
            unit: data.paddingTopBottomUnit
        };
        mergedButttonSettingData.paddingLeftRight = {
            value: data.paddingLeftRight,
            unit: data.paddingLeftRightUnit
        };
        mergedButttonSettingData.marginTopBottom = {
            value: data.marginTopBottom,
            unit: data.marginTopBottomUnit,

        };
        mergedButttonSettingData.marginLeftRight = {
            value: data.marginLeftRight,
            unit: data.marginLeftRightUnit,

        };
        mergedButttonSettingData.activeBtn = {
            bgColor: data.activeBtnbgColor,
            textColor: data.activeBtntextColor,
            iconColor: { filterColor: activeBtniconColor.color, color: data.activeBtniconColor },
            border: {
                value: data.activeBtnborderInput,
                unit: data.activeBtnborderInputUnit,
                type: data.activeBtnborderType,
                color: data.activeBtnborderColor
            },
            // fontSize: {
            //     value: data.activeBtnfontSize,
            //     unit: data.activeBtnfontSizeUnit
            // }

        };

        mergedButttonSettingData.width = { value: data.widthValue, unit: data.widthUnit };
        mergedButttonSettingData.border = {
            value: data.borderInput,
            unit: data.borderInputUnit,
            type: data.borderType,
            color: data.borderColor
        };
        mergedButttonSettingData.textAlign = data.textAlign;
        mergedButttonSettingData.hover = {
            hoverValue: data.hover,
            bgColor: data.hoverBgColor,
            textColor: data.hoverTextColor,
            // iconColor: iconColorHover.color,
            iconColor: { filterColor: iconColorHover.color, color: data.hovericonColor },
            border: {
                value: data.hoverBorderInput,
                unit: data.hoverBorderInputUnit,
                type: data.hoverBorderType,
                color: data.hoverBorderColor
            },
        };
        mergedButttonSettingData.iconSize = data.iconSize;
        mergedButttonSettingData.iconPosition = data.iconPosition;

        mergedButttonSettingData.iconSizeValue = iconSizeValue;

        mergedButttonSettingData.showCount = data.showCount;

        mergedButttonSettingData.pdpIconOnImage = {
            icon: data.pdpIcon,
            position: data.pdpIconPosition
        };
        mergedButttonSettingData.iconBesideTitle = data.iconBesideTitle;
        mergedButttonSettingData.iconBesideAddToCart = data.iconBesideAddToCart;

        const appMetadata = {
            key: "wishlist-button-setting",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: JSON.stringify(mergedButttonSettingData)
        };

        await appMetafield.createAppMetafield(appMetadata).then(async (res) => {
            if (data.iconType !== collectionData.current.checkIconType) {
                let datataaa = await collectionIcon(data.iconType, collectionData.current);
                const appMetadatas = {
                    key: "collection-setting",
                    namespace: "wishlist-app",
                    ownerId: getAppMetafieldId,
                    type: "single_line_text_field",
                    value: JSON.stringify(datataaa)
                };
                await appMetafield.autoCreateAppMetafield(appMetadatas)

            }

            Swal.fire({
                icon: "success",
                title: myLanguage.swalHeading,
                text: myLanguage.swalText,
                confirmButtonText: myLanguage.swalOk
            });
            setSaveBar(false)
        });
    };

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



    function renderColor(data) {
        if (data === "onlyTextButton") {
            if (watchAllFields.activeBtntextColor === "#FFFFFF") {
                setValue('activeBtntextColor', "#000000");
            }
            if (watchAllFields.textColor === "#FFFFFF") {
                setValue('textColor', "#000000");
            }
            if (watchAllFields.activeBtniconColor === "#FFFFFF") {
                setValue('activeBtniconColor', "#000000");
            }
            if (watchAllFields.iconColor === "#FFFFFF") {
                setValue('iconColor', "#000000");
            }
        } else {
            if (watchAllFields.activeBtntextColor === "#000000") {
                setValue('activeBtntextColor', "#FFFFFF");
            }
            if (watchAllFields.textColor === "#000000") {
                setValue('textColor', "#FFFFFF");
            }
            if (watchAllFields.activeBtniconColor === "#000000") {
                setValue('activeBtniconColor', "#FFFFFF");
            }
            if (watchAllFields.iconColor === "#000000") {
                setValue('iconColor', "#FFFFFF");
            }
        }
    }


    async function collectionIcon(iconType, collectionData) {
        let addCollectionIconType;
        if (collectionData.collectionIconType === "heartBlank") {
            if (iconType === "star") {
                addCollectionIconType = "starBlank";
            } else if (iconType === "save") {
                addCollectionIconType = "saveBlank";
            }
        } else if (collectionData.collectionIconType === "heartSolid") {
            if (iconType === "star") {
                addCollectionIconType = "starSolid";
            } else if (iconType === "save") {
                addCollectionIconType = "saveSolid";
            }
        } else if (collectionData.collectionIconType === "heartOutlineBlank") {
            if (iconType === "star") {
                addCollectionIconType = "starOutlineBlank";
            } else if (iconType === "save") {
                addCollectionIconType = "saveOutlineBlank";
            }
        } else if (collectionData.collectionIconType === "heartOutlineSolid") {
            if (iconType === "star") {
                addCollectionIconType = "starOutlineSolid";
            } else if (iconType === "save") {
                addCollectionIconType = "saveOutlineSolid";
            }
        }


        //NEW ICON ADDED
        else if (collectionData.collectionIconType === "comboHeart") {
            if (iconType === "star") {
                addCollectionIconType = "comboStar";
            } else if (iconType === "save") {
                addCollectionIconType = "comboSave";
            }
        }


        else if (collectionData.collectionIconType === "starBlank") {
            if (iconType === "heart") {
                addCollectionIconType = "heartBlank";
            } else if (iconType === "save") {
                addCollectionIconType = "saveBlank";
            }
        } else if (collectionData.collectionIconType === "starSolid") {
            if (iconType === "heart") {
                addCollectionIconType = "heartSolid";
            } else if (iconType === "save") {
                addCollectionIconType = "saveSolid";
            }
        } else if (collectionData.collectionIconType === "starOutlineBlank") {
            if (iconType === "heart") {
                addCollectionIconType = "heartOutlineBlank";
            } else if (iconType === "save") {
                addCollectionIconType = "saveOutlineBlank";
            }
        } else if (collectionData.collectionIconType === "starOutlineSolid") {
            if (iconType === "heart") {
                addCollectionIconType = "heartOutlineSolid";
            } else if (iconType === "save") {
                addCollectionIconType = "saveOutlineSolid";
            }
        }


        //NEW ICON ADDED
        else if (collectionData.collectionIconType === "comboStar") {
            if (iconType === "heart") {
                addCollectionIconType = "comboHeart";
            } else if (iconType === "save") {
                addCollectionIconType = "comboSave";
            }
        }


        else if (collectionData.collectionIconType === "saveBlank") {
            if (iconType === "heart") {
                addCollectionIconType = "heartBlank";
            } else if (iconType === "star") {
                addCollectionIconType = "starBlank";
            }
        } else if (collectionData.collectionIconType === "saveSolid") {
            if (iconType === "heart") {
                addCollectionIconType = "heartSolid";
            } else if (iconType === "star") {
                addCollectionIconType = "starSolid";
            }
        } else if (collectionData.collectionIconType === "saveOutlineSolid") {
            if (iconType === "heart") {
                addCollectionIconType = "heartOutlineSolid";
            } else if (iconType === "star") {
                addCollectionIconType = "starOutlineSolid";
            }
        }
        else if (collectionData.collectionIconType === "saveOutlineBlank") {
            if (iconType === "heart") {
                addCollectionIconType = "heartOutlineBlank";
            } else if (iconType === "star") {
                addCollectionIconType = "starOutlineBlank";
            }
        }

        //NEW ICON ADDED
        else if (collectionData.collectionIconType === "comboSave") {
            if (iconType === "heart") {
                addCollectionIconType = "comboHeart";
            } else if (iconType === "star") {
                addCollectionIconType = "comboStar";
            }
        }

        else {
            if (iconType === "star") {
                addCollectionIconType = "starOutlineBlank";
            } else if (iconType === "save") {
                addCollectionIconType = "saveOutlineBlank";
            } else {
                addCollectionIconType = "heartOutlineBlank";
            }
        }

        collectionData.collectionIconType = addCollectionIconType
        collectionData.iconType = iconType
        return collectionData
    }


    return (
        <div dir={wishlistTextDirection} className='wf-dashboard wf-dashboard-buttonSetting'>
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    <form onSubmit={handleSubmit(saveToMetafield)}>
                        {(saveBar) ? <SaveBar save={myLanguage.save} /> : ""}
                        <Page fullWidth title={myLanguage.buttonSettingMainHeading} subtitle={myLanguage.buttonSettingMainText}>
                            <div className='wf-dashboard wf-dashboard-plane'>
                                <div className='note-div '>
                                    <span>{myLanguage.noteHeading} </span>
                                    <Text variant="headingXs" as="h2"> {myLanguage.buttonPageNoteText}</Text>
                                    <div style={{ backgroundColor: "transparent" }} className='wf-dashboard disable-app note-button-div '>
                                        <Button alignment="end" onClick={goToProductPage} >{myLanguage.buttonPageNoteButton}</Button>
                                    </div>
                                </div>
                            </div>



                            {/* Removed code here */}
                            <div className='wf-wishlist-preview'>
                                <div className='wf-wishprev-inner'>
                                    <div className='custom-margin'>
                                        <Text variant="headingMd" as="h2">{myLanguage.wishlistButtonHeading}</Text>
                                        <p>{myLanguage.wishlistButtonText}</p>
                                    </div>
                                    <AlphaCard>
                                        <div id="add-to-wishlist-section">

                                            <div className='buttonsGrid'>

                                                <div className='demoCardColored'>
                                                    <SingleFieldController name="buttonTypeRadio" control={control}  >
                                                        {({ field }) => <RadioButton label={textButtonFxn()}
                                                            value={field.value} id="text-button" checked={field.value === "text-button" && true} onChange={() => {
                                                                field.onChange("text-button"),
                                                                    setSaveBar(true);
                                                                setAloneIcon(false)
                                                                renderColor("bgButton")
                                                            }} />}
                                                    </SingleFieldController>
                                                    <div style={{ paddingLeft: "30px", marginTop: "4px" }}>
                                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                                            {myLanguage.btnType1}                                                      </div>
                                                    </div>
                                                </div>

                                                <div className='demoCardNonColored'>
                                                    <SingleFieldController name="buttonTypeRadio" control={control}  >
                                                        {({ field }) => <RadioButton label={textFxn()}
                                                            value={field.value} id="text" checked={field.value === "text" && true} onChange={() => {
                                                                field.onChange("text"),
                                                                    setSaveBar(true);
                                                                setAloneIcon(false)
                                                                renderColor("onlyTextButton")
                                                            }} />}
                                                    </SingleFieldController>
                                                    <div style={{ paddingLeft: "30px", marginTop: "4px" }}>
                                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                                            {myLanguage.btnType2}                                                      </div>
                                                    </div>
                                                </div>

                                                <div className='demoCardColored'>
                                                    <SingleFieldController name="buttonTypeRadio" control={control}  >
                                                        {({ field }) => <RadioButton label={iconTextButtonFxn("icon")}
                                                            value={field.value} id="icon-text-button" checked={field.value === "icon-text-button"} onChange={() => { field.onChange("icon-text-button"), setSaveBar(true), setAloneIcon(false), renderColor("bgButton") }}
                                                        />}
                                                    </SingleFieldController>
                                                    <div style={{ paddingLeft: "30px", marginTop: "4px" }}>
                                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                                            {myLanguage.btnType3}                                                     </div>
                                                    </div>
                                                </div>

                                                <div className='demoCardNonColored'>
                                                    <SingleFieldController name="buttonTypeRadio" control={control}  >
                                                        {({ field }) => <RadioButton
                                                            label={iconTextFxn("icon")}
                                                            value={field.value}
                                                            id="icon-text"
                                                            checked={field.value === "icon-text"}
                                                            onChange={() => {
                                                                field.onChange("icon-text");
                                                                setSaveBar(true);
                                                                setAloneIcon(false)
                                                                renderColor("onlyTextButton")
                                                            }}
                                                        />}
                                                    </SingleFieldController>
                                                    <div style={{ paddingLeft: "30px", marginTop: "4px" }}>
                                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                                            {myLanguage.btnType4}                                                     </div>
                                                    </div>
                                                </div>

                                                <div className='demoCardAloneIcon'>
                                                    <SingleFieldController name="buttonTypeRadio" control={control}  >
                                                        {({ field }) => <RadioButton label={iconFxn("icon")}
                                                            value={field.value} id="icon" checked={field.value === "icon" ? true : false} onChange={() => { field.onChange("icon"), setSaveBar(true), setAloneIcon(true), renderColor("bgButton") }}
                                                        />}
                                                    </SingleFieldController>
                                                    <div style={{ paddingLeft: "30px", marginTop: "4px" }}>
                                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                                            {myLanguage.btnType5}                                                     </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Grid>
                                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>

                                                    <Text variant="headingXs" as="h4"> {myLanguage.pickIconColorHeading}</Text>

                                                    <div className='custom-range-input' style={{ gap: "30%" }}>
                                                        {/* dfsdfsdf */}
                                                        <SingleFieldController name="iconType" control={control}  >
                                                            {({ field }) => <RadioButton label={<div className='chooseicon2 heartICON'></div>}
                                                                value={field.value} id="heart" checked={field.value === "heart" ? true : false} onChange={() => { field.onChange("heart"), setSaveBar(true) }}
                                                            />}
                                                        </SingleFieldController>
                                                        <SingleFieldController name="iconType" control={control}  >
                                                            {({ field }) => <RadioButton label={<div className='chooseicon2 starICON'></div>}
                                                                value={field.value} id="star" checked={field.value === "star" ? true : false} onChange={() => { field.onChange("star"), setSaveBar(true) }}
                                                            />}
                                                        </SingleFieldController>
                                                        <SingleFieldController name="iconType" control={control}  >
                                                            {({ field }) => <RadioButton label={<div className='chooseicon2 saveICON'> </div>}
                                                                value={field.value} id="save" checked={field.value === "save" ? true : false} onChange={() => { field.onChange("save"), setSaveBar(true) }}
                                                            />}
                                                        </SingleFieldController>
                                                    </div>
                                                </Grid.Cell>
                                            </Grid>

                                            <br />

                                            {/* <Grid className="pdpSettings"> */}
                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                <Text variant="headingXs" as="h4" >{myLanguage.pickAnimationHeading} </Text>
                                                <SingleFieldController name="animationType" control={control}  >
                                                    {({ field }) => <Select
                                                        options={animationBtn}
                                                        onChange={(value) => { field.onChange(value), setSaveBar(true) }}
                                                        value={field.value}
                                                    />}
                                                </SingleFieldController>
                                            </Grid.Cell>
                                            <br />

                                            <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`}>

                                                {/* Display Wishlist icon on Product detail page image */}
                                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                    <Text variant="headingXs" as="h4">{myLanguage.pdpImageIconHeading}</Text>
                                                    <SingleFieldController name="pdpIcon" control={control}  >
                                                        {({ field }) => <Select
                                                            options={pdpIconPositionOptions}
                                                            onChange={(value) => { field.onChange(value), setSaveBar(true) }}
                                                            value={field.value}
                                                        />}
                                                    </SingleFieldController>

                                                    <Collapsible
                                                        open={watchAllFields.pdpIcon === 'yes' ? true : false}
                                                        id="basic-collapsible"
                                                        transition={{
                                                            duration: '500ms',
                                                            timingFunction: 'ease-in-out'
                                                        }}
                                                        expandOnPrint>
                                                        <div className="collection-select">
                                                            <SingleController name={`pdpIconPosition`} control={control} defaultValue={""} >
                                                                {({ field }) => (<Select
                                                                    options={options}
                                                                    value={field.value}
                                                                    label={myLanguage.iconPosition}
                                                                    onChange={(newValue) => {
                                                                        setSaveBar(true);
                                                                        field.onChange(newValue);
                                                                    }}
                                                                />)}
                                                            </SingleController>
                                                        </div>
                                                        <p>{myLanguage.pdpNoteForIconCustomization}  <Link to="/CollectionSetting">{myLanguage.collectionIconClickHere}</Link> </p>
                                                    </Collapsible>
                                                </Grid.Cell>
                                                {/* </Grid> */}
                                                <br />

                                                {/* <Grid> */}
                                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                    <Text variant="headingXs" as="h4">{myLanguage.pdpTitleIconHeading}</Text>
                                                    <SingleFieldController name="iconBesideTitle" control={control}  >
                                                        {({ field }) => <Select
                                                            options={options2}
                                                            onChange={(value) => { field.onChange(value), setSaveBar(true) }}
                                                            value={field.value}
                                                        />}
                                                    </SingleFieldController>

                                                    <Collapsible
                                                        open={watchAllFields?.iconBesideTitle === 'right' || watchAllFields?.iconBesideTitle === "left" ? true : false}
                                                        id="basic-collapsible"
                                                        transition={{
                                                            duration: '500ms',
                                                            timingFunction: 'ease-in-out'
                                                        }}
                                                        expandOnPrint>
                                                        <p>{myLanguage.pdpNoteForIconCustomization} <Link to="/CollectionSetting">{myLanguage.collectionIconClickHere}</Link> </p>
                                                    </Collapsible>
                                                </Grid.Cell>
                                                <br />


                                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                    <Text variant="headingXs" as="h4">{myLanguage.pdpAddToCartIconHeading}</Text>
                                                    <SingleFieldController name="iconBesideAddToCart" control={control}  >
                                                        {({ field }) => <Select
                                                            options={options3}
                                                            onChange={(value) => { field.onChange(value), setSaveBar(true) }}
                                                            value={field.value}
                                                        />}
                                                    </SingleFieldController>
                                                    <Collapsible
                                                        open={watchAllFields?.iconBesideAddToCart === 'right' || watchAllFields?.iconBesideAddToCart === "left" ? true : false}
                                                        id="basic-collapsible"
                                                        transition={{
                                                            duration: '500ms',
                                                            timingFunction: 'ease-in-out'
                                                        }}
                                                        expandOnPrint>
                                                        <p>{myLanguage.pdpNoteForIconCustomization}  <Link to="/CollectionSetting">{myLanguage.collectionIconClickHere}</Link> </p>
                                                    </Collapsible>
                                                </Grid.Cell>
                                                {/* </Grid> */}
                                            </div>
                                        </div>

                                    </AlphaCard>
                                </div>

                                <div className='wf-wishprev-inner'>
                                    <AlphaCard>
                                        <DemoProduct watchAllFields={watchAllFields} selectedBtn={selectedBtn} myLanguage={myLanguage} />
                                    </AlphaCard>
                                </div>
                            </div>


                            <AlphaCard>
                                <div className='wf-style-wishbtn'>
                                    <div className='custom-margin'>
                                        <Text variant="headingMd" as="h2">{myLanguage.wbStyleHeading}</Text>
                                        <p>{myLanguage.wbStyleText}</p>
                                    </div>
                                    <Tabs tabs={wishlistBtnArr} selected={wishlistBtn} onSelect={wishlistBtnHandler} fitted>
                                        <LegacyCard.Section >
                                            {wishlistBtnArr[wishlistBtn].data}
                                        </LegacyCard.Section>
                                    </Tabs>
                                </div>
                            </AlphaCard>


                            {/* SHOW COUNT */}
                            {/* <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                    <div className='wf-showCount-box'>
                                        <div className='custom-margin'>
                                            <Text variant="headingMd" as="h2">{myLanguage.showCounterHeading}</Text>
                                            <p>{myLanguage.showCounterSubHeading}</p>
                                        </div>
                                        {currentPlan >= 2 &&
                                            <div className='wf-dashboard-yes-no-toggle'>
                                                <div className='toggle-paid-inner'>
                                                    <label id='countYes' className={`${watchAllFields.showCount === "yes" ? "activeToggle" : ""}`}>
                                                        {myLanguage.styleHoverYes}
                                                        <SingleFieldController
                                                            name="showCount"
                                                            control={control}>
                                                            {({ field }) =>
                                                                <RadioButton
                                                                    value={field.value}
                                                                    checked={field.value === "yes" && true}
                                                                    onChange={() => {
                                                                        field.onChange("yes"),
                                                                            setSaveBar(true);
                                                                    }}
                                                                />
                                                            }
                                                        </SingleFieldController>
                                                    </label>

                                                    <label id='countNo' className={`${watchAllFields.showCount === "no" ? "activeToggle" : ""}`}>
                                                        {myLanguage.styleHoverNo}
                                                        <SingleFieldController
                                                            name="showCount"
                                                            control={control}>
                                                            {({ field }) =>
                                                                <RadioButton
                                                                    value={field.value}
                                                                    checked={field.value === "no" && true}
                                                                    onChange={() => {
                                                                        field.onChange("no"),
                                                                            setSaveBar(true);
                                                                    }}
                                                                />
                                                            }
                                                        </SingleFieldController>
                                                    </label>
                                                </div>
                                            </div>}
                                    </div>
                                </div>
                            </div> */}



                            {/* SHOW COUNT */}
                            <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                    {/* <div className='wf-showCount-box'> */}
                                    <div className='custom-margin'>
                                        <Text variant="headingMd" as="h2">{myLanguage.showCounterHeading}</Text>
                                        <p>{myLanguage.showCounterSubHeading}</p>
                                    </div>
                                    {currentPlan >= 2 &&
                                        <div className='custom-range-input'>
                                            <div className="first-icon">
                                                <SingleFieldController name="showCount" control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            value={field.value}
                                                            label={myLanguage.countBtnSetting1}
                                                            checked={field.value === "increaseNdecrease" && true}
                                                            onChange={() => {
                                                                field.onChange("increaseNdecrease"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>
                                            </div>
                                            <div className="first-icon">
                                                <SingleFieldController name="showCount" control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            value={field.value}
                                                            label={myLanguage.countBtnSetting2}
                                                            checked={field.value === "increaseNdisable" && true}
                                                            onChange={() => {
                                                                field.onChange("increaseNdisable"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>
                                            </div> <div className="first-icon">
                                                <SingleFieldController name="showCount" control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            value={field.value}
                                                            label={myLanguage.countBtnSetting3}
                                                            checked={field.value === "no" && true}
                                                            onChange={() => {
                                                                field.onChange("no"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>
                                            </div>
                                        </div>

                                    }
                                    {/* </div> */}
                                </div>
                            </div>



                            {/* <AlphaCard>
                                <div id="add-to-cart-section" className='wf-style-wishbtn'>
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
                            </AlphaCard> */}

                            {/* <br></br>
                            <br></br> */}




                            {/* 
                            <div className='for-pdp-upgrade'>
                                <div style={{ display: "flex", gap: "20px" }} className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >

                                    show wishlist icon on the product detail page image
                                    <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                        <div className='custom-margin'>
                                            <Text variant="headingMd" as="h2">{myLanguage.pdpImageIconHeading}</Text>
                                            <p>{myLanguage.pdpImageIconSubHeading}</p>
                                        </div>
                                        {currentPlan >= 2 &&
                                            <div>
                                                <div className="first-icon">
                                                    <div>
                                                        <SingleController name="pdpIcon" control={control}  >
                                                            {({ field }) => <RadioButton label={myLanguage.styleHoverYes}
                                                                value={field.value} id="yes" checked={field.value === "yes" ? true : false} onChange={() => { field.onChange("yes"), setSaveBar(true) }}
                                                            />}
                                                        </SingleController>
                                                    </div>
                                                </div>
                                                <div className="first-icon">
                                                    <div>
                                                        <SingleController name="pdpIcon" control={control}  >
                                                            {({ field }) => <RadioButton label={myLanguage.styleHoverNo}
                                                                value={field.value} id="no" checked={field.value === "no" ? true : false} onChange={() => { field.onChange("no"), setSaveBar(true) }}
                                                            />}
                                                        </SingleController>
                                                    </div>
                                                </div>
                                            </div>


                                        }

                                        <Collapsible
                                            open={watchAllFields.pdpIcon === 'yes' ? true : false}
                                            id="basic-collapsible"
                                            transition={{
                                                duration: '500ms',
                                                timingFunction: 'ease-in-out'
                                            }}
                                            expandOnPrint>
                                            <div className="collection-select">
                                                <SingleController name={`pdpIconPosition`} control={control} defaultValue={""} >
                                                    {({ field }) => (<Select
                                                        options={options}
                                                        value={field.value}
                                                        label={myLanguage.iconPosition}
                                                        onChange={(newValue) => {
                                                            setSaveBar(true);
                                                            field.onChange(newValue);
                                                        }}
                                                    />)}
                                                </SingleController>
                                            </div>
                                            <p>{myLanguage.pdpNoteForIconCustomization}  <Link to="/CollectionSetting">{myLanguage.collectionIconClickHere}</Link> </p>
                                        </Collapsible>
                                    </div>


                                    addding option of icon at the title 
                                    <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                        <div className='custom-margin'>
                                            <Text variant="headingMd" as="h2">{myLanguage.pdpTitleIconHeading}</Text>
                                            <p>{myLanguage.pdpImageIconSubHeading}</p>
                                        </div>
                                        {currentPlan >= 2 &&
                                            <div>
                                                <div className="first-icon">
                                                    <SingleFieldController name="iconBesideTitle" control={control}  >
                                                        {({ field }) =>
                                                            <RadioButton
                                                                value={field.value}
                                                                label={myLanguage.pdpLeftSideOfTitle}
                                                                checked={field.value === "left" && true}
                                                                onChange={() => {
                                                                    field.onChange("left"),
                                                                        setSaveBar(true);
                                                                }}
                                                            />
                                                        }
                                                    </SingleFieldController>
                                                </div>
                                                <div className="first-icon">
                                                    <SingleFieldController name="iconBesideTitle" control={control}  >
                                                        {({ field }) =>
                                                            <RadioButton
                                                                value={field.value}
                                                                label={myLanguage.pdpRightSideOfTitle}
                                                                checked={field.value === "right" && true}
                                                                onChange={() => {
                                                                    field.onChange("right"),
                                                                        setSaveBar(true);
                                                                }}
                                                            />
                                                        }
                                                    </SingleFieldController>
                                                </div> <div className="first-icon">
                                                    <SingleFieldController name="iconBesideTitle" control={control}  >
                                                        {({ field }) =>
                                                            <RadioButton
                                                                value={field.value}
                                                                label={myLanguage.countBtnSetting3}
                                                                checked={field.value === "no" && true}
                                                                onChange={() => {
                                                                    field.onChange("no"),
                                                                        setSaveBar(true);
                                                                }}
                                                            />
                                                        }
                                                    </SingleFieldController>
                                                </div>
                                            </div>}

                                        <Collapsible
                                            open={watchAllFields?.iconBesideTitle === 'right' || watchAllFields?.iconBesideTitle === "left" ? true : false}
                                            id="basic-collapsible"
                                            transition={{
                                                duration: '500ms',
                                                timingFunction: 'ease-in-out'
                                            }}
                                            expandOnPrint>
                                            <p>{myLanguage.pdpNoteForIconCustomization} <Link to="/CollectionSetting">{myLanguage.collectionIconClickHere}</Link> </p>
                                        </Collapsible>
                                    </div>


                                    show icon beside Add to Cart button- 
                                    <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                        <div className='custom-margin'>
                                            <Text variant="headingMd" as="h2">{myLanguage.pdpAddToCartIconHeading}</Text>
                                            <p>{myLanguage.pdpImageIconSubHeading}</p>
                                        </div>
                                        {currentPlan >= 2 &&
                                            <div>
                                                <div className="first-icon">
                                                    <SingleFieldController name="iconBesideAddToCart" control={control}  >
                                                        {({ field }) =>
                                                            <RadioButton
                                                                value={field.value}
                                                                label={myLanguage.pdpAddToCartLeft}
                                                                checked={field.value === "left" && true}
                                                                onChange={() => {
                                                                    field.onChange("left"),
                                                                        setSaveBar(true);
                                                                }}
                                                            />
                                                        }
                                                    </SingleFieldController>
                                                </div>
                                                <div className="first-icon">
                                                    <SingleFieldController name="iconBesideAddToCart" control={control}  >
                                                        {({ field }) =>
                                                            <RadioButton
                                                                value={field.value}
                                                                label={myLanguage.pdpAddToCartRight}
                                                                checked={field.value === "right" && true}
                                                                onChange={() => {
                                                                    field.onChange("right"),
                                                                        setSaveBar(true);
                                                                }}
                                                            />
                                                        }
                                                    </SingleFieldController>
                                                </div> <div className="first-icon">
                                                    <SingleFieldController name="iconBesideAddToCart" control={control}  >
                                                        {({ field }) =>
                                                            <RadioButton
                                                                value={field.value}
                                                                label={myLanguage.countBtnSetting3}
                                                                checked={field.value === "no" && true}
                                                                onChange={() => {
                                                                    field.onChange("no"),
                                                                        setSaveBar(true);
                                                                }}
                                                            />
                                                        }
                                                    </SingleFieldController>
                                                </div>
                                            </div>
                                        }

                                        <Collapsible
                                            open={watchAllFields?.iconBesideAddToCart === 'right' || watchAllFields?.iconBesideAddToCart === "left" ? true : false}
                                            id="basic-collapsible"
                                            transition={{
                                                duration: '500ms',
                                                timingFunction: 'ease-in-out'
                                            }}
                                            expandOnPrint>
                                            <p>{myLanguage.pdpNoteForIconCustomization}  <Link to="/CollectionSetting">{myLanguage.collectionIconClickHere}</Link> </p>
                                        </Collapsible>

                                    </div>

                                </div>
                            </div> */}






                            <div style={{ marginTop: "40px" }}>
                                <Footer myLanguage={myLanguage} />
                            </div>
                        </Page>
                    </form>
                </Frame>
            }
        </div>
    )
}

export default ButtonSetting
