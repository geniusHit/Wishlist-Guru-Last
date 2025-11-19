import React from 'react'
import { Redirect } from '@shopify/app-bridge/actions';

const useSubscriptionUrl = (url) => {

    const subscriptionArr = async (array) => {

        let planName = null
        let planId = null
        const activePlan = array.find((val) => val.status === "active");
        if (activePlan) {
            planName = activePlan.name;
            planId = activePlan.id;
        } else {
            planName = "Free";
            planId = 1;
        }
        return { planName, planId };
    }

    // const subscriptionArr = async (array) => {
    //     let planName = null
    //     let planId = null
    //     if (array.length === 0) {
    //         planName = "Free";
    //         planId = 1;
    //     } else {
    //         const activePlan = array.find((val) => val.status === "active");
    //         if (activePlan) {
    //             planName = activePlan.name;
    //             planId = activePlan.id;
    //         } else {
    //             planName = "Free";
    //             planId = 1;
    //         }
    //     }
    //     return { planName, planId };
    // }

    // const config = {
    //     apiKey: process.env.SHOPIFY_API_KEY,
    //     host: new URLSearchParams(location.search).get("host"),
    //     forceRedirect: true
    // };

    // const redirect = Redirect.create(app);
    const ReloadPage = () => {
        window.top.location.href = url;
    }
    return {
        ReloadPage: ReloadPage,
        subscriptionArr: subscriptionArr
    }
}

export default useSubscriptionUrl