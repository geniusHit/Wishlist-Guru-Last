import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import SkeletonPage1 from './SkeletonPage1';
import { Button, DatePicker, Frame, IndexFilters, IndexFiltersMode, IndexTable, LegacyCard, Modal, Page, Pagination, Select, Spinner, Text, useSetIndexFiltersMode, Icon } from '@shopify/polaris';
import useUtilityFunction from '../hooks/useUtilityFunction';
import { useLocation, useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import moment from 'moment-js';
import { Constants } from '../../backend/constants/constant';
import useAppMetafield from '../hooks/useAppMetafield';
import Footer from './Footer';
import { ViewMajor } from '@shopify/polaris-icons';

const ShareStats = () => {
    const ShopApi = useApi();
    const { serverURL } = Constants;
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search.trim());
    const checkCurrentPage = searchParams.get('referreduserpageno') || 1;
    const [shopData, setShopData] = useState();
    const Navigate = useNavigate();
    const listPerPage = 10;
    const [isloading, setIsLoading] = useState(false);
    const [loaderMain, setLoaderMain] = useState(false);
    const [userType, setUserType] = useState("All")
    const [active, setActive] = useState(false);
    const [queryValue, setQueryValue] = useState('');
    const [myLanguage, setMyLanguage] = useState("");
    const [currentPage, setCurrentPage] = useState(checkCurrentPage);
    const [checkCurrentOptions, setCheckCurrentOptions] = useState("all");
    const startIndexValue = useRef({ start: null, end: null });
    const [mainData, setMainData] = useState([]);
    const [reportsData, setReportsData] = useState([]);
    const utilityFunction = useUtilityFunction();
    const totalRecords = useRef(0);
    const [currentPlan, setCurrentPlan] = useState();
    const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);
    const appMetafield = useAppMetafield();
    let map = new Map();
    map.set("a", { val: startIndexValue.current.start });
    map.get("a").val++;
    const [{ month, year }, setDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
    const [selectedDates, setSelectedDates] = useState({
        start: new Date(),
        end: new Date(),
    });

    const options = [
        { label: myLanguage.selectValue0, value: 'All' },
        { label: myLanguage.loginUsers, value: 'user' },
        { label: myLanguage.guestUsers, value: 'guest' }
    ];

    const selectedOption = [
        { label: myLanguage.selectValue0, value: "all" },
        { label: myLanguage.selectValue1, value: JSON.stringify(today()) },
        { label: myLanguage.selectValue2, value: JSON.stringify(yesterday()) },
        { label: myLanguage.selectValue3, value: JSON.stringify(thisWeek()) },
        { label: myLanguage.selectValue4, value: JSON.stringify(lastWeek()) },
        { label: myLanguage.selectValue5, value: JSON.stringify(thisMonth()) },
        { label: myLanguage.selectValue6, value: JSON.stringify(lastMonth()) },
        { label: myLanguage.selectValue7, value: "custom" },
    ];

    useEffect(() => {
        useEffectLite();
    }, [])

    async function useEffectLite() {
        const getCurrentPlan = await appMetafield.getCurrentPlan();
        setCurrentPlan(parseInt(getCurrentPlan.currentPlan))
        const shopApi = await ShopApi.shop();
        setShopData(shopApi)
        await utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
            setIsLoading(true);
            setLoaderMain(true)
        });

        const requestBody = {
            shopName: shopApi.shopName,
            startDate: "",
            endDate: "",
            userType: userType,
            isDates: checkCurrentOptions !== "all",
            isType: userType !== "All",
        };
        await checkGetAllItem(requestBody)
    }



    async function checkGetAllItem(requestBody) {
        try {
            const userData = await fetch(`${serverURL}/get-share-stats-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            })
            let result = await userData.json();
            totalRecords.current = result.mainResult.length;
            if (result.mainResult.length === 0) {
                setMainData(result.mainResult);
                setReportsData(result.mainResult)
            } else {
                const { startIndex, endIndex } = calculateIndexes(currentPage, listPerPage);
                setMainData(result.mainResult);
                setReportsData(result.mainResult.slice(startIndex, endIndex));
            }
        } catch (error) {
            console.log("errr ", error)
        };
    }

    function calculateIndexes(currentPage, listingPerPage) {
        const startIndex = (currentPage - 1) * parseInt(listingPerPage);
        const endIndex = startIndex + parseInt(listingPerPage);
        startIndexValue.current = { start: startIndex, end: endIndex }
        return { startIndex, endIndex };
    };

    const filteredAndSortedData = useMemo(() => {
        let searchedData = mainData.slice();
        let filteredData = searchedData;

        console.log("queryValue -- ", queryValue)

        if (queryValue) {
            filteredData = mainData.filter((item) => {
                // console.log("item", item)
                // const createDate = item?.date?.split('T')[0];
                const createDate = item?.created_at?.split('T')[0];
                const createDate2 = createDate.replace(/-/g, '/');
                const createDate3 = createDate2.split('/').reverse().join("/");

                // console.log("createDate -- ", createDate)
                // console.log("createDate2 -- ", createDate2)
                // console.log("createDate3 -- ", createDate3)

                return item.userEmail.toLowerCase().includes(queryValue.toLowerCase()) ||
                    item.user_type.toLowerCase().includes(queryValue.toLowerCase()) ||
                    createDate3.toLowerCase().includes(queryValue.toLowerCase())
            })
        }
        return filteredData;
    }, [mainData, queryValue, currentPage]);


    useEffect(() => {
        totalRecords.current = filteredAndSortedData.length;
        const { startIndex, endIndex } = calculateIndexes(currentPage, listPerPage);
        setReportsData(filteredAndSortedData.slice(startIndex, endIndex));
    }, [filteredAndSortedData]);


    const reportsDataTable = reportsData.map(
        ({ id, user_id, user_type, userEmail, url, facebook, twitter_x, whatsapp, instagram, linkedin, telegram, fb_messenger, created_at, email, clicks },) => [
            <IndexTable.Row id={id} key={id} position={id} >
                <IndexTable.Cell>  {map.get("a").val++}</IndexTable.Cell>
                <IndexTable.Cell><div className='show-less-text' >{userEmail}</div></IndexTable.Cell>
                <IndexTable.Cell>{user_type}</IndexTable.Cell>
                <IndexTable.Cell>{extractedDateAndTime(created_at)}</IndexTable.Cell>
                <IndexTable.Cell>{url}</IndexTable.Cell>
                <IndexTable.Cell>{email}</IndexTable.Cell>
                <IndexTable.Cell>{facebook}</IndexTable.Cell>
                <IndexTable.Cell>{twitter_x}</IndexTable.Cell>
                <IndexTable.Cell>{whatsapp}</IndexTable.Cell>
                <IndexTable.Cell>{instagram}</IndexTable.Cell>
                <IndexTable.Cell>{telegram}</IndexTable.Cell>
                <IndexTable.Cell>{linkedin}</IndexTable.Cell>
                <IndexTable.Cell>{fb_messenger}</IndexTable.Cell>
                <IndexTable.Cell>{clicks}</IndexTable.Cell>
                <IndexTable.Cell><Button onClick={() => viewHandler(user_id)}><Icon source={ViewMajor} color="base" /></Button></IndexTable.Cell>
            </IndexTable.Row>
        ],
    );

    const viewHandler = async (id) => {
        localStorage.setItem("uId", id)
        Navigate({
            pathname: "/getShareStatsData/ReferredUser",
            search: `?id=${id}&referreduserpageno=1&rpr=10&userdata=all`
        })
    }

    const handleFiltersQueryChange = useCallback((value) => {
        setQueryValue(value)
    }, []);

    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
    }, [
        handleQueryValueRemove,
    ]);

    const onHandleCancel = () => { };

    const handleUserType = async (value) => {
        setUserType(value)
        let startDate = moment(new Date(selectedDates.start)).format("YYYY-MM-DD");
        let endDate = moment(new Date(selectedDates.end)).format("YYYY-MM-DD");

        let requestBody = {
            shopName: shopData.shopName,
            startDate: startDate,
            endDate: endDate,
            userType: value,
            isDates: checkCurrentOptions !== "all",
            isType: value !== "All"
        };
        await checkGetAllItem(requestBody)
    }

    const handleChange = useCallback(() => setActive(!active), [active]);

    const selectDateHandler = async (value) => {
        if (value === "custom") {
            setActive(!active)
            setCheckCurrentOptions(value)
            searchParams.set('referreduserpageno', checkCurrentPage);
            Navigate({ search: `?${searchParams.toString()}` });
        } else {
            setLoaderMain(!loaderMain);
            const shopApi = await ShopApi.shop();
            let requestBody = {
                shopName: shopApi.shopName
            };

            if (value !== "all") {
                setCheckCurrentOptions(value)
                requestBody.startDate = JSON.parse(value).startDay;
                requestBody.endDate = JSON.parse(value).endDay;
                requestBody.userType = userType,
                    requestBody.isDates = true,
                    requestBody.isType = userType !== "All"
            } else {
                setCheckCurrentOptions("all")
                requestBody.isDates = false
            }
            await checkGetAllItem(requestBody)
            searchParams.set('referreduserpageno', checkCurrentPage);
            Navigate({ search: `?${searchParams.toString()}` });
            setLoaderMain(loaderMain);
        }
    };

    // -----------------function for the date selection-----------------
    function today() {
        return {
            startDay: moment(new Date()).format("YYYY-MM-DD"),
            endDay: moment(new Date()).format("YYYY-MM-DD")
        }
    };

    function yesterday() {
        var date = new Date();
        date.setDate(date.getDate() - 1);
        return {
            startDay: moment(date).format("YYYY-MM-DD"),
            endDay: moment(date).format("YYYY-MM-DD")
        }
    };

    function thisWeek() {
        var date = new Date();
        var day = date.getDay();
        var prevMonday = new Date();
        if (date.getDay() == 0) {
            prevMonday.setDate(date.getDate() - 7);
        }
        else {
            prevMonday.setDate(date.getDate() - (day - 1));
        }
        return {
            startDay: moment(prevMonday).format("YYYY-MM-DD"),
            endDay: moment(new Date()).format("YYYY-MM-DD")
        }
    };


    function lastWeek() {
        var beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000);
        var day = beforeOneWeek.getDay();
        var diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1);
        var firstday = new Date(beforeOneWeek.setDate(diffToMonday));
        var lastday = new Date(beforeOneWeek.setDate(diffToMonday + 6));
        return {
            startDay: moment(firstday).format("YYYY-MM-DD"),
            endDay: moment(lastday).format("YYYY-MM-DD")
        }
    }

    function thisMonth() {
        var date = new Date();
        var firstday = new Date(date.getFullYear(), date.getMonth(), 1);
        return {
            startDay: moment(firstday).format("YYYY-MM-DD"),
            endDay: moment(new Date()).format("YYYY-MM-DD")
        }
    };

    function lastMonth() {
        var date = new Date();
        var firstday = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        var lastday = new Date(date.getFullYear(), date.getMonth(), 0);
        return {
            startDay: moment(firstday).format("YYYY-MM-DD"),
            endDay: moment(lastday).format("YYYY-MM-DD")
        }
    };

    const handleMonthChange = useCallback(
        (month, year) => {
            setDate({ month, year })
        },
        [],
    );

    const getDataWithDate = async () => {
        let startDate = moment(new Date(selectedDates.start)).format("YYYY-MM-DD");
        let endDate = moment(new Date(selectedDates.end)).format("YYYY-MM-DD");

        setActive(!active)
        let requestBody = {
            shopName: shopData.shopName,
            startDate: startDate,
            endDate: endDate,
            userType: userType,
            isDates: true,
            isType: userType !== "All"
        };
        await checkGetAllItem(requestBody)
    }

    function extractedDateAndTime(dateValue) {
        const dateObj = new Date(dateValue);
        const date = dateObj.toLocaleDateString('en-GB');
        const time = dateObj.toLocaleTimeString('en-GB', { hour12: false });
        return `${date} ${time}`
    }

    const handlePagination = async (newPage) => {
        setCurrentPage(newPage);
        searchParams.set("referreduserpageno", newPage, currentPage)
        Navigate({ search: `?${searchParams.toString()}` });
    };

    const handleGoToPlan = () => {
        Navigate({
            pathname: `/PricingPlan`,
            search: ``
        })
    }

    return (
        <div className='wf-dashboard wf-dashboard-report wf-email-reports'>
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    <Page fullWidth title={myLanguage.shareStats} subtitle={myLanguage.shareStatsSubHeading} >
                        <Modal
                            open={active}
                            onClose={handleChange}
                            title={myLanguage.specificDateDataHeading}
                            primaryAction={{
                                content: myLanguage.sddSubmitDate,
                                onAction: getDataWithDate,
                            }}

                        >
                            <Modal.Section>
                                <DatePicker
                                    month={month}
                                    year={year}
                                    onChange={setSelectedDates}
                                    onMonthChange={handleMonthChange}
                                    selected={selectedDates}
                                    allowRange
                                />
                            </Modal.Section>

                        </Modal>
                        {
                            currentPlan < 4
                                ? <div className='wf-style-wishbtn wf-reportDiv'>
                                    <div className='editBtn disable-app'>
                                        <Text variant="headingLg" as="h2">{myLanguage.reportUpgradeHeading}</Text>
                                        <Button onClick={handleGoToPlan}>{myLanguage.langUpgrade}</Button>
                                    </div>
                                </div>
                                :
                                <div className='wf-style-wishbtn'>
                                    <div className='wf-listingRecord'>
                                        <div className='wf-listingRecord-inner'>
                                            <Text variant="headingLg" as="h2">{myLanguage.shareStats}</Text>
                                            <p>{myLanguage.shareStatsSubHeading}</p>
                                        </div>

                                        <div className='datePerRecord'>
                                            <div className='wf-listingRecord-inner'>
                                                <Text variant="headingLg" as="h2">{myLanguage.userTypes}</Text>
                                                <Select
                                                    options={options}
                                                    onChange={handleUserType}
                                                    value={userType}
                                                />
                                            </div>
                                            <div className='wf-listingRecord-inner'>
                                                <Text variant="headingLg" as="h2">{myLanguage.quickOverViewDate}</Text>
                                                <Select
                                                    options={selectedOption}
                                                    onChange={selectDateHandler}
                                                    value={checkCurrentOptions}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className='customer-recently-table'>
                                        {
                                            !loaderMain ?
                                                <div style={{ textAlign: 'center', minHeight: '300px', display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <span style={{ margin: "auto" }}>
                                                        <Spinner accessibilityLabel="Spinner example" size="large" />
                                                    </span>
                                                </div>
                                                :
                                                <LegacyCard>
                                                    <IndexFilters
                                                        queryValue={queryValue}
                                                        queryPlaceholder={myLanguage.revenuesearch}
                                                        onQueryChange={handleFiltersQueryChange}
                                                        onQueryClear={() => setQueryValue('')}
                                                        cancelAction={{
                                                            onAction: onHandleCancel,
                                                            disabled: false,
                                                            loading: false,
                                                        }}
                                                        tabs={[]}
                                                        filters={[]}
                                                        onClearAll={handleFiltersClearAll}
                                                        mode={mode}
                                                        setMode={setMode}
                                                    />
                                                    <IndexTable
                                                        itemCount={reportsData.length}
                                                        selectable={false}
                                                        headings={[
                                                            { title: myLanguage.tableSrno },
                                                            { title: myLanguage.tableEmail },
                                                            { title: myLanguage.userTypes },
                                                            { title: myLanguage.emailDate },
                                                            { title: myLanguage.url },
                                                            { title: myLanguage.emailValue },
                                                            { title: myLanguage.facebookCheckIconText },
                                                            { title: myLanguage.twitterCheckIconText },
                                                            { title: myLanguage.whatsappCheckIconText },
                                                            { title: myLanguage.instagramCheckIconText },
                                                            { title: myLanguage.telegramCheckIconText },
                                                            { title: myLanguage.linkedinCheckIconText },
                                                            { title: myLanguage.fbMessengerCheckIconText },
                                                            { title: myLanguage.clicks },
                                                            { title: myLanguage.seeDetails },
                                                        ]}
                                                    >
                                                        {reportsDataTable}
                                                    </IndexTable>
                                                    <div className='polaris_pagination'>
                                                        <Pagination
                                                            onPrevious={() => {
                                                                handlePagination(parseInt(currentPage) - 1)
                                                            }}
                                                            onNext={() => {
                                                                handlePagination(parseInt(currentPage) + 1)
                                                            }}
                                                            hasNext={startIndexValue.current.end < totalRecords.current}
                                                            hasPrevious={currentPage > 1}
                                                            label={`${myLanguage.tab0heading}: ${totalRecords.current} `}
                                                            accessibilityLabel="Pagination"
                                                            nextTooltip={myLanguage.nextTooltip}
                                                            previousTooltip={myLanguage.prevToolTip}
                                                            type="table"
                                                        />
                                                    </div>
                                                </LegacyCard>
                                        }
                                    </div>
                                </div>
                        }

                        <div style={{ marginTop: "40px" }}>
                            <Footer myLanguage={myLanguage} />
                        </div>
                    </Page>
                </Frame>
            }
        </div >
    )
}

export default ShareStats;