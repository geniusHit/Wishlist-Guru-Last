import { Frame, Page, Tabs, IndexTable, Button, Text } from '@shopify/polaris';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useUtilityFunction from '../../hooks/useUtilityFunction';
import SkeletonPage1 from '../SkeletonPage1';
import moment from 'moment-js';
import useApi from '../../hooks/useApi';
import Footer from '../Footer';
import useAppMetafield from '../../hooks/useAppMetafield';
import ReferredUser from './ShareUserData/ReferredUser';
import ReferredUserData from './ShareUserData/ReferredUserData';


const Data = () => {
  const id = useParams()
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search.trim());
  const getInitialSelected = (userDataType) => {
    switch (userDataType) {
      case 'ReferredUser':
        return 0;
      case 'ReferredUserData':
        return 1;
      default:
        return 0;
    }
  };

  const [selectedTab, setSelectedTab] = useState(getInitialSelected(id.ReferredUser));
  const appMetafield = useAppMetafield();
  const [currentPlan, setCurrentPlan] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedValue, setSelectedValue] = useState("all");
  const navigate = useNavigate();
  const ShopApi = useApi();
  const utilityFunction = useUtilityFunction();
  const [myLanguage, setMyLanguage] = useState({});
  const [requestBody, setRequestBody] = useState({});
  const [isCount, setIsCount] = useState()
  const [shouldRun, setShouldRun] = useState(false);
  const shopCurrency = useRef();


  useEffect(() => {
    useEffectLite();
  }, []);

  async function useEffectLite() {
    const getCurrentPlan = await appMetafield.getCurrentPlan();
    setCurrentPlan(parseInt(getCurrentPlan.currentPlan));
    const shopApi = await ShopApi.shop();
    shopCurrency.current = shopApi.shopCurrency;
    const uId = localStorage.getItem("uId");
    const checkCurrentPage = searchParams.get('referreduserpageno') || 1;
    const reportPerPageData = searchParams.get('rpr') || 10;
    const userSelectedData = searchParams.get('userdata') || "all";

    if (searchParams.get('id') === null || searchParams.get('userdata') === null || searchParams.get('rpr') === null || searchParams.get('referreduserpageno') === null) {
      searchParams.set('id', uId);
      searchParams.set('referreduserpageno', checkCurrentPage);
      searchParams.set('userdata', userSelectedData);
      searchParams.set('rpr', reportPerPageData);
      navigate({ search: `?${searchParams.toString()}` });
    }

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
    setSelectedTab(selectedTabIndex);
    setSelectedValue("all");

    searchParams.set('referreduserpageno', 1);
    searchParams.set('userdata', 'all');

    let pathname = '';
    switch (selectedTabIndex) {
      case 0:
        pathname = '/getShareStatsData/ReferredUser';
        break;
      case 1:
        pathname = '/getShareStatsData/ReferredUserData';
        break;
      default:
        console.warn("Unhandled tab index:", selectedTabIndex);
        return;
    }

    navigate({
      pathname,
      search: `?${searchParams.toString()}`
    });
    await prepareRequestBody(myLanguage, "tabI");
  };

  const prepareRequestBody = async (language, data) => {
    const shopData = await ShopApi.shop();
    const newRequestBody = {
      shopName: shopData.shopName,
      userId: searchParams.get('id'),
      checkStatusInItem: false,
    };

    if (data !== 'tabI' && selectedValue !== 'all') {
      const selectedData = await checkCurrentSelectedValue(selectedValue, language);
      Object.assign(newRequestBody, {
        checkStatusInItem: true,
        startDate: selectedData.startDay,
        endDate: selectedData.endDay,
      });
      setSelectedValue(JSON.stringify(selectedData));
    }

    setRequestBody(newRequestBody);
  };

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
    <IndexTable.Cell>{(selectedTab === 2 && shouldRun) ? ShopApi.changeMoney(isCount * 100, shopCurrency.current) : isCount}</IndexTable.Cell>
  </IndexTable.Row>


  const tabs = [
    {
      content: "Referred Users",
      data: <ReferredUser myLanguage={myLanguage} requestBody={requestBody} selectedValue={selectedValue} selectedOption={selectedOption} options={options} setIsCount={setIsCount} />,
      id: 'regular-1',
    },
    {
      content: "Referred User's Data",
      data: <ReferredUserData myLanguage={myLanguage} requestBody={requestBody} selectedValue={selectedValue} selectedOption={selectedOption} options={options} setIsCount={setIsCount} />,
      id: 'hover-2',
    }
  ];

  const title = useMemo(() => {
    if (selectedTab === 0) {
      return `${myLanguage.statsTab1H1}`;
    } else {
      return `${myLanguage.statsTab2H1}`;
    }
  }, [selectedTab, myLanguage]);


  return (
    <div className='wf-dashboard wf-dashboard-report'>
      {isLoading ? <SkeletonPage1 /> : (
        <>
          <Frame>
            <Page fullWidth title={title}
              subtitle={myLanguage.statsSubHeading}
              secondaryActions={[{
                content: currentPlan >= 2 ?
                  <div className='wf-style-wishbtn currentWishlistUser'><div className='customer-recently-table'>
                    <IndexTable
                      itemCount={1}
                      headings={[
                        { title: selectedTab === 0 ? myLanguage.tab0heading : myLanguage.tab1heading },
                      ]}
                      selectable={false}
                    >
                      {countValue}
                    </IndexTable>
                  </div>
                  </div> : <div></div>
              }]}
              backAction={{ onAction: () => history.back() }}
            >

              <div className='wf-style-wishbtn'>
                <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange} fitted>
                  {tabs[selectedTab].data}
                </Tabs>
              </div>

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