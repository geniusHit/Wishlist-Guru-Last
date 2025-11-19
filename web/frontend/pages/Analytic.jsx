import {
    Page, Grid, LegacyCard, Text, AlphaCard, IndexTable, Tooltip as Tool, useIndexResourceState, RangeSlider, Collapsible
} from '@shopify/polaris';
import { Spinner } from '@shopify/polaris';
import React, { useEffect, useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useApi from '../hooks/useApi';
import moment from 'moment-js'
import SkeletonPage1 from './SkeletonPage1';
import { ButtonGroup, Button } from '@shopify/polaris';
import useAppMetafield from '../hooks/useAppMetafield';
import useUtilityFunction from '../hooks/useUtilityFunction';
import { DatePicker } from '@shopify/polaris';
import { Modal } from '@shopify/polaris';
import { Constants } from '../../backend/constants/constant';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import searchIcon from '../assets/search_icon.svg';
import Swal from 'sweetalert2';

export default function Analytic() {
    const { appName, extAppName, extName, port, serverURL } = Constants;
    const navigate = useNavigate();

    const shopApi = useApi();
    const appMetafield = useAppMetafield();
    const utilityFunction = useUtilityFunction();

    const [isloading, setIsLoading] = useState(false);
    const [wishlistTextDirection, setWishlistTextDirection] = useState("");

    const [wishlistQuotaNum, setWishlistQuotaNum] = useState('');
    const [wishlistQuota, setWishlistQuota] = useState([]);
    const [wishlistQuotaPercentage, setWishlistQuotaPercentage] = useState(0);
    const [allUser, setAllUser] = useState([]);
    const [allUserData, setAllUserData] = useState([]);
    const [topData, setTopData] = useState([]);
    const [recentData, setRecentData] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState({ items: 0, amount: 0 });

    const [loadSelectedDate, setLoadSelectedDate] = useState(false);
    const [activeButtonIndex, setActiveButtonIndex] = useState(0);
    const [userGraph, setUserGraph] = useState([]);
    const [itemGraph, setItemGraph] = useState([]);
    const [loadGraph, setLoadGraph] = useState(false);
    const [myLanguage, setMyLanguage] = useState({});
    const [currPlan, setCurrPlan] = useState("");
    const [selectedValue, setSelectedValue] = useState("");
    const [shopCurrency, setShopCurrency] = useState("");


    // const [openCalander, setOpenCalander] = useState(false);
    const [emptyArr, setEmptyArr] = useState({ emptyItems: "", emptyUsers: "" });

    const [{ month, year }, setDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
    const [selectedDates, setSelectedDates] = useState({
        start: new Date(),
        end: new Date(),
    });

    const handleMonthChange = useCallback(
        (month, year) => setDate({ month, year }),
        [],
    );

    const getDataWithDate = () => {
        setEmptyArr({ emptyItems: "", emptyUsers: "" });
        handleChange();
        monthlyGraphDataFunction(selectedDates);
    }

    // console.log("GGGGGG ", selectedDates)


    const handleButtonClick = (index) => {
        setEmptyArr({ emptyItems: "", emptyUsers: "" });

        setActiveButtonIndex(index);
        if (index === 0) {
            monthlyGraphDataFunction();
        } else {
            yearlyGraphDataFunction();
        }
    };

    useEffect(() => {
        useEffectLite();
    }, []);

    async function useEffectLite() {
        await utilityFunction.getCurrentLanguage().then((res) => {
            setMyLanguage(res);
            setIsLoading(true);
        });
        const getPlanHere = await appMetafield.getCurrentPlan();
        setCurrPlan(getPlanHere.currentPlan);
        await utilityFunction.getPlanFirst();
        const todayDate = today();
        getDataAccordingToDates(todayDate);
        const monthDate = thisMonth();
        getMonthlyQuotaOfWishlist(monthDate);
        getTopDataRecentData();
        monthlyGraphDataFunction();
        getAllAppDataMetafields();
    }

    function paidPlanModal() {
        Swal.fire({
            title: myLanguage.shareWishlistSwalTitle,
            text: myLanguage.paidPlanHeading,
            icon: "warning",
            confirmButtonText: myLanguage.upgrade,
            preConfirm: () => {

                navigate({
                    pathname: "/PricingPlan",
                    search: ``
                })
            }
        })
    }

    async function getAllAppDataMetafields() {
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "general-setting") {
                let dData = JSON.parse(dataArray[i].node.value);
                setWishlistTextDirection(dData.wishlistTextDirection);
            };
        }
    };

    function lastMonthArray() {
        const arr = []
        for (let index = 0; index <= 31; index++) {
            const start = new Date();
            arr.push({ date: moment(new Date(start.getFullYear(), start.getMonth(), start.getDate() - index)).format("YYYY-MM-DD") })
        }
        return arr;
    };

    async function monthlyGraphDataFunction(dateRange) {
        let currentDate;
        let prevOneMonth;
        let prevOneYear;

        // console.log("GGGGGG ", dateRange)

        if (dateRange === undefined) {
            setLoadGraph(false);
            currentDate = moment(new Date()).format("YYYY-MM-DD");
            prevOneMonth = moment(new Date().setDate(new Date().getDate() - 31)).format("YYYY-MM-DD");
            prevOneYear = moment(new Date().setFullYear(new Date().getFullYear() - 1)).format("YYYY-MM-DD");
        } else {
            setLoadGraph(false);
            currentDate = moment(new Date(dateRange.end)).format("YYYY-MM-DD");
            prevOneMonth = moment(new Date(dateRange.start)).format("YYYY-MM-DD");
            prevOneYear = moment(new Date().setFullYear(new Date().getFullYear() - 1)).format("YYYY-MM-DD");
        }

        const shopName = await shopApi.shop();
        // getCurrencyFxn(shopName);

        // console.log("currentDate --", currentDate);
        // console.log("prevOneMonth --", prevOneMonth);
        // console.log("prevOneYear --", prevOneYear);

        // setLoadGraph(false);
        // const currentDate = moment(new Date()).format("YYYY-MM-DD");
        // const prevOneMonth = moment(new Date().setDate(new Date().getDate() - 31)).format("YYYY-MM-DD");
        // const prevOneYear = moment(new Date().setFullYear(new Date().getFullYear() - 1)).format("YYYY-MM-DD");
        // const shopName = await shopApi.shop();


        try {
            const userData = await fetch(`${serverURL}/admin-graph-data-monthly`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shopName.shopName,
                    currentDate: currentDate,
                    prevOneMonth: prevOneMonth,
                    prevOneYear: prevOneYear
                }),
            });
            let result = await userData.json();
            setLoadGraph(true);
            // const monthlyItems = extractMonthlyData(result.lastMonthItems, "Items");
            const monthlyItems = (dateRange === undefined) ? extractMonthlyData(result.lastMonthItems, "Items") : extractSpecificData(result.lastMonthItems, "Items");
            // console.log("111111111111111--- ", monthlyItems);
            setItemGraph(monthlyItems);
            // const monthlyUsers = extractMonthlyData(result.lastMonthUsers, "Users");
            const monthlyUsers = (dateRange === undefined) ? extractMonthlyData(result.lastMonthUsers, "Users") : extractSpecificData(result.lastMonthUsers, "Users");
            setUserGraph(monthlyUsers);
        } catch (error) {
            console.log("errr ", error)
        }
    };

    async function yearlyGraphDataFunction() {
        setLoadGraph(false);
        const shopName = await shopApi.shop();
        try {
            const userData = await fetch(`${serverURL}/admin-graph-data-yearly`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shopName.shopName,
                }),
            });
            let result = await userData.json();
            setLoadGraph(true);
            let yearlyItems = extractYearlyData(result.lastYearItems, "Items");
            // console.log("2222222222222 ", yearlyItems)
            setItemGraph(yearlyItems);
            let yearlyUsers = extractYearlyData(result.lastYearUsers, "Users");
            setUserGraph(yearlyUsers);
        } catch (error) {
            console.log("errr ", error)
        }
    };


    function extractSpecificData(dataArr, handleName) {
        if (dataArr.length === 0 && handleName === "Items") {
            setEmptyArr(prevState => ({ ...prevState, emptyItems: "zero" }));
        }
        else if (dataArr.length === 0 && handleName === "Users") {
            setEmptyArr(prevState => ({ ...prevState, emptyUsers: "zero" }));
        };
        let monthlyItems = [];
        dataArr.map((data, index) => {
            monthlyItems.push({ date: new Date(moment(data.date).format("MM-DD-YYYY")).toLocaleDateString('en-us', { year: "numeric", month: "short", day: "numeric" }), [handleName]: data.total_count })
        })
        // console.log("CC ", monthlyItems)
        return monthlyItems
    }


    function extractMonthlyData(dataArr, handleName) {
        let monthlyItems = [];
        const lastMonthArr = lastMonthArray();
        lastMonthArr.map((data) => {
            const found = dataArr.find((element) => moment(element.date).format("YYYY-MM-DD") === data.date);
            let dd = data.date.split("-");
            const formattedDate = new Date(`${dd[0]}-${dd[1]}-${dd[2]}`).toLocaleDateString('en-us', {
                month: "short",
                day: "numeric",
                year: 'numeric'
            });
            if (found) {
                monthlyItems.push({ date: formattedDate, [handleName]: found.total_count })
            } else {
                monthlyItems.push({ date: formattedDate, [handleName]: 0 })
            }
        })
        return monthlyItems.reverse();
    };

    function extractYearlyData(dataArr, handleName) {
        let yearlyData = [];
        const lastYearArr = lastYearArrayFunction();
        lastYearArr.map((data) => {

            // let date11 = data.split("/");
            // let dd = date11[0];
            // let extractedDate;
            // if (dd.length === 1) {
            //     extractedDate = `0${date11[0]}-01-${date11[1]}`;
            // } else {
            //     extractedDate = `${date11[0]}-01-${date11[1]}`;
            // }
            // const found = dataArr.find((element) => {
            //     let date22 = moment(element.date).format("DD-MM-YYYY").split("-");
            //     return extractedDate === `${date22[1]}-01-${date22[2]}`
            // });
            // if (found) {
            //     yearlyData.push({ date: new Date(extractedDate).toLocaleDateString('en-us', { year: "numeric", month: "short" }), [handleName]: found.count })
            // } else {
            //     yearlyData.push({ date: new Date(extractedDate).toLocaleDateString('en-us', { year: "numeric", month: "short" }), [handleName]: 0 })
            // }

            let dateParts = data.split("/");
            let month = dateParts[0].padStart(2, "0");
            let year = dateParts[1];
            let extractedDate = `${year}-${month}-01`; // ✅ ISO format

            const found = dataArr.find((element) => {
                let date22 = moment(element.date).format("YYYY-MM-DD").split("-");
                return extractedDate === `${date22[0]}-${date22[1]}-01`;
            });

            yearlyData.push({
                date: new Date(extractedDate).toLocaleDateString('en-us', { year: "numeric", month: "short" }),
                [handleName]: found ? found.count : 0
            });

        })
        return yearlyData.reverse()
    };

    async function getTopDataRecentData() {
        const shopName = await shopApi.shop();
        try {
            const userData = await fetch(`${serverURL}/admin-top-data-recent-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shopName.shopName,
                }),
            });
            let result = await userData.json();
            // setIsLoading(true);
            setTopData(result.topData);
            setRecentData(result.recentData);
        } catch (error) {
            console.log("errr ", error)
        }
    };

    async function getDataAccordingToDates(date) {
        let result = await selectedDateFunction(date);
        setLoadSelectedDate(true);
        setAllUserData(result.selectedDate);
        setAllUser(result.selectedDateUsers);
        // totalRevenueFxn(result.selectedDateRevenue);

        const shopName = await shopApi.shop();
        let fullCurrency = shopName.shopCurrency;

        // let htmlString = '<span class=money>${{amount}}</span>';
        let htmlString = fullCurrency;
        let searchSpanTerm = '<span';
        if (htmlString.includes(searchSpanTerm)) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
            const spanElement = doc.querySelector('.money');
            if (spanElement) {
                const findInnerHTML = spanElement.innerHTML;
                let extractCurrencySymbol = findInnerHTML.replace(/{{amount}}|{{amount_with_comma_separator}}|{{amount_no_decimals_with_comma_separator}}/g, result.selectedDateRevenue[0].amount.toFixed(2));
                setTotalRevenue({ items: result.selectedDateRevenue[0].count, amount: extractCurrencySymbol })
            }
        } else {
            let extractCurrencySymbol = fullCurrency.replace(/{{amount}}|{{amount_with_comma_separator}}|{{amount_no_decimals_with_comma_separator}}/g, result.selectedDateRevenue[0].amount.toFixed(2));
            setTotalRevenue({ items: result.selectedDateRevenue[0].count, amount: extractCurrencySymbol })
        }

        // console.log("fullCurrency -- ", fullCurrency)
        // let extractCurrencySymbol = fullCurrency.replace("{{amount}}", result.selectedDateRevenue[0].amount.toFixed(2));
        // let extractCurrencySymbol = fullCurrency.replace(/{{amount}}|{{amount_with_comma_separator}}/gi, result.selectedDateRevenue[0].amount.toFixed(2));

        // let extractCurrencySymbol = fullCurrency.replace(/{{amount}}|{{amount_with_comma_separator}}/g, result.selectedDateRevenue[0].amount.toFixed(2));
        // setTotalRevenue({ items: result.selectedDateRevenue[0].count, amount: extractCurrencySymbol })

    };

    // async function totalRevenueFxn(data) {
    //     let sum = 0;
    //     let curr = '';
    //     data.forEach(num => {
    //         let amnt = num.price.split(" ");
    //         sum += JSON.parse(amnt[amnt.length - 1]);
    //         curr = amnt[0];
    //     });
    //     setTotalRevenue({ items: data.length, amount: `${curr} ${sum.toFixed(2)}` })
    // };

    async function getMonthlyQuotaOfWishlist(date) {
        let result = await selectedDateFunction(date);
        setWishlistQuota(result.selectedDate)
        let wishlistQuotaPercent = getWishlistQuotaPercentage(result);

        setWishlistQuotaPercentage(wishlistQuotaPercent);

        // let maxPercentage = parseInt(wishlistQuotaPercent) >= 100 ? "100" : wishlistQuotaPercent;
        // setWishlistQuotaPercentage(maxPercentage);
    };

    async function selectedDateFunction(date) {
        const shopName = await shopApi.shop();
        const subscription = await appMetafield.getCurrentPlan();
        try {
            const userData = await fetch(`${serverURL}/admin-data-with-date`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shopName: shopName.shopName,
                    startDate: date.startDay,
                    endDate: date.endDay,
                    currentPlan: subscription.currentPlan
                }),
            });
            let result = await userData.json();
            return result;
        } catch (error) {
            console.log("errr ", error)
        }
    };

    function getWishlistQuotaPercentage(data) {
        const yourQuotaCount = data.selectedDate;
        const maxQuotaCount = data.planDetails[0].quota;
        setWishlistQuotaNum(`${yourQuotaCount.length}/${maxQuotaCount} `)
        let num = yourQuotaCount.length / maxQuotaCount;
        let myrange = num * 100;
        return myrange.toFixed(2)
    };


    async function getCurrencyFxn(data) {
        const shopName = await shopApi.shop();
        let fullCurrency = shopName.shopCurrency;
        let extractCurrencySymbol = fullCurrency.replace("{{amount}}", data);
        // setShopCurrency(extractCurrencySymbol);
        return extractCurrencySymbol
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
    // -------- end ---------function for the date selection-------- end ---------

    const duplicacyFinder = function (nums) {
        for (let i = nums.length - 1; i >= 0; i--) {
            for (let j = 0; j < i; j++)
                if (nums[j].email === nums[i].email) {
                    nums.splice(i, 1);
                    break;
                }
        }
    };

    const selectDateHandler = async (e) => {
        setSelectedValue(e.target.value)
        setLoadSelectedDate(false);
        let ourDate = JSON.parse(e.target.value);
        await getDataAccordingToDates(ourDate);
    };

    async function openPageHandler(handle) {
        const shopName = await shopApi.shop();
        window.open(`https://${shopName.domain}/products/${handle}`, "_blank");
    };

    function lastYearArrayFunction() {
        let givenDateTime = moment(new Date().setFullYear(new Date().getFullYear() - 1)).format("YYYY-MM-DD");
        let createdDate = new Date(givenDateTime);
        createdDate.setDate(1);
        let currentDate = new Date();
        let dateAndYearList = [createdDate.toLocaleString('en', { month: 'numeric', year: 'numeric' })];
        while (createdDate.setMonth(createdDate.getMonth() + 1) < currentDate) {
            dateAndYearList.unshift(createdDate.toLocaleString('en', { month: 'numeric', year: 'numeric' }));
        }
        return dateAndYearList
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(topData);
    console.log("topData = ", topData)
    const topDataTable = topData.map(
        ({ handle, title, image, totalCount }, index,) => (
            <IndexTable.Row id={index} key={index} position={index} >
                <IndexTable.Cell>{index + 1}</IndexTable.Cell>
                <IndexTable.Cell className='show-less-text11'  ><span className='linkCss' onClick={() => openPageHandler(handle)}>{title} </span></IndexTable.Cell>
                <IndexTable.Cell><img src={image} alt={title} height="40px" width="40px" /></IndexTable.Cell>
                <IndexTable.Cell>{totalCount}</IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    const { selectedResources: selectedResources2, allResourcesSelected: allResourcesSelected2, handleSelectionChange: handleSelectionChange2 } = useIndexResourceState(recentData);
    const userWishlistTable = recentData.map(
        ({ handle, title, image }, index,) => {
            return (
                <IndexTable.Row id={index} key={index} position={index} >
                    <IndexTable.Cell>{index + 1}</IndexTable.Cell>
                    <IndexTable.Cell className='show-less-text11' ><span className='linkCss' onClick={() => openPageHandler(handle)}>{title} </span></IndexTable.Cell>
                    <IndexTable.Cell><img src={image} alt={title} height="40px" width="40px" /></IndexTable.Cell>
                </IndexTable.Row>
            )
        },
    );

    const [active, setActive] = useState(false);
    const handleChange = useCallback(() => setActive(!active), [active]);


    const openAllProducts = async () => {
        // const shopName = await shopApi.shop();
        // window.top.location.href = `https://${shopName.domain}/admin/apps/${appName}/ViewAllProduct`;

        if (Number(currPlan) === 1) {
            paidPlanModal()
        } else {
            navigate({
                pathname: `/ViewAllProduct`,
                search: ``
            })
        }
    };

    const wishlistUserHandler = async () => {

        if (Number(currPlan) === 1) {
            paidPlanModal()
        } else {
            const selectedValue2 = await checkCurrentSelectedValue(selectedValue)
            navigate({
                pathname: "/Analytic/UserReport",
                search: `?pagenumber=1&selectedData=${selectedValue2.label}&rpr=10`
            })
        }


    }

    const wishlistItemHandler = async () => {

        if (Number(currPlan) === 1) {
            paidPlanModal()
        } else {
            const selectedValue2 = await checkCurrentSelectedValue(selectedValue)
            // console.log("sdddddddddd", selectedValue2);
            const shopName = await shopApi.shop();
            navigate({
                pathname: "/Analytic/WishlistItems",
                search: `?pagenumber=1&selectedData=${selectedValue2.label}&rpr=10`
            })
        }
    }
    const revenueHandler = async () => {

        if (Number(currPlan) === 1) {
            paidPlanModal()
        } else {
            const selectedValue2 = await checkCurrentSelectedValue(selectedValue)
            // console.log("sdddddddddd", selectedValue2);
            const shopName = await shopApi.shop();
            navigate({
                pathname: "/Analytic/RevenueData",
                search: `?pagenumber=1&selectedData=${selectedValue2.label}&rpr=10`
            })
        }
    }

    const checkCurrentSelectedValue = async (checkOptions) => {
        const todayDate = today();
        const yesterdayDate = yesterday();
        const thisWeekDate = thisWeek();
        const lastWeekDate = lastWeek();
        const thisMonthDate = thisMonth();
        const lastMonthDate = lastMonth();

        let label, value;

        switch (checkOptions) {
            case JSON.stringify(todayDate):
                label = await myLanguage.selectValue1;
                value = JSON.stringify(todayDate);
                break;
            case JSON.stringify(yesterdayDate):
                label = await myLanguage.selectValue2;
                value = JSON.stringify(yesterdayDate);
                break;
            case JSON.stringify(thisWeekDate):
                label = await myLanguage.selectValue3;
                value = JSON.stringify(thisWeekDate);
                break;
            case JSON.stringify(lastWeekDate):
                label = await myLanguage.selectValue4;
                value = JSON.stringify(lastWeekDate);
                break;
            case JSON.stringify(thisMonthDate):
                label = await myLanguage.selectValue5;
                value = JSON.stringify(thisMonthDate);
                break;
            case JSON.stringify(lastMonthDate):
                label = await myLanguage.selectValue6;
                value = JSON.stringify(lastMonthDate);
                break;
            case "":
                label = await myLanguage.selectValue1;
                value = JSON.stringify(todayDate);
                break;
            default:
                // console.log("Invalid option");
                label = await myLanguage.selectValue1;
                value = JSON.stringify(todayDate);
                break;
        }

        // console.log("Selected value:", value, "Label:", label);

        return { label, value };
    }
    // console.log("HHH ", new Date("04-01-2024").toLocaleDateString('en-us', { year: "numeric", month: "short", day: "numeric" }))


    return (
        <div dir={wishlistTextDirection} className='wf-dashboard wf-dashboard-analytic onlyAnalyticPage'>
            {!isloading ? <SkeletonPage1 /> :
                <Page fullWidth title={myLanguage.analyticPageMainHeading} subtitle={myLanguage.analyticPageMainText} >
                    <AlphaCard roundedAbove="sm">
                        <div className='wf-overview-inner'>
                            <div className='overview-main'>
                                <Text variant="headingLg" as="h2">{myLanguage.quickOverView}</Text>
                                <div className='overview-select'>
                                    <select onChange={selectDateHandler} >
                                        <option value={JSON.stringify(today())}>{myLanguage.selectValue1}</option>
                                        <option value={JSON.stringify(yesterday())}>{myLanguage.selectValue2}</option>
                                        <option value={JSON.stringify(thisWeek())}> {myLanguage.selectValue3}</option>
                                        <option value={JSON.stringify(lastWeek())}> {myLanguage.selectValue4}</option>
                                        <option value={JSON.stringify(thisMonth())}> {myLanguage.selectValue5}</option>
                                        <option value={JSON.stringify(lastMonth())}>{myLanguage.selectValue6} </option>
                                    </select>
                                </div>
                            </div>

                            {!loadSelectedDate ? <div style={{ textAlign: 'center' }}><Spinner accessibilityLabel="Spinner example" size="large" /></div> :
                                <div id='boxx-shadow' className='wf-dashboard-box-inner'>
                                    <Grid >
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                            <span className='analytic-top-box'>
                                                <Text variant="headingLg" as="h5"><span className='analytic-top-box-num'>{allUser.length}</span></Text>
                                            </span>
                                            <Text variant="headingLg" as="h3">{myLanguage.userHeading}</Text>
                                            <p>{myLanguage.userText} </p>
                                            {/* <Text variant="headingLg" as="h5">{myLanguage.users} <span>{allUser.length}</span></Text> */}
                                            <Button onClick={wishlistUserHandler}>{myLanguage.viewAll}</Button>
                                        </Grid.Cell>

                                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                            <span className='analytic-top-box'>
                                                <Text variant="headingLg" as="h5"><span className='analytic-top-box-num'>{allUserData.length}</span></Text>
                                            </span>
                                            <Text variant="headingLg" as="h3">{myLanguage.itemHeading}</Text>
                                            <p>{myLanguage.itemText} </p>
                                            {/* <Text variant="headingLg" as="h5">{myLanguage.items} <span>{allUserData.length}</span></Text> */}
                                            <Button onClick={wishlistItemHandler}>{myLanguage.viewAll}</Button>
                                        </Grid.Cell>

                                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                            <span className='analytic-top-box'>
                                                <Text variant="headingLg" as="h5"><span className='analytic-top-box-num'>

                                                    {/* {getCurrencyFxn(totalRevenue.amount.toFixed(2))} */}


                                                    {/* {shopCurrency}  */}
                                                    {totalRevenue.amount}
                                                </span></Text>
                                            </span>
                                            <Text variant="headingMd" as="h3">{myLanguage.totalRevenueHeading}</Text>
                                            <p>{myLanguage.totalRevenueText}</p>
                                            {/* <Text variant="headingLg" as="h5">{myLanguage.totalItems} <span>{totalRevenue.items}</span></Text> */}
                                            {/* <Text variant="headingLg" as="h6">{myLanguage.amount} <span>{totalRevenue.amount.toFixed(2)}</span></Text> */}
                                            <Button onClick={revenueHandler}>{myLanguage.viewAll}</Button>
                                        </Grid.Cell>

                                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                            {currPlan === "4" ?
                                                <span className='infinity-box'>
                                                    <Text variant="heading3xl" as="h4"></Text>
                                                    <span className='analytic-top-box'>
                                                        <Text variant="headingLg" as="h5"><span style={{ fontSize: "90px" }} className='analytic-top-box-num'>∞</span></Text>
                                                    </span>
                                                    <Text variant="headingMd" as="h3">{myLanguage.monthlyQuotaHeading} </Text>
                                                    <p>{myLanguage.unlimitedItemsText}</p>
                                                </span>
                                                :
                                                wishlistQuotaNum === "" ? myLanguage.loadingText :
                                                    <>
                                                        {/* <p> {wishlistQuotaPercentage}% {myLanguage.monthlyQuotaText}  </p> */}
                                                        <span className='analytic-top-box'>
                                                            <Text variant="headingLg" as="h5"><span className='analytic-top-box-num'>{wishlistQuotaPercentage}%</span></Text>
                                                        </span>
                                                        <Text variant="headingMd" as="h3">{myLanguage.monthlyQuotaHeading} </Text>
                                                        <p> {myLanguage.monthlyQuotaText}  </p>
                                                        <div style={{ pointerEvents: "none" }}>
                                                            <RangeSlider value={wishlistQuotaPercentage} output />
                                                        </div>
                                                        <div className='analytic-progress'>{wishlistQuotaNum}</div>
                                                    </>}


                                            {/* <Text variant="headingMd" as="h3">{myLanguage.monthlyQuotaHeading} </Text> */}

                                            {/* {currPlan === "3" ?
                                                <span className='infinity-box'>
                                                    <p>{myLanguage.unlimitedItemsText}</p>
                                                    <Text variant="heading3xl" as="h4">∞</Text>
                                                </span>

                                                :
                                                wishlistQuotaNum === "" ? myLanguage.loadingText :
                                                    <>
                                                        <p> {wishlistQuotaPercentage}% {myLanguage.monthlyQuotaText}  </p>
                                                        <div style={{ pointerEvents: "none" }}>
                                                            <RangeSlider value={wishlistQuotaPercentage} output />
                                                        </div>
                                                        <div className='analytic-progress'>{wishlistQuotaNum}</div>
                                                    </>} */}


                                            {/* {wishlistQuotaNum === "" ? myLanguage.loadingText :
                                                    <>
                                                        <Text variant="heading3xl" as="h2"></Text>
                                                        <span> {wishlistQuotaPercentage}% {myLanguage.monthlyQuotaText}  </span>
                                                        <div style={{ pointerEvents: "none" }}>
                                                            <RangeSlider value={wishlistQuotaPercentage} output />
                                                        </div>
                                                        <span style={{ float: "right" }}>{wishlistQuotaNum}</span>
                                                    </>} */}


                                        </Grid.Cell>

                                    </Grid>
                                </div>}
                        </div>
                    </AlphaCard>

                    <AlphaCard className="legacy-graph">
                        <div className='graphical-representation-dates'>
                            <div className='overview-main overview-main1'>
                                <div className='graphical-representation'>
                                    <Text variant="headingLg" as="h3">{myLanguage.graphRepsHeading}</Text>
                                    <ButtonGroup segmented>
                                        <Button pressed={activeButtonIndex === 0} onClick={() => handleButtonClick(0)}> {myLanguage.graphDay} </Button>
                                        <Button pressed={activeButtonIndex === 1} onClick={() => handleButtonClick(1)}> {myLanguage.graphMonth} </Button>
                                    </ButtonGroup>
                                </div>
                                <div className='dates-for-graphical'>
                                    <Text variant="headingMd" as="h3">{myLanguage.specificDateDataHeading}</Text>
                                    <Button onClick={handleChange}>{myLanguage.sddOpenCalander}</Button>
                                </div>
                            </div>

                            {/* <div className='overview-main'>
                            <Text variant="headingMd" as="h3">{myLanguage.specificDateDataHeading}</Text>

                            <Button onClick={handleChange}>{myLanguage.sddOpenCalander}</Button>  
                            </div>                               */}
                            {/* {!openCalander ? <Button onClick={() => setOpenCalander(!openCalander)}>{myLanguage.sddOpenCalander}</Button> :
                                    <Button onClick={getDataWithDate}>{myLanguage.sddSubmitDate}</Button>} */}


                            {/* <Collapsible open={openCalander} id="basic-collapsible" transition={{ duration: '500ms', timingFunction: 'ease-in-out' }} expandOnPrint>
                                <div className='overview-main'>
                                    <DatePicker
                                        month={month}
                                        year={year}
                                        onChange={setSelectedDates}
                                        onMonthChange={handleMonthChange}
                                        selected={selectedDates}
                                        allowRange
                                    />
                                </div>
                            </Collapsible> */}
                            {/* <h1>Select specific dates for the graph</h1> <span>open calander</span> */}



                            <Modal
                                // activator={activator}
                                open={active}
                                onClose={handleChange}
                                title={myLanguage.specificDateDataHeading}
                                primaryAction={{
                                    content: myLanguage.sddSubmitDate,
                                    onAction: getDataWithDate,
                                }}
                            // secondaryActions={[
                            //     {
                            //         content: 'Learn more',
                            //         onAction: handleChange,
                            //     },
                            // ]}
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

                            <div className='analytic-graph-bar new-graph-class'>
                                <div className='box-shadow'>

                                    <Text variant="headingMd" as="h3">{myLanguage.itemGraph}</Text>
                                    {!loadGraph ? <div style={{ textAlign: 'center' }}><Spinner accessibilityLabel="Spinner example" size="large" /></div> :
                                        emptyArr.emptyItems === "zero" ? <div style={{ textAlign: "center" }}> ------ No Record Found ------ </div> :
                                            <ResponsiveContainer width="100%" aspect={3.5}>
                                                <LineChart width={500} height={300} data={itemGraph}
                                                    margin={{
                                                        top: -5,
                                                        right: 30,
                                                        left: -20,
                                                        bottom: 25,
                                                        // bottom: !activeButtonIndex ? -26 : -17
                                                    }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" angle={60} dx={20} dy={25} minTickGap={-400} />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="Items" stroke="#4867A9" activeDot={{ r: 6 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                    }
                                </div>

                                <div className='box-shadow box-shadow-totalWish'>
                                    <Text variant="headingMd" as="h3">{myLanguage.userGraph}</Text>
                                    {!loadGraph ? <div style={{ textAlign: 'center' }}><Spinner accessibilityLabel="Spinner example" size="large" /></div> :
                                        emptyArr.emptyUsers === "zero" ? <div style={{ textAlign: "center" }}> ------ No Record Found ------ </div> :
                                            <ResponsiveContainer width="100%" aspect={3.5}>
                                                <LineChart width={500} height={300} data={userGraph}
                                                    margin={{
                                                        top: 5,
                                                        right: 30,
                                                        left: -20,
                                                        // bottom: -26,
                                                        // bottom: -17,
                                                        bottom: 25
                                                        // bottom: !activeButtonIndex ? -26 : -17
                                                    }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" angle={60} dx={20} dy={25} minTickGap={-400} />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="Users" stroke="#7F50A7" activeDot={{ r: 6 }} />
                                                </LineChart>
                                            </ResponsiveContainer>}
                                </div>
                            </div>
                        </div>
                    </AlphaCard>

                    <div className="customer-recently-table">
                        <div className="customer-recently-inner analytic_last_tables">
                            <AlphaCard roundedAbove="sm">
                                {/* <p>View a summary of your online store’s sales.</p> */}
                                <LegacyCard>
                                    <div className='analytic-content-btn'>
                                        <div className='analytic-contenth'>
                                            <Text variant="headingLg" as="h2">{myLanguage.mostProductsHeading}</Text>
                                            <p>{myLanguage.mostProductsText} </p>
                                        </div>
                                        {topData.length === 0 ? <></> :
                                            <div className='analytic-view-btn'>
                                                <Button onClick={openAllProducts}>{myLanguage.viewAll}</Button>
                                            </div>}
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        {topData.length === 0 ?
                                            <div className='search-icon-css'>
                                                <img src={searchIcon} height="35px" width="35px" />
                                                <div>No item found</div>
                                            </div>
                                            :
                                            <IndexTable
                                                itemCount={topData.length}
                                                selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                                                onSelectionChange={handleSelectionChange}
                                                headings={[
                                                    { title: myLanguage.mpvalue1 },
                                                    { title: myLanguage.mpvalue2 },
                                                    { title: myLanguage.mpvalue3 },
                                                    { title: myLanguage.mpvalue4 },
                                                ]}
                                                selectable={false}>
                                                {topDataTable}
                                            </IndexTable>}
                                    </div>
                                </LegacyCard>

                            </AlphaCard>
                        </div>
                        <div className="customer-recently-inner analytic_last_tables">
                            <AlphaCard roundedAbove="sm">
                                <LegacyCard>
                                    <div className='wf-recently-inner'>
                                        <Text variant="headingLg" as="h2">{myLanguage.recentProductsHeading}</Text>
                                        <p>{myLanguage.recentProductstext} </p>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        {recentData.length === 0 ?
                                            <div className='search-icon-css'>
                                                <img src={searchIcon} height="35px" width="35px" />
                                                <div>No item found</div>
                                            </div>
                                            :
                                            <IndexTable
                                                itemCount={recentData.length}
                                                selectedItemsCount={allResourcesSelected2 ? 'All' : selectedResources2.length}
                                                onSelectionChange={handleSelectionChange2}
                                                headings={[
                                                    { title: myLanguage.rpvalue1 },
                                                    { title: myLanguage.rpvalue2 },
                                                    { title: myLanguage.rpvalue3 },
                                                ]}
                                                selectable={false}
                                            >
                                                {userWishlistTable}
                                            </IndexTable>}
                                    </div>
                                </LegacyCard>
                            </AlphaCard>

                        </div>
                    </div>

                    <div style={{ marginTop: "40px" }}>
                        <Footer myLanguage={myLanguage} />
                    </div>

                </Page>
            }
        </div>
    );
}
