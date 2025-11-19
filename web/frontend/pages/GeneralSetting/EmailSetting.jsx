import React, { useCallback, useEffect, useState } from 'react';
import { Frame, Page, LegacyCard, IndexTable, Button, Text, AlphaCard, Thumbnail, DropZone, TextField, Grid, Select } from '@shopify/polaris';
import SkeletonPage1 from '../SkeletonPage1';
import Swal from "sweetalert2";
import useAppMetafield from '../../hooks/useAppMetafield';
import useApi from '../../hooks/useApi';
import useUtilityFunction from '../../hooks/useUtilityFunction';
import loaderGif from "../loaderGreen.gif";
import SingleFieldController from '../../hooks/useSingleFieldController';
import { RadioButton } from '@shopify/polaris';
import { useForm } from 'react-hook-form';
import SaveBar from '../SaveBar';
import { Constants } from '../../../backend/constants/constant';
import Footer from '../Footer';
import axios from 'axios';
import EditTemplate from './EditTemplate';
import { useLocation, useNavigate } from 'react-router-dom';


const EmailSetting = () => {
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search.trim());
    const temp_id = searchParams.get('temp_id')
    const navigate = useNavigate()
    const { handleSubmit, control, watch, reset } = useForm();
    const { serverURL } = Constants;
    const shopApi = useApi();
    const appMetafield = useAppMetafield();
    const utilityFunction = useUtilityFunction();
    const [saveBar, setSaveBar] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const [myLanguage, setMyLanguage] = useState({});
    const [currentPlan, setCurrentPlan] = useState(0);
    const [file, setFile] = useState(null);
    const [appInstallId, setAppInstallId] = useState(null);
    const [shopData, setShopData] = useState();
    const [tempData, setTempData] = useState([])
    const [tempId, setTempId] = useState(temp_id);
    const [headerSave, setHeaderSave] = useState(false);
    const [emailSenderName, setEmailSenderName] = useState("");
    const [replyToEmail, setReplyToEmail] = useState("");

    const watchAllFields = watch();

    const priceDropData = {
        firstRow: `<div style="font-size:16px;line-height:26px;color:#222;font-weight:400;font-family:'Poppins', sans-serif;text-align: center;max-width: 520px;margin: 0 auto 25px;">Dear {Customer Email} We've got some electrifying news just for you! Brace yourself for jaw-dropping discounts because the price of {Product Title} just took a thrilling dive! <br />{Product Grid}<br />Are you ready to seize this golden opportunity? Don't miss out on owning {Product Title} at an unbeatable price! Act fast and head straight to our Shopify store to grab yours before it's too late! <br /> Should you have any questions or need assistance, feel free to reach out to us. Hurry, these deals won't last forever! Embrace the savings and elevate your shopping experience today!{Shop Button}
        </div>`,

        emailSubject: `Price Drop Alert: 🎉 Incredible Savings Await for {Product Title}! 🎉 - {Your Shop Domain}`,

        footerRow: `<div style="margin: 0 auto 30px;text-align: center;font-size: 15px;line-height: 20px;font-weight: 400;color: #222;font-family: 'Poppins', sans-serif; max-width: 500px;">If you have any questions, reply to this email or contact us at support@webframez.com</div>`,

        isLogo: true,

        headerBgColor: '',
        contentBgColor: '',
        contentColor: '',
        footerBgColor: '',
        footerColor: '',
    }

    const backInStockData = {
        firstRow: `<div style="font-size:16px;line-height:26px;color:#222;font-weight:400;font-family:'Poppins', sans-serif;text-align: center;max-width: 520px;margin: 0 auto 25px;">Dear {Customer Email} We are excited to inform you that {Product Title} is now back in stock! After high demand and a temporary shortage, we've replenished our inventory and are ready to fulfill your orders. <br /> Don't miss out on the chance to get your hands on {Product Title} Whether it's for yourself or a special someone, now is the perfect time to make your purchase. Hurry and place your order before it sells out again! Click the button below to shop now.<br/>{Product Grid}<br/>Thank you for your patience and continued support. We can't wait to see you enjoy your {Product Title} P.S. Quantities are limited, so act fast!{Shop Button}</div>`,

        emailSubject: `{Product Title} is Back in Stock - {Your Shop Domain}`,

        footerRow: `<div style="margin: 0 auto 30px;text-align: center;font-size: 15px;line-height: 20px;font-weight: 400;color: #222;font-family: 'Poppins', sans-serif; max-width: 500px;">If you have any questions, reply to this email or contact us at support@webframez.com</div>`,

        isLogo: true,

        headerBgColor: '',
        contentBgColor: '',
        contentColor: '',
        footerBgColor: '',
        footerColor: '',
    }

    const lowStockData = {
        firstRow: `<div style="font-size:16px;line-height:26px;color:#222;font-weight:400;font-family:'Poppins', sans-serif;text-align: center;max-width: 520px;margin: 0 auto 25px;">Dear {Customer Email}</b> We hope you're doing well! We're reaching out to inform you that our {Product Title} is almost sold out. This is your last chance to grab it before it's gone! To secure your {Product Title} now.<br/>{Product Grid}<br/>Should you have any questions or need assistance, feel free to reach out to us. Thank you for shopping with us at {Your Shop Domain}</div>`,

        emailSubject: `Important: Limited Stock Alert for {Product Title} 🚨 - {Your Shop Domain}`,

        footerRow: `<div style="margin: 0 auto 30px;text-align: center;font-size: 15px;line-height: 20px;font-weight: 400;color: #222;font-family: 'Poppins', sans-serif; max-width: 500px;">If you have any questions, reply to this email or contact us at support@webframez.com</div>`,

        isLogo: true,

        headerBgColor: '',
        contentBgColor: '',
        contentColor: '',
        footerBgColor: '',
        footerColor: '',
    }

    const weeklyEmailData = {
        firstRow: `<div style="font-size:16px;line-height:26px;color:#222;font-weight:400;font-family:'Poppins', sans-serif;text-align: center;max-width:100%;margin: 0 auto 25px;">Hi, Your last month wishlist items are waiting for you. BUY NOW..{Product Grid}{Go To Wishlist}</div>`,

        emailSubject: `Your Monthly Wishlist Update`,

        footerRow: `<div style="margin: 0 auto 30px;text-align: center;font-size: 15px;line-height: 20px;font-weight: 400;color: #222;font-family: 'Poppins', sans-serif; max-width: 500px;">If you have any questions, reply to this email or contact us at support@webframez.com</div>`,

        isLogo: true,

        headerBgColor: '',
        contentBgColor: '',
        contentColor: '',
        footerBgColor: '',
        footerColor: '',
    }

    useEffect(() => {
        useEffectLite();
    }, [tempId]);

    async function useEffectLite() {
        const shopAPI = await shopApi.shop();
        setShopData(shopAPI)
        const getCurrentPlan = await appMetafield.getCurrentPlan();
        const planValue = parseInt(getCurrentPlan.currentPlan)
        setCurrentPlan(planValue);
        await utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
        });
        getDefaultData(planValue, shopAPI);
        // getModifiedData();
    }


    async function getDefaultData(planValue, shopAPI) {
        try {
            let getDefaultData = await fetch(`${serverURL}/get-email-reminder-checks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shopAPI.shopName,
                    language: `https://${shopAPI.domain}/`,
                    backInStock: JSON.stringify(backInStockData),
                    lowInStock: JSON.stringify(lowStockData),
                    priceDrop: JSON.stringify(priceDropData),
                    weeklyEmail: JSON.stringify(weeklyEmailData)
                }),
            })
            let results = await getDefaultData.json();

            if (results?.msg === "getting_data") {
                let defaultData = results?.data[0];

                let data2 = results?.data2[0];
                setEmailSenderName(data2?.sender_name || "");
                setReplyToEmail(data2?.reply_to || "");
                reset({
                    emailSendOption: defaultData.email_option,
                    backInStockMail: defaultData.back_in_stock,
                    lowInStockMail: defaultData.low_in_stock,
                    priceDropMail: defaultData.price_drop,
                    selectedDate: JSON.stringify(defaultData.selected_date)
                })
            }

            if (results?.msg === "inserted_data") {
                let defaultData = results?.data;
                reset({
                    emailSendOption: defaultData.email_option,
                    backInStockMail: defaultData.back_in_stock,
                    lowInStockMail: defaultData.low_in_stock,
                    priceDropMail: defaultData.price_drop
                })
            }
            setAppInstallId(results?.app_install_id)
            planValue >= 2 && getBlob(results)
            setIsLoading(true);
            await getTemplates(shopAPI)
            let checkElement = document.querySelector(".dontRunAgain");
            if (checkElement === null) {
                utilityFunction.upgradeButtonFxn();
            }
        } catch (error) {
            console.log("errr ", error)
        }
    };

    async function getBlob(result) {
        if (result.data[0].logo !== null) {
            const imageUrl = `${serverURL}/uploads/${result?.app_install_id}/${result?.data[0]?.logo}`;
            const imageResponse = await fetch(imageUrl);
            const blob = await imageResponse.blob();
            setFile(new File([blob], result?.data[0]?.logo, { type: blob.type }));
        }
        setAppInstallId(result?.app_install_id)
        // setAppInstallId(prev => result?.app_install_id ?? prev);

    }

    const saveToMetafield = async (data) => {

        // console.log("data", data)

        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        try {
            const userDatas = await fetch(`${serverURL}/email-reminder-checks-update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shopData.shopName,
                    emailOption: data.emailSendOption,
                    backInStockMail: data.backInStockMail,
                    lowInStockMail: data.lowInStockMail,
                    priceDropMail: data.priceDropMail,
                    selectedDate: data.selectedDate
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
            await saveSenderName();
            currentPlan >= 2 && await saveLogo()
            setSaveBar(false);
        } catch (error) {
            console.log("errr ", error)
        }
    };


    async function saveSenderName() {
        try {
            const userDatas = await fetch(`${serverURL}/save-sender-receiver-name`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shopData.shopName,
                    senderName: emailSenderName,
                    replyToEmail: replyToEmail
                }),
            })
            // let results = await userDatas.json();

        } catch (error) {
            console.log("errr ", error)
        }
    }

    async function saveLogo() {

        let formData = new FormData();
        formData.append('shopName', shopData.shopName);
        formData.append('id', appInstallId);
        formData.append('image', file);

        try {
            await axios.post(`${serverURL}/logo/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            console.error("Error uploading logo:", error);
        }
    }

    const handleDropZoneDrop = useCallback(
        (_dropFiles, acceptedFiles, _rejectedFiles) => {
            const isType = acceptedFiles[0].type === "image/png" ||
                acceptedFiles[0].type === "image/jpg" ||
                acceptedFiles[0].type === "image/jpeg"

            const isSizeValid = acceptedFiles[0].size <= 1_000_000;

            if (acceptedFiles.length > 0 && isType && isSizeValid) {
                setFile(acceptedFiles[0]);
                setSaveBar(true);
            } else {
                setFile(null);
                let errorMessage = myLanguage.imageErrorText;
                if (!isSizeValid) {
                    errorMessage = myLanguage.imageSizeError;
                }
                Swal.fire({
                    icon: "error",
                    text: errorMessage,
                    confirmButtonText: "Ok"
                });
            }
        },
        [myLanguage]
    );

    const fileUpload = !file ? <span className='addLogo'>Add logo</span> : <span className='addLogo'>Change logo</span>;

    const uploadedFile = file && (
        <div className='wf-upload-logo' style={{ padding: "20px" }}>
            <Thumbnail
                size="large"
                alt={file.name}
                source={window.URL.createObjectURL(file)}
            />
        </div>
    );

    async function getTemplates(shopAPI) {
        try {
            let getDefaultData = await fetch(`${serverURL}/get-email-temp-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shopAPI.shopName,
                    language: `https://${shopAPI.domain}/`,
                }),
            })
            let results = await getDefaultData.json();


            const mainResult =
                [
                    { temp_id: results.data[0].temp_id, senderName: results.data[0].sender_name, replyToMail: results.data[0].reply_to, type: "BackInStock", tempName: "Back In Stock", back_in_stock_temp: JSON.parse(results.data[0].back_in_stock_temp) },
                    { temp_id: results.data[0].temp_id, senderName: results.data[0].sender_name, replyToMail: results.data[0].reply_to, type: "LowInStock", tempName: "Low In Stock", low_in_stock_temp: JSON.parse(results.data[0].low_in_stock_temp) },
                    { temp_id: results.data[0].temp_id, senderName: results.data[0].sender_name, replyToMail: results.data[0].reply_to, type: "PriceDrop", tempName: "Price Drop", price_drop_temp: JSON.parse(results.data[0].price_drop_temp) },
                    { temp_id: results.data[0].temp_id, senderName: results.data[0].sender_name, replyToMail: results.data[0].reply_to, type: "WeeklyEmail", tempName: "Monthly Email", weekly_email_temp: JSON.parse(results.data[0].weekly_email_temp) },
                ];
            setTempData(mainResult)
        } catch (error) {
            console.log("errr ", error)
        }
    }

    let map = new Map();
    map.set("a", { val: 0 });
    map.get("a").val++;

    const langDataTable = tempData.map(
        ({ temp_id, tempName, type },) => [
            // <tr id={temp_id} key={temp_id} position={temp_id} className={`${(currentPlan < 3 && tempName !== "Monthly Email") ? "disableEverything under-pro" : ""}`}>



            <tr id={temp_id} key={temp_id} position={temp_id} className={`${currentPlan < 2 && tempName === "Monthly Email"
                ? "disableEverything under-basic"
                : currentPlan < 3 && tempName !== "Monthly Email"
                    ? "disableEverything under-pro"
                    : ""
                }`}>

                {/* <IndexTable.Row id={temp_id} key={temp_id} position={temp_id} > */}
                <IndexTable.Cell>  {map.get("a").val++}</IndexTable.Cell>
                <IndexTable.Cell>{tempName === "Back In Stock" ? myLanguage.backInStock : tempName === "Low In Stock" ? myLanguage.lowInStock : tempName === "Price Drop" ? myLanguage.priceDrop : myLanguage.weeklyEmail}</IndexTable.Cell>
                <IndexTable.Cell>
                    <div className='editBtn disable-app'>
                        <Button onClick={() => handleGoToEditTemplate(temp_id, type)} size='slim'>{myLanguage.editTempBtn}</Button>
                    </div>
                </IndexTable.Cell>
                {/* </IndexTable.Row> */}
            </tr>
        ],
    );

    const handleGoToEditTemplate = (id, type) => {
        searchParams.set("temp_id", id)
        searchParams.set("type", type)
        setTempId(id)
        setSaveBar(false)
        id !== undefined && navigate({ search: `?${searchParams.toString()}` });
    }

    const dataTOsend = {
        shopData: shopData,
        tempData: tempData,
        search: search,
        file: file,
        serverURL: serverURL,
        appInstallId: appInstallId,
        saveToMetafield: saveToMetafield,
        Swal: Swal,
        myLanguage: myLanguage,
        loaderGif: loaderGif,
        priceDropData: priceDropData,
        lowStockData: lowStockData,
        backInStockData: backInStockData,
        weeklyEmailData: weeklyEmailData,
        headerSave: headerSave,
        setHeaderSave: setHeaderSave,
        getTemplates: getTemplates
    }



    const handleChangeEmailSenderName = (value) => {
        setEmailSenderName(prevState => prevState = value)
        setSaveBar(true);
    }

    const handleChangeReplyToEmail = (value) => {
        setReplyToEmail(prevState => prevState = value)
        setSaveBar(true);
    }



    function default30days() {
        const days = Array.from({ length: 30 }, (_, i) => {
            const day = (i + 1).toString();
            return { value: day, label: day };
        });
        return [{ value: "", label: "Choose" }, ...days];
    }


    return (
        <div className='wf-dashboard  wf-addCartButton'>
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    {tempId === null ?
                        <>
                            <form onSubmit={handleSubmit(saveToMetafield)}>
                                {(saveBar) ? <SaveBar save={myLanguage.save} /> : ""}
                                <Page fullWidth
                                    title={myLanguage.overValueB11}
                                    subtitle={myLanguage.overValue11}
                                    backAction={{
                                        onAction: () => {
                                            history.back();
                                        },
                                    }}
                                >

                                    <div className='wf-style-wishbtn'>
                                        {/* <div className={`${currentPlan >= 2 ? "" : "disableEverything under-premium"}`} > */}
                                        <AlphaCard>
                                            <div className='pb-15'>
                                                <Text variant="headingMd" as="h2">{myLanguage.emailSettingHeading}</Text>
                                                <p>{myLanguage.emailSettingSubText}</p>
                                            </div>
                                            {/* <SingleFieldController
                                            name="emailSendOption"
                                            control={control}  >
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.emsValue1}
                                                    value={field.value}
                                                    id="weekly"
                                                    checked={field.value === "weekly" && true}
                                                    onChange={() => {
                                                        field.onChange("weekly"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController> */}

                                            <SingleFieldController
                                                name="emailSendOption"
                                                control={control}  >
                                                {({ field }) =>
                                                    <RadioButton
                                                        label={myLanguage.emsValue2}
                                                        value={field.value}
                                                        id="monthly"
                                                        checked={field.value === "monthly" && true}
                                                        onChange={() => {
                                                            field.onChange("monthly"),
                                                                setSaveBar(true);
                                                        }}
                                                    />
                                                }
                                            </SingleFieldController>

                                            <SingleFieldController
                                                name="emailSendOption"
                                                control={control}  >
                                                {({ field }) =>
                                                    <RadioButton
                                                        label={myLanguage.emsValue3}
                                                        value={field.value}
                                                        id="turnOff"
                                                        checked={field.value === "turnOff" && true}
                                                        onChange={() => {
                                                            field.onChange("turnOff"),
                                                                setSaveBar(true);
                                                        }}
                                                    />
                                                }
                                            </SingleFieldController>


                                            {watchAllFields.emailSendOption === "monthly" ?
                                                <div>
                                                    <br />
                                                    <label>On which date you want to send your monthly email to your users </label>
                                                    <div style={{ width: "100px" }}><SingleFieldController name="selectedDate" control={control}  >
                                                        {({ field }) => <Select
                                                            options={default30days()}
                                                            onChange={(value) => { field.onChange(value), setSaveBar(true) }}
                                                            value={field.value}
                                                        />}
                                                    </SingleFieldController>
                                                    </div>
                                                </div> : <></>}




                                        </AlphaCard>
                                    </div>
                                    {/* </div> */}

                                    {/* ---------------------------Back in stock email--------------------------- */}

                                    <div className='wf-style-wishbtn'>
                                        <div className={`${currentPlan >= 3 ? "" : "disableEverything under-pro"}`} >
                                            <div className='wf-showCount-box'>
                                                <div className='pb-15'>
                                                    <Text variant="headingMd" as="h2">{myLanguage.backInStockHeading}</Text>
                                                    <p>{myLanguage.backInStockHeading}</p>
                                                </div>
                                                {currentPlan >= 3 &&
                                                    <div className='wf-dashboard-yes-no-toggle'>
                                                        <div className='toggle-paid-inner'>
                                                            <label id='backInStockYes' className={`${watchAllFields.backInStockMail === "yes" ? "activeToggle" : ""}`}>
                                                                {myLanguage.styleHoverYes}
                                                                <SingleFieldController
                                                                    name="backInStockMail"
                                                                    control={control}  >
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

                                                            <label id='backInStockNo' className={`${watchAllFields.backInStockMail === "no" ? "activeToggle" : ""}`}>
                                                                {myLanguage.styleHoverNo}
                                                                <SingleFieldController
                                                                    name="backInStockMail"
                                                                    control={control}  >
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
                                    </div>

                                    {/* ---------------------------------Low in stock ------------------------------------ */}

                                    <div className='wf-style-wishbtn'>
                                        <div className={`${currentPlan >= 3 ? "" : "disableEverything under-pro"}`} >
                                            <div className='wf-showCount-box'>
                                                <div className='pb-15'>
                                                    <Text variant="headingMd" as="h2">{myLanguage.lowInStockHeading}</Text>
                                                    <p>{myLanguage.lowInStockHeading}</p>
                                                </div>

                                                {currentPlan >= 3 &&
                                                    <div className='wf-dashboard-yes-no-toggle'>
                                                        <div className='toggle-paid-inner'>
                                                            <label id='lowInStockYes' className={`${watchAllFields.lowInStockMail === "yes" ? "activeToggle" : ""}`}>
                                                                {myLanguage.styleHoverYes}
                                                                <SingleFieldController
                                                                    name="lowInStockMail"
                                                                    control={control}  >
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

                                                            <label id='lowInStockNo' className={`${watchAllFields.lowInStockMail === "no" ? "activeToggle" : ""}`}>
                                                                {myLanguage.styleHoverNo}
                                                                <SingleFieldController
                                                                    name="lowInStockMail"
                                                                    control={control}  >
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
                                    </div>


                                    {/* --------------------------------Price drop------------------------------------ */}

                                    <div className='wf-style-wishbtn'>
                                        <div className={`${currentPlan >= 3 ? "" : "disableEverything under-pro"}`} >
                                            <div className='wf-showCount-box'>
                                                <div className='pb-15'>
                                                    <Text variant="headingMd" as="h2">{myLanguage.priceDropHeading}</Text>
                                                    <p>{myLanguage.priceDropHeading}</p>
                                                </div>
                                                {currentPlan >= 3 &&
                                                    <div className='wf-dashboard-yes-no-toggle'>
                                                        <div className='toggle-paid-inner'>
                                                            <label id='priceDropYes' className={`${watchAllFields.priceDropMail === "yes" ? "activeToggle" : ""}`}>
                                                                {myLanguage.styleHoverYes}
                                                                <SingleFieldController
                                                                    name="priceDropMail"
                                                                    control={control}  >
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

                                                            <label id='priceDropNo' className={`${watchAllFields.priceDropMail === "no" ? "activeToggle" : ""}`}>
                                                                {myLanguage.styleHoverNo}
                                                                <SingleFieldController
                                                                    name="priceDropMail"
                                                                    control={control}  >
                                                                    {({ field }) =>
                                                                        <RadioButton
                                                                            label="No"
                                                                            value={field.value}
                                                                            // id="no"
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
                                    </div>

                                    {/* --------------------------------Logo------------------------------------ */}

                                    <div className='wf-style-wishbtn'>
                                        <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                            <AlphaCard>
                                                <div className='pb-15'>
                                                    <Text variant="headingMd" as="h2">{myLanguage.uploadHeading}</Text>
                                                    <p>{myLanguage.uploadSubHeading}</p>
                                                </div>

                                                <div className='wf-dropZone'>
                                                    <DropZone allowMultiple={false} onDrop={handleDropZoneDrop}>
                                                        {fileUpload}
                                                    </DropZone>

                                                    <div className='wf-imageValidation'>
                                                        <Text variant="headingLg" as="h2">{myLanguage.noteHeading}</Text>
                                                        <ul>
                                                            <li>{myLanguage.imageErrorText}</li>
                                                            <li>{myLanguage.imageSize}</li>
                                                        </ul>
                                                    </div>
                                                    {uploadedFile}
                                                </div>
                                            </AlphaCard>
                                        </div>
                                    </div>

                                    <div className='wf-dashboard-box'>
                                        <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                            <Grid>
                                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                                    <div className='pb-15'>
                                                        <Text variant="headingMd" as="h2">{myLanguage.senderName}</Text>
                                                        <p>{myLanguage.senderNameSub}</p>
                                                    </div>
                                                    <div className='pb-15'>
                                                        <TextField
                                                            value={emailSenderName}
                                                            onChange={handleChangeEmailSenderName}
                                                            autoComplete="off"
                                                        />
                                                    </div>
                                                </Grid.Cell>
                                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>

                                                    <div className='pb-15'>
                                                        <Text variant="headingMd" as="h2">{myLanguage.replyToEmail}</Text>
                                                        <p>{myLanguage.replyToEmailSub}</p>
                                                    </div>
                                                    <div className='pb-15'>
                                                        <TextField
                                                            value={replyToEmail}
                                                            onChange={handleChangeReplyToEmail}
                                                            autoComplete="off"
                                                        />
                                                    </div>
                                                </Grid.Cell>
                                            </Grid>
                                        </div>
                                    </div>

                                    {/* --------------------------------Template Table------------------------------------ */}

                                    <div className='wf-style-wishbtn'>
                                        {/* <div className={`${currentPlan >= 3 ? "" : "disableEverything under-pro"}`} > */}
                                        <div className='pb-15'>
                                            <Text variant="headingLg" as="h2">{myLanguage.tempHeading}</Text>
                                            <p>{myLanguage.editTempSubHeading}</p>
                                        </div>

                                        <LegacyCard>
                                            <IndexTable
                                                itemCount={tempData.length}
                                                selectable={false}
                                                headings={[
                                                    { title: myLanguage.tableSrno },
                                                    { title: myLanguage.editTemp },
                                                    { title: myLanguage.actions },
                                                ]}
                                            >
                                                {langDataTable}
                                            </IndexTable>
                                        </LegacyCard>
                                        {/* </div> */}
                                    </div>



                                    <div style={{ marginTop: "40px" }}>
                                        <Footer myLanguage={myLanguage} />
                                    </div>
                                </Page>
                            </form>
                        </>
                        :
                        <Page fullWidth
                            title={myLanguage.editorHeading}
                            subtitle={myLanguage.editTempSubHeading}
                            backAction={{
                                onAction: () => {
                                    history.back();


                                    // setTimeout(() => {
                                    //     location.reload();
                                    // }, 100); // Small delay to ensure the navigation completes before refreshing


                                    setTempId(null);
                                    setHeaderSave(false)
                                },
                            }}
                        >



                            <EditTemplate value={dataTOsend} />

                            <div style={{ marginTop: "40px" }}>
                                <Footer myLanguage={myLanguage} />
                            </div>
                        </Page>
                    }
                </Frame>
            }
        </div>
    )
}

export default EmailSetting