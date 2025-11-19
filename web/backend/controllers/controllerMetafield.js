import shopify from "../../shopify.js";
import createAppDataMetafields, { getAllAppDataMetafields, getOneAppDataMetafield, deleteAppDataMetafield } from "../utils/appDataMetafields.js";
import defaultMetafieldSetup from "../utils/defaultMetafieldSetup.js";
import { installationEmailHTML } from "../utils/sendEmail.js";
import { sendEmail } from "../utils/sendEmail.js";
import { addEmailToBrevo } from "../brevo/brevoFxn.js";
import logger from "../../loggerFile.js";
import database from "../connection/database.js";
import { Constants } from "../constants/constant.js";

const { supportEmail } = Constants;

export const saveDefaultDataForWishlistApp = async (req, res) => {
    // console.log("req------- ", req)
    const newData = await setDefaultDataForApp(req, res);
    res.status(200).send({ data: newData });
};

const setDefaultDataForApp = async (req, res) => {
    console.log("---------------- IM RUNNING NOW ----------------");
    let resultOfDMF;

    const client = await new shopify.api.clients.Graphql({
        session: res.locals.shopify.session,
    });
    const data = await client.request(
        `query {
      currentAppInstallation {
        id
      }
    }`,
    );

    let ourQuery22 = await getAllAppDataMetafields(15);
    const getPreviousData = await client.request(ourQuery22);

    // ------------------here we are checking.. if there is previous metafields are not------------------
    if (
        getPreviousData.data.app.installation.metafields.edges.length === 0
    ) {

        const dataArr = defaultMetafieldSetup(
            data.data.currentAppInstallation.id
        );
        for (let i = 0; i < dataArr.length; i++) {
            let ourQuery = await createAppDataMetafields(dataArr[i]);
            const data2 = await client.request(ourQuery.query, ourQuery?.variables);
            resultOfDMF = data2
        }
        sendInstallationMail(req, res);
    }
    // next();
    return resultOfDMF
};

const sendInstallationMail = async (req, res) => {
    const shopData = await shopify.api.rest.Shop.all({
        session: res.locals.shopify.session,
    });

    const shop_email = shopData.data[0].email;
    const shop_customer_email = shopData.data[0].customer_email;
    const shop_owner = shopData.data[0].shop_owner;

    let brevoData = {
        phone: shopData.data[0].phone,
        country: shopData.data[0].country_name,
        shopifyPlan: shopData.data[0].plan_name,
        date: new Date(),
    }

    let mailHtml = installationEmailHTML(shop_owner);
    let emailContent = {
        from: supportEmail,
        to: shop_email,
        cc: shop_customer_email,
        subject: "Thanks for installing Wishlist Guru App",
        html: mailHtml,
    };
    sendEmail(emailContent);

    const shop_domain = shopData.data[0].myshopify_domain;
    const customer_email = shopData.data[0].customer_email;

    if (shop_email === customer_email) {
        await addEmailToBrevo(shop_owner, shop_email, shop_domain, brevoData);
    } else {
        await addEmailToBrevo(shop_owner, shop_email, shop_domain, brevoData);
        await addEmailToBrevo(shop_owner, customer_email, shop_domain, brevoData);
    }

};

