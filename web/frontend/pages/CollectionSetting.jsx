import { useForm, Controller, useWatch } from "react-hook-form";
import { AlphaCard, Toast, Grid, Page, Text, Checkbox, Select, RadioButton, Frame, Icon, TextField, Collapsible } from '@shopify/polaris'
import React, { useEffect, useMemo, useCallback } from 'react'
import useAppMetafield from '../hooks/useAppMetafield';
import useUtilityFunction from '../hooks/useUtilityFunction';
import SaveBar from './SaveBar';
import SkeletonPage1 from './SkeletonPage1';
import Swal from 'sweetalert2';
import loaderGif from "./loaderGreen.gif";
import useSwal from '../hooks/useSwal';
import { useState } from "react";
import SingleController from "../hooks/useSingleFieldController";
import ColorPickerController from "../hooks/useColorPickerController";
import CssFilterConverter from "css-filter-converter";
import heartBlank from '../assets/heart_empty_.svg'
import heartSolid from '../assets/heart_fill_.svg'
import heartOutlineBlank from '../assets/heart_empty_outline.svg'
import heartOutlineSolid from '../assets/heart_fill_outline.svg'
import saveBlank from '../assets/saveBlank.svg'
import saveSolid from '../assets/saveSolid.svg'
import saveOutlineBlank from '../assets/saveOutlineBlank.svg'
import saveOutlineSolid from '../assets/saveOutlineSolid.svg'
import saveOutlineSolid11 from '../assets/saveOutlineSolid.svg'
import starBlank from '../assets/starBlank.svg'
import starSolid from '../assets/starSolid.svg'
import starOutlineBlank from '../assets/starOutlineBlank.svg'
import starOutlineSolid from '../assets/starOutlineSolid.svg'
import collectionCopyIcon from '../assets/copy-icon.svg'
import Footer from "./Footer";
import { useAuthenticatedFetch } from "../hooks";
import { Link } from "react-router-dom";


