import React, { useEffect, useState } from 'react'
import { Frame, Page, Text, Select } from '@shopify/polaris';
import { useForm } from "react-hook-form";
import useAppMetafield from '../../hooks/useAppMetafield';
import useUtilityFunction from '../../hooks/useUtilityFunction';
import SkeletonPage1 from '../SkeletonPage1';
import SaveBar from '../SaveBar';
import Swal from 'sweetalert2';
import loaderGif from "../loaderGreen.gif";
import SingleFieldController from '../../hooks/useSingleFieldController';
import arabic from '../../assets/Languages/arabic';
import english from '../../assets/Languages/english';
import french from '../../assets/Languages/french';
import dutch from '../../assets/Languages/dutch';
import german from '../../assets/Languages/german';
import chinese from '../../assets/Languages/chinese';
import brazilian from '../../assets/Languages/brazilian';
import danish from '../../assets/Languages/danish';
import swedish from '../../assets/Languages/swedish';
import spanish from '../../assets/Languages/spanish';
import chineseTraditional from '../../assets/Languages/chineseTraditional';
import czech from '../../assets/Languages/czech';
import italian from '../../assets/Languages/italian';
import korean from '../../assets/Languages/korean';
import norwegianBokmal from '../../assets/Languages/norwegianBokmal';
import polish from '../../assets/Languages/polish';
import portugueseBrazil from '../../assets/Languages/portugueseBrazil';
import portuguesePortugal from '../../assets/Languages/portuguesePortugal';
import thai from '../../assets/Languages/thai';
import turkish from '../../assets/Languages/turkish';
import japanese from '../../assets/Languages/japanese';

import ukranian from '../../assets/Languages/ukranian';
import lithunanian from '../../assets/Languages/lithuanian';
import greek from '../../assets/Languages/greek';
import irish from '../../assets/Languages/irish';
import romanian from '../../assets/Languages/romanian';
import filipino from '../../assets/Languages/filipino';
import indonassian from '../../assets/Languages/indonesian';
import russian from '../../assets/Languages/russian';
import vietnameese from '../../assets/Languages/vietnamese';
import albanian from '../../assets/Languages/albanian';
import hungarian from '../../assets/Languages/hungarian';
import bulgarian from '../../assets/Languages/bulgarian';
import finnish from '../../assets/Languages/finnish';


import useApi from '../../hooks/useApi';
import { Constants } from '../../../backend/constants/constant';
import Footer from '../Footer';
import ManageTranslations from './ManageTranslations';
import LanguageSwitcher from './LanguageSwitcher';
import { useLocation } from 'react-router-dom';
import { storeFrontLanguages } from '../../../backend/utils/storeFrontLanguages';

