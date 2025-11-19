let storedProductDiv = document.getElementById("wf-current-product");
let storedModalProductDiv = document.getElementById("wf-modal-check-Product");
let filteredArr = [];
let modalFilteredArr = [];
let modalProductLink;
let matchedModalValue = [];
let matchedModalValues = "";
let GridElee;

document.addEventListener("DOMContentLoaded", getCurentPlanSql2);
// console.log(" ---------------- collection page code render ----------------- ")

const serverURL1 = 'http://localhost:5000'; // -------------- local
// const serverURL1 = "https://nurses-requests-prove-convicted.trycloudflare.com"; // -------------- local
// const serverURL1 = 'https://wishlist-api.webframez.com'; // -------------- production
// const serverURL1 = 'https://wishlist-guru-api.webframez.com';  // -------------- stagging


// let getCurrentThemeName = JSON.parse(getThemeNameColl);
let getCurrentThemeName = {themeName: "Icon"}
// let localDataC = JSON.parse(localStorage.getItem("wg-local-data"));
// let getCurrentThemeName = localDataC?.getThemeName || JSON.parse(getThemeNameColl);

const pattern = /\/products\/(.*)/;

let getDomain = window.location.href;
let getDomainUrl = window.location.href;

if (getDomainUrl.indexOf("/collections/") !== -1) {
    getDomain = getDomainUrl.split("/collections/")[0];
} else if (getDomainUrl.indexOf("/products/") !== -1) {
    getDomain = getDomainUrl.split("/products/")[0];
} else if (getDomainUrl.indexOf("/pages/") !== -1) {
    getDomain = getDomainUrl.split("/pages/")[0];
} else if (getDomainUrl.indexOf("/cart") !== -1) {
    getDomain = getDomainUrl.split("/cart")[0];
} else if (getDomainUrl.indexOf("/search/") !== -1) {
    getDomain = getDomainUrl.split("/search/")[0];
} else if (getDomainUrl.indexOf("/blogs/") !== -1) {
    getDomain = getDomainUrl.split("/blogs/")[0];
} else if (getDomainUrl.indexOf("/collections") !== -1) {
    getDomain = getDomainUrl.split("/collections")[0];
} else if (getDomainUrl.indexOf("/search") !== -1) {
    getDomain = getDomainUrl.split("/search")[0];
} else if (getDomainUrl.indexOf("/apps/") !== -1) {
    getDomain = getDomainUrl.split("/apps/")[0];
} else if (getDomainUrl.indexOf("/account") !== -1) {
    getDomain = getDomainUrl.split("/account")[0];
} else if (getDomainUrl.indexOf("/?_") !== -1) {
    getDomain = getDomainUrl.split("/?_")[0];
} else if (getDomainUrl.indexOf("/?") !== -1) {
    getDomain = getDomainUrl.split("/?")[0];
} else if (getDomainUrl.indexOf("?") !== -1) {
    getDomain = getDomainUrl.split("?")[0];
} else {
    getDomain = window.location.href;
}

if (getDomain.endsWith("/#")) {
    getDomain = getDomain.slice(0, -1); // remove the #
}
if (!getDomain.endsWith('/')) {
    getDomain += '/';
}



//  ---------------- here we are trying to get the data and icon fast ----------------
// (async function () {
//     console.log("this is for the new function")

//     // handleFilterChange1();

// })()







async function getCurentPlanSql2() {
    try {
        const response = await fetch(`${serverURL1}/get-current-plan-sql`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                "wg-api-key": getWgApiKey(),
                "wg-mail": localStorage.getItem("customer-email")

            },
            body: JSON.stringify({
                shopName: permanentDomain,

                wfGetDomain: getDomain,
                normalDomain: `https://${shopDomain}/`,
            })
        });
        let result = await response.json();
        if (result?.planData.length > 0) {
            currentShopPlan = result?.planData[0].active_plan_id;
        }
        await runsAfterDomContentLoaded2();
    } catch (error) {
        console.log("error")
    }
};

function findIdByHandle(targetHandle) {
    for (let wf = 0; wf < wgAllProducts.length; wf++) {
        if (wgAllProducts[wf].handle === targetHandle) {
            return { id: wgAllProducts[wf].id };
        }
    }
};

async function runsAfterDomContentLoaded2() {
    if (currentCollectionSeting["collectionIconType"] === null || currentCollectionSeting["collectionIconType"] === undefined || currentCollectionSeting["collectionIconType"] === "") {
        if (currentCollectionSeting.iconType === "star") {
            currentCollectionSeting["collectionIconType"] = "starOutlineSolid";
        } else if (currentCollectionSeting.iconType === "save") {
            currentCollectionSeting["collectionIconType"] = "saveOutlineSolid";
        } else {
            currentCollectionSeting["collectionIconType"] = "heartOutlineSolid";
        }
    }
};

