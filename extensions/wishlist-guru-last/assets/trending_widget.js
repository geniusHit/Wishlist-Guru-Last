// function startAutoUpdate1() {
//     intervalIdOfTrending = setInterval(async () => {
//         if (shouldAutoUpdateRender) {
//             (currentPlan >= 3 && generalSetting?.trendingLayout) && await renderTrendingGridData();
//             clearInterval(intervalIdOfTrending);
//         }
//     }, 1000);
// }


function startAutoUpdate1() {
    intervalIdOfTrending = setInterval(async () => {
        if (typeof shouldAutoUpdateRender !== 'undefined' && shouldAutoUpdateRender) {
            if (currentPlan >= 3 && generalSetting?.trendingLayout) {
                await renderTrendingGridData();
            }
            clearInterval(intervalIdOfTrending);
        }
    }, 1000);
}
startAutoUpdate1();




// function startAutoUpdate1() {
//     intervalIdOfTrending = setInterval(async () => {
//         if (window.shouldAutoUpdateRender) {   // safe check
//             if (currentPlan >= 3 && generalSetting?.trendingLayout) {
//                 await renderTrendingGridData();
//             }
//             clearInterval(intervalIdOfTrending);
//         }
//     }, 1000);
// }
// startAutoUpdate1();





function mergeAndRandomize(topData, recentData) {
    const uniqueMap = new Map();
    topData.forEach(item => uniqueMap.set(item.variant_id, item));
    recentData.forEach(item => uniqueMap.set(item.variant_id, item));
    const mergedArray = Array.from(uniqueMap.values());

    for (let i = mergedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [mergedArray[i], mergedArray[randomIndex]] = [mergedArray[randomIndex], mergedArray[i]];
    }
    return mergedArray;
}

async function getTrendingProducts() {
    try {
        const response = await fetch(`${serverURL}/admin-top-data-recent-data`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                shopName: permanentDomain
            })
        });
        let result = await response.json();
        return result
    } catch (error) {
        console.log("error", error)
    }
}

function getProducsPerRow() {
    const isDesktop = window.matchMedia('(min-width: 989px)').matches;

    if (isDesktop) {
        return generalSetting.desktopProducts
    } else {
        return generalSetting.mobileProducts
    }
}

if (typeof isCollectionIcon === 'undefined') {
    isCollectionIcon = null;
}

const renderTrendingGridData = async () => {
    try {
        const trendingSection = document.getElementById('wishlist-guru-trending-widget');
        const customTrendingSection = document.getElementById('wf-custom-trending-widget');
        const allData = await getTrendingProducts();
        const gridNumber = getProducsPerRow();
        const dataToMap = generalSetting.whichProducts === "top products"
            ? allData.topData
            : generalSetting.whichProducts === "recently products"
                ? allData.recentData
                : mergeAndRandomize(allData.topData, allData.recentData);

        const trendingData = await Promise.all(
            dataToMap.map(async (item) => {
                try {
                    // const response = await fetch(`${wfGetDomain}variants/${item.variant_id}.js`);
                    const response = await fetch(`${wfGetDomain}products/${item.handle}.js`);

                    if (!response.ok) {
                        return null;
                    }

                    // if (response.status !== 404) {

                    if (response.status === 200) {
                        const jsonData = await response.json();
                        const itemData = jsonData?.variants.find(v => Number(v.id) === Number(item.variant_id));
                        const compareAtPrice = itemData?.compare_at_price;
                        const price = itemData?.price;
                        const actualPrice = compareAtPrice ? changeMoney(compareAtPrice) : null;
                        const salePrice = changeMoney(price);

                        const currentNewPrice =
                            compareAtPrice && compareAtPrice > price
                                ? `<span class="wf-sale-price">${actualPrice}</span>
                               <span class="wf-discount-price">${salePrice}</span>`
                                : `<span>${salePrice}</span>`;

                        return `
                        <div class="wg-product-item">
                            <div class="modal-product-image">
                                ${(isCollectionIcon && currentPlan > 1 && collectionBtnSetting.collectionType === "iconType") ? `<div class="wf-wishlist" product-id="${item.product_id}" product-handle="${item.handle}"></div>` : ''}
                                <a href="${wfGetDomain}products/${item.handle}?variant=${item.variant_id}">
                                    <img src="${item.image}" alt="${item.title}" height="auto" width="100%" />
                                </a>
                            </div>
                            ${(isCollectionIcon && currentPlan > 1 && collectionBtnSetting.collectionType === "buttonType") ? `<div class="wf-wishlist-button" product-id="${item.product_id}" product-handle="${item.handle}"></div>` : ''}

                            <h5 class="wg-product-title" style="margin-bottom: 0px;">${item.title}</h5>
                            <p class="wg-product-price">${currentNewPrice}</p>
                        </div>`;

                    }
                } catch (error) {
                    console.error(`Error processing item with variant ID ${item.variant_id}:`, error);
                    return null;
                }
            })
        );

        const filteredTrendingData = trendingData.filter(data => data !== null);

        const trendingDataBox = generalSetting.trendingLayout === "grid"
            ? `<div class="wg-trending-widget-content wg-trending-grid-${gridNumber}">
                <h2>${customLanguage.trendingSectionHeading || storeFrontDefLang.trendingSectionHeading}</h2>
                ${filteredTrendingData.join("")}
            </div>`
            : `
            <div class="wg-trending-widget-content wg-trending-carousel">
                <h2>${customLanguage.trendingSectionHeading || storeFrontDefLang.trendingSectionHeading}</h2>
                <div class="wg-carousel-wrapper">
                    <div class="wg-carousel-track">
                        ${filteredTrendingData.map(data => `<div class="wg-carousel-item">${data}</div>`).join("")}
                    </div>
                    ${(generalSetting.navigationArrows && gridNumber < dataToMap.length) ? `
                    <button class="wg-carousel-arrow prev">&lt;</button>
                    <button class="wg-carousel-arrow next">&gt;</button>` : ""}
                </div>
            </div>`;

        if (trendingSection) {
            trendingSection.innerHTML = trendingDataBox;
            generalSetting.trendingLayout !== "grid" && initializeCarousel(trendingSection, gridNumber);
        }

        if (customTrendingSection) {
            customTrendingSection.innerHTML = trendingDataBox;
            generalSetting.trendingLayout !== "grid" && initializeCarousel(customTrendingSection, gridNumber);
            wishlistIcon();
        }
    } catch (error) {
        console.error("Error rendering trending grid data:", error);
    }
};

