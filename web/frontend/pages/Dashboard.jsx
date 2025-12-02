import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import useAppMetafield from '../hooks/useAppMetafield';
import SkeletonPage1 from './SkeletonPage1';
import { Frame, LegacyStack, Toast, AlphaCard, Page, Grid, Button, ButtonGroup, Text, Select, Modal, Badge, Spinner, Collapsible, DataTable } from '@shopify/polaris';
import {
    LockMinor,
    ChatMajor
} from '@shopify/polaris-icons';
import useApi from '../hooks/useApi';
import { useAuthenticatedFetch } from '../hooks';
import RequestFormModal from './RequestFormModal';
import useSwal from "../hooks/useSwal"
import useUtilityFunction from '../hooks/useUtilityFunction';
import CheckIcon from '../assets/white-check-icon.svg';
import { useNavigate } from 'react-router-dom';
import PlanComponent from './PlanComponent';
import { Constants } from '../../backend/constants/constant';
import addtocart from '../assets/wf-quick-cart.svg';
import wfQuickLanguage from '../assets/wf-quick-language.svg';
import wfQuickWishlist from '../assets/wf-quick-wishlist.svg';
import wfQuickCollection from '../assets/wf-quick-collection.svg';
import wfQuickCustomCode from '../assets/wf-quick-custom-code.svg';
import wfQuickEmail from '../assets/wf-quick-email.svg';
import youtubeIcon from '../assets/youtubeIcon.svg';
import wfQuickShare from '../assets/wf-quick-share.svg';
import collapsibleArrow from '../assets/arrowss.png';
import collapsibleArrowUp from '../assets/arrowssUp.png';
import addToButtonImg from '../assets/atwbtnCheck.png';
import redCross from '../assets/red_cross.png';
import greenTick from '../assets/green_tick.png';

import linkedInF from '../assets/linkedinF.svg';
import whatsappF from '../assets/whatsappF.svg';
import fbF from '../assets/fbF.svg';
import xF from '../assets/xF.svg';
import instaF from '../assets/instaF.svg';
import telegramF from '../assets/telegramF.svg';
import fbMesswngerF from '../assets/fbMesswnger.svg';

import collectionIconN from '../assets/collectionIconN.png';
import customCodeN from '../assets/customCodeN.png';
import customCssN from '../assets/customCssN.png';
import smtpN from '../assets/smtpN.png';
import shareWishlistN from '../assets/shareWishlistN.png';
import klaviyoN from '../assets/klaviyoN.png';
import loginRequiredN from '../assets/loginRequiredN.png';
import emailReminderN from '../assets/emailReminderN.png';
import languageSettingN from '../assets/languageSettingN.png';
import wishlistDisplayN from '../assets/wishlistDisplayN.png';
import iconLocationN from '../assets/iconLocationN.png';
import addToButtonN from '../assets/addToButtonN.png';
import multiVariantN from '../assets/multiVariantN.png';
import multiWishlistN from '../assets/multiWishlistN.png';

import docLink from '../assets/docLink.svg';
import Footer from './Footer';
import Swal from 'sweetalert2';
import loaderGif from "./loaderGreen.gif";
import { useLocation } from 'react-router-dom';
import SetupGuide from './SetupGuide';
import AuthImg from '../assets/isloginPhoto.svg';
import multiWishlistIcon from '../assets/multi-wishlist.svg'
import french from '../assets/Languages/french';
import english from '../assets/Languages/english';
import dutch from '../assets/Languages/dutch';
import german from '../assets/Languages/german';
import chinese from '../assets/Languages/chinese';
import brazilian from '../assets/Languages/brazilian';
import danish from '../assets/Languages/danish';
import swedish from '../assets/Languages/swedish';
import spanish from '../assets/Languages/spanish';
import czech from '../assets/Languages/czech';
import japanese from '../assets/Languages/japanese';
import italian from '../assets/Languages/italian';
import korean from '../assets/Languages/korean';
import norwegianBokmal from '../assets/Languages/norwegianBokmal';
import polish from '../assets/Languages/polish';
import portugueseBrazil from '../assets/Languages/portugueseBrazil';
import portuguesePortugal from '../assets/Languages/portuguesePortugal';
import thai from '../assets/Languages/thai';
import turkish from '../assets/Languages/turkish';
import chineseTraditional from '../assets/Languages/chineseTraditional';
import bulgarian from '../assets/Languages/bulgarian';
import ukranian from '../assets/Languages/ukranian';
import greek from '../assets/Languages/greek';
import lithunanian from '../assets/Languages/lithuanian';
import irish from '../assets/Languages/irish';
import romanian from '../assets/Languages/romanian';
import filipino from '../assets/Languages/filipino';
import indonassian from '../assets/Languages/indonesian';
import russian from '../assets/Languages/russian';
import vietnameese from '../assets/Languages/vietnamese';
import albanian from '../assets/Languages/albanian';
import hungarian from '../assets/Languages/hungarian';
import finnish from '../assets/Languages/finnish';
import { Link } from 'react-router-dom';
import klaviyo from '../assets/klaviyo.svg';
import Toggle from 'react-toggle';
import { storeFrontLanguages } from '../../backend/utils/storeFrontLanguages';
import WebframezApps from './WebframezApps';




