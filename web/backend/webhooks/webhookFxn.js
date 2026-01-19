import fs from "fs";
import { sqlTables } from "../constants/sqlTable.js";
import { emailQuotaLimitHTML, uninstallationEmailHTML } from "../utils/sendEmail.js";
import database from "../connection/database.js";
import logger from "../../loggerFile.js";
import { inactiveStatusToBrevo } from "../brevo/brevoFxn.js";
import { Constants } from "../constants/constant.js";
import shopify from "../../shopify.js";
import { backInStock, lowInStock, priceDrop, sendEmail } from "../utils/sendEmail.js";
import createAppDataMetafields from "../utils/appDataMetafields.js";
import axios from "axios";
import { KlaviyoCreateEventEmailRemainder } from "../controllers/controllersSql.js";


const { app_installation_table, app_installation_log_table, user_table, Wishlist_table, product_table, store_email_temp_table, email_reminder_table, store_languages_table, store_languages_url_table, klaviyo_table } = sqlTables;

const { supportEmail, backInStockKlaviyo, priceDropKlaviyo, lowInStockKlaviyo, appName, extAppName } = Constants;

export async function appDeletion(payload, shop) {
    try {

        const [installRows] = await database.query(
            `SELECT * FROM ${app_installation_table} WHERE shop_name = ?`,
            [payload.myshopify_domain]
        );

        if (installRows.length > 0) {
            const install = installRows[0];
            let storeName = payload.name.replace(/'/g, "~");

            await database.query(
                `UPDATE ${app_installation_table}
                 SET status='inActive',
                     active_plan_id='0',
                     active_plan_name='null',
                     access_token = NULL,
                     store_name=?
                 WHERE shop_name = ?`,
                [storeName, payload.myshopify_domain]
            );

            const [planRows] = await database.query(
                `SELECT plan_type 
                 FROM ${app_installation_log_table}
                 WHERE app_install_id = ?
                 ORDER BY log_date DESC
                 LIMIT 1`,
                [install.app_install_id]
            );

            if (planRows.length > 0) {

                await database.query(
                    `INSERT INTO ${app_installation_log_table}
                     (app_install_id, plan_id, plan_name, plan_type)
                     VALUES (?, '0', 'null', ?)`,
                    [install.app_install_id, planRows[0].plan_type]
                );
            }
        }
    } catch (err) {
        console.log(err);
        logger.error(err);
    }


    const shop_email = payload.customer_email;
    const shop_owner = payload.shop_owner;

    let mailHtml = uninstallationEmailHTML(shop_owner);
    let emailContent = {
        from: supportEmail,
        to: shop_email,
        subject: "Thanks for using Wishlist Guru App",
        html: mailHtml,
    };
    sendEmail(emailContent);

    // -----------------------------
    // 6️⃣ UPDATE BREVO STATUS
    // -----------------------------
    if (payload.email === payload.customer_email) {
        await inactiveStatusToBrevo(payload.email);
    } else {
        await inactiveStatusToBrevo(payload.email);
        await inactiveStatusToBrevo(payload.customer_email);
    }

    // deleteUserDataAtUninstallation(payload?.myshopify_domain);
}

export async function variantsInStock(payload, shop) {
    // console.log("BACK IN STOCK")
    if (!shop) return;
    try {
        const shopName = shop;
        const [result] = await database.query(
            `SELECT 
                ai.active_plan_id AS activePlanId, 
                ai.shop_email, 
                ai.store_name, 
                er.logo, 
                er.app_install_id, 
                er.back_in_stock AS backInStockCheck 
             FROM app_installation AS ai
             JOIN email_reminder AS er 
             ON ai.app_install_id = er.app_install_id
             WHERE ai.shop_name = ?`,
            [shopName]
        );
        if (!result || result.length === 0) {
            console.log("No shop installation data found.");
            return;
        }
        const lowInStockCheckValue = result[0]?.backInStockCheck || "no";
        const logo = result[0]?.logo;
        const app_install_id = result[0]?.app_install_id;
        const activePlanId = Number(result[0]?.activePlanId) || 1;
        const replyTO = result[0]?.shop_email || "";
        const storeName = result[0]?.store_name || "";
        // Email quota
        const emailQuota = await returnEmailQuota(shopName);
        if (activePlanId >= 3 && lowInStockCheckValue === "yes") {
            const [results] = await database.query(`
                SELECT DISTINCT 
                    u.email, 
                    w.price, 
                    u.store_name AS storeName, 
                    w.variant_id, 
                    w.image, 
                    w.handle AS productHandle, 
                    w.title,
                    w.product_id
                FROM ${user_table} AS u
                JOIN ${Wishlist_table} AS wt ON u.id = wt.wishlist_user_id
                JOIN ${product_table} AS w ON wt.wishlist_id = w.wishlist_id
                WHERE u.shop_name = ?
                AND w.variant_id = ?
                AND user_type = "User"
                AND u.email_valid = 1
            `, [shopName, payload.id]);

            if (results.length === 0) {
                console.log("No product available of this variant");
                return;
            }
            const resolvedCustomerData = results.map((row) => ({
                email: row.email,
                name: "Customer"
            }));
            const checkKlaviyoRecordExist = await checkKlaviyoRecord(shopName);
            if (activePlanId >= 4 && checkKlaviyoRecordExist?.length > 0) {
                const checkKlaviyoApiKeyResult = await checkKlaviyoApiKey(checkKlaviyoRecordExist[0].private_key);
                if (checkKlaviyoApiKeyResult.type === "success") {
                    const userItems = {
                        variant_id: payload.id,
                        title: results[0].title,
                        shopName: shopName,
                        storeName: results[0].storeName,
                        productImage: results[0].image,
                        handle: results[0].productHandle,
                        product_id: results[0].product_id
                    };
                    resolvedCustomerData.forEach(async (customer) => {
                        await KlaviyoIntegrationEmailRemainderFxn(
                            userItems,
                            checkKlaviyoRecordExist,
                            customer.email,
                            backInStockKlaviyo,
                            shopName
                        );
                    });
                    return;
                }
            }
            const [emailData] = await database.query(
                `SELECT se.back_in_stock_temp, se.sender_name, se.reply_to
                 FROM ${store_email_temp_table} AS se
                 JOIN ${email_reminder_table} AS er ON er.id = se.id
                 WHERE er.shop_name = ?`,
                [shopName]
            );
            if (!emailData || emailData.length === 0) {
                console.error("Email template missing.");
                return;
            }
            if (!results[0]?.productHandle) {
                console.error("Error -- productHandle is missing", results[0]?.productHandle);
                return;
            }
            backInStock(
                resolvedCustomerData,
                `${results[0]?.title}${payload.title !== "Default Title" ? ` (${payload.title})` : ""}`,
                payload.id,
                results[0].productHandle,
                shopName,
                shop,
                supportEmail,
                results[0].image,
                logo,
                app_install_id,
                JSON.parse(emailData[0].back_in_stock_temp),
                emailQuota,
                emailData[0].sender_name,
                storeName,
                emailData[0].reply_to ? emailData[0].reply_to : replyTO
            );
        }
    } catch (error) {
        webhookErr(error);
        console.error("Error occurred:", error);
    }
}

export async function inventoryUpdate(payload, shop, inventoryUpdate) {
    // console.log("Webhook LOW IN STOCK -- ", shop);
    if (!shop) return;
    try {
        const shopName = shop;
        const [result] = await database.query(
            `SELECT 
                ai.active_plan_id AS activePlanId, 
                ai.shop_email, 
                ai.store_name, 
                er.logo, 
                er.app_install_id, 
                er.low_in_stock AS lowInStockCheck
             FROM app_installation AS ai
             JOIN email_reminder AS er 
                ON ai.app_install_id = er.app_install_id
             WHERE ai.shop_name = ?`,
            [shopName]
        );
        if (result.length === 0) return;
        const activePlanId = Number(result[0]?.activePlanId) || 1;
        const lowInStockCheck = result[0]?.lowInStockCheck || "no";
        const logo = result[0]?.logo;
        const app_install_id = result[0]?.app_install_id;
        const replyTO = result[0]?.shop_email;
        const storeName = result[0]?.store_name;
        const emailQuota = await returnEmailQuota(shopName);
        if (activePlanId >= 3 && lowInStockCheck === "yes") {
            const productData = payload.variants;
            const foundItem = productData.find(
                (v) =>
                    Number(inventoryUpdate.inventory_item_id) ===
                    Number(v.inventory_item_id)
            );
            if (
                Number(inventoryUpdate.available) < 5 &&
                Number(inventoryUpdate.available) > 0
            ) {
                const [results] = await database.query(`
                    SELECT DISTINCT 
                        u.email,
                        w.price,
                        w.title,
                        w.product_id,
                        u.store_name AS storeName,
                        w.variant_id
                    FROM ${user_table} AS u
                    JOIN ${Wishlist_table} AS wt ON u.id = wt.wishlist_user_id
                    JOIN ${product_table} AS w ON wt.wishlist_id = w.wishlist_id
                    WHERE u.shop_name = "${shopName}"
                    AND u.email_valid = 1
                    AND user_type="User"
                    AND w.variant_id = "${foundItem?.id}"
                `);
                if (results.length === 0) {
                    console.log("No product available of this variant");
                    return;
                }
                const resolvedCustomerData = results.map((row) => ({
                    email: row.email,
                    name: "Customer",
                }));
                const checkKlaviyoRecordExist = await checkKlaviyoRecord(shopName);
                const checkKlaviyoApiKeyResult = await checkKlaviyoApiKey(
                    checkKlaviyoRecordExist[0]?.private_key
                );
                if (
                    activePlanId >= 4 &&
                    checkKlaviyoRecordExist?.length > 0 &&
                    checkKlaviyoApiKeyResult.type === "success"
                ) {
                    const userItems = {
                        variant_id: payload.id,
                        title: results[0].title,
                        shopName: shopName,
                        storeName: results[0].storeName,
                        productImage: payload.image.src,
                        handle: payload.handle,
                        product_id: results[0].product_id,
                    };
                    resolvedCustomerData.forEach(async (customer) => {
                        await KlaviyoIntegrationEmailRemainderFxn(
                            userItems,
                            checkKlaviyoRecordExist,
                            customer.email,
                            lowInStockKlaviyo,
                            shopName
                        );
                    });
                    return;
                }
                const [emailData] = await database.query(
                    `SELECT se.low_in_stock_temp, se.sender_name, se.reply_to
                     FROM ${store_email_temp_table} AS se
                     JOIN ${email_reminder_table} AS er
                        ON er.id = se.id
                     WHERE er.shop_name = ?`,
                    [shopName]
                );
                if (!emailData || emailData.length === 0) {
                    console.error("Error — Missing low in stock template");
                    return;
                }
                if (!foundItem.id) {
                    console.error("Error — foundItem.id is missing", foundItem.id);
                    return;
                }
                lowInStock(
                    resolvedCustomerData,
                    payload.title,
                    foundItem.id,
                    payload.handle,
                    shopName,
                    shop,
                    supportEmail,
                    payload.image.src,
                    logo,
                    app_install_id,
                    JSON.parse(emailData[0].low_in_stock_temp),
                    emailQuota,
                    emailData[0].sender_name,
                    storeName,
                    emailData[0].reply_to ? emailData[0].reply_to : replyTO
                );
            }
        }
    } catch (error) {
        webhookErr(error);
        console.error("Error occurred:", error);
    }
}

export async function productUpdate(payload, shop) {
    // console.log("PRICE DROP")
    if (!shop) return;
    let emailQuotaExceeded = false;
    try {
        const shopName = shop;
        const [result] = await database.query(
            `
            SELECT 
                ai.active_plan_id AS activePlanId,
                ai.shop_email, 
                ai.store_name, 
                er.logo, 
                er.app_install_id, 
                er.price_drop AS priceDropCheck
            FROM app_installation AS ai
            JOIN email_reminder AS er 
                ON ai.app_install_id = er.app_install_id
            WHERE ai.shop_name = ?
        `,
            [shopName]
        );
        const {
            priceDropCheck = "no",
            logo,
            app_install_id,
            shop_email,
            activePlanId = 1,
            store_name,
        } = result[0] || {};
        const emailQuota = await returnEmailQuota(shopName);
        const checkKlaviyoRecordExist = await checkKlaviyoRecord(shopName);
        const checkKlaviyoApiKeyResult = await checkKlaviyoApiKey(
            checkKlaviyoRecordExist[0]?.private_key
        );
        const isPriceDropValid =
            activePlanId >= 4 &&
            priceDropCheck === "yes" &&
            checkKlaviyoRecordExist?.length > 0 &&
            checkKlaviyoApiKeyResult.type === "success";
        const updatePriceAndSendEmail = async (del, row) => {
            if (Number(del.price) < Number(row.price)) {
                const dropPercentage = calculateDropPercentage(
                    row.price,
                    del.price
                );
                const finalPercentage = `${dropPercentage.toFixed(2)}%`;
                await updateProductPrice(row.id, del.price);
                const userItems = {
                    variant_id: payload.id,
                    title: row.title,
                    shopName,
                    storeName: row.storeName,
                    productImage: payload.image?.src,
                    handle: payload.handle,
                    product_id: row.product_id,
                    price: del.price,
                };
                if (isPriceDropValid) {
                    await KlaviyoIntegrationEmailRemainderFxn(
                        userItems,
                        checkKlaviyoRecordExist,
                        row.email,
                        priceDropKlaviyo,
                        shopName
                    );
                } else {
                    const [emailData] = await database.query(
                        `
                        SELECT 
                            se.price_drop_temp, 
                            se.sender_name, 
                            se.reply_to
                        FROM ${store_email_temp_table} AS se
                        JOIN ${email_reminder_table} AS er 
                            ON er.id = se.id 
                        WHERE er.shop_name = ?
                    `,
                        [shopName]
                    );
                    const resolvedCustomerData = [
                        { email: row.email, name: "Customer" },
                    ];
                    await priceDrop(
                        resolvedCustomerData,
                        payload.title,
                        row.variant_id,
                        row.price,
                        del.price,
                        finalPercentage,
                        payload.handle,
                        shopName,
                        shop,
                        supportEmail,
                        payload.image?.src,
                        logo,
                        app_install_id,
                        JSON.parse(emailData[0]?.price_drop_temp),
                        database.query,
                        emailData[0]?.sender_name,
                        store_name,
                        emailData[0]?.reply_to || shop_email
                    );
                }
            } else if (Number(del.price) > Number(row.price)) {
                await updateProductPrice(row.id, del.price);
            }
        };
        if (isPriceDropValid || (activePlanId >= 3 && priceDropCheck === "yes")) {
            for (const del of payload.variants) {
                try {
                    const [rows] = await database.query(
                        `SELECT 
                            u.email, 
                            u.store_name AS storeName,
                            w.price, 
                            w.variant_id, 
                            w.id, 
                            w.product_id,
                            w.title,
                            w.handle AS productHandle
                        FROM ${user_table} AS u
                        JOIN ${Wishlist_table} AS wt ON u.id = wt.wishlist_user_id
                        JOIN ${product_table} AS w ON wt.wishlist_id = w.wishlist_id
                        WHERE 
                            u.shop_name = ? 
                            AND user_type="User"
                            AND u.email_valid = 1
                            AND w.variant_id = ?
                    `,
                        [shopName, String(del.id)]
                    );
                    if (rows.length === 0) {
                        console.log("No product available of this variant");
                        continue;
                    }
                    for (const [index, row] of rows.entries()) {
                        if (isPriceDropValid) {
                            await updatePriceAndSendEmail(del, row);
                        } else {
                            const emailsSentSoFar =
                                emailQuota[0]?.emails_sent + index + 1;
                            const limit = emailQuota[0]?.email_quota;
                            const isEmailQuotaValid =
                                activePlanId >= 3 &&
                                priceDropCheck === "yes" &&
                                emailsSentSoFar <= limit;
                            if (isEmailQuotaValid) {
                                await updatePriceAndSendEmail(del, row);
                            } else {
                                const exceededBy = emailsSentSoFar - limit;
                                if (exceededBy <= 5) {
                                    if (!emailQuotaExceeded) {
                                        await handleEmailQuotaExceeded(
                                            emailQuota,
                                            shopName
                                        );
                                        await database.query(
                                            `INSERT INTO email_reports 
                                            (shop_name, email_type, subject, user_email) 
                                            VALUES (?, 'Limit cross', 'Wishlist GURU - Monthly email limit reached', ?)
                                        `,
                                            [
                                                shopName,
                                                emailQuota[0]?.shop_email,
                                            ]
                                        );
                                        emailQuotaExceeded = true;
                                    }
                                } else {
                                    console.log(
                                        `Email quota exceeded by ${exceededBy}, within buffer limit. Skipping handler.`
                                    );
                                    return;
                                }

                                break;
                            }
                        }
                    }
                } catch (error) {
                    webhookErr(error);
                    console.error("Error occurred:", error);
                }
            }
        }
    } catch (error) {
        webhookErr(error);
        console.error(error);
    }
}

export async function subscriptionUpdation(payload, shop) {
    // console.log("WEBHOOK Subscription -- ");
    try {
        const session = await shopify.config.sessionStorage.findSessionsByShop(shop);
        const countData = await shopify.api.rest.Shop.all({
            session: session[0],
        });
        const shopName = countData.data[0].myshopify_domain;

        const plansData = await shopify.api.rest.RecurringApplicationCharge.all({
            session: session[0],
        });

        const activePlan = plansData.data.filter((val) => val.status === "active");
        const [getPrevPlan] = await database.query(
            `SELECT ail.log_id, ail.plan_id, ail.app_install_id  
            FROM app_installation_logs AS ail
            JOIN app_installation AS ai 
                ON ail.app_install_id = ai.app_install_id
            WHERE ai.shop_name = ?
            ORDER BY ail.log_date DESC 
            LIMIT 1
        `,
            [shopName]
        );

        if (!getPrevPlan) return;
        if (activePlan.length === 0 && getPrevPlan.plan_id > 1) {
            await database.query(
                `INSERT INTO app_installation_logs
                    (app_install_id, plan_id, plan_name, plan_type, log_date)
                VALUES (?, '1', 'Free', 'null', ?)
            `,
                [getPrevPlan.app_install_id, getCurrentDate()]
            );
            await database.query(
                `UPDATE app_installation 
                SET active_plan_id = "1", active_plan_name = "Free" 
                WHERE app_install_id = ?
            `,
                [getPrevPlan.app_install_id]
            );
            console.log("success");
        }
    } catch (err) {
        console.log(err);
        logger?.error?.(err);
    }
}

export async function shopUpdate(payload, shop) {
    try {
        await database.query(
            `UPDATE app_installation SET shopify_plan = ? WHERE shop_name = ?`,
            [payload.plan_name, shop]
        );

        console.log("success");
    } catch (err) {
        console.log(err);
        logger?.error?.(err);
    }
}

export async function updateShopDomain(payload, shop) {
    try {
        const { host } = payload;
        // Replaces queryAsync
        const dbQuery = async (sql, params = []) => {
            const [rows] = await database.query(sql, params);
            return rows;
        };
        // 1️⃣ Fetch existing language URLs
        const langUrl = await dbQuery(
            `SELECT s.lang_id, sl.url 
            FROM ${store_languages_table} AS s 
            INNER JOIN ${store_languages_url_table} AS sl 
                ON s.lang_id = sl.lang_id 
            WHERE s.shop_name = ?
            `,
            [shop]
        );
        const tempUrl = await dbQuery(
            `SELECT id, language 
            FROM ${store_email_temp_table} 
            WHERE shop_name = ?
            `,
            [shop]
        );
        const originalLangUrls = JSON.parse(JSON.stringify(langUrl));
        const originalTempUrls = JSON.parse(JSON.stringify(tempUrl));
        const updatedLangUrls = originalLangUrls.map((entry) => {
            const currentDomain = extractDomain(entry.url);
            if (currentDomain !== host) {
                entry.url = replaceDomain(entry.url, host);
            }
            return entry;
        });
        const updatedTempUrls = originalTempUrls.map((entry) => {
            const currentDomain = extractDomain(entry.language);
            if (currentDomain !== host) {
                entry.language = replaceDomain(entry.language, host);
            }
            return entry;
        });
        for (const entry of updatedLangUrls) {
            const original = langUrl.find((e) => e.lang_id === entry.lang_id);
            if (original && original.url !== entry.url) {
                await dbQuery(
                    `UPDATE ${store_languages_url_table}
                    SET url = ?
                    WHERE lang_id = ? AND url = ?`,
                    [entry.url, entry.lang_id, original.url]
                );
            }
        }
        for (const entry of updatedTempUrls) {
            const original = tempUrl.find((e) => e.id === entry.id);
            if (original && original.language !== entry.language) {
                await dbQuery(
                    `UPDATE ${store_email_temp_table}
                    SET language = ?
                    WHERE id = ? AND language = ?`,
                    [entry.language, entry.id, original.language]
                );
            }
        }
    } catch (error) {
        logger.error(error);
        console.log(error);
    }
}

export async function shopifyPlanUpdate(payload) {
    try {
        const now = new Date();
        const formattedNow = now.toISOString().slice(0, 19).replace("T", " ");

        const [mainResult] = await database.query(
            `SELECT shopify_plan, app_install_id, access_token, store_type, active_plan_id, active_plan_name
       FROM ${app_installation_table}
       WHERE shop_name = ?`,
            [payload.myshopify_domain]
        );

        if (!mainResult || mainResult.length === 0) {
            console.warn(`No installation found for shop: ${payload.myshopify_domain}`);
            return;
        }

        const installation = mainResult[0];
        const oldPlan = installation.shopify_plan;
        const storeType = installation.store_type;
        const newPlan = payload.plan_name;
        if (oldPlan === newPlan) {
            console.log("No plan change detected:", payload.myshopify_domain);
            return;
        }
        if (newPlan === "frozen") {
            console.log("Skipping – new plan is frozen:", newPlan);
            return;
        }
        if (
            !["affiliate", "partner_test", "frozen"].includes(oldPlan) &&
            storeType !== "test"
        ) {
            console.log(
                `Skipping – not eligible old plan (${oldPlan}) or storeType (${storeType})`
            );
            return;
        }
        const shopifyNodes = await authSession(
            payload.myshopify_domain,
            installation.access_token
        );
        const [updateResult] = await database.query(
            `UPDATE ${app_installation_table} SET active_plan_name = ?, active_plan_id = ?, shopify_plan = ?, updated_date = ?, store_type = ?, store_published = ? WHERE shop_name = ?`, ["Free", 1, newPlan, formattedNow, "live", 1, payload.myshopify_domain]
        );
        if (updateResult.affectedRows > 0) {
            await database.query(
                `INSERT INTO ${app_installation_log_table}
         (app_install_id, plan_id, plan_name, payment_type, promo_code)
         VALUES (?, ?, ?, ?, ?)`,
                [installation.app_install_id, 1, "Free", "live", null]
            );
        }
        if (installation.active_plan_name !== "Free") {
            await deleteSubAndCreateMetafield(shopifyNodes);
        }
        const data = { oldPlan, newPlan };
        const htmlContent = await quotesOverTemplate(
            payload.shop_owner,
            "",
            payload.myshopify_domain,
            0,
            appName,
            "Wishlist Guru",
            0,
            0,
            data
        );

        const html2 = `
      <p>Hiii...</p>
      <p>We’re pleased to inform you that the Shopify plan has been changed from <b>${oldPlan}</b> to <b>${newPlan}</b> by the store:</p>
      <p>Shop Name: ${payload.myshopify_domain}</p>
      <p>Shop URL: ${payload.domain}</p>
      <p>Email: ${payload.email}</p>
      <p>Customer Email: ${payload.customer_email}</p>
      <p>Shopify old plan: ${oldPlan}</p>
      <p>Shopify new plan: ${newPlan}</p>
    `;
        const recipients = [
            ...(installation.active_plan_name !== "Free"
                ? [{ email: payload?.email || payload?.customer_email, html: htmlContent }]
                : []),
            { email: supportEmail, html: html2 },
            { email: "randeep.webframez@gmail.com", html: html2 },
        ];

        // 9️⃣ Send emails
        for (const data of recipients) {
            await sendEmail({
                from: supportEmail,
                to: data.email,
                replyTo: supportEmail,
                subject: `Wishlist Guru - Shopify plan changed for shop ${payload.myshopify_domain}`,
                html: data.html,
            });
        }
    } catch (error) {
        console.error("Error in shopifyPlanUpdate:", error);
        logger.error(error);
    }
}

async function deleteSubAndCreateMetafield(shopifyNodes) {
    try {
        const activeCharges = await shopifyNodes.recurringApplicationCharge.list();
        const currentPlanId = activeCharges.filter(charge => charge.status === 'active');
        if (currentPlanId?.length) {
            await shopifyNodes.recurringApplicationCharge.delete(currentPlanId[0]?.id);

            let dataQuery;
            try {
                dataQuery = await shopifyNodes.graphql(`
                query {
                  currentAppInstallation {
                    id
                  }
                }
              `);
            } catch (graphqlErr) {
                console.error("GraphQL query failed:", graphqlErr);
                return;
            }
            if (!dataQuery?.currentAppInstallation?.id) {
                console.error("Failed to fetch currentAppInstallation");
                return;
            }
            const bodyData = {
                key: "current-plan",
                namespace: "wishlist-app",
                ownerId: dataQuery.currentAppInstallation.id,
                type: "single_line_text_field",
                value: "1",
            };
            const { query, variables } = await createAppDataMetafields(bodyData);
            const finalVariables = variables.variables;
            const data = await shopifyNodes.graphql(query, finalVariables);
            console.log("metafield updated:", data);
        }
    } catch (error) {
        logger.error(error.message)
        console.log("error", error)
    }
}

async function quotesOverTemplate(owner, userName, shopName, percentageValue, APPNAME, MAINAPPNAME, usedQuotes, quotaLimit, data) {

    let htmlData = `
        <p style="font-size:12px;line-height:24px;color:#222;font-weight:400;font-family:'Poppins', sans-serif;text-align:left;max-width: 567px;margin: 5px auto;">Hi <b style="color: #1248A1;">${owner}</b>,</p>
        
        <p style="font-size:12px;line-height:24px;color:#222;font-weight:400;font-family:'Poppins', sans-serif;text-align:left;max-width: 567px;margin: 5px auto;">We hope you're enjoying using ${MAINAPPNAME} to manage customer wishlist products.</p>

        <p style="font-size:12px;line-height:24px;color:#222;font-weight:400;font-family:'Poppins', sans-serif;text-align:left;max-width: 567px;margin: 5px auto;">Just a quick heads-up — you have changed your Shopify plan from <b>${data?.oldPlan}</b> to <b>${data?.newPlan}</b>. Since your store is now live, we are required to cancel your Partner Test subscription. Your ${MAINAPPNAME} subscription has been moved to the free plan, and to continue using our services you will need to choose one of the paid plans.</p>
    `


    return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
        <title>Wishlist Guru Email Template</title>
        </head>
        <body style="margin: 0; padding: 0; width: 100%; height: 100%; -webkit-font-smoothing: antialiased;text-size-adjust:100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%;background-color:#e0e7ef;color: #000000;">
        <div style="background-color: #e1e1e1;max-width: 700px;margin: 5px auto; padding-bottom:20px;">
    
          <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0"
          style="border-collapse: collapse; border-spacing: 0;padding: 0;width:100%;">
            <tr>
                <td style="padding:15px;border-bottom: 1px dotted #ebe3e3;"><a href="https://wishlist-guru.myshopify.com/" target="_blank" style="text-decoration: none;outline: none; box-shadow: none;display: flex; max-width: 200px;margin: 5px auto;"><img src="https://cdn.shopify.com/s/files/1/0643/8374/6245/files/wishlist-mailer-logo.png?v=1758788454" alt="quote_logo" style="margin:0 auto; max-width:200px;"/></a></td>
            </tr>
          </table>
  
         ${htmlData}

          <p style="font-size:12px;line-height:24px;color:#222;font-weight:400;font-family:'Poppins', sans-serif;text-align:left;max-width: 567px;margin: 5px auto;">If you have any questions, reply to this email or contact us at <a href="https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=support@webframez.com", target="_blank" style="color: #1248A1;font-weight: 700;">support@webframez.com</a></p>
        </div>
        </body>
        </html>
      `;
}

export const extractDomain = (url) => {
    try {
        return new URL(url).hostname;
    } catch {
        return url.split('//')[1]?.split('/')[0] || '';
    }
};

export const replaceDomain = (url, newDomain) => {
    try {
        const u = new URL(url);
        u.hostname = newDomain;
        return u.toString();
    } catch {
        const path = url.split('//')[1]?.split('/').slice(1).join('/');
        return `https://${newDomain}/${path}`;
    }
};

