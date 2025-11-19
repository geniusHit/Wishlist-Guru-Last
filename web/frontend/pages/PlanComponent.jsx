import React, { useEffect, useState, useCallback } from 'react'
import { Page, Grid, LegacyCard, Button, Icon, Badge, ButtonGroup, Text, Toast, Frame, TextField } from '@shopify/polaris';
import { useAuthenticatedFetch } from '../hooks'
import useApi from '../hooks/useApi';
import { StatusActiveMajor } from '@shopify/polaris-icons';
import useSubscriptionUrl from '../hooks/useSubscriptionUrl';
import SkeletonPage1 from './SkeletonPage1';
import useAppMetafield from '../hooks/useAppMetafield';
import loaderGif from "./loaderGreen.gif";
import Swal from 'sweetalert2';
import useUtilityFunction from '../hooks/useUtilityFunction';
import freePlanIcon from '../assets/free-pricing-icon.svg';
import basicPlanicon from '../assets/basic-pricing-icon.svg';
import premiumPlanIcon from '../assets/premium-pricing-icon.svg';
import 'react-toggle/style.css';
import { Constants } from '../../backend/constants/constant';
import pricingSelectIcon from '../assets/pricing-select-icon.svg';
import talkToUsIcon from '../assets/talktous-icon.svg';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
// import blackFridaySaleImg from '../assets/black-friday-sale.png';
import { DeleteMinor } from '@shopify/polaris-icons';
import WebframezApps from './WebframezApps';
// import bannerImage from '../assets/banner-image.png';