async function detechThemeName() {
    if (Shopify.shop === 'mashbir.myshopify.com') {
        settingCurrentFilter = "none";
    }
    const params = {
        themeName: btoa(getCurrentThemeName.themeName),
        filter: btoa(settingCurrentFilter)
    }

    if (settingCurrentFilter === "custom") {
        params.customSettings = {
            gridElement: btoa(settingGridElement),
            productLink: btoa(settingProductElement),
            appendIcon: btoa(settingAppendIconElement),
            appendIconCheck: btoa(settingAppendIconCheck),
            afterIcon: btoa(settingAfterIcon),
            buttonPrependBeforeElemnt: btoa(settingButtonPrependBeforeElemnt)
        };
    }

    try {
        const response = await fetch(`${serverURL1}/get-theme-data`, {
            body: JSON.stringify(params),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data
    } catch (error) {
        console.error('Error fetching theme data:', error);
    }
}


let themeSelectors = {}

detechThemeName().then((result) => {
    themeSelectors = result
}).catch((error) => {
    console.error('Promise rejected:', error);
});

// const wgLocalDataT = JSON.parse(localStorage.getItem("wg-local-data")) || {};
// let themeSelectors = wgLocalDataT?.getThemeSelector || {};

// async function setThemeSelectors() {
//     if (currentShopPlan >= 2) {
//         let allHandler = [];
//         if (typeof themeSelectors.gridElement !== "undefined" && typeof themeSelectors.gridElement !== "null" && themeSelectors.gridElement !== "") {
//             const data = document.querySelectorAll(themeSelectors.gridElement);
//             let productHandlerData = [];
//             let productHandler = {};
//             if (data.length !== 0) {
//                 for (const element of data) {
//                     const productLinkElement = element.querySelector(themeSelectors.productLink);
//                     if (productLinkElement) {
//                         const labelledById = productLinkElement.getAttribute("href");
//                         if (labelledById === null) {
//                             return;
//                         }
//                         const match = labelledById.match(/\/products\/([^?]+)/);
//                         if (match) {
//                             const matchedValue = match[1];
//                             allHandler.push({ handle: matchedValue })
//                         }
//                     }
//                 }
//                 const filteredArr = allHandler;
//                 const finalStoredData = storedProductDiv.getAttribute("data-aj");
//                 if (parseInt(finalStoredData) !== filteredArr.length) {
//                     storedProductDiv.setAttribute("data-aj", filteredArr.length);
//                     storedProductDiv.setAttribute("data-product-handle", JSON.stringify(filteredArr));
//                 } else {
//                     const storedHandle = JSON.parse(storedProductDiv.getAttribute("data-product-handle"));
//                     const lastData = areIdsIncluded(storedHandle, filteredArr);
//                     if (!lastData) {
//                         storedProductDiv.setAttribute("data-aj", filteredArr.length);
//                         storedProductDiv.setAttribute("data-product-handle", JSON.stringify(filteredArr));
//                     } else if (document.querySelectorAll(".wf-wishlist-collection-icon, .wf-wishlist-collection-btn").length === 0) {
//                         storedProductDiv.setAttribute("data-aj", filteredArr.length);
//                         storedProductDiv.setAttribute("data-product-handle", JSON.stringify(filteredArr));
//                     }
//                 }
//             }
//         }
//     }
// }

async function setThemeSelectors() {
    if (currentShopPlan < 2) return;
    const allHandler = [];
    if (typeof themeSelectors.gridElement !== "undefined" && typeof themeSelectors.gridElement !== "null" && themeSelectors.gridElement !== "") {
        const data = document.querySelectorAll(themeSelectors.gridElement);
        let productHandlerData = [];
        let productHandler = {};

        if (!data.length) return; // Early exit if no grid elements are found


        // Loop through grid elements and extract product handles
        data.forEach((element) => {

            // position relative to all the grids

            // if (getCurrentThemeName?.themeName !== "Arterritoires x Symediane") {
            //     element.style.position = 'relative';
            // }

            const excludedThemes = ["Arterritoires x Symediane", "Refonte"];
            if (!excludedThemes.includes(getCurrentThemeName?.themeName)) {
                element.style.position = "relative";
            }


            const productLinkElement = element.querySelector(themeSelectors.productLink);
            if (!productLinkElement) return;

            const labelledById = productLinkElement.getAttribute("href");
            if (!labelledById) return;

            const match = labelledById.match(/\/products\/([^?]+)/);
            if (match) {
                allHandler.push({ handle: match[1] });
            }
        });
        const filteredArr = allHandler;
        const finalStoredData = storedProductDiv.getAttribute("data-aj");
        if (parseInt(finalStoredData) !== filteredArr.length) {
            storedProductDiv.setAttribute("data-aj", filteredArr.length);
            storedProductDiv.setAttribute("data-product-handle", JSON.stringify(filteredArr));
        } else {
            const storedHandle = JSON.parse(storedProductDiv.getAttribute("data-product-handle"));
            const lastData = areIdsIncluded(storedHandle, filteredArr);
            if (!lastData) {
                storedProductDiv.setAttribute("data-aj", filteredArr.length);
                storedProductDiv.setAttribute("data-product-handle", JSON.stringify(filteredArr));
            } else if (document.querySelectorAll(".wf-wishlist-collection-icon, .wf-wishlist-collection-btn").length === 0) {
                storedProductDiv.setAttribute("data-aj", filteredArr.length);
                storedProductDiv.setAttribute("data-product-handle", JSON.stringify(filteredArr));
            }
        }
    }
}

async function checkModalBtn() {
    if (themeSelectors.modalProductElement !== "") {
        const checkModalElements = document.querySelectorAll('.wf-wishlist-collection-icon-modal');
        const getProductEle = document.querySelector(themeSelectors.modalProductElement);
        let data = document.querySelectorAll(themeSelectors.modalProductElement);
        if (data.length > 0) {
            if (currentShopPlan < 2 || getProductEle === null) {
                return;
            }
            let productHandlerData = []
            if (themeSelectors.modalVariantMatchedUndefinedParent === "" && themeSelectors.modalVariantMatchedUndefinedSelector === "") {
                const productLinkElements = getProductEle.querySelectorAll("a");
                const pattern = /\/products\/(.*)/;
                productLinkElements.forEach(link => {
                    const href = link.getAttribute("href");
                    const match = pattern.exec(href);
                    if (matchedModalValue.length === 0) {
                        if (match !== null) {
                            if (match[1].includes('?')) {
                                matchedModalValue.push(match[1].split('?')[0]);
                                matchedModalValues = match[1].split('?')[0]
                            } else {
                                matchedModalValue.push(match[1])
                                matchedModalValues = match[1]
                            }
                        }
                    }
                });
            }
            if (matchedModalValues !== "" && storedModalProductDiv) {
                const response = await fetch(`/products/${matchedModalValues}.json`);
                const productHandler = await response.json();
                productHandlerData.push({ id: productHandler.product.id });
                const finalStoredData = storedModalProductDiv.getAttribute("data-aj");
                let filteredArr = productHandlerData
                if (parseInt(finalStoredData) !== filteredArr.length) {
                    storedModalProductDiv.setAttribute("data-aj", filteredArr.length);
                    storedModalProductDiv.setAttribute("data-product-handle", JSON.stringify(filteredArr));
                    const wfWishlist = document.querySelectorAll(".wf-wishlist-collection-icon-modal");
                    wfWishlist.forEach(element => {
                        element.remove();
                    });
                }
            }

        }
    }
}

document.addEventListener('click', async function (event) {
    if (themeSelectors.checkModalVariantMatchedUndefinedParent !== "") {
        const urlPattern = /\/products\/([^?]+)/;
        const target = event.target;
        let classListObj = Object.values(target.classList);
        const hasClass = classListObj.some(className => className.includes(themeSelectors.checkModalVariantMatchedUndefinedParent));
        if (hasClass) {
            const href = target.getAttribute(modalVariantMatchedUndefinedSelector);
            const match = pattern.exec(href);
            if (matchedModalValue.length === 0) {
                if (match !== null) {
                    if (match[1].includes('?')) {
                        matchedModalValues = match[1].split('?')[0]
                        matchedModalValue.push(match[1].split('?')[0]);
                    } else {
                        matchedModalValues = match[1]
                        matchedModalValue.push(match[1])
                    }
                }
            }
        }
    }
})

function areIdsIncluded(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    const idsSet = new Set(arr2.map(obj => obj.handle));
    for (let wf = 0; wf < arr1.length; wf++) {
        if (!idsSet.has(arr1[wf].handle)) {
            return false;
        }
    }
    return true;
}

const elTarget = document.querySelector("div#wf-current-product");

let wgObserver = new MutationObserver(handleFilterChange);
const objConfig = {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
};
wgObserver.observe(elTarget, objConfig);


// function startObserver() {
//     const elTarget = document.querySelector("div#wf-current-product"); // update selector
//     if (elTarget) {
//         let wgObserver = new MutationObserver(handleFilterChange);
//         const objConfig = {
//             childList: true,
//             subtree: true,
//             attributes: true,
//             characterData: true,
//         };
//         wgObserver.observe(elTarget, objConfig);
//         console.log("Observer started ✅");
//     } else {
//         console.warn("Target not found, retrying...");
//         setTimeout(startObserver, 500); // retry after 500ms
//     }
// }
// startObserver();















async function appendDivC(el, i) {
    el.appendChild(i);
}

let variantIds = {};

document.addEventListener("click", async function (event) {
    if (themeSelectors.modalVariantSelector !== "") {
        let selectedModalSel = document.querySelectorAll(themeSelectors.modalVariantSelector);
        if (selectedModalSel.length !== 0) {
            variantIds = {};
            let ab = [];
            selectedModalSel.forEach((pp) => {
                let nestedElements = pp.querySelectorAll(themeSelectors.modalVariantSubSelector);
                nestedElements.forEach((nestedElement) => {
                    let textContent = nestedElement.textContent.trim()
                    ab.push(textContent);
                });
            });
            variantIds = ab.join(" / ")
        }
    }
});

// --------------------------------------------Dyamic Modal Icon Code -------------------------------------
let wg_intervalId = null;
function setupInterval() {
    const intervalElements = document.querySelectorAll('.wf-wishlist-collection-icon-modal');
    if (intervalElements.length === 0 && !wg_intervalId) {
        wg_intervalId = setInterval(checkModalData, 1000);
    } else if (intervalElements.length > 0 && wg_intervalId) {
        clearInterval(wg_intervalId);
        wg_intervalId = null;
        checkForModalArray();
    }
}

async function checkModalData() {
    // let themeSelectors = await detechThemeName()
    if (themeSelectors.modalProductElement !== "") {
        const newData = document.querySelectorAll(themeSelectors?.modelMainElement);
        const checkModalClass = document.querySelectorAll('.wf-wishlist-collection-icon-modal');
        let checkProductPage = [];
        if (newData.length !== 0) {
            variantIds = {};
            checkProductPage = newData[0].querySelectorAll(themeSelectors.modalProductElement);
            if (checkModalClass.length === 0) {
                await checkModalBtn()
            }
        } else {
        }
    }
}

setupInterval();
setInterval(setupInterval, 1000);
setInterval(checkForModalArray, 800);

const elTarget1 = document.querySelector("div#wf-modal-check-Product");
let wgObserver1 = new MutationObserver(modalHandleFilterChange);
const objConfig1 = {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
};
wgObserver1.observe(elTarget1, objConfig1);

async function checkForModalArray() {
    if (themeSelectors?.modalProductElement !== "" && storedModalProductDiv) {
        const data = document.querySelectorAll(themeSelectors.modalProductElement);
        if (data.length > 0) {
        } else {
            if (Number(storedModalProductDiv.getAttribute("data-aj")) !== 0) {
                storedModalProductDiv.setAttribute("data-aj", 0);
                storedModalProductDiv.setAttribute("data-product-handle", []);
                matchedModalValue.length = 0
            }
            if (currentCollectionSeting.quickViewShowOption === 'after-title') {

            }
            if (currentCollectionSeting.quickViewShowAs === "icon" && currentCollectionSeting.quickViewShowOption === 'after-title' && getProductEle !== null) {
                const addButton = getProductEle.querySelector(themeSelectors.modalbuttonAppendOnTitle);
                addButton.style.display = ""
                addButton.style.gap = ""
            }
            clearInterval()
        }
    } else {
        clearInterval()
    }
}

// function checkData(dataa) {
//     const intervalIconElements = document.querySelectorAll('.wf-wishlist-collection-icon, .wf-wishlist-collection-btn');
//     let productHandles = [];
//     intervalIconElements.forEach(element => {
//         let productHandle = element.getAttribute('product-handle');
//         if (productHandle) {
//             productHandles.push(productHandle);
//         }
//     });
//     if (dataa.length !== productHandles.length) {
//         return false;
//     }
//     const idsSet = new Set(dataa.map(obj => obj));
//     for (let wf = 0; wf < productHandles.length; wf++) {
//         if (!idsSet.has(productHandles[wf])) {
//             return false;
//         }
//     }
//     return true;
// }

function checkData(dataa) {
    const productHandles = Array.from(document.querySelectorAll('.wf-wishlist-collection-icon, .wf-wishlist-collection-btn'))
        .map(el => el.getAttribute('product-handle'))
        .filter(Boolean); // remove null/undefined
    if (dataa.length !== productHandles.length) return false;
    const idsSet = new Set(dataa);
    return productHandles.every(handle => idsSet.has(handle));
}


window.addEventListener("keydown", function (e) {
    if (e.ctrlKey && ['+', '-', '=', '0'].includes(e.key)) {
        applyZoomAdjustments();
    }
});

window.addEventListener("wheel", function (e) {
    if (e.ctrlKey) {
        applyZoomAdjustments();
    }
});

window.addEventListener("resize", function () {
    applyZoomAdjustments();
});


function applyZoomAdjustments() {
    if (currentCollectionSeting.iconPosition === 'icon-bottom-left' || currentCollectionSeting.iconPosition === 'icon-bottom-right') {
        setTimeout(() => {
            const checkProduct = document.querySelectorAll(themeSelectors.gridElement);
            checkProduct.forEach(async (element, i) => {
                const currentImageElement = checkProduct[i].querySelector('img').parentNode;
                const getSelectedIcon = await whichClassIsAdded();
                let heightCalculate = currentImageElement.clientHeight - Number(getSelectedIcon.iconHeight) - 5;
                let selectedDiv = element.querySelector('.collection_icon_new, .collection_icon_new_selected')
                if (selectedDiv) {
                    // selectedDiv.style.setProperty('top', `${heightCalculate}px`, 'important');
                    selectedDiv.style.top = `${heightCalculate}px`;
                }
            })
        }, 150);
    }
}




// async function handleFilterChange1() {
//     let localData = JSON.parse(localStorage.getItem("wg-local-data"));
//     let currentShopPlan1 = localData?.currentPlan;
//     let themeSelectors1 = localData?.getThemeSelector || {};
//     let collectionBtnSetting = localData?.collectionBtnSetting;
//     let getCurrentThemeName1 = localData?.getThemeName;

//     if (!currentShopPlan1 || Object.keys(themeSelectors1).length === 0) {
//         return;
//     }

//     console.log(" ------ START ------ ")
//     if (currentShopPlan1 >= 2) {
//         // const checkWishlistData = await getDataFromSql();
//         const checkWishlistData = JSON.parse(localStorage.getItem("wg-local-list")) || [];

//         // console.log("allWishlistData -- ", allWishlistData);
//         // console.log("DATA ---- ", checkWishlistData);




//         // let allHandle = []
//         let flag = true;
//         // const checkProductD = document.querySelectorAll(themeSelectors1.gridElement);
//         // checkProductD.forEach(async (element, i) => {

//         //     const productLinkElement = element.querySelector(themeSelectors1.productLink);
//         //     if (productLinkElement) {
//         //         const labelledById = productLinkElement.getAttribute("href");
//         //         if (labelledById === null) {
//         //             return;
//         //         }
//         //         const pattern = /\/products\/(.*)/;
//         //         const match = pattern.exec(labelledById);
//         //         if (match === null) {
//         //             return;
//         //         }
//         //         let matchedValue;
//         //         if (match[1].includes('?')) {
//         //             matchedValue = match[1].split('?')[0];
//         //         } else {
//         //             matchedValue = match[1]
//         //         }
//         //         allHandle.push(decodeURIComponent(matchedValue));
//         //     }
//         // });


//         const checkProductD = document.querySelectorAll(themeSelectors1.gridElement);
//         const allHandle = Array.from(checkProductD)
//             .map(el => {
//                 const href = el.querySelector(themeSelectors1.productLink)?.getAttribute("href");
//                 if (!href) return null;
//                 const match = href.match(/\/products\/([^?]+)/);
//                 return match ? decodeURIComponent(match[1]) : null;
//             })
//             .filter(Boolean);









//         // let productHandler = {};
//         // const data = checkData(allHandle)
//         // let checkR = true
//         // checkR = data
//         // let checkHeartExist = false;
//         // const fetchPromises = allHandle.map(async (matchedValue) => {
//         //     if (!checkR) {
//         //         checkHeartExist = false;
//         //         let selector;
//         //         if (collectionBtnSetting.collectionType === "buttonType") {
//         //             selector = '.wf-wishlist-collection-btn[product-handle="' + matchedValue + '"]';
//         //         } else {
//         //             selector = '.wf-wishlist-collection-icon[product-handle="' + matchedValue + '"]';
//         //         }
//         //         let elements = document.querySelectorAll(selector);
//         //         if (elements.length >= 1) {
//         //             checkHeartExist = true
//         //         }
//         //         if (checkHeartExist == false) {
//         //             try {
//         //                 const response = await fetch(`${getDomain}products/${matchedValue}.json`);
//         //                 if (!response.ok) {
//         //                     throw new Error(`HTTP error! Status: ${response.status}`);
//         //                 }
//         //                 const jsonData = await response.json();
//         //                 return jsonData;
//         //             } catch (error) {
//         //                 console.error(`Error fetching data for ${matchedValue}:`, error);
//         //                 throw error; // Rethrow the error to be caught later
//         //             }
//         //         }
//         //     }
//         // });
//         // const responses = await Promise.all(fetchPromises)
//         // // console.log("responses -- ", responses);
//         // responses.forEach((ele, i) => {
//         //     if (ele !== undefined) {
//         //         productHandler[ele.product.handle] = { id: ele.product.id };
//         //     }
//         // });

//         let productHandler = {};
//         const checkR = checkData(allHandle);
//         const fetchPromises = allHandle.map(async (matchedValue) => {
//             if (checkR) return; // if already valid, skip
//             const selector =
//                 collectionBtnSetting.collectionType === "buttonType"
//                     ? `.wf-wishlist-collection-btn[product-handle="${matchedValue}"]`
//                     : `.wf-wishlist-collection-icon[product-handle="${matchedValue}"]`;
//             const elements = document.querySelectorAll(selector);
//             if (elements.length > 0) return; // already exists, skip fetch
//             try {
//                 const response = await fetch(`${getDomain}products/${matchedValue}.json`);
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! Status: ${response.status}`);
//                 }
//                 const { product } = await response.json();
//                 return product;
//             } catch (error) {
//                 console.error(`Error fetching data for ${matchedValue}:`, error);
//                 return null; // prevent Promise.all from breaking
//             }
//         });
//         const responses = await Promise.all(fetchPromises);
//         responses
//             .filter(Boolean)
//             .forEach(product => {
//                 productHandler[product.handle] = { id: product.id };
//             });













//         const checkProduct = document.querySelectorAll(themeSelectors1.gridElement);
//         const checkImgDiv = document.querySelectorAll(".wf-wishlist-check-img")
//         const prependPromises = [];

//         if (collectionBtnSetting.collectionType === "buttonType") {
//             if (flag === true) {
//                 checkProduct.forEach(async (element, i) => {
//                     const productLinkElement = element.querySelector(themeSelectors1.productLink);
//                     if (productLinkElement) {
//                         const labelledById = productLinkElement.getAttribute("href");
//                         if (labelledById === null) {
//                             return;
//                         }
//                         const match = labelledById.match(/\/products\/([^?]+)/);
//                         if (match) {
//                             const matchedValue = decodeURIComponent(match[1]);
//                             for (let key in productHandler) {
//                                 if (key === matchedValue) {
//                                     // if (!checkProduct[i].querySelector('.wf-wishlist-collection-btn')) {

//                                     if (!checkProduct[i].classList.contains('wf-wishlist-collection-btn')) {
//                                         const existingWishlistDiv = checkProduct[i].querySelectorAll('.wf-wishlist-collection-btn');
//                                         if (existingWishlistDiv.length === 0) {

//                                             const wishlistDiv = document.createElement('div');
//                                             wishlistDiv.className = 'wf-wishlist-collection-btn';
//                                             wishlistDiv.style.display = 'none';
//                                             wishlistDiv.style.width = renderWidth(isCollectionCount)
//                                             wishlistDiv.setAttribute('product-id', productHandler[key].id);
//                                             wishlistDiv.setAttribute('product-handle', key);
//                                             if (themeSelectors1.buttonPrependBeforeElemnt) {
//                                                 const lastChild = checkProduct[i].firstElementChild;
//                                                 lastChild.appendChild(wishlistDiv);
//                                             } else {
//                                                 if (settingCurrentFilter === "sparq") {
//                                                     checkProduct[i].parentNode.style.position = "relative";
//                                                 }
//                                                 else if (settingCurrentFilter === "boost") {
//                                                     let wishIcon = document.querySelectorAll(".boost-sd__product-image-column")
//                                                     wishIcon[i].appendChild(wishlistDiv);
//                                                 } else if (getCurrentThemeName1?.themeName === "Impact") {

//                                                     checkProduct[i].querySelector(themeSelectors1.variableForIconButton).appendChild(wishlistDiv);
//                                                 } else {
//                                                     checkProduct[i].appendChild(wishlistDiv);
//                                                 }
//                                             }
//                                             let addWishlistIconCollection = document.createElement("div");
//                                             addWishlistIconCollection.style.zIndex = "10";
//                                             addWishlistIconCollection.style.position = "relative";
//                                             let selectedId = wishlistDiv.getAttribute('product-id');

//                                             const addToWishlistData = await renderButtonAddToWishlist(selectedId, isCollectionCount);
//                                             const alreadyAddedToWishlistData = await renderButtonAddedToWishlist(selectedId, isCollectionCount);

//                                             // const countData = await isCountOrNot(selectedId, isCollectionCount)

//                                             const matchFound = await checkFound(checkWishlistData, Number(selectedId))

//                                             // if (checkWishlistData.length > 0 && matchFound) {
//                                             //     addWishlistIconCollection.innerHTML = `<div  class="modalButtonCollection" >${alreadyAddedToWishlistData}</div>${!onlyTextButton ? countData : ""}`
//                                             // } else {
//                                             //     addWishlistIconCollection.innerHTML = `<div  class="modalButtonCollection"  >${addToWishlistData}</div>${!onlyTextButton ? countData : ""}`;
//                                             // }

//                                             if (checkWishlistData.length > 0 && matchFound) {
//                                                 addWishlistIconCollection.innerHTML = `<div  class="modalButtonCollection" >${alreadyAddedToWishlistData}</div>`
//                                             } else {
//                                                 addWishlistIconCollection.innerHTML = `<div  class="modalButtonCollection"  >${addToWishlistData}</div>`;
//                                             }

//                                             prependPromises.push(
//                                                 wishlistDiv.innerHTML = addWishlistIconCollection.innerHTML
//                                             );
//                                             wishlistDiv && (wishlistDiv.onclick = function (event) {
//                                                 collectionIconClick(event, selectedId, key);
//                                             });
//                                             renderCustomButtonBorder(matchFound ? "added" : "removed", selectedId, isCollectionCount)
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 });
//                 Promise.all(prependPromises)
//                     .then(() => {
//                         let allShow = document.querySelectorAll('.wf-wishlist-collection-btn');
//                         allShow.forEach((w) => {
//                             w.style.display = 'flex';
//                             w.style.position = "relative"
//                             w.style.zIndex = "999"
//                             w.style.top = "5px"
//                         });
//                     })
//                     .catch((error) => {
//                         console.log('Error occurred');
//                     });
//             }
//         } else {

//             // -------- this is for the collection icon injected --------


//             if (flag === true) {
//                 checkProduct.forEach(async (element, i) => {
//                     const productLinkElement = element.querySelector(themeSelectors1.productLink);
//                     let addIcon = element.querySelector(themeSelectors1.appendIcon)
//                     if (productLinkElement) {
//                         const labelledById = productLinkElement.getAttribute("href");
//                         if (labelledById === null) {
//                             return;
//                         }
//                         const match = labelledById.match(/\/products\/([^?]+)/);
//                         if (match) {
//                             const matchedValue = decodeURIComponent(match[1]);

//                             for (let key in productHandler) {
//                                 if (key === matchedValue) {
//                                     // if (!addIcon.querySelector('.wf-wishlist-collection-icon')) {

//                                     if (!checkProduct[i].classList.contains('wf-wishlist-collection-icon')) {
//                                         const existingWishlistDiv = checkProduct[i].querySelectorAll('.wf-wishlist-collection-icon');
//                                         if (existingWishlistDiv.length === 0) {

//                                             const wishlistDiv = document.createElement('div');
//                                             wishlistDiv.className = 'wf-wishlist-collection-icon';
//                                             wishlistDiv.style.display = 'none';
//                                             wishlistDiv.setAttribute('product-id', productHandler[key].id);
//                                             wishlistDiv.setAttribute('product-handle', key);

//                                             //   -------  adding a new condition -------- randeep
//                                             if (addIcon) {

//                                                 if (themeSelectors1.appendIconCheck) {
//                                                     addIcon.appendChild(wishlistDiv);
//                                                 } else if (themeSelectors1.afterIcon) {
//                                                     addIcon.after(wishlistDiv);
//                                                 }
//                                                 else if (themeSelectors1.beforeIcon) {
//                                                     if (getCurrentThemeName1.themeName === "Minimal") {
//                                                         addIcon.parentNode.style.position = 'relative';
//                                                     }
//                                                     addIcon.parentNode.insertBefore(wishlistDiv, addIcon);

//                                                 }
//                                                 else {
//                                                     if (getCurrentThemeName1?.themeName === "Modular") {
//                                                         addIcon.appendChild(wishlistDiv);
//                                                     } else {
//                                                         if (settingCurrentFilter === "sparq") {
//                                                             addIcon.parentNode.style.position = "relative";
//                                                         }
//                                                         else if (settingCurrentFilter === "boost") {
//                                                             let wishIcon = document.querySelectorAll(".boost-sd__product-image-column")
//                                                             addIcon.prepend(wishlistDiv);
//                                                         } else {
//                                                             addIcon.prepend(wishlistDiv);
//                                                         }
//                                                     }
//                                                 }

//                                             }

//                                             const getSelectedIcon = await whichClassIsAdded();
//                                             let imgHeight = 10;

//                                             let addWishlistIconCollection = document.createElement("div");
//                                             addWishlistIconCollection.style.zIndex = "10";
//                                             addWishlistIconCollection.style.position = "relative";
//                                             let selectedId = wishlistDiv.getAttribute('product-id');

//                                             wishlistDiv.classList.add(getSelectedIcon.iconPosition)

//                                             if (getSelectedIcon.checkClassExist === true) {
//                                                 const currentImageElement = getCurrentThemeName1?.themeName === "Eurus" ? imgFxn(checkProduct[i]) : checkProduct[i].querySelector('img').parentNode;
//                                                 if (settingCurrentFilter === "boost") {
//                                                     if (currentImageHeight) {
//                                                         imgHeight = currentImageElement.clientHeight - Number(getSelectedIcon.iconHeight) - 5;
//                                                     }
//                                                 } else if (currentImageElement) {
//                                                     imgHeight = currentImageElement.clientHeight - Number(getSelectedIcon.iconHeight) - 5;
//                                                 }
//                                                 if (getCurrentThemeName1?.themeName === "Grid" || getCurrentThemeName1?.themeName === "Impact" || getCurrentThemeName1?.themeName === "Aurora" || getCurrentThemeName1?.themeName === "Gain" || getCurrentThemeName1?.themeName === "Alchemy" || getCurrentThemeName1?.themeName === "Xclusive") {
//                                                     const currentImageElement = checkProduct[i].querySelector(themeSelectors1.appendIcon);
//                                                     imgHeight = currentImageElement.clientHeight - Number(getSelectedIcon.iconHeight) - 5;
//                                                 }
//                                             }
//                                             let iconHtml;
//                                             const isNewHeartIcon = (currentCollectionSeting.collectionIconType === 'comboHeart' || currentCollectionSeting.collectionIconType === 'comboStar' || currentCollectionSeting.collectionIconType === 'comboSave')

//                                             const countData = await isCountOrNot(selectedId, isCollectionCount)
//                                             const newCountData = onlyTextButton ? `<div class="wf-product-count">${countData}</div>` : countData;
//                                             const matchFound = await checkFound(checkWishlistData, Number(selectedId))

//                                             isCollectionCount && (imgHeight = imgHeight - 15)
//                                             if (checkWishlistData.length > 0 && matchFound) {
//                                                 iconHtml = `<div class="collection_icon_new_selected" style="${getSelectedIcon.checkClassExist === true ? 'top:' + imgHeight + 'px;' : ''}">
//                                                                 <div onClick="collectionIconClick(event,'${selectedId}','${key}')" class="${isNewHeartIcon ? getSelectedIcon.iconStyle2 : getSelectedIcon.iconStyle} wg-collectionIcon selected">
//                                                                     <span class="span-hearticon"></span>
//                                                                 </div>
//                                                             </div>${isCollectionCount ? newCountData : ""}`;
//                                             } else {
//                                                 iconHtml = `<div class="collection_icon_new" style="${getSelectedIcon.checkClassExist === true ? 'top:' + imgHeight + 'px;' : ''}">
//                                                                 <div  onClick="collectionIconClick(event,'${selectedId}','${key}')" class="${getSelectedIcon.iconStyle} wg-collectionIcon">
//                                                                     <span class="span-hearticon"></span>
//                                                                 </div>
//                                                             </div>${isCollectionCount ? newCountData : ""}`;
//                                             }
//                                             prependPromises.push(
//                                                 wishlistDiv.innerHTML = iconHtml
//                                             );
//                                             if (isCollectionCount) {
//                                                 const countDataElement = document.querySelector(`.wf-wishlist-collection-icon[product-id='${selectedId}'] .wf-product-count`);

//                                                 if (countDataElement) {
//                                                     if (getSelectedIcon.checkClassExist === true) {
//                                                         countDataElement.style.top = `${imgHeight + 25}px`;
//                                                     } else {
//                                                         countDataElement.style.top = `25px`;
//                                                     }
//                                                 };
//                                                 renderCollectionTextColor(matchFound ? "added" : "removed", selectedId, isCollectionCount)
//                                             }
//                                             collectionIconSize()
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 });
//                 Promise.all(prependPromises)
//                     .then(() => {
//                         let allShow = document.querySelectorAll('.wf-wishlist-collection-icon');
//                         allShow.forEach((w) => {
//                             if (getCurrentThemeName1?.themeName === "Avante") {
//                                 w.style.position = "relative";
//                             }
//                             w.style.display = 'block';
//                         });
//                     })
//                     .catch((error) => {
//                         console.log('Error occurred');
//                     });
//             }
//             // console.log(" ------ END 222 ------ ")
//         }
//         flag = false;
//         // console.log(" ------ END 111 ------ ")
//     }
//     console.log(" ------ END 000  ------ ")
// }



