import React, { useEffect, useRef, useState } from 'react';
import useAppMetafield from '../../hooks/useAppMetafield';
import useUtilityFunction from '../../hooks/useUtilityFunction';
import { useForm } from 'react-hook-form';
import SkeletonPage1 from '../SkeletonPage1';
import { Button, Checkbox, Frame, Page, RadioButton, Text, TextField } from '@shopify/polaris';
import SaveBar from '../SaveBar';
import Swal from 'sweetalert2';
import SingleFieldController from '../../hooks/useSingleFieldController';
import loaderGif from "../loaderGreen.gif";
import Footer from '../Footer';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { Constants } from '../../../backend/constants/constant';
import useApi from '../../hooks/useApi';
import { getSessionToken } from '@shopify/app-bridge-utils';
import createApp from "@shopify/app-bridge";

const ShareWishlistSetting = () => {

    const hostValue = sessionStorage.getItem("shopify_host")
    const app = createApp({
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host: new URLSearchParams(window.location.search).get("host") || hostValue,
        forceRedirect: true,
    });

    const { serverURL } = Constants;
    const { handleSubmit, watch, control, reset, formState: { errors } } = useForm();
    const appMetafield = useAppMetafield();
    const [saveBar, setSaveBar] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const utilityFunction = useUtilityFunction();
    const [currentPlan, setCurrentPlan] = useState(0);
    const existingData = useRef([]);
    const [myLanguage, setMyLanguage] = useState({});
    const [editorStateFirst, setEditorStateFirst] = useState(EditorState.createEmpty());
    const [shareToAdminEditor, setShareToAdminEditor] = useState(EditorState.createEmpty());
    const shopApi = useApi();
    const [getShopApi, setGetShopApi] = useState(null);
    const saveAdminEmailRef = useRef("");
    const watchAllFields = watch();

    useEffect(() => {
        useEffectLite();
    }, []);

    async function useEffectLite() {
        await utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
        });
        let shop = await shopApi.shop();
        setGetShopApi(shop);
        await getShareToAdminEmail(shop);
        const getCurrentPlan = await appMetafield.getCurrentPlan();
        setCurrentPlan(parseInt(getCurrentPlan.currentPlan));
        await getAllAppDataMetafields();
    }

    async function getShareToAdminEmail(shop) {
        try {
            let response = await fetch(`${serverURL}/get-share-wishlist-to-admin-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shop.shopName,
                }),
            });
            let results = await response.json();
            if (results?.data?.length > 0) {
                saveAdminEmailRef.current = results?.data[0]?.shop_email || "";
            } else {
                saveAdminEmailRef.current = "";
            }
        } catch (error) {
            console.log("error", error);
        }
    }


    async function getAllAppDataMetafields() {
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "general-setting") {
                setIsLoading(true);
                utilityFunction.goToSectionFxn();
                let checkElement = document.querySelector(".dontRunAgain");
                if (checkElement === null) {
                    utilityFunction.upgradeButtonFxn();
                }
                let dData = JSON.parse(dataArray[i].node.value);
                existingData.current = dData;
                let shouldSave = false

                if (dData.whatsappCheckIcon === undefined) {
                    shouldSave = true
                    dData.facebookCheckIcon = true;
                    dData.whatsappCheckIcon = true;
                    dData.instagramCheckIcon = true;
                    dData.telegramCheckIcon = true;
                    dData.linkedinCheckIcon = true;
                    dData.twitterCheckIcon = true;
                    dData.fbMessengerCheckIcon = true;
                }
                shouldSave && await saveMetaFxn(dData)

                reset({
                    wishlistShareShowData: dData.wishlistShareShowData,
                    wishlistShareEmailSubject: returnNewData(dData.wishlistShareEmailSubject, "subject"),
                    wishlistTextEditor: dData.wishlistTextEditor,
                    buttonTypeShareWishlist: dData.buttonTypeShareWishlist,
                    // copyCheckIcon: dData?.copyCheckIcon,
                    facebookCheckIcon: dData?.facebookCheckIcon,
                    whatsappCheckIcon: dData?.whatsappCheckIcon,
                    instagramCheckIcon: dData?.instagramCheckIcon,
                    telegramCheckIcon: dData?.telegramCheckIcon,
                    linkedinCheckIcon: dData?.linkedinCheckIcon,
                    twitterCheckIcon: dData?.twitterCheckIcon,
                    fbMessengerCheckIcon: dData?.fbMessengerCheckIcon,
                    shareWishlistToAdmin: dData?.shareWishlistToAdmin || "no",

                    shareWishlistToAdminSubject: returnNewData(dData?.shareWishlistToAdminSubject || dData.wishlistShareEmailSubject, "subject"),
                    shareWishlistToAdminTextEditor: dData?.shareWishlistToAdminTextEditor || dData.wishlistTextEditor,
                    shareWishlistToAdminEmail: saveAdminEmailRef?.current || ""

                })
                setEditorStateFirst(htmlToDraftFxn(returnNewData(dData.wishlistTextEditor, "reciever") || ""));
                setShareToAdminEditor(htmlToDraftFxn(returnNewData(dData?.shareWishlistToAdminTextEditor || dData.wishlistTextEditor, "reciever") || ""));

            }
        }
    }

    function returnNewData(data, type) {
        const defData = "<p><b>Hello Dear Friend!</b></p><p>##wishlist_share_email_customer_name## filled out this wishlist and asked us to forward it to you. You can simply click on the button below to see it at our online store and easily make your purchase.</p><p style=text-align: center;><a href=##wishlist_share_email_wishlist_url## style=background-color: Crimson;border-radius: 5px;color: white;padding: 0.5em;text-decoration: none;target=_blank>Go to wishlist</a></p><p>Message for you:</p><p>##wishlist_share_email_customer_message##</p>"
        const newData = "<p>Hello <b>{wishlist_share_email_reciever_name}!</b></p><p>{wishlist_share_email_sender_name} filled out this wishlist and asked us to forward it to you. You can simply click on the button below to see it at our online store and easily make your purchase.</p><p style=text-align: center;><a href={wishlist_share_email_wishlist_url} style=background-color: Crimson;border-radius: 5px;color: white;padding: 0.5em;text-decoration: none;target=_blank>Go to wishlist</a></p><p>Message for you:</p><p>{wishlist_share_email_customer_message}</p>"
        const defData2 = "<p><b>Hello Dear Friend!</b></p><p>{wishlist_share_email_customer_name} filled out this wishlist and asked us to forward it to you. You can simply click on the button below to see it at our online store and easily make your purchase.</p><p style=text-align: center;><a href={wishlist_share_email_wishlist_url} style=background-color: Crimson;border-radius: 5px;color: white;padding: 0.5em;text-decoration: none;target=_blank>Go to wishlist</a></p><p>Message for you:</p><p>{wishlist_share_email_customer_message}</p>"
        if (type === "subject") {
            data = data.replace(/##wishlist_share_email_customer_name##/g, `{wishlist_share_email_sender_name}`);
            data = data.replace(/{wishlist_share_email_customer_name}/g, `{wishlist_share_email_sender_name}`);
        }
        if (data === defData || data === defData2) {
            let saveData = { ...existingData.current };
            saveData.wishlistTextEditor = newData;
            data = newData
            saveMetaFxn(saveData)
        }
        data = data.replace(/##wishlist_share_email_wishlist_url##/g, `{wishlist_share_email_wishlist_url}`);
        data = data.replace(/##wishlist_share_email_customer_message##/g, `{wishlist_share_email_customer_message}`);
        data = data.replace(/##wishlist_share_email_static_data##/g, `{wishlist_share_email_static_data}`);

        return data
    }

    const htmlToDraftFxn = (html) => {
        const blocksFromHtml = htmlToDraft(html);
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
        return EditorState.createWithContent(contentState);
    };

    const saveToMetafield = async (data) => {
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });

        let mergedData = { ...existingData.current };

        const bodyData = getEditorStateContent(editorStateFirst);
        const shareToAdminBodyData = getEditorStateContent(shareToAdminEditor);

        mergedData.wishlistShareShowData = data.wishlistShareShowData;
        mergedData.wishlistShareEmailSubject = data.wishlistShareEmailSubject;
        mergedData.wishlistTextEditor = bodyData;
        mergedData.buttonTypeShareWishlist = data.buttonTypeShareWishlist;
        // mergedData.copyCheckIcon = data.copyCheckIcon;
        mergedData.facebookCheckIcon = data.facebookCheckIcon;
        mergedData.whatsappCheckIcon = data.whatsappCheckIcon;
        mergedData.instagramCheckIcon = data.instagramCheckIcon;
        mergedData.telegramCheckIcon = data.telegramCheckIcon;
        mergedData.linkedinCheckIcon = data.linkedinCheckIcon;
        mergedData.twitterCheckIcon = data.twitterCheckIcon;
        mergedData.fbMessengerCheckIcon = data.fbMessengerCheckIcon;
        mergedData.shareWishlistToAdmin = data.shareWishlistToAdmin;

        mergedData.shareWishlistToAdminSubject = data.shareWishlistToAdminSubject;
        mergedData.shareWishlistToAdminTextEditor = shareToAdminBodyData;

        await saveDataInSql(data);


        await saveMetaFxn(mergedData).then((res) => {
            Swal.fire({
                icon: "success",
                title: myLanguage.swalHeading,
                text: myLanguage.swalText,
                confirmButtonText: myLanguage.swalOk
            });
        });
        setSaveBar(false);
    };


    async function saveDataInSql(data) {

        try {
            const response = await fetch(`${serverURL}/save-share-wishlist-to-admin-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: getShopApi.shopName,
                    newEmail: data?.shareWishlistToAdminEmail || "",
                }),
            });
            let result = response.json();
        } catch (error) {
            console.log("error ", error)
        }

    }

    async function saveMetaFxn(mergedData) {
        const getAppMetafieldId = await appMetafield.getAppMetafieldId();
        const appMetadata = {
            key: "general-setting",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: JSON.stringify(mergedData).replace(/'/g, '~')
            // value: JSON.stringify(mergedData)

        };
        await appMetafield.createAppMetafield(appMetadata)
    }

    const getEditorStateContent = (editorState) => {
        const contentState = editorState.getCurrentContent();
        return draftToHtml(convertToRaw(contentState));
    };

    function replaceData(str) {
        str = str.replace(/{wishlist_share_email_sender_name}/g, "Sender Name");
        str = str.replace(/{wishlist_share_email_reciever_name}/g, "Reciever Name");
        str = str.replace(/{wishlist_share_email_wishlist_url}/g, "yourshop.myshopify.com");
        str = str.replace(/{wishlist_share_email_customer_message}/g, "This is test message");
        str = str.replace(/{wishlist_share_email_static_data}/g, "Table should be here");
        return str
    }

    const sendTestEmail = (data) => {
        let bodyContent;
        let emailSubject
        if (data === "adminShare") {
            const bodyData = getEditorStateContent(shareToAdminEditor);
            bodyContent = replaceData(bodyData);
            emailSubject = replaceData(watchAllFields.shareWishlistToAdminSubject)
        } else {
            const bodyData = getEditorStateContent(editorStateFirst);
            bodyContent = replaceData(bodyData);
            emailSubject = replaceData(watchAllFields.wishlistShareEmailSubject)
        }

        // const bodyData = getEditorStateContent(editorStateFirst);
        // const bodyContent = replaceData(bodyData);
        // const emailSubject = replaceData(watchAllFields.wishlistShareEmailSubject)

        Swal.fire({
            text: myLanguage.sendTestEmail,
            input: "email",
            inputAttributes: {
                autocapitalize: "off",
                placeholder: myLanguage.emailPlaceholder
            },
            showCancelButton: true,
            confirmButtonText: myLanguage.sendButton,
            cancelButtonText: myLanguage.swalButtonCancelText,
            showLoaderOnConfirm: true,
            preConfirm: async (inputValue) => {
                try {
                    const token = await getSessionToken(app);
                    const response = await fetch(`${serverURL}/send-test-email`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            recieverEmail: inputValue,
                            subject: emailSubject,
                            htmlContent: bodyContent
                        }),
                    });

                    if (!response.ok) {
                        return Swal.showValidationMessage(`
                  ${JSON.stringify(await response.json())}
                `);
                    }
                    return response.json();
                } catch (error) {
                    Swal.showValidationMessage(`
                Request failed: ${error}
              `);
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: `success`,
                    text: myLanguage.emailSentText
                });
            }
        });
    }

    return (
        <div className='wf-dashboard wf-dashboard-shareWishlist'>
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    <form onSubmit={handleSubmit(saveToMetafield)}>
                        {(saveBar) ? <SaveBar save={myLanguage.save} /> : ""}
                        <Page fullWidth
                            title={myLanguage.overValueB12}
                            subtitle={myLanguage.overValue12}
                            backAction={{ onAction: () => history.back() }}
                        >
                            <div id="share-wishlist-section">
                                <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                    <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"}`} >
                                        <div className='custom-margin'>
                                            <Text variant="headingMd" as="h2">{myLanguage.shareWishlistSubHeading}</Text>
                                            <p>{myLanguage.shareWishlistText}</p>
                                        </div>

                                        <SingleFieldController
                                            name="wishlistShareShowData"
                                            control={control}  >
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.shareWishlistValue1}
                                                    value={field.value} id="loggedinuser"
                                                    checked={field.value === "loggedinuser" && true} onChange={() => {
                                                        field.onChange("loggedinuser"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="wishlistShareShowData"
                                            control={control}  >
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.shareWishlistValue2}
                                                    value={field.value} id="guestuser"
                                                    checked={field.value === "guestuser" && true} onChange={() => {
                                                        field.onChange("guestuser"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>
                                    </div>
                                </div>

                                <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                    <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"}`} >
                                        <div className='custom-margin'>
                                            <Text variant="headingMd" as="h2">{myLanguage.shareWishlistButtonTypeHeading}</Text>
                                            <p>{myLanguage.shareWishlistButtonTypeSubHeading}</p>
                                        </div>

                                        <SingleFieldController
                                            name="buttonTypeShareWishlist"
                                            control={control}  >
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.shareWishlistButtonTypeValue1}
                                                    value={field.value} id="asIcon"
                                                    checked={field.value === "asIcon" && true} onChange={() => {
                                                        field.onChange("asIcon"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="buttonTypeShareWishlist"
                                            control={control}  >
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.shareWishlistButtonTypeValue2}
                                                    value={field.value} id="asButton"
                                                    checked={field.value === "asButton" && true} onChange={() => {
                                                        field.onChange("asButton"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>
                                    </div>
                                </div>



                                <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                    <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"}`} >
                                        <div className='custom-margin'>
                                            <Text variant="headingMd" as="h2">{myLanguage.shareToAdminWishlist}</Text>
                                            <p>{myLanguage.shareToAdminWishlistSub}</p>
                                        </div>

                                        <SingleFieldController
                                            name="shareWishlistToAdmin"
                                            control={control}  >
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.styleHoverYes}
                                                    value={field.value} id="yes"
                                                    checked={field.value === "yes" && true} onChange={() => {
                                                        field.onChange("yes"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="shareWishlistToAdmin"
                                            control={control}  >
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.styleHoverNo}
                                                    value={field.value} id="no"
                                                    checked={field.value === "no" && true} onChange={() => {
                                                        field.onChange("no"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        {/*

                                        {watchAllFields.shareWishlistToAdmin === "yes" &&
                                            <div style={{ width: "50%" }}>
                                                <SingleFieldController
                                                    name="shareWishlistToAdminEmail"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <TextField
                                                            id={`shareWishlistToAdminEmail`}
                                                            value={field.value}
                                                            label={"Enter a valid email address where you want to receive these emails"}
                                                            onChange={(newValue) => {
                                                                setSaveBar(true);
                                                                field.onChange(newValue);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>
                                            </div>
                                        }


                                         */}


                                    </div>
                                </div>







                                {/* SHARE EMAIL CHECK BOXES */}
                                <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                    <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"}`} >
                                        <div className='custom-margin'>
                                            <Text variant="headingMd" as="h2">{myLanguage.shareWishlistOptionHeading}</Text>
                                            <p>{myLanguage.shareWishlistOptionSubHeading}</p>
                                        </div>

                                        {/* <SingleFieldController
                                            name="copyCheckIcon"
                                            control={control}
                                        >
                                            {({ field }) =>
                                                <Checkbox
                                                    label={myLanguage.copyCheckIconText}
                                                    value={"via link"}
                                                    id="via-link"
                                                    checked={field.value}
                                                    onChange={(checked) => {
                                                        field.onChange(checked),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController> */}

                                        <SingleFieldController
                                            name="facebookCheckIcon"
                                            control={control}
                                        >
                                            {({ field }) =>
                                                <Checkbox
                                                    label={myLanguage.facebookCheckIconText}
                                                    value={"facebook"}
                                                    id="facebook"
                                                    checked={field.value}
                                                    onChange={(checked) => {
                                                        field.onChange(checked),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="whatsappCheckIcon"
                                            control={control}
                                        >
                                            {({ field }) =>
                                                <Checkbox
                                                    label={myLanguage.whatsappCheckIconText}
                                                    value={"whatsapp"}
                                                    id="whatsapp"
                                                    checked={field.value}
                                                    onChange={(checked) => {
                                                        field.onChange(checked),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="linkedinCheckIcon"
                                            control={control}
                                        >
                                            {({ field }) =>
                                                <Checkbox
                                                    label={myLanguage.linkedinCheckIconText}
                                                    value={"linkedin"}
                                                    id="linkedin"
                                                    checked={field.value}
                                                    onChange={(checked) => {
                                                        field.onChange(checked),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="telegramCheckIcon"
                                            control={control}
                                        >
                                            {({ field }) =>
                                                <Checkbox
                                                    label={myLanguage.telegramCheckIconText}
                                                    value={"telegram"}
                                                    id="telegram"
                                                    checked={field.value}
                                                    onChange={(checked) => {
                                                        field.onChange(checked),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="instagramCheckIcon"
                                            control={control}
                                        >
                                            {({ field }) =>
                                                <Checkbox
                                                    label={myLanguage.instagramCheckIconText}
                                                    value={"instagram"}
                                                    id="instagram"
                                                    checked={field.value}
                                                    onChange={(checked) => {
                                                        field.onChange(checked),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="twitterCheckIcon"
                                            control={control}
                                        >
                                            {({ field }) =>
                                                <Checkbox
                                                    label={myLanguage.twitterCheckIconText}
                                                    value={"twitter"}
                                                    id="twitter"
                                                    checked={field.value}
                                                    onChange={(checked) => {
                                                        field.onChange(checked),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="fbMessengerCheckIcon"
                                            control={control}
                                        >
                                            {({ field }) =>
                                                <Checkbox
                                                    label={myLanguage.fbMessengerCheckIconText}
                                                    value={"fbMessenger"}
                                                    id="fbMessenger"
                                                    checked={field.value}
                                                    onChange={(checked) => {
                                                        field.onChange(checked),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>
                                    </div>
                                </div>

                                <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                    <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"}`} >
                                        <div className='wf-previewDiv' style={{ marginBottom: '20px' }}>
                                            <div className='custom-margin'>
                                                <Text variant="headingMd" as="h2">
                                                    {myLanguage.shareWishlistAdvanceHeading}
                                                </Text>

                                                <p>
                                                    {myLanguage.shareWishlistAdvanceText}
                                                </p>
                                            </div>

                                            {currentPlan >= 4 &&
                                                <div className='editBtn disable-app'>
                                                    <Button onClick={() => sendTestEmail("share")}>{myLanguage.sendTestEmail}</Button>
                                                </div>
                                            }
                                        </div>

                                        <SingleFieldController
                                            name="wishlistShareEmailSubject"
                                            control={control}  >
                                            {({ field }) =>
                                                <TextField
                                                    id={`wishlistShareEmailSubject`}
                                                    value={field.value}
                                                    label={myLanguage.emailSubject}
                                                    onChange={(newValue) => {
                                                        setSaveBar(true);
                                                        field.onChange(newValue);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <p style={{ margin: '5px 0' }}>
                                            {myLanguage.emailSubjectText}
                                        </p>

                                        <ul>
                                            <li>{`{wishlist_share_email_sender_name} Use this token to show SENDER NAME.`}</li>
                                            <li>{`{wishlist_share_email_reciever_name} Use this token to show RECEIVER NAME.`}</li>
                                            <li>{`{wishlist_share_email_customer_message} Use this token to show CUSTOMER MESSAGE`}</li>
                                            <li>{`{wishlist_share_email_wishlist_url} Use this token to show CUSTOMER WISHLIST PAGE LINK.`}</li>
                                            <li>{`{wishlist_share_email_static_data} Use this token to show CURRENT USER WISHLIST IN TABLE FORMAT.`}</li>
                                        </ul>

                                        <SingleFieldController
                                            name="wishlistTextEditor"
                                            control={control}  >
                                            {({ field }) =>
                                                <Editor
                                                    editorState={editorStateFirst}
                                                    onEditorStateChange={(wishlistTextEditor) => {
                                                        field.onChange(wishlistTextEditor);
                                                        setEditorStateFirst(wishlistTextEditor)
                                                        setSaveBar(true);
                                                    }}


                                                    toolbar={{
                                                        options: [
                                                            'inline',
                                                            'blockType',
                                                            'fontSize',
                                                            'fontFamily',
                                                            'list',
                                                            'textAlign',
                                                            'colorPicker',
                                                            'link',
                                                            'embedded',
                                                            'emoji',
                                                            'remove',
                                                            'history',
                                                        ],
                                                        fontFamily: {
                                                            options: [
                                                                'Arial',
                                                                'Georgia',
                                                                'Impact',
                                                                'Tahoma',
                                                                'Times New Roman',
                                                                'Verdana',
                                                                'Courier New',
                                                                'Montserrat', // ✅ Added Montserrat
                                                                'Poppins',    // ✅ added
                                                            ],
                                                        },
                                                    }}

                                                />
                                            }
                                        </SingleFieldController>
                                    </div>
                                </div>

                                <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                    <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"}`} >
                                        <div className='wf-previewDiv' style={{ marginBottom: '20px' }}>
                                            <div className='custom-margin'>
                                                <Text variant="headingMd" as="h2">
                                                    Share wishlist to admin
                                                </Text>

                                                <p>
                                                    Users can share the wishlist to admin through mail
                                                </p>
                                            </div>

                                            {currentPlan >= 4 &&
                                                <div className='editBtn disable-app'>
                                                    <Button onClick={() => sendTestEmail("adminShare")}>{myLanguage.sendTestEmail}</Button>
                                                </div>
                                            }
                                        </div>

                                        <SingleFieldController
                                            name="shareWishlistToAdminEmail"
                                            control={control}  >
                                            {({ field }) =>
                                                <TextField
                                                    id={`shareWishlistToAdminEmail`}
                                                    value={field.value}
                                                    label={"Enter a valid email address where you want to receive these emails"}
                                                    onChange={(newValue) => {
                                                        setSaveBar(true);
                                                        field.onChange(newValue);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="shareWishlistToAdminSubject"
                                            control={control}  >
                                            {({ field }) =>
                                                <TextField
                                                    id={`shareWishlistToAdminSubject`}
                                                    value={field.value}
                                                    label={myLanguage.emailSubject}
                                                    onChange={(newValue) => {
                                                        setSaveBar(true);
                                                        field.onChange(newValue);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <p style={{ margin: '5px 0' }}>
                                            {/* {myLanguage.emailSubjectText}  */}
                                            This is to share the wishlist by the users to the store owner
                                        </p>

                                        <ul>
                                            <li>{`{wishlist_share_email_sender_name} Use this token to show SENDER NAME.`}</li>
                                            <li>{`{wishlist_share_email_reciever_name} Use this token to show RECEIVER NAME.`}</li>
                                            <li>{`{wishlist_share_email_customer_message} Use this token to show CUSTOMER MESSAGE`}</li>
                                            <li>{`{wishlist_share_email_wishlist_url} Use this token to show CUSTOMER WISHLIST PAGE LINK.`}</li>
                                            <li>{`{wishlist_share_email_static_data} Use this token to show CURRENT USER WISHLIST IN TABLE FORMAT.`}</li>
                                        </ul>

                                        <SingleFieldController
                                            name="shareWishlistToAdminTextEditor"
                                            control={control} >
                                            {({ field }) =>
                                                <Editor
                                                    editorState={shareToAdminEditor}
                                                    onEditorStateChange={(wishlistTextEditor) => {
                                                        field.onChange(wishlistTextEditor);
                                                        setShareToAdminEditor(wishlistTextEditor)
                                                        setSaveBar(true);
                                                    }}

                                                    toolbar={{
                                                        options: [
                                                            'inline',
                                                            'blockType',
                                                            'fontSize',
                                                            'fontFamily',
                                                            'list',
                                                            'textAlign',
                                                            'colorPicker',
                                                            'link',
                                                            'embedded',
                                                            'emoji',
                                                            'remove',
                                                            'history',
                                                        ],
                                                        fontFamily: {
                                                            options: [
                                                                'Arial',
                                                                'Georgia',
                                                                'Impact',
                                                                'Tahoma',
                                                                'Times New Roman',
                                                                'Verdana',
                                                                'Courier New',
                                                                'Montserrat', // ✅ Added Montserrat
                                                                'Poppins',    // ✅ added
                                                            ],
                                                        },
                                                    }}

                                                />
                                            }
                                        </SingleFieldController>
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
        </div>
    )
}


export default ShareWishlistSetting;