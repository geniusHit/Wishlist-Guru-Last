
import React, { useState, useEffect } from 'react'
import useAppMetafield from '../hooks/useAppMetafield';
import SkeletonPage1 from './SkeletonPage1';
import { useAuthenticatedFetch } from '../hooks';
import useApi from '../hooks/useApi';
import Dashboard from './Dashboard';


const HomePage = () => {

  const appMetafield = useAppMetafield();
  const [isloading, setIsLoading] = useState(false);
  // const fetch = useAuthenticatedFetch();
  const shopApi = useApi();
  // const [getShopName, setGetShopName] = useState("");
  const [showActivateButton, setShowActivateButton] = useState(false);

  useEffect(() => {
    getCurrentLanguage();
  }, [])

  async function getCurrentLanguage() {
    await appMetafield.getAllAppMetafields().then((res) => {
      if (res.length === 0) {
        setIsLoading(true);
        saveDefaultDataForApp();
      } else {
        for (let i = 0; i < res.length; i++) {
          if (res[i].node.key === "current-plan") {
            let dData = JSON.parse(res[i].node.value);
            getWebHookData(dData);
          }
        }
        setIsLoading(true);
        setShowActivateButton(true);
      }
    });
    const shopName = await shopApi.shop();
    // setGetShopName(shopName);

    // -------------this code will record the video---------
    const mainString = shopName.domain;
    const string1 = "wishlist-guru";
    const string2 = "randeep-singh";
    const checkUserDomain = mainString.includes(string1) || mainString.includes(string2);
    if (!checkUserDomain) {
      clarityFxn();
    }
  };

  function clarityFxn() {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", "r0c9ecz3ii");
  }

  async function getWebHookData(getCurrentPlan) {
    try {
      const response = await fetch(`/api/re-register-webhook?plan=${getCurrentPlan}`);
      const result1 = await response.json();
      console.log("WEBHOOK- ", result1)
    } catch (error) {
      console.error("Error:", error);
    }
  };

  async function saveDefaultDataForApp() {
    try {
      const response = await fetch(`/api/save-default-data-for-wishlist-app`);
      const result1 = await response.json();
      // console.log("DUUUBUUU -- ", result1)
      setShowActivateButton(true);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div className='wf-dashboard '>
      {!isloading ?
        <SkeletonPage1 />
        :
        !showActivateButton ?
          <SkeletonPage1 msg={"We are getting your app — this should take 2–3 minutes. Thanks for your patience!"} />
          :
          <Dashboard />}
    </div >
  )
}

export default HomePage






// import React from 'react'



// const HomePage = () => {


//   return (
//     <div >
//       hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii
//     </div >
//   )
// }

// export default HomePage