export const reRegisterWebhook = async (req, res) => {
    const getPlan = Number(req?.query?.plan);
    const getAllWebhook = await shopify.api.rest.Webhook.all({
        session: res.locals.shopify.session,
    });
    let allWebhook = getAllWebhook.data;

    // console.log("getPlan --- ", getPlan)
    // console.log("allWebhook ---------- ", allWebhook)

    // ---------recreating the uninstalled webhook---------
    const hasUninstallationWebhook = getAllWebhook.data.some(webhook => webhook.topic === "app/uninstalled");
    if (!hasUninstallationWebhook) {
        const newWebhook = new shopify.api.rest.Webhook({ session: res.locals.shopify.session });
        newWebhook.address = `${process.env.APP_URL}/api/webhooks`;
        newWebhook.topic = "app/uninstalled";
        newWebhook.format = "json";
        await newWebhook.save({ update: true });
        console.log("Uninstall webhook regenerated ---- $$ ---- ");
    }

    // ---------recreating the domain-update webhook---------
    const hasDomainUpdateWebhook = getAllWebhook.data.some(webhook => webhook.topic === "domains/update");
    if (!hasDomainUpdateWebhook) {
        const newWebhook = new shopify.api.rest.Webhook({ session: res.locals.shopify.session });
        newWebhook.address = `${process.env.APP_URL}/api/webhooks`;
        newWebhook.topic = "domains/update";
        newWebhook.format = "json";
        await newWebhook.save({ update: true });
        console.log("domainUpdate webhook regenerated ---- $$ ---- ");
    }

    // ---------recreating the shop-update webhook---------
    const hasShopUpdateWebhook = getAllWebhook.data.some(webhook => webhook.topic === "shop/update");
    if (!hasShopUpdateWebhook) {
        const newWebhook = new shopify.api.rest.Webhook({ session: res.locals.shopify.session });
        newWebhook.address = `${process.env.APP_URL}/api/webhooks`;
        newWebhook.topic = "shop/update";
        newWebhook.format = "json";
        await newWebhook.save({ update: true });
        console.log("shopUpdate webhook regenerated ---- $$ ---- ");
    }

    if (getPlan <= 2) {
        // ---------------- deleting webhooks here because plan is less than 3 ----------------
        if (allWebhook.length > 1) {
            for (const data of allWebhook) {
                if (data?.topic !== "app/uninstalled" && data?.topic !== "domains/update" && data?.topic !== "shop/update") {
                    await shopify.api.rest.Webhook.delete({
                        session: res.locals.shopify.session,
                        id: data.id,
                    });
                }
            }
            res.status(200).send({ webhookData: "all webhooks are deleted except uninstallation and domainUpdate and shopUpdate because plan is less than 3", webhooks: allWebhook });
        } else {
            res.status(200).send({ webhookData: "there is only one webhook", webhooks: allWebhook });
        }

    } else if (getPlan >= 3) {
        // console.log("DDDDDDDDDDDD ----- ", allWebhook.length)
        // ---------recreating the uninstalled webhook---------
        // const hasInventoryLevelUpdateWebhook = getAllWebhook.data.some(webhook => webhook.topic === "inventory_levels/update");
        // if (!hasInventoryLevelUpdateWebhook) {
        //     const newWebhook = new shopify.api.rest.Webhook({ session: res.locals.shopify.session });
        //     newWebhook.address = `${process.env.APP_URL}/api/webhooks`;
        //     newWebhook.topic = "inventory_levels/update";
        //     newWebhook.format = "json";
        //     await newWebhook.save({ update: true });
        //     console.log("inventory levels/update webhook regenerated ---- $$ ---- ");
        // }

        if (allWebhook.length === 0) {
            // console.log("JJJJJJJJJJ -------------")
            creatingWebhooks(res);
            res.status(200).send({ webhookData: "all webhooks are re created because plan is greater than 2" });
        } else if (allWebhook.length < 4) {
            // console.log("JJJJJJJJJJ -------------")
            creatingWebhooks(res, "dont-create");
            res.status(200).send({ webhookData: "all webhooks are re created except uninstall webhook because plan is greater than 2" });
        } else {

            // console.log("allWebhook -- ", allWebhook)
            // console.log("wwww ", `${process.env.APP_URL}/api/webhooks`)
            // console.log("xxxx ", allWebhook[0]?.address)

            // if (`${process.env.APP_URL}/api/webhooks` !== allWebhook[0]?.address) {

            if (allWebhook.some(webhook => webhook.address !== `${process.env.APP_URL}/api/webhooks`)) {
                // --------url mismatched and we are deleating the webhooks--------
                for (const data of allWebhook) {
                    await shopify.api.rest.Webhook.delete({
                        session: res.locals.shopify.session,
                        id: data.id,
                    });
                }
                // --------- here we are creating webhook again ---------
                creatingWebhooks(res);
                res.status(200).send({ webhookData: "all webhooks are re created after deleting due to mismatched url" });
            } else {
                // console.log("webhooks url is matched");

                // ------------this is the else case for recreating the specific webhook------------
                const hasProductsUpdateWebhook = getAllWebhook.data.some(webhook => webhook.topic === "products/update");
                if (!hasProductsUpdateWebhook) {
                    const newWebhook = new shopify.api.rest.Webhook({ session: res.locals.shopify.session });
                    newWebhook.address = `${process.env.APP_URL}/api/webhooks`;
                    newWebhook.topic = "products/update";
                    newWebhook.format = "json";
                    await newWebhook.save({ update: true });
                }

                const hasInventoryLevelUpdateWebhook = getAllWebhook.data.some(webhook => webhook.topic === "inventory_levels/update");
                if (!hasInventoryLevelUpdateWebhook) {
                    const newWebhook = new shopify.api.rest.Webhook({ session: res.locals.shopify.session });
                    newWebhook.address = `${process.env.APP_URL}/api/webhooks`;
                    newWebhook.topic = "inventory_levels/update";
                    newWebhook.format = "json";
                    await newWebhook.save({ update: true });
                    console.log("inventory levels/update webhook regenerated ---- $$ ---- ");
                }

                res.status(200).send({ webhookData: "all webhooks are fine", webhooks: allWebhook });
            }
        }
    }
};

