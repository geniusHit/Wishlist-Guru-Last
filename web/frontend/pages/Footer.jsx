import React, { useEffect } from 'react'
import { AlphaCard, Button, Text } from '@shopify/polaris'
import wfHelpAvatar from '../assets/user-avatar.svg';
import wfHelpDoc from '../assets/doc-text-fill.svg';
import useApi from '../hooks/useApi';

const Footer = ({ myLanguage }) => {
    const ShopApi = useApi();

    useEffect(() => {
        useEffectLite();
    }, []);

    async function useEffectLite() {
        const shopAPI = await ShopApi.shop();
        // console.log("shopAPI?.domain;   ---- ", shopAPI?.domain)
        const mainString = shopAPI?.domain;
        if (mainString.includes("wishlist-guru-store4")) {
            liveChatWF();
        } else {
            const string1 = "wishlist-guru";
            const string2 = "randeep-singh";
            const checkUserDomain = mainString.includes(string1) || mainString.includes(string2);
            if (!checkUserDomain) {
                liveChatWF();
            }
        }
    }


    function liveChatWF() {
        let Tawk_API = window.Tawk_API || {};
        Tawk_API.autoStart = new Date();
        (function () {
            let s1 = document.createElement('script'),
                s0 = document.getElementsByTagName('script')[0];
            s1.async = true;
            s1.src = 'https://embed.tawk.to/668540329d7f358570d68af2/1i1s85i42';
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin', '*');
            s0.parentNode.insertBefore(s1, s0);
        })();
    };


    return (
        <div>
            <div className="wf-dashboard-box wf-help-dashboard">
                <AlphaCard>
                    <div className='custom-margin'><Text variant="headingLg" as="h2">{myLanguage.helpHeading}</Text></div>
                    <p className='help-text-paragraph'>{myLanguage.helpText1} {myLanguage.helpText2}</p>
                    <div className='wf-help-dashboard-btn'>
                        <a style={{ textDecoration: "none" }} href="https://apps.shopify.com/wishlist-guru/reviews" target="_blank"><Button  ><img src={wfHelpAvatar} />   {myLanguage.contactUs} </Button></a>
                        <a style={{ textDecoration: "none" }} href="https://wishlist-guru.webframez.com/docs/" target="_blank"><Button><img src={wfHelpDoc} />{myLanguage.helpDocs}</Button></a>
                    </div>
                </AlphaCard>
            </div>
        </div>
    )
}
export default Footer