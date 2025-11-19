
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
    Frame, Page, Spinner, LegacyCard, IndexTable, Pagination, useIndexResourceState, Button, Modal, Text, Icon, AlphaCard, Grid, Select,
    IndexFilters,
    useSetIndexFiltersMode,
} from '@shopify/polaris';
import SkeletonPage1 from './SkeletonPage1';
import Swal from "sweetalert2";
import { DeleteMajor } from '@shopify/polaris-icons';
import { ViewMajor } from '@shopify/polaris-icons';
import useAppMetafield from '../hooks/useAppMetafield';
import useApi from '../hooks/useApi';
import useUtilityFunction from '../hooks/useUtilityFunction';
import loaderGif from "./loaderGreen.gif"
import { useLocation, useNavigate } from 'react-router-dom';
import { Constants } from '../../backend/constants/constant';
import Footer from './Footer';
import wfHelpAvatar from '../assets/user-avatar.svg';
import wfHelpDoc from '../assets/doc-text-fill.svg';
const Report = () => {

    const Navigate = useNavigate();
    const { serverURL } = Constants;
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search.trim());
    let navigate = "/Report"
    const [listingPerPage, setListingPerPage] = useState(10);
    const appMetafield = useAppMetafield();
    const ShopApi = useApi();
    const utilityFunction = useUtilityFunction();
    const [isloading, setIsLoading] = useState(false);
    const [userList, setUserList] = useState([]);
    const [userWishlist, setUserWishlist] = useState([]);
    const [cartList, setCartList] = useState([]);
    const [username, setUsername] = useState("");
    const [reload, setReload] = useState(false);
    const [active, setActive] = useState(false);
    const [cartActive, setCartActive] = useState(false);
    const activator = "";
    const [wishlistTextDirection, setWishlistTextDirection] = useState("");
    const [myLanguage, setMyLanguage] = useState({});
    const [loaderrrr, setLoaderrrr] = useState("Loading.......");
    const [loaderMain, setLoaderMain] = useState("Loading.......");
    const totalRecords = useRef(0);
    const [queryValue, setQueryValue] = useState('');
    const [isClicked, setIsClicked] = useState(false);
    const [mainData, setMainData] = useState([]);
    const [currentPage, setCurrentPage] = useState(searchParams.get('pagenumber') || 1)
    const startIndexValue = useRef({ start: null, end: null });
    const sortOptions = [
        { label: 'Wishlist Items', value: 'wishlist_items asc', directionLabel: 'Ascending' },
        { label: 'Wishlist Items', value: 'wishlist_items desc', directionLabel: 'Descending' },
        { label: 'Customer email', value: 'customer_email asc', directionLabel: 'A-Z' },
        { label: 'Customer email', value: 'customer_email desc', directionLabel: 'Z-A' },
        { label: 'Date', value: 'date asc', directionLabel: 'Ascending' },
        { label: 'Date', value: 'date desc', directionLabel: 'Descending' },
        { label: 'Cart Items', value: 'cart_items asc', directionLabel: 'Ascending' },
        { label: 'Cart Items', value: 'cart_items desc', directionLabel: 'Descending' },
    ];
    const [sortSelected, setSortSelected] = useState(['date desc']);
    const shopCurrency = useRef();

    const openModal = () => {
        Navigate("/RequestFormModal");
    }

    useEffect(() => {
        useEffectLite();
    }, [reload]);

    async function useEffectLite() {
        await utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
            setIsLoading(true);

        });
        await utilityFunction.getPlanFirst();
        setLoaderMain("Loading.......");
        const shopApi = await ShopApi.shop();
        shopCurrency.current = shopApi.shopCurrency;
        getAllAppDataMetafields();

        try {
            const userData = await fetch(`${serverURL}/get-all-users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shopApi.shopName
                }),
            })
            let result = await userData.json();
            if (result.mainResult.length === 0) {
                setLoaderMain("No record found");
            } else {
                setLoaderMain("");
                const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage);
                totalRecords.current = result.mainResult.length;
                setMainData(result.mainResult);
                setUserList(result.mainResult.slice(startIndex, endIndex));
            }
            // setIsLoading(true)
            Swal.close();
        } catch (error) {
            console.log("errr ", error)
        };

        Navigate({
            pathname: "/Report",
            search: `?pagenumber=${currentPage}`
        })
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
                const createDate = item.created_at.split('T')[0];
                const updatedDate = item.updated_at.split('T')[0];

                return item.email.toLowerCase().includes(queryValue.toLowerCase()) ||
                    item.user_type.toLowerCase().includes(queryValue.toLowerCase()) ||

                    item.cart_count.toString().includes(queryValue.toString()) ||
                    item.item_count.toString().includes(queryValue.toString()) ||

                    createDate.toLowerCase().includes(queryValue.toLowerCase()) ||
                    updatedDate.toLowerCase().includes(queryValue.toLowerCase())
            })
        }

        if (sortSelected.length > 0) {
            if (sortSelected[0] === 'wishlist_items asc') {
                filteredData.sort((a, b) => a.item_count - b.item_count);
            } else if (sortSelected[0] === 'wishlist_items desc') {
                filteredData.sort((a, b) => b.item_count - a.item_count);
            } else if (sortSelected[0] === 'customer_email asc') {
                filteredData.sort((a, b) => a.email.localeCompare(b.email));
            } else if (sortSelected[0] === 'customer_email desc') {
                filteredData.sort((a, b) => b.email.localeCompare(a.email));
            } else if (sortSelected[0] === 'date asc') {
                filteredData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            } else if (sortSelected[0] === 'date desc') {
                filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            } else if (sortSelected[0] === 'cart_items asc') {
                filteredData.sort((a, b) => a.cart_count - b.cart_count);
            } else {
                filteredData.sort((a, b) => b.cart_count - a.cart_count);
            }
        }

        return filteredData;
    }, [mainData, queryValue, sortSelected, isClicked]);


    useEffect(() => {
        totalRecords.current = filteredAndSortedData.length;
        const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage);
        isloading && setUserList(filteredAndSortedData.slice(startIndex, endIndex));
    }, [filteredAndSortedData]);


    const { mode, setMode } = useSetIndexFiltersMode();

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

    const handleChange = useCallback(async (email, shop_name) => {
        setLoaderrrr("Loading.......");
        getEmail(email);
        // setUsername(email)
        setActive(!active);
        setUserWishlist([]);
        try {
            const userData = await fetch(`${serverURL}/get-report-all-items`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shop_name,
                    customerEmail: email,
                }),
            })
            let result = await userData.json();
            if (result.data.length === 0) {
                setLoaderrrr("No record found");
            } else {
                setLoaderrrr("");
                setUserWishlist(result.data);
            }
        } catch (error) {
            console.log("errr ", error)
        }
    }, [active]);

    const handleCartChange = useCallback(async (email, shop_name) => {
        setLoaderrrr("Loading.......");
        getEmail(email);
        // setUsername(email)
        setCartActive(!cartActive);
        setCartList([]);
        try {
            const userData = await fetch(`${serverURL}/get-all-cart-items`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shop_name,
                    customerEmail: email,
                }),
            })
            let result = await userData.json();
            if (result.data.length === 0) {
                setLoaderrrr("No record found");
            } else {
                setLoaderrrr("");
                setCartList(result.data);
            }
        } catch (error) {
            console.log("errr ", error)
        }
    }, [cartActive]);

    const handleClose = useCallback(() => setActive(!active), [active]);
    const handleClose2 = useCallback(() => setCartActive(!cartActive), [cartActive]);


    const deleteUserHandle = async (id, wishlist_id) => {
        Swal.fire({
            title: myLanguage.swalDeleteHeading,
            text: myLanguage.swalDeleteText,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#f54542",
            confirmButtonText: myLanguage.swalDeleteConfirm,
            cancelButtonText: myLanguage.swalButtonCancelText
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    text: myLanguage.swalWaiting,
                    imageUrl: loaderGif,
                    showConfirmButton: false,
                });
                setLoaderMain("Loading........");
                try {
                    const userData = await fetch(`${serverURL}/delete-user`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            id: id,
                            wishlistId: wishlist_id
                        }),
                    })
                    let result = await userData.json();
                    if (result.msg === "user deleted") {
                        setReload(!reload);
                    }
                } catch (error) {
                    console.log("errr ", error)
                }
            }
        });
    };

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

    const extractYear = (dateString) => {
        return dateString.substring(0, 10);
    };

    const handlePagination = (newPage) => {
        setCurrentPage(newPage);
        setIsClicked(!isClicked)
        Navigate({
            pathname: "/Report",
            search: `?pagenumber=${newPage}`
        })
    };

    const resourceName = {
        singular: 'order',
        plural: 'orders',
    };

    // const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(userList);


    const userListTable = userList.map(
        ({ id, email, user_type, created_at, updated_at, shop_name, item_count, cart_count, wishlist_user_id }, index,) => [
            <IndexTable.Row id={id} key={id} position={id} >
                <IndexTable.Cell>  {map.get("a").val++}</IndexTable.Cell>
                <div className='show-less-text' ><IndexTable.Cell>{email}</IndexTable.Cell></div>
                <IndexTable.Cell>{user_type}</IndexTable.Cell>
                <IndexTable.Cell>{item_count}</IndexTable.Cell>
                <IndexTable.Cell><Button onClick={() => handleChange(email, shop_name)}><Icon source={ViewMajor} color="base" /></Button></IndexTable.Cell>
                <IndexTable.Cell>{cart_count}</IndexTable.Cell>
                <IndexTable.Cell><Button onClick={() => handleCartChange(email, shop_name)}><Icon source={ViewMajor} color="base" /></Button></IndexTable.Cell>
                <IndexTable.Cell>{extractYear(created_at)}</IndexTable.Cell>
                <IndexTable.Cell>{extractYear(updated_at)}</IndexTable.Cell>
                <IndexTable.Cell><Button onClick={() => deleteUserHandle(id, wishlist_user_id)}><Icon source={DeleteMajor} color="base" /></Button></IndexTable.Cell>
            </IndexTable.Row>
        ],
    );

    const { selectedResources: selectedResources2, allResourcesSelected: allResourcesSelected2, handleSelectionChange: handleSelectionChange2 } = useIndexResourceState(userWishlist);
    const userWishlistTable = userWishlist.map(
        ({ id, user_id, title, price, image, handle }, index,) => {
            // document.getElementById("my_anchor").href = "https://randeep-webframez.myshopify.com/products/" + handle;
            return (
                <IndexTable.Row id={id} key={id} position={id}>
                    <IndexTable.Cell>{index + 1}</IndexTable.Cell>
                    <IndexTable.Cell  > <span className='linkCss' onClick={() => openPageHandler(handle)}>{title} </span></IndexTable.Cell>
                    <IndexTable.Cell>{chageMoney(price, shopCurrency.current)}</IndexTable.Cell>
                    <IndexTable.Cell><img src={image} alt='ijijijiji' height="40px" width="40px" /></IndexTable.Cell>
                </IndexTable.Row>
            )
        },
    );

    // function chageMoney(cents, format) {
    //     if (typeof cents === 'string') { cents = parseFloat(cents.replace(',', '')); }
    //     var value = '';
    //     var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    //     var formatString = format;

    //     function defaultOption(opt, def) {
    //         return (typeof opt === 'undefined' ? def : opt);
    //     }

    //     function formatWithDelimiters(number, precision, thousands, decimal) {
    //         precision = defaultOption(precision, 2);
    //         thousands = defaultOption(thousands, ',');
    //         decimal = defaultOption(decimal, '.');

    //         if (isNaN(number) || number === null) { return '0'; }

    //         number = (number / 100.0).toFixed(precision);

    //         var parts = number.split('.'),
    //             dollars = parts[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + thousands),
    //             cents = parts[1] ? (decimal + parts[1]) : '';

    //         return dollars + cents;
    //     }

    //     let match = formatString.match(placeholderRegex);

    //     if (match) {
    //         switch (match[1]) {
    //             case 'amount':
    //                 value = formatWithDelimiters(cents, 2);
    //                 break;
    //             case 'amount_no_decimals':
    //                 value = formatWithDelimiters(cents, 0);
    //                 break;
    //             case 'amount_with_comma_separator':
    //                 value = formatWithDelimiters(cents, 2, '.', ',');
    //                 break;
    //             case 'amount_no_decimals_with_comma_separator':
    //                 value = formatWithDelimiters(cents, 0, '.', ',');
    //                 break;
    //         }
    //     }

    //     return formatString.replace(placeholderRegex, value);
    // };

    const { selectedResources: selectedResources3, allResourcesSelected: allResourcesSelected3, handleSelectionChange: handleSelectionChange3 } = useIndexResourceState(cartList);
    const cartWishlistTable = cartList.map(
        ({ id, user_id, title, price, image, handle }, index,) => {
            // document.getElementById("my_anchor").href = "https://randeep-webframez.myshopify.com/products/" + handle;
            return (
                <IndexTable.Row id={id} key={id} position={id}>
                    <IndexTable.Cell>{index + 1}</IndexTable.Cell>
                    <IndexTable.Cell  > <span className='linkCss' onClick={() => openPageHandler(handle)}>{title} </span></IndexTable.Cell>
                    <IndexTable.Cell>{chageMoney(price, shopCurrency.current)}</IndexTable.Cell>
                    <IndexTable.Cell><img src={image} alt='product' height="40px" width="40px" /></IndexTable.Cell>
                </IndexTable.Row>
            )
        },
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
        setIsClicked(!isClicked);
        setCurrentPage(1);
    };

    const options = [
        { label: '10', value: 10 },
        { label: '25', value: 25 },
        { label: '50', value: 50 },
        { label: '75', value: 75 },
    ];

    return (
        <div dir={wishlistTextDirection} className='wf-dashboard wf-dashboard-report'>
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    <Page fullWidth title={myLanguage.reportPageMainHeading} subtitle={myLanguage.reportPageMainText} >
                        <AlphaCard>
                            <div className='wf-dashboard-box'>
                                <div className='wf-listingRecord'>
                                    <div className='wf-listingRecord-inner'>
                                        <Text variant="headingLg" as="h2">{myLanguage.userListingHeading}</Text>
                                        <p>{myLanguage.userListingText}</p>
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
                                <div className='customer-recently-table'>
                                    {
                                        loaderMain !== "" ?
                                            <Text variant="headingXl" as="h2">{loaderMain}</Text>
                                            :
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
                                                    itemCount={userList.length}
                                                    // selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                                                    // onSelectionChange={handleSelectionChange}
                                                    selectable={false}
                                                    headings={[
                                                        { title: myLanguage.tableSrno },
                                                        { title: myLanguage.tableEmail },
                                                        { title: myLanguage.tableUserType },
                                                        { title: myLanguage.tableWishlistItems },
                                                        { title: myLanguage.tableViewWishlistItems },
                                                        { title: myLanguage.tableCartItems },
                                                        { title: myLanguage.tableViewAddToCartDetail },
                                                        { title: myLanguage.tableAccountCreated },
                                                        { title: myLanguage.tableLastUpdated },
                                                        { title: myLanguage.tableDelete },
                                                    ]}
                                                >
                                                    {userListTable}
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
                                                        label={`Total ${totalRecords.current} users`}
                                                        accessibilityLabel="Pagination"
                                                        nextTooltip="Next page"
                                                        previousTooltip="Previous page"
                                                        type="table"
                                                    />
                                                </div>
                                            </LegacyCard>
                                    }
                                </div>
                                <Modal id="modal-for-items"
                                    activator={activator}
                                    open={active}
                                    onClose={handleClose}
                                    title={selectedUsername}
                                    secondaryActions={{
                                        content: totalItems
                                    }}
                                >
                                    <Modal.Section>
                                        <LegacyCard>
                                            {loaderrrr !== "" ?
                                                <Text variant="headingXl" as="h4">{loaderrrr}</Text>
                                                :
                                                <IndexTable
                                                    itemCount={userWishlist.length}
                                                    selectedItemsCount={allResourcesSelected2 ? 'All' : selectedResources2.length}
                                                    onSelectionChange={handleSelectionChange2}
                                                    headings={[
                                                        { title: myLanguage.tableSrno },
                                                        { title: myLanguage.rpvalue2 },
                                                        { title: myLanguage.rpvalue4 },
                                                        { title: myLanguage.rpvalue3 },
                                                    ]}
                                                    selectable={false}>
                                                    {userWishlistTable}
                                                </IndexTable>
                                            }
                                        </LegacyCard>
                                    </Modal.Section>
                                </Modal>

                                <Modal id="modal-for-cart-items"
                                    activator={activator}
                                    open={cartActive}
                                    onClose={handleClose2}
                                    title={selectedCartUsername}
                                    secondaryActions={{
                                        content: totalCartItems
                                    }}
                                >
                                    <Modal.Section>
                                        <LegacyCard>
                                            {loaderrrr !== "" ?
                                                <Text variant="headingXl" as="h4">{loaderrrr}</Text>
                                                :
                                                <IndexTable
                                                    itemCount={cartList.length}
                                                    selectedItemsCount={allResourcesSelected3 ? 'All' : selectedResources3.length}
                                                    onSelectionChange={handleSelectionChange3}
                                                    headings={[
                                                        { title: myLanguage.tableSrno },
                                                        { title: myLanguage.rpvalue2 },
                                                        { title: myLanguage.rpvalue4 },
                                                        { title: myLanguage.rpvalue3 },
                                                    ]}
                                                    selectable={false}>
                                                    {cartWishlistTable}
                                                </IndexTable>
                                            }
                                        </LegacyCard>
                                    </Modal.Section>
                                </Modal>
                            </div>
                        </AlphaCard>
                        {/* <div style={{ marginTop: "40px" }}>
                            <Footer myLanguage={myLanguage} />
                        </div> */}
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

export default Report