async function handleFilterChange() {
    // console.log(" ------ START ------ ")
    if (currentShopPlan >= 2) {
        // const checkWishlistData = await getDataFromSql();
        const checkWishlistData = allWishlistData;

        // console.log("allWishlistData -- ", allWishlistData);
        // console.log("DATA ---- ", checkWishlistData);

        let allHandle = []
        let flag = true;
        const checkProductD = document.querySelectorAll(themeSelectors.gridElement);
        checkProductD.forEach(async (element, i) => {

            const productLinkElement = element.querySelector(themeSelectors.productLink);
            if (productLinkElement) {
                const labelledById = productLinkElement.getAttribute("href");
                if (labelledById === null) {
                    return;
                }
                const pattern = /\/products\/(.*)/;
                const match = pattern.exec(labelledById);
                if (match === null) {
                    return;
                }
                let matchedValue;
                if (match[1].includes('?')) {
                    matchedValue = match[1].split('?')[0];
                } else {
                    matchedValue = match[1]
                }
                allHandle.push(decodeURIComponent(matchedValue));
            }
        });
        let productHandler = {};

        // console.log("allHandle -- ", allHandle);

        const data = await checkData(allHandle)
        let checkR = true
        checkR = data
        let checkHeartExist = false;
        const fetchPromises = allHandle.map(async (matchedValue) => {
            if (!checkR) {
                checkHeartExist = false;
                let selector;
                if (collectionBtnSetting.collectionType === "buttonType") {
                    selector = '.wf-wishlist-collection-btn[product-handle="' + matchedValue + '"]';
                } else {
                    selector = '.wf-wishlist-collection-icon[product-handle="' + matchedValue + '"]';
                }
                let elements = document.querySelectorAll(selector);
                if (elements.length >= 1) {
                    checkHeartExist = true
                }
                if (checkHeartExist == false) {
                    try {
                        const response = await fetch(`${getDomain}products/${matchedValue}.json`);
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        const jsonData = await response.json();
                        return jsonData;
                    } catch (error) {
                        console.error(`Error fetching data for ${matchedValue}:`, error);
                        throw error; // Rethrow the error to be caught later
                    }
                }
            }
        });
        const responses = await Promise.all(fetchPromises)


        // console.log("responses -- ", responses);

        responses.forEach((ele, i) => {
            if (ele !== undefined) {
                productHandler[ele.product.handle] = { id: ele.product.id };
            }
        });
        const checkProduct = document.querySelectorAll(themeSelectors.gridElement);
        const checkImgDiv = document.querySelectorAll(".wf-wishlist-check-img")
        const prependPromises = [];

        if (collectionBtnSetting.collectionType === "buttonType") {
            if (flag = true) {
                checkProduct.forEach(async (element, i) => {
                    const productLinkElement = element.querySelector(themeSelectors.productLink);
                    if (productLinkElement) {
                        const labelledById = productLinkElement.getAttribute("href");
                        if (labelledById === null) {
                            return;
                        }
                        const match = labelledById.match(/\/products\/([^?]+)/);
                        if (match) {
                            const matchedValue = decodeURIComponent(match[1]);
                            for (let key in productHandler) {
                                if (key === matchedValue) {
                                    // if (!checkProduct[i].querySelector('.wf-wishlist-collection-btn')) {

                                    if (!checkProduct[i].classList.contains('wf-wishlist-collection-btn')) {
                                        const existingWishlistDiv = checkProduct[i].querySelectorAll('.wf-wishlist-collection-btn');
                                        if (existingWishlistDiv.length === 0) {

                                            const wishlistDiv = document.createElement('div');
                                            wishlistDiv.className = 'wf-wishlist-collection-btn';
                                            wishlistDiv.style.display = 'none';
                                            wishlistDiv.style.width = renderWidth(isCollectionCount)
                                            wishlistDiv.setAttribute('product-id', productHandler[key].id);
                                            wishlistDiv.setAttribute('product-handle', key);
                                            if (themeSelectors.buttonPrependBeforeElemnt) {
                                                const lastChild = checkProduct[i].firstElementChild;
                                                lastChild.appendChild(wishlistDiv);
                                            } else {
                                                if (settingCurrentFilter === "sparq") {
                                                    checkProduct[i].parentNode.style.position = "relative";
                                                }
                                                else if (settingCurrentFilter === "boost") {
                                                    let wishIcon = document.querySelectorAll(".boost-sd__product-image-column")
                                                    wishIcon[i].appendChild(wishlistDiv);
                                                } else if (getCurrentThemeName?.themeName === "Impact") {

                                                    checkProduct[i].querySelector(themeSelectors.variableForIconButton).appendChild(wishlistDiv);
                                                } else {
                                                    checkProduct[i].appendChild(wishlistDiv);
                                                }
                                            }
                                            let addWishlistIconCollection = document.createElement("div");
                                            addWishlistIconCollection.style.zIndex = "10";
                                            addWishlistIconCollection.style.position = "relative";
                                            let selectedId = wishlistDiv.getAttribute('product-id');

                                            const addToWishlistData = await renderButtonAddToWishlist(selectedId, isCollectionCount);
                                            const alreadyAddedToWishlistData = await renderButtonAddedToWishlist(selectedId, isCollectionCount);

                                            // const countData = await isCountOrNot(selectedId, isCollectionCount)

                                            const matchFound = await checkFound(checkWishlistData, Number(selectedId))

                                            // if (checkWishlistData.length > 0 && matchFound) {
                                            //     addWishlistIconCollection.innerHTML = `<div  class="modalButtonCollection" >${alreadyAddedToWishlistData}</div>${!onlyTextButton ? countData : ""}`
                                            // } else {
                                            //     addWishlistIconCollection.innerHTML = `<div  class="modalButtonCollection"  >${addToWishlistData}</div>${!onlyTextButton ? countData : ""}`;
                                            // }

                                            if (checkWishlistData.length > 0 && matchFound) {
                                                addWishlistIconCollection.innerHTML = `<div  class="modalButtonCollection" >${alreadyAddedToWishlistData}</div>`
                                            } else {
                                                addWishlistIconCollection.innerHTML = `<div  class="modalButtonCollection"  >${addToWishlistData}</div>`;
                                            }

                                            prependPromises.push(
                                                wishlistDiv.innerHTML = addWishlistIconCollection.innerHTML
                                            );
                                            wishlistDiv && (wishlistDiv.onclick = function (event) {
                                                collectionIconClick(event, selectedId, key);
                                            });
                                            renderCustomButtonBorder(matchFound ? "added" : "removed", selectedId, isCollectionCount)
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                Promise.all(prependPromises)
                    .then(() => {
                        let allShow = document.querySelectorAll('.wf-wishlist-collection-btn');
                        allShow.forEach((w) => {
                            w.style.display = 'flex';
                            w.style.position = "relative"
                            w.style.zIndex = "999"
                            w.style.top = "5px"
                        });
                    })
                    .catch((error) => {
                        console.log('Error occurred');
                    });
            }
        } else {
            if (flag = true) {
                checkProduct.forEach(async (element, i) => {
                    const productLinkElement = element.querySelector(themeSelectors.productLink);
                    let addIcon = element.querySelector(themeSelectors.appendIcon)
                    if (productLinkElement) {
                        const labelledById = productLinkElement.getAttribute("href");
                        if (labelledById === null) {
                            return;
                        }
                        const match = labelledById.match(/\/products\/([^?]+)/);
                        if (match) {
                            const matchedValue = decodeURIComponent(match[1]);

                            for (let key in productHandler) {
                                if (key === matchedValue) {
                                    // if (!addIcon.querySelector('.wf-wishlist-collection-icon')) {

                                    if (!checkProduct[i].classList.contains('wf-wishlist-collection-icon')) {
                                        const existingWishlistDiv = checkProduct[i].querySelectorAll('.wf-wishlist-collection-icon');
                                        if (existingWishlistDiv.length === 0) {

                                            const wishlistDiv = document.createElement('div');
                                            wishlistDiv.className = 'wf-wishlist-collection-icon';
                                            wishlistDiv.style.display = 'none';
                                            wishlistDiv.setAttribute('product-id', productHandler[key].id);
                                            wishlistDiv.setAttribute('product-handle', key);

                                            //   -------  adding a new condition -------- randeep
                                            if (addIcon) {

                                                if (themeSelectors.appendIconCheck) {
                                                    addIcon.appendChild(wishlistDiv);
                                                } else if (themeSelectors.afterIcon) {
                                                    addIcon.after(wishlistDiv);
                                                }
                                                else if (themeSelectors.beforeIcon) {
                                                    if (getCurrentThemeName.themeName === "Minimal") {
                                                        addIcon.parentNode.style.position = 'relative';
                                                    }
                                                    addIcon.parentNode.insertBefore(wishlistDiv, addIcon);

                                                }
                                                else {
                                                    if (getCurrentThemeName?.themeName === "Modular") {
                                                        addIcon.appendChild(wishlistDiv);
                                                    } else {
                                                        if (settingCurrentFilter === "sparq") {
                                                            addIcon.parentNode.style.position = "relative";
                                                        }
                                                        else if (settingCurrentFilter === "boost") {
                                                            let wishIcon = document.querySelectorAll(".boost-sd__product-image-column")
                                                            addIcon.prepend(wishlistDiv);
                                                        } else {
                                                            addIcon.prepend(wishlistDiv);
                                                        }
                                                    }
                                                }

                                            }

                                            const getSelectedIcon = await whichClassIsAdded();
                                            let imgHeight = 10;

                                            let addWishlistIconCollection = document.createElement("div");
                                            addWishlistIconCollection.style.zIndex = "10";
                                            addWishlistIconCollection.style.position = "relative";
                                            let selectedId = wishlistDiv.getAttribute('product-id');

                                            wishlistDiv.classList.add(getSelectedIcon.iconPosition)

                                            if (getSelectedIcon.checkClassExist === true) {
                                                const currentImageElement = getCurrentThemeName?.themeName === "Eurus" ? imgFxn(checkProduct[i]) : checkProduct[i].querySelector('img').parentNode;
                                                if (settingCurrentFilter === "boost") {
                                                    if (currentImageHeight) {
                                                        imgHeight = currentImageElement.clientHeight - Number(getSelectedIcon.iconHeight) - 5;
                                                    }
                                                } else if (currentImageElement) {
                                                    imgHeight = currentImageElement.clientHeight - Number(getSelectedIcon.iconHeight) - 5;
                                                }
                                                if (getCurrentThemeName?.themeName === "Grid" || getCurrentThemeName?.themeName === "Impact" || getCurrentThemeName?.themeName === "Aurora" || getCurrentThemeName?.themeName === "Gain" || getCurrentThemeName?.themeName === "Alchemy" || getCurrentThemeName?.themeName === "Xclusive") {
                                                    const currentImageElement = checkProduct[i].querySelector(themeSelectors.appendIcon);
                                                    imgHeight = currentImageElement.clientHeight - Number(getSelectedIcon.iconHeight) - 5;
                                                }
                                            }
                                            let iconHtml;
                                            const isNewHeartIcon = (currentCollectionSeting.collectionIconType === 'comboHeart' || currentCollectionSeting.collectionIconType === 'comboStar' || currentCollectionSeting.collectionIconType === 'comboSave')

                                            const countData = await isCountOrNot(selectedId, isCollectionCount)
                                            const newCountData = onlyTextButton ? `<div class="wf-product-count">${countData}</div>` : countData;
                                            const matchFound = await checkFound(checkWishlistData, Number(selectedId))

                                            isCollectionCount && (imgHeight = imgHeight - 15)
                                            if (checkWishlistData.length > 0 && matchFound) {
                                                iconHtml = `<div class="collection_icon_new_selected" style="${getSelectedIcon.checkClassExist === true ? 'top:' + imgHeight + 'px;' : ''}">
                                                                <div onClick="collectionIconClick(event,'${selectedId}','${key}')" class="${isNewHeartIcon ? getSelectedIcon.iconStyle2 : getSelectedIcon.iconStyle} wg-collectionIcon selected">
                                                                    <span class="span-hearticon"></span>
                                                                </div>
                                                            </div>${isCollectionCount ? newCountData : ""}`;
                                            } else {
                                                iconHtml = `<div class="collection_icon_new" style="${getSelectedIcon.checkClassExist === true ? 'top:' + imgHeight + 'px;' : ''}">
                                                                <div  onClick="collectionIconClick(event,'${selectedId}','${key}')" class="${getSelectedIcon.iconStyle} wg-collectionIcon">
                                                                    <span class="span-hearticon"></span>
                                                                </div>
                                                            </div>${isCollectionCount ? newCountData : ""}`;
                                            }
                                            prependPromises.push(
                                                wishlistDiv.innerHTML = iconHtml
                                            );
                                            if (isCollectionCount) {
                                                const countDataElement = document.querySelector(`.wf-wishlist-collection-icon[product-id='${selectedId}'] .wf-product-count`);

                                                if (countDataElement) {
                                                    if (getSelectedIcon.checkClassExist === true) {
                                                        countDataElement.style.top = `${imgHeight + 25}px`;
                                                    } else {
                                                        countDataElement.style.top = `25px`;
                                                    }
                                                };
                                                renderCollectionTextColor(matchFound ? "added" : "removed", selectedId, isCollectionCount)
                                            }
                                            collectionIconSize()
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                Promise.all(prependPromises)
                    .then(() => {
                        let allShow = document.querySelectorAll('.wf-wishlist-collection-icon');
                        allShow.forEach((w) => {
                            if (getCurrentThemeName?.themeName === "Avante") {
                                w.style.position = "relative";
                            }
                            w.style.display = 'block';
                        });
                    })
                    .catch((error) => {
                        console.log('Error occurred');
                    });
            }
            // console.log(" ------ END 222 ------ ")
        }
        flag = false;
        // console.log(" ------ END 111 ------ ")
    }
    // console.log(" ------ END 000  ------ ")
}

async function modalHandleFilterChange() {

    // if (currentShopPlan >= 2) {
    //     themeSelectors.modalProductElement
    //     if (typeof themeSelectors.modalProductElement !== "undefined" && typeof themeSelectors.modalProductElement !== "null" && themeSelectors.modalProductElement !== "") {
    //         if (getCurrentThemeName?.themeName !== "Symmetry") {
    //             getProductEle = document.querySelector(themeSelectors.modalProductElement);
    //             productLinkElements = getProductEle.querySelectorAll("a")
    //         } else {
    //             const quickbuyContainers = document.querySelectorAll(themeSelectors.modalProductElement);
    //             quickbuyContainers.forEach(quickbuyContainer => {
    //                 const computedStyle = getComputedStyle(quickbuyContainer);
    //                 const height = computedStyle.height;
    //                 if (height !== '0px') {
    //                     getProductEle = quickbuyContainer
    //                     GridElee = quickbuyContainer
    //                     productLinkElements = quickbuyContainer.querySelectorAll("a");
    //                     return;
    //                 } else {
    //                 }
    //             });
    //         }
    //         const checkModalElements = document.querySelectorAll('.wf-wishlist-collection-icon-modal');
    //         const pattern = /\/products\/(.*)/;

    //         if (themeSelectors.modalVariantMatchedUndefinedParent === "" && themeSelectors.modalVariantMatchedUndefinedParent === "") {
    //             productLinkElements.forEach(link => {
    //                 const href = link.getAttribute("href");
    //                 const match = pattern.exec(href);
    //                 if (matchedModalValue.length === 0) {
    //                     if (match !== null) {
    //                         if (match[1].includes('?')) {
    //                             matchedModalValue.push(match[1].split('?')[0]);
    //                         } else {
    //                             matchedModalValue.push(match[1])
    //                         }
    //                     }
    //                 }
    //             });
    //         }
    //         const productHandlePromises = matchedModalValue.map(async (matchedValue) => {
    //             const productHandleExists = Array.from(checkModalElements).some(element => element.getAttribute('product-handle') === matchedValue);
    //             if (!productHandleExists) {
    //                 const response = await fetch(`${getDomain}products/${matchedValue}.json`);
    //                 const productHandler = await response.json();
    //                 return { productHandler, matchedValue };
    //             }
    //             return null;
    //         });

    //         const productHandles = await Promise.all(productHandlePromises);
    //         const validProductHandles = productHandles.filter(handle => handle !== null);

    //         validProductHandles.forEach(async ({ productHandler, matchedValue }) => {
    //             const addButton = getProductEle.querySelector(themeSelectors.modalbuttonAppend);
    //             const buttonAppendAfterTitle = getProductEle.querySelector(themeSelectors.modalbuttonAppendOnTitle);
    //             const buttonAppendAfterImg = getProductEle.querySelector(themeSelectors.modalButtonAppendOnImg);
    //             let wishlistModalDivImg
    //             let wishlistModalTitle
    //             let wishlistModalCart
    //             const { id } = productHandler.product;

    //             let wishlistModalDivBtn = document.createElement('div');
    //             wishlistModalDivBtn.className = `wf-wishlist-collection-icon-modal`;
    //             wishlistModalDivBtn.setAttribute('product-id', id);
    //             wishlistModalDivBtn.setAttribute('product-handle', matchedValue);

    //             if (collectionBtnSetting.isQuickViewShowOptionImage) {
    //                 wishlistModalDivImg = document.createElement('div');
    //                 wishlistModalDivImg.className = `wf-wishlist-collection-icon-modal wf-img`;
    //                 wishlistModalDivImg.setAttribute('product-id', id);
    //                 wishlistModalDivImg.setAttribute('product-handle', matchedValue);
    //             }
    //             if (collectionBtnSetting.isQuickViewShowOptionTitle) {
    //                 wishlistModalTitle = document.createElement('div');
    //                 wishlistModalTitle.className = 'wf-wishlist-collection-icon-modal wf-title';
    //                 wishlistModalTitle.setAttribute('product-id', id);
    //                 wishlistModalTitle.setAttribute('product-handle', matchedValue);
    //             }
    //             if (collectionBtnSetting.isQuickViewShowOptionAddToCart) {
    //                 wishlistModalCart = document.createElement('div');
    //                 wishlistModalCart.className = 'wf-wishlist-collection-icon-modal wf-cart';
    //                 wishlistModalCart.setAttribute('product-id', id);
    //                 wishlistModalCart.setAttribute('product-handle', matchedValue);
    //             }
    //             if (currentCollectionSeting.quickViewShowAs === "button") {
    //                 // addButton.appendChild(wishlistModalDivImg);
    //                 const parentElement = addButton.parentNode;
    //                 if (currentCollectionSeting.quickViewShowOption === 'button-below') {

    //                     addButton.parentNode.insertBefore(wishlistModalDivBtn, addButton.nextSibling);
    //                 } else {
    //                     parentElement.insertBefore(wishlistModalDivBtn, addButton);
    //                 }
    //             } else if (currentCollectionSeting.quickViewShowAs === "icon") {
    //                 if (collectionBtnSetting.isQuickViewShowOptionImage) {
    //                     buttonAppendAfterImg.insertAdjacentElement('afterend', wishlistModalDivImg)
    //                 }
    //                 const parentElementIcon = buttonAppendAfterTitle.parentNode;
    //                 if (collectionBtnSetting.isQuickViewShowOptionTitle) {
    //                     if (currentCollectionSeting.quickViewShowOptionTitle) {
    //                         buttonAppendAfterTitle.style.display = "flex"
    //                         buttonAppendAfterTitle.style.gap = "10px"
    //                         buttonAppendAfterTitle.appendChild(wishlistModalTitle);
    //                     }
    //                     // addButton.parentNode.prepend(wishlistModalDiv);
    //                 } else if (settingCurrentFilter === "boost") {
    //                     if (!document.querySelector('.wf-wishlist-collection-icon-modal')) {
    //                         addButton.appendChild(wishlistModalTitle);
    //                     }
    //                 }
    //             }
    //             if (collectionBtnSetting.isQuickViewShowOptionAddToCart) {
    //                 wishlistModalCart.style.width = `${addButton.clientWidth}px`;
    //                 if (currentCollectionSeting.quickViewShowOptionAddToCart === 'icon-below') {
    //                     addButton.parentNode.insertBefore(wishlistModalCart, addButton.nextSibling);
    //                     addButton.parentNode.style.flexDirection = "column";

    //                 } else {
    //                     addButton.parentNode.insertBefore(wishlistModalCart, addButton);
    //                     addButton.parentNode.style.flexDirection = "column";
    //                 }
    //             }
    //             if (currentCollectionSeting.quickViewShowAs === "button") {
    //                 let addWishlistButton = ""
    //                 const wishlistData = await getDataFromSql();
    //                 // const wishlistData = allWishlistData;


    //                 const addToWishlistData = await renderButtonAddToWishlist();
    //                 const alreadyAddedToWishlistData = await renderButtonAddedToWishlist();

    //                 if (wishlistData.length > 0) {
    //                     const found = wishlistData.find(element => Number(element.product_id) === Number(id));
    //                     if (found) {
    //                         addWishlistButton += `<div onClick="collectionIconClickModal(event,${id},'${matchedValue}')" class="modalButtonCollection" >${alreadyAddedToWishlistData}</div>`

    //                     } else {
    //                         addWishlistButton += `<div onClick="collectionIconClickModal(event,${id},'${matchedValue}')" class="modalButtonCollection"  >${addToWishlistData}</div>`;
    //                     }
    //                 } else {
    //                     addWishlistButton += `<div onClick="collectionIconClickModal(event,${id},'${matchedValue}')" class="modalButtonCollection"  >${addToWishlistData}</div>`;
    //                 }
    //                 wishlistModalDivBtn.innerHTML = addWishlistButton;
    //             } else {
    //                 let addWishlistIcon = ""
    //                 let addWishlistIconTitle = ""
    //                 let addWishlistIconCart = ""
    //                 const wishlistData = await getDataFromSql();
    //                 // const wishlistData = allWishlistData;


    //                 const getSelectedIcon = await whichClassIsModalAdded();
    //                 let imgHeight = 10;
    //                 if (getSelectedIcon.checkClassExist === true) {
    //                     imgHeight = buttonAppendAfterImg.clientHeight - Number(getSelectedIcon.iconHeight) - 5
    //                 }
    //                 if (wishlistData.length > 0) {
    //                     const found = wishlistData.find(element => Number(element.product_id) === Number(id));
    //                     const position = currentCollectionSeting.quickViewShowOptionAddToCartPosition;
    //                     if (found) {
    //                         addWishlistIcon += `<div class="collection_icon_new_selected ${getSelectedIcon.iconPosition}" style="${getSelectedIcon.checkClassExist === true ? 'top:' + imgHeight + 'px;' : ''}"><div style="filter: ${currentCollectionSeting.iconSelectedColor}; ${collectionIconSize()}" onClick="collectionIconClickModal(event,${id},'${matchedValue}')" class="${getSelectedIcon.iconStyle}"><span class="span-hearticon"></span></div></div>`;

    //                         addWishlistIconTitle += `<div class="collection_icon_new ${currentCollectionSeting.quickViewShowOptionTitle === true ? "modal-icon" : ""} ${currentCollectionSeting.quickViewShowOptionTitle === true ? "modal-icon" : ""}"  ><div class="collection_icon_new_selected"><div style="filter: ${currentCollectionSeting.iconSelectedColor}; ${collectionIconSize()}" onClick="collectionIconClickModal(event,${id},'${matchedValue}')" class="${getSelectedIcon.iconStyle}"><span class="span-hearticon"></span></div></div> </div>`;

    //                         addWishlistIconCart += `<div class="collection_icon_new ${position === 'left-icon-position' ? "icon-cart-left" :
    //                             position === 'right-icon-position' ? "icon-cart-right" : position === "center-icon-position" && "icon-cart-center"}"><div class="collection_icon_new_selected"><div style="filter: ${currentCollectionSeting.iconSelectedColor}; ${collectionIconSize()}" onClick="collectionIconClickModal(event,${id},'${matchedValue}')" class="${getSelectedIcon.iconStyle}"><span class="span-hearticon"></span></div></div> </div>`;
    //                     } else {
    //                         addWishlistIcon += `<div class="collection_icon_new ${getSelectedIcon.iconPosition}" style="${getSelectedIcon.checkClassExist === true ? 'top:' + imgHeight + 'px;' : ''}"><div style="filter: ${currentCollectionSeting.iconDefaultColor}; ${collectionIconSize()}"  onClick="collectionIconClickModal(event,${id},'${matchedValue}')" class="${getSelectedIcon.iconStyle}"><span class="span-hearticon"></span></div></div>`;

    //                         addWishlistIconTitle += `<div class="collection_icon_new ${currentCollectionSeting.quickViewShowOptionTitle === true ? "modal-icon" : ""}"><div style="filter: ${currentCollectionSeting.iconDefaultColor}; ${collectionIconSize()}"  onClick="collectionIconClickModal(event,${id},'${matchedValue}')" class="${getSelectedIcon.iconStyle}"><span class="span-hearticon"></span></div></div>`;

    //                         addWishlistIconCart += `<div class="collection_icon_new  ${position === 'left-icon-position' ? "icon-cart-left" :
    //                             position === 'right-icon-position' ? "icon-cart-right" : position === "center-icon-position" && "icon-cart-center"}"><div style="filter: ${currentCollectionSeting.iconDefaultColor}; ${collectionIconSize()}"  onClick="collectionIconClickModal(event,${id},'${matchedValue}')" class="${getSelectedIcon.iconStyle}"><span class="span-hearticon"></span></div></div>`;
    //                     }
    //                 } else {
    //                     addWishlistIcon += `<div class="collection_icon_new ${getSelectedIcon.iconPosition}" style="${getSelectedIcon.checkClassExist === true ? 'top:' + imgHeight + 'px;' : ''}"><div style="filter: ${currentCollectionSeting.iconDefaultColor}; ${collectionIconSize()}" onClick="collectionIconClickModal(event,${id},'${matchedValue}')" class="${getSelectedIcon.iconStyle}"><span class="span-hearticon"></span></div></div>`;

    //                     addWishlistIconTitle += `<div class="collection_icon_new ${currentCollectionSeting.quickViewShowOptionTitle === true ? "modal-icon" : ""} ${currentCollectionSeting.quickViewShowOptionTitle === true ? "modal-icon" : ""}" ><div style="filter: ${currentCollectionSeting.iconDefaultColor}; ${collectionIconSize()}" onClick="collectionIconClickModal(event,${id},'${matchedValue}')" class="${getSelectedIcon.iconStyle}"><span class="span-hearticon"></span></div></div>`;

    //                     addWishlistIconCart += `<div class="collection_icon_new   ${position === 'left-icon-position' ? "icon-cart-left" :
    //                         position === 'right-icon-position' ? "icon-cart-right" : position === "center-icon-position" && "icon-cart-center"}"  ><div style="filter: ${currentCollectionSeting.iconDefaultColor}; ${collectionIconSize()}" onClick="collectionIconClickModal(event,${id},'${matchedValue}')" class="${getSelectedIcon.iconStyle}"><span class="span-hearticon"></span></div></div>`;
    //                 }
    //                 if (collectionBtnSetting.isQuickViewShowOptionImage) {
    //                     wishlistModalDivImg.innerHTML = addWishlistIcon
    //                 }
    //                 if (collectionBtnSetting.isQuickViewShowOptionTitle) {
    //                     wishlistModalTitle.innerHTML = addWishlistIconTitle
    //                 }
    //                 if (collectionBtnSetting.isQuickViewShowOptionAddToCart) {
    //                     wishlistModalCart.innerHTML = addWishlistIconCart
    //                 }
    //             }
    //         });
    //     }
    // }
}

function whichClassIsAdded() {
    let iconPosition = "";
    let iconStyle = "";
    let iconHeight = "";
    let iconStyle2 = "";
    let checkClassExist = false
    if (currentCollectionSeting.iconPosition === 'icon-top-left') {
        iconPosition = 'wg-icon-top-left';
    } else if (currentCollectionSeting.iconPosition === 'icon-bottom-left') {
        iconPosition = 'wg-icon-bottom-left';
        iconHeight = getCurrentThemeName?.themeName === "Distinctive" ? "70" : "30";
    } else if (currentCollectionSeting.iconPosition === 'icon-top-right') {
        iconPosition = 'wg-icon-top-right';
    } else if (currentCollectionSeting.iconPosition === 'icon-bottom-right') {
        iconPosition = 'wg-icon-bottom-right';
        iconHeight = getCurrentThemeName?.themeName === "Distinctive" ? "70" : "30";
    }
    if (currentButtonSetting.iconType === 'heart') {
        if (currentCollectionSeting.collectionIconType === 'heartBlank') {
            iconStyle = 'wg-heart-icon-blank';
        } else if (currentCollectionSeting.collectionIconType === 'heartSolid') {
            iconStyle = 'wg-heart-icon-solid';
        }
        else if (currentCollectionSeting.collectionIconType === 'heartOutlineSolid') {
            iconStyle = 'wg-heart-icon-outline-solid';
        }
        else if (currentCollectionSeting.collectionIconType === 'heartOutlineBlank') {
            iconStyle = 'wg-heart-icon-outline-blank';
        } else if (currentCollectionSeting.collectionIconType === 'comboHeart') {
            iconStyle = 'wg-heart-icon-blank';
            iconStyle2 = 'wg-heart-icon-solid'
        }
    } else if (currentButtonSetting.iconType === 'star') {
        if (currentCollectionSeting.collectionIconType === 'starBlank') {
            iconStyle = 'wg-star-icon-blank';
        } else if (currentCollectionSeting.collectionIconType === 'starSolid') {
            iconStyle = 'wg-star-icon-solid';
        }
        else if (currentCollectionSeting.collectionIconType === 'starOutlineSolid') {
            iconStyle = 'wg-star-icon-outline-solid';
        }
        else if (currentCollectionSeting.collectionIconType === 'starOutlineBlank') {
            iconStyle = 'wg-star-icon-outline-blank';
        } else if (currentCollectionSeting.collectionIconType === 'comboStar') {
            iconStyle = 'wg-star-icon-blank';
            iconStyle2 = 'wg-star-icon-solid'
        }
    } else if (currentButtonSetting.iconType === 'save') {
        if (currentCollectionSeting.collectionIconType === 'saveBlank') {
            iconStyle = 'wg-save-icon-blank';
        } else if (currentCollectionSeting.collectionIconType === 'saveSolid') {
            iconStyle = 'wg-save-icon-solid';
        }
        else if (currentCollectionSeting.collectionIconType === 'saveOutlineSolid') {
            iconStyle = 'wg-save-icon-outline-solid';
        }
        else if (currentCollectionSeting.collectionIconType === 'saveOutlineBlank') {
            iconStyle = 'wg-save-icon-outline-blank';
        } else if (currentCollectionSeting.collectionIconType === 'comboSave') {
            iconStyle = 'wg-save-icon-blank';
            iconStyle2 = 'wg-save-icon-solid'
        }
    }
    if (iconPosition === "wg-icon-bottom-left" || iconPosition === 'wg-icon-bottom-right') {
        checkClassExist = true
    }
    return { iconPosition: iconPosition, iconStyle: iconStyle, iconHeight: iconHeight, checkClassExist: checkClassExist, iconStyle2 };
};

function whichClassIsModalAdded() {
    let iconPosition = "";
    let iconStyle = "";
    let iconHeight = "";
    let checkClassExist = false
    if (currentCollectionSeting.quickViewShowOptionImage === 'icon-top-left') {
        iconPosition = 'wg-icon-top-left';
    } else if (currentCollectionSeting.quickViewShowOptionImage === 'icon-bottom-left') {
        iconPosition = 'wg-icon-bottom-left';
        iconHeight = "30";
    } else if (currentCollectionSeting.quickViewShowOptionImage === 'icon-top-right') {
        iconPosition = 'wg-icon-top-right';
    } else if (currentCollectionSeting.quickViewShowOptionImage === 'icon-bottom-right') {
        iconPosition = 'wg-icon-bottom-right';
        iconHeight = "30";
    }
    if (currentButtonSetting.iconType === 'heart') {
        if (currentCollectionSeting.collectionIconType === 'heartBlank') {
            iconStyle = 'wg-heart-icon-blank';
        } else if (currentCollectionSeting.collectionIconType === 'heartSolid') {
            iconStyle = 'wg-heart-icon-solid';
        }
        else if (currentCollectionSeting.collectionIconType === 'heartOutlineSolid') {
            iconStyle = 'wg-heart-icon-outline-solid';
        }
        else if (currentCollectionSeting.collectionIconType === 'heartOutlineBlank') {
            iconStyle = 'wg-heart-icon-outline-blank';
        }
    } else if (currentButtonSetting.iconType === 'star') {
        if (currentCollectionSeting.collectionIconType === 'starBlank') {
            iconStyle = 'wg-star-icon-blank';
        } else if (currentCollectionSeting.collectionIconType === 'starSolid') {
            iconStyle = 'wg-star-icon-solid';
        }
        else if (currentCollectionSeting.collectionIconType === 'starOutlineSolid') {
            iconStyle = 'wg-star-icon-outline-solid';
        }
        else if (currentCollectionSeting.collectionIconType === 'starOutlineBlank') {
            iconStyle = 'wg-star-icon-outline-blank';
        }
    } else if (currentButtonSetting.iconType === 'save') {
        if (currentCollectionSeting.collectionIconType === 'saveBlank') {
            iconStyle = 'wg-save-icon-blank';
        } else if (currentCollectionSeting.collectionIconType === 'saveSolid') {
            iconStyle = 'wg-save-icon-solid';
        }
        else if (currentCollectionSeting.collectionIconType === 'saveOutlineSolid') {
            iconStyle = 'wg-save-icon-outline-solid';
        }
        else if (currentCollectionSeting.collectionIconType === 'saveOutlineBlank') {
            iconStyle = 'wg-save-icon-outline-blank';
        }
    }
    if (iconPosition === "wg-icon-bottom-left" || iconPosition === 'wg-icon-bottom-right') {
        checkClassExist = true
    }
    return { iconPosition: iconPosition, iconStyle: iconStyle, iconHeight: iconHeight, checkClassExist: checkClassExist };
};

function imgFxn(product) {
    const images = product.querySelectorAll('img');
    for (let img of images) {
        const closestDiv = img.closest('div');
        if (closestDiv && !closestDiv.classList.contains('hidden')) {
            // console.log("closestDiv", closestDiv);
            return closestDiv;
        }
    }
    return null;
}