const PlanComponent = ({ setCurrentState }) => {

    const { appName, serverURL } = Constants;
    const appMetafield = useAppMetafield();
    const subscription = useSubscriptionUrl();
    const utilityFunction = useUtilityFunction();

    const navigate = useNavigate()

    const ShopApi = useApi();
    // const fetch = useAuthenticatedFetch();
    const [shop, setShop] = useState();
    const [status, setStatus] = useState("");
    const [isloading, setIsLoading] = useState(false);
    const [wishlistTextDirection, setWishlistTextDirection] = useState("");
    const [checkSubStatus, setCheckSubStatus] = useState("");
    const [planData, setPlanData] = useState([]);
    const [toggleValue, setToggleValue] = useState(false);
    const [activeButtonIndex, setActiveButtonIndex] = useState(0);
    const [myLanguage, setMyLanguage] = useState({});
    const [promoCode, setPromoCode] = useState("");
    const [validPromoValue, setValidPromoValue] = useState(null);
    const [getShopifyPlan, setGetShopifyPlan] = useState("");

    let subscriptionAmount = null;
    let subscriptionType = "";

    const [addPlan, setAddPlan] = useState(0);
    const [freePlanUpdate, setFreePlanUpdate] = useState(false);


    // ---------- states for the toast ------------
    const [active, setActive] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const toastMarkup = active ? (
        <Toast content={errorMsg} onDismiss={toggleActive} />
    ) : null;


    // ----------- appy promo for test accounts -----------
    const partnerData = {
        promo_id: 13,
        promo_code: "PARTNER",
        status: "active",
        start_date: "2025-06-20T05:58:34.000Z",
        end_date: "2025-06-20T05:58:34.000Z",
        check_date: "none",
        country: null,
        plan_name: "all",
        plan_type: "none",
        previous_plan: "none",
        discount: "0",
        discount_type: null,
        trial_days: 0,
        store: null
    }

    useEffect(() => {
        useEffectLite();
    }, [freePlanUpdate])


    async function useEffectLite() {

        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "current-plan") {

                let dData = JSON.parse(dataArray[i].node.value);
                const subscriptionStatus = await appMetafield.getCurrentPlan();
                // console.log("current selected plan --", dData);
                // getWebHookData();
                if (dData === -999 && subscriptionStatus.id === 1 && freePlanUpdate === false) {
                    setAddPlan(dData);
                    const shopApi = await ShopApi.shop();
                    setGetShopifyPlan(shopApi?.shopifyPlan);
                    setValidPromoValue((shopApi?.shopifyPlan === "affiliate" || shopApi?.shopifyPlan === "partner_test") ? partnerData : null);
                    const planData = await getPlanData(shopApi.domain);
                    setPlanData(planData)
                    const subscriptionStatus = await appMetafield.getCurrentPlan();
                    // console.log("JJJJJJ ", subscriptionStatus)
                    // getWebHookData(subscriptionStatus.currentPlan);
                    await utilityFunction.getCurrentLanguage().then((res) => {
                        setMyLanguage(res);
                    });
                    getAllAppDataMetafields();
                    setShop(shopApi);
                    setIsLoading(true);
                    setCheckSubStatus(subscriptionStatus.id);

                } else {
                    const shopApi = await ShopApi.shop();
                    setGetShopifyPlan(shopApi?.shopifyPlan);
                    setValidPromoValue((shopApi?.shopifyPlan === "affiliate" || shopApi?.shopifyPlan === "partner_test") ? partnerData : null);
                    const planData = await getPlanData(shopApi.domain);
                    setPlanData(planData)
                    const subscriptionStatus = await appMetafield.getCurrentPlan();
                    // await savePlanInSql(subscriptionStatus.currentPlan, shopApi.shopName);
                    // console.log("JJJJJJ ", subscriptionStatus)
                    getWebHookData(subscriptionStatus.currentPlan);
                    await savePlanInMetaField(subscriptionStatus.currentPlan);
                    await utilityFunction.getCurrentLanguage().then((res) => {
                        setMyLanguage(res);
                    });
                    getAllAppDataMetafields();
                    setShop(shopApi);
                    // setIsLoading(true);
                    setStatus(subscriptionStatus.currentPlan);
                    setCheckSubStatus(subscriptionStatus.id)
                    if (localStorage.getItem("wishlist-guru-inhouse") === "true") {
                        localStorage.setItem("wishlist-guru-inhouse", false)
                        window.location.reload();
                    } else {
                        setIsLoading(true);
                    }
                }
            }
        }
        Swal.close();

        // const shopApi = await ShopApi.shop();
        // const planData = await getPlanData(shopApi.domain);
        // setPlanData(planData)
        // const subscriptionStatus = await appMetafield.getCurrentPlan();
        // await savePlanInSql(subscriptionStatus.currentPlan, shopApi.shopName);
        // await savePlanInMetaField(subscriptionStatus.currentPlan);

        // await utilityFunction.getCurrentLanguage().then((res) => {
        //     setMyLanguage(res);
        // });

        // getAllAppDataMetafields();
        // setShop(shopApi);
        // setIsLoading(true);
        // setStatus(subscriptionStatus.currentPlan);
        // setCheckSubStatus(subscriptionStatus.id)
    }

    async function getWebHookData(getCurrentPlan) {
        try {
            const response = await fetch(`/api/re-register-webhook?plan=${getCurrentPlan}`);
            const result1 = await response.json();
            console.log("WEBHOOK_", result1)
        } catch (error) {
            console.error("Error:", error);
        }
    };

    async function getPlanData(domain) {
        try {
            const userData = await fetch(`${serverURL}/get-plan-data?domain=${domain}`)
            let result = await userData.json();
            return result.data
        } catch (error) {
            console.log("errr ", error)
        }
    }

    async function savePlanInSql(currentPlan, shopName) {
        let planName = []
        try {
            const userData = await fetch(`${serverURL}/get-plan-name`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: currentPlan
                }),
            })
            let result = await userData.json();
            planName = result.data

        } catch (error) {
            console.log("errr ", error)
        }

        try {
            const userDatas = await fetch(`${serverURL}/app-installation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shop.shopName,
                    currentPlanId: currentPlan,
                    currentPlanName: planName[0].name
                }),
            })
            let results = await userDatas.json();

        } catch (error) {
            console.log("errr ", error)
        }
    };

    async function savePlanInMetaField(data) {
        const getAppMetafieldId = await appMetafield.getAppMetafieldId();

        console.log("getAppMetafieldId )))", getAppMetafieldId)

        const appMetadata = {
            key: "current-plan",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: data
        };
        try {
            const response = await fetch("/api/app-metafield/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appMetadata),
            });
            const result = await response.json();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    async function getAllAppDataMetafields() {
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "general-setting") {
                let dData = JSON.parse(dataArray[i].node.value);
                setWishlistTextDirection(dData.wishlistTextDirection);
            };
        }
    };

    const handleChange = async (planType) => {
        Swal.fire({
            text: "Please wait for a while...",
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        if (validPromoValue?.promo_code) {
            const planNames = validPromoValue.plan_name.split(',').map(name => name.trim());
            // if (validPromoValue.plan_name !== "all" && validPromoValue.plan_name !== planType.planName) {
            if (validPromoValue.plan_name !== "all" && (!planNames.includes(planType.planName))) {
                return Swal.fire({
                    icon: "warning",
                    title: "Oops...",
                    text: `${validPromoValue?.promo_code} is only available for ${validPromoValue.plan_name} plan`,
                });
            }
            if (validPromoValue.previous_plan === "check") {
                const response = await fetch(`${serverURL}/check-promo-code-prev-plan`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        shopName: shop.shopName,
                        planName: planType.planName
                    }),
                });
                const result = await response.json();

                if (result.data.length > 0) {
                    return Swal.fire({
                        icon: "warning",
                        title: "Oops...",
                        text: `${validPromoValue?.promo_code} is only available for first-time ${validPromoValue.plan_name} plan users.`,
                    });
                }
            }
        }
        proccedToPayment(planType, validPromoValue)
    };


    async function proccedToPayment(value, promoData = null) {
        localStorage.setItem("wishlist-guru-inhouse", true);
        Swal.fire({
            text: "Please wait for a while...",
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        let returnData = ``;
        if (value.type === "getPlan") {
            returnData = `https://${shop.domain}/admin/apps/${appName}/Dashboard`;
        } else {
            returnData = `https://${shop.domain}/admin/apps/${appName}/PricingPlan`;
        }
        try {
            const response = await fetch("/api/subscription/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ price: value.amount, interval: value.interval, shop: shop.shopName, plan: value.planName, returnUrl: returnData, promoData: promoData }),
            });
            const result = await response.json();
            const urlName = result.data.confirmationUrl;
            const subscription = useSubscriptionUrl(urlName);
            subscription.ReloadPage();
        } catch (error) {
            console.error("Error:", error);
        }
    }


    const cancelCurrentPlan = async () => {
        Swal.fire({
            text: "Please wait for a while...",
            imageUrl: loaderGif,
            showConfirmButton: false,
        });
        await getGeneralSettingData().then(async (res) => {
            let customizedData = { ...res, wishlistDisplay: "modal" };
            const getAppMetafieldId = await appMetafield.getAppMetafieldId();
            const appMetadata = {
                key: "general-setting",
                namespace: "wishlist-app",
                ownerId: getAppMetafieldId,
                type: "single_line_text_field",
                value: JSON.stringify(customizedData)
            };
            await appMetafield.createAppMetafield(appMetadata);
        })

        try {
            const response = await fetch("/api/subscription/cancel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: checkSubStatus }),
            });
            const result = await response.json();
            if (result.msg === "Subscription Cancelled") {
                window.top.location.href = `https://${shop.domain}/admin/apps/${appName}/PricingPlan`;
                // Navigate({
                //     pathname: `/PricingPlan`,
                //     search: ``
                // })
            }
            else {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong!..",
                });
            }
        } catch (error) {
            console.error("Error:", error)
        }
    };



    async function getGeneralSettingData() {
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "general-setting") {
                let returnData = JSON.parse(dataArray[i].node.value);
                return returnData
            }
        }
    };


    const handleToggleChange = (value) => {
        // setToggleValue(!toggleValue);
        setToggleValue(value === "yearly" ? true : false);

        const monthDiv = document.getElementById('monthlyLabel')
        const yearDiv = document.getElementById('yearlyLabel')

        if (value === "monthly") {
            const isClass = yearDiv.classList.contains('activeToggle')
            if (isClass) {
                yearDiv.classList.remove('activeToggle');
            }
            monthDiv.classList.add('activeToggle');
        } else {
            const isClass = monthDiv.classList.contains('activeToggle')
            if (isClass) {
                monthDiv.classList.remove('activeToggle');
            }
            yearDiv.classList.add('activeToggle');
        }
    };

    const getFreePlanFirst = async () => {
        // console.log("free plan ")
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });

        const getAppMetafieldId = await appMetafield.getAppMetafieldId();
        const appMetadata = {
            key: "current-plan",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: "1"
        };

        try {
            const response = await fetch("/api/app-metafield/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appMetadata),
            });
            const result = await response.json();
            // console.log("DDDD 7777  ", result)
            if (result.msg === "app-data-metafield is created successfully") {
                // window.top.location.href = `https://${shop.domain}/admin/apps/${appName}/Dashboard`;
                // Navigate({
                //     pathname: `/`,
                //     search: ``
                // })

                setCurrentState("setup");
                navigate({
                    pathname: "/Dashboard",
                    search: ``
                });

                setFreePlanUpdate(true);
                setAddPlan(0);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
    // console.log("togg", toggleValue)





    const handleChangePromo = useCallback(
        (newValue) => {
            // console.log(";;;;", newValue)
            setPromoCode(newValue)
        },
        [],
    );


    // const handleChangePromo = useCallback(
    //     (newValue) => {
    //         setPromoCode((prevState) => {
    //             // You can optionally use prevState here if needed
    //             return newValue;
    //         });
    //     },
    //     [],
    // );


    const handleApplyPromo = async (code, from = null) => {
        const { pcAddedHeading, pcAddedSubHeading, ohoh, swalOk } = myLanguage;

        if (from === "input" && !promoCode) {
            return Swal.fire({
                icon: "warning",
                title: myLanguage.ipcHeading,
                text: myLanguage.ipcSubHeading,
            })
            // showSwalPopup("warning", myLanguage.ohoh, myLanguage.pleaseEnterPc, myLanguage.swalOk, null, null)
        }

        // showSwalLoading(myLanguage);

        Swal.fire({
            text: "Please wait for a while...",
            imageUrl: loaderGif,
            showConfirmButton: false,
        });

        try {
            const response = await fetch(`${serverURL}/check-promo-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shopName: shop.shopName,
                    cuponCode: code ? code : promoCode,
                    planType: toggleValue ? "ANNUAL" : "EVERY_30_DAYS"
                }),
            });

            const { msg, data } = await response.json();
            if (!data.length) {
                // showSwalPopup("warning", ohoh, msg || ipcSubHeading, swalOk, null, null)
                Swal.fire({
                    icon: "warning",
                    title: myLanguage.ipcHeading,
                    text: msg || ipcSubHeading,
                })

            } else {
                Swal.fire({
                    icon: "success",
                    title: pcAddedHeading,
                    text: `${pcAddedSubHeading} ${code ? code : promoCode}`,
                })
                setValidPromoValue(data[0])
                setPromoCode("")
            }
        } catch (error) {
            console.error("Error fetching promo code:", error);
        }
    }

    const handleDeletePromo = () => {
        setValidPromoValue(null)
    }

    return (
        <div className='wfq-dashboard wf-dashboard wfq-dashboard-plane wfq-quote-plan-page'>
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    <Page
                        fullWidth
                        title={myLanguage.planPageMainHeading1}
                        subtitle={myLanguage.planPageMainText1}
                    >

                        {/* <div style={{ marginBottom: "20px" }}>
                            <img src={bannerImage} width="100%" alt="Sample Image" style={{ borderRadius: "10px" }} />
                        </div> */}

                        <div className='note-div'>
                            {addPlan === -999
                                ? <>
                                    <span className='note-span'>{myLanguage.noteHeading}</span>
                                    <span>{myLanguage.noteText1}</span>
                                </>
                                : <>
                                    <span className='note-span'>{myLanguage.noteHeading} </span>
                                    <span> {myLanguage.noteText2}</span>
                                </>
                            }
                        </div>

                        <div className='toggle-paid-section wfq-style-wishbtn'>
                            <div className='toggle-paid-inner'>
                                <label onClick={() => handleToggleChange('monthly')} id='monthlyLabel' className='activeToggle'>{myLanguage.monthly}</label>
                                <label onClick={() => handleToggleChange('yearly')} id='yearlyLabel'>{myLanguage.yearly}</label>
                            </div>
                            <p><span>{myLanguage.discount} {myLanguage.yearlySub}</span></p>
                        </div>

                        <div className='pricing-plan-table'>
                            {planData.map(({ plan_id, name, yearly_price, monthly_price, plan_feature, sp_monthly_price, sp_yearly_price }) => {
                                const isYearly = toggleValue;
                                const subscriptionAmount = isYearly ? getShopifyPlan === "shopify_plus" ? sp_yearly_price : yearly_price : getShopifyPlan === "shopify_plus" ? sp_monthly_price : monthly_price;
                                const subscriptionType = isYearly ? "ANNUAL" : "EVERY_30_DAYS";
                                const getClass = `${plan_id === 1 ? "freePlanBox" : plan_id === 2 ? "basicPlanBox" : plan_id === 3 ? "proPlanBox" : "premiumPlanBox"}`
                                return (
                                    <div key={plan_id} className={`${Number(status) === plan_id ? 'highLight_div' : ""}`}>
                                        <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }} >
                                            <div className={`${getClass}`}>
                                                <LegacyCard sectioned subdued>
                                                    <div className='basicClass'>
                                                        <h2>{name}</h2>
                                                        <div className='pricing-price'>${subscriptionAmount}

                                                            {/* <span>{isYearly ? `/${myLanguage.yearPlan}` : `/${myLanguage.month}`}</span> */}

                                                        </div>
                                                        <div dangerouslySetInnerHTML={{ __html: plan_feature }} />

                                                        {Number(status) === plan_id ? <Button>SELECTED</Button> : ""}

                                                        {Number(status) !== 1 && plan_id === 1 && (
                                                            <div className="addPlanBtn">
                                                                {addPlan === -999 ?
                                                                    <Button onClick={getFreePlanFirst} >GET PLAN</Button> :
                                                                    <Button onClick={cancelCurrentPlan}>CHANGE PLAN</Button>
                                                                }

                                                            </div>
                                                        )}

                                                        {Number(status) !== plan_id && plan_id !== 1 && (
                                                            <div className="addPlanBtn">
                                                                {addPlan === -999 ?
                                                                    <Button onClick={() => handleChange({ amount: subscriptionAmount, interval: subscriptionType, planName: name, type: "getPlan" })}>   GET PLAN   </Button> :
                                                                    <Button onClick={() => handleChange({ amount: subscriptionAmount, interval: subscriptionType, planName: name, type: "changePlan" })}>   CHANGE PLAN   </Button>
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </LegacyCard>
                                            </div>
                                        </Grid.Cell>
                                    </div>
                                )
                            })}
                        </div>

                        <div className='wfq-style-wishbtn wf-style-wishbtn wfq-promo-code-box'>
                            <div className='wfq-style-wishbtn wf-style-wishbtn'>
                                <div className=''>
                                    <Text>{myLanguage.promoCodeH}</Text>
                                    <div className='wfq-quote-form-btn'>
                                        <TextField type='text' onChange={handleChangePromo} value={promoCode} placeholder={myLanguage.promoPlaceholder} />
                                        <div className='disable-app'>
                                            <Button onClick={() => handleApplyPromo(null, "input")}>{myLanguage.apply}</Button>
                                        </div>
                                    </div>

                                    {
                                        validPromoValue?.promo_code
                                            ? <div className='lang-radio-btn'>
                                                <p>
                                                    <span className='wfq-customBadge orderBadge'>{validPromoValue.promo_code} </span> {myLanguage.isApplied} {<b>{validPromoValue.plan_name}   {validPromoValue.plan_name === "all" ? myLanguage.promoPlans : myLanguage.promoPlan}</b>}
                                                </p>

                                                <div className="del-btn" onClick={handleDeletePromo}>
                                                    <Icon source={DeleteMinor} color="inkLighter" />
                                                </div>
                                            </div>
                                            : ""
                                    }
                                </div>
                            </div>

                            <div className='wfq-style-wishbtn wfq-avail-promo'>
                                <Text variant="headingMd" as="h2">{myLanguage.availablePromoCode}</Text>
                                <p>{myLanguage.availablePromoCodeSH}</p>

                                <div className='promo-code-list'>
                                    {/* <div className='wfq-main-promo'><span>Get 15 days trial</span> <span className='wfq-apply-span'><span className='bold-promo-list'>TRIAL15</span><div className='wfq-quote-form-btn disable-app'><Button size='slim' onClick={() => handleApplyPromo("TRIAL15")}>{myLanguage.applyNow}</Button></div></span></div> */}

                                    {/* <div className='wfq-main-promo'><span>Flat 20% off on all plans</span> <span className='wfq-apply-span'><span className='bold-promo-list'>GET20OFF</span><div className='wfq-quote-form-btn disable-app'><Button size='slim' onClick={() => handleApplyPromo("GET20OFF")}>{myLanguage.applyNow}</Button></div></span></div> */}

                                    {getShopifyPlan === "partner_test" || getShopifyPlan === "affiliate" ?
                                        <div className='wfq-main-promo'><span>{myLanguage.partnerPromo}</span> <span className='wfq-apply-span'><span className='bold-promo-list'>PARTNER</span><div className='wfq-quote-form-btn disable-app'><Button size='slim' onClick={() => handleApplyPromo("PARTNER")}>{myLanguage.applyNow}</Button></div></span></div> :
                                        <p className='wfq-no-promo'>{myLanguage.noPromoCode}</p>
                                    }
                                </div>
                            </div>
                        </div>
                        <WebframezApps myLanguage={myLanguage} />
                        <div style={{ marginTop: "20px" }}>
                            <Footer myLanguage={myLanguage} />
                        </div>
                    </Page >
                </Frame>
            }
        </div >



    )
}

export default PlanComponent;






