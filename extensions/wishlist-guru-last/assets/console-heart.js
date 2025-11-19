
const heartButton = document.getElementById("heart");
heartButton.addEventListener("click", heartButtonHandle);
let modalWF = document.getElementById("wg-myModal");
let spanWF = document.getElementsByClassName("wg-close")[0];
let modalLink = document.getElementById("wg-myModal1");
let spanLink = document.getElementsByClassName("close1")[0];
let modalDrawer = document.getElementById("wg-myModalD");
let spanDrawer = document.getElementsByClassName("closeD")[0];
var shareModal = document.getElementById("myshareModal");
var shareModalContent = document.querySelector(".modal-share-content");
var successDiv = document.querySelector(".successDiv");
var successInnerDiv = document.querySelector(".successInnerDiv");
let localData = JSON.parse(localStorage.getItem("wg-local-data"));
let customButton = localData?.customButton || JSON.parse(heartButton.getAttribute("button-setting"));
let customLanguage = localData?.customLanguage || JSON.parse(heartButton.getAttribute("language-setting").replace(/~/g, "'"));
let generalSetting = localData?.generalSetting || JSON.parse(heartButton.getAttribute("general-setting"));
// let getThemeName = localData?.getThemeName || JSON.parse(heartButton.getAttribute("theme-name"));
let getThemeName = {themeName: "Icon"}
let advanceSetting = localData?.advanceSetting || JSON.parse(heartButton.getAttribute("advance-setting").replace(/~/g, "'"));
let collectionBtnSetting = localData?.collectionBtnSetting || JSON.parse(heartButton.getAttribute("collection-btn-setting"));
let currentPlan = localData?.currentPlan || JSON.parse(heartButton.getAttribute("current-plan"));
let currencyType = wfCurrencyType?.substring(0, wfCurrencyType?.indexOf("{{")).trim();
const getFontFamily = heartButton.getAttribute("get-font-family")?.replace(/^"(.*)"$/, "$1") ?? null;
let getFontFamilyFallback = heartButton.getAttribute("get-font-family-fallback");
let shopDomain = heartButton.getAttribute("shop-domain");
const permanentDomain = heartButton.getAttribute("permanent-domain") || Shopify.shop;
const wf_shopName = heartButton.getAttribute("shop-name");
const customerEmail = heartButton.getAttribute("customer-email");
let checkAllProduct = document.getElementById("wf-custom-Product");
let checkButtonProduct = document.getElementById("wf-custom-button-Product");
let wishlistIconValue = "";
let wishlistCollectionIconValue = "";
let wishlistBtnValue = "";
let currentProduct = [];
let currentButtonProduct = [];
let storeFrontDefLang;
const onlyTextButton = customButton.type === "icon-text" || customButton.type === "text";
let isCountValid = (localData?.customButton?.showCount === "increaseNdisable" || localData?.customButton?.showCount === "increaseNdecrease" && localData?.currentPlan >= 2) || false;
let isCollectionCount = false;
let shouldAutoUpdateRender = false;
let hideArrow = "";
let shareWishlistToAdminEmail = "";

//MULTIWISHLIST
const getMultiWishlistDiv = document.getElementById("wg-multiWishlistMainDiv");
const closeMultiWishlistDiv = document.getElementsByClassName("wg-closeMultiwishlist")[0];
let isMultiwishlistTrue = false;
let isVariantWishlistTrue = false;

let multiArray = [];
let checkedItems = [];
let currentIndexWf = 0;
let nonCheckedItems = [];
let newQuantityOutLook = 1;
let wfSamePage = true;
let currentSelectedVariant = "";
let currentSelectedGrid = -1;
let currentSelectedKey = "";
let newArrayAfterSelection = [];

// let wgLastClickTime = 0;

setTimeout(() => {
    document.documentElement.style.setProperty('--add-to-wishlist', `"${customLanguage?.addToWishlist}"`);
    document.documentElement.style.setProperty('--remove-from-wishlist', `"${customLanguage?.addedToWishlist}"`);
}, 1000);

// ----------- add the header icon when there is header-actions in the header ----------
let lastHeaderHTML = '';
const wgHeaderObserver = new MutationObserver(() => {
    const headerActions = document.querySelector('header-actions');
    if (headerActions) {
        const currentHTML = headerActions.innerHTML;
        if (currentHTML !== lastHeaderHTML) {
            lastHeaderHTML = currentHTML;
            onHeaderActionsRender(headerActions);
        }
    }
});
wgHeaderObserver.observe(document.body, {
    childList: true,
    subtree: true,
});
function onHeaderActionsRender(element) {
    showWishlistButtonType();
    showCountAll();
}

let modalDrawerTextColor = generalSetting?.wlTextColor?.color ? generalSetting?.wlTextColor?.color : generalSetting.wlTextColor;
document.addEventListener("DOMContentLoaded", getCurentPlanSql);

const serverURL = "http://localhost:5000"; // -------------- local
// const serverURL = "https://nurses-requests-prove-convicted.trycloudflare.com"; // -------------- local
// const serverURL = 'https://wishlist-api.webframez.com'; // -------------- production
// const serverURL = 'https://wishlist-guru-api.webframez.com'; // -------------- stagging

const injectCoderr = document.getElementById("wf-custom-wishBtn-inject");
let injectCodeCondition = injectCoderr?.getAttribute("inject-code-automatic") || "automatic";

let varriantId;
let allWishlistData = JSON.parse(localStorage.getItem("wg-local-list")) || [];
let wgAllProducts = [];

const colIconDefaultColor = collectionBtnSetting?.iconDefaultColor?.filterColor
    ? collectionBtnSetting?.iconDefaultColor?.filterColor
    : collectionBtnSetting.iconDefaultColor;
const colIconSelectedColor = collectionBtnSetting?.iconSelectedColor.filterColor
    ? collectionBtnSetting?.iconSelectedColor?.filterColor
    : collectionBtnSetting.iconSelectedColor;

let wfGetDomain = window.location.href;
let wfDomainUrl = window.location.href;

if (wfDomainUrl.indexOf("/collections/") !== -1) {
    wfGetDomain = wfDomainUrl.split("/collections/")[0];
} else if (wfDomainUrl.indexOf("/products/") !== -1) {
    wfGetDomain = wfDomainUrl.split("/products/")[0];
} else if (wfDomainUrl.indexOf("/pages/") !== -1) {
    wfGetDomain = wfDomainUrl.split("/pages/")[0];
} else if (wfDomainUrl.indexOf("/cart") !== -1) {
    wfGetDomain = wfDomainUrl.split("/cart")[0];
} else if (wfDomainUrl.indexOf("/search/") !== -1) {
    wfGetDomain = wfDomainUrl.split("/search/")[0];
} else if (wfDomainUrl.indexOf("/blogs/") !== -1) {
    wfGetDomain = wfDomainUrl.split("/blogs/")[0];
} else if (wfDomainUrl.indexOf("/collections") !== -1) {
    wfGetDomain = wfDomainUrl.split("/collections")[0];
} else if (wfDomainUrl.indexOf("/search") !== -1) {
    wfGetDomain = wfDomainUrl.split("/search")[0];
} else if (wfDomainUrl.indexOf("/apps/") !== -1) {
    wfGetDomain = wfDomainUrl.split("/apps/")[0];
} else if (wfDomainUrl.indexOf("/account") !== -1) {
    wfGetDomain = wfDomainUrl.split("/account")[0];
} else if (wfDomainUrl.indexOf("/?_") !== -1) {
    wfGetDomain = wfDomainUrl.split("/?_")[0];
} else if (wfDomainUrl.indexOf("/?") !== -1) {
    wfGetDomain = wfDomainUrl.split("/?")[0];
} else if (wfDomainUrl.indexOf("?") !== -1) {
    wfGetDomain = wfDomainUrl.split("?")[0];
} else {
    wfGetDomain = window.location.href;
}

if (wfGetDomain.endsWith("/#")) {
    wfGetDomain = wfGetDomain.slice(0, -1); // remove the #
}
if (!wfGetDomain.endsWith("/")) {
    wfGetDomain += "/";
}

//  ---------------- here we are trying to get the data and icon fast ----------------
(async function () {
    const isMultiwishlistTrueValue1 = heartButton?.hasAttribute('isMultiwishlistTrue') ? heartButton?.getAttribute('isMultiwishlistTrue') : "no";
    isMultiwishlistTrue = isMultiwishlistTrueValue1 === "yes" && currentPlan > 3;
    console.log(" ---- optimizing WG 2.O ---- ");
    // ------- to show the header icon with custom code -------
    currentPlan > 1 && showCustomHeaderIcon1();
    showWishlistButtonType();
    // -------to show the collection icon and button with custom code-------
    currentPlan > 1 && wishlistIcon1();
    currentPlan > 1 && wishlistButtonForCollection1();
})()

document.addEventListener("DOMContentLoaded", loadSavedButtonStyle);
function loadSavedButtonStyle() {
    const savedStyle = localStorage.getItem("wg-button-style");
    if (savedStyle) {
        let buttonStyleHead = document.getElementById("console-style");
        if (!buttonStyleHead) {
            buttonStyleHead = document.createElement("style");
            buttonStyleHead.id = "console-style";
            document.getElementsByTagName("head")[0].appendChild(buttonStyleHead);
        }
        buttonStyleHead.innerHTML = savedStyle;
    }
}

function getWgApiKey() {
    const token = localStorage.getItem("wg-token");
    return token && token.trim() !== "" ? token : null;
}

async function getWgEmail() {
    const getCurrentLogin = await getCurrentLoginFxn();
    return (getCurrentLogin !== "" ? getCurrentLogin : getAccessTokenFromCookie())
}

async function getCurentPlanSql() {
    const isMultiwishlistTrueValue1 = heartButton.hasAttribute('isMultiwishlistTrue') ? heartButton.getAttribute('isMultiwishlistTrue') : "no";
    isMultiwishlistTrue = isMultiwishlistTrueValue1 === "yes" && currentPlan > 3;
    //    ---------- this code will show header and floating icon using plan from metafield.. after we are confirming the plan from DB-------- 
    buttonStyleFxn();
    if (JSON.parse(heartButton.getAttribute("current-plan")) >= 1) {
        await Promise.all([showWishlistButtonType(), showCountAll()]);
    }

    try {
        const response = await fetch(`${serverURL}/get-current-plan-sql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "wg-api-key": getWgApiKey(),
                "wg-user": await getWgEmail(),
            },
            body: JSON.stringify({
                shopName: permanentDomain,
                wfGetDomain: wfGetDomain,
                normalDomain: `https://${shopDomain}/`,
            }),
        });
        const result = await response.json();

        // console.log("result ==== ", result)

        if (result?.planData.length > 0) {
            const prevToken = localStorage.getItem("wg-token");
            if (!prevToken || prevToken !== result.token) {
                localStorage.setItem("wg-token", result.token);
            }
            currentPlan = result?.planData[0]?.active_plan_id;
            const translationData =
                result?.languageData.length > 0
                    ? result?.languageData[0]?.translations
                    : heartButton.getAttribute("language-setting");
            customLanguage = JSON.parse(translationData.replace(/~/g, "'"));
            shouldAutoUpdateRender = true;
            updateLanguageFxn();
        }
        await Promise.all([showWishlistButtonType(), showCountAll()]);
        const isPremiumPlan = currentPlan >= 2;
        if (collectionBtnSetting?.collectionShowCount === "yes") {
            collectionBtnSetting.collectionShowCount = "increaseNdecrease";
        }
        if (customButton.showCount === "yes") {
            customButton.showCount = "increaseNdecrease";
        }
        isCountValid = customButton.showCount === "increaseNdisable" || customButton.showCount === "increaseNdecrease" && isPremiumPlan;
        isCollectionCount = collectionBtnSetting?.collectionShowCount === "increaseNdisable" || collectionBtnSetting?.collectionShowCount === "increaseNdecrease" && isPremiumPlan;
        const isMultiwishlistTrueValue = heartButton.hasAttribute('isMultiwishlistTrue') ? heartButton.getAttribute('isMultiwishlistTrue') : "no";
        isMultiwishlistTrue = isMultiwishlistTrueValue === "yes" && currentPlan > 3;

        const isVariantwishlistTrueValue = heartButton.hasAttribute('isVariantTrue') ? heartButton.getAttribute('isVariantTrue') : "no";
        isVariantWishlistTrue = isVariantwishlistTrueValue === "yes" && currentPlan > 3;
        buttonStyleFxn();
        if (isPremiumPlan) {
            setupIconInterval();
            setInterval(setupIconInterval, 1000);
            customIconInterval();
            setInterval(customIconInterval, 3000);
            customButtonInterval();
            setInterval(customButtonInterval, 3000);
            setupGridInterval();
            setInterval(setupGridInterval, 1500);
            if (permanentDomain === 'l-a-girl-cosmetics.myshopify.com') {
                customButtonIntervalLaGirl();
                setInterval(customButtonIntervalLaGirl, 3000);
            }
        }

        // ---------we commented inject code from here because it is runnung twice----------
        // injectWishlistButtonForcely();
        await runsAfterDomContentLoaded();

        onWishlistRender();
        showWishlistBydefault();
        headerIconStyle();
        wishlistIcon();
        wishlistButtonForCollection();
        // add icons if the page is created through pagify
        showIconsOnPagiflyBuilder();

        if (permanentDomain === '789dcd-a5.myshopify.com') {
            appendBodyOutsideHide()
            const floLauncher = document.querySelector('.wf-floating-launcher')
            if (floLauncher) {
                floLauncher.style.zIndex = 999
                floLauncher.style.bottom = '100px'
                floLauncher.style.right = '20px'
            }
        }
        // ---------to render the class and size of the icon------
        collectionIconSize();
        // -------remove drawer classes-------
        // removeDrawerClasses();
    } catch (error) {
        console.error("Error fetching current plan:", error);
    }
    // -------- add icon in the PDP image --------  
    showIconOnPdpImage();
    // -------- this function will add data in the modal structure after 0.5 sec --------  
    setTimeout(() => pageTypeFunction(), 0)
}

function removeDrawerClasses() {
    setTimeout(() => {
        if (generalSetting.wishlistDisplay === "modal") {

            const classesToRemove = ['sidenav', 'overlayy'];
            classesToRemove.forEach(className => {
                document.querySelectorAll(`.${className}`).forEach(el => el.remove());
            });
        }
    }, 3000)
}

function appendBodyOutsideHide() {
    const mainBlock = document.getElementById('shopify-block-16428855274652595211');
    const pageCont = document.getElementById('PageContainer');
    if (mainBlock && pageCont) {
        pageCont.appendChild(mainBlock);
    } else {
        //   console.log('Element "abc" or "pagecont" not found');
    }
}

function updateLanguageFxn() {
    // var h4Element = document.querySelectorAll(".searchData label, .searchData h4");
    // for (var wf = 0; wf < h4Element.length; wf++) {
    //     h4Element[wf].innerHTML = customLanguage.searchBarText || "Search here";
    // }

    var h4Element = document.querySelectorAll(".searchData");
    for (var wf = 0; wf < h4Element.length; wf++) {
        h4Element[wf].innerHTML = `<div class="searchData-main">
                                    <div class="searchData-main1">
                                        <span class="wg-search-icon"></span>
                                        <input id="search-input" class="searchbar_Input" placeholder="" onkeyup="handleSearchData(event)" value=""/>
                                    </div>
                                    <div class="searchData-main2">
                                        <div class="vcb-width wg-clearwishlist">
                                            <div onclick="clearAllWishlist()" class="cartButtonStyle addAllToCartButton">
                                            ${customLanguage.clearAllWishlist || storeFrontDefLang.clearAllWishlist}
                                            </div>  
                                        </div>
                                    </div>
                                </div>`


        // `<input id="search-input" class="searchbar_Input" placeholder="" onkeyup="handleSearchData(event)" value=""/>`;
    }

    var searchPlaceholder = document.querySelectorAll(".searchData input");
    for (var wf = 0; wf < searchPlaceholder.length; wf++) {
        searchPlaceholder[wf].placeholder =
            customLanguage.searchBarText || "Search here";
    }
    if (currentPlan === 1) {
        var poweredByUpdate = document.querySelectorAll(".powered-by-text");
        for (var wf = 0; wf < poweredByUpdate.length; wf++) {
            poweredByUpdate[wf].innerHTML = `${customLanguage.poweredByText || "Powered by"
                } <span onclick="goToWebframez()">Wishlist Guru</span>`;
        }
    }
    if (
        getThemeName?.themeName === "Local" &&
        window.location.pathname === "/apps/wg-wishlist"
    ) {
        let checkClass = document.querySelectorAll(
            ".wishlist-page-main.page-width"
        );
        checkClass[0].classList.add("wg-wishlist-page-local");
        let addInlineCss = document.querySelector(
            ".wg-wishlist-page-local .modal-heading"
        );
        addInlineCss.style.display = "Block";
    } else if (getThemeName?.themeName === "Local") {
        let checkClass = document.querySelectorAll("#wg-myModal");
        checkClass[0].classList.add("wg-wishlist-modal-local");
        let addInlineCss = document.querySelector(
            ".wg-wishlist-modal-local .modal-heading"
        );
        addInlineCss.style.display = "Block";
    } else {
        // console.log("not a local theme");
    }
    if (getThemeName?.themeName === "Avenue") {
        const modalCss = document.querySelector(".wg-modal");
        if (modalCss) {
            modalCss.style.zIndex = "9999";
        }
        const shareModalCss = document.querySelector("#myshareModal");
        if (shareModalCss) {
            shareModalCss.style.zIndex = "9999";
        }
        const modalCssLink = document.querySelector(".wg-modal1");
        if (modalCssLink) {
            modalCssLink.style.zIndex = "99999";
        }
    } else if (
        getThemeName?.themeName === "Split" ||
        getThemeName?.themeName === "Multi" ||
        getThemeName?.themeName === "Highlight"
    ) {
        const modalCss = document.querySelector(".wg-modal");
        if (modalCss) {
            modalCss.style.zIndex = "99999";
        }
        const shareModalCss = document.querySelector("#myshareModal");
        if (shareModalCss) {
            shareModalCss.style.zIndex = "99999";
        }
        const modalCssLink = document.querySelector(".wg-modal1");
        if (modalCssLink) {
            modalCssLink.style.zIndex = "99999";
        }
    } else {
    }
    let modifiedString = getThemeName?.themeName?.replace(/ /g, "_");
    modifiedString = modifiedString?.toLowerCase();
    let themeNameClass = `wg-${modifiedString}-custom-css`;
    document.body.classList.add(themeNameClass);

    const allowedThemes = ["Impulse", "Horizon"];
    if (allowedThemes.includes(getThemeName?.themeName)) {
        document.body.classList.add("wg-grid-relative-forcely");
    }
}

function goToAccount() {
    if (wfSamePage === false) {
        window.open("/account", "_blank");
    } else {
        window.location.href = "/account";
    }
};

function goToRegister() {
    if (wfSamePage === false) {
        window.open("/account/register", "_blank");
    } else {
        window.location.href = "/account/register";
    }
};

//  -------------------LA girls usa------------------------
let checkAllLaGirlProduct = document.getElementById("wf-custom-Product-laGirlUsa");

async function checkCustomCodeProductLaGirl() {
    const getAllWishlistDiv = document.querySelectorAll(".wf-wishlist-lagirl");
    const allHandler = Array.from(getAllWishlistDiv, (wishlistDiv) =>
        wishlistDiv.getAttribute("product-id")
    ).filter(Boolean);
    const finalStoredData = parseInt(checkAllLaGirlProduct.getAttribute("data-aj"));
    if (parseInt(finalStoredData) !== allHandler.length) {
        checkAllLaGirlProduct.setAttribute("data-aj", allHandler.length);
        checkAllLaGirlProduct.setAttribute(
            "data-product-handle",
            JSON.stringify(allHandler)
        );
    } else {
        let checkProductHandle = JSON.parse(
            checkAllLaGirlProduct.getAttribute("data-product-handle")
        );
        const checkDataExist = await checkIdIncluded(
            checkProductHandle,
            allHandler
        );
        if (!checkDataExist) {
            checkAllLaGirlProduct.setAttribute("data-aj", allHandler.length);
            checkAllLaGirlProduct.setAttribute(
                "data-product-handle",
                JSON.stringify(allHandler)
            );
        } else {
            const wfWishlist = document.querySelectorAll(".icon-collection-laGirl");
            if (wfWishlist.length === 0 && allHandler.length !== 0) {
                checkAllLaGirlProduct.setAttribute("data-aj", "0");
                checkAllLaGirlProduct.setAttribute("data-product-handle", []);
                checkAllLaGirlProduct.setAttribute("data-aj", allHandler.length);
                checkAllLaGirlProduct.setAttribute(
                    "data-product-handle",
                    JSON.stringify(allHandler)
                );
            }
        }
    }
}

async function wishlistIconLaGirl() {
    const iconPosition = await checkIconPostion();
    if (currentPlan >= 2) {
        const getAllWishlistDiv = document.querySelectorAll(".wf-wishlist-lagirl");

        const prependPromisesWi = Array.from(getAllWishlistDiv).map(
            async (wishlistDiv) => {
                const selectedId = wishlistDiv.getAttribute("product-id");
                const selectedProductImgHandle = wishlistDiv.getAttribute("product-img");
                const selectedProductTitleHandle = wishlistDiv.getAttribute("product-title");
                const selectedProductHandle = wishlistDiv.getAttribute("product-handle");
                let addWishlistIcon = document.createElement("div");
                addWishlistIcon.style.zIndex = "10";
                addWishlistIcon.style.position = "relative";
                const { isComboIcon } = checkCollectionIcon();
                const countData = await isCountOrNot(selectedId, isCollectionCount);
                const newCountData = onlyTextButton ? `<div class="wf-product-count">${countData}</div>` : countData;
                const matchFound = await checkFound(allWishlistData, selectedId)
                if (allWishlistData.length > 0 && matchFound) {
                    addWishlistIcon.innerHTML = `<div class="collection_icon_new_selected "><div onClick="customCodeButtonClickLaGirl(${selectedId},'${selectedProductImgHandle}','${selectedProductTitleHandle}','${selectedProductHandle}')" style="filter: ${colIconSelectedColor}; ${collectionIconSize()}"  class="icon-collection icon-collection-laGirl ${isComboIcon ? iconPosition.iconStyle2 : iconPosition.iconStyle
                        }"></div></div>${isCollectionCount ? newCountData : ""}`;
                } else {
                    addWishlistIcon.innerHTML = `<div class="collection_icon_new "><div style="filter: ${colIconDefaultColor}; ${collectionIconSize()}"  onClick="customCodeButtonClickLaGirl(${selectedId},'${selectedProductImgHandle}','${selectedProductTitleHandle}','${selectedProductHandle}')" class="icon-collection icon-collection-laGirl ${iconPosition.iconStyle}"></div></div>${isCollectionCount ? newCountData : ""}`;
                }
                wishlistDiv.innerHTML = addWishlistIcon.innerHTML;
                isCollectionCount && renderCollectionTextColor(matchFound ? "added" : "removed", selectedId, isCollectionCount);
            }
        );
        try {
            await Promise.all(prependPromisesWi);
            const allShow = document.querySelectorAll(".wf-wishlist-lagirl");
            allShow.forEach((wishlistDiv) => {
                wishlistDiv.style.display = "block";
            });
        } catch (error) {
            console.log("Error occurred:", error);
        }
    }
}

async function customCodeButtonClickLaGirl(selectedId, imgHandle, productTitle, productHandle) {
    try {
        let buttonClickData = {
            productId: selectedId,
            variantId: selectedId,
            price: null,
            handle: productHandle,
            title: productTitle,
            image: imgHandle,
            quantity: 1,
            language: wfGetDomain,
        };
        const res = await showLoginPopup(selectedId);
        if (res) return;
        const matchFound = await checkFound(allWishlistData, selectedId)
        if (isMultiwishlistTrue) {
            renderPopupLoader()
            if (allWishlistData.length > 0 && matchFound) {
                buttonClickData.isDelete = "yes";
                openMultiWishlist(buttonClickData, selectedId, "customIcon")
            } else {
                openMultiWishlist(buttonClickData, selectedId, "customIcon")
            }
        } else {
            buttonClickData.wishlistName = matchFound ? ["wfNotMulti"] : ["favourites"];
            await checkCollectionCounterData(selectedId, !matchFound ? "add" : "remove")
            customIconAddedRemoveToWishlistLaGirl(selectedId, matchFound ? false : true);
            saveMainData(buttonClickData, selectedId, "customIcon")
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function customIconAddedRemoveToWishlistLaGirl(selectedId, matchinOrNot) {
    const iconPosition = await checkIconPostion();
    const { isComboIcon } = checkCollectionIcon();
    const countData = await isCountOrNot(selectedId, isCollectionCount);
    const newCountData = onlyTextButton ? `<div class="wf-product-count">${countData}</div>` : countData;
    const checkCollectionElements = document.querySelectorAll(`.wf-wishlist-collection-icon[product-id='${selectedId}'] .wf-product-count`);
    checkCollectionElements.forEach(element => {
        updateCountElement(element, newCountData);
    });
    let getCustomWishlist = document.querySelectorAll(".wf-wishlist-lagirl");
    if (getCustomWishlist.length !== 0) {
        const iconArray = Array.from(getCustomWishlist);
        iconArray.forEach((icon, index) => {
            const id = icon.getAttribute("product-id");
            if (Number(id) === Number(selectedId)) {
                let productHandle = icon.getAttribute("product-handle");
                const selectedId = icon.getAttribute("product-id");
                const selectedProductImgHandle = icon.getAttribute("product-img");
                const selectedProductTitleHandle = icon.getAttribute("product-title");
                let updateWishlistIcon = `<div class="${matchinOrNot ? "collection_icon_new_selected" : "collection_icon_new"}"><div style="${matchinOrNot ? `filter: ${colIconSelectedColor};` : `filter: ${colIconDefaultColor};`} ${collectionIconSize()} " onClick="customCodeButtonClickLaGirl(${selectedId},'${selectedProductImgHandle}','${selectedProductTitleHandle}','${productHandle}')" class="icon-collection icon-collection-laGirl ${isComboIcon && matchinOrNot ? iconPosition.iconStyle2 : iconPosition.iconStyle}"></div></div> ${isCollectionCount ? newCountData : ""}`;

                getCustomWishlist[index].innerHTML = updateWishlistIcon;

                isCollectionCount && renderCollectionTextColor(matchinOrNot ? "added" : "removed", selectedId, isCollectionCount);
            }
        });
    }
}

if (permanentDomain === 'l-a-girl-cosmetics.myshopify.com') {
    const checkObjBtnConfigLaGirl = {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
    };
    let CheckCustomButtonObserverLaGirl = new MutationObserver(wishlistIconLaGirl);
    CheckCustomButtonObserverLaGirl.observe(checkAllLaGirlProduct, checkObjBtnConfigLaGirl);
}

// -------------for updating quantity------------------
function checkQuantityValue(callback) {
    let value = parseInt(document.querySelector('input[name=quantity]').value, 10);
    const minusButton = document.querySelectorAll('quantity-input.quantity button[name="minus"]');
    const plusButton = document.querySelectorAll('quantity-input.quantity button[name="plus"]');
    const checkData = minusButton[minusButton.length - 1];
    const checkPlusData = plusButton[plusButton.length - 1];
    if (checkData) {
        checkData.addEventListener('click', () => {
            if (value > 1) {
                // console.log("value checkData", value);
                value--;
            }
            callback(value);
        });
    }
    if (checkPlusData) {
        checkPlusData.addEventListener('click', () => {
            // console.log("value checkPlusData", value);
            value++;
            callback(value);
        });
    }
    callback(value);
}

async function showLoginPopup(productId) {
    const isLogin = await getCurrentLoginFxn();
    const foundItem = allWishlistData.find(
        (item) => item.product_id === productId
    );
    if (
        currentPlan > 2 &&
        !foundItem &&
        isLogin === "" &&
        generalSetting?.createWishlist &&
        generalSetting.createWishlist === "yes"
    ) {
        createWishlistOrNot(productId);
        return true;
    } else {
        return false;
    }
}

async function getDefLanguage() {
    const params = {
        langName: btoa(`${customLanguage.textMsgLanguage}Message`),
    };
    try {
        const response = await fetch(`${serverURL}/get-default-store-lang`, {
            body: JSON.stringify(params),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error("Network response was not ok " + response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching theme data:", error);
    }
}

function renderViewAs() {
    const gridBox = document.querySelector(".grid-option")?.style;
    const gridHeading = document.querySelector(".gridText")?.style;
    const searchBox = document.querySelector(".searchData")?.style;
    const shareBox = document.querySelector(".share-div")?.style;
    if (generalSetting?.hideGrid) {
        gridBox.display = "none";
        searchBox.justifyContent = "flex-start";
        shareBox.margin = "0 0 0 auto";
    }
    if (generalSetting?.hideViewAs) {
        gridHeading.display = "none";
    }
    if (generalSetting?.hideSearch) {
        searchBox.display = "none";
    }
}

async function createWishlistOrNot(productId) {
    const inputText = `
        <h3>${customLanguage?.isLoginParaText || storeFrontDefLang.isLoginParaText
        }</h3>
        <div class="wg-islogin-buttons">
            <button onClick="goToRegister()" class="wg-register-btn">${customLanguage?.createAccountAnchor || storeFrontDefLang.createAccountAnchor
        }</button>
            <button onClick="goToAccount()" class="wg-login-btn">${customLanguage?.loginTextAnchor || storeFrontDefLang?.loginTextAnchor
        }</button>
        </div>`;

    const wishlistModal = generalSetting.wishlistDisplay === "modal";
    const wishlistDrawer = generalSetting.wishlistDisplay === "drawer";
    const showElement = (selector, displayType = "block") => {
        const element = document.querySelector(selector);
        if (element) element.style.display = displayType;
    };
    if (wishlistModal) {
        // Modal settings
        modalWF.style.display = "block";
        showElement(".modal-page-auth", "none");
        showElement(".grid-outer-main", "none");
        showElement("#wg-modal-inner-content", "none");
        showElement(".searchData", "none");

        const modalContent = document.querySelector(".wg-modal-content");
        if (modalContent) {
            const wlWidth =
                generalSetting.createWishlist === "yes"
                    ? "50%"
                    : `${generalSetting.wlWidthInput}${generalSetting.wlWidthUnit}`;
            modalContent.style.maxWidth = wlWidth;
            if (generalSetting.createWishlist === "yes") {
                modalContent.style.top = "50%";
                modalContent.style.transform = "translate(0, -50%)";
            }
        }
        showElement("#wg-isLogin-modal");
        document.querySelector(".modal-heading").innerHTML = customLanguage.modalHeadingText || storeFrontDefLang.modalHeadingText;
        // --------- add wishlist description-------
        addWishlistDescription();
        document.getElementById("wg-isLogin-modal").innerHTML = inputText;
        spanWF.onclick = () => {
            const scrollToTop = document.querySelectorAll('.wishlist-modal-box, .wg-modal'); // Select all matching elements
            scrollToTop.forEach(element => {
                element.scrollTop = 0;
            })
            modalWF.style.display = "none";
            showElement("#wg-isLogin-modal", "none");
            // document.body.style.overflow = "auto";
            removeScrollFromBody();
            removeClassFromBody();
        };
    } else if (wishlistDrawer) {
        // Drawer settings
        document.querySelector(".sidenav").style.transform = "translateX(0%)";
        document.querySelector(".overlayy").style.height = "100vh";
        showElement(".swlb-div", "none");
        showElement(".drawer-main", "none");
        showElement(".drawer-button-div", "none");

        showElement("#wg-isLogin-drawer");
        document.querySelector(".drawer-text").innerHTML = customLanguage.modalHeadingText || storeFrontDefLang.modalHeadingText;
        document.getElementById("wg-isLogin-drawer").innerHTML = inputText;
    } else {
        localStorage.setItem("isLoginProductId", productId);
        window.location = `${wfGetDomain}apps/wg-wishlist`;
        // if (shopDomain === 'rubychikankari.com' || shopDomain === 'preahkomaitland.com.au') {
        //     window.location = `${wfGetDomain}pages/wishlist`;
        // } else {
        //     window.location = `${wfGetDomain}pages/wg-wishlist`;
        // }
    }
}

async function getStoreLanguage() {
    try {
        const response = await fetch(`${serverURL}/get-store-language`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                shopName: permanentDomain,
                url: currentPlan > 2 ? wfGetDomain : `https://${shopDomain}/`,
            }),
        });
        if (!response.ok)
            throw new Error(`Network response was not ok: ${response.statusText}`);

        const result = await response.json();
        const translationData =
            result.data.length > 0
                ? result.data[0].translations
                : heartButton.getAttribute("language-setting");

        customLanguage = JSON.parse(translationData.replace(/~/g, "'"));
        shouldAutoUpdateRender = true;
        updateLanguageFxn();
    } catch (error) {
        console.error("Error fetching store language:", error);
    }
}

async function runsAfterDomContentLoaded() {
    if (
        collectionBtnSetting["collectionIconType"] === null ||
        collectionBtnSetting["collectionIconType"] === undefined ||
        collectionBtnSetting["collectionIconType"] === ""
    ) {
        if (collectionBtnSetting.iconType === "star") {
            collectionBtnSetting["collectionIconType"] = "starOutlineSolid";
        } else if (collectionBtnSetting.iconType === "save") {
            collectionBtnSetting["collectionIconType"] = "saveOutlineSolid";
        } else {
            collectionBtnSetting["collectionIconType"] = "heartOutlineSolid";
        }
    }
}

async function detechThemeName() {
    const params = {
        themeName: btoa(getThemeName.themeName),
        filter: btoa("none"),
    };
    try {
        const response = await fetch(`${serverURL}/get-theme-data`, {
            body: JSON.stringify(params),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            mode: "cors"
        });
        if (!response.ok) {
            throw new Error("Network response was not ok " + response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching theme data:", error);
    }
}

const wgLocalData = JSON.parse(localStorage.getItem("wg-local-data")) || {};
let themeCurrentSelectors = wgLocalData?.getThemeSelector || {};
// detechThemeName()
//     .then((result) => {
//         themeCurrentSelectors = result;

if (getThemeName.themeName === "Fabric") {
    document.querySelector(`${themeCurrentSelectors?.headerMenuItem}`).style.display = "flex";
    document.querySelector(`${themeCurrentSelectors?.headerMenuItem}`).style.alignItems = "center";
    document.querySelector(`${themeCurrentSelectors?.headerMenuItem}`).style.gap = "20px";
    document.querySelector(".wg-fabric-menuItem-desktop").style.fontSize = "16px";
    document.querySelector(".wg-fabric-menuItem-desktop a").style.color = "#363636";
}
// })
// .catch((error) => {
//     console.error("Promise rejected:", error);
// });

/** INJECT BUTTON **/
async function injectWishlistButtonForcely() {
    if (injectCodeCondition !== "automatic" || !window.location.pathname.includes("/products/")) return;
    const proHandle = injectCoderr.getAttribute("data-product-handle");
    const proId = injectCoderr.getAttribute("data-product-id");
    const varId = injectCoderr.getAttribute("variant-id");

    try {
        await injectCode(proId, proHandle, varId);
    } catch (error) {
        console.error("Error injecting wishlist button:", error);
    }
    collectionIconSize();
}

async function injectCode(proId, proHandle, varId) {

    const mainWishlistDiv = document.getElementById("wishlist-guru");
    if (mainWishlistDiv) return;
    const allForms = Array.from(document.querySelectorAll("form")).filter(
        (form) => form.action.endsWith("/cart/add")
    );
    if (allForms.length === 0) return;
    const deleteInjectWishButton = document.getElementById("inject_wish_button");
    if (deleteInjectWishButton) {
        deleteInjectWishButton.remove(); // Removes the element if it exists
        // console.log("yes im deleting it first")
    }

    const addToWishlistData = await renderButtonAddToWishlist(proId, isCountValid, "load");
    const alreadyAddedToWishlistData = await renderButtonAddedToWishlist(proId, isCountValid, "load");
    const renderBorderValue = await checkFound(allWishlistData, parseInt(proId), parseInt(varId))
    const addWishlistButton = document.createElement("div");
    addWishlistButton.innerHTML = `<div class="button-collection">${renderBorderValue ? alreadyAddedToWishlistData : addToWishlistData}</div>`;
    const wishlistDivs = document.createElement("div");
    wishlistDivs.id = "inject_wish_button";
    wishlistDivs.style.margin = customButton.type === "icon" ? customButton.textAlign === "center" ? "0 auto" : customButton.textAlign === "left" ? "0" : "0 0 0 auto" : "10px 0px";
    wishlistDivs.style.width = renderWidth(isCountValid);
    wishlistDivs.style.position = "relative";
    wishlistDivs.innerHTML = addWishlistButton.innerHTML;

    // if (allForms.length > 0 && allForms.length < 3) {
    //     const formToAppend = allForms.length <= 3
    //         ? allForms[allForms.length - 1]
    //         : allForms[allForms.length - 2];
    //     formToAppend.appendChild(wishlistDivs);
    // } else {
    //     for (const form of allForms) {
    //         const elementToCheck = form.querySelector('button[type="button"], button[name="add"], input[type="submit"], button[type="submit"]');
    //         if (elementToCheck) {
    //             form.appendChild(wishlistDivs);
    //             break;
    //         }
    //     }
    // }
    if (allForms.length > 0 && allForms.length < 3) {
        let formToAppend
        if (permanentDomain === '0hzau3-pr.myshopify.com') {
            formToAppend = allForms[0];
        }
        else if (permanentDomain === 'adn4ye-8k.myshopify.com') {
            formToAppend = allForms[1];
        }
        else {
            formToAppend = allForms.length <= 3
                ? allForms[allForms.length - 1]
                : allForms[allForms.length - 2];
        }
        formToAppend.appendChild(wishlistDivs);
    } else {
        for (const form of allForms) {
            const elementToCheck = form.querySelector('button[type="button"], button[name="add"], input[type="submit"], button[type="submit"]');
            if (elementToCheck) {
                form.appendChild(wishlistDivs);
                break;
            }
        }
    }
    isCountValid && renderBorder(renderBorderValue ? "added" : "removed", isCountValid);
    wishlistDivs.onclick = () => injectButtonClick(proId, proHandle, varId);
}

// let lastClickTime = 0;


async function injectButtonClick(selectedId, handle, varId) {
    // const now = Date.now();

    // // If the previous click was less than 800ms ago, treat as continuous click
    // if (now - lastClickTime < 800) {
    //     // optional: adjust lastClickTime slightly to prevent runaway
    //     lastClickTime -= 0; // we can also do lastClickTime = now to reset
    //     console.log("Ignoring continuous click...");
    //     return;
    // }

    // // Record this click time
    // lastClickTime = now;

    // console.log("------------ Clicking inject button -----------");


    try {
        const { productPrice, varriantId, variant_img, buttonJsonData } = await getProductData(handle);
        const quantityInput = document.querySelector('input[name="quantity"]');
        const quantityValue = quantityInput?.value;
        let variantArr = buttonJsonData.variants;
        let saveVariantId = buttonJsonData.variants[0].id;
        let saveImage = buttonJsonData.images[0];
        if (isVariantWishlistTrue === true) {
            saveVariantId = varId || buttonJsonData?.variants[0].id;
            const resultFind = variantArr.find(data => data.id === parseInt(varId));
            saveImage = resultFind?.featured_image?.src || buttonJsonData.images[0];
        } else {
            saveVariantId = varriantId != "" ? varriantId : buttonJsonData.variants[0].id;
            saveImage = buttonJsonData.images[0];
        }
        let getProductOption = wgGetProductOptions();
        // console.log("wgGetProductOptions --- ", getProductOption);

        let buttonData = {
            productId: buttonJsonData.id,
            // variantId: varriantId != "" ? varriantId : buttonJsonData.variants[0].id,
            variantId: saveVariantId,
            price: productPrice,
            handle: buttonJsonData.handle,
            title: buttonJsonData.title,
            // image: variant_img,
            image: saveImage,
            quantity: quantityValue || 1,
            language: wfGetDomain,
            productOption: JSON.stringify(getProductOption)
        };

        const res = await showLoginPopup(selectedId);
        if (res) return;
        const matchFound = await checkFound(allWishlistData, selectedId, varId)
        if (isMultiwishlistTrue) {
            renderPopupLoader();
            if (allWishlistData.length > 0 && matchFound) {
                buttonData.isDelete = "yes";
                openMultiWishlist(buttonData, selectedId, "inject", varId)
            } else {
                openMultiWishlist(buttonData, selectedId, "inject", varId)
            }
        } else {
            buttonData.wishlistName = matchFound ? ["wfNotMulti"] : ["favourites"];
            await checkCounterData(selectedId, !matchFound ? "add" : "remove")
            injectButtonAddedRemoveWishlist(selectedId, matchFound ? false : true)
            saveMainData(buttonData, selectedId, "inject");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function injectButtonAddedRemoveWishlist(selectedId, matchingOrNot) {
    const addToWishlistData = await renderButtonAddToWishlist(selectedId, isCountValid);
    const alreadyAddedToWishlistData = await renderButtonAddedToWishlist(selectedId, isCountValid);
    const proHandle = injectCoderr.getAttribute("data-product-handle");
    const proId = injectCoderr.getAttribute("data-product-id");
    let updateWishlistButton = document.createElement("div");
    const getIdOfInjectWish = document.getElementById("inject_wish_button");
    if (Number(selectedId) === Number(proId)) {
        updateWishlistButton.innerHTML = matchingOrNot
            ? `<div class="button-collection">${alreadyAddedToWishlistData}</div>`
            : `<div class="button-collection">${addToWishlistData}</div>`;
        getIdOfInjectWish && (getIdOfInjectWish.innerHTML = updateWishlistButton.innerHTML);
        matchingOrNot ? renderBorder("added", isCountValid) : renderBorder("removed", isCountValid);
    }
}

function renderWidth(isCountValid) {
    if (customButton?.type !== "icon") {
        return "100%";
    }
    return isCountValid ? "max-content" : "40px";
}

async function getProductData(handle) {
    try {
        const buttonResponseData = await fetch(`${wfGetDomain}products/${handle}.js`);
        const buttonJsonData = await buttonResponseData.json();
        const variantData = buttonJsonData.variants;
        let productPrice = null;
        const urlNew = new URL(location.href).searchParams.get("variant");
        let varriantId = "";
        // if (urlNew != null) {
        if (urlNew && urlNew.trim() !== "") {
            varriantId = JSON.parse(urlNew);
        }
        let variant_img = "";
        variantData.map((data) => {
            if (data.id === parseInt(urlNew)) {
                productPrice = Number(data.price) / 100;
                if (data.featured_image === null) {
                    variant_img = buttonJsonData.images[0];
                } else {
                    variant_img = data?.featured_image.src;
                }
            } else if (urlNew == null) {
                productPrice = Number(data.price) / 100;
                if (variantData[0]) {
                    if (data.featured_image === null) {
                        variant_img = buttonJsonData.images[0];
                    } else {
                        variant_img = data?.featured_image.src;
                    }
                }
            }
        });
        return { productPrice, varriantId, variant_img, buttonJsonData };
    } catch (error) {
        console.log(error);
        // return { productPrice: null, varriantId: "", variant_img: "", buttonJsonData: null }; // <-- return default object
    }
}

async function getCountData(productId) {
    const getCurrentLogin = await getCurrentLoginFxn();
    try {
        const userData = await fetch(`${serverURL}/get-product-count-data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                productId: productId,
                shopName: permanentDomain,
                customerEmail: getCurrentLogin,
                currentToken: getAccessTokenFromCookie(),
                // currentToken: localStorage.getItem("access-token"),
            }),
        })
        let result = await userData.json();
        return result.data
    } catch (error) {
        console.log("errr ", error);
    }
}

async function getCountOfProduct(id) {
    const productCountData = await getCountData(id);
    return onlyTextButton
        ? productCountData
        : `<div class="wf-product-count">${productCountData}</div>`;
}

async function isCountOrNot(proId, isCountValid) {
    if (isCountValid) {
        return await getCountOfProduct(proId);
    } else {
        return "";
    }
}

function onWishlistRender() {
    const tostNotificationDiv = document.createElement("div");
    tostNotificationDiv.className = "wf-toast-notification";
    tostNotificationDiv.id = "notificationDiv";
    tostNotificationDiv.style.display = "none";
    document.body.appendChild(tostNotificationDiv);
    const addWshistListButton = document.querySelector("#wishlist");
    if (generalSetting.notificationTypeOption === "text-above") {
        let newElement = document.createElement("div");
        newElement.className = "wf-text-notification-above";
        newElement.style.display = "none";
        if (addWshistListButton) {
            addWshistListButton.parentElement.insertBefore(newElement, addWshistListButton);
        }
    }
    if (generalSetting.notificationTypeOption === "text-below") {
        let newElement = document.createElement("div");
        newElement.className = "wf-text-notification-below";
        newElement.style.display = "none";
        if (addWshistListButton) {
            addWshistListButton.parentNode.insertBefore(newElement, addWshistListButton.nextSibling);
        }
    }
    if (document.querySelectorAll(".wf-wishlist").length > 0) {
        wishlistIconValue = document.querySelectorAll(".wf-wishlist");
    }
    if (document.querySelectorAll(".wf-wishlist-collection-icon").length > 0) {
        wishlistCollectionIconValue = document.querySelectorAll(".wf-wishlist-collection-icon");
    }
    if (document.querySelectorAll(".wf-wishlist-button").length > 0) {
        wishlistBtnValue = document.querySelectorAll(".wf-wishlist-button");
    }
}

function headerIconStyle() {
    let heartIconsCSS = document.querySelectorAll(".red-heart");
    if (heartIconsCSS.length > 0) {
        heartIconsCSS.forEach((heartIconCSS) => {
            if (permanentDomain !== "interjeroakcentai.myshopify.com") {
                heartIconCSS.style.filter = generalSetting.heartIconFilter;
            }
            heartIconCSS.style.height = `${generalSetting.heartIconWidth}px`;
            heartIconCSS.style.width = `${generalSetting.heartIconWidth}px`;
        });
    }
}

function showWishlistBydefault() {
    let params = new URL(document.location).searchParams;
    let showType = params.get("showtype");
    if (showType === "getdisplaytype") {
        heartButtonHandle();
    }
}

function checkIconPostion() {
    const positionMap = {
        "icon-top-left": { class: "wg-icon-top-left" },
        "icon-bottom-left": { class: "wg-icon-bottom-left", height: "30" },
        "icon-top-right": { class: "wg-icon-top-right" },
        "icon-bottom-right": { class: "wg-icon-bottom-right", height: "30" },
    };
    const iconMap = {
        heart: {
            heartBlank: "wg-heart-icon-blank",
            heartSolid: "wg-heart-icon-solid",
            heartOutlineSolid: "wg-heart-icon-outline-solid",
            heartOutlineBlank: "wg-heart-icon-outline-blank",
            comboHeart: ["wg-heart-icon-blank", "wg-heart-icon-solid"],
        },
        star: {
            starBlank: "wg-star-icon-blank",
            starSolid: "wg-star-icon-solid",
            starOutlineSolid: "wg-star-icon-outline-solid",
            starOutlineBlank: "wg-star-icon-outline-blank",
            comboStar: ["wg-star-icon-blank", "wg-star-icon-solid"],
        },
        save: {
            saveBlank: "wg-save-icon-blank",
            saveSolid: "wg-save-icon-solid",
            saveOutlineSolid: "wg-save-icon-outline-solid",
            saveOutlineBlank: "wg-save-icon-outline-blank",
            comboSave: ["wg-save-icon-blank", "wg-save-icon-solid"],
        },
    };
    const pos = positionMap[collectionBtnSetting.iconPosition] || {};
    const iconDef =
        iconMap[customButton.iconType]?.[collectionBtnSetting.collectionIconType] || "";
    let iconStyle = "";
    let iconStyle2 = "";
    if (Array.isArray(iconDef)) {
        [iconStyle, iconStyle2] = iconDef;
    } else {
        iconStyle = iconDef;
    }
    const checkClassExist =
        pos.class === "wg-icon-bottom-left" || pos.class === "wg-icon-bottom-right";
    return {
        iconPosition: pos.class || "",
        iconStyle,
        iconHeight: pos.height || "",
        checkClassExist,
        iconStyle2,
    };
}

async function quickViewFxn() {
    let getMainDiv = document.querySelectorAll(".wf-wishlist-quick-view");
    for (let wf = 0; wf < getMainDiv.length; wf++) {
        let buttonStyle = getMainDiv[0].getAttribute("data-style");
        var addWishlistIcon = document.createElement("div");
        addWishlistIcon.style.zIndex = "10";
        addWishlistIcon.style.position = "relative";
        let selectedId = getMainDiv[wf].getAttribute("data-productid");
        let wishlistData = await getDataFromSql();
        if (wishlistData.length > 0) {
            const found = wishlistData.find(
                (element) => element.product_id == selectedId
            );
            if (found) {
                buttonStyle === "icon"
                    ? (addWishlistIcon.innerHTML = `<div onClick="buttonClick(${selectedId}, ${wf}, 'one')" class="icon-collection ${customButton.iconType === "heart" && "heartICON2"
                        } ${customButton.iconType === "star" && "starICON2"} ${customButton.iconType === "save" && "saveICON2"
                        } " ><span class="span-hearticon"></span></div>`)
                    : (addWishlistIcon.innerHTML = `<div onClick="buttonClick(${selectedId}, ${wf}, 'one')" class="button-collection" style="background-color: ${customButton.bgColor}; color: ${customButton.textColor}" >${customLanguage.addedToWishlist}</div>`);
            } else {
                buttonStyle === "icon"
                    ? (addWishlistIcon.innerHTML = `<div onClick="buttonClick(${selectedId}, ${wf}, 'one')" class="icon-collection ${customButton.iconType === "heart" && "heartICON"
                        } ${customButton.iconType === "star" && "starICON"} ${customButton.iconType === "save" && "saveICON"
                        }" ><span class="span-hearticon"></span></div>`)
                    : (addWishlistIcon.innerHTML = `<div onClick="buttonClick(${selectedId}, ${wf}, 'one')" class="button-collection" style="background-color: ${customButton.bgColor}; color: ${customButton.textColor}" >${customLanguage.addToWishlist}</div>`);
            }
        } else {
            buttonStyle === "icon"
                ? (addWishlistIcon.innerHTML = `<div onClick="buttonClick(${selectedId}, ${wf}, 'one')" class="icon-collection ${customButton.iconType === "heart" && "heartICON"
                    } ${customButton.iconType === "star" && "starICON"} ${customButton.iconType === "save" && "saveICON"
                    } " ><span class="span-hearticon"></span></div>`)
                : (addWishlistIcon.innerHTML = `<div onClick="buttonClick(${selectedId}, ${wf}, 'one')" class="button-collection" style="background-color: ${customButton.bgColor}; color: ${customButton.textColor}" >${customLanguage.addToWishlist}</div>`);
        }
        getMainDiv[wf].innerHTML = addWishlistIcon.innerHTML;
    }
}

var quickViewButton = document.querySelectorAll(".quick-add__submit");
for (var wf = 0; wf < quickViewButton.length; wf++) {
    quickViewButton[wf].addEventListener("click", () => {
        setTimeout(() => {
            quickViewFxn();
        }, [1000]);
    });
}

async function getCurrentLoginFxn() {
    let currentEmail;
    if (
        getCustomerEmailFromCookie() !== null &&
        getCustomerEmailFromCookie() !== ""
    ) {
        currentEmail = getCustomerEmailFromCookie();
        // localStorage.setItem("access-token", "");
    } else if (
        customerEmail !== "" &&
        getCustomerEmailFromCookie() !== customerEmail
    ) {
        currentEmail = customerEmail;
        // localStorage.setItem("access-token", "");
    } else {
        currentEmail = "";
    }
    return currentEmail;
}

function isInPartialDomain(url, partialDomain) {
    const escapedPartialDomain = partialDomain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`^(https?:\\/\\/)?(www\\.)?.*${escapedPartialDomain}.*$`, "i");
    return regex.test(url);
}

async function checkCustomCodeProduct() {
    const getAllWishlistDiv = document.querySelectorAll(".wf-wishlist");
    const allHandler = Array.from(getAllWishlistDiv, (wishlistDiv) =>
        wishlistDiv.getAttribute("product-id")
    ).filter(Boolean);
    const finalStoredData = parseInt(checkAllProduct.getAttribute("data-aj"));
    if (parseInt(finalStoredData) !== allHandler.length) {
        checkAllProduct.setAttribute("data-aj", allHandler.length);
        checkAllProduct.setAttribute(
            "data-product-handle",
            JSON.stringify(allHandler)
        );
    } else {
        let checkProductHandle = JSON.parse(
            checkAllProduct.getAttribute("data-product-handle")
        );
        const checkDataExist = await checkIdIncluded(
            checkProductHandle,
            allHandler
        );
        if (!checkDataExist) {
            checkAllProduct.setAttribute("data-aj", allHandler.length);
            checkAllProduct.setAttribute(
                "data-product-handle",
                JSON.stringify(allHandler)
            );
        } else {
            const wfWishlist = document.querySelectorAll(".icon-collection");
            if (wfWishlist.length === 0 && allHandler.length !== 0) {
                checkAllProduct.setAttribute("data-aj", "0");
                checkAllProduct.setAttribute("data-product-handle", []);
                checkAllProduct.setAttribute("data-aj", allHandler.length);
                checkAllProduct.setAttribute(
                    "data-product-handle",
                    JSON.stringify(allHandler)
                );
            }
        }
    }
}

async function checkCustomCodeButton() {
    const getAllWishlistDiv = document.querySelectorAll(".wf-wishlist-button");
    const allHandler = Array.from(getAllWishlistDiv, (wishlistDiv) =>
        wishlistDiv.getAttribute("product-id")
    ).filter(Boolean);
    if (checkButtonProduct) {
        const finalStoredData = parseInt(checkButtonProduct.getAttribute("data-aj"));
        if (finalStoredData !== allHandler.length) {
            checkButtonProduct.setAttribute("data-aj", allHandler.length);
            checkButtonProduct.setAttribute("data-product-handle", JSON.stringify(allHandler));
        } else {
            let checkProductHandle = JSON.parse(
                checkButtonProduct.getAttribute("data-product-handle")
            );
            const checkDataExist = await checkIdIncluded(
                checkProductHandle,
                allHandler
            );
            if (!checkDataExist) {
                checkButtonProduct.setAttribute("data-aj", allHandler.length);
                checkButtonProduct.setAttribute(
                    "data-product-handle",
                    JSON.stringify(allHandler)
                );
            } else {
                const wfButtonWishlist = document.querySelectorAll(".button-collection");
                if (wfButtonWishlist.length === 0 && allHandler.length !== 0) {
                    checkButtonProduct.setAttribute("data-aj", "0");
                    checkButtonProduct.setAttribute("data-product-handle", []);
                    checkButtonProduct.setAttribute("data-aj", allHandler.length);
                    checkButtonProduct.setAttribute(
                        "data-product-handle",
                        JSON.stringify(allHandler)
                    );
                }
            }
        }
    }
}

function checkIdIncluded(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    const idsSet = new Set(arr2.map((obj) => obj.id));
    for (let wf = 0; wf < arr1.length; wf++) {
        if (!idsSet.has(arr1[wf].id)) {
            return false;
        }
    }
    return true;
}

async function getSharedWishlistData(userId) {
    // console.log("userId ---- ", userId)
    try {
        const userData = await fetch(`${serverURL}/get-shared-wishlist`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // "wg-api-key": getWgApiKey(),
                "wg-user-id": userId
            },
            body: JSON.stringify({
                shopName: permanentDomain,
                // customerEmail: userId,
                shopDomain: shopDomain,
            }),
        });
        let result = await userData.json();
        // console.log("result ----- = ", result)
        if (result.msg === "get_shared_wishlist") {
            let allData = result.data;
            return allData;
        } else {
            document.querySelector(".show-shared-wishlist").innerHTML = "There is no item";
        }
    } catch (error) {
        console.log("errr ", error);
    }
}

async function showWishlistButtonType() {
    let mediaQuery;
    if (getThemeName?.themeName === "Berlin") {
        mediaQuery = window.matchMedia("(max-width: 1200px)");
    } else {
        mediaQuery = window.matchMedia("(max-width: 1024px)");
    }

    // retrieve existing local data
    let wgLocalData = JSON.parse(localStorage.getItem("wg-local-data")) || {};
    const getThemeSelector = wgLocalData?.getThemeSelector || await detechThemeName();
    // merge new data (don't overwrite existing keys unless same name)
    let getThemeDataNew = await detechThemeName();
    wgLocalData.getThemeSelector = getThemeDataNew
    // save back to localStorage
    localStorage.setItem("wg-local-data", JSON.stringify(wgLocalData));
    // let modifiedString = getThemeName?.themeName?.replace(/ /g, "_");
    let modifiedString = getThemeName?.themeName?.replace(/[ .]/g, "_");
    modifiedString = modifiedString?.toLowerCase();

    if (currentPlan >= 1) {
        if (
            generalSetting.wlbLocation3 === true &&
            generalSetting.wlbLocationSelect === "floating-heart-mid-left"
        ) {
            let heartDiv = document.getElementById("heart");
            const div = document.createElement("div");
            div.innerHTML = `<div class="wf-floating-launcher" tabindex="0" role="button" aria-haspopup="dialog" aria-controls="wishlist-dialog" aria-expanded="false"  onClick="heartButtonHandle()" onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); heartButtonHandle(); }"  style="z-indeX: 99; cursor: pointer; background-color: ${generalSetting.floatingHeartBGcolor
                }; border-radius: ${generalSetting.floatingBgShape === "circleBG" ? "50%" : "0%"
                };" id="wf-float-heart-mid-left"><div style="filter: ${generalSetting.floatingHeartIconcolor
                }"  id="heart-icon-mid-left" class="floating-heart ${customButton.iconType === "heart" && "heartICON2"
                } ${customButton.iconType === "star" && "starICON2"} ${customButton.iconType === "save" && "saveICON2"
                } "><span></span></div><span class="count-span fi-count"></span></div>`;
            heartDiv.after(div);
        } else if (
            generalSetting.wlbLocation3 === true &&
            generalSetting.wlbLocationSelect === "floating-heart-mid-right"
        ) {
            let heartDiv = document.getElementById("heart");
            const div = document.createElement("div");
            div.innerHTML = `<div class="wf-floating-launcher" tabindex="0" role="button" aria-haspopup="dialog" aria-controls="wishlist-dialog" aria-expanded="false" onClick="heartButtonHandle()" onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); heartButtonHandle(); }"  style="z-indeX: 99; cursor: pointer; background-color: ${generalSetting.floatingHeartBGcolor
                }; border-radius: ${generalSetting.floatingBgShape === "circleBG" ? "50%" : "0%"
                };" id="wf-float-heart-mid-right"><div style="filter: ${generalSetting.floatingHeartIconcolor
                }" id="heart-icon-mid-right" class="floating-heart ${customButton.iconType === "heart" && "heartICON2"
                } ${customButton.iconType === "star" && "starICON2"} ${customButton.iconType === "save" && "saveICON2"
                }" ><span> </span></div><span class="count-span fi-count"></span></div>`;
            heartDiv.after(div);
        } else if (
            generalSetting.wlbLocation3 === true &&
            generalSetting.wlbLocationSelect === "floating-heart-bottom-right"
        ) {
            let heartDiv = document.getElementById("heart");
            const div = document.createElement("div");
            div.innerHTML = `<div class="wf-floating-launcher" tabindex="0" role="button" aria-haspopup="dialog" aria-controls="wishlist-dialog" aria-expanded="false" onClick="heartButtonHandle()" onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); heartButtonHandle(); }" style="z-indeX: 99; cursor: pointer; background-color: ${generalSetting.floatingHeartBGcolor
                }; border-radius: ${generalSetting.floatingBgShape === "circleBG" ? "50%" : "0%"
                };" id="wf-float-heart-bottom-right"><div style="filter: ${generalSetting.floatingHeartIconcolor
                }" id="heart-icon-bottom-right" class="floating-heart ${customButton.iconType === "heart" && "heartICON2"
                } ${customButton.iconType === "star" && "starICON2"} ${customButton.iconType === "save" && "saveICON2"
                }" ><span> </span></div><span class="count-span fi-count"></span></div>`;
            heartDiv.after(div);
        } else if (
            generalSetting.wlbLocation3 === true &&
            generalSetting.wlbLocationSelect === "floating-heart-bottom-left"
        ) {
            let heartDiv = document.getElementById("heart");
            const div = document.createElement("div");
            div.innerHTML = `<div class="wf-floating-launcher" tabindex="0" role="button" aria-haspopup="dialog" aria-controls="wishlist-dialog" aria-expanded="false" onClick="heartButtonHandle()" onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); heartButtonHandle(); }"  style="z-indeX: 99; cursor: pointer; background-color: ${generalSetting.floatingHeartBGcolor
                }; border-radius: ${generalSetting.floatingBgShape === "circleBG" ? "50%" : "0%"
                };" id="wf-float-heart-bottom-left"><div  style="filter: ${generalSetting.floatingHeartIconcolor
                }" id="heart-icon-bottom-left" class="floating-heart ${customButton.iconType === "heart" && "heartICON2"
                } ${customButton.iconType === "star" && "starICON2"} ${customButton.iconType === "save" && "saveICON2"
                }" ><span> </span></div><span class="count-span fi-count"></span></div>`;
            heartDiv.after(div);
        }
        if (generalSetting.wlbLocation1 === true) {
            let wishlistWithIcon = `<a style="position:"relative" tabindex="0" role="button" aria-haspopup="dialog" aria-controls="wishlist-dialog" aria-expanded="false" onClick="heartButtonHandle()" onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); heartButtonHandle(); }" class="menu-drawer__menu-item list-menu__item link link--text focus-inset"><div class=" red-heart ${customButton.iconType === "star"
                ? generalSetting.headerIconType === "fillHeaderIcon"
                    ? "starICON2"
                    : generalSetting.headerIconType === "outlineHeaderIcon"
                        ? "starICON"
                        : "starICON"
                : ""
                } ${customButton.iconType === "save"
                    ? generalSetting.headerIconType === "fillHeaderIcon"
                        ? "saveICON2"
                        : generalSetting.headerIconType === "outlineHeaderIcon"
                            ? "saveICON"
                            : "saveICON"
                    : ""
                } ${customButton.iconType === "heart"
                    ? generalSetting.headerIconType === "fillHeaderIcon"
                        ? "heartICON2"
                        : generalSetting.headerIconType === "outlineHeaderIcon"
                            ? "heartICON"
                            : "heartICON"
                    : ""
                } "> <span></span></div><span style="position: absolute; top: 5px; right: 25px "class="count-span"></span>${customLanguage?.headerMenuWishlist ||
                storeFrontDefLang?.headerMenuWishlist || "Wishlist"
                }</a>`;

            let wishlistDesktopHtml = `<a tabindex="0" role="button" aria-haspopup="dialog" aria-controls="wishlist-dialog" aria-expanded="false" onClick="heartButtonHandle()" onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); heartButtonHandle(); }" class="${getThemeSelector.headerMenuItemClass
                }">${customLanguage?.headerMenuWishlist ||
                storeFrontDefLang?.headerMenuWishlist || "Wishlist"
                }</a>`;

            let wishlistMobileHtml = `<a tabindex="0" role="button" aria-haspopup="dialog" aria-controls="wishlist-dialog" aria-expanded="false" onClick="heartButtonHandle()" onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); heartButtonHandle(); }" class="${getThemeSelector.headerMenuItemMobileClass
                }">${customLanguage?.headerMenuWishlist ||
                storeFrontDefLang?.headerMenuWishlist || "Wishlist"
                }</a>`;

            function wgMenuItemFxn(mediaQuery) {
                const menuItemMobileClass = `wg-${modifiedString}-menuItem-mobile`;
                const menuItemDesktopClass = `wg-${modifiedString}-menuItem-desktop`;
                const desktopElement = document.querySelector(`.${menuItemDesktopClass}`);
                const mobileElement = document.querySelector(`.${menuItemMobileClass}`);
                let newMobileElement;
                if (typeof getThemeSelector.headerMenuItemMobileCreateElement !== "undefined" && typeof getThemeSelector.headerMenuItemMobileCreateElement !== undefined && typeof getThemeSelector.headerMenuItemMobileCreateElement !== "null" && getThemeSelector.headerMenuItemMobileCreateElement !== "") {
                    newMobileElement = document.createElement(getThemeSelector.headerMenuItemMobileCreateElement);
                } else {
                    newMobileElement = document.createElement("li");
                }
                newMobileElement.className = `${menuItemMobileClass} ${getThemeSelector.headerMenuMobileElementClass}`;
                if (desktopElement) {
                    const computedStyle = window.getComputedStyle(desktopElement);
                    const displayValue = computedStyle.getPropertyValue("display");
                    if (getThemeName?.themeName === "Showcase" || getThemeName?.themeName === "Ella" || getThemeName?.themeName === "Vendy Shopping") {
                        if (displayValue === "none") {
                            desktopElement.style.display = "inline-block";
                        }
                    } else {
                        if (displayValue === "none") {
                            desktopElement.style.display = "block";
                        }
                    }
                }
                if (
                    !document.querySelector(`.${menuItemDesktopClass}`) &&
                    getThemeSelector.headerMenuItem.trim() !== ""
                ) {
                    let menuItemMainElement = document.querySelector(
                        getThemeSelector.headerMenuItem
                    );
                    if (menuItemMainElement) {
                        let newCreateDekstopElement;
                        if (
                            typeof getThemeSelector.headerMenuItemCreateElement !==
                            "undefined" &&
                            getThemeSelector.headerMenuItemCreateElement !== undefined &&
                            typeof getThemeSelector.headerMenuItemCreateElement !== "null" &&
                            getThemeSelector.headerMenuItemCreateElement !== ""
                        ) {
                            newCreateDekstopElement = document.createElement(
                                getThemeSelector.headerMenuItemCreateElement
                            );
                        } else {
                            newCreateDekstopElement = document.createElement("li");
                        }
                        newCreateDekstopElement.className = `${menuItemDesktopClass} ${getThemeSelector.headerMenuElementClass}`;
                        newCreateDekstopElement.innerHTML = wishlistDesktopHtml;
                        if (getThemeSelector.headerMenuElementInsertAfter) {
                            menuItemMainElement.after(newCreateDekstopElement);
                        } else {
                            menuItemMainElement.appendChild(newCreateDekstopElement);
                        }
                    }
                }
                if (mediaQuery.matches) {
                    if (mobileElement) {
                        const computedStyle = window.getComputedStyle(mobileElement);
                        const displayValue = computedStyle.getPropertyValue("display");
                        if (displayValue === "none") {
                            mobileElement.style.display = "block";
                        }
                    }
                    if (
                        getThemeSelector.headerMenuItemMobile !== "" &&
                        !document.querySelector(`.${menuItemMobileClass}`)
                    ) {
                        const element = document.querySelector(`.${menuItemDesktopClass}`);
                        if (element) {
                            element.style.display = "none";
                        }
                        var mainMobileSelector = document.querySelector(
                            getThemeSelector.headerMenuItemMobile
                        );
                        if (mainMobileSelector) {
                            newMobileElement.innerHTML =
                                getThemeName?.themeName === "Ella" ||
                                    getThemeName?.themeName === "Vendy Shopping"
                                    ? wishlistWithIcon
                                    : wishlistMobileHtml;
                            if (getThemeSelector.headerMenuMobileInsertAfter) {
                                mainMobileSelector.after(newMobileElement);
                            } else {
                                mainMobileSelector.appendChild(newMobileElement);
                            }
                        }
                    }

                    if (permanentDomain === "luxapolish.myshopify.com") {
                        let targetDiv = document.querySelectorAll('.wg-prestige-headerIcon-mobile');
                        if (targetDiv.length > 0) {
                            targetDiv.forEach((element, index) => {
                                if (index > 0) {
                                    element.remove();
                                }
                            });
                            let appendToDiv = document.querySelector('.localization-selectors');
                            if (appendToDiv) {
                                appendToDiv.insertAdjacentElement('afterend', targetDiv[0]);
                            }
                        }
                    }
                }
            }
            mediaQuery.addEventListener("change", wgMenuItemFxn);
            wgMenuItemFxn(mediaQuery);
            if (permanentDomain === "luxapolish.myshopify.com") {
                let targetDiv = document.querySelectorAll('.wg-prestige-headerIcon-mobile');
                if (targetDiv.length > 0) {
                    targetDiv.forEach((element, index) => {
                        if (index > 0) {
                            element.remove();
                        }
                    });
                    let appendToDiv = document.querySelector('.localization-selectors');
                    if (appendToDiv) {
                        appendToDiv.insertAdjacentElement('afterend', targetDiv[0]);
                    }
                }
            }
        }
        if (generalSetting.wlbLocation2 === true) {
            if (getThemeName?.themeName === "Local") {
                var elements = document.querySelectorAll(
                    ".header-actions:not(:empty).header-actions--show-search"
                );
                let mobileHeader = document.querySelector(
                    `.wg-local-headerIcon-mobile`
                );
                if (mobileHeader) {
                    mobileHeader.style.order = "2";
                }
                elements.forEach(function (element) {
                    element.style.alignItems = "center";
                });
            } else if (getThemeName?.themeName === "Combine") {
                const checkcombineele = document.querySelector(
                    ".header__top .area--cart"
                );
                checkcombineele.style.gridArea = "inherit";
            }

            function headerIconFxn(mediaQuery) {
                const headerIconDesktopClass = `wg-${modifiedString}-headerIcon-desktop`;
                const headerIconMobileClass = `wg-${modifiedString}-headerIcon-mobile`;
                const iconAppend = `<div tabindex="0" role="button" aria-haspopup="dialog" aria-controls="wishlist-dialog" aria-expanded="false" onClick="heartButtonHandle()" onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); heartButtonHandle(); }" class="header-heart-position ${getThemeSelector.headerHeartIconMobileClass
                    }" > <div class="red-heart  ${customButton.iconType === "star"
                        ? generalSetting.headerIconType === "fillHeaderIcon"
                            ? "starICON2"
                            : generalSetting.headerIconType === "outlineHeaderIcon"
                                ? "starICON"
                                : "starICON"
                        : ""
                    } ${customButton.iconType === "save"
                        ? generalSetting.headerIconType === "fillHeaderIcon"
                            ? "saveICON2"
                            : generalSetting.headerIconType === "outlineHeaderIcon"
                                ? "saveICON"
                                : "saveICON"
                        : ""
                    } ${customButton.iconType === "heart"
                        ? generalSetting.headerIconType === "fillHeaderIcon"
                            ? "heartICON2"
                            : generalSetting.headerIconType === "outlineHeaderIcon"
                                ? "heartICON"
                                : "heartICON"
                        : ""
                    } "  ><span></span> </div>   <span class="count-span"> </span> </div>`;
                const element = document.querySelector(`.${headerIconDesktopClass}`);
                if (element) {
                    const computedStyle = window.getComputedStyle(element);
                    const displayValue = computedStyle.getPropertyValue("display");
                    if (displayValue === "none") {
                        element.style.display = "block";
                    }
                }
                let mobileHeader = document.querySelector(`.${headerIconMobileClass}`);
                if (mobileHeader) {
                    mobileHeader.style.display = "none";
                }

                if (getThemeSelector.headerHeartElementInsertAfter) {
                    if (!document.querySelector(`.${headerIconDesktopClass}`)) {
                        let headerMainIconElement = document.querySelector(
                            getThemeSelector.headerHeartIcon
                        );
                        if (headerMainIconElement) {
                            let createNewElementDiv;
                            if (
                                typeof getThemeSelector.headerHeartIconCreateElement !==
                                "undefined" &&
                                typeof getThemeSelector.headerHeartIconCreateElement !==
                                "null" &&
                                getThemeSelector.headerHeartIconCreateElement !== undefined &&
                                getThemeSelector.headerHeartIconCreateElement !== ""
                            ) {
                                createNewElementDiv = document.createElement(
                                    getThemeSelector.headerHeartIconCreateElement
                                );
                            } else {
                                createNewElementDiv = document.createElement("div");
                            }
                            createNewElementDiv.className = `${headerIconDesktopClass} ${getThemeSelector.headerHeartElementClass} `;
                            createNewElementDiv.innerHTML = iconAppend;
                            // headerMainIconElement.after(createNewElementDiv);

                            if (generalSetting?.headerIconPosition === "right" && getThemeSelector?.cart !== "") {
                                let insertRightafterCart = document.querySelector(getThemeSelector?.cart);
                                insertRightafterCart?.after(createNewElementDiv);
                            } else if (generalSetting?.headerIconPosition === "left" && getThemeSelector?.cart !== "") {



                                // if (getThemeName.themeName === "Boost") {
                                //     let insertBeforeCartElements = document.querySelectorAll(getThemeSelector?.cart);
                                //     insertBeforeCartElements.forEach(insertBeforeCart => {
                                //         insertBeforeCart.before(createNewElementDiv.cloneNode(true));
                                //     });
                                // } else {
                                let insertBeforeCart = document.querySelector(getThemeSelector?.cart);
                                insertBeforeCart?.before(createNewElementDiv);
                                // }

                            } else {
                                headerMainIconElement?.after(createNewElementDiv);
                            }

                        }
                    }
                } else {
                    if (
                        !document.querySelector(`.${headerIconDesktopClass}`) &&
                        getThemeSelector.headerHeartIcon !== ""
                    ) {
                        let headerMainIconElement = document.querySelector(
                            getThemeSelector.headerHeartIcon
                        );

                        if (headerMainIconElement) {
                            let createNewElementDiv;
                            if (
                                typeof getThemeSelector.headerHeartIconCreateElement !==
                                "undefined" &&
                                typeof getThemeSelector.headerHeartIconCreateElement !==
                                "null" &&
                                typeof getThemeSelector.headerHeartIconCreateElement !==
                                undefined &&
                                getThemeSelector.headerHeartIconCreateElement !== ""
                            ) {
                                createNewElementDiv = document.createElement(
                                    getThemeSelector.headerHeartIconCreateElement
                                );
                            } else {
                                createNewElementDiv = document.createElement("div");
                            }
                            createNewElementDiv.className = `${headerIconDesktopClass} ${getThemeSelector.headerHeartElementClass}`;
                            createNewElementDiv.innerHTML = iconAppend;

                            // headerMainIconElement.appendChild(createNewElementDiv);
                            if (generalSetting?.headerIconPosition === "right" && getThemeSelector?.cart !== "") {
                                // let insertRightafterCart = document.querySelector(getThemeSelector?.cart);
                                // insertRightafterCart?.after(createNewElementDiv);

                                const insertRightafterCartList = document.querySelectorAll(getThemeSelector?.cart);
                                insertRightafterCartList.forEach((element) => {
                                    element.after(createNewElementDiv.cloneNode(true));
                                });

                            } else if (generalSetting?.headerIconPosition === "left" && getThemeSelector?.cart !== "") {


                                // if (getThemeName.themeName === "Boost") {
                                //     let insertBeforeCartElements = document.querySelectorAll(getThemeSelector?.cart);
                                //     insertBeforeCartElements.forEach(insertBeforeCart => {
                                //         insertBeforeCart.before(createNewElementDiv.cloneNode(true));
                                //     });
                                // } else {

                                let insertBeforeCart = document.querySelector(getThemeSelector?.cart);
                                insertBeforeCart?.before(createNewElementDiv);
                                // }

                            } else {
                                headerMainIconElement?.appendChild(createNewElementDiv);
                            }

                        }
                    }
                }
                if (mediaQuery.matches) {
                    let mobileHeader = document.querySelector(
                        `.${headerIconMobileClass}`
                    );
                    if (mobileHeader) {
                        mobileHeader.style.display = "block";
                    }
                    if (
                        getThemeSelector.headerHeartIconMobile &&
                        !document.querySelector(`.${headerIconMobileClass}`)
                    ) {
                        const className = headerIconDesktopClass;
                        const element = document.querySelector(
                            `.${headerIconDesktopClass}`
                        );
                        if (element) {
                            element.style.display = "none";
                        }
                        let getSelector = document.querySelector(
                            getThemeSelector.headerHeartIconMobile
                        );
                        let createNewElementDiv;
                        if (
                            typeof getThemeSelector.headerHeartIconMobileCreateElement !==
                            "undefined" &&
                            typeof getThemeSelector.headerHeartIconMobileCreateElement !==
                            "null" &&
                            getThemeSelector.headerHeartIconMobileCreateElement !==
                            undefined &&
                            getThemeSelector.headerHeartIconMobileCreateElement !== ""
                        ) {
                            createNewElementDiv = document.createElement(
                                getThemeSelector.headerHeartIconMobileCreateElement
                            );
                        } else {
                            createNewElementDiv = document.createElement("div");
                        }
                        createNewElementDiv.className = `${headerIconMobileClass} ${getThemeSelector.headerHeartMobileElementClass}`;
                        createNewElementDiv.innerHTML = iconAppend;
                        if (getThemeSelector.headerHeartMobileInsertAfter) {
                            // getSelector.after(createNewElementDiv);
                            if (generalSetting?.headerIconPosition === "right" && getThemeSelector?.cartMobile !== "") {
                                let insertRightafterCart = document.querySelector(getThemeSelector?.cartMobile);
                                insertRightafterCart?.after(createNewElementDiv);
                            } else if (generalSetting?.headerIconPosition === "left" && getThemeSelector?.cartMobile !== "") {

                                let insertBeforeCart = document.querySelector(getThemeSelector?.cartMobile);
                                insertBeforeCart?.before(createNewElementDiv);


                            } else {
                                getSelector?.after(createNewElementDiv);
                            }

                        } else {
                            // getSelector.appendChild(createNewElementDiv);
                            if (generalSetting?.headerIconPosition === "right" && getThemeSelector?.cartMobile !== "") {
                                let insertRightafterCart = document.querySelector(getThemeSelector?.cartMobile);
                                insertRightafterCart?.after(createNewElementDiv);
                            } else if (generalSetting?.headerIconPosition === "left" && getThemeSelector?.cartMobile !== "") {
                                let insertBeforeCart = document.querySelector(getThemeSelector?.cartMobile);
                                insertBeforeCart?.before(createNewElementDiv);


                            } else {
                                getSelector?.appendChild(createNewElementDiv);
                            }

                        }
                    }
                    if (permanentDomain === "luxapolish.myshopify.com") {
                        let targetDiv = document.querySelectorAll('.wg-prestige-headerIcon-desktop');
                        if (targetDiv.length > 0) {
                            targetDiv.forEach((element, index) => {
                                if (index > 0) {
                                    element.remove();
                                }
                            });
                            let appendToDiv = document.querySelector('.localization-selectors');
                            if (appendToDiv) {
                                appendToDiv.insertAdjacentElement('afterend', targetDiv[0]);
                            }
                        }
                    }
                }
                headerIconStyle();
            }
            headerIconStyle();
            mediaQuery.addEventListener("change", headerIconFxn);
            headerIconFxn(mediaQuery);
            if (permanentDomain === "luxapolish.myshopify.com") {
                let targetDiv = document.querySelectorAll('.wg-prestige-headerIcon-desktop');
                if (targetDiv.length > 0) {
                    targetDiv.forEach((element, index) => {
                        if (index > 0) {
                            element.remove();
                        }
                    });
                    let appendToDiv = document.querySelector('.localization-selectors');
                    if (appendToDiv) {
                        appendToDiv.insertAdjacentElement('afterend', targetDiv[0]);
                    }
                }
            }
        }


        if (currentPlan > 1) {
            if (generalSetting.paidWlbLocation === "yes") {
                // let getCustomDiv = document.querySelector(".custom-wishlist-icon");
                const customDivs = document.querySelectorAll(".custom-wishlist-icon");
                customDivs.forEach((getCustomDiv) => {
                    // if (getCustomDiv !== null) {
                    if (getCustomDiv && getCustomDiv.innerHTML.trim() === "") {

                        let iconType = getCustomDiv.getAttribute("wishlist-type");
                        // console.log("hhhh ... ", iconType)
                        if (iconType === "text") {
                            getCustomDiv.innerHTML = `<a tabindex="0" role="button" aria-haspopup="dialog" aria-controls="wishlist-dialog" aria-expanded="false" onClick="heartButtonHandle()" onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); heartButtonHandle(); }" >${customLanguage?.headerMenuWishlist || storeFrontDefLang?.headerMenuWishlist || "Wishlist"}</a>`
                        } else {
                            getCustomDiv.innerHTML = `<div tabindex="0" role="button" aria-haspopup="dialog" aria-controls="wishlist-dialog" aria-expanded="false" onClick="heartButtonHandle()" onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); heartButtonHandle(); }" class="header-heart-position ${getThemeSelector.headerHeartIconMobileClass
                                }" > <div class="red-heart  ${customButton.iconType === "star"
                                    ? generalSetting.headerIconType === "fillHeaderIcon"
                                        ? "starICON2"
                                        : generalSetting.headerIconType === "outlineHeaderIcon"
                                            ? "starICON"
                                            : "starICON"
                                    : ""
                                } ${customButton.iconType === "save"
                                    ? generalSetting.headerIconType === "fillHeaderIcon"
                                        ? "saveICON2"
                                        : generalSetting.headerIconType === "outlineHeaderIcon"
                                            ? "saveICON"
                                            : "saveICON"
                                    : ""
                                } ${customButton.iconType === "heart"
                                    ? generalSetting.headerIconType === "fillHeaderIcon"
                                        ? "heartICON2"
                                        : generalSetting.headerIconType === "outlineHeaderIcon"
                                            ? "heartICON"
                                            : "heartICON"
                                    : ""
                                } "  ><span></span> </div>   <span class="count-span"> </span> </div>`;
                        }
                    }
                })
            }
        }
        headerIconStyle();
    }
}

function showCustomHeaderIcon1() {
    const wgLocalData = JSON.parse(localStorage.getItem("wg-local-data")) || {};
    const getThemeSelector = wgLocalData?.getThemeSelector;
    if (generalSetting.paidWlbLocation === "yes") {
        // const getCustomDiv = document.querySelector(".custom-wishlist-icon");
        const customDivs = document.querySelectorAll(".custom-wishlist-icon");
        customDivs.forEach((getCustomDiv) => {
            if (getCustomDiv) {
                // If already rendered, just exit (avoid duplicate injection)
                if (getCustomDiv.querySelector(".header-heart-position")) {
                    return;
                }
                // Wrapper div
                const wrapper = document.createElement("div");
                wrapper.tabIndex = 0;
                wrapper.role = "button";
                wrapper.setAttribute("aria-haspopup", "dialog");
                wrapper.setAttribute("aria-controls", "wishlist-dialog");
                wrapper.setAttribute("aria-expanded", "false");
                wrapper.className = `header-heart-position ${getThemeSelector?.headerHeartIconMobileClass || ""}`;
                wrapper.onclick = heartButtonHandle;
                wrapper.onkeydown = (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        heartButtonHandle();
                    }
                };
                // Icon div
                const iconDiv = document.createElement("div");
                iconDiv.classList.add("red-heart");
                if (customButton.iconType === "star") {
                    iconDiv.classList.add(
                        generalSetting.headerIconType === "fillHeaderIcon" ? "starICON2" : "starICON"
                    );
                } else if (customButton.iconType === "save") {
                    iconDiv.classList.add(
                        generalSetting.headerIconType === "fillHeaderIcon" ? "saveICON2" : "saveICON"
                    );
                } else if (customButton.iconType === "heart") {
                    iconDiv.classList.add(
                        generalSetting.headerIconType === "fillHeaderIcon" ? "heartICON2" : "heartICON"
                    );
                }
                const spanInner = document.createElement("span");
                iconDiv.appendChild(spanInner);

                const countSpan = document.createElement("span");
                countSpan.className = "count-span";

                wrapper.appendChild(iconDiv);
                wrapper.appendChild(countSpan);

                // Replace children instantly without emptying
                getCustomDiv.replaceChildren(wrapper);
            }
        })
    }
}

async function handleSearchData(event) {
    const searchValue = event.target.value.trim().toLowerCase();
    const wishlistItems = document.querySelectorAll(".wishlist-grid1");
    let matchCount = 0;
    wishlistItems.forEach((item) => {
        const title = item.querySelector(".title11 a")?.textContent.toLowerCase() || "";
        const price = item.querySelector(".product-option-price")?.textContent.toLowerCase() || "";
        const variant = item.querySelector(".product-selected-variants")?.textContent.toLowerCase() || "";
        const isMatch = title.includes(searchValue) || price.includes(searchValue) || variant.includes(searchValue);
        if (isMatch || searchValue === "") {
            // item.style.display = "block";
            item.style.display = "flex";
            matchCount++;
        } else {
            item.style.display = "none";
        }
    });
    if (matchCount === 0) {
        document.querySelector(".wishlist-modal-all").style.display = "none";
        document.querySelector(".modal-button-div").style.display = "none";
        document.querySelector(".wg-no-match-found").style.display = "block";
        document.querySelector(".wg-no-match-found").innerHTML = `<h4 class="drawer-cart-empty">${customLanguage.noFoundSearchText}</h4>`;
        document.querySelector(".grid-option").style.pointerEvents = "none";
    } else {
        document.querySelector(".wishlist-modal-all").style.display = "grid";
        document.querySelector(".modal-button-div").style.display = "block";
        document.querySelector(".wg-no-match-found").style.display = "none";
        document.querySelector(".wg-no-match-found").innerHTML = "";
        document.querySelector(".grid-option").style.pointerEvents = "auto";
    }
}

async function gridFxn(count) {
    document.querySelectorAll(".wf-active-grid-focus").forEach(gridElement => { gridElement.classList.remove("wf-active-grid-focus") });
    document.querySelectorAll(`.grid${count}`).forEach(gridElement => { gridElement.classList.add("wf-active-grid-focus") });
    localStorage.setItem("grid-count", count);
    let addNewClass;
    switch (count) {
        case "1":
            addNewClass = "wishlist-modal-1";
            break;
        case "2":
            addNewClass = "wishlist-modal-2";
            break;
        case "3":
            addNewClass = "wishlist-modal-3";
            break;
        default:
            addNewClass = "wishlist-modal-4";
    }
    // document.querySelectorAll(".wishlist-modal-box").forEach(card => {
    //     card.className = "wishlist-modal-box";
    //     card.classList.add(addNewClass);
    // });

    document.querySelectorAll(".wishlist-modal-box").forEach(card => {
        const shouldPreserve = card.classList.contains("wf-empty-multiwishlist");
        card.className = "wishlist-modal-box";
        if (shouldPreserve) {
            card.classList.add("wf-empty-multiwishlist");
        }
        card.classList.add(addNewClass);
    });

    gridStyleFxn();

}

const showCountAll = async () => {
    const [list, multiData] = await Promise.all([
        getDataFromSql(),
        isMultiwishlistTrue && getMultiwishlistData("")
    ]);
    multiArray = multiData
    const totalObjects = await getCount(list);

    if (generalSetting?.hideHeaderCounter === "no" || generalSetting?.hideHeaderCounter === undefined) {
        const countHtml = `<span class="show-count"><b>${totalObjects}</b></span>`;
        document.querySelectorAll(".count-span").forEach((countDiv) => {
            countDiv.innerHTML = countHtml;
        });
    }
    else if (generalSetting?.hideHeaderCounter === "hide-at-zero-only") {
        const countHtml = `<span class="show-count"><b>${totalObjects}</b></span>`;
        document.querySelectorAll(".count-span").forEach((countDiv) => {
            countDiv.innerHTML = countHtml;
            if (totalObjects === 0) {
                countDiv.classList.add("wg-hide-count");
            } else {
                countDiv.classList.remove("wg-hide-count"); // in case count > 0
            }
        });
    }

};

async function getCount(arrayData) {

    if (isMultiwishlistTrue) {
        // return totalObjects = arrayData.reduce(
        //     (count, obj) =>
        //         count + Object.values(obj).reduce((sum, arr) => sum + arr.length, 0),
        //     0
        // );

        return totalObjects = arrayData.reduce(
            (count, obj) =>
                count +
                Object.entries(obj).reduce((sum, [key, arr]) => {
                    if (key === "id") return sum; // ✅ Skip non-array like "id"
                    return sum + (Array.isArray(arr) ? arr.length : 0); // ✅ Count items only if it's an array
                }, 0),
            0
        );

    } else {
        const newArray = await findArrayByKey(arrayData, "favourites");
        return totalObjects = newArray.length;
    }
}

document.addEventListener("keyup", function (e) {
    if (e.key === "Escape") {
        modalLink.style.display = "none";
        getMultiWishlistDiv && (getMultiWishlistDiv.style.display = "none");
        checkedItems = [];
        nonCheckedItems = [];
    }
});

function handleClick(event) {
    if (event.target === modalLink) {
        if (typeof modalLink !== "undefined" && modalLink !== null) {
            modalLink.style.display = "none";
            // document.body.style.overflow = "auto";
            removeScrollFromBody();
        }
    } else if (event.target === modalWF) {
        if (typeof modalWF !== "undefined" && modalWF !== null) {
            const scrollToTop = document.querySelectorAll('.wishlist-modal-box, .wg-modal'); // Select all matching elements
            scrollToTop.forEach(element => {
                element.scrollTop = 0;
            })
            modalWF.style.display = "none";
            // document.body.style.overflow = "auto";
            removeScrollFromBody();
            removeClassFromBody();
        }
    } else if (event.target === modalDrawer) {
        if (typeof modalDrawer !== "undefined" && modalDrawer !== null) {
            modalDrawer.style.display = "none";
            // document.body.style.overflow = "auto";
            removeScrollFromBody();
        }
    } else if (event.target === shareModal) {
        if (typeof shareModal !== "undefined" && shareModal !== null) {
            shareModal.style.display = "none";
            // document.body.style.overflow = "auto";
            removeScrollFromBody();
        }
    }
    if (event.target === getMultiWishlistDiv) {
        if (
            typeof getMultiWishlistDiv !== "undefined" &&
            getMultiWishlistDiv !== null
        ) {
            getMultiWishlistDiv.style.display = "none";
            // document.body.style.overflow = "auto";
            removeScrollFromBody();
            checkedItems = [];
            nonCheckedItems = [];
        }
    }
}
document.addEventListener("click", handleClick);

function removeScrollFromBody() {
    document.body.style.overflow = "auto";
}

function removeClassFromBody() {
    if (document.body.classList.contains('wf-hide-scroll')) {
        document.body.classList.remove('wf-hide-scroll');
    }
}

function checkButton() {
    const customerEmail = getCustomerEmailFromCookie();
    if (customerEmail === null || customerEmail === "") {
        const shareModalElement = document.querySelectorAll(
            "button.shareModalById"
        );
        for (let wf = 0; wf < shareModalElement.length; wf++) {
            const shareModalCheck = shareModalElement[wf];
            shareModalCheck.disabled = true;
            shareModalCheck.style.cursor = "not-allowed";
            shareModalCheck.style.backgroundColor = "#ccc";
        }
        return true;
    } else {
        return false;
    }
}

async function drawerHandler() {
    if (shopDomain === "wishlist-guru.myshopify.com") {
        let loaderr = document.querySelectorAll(".show-title");
        for (let wf = 0; wf < loaderr.length; wf++) {
            loaderr[wf].innerHTML = `<div class="loader-css" ><span> </span></div>`;
        }
        document.querySelector(
            ".drawer-main"
        ).innerHTML = `<div class="loader-css" ><span> </span></div>`;
        document.querySelector(".sidenav").style.transform = "translateX(0%)";
        document.querySelector(".overlayy").style.height = "100vh";
        renderDrawerContentFxn();
    }
}

async function modalHandler() {
    if (shopDomain === "wishlist-guru.myshopify.com") {
        modalWF.style.display = "block";
        spanWF.onclick = function () {
            const scrollToTop = document.querySelectorAll('.wishlist-modal-box, .wg-modal'); // Select all matching elements
            scrollToTop.forEach(element => {
                element.scrollTop = 0;
            })
            modalWF.style.display = "none";
            // document.body.style.overflow = "auto";
            removeScrollFromBody();
            removeClassFromBody();
        };
        pageTypeFunction();
    }
}

function closeNav() {
    document.querySelector(".sidenav").style.transform = "translateX(100%)";
    document.querySelector(".overlayy").style.height = "0vh";

    // document.body.style.overflow = "auto";
    removeScrollFromBody();
}

function wishlistStyleFxn() {
    if (generalSetting.wishlistDisplay === "modal") {
        document.querySelector(".wg-modal-content").style.backgroundColor = generalSetting.wlBgColor;
        document.querySelector(".wg-modal-content").style.padding = `${generalSetting.wlPaddingTopBottom}${generalSetting.wlPaddingTopBottomUnit} ${generalSetting.wlPaddingLeftRight}${generalSetting.wlPaddingLeftRightUnit}`;
        // document.getElementById("main-Modal-form").classList.add(
        //     `${generalSetting.wlTextAlign === "left"
        //         ? "box-align-left"
        //         : generalSetting.wlTextAlign === "center"
        //             ? "box-align-center"
        //             : "box-align-right"
        //     }`
        // );
        document.querySelector(".wg-close").style.filter = generalSetting.wlCrossFilter;
        document.querySelector(".close1").style.filter = generalSetting.wlCrossFilter;
        document.querySelector(".closeByShareModal").style.filter = generalSetting.wlCrossFilter;
        document.querySelector(".wg-modal-content").style.color = modalDrawerTextColor;
        document.querySelector("#wg-myModal h2").style.color = modalDrawerTextColor;
        // document.querySelector("div#main-Modal-form").style.textAlign = generalSetting.wlTextAlign;
        document.querySelector(".wg-modal-content").style.maxWidth = `${generalSetting.wlWidthInput}${generalSetting.wlWidthUnit}`;
    }
    if (generalSetting.wishlistDisplay === "drawer") {
        document.querySelector(".sidenav").style.backgroundColor = generalSetting.wlBgColor;
        document.querySelector(".sidenav").style.color = modalDrawerTextColor;
        document.querySelector(".closebtn").style.filter = generalSetting.wlCrossFilter;
        document.querySelector(".close1").style.filter = generalSetting.wlCrossFilter;
        document.querySelector(".closeByShareModal").style.filter = generalSetting.wlCrossFilter;
        document.querySelector(".sidenav").style.maxWidth = `${generalSetting.wlWidthInput}${generalSetting.wlWidthUnit}`;
    }
}
wishlistStyleFxn();


function addWishlistDescription() {
    if (customLanguage?.wishlistDescription) {
        const headings = document.querySelectorAll('.modal-heading');
        headings.forEach((heading) => {
            const nextElement = heading.nextElementSibling;

            // Only add if next element doesn't already have the class
            if (!nextElement || !nextElement.classList.contains('wishlist-description-style')) {
                const newElement = document.createElement('div');
                newElement.innerHTML = customLanguage.wishlistDescription;
                newElement.className = 'wishlist-description-style';
                heading.insertAdjacentElement('afterend', newElement);
            }
        });
    }
}

async function heartButtonHandle() {
    if (currentPlan >= 1) {
        // -------adding heading text to the modal-------
        let addModalHeading = document.querySelectorAll(".modal-heading");
        if (addModalHeading.length > 0) {
            for (let wf = 0; wf < addModalHeading.length; wf++) {
                addModalHeading[wf].innerHTML = `${customLanguage?.modalHeadingText}`;
            }
        }
        // --------- add wishlist description-------
        addWishlistDescription();
        const checkArrayList = isMultiwishlistTrue ? allWishlistData : getWishlistByKey(allWishlistData, "favourites");
        const hasItems = checkArrayList.some(obj =>
            Object.values(obj).some(list => list.length > 0)
        );
        let loaderr = document.querySelectorAll(".show-title");
        for (let wf = 0; wf < loaderr.length; wf++) {
            if (loaderr[wf].innerHTML === "") {
                loaderr[wf].innerHTML = `<div class="loader-css" ><span></span></div>`;
            }
            else if (loaderr[wf].innerHTML.includes('drawer-cart-empty') && hasItems) {
                loaderr[wf].innerHTML = `<div class="loader-css" ><span></span></div>`;
            }
        }
        if (generalSetting.wishlistDisplay === "drawer") {
            document.querySelector(".drawer-main").innerHTML = `<div class="loader-css" ><span></span></div>`;
        }
        if (currentPlan > 1) {
            let poweredByText = document.querySelectorAll(".powered-by-text");
            for (let wf = 0; wf < poweredByText.length; wf++) {
                poweredByText[wf].innerHTML = "";
            }
        }
        if (generalSetting.wishlistDisplay === "modal") {
            document.body.style.overflow = "hidden";
            document.body.classList.add('wf-hide-scroll');
            wishlistStyleFxn();
            modalWF.style.display = "block";
            document.querySelector(".modal-page-auth").style.display = "block";
            document.querySelector(".grid-outer-main").style.display = "flex";
            document.getElementById("wg-modal-inner-content").style.display = "block";
            document.getElementById("wg-isLogin-modal").style.display = "none";
            document.querySelector(".searchData input").value = "";
            spanWF.onclick = function () {
                const scrollToTop = document.querySelectorAll('.wishlist-modal-box, .wg-modal'); // Select all matching elements
                scrollToTop.forEach(element => {
                    element.scrollTop = 0;
                })
                modalWF.style.display = "none";
                document.querySelector(".searchData input").value = "";
                // document.body.style.overflow = "auto";
                removeScrollFromBody();
                removeClassFromBody();
            };
            pageTypeFunction();
        } else if (generalSetting.wishlistDisplay === "page") {
            wishlistStyleFxn();
            window.location = `${wfGetDomain}apps/wg-wishlist`;
        } else if (generalSetting.wishlistDisplay === "drawer") {
            if (currentPlan > 1) {
                document.body.style.overflow = "hidden";
                document.querySelector(".sidenav").style.transform = "translateX(0%)";
                document.querySelector(".overlayy").style.height = "100vh";
                document.querySelector(".swlb-div").style.display = "block";
                document.querySelector(".drawer-main").style.display = "block";
                document.querySelector(".drawer-button-div").style.display = "block";
                document.getElementById("wg-isLogin-drawer").style.display = "none";
                renderDrawerContentFxn();
            } else {
                alertContent(`Your plan subscription is out of service, Please Contact site administrator`);
            }
        } else {
            window.location = `${wfGetDomain}apps/wg-wishlist`;
        }
    }
}

async function updateQuantity(event, product_id, user_id) {
    try {
        const parent = event.target.parentNode;
        const inputField = parent.querySelector(".quant-update");
        if (!inputField) return;

        const isPlusQuant = event.target.classList.contains("quant-plus");
        const isMinusQuant = event.target.classList.contains("quant-minus");

        let quantity = parseInt(inputField.value || 1);

        if (isPlusQuant) {
            quantity++;
        } else if (isMinusQuant && quantity > 1) {
            quantity--;
        } else if (!isPlusQuant && !isMinusQuant) {
            // User typed manually
            if (quantity < 1 || isNaN(quantity)) {
                quantity = 1; // reset to min
            }
        }

        const userData = await fetch(`${serverURL}/update-product-quantity`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                productId: product_id,
                userId: user_id,
                quantity: quantity,
            }),
        });

        const result = await userData.json();
        if (result.msg === "item_quantity_updated") {
            inputField.value = quantity;
            inputField.dataset.quant = quantity;
        }
    } catch (error) {
        console.error("Error:", error);
    }
    showCountAll();
}

async function updateVariantInDB(userId, wgProductId, wgVariantId, listId) {
    try {
        const userData = await fetch(`${serverURL}/update-product-variant`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                productId: wgProductId,
                userId: userId,
                listId: listId,
                newVariant: wgVariantId,
            }),
        });

        const result = await userData.json();
        if (result.msg === "item_variant_updated") {
            // inputField.value = quantity;
            // inputField.dataset.quant = quantity;
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function fxnAfterAddToWishlist() {
    setTimeout(() => {
        eval(advanceSetting.jsAfterAddToWishlist);
    }, [1000]);
}

function fxnAfterRemoveFromWishlist() {
    setTimeout(() => {
        eval(advanceSetting.jsAfterRemoveFromWishlist);
    }, [1000]);
}

function fxnAfterItemsLoadedOfWishlist() {
    setTimeout(() => {
        eval(advanceSetting.jsAfterItemsLoaded);
    }, [500]);
}

function fxnAfterAddTocartButton() {
    setTimeout(() => {
        eval(advanceSetting?.jsAfterAddToCart);
    }, [500]);
}

function addClassInDiv() {
    var elements = document.querySelectorAll(".swlb-div");
    elements.forEach(function (element) {
        element.classList.add("login-text-removed");
    });
    return `<div></div>`;
}

async function shareWishlistFXN() {
    // if (currentPlan >= 2 && generalSetting?.hideLoginText === false) {
    if (
        currentPlan <= 3 &&
        generalSetting.wishlistShareShowData === "loggedinuser"
    ) {
        let checkLoggedIn = await checkButton();
        let shareDIV = document.querySelectorAll(".share-div");
        for (let wf = 0; wf < shareDIV.length; wf++) {
            if (checkLoggedIn === true) {
                shareDIV[wf].innerHTML = `<div class="${generalSetting.wishlistDisplay === "drawer"
                    ? "drawerShareTextStyle"
                    : "shareModalById shareButtonStyle"
                    }" ><div class="img_test"><span></span></div><div class="shareButtonTextStyle">${customLanguage.shareWishlistByEmailButton
                    }</div></div>`;
            } else {
                shareDIV[wf].innerHTML = `<div class="${generalSetting.wishlistDisplay === "drawer"
                    ? "drawerShareTextStyle"
                    : "shareButtonStyle"
                    }" onclick="openShareWishlistModal()"><div class="img_test"><span></span></div><div class="shareButtonTextStyle">${customLanguage.shareWishlistByEmailButton
                    }</div></div>`;
            }
        }
    } else if (
        currentPlan <= 3 &&
        generalSetting.wishlistShareShowData === "guestuser"
    ) {
        let shareDIV = document.querySelectorAll(".share-div");
        for (let wf = 0; wf < shareDIV.length; wf++) {
            shareDIV[wf].innerHTML = `<div class="${generalSetting.wishlistDisplay === "drawer"
                ? "drawerShareTextStyle"
                : "shareButtonStyle"
                }" onclick="openShareWishlistModal()"><div class="img_test"><span></span></div><div class="shareButtonTextStyle">${customLanguage.shareWishlistByEmailButton
                }</div></div>`;
        }
        let getLoginnDiv = customerEmail
            ? addClassInDiv()
            :
            (generalSetting?.hideLoginText === false || generalSetting?.hideLoginText === undefined || generalSetting?.hideLoginText === "") ?
                `<div class="drawer-login-text"> ${customLanguage?.loginTextForWishlist
                    ? customLanguage?.loginTextForWishlist
                    : "Wishlist is not saved permanently yet. Please"
                } <a href ="/account">${customLanguage?.loginTextAnchor
                    ? customLanguage?.loginTextAnchor
                    : "login"
                }</a> ${customLanguage?.orText ? customLanguage?.orText : "or"
                } <a href="/account/register"> ${customLanguage?.createAccountAnchor
                    ? customLanguage?.createAccountAnchor
                    : "create account"
                } </a> ${customLanguage?.createAccountEndingText || ""}</div>` : "";

        if (generalSetting.wishlistDisplay === "drawer") {
            document.querySelector(".swlb-div").innerHTML = `${getLoginnDiv}<div class="${generalSetting.wishlistDisplay === "drawer"
                ? "drawerShareTextStyle"
                : "shareButtonStyle"
                }" onclick="openShareWishlistModal()"><div class="img_test"><span></span></div><div class="shareButtonTextStyle">${customLanguage.shareWishlistByEmailButton}</div></div>`;
        }

    } else if (
        currentPlan >= 4 &&
        generalSetting.wishlistShareShowData === "loggedinuser"
    ) {
        let checkLoggedIn = await checkButton();
        let shareDIV = document.querySelectorAll(".share-div");
        for (let wf = 0; wf < shareDIV.length; wf++) {
            if (checkLoggedIn === true) {
                shareDIV[wf].innerHTML = `
                ${(generalSetting.downloadCsv === "yes" && currentPlan >= 4) ?
                        `<a class="wg-download-csv" href="#" onclick="wgDownloadCsv()"> <span class="download-csv-icon"></span> ${customLanguage?.downloadCsv || storeFrontDefLang?.downloadCsv || "Download CSV"}</a>` : ""} 
                <div class="${generalSetting.wishlistDisplay === "drawer"
                        ? "drawerShareTextStyle"
                        : "shareModalById shareButtonStyle"
                    }"><div class="img_test"><span></span></div><div class="shareButtonTextStyle">${customLanguage.shareWishlistByEmailButton
                    }</div></div>`;
            } else {
                shareDIV[wf].innerHTML = `
                ${(generalSetting.downloadCsv === "yes" && currentPlan >= 4) ?
                        `<a class="wg-download-csv" href="#" onclick="wgDownloadCsv()"> <span class="download-csv-icon"></span> ${customLanguage?.downloadCsv || storeFrontDefLang?.downloadCsv || "Download CSV"}</a>` : ""} 
                <div class="${generalSetting.wishlistDisplay === "drawer"
                        ? "drawerShareTextStyle"
                        : "shareButtonStyle"
                    }" onclick="openShareModal()"><div class="img_test"><span></span></div><div class="shareButtonTextStyle">${customLanguage.shareWishlistByEmailButton
                    }</div></div>`;
            }
        }
    } else if (
        currentPlan >= 4 &&
        generalSetting.wishlistShareShowData === "guestuser"
    ) {
        let shareDIV = document.querySelectorAll(".share-div");
        for (let wf = 0; wf < shareDIV.length; wf++) {
            shareDIV[wf].innerHTML = ` 
             ${(generalSetting.downloadCsv === "yes" && currentPlan >= 4) ?
                    `<a class="wg-download-csv" href="#" onclick="wgDownloadCsv()"> <span class="download-csv-icon"></span> ${customLanguage?.downloadCsv || storeFrontDefLang?.downloadCsv || "Download CSV"}</a>` : ""} 
                    <div class="${generalSetting.wishlistDisplay === "drawer"
                    ? "drawerShareTextStyle"
                    : "shareButtonStyle"
                }"  onclick="openShareModal()"><div class="img_test"><span></span></div><div class="shareButtonTextStyle">${customLanguage.shareWishlistByEmailButton
                }</div></div>`;
        }
        let getLoginnDiv = customerEmail
            ? addClassInDiv()
            : (generalSetting?.hideLoginText === false || generalSetting?.hideLoginText === undefined || generalSetting?.hideLoginText === "") ?
                `<div class="drawer-login-text"> ${customLanguage?.loginTextForWishlist
                    ? customLanguage?.loginTextForWishlist
                    : "Wishlist is not saved permanently yet. Please"
                } <a href ="/account">${customLanguage?.loginTextAnchor
                    ? customLanguage?.loginTextAnchor
                    : "login"
                }</a> ${customLanguage?.orText ? customLanguage?.orText : "or"
                } <a href="/account/register"> ${customLanguage?.createAccountAnchor
                    ? customLanguage?.createAccountAnchor
                    : "create account"
                } </a> ${customLanguage?.createAccountEndingText || ""}</div>` : ""
            ;


        if (generalSetting.wishlistDisplay === "drawer") {
            document.querySelector(".swlb-div").innerHTML = `${getLoginnDiv} <div class="${generalSetting.wishlistDisplay === "drawer"
                ? "drawerShareTextStyle"
                : "shareButtonStyle"
                }"  onclick="openShareModal()"><div class="img_test"><span></span></div><div class="shareButtonTextStyle">${customLanguage.shareWishlistByEmailButton}</div></div>`;
        }
    }
    // }

}

async function showButtons() {
    const getCurrentLogin = await getCurrentLoginFxn();
    const checkVisibility = (setting) => {
        if (!setting) {
            return true;
        } else if (setting === "both users") {
            return true;
        } else if (setting === "login users") {
            return getCurrentLogin !== "";
        } else {
            return false;
        }
    };
    const isPrice = checkVisibility(generalSetting.showPrice);
    const isQuantity = checkVisibility(generalSetting.showQuantity);
    const isMoveToCart = checkVisibility(generalSetting.showMoveToCart);
    // const isVendor = checkVisibility(generalSetting.showVendors);
    return { isPrice, isQuantity, isMoveToCart };
}

function detectSubdomain() {
    const hostname = window.location.hostname; // e.g. fr.domain.com OR domain.com
    const parts = hostname.split('.');
    if (parts[0] === 'www') parts.shift(); // Remove 'www' if present
    const subdomainPart = parts.length > 2 ? parts[0].toLowerCase() : null;
    const languageCodes = ['en', 'fr', 'de', 'es', 'ar', 'it', 'pt', 'nl', 'zh', 'zh-tw', 'pt-br', 'pt-pt', 'da', 'sv', 'cs', 'uk', 'ja', 'ko', 'no', 'pl', 'th', 'tr', 'fi', 'he', 'hu', 'bg', 'lt', 'el', 'ga', 'ro', 'fil', 'id', 'ru', 'vi', 'sq', 'lv', 'et'];
    const isLanguageInSubdomain = subdomainPart && languageCodes.includes(subdomainPart);
    return {
        subdomain: isLanguageInSubdomain ? subdomainPart : null,
        checkType: isLanguageInSubdomain ? 'subdomain' : 'none'
    };
}

function saveAccessTokenInCookie(accessToken) {
    document.cookie = `access-token=${accessToken}; path=/; domain=.${window.location.host}; secure`;
    localStorage.setItem("access-token", accessToken);
};

function getAccessTokenFromCookie() {
    let { checkType } = detectSubdomain();
    if (checkType === "subdomain") {
        const match = document.cookie.match(/(^| )access-token=([^;]+)/);
        return match ? match[2] : null;
    } else {
        return localStorage.getItem("access-token");
    }
};

function saveCustomerEmailInCookie(customerEmail) {
    document.cookie = `customer-email=${customerEmail}; path=/; domain=.${window.location.host}; secure`;
    localStorage.setItem("customer-email", customerEmail);
};

function getCustomerEmailFromCookie() {
    let { checkType } = detectSubdomain();
    if (checkType === "subdomain") {
        const match = document.cookie.match(/(^| )customer-email=([^;]+)/);
        return match ? match[2] : null;
    } else {
        return localStorage.getItem("customer-email");
    }
};

function getCurrentLoginFxnForSharedPage() {
    let accessToken;
    // if (localStorage.getItem("access-token") === null) {
    if (getAccessTokenFromCookie() === null) {
        accessToken = btoa((Math.random() + 1).toString(36).substring(2) + new Date());
        saveAccessTokenInCookie(accessToken)
        // if (permanentDomain === 'wantitbuyit-wibi.myshopify.com') {
        //     document.cookie = `access-token=${accessToken}; path=/; domain=.wibi.com.kw; secure`;
        // } else {
        //     localStorage.setItem("access-token", accessToken);
        // }
        // accessToken = btoa((Math.random() + 1).toString(36).substring(2) + new Date());
        // localStorage.setItem("access-token", accessToken);
    } else {
        accessToken = getAccessTokenFromCookie();
        // accessToken = localStorage.getItem("access-token");
    }
    let accessEmail;
    if (getCustomerEmailFromCookie() === null) {
        accessEmail = customerEmail;
        saveCustomerEmailInCookie(customerEmail);
        // localStorage.setItem("customer-email", customerEmail);
    } else {
        if (getCustomerEmailFromCookie() === customerEmail) {
            accessEmail = getCustomerEmailFromCookie();
        } else {
            if (
                getCustomerEmailFromCookie() !== "" &&
                customerEmail === ""
            ) {
                accessEmail = getCustomerEmailFromCookie();
            } else {
                if (
                    getCustomerEmailFromCookie() !== "" &&
                    getCustomerEmailFromCookie() !== customerEmail
                ) {
                    accessEmail = customerEmail;
                    saveCustomerEmailInCookie(customerEmail);
                    // localStorage.setItem("customer-email", customerEmail);
                } else {
                    accessEmail = customerEmail;
                    saveCustomerEmailInCookie(customerEmail);
                    // localStorage.setItem("customer-email", customerEmail);
                }
            }
        }
    }
    return { accessToken, accessEmail };
}

function checkShareIcons() {
    return {
        facebookIcon:
            generalSetting?.facebookCheckIcon === undefined
                ? true
                : generalSetting.facebookCheckIcon,
        whatsappIcon:
            generalSetting?.whatsappCheckIcon === undefined
                ? true
                : generalSetting.whatsappCheckIcon,
        linkedinIcon:
            generalSetting?.linkedinCheckIcon === undefined
                ? true
                : generalSetting.linkedinCheckIcon,
        telegramIcon:
            generalSetting?.telegramCheckIcon === undefined
                ? true
                : generalSetting.telegramCheckIcon,
        instagramIcon:
            generalSetting?.instagramCheckIcon === undefined
                ? true
                : generalSetting.instagramCheckIcon,
        twitterIcon:
            generalSetting?.twitterCheckIcon === undefined
                ? true
                : generalSetting.twitterCheckIcon,
        fbMessengerIcon:
            generalSetting?.fbMessengerCheckIcon === undefined
                ? true
                : generalSetting.fbMessengerCheckIcon,
    };
}

function pageTypeStyle() {
    document.querySelector(".wishlist-page-main").style.backgroundColor =
        generalSetting.wlBgColor;
    document.querySelector(
        ".wishlist-page-main"
    ).style.padding = `${generalSetting.wlPaddingTopBottom}${generalSetting.wlPaddingTopBottomUnit} ${generalSetting.wlPaddingLeftRight}${generalSetting.wlPaddingLeftRightUnit}`;
    // document
    //     .querySelector(".wishlist-page-main")
    //     .classList.add(
    //         `${generalSetting.wlTextAlign === "left"
    //             ? "box-align-left"
    //             : generalSetting.wlTextAlign === "center"
    //                 ? "box-align-center"
    //                 : "box-align-right"
    //         }`
    //     );
    document.querySelector(".wishlist-page-main").style.color = modalDrawerTextColor;
    // document.querySelector(".wishlist-page-main").style.textAlign =
    //     generalSetting.wlTextAlign;
}

function changeMoney(cents) {
    // const money_format = heartButton.getAttribute("currency-type");
    const money_format = wfCurrencyType;
    if (typeof cents === "string") {
        cents = parseFloat(cents.replace(",", ""));
    }
    var value = "";
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = money_format;
    function defaultOption(opt, def) {
        return typeof opt === "undefined" ? def : opt;
    }
    function formatWithDelimiters(number, precision, thousands, decimal) {
        precision = defaultOption(precision, 2);
        thousands = defaultOption(thousands, ",");
        decimal = defaultOption(decimal, ".");
        if (isNaN(number) || number === null) {
            return "0";
        }
        number = (number / 100.0).toFixed(precision);
        var parts = number.split("."),
            dollars = parts[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1" + thousands),
            cents = parts[1] ? decimal + parts[1] : "";
        return dollars + cents;
    }
    let match = formatString.match(placeholderRegex);
    if (match) {
        switch (match[1]) {
            case "amount":
                value = formatWithDelimiters(cents, 2);
                break;
            case "amount_no_decimals":
                value = formatWithDelimiters(cents, 0);
                break;
            case "amount_with_comma_separator":
                value = formatWithDelimiters(cents, 2, ".", ",");
                break;
            case "amount_no_decimals_with_comma_separator":
                value = formatWithDelimiters(cents, 0, ".", ",");
                break;
        }
    }
    return formatString.replace(placeholderRegex, value);
}

// ---------------filter option function---------------
function createFilterOptionInStructure() {
    // if (generalSetting?.hideFilter !== true) {
    //     let filterMainDiv = document.querySelectorAll('.wg-filter-main-div');
    //     for (let i = 0; i < filterMainDiv.length; i++) {
    //         filterMainDiv[i].innerHTML = `Sort by <select style="float: right;padding: 10px 15px;" id="wf-filter-for-modal" onChange="wfFilterChange()">
    //                                         ${customLanguage?.textMsgLanguage === "english" && `<option value="a_to_z" >Alphabetically, A-Z</option>`}
    //                                         ${customLanguage?.textMsgLanguage === "english" && `<option value="z_to_a" >Alphabetically, Z-A</option>`}
    //                                         <option value="l_to_h" >Price, low to high</option>
    //                                         <option value="h_to_l" >Price, high to low</option>
    //                                         <option value="n_to_o" >Date, new to old</option>
    //                                         <option value="o_to_n" >Date, old to new</option>
    //                                     </select>`;
    //     }
    // }
};

async function wfFilterChange() {
    const selectElement = document.getElementById("wf-filter-for-modal");
    const selectedValue = selectElement.value;
    let arrayList = await getDataFromSql();
    let myArray = [];

    if (isMultiwishlistTrue === false) {
        arrayList.map((data, index) => {
            let keyData = Object.keys(data)[0];
            let valueData = Object.values(data)[0];
            if (keyData === "favourites") {
                if (selectedValue === "a_to_z") {
                    valueData.sort((a, b) => a.title.localeCompare(b.title));
                } else if (selectedValue === "z_to_a") {
                    valueData.sort((a, b) => b.title.localeCompare(a.title));
                } else if (selectedValue === "n_to_o") {
                    valueData.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
                } else if (selectedValue === "o_to_n") {
                    valueData.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
                } else if (selectedValue === "l_to_h") {
                    valueData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                } else if (selectedValue === "h_to_l") {
                    valueData.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                }
                myArray.push({ [keyData]: valueData });
            }
        })
    } else {
        arrayList.map((data, index) => {
            let keyData = Object.keys(data)[0];
            let valueData = Object.values(data)[0];
            if (selectedValue === "a_to_z") {
                valueData.sort((a, b) => a.title.localeCompare(b.title));
            } else if (selectedValue === "z_to_a") {
                valueData.sort((a, b) => b.title.localeCompare(a.title));
            } else if (selectedValue === "n_to_o") {
                valueData.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
            } else if (selectedValue === "o_to_n") {
                valueData.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
            } else if (selectedValue === "l_to_h") {
                valueData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            } else if (selectedValue === "h_to_l") {
                valueData.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            }
            myArray.push({ [keyData]: valueData });
        })
    }
    renderMultiModalContentFxn(myArray);
}
// ---------------filter option function---------------

async function pageTypeFunction() {
    const defaultLang = await getDefLanguage();
    storeFrontDefLang = defaultLang;
    await getStoreLanguage().then(async () => {
        if (currentPlan > 1) {
            let poweredByText = document.querySelectorAll(".powered-by-text");
            for (let wf = 0; wf < poweredByText.length; wf++) {
                poweredByText[wf].innerHTML = "";
            }
        }
        let addModalHeading = document.querySelectorAll(".modal-heading");
        if (addModalHeading.length > 0) {
            for (let wf = 0; wf < addModalHeading.length; wf++) {
                addModalHeading[wf].innerHTML = `${customLanguage.modalHeadingText}`;
            }
        }
        // --------- add wishlist description-------
        addWishlistDescription();
        let viewTextDiv = document.querySelectorAll(".gridText");
        if (viewTextDiv.length > 0) {
            for (let wf = 0; wf < viewTextDiv.length; wf++) {
                viewTextDiv[wf].innerHTML = `${customLanguage.textForGridIcon}`;
            }
        }
        const getLocalId = localStorage.getItem("isLoginProductId") !== null
            ? localStorage.getItem("isLoginProductId")
            : null;

        if (!customerEmail && getLocalId) {
            document.querySelector(".modal-page-auth").style.display = "none";
            document.querySelector(".grid-outer-main").style.display = "none";
            document.querySelector(".show-title").style.display = "none";
            document.querySelector(".modal-button-div").style.display = "none";
            document.querySelector(".searchData").style.display = "none";

            // const newDivData = `
            // <h3>${customLanguage?.isLoginParaText || storeFrontDefLang.isLoginParaText}</h3>
            // <div class="wg-islogin-buttons">
            //     <button onClick="goToRegister()" class="wg-register-btn">${customLanguage?.createAccountAnchor || storeFrontDefLang.createAccountAnchor}</button>
            //     <button onClick="goToAccount()" class="wg-login-btn">${customLanguage?.loginTextAnchor || storeFrontDefLang?.loginTextAnchor}</button>
            // </div>`;
            // const newDiv = document.createElement("div");
            // newDiv.id = "wg-isLogin-modal";
            // newDiv.innerHTML = newDivData;
            // document.querySelector(".modal-button-div").insertAdjacentElement("afterend", newDiv);

            const existingModal = document.getElementById("wg-isLogin-modal");
            if (existingModal) {
                existingModal.remove();
            }
            // Create new modal
            const newDivData = `
                <h3>${customLanguage?.isLoginParaText || storeFrontDefLang.isLoginParaText}</h3>
                <div class="wg-islogin-buttons">
                    <button onClick="goToRegister()" class="wg-register-btn">
                        ${customLanguage?.createAccountAnchor || storeFrontDefLang.createAccountAnchor}
                    </button>
                    <button onClick="goToAccount()" class="wg-login-btn">
                        ${customLanguage?.loginTextAnchor || storeFrontDefLang?.loginTextAnchor}
                    </button>
                </div>`;

            const newDiv = document.createElement("div");
            newDiv.id = "wg-isLogin-modal";
            newDiv.innerHTML = newDivData;

            // Insert new modal after the reference element
            const referenceEl = document.querySelector(".modal-button-div");
            if (referenceEl) {
                referenceEl.insertAdjacentElement("afterend", newDiv);
            }

            setTimeout(() => {
                localStorage.clear("isLoginProductId");
            }, 15000);
        }

        document.querySelector(".modal-heading-parent").style.textAlign = generalSetting.wlTextAlign;

        if (!customerEmail) {

            if ((generalSetting?.hideLoginText === false || generalSetting?.hideLoginText === undefined || generalSetting?.hideLoginText === "")) {
                document.querySelector(".modal-page-auth").innerHTML = `
                ${customLanguage?.loginTextForWishlist || storeFrontDefLang.loginTextForWishlist} <a href ="/account">${customLanguage?.loginTextAnchor || storeFrontDefLang?.loginTextAnchor}</a> ${customLanguage?.orText || storeFrontDefLang.orText} <a href="/account/register"> ${customLanguage?.createAccountAnchor || storeFrontDefLang.createAccountAnchor}</a> ${customLanguage?.createAccountEndingText || ""}`;
            }

            document.querySelector(".modal-page-auth").style.textAlign = generalSetting.wlTextAlign;
            document.querySelector(".modal-heading-parent").style.textAlign = generalSetting.wlTextAlign;
        }
        renderViewAs();
        shareWishlistFXN();
        modalButtonFxn();
        const getSearchBar = document.querySelector(".searchbar_Input");
        getSearchBar && (getSearchBar.value = "");
        if (window.location.href.includes("/apps/wg-wishlist")) {
            const arrayList = isMultiwishlistTrue
                ? await getDataFromSql()
                : getWishlistByKey(await getDataFromSql(), "favourites");
            await renderMultiModalContentFxn(arrayList)
        } else {
            checkPlanForMulti("multi")
        }
        shareModalContent.innerHTML = `<h3>${customLanguage.shareWishlistByEmailHeading}</h3>
    <div class="closeByShareModal" aria-hidden="true"  onclick="closeShareModal()"></div>
    <label for="wgSenderName">${customLanguage.shareWishlistSenderName}<span class="redAstrik">*</span></label>
    <input type="text" id="wgSenderName" name="wgSenderName" placeholder="${customLanguage.shareWishlistSenderName}" onfocus="removeError()">

    <label for="textEmailRecieverName">${customLanguage?.shareWishlistRecieverName || storeFrontDefLang?.shareWishlistRecieverName}<span class="redAstrik">*</span></label>
    <input type="text" id="textEmailRecieverName" name="textEmailRecieverName" placeholder="${customLanguage?.shareWishlistRecieverName || storeFrontDefLang?.shareWishlistRecieverName}" onfocus="removeError()">

    <label for="textEmail">${customLanguage.shareWishlistRecipientsEmail}<span class="redAstrik">*</span></label>
    <input type="email" id="textEmail" name="textEmail" placeholder="${customLanguage.shareWishlistRecipientsEmail}" onfocus="removeError()">
    <div id="emailError" class="error-message" style="display: none;"></div>

    <label for="textEmailMessage">${customLanguage.shareWishlistMessage}<span class="redAstrik">*</span></label>
    <textarea id="textEmailMessage" name="textEmailMessage" placeholder="${customLanguage?.shareWishlistMessagePlaceholder || ""}" onfocus="removeError()"></textarea>
    <div id="error-message" style="color: red;"></div>

    <div class="modalContainer">
        <button id="shareListBtn" class="cartButtonStyle" type="button" onclick="submitForm()">${customLanguage.shareWishlistByEmailFormButton}</button> 
    </div>
      
    <div class="other-sharing-options">
      <h4>${customLanguage.iconHeading}</h4>

      <div class="socialMediaIcon">      
        <div onclick="openShareWishlistModal()" class="wg-icon-parent"><span class="copy-link-img share-icons"></span><span class="iconText">Copy</span></div>
      ${checkShareIcons().facebookIcon
                ? `<div onclick="shareOnFacebook()" class="wg-icon-parent"><span class="facebook-img share-icons"></span><span class="iconText">Facebook</span></div>`
                : ""
            }
      ${checkShareIcons().whatsappIcon
                ? `<div onclick="shareViaWhatsApp()" class="wg-icon-parent"><span class="whatsapp-img share-icons"></span><span class="iconText">WhatsApp</span></div>`
                : ""
            }
      ${checkShareIcons().linkedinIcon
                ? `<div onclick="shareViaLinkedIn()" class="wg-icon-parent"><span class="linkedin-img share-icons"></span><span class="iconText">Linkedin</span></div>`
                : ""
            }
      ${checkShareIcons().fbMessengerIcon
                ? `<div onclick="shareOnFbMessenger()" class="wg-icon-parent"><span class="fb-messenger-img share-icons"></span><span class="iconText">Messenger</span></div>`
                : ""
            }
      ${checkShareIcons().telegramIcon
                ? `<div onclick="shareViaTelegram()" class="wg-icon-parent"><span class="telegram-img share-icons"></span><span class="iconText">Telegram</span></div>`
                : ""
            }
      ${checkShareIcons().twitterIcon
                ? `<div onclick="shareOnTwitter()" class="wg-icon-parent"><span class="twitter-img share-icons"></span><span class="iconText">X</span></div>`
                : ""
            }
      ${checkShareIcons().instagramIcon
                ? `<div onclick="shareOnInstagram()" class="wg-icon-parent"><span class="instagram-img share-icons"></span><span class="iconText">Instagram</span></div>`
                : ""
            }
    </div></div>`;
        successInnerDiv.innerHTML = `<h3>${customLanguage.shareWishlistByEmailSuccessMsg}</h3></div>`;
    })

    // const modalBoxes = document.querySelectorAll('.wishlist-modal-box div');
    // modalBoxes.forEach(modalBox => {
    //     modalBox.style.backgroundColor = generalSetting?.gridBgColor ? generalSetting?.gridBgColor : "center";     // Example style
    //     modalBox.style.textAlign = generalSetting?.gridAlignment ? generalSetting.gridAlignment : "center";
    //     // Add more styles as needed
    // });
}

function checkImage(rawUrl) {
    const defaultImg = "";
    return new Promise((resolve) => {
        if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
            return resolve(defaultImg);
        }
        const url = rawUrl?.startsWith('//') ? `https:${rawUrl}` : rawUrl;
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(defaultImg);
        img.src = url;
    });
}

// ----------recreated with promises.all----------
async function renderMultiModalContentFxn(arrayList) {
    shareWishlistFXN();
    if (arrayList.length === 0) {
        await disableShare(arrayList, ".share-div")
        let emptyList = `<div class="wishlist-modal-box wf-empty-multiwishlist" data-key="favourites"><h4 class="drawer-cart-empty" > ${customLanguage.noMoreItem} </h4> <a class="a-main" href="${`${wfGetDomain}${generalSetting?.continueShoppingLink}` || `${wfGetDomain}collections/all`}"> <div class="cartButtonStyle"> ${customLanguage.continueShopping || storeFrontDefLang.continueShopping} </div> </a></div>`;

        document.querySelectorAll(".show-title").forEach((el) => (el.innerHTML = emptyList));
        return
    }
    await disableShare(arrayList, ".share-div")
    const modalHeading = document.querySelector(".modal-heading");
    modalHeading.style.color = modalDrawerTextColor;
    // modalHeading.style.textAlign = generalSetting.wlTextAlign;
    const { isPrice, isQuantity, isMoveToCart } = await showButtons();
    let gridCount = localStorage.getItem("grid-count") || "4";
    document
        .querySelectorAll(`.grid${gridCount}`)
        .forEach((el) => el.classList.add("wf-active-grid-focus"));
    const addNewClass = `wishlist-modal-${gridCount}`;
    let wishlistBody = `<div class="wishlist-modal-all">`;
    for (var itemIndex = 0; itemIndex < arrayList.length; itemIndex++) {
        let item = arrayList[itemIndex];
        let key = Object.keys(item)[0];
        let keyId = item[Object.keys(item)[1]];
        let items = item[key];

        wishlistBody += isMultiwishlistTrue ? `<div class="wf-multi-Wish-heading">
                                                <div class="wf-multi-Wish-content">
                                                            <span class="wg-arrow-up" onclick="toggleWishlistBox('${key.replace(/'/g, "\\'")}')"></span>
                                                            <h3 data-key="${key}">${key}</h3>
                                                        <span class="edit-main-icon" onclick="editWishlistName(event, '${key.replace(/'/g, "\\'")}')">
                                                            <span class="editWish"></span>
                                                        </span>

                                                    <div class="editWishDiv">
                                                        <div class="editWishDivInner">
                                                        <input type="text" class="editInput" placeholder="Enter wishlist name" value="${key}">
                                                        <div onclick="saveEditWishlistName(event, '${key.replace(/'/g, "\\'")}')" class="check-icon-main">
                                                            <div class="check-multiwishlist-icon"></div>
                                                        </div>
                                                        <div onclick="closeEditWishlistName(event, '${key.replace(/'/g, "\\'")}')" class="close-icon-main">
                                                            <div class="close-multiwishlist-icon"></div>
                                                        </div>
                                                    </div>
                                                    <p class="errorPara">Please enter name*</p>
                                                    </div>
                                                </div>
                                                <div class="single-wishist">
                                                    <span class="delete-main-icon" onclick="deleteWishlist(event, '${key.replace(/'/g, "\\'")}')">
                                                        <span class="deleteWish"></span>
                                                    </span>
                                                    <span class="delete-main-icon" onclick="shareSingleWishlist(event, '${keyId}')">
                                                        <div class="img_test"><span></span></div>
                                                    </span>
                                                </div>
                                            </div>` : "";

        if (items.length === 0) {
            wishlistBody += `<div class="wishlist-modal-box wf-empty-multiwishlist" data-key="${key}">
                                <h4 class="drawer-cart-empty">${customLanguage.noMoreItem}</h4>
                                <a class="a-main" href="${`${wfGetDomain}${generalSetting?.continueShoppingLink}` || `${wfGetDomain}collections/all`}">
                                    <div class="cartButtonStyle">${customLanguage?.addProductButtonText || storeFrontDefLang?.addProductButtonText}</div>
                                </a>
                            </div>`;
            continue;
        }
        wishlistBody += `<div class="wishlist-modal-box ${addNewClass}" data-key="${key}">`

        let loadingItemsCount = document.querySelectorAll(".modal-button-div");

        // Array of fetch promises
        let fetchPromises = items.map(async (data, itemIndex) => {
            let response = null;
            let jsonData;
            let foundVariant = null;
            let hasTag = false;
            let variantResponse = null;
            let variantDataResponse;

            variantResponse = await fetch(`${wfGetDomain}products/${data.handle}.js`);
            if (variantResponse.status !== 404) {
                variantDataResponse = await variantResponse?.json();
            }
            try {
                response = await fetch(`${wfGetDomain}products/${data.handle}.js`);
                if (response.status === 200) {
                    jsonData = await response.json();
                    foundVariant = jsonData?.variants.find(v => Number(v.id) === Number(data.variant_id));
                    hasTag = jsonData?.tags?.includes("wg_pdp") || false;
                }
            } catch (finalError) {
                console.error("Error fetching product or variant data:", finalError);
            }

            let loadingText = `<div class="modal-button-div">
                                    <div class="vcb-width">
                                        <div class="cartButtonStyle">
                                            ${storeFrontDefLang?.loadingItemCount} ${itemIndex + 1}/${items.length}
                                        </div>
                                    </div>
                               </div>`;
            loadingItemsCount.forEach(div => div.innerHTML = loadingText);
            return { data, foundVariant, hasTag, responseStatus: response, variantDataResponse, itemIndex };
        })

        let results = await Promise.all(fetchPromises);
        results.forEach(async ({ data, foundVariant, hasTag, responseStatus, variantDataResponse, itemIndex }) => {

            function wfGetImage() {
                let imageUrl = isVariantWishlistTrue === true && currentPlan >= 4 ? foundVariant?.featured_image !== null ? foundVariant?.featured_image?.src : variantDataResponse?.featured_image : variantDataResponse?.featured_image
                // return `${imageUrl}?width=600`
                if (!imageUrl) return "";
                const separator = imageUrl?.includes("?") ? "&" : "?";
                return `${imageUrl}${separator}width=600`;
            }


            if (responseStatus.ok) {
                const variantArray = [
                    foundVariant?.option1,
                    foundVariant?.option2,
                    foundVariant?.option3,
                ]?.filter((option) => option && option !== "Default Title");

                let actualPrice = foundVariant?.compare_at_price
                    ? changeMoney(foundVariant?.compare_at_price)
                    : null;
                const salePrice = changeMoney(foundVariant?.price);
                let currentNewPrice = foundVariant?.compare_at_price && foundVariant?.compare_at_price > foundVariant?.price
                    ? `<div class="wf-sale-price">${actualPrice}</div> 
                        <div class="wf-discount-price">${salePrice}</div>
                        <span class="Polaris-Sale-Text--root Polaris-Text--bodySm">
                            ${customLanguage.saleText || storeFrontDefLang.saleText}</span>`
                    : salePrice;

                const modifiedString = data.title
                    .replace(/'/g, "/wg-sgl")
                    .replace(/"/g, "/wg-dbl");

                const variantNAME = currentPlan >= 4 ? foundVariant?.name ? foundVariant?.name : data.title : data.title;
                const variantData = variantArray.length > 0 ? variantArray.join(" / ") : "";
                const priceToDb =
                    foundVariant?.compare_at_price &&
                        foundVariant?.compare_at_price > foundVariant?.price
                        ? foundVariant?.price
                        : foundVariant?.compare_at_price || foundVariant?.price;

                let parsedProductOption = null;
                try {
                    // if (data?.product_option) {
                    if (data?.product_option && data.product_option !== "undefined" && data.product_option !== "null") {
                        parsedProductOption = JSON.parse(data.product_option);
                    }
                } catch (error) {
                    console.error("Failed to parse product_option:", error);
                    parsedProductOption = null;
                }

                const productOptionString = data?.product_option ? data.product_option.replace(/"/g, '&quot;') : '';

                wishlistBody += `<div class="wishlist-grid1">
                        ${isMultiwishlistTrue
                        ? `
                            <div class="copy-icon-main" onClick="copyItem(${data.product_id}, ${data.variant_id}, '${data.handle}', '${data.price}', '${data.image}', '${data.title}', '${data.quantity}', '${key.replace(/'/g, "\\'")}')">
                                <div class="copy-multiwishlist-icon"></div>
                            </div>`
                        : ""
                    }
                    <div class="delete-icon-main" onClick="removeItem(${data.product_id}, ${data.variant_id}, ${data.wishlist_id}, '${data.handle}')">
                        <div class="deleteIcon"></div>
                    </div>
                    <div class="modal-product-image ${wfGetImage() === null ? "for-default" : ""}"><a href="${wfGetDomain}products/${data.handle
                    }?variant=${data.variant_id}"> ${wfGetImage() === null ? `<div class="default-image"><span></span></div>` : `<img src="${wfGetImage()?.startsWith('//') ? `https:${wfGetImage()}` : wfGetImage()}" alt="${data.title
                        }" height="auto" width="100%" />`}</a></div>

                    <div class="product-content-sec">

                        <h3 class="title11" style="color: ${modalDrawerTextColor};"><a href="${wfGetDomain}products/${data.handle
                    }?variant=${data.variant_id}">${(variantNAME && variantNAME.includes("(")) ? variantNAME.replace(/\((.*?)\)/, `</span><br><span class="wg-2">$1</span>`).replace(/^/, '<span class="wg-1">') : `<span>${variantNAME}</span>`}</a></h3>

                    ${isVariantWishlistTrue === true ? "" : `<p class="product-selected-variants" style="color: ${modalDrawerTextColor};">${variantData}</p>`}
                    ${isPrice ? `<div class="product-option-price">${currentNewPrice}</div>` : ""}

                     ${(isVariantWishlistTrue === true && isMoveToCart) &&
                        // addSelectOptionInGrid(data.handle, itemIndex, foundVariant, variantData)
                        variantDataResponse ? `
                        <div class="wfq-select-box" data-id="${btoa(variantDataResponse.variantId)}">
                            ${variantDataResponse.options.map((attribute, selectIndex) => `
                                <div class="wfq-option-select" data-option${selectIndex}="${btoa(attribute.values.find(value => variantDataResponse.variants.includes(value)) ? attribute.values.find(value => variantDataResponse.variants.includes(value)).toLowerCase() : '')}" >
                                    ${attribute.values.length === 1
                                ? ``
                                : `<select name="${attribute.name.toLowerCase()}"
                                        id="${attribute.name.toLowerCase()}"
                                        onChange="wfqChangeSelect(event, ${selectIndex}, '${variantDataResponse.handle}', this.value, '${variantData}', ${itemIndex}, '${key.replace(/'/g, "\\'")}', ${data.wishlist_id}, ${data.id})">
                                        <option value="" disabled selected>${attribute.name}</option>
                                        ${attribute.values.map(value => {
                                    return `
                                            <option value="${value}" ${foundVariant?.options[selectIndex] === value ? 'selected' : ''}>
                                                ${value}
                                            </option>
                                        `}).join("")}
                                    </select>`}
                                </div>
                            `).join("")}
                        </div>
                    ` : ""
                    }

                     ${(currentPlan >= 4 && parsedProductOption) ?
                        generalSetting?.showProductOption === "no" ? "" :
                            `<div class="wg-product-option">
                            ${Object.entries(parsedProductOption).map(([key, value]) => {
                                return `<b>${key}:</b>  ${value}<br/>`;
                            }).join('')
                            }
                         </div>`
                        : ""}

                        ${isQuantity
                        ? `<div class="quantity-div">
                            ${foundVariant?.available
                            ? `
                                <div class="quantity-minus-plus">
                                    <div class="quant-minus" onClick="updateQuantity(event, ${data.product_id}, ${data.wishlist_id})">-</div>
                                    <input 
                                        type="text" 
                                        class="quant-update" 
                                        value="${data.quantity}" 
                                        data-quant="${data.quantity}" 
                                        min="1"
                                        name="quantity_${data.product_id}_${data.wishlist_id}"
                                        id="quantity_${data.product_id}_${data.wishlist_id}"
                                        onChange="updateQuantity(event, ${data.product_id}, ${data.wishlist_id})"
                                    />
                                    <div class="quant-plus" onClick="updateQuantity(event, ${data.product_id}, ${data.wishlist_id})">+</div>
                                </div>`
                            : `<div class="quantity-minus-plus drawerDisableClass">
                                    <div class="drawerDisableClass">-</div>
                                    <span class="drawerDisableClass" data-quant="${data.quantity}">${data.quantity}</span>
                                    <div class="drawerDisableClass">+</div>
                                </div>`
                        }
                        </div>`
                        : ""
                    }
                
                    ${isMoveToCart
                        ? `<div class="movecart-button">
                            ${foundVariant?.available
                            ? hasTag
                                ? `<div id="viewItem${data.variant_id}" class="cartButtonStyle" onClick="viewItem('${data.handle}')">
                                        View Item
                                      </div>`
                                : `<div id="addItemToCart${data.variant_id}" class="cartButtonStyle" onClick="addToCartWf(event, ${data.variant_id}, ${data.wishlist_id}, ${data.product_id}, '${modifiedString}', ${priceToDb}, '${data.image}', '${data.handle}', '${itemIndex}', ${productOptionString} )">
                                        ${customLanguage.addToCart}
                                      </div>`
                            : `<div class="cartButtonStyle wg-out-of-stock" style="cursor: not-allowed; opacity: 0.8">
                                    ${customLanguage.outofStock}
                                  </div>`
                        }
                          </div>`
                        : ""
                    }
                    </div>
                </div>`;


                // `<div id="addItemToCart${data.variant_id}" class="cartButtonStyle" onClick="addToCartWf(event, ${data.variant_id}, ${data.wishlist_id}, ${data.product_id}, '${modifiedString}', ${priceToDb}, '${data.image}', '${data.handle}', '${itemIndex}', ${productOptionString} )">${customButton?.cartButtonStyle?.iconColor?.color && customButton?.cartButtonStyle?.hover?.iconColor?.color ? `<span class="wg-mtc-icon"></span>` : ``}
                //                                         ${customLanguage.addToCart}
                //                                       </div>`


            } else if (responseStatus.ok === false || responseStatus.status === 404 || responseStatus === null) {

                // let imgg = await checkImage(data.image) || "";
                let imgg = "";

                wishlistBody += `<div class="wishlist-grid1">
                                    <div class="delete-icon-main" onClick="removeItem(${data.product_id}, ${data.variant_id}, ${data.wishlist_id}, '${data.handle}')">
                                        <div class="deleteIcon"></div>
                                    </div>

                ${imgg === "" ? `<div class="modal-product-image default-image"><span></span></div>` :
                        `<div class="modal-product-image">
                            <img src="${data.image}"  alt="${data.title}" height="auto" width="100%" />
                        </div>`}

                        <div class="product-content-sec default-image-title">
                            <h3 class="title11" style="color: ${modalDrawerTextColor};">${data.title}</h3>

                            <div class="movecart-button">
                                <div class="cartButtonStyle" style="cursor: not-allowed; opacity: 0.8">
                                    ${customLanguage.productNotAvailableText || "Product not available"}
                                </div>
                            </div>
                        </div>
                </div>`;
            } else {
                console.log("else part")
                wishlistBody += `<div class="wishlist-grid1">
                                    <span>Something is wrong with this product</span>
                                </div>`
            }
        })
        wishlistBody += `</div>`
    }
    wishlistBody += "</div><div class='wg-no-match-found'></div>";
    document.querySelectorAll(".show-title").forEach((el) => (el.innerHTML = wishlistBody));
    document.querySelectorAll(".modal-button-div").forEach(div => div.innerHTML = ``);
    modalButtonFxn();
    if (currentPlan >= 2) {
        fxnAfterItemsLoadedOfWishlist();
    }
    document.querySelectorAll("div#main-Modal-form h3.title11 a, div#main-Modal-form p.product-selected-variants").forEach((element) => (element.style.color = modalDrawerTextColor));

    gridStyleFxn();
}

function gridStyleFxn() {
    const modalBoxes = document.querySelectorAll('.wishlist-modal-box');
    // for grid background
    if (generalSetting?.gridBgColor) {
        modalBoxes.forEach(box => {
            box.classList.add('wg-grid-bg');
        });
    }
    // for grid alignment
    if (generalSetting?.gridAlignment) {
        modalBoxes.forEach(box => {
            box.classList.add('wg-grid-alignment');
        });
    }
    // for grid border-radius
    if (generalSetting?.gridBorderRadius) {
        modalBoxes.forEach(box => {
            box.classList.add('wg-grid-border-radius');
        });
    }
    // for grid gap
    if (generalSetting?.gridGap) {
        modalBoxes.forEach(box => {
            box.classList.add('wg-grid-gap');
        });
    }
    // for border
    if (generalSetting?.gridBorderInput) {
        modalBoxes.forEach(box => {
            box.classList.add('wg-grid-border');
        });
    }
    // for grid image
    if (generalSetting?.gridImageView) {
        if (generalSetting?.gridImageView === 'image-fit-to-content') {
            modalBoxes.forEach(box => {
                box.classList.add('wg-grid-image-fit');
            });
        } else {
            modalBoxes.forEach(box => {
                box.classList.add('wg-grid-image-default');
            });
        }
    }

}

function updateVariantValue(index, value, prevValue) {
    currentSelectedVariant === "" ? prevValue : currentSelectedVariant;
    const parts = prevValue.split(" / ");
    parts[index] = value;
    return parts.join(" / ");
}

async function wfqChangeSelect(event, index, handle, value, prevValue, gridIndex, key = "favourites", userId, listId) {
    if (currentSelectedGrid === -1 && currentSelectedKey === "") {
        currentSelectedGrid = gridIndex;
        currentSelectedKey = key;
        currentSelectedVariant = updateVariantValue(index, value, prevValue);
    } else if (gridIndex === currentSelectedGrid && currentSelectedKey === key) {
        currentSelectedVariant = updateVariantValue(index, value, currentSelectedVariant);
    } else if (gridIndex !== currentSelectedGrid || currentSelectedKey !== key) {
        currentSelectedGrid = gridIndex;
        currentSelectedKey = key;
        currentSelectedVariant = updateVariantValue(index, value, prevValue);
    }

    let productDataJson;
    let productData = await fetch(`${wfGetDomain}products/${handle}.js`);
    if (productData.status !== 404) {
        productDataJson = await productData?.json();
    }

    let dddd = productDataJson.variants;
    let updateData = dddd.find(data => {
        return data.title === currentSelectedVariant
    });

    if (updateData) {
        let wgProductId = productDataJson?.id;
        let wgVariantId = updateData?.id;
        await updateVariantInDB(userId, wgProductId, wgVariantId, listId);

        // here we will update the variant id in the array 
        newArrayAfterSelection = JSON.parse(JSON.stringify(allWishlistData));

        newArrayAfterSelection.forEach(obj => {
            if (obj[key]) {
                obj[key] = obj[key].map(item =>
                    Number(item.product_id) === wgProductId && Number(item.id) === listId
                        ? { ...item, variant_id: wgVariantId }
                        : item
                );
            }
        });
        // console.log("After - ", newArrayAfterSelection)
        allWishlistData = newArrayAfterSelection;
        localStorage.setItem("wg-local-list", JSON.stringify(newArrayAfterSelection));

        if (generalSetting.wishlistDisplay === "drawer") {
            let getdrawerAllDiv = document.querySelectorAll(`tr.drawer-row[data-key="${key}"]`);
            // add the variant id in the cart button
            let updateCartButton = getdrawerAllDiv[gridIndex].querySelector(".movecart-button .cartButtonStyle");
            if (updateCartButton) {
                updateCartButton.setAttribute("new-variant", updateData?.id);
            }
            // update the image in grid
            let updateImage = getdrawerAllDiv[gridIndex].querySelector(".drawer-product-image a");
            if (updateImage) {
                if (updateData?.featured_image?.src) { updateImage.innerHTML = `<img src="${updateData?.featured_image?.src}" alt="${updateData?.name}" height="auto" width="100%" />` }
            }
            // update the title in grid
            let updateTitle = getdrawerAllDiv[gridIndex].querySelector("td h3");
            if (updateTitle) {
                if (updateData?.name) { updateTitle.innerHTML = `${updateData?.name}`; }
            }
            // update the price in grid
            let updatePrice = getdrawerAllDiv[gridIndex].querySelector(".product-option-price");
            if (updatePrice) {
                if (updateData?.price) { updatePrice.innerHTML = `${changeMoney(updateData?.price)}`; }
            }

            // update move to cart button
            let updatePMoveToCartButton = getdrawerAllDiv[gridIndex].querySelector(".movecart-button");
            if (updatePMoveToCartButton) {
                updatePMoveToCartButton.innerHTML = updateData?.available
                    ? `<div id="addItemToCart${updateData?.id}" class="cartButtonStyle" onClick="addToCartWf(event, ${updateData?.id}, ${userId}, ${updateData?.featured_image?.product_id}, '${updateData?.name?.replace(/'/g, '')}', ${updateData?.price}, '${updateData?.featured_image?.src}', '${handle}', '${index}', ${null} )">
                                        ${customLanguage?.addToCart}
                                      </div>`
                    : `<div class="cartButtonStyle wg-out-of-stock" style="cursor: not-allowed; opacity: 0.8">
                                    ${customLanguage?.outofStock}
                                  </div>`
            }

        } else {
            const targetMainDiv = document.querySelector(`div.wishlist-modal-box[data-key="${key}"]`);
            let getGrid = targetMainDiv.querySelectorAll(".wishlist-grid1");
            // add the variant id in the cart button
            let updateCartButton = getGrid[gridIndex].querySelector(".movecart-button .cartButtonStyle");
            if (updateCartButton) {
                updateCartButton.setAttribute("new-variant", updateData?.id);
            }
            // update the image in grid
            let updateImage = getGrid[gridIndex].querySelector(".modal-product-image a");
            if (updateImage) {
                if (updateData?.featured_image?.src) { updateImage.innerHTML = `<img src="${updateData?.featured_image?.src}" alt="${updateData?.name}" height="auto" width="100%" />` }
            }
            // update the title in grid
            let updateTitle = getGrid[gridIndex].querySelector(".title11 a");
            if (updateTitle) {
                if (updateData?.name) { updateTitle.innerHTML = `${updateData?.name}`; }
            }
            // update the price in grid
            let updatePrice = getGrid[gridIndex].querySelector(".product-option-price");
            if (updatePrice) {
                if (updateData?.price) { updatePrice.innerHTML = `${changeMoney(updateData?.price)}`; }
            }
            // update move to cart button
            let updatePMoveToCartButton = getGrid[gridIndex].querySelector(".movecart-button");
            if (updatePMoveToCartButton) {
                updatePMoveToCartButton.innerHTML = updateData?.available
                    ? `<div id="addItemToCart${updateData?.id}" class="cartButtonStyle" onClick="addToCartWf(event, ${updateData?.id}, ${userId}, ${updateData?.featured_image?.product_id}, '${updateData?.name.replace(/'/g, '')}', ${updateData?.price}, '${updateData?.featured_image?.src}', '${handle}', '${index}', ${null} )">
                                        ${customLanguage?.addToCart}
                                      </div>`
                    : `<div class="cartButtonStyle wg-out-of-stock" style="cursor: not-allowed; opacity: 0.8">
                                    ${customLanguage?.outofStock}
                                  </div>`
            }

        }
    }
}

function shareSingleWishlist(event, key) {
    // key = key.trim().replaceAll(" ", "%20");/
    event.stopPropagation();
    openShareWishlistModal(key);
}

function viewItem(handle) {
    window.top.location = `${wfGetDomain}products/${handle}`
}

function toggleWishlistBox(key) {
    const wishlistBox = document.querySelector(`.wishlist-modal-box[data-key="${key}"]`);
    const drawerBox = document.querySelectorAll(`.drawer-row[data-key="${key}"]`);
    const arrow = document.querySelector(`.wg-arrow-up[onclick="toggleWishlistBox('${key.replace(/'/g, "\\'")}')"], .wg-arrow-down[onclick="toggleWishlistBox('${key.replace(/'/g, "\\'")}')"]`);
    if (wishlistBox) {
        wishlistBox.classList.toggle("collapsed");
    }
    // drawerBox.forEach(div => div.classList.toggle("collapsed"));
    drawerBox.forEach(div => {
        if (div.classList.contains("collapsed")) {
            div.classList.remove("collapsed");
            div.style.display = "grid";
            div.offsetHeight;
        } else {
            div.classList.add("collapsed");
            setTimeout(() => {
                if (div.classList.contains("collapsed")) {
                    div.style.display = "none";
                }
            }, 400);
        }
    });
    if (arrow) {
        arrow.classList.toggle("wg-arrow-up");
        arrow.classList.toggle("wg-arrow-down");
    }
}

async function renderDrawerContentFxn() {
    shareWishlistFXN();
    const arrayList = isMultiwishlistTrue
        ? allWishlistData
        : getWishlistByKey(allWishlistData, "favourites");
    const { isPrice, isQuantity, isMoveToCart } = await showButtons();
    document.querySelector(".drawer-text").innerHTML = `${customLanguage.modalHeadingText}`;
    renderViewAs();
    if (arrayList.length === 0) {
        await disableShare(arrayList, ".drawerShareTextStyle")
        return (document.querySelector(".drawer-main").innerHTML = `<h4 class="drawer-cart-empty"> ${customLanguage.noMoreItem} </h4> <a class="a-main" href="${`${wfGetDomain}${generalSetting?.continueShoppingLink}` || `${wfGetDomain}collections/all`}"> <div class="cartButtonStyle"> ${customLanguage.continueShopping || storeFrontDefLang.continueShopping} </div> </a>`);
    }
    await disableShare(arrayList, ".drawerShareTextStyle")

    const drawerMain = document.querySelector(".drawer-main");
    drawerMain.innerHTML = `<table class="drawer-table"><tbody></tbody></table>`;
    const tableBody = drawerMain.querySelector("tbody");

    for (let itemIndex = 0; itemIndex < arrayList.length; itemIndex++) {
        let item = arrayList[itemIndex];
        // let key = Object.keys(item)[0];
        // let items = item[key];
        let key = Object.keys(item)[0];
        let keyId = item[Object.keys(item)[1]];
        let items = item[key];

        let tableData1 = isMultiwishlistTrue ? `<tr class="wf-multi-Wish-heading">
                            <td class="wf-multi-Wish-content">
                                <span class="wg-arrow-up" onclick="toggleWishlistBox('${key.replace(/'/g, "\\'")}')"></span>
                                <h3 data-key="${key}">${key}</h3>
                                <span class="edit-main-icon" onclick="editWishlistName(event, '${key.replace(/'/g, "\\'")}')">
                                    <span class="editWish"></span>
                                </span>

                                <div class="editWishDiv">
                                    <div class="editWishDivInner">
                                        <input type="text" class="editInput" placeholder="Enter wishlist name" value="${key}">
                                        <div onclick="saveEditWishlistName(event, '${key.replace(/'/g, "\\'")}')" class="check-icon-main">
                                            <div class="check-multiwishlist-icon"></div>
                                        </div>
                                        <div onclick="closeEditWishlistName(event, '${key.replace(/'/g, "\\'")}')" class="close-icon-main">
                                            <div class="close-multiwishlist-icon"></div>
                                        </div>
                                    </div>
                                    <p class="errorPara">Please enter name*</p>
                                </div>
                            </td>
                            <td class="single-wishist">
                                <span class="delete-main-icon" onclick="deleteWishlist(event, '${key.replace(/'/g, "\\'")}')">
                                    <span class="deleteWish"></span>
                                </span>
                                <span class="delete-main-icon" onclick="shareSingleWishlist(event, '${keyId}')">
                                    <div class="img_test"><span></span></div>
                                </span>
                            </td>
                        </tr>` : "";

        tableBody.insertAdjacentHTML("beforeend", tableData1);

        document.querySelectorAll('.wf-multi-Wish-heading').forEach((element) => {
            element.classList.add('disabledArrow'); // Add a 'disabled' class (you can style it in CSS)
            element.style.pointerEvents = 'none'; // Disable pointer events
            element.style.opacity = '0.5'; // Optionally, reduce opacity to indicate it's disabled
        });

        if (items.length === 0) {
            let emptyRow = `<tr class="drawer-row wf-empty-multiwishlist" data-key="${key}">
                                <td><h4 class="drawer-cart-empty">${customLanguage.noMoreItem}</h4>
                                <a class="a-main" href="${`${wfGetDomain}${generalSetting?.continueShoppingLink}` || `${wfGetDomain}collections/all`}">
                                    <div class="cartButtonStyle">${customLanguage?.addProductButtonText || storeFrontDefLang?.addProductButtonText}</div>
                                </a></td>
                            </tr>`;

            tableBody.insertAdjacentHTML("beforeend", emptyRow);
            continue;
        }

        tableBody.insertAdjacentHTML("beforeend", `<tr class="wg-loader-row"><td colspan="2"><div class="loader-css"><span></span></div></td></tr>`);

        const promises = items.map(async (data, itemIndex1) => {
            const loadingItemsCount = `<div class="btn-flex endbtn">
                                        <div class="db-div" >
                                            <div class="cartButtonStyle">
                                             ${storeFrontDefLang?.loadingItemCount} ${itemIndex1}/${items.length}
                                            </div>
                                        </div>
                                    </div>`
            document.querySelectorAll(".drawer-button-div").forEach(div => div.innerHTML = loadingItemsCount);

            let response;
            let jsonData;
            let foundVariant;
            let hasTag = false;
            let variantResponse = null;
            let variantDataResponse;

            if (isVariantWishlistTrue === true) {
                variantResponse = await fetch(`${wfGetDomain}products/${data.handle}.js`);
                if (variantResponse.status !== 404) {
                    variantDataResponse = await variantResponse?.json();
                }
            }
            try {
                try {
                    let productUrl = `${wfGetDomain}products/${data.handle}.js`;
                    let pageUrl = `${wfGetDomain}pages/${data.variant_id}786.js`;
                    if (permanentDomain === 'l-a-girl-cosmetics.myshopify.com') {
                        // Special case: custom page variant
                        response = await fetch(pageUrl);
                        if (response.status !== 404) {
                            foundVariant = await response.json();
                        }
                    }
                    else {
                        // If permanent domain is '00b979.myshopify.com'
                        response = await fetch(productUrl);
                        if (response.status !== 404) {
                            jsonData = await response.json();
                            foundVariant = jsonData.variants.find(v => Number(v.id) === Number(data.variant_id));
                            hasTag = jsonData?.tags?.includes("wg_pdp") || false;
                        }
                    }
                } catch (finalError) {
                    console.error("Error fetching product/variant/page data:", finalError);
                }
                if (response.ok) {
                    const variantArray = [
                        foundVariant?.option1,
                        foundVariant?.option2,
                        foundVariant?.option3,
                    ]?.filter((option) => option && option !== "Default Title");
                    let actualPrice = foundVariant?.compare_at_price
                        ? changeMoney(foundVariant?.compare_at_price)
                        : null;
                    const salePrice = changeMoney(foundVariant?.price);
                    let currentNewPrice =
                        foundVariant?.compare_at_price &&
                            foundVariant?.compare_at_price > foundVariant?.price
                            ? `
                            <div class="wf-sale-price">${actualPrice}</div> 
                            <div class="wf-discount-price">${salePrice}</div>
                            <span class="Polaris-Sale-Text--root Polaris-Text--bodySm">
                                ${customLanguage.saleText ||
                            storeFrontDefLang.saleText
                            }
                            </span>`
                            : salePrice;

                    const modifiedString = data.title
                        .replace(/'/g, "/wg-sgl")
                        .replace(/"/g, "/wg-dbl");

                    const variantNAME = currentPlan >= 4 ? foundVariant?.name : data.title;
                    const variantData =
                        variantArray.length > 0 ? variantArray.join(" / ") : "";
                    const priceToDb =
                        foundVariant?.compare_at_price &&
                            foundVariant?.compare_at_price > foundVariant?.price
                            ? foundVariant?.price
                            : foundVariant?.compare_at_price || foundVariant?.price;
                    // const parsedProductOption = data?.product_option ? JSON.parse(data.product_option) : null;
                    let parsedProductOption = null;
                    try {
                        if (data?.product_option) {
                            parsedProductOption = JSON.parse(data.product_option);
                        }
                    } catch (error) {
                        console.error("Failed to parse product_option:", error);
                        parsedProductOption = null;
                    }
                    const productOptionString = data?.product_option ? data.product_option.replace(/"/g, '&quot;') : '';

                    return `<tr class='drawer-row' data-key="${key}">
                                <td class="drawer-product-image"><a href="${wfGetDomain}products/${data.handle
                        }?variant=${data.variant_id}"><img src="${data.image
                        }" height="auto" width="100px" alt='${variantNAME}' /></a></td>
                                <td>
                                    
                                <h3>
                            <a class="drawer-anchor" style="color: ${modalDrawerTextColor} !important;" href="${wfGetDomain}products/${data.handle}?variant=${data.variant_id}">
                                ${(variantNAME && variantNAME.includes("(")) ? variantNAME.replace(/\((.*?)\)/, `</span><br><span class="wg-2">$1</span>`).replace(/^/, '<span class="wg-1">') : `<span>${variantNAME}</span>`}
                            </a>
                        </h3>

                         ${(isVariantWishlistTrue === true && isMoveToCart) ? "" :
                            `<p class="product-selected-variants">${variantData}</p>`}

                            <div class="btn-flex addbtn">

                    ${(data.price === null || data.price === "" || data.price === "null") ? "" :
                            isPrice
                                ? `<div class="product-option-price">${currentNewPrice}</div>`
                                : ""
                        }

                    ${(data.price === null || data.price === "" || data.price === "null") ? "" : isQuantity
                            ? `<div class='quantity-div'>
                                            ${customLanguage.quantityText ||
                            "Quantity"
                            }
                                            ${foundVariant?.available === true
                                ? `
                                            <div class="quantity-minus-plus">
                                                <div class="quant-minus" onClick="updateQuantity(event, ${data.product_id}, ${data.wishlist_id})">-</div>
                                                <input 
                                        type="text" 
                                        class="quant-update" 
                                        value="${data.quantity}" 
                                        data-quant="${data.quantity}" 
                                        min="1"
                                        name="quantity_${data.product_id}_${data.wishlist_id}"
                                        id="quantity_${data.product_id}_${data.wishlist_id}"
                                        onChange="updateQuantity(event, ${data.product_id}, ${data.wishlist_id})"
                                    />
                                                <div class="quant-plus" onClick="updateQuantity(event, ${data.product_id}, ${data.wishlist_id})">+</div>
                                            </div>`
                                : `<div class="quantity-minus-plus drawerDisableClass">
                                                <div class="drawerDisableClass">-</div>
                                                <span class="drawerDisableClass" data-quant="${data.quantity}">${data.quantity}</span>
                                                <div class="drawerDisableClass">+</div>
                                            </div>`
                            }
                                        </div>`
                            : ""
                        }

                        

                    ${(isVariantWishlistTrue === true && isMoveToCart) &&
                            variantDataResponse ? `
                        <div class="wfq-select-box" data-id="${btoa(variantDataResponse.variantId)}">
                            ${variantDataResponse.options.map((attribute, selectIndex) => `
                                <div class="wfq-option-select" data-option${selectIndex}="${btoa(attribute.values.find(value => variantDataResponse.variants.includes(value)) ? attribute.values.find(value => variantDataResponse.variants.includes(value)).toLowerCase() : '')}" >
                                    ${attribute.values.length === 1
                                    ? ``
                                    : `<select name="${attribute.name.toLowerCase()}"
                                        id="${attribute.name.toLowerCase()}"
                                        onChange="wfqChangeSelect(event, ${selectIndex}, '${variantDataResponse.handle}', this.value, '${variantData}', ${itemIndex1}, '${key.replace(/'/g, "\\'")}', ${data.wishlist_id}, ${data.id})">
                                        <option value="" disabled selected>${attribute.name}</option>
                                        ${attribute.values.map(value => {
                                        return `
                                            <option value="${value}" ${foundVariant?.options[selectIndex] === value ? 'selected' : ''}>
                                                ${value}
                                            </option>
                                        `}).join("")}
                                    </select>`}
                                </div>
                            `).join("")}
                        </div>
                    ` : ""
                        }

                        ${(currentPlan >= 4 && parsedProductOption) ?
                            `<div class="wg-product-option">
                             <p>${Object.values(parsedProductOption).join(' / ')}</p>
                         </div>`
                            : ""
                        }

                    ${(data.price === null || data.price === "" || data.price === "null") ? "" :
                            isMoveToCart
                                ? `<div class="movecart-button">
                            ${foundVariant?.available
                                    ? hasTag
                                        ? `<div id="viewItem${data.variant_id}" class="cartButtonStyle" onClick="viewItem('${data.handle}')">
                                        View Item
                                      </div>`
                                        : `<div id="addItemToCart${data.variant_id}" class="cartButtonStyle" onClick="addToCartWf(event, ${data.variant_id}, ${data.wishlist_id}, ${data.product_id}, '${modifiedString}', ${priceToDb}, '${data.image}', '${data.handle}', '${itemIndex1}', ${productOptionString})">
                                        ${customLanguage.addToCart}
                                      </div>`
                                    : `<div class="cartButtonStyle wg-out-of-stock" style="cursor: not-allowed; opacity: 0.8">
                                    ${customLanguage.outofStock}
                                  </div>`
                                }
                          </div>`
                                : ""
                        }

                    ${isMultiwishlistTrue
                            ? `<div class="main-drawer-copy-icon copy-drawer-multi-icon" onClick="copyItem(${data.product_id}, ${data.variant_id}, '${data.handle}', '${data.price}', '${data.image}', '${data.title}', '${data.quantity}', '${key.replace(/'/g, "\\'")}')"></div>`
                            : ""
                        }

                    <div onClick="removeItem(${data.product_id
                        }, ${data.variant_id}, ${data.wishlist_id
                        },'${data.handle}')" class="deleteIconStyle deleteICON"></div>
                                </td>
                    </tr>`;
                } else if (response.status === 404 || response === null) {
                    return `<tr class='drawer-row'>
                        <td class="drawer-product-image"><a><img src="${data.image
                        }" height="auto" width="100px" alt='${data.title
                        }' /></a></td>
                        <td>
                            <h3>${(permanentDomain === 'l-a-girl-cosmetics.myshopify.com') ?
                            ` ${data?.title?.split("~")[0]} <span>${data?.title?.split("~")[1]}</span>` :
                            `${data?.title}`
                        }
                            </h3>
                            <div><div class="cartButtonStyle" style="cursor: not-allowed; opacity: 0.8">${customLanguage.productNotAvailableText ||
                        "Product not available"
                        }</div></div>
                            <div onClick="removeItem(${data.product_id}, ${data.variant_id
                        }, ${data.wishlist_id},'${data.handle
                        }')" class="deleteIconStyle deleteICON"></div>
                        </td>
                    </tr>`;
                } else {
                    return `<div class="wishlist-grid1">
                    <span>Something is wrong with this product</span>
                </div>`;
                }
            } catch (error) {
                console.error(`Error fetching data for ${data.variant_id}:`, error);
            }
        })

        const htmlRows = await Promise.all(promises);
        const existingLoaderRow = tableBody.querySelector(".wg-loader-row");
        if (existingLoaderRow) existingLoaderRow.remove();
        // htmlRows.forEach(html => {
        tableBody.insertAdjacentHTML("beforeend", htmlRows.join(""));
        // });
    }

    document.querySelectorAll(".drawer-button-div").forEach(div => div.innerHTML = ``);
    drawerButtonDiv();
    currentPlan >= 2 && fxnAfterItemsLoadedOfWishlist();
    document.querySelectorAll('.wf-multi-Wish-heading').forEach((element) => {
        element.classList.remove('disabledArrow'); // Remove the 'disabled' class
        element.style.pointerEvents = ''; // Re-enable pointer events
        element.style.opacity = ''; // Reset opacity
    });
}

async function drawerButtonDiv() {
    const { isMoveToCart } = await showButtons();
    const totalObjects = await getCount(allWishlistData);
    const shouldRender = isMultiwishlistTrue ? allWishlistData.length > 0 : totalObjects > 0;

    const buttonContent = `
        <div class="btn-flex endbtn">
            ${shouldRender ? `
                <div class="db-div wg-clearwishlist">
                    <div onclick="clearAllWishlist()" class="cartButtonStyle addAllToCartButton">
                        ${customLanguage.clearAllWishlist || storeFrontDefLang.clearAllWishlist}
                    </div>
                </div>
            ` : ""}
            ${isMoveToCart && totalObjects > 0 ? `
                <div class="db-div wg-addalltocart">
                    <div onclick="addAllToCart()" class="cartButtonStyle addAllToCartButton">
                        ${customLanguage.addAllToCart}
                    </div>
                </div>
            ` : ""}
            ${isMoveToCart ?
            `<div class="db-div wg-viewcart">
                <a style="text-decoration: none;" href="${wfGetDomain}cart">
                    <div class="cartButtonStyle">${customLanguage.viewCart}</div>
                </a>
            </div>` : ""}

             ${(generalSetting.shareWishlistToAdmin === "yes" && currentPlan >= 4) ?
            `<div class="vcb-width wg-share-to-admin">
                    <div onclick="shareWishlistToAdmin()" class="cartButtonStyle addAllToCartButton">
                        ${customLanguage?.shareToAdminButton || storeFrontDefLang?.shareToAdminButton || "Share wishlist to admin"}
                    </div>
                </div>` : ""}

        </div>`;
    document.querySelectorAll(".drawer-button-div").forEach(div => div.innerHTML = buttonContent);
}

async function modalButtonFxn() {
    const { isMoveToCart } = await showButtons();
    const totalObjects = await getCount(allWishlistData);
    const shouldRender = isMultiwishlistTrue ? allWishlistData.length > 0 : totalObjects > 0;

    //  ${shouldRender ? `
    //                 <div class="vcb-width wg-clearwishlist">
    //                     <div onclick="clearAllWishlist()" class="cartButtonStyle addAllToCartButton">
    //                         ${customLanguage.clearAllWishlist || storeFrontDefLang.clearAllWishlist}
    //                     </div>  
    //                 </div>
    //             ` : ""}


    const buttonContent = `
        <div class="modal-button-div">
            ${isMoveToCart && totalObjects > 0 ? `
                <div class="vcb-width wg-addalltocart">
                    <div onclick="addAllToCart()" class="cartButtonStyle addAllToCartButton">
                        ${customLanguage.addAllToCart}
                    </div>
                </div>
            ` : ""}
            ${isMoveToCart ?
            `<div class="vcb-width wg-viewcart">
                <a style="text-decoration: none;" href="${wfGetDomain}cart">
                    <div class="cartButtonStyle">${customLanguage.viewCart}</div>
                </a>
            </div>`: ""}

            ${(generalSetting.shareWishlistToAdmin === "yes" && currentPlan >= 4) ?
            `<div class="vcb-width wg-share-to-admin">
                    <div onclick="shareWishlistToAdmin()" class="cartButtonStyle addAllToCartButton">
                        ${customLanguage?.shareToAdminButton || storeFrontDefLang?.shareToAdminButton || "Share wishlist to admin"}
                    </div>
                </div>` : ""}

                ${(permanentDomain === "b2b-botane.myshopify.com") ?
            `<button id="downloadAllProductsButton" class="wg-download-csv"> <span class="download-csv-icon"></span> Download Complete Masterdata</button>` : ""}

        </div>`;

    document.querySelectorAll(".modal-button-div").forEach(div => div.innerHTML = buttonContent);
}

function wgDownloadCsv() {
    if (currentPlan >= 4) {
        const data = allWishlistData;
        let allItems = [];
        data.forEach(obj => {
            Object.entries(obj).forEach(([key, val]) => {
                if (Array.isArray(val)) {
                    val.forEach(item => {
                        allItems.push({
                            wishlist_name: key,
                            title: item.title,
                            product_id: item.product_id,
                            variant_id: item.variant_id,
                            handle: item.handle,
                            price: item.price,
                            quantity: item.quantity,
                            image: item.image,
                            product_option: item.product_option,
                            created_at: item.created_at,
                        });
                    });
                }
            });
        });
        // Create custom event
        const wfDownloadCsvEvent = new CustomEvent("WgWishlistCsvDownload", {
            detail: { data: allItems },
            cancelable: true
        });
        // Dispatch the event
        window.dispatchEvent(wfDownloadCsvEvent);

        // Fallback only if listener did not call preventDefault()
        if (!wfDownloadCsvEvent.defaultPrevented) {
            const csvContent = arrayToCSV(allItems);
            downloadCSV(csvContent, "Wishlist-Guru.csv");
        }
    }
}

function arrayToCSV(arr) {
    const headers = Object.keys(arr[0]).join(",");
    const rows = arr.map(obj => Object.values(obj).join(","));
    return [headers, ...rows].join("\n");
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

async function shareWishlistToAdmin() {
    shareModal.style.display = "block";
    shareModalContent.style.display = "block";
    shareModalContent.innerHTML = `<div class="loader-css" ><span> </span></div>`;

    let createForm = "";

    try {
        const response = await fetch(`${serverURL}/share-wishlist-to-admin`, {
            body: JSON.stringify({
                shopName: permanentDomain,
                // wfGetDomain: wfGetDomain,
                // normalDomain: `https://${shopDomain}/`,
            }),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error("Network response was not ok " + response.statusText);
        }
        const data = await response.json();
        if (data.msg === "get_data" && data.data.length !== 0 && data.data[0].form !== "") {

            let getForm = data?.data[0]?.form;
            let ffff = replaceFormValues(getForm);
            createForm = ffff;
            shareWishlistToAdminEmail = data?.data[0].shop_email;
        } else {
            createForm = `<form id="swtadmin-form" class="swtadmin-form" >
      <label>${storeFrontDefLang?.swtaYourName} <i class="redAstrik">*</i><br>
        <input type="text" id="wgSenderName" name="wgSenderName" required>
      </label>
      <label>${storeFrontDefLang?.swtaYourEmail} <i class="redAstrik">*</i><br>
        <input type="text" name="mail" required>
      </label>
      <label>${storeFrontDefLang?.swtaYourPhone} <br>
        <input type="text" name="phone">
      </label>

      <label>${storeFrontDefLang?.swtaYourMessage} <br>
        <textarea name="message" rows="4" id="shareWishlistMessage"></textarea>
      </label>
      <div id="error-message" style="color: red;"></div>
      <br><button type="button" onclick="getFormData()" class="cartButtonStyle">${storeFrontDefLang?.swtaButton}</button>
    </form>`
            shareWishlistToAdminEmail = data?.data[0]?.shop_email || "";

        }
    } catch (error) {
        console.error("Error fetching theme data:", error);
    }


    // ---------inject the form into element------------
    shareModalContent.innerHTML = `<h3>${storeFrontDefLang?.swtaHeading}</h3>
    <div class="closeByShareModal" aria-hidden="true"  onclick="closeShareModal()"></div>
        ${createForm}
    `

}

function replaceFormValues(str) {
    return str
        .replace("${storeFrontDefLang?.swtaYourName}", storeFrontDefLang?.swtaYourName || "Your name")
        .replace("${storeFrontDefLang?.swtaYourEmail}", storeFrontDefLang?.swtaYourEmail || "Your mail address")
        .replace("${storeFrontDefLang?.swtaYourPhone}", storeFrontDefLang?.swtaYourPhone || "Your phone number")
        .replace("${storeFrontDefLang?.swtaDateTime}", storeFrontDefLang?.swtaDateTime || "Date of your event")
        .replace("${storeFrontDefLang?.AddressPostalCode}", storeFrontDefLang?.AddressPostalCode || "Your address (Including Postal Code)")
        .replace("${storeFrontDefLang?.swtaYourMessage}", storeFrontDefLang?.swtaYourMessage || "Message")
        .replace("${storeFrontDefLang?.swtaButton}", storeFrontDefLang?.swtaButton || "SEND")
        .replace("${storeFrontDefLang?.swtaShareDelivery}", storeFrontDefLang?.swtaShareDelivery || "Do you need a delivery?")
        .replace("${storeFrontDefLang?.swtaYes}", storeFrontDefLang?.swtaYes || "Yes")
        .replace("${storeFrontDefLang?.swtaNo}", storeFrontDefLang?.swtaNo || "No")
        .replace("${storeFrontDefLang?.swtaPlace}", storeFrontDefLang?.swtaPlace || "Place");
}

async function getFormData() {
    const form = document.getElementById('swtadmin-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Check for empty fields
    // const emptyFields = Object.entries(data).filter(([key, value]) => !value.trim());
    // const requiredFields = Array.from(form.elements).filter(el => el.hasAttribute('required'));
    // const emptyFields = requiredFields.filter(el => !el.value.trim());

    const requiredFields = Array.from(form.elements).filter(el => el.hasAttribute('required'));
    let hasEmptyFields = false;
    for (const field of requiredFields) {
        if (field.type === 'radio') {
            // For radio inputs, only check one per group (by name)
            const group = form.querySelectorAll(`input[type="radio"][name="${field.name}"]`);
            const isChecked = Array.from(group).some(radio => radio.checked);
            if (!isChecked) {
                hasEmptyFields = true;
                break;
            }
        } else {
            if (!field.value.trim()) {
                hasEmptyFields = true;
                break;
            }
        }
    }

    if (hasEmptyFields) {
        document.getElementById("error-message").innerText = storeFrontDefLang?.allFieldsRequired || "All required fields must be filled!";
        return;
    }

    // if (emptyFields.length > 0) {
    //     document.getElementById("error-message").innerText = "All fields are required!";
    //     return; // Stop execution if there are empty fields
    // }

    // console.log('Form Data %% : ', data);

    // let wishlistTextEditors = await replaceTokens(generalSetting.wishlistTextEditor, "reciever", data);
    // let wishlistSubject = await replaceTokens(generalSetting.wishlistShareEmailSubject, "subject");

    // let wishlistTextEditors = await replaceTokens(generalSetting.shareWishlistToAdminTextEditor, "reciever", data);
    // let wishlistSubject = await replaceTokens(generalSetting.shareWishlistToAdminSubject, "subject");


    let wishlistTextEditors, wishlistSubject;

    if (generalSetting.shareWishlistToAdminTextEditor && generalSetting.shareWishlistToAdminSubject) {
        wishlistTextEditors = await replaceTokens(generalSetting.shareWishlistToAdminTextEditor, "reciever", data);
        wishlistSubject = await replaceTokens(generalSetting.shareWishlistToAdminSubject, "subject");
    } else {
        wishlistTextEditors = await replaceTokens(generalSetting.wishlistTextEditor, "reciever", data);
        wishlistSubject = await replaceTokens(generalSetting.wishlistShareEmailSubject, "subject");
    }

    try {
        const userData = await fetch(`${serverURL}/share-wishlist-by-mail`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "wg-api-key": getWgApiKey(),
            },
            body: JSON.stringify({
                customerEmail: shareWishlistToAdminEmail,
                customerMessage: "",
                wishlistShareSubject: wishlistSubject,
                wishlistTextEditor: wishlistTextEditors,
                shopName: permanentDomain,
            }),
        });

        let result = await userData.json();
        if (result?.error === "Invalid token") {
            alert("Your session has expired or the token is invalid. Please refresh the page.")
        } else {
            if (userData.status === 200) {
                const res = await getIdToShareWishlist();
                await Conversion("email", atob(res), "noReload");
                shareModalContent.style.display = "none";
                setTimeout(() => {
                    closeShareModal();
                    successDiv.style.display = "none";
                }, 3000);
                successDiv.style.display = "block";
            }
        }
    } catch (error) {
        console.log("errr ", error);
    }
}

/** SHARED WISHLIST FUNCTIONS **/
async function sharedPageFunction() {
    let params = (new URL(document.location)).searchParams;
    let sharedId = params.get("id");
    const sharedName = params.get("name");
    let selectedWishlist = params.get("list");
    let selectedID = params.get("wid");

    if (selectedID === "") {
        document.querySelector(".show-shared-wishlist").innerHTML = "Wrong url or id is missing from the url. No item is available to show";
        return;
    }

    if (selectedWishlist) {
        selectedWishlist = selectedWishlist.replaceAll("%20", " ");
        hideArrow = selectedWishlist;
    }

    // const sharedIdProp = atob(sharedId);
    let sharedIdProp = "";
    try {
        sharedIdProp = atob(sharedId);
    } catch (error) {
        document.querySelector(".show-shared-wishlist").innerHTML = "Wrong url or the wrong id in the url";
        return;
    }

    // const dcryptedSharedName = atob(sharedName);
    let dcryptedSharedName = "";
    try {
        dcryptedSharedName = atob(sharedName);
    } catch (error) {
        document.querySelector(".show-shared-wishlist").innerHTML = "Wrong url or the wrong id in the url.";
        return;
    }

    await Conversion(dcryptedSharedName, sharedIdProp, "reload");
    let allData = await getSharedWishlistData(sharedId);

    // --------add the heading of page---------
    document.querySelector(".modal-heading").innerHTML = customLanguage?.modalHeadingText || storeFrontDefLang?.modalHeadingText;

    // --------- add wishlist description-------
    addWishlistDescription();

    // const arrayList = isMultiwishlistTrue
    //     ? allData
    //     : getWishlistByKey(allData, "favourites");

    // const arrayList = isMultiwishlistTrue
    //     ? selectedWishlist === null ? allData :
    //         getWishlistByKey(allData, selectedWishlist)
    //     : getWishlistByKey(allData, "favourites");

    const arrayList = isMultiwishlistTrue ?
        selectedID ? getFirstKeyArrayById(allData, selectedID) :
            selectedWishlist ? getWishlistByKey(allData, selectedWishlist) :
                allData :
        getWishlistByKey(allData, "favourites")

    if (arrayList.length === 0) {
        document.querySelector(".show-shared-wishlist").innerHTML = "Wrong url or the wrong or mismatched id in the url.";
        return;
    }
    await renderMultiSharedModalContent(arrayList, sharedIdProp)
};



// function getFirstKeyArrayById(array, id) {
//     id = Number(id);
//     const item = array.find(obj => obj.id === id);
//     if (!item) return null;
//     const keys = Object.keys(item).filter(key => key !== 'id');
//     return item[keys[0]] || null;
// }

function getFirstKeyArrayById(array, id) {
    id = Number(id);
    const found = array.find(obj => obj.id === id);
    return found ? [found] : [];
}



async function renderMultiSharedModalContent(arrayList, sharedId) {
    if (currentPlan > 1) {
        let poweredByText = document.querySelectorAll(".powered-by-text");
        for (let wf = 0; wf < poweredByText.length; wf++) {
            poweredByText[wf].innerHTML = "";
        }
    }
    renderViewAs();
    const { isPrice, isQuantity, isMoveToCart } = await showButtons();

    document.querySelector(".show-shared-wishlist").innerHTML = `<div class="loader-css" ><span></span></div>`;

    document.querySelector(".wishlist-page-main.page-width").style.color = modalDrawerTextColor;
    // document.querySelector(".wishlist-page-main.page-width").style.textAlign = generalSetting.wlTextAlign;

    const headingElement = document.querySelector(".shared-page-heading");
    if (headingElement) {
        headingElement.innerHTML = `${customLanguage.sharedPageHeading}`;
        headingElement.style.textAlign = generalSetting.wlTextAlign;
        headingElement.style.color = modalDrawerTextColor;
    }

    if (!customerEmail) {
        if ((generalSetting?.hideLoginText === false || generalSetting?.hideLoginText === undefined || generalSetting?.hideLoginText === "")) {
            document.querySelector(".shared-page-auth").innerHTML = `${customLanguage?.loginTextForWishlist || storeFrontDefLang.loginTextForWishlist} <a href ="/account">${customLanguage?.loginTextAnchor || storeFrontDefLang?.loginTextAnchor}</a> ${customLanguage?.orText || storeFrontDefLang?.loginTextAnchor} <a href="/account/register"> ${customLanguage?.createAccountAnchor || customLanguage?.createAccountAnchor}</a> ${customLanguage?.createAccountEndingText || ""}`;
        }
        document.querySelector(".shared-page-auth").style.textAlign = generalSetting.wlTextAlign;
        document.querySelector(".shared-page-auth").style.color = modalDrawerTextColor;
    }

    document.querySelectorAll(`.gridText`).forEach((el) => el.innerHTML = `${customLanguage.textForGridIcon}`);

    let gridCount = localStorage.getItem("grid-count") || "4";
    localStorage.setItem("grid-count", gridCount);
    document.querySelectorAll(`.grid${gridCount}`).forEach((el) => el.classList.add("wf-active-grid-focus"));

    // buttonStyleFxn();
    const wishlistData = await getDataFromSql()
    const addNewClass = `wishlist-modal-${gridCount}`;

    // if (arrayList.length === 0) {
    //     document.querySelector(".show-shared-wishlist").innerHTML = "There is item or the wrong url";
    //     return;
    // }


    let wishlistBody = `<div class="wishlist-modal-all">`;

    for (let itemIndex = 0; itemIndex < arrayList.length; itemIndex++) {
        let item = arrayList[itemIndex];
        let key = Object.keys(item)[0];
        let items = item[key];

        wishlistBody += isMultiwishlistTrue ? `<div class="wf-multi-Wish-heading">
                          <div class="wf-multi-Wish-content">
                         ${hideArrow === "" ? `<span class="wg-arrow-up" onclick="toggleWishlistBox('${key.replace(/'/g, "\\'")}')"></span>` : ``}
                            <span data-key="${key}">${key}</span> 
                          </div>
                      </div>` : "";

        if (items.length === 0) {
            wishlistBody += `<div class="wishlist-modal-box wf-empty-multiwishlist" data-key="${key}">
                              <h4 class="drawer-cart-empty">${customLanguage.noMoreItem}</h4>
                              <a class="a-main" href="${`${wfGetDomain}${generalSetting?.continueShoppingLink}` || `${wfGetDomain}collections/all`}">
                                  <div class="cartButtonStyle">${customLanguage?.addProductButtonText || storeFrontDefLang?.addProductButtonText}</div>
                              </a>
                          </div>`;
            continue;
        }

        wishlistBody += `<div class="wishlist-modal-box ${addNewClass}" data-key="${key}">`


        let promises = items.map(async (data, itemIndex) => {
            let response;
            let jsonData;
            let foundVariant;
            let hasTag = false;

            if (permanentDomain === 'l-a-girl-cosmetics.myshopify.com') {
                response = await fetch(`${wfGetDomain}pages/${data.variant_id}786.js`);
            }
            // else if (permanentDomain !== '00b979.myshopify.com') {
            //     response = await fetch(`${wfGetDomain}variants/${data.variant_id}.js`);
            //     if (response.status !== 404) {
            //         foundVariant = await response?.json();
            //     }
            // } 
            else {
                response = await fetch(`${wfGetDomain}products/${data.handle}.js`);
                if (response.status !== 404) {
                    jsonData = await response.json();
                    foundVariant = jsonData.variants.find(v => Number(v.id) === Number(data.variant_id));
                    hasTag = jsonData?.tags?.includes("wg_pdp") || false;
                }
            }

            if (response.ok) {
                const variantArray = [
                    foundVariant?.option1,
                    foundVariant?.option2,
                    foundVariant?.option3,
                ]?.filter((option) => option && option !== "Default Title");

                let actualPrice = foundVariant?.compare_at_price
                    ? changeMoney(foundVariant?.compare_at_price)
                    : null;
                const salePrice = changeMoney(foundVariant?.price);

                function wfGetImage() {
                    let imageUrl = isVariantWishlistTrue === true && currentPlan >= 4 ? foundVariant?.featured_image !== null ? foundVariant?.featured_image?.src : jsonData?.featured_image : jsonData?.featured_image

                    if (!imageUrl) return "";

                    const separator = imageUrl?.includes("?") ? "&" : "?";
                    return `${imageUrl}${separator}width=600`;

                }

                let currentNewPrice = foundVariant?.compare_at_price && foundVariant?.compare_at_price > foundVariant?.price
                    ? ` <div class="wf-sale-price">${actualPrice}</div> 
              <div class="wf-discount-price">${salePrice}</div>
              <span style="${collectionBtnSetting.iconPosition === "icon-top-left" ? "margin-left: 70%" : ""
                    }" class="Polaris-Sale-Text--root Polaris-Text--bodySm">
                  ${customLanguage.saleText || storeFrontDefLang.saleText}
              </span>`
                    : salePrice;

                const modifiedString = data.title
                    ?.replace(/'/g, "/wg-sgl")
                    ?.replace(/"/g, "/wg-dbl");

                const variantNAME = permanentDomain === 'l-a-girl-cosmetics.myshopify.com' ? data.title : currentPlan >= 4 ? foundVariant?.name : data.title;
                const variantData = variantArray.length > 0 ? variantArray.join(" / ") : "";
                const priceToDb = foundVariant?.compare_at_price && foundVariant?.compare_at_price > foundVariant?.price
                    ? foundVariant?.price
                    : foundVariant?.compare_at_price || foundVariant?.price;

                wishlistBody += `
              <div class="wishlist-grid1">
                <div class="modal-product-image ${wfGetImage() === null ? "for-default" : ""}">
                  <a href="${wfGetDomain}products/${data.handle}?variant=${data.variant_id}">
                   ${wfGetImage() === null ? `<div class="default-image"><span></span></div>` : `<img src="${wfGetImage()?.startsWith('//') ? `https:${wfGetImage()}` : wfGetImage()}" alt="${variantNAME}" height="auto" width="100%" />`}
                  </a>
                </div>

                <div class="product-content-sec">
                  <h3 class="title11">
                    <a href="${wfGetDomain}products/${data.handle}?variant=${data.variant_id}">
                      ${(variantNAME && variantNAME.includes("(")) ? variantNAME.replace(/\((.*?)\)/, `</span><br><span class="wg-2">$1</span>`).replace(/^/, '<span class="wg-1">') : `<span>${variantNAME}</span>`}
                    </a>
                  </h3>
                <p class="product-selected-variants" style="color: ${modalDrawerTextColor};">${variantData}</p>

            ${(data.price === null || data.price === "" || data.price === "null") ? "" :
                        isPrice
                            ? `<div class="product-option-price">${currentNewPrice}</div>`
                            : ""
                    }

                    ${(data.price === null || data.price === "" || data.price === "null") ? "" : isQuantity
                        ? `<div class='quantity-div'>
                    ${foundVariant?.available
                            ? `<div class="quantity-minus-plus">
                      <div class="quant-minus" onClick="updateQuantity(event, ${data.product_id}, ${data.wishlist_id})">-</div>
                      <input 
                                        type="text" 
                                        class="quant-update" 
                                        value="${data.quantity}" 
                                        data-quant="${data.quantity}" 
                                        min="1"
                                        name="quantity_${data.product_id}_${data.wishlist_id}"
                                        id="quantity_${data.product_id}_${data.wishlist_id}"
                                        onChange="updateQuantity(event, ${data.product_id}, ${data.wishlist_id})"
                                    />
                      <div class="quant-plus" onClick="updateQuantity(event, ${data.product_id}, ${data.wishlist_id})">+</div>
                    </div>`
                            : `<div class="quantity-minus-plus drawerDisableClass">
                      <div class="drawerDisableClass">-</div>
                      <span class="drawerDisableClass" data-quant="${data.quantity}">${data.quantity}</span>
                      <div class="drawerDisableClass">+</div>
                    </div>`
                        }
              </div>`
                        : ""
                    }

            ${(data.price === null || data.price === "" || data.price === "null") ? "" :
                        isMoveToCart
                            ? `<div class="movecart-button">
                            ${foundVariant?.available
                                ? hasTag
                                    ? `<div id="viewItem${itemIndex}" class="cartButtonStyle" onClick="viewItem('${data.handle}')">
                                        View Item
                                      </div>`
                                    : `<div id="addItemToCart${itemIndex}" class="cartButtonStyle" onClick="addToCartWf(event, ${data.variant_id}, ${data.wishlist_id}, ${data.product_id}, '${modifiedString}', ${priceToDb}, '${data.image}', '${data.handle}')">
                                        ${customLanguage.addToMyCart}
                                      </div>`
                                : `<div class="cartButtonStyle wg-out-of-stock" style="cursor: not-allowed; opacity: 0.8">
                                    ${customLanguage.outofStock}
                                  </div>`
                            }
                          </div>`
                            : ""
                    }

            ${generalSetting.buttonTypeShareWishlist === "asIcon"
                        ? `<div class="sharedIconDiv" data-sql_data = ${data.product_id} onClick="addToMyWishlist(event, ${data.product_id}, ${data.variant_id}, '${data.handle}', ${priceToDb}, '${data.image}', '${modifiedString}', '${data.quantity}', ${sharedId})"></div>`
                        : `<div class='cartButtonStyle deleteButtonDown' data-sql_data = ${data.product_id} onClick="addToMyWishlist(event, ${data.product_id}, ${data.variant_id}, '${data.handle}', ${priceToDb}, '${data.image}', '${modifiedString}', '${data.quantity}', ${sharedId})">
                <div class='inside-button-div'>${customLanguage.addToMyWishlist}</div>
              </div>`
                    }
            </div>
        </div>`
            } else {
                let imgg = await checkImage(data.image) || "";

                // console.log("imgg --- ", imgg)
                //              <div class="modal-product-image">
                //     <a><img src="${data.image.startsWith('//') ? `https:${data.image}` : data.image}" alt="${data.title
                //         }" height="auto" width="100%" /></a>
                // </div>


                wishlistBody += `<div class="wishlist-grid1">
           
                ${imgg === "" ? `<div class="modal-product-image default-image"><span></span></div>` :
                        `<div class="modal-product-image"><img src="${data.image}"  alt="${data.title}" height="auto" width="100%" /></div>`}

            <div class="product-content-sec">
                <h3 class="title11">
                ${(permanentDomain === 'l-a-girl-cosmetics.myshopify.com') ?
                        ` ${data?.title?.split("~")[0]} <br> <span>${data?.title?.split("~")[1]}</span>` :
                        `${data?.title}`
                    }
                </h3>
                <div class="movecart-button">
                    <div class="cartButtonStyle" style="cursor: not-allowed; opacity: 0.8">${customLanguage.productNotAvailableText ||
                    "Product not available"
                    }</div></div></div>
                     </div>`
            }
        })

        // ✅ Use Promise.all to execute all fetch calls concurrently
        await Promise.all(promises);




        // for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        //     let data = items[itemIndex];

        //     let response;
        //     let jsonData;
        //     let foundVariant;
        //     let hasTag = false;


        //     if (permanentDomain === 'l-a-girl-cosmetics.myshopify.com') {
        //         response = await fetch(`${wfGetDomain}pages/${data.variant_id}786.js`);
        //         // foundVariant = await response.json();
        //     } else if (permanentDomain !== '00b979.myshopify.com') {
        //         response = await fetch(`${wfGetDomain}variants/${data.variant_id}.js`);
        //         if (response.status !== 404) {
        //             foundVariant = await response?.json();
        //         }
        //         // foundVariant = await response.json();
        //     } else {
        //         response = await fetch(`${wfGetDomain}products/${data.handle}.js`);
        //         if (response.status !== 404) {
        //             jsonData = await response.json();
        //             foundVariant = jsonData.variants.find(v => Number(v.id) === Number(data.variant_id));
        //             hasTag = jsonData?.tags?.includes("wg_pdp") || false;
        //         }
        //     }

        //     // const response = await fetch(`${wfGetDomain}variants/${data.variant_id}.js`);
        //     // const response = await fetch(`${wfGetDomain}products/${data.handle}.js`);
        //     if (response.ok) {
        //         // const jsonData = await response.json();
        //         // const foundVariant = jsonData.variants.find(v => Number(v.id) === Number(data.variant_id));
        //         // const hasTag = jsonData.tags?.includes("wg_pdp") || false;
        //         // const foundVariant = await response.json();
        //         const variantArray = [
        //             foundVariant?.option1,
        //             foundVariant?.option2,
        //             foundVariant?.option3,
        //         ]?.filter((option) => option && option !== "Default Title");

        //         let actualPrice = foundVariant?.compare_at_price
        //             ? changeMoney(foundVariant?.compare_at_price)
        //             : null;
        //         const salePrice = changeMoney(foundVariant?.price);

        //         let currentNewPrice = foundVariant?.compare_at_price && foundVariant?.compare_at_price > foundVariant?.price
        //             ? ` <div class="wf-sale-price">${actualPrice}</div> 
        //       <div class="wf-discount-price">${salePrice}</div>
        //       <span style="${collectionBtnSetting.iconPosition === "icon-top-left" ? "margin-left: 70%" : ""
        //             }" class="Polaris-Sale-Text--root Polaris-Text--bodySm">
        //           ${customLanguage.saleText || storeFrontDefLang.saleText}
        //       </span>`
        //             : salePrice;

        //         const modifiedString = data.title
        //             ?.replace(/'/g, "/wg-sgl")
        //             ?.replace(/"/g, "/wg-dbl");


        //         const variantNAME = permanentDomain === 'l-a-girl-cosmetics.myshopify.com' ? data.title : currentPlan >= 4 ? foundVariant?.name : data.title;
        //         const variantData = variantArray.length > 0 ? variantArray.join(" / ") : "";
        //         const priceToDb = foundVariant?.compare_at_price && foundVariant?.compare_at_price > foundVariant?.price
        //             ? foundVariant?.price
        //             : foundVariant?.compare_at_price || foundVariant?.price;

        //         wishlistBody += `
        //       <div class="wishlist-grid1">
        //         <div class="modal-product-image">
        //           <a href="${wfGetDomain}products/${data.handle}?variant=${data.variant_id}">
        //             <img src="${data.image}" alt="${variantNAME}" height="auto" width="100%" />
        //           </a>
        //         </div>

        //         <div class="product-content-sec">
        //           <h3 class="title11">
        //             <a href="${wfGetDomain}products/${data.handle}?variant=${data.variant_id}">
        //               <b></b> ${variantNAME}
        //             </a>
        //           </h3>
        //         <p class="product-selected-variants" style="color: ${modalDrawerTextColor}; text-align: ${generalSetting.wlTextAlign}">${variantData}</p>

        //     ${(data.price === null || data.price === "" || data.price === "null") ? "" :
        //                 isPrice
        //                     ? `<div class="product-option-price">${currentNewPrice}</div>`
        //                     : ""
        //             }

        //             ${(data.price === null || data.price === "" || data.price === "null") ? "" : isQuantity
        //                 ? `<div class='quantity-div'>
        //             ${customLanguage.quantityText || "Quantity"}
        //             ${foundVariant?.available
        //                     ? `<div class="quantity-minus-plus">
        //               <div class="quant-minus" onClick="updateQuantity(event, ${data.product_id}, ${data.wishlist_id})">-</div>
        //               <span class="quant-update" data-quant="${data.quantity}">${data.quantity}</span>
        //               <div class="quant-plus" onClick="updateQuantity(event, ${data.product_id}, ${data.wishlist_id})">+</div>
        //             </div>`
        //                     : `<div class="quantity-minus-plus drawerDisableClass">
        //               <div class="drawerDisableClass">-</div>
        //               <span class="drawerDisableClass" data-quant="${data.quantity}">${data.quantity}</span>
        //               <div class="drawerDisableClass">+</div>
        //             </div>`
        //                 }
        //       </div>`
        //                 : ""
        //             }

        //     ${(data.price === null || data.price === "" || data.price === "null") ? "" :
        //                 isMoveToCart
        //                     ? `<div class="movecart-button">
        //                     ${foundVariant?.available
        //                         ? hasTag
        //                             ? `<div id="viewItem${itemIndex}" class="cartButtonStyle" onClick="viewItem('${data.handle}')">
        //                                 View Item
        //                               </div>`
        //                             : `<div id="addItemToCart${itemIndex}" class="cartButtonStyle" onClick="addToCartWf(event, ${data.variant_id}, ${data.wishlist_id}, ${data.product_id}, '${modifiedString}', ${priceToDb}, '${data.image}', '${data.handle}')">
        //                                 ${customLanguage.addToMyCart}
        //                               </div>`
        //                         : `<div class="cartButtonStyle" style="cursor: not-allowed; opacity: 0.8">
        //                             ${customLanguage.outofStock}
        //                           </div>`
        //                     }
        //                   </div>`
        //                     : ""
        //             }

        //     ${generalSetting.buttonTypeShareWishlist === "asIcon"
        //                 ? `<div class="sharedIconDiv" data-sql_data = ${data.product_id} onClick="addToMyWishlist(event, ${data.product_id}, ${data.variant_id}, '${data.handle}', ${priceToDb}, '${data.image}', '${modifiedString}', '${data.quantity}', ${sharedId})"></div>`
        //                 : `<div class='cartButtonStyle deleteButtonDown' data-sql_data = ${data.product_id} onClick="addToMyWishlist(event, ${data.product_id}, ${data.variant_id}, '${data.handle}', ${priceToDb}, '${data.image}', '${modifiedString}', '${data.quantity}', ${sharedId})">
        //         <div class='inside-button-div'>${customLanguage.addToMyWishlist}</div>
        //       </div>`
        //             }
        //     </div>
        // </div>`
        //     } else {
        //         wishlistBody += `<div class="wishlist-grid1">
        //     <div class="modal-product-image">
        //         <a><img src="${data.image}" alt="${data.title
        //             }" height="auto" width="100%" /></a>
        //     </div>
        //     <div class="product-content-sec">
        //         <h3 class="title11">
        //         ${(permanentDomain === 'l-a-girl-cosmetics.myshopify.com') ?
        //                 ` ${data?.title?.split("~")[0]} <br> <span>${data?.title?.split("~")[1]}</span>` :
        //                 `${data?.title}`
        //             }
        //         </h3>



        //         <div class="movecart-button">
        //             <div class="cartButtonStyle" style="cursor: not-allowed; opacity: 0.8">${customLanguage.productNotAvailableText ||
        //             "Product not available"
        //             }</div></div></div>
        // </div>`
        //     }
        // }


        wishlistBody += `</div>`
    }

    // -----------la girl quantity---------
    // ${(permanentDomain === 'l-a-girl-cosmetics.myshopify.com') ?
    //     `<div class="quantity-minus-plus drawerDisableClass">
    //   <div class="drawerDisableClass">-</div>
    //   <span class="drawerDisableClass" data-quant="${data.quantity}">${data.quantity}</span>
    //   <div class="drawerDisableClass">+</div>
    // </div>` : ""}


    wishlistBody += "</div>";
    document.querySelector(".show-shared-wishlist").innerHTML = wishlistBody;
    currentPlan >= 2 && fxnAfterItemsLoadedOfWishlist();

    const iconPosition = await checkIconPostion();

    let imgHeight = 10;
    if (iconPosition.checkClassExist === true) {
        const getImage = document.querySelectorAll(".modal-product-image");
        getImage.forEach((element) => {
            let imgElement = element.parentNode.querySelector("img");
            if (imgElement) {
                imgHeight = imgElement.height - Number(iconPosition.iconHeight) - 5;
            }
        });
    }
    const sharedIconDiv = document.querySelectorAll(".sharedIconDiv");

    sharedIconDiv.forEach(async function (div) {
        const sqlData = div.getAttribute('data-sql_data');
        const matchingItem = await checkFound(wishlistData, parseInt(sqlData))
        div.classList.add(iconPosition.iconPosition)

        if (matchingItem) {
            const updateWishlistIconCollection = `<div class="collection_icon_new_selected" style="${iconPosition.checkClassExist === true ? `top: ${imgHeight}px;` : ''}"><div style="filter: ${colIconSelectedColor}; ${collectionIconSize()}" class="${iconPosition.iconStyle}"><span class="span-hearticon"></span></div></div>`

            div.innerHTML = updateWishlistIconCollection;
        } else {
            const updateWishlistIconCollection = `<div class="collection_icon_new" style="${iconPosition.checkClassExist === true ? `top: ${imgHeight}px;` : ''}"><div style="filter: ${colIconDefaultColor}; ${collectionIconSize()}" class="${iconPosition.iconStyle}"><span class="span-hearticon"></span></div></div>`
            div.innerHTML = updateWishlistIconCollection;
        }
    });

    styleFxnForApp(".wishlist-page-main h3.title11", "aligncolor");
    styleFxnForApp(".wishlist-page-main p.product-selected-variants", "aligncolor");
    styleFxnForApp(".wishlist-page-main .product-option-price", "aligncolor");
    styleFxnForApp(".wishlist-page-main.quantity-div", "aligncolor");

}

async function addToMyWishlist(
    event,
    product_id,
    variant_id,
    handle,
    price,
    image,
    title,
    quantity,
    sharedId
) {
    // console.log(event.target.innerHTML);
    event.target.innerHTML = storeFrontDefLang?.loadingText;
    const { accessToken, accessEmail } = await getCurrentLoginFxnForSharedPage();
    const dataToSend = {
        shopName: permanentDomain,
        guestToken: accessToken,
        customerEmail: accessEmail,
        shopDomain: shopDomain,
    };

    // Fetch wishlist data and check if the item is already present
    let wishlistDataInSql = await getDataFromSql(dataToSend);
    const matchFound = await checkFound(wishlistDataInSql, parseInt(product_id));

    const bodyData = {
        shopName: permanentDomain,
        plan: currentPlan,
        guestToken: accessToken,
        customerEmail: accessEmail,
        productId: product_id,
        variantId: variant_id,
        price: price,
        handle: handle,
        title: title,
        image: image,
        quantity: quantity,
        language: wfGetDomain,
        permission: "dont_remove",
        referral_id: sharedId
    };

    if (isMultiwishlistTrue && !matchFound) {
        renderPopupLoader()
        if (wishlistDataInSql.length === 0 || !matchFound) {
            openMultiWishlist(bodyData, product_id, "shared");
            event.target.innerHTML = customLanguage.sharedPageItemAdded;
            event.target.classList.add("added");
        } else {
            alertToast(`${customLanguage.sharedPageAlreadyAdded}`);
            event.target.innerHTML = customLanguage.sharedPageAlreadyAdded;
            event.target.classList.add("already-added");
        }
    } else {
        if (!matchFound) {
            bodyData.wishlistName = ["favourites"];
            saveSharedWishlist(bodyData);
            event.target.innerHTML = customLanguage.sharedPageItemAdded;
            event.target.classList.add("added");
        } else {
            alertToast(`${customLanguage.sharedPageAlreadyAdded}`);
            event.target.innerHTML = customLanguage.sharedPageAlreadyAdded;
            event.target.classList.add("already-added");
        }
    }
}

async function saveSharedWishlist(data) {
    try {
        const userData = await fetch(`${serverURL}/create-user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                shopName: data.shopName,
                plan: data.plan,
                guestToken: data.guestToken,
                customerEmail: data.customerEmail,
                productId: data.productId,
                variantId: data.variantId,
                price: data.price,
                handle: data.handle,
                title: data.title,
                image: data.image,
                quantity: data.quantity,
                language: data.language,
                storeName: wf_shopName,
                wishlistName: data.wishlistName,
                permission: data.permission,
                referral_id: data.referral_id,
                wfGetDomain: wfGetDomain
            }),
        })


        let result = await userData.json();
        if (result.msg === "item updated" && result.isAdded === "yes") {
            await showCountAll();
            alertToast(`${customLanguage.sharedPageItemAdded}`);
            await renderAddToWishlistIcon(data.productId);
        } else if (result.msg === "already added") {
            alertToast(`${customLanguage.sharedPageAlreadyAdded}`);
        }
        if (result.msg === "limit cross") {
            alertContent(customLanguage?.quotaLimitAlert || "Wishlist Quota of this store reached its monthly limit, We have notified store owner to upgrade their plan. Sorry for the inconvenience");
        }
    } catch (error) {
        console.log("errr ", error)
    }
}


async function renderAddToWishlistIcon(product_id) {
    const sharedIconDivs = document.querySelectorAll('.sharedIconDiv');
    // console.log("sharedIconDivs", sharedIconDivs)
    let updateWishlistIconCollection;
    const iconPosition = await checkIconPostion();
    let imgHeight = 10;
    let indexOfDiv;

    if (iconPosition.checkClassExist === true) {
        const getImage = document.querySelectorAll(".modal-product-image");
        getImage.forEach((element) => {
            let imgElement = element.parentNode.querySelector("img");
            if (imgElement) {
                imgHeight = imgElement.height - Number(iconPosition.iconHeight) - 5;
            }
        });
    }
    const matchFound = await checkFound(allWishlistData, parseInt(product_id))

    if (allWishlistData.length > 0 && matchFound) {
        updateWishlistIconCollection = `<div style-"position:relative; z-index: 10;"><div class="collection_icon_new_selected ${iconPosition.iconPosition
            }" style="${iconPosition.checkClassExist === true ? `top: ${imgHeight}px;` : ""
            }"><div style="filter: ${colIconSelectedColor}; ${collectionIconSize()}" class="${iconPosition.iconStyle
            }"><span class="span-hearticon"></span></div></div></div>`;
    } else {
        updateWishlistIconCollection = `<div style-"position:relative; z-index: 10;"><div class="collection_icon_new ${iconPosition.iconPosition
            }" style="${iconPosition.checkClassExist === true ? `top: ${imgHeight}px;` : ""
            }"><div style="filter: ${colIconDefaultColor}; ${collectionIconSize()}" class="${iconPosition.iconStyle
            }"><span class="span-hearticon"></span></div></div></div>`;
    }
    sharedIconDivs.forEach(function (div, index) {
        const sqlData = div.getAttribute('data-sql_data');
        if (parseInt(sqlData) === parseInt(product_id)) {
            indexOfDiv = index
        }
    });

    sharedIconDivs[indexOfDiv].innerHTML = updateWishlistIconCollection;
}


/**REMOVE ITEM **/
async function removeItem(
    product_id,
    variant_id,
    user_id,
    handle,
    showAlert = true
) {
    let selectedWf = document.querySelectorAll(".wf-wishlist-collection-icon");
    let data = null;
    if (selectedWf.length > 0) {
        for (let wf = 0; wf < selectedWf.length; wf++) {
            let selectedIds = selectedWf[wf].getAttribute("data-productid");
            if (Number(selectedIds) === Number(product_id)) {
                data = wf;
                break;
            }
        }
    }

    const getCurrentLogin = await getCurrentLoginFxn();

    try {
        const userData = await fetch(`${serverURL}/delete-item`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "wg-api-key": getWgApiKey(),
                "wg-user-id": user_id
                // "wg-mail": localStorage.getItem("customer-email")
            },
            body: JSON.stringify({
                productId: product_id,
                variantId: variant_id,
                // userId: user_id,
                shopName: permanentDomain,
                customerEmail: getCurrentLogin,
                plan: currentPlan,
                storeName: wf_shopName,
                specificVariant: isVariantWishlistTrue || null
            }),
        });

        let result = await userData.json();
        // console.log("ERRRORR ", result)

        if (result?.error === "Invalid token") {
            alert("Your session has expired or the token is invalid. Please refresh the page.")
        }

        if (result.msg === "item updated") {
            isMultiwishlistTrue && renderLoader();
            await showCountAll();

            createFilterOptionInStructure();

            showAlert === true && !isMultiwishlistTrue && alertToast(`${customLanguage.alertForRemoveButton}`);

            const arrayList = isMultiwishlistTrue
                ? allWishlistData
                : await getWishlistByKey(allWishlistData, "favourites");


            let renderFn;
            if (window.location.href === 'https://wishlist-guru.myshopify.com/') {
                renderFn = () => renderMultiModalContentFxn(arrayList);
                renderDrawerContentFxn();
            } else {
                renderFn = generalSetting.wishlistDisplay === "drawer"
                    ? () => renderDrawerContentFxn()
                    : () => renderMultiModalContentFxn(arrayList);
            }


            // const renderFn = generalSetting.wishlistDisplay === "drawer"
            //     ? () => renderDrawerContentFxn()
            //     : () => renderMultiModalContentFxn(arrayList);

            await renderFn();
            shareWishlistFXN();
            modalButtonFxn();
            drawerButtonDiv();

            sessionStorage.setItem("wishId", JSON.stringify(arrayList));
            const matchFound = await checkFound(allWishlistData, product_id);

            (currentPlan >= 2) && await checkCollectionCounterData(product_id, !matchFound && "remove");
            (currentPlan >= 2) && await checkCounterData(product_id, !matchFound && "remove");

            const mainWishlistDiv = document.getElementById("wishlist-guru");
            const proId = injectCoderr.getAttribute("data-product-id");

            if (mainWishlistDiv) {
                if (Number(proId) === Number(product_id)) {
                    matchFound ? alreadyInWishlist() : addToWishList();
                }
            }

            collectionIcon(product_id, matchFound);
            customIconAddedRemoveToWishlist(product_id, matchFound);
            buttonAddedRemoveWishlist(product_id, matchFound);
            injectButtonAddedRemoveWishlist(product_id, matchFound);

            // ------for la girls drawer------
            customIconAddedRemoveToWishlistLaGirl(product_id, matchFound)

            currentPlan >= 2 && fxnAfterRemoveFromWishlist();
            (currentPlan >= 3 && generalSetting?.trendingLayout) && await renderTrendingGridData();

        }
    } catch (error) {
        console.log("errr ", error);
    }
}


async function refreshCart() {
    let updatedCartData;

    if (getThemeName.themeName === "Combine") {
        document.dispatchEvent(new Event("dispatch:sidebar-drawer:open", { detail: { opener: true } }));
        const response = await fetch(window.Shopify.routes.root);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseText = await response.text();
        const wgHtml = new DOMParser().parseFromString(responseText, 'text/html');
        const newCartDrawer = wgHtml.querySelector('#AjaxCartForm');
        const cartSubtotalInnerHTML = wgHtml.getElementById('AjaxCartSubtotal').innerHTML;
        const cartItems = document.getElementById('AjaxCartForm');
        cartItems.innerHTML = newCartDrawer.innerHTML;
        cartItems.ajaxifyCartItems();
        document.querySelectorAll('[data-header-cart-count]').forEach(elm => {
            elm.textContent = cartItems.querySelector('[data-cart-count]').textContent;
        });
        document.querySelectorAll('[data-header-cart-total').forEach(elm => {
            elm.textContent = cartItems.querySelector('[data-cart-total]').textContent;
        });
        document.getElementById('AjaxCartSubtotal').innerHTML = cartSubtotalInnerHTML;
        document.querySelector('#AjaxCartSubtotal .cart__total').classList.add('visible');
        document.getElementById('site-cart-sidebar').show();
        document.querySelector('#site-cart-sidebar [data-js-close]').focus();

        updatedCartData = {
            subtotal: cartSubtotalInnerHTML,
            itemCount: cartItems.querySelector('[data-cart-count]')?.textContent || 0,
            totalPrice: cartItems.querySelector('[data-cart-total]')?.textContent || '',
            html: newCartDrawer.innerHTML
        };

    }
    else if (getThemeName.themeName === "Concept") {

        let cartDrawer = document.querySelector('#CartDrawer');
        const countBubble = document.querySelector('.cart-drawer-button');
        const cartItems = document.querySelector('.drawer__inner');
        try {
            const response = await fetch(window.Shopify.routes.root);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const responseText = await response.text();
            const wgHtml = new DOMParser().parseFromString(responseText, 'text/html');
            const newCountBubble = wgHtml.querySelector('.cart-drawer-button');
            const newCartDrawer = wgHtml.querySelector('#CartDrawer');
            const newCartItems = wgHtml.querySelector('.drawer__inner');
            if (cartDrawer && newCartDrawer) {
                cartDrawer.replaceWith(newCartDrawer);
                cartDrawer = document.querySelector('#CartDrawer');
            }
            if (cartItems && newCartItems) {
                cartItems.innerHTML = newCartItems.innerHTML;
            }
            if (countBubble && newCountBubble) {
                countBubble.innerHTML = newCountBubble.innerHTML;
            }
            if (cartDrawer) {
                if (typeof cartDrawer.show === 'function') {
                    cartDrawer.show();
                } else {
                    cartDrawer.classList.add('is-open');
                }
            }

        } catch (error) {
            console.error('Error updating cart drawer:', error);
        }

    }
    else if (getThemeName.themeName === "Sleek") {
        const cartDrawer = document.querySelector('#CartDrawer');
        const InnerCartDrawer = cartDrawer.querySelector('.drawer__inner .drawer__content');
        const count = document.querySelector('.cart-drawer-button .cart-count');
        const response = await fetch(window.Shopify.routes.root);
        const responseText = await response.text();
        const cartDrawerDoc = new DOMParser().parseFromString(responseText, 'text/html');
        const newCartDrawer = cartDrawerDoc.querySelector('.cart-drawer');
        const newInnerCartDrawer = newCartDrawer.querySelector('.drawer__inner .drawer__content');
        if (cartDrawer && newCartDrawer) {
            InnerCartDrawer.innerHTML = newInnerCartDrawer.innerHTML;
            const newCount = newCartDrawer.querySelector('cart-count');
            if (newCount) {
                count.textContent = newCount.textContent;
                count.removeAttribute('hidden');
            }
            if (FoxTheme?.a11y?.trapFocus) {
                FoxTheme.a11y.trapFocus(cartDrawer);
            }
            cartDrawer.show();
        } else {
            console.error(' cartDrawer or newCartDrawer not found!');
        }
    }
    else if (getThemeName.themeName == "Hyper") {
        const cartDrawer = document.querySelector('#CartDrawer');
        if (!cartDrawer) {
            console.error('CartDrawer not found!');
            return;
        }
        const innerCartDrawer = cartDrawer.querySelector('.drawer__inner .drawer__body.flex-col');
        const cartFooter = cartDrawer.querySelector('.drawer__footer.cart-drawer__footer');
        const count = cartDrawer.querySelector('.cart-count');
        try {
            const response = await fetch(window.Shopify.routes.root);
            const responseText = await response.text();
            const cartDrawerDoc = new DOMParser().parseFromString(responseText, 'text/html');
            const newCartDrawer = cartDrawerDoc.querySelector('.cart-drawer');
            const homeCount = document.querySelector('cart-count.cart-count--absolute');
            if (!newCartDrawer) throw new Error('newCartDrawer not found!');
            const newInnerCartDrawer = newCartDrawer.querySelector('.drawer__inner .drawer__body.flex-col');
            const newCartFooter = newCartDrawer.querySelector('.drawer__footer.cart-drawer__footer');
            const newCount = newCartDrawer.querySelector('.cart-count');
            document.addEventListener("cart:refresh", this.onCartRefreshListener);
            if (innerCartDrawer && newInnerCartDrawer) {
                innerCartDrawer.innerHTML = newInnerCartDrawer.innerHTML;
            }
            if (cartFooter && newCartFooter) {
                cartFooter.innerHTML = newCartFooter.innerHTML;
            }
            if (count && newCount) {
                count.textContent = newCount.textContent;
                count.removeAttribute('hidden');
                if (homeCount && newCount.textContent) {
                    // Remove parentheses but keep the number for homeCount
                    let newString = newCount.textContent.replace(/\((\d+)\)/g, "$1");
                    homeCount.textContent = newString;
                    console.log(newString);
                }
            }
            if (window.FoxTheme?.a11y?.trapFocus) {
                window.FoxTheme.a11y.trapFocus(cartDrawer);
            }
            document.removeEventListener("cart:refresh", this.onCartRefreshListener);
            if (typeof cartDrawer.show === "function") {
                cartDrawer.show();
            }
        } catch (error) {
            console.error('Error refreshing cart drawer:', error);
        }
    }
    else if (getThemeName.themeName == 'Impact') {
        let cartDrawer = document.querySelector('.cart-drawer'); // Use 'let' since we may reassign it after replace
        const countBubble = document.querySelector('.count-bubble');
        const cartItems = document.querySelector('.cart-items'); // Add this if you want to update cart items
        // Fetch the updated DOM from the root route
        const response = await fetch(window.Shopify.routes.root);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const responseText = await response.text();
        const wgHtml = new DOMParser().parseFromString(responseText, 'text/html');
        // Select updated elements from the fetched HTML
        const newCountBubble = wgHtml.querySelector('.count-bubble');
        const newCartDrawer = wgHtml.querySelector('.cart-drawer');
        const newCartItems = wgHtml.querySelector('.cart-items'); // Add this if you want to update cart items
        // Debug output
        // console.log('New Cart Drawer:', newCartDrawer?.innerHTML);
        // console.log('Old Cart Drawer:', cartDrawer?.innerHTML);
        // Replace the entire Cart Drawer if new one exists
        if (cartDrawer && newCartDrawer) {
            cartDrawer.replaceWith(newCartDrawer);
            // Update the reference to the new element in the DOM
            cartDrawer = document.querySelector('.cart-drawer');
        }
        // Update cart items if they exist
        if (cartItems && newCartItems) {
            cartItems.innerHTML = newCartItems.innerHTML;
        } else {
            // console.log('cartItems not found or newCartItems missing');
        }
        // Update cart count bubble if it exists
        if (countBubble && newCountBubble) {
            countBubble.innerHTML = newCountBubble.innerHTML;
        } else {
            // console.log('countBubble not found or newCountBubble missing');
        }
        document.dispatchEvent(new CustomEvent('cart:refreshed'));
        // Show the cart drawer if the method exists
        const cartDrawerComponent = document.querySelector('cart-drawer');
        if (cartDrawerComponent && typeof cartDrawerComponent.show === 'function') {
            cartDrawerComponent.show();
        }
    }
    else if (getThemeName.themeName === 'Agile') {
        const cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer) {
            cartDrawer.style.zIndex = "9999";
        }
        function getSectionsToRender() {
            return [
                {
                    id: "cart-drawer",
                    selector: "#CartDrawer"
                },
                {
                    id: "cart-icon-bubble",

                }
            ];
        }
        const sectionsToRender = getSectionsToRender();
        const sectionIds = sectionsToRender.map((section) => section.id);
        function getSectionInnerHTML(html, selector = ".shopify-section") {
            const doc = new DOMParser().parseFromString(html, "text/html");
            const el = doc.querySelector(selector);
            return el ? el.innerHTML : "";
        }
        function getSectionDOM(html, selector = ".shopify-section") {
            const doc = new DOMParser().parseFromString(html, "text/html");
            return doc.querySelector(selector);
        }
        fetch(`${window.Shopify.routes.root}?sections=${sectionIds.join(",")}`, {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        })
            .then((res) => res.json())
            .then((parsedState) => {
                // console.log(parsedState, "✅ Shopify sections response");
                const drawerInner = cartDrawer.querySelector(".drawer__inner");
                if (drawerInner && drawerInner.classList.contains("is-empty")) {
                    drawerInner.classList.remove("is-empty");
                }

                // Update all sections
                sectionsToRender.forEach((section, index) => {
                    const sectionElement = section.selector
                        ? document.querySelector(section.selector)
                        : document.getElementById(section.id);

                    if (!sectionElement) return;

                    const sectionHTML = parsedState[section.id]; // ✅ FIXED

                    if (sectionHTML) {
                        sectionElement.innerHTML = getSectionInnerHTML(
                            sectionHTML,
                            section.selector
                        );
                    }

                    // Optional upsell block handling
                    const cartRecommend = getSectionDOM(sectionHTML, section.selector)
                        ?.querySelector(".cart-upsell-js.cart-type-select");

                    if (
                        cartRecommend &&
                        cartRecommend.querySelector(".slide-container")?.childElementCount === 0
                    ) {
                        drawerInner?.classList.add("hidden-cart-upsell");
                    }

                    // Sync cart count with mobile nav
                    if (index === 1) {
                        const mobileNavBar = document.querySelector("#cart-icon-bubble-mobile");
                        if (
                            mobileNavBar?.querySelector(".cart-count") &&
                            sectionElement.querySelector(".cart-count")
                        ) {
                            mobileNavBar.querySelector(".cart-count").innerHTML =
                                sectionElement.querySelector(".cart-count").innerHTML;
                        }
                    }
                });

                document.dispatchEvent(new CustomEvent("eurus:cart:items-changed"));
            })
            .catch((err) => console.error("❌ Section fetch error:", err));
        cartDrawer.open();

    }
    else if (getThemeName.themeName == 'Palo Alto') {
        const body = document.body;
        const html = document.documentElement;
        let cartDrawer = document.querySelector('.cart-drawer');
        let e = cartDrawer.querySelector('[data-cart-drawer-template]');
        let cart_drawer = document.querySelector('.cart__toggle');
        if (e) {
            cart_drawer.click();
        }
        let cartItem = cartDrawer.querySelector('.cart__item');
        let cartQuntity = cartDrawer.querySelector('[data-cart-items-qty]');
        let cartDrawerBody = cartDrawer.querySelector('[data-cart-drawer-body]');
        let buttonHolder = cartDrawer.querySelector('[data-foot-holder]');
        let cartHeader = cartDrawer.querySelector('.cart-drawer__head');
        buttonHolder.classList.remove('hidden');
        const response = await fetch(`${window.Shopify.routes.root}?section=cart-drawer`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseText = await response.text();
        const newHTML = new DOMParser().parseFromString(responseText, 'text/html');
        const newCartDrawer = newHTML.querySelector('.cart-drawer');
        let newCartDrawerTemplate = newCartDrawer.querySelector('[data-cart-drawer-template]');
        const newCartQuntity = newCartDrawerTemplate.content.querySelector('[data-cart-items-qty]').innerHTML;
        const newCartDrawerBody = newCartDrawerTemplate.content.querySelector('[data-cart-drawer-body]').innerHTML;
        const newButtonHolder = newCartDrawerTemplate.content.querySelector('[data-foot-holder]').innerHTML;
        cartQuntity.innerHTML = newCartQuntity;
        cartDrawerBody.innerHTML = newCartDrawerBody;
        buttonHolder.innerHTML = newButtonHolder;
        cartDrawer.classList.add('is-open');
        cartQuntity.classList.remove('hidden');
        cartDrawer.classList.remove('cv-h');
        cartHeader.classList.add('aos-animate');

        body.classList.add('js-drawer-open-cart');
        html.setAttribute('data-scroll-locked', 'true');
    }
    else if (getThemeName.themeName == 'Horizon') {
        let cartDrawer = document.querySelector('cart-drawer-component');
        let innerCart = cartDrawer.querySelector('.cart-drawer__inner');
        let cartCount = cartDrawer.querySelector('cart-icon');
        let innerComponent = innerCart.querySelector('cart-items-component');
        let scrollHint = innerCart.querySelector('scroll-hint');
        const response = await fetch(
            `${window.Shopify.routes.root}?section=cart-drawer-component`
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseText = await response.text();
        const newHTML = new DOMParser().parseFromString(responseText, 'text/html');
        let newCartDrawer = newHTML.querySelector('cart-drawer-component');
        let newInnerCart = newCartDrawer.querySelector('.cart-drawer__inner');
        let newInnerComponent = newInnerCart.querySelector('cart-items-component');
        let newScrollHint = newInnerCart.querySelector('scroll-hint');
        let newcartCount = newCartDrawer.querySelector('cart-icon');

        if (newInnerComponent && innerComponent) {
            innerComponent.innerHTML = newInnerComponent.innerHTML;
        }
        if (newScrollHint && scrollHint) {
            scrollHint.innerHTML = newScrollHint.innerHTML;
        }
        if (newcartCount && cartCount) {
            cartCount.innerHTML = newcartCount.innerHTML;
        }
        // cartDrawer.open();
    }
    else if (getThemeName.themeName == 'Broadcast') {
        const cartDrawer = document.querySelector('#cart-drawer');
        const countBubble = document.querySelector('.cart-drawer-button');
        const closeButton = cartDrawer?.querySelector('.drawer__close');
        if (!cartDrawer) {
            console.warn('⚠️ Cart drawer element not found.');
            return;
        }
        try {
            // === Fetch updated cart HTML ===
            const response = await fetch(window.Shopify.routes.root);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const responseText = await response.text();
            const cartDrawerDoc = new DOMParser().parseFromString(responseText, 'text/html');
            // === Get new cart drawer content ===
            const newCartDrawer = cartDrawerDoc.querySelector('.drawer--cart');
            const newInnerCartDrawer = newCartDrawer?.querySelector('.drawer__inner');
            const newCloseButton = newCartDrawer?.querySelector('.drawer__close');
            const newCount = newCartDrawer?.querySelector('.cart__items-count');
            // === Replace inner cart drawer ===
            if (cartDrawer && newInnerCartDrawer) {
                const innerCartDrawer = cartDrawer.querySelector('.drawer__inner');
                if (innerCartDrawer) {
                    innerCartDrawer.innerHTML = newInnerCartDrawer.innerHTML;
                }
            }
            if (closeButton && newCloseButton) {
                document.querySelector('#cart-drawer .drawer__close').replaceWith(closeButton);
            }
            cartDrawer.classList.add('is-open');
            if (cartDrawer.classList.contains('is-empty')) {
                cartDrawer.classList.remove('is-empty');
            }
            cartDrawer.querySelectorAll('.cart-block, .cart__item').forEach((el) => {
                if (!el.classList.contains('is-animated')) {
                    el.classList.add('is-animated');
                }
            });
            if (newCount) {
                const countValue = newCount.textContent.trim();

                document.querySelectorAll('.header__cart__status').forEach(el => {
                    el.textContent = countValue;
                    el.setAttribute('data-cart-count', countValue);
                });
            }
            console.log('🛒 Cart drawer updated successfully.');
        } catch (error) {
            console.error('❌ Error updating cart drawer:', error);
        }
    }
    else if (getThemeName.themeName === 'Symmetry') {
        const cartDrawer = document.querySelector('cart-drawer'); // Adjust selector if needed
        const cartForm = cartDrawer.querySelector('cart-form'); // Adjust selector if needed
        cartForm.classList.add('cart-form--refreshing');
        // document.addEventListener("dispatch:cart-drawer:refresh")
        fetch(`${window.Shopify.routes.root}?section_id=cart-drawer`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then((response) => {
                const frag = document.createDocumentFragment();
                const newContent = document.createElement('div');
                frag.appendChild(newContent);
                newContent.innerHTML = response;
                newContent.querySelectorAll('[data-cc-animate]').forEach((el) => el.removeAttribute('data-cc-animate'));
                theme.mergeNodes(newContent, cartDrawer);
                cartForm.classList.remove('cart-form--refreshing');
                cartForm.querySelectorAll('.merge-item-refreshing').forEach((el) => el.classList.remove('merge-item-refreshing'));
                cartDrawer.dispatchEvent(
                    new CustomEvent('on:cart:after-merge', { bubbles: true, cancelable: false })
                );
                if (
                    theme.settings.afterAddToCart === 'drawer' &&
                    cartDrawer.closest('.drawer') &&
                    !cartDrawer.closest('.drawer').hasAttribute('open')
                ) {
                    document.dispatchEvent(
                        new CustomEvent('theme:open-cart-drawer', { bubbles: true, cancelable: false })
                    );
                }
                const countCart = newContent.querySelector('.cart-drawer__title-count').textContent;
                const drawCount = countCart.replace(/[\[\]\(\)\{\}]/g, "");
                let sideCount = document.querySelector('.cart-link__icon');
                const childDiv = sideCount.querySelector('.cart-link__count');
                if (childDiv) {
                    childDiv.innerHTML = drawCount;
                } else {
                    let countSpan = document.createElement('span');
                    countSpan.classList.add('cart-link__count');
                    countSpan.innerHTML = drawCount;
                    sideCount.appendChild(countSpan);
                }
                document.dispatchEvent(new CustomEvent('dispatch:cart-drawer:refresh'));
                document.dispatchEvent(new CustomEvent('dispatch:cart-drawer:open'));
            })
            .catch((error) => {
                console.error('Fetch error:', error);
            });
    }

    else {
        try {
            // Dispatch event to open cart drawer
            document.dispatchEvent(new Event("dispatch:cart-drawer:open", { detail: { opener: true } }));
            // Fetch the latest cart HTML
            const response = await fetch(window.Shopify.routes.root);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseText = await response.text();
            const wgHtml = new DOMParser().parseFromString(responseText, 'text/html');
            // Select elements from the fetched HTML
            const newCartDrawer = wgHtml.querySelector('.cart-drawer');
            const newCountBubble = wgHtml.querySelector('.wbhcartitem');
            const newPrice = wgHtml.querySelector('.wbcarthtotal strong');
            const newCartDrawerBroadcast = wgHtml.querySelector('cart-drawer cart-items');
            const newCountBubble2 = wgHtml.querySelector('.header__desktop__button cart-count');
            const newCountBubbleMobile = wgHtml.querySelector('.header__mobile__button cart-count');
            const newCountDrawerCount = wgHtml.querySelector('.cart__title cart-count');
            // Select elements from the current document
            // const cartDrawer = document.querySelector('#CartDrawer');
            const cartDrawer = document.querySelector('#CartDrawer') || document.querySelector('#Cart-Drawer');
            const countBubble = document.querySelector('.wbhcartitem');
            const coutPrice = document.querySelector('.wbcarthtotal strong');
            const cartDrawerBroadcast = document.querySelector('cart-drawer cart-items');
            const countBubble2 = document.querySelector('.header__desktop__button cart-count');
            const countBubbleMobile = document.querySelector('.header__mobile__button cart-count');
            const countDrawerCount = document.querySelector('.cart__title cart-count');

            // Check if required elements exist before updating them
            if (!newCartDrawer || !newCountBubble) {
                // console.log('❌ Required elements not found in fetched HTML. Some updates might be missing.');
                return
            }

            // Update cart drawer content
            if (cartDrawer && newCartDrawer) {
                cartDrawer.innerHTML = newCartDrawer.innerHTML;
            } else {
                // console.warn('#CartDrawer not found in the document.');
            }

            // Update cart count display
            if (countDrawerCount && newCountDrawerCount) {
                countDrawerCount.replaceWith(newCountDrawerCount);
            }

            if (countBubble && newCountBubble) {
                countBubble.replaceWith(newCountBubble);
            }

            if (countBubbleMobile && newCountBubbleMobile) {
                countBubbleMobile.replaceWith(newCountBubbleMobile);
            }

            if (countBubble2 && newCountBubble2) {
                countBubble2.replaceWith(newCountBubble2);
            }

            // Update cart total price
            if (coutPrice && newPrice) {
                coutPrice.innerHTML = newPrice.innerHTML;
            } else {
                // console.warn('⚠️ Cart total price not found in the document.');
            }

            // Update cart items
            if (cartDrawerBroadcast && newCartDrawerBroadcast) {
                cartDrawerBroadcast.replaceWith(newCartDrawerBroadcast);
            } else if (cartDrawerBroadcast && newCartDrawerBroadcast) {
                cartDrawerBroadcast.appendChild(newCartDrawerBroadcast);
            } else {
                // console.warn('⚠️ Cart items not found in the document.');
            }

            // Add or remove classes to update UI
            const body = document.body;
            const cartDrawerElement = document.querySelector('cart-drawer');
            const subCartDrawer = document.querySelector('subcart-drawer');

            if (getThemeName.themeName !== 'Reformation' && getThemeName.themeName !== "Eurus") {
                if (body) body.classList.add('overflow-hidden');
            }

            if (cartDrawerElement) {
                cartDrawerElement.classList.add('active', 'animate');
                cartDrawerElement.classList.remove('is-empty');
            } else {
                // console.warn('⚠️ <cart-drawer> not found in the document.');
            }

            if (subCartDrawer) {
                subCartDrawer.classList.add('active');
            } else {
                // console.warn('⚠️ <subcart-drawer> not found in the document.');
            }

        } catch (error) {
            // console.error('🚨 Error fetching or updating cart drawer:', error);
        }
    }

    // -------here we are adding an event to the structure-------
    const wgCartEvent = new CustomEvent('wgAfterCart', {
        detail: { cart: updatedCartData }
    });
    setTimeout(() => {
        document.dispatchEvent(wgCartEvent);
    }, 200);
};

async function addToCartWf(
    event,
    variantId,
    userId,
    productId,
    title,
    price,
    image,
    handle,
    index,
    productOption = null
) {
    const currentHTML = event.target.innerHTML;
    // console.log("currentHTML ", currentHTML);
    event.target.innerHTML = storeFrontDefLang?.loadingText
    // event.target.innerHTML = `<div class="loader-css" ><span> </span></div>`

    let productPrice = (price / 100).toFixed(2);
    const getCartButton = document.getElementById(`addItemToCart${index}`);
    getCartButton && getCartButton.classList.add("quantity_disabled");
    let movecartButton = event.target.parentNode;
    let previousQuantityDiv = movecartButton.previousElementSibling;
    let quantUpdateElement = previousQuantityDiv.querySelector(".quant-update");

    let quantity;
    if (quantUpdateElement) {
        // let quantityText = quantUpdateElement.textContent.trim();
        // quantity = quantityText;
        quantity = Number(quantUpdateElement.value);
    }

    const newVariantId = event.currentTarget.getAttribute("new-variant");
    if (newVariantId !== null) {
        variantId = newVariantId
    }
    if (currentPlan >= 4 && productOption && typeof productOption === 'object' && Object.keys(productOption).length > 0) {
        data = {
            id: variantId,
            quantity: quantity || 1,
            properties: productOption,
        };
    } else {
        data = {
            id: variantId,
            quantity: quantity || 1,
        };
    }

    // data = {
    //     id: variantId,
    //     quantity: quantity || 1,
    // };

    const res = await cartFunction(data);
    if (res.message !== "Cart Error" && res.status !== 422) {
        await refreshCart();

        // const cartData = await fetch("/cart.js").then((response) => response.json());
        // const matchingItem = cartData.items.find(
        //     (dev) => Number(dev.variant_id) === Number(variantId)
        // );

        // const newQuantity = matchingItem !== undefined ? matchingItem.quantity : quantity;

        let cartProduct = {
            variantId: variantId,
            userId: userId,
            productId: productId,
            title: title,
            price: productPrice,
            image: image,
            quantity: quantity || 1,
            wfGetDomain: wfGetDomain
        };

        await addToCartRecord([cartProduct]);

        if (generalSetting.wishlistRemoveData === "yes") {
            removeItem(productId, variantId, userId, handle, false);
            (currentPlan >= 3 && generalSetting?.trendingLayout) && await renderTrendingGridData();
            getCartButton && getCartButton.classList.remove("quantity_disabled");
        }
        // event.target.innerHTML = customLanguage?.addToCart || "Move to Cart";
        event.target.innerHTML = currentHTML;
    } else {
        // event.target.innerHTML = customLanguage?.addToCart || "Move to Cart";
        event.target.innerHTML = currentHTML;
    }
}


async function addToCartRecord(data) {
    try {
        const cartItems = await fetch(`${serverURL}/cart-item-record`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        let result = await cartItems.json();
    } catch (error) {
        console.log("errr ", error);
    }
}

/**ADD ALL TO CART BUTTON **/
async function addAllToCart() {
    document.querySelectorAll('.wg-addalltocart .addAllToCartButton').forEach((el) => {
        el.innerHTML = storeFrontDefLang?.loadingText;
    });
    const parentDiv = document.querySelector(".wg-addalltocart");
    if (parentDiv) {
        parentDiv.style.pointerEvents = "none"; // Disable interactions
        parentDiv.style.opacity = "0.5"; // Make it look disabled
        parentDiv.innerHTML = `<div class="cartButtonStyle addAllToCartButton">${storeFrontDefLang?.loadingText} </div>`;
        // parentDiv.innerHTML = `<div class="cartButtonStyle addAllToCartButton"><div class="loader-css" ><span> </span></div></div>`
    }
    document.querySelectorAll(".show-title").forEach(div => div.innerHTML = `<div class="loader-css" ><span> </span></div>`);
    let tempArray = JSON.parse(JSON.stringify(allWishlistData));
    if (newArrayAfterSelection.length !== 0) {
        tempArray = newArrayAfterSelection
    }

    isMultiwishlistTrue
        ? await renderAllToCart(tempArray)
        : await allToCartFxn(getWishlistByKey(tempArray, "favourites")[0].favourites || [], '')

    isMultiwishlistTrue
        ? renderMultiModalContentFxn(tempArray)
        : renderMultiModalContentFxn(getWishlistByKey(tempArray, "favourites"));

    document.querySelectorAll('.wg-addalltocart .addAllToCartButton').forEach((el) => {
        el.innerHTML = customLanguage?.addAllToCart;
    });
}

async function renderAllToCart(arrayList) {
    const encodedData = JSON.stringify(arrayList);
    closeMultiWishlist();
    getMultiWishlistDiv.style.display = "block";
    let wishlists = "";

    wishlists += `<div class="multiCheckbox"><ul id="dataList">`;
    multiArray.forEach((item, index) => {
        wishlists += `<li>
                    <label for="item-${index}" class="item-${index}">
                        <input type="checkbox" onclick="handleCheckboxClick(event)" id="item-${index}">
                        <p style="margin:0;">${item}</p>
                    </label>
                  </li>`;
    });
    wishlists += `</ul></div>`;

    const clearButton = `<div id="all-to-cart"></div><button class="saveBtn cartButtonStyle" onclick="addAllYesBtn(event)">${customLanguage.addAllToCart || storeFrontDefLang.addAllToCart}</button>`;

    const multiWishlistData = `<div>
            <h3>${customLanguage.addAllToCart || storeFrontDefLang.addAllToCart}</h3>
            ${wishlists}
            ${clearButton}
            <p id=mainErrorPara"></p>
        </div>`;

    document.getElementById("wg-multiWishlistInnerContent").innerHTML = multiWishlistData;
    document.getElementById("all-to-cart").setAttribute("data-addAllToCart", encodedData);
}

async function addAllYesBtn(event) {
    const mainErrorPara = event.target.closest("#wg-multiWishlistInnerContent").querySelector("#mainErrorPara");

    let combinedItems = [];
    let viewItemProducts = [];
    const allData = document.getElementById("all-to-cart").getAttribute('data-addAllToCart')
    const parsedData = JSON.parse(allData);

    if (checkedItems.length > 0) {
        checkedItems.forEach(key => {
            const matchingData = parsedData.find(item => item[key]);
            if (matchingData) {
                matchingData[key].forEach(product => {
                    viewItemProducts.push({ ...product })
                    const existingProduct = combinedItems.find(p => p.product_id === product.product_id);
                    if (existingProduct) {
                        existingProduct.quantity += product.quantity;
                    } else {
                        combinedItems.push({ ...product });
                    }
                });
            }
        });
        getMultiWishlistDiv.style.display = "none";
        checkedItems = []
        await allToCartFxn(combinedItems, viewItemProducts)
    } else {
        mainErrorPara.style.display = "block";
        mainErrorPara.innerHTML = `${storeFrontDefLang.chooseallToCartWish}`;
        return;
    }
}

async function allToCartFxn(allData, viewItemProducts = []) {
    const isBtn = document.querySelector(".addAllToCartButton");
    isBtn && isBtn.classList.add("quantity_disabled");
    if (viewItemProducts.length === 0) {
        viewItemProducts = allData;
    }
    let allToDB = []
    if (allData.length !== 0) {
        let val = [];
        let cartArr = [];

        const product_data = (
            await Promise.all(
                allData.map(async (data) => {
                    // console.log("data ---- ", data)

                    try {
                        const response = await fetch(`${wfGetDomain}products/${data.handle}.js`);
                        if (!response.ok) {
                            throw new Error(
                                `Failed to fetch product data for ${data.handle}`
                            );
                        }
                        const jsonData = await response.json();
                        const hasTag = jsonData.tags?.includes("wg_pdp") || false;
                        const foundVariant = jsonData.variants.find(
                            (variant) => variant.id === Number(data.variant_id)
                        );
                        if (foundVariant && foundVariant?.available && !hasTag) {
                            allToDB.push(data)

                            let productOption = data?.product_option ? JSON.parse(data.product_option) : null
                            if (currentPlan >= 4 && productOption && typeof productOption === 'object' && Object.keys(productOption).length > 0) {
                                val.push({
                                    id: parseInt(data.variant_id),
                                    quantity: data.quantity,
                                    properties: productOption,
                                });
                            } else {
                                val.push({
                                    id: parseInt(data.variant_id),
                                    quantity: data.quantity,
                                });
                            }

                            // val.push({
                            //     id: parseInt(data.variant_id),
                            //     quantity: data.quantity,
                            // });
                            return data;
                        } else {
                            return null;
                        }
                    } catch (error) {
                        console.error(error);
                        return null;
                    }
                })
            )
        ).filter((data) => data !== null);


        // ------- this is the new code to add the items in cart-------------

        // try {
        //     const cartOperations = val.map(async (data) => {
        //         const res = await cartFunction(data, false);
        //         if (res.message !== "Cart Error" && res.status !== 422) {
        //             await refreshCart();
        //             const dataToDb = allToDB.find(item => Number(item.variant_id) === Number(data.id));

        //             if (dataToDb) {
        //                 const promises = [];

        //                 if (generalSetting.wishlistRemoveData === "yes") {
        //                     promises.push(
        //                         removeItem(
        //                             dataToDb.product_id,
        //                             dataToDb.variant_id,
        //                             dataToDb.wishlist_id,
        //                             dataToDb.handle,
        //                             false
        //                         )
        //                     );

        //                     if (currentPlan >= 3 && generalSetting?.trendingLayout) {
        //                         promises.push(renderTrendingGridData());
        //                     }
        //                 }

        //                 cartArr.push({
        //                     variantId: dataToDb.variant_id,
        //                     userId: dataToDb.wishlist_id,
        //                     productId: dataToDb.product_id,
        //                     title: dataToDb.title,
        //                     price: dataToDb.price,
        //                     image: dataToDb.image,
        //                     quantity: dataToDb.quantity,
        //                     wfGetDomain: wfGetDomain
        //                 });

        //                 await Promise.all(promises, addToCartRecord(cartArr)); // Run removeItem and renderTrendingGridData in parallel
        //                 // await addToCartRecord(cartArr);
        //             }
        //         }
        //     });

        //     await Promise.all(cartOperations); // Run all cart operations in parallel

        //     if (isBtn) {
        //         isBtn.classList.remove("quantity_disabled");
        //     }

        //     alertToast(customLanguage.alertAddAllToCart || storeFrontDefLang.alertAddAllToCart);
        // } catch (error) {
        //     console.error("Error processing cart items:", error);
        // }


        await cartFunctionForAllItems(val, false);
        await refreshCart();
        alertToast(customLanguage.alertAddAllToCart || storeFrontDefLang.alertAddAllToCart);

        const parentDiv = document.querySelector(".wg-addalltocart");
        if (parentDiv) {
            parentDiv.style.pointerEvents = "auto"; // Re-enable interactions
            parentDiv.style.opacity = "1"; // Restore normal appearance
            parentDiv.innerHTML = `<div onclick="addAllToCart()" class="cartButtonStyle addAllToCartButton">${customLanguage.addAllToCart}</div>`
        }

        try {
            const cartOperations = val.map(async (data) => {
                // const res = await cartFunction(data, false);
                // if (res.message !== "Cart Error" && res.status !== 422) {
                //     await refreshCart();
                const dataToDb = allToDB.find(item => Number(item.variant_id) === Number(data.id));
                if (dataToDb) {
                    const promises = [];
                    if (generalSetting.wishlistRemoveData === "yes") {
                        promises.push(
                            removeItem(
                                dataToDb.product_id,
                                dataToDb.variant_id,
                                dataToDb.wishlist_id,
                                dataToDb.handle,
                                false
                            )
                        );
                        if (currentPlan >= 3 && generalSetting?.trendingLayout) {
                            promises.push(renderTrendingGridData());
                        }
                    }
                    cartArr.push({
                        variantId: dataToDb.variant_id,
                        userId: dataToDb.wishlist_id,
                        productId: dataToDb.product_id,
                        title: dataToDb.title,
                        price: dataToDb.price,
                        image: dataToDb.image,
                        quantity: dataToDb.quantity,
                        wfGetDomain: wfGetDomain
                    });

                    await Promise.all(promises, addToCartRecord(cartArr)); // Run removeItem and renderTrendingGridData in parallel
                    // await addToCartRecord(cartArr);
                }
                // }
            });
            await Promise.all(cartOperations); // Run all cart operations in parallel
            if (isBtn) {
                isBtn.classList.remove("quantity_disabled");
            }

            if (currentPlan >= 2) {
                fxnAfterAddTocartButton();
            }

            // alertToast(customLanguage.alertAddAllToCart || storeFrontDefLang.alertAddAllToCart);
        } catch (error) {
            console.error("Error processing cart items:", error);
        }



        // try {
        //     for (const data of val) {
        //         // const res = await cartFunction(data, false);
        //         // if (res.message !== "Cart Error" && res.status !== 422) {
        //         // await refreshCart();
        //         const dataToDb = allToDB.find(item => Number(item.variant_id) === Number(data.id));

        //         if (dataToDb) {
        //             if (generalSetting.wishlistRemoveData === "yes") {
        //                 await removeItem(
        //                     dataToDb.product_id,
        //                     dataToDb.variant_id,
        //                     dataToDb.wishlist_id,
        //                     dataToDb.handle,
        //                     false
        //                 );
        //                 (currentPlan >= 3 && generalSetting?.trendingLayout) && await renderTrendingGridData();
        //             }

        //             // const cartData = await fetch("/cart.js").then((response) => response.json());
        //             // const matchingItem = cartData.items.find(
        //             //     (dev) => Number(dev.variant_id) === Number(data.id)
        //             // );

        //             // const newQuantity = matchingItem !== undefined ? matchingItem.quantity : dataToDb.quantity;

        //             cartArr.push({
        //                 variantId: dataToDb.variant_id,
        //                 userId: dataToDb.wishlist_id,
        //                 productId: dataToDb.product_id,
        //                 title: dataToDb.title,
        //                 price: dataToDb.price,
        //                 image: dataToDb.image,
        //                 quantity: dataToDb.quantity,
        //                 wfGetDomain: wfGetDomain
        //             });
        //             await addToCartRecord(cartArr);
        //         }
        //         // }

        //         if (isBtn) {
        //             isBtn.classList.remove("quantity_disabled");
        //         }

        //         // alertToast(
        //         //     customLanguage.alertAddAllToCart || storeFrontDefLang.alertAddAllToCart
        //         // );
        //     }
        //     // alertToast(customLanguage.alertAddAllToCart || storeFrontDefLang.alertAddAllToCart);
        // } catch (error) {
        //     console.error("Error processing cart items:", error);
        // }




    } else {
        alert(`${customLanguage.noMoreItem}...`);
    }
}



async function cartFunctionForAllItems(items, alertValue = true) {
    // console.log("items ---- ", items);
    // console.log("alertValue ---- ", alertValue);
    try {

        // const response = await fetch('/cart/add.js', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ items }) // Send all items in one request
        // });
        // const json = await response.json();

        // if (alertValue) {
        //     if (json.message === "Cart Error" || json.status === 422) {
        //         alertContent(json.description);
        //     } else {
        //         alertToast(`${customLanguage.alertForAddToCartButton}`);
        //     }
        // }



        let data;

        for (const item of items) {
            try {
                const response = await fetch('/cart/add.js', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(item)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    // console.warn(`❌ Item ${item.id} failed: ${errorData.description}`);
                    continue; // Skip to next item
                }
                data = await response.json();
                // console.log(`✅ Item ${item.id} added successfully.`);
            } catch (err) {
                console.error(`❌ Unexpected error for item ${item.id}:`, err.message);
            }
        }



        const cartResponse = await fetch("/cart.js");
        const cartData = await cartResponse.json();

        let cartBubble = document.querySelector(".cart-count-bubble");

        if (cartBubble === null) {
            let cartDiv = document.querySelector(".icon-cart-empty");
            const div = document.createElement("div");
            div.innerHTML = `
                <div class="cart-count-bubble added-by-wishlist-app">
                    <span aria-hidden="true">${cartData.item_count}</span>
                    <span class="visually-hidden">${cartData.item_count} items</span>
                </div>`;

            if (cartDiv) {
                cartDiv.after(div);
            }
        } else {
            let listCount = `
                <span aria-hidden="true">${cartData.item_count}</span>
                <span class="visually-hidden">${cartData.item_count} items</span>`;
            cartBubble.innerHTML = listCount;
        }
        // return json;
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}


async function cartFunction(data, alertValue = true) {
    try {
        const response = await fetch("/cart/add.js", {
            body: JSON.stringify(data),
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "xmlhttprequest",
            },
            method: "POST",
        });

        const json = await response.json();

        if (alertValue) {
            if (json.message === "Cart Error" || json.status === 422) {
                alertContent(json.description);
            } else {
                alertToast(`${customLanguage.alertForAddToCartButton}`);
            }
        }

        const cartResponse = await fetch("/cart.js");
        const cartData = await cartResponse.json();

        let cartBubble = document.querySelector(".cart-count-bubble");

        if (cartBubble === null) {
            let cartDiv = document.querySelector(".icon-cart-empty");
            const div = document.createElement("div");
            div.innerHTML = `
                <div class="cart-count-bubble added-by-wishlist-app">
                    <span aria-hidden="true">${cartData.item_count}</span>
                    <span class="visually-hidden">${cartData.item_count} items</span>
                </div>`;

            if (cartDiv) {
                cartDiv.after(div);
            }
        } else {
            let listCount = `
                <span aria-hidden="true">${cartData.item_count}</span>
                <span class="visually-hidden">${cartData.item_count} items</span>`;
            cartBubble.innerHTML = listCount;
        }

        if (currentPlan >= 2) {
            fxnAfterAddTocartButton();
        }

        return json;
    } catch (err) {
        console.error(err);
        throw err;
    }
}


/**SHORT CODE FOR COLLECTION ---- ICON **/
async function wishlistIcon() {
    // console.log("im original fxn ---but commented--- ")
    const iconPosition = await checkIconPostion();
    if (currentPlan >= 2) {
        const getAllWishlistDiv = document.querySelectorAll(".wf-wishlist");

        const prependPromisesWi = Array.from(getAllWishlistDiv).map(
            async (wishlistDiv) => {
                const selectedId = wishlistDiv.getAttribute("product-id");
                const selectedProductHandle = wishlistDiv.getAttribute("product-handle");
                const selectedVariantId = wishlistDiv.getAttribute("variant-id");

                let addWishlistIcon = document.createElement("div");
                addWishlistIcon.style.zIndex = "10";
                addWishlistIcon.style.position = "relative";

                const { isComboIcon } = checkCollectionIcon();
                const countData = await isCountOrNot(selectedId, isCollectionCount);

                const newCountData = onlyTextButton ? `<div class="wf-product-count">${countData}</div>` : countData;

                const matchFound = await checkFound(allWishlistData, selectedId, selectedVariantId)

                if (allWishlistData.length > 0 && matchFound) {
                    addWishlistIcon.innerHTML = `<div class="collection_icon_new_selected "><div onClick="customCodeButtonClick(event, ${selectedId},'${selectedProductHandle}', '${selectedVariantId}')" style="filter: ${colIconSelectedColor}; ${collectionIconSize()}"  class="icon-collection ${isComboIcon ? iconPosition.iconStyle2 : iconPosition.iconStyle
                        }"></div></div>${isCollectionCount ? newCountData : ""}`;
                } else {
                    addWishlistIcon.innerHTML = `<div class="collection_icon_new "><div style="filter: ${colIconDefaultColor}; ${collectionIconSize()}"  onClick="customCodeButtonClick(event, ${selectedId},'${selectedProductHandle}', '${selectedVariantId}')" class="icon-collection ${iconPosition.iconStyle}"></div></div>${isCollectionCount ? newCountData : ""}`;
                }
                wishlistDiv.innerHTML = addWishlistIcon.innerHTML;

                isCollectionCount && renderCollectionTextColor(matchFound ? "added" : "removed", selectedId, isCollectionCount);
            }
        );

        try {
            await Promise.all(prependPromisesWi);
            const allShow = document.querySelectorAll(".wf-wishlist");
            allShow.forEach((wishlistDiv) => {
                wishlistDiv.style.display = "block";
            });
        } catch (error) {
            console.log("Error occurred:", error);
        }
    }
}

async function wishlistIcon1() {
    const iconPosition = checkIconPostion();
    const { isComboIcon } = checkCollectionIcon();
    const wishlistDivs = document.querySelectorAll(".wf-wishlist");
    for (const wishlistDiv of wishlistDivs) {
        const selectedId = wishlistDiv.getAttribute("product-id");
        const selectedProductHandle = wishlistDiv.getAttribute("product-handle");
        const selectedVariantId = wishlistDiv.getAttribute("variant-id");
        const matchFound = allWishlistData.length > 0 &&
            await checkFound(allWishlistData, selectedId, selectedVariantId);
        const isSelected = Boolean(matchFound);
        const color = isSelected ? colIconSelectedColor : colIconDefaultColor;
        const wrapperClass = isSelected ? "collection_icon_new_selected" : "collection_icon_new";
        const iconStyle = isComboIcon && isSelected ? iconPosition.iconStyle2 : iconPosition.iconStyle;
        wishlistDiv.innerHTML = `
            <div class="${wrapperClass}">
                <div
                    onClick="customCodeButtonClick(event, ${selectedId}, '${selectedProductHandle}', '${selectedVariantId}')"
                    style="filter: ${color}; ${collectionIconSize()}"
                    class="icon-collection ${iconStyle}">
                </div>
            </div>
        `;
    }
}

async function customCodeButtonClick(event, selectedId, getHandle, selectedVariantId) {

    // const now = Date.now();
    // // If the previous click was less than 800ms ago, treat as continuous click
    // if (now - wgLastClickTime < 800) {
    //     console.log("Ignoring continuous click.......");
    //     return;
    // }
    // wgLastClickTime = now;
    // console.log("------------ Clicking custom code collection icon -----------");

    try {
        const buttonClickResponse = await fetch(`${wfGetDomain}products/${getHandle}.js`);
        const buttonClickproductData = await buttonClickResponse.json();

        let variantArr = buttonClickproductData?.variants;

        let saveVariantId = buttonClickproductData.variants[0].id;
        let saveImage = buttonClickproductData?.images[0];
        if (isVariantWishlistTrue === true) {

            const clickedElement = event.target;
            const wishlistDiv = clickedElement.closest('.wf-wishlist')?.getAttribute("variant-id");

            saveVariantId = wishlistDiv ? wishlistDiv : selectedVariantId === "null" ? buttonClickproductData?.variants[0].id : selectedVariantId || buttonClickproductData?.variants[0].id;
            const resultFind = variantArr.find(data => data.id === parseInt(selectedVariantId));
            saveImage = resultFind?.featured_image?.src || buttonClickproductData?.images[0];
        } else {
            saveVariantId = buttonClickproductData.variants[0].id;
            saveImage = buttonClickproductData?.images[0];
        }

        // console.log("Final variant -- ", saveVariantId)


        let buttonClickData = {
            productId: buttonClickproductData.id,
            // variantId: buttonClickproductData.variants[0].id,
            variantId: saveVariantId,
            price: Number(buttonClickproductData.variants[0].price) / 100,
            handle: buttonClickproductData.handle,
            title: buttonClickproductData.title,
            // image: buttonClickproductData.images[0] ? buttonClickproductData.images[0] : "",
            image: saveImage || "",
            quantity: 1,
            language: wfGetDomain,
        };

        const res = await showLoginPopup(selectedId);
        if (res) return;

        const matchFound = await checkFound(allWishlistData, selectedId, saveVariantId)

        // console.log("matchFound", matchFound)

        if (isMultiwishlistTrue) {
            renderPopupLoader()
            if (allWishlistData.length > 0 && matchFound) {
                buttonClickData.isDelete = "yes";
                openMultiWishlist(buttonClickData, selectedId, "customIcon", saveVariantId)
            } else {
                openMultiWishlist(buttonClickData, selectedId, "customIcon", saveVariantId)
            }
        } else {
            buttonClickData.wishlistName = matchFound ? ["wfNotMulti"] : ["favourites"];
            await checkCollectionCounterData(selectedId, !matchFound ? "add" : "remove")
            customIconAddedRemoveToWishlist(selectedId, matchFound ? false : true, saveVariantId)
            saveMainData(buttonClickData, selectedId, "customIcon")
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function customIconAddedRemoveToWishlist(selectedId, matchinOrNot, selectedVariant = null) {
    const iconPosition = await checkIconPostion();
    const { isComboIcon } = checkCollectionIcon();
    const countData = await isCountOrNot(selectedId, isCollectionCount);
    const newCountData = onlyTextButton ? `<div class="wf-product-count">${countData}</div>` : countData;

    const checkCollectionElements = document.querySelectorAll(`.wf-wishlist-collection-icon[product-id='${selectedId}'] .wf-product-count`);

    checkCollectionElements.forEach(element => {
        updateCountElement(element, newCountData);
    });

    let getCustomWishlist = document.querySelectorAll(".wf-wishlist");
    if (getCustomWishlist.length !== 0) {
        const iconArray = Array.from(getCustomWishlist);
        iconArray.forEach((icon, index) => {
            const id = icon.getAttribute("product-id");
            const vid = icon.getAttribute("variant-id");

            if (isVariantWishlistTrue === true && selectedVariant && vid) {
                if ((Number(id) === Number(selectedId)) && (Number(selectedVariant) === Number(vid))) {
                    let productHandle = icon.getAttribute("product-handle");
                    let updateWishlistIcon = `<div class="${matchinOrNot ? "collection_icon_new_selected" : "collection_icon_new"}"><div style="${matchinOrNot ? `filter: ${colIconSelectedColor};` : `filter: ${colIconDefaultColor};`} ${collectionIconSize()} " onClick="customCodeButtonClick(event, ${selectedId}, '${productHandle}', '${selectedVariant}')" class="icon-collection ${isComboIcon && matchinOrNot ? iconPosition.iconStyle2 : iconPosition.iconStyle}"></div></div> ${isCollectionCount ? newCountData : ""}`;
                    getCustomWishlist[index].innerHTML = updateWishlistIcon;
                    isCollectionCount && renderCollectionTextColor(matchinOrNot ? "added" : "removed", selectedId, isCollectionCount);
                }
            } else {
                if (Number(id) === Number(selectedId)) {
                    let productHandle = icon.getAttribute("product-handle");
                    let updateWishlistIcon = `<div class="${matchinOrNot ? "collection_icon_new_selected" : "collection_icon_new"}"><div style="${matchinOrNot ? `filter: ${colIconSelectedColor};` : `filter: ${colIconDefaultColor};`} ${collectionIconSize()} " onClick="customCodeButtonClick(event, ${selectedId}, '${productHandle}')" class="icon-collection ${isComboIcon && matchinOrNot ? iconPosition.iconStyle2 : iconPosition.iconStyle}"></div></div> ${isCollectionCount ? newCountData : ""}`;
                    getCustomWishlist[index].innerHTML = updateWishlistIcon;
                    isCollectionCount && renderCollectionTextColor(matchinOrNot ? "added" : "removed", selectedId, isCollectionCount);
                }
            }

            // if (Number(id) === Number(selectedId)) {
            //     let productHandle = icon.getAttribute("product-handle");
            //     let updateWishlistIcon = `<div class="${matchinOrNot ? "collection_icon_new_selected" : "collection_icon_new"}"><div style="${matchinOrNot ? `filter: ${colIconSelectedColor};` : `filter: ${colIconDefaultColor};`} ${collectionIconSize()} " onClick="customCodeButtonClick(event, ${selectedId}, '${productHandle}')" class="icon-collection ${isComboIcon && matchinOrNot ? iconPosition.iconStyle2 : iconPosition.iconStyle}"></div></div> ${isCollectionCount ? newCountData : ""}`;

            //     getCustomWishlist[index].innerHTML = updateWishlistIcon;

            //     isCollectionCount && renderCollectionTextColor(matchinOrNot ? "added" : "removed", selectedId, isCollectionCount);
            // }
        });
    }
}


/**SHORT CODE FOR COLLECTION ---- BUTTON **/
async function wishlistButtonForCollection() {
    if (currentPlan >= 2) {
        const getAllButtonCollection = document.querySelectorAll(".wf-wishlist-button");
        const prependPromises = [];
        const maxConcurrentRequests = 10; // Limit concurrent requests
        const addToWishlistCache = new Map(); // Cache for addToWishlist API results
        const addedToWishlistCache = new Map(); // Cache for alreadyAddedToWishlist API results
        let activeRequests = 0;

        // Throttling function to manage API requests
        async function throttleApiCall(apiFunction, cache, ...args) {
            const [productId] = args;
            // Return cached result if available
            if (cache.has(productId)) {
                return cache.get(productId);
            }
            // Throttle if active requests hit the limit
            while (activeRequests >= maxConcurrentRequests) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            activeRequests++;
            try {
                const result = await apiFunction(...args);
                cache.set(productId, result); // Cache result by product ID
                return result;
            } finally {
                activeRequests--;
            }
        }

        for (const wishlistButtonDiv of getAllButtonCollection) {
            const selectedId = wishlistButtonDiv.getAttribute("product-id");
            const selectedProductHandle = wishlistButtonDiv.getAttribute("product-handle");
            const selectedVariantId = wishlistButtonDiv.getAttribute("variant-id");
            wishlistButtonDiv.style.width = renderWidth(isCollectionCount);
            let addWishlistButton = document.createElement("div");
            addWishlistButton.style.zIndex = "10";
            addWishlistButton.style.position = "relative";
            // wishlistButtonDiv.style.display = "none";
            // Fetch data with throttling and caching
            const addToWishlistData = await throttleApiCall(renderButtonAddToWishlist, addToWishlistCache, selectedId, isCollectionCount, "load");
            const alreadyAddedToWishlistData = await throttleApiCall(renderButtonAddedToWishlist, addedToWishlistCache, selectedId, isCollectionCount, "load");
            const matchFound = await checkFound(allWishlistData, selectedId, selectedVariantId);
            // Conditionally set inner HTML based on matchFound
            addWishlistButton.innerHTML = matchFound
                ? `<div class="button-collection">${alreadyAddedToWishlistData}</div>`
                : `<div class="button-collection">${addToWishlistData}</div>`;

            wishlistButtonDiv.innerHTML = addWishlistButton.innerHTML;
            // console.log("CCCC -- ", isCollectionCount)
            renderCustomButtonBorder(matchFound ? "added" : "removed", selectedId, isCollectionCount);
            wishlistButtonDiv.onclick = () => {
                buttonColectionClick(selectedId, selectedProductHandle, selectedVariantId);
            };
            prependPromises.push(Promise.resolve());
        }
        await Promise.all(prependPromises);
        document.querySelectorAll(".wf-wishlist-button").forEach((wishlistDiv) => {
            wishlistDiv.style.display = "flex";
        });
        collectionIconSize();
    }
}

async function wishlistButtonForCollection1() {
    if (currentPlan >= 2) {
        const getAllButtonCollection = document.querySelectorAll(".wf-wishlist-button");
        for (const wishlistButtonDiv of getAllButtonCollection) {
            const selectedId = wishlistButtonDiv.getAttribute("product-id");
            // const selectedProductHandle = wishlistButtonDiv.getAttribute("product-handle");
            const selectedVariantId = wishlistButtonDiv.getAttribute("variant-id");
            wishlistButtonDiv.style.width = renderWidth(false);

            let addWishlistButton = document.createElement("div");
            addWishlistButton.style.zIndex = "10";
            addWishlistButton.style.position = "relative";
            wishlistButtonDiv.style.display = "none";
            // Fetch data with throttling and caching
            const addToWishlistData = await renderButtonAddToWishlist(selectedId, false, "load");
            const alreadyAddedToWishlistData = await renderButtonAddedToWishlist(selectedId, false, "load");
            const matchFound = await checkFound(allWishlistData, selectedId, selectedVariantId);
            // Conditionally set inner HTML based on matchFound
            addWishlistButton.innerHTML = matchFound
                ? `<div class="button-collection">${alreadyAddedToWishlistData}</div>`
                : `<div class="button-collection">${addToWishlistData}</div>`;

            wishlistButtonDiv.innerHTML = addWishlistButton.innerHTML;
        }
        document.querySelectorAll(".wf-wishlist-button").forEach((wishlistDiv) => {
            wishlistDiv.style.display = "flex";
        });
    }
}




if (permanentDomain === 'outfitbook-fr.myshopify.com') {
    if (wfDomainUrl.indexOf("/products/") !== -1) {
        checkQuantityValue(function (updatedValue) {
            newQuantityOutLook = updatedValue
        });
    }
}

async function buttonColectionClick(selectedId, handle, selectedVariantId) {
    try {
        const buttonResponseData = await fetch(`${wfGetDomain}products/${handle}.js`);
        const buttonJsonData = await buttonResponseData.json();
        let variantArr = buttonJsonData.variants;
        let saveVariantId = buttonJsonData.variants[0].id;
        let saveImage = buttonJsonData.images[0];
        if (isVariantWishlistTrue === true) {
            // saveVariantId = selectedVariantId || buttonJsonData?.variants[0].id;

            saveVariantId = selectedVariantId === "null" ? buttonJsonData?.variants[0].id : selectedVariantId || buttonJsonData?.variants[0].id;

            const resultFind = variantArr.find(data => data.id === parseInt(selectedVariantId));
            saveImage = resultFind?.featured_image?.src || buttonJsonData.images[0]
        } else {
            saveVariantId = buttonJsonData.variants[0].id;
            saveImage = buttonJsonData.images[0];
        }


        let getProductOption = wgGetProductOptions();
        // console.log("wgGetProductOptions --- ", getProductOption);

        let buttonData = {
            productId: buttonJsonData.id,
            // variantId: buttonJsonData.variants[0].id,
            variantId: saveVariantId,
            price: Number(buttonJsonData.variants[0].price) / 100,
            handle: buttonJsonData.handle,
            title: buttonJsonData.title,
            // image: buttonJsonData.images[0] ? buttonJsonData.images[0] : "",
            image: saveImage || "",
            quantity: newQuantityOutLook || 1,
            language: wfGetDomain,
            productOption: JSON.stringify(getProductOption)

        };

        const res = await showLoginPopup(selectedId);
        if (res) return;

        const matchFound = await checkFound(allWishlistData, selectedId, saveVariantId);

        if (isMultiwishlistTrue) {
            renderPopupLoader()
            if (allWishlistData.length > 0 && matchFound) {
                buttonData.isDelete = "yes";
                openMultiWishlist(buttonData, selectedId, "customButton", saveVariantId)
            } else {
                openMultiWishlist(buttonData, selectedId, "customButton", saveVariantId)
            }
        } else {
            buttonData.wishlistName = matchFound ? ["wfNotMulti"] : ["favourites"];
            await checkCollectionCounterData(selectedId, !matchFound ? "add" : "remove")
            buttonAddedRemoveWishlist(selectedId, matchFound ? false : true, "load")
            saveMainData(buttonData, selectedId, "customButton");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function buttonAddedRemoveWishlist(selectedId, matchingOrNot, load = "") {
    let getWishlistCustomButton = document.querySelectorAll(".wf-wishlist-button");
    if (getWishlistCustomButton.length !== 0) {
        const iconArray = Array.from(getWishlistCustomButton);
        iconArray.forEach(async (icon, index) => {
            const id = icon.getAttribute("product-id");
            const addToWishlistData = await renderButtonAddToWishlist(id, isCollectionCount, load);
            const alreadyAddedToWishlistData = await renderButtonAddedToWishlist(id, isCollectionCount, load);

            // const countData = await isCountOrNot(selectedId, isCollectionCount);
            if (Number(id) === Number(selectedId)) {
                let updateWishlistButton = document.createElement("div");
                updateWishlistButton.style.zIndex = "10";
                updateWishlistButton.style.position = "relative";
                // updateWishlistButton.innerHTML = matchingOrNot
                //     ? `<div class="button-collection">${alreadyAddedToWishlistData}</div>${!onlyTextButton ? countData : ""
                //     }`
                //     : `<div class="button-collection">${addToWishlistData}</div>${!onlyTextButton ? countData : ""
                //     }`;


                updateWishlistButton.innerHTML = matchingOrNot
                    ? `<div class="button-collection">${alreadyAddedToWishlistData}</div>`
                    : `<div class="button-collection">${addToWishlistData}</div>`;

                getWishlistCustomButton[index].innerHTML = updateWishlistButton.innerHTML;
                renderCustomButtonBorder(matchingOrNot ? "added" : "removed", selectedId, isCollectionCount);
            }
        });
    }
}

/**AUTO INJECT COLLECTION ICON AND BUTTON **/
async function collectionIconClick(event, selectedId, handle) {
    if (typeof settingCurrentFilter !== "undefined" && settingCurrentFilter === "boost") {
        event.preventDefault();
        let el = event.target;
        var parentElement = el.closest(".boost-sd__product-item");
        if (parentElement) {
            event.stopPropagation();
        }
    }

    const matchedElement = findMatchingItemSelected(encodeURIComponent(handle));
    let matchedProductId;
    if (matchedElement) {
        matchedProductId = matchedElement.getAttribute('data-variant-id')
        // console.log('Found matching item-selected element:', matchedElement.getAttribute('data-variant-id'));
    }
    event.stopPropagation();
    try {
        const collectionIconResponse = await fetch(`${wfGetDomain}products/${handle}.js`);
        const collectionIconJsonData = await collectionIconResponse.json();
        const variantData = collectionIconJsonData.variants;
        let variant_img, productPrice;

        if (matchedElement !== null) {
            variantData.map((data) => {
                if (data.id === parseInt(matchedProductId)) {
                    productPrice = Number(data.price) / 100;
                    if (data.featured_image === null) {
                        variant_img = collectionIconJsonData.images[0];
                    } else {
                        variant_img = data?.featured_image.src;
                    }
                } else if (matchedProductId == null) {
                    productPrice = Number(data.price) / 100;
                    if (variantData[0]) {
                        if (data.featured_image === null) {
                            variant_img = collectionIconJsonData.images[0];
                        } else {
                            variant_img = data?.featured_image.src;
                        }
                    }
                }


            });
        }

        // const productPrice1 = await getProPrice(handle, matchedElement !== null ? matchedProductId : collectionIconJsonData.variants[0].id);

        let collectionIconData = {
            productId: collectionIconJsonData.id,
            variantId: matchedElement !== null ? matchedProductId : collectionIconJsonData.variants[0].id,
            price: matchedElement !== null ? Number(productPrice) : Number(collectionIconJsonData.variants[0].price) / 100,
            handle: collectionIconJsonData.handle,
            title: collectionIconJsonData.title,
            image: matchedElement !== null ? variant_img : collectionIconJsonData.images[0] ? collectionIconJsonData.images[0] : "",
            quantity: 1,
            language: wfGetDomain
        }

        const res = await showLoginPopup(selectedId);
        if (res) return;

        const matchFound = await checkFound(allWishlistData, selectedId);

        if (isMultiwishlistTrue) {
            renderPopupLoader()
            if (allWishlistData.length > 0 && matchFound) {
                collectionIconData.isDelete = "yes";
                openMultiWishlist(collectionIconData, selectedId, "collection");
            } else {
                openMultiWishlist(collectionIconData, selectedId, "collection");
            }
        } else {
            collectionIconData.wishlistName = matchFound ? ["wfNotMulti"] : ["favourites"];
            await checkCollectionCounterData(selectedId, !matchFound ? "add" : "remove")
            collectionIcon(selectedId, matchFound ? false : true)
            saveMainData(collectionIconData, selectedId, "collection");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function collectionIcon(selectedId, matchingOrNot) {

    if (collectionBtnSetting.collectionType === "buttonType") {
        const addToWishlistData = await renderButtonAddToWishlist(selectedId, isCollectionCount);
        const alreadyAddedToWishlistData = await renderButtonAddedToWishlist(selectedId, isCollectionCount);

        const collectionIcon = document.querySelectorAll('.wf-wishlist-collection-btn');
        const iconArray = Array.from(collectionIcon);
        let addWishlistButton = document.createElement("div");
        addWishlistButton.style.zIndex = "10";
        addWishlistButton.style.position = "relative";



        iconArray.forEach((icon, index) => {
            const id = icon.getAttribute("product-id");
            if (Number(id) === Number(selectedId)) {

                addWishlistButton.innerHTML = matchingOrNot
                    ? `<div class="button-collection" >${alreadyAddedToWishlistData}</div>`
                    : `<div class="button-collection" >${addToWishlistData}</div>`;

                collectionIcon[index].innerHTML = addWishlistButton.innerHTML;

                if (isCollectionCount) {
                    renderCustomButtonBorder(matchingOrNot ? "added" : "removed", selectedId, isCollectionCount)
                }

            }
        });



    } else {
        const collectionIcon = document.querySelectorAll('.wf-wishlist-collection-icon');
        let productIndex = [], productHandle;
        const iconArray = Array.from(collectionIcon);

        iconArray.forEach((icon, index) => {
            const id = icon.getAttribute("product-id");
            if (Number(id) === Number(selectedId)) {
                productIndex.push(index);
                productHandle = icon.getAttribute("product-handle");
            }
        });

        if (collectionIcon.length !== 0) {
            const { isComboIcon, isComboHeart, isComboStar, isComboSave } = checkCollectionIcon();
            const toggleIconClass = (element, blankClass, solidClass) => {

                if (matchingOrNot) {
                    element.classList.remove(blankClass);
                    element.classList.add(solidClass);
                } else {
                    element.classList.remove(solidClass);
                    element.classList.add(blankClass);
                }
            };

            productIndex.forEach((id) => {
                const element = collectionIcon[id]?.querySelector(".wg-collectionIcon");
                const checkElement = collectionIcon[id].children[0];

                if (checkElement) {
                    if (matchingOrNot) {
                        checkElement.classList.add("collection_icon_new_selected");
                        checkElement.classList.remove("collection_icon_new");
                    } else {
                        checkElement.classList.add("collection_icon_new");
                        checkElement.classList.remove("collection_icon_new_selected");
                    }
                }

                if (element) {
                    if (matchingOrNot) {
                        element.classList.add("selected");
                    } else {
                        element.classList.remove("selected");
                    }
                    collectionIconSize();
                    if (isComboIcon) {
                        const iconCombos = [
                            {
                                condition: isComboHeart,
                                blank: "wg-heart-icon-blank",
                                solid: "wg-heart-icon-solid",
                            },
                            {
                                condition: isComboStar,
                                blank: "wg-star-icon-blank",
                                solid: "wg-star-icon-solid",
                            },
                            {
                                condition: isComboSave,
                                blank: "wg-save-icon-blank",
                                solid: "wg-save-icon-solid",
                            },
                        ];

                        iconCombos.forEach(({ condition, blank, solid }) => {
                            if (condition) {
                                toggleIconClass(element, blank, solid);
                            }
                        });
                    }
                }
            });

            if (isCollectionCount) {
                const countData = await isCountOrNot(selectedId, isCollectionCount);
                const newCountData = onlyTextButton ? `<div class="wf-product-count">${countData}</div>` : countData;
                const checkCollectionElements = document.querySelectorAll(`.wf-wishlist-collection-icon[product-id='${selectedId}'] .wf-product-count`);

                checkCollectionElements.forEach(element => {
                    updateCountElement(element, newCountData);
                });

                renderCollectionTextColor(matchingOrNot ? "added" : "removed", selectedId, isCollectionCount);
            }
        }
    }
}


const wgHorizonCss = (getThemeName.themeName === "Horizon")
    ? `
    header-actions{
    align-items:center
    }
    .resource-list .wf-wishlist-collection-icon {
       z-index: 7;
    }
    `
    : '';

const wgAtlasCss = (getThemeName.themeName === "Atlas")
    ? `.collection_icon_new{z-index:4 !important;} .wf-product-count{z-index:4 !important;}`
    : '';

const wgMyShopCss = (getThemeName.themeName === "MyShop")
    ? `.wg-myshop-headerIcon-desktop{margin-top:15px;}
            @media screen(max-width:766px){.wg-myshop-headerIcon-desktop{margin-top:28px !important;}}
            @media screen(max-width:1014px){.wg-myshop-headerIcon-desktop{margin-top:18px !important;}}
        `
    : '';

const wgDwellCss = (getThemeName.themeName === "Dwell")
    ? `header-actions {align-items: center !important;}`
    : '';


const wgAtlanticCss = (getThemeName.themeName === "Atlantic")
    ? `
    .wf-wishlist-collection-icon, 
    .sharedIconDiv{
     z-index:2001;
    }
    .product-list .product {
     position: relative !important;
    }
    `
    : '';

const wgRitualCss = (getThemeName.themeName === "Ritual")
    ? `header-actions{
            align-items:center;
        }
        .overflow-menu li:nth-last-child(2){
            display:flex;
            gap:20px;
        }`
    : '';

const wgReformationCss = (getThemeName.themeName === "Reformation")
    ? `.thb-secondary-area{
            align-items:center;
        }`
    : '';


const wgBlockshopCss = (getThemeName.themeName === "Blockshop")
    ? `.wf-wishlist.pdp-img-icon-bottom-right {
            bottom:22px;
        }
        .wf-wishlist.pdp-img-icon-bottom-left {
            bottom:22px;
            left: 0px;
        }
        .wf-wishlist.pdp-img-icon-top-left {
            top:0px;
            left:0px !important;
        }
        `
    : '';

const wgEurusCss = (getThemeName.themeName === "Eurus")
    ? `.x-container-header-mobile-nav .pb-header{
            align-items:center;
        }
        .x-container-header-icons{
            align-items:center;
        }
        .wf-wishlist.pdp-img-icon-bottom-left {
            bottom:20px;
            left:0;
        }

        `
    : '';

const wgSunriseCss = (getThemeName.themeName === "Sunrise")
    ? `.wg-sunrise-headerIcon-mobile{
            display:flex !important;
        }
        @media screen and (max-width: 767px) {
            .wg-sunrise-headerIcon-desktop {
                display: none;
            }
        }    
        `
    : '';

const wgAtelierCss = (getThemeName.themeName === "Atelier")
    ? `
        .overflow-menu > li:nth-last-child(2){
            display:flex;
            gap:20px;
        }
        header-actions {
            align-items:center;
        }
        .wf-wishlist-collection-icon{
            z-index:7 !important;
        }
        .wf-wishlist.pdp-img-icon-top-left{
            left: 0 !important;
        }
    `
    : '';

const wgFocalCss = (getThemeName.themeName === "Focal")
    ? `.wf-wishlist-collection-icon {
        z-index: 3 !important;
    }`
    : '';

const wgEliteCss = (getThemeName.themeName === "Elite")
    ? `.forMobile.header__icons a{
            width: auto !important;
        } `
    : '';

const wgSleekCss = (getThemeName.themeName === "Sleek")
    ? ``
    : '';

// div:empty:not(.fixed-overlay,.bg-overlay,.empty-space,.drawer__body,.no-empty) {
//         display:block !important;
//     }

const wgCapitalCss = (getThemeName.themeName === "Capital")
    ? `.site-header__links li {
            display:flex !important;
            align-items:center;
        }
       .product-media--grid-wrapper div[data-media-main] > div{
            position:relative;
       }
        .site-nav--mobile{
            align-items:center;
        }`
    : '';


const wgPrestigeCss = (getThemeName.themeName === "Prestige")
    ? `.wf-wishlist-collection-icon {
       z-index: 2 !important;
    }` : '';


const wgBroadcastCss = (getThemeName.themeName === "Broadcast")
    ? `.wf-wishlist.pdp-img-icon-bottom-left {
          bottom: 30px !important;
          left: 0px !important;
    }`
    : ``;

const wgRefonteCss = (getThemeName.themeName === "Arterritoires x Symediane")
    ? `.related-products-slider__wrapper .wf-wishlist-collection-icon.wg-icon-top-right {
        right: 50px !important;
    }`
    : ``;

const wgTinkerCss = (getThemeName.themeName === "Tinker")
    ? `header-actions {
        align-items:center;
    }`
    : '';

const wgGainCss = (getThemeName.themeName === "Gain")
    ? `.wf-wishlist.pdp-img-icon-top-left {
        top:0 !important;
        left:0 !important;
    }`
    : '';

const wgStarliteCss = (getThemeName.themeName === "Starlite")
    ? `.list-inline {
            flex-wrap: nowrap !important;
        }
        .wg-starlite-headerIcon-desktop .header-heart-position .count-span {
            bottom: -5px !important;
            right: -5px !important;
        }
        .wf-wishlist.pdp-img-icon-top-left {
            left:0 !important;
            top:0 !important;
        }
        `
    : '';



// const wgHyperCss = (getThemeName.themeName === "Hyper")
//     ? `.wf-wishlist div{
//         display:inline !important;
//     }`
//     : ''



const wgGridCss = `
.wishlist-modal-box.wg-grid-gap {
    gap: ${generalSetting.gridGap}px;
}
.wishlist-modal-box.wg-grid-alignment .product-content-sec,
.wishlist-modal-box.wg-grid-alignment .product-option-price,
.wishlist-modal-box.wg-grid-alignment .quantity-div {
    text-align:left;
    justify-content: flex-start;
}
.wishlist-modal-box.wg-grid-bg .product-content-sec {
    background-color: ${generalSetting.gridBgColor};
    height: 100%;
}
.show-title .wishlist-grid1,
.show-shared-wishlist .wishlist-grid1 {
   background-color: ${generalSetting.gridBgColor};
}
.wishlist-modal-box.wg-grid-border .wishlist-grid1 {
    border: ${generalSetting.gridBorderInput}px ${generalSetting.gridBorderType} ${generalSetting.gridBorderColor} !important;
}
.wishlist-modal-box.wg-grid-border-radius .wishlist-grid1,
.show-shared-wishlist .wishlist-grid1 {
    border-radius: ${generalSetting.gridBorderRadius}px;
    overflow: hidden;
}
.modal-product-image img,
#myshareModal .modal-share-content,
#wg-myModal1 .wg-modal-content1 {
    border-radius: ${generalSetting.gridBorderRadius}px;
}
.wg-modal-layer {
    background-color: ${generalSetting?.modalLayerBgColor};
    border-radius: ${generalSetting.gridBorderRadius}px;
    padding: 20px;
}

.wfq-select-box select,
.quant-minus,
.quant-plus {
    background-color: ${generalSetting?.modalLayerBgColor};
}

.modal-button-div {
    background-color: ${generalSetting?.modalBottomButtonBgColor};
     border-radius: ${generalSetting.gridBorderRadius}px;
    padding: 5px !important;
}

.wg-modal-content {
    border-radius: ${generalSetting.gridBorderRadius}px;
}
.wishlist-modal-box.wg-grid-alignment .product-content-sec,
.wishlist-modal-box.wg-grid-alignment .product-option-price,
.wishlist-modal-box.wg-grid-alignment .quantity-div,
.wishlist-modal-box.wg-grid-alignment .wg-product-option {
    text-align:${generalSetting.gridAlignment};
    justify-content: ${generalSetting.gridAlignment === "left" ? "flex-start" : generalSetting.gridAlignment === "right" ? "flex-end" : "center"} !important;
}
.wishlist-modal-box.wg-grid-image-fit .modal-product-image {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 100%;
}
.wishlist-modal-box.wg-grid-image-fit .modal-product-image a {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: calc(100% + 1px);
    height: calc(100% + 1px);
}
.wishlist-modal-box.wg-grid-image-fit .modal-product-image img {
    position: absolute;
    left: 0;
    top: 0;
    object-fit: contain;
    object-position: center;
    width: 100%;
    height: 100%;
} 
.modal-button-div .cartButtonStyle,
.searchData-main2 .cartButtonStyle,
.modalContainer .cartButtonStyle,
#wg-multiWishlist_div .cartButtonStyle {
    background-color: ${customButton.cartButtonStyle.hover.bgColor};
    color: ${customButton.cartButtonStyle.hover.textColor};
    border: ${customButton.cartButtonStyle.hover.border.value}${customButton.cartButtonStyle.hover.border.unit} ${customButton.cartButtonStyle.hover.border.type} ${customButton.cartButtonStyle.hover.border.color};
}
.modal-button-div .cartButtonStyle:hover,
.searchData-main2 .cartButtonStyle:hover,
.modalContainer .cartButtonStyle:hover,
#wg-multiWishlist_div .cartButtonStyle:hover {
    background-color: ${customButton.cartButtonStyle.bgColor};
    color: ${customButton.cartButtonStyle.textColor};
    border: ${customButton.cartButtonStyle.border.value}${customButton.cartButtonStyle.border.unit} ${customButton.cartButtonStyle.border.type} ${customButton.cartButtonStyle.border.color};
}
.wishlist-modal-box {
    margin-bottom: ${generalSetting.gridGap}px;
}
.searchData-main1 {
    background-color: ${generalSetting?.wlBgColor};
}
.wg-mtc-icon {
    filter: ${customButton?.cartButtonStyle?.iconColor?.color};
}
.wg-mtc-icon:hover {
    filter: ${customButton?.cartButtonStyle?.hover?.iconColor?.color};
}

.modal-share-content input::placeholder,
.modal-share-content textarea::placeholder {
    font-family: arial;
    opacity: 0.4;
}

`

function buttonStyleFxn() {
    const {
        bgColor,
        activeBtn,
        hover,
        textColor,
        fontWeight,
        fontSize,
        fontFamily,
        paddingTopBottom,
        paddingLeftRight,
        marginTopBottom,
        marginLeftRight,
        border,
        borderRadius,
        iconPosition,
        textAlign,
        type,
        cartButtonStyle,
        iconSizeValue,
        iconColor,
        width,
    } = customButton;

    const helloBgColor = onlyTextButton ? "transparent" : bgColor;
    const helloBgColorAlready = onlyTextButton ? "transparent" : activeBtn.bgColor;
    const hoverBgColor = onlyTextButton ? "transparent" : hover.bgColor;
    const isValidIcon = isIconTypeValid(collectionBtnSetting.collectionIconType);

    // Set Ella CSS
    const ellaCss = (getThemeName.themeName === "Ella" || getThemeName.themeName === "Vendy Shopping")
        ? `.header-navigation .header-item:nth-child(3) { align-items: center; }`
        : '';

    // Adjust heart icon for specific shop domain
    if (shopDomain === 'preahkomaitland.com.au') {
        generalSetting.heartIconHeight = 0;
        const adjustIconMargin = (selector) => {
            const icons = document.querySelectorAll(selector);
            if (icons.length > 0) icons[0].style.margin = 0;
        };
        adjustIconMargin(".wg-impulse-headerIcon-desktop .header-heart-position");
        adjustIconMargin(".wg-impulse-headerIcon-mobile .header-heart-position");
    }

    let buttonStyleHead = document.getElementById("console-style");

    if (!buttonStyleHead) {
        buttonStyleHead = document.createElement("style");
        // buttonStyleHead.id = "console-style";
        document.getElementsByTagName("head")[0].appendChild(buttonStyleHead);
    }




    // const buttonStyleHead = document.createElement("style");
    buttonStyleHead.innerHTML = `
        .buttonStyleHead {
            display: flex;
            align-items: center;
            justify-content: ${textAlign};
            gap: 10px;
            flex-direction: ${iconPosition === "right" ? "row-reverse" : "row"};
            background-color: ${helloBgColor} !important;
            color: ${textColor} !important;
            max-width: 100% !important;
            font-weight: ${getFontWt(fontWeight, fontWeight).textFw};
            border: ${!isCountValid && !onlyTextButton
            ? `${border.value}${border.unit} ${border.type} ${border.color} !important;`
            : "none"
        };
            border-radius: ${borderRadius.value}${borderRadius.unit} !important;
            font-size: ${fontSize.value}${fontSize.unit} !important;
            font-family: ${fontFamily} !important;
            padding: ${paddingTopBottom.value}${paddingTopBottom.unit} ${paddingLeftRight.value
        }${paddingLeftRight.unit} !important;
            margin: ${marginTopBottom.value}${marginTopBottom.unit} ${marginLeftRight.value
        }${marginLeftRight.unit} !important;
            cursor: pointer;
            ${!isCountValid &&
        `width: ${width?.value || "100"}${width?.unit || "%"};`
        }
        }
        ${type === "icon"
            ? `
            .wf-wishlist-button {
                width: 40px;
                margin: ${textAlign === "center"
                ? "0 auto"
                : textAlign === "left"
                    ? "0"
                    : "0 0 0 auto"
            } !important;
            }
        `
            : ""
        }
        #main-Modal-form {
            text-align: center;
        }
        .button-collection,
        .modalButtonCollection {
            display: flex;
            align-items: center;
            justify-content: flex-start;
        }
        ${type !== "icon"
            ? `
            .button-collection,
            .wf-wishlist-button .button-collection,
            .modalButtonCollection {
                width: 100%;
            }
        `
            : ""
        }
        .iconColour {
            filter: ${iconColor?.filterColor || iconColor};
            width: ${iconSizeValue}px !important;
            height: ${iconSizeValue}px !important;
            background-size: ${iconSizeValue}px !important;
            display: block !important;
                background-position: center;
        }

        .alreadyIconColour {
            filter: ${activeBtn?.iconColor?.filterColor || activeBtn?.iconColor};
            width: ${iconSizeValue}px !important;
            height: ${iconSizeValue}px !important;
            background-size: ${iconSizeValue}px !important;
            display: block !important;
                background-position: center;
        }

        .alreadyButtonStyleHead {
            display: flex;
            align-items: center;
            justify-content: ${textAlign};
            gap: 10px;
            flex-direction: ${iconPosition === "right" ? "row-reverse" : "row"};
            background-color: ${helloBgColorAlready} !important;
            color: ${activeBtn.textColor} !important;
            font-weight: ${getFontWt(fontWeight, fontWeight).textFw};
            border: ${!isCountValid && !onlyTextButton
            ? `${activeBtn.border.value}${activeBtn.border.unit} ${activeBtn.border.type} ${activeBtn.border.color} !important;`
            : "none"
        };
            border-radius: ${borderRadius.value}${borderRadius.unit} !important;
            font-size: ${fontSize.value}${fontSize.unit} !important;
            max-width: 100% !important;
            font-family: ${fontFamily} !important;
            padding: ${paddingTopBottom.value}${paddingTopBottom.unit} ${paddingLeftRight.value
        }${paddingLeftRight.unit} !important;
            margin: ${marginTopBottom.value}${marginTopBottom.unit} ${marginLeftRight.value
        }${marginLeftRight.unit} !important;
            text-align: ${textAlign} !important;
            cursor: pointer;
            white-space: nowrap;
            ${!isCountValid &&
        `width: ${width?.value || "100"}${width?.unit || "%"};`
        }
        }
        .wf-product-count {
            font-size: ${fontSize.value}${fontSize.unit} !important;
            font-family: ${fontFamily} !important;
            border-radius: 0 ${borderRadius.value}${borderRadius.unit} ${borderRadius.value
        }${borderRadius.unit} 0 !important;
        }
        .iconDiv {
            width: 40px;
            height: 40px;
            background-color: ${helloBgColor} !important;
            padding: ${paddingTopBottom.value}${paddingTopBottom.unit
        } 0 !important;
            margin: ${marginTopBottom.value}${marginTopBottom.unit
        } 0 !important;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: ${!isCountValid
            ? `${border.value}${border.unit} ${border.type} ${border.color}`
            : "none"
        } !important;
            border-radius: ${borderRadius.value}${borderRadius.unit} !important;
        }
        .iconDivAlready {
            width: 40px;
            height: 40px;
            background-color: ${helloBgColorAlready} !important;
            padding: ${paddingTopBottom.value}${paddingTopBottom.unit
        } 0 !important;
            margin: ${marginTopBottom.value}${marginTopBottom.unit
        } 0 !important;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: ${!isCountValid
            ? `${activeBtn.border.value}${activeBtn.border.unit} ${activeBtn.border.type} ${activeBtn.border.color}`
            : "none"
        } !important;
            border-radius: ${borderRadius.value}${borderRadius.unit} !important;
        }
        .inside-button-div-icon {
            flex: 0 0 ${iconSizeValue}px;
            background-size: ${iconSizeValue}px;
        }
        .wishlist-modal-all .inside-button-div-icon {
            height: ${fontSize.value}${fontSize.unit};
            width: ${fontSize.value}${fontSize.unit};
        }
        .cartButtonStyle {
            background-color: ${cartButtonStyle.bgColor};
            color: ${cartButtonStyle.textColor};
            max-width: 100%;
            border: ${cartButtonStyle.border.value}${cartButtonStyle.border.unit
        } ${cartButtonStyle.border.type} ${cartButtonStyle.border.color};
            border-radius: ${cartButtonStyle.borderRadius.value}${cartButtonStyle.borderRadius.unit
        };
            font-size: ${cartButtonStyle.fontSize.value}${cartButtonStyle.fontSize.unit
        } !important;
            padding: ${cartButtonStyle.paddingTopBottom.value}${cartButtonStyle.paddingTopBottom.unit
        } ${cartButtonStyle.paddingLeftRight.value}${cartButtonStyle.paddingLeftRight.unit
        };
            margin: ${cartButtonStyle.marginTopBottom.value}${cartButtonStyle.marginTopBottom.unit
        } ${cartButtonStyle.marginLeftRight.value}${cartButtonStyle.marginLeftRight.unit
        };
            text-align: ${cartButtonStyle.textAlign};
            cursor: pointer;
            box-sizing: border-box;
            font-weight: ${getFontWt(cartButtonStyle.fontWeight, cartButtonStyle.fontWeight).textFw};
            font-family: ${cartButtonStyle.fontFamily};
        }
        .shareButtonTextStyle {
            color: ${generalSetting.shareWishBtntextColor};
            font-size: ${generalSetting.shareWishBtnfontSize}${generalSetting.shareWishBtnfontSizeUnit
        } !important;
            font-family: ${generalSetting.shareWishBtnfontFamily};
        }
        .img_test {
            filter: ${generalSetting.shareBtnIconColor};
        }
        .collection_icon_new {
            background-color: ${!isValidIcon ? collectionBtnSetting.iconDefaultBgColor : "inherit"
        } !important;
        }
        .collection_icon_new_selected {
            background-color: ${!isValidIcon
            ? collectionBtnSetting.iconSelectedBgColor
            : "inherit"
        } !important;
        }
        .heart-icon-empty {
            background-size: ${iconSizeValue}px !important;
            cursor: pointer;
        }
        .wf-wishlist-collection-btn .inside-button-div-icon{
            flex:0 0 auto;
        }
        .wf-wishlist-collection-icon-modal .modalButtonCollection {
            margin-bottom: 13px;
        }
        .header-heart-position .heartICON,
            .header-heart-position .starICON,
            .header-heart-position .savetICON{
            background-size: ${generalSetting.heartIconWidth}px;
        }
        .header-heart-position {
            margin: 0 ${generalSetting.heartIconHeight}px;
        }
        .menu-drawer__menu-item.list-menu__item .show-count {
            position: absolute;
            top: 0px;
            right: -10px;
        }
        .menu-drawer__menu-item.list-menu__item .heartICON,
        .menu-drawer__menu-item.list-menu__item .starICON,
        .menu-drawer__menu-item.list-menu__item .savetICON {
            margin: auto;
            filter: ${generalSetting.heartIconFilter};
            height: ${generalSetting.heartIconWidth}px;
            width: ${generalSetting.heartIconWidth}px;
        }
        ${isCountValid
            ? `
            #inject_wish_button .buttonStyleHead,
            #wishlist-guru .buttonStyleHead,
            .wf-wishlist-button .buttonStyleHead {
                border: none;
                border-radius: ${borderRadius.value}${borderRadius.unit} 0 0 ${borderRadius.value
            }${borderRadius.unit} !important;
                margin: 0 !important;
                width: 100%;
            }
            #inject_wish_button .alreadyButtonStyleHead,
            #wishlist-guru .alreadyButtonStyleHead,
            .wf-wishlist-button .alreadyButtonStyleHead {
                border: none;
                border-radius: ${borderRadius.value}${borderRadius.unit} 0 0 ${borderRadius.value
            }${borderRadius.unit} !important;
                margin: 0 !important;
                width: 100%;
            }
            #inject_wish_button .iconDiv,
            #wishlist-guru .iconDiv,
            .wf-wishlist-button .iconDiv {
                border: none;
                border-radius: ${borderRadius.value}${borderRadius.unit} 0 0 ${borderRadius.value
            }${borderRadius.unit} !important;
                margin: 0 !important;
            }
            #inject_wish_button .iconDivAlready,
            #wishlist-guru .iconDivAlready,
            .wf-wishlist-button .iconDivAlready {
                border: none;
                border-radius: ${borderRadius.value}${borderRadius.unit} 0 0 ${borderRadius.value
            }${borderRadius.unit} !important;
                background-color: ${helloBgColorAlready} !important;
                margin: 0 !important;
            }
            #wishlist-guru,
            #inject_wish_button,
            .wf-wishlist-button {
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                width: ${width?.value || "100"}${width?.unit || "%"};
                border-radius: ${borderRadius.value}${borderRadius.unit
            } !important;
                font-size: ${fontSize.value}${fontSize.unit} !important;
                font-family: ${fontFamily} !important;
                margin-top: 5px;
                margin: ${type !== "icon"
                ? `${marginTopBottom.value}${marginTopBottom.unit} ${marginLeftRight.value}${marginLeftRight.unit} !important;`
                : `${marginTopBottom.value}${marginTopBottom.unit} 0 !important;`
            }
            }
        `
            : ""
        }

        ${isCollectionCount
            ? `
            .wf-wishlist-button .buttonStyleHead,
            .wf-wishlist-collection-btn .buttonStyleHead {
                border: none;
                border-radius: ${borderRadius.value}${borderRadius.unit} 0 0 ${borderRadius.value
            }${borderRadius.unit} !important;
                margin: 0 !important;
                width: 100%;
            }

            .wf-wishlist-button .alreadyButtonStyleHead,
            .wf-wishlist-collection-btn .alreadyButtonStyleHead {
                border: none;
                border-radius: ${borderRadius.value}${borderRadius.unit} 0 0 ${borderRadius.value
            }${borderRadius.unit} !important;
                margin: 0 !important;
                width: 100%;
            }

            .wf-wishlist-button .iconDiv,
            .wf-wishlist-collection-btn .iconDiv {
                border: none;
                border-radius: ${borderRadius.value}${borderRadius.unit} 0 0 ${borderRadius.value
            }${borderRadius.unit} !important;
                margin: 0 !important;
            }

            .wf-wishlist-button .iconDivAlready,
            .wf-wishlist-collection-btn .iconDivAlready {
                border: none;
                border-radius: ${borderRadius.value}${borderRadius.unit} 0 0 ${borderRadius.value
            }${borderRadius.unit} !important;
                background-color: ${helloBgColorAlready} !important;
                padding: ${paddingTopBottom.value}${paddingTopBottom.unit
            } 0 !important;
                margin: 0 !important;
            }

            .wf-wishlist-button,
            .wf-wishlist-collection-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                width: ${width?.value || "100"}${width?.unit || "%"};
                border-radius: ${borderRadius.value}${borderRadius.unit
            } !important;
                font-size: ${fontSize.value}${fontSize.unit} !important;
                font-family: ${fontFamily} !important;
                margin: ${marginTopBottom.value}${marginTopBottom.unit} ${marginLeftRight.value
            }${marginLeftRight.unit} !important;
                margin-top: 5px;
            }
        `
            : ""
        }

        .wg-islogin-buttons {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .wg-islogin-buttons .wg-register-btn {
            background-color: ${generalSetting?.userLogin?.bgColor}; 
            color: ${generalSetting?.userLogin?.textColor}; 
            max-width: 100%;
            border: ${generalSetting?.userLogin?.border.value}${generalSetting?.userLogin?.border.unit
        } ${generalSetting?.userLogin?.border.type} ${generalSetting?.userLogin?.border.color
        };
            border-radius: ${generalSetting?.userLogin?.borderRadius.value}${generalSetting?.userLogin?.borderRadius.unit
        }; 
            font-size: ${generalSetting?.userLogin?.fontSize.value}${generalSetting?.userLogin?.fontSize.unit
        } !important; 
            font-family: ${generalSetting?.userLogin?.fontFamily
        }, ${getFontFamily}, ${getFontFamilyFallback};
            padding: ${generalSetting?.userLogin?.paddingTopBottom.value}${generalSetting?.userLogin?.paddingTopBottom.unit
        } ${generalSetting?.userLogin?.paddingLeftRight.value}${generalSetting?.userLogin?.paddingLeftRight.unit
        } ${generalSetting?.userLogin?.paddingTopBottom.value}${generalSetting?.userLogin?.paddingTopBottom.unit
        } ${generalSetting?.userLogin?.paddingLeftRight.value}${generalSetting?.userLogin?.paddingLeftRight.unit
        }; 
            margin:${generalSetting?.userLogin?.marginTopBottom.value}${generalSetting?.userLogin?.marginTopBottom.unit
        } ${generalSetting?.userLogin?.marginLeftRight.value}${generalSetting?.userLogin?.marginLeftRight.unit
        } ${generalSetting?.userLogin?.marginTopBottom.value}${generalSetting?.userLogin?.marginTopBottom.unit
        } ${generalSetting?.userLogin?.marginLeftRight.value}${generalSetting?.userLogin?.marginLeftRight.unit
        };
            text-align: ${generalSetting?.userLogin?.textAlign};
            cursor: pointer;
            box-sizing: border-box;
            text-transform: uppercase;
        }

        .wg-islogin-buttons .wg-login-btn{
            background-color: ${generalSetting?.guestLogin?.bgColor}; 
            color: ${generalSetting?.guestLogin?.textColor}; 
            max-width: 100%;
            border: ${generalSetting?.guestLogin?.border.value}${generalSetting?.guestLogin?.border.unit
        } ${generalSetting?.guestLogin?.border.type} ${generalSetting?.guestLogin?.border.color
        };
            border-radius: ${generalSetting?.guestLogin?.borderRadius.value}${generalSetting?.guestLogin?.borderRadius.unit
        }; 
            font-size: ${generalSetting?.guestLogin?.fontSize.value}${generalSetting?.guestLogin?.fontSize.unit
        } !important; 
            font-family: ${generalSetting?.guestLogin?.fontFamily
        }, ${getFontFamily}, ${getFontFamilyFallback};
            padding: ${generalSetting?.guestLogin?.paddingTopBottom.value}${generalSetting?.guestLogin?.paddingTopBottom.unit
        } ${generalSetting?.guestLogin?.paddingLeftRight.value}${generalSetting?.guestLogin?.paddingLeftRight.unit
        } ${generalSetting?.guestLogin?.paddingTopBottom.value}${generalSetting?.guestLogin?.paddingTopBottom.unit
        } ${generalSetting?.guestLogin?.paddingLeftRight.value}${generalSetting?.guestLogin?.paddingLeftRight.unit
        }; 
            margin:${generalSetting?.guestLogin?.marginTopBottom.value}${generalSetting?.guestLogin?.marginTopBottom.unit
        } ${generalSetting?.guestLogin?.marginLeftRight.value}${generalSetting?.guestLogin?.marginLeftRight.unit
        } ${generalSetting?.guestLogin?.marginTopBottom.value}${generalSetting?.guestLogin?.marginTopBottom.unit
        } ${generalSetting?.guestLogin?.marginLeftRight.value}${generalSetting?.guestLogin?.marginLeftRight.unit
        };
            text-align: ${generalSetting?.guestLogin?.textAlign};
            cursor: pointer;
            box-sizing: border-box;
            text-transform: uppercase;
        }
        .show-count {
            background-color: ${generalSetting?.headerHeartIconCountBgcolor} !important;
            color: ${generalSetting?.headerHeartIconCountTextcolor} !important;
        }
        .fi-count .show-count {
            background-color: ${generalSetting?.floatingHeartIconCountBgcolor} !important;
            color: ${generalSetting?.floatingHeartIconCountTextcolor} !important;
        }

        .errorPara, #mainErrorPara {
            color: red !important;
        }

        .wg-closeMultiwishlist,
        .closebtn,
        .close1,
        .wg-close,
        .closeByShareModal{
            filter: ${generalSetting.wlCrossFilter}
        }

        .drawer-cart-empty,
        #mySidenav.sidenav h2.drawer-text,
        .wishlist-page-main h2.modal-heading,
        .deleteMultiWishlist h3,
        #wg-multiWishlistInnerContent h3,
        #wg-multiWishlistInnerContent h4,
        #mySidenav.sidenav .drawer-table,
        #wg-myModal h2 {
            color: ${modalDrawerTextColor};
        }
        #dataList input[type="checkbox"]:checked {
            background-color: ${modalDrawerTextColor};
            border-color: ${modalDrawerTextColor};
        }
         #dataList input[type="checkbox"] {
            border-color: ${modalDrawerTextColor};
        }
        #myshareModal .modal-share-content .other-sharing-options {
            border-top: 1px solid ${modalDrawerTextColor};
        }
        .wishlist-modal-all .wf-multi-Wish-heading,
        #mySidenav.sidenav .drawer-table .wf-multi-Wish-heading,
        .editWishDivInner .editInput {
            border-bottom: 1px solid ${modalDrawerTextColor};
        }
        #myshareModal .modal-share-content,
        #wg-myModal1 .wg-modal-content1,
        .wishlist-page-main,
        .successDiv,
        #wg-myModal .wg-modal-content,

        #wg-multiWishlist_div{
            background-color: ${generalSetting.wlBgColor};
            color: ${modalDrawerTextColor};
        }
        ${generalSetting?.wlTextColor?.filterColor
            ? `
            .wg-icon-parent .share-icons,
            .share-url-div .copyICON,
            .img_test,
            .grid-option .grid1,
            .grid-option .grid2,
            .grid-option .grid3,
            .grid-option .grid4,
            .editWish,
            .wg-arrow-down,
            .wg-arrow-up,
            .deleteWish,
            .check-multiwishlist-icon,
            .close-multiwishlist-icon,
            .deleteICON,
            .copy-drawer-multi-icon {
                filter: ${generalSetting?.wlTextColor?.filterColor};
            }`
            : ""
        }

        .wishlist-page-main h2.modal-heading, 
        .wishlist-page-main h2.shared-page-heading,
        .wishlist-page-main .show-title h3.title11 a, 
        .show-shared-wishlist .product-content-sec h3.title11 a, 
        .wishlist-page-main .show-title h3, 
        .show-shared-wishlist .product-content-sec h3,
        #mySidenav.sidenav h2.drawer-text, 
        #wg-myModal .wg-modal-content h2.modal-heading, 
        #myshareModal .modal-share-content h3,
        #wg-myModal1 .wg-modal-content1 .sharable-link-heading,
        #mySidenav.sidenav .drawer-table td h3 a, 
        #wg-myModal .wg-modal-content .show-title h3.title11 a, 
        #mySidenav.sidenav .drawer-table td h3, 
        #wg-myModal .wg-modal-content .show-title h3,
        .deleteMultiWishlist h3,
        #wg-multiWishlistInnerContent h3,
        .wishlist-modal-all h3 {
            font-weight : ${getFontWt(generalSetting?.wlHeadingFontWt, generalSetting?.wlTextFontWt).headingFw};
            ${generalSetting?.wlHeadingFontFamily &&
        `font-family : ${generalSetting?.wlHeadingFontFamily}`
        };
        }

        .wishlist-page-main .modal-page-auth, 
        .wishlist-page-main .shared-page-auth,
        .wishlist-page-main .show-title .product-selected-variants, 
        .show-shared-wishlist .product-content-sec .product-selected-variants,
        .wishlist-page-main .show-title .quantity-div, 
        .show-shared-wishlist .product-content-sec .quantity-div,
        .wishlist-page-main .grid-outer-main .searchData label, 
        .wishlist-page-main .grid-outer-main .searchbar_Input, 
        .wishlist-page-main .grid-outer-main .grid-option h5, 
        .wishlist-page-main .grid-option h5,
        .drawer-cart-empty,
        .successDiv,
        .iconText,

        #wg-myModal .wg-modal-content .modal-page-auth, 
        #mySidenav.sidenav .drawer-table td .product-selected-variants, 
        #wg-myModal .wg-modal-content .show-title .product-selected-variants, 
        #mySidenav.sidenav .drawer-table td .quantity-div, 
        #wg-myModal .wg-modal-content .show-title .quantity-div, 
        #wg-myModal .wg-modal-content .grid-outer-main .searchData label, 
        #wg-myModal .wg-modal-content .grid-outer-main .searchbar_Input, 
        #wg-myModal .wg-modal-content .grid-outer-main .grid-option h5, 
        #myshareModal .modal-share-content .other-sharing-options h4,
        #myshareModal .modal-share-content label,
        #mySidenav.sidenav .drawer-login-text,
        #wg-isLogin-modal h3,

        .deleteMultiWishlist h3,
        .wg-multiWishlistInnerContent h3{
            font-weight : ${getFontWt(generalSetting?.wlHeadingFontWt, generalSetting?.wlTextFontWt).textFw};
            ${generalSetting?.wlTextFontFamily &&
        `font-family : ${generalSetting?.wlTextFontFamily}`
        };
        }

        #wg-multiWishlistInnerContent .saveBtn,
        #multiWishlistInnerContent #createWishlist,
        #multiWishlistInnerContent #copyBtn{
            padding: 5px 10px !important;
            margin: 3px 2px !important;
        }

        .multiCheckbox label {
            align-items: center;
        }

        .wg-disabled {
            pointer-events: none;
            opacity: 0.5;
            cursor: not-allowed;
        }

        .wg-vantage-custom-css .wg-vantage-headerIcon-desktop {
            display: inline-block !important;
        }
        .wg-vantage-custom-css #wg-myModal .wg-modal-content .show-title .modal-product-image, 
        .wg-vantage-custom-css .show-shared-wishlist .modal-product-image, 
        .wg-vantage-custom-css .wishlist-page-main .show-title .modal-product-image {
            aspect-ratio: 2 / 2;
        }

        .disabledArrow {
             pointer-events: none !important;
             opacity: 0.5 !important;
        }

        .wg-pipeline-headerIcon-desktop {
            display: flex;
            align-items: center;   
        }

        .newCladd {
            display: inline-flex !important;
        }

        ${!isCollectionCount ?
            `.button-collection .alreadyButtonStyleHead, .button-collection .buttonStyleHead  {
                 border-radius: ${borderRadius.value}${borderRadius.unit} !important;
              }`
            :
            ``
        }

        ${getThemeName?.themeName === "Trade" ?
            `#inject_wish_button {
                max-width: 44rem !important;
            }`
            :
            ``}



            .wg-minion-custom-css .wg-minion-headerIcon-desktop.header__button:before,
            .wg-minion-custom-css .wg-minion-headerIcon-desktop.header__button:after {
                display:none;
            }

            .hydrated body[__processed_4487d020-fdf7-4d1a-9f55-54e452974e23__="true"] .section-header {
                z-index: 0;
            }

            body.wg-craft-custom-css #shopify-section-sections--17222009684015__header .header--top-center > .header__search {
                display: none !important;
            }
            body.wg-craft-custom-css #shopify-section-sections--17222009684015__header .header__icons--localization.header-localization .header__search {
                display: flex;
            }

            .wg-eurus-custom-css .wf-wishlist-collection-icon {
                z-index: 16 !important;
            }

            .snize-product .wf-wishlist-collection-icon,
            .snize-product .collection_icon_new,
            .snize-product .collection_icon_new_selected,
            .snize-product .wg-collectionIcon {
                background-size: contain !important;
                z-index: 7 !important;
            }

            #shopify-section-sections--25171066781962__header {
               z-index: auto !important;
            }

            .wg-area-headerIcon-desktop {
                display: flex;
                align-items: center;
            }


        .wf-wishlist-collection-btn {
                padding: 0px 10px 10px 10px !important;
            }


       ${wgGridCss}


        @media screen and (max-width: 767px) {
        .wg-veena-custom-css #wg-myModal .wg-modal-content .show-title .wishlist-modal-box .wishlist-grid1 {
            width: auto !important;
            min-width: auto !important;
        }

        }



        @media screen and (max-width: 1024px) {
        .wg-boost-headerIcon-desktop {
            display: none !important;
        }
        }


        @media screen and (min-width: 767px) {

            .buttonStyleHead:hover,
            .alreadyButtonStyleHead:hover {
                background-color: ${hoverBgColor} !important;
                color: ${customButton.hover.textColor} !important;
                ${!isCountValid && !onlyTextButton
            ? `
                    border: ${customButton.hover.border.value}${customButton.hover.border.unit} ${customButton.hover.border.type} ${customButton.hover.border.color} !important;
                `
            : ""
        }
            }

            .iconDiv:hover .iconColour,
            .iconDivAlready:hover .alreadyIconColour,
            .buttonStyleHead:hover .iconColour,
            .alreadyButtonStyleHead:hover .alreadyIconColour {
                filter: ${customButton?.hover?.iconColor?.filterColor ||
        customButton.hover.iconColor
        } !important;
            }

            .iconDiv:hover,
            .iconDivAlready:hover {
                background-color: ${customButton.hover.bgColor} !important;
                ${!isCountValid
            ? `
                    border: ${customButton.hover.border.value}${customButton.hover.border.unit} ${customButton.hover.border.type} ${customButton.hover.border.color} !important;
                `
            : ""
        }
            }

            .cartButtonStyle:hover {
                background-color: ${customButton.cartButtonStyle.hover.bgColor};
                color: ${customButton.cartButtonStyle.hover.textColor};
                border: ${customButton.cartButtonStyle.hover.border.value}${customButton.cartButtonStyle.hover.border.unit
        } ${customButton.cartButtonStyle.hover.border.type} ${customButton.cartButtonStyle.hover.border.color
        };
            }

            .shareButtonTextStyle:hover {
                color: ${generalSetting.shareWishBtnhoverTextColor};
            }

            .drawerShareTextStyle:hover,
            .shareButtonStyle:hover {
                filter: ${generalSetting.shareBtnIconHoverColor};
                color: ${generalSetting.shareWishBtnhoverTextColor};
            }

            .wg-islogin-buttons .wg-register-btn:hover {
                background-color: ${generalSetting?.userLogin?.hover.bgColor};
                color: ${generalSetting?.userLogin?.hover.textColor};
                border: ${generalSetting?.userLogin?.hover.border.value}${generalSetting?.userLogin?.hover.border.unit
        } ${generalSetting?.userLogin?.hover.border.type} ${generalSetting?.userLogin?.hover.border.color
        };
            }

            .wg-islogin-buttons .wg-login-btn:hover {
                background-color: ${generalSetting?.guestLogin?.hover.bgColor};
                color: ${generalSetting?.guestLogin?.hover.textColor};
                border: ${generalSetting?.guestLogin?.hover.border.value}${generalSetting?.guestLogin?.hover.border.unit
        } ${generalSetting?.guestLogin?.hover.border.type} ${generalSetting?.guestLogin?.hover.border.color
        };
            }

            .red-heart:hover,
            .collection_icon_new_selected:hover,
            .collection_icon_new:hover,
            #mySidenav.sidenav .drawer-table tr .main-deleteIconStyle:hover,
            #mySidenav.sidenav .drawer-table tr .main-drawer-copy-icon:hover, 
            .delete-icon-main:hover,
            .copy-icon-main:hover,
            .check-icon-main:hover,
            .close-icon-main:hover{
                transform: scale(1.1);
            }

            ${isCountValid
            ? `
                #wishlist-guru:hover .buttonStyleHead,
                #inject_wish_button:hover .buttonStyleHead,
                .wf-wishlist-button:hover .buttonStyleHead,
                #wishlist-guru:hover .alreadyButtonStyleHead,
                #inject_wish_button:hover .alreadyButtonStyleHead,
                .wf-wishlist-button:hover .alreadyButtonStyleHead {
                    border: none;
                    ${!onlyTextButton
                ? `
                        border-right: ${customButton.hover.border.value}${customButton.hover.border.unit} ${customButton.hover.border.type} ${customButton.hover.border.color} !important;
                    `
                : ""
            }
                    background-color: ${hoverBgColor} !important;
                    color: ${customButton.hover.textColor} !important;
                }

                #wishlist-guru:hover,
                #inject_wish_button:hover,
                .wf-wishlist-button:hover {
                    ${!onlyTextButton
                ? `
                        border: ${customButton.hover.border.value}${customButton.hover.border.unit} ${customButton.hover.border.type} ${customButton.hover.border.color} !important;
                    `
                : ""
            }
                    background-color: ${onlyTextButton
                ? hoverBgColor
                : customButton.hover.textColor
            } !important;
                    color: ${onlyTextButton
                ? customButton.hover.textColor
                : customButton.hover.bgColor
            } !important;
                }

                #wishlist-guru:hover .wf-product-count,
                #inject_wish_button:hover .wf-product-count,
                .wf-wishlist-button:hover .wf-product-count {
                    color: ${onlyTextButton
                ? customButton.hover.textColor
                : customButton.hover.bgColor
            } !important;
                }

                .wf-wishlist-button:hover .iconDiv,
                #wishlist-guru:hover .iconDiv,
                #inject_wish_button:hover .iconDiv,
                .wf-wishlist-button:hover .iconDivAlready,
                #wishlist-guru:hover .iconDivAlready,
                #inject_wish_button:hover .iconDivAlready {
                    background-color: ${customButton.hover.bgColor} !important;
                    border: ${customButton.hover.border.value}${customButton.hover.border.unit
            } ${customButton.hover.border.type} ${customButton.hover.border.color
            } !important;
                }

                .wf-wishlist-button:hover .iconColour,
                #wishlist-guru:hover .iconColour,
                #inject_wish_button:hover .iconColour,
                .wf-wishlist-button:hover .alreadyIconColour,
                #wishlist-guru:hover .alreadyIconColour,
                #inject_wish_button:hover .alreadyIconColour {
                    filter: ${customButton?.hover?.iconColor?.filterColor ||
            customButton.hover.iconColor
            };
                }
            `
            : ""
        }

            ${isCollectionCount
            ? `
                .wf-wishlist-button:hover .buttonStyleHead,
                .wf-wishlist-collection-btn:hover .buttonStyleHead,
                .wf-wishlist-button:hover .alreadyButtonStyleHead,
                .wf-wishlist-collection-btn:hover .alreadyButtonStyleHead {
                    border: none;
                    ${!onlyTextButton
                ? `
                        border-right: ${customButton.hover.border.value}${customButton.hover.border.unit} ${customButton.hover.border.type} ${customButton.hover.border.color} !important;
                    `
                : ""
            }
                    background-color: ${hoverBgColor} !important;
                    color: ${customButton.hover.textColor} !important;
                }

                .wf-wishlist-button:hover,
                .wf-wishlist-collection-btn:hover {
                    ${!onlyTextButton
                ? `
                        border: ${customButton.hover.border.value}${customButton.hover.border.unit} ${customButton.hover.border.type} ${customButton.hover.border.color} !important;
                    `
                : ""
            }
                    background-color: ${onlyTextButton
                ? hoverBgColor
                : customButton.hover.textColor
            } !important;
                    color: ${onlyTextButton
                ? customButton.hover.textColor
                : customButton.hover.bgColor
            } !important;
                }

                .wf-wishlist-button:hover .wf-product-count,
                .wf-wishlist-collection-btn:hover .wf-product-count {
                    color: ${onlyTextButton
                ? customButton.hover.textColor
                : customButton.hover.bgColor
            } !important;
                }

                .wf-wishlist-button:hover .iconDiv,
                .wf-wishlist-collection-btn:hover .iconDiv,
                .wf-wishlist-button:hover .iconDivAlready,
                .wf-wishlist-collection-btn:hover .iconDivAlready {
                    background-color: ${customButton.hover.bgColor} !important;
                    border: ${customButton.hover.border.value}${customButton.hover.border.unit
            } ${customButton.hover.border.type} ${customButton.hover.border.color
            } !important;
                }

                .wf-wishlist-button:hover .iconColour,
                .wf-wishlist-collection-btn:hover .iconColour,
                .wf-wishlist-button:hover .alreadyIconColour,
                 .wf-wishlist-collection-btn:hover .alreadyIconColour {
                    filter: ${customButton?.hover?.iconColor?.filterColor ||
            customButton.hover.iconColor
            };
                }
            `
            : ""
        }
        }

        ${getThemeName?.themeName === "Multi" ? `
            .collection_icon_new, 
            .collection_icon_new_selected {
                 z-index: 30 !important;
            }` : ``}




    @media screen and (max-width:1024px) {
                .menu_moblie.jsmenumobile .menuleft,
                .menu_moblie.jsmenumobile .menuright {
                    width: 100%;
                    max-width: 110px;
                }
                .menu_moblie.jsmenumobile .menuright {
                    display:flex;
                    align-items:center;
                }
            }

        @media screen and (max-width:992px) {
            .main-header__content {
                grid-template-columns: auto 1.5fr 2fr 0.5fr 0.5fr !important;
            }

        }


            @media screen and (max-width:749px) {
            .wg-vision-custom-css .header--inner {
                grid-template-columns: auto auto auto !important;
            }

                .wg-pipeline-headerIcon-mobile {
                display: flex !important;
                }

            .wg-vantage-custom-css .header__shopping-cart-links-container {
                display: flex;
                align-items: center;
                justify-content: flex-end;    
            }
            .wg-vantage-custom-css .wg-vantage-headerIcon-mobile .header-heart-position {
                margin: 0;
            }

            .main-header__content {
                grid-template-columns: auto 2fr 0.5fr 0.5fr !important;
            }


            }


                 @media screen and (max-width: 420px) {
            header nav.header__secondary-nav,
            #section-header .Header__Wrapper .Header__SecondaryNav .header nav.header__secondary-nav .wg-prestige-headerIcon-mobile .header-heart-position {
                margin: 0;
            }
        }

        ${ellaCss}

        ${wgHorizonCss}

        ${wgAtlasCss}

        ${wgMyShopCss}

        ${wgDwellCss}

        ${wgAtlanticCss}

        ${wgRitualCss}

        ${wgReformationCss}

        ${wgBlockshopCss}

        ${wgEurusCss}

        ${wgSunriseCss}

        ${wgAtelierCss}

        ${wgFocalCss}

        ${wgEliteCss}

        ${wgSleekCss}

        ${wgCapitalCss}

        ${wgPrestigeCss}

        ${wgBroadcastCss}

        ${wgRefonteCss}

        ${wgTinkerCss}

        ${wgGainCss}

        ${wgStarliteCss}

    `;

    localStorage.setItem("wg-button-style", buttonStyleHead.innerHTML);
    document.getElementsByTagName("head")[0].appendChild(buttonStyleHead);


}

async function SqlFunction(product) {
    let returnMsg;
    let { accessToken, accessEmail } = getAccessToken();

    try {
        const userData = await fetch(`${serverURL}/create-user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "wg-api-key": getWgApiKey(),
                // "wg-mail": localStorage.getItem("customer-email")
            },
            body: JSON.stringify({
                shopName: permanentDomain,
                // shopEmail: shopEmail,
                plan: currentPlan,
                guestToken: accessToken,
                customerEmail: accessEmail,
                productId: product.productId,
                variantId: product.variantId,
                price: product.price,
                handle: product.handle,
                title: product.title,
                image: product.image,
                quantity: product.quantity,
                storeName: wf_shopName,
                language: product.language,
                wishlistName: product.wishlistName,
                DelWishlistName: product.DelWishlistName,
                wfGetDomain: wfGetDomain,
                specificVariant: isVariantWishlistTrue || null,
                productOption: product?.productOption || null,
            }),
        });
        let result = await userData.json();

        // console.log("create user ---- ", result)

        const prevToken = localStorage.getItem("wg-token");
        const newToken = result?.token;

        // console.log("prevToken --- ", prevToken);
        // console.log("newToken --- ", newToken);


        if ((!prevToken || prevToken !== newToken) && newToken !== "" && newToken !== null && newToken !== undefined) {

            // console.log("-----UPDATING TOKEN-----");

            localStorage.setItem("wg-token", newToken);
        }

        returnMsg = result;
    } catch (error) {
        console.log("errr ", error);
        console.log("Something went wrong.. Please try again later");
    }
    return returnMsg;
}




// ------this is for colection icon with activate app code related to heart-icon.js-----
function findMatchingItemSelected(dataVariantUrl) {
    const extractVariantId = (url) => {
        const startIndex = url.indexOf("/products/") + "/products/".length;
        const endIndex = url.indexOf("/", startIndex);
        const end = endIndex === -1 ? url.indexOf("?", startIndex) : endIndex;
        return url.substring(startIndex, end);
    };
    const swatches = document.querySelectorAll(".swatches li");
    let selectedSwatch = null;
    for (const swatch of swatches) {
        const variantUrl = swatch.getAttribute("data-variant-url");
        if (variantUrl) {
            const variantId = extractVariantId(variantUrl);
            if (variantId === dataVariantUrl) {
                if (swatch.classList.contains("item-selected")) {
                    return swatch;
                } else {
                    selectedSwatch = selectedSwatch || swatch;
                }
            }
        }
    }
    return selectedSwatch || null;
}

document.addEventListener('mouseover', (event) => {
    if (event.target.nodeType === 1) {
        const { isComboIcon } = checkCollectionIcon()
        const nearestWishlistDiv = event.target.closest('.wg-collectionIcon, .icon-collection ');
        const toggleHoverIcon = (element, blankClass, solidClass, defaultColor) => {
            requestAnimationFrame(() => {
                element.style.filter = defaultColor;
                element.classList.remove(blankClass);
                element.classList.add(solidClass);
            });
            element.addEventListener('mouseleave', () => {
                requestAnimationFrame(() => {
                    if (!element.classList.contains('selected')) {
                        element.style.filter = defaultColor;
                        element.classList.remove(solidClass);
                        element.classList.add(blankClass);
                    }
                });
            }, { once: true });
        };
        if (nearestWishlistDiv && isComboIcon) {
            const icons = [
                { blank: 'wg-heart-icon-blank', solid: 'wg-heart-icon-solid' },
                { blank: 'wg-star-icon-blank', solid: 'wg-star-icon-solid' },
                { blank: 'wg-save-icon-blank', solid: 'wg-save-icon-solid' }
            ];
            icons.forEach(icon => {
                if (nearestWishlistDiv.classList.contains(icon.blank)) {
                    toggleHoverIcon(
                        nearestWishlistDiv,
                        icon.blank,
                        icon.solid,
                        colIconDefaultColor
                    );
                }
            });
        }
    }
}, true);

// function checkCollectionIcon() {
//     const isComboIcon = (collectionBtnSetting.collectionIconType === 'comboHeart' || collectionBtnSetting.collectionIconType === 'comboStar' || collectionBtnSetting.collectionIconType === 'comboSave')
//     const isComboHeart = collectionBtnSetting.collectionIconType === 'comboHeart';
//     const isComboStar = collectionBtnSetting.collectionIconType === 'comboStar';
//     const isComboSave = collectionBtnSetting.collectionIconType === 'comboSave';

//     return { isComboIcon, isComboHeart, isComboStar, isComboSave }
// }

function checkCollectionIcon() {
    const { collectionIconType } = collectionBtnSetting;
    const validTypes = ["comboHeart", "comboStar", "comboSave"];

    return {
        isComboIcon: validTypes.includes(collectionIconType),
        isComboHeart: collectionIconType === "comboHeart",
        isComboStar: collectionIconType === "comboStar",
        isComboSave: collectionIconType === "comboSave",
    };
}


// -------------------------------this code relateed to collection modal icon------------------------
async function collectionBtnAddedRemoveWishlist(selectedId, productHandle, addedText) {
    if (currentCollectionSeting.quickViewShowAs === "icon") {
        const collectionIcon = document.querySelectorAll('.wf-wishlist-collection-icon-modal')
        const position = currentCollectionSeting.quickViewShowOptionAddToCartPosition;
        let themeSelectors = detechThemeName()
        document.querySelectorAll(`.wf-wishlist-collection-icon-modal ${themeSelectors.modalbuttonAppendOnTitle} `);
        const iconPosition = await whichClassIsModalAdded();
        let imgHeight = 10;
        let themeName = "Dawn"
        if (iconPosition.checkClassExist === true) {
            let getProductEle1 = document.querySelectorAll('.wf-wishlist-collection-icon-modal.wf-img')
            imgHeight = getProductEle1[0].previousSibling.clientHeight - Number(iconPosition.iconHeight) - 5
        }
        let updateWishlistIconCollection = "";
        let updateWishlistIconCollectionTitle = "";
        let updateWishlistIconCollectionCart = "";

        updateWishlistIconCollection += `<div class="${addedText === 'added' ? "collection_icon_new_selected" : "collection_icon_new"} ${iconPosition.iconPosition}" style="${iconPosition.checkClassExist === true ? `top :${imgHeight}px;` : ''}"><div style="${addedText === 'added' ? `filter: ${colIconSelectedColor};` : `filter: ${colIconDefaultColor};`} ${collectionIconSize()}" onClick="collectionIconClickModal(event,${selectedId}, '${productHandle}')" class="${iconPosition.iconStyle}"><span class="span-hearticon"></span></div></div>`;
        updateWishlistIconCollectionTitle += `<div class="${addedText === 'added' ? "collection_icon_new_selected" : "collection_icon_new"}  ${currentCollectionSeting.quickViewShowOptionTitle === true ? "modal-icon" : ""} "><div style="${addedText === 'added' ? `filter: ${colIconSelectedColor};` : `filter: ${colIconDefaultColor};`} ${collectionIconSize()}" onClick="collectionIconClickModal(event,${selectedId}, '${productHandle}')" class="${iconPosition.iconStyle}"><span class="span-hearticon"></span></div></div>`;
        updateWishlistIconCollectionCart += `<div class="${addedText === 'added' ? "collection_icon_new_selected" : "collection_icon_new"} ${position === 'left-icon-position' ? "icon-cart-left" : position === 'right-icon-position' ? "icon-cart-right" : position === "center-icon-position" && "icon-cart-center"}"><div style="${addedText === 'added' ? `filter: ${colIconSelectedColor};` : `filter: ${colIconDefaultColor};`} ${collectionIconSize()}" onClick="collectionIconClickModal(event,${selectedId}, '${productHandle}')" class="${iconPosition.iconStyle}"><span class="span-hearticon"></span></div></div>`

        if (collectionBtnSetting.isQuickViewShowOptionTitle) {
            const iconAppendOnTitle = document.querySelectorAll(`.wf-wishlist-collection-icon-modal.wf-title`);
            iconAppendOnTitle[0].innerHTML = updateWishlistIconCollectionTitle;
        }
        if (collectionBtnSetting.isQuickViewShowOptionImage) {
            const elements = document.querySelectorAll(".wf-wishlist-collection-icon-modal.wf-img");
            elements.forEach(element => {
                element.innerHTML = updateWishlistIconCollection// Replace "Your HTML content here" with the HTML you want to add
            });
        }
        if (collectionBtnSetting.isQuickViewShowOptionAddToCart) {
            if (currentCollectionSeting.quickViewShowOptionAddToCart === 'icon-below') {
                const cartBelowIcn = document.querySelectorAll(`.wf-wishlist-collection-icon-modal.wf-cart`)
                cartBelowIcn[0].innerHTML = updateWishlistIconCollectionCart
                const cartBelowAddIcn = document.querySelector(themeSelectors.modalbuttonAppend)
                cartBelowAddIcn.parentNode.style.flexDirection = "column";
            } else {
                const cartAboveIcn = document.querySelector(themeSelectors.modalbuttonAppend).previousSibling;
                const cartAboveAddIcn = document.querySelector(themeSelectors.modalbuttonAppend)
                cartAboveAddIcn.parentNode.style.flexDirection = "column";
                cartAboveIcn.innerHTML = updateWishlistIconCollectionCart.innerHTML
            }
        }
    } else {
        const addToWishlistData = await renderButtonAddToWishlist(selectedId, isCollectionCount);
        const alreadyAddedToWishlistData = await renderButtonAddedToWishlist(selectedId, isCollectionCount);

        let getModalButton = document.querySelectorAll('.wf-wishlist-collection-icon-modal');
        let addWishlistModalButton = document.createElement("div");
        addWishlistModalButton.style.zIndex = "10";
        addWishlistModalButton.style.position = "relative";
        addWishlistModalButton.innerHTML = addedText === 'added' ? `<div onClick="collectionIconClickModal(event,${selectedId}, '${productHandle}')" class="modalButtonCollection" >${alreadyAddedToWishlistData}</div>` : `<div onClick="collectionIconClickModal(event,${selectedId}, '${productHandle}')" class="modalButtonCollection" >${addToWishlistData}</div>`

        if (currentCollectionSeting.quickViewShowOption === 'button-below') {
            const dddd = document.querySelector(themeSelectors.modalbuttonAppend).nextSibling
            dddd.innerHTML = addWishlistModalButton.innerHTML
        } else {
            const dddd1 = document.querySelector(themeSelectors.modalbuttonAppend).previousSibling;
            dddd1.innerHTML = addWishlistModalButton.innerHTML
        }
    }
};

async function collectionIconClickModal(event, selectedId, handle) {
    const modalElementSelector = document.querySelector(modalProductElement);
    const actionsWithCartAdd = modalElementSelector.querySelectorAll('[action="/cart/add"]');
    let productVariantValue;
    actionsWithCartAdd.forEach(action => {
        const variantInputCandidate = action.querySelector('.product-variant-id');
        if (variantInputCandidate) {
            productVariantValue = variantInputCandidate.value;
            return;
        }
    });
    if (currentPlan >= 2) {
        try {
            const response = await fetch(`${wfGetDomain}products/${handle}.js`);
            const jsonData = await response.json();
            if (settingCurrentFilter === "boost") {
                jsonData.variants.find((variant, i) => {
                    if (Object.keys(variantIds).length === 0) {
                        productVariantValue = jsonData.variants[0].id;
                    } else if (variantIds.includes(variant.title)) {
                        productVariantValue = variant.id;
                    }
                });
            }
            const currentVariantImg = jsonData.variants.find((variant) => {
                if (variant.id === Number(productVariantValue))
                    return variant;
            });
            const filteredImages = jsonData.images.filter((image) => {
                return image.id === currentVariantImg.image_id;
            });
            if (filteredImages.length === 0 && jsonData.images.length > 0) {
                filteredImages.push(jsonData.images[0]);
            }
            let data = {
                productId: jsonData.id,
                variantId: productVariantValue,
                price: currentVariantImg.price,
                handle: jsonData.handle,
                title: jsonData.title,
                image: filteredImages.length != 0 ? filteredImages[0] : "",
                quantity: 1,
                language: wfGetDomain
            }
            let result = await SqlFunction(data);
            if (result.msg === "item added") {
                alertToast(`${customLanguage.addToWishlistNotification}`);
                collectionBtnAddedRemoveWishlist(selectedId, handle, "added")
                customIconAddedRemoveToWishlist(selectedId, "filter")
                buttonAddedRemoveWishlist(selectedId, "added")
                injectButtonAddedRemoveWishlist(selectedId, "added")
                collectionIcon(selectedId, "filter")
                showCountAll();
                (currentPlan > 1) && fxnAfterAddToWishlist();
            }
            if (result.msg === "item removed") {
                alertToast(`${customLanguage.removeFromWishlistNotification}`);
                collectionBtnAddedRemoveWishlist(selectedId, handle, "")
                customIconAddedRemoveToWishlist(selectedId, "")
                buttonAddedRemoveWishlist(selectedId, "")
                collectionIcon(selectedId, "")
                injectButtonAddedRemoveWishlist(selectedId, "")
                showCountAll();
                (currentPlan > 1) && fxnAfterRemoveFromWishlist();
            }
            if (result.msg === "limit cross") {
                alertContent(customLanguage?.quotaLimitAlert || "Wishlist Quota of this store reached its monthly limit, We have notified store owner to upgrade their plan. Sorry for the inconvenience")
            }
            wishlistIcon();
            wishlistButtonForCollection()
        } catch (error) {
            console.error("Error:", error);
        }
    } else {
        alertContent("Quick Add is not added to your plan.. Please Contact site administrator")
    }
};

// ------------------------shared wishlist page functionality------------------------

function isIconTypeValid(iconType) {
    const validIconTypes = [
        "heartSolid",
        "heartBlank",
        "starSolid",
        "starBlank",
        "saveSolid",
        "saveBlank",
        "comboHeart",
        "comboStar",
        "comboSave",
    ];
    const isValidate = validIconTypes.includes(iconType);
    return isValidate;
}

function getFontWt(headingText, bodyText) {
    const fontWeights = {
        light: 200,
        normal: 400,
        "semi-bold": 600,
        bold: "bold",
        bolder: "bolder",
    };

    // generalSetting?.wlHeadingFontWt, generalSetting?.wlTextFontWt

    const headingFw = fontWeights[headingText] || 600;
    const textFw = fontWeights[bodyText] || 400;
    return { headingFw, textFw };
}

function styleForTooltipArrow() {
    let addd = 5 + parseInt(generalSetting.borderInput);
    let subb = 4 - generalSetting.borderInput;
    let cccc = 6 + parseInt(generalSetting.borderInput);
    let notificationStyle = document.createElement("style");
    notificationStyle.innerHTML = `
  .tooltiptext-above::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: ${generalSetting.notificationBorderColor} transparent transparent transparent;
    }
    .tooltiptext-above::before{
      content: "";
      position: absolute;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      top: 99%;
      left: 50%;
      border-top: ${generalSetting.borderInput}${generalSetting.borderInputUnit} ${generalSetting.borderType} ${generalSetting.notificationBorderColor};
      border-width: ${addd}${generalSetting.borderInputUnit};
      margin-left: -${cccc}${generalSetting.borderInputUnit};
      border-color: ${generalSetting.bgColor} transparent transparent transparent;
  }
  .tooltiptext-below::after {
      content: "";
      position: absolute;
      bottom: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: transparent transparent ${generalSetting.notificationBorderColor} transparent;
  }
  .tooltiptext-below::before{
      content: "";
      position: absolute;
      bottom: 100%;
      left: 50%;
      margin-left: -${cccc}${generalSetting.borderInputUnit};
      border-width: ${cccc}${generalSetting.borderInputUnit};
      border-style: solid;
      border-color: transparent transparent ${generalSetting.notificationBorderColor} transparent;
   }`;
    document.getElementsByTagName("head")[0].appendChild(notificationStyle);
};

function notificationOfRemoved() {

    const notificationStyle = notificationStyleFxn();
    const notificationTextStyle = notificationTextStyleFxn()
    const notificationDivId = document.getElementById("notificationDiv")
    const notificationAbove = document.querySelector('.wf-text-notification-above')
    const notificationBelow = document.querySelector('.wf-text-notification-below')
    styleForTooltipArrow();
    if (generalSetting.wishlistOrNotification === "show-wishlist") {
        // console.log("item removed");
    }
    if (generalSetting.wishlistOrNotification === "show-notification") {
        if (generalSetting.notificationTypeOption === "toast-center") {
            notificationDivId.style.display = "block";
            let toastCenter = `<div style="${notificationStyle}" class="toast-bottom-center toast-alignment">${customLanguage.removeFromWishlistNotification}</div>`;
            notificationDivId.innerHTML = toastCenter;
        }
        else if (generalSetting.notificationTypeOption === "toast-left") {
            notificationDivId.style.display = "block";
            let toastLeft = `<div style="${notificationStyle}" class="toast-bottom-left toast-alignment">${customLanguage.removeFromWishlistNotification}</div>`;
            notificationDivId.innerHTML = toastLeft;
        }
        else if (generalSetting.notificationTypeOption === "toast-right") {
            notificationDivId.style.display = "block";
            let toastRight = `<div style="${notificationStyle}" class="toast-bottom-right toast-alignment">${customLanguage.removeFromWishlistNotification}</div>`;
            notificationDivId.innerHTML = toastRight;
        }
        else if (generalSetting.notificationTypeOption === "toast-top-right") {
            notificationDivId.style.display = "block";
            let toastRight = `<div style="${notificationStyle}" class="toast-top-right toast-alignment">${customLanguage.removeFromWishlistNotification}</div>`;
            notificationDivId.innerHTML = toastRight;
        }
        else if (generalSetting.notificationTypeOption === "toast-top-left") {
            notificationDivId.style.display = "block";
            let toastRight = `<div style="${notificationStyle}" class="toast-top-left toast-alignment">${customLanguage.removeFromWishlistNotification}</div>`;
            notificationDivId.innerHTML = toastRight;
        }
        else if (generalSetting.notificationTypeOption === "toast-top-center") {
            notificationDivId.style.display = "block";
            let toastRight = `<div style="${notificationStyle}" class="toast-top-center toast-alignment">${customLanguage.removeFromWishlistNotification}</div>`;
            notificationDivId.innerHTML = toastRight;
        }
        // notificationTextStyle
        else if (generalSetting.notificationTypeOption === "text-above") {
            notificationAbove.style.display = "block"
            let tooltipAbove = `<span style="${notificationStyle}" class="text-above" >${customLanguage.removeFromWishlistNotification}</span>`;
            document.querySelector('.wf-text-notification-above').innerHTML = tooltipAbove;
        }
        else if (generalSetting.notificationTypeOption === "text-below") {
            notificationBelow.style.display = "block"
            let tooltipRight = `<span style="${notificationStyle}" class="text-bottom" >${customLanguage.removeFromWishlistNotification}</span>`;
            document.querySelector('.wf-text-notification-below').innerHTML = tooltipRight;
        }
        else if (generalSetting.notificationTypeOption === "tool-tip-above") {
            let tooltipAbove = `<span style="${notificationStyle}" class="tooltiptext-above">${customLanguage.removeFromWishlistNotification}</span>`;
            document.querySelector(".tooltip-above").innerHTML = tooltipAbove;
        }
        else {
            let tooltipBelow = `<span style="${notificationStyle}" class="tooltiptext-below">${customLanguage.removeFromWishlistNotification}</span>`;
            document.querySelector(".tooltip-below").innerHTML = tooltipBelow;
        }
    }
    clearNotification();
};

function notificationOfAdded() {

    const notificationDivId = document.getElementById("notificationDiv")
    const notificationAbove = document.querySelector('.wf-text-notification-above')
    const notificationBelow = document.querySelector('.wf-text-notification-below')
    const notificationStyle = notificationStyleFxn();
    const notificationTextStyle = notificationTextStyleFxn()
    styleForTooltipArrow();
    if (generalSetting.wishlistOrNotification === "show-wishlist") {
        heartButtonHandle();
    }
    if (generalSetting.wishlistOrNotification === "show-notification") {
        if (generalSetting.notificationTypeOption === "toast-center") {
            notificationDivId.style.display = "block";
            let toastCenter = `<div style="${notificationStyle}" class="toast-bottom-center toast-alignment">${customLanguage.addToWishlistNotification}</div>`;
            notificationDivId.innerHTML = toastCenter;
        }
        else if (generalSetting.notificationTypeOption === "toast-left") {
            notificationDivId.style.display = "block";
            let toastLeft = `<div style="${notificationStyle}" class="toast-bottom-left toast-alignment">${customLanguage.addToWishlistNotification}</div>`;
            notificationDivId.innerHTML = toastLeft;
        }
        else if (generalSetting.notificationTypeOption === "toast-right") {
            notificationDivId.style.display = "block";
            let toastRight = `<div style="${notificationStyle}" class="toast-bottom-right toast-alignment">${customLanguage.addToWishlistNotification}</div>`;
            notificationDivId.innerHTML = toastRight;
        }
        else if (generalSetting.notificationTypeOption === "toast-top-right") {
            notificationDivId.style.display = "block";
            let toastRight = `<div style="${notificationStyle}" class="toast-top-right toast-alignment">${customLanguage.addToWishlistNotification}</div>`;
            notificationDivId.innerHTML = toastRight;
        }
        else if (generalSetting.notificationTypeOption === "toast-top-left") {
            notificationDivId.style.display = "block";
            let toastRight = `<div style="${notificationStyle}" class="toast-top-left toast-alignment ">${customLanguage.addToWishlistNotification}</div>`;
            notificationDivId.innerHTML = toastRight;
        }
        else if (generalSetting.notificationTypeOption === "toast-top-center") {
            notificationDivId.style.display = "block";
            let toastRight = `<div style="${notificationStyle}" class="toast-top-center toast-alignment">${customLanguage.addToWishlistNotification}</div>`;
            notificationDivId.innerHTML = toastRight;
        }

        // notificationTextStyle
        else if (generalSetting.notificationTypeOption === "text-above") {
            notificationAbove.style.display = "block"
            let tooltipAbove = `<span style="${notificationStyle}" class="text-above" >${customLanguage.addToWishlistNotification}</span>`;
            document.querySelector('.wf-text-notification-above').innerHTML = tooltipAbove;
        }
        else if (generalSetting.notificationTypeOption === "text-below") {
            notificationBelow.style.display = "block"
            let tooltipBelow = `<span style="${notificationStyle}" class="text-bottom" >${customLanguage.addToWishlistNotification}</span>`;
            document.querySelector('.wf-text-notification-below').innerHTML = tooltipBelow;
        }
        else if (generalSetting.notificationTypeOption === "tool-tip-above") {
            let tooltipAbove = `<span style="${notificationStyle}" class="tooltiptext-above">${customLanguage.addToWishlistNotification}</span>`;
            document.querySelector(".tooltip-above").innerHTML = tooltipAbove;
        }
        else {
            let tooltipBelow = `<span style="${notificationStyle}" class="tooltiptext-below">${customLanguage.addToWishlistNotification}</span>`;
            document.querySelector(".tooltip-below").innerHTML = tooltipBelow;
        }
    }
    clearNotification();
};

function clearNotification() {
    const notificationDivId = document.getElementById("notificationDiv")
    setTimeout(() => {
        document.getElementById("notificationDiv").innerHTML = "";
        document.querySelector(".tooltip-above").innerHTML = "";
        document.querySelector(".tooltip-below").innerHTML = "";
        document.querySelector('.our-sweetalert').innerHTML = "";
        notificationDivId.style.display = "block";

        const notificationAbove = document.querySelector('.wf-text-notification-above')
        const notificationBelow = document.querySelector('.wf-text-notification-below')
        if (notificationAbove) {
            document.querySelector('.wf-text-notification-above').style.display = "none";
            document.querySelector('.wf-text-notification-above').innerHTML = "";
        }
        if (notificationBelow) {
            document.querySelector('.wf-text-notification-below').style.display = "none";
            document.querySelector('.wf-text-notification-below').innerHTML = "";
        }
    }, Number(generalSetting.notificationTimer) * 1000);
};


async function openShareWishlistModal(singleWishlist = "") {
    let addLinkContent = document.querySelectorAll(".modal-inside");
    for (let wf = 0; wf < addLinkContent.length; wf++) {
        addLinkContent[wf].innerHTML = `<div>${storeFrontDefLang?.loadingText}</div>`;
    }
    spanLink.onclick = function () {
        modalLink.style.display = "none";
    };
    modalLink.style.display = "block";
    createShareWishlistLink(singleWishlist);
}

// async function wishlistUrlCreator() {
//     var pageUrl;
//     await getIdToShareWishlist().then((res) => {
//         pageUrl = `${wfGetDomain}apps/wg-wishlist?id=${res}`;
//     });
//     return pageUrl;
// }

async function wishlistUrlCreator(sharedName) {
    var pageUrl;
    await getIdToShareWishlist().then((res) => {
        pageUrl = `${wfGetDomain}apps/wg-wishlist?id=${res}&name=${sharedName}`;
    });

    return pageUrl;
}

function renderBorder(msg, isCountValid) {
    if (!isCountValid) return;

    const wishlistDiv = document.getElementById("wishlist-guru");
    const injectDiv = document.getElementById("inject_wish_button");

    const borderColor =
        msg === "added"
            ? `${customButton.activeBtn.border.value}${customButton.activeBtn.border.unit} ${customButton.activeBtn.border.type} ${customButton.activeBtn.border.color}`
            : `${customButton.border.value}${customButton.border.unit} ${customButton.border.type} ${customButton.border.color}`;

    const textColor =
        msg === "added" ? customButton.activeBtn.textColor : customButton.textColor;

    const helloBgColor =
        msg === "added"
            ? onlyTextButton
                ? "transparent"
                : customButton.activeBtn.bgColor
            : onlyTextButton
                ? "transparent"
                : customButton.bgColor;

    const isIconType = customButton.type === "icon";
    const activeColor =
        customButton?.activeBtn?.iconColor?.color ||
        filterToHex(customButton?.activeBtn?.iconColor);
    const defaultColor =
        customButton?.iconColor?.color || filterToHex(customButton?.iconColor);

    const bgColor =
        msg === "added"
            ? isIconType
                ? activeColor
                : textColor
            : isIconType
                ? defaultColor
                : textColor;

    const setDivStyles = (div, border) => {
        if (!div) return;

        if (onlyTextButton) {
            div.style.backgroundColor = helloBgColor;
            div.style.color = bgColor;
        } else {
            div.style.backgroundColor = bgColor;
        }
        div.style.border = !onlyTextButton ? border : "";
    };

    const setCountStyles = () => {
        const countDiv = document.querySelector(
            "#wishlist-guru .wf-product-count, #inject_wish_button .wf-product-count"
        )
        if (!countDiv) return;
        if (onlyTextButton) {
            countDiv.style.color = bgColor;
        } else {
            countDiv.style.color = helloBgColor;
        }
        countDiv.style.fontSize = `${customButton.fontSize.value}${customButton.fontSize.unit}`;
        countDiv.style.fontFamily = `${customButton.fontFamily}`;
        countDiv.style.borderRadius = `0 ${customButton.borderRadius.value}${customButton.borderRadius.unit} ${customButton.borderRadius.value}${customButton.borderRadius.unit} 0`;
    };

    setDivStyles(wishlistDiv, borderColor);
    setDivStyles(injectDiv, borderColor);
    setCountStyles();
    collectionIconSize();
}

function renderCollectionTextColor(msg, proId, isCollectionCount) {

    if (isCollectionCount) {
        const countDiv = document.querySelectorAll(
            `.wf-wishlist[product-id='${proId}'] .wf-product-count`
        );
        const countDivAutoInject = document.querySelectorAll(
            `.wf-wishlist-collection-icon[product-id='${proId}'] .wf-product-count`
        );
        const { isComboIcon } = checkCollectionIcon();

        // console.log("isComboIcon -- ", isComboIcon)

        const iconSelectedColor = isComboIcon
            ? collectionBtnSetting?.iconDefaultColor?.color
                ? collectionBtnSetting?.iconDefaultColor?.color
                : filterToHex(collectionBtnSetting?.iconDefaultColor)
            : collectionBtnSetting?.iconSelectedColor?.color
                ? collectionBtnSetting?.iconSelectedColor?.color
                : filterToHex(collectionBtnSetting?.iconSelectedColor);


        // console.log("iconSelectedColor -- ", iconSelectedColor)


        if (msg === "added") {

            // countDiv && (countDiv.style.color = iconSelectedColor);
            countDiv &&
                (countDiv.forEach((element) => {
                    element.style.color = iconSelectedColor;
                }))

            // countDivAutoInject &&
            //     (countDivAutoInject.style.color = iconSelectedColor);
            countDivAutoInject &&
                (countDivAutoInject.forEach((element) => {
                    element.style.color = iconSelectedColor
                }))

        } else {

            // countDiv &&
            //     (countDiv.style.color = collectionBtnSetting?.iconDefaultColor?.color
            //         ? collectionBtnSetting?.iconDefaultColor?.color
            //         : filterToHex(collectionBtnSetting?.iconDefaultColor));

            countDiv &&
                (countDiv.forEach((element) => {
                    element.style.color = collectionBtnSetting?.iconDefaultColor?.color
                        ? collectionBtnSetting?.iconDefaultColor?.color
                        : filterToHex(collectionBtnSetting?.iconDefaultColor)
                }))

            // countDivAutoInject &&
            //     (countDivAutoInject.style.color = collectionBtnSetting?.iconDefaultColor
            //         ?.color
            //         ? collectionBtnSetting?.iconDefaultColor?.color
            //         : filterToHex(collectionBtnSetting?.iconDefaultColor));

            countDivAutoInject &&
                (countDivAutoInject.forEach((element) => {
                    element.style.color = collectionBtnSetting?.iconDefaultColor
                        ?.color
                        ? collectionBtnSetting?.iconDefaultColor?.color
                        : filterToHex(collectionBtnSetting?.iconDefaultColor)
                }))


        }
    }
}

function renderCustomButtonBorder(msg, proId, isCountValid) {
    if (!isCountValid) return;

    const getSelector = (selector) => document.querySelector(`${selector}[product-id='${proId}']`);
    const mainButtonBox = getSelector(".wf-wishlist-button");
    const mainColButtonBox = getSelector(".wf-wishlist-collection-btn");

    const isAdded = msg === "added";
    const bgColor = onlyTextButton
        ? "transparent"
        : isAdded
            ? customButton.activeBtn.bgColor
            : customButton.bgColor;
    const textColor = isAdded
        ? customButton.activeBtn.textColor
        : customButton.textColor;
    const border = !onlyTextButton
        ? `${isAdded
            ? customButton.activeBtn.border.value
            : customButton.border.value
        }${customButton.border.unit} ${customButton.border.type} ${isAdded
            ? customButton.activeBtn.border.color
            : customButton.border.color
        }`
        : "none";
    const iconColor =
        customButton.type === "icon"
            ? (isAdded ? customButton.activeBtn.iconColor : customButton.iconColor)
                .color ||
            filterToHex(
                isAdded ? customButton.activeBtn.iconColor : customButton.iconColor
            )
            : textColor;

    const applyStyles = (element) => {
        if (!element) return;
        element.style.backgroundColor = onlyTextButton ? "transparent" : iconColor;
        element.style.border = border;
    };

    applyStyles(mainButtonBox);
    applyStyles(mainColButtonBox);

    const applyCountDivStyles = (countDiv) => {
        if (!countDiv) return;
        countDiv.style.color = onlyTextButton ? textColor : bgColor;
        countDiv.style.fontSize = `${customButton.fontSize.value}${customButton.fontSize.unit}`;
        countDiv.style.fontFamily = `${customButton.fontFamily}, ${getFontFamily}, ${getFontFamilyFallback}`;
        countDiv.style.borderRadius = `0 ${customButton.borderRadius.value}${customButton.borderRadius.unit} ${customButton.borderRadius.value}${customButton.borderRadius.unit} 0`;
    };

    applyCountDivStyles(mainButtonBox?.querySelector(".wf-product-count"));
    applyCountDivStyles(mainColButtonBox?.querySelector(".wf-product-count"));
}

function filterToHex(filterColor) {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.filter = filterColor;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return (
        "#" +
        ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()
    );
}

function getAccessToken() {
    let accessToken;
    // if (localStorage.getItem("access-token") === null) {
    if (getAccessTokenFromCookie() === null) {
        const newDATE = new Date();
        const formattedDateTime = newDATE.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        accessToken = btoa((Math.random() + 1).toString(36).substring(2) + formattedDateTime);
        saveAccessTokenInCookie(accessToken)
        // if (permanentDomain === 'wantitbuyit-wibi.myshopify.com') {
        //     document.cookie = `access-token=${accessToken}; path=/; domain=.wibi.com.kw; secure`;
        // } else {
        //     localStorage.setItem("access-token", accessToken);
        // }
        // accessToken = btoa((Math.random() + 1).toString(36).substring(2) + formattedDateTime);
        // localStorage.setItem("access-token", accessToken);
    } else {
        accessToken = getAccessTokenFromCookie();
        // accessToken = localStorage.getItem("access-token");
    }
    let accessEmail;
    if (getCustomerEmailFromCookie() === null) {
        accessEmail = customerEmail;
        saveCustomerEmailInCookie(customerEmail);
        // localStorage.setItem("customer-email", customerEmail);
    }
    else {
        if (getCustomerEmailFromCookie() === customerEmail) {
            accessEmail = getCustomerEmailFromCookie();
        }
        else {
            if (getCustomerEmailFromCookie() !== "" && customerEmail === "") {
                accessEmail = getCustomerEmailFromCookie();
            }
            else {
                if (getCustomerEmailFromCookie() !== "" && getCustomerEmailFromCookie() !== customerEmail) {
                    accessEmail = customerEmail;
                    saveCustomerEmailInCookie(customerEmail);
                    // localStorage.setItem("customer-email", customerEmail);
                }
                else {
                    accessEmail = customerEmail;
                    saveCustomerEmailInCookie(customerEmail);
                    // localStorage.setItem("customer-email", customerEmail);
                }
            }
        }
    }
    return { accessToken, accessEmail }
}

function openShareWishlistModalLink() {
    var pageUrl = wishlistUrlCreator();
    copyUrl(`${pageUrl}`);
}

async function createShareWishlistLink(singleWishlist = "") {
    document.querySelectorAll(".sharable-link-heading").forEach((element) => {
        element.innerHTML = customLanguage.sharableLinkModalHeading;
    });
    const sendID = await getCurrentLoginFxn() || getAccessTokenFromCookie();
    // const sendID = await getCurrentLoginFxn() || localStorage.getItem("access-token");
    try {
        const response = await fetch(`${serverURL}/get-id-from-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                shopName: permanentDomain,
                email: sendID,
                shopDomain: shopDomain,
            }),
        });
        const result = await response.json();
        const getID = result.data?.[0]?.id;
        if (!getID) throw new Error("User ID not found");
        const encryptedEmail = btoa(getID);
        const encryptedName = btoa('url');
        // const pageUrl = `${wfGetDomain}apps/wg-wishlist?id=${encryptedEmail}&name=${encryptedName}`;
        let pageUrl;
        if (singleWishlist !== "") {
            pageUrl = `${wfGetDomain}apps/wg-wishlist?id=${encryptedEmail}&name=${encryptedName}&wid=${singleWishlist}`;
        } else {
            pageUrl = `${wfGetDomain}apps/wg-wishlist?id=${encryptedEmail}&name=${encryptedName}`;
        }
        await Conversion("url", getID, "noReload");
        const pageUrlDiv = `
            <div class="share-url-div">
                <div class="share-url-text">${pageUrl}</div>
                <div class="deleteIconStyle copyICON" onClick="copyUrl('${pageUrl}')">
                    <span></span>
                </div>
            </div>
        `;

        document.querySelectorAll(".modal-inside").forEach((element) => {
            element.innerHTML = pageUrlDiv;
        });
    } catch (error) {
        console.error("Error: ", error);

        const fallbackMessage = "Firstly add items to your wishlist to share";
        document.querySelectorAll(".modal-inside").forEach((element) => {
            element.innerHTML = fallbackMessage;
        });
    }
}

function copyUrl(data) {
    navigator.clipboard.writeText(data);
    alertToast(`${customLanguage.alertForLinkCopied}`);
}

function notificationStyleFxn() {
    const notificationStyle = `background-color: ${generalSetting.notificationTypeOption === "text-below" ||
        generalSetting.notificationTypeOption === "text-above"
        ? "transparent"
        : generalSetting.bgColor
        };  
    color: ${generalSetting.textColor}; 
    max-width: 90%;
    border: ${generalSetting.notificationTypeOption === "text-below" ||
            generalSetting.notificationTypeOption === "text-above"
            ? "none"
            : `${generalSetting.borderInput}${generalSetting.borderInputUnit} ${generalSetting.borderType} ${generalSetting.notificationBorderColor}`
        };
    border-radius: ${generalSetting.borderRadius}${generalSetting.borderRadiusUnit
        }; 
    font-size: ${generalSetting.fontSize}${generalSetting.fontSizeUnit}; 
    
    padding: ${generalSetting.paddingTopBottom}${generalSetting.paddingTopBottomUnit
        } ${generalSetting.paddingLeftRight}${generalSetting.paddingLeftRightUnit}; 
    margin: ${generalSetting.marginTopBottom}${generalSetting.marginTopBottomUnit
        } ${generalSetting.marginLeftRight}${generalSetting.marginLeftRightUnit};
    text-align: ${generalSetting.textAlign};
    ${generalSetting?.fontFamily
            ? `font-family: ${generalSetting?.fontFamily} !important;`
            : ""
        }

`;

    return notificationStyle;
}

function notificationTextStyleFxn() {
    const notificationextStyle = `
    color: ${generalSetting.textColor}; 
    font-size: ${generalSetting.fontSize}${generalSetting.fontSizeUnit};
    ${generalSetting?.fontFamily
            ? `font-family: ${generalSetting?.fontFamily} !important;`
            : ""
        }
    padding: ${generalSetting.PaddingTopBottom}${generalSetting.PaddingTopBottomUnit
        } ${generalSetting.paddingLeftRight}${generalSetting.paddingLeftRightUnit};  
    margin: ${generalSetting.marginTopBottom}${generalSetting.marginTopBottomUnit
        } ${generalSetting.marginLeftRight}${generalSetting.marginLeftRightUnit};
    text-align: ${generalSetting.textAlign};`;
    return notificationextStyle;
}

function alertContent(text) {
    const notificationStyle = notificationStyleFxn();
    if (generalSetting.notificationTypeOption === "toast-left") {
        let toastLeft = `<div style="${notificationStyle}" class="toast-bottom-left toast-alignment"><span class="alert-cross-icon" onClick="closeNortiFxn()">X</span> ${text}</div>`;
        document.querySelector(".our-sweetalert").innerHTML = toastLeft;
    } else if (generalSetting.notificationTypeOption === "toast-right") {
        let toastRight = `<div style="${notificationStyle}" class="toast-bottom-right toast-alignment"><span class="alert-cross-icon" onClick="closeNortiFxn()">X</span> ${text}</div>`;
        document.querySelector(".our-sweetalert").innerHTML = toastRight;
    } else if (generalSetting.notificationTypeOption === "toast-top-right") {
        let toastRight = `<div style="${notificationStyle}" class="toast-top-right toast-alignment"><span class="alert-cross-icon" onClick="closeNortiFxn()">X</span> ${text}</div>`;
        document.querySelector(".our-sweetalert").innerHTML = toastRight;
    } else if (generalSetting.notificationTypeOption === "toast-top-left") {
        let toastRight = `<div style="${notificationStyle}" class="toast-top-left toast-alignment"><span class="alert-cross-icon" onClick="closeNortiFxn()">X</span> ${text}</div>`;
        document.querySelector(".our-sweetalert").innerHTML = toastRight;
    } else if (generalSetting.notificationTypeOption === "toast-top-center") {
        let toastRight = `<div style="${notificationStyle}" class="toast-top-center toast-alignment"><span class="alert-cross-icon" onClick="closeNortiFxn()">X</span> ${text}</div>`;
        document.querySelector(".our-sweetalert").innerHTML = toastRight;
    } else {
        let toastCenter = `<div style="${notificationStyle} background-color: ${generalSetting.bgColor};" class="toast-bottom-center toast-alignment"><span class="alert-cross-icon" onClick="closeNortiFxn()">X</span> ${text}</div>`;
        document.querySelector(".our-sweetalert").innerHTML = toastCenter;
    }
    setTimeout(() => {
        document.querySelector(".our-sweetalert").innerHTML = "";
    }, 1 * 60 * 1000);
}

function closeNortiFxn() {
    document.querySelector(".our-sweetalert").innerHTML = "";
}

// --------------------- additional alert toast  ----------------
function alertToast(text, msgggg) {
    if (generalSetting.wishlistOrNotification === "show-wishlist") {
        if (msgggg === "added") {
            heartButtonHandle();
        }
    } else {
        const notificationStyle = notificationStyleFxn();
        if (generalSetting.notificationTypeOption === "toast-left") {
            let toastLeft = `<div style="${notificationStyle}" class="toast-bottom-left toast-alignment">${text}</div>`;
            document.querySelector(".our-sweetalert").innerHTML = toastLeft;
        } else if (generalSetting.notificationTypeOption === "toast-right") {
            let toastRight = `<div style="${notificationStyle}" class="toast-bottom-right toast-alignment"> ${text}</div>`;
            document.querySelector(".our-sweetalert").innerHTML = toastRight;
        } else if (generalSetting.notificationTypeOption === "toast-top-right") {
            let toastRight = `<div style="${notificationStyle}" class="toast-top-right toast-alignment">${text}</div>`;
            document.querySelector(".our-sweetalert").innerHTML = toastRight;
        } else if (generalSetting.notificationTypeOption === "toast-top-left") {
            let toastRight = `<div style="${notificationStyle}" class="toast-top-left toast-alignment">${text}</div>`;
            document.querySelector(".our-sweetalert").innerHTML = toastRight;
        } else if (generalSetting.notificationTypeOption === "toast-top-center") {
            let toastRight = `<div style="${notificationStyle}" class="toast-top-center toast-alignment">${text}</div>`;
            document.querySelector(".our-sweetalert").innerHTML = toastRight;
        } else {
            let toastCenter = `<div style="${notificationStyle} background-color: ${generalSetting.bgColor}; " class="toast-bottom-center toast-alignment">${text}</div>`;
            document.querySelector(".our-sweetalert").innerHTML = toastCenter;
        }
        setTimeout(() => {
            document.querySelector(".our-sweetalert").innerHTML = "";
        }, Number(generalSetting.notificationTimer) * 1000);
    }
}

function addToMyCart(variantId, userId) {
    data = {
        id: variantId,
        quantity: 1,
    };
    alertToast(`${customLanguage.sharedPageAddToCart}`);
    cartFunction(data);
}

function drawerModal() {
    modalDrawer.style.display = "block";
    spanDrawer.onclick = function () {
        modalDrawer.style.display = "none";
        // document.body.style.overflow = "auto";
        removeScrollFromBody();
    };
    createShareWishlistLink();
}

var btn = document.querySelector("button.shareModalById");
var spans = document.getElementsByClassName("closeByShareModal")[0];

function showShareModal() {
    shareModal.style.display = "flex";
}

if (btn != null) {
    btn.addEventListener("click", showShareModal);
}

spans.onclick = function () {
    closeShareModal();
};

window.onclick = function (event) {
    if (event.target == modalWF) {
        shareModal.style.display = "none";
        document.querySelector(".searchData input").value = "";
    }
};

window.onkeydown = function (event) {
    if (event.key === "Escape") {
        closeShareModal();
    }
};

function openShareModal() {
    shareModal.style.display = "block";
    shareModalContent.style.display = "block";
    shareModalContent.innerHTML = `<div class="loader-css" ><span> </span></div>`
    pageTypeFunction();
}

// function closeShareModal() {
//     document.getElementById("wgSenderName").value = "";
//     document.getElementById("textEmail").value = "";
//     document.getElementById("textEmailRecieverName").value = "";
//     document.getElementById("textEmailMessage").value = "";
//     document.getElementById("error-message").innerText = "";
//     shareModal.style.display = "none";
// }

function closeShareModal() {
    const nameInput = document.getElementById("wgSenderName");
    const emailInput = document.getElementById("textEmail");
    const receiverNameInput = document.getElementById("textEmailRecieverName");
    const messageInput = document.getElementById("textEmailMessage");
    const errorMessage = document.getElementById("error-message");
    if (nameInput) nameInput.value = "";
    if (emailInput) emailInput.value = "";
    if (receiverNameInput) receiverNameInput.value = "";
    if (messageInput) messageInput.value = "";
    if (errorMessage) errorMessage.innerText = "";

    shareModal.style.display = "none";
}

async function extractIdAndGetDataForTable(pageUrl) {
    let params = (new URL(pageUrl)).searchParams;
    let sharedId = params.get("id");
    let allData = await getSharedWishlistData(sharedId);
    let tableStructure = '<div>';
    for (const key in allData) {
        const arrayName = Object.keys(allData[key])[0];
        const items = allData[key][arrayName];
        if (permanentDomain === 'l-a-girl-cosmetics.myshopify.com') {
            items.forEach(item => {
                tableStructure += `<p>${item?.title?.split("~")[1]}, ${item?.title?.split("~")[0]}</p>`;
            });
        } else {
            tableStructure += `<h3>${arrayName}</h3>`;
            tableStructure += `<table border="1" style="width:50%; margin-bottom: 20px; text-align: center;"><tbody>
                                <tr>
                                    <th style="text-align: center;">Image</th>
                                    <th style="text-align: center;">Title</th>
                                    <th style="text-align: center;">Quantity</th>
                                </tr>`;
            items.forEach(item => {
                tableStructure += `<tr>
                                    <td style="text-align: center; vertical-align: middle;">
                                        <img src="${item?.image?.startsWith('//') ? `https:${item.image}` : item.image}" alt="${item.title}" style="width: 50px; height: auto;">
                                    </td>
                                    <td style="text-align: center; vertical-align: middle;">
                                        ${item.title}
                                    </td>
                                    <td style="text-align: center; vertical-align: middle;">
                                        ${item.quantity}
                                    </td>
                                </tr>`;
            });
            tableStructure += "</tbody></table>";
        }
    }
    tableStructure += '</div>';
    return tableStructure;
};

async function replaceTokens(str, data, newObj = null) {
    const sharedName = btoa('email');
    var pageUrl = await wishlistUrlCreator(sharedName);
    var tableData = await extractIdAndGetDataForTable(pageUrl);
    var name = document.getElementById("wgSenderName").value;
    var recieverName = document.getElementById("textEmailRecieverName")?.value || "";
    // var message = document.getElementById("textEmailMessage")?.value || "";
    var message = "";
    if (document.getElementById("textEmailMessage")) {
        message = document.getElementById("textEmailMessage")?.value;
    } else if (document.getElementById("shareWishlistMessage")) {
        if (newObj !== null) {
            for (const [key, value] of Object.entries(newObj)) {
                const label = key
                    .replace(/([A-Z])/g, ' $1')      // Add space before capital letters
                    .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
                message += `${label}: ${value} <br>`;
            }
        }
    }

    const defData =
        "<p><b>Hello Dear Friend!</b></p><p>##wishlist_share_email_customer_name## filled out this wishlist and asked us to forward it to you. You can simply click on the button below to see it at our online store and easily make your purchase.</p><p style=text-align: center;><a href=##wishlist_share_email_wishlist_url## style=background-color: Crimson;border-radius: 5px;color: white;padding: 0.5em;text-decoration: none;target=_blank>Go to wishlist</a></p><p>Message for you:</p><p>##wishlist_share_email_customer_message##</p>";

    const newData =
        "<p>Hello <b>{wishlist_share_email_reciever_name}!</b></p><p>{wishlist_share_email_sender_name} filled out this wishlist and asked us to forward it to you. You can simply click on the button below to see it at our online store and easily make your purchase.</p><p style=text-align: center;><a href={wishlist_share_email_wishlist_url} style=background-color: Crimson;border-radius: 5px;color: white;padding: 0.5em;text-decoration: none;target=_blank>Go to wishlist</a></p><p>Message for you:</p><p>{wishlist_share_email_customer_message}</p>";

    const defData2 =
        "<p><b>Hello Dear Friend!</b></p><p>{wishlist_share_email_customer_name} filled out this wishlist and asked us to forward it to you. You can simply click on the button below to see it at our online store and easily make your purchase.</p><p style=text-align: center;><a href={wishlist_share_email_wishlist_url} style=background-color: Crimson;border-radius: 5px;color: white;padding: 0.5em;text-decoration: none;target=_blank>Go to wishlist</a></p><p>Message for you:</p><p>{wishlist_share_email_customer_message}</p>";

    if (str === defData || str === defData2) {
        str = newData;
    }
    if (data === "subject") {
        str = str.replace(
            /##wishlist_share_email_customer_name##/g,
            `{wishlist_share_email_sender_name}`
        );
        str = str.replace(
            /{wishlist_share_email_customer_name}/g,
            `{wishlist_share_email_sender_name}`
        );
    }
    str = str.replace(/##wishlist_share_email_wishlist_url##/g, pageUrl);
    str = str.replace(/##wishlist_share_email_customer_message##/g, message);
    str = str.replace(/{wishlist_share_email_wishlist_url}/g, pageUrl);
    str = str.replace(/{wishlist_share_email_customer_message}/g, message);
    str = str.replace(/{wishlist_share_email_sender_name}/g, name);
    str = str.replace(/{wishlist_share_email_reciever_name}/g, recieverName);
    str = str.replace(/{wishlist_share_email_static_data}/g, tableData);
    str = str.replace(/<p>\s*<\/p>/g, "<br>");
    return str;
}

async function submitForm() {
    let sendButton = document.getElementById('shareListBtn');
    sendButton.disabled = true;
    sendButton.style.cursor = 'not-allowed';
    var name = document.getElementById("wgSenderName").value;
    var recieverName = document.getElementById("textEmailRecieverName").value;
    var email = document.getElementById("textEmail").value;
    var message = document.getElementById("textEmailMessage").value;
    let wishlistTextEditors = await replaceTokens(
        generalSetting.wishlistTextEditor,
        "reciever"
    );
    let wishlistSubject = await replaceTokens(
        generalSetting.wishlistShareEmailSubject,
        "subject"
    );

    if (name === "" || recieverName === "" || email === "" || message === "") {
        document.getElementById("error-message").innerText = storeFrontDefLang?.allFieldsRequired || "All fields are required!";
        sendButton.disabled = false;
        sendButton.style.cursor = 'pointer';
        return;
    } else if (!isValidEmail(email)) {
        document.getElementById("error-message").innerText = "Invalid email format!";
        sendButton.disabled = false;
        sendButton.style.cursor = 'pointer';
        return;
    } else {
        sendButton.disabled = true;
        sendButton.style.cursor = 'not-allowed';
        try {
            const userData = await fetch(`${serverURL}/share-wishlist-by-mail`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "wg-api-key": getWgApiKey(),
                },
                body: JSON.stringify({
                    customerEmail: email,
                    customerMessage: message,
                    wishlistShareSubject: wishlistSubject,
                    wishlistTextEditor: wishlistTextEditors,
                    shopName: permanentDomain,
                }),
            });

            let result = await userData.json();
            if (result?.error === "Invalid token") {
                alert("Your session has expired or the token is invalid. Please refresh the page.")
            } else {
                if (userData.status === 200) {
                    const res = await getIdToShareWishlist();
                    await Conversion("email", atob(res), "noReload");
                    shareModalContent.style.display = "none";
                    setTimeout(() => {
                        closeShareModal();
                        successDiv.style.display = "none";
                    }, 3000);
                    successDiv.style.display = "block";
                }
            }

        } catch (error) {
            console.log("errr ", error);
        }
    }
    document.getElementById("error-message").innerText = "";
}


function removeError() {
    document.getElementById("error-message").innerText = "";
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function shareOnFacebook() {
    const popupWidth = 600;
    const popupHeight = 400;
    const leftPosition = (window.screen.width - popupWidth) / 2;
    const topPosition = (window.screen.height - popupHeight) / 2;
    let popup = window.open(
        "about:blank",
        "_blank",
        "width=" +
        popupWidth +
        ", height=" +
        popupHeight +
        ", left=" +
        leftPosition +
        ", top=" +
        topPosition
    );
    if (!popup) {
        alert("Please enable pop-ups in your browser to share this link.");
        return;
    }
    let message = localStorage.getItem("textEmailMessage");
    const sharedName = btoa("facebook")
    let pageUrl = await wishlistUrlCreator(sharedName);

    const res = await getIdToShareWishlist();
    await Conversion("facebook", atob(res), "noReload");

    let facebookShareUrl = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(pageUrl);
    if (message) {
        facebookShareUrl += "&quote=" + encodeURIComponent(message);
    }
    popup.location.href = facebookShareUrl;
}

async function shareOnTwitter() {
    const popupWidth = 600;
    const popupHeight = 400;
    const leftPosition = (window.screen.width - popupWidth) / 2;
    const topPosition = (window.screen.height - popupHeight) / 2;
    let popup = window.open(
        "about:blank",
        "_blank",
        `width=${popupWidth}, height=${popupHeight}, left=${leftPosition}, top=${topPosition}`
    );
    if (!popup) {
        alert("Please enable pop-ups in your browser to share this link.");
        return;
    }
    const sharedName = btoa("twitter_x")
    const res = await getIdToShareWishlist();
    await Conversion("twitter_x", atob(res), "noReload");
    let shareUrl = `${wfGetDomain}apps/wg-wishlist?id=${res}&name=${sharedName}`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl
    )}`;
    popup.location.href = twitterShareUrl;
    document.getElementById("textEmailMessage").value = "";
}

async function shareOnFbMessenger() {
    const sharedName = btoa("fb_messenger")
    const res = await getIdToShareWishlist();
    await Conversion("fb_messenger", atob(res), "noReload");
    let shareUrl = `${wfGetDomain}apps/wg-wishlist?id=${res}&name=${sharedName}`;
    const messengerUrl = `https://m.me/?send?text=${encodeURIComponent(
        shareUrl
    )}`;
    const customText = `Check out this wishlist! ${shareUrl}`;

    navigator.clipboard.writeText(`${customText}`);
    alertContent(`${customLanguage.alertForLinkCopied}`);
    // copyUrl(`${customText}`);

    const popupWidth = 600;
    const popupHeight = 400;
    const leftPosition = (window.screen.width - popupWidth) / 2;
    const topPosition = (window.screen.height - popupHeight) / 2;
    let popup = window.open(
        "about:blank",
        "_blank",
        `width=${popupWidth}, height=${popupHeight}, left=${leftPosition}, top=${topPosition}`
    );
    if (!popup) {
        alert("Please enable pop-ups in your browser to share this link.");
        return;
    }
    popup.location.href = messengerUrl;
}

async function shareOnInstagram() {
    const sharedName = btoa("instagram")
    const res = await getIdToShareWishlist();
    await Conversion("instagram", atob(res), "noReload");
    let shareUrl = `${wfGetDomain}apps/wg-wishlist?id=${res}&name=${sharedName}`;
    const messengerUrl = "https://www.instagram.com/direct/inbox/";
    const customText = `Check out this wishlist! ${shareUrl}`;
    navigator.clipboard.writeText(`${customText}`);
    alertContent(`${customLanguage.alertForLinkCopied}`);
    const popupWidth = 600;
    const popupHeight = 400;
    const leftPosition = (window.screen.width - popupWidth) / 2;
    const topPosition = (window.screen.height - popupHeight) / 2;
    let popup = window.open(
        "about:blank",
        "_blank",
        `width=${popupWidth}, height=${popupHeight}, left=${leftPosition}, top=${topPosition}`
    );
    if (!popup) {
        alert("Please enable pop-ups in your browser to share this link.");
        return;
    }
    popup.location.href = messengerUrl;
}

async function shareViaLinkedIn() {
    const popupWidth = 600;
    const popupHeight = 400;
    const leftPosition = (window.screen.width - popupWidth) / 2;
    const topPosition = (window.screen.height - popupHeight) / 2;
    let popup = window.open(
        "about:blank",
        "_blank",
        `width=${popupWidth}, height=${popupHeight}, left=${leftPosition}, top=${topPosition}`
    );
    if (!popup) {
        alert("Please enable pop-ups in your browser to share this link.");
        return;
    }
    const sharedName = btoa("linkedin")
    const res = await getIdToShareWishlist();
    await Conversion("linkedin", atob(res), "noReload");
    let shareUrl = `${wfGetDomain}apps/wg-wishlist?id=${res}&name=${sharedName}`;
    popup.location.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
    )}&title=${encodeURIComponent(
        "This is my text"
    )}&summary=${encodeURIComponent("hello jii")}`;
}

async function shareViaTelegram() {
    const popupWidth = 600;
    const popupHeight = 400;
    const leftPosition = (window.screen.width - popupWidth) / 2;
    const topPosition = (window.screen.height - popupHeight) / 2;
    let popup = window.open(
        "about:blank",
        "_blank",
        `width=${popupWidth}, height=${popupHeight}, left=${leftPosition}, top=${topPosition}`
    );
    if (!popup) {
        alert("Please enable pop-ups in your browser to share this link.");
        return;
    }
    const sharedName = btoa("telegram")
    const res = await getIdToShareWishlist();
    await Conversion("telegram", atob(res), "noReload");
    let shareUrl = `${wfGetDomain}apps/wg-wishlist?id=${res}&name=${sharedName}`;
    const myText = `Check out this link! ${shareUrl}`;
    let telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
        shareUrl
    )}&text=${encodeURIComponent(myText)}`;
    popup.location.href = telegramUrl;
}

async function shareViaWhatsApp() {
    const popupWidth = 600;
    const popupHeight = 400;
    const leftPosition = (window.screen.width - popupWidth) / 2;
    const topPosition = (window.screen.height - popupHeight) / 2;
    let popup = window.open(
        "about:blank",
        "_blank",
        `width=${popupWidth}, height=${popupHeight}, left=${leftPosition}, top=${topPosition}`
    );
    if (!popup) {
        alert("Please enable pop-ups in your browser to share this link.");
        return;
    }
    const sharedName = btoa("whatsapp")
    const res = await getIdToShareWishlist();
    await Conversion("whatsapp", atob(res), "noReload");
    let shareUrl = `${wfGetDomain}apps/wg-wishlist?id=${res}&name=${sharedName}`;
    const myText = `Check out this link! ${shareUrl}`;
    popup.location.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        myText
    )}`;
}

async function Conversion(name, sendID, fromWhere) {
    // console.log("CONVERSION--- ", name, sendID, fromWhere)
    try {
        const userData = await fetch(`${serverURL}/share-wishlist-stats`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: name,
                shopName: permanentDomain,
                count: 1,
                user_id: sendID,
                fromWhere: fromWhere
            }),
        });
    } catch (error) {
        console.log("errr ", error);
    }
}

function goToWebframez() {
    window.open("https://apps.shopify.com/wishlist-guru", "_blank");
}

let CheckCustomObserver = new MutationObserver(wishlistIcon);
const checkObjConfig = {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
};
CheckCustomObserver.observe(checkAllProduct, checkObjConfig);

const checkObjBtnConfig = {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
};
let CheckCustomButtonObserver = new MutationObserver(wishlistButtonForCollection);
CheckCustomButtonObserver.observe(checkButtonProduct, checkObjBtnConfig);

async function renderButtonAddToWishlist(productId, countValid, load = "") {
    const countData = await isCountOrNot(productId, countValid);

    const customAlignMargin = customButton.textAlign === "center" ? "0 auto" : customButton.textAlign === "left" ? "0" : "0 0 0 auto";
    if (customButton.type === "icon") {
        ["wishlist-guru", "inject_wish_button"].forEach(id => {
            const div = document.getElementById(id);
            if (div) {
                div.style.width = countValid ? "max-content" : "40px";
                div.style.margin = customAlignMargin;
                div.style.marginTop = "10px";
            }
        });
    }
    const animations = {
        "fade-in": "animation-fade_in",
        "fade-out": "animation-fade_out",
        "rotate": "animation-rotate",
        "shake-up": "animation-shake-up",
        "shake-side": "animation-shake-side"
    };
    const animationClass = load === "load" ? "" : animations[customButton.animationType] || "";
    const iconTypes = {
        "heart": "heartICON",
        "star": "starICON",
        "save": "saveICON"
    };
    const iconClass = iconTypes[customButton.iconType] || "";

    const buttonTemplates = {
        "icon": `
            <div class="iconDiv">
                <div class="iconColour ${iconClass} ${animationClass}">
                    <span class="span-hearticon"></span>
                </div>
            </div>${countData}`,
        "icon-text-button": `
            <div class="buttonStyleHead ${animationClass}">
                <div class="inside-button-div-icon iconColour ${iconClass}"></div>
                ${customLanguage.addToWishlist}
            </div>${countData}`,
        "icon-text": `
            <div style="background-color: transparent;" class="buttonStyleHead outer-icon-text-div ${animationClass}">
                <div class="inside-button-div-icon iconColour ${iconClass}"></div>
                ${customLanguage.addToWishlist}
                ${countValid ? `<span class="wf-product-count">${countData}</span>` : ""}
            </div>`,
        "text": `
            <div style="background-color: transparent;" class="buttonStyleHead wishlist-text ${animationClass}">
                ${customLanguage.addToWishlist}
                ${countValid ? `<span class="wf-product-count">${countData}</span>` : ""}
            </div>`,
        "default": `
            <div class="buttonStyleHead ${animationClass}">
                ${customLanguage.addToWishlist}
            </div>${countData}`
    };
    return buttonTemplates[customButton.type] || buttonTemplates["default"];
}

async function renderButtonAddedToWishlist(productId, countValid, load = "") {
    const countData = await isCountOrNot(productId, countValid);
    const customAlignMargin = customButton.textAlign === "center" ? "0 auto" : customButton.textAlign === "left" ? "0" : "0 0 0 auto";
    if (customButton.type === "icon") {
        ["wishlist-guru", "inject_wish_button"].forEach(id => {
            const div = document.getElementById(id);
            if (div) {
                div.style.width = countValid ? "max-content" : "40px"
                div.style.margin = customAlignMargin;
                div.style.marginTop = "10px";
            }
        });
    }
    const animations = {
        "fade-in": "animation-fade_in",
        "fade-out": "animation-fade_out",
        "rotate": "animation-rotate",
        "shake-up": "animation-shake-up",
        "shake-side": "animation-shake-side"
    };
    const animationClass = load === "load" ? "" : animations[customButton.animationType] || "";
    const iconTypes = {
        "heart": "heartICON2",
        "star": "starICON2",
        "save": "saveICON2"
    };
    const iconClass = iconTypes[customButton.iconType] || "";

    const buttonTemplates = {
        "icon": `
            <div class="iconDivAlready">
                <div class="alreadyIconColour ${iconClass} ${animationClass}">
                    <span class="span-hearticon"></span>
                </div>
            </div>${countData}`,
        "icon-text-button": `
            <div class="alreadyButtonStyleHead ${animationClass}">
                <div class="inside-button-div-icon alreadyIconColour ${iconClass}"></div>
                ${customLanguage.addedToWishlist}
            </div>${countData}`,
        "icon-text": `
            <div style="background-color: transparent;" class="alreadyButtonStyleHead outer-icon-text-div ${animationClass}">
                <div class="inside-button-div-icon alreadyIconColour ${iconClass}"></div>
                ${customLanguage.addedToWishlist}
                ${countValid ? `<span class="wf-product-count">${countData}</span>` : ""}
            </div>`,
        "text": `
            <div style="background-color: transparent;" class="alreadyButtonStyleHead wishlist-text ${animationClass}">
                ${customLanguage.addedToWishlist}
                ${countValid ? `<span class="wf-product-count">${countData}</span>` : ""}
            </div>`,
        "default": `
            <div class="alreadyButtonStyleHead ${animationClass}">
                ${customLanguage.addedToWishlist}
            </div>${countData}`
    };

    return buttonTemplates[customButton.type] || buttonTemplates["default"];
}

function styleFxnForApp(selectedClass, checkCondition) {
    const titleElements = document.querySelectorAll(selectedClass);
    titleElements.forEach((element) => {
        if (checkCondition === "aligncolor") {
            element.style.color = modalDrawerTextColor;
            element.style.textAlign = generalSetting.wlTextAlign;
        } else if (checkCondition === "align") {
            element.style.textAlign = generalSetting.wlTextAlign;
        } else {
            element.style.color = modalDrawerTextColor;
        }
    });
}

async function getIdToShareWishlist() {
    let saveID;
    await getCurrentLoginFxn().then(async (resss) => {
        let sendID;
        if (resss === "") {
            sendID = getAccessTokenFromCookie();
            // sendID = localStorage.getItem("access-token");
        } else {
            sendID = resss;
        }
        try {
            const getIdFromEmail = await fetch(`${serverURL}/get-id-from-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shopName: permanentDomain,
                    email: sendID,
                    shopDomain: shopDomain,
                }),
            });
            let result = await getIdFromEmail.json();
            let getID = result.data[0].id;
            let encryptedEmail = btoa(getID);
            let advanceEncryptedEmail = `${encryptedEmail}`;
            saveID = advanceEncryptedEmail;
        } catch (error) {
            console.log("errr ", error);
        }
    });
    return saveID;
}


function isIdExist(data, pId, vId) {
    const pid = Number(pId);
    const vid = Number(vId);

    return data.some(obj =>
        Object.keys(obj).some(key =>
            key !== "id" && obj[key].some(item => {
                const itemPid = Number(item.product_id);
                if (isVariantWishlistTrue) {
                    return vid
                        ? (itemPid === pid && Number(item.variant_id) === vid)
                        : (itemPid === pid);
                }
                return itemPid === pid;
            })
        )
    );
}

function isIdExistInKey(data, keyToCheck, pId, vId) {
    const pid = Number(pId);
    const vid = Number(vId);

    return data.some(obj =>
        obj.hasOwnProperty(keyToCheck) &&
        obj[keyToCheck].some(item => {
            const itemPid = Number(item.product_id);

            if (isVariantWishlistTrue) {
                return vid
                    ? (itemPid === pid && Number(item.variant_id) === vid)
                    : (itemPid === pid);
            }
            return itemPid === pid;
        })
    );
}



async function getMultiwishlistData(data) {
    const getCurrentLogin = await getCurrentLoginFxn();
    let dataToSend;
    if (data !== "") {
        dataToSend = {
            shopName: data.shopName,
            currentToken: data.guestToken,
            customerEmail: data.customerEmail,
        };
    } else {
        dataToSend = {
            shopName: permanentDomain,
            customerEmail: getCurrentLogin,
            currentToken: getAccessTokenFromCookie(),
            // currentToken: localStorage.getItem("access-token"),
        };
    }

    try {
        const multiData = await fetch(`${serverURL}/get-multiwishlist-data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSend),
        });

        let result = await multiData.json();
        multiArray = result.data
        return result.data;
    } catch (err) {
        console.log(err);
    }
}

async function getDataFromSql(data) {
    let allData = [];
    const getCurrentLogin = await getCurrentLoginFxn();

    try {
        let dataToSendInBody;
        if (data !== undefined) {
            dataToSendInBody = {
                shopName: data.shopName,
                customerEmail: data.customerEmail,
                shopDomain: data.shopDomain,
                currentToken: data.guestToken,
                langName: btoa(`${customLanguage.textMsgLanguage}Message`),
            };
        } else {
            dataToSendInBody = {
                shopName: permanentDomain,
                customerEmail: getCurrentLogin,
                shopDomain: shopDomain,
                currentToken: getAccessTokenFromCookie(),
                // currentToken: localStorage.getItem("access-token"),
                langName: btoa(`${customLanguage.textMsgLanguage}Message`),
            };
        }
        const userData = await fetch(`${serverURL}/get-all-items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSendInBody),
        });
        let result = await userData.json();

        // ------------this is for to make the data in alphabatically order----------
        // let myArray = [];
        // result?.data?.map((data, index) => {
        //     let keyData = Object.keys(data)[0];
        //     let valueData = Object.values(data)[0];
        //     valueData.sort((a, b) => a.title.localeCompare(b.title));
        //     myArray.push({ [keyData]: valueData });
        // })
        // allData = myArray;
        // allWishlistData = myArray;

        allData = result?.data;
        allWishlistData = result?.data;
        localStorage.setItem("wg-local-list", JSON.stringify(result?.data));
        // console.log("%%%%%%%%%%%%% SAVING IN LOCAL STORAGE AGAIN %%%%%%%%%%%%%");

        // let wgLocalData = {
        //     customButton: JSON.parse(heartButton.getAttribute("button-setting")),
        //     customLanguage: JSON.parse(heartButton.getAttribute("language-setting").replace(/~/g, "'")),
        //     generalSetting: JSON.parse(heartButton.getAttribute("general-setting")),
        //     getThemeName: JSON.parse(heartButton.getAttribute("theme-name")),
        //     advanceSetting: JSON.parse(heartButton.getAttribute("advance-setting").replace(/~/g, "'")),
        //     collectionBtnSetting: JSON.parse(heartButton.getAttribute("collection-btn-setting")),
        //     currentPlan: JSON.parse(heartButton.getAttribute("current-plan"))
        // }

        // localStorage.setItem("wg-local-data", JSON.stringify(wgLocalData))


        // Step 1: Get existing local data (if any)
        let existingData = localStorage.getItem("wg-local-data");
        existingData = existingData ? JSON.parse(existingData) : {};

        // Step 2: Create new data
        let newData = {
            customButton: JSON.parse(heartButton.getAttribute("button-setting")),
            customLanguage: JSON.parse(heartButton.getAttribute("language-setting").replace(/~/g, "'")),
            generalSetting: JSON.parse(heartButton.getAttribute("general-setting")),
            getThemeName: JSON.parse(heartButton.getAttribute("theme-name")),
            advanceSetting: JSON.parse(heartButton.getAttribute("advance-setting").replace(/~/g, "'")),
            collectionBtnSetting: JSON.parse(heartButton.getAttribute("collection-btn-setting")),
            currentPlan: JSON.parse(heartButton.getAttribute("current-plan"))
        };

        // Step 3: Merge (existing + new)
        let mergedData = {
            ...existingData,
            ...newData
        };

        // Step 4: Save back to localStorage
        localStorage.setItem("wg-local-data", JSON.stringify(mergedData));

        storeFrontDefLang = result?.defLanguageData;
    } catch (error) {
        console.log("errr ", error);
        // alertContent("Something went wrong.. Please try again later");
    }
    return allData;
}

async function createLikeFromSql(productId, checkCountData, checkAddOrRemove) {
    getAccessToken();
    let allData = [];
    const getCurrentLogin = await getCurrentLoginFxn();
    try {
        const userData = await fetch(`${serverURL}/create-social-like`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                shopName: permanentDomain,
                customerEmail: getCurrentLogin,
                currentToken: getAccessTokenFromCookie(),
                // currentToken: localStorage.getItem("access-token"),
                productId: productId,
                checkCountDecOrNot: checkCountData,
                checkAddOrRemove: checkAddOrRemove
            }),
        })
        let result = await userData.json();
    } catch (error) {
        console.log("errr ", error);
        console.log("Something went wrong.. Please try again later");
    }
    return allData;
}

function collectionIconSize() {
    let getHeight = "";
    let getWidth = "";
    let netUnit = "px";
    if (collectionBtnSetting.iconSize === "extraSmall") {
        getHeight = 17;
        getWidth = 17;
        document.querySelectorAll(".inside-button-div-icon").forEach((element) => {
            element.classList.add("wg-extraSmall-icon");
        });
    } else if (collectionBtnSetting.iconSize === "small") {
        getHeight = 20;
        getWidth = 20;
        document.querySelectorAll(".inside-button-div-icon").forEach((element) => {
            element.classList.add("wg-small-icon");
        });
    } else if (collectionBtnSetting.iconSize === "large") {
        getHeight = 30;
        getWidth = 30;
        document.querySelectorAll(".inside-button-div-icon").forEach((element) => {
            element.classList.add("wg-large-icon");
        });
    } else {
        getHeight = 25;
        getWidth = 25;
        document.querySelectorAll(".inside-button-div-icon").forEach((element) => {
            element.classList.add("wg-medium-icon");
        });
    }

    const { isComboIcon } = checkCollectionIcon();
    var iconStyleCollection = document.createElement("style");

    iconStyleCollection.innerHTML = `.collection_icon_new,
        .collection_icon_new_selected{
            height: ${getHeight}${netUnit};
            width: ${getWidth}${netUnit};
            border-radius: 50%;
        }

        .wg-collectionIcon.selected{
            filter:${isComboIcon ? colIconDefaultColor : colIconSelectedColor
        } !important;
        }    
        
        .wg-collectionIcon{
            filter:${colIconDefaultColor};
            height: ${getHeight}${netUnit};
            width: ${getWidth}${netUnit};
        }

        .wg-heart-icon-blank,
        .wg-heart-icon-solid,
        .wg-heart-icon-outline-solid,
        .wg-heart-icon-outline-blank,
        .wg-heart-icon-outline-blank-11 {
            background-size: ${getHeight}${netUnit};
        }

        .wf-wishlist,
        .wf-product-count{
            height: ${getHeight}${netUnit};
            width: ${getWidth}${netUnit};
        }

        .wf-wishlist .wf-product-count{
            min-width: ${getWidth}${netUnit};
            font-weight: 500;
        }

        .wf-wishlist .collection_icon_new,
        .wf-wishlist .collection_icon_new_selected{
            position: relative !important;
        }

        .wf-wishlist-collection-icon,
        .sharedIconDiv {
            position: absolute !important;
            width: ${getWidth}${netUnit};
        }

        .wf-wishlist-collection-icon .wf-product-count{
            position: absolute;
            z-index: 10;
            height: ${getWidth}${netUnit};
            min-width: ${getWidth}${netUnit};
            font-weight: 500 !important;
        }
    `;
    document.getElementsByTagName("head")[0].appendChild(iconStyleCollection);
    return `height: ${getHeight}${netUnit}; width: ${getWidth}${netUnit}`;
}
collectionIconSize()

async function checkPlanForMulti(data) {
    createFilterOptionInStructure();
    const arrayList = isMultiwishlistTrue
        ? allWishlistData
        : getWishlistByKey(allWishlistData, "favourites");
    const renderFn = data === "multi"
        ? () => renderMultiModalContentFxn(arrayList)
        : () => renderDrawerContentFxn();
    await renderFn();
}

function findArrayByKey(data, keyName) {
    const lowerCaseKeyName = keyName.toLowerCase();
    for (let obj of data) {
        for (let key in obj) {
            if (key.toLowerCase() === lowerCaseKeyName) {
                return obj[key];
            }
        }
    }
    return [];
}

function closeMultiWishlist() {
    closeMultiWishlistDiv.onclick = function () {
        getMultiWishlistDiv.style.display = "none";
        checkedItems = [];
        nonCheckedItems = [];
    };
}

async function executeMe2(wishName, fromWhere) {
    let { accessToken, accessEmail } = getAccessToken();
    let params = (new URL(document.location)).searchParams;
    let sharedId = params.get("id");
    const sharedIdProp = atob(sharedId);
    const userData = await fetch(`${serverURL}/create-new-wihlist`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            wishlistName: [wishName],
            shopName: permanentDomain,
            customerEmail: accessEmail,
            currentToken: accessToken,
            storeName: wf_shopName,
            language: wfGetDomain,
            referral_id: fromWhere === "shared" ? sharedIdProp : ""
        }),
    });
    let result = await userData.json();
}

async function openMultiWishlist(data, productId, fromWhere, variantId = null) {
    closeMultiWishlist();
    getMultiWishlistDiv.style.display = "block";
    const dataToSend = fromWhere === "shared" ? {
        shopName: data.shopName,
        guestToken: data.guestToken,
        customerEmail: data.customerEmail,
    } : "";
    const multiArrayData = await getMultiwishlistData(dataToSend)
    await renderData(multiArrayData, data, productId, fromWhere, variantId);
}

async function renderData(multiArray, data, productId, fromWhere, variantId = null) {
    const newDataArray = allWishlistData;
    const isDeleteMode = data.isDelete === "yes";
    const checkedArr = [];
    const nonCheckedArr = [];
    const encodedData = JSON.stringify(data).replace("'", "");
    if (isDeleteMode) {
        checkedItems = []
        nonCheckedItems = []
    }
    const wishlistItems = multiArray.map((item, index) => {
        const arrItem = newDataArray.find((obj) => obj[item]);
        let isChecked = arrItem
            ? arrItem[item].some(
                (obj) => {
                    if (isVariantWishlistTrue === true) {
                        if (variantId) {
                            if ((parseInt(obj.product_id) === parseInt(productId)) && parseInt(obj.variant_id) === parseInt(variantId)) {
                                return true;
                            }
                        } else {
                            if (parseInt(obj.product_id) === parseInt(productId)) {
                                return true;
                            }
                        }
                    } else {
                        if (parseInt(obj.product_id) === parseInt(productId)) {
                            return true;
                        }
                    }

                }
            )
            : false;
        if (!isChecked) {
            isChecked = checkedItems.some(
                (value) => value.toLowerCase() === item.toLowerCase()
            );
        }
        (isChecked ? checkedArr : nonCheckedArr).push(item);
        if (isDeleteMode) {
            (isChecked ? checkedItems : nonCheckedItems).push(item)
        }
        return `
            <li>
                <label for="item-${index}" class="item-${index}">
                    <input 
                        type="checkbox" 
                        id="item-${index}" 
                        onclick="${isDeleteMode ? "handleDeleteCheckboxClick" : "handleCheckboxClick"}(event)"
                        ${isChecked ? "checked" : ""}
                    >
                    <p style="margin:0;">${item}</p>
                </label>
            </li>`;
    }).join("");
    const wishlists = `
        <div class="multiCheckbox">
            <ul id="dataList">
                ${wishlistItems}
            </ul>
        </div>`;
    const saveButton = multiArray.length > 0
        ? `<button class="saveBtn cartButtonStyle" id="${isDeleteMode ? "saveDelWishlistBtn" : "saveWishlistBtn"}"
              onclick="${isDeleteMode ? "saveDelteWishlists" : "saveWishlists"}(event, ${productId}, '${fromWhere}')">
              ${isDeleteMode
            ? customLanguage.editBtn || storeFrontDefLang.editBtn
            : customLanguage.saveWishlistBtn || storeFrontDefLang.saveWishlistBtn}
           </button>`
        : "";

    const multiWishlistData = `
        <div>
            <h3>${isDeleteMode
            ? customLanguage.editWishlistHeading || storeFrontDefLang.editWishlistHeading
            : customLanguage.createWishlistHeading || storeFrontDefLang.createWishlistHeading}
            </h3>
            <div class="multiWishCreate">
                <div class="multiInputDiv">
                    <input type="text" id="wishlistName" name="wishlistName" placeholder="${storeFrontDefLang.inputPlaceholder}" />
                </div>
                <div id="hiddenDiv" data-prodata='${encodedData}' data-checkedArr='${JSON.stringify(checkedArr)}' data-nonCheckedArr='${JSON.stringify(nonCheckedArr)}'></div>
                <button id="createWishlist" class="cartButtonStyle" type="button" 
                    onclick="submitWishlistForm(event, ${productId}, '${fromWhere}')">
                    ${customLanguage.createBtn || storeFrontDefLang.createBtn}
                </button>
            </div>
            <p id="mainErrorPara"></p>
            ${wishlists}
            ${saveButton}
        </div>`;
    const container = document.getElementById("wg-multiWishlistInnerContent");
    if (container) {
        container.innerHTML = multiWishlistData;
    }
    const saveButtonElement = document.getElementById("saveDelWishlistBtn");
    if (saveButtonElement) {
        saveButtonElement.disabled = true;
    }
}


async function submitWishlistForm(event, productId, fromWhere) {
    const wishName = event.target.parentNode.querySelector("#wishlistName").value;
    if (wishName) {
        if (multiArray.length !== 0) {
            let matchFound = multiArray.some(
                (item) => item.toLowerCase() === wishName.toLowerCase()
            );
            if (!matchFound) {
                executeMe();
                executeMe2(wishName, fromWhere);
            } else {
                const msg = `${wishName} ${storeFrontDefLang.sameWishName}`;
                await showErrorPara(msg);
            }
        } else {
            executeMe();
            executeMe2(wishName, fromWhere);
        }
        async function executeMe() {
            multiArray.splice(0, 0, wishName);
            let dataValue = event.target.parentNode.querySelector("#hiddenDiv").dataset.prodata;
            const newData = JSON.parse(dataValue);

            await renderData(multiArray, newData, productId, fromWhere);
        }
    } else {
        const msg = storeFrontDefLang.emptyInput;
        await showErrorPara(msg);
    }
}

function handleCheckboxClick(event) {
    const checkbox = event.target;
    const parent = checkbox.parentElement;
    const pTag = parent.querySelector("p");
    const value = pTag.textContent;
    if (checkbox.checked) {
        checkedItems.push(value);
    } else {
        const index = checkedItems.indexOf(value);
        if (index !== -1) {
            checkedItems.splice(index, 1);
        }
    }
}

async function handleDeleteCheckboxClick(event) {
    const checkbox = event.target;
    const parent = checkbox.parentElement;
    const value = parent.querySelector("p").textContent;
    let checkedArr = document.getElementById("hiddenDiv").getAttribute("data-checkedArr");
    let nonCheckedArr = document.getElementById("hiddenDiv").getAttribute("data-nonCheckedArr");
    checkedArr = checkedArr ? JSON.parse(checkedArr) : [];
    nonCheckedArr = nonCheckedArr ? JSON.parse(nonCheckedArr) : [];
    if (checkbox.checked) {
        if (!checkedItems.includes(value)) {
            checkedItems.push(value);
        }
        const index = nonCheckedItems.indexOf(value);
        if (index !== -1) {
            nonCheckedItems.splice(index, 1);
        }
    } else {
        if (!nonCheckedItems.includes(value)) {
            nonCheckedItems.push(value);
        }
        const index = checkedItems.indexOf(value);
        if (index !== -1) {
            checkedItems.splice(index, 1);
        }
    }

    const arraysEqual = (arr1, arr2) => arr1.length === arr2.length && arr1.every((element) => arr2.includes(element));
    const checkedArraysEqual = arraysEqual(checkedArr, checkedItems);
    const nonCheckedArraysEqual = arraysEqual(nonCheckedArr, nonCheckedItems);
    const disableButton =
        (checkedItems.length === 0 && nonCheckedItems.length === 0) ||
        (checkedArraysEqual && nonCheckedArraysEqual)
    document.getElementById("saveDelWishlistBtn").disabled = disableButton;
}

async function saveWishlists(event, productId, fromWhere) {
    if (checkedItems.length === 0) {
        await showErrorPara(customLanguage?.mwChooseWishlistToSave || storeFrontDefLang.chooseWishlist);
        return;
    }
    const parentElement = event.target.parentNode;
    const dataValue = parentElement.querySelector("#hiddenDiv").dataset.prodata;
    const newData = { ...JSON.parse(dataValue), wishlistName: checkedItems };
    if (newData.shopName) {
        saveSharedWishlist(newData);
    } else {
        saveMainData(newData, productId, fromWhere)
    }
    checkedItems = [];
    nonCheckedItems = [];
    getMultiWishlistDiv.style.display = "none"
}

async function showErrorPara(msg) {
    const mainErrorPara = document.getElementById('wg-multiWishlistInnerContent').querySelector('#mainErrorPara')
    if (mainErrorPara) {
        mainErrorPara.style.display = "block";
        mainErrorPara.innerHTML = msg;
    }
}

async function saveDelteWishlists(event, productId, fromWhere) {
    const parentElement = event.target.parentNode;
    const dataValue = parentElement.querySelector("#hiddenDiv").dataset.prodata;
    const newData = { ...JSON.parse(dataValue), wishlistName: checkedItems, DelWishlistName: nonCheckedItems };
    if (fromWhere === "shared") {
        saveSharedWishlist(newData);
    } else {
        saveMainData(newData, productId, fromWhere)
    }
    checkedItems = [];
    nonCheckedItems = [];
    getMultiWishlistDiv.style.display = "none";
}

async function saveMainData(data, productId, fromWhere) {
    let result = await SqlFunction(data);
    const proId = injectCoderr.getAttribute("data-product-id");
    if (result.msg === "item updated") {
        await showCountAll()
        const matchFound = await checkFound(allWishlistData, productId, data.variantId)
        const notificationMsg = result.isAdded === "yes" && !result.bothUpdated ?
            customLanguage.addToWishlistNotification :
            result.isAdded === "no" && !result.bothUpdated ?
                customLanguage.removeFromWishlistNotification :
                "Wishlist has been updated";

        if (isMultiwishlistTrue) {
            const counterAction = matchFound ? "add" : "remove";
            const updateCounter = async () => {
                if (["block", "inject"].includes(fromWhere)) {
                    await checkCounterData(productId, counterAction);
                } else {
                    await checkCollectionCounterData(productId, counterAction);
                }
            };
            await updateCounter();
        }
        // console.log("fromWhere ---- ", fromWhere)

        if (fromWhere === "block") {
            isMultiwishlistTrue && (matchFound ? alreadyInWishlist() : addToWishList())
            customIconAddedRemoveToWishlist(productId, matchFound);
            buttonAddedRemoveWishlist(productId, matchFound);
            collectionIcon(productId, matchFound);
            currentPlan > 1 && (matchFound ? fxnAfterAddToWishlist() : fxnAfterRemoveFromWishlist());

        } else if (fromWhere === "inject") {
            isMultiwishlistTrue && injectButtonAddedRemoveWishlist(productId, matchFound)
            customIconAddedRemoveToWishlist(productId, matchFound);
            buttonAddedRemoveWishlist(productId, matchFound);
            collectionIcon(productId, matchFound);
            currentPlan > 1 && (matchFound ? fxnAfterAddToWishlist() : fxnAfterRemoveFromWishlist());

        } else if (fromWhere === "collection") {
            isMultiwishlistTrue && collectionIcon(productId, matchFound)
            injectButtonAddedRemoveWishlist(productId, matchFound);
            if (typeof alreadyInWishlist === 'function' || typeof addToWishList === 'function') {
                if (Number(proId) === Number(productId)) {
                    matchFound ? alreadyInWishlist() : addToWishList();
                }
            }
            buttonAddedRemoveWishlist(productId, matchFound)
            customIconAddedRemoveToWishlist(productId, matchFound);
            currentPlan > 1 && (matchFound ? fxnAfterAddToWishlist() : fxnAfterRemoveFromWishlist());

        } else if (fromWhere === "cutomButton") {
            isMultiwishlistTrue && buttonAddedRemoveWishlist(productId, matchFound)
            injectButtonAddedRemoveWishlist(productId, matchFound);
            if (typeof alreadyInWishlist === 'function' || typeof addToWishList === 'function') {
                if (Number(proId) === Number(productId)) {
                    matchFound ? alreadyInWishlist() : addToWishList();
                }
            }
            customIconAddedRemoveToWishlist(productId, matchFound);
            collectionIcon(productId, matchFound);
            currentPlan > 1 && (matchFound ? fxnAfterAddToWishlist() : fxnAfterRemoveFromWishlist());

        } else {
            isMultiwishlistTrue && customIconAddedRemoveToWishlist(productId, matchFound)
            injectButtonAddedRemoveWishlist(productId, matchFound);
            if (typeof alreadyInWishlist === 'function' || typeof addToWishList === 'function') {
                if (Number(proId) === Number(productId)) {
                    matchFound ? alreadyInWishlist() : addToWishList();
                }
            }
            buttonAddedRemoveWishlist(productId, matchFound);
            collectionIcon(productId, matchFound);
            currentPlan > 1 && (matchFound ? fxnAfterAddToWishlist() : fxnAfterRemoveFromWishlist());
        }
        matchFound ? alertToast(notificationMsg, "added") : alertToast(customLanguage.removeFromWishlistNotification, "removed");
        (currentPlan >= 3 && generalSetting?.trendingLayout) && await renderTrendingGridData();

    }

    if (result.msg === "limit cross") {
        alertContent(customLanguage?.quotaLimitAlert || storeFrontDefLang.quotaLimitAlert);
    }
}

function getWishlistByKey(arrayData, key) {
    const wishlist = arrayData.find((obj) => obj[key]);
    return wishlist ? [wishlist] : [];
}

async function deleteWishlist(event, key) {
    event.stopPropagation();
    closeMultiWishlist();
    getMultiWishlistDiv.style.display = "block";
    let productsToDelete = [];
    const matchingData = allWishlistData.find(item => item[key]);
    if (matchingData[key].length > 0) {
        matchingData[key].forEach(product => {
            productsToDelete.push({ ...product });
        });
    }
    const encodedData = JSON.stringify(productsToDelete)
    let editData = `<div class="deleteMultiWishlist">
                        <h3>${customLanguage.deleteMsg || storeFrontDefLang.deleteMsg}</h3>
                        <div class="deleteWishDiv">
                            <button id="deleteYes" class="cartButtonStyle" type="button" onclick="yesDelete('${key.replace(/'/g, "\\'")}')">${customLanguage.deleteYesBtn || storeFrontDefLang.deleteYesBtn}</button>
                            <button id="deleteNo" class="cartButtonStyle" type="button" onclick="noDelete()">${customLanguage.deleteNoBtn || storeFrontDefLang.deleteNoBtn}</button>
                        </div>
                    </div>`;

    document.getElementById("wg-multiWishlistInnerContent").innerHTML = editData;
    document.getElementById("deleteYes").setAttribute("data-allItems", encodedData);
}

async function yesDelete(key) {
    const getCurrentLogin = await getCurrentLoginFxn();
    const userData = await fetch(`${serverURL}/delete-wishlist-name`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            keyName: key,
            shopName: permanentDomain,
            customerEmail: getCurrentLogin,
            shopDomain: shopDomain,
            currentToken: getAccessTokenFromCookie(),
            // currentToken: localStorage.getItem("access-token"),
            plan: currentPlan,
            storeName: wf_shopName
        }),
    });
    const allData = document.getElementById("deleteYes").getAttribute('data-allItems')
    const parsedData = JSON.parse(allData);
    let result = await userData.json();
    if (result.msg === "wishlist deleted successfuly") {
        getMultiWishlistDiv.style.display = "none";
        renderLoader();
        await showCountAll();
        drawerButtonDiv();
        modalButtonFxn();
        createFilterOptionInStructure();
        const arrayList = isMultiwishlistTrue
            ? allWishlistData
            : getWishlistByKey(allWishlistData, "favourites");

        const renderFn = generalSetting.wishlistDisplay === "drawer"
            ? () => renderDrawerContentFxn()
            : () => renderMultiModalContentFxn(arrayList);

        await renderFn();
        if (parsedData.length > 0) {
            const mainWishlistDiv = document.getElementById("wishlist-guru");
            const proId = injectCoderr.getAttribute("data-product-id")
            const isProId = proId && /^\d+$/.test(proId)

            let matchFound = false;
            if (isProId && currentPlan >= 2) {
                matchFound = await checkFound(allWishlistData, proId)
                await checkCounterData(proId, !matchFound && "remove");
                proId && injectButtonAddedRemoveWishlist(proId, matchFound)
            }
            if (mainWishlistDiv) {
                matchFound ? alreadyInWishlist() : addToWishList()
            }
            parsedData.forEach(async (ele) => {
                const matchFound2 = await checkFound(allWishlistData, ele.product_id);

                if (currentPlan >= 2 && !matchFound2) {
                    await checkCollectionCounterData(ele.product_id, "remove");
                    collectionIcon(ele.product_id, matchFound2)
                    customIconAddedRemoveToWishlist(ele.product_id, matchFound2)
                    buttonAddedRemoveWishlist(ele.product_id, matchFound2)
                }
            });
            (currentPlan >= 3 && generalSetting?.trendingLayout) && await renderTrendingGridData();
        }
    }
}

async function noDelete() {
    getMultiWishlistDiv.style.display = "none";
}

async function editWishlistName(event, key) {
    event.stopPropagation();
    closeMultiWishlist();
    const nearestEditWishDiv = event.target.closest(".wf-multi-Wish-content").querySelector(".editWishDiv");
    const nearestH3 = event.target.closest(".wf-multi-Wish-content").querySelector("h3");
    const nearestEditWishIconDiv = event.target.closest(".edit-main-icon");
    nearestEditWishDiv && (nearestEditWishDiv.style.display = "flex");
    nearestEditWishIconDiv && (nearestEditWishIconDiv.style.display = "none");
    nearestH3 && (nearestH3.style.display = "none");
}

async function saveEditWishlistName(event, key) {
    const newWishName = event.target.closest(".editWishDivInner").querySelector(".editInput").value;
    const errorPara = event.target.closest(".editWishDiv").querySelector(".errorPara");
    const getCurrentLogin = await getCurrentLoginFxn();
    if (!newWishName) {
        errorPara.style.display = "block";
        errorPara.innerHTML = `${storeFrontDefLang.emptyInput}`;
        return;
    }
    if (multiArray.some((item) => item.toLowerCase() === newWishName.toLowerCase())) {
        errorPara.style.display = "block";
        errorPara.innerHTML = `${newWishName} ${storeFrontDefLang.sameWishName}`;
        return;
    }
    const nearestEditWishDiv = event.target.closest(".wf-multi-Wish-content").querySelector(".editWishDiv");
    const nearestH3 = event.target.closest(".wf-multi-Wish-content").querySelector("h3");
    const nearestEditWishIconDiv = event.target.closest(".wf-multi-Wish-content").querySelector(".edit-main-icon")
    const nearestH3Content = event.target.closest(".wf-multi-Wish-content").querySelector("h3");
    nearestEditWishDiv && (nearestEditWishDiv.style.display = "none");
    nearestEditWishIconDiv && (nearestEditWishIconDiv.style.display = "flex");
    nearestH3 && (nearestH3.style.display = "block");
    nearestH3Content && (nearestH3.textContent = newWishName);
    errorPara.style.display = "none";

    try {
        const response = await fetch(`${serverURL}/edit-wishlist-name`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                oldWishlistName: key,
                newWishlistName: newWishName,
                shopName: permanentDomain,
                customerEmail: getCurrentLogin,
                shopDomain,
                currentToken: getAccessTokenFromCookie(),
                // currentToken: localStorage.getItem("access-token"),
            }),
        });
        const result = await response.json();
        showCountAll()
    } catch (error) {
        console.error("Error updating wishlist name:", error);
    }
}

function closeEditWishlistName(event, key) {
    const nearestEditWishDiv = event.target.closest(".wf-multi-Wish-content").querySelector(".editWishDiv");
    const nearestEditWishIconDiv = event.target.closest(".wf-multi-Wish-content").querySelector(".edit-main-icon");
    const nearestH3 = event.target.closest(".wf-multi-Wish-content").querySelector("h3");
    const errorPara = event.target.closest(".editWishDiv").querySelector(".errorPara");

    errorPara.style.display = "none";
    errorPara.innerHTML = ``;

    nearestEditWishDiv && (nearestEditWishDiv.style.display = "none");
    nearestEditWishIconDiv && (nearestEditWishIconDiv.style.display = "flex");
    nearestH3 && (nearestH3.style.display = "block");
}

async function copyItem(
    product_id,
    variant_id,
    handle,
    price,
    image,
    title,
    quantity,
    key
) {
    closeMultiWishlist();
    getMultiWishlistDiv.style.display = "block";
    let wishlists = "";
    const newMultiArray = allWishlistData.filter(entry => {
        const keyValue = Object.keys(entry)[0];
        return keyValue.toLowerCase() !== key.toLowerCase() && !entry[keyValue].some(item => Number(item.product_id) === Number(product_id));
    }).map(entry => Object.keys(entry)[0]);
    if (allWishlistData.length === 1) {
        wishlists += `<div class="wg-cant-copy">${customLanguage?.mwCopyError || storeFrontDefLang?.onlyOneWishlist || "Currently you have only one wishlist, make another one to copy wishlist."}</div>`
    } else {
        if (newMultiArray.length === 0) {
            wishlists += `<div class="wg-cant-copy">${customLanguage?.mwAvailableInAllList || storeFrontDefLang.cantCopy}</div>`
        } else {
            wishlists += `<div class="multiCheckbox"><ul id="dataList">`;
            newMultiArray.map((item, index) =>
                wishlists += `<li><label for="item-${index}" class="item-${index}">
                            <input type="checkbox" onclick="handleCheckboxClick(event, ${index})" id="item-${index}">
                            <p style="margin:0;">${item}</p>
                            </label>
                        </li>`
            )
            wishlists += `</ul></div>`;
        }
    }
    const editData = `
        <h3>${customLanguage.copyHeading || storeFrontDefLang.copyHeading}</h3>
        ${wishlists}
        ${newMultiArray.length !== 0
            ? `<p id="mainErrorPara">Please enter name*</p>
              <button id="copyBtn" class="cartButtonStyle" onclick="copyCheckedItem(${product_id}, ${variant_id}, '${handle}', '${price}', '${image}', '${title}', '${quantity}')">
                ${customLanguage.copyBtn || storeFrontDefLang.copyBtn}
              </button>`
            : ""
        }`;
    document.getElementById("wg-multiWishlistInnerContent").innerHTML = editData;
}

async function copyCheckedItem(
    product_id,
    variant_id,
    handle,
    price,
    image,
    title,
    quantity
) {
    const getCurrentLogin = await getCurrentLoginFxn();
    if (checkedItems.length === 0) {
        return showErrorPara(customLanguage?.mwChooseWishlistToSave || storeFrontDefLang.chooseWishlist)
    }
    try {
        const response = await fetch(`${serverURL}/copy-to-wishlist`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                shopName: permanentDomain,
                customerEmail: getCurrentLogin,
                shopDomain: shopDomain,
                currentToken: getAccessTokenFromCookie(),
                // currentToken: localStorage.getItem("access-token"),
                productId: product_id,
                variantId: variant_id,
                price: price,
                handle: handle,
                title: title,
                image: image,
                quantity: quantity,
                wishlistName: checkedItems,
            }),
        });
        const result = await response.json();
        if (result.msg === "item updated" && result.isAdded === "yes") {
            getMultiWishlistDiv.style.display = "none";
            renderLoader();
            await showCountAll();
            createFilterOptionInStructure();
            const arrayList = isMultiwishlistTrue
                ? allWishlistData
                : getWishlistByKey(allWishlistData, "favourites");

            const renderFn = generalSetting.wishlistDisplay === "drawer"
                ? () => renderDrawerContentFxn()
                : () => renderMultiModalContentFxn(arrayList);

            await renderFn();
        }
    } catch (err) {
        console.error("Error copying item to wishlist:", err);
    }
}

function renderLoader() {
    let loaderr = document.querySelectorAll(".show-title");
    for (let wf = 0; wf < loaderr.length; wf++) {
        loaderr[wf].innerHTML = `<div class="loader-css" ><span> </span></div>`;
    }
    if (generalSetting.wishlistDisplay === "drawer") {
        document.querySelector(".drawer-main").innerHTML = `<div class="loader-css" ><span></span></div>`;
    }
}

async function clearAllWishlist() {
    const defaultWishlist = allWishlistData.find(item => item.favourites && item.favourites.length > 0);
    const wishlistId = defaultWishlist ? defaultWishlist.favourites[0].wishlist_id : null;
    let productIds = []
    if (!isMultiwishlistTrue) {
        productIds = defaultWishlist.favourites.map(item => item.product_id);
    }
    isMultiwishlistTrue
        ? await renderClearWishlistNames()
        : await clearDefaultWishlist([wishlistId], productIds)
}

async function renderClearWishlistNames() {
    closeMultiWishlist();
    getMultiWishlistDiv.style.display = "block";
    let wishlists = "";
    wishlists += `<div class="multiCheckbox"><ul id="dataList">`;
    multiArray.forEach((item, index) => {
        wishlists += `<li>
                    <label for="item-${index}" class="item-${index}">
                        <input type="checkbox" onclick="handleCheckboxClick(event)" id="item-${index}">
                        <p style="margin:0;">${item}</p>
                    </label>
                  </li>`;
    });
    wishlists += `</ul></div>`;

    const clearButton = `<button class="saveBtn cartButtonStyle" onclick="clearAllYesBtn(event)">${customLanguage.clearWishlistBtn || storeFrontDefLang.clearWishlistBtn}</button>`;

    const multiWishlistData = `<div>
            <h3>${customLanguage.clearWishlist || storeFrontDefLang.clearWishlist}</h3>
            ${wishlists}
            ${clearButton}
            <p id="mainErrorPara"></p>
        </div>`;
    document.getElementById("wg-multiWishlistInnerContent").innerHTML = multiWishlistData;
}

async function clearAllYesBtn(event) {
    const errorPara = event.target.closest("#wg-multiWishlistInnerContent").querySelector("#mainErrorPara");
    const arrayList = isMultiwishlistTrue
        ? allWishlistData
        : await getWishlistByKey("favourites");

    let wishlistIds = [];
    let productIds = []
    if (checkedItems.length > 0) {
        checkedItems.forEach((key) => {
            arrayList.forEach((obj) => {
                if (obj[key]) {
                    obj[key].forEach((item) => {
                        if (!wishlistIds.includes(item.wishlist_id)) {
                            wishlistIds.push(item.wishlist_id);
                        }
                        if (!productIds.includes(item.product_id)) {
                            productIds.push(item.product_id);
                        }
                    });
                }
            });
        });
    } else {
        errorPara.style.display = "block";
        errorPara.innerHTML = `${storeFrontDefLang.chooseDelWish}`;
        return;
    }
    await clearDefaultWishlist(wishlistIds, productIds)
}

async function clearDefaultWishlist(idArray, proIdArray) {
    const getCurrentLogin = await getCurrentLoginFxn();
    try {
        const response = await fetch(`${serverURL}/delete-all-items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                wishlistIds: idArray,
                shopName: permanentDomain,
                customerEmail: getCurrentLogin,
                plan: currentPlan,
                storeName: wf_shopName
            }),
        });
        let result = await response.json();
        if (result === "All items removed") {
            getMultiWishlistDiv.style.display = "none";
            renderLoader();
            await showCountAll();
            drawerButtonDiv();
            modalButtonFxn();
            createFilterOptionInStructure();
            const arrayList = isMultiwishlistTrue
                ? allWishlistData
                : getWishlistByKey(allWishlistData, "favourites");
            const renderFn = generalSetting.wishlistDisplay === "drawer"
                ? () => renderDrawerContentFxn()
                : () => renderMultiModalContentFxn(arrayList);
            await renderFn();
            if (proIdArray.length > 0) {
                const mainWishlistDiv = document.getElementById("wishlist-guru");
                const proId = injectCoderr.getAttribute("data-product-id")
                const isProId = proId && /^\d+$/.test(proId)
                let matchFound = false;
                if (isProId && currentPlan >= 2) {
                    matchFound = await checkFound(allWishlistData, proId)
                    await checkCounterData(proId, !matchFound && "remove");
                    proId && injectButtonAddedRemoveWishlist(proId, matchFound)
                }
                if (mainWishlistDiv) {
                    matchFound ? alreadyInWishlist() : addToWishList()
                }
                proIdArray.forEach(async (id) => {
                    const matchFound2 = await checkFound(allWishlistData, id);
                    if (currentPlan >= 2 && !matchFound2) {
                        await checkCollectionCounterData(id, "remove");
                        collectionIcon(id, matchFound2)
                        customIconAddedRemoveToWishlist(id, matchFound2);
                        // -------------for la girls site-----------
                        customIconAddedRemoveToWishlistLaGirl(id, matchFound2);
                        buttonAddedRemoveWishlist(id, matchFound2);
                    }
                });
                (currentPlan >= 3 && generalSetting?.trendingLayout) && await renderTrendingGridData();
            }
        }
    } catch (error) {
        console.log("err", error)
    }
}

function checkFound(wishlistData, selectedId, selectedVariantId = null) {
    const found = isMultiwishlistTrue
        ? isIdExist(wishlistData, parseInt(selectedId), parseInt(selectedVariantId))
        : isIdExistInKey(wishlistData, "favourites", parseInt(selectedId), parseInt(selectedVariantId));
    return found;
}

async function checkCounterData(productId, checkAddOrRemove) {
    const checkCountData = customButton.showCount === "increaseNdecrease" ? "true" : "false"
    if (customButton.showCount !== "no" && currentPlan >= 2) {
        await createLikeFromSql(productId, checkCountData, checkAddOrRemove)
    }
}

async function checkCollectionCounterData(productId, checkAddOrRemoveCol) {
    const checkCountColData = collectionBtnSetting?.collectionShowCount === "increaseNdecrease" ? "true" : "false"
    if (collectionBtnSetting?.collectionShowCount !== "no") {
        await createLikeFromSql(productId, checkCountColData, checkAddOrRemoveCol)
    }
}

function updateCountElement(element, countData) {
    if (element) {
        const parser = new DOMParser();
        const parsedDocument = parser.parseFromString(countData, "text/html");
        const countValue = parseInt(parsedDocument.querySelector(".wf-product-count")?.textContent, 10) || 0;
        element.textContent = countValue;
    }
};

function renderPopupLoader() {
    getMultiWishlistDiv.style.display = "block";
    document.getElementById('wg-multiWishlistInnerContent').innerHTML = `<div class="loader-css" ><span> </span></div>`
}


async function disableShare(data, className) {
    try {
        const totalObjects = await getCount(data);
        function updateClass() {
            document.querySelectorAll(className).forEach(div => {
                if (totalObjects === 0) {
                    div.classList.add("wg-disabled");
                } else {
                    div.classList.remove("wg-disabled");
                }
            });
        }
        updateClass();
        const observer = new MutationObserver(() => {
            updateClass();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    } catch (error) {
        console.log("Error in disableShare:", error);
    }
}


// ---------------------function to update the variant in the variable of the button------------------------
// document.addEventListener("DOMContentLoaded", function () {
//     setTimeout(() => {
//         const wishlistButtons = document.querySelectorAll(".wf-wishlist-button, .wf-wishlist, .wishlist-guru-bb, .inject-button-pp");

//         // Function to update the variant ID for all wishlist buttons
//         function updateVariantId(newVariantId) {
//             wishlistButtons.forEach(button => {
//                 button.setAttribute("variant-id", newVariantId);
//             });

//             setTimeout(() => {
//                 wishlistIcon(); // For custom code icon 
//                 wishlistButtonForCollection(); // For custom code button 
//                 injectWishlistButtonForcely(); // For the inject button for the product page
//                 // autoUpdateOfPage(); // For the Product Page Block Button
//                 if (typeof autoUpdateOfPage === "function") {
//                     autoUpdateOfPage(); // Run only if the function exists
//                 }
//             }, 200);

//             // ------updating the variant from the inject button variable to the PDP image------
//             setTimeout(() => {
//                 showIconOnPdpImage();
//                 wishlistIcon();
//             }, 500)
//         }

//         // Example: Listening for a variant dropdown change (Shopify's default selector)
//         const variantSelect = document.querySelector("[name='id']"); // Shopify variant dropdown
//         if (variantSelect) {
//             variantSelect.addEventListener("change", function () {
//                 updateVariantId(this.value);
//             });
//             // Initial update in case a variant is already selected
//             updateVariantId(variantSelect.value);
//         }
//     }, 500);
// });

(function () {
    const pushState = history.pushState;
    const replaceState = history.replaceState;

    function triggerOnUrlChange() {
        setTimeout(() => {
            if (location.pathname.includes("/products/")) {
                // console.log("Product page detected after URL change:", location.href);
                runWishlistVariantUpdateLogic();
            }
        }, 500); // give DOM time to update
    }

    history.pushState = function (...args) {
        pushState.apply(this, args);
        triggerOnUrlChange();
    };

    history.replaceState = function (...args) {
        replaceState.apply(this, args);
        triggerOnUrlChange();
    };

    window.addEventListener("popstate", triggerOnUrlChange); // back/forward buttons
})();

function runWishlistVariantUpdateLogic() {
    if (!location.pathname.includes("/products/")) return; // Exit if not product page

    const wishlistButtons = document.querySelectorAll(".wf-wishlist-button, .wf-wishlist, .wishlist-guru-bb, .inject-button-pp");

    function updateVariantId(newVariantId) {
        wishlistButtons.forEach(button => {
            button.setAttribute("variant-id", newVariantId);
        });

        setTimeout(() => {
            wishlistIcon();
            wishlistButtonForCollection();
            injectWishlistButtonForcely();
            if (typeof autoUpdateOfPage === "function") {
                autoUpdateOfPage();
            }
        }, 200);

        setTimeout(() => {
            showIconOnPdpImage();
            wishlistIcon();
        }, 500);
    }

    const variantSelect = document.querySelector("[name='id']");
    if (variantSelect) {
        if (!variantSelect.dataset.listenerAttached) {
            variantSelect.dataset.listenerAttached = "true";
            variantSelect.addEventListener("change", function () {
                updateVariantId(this.value);
            });
        }
        updateVariantId(variantSelect.value);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        if (location.pathname.includes("/products/")) {
            // console.log("Product page detected on DOM load");
            runWishlistVariantUpdateLogic();
        }
    }, 500);
});


// -----------  this is to show the icon on the product detail page image  -----------

function showIconOnPdpImage() {
    if (currentPlan >= 2) {
        // for icon on image in PDP
        if (customButton?.pdpIconOnImage?.icon === "yes") {
            const productImages = document.querySelectorAll(`${themeCurrentSelectors?.pdpImageSelector}`);
            const wishButton = document.querySelector('#wf-custom-wishBtn-inject');
            if (productImages) {
                productImages.forEach((selectedImage) => {
                    if (selectedImage && selectedImage.parentElement) {
                        let existingWishlistIcon = selectedImage.parentElement.querySelector('.wf-wishlist');
                        if (existingWishlistIcon) {
                            // Update attributes if the icon already exists
                            existingWishlistIcon.setAttribute('product-id', wishButton.getAttribute('data-product-id'));
                            existingWishlistIcon.setAttribute('product-handle', wishButton.getAttribute('data-product-handle'));
                            existingWishlistIcon.setAttribute('variant-id', wishButton.getAttribute('variant-id'));
                        } else {
                            // Append a new wishlist icon if not exists
                            selectedImage.parentElement.innerHTML += `
                        <div class="wf-wishlist pdp-img-${customButton?.pdpIconOnImage?.position || 'icon-top-left'}" 
                             product-id="${wishButton.getAttribute('data-product-id')}" 
                             product-handle="${wishButton.getAttribute('data-product-handle')}" 
                             variant-id="${wishButton.getAttribute('variant-id')}">
                        </div>`;
                        }
                    }
                });
            }
        }

        // for icon beside title in PDP
        if (customButton?.iconBesideTitle === "left" || customButton?.iconBesideTitle === "right") {
            const productTitle = document.querySelectorAll(`${themeCurrentSelectors?.pdpTitleSelector}`);
            const wishButton = document.querySelector('#wf-custom-wishBtn-inject');
            if (productTitle) {
                productTitle.forEach((selectedImage) => {
                    selectedImage.classList.add(`pdp-title-${customButton?.iconBesideTitle}`);
                    let existingWishlistIcon = selectedImage.parentElement.querySelector('.wf-wishlist');
                    if (existingWishlistIcon) {
                        // Update attributes if the icon already exists
                        existingWishlistIcon.setAttribute('product-id', wishButton.getAttribute('data-product-id'));
                        existingWishlistIcon.setAttribute('product-handle', wishButton.getAttribute('data-product-handle'));
                        existingWishlistIcon.setAttribute('variant-id', wishButton.getAttribute('variant-id'));
                    } else {
                        const div = document.createElement('div');
                        div.className = `wf-wishlist pdp-title-wg`; // Add class
                        div.setAttribute('product-id', wishButton.getAttribute('data-product-id'));
                        div.setAttribute('product-handle', wishButton.getAttribute('data-product-handle'));
                        div.setAttribute('variant-id', wishButton.getAttribute('variant-id'));
                        selectedImage.appendChild(div);
                    }
                });
            }
        }

        // for icon along the add_to_cart button
        if (customButton?.iconBesideAddToCart === "left" || customButton?.iconBesideAddToCart === "right") {
            const targetButton = document.querySelector(`${themeCurrentSelectors?.pdpAddToCartSelector}`);
            const wishButton = document.querySelector('#wf-custom-wishBtn-inject');
            let updateCartButtonValues = document.querySelector(".pdp-addtocart-wg");
            if (updateCartButtonValues) {
                // Update attributes if the icon already exists
                updateCartButtonValues.setAttribute('product-id', wishButton.getAttribute('data-product-id'));
                updateCartButtonValues.setAttribute('product-handle', wishButton.getAttribute('data-product-handle'));
                updateCartButtonValues.setAttribute('variant-id', wishButton.getAttribute('variant-id'));
            }
            if (targetButton && !targetButton.parentElement.classList.contains('wg-addtocart-wrapper')) {
                const wrapperDiv = document.createElement('div'); // Create a wrapper div
                wrapperDiv.className = 'wg-addtocart-wrapper'; // Add a class to style the wrapper
                const icon = document.createElement('icon');
                icon.className = `wf-wishlist pdp-addtocart-wg`; // Add class
                icon.setAttribute('product-id', wishButton.getAttribute('data-product-id'));
                icon.setAttribute('product-handle', wishButton.getAttribute('data-product-handle'));
                icon.setAttribute('variant-id', wishButton.getAttribute('variant-id'));
                // Insert the wrapper before the button
                targetButton.parentNode.insertBefore(wrapperDiv, targetButton);
                // Append the button first, then the icon inside the wrapper
                wrapperDiv.appendChild(targetButton);
                wrapperDiv.appendChild(icon);
            }
            if (customButton?.iconBesideAddToCart === "left") {
                document.querySelector(".wg-addtocart-wrapper").style.flexDirection = "row-reverse"
            }
        }

    }
}


// ----------for the toast through library----------
// function showMOTTO() {
// toastr.success("Hello! This is a toast notification.", "Success", {
//     closeButton: true,
//     progressBar: true,
//     positionClass: "toast-top-right",
//     timeOut: 3000 // Auto close after 3 seconds
// });
// }


function showIconsOnPagiflyBuilder() {
    if (currentPlan > 2) {
        const productBoxes = document.querySelectorAll('div[data-pf-type="ProductBox"]');
        productBoxes.forEach((box) => {
            const form = box.querySelector('form[data-productid]');
            if (form) {
                const productId = form.getAttribute('data-productid');
                const hrefDiv = form.querySelector('div[data-href]');
                // const injectInDiv = form.querySelector('div[data-pf-type="ProductMedia"]');
                const injectInDiv = form.querySelector('div[data-pf-type="ProductMedia"], div[data-pf-type="ProductMedia2"]');
                if (hrefDiv) {
                    let href = hrefDiv.getAttribute('data-href') || '';
                    href = href.replace('/products/', '');
                    // Create the new wishlist div
                    const wishlistDiv = document.createElement('div');
                    wishlistDiv.className = 'wf-wishlist';
                    wishlistDiv.setAttribute('product-id', productId);
                    wishlistDiv.setAttribute('product-handle', href);
                    // Inject it at the start of the hrefDiv
                    injectInDiv.insertBefore(wishlistDiv, injectInDiv.firstChild);
                }
            }
        });
    }
}

function wgGetProductOptions() {
    function extractKeyValue(field) {
        const fullName = field.getAttribute("name");
        const nameKey = fullName.match(/properties\[(.*?)\]/)?.[1];
        return { key: nameKey, value: field.value };
    }
    const fields = document.querySelectorAll('[name^="properties"]');
    const result = {};
    fields.forEach(field => {
        if (field.type === "hidden") {
            if (field.value.trim() !== "") {
                const { key, value } = extractKeyValue(field);
                // if (key !== "_has_gpo" && key !== "_tpo_add_by") {
                if (key !== "_has_gpo" && key !== "_tpo_add_by" && key !== "_acoFields" && key !== "_acpaHidden" && key !== "_acoPrice" && key !== "_acoCompatibility" && key !== "_acoValidationDone" && key !== "qg_variant" && key !== "__AeroId" && key !== "_mainProduct" && key !== "_uniqueOptionId") {
                    result[key] = value;
                }
            }
        } else if (field.type === "checkbox" || field.type === "radio") {
            if (field.checked) {
                const { key, value } = extractKeyValue(field);
                result[key] = value;
            }
        } else if (field.tagName.toLowerCase() === "select" || field.tagName.toLowerCase() === "textarea" || field.type === "text" || field.type === "date" || field.type === "file") {
            if (field.value.trim() !== "") {
                const { key, value } = extractKeyValue(field);
                result[key] = value;
            }
        }
    });

    return Object.keys(result).length === 0 ? null : result;
}
