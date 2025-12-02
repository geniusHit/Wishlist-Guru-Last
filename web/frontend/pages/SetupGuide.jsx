import React, { useState, useEffect, useRef } from 'react';
import { Text, Page, Tabs, Button, LegacyCard, Select, Spinner, Badge, Toast, Frame } from '@shopify/polaris';
import ColGif from '../assets/collection.gif'
import SkeletonPage1 from './SkeletonPage1';
import useAppMetafield from '../hooks/useAppMetafield';
import useApi from '../hooks/useApi';
import { useAuthenticatedFetch } from '../hooks';
import { Constants } from '../../backend/constants/constant';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { storeFrontLanguages } from '../../backend/utils/storeFrontLanguages';
import { setupGuideLanguage } from '../../backend/utils/setupGuide';

const SetupGuide = ({ values }) => {
    const { arabicMessage, englishMessage, frenchMessage, dutchMessage, germanMessage, chineseMessage, brazilianMessage, danishMessage, swedishMessage, spanishMessage, chineseTraditionalMessage, czechMessage, japaneseMessage, italianMessage, koreanMessage, norwegianBokmalMessage, polishMessage, portugueseBrazilMessage, portuguesePortugalMessage, thaiMessage, turkishMessage, finnishhMessage, hungarianMessage, herbewMessage, bulgarianMessage, ukrainianMessage, lithuanianMessage, greekMessage, irishMessage, romanianMessage, filipinoMessage, indonesianMessage, russianMessage, vietnameseMessage, albanianMessage, latvianMessage, estonianMessage } = storeFrontLanguages
    const navigate = useNavigate();
    const [switchTheme, setSwitchTheme] = useState(false);
    const [themeName, setThemeName] = useState("");
    const [selectedTab, setSelectedTab] = useState(0);
    const [showThemeButton, setShowThemeButton] = useState("");
    const [getTheme, setGetTheme] = useState(values.getTheme)
    const [getThemeId, setGetThemeId] = useState(0);
    const [setupLoading, setSetupLoading] = useState(false);
    const [showSmallLoader, setShowSmallLoader] = useState(false);
    const [showSmallLoader1, setShowSmallLoader1] = useState(false)
    const [showSmallLoader2, setShowSmallLoader2] = useState(false)
    const themeListMain = useRef(values?.themeListMain?.current);
    const themeListRef = useRef(values?.getTheme);
    const { appName, extName, serverURL } = Constants;

    // const fetch = useAuthenticatedFetch();
    const appMetafield = useAppMetafield();
    const ShopApi = useApi();
    const getPlanState = values.getPlanState;
    const activeErr = values.activeErr;
    const errorText = values.errorText;
    const toggleActiveErr = values.toggleActiveErr;
    const setErrorText = values.setErrorText;
    const isCollectionButton = values.isCollectionButton;
    const [adminLang, setAdminLang] = useState("english")
    const [textLang, setTextLang] = useState("english")
    const [setUpCollection, setSetUpCollection] = useState(isCollectionButton);
    const [isHeartBtn, setIsHeartBtn] = useState(false)
    const [shopData, setShopData] = useState(values.shopApi);
    const [alreadyOn, setAlreadyOn] = useState(false);
    const [isDemo, setIsDemo] = useState(false);

    const [setupState, setSetupState] = useState({
        // myLanguage: null,
        myLanguage: setupGuideLanguage['en'],
        browserLang: true,
        mainBrowserLang: "en"
    })

    let intervalId;

    const languageTypes = [
        { value: "albanian", label: "Albanian" },
        { value: "arabic", label: "Arabic" },
        { value: "brazilian", label: "Brazilian Portuguese" },
        { value: "bulgarian", label: "Bulgarian" },
        { value: "chinese", label: "Chinese (Simplified)" },
        { value: "chineseTraditional", label: "Chinese (Traditional)" },
        { value: "czech", label: "Czech" },
        { value: "danish", label: "Danish" },
        { value: "dutch", label: "Dutch" },
        { value: "english", label: "English" },
        { value: "filipino", label: "Filipino" },
        { value: "finnish", label: "Finnish" },
        { value: "french", label: "French" },
        { value: "german", label: "German" },
        { value: "greek", label: "Greek" },
        { value: "herbew", label: "Herbew" },
        { value: "hungarian", label: "Hungarian" },
        { value: "italian", label: "Italian" },
        { value: "irish", label: "Irish" },
        { value: "indonesian", label: "Indonesian" },
        { value: "japanese", label: "Japanese" },
        { value: "korean", label: "Korean" },
        { value: "lithuanian", label: "Lithuanian" },
        { value: "norwegianBokmal", label: "Norwegian (Bokmal)" },
        { value: "polish", label: "Polish" },
        { value: "portugueseBrazil", label: "Portuguese (Brazil)" },
        { value: "portuguesePortugal", label: "Portuguese (Portugal)" },
        { value: "romanian", label: "Romanian" },
        { value: "russian", label: "Russian" },
        { value: "spanish", label: "Spanish" },
        { value: "swedish", label: "Swedish" },
        { value: "thai", label: "Thai" },
        { value: "turkish", label: "Turkish" },
        { value: "ukrainian", label: "Ukrainian" },
        { value: "vietnamese", label: "Vietnamese" },
        { value: "latvian", label: "Latvian" },
        { value: "estonian", label: "Estonian" },

    ];

    function renderAdminOption() {
        const filteredArray = languageTypes.filter(obj => !['Arabic', 'Herbew', 'Latvian', 'Estonian'].includes(obj.label));
        return filteredArray
    }

    const toastMarkupErr = activeErr ? (
        <Toast error content={errorText} onDismiss={toggleActiveErr} />
    ) : null;


    const tabsData = getPlanState > 1 ? [
        { id: 'step-1', content: 'Choose Theme And Activate App', panelID: 'step-1-content' },
        { id: 'step-2', content: 'Enable Collection Icon', panelID: 'step-2-content' },
        { id: 'step-3', content: 'Choose Language For Your App', panelID: 'step-3-content' },
    ] : [
        { id: 'step-1', content: 'Choose Theme And Activate App', panelID: 'step-1-content' },
        { id: 'step-2', content: 'Choose Language For Your App', panelID: 'step-2-content' },
    ];

    const languages = [
        { name: "albanian", code: "sq" },
        { name: "brazilian", code: "pt-BR" },
        { name: "bulgarian", code: "bg" },
        { name: "chineseSimplified", code: "zh-CN" },
        { name: "chineseTraditional", code: "zh-TW" },
        { name: "czech", code: "cs" },
        { name: "danish", code: "da" },
        { name: "dutch", code: "nl" },
        { name: "english", code: "en" },
        { name: "finnish", code: "fi" },
        { name: "filipino", code: "fil" },
        { name: "french", code: "fr" },
        { name: "german", code: "de" },
        { name: "greek", code: "el" },
        { name: "hungarian", code: "hu" },
        { name: "irish", code: "ga" },
        { name: "italian", code: "it" },
        { name: "indonesian", code: "id" },
        { name: "japanese", code: "ja" },
        { name: "korean", code: "ko" },
        { name: "lithuanian", code: "lt" },
        { name: "norwegianBokmal", code: "nb" },
        { name: "polish", code: "pl" },
        { name: "portugueseBrazil", code: "pt-BR" },
        { name: "portuguesePortugal", code: "pt-PT" },
        { name: "romanian", code: "ro" },
        { name: "russian", code: "ru" },
        { name: "spanish", code: "es" },
        { name: "swedish", code: "sv" },
        { name: "turkish", code: "tr" },
        { name: "thai", code: "th" },
        { name: "ukrainian", code: "uk" },
        { name: "vietnamese", code: "vi" }
    ];

    useEffect(() => {
        useEffectLite();
    }, [])

    async function useEffectLite() {
        // await getDatesOfplans()
        // console.log(values)
        await getAllAppDataMetafields();
        // const shopApi = await ShopApi.shop();
        // setShopData(shopApi)
        setSetupLoading(true);
        const mainString = values?.shopApi?.domain;
        const string1 = "wishlist-guru";
        const string2 = "randeep-singh";
        const checkUserDomain = mainString?.includes(string1) || mainString?.includes(string2);
        if (!checkUserDomain) {
            clarityFxn();
        }



        // console.log("JJJJJ ----- ", getBrowserLang())
        // console.log("getThemeId --- ", getThemeId)
        await isThemeAlreadyOn();
    }


    function clarityFxn() {
        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
            t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
            y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", "r0c9ecz3ii");
    }

    const themeToggle = async (themeId) => {
        try {
            const res = await ShopApi.themeApi(themeId);
            if (res.heartButton === true) {
                setShowThemeButton("appIsNotEmbedded");
                setIsHeartBtn(false);
                setSwitchTheme(false);
                setSetUpCollection(res.collectionButton)
            } else {
                setSwitchTheme(true);
                setIsHeartBtn(true);
                setShowThemeButton("appIsEmbedded");
                setSetUpCollection(res.collectionButton)
            }
            return res;
        } catch (error) {
            console.error("An error occurred:", error);
        }
    };


    const checkThemeStatus = async () => {
        const isThemeToggle = await themeToggle(getThemeId)

        if (!isThemeToggle.heartButton) {
            clearInterval(intervalId);
        }
    };

    const collectionStatus = async () => {
        const isThemeToggle = await themeToggle(getThemeId);
        if (!isThemeToggle.collectionButton) {
            clearInterval(intervalId);
        }
    };

    const startInterval = (value) => {
        if (value === "theme") {
            intervalId = setInterval(checkThemeStatus, 3000);
        } else {
            intervalId = setInterval(collectionStatus, 3000);
        }
    };

    const clearIntervalIfRunning = () => {
        // console.log("intervalId", intervalId)
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };


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
                if (dev.role === 'main') {
                    return newArr.push({
                        value: dev.id,
                        label: `${dev.name} -- Currently Active Theme`
                    })
                } else {
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
    }

    async function getAllAppDataMetafields() {
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "current-theme-name") {
                let dData = JSON.parse(dataArray[i].node.value);
                setGetThemeId(dData?.id);
                setThemeName(prevCount => prevCount = getSelectedThemeNameFxn(dData?.id));
                await themeToggle(dData?.id);
            }
        }
    };

    function getSelectedThemeNameFxn(value) {
        let selectedThemeName = themeListRef.current.find((data) => data.value === Number(value));
        let returnThemeName = selectedThemeName?.label.replace('-- Currently Active Theme', '');
        return returnThemeName
    }

    const themeLiveTheme = async () => {
        if (isDemo === true) {
            setSwitchTheme(true);
            setShowSmallLoader(false);
            setShowThemeButton("appIsEmbedded");
        }
        window.open(`https://${values?.shopApi?.domain}/admin/themes/${getThemeId}/editor?context=apps&&activateAppId=${extName}/heart_button`, "_blank");
        startInterval("theme")
    };

    const collectionIconClick = async () => {
        window.open(`https://${values?.shopApi?.domain}/admin/themes/${getThemeId}/editor?context=apps&&activateAppId=${extName}/collection-heart`, "_blank");
        startInterval("collection");
        setAlreadyOn(false)
    }

    const handleClick = async (value) => {
        clearIntervalIfRunning()
        if (value === "") {

        } else {
            let getThemeType = themeListMain.current.find((data) => data.id === Number(value));
            if (getThemeType.role === "demo") {
                // setErrorText("You have to buy this theme first !!");
                // toggleActiveErr();
                setIsDemo(true);
                setGetThemeId(Number(value));
                setShowSmallLoader(true);
                setThemeName(prevName => prevName = getSelectedThemeNameFxn(Number(value)));
                setTimeout(() => {
                    // setSwitchTheme(true)
                    setShowSmallLoader(false);
                    // setShowThemeButton("appIsEmbedded")
                    // setShowSmallLoader(true);
                    setShowThemeButton("appIsNotEmbedded")
                }, 1000)

            } else {
                setGetThemeId(Number(value));
                setShowSmallLoader(true);
                setThemeName(prevName => prevName = getSelectedThemeNameFxn(Number(value)));

                const isThemeToggle = await themeToggle(Number(value));
                setShowSmallLoader(false);
                setSetUpCollection(isThemeToggle.collectionButton)
            }
        }
    };

    const saveMetaFirst = async () => {
        clearIntervalIfRunning()
        if (!themeName) {
            setErrorText("Please choose theme first");
            toggleActiveErr();
            setShowSmallLoader1(false)
        } else if (isDemo === true) {

            setSelectedTab(1);
            setShowSmallLoader1(false);
            const response = await fetch(`/api/get-theme-data-by-id?id=${Number(getThemeId)}`);
            const getThemeName = await response.json();
            let saveData = {
                id: Number(getThemeId),
                // themeName: getThemeName.themeName
                themeName: themeName
            }
            await createMeta(saveData, "multi", "current-theme-name")
            const sendData = {
                shopName: values?.shopApi?.shopName,
                // themeName: `${getThemeName.themeName} -- ${getThemeId}`,
                themeName: `${themeName} -- ${getThemeId}`,
                step: "step_1"
            }
            await apiInstallation(sendData);
            setShowSmallLoader(false);

        }
        else {
            setShowSmallLoader1(true)
            const isThemeToggle = await themeToggle(getThemeId);

            if (!isThemeToggle.collectionButton) {
                setAlreadyOn(true)
            } else {
                setAlreadyOn(false)
            }

            if (isThemeToggle.heartButton) {
                setErrorText("Please.. enable the block button first !!");
                toggleActiveErr();
                setShowSmallLoader1(false)
            } else {
                setSelectedTab(1)
                setShowSmallLoader1(false)

                const response = await fetch(`/api/get-theme-data-by-id?id=${Number(getThemeId)}`);
                const getThemeName = await response.json();
                let saveData = {
                    id: Number(getThemeId),
                    themeName: getThemeName.themeName
                }
                await createMeta(saveData, "multi", "current-theme-name")
                const sendData = {
                    shopName: values?.shopApi?.shopName,
                    themeName: `${getThemeName.themeName} -- ${getThemeId}`,
                    step: "step_1"
                }
                await apiInstallation(sendData)
                setShowSmallLoader(false)
            }
        }
    };

    const handleCollectionBtn = async () => {
        clearIntervalIfRunning()
        if (setUpCollection) {
            setErrorText("Enable Collection Icon First");
            toggleActiveErr();
        } else {
            setSelectedTab(2)
            const sendData = {
                shopName: values?.shopApi?.shopName,
                collectionBtn: !setUpCollection ? true : false,
                step: "step_2"
            }
            await apiInstallation(sendData)
        }
    }

    const handleComplete = async () => {
        setShowSmallLoader1(true);
        let setLang;
        if (textLang === "arabic") {
            setLang = { ...arabicMessage, languageSetting: adminLang, textMsgLanguage: textLang }
        } else if (textLang === "english") {
            setLang = { ...englishMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "french") {
            setLang = { ...frenchMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "dutch") {
            setLang = { ...dutchMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "bulgarian") {
            setLang = { ...bulgarianMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "german") {
            setLang = { ...germanMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "chinese") {
            setLang = { ...chineseMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "brazilian") {
            setLang = { ...brazilianMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "danish") {
            setLang = { ...danishMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "swedish") {
            setLang = { ...swedishMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "spanish") {
            setLang = { ...spanishMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "chineseTraditional") {
            setLang = { ...chineseTraditionalMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "finnish") {
            setLang = { ...finnishhMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "herbew") {
            setLang = { ...herbewMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "hungarian") {
            setLang = { ...hungarianMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "czech") {
            setLang = { ...czechMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "japanese") {
            setLang = { ...japaneseMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "italian") {
            setLang = { ...italianMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "korean") {
            setLang = { ...koreanMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "norwegianBokmal") {
            setLang = { ...norwegianBokmalMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "polish") {
            setLang = { ...polishMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "portugueseBrazil") {
            setLang = { ...portugueseBrazilMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "portuguesePortugal") {
            setLang = { ...portuguesePortugalMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "thai") {
            setLang = { ...thaiMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "turkish") {
            setLang = { ...turkishMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "ukrainian") {
            setLang = { ...ukrainianMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "lithuanian") {
            setLang = { ...lithuanianMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "greek") {
            setLang = { ...greekMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "irish") {
            setLang = { ...irishMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "romanian") {
            setLang = { ...romanianMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "filipino") {
            setLang = { ...filipinoMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "indonesian") {
            setLang = { ...indonesianMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "russian") {
            setLang = { ...russianMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "vietnamese") {
            setLang = { ...vietnameseMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "albanian") {
            setLang = { ...albanianMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "latvian") {
            setLang = { ...latvianMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        } else if (textLang === "estonian") {
            setLang = { ...estonianMessage, languageSetting: adminLang, textMsgLanguage: textLang };
        }



        const isToggleTheme = await themeToggle(getThemeId)
        if (themeName && isHeartBtn && adminLang && textLang) {
            if (getPlanState > 1 && !isToggleTheme.heartButton && !isToggleTheme.collectionButton) {
                performSetup(setLang);
            } else if (getPlanState <= 1 && !isToggleTheme.heartButton) {
                performSetup(setLang);
            } else {
                setErrorText("Please complete all the steps");
                toggleActiveErr();
                setShowSmallLoader1(false);
            }
        } else if (isDemo === true) {
            performSetup(setLang);
        }
        else {
            setErrorText("Please complete all the steps");
            toggleActiveErr();
            setShowSmallLoader1(false);
        }
    }

    const performSetup = async (setLang) => {
        const newSetUpGuide = "yes";
        await createMetaLanguage(setLang, "multi", "language-setting");
        await createMeta(newSetUpGuide, "single", "installation-setup-guide");

        const sendData = {
            shopName: values?.shopApi?.shopName,
            languages: {
                admin_side_language: adminLang,
                store_front_language: textLang
            },
            setupCompleted: true,
            step: "step_3"
        }
        await apiInstallation(sendData)
        await updateStoreLanguages(setLang)
        Swal.fire({
            icon: "success",
            title: "Setup Completed",
            text: "You will be redirect to the dahsboard page",
        });
        // window.top.location.href = `https://${values?.shopApi?.domain}/admin/apps/${appName}/Dashboard`;

        navigate({
            pathname: `/`,
            search: ``
        })

        setShowSmallLoader1(false);
    };

    async function apiInstallation(data) {
        try {
            const userDatas = await fetch(`${serverURL}/update-data-app-installation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
            setShowSmallLoader1(false)
        } catch (error) {
            console.log("errr ", error)
        }
    }

    async function updateStoreLanguages(lang) {
        try {
            const userDatas = await fetch(`${serverURL}/store-languages-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: values?.shopApi?.shopName,
                    languageName: textLang,
                    url: `https://${values?.shopApi?.domain}/`,
                    type: "default",
                    translations: JSON.stringify(lang).replace(/'/g, '~')
                }),
            })
        } catch (error) {
            console.log("errr ", error)
        }
    }

    async function createMetaLanguage(data, value, key) {
        const getAppMetafieldId = await appMetafield.getAppMetafieldId();
        const langData = {
            key: key,
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: JSON.stringify(data).replace(/'/g, '~')
        }
        appMetafield.createAppMetafield(langData)
        setShowSmallLoader2(false);
    }

    async function createMeta(data, value, key) {
        const getAppMetafieldId = await appMetafield.getAppMetafieldId();
        const langData = {
            key: key,
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: value === "multi" ? JSON.stringify(data) : data
        }
        appMetafield.createAppMetafield(langData)
        setShowSmallLoader2(false);
    }

    const collectionPrevious = async () => {
        setShowSmallLoader2(true)
        clearIntervalIfRunning()
        await themeToggle(getThemeId);
        setSelectedTab(0)
        setShowSmallLoader(false)
        setShowSmallLoader2(false)
    }

    const languagePrevious = async () => {
        setShowSmallLoader2(true)
        await themeToggle(getThemeId);
        setSelectedTab(1)
        setShowSmallLoader2(false)
    }

    const handleSwitchTheme = () => {
        setSwitchTheme(false)
    }

    const stepOneButton = () => {
        return <div className='setupButtons'> {showSmallLoader1 ? <Spinner accessibilityLabel="Spinner example" size="large" /> : <Button onClick={saveMetaFirst}>{setupState.myLanguage.r7}</Button>}</div>
    }

    function renderLang() {
        return <div>
            <div style={{ marginBottom: "20px" }}>
                <Text variant="headingMd" as="h2">{setupState.myLanguage.y1}</Text>

                <Select
                    label={setupState.myLanguage.y2}
                    options={renderAdminOption()}
                    value={adminLang}
                    onChange={(value) => setAdminLang(value)}
                />
            </div>

            <div>
                <Text variant="headingMd" as="h2">{setupState.myLanguage.y3}</Text>

                <Select
                    label={setupState.myLanguage.y4}
                    options={languageTypes}
                    value={textLang}
                    onChange={(value) => setTextLang(value)}
                />
            </div>
        </div>
    }


    const goToSupppportMail = () => {
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=support@webframez.com`, "_blank");
    }














    // ---------------here to get browser language---------------














    const getBrowserLang = () => {
        const browserLanguage = navigator.language || navigator.userLanguage || "en";
        const dontSplitCodes = new Set(["pt-BR", "zh-CN", "zh-TW", "pt-PT"]);
        return dontSplitCodes.has(browserLanguage) ? browserLanguage : browserLanguage.split("-")[0];
    }


    const isThemeAlreadyOn = async () => {
        try {
            // homeState.themeId && await themeToggle(homeState.themeId, homeState?.themRole || "live")
            const mainLang = getBrowserLang();

            console.log("mainLang -- ", mainLang)
            const adminLanguage = languages.find(item => item.code === mainLang);

            console.log("adminLanguage -- ", adminLanguage)
            const whichLang = setupGuideLanguage[mainLang] || setupGuideLanguage['en'];

            console.log("whichLang --- ", whichLang)

            setSetupState((prevState) => ({
                // ...prevState,
                myLanguage: whichLang,
                browserLang: true,
                // adminLanguage: adminLanguage.name,
                // storeFrontLanguage: adminLanguage.name,
                mainBrowserLang: mainLang
            }))

            // await Promise.all([
            //     setMetaFieldId(apiHook, setSetupState)
            // ])
        } catch (error) {
            console.log(error)
        }
    }






    const handleTrasnlate = () => {
        const browserLanguage = getBrowserLang();
        const mainLang = setupState.browserLang ? "en" : browserLanguage
        const adminLanguage = languages.find(item => item.code === mainLang);
        const myLanguage = setupGuideLanguage[mainLang]
        setSetupState(prev => ({
            ...prev,
            myLanguage,
            browserLang: !prev.browserLang,
            // adminLanguage: adminLanguage.name,
            // storeFrontLanguage: adminLanguage.name
        }))
    }










    return (
        !setupLoading ? <SkeletonPage1 /> :
            <Frame>
                <Page
                    fullWidth
                    title={setupState?.myLanguage?.sG}
                    subtitle={setupState.myLanguage.sGSH}

                    primaryAction={setupState.mainBrowserLang !== "en" && (
                        <div className='disable-app'>
                            <Button onClick={handleTrasnlate}>{setupState.browserLang ? "Translate Into English" : "Translate Into Local Language"}</Button>
                        </div>
                    )}

                >
                    <div className='wf-style-wishbtn wf-setup-guide'>
                        {/* <Tabs tabs={tabsData} selected={selectedTab} fitted> */}
                        <LegacyCard.Section >

                            {selectedTab === 0 && (
                                themeName === "" || !switchTheme ?
                                    <div className='wf-dashboard-box-inner'>
                                        {/* <h1 className='stepPera'>STEP 1 - Choose theme and activate app</h1> */}
                                        <div className='wg-mainThemeDiv'>
                                            <img
                                                src={ColGif}
                                                alt="icon"
                                            />
                                            <div>
                                                {/* <h1 className='stepPera'>STEP 1 - Choose theme and activate app</h1> */}
                                                <h1 className='stepPera'>{setupState.myLanguage.sG}</h1>

                                                <Text variant="headingMd" as="h2">{setupState.myLanguage.ct}
                                                    <span style={{ marginLeft: "10px" }}>
                                                        {showThemeButton === "appIsEmbedded" ?
                                                            <Badge status="success">{setupState.myLanguage.active}</Badge> :
                                                            <Badge status="attention">{setupState.myLanguage.inActive}</Badge>
                                                        }
                                                    </span>
                                                </Text>
                                                <p>{setupState.myLanguage.n2}</p>
                                                <div>
                                                    <div className='wg-themeSelect'>
                                                        <Select
                                                            options={getTheme}
                                                            onChange={handleClick}
                                                            value={getThemeId}
                                                        />
                                                        {showSmallLoader && <Spinner accessibilityLabel="Spinner example" size="large" />}
                                                        {(!showSmallLoader && showThemeButton === "appIsNotEmbedded") &&
                                                            <span className='enable-app wfq-zoom-button'><Button onClick={themeLiveTheme} >{setupState.myLanguage.n3}</Button></span>
                                                        }
                                                    </div>
                                                </div>

                                                <h4><span>{setupState.myLanguage.n5} </span> {setupState.myLanguage.n4}</h4>
                                            </div>


                                        </div>

                                        <div className='outerSetupButtons'>
                                            {stepOneButton()}
                                        </div>
                                    </div>

                                    :

                                    <div className='wf-dashboard-box-inner'>
                                        {/* <h1 className='stepPera'>STEP 1 - Choose Theme And Activate App</h1> */}

                                        {
                                            (!showSmallLoader && showThemeButton === "appIsEmbedded") &&
                                            <>
                                                <div className='wg-mainThemeDiv'>
                                                    <img
                                                        src={ColGif}
                                                        alt="icon"
                                                    />
                                                    <div>
                                                        <h1 className='stepPera'>{setupState.myLanguage.n6}</h1>

                                                        <div className='appActivated'>

                                                            <span>{setupState.myLanguage.n7}  <b> {themeName} </b>theme </span><span style={{ maxWidth: "max-content" }}><Button onClick={handleSwitchTheme} className='disable-app'>{setupState.myLanguage.n8}</Button></span>
                                                        </div>
                                                        <br />
                                                        <h2 className='stepTwoSetupGuide'>
                                                            <span style={{ fontSize: '32px' }}>✅</span> {setupState.myLanguage.n9}
                                                        </h2>
                                                    </div>
                                                </div>

                                                <div className='outerSetupButtons'>
                                                    {stepOneButton()}
                                                </div>
                                            </>
                                        }
                                    </div>

                            )}




                            {selectedTab === 1 && (
                                <div className='wf-dashboard-box-inner'>
                                    {getPlanState > 1 ? (
                                        <>
                                            {/* <h1 className='stepPera'>STEP 2 - Enable Collection Icon</h1> */}
                                            <div className='wg-mainThemeDiv'>
                                                <img
                                                    src={ColGif}
                                                    alt="icon"
                                                />
                                                <div>
                                                    <div className='wf-stepdefaultMain'>
                                                        <h1 className='stepPera'>{setupState.myLanguage.r1}</h1>

                                                        <span className='wf-stepdefault2'>{setupState.myLanguage.r2}
                                                            : <div className='basic-plan' >basic</div></span>
                                                        {
                                                            setUpCollection &&
                                                            setupState.myLanguage.r3
                                                        }


                                                    </div>


                                                    {
                                                        setUpCollection ?
                                                            <div className='enable-app wfq-zoom-button'><Button onClick={collectionIconClick} >{setupState.myLanguage.n3}</Button></div>
                                                            :
                                                            <>
                                                                <br />
                                                                {
                                                                    alreadyOn
                                                                        ?
                                                                        <h2 className='stepTwoSetupGuide'><span style={{ fontSize: '32px' }}>✅</span> {setupState.myLanguage.r4}</h2>
                                                                        :
                                                                        <h2 className='stepTwoSetupGuide'> <span style={{ fontSize: '32px' }}>✅</span> {setupState.myLanguage.r5}</h2>
                                                                }
                                                            </>
                                                    }
                                                </div>
                                                {/* <img
                                                    src={ColGif}
                                                    alt="icon"
                                                /> */}
                                            </div>

                                            <div className='outerSetupButtons'>
                                                <div className='setupButtons'>
                                                    {
                                                        showSmallLoader2 ? <Spinner accessibilityLabel="Spinner example" size="large" /> : <Button onClick={collectionPrevious}>{setupState.myLanguage.r6}</Button>
                                                    }

                                                    <Button onClick={handleCollectionBtn}>{setupState.myLanguage.r7}</Button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className='wf-dashboard-box-inner'>
                                                <h1 className='stepPera'>{setupState.myLanguage.r8}</h1>
                                                {renderLang()}

                                                <div className='outerSetupButtons'>
                                                    <div className='setupButtons'>
                                                        {
                                                            showSmallLoader2 ? <Spinner accessibilityLabel="Spinner example" size="large" /> : <Button onClick={collectionPrevious}>{setupState.myLanguage.r6}</Button>
                                                        }
                                                        <div>
                                                            {showSmallLoader1 ? <Spinner accessibilityLabel="Spinner example" size="large" /> : <span className='save-setup'><Button onClick={handleComplete}>{setupState.myLanguage.r9}</Button></span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            {getPlanState > 1 && selectedTab === 2 && (

                                <div className='wf-dashboard-box-inner'>
                                    <h1 className='stepPera'>{setupState.myLanguage.q1}</h1>

                                    {renderLang()}

                                    <div className='outerSetupButtons'>
                                        <div className='setupButtons'>
                                            {
                                                showSmallLoader2 ? <Spinner accessibilityLabel="Spinner example" size="large" /> : <Button onClick={languagePrevious}>{setupState.myLanguage.r6}</Button>
                                            }

                                            <div>
                                                {showSmallLoader1 ? <Spinner accessibilityLabel="Spinner example" size="large" /> : <span className='save-setup'><Button onClick={handleComplete}>{setupState.myLanguage.r9}</Button></span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <br></br>

                            <div style={{ backgroundColor: "#FFB800", padding: "20px", borderRadius: "20px" }}>
                                <b>{setupState.myLanguage.n5} </b>{setupState.myLanguage.q2} <span onClick={goToSupppportMail} style={{ cursor: "pointer", textDecoration: "underline", color: "blue" }}>support@webframez.com</span>
                            </div>


                        </LegacyCard.Section>
                        {/* </Tabs> */}
                    </div>
                    {toastMarkupErr}
                </Page>
            </Frame >
    )
}

export default SetupGuide;

