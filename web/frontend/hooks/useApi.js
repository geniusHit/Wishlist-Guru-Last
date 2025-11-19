import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { Constants } from '../../backend/constants/constant';

const useApi = () => {

    const { extAppName, extName, appName } = Constants;
    // const fetch = useAuthenticatedFetch();

    const shop = async () => {
        try {
            const response = await fetch(`/api/getshop`);
            const result = await response.json();
            // console.log("DATATA -- ", result)

            let domain = result.countData[0].domain;
            let position = domain.search(".myshopify.com");
            const storeName = result.countData[0].name;
            // const shopName = result.countData[0].domain;
            const shopName = result.countData[0].myshopify_domain;
            const email = result.countData[0].email;
            const phoneNumber = result.countData[0].phone;
            const country = result.countData[0].country_name;
            const shopOwner = result.countData[0].shop_owner;
            const shopCurrency = result.countData[0].money_format;
            const customerEmail = result.countData[0].customer_email;
            const shopifyPlan = result.countData[0].plan_name;

            return {
                shopName: shopName,
                domain: domain,
                email: email,
                supportEmail: "support@webframez.com",
                shopCurrency: shopCurrency,
                customerPhone: phoneNumber,
                shopOwner: shopOwner,
                country: country,
                storeName: storeName,
                customerEmail: customerEmail,
                shopifyPlan: shopifyPlan
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }


    const metafield = async () => {
        try {
            const response = await fetch("/api/app-metafield/get-id");
            const result = await response.json();
            const id = result.data.currentAppInstallation.id
            return id
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const themeApi = async (themeId = 0) => {
        try {
            const response = await fetch(`/api/app-theme?themeId=${themeId}`);
            const result = await response.json();
            const settingFileData = JSON.parse(result.settingFile[0].value)?.current?.blocks;


            const isDisabled = (data, type) => {
                if (!data) return true;
                const matchingObject = Object.values(data).find(obj => obj.type.includes(type));
                return matchingObject ? matchingObject.disabled : true;
            };

            const targetType = `shopify://apps/${extAppName}/blocks/heart_button`;
            const targetIconType = `shopify://apps/${extAppName}/blocks/collection-heart`;

            const isHeartButtonDisabled = isDisabled(settingFileData, targetType);
            const isCollectionButtonDisabled = isDisabled(settingFileData, targetIconType);

            return {
                heartButton: isHeartButtonDisabled,
                collectionButton: isCollectionButtonDisabled,
                themeID: result.themeId
            };
        } catch (error) {
            console.error("Error:", error);
        }
    };

    // ---------------it is for index.js page app block functionality---------------

    // const wishlistBtnApi = async (themeId = 0) => {
    //     try {
    //         const response = await fetch(`/api/wish-app-theme?themeId=${themeId}`);
    //         let isWishlistButtonEnabledFlag = false
    //         const result = await response.json();

    //         if (response.status === 500) {
    //             isWishlistButtonEnabledFlag = false
    //         } else {
    //             const productAssetData = JSON.parse(result.productAssetData[0]?.value)?.sections?.main?.blocks;
    //             const isWishlistButtonEnabled = (data, type) => {
    //                 if (!data) return false;
    //                 const matchingObject = Object.values(data).find(obj => obj.type.includes(type));
    //                 if (matchingObject) {
    //                     if (matchingObject.disabled) {
    //                         return false
    //                     } else {
    //                         return true
    //                     }
    //                 } else {
    //                     return false
    //                 }
    //             };

    //             const targetType2 = `shopify://apps/${extAppName}/blocks/app-block`;
    //             isWishlistButtonEnabledFlag = isWishlistButtonEnabled(productAssetData, targetType2);
    //         }

    //         return {
    //             wishlistButtonObject: isWishlistButtonEnabledFlag,
    //         };
    //     } catch (error) {
    //         console.error("Error:", error);
    //     }
    // };


    const changeMoney = (cents, format) => {
        if (typeof cents === 'string') { cents = parseFloat(cents.replace(',', '')); }
        var value = '';
        var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
        var formatString = format;
        function defaultOption(opt, def) {
            return (typeof opt === 'undefined' ? def : opt);
        }
        function formatWithDelimiters(number, precision, thousands, decimal) {
            precision = defaultOption(precision, 2);
            thousands = defaultOption(thousands, ',');
            decimal = defaultOption(decimal, '.');
            if (isNaN(number) || number === null) { return '0'; }
            number = (number / 100.0).toFixed(precision);
            var parts = number.split('.'),
                dollars = parts[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + thousands),
                cents = parts[1] ? (decimal + parts[1]) : '';
            return dollars + cents;
        }
        let match = formatString.match(placeholderRegex);
        if (match) {
            switch (match[1]) {
                case 'amount':
                    value = formatWithDelimiters(cents, 2);
                    break;
                case 'amount_no_decimals':
                    value = formatWithDelimiters(cents, 0);
                    break;
                case 'amount_with_comma_separator':
                    value = formatWithDelimiters(cents, 2, '.', ',');
                    break;
                case 'amount_no_decimals_with_comma_separator':
                    value = formatWithDelimiters(cents, 0, '.', ',');
                    break;
            }
        }
        return formatString.replace(placeholderRegex, value);
    };

    return {
        shop: shop,
        metafield: metafield,
        themeApi: themeApi,
        changeMoney: changeMoney,
        // wishlistBtnApi: wishlistBtnApi
    }
}

export default useApi;