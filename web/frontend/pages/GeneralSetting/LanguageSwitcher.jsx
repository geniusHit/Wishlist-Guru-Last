
import { Button, IndexTable, LegacyCard, Spinner, Icon, Text, Modal, RadioButton, Select, TextField } from '@shopify/polaris';
import React, { useCallback, useEffect, useState } from 'react'
import { EditMajor, DeleteMajor } from '@shopify/polaris-icons';
import { useForm } from 'react-hook-form';
import SingleFieldController from '../../hooks/useSingleFieldController';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import mainDomain from '../../assets/mainDomain.png';
import subDomain from '../../assets/subDomain.png';


const LanguageSwitcher2 = ({ data }) => {
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search.trim());
    const [modalLoading, setModalLoading] = useState(false);
    const [langData, setLangData] = useState([])
    const [active, setActive] = useState(false);
    const [activeId, setActiveId] = useState(null)
    const [shouldShow, setShouldShow] = useState("no")
    const [urlId, setUrlId] = useState(null);
    const [smallLoader, setSmaalLoader] = useState(false);
    const { handleSubmit, control, watch, reset, formState: { errors } } = useForm({
        defaultValues: {
            typeOfUrl: 'type1',
            storeFrontLanguage: "english"
        }
    });
    const watchAllFields = watch()
    const navigate = useNavigate()

    const serverURL = data.serverURL;
    const languageTypes = data.languageTypes;
    const updateLang = data.updateLang;
    const shopData = data.shopData;
    const getDataFromDB = data.getDataFromDB;
    const myLanguage = data.myLanguage;
    const currentPlan = data.currentPlan;
    const sendData = data.sendData
    const appName = data.appName;
    const saveDataInMeta = data.saveDataInMeta;

    useEffect(() => {
        useEffectLite();
    }, [])

    async function useEffectLite() {
        await fetchData(shopData)
    }

    const fetchData = async (data) => {
        try {
            const storeLanguagesData = await fetch(`${serverURL}/get-store-language-data-useeff`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: data.shopName,
                    url: `https://${data.domain}/`,
                    type: "default",
                    languageName: sendData.textMsgLanguage,
                    translations: JSON.stringify(sendData),
                    shouldReturn: "yes",
                    currentPlan: currentPlan
                }),
            })
            let result = await storeLanguagesData.json();
            setLangData(result.data)
            setModalLoading(true)
        } catch (err) {
            console.log(err)
        }
    }

    let map = new Map();
    map.set("a", { val: 0 });
    map.get("a").val++;

    const langDataTable = langData.map(
        ({ lang_id, lang_name, url, type, url_id, translations },) => [
            <IndexTable.Row id={lang_id} key={lang_id} position={lang_id} >
                <IndexTable.Cell>  {map.get("a").val++}</IndexTable.Cell>
                <IndexTable.Cell>{url}</IndexTable.Cell>
                <IndexTable.Cell>{lang_name}</IndexTable.Cell>
                <IndexTable.Cell>
                    <div className='wf-store-btns'>
                        <Button onClick={() => handleEditModal(lang_id, url_id)}><Icon source={EditMajor} color="base" /></Button>
                        {
                            type !== "default" &&
                            <Button onClick={() => hanldleDeleteLang(lang_id, url_id)}><Icon source={DeleteMajor} tone="base" /></Button>
                        }
                        <div className='editBtn disable-app'>
                            <Button onClick={() => handleGoToLanguage(lang_id, type)} size='slim'>{myLanguage.editTranslations}</Button>
                        </div>
                    </div>
                </IndexTable.Cell>
            </IndexTable.Row>
        ],
    );

    const handleChange = useCallback(() => setActive(!active), [active]);

    const saveLanguageAndUrl = async (data, idValue = "") => {

        if (idValue && idValue.nativeEvent) {
            idValue = null;
        }
        const { domain, shopName } = shopData;
        setSmaalLoader(true)

        if (currentPlan > 2) {
            const { urlValue, typeOfUrl, storeFrontLanguage } = data

            let url = typeOfUrl === "type3" ? urlValue :
                typeOfUrl === "type1"
                    ? `https://${domain}${urlValue !== "" ? `/${urlValue}` : ""}/`
                    : `https://${urlValue !== "" ? `${urlValue}.` : ""}${domain}/`;

            const ifTypeOfUrl = urlValue.endsWith('/') ? true : urlValue.startsWith('/') ? true : false
            // console.log("ifTypeOfUrl", ifTypeOfUrl)


            if (typeOfUrl === "type3") {
            } else {
                if (ifTypeOfUrl) {
                    setSmaalLoader(false)
                    return Swal.fire({
                        icon: "error",
                        title: myLanguage.errorValue,
                        text: myLanguage.slashError,
                        confirmButtonText: myLanguage.swalOk
                    });
                }
            }

            if (!storeFrontLanguage || !typeOfUrl) {
                setSmaalLoader(false)
                return Swal.fire({
                    icon: "error",
                    title: myLanguage.errorValue,
                    text: myLanguage.selectAllFields,
                    confirmButtonText: myLanguage.swalOk
                });
            }

            try {
                const matchFound = idValue !== null ? langData.some(obj => obj.url === url && obj.url_id !== urlId) : langData.some(item => item.url === url);

                if (matchFound) {
                    setSmaalLoader(false)
                    return Swal.fire({
                        icon: "error",
                        title: myLanguage.errorValue,
                        text: myLanguage.chooseDifferentLang,
                        confirmButtonText: myLanguage.swalOk
                    });
                }

                const newData = await updateLang(storeFrontLanguage, "no");
                if (!urlValue) {
                    await saveDataInMeta(newData)
                }
                const response = await fetch(`${serverURL}/premium-store-languages-data`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        shopName,
                        languageName: storeFrontLanguage,
                        url,
                        translations: JSON.stringify(newData).replace(/'/g, '~'),
                        id: idValue,
                        type: urlValue ? "custom" : "default",
                        urlId: urlId
                    }),
                });

                const results = await response.json();
                setActive(!active);
                setActiveId(null)
                setUrlId(null)
                await fetchData(shopData);
                setSmaalLoader(false)
                reset();
            } catch (error) {
                console.error(error);
            }
        } else {
            await updateAndSaveData(data, shopName, idValue)
            setSmaalLoader(false)
        }
    };


    async function updateAndSaveData(data, shopName, idValue) {
        const { storeFrontLanguage } = data;
        const newData = await updateLang(storeFrontLanguage, "no");

        if (currentPlan < 3) {
            await saveDataInMeta(newData)
        }

        const response = await fetch(`${serverURL}/basic-store-languages-data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                shopName,
                languageName: storeFrontLanguage,
                translations: JSON.stringify(newData),
                id: idValue
            }),
        });
        const results = await response.json();
        setActive(!active);
        setActiveId(null)
        await fetchData(shopData);
        reset();
    }

    async function handleGoToLanguage(id, type) {
        searchParams.set("language_id", id)
        searchParams.set("type", type)
        id !== undefined && navigate({ search: `?${searchParams.toString()}` });
        await getDataFromDB(id)
    }

    async function hanldleDeleteLang(id, urlId) {
        try {
            Swal.fire({
                title: myLanguage.swalDeleteHeading,
                text: myLanguage.swalDeleteText,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#f54542",
                cancelButtonColor: "#3085d6",
                cancelButtonText: myLanguage.swalButtonCancelText,
                confirmButtonText: myLanguage.swalDeleteConfirm,
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const userDatas = await fetch(`${serverURL}/delete/store-languages-data`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            shopName: shopData.shopName,
                            id: id,
                            urlId: urlId
                        }),
                    })
                    let results = await userDatas.json();
                    await fetchData(shopData)
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

    async function handleEditModal(id, urlId) {
        try {
            setActiveId(id)
            setUrlId(urlId)
            currentPlan < 3 && setShouldShow("no")
            const { domain } = shopData
            const resetData = langData.filter(item => item.url_id === urlId)

            if (currentPlan > 2) {
                let isSameDomain = isUrlFromDomain(resetData[0].url, domain)
                // console.log("gggggg ", isSameDomain)

                const newUrl = resetData[0].url
                let urlWithoutProtocol = newUrl.replace(/^https:\/\//, '');
                let urlWithoutDomain = urlWithoutProtocol.replace(domain, '');
                // let remainingPart = urlWithoutDomain.replace(/[^a-zA-Z]/g, '');
                let remainingPart = urlWithoutDomain.replace(/[/.]/g, '');
                const isAtEnd = newUrl.endsWith('/' + remainingPart + '/');
                reset({
                    typeOfUrl: isSameDomain === false ? "type3" : (remainingPart !== "" && isAtEnd) ? "type1" : remainingPart === "" ? "type1" : "type2",
                    urlValue: remainingPart,
                    storeFrontLanguage: resetData[0].lang_name
                })
            } else {
                reset({
                    storeFrontLanguage: resetData[0].lang_name
                })
            }
            setActive(!active)
        } catch (error) {
            console.log(error)
        }
    }

    function isUrlFromDomain(url, domain) {
        try {
            const urlObj = new URL(url);
            // Remove 'www.' if present and compare
            const urlHost = urlObj.hostname.replace(/^www\./, '');
            const domainToCheck = domain.replace(/^www\./, '');

            // Check if the URL's host ends with the domain (including subdomains)
            return (
                urlHost === domainToCheck ||
                urlHost.endsWith(`.${domainToCheck}`)
            );
        } catch (e) {
            console.error("Invalid URL:", e);
            return false;
        }
    }

    async function updateLanguageAndUrl(data) {
        saveLanguageAndUrl(data, activeId)
    }

    const handleGoToPlan = () => {
        // window.top.location.href = `https://${shopData.domain}/admin/apps/${appName}/PricingPlan`;

        navigate({
            pathname: `/PricingPlan`,
            search: ``
        })
    }

    function renderBtn() {
        let obj = {}
        if (currentPlan < 3) {
            if (activeId !== null) {
                obj.text = myLanguage.updateBtn,
                    obj.handle = handleSubmit(updateLanguageAndUrl)
            } else {
                obj.text = myLanguage.upgradeToPro,
                    obj.handle = handleGoToPlan
            }
        } else {
            if (activeId !== null) {
                obj.text = myLanguage.updateBtn,
                    obj.handle = handleSubmit(updateLanguageAndUrl)
            } else {
                obj.text = myLanguage.saveBtn,
                    obj.handle = handleSubmit(saveLanguageAndUrl)
            }
        }
        return obj
    }

    return (
        <div className='wf-dashboard-report lang-switcher'>
            <div className='customer-recently-table'>
                {
                    !modalLoading
                        ? <div style={{ textAlign: 'center' }}><Spinner accessibilityLabel="Spinner example" size="large" />
                        </div>
                        :
                        <div className='wf-listingRecord-inner'>
                            <div className='language-switcher-table disable-app'>
                                <Text variant="headingLg" as="h2">{myLanguage.manageLanguagehd}</Text>
                                <Button onClick={() => {


                                    if (currentPlan === 3 && langData.length === 2) {
                                        return Swal.fire({
                                            icon: "warning",
                                            title: myLanguage.upgrade,
                                            text: myLanguage.langUpgradeSubText,
                                            confirmButtonText: myLanguage.langUpgrade,
                                            preConfirm: () => {
                                                navigate({
                                                    pathname: "/PricingPlan",
                                                    search: ``
                                                })
                                            }
                                        });
                                    }
                                    setActiveId(null),
                                        setUrlId(null),
                                        setShouldShow("yes"),
                                        setActive(!active), reset({
                                            typeOfUrl: "type1",
                                            urlValue: "",
                                            storeFrontLanguage: "english"
                                        })
                                }}>{myLanguage.addBtn}</Button>
                            </div>
                            <LegacyCard>
                                <IndexTable
                                    itemCount={langData.length}
                                    selectable={false}
                                    headings={[
                                        { title: myLanguage.tableSrno },
                                        { title: myLanguage.urlValue },
                                        { title: myLanguage.languageName },
                                        { title: myLanguage.actions },
                                    ]}
                                >
                                    {langDataTable}
                                </IndexTable>
                            </LegacyCard>
                        </div>
                }
            </div>

            <div className='lang-modal'>
                <Modal
                    open={active}
                    onClose={handleChange}
                    title={activeId === null ? myLanguage.langModalHd : myLanguage.updateLangModalHd}
                    primaryAction={{
                        content: smallLoader ? <Spinner accessibilityLabel="Spinner example" size="small" /> : renderBtn().text,
                        onAction: smallLoader ? <Spinner accessibilityLabel="Spinner example" size="large" /> : renderBtn().handle,
                    }}
                >
                    <p style={{ padding: '0 20px' }}>{myLanguage.langModalHdSubheading}</p>
                    <Modal.Section>
                        <form>
                            <div className='wf-style-wishbtn wf-language-modal'>
                                {
                                    (currentPlan < 3 && activeId === null) &&
                                    <div className='wf-dashboard-plane'>
                                        <div className='note-div'>
                                            <span>{myLanguage.noteHeading} </span>
                                            <Text variant="headingXs" as="h2"> {myLanguage.availableInPro}</Text>
                                        </div>
                                    </div>
                                }
                                {
                                    (currentPlan > 2 || shouldShow === "yes") &&
                                    <>

                                        <div className='wf-language-main-btn'>
                                            <div className='wf-language-url-btn'>
                                                <Text variant="headingMd" as="h2">{myLanguage.urlTypeHd}</Text>


                                                <div className='lang-radio-btn'>
                                                    <SingleFieldController
                                                        name="typeOfUrl"
                                                        control={control}>
                                                        {({ field }) =>
                                                            <RadioButton
                                                                label={<span>https://yourdomain.com/<b>XX</b></span>}
                                                                value="type1"
                                                                checked={field.value === "type1"}
                                                                onChange={() => field.onChange("type1")}
                                                            />
                                                        }
                                                    </SingleFieldController>

                                                    <SingleFieldController
                                                        name="typeOfUrl"
                                                        control={control}>
                                                        {({ field }) =>
                                                            <RadioButton
                                                                label={<span>https://<b>XX</b>.yourdomain.com</span>}
                                                                value="type2"
                                                                checked={field.value === "type2"}
                                                                onChange={() => field.onChange("type2")}
                                                            />
                                                        }
                                                    </SingleFieldController>


                                                    <SingleFieldController
                                                        name="typeOfUrl"
                                                        control={control}>
                                                        {({ field }) =>
                                                            <RadioButton
                                                                label={<span>{myLanguage.addCustomDomain}</span>}
                                                                value="type3"
                                                                checked={field.value === "type3"}
                                                                onChange={() => field.onChange("type3")}
                                                            />
                                                        }
                                                    </SingleFieldController>

                                                </div>

                                            </div>
                                            {
                                                watchAllFields.typeOfUrl === "type3" ? "" :
                                                    watchAllFields.typeOfUrl === "type1" ?
                                                        <img src={mainDomain} alt="url_image" />
                                                        :
                                                        <img src={subDomain} alt="url_image" />
                                            }
                                        </div>

                                        <div>

                                            <Text variant="headingMd" as="h2">{myLanguage.urlValue}</Text>

                                            <SingleFieldController
                                                name="urlValue"
                                                control={control}>
                                                {({ field }) =>

                                                    watchAllFields.typeOfUrl === "type3" ?
                                                        <div style={{ width: "500px" }}>
                                                            <TextField
                                                                value={field.value}
                                                                onChange={(value) => {
                                                                    field.onChange(value)
                                                                }}
                                                            />
                                                        </div>
                                                        :
                                                        watchAllFields.typeOfUrl === "type1"
                                                            ?
                                                            <div className='urlField'>https://{shopData.domain}/
                                                                <TextField
                                                                    value={field.value}
                                                                    onChange={(value) => {
                                                                        field.onChange(value)
                                                                    }}
                                                                />
                                                            </div>
                                                            : <div className='urlField'>https://
                                                                <TextField
                                                                    value={field.value}
                                                                    onChange={(value) => {
                                                                        field.onChange(value)
                                                                    }}
                                                                />.{shopData.domain}
                                                            </div>

                                                }
                                            </SingleFieldController>
                                        </div>
                                    </>
                                }

                                <div>

                                    <Text variant="headingMd" as="h2">{myLanguage.selectLangHd}</Text>

                                    <SingleFieldController name="storeFrontLanguage" control={control}  >
                                        {({ field }) => <Select
                                            options={languageTypes}
                                            value={field.value}
                                            onChange={(value) => field.onChange(value)}
                                        />}
                                    </SingleFieldController>
                                    <div style={{ textAlign: "left" }}>
                                        <p>{myLanguage.selectBottomText}</p>
                                        <p>{myLanguage.selectBottomText2}</p>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Modal.Section>
                </Modal>
            </div >
        </div >
    )
}

export default LanguageSwitcher2;