const initializeCarousel = (carouselContainer, visibleItems) => {
    const track = carouselContainer.querySelector(".wg-carousel-track");
    let items = Array.from(carouselContainer.querySelectorAll(".wg-carousel-item"));
    const prevButton = carouselContainer.querySelector(".wg-carousel-arrow.prev");
    const nextButton = carouselContainer.querySelector(".wg-carousel-arrow.next");
    const originalItemsCount = items.length;
    let dotsContainer;

    if (originalItemsCount <= visibleItems) {
        items.forEach(div => div.style.flex = 0)
    }

    if (generalSetting.navigationDots && originalItemsCount > visibleItems) {
        dotsContainer = document.createElement("div");
        dotsContainer.className = "wg-carousel-dots";
        carouselContainer.appendChild(dotsContainer);

        for (let i = 0; i < originalItemsCount; i++) {
            const dot = document.createElement("button");
            dot.className = "wg-carousel-dot";
            dot.dataset.index = i;
            dotsContainer.appendChild(dot);

            dot.addEventListener("click", () => {
                moveToSlide(i + visibleItems);
            });
        }
    }

    const createClones = () => {
        const startClones = items.slice(-visibleItems).map((item) => item.cloneNode(true));
        const endClones = items.slice(0, visibleItems).map((item) => item.cloneNode(true));

        startClones.forEach((clone) => track.insertBefore(clone, track.firstChild));
        endClones.forEach((clone) => track.appendChild(clone));
    };


    if (originalItemsCount > visibleItems) {
        createClones();
    }

    items = Array.from(track?.children);

    const itemWidth = () => track.offsetWidth / visibleItems;

    const updateItemWidth = () => {
        Array.from(track?.children).forEach((item) => {
            item.style.flexBasis = `${100 / visibleItems}%`;
        });
    };

    let currentIndexWf = visibleItems;
    const setInitialPosition = () => {
        track.style.transition = "none";
        track.style.transform = visibleItems >= originalItemsCount ? `translateX(0)` : `translateX(-${itemWidth() * visibleItems}px)`;
    };

    setInitialPosition();

    const moveToSlide = (index) => {
        currentIndexWf = index;
        track.style.transition = "transform 0.5s ease-in-out";
        track.style.transform = `translateX(-${itemWidth() * currentIndexWf}px)`;

        setTimeout(() => {
            if (currentIndexWf >= items.length - visibleItems) {
                track.style.transition = "none";
                track.style.transform = `translateX(-${itemWidth() * currentIndexWf}px)`;
                currentIndexWf = visibleItems;
            } else if (currentIndexWf < visibleItems) {
                track.style.transform = `translateX(-${itemWidth() * currentIndexWf}px)`;
                const dummyIndex = Math.abs(originalItemsCount - visibleItems * 2);
                currentIndexWf = dummyIndex + originalItemsCount;
                track.style.transition = "none";
            }
        }, 500);

        if (generalSetting.navigationDots && originalItemsCount > visibleItems) updateDots();
        updateActiveItem();
    };

    const updateDots = () => {
        dotsContainer.querySelectorAll(".wg-carousel-dot").forEach((dot, index) => {
            dot.classList.toggle("active", index === (currentIndexWf - visibleItems) % originalItemsCount);
        });
    };

    const updateActiveItem = () => {
        Array.from(track.children).forEach((item, index) => {
            item.classList.toggle("active", index === currentIndexWf);
        });
    };

    nextButton?.addEventListener("click", () => {
        moveToSlide(currentIndexWf + 1);
    });

    prevButton?.addEventListener("click", () => {
        moveToSlide(currentIndexWf - 1);
    });

    const startAutoRotation = () => {
        setInterval(() => {
            moveToSlide(currentIndexWf + 1);
        }, 3000);
    };

    if (originalItemsCount > visibleItems && generalSetting.autoRotaionOrNot) {
        startAutoRotation();
    }

    updateItemWidth();
    if (generalSetting.navigationDots && originalItemsCount > visibleItems) updateDots();
    updateActiveItem();
};