const authSession = async (shop, session) => {
    const shopifyNode = await import("shopify-api-node");
    return new shopifyNode.default({
        shopName: shop,
        accessToken: session,
    });
};

async function deleteUserDataAtUninstallation(shopName) {
    try {
        // Fetch the user IDs for the given shopName
        const userIdsResult = await databaseQuery(`SELECT id FROM wishlist_users WHERE shop_name = '${shopName}'`);
        // console.log("userIds ------- ", userIdsResult);

        // Loop through each user ID
        for (const row of userIdsResult) {
            // Fetch wishlist IDs associated with the current user
            const wishlistIdsResult = await databaseQuery(`SELECT wishlist_id FROM wishlist WHERE wishlist_user_id=${row.id}`);

            for (const row1 of wishlistIdsResult) {
                // First, delete the items from the wishlist_items table
                await databaseQuery(`DELETE FROM wishlist_items WHERE wishlist_id=${row1.wishlist_id}`);
                console.log("Items deleted -----------------");

                await databaseQuery(`DELETE FROM cart_items WHERE wishlist_id=${row1.wishlist_id}`);
                console.log("cart_items deleted -----------------");

                // Then, delete the wishlist
                await databaseQuery(`DELETE FROM wishlist WHERE wishlist_id=${row1.wishlist_id}`);
                console.log("Wishlist deleted -----------------");
            }

            // Finally, delete the wishlist user
            await databaseQuery(`DELETE FROM wishlist_users WHERE id=${row.id}`);
            console.log("Wishlist user deleted -----------------");
        }

        // new codeee----------
        await databaseQuery(`DELETE FROM wishlist_share_stats WHERE shop_name='${shopName}'`);
        console.log("wishlist_share_stats deleted -----------------");

        const languageIdsResult = await databaseQuery(`SELECT lang_id FROM store_languages WHERE shop_name='${shopName}'`);
        // console.log("language Ids ------- ", languageIdsResult);

        for (const rowLang of languageIdsResult) {
            await databaseQuery(`DELETE FROM store_languages_url WHERE lang_id=${rowLang.lang_id}`);
            console.log("store_languages_url deleted -----------------");

            await databaseQuery(`DELETE FROM store_languages WHERE lang_id=${rowLang.lang_id}`);
            console.log("store_languages deleted -----------------");
        }

        await databaseQuery(`DELETE FROM store_email_templates WHERE shop_name='${shopName}'`);
        console.log("store_email_templates deleted ----------------- ");

        // latest neww----------
        await databaseQuery(`DELETE FROM social_like WHERE shop_name='${shopName}'`);
        console.log("social_like deleted ----------------- ");

        await databaseQuery(`DELETE FROM email_reports WHERE shop_name='${shopName}'`);
        console.log("email_reports deleted ----------------- ");

        await databaseQuery(`DELETE FROM email_reminder WHERE shop_name='${shopName}'`);
        console.log("email_reminder deleted ----------------- ");

        await databaseQuery(`DELETE FROM klaviyo WHERE shop_name='${shopName}'`);
        console.log("klaviyo deleted ----------------- ");

    } catch (err) {
        console.log(err);
        logger.error(err);
    }
}