const LanguageSetting = () => {
    const { arabicMessage, englishMessage, frenchMessage, dutchMessage, germanMessage, chineseMessage, brazilianMessage, danishMessage, swedishMessage, spanishMessage, chineseTraditionalMessage, czechMessage, japaneseMessage, italianMessage, koreanMessage, norwegianBokmalMessage, polishMessage, portugueseBrazilMessage, portuguesePortugalMessage, thaiMessage, turkishMessage, finnishhMessage, hungarianMessage, herbewMessage, bulgarianMessage, ukrainianMessage, lithuanianMessage, greekMessage, irishMessage, romanianMessage, filipinoMessage, indonesianMessage, russianMessage, vietnameseMessage, albanianMessage, latvianMessage, estonianMessage } = storeFrontLanguages
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search.trim());
    const language_id = searchParams.get('language_id')
    const langType = searchParams.get('type')
    const { appName, serverURL } = Constants;
    const ShopApi = useApi();
    const appMetafield = useAppMetafield();
    const utilityFunction = useUtilityFunction();
    const [currentPlan, setCurrentPlan] = useState(0);
    const [myLanguage, setMyLanguage] = useState({});
    const [saveBar, setSaveBar] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const { handleSubmit, control, reset, formState: { errors } } = useForm();
    const [wishlistTextDirection, setWishlistTextDirection] = useState("");
    const [currentSelectedLang, setCurrentSelectedLang] = useState("");
    const [render, setRender] = useState(false);
    const [shopData, setShopData] = useState();
    const [sendData, setSendData] = useState();

    useEffect(() => {
        useEffectLite();
    }, []);

    async function useEffectLite() {
        const shopData = await ShopApi.shop()
        setShopData(shopData)
        const getCurrentPlan = await appMetafield.getCurrentPlan();
        setCurrentPlan(parseInt(getCurrentPlan.currentPlan));
        await utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
        });
        if (language_id !== null && currentPlan >= 3) {
            getDataFromDB(language_id)
        } else {
            getAllAppDataMetafields();
        }
    }

    async function getAllAppDataMetafields() {
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {

            if (dataArray[i].node.key === "general-setting") {
                let dData = JSON.parse(dataArray[i].node.value);
                setWishlistTextDirection(dData.wishlistTextDirection);
            };

            if (dataArray[i].node.key === "language-setting") {
                utilityFunction.goToSectionFxn();
                let checkElement = document.querySelector(".dontRunAgain");
                if (checkElement === null) {
                    utilityFunction.upgradeButtonFxn();
                }
                let dData = JSON.parse(dataArray[i].node.value);
                const storeMsg = `${dData.textMsgLanguage}Message`
                reset({
                    languageSetting: dData.languageSetting,
                    addToWishlist: dData.addToWishlist,
                    addedToWishlist: dData.addedToWishlist,
                    removeFromWishlist: dData.removeFromWishlist,
                    addToCart: dData.addToCart,
                    addAllToCart: dData.addAllToCart,
                    viewCart: dData.viewCart,
                    noMoreItem: dData.noMoreItem,
                    addToWishlistNotification: dData.addToWishlistNotification,
                    removeFromWishlistNotification: dData.removeFromWishlistNotification,
                    shareYourWishlist: dData.shareYourWishlist,
                    alertForRemoveButton: dData.alertForRemoveButton,
                    alertForAddToCartButton: dData.alertForAddToCartButton,
                    modalHeadingText: dData.modalHeadingText,
                    textForGridIcon: dData.textForGridIcon,
                    sharableLinkModalHeading: dData.sharableLinkModalHeading,
                    alertForLinkCopied: dData.alertForLinkCopied,
                    sharedPageHeading: dData.sharedPageHeading,
                    addToMyWishlist: dData.addToMyWishlist,
                    addToMyCart: dData.addToMyCart,
                    sharedPageItemAdded: dData.sharedPageItemAdded,
                    sharedPageAlreadyAdded: dData.sharedPageAlreadyAdded,
                    sharedPageAddToCart: dData.sharedPageAddToCart,
                    shareWishlistByEmailButton: dData.shareWishlistByEmailButton,
                    shareWishlistByEmailHeading: dData.shareWishlistByEmailHeading,
                    shareWishlistByEmailFormButton: dData.shareWishlistByEmailFormButton,
                    shareWishlistByEmailSuccessMsg: dData.shareWishlistByEmailSuccessMsg,
                    textMsgLanguage: dData.textMsgLanguage,
                    shareWishlistSenderName: dData.shareWishlistSenderName,
                    shareWishlistRecipientsEmail: dData.shareWishlistRecipientsEmail,
                    shareWishlistMessage: dData.shareWishlistMessage,
                    iconHeading: dData.iconHeading,
                    outofStock: dData.outofStock,
                    loginTextForWishlist: dData.loginTextForWishlist,
                    continueShopping: dData.continueShopping,
                    loginTextAnchor: dData.loginTextAnchor,
                    createAccountAnchor: dData.createAccountAnchor,
                    searchBarText: dData.searchBarText,
                    noFoundSearchText: dData.noFoundSearchText,
                    poweredByText: dData.poweredByText,
                    quantityText: dData.quantityText,
                    productNotAvailableText: dData.productNotAvailableText,
                    quotaLimitAlert: dData.quotaLimitAlert,
                    alertAddAllToCart: dData.alertAddAllToCart,

                    orText: dData?.orText || storeFrontLanguages[storeMsg].orText,
                    headerMenuWishlist: dData?.headerMenuWishlist || storeFrontLanguages[storeMsg].headerMenuWishlist,
                    saleText: dData?.saleText || storeFrontLanguages[storeMsg].saleText,
                    clearAllWishlist: dData?.clearAllWishlist || storeFrontLanguages[storeMsg].clearAllWishlist,
                    clearWishlistToast: dData?.clearWishlistToast || storeFrontLanguages[storeMsg].clearWishlistToast,
                    isLoginParaText: dData?.isLoginParaText || storeFrontLanguages[storeMsg].isLoginParaText,
                    shareWishlistRecieverName: dData?.shareWishlistRecieverName || storeFrontLanguages[storeMsg].shareWishlistRecieverName,
                    shareWishlistMessagePlaceholder: dData?.shareWishlistMessagePlaceholder || storeFrontLanguages[storeMsg].shareWishlistMessagePlaceholder,
                    wishlistDescription: dData?.wishlistDescription || "",
                    shareToAdminButton: dData?.shareToAdminButton || "",
                    downloadCsv: dData?.downloadCsv || "",
                    mwCopyError: dData?.mwCopyError || "Currently you have only one wishlist, make another one to copy wishlist.",
                    mwChooseWishlistToSave: dData?.mwChooseWishlistToSave || "Please choose a wishlist to save the item",
                    mwAvailableInAllList: dData?.mwAvailableInAllList || "You can't copy this wishlist to any wishlists because it is already in all of them.",

                    /**MULTIWISHLIST**/
                    createWishlistHeading: dData.createWishlistHeading || storeFrontLanguages[storeMsg].createWishlistHeading,
                    createBtn: dData.createBtn || storeFrontLanguages[storeMsg].createBtn,
                    saveWishlistBtn: dData.saveWishlistBtn || storeFrontLanguages[storeMsg].saveWishlistBtn,
                    copyHeading: dData.copyHeading || storeFrontLanguages[storeMsg].copyHeading,
                    copyBtn: dData.copyBtn || storeFrontLanguages[storeMsg].copyBtn,
                    editWishlistHeading: dData.editWishlistHeading || storeFrontLanguages[storeMsg].editWishlistHeading,
                    editBtn: dData.editBtn || storeFrontLanguages[storeMsg].editBtn,
                    deleteMsg: dData.deleteMsg || storeFrontLanguages[storeMsg].deleteMsg,
                    deleteYesBtn: dData.deleteYesBtn || storeFrontLanguages[storeMsg].deleteYesBtn,
                    deleteNoBtn: dData.deleteNoBtn || storeFrontLanguages[storeMsg].deleteNoBtn,
                    clearWishlist: dData.clearWishlist || storeFrontLanguages[storeMsg].clearWishlist,
                    clearWishlistBtn: dData.clearWishlistBtn || storeFrontLanguages[storeMsg].clearWishlistBtn,


                    trendingSectionHeading: dData.trendingSectionHeading || storeFrontLanguages[storeMsg].trendingSectionHeading,
                    addProductButtonText: dData.addProductButtonText || storeFrontLanguages[storeMsg].addProductButtonText,

                    createAccountEndingText: dData?.createAccountEndingText || "",

                });
                setSendData(dData)
                setCurrentSelectedLang(dData.languageSetting);
                setIsLoading(true);
            }
        }
    };

    const saveToMetafield = async (data) => {
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        let dataSubmit = {
            languageSetting: data.languageSetting,
            addToWishlist: data.addToWishlist,
            addedToWishlist: data.addedToWishlist,
            removeFromWishlist: data.removeFromWishlist,
            addToCart: data.addToCart,
            addAllToCart: data.addAllToCart,
            viewCart: data.viewCart,
            noMoreItem: data.noMoreItem,
            addToWishlistNotification: data.addToWishlistNotification,
            removeFromWishlistNotification: data.removeFromWishlistNotification,
            shareYourWishlist: data.shareYourWishlist,
            alertForRemoveButton: data.alertForRemoveButton,
            alertForAddToCartButton: data.alertForAddToCartButton,
            modalHeadingText: data.modalHeadingText,
            textForGridIcon: data.textForGridIcon,
            sharableLinkModalHeading: data.sharableLinkModalHeading,
            alertForLinkCopied: data.alertForLinkCopied,
            sharedPageHeading: data.sharedPageHeading,
            addToMyWishlist: data.addToMyWishlist,
            addToMyCart: data.addToMyCart,
            sharedPageItemAdded: data.sharedPageItemAdded,
            sharedPageAlreadyAdded: data.sharedPageAlreadyAdded,
            sharedPageAddToCart: data.sharedPageAddToCart,
            shareWishlistByEmailButton: data.shareWishlistByEmailButton,
            shareWishlistByEmailHeading: data.shareWishlistByEmailHeading,
            shareWishlistByEmailFormButton: data.shareWishlistByEmailFormButton,
            shareWishlistByEmailSuccessMsg: data.shareWishlistByEmailSuccessMsg,
            textMsgLanguage: data.textMsgLanguage,
            shareWishlistSenderName: data.shareWishlistSenderName,
            shareWishlistRecipientsEmail: data.shareWishlistRecipientsEmail,
            shareWishlistMessage: data.shareWishlistMessage,
            iconHeading: data.iconHeading,
            outofStock: data.outofStock,
            loginTextForWishlist: data.loginTextForWishlist,
            continueShopping: data.continueShopping,
            loginTextAnchor: data.loginTextAnchor,
            orText: data.orText,
            createAccountAnchor: data.createAccountAnchor,
            searchBarText: data.searchBarText,
            noFoundSearchText: data.noFoundSearchText,
            poweredByText: data.poweredByText,
            quantityText: data.quantityText,
            productNotAvailableText: data.productNotAvailableText,
            quotaLimitAlert: data.quotaLimitAlert,
            alertAddAllToCart: data.alertAddAllToCart,
            headerMenuWishlist: data.headerMenuWishlist,
            saleText: data.saleText,
            clearAllWishlist: data.clearAllWishlist,
            clearWishlistToast: data.clearWishlistToast,
            isLoginParaText: data.isLoginParaText,
            shareWishlistRecieverName: data.shareWishlistRecieverName,
            shareWishlistMessagePlaceholder: data.shareWishlistMessagePlaceholder,
            // updateSaleText: data.updateSaleText,
            wishlistDescription: data.wishlistDescription,
            shareToAdminButton: data.shareToAdminButton,
            downloadCsv: data.downloadCsv,
            mwCopyError: data.mwCopyError,
            mwChooseWishlistToSave: data.mwChooseWishlistToSave,
            mwAvailableInAllList: data.mwAvailableInAllList,

            /**MULTIWISHLIST**/
            createWishlistHeading: data.createWishlistHeading,
            createBtn: data.createBtn,
            saveWishlistBtn: data.saveWishlistBtn,
            copyHeading: data.copyHeading,
            copyBtn: data.copyBtn,
            editWishlistHeading: data.editWishlistHeading,
            editBtn: data.editBtn,
            deleteMsg: data.deleteMsg,
            deleteYesBtn: data.deleteYesBtn,
            deleteNoBtn: data.deleteNoBtn,
            clearWishlist: data.clearWishlist,
            clearWishlistBtn: data.clearWishlistBtn,

            trendingSectionHeading: data.trendingSectionHeading,
            addProductButtonText: data.addProductButtonText,
            createAccountEndingText: data.createAccountEndingText
        };

        if (language_id) {
            if (currentPlan < 3) {
                await saveDataInMeta(dataSubmit)
                await updateStoreLanguage(dataSubmit, language_id)
            } else {
                if (langType === "default") {
                    await saveDataInMeta(dataSubmit)
                    await updateStoreLanguage(dataSubmit, language_id)
                } else {
                    await updateStoreLanguage(dataSubmit, language_id)
                }
            }
        } else {
            await saveDataInMeta(dataSubmit)
        }

        Swal.fire({
            icon: "success",
            title: myLanguage.swalHeading,
            text: myLanguage.swalText,
            confirmButtonText: myLanguage.swalOk,
        });
        if (render) {
            setTimeout(async () => {
                const shop = await ShopApi.shop();
                window.top.location.href = `https://${shop.domain}/admin/apps/${appName}/GeneralSetting/languagesetting`;
            }, [500])
        }
        setSaveBar(false);
    };

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

    function updateLang(value, shouldReset = "yes") {
        let setLang;
        if (value === "arabic") {
            setLang = { ...arabicMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "english") {
            setLang = { ...englishMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "finnish") {
            setLang = { ...finnishhMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "herbew") {
            setLang = { ...herbewMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "bulgarian") {
            setLang = { ...bulgarianMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "hungarian") {
            setLang = { ...hungarianMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "french") {
            setLang = { ...frenchMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "dutch") {
            setLang = { ...dutchMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "german") {
            setLang = { ...germanMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "chinese") {
            setLang = { ...chineseMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "brazilian") {
            setLang = { ...brazilianMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "danish") {
            setLang = { ...danishMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "swedish") {
            setLang = { ...swedishMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "spanish") {
            setLang = { ...spanishMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "chineseTraditional") {
            setLang = { ...chineseTraditionalMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "czech") {
            setLang = { ...czechMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "japanese") {
            setLang = { ...japaneseMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "italian") {
            setLang = { ...italianMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "korean") {
            setLang = { ...koreanMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "norwegianBokmal") {
            setLang = { ...norwegianBokmalMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "polish") {
            setLang = { ...polishMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "portugueseBrazil") {
            setLang = { ...portugueseBrazilMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "portuguesePortugal") {
            setLang = { ...portuguesePortugalMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "thai") {
            setLang = { ...thaiMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "turkish") {
            setLang = { ...turkishMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "ukrainian") {
            setLang = { ...ukrainianMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "lithuanian") {
            setLang = { ...lithuanianMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "greek") {
            setLang = { ...greekMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "irish") {
            setLang = { ...irishMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "romanian") {
            setLang = { ...romanianMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "filipino") {
            setLang = { ...filipinoMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "indonesian") {
            setLang = { ...indonesianMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "russian") {
            setLang = { ...russianMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "vietnamese") {
            setLang = { ...vietnameseMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "albanian") {
            setLang = { ...albanianMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "latvian") {
            setLang = { ...latvianMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else if (value === "estonian") {
            setLang = { ...estonianMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        } else {
            setLang = { ...englishMessage, languageSetting: currentSelectedLang, textMsgLanguage: value };
        }
        if (shouldReset === "yes") {
            reset(setLang);
        } else {
            return setLang
        }
    };

    function updateAdmin(value) {
        setRender(true);
        setCurrentSelectedLang(value);
        if (value === "arabic") {
            setMyLanguage(arabic);
        } else if (value === "english") {
            setMyLanguage(english);
        } else if (value === "french") {
            setMyLanguage(french);
        } else if (value === "dutch") {
            setMyLanguage(dutch);
        } else if (value === "german") {
            setMyLanguage(german);
        } else if (value === "chinese") {
            setMyLanguage(chinese);
        } else if (value === "brazilian") {
            setMyLanguage(brazilian);
        } else if (value === "danish") {
            setMyLanguage(danish);
        } else if (value === "swedish") {
            setMyLanguage(swedish);
        } else if (value === "spanish") {
            setMyLanguage(spanish);
        } else if (value === "chineseTraditional") {
            setMyLanguage(chineseTraditional);
        } else if (value === "czech") {
            setMyLanguage(czech);
        } else if (value === "japanese") {
            setMyLanguage(japanese);
        } else if (value === "italian") {
            setMyLanguage(italian);
        } else if (value === "korean") {
            setMyLanguage(korean);
        } else if (value === "norwegianBokmal") {
            setMyLanguage(norwegianBokmal);
        } else if (value === "polish") {
            setMyLanguage(polish);
        } else if (value === "portugueseBrazil") {
            setMyLanguage(portugueseBrazil);
        } else if (value === "portuguesePortugal") {
            setMyLanguage(portuguesePortugal);
        } else if (value === "thai") {
            setMyLanguage(thai);
        } else if (value === "turkish") {
            setMyLanguage(turkish);
        } else if (value === "ukrainian") {
            setMyLanguage(ukranian);
        } else if (value === "lithuanian") {
            setMyLanguage(lithunanian);
        } else if (value === "greek") {
            setMyLanguage(greek);
        } else if (value === "irish") {
            setMyLanguage(irish);
        } else if (value === "romanian") {
            setMyLanguage(romanian);
        } else if (value === "filipino") {
            setMyLanguage(filipino);
        } else if (value === "indonesian") {
            setMyLanguage(indonassian);
        } else if (value === "russian") {
            setMyLanguage(russian);
        } else if (value === "vietnamese") {
            setMyLanguage(vietnameese);
        } else if (value === "albanian") {
            setMyLanguage(albanian);
        } else if (value === "hungarian") {
            setMyLanguage(hungarian);
        } else if (value === "bulgarian") {
            setMyLanguage(bulgarian);
        } else if (value === "finnish") {
            setMyLanguage(finnish);
        } else {
            setMyLanguage(english);
        }
        setRtl(value)
    };

    function setRtl(value) {
        const iframeDiv = document.getElementById(`wg-app`);
        if (value === "arabic" && iframeDiv) {
            iframeDiv.setAttribute("dir", "rtl");
        } else {
            iframeDiv.setAttribute("dir", "ltr");
        }
    }

    async function saveDataInMeta(dataSubmit) {
        try {
            const getAppMetafieldId = await appMetafield.getAppMetafieldId();
            const appMetadata = {
                key: "language-setting",
                namespace: "wishlist-app",
                ownerId: getAppMetafieldId,
                type: "single_line_text_field",
                value: JSON.stringify(dataSubmit).replace(/'/g, '~')
            };
            await appMetafield.createAppMetafield(appMetadata)
        } catch (error) {
            console.log(err)
        }
    }

    async function getDataFromDB(id) {
        try {
            const storeLanguagesData = await fetch(`${serverURL}/get-store-language-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shopData.shopName,
                    id: id
                }),
            })

            const result = await storeLanguagesData.json();
            const newResult = result?.data?.[0]?.translations;

            if (!newResult) throw new Error("No translation data found");

            const dataValue = JSON.parse(newResult);
            const storeMsg = `${dataValue.textMsgLanguage}Message`;

            const newKeys = [
                "headerMenuWishlist",
                "saleText",
                "clearAllWishlist",
                "clearWishlistToast",
                "isLoginParaText",
                "shareWishlistRecieverName",
                "orText",
                "shareWishlistMessagePlaceholder",
                "createWishlistHeading",
                "createBtn",
                "saveWishlistBtn",
                "copyHeading",
                "copyBtn",
                "editWishlistHeading",
                "editBtn",
                "deleteMsg",
                "deleteYesBtn",
                "deleteNoBtn",
                "clearWishlist",
                "clearWishlistBtn",
                "trendingSectionHeading",
                "addProductButtonText"
            ];

            newKeys.forEach(key => {
                dataValue[key] = dataValue[key] || storeFrontLanguages[storeMsg]?.[key];
            });

            const mainData = JSON.stringify(dataValue).replace(/~/g, "'");
            reset(JSON.parse(mainData));



        } catch (err) {
            console.log(err)
        }
    }

    async function updateStoreLanguage(newData, id) {
        try {
            const userDatas = await fetch(`${serverURL}/update/store-languages-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shopData.shopName,
                    id: id,
                    translations: JSON.stringify(newData),
                }),
            })
            let results = await userDatas.json();
        } catch (error) {
            console.log(error)
        }
    }

    const sendDataToLangSwitcher = {
        myLanguage: myLanguage,
        control: control,
        setSaveBar: setSaveBar,
        updateLang: updateLang,
        currentPlan: currentPlan,
        languageTypes: languageTypes,
        ShopApi: ShopApi,
        serverURL: serverURL,
        currentSelectedLang: currentSelectedLang,
        shopData: shopData,
        getDataFromDB: getDataFromDB,
        language_id: language_id,
        sendData: sendData,
        appName: appName,
        saveDataInMeta: saveDataInMeta
    }

    return (
        <div dir={wishlistTextDirection} className='wf-dashboard wf-languageSetting' >
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    <form onSubmit={handleSubmit(saveToMetafield)}>
                        {(saveBar) ? <SaveBar save={myLanguage.save} /> : ""}
                        <Page fullWidth
                            title={myLanguage.overValueB3}
                            subtitle={myLanguage.overValue3}
                            backAction={{
                                onAction: () => {
                                    history.back();
                                    setSaveBar(false);
                                },
                            }}
                        >
                            {
                                language_id === null &&
                                <div className='wf-style-wishbtn'>
                                    <div id="wishlist-Language-section">
                                        <Text variant="headingMd" as="h2">{myLanguage.languageOptionHead}</Text>
                                        <SingleFieldController name="languageSetting" control={control}  >
                                            {({ field }) => <Select
                                                label={myLanguage.languageOptionText}
                                                options={renderAdminOption()}
                                                value={field.value}
                                                onChange={(value) => { field.onChange(value); setSaveBar(true); updateAdmin(value) }}
                                            />}
                                        </SingleFieldController>
                                    </div>
                                </div>
                            }

                            {language_id !== null
                                ? <ManageTranslations data={sendDataToLangSwitcher} />
                                : <div className='wf-style-wishbtn'>
                                    <LanguageSwitcher data={sendDataToLangSwitcher} />
                                </div>
                            }

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

export default LanguageSetting;