async function creatingWebhooks(res, condition) {
    // ------app/uninstalled------
    if (condition === "dont-create") {
        console.log("---uninstallation webhook already exist---")
    } else {
        const webhook1 = new shopify.api.rest.Webhook({
            session: res.locals.shopify.session,
        });
        webhook1.address = `${process.env.APP_URL}/api/webhooks`;
        webhook1.topic = "app/uninstalled";
        webhook1.format = "json";
        await webhook1.save({
            update: true,
        });
    }

    // ----------products/update----------
    const webhook2 = new shopify.api.rest.Webhook({
        session: res.locals.shopify.session,
    });
    webhook2.address = `${process.env.APP_URL}/api/webhooks`;
    webhook2.topic = "products/update";
    webhook2.format = "json";
    await webhook2.save({
        update: true,
    });

    // ----------inventory_levels/update------------
    const webhook3 = new shopify.api.rest.Webhook({
        session: res.locals.shopify.session,
    });
    webhook3.address = `${process.env.APP_URL}/api/webhooks`;
    webhook3.topic = "inventory_levels/update";
    webhook3.format = "json";
    await webhook3.save({
        update: true,
    });

    // -------- variants/in_stock --------
    const webhook4 = new shopify.api.rest.Webhook({
        session: res.locals.shopify.session,
    });
    webhook4.address = `${process.env.APP_URL}/api/webhooks`;
    webhook4.topic = "variants/in_stock";
    webhook4.format = "json";
    await webhook4.save({
        update: true,
    });

    // -----------app_subscriptions/update-------------
    const webhook5 = new shopify.api.rest.Webhook({
        session: res.locals.shopify.session,
    });
    webhook5.address = `${process.env.APP_URL}/api/webhooks`;
    webhook5.topic = "app_subscriptions/update";
    webhook5.format = "json";
    await webhook5.save({
        update: true,
    });

    // -----------"shop/update"-------------
    if (condition === "dont-create") {
        console.log("---shop/update webhook already exist---")
    } else {
        const webhook6 = new shopify.api.rest.Webhook({
            session: res.locals.shopify.session,
        });
        webhook6.address = `${process.env.APP_URL}/api/webhooks`;
        webhook6.topic = "shop/update";
        webhook6.format = "json";
        await webhook6.save({
            update: true,
        });
    }

    // -----------"domain/update"-------------
    if (condition === "dont-create") {
        console.log("---domain/update webhook already exist---")
    } else {
        const webhook7 = new shopify.api.rest.Webhook({
            session: res.locals.shopify.session,
        });
        webhook7.address = `${process.env.APP_URL}/api/webhooks`;
        webhook7.topic = "domains/update";
        webhook7.format = "json";
        await webhook7.save({
            update: true,
        });
    }

};

export const productsCount = async (req, res) => {
    // console.log("KKK -- ", res.locals.shopify.session)
    const countData = await shopify.api.rest.Product.count({
        session: res.locals.shopify.session,
    });
    res.status(200).send({ countData: countData.data });
};

