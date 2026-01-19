
import React, { useEffect, useState, Suspense, lazy } from 'react';
// import { NavigationMenu } from "@shopify/app-bridge-react";
import useUtilityFunction from '../hooks/useUtilityFunction';
import useAppMetafield from '../hooks/useAppMetafield';
// import { Route, Router, Routes } from 'react-router-dom';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import english from '../assets/Languages/english';
import { useLocation } from 'react-router-dom';
import { NavMenu } from "@shopify/app-bridge-react";
import { Link } from 'react-router-dom';

const MyRoutes = () => {
    const appMetafield = useAppMetafield();
    const location = useLocation();
    const [myLanguage, setMyLanguage] = useState(english);
    const utilityFunction = useUtilityFunction();
    const [showSideBar, setShowSideBar] = useState(0);
    const [setUpGuide, setSetupGuide] = useState();

    // const Dashboard = lazy(() => import(/* webpackPrefetch: true */ './Dashboard'));
    // const Analytic = lazy(() => import(/* webpackPrefetch: true */ './Analytic'));
    // const ButtonSetting = lazy(() => import(/* webpackPrefetch: true */ './ButtonSetting'));
    // const GeneralSetting = lazy(() => import(/* webpackPrefetch: true */ './GeneralSetting'));
    // const CollectionSetting = lazy(() => import(/* webpackPrefetch: true */ './CollectionSetting'));
    // const AnalyticReport = lazy(() => import(/* webpackPrefetch: true */ './Analytic'));
    // const EmailReport = lazy(() => import(/* webpackPrefetch: true */ './EmailReports'));
    // const PricePlan = lazy(() => import(/* webpackPrefetch: true */ './PricingPlan'));
    // const RequestModal = lazy(() => import(/* webpackPrefetch: true */ './RequestFormModal'));
    // const HomePage = lazy(() => import(/* webpackPrefetch: true */ './index'));

    // let allRoutes = [
    //     // {
    //     //     label: myLanguage?.defaultPageMainHeading || "Dashboard Page",
    //     //     destination: "/Dashboard",
    //     //     // component: Dashboard
    //     // },
    //     {
    //         label: myLanguage?.analyticPage || "Analytic Page",
    //         destination: "/Analytic",
    //         // component: Analytic
    //     },
    //     {
    //         label: myLanguage?.buttonSetting || "Button Settings",
    //         destination: "/ButtonSetting",
    //         // component: ButtonSetting
    //     },
    //     {
    //         label: myLanguage?.generalSetting || "General Settings",
    //         destination: "/GeneralSetting",
    //         // component: GeneralSetting
    //     },
    //     {
    //         label: myLanguage?.collectionSetting || "Collection Settings",
    //         destination: "/CollectionSetting",
    //         // component: CollectionSetting
    //     },
    //     {
    //         label: myLanguage?.reportPage || "Reports",
    //         destination: "/Analytic/UserReport",
    //         // component: AnalyticReport
    //     },
    //     {
    //         label: myLanguage?.emailReportsPage || "Email Report",
    //         destination: "/EmailReports",
    //         // component: EmailReport
    //     },
    //     {
    //         label: myLanguage?.shareStats || "Share Wishlist Stats",
    //         destination: "/ShareStats",
    //         // component: ShareStats
    //     },
    //     {
    //         label: myLanguage?.paidPlans || "Change Plan",
    //         destination: "/PricingPlan",
    //         // component: PricePlan
    //     },
    //     {
    //         label: myLanguage?.getSupport || "Get Support",
    //         destination: "/RequestFormModal",
    //         // component: RequestModal
    //     }
    // ];

    const AllRoutes = () => {
        return (
            <>
                <Link to="/" rel="home" />
                <Link to="/Analytic">{myLanguage?.analyticPage}</Link>
                <Link to="/ButtonSetting">{myLanguage?.buttonSetting}</Link>
                <Link to="/GeneralSetting">{myLanguage?.generalSetting}</Link>
                <Link to="/CollectionSetting">{myLanguage?.collectionSetting}</Link>
                <Link to="/Analytic/UserReport">{myLanguage?.reportPage}</Link>
                <Link to="/EmailReports">{myLanguage?.emailReportsPage}</Link>
                <Link to="/ShareStats">{myLanguage?.shareStats}</Link>
                <Link to="/PricingPlan">{myLanguage?.paidPlans}</Link>
                <Link to="/RequestFormModal">{myLanguage?.getSupport}</Link>
            </>
        )
    }

    const SelectedRoutes = () => {
        return <Link to="/RequestFormModal">{myLanguage?.getSupport}</Link>
    }

    // let selectedRoutes = [
    //     {
    //         label: myLanguage?.getSupport || "Get Support",
    //         destination: "/RequestFormModal",
    //         // component: RequestModal
    //     }
    // ];

    let noRoutes = [];

    useEffect(() => {
        let host = new URLSearchParams(location.search).get("host");
        if (host) {
            sessionStorage.setItem("shopify_host", host);
        } else {
            host = sessionStorage.getItem("shopify_host");
        }

        let isMounted = true;

        utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
            getAllAppDataMetafields();
        });

        return () => {
            isMounted = false;
        };
    }, [location.pathname === "/"]);


    async function getAllAppDataMetafields() {
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "current-plan") {
                let dData = JSON.parse(dataArray[i].node.value);
                setShowSideBar(dData);
            };
            if (dataArray[i].node.key === "installation-setup-guide") {
                let dData = dataArray[i].node.value;
                setSetupGuide(dData);
            };

            if (dataArray[i].node.key === "language-setting") {
                let dData = JSON.parse(dataArray[i].node.value);
                const iframeDiv = document.getElementById(`wg-app`);
                if (dData.languageSetting === "arabic" && iframeDiv) {
                    iframeDiv.setAttribute("dir", "rtl");
                }
            }
        }
    }

    return (
        <div className='wishlist-guru-app'>
            {/* {Object.keys(myLanguage).length !== 0 &&
                <> */}
            {/* 
            <NavigationMenu navigationLinks={
                showSideBar === -999 ? selectedRoutes : showSideBar === 0 ? selectedRoutes : setUpGuide === null ? allRoutes : setUpGuide === "no" ? selectedRoutes : allRoutes
            } /> */}


            <NavMenu>
                {
                    showSideBar === -999 ?
                        <SelectedRoutes /> :
                        showSideBar === 0 ?
                            <SelectedRoutes /> :
                            setUpGuide === null ?
                                <AllRoutes /> :
                                setUpGuide === "no" ?
                                    <SelectedRoutes /> : <AllRoutes />
                }
            </NavMenu>




            {/* <Suspense fallback={<div>Loading...</div>}>
                        <Routes>
                            <Route path='/' element={<HomePage />} />
                            {allRoutes.map((route, index) => (
                                <Route
                                    key={index}
                                    path={route.destination}
                                    element={<route.component />}
                                />
                            ))}
                        </Routes>
                    </Suspense> */}


            {/* </>
            } */}

        </div >
    )
}

export default MyRoutes
