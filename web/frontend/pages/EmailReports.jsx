import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import SkeletonPage1 from './SkeletonPage1';
import { Button, DatePicker, Frame, IndexFilters, IndexFiltersMode, IndexTable, LegacyCard, Modal, Page, Pagination, Select, Spinner, Text, useSetIndexFiltersMode } from '@shopify/polaris';
import useUtilityFunction from '../hooks/useUtilityFunction';
import { useLocation, useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import moment from 'moment-js';
import { Constants } from '../../backend/constants/constant';
import useAppMetafield from '../hooks/useAppMetafield';
import Footer from './Footer';

const EmailReports = () => {
    const ShopApi = useApi();
    const { serverURL } = Constants;
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search.trim());
    const checkCurrentPage = searchParams.get('pagenumber') || 1;
    const [shopData, setShopData] = useState();
    const Navigate = useNavigate();
    const listPerPage = 25;
    const [isloading, setIsLoading] = useState(false);
    const [loaderMain, setLoaderMain] = useState(false);
    const [emailType, setEmailType] = useState("All")
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
    const [emailQuota, setEmailQuota] = useState("");
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
        { label: myLanguage.priceDrop, value: 'Price Drop' },
        { label: myLanguage.lowInStock, value: 'Low In Stock' },
        { label: myLanguage.backInStock, value: 'Back In Stock' },
        { label: myLanguage.weeklyEmail, value: 'Monthly Email' },
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

    // console.log("emailQuota -- ", emailQuota)

    useEffect(() => {
        useEffectLite();
    }, [])

    async function useEffectLite() {
        const getCurrentPlan = await appMetafield.getCurrentPlan();
        // const planValue = parseInt(getCurrentPlan.currentPlan)
        setCurrentPlan(parseInt(getCurrentPlan.currentPlan))
        // planValue < 3 && setIsLoading(true)
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
            emailType: emailType,
            isDates: checkCurrentOptions !== "all",
            isType: emailType !== "All",
        };
        await checkGetAllItem(requestBody);
        await getMonthlyEmailQuota(shopApi);
    }

    async function getMonthlyEmailQuota(shopApi) {
        let dateValue = thisMonth();
        const requestBodyForMonthly = {
            shopName: shopApi.shopName,
            startDate: dateValue.startDay,
            endDate: dateValue.endDay,
            emailType: "All",
            isDates: true,
            isType: false,
        };
        try {
            const userData = await fetch(`${serverURL}/get-email-reports-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBodyForMonthly),
            })
            let result = await userData.json();
            setEmailQuota(`${result.mainResult.length}/${result.emailQuota[0].email_quota}`)
        } catch (error) {
            console.log("ERR : ", error)
        }
    }

    async function checkGetAllItem(requestBody) {
        try {
            const userData = await fetch(`${serverURL}/get-email-reports-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            })
            let result = await userData.json();
            totalRecords.current = result.mainResult.length;

            // console.log("result.mainResult.length ---", result.mainResult.length);
            // console.log("result.mainResult ", result.emailQuota[0].email_quota)

            // setEmailQuota(`${result.mainResult.length}/${result.emailQuota[0].email_quota}`)

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

        if (queryValue) {
            filteredData = mainData.filter((item) => {
                const createDate = item.date.split('T')[0];

                return item.user_email.toLowerCase().includes(queryValue.toLowerCase()) ||
                    item.subject.toLowerCase().includes(queryValue.toLowerCase()) ||
                    createDate.toLowerCase().includes(queryValue.toLowerCase())
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
        ({ id, email_type, subject, date, user_email, clicks },) => [
            <IndexTable.Row id={id} key={id} position={id} >
                <IndexTable.Cell>  {map.get("a").val++}</IndexTable.Cell>
                <IndexTable.Cell><div className='show-less-text' >{user_email}</div></IndexTable.Cell>
                <IndexTable.Cell>{email_type}</IndexTable.Cell>
                <IndexTable.Cell>{subject}</IndexTable.Cell>
                <IndexTable.Cell>{extractedDateAndTime(date)}</IndexTable.Cell>
                <IndexTable.Cell>{clicks}</IndexTable.Cell>
            </IndexTable.Row>
        ],
    );

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

    const handleEmailType = async (value) => {
        setEmailType(value)
        let startDate = moment(new Date(selectedDates.start)).format("YYYY-MM-DD");
        let endDate = moment(new Date(selectedDates.end)).format("YYYY-MM-DD");

        let requestBody = {
            shopName: shopData.shopName,
            startDate: startDate,
            endDate: endDate,
            emailType: value,
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
            searchParams.set('pagenumber', checkCurrentPage);
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
                requestBody.emailType = emailType,
                    requestBody.isDates = true,
                    requestBody.isType = emailType !== "All"
            } else {
                setCheckCurrentOptions("all")
                requestBody.isDates = false
            }

            await checkGetAllItem(requestBody)
            searchParams.set('pagenumber', checkCurrentPage);
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
            emailType: emailType,
            isDates: true,
            isType: emailType !== "All"
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
        searchParams.set("pagenumber", newPage, currentPage)
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
                    <Page fullWidth title={myLanguage.emailReportsHeading} subtitle={myLanguage.emailReportsSubHeading} >
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
                            currentPlan < 3
                                ? <div className='wf-style-wishbtn wf-reportDiv'>
                                    <div className='editBtn disable-app'>
                                        <Text variant="headingLg" as="h2">This feature is only available in the pro plan. Please upgrade your plan</Text>
                                        <Button onClick={handleGoToPlan}>{myLanguage.upgradeToPro}</Button>
                                    </div>
                                </div>
                                :
                                <div className='wf-style-wishbtn'>
                                    <div className='wf-listingRecord'>
                                        <div className='wf-listingRecord-inner'>
                                            <Text variant="headingLg" as="h2">{myLanguage.emailReportsHeading}</Text>
                                            <p>{myLanguage.emailReportsSubHeading}</p>
                                        </div>

                                        <div className='datePerRecord2'>
                                            <div className='wf-listingRecord-inner monthly-email-quota'>
                                                <Text variant="headingLg" as="h2">{myLanguage.monthlyEmailQuota}</Text>
                                                <div className='email-quota-field'>
                                                    <Text variant="heading2xl" as="h3"> {emailQuota === "" ? myLanguage.loadingText : emailQuota}</Text>
                                                </div>
                                            </div>
                                            <div className='wf-listingRecord-inner'>
                                                <Text variant="headingLg" as="h2">{myLanguage.emailTypes}</Text>
                                                <Select
                                                    options={options}
                                                    onChange={handleEmailType}
                                                    value={emailType}
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
                                                            { title: myLanguage.emailValue },
                                                            { title: myLanguage.emailTypes },
                                                            { title: myLanguage.emailSubject },
                                                            { title: myLanguage.emailDate },
                                                            { title: myLanguage.clicks },
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
                                                            label={`${myLanguage.emails}: ${totalRecords.current} `}
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

export default EmailReports;