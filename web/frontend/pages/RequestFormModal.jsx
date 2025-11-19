import { Button, Frame, Modal, VerticalStack, Select, TextField, ButtonGroup, Page, Card, AlphaCard, Grid, LegacyCard, Text } from '@shopify/polaris';
import React, { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import useApi from '../hooks/useApi';
import useUtilityFunction from '../hooks/useUtilityFunction';
import useSwal from "../hooks/useSwal"
import { useNavigate } from 'react-router-dom';
import SkeletonPage1 from './SkeletonPage1';
import { Constants } from '../../backend/constants/constant';
import loaderGif from "./loaderGreen.gif"
import Swal from 'sweetalert2';
import Footer from './Footer';

import english from '../assets/Languages/english';
import WebframezApps from './WebframezApps';

const RequestFormModal = ({ storeAdminEmail, storeDomain }) => {

    const { serverURL } = Constants;
    const swal = useSwal();
    const ShopApi = useApi();
    const Navigate = useNavigate();
    const utilityFunction = useUtilityFunction();
    const { register, handleSubmit, watch, reset, control, formState: { errors } } = useForm();
    const [modal, setModal] = useState(false);

    const [getShopName, setGetShopName] = useState("");


    const [isloading, setIsLoading] = useState(false);
    const [myLanguage, setMyLanguage] = useState(english);

    const options = [
        { value: '', label: myLanguage.cpSubjectSelect },
        { value: 'setup', label: myLanguage.cpSubjectSelect1 },
        { value: 'customization', label: myLanguage.cpSubjectSelect2 },
        { value: 'feedback', label: myLanguage.cpSubjectSelect3 },
        { value: 'other', label: myLanguage.cpSubjectSelect4 },
    ];


    const finalhandleSubmit = async (data) => {
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        const shopAPI = await ShopApi.shop();
        // console.log("shopppp ", shopAPI)
        // let storeEmail = { "storeAdminEmail": shopAPI.email, "storeDomain": shopAPI.domain }
        let storeEmail = { "storeDomain": shopAPI.domain }
        const datas = { ...data, ...storeEmail }

        try {
            const userDatas = await fetch(`${serverURL}/request-form`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(datas),
            })
            let results = await userDatas.json();

            if (results.msg === "Email sent successfully") {
                // swal.timerAlertSwal({ icon: "success", textMessage: "We have recieved your email and we will contact you shortly" })
                Swal.fire({
                    icon: "success",
                    title: "Message sent",
                    text: "We have recieved your email and we will contact you shortly",
                    confirmButtonText: myLanguage.swalOk
                });
                reset()
            }
            else {
                swal.timerAlertSwal({ icon: "error", textMessage: "something went wrong" })
                reset()
            }
            // setShowModalMessage(!showModalMessage)
        } catch (error) {
            console.log("errr ", error)
        }
    }

    useEffect(() => {
        useEffectLite();
    }, [])

    async function useEffectLite() {
        await utilityFunction.getCurrentLanguage().then(async (res) => {
            setMyLanguage(res);
            const shopName1 = await ShopApi.shop();
            setGetShopName(shopName1);
            setIsLoading(true);
        });
    }


    const goToSupppportMail = () => {
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=support@webframez.com`, "_blank");
    }

    return (
        <div className='wf-dashboard wf-getsupport-dashboard'>
            {!isloading ? <SkeletonPage1 /> :
                <Page fullWidth
                    // narrowWidth
                    title={myLanguage.contactPageHeading}
                    subtitle={myLanguage.contactPageText}>
                    <div className='wf-style-wishbtn'>
                        <AlphaCard >
                            <form onSubmit={handleSubmit(finalhandleSubmit)} >
                                {/* {/ <div className='alpha-main-div'> /} */}
                                <div className='developer-form-box'>
                                    <div className='developer-faq-column'>
                                        <AlphaCard>
                                            <Text variant='headingMd' as='h2' >{myLanguage.cpFAQ} </Text>
                                            <a href="https://wishlist-guru.webframez.com/faq/" target="_blank">{myLanguage.cpViewFAQ}</a>
                                        </AlphaCard>

                                        <AlphaCard>
                                            <Text variant='headingMd' as='h2' >{myLanguage.cpDeveloperFAQ} </Text>
                                            <a href="https://wishlist-guru.webframez.com/docs/" target="_blank">{myLanguage.cpDeveloperDocs}</a>
                                        </AlphaCard>

                                        {/* <AlphaCard>
                                            <Text variant="headingMd" as="h2">{myLanguage.cpPostHeading}</Text>
                                            <p>{myLanguage.cpPostText}</p>
                                            <div className='enable-app'>
                                                <a href="https://apps.shopify.com/wishlist-guru/reviews#modal-show=WriteReviewModal" target="_blank"> {myLanguage.cpPostButton}</a>

                                            </div>
                                        </AlphaCard> */}

                                        <AlphaCard>
                                            <Text variant="headingMd" as="h2">{myLanguage.cpPostHeading}</Text>
                                            <p>{myLanguage.cpPostText} <span onClick={goToSupppportMail} style={{ cursor: "pointer", textDecoration: "underline", fontWeight: "bold" }}>support@webframez.com</span> {myLanguage.cpPostText2}</p>

                                            {/* <div className='enable-app'>
                                                <a href="https://apps.shopify.com/wishlist-guru/reviews#modal-show=WriteReviewModal" target="_blank"> {myLanguage.cpPostButton}</a>
                                            </div> */}
                                        </AlphaCard>

                                    </div>
                                    <div className='request-form-column'>
                                        <AlphaCard>
                                            <Text variant='headingMd' as='h2' >{myLanguage.cpRequestForm}</Text>


                                            <Controller
                                                name="storeAdminEmail"
                                                defaultValue=""
                                                control={control}
                                                rules={{
                                                    required: myLanguage.cpErrorMsg,
                                                    pattern: {
                                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                        message: myLanguage.enterValidEmail,
                                                    }
                                                }}
                                                render={({ field, fieldState }) => (
                                                    <div className='border-input-field border-input-field-full'>
                                                        <TextField
                                                            label={
                                                                <span>
                                                                    {myLanguage.cpEmail} <span style={{ color: 'red' }}>*</span>
                                                                </span>
                                                            }
                                                            placeholder={myLanguage.cpEmailPlaceholder}
                                                            {...field}
                                                            autoComplete="off"
                                                        />
                                                        {fieldState.error && <span className='errorMessageColor'>{fieldState.error.message}</span>}
                                                    </div>
                                                )}
                                            />


                                            <Controller
                                                name="subject"
                                                defaultValue=""
                                                control={control}
                                                rules={{ required: myLanguage.cpErrorMsg }}
                                                render={({ field, fieldState }) => (
                                                    <div className='border-input-field border-input-field-full'>
                                                        <Select
                                                            options={options}
                                                            label={
                                                                <span>
                                                                    {myLanguage.cpSubject} <span style={{ color: 'red' }}>*</span>
                                                                </span>
                                                            }
                                                            {...field}
                                                        />
                                                        {fieldState.error && <span className='errorMessageColor'>{fieldState.error.message}</span>}
                                                    </div>
                                                )}
                                            />
                                            <Controller
                                                name="message"
                                                defaultValue=""
                                                control={control}
                                                rules={{ required: myLanguage.cpErrorMsg }}
                                                render={({ field, fieldState }) => (
                                                    <div className='border-input-field border-input-field-full'>
                                                        <TextField
                                                            label={
                                                                <span>
                                                                    {myLanguage.cpMessage} <span style={{ color: 'red' }}>*</span>
                                                                </span>
                                                            }
                                                            placeholder={myLanguage.cpMessagePlaceholder}
                                                            {...field}
                                                            multiline={4}
                                                            autoComplete="off"
                                                        />
                                                        {fieldState.error && <span className='errorMessageColor'>{fieldState.error.message}</span>}
                                                    </div>
                                                )}
                                            />
                                            <div className='request-button-submit'>
                                                <Button submit >{myLanguage.cpSubmit}</Button>
                                            </div>
                                        </AlphaCard>
                                    </div>
                                </div>
                            </form>
                        </AlphaCard>
                    </div >
                    <WebframezApps myLanguage={myLanguage} />
                    <div style={{ marginTop: "40px" }}>
                        <Footer myLanguage={myLanguage} />
                    </div>

                    {/* <div style={{ paddingTop: "35px", marginBottom: "0px", marginTop: "40px" }} className="wf-dashboard-box wf-dashboard-boxplain">
                        <div style={{ marginTop: "25px" }}>
                            <iframe id="taranker-co-partner-iframe" src={`https://widget.taranker.com/partner/271f17707d8bfd2cd45f7e5182298703?shop="${getShopName?.shopName}"l&app_id=10624&limit=3`}
                                style={{ border: '0', height: 'auto', width: "100%" }}
                                scrolling="no" ></iframe>
                        </div>
                    </div> */}

                </Page >}
        </div >
    )
}
export default RequestFormModal