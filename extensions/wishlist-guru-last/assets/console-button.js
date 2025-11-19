const wishlistDiv = document.getElementById("wishlist-guru");
wishlistDiv.addEventListener("click", wishlistHandle);
document.addEventListener("DOMContentLoaded", autoUpdateOfPage);

let productIsCountValid = false;
let isMultiwishlistTruePro = false;

async function autoUpdateOfPage() {
    // let currentPlanOnly;
    // try {
    //     const response = await fetch(`${serverURL}/get-current-plan-sql`, {
    //         method: "POST",
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //             shopName: permanentDomain
    //         })
    //     });
    //     let result = await response.json();
    //     if (result.data.length > 0) {
    //         currentPlanOnly = result.data[0].active_plan_id;
    //     }

    // buttonStyleFxn();
    if (!shouldAutoUpdateRender) return

    await showCountAll();
    // productIsCountValid = customButton.showCount === "yes" && currentPlan >= 2;

    if (customButton.showCount === "yes") {
        customButton.showCount = "increaseNdecrease";
    }
    productIsCountValid = customButton.showCount === "increaseNdisable" || customButton.showCount === "increaseNdecrease";
    const isMultiwishlistTrueProValue = heartButton.hasAttribute('isMultiwishlistTrue') ? heartButton.getAttribute('isMultiwishlistTrue') : "no";
    isMultiwishlistTruePro = isMultiwishlistTrueProValue === "yes"

    let productPageData = wishlistDiv.getAttribute("data-product-id");
    let getVariantId = wishlistDiv.getAttribute("variant-id");
    let getList = allWishlistData;

    if (getList.length !== 0) {
        const isTrue = isMultiwishlistTruePro
            ? await isIdExist(getList, parseInt(productPageData), parseInt(getVariantId))
            : await isIdExistInKey(getList, "favourites", parseInt(productPageData), parseInt(getVariantId));
        if (isTrue) {
            alreadyInWishlist();
        } else {
            addToWishList();
        }
    } else {
        addToWishList();
    }
    // } catch (error) {
    //     console.log("error")
    // }

    collectionIconSize();
}

function startAutoUpdate() {
    intervalId = setInterval(async () => {
        if (shouldAutoUpdateRender) {
            await autoUpdateOfPage();
            clearInterval(intervalId);
            // console.log("Auto-update completed and stopped.");
        }
    }, 1000);
}
startAutoUpdate();

async function wishlistHandle() {
    // console.log("IM the block button buttton")
    let productId = wishlistDiv.getAttribute("data-product-id");
    let productTitle = wishlistDiv.getAttribute("data-product-title");
    let productHandle = wishlistDiv.getAttribute("data-product-handle");
    let getProductVariant = wishlistDiv.getAttribute("variant-id");

    const res = await showLoginPopup(productId);
    if (res) return;

    const { productPrice, varriantId, variant_img, buttonJsonData } = await getProductData(productHandle);

    const quantityInput = document.querySelector('input[name="quantity"]');
    const quantityValue = quantityInput?.value;

    let variantArr = buttonJsonData.variants;
    let saveVariantId = buttonJsonData.variants[0].id;
    let saveImage = buttonJsonData.images[0];
    if (isVariantWishlistTrue === true) {
        saveVariantId = getProductVariant || buttonJsonData?.variants[0].id;
        const resultFind = variantArr.find(data => data.id === parseInt(getProductVariant));
        saveImage = resultFind?.featured_image?.src || buttonJsonData.images[0]
    } else {
        saveVariantId = varriantId != "" ? varriantId : buttonJsonData.variants[0].id;
        saveImage = buttonJsonData.images[0];
    }

    let getProductOption = wgGetProductOptions();
    // console.log("wgGetProductOptions --- ", getProductOption);

    let data = {
        productId: productId,
        // variantId: varriantId != "" ? varriantId : buttonJsonData.variants[0].id,
        variantId: saveVariantId,
        price: productPrice,
        handle: productHandle,
        title: productTitle,
        // image: variant_img,
        image: saveImage,
        quantity: quantityValue || 1,
        language: wfGetDomain,
        productOption: JSON.stringify(getProductOption)
    };

    const matchFound = await checkFound(allWishlistData, productId, getProductVariant);
    if (isMultiwishlistTruePro) {
        renderPopupLoader();
        if (allWishlistData.length > 0 && matchFound) {
            data.isDelete = "yes";
            openMultiWishlist(data, productId, "block", getProductVariant);
        } else {
            openMultiWishlist(data, productId, "block", getProductVariant);
        }
    } else {
        data.wishlistName = matchFound ? ["wfNotMulti"] : ["favourites"];
        await checkCounterData(productId, !matchFound ? "add" : "remove")
        matchFound ? addToWishList() : alreadyInWishlist()
        saveMainData(data, productId, "block");
    }
}

// async function addToWishList() {
//     let productId = wishlistDiv.getAttribute("data-product-id");
//     const countData = productIsCountValid ? await isCountOrNot(productId, productIsCountValid) : "";
//     const renderButtonData = await renderButtonAddToWishlist(productId, productIsCountValid);
//     const addToWishlist = onlyTextButton ? renderButtonData : `${renderButtonData} ${countData}`;
//     document.getElementById("wishlist-guru").innerHTML = addToWishlist;
//     if (productIsCountValid) renderBorder("removed", productIsCountValid);
// }

// async function alreadyInWishlist() {
//     let productId = wishlistDiv.getAttribute("data-product-id");
//     const countData = productIsCountValid ? await isCountOrNot(productId, productIsCountValid) : "";
//     const renderButtonData = await renderButtonAddedToWishlist(productId, productIsCountValid);
//     const addToWishlist = onlyTextButton ? renderButtonData : `${renderButtonData} ${countData}`;
//     document.getElementById("wishlist-guru").innerHTML = addToWishlist;
//     if (productIsCountValid) renderBorder("added", productIsCountValid);
// }

async function addToWishList() {
    let productId = wishlistDiv.getAttribute("data-product-id");
    const renderButtonData = await renderButtonAddToWishlist(productId, productIsCountValid);
    document.getElementById("wishlist-guru").innerHTML = renderButtonData;
    if (productIsCountValid) renderBorder("removed", productIsCountValid);
    collectionIconSize();
}

async function alreadyInWishlist() {
    let productId = wishlistDiv.getAttribute("data-product-id");
    const renderButtonData = await renderButtonAddedToWishlist(productId, productIsCountValid);
    document.getElementById("wishlist-guru").innerHTML = renderButtonData;
    if (productIsCountValid) renderBorder("added", productIsCountValid);
    collectionIconSize();
}

document.addEventListener("DOMContentLoaded", function () {
    var featuredProduct = document.getElementById("featured-product");
    if (featuredProduct) {
        var title = featuredProduct.getAttribute("data-title");
        var price = featuredProduct.getAttribute("data-price");
        // Now you can use 'title' and 'price' in your JavaScript code
        // console.log("Featured Product Title: " + title);
        // console.log("Featured Product Price: " + price);
    }
});