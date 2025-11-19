import React, { useCallback, useEffect, useRef, useState } from 'react';
import useAppMetafield from '../../hooks/useAppMetafield';
import useUtilityFunction from '../../hooks/useUtilityFunction';
import { Controller, useForm } from 'react-hook-form';
import SkeletonPage1 from '../SkeletonPage1';
import { Frame, Page, Tabs, RadioButton, Text, LegacyCard } from '@shopify/polaris';
import SaveBar from '../SaveBar';
import Swal from 'sweetalert2';
import loaderGif from "../loaderGreen.gif";
import SingleFieldController from '../../hooks/useSingleFieldController';
import Footer from '../Footer';
import CustomStyle from '../CustomStyle';
import CustomHoverSetting from '../CustomHoverSetting';


const UserLogin = () => {
    const { handleSubmit, control, reset, watch, formState: { errors } } = useForm();
    const appMetafield = useAppMetafield();
    const [saveBar, setSaveBar] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const utilityFunction = useUtilityFunction();
    const [currentPlan, setCurrentPlan] = useState(0);
    const existingData = useRef([]);
    const [myLanguage, setMyLanguage] = useState({});
    const [userLogin, setUserLogin] = useState(0);
    const [guestLogin, setGuestLogin] = useState(0);
    const watchAllFields = watch();

    const defaultData = {
        bgColor: "#FFFFFF",
        textColor: "#000000",
        fontSize: {
            value: "15",
            unit: "px"
        },
        fontFamily: "",
        borderRadius: {
            value: "0",
            unit: "px"
        },
        paddingTopBottom: {
            value: "8",
            unit: "px"
        },
        paddingLeftRight: {
            value: "10",
            unit: "px"
        },
        marginTopBottom: {
            value: "07",
            unit: "px"
        },
        marginLeftRight: {
            value: "0",
            unit: "px"
        },
        border: {
            value: "1",
            unit: "px",
            type: "solid",
            color: "#000000"
        },
        textAlign: "center",
        hover: {
            bgColor: "#000000",
            textColor: "#FFFFFF",
            border: {
                value: "1",
                unit: "px",
                type: "solid",
                color: "#797979"
            }
        }
    }

    const defaultDataGuest = {
        bgColor: "#FFFFFF",
        textColor: "#000000",
        fontSize: {
            value: "15",
            unit: "px"
        },
        fontFamily: "",
        borderRadius: {
            value: "0",
            unit: "px"
        },
        paddingTopBottom: {
            value: "8",
            unit: "px"
        },
        paddingLeftRight: {
            value: "10",
            unit: "px"
        },
        marginTopBottom: {
            value: "07",
            unit: "px"
        },
        marginLeftRight: {
            value: "0",
            unit: "px"
        },
        border: {
            value: "1",
            unit: "px",
            type: "solid",
            color: "#000000"
        },
        textAlign: "center",
        hover: {
            bgColor: "#000000",
            textColor: "#FFFFFF",
            border: {
                value: "1",
                unit: "px",
                type: "solid",
                color: "#797979"
            }
        }
    }

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

                if (!dData.guestLogin) {

                    let mergedData = { ...existingData.current };

                    mergedData.createWishlist = "no"
                    mergedData.userLogin = defaultData
                    mergedData.guestLogin = defaultDataGuest

                    await createMetaFxn(mergedData)
                    resetData(mergedData)
                } else {
                    resetData(dData)
                }
            }
        }
    }

    function resetData(data) {
        reset({
            createWishlist: data.createWishlist,
            userLoginbgColor: data.userLogin.bgColor,
            userLoginborderInput: data.userLogin.border.value,
            userLoginborderInputUnit: data.userLogin.border.unit,
            userLoginborderRadius: data.userLogin.borderRadius.value,
            userLoginborderRadiusUnit: data.userLogin.borderRadius.unit,
            userLoginborderType: data.userLogin.border.type,
            userLoginborderColor: data.userLogin.border.color,
            userLoginfontFamily: data.userLogin.fontFamily,
            userLogintextColor: data.userLogin.textColor,
            userLoginfontSize: data.userLogin.fontSize.value,
            userLoginfontSizeUnit: data.userLogin.fontSize.unit,
            userLoginhoverBgColor: data.userLogin.hover.bgColor,
            userLoginhoverBorderColor: data.userLogin.hover.border.color,
            userLoginhoverBorderInput: data.userLogin.hover.border.value,
            userLoginhoverBorderInputUnit: data.userLogin.hover.border.unit,
            userLoginhoverBorderType: data.userLogin.hover.border.type,
            userLoginhoverTextColor: data.userLogin.hover.textColor,
            userLoginmarginLeftRight: data.userLogin.marginLeftRight.value,
            userLoginmarginLeftRightUnit: data.userLogin.marginLeftRight.unit,
            userLoginmarginTopBottom: data.userLogin.marginTopBottom.value,
            userLoginmarginTopBottomUnit: data.userLogin.marginTopBottom.unit,
            userLoginpaddingLeftRight: data.userLogin.paddingLeftRight.value,
            userLoginpaddingLeftRightUnit: data.userLogin.paddingLeftRight.unit,
            userLoginpaddingTopBottom: data.userLogin.paddingTopBottom.value,
            userLoginpaddingTopBottomUnit: data.userLogin.paddingTopBottom.unit,
            userLogintextAlign: data.userLogin.textAlign,

            guestLoginbgColor: data.guestLogin.bgColor,
            guestLoginborderInput: data.guestLogin.border.value,
            guestLoginborderInputUnit: data.guestLogin.border.unit,
            guestLoginborderRadius: data.guestLogin.borderRadius.value,
            guestLoginborderRadiusUnit: data.guestLogin.borderRadius.unit,
            guestLoginborderType: data.guestLogin.border.type,
            guestLoginborderColor: data.guestLogin.border.color,
            guestLoginfontFamily: data.guestLogin.fontFamily,
            guestLogintextColor: data.guestLogin.textColor,
            guestLoginfontSize: data.guestLogin.fontSize.value,
            guestLoginfontSizeUnit: data.guestLogin.fontSize.unit,
            guestLoginhoverBgColor: data.guestLogin.hover.bgColor,
            guestLoginhoverBorderColor: data.guestLogin.hover.border.color,
            guestLoginhoverBorderInput: data.guestLogin.hover.border.value,
            guestLoginhoverBorderInputUnit: data.guestLogin.hover.border.unit,
            guestLoginhoverBorderType: data.guestLogin.hover.border.type,
            guestLoginhoverTextColor: data.guestLogin.hover.textColor,
            guestLoginmarginLeftRight: data.guestLogin.marginLeftRight.value,
            guestLoginmarginLeftRightUnit: data.guestLogin.marginLeftRight.unit,
            guestLoginmarginTopBottom: data.guestLogin.marginTopBottom.value,
            guestLoginmarginTopBottomUnit: data.guestLogin.marginTopBottom.unit,
            guestLoginpaddingLeftRight: data.guestLogin.paddingLeftRight.value,
            guestLoginpaddingLeftRightUnit: data.guestLogin.paddingLeftRight.unit,
            guestLoginpaddingTopBottom: data.guestLogin.paddingTopBottom.value,
            guestLoginpaddingTopBottomUnit: data.guestLogin.paddingTopBottom.unit,
            guestLogintextAlign: data.guestLogin.textAlign,
        })
        setIsLoading(true);
    }

    const saveToMetafield = async (data) => {
        Swal.fire({
            text: myLanguage.swalWaiting,
            imageUrl: loaderGif,
            showConfirmButton: false,
        });

        let mergedData = { ...existingData.current };

        mergedData.createWishlist = data.createWishlist;

        const userLoginData = {
            bgColor: data.userLoginbgColor,
            textColor: data.userLogintextColor,
            fontSize: { value: data.userLoginfontSize, unit: data.userLoginfontSizeUnit },
            fontFamily: data.userLoginfontFamily,

            borderRadius: {
                value: data.userLoginborderRadius,
                unit: data.userLoginborderRadiusUnit
            },
            paddingTopBottom: {
                value: data.userLoginpaddingTopBottom,
                unit: data.userLoginpaddingTopBottomUnit
            },
            paddingLeftRight: {
                value: data.userLoginpaddingLeftRight,
                unit: data.userLoginpaddingLeftRightUnit
            },
            marginTopBottom: {
                value: data.userLoginmarginTopBottom,
                unit: data.userLoginmarginTopBottomUnit,

            },
            marginLeftRight: {
                value: data.userLoginmarginLeftRight,
                unit: data.userLoginmarginLeftRightUnit,
            },

            border: {
                value: data.userLoginborderInput,
                unit: data.userLoginborderInputUnit,
                type: data.userLoginborderType,
                color: data.userLoginborderColor
            },
            textAlign: data.userLogintextAlign,
            hover: {
                bgColor: data.userLoginhoverBgColor,
                textColor: data.userLoginhoverTextColor,
                border: {
                    value: data.userLoginhoverBorderInput,
                    unit: data.userLoginhoverBorderInputUnit,
                    type: data.userLoginhoverBorderType,
                    color: data.userLoginhoverBorderColor
                }
            }
        }

        const guestLoginData = {
            bgColor: data.guestLoginbgColor,
            textColor: data.guestLogintextColor,
            fontSize: { value: data.guestLoginfontSize, unit: data.guestLoginfontSizeUnit },
            fontFamily: data.guestLoginfontFamily,

            borderRadius: {
                value: data.guestLoginborderRadius,
                unit: data.guestLoginborderRadiusUnit
            },
            paddingTopBottom: {
                value: data.guestLoginpaddingTopBottom,
                unit: data.guestLoginpaddingTopBottomUnit
            },
            paddingLeftRight: {
                value: data.guestLoginpaddingLeftRight,
                unit: data.guestLoginpaddingLeftRightUnit
            },
            marginTopBottom: {
                value: data.guestLoginmarginTopBottom,
                unit: data.guestLoginmarginTopBottomUnit,

            },
            marginLeftRight: {
                value: data.guestLoginmarginLeftRight,
                unit: data.guestLoginmarginLeftRightUnit,
            },

            border: {
                value: data.guestLoginborderInput,
                unit: data.guestLoginborderInputUnit,
                type: data.guestLoginborderType,
                color: data.guestLoginborderColor
            },
            textAlign: data.guestLogintextAlign,
            hover: {
                bgColor: data.guestLoginhoverBgColor,
                textColor: data.guestLoginhoverTextColor,
                border: {
                    value: data.guestLoginhoverBorderInput,
                    unit: data.guestLoginhoverBorderInputUnit,
                    type: data.guestLoginhoverBorderType,
                    color: data.guestLoginhoverBorderColor
                }
            }
        }

        mergedData.userLogin = userLoginData
        mergedData.guestLogin = guestLoginData

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

    const userLoginArray = [
        {
            content: myLanguage.regular,
            data: <CustomStyle reset={reset} isloading={isloading} Controller={Controller} control={control} hoverOption={true} myLanguage={myLanguage} formName={"userLogin"} setSaveBar={setSaveBar} watchAllFields={watchAllFields} />,
            id: 'regular-1',
        },
        {
            content: myLanguage.hover,
            data: <CustomHoverSetting Controller={Controller} control={control} setSaveBar={setSaveBar} watchAllFields={watchAllFields} formName={"userLogin"} myLanguage={myLanguage} />,
            id: 'hover-2',
        },

    ];

    const userLoginHandler = useCallback(
        (selectedTabIndex) => {
            setUserLogin(selectedTabIndex)
        },
        []
    );


    const guestLoginArray = [
        {
            content: myLanguage.regular,
            data: <CustomStyle reset={reset} isloading={isloading} Controller={Controller} control={control} hoverOption={true} myLanguage={myLanguage} formName={"guestLogin"} setSaveBar={setSaveBar} watchAllFields={watchAllFields} />,
            id: 'regular-1',
        },
        {
            content: myLanguage.hover,
            data: <CustomHoverSetting Controller={Controller} control={control} setSaveBar={setSaveBar} watchAllFields={watchAllFields} formName={"guestLogin"} myLanguage={myLanguage} />,
            id: 'hover-2',
        },

    ];

    const guestLoginHandler = useCallback(
        (selectedTabIndex) => {
            setGuestLogin(selectedTabIndex)
        },
        []
    );

    return (
        <div className='wf-dashboard wf-dashboard-buttonSetting wf-ui-settings'>
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    <form onSubmit={handleSubmit(saveToMetafield)}>
                        {(saveBar) ? <SaveBar save={myLanguage.save} /> : ""}
                        <Page fullWidth
                            title={myLanguage.isLoginHeading}
                            subtitle={myLanguage.isLoginSubHeading}
                            backAction={{ onAction: () => history.back() }}
                        >

                            {/* LOGIN */}
                            <div className='wf-style-wishbtn wishlist-ui-grid2'>
                                <div className={`${currentPlan >= 3 ? "" : "disableEverything under-pro"}`} >
                                    <div className='wf-showCount-box'>
                                        <div className='custom-margin'>
                                            <Text variant="headingMd" as="h2">{myLanguage.isLoginHeading}</Text>
                                            <p>{myLanguage.isLoginSubHeading}</p>
                                        </div>

                                        {currentPlan >= 3 &&
                                            <div className='wf-dashboard-yes-no-toggle'>
                                                <div className='toggle-paid-inner'>
                                                    <label id='login_users' className={`${watchAllFields.createWishlist === "yes" ? "activeToggle" : ""}`}>
                                                        {myLanguage.styleHoverYes}
                                                        <SingleFieldController
                                                            name="createWishlist"
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

                                                    <label id='each_users' className={`${watchAllFields.createWishlist === "no" ? "activeToggle" : ""}`}>
                                                        {myLanguage.styleHoverNo}
                                                        <SingleFieldController
                                                            name="createWishlist"
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


                            <div className={`${currentPlan < 3 && 'disableOneByOne'}`}>
                                <div id="add-to-cart-section" className='wf-style-wishbtn'>
                                    <div className='custom-margin'>
                                        <Text variant="headingMd" as="h2">{myLanguage.createAccountHeading}</Text>
                                        <p>{myLanguage.createAccountSubHeading}</p>
                                    </div>

                                    <Tabs tabs={userLoginArray} selected={userLogin} onSelect={userLoginHandler} fitted>
                                        <LegacyCard.Section >
                                            {userLoginArray[userLogin].data}
                                        </LegacyCard.Section>
                                    </Tabs>
                                </div>
                            </div>

                            <div className={`${currentPlan < 3 && 'disableOneByOne'}`}>
                                <div id="add-to-cart-section" className='wf-style-wishbtn' style={{ marginTop: "15px" }}>
                                    <div className='custom-margin'>
                                        <Text variant="headingMd" as="h2">{myLanguage.loginHeading}</Text>
                                        <p>{myLanguage.loginSubHeading}</p>
                                    </div>

                                    <Tabs tabs={guestLoginArray} selected={guestLogin} onSelect={guestLoginHandler} fitted>
                                        <LegacyCard.Section >
                                            {guestLoginArray[guestLogin].data}
                                        </LegacyCard.Section>
                                    </Tabs>
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


export default UserLogin;