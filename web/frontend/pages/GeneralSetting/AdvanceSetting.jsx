import React, { useState, useEffect } from 'react';
import { Frame, Page, Text, Grid, TextField } from '@shopify/polaris';
import { useForm, Controller, useWatch } from "react-hook-form";
import useAppMetafield from '../../hooks/useAppMetafield';
import useUtilityFunction from '../../hooks/useUtilityFunction';
import SaveBar from '../SaveBar';
import SkeletonPage1 from '../SkeletonPage1';
import Swal from 'sweetalert2';
import loaderGif from "../loaderGreen.gif";
import useSwal from '../../hooks/useSwal';
import Footer from '../Footer';
import SingleFieldController from "../../hooks/useSingleFieldController";

const AdvanceSetting = () => {
    const utilityFunction = useUtilityFunction();
    const [myLanguage, setMyLanguage] = useState({});
    const swal = useSwal()
    const { handleSubmit, reset, control, formState: { errors } } = useForm();
    const appMetafield = useAppMetafield();
    const [currentPlan, setCurrentPlan] = useState(0);
    const [saveBar, setSaveBar] = useState(false);
    const [isloading, setIsLoading] = useState(false);

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
                let dData = JSON.parse(dataArray[i].node.value.replace(/~/g, "'"));
                reset({
                    customCss: dData.customCss,
                    customJs: dData.customJs,
                    jsAfterAddToWishlist: dData.jsAfterAddToWishlist,
                    jsAfterRemovedFromWishlist: dData.jsAfterRemoveFromWishlist,
                    jsAfterItemsLoaded: dData?.jsAfterItemsLoaded || "",
                    jsAfterAddToCart: dData?.jsAfterAddToCart || "",
                    metaPixelApiKey: dData?.metaPixelApiKey || ""
                })
            }
        }
    }

    const saveCustomSetting = async (data) => {
        swal.showButtonSwal({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        let dataSubmit = {
            customCss: data.customCss,
            customJs: data.customJs,
            jsAfterAddToWishlist: data.jsAfterAddToWishlist,
            jsAfterRemoveFromWishlist: data.jsAfterRemovedFromWishlist,
            jsAfterItemsLoaded: data.jsAfterItemsLoaded,
            jsAfterAddToCart: data.jsAfterAddToCart,
            metaPixelApiKey: data.metaPixelApiKey,
        }
        const getAppMetafieldId = await appMetafield.getAppMetafieldId();
        const appMetadata = {
            key: "advance-setting",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: JSON.stringify(dataSubmit).replace(/'/g, '~')
        };
        await appMetafield.createAppMetafield(appMetadata).then((res) => {
            Swal.fire({
                icon: "success",
                title: myLanguage.swalHeading,
                text: myLanguage.swalText,
                confirmButtonText: myLanguage.swalOk
            });
        });
        setSaveBar(false);
    }

    return (
        <div className='wf-dashboard wf-advanceSetting'>
            {!isloading ? <SkeletonPage1 /> : <Frame>
                <form onSubmit={handleSubmit(saveCustomSetting)}>
                    {(saveBar) ? <SaveBar save={myLanguage.save} /> : ""}

                    <Page fullWidth
                        title={myLanguage.overValueB10}
                        subtitle={myLanguage.overValue10}
                        backAction={{ onAction: () => history.back() }}
                    >
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                                <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                    <div className='wf-style-wishbtn'>
                                        <div className='pb-15'>
                                            <Text variant="headingXl" as="h2">{myLanguage.customCssHeading}</Text>
                                            <p>{myLanguage.customCssText}</p>
                                        </div>
                                        <Controller
                                            name="customCss"
                                            defaultValue=""
                                            control={control}
                                            render={({ field }) => (
                                                <div className='Polaris-textarea-message'>
                                                    <TextField placeholder={myLanguage.advanceSettingMainText} type="text" value={field.value} onChange={(value) => { field.onChange(value), setSaveBar(true) }} multiline={6} />
                                                </div>)}
                                        />
                                    </div>
                                </div>
                            </Grid.Cell>

                            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                                <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                    <div className='wf-style-wishbtn'>
                                        <div className='pb-15'>
                                            <Text variant="headingXl" as="h2">{myLanguage.customJsHeading}</Text>
                                            <p>{myLanguage.customJsText}</p>
                                        </div>
                                        <Controller
                                            name="customJs"
                                            defaultValue=""
                                            control={control}
                                            render={({ field }) => (
                                                <div className='Polaris-textarea-message'>
                                                    <TextField placeholder={myLanguage.customJsPlaceholder} type="text" value={field.value} onChange={(value) => { field.onChange(value), setSaveBar(true) }} multiline={6} />
                                                </div>)} />
                                    </div>
                                </div>
                            </Grid.Cell>
                        </Grid>

                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                                <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                    <div className='wf-style-wishbtn'>
                                        <div className='pb-15'>
                                            <Text variant="headingXl" as="h2">{myLanguage.customJsAfterAddHeading}</Text>
                                            <p>{myLanguage.customJsAfterAddText}</p>
                                        </div>
                                        <Controller
                                            name="jsAfterAddToWishlist"
                                            defaultValue=""
                                            control={control}
                                            render={({ field }) => (
                                                <div className='Polaris-textarea-message'>
                                                    <TextField placeholder={myLanguage.customJsAfterAddPlaceholder} type="text" value={field.value} onChange={(value) => { field.onChange(value), setSaveBar(true) }} multiline={6} />
                                                </div>)} />
                                    </div>
                                </div>
                            </Grid.Cell>

                            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                                <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                    <div className='wf-style-wishbtn'>
                                        <div className='pb-15'>
                                            <Text variant="headingXl" as="h2">{myLanguage.customJsAfterRemoveHeading}</Text>
                                            <p>{myLanguage.customJsAfterRemoveText}</p>
                                        </div>
                                        <Controller
                                            name="jsAfterRemovedFromWishlist"
                                            defaultValue=""
                                            control={control}
                                            render={({ field }) => (
                                                <div className='Polaris-textarea-message'>
                                                    <TextField placeholder={myLanguage.customJsAfterRemovePlaceholder} type="text" value={field.value} onChange={(value) => { field.onChange(value), setSaveBar(true) }} multiline={6} />
                                                </div>)} />
                                    </div>
                                </div>
                            </Grid.Cell>
                        </Grid>

                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                                <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                    <div className='wf-style-wishbtn'>
                                        <div className='pb-15'>
                                            <Text variant="headingXl" as="h2">{myLanguage.customJsItemLoadedHeading}</Text>
                                            <p>{myLanguage.customJsItemLoadedText}</p>
                                        </div>
                                        <Controller
                                            name="jsAfterItemsLoaded"
                                            defaultValue=""
                                            control={control}
                                            render={({ field }) => (
                                                <div className='Polaris-textarea-message'>
                                                    <TextField placeholder={myLanguage.customJsItemLoadedPlaceholder} type="text" value={field.value} onChange={(value) => { field.onChange(value), setSaveBar(true) }} multiline={6} />
                                                </div>)} />
                                    </div>
                                </div>
                            </Grid.Cell>

                            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                                <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                    <div className='wf-style-wishbtn'>
                                        <div className='pb-15'>
                                            <Text variant="headingXl" as="h2">{myLanguage.jsAfterCartBtn}</Text>
                                            <p>{myLanguage.jsAfterCartBtnSub}</p>
                                        </div>
                                        <Controller
                                            name="jsAfterAddToCart"
                                            defaultValue=""
                                            control={control}
                                            render={({ field }) => (
                                                <div className='Polaris-textarea-message'>
                                                    <TextField placeholder={myLanguage.jsAfterCartBtnPlaceholder} type="text" value={field.value} onChange={(value) => { field.onChange(value), setSaveBar(true) }} multiline={6} />
                                                </div>)} />
                                    </div>
                                </div>
                            </Grid.Cell>
                        </Grid>

                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>

                                <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                    <div className={`${currentPlan >= 3 ? "" : "disableEverything under-pro"}`} >
                                        <div className='custom-margin'>
                                            <Text variant="headingMd" as="h2">Meta Pixel Integration Settings</Text>
                                            <p>Use this integration to track Add to Cart and Add to Wishlist events.</p>
                                        </div>
                                        <br />
                                        <div >
                                            <SingleFieldController name={`metaPixelApiKey`} control={control}  >
                                                {({ field }) => (<TextField className='input-field-css' label={`Enter Your Meta Pixel API Key`} id='metaPixelApiKey' value={field.value} onChange={(newValue) => {
                                                    setSaveBar(true);
                                                    field.onChange(newValue);
                                                }} />)}
                                            </SingleFieldController>
                                        </div>

                                    </div>
                                </div>
                            </Grid.Cell>
                        </Grid>

                        <div style={{ marginTop: "0px" }}>
                            <Footer myLanguage={myLanguage} />
                        </div>

                    </Page>
                </form>
            </Frame >}
        </div>
    )
}

export default AdvanceSetting