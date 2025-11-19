import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Constants } from '../../../backend/constants/constant';
import useApi from '../../hooks/useApi';
import {
    Page, LegacyCard, IndexTable, Button, Modal, Text, Icon, AlphaCard, Grid, Select, Toast,
    DatePicker, Frame,
    TextField,

} from '@shopify/polaris';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useUtilityFunction from '../../hooks/useUtilityFunction';
import SkeletonPage1 from '../SkeletonPage1';
import useAppMetafield from '../../hooks/useAppMetafield';
import moment from 'moment-js';
import WishlistDataTable from './WishlistDataTable';
import CartDataTable from './CartDataTable';
import { useAuthenticatedFetch } from '../../hooks';
import { ArrowLeftMinor, DeleteMajor, ClipboardMinor } from '@shopify/polaris-icons';
import Swal from 'sweetalert2';
import loaderGif from "../loaderGreen.gif"
import Footer from '../Footer';
import collectionCopyIcon from '../../assets/copy-icon.svg'


const GetWishlistData = () => {
    const utilityFunction = useUtilityFunction();
    const [wishlistTextDirection, setWishlistTextDirection] = useState("");
    const appMetafield = useAppMetafield();
    const Navigate = useNavigate()
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search.trim());
    const { serverURL } = Constants;
    const ShopApi = useApi();
    const [cartData, setCartData] = useState([]);
    const shopCurrency = useRef();
    const [isCartLoading, setIsCartLoading] = useState(false)
    const [isItemLoading, setIsItemLoading] = useState(false)
    const [modalActive, setModalActive] = useState(false)
    const [modalSwalActive, setModalSwalActive] = useState(false)
    const getItemPageNo = searchParams.get('wishlistitempageno');
    const getCartPageNo = searchParams.get('cartitempageno');
    const getItemRecordPerPage = searchParams.get('rpr');
    const itemCartRecord = searchParams.get('selecteddata');
    const cartSearch = searchParams.get('cartsearch')
    const itemSearch = searchParams.get('itemsearch')
    const cartRecord = searchParams.get('cartdata');
    const currentWishlist = searchParams.get('wishlistname');
    const [active, setActive] = useState(false);
    const [selectedItemOption, setSelectedItemOption] = useState([])
    const [sharedWishlistArr, setSharedWishlistArr] = useState([]);
    const [checkDatePicker, setCheckDatePicker] = useState(false)
    let id = useParams();
    // console.log("id111111111111111111111111", id)

    const sortOptions = [
        { label: 'Title', value: 'title asc', directionLabel: 'Ascending' },
        { label: 'Title', value: 'title desc', directionLabel: 'Descending' },
        { label: 'Price', value: 'price asc', directionLabel: 'Ascending' },
        { label: 'Price', value: 'price desc', directionLabel: 'Descending' },
        { label: 'Quantity', value: 'quantity asc', directionLabel: 'Ascending' },
        { label: 'Quantity', value: 'quantity desc', directionLabel: 'Descending' },
        { label: 'Date', value: 'date asc', directionLabel: 'Ascending' },
        { label: 'Date', value: 'date desc', directionLabel: 'Descending' },
    ];

    const itemSortOptions = [
        { label: 'Title', value: 'title asc', directionLabel: 'Ascending' },
        { label: 'Title', value: 'title desc', directionLabel: 'Descending' },
        { label: 'Price', value: 'price asc', directionLabel: 'Ascending' },
        { label: 'Price', value: 'price desc', directionLabel: 'Descending' },
        { label: 'Quantity', value: 'quantity asc', directionLabel: 'Ascending' },
        { label: 'Quantity', value: 'quantity desc', directionLabel: 'Descending' },
        { label: 'Date', value: 'date asc', directionLabel: 'Ascending' },
        { label: 'Date', value: 'date desc', directionLabel: 'Descending' },
        { label: 'Wishlist Name', value: 'wishlist asc', directionLabel: 'Ascending' },
        { label: 'Wishlist Name', value: 'wishlist desc', directionLabel: 'Descending' },
    ];
    const [isloading, setIsLoading] = useState(false);
    const [queryValue, setQueryValue] = useState("");
    const [queryCheckValue, setQueryCheckValue] = useState({});
    const [queryCartValue, setQueryCartValue] = useState("");
    const [isClicked, setIsClicked] = useState(false);
    const [mainData, setMainData] = useState([]);
    const [cartSearchData, setCartSearchData] = useState([]);
    const [sortSelected, setSortSelected] = useState(['date desc']);
    const [sortCartSelected, setSortCartSelected] = useState(['date desc']);
    const [allWishlistData, setAllWishlistData] = useState([]);
    const [checkWishlistItem, setCheckWishlistItem] = useState()
    const [checkAddToCartItem, setCheckAddToCartItem] = useState()
    const [checkCurrentItemData, setCheckCurrentItemData] = useState([])
    const [currentShopData, setCurrentShopData] = useState({})
    const [copyActive, setCopyActive] = useState(false)
    const getCurrentPlan = useRef()

    // const fetch2 = useAuthenticatedFetch();

    const [selectedWishlistItem, setSelectedWishlistItem] = useState(currentWishlist || 'all')
    const [userList, setUserList] = useState([])
    const [userData, setUserData] = useState([])

    const toggleActive = useCallback(() => setCopyActive((copyActive) => !copyActive), []);
    const toastMarkup = copyActive ? (
        <Toast content="Copied" onDismiss={toggleActive} />
    ) : null;


    const startIndexValue = useRef({ start: null, end: null });
    const startIndexCartValue = useRef({ start: null, end: null });
    const totalRecords = useRef(0);
    const totalRecordsCart = useRef(0);
    const [listingPerPage, setListingPerPage] = useState(Number(getItemRecordPerPage) || 10);
    const [checkCurrentOptions, setCheckCurrentOptions] = useState(itemCartRecord || 'all');
    const [currentPage, setCurrentPage] = useState(Number(getItemPageNo) || 1)
    const [currentCartPage, setCurrentCartPage] = useState(Number(getCartPageNo) || 1)
    const [myLanguage, setMyLanguage] = useState({});

    let getCustomItemPageNo = getItemPageNo || 1;
    let getCustomCartPageNo = getCartPageNo || 1;
    let getCustomItemRecordPerPage = getItemRecordPerPage || 10;
    let itemCustomRecord = itemCartRecord || 'all';
    // let cartCustomRecord = cartRecord || 'all';
    const checkCurrentPage = searchParams.get('pagenumber') || 1;
    const [ismultiwishlist, setIsMultiWishlist] = useState("no");
    const [{ month, year }, setDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
    const [selectedDates, setSelectedDates] = useState({
        start: new Date(),
        end: new Date(),
    });
    let isEmail = useRef('');


    const handleMonthChange = useCallback(
        (month, year) => {
            setDate({ month, year })
        },
        [],
    );

    useEffect(() => {
        useEffectLite();
    }, []);

    async function useEffectLite() {
        const subscription11 = await appMetafield.getCurrentPlan();
        getCurrentPlan.current = parseInt(subscription11.currentPlan)
        checkParams()
        const res = await utilityFunction.getCurrentLanguage();
        setMyLanguage(res);
        const shopApi = await ShopApi.shop();
        setCurrentShopData(shopApi)
        shopCurrency.current = shopApi.shopCurrency
        const data = await getAllAppDataMetafields();
        const isMultiWish = data.isMultiWish || "no"
        setIsMultiWishlist(isMultiWish)
        await getCurrentUserData(shopApi, res, getCurrentPlan.current, isMultiWish);
        checkSearchData()
        await getRefFrom()
        setIsLoading(true);
        selectDateHandler("all");
    }

    async function getRefFrom() {

        try {
            const userData = await fetch(`${serverURL}/get-ref-from-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: id.CurrentWishlistUserData }),
            });
            let result = await userData.json();
            isEmail.current = result?.email || ''
            return result.email
        } catch (error) {
            console.log("errr ", error);
        }
    }

    async function checkParams() {
        if (getItemPageNo === null || getCartPageNo === null || getItemRecordPerPage === null || cartRecord === null) {
            Navigate({
                pathname: `/GetWishlistData/${Number(id.CurrentWishlistUserData)}`,
                search: `?wishlistitempageno=${getCustomItemPageNo}&cartitempageno=${getCustomCartPageNo}&rpr=${getCustomItemRecordPerPage}&wishlistdata=${itemCustomRecord}&wishlistname=${selectedWishlistItem}`
            });
        }

    }

    function checkSearchData() {
        if (itemSearch !== null) {
            setQueryValue(itemSearch)
            setQueryCheckValue({ data: "" })
        }
        if (cartSearch !== null) {
            setQueryCartValue(cartSearch)
            setQueryCheckValue({ data: "cart" })
        }
    }


    async function getCurrentUserData(shopApi, res, currentPlan, isMultiWish) {
        const itemRecord = searchParams.get('wishlistdata');
        let itemCustomRecord = itemRecord || 'all';
        const cartRecord = searchParams.get('cartdata');
        let itemCustomCartRecord = cartRecord || 'all';
        let requestBody = {
            shopName: shopApi.shopName,
            wishlistId: Number(id.CurrentWishlistUserData),
        };
        if (itemCustomRecord !== "all") {
            const result = await checkCurrentSelectedValue(itemCustomRecord, res)
            requestBody.startDate = result.startDate;
            requestBody.endDate = result.endDate;
            requestBody.checkStatusInItem = true
            setCheckCurrentOptions(JSON.stringify(result))
        } else {
            requestBody.checkStatusInItem = false
        }
        if (itemCustomCartRecord !== "all") {
            const result = await checkCurrentSelectedValue(itemCustomCartRecord, res)
            requestBody.startCartDate = result.startDate;
            requestBody.endCartDate = result.endDate;
            requestBody.checkStatusInCart = true
            setCheckCurrentOptions(JSON.stringify(result))
        } else {
            requestBody.checkStatusInCart = false
        }
        try {
            const userData = await fetch(`${serverURL}/get-current-user-wishlist-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            let result = await userData.json();
            setSharedWishlistArr(result.wishlistData)
            setCheckCurrentItemData(result.productResult)
            setCheckWishlistItem(result.productResult.length)
            if (selectedWishlistItem !== "all") {
                setAllWishlistData(result.productResult)
                const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage, "");
                const defaddultItems = result.productResult.filter(item => item.wishlist_name === selectedWishlistItem);
                totalRecords.current = defaddultItems.length;
                setMainData(defaddultItems);
                setUserList(defaddultItems.slice(startIndex, endIndex));
            } else {
                setAllWishlistData(result.productResult)
                const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage, "");

                // console.log("isMultiWish", isMultiWish, "cur", currentPlan)
                if (currentPlan > 3 && isMultiWish === "yes") {
                    totalRecords.current = result.productResult.length;
                    setMainData(result.productResult);
                    setUserList(result.productResult.slice(startIndex, endIndex));
                } else {
                    const defaddultItems = result.productResult.filter(item => item.wishlist_name === "default");
                    totalRecords.current = defaddultItems.length;
                    setMainData(defaddultItems);
                    setUserList(defaddultItems.slice(startIndex, endIndex));
                }
                // totalRecords.current = result.productResult.length;
                // setMainData(result.productResult);
                // setUserList(result.productResult.slice(startIndex, endIndex));
            }
            setCheckAddToCartItem(result.cartData)
            setSelectedItemOption(result.optionArray)
            const { startCartIndex, endCartIndex } = calculateIndexes(currentCartPage, listingPerPage, "cart");
            totalRecordsCart.current = result.cartData.length
            setCartSearchData(result.cartData);
            setCartData(result.cartData.slice(startCartIndex, endCartIndex));
            if (result.userResult[0].user_type === "User") {
                let userData = result.userResult[0]
                getCurrentUserDetail(userData, result, result.itemCount)
                setCheckWishlistItem(result.productResult.length)

            } else {
                let getCurrentData = [{
                    // name: "Guest",
                    email: result.userResult[0].email,
                    wishlistItemCount: result.productResult.length,
                    addToCartCount: result.cartResultCount.length,
                    type: result.userResult[0].user_type
                }]
                setUserData(getCurrentData)
                setCheckWishlistItem(result.productResult.length)
            }
        } catch (error) {
            console.log("errr ", error);
        }

    }


    async function getCurrentUserDetail(userData, result, itemCount) {
        try {
            // const response = await fetch2(`/api/get-current-user-detail?email=${userData.email}`);
            // const customerResult = await response.json();
            // let name = `${customerResult.data[0].first_name} ${customerResult.data[0].last_name}`;
            let getCurrentData = [{
                // name: name,
                email: userData.email,
                wishlistItemCount: itemCount.length,
                addToCartCount: result.cartData.length,
                type: userData.user_type
            }]
            setUserData(getCurrentData)
        } catch (error) {
            console.error("Error:", error);
        }

    }

    const options = [
        { label: '5', value: 5 },
        { label: '10', value: 10 },
        { label: '25', value: 25 },
        { label: '50', value: 50 },
        { label: '75', value: 75 },
    ];

    const selectOptions = [
        { label: '5', value: 5 },
        { label: '10', value: 10 },
        { label: '25', value: 25 },
        { label: '50', value: 50 },
        { label: '75', value: 75 },
    ];

    const selectedWishlistItemOption = [
        { label: myLanguage.selectValue0, value: "all" },
        { label: myLanguage.selectValue1, value: JSON.stringify(today()) },
        { label: myLanguage.selectValue2, value: JSON.stringify(yesterday()) },
        { label: myLanguage.selectValue3, value: JSON.stringify(thisWeek()) },
        { label: myLanguage.selectValue4, value: JSON.stringify(lastWeek()) },
        { label: myLanguage.selectValue5, value: JSON.stringify(thisMonth()) },
        { label: myLanguage.selectValue6, value: JSON.stringify(lastMonth()) },
        { label: 'Custom Range', value: 'custom' },
    ];

    const checkCurrentSelectedLabel = (checkOptions) => {
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

    const checkCurrentSelectedValue = async (checkOptions, res) => {
        let value;
        switch (checkOptions) {
            case await res.selectValue1:
                value = today();
                break;
            case await res.selectValue2:
                value = yesterday();
                break;
            case await res.selectValue3:
                value = thisWeek();
                break;
            case await res.selectValue4:
                value = lastWeek();
                break;
            case await res.selectValue5:
                value = thisMonth();
                break;
            case await res.selectValue6:
                value = lastMonth();
                break;
        }
        return value
    };

    // -----------------function for the date selection-----------------
    function today() {
        return {
            startDate: moment(new Date()).format("YYYY-MM-DD"),
            endDate: moment(new Date()).format("YYYY-MM-DD")
        }
    };

    function yesterday() {
        var date = new Date();
        date.setDate(date.getDate() - 1);
        return {
            startDate: moment(date).format("YYYY-MM-DD"),
            endDate: moment(date).format("YYYY-MM-DD")
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
            startDate: moment(prevMonday).format("YYYY-MM-DD"),
            endDate: moment(new Date()).format("YYYY-MM-DD")
        }
    };

    function lastWeek() {
        var beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000);
        var day = beforeOneWeek.getDay();
        var diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1);
        var firstday = new Date(beforeOneWeek.setDate(diffToMonday));
        var lastday = new Date(beforeOneWeek.setDate(diffToMonday + 6));
        return {
            startDate: moment(firstday).format("YYYY-MM-DD"),
            endDate: moment(lastday).format("YYYY-MM-DD")
        }
    }

    function thisMonth() {
        var date = new Date();
        var firstday = new Date(date.getFullYear(), date.getMonth(), 1);
        return {
            startDate: moment(firstday).format("YYYY-MM-DD"),
            endDate: moment(new Date()).format("YYYY-MM-DD")
        }
    };

    function lastMonth() {
        var date = new Date();
        var firstday = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        var lastday = new Date(date.getFullYear(), date.getMonth(), 0);
        return {
            startDate: moment(firstday).format("YYYY-MM-DD"),
            endDate: moment(lastday).format("YYYY-MM-DD")
        }
    };

    async function getAllAppDataMetafields() {
        const dataArray = await appMetafield.getAllAppMetafields();
        let isMultiWish = null;
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "general-setting") {
                let dData = JSON.parse(dataArray[i].node.value);
                setWishlistTextDirection(dData.wishlistTextDirection);
            };

            if (dataArray[i].node.key === "is-Multi-wishlist") {
                let dData = dataArray[i].node.value;
                setIsMultiWishlist(dData.replace(/"/g, ''));
                isMultiWish = dData
            }
        }

        // console.log("is", isMultiWish)
        return { isMultiWish }
    };

    const filteredAndSortedDataComponent = useMemo(() => {
        if (queryCheckValue.data === "cart") {
            let filteredCartData = cartSearchData.slice();
            if (queryCartValue) {
                const searchValue = queryCartValue.toLowerCase();
                filteredCartData = cartSearchData.filter(item => {

                    let totalPrice = item.price * item.quantity

                    return item.title.toLowerCase().includes(searchValue) ||
                        item.wishlist_name.toLowerCase().includes(searchValue) ||
                        item.price.toString().includes(searchValue) ||
                        item.quantity.toString().includes(searchValue) ||
                        totalPrice.toString().includes(searchValue)
                }
                );
            }
            if (sortCartSelected.length > 0) {
                if (sortCartSelected[0] === 'date asc') {
                    filteredCartData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                } else if (sortCartSelected[0] === 'date desc') {
                    filteredCartData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                }
                else if (sortCartSelected[0] === 'title desc') {
                    filteredCartData.sort((a, b) => b.title.localeCompare(a.title));
                } else if (sortCartSelected[0] === 'title asc') {
                    filteredCartData.sort((a, b) => a.title.localeCompare(b.title));
                }

                else if (sortCartSelected[0] === 'price desc') {
                    filteredCartData.sort((a, b) => b.price - a.price);
                } else if (sortCartSelected[0] === 'price asc') {
                    filteredCartData.sort((a, b) => a.price - b.price);
                }
                else if (sortCartSelected[0] === 'quantity desc') {
                    filteredCartData.sort((a, b) => b.total_quantity - a.total_quantity);
                } else if (sortCartSelected[0] === 'quantity asc') {
                    filteredCartData.sort((a, b) => a.total_quantity - b.total_quantity);
                }
                else {
                    console.log("");
                }
            }
            return { data: queryCheckValue.data, value: filteredCartData };
        } else {
            let filteredData = mainData.slice();
            if (queryValue) {
                const searchValue = queryValue.toLowerCase();
                filteredData = mainData.filter(item =>
                    item.title.toLowerCase().includes(searchValue) ||
                    item.wishlist_name.toLowerCase().includes(searchValue) ||
                    item.price.toString().includes(searchValue) ||
                    item.total_quantity.toString().includes(searchValue)
                );
            }

            if (sortSelected.length > 0) {
                if (sortSelected[0] === 'date asc') {
                    filteredData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                } else if (sortSelected[0] === 'date desc') {
                    filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                } else if (sortSelected[0] === 'title desc') {
                    filteredData.sort((a, b) => b.title.localeCompare(a.title));
                } else if (sortSelected[0] === 'title asc') {
                    filteredData.sort((a, b) => a.title.localeCompare(b.title));
                } else if (sortSelected[0] === 'price desc') {
                    filteredData.sort((a, b) => b.price - a.price);
                } else if (sortSelected[0] === 'price asc') {
                    filteredData.sort((a, b) => a.price - b.price);
                }
                else if (sortSelected[0] === 'quantity desc') {
                    filteredData.sort((a, b) => b.total_quantity - a.total_quantity);
                } else if (sortSelected[0] === 'quantity asc') {
                    filteredData.sort((a, b) => a.total_quantity - b.total_quantity);

                } else if (sortSelected[0] === 'wishlist desc') {
                    filteredData.sort((a, b) => b.wishlist_name.localeCompare(a.wishlist_name));

                } else {
                    filteredData.sort((a, b) => a.wishlist_name.localeCompare(b.wishlist_name));


                }

            }

            return { data: queryCheckValue.data, value: filteredData };
        }
    }, [queryCheckValue, queryValue, sortSelected, sortCartSelected, currentCartPage, currentPage, listingPerPage]);


    let map = new Map();
    map.set("a", { val: startIndexValue.current.start });
    map.get("a").val++;

    let cartMap = new Map();
    cartMap.set("a", { val: startIndexCartValue.current.start });
    cartMap.get("a").val++;

    useEffect(() => {
        const { data, value } = filteredAndSortedDataComponent;
        if (data === "cart") {
            totalRecordsCart.current = value.length;
            const { startCartIndex, endCartIndex } = calculateIndexes(currentCartPage, listingPerPage, "cart");
            setCartData(value.slice(startCartIndex, endCartIndex));
        }
        else {
            totalRecords.current = value.length;
            const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage, "");
            setUserList(value.slice(startIndex, endIndex));
        }
    }, [filteredAndSortedDataComponent]);


    const onHandleCancel = () => { };

    const handleSortChange = useCallback((value) => {
        setSortSelected(value)
        setIsClicked(!isClicked)
        setQueryCheckValue({ data: "" })

    }, []);

    const handleFiltersQueryChange = useCallback((value, data) => {
        if (data === "cart") {
            if (value === "") {
                searchParams.delete("cartsearch")
                Navigate({ search: `?${searchParams.toString()}` });
            } else {
                searchParams.set("cartsearch", value)
                Navigate({ search: `?${searchParams.toString()}` });
            }
            setQueryCartValue(value)
        } else {
            if (value === "") {
                searchParams.delete("itemsearch")
                Navigate({ search: `?${searchParams.toString()}` });
            } else {
                searchParams.set("itemsearch", value)
                Navigate({ search: `?${searchParams.toString()}` })
            }
            setQueryValue(value)
        }
        setQueryCheckValue({ data: data })
        setIsClicked(!isClicked)
    }, []);


    const handleSortCartChange = useCallback((value) => {
        setSortCartSelected(value)
        setQueryCheckValue({ data: "cart" })
        setIsClicked(!isClicked)
    }, []);


    const handleQueryValueRemove = useCallback((data) => {
        if (data === "cart") {
            setQueryCartValue('')
            searchParams.delete("cartsearch")
            Navigate({ search: `?${searchParams.toString()}` });
        } else {
            setQueryValue('')
            searchParams.set("itemsearch", value)
            Navigate({ search: `?${searchParams.toString()}` })
        }
    }, []);

    const handleFiltersClearAll = useCallback((data) => {
        handleQueryValueRemove(data);
    }, [
        handleQueryValueRemove,
    ]);

    function calculateIndexes(currentPage, listingPerPage, data) {
        if (data === "cart") {
            const startCartIndex = (currentPage - 1) * parseInt(listingPerPage);
            const endCartIndex = startCartIndex + parseInt(listingPerPage);
            startIndexCartValue.current = { start: startCartIndex, end: endCartIndex }
            return { startCartIndex, endCartIndex }
        } else {
            const startIndex = (currentPage - 1) * parseInt(listingPerPage);
            const endIndex = startIndex + parseInt(listingPerPage);
            startIndexValue.current = { start: startIndex, end: endIndex }
            return { startIndex, endIndex };
        }

    };

    const deleteUserHandle = async (val, variantId) => {
        // console.log("variantId", variantId);
        const shopApi = await ShopApi.shop();
        let requestBodyDelete = {
            shopName: shopApi.shopName,
            wishlistId: Number(val),
            userTableId: Number(id.CurrentWishlistUserData),
            variantId: variantId
        };
        if (itemCustomRecord !== "all") {
            const result = await checkCurrentSelectedValue(itemCustomRecord, myLanguage)
            requestBodyDelete.startDate = result.startDate;
            requestBodyDelete.endDate = result.endDate;
            requestBodyDelete.checkStatusInItem = true
        }
        else {
            requestBodyDelete.checkStatusInItem = false
        }
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
                Swal.fire({
                    text: myLanguage.swalWaiting,
                    imageUrl: loaderGif,
                    showConfirmButton: false,
                });

                try {
                    const userDatad = await fetch(`${serverURL}/remove-wishlist-Data-by-id`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(requestBodyDelete),
                    });
                    const result = await userDatad.json()
                    userData[0].wishlistItemCount = result.productResult.length

                    if (selectedWishlistItem !== "all") {
                        setAllWishlistData(result.productResult)
                        setCheckWishlistItem(result.productResult.length)
                        const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage, "");
                        const defaddultItems = result.productResult.filter(item => item.wishlist_name === selectedWishlistItem);
                        totalRecords.current = defaddultItems.length;
                        setMainData(defaddultItems);
                        setUserList(defaddultItems.slice(startIndex, endIndex));
                    } else {
                        setAllWishlistData(result.productResult)
                        const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage, "");
                        totalRecords.current = result.productResult.length;
                        setMainData(result.productResult);
                        setUserList(result.productResult.slice(startIndex, endIndex));
                    }
                    Swal.fire({
                        icon: "success",
                        title: "success!",
                        text: myLanguage.deleteItem,

                    });
                    // console.log("userData[2]",userData[0].wishlistItemCount=100);


                } catch (err) {
                    console.log("errr", err);
                }
            }
        });

    }




    const userDataTable = userData.map(({ name, email, wishlistItemCount, addToCartCount, type }, index) => (
        <IndexTable.Row id={index} key={index} position={index}>
            {/* <IndexTable.Cell>{name}</IndexTable.Cell> */}
            {/* {type === "User" ? <IndexTable.Cell>{email}</IndexTable.Cell> : <div className='show-less-text' ><IndexTable.Cell>{email}</IndexTable.Cell></div>} */}
            <IndexTable.Cell>{email.length > 30 ? email.substring(0, 30) + '...' : email}</IndexTable.Cell>
            <IndexTable.Cell>{isEmail.current.length > 30 ? isEmail.current.substring(0, 30) + '...' : isEmail.current}</IndexTable.Cell>
            <IndexTable.Cell>{wishlistItemCount}</IndexTable.Cell>
            <IndexTable.Cell>{addToCartCount}</IndexTable.Cell>
            <IndexTable.Cell>{type}</IndexTable.Cell>

        </IndexTable.Row>
    ));

    const wishlistDataTable = userList.map(({ id, variant_id, title, price, image, total_quantity, created_at, wishlist_name }, index) => (
        <IndexTable.Row id={index} key={index} position={index}>
            <IndexTable.Cell>{map.get("a").val++}</IndexTable.Cell>
            <IndexTable.Cell>{title}</IndexTable.Cell>
            <IndexTable.Cell><img src={image} alt='image' height="40px" width="40px" /></IndexTable.Cell>
            <IndexTable.Cell>{price}</IndexTable.Cell>
            <IndexTable.Cell>{total_quantity}</IndexTable.Cell>
            <IndexTable.Cell>{wishlist_name}</IndexTable.Cell>
            <IndexTable.Cell>{extractedDate(created_at)}</IndexTable.Cell>
            <IndexTable.Cell><Button onClick={() => deleteUserHandle(id, variant_id)}><Icon source={DeleteMajor} color="base" /></Button></IndexTable.Cell>
        </IndexTable.Row>
    ));

    const cartWishlistTable = cartData.map(
        ({ title, price, image, created_at, quantity }, index) => {
            return (
                <IndexTable.Row id={index} key={index} position={index}>
                    <IndexTable.Cell>{cartMap.get("a").val++}</IndexTable.Cell>
                    <IndexTable.Cell>{title}</IndexTable.Cell>
                    <IndexTable.Cell><img src={image} alt='image' height="40px" width="40px" /></IndexTable.Cell>
                    <IndexTable.Cell>{price}</IndexTable.Cell>
                    <IndexTable.Cell>{quantity}</IndexTable.Cell>
                    <IndexTable.Cell>{price * quantity}</IndexTable.Cell>
                    <IndexTable.Cell>{extractedDate(created_at)}</IndexTable.Cell>
                </IndexTable.Row>
            )
        },
    );

    const handlePagination = async (newPage) => {
        setCurrentPage(newPage);
        setIsClicked(!isClicked)
        setQueryCheckValue({ data: "" })
        searchParams.set("wishlistitempageno", newPage, currentPage)
        Navigate({ search: `?${searchParams.toString()}` });
    };

    const handleCartPagination = async (newPage) => {
        setCurrentCartPage(newPage)
        setIsClicked(!isClicked)
        setQueryCheckValue({ data: "cart" })
        searchParams.set("cartitempageno", newPage)
        Navigate({ search: `?${searchParams.toString()}` });

    }

    function recordPerPageFxn(value) {
        setIsItemLoading(!isItemLoading)
        setIsCartLoading(!isCartLoading)
        setListingPerPage(parseInt(value));
        setIsClicked(!isClicked)
        if (value === "custom") {
            setCheckDatePicker(!checkDatePicker)
        }
        setCurrentPage(1)
        setCurrentCartPage(1)
        setQueryCheckValue({ data: "" })
        setQueryCheckValue({ data: "cart" })
        searchParams.set("rpr", value)
        searchParams.set("cartitempageno", 1)
        searchParams.set("wishlistitempageno", 1)
        Navigate({ search: `?${searchParams.toString()}` });
        setTimeout(() => {
            setIsItemLoading(isItemLoading)
            setIsCartLoading(isCartLoading)
        }, 800)
    };

    async function checkGetAllItem(checkSelectedLabel, checkSelectedData, shopApi, resp) {
        // console.log("NNN ", checkSelectedLabel, checkSelectedData, shopApi, resp)
        if (resp === "resp") {
            setIsCartLoading(!isCartLoading)
            setIsItemLoading(!isItemLoading)
        }
        let requestBody = {
            shopName: shopApi.shopName,
            wishlistId: Number(id.CurrentWishlistUserData),
        };
        if (checkSelectedLabel !== "all") {
            requestBody.startDate = checkSelectedData.startDate;
            requestBody.endDate = checkSelectedData.endDate;
            requestBody.checkStatusInItem = true
        } else {
            requestBody.checkStatusInItem = false
        }
        try {
            const userData = await fetch(`${serverURL}/get-current-user-wishlist-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            let result = await userData.json();
            setSharedWishlistArr(result.wishlistData)
            setCheckCurrentItemData(result.productResult)
            if (selectedWishlistItem !== "all") {
                setAllWishlistData(result.productResult)
                const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage, "");
                const { startCartIndex, endCartIndex } = calculateIndexes(currentCartPage, listingPerPage, "cart");
                const defaddultItems = result.productResult.filter(item => item.wishlist_name === selectedWishlistItem);
                totalRecords.current = defaddultItems.length;
                setMainData(defaddultItems);
                setUserList(defaddultItems.slice(startIndex, endIndex));
                totalRecordsCart.current = result.cartData.length
                setCartSearchData(result.cartData);
                setCartData(result.cartData.slice(startCartIndex, endCartIndex))
            } else {
                setAllWishlistData(result.productResult)
                const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage, "");
                const { startCartIndex, endCartIndex } = calculateIndexes(currentCartPage, listingPerPage, "cart");
                totalRecords.current = result.productResult.length;
                setMainData(result.productResult);
                setUserList(result.productResult.slice(startIndex, endIndex));
                setCartSearchData(result.cartData);
                totalRecordsCart.current = result.cartData.length
                setCartData(result.cartData.slice(startCartIndex, endCartIndex))
            }
            if (resp === "resp") {
                setIsCartLoading(isCartLoading)
                setIsItemLoading(isItemLoading)
            }
        } catch (error) {
            console.log("errr ", error);
        }
    }

    const selectDateHandler = async (value) => {

        // console.log("VVVV ", value)


        if (value === "custom") {
            setActive(!active)
            setCheckCurrentOptions(value)
            setCheckDatePicker(!checkDatePicker)
            searchParams.set("wishlistdata", `all`)
            Navigate({ search: `?${searchParams.toString()}` });
        }
        else {
            setIsItemLoading(!isItemLoading)
            setIsCartLoading(!isCartLoading)
            const shopApi = await ShopApi.shop();
            setCheckCurrentOptions(value)
            let checkSelectedData = ""
            if (value !== "all") {
                checkSelectedData = await checkCurrentSelectedLabel(value)
            } else {
                checkSelectedData = value
            }
            let checkAll = (value !== "all") ? JSON.parse(value) : value
            await checkGetAllItem(checkSelectedData, checkAll, shopApi, "")
            searchParams.set("wishlistdata", `${checkSelectedData}`)
            Navigate({ search: `?${searchParams.toString()}` });
            setIsItemLoading(isItemLoading)
            setIsCartLoading(isCartLoading)
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

    const handleClick = () => {
        Navigate(-1);
    }

    const hanldeClicks = async () => {
        // setIsItemLoading(!isItemLoading)
        const shopApi = await ShopApi.shop();
        let requestBodyDelete = {
            shopName: shopApi.shopName,
            wishlistId: Number(id.CurrentWishlistUserData),
        };
        Swal.fire({
            title: myLanguage.swalDeleteHeading,
            text: myLanguage.swalDeleteText,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#f54542",
            cancelButtonColor: "#3085d6",
            confirmButtonText: myLanguage.swalDeleteConfirm,
            cancelButtonText: myLanguage.swalButtonCancelText
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    text: myLanguage.swalWaiting,
                    imageUrl: loaderGif,
                    showConfirmButton: false,
                });
                try {
                    const userDatarRecord = await fetch(`${serverURL}/clear-wishlist-Data`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(requestBodyDelete),
                    });
                    const datas = await userDatarRecord.json()
                    if (Array.isArray(userData) && userData.length > 0) {
                        userData[0].wishlistItemCount = 0;

                    }


                    if (totalRecords && totalRecords.current !== undefined) {
                        totalRecords.current = 0;
                    }

                    if (datas.msg === "deleted") {
                        setUserList([])
                        setMainData([])

                        Swal.fire({
                            icon: "success",
                            title: "success!",
                            text: myLanguage.deleteItem,

                        });
                    }
                } catch (err) {
                    console.log("errr");
                }
            }
        })
    }

    const wishlistItemHandler = (value) => {
        setIsItemLoading(!isItemLoading)
        searchParams.set("wishlistname", `${value}`)
        Navigate({ search: `?${searchParams.toString()}` });
        setSelectedWishlistItem(value)

        // console.log("value", value, "checkCurrentOptions", checkCurrentOptions)
        if (value === "all" && checkCurrentOptions === "all") {
            const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage, "");
            totalRecords.current = checkCurrentItemData.length;
            setMainData(checkCurrentItemData);
            setUserList(checkCurrentItemData.slice(startIndex, endIndex));
        } else if (value !== "all" && checkCurrentOptions === "all") {
            const defaddultItems = checkCurrentItemData.filter(item => item.wishlist_name === value);
            const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage, "");
            totalRecords.current = defaddultItems.length;
            setMainData(defaddultItems);
            setUserList(defaddultItems.slice(startIndex, endIndex));
        } else if (value === "all" && checkCurrentOptions !== "all") {
            const defaddultItems = checkCurrentItemData.filter(item => item.wishlist_name === "default");
            const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage, "");

            if (getCurrentPlan.current > 3 && ismultiwishlist === "yes") {
                totalRecords.current = checkCurrentItemData.length;
                setMainData(checkCurrentItemData);
                setUserList(checkCurrentItemData.slice(startIndex, endIndex));
            } else {
                totalRecords.current = defaddultItems.length;
                setMainData(defaddultItems);
                setUserList(defaddultItems.slice(startIndex, endIndex));
            }


            // totalRecords.current = checkCurrentItemData.length;
            // setMainData(checkCurrentItemData);
            // setUserList(checkCurrentItemData.slice(startIndex, endIndex));
        } else if (value !== "all" && checkCurrentOptions !== "all") {
            const defaddultItems = checkCurrentItemData.filter(item => item.wishlist_name === value);
            const { startIndex, endIndex } = calculateIndexes(currentPage, listingPerPage, "");
            totalRecords.current = defaddultItems.length;
            setMainData(defaddultItems);
            setUserList(defaddultItems.slice(startIndex, endIndex));
        }
        setTimeout(() => {
            setIsItemLoading(isItemLoading)
        }, 800)
    }

    const handleChange = useCallback(() => setActive(!active), [active]);
    const getDataWithDate = async () => {
        const shopApi = await ShopApi.shop();
        let startDate = moment(new Date(selectedDates.start)).format("YYYY-MM-DD");
        let endDate = moment(new Date(selectedDates.end)).format("YYYY-MM-DD");
        let data = {
            startDate: startDate,
            endDate: endDate
        }
        setActive(!active)
        await checkGetAllItem("custom", data, shopApi, "resp")
    }

    const handleGoToPlan = () => {
        // window.top.location.href = `https://${shopData.domain}/admin/apps/${appName}/PricingPlan`;

        Navigate({
            pathname: `/PricingPlan`,
            search: ``
        })
    }


    const handleModalChange = useCallback((currentLanguage) => {
        // console.log("getCurrentPlan", getCurrentPlan);
        if (getCurrentPlan.current >= 2) {
            setModalActive(!modalActive)
        } else {

            Swal.fire({
                title: currentLanguage.shareWishlistSwalTitle,
                text: currentLanguage.paidPlanHeading,
                icon: "warning",
                confirmButtonText: currentLanguage.upgrade,
                preConfirm: () => {
                    handleGoToPlan();
                }
            })



        }

    }, [modalActive]);



    function copyUrl() {


        if (!currentShopData.domain.endsWith('/')) {
            currentShopData.domain += '/';
        }
        let pageUrl
        let encryptId = btoa(sharedWishlistArr[0].id)

        // if (currentShopData.domain === 'rubychikankari.com' || currentShopData.domain === 'preahkomaitland.com.au') {
        //     pageUrl = `https://${currentShopData.domain}pages/shared-wishlist?id=${encryptId}`;
        // } else {
        pageUrl = `https://${currentShopData.domain}apps/wg-wishlist?id=${encryptId}`;
        // }


        return pageUrl


    }
    const textCopyHandler = (data) => {
        navigator.clipboard.writeText(data);
        toggleActive();
    };


    // if(modalSwalActive){





    // }

    // console.log("selectedItemOption", selectedItemOption)
    function renderAdminOption() {
        const filteredArray = selectedItemOption.filter(obj => ['All', 'Default'].includes(obj.label));
        return filteredArray
    }

    return (
        <div dir={wishlistTextDirection} className='wf-dashboard wf-dashboard-report wf-currentWishlistUser'>
            {!isloading ? <SkeletonPage1 /> :
                <Frame>
                    <Modal
                        open={modalActive}
                        onClose={handleModalChange}
                        title={myLanguage.shareWishlistModalHeading}
                    >
                        <Modal.Section>

                            <div className='wf-collection-IconBtn'>
                                <div className="wf-collection-inner">
                                    <div className="wf-IconBtn-box">
                                        <TextField value={copyUrl()} />
                                        <div className="copyIcon" onClick={() => textCopyHandler(copyUrl())}>
                                            <img src={collectionCopyIcon} alt="Collect Copy Icon" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </Modal.Section>

                    </Modal>







                    <Page fullWidth title={myLanguage.reportPageFullDetailedTitle} subtitle={myLanguage.reportPageFullDetailedSubTitle}

                        secondaryActions={[{
                            // content: <div className='wf-style-wishbtn currentWishlistUser'><div className='customer-recently-table'>
                            //     <IndexTable
                            //         itemCount={userData.length}

                            //         headings={[
                            //             // { title: myLanguage.userWishlistName },
                            //             { title: myLanguage.userWishlistEmail },
                            //             { title: "Referred by" },
                            //             // { title: myLanguage.userWishlistCount },
                            //             // { title: myLanguage.userAddToCartCount },
                            //             { title: "User type" },
                            //             // { title: "user created" },
                            //             // { title: "Last activity" },

                            //         ]}
                            //         selectable={false}
                            //     >
                            //         {userDataTable}

                            //     </IndexTable>
                            // </div>
                            // </div>
                        }]}

                        backAction={{ onAction: () => history.back() }}
                    >
                        <AlphaCard >

                            <div className='wf-style-wishbtn currentWishlistUser'>
                                <div className='customer-recently-table'>
                                    <IndexTable
                                        itemCount={userData.length}

                                        headings={[
                                            // { title: myLanguage.userWishlistName },
                                            { title: myLanguage.userWishlistEmail },
                                            { title: "Referred by" },
                                            { title: myLanguage.userWishlistCount },
                                            { title: myLanguage.userAddToCartCount },
                                            { title: "User type" },
                                            // { title: "user created" },
                                            // { title: "Last activity" },

                                        ]}
                                        selectable={false}
                                    >
                                        {userDataTable}

                                    </IndexTable>
                                </div>
                            </div>

                            <div className='wf-overview-inner '>
                                <div id='boxx-shadow'>
                                    <Grid >
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                            <div className='pb-15'>
                                                <Text variant="headingLg" as="h3">{myLanguage.wishlistNameHeading}</Text>
                                            </div>
                                            <Select
                                                options={getCurrentPlan.current > 3 && ismultiwishlist === "yes" ? selectedItemOption : renderAdminOption()}
                                                onChange={wishlistItemHandler}
                                                value={selectedWishlistItem}
                                            />
                                        </Grid.Cell>

                                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                            <div className='wf-dashboard-box-inner deleteWishlistItem'>
                                                <div className='pb-15'>
                                                    <Text variant="headingLg" as="h3">{myLanguage.clearAllWishlistItem}</Text>
                                                </div>
                                                <Button onClick={hanldeClicks}>{myLanguage.tableDelete}</Button>
                                            </div>
                                        </Grid.Cell>

                                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                            <div className='pb-15'>
                                                <Text variant="headingLg" as="h3">{myLanguage.userListingRecordsPerPage}</Text>
                                            </div>
                                            <Select
                                                options={options}
                                                onChange={recordPerPageFxn}
                                                value={listingPerPage}
                                            />
                                        </Grid.Cell>

                                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                            <div className='pb-15'>
                                                <Text variant="headingLg" as="h3">{myLanguage.quickOverViewDate}</Text>
                                            </div>
                                            <Select options={selectedWishlistItemOption} onChange={selectDateHandler}
                                                value={checkCurrentOptions}
                                            />
                                        </Grid.Cell>

                                    </Grid>
                                </div>
                            </div>
                        </AlphaCard>

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

                        <WishlistDataTable myLanguage={myLanguage} options={options} recordPerPageFxn={recordPerPageFxn} listingPerPage={listingPerPage} selectedWishlistItemOption={selectedWishlistItemOption} selectDateHandler={selectDateHandler} checkCurrentOptions={checkCurrentOptions} sortOptions={itemSortOptions} sortSelected={sortSelected} queryValue={queryValue} handleFiltersQueryChange={handleFiltersQueryChange} setQueryValue={setQueryValue} hanldeClicks={hanldeClicks} handleFiltersClearAll={handleFiltersClearAll} userList={userList} startIndexValue={startIndexValue} totalRecords={totalRecords} wishlistDataTable={wishlistDataTable} handleSortChange={handleSortChange} currentPage={currentPage} handlePagination={handlePagination} isItemLoading={isItemLoading} selectedWishlistItem={selectedWishlistItem} wishlistItemHandler={wishlistItemHandler} selectedItemOption={selectedItemOption} month={month} year={year} setSelectedDates={setSelectedDates} handleMonthChange={handleMonthChange} selectedDates={selectedDates} checkDatePicker={checkDatePicker} handleModalChange={handleModalChange} />

                        <CartDataTable myLanguage={myLanguage} options={selectOptions} recordPerCartPageFxn={recordPerPageFxn} listingPerCartPage={listingPerPage} selectedCartItemOption={selectedWishlistItemOption} selectDateCartHandler={selectDateHandler} checkCurrentCartOptions={checkCurrentOptions} sortOptions={sortOptions} sortCartSelected={sortCartSelected} queryCartValue={queryCartValue} handleFiltersQueryChange={handleFiltersQueryChange} setQueryCartValue={setQueryCartValue} onHandleCancel={onHandleCancel} handleFiltersClearAll={handleFiltersClearAll} cartData={cartData} startIndexCartValue={startIndexCartValue} totalRecordsCart={totalRecordsCart} cartWishlistTable={cartWishlistTable} handleSortCartChange={handleSortCartChange} currentCartPage={currentCartPage} handleCartPagination={handleCartPagination} isCartLoading={isCartLoading} />



                        <div className='wf-analatic-footer'>
                            <Footer myLanguage={myLanguage} />
                        </div>

                        {toastMarkup}

                    </Page>

                </Frame>
            }


        </div>
    );
};

export default GetWishlistData;