import React from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import Swal from 'sweetalert2';
import useSubscriptionUrl from './useSubscriptionUrl';
import { Constants } from '../../backend/constants/constant.js';

import useApi from './useApi';
const useAppMetafield = () => {
    // const fetch = useAuthenticatedFetch();
    const subscription = useSubscriptionUrl();
    const { serverURL } = Constants;
    const ShopApi = useApi();


    // const getCurrentPlan = async () => {
    //     try {
    //         const shopApi = await ShopApi.shop();
    //         const response = await fetch(`/api/subscription/planstatus`);
    //         const result = await response.json();
    //         let newArr = result.data;
    //         const plan = await subscription.subscriptionArr(newArr);

    //         //changed
    //         const planName = plan.planName.split('/')[0]
    //         const PlanId = await getPlanData(planName)
    //         let finalId = PlanId.toString()
    //         await savePlanInSql(finalId, shopApi, planName)
    //         //end changed
    //         await savePlanInSql(finalId, shopApi, plan.planName)
    //         return { id: plan.planId, currentPlan: finalId }
    //     } catch (error) {
    //         console.error("Error:", error);
    //     }
    // };

    const getCurrentPlan = async () => {
        try {
            const shopApi = await ShopApi.shop();
            const response = await fetch(`/api/subscription/planstatus`);
            const result = await response.json();
            let newArr = result.data;
            const plan = await subscription.subscriptionArr(newArr);
            const planName = plan.planName.split('/')[0];

            const promoCode = plan.planName.split('/')[2];
            const paymentType = plan.planName.split('/')[3];

            const PlanId = await getPlanData(planName);
            let finalId = PlanId.toString();
            let myCurrentPlan;

            const dataArray = await getAllAppMetafields();
            for (let i = 0; i < dataArray.length; i++) {
                if (dataArray[i].node.key === "current-plan") {
                    let dData = JSON.parse(dataArray[i].node.value);
                    // console.log("dDatadData", dData)
                    myCurrentPlan = dData
                }
            }

            // console.log("KOKOKOKO --- ", plan)
            //changed
            if (myCurrentPlan === -999) {
                await savePlanInSql("-999", shopApi, "No plan", null, "live")
            } else {
                await savePlanInSql(finalId, shopApi, plan.planName, promoCode, paymentType)
            }
            //end changed

            // console.log("plan.planId  -- ", plan.planId)
            // console.log("finalId  -- ", finalId)

            return { id: plan.planId, currentPlan: finalId }
        } catch (error) {
            console.error("Error:", error);
        }
    };


    const getAppMetafieldId = async () => {
        try {
            const response = await fetch("/api/app-metafield/get-id");
            const result = await response.json();
            const myId = result.data.data.currentAppInstallation.id;
            return myId;
        } catch (error) {
            console.error("Error:", error);
        }
    };


    const createAppMetafield = async (data) => {
        try {
            const response = await fetch("/api/app-metafield/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            return result
            // Swal.fire({
            //     icon: "success",
            //     title: "Successfully Updated",
            //     text: "Your custom setting updated successfully on your site"
            // });
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const autoCreateAppMetafield = async (data) => {
        try {
            const response = await fetch("/api/app-metafield/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            // const result = await response.json();

        } catch (error) {
            console.error("Error:", error);
        }
    };


    const getAllAppMetafields = async () => {
        try {
            const response = await fetch(`/api/app-metafield/get-all?limit=${15}`);
            const result = await response.json();
            let allData = result.data.data.app.installation.metafields.edges;
            return allData;
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const getPlanData = async (planName) => {
        try {
            const response = await fetch(`${serverURL}/api/PlanId`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentplanName: planName
                }),
            });
            const result = await response.json();
            return result.currentPlanData[0].plan_id

        } catch (err) {
            console.log("err")
        }
    }


    async function savePlanInSql(currentPlan, shop, planName, promoCode, paymentType) {
        try {
            const userDatas = await fetch(`${serverURL}/app-installation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shop.shopName,
                    phoneNumber: shop.customerPhone,
                    shopEmail: shop.email,
                    shopOwner: shop.shopOwner,
                    country: shop.country,
                    currentPlanId: currentPlan,
                    currentPlanName: planName,
                    domain: shop.domain,
                    storeName: shop.storeName,
                    customerEmail: shop.customerEmail,
                    shopifyPlan: shop.shopifyPlan,
                    promoCode: promoCode,
                    paymentType: paymentType

                }),
            })
            let results = await userDatas.json();

        } catch (error) {
            console.log("errr ", error)
        }
    };



    return {
        getCurrentPlan: getCurrentPlan,
        getAppMetafieldId: getAppMetafieldId,
        createAppMetafield: createAppMetafield,
        getAllAppMetafields: getAllAppMetafields,
        autoCreateAppMetafield: autoCreateAppMetafield

    }
}

export default useAppMetafield;