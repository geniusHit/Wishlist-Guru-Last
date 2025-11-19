async function getCurrentProducts() {
    try {
        const userData = await fetch(`${serverURL1}/current/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                shopDomain: currentShopDomain
            }),
        })
        let result = await userData.json();
        return result.products
    } catch (error) {
        console.log("errr ", error)
    }
};

async function fetchData() {
    allProducts = await getCurrentProducts();
    // console.log(allProducts);
};

fetchData();