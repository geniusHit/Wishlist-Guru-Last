import React, { useEffect, useRef, useState } from 'react';
import useAppMetafield from '../../hooks/useAppMetafield';
import useUtilityFunction from '../../hooks/useUtilityFunction';
import { useForm } from 'react-hook-form';
import SkeletonPage1 from '../SkeletonPage1';
import { Frame, Page, AlphaCard, RadioButton, Text } from '@shopify/polaris';
import SaveBar from '../SaveBar';
import Swal from 'sweetalert2';
import loaderGif from "../loaderGreen.gif";
import SingleFieldController from '../../hooks/useSingleFieldController';
import Footer from '../Footer';


const WishlistUiSetting = () => {
    const { handleSubmit, control, reset, formState: { errors } } = useForm();
    const appMetafield = useAppMetafield();
    const [saveBar, setSaveBar] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const utilityFunction = useUtilityFunction();
    const [currentPlan, setCurrentPlan] = useState(0);
    const existingData = useRef([]);
    const [myLanguage, setMyLanguage] = useState({});

    useEffect(() => {
        useEffectLite();
    }, []);

    async function useEffectLite() {
        const getCurrentPlan = await appMetafield.getCurrentPlan();
        setCurrentPlan(parseInt(getCurrentPlan.currentPlan));
        await utilityFunction.getPlanFirst();
        await utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
        });
        getAllAppDataMetafields();
    }

    async function getAllAppDataMetafields() {
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "general-setting") {
                utilityFunction.goToSectionFxn();
                let checkElement = document.querySelector(".dontRunAgain");
                if (checkElement === null) {
                    utilityFunction.upgradeButtonFxn();
                }
                let dData = JSON.parse(dataArray[i].node.value);
                existingData.current = dData;


                if (!dData.showPrice) {
                    const datatoReset = {
                        showPrice: "both users",
                        showQuantity: "both users",
                        showMoveToCart: "both users",
                        showVendors: "no one",
                    }
                    reset({
                        showPrice: datatoReset.showPrice,
                        showQuantity: datatoReset.showQuantity,
                        showMoveToCart: datatoReset.showMoveToCart,
                        showVendors: datatoReset.showVendors,
                    })

                    let mergedData = { ...existingData.current };

                    mergedData.showPrice = datatoReset.showPrice
                    mergedData.showQuantity = datatoReset.showQuantity
                    mergedData.showMoveToCart = datatoReset.showMoveToCart
                    mergedData.showVendors = datatoReset.showVendors

                    await createMetaFxn(mergedData)
                    setIsLoading(true);
                } else {
                    reset({
                        showPrice: dData.showPrice,
                        showQuantity: dData.showQuantity,
                        showMoveToCart: dData.showMoveToCart,
                        showVendors: dData?.showVendors || "no one",
                    })
                    setIsLoading(true);
                }
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

        mergedData.showPrice = data.showPrice
        mergedData.showQuantity = data.showQuantity
        mergedData.showMoveToCart = data.showMoveToCart
        mergedData.showVendors = data.showVendors

        await createMetaFxn(mergedData).then((res) => {
            Swal.fire({
                icon: "success",
                title: myLanguage.swalHeading,
                text: myLanguage.swalText,
                confirmButtonText: myLanguage.swalOk
            });
        });
        setSaveBar(false);
    };

    async function createMetaFxn(mergedData) {
        const getAppMetafieldId = await appMetafield.getAppMetafieldId();

        const appMetadata = {
            key: "general-setting",
            namespace: "wishlist-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: JSON.stringify(mergedData)
        };

        await appMetafield.createAppMetafield(appMetadata)
    }

    return (
        <div className='wf-dashboard wf-dashboard-buttonSetting wf-ui-settings'>
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    <form onSubmit={handleSubmit(saveToMetafield)}>
                        {(saveBar) ? <SaveBar save={myLanguage.save} /> : ""}
                        <Page fullWidth
                            title={myLanguage.showHidePageHeading}
                            subtitle={myLanguage.showHidePageSubHeading}
                            backAction={{ onAction: () => history.back() }}
                        >
                            {/* price */}
                            <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                <div className={`${currentPlan >= 3 ? "" : "disableEverything under-pro"}`} >
                                    <div className='custom-margin'>
                                        <Text variant="headingMd" as="h2">{myLanguage.showPriceHeading}</Text>
                                        <p>{myLanguage.showPriceSubHeading}</p>
                                    </div>
                                    <div className='wishlistUi-TyleInner'>
                                        <SingleFieldController
                                            name="showPrice"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.priceShowAlways}
                                                    value={field.value}
                                                    id="price_both_users"
                                                    checked={field.value === "both users" && true}
                                                    onChange={() => {
                                                        field.onChange("both users"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="showPrice"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.priceHideAlways}
                                                    value={field.value}
                                                    id="price_no_one"
                                                    checked={field.value === "no one" && true}
                                                    onChange={() => {
                                                        field.onChange("no one"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="showPrice"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.priceShowOnlyLogin}
                                                    value={field.value}
                                                    id="price_login_users"
                                                    checked={field.value === "login users" && true}
                                                    onChange={() => {
                                                        field.onChange("login users"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>
                                    </div>
                                </div>
                            </div>

                            {/* QUANTITY */}
                            <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                <div className={`${currentPlan >= 3 ? "" : "disableEverything under-pro"}`} >
                                    <div className='custom-margin'>
                                        <Text variant="headingMd" as="h2">{myLanguage.showQtyHeading}</Text>
                                        <p>{myLanguage.showQtySubHeading}</p>
                                    </div>
                                    <div className='wishlistUi-TyleInner'>
                                        <SingleFieldController
                                            name="showQuantity"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.qtyShowAlways}
                                                    value={field.value}
                                                    id="qty_both_users"
                                                    checked={field.value === "both users" && true}
                                                    onChange={() => {
                                                        field.onChange("both users"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="showQuantity"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.qtyHideAlways}
                                                    value={field.value}
                                                    id="qty_no_one"
                                                    checked={field.value === "no one" && true}
                                                    onChange={() => {
                                                        field.onChange("no one"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="showQuantity"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.qtyShowOnlyLogin}
                                                    value={field.value}
                                                    id="qty_login_users"
                                                    checked={field.value === "login users" && true}
                                                    onChange={() => {
                                                        field.onChange("login users"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>
                                    </div>
                                </div>
                            </div>

                            {/* MOVE TO CART */}
                            <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                <div className={`${currentPlan >= 3 ? "" : "disableEverything under-pro"}`} >
                                    <div className='custom-margin'>
                                        <Text variant="headingMd" as="h2">{myLanguage.showMoveHeading}</Text>
                                        <p>{myLanguage.showMoveSubHeading}</p>
                                    </div>
                                    <div className='wishlistUi-TyleInner'>
                                        <SingleFieldController
                                            name="showMoveToCart"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.moveShowAlways}
                                                    value={field.value}
                                                    id="move_both_users"
                                                    checked={field.value === "both users" && true}
                                                    onChange={() => {
                                                        field.onChange("both users"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="showMoveToCart"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.moveHideAlways}
                                                    value={field.value}
                                                    id="move_no_one"
                                                    checked={field.value === "no one" && true}
                                                    onChange={() => {
                                                        field.onChange("no one"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="showMoveToCart"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.moveShowOnlyLogin}
                                                    value={field.value}
                                                    id="move_login_users"
                                                    checked={field.value === "login users" && true}
                                                    onChange={() => {
                                                        field.onChange("login users"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>
                                    </div>
                                </div>
                            </div>




                            {/* ------ VENDORS ------  */}
                            <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                <div className={`${currentPlan >= 3 ? "" : "disableEverything under-pro"}`} >
                                    <div className='custom-margin'>
                                        <Text variant="headingMd" as="h2">Manage vendor rule for wishlist modal/page/drawer</Text>
                                        <p>You can choose your preffered rule to show vendor on wishlist modal/page/drawer</p>
                                    </div>
                                    <div className='wishlistUi-TyleInner'>
                                        <SingleFieldController
                                            name="showVendors"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={"Show vendor to everyone"}
                                                    value={field.value}
                                                    id="vendor_both_users"
                                                    checked={field.value === "both users" && true}
                                                    onChange={() => {
                                                        field.onChange("both users"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="showVendors"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={"Hide vendor from everyone"}
                                                    value={field.value}
                                                    id="vendor_no_one"
                                                    checked={field.value === "no one" && true}
                                                    onChange={() => {
                                                        field.onChange("no one"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="showVendors"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={"Show vendor to login users only"}
                                                    value={field.value}
                                                    id="vendor_login_users"
                                                    checked={field.value === "login users" && true}
                                                    onChange={() => {
                                                        field.onChange("login users"),
                                                            setSaveBar(true);
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
        </div >
    )
}


export default WishlistUiSetting;