
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
    Page, Spinner, LegacyCard, IndexTable, Pagination, Button, Modal, Text, Icon, Select,
    IndexFilters,
    useSetIndexFiltersMode,
    IndexFiltersMode, DatePicker
} from '@shopify/polaris';
import Swal from "sweetalert2";
import { ViewMajor } from '@shopify/polaris-icons';
import useAppMetafield from '../../../hooks/useAppMetafield';
import useApi from '../../../hooks/useApi';
import useUtilityFunction from '../../../hooks/useUtilityFunction';
import { useLocation, useNavigate } from 'react-router-dom';
import { Constants } from '../../../../backend/constants/constant';
import moment from 'moment-js';


const RevenueData = ({ myLanguage, requestBody, selectedValue, selectedOption, options, setIsCount, shopCurrency, getMainCurr }) => {
    const { serverURL } = Constants;
    const Navigate = useNavigate();
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search.trim());
    const selectedData = searchParams.get('selectedData') || 'all';
    const listPg = searchParams.get('rpr') || 10;
    const pageNumber = searchParams.get('pagenumber') || 1;
    const [checkDatePicker, setCheckDatePicker] = useState(false)
    const [listingPerPage, setListingPerPage] = useState(listPg);
    const appMetafield = useAppMetafield();
    const ShopApi = useApi();
    const utilityFunction = useUtilityFunction();
    const [userList, setUserList] = useState([]);
    const [userWishlist, setUserWishlist] = useState([]);
    const [cartList, setCartList] = useState([]);
    const [username, setUsername] = useState("");
    const [active, setActive] = useState(false);
    const [wishlistTextDirection, setWishlistTextDirection] = useState("");
    const [loaderMain, setLoaderMain] = useState(false);
    const totalRecords = useRef(0);
    const [queryValue, setQueryValue] = useState('');
    const [isClicked, setIsClicked] = useState(false);
    const [mainData, setMainData] = useState([]);
    const [currentPage, setCurrentPage] = useState(pageNumber)
    const [checkCurrentOptions, setCheckCurrentOptions] = useState(selectedValue);
    const startIndexValue = useRef({ start: null, end: null });
    const [sortSelected, setSortSelected] = useState(['date desc']);

    useEffect(() => {
        useEffectLite();
    }, []);

    async function useEffectLite() {
        setLoaderMain(!loaderMain);
        if (searchParams.get('selectedData') === undefined || searchParams.get('selectedData') === "undefined") {
            searchParams.set('selectedData', selectedData);
            Navigate({ search: `?${searchParams.toString()}` });
        }
        const checkCurrentPage = searchParams.get('pagenumber') || 1;
        if (searchParams.get('selectedData') === null || searchParams.get('pagenumber') === null) {
            searchParams.append('pagenumber', checkCurrentPage);
            searchParams.append('selectedData', selectedData);
            searchParams.append('rpr', listPg);
            Navigate({ search: `?${searchParams.toString()}` });
        }
        await utilityFunction.getPlanFirst();
        getAllAppDataMetafields();
        await checkGetAllItem(requestBody)
        setLoaderMain(loaderMain);
    }


    async function checkGetAllItem(res) {
        try {
            const userData = await fetch(`${serverURL}/get-wishlist-cart-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(res),
            })
            let result = await userData.json();
            totalRecords.current = result.mainResult.length;
            if (result.mainResult.length === 0) {
                setUserList(result.mainResult);
                setMainData(result.mainResult);
                setIsCount(0)
            } else {
                const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage);
                setMainData(result.mainResult);
                setUserList(result.mainResult.slice(startIndex, endIndex));
                const total = result.mainResult.reduce((acc, item) => acc + (parseInt(item.total_quantity) * parseInt(item.price)), 0);
                setIsCount(total)
            }
            setLoaderMain("")
            Swal.close();
        } catch (error) {
            console.log("errr ", error)
        };
    }

    const sortOptions = [
        { label: 'Date', value: 'date asc', directionLabel: 'Ascending' },
        { label: 'Date', value: 'date desc', directionLabel: 'Descending' },
    ];

    const handleMonthChange = useCallback(
        (month, year) => {
            setDate({ month, year })
        },
        [],
    );

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
                return item.title.toLowerCase().includes(queryValue.toLowerCase()) ||
                    item.price.toString().includes(queryValue.toLowerCase()) ||
                    item.email.toLowerCase().includes(queryValue.toLowerCase()) ||
                    item.user_type.toLowerCase().includes(queryValue.toLowerCase())
            })
        }

        if (sortSelected.length > 0) {
            if (sortSelected[0] === 'date asc') {
                filteredData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            } else if (sortSelected[0] === 'date desc') {
                filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            } else {
                filteredData.sort((a, b) => b.cart_count - a.cart_count);
            }
        }

        return filteredData;
    }, [mainData, queryValue, sortSelected, isClicked, listingPerPage]);


    useEffect(() => {
        totalRecords.current = filteredAndSortedData.length;
        const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage);
        setUserList(filteredAndSortedData.slice(startIndex, endIndex));
    }, [filteredAndSortedData]);


    const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);

    const onHandleCancel = () => { };

    const handleSortChange = useCallback((value) => {
        setSortSelected(value)
        setIsClicked(!isClicked)
    }, []);

    const handleFiltersQueryChange = useCallback((value) => {
        setQueryValue(value)
        setIsClicked(!isClicked)
    }, []);

    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
    }, [
        handleQueryValueRemove,
    ]);

    async function getAllAppDataMetafields() {
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "general-setting") {
                let dData = JSON.parse(dataArray[i].node.value);
                setWishlistTextDirection(dData.wishlistTextDirection);
            };
        }
    };

    let map = new Map();
    map.set("a", { val: startIndexValue.current.start });
    map.get("a").val++;

    const [{ month, year }, setDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
    const [selectedDates, setSelectedDates] = useState({
        start: new Date(),
        end: new Date(),
    });

    const handlePagination = async (newPage) => {
        setCurrentPage(newPage);
        setIsClicked(!isClicked)
        const myParam = searchParams.get('selectedData');
        const listPg = searchParams.get('rpr');
        Navigate({
            pathname: "/Analytic/WishlistItem",
            search: `?pagenumber=${newPage}&selectedData=${myParam}&rpr=${listPg}`
        })
    };

    const viewHandler = async (id) => {
        Navigate({
            pathname: `/GetWishlistData/${id}`,
            search: `?wishlistitempageno=1&cartitempageno=1&rpr=10&wishlistdata=all`
        })
    }

    const userListTable = userList.map(
        ({ id, total_quantity, title, price, email, user_type, wishlist_user_id, created_at }, index,) => [

            <IndexTable.Row id={id} key={id} position={id} >
                <IndexTable.Cell>  {map.get("a").val++}</IndexTable.Cell>
                <IndexTable.Cell>{title}</IndexTable.Cell>
                <IndexTable.Cell>{total_quantity}</IndexTable.Cell>
                <IndexTable.Cell>{ShopApi.changeMoney(price * 100, getMainCurr(shopCurrency))}</IndexTable.Cell>
                <div className='show-less-text' ><IndexTable.Cell>{email}</IndexTable.Cell></div>
                <IndexTable.Cell>{user_type}</IndexTable.Cell>
                <IndexTable.Cell>{extractedDate(created_at)}</IndexTable.Cell>

                {/* <IndexTable.Cell><img src={image} alt='image' height="40px" width="40px" /></IndexTable.Cell> */}
                <IndexTable.Cell><Button onClick={() => viewHandler(wishlist_user_id)}><Icon source={ViewMajor} color="base" /></Button></IndexTable.Cell>

            </IndexTable.Row>
        ],
    );

    async function openPageHandler(handle) {
        const shopName = await ShopApi.shop();
        window.open(`https://${shopName.domain}/products/${handle}`, "_blank");
    };

    function dateFormater(date) {
        let returnDate = ``;
        let myDate = new Date(date).toLocaleDateString('en-US');
        let myTime = new Date(date).toLocaleTimeString('en-US');
        returnDate = `${myDate} ${myTime}`;
        return returnDate;
    };

    const selectedUsername = `${myLanguage.reportModalHeading} ${username}`;
    const selectedCartUsername = `${myLanguage.reportModalCartHeading} ${username}`;
    const totalItems = `${myLanguage.reportModalTotalItems} ${userWishlist.length}`;
    const totalCartItems = `${myLanguage.reportModalTotalItems} ${cartList.length}`;


    function getEmail(email) {
        if (email !== undefined) {
            const emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            const checkEmail = emailRegEx.test(email);
            if (checkEmail) {
                setUsername(email);
            } else {
                let guestStr = email.slice(0, 10);
                setUsername(`guest-${guestStr}`);
            }
        }
    };

    function recordPerPageFxn(value) {
        setListingPerPage(parseInt(value));
        setIsClicked(!isClicked)
        setCurrentPage(1)
    };

    // const options = [
    //     { label: '10', value: 10 },
    //     { label: '25', value: 25 },
    //     { label: '50', value: 50 },
    //     { label: '75', value: 75 },
    // ];

    // const selectedOption = [
    //     { label: "All", value: "all" },
    //     { label: myLanguage.selectValue1, value: JSON.stringify(today()) },
    //     { label: myLanguage.selectValue2, value: JSON.stringify(yesterday()) },
    //     { label: myLanguage.selectValue3, value: JSON.stringify(thisWeek()) },
    //     { label: myLanguage.selectValue4, value: JSON.stringify(lastWeek()) },
    //     { label: myLanguage.selectValue5, value: JSON.stringify(thisMonth()) },
    //     { label: myLanguage.selectValue6, value: JSON.stringify(lastMonth()) },
    // ];

    const selectDateHandler = async (value) => {
        if (value === "custom") {
            setActive(!active)
            setCheckCurrentOptions(value)
            setCheckDatePicker(!checkDatePicker)
            searchParams.set("selectedData", `all`)
            Navigate({ search: `?${searchParams.toString()}` });
        } else {
            setLoaderMain(!loaderMain);
            let val;
            const shopApi = await ShopApi.shop();
            let requestBody = {
                shopName: shopApi.shopName
            };

            if (value !== "all") {
                requestBody.startDate = JSON.parse(value).startDay;
                requestBody.endDate = JSON.parse(value).endDay;
                requestBody.checkStatusInItem = true
                let checkSelectedData = await checkCurrentSelectedValue(value)
                val = checkSelectedData
            } else {
                requestBody.checkStatusInItem = false
                val = value
            }
            await checkGetAllItem(requestBody)
            let checkSelectedDatas = await checkCurrentSelectedValue(value)

            setCheckCurrentOptions(value)
            searchParams.set("selectedData", value !== "all" ? `${checkSelectedDatas}` : 'all')
            // searchParams.set('rpr', reportPerPageData);
            searchParams.set('rpr', listPg);
            searchParams.set('pagenumber', listingPerPage);
            Navigate({ search: `?${searchParams.toString()}` });
            setLoaderMain(loaderMain);
        }
    };

    const checkCurrentSelectedValue = (checkOptions) => {
        let label;
        const todayString = JSON.stringify(today());
        const yesterdayString = JSON.stringify(yesterday());
        const thisWeekString = JSON.stringify(thisWeek());
        const lastWeekString = JSON.stringify(lastWeek());
        const thisMonthString = JSON.stringify(thisMonth());
        const lastMonthString = JSON.stringify(lastMonth());

        switch (checkOptions) {
            case todayString:
                label = myLanguage.selectValue1;
                break;
            case yesterdayString:
                label = myLanguage.selectValue2;
                break;
            case thisWeekString:
                label = myLanguage.selectValue3;
                break;
            case lastWeekString:
                label = myLanguage.selectValue4;
                break;
            case thisMonthString:
                label = myLanguage.selectValue5;
                break;
            case lastMonthString:
                label = myLanguage.selectValue6;
                break;
            default:
                break;
        }
        return label
    }

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

    function extractedDate(dateString) {
        const givenDateTime = new Date(dateString);
        const currentTime = new Date();
        const differenceMs = currentTime - givenDateTime;
        const differenceMinutes = Math.floor(differenceMs / (1000 * 60));
        const differenceHours = Math.floor(differenceMinutes / 60);
        const remainingMinutes = differenceMinutes % 60;
        const differenceDays = Math.floor(differenceHours / 24);
        const remainingHours = differenceHours % 24;
        const differenceMonths = Math.floor(differenceDays / 30); // Approximation for months
        const remainingDays = differenceDays % 30;
        let timeAgo = "";

        if (differenceMonths === 0) {
            if (differenceDays === 0) {
                if (differenceHours >= 1) {
                    timeAgo = remainingHours + (remainingHours === 1 ? " hour" : " hours") + " ago";
                } else {
                    timeAgo = remainingMinutes + " minute" + (remainingMinutes === 1 ? "" : "s") + " ago";
                }
            } else if (differenceDays === 1) {
                timeAgo = "1 day ago";
            } else {
                timeAgo = differenceDays + " days ago";
            }
        } else if (differenceMonths === 1) {
            if (remainingDays === 0) {
                timeAgo = "1 month ago";
            } else {
                timeAgo = "1 month and " + remainingDays + " days ago";
            }
        } else {
            if (remainingDays === 0) {
                timeAgo = differenceMonths + " months ago";
            } else {
                timeAgo = differenceMonths + " months and " + remainingDays + " days ago";
            }
        }
        return timeAgo;
    }

    const handleChange = useCallback(() => setActive(!active), [active]);

    const getDataWithDate = async () => {
        const shopApi = await ShopApi.shop();
        let startDate = moment(new Date(selectedDates.start)).format("YYYY-MM-DD");
        let endDate = moment(new Date(selectedDates.end)).format("YYYY-MM-DD");

        setActive(!active)
        let requestBody = {
            shopName: shopApi.shopName,
            startDate: startDate,
            endDate: endDate,
            checkStatusInItem: true

        };
        await checkGetAllItem(requestBody)
    }

    return (
        <div dir={wishlistTextDirection} className='wf-userReport'>
            <Page>
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

                <div className='wf-listingRecord'>
                    <div className='wf-listingRecord-inner'>
                        <Text variant="headingLg" as="h2">{myLanguage.revenueDataHeading}</Text>
                        <p>{myLanguage.revenueDataText}</p>
                    </div>
                    <div className='datePerRecord'>
                        <div className='wf-listingRecord-inner'>
                            <Text variant="headingLg" as="h2">{myLanguage.userListingRecordsPerPage}</Text>
                            <Select
                                options={options}
                                onChange={recordPerPageFxn}
                                value={listingPerPage}
                            />
                        </div>
                        <div className='wf-listingRecord-inner'>
                            <Text variant="headingLg" as="h2">{myLanguage.quickOverViewDate}</Text>
                            <Select options={selectedOption} onChange={selectDateHandler}
                                value={checkCurrentOptions}
                            />
                        </div>
                    </div>

                </div>
                <div className='customer-recently-table'>
                    {
                        loaderMain ?
                            <div style={{ textAlign: 'center' }}><Spinner accessibilityLabel="Spinner example" size="large" />
                            </div>
                            :
                            <LegacyCard>
                                <IndexFilters
                                    sortOptions={sortOptions}
                                    sortSelected={sortSelected}
                                    queryValue={queryValue}
                                    queryPlaceholder={myLanguage.revenuesearch}
                                    onQueryChange={handleFiltersQueryChange}
                                    onQueryClear={() => setQueryValue('')}
                                    onSort={handleSortChange}
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
                                    itemCount={userList.length}
                                    selectable={false}
                                    headings={[
                                        { title: myLanguage.tableSrno },
                                        { title: myLanguage.wishlistItemsItemName },
                                        { title: "Quantity" },
                                        { title: "Price" },
                                        { title: myLanguage.tableEmail },
                                        { title: myLanguage.tableUserType },
                                        { title: myLanguage.tableAccountCreated },
                                        { title: myLanguage.tableDetails },
                                    ]}
                                >
                                    {userListTable}
                                </IndexTable>
                                <div className='polaris_pagination datePerRecord-pagination'>
                                    <Pagination
                                        onPrevious={() => {
                                            handlePagination(parseInt(currentPage) - 1)
                                        }}
                                        onNext={() => {
                                            handlePagination(parseInt(currentPage) + 1)
                                        }}
                                        hasNext={startIndexValue.current.end < totalRecords.current}
                                        hasPrevious={currentPage > 1}
                                        label={`${myLanguage.totalheading} ${totalRecords.current} ${myLanguage.totalitems}`}
                                        accessibilityLabel="Pagination"
                                        nextTooltip="Next page"
                                        previousTooltip="Previous page"
                                        type="table"
                                    />
                                </div>
                            </LegacyCard>
                    }
                </div>
            </Page>
        </div>
    )
}

export default RevenueData