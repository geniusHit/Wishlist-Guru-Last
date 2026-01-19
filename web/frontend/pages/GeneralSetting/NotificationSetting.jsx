import React, { useEffect, useMemo, useRef, useState } from 'react';
import useAppMetafield from '../../hooks/useAppMetafield';
import SkeletonPage1 from '../SkeletonPage1';
import { AlphaCard, Collapsible, Frame, Page, Text, RadioButton, TextField } from '@shopify/polaris';
import SaveBar from '../SaveBar';
import useUtilityFunction from '../../hooks/useUtilityFunction';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import loaderGif from "../loaderGreen.gif";
import SingleFieldController from '../../hooks/useSingleFieldController';
import CustomSettingStyle from './CustomSettingStyle';
import Footer from '../Footer';

const NotificationSetting = () => {
    const { handleSubmit, watch, control, reset, setValue, formState: { errors } } = useForm();
    const appMetafield = useAppMetafield();
    const [saveBar, setSaveBar] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const [checkRadio, setcheckRadio] = useState(false);
    const utilityFunction = useUtilityFunction();
    const existingData = useRef([]);
    const watchAllFields = watch();
    const [myLanguage, setMyLanguage] = useState({});
    const [showDiv, setShowDiv] = useState(false)

    useEffect(() => {
        useEffectLite();
    }, []);

    async function useEffectLite() {
        await utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
        });
        getAllAppDataMetafields();
    }

    useMemo(() => {
        if (watchAllFields.notificationType === "tool-tip") {
            setValue('notificationTypeOption', "tool-tip-below");
        } else if (watchAllFields.notificationType === "text") {
            setValue('notificationTypeOption', "text-below");
        } else if (watchAllFields.notificationType === "toast") {
            setValue('notificationTypeOption', "toast-center");
        }
    }, [checkRadio])



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
                    wishlistOrNotification: dData.wishlistOrNotification,
                    notificationType: dData.notificationType,
                    notificationTypeOption: dData.notificationTypeOption,
                    bgColor: dData.bgColor,
                    widthValue: dData.widthValue,
                    widthUnit: dData.widthUnit,
                    paddingTopBottom: dData.paddingTopBottom,
                    paddingTopBottomUnit: dData.paddingTopBottomUnit,
                    paddingLeftRight: dData.paddingLeftRight,
                    paddingLeftRightUnit: dData.paddingLeftRightUnit,
                    marginTopBottom: dData.marginTopBottom,
                    marginTopBottomUnit: dData.marginTopBottomUnit,
                    marginLeftRight: dData.marginLeftRight,
                    marginLeftRightUnit: dData.marginLeftRightUnit,
                    borderInput: dData.borderInput,
                    borderInputUnit: dData.borderInputUnit,
                    borderType: dData.borderType,
                    notificationBorderColor: dData.notificationBorderColor,
                    borderRadius: dData.borderRadius,
                    borderRadiusUnit: dData.borderRadiusUnit,
                    fontSize: dData.fontSize,
                    fontSizeUnit: dData.fontSizeUnit,
                    textColor: dData.textColor,
                    fontFamily: dData.fontFamily,
                    textAlign: dData.textAlign,
                    notificationTimer: dData.notificationTimer,
                    notificationCheck: dData.notificationCheck,
                })
                    (dData.notificationType === "text") && setShowDiv(true)
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

        mergedData.wishlistOrNotification = data.wishlistOrNotification;
        mergedData.notificationType = data.notificationType;
        mergedData.notificationTypeOption = data.notificationTypeOption;
        mergedData.bgColor = data.bgColor;
        mergedData.widthValue = data.widthValue;
        mergedData.widthUnit = data.widthUnit;
        mergedData.borderRadius = data.borderRadius;
        mergedData.paddingTopBottom = data.paddingTopBottom;
        mergedData.paddingTopBottomUnit = data.paddingTopBottomUnit;
        mergedData.paddingLeftRight = data.paddingLeftRight;
        mergedData.paddingLeftRightUnit = data.paddingLeftRightUnit;
        mergedData.marginTopBottom = data.marginTopBottom;
        mergedData.marginTopBottomUnit = data.marginTopBottomUnit
        mergedData.marginLeftRight = data.marginLeftRight;
        mergedData.marginLeftRightUnit = data.marginLeftRightUnit;
        mergedData.borderInput = data.borderInput;
        mergedData.borderInputUnit = data.borderInputUnit;
        mergedData.borderType = data.borderType;
        mergedData.notificationBorderColor = data.notificationBorderColor;
        mergedData.borderRadiusUnit = data.borderRadiusUnit;
        mergedData.fontSize = data.fontSize;
        mergedData.fontSizeUnit = data.fontSizeUnit;
        mergedData.textColor = data.textColor;
        mergedData.fontFamily = data.fontFamily;
        mergedData.textAlign = data.textAlign;
        mergedData.notificationTimer = data.notificationTimer;
        mergedData.notificationCheck = true;

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
        <div className='wf-dashboard wf-dashboard-notificationSetting'>
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    <form onSubmit={handleSubmit(saveToMetafield)}>
                        {(saveBar) ? <SaveBar save={myLanguage.save} /> : ""}
                        <Page fullWidth
                            title={myLanguage.overValueB8}
                            subtitle={myLanguage.overValue8}
                            backAction={{ onAction: () => history.back() }}
                        >
                            <div id="notification-section">
                                <div className='wf-style-wishbtn wf-show-notification'>
                                    <div className='custom-margin'>
                                        <Text variant="headingMd" as="h2">{myLanguage.notificationOptionHeading} </Text>
                                        <p>{myLanguage.notificationOptionText}</p>
                                    </div>
                                    <SingleFieldController
                                        name="wishlistOrNotification"
                                        control={control}  >
                                        {({ field }) =>
                                            <RadioButton
                                                label={myLanguage.notificationValue1}
                                                value={field.value} id="show-wishlist"
                                                checked={field.value === "show-wishlist" && true}
                                                onChange={() => {
                                                    field.onChange("show-wishlist"),
                                                        setSaveBar(true);
                                                }}
                                            />
                                        }
                                    </SingleFieldController>

                                    <SingleFieldController
                                        name="wishlistOrNotification"
                                        control={control}  >
                                        {({ field }) =>
                                            <RadioButton
                                                label={myLanguage.notificationValue2}
                                                value={field.value} id="show-notification"
                                                checked={field.value === "show-notification" && true} onChange={() => {
                                                    field.onChange("show-notification"),
                                                        setSaveBar(true);
                                                }}
                                            />
                                        }
                                    </SingleFieldController>
                                </div>


                                <Collapsible
                                    open={watchAllFields.wishlistOrNotification === "show-notification" ? true : false}
                                    id="basic-collapsible"
                                    transition={{
                                        duration: '500ms',
                                        timingFunction: 'ease-in-out'
                                    }}
                                    expandOnPrint
                                >
                                    <div className='wf-style-wishbtn'>
                                        <div className='custom-margin'>
                                            <Text variant="headingMd" as="h2">{myLanguage.subNotificationHeading}</Text>
                                            <p>{myLanguage.subNotificationText}</p>
                                        </div>

                                        <SingleFieldController
                                            name="notificationType"
                                            control={control}  >
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.subNotificationValue1}
                                                    value={field.value}
                                                    id="tool-tip"
                                                    checked={field.value === "tool-tip" && true} onChange={() => {
                                                        field.onChange("tool-tip"),
                                                            setSaveBar(true);
                                                        setcheckRadio(!checkRadio)
                                                        setShowDiv(false);

                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <div className='notificationToolTipCollapsible'>
                                            <Collapsible
                                                open={watchAllFields.notificationType === "tool-tip" ? true : false}
                                                id="basic-collapsible"
                                                transition={{
                                                    duration: '500ms',
                                                    timingFunction: 'ease-in-out'
                                                }}
                                                expandOnPrint
                                            >

                                                <SingleFieldController
                                                    name="notificationTypeOption"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.subNotificationValue1Sub1}
                                                            value={field.value}
                                                            id="tool-tip-below"
                                                            checked={field.value === "tool-tip-below" && true}
                                                            onChange={() => {
                                                                field.onChange("tool-tip-below"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>

                                                <SingleFieldController
                                                    name="notificationTypeOption"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.subNotificationValue1Sub2}
                                                            value={field.value}
                                                            id="tool-tip-above"
                                                            checked={field.value === "tool-tip-above" && true}
                                                            onChange={() => {
                                                                field.onChange("tool-tip-above"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>
                                            </Collapsible>
                                        </div>

                                        <SingleFieldController
                                            name="notificationType"
                                            control={control}  >
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.subNotificationValue2}
                                                    value={field.value}
                                                    id="toast"
                                                    checked={field.value === "toast" && true}
                                                    onChange={() => {
                                                        field.onChange("toast"),
                                                            setSaveBar(true);
                                                        setcheckRadio(!checkRadio)
                                                        setShowDiv(false);

                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <div className='notificationToastCollapsible'>
                                            <Collapsible
                                                open={watchAllFields.notificationType === "toast" ? true : false}
                                                id="basic-collapsible"
                                                transition={{
                                                    duration: '500ms',
                                                    timingFunction: 'ease-in-out'
                                                }}
                                                expandOnPrint
                                            >
                                                <SingleFieldController
                                                    name="notificationTypeOption"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.subNotificationValue2Sub4}
                                                            value={field.value} id="toast-top-center" checked={field.value === "toast-top-center" && true}
                                                            onChange={() => {
                                                                field.onChange("toast-top-center"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>

                                                <SingleFieldController
                                                    name="notificationTypeOption"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.subNotificationValue2Sub5}
                                                            value={field.value} id="toast-top-left" checked={field.value === "toast-top-left" && true}
                                                            onChange={() => {
                                                                field.onChange("toast-top-left"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>

                                                <SingleFieldController
                                                    name="notificationTypeOption"
                                                    control={control}>
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.subNotificationValue2Sub6}
                                                            value={field.value} id="toast-top-right" checked={field.value === "toast-top-right" && true}
                                                            onChange={() => {
                                                                field.onChange("toast-top-right"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>

                                                <SingleFieldController
                                                    name="notificationTypeOption"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.subNotificationValue2Sub1}
                                                            value={field.value}
                                                            id="toast-center"
                                                            checked={field.value === "toast-center" && true}
                                                            onChange={() => {
                                                                field.onChange("toast-center"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>

                                                <SingleFieldController
                                                    name="notificationTypeOption"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.subNotificationValue2Sub2}
                                                            value={field.value}
                                                            id="toast-left"
                                                            checked={field.value === "toast-left" && true}
                                                            onChange={() => {
                                                                field.onChange("toast-left"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>

                                                <SingleFieldController
                                                    name="notificationTypeOption"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.subNotificationValue2Sub3}
                                                            value={field.value} id="toast-right" checked={field.value === "toast-right" && true}
                                                            onChange={() => {
                                                                field.onChange("toast-right"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>

                                            </Collapsible>
                                        </div>

                                        <SingleFieldController
                                            name="notificationType"
                                            control={control}  >
                                            {({ field }) =>
                                                <RadioButton
                                                    label={myLanguage.subNotificationValue3}
                                                    value={field.value}
                                                    id="text"
                                                    checked={field.value === "text" && true}
                                                    onChange={() => {
                                                        field.onChange("text"),
                                                            setSaveBar(true);
                                                        setcheckRadio(!checkRadio)
                                                        setShowDiv(true);

                                                    }}
                                                />
                                            }
                                        </SingleFieldController>

                                        <div className='notificationTextCollapsible '>
                                            <Collapsible
                                                open={watchAllFields.notificationType === "text" ? true : false}
                                                id="basic-collapsible"
                                                transition={{
                                                    duration: '500ms',
                                                    timingFunction: 'ease-in-out'
                                                }}
                                                expandOnPrint
                                            >
                                                <SingleFieldController
                                                    name="notificationTypeOption"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.subNotificationValue3Sub1}
                                                            value={field.value}
                                                            id="text-below"
                                                            checked={field.value === "text-below" && true}
                                                            onChange={() => {
                                                                field.onChange("text-below"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>

                                                <SingleFieldController
                                                    name="notificationTypeOption"
                                                    control={control}  >
                                                    {({ field }) =>
                                                        <RadioButton
                                                            label={myLanguage.subNotificationValue3Sub2}
                                                            value={field.value}
                                                            id="text-above"
                                                            checked={field.value === "text-above" && true}
                                                            onChange={() => {
                                                                field.onChange("text-above"),
                                                                    setSaveBar(true);
                                                            }}
                                                        />
                                                    }
                                                </SingleFieldController>
                                            </Collapsible>
                                        </div>

                                        <div className='custom-margin'>
                                            <Text variant="headingMd" as="h2">{myLanguage.notificationTimerHeading}</Text>
                                            <p>{myLanguage.notificationTimerText}</p>
                                        </div>

                                        <div className='notification-number custom-margin' style={{ width: "300px" }}>
                                            <SingleFieldController
                                                name="notificationTimer"
                                                control={control}  >
                                                {({ field }) =>
                                                    <TextField
                                                        id={`notificationTimer`}
                                                        type='number'
                                                        value={field.value}
                                                        onChange={(newValue) => {
                                                            setSaveBar(true);
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                }
                                            </SingleFieldController>
                                        </div>
                                    </div>

                                    {
                                        watchAllFields.wishlistOrNotification === "show-notification" &&
                                        <div className='wf-style-wishbtn'>
                                            <div className='endColorPicker'>
                                                <div className="custom-margin">
                                                    <Text variant="headingMd" as="h2">{myLanguage.subNotificationStyleHeading} </Text>
                                                    <p>{myLanguage.subNotificationStyleText}</p>
                                                </div>
                                                <div className='wishlist-ui-grid2'>
                                                    <CustomSettingStyle showDiv={showDiv} setSaveBar={setSaveBar} control={control} myLanguage={myLanguage} hideWidth={true} />
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </Collapsible>
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


export default NotificationSetting;