async function returnEmailQuota(shopName) {
    try {
        const query = `
            SELECT 
                ai.shop_email, 
                ai.customer_email, 
                ai.store_owner, 
                p.email_quota, 
                (
                    SELECT COUNT(er.email_type) 
                    FROM email_reports AS er 
                    WHERE shop_name = ? 
                    AND MONTH(er.date) = MONTH(CURRENT_DATE()) 
                    AND YEAR(er.date) = YEAR(CURRENT_DATE())
                ) AS emails_sent
            FROM app_installation AS ai
            JOIN plan AS p ON ai.active_plan_id = p.plan_id
            WHERE ai.shop_name = ?;
        `;
        const [emailResult] = await database.query(query, [shopName, shopName]);
        return emailResult;
    } catch (err) {
        webhookErr(err);
        throw err;
    }
}

function webhookErr(reason) {
    fs.appendFile(
        "webhook_status.log",
        `${new Date().toISOString()}: Unhandled Rejection at:   reason:, ${reason} `,
        (err) => {
            if (err) {
                console.error(`Error appending to webhook_status.log: ${err}`);
            }
        }
    );
}

function databaseQuery(query) {
    return new Promise((resolve, reject) => {
        database.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

const checkKlaviyoRecord = async (shopName) => {
    try {
        const [result] = await database.query(
            `SELECT * FROM ${klaviyo_table} WHERE shop_name = ?`,
            [shopName]
        );

        return result;
    } catch (error) {
        logger.error(error);
        console.error(error);
        return [];
    }
};

export async function checkKlaviyoApiKey(apiKey) {
    const url = 'https://a.klaviyo.com/api/accounts';
    const options = {
        headers: {
            accept: 'application/vnd.api+json',
            revision: '2024-10-15',
            Authorization: `Klaviyo-API-Key ${apiKey}`,
        },
    };
    const maxRetries = 5;
    let retries = 0;
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    while (retries < maxRetries) {
        try {
            const response = await axios.get(url, options);
            // Check if there are errors in the response
            if (response.data.errors) {
                return { type: 'error' };
            } else {
                return { type: 'success', data: response.data.data };
            }
        } catch (error) {
            if (error.response && error.response.status === 429) {
                // Handle rate-limited error by waiting and retrying
                retries++;
                const retryAfter = error.response.headers['retry-after']
                    ? parseInt(error.response.headers['retry-after']) * 1000
                    : Math.pow(2, retries) * 1000; // Exponential backoff
                // console.log(`Rate limit exceeded. Retrying in ${retryAfter / 1000} seconds...`);
                logger.error(`Rate limit exceeded. Retrying in ${retryAfter / 1000} seconds...`);
                await delay(retryAfter); // Wait for retryAfter or exponential backoff
            } else {
                // Handle other errors
                // console.error('Request failed', error);
                logger.error(error);
                return { type: 'error' };
            }
        }
    }

    return { type: 'error', message: 'Max retries exceeded' };
}

const checkEmailSubscribeOrNot = (data, authKey) => {
    const {
        customerEmail
    } = data;

    fetch(`https://a.klaviyo.com/api/profiles/?filter=email='${customerEmail}'`, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            revision: '2025-04-15',
            Authorization: `Klaviyo-API-Key ${authKey}`
        }
    })
        .then(res => res.json())
        .then(data => {
            const profile = data.data?.[0];
            const consentStatus = profile?.attributes?.subscriptions?.email?.marketing?.consent;
            if (consentStatus === 'SUBSCRIBED') {
                console.log('User is already subscribed to marketing emails.');
            } else {
                // Proceed to subscribe
                subscribeUser(customerEmail, authKey);
            }
        })
        .catch(err => console.error('Error checking subscription:', err));
}

export function subscribeUser(customerEmail, authKey) {
    const url = 'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs';

    const payload = {
        data: {
            type: 'profile-subscription-bulk-create-job',
            attributes: {
                profiles: {
                    data: [
                        {
                            type: 'profile',
                            attributes: {
                                email: customerEmail,
                                subscriptions: {
                                    email: {
                                        marketing: {
                                            consent: 'SUBSCRIBED'
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        }
    };

    const options = {
        method: 'POST',
        headers: {
            Accept: 'application/vnd.api+json',
            Revision: '2025-04-15',
            'Content-Type': 'application/vnd.api+json',
            Authorization: `Klaviyo-API-Key ${authKey}`
        },
        body: JSON.stringify(payload)
    };

    fetch(url, options)
        .then(async res => {
            const contentType = res.headers.get('content-type');
            const status = res.status;

            // Handle empty body or non-JSON
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`API error ${status}: ${errorText}`);
            }

            if (contentType && contentType.includes('application/json')) {
                const data = await res.json();
                // console.log('✅ Subscription result:', data);
            } else {
                // console.log(`✅ Subscription succeeded (no JSON returned) — Status: ${status}`);
            }
        })
        .catch(err => {
            console.error('❌ Subscription error:', err.message || err);
        });
}

async function KlaviyoIntegrationEmailRemainderFxn(req, checkKlaviyoRecordExist, email, params, shopName) {
    await KlaviyoCreateEventEmailRemainder(req, checkKlaviyoRecordExist[0]?.private_key, email, params, shopName)

    const data = {
        customerEmail: email
    };
    await checkEmailSubscribeOrNot(data, checkKlaviyoRecordExist[0]?.private_key);
}

function calculateDropPercentage(previousPrice, updatedPrice) {
    return ((previousPrice - updatedPrice) / previousPrice) * 100;
}

async function updateProductPrice(productId, newPrice) {
    await database.query(
        `UPDATE ${product_table} SET price = ? WHERE id = ?`,
        [String(newPrice), Number(productId)]);
}

async function handleEmailQuotaExceeded(emailQuota, shopName) {
    let mailHtml = emailQuotaLimitHTML(emailQuota[0]?.store_owner, shopName);
    let emailContent = {
        from: supportEmail,
        to: emailQuota[0]?.shop_email,
        cc: emailQuota[0]?.customer_email,
        subject: "Wishlist GURU - Monthly email limit reached",
        html: mailHtml,
    };
    sendEmail(emailContent);
    console.log("Email limit reached. Exiting process.");
}

const queryAsync = (query, params) => {
    return new Promise((resolve, reject) => {
        database.query(query, params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

function queryDatabase(query, params = []) {
    return new Promise((resolve, reject) => {
        database.query(query, params, (err, result) => {
            if (err) {
                webhookErr(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function getCurrentDate() {
    const currentDate = new Date();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const options = {
        timeZone: timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    };
    let formattedDate = currentDate.toLocaleString("en-US", options);
    if (currentDate.getHours() === 0) {
        formattedDate = formattedDate.replace(/^24/, "00");
    }
    const finalFormattedDate = formattedDate.replace(
        /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2})/,
        (match, month, day, year, time) => `${year}-${month}-${day} ${time}`
    );
    return finalFormattedDate;
}