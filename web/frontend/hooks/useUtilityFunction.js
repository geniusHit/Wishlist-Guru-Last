import useApi from './useApi';
import useAppMetafield from './useAppMetafield';
import { Constants } from '../../backend/constants/constant';
import arabic from '../assets/Languages/arabic';
import french from '../assets/Languages/french';
import english from '../assets/Languages/english';
import dutch from '../assets/Languages/dutch';
import german from '../assets/Languages/german';
import chinese from '../assets/Languages/chinese';
import brazilian from '../assets/Languages/brazilian';
import danish from '../assets/Languages/danish';
import swedish from '../assets/Languages/swedish';
import spanish from '../assets/Languages/spanish';
import czech from '../assets/Languages/czech';
import japanese from '../assets/Languages/japanese';
import italian from '../assets/Languages/italian';
import korean from '../assets/Languages/korean';
import norwegianBokmal from '../assets/Languages/norwegianBokmal';
import polish from '../assets/Languages/polish';
import portugueseBrazil from '../assets/Languages/portugueseBrazil';
import portuguesePortugal from '../assets/Languages/portuguesePortugal';
import thai from '../assets/Languages/thai';
import turkish from '../assets/Languages/turkish';
import chineseTraditional from '../assets/Languages/chineseTraditional';
import bulgarian from '../assets/Languages/bulgarian';
import ukranian from '../assets/Languages/ukranian';
import lithunanian from '../assets/Languages/lithuanian';
import greek from '../assets/Languages/greek';
import irish from '../assets/Languages/irish';
import romanian from '../assets/Languages/romanian';
import filipino from '../assets/Languages/filipino';
import indonassian from '../assets/Languages/indonesian';
import russian from '../assets/Languages/russian';
import vietnameese from '../assets/Languages/vietnamese';
import albanian from '../assets/Languages/albanian';
import hungarian from '../assets/Languages/hungarian';
import finnish from '../assets/Languages/finnish';

import { useNavigate } from 'react-router-dom';

