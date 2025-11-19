import React, { useEffect, useRef, useState } from 'react';
import useAppMetafield from '../../hooks/useAppMetafield';
import SkeletonPage1 from '../SkeletonPage1';
import { Frame, Page, Text, RadioButton } from '@shopify/polaris';
import SaveBar from '../SaveBar';
import useUtilityFunction from '../../hooks/useUtilityFunction';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import loaderGif from "../loaderGreen.gif";
import SingleFieldController from '../../hooks/useSingleFieldController';
import Footer from '../Footer';

const RemoveCartwishlist = () => {
    const { handleSubmit, watch, control, reset, formState: { errors } } = useForm();
    const appMetafield = useAppMetafield();
    const [saveBar, setSaveBar] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const utilityFunction = useUtilityFunction();
    const existingData = useRef([]);
    const watchAllFields = watch();
    const [myLanguage, setMyLanguage] = useState({});
    const [currentPlan, setCurrentPlan] = useState(0);

    useEffect(() => {
        useEffectLite();
    }, []);

    async function useEffectLite() {
        const getCurrentPlan = await appMetafield.getCurrentPlan();
        setCurrentPlan(parseInt(getCurrentPlan.currentPlan));
        await utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
        });
        getAllAppDataMetafields();
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
                reset({
                    wishlistRemoveData: dData.wishlistRemoveData
                })
            }
        }
    }


    const saveToMetafield = async (data) => {
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });

        let mergedData = { ...existingData.current };

        mergedData.wishlistRemoveData = data.wishlistRemoveData;

        const getAppMetafieldId = await appMetafield.getAppMetafieldId();
        const appMetadata = {
            key: "general-setting",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: JSON.stringify(mergedData)
        };
        await appMetafield.createAppMetafield(appMetadata).then((res) => {
            Swal.fire({
                icon: "success",
                title: myLanguage.swalHeading,
                text: myLanguage.swalText,
                confirmButtonText: myLanguage.swalOk
            });
        });
        setSaveBar(false);
    };


    return (
        <div className='wf-dashboard wf-addCartButton'>
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    <form onSubmit={handleSubmit(saveToMetafield)}>
                        {(saveBar) ? <SaveBar save={myLanguage.save} /> : ""}
                        <Page fullWidth
                            title={myLanguage.adminlanguageSub}
                            subtitle={myLanguage.adminlanguageSubText}
                            backAction={{ onAction: () => history.back() }}
                        >
                            <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                <div className='wf-style-wishbtn'>
                                    <div className='wf-showCount-box'>
                                        <div className='pb-15'>
                                            <Text variant="headingMd" as="h2">
                                                {myLanguage.adminremoveAdvanceSetting}
                                            </Text>
                                            <p>{myLanguage.adminremoveCartSetting}</p>
                                        </div>

                                        {currentPlan >= 2 &&
                                            <div className='wf-dashboard-yes-no-toggle'>
                                                <div className='toggle-paid-inner'>
                                                    <label id='cart_yes' className={`${watchAllFields.wishlistRemoveData === "yes" ? "activeToggle" : ""}`}>
                                                        {myLanguage.styleHoverYes}
                                                        <SingleFieldController
                                                            name="wishlistRemoveData"
                                                            control={control}>
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

                                                    <label id='cart_no' className={`${watchAllFields.wishlistRemoveData === "no" ? "activeToggle" : ""}`}>
                                                        {myLanguage.styleHoverNo}
                                                        <SingleFieldController
                                                            name="wishlistRemoveData"
                                                            control={control}>
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
                                            </div>
                                        }
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
        </div >
    )
}


export default RemoveCartwishlist;