export const appMetafieldGetId = async (req, res) => {
    const client = await new shopify.api.clients.Graphql({
        session: res.locals.shopify.session,
    });
    const data = await client.request(`query {
      currentAppInstallation {
        id
      }
    }`);
    res.status(200).send({ data: data, msg: "get id of app-data-metafield " });
};

export const appMetafieldCreate = async (req, res) => {
    const client = await new shopify.api.clients.Graphql({
        session: res.locals.shopify.session,
    });

    let ourQuery = await createAppDataMetafields(req.body);
    const data = await client.request(ourQuery.query, ourQuery.variables);
    res
        .status(200)
        .send({ data: data, msg: "app-data-metafield is created successfully" });
};

export const appMetafieldGetAll = async (req, res) => {
    const client = await new shopify.api.clients.Graphql({
        session: res.locals.shopify.session,
    });
    let ourQuery = await getAllAppDataMetafields(req.query.limit);
    const data = await client.request(ourQuery);
    res.status(200).send({ data: data, msg: "Get all app-data-metafields of this app" });
};

export const getShopLocaleLanguage = async (req, res) => {
    const client = new shopify.api.clients.Graphql({
        session: res.locals.shopify.session,
    });
    // get all----------
    const getAllLanguage = await client.request(`query {
      availableLocales {
        isoCode
        name
      }
    }`);
    const shopLanguage = await client.request(`query {
      shopLocales {
        locale
        primary
        published
      }
    }`);
    res.status(200).send({
        getAllLanguage: getAllLanguage,
        shopLanguage: shopLanguage,
        msg: "app- language successfully ",
    });
};

export const appMetafieldGetOne = async (req, res) => {
    const client = await new shopify.api.clients.Graphql({
        session: res.locals.shopify.session,
    });
    let ourQuery = await getOneAppDataMetafield(req.query);
    const data = await client.request(ourQuery);
    res
        .status(200)
        .send({ data: data, msg: "Get one app-data-metafield of this app" });
};

export const appMetafieldDelete = async (req, res) => {
    // const client = new shopify.api.clients.Graphql({
    //   session: res.locals.shopify.session
    // });
    // const data = await client.query({
    //   data: `query {
    //     availableLocales {
    //       isoCode
    //       name
    //     }
    //   }`,
    // });
    res
        .status(200)
        .send({ data: "data", msg: "app-data-metafield deleted successfully " });
};

export const subscriptionPlanStatus = async (req, res) => {
    const data = await shopify.api.rest.RecurringApplicationCharge.all({
        session: res.locals.shopify.session,
    });
    res.status(200).send({ data: data.data });
};

export const getShopApi = async (req, res) => {
    const countDatas = await shopify.api.rest.Shop.all({
        session: res.locals.shopify.session,
    });
    const countData = countDatas.data;
    // const getAllWebhook = await shopify.api.rest.Webhook.all({
    //   session: res.locals.shopify.session,
    // });
    // for (let i = 0; i < getAllWebhook.data.length; i++) {
    //   if (`${process.env.APP_URL}/api/webhooks` !== getAllWebhook.data[i].address) {
    //     const webhook = new shopify.api.rest.Webhook({ session: res.locals.shopify.session });
    //     webhook.id = getAllWebhook.data[i].id;
    //     webhook.address = `${process.env.APP_URL}/api/webhooks`;
    //     await webhook.save({
    //       update: true,
    //     });
    //   }
    // }
    res.status(200).send({ countData });
};

// export const subscriptionCreate = async (req, res) => {
//     const { shop, plan, promoData } = req.body;
//     try {
//         const query = `
//       SELECT ail.app_install_id, ail.plan_name 
//       FROM app_installation AS ai
//       INNER JOIN app_installation_logs AS ail
//       ON ai.app_install_id = ail.app_install_id
//       WHERE ai.shop_name = ?;
//     `;

//         database.query(query, [shop], async (err, checkTrial) => {
//             if (err) {
//                 console.error("Database query error:", err);
//                 return res.status(500).json({ error: "Internal server error", err });
//             }

