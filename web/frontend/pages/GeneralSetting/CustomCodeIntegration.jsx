import React, { useState, useEffect, useCallback } from 'react';
import { Frame, Page, Text, Grid, TextField, Toast } from '@shopify/polaris';
import { useForm, Controller, useWatch } from "react-hook-form";
import useAppMetafield from '../../hooks/useAppMetafield';
import useUtilityFunction from '../../hooks/useUtilityFunction';
import SaveBar from '../SaveBar';
import SkeletonPage1 from '../SkeletonPage1';
import Swal from 'sweetalert2';
import loaderGif from "../loaderGreen.gif";
import useSwal from '../../hooks/useSwal';
import Footer from '../Footer';
import collectionCopyIcon from '../../assets/copy-icon.svg';
import Toggle from 'react-toggle';

const CustomCodeIntegration = () => {
    const utilityFunction = useUtilityFunction();
    const [myLanguage, setMyLanguage] = useState({});
    const swal = useSwal()
    const { handleSubmit, reset, control, formState: { errors } } = useForm();
    const appMetafield = useAppMetafield();
    const [currentPlan, setCurrentPlan] = useState(0);
    const [saveBar, setSaveBar] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const toastMarkup = active ? (
        <Toast content="Copied" onDismiss={toggleActive} />
    ) : null;

    const [genData, setGenData] = useState({});
    const [isHeaderIconTrue, setIsHeaderIconTrue] = useState(false);
    const [isProductTitleTrue, setProductTitleTrue] = useState(false);

    async function handleChangeHeaderIcon(e) {
        setIsHeaderIconTrue(e.target.checked);
        setSaveBar(true);
    }

    async function handleProductTitle(e) {
        setProductTitleTrue(e.target.checked);
        setSaveBar(true);
    }

    async function saveToMetafield() {
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        let dataUpdate = { ...genData, paidWlbLocation: isHeaderIconTrue === true ? "yes" : "no", showProductMetafield: isProductTitleTrue === true ? "yes" : "no" }
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

        setSaveBar(false);
    }

    useEffect(() => {
        useEffectLite();
    }, []);

    async function useEffectLite() {
        await utilityFunction.getPlanFirst();
        const getCurrentPlan = await appMetafield.getCurrentPlan();
        setCurrentPlan(parseInt(getCurrentPlan.currentPlan));
        await utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
        });
        await getAllAppDataMetafields();
    }


    const getAllAppDataMetafields = async () => {
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "advance-setting") {
                setIsLoading(true);
                utilityFunction.goToSectionFxn();
                let checkElement = document.querySelector(".dontRunAgain");
                if (checkElement === null) {
                    utilityFunction.upgradeButtonFxn();
                }
                // let dData = JSON.parse(dataArray[i].node.value.replace(/~/g, "'"));
                // reset({
                //     customCss: dData.customCss,
                //     customJs: dData.customJs,
                //     jsAfterAddToWishlist: dData.jsAfterAddToWishlist,
                //     jsAfterRemovedFromWishlist: dData.jsAfterRemoveFromWishlist,
                //     jsAfterItemsLoaded: dData?.jsAfterItemsLoaded || "",
                // })
            }
            if (dataArray[i].node.key === "general-setting") {
                let dData = JSON.parse(dataArray[i].node.value.replace(/~/g, "'"));
                setGenData(dData);
                setIsHeaderIconTrue(dData?.paidWlbLocation === "yes" ? true : false);
                setProductTitleTrue(dData?.showProductMetafield === "yes" ? true : false)
            }
        }
    }

    // const saveCustomSetting = async (data) => {
    //     swal.showButtonSwal({
    //         text: myLanguage.swalWaiting,
    //         imageUrl: loaderGif,
    //         showConfirmButton: false,
    //     });
    //     let dataSubmit = {
    //         customCss: data.customCss,
    //         customJs: data.customJs,
    //         jsAfterAddToWishlist: data.jsAfterAddToWishlist,
    //         jsAfterRemoveFromWishlist: data.jsAfterRemovedFromWishlist,
    //         jsAfterItemsLoaded: data.jsAfterItemsLoaded
    //     }
    //     const getAppMetafieldId = await appMetafield.getAppMetafieldId();
    //     const appMetadata = {
    //         key: "advance-setting",
    //         namespace: "wishlist-app",
    //         ownerId: getAppMetafieldId,
    //         type: "single_line_text_field",
    //         value: JSON.stringify(dataSubmit).replace(/'/g, '~')
    //     };
    //     await appMetafield.createAppMetafield(appMetadata).then((res) => {
    //         Swal.fire({
    //             icon: "success",
    //             title: myLanguage.swalHeading,
    //             text: myLanguage.swalText,
    //             confirmButtonText: myLanguage.swalOk
    //         });
    //     });
    //     setSaveBar(false);
    // }

    const collectionPageIcon = `<div class="wf-wishlist"  product-id="{{ product.id }}" product-handle="{{ product.handle }}" variant-id="{{ product.selected_or_first_available_variant.id }}"></div>`;
    const collectionPageButton = `<div class="wf-wishlist-button" product-id="{{ product.id }}" product-handle="{{ product.handle }}" variant-id="{{ product.selected_or_first_available_variant.id }}"></div>`;

    const trendingWidgetCode = `<div id="wf-custom-trending-widget"></div>`;

    const textCopyHandler = (data) => {
        navigator.clipboard.writeText(data);
        toggleActive();
    };

    function boldWordInString(sentence, wordsToBold) {
        const words = sentence.split(' ');
        return words.map((w, index) => {
            if (wordsToBold.some(word => word.toLowerCase() === w.toLowerCase())) {
                return <b key={index}>{w} </b>; // Add space after each word
            } else {
                return <span key={index}>{w} </span>; // Add space after each word
            }
        });
    }

    return (
        <div className='wf-dashboard wf-advanceSetting'>
            {!isloading ? <SkeletonPage1 /> : <Frame>

                <form onSubmit={handleSubmit(saveToMetafield)}>
                    {(saveBar) ? <SaveBar save={myLanguage.save} /> : ""}

                    <Page fullWidth
                        title={myLanguage.cciHeading}
                        subtitle={myLanguage.cciSubHeading}
                        backAction={{ onAction: () => history.back() }}
                    >

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
                                            {/* 2. {`If you enable the multi-variant wishlist feature, you must include the variant-id="{{ product.selected_or_first_available_variant.id }}" attribute in the code. Otherwise, you can omit the variant-id attribute.`} */}
                                            2. {myLanguage.multiVariantInstr}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div id='custom-code-icon-section' className='wf-style-wishbtn'>
                            <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                <div className='wf-showCount-box customcode-toggle'>
                                    <div>
                                        <Text variant="headingMd" as="h2">{myLanguage.iconCustomCodeHeading}</Text>
                                        <Text id="sentence" variant="body" as="p">{boldWordInString(myLanguage.iconCustomCodeText, ["(class='custom-wishlist-icon')", "wishlist-type"])}</Text>

                                        <Text as='p' variant='body'> {myLanguage.iconCustomCodeExample}</Text>
                                        <Text as='p' variant='body'> {myLanguage.iconCustomCodeExample2}</Text>

                                        <Text as='p' variant='body'><b> {myLanguage.noteHeading}: {myLanguage.iconCustomCodeExampleText}</b></Text>
                                    </div>

                                    {currentPlan > 1 ?
                                        <Toggle
                                            checked={isHeaderIconTrue}
                                            onChange={handleChangeHeaderIcon}
                                            icons={false}
                                            disabled={false} /> : <></>}
                                </div>
                            </div>
                        </div>


                        <div className="wf-dashboard-box wf-style-wishbtn">
                            <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"}`} >
                                <div className="wf-dashboard-box-inner">
                                    <div className="Polaris-Box wf-collection-IconBtn">
                                        <div className="wf-collection-inner">
                                            <Text variant="headingMd" as="h2">{myLanguage.trendingShortCodeHeading}</Text>
                                            <p style={{ marginBottom: "20px" }}>{myLanguage.trendingShortCodeSubHeading}</p>
                                            <div className="wf-IconBtn-box">
                                                <TextField value={trendingWidgetCode} />
                                                <div className="copyIcon" onClick={() => textCopyHandler(trendingWidgetCode)}>
                                                    <img src={collectionCopyIcon} alt="Collect Copy Icon" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div id='custom-code-icon-section' className='wf-style-wishbtn'>
                            <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                <div className='wf-showCount-box customcode-toggle'>
                                    <div id='quick-add-icon-section'>
                                        <Text variant="headingMd" as="h2">Custom Code for Custom Titles in Modal Grids</Text>
                                        <Text id="sentence" variant="body" as="p">If you want to display a custom title from a metafield or another variable, simply add the <b>product-title</b> attribute with the desired value and enable this option. The modal will then show that custom value as the title.</Text>

                                        <Text variant="headingMd" as="h2">{myLanguage.collectionIconEx}</Text>
                                        <Text as='p' variant='body'> {'<div class="wf-wishlist"  product-id="{{ product.id }}" product-handle="{{ product.handle }}" variant-id="{{ product.selected_or_first_available_variant.id }}" product-title="{{ product.title }}"></div>'} </Text>

                                        <Text variant="headingMd" as="h2">{myLanguage.collectionBtnEx}</Text>
                                        <Text as='p' variant='body'> {'<div class="wf-wishlist-button" product-id="{{ product.id }}" product-handle="{{ product.handle }}" variant-id="{{ product.selected_or_first_available_variant.id }}" product-title="{{ product.title }}"></div>'}</Text>

                                        {/* <Text as='p' variant='body'><b> {myLanguage.noteHeading}: {myLanguage.iconCustomCodeExampleText}</b></Text> */}
                                    </div>

                                    {currentPlan > 1 ?
                                        <Toggle
                                            checked={isProductTitleTrue}
                                            onChange={handleProductTitle}
                                            icons={false}
                                            disabled={false} /> : <></>}
                                </div>
                            </div>
                        </div>

                        {toastMarkup}

                        <div style={{ marginTop: "0px" }}>
                            <Footer myLanguage={myLanguage} />
                        </div>
                    </Page>
                </form>
            </Frame >}
        </div>
    )
}

export default CustomCodeIntegration