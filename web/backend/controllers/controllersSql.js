

import fs from "fs";
import multer from "multer";
import axios from "axios";
import shopify from "../../shopify.js";
import database from "../connection/database.js";
import logger from "../../loggerFile.js";
import { sqlTables } from "../constants/sqlTable.js";
import { Constants } from "../constants/constant.js";
import detectThemeName from "../utils/themeDetector.js";
import { storeFrontLanguages } from "../utils/storeFrontLanguages.js";
import { eightyPercentLimitEmailHTML, requestForm, hundredPercentLimitEmailHTML, sendEmail, weeklyWishlistUpdateToAdminHTML, userWishlistTableEmailHTML, sendSmtpEmail, sendMailByPostMark, sendMailBySmtp, sendSmtpErrorMail } from "../utils/sendEmail.js"
import nodemailer from 'nodemailer';
import { updateShopDomain } from "../webhooks/webhookFxn.js";
import { checkKlaviyoApiKey } from "../webhooks/webhookFxn.js";
import { addSetupInBrevo, updatePlanToBrevo } from "../brevo/brevoFxn.js";
import { subscribeUser } from "../webhooks/webhookFxn.js";
import { ServerClient } from "postmark";
import csv from 'csv-parser';
import shopifyNode from "shopify-api-node"
import { getProviderFromSMTP, isFromEmailValid, isPostmarkVerifiedSender, isSendGridVerifiedSender } from "../utils/smtpUtils.js";
import { generateToken } from "../jwt/generateToken.js";
import jwt from 'jsonwebtoken';
import { isValidToken } from "../jwt/authenticateToken.js";
import crypto from 'crypto';

const { token, serverURL, supportEmail, brevoApiKey, wishlistReminderKlaviyo, wishlistProductAddedKlaviyo, wishlistProductRemoveKlaviyo, JWT_SECRET, postMarkAPI } = Constants;

const { user_table, Wishlist_table, product_table, app_installation_table, app_installation_log_table, wishlist_shared_stats, plan_table, cart_table, store_languages_table, store_languages_url_table, email_reminder_table, store_email_temp_table, email_reports_table, social_like_table, klaviyo_table } = sqlTables;

const client = new ServerClient(postMarkAPI);

