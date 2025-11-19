import React, { useEffect, useRef, useState, useCallback } from 'react';
import useAppMetafield from '../../hooks/useAppMetafield';
import useUtilityFunction from '../../hooks/useUtilityFunction';
import { useForm } from 'react-hook-form';
import SkeletonPage1 from '../SkeletonPage1';
import { Checkbox, Frame, Toast, Page, RadioButton, Text, TextField } from '@shopify/polaris';
import SaveBar from '../SaveBar';
import Swal from 'sweetalert2';
import loaderGif from "../loaderGreen.gif";
import SingleFieldController from '../../hooks/useSingleFieldController';
import Footer from '../Footer';
import RangeOnly from '../../hooks/useRangeOnly';
import collectionCopyIcon from '../../assets/copy-icon.svg';

const TrendingWidget = () => {
    const { handleSubmit, control, reset, watch, formState: { errors } } = useForm();
    const appMetafield = useAppMetafield();
    const [saveBar, setSaveBar] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const utilityFunction = useUtilityFunction();
    const [currentPlan, setCurrentPlan] = useState(0);
    const existingData = useRef([]);
    const [myLanguage, setMyLanguage] = useState({});
    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const toastMarkup = active ? (
        <Toast content="Copied" onDismiss={toggleActive} />
    ) : null;
    const trendingWidgetCode = `<div id="wf-custom-trending-widget"></div>`;
    const watchAllFields = watch()

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

                if (!dData.trendingLayout) {
                    const defaultData = {
                        trendingLayout: "grid",
                        whichProducts: "top products",
                        autoRotaionOrNot: true,
                        navigationArrows: false,
                        navigationDots: true,
                        desktopProducts: 4,
                        mobileProducts: 2
                    };

                    reset(defaultData);

                    const mergedData = {
                        ...existingData.current,
                        ...defaultData
                    };

                    await createMetaFxn(mergedData);
                } else {
                    reset({
                        trendingLayout: dData.trendingLayout,
                        whichProducts: dData.whichProducts,
                        autoRotaionOrNot: dData.autoRotaionOrNot,
                        navigationArrows: dData.navigationArrows,
                        navigationDots: dData.navigationDots,
                        desktopProducts: dData.desktopProducts,
                        mobileProducts: dData.mobileProducts
                    });
                }
                setIsLoading(true);
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

        mergedData.trendingLayout = data.trendingLayout
        mergedData.whichProducts = data.whichProducts
        mergedData.autoRotaionOrNot = data.autoRotaionOrNot
        mergedData.navigationArrows = data.navigationArrows
        mergedData.navigationDots = data.navigationDots
        mergedData.desktopProducts = data.desktopProducts
        mergedData.mobileProducts = data.mobileProducts

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

    const textCopyHandler = (data) => {
        navigator.clipboard.writeText(data);
        toggleActive();
    };

    return (
        <div className='wf-dashboard wf-trending-page'>
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    <form onSubmit={handleSubmit(saveToMetafield)}>
                        {(saveBar) ? <SaveBar save={myLanguage.save} /> : ""}
                        <Page fullWidth
                            title={myLanguage.trendingHeading}
                            subtitle={myLanguage.trendingSubHeading}
                            backAction={{ onAction: () => history.back() }}
                        >
                            {/* Trendin Widget */}
                            <div className=' wf-dashboard-plane'>
                                <div className='note-div '>
                                    <span>{myLanguage.noteHeading} </span>
                                    <Text variant="headingXs" as="h2">
                                        {myLanguage.trendingNoteText}
                                    </Text>
                                </div>
                            </div>

                            <div className='wf-style-wishbtn'>
                                <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"}`} >
                                    <div className='pb-15'>
                                        <Text variant="headingMd" as="h2">{myLanguage.selectProductsHeading}</Text>
                                        <p>{myLanguage.selectProductsSubHeading}</p>
                                    </div>

                                    <div className='wishlistUi-TyleInner-3'>
                                        <SingleFieldController
                                            name="whichProducts"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.topProducts}
                                                    value={field.value}
                                                    id="top_produtcs"
                                                    checked={field.value === "top products" && true}
                                                    onChange={() => {
                                                        field.onChange("top products"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="whichProducts"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.recentlyProducts}
                                                    value={field.value}
                                                    id="recently_products"
                                                    checked={field.value === "recently products" && true}
                                                    onChange={() => {
                                                        field.onChange("recently products"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="whichProducts"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.randomProducts}
                                                    value={field.value}
                                                    id="random_produtcs"
                                                    checked={field.value === "random products" && true}
                                                    onChange={() => {
                                                        field.onChange("random products"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>
                                    </div>
                                </div>
                            </div>

                            <div className='wf-style-wishbtn'>
                                <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"}`} >
                                    <div className='pb-15'>
                                        <Text variant="headingMd" as="h2">{myLanguage.layoutView}</Text>
                                        <p>{myLanguage.layoutViewPara}</p>
                                    </div>

                                    <div className='wishlistUi-TyleInner'>
                                        <SingleFieldController
                                            name="trendingLayout"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.gridView}
                                                    value={field.value}
                                                    id="grid_view"
                                                    checked={field.value === "grid" && true}
                                                    onChange={() => {
                                                        field.onChange("grid"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <SingleFieldController
                                            name="trendingLayout"
                                            control={control}>
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.sliderView}
                                                    value={field.value}
                                                    id="slider_view"
                                                    checked={field.value === "slider" && true}
                                                    onChange={() => {
                                                        field.onChange("slider"),
                                                            setSaveBar(true);
                                                    }}
                                                />
                                            }
                                        </SingleFieldController>


                                        <div className={`${watchAllFields.trendingLayout === "grid" ? 'disableOneByOne' : "wg-no-disable"}`}>
                                            <SingleFieldController
                                                name="autoRotaionOrNot"
                                                control={control}
                                            >
                                                {({ field }) =>
                                                    <Checkbox
                                                        label={myLanguage.autoRotationText}
                                                        value={"yes"}
                                                        id="auto_rotaion"
                                                        checked={field.value}
                                                        onChange={(checked) => {
                                                            field.onChange(checked),
                                                                setSaveBar(true);
                                                        }}
                                                    />
                                                }
                                            </SingleFieldController>
                                        </div>

                                        <div className={`${watchAllFields.trendingLayout === "grid" ? 'disableOneByOne' : "wg-no-disable"}`}>
                                            <SingleFieldController
                                                name="navigationArrows"
                                                control={control}
                                            >
                                                {({ field }) =>
                                                    <Checkbox
                                                        label={myLanguage.navigationArrowsText}
                                                        value={"yes"}
                                                        id="navigation"
                                                        checked={field.value}
                                                        onChange={(checked) => {
                                                            field.onChange(checked),
                                                                setSaveBar(true);
                                                        }}
                                                    />
                                                }
                                            </SingleFieldController>
                                        </div>

                                        <div className={`${watchAllFields.trendingLayout === "grid" ? 'disableOneByOne wg-disable-dots' : "wg-no-disable wg-no-disable-dots"}`}>
                                            <div className='wg-navigation-dots'>
                                                <SingleFieldController
                                                    name="navigationDots"
                                                    control={control}
                                                >
                                                    {({ field }) =>
                                                        <Checkbox
                                                            label={myLanguage.navigationDotsText}
                                                            value={"yes"}
                                                            id="dots"
                                                            checked={field.value}
                                                            onChange={(checked) => {
                                                                field.onChange(checked),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>
                                            </div>
                                        </div>
                                        <RangeOnly control={control} controllerName={`desktopProducts`} label={myLanguage.desktopProducts} max={4} setSaveBar={setSaveBar} />

                                        <RangeOnly control={control} controllerName={`mobileProducts`} label={myLanguage.mobileProducts} max={2} setSaveBar={setSaveBar} />
                                    </div>
                                </div>
                            </div>

                            <div className='wf-style-wishbtn'>
                                <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"}`} >

                                    <div className='pb-15'>
                                        <Text variant="headingMd" as="h2">{myLanguage.trendingShortCodeHeading}</Text>
                                        <p>{myLanguage.trendingShortCodeSubHeading}</p>
                                    </div>

                                    <div className="wf-IconBtn-box">
                                        <TextField value={trendingWidgetCode} />
                                        <div className="copyIcon" onClick={() => textCopyHandler(trendingWidgetCode)}>
                                            <img src={collectionCopyIcon} alt="Collect Copy Icon" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {toastMarkup}

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


export default TrendingWidget;