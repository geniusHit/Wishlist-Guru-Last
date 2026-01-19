
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { Frame, Page, Text, Grid, TextField, Button } from '@shopify/polaris';
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

const EmailSmtpSetting = () => {
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
            const userDatas = await fetch(`${serverURL}/get-smtp-email-integration`, {
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
                    sender_name: results[0].sender_name,
                    smtp_server: results[0].smtp_server,
                    from_email: results[0].from_email,
                    user_name: results[0].user_name,
                    password: results[0].password,
                    port: results[0].port,
                    protocol: results[0].protocol,

                })
            }

            setIsLoaded(true)
        } catch (error) {
            console.log("errr ", error)
        }
    }



    const handleUpdateTemplate = async (data) => {
        // console.log("GGGG --- ", data)
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        // if(data.)
        try {
            const userDatas = await fetch(`${serverURL}/smtp-email-integration`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sender_name: data.sender_name || "",
                    from_email: data.from_email,
                    smtp_server: data.smtp_server,
                    // user_email: data.user_email,
                    user_name: data.user_name,
                    password: data.password,
                    port: data.port,
                    protocol: data.protocol,
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


    const checkSmtpData = async () => {

        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });

        try {
            const response = await fetch(`${serverURL}/check-smtp-connection`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    smtp_server: watchColors.smtp_server,
                    from_email: watchColors.from_email,
                    user_name: watchColors.user_name,
                    password: watchColors.password,
                    port: watchColors.port,
                    protocol: watchColors.protocol,
                }),
            });
            let result = await response.json();

            console.log("gggggggg ", result)


            if (result.msg === "SMTP connected successfully") {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: result.msg
                });
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Warning",
                    text: result.msgValue
                });
            }
        } catch (error) {
            console.log("ERR -", error)

            Swal.fire({
                icon: "warning",
                title: "Warning",
                text: "There is an authentication error. Please check your credentials and try again"
            });

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
                            title={myLanguage.smtpHeading}
                            subtitle={myLanguage.smtpSubHeading}
                            backAction={{ onAction: () => history.back() }}
                        >

                            {/* <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}> */}
                            <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"}`} style={{ backgroundColor: "white", padding: "50px", borderRadius: "50px" }}>

                                {/* <div className='wf-style-wishbtn'> */}
                                <div style={{ position: "relative", marginTop: "15px" }} id="language-section">

                                    <Grid>

                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>


                                            <SingleController
                                                name="sender_name"
                                                control={control}
                                            // isRequired
                                            >
                                                {({ field }) =>
                                                    <TextField
                                                        id={`sender_name`}
                                                        value={field.value}
                                                        label={myLanguage.smtpLabel1}
                                                        onChange={(newValue) => {
                                                            setSaveBar(true);
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                }
                                            </SingleController>

                                            <SingleController
                                                name="from_email"
                                                control={control}
                                            // isRequired
                                            >
                                                {({ field }) =>
                                                    <TextField
                                                        id={`from_email`}
                                                        value={field.value}
                                                        label={myLanguage.smtpLabel2}
                                                        onChange={(newValue) => {
                                                            setSaveBar(true);
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                }
                                            </SingleController>

                                            <SingleController
                                                name="smtp_server"
                                                control={control}
                                            // isRequired
                                            >
                                                {({ field }) =>
                                                    <TextField
                                                        id={`smtp_server`}
                                                        value={field.value}
                                                        label={myLanguage.smtpLabel3}
                                                        onChange={(newValue) => {
                                                            setSaveBar(true);
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                }
                                            </SingleController>

                                            <SingleController
                                                name="user_name"
                                                control={control}
                                            // isRequired
                                            >
                                                {({ field }) =>
                                                    <TextField
                                                        id={`user_name`}
                                                        value={field.value}
                                                        label={myLanguage.smtpLabel4}
                                                        onChange={(newValue) => {
                                                            setSaveBar(true);
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                }
                                            </SingleController>

                                        </Grid.Cell>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>





                                            <SingleController
                                                name="password"
                                                control={control}
                                            // isRequired
                                            >
                                                {({ field }) =>
                                                    <TextField
                                                        id={`password`}
                                                        value={field.value}
                                                        label={myLanguage.smtpLabel5}
                                                        onChange={(newValue) => {
                                                            setSaveBar(true);
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                }
                                            </SingleController>

                                            <SingleController
                                                name="port"
                                                control={control}
                                            // isRequired
                                            >
                                                {({ field }) =>
                                                    <TextField
                                                        id={`port`}
                                                        value={field.value}
                                                        label={myLanguage.smtpLabel6}
                                                        onChange={(newValue) => {
                                                            setSaveBar(true);
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                }
                                            </SingleController>

                                            <SingleController
                                                name="protocol"
                                                control={control}
                                            // isRequired
                                            >
                                                {({ field }) =>
                                                    <TextField
                                                        id={`protocol`}
                                                        value={field.value}
                                                        label={myLanguage.smtpLabel7}
                                                        placeholder='SSL or TLS'
                                                        onChange={(newValue) => {
                                                            setSaveBar(true);
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                }
                                            </SingleController>

                                        </Grid.Cell>
                                    </Grid>

                                    <div className='disable-app' style={{ width: "250px" }}>
                                        <Button alignment="end" onClick={checkSmtpData}  >{myLanguage.verifySmtpButton}</Button>
                                    </div>

                                </div>
                            </div>
                            {/* </div> */}
                            {/* </Grid.Cell> */}
                            <div style={{ marginTop: "40px" }}>
                                <Footer myLanguage={myLanguage} />
                            </div>
                        </Page>
                    </form>
                </>}
        </div>

    )
}

export default EmailSmtpSetting









// import React from 'react'

// const EmailSmtpSetting = () => {
//     return (
//         <div>EmailSmtpSetting</div>
//     )
// }

// export default EmailSmtpSetting