export const logoUpload = async (req, res) => {
    try {
        const { shopName, id } = req.body;
        const updateQuery = `UPDATE ${email_reminder_table} SET logo = ? WHERE app_install_id = ? AND shop_name = ?`;
        if (req.file !== undefined) {
            const [result] = await database.query(updateQuery, [req.file.filename, id, shopName]);
            res.status(200).json({ message: "Data Updated Successfully!" });
        } else {
            res.status(200).json({ message: "No file to be uploaded" });
        }
    } catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const createSocialLike = async (req, res) => {
    const { customerEmail } = req.body
    if (customerEmail === "") {
        await guestSocialLike(req, res);
    } else {
        await loginSocialLike(req, res);
    }
}

async function guestSocialLike(req, res) {
    try {
        const { currentToken, productId, shopName, checkCountDecOrNot, checkAddOrRemove } = req.body;
        const [getAllItems] = await database.query(`SELECT * FROM ${social_like_table} WHERE shop_name = ? AND product_id = ? AND email = ?`,
            [shopName, productId, currentToken]
        );
        if (getAllItems.length > 0 && checkCountDecOrNot === "true" && checkAddOrRemove === "remove") {
            await database.query(`DELETE FROM ${social_like_table} WHERE social_like_id = ?`,
                [getAllItems[0].social_like_id]);
            return res.send({ msg: "remove-successfully" });
        }
        if (getAllItems.length === 0 && checkAddOrRemove === "add") {
            await database.query(`INSERT INTO ${social_like_table} (email, product_id, shop_name, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP())`,
                [currentToken, productId, shopName]);
            return res.send({ msg: "saved-successfully" });
        }
        return res.send({ msg: "nothing change" });
    } catch (err) {
        console.error(err);
        logger.error(err);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
}

async function loginSocialLike(req, res) {
    try {
        const { customerEmail, productId, shopName, checkCountDecOrNot, checkAddOrRemove } = req.body;
        const [getAllItems] = await database.query(`SELECT * FROM ${social_like_table} WHERE shop_name = ? AND product_id = ? AND email = ?`,
            [shopName, productId, customerEmail]);
        if (getAllItems.length > 0 && checkCountDecOrNot === "true" && checkAddOrRemove === "remove") {
            await database.query(`DELETE FROM ${social_like_table} WHERE social_like_id = ?`,
                [getAllItems[0].social_like_id]);
            return res.send({ msg: "remove-successfully" });
        }
        if (getAllItems.length === 0 && checkAddOrRemove === "add") {
            await database.query(`INSERT INTO ${social_like_table} (email, product_id, shop_name, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP())`,
                [customerEmail, productId, shopName]);
            return res.send({ msg: "saved-successfully" });
        }
        return res.send({ msg: "nothing change" });
    } catch (err) {
        console.error(err);
        logger.error(err);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
}

export const createNewWishlist = async (req, res) => {
    if (req.body.customerEmail === "") {
        await CreateWishlist(req, res, req.body.currentToken, "guest");
    } else {
        await CreateWishlist(req, res, req.body.customerEmail, "login");
    }
};

async function CreateWishlist(req, res, emailOrToken, guestOrUser) {
    try {
        const [result2] = await database.query(`SELECT u.id FROM ${user_table} AS u WHERE u.shop_name = ? AND email = ?`,
            [req.body.shopName, emailOrToken]);
        if (result2.length === 0) {
            return await addCreateWishlist(req, res, emailOrToken, guestOrUser);
        }
        const insertQuery = `INSERT INTO ${Wishlist_table} (wishlist_user_id, wishlist_name, update_at, created_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
        await database.query(insertQuery, [result2[0].id, req.body.wishlistName]);
        return res.send({ msg: "wishlist created successfully" });
    } catch (err) {
        console.error("❌ SQL Error:", err);
        logger.error(err);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
}

async function addCreateWishlist(req, res, emailOrToken, guestOrUser) {
    try {
        let storeNameUpdate = req.body.storeName.replace(/'/g, "~");
        const insertUserQuery = `INSERT INTO ${user_table} (shop_name, email, user_type, store_name, language, referral_user_id) VALUES (?, ?, ?, ?, ?, ?)`;
        const userType = guestOrUser === "login" ? "User" : "Guest";
        const [result4] = await database.query(insertUserQuery, [
            req.body.shopName,
            emailOrToken,
            userType,
            storeNameUpdate,
            req.body.language,
            req.body.referral_id || null
        ]);
        const selectedUserId = result4.insertId;
        for (let i = 0; i < req.body.wishlistName.length; i++) {
            const insertWishlistQuery = `INSERT INTO ${Wishlist_table} (wishlist_user_id, wishlist_name, update_at, created_at)  VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
            await database.query(insertWishlistQuery, [selectedUserId, req.body.wishlistName]);
        }
        return res.send({ msg: "Wishlist created successfully" });
    } catch (err) {
        console.error("❌ SQL Error:", err);
        logger.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}





export async function getWishlistUsers(req, res) {
    try{
        const selectQuery = `SELECT * FROM ${user_table}`
        const [result] = await database.query(selectQuery)
        res.send(result)
    }
    catch(err){
        console.log("Error : ", err)
    }
}

export async function sendEmailOnOff(req, res) {
    try{
        const updateQuery = `UPDATE wishlist_users SET send_emails=? WHERE email=?`
        let send_emails = req.body.send_emails === true? "true": "false"
        database.query(updateQuery, [send_emails, req.body.email])
        // console.log("req.body.send_emails = ", req.body.send_emails)
        // console.log("req.body.email = ", req.body.email)
        console.log("req.body.send_emails = ", req.body.send_emails)
        // console.log("parseInt(req.body.send_emails) = ", parseInt(req.body.send_emails))
    }
    catch(err){
        console.log("Error: ", err)
    }
}






export const copyToWishlist = async (req, res) => {
    if (req.body.customerEmail === "") {
        await CopyMultiWishlist(req, res, req.body.currentToken);
    } else {
        await CopyMultiWishlist(req, res, req.body.customerEmail);
    }
};

async function CopyMultiWishlist(req, res, emailOrToken) {
    let idArray = [];
    try {
        for (let i = 0; i < req.body.wishlistName.length; i++) {
            const query = ` SELECT wt.wishlist_id  FROM ${Wishlist_table} AS wt  JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id WHERE u.shop_name = ? AND u.email = ? AND wt.wishlist_name = ?`;
            const [result2, fields] = await database.query(query, [req.body.shopName, emailOrToken, req.body.wishlistName[i]]);
            if (result2 && result2.length > 0) {
                idArray.push(result2[0]);
            }
        }
        for (let i = 0; i < idArray.length; i++) {
            const sendRes = i === idArray.length - 1 ? "yes" : "no";
            getVariant(req, res, idArray[i].wishlist_id, sendRes);
        }
    } catch (error) {
        console.error("Error in CopyMultiWishlist:", error);
        if (!res.headersSent) {
            res.status(500).send("An error occurred while copying wishlists.");
        }
    }
}

export const editWishlistName = async (req, res) => {
    if (req.body.customerEmail === "") {
        await EditWishlist(req, res, req.body.currentToken);
    } else {
        await EditWishlist(req, res, req.body.customerEmail);
    }
};

async function EditWishlist(req, res, emailOrToken) {
    try {
        const selectQuery = `SELECT wt.wishlist_id FROM ${Wishlist_table} AS wt JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id WHERE u.shop_name = ? AND u.email = ? AND wt.wishlist_name = ?`;
        const [selectRows] = await database.query(selectQuery, [req.body.shopName, emailOrToken, req.body.oldWishlistName]);
        if (!selectRows || selectRows.length === 0) {
            return res.status(404).send({ error: "Wishlist not found" });
        }
        const wishlistId = selectRows[0].wishlist_id;
        const updateQuery = `UPDATE ${Wishlist_table} SET wishlist_name = ? WHERE wishlist_id = ?`;
        const [updateResult] = await database.query(updateQuery, [req.body.newWishlistName, wishlistId]);
        res.send({ msg: "Wishlist name updated successfully" });
    } catch (error) {
        console.error("❌ Error in EditWishlist:", error);
        res.status(500).send({ error: "Database error" });
    }
}

export const deleteWishlistName = async (req, res) => {
    if (req.body.customerEmail === "") {
        await DeleteMultiWishlist(req, res, req.body.currentToken);
        return;
    }
    try {
        if (req.body.customerEmail !== "" && req.body.plan >= 4) {
            const checkKlaviyoRecordExist = await checkKlaviyoRecord(req.body.shopName);
            const checkKlaviyoApiKeyResult = await checkKlaviyoApiKey(checkKlaviyoRecordExist[0]?.private_key);
            if (checkKlaviyoRecordExist && checkKlaviyoRecordExist.length > 0 && checkKlaviyoApiKeyResult.type === "success"
            ) {
                const selectWishlistIdQuery = `SELECT w.wishlist_id FROM wishlist_users AS wu JOIN wishlist AS w ON wu.id = w.wishlist_user_id WHERE wu.shop_name = ? AND wu.email = ? AND w.wishlist_name = ?`;
                const [result2] = await database.query(selectWishlistIdQuery, [req.body.shopName, req.body.customerEmail, req.body.keyName
                ]);
                if (result2 && result2.length > 0) {
                    const wishlistId = result2[0].wishlist_id;
                    const selectProductsQuery = `SELECT product_id AS productId, variant_id AS variantId, title, image, handle FROM ${product_table} WHERE wishlist_id = ?`;
                    const [result] = await database.query(selectProductsQuery, [wishlistId]);
                    if (result && result.length > 0) {
                        for (const item of result) {
                            const klaviyoItem = {
                                ...item,
                                shopName: req.body.shopName,
                                customerEmail: req.body.customerEmail,
                                storeName: req.body.storeName,
                            };
                            await KlaviyoIntegrationFxn(klaviyoItem, wishlistProductRemoveKlaviyo, checkKlaviyoRecordExist, "byQuery");
                        }
                    }
                }
            }
        }
    } catch (error) {
        logger.error("Error during Klaviyo setup or database query in deleteWishlistName:", error);
    }
    await DeleteMultiWishlist(req, res, req.body.customerEmail);
};

async function DeleteMultiWishlist(req, res, emailOrToken) {
    let wishlistId;
    try {
        const selectQuery = `SELECT wt.wishlist_id FROM ${Wishlist_table} AS wt JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id WHERE u.shop_name = ? AND u.email = ? AND wt.wishlist_name = ?`;
        const [selectRows] = await database.query(selectQuery, [req.body.shopName, emailOrToken, req.body.keyName
        ]);
        if (!selectRows || selectRows.length === 0) {
            return res.send({ msg: "No wishlist found" });
        }
        wishlistId = selectRows[0].wishlist_id;
        const deleteProductsQuery = `DELETE FROM ${product_table} WHERE wishlist_id = ?`;
        await database.query(deleteProductsQuery, [wishlistId]);
        const deleteWishlistQuery = `DELETE FROM ${Wishlist_table} WHERE wishlist_id = ?`;
        await database.query(deleteWishlistQuery, [wishlistId]);
        res.send({ msg: "wishlist deleted successfuly" });
    } catch (error) {
        console.error("❌ Error in DeleteMultiWishlist:", error);
        if (!res.headersSent) {
            res.status(500).send({ error: "Database error during wishlist deletion." });
        }
    }
}

export const getMultiWishlistData = async (req, res) => {
    if (req.body.customerEmail === "") {
        await getMultiWishlist(req, res, req.body.currentToken);
    } else {
        await getMultiWishlist(req, res, req.body.customerEmail);
    }
};

async function getMultiWishlist(req, res, emailOrToken) {
    try {
        const selectQuery = `SELECT wt.wishlist_name FROM ${Wishlist_table} AS wt JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id WHERE u.shop_name = ? AND u.email = ?`;
        const [result2] = await database.query(selectQuery, [req.body.shopName, emailOrToken]);
        if (result2 && result2.length > 0) {
            const values = result2.map(item => item.wishlist_name);
            res.send({ data: values });
        } else {
            res.send({ data: [] });
        }
    } catch (error) {
        console.error("❌ Error in getMultiWishlist:", error);
        if (!res.headersSent) {
            res.status(500).send({ error: "Database error while fetching wishlists." });
        }
    }
}

export const createUser = async (req, res) => {
    const newPrice = await getProductPrice(req, res);
    if (req.body.price !== null) {
        req.body.price = newPrice || req.body.price;
    }
    if (req.body.customerEmail === "") {
        await guestUser(req, res);
    } else {
        await loginUser(req, res);
    }
};

async function getProductPrice(req, res) {
    try {
        const { wfGetDomain, variantId } = req.body;
        const response = await fetch(`${wfGetDomain}variants/${variantId}.json`);
        if (!response.ok) {
            return null
        }
        const buttonResponseData = await response.json();
        return buttonResponseData?.product_variant?.price
    } catch (error) {
        // console.error('Error fetching product price:', error);
    }
}

async function guestUser(req, res) {
    try {
        const checkGuestTokenQuery = ` SELECT wt.wishlist_user_id AS wishId, wt.wishlist_id AS id, wt.wishlist_name AS name FROM ${Wishlist_table} AS wt JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id WHERE u.shop_name = ? AND u.email = ?`;
        const [result] = await database.query(checkGuestTokenQuery, [req.body.shopName, req.body.guestToken]);
        if (result && result.length === 0) {
            const selectCustomerQuery = `SELECT u.id AS id FROM ${user_table} AS u WHERE u.shop_name = ? AND email = ?`;
            const [result3] = await database.query(selectCustomerQuery, [req.body.shopName, req.body.customerEmail]);
            const dataValue = "guest";
            await updateDataFxn2(result3, req, res, dataValue);
        } else {
            await updateDataFxn(result, req, res);
        }
    } catch (error) {
        console.error("❌ Error in guestUser function:", error);
        if (!res.headersSent) {
            res.status(500).send({ error: "Database error during guest user processing." });
        }
    }
}

async function loginUser(req, res) {
    try {
        const checkGuestTokenQuery = `SELECT wt.wishlist_id AS id FROM ${Wishlist_table} AS wt JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id WHERE u.shop_name = ? AND u.email = ?`;
        const [result] = await database.query(checkGuestTokenQuery, [req.body.shopName, req.body.guestToken]);
        if (result && result.length !== 0) {
            const updateGuestTokenQuery = `UPDATE ${user_table} SET email = ?, user_type = 'User' WHERE email = ?`;
            await database.query(updateGuestTokenQuery, [req.body.customerEmail, req.body.guestToken]);
            const selectedUserId1 = result[0].id;
            await getVariant(req, res, selectedUserId1);
        }
        else {
            const checkExistedEmailQuery = `SELECT wt.wishlist_user_id AS wishId, wt.wishlist_id AS id, wt.wishlist_name AS name FROM ${Wishlist_table} AS wt JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id WHERE u.shop_name = ? AND u.email = ?`;
            const [result2] = await database.query(checkExistedEmailQuery, [req.body.shopName, req.body.customerEmail]);
            if (result2 && result2.length !== 0) {
                await updateDataFxn(result2, req, res);
            } else {
                const selectUserIdQuery = `SELECT u.id AS id FROM ${user_table} AS u WHERE u.shop_name = ? AND email = ?`;
                const [result3] = await database.query(selectUserIdQuery, [req.body.shopName, req.body.customerEmail]);
                const dataValue = "login";
                await updateDataFxn2(result3, req, res, dataValue);
            }
        }
    } catch (error) {
        console.error("❌ Error in loginUser:", error);
        logger.error(error); // Log the error if logger is available
        if (!res.headersSent) {
            res.status(500).send({ error: "Database error during login processing." });
        }
    }
}

async function updateDataFxn(result, req, res) {
    let matchingIds = [];
    let nonMatchingNames = [];
    let delMatchingIds = [];
    let ids = null;

    const selectedUserId = result[0].wishId;
    if (req.body.wishlistName?.length > 0 && req.body.wishlistName[0] !== "wfNotMulti") {
        for (const name of req.body.wishlistName) {
            const matchingObjects = result.filter(
                (obj) => obj.name.toLowerCase() === name.toLowerCase()
            );
            if (matchingObjects.length > 0) {
                matchingIds.push(...matchingObjects.map((obj) => obj.id));
            } else {
                nonMatchingNames.push(name);
            }
        }
    }

    if (req.body.DelWishlistName !== undefined) {
        for (const name of req.body.DelWishlistName) {
            const matchingObjects = result.filter(
                (obj) => obj.name.toLowerCase() === name.toLowerCase()
            );
            if (matchingObjects.length > 0) {
                delMatchingIds.push(...matchingObjects.map((obj) => obj.id));
            }
        }
    }
    if (matchingIds.length > 0) {
        for (let i = 0; i < matchingIds.length; i++) {
            let sendRes =
                nonMatchingNames.length > 0
                    ? "no"
                    : delMatchingIds.length > 0
                        ? "no"
                        : i === matchingIds.length - 1
                            ? "yes"
                            : "no";

            await getVariant(req, res, matchingIds[i], sendRes);
        }
    }
    if (req.body.wishlistName[0] === "wfNotMulti") {
        ids = result.map((obj) => obj.id);
    }
    if (nonMatchingNames.length > 0) {
        for (let i = 0; i < nonMatchingNames.length; i++) {
            try {
                const query = `INSERT INTO ${Wishlist_table} (wishlist_user_id, wishlist_name, update_at, created_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
                const [result3] = await database.query(query, [selectedUserId, nonMatchingNames[i]]);
                const sendRes =
                    delMatchingIds.length > 0
                        ? "no"
                        : i === nonMatchingNames.length - 1
                            ? "yes"
                            : "no";
                const selectedUserId1 = result3.insertId;
                await getVariant(req, res, selectedUserId1, sendRes);
            } catch (err) {
                console.error("❌ SQL Insert Error (nonMatchingNames):", err);
            }
        }
    }

    if (delMatchingIds.length > 0) {
        for (let i = 0; i < delMatchingIds.length; i++) {
            let sendRes = i === delMatchingIds.length - 1 ? "yes" : "no";
            await deleteProduct(req, res, delMatchingIds[i], sendRes, matchingIds, delMatchingIds);
        }
    }
    if (ids !== null && ids.length !== 0) {
        for (let i = 0; i < ids.length; i++) {
            let sendRes = i === ids.length - 1 ? "yes" : "no";
            await deleteProduct(req, res, ids[i], sendRes, [], []);
        }
    }
}

async function updateDataFxn2(result, req, res, dataValue) {
    try {
        if (result.length !== 0) {
            const selectedUserId = result[0].id;
            for (let i = 0; i < req.body.wishlistName.length; i++) {
                const insertWishlistQuery = `INSERT INTO ${Wishlist_table}(wishlist_user_id, wishlist_name, update_at, created_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
                const [result5] = await database.query(insertWishlistQuery, [selectedUserId, req.body.wishlistName[i]]);
                let sendRes = i === req.body.wishlistName.length - 1 ? "yes" : "no";
                const selectedUserId1 = result5.insertId;
                await getVariant(req, res, selectedUserId1, sendRes);
            }
        }
        else {
            let storeNameUpdate = req.body.storeName.replace(/'/g, "~");
            const insertUserQuery = `INSERT INTO ${user_table} (shop_name, email, user_type, store_name, language, referral_user_id) VALUES (?, ?, ?, ?, ?, ?)`;
            const emailToUse = dataValue === "login" ? req.body.customerEmail : req.body.guestToken;
            const userType = dataValue === "login" ? "User" : "Guest";
            const [result4] = await database.query(insertUserQuery, [req.body.shopName, emailToUse, userType, storeNameUpdate, req.body.language, req.body.referral_id || null]);
            const selectedUserId = result4.insertId;
            let roughToken = '';
            let token = req?.headers['wg-api-key'];
            if (!token || token === null || token === "null" || token === undefined || token.trim() === "" || !isValidToken(token)) {
                roughToken = await generateToken(selectedUserId); // Assuming generateToken is async
            } else {
                roughToken = token;
            }
            for (let i = 0; i < req.body.wishlistName.length; i++) {
                const insertWishlistQuery = `INSERT INTO ${Wishlist_table}(wishlist_user_id, wishlist_name, update_at, created_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
                const [result5] = await database.query(insertWishlistQuery, [selectedUserId, req.body.wishlistName[i]]);
                let sendRes = i === req.body.wishlistName.length - 1 ? "yes" : "no";
                const selectedUserId1 = result5.insertId;
                await getVariant(req, res, selectedUserId1, sendRes, roughToken);
            }
        }
    } catch (err) {
        console.error("❌ Error in updateDataFxn2:", err);
        if (!res.headersSent) {
            res.status(500).send("Internal Server Error");
        }
    }
}

async function getVariant(req, res, selectedUserId, sendRes, roughToken = null) {
    try {
        let selectQuery;
        let queryParams;
        if (req.body.specificVariant === true) {
            selectQuery = `SELECT product_id FROM ${product_table} WHERE product_id = ? AND variant_id = ? AND wishlist_id = ?`;
            queryParams = [req.body.productId, req.body.variantId, selectedUserId];
        } else {
            selectQuery = `SELECT product_id FROM ${product_table} WHERE product_id = ? AND wishlist_id = ?`;
            queryParams = [req.body.productId, selectedUserId];
        }
        const [result] = await database.query(selectQuery, queryParams);
        if (result && result.length === 0) {
            await addProduct(req, res, selectedUserId, sendRes, roughToken);
            if (req.body.customerEmail !== "" && req.body.plan >= 4) {
                const checkKlaviyoRecordExist = await checkKlaviyoRecord(req.body.shopName);
                if (checkKlaviyoRecordExist && checkKlaviyoRecordExist.length > 0) {
                    const checkKlaviyoApiKeyResult = await checkKlaviyoApiKey(checkKlaviyoRecordExist[0]?.private_key);
                    if (checkKlaviyoApiKeyResult.type === "success") {
                        await KlaviyoIntegrationFxn(req, wishlistProductAddedKlaviyo, checkKlaviyoRecordExist, "");
                    }
                }
            }
        }
    } catch (err) {
        console.error("❌ Error in getVariant:", err);
        if (!res.headersSent) {
            res.status(500).send("Internal Server Error");
        }
    }
}

async function addProduct(req, res, selectedUserId, sendRes, roughToken = null) {
    try {
        const getPlanIdQuery = `SELECT active_plan_id as plan_id FROM ${app_installation_table} WHERE shop_name = ?`;
        const [planResult] = await database.query(getPlanIdQuery, [req.body.shopName]);
        if (planResult.length === 0) {

            let planNameExtract = "";
            if (req.body.plan === 4) {
                planNameExtract = "Premium";
            } else if (req.body.plan === 3) {
                planNameExtract = "Pro";
            } else if (req.body.plan === 2) {
                planNameExtract = "Basic";
            } else {
                planNameExtract = "Free";
            }
            let storeName = req.body.storeName.replace(/'/g, "~");
            const insertAppInstallQuery = `INSERT INTO ${app_installation_table} (shop_name, status, active_plan_id, active_plan_name, store_name) VALUES (?, 'Active', ?, ?, ?)`;
            const [reEnteredData] = await database.query(insertAppInstallQuery, [req.body.shopName, req.body.plan, planNameExtract, storeName]);
            const insertAppLogQuery = `INSERT INTO ${app_installation_log_table} (app_install_id, plan_id, plan_name, plan_type) VALUES (?, ?, ?, 'MONTHLY')`;
            await database.query(insertAppLogQuery, [reEnteredData.insertId, req.body.plan, planNameExtract]);
            await addProduct(req, res, selectedUserId, sendRes, roughToken);
        } else {
            const planId = planResult[0].plan_id;
            const freeQuery = `SELECT ail.log_date AS max_date, ail.plan_type AS max_plan_type FROM ${app_installation_log_table} AS ail, ${app_installation_table} AS ai WHERE ai.shop_name = ? AND ail.app_install_id = ai.app_install_id ORDER BY ail.log_date DESC LIMIT 1`;
            const [planDate] = await database.query(freeQuery, [req.body.shopName]);
            if (planDate.length === 0 || planDate[0]?.max_date === null) {
                await addItemAndRespond(req, res, selectedUserId, sendRes, roughToken, planId);
            } else {
                let planStartDate = planDate[0].max_date.toISOString();
                let givenDate = new Date(planStartDate);
                let nextMonthDate = new Date(givenDate);
                if (planId === 1) {
                    nextMonthDate.setDate(nextMonthDate.getDate() + 32);
                } else {
                    if (planDate[0].max_plan_type === "MONTHLY") {
                        nextMonthDate.setDate(nextMonthDate.getDate() + 32);
                    } else {
                        nextMonthDate.setFullYear(nextMonthDate.getFullYear() + 1);
                        nextMonthDate.setDate(nextMonthDate.getDate() + 2);
                    }
                }
                let currentDate = new Date();
                let monthFirstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
                let monthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
                const checkLimitQuery = `SELECT w.title, p.quota, p.name FROM ${user_table} AS u, ${Wishlist_table} AS wt, ${product_table} AS w, plan AS p WHERE u.shop_name = ? AND u.id = wt.wishlist_user_id AND wt.wishlist_id = w.wishlist_id AND p.plan_id = ? AND w.created_at >= ? AND CAST(w.created_at as DATE) <= ?`;
                const [list] = await database.query(checkLimitQuery, [req.body.shopName, req.body.plan, monthFirstDay, monthLastDay]);
                await checkQuotaAndAddItem(
                    req,
                    res,
                    selectedUserId,
                    sendRes,
                    list,
                    planId,
                    planDate[0]?.max_plan_type || null,
                    roughToken
                );
            }
        }
    } catch (err) {
        console.error("❌ Error in addProduct:", err);
        if (!res.headersSent) {
            res.status(500).send("Internal Server Error");
        }
    }
}

async function checkQuotaAndAddItem(req, res, selectedUserId, sendRes, list, planId, plan_type, roughToken = null) {
    const productTitleCode = req.body.title
        .replace(/\/wg-sgl/g, "'")
        .replace(/\/wg-dbl/g, '"')
        .replace(/'/g, "`");

    const addItemFinal = async () => {
        const insertProductQuery = `INSERT INTO ${product_table} (wishlist_id, variant_id, product_id, referral_user_id, handle, price, title, image, quantity, product_option) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const productInsertParams = [
            selectedUserId,
            req.body.variantId,
            req.body.productId,
            req.body.referral_id || null,
            req.body.handle,
            req.body.price,
            productTitleCode,
            req.body.image,
            req.body.quantity,
            req.body.productOption
        ];
        await database.query(insertProductQuery, productInsertParams);
        const updateWishlistQuery = `UPDATE ${Wishlist_table} SET update_at = CURRENT_TIMESTAMP WHERE wishlist_id = ?`;
        await database.query(updateWishlistQuery, [selectedUserId]);
        if (sendRes !== "no" && !res.headersSent) {
            res.json({
                msg: "item updated",
                isAdded: "yes",
                bothUpdated: "",
                token: roughToken || null
            });
        }
    };

    if (list.length === 0 || list[0].name === "Premium") {
        try {
            await addItemFinal();
        } catch (err) {
            console.error("❌ Error inserting product:", err);
            logger.error(err);
            if (!res.headersSent) res.status(500).send("Internal Server Error");
        }
        return;
    }
    const quotaLimit =
        planId === 1
            ? list[0].quota
            : plan_type === "ANNUAL"
                ? list[0].quota * 12
                : list[0].quota;

    if (list.length + 1 > quotaLimit) {
        const limitEmailQuery = `SELECT wu.shop_name, ai.store_owner, ai.shop_email, ai.customer_email, p.name, p.quota, COUNT(wi.title) AS total_items FROM app_installation AS ai, ${user_table} AS wu, ${Wishlist_table} AS wt, ${product_table} AS wi, plan AS p WHERE ai.shop_name = wu.shop_name AND wu.shop_name = ? AND wu.id = wt.wishlist_user_id AND wt.wishlist_id = wi.wishlist_id AND ai.active_plan_id = p.plan_id AND MONTH(wi.created_at) = MONTH(CURRENT_DATE()) AND YEAR(wi.created_at) = YEAR(CURRENT_DATE()) GROUP BY wu.shop_name`;
        const [emailResult] = await database.query(limitEmailQuery, [req.body.shopName]);
        if (emailResult.length > 0) {
            emailResult.forEach((item) => {
                let sendMail = false;
                let mailHtml = "";
                const eightyPercent = (80 / 100) * item.quota;
                const percentageUsed = (item.total_items / item.quota) * 100;
                if (item.total_items >= eightyPercent && item.total_items < item.quota) {
                    sendMail = true;
                    mailHtml = eightyPercentLimitEmailHTML(
                        item.name,
                        item.shop_name,
                        percentageUsed,
                        item.store_owner
                    );
                } else if (item.total_items >= item.quota) {
                    sendMail = true;
                    mailHtml = hundredPercentLimitEmailHTML(
                        item.name,
                        item.shop_name,
                        percentageUsed,
                        item.store_owner
                    );
                }
                if (sendMail) {
                    const emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                    if (emailRegEx.test(item.shop_email)) {
                        const emailContent = {
                            from: supportEmail,
                            to: item.shop_email,
                            cc: item.customer_email,
                            subject: "Wishlist Guru App Quota limit crossed.. Update Plan NOW!!!",
                            html: mailHtml,
                        };
                        // sendEmail(emailContent); // Assuming sendEmail is available
                    }
                }
            });
        }
        if (!res.headersSent) {
            res.json({ msg: "limit cross" });
        }
    } else {
        try {
            await addItemFinal();
        } catch (err) {
            console.error("❌ Error inserting product:", err);
            logger.error(err);
            if (!res.headersSent) res.status(500).send("Internal Server Error");
        }
    }
}

async function deleteProduct(req, res, selectedUserId, sendRes, matchingIds, delMatchingIds) {

    console.log("req ------ ", req.body)

    try {
        const {
            productId,
            variantId,
            title,
            image,
            handle,
            shopName,
            customerEmail,
            storeName,
            permission,
            specificVariant,
            plan
        } = req.body;
        const klaviyoRecords = await checkKlaviyoRecord(shopName);
        const shouldSendKlaviyo =
            customerEmail &&
            customerEmail !== "" &&
            Number(plan) >= 4 &&
            klaviyoRecords &&
            klaviyoRecords.length > 0;
        if (shouldSendKlaviyo) {
            const klaviyoKeyCheck = await checkKlaviyoApiKey(klaviyoRecords[0]?.private_key);
            if (klaviyoKeyCheck.type === "success") {
                const combinedData = {
                    productId,
                    variantId,
                    title,
                    image,
                    handle,
                    shopName,
                    customerEmail,
                    storeName
                };


                console.log("combinedData  ---- ", combinedData)
                await KlaviyoIntegrationFxn(
                    combinedData,
                    wishlistProductRemoveKlaviyo,
                    klaviyoRecords,
                    "byQuery"
                );
            }
        }
        if (permission === "dont_remove") {
            if (!res.headersSent) {
                return res.json({ msg: "already added" });
            }
            return;
        }
        let sql;
        let params;
        if (specificVariant === true) {
            sql = `DELETE FROM ${product_table} WHERE product_id = ? AND variant_id = ? AND wishlist_id = ?`;
            params = [productId, variantId, selectedUserId];
        } else {
            sql = `DELETE FROM ${product_table} WHERE product_id = ? AND wishlist_id = ?`;
            params = [productId, selectedUserId];
        }
        await database.query(sql, params);
        if (sendRes === "yes" && !res.headersSent) {
            const bothUpdated =
                matchingIds?.length > 0 && delMatchingIds?.length > 0 ? "yes" : "";
            return res.json({
                msg: "item updated",
                isAdded: "no",
                bothUpdated
            });
        }
    } catch (err) {
        console.error("Delete Product Error:", err);
        if (!res.headersSent) {
            return res.status(500).send("Internal Server Error");
        }
    }
}

export const deleteItem = async (req, res) => {
    const selectedUserId = req.headers["wg-user-id"];
    const sendRes = "yes";
    try {
        if (req.body.customerEmail !== "" && req.body.plan >= 4) {
            const checkKlaviyoRecordExist = await checkKlaviyoRecord(req.body.shopName);
            if (checkKlaviyoRecordExist?.length > 0) {
                const checkKlaviyoApiKeyResult = await checkKlaviyoApiKey(
                    checkKlaviyoRecordExist[0]?.private_key
                );
                if (checkKlaviyoApiKeyResult.type === "success") {
                    const productSelectQuery = `
                        SELECT 
                            product_id AS productId, 
                            variant_id AS variantId, 
                            title, 
                            image, 
                            handle 
                        FROM ${product_table} 
                        WHERE product_id = ? AND wishlist_id = ?
                    `;
                    const [result] = await database.query(productSelectQuery, [
                        req.body.productId,
                        selectedUserId,
                    ]);
                    if (result.length > 0) {
                        const { shopName, customerEmail, storeName } = req.body;
                        for (const item of result) {
                            const combinedData = {
                                productId: item.productId,
                                variantId: item.variantId,
                                title: item.title,
                                image: item.image,
                                handle: item.handle,
                                shopName,
                                customerEmail,
                                storeName,
                            };
                            await KlaviyoIntegrationFxn(
                                combinedData,
                                wishlistProductRemoveKlaviyo,
                                checkKlaviyoRecordExist,
                                "byQuery"
                            );
                        }
                    }
                }
            }
        }
        await deleteProduct(req, res, selectedUserId, sendRes, [], []);
    } catch (err) {
        console.error("Delete Item Error:", err);
        if (!res.headersSent) {
            return res
                .status(500)
                .json({ msg: "Internal Server Error during deletion process." });
        }
    }
};

export const deleteAllItem = async (req, res) => {
    const { wishlistIds, shopName, customerEmail, storeName, plan } = req.body;
    try {
        if (customerEmail && plan >= 4) {
            const klaviyoRecord = await checkKlaviyoRecord(shopName);
            if (klaviyoRecord?.length > 0) {
                const apiKey = klaviyoRecord[0]?.private_key;
                const apiCheck = await checkKlaviyoApiKey(apiKey);
                if (apiCheck.type === "success") {
                    const productQuery = `
                        SELECT product_id AS productId, variant_id AS variantId, title, image, handle 
                        FROM ${product_table} 
                        WHERE wishlist_id IN (?)
                    `;
                    const [products] = await database.query(productQuery, [wishlistIds]);
                    if (products?.length > 0) {
                        for (const item of products) {
                            await KlaviyoIntegrationFxn(
                                {
                                    ...item,
                                    shopName,
                                    customerEmail,
                                    storeName
                                },
                                wishlistProductRemoveKlaviyo,
                                klaviyoRecord,
                                "byQuery"
                            );
                        }
                    }
                }
            }
        }
        const deleteQuery = `DELETE FROM ${product_table} WHERE wishlist_id IN (?)`;
        await database.query(deleteQuery, [wishlistIds]);
        if (!res.headersSent) {
            return res.json("All items removed");
        }
    } catch (error) {
        console.error("❌ Error in deleteAllItem:", error);
        if (!res.headersSent) {
            return res.status(500).json({ error: "Failed to remove items" });
        }
    }
};

const queryDB = (query, params = []) => {
    return new Promise((resolve, reject) => {
        database.query(query, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

export const getAllItems = async (req, res) => {
    try {
        const { shopName, currentToken, customerEmail } = req.body;
        const fixedInput = fixBase64Padding(req?.body?.langName); // Fix padding if needed
        const langName = atob(fixedInput);
        let getDefaultLanguage;
        const langObject = storeFrontLanguages[langName];
        if (langObject) {
            getDefaultLanguage = langObject;
        } else {
            getDefaultLanguage = {};
        }
        const userQuery = `SELECT 
        wt.wishlist_id AS id, 
        wt.wishlist_name AS name, 
        u.id AS userId
    FROM ${Wishlist_table} AS wt
    INNER JOIN ${user_table} AS u 
        ON u.id = wt.wishlist_user_id
    WHERE u.shop_name = ? AND u.email = ?`;
        const [result] = await database.query(userQuery, [shopName, currentToken]);
        if (result.length === 0) {
            const userIdQuery = `
        SELECT 
            wt.wishlist_id AS id, 
            wt.wishlist_name AS name
        FROM ${Wishlist_table} AS wt
        JOIN ${user_table} AS u 
            ON u.id = wt.wishlist_user_id
        WHERE u.shop_name = ? 
        AND u.email = ?
    `;
            const [getUserId] = await database.query(userIdQuery, [
                req.body.shopName,
                req.body.customerEmail,
            ]);
            if (getUserId.length > 0) {
                const getAllItemArr = [];
                for (const wishlist of getUserId) {
                    const [getAllItems] = await database.query(
                        `SELECT * FROM ${product_table} WHERE wishlist_id = ? ORDER BY title ASC`,
                        [wishlist.id]
                    );
                    getAllItemArr.push({
                        [wishlist.name]: getAllItems,
                        id: wishlist.id,
                    });
                }
                return res.json({
                    data: getAllItemArr,
                    defLanguageData: getDefaultLanguage,
                });
            }
            return res.json({
                data: [],
                defLanguageData: getDefaultLanguage,
            });
        }
        else {
            const emailCheckQuery = `SELECT * FROM ${user_table} WHERE shop_name = ? AND email = ?`;
            const [emailCheck] = await database.query(emailCheckQuery, [shopName, customerEmail]);
            if (emailCheck.length === 0 && customerEmail === "") {
                const getAllItemArr = await Promise.all(
                    result.map(async (item) => {
                        const [getAllItems] = await database.query(
                            `SELECT * FROM ${product_table} WHERE wishlist_id = ? ORDER BY title ASC`,
                            [item.id]
                        );
                        return { [item.name]: getAllItems, id: item.id };
                    })
                );
                return res.json({
                    data: getAllItemArr.length > 0 ? getAllItemArr : [],
                    defLanguageData: getDefaultLanguage,
                });
            }
            if (emailCheck.length === 0 && customerEmail !== "") {
                const updateUserQuery = `
            UPDATE ${user_table}
            SET email = ?, user_type = 'User', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
                await database.query(updateUserQuery, [customerEmail, result[0].userId]);
                const getAllItemArr = await Promise.all(
                    result.map(async (item) => {
                        const [getAllItems] = await database.query(
                            `SELECT * FROM ${product_table} WHERE wishlist_id = ? ORDER BY title ASC`,
                            [item.id]
                        );
                        return { [item.name]: getAllItems, id: item.id };
                    })
                );
                return res.json({
                    data: getAllItemArr.length > 0 ? getAllItemArr : [],
                    defLanguageData: getDefaultLanguage,
                });
            }
            const [userResult] = await database.query(
                `SELECT wishlist_id, wishlist_name FROM ${Wishlist_table} WHERE wishlist_user_id = ?`,
                [emailCheck[0].id]
            );
            const wishlistMap = new Map(
                userResult.map((item) => [item.wishlist_name, item.wishlist_id])
            );
            for (const item of result) {
                if (wishlistMap.has(item.name)) {
                    const wishlistId = wishlistMap.get(item.name);
                    await updateWishlistItems(wishlistId, item.id);
                } else {
                    await database.query(
                        `UPDATE ${Wishlist_table} SET wishlist_user_id = ? WHERE wishlist_id = ?`,
                        [emailCheck[0].id, item.id]
                    );
                }
            }
            try {
                await database.query(
                    `DELETE FROM ${product_table} WHERE wishlist_id IN 
                (SELECT wishlist_id FROM ${Wishlist_table} WHERE wishlist_user_id = ?)`,
                    [result[0].userId]
                );
                await database.query(
                    `DELETE FROM ${Wishlist_table} WHERE wishlist_user_id = ?`,
                    [result[0].userId]
                );
                await database.query(
                    `DELETE FROM ${user_table} WHERE id = ?`,
                    [result[0].userId]
                );
                console.log("✅ Old user and related data deleted successfully.");
            } catch (err) {
                console.error("❌ Cleanup error:", err);
            }
            const [getUserId] = await database.query(
                `SELECT wt.wishlist_id AS id, wt.wishlist_name AS name
         FROM ${Wishlist_table} AS wt 
         JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
         WHERE u.shop_name = ? AND u.email = ?`,
                [shopName, customerEmail]
            );
            const getAllItemArr = await Promise.all(
                getUserId.map(async (wishlist) => {
                    const [getAllItems] = await database.query(
                        `SELECT * FROM ${product_table} WHERE wishlist_id = ? ORDER BY title ASC`,
                        [wishlist.id]
                    );
                    return { [wishlist.name]: getAllItems, id: wishlist.id };
                })
            );
            return res.json({
                data: getAllItemArr.length > 0 ? getAllItemArr : [],
                defLanguageData: getDefaultLanguage,
            });
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const saveActiveTheme = async (req, res) => {
    try {
        const { shopName, theme } = req.body;
        const updateQuery = `UPDATE ${app_installation_table} SET active_theme = ? WHERE shop_name = ?`;
        await database.query(updateQuery, [theme, shopName]);
        if (!res.headersSent) {
            return res.status(200).json({ msg: "Active theme saved successfully" });
        }
    } catch (error) {
        logger.error(error);
        console.error("Error in saveActiveTheme:", error);
        if (!res.headersSent) {
            return res.status(500).json({ error: "Failed to save active theme" });
        }
    }
};

export const getKlaviyoEmailIntegration = async (req, res) => {
    const { shopName } = req.body;
    try {
        const selectQuery = `SELECT * FROM ${klaviyo_table} WHERE shop_name = ?`;
        const [result] = await database.query(selectQuery, [shopName]);
        if (!res.headersSent) {
            res.send(result);
        }
    } catch (err) {
        logger.error(err);
        console.error("Error fetching Klaviyo integration:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to fetch Klaviyo integration data." });
        }
    }
};

export const getSmtpEmailIntegration = async (req, res) => {
    const { shopName } = req.body;
    const smtp_table = "email_smtp";
    try {
        const selectQuery = `SELECT * FROM ${smtp_table} WHERE shop_name = ?`;
        const [result] = await database.query(selectQuery, [shopName]);
        if (!res.headersSent) {
            res.send(result);
        }
    } catch (err) {
        logger.error(err);
        console.error("Error fetching SMTP email integration:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to fetch SMTP email integration data." });
        }
    }
};

async function KlaviyoIntegrationEmailRemainderFxn(req, checkKlaviyoRecordExist, email, params, shopName) {
    await KlaviyoCreateEventEmailRemainder(req, checkKlaviyoRecordExist[0]?.private_key, email, params, shopName)
}

const checkKlaviyoRecord = async (shopName) => {
    try {
        const selectQuery = `SELECT * FROM ${klaviyo_table} WHERE shop_name = ?`;
        const [result] = await database.query(selectQuery, [shopName]);
        return result;
    } catch (error) {
        logger.error(error);
        console.error("Error in checkKlaviyoRecord:", error);
        return [];
    }
};

async function KlaviyoCreateEvent(datas, authKey, params) {
    const { productId, variantId, title, image, storeName, shopName, handle, customerEmail, price } = datas;
    const userQuery = `
        SELECT 
            wi.product_id AS productId,
            wi.variant_id AS variantId,
            wi.title,
            wi.image AS productImage,
            wu.store_name AS storeName,
            wu.shop_name AS shopName,
            wi.handle,
            wu.email,
            wi.price 
        FROM ${Wishlist_table} AS w 
        INNER JOIN ${user_table} AS wu ON wu.id = w.wishlist_user_id 
        INNER JOIN ${product_table} AS wi ON wi.wishlist_id = w.wishlist_id 
        WHERE wu.shop_name = ? AND wu.email = ?;
    `;

    try {
        const [result] = await database.query(userQuery, [shopName, customerEmail]);
        const url = 'https://a.klaviyo.com/api/events';

        if (!productId || !variantId || !title || !customerEmail) {
            console.error("Missing required fields for Klaviyo event.");
            return { error: "Missing required fields" };
        }
        const productImage = image.startsWith("https:") ? image : `https:${image}`;
        const formattedResults = result.map(item => {
            const itemProductImage = item.productImage.startsWith('http')
                ? item.productImage
                : `https:${item.productImage}`;
            return {
                ...item,
                productImage: itemProductImage
            };
        });
        const requestData = {
            data: {
                type: 'event',
                attributes: {
                    properties: {
                        currentWishlist: {
                            productId,
                            variantId,
                            title,
                            productImage,
                            storeName,
                            shopName,
                            handle,
                            email: customerEmail,
                            price
                        },
                        allWishlist: formattedResults
                    },
                    metric: {
                        data: {
                            type: 'metric',
                            attributes: { name: params }
                        }
                    },
                    profile: {
                        data: {
                            type: 'profile',
                            attributes: { email: customerEmail }
                        }
                    }
                }
            }
        };

        const options = {
            method: 'POST',
            headers: {
                revision: '2024-10-15',
                'content-type': 'application/vnd.api+json',
                Authorization: `Klaviyo-API-Key ${authKey}`
            },
            body: JSON.stringify(requestData)
        };
        const fetchData = await fetch(url, options);
        if (!fetchData.ok) {
            const errorBody = await fetchData.text();
            throw new Error(`Klaviyo API Error (${fetchData.status}): ${errorBody}`);
        }
        const data = await fetchData.json();
        console.log("Klaviyo event response data:", data);
    } catch (error) {
        logger.error(error);
        console.error("Error creating Klaviyo event:", error.message);
    }
}

export async function KlaviyoCreateEventEmailRemainder(datas, authKey, email, params, shopName) {
    if (datas.productImage?.startsWith('//')) {
        datas.productImage = 'https:' + datas.productImage;
    }
    const userQuery = `
        SELECT 
            wi.product_id AS productId,
            wi.variant_id AS variantId,
            wi.title,
            wi.image AS productImage,
            wu.store_name AS storeName,
            wu.shop_name AS shopName,
            wi.handle,
            wu.email,
            wi.price 
        FROM wishlist AS w INNER JOIN wishlist_users AS wu ON wu.id = w.wishlist_user_id INNER JOIN wishlist_items AS wi ON wi.wishlist_id = w.wishlist_id WHERE wu.shop_name = ? AND wu.user_type = 'User' AND wu.email = ?;`;

    try {
        const [result] = await database.query(userQuery, [shopName, email]);
        const formattedResults = result.map(item => {
            return {
                ...item,
                productImage: item.productImage.startsWith('//')
                    ? `https:${item.productImage}`
                    : item.productImage
            };
        });
        const url = 'https://a.klaviyo.com/api/events';
        const eventProperties = {
            currentWishlist: datas,
            allWishlist: formattedResults
        };
        const requestData = {
            data: {
                type: 'event',
                attributes: {
                    properties: eventProperties,
                    metric: {
                        data: {
                            type: 'metric',
                            attributes: { name: params }
                        }
                    },
                    profile: {
                        data: {
                            type: 'profile',
                            attributes: {
                                meta: {
                                    patch_properties: {
                                        append: {},
                                        unappend: {}
                                    }
                                },
                                email: email
                            }
                        }
                    }
                }
            }
        };
        const options = {
            headers: {
                accept: 'application/vnd.api+json',
                revision: '2024-10-15',
                'content-type': 'application/vnd.api+json',
                Authorization: `Klaviyo-API-Key ${authKey}`
            }
        };
        const response = await axios.post(url, requestData, options);
        return response.data;
    } catch (error) {
        logger.error(error);
        console.error("Error creating Klaviyo email remainder event:", error.message);
        return undefined;
    }
}

async function checkEventRecord(key, params, productDetail) {
    const { shopName, customerEmail, productId, variantId } = productDetail;
    const url = `https://a.klaviyo.com/api/events`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/vnd.api+json',
            revision: '2024-10-15',
            Authorization: `Klaviyo-API-Key ${key}`
        }
    };
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Klaviyo API Error (${response.status}): Failed to fetch events. Body: ${errorBody}`);
        }
        const json = await response.json();
        if (!json.data || !Array.isArray(json.data)) {
            console.warn("Klaviyo API returned no data array.");
            return [];
        }
        const finalResult = json.data
            .filter(current => {
                const metricId = current.relationships?.metric?.data?.id;
                const props = current.attributes?.event_properties;
                const metricMatch = metricId === params;
                const detailMatch = props &&
                    props.shopName === shopName &&
                    props.email === customerEmail &&
                    props.productId === productId &&
                    props.variantId === variantId;
                return metricMatch && detailMatch;
            })
            .map(current => current.attributes.event_properties);
        return finalResult;
    } catch (error) {
        logger.error(error);
        console.error("Error in checkEventRecord:", error.message);
        return [];
    }
}

async function checkMetricesExist(privateKey, params) {
    const url = 'https://a.klaviyo.com/api/metrics';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/vnd.api+json',
            revision: '2024-10-15',
            Authorization: `Klaviyo-API-Key ${privateKey}`

        }
    };
    return await fetch(url, options)
        .then(res => res.json())
        .then(json => {

            const result = json.data && json.data
                .filter(item => {
                    return item.attributes.name === params
                })
                .map(item => item.id)[0];
            return result

        })
        .catch(err => logger.error(err));
}

const checkKlaviyo = async (authKey, params) => {
    return fetch(`https://a.klaviyo.com/api/profiles/?filter=equals(email,'${params?.customerEmail}')`, {
        method: 'GET',
        headers: {
            Accept: 'application/vnd.api+json',
            Revision: '2025-04-15',
            'Content-Type': 'application/vnd.api+json',
            Authorization: `Klaviyo-API-Key ${authKey}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            return data?.data?.[0]?.id || null; // Returns null if not found
        })
        .catch(error => {
            console.error('Error fetching profile:', error);
            return null; // Graceful fallback
        });
};

const checkListExits = async (authKey) => {
    let allData = [];
    let nextUrl = 'https://a.klaviyo.com/api/lists';
    const headers = {
        accept: 'application/vnd.api+json',
        revision: '2025-04-15',
        'content-type': 'application/vnd.api+json',
        Authorization: `Klaviyo-API-Key ${authKey}` // Replace with your actual key
    };
    try {
        while (nextUrl) {
            const response = await fetch(nextUrl, { method: 'GET', headers });
            const result = await response.json();
            if (result.data) {
                allData = allData.concat(result.data);
            }
            nextUrl = result.links?.next || null;
        }
        const isWGUserlistMissing = allData.find(data => data?.attributes?.name === 'WG-Userlist');
        if (isWGUserlistMissing !== undefined) {
            return { id: isWGUserlistMissing.id, type: false }
        } else {
            return { type: true }
        }
    } catch (err) {
        console.error('Error fetching lists:', err);
    }
}

const createListKlaviyo = async (authKey) => {
    let url = 'https://a.klaviyo.com/api/lists';
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/vnd.api+json',
            revision: '2025-04-15',
            'content-type': 'application/vnd.api+json',
            Authorization: `Klaviyo-API-Key ${authKey}`
        },
        body: '{"data":{"type":"list","attributes":{"name":"WG-Userlist"}}}'
    };
    fetch(url, options)
        .then(res => res.json())
        .then(json => { id: json?.data?.id })
        .catch(err => console.error(err));
}

const addProfileToList = async (authKey, listId, email, profileId) => {
    try {
        const addToListRes = await fetch(`https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`, {
            method: 'POST',
            headers: {
                accept: 'application/vnd.api+json',
                revision: '2025-04-15',
                'content-type': 'application/vnd.api+json',
                Authorization: `Klaviyo-API-Key ${authKey}`
            },
            body: JSON.stringify({
                data: [
                    {
                        type: "profile",
                        id: profileId
                    }
                ]
            })
        });
        if (!addToListRes.ok) {
            const errorText = await addToListRes.text();
            throw new Error(`Failed to add to list: ${addToListRes.status} - ${errorText}`);
        }
        if (addToListRes.status !== 204) {
            const addedData = await addToListRes.json();
        } else {
        }
    } catch (error) {
        console.error("🚫 Error:", error);
    }
};

const checkEmailSubscribeOrNot = (data, authKey) => {
    const { customerEmail } = data;
    fetch(`https://a.klaviyo.com/api/profiles/?filter=equals(email,"${customerEmail}")`, {
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
                subscribeUser(customerEmail, authKey);
            }
        })
        .catch(err => console.error('Error checking subscription:', err));
}

async function KlaviyoIntegrationFxn(req, params, checkKlaviyoRecordExist, checkQuery) {
    const checkMetricesExistOrNot = await checkMetricesExist(checkKlaviyoRecordExist[0]?.private_key, params)
    const checkEventRecordExist = await checkEventRecord(checkKlaviyoRecordExist[0]?.private_key, checkMetricesExistOrNot, checkQuery === "byQuery" ? req : req.body)
    await checkEmailSubscribeOrNot(checkQuery === "byQuery" ? req : req.body, checkKlaviyoRecordExist[0]?.private_key);
    // if (checkEventRecordExist.length === 0) {
    await KlaviyoCreateEvent(checkQuery === "byQuery" ? req : req.body, checkKlaviyoRecordExist[0]?.private_key, params);
    if (params === "Wishlist Guru - Product Added") {
        let klaviyoList = await checkListExits(checkKlaviyoRecordExist[0]?.private_key)
        if (klaviyoList.type) {
            klaviyoList = await createListKlaviyo(checkKlaviyoRecordExist[0]?.private_key)
        }
        const profileId = await checkKlaviyo(checkKlaviyoRecordExist[0]?.private_key, checkQuery === "byQuery" ? req : req.body)
        await addProfileToList(checkKlaviyoRecordExist[0]?.private_key, klaviyoList?.id, checkQuery === "byQuery" ? req : req.body, profileId)
    }
    // }
}

async function updateWishlistItems(oldId, newId) {
    try {
        const oldProducts = await getProducts(oldId);
        const newProducts = await getProducts(newId);
        if (oldProducts.length > 0) {
            if (newProducts.length > 0) {
                // Merge product quantities where matching product_id
                await mergeProductQuantities(oldId, newId);
                // Delete duplicates from new wishlist
                await deleteDuplicateProducts(newId, oldId);
                // Move remaining newId products to oldId
                await moveProducts(newId, oldId);
            }
            // Move cart items similarly
            await handleCartMerge(oldId, newId);
            // Now that everything is merged, delete items in wishlist_items table first
            await deleteWishlistItems(newId);
            // Then delete the new wishlist
            await deleteWishlist(newId);
        } else {
            // Old wishlist is empty, just remove new wishlist
            await deleteWishlistItems(newId);
            await deleteWishlist(newId);
        }
    } catch (err) {
        console.log("Error in updateWishlistItems:", err);
    }
}

async function getProducts(wishlistId) {
    try {
        const selectQuery = `SELECT * FROM ${product_table} WHERE wishlist_id = ?`;
        const [result] = await database.query(selectQuery, [wishlistId]);
        return result;
    } catch (err) {
        console.error("Error fetching products:", err);
        throw err;
    }
}

async function mergeProductQuantities(oldId, newId) {
    try {
        const updateQuery = `UPDATE ${product_table} AS w1 JOIN ${product_table} AS w2 ON w1.product_id = w2.product_id AND w2.wishlist_id = ? SET w1.quantity = w1.quantity + w2.quantity WHERE w1.wishlist_id = ?`;
        await database.query(updateQuery, [oldId, newId]);
    } catch (err) {
        console.error("Error merging product quantities:", err);
        throw err;
    }
}

async function deleteDuplicateProducts(newId, oldId) {
    try {
        const deleteQuery = `DELETE FROM ${product_table} WHERE wishlist_id = ? AND product_id IN ( SELECT product_id FROM ( SELECT product_id FROM ${product_table} WHERE wishlist_id = ? ) AS temp )`;
        await database.query(deleteQuery, [newId, oldId]);
    } catch (err) {
        console.error("Error deleting duplicate products:", err);
        throw err;
    }
}

async function moveProducts(fromId, toId) {
    try {
        const updateQuery = `UPDATE ${product_table} SET wishlist_id = ? WHERE wishlist_id = ?`;
        await database.query(updateQuery, [toId, fromId]);
    } catch (err) {
        console.error("Error moving products:", err);
        throw err;
    }
}

async function deleteWishlistItems(wishlistId) {
    const table = "wishlist_items";
    try {
        const deleteQuery = `DELETE FROM ${table} WHERE wishlist_id = ?`;
        await database.query(deleteQuery, [wishlistId]);
    } catch (err) {
        console.error("Error deleting wishlist items:", err);
        throw err;
    }
}

async function deleteWishlist(wishlistId) {
    try {
        const deleteQuery = `DELETE FROM ${Wishlist_table} WHERE wishlist_id = ?`;
        await database.query(deleteQuery, [wishlistId]);
    } catch (err) {
        console.error("Error deleting wishlist:", err);
        throw err;
    }
}

async function handleCartMerge(oldId, newId) {
    const oldCart = await getCartItems(oldId);
    const newCart = await getCartItems(newId);

    if (oldCart.length && newCart.length) {
        for (const newItem of newCart) {
            const match = oldCart.find(item => item.product_id === newItem.product_id);
            if (match) {
                const combinedQty = match.quantity + newItem.quantity;

                await updateCartQuantity(oldId, newItem.product_id, combinedQty);
                await deleteCartItem(newId, newItem.product_id);
            } else {
                await moveCartItem(newId, oldId, newItem.product_id);
            }
        }
    } else if (!oldCart.length && newCart.length) {
        await moveAllCartItems(newId, oldId);
    }
}

async function getCartItems(wishlistId) {
    try {
        const selectQuery = `SELECT * FROM ${cart_table} WHERE wishlist_id = ?`;
        const [result] = await database.query(selectQuery, [wishlistId]);
        return result;
    } catch (err) {
        console.error("Error fetching cart items:", err);
        throw err;
    }
}

async function updateCartQuantity(wishlistId, productId, quantity) {
    try {
        const updateQuery = `UPDATE ${cart_table} SET quantity = ? WHERE wishlist_id = ? AND product_id = ?`;
        await database.query(updateQuery, [quantity, wishlistId, productId]);
    } catch (err) {
        console.error("Error updating cart quantity:", err);
        throw err;
    }
}

async function deleteCartItem(wishlistId, productId) {
    try {
        const deleteQuery = `DELETE FROM ${cart_table} WHERE wishlist_id = ? AND product_id = ?`;
        await database.query(deleteQuery, [wishlistId, productId]);
    } catch (err) {
        console.error("Error deleting cart item:", err);
        throw err;
    }
}

async function moveCartItem(fromId, toId, productId) {
    try {
        const updateQuery = `UPDATE ${cart_table} SET wishlist_id = ? WHERE wishlist_id = ? AND product_id = ?`;
        await database.query(updateQuery, [toId, fromId, productId]);
    } catch (err) {
        console.error("Error moving cart item:", err);
        throw err;
    }
}

async function moveAllCartItems(fromId, toId) {
    try {
        const updateQuery = `UPDATE ${cart_table} SET wishlist_id = ? WHERE wishlist_id = ?`;
        await database.query(updateQuery, [toId, fromId]);
    } catch (err) {
        console.error("Error moving all cart items:", err);
        throw err;
    }
}

export const getReportAllItems = async (req, res) => {
    try {
        const { shopName, customerEmail } = req.body;
        const userIdQuery = `SELECT wt.wishlist_id AS id FROM ${Wishlist_table} AS wt INNER JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id WHERE u.shop_name = ? AND u.email = ?`;
        const [getUserId] = await database.query(userIdQuery, [shopName, customerEmail]);
        if (getUserId.length !== 0) {
            let wishlistId = getUserId[0].id;
            const getAllItemsQuery = `SELECT * FROM ${product_table} WHERE wishlist_id = ?`;
            const [getAllItems] = await database.query(getAllItemsQuery, [wishlistId]);
            if (!res.headersSent) {
                res.json({ data: getAllItems });
            }
        } else {
            if (!res.headersSent) {
                res.json({ data: [] });
            }
        }
    } catch (error) {
        console.error("Error in getReportAllItems:", error);
        logger.error(error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

export const getIdFromEmail = async (req, res) => {
    try {
        const { email, shopName } = req.body;
        const selectQuery = `SELECT wt.wishlist_user_id AS id FROM ${Wishlist_table} AS wt INNER JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id WHERE u.email = ? AND u.shop_name = ?`;
        const [result] = await database.query(selectQuery, [email, shopName]);
        if (!res.headersSent) {
            return res.json({ data: result, msg: "get_id" });
        }
    } catch (err) {
        console.error(err);
        logger.error(err);
        if (!res.headersSent) {
            return res.status(500).json({ error: "Failed to fetch ID from email." });
        }
    }
};

export const getSharedWishlist = async (req, res) => {
    let getId = req.headers["wg-user-id"];
    if (!getId || getId === "undefined") {
        return res.json({ data: [], msg: "no_record_found" });
    }
    const fixedInput = fixBase64Padding1(getId);
    let extractedId;
    try {
        extractedId = atob(fixedInput);
    } catch (e) {
        console.error("Base64 decoding failed:", e);
        return res.status(400).json({ data: [], msg: "invalid_user_id_format" });
    }
    try {
        // const getWishlistQuery = `SELECT wishlist_id as id, wishlist_name AS name FROM ${Wishlist_table} WHERE wishlist_user_id = ?`;
        const getWishlistQuery = `SELECT w.wishlist_id as id, w.wishlist_name AS name FROM wishlist as w, wishlist_users as wu WHERE wu.id = w.wishlist_user_id AND wu.shop_name = ? AND w.wishlist_user_id = ?;`
        const [allWishlists] = await database.query(getWishlistQuery, [req.body.shopName, extractedId]);
        const itemPromises = allWishlists.map(item => {
            const getItemsQuery = `SELECT * FROM ${product_table} WHERE wishlist_id = ?`;
            return database.query(getItemsQuery, [item.id])
                .then(([wishlistItems]) => ({
                    [item.name]: wishlistItems,
                    id: item.id
                }));
        });
        const getAllItemArr = await Promise.all(itemPromises);
        if (getAllItemArr.length > 0) {
            res.json({ data: getAllItemArr, msg: "get_shared_wishlist" });
        } else {
            res.json({ data: [], msg: "no_record_found" });
        }
    } catch (error) {
        console.error("Database error:", error);
        if (!res.headersSent) {
            res.status(500).json({ data: [], msg: "internal_error" });
        }
    }
};

export const addToMyWishlist = async (req, res) => {
    try {
        const { customerEmail, shopName, productId } = req.body;
        const userIdQuery = `SELECT wt.wishlist_id AS id FROM ${Wishlist_table} AS wt INNER JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id WHERE u.email = ? AND u.shop_name = ?`;
        const [userID] = await database.query(userIdQuery, [customerEmail, shopName]);
        if (userID.length === 0) {
            return res.json({ msg: "not a valid user" });
        }
        const selectedWishlistId = userID[0].id;
        const itemCheckQuery = `SELECT variant_id FROM ${product_table} WHERE product_id = ? AND wishlist_id = ?`;
        const [variantID] = await database.query(itemCheckQuery, [productId, selectedWishlistId]);
        if (variantID.length === 0) {
            addProduct(req, res, selectedWishlistId); // Assuming addProduct handles the final response
        } else {
            return res.json({ msg: "already added" });
        }
    } catch (err) {
        console.error("Error in addToMyWishlist:", err);
        logger.error(err);
        if (!res.headersSent) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const { shopName } = req.body;
        let mainQuery = `SELECT u.*, w.*,
                (SELECT COUNT(*) FROM ${product_table} AS wt WHERE u.id = w.wishlist_user_id AND wt.wishlist_id = w.wishlist_id) AS item_count,
                (SELECT COUNT(*) FROM ${cart_table} AS ct WHERE u.id = w.wishlist_user_id AND w.wishlist_id = ct.wishlist_id) AS cart_count
            FROM ${user_table} AS u
            JOIN ${Wishlist_table} AS w ON u.id = w.wishlist_user_id WHERE u.shop_name = ?`;
        const [mainResult] = await database.query(mainQuery, [shopName]);
        if (!res.headersSent) {
            res.json({ mainResult: mainResult });
        }
    } catch (err) {
        console.error("Error in getAllUsers:", err);
        logger.error(err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to fetch all users." });
        }
    }
};

export const getAllUsersCount = async (req, res) => {
    try {
        const { shopName } = req.body;
        const mainQuery = `SELECT w.*, u.*, 
                (SELECT COUNT(*) FROM ${product_table} AS wt WHERE u.id = w.wishlist_user_id AND wt.wishlist_id = w.wishlist_id) AS item_count 
            FROM ${user_table} AS u 
            JOIN ${Wishlist_table} AS w ON u.id = w.wishlist_user_id WHERE u.shop_name = ?;`;
        const [result] = await database.query(mainQuery, [shopName]);
        console.log("result", result)
        if (!res.headersSent) {
            res.json({ data: result });
        }
    } catch (err) {
        console.error("Error in getAllUsersCount:", err);
        logger.error(err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to fetch user counts." });
        }
    }
};

export const getCurrentPlanSql = async (req, res) => {
    let roughToken = "";
    const shopName = req.body.shopName;
    console.log("shopName", shopName)
    const wfGetDomain = req.body.wfGetDomain;
    const normalDomain = req.body.normalDomain;
    const customerEmail = req.headers["wg-user"];
    try {
        const userIdQuery = `
            SELECT id 
            FROM wishlist_users 
            WHERE shop_name = ? AND email = ?
        `;
        const [getUserId] = await database.query(userIdQuery, [shopName, customerEmail]);
        if (getUserId.length > 0) {
            const userId = getUserId[0].id;
            let token = req.headers["wg-api-key"];
            if (
                !token ||
                token === "null" ||
                token === undefined ||
                token.trim() === "" ||
                !isValidToken(token)
            ) {
                roughToken = await generateToken(userId);
            } else {
                roughToken = token;
            }
        }
        const planQuery = `
            SELECT active_plan_id 
            FROM app_installation 
            WHERE shop_name = ?
        `;
        const [planResult] = await database.query(planQuery, [shopName]);
        const activePlanId = planResult[0]?.active_plan_id || 1;
        const langUrl = activePlanId > 2 ? wfGetDomain : `https://${normalDomain}/`;
        const langQuery = `
            SELECT s.translations 
            FROM ${store_languages_table} AS s
            INNER JOIN ${store_languages_url_table} AS su 
                ON s.lang_id = su.lang_id
            WHERE s.shop_name = ? AND su.url = ?
        `;
        const [languageData] = await database.query(langQuery, [shopName, langUrl]);
        console.log("language", languageData)
        res.json({
            planData: planResult.length > 0 ? planResult : [{ active_plan_id: 1 }],
            languageData,
            token: roughToken,
        });
    } catch (err) {
        console.error("Error in getCurrentPlanSql:", err);
        logger.error(err);
        if (!res.headersSent) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

export const deleteUser = async (req, res) => {
    const { wishlistId } = req.body;
    if (!wishlistId) {
        return res.status(400).json({ error: "Missing wishlistId in request body." });
    }
    try {
        await new Promise((resolve, reject) => {
            const deleteProductsQuery = `DELETE FROM ${product_table} WHERE wishlist_id = ?;`;
            database.query(deleteProductsQuery, [wishlistId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        res.json({ msg: "user deleted" });
    } catch (err) {
        console.error("Error deleting wishlist items:", err);
        logger.error(err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to delete wishlist items." });
        }
    }
};

export const adminDataWithDate = async (req, res) => {
    try {
        const { shopName, startDate, endDate, currentPlan } = req.body;
        const [selectedDateItems] = await database.query(
            `SELECT w.title, u.email 
             FROM ${user_table} AS u, ${Wishlist_table} AS wt, ${product_table} AS w
             WHERE u.shop_name = ? 
             AND u.id = wt.wishlist_user_id 
             AND wt.wishlist_id = w.wishlist_id
             AND w.created_at >= ?
             AND CAST(w.created_at AS DATE) <= ?`,
            [shopName, startDate, endDate]
        );
        const [selectedDateUsers] = await database.query(
            `SELECT u.email 
             FROM ${user_table} AS u 
             WHERE u.shop_name = ? 
             AND u.created_at >= ?
             AND CAST(u.created_at AS DATE) <= ?`,
            [shopName, startDate, endDate]
        );
        const [selectedDateRevenue] = await database.query(
            `SELECT COUNT(*) AS count,
                    IFNULL(SUM(ci.price * ci.quantity), 0) AS amount
             FROM ${user_table} AS w,
                  ${Wishlist_table} AS wt,
                  ${cart_table} AS ci
             WHERE w.shop_name = ?
             AND w.id = wt.wishlist_user_id
             AND wt.wishlist_id = ci.wishlist_id
             AND ci.created_at >= ?
             AND CAST(ci.created_at AS DATE) <= ?`,
            [shopName, startDate, endDate]
        );
        const [planDetails] = await database.query(
            `SELECT * FROM ${plan_table} WHERE plan_id = ?`,
            [currentPlan]
        );
        res.json({
            selectedDate: selectedDateItems,
            selectedDateUsers,
            selectedDateRevenue,
            planDetails,
        });
    } catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

export const apiPlanId = async (req, res) => {
    try {
        const { currentplanName } = req.body;
        const [planDetails] = await database.query(`SELECT * FROM ${plan_table} WHERE name = ?`,
            [currentplanName]
        );
        res.send({ currentPlanData: planDetails });
    } catch (err) {
        console.log(err);
        logger.error(err);
        res.status(500).send({ error: "Something went wrong" });
    }
};

const adminCache = {};
const CACHE_TTL = 2 * 60 * 1000;

setInterval(() => {
    const now = Date.now();
    for (const key in adminCache) {
        if (now - adminCache[key].time > CACHE_TTL) {
            delete adminCache[key];
        }
    }
}, 60 * 1000);

function getCache(key) {
    const item = adminCache[key];
    if (!item) return null;
    if (Date.now() - item.time > CACHE_TTL) {
        delete adminCache[key];
        return null;
    }
    return item.data;
}

function setCache(key, data) {
    adminCache[key] = { time: Date.now(), data };
}

export const adminTopDataRecentData = async (req, res) => {
    try {
        const { shopName } = req.body;
        const cacheKey = `top_recent_${shopName}`;
        const cached = getCache(cacheKey);
        if (cached) return res.json(cached);
        const [topData] = await database.query(
            `SELECT COUNT(w.title) AS totalCount, w.handle AS handle, w.title AS title, w.image AS image, w.variant_id AS variant_id, w.product_id AS product_id
             FROM ${user_table} AS u,
                  ${Wishlist_table} AS wt,
                  ${product_table} AS w
             WHERE u.shop_name = ? AND u.id = wt.wishlist_user_id AND wt.wishlist_id = w.wishlist_id
             GROUP BY w.title ORDER BY totalCount DESC LIMIT 10`,
            [shopName]
        );
        const [recentData] = await database.query(
            `SELECT DISTINCT
                    w.variant_id,
                    w.title,
                    w.handle,
                    w.image,
                    w.product_id
             FROM ${user_table} AS u, ${Wishlist_table} AS wt, ${product_table} AS w
             WHERE u.shop_name = ? AND u.id = wt.wishlist_user_id AND wt.wishlist_id = w.wishlist_id
             ORDER BY w.created_at DESC LIMIT 10`,
            [shopName]
        );
        const response = { topData, recentData };
        setCache(cacheKey, response);
        res.json(response);
    } catch (err) {
        console.log(err);
        logger.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

export const adminTopDataWithDates = async (req, res) => {
    try {
        const { shopName } = req.body;
        const cacheKey = `top_with_dates_${shopName}`;
        const cached = getCache(cacheKey);
        if (cached) return res.json(cached);
        const sqlQuery = `
            SELECT COUNT(w.title) AS totalCount,
                   w.handle AS handle,
                   w.title AS title,
                   w.image AS image
            FROM ${user_table} AS u, ${Wishlist_table} AS wt, ${product_table} AS w
            WHERE u.shop_name = ?
              AND u.id = wt.wishlist_user_id
              AND wt.wishlist_id = w.wishlist_id
              AND w.created_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
            GROUP BY w.title ORDER BY totalCount ASC;
        `;
        const sqlQuery2 = `
            SELECT COUNT(w.title) AS totalCount,
                   w.handle AS handle,
                   w.title AS title,
                   w.image AS image
            FROM ${user_table} AS u, ${Wishlist_table} AS wt, ${product_table} AS w
            WHERE u.shop_name = ?
              AND u.id = wt.wishlist_user_id
              AND wt.wishlist_id = w.wishlist_id
            GROUP BY w.title ORDER BY totalCount ASC;
        `;
        const [topData] = await database.query(sqlQuery, [shopName]);
        const [topAllData] = await database.query(sqlQuery2, [shopName]);
        const response = { data: topData, topAllData };
        setCache(cacheKey, response);
        res.json(response);
    } catch (err) {
        console.log(err);
        logger.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

export const adminGraphDataMonthly = async (req, res) => {
    try {
        const { shopName, prevOneMonth, currentDate } = req.body;
        const cacheKey = `graph_month_${shopName}`;
        const cached = getCache(cacheKey);
        if (cached) return res.json(cached);
        const [lastMonthItems] = await database.query(
            `SELECT DATE(w.created_date) AS date, COUNT(w.created_date) AS total_count
             FROM ${user_table} AS u
             INNER JOIN ${Wishlist_table} AS wt ON u.id = wt.wishlist_user_id
             INNER JOIN ${product_table} AS w ON wt.wishlist_id = w.wishlist_id
             WHERE u.shop_name = ? AND w.created_date >= ? AND CAST(w.created_date AS DATE) <= ?
             GROUP BY DATE(w.created_date) ORDER BY DATE(w.created_date)`,
            [shopName, prevOneMonth, currentDate]
        );
        const [lastMonthUsers] = await database.query(
            `SELECT DATE(created_at) AS date, COUNT(created_at) AS total_count
             FROM ${user_table}
             WHERE shop_name = ? AND created_at >= ? AND DATE(created_at) <= ?
             GROUP BY DATE(created_at) ORDER BY DATE(created_at)`,
            [shopName, prevOneMonth, currentDate]
        );
        const response = { lastMonthItems, lastMonthUsers };
        setCache(cacheKey, response);
        res.json(response);
    } catch (err) {
        console.log(err);
        logger.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

export const adminGraphDataYearly = async (req, res) => {
    try {
        const { shopName } = req.body;
        const cacheKey = `graph_year_${shopName}`;
        const cached = getCache(cacheKey);
        if (cached) return res.json(cached);
        const [lastYearUsers] = await database.query(
            `SELECT created_at AS date, COUNT(created_at) AS count
             FROM ${user_table}
             WHERE shop_name = ? AND created_at > NOW() - INTERVAL 12 MONTH
             GROUP BY DATE_FORMAT(created_at, '%M')
             ORDER BY created_at ASC`,
            [shopName]
        );
        const [lastYearItems] = await database.query(
            `SELECT w.created_date AS date, COUNT(w.created_date) AS count
             FROM ${user_table} AS u, ${Wishlist_table} AS wt, ${product_table} AS w
             WHERE u.shop_name = ? AND u.id = wt.wishlist_user_id AND wt.wishlist_id = w.wishlist_id AND w.created_date > NOW() - INTERVAL 12 MONTH
             GROUP BY DATE_FORMAT(w.created_date, '%M')
             ORDER BY w.created_date ASC`,
            [shopName]
        );
        const response = { lastYearUsers, lastYearItems };
        setCache(cacheKey, response);
        res.json(response);
    } catch (err) {
        console.log(err);
        logger.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

export const getPlanName = async (req, res) => {
    try {
        const { id } = req.body;
        const [result] = await database.query(`SELECT * FROM plan WHERE plan_id = ?`,
            [id]);
        res.send({ data: result });
    } catch (err) {
        console.log(err);
        logger.error(err);
        res.status(500).send({ error: "Something went wrong" });
    }
};

export const getPlanData = async (req, res) => {
    try {
        const session = await shopify.config.sessionStorage.findSessionsByShop(
            req?.query?.domain
        );
        const [result] = await database.query(`SELECT * FROM plan`);
        res.send({ data: result });
    } catch (err) {
        console.log(err);
        logger.error(err);
        res.status(500).send({ error: "Something went wrong" });
    }
};

export const requestFormMain = async (req, res) => {
    const emailData = req.body;
    let emailContent = {
        from: emailData.storeAdminEmail,
        to: supportEmail,
        subject: `Wishlist guru ${emailData.subject} `,
        html: `<p>Store domain : ${emailData.storeDomain} </p>
    <p>Store Email : ${emailData.storeAdminEmail} </p>
    <p>Message : ${emailData.message} </p>
    `,
    };
    const emailMsg = await sendEmail(emailContent);
    res.send({ msg: "Email sent successfully" });
};

export const emailReminderChecksUpdate = async (req, res) => {
    try {
        const { shopName, emailOption, selectedDate, backInStockMail, lowInStockMail, priceDropMail } = req.body;
        const [installRows] = await database.query(`SELECT app_install_id FROM app_installation WHERE shop_name = ?`,
            [shopName]);
        if (installRows.length === 0) {
            return res.send({ msg: "shop_name not found" });
        }
        const appInstallId = installRows[0].app_install_id;
        const [updateResult] = await database.query(`UPDATE email_reminder SET email_option = ?, selected_date = ?,  back_in_stock = ?, low_in_stock = ?, price_drop = ? WHERE app_install_id = ?`,
            [
                emailOption,
                selectedDate,
                backInStockMail,
                lowInStockMail,
                priceDropMail,
                appInstallId
            ]
        );
        res.send({ data: updateResult, msg: "data_updated" });
    } catch (err) {
        console.log(err);
        logger.error(err);
        res.status(500).send({ msg: "Something went wrong" });
    }
};

export const getEmailReminderAndStoreLanguage = async (req, res) => {
    try {
        const { shopName } = req.body;
        const [emailData] = await database.query(`SELECT * FROM email_reminder WHERE shop_name = ?`, [shopName]);
        const [languageData] = await database.query(`SELECT sl.lang_id, sl.lang_name, slu.type FROM store_languages AS sl JOIN store_languages_url AS slu ON sl.lang_id = slu.lang_id WHERE sl.shop_name = ?`,
            [shopName]
        );
        res.send({ emailData: emailData, languageData: languageData });
    } catch (err) {
        console.log(err);
        logger.error(err);
        res.status(500).send({ msg: "Something went wrong" });
    }
};

export const cleanDbData = async (req, res) => {
    try {
        const [allStores] = await database.query(`SELECT shop_name FROM ${app_installation_table} WHERE updated_date <= CURDATE() - INTERVAL 30 DAY AND status = 'inActive' AND clean_status = 'not_done'`);
        if (allStores.length) {
            for (const store of allStores) {
                // await deleteUserDataAtUninstallation(store.shop_name);
                // await database.query(
                //     `UPDATE ${app_installation_table} 
                //      SET clean_status = "done" 
                //      WHERE shop_name = ?`,
                //     [store.shop_name]
                // );
            }
        }
        res.status(200).json({ msg: "Deleted successfully" });
    } catch (error) {
        console.log(error);
        logger.error(error.message);
        res.status(500).json({
            error: "An error occurred while deleting data after 30 days",
            details: error.message,
        });
    }
};

export const getEmailReminderChecks = async (req, res) => {
    const { shopName } = req.body;
    try {
        const mainSelectQuery = `
            SELECT er.id, er.logo, er.email_option, er.selected_date, er.back_in_stock, 
                   er.low_in_stock, er.price_drop, er.shop_name
            FROM app_installation AS ai
            JOIN email_reminder AS er ON ai.app_install_id = er.app_install_id
            WHERE ai.shop_name = ?
        `;
        const [mainResult] = await database.query(mainSelectQuery, [shopName]);
        const getInstallationQuery = `
            SELECT app_install_id, date, shop_email
            FROM app_installation
            WHERE shop_name = ?
        `;
        const [installationData] = await database.query(getInstallationQuery, [shopName]);
        if (!installationData.length) {
            return res.status(404).json({ msg: "Store not found" });
        }
        const { app_install_id, date, shop_email } = installationData[0];
        if (mainResult.length === 0) {
            const insertQuery = `
                INSERT INTO ${email_reminder_table} 
                (app_install_id, email_option, selected_date, back_in_stock, low_in_stock, price_drop, shop_name)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const [insertResult] = await database.query(insertQuery, [
                app_install_id,
                "turnOff",
                `DAY(${date})`,
                "no",
                "no",
                "no",
                shopName,
            ]);
            if (shop_email) {
                ["backInStock", "lowInStock", "priceDrop", "weeklyEmail"].forEach((key) => {
                    if (
                        typeof req.body[key] === "string" &&
                        req.body[key].includes("support@webframez.com")
                    ) {
                        req.body[key] = req.body[key].replace(
                            /support@webframez\.com/g,
                            shop_email
                        );
                    }
                });
            }
            await addTempData(req, res, insertResult.insertId);
            return res.send({
                data: {
                    email_option: "turnOff",
                    back_in_stock: "no",
                    low_in_stock: "no",
                    price_drop: "no",
                    logo: null,
                },
                app_install_id,
                msg: "inserted_data",
            });
        }
        if (!mainResult[0].shop_name) {
            const updateQuery = `
                UPDATE ${email_reminder_table}
                SET shop_name = ?
                WHERE app_install_id = ?
            `;
            await database.query(updateQuery, [shopName, app_install_id]);
        }
        const templateQuery = `
            SELECT se.temp_id, se.sender_name, se.reply_to,
                   se.back_in_stock_temp, se.low_in_stock_temp, 
                   se.price_drop_temp, se.weekly_email_temp
            FROM ${email_reminder_table} AS er
            INNER JOIN ${store_email_temp_table} AS se ON se.id = er.id
            WHERE er.shop_name = ?
        `;
        const [templateResult] = await database.query(templateQuery, [shopName]);
        if (templateResult.length === 0) {
            await addTempData(req, res, mainResult[0].id);
        }
        return res.send({
            data: mainResult,
            data2: templateResult,
            app_install_id,
            msg: "getting_data",
        });
    } catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

function addTempData(req, res, id) {
    try {
        const { backInStock, lowInStock, priceDrop, weeklyEmail, shopName, language } = req.body;
        const insertQuery = `INSERT INTO ${store_email_temp_table} (id, shop_name, language, back_in_stock_temp, low_in_stock_temp, price_drop_temp, weekly_email_temp) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const values = [id, shopName, language, backInStock, lowInStock, priceDrop, weeklyEmail,];
        database.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error(err);
                logger.error(err);
            }
        });
    } catch (err) {
        console.error(err);
        logger.error(err);
    }
}

export const getEmailTempData = async (req, res) => {
    try {
        const { shopName, language } = req.body;
        const mainSelectQuery = `
            SELECT 
                se.temp_id, 
                se.sender_name, 
                se.reply_to, 
                se.back_in_stock_temp, 
                se.low_in_stock_temp, 
                se.price_drop_temp, 
                se.weekly_email_temp
            FROM ${email_reminder_table} AS er 
            INNER JOIN ${store_email_temp_table} AS se 
                ON se.id = er.id 
            WHERE er.shop_name = ? AND se.language = ?
        `;
        const [mainResult] = await database.query(mainSelectQuery, [
            shopName,
            language,
        ]);
        return res.send({
            data: mainResult,
            msg: "inserted_data",
        });
    } catch (err) {
        console.error(err);
        logger.error(err);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const emailTemplateUpdate = async (req, res) => {
    try {
        const { shopName, tempName, tempClm, tempId } = req.body;
        let updateQuery;
        if (tempClm === "PriceDrop") {
            updateQuery = `
                UPDATE ${store_email_temp_table}
                SET price_drop_temp = ?
                WHERE shop_name = ? AND temp_id = ?
            `;
        } else if (tempClm === "LowInStock") {
            updateQuery = `
                UPDATE ${store_email_temp_table}
                SET low_in_stock_temp = ?
                WHERE shop_name = ? AND temp_id = ?
            `;
        } else if (tempClm === "BackInStock") {
            updateQuery = `
                UPDATE ${store_email_temp_table}
                SET back_in_stock_temp = ?
                WHERE shop_name = ? AND temp_id = ?
            `;
        } else {
            updateQuery = `
                UPDATE ${store_email_temp_table}
                SET weekly_email_temp = ?
                WHERE shop_name = ? AND temp_id = ?
            `;
        }
        const [result] = await database.query(updateQuery, [
            tempName,
            shopName,
            tempId
        ]);
        return res.send({
            data: result,
            msg: "Data Updated",
        });
    } catch (err) {
        console.error(err);
        logger.error(err);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const saveSenderReceiverName = async (req, res) => {
    try {
        const { shopName, senderName, replyToEmail } = req.body;
        const updateQuery = `
            UPDATE store_email_templates
            SET sender_name = ?, reply_to = ?
            WHERE shop_name = ?
        `;
        await database.query(updateQuery, [
            senderName,
            replyToEmail,
            shopName
        ]);
        return res.send({ msg: "data_updated" });
    } catch (err) {
        console.error(err);
        logger.error(err);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const getEmailReportsData = async (req, res) => {
    const { shopName, startDate, endDate, emailType, isDates, isType } = req.body;
    let dateQuery = "";
    let typeQuery = "";
    if (isDates) {
        dateQuery += ` AND date >= ? AND DATE(date) <= ?`;
    }
    if (isType) {
        typeQuery += ` AND email_type = ?`;
    }
    const quotaQuery = `SELECT p.email_quota FROM app_installation AS a JOIN plan AS p ON a.active_plan_id = p.plan_id WHERE a.shop_name = ?`;
    database.query(quotaQuery, [shopName], async (err, emailQuotaRes) => {
        if (err) {
            console.error(err);
            logger.error(err);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
        try {
            let values = [shopName];
            if (isDates) {
                values.push(startDate, endDate);
            }
            if (isType) {
                values.push(emailType);
            }
            const mainSelectQuery = `SELECT * FROM ${email_reports_table} WHERE shop_name = ? ${dateQuery} ${typeQuery} ORDER BY date DESC`;
            const mainResult = await database.query(mainSelectQuery, [shopName]);
            res.send({
                mainResult,
                msg: "date fetched",
                emailQuota: emailQuotaRes
            });
        } catch (err) {
            console.error(err);
            logger.error(err);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    });
};

export const sendWishlistQuotaLimitMails = async (req, res) => {
    try {
        const sqlQuery = `
            SELECT 
                wu.shop_name, 
                ai.store_owner, 
                ai.shop_email AS shop_email,
                ai.customer_email AS customer_email, 
                p.name, 
                p.quota, 
                COUNT(wi.title) AS total_items 
            FROM app_installation AS ai
            JOIN wishlist_users AS wu ON ai.shop_name = wu.shop_name
            JOIN wishlist AS wt ON wu.id = wt.wishlist_user_id
            JOIN wishlist_items AS wi ON wt.wishlist_id = wi.wishlist_id
            JOIN plan AS p ON ai.active_plan_id = p.plan_id
            WHERE ai.status = "Active"
            AND MONTH(wi.created_at) = MONTH(CURRENT_DATE())
            AND YEAR(wi.created_at) = YEAR(CURRENT_DATE())
            GROUP BY wu.shop_name;`;
        const [result] = await database.query(sqlQuery);
        if (!result || !result.length) return;
        for (const store of result) {
            let sendMail = false;
            let mailHtml = "";
            const eightyPercent = (store.quota * 80) / 100;
            const currentPercent = (store.total_items / store.quota) * 100;
            if (store.total_items >= eightyPercent && store.total_items < store.quota) {
                sendMail = true;
                mailHtml = eightyPercentLimitEmailHTML(
                    store.name,
                    store.shop_name,
                    currentPercent,
                    store.store_owner
                );
            }
            else if (store.total_items >= store.quota) {
                sendMail = true;
                mailHtml = hundredPercentLimitEmailHTML(
                    store.name,
                    store.shop_name,
                    currentPercent,
                    store.store_owner
                );
                const notifyContent = {
                    from: supportEmail,
                    to: "webframez@gmail.com",
                    subject: `Wishlist Guru – Quota Limit Exceeded of ${store.shop_name}`,
                    html: `
                        Hi,<br><br>
                        The wishlist quota limit has been exceeded for this store.<br><br>
                        <b>Shop Name:</b> ${store.shop_name}<br>
                        <b>Email:</b> ${store.shop_email}<br>
                        <b>Customer Email:</b> ${store.customer_email}<br><br>
                        Thank you.<br>
                        Best regards
                    `,
                };
                sendEmail(notifyContent);
            }
            if (sendMail) {
                const emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (emailRegEx.test(store.shop_email)) {
                    const emailContent = {
                        from: supportEmail,
                        to: store.shop_email,
                        subject: "Your Wishlist Quota limit crossed.. Update Plan NOW!!!",
                        html: mailHtml,
                    };
                    sendEmail(emailContent);
                }
            }
        }
    } catch (err) {
        console.error(err);
        logger.error(err);
        return;
    }
};

export const sendWeeklyWishlistToAdmin = async (req, res) => {
    // const data = database.query(
    //   // `SELECT wu.shop_name, wu.email_option, wu.email, COUNT(DISTINCT wu.email) as total_user, COUNT(wi.title) as total_item FROM ${app_installation_table} as ai, ${user_table} as wu, ${Wishlist_table} as wt, ${product_table} as wi WHERE ai.shop_name=wu.shop_name AND ai.active_plan_id > '1' AND wu.id = wi.wishlist_id AND wi.created_date > now() - INTERVAL 7 day GROUP BY wu.shop_name;`

    //   // `SELECT wu.shop_name, er.email_option, wu.email, COUNT(DISTINCT wu.email) as total_user, COUNT(wi.title) as total_item FROM app_installation as ai, email_reminder as er, wishlist_users as wu, wishlist as wt, wishlist_items as wi WHERE ai.shop_name=wu.shop_name AND ai.app_install_id = er.app_install_id AND ai.active_plan_id > '1' AND wu.id = wt.wishlist_user_id AND wt.wishlist_id = wi.wishlist_id AND wi.created_date > now() - INTERVAL 7 day GROUP BY wu.shop_name;`

    //   `SELECT wu.shop_name, er.email_option, wu.email, COUNT(DISTINCT wu.email) as total_user, COUNT(wi.title) as total_item FROM app_installation as ai, email_reminder as er, wishlist_users as wu, wishlist as wt, wishlist_items as wi WHERE ai.shop_name=wu.shop_name AND ai.app_install_id = er.app_install_id AND er.email_option = "weekly" AND ai.active_plan_id > '1' AND wu.id = wt.wishlist_user_id AND wt.wishlist_id = wi.wishlist_id AND wi.created_date > now() - INTERVAL 7 day GROUP BY wu.shop_name;`,
    //   (err, result) => {
    //     if (err) {
    //       console.log(err);
    //       logger.error(err);
    //     } else {
    //       let mailHtml = ``;
    //       if (result.length > 0) {
    //         // console.log("FFFF ", result);
    //         for (let i = 0; i < result.length; i++) {
    //           if (result[i].email_option === "weekly") {
    //             mailHtml = weeklyWishlistUpdateToAdminHTML(result[i]);
    //             const emailRegEx =
    //               /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    //             const checkEmail = emailRegEx.test(result[i].shop_email);
    //             if (checkEmail) {
    //               let emailContent = {
    //                 from: supportEmail,
    //                 to: result[i].shop_email,
    //                 subject: "Last week update",
    //                 html: mailHtml,
    //               };
    //               sendEmail(emailContent);
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // );
};

export const sendWeeklyWishlistToUser = async (req, res) => {
    // try {
    //   const users = await new Promise((resolve, reject) => {
    //     database.query(
    //       `SELECT w.wishlist_id, wu.email, wu.shop_name, er.logo, er.email_option, ai.app_install_id, ai.active_plan_id as plan
    //        FROM wishlist_users as wu, app_installation as ai, email_reminder as er, wishlist as w
    //        WHERE wu.shop_name = ai.shop_name
    //        AND wu.id = w.wishlist_user_id
    //        AND er.email_option = "weekly"
    //        AND ai.app_install_id = er.app_install_id
    //        AND ai.active_plan_id > '1';`,
    //       (err, results) => {
    //         if (err) {
    //           reject(err);
    //         } else {
    //           resolve(results);
    //         }
    //       }
    //     );
    //   });

    //   if (users.length > 0) {
    //     for (let i = 0; i < users.length; i++) {
    //       const user = users[i];
    //       const {
    //         logo,
    //         app_install_id,
    //         shop_name: shopName,
    //         email_option,
    //         wishlist_id,
    //       } = user;
    //       // const session = await shopify.config.sessionStorage.findSessionsByShop(shopName);
    //       // const countData = await shopify.api.rest.Shop.all({
    //       //   session: session[0],
    //       // });
    //       // const shopDomain = countData.data[0].domain

    //       const shopDomain = shopName;

    //       const emailData = await queryAsync(
    //         `SELECT weekly_email_temp
    //          FROM ${store_email_temp_table} AS se
    //          JOIN ${email_reminder_table} AS er
    //          ON er.id = se.id
    //          AND er.shop_name = ?`,
    //         [shopName]
    //       );

    //       if (email_option === "weekly") {
    //         const userItems = await new Promise((resolve, reject) => {
    //           database.query(
    //             `SELECT title, price, image, handle, variant_id, product_id
    //              FROM ${product_table}
    //              WHERE wishlist_id = ?
    //              AND created_date > NOW() - INTERVAL 7 DAY;`,
    //             [wishlist_id],
    //             (err, results) => {
    //               if (err) {
    //                 reject(err);
    //               } else {
    //                 resolve(results);
    //               }
    //             }
    //           );
    //         });

    //         if (userItems.length > 0) {
    //           let customerData = { name: "Customer", email: user.email };
    //           const emailDatas = JSON.parse(emailData[0].weekly_email_temp);
    //           const mailHtml = await userWishlistTableEmailHTML(
    //             userItems,
    //             customerData,
    //             JSON.parse(emailData[0].weekly_email_temp),
    //             app_install_id,
    //             logo,
    //             shopName,
    //             shopDomain,
    //             databaseQuery
    //           );
    //           const emailRegEx =
    //             /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    //           if (emailRegEx.test(user.email)) {
    //             let emailContent = {
    //               from: supportEmail,
    //               to: user.email,
    //               subject: emailDatas.emailSubject,
    //               html: mailHtml,
    //               logoResult: logo,
    //               app_install_id: app_install_id,
    //             };

    //             await sendEmail(emailContent);
    //           }
    //         }
    //       }
    //     }
    //   }
    //   res.status(200).send("Weekly wishlist email process completed.");
    // } catch (error) {
    //   console.error(error);
    //   res
    //     .status(500)
    //     .send("An error occurred while processing the weekly wishlist.");
    // }
};

export const sendMonthlyWishlistToAdmin = async (req, res) => {
    database.query(
        `SELECT 
            wu.shop_name,
            er.email_option,
            wu.email as shop_email,
            COUNT(DISTINCT wu.email) AS total_user,
            COUNT(wi.title) AS total_item
        FROM 
            app_installation AS ai,
            email_reminder AS er,
            wishlist_users AS wu,
            wishlist AS wt,
            wishlist_items AS wi
        WHERE 
            ai.shop_name = wu.shop_name
            AND ai.app_install_id = er.app_install_id
            AND er.email_option = "monthly"
            AND ai.active_plan_id > '1'
            AND wu.id = wt.wishlist_user_id
            AND wt.wishlist_id = wi.wishlist_id
            AND wi.created_date > NOW() - INTERVAL 30 DAY
        GROUP BY 
            wu.shop_name;`,
        (err, result) => {
            if (err) {
                console.log(err);
                logger.error(err);
                return;
            }
            if (!result || result.length === 0) return;
            result.forEach((row) => {
                if (row.email_option !== "monthly") return;
                const mailHtml = weeklyWishlistUpdateToAdminHTML(row);
                const emailRegEx =
                    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

                if (!emailRegEx.test(row.shop_email)) return;
                const emailContent = {
                    from: supportEmail,
                    to: row.shop_email,
                    subject: "Monthly Wishlist Activity Report",
                    html: mailHtml,
                };
                sendEmail(emailContent);
            });
        }
    );
};

export const sendMonthlyWishlistToUser = async (req, res) => {
    try {
        // --------- GET SHOPS (promise pool version) ----------
        const [getShops] = await database.query(
            `SELECT DISTINCT ai.shop_name, ai.shop_email, er.logo, er.email_option, 
                ai.app_install_id, ai.store_name, ai.active_plan_id AS plan
             FROM wishlist_users AS wu
             JOIN app_installation AS ai ON wu.shop_name = ai.shop_name
             JOIN email_reminder AS er ON ai.app_install_id = er.app_install_id
             JOIN wishlist AS w ON wu.id = w.wishlist_user_id
             LEFT JOIN email_logs AS el ON ai.app_install_id = el.app_install_id
               AND MONTH(el.last_sent) = MONTH(CURDATE())
               AND YEAR(el.last_sent) = YEAR(CURDATE())
             WHERE er.email_option = 'monthly'
               AND er.selected_date = DAY(CURDATE())
               AND ai.status = "Active"
               AND ai.active_plan_id > 1
               AND el.last_sent IS NULL;`
        );

        if (!getShops?.length) {
            return res.status(200).send("No eligible shops found today.");
        }

        for (const user of getShops) {
            const { logo, app_install_id, shop_name: shopName, shop_email: shopEmail, store_name, plan } = user;
            // --------- INSERT EMAIL LOG ----------
            await database.query(`INSERT INTO email_logs (app_install_id, shop_name, last_sent) VALUES (?, ?, NOW())`,
                [app_install_id, shopName]);
            // --------- GET USERS ----------
            const [getUsers] = await database.query(`SELECT email, email_valid FROM wishlist_users WHERE shop_name = ? AND user_type = 'User' AND email_valid = TRUE`,
                [shopName]);
            // --------- GET EMAIL TEMPLATE ----------
            const [emailData] = await database.query(`SELECT se.weekly_email_temp, se.sender_name, se.reply_to FROM ${store_email_temp_table} AS se JOIN ${email_reminder_table} AS er ON er.id = se.id AND er.shop_name = ?`,
                [shopName]);
            // --------- GET SMTP ----------
            const [getSmtpDetail] = await database.query(`SELECT * FROM email_smtp WHERE shop_name=?`,
                [shopName]);
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            const BATCH_SIZE = 50;
            const BATCH_DELAY_MS = 1500;

            // ------------------------------------------------------
            //                 BATCH SENDING
            // ------------------------------------------------------
            for (let i = 0; i < getUsers.length; i += BATCH_SIZE) {
                const batch = getUsers.slice(i, i + BATCH_SIZE);
                await Promise.all(
                    batch.map(async ({ email }) => {
                        if (!emailRegex.test(email)) return;
                        // --------- GET USER ITEMS ----------
                        const [userItems] = await database.query(
                            `SELECT DISTINCT wi.variant_id, wi.title, wu.email, 
                                    wu.shop_name as shopName, wu.store_name as storeName, 
                                    wi.price, wi.image as productImage, wi.handle, wi.product_id
                             FROM wishlist_users AS wu
                             JOIN wishlist AS w 
                                  ON wu.id = w.wishlist_user_id
                             JOIN wishlist_items AS wi 
                                  ON wi.wishlist_id = w.wishlist_id
                             WHERE wu.shop_name = ? 
                               AND wu.email = ? 
                               AND wi.created_date > NOW() - INTERVAL 30 DAY`,
                            [shopName, email]
                        );

                        if (!userItems.length) return;
                        const customerData = { name: "Customer", email };
                        const emailDatas = JSON.parse(emailData[0].weekly_email_temp);
                        const mailHtml = await userWishlistTableEmailHTML(
                            userItems,
                            customerData,
                            emailDatas,
                            app_install_id,
                            logo,
                            shopName,
                            shopName,
                            databaseQuery,
                            getSmtpDetail
                        );
                        const emailContent = {
                            from: supportEmail,
                            to: email,
                            subject: emailDatas.emailSubject,
                            html: mailHtml,
                            logoResult: logo,
                            app_install_id,
                            senderName: emailData[0].sender_name,
                            storeName: store_name,
                            replyTo: emailData[0]?.reply_to || shopEmail
                        };

                        try {
                            // -------- KLAVIYO CHECK ----------
                            const checkKlaviyoRecordExist = await checkKlaviyoRecord(shopName);
                            const hasKlaviyo =
                                plan >= 4 &&
                                checkKlaviyoRecordExist?.[0]?.private_key?.trim();

                            if (hasKlaviyo) {
                                const isValid = await checkKlaviyoApiKey(
                                    checkKlaviyoRecordExist[0].private_key
                                );
                                if (isValid?.type === "success") {
                                    await KlaviyoIntegrationEmailRemainderFxn(
                                        userItems,
                                        checkKlaviyoRecordExist,
                                        email,
                                        wishlistReminderKlaviyo,
                                        shopName
                                    );
                                    return;
                                }
                            }
                            // -------- SEND EMAIL (fallback SMTP) ----------
                            await sendEmail22(emailContent, shopName, getSmtpDetail);
                        } catch (err) {
                            console.error(`[Email Failed] ${email}:`, err.message);
                        }
                    })
                );
                console.log(
                    ` Batch ${Math.floor(i / BATCH_SIZE) + 1} sent. Waiting ${BATCH_DELAY_MS}ms...`
                );
                await sleep(BATCH_DELAY_MS);
            }
        }

        res.status(200).send("Monthly wishlist email process completed.");
    } catch (error) {
        console.error(error);
        res.status(500).send(
            "An error occurred while processing the monthly wishlist."
        );
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const postmarkWebhook = async (req, res) => {
    const bounce = req.body;
    if (!bounce || !bounce.Email || !bounce.Type) {
        return res.status(400).send("Invalid bounce payload");
    }
    const email = bounce.Email;
    const type = bounce.Type;
    try {
        if (type === "HardBounce" || type === "SoftBounce") {
            console.log(`[BOUNCE - ${type}] ${email}`);
            await database.query(`UPDATE wishlist_users 
                 SET email_valid = FALSE 
                 WHERE email = ?`,
                [email]
            );
        } else {
            console.log(`[BOUNCE IGNORED] ${type} for ${email}`);
        }

        res.sendStatus(200);
    } catch (err) {
        console.error("Webhook error:", err);
        res.sendStatus(500);
    }
};

async function sendEmail22(data, shopName, getSmtpDetail) {
    let sendErrorMail = false;
    let supportEmail = data.from;
    try {
        // If custom SMTP exists
        if (getSmtpDetail.length !== 0 && getSmtpDetail[0].user_name !== "") {
            const checkSmtp = await sendMailBySmtp(
                getSmtpDetail,
                supportEmail,
                data.senderName,
                data.storeName,
                { email: data.to },
                data.subject,
                data.replyTo,
                data.html,
                data.logoResult,
                serverURL,
                data.app_install_id,
                shopName
            );

            // Fallback to Postmark if SMTP fails
            if (checkSmtp === false) {
                sendErrorMail = true;
                console.log("SMTP failed — sending via Postmark");
                await sendMailByPostMark(
                    { email: data.to },
                    data.subject,
                    data.html,
                    data.replyTo,
                    data.senderName,
                    data.storeName,
                    supportEmail
                );
            }
        } else {
            // No SMTP → Postmark directly
            await sendMailByPostMark(
                { email: data.to },
                data.subject,
                data.html,
                data.replyTo,
                data.senderName,
                data.storeName,
                supportEmail
            );
        }
    } catch (error) {
        console.error("sendEmail22 failed:", error.message);

        // Final fallback to Postmark in case of unexpected error
        await sendMailByPostMark(
            { email: data.to },
            data.subject,
            data.html,
            data.replyTo,
            data.senderName,
            data.storeName,
            supportEmail
        );
    }
}

export const klaviyoEmailIntegration = async (req, res) => {
    const { shopName, privateKey, publicKey } = req.body;
    try {
        const [existing] = await database.query(
            `SELECT * FROM ${klaviyo_table} WHERE shop_name = ?`,
            [shopName]
        );
        if (existing.length > 0) {
            await database.query(
                `UPDATE ${klaviyo_table}
                 SET shop_name = ?, private_key = ?, public_key = ?
                 WHERE klaviyo_id = ?`,
                [shopName, privateKey, publicKey, existing[0].klaviyo_id]
            );
            return res.send({ msg: "data_updated" });
        } else {
            await database.query(
                `INSERT INTO ${klaviyo_table} (shop_name, private_key, public_key)
                 VALUES (?, ?, ?)`,
                [shopName, privateKey, publicKey]
            );
            return res.send({ msg: "data_updated" });
        }
    } catch (err) {
        logger.error(err);
        return res.status(500).send({ error: "Database error" });
    }
};

export const smtpEmailIntegration = async (req, res) => {
    const {
        sender_name,
        from_email,
        shopName,
        smtp_server,
        user_name,
        password,
        port,
        protocol
    } = req.body;

    try {
        // Check if record already exists
        const [existing] = await database.query(
            `SELECT * FROM email_smtp WHERE shop_name = ?`,
            [shopName]
        );

        if (existing.length > 0) {
            // Update existing record
            await database.query(
                `UPDATE email_smtp 
                 SET shop_name = ?, smtp_server = ?, from_email = ?, user_name = ?, 
                     password = ?, port = ?, protocol = ?, sender_name = ?
                 WHERE email_smtp_id = ?`,
                [
                    shopName,
                    smtp_server,
                    from_email,
                    user_name,
                    password,
                    port,
                    protocol,
                    sender_name,
                    existing[0].email_smtp_id
                ]
            );

            return res.send({ msg: "data_updated" });

        } else {
            // Insert new record
            await database.query(
                `INSERT INTO email_smtp 
                 (shop_name, smtp_server, from_email, user_name, password, port, protocol, sender_name)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    shopName,
                    smtp_server,
                    from_email,
                    user_name,
                    password,
                    port,
                    protocol,
                    sender_name
                ]
            );

            return res.send({ msg: "data_updated" });
        }
    } catch (err) {
        logger.error(err);
        return res.status(500).send({ error: "Database error" });
    }
};

export const shareWishlistByMail = async (req, res) => {
    try {
        const emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (req.body.customerEmail === "") {
            const [adminRows] = await database.query(
                `SELECT shop_email FROM app_installation WHERE shop_name = ?`,
                [req.body.shopName]
            );
            req.body.customerEmail = adminRows[0]?.shop_email || "";
        }
        const checkEmail = emailRegEx.test(req.body.customerEmail);
        if (checkEmail) {
            const [smtpRows] = await database.query(
                `SELECT * FROM email_smtp WHERE shop_name = ?`,
                [req.body.shopName]
            );
            const getSmtpDetail = smtpRows;
            let sendErrorMail = false;
            const emailContent = {
                from: supportEmail,
                to: req.body.customerEmail,
                subject: req.body.wishlistShareSubject,
                html: req.body.wishlistTextEditor,
                senderName: getSmtpDetail[0]?.sender_name || ""
            };
            if (getSmtpDetail.length !== 0 && getSmtpDetail[0].user_name !== "") {
                const checkSmtp = await sendSmtpEmail(getSmtpDetail, emailContent, "", "");
                if (checkSmtp === false) {
                    sendErrorMail = true;
                    await sendEmail(emailContent);
                    sendSmtpErrorMail(req.body.shopName);
                }
                return res.status(200).json("Email sent successfully");
            }
            await sendEmail(emailContent);
            return res.status(200).json("Email sent successfully");
        }

    } catch (error) {
        console.error("Error sending email:", error);
        logger.error(error);
        res.status(500).send("Internal Server Error");
    }
};

export const shareWishlistToAdmin = async (req, res) => {
    try {
        const query = `SELECT * FROM custom_wishlist_form WHERE shop_name = ?`;
        const [rows] = await database.query(query, [req.body.shopName]);
        return res.send({ msg: "get_data", data: rows });
    } catch (err) {
        logger.error(err);
        return res.send({ msg: "no_data", data: [] });
    }
};

export const saveShareWishlistToAdminEmail = async (req, res) => {
    try {
        const { shopName, newEmail } = req.body;
        const checkQuery = `SELECT id FROM custom_wishlist_form WHERE shop_name = ?`;
        const [existing] = await database.query(checkQuery, [shopName]);
        if (existing.length > 0) {
            const updateQuery = `
                UPDATE custom_wishlist_form 
                SET shop_email = ? 
                WHERE shop_name = ?
            `;
            await database.query(updateQuery, [newEmail, shopName]);
            return res.send({ msg: "email_updated" });
        }
        const insertQuery = `
            INSERT INTO custom_wishlist_form (shop_name, form, shop_email) 
            VALUES (?, ?, ?)
        `;
        await database.query(insertQuery, [shopName, "", newEmail]);
        return res.send({ msg: "email_added" });
    } catch (err) {
        logger.error(err);
        return res.status(500).send({ msg: "error", error: err });
    }
};

export const getShareWishlistToAdminEmail = async (req, res) => {
    try {
        const { shopName } = req.body;
        const query = `SELECT * FROM custom_wishlist_form WHERE shop_name = ?`;
        const [result] = await database.query(query, [shopName]);
        return res.send({
            data: result.length > 0 ? result : []
        });
    } catch (err) {
        logger.error(err);
        return res.status(500).send({ data: [], error: "Database error" });
    }
};

// export const shareWishlistStats = async (req, res) => {
//     try {
//         const { shopName, user_id, type, count, fromWhere } = req.body;
//         const userId = Number(user_id);
//         if (!userId || userId <= 0) {
//             console.warn("⚠️ Invalid user_id received:", user_id);
//             return res.status(400).json({ error: "Invalid user_id received" });
//         }
//         const allowedColumns = ["clicks", "facebook", "whatsapp", "twitter", "email", "copy"];
//         if (!allowedColumns.includes(type)) {
//             return res.status(400).json({ error: "Invalid type field" });
//         }
//         const selectQuery = `
//             SELECT *
//             FROM ${wishlist_shared_stats}
//             WHERE shop_name = ? AND user_id = ?
//         `;
//         const [statsResult] = await database.query(selectQuery, [shopName, userId]);
//         if (statsResult && statsResult.length > 0) {
//             const row = statsResult[0];
//             const updateColumn = fromWhere === "reload" ? "clicks" : type;
//             const updatedValue =
//                 fromWhere === "reload"
//                     ? row.clicks + 1
//                     : row[type] + count;
//             const updateQuery = `
//                 UPDATE ${wishlist_shared_stats}
//                 SET ${updateColumn} = ?
//                 WHERE shop_name = ? AND user_id = ?
//             `;
//             await database.query(updateQuery, [updatedValue, shopName, userId]);
//         } else {
//             const insertQuery = `
//                 INSERT INTO ${wishlist_shared_stats} (${type}, shop_name, user_id)
//                 VALUES (?, ?, ?)
//             `;
//             await database.query(insertQuery, [count, shopName, userId]);
//         }
//         return res.json("success");
//     } catch (err) {
//         console.error(err);
//         logger.error(err);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };

export const shareWishlistStats = async (req, res) => {
    const { shopName, user_id, type, count, fromWhere } = req.body;
    try {
        const userId = Number(user_id);
        if (isNaN(userId) || userId <= 0) {
            console.warn("⚠️ Invalid user_id received:", user_id);
            return res.status(400).json({ error: "Invalid user_id received" });
        }
        const selectQuery = `
            SELECT * 
            FROM ${wishlist_shared_stats} 
            WHERE shop_name = ? AND user_id = ?
        `;
        const [statsResult] = await database.query(selectQuery, [shopName, userId]);
        if (statsResult.length > 0) {
            const currentRow = statsResult[0];
            const updateColumn = fromWhere === "reload" ? "clicks" : type;
            const updatedValue =
                fromWhere === "reload"
                    ? currentRow["clicks"] + 1
                    : currentRow[type] + count;
            const updateQuery = `
                UPDATE ${wishlist_shared_stats}
                SET ${updateColumn} = ?
                WHERE shop_name = ? AND user_id = ?
            `;
            await database.query(updateQuery, [updatedValue, shopName, userId]);
        } else {
            const insertQuery = `
                INSERT INTO ${wishlist_shared_stats} (${type}, shop_name, user_id)
                VALUES (?, ?, ?)
            `;
            await database.query(insertQuery, [count, shopName, userId]);
        }
        return res.json("success");
    } catch (err) {
        console.error(err);
        logger.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export const storeLanguagesData = async (req, res) => {
    try {
        const selectQuery = `
            SELECT s.lang_id 
            FROM ${store_languages_table} AS s
            INNER JOIN ${store_languages_url_table} AS su 
                ON s.lang_id = su.lang_id
            WHERE s.shop_name = ? AND su.type = 'default'
        `;

        const [selectResult] = await database.query(selectQuery, [req.body.shopName]);

        if (selectResult && selectResult.length > 0) {
            // Pass lang_id to the existing function
            return updateStoreLanguage(req, res, selectResult[0].lang_id);
        } else {
            // Insert in store table
            return insertIntoStoreTable(req, res);
        }

    } catch (err) {
        console.error(err);
        logger.error(err);
        return res.status(500).send("Internal Server Error");
    }
};

export const premiumStoreLanguagesData = async (req, res) => {
    try {
        const { shopName, languageName, translations, type, url, id } = req.body;
        // If ID exists → update function
        if (id !== null) {
            return updateStoreLanguage2(req, res, id);
        }
        // --- Queries ---
        const selectQuery = `
            SELECT lang_id 
            FROM ${store_languages_table} 
            WHERE shop_name = ? AND lang_name = ?
        `;
        const insertQueryInTable1 = `
            INSERT INTO ${store_languages_table} (shop_name, lang_name, translations)
            VALUES (?, ?, ?)
        `;
        const insertQueryInTable2 = `
            INSERT INTO ${store_languages_url_table} (lang_id, type, url)
            VALUES (?, ?, ?)
        `;
        const [selectResult] = await database.query(selectQuery, [shopName, languageName]);
        if (selectResult.length > 0) {
            await database.query(insertQueryInTable2, [
                selectResult[0].lang_id,
                type,
                url
            ]);

            return res.json({ msg: "data inserted in language table" });
        }
        const [insertResult1] = await database.query(insertQueryInTable1, [
            shopName,
            languageName,
            translations
        ]);
        await database.query(insertQueryInTable2, [
            insertResult1.insertId,
            type,
            url
        ]);
        return res.json({ msg: "data inserted in language table" });
    } catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

async function insertIntoStoreTable(req, res) {
    try {
        const { shopName, languageName, translations, type, url } = req.body;
        // Insert into table 1
        const insertQuery1 = `
            INSERT INTO ${store_languages_table} (shop_name, lang_name, translations)
            VALUES (?, ?, ?)
        `;
        const [insertResult] = await database.query(insertQuery1, [
            shopName,
            languageName,
            translations
        ]);
        // Insert into table 2
        const insertQuery2 = `
            INSERT INTO ${store_languages_url_table} (lang_id, type, url)
            VALUES (?, ?, ?)
        `;
        await database.query(insertQuery2, [
            insertResult.insertId,
            type,
            url
        ]);
        return res.json({ msg: "data inserted in language table" });
    } catch (error) {
        console.error(error);
        logger.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

async function updateStoreLanguage(req, res, id) {
    try {
        const { shopName, languageName, translations } = req.body;
        const langId = id !== null ? id : req.body.id;
        let query;
        let params;
        if (languageName) {
            query = `
                UPDATE ${store_languages_table}
                SET lang_name = ?, translations = ?
                WHERE shop_name = ? AND lang_id = ?
            `;
            params = [languageName, translations, shopName, langId];
        } else {
            query = `
                UPDATE ${store_languages_table}
                SET translations = ?
                WHERE shop_name = ? AND lang_id = ?
            `;
            params = [translations, shopName, langId];
        }
        await database.query(query, params);
        return res.json({ msg: "Data Updated successfully" });
    } catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
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

const updateStoreLanguage2 = async (req, res) => {
    try {
        const updateId = req.body.id;
        const {
            shopName,
            languageName,
            url,
            type,
            urlId,
            translations
        } = req.body;

        const mainSelectQuery = `
            SELECT s.lang_id 
            FROM ${store_languages_table} AS s
            INNER JOIN ${store_languages_url_table} AS su ON s.lang_id = su.lang_id
            WHERE s.shop_name = ? AND s.lang_id = ?
        `;
        const [mainRows] = await database.query(mainSelectQuery, [shopName, updateId]);

        if (mainRows.length > 1) {

            // 1️⃣ Check if same lang + URL + URL ID exists
            const selectQuery = `
                SELECT s.lang_id 
                FROM ${store_languages_table} AS s
                INNER JOIN ${store_languages_url_table} AS su ON s.lang_id = su.lang_id
                WHERE s.shop_name = ? AND s.lang_name = ? AND su.url_id = ?
            `;
            const [rows1] = await database.query(selectQuery, [shopName, languageName, urlId]);

            const selectQuery2 = `
                SELECT s.lang_id 
                FROM ${store_languages_table} AS s
                INNER JOIN ${store_languages_url_table} AS su ON s.lang_id = su.lang_id
                WHERE s.shop_name = ? AND s.lang_name = ?
            `;
            const [rows2] = await database.query(selectQuery2, [shopName, languageName]);

            if (rows1.length > 0) {
                await database.query(
                    `UPDATE ${store_languages_url_table} SET url = ?, type = ?, lang_id = ? WHERE url_id = ?`,
                    [url, type, updateId, urlId]
                );
                return res.json({ msg: "Data Updated successfully" });
            }

            if (rows2.length > 0) {
                await database.query(
                    `UPDATE ${store_languages_url_table} SET url = ?, type = ?, lang_id = ? WHERE url_id = ?`,
                    [url, type, rows2[0].lang_id, urlId]
                );
                return res.json({ msg: "Data Updated successfully" });
            }

            const insertLangQuery = `
                INSERT INTO ${store_languages_table} (lang_name, shop_name, translations)
                VALUES (?, ?, ?)
            `;
            const [insertResult] = await database.query(insertLangQuery, [
                languageName,
                shopName,
                translations
            ]);

            await database.query(
                `UPDATE ${store_languages_url_table} SET url = ?, type = ?, lang_id = ? WHERE url_id = ?`,
                [url, type, insertResult.insertId, urlId]
            );

            return res.json({ msg: "Data Updated successfully" });
        }

        const updateLangQuery = `
            UPDATE ${store_languages_table}
            SET lang_name = ?, translations = ?
            WHERE shop_name = ? AND lang_id = ?
        `;

        await database.query(updateLangQuery, [
            languageName,
            translations,
            shopName,
            updateId
        ]);

        await database.query(
            `UPDATE ${store_languages_url_table} SET url = ?, type = ?, lang_id = ? WHERE url_id = ?`,
            [url, type, updateId, urlId]
        );

        return res.json({ msg: "Data Updated successfully" });

    } catch (err) {
        console.error(err);
        logger.error(err);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const getStoreLanguageData = async (req, res) => {
    try {
        const { shopName, id } = req.body;
        const dbQuery = `
            SELECT * FROM ${store_languages_table}
            WHERE shop_name = ? AND lang_id = ?
        `;
        const result = await database.query(dbQuery, [shopName, id]);
        res.json({ data: result });
    } catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const getStoreLanguageDataUseeff = async (req, res) => {
    try {
        const { currentPlan, shopName, translations, languageName, type, url } = req.body;
        let selectQuery;
        let selectParams = [];
        if (currentPlan < 3) {
            selectQuery = `
                SELECT * 
                FROM ${store_languages_table} AS s
                INNER JOIN ${store_languages_url_table} AS su 
                ON s.lang_id = su.lang_id
                WHERE s.shop_name = ? AND su.type = "default"
            `;
            selectParams = [shopName];
        } else {
            selectQuery = `
                SELECT * 
                FROM ${store_languages_table} AS s
                INNER JOIN ${store_languages_url_table} AS su 
                ON s.lang_id = su.lang_id
                WHERE s.shop_name = ?
            `;
            selectParams = [shopName];
        }
        const [rows] = await database.query(selectQuery, selectParams);
        if (rows.length > 0) {
            return res.json({ data: rows });
        }
        const insertLangQuery = `
            INSERT INTO ${store_languages_table} (shop_name, lang_name, translations)
            VALUES (?, ?, ?)
        `;
        const translationsString = JSON.stringify(translations);
        const [insertLangResult] = await database.query(insertLangQuery, [
            shopName,
            languageName,
            translationsString,
        ]);
        const langId = insertLangResult.insertId;
        const insertURLQuery = `
            INSERT INTO ${store_languages_url_table} (lang_id, type, url)
            VALUES (?, ?, ?)
        `;
        await database.query(insertURLQuery, [langId, type, url]);
        const [finalRows] = await database.query(selectQuery, selectParams);
        return res.json({ data: finalRows });
    } catch (error) {
        console.error(error);
        logger.error(error);
        res.status(500).send("Internal Server Error");
    }
};

export const getStoreLanguage = async (req, res) => {
    try {
        const { shopName, url } = req.body;
        const dbQuery = `
            SELECT s.translations
            FROM ${store_languages_table} AS s
            INNER JOIN ${store_languages_url_table} AS su
            ON s.lang_id = su.lang_id
            WHERE s.shop_name = ? AND su.url = ?
        `;
        const [rows] = await database.query(dbQuery, [shopName, url]);
        return res.json({ data: rows });
    } catch (error) {
        console.error(error);
        logger.error(error);
        return res.status(500).json({ error: "Failed to fetch language data" });
    }
};

export const deleteStoreLanguageData = async (req, res) => {
    try {
        const { shopName, id, urlId } = req.body;
        const selectQuery = `
            SELECT su.lang_id
            FROM ${store_languages_url_table} AS su
            INNER JOIN ${store_languages_table} AS s
            ON s.lang_id = su.lang_id
            WHERE s.shop_name = ? AND s.lang_id = ?
        `;
        const [selectResult] = await database.query(selectQuery, [shopName, id]);

        if (selectResult.length === 0) {
            return res.status(404).json({ msg: "Language record not found" });
        }
        const langId = selectResult[0].lang_id;
        // Queries
        const deleteFromTable1 = `
            DELETE FROM ${store_languages_table}
            WHERE shop_name = ? AND lang_id = ?
        `;
        const deleteFromTable2 = `
            DELETE FROM ${store_languages_url_table}
            WHERE url_id = ? AND lang_id = ?
        `;
        await database.query(deleteFromTable2, [urlId, langId]);
        const checkRemaining = `
            SELECT * FROM ${store_languages_url_table} WHERE lang_id = ?
        `;
        const [remainingRows] = await database.query(checkRemaining, [langId]);
        if (remainingRows.length === 0) {
            await database.query(deleteFromTable1, [shopName, id]);
        }
        return res.json({ msg: "Data deleted successfully" });
    } catch (error) {
        console.error(error);
        logger.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateStoreLanguageData = async (req, res) => {
    const id = null;
    updateStoreLanguage(req, res, id);
};

export const basicStoreLanguageData = async (req, res) => {
    updateStoreLanguage(req, res, req.body.id);
};

export const updateDataAppInstallation = async (req, res) => {
    try {
        const { shopName, step, themeName, collectionBtn, languages, setupCompleted } = req.body;
        const getMailQuery = `
            SELECT shop_email, customer_email 
            FROM app_installation 
            WHERE shop_name = ?
        `;
        const [getMail] = await database.query(getMailQuery, [shopName]);
        if (!getMail || getMail.length === 0) {
            return res.status(404).json({ msg: "Shop not found" });
        }
        const shopEmail = getMail[0].shop_email || "";
        const customerEmail = getMail[0].customer_email || "";
        let updateQuery = "";
        let updateParams = [];
        if (step === "step_1") {
            const cleanThemeName = themeName.replace(/~/g, "'");
            const themeParts = cleanThemeName.split(" -- ");
            updateQuery = `
                UPDATE ${app_installation_table}
                SET step_1 = ?
                WHERE shop_name = ?
            `;
            updateParams = [cleanThemeName, shopName];
            addSetupInBrevo(shopEmail, customerEmail, "THEMENAME", themeParts[0]);
        }
        else if (step === "step_2") {
            updateQuery = `
                UPDATE ${app_installation_table}
                SET step_2 = ?
                WHERE shop_name = ?
            `;
            updateParams = [collectionBtn, shopName];
        }
        else {
            updateQuery = `
                UPDATE ${app_installation_table}
                SET step_3 = ?, setup_completed = ?
                WHERE shop_name = ?
            `;
            updateParams = [JSON.stringify(languages), String(setupCompleted), shopName];

            addSetupInBrevo(shopEmail, customerEmail, "SETUP_COMPLETE", "TRUE");
        }
        await database.query(updateQuery, updateParams);
        return res.json({ msg: "App installation table updated" });
    } catch (err) {
        console.error(err);
        logger.error(err);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const appInstallation = async (req, res) => {
    try {
        const nameParts = req.body.currentPlanName.split("/");
        console.log("nameParts", nameParts)
        const currentPlanName = nameParts[0];
        const oldPlanType =
            currentPlanName === "Free" || currentPlanName === "No plan"
                ? null
                : nameParts[1] === "EVERY_30_DAYS"
                    ? "MONTHLY"
                    : nameParts[1];
        const [totalCount] = await database.query(
            `SELECT * FROM ${app_installation_table} WHERE shop_name = ?`,
            [req.body.shopName]
        );
        const storeNameSafe = req.body.storeName.replace(/'/g, "~");
        if (totalCount.length > 0) {
            const installation = totalCount[0];
            if (req.body.currentPlanId == installation.active_plan_id) {
                return res.json({ msg: "No plan updated in our database" });
            }
            if (req?.body?.domain) {
                updateShopDomain({ host: req.body.domain }, req.body.shopName);
            }
            if (req.body.shopEmail === req.body.customerEmail) {
                await updatePlanToBrevo(req.body.shopEmail, currentPlanName, "Active");
            } else {
                await updatePlanToBrevo(req.body.shopEmail, currentPlanName, "Active");
                await updatePlanToBrevo(req.body.customerEmail, currentPlanName, "Active");
            }
            await database.query(
                `UPDATE ${app_installation_table} 
                 SET status = ?, active_plan_id = ?, active_plan_name = ?, store_name = ?, store_type = ?, updated_date = NOW() 
                 WHERE shop_name = ?`,
                [
                    "Active",
                    req.body.currentPlanId,
                    currentPlanName,
                    storeNameSafe,
                    req.body.currentPlanName === "Free" ? "live" : req.body.paymentType,
                    req.body.shopName,
                ]
            );
            await database.query(
                `INSERT INTO ${app_installation_log_table} 
                 (app_install_id, plan_id, plan_name, plan_type, promo_code, payment_type) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    installation.app_install_id,
                    req.body.currentPlanId,
                    currentPlanName,
                    oldPlanType,
                    req.body.promoCode || null,
                    req.body.currentPlanName === "Free" ? "live" : req.body.paymentType,
                ]
            );
            if (["Basic", "Pro", "Premium"].includes(currentPlanName)) {
                const emailContent = {
                    from: supportEmail,
                    to: "randeep.webframez@gmail.com",
                    cc: "webframez@gmail.com",
                    subject: `Wishlist Guru – ${currentPlanName} Plan Purchased by ${req.body.shopName}`,
                    html: `Hii.. <br><br>
                        The ${currentPlanName} Plan of Wishlist Guru has been purchased.<br><br>
                        Shop Name: ${req.body.shopName}<br>
                        Store URL: ${req?.body?.domain || ""}<br>
                        Email: ${req.body.shopEmail}<br>
                        Customer Email: ${req.body.customerEmail}<br><br>
                        Thank you. Best regards`,
                };
                sendEmail(emailContent);
            }
            return res.json({ msg: "Plan updated in our database" });
        }
        const emailContent = {
            from: supportEmail,
            to: "webframez@gmail.com",
            subject: `Wishlist Guru installed on ${req.body.shopName}`,
            html: `Hii..... <br><br>
                1. Shop Name: ${req.body.shopName} <br>
                2. Plan Id: ${req.body.currentPlanId} <br>
                3. Phone Number: ${req.body.phoneNumber} <br>
                4. Email: ${req.body.shopEmail} <br>
                5. Country: ${req.body.country} <br>
                6. Shop Owner: ${req.body.shopOwner} <br>
                7. Shop Url: ${req?.body?.domain || ""} <br>
                8. Store Name: ${req.body.storeName} <br>
                9. Plan Name: ${currentPlanName} <br>
                10. Customer Email: ${req.body.customerEmail} <br>`,
        };
        sendEmail(emailContent);
        const storeCountrySafe = req.body.country.replace(/'/g, "~");
        const storeOwnerSafe = req.body.shopOwner.replace(/'/g, "~");
        const [result2] = await database.query(
            `INSERT INTO ${app_installation_table} 
             (shop_name, status, active_plan_id, active_plan_name, shop_email, customer_email, shop_phone, country, store_owner, store_name, shopify_plan, store_type) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.body.shopName,
                "Active",
                req.body.currentPlanId,
                currentPlanName,
                req.body.shopEmail,
                req.body.customerEmail,
                req.body.phoneNumber,
                storeCountrySafe,
                storeOwnerSafe,
                storeNameSafe,
                req.body.shopifyPlan,
                req.body.currentPlanName === "Free" ? "live" : req.body.paymentType,
            ]
        );
        await database.query(
            `INSERT INTO ${app_installation_log_table} 
             (app_install_id, plan_id, plan_name, plan_type, promo_code, payment_type) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                result2.insertId,
                req.body.currentPlanId,
                currentPlanName,
                oldPlanType,
                req.body.promoCode || null,
                req.body.currentPlanName === "Free" ? "live" : req.body.paymentType,
            ]
        );
        await database.query(
            `INSERT INTO email_reminder 
             (app_install_id, email_option, selected_date, back_in_stock, low_in_stock, price_drop, shop_name) 
             VALUES (?, 'turnOff', DAY(CURDATE()), 'no', 'no', 'no', ?)`,
            [result2.insertId, req.body.shopName]
        );
        res.json({ msg: "Plan created in our database" });
    } catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const updateProductQuantity = async (req, res) => {
    const query = `
        UPDATE ${product_table}
        SET quantity = ?
        WHERE product_id = ? AND wishlist_id = ?
    `;

    try {
        const [result] = await database.query(query, [
            req.body.quantity,
            req.body.productId,
            req.body.userId
        ]);

        res.json({ msg: "item_quantity_updated" });

    } catch (err) {
        console.log(err);
        logger.error(err);
        res.status(500).json({ msg: "update_failed" });
    }
};

export const updateProductVariant = async (req, res) => {
    const query = `
        UPDATE ${product_table}
        SET variant_id = ?
        WHERE product_id = ? AND wishlist_id = ? AND id = ?
    `;
    try {
        const [result] = await database.query(query, [
            req.body.newVariant,
            req.body.productId,
            req.body.userId,
            req.body.listId
        ]);
        res.json({ msg: "item_variant_updated" });
    } catch (err) {
        console.log(err);
        logger.error(err);
        res.status(500).json({ msg: "update_failed" });
    }
};

export const sendTestEmail = async (req, res) => {
    try {
        const {
            recieverEmail,
            htmlContent,
            subject,
            logoResult,
            app_install_id,
            senderName,
            replyTo,
            shopName
        } = req.body;

        if (!recieverEmail) {
            return res.status(200).json({ message: "Recipcent not found" });
        }
        let emailContent = {
            from: supportEmail,
            to: recieverEmail,
            subject: subject,
            html: htmlContent,
            logoResult: logoResult,
            app_install_id: app_install_id,
            senderName: senderName,
            replyTo: replyTo
        };
        const [getSmtpDetail] = await database.query(
            `SELECT * FROM email_smtp WHERE shop_name = ?`,
            [shopName]
        );
        let sendErrorMail = false;
        if (getSmtpDetail.length !== 0 && getSmtpDetail[0].user_name !== "") {
            // console.log("FROM SMTP")
            const checkSmtp = await sendSmtpEmail(
                getSmtpDetail,
                emailContent,
                logoResult,
                app_install_id
            );
            if (checkSmtp === false) {
                sendErrorMail = true;
                sendEmail(emailContent);
                sendSmtpErrorMail(shopName);
            }
            return res.status(200).json({ message: "Email sent Successfully!" });
        } else {
            // console.log("FROM OUR SERVER")
            sendEmail(emailContent);
            return res.status(200).json({ message: "email sent Successfully!" });
        }
    } catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const getAllCartItems = async (req, res) => {
    try {
        const [userResult] = await database.query(
            `SELECT wt.wishlist_id AS id 
             FROM ${Wishlist_table} AS wt, ${user_table} AS u  
             WHERE u.shop_name = '${req.body.shopName}' 
             AND u.id = wt.wishlist_user_id 
             AND email='${req.body.customerEmail}'`
        );
        if (userResult.length === 0) {
            return res.json({ data: [] });
        }
        const wishlistId = userResult[0].id;
        const [cartItems] = await database.query(
            `SELECT * FROM ${cart_table} WHERE wishlist_id='${wishlistId}'`
        );
        if (cartItems.length === 0) {
            return res.json({ data: [] });
        }
        return res.json({ data: cartItems });
    } catch (err) {
        console.log(err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const currentAppTheme = async (req, res) => {
    const session = await shopify.config.sessionStorage.findSessionsByShop(
        req.query.shopDomain
    );
    try {
        const themeData = await shopify.api.rest.Theme.all({
            session: session[0],
        });
        const getThemeId = themeData.data.find((theme) => theme.role === "main");
        const getAssestData = await shopify.api.rest.Asset.all({
            session: session[0],
            theme_id: getThemeId.id,
            asset: { key: "config/settings_schema.json" },
        });
        let schemaFile = JSON.parse(getAssestData.data[0].value);
        res.status(200).send({ themeName: schemaFile[0].theme_name });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
}

export const handleRedirect = async (req, res) => {
    try {
        const redirectUrl = req.query.redirectUrl;
        const data = JSON.parse(decodeURIComponent(req.query.data));
        const { id, shop_name, user_email, mainToken } = data[0];
        const decryptedId = decodeToken(id);
        const decryptedMainToken = decodeToken(mainToken);
        if (token === decryptedMainToken) {
            await database.query(
                `
                UPDATE ${email_reports_table}
                SET clicks = clicks + 1
                WHERE id = ? AND shop_name = ? AND user_email = ?
                `,
                [decryptedId, shop_name, user_email]
            );
            return res.redirect(redirectUrl);
        }
        return res.status(403).json({ msg: "Invalid token" });
    } catch (error) {
        console.error("Error handling redirect:", error);
        logger.error(error);
        res.status(500).json({ msg: "Failed to update data or redirect" });
    }
};

export const checkPromoCode = async (req, res) => {
    const { shopName, cuponCode, planName, planType } = req.body;
    try {
        const checkPrevPlanQuery = `
            SELECT ail.app_install_id, ail.plan_name
            FROM app_installation ai
            JOIN app_installation_logs ail ON ai.app_install_id = ail.app_install_id
            WHERE ai.shop_name = ? AND ail.plan_name = ?;
        `;
        const [countryRows] = await database.query(
            `SELECT country FROM app_installation WHERE shop_name = ?`,
            [shopName]
        );
        const getCountry = countryRows; // keep original variable name to avoid breaking anything

        const promoQuery = `SELECT * FROM promo_codes WHERE promo_code = ?`;
        const [promoData] = await database.query(promoQuery, [cuponCode]);
        if (promoData.length === 0) {
            return res.status(200).send({ msg: "Invalid Promo Code", data: [] });
        }
        const promo = promoData[0];
        let currentDATE = new Date();
        let errorMessage = null;
        if (promo.status !== "active") {
            errorMessage = "Promo code is not active";
        } else if (
            promo.check_date === "check" &&
            (currentDATE < new Date(promo.start_date) ||
                currentDATE > new Date(promo.end_date))
        ) {
            errorMessage = "Promo code is invalid/expired";

        } else if (promo.plan_type !== "none" && planType !== promo.plan_type) {
            errorMessage = `Promo code is only available for ${promo.plan_type === "ANNUAL" ? "annual" : "monthly"
                } plan.`;

        } else if (promo.store && shopName !== promo.store) {
            errorMessage = `Promo code is only available for ${promo.store} store.`;

        } else if (promo.country !== null) {
            if (promo.country !== getCountry[0]?.country) {
                errorMessage = `Promo code is only available for ${promo.country}`;
            }
        }

        if (errorMessage) {
            return res.status(200).send({ msg: errorMessage, data: [] });
        }
        res.status(200).send({ msg: "promo code added", data: promoData });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send({ msg: "Server error", error: err });
    }
};

export const checkPromoCodePrevPlan = async (req, res) => {
    const { shopName, planName } = req.body;
    try {
        const checkPrevPlanQuery = `
            SELECT ail.app_install_id, ail.plan_name
            FROM app_installation ai
            JOIN app_installation_logs ail ON ai.app_install_id = ail.app_install_id
            WHERE ai.shop_name = ? AND ail.plan_name = ?;
        `;
        const [checkPrevPlan] = await database.query(checkPrevPlanQuery, [
            shopName,
            planName
        ]);
        res.status(200).send({ msg: "promo code added", data: checkPrevPlan });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send({ msg: "Server error", error: err });
    }
};

export const getShareStatsData = async (req, res) => {
    const { shopName, startDate, endDate, userType, isDates, isType } = req.body
    let dateQuery = "";
    let typeQuery = "";
    if (isDates) {
        dateQuery += `AND t1.created_at >= "${startDate}" AND CAST(t1.created_at AS DATE) <= "${endDate}"`;
    }
    if (isType) {
        typeQuery += `AND t2.user_type = "${userType}"`;
    }
    try {
        const mainSelectQuery = `
            SELECT t1.*, t2.user_type, t2.email AS userEmail
            FROM ${wishlist_shared_stats} AS t1
            JOIN ${user_table} AS t2 ON t1.user_id = t2.id
            WHERE t1.shop_name = ? ${dateQuery} ${typeQuery}
            ORDER BY t1.created_at DESC
        `;
        // Replacing queryAsync
        const [mainResult] = await database.query(mainSelectQuery, [shopName]);
        res.send({ mainResult: mainResult, msg: "date fetched" });
    } catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const getShareStatsUserData = async (req, res) => {
    try {
        let query = "";
        let cartQuery = "";
        let itemQuery = "";

        if (req.body.checkStatusInItem === true) {
            query += `AND created_at >= "${req.body.startDate}" AND CAST(created_at as DATE) <= "${req.body.endDate}"`;
            cartQuery += `AND w.created_at >= "${req.body.startDate}" AND CAST(w.created_at as DATE) <= "${req.body.endDate}"`;
            itemQuery += `AND w.created_at >= "${req.body.startDate}" AND CAST(w.created_at as DATE) <= "${req.body.endDate}"`;
        }

        const [userData] = await database.query(
            `SELECT * FROM ${user_table} 
             WHERE shop_name='${req.body.shopName}' 
             AND referral_user_id = ${req.body.userId} 
             ${query}`
        );

        const [cartData] = await database.query(
            `SELECT * FROM ${cart_table} AS w, ${user_table} AS u, ${Wishlist_table} AS wt
             WHERE u.id = wt.wishlist_user_id 
             AND w.wishlist_id = wt.wishlist_id 
             AND u.shop_name='${req.body.shopName}' 
             ${cartQuery}
             GROUP BY u.id, w.variant_id 
             ORDER BY w.id`
        );

        const [wishlistItemData] = await database.query(
            `SELECT * FROM ${product_table} AS w, ${user_table} AS u, ${Wishlist_table} AS wt
             WHERE u.id = wt.wishlist_user_id 
             AND w.wishlist_id = wt.wishlist_id 
             AND u.shop_name='${req.body.shopName}' 
             AND w.referral_user_id = ${req.body.userId}
             ${itemQuery}
             GROUP BY u.id, w.variant_id 
             ORDER BY w.id DESC`
        );

        let results = [];

        for (let abItem of userData) {
            let count = 0;
            let cartCount = 0;
            for (let bcItem of wishlistItemData) {
                if (abItem.id === bcItem.id) count++;
            }
            for (let itemData of cartData) {
                if (abItem.id === itemData.id) cartCount++;
            }
            results.push({
                ...abItem,
                wishlistItemCount: count,
                cartTableCount: cartCount,
            });
        }
        res.send({
            mainResult: results,
            userData,
            cartData,
            wishlistItemData,
            results,
        });

    } catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const getShareStatsWishlistItemData = async (req, res) => {
    try {
        let query = "";

        if (req.body.checkStatusInItem === true) {
            query += `AND pu.created_at >= "${req.body.startDate}" 
                      AND CAST(pu.created_at AS DATE) <= "${req.body.endDate}"`;
        }
        const sql = `
            SELECT * 
            FROM ${product_table} AS pu, 
                 ${Wishlist_table} AS wt, 
                 ${user_table} AS u 
            WHERE u.id = wt.wishlist_user_id 
              AND wt.wishlist_id = pu.wishlist_id 
              AND shop_name='${req.body.shopName}' 
              AND pu.referral_user_id = ${req.body.userId} 
              ${query}
        `;
        const [result] = await database.query(sql);
        res.send({ mainResult: result });
    } catch (err) {
        console.error("err", err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const getRefFromEmail = async (req, res) => {
    try {
        const [refRow] = await database.query(
            `SELECT referral_user_id FROM ${user_table} WHERE id = ${req.body.userId}`
        );
        if (!refRow || refRow.length === 0) {
            return res.send({ email: [] });
        }
        const referralId = refRow[0].referral_user_id;
        const [emailRow] = await database.query(
            `SELECT email FROM ${user_table} WHERE id = ${referralId}`
        );
        res.send({ email: emailRow[0]?.email || [] });
    } catch (err) {
        console.error("err", err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const clearWishlistData = async (req, res) => {
    try {
        const sql = `
            DELETE pu.*  
            FROM ${product_table} AS pu,
                 ${Wishlist_table} AS wt,
                 ${user_table} AS u
            WHERE u.shop_name = "${req.body.shopName}"
              AND u.id = wt.wishlist_user_id
              AND wt.wishlist_id = pu.wishlist_id
              AND u.id = ${req.body.wishlistId}
        `;
        await database.query(sql);
        res.status(200).send({ msg: "deleted" });
    } catch (err) {
        console.log("errr", err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const getWishlistUsersData = async (req, res) => {
    try {
        let query = "";
        let cartQuery = "";
        let itemQuery = "";

        if (req.body.checkStatusInItem === true) {
            query += `AND created_at >= "${req.body.startDate}" AND CAST(created_at as DATE) <= "${req.body.endDate}"`;
            cartQuery += `AND w.created_at >= "${req.body.startDate}" AND CAST(w.created_at as DATE) <= "${req.body.endDate}"`;
            itemQuery += `AND w.created_at >= "${req.body.startDate}" AND CAST(w.created_at as DATE) <= "${req.body.endDate}"`;
        }

        const [userData] = await database.query(
            `SELECT * FROM ${user_table} 
             WHERE shop_name='${req.body.shopName}' 
             ${query}`
        );

        const [cartData] = await database.query(
            `SELECT * 
             FROM ${cart_table} AS w, ${user_table} AS u, ${Wishlist_table} AS wt 
             WHERE u.id = wt.wishlist_user_id 
             AND w.wishlist_id = wt.wishlist_id 
             AND u.shop_name='${req.body.shopName}' 
             ${cartQuery}
             GROUP BY u.id, w.variant_id 
             ORDER BY w.id`
        );

        const [wishlistItemData] = await database.query(
            `SELECT * 
             FROM ${product_table} AS w, ${user_table} AS u, ${Wishlist_table} AS wt 
             WHERE u.id = wt.wishlist_user_id 
             AND w.wishlist_id = wt.wishlist_id 
             AND u.shop_name='${req.body.shopName}' 
             ${itemQuery}
             GROUP BY u.id, w.variant_id 
             ORDER BY w.id DESC`
        );

        let results = [];
        for (let abItem of userData) {
            let count = 0;
            let cartCount = 0;
            for (let bcItem of wishlistItemData) {
                if (abItem.id === bcItem.id) count++;
            }
            for (let itemData of cartData) {
                if (abItem.id === itemData.id) cartCount++;
            }
            results.push({
                ...abItem,
                wishlistItemCount: count,
                cartTableCount: cartCount,
            });
        }
        res.send({
            mainResult: results,
            userData,
            cartData,
            wishlistItemData,
            results,
        });
    } catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const removeWishlistDataById = async (req, res) => {
    try {
        const { shopName, wishlistId, userTableId, checkStatusInItem, variantId } =
            req.body;

        let query = "";
        if (checkStatusInItem === true) {
            query += `AND u.created_at >= "${req.body.startDate}" 
                      AND CAST(u.created_at as DATE) <= "${req.body.endDate}"`;
        }
        const deleteSQL = `
            DELETE wi 
            FROM ${product_table} wi
            JOIN ${Wishlist_table} wt ON wi.wishlist_id = wt.wishlist_id
            JOIN ${user_table} wu ON wt.wishlist_user_id = wu.id
            WHERE wu.shop_name = "${shopName}"
              AND wu.id = ${userTableId}
              AND wi.variant_id = ${variantId}
        `;

        await database.query(deleteSQL);
        const selectSQL = `
            SELECT 
                wt.wishlist_name, 
                SUM(w.quantity) AS total_quantity, 
                w.* 
            FROM ${product_table} AS w, 
                 ${user_table} AS u,  
                 ${Wishlist_table} AS wt 
            WHERE u.id = wt.wishlist_user_id 
              AND w.wishlist_id = wt.wishlist_id 
              AND u.shop_name='${shopName}' 
              AND wt.wishlist_user_id = ${userTableId}
              ${query}
            GROUP BY w.variant_id 
            ORDER BY w.id DESC
        `;
        const [productResult] = await database.query(selectSQL);
        res.status(200).send({ productResult });
    } catch (err) {
        console.error("err", err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const getWishlistItemData = async (req, res) => {
    try {
        let query = "";
        if (req.body.checkStatusInItem === true) {
            query += `AND pu.created_at >= "${req.body.startDate}"
                      AND CAST(pu.created_at AS DATE) <= "${req.body.endDate}"`;
        }
        const sql = `
            SELECT *
            FROM ${product_table} AS pu,
                 ${Wishlist_table} AS wt,
                 ${user_table} AS u
            WHERE u.id = wt.wishlist_user_id
              AND wt.wishlist_id = pu.wishlist_id
              AND shop_name='${req.body.shopName}'
              ${query}
        `;
        const [result] = await database.query(sql);
        res.send({ mainResult: result });
    } catch (err) {
        console.error("err", err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const getDefaultStoreLang = async (req, res) => {
    const fixedInput = fixBase64Padding(req.body.langName);
    const langName = atob(fixedInput);
    try {
        const langObject = storeFrontLanguages[langName];
        if (langObject) {
            res.status(200).json(langObject);
        } else {
            res.status(404).send("Language not found");
        }
    } catch (error) {
        res.status(500).send("An error occurred while getting language");
    }
};

export const getThemeData = async (req, res) => {
    const fixedInput1 = fixBase64Padding(req.body.themeName);
    const themeName = atob(fixedInput1);
    const fixedInput2 = fixBase64Padding(req.body.filter);
    const filter = atob(fixedInput2);
    const customSettings = req.body?.customSettings ? req.body?.customSettings : {
        gridElement: "",
        productLink: "",
        appendIcon: "",
        appendIconCheck: "",
        afterIcon: "",
        buttonPrependBeforeElemnt: ""
    };

    try {
        const themeDetails = detectThemeName(themeName, filter, customSettings);
        if (themeDetails) {
            // console.log("*********[Before satatus server Response]**************************" + Date.now())
            res.status(200).json(themeDetails);
            // console.log("*********[server Response] after [statu]**************************" + Date.now())
        } else {
            res.status(404).send("Theme name not found");
        }
    } catch (error) {
        res.status(500).send("An error occurred while detecting the theme name");
    }
};

export const getWishlistCartData = async (req, res) => {
    try {
        let query = "";

        if (req.body.checkStatusInItem === true) {
            query += `AND c.created_at >= "${req.body.startDate}" 
                      AND CAST(c.created_at AS DATE) <= "${req.body.endDate}"`;
        }
        const sql = `
            SELECT 
                COUNT(c.id) AS total_count,
                SUM(c.quantity) AS total_quantity,
                c.variant_id,
                wt.wishlist_id,
                wt.wishlist_user_id,
                u.user_type,
                u.email,
                c.*
            FROM ${cart_table} AS c,
                 ${user_table} AS u,
                 ${Wishlist_table} AS wt
            WHERE u.id = wt.wishlist_user_id
              AND wt.wishlist_id = c.wishlist_id
              AND shop_name='${req.body.shopName}'
              ${query}
            GROUP BY c.variant_id, wt.wishlist_user_id
            ORDER BY c.id DESC
        `;
        const [result] = await database.query(sql);
        res.send({ mainResult: result, data: result });
    } catch (err) {
        console.error("err", err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const getCurrentUserWishlistData = async (req, res) => {
    try {
        let lastQuery = "";
        let query = "";
        const { startDate, endDate, wishlistId, shopName, checkStatusInItem } =
            req.body;

        if (checkStatusInItem === true) {
            query += `AND w.created_at >= "${startDate}" AND CAST(w.created_at as DATE) <= "${endDate}"`;
            lastQuery += `AND w.created_at >= "${startDate}" AND CAST(w.created_at as DATE) <= "${endDate}"`;
        }

        // ------------------------------------
        // 1️⃣ Get user data
        // ------------------------------------
        const [userResult] = await database.query(
            `SELECT * 
             FROM ${user_table} 
             WHERE id = ${wishlistId} 
             AND shop_name = '${shopName}'`
        );

        // ------------------------------------
        // 2️⃣ Get wishlist data
        // ------------------------------------
        const [wishlistData] = await database.query(
            `SELECT wt.wishlist_id AS id, wt.wishlist_name AS name
             FROM ${Wishlist_table} AS wt, ${user_table} AS u
             WHERE u.shop_name = '${shopName}'
               AND u.id = wt.wishlist_user_id
               AND u.id = ${wishlistId}`
        );

        // Build dropdown options
        const mainArr = [{ label: "All", value: "all" }];
        const optionArray = mainArr.concat(
            wishlistData.map((dev) => ({
                label: capitalizeFirstLetter(dev.name),
                value: dev.name,
            }))
        );

        // ------------------------------------
        // 3️⃣ Get Product (wishlist item) Data
        // ------------------------------------
        const [productResult] = await database.query(
            `SELECT wt.wishlist_name, w.quantity as total_quantity, w.*
             FROM ${product_table} AS w, ${user_table} AS u, ${Wishlist_table} AS wt
             WHERE u.id = wt.wishlist_user_id
               AND w.wishlist_id = wt.wishlist_id
               AND u.shop_name='${shopName}'
               AND wt.wishlist_user_id = ${wishlistId}
               ${query}
             ORDER BY w.id DESC`
        );

        // ------------------------------------
        // 4️⃣ Get cart data
        // ------------------------------------
        const [cartData] = await database.query(
            `SELECT wt.wishlist_name, SUM(w.quantity) AS total_quantity, w.*
             FROM ${cart_table} AS w, ${user_table} AS u, ${Wishlist_table} AS wt
             WHERE u.id = wt.wishlist_user_id
               AND w.wishlist_id = wt.wishlist_id
               AND u.shop_name='${shopName}'
               AND wt.wishlist_user_id = ${wishlistId}
               ${lastQuery}
             GROUP BY w.variant_id
             ORDER BY w.id DESC`
        );

        // ------------------------------------
        // 5️⃣ Get cart count
        // ------------------------------------
        const [cartCount] = await database.query(
            `SELECT wt.wishlist_name, SUM(w.quantity) AS total_quantity, w.*
             FROM ${cart_table} AS w, ${user_table} AS u, ${Wishlist_table} AS wt
             WHERE u.id = wt.wishlist_user_id
               AND w.wishlist_id = wt.wishlist_id
               AND u.shop_name='${shopName}'
               AND wt.wishlist_user_id = ${wishlistId}
             GROUP BY w.variant_id
             ORDER BY w.id DESC`
        );

        // ------------------------------------
        // 6️⃣ Get product count
        // ------------------------------------
        const [productCount] = await database.query(
            `SELECT wt.wishlist_name, SUM(w.quantity) AS total_quantity, w.*
             FROM ${product_table} AS w, ${user_table} AS u, ${Wishlist_table} AS wt
             WHERE u.id = wt.wishlist_user_id
               AND w.wishlist_id = wt.wishlist_id
               AND u.shop_name='${shopName}'
               AND wt.wishlist_user_id = ${wishlistId}
             GROUP BY w.variant_id, wt.wishlist_name
             ORDER BY w.id DESC`
        );

        // ------------------------------------
        // 7️⃣ Send Final Response
        // ------------------------------------
        res.send({
            productResult,
            itemCount: productCount,
            userResult,
            optionArray,
            cartData,
            wishlistData,
            cartResultCount: cartCount,
        });

    } catch (error) {
        console.error("Error:", error);
        logger.error(error);
        res.status(500).send("Internal Server Error");
    }
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const cartItemRecord = async (req, res) => {
    try {
        const dataArr = req.body;
        const promises = dataArr.map(async (item) => {
            const data = { body: item }
            const newPrice = await getProductPrice(data, res);
            const updatedItem = {
                ...item,
                price: newPrice || item.price,
            };
            await insertCartItem(updatedItem);
        });
        await Promise.all(promises);
        res.json({ msg: "Cart items processed" });
    } catch (error) {
        console.error(error);
        logger.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const insertCartItem = async (item) => {
    try {
        const itemTitle = item.title
            .replace(/\/wg-sgl/g, "'")
            .replace(/\/wg-dbl/g, '"');
        const insertCartItemQuery = `
            INSERT INTO ${cart_table} 
            (wishlist_id, variant_id, product_id, title, price, image, quantity) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            item.userId,
            item.variantId,
            item.productId,
            itemTitle,
            item.price,
            item.image,
            item.quantity,
        ];

        const [result] = await database.query(insertCartItemQuery, values);
        return result;
    } catch (err) {
        logger.error(err);
        throw err;
    }
};

export const getProductCountData = async (req, res) => {
    try {
        const { customerEmail, currentToken, shopName, productId } = req.body;
        const [tokenResult] = await database.query(
            `SELECT * FROM ${social_like_table} WHERE email='${currentToken}'`
        );

        const [emailResult] = await database.query(
            `SELECT * FROM ${social_like_table} WHERE email='${customerEmail}'`
        );

        if (tokenResult.length > 0) {

            if (emailResult.length === 0 && customerEmail === "") {
                const [countResult1] = await database.query(
                    `SELECT COUNT(social_like_id) AS total_count 
                     FROM ${social_like_table} 
                     WHERE shop_name='${shopName}' AND product_id=${productId}`
                );

                return res.send({
                    data: countResult1[0]?.total_count,
                    msg: "getting_data"
                });
            }

            else if (emailResult.length === 0 && customerEmail !== "") {

                await Promise.all(
                    tokenResult.map(p =>
                        database.query(
                            `UPDATE ${social_like_table} SET email=? 
                             WHERE social_like_id=?`,
                            [customerEmail, p.social_like_id]
                        )
                    )
                );

                const [countResult1] = await database.query(
                    `SELECT COUNT(social_like_id) AS total_count 
                     FROM ${social_like_table} 
                     WHERE shop_name='${shopName}' AND product_id=${productId}`
                );

                return res.send({
                    data: countResult1[0]?.total_count,
                    msg: "getting_data"
                });
            }

            else {
                if (emailResult.length > 0 && customerEmail !== "") {
                    const matchedProducts = tokenResult.filter(a =>
                        emailResult.some(b => b.product_id === a.product_id)
                    );
                    const unmatchedProducts = tokenResult.filter(a =>
                        !emailResult.some(b => b.product_id === a.product_id)
                    );
                    if (matchedProducts.length > 0) {
                        await Promise.all(
                            matchedProducts.map(p =>
                                database.query(
                                    `DELETE FROM ${social_like_table} 
                                     WHERE social_like_id=?`,
                                    [p.social_like_id]
                                )
                            )
                        );
                    }
                    if (unmatchedProducts.length > 0) {
                        await Promise.all(
                            unmatchedProducts.map(p =>
                                database.query(
                                    `UPDATE ${social_like_table} SET email=? 
                                     WHERE social_like_id=?`,
                                    [customerEmail, p.social_like_id]
                                )
                            )
                        );
                    }
                    const [countResult1] = await database.query(
                        `SELECT COUNT(social_like_id) AS total_count 
                         FROM ${social_like_table} 
                         WHERE shop_name='${shopName}' AND product_id=${productId}`
                    );
                    return res.send({
                        data: countResult1[0]?.total_count,
                        msg: "getting_data"
                    });
                }
            }
        }
        else {
            const [countResult1] = await database.query(
                `SELECT COUNT(social_like_id) AS total_count 
                 FROM ${social_like_table} 
                 WHERE shop_name='${shopName}' AND product_id=${productId}`
            );
            return res.send({
                data: countResult1[0]?.total_count,
                msg: "getting_data"
            });
        }

    } catch (err) {
        console.error("Error:", err);
        logger.error(err);
        res.status(500).send("Internal Server Error");
    }
};

function fixBase64Padding(str = "") {
    while (str.length % 4 !== 0) {
        str += "=";
    }
    return str;
}

function fixBase64Padding1(str = "") {
    // Remove invalid characters first
    str = str.replace(/[^A-Za-z0-9+/=]/g, "");
    // Add padding if necessary
    while (str.length % 4 !== 0) {
        str += "=";
    }
    return str;
}

function decodeToken(token) {
    const fixedInput = fixBase64Padding(token);
    const decodedString = atob(fixedInput);
    const [prefix, timestamp, data] = decodedString.split("_");

    if (prefix === "token") {
        return data;
    }
    throw new Error("Invalid token");
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

// do not remove this api in any condition this it the all health checker in case of app stop
export const apiHealthChecker = async (req, res) => {
    res.status(200).send('OK');
};

export const getShopData = async (shop) => {
    try {
        const query = `SELECT * FROM ${app_installation_table} WHERE shop_name = ?`;
        const [result] = await database.query(query, [shop]);
        return result;
    } catch (err) {
        throw err;
    }
};

// ----------------import/add data from csv file and the instruction to use it----------------
// demoURL = http://localhost:5000/save-data-to-sql?store=randeep-singh-webframez.myshopify.com
// permanentDomain should be as store as params
// ------------- this is method number one ---- to import data using product id-------------


// export const saveDataToSql = async (req, res) => {
//     const storeName = req?.query?.store;
//     const session = await getShopData(storeName);
//     const shopifyNodes = new shopifyNode({
//         shopName: storeName,
//         accessToken: session[0].access_token
//     });

//     await fetchAllProducts(shopifyNodes).then((allData) => {


//         const allProductArr = allData;
//         const rows = [];

//         fs.createReadStream('prem.csv').pipe(csv()).on('data', (row) => {
//             rows.push(row);
//         }).on('end', async () => {

//             try {
//                 for (const [index, row] of rows.entries()) {

//                     console.log("-----------------  ", index)
//                     console.log("DATA --- ", row)
//                     console.log("product_id --- ", row.product_id)

//                     // console.log("DATA --- ", row)
//                     // console.log("GGGGGGGGGGGGGGGGGG", allProductArr[0])
//                     // console.log("image ", allProductArr[0].images.nodes[0]?.url)
//                     // console.log("price ", allProductArr[0].variants?.nodes[0]?.price)

//                     const findDataWithProductId = allProductArr.find((aa) => Number(aa?.id?.split('/').pop()) === Number(row.product_id));

//                     // --------------if id don't found skip this row-------------
//                     if (!findDataWithProductId) {
//                         continue;
//                     }
//                     // console.log("GET DATA -- ", findDataWithProductId)

//                     const emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
//                     const checkEmail = emailRegEx.test(row.email);

//                     if (checkEmail === false || row.email === "" || row.email === null || row.email === "null" || row.email === undefined) {
//                         continue; // Skip this row
//                     }



//                     let sendData = {
//                         body: {
//                             shopName: "premiom-oi.myshopify.com",
//                             plan: 3,
//                             guestToken: "",
//                             customerEmail: row.email,
//                             productId: findDataWithProductId?.id?.split('/').pop(),
//                             // variantId: findDataWithProductId?.variants?.nodes[0]?.id?.split('/').pop(),
//                             variantId: row?.variantId ? row?.variantId : findDataWithProductId?.variants?.nodes[0]?.id?.split('/').pop(),
//                             price: findDataWithProductId?.variants?.nodes[0]?.price,
//                             handle: findDataWithProductId?.handle,
//                             title: findDataWithProductId?.title,
//                             image: findDataWithProductId.images.nodes[0]?.url,
//                             quantity: 1,
//                             storeName: "Premiom-OI",
//                             language: "https://premiom-oi.pro/",
//                             wishlistName: ['favourites'],
//                             wfGetDomain: "https://premiom-oi.pro/",
//                             specificVariant: null,
//                             productOption: null
//                         }
//                     };



//                     // let sendData = {
//                     //     body: {
//                     //         shopName: "bisoulovely.myshopify.com",
//                     //         plan: 4,
//                     //         guestToken: "",
//                     //         customerEmail: row.email,
//                     //         productId: findDataWithProductId?.id?.split('/').pop(),
//                     //         // variantId: findDataWithProductId?.variants?.nodes[0]?.id?.split('/').pop(),
//                     //         variantId: row?.variantId ? row?.variantId : findDataWithProductId?.variants?.nodes[0]?.id?.split('/').pop(),
//                     //         price: findDataWithProductId?.variants?.nodes[0]?.price,
//                     //         handle: findDataWithProductId?.handle,
//                     //         title: findDataWithProductId?.title,
//                     //         image: findDataWithProductId.images.nodes[0]?.url,
//                     //         quantity: 1,
//                     //         storeName: "Bisoulovely",
//                     //         language: "https://bisoulovely.myshopify.com/",
//                     //         wishlistName: ['favourites'],
//                     //         wfGetDomain: "https://bisoulovely.myshopify.com/",
//                     //         specificVariant: true
//                     //     }
//                     // };



//                     // let sendData = {
//                     //     body: {
//                     //         shopName: "1j2whj-fu.myshopify.com",
//                     //         plan: 4,
//                     //         guestToken: "",
//                     //         customerEmail: row.email,
//                     //         productId: findDataWithProductId?.id?.split('/').pop(),
//                     //         // variantId: findDataWithProductId?.variants?.nodes[0]?.id?.split('/').pop(),
//                     //         variantId: row?.variantId ? row?.variantId : findDataWithProductId?.variants?.nodes[0]?.id?.split('/').pop(),
//                     //         price: findDataWithProductId?.variants?.nodes[0]?.price,
//                     //         handle: findDataWithProductId?.handle,
//                     //         title: findDataWithProductId?.title,
//                     //         image: findDataWithProductId.images.nodes[0]?.url,
//                     //         quantity: 1,
//                     //         storeName: "www.choose-a-brick.com",
//                     //         language: "https://www.choose-a-brick.com/",
//                     //         wishlistName: ['favourites'],
//                     //         wfGetDomain: "https://www.choose-a-brick.com/",
//                     //         specificVariant: true
//                     //     }
//                     // };



//                     // let sendData = {
//                     //     body: {
//                     //         shopName: "mydukaan-nl.myshopify.com",
//                     //         plan: 4,
//                     //         guestToken: "",
//                     //         customerEmail: row.email,
//                     //         productId: findDataWithProductId?.id?.split('/').pop(),
//                     //         variantId: findDataWithProductId?.variants?.nodes[0]?.id?.split('/').pop(),
//                     //         price: findDataWithProductId?.variants?.nodes[0]?.price,
//                     //         handle: findDataWithProductId?.handle,
//                     //         title: findDataWithProductId?.title,
//                     //         image: findDataWithProductId.images.nodes[0]?.url,
//                     //         quantity: 1,
//                     //         storeName: "GlobalFoodHub.com",
//                     //         language: "https://globalfoodhub.com/",
//                     //         wishlistName: ['favourites'],
//                     //         wfGetDomain: "https://globalfoodhub.com/"
//                     //     }
//                     // };

//                     // let sendData = {
//                     //   body: {
//                     //     shopName: 'randeep-singh-webframez.myshopify.com',
//                     //     plan: 3,
//                     //     guestToken: '',
//                     //     customerEmail: row.email,
//                     //     productId: row.product_id,
//                     //     variantId: row.variant_id,
//                     //     price: row.price,
//                     //     handle: row.handle,
//                     //     title: row.title,
//                     //     image: row.image,
//                     //     quantity: '1',
//                     //     storeName: 'randeep-singh-webframez',
//                     //     language: 'https://randeep-singh-webframez.myshopify.com/',
//                     //     wishlistName: ['favourites'],
//                     //     wfGetDomain: 'https://randeep-singh-webframez.myshopify.com/'
//                     //   }
//                     // };


//                     try {
//                         // Check if the user exists------
//                         const userQuery = `SELECT u.id AS id FROM ${user_table} AS u WHERE u.shop_name = ? AND email = ?`;
//                         const [existingUser] = await databaseQuery(userQuery, [sendData.body.shopName, sendData.body.customerEmail]);

//                         let selectedUserId;

//                         if (existingUser) {
//                             // ------Existing user found------
//                             selectedUserId = existingUser.id;
//                         } else {
//                             // ------Insert new user-----
//                             const addUserQuery = `INSERT INTO ${user_table} (shop_name, email, user_type, store_name, language, referral_user_id) VALUES (?, ?, ?, ?, ?, ?)`;
//                             const userResult = await databaseQuery(addUserQuery, [
//                                 sendData.body.shopName,
//                                 sendData.body.customerEmail || sendData.body.guestToken,
//                                 sendData.body.customerEmail ? "User" : "Guest",
//                                 sendData.body.storeName,
//                                 sendData.body.language,
//                                 sendData.body.referral_id || null,
//                             ]);
//                             selectedUserId = userResult.insertId;

//                             // ------Add wishlists for the new user------
//                             for (const wishlistName of sendData.body.wishlistName) {
//                                 await databaseQuery(`INSERT INTO ${Wishlist_table} (wishlist_user_id, wishlist_name, update_at, created_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
//                                     [selectedUserId, wishlistName]
//                                 );
//                             }
//                         }

//                         // ------Retrieve wishlist ID for the user------
//                         const wishlistQuery = `SELECT wishlist_id FROM ${Wishlist_table} WHERE wishlist_user_id = ?`;
//                         const [wishlist] = await databaseQuery(wishlistQuery, [selectedUserId]);

//                         if (!wishlist) {
//                             throw new Error("Wishlist not found for the user");
//                         }

//                         const wishlistId = wishlist.wishlist_id;

//                         // ------Check if the product exists in the wishlist------
//                         const productQuery = `SELECT product_id FROM ${product_table} WHERE product_id = ? AND wishlist_id = ?`;
//                         const [existingProduct] = await databaseQuery(productQuery, [sendData.body.productId, wishlistId]);

//                         if (!existingProduct) {
//                             // ------Add product to the wishlist------
//                             await databaseQuery(`INSERT INTO ${product_table} (wishlist_id, variant_id, product_id, referral_user_id, handle, price, title, image, quantity)  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//                                 [
//                                     wishlistId,
//                                     sendData.body.variantId,
//                                     sendData.body.productId,
//                                     sendData.body.referral_id || null,
//                                     sendData.body.handle,
//                                     sendData.body.price,
//                                     sendData.body.title,
//                                     sendData.body.image,
//                                     sendData.body.quantity,
//                                 ]
//                             );

//                             // ------Update the wishlist's timestamp------
//                             await databaseQuery(`UPDATE ${Wishlist_table} SET update_at = CURRENT_TIMESTAMP WHERE wishlist_id = ?`, [wishlistId]);
//                         }
//                     } catch (err) {
//                         console.error("Error processing wishlist:", err);
//                     }
//                 }

//                 // ------function to convert database queries to promises------
//                 function databaseQuery(query, params) {
//                     return new Promise((resolve, reject) => {
//                         database.query(query, params, (err, results) => {
//                             if (err) return reject(err);
//                             resolve(results);
//                         });
//                     });
//                 }

//                 res.status(200).json({ message: 'Processing completed successfully.' });
//             } catch (error) {
//                 console.error('Error during processing:', error);
//                 res.status(500).json({ message: 'An error occurred during processing.' });
//             }
//         })
//     })

// };


export const saveDataToSql = async (req, res) => {
    try {
        const storeName = req?.query?.store;

        // Get store session
        const session = await getShopData(storeName);
        const shopifyNodes = new shopifyNode({
            shopName: storeName,
            accessToken: session[0].access_token
        });

        // Fetch all Shopify products
        const allData = await fetchAllProducts(shopifyNodes);
        const allProductArr = allData;
        const rows = [];

        // Read CSV
        fs.createReadStream('prem.csv')
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', async () => {
                try {
                    for (const [index, row] of rows.entries()) {

                        console.log("-----------------  ", index);
                        console.log("DATA --- ", row);
                        console.log("product_id --- ", row.product_id);

                        const findDataWithProductId = allProductArr.find(
                            (aa) => Number(aa?.id?.split('/').pop()) === Number(row.product_id)
                        );

                        if (!findDataWithProductId) continue;

                        const emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                        const checkEmail = emailRegEx.test(row.email);

                        if (!checkEmail || !row.email || row.email === "null") continue;

                        // Build data body
                        let sendData = {
                            body: {
                                shopName: "premiom-oi.myshopify.com",
                                plan: 3,
                                guestToken: "",
                                customerEmail: row.email,
                                productId: findDataWithProductId?.id?.split('/').pop(),
                                variantId: row?.variantId
                                    ? row?.variantId
                                    : findDataWithProductId?.variants?.nodes[0]?.id?.split('/').pop(),
                                price: findDataWithProductId?.variants?.nodes[0]?.price,
                                handle: findDataWithProductId?.handle,
                                title: findDataWithProductId?.title,
                                image: findDataWithProductId.images.nodes[0]?.url,
                                quantity: 1,
                                storeName: "Premiom-OI",
                                language: "https://premiom-oi.pro/",
                                wishlistName: ['favourites'],
                                wfGetDomain: "https://premiom-oi.pro/",
                                specificVariant: null,
                                productOption: null
                            }
                        };

                        try {
                            // ---------------------------------------------------
                            // CHECK IF USER ALREADY EXISTS
                            // ---------------------------------------------------
                            const userQuery = `
                                SELECT u.id AS id 
                                FROM ${user_table} AS u 
                                WHERE u.shop_name = ? AND email = ?
                            `;

                            const [existingUsers] = await database.query(userQuery, [
                                sendData.body.shopName,
                                sendData.body.customerEmail
                            ]);

                            let selectedUserId;

                            if (existingUsers.length > 0) {
                                selectedUserId = existingUsers[0].id;
                            } else {
                                // INSERT USER
                                const addUserQuery = `
                                    INSERT INTO ${user_table} 
                                    (shop_name, email, user_type, store_name, language, referral_user_id)
                                    VALUES (?, ?, ?, ?, ?, ?)
                                `;

                                const [userResult] = await database.query(addUserQuery, [
                                    sendData.body.shopName,
                                    sendData.body.customerEmail || sendData.body.guestToken,
                                    sendData.body.customerEmail ? "User" : "Guest",
                                    sendData.body.storeName,
                                    sendData.body.language,
                                    sendData.body.referral_id || null,
                                ]);

                                selectedUserId = userResult.insertId;

                                // INSERT WISHLISTS
                                for (const wishlistName of sendData.body.wishlistName) {
                                    await database.query(
                                        `INSERT INTO ${Wishlist_table} 
                                         (wishlist_user_id, wishlist_name, update_at, created_at) 
                                         VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                                        [selectedUserId, wishlistName]
                                    );
                                }
                            }

                            // GET WISHLIST ID
                            const [wishlistRows] = await database.query(
                                `SELECT wishlist_id FROM ${Wishlist_table} WHERE wishlist_user_id = ?`,
                                [selectedUserId]
                            );

                            if (wishlistRows.length === 0) {
                                throw new Error("Wishlist not found for the user");
                            }

                            const wishlistId = wishlistRows[0].wishlist_id;

                            // CHECK PRODUCT EXISTS
                            const [existingProduct] = await database.query(
                                `SELECT product_id 
                                 FROM ${product_table} 
                                 WHERE product_id = ? AND wishlist_id = ?`,
                                [sendData.body.productId, wishlistId]
                            );

                            if (existingProduct.length === 0) {
                                // INSERT PRODUCT
                                await database.query(
                                    `INSERT INTO ${product_table} 
                                    (wishlist_id, variant_id, product_id, referral_user_id, handle, price, title, image, quantity)
                                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                    [
                                        wishlistId,
                                        sendData.body.variantId,
                                        sendData.body.productId,
                                        sendData.body.referral_id || null,
                                        sendData.body.handle,
                                        sendData.body.price,
                                        sendData.body.title,
                                        sendData.body.image,
                                        sendData.body.quantity,
                                    ]
                                );

                                // UPDATE WISHLIST TIMESTAMP
                                await database.query(
                                    `UPDATE ${Wishlist_table} 
                                     SET update_at = CURRENT_TIMESTAMP 
                                     WHERE wishlist_id = ?`,
                                    [wishlistId]
                                );
                            }

                        } catch (err) {
                            console.error("Error processing wishlist:", err);
                        }
                    }

                    res.status(200).json({ message: 'Processing completed successfully.' });

                } catch (error) {
                    console.error('Error during processing:', error);
                    res.status(500).json({ message: 'An error occurred during processing.' });
                }
            });

    } catch (err) {
        console.error("Fatal Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAllProducts(client) {
    let hasNextPage = true;
    let endCursor = null;
    let allProducts = [];
    let pageCount = 0;

    while (hasNextPage) {
        try {
            const result = await client.graphql(`query {
                products(first: 100${endCursor ? `, after: "${endCursor}"` : ''}) {
                    edges {
                        node {
                            id
                            title
                            handle
                            options {
                                name
                                values
                            }
                            variants(first: 100) {
                                nodes {
                                    id
                                    title
                                    price
                                }
                            }
                            images(first: 100) {
                                nodes {
                                    id
                                    height
                                    width
                                    url
                                }
                            }
                        }
                    }
                    pageInfo {
                        hasNextPage
                        endCursor
                    }
                }
            }`);

            if (!result?.products?.edges) {
                console.warn("No products.edges found in response. Possibly empty or malformed response.");
                break;
            }

            const productsData = result.products.edges.map(edge => edge.node);
            allProducts = allProducts.concat(productsData);
            const { pageInfo } = result.products;

            pageCount++;
            console.log(`✅ Page ${pageCount} fetched. Products so far: ${allProducts.length}`);

            hasNextPage = pageInfo.hasNextPage;
            endCursor = pageInfo.endCursor;

            // Delay to reduce chance of throttling
            await delay(1500); // 1.5 sec

        } catch (err) {
            if (err?.extensions?.code === "THROTTLED") {
                console.warn("⚠️ Rate limit hit. Waiting 2 seconds before retrying...");
                await delay(2000);
                continue;
            } else {
                console.error("❌ Unexpected error while fetching products:", err);
                break;
            }
        }
    }

    return allProducts;
}

export const checkSmtpConnection = async (req, res) => {

    try {
        const { smtp_server, from_email, user_name, password, port, protocol } =
            req.body;

        if (
            !smtp_server ||
            !from_email ||
            !password ||
            !port ||
            !user_name ||
            !protocol
        ) {
            return res.status(400).json({ msg: "Please fill all the details" });
        }

        const provider = getProviderFromSMTP(smtp_server);

        let isVerified = true;
        let msgValue = "";

        if (provider === "sendgrid") {
            const sendGridData = await isSendGridVerifiedSender(password, from_email);
            isVerified = sendGridData.isSameEmail;
            msgValue = sendGridData.msg;
        }
        // else if (provider === "mailgun") {
        //   const domain = user_name.split("@")[1];
        //   const mailGunData = await isMailgunVerifiedSender(password, domain, from_email);
        //   isVerified = mailGunData.isSameEmail;
        //   msgValue = mailGunData.msg;
        // }
        else if (provider === "postmark") {
            const postMarkData = await isPostmarkVerifiedSender(password, from_email);
            isVerified = postMarkData.isSameEmail;
            msgValue = postMarkData.msg;
        } else {
            const fromEmailData = isFromEmailValid(provider, user_name, from_email);
            isVerified = fromEmailData.isSameEmail;
            msgValue = fromEmailData.msg;
        }

        if (!isVerified) {
            return res.status(400).json({ msg: "SMTP connection failed", msgValue });
        }

        const transporter = nodemailer.createTransport({
            host: smtp_server,
            port: parseInt(port),
            secure: protocol.toUpperCase() === "SSL",
            auth: {
                user: user_name,
                pass: password,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        try {
            await transporter.verify();
            console.log('SMTP configuration is valid.');
            res.status(200).json({ msg: "SMTP connected successfully" });
        } catch (error) {
            console.error('SMTP verification failed:');
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            if (error.response) {
                console.error('SMTP server response:', error.response);
            }
            res
                .status(400)
                .json({ msg: "SMTP connection failed", msgValue: error.message });
        }
    } catch (error) {
        logger.error(error);
        console.log(error);
        res
            .status(400)
            .json({ msg: "SMTP connection failed", msgValue: error.message });
    }
}

export const getSmtpDetail = async (req, res) => {
    try {
        const { shopName } = req.body;

        // Replace queryAsync → database.query()
        const [smtpRows] = await database.query(
            `SELECT * FROM email_smtp WHERE shop_name = ?`,
            [shopName]
        );

        res.status(200).json({
            success: true,
            data: smtpRows
        });

    } catch (error) {
        console.error("Error in getSmtlDetail:", error);
        res.status(400).json({
            success: false,
            message: "Failed to retrieve SMTP details.",
            error: error.message
        });
    }
};

let codeVerifierStore = {};
function generatePKCE() {
    const code_verifier = crypto.randomBytes(32).toString("base64url");
    const code_challenge = crypto
        .createHash("sha256")
        .update(code_verifier)
        .digest("base64url");
    return { code_verifier, code_challenge };
}

export const klaviyoInstall = async (req, res) => {
    const { code_verifier, code_challenge } = generatePKCE();
    const state = crypto.randomBytes(16).toString("hex");
    // save verifier + state in memory (per user/session)
    codeVerifierStore[state] = code_verifier;
    const redirectUrl = new URL("https://www.klaviyo.com/oauth/authorize");
    redirectUrl.searchParams.append("response_type", "code");
    redirectUrl.searchParams.append("client_id", '0f4a69ef-8fdf-4e05-b5a4-ab5960506c24');
    redirectUrl.searchParams.append("redirect_uri", "https://wishlist-api.webframez.com/klaviyo/oauth/callback");
    redirectUrl.searchParams.append("scope", "accounts:read accounts:write lists:read lists:write campaigns:read campaigns:write");
    redirectUrl.searchParams.append("state", state);
    redirectUrl.searchParams.append("code_challenge", code_challenge);
    redirectUrl.searchParams.append("code_challenge_method", "S256");

    // Redirect user to Klaviyo
    res.redirect(redirectUrl.toString());
}

export const klaviyoAuthCallback = async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;

    if (!code || !state) {
        return res.status(400).send("Missing code or state");
    }

    const code_verifier = codeVerifierStore[state];
    if (!code_verifier) {
        console.error("Invalid state:", state, "Store:", codeVerifierStore);
        return res.status(400).send("Invalid state");
    }

    delete codeVerifierStore[state]; // cleanup

    try {
        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("client_id", '0f4a69ef-8fdf-4e05-b5a4-ab5960506c24');
        params.append("client_secret", 'PoQDQ1KzkZU1vvNu6aOuKAyKYkusHSyQGZGZNmyWEHC-Fhn6nzT64oI7Y_7uxMJFqU39YL6N5J3Lwo2R2n8Msw'); // <- add this
        params.append("redirect_uri", "https://wishlist-api.webframez.com/klaviyo/oauth/callback");
        params.append("code", code);
        params.append("code_verifier", code_verifier);

        console.log("Token request:", params.toString());

        const credentials = Buffer.from('0f4a69ef-8fdf-4e05-b5a4-ab5960506c24:PoQDQ1KzkZU1vvNu6aOuKAyKYkusHSyQGZGZNmyWEHC-Fhn6nzT64oI7Y_7uxMJFqU39YL6N5J3Lwo2R2n8Msw').toString('base64');
        const response = await fetch("https://a.klaviyo.com/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${credentials}`
            },
            body: params.toString(),
        });

        const data = await response.json();
        console.log("OAuth Token Response:", data);

        if (data.error) {
            return res.status(400).send(`OAuth error: ${JSON.stringify(data)}`);
        }

        res.send("Klaviyo app successfully installed!");
    } catch (err) {
        console.error("Unexpected error:", err.message);
        res.status(500).send("OAuth failed");
    }

}