const CollectionSetting = () => {

    // const fetch2 = useAuthenticatedFetch();

    let iconDefaultColorWatch;
    let iconSelectedColorWatch;
    const utilityFunction = useUtilityFunction();
    const [myLanguage, setMyLanguage] = useState({});
    const swal = useSwal();
    const { register, handleSubmit, watch, reset, control, setValue, formState: { errors } } = useForm();
    const appMetafield = useAppMetafield();
    const [currentPlan, setCurrentPlan] = useState(0);
    const [saveBar, setSaveBar] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const [checkIconStyle, setCheckIconStyle] = useState("")
    const [wishlistTextDirection, setWishlistTextDirection] = useState("");
    const [checkRadio, setcheckRadio] = useState(false);
    const watchAllFields = watch();

    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const toastMarkup = active ? (
        <Toast content="Copied" onDismiss={toggleActive} />
    ) : null;

    const options = [
        { value: "icon-top-left", label: myLanguage.cpRadio1 },
        { value: "icon-top-right", label: myLanguage.cpRadio2 },
        { value: "icon-bottom-left", label: myLanguage.cpRadio3 },
        { value: "icon-bottom-right", label: myLanguage.cpRadio4 }
    ];

    const iconSizeOptions = [
        { value: "extraSmall", label: myLanguage.extraSmall },
        { value: "small", label: myLanguage.small },
        { value: "medium", label: myLanguage.medium },
        { value: "large", label: myLanguage.large },
    ]

    const convertColor = (color) => {
        if (/^#[0-9A-F]{6}$/i.test(color)) {
            return CssFilterConverter.hexToFilter(color);
        } else if (/^rgb\(\d+,\s*\d+,\s*\d+\)$/i.test(color)) {
            return CssFilterConverter.hexToFilter(color);
        } else {
            return CssFilterConverter.keywordToFilter(color);
        }
    };

    useMemo(async () => {
        iconDefaultColorWatch = await convertColor(watchAllFields.iconDefaultColor);
        iconSelectedColorWatch = await convertColor(watchAllFields.iconSelectedColor);
    }, [watchAllFields])

    useMemo(() => {
        if (watchAllFields.quickViewShowAs === "icon") {
            setValue('isQuickViewShowOptionImage', 'on-image')

            setValue('quickViewShowOptionImage', "icon-top-left");
            // console.log("watchAllFields.isQuickViewShowOptionTitle", watchAllFields.isQuickViewShowOptionTitle);
            if (watchAllFields.isQuickViewShowOptionTitle) {
                setValue('quickViewShowOptionTitle', "title");

            }
            if (watchAllFields.isQuickViewShowOptionAddToCart) {
                setValue('quickViewShowOptionAddToCart', "icon-below");
                setValue('quickViewShowOptionAddToCartPosition', "center-icon-position");

            }

        } else if (watchAllFields.quickViewShowAs === "button") {
            setValue('quickViewShowOption', 'button-below')
            setValue('isQuickViewShowOptionTitle', false)
            setValue('isQuickViewShowOptionImage', false)
            setValue('isQuickViewShowOptionAddToCart', false)
        }
    }, [checkRadio])

    useEffect(() => {
        useEffectLite();
    }, []);

    async function useEffectLite() {
        const getCurrentPlan = await appMetafield.getCurrentPlan();
        setCurrentPlan(parseInt(getCurrentPlan.currentPlan));
        await getAllAppDataMetafields();
        await utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
            setIsLoading(true);
            utilityFunction.goToSectionFxn();
            let checkElement = document.querySelector(".dontRunAgain");
            if (checkElement === null) {
                utilityFunction.upgradeButtonFxn();
            }
        });
    }


    let iconStyle = ""

    const getAllAppDataMetafields = async () => {
        let collectionStyle = {}
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "collection-setting") {
                let bData = JSON.parse(dataArray[i].node.value);
                // console.log("dData", bData);

                let keysToAdd = [
                    { key: 'collectionType', value: 'iconType' },
                    { key: 'quickViewShowAs', value: 'icon' },
                    { key: 'isQuickViewShowOptionImage', value: 'on-image' },
                    { key: 'quickViewShowOptionImage', value: 'icon-top-left' }
                ];

                let checkExist = false
                keysToAdd.forEach(({ key, value }) => {
                    if (!(key in bData)) {
                        bData[key] = value;
                        // console.log("Not in this");
                        return checkExist = true
                    }
                });

                if (bData["collectionIconType"] === null || bData["collectionIconType"] === undefined || bData["collectionIconType"] === "") {
                    if (bData.iconType === "star") {
                        bData["collectionIconType"] = "starOutlineSolid";
                    } else if (bData.iconType === "save") {
                        bData["collectionIconType"] = "saveOutlineSolid";
                    } else {
                        bData["collectionIconType"] = "heartOutlineSolid";
                    }
                }


                if (!bData.collectionShowCount) {
                    bData.collectionShowCount = "no";
                    checkExist = true
                }

                checkExist && saveMetaFxn(bData)

                reset({
                    collectionIconType: bData.collectionIconType,

                    iconDefaultColor: bData?.iconDefaultColor?.color ? bData?.iconDefaultColor?.color : (await CssFilterConverter.filterToHex(bData.iconDefaultColor)).color,
                    iconSelectedColor: bData?.iconSelectedColor?.color ? bData?.iconSelectedColor?.color : (await CssFilterConverter.filterToHex(bData.iconSelectedColor)).color,


                    iconPosition: bData.iconPosition,
                    iconSize: bData.iconSize,
                    iconDefaultBgColor: bData.iconDefaultBgColor,
                    iconSelectedBgColor: bData.iconSelectedBgColor,
                    quickViewShowAs: bData.quickViewShowAs,
                    quickViewShowOption: bData.quickViewShowOption,
                    quickViewShowOptionImage: bData.quickViewShowOptionImage,
                    quickViewShowOptionTitle: bData.quickViewShowOptionTitle,
                    quickViewShowOptionAddToCart: bData.quickViewShowOptionAddToCart,
                    quickViewShowOptionAddToCartPosition: bData.quickViewShowOptionAddToCartPosition,
                    collectionType: bData.collectionType,


                    isQuickViewShowOptionImage: bData.isQuickViewShowOptionImage,
                    isQuickViewShowOptionTitle: bData.isQuickViewShowOptionTitle,
                    isQuickViewShowOptionAddToCart: bData.isQuickViewShowOptionAddToCart,

                    // collectionShowCount: bData?.collectionShowCount === "yes" && "increaseNdecrease" || "no"

                    collectionShowCount: bData?.collectionShowCount === "yes" ? "increaseNdecrease" || "no" : bData?.collectionShowCount,

                })
            }
            if (dataArray[i].node.key === "general-setting") {
                let dData = JSON.parse(dataArray[i].node.value);
                setWishlistTextDirection(dData.wishlistTextDirection);
            };
            if (dataArray[i].node.key === "wishlist-button-setting") {
                // utilityFunction.goToSectionFxn();
                // let checkElement = document.querySelector(".dontRunAgain");
                // if (checkElement === null) {
                //     utilityFunction.upgradeButtonFxn();
                // }
                let dData = JSON.parse(dataArray[i].node.value);
                iconStyle = dData.iconType
                setCheckIconStyle(dData.iconType)
            }

        }

    };

    async function saveMetaFxn(data) {
        const getAppMetafieldId = await appMetafield.getAppMetafieldId();
        const appMetadata = {
            key: "collection-setting",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: JSON.stringify(data)
        };
        await appMetafield.createAppMetafield(appMetadata)
    }

    // const getThemeName = async () => {
    //     try {
    //         const response = await fetch2(`/api/get-current-theme-name`);
    //         const result = await response.json();
    //         return result.data
    //     } catch (error) {
    //         console.error("Error:", error);
    //     }
    // };

    const saveToMetafield = async (data) => {
        Swal.fire({
            text: "Please wait for a while...",
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        let dataSubmit = {
            // iconDefaultColor: iconDefaultColorWatch.color,
            // iconSelectedColor: iconSelectedColorWatch.color,

            iconDefaultColor: { filterColor: iconDefaultColorWatch.color, color: data.iconDefaultColor },
            iconSelectedColor: { filterColor: iconSelectedColorWatch.color, color: data.iconSelectedColor },

            iconPosition: data.iconPosition,
            iconSize: data.iconSize,
            collectionIconType: data.collectionIconType,
            checkIconType: checkIconStyle,
            iconDefaultBgColor: data.iconDefaultBgColor,
            iconSelectedBgColor: data.iconSelectedBgColor,
            quickViewShowAs: data.quickViewShowAs,
            quickViewShowOption: data.quickViewShowOption,
            quickViewShowOptionImage: data.quickViewShowOptionImage,
            quickViewShowOptionTitle: data.quickViewShowOptionTitle,
            quickViewShowOptionAddToCart: data.quickViewShowOptionAddToCart,
            quickViewShowOptionAddToCartPosition: data.quickViewShowOptionAddToCartPosition,
            collectionType: data.collectionType,

            isQuickViewShowOptionImage: data.isQuickViewShowOptionImage,
            isQuickViewShowOptionTitle: data.isQuickViewShowOptionTitle,
            isQuickViewShowOptionAddToCart: data.isQuickViewShowOptionAddToCart,

            collectionShowCount: data.collectionShowCount
        };

        const getAppMetafieldId = await appMetafield.getAppMetafieldId();
        const appMetadata = {
            key: "collection-setting",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: JSON.stringify(dataSubmit)
        };
        await appMetafield.createAppMetafield(appMetadata).then(async (res) => {
            Swal.fire({
                icon: "success",
                title: myLanguage.swalHeading,
                text: myLanguage.swalText,
                confirmButtonText: myLanguage.swalOk
            });

            // const currentThemeName = await getThemeName();
            // const themeData = {
            //     key: "current-theme-name",
            //     namespace: "wishlist-app",
            //     ownerId: getAppMetafieldId,
            //     type: "single_line_text_field",
            //     value: JSON.stringify(currentThemeName)
            // }
            // appMetafield.createAppMetafield(themeData)

        });
        setSaveBar(false);
    };

    const textCopyHandler = (data) => {
        navigator.clipboard.writeText(data);
        toggleActive();
    };

    const collectionPageIcon = `<div class="wf-wishlist"  product-id="{{ product.id }}" product-handle="{{ product.handle }}" variant-id="{{ product.selected_or_first_available_variant.id }}"></div>`;
    const collectionPageButton = `<div class="wf-wishlist-button" product-id="{{ product.id }}" product-handle="{{ product.handle }}" variant-id="{{ product.selected_or_first_available_variant.id }}"></div>`;

    function renderWhichIcon() {
        const whichIcon = watchAllFields.collectionIconType === "comboHeart" || watchAllFields.collectionIconType === "comboStar" || watchAllFields.collectionIconType === "comboSave" || watchAllFields.collectionIconType === "heartBlank" || watchAllFields.collectionIconType === "heartSolid" || watchAllFields.collectionIconType === "starBlank" || watchAllFields.collectionIconType === "starSolid" || watchAllFields.collectionIconType === "saveBlank" || watchAllFields.collectionIconType === "saveSolid"

        const onlyFilledIcon = watchAllFields.collectionIconType === "comboHeart" || watchAllFields.collectionIconType === "comboStar" || watchAllFields.collectionIconType === "comboSave"

        return { whichIcon, onlyFilledIcon }
    }

    return (
        <div dir={wishlistTextDirection} className="wf-dashboard wf-collectionSetting">
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    <form onSubmit={handleSubmit(saveToMetafield)}>
                        {(saveBar) ? <SaveBar save={myLanguage.save} /> : ""}
                        <Page fullWidth title={myLanguage.collectionHeading} subtitle={myLanguage.collectionHeadingText}  >
                            <div className="wf-dashboard-box wf-style-wishbtn" >
                                <div className="wf-dashboard-box-inner">
                                    <div className="Polaris-Box wf-collection-IconBtn">
                                        {/* <div className="wf-collection-inner"> */}
                                        <div id='quick-add-icon-section' className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                            <Text variant="headingMd" as="h2">{myLanguage.collectionIconHeading1}</Text>
                                            <p style={{ marginBottom: "20px" }}>{myLanguage.collectionIconSubHeading1}</p>
                                            <div className="first-icon">
                                                <div>
                                                    <SingleController name="collectionType" control={control}  >
                                                        {({ field }) => <RadioButton label={myLanguage.collectionIconCollectionTypeAsIcon}
                                                            value={field.value} id="iconType" checked={field.value === "iconType" ? true : false} onChange={() => { field.onChange("iconType"), setSaveBar(true) }}
                                                        />}
                                                    </SingleController>
                                                </div>
                                            </div>
                                            <div className="first-icon">
                                                <div>
                                                    <SingleController name="collectionType" control={control}  >
                                                        {({ field }) => <RadioButton label={myLanguage.collectionIconCollectionTypeAsButton}
                                                            value={field.value} id="buttonType" checked={field.value === "buttonType" ? true : false} onChange={() => { field.onChange("buttonType"), setSaveBar(true) }}
                                                        />}
                                                    </SingleController>
                                                </div>

                                            </div>
                                        </div>

                                        <Collapsible
                                            open={watchAllFields.collectionType === 'iconType' ? true : false}
                                            id="basic-collapsible"
                                            transition={{
                                                duration: '500ms',
                                                timingFunction: 'ease-in-out'
                                            }}
                                            expandOnPrint
                                        >
                                            <p>{myLanguage.collectionIconAsIcon}</p>

                                        </Collapsible>


                                        <Collapsible
                                            open={watchAllFields.collectionType === 'buttonType' ? true : false}
                                            id="basic-collapsible"
                                            transition={{
                                                duration: '500ms',
                                                timingFunction: 'ease-in-out'
                                            }}
                                            expandOnPrint
                                        >
                                            <p>{myLanguage.collectionIconAsButton} <Link to="/ButtonSetting">{myLanguage.collectionIconClickHere}</Link></p>

                                        </Collapsible>

                                        {/* </div> */}
                                    </div>
                                </div>
                            </div>

                            <div className="wf-dashboard-box wf-style-wishbtn" style={{ marginBottom: "40px", marginTop: "40px" }}>
                                {/* <div id='quick-add-icon-section' className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                    <Text variant="headingMd" as="h2">{myLanguage.collectionHeading1}</Text>
                                    <p>{myLanguage.collectionHeadingText1}</p>
                                </div> */}



                                <div className="wf-dashboard-box-inner wf-pickWishlist-collection">
                                    <div className="Polaris-Box">
                                        <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"} `}  >
                                            {checkIconStyle === "heart" &&
                                                <AlphaCard>
                                                    <div id='quick-add-icon-section' style={{ marginBottom: "20px" }} >
                                                        <Text variant="headingMd" as="h2">{myLanguage.collectionIconHeading}</Text>
                                                        <p>{myLanguage.collectionIconHeading}</p>
                                                    </div>

                                                    <div className='custom-range-input '>
                                                        <div className="first-icon">
                                                            <div>
                                                                <SingleController name="collectionIconType" control={control}  >
                                                                    {({ field }) => <RadioButton
                                                                        label={<img className="chooseicon2" src={heartBlank} alt="Filled Heart" />}
                                                                        value={field.value} id="comboHeart" checked={field.value === "comboHeart" ? true : false} onChange={() => { field.onChange("comboHeart"), setSaveBar(true) }}
                                                                    />}
                                                                </SingleController>
                                                            </div>
                                                            <label htmlFor="comboHeart" className="less-visible">{myLanguage.filledIcon}</label>
                                                        </div>

                                                        <div className="first-icon">
                                                            <div>
                                                                <SingleController name="collectionIconType" control={control}  >
                                                                    {({ field }) => <RadioButton label={<img className="chooseicon2" alt="heartBlank" src={heartBlank} />}
                                                                        value={field.value} id="heartBlank" checked={field.value === "heartBlank" ? true : false} onChange={() => { field.onChange("heartBlank"), setSaveBar(true) }}
                                                                    />}
                                                                </SingleController>
                                                            </div>
                                                            <label className="less-visible" htmlFor="heartBlank">{myLanguage.iconOutline}</label>

                                                        </div>

                                                        <div className="first-icon">
                                                            <div>
                                                                <SingleController name="collectionIconType" control={control}  >
                                                                    {({ field }) => <RadioButton label={<img className="chooseicon2" src={heartSolid} alt="heartSolid" />}
                                                                        value={field.value} id="heartSolid" checked={field.value === "heartSolid" ? true : false} onChange={() => { field.onChange("heartSolid"), setSaveBar(true) }}
                                                                    />}
                                                                </SingleController>
                                                            </div>
                                                            <label className="less-visible" htmlFor="heartSolid">{myLanguage.iconSolid}</label>

                                                        </div>

                                                        <div className="first-icon">
                                                            <div>
                                                                <SingleController name="collectionIconType" control={control}  >
                                                                    {({ field }) => <RadioButton label={<img className="chooseicon2" src={heartOutlineBlank} alt="heartOutlineBlank" />}
                                                                        value={field.value} id="heartOutlineBlank" checked={field.value === "heartOutlineBlank" ? true : false} onChange={() => { field.onChange("heartOutlineBlank"), setSaveBar(true) }}
                                                                    />}
                                                                </SingleController>
                                                            </div>
                                                            <label className="less-visible" htmlFor="heartOutlineBlank">{myLanguage.circleiconOutline}</label>

                                                        </div>

                                                        <div className="first-icon">
                                                            <div>
                                                                <SingleController name="collectionIconType" control={control}  >
                                                                    {({ field }) => <RadioButton label={<img className="chooseicon2" src={heartOutlineSolid} alt="heartOutlineSolid" />}
                                                                        value={field.value} id="heartOutlineSolid" checked={field.value === "heartOutlineSolid" ? true : false} onChange={() => { field.onChange("heartOutlineSolid"), setSaveBar(true) }}
                                                                    />}
                                                                </SingleController>
                                                            </div>
                                                            <label className="less-visible" htmlFor="heartOutlineSolid">{myLanguage.circleiconSolid}</label>

                                                        </div>
                                                    </div>
                                                </AlphaCard>
                                            }


                                            {checkIconStyle === "star" &&
                                                <AlphaCard>
                                                    <div className="pb-10">
                                                        <Text variant="headingMd" as="h2">{myLanguage.collectionIconHeading}</Text>
                                                        <p>{myLanguage.collectionIconHeading}</p>
                                                    </div>
                                                    <div className='custom-range-input'>
                                                        <div className="first-icon">
                                                            <div>
                                                                <SingleController name="collectionIconType" control={control}  >
                                                                    {({ field }) => <RadioButton
                                                                        label={<img className="chooseicon2" src={starBlank} alt="Filled Star" />}
                                                                        value={field.value} id="comboStar" checked={field.value === "comboStar" ? true : false} onChange={() => { field.onChange("comboStar"), setSaveBar(true) }}
                                                                    />}
                                                                </SingleController>
                                                            </div>
                                                            <label htmlFor="comboStar" className="less-visible">{myLanguage.filledIcon}</label>
                                                        </div>

                                                        <div className="first-icon">
                                                            <div>
                                                                <SingleController name="collectionIconType" control={control}  >
                                                                    {({ field }) => <RadioButton label={<img className="chooseicon2" alt="starBlank" src={starBlank} />}
                                                                        value={field.value} id="starBlank" checked={field.value === "starBlank" ? true : false} onChange={() => { field.onChange("starBlank"), setSaveBar(true) }}
                                                                    />}
                                                                </SingleController>
                                                            </div>
                                                            <div className="less-visible">{myLanguage.iconOutline}</div>
                                                        </div>

                                                        <div className="first-icon">
                                                            <div>
                                                                <SingleController name="collectionIconType" control={control}  >
                                                                    {({ field }) => <RadioButton label={<img className="chooseicon2" src={starSolid} alt="starSolid" />}
                                                                        value={field.value} id="starSolid" checked={field.value === "starSolid" ? true : false} onChange={() => { field.onChange("starSolid"), setSaveBar(true) }}
                                                                    />}
                                                                </SingleController>
                                                            </div>
                                                            <div className="less-visible">{myLanguage.iconSolid}</div>
                                                        </div>

                                                        <div className="first-icon">
                                                            <div>
                                                                <SingleController name="collectionIconType" control={control}  >
                                                                    {({ field }) => <RadioButton label={<img className="chooseicon2" src={starOutlineBlank} alt="starOutlineBlank" />}
                                                                        value={field.value} id="starOutlineBlank" checked={field.value === "starOutlineBlank" ? true : false} onChange={() => { field.onChange("starOutlineBlank"), setSaveBar(true) }}
                                                                    />}
                                                                </SingleController>
                                                            </div>
                                                            <div className="less-visible">{myLanguage.circleiconOutline}</div>
                                                        </div>

                                                        <div className="first-icon">
                                                            <div>
                                                                <SingleController name="collectionIconType" control={control}  >
                                                                    {({ field }) => <RadioButton
                                                                        label={<img className="chooseicon2" src={starOutlineSolid} alt="starOutlineSolid" />}
                                                                        value={field.value} id="starOutlineSolid" checked={field.value === "starOutlineSolid" ? true : false} onChange={() => { field.onChange("starOutlineSolid"), setSaveBar(true) }}
                                                                    />}
                                                                </SingleController>
                                                            </div>
                                                            <div className="less-visible">{myLanguage.circleiconSolid}</div>
                                                        </div>
                                                    </div>
                                                </AlphaCard>
                                            }


                                            {checkIconStyle === "save" &&
                                                <AlphaCard>
                                                    <div className="pb-10">
                                                        <Text variant="headingMd" as="h2">{myLanguage.collectionIconHeading}</Text>
                                                        <p>{myLanguage.collectionIconHeading}</p>
                                                    </div>
                                                    <div className='custom-range-input'>
                                                        <div className="first-icon">
                                                            <div>
                                                                <SingleController name="collectionIconType" control={control}  >
                                                                    {({ field }) => <RadioButton
                                                                        label={<img className="chooseicon2" src={saveBlank} alt="Filled Save" />}
                                                                        value={field.value} id="comboSave" checked={field.value === "comboSave" ? true : false} onChange={() => { field.onChange("comboSave"), setSaveBar(true) }}
                                                                    />}
                                                                </SingleController>
                                                            </div>
                                                            <label htmlFor="comboSave" className="less-visible">{myLanguage.filledIcon}</label>
                                                        </div>

                                                        <div className="first-icon">
                                                            <div>
                                                                <SingleController name="collectionIconType" control={control}  >
                                                                    {({ field }) => <RadioButton label={<img className="chooseicon2" alt="saveBlank" src={saveBlank} />}
                                                                        value={field.value} id="saveBlank" checked={field.value === "saveBlank" ? true : false} onChange={() => { field.onChange("saveBlank"), setSaveBar(true) }}
                                                                    />}
                                                                </SingleController>
                                                            </div>
                                                            <div className="less-visible">{myLanguage.iconOutline}</div>
                                                        </div>

                                                        <div className="first-icon">
                                                            <div>
                                                                <SingleController name="collectionIconType" control={control}  >
                                                                    {({ field }) => <RadioButton label={<img className="chooseicon2" src={saveSolid} alt="saveSolid" />}
                                                                        value={field.value} id="saveSolid" checked={field.value === "saveSolid" ? true : false} onChange={() => { field.onChange("saveSolid"), setSaveBar(true) }}
                                                                    />}
                                                                </SingleController>
                                                            </div>
                                                            <div className="less-visible">{myLanguage.iconSolid}</div>
                                                        </div>

                                                        <div className="first-icon">
                                                            <div>
                                                                <SingleController name="collectionIconType" control={control}  >
                                                                    {({ field }) => <RadioButton label={
                                                                        <img className="chooseicon2" src={saveOutlineBlank} alt="saveOutlineBlank" />
                                                                        // "saveOutlineBlank"
                                                                    }
                                                                        value={field.value} id="saveOutlineBlank" checked={field.value === "saveOutlineBlank" ? true : false} onChange={() => { field.onChange("saveOutlineBlank"), setSaveBar(true) }}
                                                                    />}
                                                                </SingleController>
                                                            </div>
                                                            <div className="less-visible">{myLanguage.circleiconOutline}</div>
                                                        </div>

                                                        <div className="first-icon">
                                                            <div>
                                                                <SingleController name="collectionIconType" control={control}  >
                                                                    {({ field }) => <RadioButton
                                                                        label={<img className="chooseicon2" src={saveOutlineSolid} alt="saveOutlineSolid" />}
                                                                        value={field.value} id="saveOutlineSolid" checked={field.value === "saveOutlineSolid" ? true : false} onChange={() => { field.onChange("saveOutlineSolid"), setSaveBar(true) }}
                                                                    />}
                                                                </SingleController>
                                                            </div>
                                                            <div className="less-visible">{myLanguage.circleiconSolid}</div>
                                                        </div>
                                                    </div>
                                                </AlphaCard>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="wf-dashboard-box-inner">
                                    <div className="Polaris-Box">
                                        <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"} myColorPicker`} >
                                            <div className="endColorPicker " >
                                                <AlphaCard>
                                                    <Text variant="headingMd" as="h2">{myLanguage.collectionIconSettingHeading}</Text>


                                                    <div style={{ marginTop: "10px" }} className="wf-collection-IconSettion">

                                                        <div className="collection-select">
                                                            <SingleController name={`iconPosition`} control={control} defaultValue={""} >
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

                                                        <div className="collection-select">
                                                            <SingleController name={`iconSize`} control={control} defaultValue={""} >
                                                                {({ field }) => (<Select
                                                                    options={iconSizeOptions}
                                                                    value={field.value}
                                                                    label={myLanguage.iconSize}
                                                                    onChange={(newValue) => {
                                                                        setSaveBar(true);
                                                                        field.onChange(newValue);
                                                                    }}
                                                                />)}
                                                            </SingleController>
                                                        </div>


                                                        <ColorPickerController control={control} controllerName={`iconDefaultColor`} id={`iconDefaultColor`} label={myLanguage.collectionIconDefaultColor} setSaveBar={setSaveBar} />

                                                        <div className={`${renderWhichIcon().whichIcon ? 'disableOneByOne' : ""}`}>
                                                            <ColorPickerController control={control} controllerName={`iconDefaultBgColor`} id={`iconDefaultBgColor`} label={myLanguage.collectionIconDefaultBgColor} setSaveBar={setSaveBar} />
                                                        </div>

                                                        <div className={`${renderWhichIcon().onlyFilledIcon ? 'disableOneByOne' : ""}`}>
                                                            <ColorPickerController control={control} controllerName={`iconSelectedColor`} id={`iconSelectedColor`} label={myLanguage.collectionIconSelectedColor} setSaveBar={setSaveBar} />
                                                        </div>

                                                        <div className={`${renderWhichIcon().whichIcon ? 'disableOneByOne' : ""}`}>
                                                            <ColorPickerController control={control} controllerName={`iconSelectedBgColor`} id={`iconSelectedBgColor`} label={myLanguage.collectionIconSelectedBgColor} setSaveBar={setSaveBar} />
                                                        </div>
                                                    </div>
                                                </AlphaCard>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {toastMarkup}
                            </div>


                            <div className="wf-dashboard-box wf-style-wishbtn" style={{ marginBottom: "40px" }}>
                                <div className=' wishlist-ui-grid2'>
                                    <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                        <div className='custom-margin'>
                                            <Text variant="headingMd" as="h2">{myLanguage.showColCounterHeading}</Text>
                                            <p>{myLanguage.showCounterSubHeading}</p>
                                        </div>
                                        {currentPlan >= 2 &&
                                            <>
                                                <div className='custom-range-input'>
                                                    <div className="first-icon">
                                                        <SingleController name="collectionShowCount" control={control}  >
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
                                                        </SingleController>
                                                    </div>
                                                    <div className="first-icon">

                                                        <SingleController name="collectionShowCount" control={control}  >
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
                                                        </SingleController>
                                                    </div>
                                                    <div className="first-icon">
                                                        <SingleController name="collectionShowCount" control={control}  >
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
                                                        </SingleController>
                                                    </div>
                                                </div>

                                            </>
                                        }
                                    </div>
                                </div>
                            </div>





                            {/* ------------------ Quick modal setting box hided ------------------ */}
                            {/* 
                            <div className="wf-dashboard-box wf-style-wishbtn" style={{ marginBottom: "40px" }}>

                                <div className="wf-dashboard-box-inner" >
                                    <div className="Polaris-Box">
                                        <div id='quick-add-icon-section' className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >

                                            <AlphaCard>
                                                <Text variant="headingMd" as="h2">{myLanguage.collectionIconQuickViewHeading}</Text>
                                                <p style={{ marginBottom: "20px" }}>{myLanguage.collectionIconQuickViewSubHeading}</p>


                                                <SingleController
                                                    name="quickViewShowAs"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.collectionIconQuickAsIcon}
                                                            value={field.value}
                                                            id="icon"
                                                            checked={field.value === "icon" && true} onChange={() => {
                                                                field.onChange("icon"),
                                                                    setSaveBar(true);
                                                                setcheckRadio(!checkRadio)
                                                                setShowDiv(false);

                                                            }}
                                                        />
                                                    }
                                                </SingleController>

                                                <div className='notificationToolTipCollapsible'>
                                                    <Collapsible
                                                        open={watchAllFields.quickViewShowAs === "icon" ? true : false}
                                                        id="basic-collapsible"
                                                        transition={{
                                                            duration: '500ms',
                                                            timingFunction: 'ease-in-out'
                                                        }}
                                                        expandOnPrint
                                                    >
                                                        <SingleController
                                                            name="isQuickViewShowOptionImage"
                                                            control={control}
                                                        >
                                                            {({ field }) =>
                                                                <Checkbox
                                                                    label={myLanguage.collectionIconPositionHeading}
                                                                    value={"on-image"}
                                                                    id="on-image"
                                                                    checked={field.value}
                                                                    onChange={(checked) => {
                                                                        field.onChange(checked),
                                                                            setcheckRadio(!checkRadio)
                                                                            ,
                                                                            setSaveBar(true);
                                                                    }}
                                                                />
                                                            }
                                                        </SingleController>


                                                        <Collapsible
                                                            open={watchAllFields.isQuickViewShowOptionImage ? true : false}
                                                            id="basic-collapsible"
                                                            transition={{
                                                                duration: '500ms',
                                                                timingFunction: 'ease-in-out'
                                                            }}
                                                            expandOnPrint
                                                        >
                                                            <div style={{ paddingLeft: "20px" }}>
                                                                <SingleController
                                                                    name="quickViewShowOptionImage"
                                                                    control={control}  >
                                                                    {({ field }) =>
                                                                        <RadioButton
                                                                            label={myLanguage.cpRadio1}
                                                                            value={field.value}
                                                                            id="icon-top-left"
                                                                            checked={field.value === "icon-top-left" && true}
                                                                            onChange={() => {
                                                                                field.onChange("icon-top-left"),
                                                                                    setSaveBar(true);
                                                                            }}
                                                                        />
                                                                    }
                                                                </SingleController>

                                                                <SingleController
                                                                    name="quickViewShowOptionImage"
                                                                    control={control}  >
                                                                    {({ field }) =>
                                                                        <RadioButton
                                                                            label={myLanguage.cpRadio2}
                                                                            value={field.value}
                                                                            id="icon-top-right"
                                                                            checked={field.value === "icon-top-right" && true}
                                                                            onChange={() => {
                                                                                field.onChange("icon-top-right"),
                                                                                    setSaveBar(true);
                                                                            }}
                                                                        />
                                                                    }
                                                                </SingleController>

                                                                <SingleController
                                                                    name="quickViewShowOptionImage"
                                                                    control={control}  >
                                                                    {({ field }) =>
                                                                        <RadioButton
                                                                            label={myLanguage.cpRadio3}
                                                                            value={field.value}
                                                                            id="icon-bottom-left"
                                                                            checked={field.value === "icon-bottom-left" && true}
                                                                            onChange={() => {
                                                                                field.onChange("icon-bottom-left"),
                                                                                    setSaveBar(true);
                                                                            }}
                                                                        />
                                                                    }
                                                                </SingleController>

                                                                <SingleController
                                                                    name="quickViewShowOptionImage"
                                                                    control={control}  >
                                                                    {({ field }) =>
                                                                        <RadioButton
                                                                            label={myLanguage.cpRadio4}
                                                                            value={field.value}
                                                                            id="icon-bottom-right"
                                                                            checked={field.value === "icon-bottom-right" && true}
                                                                            onChange={() => {
                                                                                field.onChange("icon-bottom-right"),
                                                                                    setSaveBar(true);
                                                                            }}
                                                                        />
                                                                    }
                                                                </SingleController>
                                                            </div>
                                                        </Collapsible>

                                                        <SingleController
                                                            name="isQuickViewShowOptionTitle"
                                                            control={control}
                                                        >
                                                            {({ field }) =>
                                                                <Checkbox
                                                                    label={myLanguage.collectionIconPositionTitleHeading}
                                                                    value={"on-title"}
                                                                    id="on-title"
                                                                    checked={field.value}
                                                                    onChange={(checked) => {
                                                                        field.onChange(checked),
                                                                            setcheckRadio(!checkRadio)

                                                                        setSaveBar(true);
                                                                    }}
                                                                />
                                                            }
                                                        </SingleController>

                                                        <Collapsible
                                                            open={watchAllFields.isQuickViewShowOptionTitle ? true : false}
                                                            id="basic-collapsible"
                                                            transition={{
                                                                duration: '500ms',
                                                                timingFunction: 'ease-in-out'
                                                            }}
                                                            expandOnPrint
                                                        >

                                                            <div style={{ paddingLeft: "20px" }}>
                                                                <SingleController
                                                                    name="quickViewShowOptionTitle"
                                                                    control={control}  >
                                                                    {({ field }) =>
                                                                        <Checkbox
                                                                            label={myLanguage.cpRadio5}
                                                                            value={"title"}
                                                                            id="title"
                                                                            checked={field.value}
                                                                            onChange={(checked) => {
                                                                                field.onChange(checked),
                                                                                    setSaveBar(true);
                                                                            }}
                                                                        />
                                                                    }
                                                                </SingleController>
                                                            </div>
                                                        </Collapsible>

                                                        <SingleController
                                                            name="isQuickViewShowOptionAddToCart"
                                                            control={control}
                                                        >
                                                            {({ field }) =>
                                                                <Checkbox
                                                                    label={myLanguage.collectionIconCartHeading}
                                                                    value={"on-button"}
                                                                    id="on-button"
                                                                    checked={field.value}
                                                                    onChange={(checked) => {
                                                                        field.onChange(checked),
                                                                            setcheckRadio(!checkRadio)
                                                                            ,
                                                                            setSaveBar(true);
                                                                    }}
                                                                />
                                                            }
                                                        </SingleController>

                                                        <Collapsible
                                                            open={watchAllFields.isQuickViewShowOptionAddToCart ? true : false}
                                                            id="basic-collapsible"
                                                            transition={{
                                                                duration: '500ms',
                                                                timingFunction: 'ease-in-out'
                                                            }}
                                                            expandOnPrint
                                                        >
                                                            <div style={{ paddingLeft: "20px" }}>
                                                                <SingleController
                                                                    name="quickViewShowOptionAddToCart"
                                                                    control={control}  >
                                                                    {({ field }) =>
                                                                        <RadioButton
                                                                            label={myLanguage.collectionIconQuickAsButtonBelowCart}
                                                                            value={field.value}
                                                                            id="icon-below"
                                                                            checked={field.value === "icon-below" && true}
                                                                            onChange={() => {
                                                                                field.onChange("icon-below"),
                                                                                    setSaveBar(true);
                                                                            }}
                                                                        />

                                                                    }
                                                                </SingleController>
                                                                <SingleController
                                                                    name="quickViewShowOptionAddToCart"
                                                                    control={control}  >
                                                                    {({ field }) =>
                                                                        <RadioButton
                                                                            label={myLanguage.collectionIconQuickAsButtonAboveCart}
                                                                            value={field.value}
                                                                            id="icon-above"
                                                                            checked={field.value === "icon-above" && true}
                                                                            onChange={() => {
                                                                                field.onChange("icon-above"),
                                                                                    setSaveBar(true);
                                                                            }}
                                                                        />
                                                                    }
                                                                </SingleController>



                                                                <Text variant="headingMd" as="h2">{myLanguage.collectionIconCartPositionHeading}</Text>






                                                                <SingleController
                                                                    name="quickViewShowOptionAddToCartPosition"
                                                                    control={control}  >
                                                                    {({ field }) =>
                                                                        <RadioButton
                                                                            label={myLanguage.collectionIconQuickAsLeftIconPosition}
                                                                            value={field.value}
                                                                            id="left-icon-position"
                                                                            checked={field.value === "left-icon-position" && true}
                                                                            onChange={() => {
                                                                                field.onChange("left-icon-position"),
                                                                                    setSaveBar(true);
                                                                            }}
                                                                        />
                                                                    }
                                                                </SingleController>
                                                                <SingleController
                                                                    name="quickViewShowOptionAddToCartPosition"
                                                                    control={control}  >
                                                                    {({ field }) =>
                                                                        <RadioButton
                                                                            label={myLanguage.collectionIconQuickAsCenterIconPosition}
                                                                            value={field.value}
                                                                            id="center-icon-position"
                                                                            checked={field.value === "center-icon-position" && true}
                                                                            onChange={() => {
                                                                                field.onChange("center-icon-position"),
                                                                                    setSaveBar(true);
                                                                            }}
                                                                        />
                                                                    }
                                                                </SingleController>
                                                                <SingleController
                                                                    name="quickViewShowOptionAddToCartPosition"
                                                                    control={control}  >
                                                                    {({ field }) =>
                                                                        <RadioButton
                                                                            label={myLanguage.collectionIconQuickAsRightIconPosition}
                                                                            value={field.value}
                                                                            id="right-icon-position"
                                                                            checked={field.value === "right-icon-position" && true}
                                                                            onChange={() => {
                                                                                field.onChange("right-icon-position"),
                                                                                    setSaveBar(true);
                                                                            }}
                                                                        />
                                                                    }
                                                                </SingleController>
                                                            </div>
                                                        </Collapsible>
                                                    </Collapsible>
                                                </div>

                                                <SingleController
                                                    name="quickViewShowAs"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.collectionIconQuickAsButton}
                                                            value={field.value}
                                                            id="button"
                                                            checked={field.value === "button" && true} onChange={() => {
                                                                field.onChange("button"),
                                                                    setSaveBar(true);
                                                                setcheckRadio(!checkRadio)
                                                                setShowDiv(false);

                                                            }}
                                                        />
                                                    }
                                                </SingleController>

                                                <div className='notificationToolTipCollapsible'>
                                                    <Collapsible
                                                        open={watchAllFields.quickViewShowAs === "button" ? true : false}
                                                        id="basic-collapsible"
                                                        transition={{
                                                            duration: '500ms',
                                                            timingFunction: 'ease-in-out'
                                                        }}
                                                        expandOnPrint
                                                    >

                                                        <SingleController
                                                            name="quickViewShowOption"
                                                            control={control}  >
                                                            {({ field }) =>
                                                                <RadioButton
                                                                    label={myLanguage.collectionIconQuickAsButtonBelowCart}
                                                                    value={field.value}
                                                                    id="button-below"
                                                                    checked={field.value === "button-below" && true}
                                                                    onChange={() => {
                                                                        field.onChange("button-below"),
                                                                            setSaveBar(true);
                                                                    }}
                                                                />
                                                            }
                                                        </SingleController>

                                                        <SingleController
                                                            name="quickViewShowOption"
                                                            control={control}  >
                                                            {({ field }) =>
                                                                <RadioButton
                                                                    label={myLanguage.collectionIconQuickAsButtonAboveCart}
                                                                    value={field.value}
                                                                    id="button-above"
                                                                    checked={field.value === "button-above" && true}
                                                                    onChange={() => {
                                                                        field.onChange("button-above"),
                                                                            setSaveBar(true);
                                                                    }}
                                                                />
                                                            }
                                                        </SingleController>
                                                    </Collapsible>
                                                </div>
                                            </AlphaCard>
                                        </div>
                                    </div>
                                </div>
                            </div> */}



                            <div className="wf-dashboard-box wf-style-wishbtn">
                                <div className="wf-dashboard-box-inner">
                                    <div className="Polaris-Box wf-collection-IconBtn">
                                        <div className="wf-collection-inner">
                                            <div id='quick-add-icon-section' className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                                <Text variant="headingMd" as="h2">{myLanguage.collectionHeading1}</Text>
                                                <p style={{ marginBottom: "20px" }}>{myLanguage.collectionHeadingText1}</p>
                                                <Text variant="headingMd" as="h2">{myLanguage.collectionIconEx}</Text>
                                                <div className="wf-IconBtn-box">
                                                    <TextField value={collectionPageIcon} />
                                                    <div className="copyIcon" onClick={() => textCopyHandler(collectionPageIcon)}>
                                                        <img src={collectionCopyIcon} alt="Collect Copy Icon" />
                                                    </div>
                                                </div>

                                                <div className="wf-collection-inner">
                                                    <Text variant="headingMd" as="h2">{myLanguage.collectionBtnEx}</Text>
                                                    <div className="wf-IconBtn-box">
                                                        <TextField value={collectionPageButton} />
                                                        <div className="copyIcon" onClick={() => textCopyHandler(collectionPageButton)}>
                                                            <img src={collectionCopyIcon} alt="Collect Copy Icon" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <br />
                                            <div>
                                                <b> {myLanguage.noteHeading}. </b> <br />
                                                1. {myLanguage.helpingNoteForIcon} <br />
                                                2. {`If you enable the multi-variant wishlist feature, you must include the variant-id="{{ product.selected_or_first_available_variant.id }}" attribute in the code. Otherwise, you can omit the variant-id attribute.`}

                                            </div>
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

export default CollectionSetting
