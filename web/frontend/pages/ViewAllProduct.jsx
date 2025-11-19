

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Frame, Page, Button, LegacyCard, IndexTable, Pagination, useIndexResourceState, useSetIndexFiltersMode, IndexFiltersMode, IndexFilters, Text, AlphaCard, Grid, Select, Label } from '@shopify/polaris';

import SkeletonPage1 from './SkeletonPage1';
import Swal from "sweetalert2";
import useApi from '../hooks/useApi';
import useUtilityFunction from '../hooks/useUtilityFunction';
import { useNavigate } from 'react-router-dom';
import { Constants } from '../../backend/constants/constant';
import Footer from './Footer';
import wfHelpAvatar from '../assets/user-avatar.svg';
import wfHelpDoc from '../assets/doc-text-fill.svg';


const ViewAllProduct = () => {
    const { serverURL } = Constants;
    const shopApi = useApi();
    const Navigate = useNavigate();
    const utilityFunction = useUtilityFunction();
    const [isloading, setIsLoading] = useState(false);
    const [myLanguage, setMyLanguage] = useState({});
    const [mainData, setMainData] = useState([]);
    const [topData, setTopData] = useState([]);
    const [dataView, setDataView] = useState("last30");
    const [listingPerPage, setListingPerPage] = useState(10)
    const [mainAllData, setMainAllData] = useState([])
    const totalRecords = useRef(0);
    const [queryValue, setQueryValue] = useState('');
    const [isClicked, setIsClicked] = useState(false);
    const [currentPage, setCurrentPage] = useState(1)
    const startIndexValue = useRef({ start: null, end: null });
    const sortOptions = [
        { label: 'Total count', value: 'total_count asc', directionLabel: 'Ascending' },
        { label: 'Total count', value: 'total_count desc', directionLabel: 'Descending' },
        { label: 'Product title', value: 'product_title asc', directionLabel: 'A-Z' },
        { label: 'Product title', value: 'product_title desc', directionLabel: 'Z-A' },
    ];
    const [sortSelected, setSortSelected] = useState(['total_count desc']);

    useEffect(() => {
        useEffectLite();
    }, []);

    async function useEffectLite() {
        await utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
        });
        await ViewAllProductFxn();
        setIsLoading(true)
    }


    const openModal = () => {
        Navigate("/RequestFormModal");
    }

    // async function ViewAllProductFxn(getTime = "last30") {
    //     console.log("fg", getTime)
    //     const shopName = await shopApi.shop();
    //     try {
    //         const userData = await fetch(`${serverURL}/admin-top-data-with-dates`, {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({
    //                 shopName: shopName.shopName,
    //                 getTime: getTime,
    //             }),
    //         });
    //         let result = await userData.json();
    //         console.log("RESULT ", result)
    //         setMainData(result.data)
    //         // setIsLoading(true);
    //         Swal.close();
    //     } catch (error) {
    //         console.log("errr ", error)
    //     }
    // }

    async function ViewAllProductFxn() {
        const shopName = await shopApi.shop();
        try {
            const userData = await fetch(`${serverURL}/admin-top-data-with-dates`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shopName.shopName,
                }),
            });
            let result = await userData.json();
            // console.log("RESULT ", result)
            setMainData(result.data)
            setMainAllData(result.topAllData)

            totalRecords.current = result.data.length;
            const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage);
            setTopData(result.data.slice(startIndex, endIndex))
            Swal.close();
        } catch (error) {
            console.log("errr ", error)
        }
    }

    function calculateIndexes(currentPage, listingPerPage) {
        const startIndex = (currentPage - 1) * parseInt(listingPerPage);
        const endIndex = startIndex + parseInt(listingPerPage);
        startIndexValue.current = { start: startIndex, end: endIndex }
        return { startIndex, endIndex };
    };

    const filteredAndSortedData = useMemo(() => {
        let searchedData
        if (dataView === "last30") {
            searchedData = mainData.slice();
        } else {
            searchedData = mainAllData.slice();
        }
        let filteredData = searchedData;

        if (queryValue) {
            filteredData = filteredData.filter((item) => {
                return item.title.toLowerCase().includes(queryValue.toLowerCase()) ||
                    item.totalCount.toString().includes(queryValue.toLowerCase())
            })
        }

        if (sortSelected.length > 0) {
            if (sortSelected[0] === 'total_count asc') {
                filteredData.sort((a, b) => parseInt(a.totalCount) - parseInt(b.totalCount));
            } else if (sortSelected[0] === 'total_count desc') {
                filteredData.sort((a, b) => parseInt(b.totalCount) - parseInt(a.totalCount));
            } else if (sortSelected[0] === 'product_title asc') {
                filteredData.sort((a, b) => a.title.localeCompare(b.title));
            } else {
                filteredData.sort((a, b) => b.title.localeCompare(a.title));
            }
        }

        return filteredData
    }, [mainData, mainAllData, queryValue, sortSelected, isClicked]);

    useEffect(() => {
        totalRecords.current = filteredAndSortedData.length;
        const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage);
        isloading && setTopData(filteredAndSortedData.slice(startIndex, endIndex));
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

    let map = new Map();
    map.set("a", { val: startIndexValue.current.start });
    map.get("a").val++;
    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(topData);
    const topDataTable = topData.map(
        ({ handle, title, image, totalCount }, index,) => (
            <IndexTable.Row id={index} key={index} position={index} >
                <IndexTable.Cell> {map.get("a").val++}</IndexTable.Cell>
                <IndexTable.Cell className='show-less-text11'  ><span className='linkCss' onClick={() => openPageHandler(handle)}>{title} </span></IndexTable.Cell>
                <IndexTable.Cell><img src={image} alt='ijijijiji' height="40px" width="40px" /></IndexTable.Cell>
                <IndexTable.Cell>{totalCount}</IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    function getSelectedtTime(selectValue) {
        setDataView(selectValue);
        setTopData(mainAllData);
        setIsClicked(!isClicked);
    };

    const selectOptions = [
        { label: "Last 30 days", value: "last30" },
        { label: "All data", value: "allData" }
    ];

    const handlePagination = (newPage) => {
        setCurrentPage(newPage);
        setIsClicked(!isClicked);
    };

    function recordPerPageFxn(value) {
        setListingPerPage(parseInt(value));
        setIsClicked(!isClicked);
        setCurrentPage(1);
    };

    const options = [
        { label: '10', value: 10 },
        { label: '20', value: 20 },
        { label: '50', value: 50 },
        { label: '75', value: 75 },
    ];

    return (
        <div className='wf-dashboard wf-dashboard-report'>
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    <Page fullWidth title={myLanguage.mostProductsHeading} subtitle={myLanguage.mostProductsText} backAction={{ onAction: () => history.back() }} >
                        <AlphaCard>
                            <div className='wf-dashboard-box'>
                                <div className='wf-listingRecord'>
                                    <div className='wf-listingRecord-inner'>
                                        <Text variant="headingLg" as="h2">{myLanguage.mostProductsTableHeading}</Text>
                                        <p>{myLanguage.mostProductsTableText}</p>
                                    </div>
                                    <div className='datePerRecord'>
                                        <div className='wf-listingRecord-inner'>
                                            <Text variant="headingLg" as="h2">{myLanguage.selectDateForData}</Text>
                                            <Select
                                                options={selectOptions}
                                                onChange={getSelectedtTime}
                                                value={dataView}
                                            />
                                        </div>
                                        <div className='wf-listingRecord-inner'>
                                            <Text variant="headingLg" as="h2">{myLanguage.userListingRecordsPerPage}</Text>
                                            <Select
                                                options={options}
                                                onChange={recordPerPageFxn}
                                                value={listingPerPage}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='customer-recently-table'>
                                    <LegacyCard>
                                        <IndexFilters
                                            sortOptions={sortOptions}
                                            sortSelected={sortSelected}
                                            queryValue={queryValue}
                                            queryPlaceholder="Searching in all"
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
                                            itemCount={topData.length}
                                            // selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                                            // onSelectionChange={handleSelectionChange}
                                            selectable={false}
                                            headings={[
                                                { title: myLanguage.mpvalue1 },
                                                { title: myLanguage.mpvalue2 },
                                                { title: myLanguage.mpvalue3 },
                                                { title: myLanguage.mpvalue4 },
                                            ]}
                                        >
                                            {topDataTable}
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
                                                label={` Total ${totalRecords.current} products`}
                                                accessibilityLabel="Pagination"
                                                nextTooltip="Next page"
                                                previousTooltip="Previous page"
                                                type="table"
                                            />
                                        </div>
                                    </LegacyCard>
                                </div>
                            </div>
                        </AlphaCard>
                        {/* <Footer myLanguage={myLanguage} /> */}

                        <div className="wf-dashboard-box wf-help-dashboard" style={{ padding: "40px 60px", marginTop: "40px" }}>
                            <AlphaCard>
                                <div className='custom-margin'>
                                    <Text variant="headingLg" as="h2">{myLanguage.helpHeading}</Text>
                                </div>
                                <p className='help-text-paragraph'>
                                    {myLanguage.helpText1} {myLanguage.helpText2}
                                </p>
                                <div className='wf-help-dashboard-btn'>
                                    <a style={{ textDecoration: "none" }} href="https://apps.shopify.com/wishlist-guru/reviews" target="_blank"><Button  ><img src={wfHelpAvatar} />   {myLanguage.contactUs} </Button></a>
                                    <a style={{ textDecoration: "none" }} href="https://wishlist-guru.webframez.com/docs/" target="_blank"><Button><img src={wfHelpDoc} />{myLanguage.helpDocs}</Button></a>
                                </div>
                            </AlphaCard>
                        </div>
                    </Page>
                </Frame>
            }
        </div>
    )
}

export default ViewAllProduct