//             const setTrialDays =
//                 checkTrial.length === 0 ||
//                     !checkTrial.some((data) => data.plan_name === plan)
//                     ? 10
//                     : 0;

//             getCuponCodeData(req, res, setTrialDays);
//         });
//     } catch (error) {
//         logger.error(error);
//         console.error("Unexpected error:", error);
//         res.status(500).json({ error: "Unexpected server error", error });
//     }
// };
export const subscriptionCreate = async (req, res) => {
  try {
    const { shop, plan, promoData } = req.body;

    const query = `
      SELECT ail.app_install_id, ail.plan_name 
      FROM app_installation AS ai
      INNER JOIN app_installation_logs AS ail
      ON ai.app_install_id = ail.app_install_id
      WHERE ai.shop_name = ?;
    `;

    // ✅ Execute query using mysql2/promise
    const [checkTrial] = await database.query(query, [shop]);

    // ✅ Determine trial days
    const setTrialDays =
      checkTrial.length === 0 ||
      !checkTrial.some((data) => data.plan_name === plan)
        ? 10
        : 0;

    // ✅ Continue logic after query
    await getCuponCodeData(req, res, setTrialDays);
  } catch (error) {
    console.error("❌ Error in subscriptionCreate:", error);
    logger.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

async function getCuponCodeData(req, res, setTrialDays) {
    const { shop, plan, price, interval, returnUrl, promoData } = req.body;
    let afterDiscount = price;

    if (!promoData) {
        return await getPaidPlan(
            req,
            res,
            setTrialDays,
            afterDiscount
        );
    }

    if (promoData.trial_days) {
        setTrialDays = promoData.trial_days;
    }

    if (promoData.discount_type) {
        afterDiscount = calculateDiscount(
            afterDiscount,
            promoData.discount,
            promoData.discount_type
        );
    }

    await getPaidPlan(
        req,
        res,
        Number(setTrialDays),
        afterDiscount
    );
}

function calculateDiscount(price, discount, type) {
    if (type === "percentage") {
        return price - (price * discount) / 100;
    } else if (type === "flat") {
        return price - discount;
    }
    return price;
}

async function getPaidPlan(req, res, trialDay, packagePrice) {

    const finalPaymentAmount = Number(packagePrice).toFixed(2);

    // console.log("trial_days -----  ", trialDay);
    // console.log("finalPaymentAmount ----- ", finalPaymentAmount);

    const mainString = req.body.shop;
    // const string1 = "wishlist-guru";
    // const string2 = "randeep";
    const checkFreeAccounts =
        // mainString.includes(string1) ||
        // mainString.includes(string2) ||
        req?.body?.promoData?.promo_code?.includes("PARTNER");

    const datas = {
        plan: {
            appRecurringPricingDetails: {
                price: {
                    amount: finalPaymentAmount,
                    // amount: req.body.price,
                    currencyCode: "USD"
                },
                interval: req.body.interval
            }
        }
    }

    const client = await new shopify.api.clients.Graphql({
        session: res.locals.shopify.session
    });

    let newQuery = `mutation appSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $test: Boolean, $trialDays: Int) {
          appSubscriptionCreate(name: $name, lineItems: $lineItems, returnUrl: $returnUrl, test: $test, trialDays: $trialDays) {
            appSubscription {
              id
            }
            confirmationUrl
            userErrors {
              field
              message
            }
          }
        }`

    const data = await client.request(newQuery, {
        variables: {
            "name": `${req.body.plan}/${req.body.interval}/${req?.body?.promoData?.promo_code || null}/${checkFreeAccounts ? "test" : "live"}`,
            "test": checkFreeAccounts,
            "returnUrl": req.body.returnUrl,
            "lineItems": [datas],
            "trialDays": trialDay,

        }
    });

    res.status(200).send({ data: data.data.appSubscriptionCreate, msg: "Get all data of this app  " });
}

export const subscriptionCancel = async (req, res) => {
    try {
        const { id } = req.body;
        await shopify.api.rest.RecurringApplicationCharge.delete({
            session: res.locals.shopify.session,
            id: id,
        });
        res.status(200).send({ msg: "Subscription Cancelled" });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
};

export const getCurrentUserDetail = async (req, res) => {
    // console.log("req", req.query.email);
    const data = await shopify.api.rest.Customer.search({
        session: res.locals.shopify.session,
        query: `email:${req.query.email}`,
    });
    // console.log("data", data);
    res.status(200).send({ data: data.customers });
};

export const apiAppTheme = async (req, res) => {
    try {
        const themeData = await shopify.api.rest.Theme.all({
            session: res.locals.shopify.session,
        });
        const getThemeId = themeData.data.find((theme) => theme.role === "main");
        const themeID = req.query.themeId === "0" ? getThemeId.id : Number(req.query.themeId);
        const getAssestData = await shopify.api.rest.Asset.all({
            session: res.locals.shopify.session,
            theme_id: themeID,
            asset: { key: "config/settings_data.json" },
        });

        // console.log("getAssestData ------- ", getAssestData)

        res.status(200).send({ settingFile: getAssestData.data, themeId: themeID });
    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }
};

export const apiWishAppTheme = async (req, res) => {
    try {
        const productAssetData = await shopify.api.rest.Asset.all({
            session: res.locals.shopify.session,
            theme_id: themeID,
            asset: { key: "templates/products.json" },
        });

        res.status(200).send({ productAssetData: productAssetData?.data || [] });
    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }
};

export const apiAllThemeData = async (req, res) => {
    try {
        const themeData = await shopify.api.rest.Theme.all({
            session: res.locals.shopify.session,
        });
        res.status(200).send({ settingFile: themeData.data });
    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }
};

export const getThemeDataById = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            console.log("Error: Theme ID is missing in the request");
            return res.status(400).json({ error: "Theme ID is required" });
        }
        const assetData = await shopify.api.rest.Asset.all({
            session: res.locals.shopify.session,
            theme_id: id,
            asset: { key: "config/settings_schema.json" },
        });
        // console.log("Asset data retrieved:", assetData);
        if (assetData.data.length === 0) {
            console.log("Error: Asset not found for theme ID:", id);
            return res.status(404).json({ error: "Asset not found" });
        }
        let assetValue = assetData.data[0].value;
        // Clean up JSON string
        assetValue = cleanJSON(assetValue);
        let schemaFile;
        try {
            schemaFile = JSON.parse(assetValue);
        } catch (parseError) {
            console.error("Failed to parse JSON. Error details:", parseError);
            return res
                .status(500)
                .json({ error: "Failed to parse JSON", details: parseError.message });
        }

        // Ensure schemaFile is an array and has at least one element
        if (!Array.isArray(schemaFile) || schemaFile.length === 0) {
            console.log(
                "Error: Schema file is not in the expected format or is empty"
            );
            return res.status(500).json({ error: "Invalid schema file format" });
        }

        // const themeName = schemaFile[0].theme_name;

        const themeInfo = schemaFile.find(item => item.name === 'theme_info');
        const themeName = themeInfo ? themeInfo.theme_name : undefined;

        if (!themeName) {
            console.log("Error: Theme name not found in schema");
            return res.status(500).json({ error: "Theme name not found in schema" });
        }

        console.log("Theme name successfully retrieved:", themeName);
        res.status(200).send({ themeName });
    } catch (error) {
        console.error("Error fetching theme data:", error);
        res
            .status(500)
            .json({ error: "An error occurred while fetching theme data" });
    }
};

const cleanJSON = (jsonString) => {
    // Remove trailing commas in objects and arrays
    return jsonString
        .replace(/,\s*}/g, "}") // Remove trailing comma before closing object brace
        .replace(/,\s*]/g, "]") // Remove trailing comma before closing array bracket
        .replace(/[\u0000-\u001F\u007F]/g, ""); // Remove control characters
};

export const apiProductsCreate = async (req, res) => {
    let status = 200;
    let error = null;
    try {
        await productCreator(res.locals.shopify.session);
    } catch (e) {
        console.log(`Failed to process products/create: ${e.message}`);
        status = 500;
        error = e.message;
    }
    logger.error(error);
    res.status(status).send({ success: status === 200, error });
};
