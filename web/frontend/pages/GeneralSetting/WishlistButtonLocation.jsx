import React, { useEffect, useRef, useState, useMemo } from 'react';
import useAppMetafield from '../../hooks/useAppMetafield';
import SkeletonPage1 from '../SkeletonPage1';
import { Checkbox, Collapsible, Frame, Page, Select, Text, RadioButton } from '@shopify/polaris';
import SaveBar from '../SaveBar';
import useUtilityFunction from '../../hooks/useUtilityFunction';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import loaderGif from "../loaderGreen.gif";
import CssFilterConverter from "css-filter-converter";
import SingleFieldController from '../../hooks/useSingleFieldController';
import ColorPickerController from '../../hooks/useColorPickerController';
import RangeController from '../../hooks/useRangeController';
import Footer from '../Footer';
import heartEmpty from '../../assets/heart_empty_.svg';
import heartFill from '../../assets/heart_fill_.svg';
import saveEmpty from '../../assets/saveBlank.svg';
import saveFill from '../../assets/saveBlack.svg';
import starEmpty from '../../assets/starBlank.svg';
import starFill from '../../assets/starBlack.svg';



const WishlistButtonLocation = () => {
    const { handleSubmit, watch, control, reset, formState: { errors } } = useForm();
    const appMetafield = useAppMetafield();
    const [saveBar, setSaveBar] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const utilityFunction = useUtilityFunction();
    const existingData = useRef([]);
    const watchAllFields = watch();
    let floatingHeartIconcolor;
    const [myLanguage, setMyLanguage] = useState({});
    const [currentPlan, setCurrentPlan] = useState(0);
    const [getIconType, setGetIconType] = useState("");
    const options = [
        { value: "floating-heart-bottom-right", label: myLanguage.iconLocationValue3Sub1 },
        { value: "floating-heart-mid-left", label: myLanguage.iconLocationValue3Sub2 },
        { value: "floating-heart-mid-right", label: myLanguage.iconLocationValue3Sub3 },
        { value: "floating-heart-bottom-left", label: myLanguage.iconLocationValue3Sub4 }
    ];

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

    const convertColor = (color) => {
        if (/^#[0-9A-F]{6}$/i.test(color)) {
            return CssFilterConverter.hexToFilter(color);
        } else if (/^rgb\(\d+,\s*\d+,\s*\d+\)$/i.test(color)) {
            return CssFilterConverter.hexToFilter(color);
        } else {
            return CssFilterConverter.keywordToFilter(color);
        }
    };

    useMemo(() => {
        floatingHeartIconcolor = convertColor(watchAllFields.floatingHeartIconcolor);
    }, [watchAllFields]);


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

                if (!dData.floatingHeartIconCountBgcolor) {
                    dData.floatingHeartIconCountBgcolor = '#000000'
                    dData.floatingHeartIconCountTextcolor = '#FFFFFF'
                    dData.headerHeartIconCountBgcolor = '#000000'
                    dData.headerHeartIconCountTextcolor = '#FFFFFF'
                    await createMeta(dData)
                }
                reset({
                    wlbLocation1: dData.wlbLocation1,
                    wlbLocation2: dData.wlbLocation2,
                    wlbLocation3: dData.wlbLocation3,
                    wlbLocationSelect: dData.wlbLocationSelect,
                    floatingHeartBGcolor: dData.floatingHeartBGcolor,
                    floatingBgShape: dData.floatingBgShape,
                    floatingHeartIconcolor: (await CssFilterConverter.filterToHex(dData.floatingHeartIconcolor)).color,
                    paidWlbLocation: dData.paidWlbLocation,
                    wishlistButtonLocationCheck: dData.wishlistButtonLocationCheck,
                    heartIconColor: dData.heartIconColor,
                    heartIconHeight: dData.heartIconHeight,
                    heartIconWidth: dData.heartIconWidth,
                    headerIconType: dData.headerIconType,
                    floatingHeartIconCountBgcolor: dData.floatingHeartIconCountBgcolor || '#000000',
                    floatingHeartIconCountTextcolor: dData.floatingHeartIconCountTextcolor || '#FFFFFF',
                    headerHeartIconCountBgcolor: dData.headerHeartIconCountBgcolor || '#000000',
                    headerHeartIconCountTextcolor: dData.headerHeartIconCountTextcolor || '#FFFFFF',
                    hideHeaderCounter: dData?.hideHeaderCounter || "no",
                    headerIconPosition: dData?.headerIconPosition || "",


                })
            }
            if (dataArray[i].node.key === "wishlist-button-setting") {
                let dData = JSON.parse(dataArray[i].node.value);
                setGetIconType(dData.iconType);
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

        mergedData.wlbLocation1 = data.wlbLocation1;
        mergedData.wlbLocation2 = data.wlbLocation2;
        mergedData.wlbLocation3 = data.wlbLocation3;
        mergedData.wlbLocationSelect = data.wlbLocationSelect;
        mergedData.floatingHeartBGcolor = data.floatingHeartBGcolor;
        mergedData.floatingBgShape = data.floatingBgShape;
        mergedData.floatingHeartIconcolor = floatingHeartIconcolor.color;
        mergedData.paidWlbLocation = data.paidWlbLocation;
        mergedData.wishlistButtonLocationCheck = true;
        mergedData.heartIconColor = data.heartIconColor;
        mergedData.heartIconFilter = (await CssFilterConverter.hexToFilter(data.heartIconColor)).color;
        mergedData.heartIconHeight = data.heartIconHeight;
        mergedData.heartIconWidth = data.heartIconWidth;
        mergedData.headerIconType = data.headerIconType;
        mergedData.floatingHeartIconCountBgcolor = data.floatingHeartIconCountBgcolor;
        mergedData.floatingHeartIconCountTextcolor = data.floatingHeartIconCountTextcolor;
        mergedData.headerHeartIconCountBgcolor = data.headerHeartIconCountBgcolor;
        mergedData.headerHeartIconCountTextcolor = data.headerHeartIconCountTextcolor;
        mergedData.hideHeaderCounter = data?.hideHeaderCounter;
        mergedData.headerIconPosition = data?.headerIconPosition;

        await createMeta(mergedData).then((res) => {
            Swal.fire({
                icon: "success",
                title: myLanguage.swalHeading,
                text: myLanguage.swalText,
                confirmButtonText: myLanguage.swalOk
            });
        }); setSaveBar(false);
    };

    async function createMeta(mergedData) {
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

    // function boldWordInString(sentence, word) {
    //     const words = sentence.split(' ');
    //     return words.map((w, index) => {
    //         if (w.toLowerCase() === word.toLowerCase()) {
    //             return <b key={index}>{w} </b>; // Add space after each word
    //         } else {
    //             return <span key={index}>{w} </span>; // Add space after each word
    //         }
    //     });
    // }

    function boldWordInString(sentence, wordsToBold) {
        const words = sentence.split(' ');
        return words.map((w, index) => {
            if (wordsToBold.some(word => word.toLowerCase() === w.toLowerCase())) {
                return <b key={index}>{w} </b>; // Add space after each word
            } else {
                return <span key={index}>{w} </span>; // Add space after each word
            }
        });
    }


    return (
        <div className='wf-dashboard wf-dashboard-buttonSetting'>
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    <form onSubmit={handleSubmit(saveToMetafield)}>
                        {(saveBar) ? <SaveBar save={myLanguage.save} /> : ""}
                        <Page fullWidth
                            title={myLanguage.overValueB6}
                            subtitle={myLanguage.overValue6}
                            backAction={{ onAction: () => history.back() }}
                        >

                            <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                <div className='custom-margin'>
                                    <Text variant="headingMd" as="h2">{myLanguage.iconLocationCheckHeading}</Text>
                                    <p>{myLanguage.iconLocationCheckHeadText}</p>
                                </div>
                                <div className='wishlistUi-TyleInner'>
                                    <SingleFieldController
                                        name="wlbLocation1"
                                        control={control}
                                    >
                                        {({ field }) =>
                                            <Checkbox
                                                label={myLanguage.iconLocationValue1}
                                                value={"menu-item"}
                                                id="menu-item"
                                                checked={field.value}
                                                onChange={(checked) => {
                                                    field.onChange(checked),
                                                        setSaveBar(true);
                                                }}
                                            />
                                        }
                                    </SingleFieldController>

                                    <SingleFieldController
                                        name="wlbLocation2"
                                        control={control}
                                    >
                                        {({ field }) =>
                                            <Checkbox
                                                label={myLanguage.iconLocationValue2}
                                                value={"header-icon"}
                                                id="header-icon"
                                                checked={field.value}
                                                onChange={(checked) => {
                                                    field.onChange(checked),
                                                        setSaveBar(true);
                                                }}
                                            />
                                        }
                                    </SingleFieldController>
                                </div>

                                <SingleFieldController
                                    name="wlbLocation3"
                                    control={control}
                                >
                                    {({ field }) =>
                                        <Checkbox
                                            label={myLanguage.iconLocationValue3}
                                            value={"floating-heart"}
                                            id="floating-heart"
                                            checked={field.value}
                                            onChange={(checked) => {
                                                field.onChange(checked),
                                                    setSaveBar(true);
                                            }}
                                        />
                                    }
                                </SingleFieldController>
                            </div>

                            <Collapsible
                                // open={watchAllFields.wlbLocation3 || watchAllFields.wlbLocation2}
                                open={true}
                                id="basic-collapsible"
                                transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                                expandOnPrint
                            >
                                <div className='wf-style-wishbtn wishlist-ui-grid2 wf-count-box-basic'>
                                    <div className={`${!watchAllFields.wlbLocation3 && 'not-allowed-class'}`}>
                                        <div className={`wishlist-location-style ${!watchAllFields.wlbLocation3 && 'disable-block77'}`} >
                                            <div className='wf-wishlist-range-box'>
                                                <Text variant="headingMd" as="h2">{myLanguage.iconLocationMainHeading}</Text>
                                            </div>

                                            <SingleFieldController
                                                name="wlbLocationSelect"
                                                control={control}
                                                isCustomClass={true}
                                            >
                                                {({ field: { onChange, value } }) =>
                                                    <Select
                                                        label={myLanguage.floatingIconPosition}
                                                        options={options}
                                                        onChange={(value) => {
                                                            setSaveBar(true);
                                                            onChange(value);
                                                        }}
                                                        value={value}
                                                    />
                                                }
                                            </SingleFieldController>

                                            <div className='floating_icon'>
                                                <ColorPickerController control={control} controllerName={`floatingHeartBGcolor`} id={`floatingHeartBGcolor`} setSaveBar={setSaveBar} label={myLanguage.floatingIconBgColorText} />
                                            </div>

                                            <div className='floating_icon'>
                                                <ColorPickerController control={control} controllerName={`floatingHeartIconcolor`} id={`floatingHeartIconcolor`} setSaveBar={setSaveBar} label={myLanguage.floatingIconColorText} />
                                            </div>

                                            <div className='wishlistUi-TyleInner'>
                                                <div className='wf-wishlist-range-box'>
                                                    <label>{myLanguage.iconLocationShap}</label>
                                                </div>
                                                <div style={{ columnCount: 4 }}  >

                                                    <SingleFieldController
                                                        name="floatingBgShape"
                                                        control={control}>
                                                        {({ field }) =>
                                                            <RadioButton
                                                                label={myLanguage.iconLocationSquare}
                                                                value={field.value}
                                                                id="squareBG"
                                                                checked={field.value === "squareBG" && true} onChange={() => {
                                                                    field.onChange("squareBG"),
                                                                        setSaveBar(true);
                                                                }}
                                                            />
                                                        }
                                                    </SingleFieldController>

                                                    <SingleFieldController
                                                        name="floatingBgShape"
                                                        control={control}  >
                                                        {({ field }) =>
                                                            <RadioButton
                                                                label={myLanguage.iconLocationCircle}
                                                                value={field.value}
                                                                id="circleBG"
                                                                checked={field.value === "circleBG" && true} onChange={() => {
                                                                    field.onChange("circleBG"),
                                                                        setSaveBar(true);
                                                                }}
                                                            />
                                                        }
                                                    </SingleFieldController>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* <div className={`${!watchAllFields.wlbLocation2 && 'not-allowed-class'}`}>
                                        <div className={`${!watchAllFields.wlbLocation2 && 'disable-block77'}`}> */}
                                    <div>
                                        <div>
                                            <div className='wf-wishlist-range-box'>
                                                <Text variant="headingMd" as="h2">{myLanguage.iconLocationHeaderIconHeading}</Text>
                                            </div>

                                            <div className='wishlistUi-TyleInner'>
                                                <div className='wf-wishlist-range-box'>
                                                    <label>{myLanguage.headerIconType}</label>
                                                </div>


                                                <div style={{ columnCount: 2 }} >
                                                    <SingleFieldController
                                                        name="headerIconType"
                                                        control={control}>
                                                        {({ field }) =>
                                                            <RadioButton
                                                                label={<span><img src={getIconType === 'star' ? starEmpty : getIconType === 'save' ? saveEmpty : heartEmpty} alt='empty_heartIcon' height="20px" width="20px" /><span style={{ position: "relative", top: "-5px", left: "10px" }}>{myLanguage.iconOutline}</span></span>}
                                                                // label={myLanguage.iconOutline}
                                                                value={field.value}
                                                                id="outlineHeaderIcon"
                                                                checked={field.value === "outlineHeaderIcon" && true} onChange={() => {
                                                                    field.onChange("outlineHeaderIcon"),
                                                                        setSaveBar(true);
                                                                }}
                                                            />
                                                        }
                                                    </SingleFieldController>

                                                    <SingleFieldController
                                                        name="headerIconType"
                                                        control={control}  >
                                                        {({ field }) =>
                                                            <RadioButton
                                                                label={<span><img src={getIconType === 'star' ? starFill : getIconType === 'save' ? saveFill : heartFill} alt='fill_heartIcon' height="20px" width="20px" /><span style={{ position: "relative", top: "-5px", left: "10px" }}>{myLanguage.iconSolid}</span></span>}
                                                                value={field.value}
                                                                id="fillHeaderIcon"
                                                                checked={field.value === "fillHeaderIcon" && true} onChange={() => {
                                                                    field.onChange("fillHeaderIcon"),
                                                                        setSaveBar(true);
                                                                }}
                                                            />
                                                        }
                                                    </SingleFieldController>
                                                </div>
                                            </div>


                                            {/* ---------header icon left or right---------- */}





                                            {/*

                                            <div className='Polaris-Label__Text'>
                                                <span className='wf-wishlist-range-box wIconPos'>
                                                    <label>Wishlist Icon Position</label>
                                                </span>

                                                <div style={{ columnCount: 2 }} >
                                                    <SingleFieldController
                                                        name="headerIconPosition"
                                                        control={control}>
                                                        {({ field }) =>
                                                            <RadioButton
                                                                label={<span style={{ position: "relative", top: "", left: "10px" }}>Left of Cart Icon</span>}
                                                                // label={myLanguage.iconOutline}
                                                                value={false}
                                                                id="left"
                                                                checked={field.value === "left" && true} onChange={() => {
                                                                    field.onChange("left"),
                                                                        setSaveBar(true);
                                                                }}
                                                            />
                                                        }
                                                    </SingleFieldController>

                                                    <SingleFieldController
                                                        name="headerIconPosition"
                                                        control={control}  >
                                                        {({ field }) =>
                                                            <RadioButton
                                                                label={<span style={{ position: "relative", top: "", left: "10px" }}>Right of Cart Icon</span>}
                                                                value={false}
                                                                id="right"
                                                                checked={field.value === "right" && true} onChange={() => {
                                                                    field.onChange("right"),
                                                                        setSaveBar(true);
                                                                }}
                                                            />
                                                        }
                                                    </SingleFieldController>
                                                </div>
                                            </div>

*/}







                                            <div className='floating_icon'>
                                                <ColorPickerController control={control} controllerName={`heartIconColor`} id={`heartIconColor`} setSaveBar={setSaveBar} label={myLanguage.ilhIconColor} />
                                            </div>

                                            <RangeController control={control} controllerName={`heartIconWidth`} selectControllerName={`heartIconHeight`} label={myLanguage.ilhIconWidth} max={100} setSaveBar={setSaveBar} unit={"pixel"} />


                                            <RangeController control={control} controllerName={`heartIconHeight`} selectControllerName={`heartIconHeight`} label={myLanguage.marginLeftRight} max={100} setSaveBar={setSaveBar} unit={"pixel"} />

                                        </div>

                                        <div className='wishlistUi-TyleInner'>
                                            <div className='wf-wishlist-range-box'>
                                                <label>{myLanguage.hideCounter}</label>
                                            </div>
                                            <div style={{ display: "grid", gridTemplateColumns: "20% 20% 60%" }}  >
                                                <SingleFieldController
                                                    name="hideHeaderCounter"
                                                    control={control}>
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.styleHoverYes}
                                                            value={field.value}
                                                            id="yes"
                                                            checked={field.value === "yes" && true} onChange={() => {
                                                                field.onChange("yes"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>

                                                <SingleFieldController
                                                    name="hideHeaderCounter"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.styleHoverNo}
                                                            value={field.value}
                                                            id="no"
                                                            checked={field.value === "no" && true} onChange={() => {
                                                                field.onChange("no"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>

                                                <SingleFieldController
                                                    name="hideHeaderCounter"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.hideOnZero}
                                                            // label="Hide when 0"
                                                            value={field.value}
                                                            id="hide-at-zero-only"
                                                            checked={field.value === "hide-at-zero-only" && true} onChange={() => {
                                                                field.onChange("hide-at-zero-only"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 777777777777 */}

                                {/* <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} style={{ marginTop: "0" }}> */}
                                <div className='wf-style-wishbtn wishlist-ui-grid2 wf-count-box-basic-second'>


                                    <div className={`${!watchAllFields.wlbLocation3 && 'not-allowed-class'}`}>
                                        <div className={`${!watchAllFields.wlbLocation3 && 'disable-block77'}`}>
                                            <div className='floating_icon'>
                                                <ColorPickerController control={control} controllerName={`floatingHeartIconCountBgcolor`} id={`floatingHeartIconCountBgcolor`} setSaveBar={setSaveBar} label={myLanguage.floatingIconCountBgText} />
                                            </div>
                                        </div></div>

                                    {/* <div className='floating_icon'>
                                            <ColorPickerController control={control} controllerName={`floatingHeartIconCountTextcolor`} id={`floatingHeartIconCountTextcolor`} setSaveBar={setSaveBar} label={myLanguage.floatingIconCountText} />
                                        </div> */}


                                    <div className='floating_icon'>
                                        <ColorPickerController control={control} controllerName={`headerHeartIconCountBgcolor`} id={`headerHeartIconCountBgcolor`} setSaveBar={setSaveBar} label={myLanguage.headerIconCountBgText} />
                                    </div>

                                    <div className={`${!watchAllFields.wlbLocation3 && 'not-allowed-class'}`}>
                                        <div className={`${!watchAllFields.wlbLocation3 && 'disable-block77'}`}>
                                            <div className='floating_icon'>
                                                <ColorPickerController control={control} controllerName={`floatingHeartIconCountTextcolor`} id={`floatingHeartIconCountTextcolor`} setSaveBar={setSaveBar} label={myLanguage.floatingIconCountText} />
                                            </div>
                                        </div></div>

                                    <div className='floating_icon'>
                                        <ColorPickerController control={control} controllerName={`headerHeartIconCountTextcolor`} id={`headerHeartIconCountTextcolor`} setSaveBar={setSaveBar} label={myLanguage.headerIconCountText} />
                                    </div>

                                    <div className='floating_icon'></div>
                                    <div className='floating_icon'>
                                        <div className='Polaris-Label__Text'>
                                            <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                                <span className='wf-wishlist-range-box wIconPos'>
                                                    <label>{myLanguage.headerIconPosition}</label>
                                                </span>
                                                <div style={{ columnCount: 3 }} >
                                                    <SingleFieldController
                                                        name="headerIconPosition"
                                                        control={control}>
                                                        {({ field }) =>
                                                            <RadioButton
                                                                label={<span style={{ position: "relative", top: "", left: "10px" }}>{myLanguage.hiLeft}</span>}
                                                                // label={myLanguage.iconOutline}
                                                                value={false}
                                                                id="left"
                                                                checked={field.value === "left" && true} onChange={() => {
                                                                    field.onChange("left"),
                                                                        setSaveBar(true);
                                                                }}
                                                            />
                                                        }
                                                    </SingleFieldController>

                                                    <SingleFieldController
                                                        name="headerIconPosition"
                                                        control={control}  >
                                                        {({ field }) =>
                                                            <RadioButton
                                                                label={<span style={{ position: "relative", top: "", left: "10px" }}>{myLanguage.hiRight}</span>}
                                                                value={false}
                                                                id="right"
                                                                checked={field.value === "right" && true} onChange={() => {
                                                                    field.onChange("right"),
                                                                        setSaveBar(true);
                                                                }}
                                                            />
                                                        }
                                                    </SingleFieldController>


                                                    {/* <SingleFieldController
                                                    name="headerIconPosition"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={<span style={{ position: "relative", top: "", left: "10px" }}>{myLanguage.styleHoverNo}</span>}
                                                            value={false}
                                                            id="non"
                                                            checked={field.value === "non" && true} onChange={() => {
                                                                field.onChange("non"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController> */}


                                                </div>
                                            </div>
                                        </div>
                                    </div>



                                    {/* <div className='Polaris-Label__Text'>
                                        <span className='wf-wishlist-range-box wIconPos'>
                                            <label>Wishlist Icon Position</label>
                                        </span>

                                        <div style={{ columnCount: 2 }} >
                                            <SingleFieldController
                                                name="headerIconPosition"
                                                control={control}>
                                                {({ field }) =>
                                                    <RadioButton
                                                        label={<span style={{ position: "relative", top: "", left: "10px" }}>Left of Cart Icon</span>}
                                                        // label={myLanguage.iconOutline}
                                                        value={false}
                                                        id="left"
                                                        checked={field.value === "left" && true} onChange={() => {
                                                            field.onChange("left"),
                                                                setSaveBar(true);
                                                        }}
                                                    />
                                                }
                                            </SingleFieldController>

                                            <SingleFieldController
                                                name="headerIconPosition"
                                                control={control}  >
                                                {({ field }) =>
                                                    <RadioButton
                                                        label={<span style={{ position: "relative", top: "", left: "10px" }}>Right of Cart Icon</span>}
                                                        value={false}
                                                        id="right"
                                                        checked={field.value === "right" && true} onChange={() => {
                                                            field.onChange("right"),
                                                                setSaveBar(true);
                                                        }}
                                                    />
                                                }
                                            </SingleFieldController>
                                        </div>
                                    </div> */}








                                    {/* </div> */}
                                </div>

                            </Collapsible>

                            <div id='custom-code-icon-section' className='wf-style-wishbtn'>
                                <div className={`${currentPlan >= 2 ? "" : "disableEverything under-basic"}`} >
                                    <div className='wf-showCount-box'>
                                        <div>
                                            <Text variant="headingMd" as="h2">{myLanguage.iconCustomCodeHeading}</Text>
                                            <Text id="sentence" variant="body" as="p">{boldWordInString(myLanguage.iconCustomCodeText, ["(class='custom-wishlist-icon')", "wishlist-type"])}</Text>

                                            <Text as='p' variant='body'> {myLanguage.iconCustomCodeExample}</Text>
                                            <Text as='p' variant='body'> {myLanguage.iconCustomCodeExample2}</Text>

                                            <Text as='p' variant='body'><b> {myLanguage.noteHeading}: {myLanguage.iconCustomCodeExampleText}</b></Text>
                                        </div>

                                        {currentPlan >= 2 &&
                                            <div className='wf-dashboard-yes-no-toggle'>
                                                <div className='toggle-paid-inner'>
                                                    <label id='btn_yes' className={`${watchAllFields.paidWlbLocation === "yes" ? "activeToggle" : ""}`}>
                                                        {myLanguage.styleHoverYes}
                                                        <SingleFieldController
                                                            name="paidWlbLocation"
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

                                                    <label id='btn_no' className={`${watchAllFields.paidWlbLocation === "no" ? "activeToggle" : ""}`}>
                                                        {myLanguage.styleHoverNo}
                                                        <SingleFieldController
                                                            name="paidWlbLocation"
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
                </Frame >
            }
        </div>
    )
}


export default WishlistButtonLocation;