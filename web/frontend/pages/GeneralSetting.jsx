
import React, { useState, useEffect } from 'react';
import { MediaCard, Frame, Page, Grid, Text } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import useUtilityFunction from '../hooks/useUtilityFunction';
import SkeletonPage1 from './SkeletonPage1';
import WishlistUiTypeIcon from '../assets/Wishlistuitype.svg';
import WishlistIconLocationIcon from '../assets/Wishlisticonlocation.svg';
import NotificationSettingIcon from '../assets/NotificationSetting.svg';
import SharewishlistsettingIcon from '../assets/Sharewishlistsetting.svg';
import LanguageSettingIcon from '../assets/LanguageSetting.svg';
import AddtocartsettingIcon from '../assets/Addtocartsetting.svg';
import emailremindersIcon from '../assets/emailreminders.svg';
import CustomcssIcon from '../assets/Customcss.svg';
import viewSetting from '../assets/viewSettings.png';
import AuthImg from '../assets/auth.png';
import Footer from './Footer';
import klaviyo from '../assets/klaviyo.svg';
import TrendingIcon from '../assets/trending-up.svg';

// iconLocationHeading

const GeneralSetting = () => {
    const navigate = useNavigate();
    const utilityFunction = useUtilityFunction();
    const [myLanguage, setMyLanguage] = useState({});
    const [isloading, setIsLoading] = useState(false);
    // console.log("my-Language - genralSettings", myLanguage)

    useEffect(() => {
        useEffectLite();
    }, [])

    async function useEffectLite() {
        await utilityFunction.getPlanFirst();
        await utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
            setIsLoading(true)
        });
    }

    return (
        <Frame>
            {!isloading ?
                <SkeletonPage1 />
                :
                <div className='wf-dashboard wf-generalSetting'>
                    <Page fullWidth title={myLanguage.generalSettingMainHeading} subtitle={myLanguage.generalSettingMainText}>

                        {/* <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                            <Text as="h2" variant="headingMd">
                                {myLanguage.wishlistUIcard1Title}
                            </Text>
                        </Grid.Cell> */}
                        <div className='wf-dashboard-box'>
                            <div className='wf-dashboard-box-inner'>
                                <div className='Polaris-Box'>
                                    <MediaCard
                                        // title={myLanguage.wishlistUIcard1Title}
                                        title={myLanguage.overValueB4}

                                        primaryAction={{
                                            content: `${myLanguage.lanuageEditName}`,
                                            // content: `${myLanguage.overValue4}`,
                                            onAction: () => { navigate(`/GeneralSetting/wishlistuisetting?`) },
                                        }}
                                        // description={myLanguage.wishlistUIText}
                                        description={myLanguage.overValue4}

                                        size="small"
                                    >
                                        <img
                                            alt="setting_"
                                            src={WishlistUiTypeIcon}
                                        />
                                    </MediaCard>
                                </div>
                            </div>


                            {/* <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                            <Text as="h2" variant="headingMd">
                                {myLanguage.iconLocationHeading}
                            </Text>
                        </Grid.Cell> */}

                            <div className='wf-dashboard-box-inner'>
                                <div className='Polaris-Box'>
                                    <MediaCard
                                        // title={myLanguage.iconLocationHeading}
                                        title={myLanguage.overValueB6}

                                        primaryAction={{
                                            content: `${myLanguage.lanuageEditName}`,
                                            onAction: () => { navigate(`/GeneralSetting/wishlistbuttonlocation`) },
                                        }}
                                        // description={myLanguage.iconLocationText}
                                        description={myLanguage.overValue6}
                                        size="small"
                                    >
                                        <img
                                            alt="setting_"
                                            src={WishlistIconLocationIcon}
                                        />
                                    </MediaCard>
                                </div>
                            </div>

                            {/* <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                            <Text as="h2" variant="headingMd">
                                {myLanguage.notificationHeading}
                            </Text>
                        </Grid.Cell> */}

                            <div className='wf-dashboard-box-inner'>
                                <div className='Polaris-Box'>
                                    <MediaCard
                                        // title={myLanguage.notificationHeading}
                                        title={myLanguage.overValueB8}
                                        primaryAction={{
                                            content: `${myLanguage.lanuageEditName}`,
                                            onAction: () => { navigate("/GeneralSetting/notificationsetting") },
                                        }}
                                        // description={myLanguage.notificationText}
                                        description={myLanguage.overValue8}
                                        size="small"
                                    >
                                        <img
                                            alt="setting_"
                                            src={NotificationSettingIcon}
                                        />
                                    </MediaCard>
                                </div>
                            </div>


                            {/* <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                            <Text as="h2" variant="headingMd">
                                {myLanguage.shareWishlistHeading}
                            </Text>
                        </Grid.Cell> */}

                            <div className='wf-dashboard-box-inner'>
                                <div className='Polaris-Box'>
                                    <MediaCard
                                        // title={myLanguage.shareWishlistHeading}
                                        title={myLanguage.overValueB12}

                                        primaryAction={{
                                            content: `${myLanguage.lanuageEditName}`,
                                            onAction: () => { navigate("/GeneralSetting/sharewishlistsetting") },
                                        }}
                                        description={myLanguage.overValue12}

                                        size="small"
                                    >
                                        <img
                                            alt="setting_"
                                            src={SharewishlistsettingIcon}
                                        />
                                    </MediaCard>
                                </div>
                            </div>

                            {/* <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                            <Text as="h2" variant="headingMd">
                                {myLanguage.languageSetting}
                            </Text>
                        </Grid.Cell> */}

                            <div className='wf-dashboard-box-inner'>
                                <div className='Polaris-Box'>
                                    <MediaCard
                                        // title={myLanguage.languageSetting}
                                        title={myLanguage.overValueB3}
                                        primaryAction={{
                                            content: `${myLanguage.lanuageEditName}`,
                                            onAction: () => { navigate("/GeneralSetting/languagesetting") },
                                        }}
                                        // description={myLanguage.languageSub}
                                        description={myLanguage.overValue3}
                                        size="small"
                                    >
                                        <img
                                            alt="setting_"
                                            src={LanguageSettingIcon}
                                        />
                                    </MediaCard>
                                </div>
                            </div>
                            {/* <br /> */}


                            {/************** when add to cart item from wishlist then remove/not from wishlist  ****************/}

                            {/* <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                            <Text as="h2" variant="headingMd">
                                {myLanguage.adminremoveAdvanceSetting}
                            </Text>
                        </Grid.Cell> */}
                            <div className='wf-dashboard-box-inner'>
                                <div className='Polaris-Box'>
                                    <MediaCard
                                        title={myLanguage.adminremoveAdvanceSetting}
                                        // title={myLanguage.overValueB2}
                                        primaryAction={{
                                            content: `${myLanguage.lanuageEditName}`,
                                            onAction: () => { navigate("/GeneralSetting/RemoveCartwishlist") },
                                        }}
                                        description={myLanguage.adminremoveCartSetting}
                                        // description={myLanguage.overValue2}
                                        size="small"
                                    >
                                        <img
                                            alt="setting_"
                                            src={AddtocartsettingIcon}
                                        />
                                    </MediaCard>
                                </div>
                            </div>

                            {/* <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                            <Text as="h2" variant="headingMd">
                                {myLanguage.emailSettingHeading}
                            </Text>
                        </Grid.Cell> */}

                            <div className='wf-dashboard-box-inner'>
                                <div className='Polaris-Box'>
                                    <MediaCard
                                        // title={myLanguage.emailSettingHeading}
                                        title={myLanguage.overValueB11}
                                        primaryAction={{
                                            content: `${myLanguage.lanuageEditName}`,
                                            onAction: () => { navigate("/GeneralSetting/emailsetting") },
                                        }}
                                        // description={myLanguage.emailSettingSubText}
                                        description={myLanguage.overValue11}
                                        size="small"
                                    >
                                        <img
                                            alt="setting_"
                                            src={emailremindersIcon}
                                        />
                                    </MediaCard>
                                </div>
                            </div>


                            {/* smtp setting page--------- */}

                            <div className='wf-dashboard-box-inner'>
                                <div className='Polaris-Box'>
                                    <MediaCard
                                        title={myLanguage.smtpHeading}
                                        primaryAction={{
                                            content: `${myLanguage.lanuageEditName}`,
                                            onAction: () => { navigate("/GeneralSetting/emailsmtpsetting") },
                                        }}
                                        description={myLanguage.smtpSubHeading}
                                        size="small"
                                    >
                                        <img
                                            alt="setting_"
                                            src={emailremindersIcon}
                                        />
                                    </MediaCard>
                                </div>
                            </div>

                            {/* smtp setting page---------END */}


                            <div className='wf-dashboard-box-inner'>
                                <div className='Polaris-Box'>
                                    <MediaCard
                                        // title={myLanguage.advanceSettingMainHeading}
                                        title={myLanguage.showHideCardHeading}
                                        primaryAction={{
                                            content: `${myLanguage.lanuageEditName}`,
                                            onAction: () => { navigate("/GeneralSetting/showhidebuttons") },
                                        }}
                                        // description={myLanguage.advanceSettingMainText}
                                        description={myLanguage.showHideCardDes}
                                        size="small"
                                    >
                                        <img
                                            alt="setting_"
                                            src={viewSetting}
                                        />
                                    </MediaCard>
                                </div>
                            </div>

                            <div className='wf-dashboard-box-inner'>
                                <div className='Polaris-Box'>
                                    <MediaCard
                                        title={myLanguage.isLoginHeading}
                                        primaryAction={{
                                            content: `${myLanguage.lanuageEditName}`,
                                            onAction: () => { navigate("/GeneralSetting/userlogin") },
                                        }}
                                        description={myLanguage.isLoginSubHeading}
                                        size="small"
                                    >
                                        <img
                                            alt="setting_"
                                            src={AuthImg}
                                        />
                                    </MediaCard>
                                </div>
                            </div>




                            <div className='wf-dashboard-box-inner'>
                                <div className='Polaris-Box'>
                                    <MediaCard
                                        title={myLanguage.overValueAB16}
                                        primaryAction={{
                                            content: `${myLanguage.lanuageEditName}`,
                                            onAction: () => { navigate("/GeneralSetting/klaviyoIntegration") },
                                        }}
                                        description={myLanguage.overValue16}
                                        size="small"
                                    >
                                        <img
                                            alt="setting_"
                                            src={klaviyo}
                                        />
                                    </MediaCard>
                                </div>
                            </div>


                            <div className='wf-dashboard-box-inner'>
                                <div className='Polaris-Box'>
                                    <MediaCard
                                        title={myLanguage.trendingHeading}
                                        primaryAction={{
                                            content: `${myLanguage.lanuageEditName}`,
                                            onAction: () => { navigate("/GeneralSetting/trendingwidget") },
                                        }}
                                        description={myLanguage.trendingSubHeading}
                                        size="small"
                                    >
                                        <img
                                            alt="trending_"
                                            src={TrendingIcon}
                                        />
                                    </MediaCard>
                                </div>
                            </div>


                            <div className='wf-dashboard-box-inner'>
                                <div className='Polaris-Box'>
                                    <MediaCard
                                        // title={myLanguage.advanceSettingMainHeading}
                                        title={myLanguage.overValueB10}
                                        primaryAction={{
                                            content: `${myLanguage.lanuageEditName}`,
                                            onAction: () => { navigate("/GeneralSetting/advancesetting") },
                                        }}
                                        // description={myLanguage.advanceSettingMainText}
                                        description={myLanguage.overValue10}
                                        size="small"
                                    >
                                        <img
                                            alt="setting_"
                                            src={CustomcssIcon}
                                        />
                                    </MediaCard>
                                </div>
                            </div>













                            <div className='wf-dashboard-box-inner'>
                                <div className='Polaris-Box'>
                                    <MediaCard
                                        title={myLanguage.cciHeading}
                                        // title={myLanguage.overValueB10}
                                        primaryAction={{
                                            content: `${myLanguage.lanuageEditName}`,
                                            onAction: () => { navigate("/GeneralSetting/customCodeIntegration") },
                                        }}
                                        description={myLanguage.cciSubHeading}
                                        // description={myLanguage.overValue10}
                                        size="small"
                                    >
                                        <img
                                            alt="setting_"
                                            src={CustomcssIcon}
                                        />
                                    </MediaCard>
                                </div>
                            </div>











                        </div>

                        <div style={{ marginTop: "40px" }}>
                            <Footer myLanguage={myLanguage} />
                        </div>

                    </Page>
                </div>
            }
        </Frame >
    )
}

export default GeneralSetting;