const useUtilityFunction = () => {

    const { appName } = Constants;

    const shopApi = useApi();
    const appMetafield = useAppMetafield();
    const Navigate = useNavigate();

    async function getAllAppDataMetafields() {
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "language-setting") {
                let dData = JSON.parse(dataArray[i].node.value);

                if (dData.languageSetting === "arabic") {
                    return arabic;
                } else if (dData.languageSetting === "english") {
                    return english;
                } else if (dData.languageSetting === "french") {
                    return french;
                } else if (dData.languageSetting === "dutch") {
                    return dutch;
                } else if (dData.languageSetting === "german") {
                    return german;
                } else if (dData.languageSetting === "chinese") {
                    return chinese;
                } else if (dData.languageSetting === "brazilian") {
                    return brazilian;
                } else if (dData.languageSetting === "danish") {
                    return danish;
                } else if (dData.languageSetting === "swedish") {
                    return swedish;
                } else if (dData.languageSetting === "spanish") {
                    return spanish;
                } else if (dData.languageSetting === "chineseTraditional") {
                    return chineseTraditional;
                } else if (dData.languageSetting === "czech") {
                    return czech;
                } else if (dData.languageSetting === "japanese") {
                    return japanese;
                } else if (dData.languageSetting === "italian") {
                    return italian;
                } else if (dData.languageSetting === "korean") {
                    return korean;
                } else if (dData.languageSetting === "norwegianBokmal") {
                    return norwegianBokmal;
                } else if (dData.languageSetting === "polish") {
                    return polish;
                } else if (dData.languageSetting === "portugueseBrazil") {
                    return portugueseBrazil;
                } else if (dData.languageSetting === "portuguesePortugal") {
                    return portuguesePortugal;
                } else if (dData.languageSetting === "thai") {
                    return thai;
                } else if (dData.languageSetting === "turkish") {
                    return turkish;
                } else if (dData.languageSetting === "ukrainian") {
                    return ukranian;
                } else if (dData.languageSetting === "lithuanian") {
                    return lithunanian;
                } else if (dData.languageSetting === "greek") {
                    return greek;
                } else if (dData.languageSetting === "irish") {
                    return irish;
                } else if (dData.languageSetting === "romanian") {
                    return romanian;
                } else if (dData.languageSetting === "filipino") {
                    return filipino;
                } else if (dData.languageSetting === "indonesian") {
                    return indonassian;
                } else if (dData.languageSetting === "russian") {
                    return russian;
                } else if (dData.languageSetting === "vietnamese") {
                    return vietnameese;
                } else if (dData.languageSetting === "albanian") {
                    return albanian;
                } else if (dData.languageSetting === "hungarian") {
                    return hungarian;
                } else if (dData.languageSetting === "finnish") {
                    return finnish;
                } else if (dData.languageSetting === "bulgarian") {
                    return bulgarian;
                }
                else {
                    return english;
                }
            };
        }
    };

    // const upgradeButtonFxn = async () => {
    //     await getAllAppDataMetafields().then((res) => {
    //         // console.log("vvvv ", res.upgrade)
    //         // setTimeout(async () => {
    //         let getElement = document.querySelectorAll(".disableEverything");

    //         let underBasic = document.querySelectorAll(".under-basic");
    //         let underPro = document.querySelectorAll(".under-pro");
    //         let underPremium = document.querySelectorAll(".under-premium");

    //         // console.log("underBasic -- ", underBasic)

    //         if (getElement.length !== 0) {
    //             for (var i = 0; i < getElement.length; i++) {
    //                 let addElement = getElement[i];
    //                 const box = document.createElement("div");
    //                 // box.innerHTML = res.upgrade;

    //                 console.log("underBasic -- ", underBasic)
    //                 console.log("underPro -- ", underPro)
    //                 console.log("underPremium -- ", underPremium)


    //                 console.log("111", res.upgrade);

    //                 // box.innerHTML = underBasic.length !== 0 ? res.shareWishlistSwalTitle : underPro.length !== 0 ? res.upgradeToPro : underPremium.length !== 0 ? res.langUpgrade : res.upgrade;

    //                 // box.innerHTML = underPremium.length !== 0 ? res.langUpgrade : underPro.length !== 0 ? res.upgradeToPro : underBasic.length !== 0 ? res.shareWishlistSwalTitle : res.upgrade;


    //                 if (underPremium.length !== 0) {
    //                     box.innerHTML = res.langUpgrade;
    //                 } else if (underPro.length !== 0) {
    //                     box.innerHTML = res.upgradeToPro;
    //                 } else if (underBasic.length !== 0) {
    //                     box.innerHTML = res.shareWishlistSwalTitle;
    //                 } else {
    //                     box.innerHTML = res.upgrade;
    //                 }

    //                 // console.log("222", underBasic.length !== 0 ? res.shareWishlistSwalTitle : underPro.length !== 0 ? res.upgradeToPro : underPremium.length !== 0 ? res.langUpgrade : res.upgrade);

    //                 box.setAttribute("class", "dontRunAgain upgradeButton");
    //                 box.addEventListener('click', async function handleClick(event) {
    //                     box.innerHTML = "Loading..";
    //                     // const shop = await shopApi.shop();
    //                     // const returnData = `https://${shop.domain}/admin/apps/${appName}/PricingPlan`;
    //                     // window.top.location.href = returnData;
    //                     Navigate({
    //                         pathname: `/PricingPlan`,
    //                         search: ``
    //                     })

    //                 });
    //                 addElement.appendChild(box);
    //             }
    //         }
    //         // }, [100]);
    //     });
    // };


    const upgradeButtonFxn = async () => {
        await getAllAppDataMetafields().then((res) => {
            let getElements = document.querySelectorAll(".disableEverything");

            if (getElements.length !== 0) {
                for (let i = 0; i < getElements.length; i++) {
                    let addElement = getElements[i];

                    // Check which class the element belongs to
                    let isUnderPremium = addElement.classList.contains("under-premium");
                    let isUnderPro = addElement.classList.contains("under-pro");
                    let isUnderBasic = addElement.classList.contains("under-basic");

                    const box = document.createElement("div");

                    if (isUnderPremium) {
                        box.innerHTML = res.langUpgrade;
                    } else if (isUnderPro) {
                        box.innerHTML = res.upgradeToPro;
                    } else if (isUnderBasic) {
                        box.innerHTML = res.shareWishlistSwalTitle;
                    } else {
                        box.innerHTML = res.upgrade;
                    }

                    box.setAttribute("class", "dontRunAgain upgradeButton");
                    box.addEventListener("click", function handleClick() {
                        box.innerHTML = "Loading..";
                        Navigate({
                            pathname: `/PricingPlan`,
                            search: ``,
                        });
                    });

                    addElement.appendChild(box);
                }
            }
        });
    };



    const goToSectionFxn = () => {
        setTimeout(() => {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const goToSection = urlParams.get('go-to');
            const element = document.getElementById(goToSection);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, [500]);
    };

    const getCurrentLanguage = async () => {
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "language-setting") {
                let dData = JSON.parse(dataArray[i].node.value);

                if (dData.languageSetting === "arabic") {
                    return arabic;
                } else if (dData.languageSetting === "english") {
                    return english;
                } else if (dData.languageSetting === "french") {
                    return french;
                } else if (dData.languageSetting === "dutch") {
                    return dutch;
                } else if (dData.languageSetting === "german") {
                    return german;
                } else if (dData.languageSetting === "chinese") {
                    return chinese;
                } else if (dData.languageSetting === "brazilian") {
                    return brazilian;
                } else if (dData.languageSetting === "danish") {
                    return danish;
                } else if (dData.languageSetting === "swedish") {
                    return swedish;
                } else if (dData.languageSetting === "spanish") {
                    return spanish;
                } else if (dData.languageSetting === "chineseTraditional") {
                    return chineseTraditional;
                } else if (dData.languageSetting === "czech") {
                    return czech;
                } else if (dData.languageSetting === "japanese") {
                    return japanese;
                } else if (dData.languageSetting === "italian") {
                    return italian;
                } else if (dData.languageSetting === "korean") {
                    return korean;
                } else if (dData.languageSetting === "norwegianBokmal") {
                    return norwegianBokmal;
                } else if (dData.languageSetting === "polish") {
                    return polish;
                } else if (dData.languageSetting === "portugueseBrazil") {
                    return portugueseBrazil;
                } else if (dData.languageSetting === "portuguesePortugal") {
                    return portuguesePortugal;
                } else if (dData.languageSetting === "thai") {
                    return thai;
                } else if (dData.languageSetting === "turkish") {
                    return turkish;
                } else if (dData.languageSetting === "ukrainian") {
                    return ukranian;
                } else if (dData.languageSetting === "lithuanian") {
                    return lithunanian;
                } else if (dData.languageSetting === "greek") {
                    return greek;
                } else if (dData.languageSetting === "irish") {
                    return irish;
                } else if (dData.languageSetting === "romanian") {
                    return romanian;
                } else if (dData.languageSetting === "filipino") {
                    return filipino;
                } else if (dData.languageSetting === "indonesian") {
                    return indonassian;
                } else if (dData.languageSetting === "russian") {
                    return russian;
                } else if (dData.languageSetting === "vietnamese") {
                    return vietnameese;
                } else if (dData.languageSetting === "albanian") {
                    return albanian;
                } else if (dData.languageSetting === "hungarian") {
                    return hungarian;
                } else if (dData.languageSetting === "finnish") {
                    return finnish;
                } else if (dData.languageSetting === "bulgarian") {
                    return bulgarian;
                }
                else {
                    return english;
                }

            };
        }
    };

    const getPlanFirst = async () => {
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "current-plan") {
                let dData = JSON.parse(dataArray[i].node.value);
                return dData
                // console.log("KKKKKKKKK ", dData)
                // if (dData === -999) {
                // const shop = await shopApi.shop();
                // window.top.location.replace(`https://${shop.domain}/admin/apps/${appName()}/PricingPlan`)
                // }
            }
        }
    };

    const getSetupGuideData = async () => {
        let isSetup = null
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i].node.key === "installation-setup-guide") {
                let dData = dataArray[i].node.value;
                isSetup = dData; return isSetup
            }
        }
        return isSetup
    };

    return {
        upgradeButtonFxn: upgradeButtonFxn,
        goToSectionFxn: goToSectionFxn,
        getCurrentLanguage: getCurrentLanguage,
        getPlanFirst: getPlanFirst,
        getSetupGuideData: getSetupGuideData

    }
}
export default useUtilityFunction;
