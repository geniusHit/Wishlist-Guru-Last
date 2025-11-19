
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Page, Spinner, LegacyCard, IndexTable, Pagination, Button, Text, Icon, Select, IndexFilters, Modal, useSetIndexFiltersMode, IndexFiltersMode, DatePicker } from '@shopify/polaris';
import { ViewMajor } from '@shopify/polaris-icons';
import useAppMetafield from '../../../hooks/useAppMetafield';
import useApi from '../../../hooks/useApi';
import useUtilityFunction from '../../../hooks/useUtilityFunction';
import { useLocation, useNavigate } from 'react-router-dom';
import { Constants } from '../../../../backend/constants/constant';
import moment from 'moment-js';

const ReferredUserData = ({ myLanguage, requestBody, selectedValue, selectedOption, options, setIsCount }) => {
    const { serverURL } = Constants;
    const Navigate = useNavigate();
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search.trim());
    const [listingPerPage, setListingPerPage] = useState(searchParams.get('rpr') || 10);
    const appMetafield = useAppMetafield();
    const ShopApi = useApi();
    const utilityFunction = useUtilityFunction();
    const [userList, setUserList] = useState([]);
    const [wishlistTextDirection, setWishlistTextDirection] = useState("");
    const [loaderMain, setLoaderMain] = useState(false);
    const totalRecords = useRef(0);
    const [queryValue, setQueryValue] = useState('');
    const [isClicked, setIsClicked] = useState(false);
    const [mainData, setMainData] = useState([]);
    const [currentPage, setCurrentPage] = useState(searchParams.get('referreduserpageno') || 1)
    const [checkCurrentOptions, setCheckCurrentOptions] = useState(selectedValue);
    const startIndexValue = useRef({ start: null, end: null });
    const [sortSelected, setSortSelected] = useState(['date desc']);
    const [active, setActive] = useState(false)
    const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);

    let map = new Map();
    map.set("a", { val: startIndexValue.current.start });
    map.get("a").val++;
    const [{ month, year }, setDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
    const [selectedDates, setSelectedDates] = useState({
        start: new Date(),
        end: new Date(),
    });

    const sortOptions = [
        { label: 'Email', value: 'email asc', directionLabel: 'Ascending' },
        { label: 'Email', value: 'email desc', directionLabel: 'Descending' },
        { label: 'Date', value: 'date asc', directionLabel: 'Ascending' },
        { label: 'Date', value: 'date desc', directionLabel: 'Descending' },
    ];

    const onHandleCancel = () => { };

    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);

    const handleChange = useCallback(() => setActive(!active), [active]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoaderMain(true);
                await getAllAppDataMetafields();
                await utilityFunction.getPlanFirst();
                await checkGetAllItem(requestBody);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoaderMain(false);
            }
        };

        fetchData();
    }, []);

    const filteredAndSortedData = useMemo(() => {
        let searchedData = mainData.slice();
        let filteredData = searchedData;

        if (queryValue) {
            filteredData = mainData.filter((item) => {
                const createDate = item.created_at.split('T')[0];
                const updatedDate = item.updated_at.split('T')[0];
                return item.title.toLowerCase().includes(queryValue.toLowerCase()) ||
                    item.handle.toLowerCase().includes(queryValue.toLowerCase()) ||
                    createDate.toLowerCase().includes(queryValue.toLowerCase()) ||
                    updatedDate.toLowerCase().includes(queryValue.toLowerCase())
            })
        }

        if (sortSelected.length > 0) {
            if (sortSelected[0] === 'date asc') {
                filteredData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            } else if (sortSelected[0] === 'date desc') {
                filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            } else if (sortSelected[0] === 'email desc') {
                filteredData.sort((a, b) => b.email - a.email)
            } else {
                filteredData.sort((a, b) => a.email - b.email)
            }
        }
        return filteredData;
    }, [mainData, queryValue, sortSelected, isClicked, listingPerPage]);

    useEffect(() => {
        totalRecords.current = filteredAndSortedData.length;
        const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage);
        setUserList(filteredAndSortedData.slice(startIndex, endIndex));
    }, [filteredAndSortedData]);

    async function checkGetAllItem(res) {
        try {
            const userData = await fetch(`${serverURL}/get-share-stats-wishlist-Item-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(res),
            })
            let result = await userData.json();
            totalRecords.current = result.mainResult.length;
            if (result.mainResult.length === 0) {
                setMainData(result.mainResult);
                setUserList(result.mainResult)
            } else {
                const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage);
                setMainData(result.mainResult);
                setUserList(result.mainResult.slice(startIndex, endIndex));
            }
            setIsCount(result.mainResult.length)
        } catch (error) {
            console.log("errr ", error)
        };
    }

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

    const handleSortChange = useCallback((value) => {
        setSortSelected(value)
        setIsClicked(!isClicked)
    }, []);

    const handleFiltersQueryChange = useCallback((value) => {
        setQueryValue(value)
        setIsClicked(!isClicked)
    }, []);

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

    function extractYear(dateString) {
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

    const handlePagination = async (newPage) => {
        setCurrentPage(newPage);
        setIsClicked(!isClicked)
        searchParams.set("referreduserpageno", newPage);
        Navigate({ search: `?${searchParams.toString()}` });
    };

    const viewHandler = async (id) => {
        Navigate({
            pathname: `/GetWishlistData/${id}`,
            search: `?wishlistitempageno=1&cartitempageno=1&rpr=10&wishlistdata=all`
        })
    }

    const userListTable = userList.map(
        ({ id, email, title, price, image, user_type, created_at, wishlist_user_id }, index,) => [
            <IndexTable.Row id={id} key={id} position={id} >
                <IndexTable.Cell>  {map.get("a").val++}</IndexTable.Cell>
                <IndexTable.Cell>{title}</IndexTable.Cell>
                <div className='show-less-text' ><IndexTable.Cell>{email}</IndexTable.Cell></div>
                <IndexTable.Cell>{user_type}</IndexTable.Cell>
                <IndexTable.Cell>{extractYear(created_at)}</IndexTable.Cell>
                <IndexTable.Cell><Button onClick={() => viewHandler(wishlist_user_id)}><Icon source={ViewMajor} color="base" /></Button></IndexTable.Cell>
            </IndexTable.Row>
        ],
    );

    function recordPerPageFxn(value) {
        setListingPerPage(parseInt(value));
        setIsClicked(!isClicked)
        setCurrentPage(1)
        searchParams.set("rpr", value)
        Navigate({ search: `?${searchParams.toString()}` });
    };

    const today = () => ({
        startDay: moment(new Date()).format('YYYY-MM-DD'),
        endDay: moment(new Date()).format('YYYY-MM-DD')
    });

    const yesterday = () => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return {
            startDay: moment(date).format('YYYY-MM-DD'),
            endDay: moment(date).format('YYYY-MM-DD')
        };
    };

    const thisWeek = () => {
        const date = new Date();
        const day = date.getDay();
        const prevMonday = new Date(date);
        prevMonday.setDate(date.getDate() - (day - 1));
        return {
            startDay: moment(prevMonday).format('YYYY-MM-DD'),
            endDay: moment(new Date()).format('YYYY-MM-DD')
        };
    };

    const lastWeek = () => {
        const beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000);
        const day = beforeOneWeek.getDay();
        const diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1);
        const firstDay = new Date(beforeOneWeek.setDate(diffToMonday));
        const lastDay = new Date(beforeOneWeek.setDate(diffToMonday + 6));
        return {
            startDay: moment(firstDay).format('YYYY-MM-DD'),
            endDay: moment(lastDay).format('YYYY-MM-DD')
        };
    };

    const thisMonth = () => {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        return {
            startDay: moment(firstDay).format('YYYY-MM-DD'),
            endDay: moment(new Date()).format('YYYY-MM-DD')
        };
    };

    const lastMonth = () => {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
        return {
            startDay: moment(firstDay).format('YYYY-MM-DD'),
            endDay: moment(lastDay).format('YYYY-MM-DD')
        };
    };

    const selectDateHandler = async (value) => {
        if (value === "custom") {
            setActive((prev) => !prev);
            setCheckCurrentOptions(value);
            searchParams.set("userdata", "all");
            Navigate({ search: `?${searchParams.toString()}` });
            return;
        }

        setLoaderMain(true);

        try {
            const shopApi = await ShopApi.shop();

            const requestBody = {
                shopName: shopApi.shopName,
                userId: searchParams.get("id"),
                checkStatusInItem: value !== "all",
            };

            if (value !== "all") {
                const parsedValue = JSON.parse(value);
                requestBody.startDate = parsedValue.startDay;
                requestBody.endDate = parsedValue.endDay;
                setCheckCurrentOptions(value);
            } else {
                setCheckCurrentOptions("all");
            }

            await checkGetAllItem(requestBody);

            const checkSelectedData = value !== "all" ? await checkCurrentSelectedValue(value) : "all";
            searchParams.set("userdata", checkSelectedData);
            Navigate({ search: `?${searchParams.toString()}` });
        } catch (error) {
            console.error("Error handling date selection:", error);
        } finally {
            setLoaderMain(false);
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

    const getDataWithDate = async () => {
        const shopApi = await ShopApi.shop();
        let startDate = moment(new Date(selectedDates.start)).format("YYYY-MM-DD");
        let endDate = moment(new Date(selectedDates.end)).format("YYYY-MM-DD");

        setActive(!active)
        let requestBody = {
            shopName: shopApi.shopName,
            userId: searchParams.get('id'),
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
                        <Text variant="headingLg" as="h2">{myLanguage.statsItemsHeading}</Text>
                        <p>{myLanguage.statsItemsHeadingSubHeading}</p>
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
                                        label={`${myLanguage.reportModalTotalItems}: ${totalRecords.current} `}
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

export default ReferredUserData