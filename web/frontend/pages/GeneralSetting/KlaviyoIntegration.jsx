import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { Frame, Page, Text, Grid, TextField } from '@shopify/polaris';
import SkeletonPage1 from '../SkeletonPage1';
import useAppMetafield from '../../hooks/useAppMetafield';
import useUtilityFunction from '../../hooks/useUtilityFunction';
import SaveBar from '../SaveBar';
import SingleController from '../../hooks/useSingleFieldController';
import loaderGif from "../loaderGreen.gif";
import useApi from '../../hooks/useApi';
import { Constants } from '../../../backend/constants/constant';
import Swal from 'sweetalert2';
import Footer from '../Footer';
import docLink from '../../assets/docLink.svg';

const KlaviyoIntegration = () => {
    const shopApi = useApi();
    const { serverURL } = Constants;
    const utilityFunction = useUtilityFunction();
    const { handleSubmit, control, watch, reset, } = useForm();
    const watchColors = watch();
    const [myLanguage, setMyLanguage] = useState({});
    const [shopData, setShopData] = useState();
    const [isLoaded, setIsLoaded] = useState(false);
    const appMetafield = useAppMetafield();
    const [currentPlan, setCurrentPlan] = useState(0);
    const [saveBar, setSaveBar] = useState(false);


    useEffect(() => {
        useEffectLite();
    }, []);

    async function useEffectLite() {
        const shopAPI = await shopApi.shop();
        setShopData(shopAPI)
        await utilityFunction.getPlanFirst();
        const getCurrentPlan = await appMetafield.getCurrentPlan();
        setCurrentPlan(parseInt(getCurrentPlan.currentPlan));
        await utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
        });
        await getAllAppDataMetafields(shopAPI);
    }


    const getAllAppDataMetafields = async (shopAPI) => {

        let checkElement = document.querySelector(".dontRunAgain");
        if (checkElement === null) {
            utilityFunction.upgradeButtonFxn();
        }

        try {
            const userDatas = await fetch(`${serverURL}/get-klaviyo-email-integration`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shopAPI.shopName
                }),
            })
            let results = await userDatas.json();
            if (results.length > 0) {
                reset({
                    privateApi: results[0].private_key,
                    publicApi: results[0].public_key
                })
            }

            setIsLoaded(true)
        } catch (error) {
            console.log("errr ", error)
        }
    }
    const handleUpdateTemplate = async (data) => {
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        try {
            const userDatas = await fetch(`${serverURL}/klaviyo-email-integration`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    privateKey: data.privateApi,
                    publicKey: data.publicApi,
                    shopName: shopData.shopName
                }),
            })
            let results = await userDatas.json();
            if (results.msg === "data_updated") {
                Swal.fire({
                    icon: "success",
                    title: myLanguage.swalHeading,
                    text: myLanguage.swalText
                });
            }
            setSaveBar(false);
        } catch (error) {
            console.log("errr ", error)
        }




    }
    return (
        <div className='wf-dashboard wf-languageSetting' >
            {!isLoaded ? <SkeletonPage1 />
                :
                <>
                    <form onSubmit={handleSubmit(handleUpdateTemplate)}>
                        {(saveBar) ? <SaveBar save={myLanguage.save} /> : ""}
                        <Page fullWidth
                            title={myLanguage.overValueB16}
                            subtitle={myLanguage.overValue16}
                            backAction={{ onAction: () => history.back() }}
                        >
                            <div className='wf-dashboard wf-dashboard-plane'>
                                <div className='note-div '>
                                    <span>{myLanguage.noteHeading} </span>
                                    <Text variant="headingXs" as="h2">{myLanguage.klaviyoNote}
                                        <a href='https://wishlist-guru.webframez.com/docs/integrating-klaviyo-with-wishlist-guru-track-wishlist-activity-and-boost-engagement/' target='_blank'> <b>{myLanguage.SeeDocs}</b>
                                            <img src={docLink} className='docs-link' height="20px" style={{ marginTop: "0px" }} loading="lazy" />
                                        </a>
                                    </Text>
                                </div>
                            </div>

                            <Grid>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                                    <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"}`} >

                                        <div className='wf-style-wishbtn'>
                                            <div style={{ position: "relative", marginTop: "15px" }} id="language-section">
                                                <SingleController
                                                    name="publicApi"
                                                    control={control}
                                                // isRequired
                                                >

                                                    {({ field }) =>
                                                        <TextField
                                                            id={`publicApi`}
                                                            value={field.value}
                                                            label={myLanguage.klaviyoPublicKey || "Public API key"}
                                                            onChange={(newValue) => {
                                                                setSaveBar(true);
                                                                field.onChange(newValue);
                                                            }}
                                                        />
                                                    }
                                                </SingleController>
                                                <SingleController
                                                    name="privateApi"
                                                    control={control}
                                                // isRequired
                                                >
                                                    {({ field }) =>
                                                        <TextField
                                                            id={`privateApi`}
                                                            value={field.value}
                                                            label={myLanguage.klaviyoPrivateKey || "Private API key"}
                                                            onChange={(newValue) => {
                                                                setSaveBar(true);
                                                                field.onChange(newValue);
                                                            }}
                                                        />
                                                    }
                                                </SingleController>
                                            </div>
                                        </div>
                                    </div>
                                </Grid.Cell>


                            </Grid>
                            <div style={{ marginTop: "40px" }}>
                                <Footer myLanguage={myLanguage} />
                            </div>
                        </Page>
                    </form>


                </>}
        </div>

    )
}

export default KlaviyoIntegration