export default function Dashboard() {
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search.trim());
    const { appName, extName, serverURL } = Constants;
    const utilityFunction = useUtilityFunction();
    const Navigate = useNavigate();
    const swal = useSwal()
    const ShopApi = useApi();

    const [isloading, setIsLoading] = useState(false);
    const [myLanguage, setMyLanguage] = useState({});
    // const fetch = useAuthenticatedFetch();
    const appMetafield = useAppMetafield();
    const [currentPlan, setCurrentPlan] = useState("");
    const [showcurrentPlan, setShowCurrentPlan] = useState("");
    const [wishlistTextDirection, setWishlistTextDirection] = useState("");
    const [shopApi, setShopApi] = useState();
    const [planData, setPlanData] = useState({});
    const [isDisabled, setIsDisabled] = useState(false)
    const [isCollectionButton, setIsCollectionButton] = useState(false)
    const [showModal, setShowModal] = useState(false);
    const [showModalMessage, setShowModalMessage] = useState(false);
    const [emailMsgAlert, setEmailMsgAlert] = useState({});
    const [getGenDataInfo, setGetGenDataInfo] = useState({});
    const [getButtonDataInfo, setGetButtonDataInfo] = useState({});
    const [getPlanState, setGetPlanState] = useState(0);
    const [themeName, setThemeName] = useState("");
    const [youtubeLink, setYoutubeLink] = useState("");
    const [isHeartBtn, setIsHeartBtn] = useState(false);
    const [currentState, setCurrentState] = useState("home");
    const [isDemo, setIsDemo] = useState(false);

    const themeListRef = useRef([]);
    const themeListMain = useRef([]);

    // const [themeActiveModal, setThemeActiveModal] = useState(searchParams.get('getTheme') === "true" ? true : false);
    const [themeActiveModal, setThemeActiveModal] = useState(false);

    const [getTheme, setGetTheme] = useState([])
    const [getThemeId, setGetThemeId] = useState(0);
    const [showSmallLoader, setShowSmallLoader] = useState(false);
    const [showSaveButton, setShowSaveButton] = useState(false);
    const [noChange, setNoChange] = useState("");

    const [showThemeButton, setShowThemeButton] = useState("");
    const [injectCode, setInjectCode] = useState("automatic");

    const [isSetupGuide, setIsSetupGuide] = useState();
    // const [wishlistButtonObject, setWishlistButtonObject] = useState(true);

    const [loadThemeName, setLoadThemeName] = useState(false);

    const [isMultiwishlist, setIsMultiWishlist] = useState("no");
    const [isVariantWishlist, setIsVariantWishlist] = useState("no");
    const [saveLoginRequired, setSaveLoginRequired] = useState(getGenDataInfo?.createWishlist === "yes" ? true : false);


    const [savedLanguage, setSavedLanguage] = useState({
        adminLanguage: "english",
        storefrontLanguage: []
    });

    const [savedEmailReminder, setSavedEmailReminder] = useState({
        monthly: false,
        backInStock: false,
        lowInStock: false,
        priceDrop: false,
        selectedDate: 1
    });

    async function handleChangeEmailReminder(e, fieldType) {
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        const updated = {
            ...savedEmailReminder,
            [fieldType]: e.target.checked
        };
        setSavedEmailReminder(updated);
        try {
            const userDatas = await fetch(`${serverURL}/email-reminder-checks-update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shopApi.shopName,
                    emailOption: updated.monthly === true ? "monthly" : "turnOff",
                    backInStockMail: updated.backInStock === true ? "yes" : "no",
                    lowInStockMail: updated.lowInStock === true ? "yes" : "no",
                    priceDropMail: updated.priceDrop === true ? "yes" : "no",
                    selectedDate: savedEmailReminder.selectedDate || 3
                }),
            })
            let results = await userDatas.json();
            if (results.msg === "data_updated") {
                Swal.close();
            }
        } catch (error) {
            console.log("errr ", error)
        }
    }

    // announcement structure in collapsible
    const [openAnnouncement, setOpenAnnouncement] = useState(false);
    const handleToggleAnnouncement = useCallback(() => setOpenAnnouncement((setOpenAnnouncement) => !setOpenAnnouncement), []);

    const rows = [
        [
            <span className='basic-plan new-word' >{myLanguage.new}</span>,
            <div className='white-space'><h3>{myLanguage.anna1}</h3><p>{myLanguage.anna11}</p></div>,
            "20th August 2025",
        ],
        [
            <span className='basic-plan new-word' >{myLanguage.new}</span>,
            <div className='white-space'><h3>{myLanguage.anna2}</h3><p>{myLanguage.anna22}</p></div>,
            "18th August 2025",
        ], [
            <span className='basic-plan new-word' >{myLanguage.new}</span>,
            <div className='white-space'><h3>{myLanguage.anna3}</h3><p>{myLanguage.anna33}</p></div>,
            "16th August 2025",
        ], [
            <span className='basic-plan new-word' >{myLanguage.new}</span>,
            <div className='white-space'><h3>{myLanguage.anna4}</h3><p>{myLanguage.anna44}</p></div>,
            "10th August 2025",
        ], [
            <span className='basic-plan new-word' >{myLanguage.new}</span>,
            <div className='white-space'><h3>{myLanguage.anna5}</h3><p>{myLanguage.anna55}</p></div>,
            "4th August 2025",
        ], [
            <span className='basic-plan new-word' >{myLanguage.new}</span>,
            <div className='white-space'><h3>{myLanguage.anna6}</h3><p>{myLanguage.anna66}</p></div>,
            "1st August 2025",
        ], [
            <span className='basic-plan new-word' >{myLanguage.new}</span>,
            <div className='white-space'><h3>{myLanguage.anna7}</h3><p>{myLanguage.anna77}</p></div>,
            "30th July 2025",
        ],
    ];

    const [isMultiWishlistChecked, setIsMultiWishlistChecked] = useState(false);
    const [isMultiVariantWishlistChecked, setIsMultiVariantWishlistChecked] = useState(false);

    useEffect(() => {
        useEffectLite();
    }, []);

    async function useEffectLite() {
        let planValue;
        let setupValue;
        await utilityFunction.getPlanFirst().then(async (planDetail) => {

            planValue = planDetail;
            setGetPlanState(planDetail);
            if (planDetail === -999) {
                setIsLoading(true);
                setCurrentState("plan");
            }
        });

        await getDatesOfplans();

        await utilityFunction.getSetupGuideData().then(async (setupResult) => {
            setupValue = setupResult;
            setIsSetupGuide(setupResult);
            if (setupResult === null) {
                setIsSetupGuide("yes");
            } else if (setupResult === "no") {
                setIsLoading(true);
                setCurrentState(planValue === -999 || planValue === 0 ? "plan" : "setup");
            }
        });

        let allData;
        await appMetafield.getAllAppMetafields().then((res) => {
            allData = res;
            let langg;
            for (let i = 0; i < res.length; i++) {
                if (res[i].node.key === "language-setting") {
                    let dData = JSON.parse(res[i].node.value);
                    setSavedLanguage(prevState => ({ ...prevState, adminLanguage: dData.languageSetting }));

                    if (dData.languageSetting === "english") {
                        langg = english;
                    } else if (dData.languageSetting === "french") {
                        langg = french;
                    } else if (dData.languageSetting === "dutch") {
                        langg = dutch;
                    } else if (dData.languageSetting === "german") {
                        langg = german;
                    } else if (dData.languageSetting === "chinese") {
                        langg = chinese;
                    } else if (dData.languageSetting === "brazilian") {
                        langg = brazilian;
                    } else if (dData.languageSetting === "danish") {
                        langg = danish;
                    } else if (dData.languageSetting === "swedish") {
                        langg = swedish;
                    } else if (dData.languageSetting === "spanish") {
                        langg = spanish;
                    } else if (dData.languageSetting === "chineseTraditional") {
                        langg = chineseTraditional;
                    } else if (dData.languageSetting === "czech") {
                        langg = czech;
                    } else if (dData.languageSetting === "japanese") {
                        langg = japanese;
                    } else if (dData.languageSetting === "italian") {
                        langg = italian;
                    } else if (dData.languageSetting === "korean") {
                        langg = korean;
                    } else if (dData.languageSetting === "norwegianBokmal") {
                        langg = norwegianBokmal;
                    } else if (dData.languageSetting === "polish") {
                        langg = polish;
                    } else if (dData.languageSetting === "portugueseBrazil") {
                        langg = portugueseBrazil;
                    } else if (dData.languageSetting === "portuguesePortugal") {
                        langg = portuguesePortugal;
                    } else if (dData.languageSetting === "thai") {
                        langg = thai;
                    } else if (dData.languageSetting === "turkish") {
                        langg = turkish;
                    } else if (dData.languageSetting === "ukrainian") {
                        langg = ukranian;
                    } else if (dData.languageSetting === "lithuanian") {
                        langg = lithunanian;
                    } else if (dData.languageSetting === "greek") {
                        langg = greek;
                    } else if (dData.languageSetting === "irish") {
                        langg = irish;
                    } else if (dData.languageSetting === "romanian") {
                        langg = romanian;
                    } else if (dData.languageSetting === "filipino") {
                        langg = filipino;
                    } else if (dData.languageSetting === "indonesian") {
                        langg = indonassian;
                    } else if (dData.languageSetting === "russian") {
                        langg = russian;
                    } else if (dData.languageSetting === "vietnamese") {
                        langg = vietnameese;
                    } else if (dData.languageSetting === "albanian") {
                        langg = albanian;
                    } else if (dData.languageSetting === "hungarian") {
                        langg = hungarian;
                    } else if (dData.languageSetting === "finnish") {
                        langg = finnish;
                    } else if (dData.languageSetting === "bulgarian") {
                        langg = bulgarian;
                    }
                    else {
                        langg = english;
                    }
                };
            }
            setMyLanguage(langg);
            setIsLoading(true);
        });

        const getDatesOfPlan = await getDatesOfplans();
        // setPlanData(getDatesOfPlan);
        await getAllAppDataMetafields(allData);
        const getCurrentPlan = await appMetafield.getCurrentPlan();

        const planArr = await getPlanData(Number(getCurrentPlan.currentPlan));
        setShowCurrentPlan(planArr);

        setCurrentPlan(getCurrentPlan.currentPlan);
        const shopAPI = await ShopApi.shop();
        setShopApi(shopAPI);
        const tickData = await getGenData(allData);
        setGetGenDataInfo(tickData.genData);
        setGetButtonDataInfo(tickData.btnData);

        setSaveLoginRequired(tickData?.genData?.createWishlist === "yes" ? true : false);
        tickData.isMultiWish === null && await saveMultiMeta("no");

        setIsMultiWishlist(tickData.isMultiWish || "no");
        setIsMultiWishlistChecked(tickData.isMultiWish === "yes" ? true : false);

        setIsVariantWishlist(tickData.isVariantWish || "no");
        setIsMultiVariantWishlistChecked(tickData.isVariantWish === "yes" ? true : false);
        getEmailReminderAndLanguages(shopAPI);
        setCurrentState(planValue === -999 || planValue === 0 ? "plan" : setupValue === "no" ? "setup" : "home");
        setIsLoading(true);

        // const mainString = shopAPI.domain;
        // const string1 = "wishlist-guru";
        // const string2 = "randeep-singh";
        // const checkUserDomain = mainString.includes(string1) || mainString.includes(string2);
        // if (!checkUserDomain) {
        //     liveChatWF();
        // }

        // const mainString = shopAPI.domain;
        // if (mainString.includes("wishlist-guru-store4")) {
        //     liveChatWF();
        // } else {
        //     const string1 = "wishlist-guru";
        //     const string2 = "randeep-singh";
        //     const checkUserDomain = mainString.includes(string1) || mainString.includes(string2);
        //     if (!checkUserDomain) {
        //         liveChatWF();
        //     }
        // }

        // -------------------this function will re create all the webhooks if urls are different-------------------
        // await getWebHookData(getCurrentPlan);

        const mainString = shopAPI.shopName;
        const string1 = "wishlist-guru";
        const string2 = "randeep-singh";
        const checkUserDomain = mainString.includes(string1) || mainString.includes(string2);
        if (!checkUserDomain) {
            clarityFxn();
        }
    }


    function clarityFxn() {
        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
            t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
            y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", "r0c9ecz3ii");
    }

    async function getEmailReminderAndLanguages(shopAPI) {
        try {
            let returnData = await fetch(`${serverURL}/get-email-reminder-and-store-language`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shopAPI.shopName,
                }),
            });
            const dataNew = await returnData.json();
            if (dataNew.emailData.length !== 0) {
                setSavedEmailReminder({
                    monthly: dataNew.emailData[0].email_option === "monthly" ? true : false,
                    backInStock: dataNew.emailData[0].back_in_stock === "yes" ? true : false,
                    lowInStock: dataNew.emailData[0].low_in_stock === "yes" ? true : false,
                    priceDrop: dataNew.emailData[0].price_drop === "yes" ? true : false,
                    selectedDate: dataNew?.emailData[0]?.selected_date || 1
                });
            }
            if (dataNew.languageData.length !== 0) {
                setSavedLanguage(prevState => ({ ...prevState, storefrontLanguage: dataNew.languageData }));
            }
        } catch (error) {
            console.log("error", error);
        }
    }


    // async function getWebHookData(getCurrentPlan) {
    //     try {
    //         const response = await fetch(`/api/re-register-webhook?plan=${getCurrentPlan.currentPlan}`);
    //         const result1 = await response.json();
    //         console.log("WEBHOOK ---  ", result1)
    //     } catch (error) {
    //         console.error("Error:", error);
    //     }
    // };

    async function getGenData(dataArray) {
        // const dataArray = await appMetafield.getAllAppMetafields();
        let genData;
        let btnData;
        let injectCode;
        let isMultiWish = null;
        let isVariantWish = null;
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "is-Multi-wishlist") {
                let dData = dataArray[i].node.value;
                // console.log("yes", dData)
                setIsMultiWishlist(dData.replace(/"/g, ''));
                isMultiWish = dData
            }

            if (dataArray[i].node.key === "general-setting") {
                genData = JSON.parse(dataArray[i].node.value);
            }
            if (dataArray[i].node.key === "wishlist-button-setting") {
                btnData = JSON.parse(dataArray[i].node.value);
            }

            if (dataArray[i].node.key === "inject-code-automatic") {
                let dData = dataArray[i].node.value;
                setInjectCode(dData.replace(/"/g, ''));
                injectCode = dData;
            }
            if (dataArray[i].node.key === "is-variant-wishlist") {
                let dData = dataArray[i].node.value;
                // console.log("dData -- ", dData)
                setIsVariantWishlist(dData.replace(/"/g, ''))
                isVariantWish = dData;
            }
            // if (dataArray[i].node.key === "language-setting") {
            //     let dData = dataArray[i].node.value;

            //     // console.log("LLLLLL --- ", JSON.parse(dData))

            // }

        }
        return { btnData, genData, injectCode, isMultiWish, isVariantWish }
    }


    async function getPlanData(id) {
        try {
            const userData = await fetch(`${serverURL}/get-plan-data`)
            let result = await userData.json();
            const results = result.data
            const finalData = results.filter((item) => item.plan_id === id);
            return finalData[0].name
        } catch (error) {
            console.log("errr ", error)
        }
    }

    async function getDatesOfplans() {
        try {
            const response = await fetch(`/api/all-theme-data`);
            const result1 = await response.json();
            themeListMain.current = result1.settingFile;
            let newArr = [{
                value: "",
                label: "Choose theme"
            }];
            const ab = result1.settingFile.map(dev => {
                // return newArr.push({
                //   value: dev.id,
                //   label: dev.name
                // })
                if (dev.role === 'main') {
                    return newArr.push({
                        value: dev.id,
                        label: `${dev.name} -- Currently Active Theme`
                        // label: `${dev.name}`
                    })
                } else {
                    // if (dev.role === 'development' || dev.role === 'demo') {
                    if (dev.role === 'development') {



                    }
                    else {
                        return newArr.push({
                            value: dev.id,
                            label: dev.name
                        })
                    }
                }
            });
            const filteredArray = newArr.filter(item => item !== undefined);
            setGetTheme((prev) => prev = filteredArray);
            themeListRef.current = filteredArray;
        } catch (error) {
            console.error("Error:", error);
        }
        // try {
        //   const response = await fetch(`/api/subscription/planstatus`);
        //   const result1 = await response.json();
        //   const result = result1.data;
        //   let yourPlan = { plan_name: "", activated_on: "", expired_on: "" }
        //   if (result.length !== 0) {
        //     if (result[0].status === "active") {
        //       yourPlan = { plan_name: result[0].name, activated_on: result[0].activated_on, expired_on: result[0].billing_on };
        //     }
        //   }
        //   return yourPlan
        // } catch (error) {
        //   console.error("Error:", error);
        // }
    };

    async function getAllAppDataMetafields(dataArray) {
        // const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "general-setting") {
                let dData = JSON.parse(dataArray[i].node.value);
                setWishlistTextDirection(dData.wishlistTextDirection);
            };

            if (dataArray[i].node.key === "current-theme-name") {
                let dData = JSON.parse(dataArray[i].node.value);
                setGetThemeId(dData?.id);
                setThemeName(prevCount => prevCount = getSelectedThemeNameFxn(dData?.id));
                // console.log("theme name ", getSelectedThemeNameFxn(dData?.id))

                // await ShopApi.wishlistBtnApi(dData?.id).then((res) => {
                //   setWishlistButtonObject(res?.wishlistButtonObject)
                // })

                const DataApi = await ShopApi.themeApi(dData?.id).then((res) => {
                    if (res === undefined) {
                        // console.log("IM here")
                        setIsLoading(true);
                        setThemeName("");
                        setLoadThemeName(true);
                    };

                    setIsCollectionButton(res?.collectionButton)

                    if (res?.heartButton === true) {
                        setShowThemeButton("appIsNotEmbedded");
                        setIsHeartBtn(false)
                        setShowSaveButton(true)

                    } else {
                        setShowThemeButton("appIsEmbedded");
                        setIsHeartBtn(true)
                        setShowSaveButton(false)
                    }
                    setLoadThemeName(true);
                    setIsLoading(true)
                });
            } else {

                // if (data.heartButton === false) {
                //   const getAppMetafieldId = await appMetafield.getAppMetafieldId();
                //   const response = await fetch(`/api/get-theme-data-by-id?id=${data.themeID}`);
                //   const getThemeName = await response.json();
                //   let saveData = {
                //     id: data.themeID,
                //     themeName: getThemeName.themeName
                //   }
                //   const themeData = {
                //     key: "current-theme-name",
                //     namespace: "wishlist-app",
                //     ownerId: getAppMetafieldId,
                //     type: "single_line_text_field",
                //     value: JSON.stringify(saveData)
                //   }
                //   appMetafield.createAppMetafield(themeData).then(async (res) => {
                //     if (res.msg === "app-data-metafield is created successfully") {
                //       setThemeName(prevCount => prevCount = getThemeName.themeName);
                //       searchParams.delete("getTheme");
                //       const DataApi = await ShopApi.themeApi(data.themeID).then((res) => {
                //         setShowSmallLoader(false);
                //         if (res.heartButton === true) {
                //           setShowThemeButton("appIsNotEmbedded");
                //         } else {
                //           setShowThemeButton("appIsEmbedded");
                //         }
                //       });
                //     }
                //   })
                // }

            }
        }
    };


    const visitPlanPage = async () => {
        // window.top.location.href = `https://${shopApi.domain}/admin/apps/${appName}/PricingPlan`;

        Navigate({
            pathname: `/PricingPlan`,
            search: ``
        })

    };

    const goToSectionHandler = async (pageName, sectionName) => {
        // window.top.location.href = `https://${shopApi.domain}/admin/apps/${appName}/${pageName}?go-to=${sectionName}`;
        Navigate({
            pathname: `/${pageName}`,
            search: `go-to=${sectionName}`
        })
    };



    const goToSectionHandler2 = async (pageName) => {
        // console.log("DDD ", pageName)
        window.top.location.href = `https://${shopApi.domain}/admin/apps/${appName}/${pageName}`;
        // Navigate({
        //     pathname: `/${pageName}`,
        //     // search: `go-to=${sectionName}`
        // })
    };



    const themeLiveTheme = () => {
        window.open(`https://${shopApi.domain}/admin/themes/${getThemeId}/editor?context=apps&&activateAppId=${extName}/heart_button`, "_blank");
        setTimeout(() => {
            setShowThemeButton("appIsEmbedded");
        }, 3000)

        const intervalId = setInterval(async () => {
            try {
                const getAppMetafieldId = await appMetafield.getAppMetafieldId();
                const themeId = Number(getThemeId);
                const DataApi = await ShopApi.themeApi(themeId);
                const response = await fetch(`/api/get-theme-data-by-id?id=${themeId}`);
                const getThemeName = await response.json();
                let saveData = {
                    id: themeId,
                    themeName: getThemeName.themeName
                };
                const themeData = {
                    key: "current-theme-name",
                    namespace: "wishlist-app",
                    ownerId: getAppMetafieldId,
                    type: "single_line_text_field",
                    value: JSON.stringify(saveData)
                };

                const result = await appMetafield.createAppMetafield(themeData);

                if (DataApi.heartButton === false) {
                    if (result.msg === "app-data-metafield is created successfully") {
                        setThemeName(prevName => getSelectedThemeNameFxn(getThemeId));
                        setLoadThemeName(true);
                        setIsHeartBtn(true);

                        const DataApi = await ShopApi.themeApi(Number(getThemeId));
                        clearInterval(intervalId);
                    }
                }
            } catch (error) {
                console.error("An error occurred:", error);
            }
        }, 5000);
    };


    const collectionIconClick = () => {
        window.open(`https://${shopApi.domain}/admin/themes/${getThemeId}/editor?context=apps&&activateAppId=${extName}/collection-heart`, "_blank");
    }


    function getSelectedThemeNameFxn(value) {
        let selectedThemeName = themeListRef.current.find((data) => data.value === Number(value));
        let returnThemeName = selectedThemeName?.label.replace('-- Currently Active Theme', '');
        return returnThemeName
    }


    const handleClick = async (value) => {
        if (value === "") {

        } else {
            let getThemeType = themeListMain.current.find((data) => data.id === Number(value));
            if (getThemeType.role === "demo") {
                // setErrorText(myLanguage.buyThemeFirstText);
                // toggleActiveErr();

                setIsDemo(true);
                setShowSaveButton(true);

                setGetThemeId(Number(value));
                setShowSmallLoader(true);
                // setThemeName(prevName => prevName = getSelectedThemeNameFxn(Number(value)));
                setTimeout(() => {
                    // setSwitchTheme(true)
                    setShowSmallLoader(false);
                    setShowThemeButton("appIsEmbedded")
                    setIsHeartBtn(true);
                }, 1000)


            }
            // else if () {
            // }
            else {
                setShowSaveButton(true);
                setGetThemeId(Number(value));
                setNoChange("not_empty");
                setShowSmallLoader(true);
                const DataApi = await ShopApi.themeApi(Number(value)).then((res) => {
                    setShowSmallLoader(false);
                    if (res.heartButton === true) {
                        setShowThemeButton("appIsNotEmbedded");
                        setIsHeartBtn(false);
                    } else {
                        setShowThemeButton("appIsEmbedded");
                        setIsHeartBtn(true);
                    }
                });
            }
        }
    };

    const saveMetaFirst = async () => {
        setShowSmallLoader(true);
        const getAppMetafieldId = await appMetafield.getAppMetafieldId();

        if (isDemo === true) {
            const getDemoTheme = getSelectedThemeNameFxn(getThemeId);
            setThemeName(prevName => prevName = getDemoTheme);
            let saveData = {
                id: Number(getThemeId),
                themeName: getDemoTheme
            }
            // ---------active theme-------
            saveActiveTheme(`${getDemoTheme} -- ${getThemeId}`);

            const themeData = {
                key: "current-theme-name",
                namespace: "wishlist-app",
                ownerId: getAppMetafieldId,
                type: "single_line_text_field",
                value: JSON.stringify(saveData)
            }
            appMetafield.createAppMetafield(themeData).then(async (res) => {
                if (res.msg === "app-data-metafield is created successfully") {
                    searchParams.delete("getTheme");
                    setThemeName(prevName => prevName = getSelectedThemeNameFxn(getThemeId));
                    setLoadThemeName(true);
                    setTimeout(() => {
                        setShowThemeButton("appIsEmbedded");
                        setIsHeartBtn(true);

                        setShowSaveButton(false);
                        toggleActive();
                    }, 1000)
                }
            })















        } else {
            const DataApi = await ShopApi.themeApi(Number(getThemeId)).then(async (res) => {

                if (res.heartButton === true) {
                    setShowThemeButton("appIsEmbedded");
                    setShowSmallLoader(false);
                    setErrorText(myLanguage.enableBlockButton);
                    toggleActiveErr();
                }
                else {
                    const response = await fetch(`/api/get-theme-data-by-id?id=${Number(getThemeId)}`);
                    const getThemeName = await response.json();
                    let saveData = {
                        id: Number(getThemeId),
                        themeName: getThemeName.themeName
                    }

                    // ---------active theme-------
                    saveActiveTheme(`${getThemeName.themeName} -- ${getThemeId}`);

                    const themeData = {
                        key: "current-theme-name",
                        namespace: "wishlist-app",
                        ownerId: getAppMetafieldId,
                        type: "single_line_text_field",
                        value: JSON.stringify(saveData)
                    }
                    appMetafield.createAppMetafield(themeData).then(async (res) => {
                        if (res.msg === "app-data-metafield is created successfully") {
                            searchParams.delete("getTheme");
                            setThemeName(prevName => prevName = getSelectedThemeNameFxn(getThemeId));
                            setLoadThemeName(true);
                            const DataApi = await ShopApi.themeApi(Number(getThemeId)).then((res) => {
                                setShowSmallLoader(false);
                                if (res.heartButton === true) {
                                    setShowThemeButton("appIsNotEmbedded");
                                    setIsHeartBtn(false);
                                } else {
                                    setShowThemeButton("appIsEmbedded");
                                    setIsHeartBtn(true);
                                }
                                setShowSaveButton(false);
                                toggleActive();
                            });
                        }
                    })
                }
            })

        }

    };

    // -----------save the active theme in db---------
    async function saveActiveTheme(theme) {
        try {
            await fetch(`${serverURL}/save-active-theme`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shopApi.shopName,
                    theme
                }),
            });
        } catch (error) {
            console.log("error", error);
        }
    }


    const [errorText, setErrorText] = useState("");
    const handleClose = useCallback(() => setThemeActiveModal(!themeActiveModal), [themeActiveModal]);

    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const toastMarkup = active ? (
        <Toast content={myLanguage.themeSavedText} onDismiss={toggleActive} />
    ) : null;

    const [activeErr, setActiveErr] = useState(false);
    const toggleActiveErr = useCallback(() => setActiveErr((activeErr) => !activeErr), []);
    const toastMarkupErr = activeErr ? (
        <Toast error content={errorText} onDismiss={toggleActiveErr} />
    ) : null;

    const goToProductPage = () => {
        window.open(`https://${shopApi.domain}/admin/themes/${getThemeId}/editor?template=product&addAppBlockId=2c17f518-d350-4883-a154-c9a194a4a585/app-block&target=mainSection`, "_blank");
    };

    const handleInjectCodeToggleChange = async (value) => {
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        const sigleDiv = document.getElementById('automatic')
        const multiDiv = document.getElementById('mannual')
        const isTrue = value === "automatic" ? "automatic" : "mannual";
        if (value === "automatic") {
            const isClass = multiDiv.classList.contains('activeToggle')
            if (isClass) {
                multiDiv.classList.remove('activeToggle');
            }
            sigleDiv.classList.add('activeToggle');
        } else {
            const isClass = sigleDiv.classList.contains('activeToggle')
            if (isClass) {
                sigleDiv.classList.remove('activeToggle');
            }
            multiDiv.classList.add('activeToggle');
        }
        setInjectCode(isTrue);
        const getAppMetafieldId = await appMetafield.getAppMetafieldId();
        const isMultiwishlistValue = {
            key: "inject-code-automatic",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: isTrue
        }
        appMetafield.createAppMetafield(isMultiwishlistValue).then((res) => {
            Swal.close();
        })
    };

    // const handleMultiWishToggleChange = async (value) => {
    //     const sigleDiv = document.getElementById('wishYes')
    //     const multiDiv = document.getElementById('wishNo')
    //     const isTrue = value === "yes" ? "yes" : "no";

    //     if (value === "yes") {
    //         const isClass = multiDiv.classList.contains('activeToggle')
    //         if (isClass) {
    //             multiDiv.classList.remove('activeToggle');
    //         }
    //         sigleDiv.classList.add('activeToggle');
    //     } else {
    //         const isClass = sigleDiv.classList.contains('activeToggle')
    //         if (isClass) {
    //             sigleDiv.classList.remove('activeToggle');
    //         }
    //         multiDiv.classList.add('activeToggle');
    //     }
    //     setIsMultiWishlist(isTrue);
    //     await saveMultiMeta(isTrue)
    // }






    const handleChangeMultiWishlist = async (e) => {
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        setIsMultiWishlistChecked(e.target.checked);
        const isTrue = e.target.checked === true ? "yes" : "no";
        setIsMultiWishlist(isTrue);
        await saveMultiMeta(isTrue).then((res) => {
            // Swal.fire({
            //     icon: "success",
            //     title: myLanguage.swalHeading,
            //     text: myLanguage.swalText,
            //     confirmButtonText: myLanguage.swalOk
            // });
            Swal.close();
        })
    };

    // const handleMultiWishToggleChange = async (value) => {
    //     Swal.fire({
    //         text: myLanguage.swalWaiting,
    //         imageUrl: loaderGif,
    //         showConfirmButton: false,
    //     });

    //     const sigleDiv = document.getElementById('wishYes')
    //     const multiDiv = document.getElementById('wishNo')
    //     const isTrue = value === "yes" ? "yes" : "no";

    //     if (value === "yes") {
    //         const isClass = multiDiv.classList.contains('activeToggle')
    //         if (isClass) {
    //             multiDiv.classList.remove('activeToggle');
    //         }
    //         sigleDiv.classList.add('activeToggle');
    //     } else {
    //         const isClass = sigleDiv.classList.contains('activeToggle')
    //         if (isClass) {
    //             sigleDiv.classList.remove('activeToggle');
    //         }
    //         multiDiv.classList.add('activeToggle');
    //     }
    //     setIsMultiWishlist(isTrue);
    //     await saveMultiMeta(isTrue).then((res) => {
    //         Swal.fire({
    //             icon: "success",
    //             title: myLanguage.swalHeading,
    //             text: myLanguage.swalText,
    //             confirmButtonText: myLanguage.swalOk
    //         });
    //     })
    // }

    async function saveMultiMeta(data) {
        const getAppMetafieldId = await appMetafield.getAppMetafieldId();

        const isMultiwishlistValue = {
            key: "is-Multi-wishlist",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: data
        }
        appMetafield.createAppMetafield(isMultiwishlistValue)
    }






    const handleChangeMultiVariantWishlist = async (e) => {
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        setIsMultiVariantWishlistChecked(e.target.checked);
        const isTrue = e.target.checked === true ? "yes" : "no";
        setIsVariantWishlist(isTrue);
        await saveVariantMeta(isTrue).then((res) => {
            Swal.close();
        })
    };


    // handleSpecificVariantToggleChange
    const handleSpecificVariantToggleChange = async (value) => {
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        const sigleDiv = document.getElementById('variantYes')
        const multiDiv = document.getElementById('variantNo')
        const isTrue = value === "yes" ? "yes" : "no";
        if (value === "yes") {
            const isClass = multiDiv.classList.contains('activeToggle')
            if (isClass) {
                multiDiv.classList.remove('activeToggle');
            }
            sigleDiv.classList.add('activeToggle');
        } else {
            const isClass = sigleDiv.classList.contains('activeToggle')
            if (isClass) {
                sigleDiv.classList.remove('activeToggle');
            }
            multiDiv.classList.add('activeToggle');
        }
        setIsVariantWishlist(isTrue);
        await saveVariantMeta(isTrue).then((res) => {
            Swal.fire({
                icon: "success",
                title: myLanguage.swalHeading,
                text: myLanguage.swalText,
                confirmButtonText: myLanguage.swalOk
            });
        })
    }


    async function saveVariantMeta(data) {
        const getAppMetafieldId = await appMetafield.getAppMetafieldId();

        const isMultiwishlistValue = {
            key: "is-variant-wishlist",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: data
        }
        appMetafield.createAppMetafield(isMultiwishlistValue)
    }



    async function updateLoginRequiredForWishlist(e) {
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        setSaveLoginRequired(e.target.checked);
        let dataUpdate = { ...getGenDataInfo, createWishlist: e.target.checked === true ? "yes" : "no" }
        const getAppMetafieldId = await appMetafield.getAppMetafieldId();
        const saveLoginRequiredData = {
            key: "general-setting",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: JSON.stringify(dataUpdate)
        }
        appMetafield.createAppMetafield(saveLoginRequiredData).then(() => {
            Swal.close();
        });
    }


    // function liveChatWF() {
    //     let Tawk_API = window.Tawk_API || {};
    //     Tawk_API.autoStart = new Date();
    //     (function () {
    //         let s1 = document.createElement('script'),
    //             s0 = document.getElementsByTagName('script')[0];
    //         s1.async = true;
    //         s1.src = 'https://embed.tawk.to/668540329d7f358570d68af2/1i1s85i42';
    //         s1.charset = 'UTF-8';
    //         s1.setAttribute('crossorigin', '*');
    //         s0.parentNode.insertBefore(s1, s0);
    //     })();
    // };


    // const [openYoutubeModal, setOpenYoutubeModal] = useState(false);
    // const closeYoutubeModal = useCallback(() => setOpenYoutubeModal(!openYoutubeModal), [openYoutubeModal]);

    const sendDataToSetupGuide = {
        getPlanState: getPlanState,
        errorText: errorText,
        activeErr: activeErr,
        setErrorText: setErrorText,
        toggleActiveErr: toggleActiveErr,
        isCollectionButton: isCollectionButton,
        getTheme: getTheme,
        shopApi: shopApi,
        themeListMain: themeListMain
    }

    const goToSupppportMail = () => {
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=support@webframez.com`, "_blank");
    }

    // console.log("currentState", currentState)

    return (
        <div dir={wishlistTextDirection} className='wf-dashboard wf-new-dashboard'>
            {!isloading ? <SkeletonPage1 /> :

                // getPlanState === -999 ? <PlanComponent /> : isSetupGuide === "no" ? <SetupGuide values={sendDataToSetupGuide} /> :

                currentState === "plan" ? <PlanComponent setCurrentState={setCurrentState} /> : currentState === "setup" ? <SetupGuide values={sendDataToSetupGuide} /> :

                    <Frame>
                        <Modal id="modal-for-items"
                            open={themeActiveModal}
                            onClose={handleClose}
                            size="large"
                            title={myLanguage.chooseThemeModalHeading}
                            titleHidden>
                            <Modal.Section>
                                <div style={{ margin: "20px 10px" }}>
                                    <div style={{ marginBottom: "10px", textAlign: "left" }}>
                                        <Text variant="headingMd" as="h2">{myLanguage.chooseThemeModalHeading}
                                            <span style={{ marginLeft: "10px" }}>
                                                {showThemeButton === "appIsEmbedded" ?
                                                    <Badge status="success">Active</Badge> :
                                                    <Badge status="attention">Deactivated</Badge>
                                                }
                                            </span>
                                        </Text>
                                        <p>{myLanguage.chooseThemeModalSubHeading}</p>
                                    </div>
                                    <div style={{ display: "flex" }}>
                                        <div style={{ width: "70%" }}>
                                            <Select
                                                options={getTheme}
                                                onChange={handleClick}
                                                value={getThemeId}
                                            // placeholder='Choose theme'
                                            />
                                        </div>
                                        <div style={{ width: "30%" }}>

                                            {showSaveButton === false ? <></> :
                                                showSmallLoader ? <Spinner accessibilityLabel="Spinner example" size="large" /> :
                                                    showThemeButton === "appIsNotEmbedded" ?
                                                        <span className='disable-app'><Button onClick={themeLiveTheme} >{myLanguage.enableButtonText}</Button></span>
                                                        :
                                                        <span className='disable-app'><Button onClick={saveMetaFirst} >{myLanguage.save}</Button></span>
                                            }
                                        </div>
                                    </div>
                                    <br></br>
                                    <div style={{ backgroundColor: "#FFB800", padding: "20px", borderRadius: "20px" }}>
                                        <b>{myLanguage.noteHeading}. </b> {myLanguage.themeSupportWording}<span onClick={goToSupppportMail} style={{ cursor: "pointer", textDecoration: "underline", color: "blue" }}>support@webframez.com</span>
                                    </div>
                                </div>
                            </Modal.Section>
                        </Modal>

                        <Page fullWidth title={myLanguage.defaultPageMainHeading} subtitle={myLanguage.defaultPageMainText} style={{ position: "absolute" }}
                            primaryAction={
                                !loadThemeName ? <Spinner accessibilityLabel="Spinner example" size="large" /> :
                                    (themeName === "" || !isHeartBtn) ? <div className='enable-app'><Button onClick={handleClose} >{myLanguage.enabletheme}</Button></div> :
                                        <div style={{ display: "flex", alignItems: "center" }} className='disable-app'> {themeName !== "" && <span>{myLanguage.appCurrentlyWorkingOnTheme1}  <b>{themeName}</b> {myLanguage.appCurrentlyWorkingOnTheme2} </span>}<Button onClick={handleClose} >{myLanguage.disabletheme}</Button></div>}>


                            {/* -----------plan name and intro------------ */}
                            <div className='new-dash-bg new-dash-mainplan'>
                                <div className="wf-dashboard-box wf-dashboard-boxplain">
                                    <AlphaCard roundedAbove="sm">
                                        <Grid >
                                            <Grid.Cell columnSpan={{ xs: 6, sm: 5, md: 4, lg: 8, xl: 8 }}>
                                                <div className='custom-margin'>
                                                    <Text variant="headingLg" as="h2" >{myLanguage.dpSubHeading}</Text>
                                                    <Text variant="body" as="p">{myLanguage.dpGsParagraph}</Text>
                                                    <br />
                                                    <Text variant="body" as="span">{myLanguage.planBoxHeading}</Text>

                                                </div>
                                                <span className='theme-button-group'>
                                                    <ButtonGroup>
                                                        <Button onClick={visitPlanPage}>{myLanguage.changePlan}</Button>
                                                        <Button onClick={() => Navigate(`/RequestFormModal`)}>{myLanguage.dpRequestForm}</Button>
                                                        <div className='lock-minor youtube-button'>
                                                            <a href='https://www.youtube.com/watch?v=o-k_88ZQUWE&list=PLCrJ_cj73yCrpY-jrtj-VyMq1Lydw3wvj' target='_blank'>
                                                                <Button ><img src={youtubeIcon} alt='youtube-icon' loading="lazy" /><span style={{ color: "#4867A9" }}> {myLanguage.buttonForYouTubeLink}</span></Button>
                                                            </a>
                                                        </div>
                                                    </ButtonGroup>
                                                </span>
                                                {showModal && <RequestFormModal showModal={showModal} setShowModal={setShowModal} storeAdminEmail={shopApi.email} showModalMessage={showModalMessage} setShowModalMessage={setShowModalMessage} storeDomain={shopApi.domain} setEmailMsgAlert={setEmailMsgAlert} />}
                                            </Grid.Cell>
                                            <Grid.Cell columnSpan={{ xs: 6, sm: 1, md: 2, lg: 4, xl: 4 }}>
                                                <div className={`${showcurrentPlan === "Basic" ? "basic_plan_selected" : showcurrentPlan === "Premium" ? "premium_plan_selected" : showcurrentPlan === "Pro" ? "pro_plan_selected" : "free_plan_selected"}`}>
                                                    <div className='plan-div'>
                                                        <div className='custom-margin'>
                                                            {myLanguage.currentPlan} </div>
                                                        {showcurrentPlan === "" ? <div style={{ width: "100%", textAlign: "center" }}><Spinner accessibilityLabel="Spinner example" size="large" /></div> :
                                                            <Text variant="headingLg" as="h5">{showcurrentPlan}</Text>}
                                                    </div>
                                                </div>
                                            </Grid.Cell>
                                        </Grid>
                                    </AlphaCard>
                                </div>
                            </div>

                            <br />
                            <div className='new-dash-bg annouce-new-dash'>
                                {/* -----------announcements in collapsible------------ */}
                                <div className="wf-dashboard-box wf-dashboard-boxplain">
                                    <Grid>
                                        <Grid.Cell columnSpan={{ xs: 10, sm: 10, md: 10, lg: 11, xl: 11 }}>
                                            <Text variant="headingMd" as="h2">{myLanguage.announcementHeading}</Text>
                                            <p>{myLanguage.announcementText}</p>
                                        </Grid.Cell>
                                        <Grid.Cell columnSpan={{ xs: 2, sm: 2, md: 2, lg: 1, xl: 1 }}>
                                            <div style={{ cursor: "pointer" }} onClick={handleToggleAnnouncement} aria-expanded={openAnnouncement} aria-controls="basic-collapsible" >
                                                <img src={openAnnouncement ? collapsibleArrowUp : collapsibleArrow} alt="CheckIcon" className="greenIcon" loading="lazy" />
                                            </div>
                                        </Grid.Cell>
                                    </Grid>
                                    <br />
                                    <Collapsible open={openAnnouncement} id="basic-collapsible" transition={{ duration: '500ms', timingFunction: 'ease-in-out' }} expandOnPrint >
                                        <div className='wishlistUi-TyleInner'>
                                            <DataTable columnContentTypes={['text', 'text', 'text']}
                                                headings={[
                                                    <b></b>,
                                                    <Text variant="headingLg" as="h2" >{myLanguage.tableDetails}</Text>,
                                                    <Text variant="headingLg" as="h2" >{myLanguage.launchDate}</Text>,
                                                ]}
                                                rows={rows}
                                            />
                                        </div>
                                    </Collapsible>
                                </div>
                            </div>
                            <br />

                            <div className='new-dash-bg'>
                                {/* --------- add to wishlist button on the product page ----------- */}
                                <div className="wf-dashboard-box wf-dashboard-boxplain new-dash-mobile">
                                    <Grid>
                                        {/* <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 1, xl: 1 }}><img src={addToButtonImg} alt="CheckIcon" className="greenIcon" loading="lazy" /></Grid.Cell> */}
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 8, lg: 9, xl: 9 }}><Text variant="headingMd" as="h2"><img src={addToButtonImg} alt="CheckIcon" className="greenIcon" loading="lazy" />{myLanguage.SeeDocsText1}</Text></Grid.Cell>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 3, xl: 3 }}>
                                            {showcurrentPlan === "" ?
                                                <p>{myLanguage.loadingText}</p> :
                                                <div className='wf-dashboard-ismultiwishlist'>
                                                    <div className='toggle-paid-section'>
                                                        <div className={`${injectCode === "mannual" ? "toggle-paid-inner wf-installation-product wf-manual-btn" : "toggle-paid-inner wf-installation-product"}`}>
                                                            <label onClick={() => handleInjectCodeToggleChange('automatic')} id='automatic' className={`${injectCode === "automatic" ? "activeToggle" : ""}`}>{myLanguage.automaticButtontext}</label>
                                                            <label onClick={() => handleInjectCodeToggleChange('mannual')} id='mannual' className={`${injectCode === "mannual" ? "activeToggle" : ""}`}>{myLanguage.manualButtontext}</label>
                                                        </div>
                                                    </div>
                                                </div>}
                                        </Grid.Cell>
                                    </Grid>

                                    <Grid>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 9, lg: 10, xl: 10 }}><p>{myLanguage.SeeDocsText2}</p></Grid.Cell>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 2, xl: 2 }}>
                                            {injectCode === "mannual" && <div className='disable-app'>
                                                <Button alignment="end" onClick={goToProductPage} >{myLanguage.configue}</Button></div>}
                                        </Grid.Cell>
                                    </Grid>
                                </div>
                                <br />
                                <Grid>
                                    {/* -----------collection icon box----------- */}
                                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                                        <div className="wf-dashboard-box wf-dashboard-boxplain">
                                            <div className='new-dash-mobile'>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 2, xl: 2 }}><img src={collectionIconN} alt="CheckIcon" className="greenIcon" loading="lazy" /></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}><Text variant="heading2xl" as="h3">{myLanguage.overValueB15}</Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 4, xl: 4 }}>
                                                        {showcurrentPlan === "" ?
                                                            <p> {myLanguage.loadingText}</p> :
                                                            parseInt(currentPlan) > 1 ?
                                                                isCollectionButton == true ? <div className='icon-enable-wf-new'> <img src={redCross} alt="CheckIcon" className="greenIcon" loading="lazy" />{myLanguage.disabled}</div> : <div className='icon-enable-wf-new'> <img src={greenTick} alt="CheckIcon" className="greenIcon" loading="lazy" /> {myLanguage.enabled}</div>
                                                                : <span className='basic-plan' >{myLanguage.basic}</span>}
                                                    </Grid.Cell>
                                                </Grid>
                                                <p>{myLanguage.overValue15}</p>
                                            </div>
                                            <br />
                                            <br />
                                            {showcurrentPlan === "" ?
                                                <p>{myLanguage.loadingText}</p> :
                                                parseInt(currentPlan) > 1 ?
                                                    isCollectionButton == true ? <div className='enable-app'><Button onClick={collectionIconClick} >{myLanguage.enableCollectionIcon}</Button></div> : <div className='disable-app'><Button alignment="end" onClick={() => goToSectionHandler("CollectionSetting", "")}>{myLanguage.configue}</Button>
                                                    </div>
                                                    :
                                                    <><div className='lock-minor' >
                                                        <Button onClick={visitPlanPage} ><LockMinor />{myLanguage.upgrade}</Button>
                                                    </div></>}
                                        </div>
                                    </Grid.Cell>

                                    {/* -----------multi wishlist box----------- */}
                                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                                        <div className="wf-dashboard-box wf-dashboard-boxplain">
                                            <div className='new-dash-mobile'>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 2, xl: 2 }}><img src={multiWishlistN} alt="CheckIcon" className="greenIcon" loading="lazy" /></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}><Text variant="heading2xl" as="h3">{myLanguage.multiwishlisth1}</Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 4, xl: 4 }}>
                                                        {showcurrentPlan === "" ?
                                                            <p> {myLanguage.loadingText}</p> :
                                                            currentPlan > 3 ? <Toggle
                                                                checked={isMultiWishlistChecked}
                                                                onChange={handleChangeMultiWishlist}
                                                                icons={false}
                                                                disabled={false} /> : <span className='pro-plan' >{myLanguage.premium}</span>}
                                                    </Grid.Cell>
                                                </Grid>
                                                <p>{myLanguage.multiwishlisth2}</p>
                                            </div>

                                            {showcurrentPlan === "" ?
                                                <p> {myLanguage.loadingText}</p> :
                                                currentPlan > 3 ?
                                                    isMultiWishlistChecked ?
                                                        <div className='icon-enable-wf-new'><img src={greenTick} alt="CheckIcon" className="greenIcon" loading="lazy" /> {myLanguage.enabled}</div> :
                                                        <div className='icon-enable-wf-new'><img src={redCross} alt="CheckIcon" className="greenIcon" loading="lazy" />{myLanguage.disabled}</div>
                                                    : <div className='lock-minor'>
                                                        <Button onClick={visitPlanPage} ><LockMinor />{myLanguage.upgrade}</Button>
                                                    </div>}
                                        </div>
                                    </Grid.Cell>

                                    {/* -----------multi variant wishlist box----------- */}
                                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                                        <div className="wf-dashboard-box wf-dashboard-boxplain">
                                            <div className='new-dash-mobile'>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 2, xl: 2 }}><img src={multiVariantN} alt="CheckIcon" className="greenIcon" loading="lazy" /></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }} style={{ paddingLeft: '20px' }}><Text variant="heading2xl" as="h3">{myLanguage.multiVariantHeading}</Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 4, xl: 4 }}>
                                                        {showcurrentPlan === "" ?
                                                            <p> {myLanguage.loadingText}</p> :
                                                            currentPlan > 3 ? <Toggle
                                                                checked={isMultiVariantWishlistChecked}
                                                                onChange={handleChangeMultiVariantWishlist}
                                                                icons={false}
                                                                disabled={false} /> : <span className='pro-plan' >{myLanguage.premium}</span>}
                                                    </Grid.Cell>
                                                </Grid>
                                                <p>{myLanguage.multiVariantSubHeading}</p>
                                            </div>
                                            {showcurrentPlan === "" ?
                                                <p> {myLanguage.loadingText}</p> :
                                                currentPlan > 3 ?
                                                    isMultiVariantWishlistChecked ?
                                                        <div className='icon-enable-wf-new'><img src={greenTick} alt="CheckIcon" className="greenIcon" loading="lazy" /> {myLanguage.enabled}</div> :
                                                        <div className='icon-enable-wf-new'><img src={redCross} alt="CheckIcon" className="greenIcon" loading="lazy" />{myLanguage.disabled}</div>
                                                    : <div className='lock-minor'>
                                                        <Button onClick={visitPlanPage} ><LockMinor />{myLanguage.upgrade}</Button>
                                                    </div>}
                                        </div>
                                    </Grid.Cell>
                                </Grid>
                            </div>
                            <br />

                            <div className='new-dash-bg'>
                                <Grid>
                                    {/* add to wishlist button apperance */}
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                        <div className="wf-dashboard-box wf-dashboard-boxplain">
                                            <div className='new-dash-mobile'>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 2, xl: 2 }}><img src={addToButtonN} alt="CheckIcon" className="greenIcon" loading="lazy" /></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 9, lg: 10, xl: 10 }}><Text variant="heading2xl" as="h3">{myLanguage.overValueB1}</Text></Grid.Cell>
                                                </Grid>
                                                <p>{myLanguage.overValue1}</p>
                                                <br></br>
                                                <br></br>
                                                <br></br>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 8, lg: 8, xl: 8 }}><Text variant="headingSm" as="h5"><li>{myLanguage.pdpiconDash1}</li></Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>{showcurrentPlan === "" ?
                                                        <p> {myLanguage.loadingText}</p> :
                                                        currentPlan > 1 ?
                                                            getButtonDataInfo?.pdpIconOnImage?.icon === "yes" ? <div className='icon-enable-wf-new'><img src={greenTick} alt="CheckIcon" className="greenIcon" loading="lazy" /> {myLanguage.enabled}</div> : <div className='icon-enable-wf-new'><img src={redCross} alt="CheckIcon" className="greenIcon" loading="lazy" />{myLanguage.disabled}</div> : <span className='basic-plan' >{myLanguage.basic}</span>}
                                                    </Grid.Cell>
                                                </Grid>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 8, lg: 8, xl: 8 }}><Text variant="headingSm" as="h5"><li>{myLanguage.pdpiconDash2}</li></Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                                        {showcurrentPlan === "" ?
                                                            <p> {myLanguage.loadingText}</p> :
                                                            currentPlan > 1 ?
                                                                (getButtonDataInfo?.iconBesideTitle === "right" || getButtonDataInfo?.iconBesideTitle === "left") ? <div className='icon-enable-wf-new'><img src={greenTick} alt="CheckIcon" className="greenIcon" loading="lazy" /> {myLanguage.enabled}</div> : <div className='icon-enable-wf-new'><img src={redCross} alt="CheckIcon" className="greenIcon" loading="lazy" />{myLanguage.disabled}</div> : <span className='basic-plan' >{myLanguage.basic}</span>}</Grid.Cell>
                                                </Grid>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 8, lg: 8, xl: 8 }}><Text variant="headingSm" as="h5"><li>{myLanguage.pdpiconDash3}</li></Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                                        {showcurrentPlan === "" ?
                                                            <p> {myLanguage.loadingText}</p> :
                                                            currentPlan > 1 ?
                                                                (getButtonDataInfo?.iconBesideAddToCart === "right" || getButtonDataInfo?.iconBesideAddToCart === "left") ? <div className='icon-enable-wf-new'><img src={greenTick} alt="CheckIcon" className="greenIcon" loading="lazy" /> {myLanguage.enabled}</div> : <div className='icon-enable-wf-new'><img src={redCross} alt="CheckIcon" className="greenIcon" loading="lazy" />{myLanguage.disabled}</div> : <span className='basic-plan' >{myLanguage.basic}</span>}</Grid.Cell>
                                                </Grid>
                                            </div>
                                            <div className='wf-dashboard-box-inner'>
                                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                                    <Button alignment="end" onClick={() => goToSectionHandler("ButtonSetting", "add-to-wishlist-section")}>{myLanguage.configue}</Button>
                                                </Grid.Cell>
                                            </div>
                                        </div>
                                    </Grid.Cell>

                                    {/* Wishlist icon location */}
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                        <div className="wf-dashboard-box wf-dashboard-boxplain">
                                            <div className='new-dash-mobile'>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 2, xl: 2 }}><img src={iconLocationN} alt="CheckIcon" className="greenIcon" loading="lazy" /></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 9, lg: 10, xl: 10 }}><Text variant="heading2xl" as="h3">{myLanguage.overValueB6}</Text></Grid.Cell>
                                                </Grid>
                                                <p>{myLanguage.overValue6}</p>
                                                <br />
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 8, lg: 8, xl: 8 }}><Text variant="headingSm" as="h5"><li>{myLanguage.asMenuN}</li></Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>{showcurrentPlan === "" ?
                                                        <p> {myLanguage.loadingText}</p> :
                                                        getGenDataInfo.wlbLocation1 ? <div className='icon-enable-wf-new'><img src={greenTick} alt="CheckIcon" className="greenIcon" loading="lazy" /> {myLanguage.enabled}</div> : <div className='icon-enable-wf-new'><img src={redCross} alt="CheckIcon" className="greenIcon" loading="lazy" />{myLanguage.disabled}</div>}</Grid.Cell>
                                                </Grid>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 8, lg: 8, xl: 8 }}><Text variant="headingSm" as="h5"><li>{myLanguage.asHeaderN}</li></Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                                        {showcurrentPlan === "" ?
                                                            <p> {myLanguage.loadingText}</p> :
                                                            getGenDataInfo.wlbLocation2 ? <div className='icon-enable-wf-new'><img src={greenTick} alt="CheckIcon" className="greenIcon" loading="lazy" /> {myLanguage.enabled}</div> : <div className='icon-enable-wf-new'><img src={redCross} alt="CheckIcon" className="greenIcon" loading="lazy" />{myLanguage.disabled}</div>}</Grid.Cell>
                                                </Grid>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 8, lg: 8, xl: 8 }}><Text variant="headingSm" as="h5"><li>{myLanguage.asFloatingN}</li></Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                                        {showcurrentPlan === "" ?
                                                            <p> {myLanguage.loadingText}</p> :
                                                            getGenDataInfo.wlbLocation3 ? <div className='icon-enable-wf-new'><img src={greenTick} alt="CheckIcon" className="greenIcon" loading="lazy" /> {myLanguage.enabled}</div> : <div className='icon-enable-wf-new'><img src={redCross} alt="CheckIcon" className="greenIcon" loading="lazy" />{myLanguage.disabled}</div>}</Grid.Cell>
                                                </Grid>
                                            </div>
                                            <div className='wf-dashboard-box-inner'>
                                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                                    <Button onClick={() => goToSectionHandler("GeneralSetting/wishlistbuttonlocation", "wishlist-button-location-section")}>{myLanguage.configue}</Button>
                                                </Grid.Cell>
                                            </div>
                                        </div>
                                    </Grid.Cell>

                                    {/* wishlist page display setting */}
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                        <div className="wf-dashboard-box wf-dashboard-boxplain">
                                            <div className='new-dash-mobile'>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 2, xl: 2 }}><img src={wishlistDisplayN} alt="CheckIcon" className="greenIcon" loading="lazy" /></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 9, lg: 10, xl: 10 }}><Text variant="heading2xl" as="h3">{myLanguage.overValueB4}</Text></Grid.Cell>
                                                </Grid>
                                                <p>{myLanguage.overValue4}</p>
                                                <br />
                                                <Text variant="headingSm" as="h5">{myLanguage.wishlistUIHeading}</Text>
                                                {showcurrentPlan === "" ?
                                                    <p> {myLanguage.loadingText}</p> :
                                                    <Grid>
                                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 8, lg: 8, xl: 8 }}><Text variant="headingSm" as="h5"><li style={{ textTransform: "capitalize" }}>{getGenDataInfo.wishlistDisplay}</li></Text></Grid.Cell>
                                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                                            <div className='icon-enable-wf-new'><img src={greenTick} alt="CheckIcon" className="greenIcon" loading="lazy" />{myLanguage.enabled}</div>
                                                        </Grid.Cell>
                                                    </Grid>}
                                                <br />
                                            </div>
                                            <div className='wf-dashboard-box-inner'>
                                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                                    <Button onClick={() => goToSectionHandler("GeneralSetting/wishlistuisetting", "wishlist-ui-section")}>{myLanguage.configue}</Button>
                                                </Grid.Cell>
                                            </div>
                                        </div>
                                    </Grid.Cell>
                                </Grid>
                                <br />
                                {/*language settings/multiple language support */}
                                <div className="wf-dashboard-box wf-dashboard-boxplain lang-box">
                                    <div className='new-dash-mobile'>
                                        <Grid>
                                            <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 9, lg: 9, xl: 9 }}><Text variant="headingMd" as="h2"><img src={languageSettingN} alt="CheckIcon" className="greenIcon" loading="lazy" />{myLanguage.overValueB3}</Text></Grid.Cell>
                                            <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 3, lg: 3, xl: 3 }}>
                                                <div className='disable-app'><Button alignment="end" onClick={() => goToSectionHandler("GeneralSetting/languagesetting", "")}>{myLanguage.addBtn}</Button></div>
                                            </Grid.Cell>
                                        </Grid>
                                    </div>
                                    <p>{myLanguage.overValue3}</p>
                                    <br />
                                    <Grid>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}><Text variant="headingSm" as="h5">{myLanguage.admLang1}</Text>
                                            {showcurrentPlan === "" ?
                                                <p> {myLanguage.loadingText}</p> :
                                                <li style={{ textTransform: "capitalize" }}>{savedLanguage.adminLanguage} <u className='change-language-u' onClick={() => goToSectionHandler("GeneralSetting/languagesetting", "")}>{myLanguage.chngLang1}</u></li>
                                            }
                                        </Grid.Cell>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}><Text variant="headingSm" as="h5">{myLanguage.strLang1}</Text>
                                            {showcurrentPlan === "" ?
                                                <p> {myLanguage.loadingText}</p> :
                                                <> {savedLanguage?.storefrontLanguage?.map((data, index) => {
                                                    return (
                                                        <li style={{ textTransform: "capitalize" }} key={index}>{data.lang_name} <u className='change-language-u'
                                                            // onClick={() => goToSectionHandler2(`GeneralSetting/languagesetting?language_id=${data.lang_id}&type=${data.type}`)}
                                                            onClick={() => goToSectionHandler("GeneralSetting/languagesetting", "")}
                                                        >{myLanguage.edtLang1}</u></li>
                                                    )
                                                })}</>}

                                        </Grid.Cell>
                                    </Grid>
                                </div>
                            </div>
                            <br />
                            <div className='new-dash-bg'>
                                <Grid>
                                    {/* email reminders */}
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                        <div className="wf-dashboard-box wf-dashboard-boxplain">
                                            <div className='new-dash-mobile'>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 2, xl: 2 }}><img src={emailReminderN} alt="CheckIcon" className="greenIcon" loading="lazy" /></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 9, lg: 10, xl: 10 }}><Text variant="heading2xl" as="h3">{myLanguage.overValueB11}</Text></Grid.Cell>
                                                </Grid>
                                                <p>{myLanguage.overValue11}</p>
                                                <br />
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 8, lg: 8, xl: 8 }}><Text variant="headingSm" as="h5"><li>{myLanguage.monthly}</li></Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                                        {showcurrentPlan === "" ?
                                                            <p>{myLanguage.loadingText}</p> :
                                                            currentPlan > 1 ? <Toggle
                                                                checked={savedEmailReminder.monthly}
                                                                onChange={(e) => handleChangeEmailReminder(e, "monthly")}
                                                                icons={false}
                                                                disabled={false} /> : <span className='basic-plan' >{myLanguage.basic}</span>}
                                                    </Grid.Cell>
                                                </Grid>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 8, lg: 8, xl: 8 }}><Text variant="headingSm" as="h5"><li>{myLanguage.backInStock}</li></Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                                        {showcurrentPlan === "" ?
                                                            <p>{myLanguage.loadingText}</p> :
                                                            currentPlan > 2 ? <Toggle
                                                                checked={savedEmailReminder.backInStock}
                                                                onChange={(e) => handleChangeEmailReminder(e, "backInStock")} icons={false}
                                                                disabled={false} /> : <span className='pro-plan new-pro-plan' >{myLanguage.pro}</span>}
                                                    </Grid.Cell>
                                                </Grid>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 8, lg: 8, xl: 8 }}><Text variant="headingSm" as="h5"><li>{myLanguage.lowInStock}</li></Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                                        {showcurrentPlan === "" ?
                                                            <p>{myLanguage.loadingText}</p> :
                                                            currentPlan > 2 ? <Toggle
                                                                checked={savedEmailReminder.lowInStock}
                                                                onChange={(e) => handleChangeEmailReminder(e, "lowInStock")} icons={false}
                                                                disabled={false} /> : <span className='pro-plan new-pro-plan' >{myLanguage.pro}</span>}
                                                    </Grid.Cell>
                                                </Grid>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 8, lg: 8, xl: 8 }}><Text variant="headingSm" as="h5"><li>{myLanguage.priceDrop}</li></Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                                        {showcurrentPlan === "" ?
                                                            <p>{myLanguage.loadingText}</p> :
                                                            currentPlan > 2 ? <Toggle
                                                                checked={savedEmailReminder.priceDrop}
                                                                onChange={(e) => handleChangeEmailReminder(e, "priceDrop")} icons={false}
                                                                disabled={false} /> : <span className='pro-plan new-pro-plan' >{myLanguage.pro}</span>}
                                                    </Grid.Cell>
                                                </Grid>
                                            </div>
                                            <div className='wf-dashboard-box-inner'>
                                                {showcurrentPlan === "" ?
                                                    <p>{myLanguage.loadingText}</p> :
                                                    currentPlan > 2 ?
                                                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                                            <Button onClick={() => goToSectionHandler("GeneralSetting/emailsetting", "")}>{myLanguage.configue}</Button>
                                                        </Grid.Cell> :
                                                        <div className='lock-minor'>
                                                            <Button onClick={visitPlanPage} ><LockMinor />{myLanguage.upgrade}</Button>
                                                        </div>}
                                            </div>
                                        </div>
                                    </Grid.Cell>

                                    {/* required login to add the wishlist */}
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                        <div className="wf-dashboard-box wf-dashboard-boxplain">
                                            <div className='new-dash-mobile'>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 2, xl: 2 }}><img src={loginRequiredN} alt="CheckIcon" className="greenIcon" loading="lazy" /></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 7, lg: 8, xl: 8 }}><Text variant="heading2xl" as="h3">{myLanguage.isLoginHeading}</Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 2, xl: 2 }}>
                                                        {showcurrentPlan === "" ?
                                                            <p>{myLanguage.loadingText}</p> :
                                                            currentPlan > 2 ? <Toggle
                                                                checked={saveLoginRequired}
                                                                onChange={updateLoginRequiredForWishlist}
                                                                icons={false}
                                                                disabled={false} /> : <span className='pro-plan new-pro-plan' >{myLanguage.pro}</span>}

                                                    </Grid.Cell>
                                                </Grid>
                                                <p>{myLanguage.isLoginSubHeading}</p>
                                            </div>
                                            <div className='wf-dashboard-box-inner'>
                                                {showcurrentPlan === "" ?
                                                    <p>{myLanguage.loadingText}</p> :
                                                    currentPlan > 2 ?
                                                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                                            <Button onClick={() => goToSectionHandler("GeneralSetting/userlogin", "")}>{myLanguage.configue}</Button>
                                                        </Grid.Cell> :
                                                        <div className='lock-minor'>
                                                            <Button onClick={visitPlanPage} ><LockMinor />{myLanguage.upgrade}</Button>
                                                        </div>}
                                            </div>
                                        </div>
                                    </Grid.Cell>

                                    {/* klaaviyo integration */}
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                        <div className="wf-dashboard-box wf-dashboard-boxplain">
                                            <div className='new-dash-mobile'>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 2, xl: 2 }}><img src={klaviyoN} alt="CheckIcon" className="greenIcon" loading="lazy" /></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 7, lg: 6, xl: 6 }}><Text variant="heading2xl" as="h3">{myLanguage.overValueAB16}</Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 4, xl: 4 }}>
                                                        {showcurrentPlan === "" ?
                                                            <p>{myLanguage.loadingText}</p> :
                                                            currentPlan > 3 ? <></> : <span className='pro-plan' >{myLanguage.premium}</span>
                                                        }
                                                    </Grid.Cell>
                                                </Grid>
                                                <p>{myLanguage.overValue16}</p>
                                            </div>
                                            <div className='wf-dashboard-box-inner'>
                                                {showcurrentPlan === "" ?
                                                    <p>{myLanguage.loadingText}</p> :
                                                    currentPlan > 3 ?
                                                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                                            <Button onClick={() => goToSectionHandler("GeneralSetting/klaviyoIntegration", "")}>{myLanguage.configue}</Button>
                                                        </Grid.Cell> :
                                                        <div className='lock-minor'>
                                                            <Button onClick={visitPlanPage} ><LockMinor />{myLanguage.upgrade}</Button>
                                                        </div>}
                                            </div>
                                        </div>
                                    </Grid.Cell>
                                </Grid>
                                <br />

                                {/* share wishlist settings */}
                                <div className="wf-dashboard-box wf-dashboard-boxplain new-sws">
                                    <div className='new-dash-mobile'>
                                        <Grid>
                                            <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 9, lg: 9, xl: 9 }}><Text variant="headingMd" as="h2"><img src={shareWishlistN} alt="CheckIcon" className="greenIcon" loading="lazy" />{myLanguage.overValueB12}{showcurrentPlan === "" ? <p>{myLanguage.loadingText}</p> : currentPlan > 3 ? <></> : <span className='pro-plan' >{myLanguage.premium}</span>}</Text>
                                            </Grid.Cell>
                                            <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 3, lg: 3, xl: 3 }}>
                                                <div className='wf-dashboard-box-inner'>
                                                    {showcurrentPlan === "" ?
                                                        <p>{myLanguage.loadingText}</p> :
                                                        currentPlan > 3 ?
                                                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                                                <Button onClick={() => goToSectionHandler("GeneralSetting/sharewishlistsetting", "")}>{myLanguage.configue}</Button>
                                                            </Grid.Cell> :
                                                            <div className='lock-minor'>
                                                                <Button onClick={visitPlanPage} ><LockMinor />{myLanguage.upgrade}</Button>
                                                            </div>}
                                                </div>
                                            </Grid.Cell>
                                        </Grid>
                                    </div>
                                    <Grid>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 8, xl: 8 }}><p>{myLanguage.overValue12}</p></Grid.Cell>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 1, xl: 1 }}></Grid.Cell>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 3, xl: 3 }}>
                                            <div style={{ display: "flex", gap: "20px" }}>
                                                <img style={{ filter: getGenDataInfo?.linkedinCheckIcon ? 'none' : 'grayscale(100%) brightness(80%) opacity(40%)' }} src={linkedInF} alt="CheckIcon" className="greenIcon" loading="lazy" />
                                                <img style={{ filter: getGenDataInfo?.whatsappCheckIcon ? 'none' : 'grayscale(100%) brightness(80%) opacity(40%)' }} src={whatsappF} alt="CheckIcon" className="greenIcon" loading="lazy" />
                                                <img style={{ filter: getGenDataInfo?.facebookCheckIcon ? 'none' : 'grayscale(100%) brightness(80%) opacity(40%)' }} src={fbF} alt="CheckIcon" className="greenIcon" loading="lazy" />
                                                <img style={{ filter: getGenDataInfo?.twitterCheckIcon ? 'none' : 'grayscale(100%) brightness(80%) opacity(40%)' }} src={xF} alt="CheckIcon" className="greenIcon" loading="lazy" />
                                                <img style={{ filter: getGenDataInfo?.instagramCheckIcon ? 'none' : 'grayscale(100%) brightness(80%) opacity(40%)' }} src={instaF} alt="CheckIcon" className="greenIcon" loading="lazy" />
                                                <img style={{ filter: getGenDataInfo?.telegramCheckIcon ? 'none' : 'grayscale(100%) brightness(80%) opacity(40%)' }} src={telegramF} alt="CheckIcon" className="greenIcon" loading="lazy" />
                                                <img style={{ filter: getGenDataInfo?.fbMessengerCheckIcon ? 'none' : 'grayscale(100%) brightness(80%) opacity(40%)' }} src={fbMesswngerF} alt="CheckIcon" className="greenIcon" loading="lazy" />
                                            </div> </Grid.Cell>
                                    </Grid>
                                </div>
                            </div>
                            <br />
                            <div className='new-dash-bg'>
                                <Grid>
                                    {/* SMTP integration */}
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                        <div className="wf-dashboard-box wf-dashboard-boxplain">
                                            <div className='new-dash-mobile'>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 2, xl: 2 }}><img src={smtpN} alt="CheckIcon" className="greenIcon" loading="lazy" /></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 5, lg: 6, xl: 6 }}><Text variant="heading2xl" as="h3">{myLanguage.smtpHeading}</Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                                        {showcurrentPlan === "" ?
                                                            <p>{myLanguage.loadingText}</p> :
                                                            currentPlan > 3 ? <></> : <span className='pro-plan' >{myLanguage.premium}</span>}
                                                    </Grid.Cell>
                                                </Grid>
                                                <p>{myLanguage.smtpAnnouncement}</p>
                                            </div>
                                            <br />
                                            <div className='wf-dashboard-box-inner'>
                                                {showcurrentPlan === "" ?
                                                    <p>{myLanguage.loadingText}</p> :
                                                    currentPlan > 3 ?
                                                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                                            <Button onClick={() => goToSectionHandler("GeneralSetting/emailsmtpsetting", "")}>{myLanguage.configue}</Button>
                                                        </Grid.Cell> :
                                                        <div className='lock-minor'>
                                                            <Button onClick={visitPlanPage} ><LockMinor />{myLanguage.upgrade}</Button>
                                                        </div>}
                                            </div>
                                        </div>
                                    </Grid.Cell>

                                    {/* custom js/css */}
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                        <div className="wf-dashboard-box wf-dashboard-boxplain">
                                            <div className='new-dash-mobile'>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 2, xl: 2 }}><img src={customCssN} alt="CheckIcon" className="greenIcon" loading="lazy" /></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 7, xl: 7 }}><Text variant="heading2xl" as="h3">{myLanguage.overValueB10}</Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 3, xl: 3 }}>
                                                        {showcurrentPlan === "" ?
                                                            <p>{myLanguage.loadingText}</p> :
                                                            currentPlan > 1 ? <></> : <span className='basic-plan' >{myLanguage.basic}</span>}
                                                    </Grid.Cell>
                                                </Grid>
                                                <p>{myLanguage.overValue10}</p>
                                            </div>
                                            <div className='wf-dashboard-box-inner'>
                                                {showcurrentPlan === "" ?
                                                    <p>{myLanguage.loadingText}</p> :
                                                    currentPlan > 1 ?
                                                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                                            <Button onClick={() => goToSectionHandler("GeneralSetting/advancesetting", "")}>{myLanguage.configue}</Button>
                                                        </Grid.Cell> :
                                                        <div className='lock-minor'>
                                                            <Button onClick={visitPlanPage} ><LockMinor />{myLanguage.upgrade}</Button>
                                                        </div>}
                                            </div>
                                        </div>
                                    </Grid.Cell>

                                    {/* custom code integration */}
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                        <div className="wf-dashboard-box wf-dashboard-boxplain">
                                            <div className='new-dash-mobile'>
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 2, xl: 2 }}><img src={customCodeN} alt="CheckIcon" className="greenIcon" loading="lazy" /></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 7, xl: 7 }}><Text variant="heading2xl" as="h3">{myLanguage.cciHeading}</Text></Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 3, xl: 3 }}>
                                                        {showcurrentPlan === "" ?
                                                            <p>{myLanguage.loadingText}</p> :
                                                            currentPlan > 1 ? <></> : <span className='basic-plan' >{myLanguage.basic}</span>}
                                                    </Grid.Cell>
                                                </Grid>
                                                <p>{myLanguage.cciSubHeading}</p>
                                            </div>
                                            <div className='wf-dashboard-box-inner'>
                                                {showcurrentPlan === "" ?
                                                    <p>{myLanguage.loadingText}</p> :
                                                    currentPlan > 1 ?
                                                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                                            <Button onClick={() => goToSectionHandler("GeneralSetting/customCodeIntegration", "")}>{myLanguage.configue}</Button>
                                                        </Grid.Cell> :
                                                        <div className='lock-minor'>
                                                            <Button onClick={visitPlanPage} ><LockMinor />{myLanguage.upgrade}</Button>
                                                        </div>}
                                            </div>
                                        </div>
                                    </Grid.Cell>
                                </Grid>
                            </div>
                            <br />
                            <WebframezApps myLanguage={myLanguage} />
                            <br />
                            <Footer myLanguage={myLanguage} />
                            {toastMarkup}
                            {toastMarkupErr}
                        </Page>
                    </Frame>
            }
        </div >
    );
}

