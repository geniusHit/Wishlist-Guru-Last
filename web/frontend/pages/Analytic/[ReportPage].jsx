import { Frame, Page, Tabs, IndexTable, Button, Text } from '@shopify/polaris';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import WishlistItem from './ReportPage/WishlistItem';
import WishlistUser from './ReportPage/UserReport';
import useUtilityFunction from '../../hooks/useUtilityFunction';
import RevenueData from './ReportPage/RevenueData';
import SkeletonPage1 from '../SkeletonPage1';
import moment from 'moment-js';
import useApi from '../../hooks/useApi';
import Footer from '../Footer';
import useAppMetafield from '../../hooks/useAppMetafield';

const Data = () => {
  const id = useParams()
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search.trim());
  const itemSelectedData = searchParams.get('selectedData') || 'all'
  const getInitialSelected = (reportPage) => {
    switch (reportPage) {
      case 'UserReport':
        return 0;
      case 'WishlistItems':
        return 1;
      case 'RevenueData':
        return 2;
      default:
        return 0;
    }
  };

  const appMetafield = useAppMetafield();
  const [currentPlan, setCurrentPlan] = useState();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedValue, setSelectedValue] = useState(itemSelectedData);
  const navigate = useNavigate();
  const ShopApi = useApi();
  const utilityFunction = useUtilityFunction();
  const [myLanguage, setMyLanguage] = useState({});
  const [selected, setSelected] = useState(getInitialSelected(id.ReportPage));
  const [requestBody, setRequestBody] = useState({});
  const [isCount, setIsCount] = useState()
  const [shouldRun, setShouldRun] = useState(false);
  const shopCurrency = useRef();


  useEffect(() => {
    useEffectLite();
  }, []);


  async function useEffectLite() {
    const getCurrentPlan = await appMetafield.getCurrentPlan();
    setCurrentPlan(parseInt(getCurrentPlan.currentPlan))
    const shopApi = await ShopApi.shop();
    shopCurrency.current = shopApi.shopCurrency
    // console.log("shhshshshs", shopCurrency.current)
    const fetchInitialData = async () => {
      setIsLoading(true);
      const currentLanguage = await utilityFunction.getCurrentLanguage();
      setMyLanguage(currentLanguage);
      await prepareRequestBody(currentLanguage, "");
      setIsLoading(false);
    };
    await fetchInitialData();
    setShouldRun(true)
  }



  const handleGoToPlan = () => {
    navigate({
      pathname: `/PricingPlan`,
      search: ``
    })
  }

  const options = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '75', value: 75 },
  ];

  const handleTabChange = async (selectedTabIndex) => {

    setSelected(selectedTabIndex);
    setSelectedValue("all");
    await prepareRequestBody(myLanguage, "tabI");
    searchParams.set('pagenumber', 1);
    searchParams.set('selectedData', 'all');
    searchParams.set('rpr', 10);
    navigate({ search: `?${searchParams.toString()}` });
    switch (selectedTabIndex) {
      case 0:
        navigate('/Analytic/UserReport');
        break;
      case 1:
        navigate('/Analytic/WishlistItems');
        break;
      case 2:
        navigate('/Analytic/RevenueData');
        break;
      default:
        break;
    }
  };

  const prepareRequestBody = async (language, data) => {
    // console.log("data", data)
    const shopData = await ShopApi.shop();
    const newRequestBody = {
      shopName: shopData.shopName,
    };
    if (data === 'tabI') {
      // console.log("Fffffff Nooo")

      newRequestBody.checkStatusInItem = false
    } else {
      // console.log("Fffffff yess")
      if (selectedValue !== 'all') {
        const selectedData = await checkCurrentSelectedValue(selectedValue, language);
        newRequestBody.checkStatusInItem = true
        setSelectedValue(JSON.stringify(selectedData));
        newRequestBody.startDate = selectedData.startDay;
        newRequestBody.endDate = selectedData.endDay;
      } else {
        newRequestBody.checkStatusInItem = false
      }
    }
    setRequestBody(newRequestBody);
  };


  function getMainCurr(currency) {
    // Ensure `ab` is a string
    const content = currency.toString().trim();
    // Regular expression to match the desired format: Currency{{amount}}
    const validFormatRegex = /^[A-Z₵₹€£¥$]{1,3}\{\{amount\}\}$/;
    // Check if it matches the valid format
    if (validFormatRegex.test(content)) {
      return content; // Already in the correct format
    }
    // Extract currency symbol (if present) or default to ''
    const currencyMatch = content.match(/[A-Z₵₹€£¥$]{1,3}/); // Match currency symbols
    const currencyValue = currencyMatch ? currencyMatch[0] : '';
    // Return the corrected format
    return `${currencyValue}{{amount}}`;
  }


  const checkCurrentSelectedValue = async (checkOptions, language) => {
    switch (checkOptions) {
      case await language.selectValue1:
        return today();
      case await language.selectValue2:
        return yesterday();
      case await language.selectValue3:
        return thisWeek();
      case await language.selectValue4:
        return lastWeek();
      case await language.selectValue5:
        return thisMonth();
      case await language.selectValue6:
        return lastMonth();
      default:
        return null;
    }
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

  const countValue = <IndexTable.Row>
    <IndexTable.Cell>{(selected === 2 && shouldRun) ? ShopApi.changeMoney(isCount * 100, getMainCurr(shopCurrency.current)) : isCount}</IndexTable.Cell>
  </IndexTable.Row>


  const tabs = [
    {
      content: myLanguage.userReportHeading,
      data: <WishlistUser myLanguage={myLanguage} requestBody={requestBody} selectedValue={selectedValue} selectedOption={selectedOption} options={options} setIsCount={setIsCount} />,
      id: 'regular-1',
    },
    {
      content: myLanguage.wishlistItemsHeading,
      data: <WishlistItem myLanguage={myLanguage} requestBody={requestBody} selectedValue={selectedValue} selectedOption={selectedOption} options={options} setIsCount={setIsCount} />,
      id: 'hover-2',
    },
    {
      content: myLanguage.revenueDataHeading,
      data: <RevenueData myLanguage={myLanguage} requestBody={requestBody} selectedValue={selectedValue} selectedOption={selectedOption} options={options} setIsCount={setIsCount} shopCurrency={shopCurrency.current} getMainCurr={getMainCurr} />,
      id: 'used-3',
    }
  ];

  const title = useMemo(() => {
    if (selected === 0) {
      return `${myLanguage.analyticDetailUserReportsHeading} ${myLanguage.userReportHeading}`;
    } else if (selected === 1) {
      return `${myLanguage.analyticDetailUserReportsHeading} ${myLanguage.wishlistItemsHeading}`;
    } else {
      return `${myLanguage.analyticDetailUserReportsHeading} ${myLanguage.revenueDataHeading}`;
    }
  }, [selected, myLanguage]);


  return (
    <div className='wf-dashboard wf-dashboard-report'>
      {isLoading ? <SkeletonPage1 /> : (
        <>
          <Frame>
            <Page fullWidth title={title}
              subtitle={myLanguage.analyticDetailUserReportsSubHeading}
              secondaryActions={[{
                content: currentPlan >= 2 ?
                  <div className='wf-style-wishbtn currentWishlistUser'><div className='customer-recently-table'>
                    <IndexTable
                      itemCount={1}
                      headings={[
                        { title: selected === 0 ? myLanguage.tab0heading : selected === 1 ? myLanguage.tab1heading : myLanguage.tab2heading },
                      ]}
                      selectable={false}
                    >
                      {countValue}
                    </IndexTable>
                  </div>
                  </div> : <div></div>
              }]}
              backAction={{ onAction: () => history.back() }}>
              {currentPlan < 2 ? <div className='wf-style-wishbtn wf-reportDiv'>
                <div className='editBtn disable-app'>
                  <Text variant="headingLg" as="h2">
                    {myLanguage.reportUpgradeHeadingBasic}
                    {/* This feature is not available in the free plan. Please upgrade your plan */}
                  </Text>
                  <Button onClick={handleGoToPlan}>
                    {myLanguage.shareWishlistSwalTitle}
                    {/* Upgrade your plan. */}
                  </Button>
                </div>
              </div>
                :
                <div className='wf-style-wishbtn'>
                  <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} fitted>
                    {tabs[selected].data}
                  </Tabs>
                </div>}
              <div className='wf-analatic-footer'>
                <Footer myLanguage={myLanguage} />
              </div>
            </Page>
          </Frame>
        </>
      )}
    </div>
  );
};

export default Data;