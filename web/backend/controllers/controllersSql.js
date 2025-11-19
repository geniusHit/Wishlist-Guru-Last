

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

// export const logoUpload = async (req, res) => {

//     try {
//         const { shopName, id } = req.body;
//         // const selectQuery = `SELECT id FROM ${store_data} WHERE app_install_id = ? AND shop_name = ?`;
//         // const insertQuery = `INSERT INTO ${store_data} (app_install_id, shop_name, logo) VALUES(?, ? ,?)`;
//         const updateQuery = `UPDATE ${email_reminder_table} SET logo = ? WHERE app_install_id = ? AND shop_name = ?`;

//         // const selectResult = await queryAsync(selectQuery, [id, shopName]);

//         // if (selectResult.length > 0) {
//         if (req.file !== undefined) {
//             await queryAsync(updateQuery, [req.file.filename, id, shopName]);
//             res.status(200).json({ message: "Data Updated Successfully!" });
//         } else {
//             res.status(200).json({ message: "No file to be uploaded" });
//         }
//     } catch (err) {
//         console.error(err);
//         logger.error(err);
//         res.status(500).json({ msg: "Internal Server Error" });
//     }
// };
export const logoUpload = async (req, res) => {
  try {
    const { shopName, id } = req.body;
    const updateQuery = `
      UPDATE ${email_reminder_table}
      SET logo = ?
      WHERE app_install_id = ? AND shop_name = ?
    `;

    if (req.file) {
      // Execute query using mysql2/promise
      const [result] = await database.query(updateQuery, [
        req.file.filename,
        id,
        shopName,
      ]);

      // Optional: check affected rows
      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Data Updated Successfully!" });
      } else {
        res.status(404).json({ message: "No matching record found." });
      }
    } else {
      res.status(200).json({ message: "No file to be uploaded" });
    }
  } catch (err) {
    console.error("❌ Error in logoUpload:", err);
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

// async function guestSocialLike(req, res) {
//     const { currentToken, productId, shopName, checkCountDecOrNot, checkAddOrRemove } = req.body

//     // const getAllItems = await new Promise((resolve, reject) => {
//     //     database.query(`SELECT * from ${social_like_table} where shop_name='${shopName}' AND product_id=${productId} AND email= '${currentToken}'`, (err, result) => {
//     //         if (err) {
//     //             logger.error(err);
//     //             reject(err);
//     //         } else {
//     //             resolve(result);
//     //         }
//     //     })
//     // })
//     try {
//         const [getAllItems] = await database.query(
//             `SELECT * FROM ${social_like_table} WHERE shop_name = ? AND product_id = ? AND email = ?`,
//             [shopName, productId, currentToken]
//         );

//         // Now `getAllItems` contains the rows
//         console.log(getAllItems);

//     } catch (err) {
//         logger.error(err);
//         console.error("Error fetching items:", err);
//     }


//     if (getAllItems.length > 0 && checkCountDecOrNot === "true" && checkAddOrRemove === "remove") {
//         database.query(`DELETE FROM ${social_like_table} WHERE social_like_id=${getAllItems[0].social_like_id}`, (err, result) => {
//             if (err) {
//                 console.log("err", err);
//             } else {
//                 res.send({ msg: "remove-successfully" })
//             }
//         })
//     } else {
//         if (getAllItems.length === 0 && checkAddOrRemove === "add") {
//             database.query(`INSERT INTO ${social_like_table} (email,product_id, shop_name, created_at) VALUES ('${currentToken}', ${productId},'${shopName}',CURRENT_TIMESTAMP() )`, (err, result) => {
//                 if (err) {
//                     console.log("Err", err);
//                 } else {
//                     res.send({ msg: "saved-successfully" })
//                 }
//             })
//         } else {
//             res.send({ msg: "nothing change" })
//         }
//     }
// }
async function guestSocialLike(req, res) {
  const { currentToken, productId, shopName, checkCountDecOrNot, checkAddOrRemove } = req.body;

  try {
    // 1️⃣ Fetch existing likes
    const [getAllItems] = await database.query(
      `SELECT * FROM ${social_like_table} WHERE shop_name = ? AND product_id = ? AND email = ?`,
      [shopName, productId, currentToken]
    );

    console.log("Existing items:", getAllItems);

    // 2️⃣ If item exists and request is to remove
    if (
      getAllItems.length > 0 &&
      checkCountDecOrNot === "true" &&
      checkAddOrRemove === "remove"
    ) {
      const deleteQuery = `DELETE FROM ${social_like_table} WHERE social_like_id = ?`;
      const [deleteResult] = await database.query(deleteQuery, [
        getAllItems[0].social_like_id,
      ]);

      if (deleteResult.affectedRows > 0) {
        return res.send({ msg: "remove-successfully" });
      } else {
        return res.status(400).send({ msg: "Nothing to remove" });
      }
    }

    // 3️⃣ If no existing item and request is to add
    if (getAllItems.length === 0 && checkAddOrRemove === "add") {
      const insertQuery = `
        INSERT INTO ${social_like_table} (email, product_id, shop_name, created_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP())
      `;
      const [insertResult] = await database.query(insertQuery, [
        currentToken,
        productId,
        shopName,
      ]);

      if (insertResult.affectedRows > 0) {
        return res.send({ msg: "saved-successfully" });
      }
    }

    // 4️⃣ Default fallback (no changes)
    return res.send({ msg: "nothing change" });

  } catch (err) {
    console.error("❌ Error in guestSocialLike:", err);
    logger.error(err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}


// async function loginSocialLike(req, res) {
//     const { customerEmail, productId, shopName, checkCountDecOrNot, checkAddOrRemove } = req.body
//     const getAllItems = await new Promise((resolve, reject) => {
//         database.query(`SELECT * from ${social_like_table} where shop_name='${shopName}' AND product_id=${productId} AND email= '${customerEmail}'`, (err, result) => {
//             if (err) {
//                 logger.error(err);
//                 reject(err);
//             } else {
//                 resolve(result);
//             }
//         })
//     })

//     if (getAllItems.length > 0 && checkCountDecOrNot === "true" && checkAddOrRemove === "remove") {
//         database.query(`DELETE FROM ${social_like_table} WHERE social_like_id=${getAllItems[0].social_like_id}`, (err, result) => {
//             if (err) {
//                 console.log("err", err);
//             } else {
//                 res.send({ msg: "remove-successfully" })

//             }
//         })
//     } else {
//         if (getAllItems.length === 0 && checkAddOrRemove === "add") {
//             database.query(`INSERT INTO ${social_like_table} (email,product_id,shop_name, created_at) VALUES ('${customerEmail}', ${productId}, '${shopName}',CURRENT_TIMESTAMP() )`, (err, result) => {
//                 if (err) {
//                     console.log("Err", err);
//                 } else {
//                     res.send({ msg: "saved-successfully" })
//                 }
//             })
//         } else {
//             res.send({ msg: "nothing change" })
//         }
//     }
// }
async function loginSocialLike(req, res) {
  const { customerEmail, productId, shopName, checkCountDecOrNot, checkAddOrRemove } = req.body;

  try {
    // 1️⃣ Get all existing items
    const [getAllItems] = await database.query(
      `SELECT * FROM ${social_like_table} WHERE shop_name = ? AND product_id = ? AND email = ?`,
      [shopName, productId, customerEmail]
    );

    console.log("Existing items:", getAllItems);

    // 2️⃣ If record exists and needs to be removed
    if (
      getAllItems.length > 0 &&
      checkCountDecOrNot === "true" &&
      checkAddOrRemove === "remove"
    ) {
      const deleteQuery = `DELETE FROM ${social_like_table} WHERE social_like_id = ?`;
      const [deleteResult] = await database.query(deleteQuery, [getAllItems[0].social_like_id]);

      if (deleteResult.affectedRows > 0) {
        return res.send({ msg: "remove-successfully" });
      } else {
        return res.status(400).send({ msg: "Nothing to remove" });
      }
    }

    // 3️⃣ If no existing record and request is to add
    if (getAllItems.length === 0 && checkAddOrRemove === "add") {
      const insertQuery = `
        INSERT INTO ${social_like_table} (email, product_id, shop_name, created_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP())
      `;
      const [insertResult] = await database.query(insertQuery, [customerEmail, productId, shopName]);

      if (insertResult.affectedRows > 0) {
        return res.send({ msg: "saved-successfully" });
      }
    }

    // 4️⃣ Default fallback (no changes)
    return res.send({ msg: "nothing change" });

  } catch (err) {
    console.error("❌ Error in loginSocialLike:", err);
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

// async function CreateWishlist(req, res, emailOrToken, guestOrUser) {
//     const checkExistedEmail = database.query(
//         `SELECT u.id FROM ${user_table} AS u  WHERE u.shop_name = '${req.body.shopName}' AND email='${emailOrToken}'`,
//         async (err, result2) => {
//             if (err) {
//                 console.log("err", err);
//             } else {
//                 if (result2.length === 0) {
//                     await addCreateWishlist(req, res, emailOrToken, guestOrUser);
//                 } else {
//                     // database.query(
//                     //     `INSERT INTO ${Wishlist_table}(wishlist_user_id,wishlist_name, update_at, created_at) VALUES (${result2[0].id},'${req.body.wishlistName}', CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
//                     //     (err, result3) => {
//                     //         if (err) {
//                     //             console.log("err", err);
//                     //         } else {
//                     //             res.send({ msg: "wishlist created successfully" });
//                     //         }
//                     //     }
//                     // );

//                     const query = `
//   INSERT INTO ${Wishlist_table} (wishlist_user_id, wishlist_name, update_at, created_at)
//   VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
// `;
//                     database.query(query, [result2[0].id, req.body.wishlistName], (err, result3) => {
//                         if (err) {
//                             console.log("❌ SQL Error:", err);
//                         } else {
//                             res.send({ msg: "wishlist created successfully" });
//                         }
//                     });

//                 }
//             }
//         }
//     );
// }
async function CreateWishlist(req, res, emailOrToken, guestOrUser) {
  try {
    // 1️⃣ Check if the email exists in user_table
    const [result2] = await database.query(
      `SELECT u.id FROM ${user_table} AS u WHERE u.shop_name = ? AND email = ?`,
      [req.body.shopName, emailOrToken]
    );

    // 2️⃣ If user doesn’t exist → create wishlist for new user
    if (result2.length === 0) {
      await addCreateWishlist(req, res, emailOrToken, guestOrUser);
      return;
    }

    // 3️⃣ Otherwise → insert wishlist for existing user
    const query = `
      INSERT INTO ${Wishlist_table} (wishlist_user_id, wishlist_name, update_at, created_at)
      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    const [result3] = await database.query(query, [
      result2[0].id,
      req.body.wishlistName,
    ]);

    console.log("✅ Wishlist created:", result3);
    res.send({ msg: "wishlist created successfully" });

  } catch (err) {
    console.error("❌ SQL Error in CreateWishlist:", err);
    res.status(500).send({ error: "Internal Server Error" });
  }
}


// async function addCreateWishlist(req, res, emailOrToken, guestOrUser) {
//     let storeNameUpdate = req.body.storeName.replace(/'/g, "~");
//     const addLoginUser = database.query(
//         `INSERT INTO ${user_table} (shop_name, email, user_type, store_name, language, referral_user_id) VALUES ('${req.body.shopName
//         }','${emailOrToken}','${guestOrUser === "login" ? "User" : "Guest"}', '${storeNameUpdate}', '${req.body.language}', ${req.body.referral_id || null})`,
//         (err, result4) => {
//             if (err) {
//                 console.log(err);
//             } else {
//                 // @ts-ignore
//                 const selectedUserId = result4.insertId;
//                 for (let i = 0; i < req.body.wishlistName.length; i++) {
//                     // database.query(
//                     //     `INSERT INTO ${Wishlist_table}(wishlist_user_id,wishlist_name, update_at,created_at) VALUES (${selectedUserId},'${req.body.wishlistName}',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
//                     //     (err, result5) => {
//                     //         if (err) {
//                     //             console.log(err);
//                     //         } else {
//                     //             res.send({ msg: "wishlist created successfully" });
//                     //         }
//                     //     }
//                     // );

//                     const query = `
//   INSERT INTO ${Wishlist_table} (wishlist_user_id, wishlist_name, update_at, created_at)
//   VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
// `;

//                     database.query(query, [selectedUserId, req.body.wishlistName], (err, result5) => {
//                         if (err) {
//                             console.log("❌ SQL Error:", err);
//                             res.status(500).send({ error: "Database error" });
//                         } else {
//                             res.send({ msg: "Wishlist created successfully" });
//                         }
//                     });




//                 }
//             }
//         }
//     );
// }
async function addCreateWishlist(req, res, emailOrToken, guestOrUser) {
  try {
    // Clean store name to prevent SQL errors
    const storeNameUpdate = req.body.storeName.replace(/'/g, "~");

    // 1️⃣ Insert user
    const insertUserQuery = `
      INSERT INTO ${user_table} 
      (shop_name, email, user_type, store_name, language, referral_user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [userResult] = await database.query(insertUserQuery, [
      req.body.shopName,
      emailOrToken,
      guestOrUser === "login" ? "User" : "Guest",
      storeNameUpdate,
      req.body.language,
      req.body.referral_id || null,
    ]);

    const selectedUserId = userResult.insertId;

    // 2️⃣ Insert wishlist(s)
    const insertWishlistQuery = `
      INSERT INTO ${Wishlist_table} 
      (wishlist_user_id, wishlist_name, update_at, created_at)
      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    // Handle both single or multiple wishlist names
    const wishlistNames = Array.isArray(req.body.wishlistName)
      ? req.body.wishlistName
      : [req.body.wishlistName];

    for (const name of wishlistNames) {
      await database.query(insertWishlistQuery, [selectedUserId, name]);
    }

    // 3️⃣ Send success response
    res.status(200).json({ msg: "Wishlist created successfully" });

  } catch (err) {
    console.error("❌ Error in addCreateWishlist:", err);
    logger.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}


export const copyToWishlist = async (req, res) => {
    if (req.body.customerEmail === "") {
        await CopyMultiWishlist(req, res, req.body.currentToken);
    } else {
        await CopyMultiWishlist(req, res, req.body.customerEmail);
    }
};

// async function CopyMultiWishlist(req, res, emailOrToken) {
//     let idArray = [];
//     for (let i = 0; i < req.body.wishlistName.length; i++) {
//         const getAllItems = await new Promise((resolve, reject) => {
//             // database.query(
//             //     `SELECT wt.wishlist_id FROM ${Wishlist_table} AS wt , ${user_table} AS u  WHERE u.shop_name = '${req.body.shopName}' AND u.id = wt.wishlist_user_id AND email='${emailOrToken}' AND wt.wishlist_name = '${req.body.wishlistName[i]}'`,
//             //     async (err, result2) => {
//             //         if (err) {
//             //             reject(err);
//             //         } else {
//             //             resolve(result2);
//             //         }
//             //     }
//             // );

//             const query = `SELECT wt.wishlist_id FROM ${Wishlist_table} AS wt JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id WHERE u.shop_name = ?  AND u.email = ? AND wt.wishlist_name = ?`;
//             database.query(query, [req.body.shopName, emailOrToken, req.body.wishlistName[i]], async (err, result2) => {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     resolve(result2);
//                 }
//             });

//         });
//         idArray.push(getAllItems[0]);
//     }

//     for (let i = 0; i < idArray.length; i++) {
//         const sendRes = i === idArray.length - 1 ? "yes" : "no";
//         getVariant(req, res, idArray[i].wishlist_id, sendRes);
//     }
// }
async function CopyMultiWishlist(req, res, emailOrToken) {
  try {
    const idArray = [];

    // 1️⃣ Loop through each wishlist name and fetch its ID
    for (const wishlistName of req.body.wishlistName) {
      const query = `
        SELECT wt.wishlist_id 
        FROM ${Wishlist_table} AS wt
        JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
        WHERE u.shop_name = ? 
          AND u.email = ? 
          AND wt.wishlist_name = ?
      `;

      const [result2] = await database.query(query, [
        req.body.shopName,
        emailOrToken,
        wishlistName,
      ]);

      if (result2.length > 0) {
        idArray.push(result2[0]);
      }
    }

    // 2️⃣ Call getVariant for each wishlist_id
    for (let i = 0; i < idArray.length; i++) {
      const sendRes = i === idArray.length - 1 ? "yes" : "no";
      await getVariant(req, res, idArray[i].wishlist_id, sendRes);
    }

  } catch (err) {
    console.error("❌ Error in CopyMultiWishlist:", err);
    logger.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}


export const editWishlistName = async (req, res) => {
    if (req.body.customerEmail === "") {
        await EditWishlist(req, res, req.body.currentToken);
    } else {
        await EditWishlist(req, res, req.body.customerEmail);
    }
};

// async function EditWishlist(req, res, emailOrToken) {
//     // const checkExistedEmail = database.query(
//     //     `SELECT wt.wishlist_id FROM ${Wishlist_table} AS wt , ${user_table} AS u  WHERE u.shop_name = '${req.body.shopName}' AND u.id = wt.wishlist_user_id AND email='${emailOrToken}' AND wt.wishlist_name ='${req.body.oldWishlistName}'`,
//     //     async (err, result2) => {
//     //         if (err) {
//     //             console.log("err", err);
//     //         } else {
//     //             database.query(
//     //                 `UPDATE ${Wishlist_table} SET wishlist_name = '${req.body.newWishlistName}' WHERE wishlist_id = ${result2[0].wishlist_id}`,
//     //                 async (err, result3) => {
//     //                     if (err) {
//     //                         console.log("err", err);
//     //                     } else {
//     //                         res.send({ msg: "wishlist name updated successfully" });
//     //                     }
//     //                 }
//     //             );
//     //         }
//     //     }
//     // );

//     const selectQuery = `SELECT wt.wishlist_id FROM ${Wishlist_table} AS wt JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id WHERE u.shop_name = ? AND u.email = ? AND wt.wishlist_name = ?`;
//     database.query(selectQuery, [req.body.shopName, emailOrToken, req.body.oldWishlistName], (err, result2) => {
//         if (err) {
//             console.log("❌ SQL Select Error:", err);
//             res.status(500).send({ error: "Database error" });
//         } else if (!result2 || result2.length === 0) {
//             res.status(404).send({ error: "Wishlist not found" });
//         } else {
//             const updateQuery = `UPDATE ${Wishlist_table} SET wishlist_name = ? WHERE wishlist_id = ?`;
//             database.query(updateQuery, [req.body.newWishlistName, result2[0].wishlist_id], (err, result3) => {
//                 if (err) {
//                     console.log("❌ SQL Update Error:", err);
//                     res.status(500).send({ error: "Database error" });
//                 } else {
//                     res.send({ msg: "Wishlist name updated successfully" });
//                 }
//             });
//         }
//     });

// }
async function EditWishlist(req, res, emailOrToken) {
  try {
    // 1️⃣ Select the wishlist by shopName, email, and oldWishlistName
    const selectQuery = `
      SELECT wt.wishlist_id 
      FROM ${Wishlist_table} AS wt
      JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
      WHERE u.shop_name = ? 
        AND u.email = ? 
        AND wt.wishlist_name = ?
    `;

    const [result2] = await database.query(selectQuery, [
      req.body.shopName,
      emailOrToken,
      req.body.oldWishlistName,
    ]);

    // 2️⃣ Handle if no wishlist is found
    if (!result2 || result2.length === 0) {
      return res.status(404).json({ error: "Wishlist not found" });
    }

    const wishlistId = result2[0].wishlist_id;

    // 3️⃣ Update wishlist name
    const updateQuery = `
      UPDATE ${Wishlist_table} 
      SET wishlist_name = ? 
      WHERE wishlist_id = ?
    `;

    const [result3] = await database.query(updateQuery, [
      req.body.newWishlistName,
      wishlistId,
    ]);

    // 4️⃣ Confirm update
    if (result3.affectedRows > 0) {
      res.json({ msg: "Wishlist name updated successfully" });
    } else {
      res.status(400).json({ error: "No changes made" });
    }

  } catch (err) {
    console.error("❌ SQL Error in EditWishlist:", err);
    logger.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


// export const deleteWishlistName = async (req, res) => {
//     if (req.body.customerEmail === "") {
//         //GUEST USER
//         await DeleteMultiWishlist(req, res, req.body.currentToken);
//     } else {
//         //LOGIN USER

//         if (req.body.customerEmail !== "" && req.body.plan >= 4) {
//             const checkKlaviyoRecordExist = await checkKlaviyoRecord(req.body.shopName)
//             const checkKlaviyoApiKeyResult = await checkKlaviyoApiKey(checkKlaviyoRecordExist[0]?.private_key)
//             if (checkKlaviyoRecordExist && checkKlaviyoRecordExist.length > 0 && checkKlaviyoApiKeyResult.type === "success") {

//                 database.query(`SELECT w.wishlist_id FROM wishlist_users as wu, wishlist as w where wu.shop_name="${req.body.shopName}" AND wu.email="${req.body.customerEmail}" AND wu.id = w.wishlist_user_id AND w.wishlist_name="${req.body.keyName}";`, async (err, result2) => {
//                     if (err) {
//                         logger.error(err)
//                     } else {

//                         database.query(`SELECT product_id as productId, variant_id as variantId, title,image,handle   FROM ${product_table} WHERE wishlist_id=${result2[0].wishlist_id}`, async (err, result) => {

//                             if (err) {
//                                 logger.error(err)
//                             } else {
//                                 if (result.length > 0) {
//                                     for (const item of result) {
//                                         item.shopName = req.body.shopName;
//                                         item.customerEmail = req.body.customerEmail;
//                                         item.storeName = req.body.storeName;

//                                         await KlaviyoIntegrationFxn(item, wishlistProductRemoveKlaviyo, checkKlaviyoRecordExist, "byQuery");
//                                     }
//                                 }
//                             }
//                         })
//                     }
//                 })
//             }
//         }
//         await DeleteMultiWishlist(req, res, req.body.customerEmail);
//     }
// };
export const deleteWishlistName = async (req, res) => {
  try {
    const { customerEmail, currentToken, plan, shopName, keyName, storeName } = req.body;

    // 🧍‍♂️ Guest user
    if (!customerEmail) {
      await DeleteMultiWishlist(req, res, currentToken);
      return;
    }

    // 👤 Logged-in user
    if (plan >= 4) {
      const checkKlaviyoRecordExist = await checkKlaviyoRecord(shopName);
      const checkKlaviyoApiKeyResult = await checkKlaviyoApiKey(checkKlaviyoRecordExist[0]?.private_key);

      if (
        checkKlaviyoRecordExist?.length > 0 &&
        checkKlaviyoApiKeyResult.type === "success"
      ) {
        // 1️⃣ Get wishlist_id
        const selectWishlistQuery = `
          SELECT w.wishlist_id 
          FROM wishlist_users AS wu
          JOIN wishlist AS w ON wu.id = w.wishlist_user_id
          WHERE wu.shop_name = ? 
            AND wu.email = ? 
            AND w.wishlist_name = ?
        `;

        const [wishlistResult] = await database.query(selectWishlistQuery, [
          shopName,
          customerEmail,
          keyName,
        ]);

        if (wishlistResult.length > 0) {
          const wishlistId = wishlistResult[0].wishlist_id;

          // 2️⃣ Get product details
          const selectProductsQuery = `
            SELECT product_id AS productId, variant_id AS variantId, title, image, handle
            FROM ${product_table}
            WHERE wishlist_id = ?
          `;

          const [productResult] = await database.query(selectProductsQuery, [wishlistId]);

          // 3️⃣ Send data to Klaviyo if products exist
          if (productResult.length > 0) {
            for (const item of productResult) {
              const enrichedItem = {
                ...item,
                shopName,
                customerEmail,
                storeName,
              };
              await KlaviyoIntegrationFxn(
                enrichedItem,
                wishlistProductRemoveKlaviyo,
                checkKlaviyoRecordExist,
                "byQuery"
              );
            }
          }
        }
      }
    }

    // 4️⃣ Delete wishlist
    await DeleteMultiWishlist(req, res, customerEmail);

  } catch (err) {
    console.error("❌ Error in deleteWishlistName:", err);
    logger.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};



// async function DeleteMultiWishlist(req, res, emailOrToken) {
//     // const checkExistedEmail = database.query(
//     //     `SELECT wt.wishlist_id FROM ${Wishlist_table} AS wt , ${user_table} AS u  WHERE u.shop_name = '${req.body.shopName}' AND u.id = wt.wishlist_user_id AND email='${emailOrToken}' AND wt.wishlist_name ='${req.body.keyName}'`,
//     //     async (err, result2) => {
//     //         if (err) {
//     //             console.log("err", err);
//     //         } else {
//     //             database.query(
//     //                 `DELETE FROM ${product_table} WHERE wishlist_id = ${result2[0].wishlist_id}`,
//     //                 async (err, result3) => {
//     //                     if (err) {
//     //                         console.log(err);
//     //                     } else {
//     //                         database.query(
//     //                             `DELETE FROM ${Wishlist_table} WHERE wishlist_id = ${result2[0].wishlist_id}`,
//     //                             async (err, result4) => {
//     //                                 if (err) {
//     //                                     console.log(err);
//     //                                 } else {
//     //                                     res.send({ msg: "wishlist deleted successfuly" });
//     //                                 }
//     //                             }
//     //                         );
//     //                     }
//     //                 }
//     //             );
//     //         }
//     //     }
//     // );

//     database.query(`SELECT wt.wishlist_id  FROM ${Wishlist_table} AS wt, ${user_table} AS u   WHERE u.shop_name = ?  AND u.id = wt.wishlist_user_id  AND u.email = ?  AND wt.wishlist_name = ?`,
//         [req.body.shopName, emailOrToken, req.body.keyName],
//         (err, result2) => {
//             if (err) {
//                 console.log("err", err);
//             } else if (result2.length === 0) {
//                 res.send({ msg: "No wishlist found" });
//             } else {
//                 const wishlistId = result2[0].wishlist_id;
//                 database.query(
//                     `DELETE FROM ${product_table} WHERE wishlist_id = ?`,
//                     [wishlistId],
//                     (err) => {
//                         if (err) {
//                             console.log(err);
//                         } else {
//                             database.query(
//                                 `DELETE FROM ${Wishlist_table} WHERE wishlist_id = ?`,
//                                 [wishlistId],
//                                 (err) => {
//                                     if (err) {
//                                         console.log(err);
//                                     } else {
//                                         res.send({ msg: "wishlist deleted successfuly" });
//                                     }
//                                 }
//                             );
//                         }
//                     }
//                 );
//             }
//         }
//     );
// }
async function DeleteMultiWishlist(req, res, emailOrToken) {
  try {
    const { shopName, keyName } = req.body;

    // 1️⃣ Find the wishlist ID
    const selectQuery = `
      SELECT wt.wishlist_id
      FROM ${Wishlist_table} AS wt
      JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
      WHERE u.shop_name = ? AND u.email = ? AND wt.wishlist_name = ?
    `;

    const [result2] = await database.query(selectQuery, [shopName, emailOrToken, keyName]);

    if (result2.length === 0) {
      return res.send({ msg: "No wishlist found" });
    }

    const wishlistId = result2[0].wishlist_id;

    // 2️⃣ Delete related products first
    const deleteProductsQuery = `DELETE FROM ${product_table} WHERE wishlist_id = ?`;
    await database.query(deleteProductsQuery, [wishlistId]);

    // 3️⃣ Delete the wishlist itself
    const deleteWishlistQuery = `DELETE FROM ${Wishlist_table} WHERE wishlist_id = ?`;
    await database.query(deleteWishlistQuery, [wishlistId]);

    // 4️⃣ Send response
    res.send({ msg: "wishlist deleted successfully" });

  } catch (err) {
    console.error("❌ Error in DeleteMultiWishlist:", err);
    logger.error(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
}


export const getMultiWishlistData = async (req, res) => {
    if (req.body.customerEmail === "") {
        await getMultiWishlist(req, res, req.body.currentToken);
    } else {
        await getMultiWishlist(req, res, req.body.customerEmail);
    }
};

// async function getMultiWishlist(req, res, emailOrToken) {
//     const checkExistedEmail = database.query(
//         `SELECT wt.wishlist_name FROM ${Wishlist_table} AS wt , ${user_table} AS u  WHERE u.shop_name = '${req.body.shopName}' AND u.id = wt.wishlist_user_id AND email='${emailOrToken}'`,
//         async (err, result2) => {
//             if (err) {
//                 console.log("err", err);
//             } else {
//                 // console.log("re", result2)
//                 if (result2.length !== 0) {
//                     const values = result2.map(item => item.wishlist_name);
//                     res.send({ data: values });
//                 } else {
//                     res.send({ data: [] });
//                 }
//             }
//         }
//     );
// }
async function getMultiWishlist(req, res, emailOrToken) {
  try {
    const { shopName } = req.body;

    const selectQuery = `
      SELECT wt.wishlist_name
      FROM ${Wishlist_table} AS wt
      JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
      WHERE u.shop_name = ? AND u.email = ?
    `;

    const [result2] = await database.query(selectQuery, [shopName, emailOrToken]);

    if (result2.length > 0) {
      const values = result2.map(item => item.wishlist_name);
      res.send({ data: values });
    } else {
      res.send({ data: [] });
    }

  } catch (err) {
    console.error("❌ Error in getMultiWishlist:", err);
    logger.error(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

export const createUser = async (req, res) => {


    if (req.body.shopName === "wishlist-guru.myshopify.com") {
        console.log("shopName ---- ", req.body.shopName);
        console.log("title ---- ", req.body.title);
    }


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
        //     const dataDomain = wfGetDomain
        // const dataDomain = `https://www.thelittlemarshmallow.com/`
        const response = await fetch(`${wfGetDomain}variants/${variantId}.json`);
        // const response = await fetch(`https://www.thelittlemarshmallow.com/variants/42440271298675.js`);
        // const response = await fetch(`https://danskcopenhagen.com/variants/47430619922778.js`);
        // const response = await fetch(`https://bravelittlelamb.com/variants/41265312661527.json`);
        // const response = await fetch(`https://enyoliving.com/variants/45786770309373.json`);
        // const response = await fetch(`https://www.moonbeakcandles.com/variants/42514549080115.js`);

        // let response;
        // if (dataDomain === 'https://enyoliving.com/') {
        //   response = await fetch(`https://enyoliving.com/variants/45786770309373.js`);
        // } else if (dataDomain === 'https://www.thelittlemarshmallow.com/') {
        //   response = await fetch(`https://www.thelittlemarshmallow.com/variants/42440271298675.js`);
        // } else {
        //   response = await fetch(`${wfGetDomain}variants/${variantId}.js`);
        //   console.log("nothing22");
        // }

        if (!response.ok) {
            return null
        }

        const buttonResponseData = await response.json();
        return buttonResponseData?.product_variant?.price
    } catch (error) {
        // console.error('Error fetching product price:', error);
    }
}

// async function guestUser(req, res) {
//     const checkGuestToken = database.query(
//         `SELECT wt.wishlist_user_id AS wishId, wt.wishlist_id AS id, wt.wishlist_name AS name FROM ${Wishlist_table} AS wt , ${user_table} AS u  WHERE u.shop_name = '${req.body.shopName}' AND u.id = wt.wishlist_user_id AND u.email = '${req.body.guestToken}';
//   `,
//         async (err, result) => {
//             if (err) {
//             } else {
//                 // @ts-ignore

//                 // console.log("result ---11111 ", result)

//                 if (result.length === 0) {

//                     // console.log("im in first one")


//                     database.query(
//                         `SELECT u.id AS id FROM ${user_table} AS u  WHERE u.shop_name = '${req.body.shopName}' AND email='${req.body.customerEmail}'`,
//                         async (err, result3) => {
//                             if (err) {
//                                 console.log(err);
//                             } else {
//                                 const dataValue = "guest";
//                                 updateDataFxn2(result3, req, res, dataValue);

//                                 if (req.body.shopName === "wishlist-guru.myshopify.com") {
//                                     console.log("updateDataFxn2 ---- ")
//                                 }


//                             }
//                         }
//                     );
//                 } else {

//                     // console.log("im in first seond")

//                     updateDataFxn(result, req, res);

//                     if (req.body.shopName === "wishlist-guru.myshopify.com") {
//                         console.log("updateDataFxn ---- ")
//                     }

//                 }
//             }
//         }
//     );
// }
async function guestUser(req, res) {
  try {
    const { shopName, guestToken, customerEmail } = req.body;

    // 1️⃣ Check if guest token exists
    const checkGuestTokenQuery = `
      SELECT wt.wishlist_user_id AS wishId, wt.wishlist_id AS id, wt.wishlist_name AS name
      FROM ${Wishlist_table} AS wt
      JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
      WHERE u.shop_name = ? AND u.email = ?;
    `;

    const [guestResult] = await database.query(checkGuestTokenQuery, [shopName, guestToken]);

    // 2️⃣ If no guest wishlist exists → check if registered customer exists
    if (guestResult.length === 0) {
      const checkCustomerQuery = `
        SELECT u.id AS id
        FROM ${user_table} AS u
        WHERE u.shop_name = ? AND u.email = ?;
      `;

      const [customerResult] = await database.query(checkCustomerQuery, [shopName, customerEmail]);

      const dataValue = "guest";
      await updateDataFxn2(customerResult, req, res, dataValue);

      if (shopName === "wishlist-guru.myshopify.com") {
        console.log("updateDataFxn2 ----");
      }

    } else {
      // 3️⃣ Guest wishlist found → call updateDataFxn
      await updateDataFxn(guestResult, req, res);

      if (shopName === "wishlist-guru.myshopify.com") {
        console.log("updateDataFxn ----");
      }
    }

  } catch (err) {
    console.error("❌ Error in guestUser:", err);
    res.status(500).send({ error: "Internal Server Error" });
  }
}


// async function loginUser(req, res) {
//     const checkGuestToken = database.query(
//         `SELECT wt.wishlist_id AS id FROM ${Wishlist_table} AS wt , ${user_table} AS u  WHERE u.shop_name = '${req.body.shopName}' AND u.id = wt.wishlist_user_id AND u.email='${req.body.guestToken}'`,
//         async (err, result) => {
//             if (err) {
//                 console.log("err", err);
//             } else {
//                 // @ts-ignore


//                 // console.log("login result --- ", result)

//                 if (result.length !== 0) {
//                     const updateGuestTokenToEmail = database.query(
//                         `UPDATE wishlist_users SET email='${req.body.customerEmail}', user_type='User' WHERE email='${req.body.guestToken}' `,
//                         (err, updateTokenToEmail) => {
//                             if (err) {
//                                 console.log(err);
//                                 logger.error(err);
//                             } else {
//                                 const selectedUserId1 = result[0].id;
//                                 getVariant(req, res, selectedUserId1);
//                             }
//                         }
//                     );
//                 } else {
//                     const checkExistedEmail = database.query(
//                         `SELECT wt.wishlist_user_id AS wishId, wt.wishlist_id AS id, wt.wishlist_name AS name FROM ${Wishlist_table} AS wt , ${user_table} AS u  WHERE u.shop_name = '${req.body.shopName}' AND u.id = wt.wishlist_user_id AND email='${req.body.customerEmail}'`,
//                         async (err, result2) => {
//                             if (err) {
//                                 console.log("err", err);
//                             } else {
//                                 if (result2.length !== 0) {
//                                     updateDataFxn(result2, req, res);
//                                 } else {
//                                     database.query(
//                                         `SELECT u.id AS id FROM ${user_table} AS u  WHERE u.shop_name = '${req.body.shopName}' AND email='${req.body.customerEmail}'`,
//                                         async (err, result3) => {
//                                             if (err) {
//                                                 console.log(err);
//                                             } else {
//                                                 const dataValue = "login";
//                                                 updateDataFxn2(result3, req, res, dataValue);
//                                             }
//                                         }
//                                     );
//                                 }
//                             }
//                         }
//                     );
//                 }
//             }
//         }
//     );
// }
async function loginUser(req, res) {
  try {
    const { shopName, guestToken, customerEmail } = req.body;

    // 1️⃣ Check if guest token already exists
    const guestQuery = `
      SELECT wt.wishlist_id AS id
      FROM ${Wishlist_table} AS wt
      JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
      WHERE u.shop_name = ? AND u.email = ?;
    `;
    const [guestResult] = await database.query(guestQuery, [shopName, guestToken]);

    // 2️⃣ If guest data exists → update it to a login user
    if (guestResult.length !== 0) {
      const updateQuery = `
        UPDATE ${user_table}
        SET email = ?, user_type = 'User'
        WHERE email = ?;
      `;
      await database.query(updateQuery, [customerEmail, guestToken]);

      const selectedUserId1 = guestResult[0].id;
      await getVariant(req, res, selectedUserId1);

    } else {
      // 3️⃣ If guest data not found, check if this customer already has a wishlist
      const existingEmailQuery = `
        SELECT wt.wishlist_user_id AS wishId, wt.wishlist_id AS id, wt.wishlist_name AS name
        FROM ${Wishlist_table} AS wt
        JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
        WHERE u.shop_name = ? AND u.email = ?;
      `;
      const [existingEmailResult] = await database.query(existingEmailQuery, [shopName, customerEmail]);

      if (existingEmailResult.length !== 0) {
        await updateDataFxn(existingEmailResult, req, res);
      } else {
        // 4️⃣ If user exists but has no wishlist, get user id
        const userQuery = `
          SELECT u.id AS id
          FROM ${user_table} AS u
          WHERE u.shop_name = ? AND u.email = ?;
        `;
        const [userResult] = await database.query(userQuery, [shopName, customerEmail]);

        const dataValue = "login";
        await updateDataFxn2(userResult, req, res, dataValue);
      }
    }
  } catch (err) {
    console.error("❌ Error in loginUser:", err);
    res.status(500).send({ error: "Internal Server Error" });
  }
}


// async function updateDataFxn(result, req, res) {
//     let matchingIds = [];
//     let nonMatchingNames = [];
//     let delMatchingIds = [];
//     let ids = null;
//     const selectedUserId = result[0].wishId;

//     if (
//         req.body.wishlistName.length > 0 &&
//         req.body.wishlistName[0] !== "wfNotMulti"
//     ) {
//         for (const name of req.body.wishlistName) {
//             const matchingObjects = result.filter(
//                 (obj) => obj.name.toLowerCase() === name.toLowerCase()
//             );
//             if (matchingObjects.length > 0) {
//                 matchingIds.push(...matchingObjects.map((obj) => obj.id));
//             } else {
//                 nonMatchingNames.push(name);
//             }
//         }
//     }

//     if (req.body.DelWishlistName !== undefined) {
//         for (const name of req.body.DelWishlistName) {
//             const matchingObjects = result.filter(
//                 (obj) => obj.name.toLowerCase() === name.toLowerCase()
//             );
//             if (matchingObjects.length > 0) {
//                 delMatchingIds.push(...matchingObjects.map((obj) => obj.id));
//             }
//         }
//     }

//     if (matchingIds.length > 0) {
//         for (let i = 0; i < matchingIds.length; i++) {
//             let sendRes =
//                 nonMatchingNames.length > 0
//                     ? "no"
//                     : delMatchingIds.length > 0
//                         ? "no"
//                         : i === matchingIds.length - 1
//                             ? "yes"
//                             : "no";

//             // sendRes = sendRES !== null && sendRES;
//             getVariant(req, res, matchingIds[i], sendRes);
//         }
//     }

//     if (req.body.wishlistName[0] === "wfNotMulti") {
//         ids = result.map((obj) => obj.id);
//     }

//     if (nonMatchingNames.length > 0) {
//         for (let i = 0; i < nonMatchingNames.length; i++) {

//             // database.query(
//             //     `INSERT INTO ${Wishlist_table}(wishlist_user_id,wishlist_name, update_at, created_at) VALUES (${selectedUserId},'${nonMatchingNames[i]}', CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
//             //     (err, result3) => {
//             //         if (err) {
//             //             console.log(err);
//             //         } else {
//             //             let sendRes =
//             //                 delMatchingIds.length > 0
//             //                     ? "no"
//             //                     : i === nonMatchingNames.length - 1
//             //                         ? "yes"
//             //                         : "no";

//             //             // sendRes = sendRES !== null && sendRES;
//             //             const selectedUserId1 = result3.insertId;
//             //             getVariant(req, res, selectedUserId1, sendRes);
//             //         }
//             //     }
//             // );

//             const query = `
//   INSERT INTO ${Wishlist_table} (wishlist_user_id, wishlist_name, update_at, created_at)
//   VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
// `;

//             database.query(query, [selectedUserId, nonMatchingNames[i]], (err, result3) => {
//                 if (err) {
//                     console.log("❌ SQL Error:", err);
//                 } else {
//                     const sendRes =
//                         delMatchingIds.length > 0
//                             ? "no"
//                             : i === nonMatchingNames.length - 1
//                                 ? "yes"
//                                 : "no";

//                     const selectedUserId1 = result3.insertId;
//                     getVariant(req, res, selectedUserId1, sendRes);
//                 }
//             });

//         }
//     }

//     if (delMatchingIds.length > 0) {
//         for (let i = 0; i < delMatchingIds.length; i++) {
//             let sendRes = i === delMatchingIds.length - 1 ? "yes" : "no";
//             // sendRes = sendRES !== null && sendRES;

//             deleteProduct(
//                 req,
//                 res,
//                 delMatchingIds[i],
//                 sendRes,
//                 matchingIds,
//                 delMatchingIds
//             );
//         }
//     }

//     if (ids !== null && ids.length !== 0) {
//         for (let i = 0; i < ids.length; i++) {
//             let sendRes = i === ids.length - 1 ? "yes" : "no";
//             // sendRes = sendRES !== null && sendRES;
//             deleteProduct(req, res, ids[i], sendRes, [], []);
//         }
//     }
// }
async function updateDataFxn(result, req, res) {
  try {
    let matchingIds = [];
    let nonMatchingNames = [];
    let delMatchingIds = [];
    let ids = null;

    const selectedUserId = result[0].wishId;

    // ✅ Match existing wishlists
    if (req.body.wishlistName.length > 0 && req.body.wishlistName[0] !== "wfNotMulti") {
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

    // ✅ Identify wishlists to delete
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

    // ✅ Process existing wishlists
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

    // ✅ Handle wfNotMulti case
    if (req.body.wishlistName[0] === "wfNotMulti") {
      ids = result.map((obj) => obj.id);
    }

    // ✅ Insert new wishlists
    if (nonMatchingNames.length > 0) {
      const insertQuery = `
        INSERT INTO ${Wishlist_table} (wishlist_user_id, wishlist_name, update_at, created_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;

      for (let i = 0; i < nonMatchingNames.length; i++) {
        const [result3] = await database.query(insertQuery, [selectedUserId, nonMatchingNames[i]]);

        const sendRes =
          delMatchingIds.length > 0
            ? "no"
            : i === nonMatchingNames.length - 1
            ? "yes"
            : "no";

        const newWishlistId = result3.insertId;
        await getVariant(req, res, newWishlistId, sendRes);
      }
    }

    // ✅ Delete specific wishlists
    if (delMatchingIds.length > 0) {
      for (let i = 0; i < delMatchingIds.length; i++) {
        const sendRes = i === delMatchingIds.length - 1 ? "yes" : "no";
        await deleteProduct(req, res, delMatchingIds[i], sendRes, matchingIds, delMatchingIds);
      }
    }

    // ✅ Delete wfNotMulti wishlists
    if (ids !== null && ids.length !== 0) {
      for (let i = 0; i < ids.length; i++) {
        const sendRes = i === ids.length - 1 ? "yes" : "no";
        await deleteProduct(req, res, ids[i], sendRes, [], []);
      }
    }
  } catch (err) {
    console.error("❌ Error in updateDataFxn:", err);
    res.status(500).send({ error: "Database error in updateDataFxn" });
  }
}


// async function updateDataFxn2(result, req, res, dataValue) {
//     // Define the queries to add indexes
//     // const addIndexesQueries = [
//     //     `CREATE INDEX IF NOT EXISTS idx_user_shop_name ON ${user_table}(shop_name);`,
//     //     `CREATE INDEX IF NOT EXISTS idx_user_email ON ${user_table}(email);`,
//     //     `CREATE INDEX IF NOT EXISTS idx_user_referral ON ${user_table}(referral_user_id);`,
//     //     `CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON ${Wishlist_table}(wishlist_user_id);`,
//     //     `CREATE INDEX IF NOT EXISTS idx_wishlist_name ON ${Wishlist_table}(wishlist_name);`
//     // ];

//     try {
//         // Add indexes
//         // for (const query of addIndexesQueries) {
//         //     await database.promise().query(query); // Use promise-based query execution for async/await
//         // }

//         // Proceed with the main logic
//         if (result.length !== 0) {
//             const selectedUserId = result[0].id;
//             for (let i = 0; i < req.body.wishlistName.length; i++) {
//                 database.query(
//                     `INSERT INTO ${Wishlist_table}(wishlist_user_id, wishlist_name, update_at, created_at)
//            VALUES (${selectedUserId}, '${req.body.wishlistName[i]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
//                     (err, result5) => {
//                         if (err) {
//                             console.log(err);
//                         } else {
//                             let sendRes = i === req.body.wishlistName.length - 1 ? "yes" : "no";
//                             const selectedUserId1 = result5.insertId;
//                             getVariant(req, res, selectedUserId1, sendRes);
//                         }
//                     }
//                 );
//             }
//         } else {
//             let storeNameUpdate = req.body.storeName.replace(/'/g, "~");
//             database.query(
//                 `INSERT INTO ${user_table} (shop_name, email, user_type, store_name, language, referral_user_id)
//          VALUES (
//            '${req.body.shopName}',
//            '${dataValue === "login" ? req.body.customerEmail : req.body.guestToken}',
//            '${dataValue === "login" ? "User" : "Guest"}',
//            '${storeNameUpdate}',
//            '${req.body.language}',
//            ${req.body.referral_id || null}
//          )`,
//                 async (err, result4) => {
//                     if (err) {
//                         console.log(err);
//                     } else {
//                         const selectedUserId = result4.insertId;

//                         // console.log("selectedUserId ---- ", selectedUserId)

//                         let roughToken = '';
//                         let token = req?.headers['wg-api-key'];
//                         if (!token || token === null || token === "null" || token === undefined || token.trim() === "" || !isValidToken(token)) {
//                             // If no token OR empty OR invalid → generate a new one
//                             roughToken = await generateToken(selectedUserId);
//                         } else {
//                             roughToken = token;
//                         }

//                         for (let i = 0; i < req.body.wishlistName.length; i++) {
//                             database.query(
//                                 `INSERT INTO ${Wishlist_table}(wishlist_user_id, wishlist_name, update_at, created_at)
//                  VALUES (${selectedUserId}, '${req.body.wishlistName[i]}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
//                                 (err, result5) => {
//                                     if (err) {
//                                         console.log(err);
//                                     } else {
//                                         let sendRes = i === req.body.wishlistName.length - 1 ? "yes" : "no";
//                                         const selectedUserId1 = result5.insertId;
//                                         getVariant(req, res, selectedUserId1, sendRes, roughToken);
//                                     }
//                                 }
//                             );
//                         }
//                     }
//                 }
//             );
//         }
//     } catch (err) {
//         console.error("Error adding indexes:", err);
//         res.status(500).send("Internal Server Error");
//     }
// }
async function updateDataFxn2(result, req, res, dataValue) {
  try {
    if (result.length !== 0) {
      // ✅ Existing user found
      const selectedUserId = result[0].id;

      const insertWishlistQuery = `
        INSERT INTO ${Wishlist_table} 
        (wishlist_user_id, wishlist_name, update_at, created_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;

      for (let i = 0; i < req.body.wishlistName.length; i++) {
        const [result5] = await database.query(insertWishlistQuery, [
          selectedUserId,
          req.body.wishlistName[i],
        ]);

        const sendRes = i === req.body.wishlistName.length - 1 ? "yes" : "no";
        const selectedUserId1 = result5.insertId;
        await getVariant(req, res, selectedUserId1, sendRes);
      }
    } else {
      // ✅ No existing user → create new user record
      const storeNameUpdate = req.body.storeName.replace(/'/g, "~");

      const insertUserQuery = `
        INSERT INTO ${user_table} 
        (shop_name, email, user_type, store_name, language, referral_user_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result4] = await database.query(insertUserQuery, [
        req.body.shopName,
        dataValue === "login" ? req.body.customerEmail : req.body.guestToken,
        dataValue === "login" ? "User" : "Guest",
        storeNameUpdate,
        req.body.language,
        req.body.referral_id || null,
      ]);

      const selectedUserId = result4.insertId;

      // ✅ Token logic
      let roughToken = "";
      const token = req?.headers["wg-api-key"];
      if (
        !token ||
        token === null ||
        token === "null" ||
        token === undefined ||
        token.trim() === "" ||
        !isValidToken(token)
      ) {
        roughToken = await generateToken(selectedUserId);
      } else {
        roughToken = token;
      }

      // ✅ Insert all wishlists for this new user
      const insertWishlistQuery = `
        INSERT INTO ${Wishlist_table} 
        (wishlist_user_id, wishlist_name, update_at, created_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;

      for (let i = 0; i < req.body.wishlistName.length; i++) {
        const [result5] = await database.query(insertWishlistQuery, [
          selectedUserId,
          req.body.wishlistName[i],
        ]);

        const sendRes = i === req.body.wishlistName.length - 1 ? "yes" : "no";
        const selectedUserId1 = result5.insertId;

        await getVariant(req, res, selectedUserId1, sendRes, roughToken);
      }
    }
  } catch (err) {
    console.error("❌ Error in updateDataFxn2:", err);
    res.status(500).send({ error: "Database error in updateDataFxn2" });
  }
}


// async function getVariant(req, res, selectedUserId, sendRes, roughToken = null) {


//     if (req.body.shopName === "wishlist-guru.myshopify.com") {
//         console.log("getVariant ---- ")
//     }


//     // Add indexes to improve query performance
//     // const addIndexesQueries = [
//     //     `CREATE INDEX IF NOT EXISTS idx_product_product_id_wishlist_id ON ${product_table}(product_id, wishlist_id);`,
//     //     `CREATE INDEX IF NOT EXISTS idx_user_shop_name ON ${user_table}(shop_name);` // Example if user_table is queried elsewhere
//     // ];

//     try {
//         // Create indexes before executing the query
//         // for (const query of addIndexesQueries) {
//         //     await database.promise().query(query);
//         // }

//         // Main query execution
//         // console.log("GHGHGHGHGHGH ---- ", req?.body?.specificVariant)

//         let addQueryy;
//         if (req.body.specificVariant === true) {
//             addQueryy = `SELECT product_id FROM ${product_table} WHERE product_id='${req.body.productId}' AND variant_id='${req.body.variantId}' AND wishlist_id='${selectedUserId}'`;
//         } else {
//             addQueryy = `SELECT product_id FROM ${product_table} WHERE product_id='${req.body.productId}' AND wishlist_id='${selectedUserId}'`;
//         }

//         const getVariantId = database.query(addQueryy
//             // `SELECT product_id FROM ${product_table} WHERE product_id='${req.body.productId}' AND wishlist_id='${selectedUserId}' `
//             // `SELECT product_id FROM ${product_table} WHERE product_id='${req.body.productId}' AND variant_id='${req.body.variantId}' AND wishlist_id='${selectedUserId}'`
//             ,
//             async (err, result) => {
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     if (result.length === 0) {

//                         // console.log("addProduct ---- ")
//                         addProduct(req, res, selectedUserId, sendRes, roughToken);
//                         if (req.body.customerEmail !== "" && req.body.plan >= 4) {

//                             const checkKlaviyoRecordExist = await checkKlaviyoRecord(req.body.shopName)
//                             if (checkKlaviyoRecordExist && checkKlaviyoRecordExist.length > 0) {
//                                 const checkKlaviyoApiKeyResult = await checkKlaviyoApiKey(checkKlaviyoRecordExist[0]?.private_key)
//                                 if (checkKlaviyoApiKeyResult.type === "success") {
//                                     await KlaviyoIntegrationFxn(req, wishlistProductAddedKlaviyo, checkKlaviyoRecordExist, "");
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         );
//     } catch (err) {
//         console.error("Error adding indexes:", err);
//         res.status(500).send("Internal Server Error");
//     }
// }
async function getVariant(req, res, selectedUserId, sendRes, roughToken = null) {
  try {
    if (req.body.shopName === "wishlist-guru.myshopify.com") {
      console.log("getVariant ---- ");
    }

    // ✅ Build the query safely using parameterized syntax
    let query = "";
    let params = [];

    if (req.body.specificVariant === true) {
      query = `
        SELECT product_id 
        FROM ${product_table} 
        WHERE product_id = ? 
          AND variant_id = ? 
          AND wishlist_id = ?
      `;
      params = [req.body.productId, req.body.variantId, selectedUserId];
    } else {
      query = `
        SELECT product_id 
        FROM ${product_table} 
        WHERE product_id = ? 
          AND wishlist_id = ?
      `;
      params = [req.body.productId, selectedUserId];
    }

    // ✅ Await the query
    const [result] = await database.query(query, params);

    // ✅ If product doesn't exist in wishlist → add it
    if (result.length === 0) {
      await addProduct(req, res, selectedUserId, sendRes, roughToken);

      // ✅ If email + plan conditions met, trigger Klaviyo integration
      if (req.body.customerEmail !== "" && req.body.plan >= 4) {
        const checkKlaviyoRecordExist = await checkKlaviyoRecord(req.body.shopName);

        if (checkKlaviyoRecordExist && checkKlaviyoRecordExist.length > 0) {
          const checkKlaviyoApiKeyResult = await checkKlaviyoApiKey(
            checkKlaviyoRecordExist[0]?.private_key
          );

          if (checkKlaviyoApiKeyResult.type === "success") {
            await KlaviyoIntegrationFxn(
              req,
              wishlistProductAddedKlaviyo,
              checkKlaviyoRecordExist,
              ""
            );
          }
        }
      }
    }
  } catch (err) {
    console.error("❌ Error in getVariant:", err);
    res.status(500).send("Internal Server Error in getVariant");
  }
}


// async function addProduct(req, res, selectedUserId, sendRes, roughToken = null) {

//     if (req.body.shopName === "wishlist-guru.myshopify.com") {
//         console.log("addProduct ---- ")
//     }


//     // Ensure indexes are in place before running queries
//     // database.query(`CREATE INDEX IF NOT EXISTS idx_shop_name_app_install ON ${app_installation_table} (shop_name)`);
//     // database.query(`CREATE INDEX IF NOT EXISTS idx_app_install_id_log ON ${app_installation_log_table} (app_install_id, log_date)`);
//     // database.query(`CREATE INDEX IF NOT EXISTS idx_payment_status_log ON payment_logs (payment_status, app_install_id)`);
//     // database.query(`CREATE INDEX IF NOT EXISTS idx_plan_id ON plan (plan_id)`);
//     // database.query(`CREATE INDEX IF NOT EXISTS idx_wishlist_id_created_at ON ${product_table} (wishlist_id, created_at)`);

//     const freeQuery = `SELECT ail.log_date AS max_date, ail.plan_type AS max_plan_type FROM ${app_installation_log_table} as ail, ${app_installation_table} as ai WHERE ai.shop_name="${req.body.shopName}" AND ail.app_install_id = ai.app_install_id ORDER BY ail.log_date DESC LIMIT 1;`;

//     const paidQuery = `SELECT MAX(ail.log_date) AS max_date, MAX(pl.plan_type) AS max_plan_type
//       FROM ${app_installation_log_table} AS ail
//       JOIN ${app_installation_table} AS ai ON ail.app_install_id = ai.app_install_id
//       JOIN (
//           SELECT app_install_id, MAX(id)
//           AS latest_payment_log_id
//           FROM payment_logs
//           WHERE payment_status = "ACTIVE"
//           GROUP BY app_install_id
//       ) AS latest_payment ON ai.app_install_id = latest_payment.app_install_id
//       JOIN payment_logs AS pl ON latest_payment.latest_payment_log_id = pl.id
//       WHERE ai.shop_name = "${req.body.shopName}";`;

//     const isFreePlan = database.query(
//         `SELECT active_plan_id as plan_id from ${app_installation_table} WHERE shop_name = "${req.body.shopName}"`,
//         (err, planResult) => {
//             if (err) {
//                 console.log(err);
//             } else {
//                 if (planResult.length === 0) {
//                     let planNameExtract = "";
//                     if (req.body.plan === 4) {
//                         planNameExtract = "Premium";
//                     } else if (req.body.plan === 3) {
//                         planNameExtract = "Pro";
//                     } else if (req.body.plan === 2) {
//                         planNameExtract = "Basic";
//                     } else {
//                         planNameExtract = "Free";
//                     }

//                     let storeName = req.body.storeName.replace(/'/g, "~");

//                     database.query(
//                         `INSERT INTO ${app_installation_table} (shop_name, status, active_plan_id, active_plan_name, store_name) VALUES ('${req.body.shopName}','Active','${req.body.plan}','${planNameExtract}', '${storeName}')`,
//                         (err, reEnteredData) => {
//                             if (err) {
//                                 console.log(err);
//                                 logger.error(err);
//                             } else {
//                                 database.query(
//                                     `INSERT INTO ${app_installation_log_table} (app_install_id, plan_id, plan_name, plan_type) VALUES (${reEnteredData.insertId},'${req.body.plan}','${planNameExtract}', 'MONTHLY')`,
//                                     (err, result3) => {
//                                         if (err) {
//                                             console.log(err);
//                                             logger.error(err);
//                                         } else {
//                                             addProduct(req, res, selectedUserId, sendRes, roughToken);
//                                         }
//                                     }
//                                 );
//                             }
//                         }
//                     );
//                 } else {


//                     // console.log("PLan not zero----")
//                     const planId = planResult[0].plan_id;
//                     const checkLimit = database.query(freeQuery, (err, planDate) => {
//                         if (err) {
//                             console.log(err);
//                         } else {
//                             if (planDate[0]?.max_date === null) {
//                                 // console.log("planDate is null");
//                             } else {
//                                 console.log("planDate = ", planDate)
//                                 let planStartDate = planDate[0].max_date.toISOString();
//                                 let givenDate = new Date(planStartDate);
//                                 let nextMonthDate = new Date(givenDate);

//                                 if (planId === 1) {
//                                     nextMonthDate.setDate(nextMonthDate.getDate() + 32);
//                                 } else {
//                                     if (planDate[0].max_plan_type === "MONTHLY") {
//                                         nextMonthDate.setDate(nextMonthDate.getDate() + 32);
//                                     } else {
//                                         nextMonthDate.setFullYear(nextMonthDate.getFullYear() + 1);
//                                         nextMonthDate.setDate(nextMonthDate.getDate() + 2);
//                                     }
//                                 }

//                                 let planExpiryDate = nextMonthDate.toISOString();
//                                 let currentDate = new Date();
//                                 let todayDATE = currentDate.toISOString();

//                                 let monthFirstDay = new Date(
//                                     currentDate.getFullYear(),
//                                     currentDate.getMonth(),
//                                     1
//                                 );
//                                 let monthLastDay = new Date(
//                                     currentDate.getFullYear(),
//                                     currentDate.getMonth() + 1,
//                                     0
//                                 );

//                                 const checkLimit = database.query(
//                                     `SELECT w.title, p.quota, p.name FROM ${user_table} as u, ${Wishlist_table} as wt, ${product_table} as w, plan as p WHERE u.shop_name="${req.body.shopName}"
//                   AND u.id = wt.wishlist_user_id AND wt.wishlist_id=w.wishlist_id AND p.plan_id="${req.body.plan}"
//                   AND w.created_at >= "${monthFirstDay.toISOString()}" AND CAST(w.created_at as DATE) <= "${monthLastDay.toISOString()}";`,
//                                     (err, list) => {
//                                         if (err) {
//                                             console.log(err);
//                                             logger.error(err);
//                                         } else {
//                                             addItemAfterPlan(
//                                                 list,
//                                                 planId,
//                                                 planDate[0]?.max_plan_type || null,
//                                                 roughToken
//                                             );
//                                         }
//                                     }
//                                 );
//                             }
//                         }
//                     });

//                     function addItemAfterPlan(list, planId, plan_type, roughToken = null) {
//                         const productTitleCode = req.body.title
//                             .replace(/\/wg-sgl/g, "'")
//                             .replace(/\/wg-dbl/g, '"')
//                             .replace(/'/g, "`");

//                         // Ensure indexes are in place
//                         // database.query(`CREATE INDEX IF NOT EXISTS idx_wishlist_id ON ${product_table} (wishlist_id)`);
//                         // database.query(`CREATE INDEX IF NOT EXISTS idx_update_at ON ${Wishlist_table} (update_at)`);
//                         // database.query(`CREATE INDEX IF NOT EXISTS idx_shop_name ON app_installation (shop_name)`);
//                         // database.query(`CREATE INDEX IF NOT EXISTS idx_created_at ON wishlist_items (created_at)`);


//                         // console.log("addItemAfterPlan     -------- ")
//                         // console.log("gggg --- ", list)
//                         // console.log("list --- ", list.length)

//                         if (list.length === 0) {
//                             const addItem = database.query(
//                                 `INSERT INTO ${product_table} (wishlist_id, variant_id, product_id, referral_user_id, handle, price, title, image, quantity, product_option)
//                  VALUES ('${selectedUserId}', '${req.body.variantId}', '${req.body.productId}', ${req.body.referral_id || null}, '${req.body.handle}', '${req.body.price}', '${productTitleCode}', '${req.body.image}', ${req.body.quantity}, '${req.body.productOption}')`,
//                                 (err, result) => {
//                                     if (err) {
//                                         console.log(err);
//                                     } else {
//                                         const updateDate = database.query(
//                                             `UPDATE ${Wishlist_table} SET update_at = CURRENT_TIMESTAMP WHERE wishlist_id = '${selectedUserId}'`,
//                                             async (err, result1) => {
//                                                 if (err) {
//                                                     console.log(err);
//                                                     logger.error(err);
//                                                 } else {
//                                                     if (sendRes !== "no") {
//                                                         res.json({
//                                                             msg: "item updated",
//                                                             isAdded: "yes",
//                                                             bothUpdated: "",
//                                                             token: roughToken || null
//                                                         });
//                                                     }
//                                                 }
//                                             }
//                                         );
//                                     }
//                                 }
//                             );
//                         } else {
//                             if (list[0].name === "Premium") {
//                                 const addItem = database.query(
//                                     `INSERT INTO ${product_table} (wishlist_id, variant_id, product_id, referral_user_id, handle, price, title, image, quantity, product_option)
//                    VALUES ('${selectedUserId}', '${req.body.variantId}', '${req.body.productId}', ${req.body.referral_id || null}, '${req.body.handle}', '${req.body.price}', '${productTitleCode}', '${req.body.image}', ${req.body.quantity}, '${req.body.productOption}')`,
//                                     (err, result) => {
//                                         if (err) {
//                                             console.log(err);
//                                             logger.error(err);
//                                         } else {
//                                             const updateDate = database.query(
//                                                 `UPDATE ${Wishlist_table} SET update_at = CURRENT_TIMESTAMP WHERE wishlist_id = '${selectedUserId}'`,
//                                                 async (err, result1) => {
//                                                     if (err) {
//                                                         console.log(err);
//                                                         logger.error(err);
//                                                     } else {
//                                                         if (sendRes !== "no") {
//                                                             res.json({
//                                                                 msg: "item updated",
//                                                                 isAdded: "yes",
//                                                                 bothUpdated: "",
//                                                                 token: roughToken || null
//                                                             });
//                                                         }
//                                                     }
//                                                 }
//                                             );
//                                         }
//                                     }
//                                 );
//                             } else {
//                                 const quotaLimit =
//                                     planId === 1
//                                         ? list[0].quota
//                                         : plan_type === "ANNUAL"
//                                             ? list[0].quota * 12
//                                             : list[0].quota;

//                                 if (list.length + 1 > quotaLimit) {
//                                     database.query(
//                                         `SELECT wu.shop_name, ai.store_owner, ai.shop_email, ai.customer_email, p.name, p.quota, COUNT(wi.title) AS total_items
//                      FROM app_installation AS ai, wishlist_users AS wu, wishlist AS wt, wishlist_items AS wi, plan AS p
//                      WHERE ai.shop_name = wu.shop_name
//                        AND wu.shop_name = "${req.body.shopName}"
//                        AND wu.id = wt.wishlist_user_id
//                        AND wt.wishlist_id = wi.wishlist_id
//                        AND ai.active_plan_id = p.plan_id
//                        AND MONTH(wi.created_at) = MONTH(CURRENT_DATE())
//                        AND YEAR(wi.created_at) = YEAR(CURRENT_DATE())
//                      GROUP BY wu.shop_name`,
//                                         async (err, result) => {
//                                             if (err) {
//                                                 console.log(err);
//                                                 logger.error(err);
//                                             } else {
//                                                 if (result.length > 0) {
//                                                     result.forEach((item) => {
//                                                         let sendMail = false;
//                                                         let mailHtml = "";
//                                                         const eightyPercent = (80 / 100) * item.quota;
//                                                         const percentageUsed =
//                                                             (item.total_items / item.quota) * 100;

//                                                         if (
//                                                             item.total_items >= eightyPercent &&
//                                                             item.total_items < item.quota
//                                                         ) {
//                                                             sendMail = true;
//                                                             mailHtml = eightyPercentLimitEmailHTML(
//                                                                 item.name,
//                                                                 item.shop_name,
//                                                                 percentageUsed,
//                                                                 item.store_owner
//                                                             );
//                                                         } else if (item.total_items >= item.quota) {
//                                                             sendMail = true;
//                                                             mailHtml = hundredPercentLimitEmailHTML(
//                                                                 item.name,
//                                                                 item.shop_name,
//                                                                 percentageUsed,
//                                                                 item.store_owner
//                                                             );
//                                                         }

//                                                         if (sendMail) {
//                                                             const emailRegEx =
//                                                                 /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
//                                                             if (emailRegEx.test(item.shop_email)) {
//                                                                 const emailContent = {
//                                                                     from: supportEmail,
//                                                                     to: item.shop_email,
//                                                                     cc: item.customer_email,
//                                                                     subject:
//                                                                         "Wishlist Guru App Quota limit crossed.. Update Plan NOW!!!",
//                                                                     html: mailHtml,
//                                                                 };
//                                                                 // sendEmail(emailContent);
//                                                             }
//                                                         }
//                                                     });
//                                                 }
//                                             }
//                                         }
//                                     );
//                                     res.json({ msg: "limit cross" });
//                                 } else {
//                                     const addItem = database.query(
//                                         `INSERT INTO ${product_table} (wishlist_id, variant_id, product_id, referral_user_id, handle, price, title, image, quantity, product_option)
//                      VALUES ('${selectedUserId}', '${req.body.variantId}', '${req.body.productId}', ${req.body.referral_id || null}, '${req.body.handle}', '${req.body.price}', '${productTitleCode}', '${req.body.image}', ${req.body.quantity}, '${req.body.productOption}')`,
//                                         (err, result) => {
//                                             if (err) {
//                                                 console.log(err);
//                                                 logger.error(err);
//                                             } else {
//                                                 const updateDate = database.query(
//                                                     `UPDATE ${Wishlist_table} SET update_at = CURRENT_TIMESTAMP WHERE wishlist_id = '${selectedUserId}'`,
//                                                     async (err, result1) => {
//                                                         if (err) {
//                                                             console.log(err);
//                                                             logger.error(err);
//                                                         } else {
//                                                             if (sendRes !== "no") {
//                                                                 res.json({
//                                                                     msg: "item updated",
//                                                                     isAdded: "yes",
//                                                                     bothUpdated: "",
//                                                                     token: roughToken || null
//                                                                 });
//                                                             }
//                                                         }
//                                                     }
//                                                 );
//                                             }
//                                         }
//                                     );
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     );
// }
async function addProduct(req, res, selectedUserId, sendRes, roughToken = null) {
  try {
    if (req.body.shopName === "wishlist-guru.myshopify.com") {
      console.log("addProduct ----");
    }

    // Determine user's plan
    const [planResult] = await database.query(
      `SELECT active_plan_id as plan_id FROM ${app_installation_table} WHERE shop_name = ?`,
      [req.body.shopName]
    );

    let planId = req.body.plan;
    let planNameExtract = "";

    if (planResult.length === 0) {
      // No plan exists, insert the new one
      if (planId === 4) planNameExtract = "Premium";
      else if (planId === 3) planNameExtract = "Pro";
      else if (planId === 2) planNameExtract = "Basic";
      else planNameExtract = "Free";

      const storeName = req.body.storeName.replace(/'/g, "~");

      const [insertApp] = await database.query(
        `INSERT INTO ${app_installation_table} (shop_name, status, active_plan_id, active_plan_name, store_name) VALUES (?, 'Active', ?, ?, ?)`,
        [req.body.shopName, planId, planNameExtract, storeName]
      );

      await database.query(
        `INSERT INTO ${app_installation_log_table} (app_install_id, plan_id, plan_name, plan_type) VALUES (?, ?, ?, 'MONTHLY')`,
        [insertApp.insertId, planId, planNameExtract]
      );

      // Retry adding product after plan is created
      return await addProduct(req, res, selectedUserId, sendRes, roughToken);
    } else {
      planId = planResult[0].plan_id;

      // Check user's monthly/annual quota
      const currentDate = new Date();
      const monthFirstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const [existingItems] = await database.query(
        `SELECT w.title, p.quota, p.name
         FROM ${user_table} as u
         JOIN ${Wishlist_table} as wt ON u.id = wt.wishlist_user_id
         JOIN ${product_table} as w ON wt.wishlist_id = w.wishlist_id
         JOIN plan as p ON p.plan_id = ?
         WHERE u.shop_name = ?
           AND w.created_at BETWEEN ? AND ?`,
        [planId, req.body.shopName, monthFirstDay.toISOString(), monthLastDay.toISOString()]
      );

      const productTitle = req.body.title.replace(/\/wg-sgl/g, "'").replace(/\/wg-dbl/g, '"').replace(/'/g, "`");

      // Check quota limits
      let quotaLimit = existingItems.length > 0 ? existingItems[0].quota : Infinity;
      if (existingItems[0]?.name !== "Premium") {
        quotaLimit = quotaLimit; // or adjust based on annual/monthly logic
      }

      if (existingItems.length + 1 > quotaLimit) {
        return res.json({ msg: "limit cross" });
      }

      // Insert product
      await database.query(
        `INSERT INTO ${product_table} (wishlist_id, variant_id, product_id, referral_user_id, handle, price, title, image, quantity, product_option)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          selectedUserId,
          req.body.variantId,
          req.body.productId,
          req.body.referral_id || null,
          req.body.handle,
          req.body.price,
          productTitle,
          req.body.image,
          req.body.quantity,
          req.body.productOption
        ]
      );

      // Update wishlist timestamp
      await database.query(
        `UPDATE ${Wishlist_table} SET update_at = CURRENT_TIMESTAMP WHERE wishlist_id = ?`,
        [selectedUserId]
      );

      if (sendRes !== "no") {
        res.json({
          msg: "item updated",
          isAdded: "yes",
          bothUpdated: "",
          token: roughToken || null
        });
      }
    }
  } catch (err) {
    console.error("❌ Error in addProduct:", err);
    res.status(500).send("Internal Server Error in addProduct");
  }
}


// async function deleteProduct(
//     req,
//     res,
//     selectedUserId,
//     sendRes,
//     matchingIds,
//     delMatchingIds
// ) {

//     let {
//         productId,
//         variantId,
//         title,
//         image,
//         handle,
//         shopName,
//         customerEmail,
//         storeName
//     } = req?.body;

//     const checkKlaviyoRecordExist = await checkKlaviyoRecord(req.body.shopName)
//     if (req.body.customerEmail !== "" && req.body.plan >= 4 && checkKlaviyoRecordExist && checkKlaviyoRecordExist.length > 0) {
//         const checkKlaviyoApiKeyResult = await checkKlaviyoApiKey(checkKlaviyoRecordExist[0]?.private_key)


//         let combinedData = {
//             productId,
//             variantId,
//             title,
//             image,
//             handle,
//             shopName,
//             customerEmail,
//             storeName
//         };

//         if (checkKlaviyoApiKeyResult.type === "success") {
//             await KlaviyoIntegrationFxn(combinedData, wishlistProductRemoveKlaviyo, checkKlaviyoRecordExist, "byQuery");
//         }
//     }


//     if (req?.body?.permission === "dont_remove") {
//         res.json({ msg: "already added" });
//     } else {

//         // console.log("RRRRRRRR ------ ", req.body.specificVariant)

//         let deleteQuery;
//         if (req.body.specificVariant === true) {
//             deleteQuery = `DELETE from ${product_table} WHERE product_id='${req.body.productId}' AND variant_id='${req.body.variantId}' AND wishlist_id='${selectedUserId}'  `
//         } else {
//             deleteQuery = `DELETE from ${product_table} WHERE product_id='${req.body.productId}' AND wishlist_id='${selectedUserId}'  `
//         }

//         const deleteItem = database.query(
//             deleteQuery,
//             (err, result) => {
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     if (sendRes === "yes") {
//                         let bothUpdated = "";
//                         // console.log("matchingIdsmatchingIds", matchingIds, delMatchingIds);
//                         if (matchingIds.length > 0 && delMatchingIds.length > 0) {
//                             bothUpdated = "yes";
//                         }
//                         res.json({
//                             msg: "item updated",
//                             isAdded: "no",
//                             bothUpdated: bothUpdated,
//                         });
//                     }
//                 }
//             }
//         );
//     }
// }
async function deleteProduct(req, res, selectedUserId, sendRes, matchingIds = [], delMatchingIds = []) {
  try {
    const {
      productId,
      variantId,
      title,
      image,
      handle,
      shopName,
      customerEmail,
      storeName
    } = req.body;

    // Klaviyo integration if applicable
    if (customerEmail !== "" && req.body.plan >= 4) {
      const klaviyoRecord = await checkKlaviyoRecord(shopName);
      if (klaviyoRecord?.length > 0) {
        const apiKeyResult = await checkKlaviyoApiKey(klaviyoRecord[0]?.private_key);
        if (apiKeyResult.type === "success") {
          await KlaviyoIntegrationFxn(
            { productId, variantId, title, image, handle, shopName, customerEmail, storeName },
            wishlistProductRemoveKlaviyo,
            klaviyoRecord,
            "byQuery"
          );
        }
      }
    }

    // Permission check
    if (req.body.permission === "dont_remove") {
      return res.json({ msg: "already added" });
    }

    // Build DELETE query
    let query, params;
    if (req.body.specificVariant === true) {
      query = `DELETE FROM ${product_table} WHERE product_id = ? AND variant_id = ? AND wishlist_id = ?`;
      params = [productId, variantId, selectedUserId];
    } else {
      query = `DELETE FROM ${product_table} WHERE product_id = ? AND wishlist_id = ?`;
      params = [productId, selectedUserId];
    }

    // Execute delete
    await database.query(query, params);

    // Respond if it's the last operation
    if (sendRes === "yes") {
      const bothUpdated = matchingIds.length > 0 && delMatchingIds.length > 0 ? "yes" : "";
      res.json({
        msg: "item updated",
        isAdded: "no",
        bothUpdated
      });
    }

  } catch (err) {
    console.error("❌ Error in deleteProduct:", err);
    res.status(500).send("Internal Server Error in deleteProduct");
  }
}


// export const deleteItem = async (req, res) => {
//     // let selectedUserId = req.body.userId;
//     let selectedUserId = req.headers["wg-user-id"];

//     const sendRes = "yes";

//     if (req.body.customerEmail !== "" && req.body.plan >= 4) {
//         const checkKlaviyoRecordExist = await checkKlaviyoRecord(req.body.shopName)
//         const checkKlaviyoApiKeyResult = await checkKlaviyoApiKey(checkKlaviyoRecordExist[0]?.private_key)

//         let shopName = req.body.shopName;
//         let customerEmail = req.body.customerEmail;
//         let storeName = req.body.storeName;
//         if (checkKlaviyoRecordExist && checkKlaviyoRecordExist.length > 0) {
//             if (checkKlaviyoApiKeyResult.type === "success") {
//                 database.query(`SELECT product_id as productId, variant_id as variantId, title,image,handle From ${product_table} WHERE product_id='${req.body.productId}' AND wishlist_id='${selectedUserId}'  `, async (err, result) => {
//                     if (err) {

//                     } else {
//                         if (result.length > 0) {
//                             for (const item of result) {
//                                 let { productId, variantId, title, image, handle } = item || {};
//                                 let combinedData = {
//                                     productId,
//                                     variantId,
//                                     title,
//                                     image,
//                                     handle,
//                                     shopName,
//                                     customerEmail,
//                                     storeName
//                                 };
//                                 // console.log(combinedData);
//                                 await KlaviyoIntegrationFxn(combinedData, wishlistProductRemoveKlaviyo, checkKlaviyoRecordExist, "byQuery");
//                             }
//                         }
//                     }
//                 })
//             }
//         }
//     }

//     await deleteProduct(req, res, selectedUserId, sendRes, [], []);
// };
export const deleteItem = async (req, res) => {
  try {
    const selectedUserId = req.headers["wg-user-id"];
    const sendRes = "yes";

    // Klaviyo integration if user has email and plan >= 4
    if (req.body.customerEmail && req.body.plan >= 4) {
      const checkKlaviyoRecordExist = await checkKlaviyoRecord(req.body.shopName);

      if (checkKlaviyoRecordExist?.length > 0) {
        const checkKlaviyoApiKeyResult = await checkKlaviyoApiKey(checkKlaviyoRecordExist[0]?.private_key);

        if (checkKlaviyoApiKeyResult.type === "success") {
          const [products] = await database.query(
            `SELECT product_id as productId, variant_id as variantId, title, image, handle 
             FROM ${product_table} 
             WHERE product_id = ? AND wishlist_id = ?`,
            [req.body.productId, selectedUserId]
          );

          for (const item of products) {
            const { productId, variantId, title, image, handle } = item;
            const combinedData = {
              productId,
              variantId,
              title,
              image,
              handle,
              shopName: req.body.shopName,
              customerEmail: req.body.customerEmail,
              storeName: req.body.storeName
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

    // Delete product
    await deleteProduct(req, res, selectedUserId, sendRes, [], []);

  } catch (err) {
    console.error("❌ Error in deleteItem:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};


// export const deleteAllItem = async (req, res) => {
//     const wishlistIds = req.body.wishlistIds;
//     let shopName = req.body.shopName;
//     let customerEmail = req.body.customerEmail;
//     let storeName = req.body.storeName;
//     const checkKlaviyoRecordExist = await checkKlaviyoRecord(req.body.shopName)
//     if (req.body.customerEmail !== "" && req.body.plan >= 4 && checkKlaviyoRecordExist && checkKlaviyoRecordExist.length > 0) {
//         const checkKlaviyoApiKeyResult = await checkKlaviyoApiKey(checkKlaviyoRecordExist[0]?.private_key)

//         if (checkKlaviyoApiKeyResult.type === "success") {
//             database.query(`SELECT product_id AS productId, variant_id AS variantId, title, image, handle FROM ${product_table} WHERE wishlist_id IN (${wishlistIds})`, async (err, result) => {
//                 if (err) {

//                 } else {
//                     if (result.length > 0) {
//                         for (const item of result) {
//                             let { productId, variantId, title, image, handle } = item || {};

//                             let combinedData = {
//                                 productId,
//                                 variantId,
//                                 title,
//                                 image,
//                                 handle,
//                                 shopName,
//                                 customerEmail,
//                                 storeName
//                             };
//                             await KlaviyoIntegrationFxn(combinedData, wishlistProductRemoveKlaviyo, checkKlaviyoRecordExist, "byQuery");
//                         }
//                     }
//                 }
//             })
//         }
//     }

//     try {
//         await new Promise((resolve, reject) => {
//             database.query(
//                 `DELETE FROM ${product_table} WHERE wishlist_id IN (?)`,
//                 [wishlistIds],
//                 (err, result) => {
//                     if (err) reject(err);
//                     else resolve(result);
//                 }
//             );
//         });

//         // await new Promise((resolve, reject) => {
//         //   database.query(
//         //     `DELETE FROM ${Wishlist_table} WHERE wishlist_id IN (?)`,
//         //     [wishlistIds],
//         //     (err, result) => {
//         //       if (err) reject(err);
//         //       else resolve(result);
//         //     }
//         //   );
//         // });

//         res.json("All items removed");
//     } catch (error) {
//         res.status(500).json({ error: "Failed to remove items" });
//     }
// };
export const deleteAllItem = async (req, res) => {
  try {
    const wishlistIds = req.body.wishlistIds;
    const { shopName, customerEmail, storeName, plan } = req.body;

    const checkKlaviyoRecordExist = await checkKlaviyoRecord(shopName);

    // --- Klaviyo Integration ---
    if (
      customerEmail &&
      customerEmail !== "" &&
      plan >= 4 &&
      checkKlaviyoRecordExist?.length > 0
    ) {
      const checkKlaviyoApiKeyResult = await checkKlaviyoApiKey(
        checkKlaviyoRecordExist[0]?.private_key
      );

      if (checkKlaviyoApiKeyResult.type === "success") {
        const [products] = await database.query(
          `SELECT product_id AS productId, variant_id AS variantId, title, image, handle 
           FROM ${product_table} 
           WHERE wishlist_id IN (?)`,
          [wishlistIds]
        );

        for (const item of products) {
          const { productId, variantId, title, image, handle } = item;
          const combinedData = {
            productId,
            variantId,
            title,
            image,
            handle,
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

    // --- Delete from product_table ---
    await database.query(
      `DELETE FROM ${product_table} WHERE wishlist_id IN (?)`,
      [wishlistIds]
    );

    // --- Optionally delete wishlists themselves ---
    // await database.query(
    //   `DELETE FROM ${Wishlist_table} WHERE wishlist_id IN (?)`,
    //   [wishlistIds]
    // );

    res.json({ msg: "All items removed" });
  } catch (error) {
    console.error("❌ Error in deleteAllItem:", error);
    res.status(500).json({ error: "Failed to remove items" });
  }
};


// const queryDB = (query, params = []) => {
//     return new Promise((resolve, reject) => {
//         database.query(query, params, (err, result) => {
//             if (err) reject(err);
//             else resolve(result);
//         });
//     });
// };
// ✅ mysql2/promise version
const queryDB = async (query, params = []) => {
  const [rows] = await database.query(query, params);
  return rows;
};



// export const getAllItems = async (req, res) => {





//     try {
//         const { shopName, currentToken, customerEmail } = req.body;

//         const fixedInput = fixBase64Padding(req?.body?.langName); // Fix padding if needed
//         const langName = atob(fixedInput);

//         let getDefaultLanguage;
//         const langObject = storeFrontLanguages[langName];
//         if (langObject) {
//             getDefaultLanguage = langObject;
//         } else {
//             getDefaultLanguage = {};
//         }

//         // Add indexes to optimize queries before execution
//         // const addIndexes = async () => {
//         //     await Promise.all([
//         //         new Promise((resolve, reject) => {
//         //             database.query(
//         //                 `CREATE INDEX IF NOT EXISTS idx_shop_name_email ON ${user_table} (shop_name, email)`,
//         //                 (err) => (err ? reject(err) : resolve())
//         //             );
//         //         }),
//         //         new Promise((resolve, reject) => {
//         //             database.query(
//         //                 `CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON ${Wishlist_table} (wishlist_user_id)`,
//         //                 (err) => (err ? reject(err) : resolve())
//         //             );
//         //         }),
//         //         new Promise((resolve, reject) => {
//         //             database.query(
//         //                 `CREATE INDEX IF NOT EXISTS idx_wishlist_id ON ${product_table} (wishlist_id)`,
//         //                 (err) => (err ? reject(err) : resolve())
//         //             );
//         //         })
//         //     ]);
//         // };

//         // Ensure indexes are in place
//         // await addIndexes();

//         const userQuery = `
//       SELECT wt.wishlist_id AS id, wt.wishlist_name AS name, u.id AS userId
//       FROM ${Wishlist_table} AS wt
//       INNER JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
//       WHERE u.shop_name = ? AND u.email = ?
//     `;

//         const result = await new Promise((resolve, reject) => {
//             database.query(userQuery, [shopName, currentToken], (err, result) => {
//                 if (err) reject(err);
//                 else resolve(result);
//             });
//         });

//         if (result.length === 0) {
//             const getUserId = await new Promise((resolve, reject) => {
//                 database.query(
//                     `SELECT wt.wishlist_id AS id, wt.wishlist_name AS name
//            FROM ${Wishlist_table} AS wt , ${user_table} AS u
//            WHERE u.shop_name = ? AND u.id = wt.wishlist_user_id AND email = ?`,
//                     [req.body.shopName, req.body.customerEmail],
//                     (err, result) => {
//                         if (err) reject(err);
//                         else resolve(result);
//                     }
//                 );
//             });

//             if (getUserId.length !== 0) {
//                 let getAllItemArr = [];
//                 for (let i = 0; i < getUserId.length; i++) {
//                     const getAllItems = await new Promise((resolve, reject) => {
//                         database.query(
//                             // `SELECT * FROM ${product_table} WHERE wishlist_id = ? GROUP BY variant_id ORDER BY title ASC`,
//                             `SELECT * FROM ${product_table} WHERE wishlist_id = ? ORDER BY title ASC`,
//                             [getUserId[i].id],
//                             (err, result1) => {
//                                 if (err) reject(err);
//                                 else resolve(result1);
//                             }
//                         );
//                     });
//                     const wishName = getUserId[i].name;
//                     getAllItemArr.push({ [wishName]: getAllItems, id: getUserId[i].id });
//                 }
//                 res.json({ data: getAllItemArr, defLanguageData: getDefaultLanguage });
//             } else {
//                 res.json({ data: [], defLanguageData: getDefaultLanguage });
//             }
//         } else {
//             const emailCheckQuery = `SELECT * FROM wishlist_users WHERE shop_name = ? AND email = ?`;

//             const emailCheck = await new Promise((resolve, reject) => {
//                 database.query(
//                     emailCheckQuery,
//                     [shopName, customerEmail],
//                     (err, result) => {
//                         if (err) reject(err);
//                         else resolve(result);
//                     }
//                 );
//             });

//             if (emailCheck.length === 0 && customerEmail === "") {
//                 const getAllItemArr = await Promise.all(
//                     result.map(async (item) => {
//                         const getAllItems = await new Promise((resolve, reject) => {
//                             database.query(
//                                 `SELECT * FROM ${product_table} WHERE wishlist_id = ? ORDER BY title ASC`,
//                                 [item.id],
//                                 (err, result) => {
//                                     if (err) reject(err);
//                                     else resolve(result);
//                                 }
//                             );
//                         });
//                         return { [item.name]: getAllItems, id: item.id };
//                     })
//                 );
//                 res.json({ data: getAllItemArr.length > 0 ? getAllItemArr : [], defLanguageData: getDefaultLanguage });
//             } else if (emailCheck.length === 0 && customerEmail !== "") {
//                 const updateUserQuery = `
//           UPDATE ${user_table}
//           SET email = ?, user_type = 'User', updated_at = CURRENT_TIMESTAMP
//           WHERE id = ?
//         `;

//                 await new Promise((resolve, reject) => {
//                     database.query(
//                         updateUserQuery,
//                         [customerEmail, result[0].userId],
//                         (err) => {
//                             if (err) reject(err);
//                             else resolve();
//                         }
//                     );
//                 });

//                 const getAllItemArr = await Promise.all(
//                     result.map(async (item) => {
//                         const getAllItems = await new Promise((resolve, reject) => {
//                             database.query(
//                                 `SELECT * FROM ${product_table} WHERE wishlist_id = ? ORDER BY title ASC`,
//                                 [item.id],
//                                 (err, result) => {
//                                     if (err) reject(err);
//                                     else resolve(result);
//                                 }
//                             );
//                         });
//                         return { [item.name]: getAllItems, id: item.id };
//                     })
//                 );
//                 res.json({ data: getAllItemArr.length > 0 ? getAllItemArr : [], defLanguageData: getDefaultLanguage });
//             }


//             // -------this is ultra new----------
//             else {
//                 // Step 1: Get current wishlists of the new user
//                 const userResult = await queryDB(
//                     `SELECT wishlist_id, wishlist_name FROM ${Wishlist_table} WHERE wishlist_user_id = ?`,
//                     [emailCheck[0].id]
//                 );

//                 const wishlistMap = new Map(
//                     userResult.map((item) => [item.wishlist_name, item.wishlist_id])
//                 );

//                 // Step 2: Update wishlist ownership or update items
//                 for (const item of result) {
//                     if (wishlistMap.has(item.name)) {
//                         const wishlistId = wishlistMap.get(item.name);
//                         await updateWishlistItems(wishlistId, item.id); // assumed to be defined elsewhere
//                     } else {
//                         await queryDB(
//                             `UPDATE ${Wishlist_table} SET wishlist_user_id = ? WHERE wishlist_id = ?`,
//                             [emailCheck[0].id, item.id]
//                         );
//                     }
//                 }

//                 // Step 3: Cleanup old user's data (products → wishlists → user)
//                 (async () => {
//                     try {
//                         await queryDB(`DELETE FROM ${product_table} WHERE wishlist_id IN (SELECT wishlist_id FROM ${Wishlist_table} WHERE wishlist_user_id = ? )`,
//                             [result[0].userId]
//                         );

//                         await queryDB(
//                             `DELETE FROM ${Wishlist_table} WHERE wishlist_user_id = ?`,
//                             [result[0].userId]
//                         );

//                         await queryDB(
//                             `DELETE FROM ${user_table} WHERE id = ?`,
//                             [result[0].userId]
//                         );
//                         console.log("✅ Old user and related data deleted successfully.");
//                     } catch (err) {
//                         console.error("❌ Cleanup error:", err);
//                     }
//                 })();

//                 // Step 4: Fetch updated wishlist & items for response
//                 const getUserId = await queryDB(`SELECT wt.wishlist_id AS id, wt.wishlist_name AS name FROM ${Wishlist_table} AS wt, ${user_table} AS u WHERE u.shop_name = ? AND u.id = wt.wishlist_user_id AND email = ?`,
//                     [shopName, customerEmail]
//                 );

//                 const getAllItemArr = await Promise.all(
//                     getUserId.map(async (wishlist) => {
//                         const getAllItems = await queryDB(
//                             `SELECT * FROM ${product_table} WHERE wishlist_id = ? ORDER BY title ASC`,
//                             [wishlist.id]
//                         );
//                         return { [wishlist.name]: getAllItems, id: wishlist.id };
//                     })
//                 );

//                 res.json({
//                     data: getAllItemArr.length > 0 ? getAllItemArr : [],
//                     defLanguageData: getDefaultLanguage,
//                 });
//             }

//             // -------this is the new code------
//             //   else {
//             //     const userResult = await new Promise((resolve, reject) => {
//             //       database.query(
//             //         `SELECT wishlist_id, wishlist_name FROM ${Wishlist_table} WHERE wishlist_user_id = ?`,
//             //         [emailCheck[0].id],
//             //         (err, result) => {
//             //           if (err) reject(err);
//             //           else resolve(result);
//             //         }
//             //       );
//             //     });

//             //     const wishlistMap = new Map(
//             //       userResult.map((item) => [item.wishlist_name, item.wishlist_id])
//             //     );

//             //     for (const item of result) {
//             //       if (wishlistMap.has(item.name)) {
//             //         const wishlistId = wishlistMap.get(item.name);
//             //         await updateWishlistItems(wishlistId, item.id);
//             //       } else {
//             //         await new Promise((resolve, reject) => {
//             //           database.query(
//             //             `UPDATE ${Wishlist_table} SET wishlist_user_id = ? WHERE wishlist_id = ?`,
//             //             [emailCheck[0].id, item.id],
//             //             (err) => {
//             //               if (err) reject(err);
//             //               else resolve();
//             //             }
//             //           );
//             //         });
//             //       }
//             //     }

//             //     // Delay before deleting old user and related data
//             //     setTimeout(async () => {
//             //       try {
//             //         // Step 1: Delete all products linked to user's wishlists
//             //         await new Promise((resolve, reject) => {
//             //           database.query(
//             //             `DELETE FROM ${product_table} WHERE wishlist_id IN (
//             //          SELECT wishlist_id FROM ${Wishlist_table} WHERE wishlist_user_id = ?
//             //       )`,
//             //             [result[0].userId],
//             //             (err) => {
//             //               if (err) reject(err);
//             //               else resolve();
//             //             }
//             //           );
//             //         });

//             //         // Step 2: Delete all wishlists linked to the user
//             //         await new Promise((resolve, reject) => {
//             //           database.query(
//             //             `DELETE FROM ${Wishlist_table} WHERE wishlist_user_id = ?`,
//             //             [result[0].userId],
//             //             (err) => {
//             //               if (err) reject(err);
//             //               else resolve();
//             //             }
//             //           );
//             //         });

//             //         // Step 3: Now delete the user
//             //         await new Promise((resolve, reject) => {
//             //           database.query(
//             //             `DELETE FROM ${user_table} WHERE id = ?`,
//             //             [result[0].userId],
//             //             (err) => {
//             //               if (err) reject(err);
//             //               else resolve();
//             //             }
//             //           );
//             //         });

//             //         console.log("✅ Old user and all related data removed.");
//             //       } catch (err) {
//             //         console.error("❌ Error deleting old user and related data:", err);
//             //       }
//             //     }, 10000); // 10 second delay

//             //     // Get new user wishlists and items
//             //     const getUserId = await new Promise((resolve, reject) => {
//             //       database.query(
//             //         `
//             //   SELECT wt.wishlist_id AS id, wt.wishlist_name AS name
//             //   FROM ${Wishlist_table} AS wt , ${user_table} AS u
//             //   WHERE u.shop_name = ? AND u.id = wt.wishlist_user_id AND email = ?
//             // `,
//             //         [shopName, customerEmail],
//             //         (err, result) => {
//             //           if (err) reject(err);
//             //           else resolve(result);
//             //         }
//             //       );
//             //     });

//             //     const getAllItemArr = await Promise.all(
//             //       getUserId.map(async (wishlist) => {
//             //         const getAllItems = await new Promise((resolve, reject) => {
//             //           database.query(
//             //             `SELECT * FROM ${product_table} WHERE wishlist_id = ? ORDER BY title ASC`,
//             //             [wishlist.id],
//             //             (err, result) => {
//             //               if (err) reject(err);
//             //               else resolve(result);
//             //             }
//             //           );
//             //         });
//             //         return { [wishlist.name]: getAllItems };
//             //       })
//             //     );

//             //     res.json({ data: getAllItemArr.length > 0 ? getAllItemArr : [], defLanguageData: getDefaultLanguage });
//             //   }





//             // -------------old code---------
//             // else {
//             //   const userResult = await new Promise((resolve, reject) => {
//             //     database.query(
//             //       `SELECT wishlist_id, wishlist_name FROM ${Wishlist_table} WHERE wishlist_user_id = ?`,
//             //       [emailCheck[0].id],
//             //       (err, result) => {
//             //         if (err) reject(err);
//             //         else resolve(result);
//             //       }
//             //     );
//             //   });

//             //   const wishlistMap = new Map(
//             //     userResult.map((item) => [item.wishlist_name, item.wishlist_id])
//             //   );

//             //   for (const item of result) {
//             //     if (wishlistMap.has(item.name)) {
//             //       const wishlistId = wishlistMap.get(item.name);
//             //       await updateWishlistItems(wishlistId, item.id);
//             //     } else {
//             //       await new Promise((resolve, reject) => {
//             //         database.query(
//             //           `UPDATE ${Wishlist_table} SET wishlist_user_id = ? WHERE wishlist_id = ?`,
//             //           [emailCheck[0].id, item.id],
//             //           (err) => {
//             //             if (err) reject(err);
//             //             else resolve();
//             //           }
//             //         );
//             //       });
//             //     }
//             //   }

//             //   // console.log("Im here ------ ")
//             //   // ----------here we  are testing of the foreign key constraint error-------------

//             //   setTimeout(async () => {
//             //     await new Promise((resolve, reject) => {
//             //       database.query(
//             //         `DELETE FROM ${user_table} WHERE id = ?`,
//             //         [result[0].userId],
//             //         (err) => {
//             //           if (err) reject(err);
//             //           else resolve();
//             //         }
//             //       );
//             //     });
//             //   }, 10000)


//             //   const getUserId = await new Promise((resolve, reject) => {
//             //     database.query(
//             //       `
//             //       SELECT wt.wishlist_id AS id, wt.wishlist_name AS name
//             //       FROM ${Wishlist_table} AS wt , ${user_table} AS u
//             //       WHERE u.shop_name = ? AND u.id = wt.wishlist_user_id AND email = ?
//             //     `,
//             //       [shopName, customerEmail],
//             //       (err, result) => {
//             //         if (err) reject(err);
//             //         else resolve(result);
//             //       }
//             //     );
//             //   });

//             //   const getAllItemArr = await Promise.all(
//             //     getUserId.map(async (wishlist) => {
//             //       const getAllItems = await new Promise((resolve, reject) => {
//             //         database.query(
//             //           `SELECT * FROM ${product_table} WHERE wishlist_id = ? ORDER BY title ASC`,
//             //           [wishlist.id],
//             //           (err, result) => {
//             //             if (err) reject(err);
//             //             else resolve(result);
//             //           }
//             //         );
//             //       });
//             //       return { [wishlist.name]: getAllItems };
//             //     })
//             //   );
//             //   res.json({ data: getAllItemArr.length > 0 ? getAllItemArr : [], defLanguageData: getDefaultLanguage });
//             // }
//         }
//     } catch (error) {
//         console.log("Error:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

// save the active theme ----------
export const getAllItems = async (req, res) => {
  try {
    const { shopName, currentToken, customerEmail } = req.body;

    // Decode and get default language
    const fixedInput = fixBase64Padding(req?.body?.langName);
    const langName = atob(fixedInput);
    const getDefaultLanguage = storeFrontLanguages[langName] || {};

    // Step 1: Get wishlist by user email or token
    const [result] = await database.query(
      `
      SELECT wt.wishlist_id AS id, wt.wishlist_name AS name, u.id AS userId
      FROM ${Wishlist_table} AS wt
      INNER JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
      WHERE u.shop_name = ? AND u.email = ?
      `,
      [shopName, currentToken]
    );

    // Case 1: No wishlist found for current token
    if (result.length === 0) {
      const [getUserId] = await database.query(
        `
        SELECT wt.wishlist_id AS id, wt.wishlist_name AS name
        FROM ${Wishlist_table} AS wt, ${user_table} AS u
        WHERE u.shop_name = ? AND u.id = wt.wishlist_user_id AND email = ?
        `,
        [shopName, customerEmail]
      );

      if (getUserId.length === 0) {
        return res.json({ data: [], defLanguageData: getDefaultLanguage });
      }

      const getAllItemArr = await Promise.all(
        getUserId.map(async (wishlist) => {
          const [getAllItems] = await database.query(
            `SELECT * FROM ${product_table} WHERE wishlist_id = ? ORDER BY title ASC`,
            [wishlist.id]
          );
          return { [wishlist.name]: getAllItems, id: wishlist.id };
        })
      );

      return res.json({ data: getAllItemArr, defLanguageData: getDefaultLanguage });
    }

    // Case 2: Found wishlist by currentToken → check email status
    const [emailCheck] = await database.query(
      `SELECT * FROM wishlist_users WHERE shop_name = ? AND email = ?`,
      [shopName, customerEmail]
    );

    // Sub-case A: Guest (no email)
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
      return res.json({ data: getAllItemArr, defLanguageData: getDefaultLanguage });
    }

    // Sub-case B: New email (update guest → user)
    if (emailCheck.length === 0 && customerEmail !== "") {
      await database.query(
        `
        UPDATE ${user_table}
        SET email = ?, user_type = 'User', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [customerEmail, result[0].userId]
      );

      const getAllItemArr = await Promise.all(
        result.map(async (item) => {
          const [getAllItems] = await database.query(
            `SELECT * FROM ${product_table} WHERE wishlist_id = ? ORDER BY title ASC`,
            [item.id]
          );
          return { [item.name]: getAllItems, id: item.id };
        })
      );

      return res.json({ data: getAllItemArr, defLanguageData: getDefaultLanguage });
    }

    // Sub-case C: Merge user wishlists and clean old data
    const [userResult] = await database.query(
      `SELECT wishlist_id, wishlist_name FROM ${Wishlist_table} WHERE wishlist_user_id = ?`,
      [emailCheck[0].id]
    );

    const wishlistMap = new Map(
      userResult.map((item) => [item.wishlist_name, item.wishlist_id])
    );

    // Merge logic
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

    // Clean up old data
    await database.query(
      `DELETE FROM ${product_table} WHERE wishlist_id IN (
        SELECT wishlist_id FROM ${Wishlist_table} WHERE wishlist_user_id = ?
      )`,
      [result[0].userId]
    );
    await database.query(
      `DELETE FROM ${Wishlist_table} WHERE wishlist_user_id = ?`,
      [result[0].userId]
    );
    await database.query(`DELETE FROM ${user_table} WHERE id = ?`, [result[0].userId]);

    console.log("✅ Old user and related data deleted successfully.");

    // Fetch updated wishlist for response
    const [getUserId] = await database.query(
      `
      SELECT wt.wishlist_id AS id, wt.wishlist_name AS name
      FROM ${Wishlist_table} AS wt, ${user_table} AS u
      WHERE u.shop_name = ? AND u.id = wt.wishlist_user_id AND email = ?
      `,
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

    res.json({
      data: getAllItemArr,
      defLanguageData: getDefaultLanguage,
    });
  } catch (error) {
    console.error("❌ Error in getAllItems:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// export const saveActiveTheme = async (req, res) => {
//     try {
//         const { shopName, theme } = req.body;
//         const insertQuery = `UPDATE ${app_installation_table} SET active_theme = ? WHERE shop_name = ?`;
//         const insertQueryResult = await queryAsync(insertQuery, [
//             theme,
//             shopName,
//         ]);
//         res.status(200).json({ msg: "saved active theme " });
//     } catch (error) {
//         logger.error(error);
//         console.log(error);
//     }
// };

// --------------klaviyo code----------------
export const saveActiveTheme = async (req, res) => {
  try {
    const { shopName, theme } = req.body;

    const query = `
      UPDATE ${app_installation_table}
      SET active_theme = ?
      WHERE shop_name = ?
    `;

    const [result] = await database.query(query, [theme, shopName]);

    if (result.affectedRows > 0) {
      res.status(200).json({ msg: "✅ Active theme saved successfully." });
    } else {
      res.status(404).json({ msg: "⚠️ Shop not found." });
    }

  } catch (error) {
    console.error("❌ Error saving active theme:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};


// export const getKlaviyoEmailIntegration = async (req, res) => {
//     const { shopName } = req.body;
//     database.query(`SELECT * FROM ${klaviyo_table} WHERE shop_name='${shopName}'`, (err, result) => {
//         if (err) {
//             logger.error(err);
//         }
//         else {
//             res.send(result)
//         }
//     })
// };
export const getKlaviyoEmailIntegration = async (req, res) => {
    try {
        const { shopName } = req.body;
        const query = `SELECT * FROM ${klaviyo_table} WHERE shop_name = ?`;
        const [result] = await database.query(query, [shopName]);

        res.status(200).json(result);
    } catch (err) {
        console.error("❌ Error fetching Klaviyo integration:", err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};


// export const getSmtpEmailIntegration = async (req, res) => {
//     const { shopName } = req.body;
//     database.query(`SELECT * FROM email_smtp WHERE shop_name='${shopName}'`, (err, result) => {
//         if (err) {
//             logger.error(err);
//         }
//         else {
//             res.send(result)
//         }
//     })
// };
export const getSmtpEmailIntegration = async (req, res) => {
    try {
        const { shopName } = req.body;
        const query = `SELECT * FROM email_smtp WHERE shop_name = ?`;
        const [result] = await database.query(query, [shopName]);

        res.status(200).json(result);
    } catch (err) {
        console.error("❌ Error fetching SMTP integration:", err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};


async function KlaviyoIntegrationEmailRemainderFxn(req, checkKlaviyoRecordExist, email, params, shopName) {
    await KlaviyoCreateEventEmailRemainder(req, checkKlaviyoRecordExist[0]?.private_key, email, params, shopName)
}

// const checkKlaviyoRecord = async (shopName) => {
//     try {
//         const result = await new Promise((resolve, reject) => {
//             database.query(
//                 `SELECT * FROM ${klaviyo_table} WHERE shop_name='${shopName}'`,
//                 (err, result) => {
//                     if (err) {
//                         reject(err);
//                     } else {
//                         resolve(result);
//                     }
//                 }
//             );
//         });

//         return result;
//     } catch (error) {
//         logger.error(error);

//     }
// };
const checkKlaviyoRecord = async (shopName) => {
    try {
        const query = `SELECT * FROM ${klaviyo_table} WHERE shop_name = ?`;
        const [result] = await database.query(query, [shopName]);
        return result;
    } catch (error) {
        console.error("❌ Error checking Klaviyo record:", error);
        return [];
    }
};


// async function KlaviyoCreateEvent(datas, authKey, params) {
//     const {
//         productId,
//         variantId,
//         title,
//         image,
//         storeName,
//         shopName,
//         handle,
//         customerEmail,
//         price

//     } = datas;



//     const userQuery = `SELECT product_id AS productId,variant_id AS variantId,title,image AS productImage,store_name AS storeName,shop_name AS shopName,handle,email,price FROM wishlist AS w INNER JOIN wishlist_users AS wu ON wu.id = w.wishlist_user_id INNER JOIN wishlist_items AS wi ON wi.wishlist_id= w.wishlist_id WHERE
//     shop_name = ? AND email = ?;
//     `;

//     const result = await new Promise((resolve, reject) => {
//         database.query(userQuery, [shopName, customerEmail], (err, result) => {
//             if (err) reject(err);
//             else resolve(result);
//         });
//     });

//     const url = 'https://a.klaviyo.com/api/events';

//     // Validate necessary fields
//     if (!productId || !variantId || !title || !customerEmail) {
//         console.error("Missing required fields");
//         return { error: "Missing required fields" };
//     }

//     // Ensure image starts with 'https://'
//     const productImage = image.startsWith("https:") ? image : `https:${image}`;

//     // const productImage = image.includes('://') ?  `https:${image}` : `https:${image.startsWith('//') ? image : '//' + image}`;

//     // Constructing request data

//     const formattedResults = result.map(item => {
//         return {
//             ...item,
//             productImage: item.productImage.startsWith('http')
//                 ? item.productImage
//                 : `https:${item.productImage}`
//         };
//     });

//     const requestData = {
//         data: {
//             type: 'event',
//             attributes: {
//                 properties: {
//                     currentWishlist: {
//                         productId,
//                         variantId,
//                         title,
//                         productImage,
//                         storeName,
//                         shopName,
//                         handle,
//                         email: customerEmail,
//                         price
//                     }, allWishlist: formattedResults
//                 },
//                 metric: {
//                     data: {
//                         type: 'metric',
//                         attributes: {
//                             name: params
//                         }
//                     }
//                 },
//                 profile: {
//                     data: {
//                         type: 'profile',
//                         attributes: {
//                             email: customerEmail
//                         }
//                     }
//                 }
//             }
//         }
//     };


//     const options = {
//         method: 'POST',
//         headers: {
//             //   accept: 'application/vnd.api+json',
//             revision: '2024-10-15',
//             'content-type': 'application/vnd.api+json',
//             Authorization: `Klaviyo-API-Key ${authKey}`
//         },
//         body: JSON.stringify(requestData)
//     };

//     try {
//         const fetchData = await fetch(url, options);

//         // Check if the response is ok
//         if (!fetchData.ok) {
//             throw new Error(`Error: ${fetchData.statusText}`);
//         }

//         // Parse the response as JSON
//         const data = await fetchData.json();

//         // Log the data
//         console.log("object data", data);
//     } catch (error) {
//         logger.error(error);
//     }

// }

// export async function KlaviyoCreateEventEmailRemainder(datas, authKey, email, params) {
//     const url = 'https://a.klaviyo.com/api/events';
//     const requestData = {
//         data: {
//             type: 'event',
//             attributes: {
//                 properties: {
//                     ...(params !== wishlistReminderKlaviyo ? { productItem: datas } : { item: datas }),
//                 },
//                 metric: {
//                     data: {
//                         type: 'metric',
//                         attributes: {
//                             name: params
//                         }
//                     }
//                 },
//                 profile: {
//                     data: {
//                         type: 'profile',

//                         attributes: {
//                             meta: {
//                                 patch_properties: {
//                                     append: {},
//                                     unappend: {}
//                                 }
//                             },
//                             email: email
//                         }
//                     }
//                 }
//             }
//         }
//     };


//     const options = {
//         headers: {
//             accept: 'application/vnd.api+json',
//             revision: '2024-10-15',
//             'content-type': 'application/vnd.api+json',
//             Authorization: `Klaviyo-API-Key ${authKey}`
//         }
//     };

//     try {
//         const response = await axios.post(url, requestData, options);
//         return response.data;
//     } catch (error) {
//         logger.error(error);
//     }
// }
async function KlaviyoCreateEvent(datas, authKey, params) {
    const {
        productId,
        variantId,
        title,
        image,
        storeName,
        shopName,
        handle,
        customerEmail,
        price
    } = datas;

    // Validate required fields early
    if (!productId || !variantId || !title || !customerEmail) {
        console.error("Missing required fields");
        return { error: "Missing required fields" };
    }

    try {
        // Query all wishlist items for this customer
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
            FROM wishlist AS w
            INNER JOIN wishlist_users AS wu ON wu.id = w.wishlist_user_id
            INNER JOIN wishlist_items AS wi ON wi.wishlist_id = w.wishlist_id
            WHERE wu.shop_name = ? AND wu.email = ?
        `;

        const [result] = await database.query(userQuery, [shopName, customerEmail]);

        // Format results for Klaviyo
        const formattedResults = result.map(item => ({
            ...item,
            productImage: item.productImage.startsWith('http')
                ? item.productImage
                : `https:${item.productImage}`
        }));

        const productImage = image.startsWith("http") ? image : `https:${image}`;

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

        const response = await fetch('https://a.klaviyo.com/api/events', {
            method: 'POST',
            headers: {
                revision: '2024-10-15',
                'content-type': 'application/vnd.api+json',
                Authorization: `Klaviyo-API-Key ${authKey}`
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Klaviyo API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Klaviyo response:", data);

    } catch (error) {
        console.error("❌ Error in KlaviyoCreateEvent:", error);
        logger.error(error);
    }
}


// export async function KlaviyoCreateEventEmailRemainder(datas, authKey, email, params, shopName) {

//     if (datas.productImage?.startsWith('//')) {
//         datas.productImage = 'https:' + datas.productImage;
//     }

//     const userQuery = `SELECT product_id AS productId,variant_id AS variantId,title,image AS productImage,store_name AS storeName,shop_name AS shopName,handle,email,price FROM wishlist AS w INNER JOIN wishlist_users AS wu ON wu.id = w.wishlist_user_id INNER JOIN wishlist_items AS wi ON wi.wishlist_id= w.wishlist_id WHERE
//     shop_name = ? AND user_type="User" AND email="${email}";
//     `;

//     const result = await new Promise((resolve, reject) => {
//         database.query(userQuery, [shopName], (err, result) => {
//             if (err) reject(err);
//             else resolve(result);
//         });
//     });

//     const formattedResults = result.map(item => {
//         return {
//             ...item,
//             productImage: item.productImage.startsWith('//')
//                 ? `https:${item.productImage}`
//                 : item.productImage
//         };
//     });

//     const url = 'https://a.klaviyo.com/api/events';
//     const requestData = {
//         data: {
//             type: 'event',
//             attributes: {
//                 properties: {
//                     ...(params !== wishlistReminderKlaviyo ? { currentWishlist: datas, allWishlist: formattedResults } : { currentWishlist: datas, allWishlist: formattedResults }),
//                 },
//                 metric: {
//                     data: {
//                         type: 'metric',
//                         attributes: {
//                             name: params
//                         }
//                     }
//                 },
//                 profile: {
//                     data: {
//                         type: 'profile',

//                         attributes: {
//                             meta: {
//                                 patch_properties: {
//                                     append: {},
//                                     unappend: {}
//                                 }
//                             },
//                             email: email
//                         }
//                     }
//                 }
//             }
//         }
//     };


//     const options = {
//         headers: {
//             accept: 'application/vnd.api+json',
//             revision: '2024-10-15',
//             'content-type': 'application/vnd.api+json',
//             Authorization: `Klaviyo-API-Key ${authKey}`
//         }
//     };

//     try {
//         const response = await axios.post(url, requestData, options);
//         return response.data;
//     } catch (error) {
//         logger.error(error);
//     }
// }
export async function KlaviyoCreateEventEmailRemainder(datas, authKey, email, params, shopName) {
    try {
        // Ensure productImage starts with https
        if (datas.productImage?.startsWith('//')) {
            datas.productImage = 'https:' + datas.productImage;
        }

        // Query wishlist items for this user
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
            FROM wishlist AS w
            INNER JOIN wishlist_users AS wu ON wu.id = w.wishlist_user_id
            INNER JOIN wishlist_items AS wi ON wi.wishlist_id = w.wishlist_id
            WHERE wu.shop_name = ? AND wu.user_type = "User" AND wu.email = ?
        `;

        const [result] = await database.query(userQuery, [shopName, email]);

        const formattedResults = result.map(item => ({
            ...item,
            productImage: item.productImage.startsWith('//')
                ? `https:${item.productImage}`
                : item.productImage
        }));

        // Prepare request data
        const requestData = {
            data: {
                type: 'event',
                attributes: {
                    properties: {
                        currentWishlist: datas,
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
                            attributes: {
                                email,
                                meta: {
                                    patch_properties: {
                                        append: {},
                                        unappend: {}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        const response = await axios.post('https://a.klaviyo.com/api/events', requestData, {
            headers: {
                accept: 'application/vnd.api+json',
                revision: '2024-10-15',
                'content-type': 'application/vnd.api+json',
                Authorization: `Klaviyo-API-Key ${authKey}`
            }
        });

        return response.data;

    } catch (error) {
        console.error("❌ Error in KlaviyoCreateEventEmailRemainder:", error);
        logger.error(error);
        throw error; // propagate error for caller
    }
}


async function checkEventRecord(key, params, productDetail) {

    const { shopName, customerEmail, productId, variantId } = productDetail
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
        const res = await fetch(url, options);
        const json = await res.json();

        // console.log("json",json);
        const checkKlaviyoAttribute = json.data.reduce((acc, current) => {
            if (current.relationships.metric.data.id === params) {
                acc.push(current.attributes.event_properties);
            }
            return acc;
        }, []);

        if (checkKlaviyoAttribute.length > 0) {
            const finalResult = checkKlaviyoAttribute.reduce((acc, current) => {
                if (current.shopName === shopName && current.email === customerEmail && current.productId === productId && current.variantId === variantId) {
                    acc.push(current);
                }
                return acc;
            }, []);
            return finalResult
        } else {
            return []
        }



    } catch (error) {
        logger.error(error);
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

// const checkMetricesExistOrNot = await checkMetricesExist(checkKlaviyoRecordExist[0]?.private_key, params)
// const checkEventRecordExist = await checkEventRecord(checkKlaviyoRecordExist[0]?.private_key, checkMetricesExistOrNot, checkQuery === "byQuery" ? req : req.body)

// await checkEmailSubscribeOrNot(checkQuery === "byQuery" ? req : req.body, checkKlaviyoRecordExist[0]?.private_key);

// if (checkEventRecordExist.length === 0) {
//     await KlaviyoCreateEvent(checkQuery === "byQuery" ? req : req.body, checkKlaviyoRecordExist[0]?.private_key, params);
//     if (params === "Wishlist Guru - Product Added") {
//         let klaviyoList = await checkListExits(checkKlaviyoRecordExist[0]?.private_key)
//         if (klaviyoList.type) {
//             klaviyoList = await createListKlaviyo(checkKlaviyoRecordExist[0]?.private_key)
//         }
//         const profileId = await checkKlaviyo(checkKlaviyoRecordExist[0]?.private_key, checkQuery === "byQuery" ? req : req.body)
//         await addProfileToList(checkKlaviyoRecordExist[0]?.private_key, klaviyoList?.id, checkQuery === "byQuery" ? req : req.body, profileId)
//     }
// }





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

            // Get the next page URL
            nextUrl = result.links?.next || null;
        }
        // Assume allData is already populated with the list response
        const isWGUserlistMissing = allData.find(data => data?.attributes?.name === 'WG-Userlist');
        // console.log("isWGUserlistMissing", isWGUserlistMissing)
        if (isWGUserlistMissing !== undefined) {
            // console.log('✅ WG-Userlist not found → return true');
            return { id: isWGUserlistMissing.id, type: false }
        } else {
            return { type: true }
        }

        // console.log(allData); // ✅ All records
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
            // console.log("✅ Successfully added to list:", addedData);
        } else {
            // console.log("✅ Successfully added to list: No content returned (204)");
        }

    } catch (error) {
        console.error("🚫 Error:", error);
    }
};


const checkEmailSubscribeOrNot = (data, authKey) => {

    const {
        customerEmail
    } = data;

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
            // console.log("profile", profile)
            if (consentStatus === 'SUBSCRIBED') {
                console.log('User is already subscribed to marketing emails.');
            } else {
                // Proceed to subscribe
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

// async function checkKlaviyoApiKey(apiKey) {
//     const url = 'https://a.klaviyo.com/api/accounts';
//     const options = {
//         headers: {
//             accept: 'application/vnd.api+json',
//             revision: '2024-10-15',
//             Authorization: `Klaviyo-API-Key ${apiKey}`,
//         },
//     };

//     const maxRetries = 5;
//     let retries = 0;
//     const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//     while (retries < maxRetries) {
//         try {
//             const response = await axios.get(url, options);

//             // Check if there are errors in the response
//             if (response.data.errors) {
//                 return { type: 'error' };
//             } else {
//                 return { type: 'success', data: response.data.data };
//             }
//         } catch (error) {
//             if (error.response && error.response.status === 429) {
//                 // Handle rate-limited error by waiting and retrying
//                 retries++;
//                 const retryAfter = error.response.headers['retry-after']
//                     ? parseInt(error.response.headers['retry-after']) * 1000
//                     : Math.pow(2, retries) * 1000; // Exponential backoff
//                 // console.log(`Rate limit exceeded. Retrying in ${retryAfter / 1000} seconds...`);
//                 logger.error(`Rate limit exceeded. Retrying in ${retryAfter / 1000} seconds...`);

//                 await delay(retryAfter); // Wait for retryAfter or exponential backoff
//             } else {
//                 // Handle other errors
//                 // console.error('Request failed', error);
//                 logger.error(error);
//                 return { type: 'error' };
//             }
//         }
//     }

//     return { type: 'error', message: 'Max retries exceeded' };
// }

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

// function getProducts(wishlistId) {
//     return new Promise((resolve, reject) => {
//         database.query(`SELECT * FROM ${product_table} WHERE wishlist_id=?`, [wishlistId], (err, result) => {
//             if (err) reject(err);
//             else resolve(result);
//         });
//     });
// }
async function getProducts(wishlistId) {
  try {
    const [rows] = await database.query(
      `SELECT * FROM ${product_table} WHERE wishlist_id = ?`,
      [wishlistId]
    );
    return rows; // rows = result set
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    throw error; // rethrow to handle it where the function is called
  }
}


// function mergeProductQuantities(oldId, newId) {
//     return new Promise((resolve, reject) => {
//         database.query(`
//       UPDATE ${product_table} w1
//       JOIN ${product_table} w2
//       ON w1.product_id = w2.product_id AND w2.wishlist_id = ?
//       SET w1.quantity = w1.quantity + w2.quantity
//       WHERE w1.wishlist_id = ?
//     `, [newId, oldId], (err) => {
//             if (err) reject(err);
//             else resolve();
//         });
//     });
// }
export async function mergeProductQuantities(oldId, newId) {
    try {
        const query = `
            UPDATE ${product_table} w1
            JOIN ${product_table} w2
            ON w1.product_id = w2.product_id AND w2.wishlist_id = ?
            SET w1.quantity = w1.quantity + w2.quantity
            WHERE w1.wishlist_id = ?
        `;
        await database.query(query, [newId, oldId]);
    } catch (error) {
        console.error("❌ Error merging product quantities:", error);
        throw error; // propagate error to caller
    }
}


// function deleteDuplicateProducts(newId, oldId) {
//     return new Promise((resolve, reject) => {
//         database.query(`
//       DELETE FROM ${product_table}
//       WHERE wishlist_id = ? AND product_id IN (
//         SELECT product_id FROM (
//           SELECT product_id FROM ${product_table} WHERE wishlist_id = ?
//         ) AS temp
//       )
//     `, [newId, oldId], (err) => {
//             if (err) reject(err);
//             else resolve();
//         });
//     });
// }
async function deleteDuplicateProducts(newId, oldId) {
    const query = `
        DELETE FROM ${product_table}
        WHERE wishlist_id = ? AND product_id IN (
            SELECT product_id FROM (
                SELECT product_id FROM ${product_table} WHERE wishlist_id = ?
            ) AS temp
        )
    `;
    try {
        await database.query(query, [newId, oldId]);
    } catch (err) {
        throw err;
    }
}


// function moveProducts(fromId, toId) {
//     return new Promise((resolve, reject) => {
//         database.query(
//             `UPDATE ${product_table} SET wishlist_id=? WHERE wishlist_id=?`,
//             [toId, fromId],
//             (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             }
//         );
//     });
// }
async function moveProducts(fromId, toId) {
    const query = `UPDATE ${product_table} SET wishlist_id = ? WHERE wishlist_id = ?`;
    try {
        await database.query(query, [toId, fromId]);
    } catch (err) {
        throw err;
    }
}

// function deleteWishlistItems(wishlistId) {
//     return new Promise((resolve, reject) => {
//         database.query(
//             `DELETE FROM wishlist_items WHERE wishlist_id=?`,
//             [wishlistId],
//             (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             }
//         );
//     });
// }
async function deleteWishlistItems(wishlistId) {
    const query = `DELETE FROM wishlist_items WHERE wishlist_id = ?`;
    try {
        await database.query(query, [wishlistId]);
    } catch (err) {
        throw err;
    }
}

// function deleteWishlist(wishlistId) {
//     return new Promise((resolve, reject) => {
//         database.query(
//             `DELETE FROM ${Wishlist_table} WHERE wishlist_id=?`,
//             [wishlistId],
//             (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             }
//         );
//     });
// }
async function deleteWishlist(wishlistId) {
    const query = `DELETE FROM ${Wishlist_table} WHERE wishlist_id = ?`;
    try {
        await database.query(query, [wishlistId]);
    } catch (err) {
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

// function getCartItems(wishlistId) {
//     return new Promise((resolve, reject) => {
//         database.query(
//             `SELECT * FROM ${cart_table} WHERE wishlist_id=?`,
//             [wishlistId],
//             (err, result) => {
//                 if (err) reject(err);
//                 else resolve(result);
//             }
//         );
//     });
// }
async function getCartItems(wishlistId) {
    const query = `SELECT * FROM ${cart_table} WHERE wishlist_id = ?`;
    try {
        const [rows] = await database.query(query, [wishlistId]);
        return rows;
    } catch (err) {
        throw err;
    }
}

// function updateCartQuantity(wishlistId, productId, quantity) {
//     return new Promise((resolve, reject) => {
//         database.query(
//             `UPDATE ${cart_table} SET quantity=? WHERE wishlist_id=? AND product_id=?`,
//             [quantity, wishlistId, productId],
//             (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             }
//         );
//     });
// }
async function updateCartQuantity(wishlistId, productId, quantity) {
    const query = `UPDATE ${cart_table} SET quantity = ? WHERE wishlist_id = ? AND product_id = ?`;
    try {
        await database.query(query, [quantity, wishlistId, productId]);
    } catch (err) {
        throw err;
    }
}

// function deleteCartItem(wishlistId, productId) {
//     return new Promise((resolve, reject) => {
//         database.query(
//             `DELETE FROM ${cart_table} WHERE wishlist_id=? AND product_id=?`,
//             [wishlistId, productId],
//             (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             }
//         );
//     });
// }
async function deleteCartItem(wishlistId, productId) {
    const query = `DELETE FROM ${cart_table} WHERE wishlist_id = ? AND product_id = ?`;
    try {
        await database.query(query, [wishlistId, productId]);
    } catch (err) {
        throw err;
    }
}

// function moveCartItem(fromId, toId, productId) {
//     return new Promise((resolve, reject) => {
//         database.query(
//             `UPDATE ${cart_table} SET wishlist_id=? WHERE wishlist_id=? AND product_id=?`,
//             [toId, fromId, productId],
//             (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             }
//         );
//     });
// }
async function moveCartItem(fromId, toId, productId) {
    const query = `UPDATE ${cart_table} SET wishlist_id = ? WHERE wishlist_id = ? AND product_id = ?`;
    try {
        await database.query(query, [toId, fromId, productId]);
    } catch (err) {
        throw err;
    }
}

// function moveAllCartItems(fromId, toId) {
//     return new Promise((resolve, reject) => {
//         database.query(
//             `UPDATE ${cart_table} SET wishlist_id=? WHERE wishlist_id=?`,
//             [toId, fromId],
//             (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             }
//         );
//     });
// }
async function moveAllCartItems(fromId, toId) {
    try {
        const [result] = await database.query(
            `UPDATE ${cart_table} SET wishlist_id = ? WHERE wishlist_id = ?`,
            [toId, fromId]
        );
        return result;
    } catch (err) {
        throw err;
    }
}

// export const getReportAllItems = async (req, res) => {
//     // console.log("getting")
//     try {
//         const getUserId = await new Promise((resolve, reject) => {
//             database.query(
//                 `SELECT wt.wishlist_id AS id FROM ${Wishlist_table} AS wt , ${user_table} AS u  WHERE u.shop_name = '${req.body.shopName}' AND u.id = wt.wishlist_user_id AND email='${req.body.customerEmail}'`,
//                 (err, result) => {
//                     if (err) {
//                         logger.error(err);
//                         reject(err);
//                     } else {
//                         resolve(result);
//                     }
//                 }
//             );
//         });

//         if (getUserId.length !== 0) {
//             let wishlistId = getUserId[0].id;
//             const getAllItems = await new Promise((resolve, reject) => {
//                 database.query(
//                     `SELECT * from ${product_table} WHERE wishlist_id='${wishlistId}'`,
//                     (err, result1) => {
//                         if (err) {
//                             logger.error(err);
//                             reject(err);
//                         } else {
//                             resolve(result1);
//                         }
//                     }
//                 );
//             });
//             // console.log("else", getData)
//             res.json({ data: getAllItems });
//         } else {
//             res.json({ data: [] });
//         }
//     } catch (error) {
//         console.log("error", error);
//         logger.error(error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };
export const getReportAllItems = async (req, res) => {
    try {
        const { shopName, customerEmail } = req.body;

        // Get the wishlist ID for the user
        const [getUserId] = await database.query(
            `SELECT wt.wishlist_id AS id 
             FROM ${Wishlist_table} AS wt
             JOIN ${user_table} AS u 
             ON u.id = wt.wishlist_user_id
             WHERE u.shop_name = ? AND u.email = ?`,
            [shopName, customerEmail]
        );

        if (getUserId.length === 0) {
            return res.json({ data: [] });
        }

        const wishlistId = getUserId[0].id;

        // Get all items for that wishlist
        const [getAllItems] = await database.query(
            `SELECT * FROM ${product_table} WHERE wishlist_id = ?`,
            [wishlistId]
        );

        res.json({ data: getAllItems });
    } catch (error) {
        console.error("Error fetching report:", error);
        logger.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// export const getIdFromEmail = async (req, res) => {
//     database.query(`SELECT  wt.wishlist_user_id AS id FROM ${Wishlist_table} AS wt , ${user_table} AS u WHERE email='${req.body.email}' AND u.id = wt.wishlist_user_id AND shop_name='${req.body.shopName}'`, (err, result) => {
//         if (err) {
//             console.log(err)
//             logger.error(err);
//         } else {
//             res.json({ data: result, msg: "get_id" });
//         }
//     });
// };

// export const getSharedWishlist = async (req, res) => {
//     let getId = req.body.customerEmail;
//     console.log("getId --- ", getId);

//     if (getId === "" || getId === null || getId === undefined || getId === "undefined") {
//         res.json({ data: [], msg: "no_record_found" });
//     } else {
//         const fixedInput = fixBase64Padding1(getId);
//         console.log("fixedInput --- ", fixedInput);
//         let extractedId = atob(fixedInput);
//         console.log("extractedId --- ", extractedId);
//         const getAllItems = await new Promise((resolve, reject) => {
//             database.query(`SELECT wishlist_id as id, wishlist_name AS name from ${Wishlist_table} WHERE wishlist_user_id='${extractedId}'`, (err, result) => {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     resolve(result);
//                 }
//             })
//         })

//         let getAllItemArr = []
//         if (getAllItems.length !== 0) {
//             for (let i = 0; i < getAllItems.length; i++) {
//                 const getAllWishlistItems = await new Promise((resolve, reject) => {
//                     database.query(`SELECT * from ${product_table} WHERE wishlist_id='${getAllItems[i].id}'`, (err, result1) => {
//                         if (err) {
//                             reject(err);
//                         } else {
//                             resolve(result1);
//                         }
//                     });
//                 });
//                 const wishName = getAllItems[i].name
//                 getAllItemArr.push({ [wishName]: getAllWishlistItems, id: getAllItems[i].id })
//             }

//             if (getAllItemArr.length !== 0) {
//                 res.json({ data: getAllItemArr, msg: "get_shared_wishlist" });
//             } else {
//                 res.json({ data: [], msg: "no_record_found" });
//             }
//         } else {
//             res.json({ data: [], msg: "no_record_found" });
//         }
//     }
// };
export const getIdFromEmail = async (req, res) => {
    try {
        const { email, shopName } = req.body;

        const [result] = await database.query(
            `SELECT wt.wishlist_user_id AS id 
             FROM ${Wishlist_table} AS wt
             JOIN ${user_table} AS u
             ON u.id = wt.wishlist_user_id
             WHERE u.email = ? AND u.shop_name = ?`,
            [email, shopName]
        );

        res.json({ data: result, msg: "get_id" });
    } catch (err) {
        console.error("Error fetching ID:", err);
        logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// export const getSharedWishlist = async (req, res) => {
//     // let getId = req.body.customerEmail;
//     let getId = req.headers["wg-user-id"];

//     // console.log("getId --- ", getId);

//     if (!getId || getId === "undefined") {
//         return res.json({ data: [], msg: "no_record_found" });
//     }

//     // Create indexes (DEV ONLY – remove in production)
//     // database.query(`CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON ${Wishlist_table}(wishlist_user_id);`);
//     // database.query(`CREATE INDEX IF NOT EXISTS idx_product_wishlist_id ON ${product_table}(wishlist_id);`);

//     const fixedInput = fixBase64Padding1(getId);
//     // console.log("fixedInput --- ", fixedInput);
//     let extractedId = atob(fixedInput);
//     // console.log("extractedId --- ", extractedId);

//     try {
//         const getAllItems = await new Promise((resolve, reject) => {
//             database.query(
//                 `SELECT wishlist_id as id, wishlist_name AS name
//                  FROM ${Wishlist_table}
//                  WHERE wishlist_user_id = ?`,
//                 [extractedId],
//                 (err, result) => {
//                     if (err) reject(err);
//                     else resolve(result);
//                 }
//             );
//         });

//         let getAllItemArr = [];

//         for (let item of getAllItems) {
//             const getAllWishlistItems = await new Promise((resolve, reject) => {
//                 database.query(
//                     `SELECT * FROM ${product_table} WHERE wishlist_id = ?`,
//                     [item.id],
//                     (err, result1) => {
//                         if (err) reject(err);
//                         else resolve(result1);
//                     }
//                 );
//             });

//             getAllItemArr.push({ [item.name]: getAllWishlistItems, id: item.id });
//         }

//         if (getAllItemArr.length > 0) {
//             res.json({ data: getAllItemArr, msg: "get_shared_wishlist" });
//         } else {
//             res.json({ data: [], msg: "no_record_found" });
//         }
//     } catch (error) {
//         console.error("Database error:", error);
//         res.status(500).json({ data: [], msg: "internal_error" });
//     }
// };
export const getSharedWishlist = async (req, res) => {
    let getId = req.headers["wg-user-id"];

    if (!getId || getId === "undefined") {
        return res.json({ data: [], msg: "no_record_found" });
    }

    try {
        const fixedInput = fixBase64Padding1(getId);
        const extractedId = atob(fixedInput);

        // Get all wishlists for the user
        const [wishlists] = await database.query(
            `SELECT wishlist_id AS id, wishlist_name AS name
             FROM ${Wishlist_table}
             WHERE wishlist_user_id = ?`,
            [extractedId]
        );

        if (wishlists.length === 0) {
            return res.json({ data: [], msg: "no_record_found" });
        }

        // Fetch all products for these wishlists in a single query
        const wishlistIds = wishlists.map(w => w.id);
        const [products] = await database.query(
            `SELECT * FROM ${product_table} WHERE wishlist_id IN (?)`,
            [wishlistIds]
        );

        // Group products by wishlist
        const groupedData = wishlists.map(wishlist => {
            const items = products.filter(p => p.wishlist_id === wishlist.id);
            return { [wishlist.name]: items, id: wishlist.id };
        });

        res.json({ data: groupedData, msg: "get_shared_wishlist" });

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ data: [], msg: "internal_error" });
    }
};


// export const addToMyWishlist = async (req, res) => {
//     const getUserId = database.query(
//         `SELECT  wt.wishlist_id AS id FROM ${Wishlist_table} AS wt , ${user_table} AS u WHERE email='${req.body.customerEmail}'  AND u.id = wt.wishlist_user_id AND shop_name='${req.body.shopName}'`,
//         (err, userID) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 if (userID.length === 0) {
//                     res.json({ msg: "not a valid user" });
//                 } else {
//                     const getAllItems = database.query(
//                         `SELECT variant_id FROM ${product_table} WHERE product_id='${req.body.productId}' AND wishlist_id='${userID[0].id}'`,
//                         (err, variantID) => {
//                             if (err) {
//                                 console.log(err);
//                                 logger.error(err);
//                             } else {
//                                 let selectedUserId = userID[0].id;
//                                 // let wishlist_users_id = userID[0].wishlist_users_id
//                                 if (variantID.length === 0) {
//                                     addProduct(req, res, selectedUserId);
//                                 } else {
//                                     res.json({ msg: "already added" });
//                                 }
//                             }
//                         }
//                     );
//                 }
//             }
//         }
//     );
// };
export const addToMyWishlist = async (req, res) => {
    try {
        const { customerEmail, shopName, productId } = req.body;

        // Get user's wishlist ID
        const [userID] = await database.query(
            `SELECT wt.wishlist_id AS id
             FROM ${Wishlist_table} AS wt
             JOIN ${user_table} AS u
             ON u.id = wt.wishlist_user_id
             WHERE u.email = ? AND u.shop_name = ?`,
            [customerEmail, shopName]
        );

        if (userID.length === 0) {
            return res.json({ msg: "not a valid user" });
        }

        const selectedUserId = userID[0].id;

        // Check if the product variant already exists in the wishlist
        const [variantID] = await database.query(
            `SELECT variant_id 
             FROM ${product_table} 
             WHERE product_id = ? AND wishlist_id = ?`,
            [productId, selectedUserId]
        );

        if (variantID.length === 0) {
            // Product not added yet — call your existing function
            return addProduct(req, res, selectedUserId);
        } else {
            return res.json({ msg: "already added" });
        }
    } catch (err) {
        console.error("Error adding to wishlist:", err);
        logger.error(err);
        res.status(500).json({ msg: "internal_error" });
    }
};


// export const getAllUsers = async (req, res) => {
//     let mainQuery = `
//     SELECT
//         u.*, w.*,
//         (
//             SELECT COUNT(*)
//             FROM ${product_table} as wt
//             WHERE u.id=w.wishlist_user_id AND wt.wishlist_id=w.wishlist_id
//         ) as item_count ,(
//           SELECT COUNT(*)
//           FROM  ${cart_table} as ct
//           WHERE u.id=w.wishlist_user_id AND  w.wishlist_id=ct.wishlist_id
//       ) as cart_count
//     FROM
//         ${user_table} as u
//     JOIN
//         ${Wishlist_table} as w ON u.id = w.wishlist_user_id
//     WHERE
//         u.shop_name = "${req.body.shopName}"`;

//     database.query(mainQuery, (err, mainResult) => {
//         if (err) {
//             console.log(err);
//             logger.error(err);
//         } else {
//             res.json({ mainResult: mainResult });
//         }
//     });
// };
export const getAllUsers = async (req, res) => {
    try {
        const { shopName } = req.body;

        const mainQuery = `
            SELECT
                u.*, w.*,
                (
                    SELECT COUNT(*)
                    FROM ${product_table} as wt
                    WHERE u.id = w.wishlist_user_id AND wt.wishlist_id = w.wishlist_id
                ) as item_count,
                (
                    SELECT COUNT(*)
                    FROM ${cart_table} as ct
                    WHERE u.id = w.wishlist_user_id AND w.wishlist_id = ct.wishlist_id
                ) as cart_count
            FROM
                ${user_table} as u
            JOIN
                ${Wishlist_table} as w ON u.id = w.wishlist_user_id
            WHERE
                u.shop_name = ?
        `;

        const [mainResult] = await database.query(mainQuery, [shopName]);

        res.json({ mainResult });
    } catch (err) {
        console.error("Error fetching users:", err);
        logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// export const getAllUsersCount = async (req, res) => {
//     const getAllUsers = database.query(
//         // `SELECT * FROM ${user_table} WHERE shop_name="${req.body.shopName}"`
//         `SELECT w.*, u.*, (SELECT COUNT(*) FROM ${product_table} as wt WHERE u.id=w.wishlist_user_id AND wt.wishlist_id=w.wishlist_id) as item_count FROM ${user_table} as u JOIN ${Wishlist_table} as w ON u.id = w.wishlist_user_id WHERE u.shop_name="${req.body.shopName}";`,
//         (err, result) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 res.json({ data: result });
//             }
//         }
//     );
// };

// export const getCurrentPlanSql = async (req, res) => {
//     const getPlan = database.query(
//         `SELECT active_plan_id FROM app_installation WHERE shop_name="${req.body.shopName}";`,
//         (err, result) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 const langUrl = result[0]?.active_plan_id > 2 ? req.body.wfGetDomain : `httttps://${req.body.normalDomain}/`;
//                 const dbQuery = `SELECT s.translations FROM ${store_languages_table} AS s INNER JOIN ${store_languages_url_table} AS su WHERE s.shop_name = '${req.body.shopName}' AND s.lang_id = su.lang_id AND su.url = '${langUrl}'`;
//                 database.query(dbQuery, (err, result2) => {
//                     if (err) {
//                         console.log(err);
//                         logger.error(err);
//                     } else {
//                         if (result.length > 0) {
//                             res.json({ planData: result, languageData: result2 });
//                         } else {
//                             res.json({ planData: [{ active_plan_id: 1 }], languageData: result2 });
//                         }
//                     }
//                 });
//             }
//         }
//     );
// };







// export const getCurrentPlanSql = async (req, res) => {

//     // console.log("req?.headers['wg-mail'] ---- ", req?.headers['wg-mail']);
//     // console.log("req?.headers['wg-api-key'] ---- ", req?.headers['wg-api-key']);
//     // console.log("JWT_SECRET --- ", JWT_SECRET)

//     let roughToken = "";
//     // if (req?.body?.wgEmail !== "" &&
//     //     (req?.headers['wg-api-key'] === JWT_SECRET || req?.headers['wg-api-key'] === null || req?.headers['wg-api-key'] === "null")) {

//     //     roughToken = await generateToken(req?.body?.wgEmail);
//     // } else {
//     //     roughToken = JWT_SECRET;
//     // }




//     // if (req?.body?.wgEmail) {
//     //     const apiKey = req?.headers['wg-api-key'];

//     //     try {
//     //         if (apiKey && apiKey !== "null" && apiKey !== JWT_SECRET) {
//     //             // ✅ Check if apiKey is a valid JWT
//     //             const decoded = jwt.verify(apiKey, JWT_SECRET);
//     //             // If valid, reuse existing token
//     //             roughToken = apiKey;


//     //             console.log("1111111111111111111")

//     //         } else {
//     //             // Otherwise, generate a new token
//     //             roughToken = await generateToken(req.body.wgEmail);


//     //             console.log("2222222222222222")

//     //         }
//     //     } catch (err) {
//     //         // If verification fails, generate new token
//     //         roughToken = await generateToken(req.body.wgEmail);
//     //         console.log("333333333333333333")

//     //     }
//     // } else {
//     //     roughToken = JWT_SECRET;
//     //     console.log("444444444444444444")

//     // }

//     // req?.headers['wgEmail']

//     // if (req?.headers['wg-mail']) {
//     //     const apiKey = req?.headers['wg-api-key'];

//     //     try {
//     //         if (apiKey && apiKey !== "null" && apiKey !== JWT_SECRET) {
//     //             console.log("Incoming apiKey:", apiKey);

//     //             // Try to verify the JWT
//     //             const decoded = jwt.verify(apiKey, JWT_SECRET);
//     //             console.log("Decoded JWT:", decoded);

//     //             roughToken = apiKey; // reuse token
//     //             console.log("1111111111111111111");
//     //         } else {
//     //             roughToken = await generateToken(req?.headers['wg-mail']);
//     //             console.log("2222222222222222");
//     //         }
//     //     } catch (err) {
//     //         console.error("JWT verification failed:", err.message);
//     //         roughToken = await generateToken(req?.headers['wg-mail']);
//     //         console.log("333333333333333333");
//     //     }
//     // } else {
//     //     roughToken = JWT_SECRET;
//     //     console.log("444444444444444444");
//     // }










//     const shopName = req.body.shopName;
//     const wfGetDomain = req.body.wfGetDomain;
//     const normalDomain = req.body.normalDomain;

//     // console.log("shopName -- ", shopName)
//     // console.log("req.headers['wg-user'] -- ", req.headers['wg-user'])
//     // console.log("req?.headers['wg-api-key'] ---- ", req?.headers['wg-api-key']);




//     const getUserId = await queryAsync(`SELECT id FROM wishlist_users WHERE shop_name=? AND email=?`, [shopName, req.headers['wg-user']]);

//     // console.log("getUserId ----- ", getUserId)

//     if (getUserId.length > 0) {


//         // let token = req?.headers['wg-api-key'];
//         //         roughToken = await generateToken(getUserId[0].id);


//         let token = req?.headers['wg-api-key'];

//         // if (!token || token.trim() === "" || !isValidToken(token)) {
//         if (!token || token === null || token === "null" || token === undefined || token.trim() === "" || !isValidToken(token)) {

//             // If no token OR empty OR invalid → generate a new one
//             roughToken = await generateToken(getUserId[0].id);
//         } else {
//             // Token exists and valid → just reuse it
//             roughToken = token;
//         }



//     } else {

//         // roughToken = await generateToken(getUserId[0].id);

//     }









//     // Create required indexes (NOT RECOMMENDED in runtime)
//     // const createIndexes = () => {
//     //     database.query(`CREATE INDEX IF NOT EXISTS idx_app_installation_shop_name ON app_installation(shop_name);`);
//     //     database.query(`CREATE INDEX IF NOT EXISTS idx_store_languages_shop_name ON ${store_languages_table}(shop_name);`);
//     //     database.query(`CREATE INDEX IF NOT EXISTS idx_store_languages_lang_id ON ${store_languages_table}(lang_id);`);
//     //     database.query(`CREATE INDEX IF NOT EXISTS idx_store_languages_url_lang_id ON ${store_languages_url_table}(lang_id);`);
//     //     database.query(`CREATE INDEX IF NOT EXISTS idx_store_languages_url_url ON ${store_languages_url_table}(url);`);
//     // };

//     // Run index creation
//     // createIndexes();

//     // Fetch active plan
//     database.query(
//         `SELECT active_plan_id FROM app_installation WHERE shop_name = ?`,
//         [shopName],
//         (err, result) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//                 return res.status(500).json({ error: "Error fetching plan data" });
//             }

//             const activePlanId = result[0]?.active_plan_id || 1;
//             const langUrl = activePlanId > 2 ? wfGetDomain : `https://${normalDomain}/`;

//             const dbQuery = `
//                 SELECT s.translations
//                 FROM ${store_languages_table} AS s
//                 INNER JOIN ${store_languages_url_table} AS su
//                 ON s.lang_id = su.lang_id
//                 WHERE s.shop_name = ? AND su.url = ?
//             `;

//             database.query(dbQuery, [shopName, langUrl], (err2, result2) => {
//                 if (err2) {
//                     console.log(err2);
//                     logger.error(err2);
//                     return res.status(500).json({ error: "Error fetching language data" });
//                 }

//                 res.json({
//                     planData: result.length > 0 ? result : [{ active_plan_id: 1 }],
//                     languageData: result2,
//                     token: roughToken
//                 });
//             });
//         }
//     );
// };
export const getAllUsersCount = async (req, res) => {
    try {
        const { shopName } = req.body;

        const query = `
            SELECT 
                w.*, u.*,
                (
                    SELECT COUNT(*)
                    FROM ${product_table} as wt
                    WHERE u.id = w.wishlist_user_id AND wt.wishlist_id = w.wishlist_id
                ) as item_count
            FROM ${user_table} as u
            JOIN ${Wishlist_table} as w ON u.id = w.wishlist_user_id
            WHERE u.shop_name = ?
        `;

        const [result] = await database.query(query, [shopName]);

        res.json({ data: result });
    } catch (err) {
        console.error("Error fetching all users count:", err);
        logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// export const getCurrentPlanSql = async (req, res) => {
//   try {
//     const shopName = req.body.shopName;
//     const wfGetDomain = req.body.wfGetDomain;
//     const normalDomain = req.body.normalDomain;
//     let roughToken = "";

//     // ✅ Get userId from wishlist_users
//     const [userRows] = await database.query(
//       `SELECT id FROM wishlist_users WHERE shop_name = ? AND email = ?`,
//       [shopName, req.headers["wg-user"]]
//     );

//     if (userRows.length > 0) {
//       const token = req?.headers["wg-api-key"];

//       // Validate token
//       if (
//         !token ||
//         token === null ||
//         token === "null" ||
//         token === undefined ||
//         token.trim() === "" ||
//         !isValidToken(token)
//       ) {
//         // Generate new token if missing or invalid
//         roughToken = await generateToken(userRows[0].id);
//       } else {
//         // Reuse existing valid token
//         roughToken = token;
//       }
//     }

//     // ✅ Fetch active plan
//     const [planRows] = await database.query(
//       `SELECT active_plan_id FROM app_installation WHERE shop_name = ?`,
//       [shopName]
//     );

//     const activePlanId = planRows[0]?.active_plan_id || 1;
//     const langUrl = activePlanId > 2 ? wfGetDomain : `https://${normalDomain}/`;

//     // ✅ Fetch language translations
//     const [languageRows] = await database.query(
//       `
//       SELECT s.translations
//       FROM ${store_languages_table} AS s
//       INNER JOIN ${store_languages_url_table} AS su
//       ON s.lang_id = su.lang_id
//       WHERE s.shop_name = ? AND su.url = ?
//     `,
//       [shopName, langUrl]
//     );

//     // ✅ Send response
//     res.json({
//       planData: planRows.length > 0 ? planRows : [{ active_plan_id: 1 }],
//       languageData: languageRows,
//       token: roughToken,
//     });
//   } catch (error) {
//     console.error("❌ Error in getCurrentPlanSql:", error);
//     logger.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
export const getCurrentPlanSql = async (req, res) => {
  try {
    const shopName = req.body.shopName;
    const wfGetDomain = req.body.wfGetDomain;
    const normalDomain = req.body.normalDomain;
    const email = req.headers["wg-user"];
    let roughToken = "";

    // ✅ Get user ID
    const [userRows] = await database.query(
      `SELECT id FROM wishlist_users WHERE shop_name = ? AND email = ?`,
      [shopName, email]
    );

    if (userRows.length > 0) {
      const token = req.headers["wg-api-key"];

      // Validate token or generate a new one
      if (!token || !isValidToken(token)) {
        roughToken = await generateToken(userRows[0].id);
      } else {
        roughToken = token;
      }
    }

    // ✅ Fetch active plan
    const [planRows] = await database.query(
      `SELECT active_plan_id FROM app_installation WHERE shop_name = ?`,
      [shopName]
    );

    const activePlanId = planRows[0]?.active_plan_id || 1;
    const langUrl = activePlanId > 2 ? wfGetDomain : `https://${normalDomain}/`;

    // ✅ Fetch language translations
    const [languageRows] = await database.query(
      `
      SELECT s.translations
      FROM ${store_languages_table} AS s
      INNER JOIN ${store_languages_url_table} AS su
      ON s.lang_id = su.lang_id
      WHERE s.shop_name = ? AND su.url = ?
      `,
      [shopName, langUrl]
    );

    // ✅ Send response
    res.json({
      planData: planRows.length > 0 ? planRows : [{ active_plan_id: 1 }],
      languageData: languageRows,
      token: roughToken,
    });
  } catch (error) {
    console.error("❌ Error in getCurrentPlanSql:", error);
    logger.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const deleteUser = async (req, res) => {
//     const deleteWishlist = database.query(
//         `DELETE FROM ${product_table} WHERE wishlist_id = ${req.body.wishlistId};`,
//         (err, result) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 // database.query(`DELETE FROM ${Wishlist_table} WHERE wishlist_id = ${req.body.wishlistId};`
//                 //   , (err, result) => {
//                 //     if (err) {
//                 //       console.log(err);
//                 //       logger.error(err);
//                 //     } else {
//                 //       database.query(`DELETE FROM ${user_table} WHERE id = ${req.body.id};`
//                 //         , (err, result) => {
//                 //           if (err) {
//                 //             console.log(err)
//                 //             logger.error(err);
//                 //           } else {
//                 //             res.json({ msg: "user deleted" })
//                 //           }
//                 //         })
//                 //     }
//                 //   })

//                 res.json({ msg: "user deleted" });
//             }
//         }
//     );
// };
export const deleteUser = async (req, res) => {
    const { wishlistId, id } = req.body;

    try {
        // Delete all products in the wishlist
        await database.query(
            `DELETE FROM ${product_table} WHERE wishlist_id = ?`,
            [wishlistId]
        );

        // Delete the wishlist
        await database.query(
            `DELETE FROM ${Wishlist_table} WHERE wishlist_id = ?`,
            [wishlistId]
        );

        // Delete the user
        await database.query(
            `DELETE FROM ${user_table} WHERE id = ?`,
            [id]
        );

        res.json({ msg: "user deleted" });
    } catch (err) {
        console.error("Error deleting user:", err);
        logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// export const adminDataWithDate = async (req, res) => {
//     const data = database.query(
//         `SELECT w.title, u.email FROM ${user_table} as u, ${Wishlist_table} as wt, ${product_table} as w WHERE shop_name="${req.body.shopName}" AND u.id = wt.wishlist_user_id AND wt.wishlist_id=w.wishlist_id  AND w.created_at >= "${req.body.startDate}" AND CAST(w.created_at as DATE) <= "${req.body.endDate}"`,
//         (err, selectedDateItems) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 const data = database.query(
//                     `SELECT u.email FROM ${user_table} as u WHERE shop_name="${req.body.shopName}" AND u.created_at >= "${req.body.startDate}" AND CAST(u.created_at as DATE) <= "${req.body.endDate}";`,
//                     (err, selectedDateUsers) => {
//                         if (err) {
//                             console.log(err);
//                             logger.error(err);
//                         } else {
//                             database.query(
//                                 `SELECT COUNT(*)
//               as count , IFNULL(SUM(ci.price * ci.quantity), 0) AS amount FROM ${user_table} as w, ${Wishlist_table} as wt, ${cart_table} as ci WHERE w.shop_name="${req.body.shopName}" AND w.id = wt.wishlist_user_id AND wt.wishlist_id=ci.wishlist_id  AND ci.created_at >= "${req.body.startDate}" AND CAST(ci.created_at as DATE) <= "${req.body.endDate}";`,
//                                 (err, selectedDateRevenue) => {
//                                     if (err) {
//                                         console.log(err);
//                                         logger.error(err);
//                                     } else {
//                                         const data = database.query(
//                                             `SELECT * FROM ${plan_table} WHERE plan_id="${req.body.currentPlan}";`,
//                                             (err, planDetails) => {
//                                                 if (err) {
//                                                     console.log(err);
//                                                     logger.error(err);
//                                                 } else {
//                                                     res.json({
//                                                         selectedDate: selectedDateItems,
//                                                         selectedDateUsers: selectedDateUsers,
//                                                         selectedDateRevenue: selectedDateRevenue,
//                                                         planDetails: planDetails,
//                                                     });
//                                                 }
//                                             }
//                                         );
//                                     }
//                                 }
//                             );
//                         }
//                     }
//                 );
//             }
//         }
//     );
// };

// export const apiPlanId = async (req, res) => {
//     const data = database.query(
//         `SELECT * FROM ${plan_table} WHERE name='${req.body.currentplanName}'`,
//         (err, planDetails) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 res.send({ currentPlanData: planDetails });
//             }
//         }
//     );
// };

// export const adminTopDataRecentData = async (req, res) => {
//     const data = database.query(
//         `SELECT COUNT(w.title) AS totalCount, w.handle AS handle,w.title AS title, w.image AS image, w.variant_id AS variant_id, w.product_id AS product_id FROM ${user_table} AS u , ${Wishlist_table} AS wt ,${product_table} AS w WHERE shop_name="${req.body.shopName}" AND u.id = wt.wishlist_user_id AND wt.wishlist_id = w.wishlist_id GROUP BY w.title ORDER BY totalCount DESC LIMIT 10;`,
//         (err, topData) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 const data = database.query(
//                     // `SELECT w.title, w.handle, w.image, w.variant_id, w.product_id FROM ${user_table} AS u, ${Wishlist_table} AS wt , ${product_table} AS w WHERE u.shop_name = "${req.body.shopName}" AND u.id=wt.wishlist_user_id AND wt.wishlist_id=w.wishlist_id ORDER BY w.created_at DESC LIMIT 10;`,
//                     `SELECT DISTINCT w.variant_id, w.title, w.handle, w.image, w.product_id
//             FROM ${user_table} AS u, ${Wishlist_table} AS wt, ${product_table} AS w
//             WHERE u.shop_name = "${req.body.shopName}"
//               AND u.id = wt.wishlist_user_id
//               AND wt.wishlist_id = w.wishlist_id
//             ORDER BY w.created_at DESC
//             LIMIT 10;`,
//                     (err, recentData) => {
//                         if (err) {
//                             console.log(err);
//                             logger.error(err);
//                         } else {
//                             res.json({ topData: topData, recentData: recentData });
//                         }
//                     }
//                 );
//             }
//         }
//     );
// };
export const adminDataWithDate = async (req, res) => {
    try {
        const { shopName, startDate, endDate, currentPlan } = req.body;

        // ✅ 1. Fetch products with date filter
        const [selectedDateItems] = await database.query(
            `SELECT w.title, u.email
             FROM ${user_table} AS u
             JOIN ${Wishlist_table} AS wt ON u.id = wt.wishlist_user_id
             JOIN ${product_table} AS w ON wt.wishlist_id = w.wishlist_id
             WHERE u.shop_name = ? AND w.created_at >= ? AND CAST(w.created_at AS DATE) <= ?`,
            [shopName, startDate, endDate]
        );

        // ✅ 2. Fetch users created within date range
        const [selectedDateUsers] = await database.query(
            `SELECT u.email
             FROM ${user_table} AS u
             WHERE u.shop_name = ? AND u.created_at >= ? AND CAST(u.created_at AS DATE) <= ?`,
            [shopName, startDate, endDate]
        );

        // ✅ 3. Fetch revenue/count from cart
        const [selectedDateRevenue] = await database.query(
            `SELECT COUNT(*) AS count, IFNULL(SUM(ci.price * ci.quantity), 0) AS amount
             FROM ${user_table} AS w
             JOIN ${Wishlist_table} AS wt ON w.id = wt.wishlist_user_id
             JOIN ${cart_table} AS ci ON wt.wishlist_id = ci.wishlist_id
             WHERE w.shop_name = ? AND ci.created_at >= ? AND CAST(ci.created_at AS DATE) <= ?`,
            [shopName, startDate, endDate]
        );

        // ✅ 4. Fetch current plan details
        const [planDetails] = await database.query(
            `SELECT * FROM ${plan_table} WHERE plan_id = ?`,
            [currentPlan]
        );

        // ✅ Send combined response
        res.json({
            selectedDate: selectedDateItems,
            selectedDateUsers,
            selectedDateRevenue,
            planDetails,
        });
    } catch (err) {
        console.error("Error fetching admin data with date:", err);
        logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// export const apiPlanId = async (req, res) => {
//   try {
//     const { currentplanName } = req.body;

//     const [planDetails] = await database.query(
//       `SELECT * FROM ${plan_table} WHERE name = ?`,
//       [currentplanName]
//     );

//     res.status(200).json({ currentPlanData: planDetails });
//   } catch (error) {
//     console.error("❌ Error in apiPlanId:", error);
//     logger.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
export const apiPlanId = async (req, res) => {
  try {
    const { currentplanName } = req.body;

    const [planDetails] = await database.query(
      `SELECT * FROM ${plan_table} WHERE name = ?`,
      [currentplanName]
    );

    res.status(200).json({ currentPlanData: planDetails });
  } catch (error) {
    console.error("❌ Error in apiPlanId:", error);
    logger.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const adminTopDataRecentData = async (req, res) => {
//     try {
//         const shopName = req.body.shopName;
//         // Top 10 most wished products
//         const topDataQuery = `
//             SELECT 
//                 COUNT(w.title) AS totalCount,
//                 w.handle,
//                 w.title,
//                 w.image,
//                 w.variant_id,
//                 w.product_id
//             FROM ${user_table} AS u
//             JOIN ${Wishlist_table} AS wt ON u.id = wt.wishlist_user_id
//             JOIN ${product_table} AS w ON wt.wishlist_id = w.wishlist_id
//             WHERE u.shop_name = ?
//             GROUP BY w.title
//             ORDER BY totalCount DESC
//             LIMIT 10
//         `;
//         const topData = await database.queryAsync(topDataQuery, [shopName]);

//         // 10 most recent products added to wishlists
//         const recentDataQuery = `
//             SELECT DISTINCT
//                 w.variant_id,
//                 w.title,
//                 w.handle,
//                 w.image,
//                 w.product_id
//             FROM ${user_table} AS u
//             JOIN ${Wishlist_table} AS wt ON u.id = wt.wishlist_user_id
//             JOIN ${product_table} AS w ON wt.wishlist_id = w.wishlist_id
//             WHERE u.shop_name = ?
//             ORDER BY w.created_at DESC
//             LIMIT 10
//         `;
//         const recentData = await database.queryAsync(recentDataQuery, [shopName]);

//         res.json({ topData, recentData });

//     } catch (err) {
//         console.error("Error fetching admin top/recent data:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };
export const adminTopDataRecentData = async (req, res) => {
    try {
        const { shopName } = req.body;
        // ✅ Top 10 most wished products
        const topDataQuery = `
            SELECT 
                COUNT(w.title) AS totalCount,
                w.handle,
                w.title,
                w.image,
                w.variant_id,
                w.product_id
            FROM ${user_table} AS u
            JOIN ${Wishlist_table} AS wt ON u.id = wt.wishlist_user_id
            JOIN ${product_table} AS w ON wt.wishlist_id = w.wishlist_id
            WHERE u.shop_name = ?
            GROUP BY w.title, w.handle, w.image, w.variant_id, w.product_id
            ORDER BY totalCount DESC
            LIMIT 10
        `;
        const [topData] = await database.query(topDataQuery, [shopName]);

        // ✅ 10 most recent products added to wishlists
        const recentDataQuery = `
            SELECT DISTINCT
                w.variant_id,
                w.title,
                w.handle,
                w.image,
                w.product_id,
                w.created_at
            FROM ${user_table} AS u
            JOIN ${Wishlist_table} AS wt ON u.id = wt.wishlist_user_id
            JOIN ${product_table} AS w ON wt.wishlist_id = w.wishlist_id
            WHERE u.shop_name = ?
            ORDER BY w.created_at DESC
            LIMIT 10
        `;
        const [recentData] = await database.query(recentDataQuery, [shopName]);

        res.json({ topData, recentData });
    } catch (err) {
        console.error("Error fetching admin top/recent data:", err);
        logger.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};


// export const adminTopDataWithDates = async (req, res) => {
//     const sqlQuery = `SELECT COUNT(w.title) AS totalCount, w.handle AS handle,w.title AS title, w.image AS image FROM ${user_table} AS u , ${Wishlist_table} AS wt ,${product_table} AS w WHERE shop_name="${req.body.shopName}" AND u.id = wt.wishlist_user_id AND wt.wishlist_id = w.wishlist_id AND w.created_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) GROUP BY w.title ORDER BY 'totalCount' ASC;`;
//     const sqlQuery2 = `SELECT COUNT(w.title) AS totalCount, w.handle AS handle,w.title AS title, w.image AS image FROM ${user_table} AS u , ${Wishlist_table} AS wt ,${product_table} AS w WHERE shop_name="${req.body.shopName}" AND u.id = wt.wishlist_user_id AND wt.wishlist_id = w.wishlist_id GROUP BY w.title ORDER BY 'totalCount' ASC;`;
//     const data = database.query(sqlQuery, (err, topData) => {
//         if (err) {
//             console.log(err);
//             logger.error(err);
//         } else {
//             database.query(
//                 // `SELECT w.title, w.handle, w.image, COUNT(w.title) AS totalCount FROM ${user_table} as u, ${product_table} as w WHERE shop_name="${req.body.shopName}" AND u.id = w.wishlist_id GROUP BY w.title ORDER BY totalCount DESC LIMIT 5`
//                 sqlQuery2,
//                 (err, topAllData) => {
//                     if (err) {
//                         console.log(err);
//                         logger.error(err);
//                     } else {
//                         res.json({ data: topData, topAllData: topAllData });
//                     }
//                 }
//             );
//         }
//     });
// };
export const adminTopDataWithDates = async (req, res) => {
    try {
        const { shopName } = req.body;

        // ✅ Top products in last 30 days
        const top30DaysQuery = `
            SELECT 
                COUNT(w.title) AS totalCount, 
                w.handle, 
                w.title, 
                w.image
            FROM ${user_table} AS u
            JOIN ${Wishlist_table} AS wt ON u.id = wt.wishlist_user_id
            JOIN ${product_table} AS w ON wt.wishlist_id = w.wishlist_id
            WHERE u.shop_name = ? 
              AND w.created_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
            GROUP BY w.title, w.handle, w.image
            ORDER BY totalCount ASC
        `;
        const [topData] = await database.query(top30DaysQuery, [shopName]);

        // ✅ Top products overall
        const topAllQuery = `
            SELECT 
                COUNT(w.title) AS totalCount, 
                w.handle, 
                w.title, 
                w.image
            FROM ${user_table} AS u
            JOIN ${Wishlist_table} AS wt ON u.id = wt.wishlist_user_id
            JOIN ${product_table} AS w ON wt.wishlist_id = w.wishlist_id
            WHERE u.shop_name = ?
            GROUP BY w.title, w.handle, w.image
            ORDER BY totalCount ASC
        `;
        const [topAllData] = await database.query(topAllQuery, [shopName]);

        res.json({ data: topData, topAllData });
    } catch (err) {
        console.error("Error fetching admin top data with dates:", err);
        logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// export const adminGraphDataMonthly = async (req, res) => {
//     const data = database.query(
//         `SELECT DATE(w.created_date) AS date, COUNT(w.created_date) AS total_count FROM ${user_table} AS u INNER JOIN ${Wishlist_table} AS wt ON u.id=wt.wishlist_user_id INNER JOIN ${product_table} AS w ON wt.wishlist_id=w.wishlist_id WHERE u.shop_name="${req.body.shopName}" AND w.created_date >= "${req.body.prevOneMonth}" AND CAST(w.created_date as DATE) <= "${req.body.currentDate}" GROUP BY DATE(w.created_date) ORDER BY DATE(w.created_date);`,
//         (err, lastMonthItems) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 const data = database.query(
//                     `SELECT DATE(created_at) AS date, COUNT(created_at) AS total_count FROM ${user_table} WHERE shop_name="${req.body.shopName}" AND created_at >= "${req.body.prevOneMonth}" AND DATE(created_at) <= "${req.body.currentDate}" GROUP BY DATE(created_at) ORDER BY DATE(created_at);`,
//                     (err, lastMonthUsers) => {
//                         if (err) {
//                             console.log(err);
//                             logger.error(err);
//                         } else {
//                             res.json({
//                                 lastMonthItems: lastMonthItems,
//                                 lastMonthUsers: lastMonthUsers,
//                             });
//                         }
//                     }
//                 );
//             }
//         }
//     );
// };
export const adminGraphDataMonthly = async (req, res) => {
    try {
        const { shopName, prevOneMonth, currentDate } = req.body;

        // ✅ Fetch products created in the last month
        const [lastMonthItems] = await database.query(
            `
            SELECT DATE(w.created_date) AS date, COUNT(w.created_date) AS total_count
            FROM ${user_table} AS u
            INNER JOIN ${Wishlist_table} AS wt ON u.id = wt.wishlist_user_id
            INNER JOIN ${product_table} AS w ON wt.wishlist_id = w.wishlist_id
            WHERE u.shop_name = ? AND w.created_date >= ? AND CAST(w.created_date AS DATE) <= ?
            GROUP BY DATE(w.created_date)
            ORDER BY DATE(w.created_date)
            `,
            [shopName, prevOneMonth, currentDate]
        );

        // ✅ Fetch users created in the last month
        const [lastMonthUsers] = await database.query(
            `
            SELECT DATE(created_at) AS date, COUNT(created_at) AS total_count
            FROM ${user_table}
            WHERE shop_name = ? AND created_at >= ? AND DATE(created_at) <= ?
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at)
            `,
            [shopName, prevOneMonth, currentDate]
        );

        res.json({
            lastMonthItems,
            lastMonthUsers,
        });
    } catch (err) {
        console.error("Error fetching admin monthly graph data:", err);
        logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// export const adminGraphDataYearly = async (req, res) => {
//     // app_SQL.post("/admin-graph-data-yearly", async (req, res) => {
//     const data = database.query(
//         `SELECT created_at AS date, count(created_at) AS count FROM ${user_table} WHERE shop_name="${req.body.shopName}" AND created_at> now() - INTERVAL 12 month GROUP by DATE_FORMAT(created_at, '%M') ORDER by created_at ASC;`,
//         (err, lastYearUsers) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 const data = database.query(
//                     `SELECT w.created_date AS date, count(w.created_date) AS count FROM ${user_table} AS u, ${Wishlist_table} as wt, ${product_table} AS w WHERE shop_name="${req.body.shopName}" AND u.id=wt.wishlist_user_id AND wt.wishlist_id=w.wishlist_id AND w.created_date> now() - INTERVAL 12 month GROUP by DATE_FORMAT(w.created_date, '%M') ORDER by w.created_date ASC;`,
//                     (err, lastYearItems) => {
//                         if (err) {
//                             console.log(err);
//                             logger.error(err);
//                         } else {
//                             res.json({
//                                 lastYearUsers: lastYearUsers,
//                                 lastYearItems: lastYearItems,
//                             });
//                         }
//                     }
//                 );
//             }
//         }
//     );
// };

// export const getPlanName = async (req, res) => {
//     const data = database.query(
//         `SELECT * FROM plan WHERE plan_id= ${req.body.id}`,
//         (err, result) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 res.send({ data: result });
//             }
//         }
//     );
// };
export const adminGraphDataYearly = async (req, res) => {
    try {
        const { shopName } = req.body;

        // ✅ Users created in the last 12 months grouped by month
        const [lastYearUsers] = await database.query(
            `
            SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(created_at) AS count
            FROM ${user_table}
            WHERE shop_name = ? AND created_at > NOW() - INTERVAL 12 MONTH
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY MIN(created_at) ASC
            `,
            [shopName]
        );

        // ✅ Products added to wishlists in the last 12 months grouped by month
        const [lastYearItems] = await database.query(
            `
            SELECT DATE_FORMAT(w.created_date, '%Y-%m') AS month, COUNT(w.created_date) AS count
            FROM ${user_table} AS u
            JOIN ${Wishlist_table} AS wt ON u.id = wt.wishlist_user_id
            JOIN ${product_table} AS w ON wt.wishlist_id = w.wishlist_id
            WHERE u.shop_name = ? AND w.created_date > NOW() - INTERVAL 12 MONTH
            GROUP BY DATE_FORMAT(w.created_date, '%Y-%m')
            ORDER BY MIN(w.created_date) ASC
            `,
            [shopName]
        );

        res.json({ lastYearUsers, lastYearItems });
    } catch (err) {
        console.error("Error fetching admin yearly graph data:", err);
        logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// export const getPlanName = async (req, res) => {
//   try {
//     const { id } = req.body;

//     const [result] = await database.query(
//       `SELECT * FROM plan WHERE plan_id = ?`,
//       [id]
//     );

//     res.status(200).json({ data: result });
//   } catch (error) {
//     console.error("❌ Error in getPlanName:", error);
//     logger.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


// export const getPlanData = async (req, res) => {
//     const session = await shopify.config.sessionStorage.findSessionsByShop(
//         req?.query?.domain
//     );
//     const data = database.query(`SELECT * FROM plan `, (err, result) => {
//         if (err) {
//             console.log(err);
//             logger.error(err);
//         } else {
//             res.send({ data: result });
//         }
//     });
// };
export const getPlanName = async (req, res) => {
  try {
    const { id } = req.body;

    const [result] = await database.query(
      `SELECT * FROM ${plan_table} WHERE plan_id = ?`,
      [id]
    );

    res.status(200).json({ data: result });
  } catch (error) {
    console.error("❌ Error in getPlanName:", error);
    logger.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const getPlanData = async (req, res) => {
//   try {
//     // Fetch session (unchanged logic)
//     const session = await shopify.config.sessionStorage.findSessionsByShop(
//       req?.query?.domain
//     );

//     // Fetch all plan data
//     const [result] = await database.query(`SELECT * FROM plan`);

//     res.status(200).json({ data: result });
//   } catch (error) {
//     console.error("❌ Error in getPlanData:", error);
//     logger.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
export const getPlanData = async (req, res) => {
  try {
    // ✅ Fetch session (Shopify logic unchanged)
    const session = await shopify.config.sessionStorage.findSessionsByShop(
      req?.query?.domain
    );

    // ✅ Fetch all plan data from the database
    const [result] = await database.query(`SELECT * FROM plan`);

    res.status(200).json({ data: result });
  } catch (error) {
    console.error("❌ Error in getPlanData:", error);
    logger.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const requestFormMain = async (req, res) => {
    const emailData = req.body;
    // console.log("reqqqq ", emailData)
    let emailContent = {
        from: emailData.storeAdminEmail,
        to: supportEmail,
        subject: `Wishlist guru ${emailData.subject} `,
        html: `<p>Store domain : ${emailData.storeDomain} </p>
    <p>Store Email : ${emailData.storeAdminEmail} </p>
    <p>Message : ${emailData.message} </p>
    `,
    };
    const emailMsg = await requestForm(emailContent);

    // console.log("AAAAA emailMsg ", emailMsg.isError)
    if (emailMsg.isError === true) {
        res.send({ msg: "Email sent successfully" });
    } else {
        res.send({ msg: "something went wrong" });
    }
};

// export const emailReminderChecksUpdate = async (req, res) => {
//     const data = database.query(
//         `SELECT app_install_id FROM app_installation WHERE shop_name="${req.body.shopName}";`,
//         (err, result) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 // console.log("DATA ID ---- ", result[0].app_install_id)
//                 if (result.length === 0) {
//                     res.send({ msg: "shop_name not found" });
//                 } else {
//                     const data = database.query(
//                         `UPDATE email_reminder SET email_option = "${req.body.emailOption}", selected_date=${req.body.selectedDate}, back_in_stock="${req.body.backInStockMail}", low_in_stock="${req.body.lowInStockMail}", price_drop="${req.body.priceDropMail}"  WHERE app_install_id = "${result[0].app_install_id}";`,
//                         (err, result) => {
//                             if (err) {
//                                 console.log(err);
//                                 logger.error(err);
//                             } else {
//                                 res.send({ data: result, msg: "data_updated" });
//                             }
//                         }
//                     );
//                 }
//             }
//         }
//     );
// };
export const emailReminderChecksUpdate = async (req, res) => {
    try {
        const { shopName, emailOption, selectedDate, backInStockMail, lowInStockMail, priceDropMail } = req.body;

        // ✅ Get app_install_id for the shop
        const [installRows] = await database.query(
            `SELECT app_install_id FROM app_installation WHERE shop_name = ?`,
            [shopName]
        );

        if (installRows.length === 0) {
            return res.status(404).json({ msg: "shop_name not found" });
        }

        const appInstallId = installRows[0].app_install_id;

        // ✅ Update email_reminder table
        const [updateResult] = await database.query(
            `
            UPDATE email_reminder
            SET 
                email_option = ?, 
                selected_date = ?, 
                back_in_stock = ?, 
                low_in_stock = ?, 
                price_drop = ?
            WHERE app_install_id = ?
            `,
            [emailOption, selectedDate, backInStockMail, lowInStockMail, priceDropMail, appInstallId]
        );

        res.json({ data: updateResult, msg: "data_updated" });
    } catch (err) {
        console.error("Error updating email reminders:", err);
        logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// export const getEmailReminderAndStoreLanguage = async (req, res) => {
//     const { shopName } = req.body;
//     const data = database.query(`SELECT * FROM email_reminder WHERE shop_name="${shopName}" `, (err, result) => {
//         if (err) {
//             console.log(err);
//             logger.error(err);
//         } else {
//             const data2 = database.query(`SELECT sl.lang_id, sl.lang_name, slu.type FROM store_languages as sl, store_languages_url as slu WHERE sl.shop_name="${shopName}" AND sl.lang_id = slu.lang_id `, (err2, result2) => {
//                 if (err2) {
//                     console.log(err2);
//                     logger.error(err2);
//                 } else {
//                     res.send({ emailData: result, languageData: result2 });
//                 }
//             });
//         }
//     });
// };
export const getEmailReminderAndStoreLanguage = async (req, res) => {
    try {
        const { shopName } = req.body;

        // ✅ Fetch email reminder data
        const [emailData] = await database.query(
            `SELECT * FROM email_reminder WHERE shop_name = ?`,
            [shopName]
        );

        // ✅ Fetch store language data
        const [languageData] = await database.query(
            `
            SELECT sl.lang_id, sl.lang_name, slu.type
            FROM store_languages AS sl
            JOIN store_languages_url AS slu ON sl.lang_id = slu.lang_id
            WHERE sl.shop_name = ?
            `,
            [shopName]
        );

        res.json({ emailData, languageData });
    } catch (err) {
        console.error("Error fetching email reminder and store language:", err);
        logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// export const cleanDbData = async (req, res) => {
//     try {
//         console.log("clean data is running-------");

//         const allStores = await queryAsync(`SELECT shop_name FROM ${app_installation_table} WHERE updated_date <= CURDATE() - INTERVAL 30 DAY AND status='inActive' AND clean_status='not_done';`)
//         if (allStores.length) {
//             for (const store of allStores) {
//                 // await deleteUserDataAtUninstallation(store.shop_name);
//                 // await queryAsync(`UPDATE ${app_installation_table} SET clean_status="done" WHERE shop_name='${store.shop_name}'`)
//             }
//         }
//         res.status(200).json({ msg: "Deleted successfully" });
//     } catch (error) {
//         logger.error(error.message);
//         res.status(500).json({
//             error: "An error occurred while deleting data after 30 day",
//             details: error.message,
//         });
//     }
// };
export const cleanDbData = async (req, res) => {
    try {
        console.log("clean data is running-------");

        // ✅ Fetch all stores inactive for 30+ days and not yet cleaned
        const [allStores] = await database.query(
            `SELECT shop_name 
             FROM ${app_installation_table} 
             WHERE updated_date <= CURDATE() - INTERVAL 30 DAY 
               AND status = 'inActive' 
               AND clean_status = 'not_done'`
        );

        if (allStores.length) {
            for (const store of allStores) {
                const shopName = store.shop_name;

                // ✅ Delete user data at uninstallation
                // await deleteUserDataAtUninstallation(shopName);

                // ✅ Update clean_status to 'done'
                await database.query(
                    `UPDATE ${app_installation_table} SET clean_status = 'done' WHERE shop_name = ?`,
                    [shopName]
                );
            }
        }

        res.status(200).json({ msg: "Deleted successfully" });
    } catch (error) {
        console.error("Error cleaning DB data:", error);
        logger.error(error);
        res.status(500).json({
            error: "An error occurred while deleting data after 30 days",
            details: error.message,
        });
    }
};

// export const getEmailReminderChecks = async (req, res) => {
//     const { shopName } = req.body;
//     try {
//         const mainSelectQuery = `SELECT er.id, er.logo, er.email_option, er.selected_date, er.back_in_stock, er.low_in_stock, er.price_drop, er.shop_name FROM app_installation AS ai JOIN email_reminder AS er ON ai.app_install_id = er.app_install_id WHERE ai.shop_name = ?`;
//         const mainResult = await queryAsync(mainSelectQuery, [shopName]);

//         const getId = `SELECT app_install_id, date, shop_email FROM app_installation WHERE shop_name = ?`;
//         const getIdResult = await queryAsync(getId, [shopName]);

//         if (mainResult.length === 0) {
//             const inertQuery = `INSERT INTO ${email_reminder_table} (app_install_id, email_option, selected_date, back_in_stock, low_in_stock, price_drop, shop_name) VALUES (?, ?, ? ,? ,?, ?, ?)`;
//             const inertQueryResult = await queryAsync(inertQuery, [
//                 getIdResult[0].app_install_id,
//                 "turnOff",
//                 `DAY(${getIdResult[0].date})`,
//                 "no",
//                 "no",
//                 "no",
//                 shopName,
//             ]);

//             let getShopEmail = getIdResult[0]?.shop_email || "";
//             if (getShopEmail) {
//                 ["backInStock", "lowInStock", "priceDrop", "weeklyEmail"].forEach((key) => {
//                     if (typeof req.body[key] === "string" && req.body[key].includes("support@webframez.com")) {
//                         req.body[key] = req.body[key].replace(/support@webframez\.com/g, getShopEmail);
//                     }
//                 });
//             }

//             await addTempData(req, res, inertQueryResult.insertId);

//             const savedData = {
//                 email_option: "turnOff",
//                 back_in_stock: "no",
//                 low_in_stock: "no",
//                 price_drop: "no",
//                 logo: null,
//             };

//             res.send({
//                 data: savedData,
//                 app_install_id: getIdResult[0].app_install_id,
//                 msg: "inserted_data",
//             });
//         } else {
//             if (!mainResult[0].shop_name) {
//                 const updateQuery = `UPDATE ${email_reminder_table} SET shop_name = ? WHERE app_install_id = ?`;
//                 await queryAsync(updateQuery, [
//                     shopName,
//                     getIdResult[0].app_install_id,
//                 ]);
//             }

//             const mainSelectQuery = `SELECT se.temp_id, se.sender_name, se.reply_to, se.back_in_stock_temp, se.low_in_stock_temp, se.price_drop_temp, se.weekly_email_temp FROM ${email_reminder_table} AS er INNER JOIN ${store_email_temp_table} AS se ON se.id = er.id WHERE er.shop_name = ?`;
//             const mainResult2 = await queryAsync(mainSelectQuery, [shopName]);

//             if (mainResult2.length === 0) {
//                 await addTempData(req, res, mainResult[0].id);
//             }

//             res.send({
//                 data: mainResult,
//                 data2: mainResult2,
//                 app_install_id: getIdResult[0].app_install_id,
//                 msg: "getting_data",
//             });
//         }
//     } catch (err) {
//         console.error(err);
//         logger.error(err);
//         res.status(500).json({ msg: "Internal Server Error" });
//     }
// };
export const getEmailReminderChecks = async (req, res) => {
    const { shopName } = req.body;

    try {
        // ✅ Fetch email reminder data for the shop
        const [mainResult] = await database.query(
            `
            SELECT er.id, er.logo, er.email_option, er.selected_date, er.back_in_stock, 
                   er.low_in_stock, er.price_drop, er.shop_name
            FROM app_installation AS ai
            JOIN ${email_reminder_table} AS er ON ai.app_install_id = er.app_install_id
            WHERE ai.shop_name = ?
            `,
            [shopName]
        );

        // ✅ Fetch app_install_id and shop_email
        const [getIdResult] = await database.query(
            `SELECT app_install_id, date, shop_email FROM app_installation WHERE shop_name = ?`,
            [shopName]
        );

        if (!getIdResult.length) {
            return res.status(404).json({ msg: "shop not found" });
        }

        const appInstallId = getIdResult[0].app_install_id;
        const shopEmail = getIdResult[0].shop_email || "";

        if (mainResult.length === 0) {
            // ✅ Insert default email_reminder row if none exists
            const [insertResult] = await database.query(
                `
                INSERT INTO ${email_reminder_table} 
                (app_install_id, email_option, selected_date, back_in_stock, low_in_stock, price_drop, shop_name)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    appInstallId,
                    "turnOff",
                    `DAY(${getIdResult[0].date})`,
                    "no",
                    "no",
                    "no",
                    shopName,
                ]
            );

            // ✅ Replace placeholders in request body if shop email exists
            if (shopEmail) {
                ["backInStock", "lowInStock", "priceDrop", "weeklyEmail"].forEach((key) => {
                    if (typeof req.body[key] === "string" && req.body[key].includes("support@webframez.com")) {
                        req.body[key] = req.body[key].replace(/support@webframez\.com/g, shopEmail);
                    }
                });
            }

            await addTempData(req, res, insertResult.insertId);

            const savedData = {
                email_option: "turnOff",
                back_in_stock: "no",
                low_in_stock: "no",
                price_drop: "no",
                logo: null,
            };

            return res.json({
                data: savedData,
                app_install_id: appInstallId,
                msg: "inserted_data",
            });
        } else {
            // ✅ Update shop_name if missing
            if (!mainResult[0].shop_name) {
                await database.query(
                    `UPDATE ${email_reminder_table} SET shop_name = ? WHERE app_install_id = ?`,
                    [shopName, appInstallId]
                );
            }

            // ✅ Fetch temporary email data
            const [mainResult2] = await database.query(
                `
                SELECT se.temp_id, se.sender_name, se.reply_to, se.back_in_stock_temp, 
                       se.low_in_stock_temp, se.price_drop_temp, se.weekly_email_temp
                FROM ${email_reminder_table} AS er
                INNER JOIN ${store_email_temp_table} AS se ON se.id = er.id
                WHERE er.shop_name = ?
                `,
                [shopName]
            );

            if (mainResult2.length === 0) {
                await addTempData(req, res, mainResult[0].id);
            }

            return res.json({
                data: mainResult,
                data2: mainResult2,
                app_install_id: appInstallId,
                msg: "getting_data",
            });
        }
    } catch (err) {
        console.error("Error in getEmailReminderChecks:", err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};


// async function addTempData(req, res, id) {
//     try {
//         const {
//             backInStock,
//             lowInStock,
//             priceDrop,
//             weeklyEmail,
//             shopName,
//             language,
//         } = req.body;
//         const insertQuery = `INSERT INTO ${store_email_temp_table} (id, shop_name, language, back_in_stock_temp, low_in_stock_temp, price_drop_temp, weekly_email_temp) VALUES (?, ?, ?, ?, ?, ?, ?)`;
//         await queryAsync(insertQuery, [
//             id,
//             shopName,
//             language,
//             backInStock,
//             lowInStock,
//             priceDrop,
//             weeklyEmail,
//         ]);
//     } catch (err) {
//         console.error(err);
//         logger.error(err);
//     }
// }
export async function addTempData(req, res, id) {
    try {
        const {
            backInStock = "no",
            lowInStock = "no",
            priceDrop = "no",
            weeklyEmail = "no",
            shopName,
            language = "en",
        } = req.body;

        const insertQuery = `
            INSERT INTO ${store_email_temp_table} 
                (id, shop_name, language, back_in_stock_temp, low_in_stock_temp, price_drop_temp, weekly_email_temp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await database.query(insertQuery, [
            id,
            shopName,
            language,
            backInStock,
            lowInStock,
            priceDrop,
            weeklyEmail,
        ]);
    } catch (err) {
        console.error("Error in addTempData:", err);
        logger.error(err);
    }
}


// export const getEmailTempData = async (req, res) => {
//     // app_SQL.post("/get-email-temp-data", async (req, res) => {
//     const { shopName, language } = req.body;
//     try {
//         const mainSelectQuery = `SELECT se.temp_id, se.sender_name, se.reply_to, se.back_in_stock_temp, se.low_in_stock_temp, se.price_drop_temp, se.weekly_email_temp FROM ${email_reminder_table} AS er INNER JOIN ${store_email_temp_table} AS se ON se.id = er.id WHERE er.shop_name = ? AND se.language = ?`;
//         const mainResult = await queryAsync(mainSelectQuery, [shopName, language]);
//         res.send({ data: mainResult, msg: "inserted_data" });
//     } catch (error) {
//         console.error(error);
//         logger.error(error);
//         res.status(500).json({ msg: "Internal Server Error" });
//     }
// };
export const getEmailTempData = async (req, res) => {
    const { shopName, language } = req.body;

    try {
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
            INNER JOIN ${store_email_temp_table} AS se ON se.id = er.id
            WHERE er.shop_name = ? AND se.language = ?
        `;

        // Using async/await query with parameterized inputs
        const [mainResult] = await database.query(mainSelectQuery, [shopName, language]);

        res.json({ data: mainResult, msg: "inserted_data" });
    } catch (error) {
        console.error("Error in getEmailTempData:", error);
        logger.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};


// export const emailTemplateUpdate = async (req, res) => {
//     const { shopName, tempName, tempClm, tempId } = req.body;
//     try {
//         let updateWhere;
//         if (tempClm === "PriceDrop") {
//             updateWhere = `UPDATE ${store_email_temp_table} SET price_drop_temp = ? WHERE shop_name = ? AND temp_id = ?`;
//         } else if (tempClm === "LowInStock") {
//             updateWhere = `UPDATE ${store_email_temp_table} SET low_in_stock_temp = ? WHERE shop_name = ? AND temp_id = ?`;
//         } else if (tempClm === "BackInStock") {
//             updateWhere = `UPDATE ${store_email_temp_table} SET back_in_stock_temp = ? WHERE shop_name = ? AND temp_id = ?`;
//         } else {
//             updateWhere = `UPDATE ${store_email_temp_table} SET weekly_email_temp = ? WHERE shop_name = ? AND temp_id = ?`;
//         }

//         const mainResult = await queryAsync(updateWhere, [
//             tempName,
//             shopName,
//             tempId,
//         ]);
//         res.send({ data: mainResult, msg: "Data Updated" });
//     } catch (error) {
//         console.error(error);
//         logger.error(error);
//         res.status(500).json({ msg: "Internal Server Error" });
//     }
// };
export const emailTemplateUpdate = async (req, res) => {
    const { shopName, tempName, tempClm, tempId } = req.body;

    try {
        let updateQuery;

        switch (tempClm) {
            case "PriceDrop":
                updateQuery = `UPDATE ${store_email_temp_table} SET price_drop_temp = ? WHERE shop_name = ? AND temp_id = ?`;
                break;
            case "LowInStock":
                updateQuery = `UPDATE ${store_email_temp_table} SET low_in_stock_temp = ? WHERE shop_name = ? AND temp_id = ?`;
                break;
            case "BackInStock":
                updateQuery = `UPDATE ${store_email_temp_table} SET back_in_stock_temp = ? WHERE shop_name = ? AND temp_id = ?`;
                break;
            default:
                updateQuery = `UPDATE ${store_email_temp_table} SET weekly_email_temp = ? WHERE shop_name = ? AND temp_id = ?`;
                break;
        }

        const [result] = await database.query(updateQuery, [tempName, shopName, tempId]);

        res.json({ data: result, msg: "Data Updated" });
    } catch (error) {
        console.error("Error in emailTemplateUpdate:", error);
        logger.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};


// export const saveSenderReceiverName = async (req, res) => {
//     const { shopName, senderName, replyToEmail } = req.body;

//     database.query(`UPDATE store_email_templates SET sender_name='${senderName}', reply_to='${replyToEmail}' WHERE shop_name="${shopName}"`, (err, result) => {
//         if (err) {
//             logger.error(err);
//         }
//         else {
//             res.send({ msg: "data_updated" })
//         }
//     })
// };
export const saveSenderReceiverName = async (req, res) => {
    const { shopName, senderName, replyToEmail } = req.body;

    try {
        const updateQuery = `
            UPDATE store_email_templates 
            SET sender_name = ?, reply_to = ? 
            WHERE shop_name = ?
        `;

        const [result] = await database.query(updateQuery, [senderName, replyToEmail, shopName]);

        res.json({ msg: "data_updated", data: result });
    } catch (err) {
        console.error("Error in saveSenderReceiverName:", err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};


// export const getEmailReportsData = async (req, res) => {
//     const { shopName, startDate, endDate, emailType, isDates, isType } = req.body;
//     let dateQuery = "";
//     let typeQuery = "";

//     if (isDates) {
//         dateQuery += `AND date >= "${startDate}" AND CAST(date as DATE) <= "${endDate}"`;
//     }

//     if (isType) {
//         typeQuery += `AND email_type = "${emailType}"`;
//     }

//     database.query(`SELECT p.email_quota from app_installation as a, plan as p where a.shop_name="${shopName}" AND a.active_plan_id = p.plan_id;`, async (err, emailQuotaRes) => {
//         if (err) {
//             logger.error(err);
//         }
//         else {
//             try {
//                 const mainSelectQuery = `SELECT * from ${email_reports_table} WHERE shop_name = ? ${dateQuery} ${typeQuery} ORDER BY date DESC`;
//                 const mainResult = await queryAsync(mainSelectQuery, [shopName]);
//                 res.send({ mainResult: mainResult, msg: "date fetched", emailQuota: emailQuotaRes });
//             } catch (err) {
//                 console.error(err);
//                 logger.error(err);
//                 res.status(500).json({ msg: "Internal Server Error" });
//             }
//         }
//     })
// };
export const getEmailReportsData = async (req, res) => {
    const { shopName, startDate, endDate, emailType, isDates, isType } = req.body;

    try {
        // ✅ Fetch email quota
        const [emailQuotaRes] = await database.query(
            `
            SELECT p.email_quota 
            FROM app_installation AS a
            JOIN plan AS p ON a.active_plan_id = p.plan_id
            WHERE a.shop_name = ?
            `,
            [shopName]
        );

        // ✅ Build dynamic WHERE clauses safely
        const whereClauses = ["shop_name = ?"];
        const params = [shopName];

        if (isDates) {
            whereClauses.push("date >= ? AND CAST(date AS DATE) <= ?");
            params.push(startDate, endDate);
        }

        if (isType) {
            whereClauses.push("email_type = ?");
            params.push(emailType);
        }

        const mainSelectQuery = `
            SELECT *
            FROM ${email_reports_table}
            WHERE ${whereClauses.join(" AND ")}
            ORDER BY date DESC
        `;

        const [mainResult] = await database.query(mainSelectQuery, params);

        res.json({
            mainResult,
            emailQuota: emailQuotaRes,
            msg: "date fetched"
        });
    } catch (err) {
        console.error("Error in getEmailReportsData:", err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};


// export const sendWishlistQuotaLimitMails = async (req, res) => {

//     const data = database.query(
//         `SELECT wu.shop_name, ai.store_owner, ai.shop_email as shop_email,ai.customer_email as customer_email, p.name, p.quota, COUNT(wi.title) AS total_items FROM app_installation AS ai, wishlist_users AS wu, wishlist AS wt, wishlist_items AS wi, plan AS p WHERE ai.shop_name = wu.shop_name AND wu.id = wt.wishlist_user_id AND wt.wishlist_id = wi.wishlist_id AND ai.active_plan_id = p.plan_id AND ai.status = "Active" AND MONTH(wi.created_at) = MONTH(CURRENT_DATE()) AND YEAR(wi.created_at) = YEAR(CURRENT_DATE()) GROUP BY wu.shop_name;`,
//         async (err, result) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 if (result.length > 0) {
//                     for (let i = 0; i < result.length; i++) {
//                         let sendMail = false;
//                         let mailHtml = ``;
//                         let eightyPercent = (80 / 100) * result[i].quota;

//                         let getMyCurrentPercentage =
//                             (result[i].total_items / result[i].quota) * 100;

//                         if (
//                             result[i].total_items >= eightyPercent &&
//                             result[i].total_items < result[i].quota
//                         ) {
//                             sendMail = true;
//                             mailHtml = eightyPercentLimitEmailHTML(
//                                 result[i].name,
//                                 result[i].shop_name,
//                                 getMyCurrentPercentage,
//                                 result[i].store_owner
//                             );
//                         } else if (result[i].total_items >= result[i].quota) {
//                             sendMail = true;
//                             mailHtml = hundredPercentLimitEmailHTML(
//                                 result[i].name,
//                                 result[i].shop_name,
//                                 getMyCurrentPercentage,
//                                 result[i].store_owner
//                             );

//                             // --------here we will send a mail to webframez for quota limit--------
//                             let emailContent = {
//                                 from: supportEmail,
//                                 to: "webframez@gmail.com",
//                                 subject: `Wishlist Guru – Quota Limit Exceeded of ${result[i]?.shop_name}`,
//                                 html: `Hii.. <br> <br>
//                                 The wishlist quota limit has been exceeded for this store. Please find the details below: <br><br>
//                                 Shop Name: ${result[i]?.shop_name} <br>
//                                 Email : ${result[i]?.shop_email} <br>
//                                 Customer Email: ${result[i]?.customer_email} <br><br>
//                                 Thank you.
//                                 Best regards`,
//                             };
//                             sendEmail(emailContent);

//                         }

//                         if (sendMail) {
//                             const emailRegEx =
//                                 /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
//                             const checkEmail = emailRegEx.test(result[i].shop_email);
//                             if (checkEmail) {
//                                 let emailContent = {
//                                     from: supportEmail,
//                                     to: result[i].shop_email,
//                                     subject:
//                                         "Your Wishlist Quota limit crossed.. Update Plan NOW!!!",
//                                     html: mailHtml,
//                                 };
//                                 sendEmail(emailContent);
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     );
// };
export const sendWishlistQuotaLimitMails = async (req, res) => {
    try {
        const selectQuery = `
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
            GROUP BY wu.shop_name;
        `;

        const [result] = await database.query(selectQuery);

        if (result.length > 0) {
            for (const store of result) {
                let sendMail = false;
                let mailHtml = "";
                const eightyPercent = (80 / 100) * store.quota;
                const currentPercentage = (store.total_items / store.quota) * 100;

                if (store.total_items >= eightyPercent && store.total_items < store.quota) {
                    sendMail = true;
                    mailHtml = eightyPercentLimitEmailHTML(
                        store.name,
                        store.shop_name,
                        currentPercentage,
                        store.store_owner
                    );
                } else if (store.total_items >= store.quota) {
                    sendMail = true;
                    mailHtml = hundredPercentLimitEmailHTML(
                        store.name,
                        store.shop_name,
                        currentPercentage,
                        store.store_owner
                    );

                    // Send notification to Webframez
                    const webframezMail = {
                        from: supportEmail,
                        to: "webframez@gmail.com",
                        subject: `Wishlist Guru – Quota Limit Exceeded of ${store.shop_name}`,
                        html: `Hii.. <br><br>
                               The wishlist quota limit has been exceeded for this store. Please find the details below: <br><br>
                               Shop Name: ${store.shop_name} <br>
                               Email: ${store.shop_email} <br>
                               Customer Email: ${store.customer_email} <br><br>
                               Thank you.<br>Best regards`,
                    };
                    await sendEmail(webframezMail);
                }

                if (sendMail) {
                    const emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                    if (emailRegEx.test(store.shop_email)) {
                        const shopMail = {
                            from: supportEmail,
                            to: store.shop_email,
                            subject: "Your Wishlist Quota limit crossed.. Update Plan NOW!!!",
                            html: mailHtml,
                        };
                        await sendEmail(shopMail);
                    }
                }
            }
        }

        res.json({ msg: "Emails processed successfully" });
    } catch (error) {
        console.error("Error in sendWishlistQuotaLimitMails:", error);
        logger.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
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

// export const sendMonthlyWishlistToAdmin = async (req, res) => {
//     const data = database.query(
//         // `SELECT wu.shop_name, wu.email_option, wu.email, COUNT(DISTINCT wu.email) as total_user, COUNT(wi.title) as total_item FROM ${app_installation_table} as ai, ${user_table} as wu, ${Wishlist_table} as wt, ${product_table} as wi WHERE ai.shop_name=wu.shop_name AND ai.active_plan_id > '1' AND wu.id = wi.wishlist_id AND wi.created_date > now() - INTERVAL 7 day GROUP BY wu.shop_name;`

//         `SELECT wu.shop_name, er.email_option, wu.email, COUNT(DISTINCT wu.email) as total_user, COUNT(wi.title) as total_item FROM app_installation as ai, email_reminder as er, wishlist_users as wu, wishlist as wt, wishlist_items as wi WHERE ai.shop_name=wu.shop_name AND ai.app_install_id = er.app_install_id AND er.email_option = "monthly" AND ai.active_plan_id > '1' AND wu.id = wt.wishlist_user_id AND wt.wishlist_id = wi.wishlist_id AND wi.created_date > now() - INTERVAL 7 day GROUP BY wu.shop_name;`,
//         (err, result) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 let mailHtml = ``;
//                 if (result.length > 0) {
//                     // console.log("FFFF ", result);
//                     for (let i = 0; i < result.length; i++) {
//                         if (result[i].email_option === "monthly") {
//                             mailHtml = weeklyWishlistUpdateToAdminHTML(result[i]);
//                             const emailRegEx =
//                                 /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
//                             const checkEmail = emailRegEx.test(result[i].shop_email);
//                             if (checkEmail) {
//                                 let emailContent = {
//                                     from: supportEmail,
//                                     to: result[i].shop_email,
//                                     subject: "Last week update",
//                                     html: mailHtml,
//                                 };
//                                 sendEmail(emailContent);
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     );
// };

// export const sendMonthlyWishlistToUser = async (req, res) => {
//     console.log("API started -------------- ")

//     // try {
//     //     // get all shops of the current date
//     //     const getShops = await new Promise((resolve, reject) => {
//     //         database.query(
//     //             // `SELECT DISTINCT ai.shop_name, er.logo, er.email_option, ai.app_install_id, ai.store_name, ai.active_plan_id as plan FROM wishlist_users as wu, app_installation as ai, email_reminder as er, wishlist as w WHERE er.email_option = "monthly" AND er.selected_date = DAY(CURDATE()) AND ai.app_install_id = er.app_install_id AND ai.active_plan_id > '1';`

//     //             `SELECT DISTINCT ai.shop_name, ai.shop_email, er.logo, er.email_option, ai.app_install_id, ai.store_name, ai.active_plan_id AS plan
//     //         FROM
//     //           wishlist_users AS wu
//     //           JOIN app_installation AS ai ON wu.shop_name = ai.shop_name
//     //           JOIN email_reminder AS er ON ai.app_install_id = er.app_install_id
//     //           JOIN wishlist AS w ON wu.id = w.wishlist_user_id
//     //           LEFT JOIN email_logs AS el ON ai.app_install_id = el.app_install_id
//     //             AND MONTH(el.last_sent) = MONTH(CURDATE())
//     //             AND YEAR(el.last_sent) = YEAR(CURDATE())
//     //         WHERE
//     //           er.email_option = 'monthly'
//     //           AND er.selected_date = DAY(CURDATE())
//     //           AND ai.active_plan_id > '1'
//     //           AND el.last_sent IS NULL;`,
//     //             (err, results) => {
//     //                 if (err) {
//     //                     reject(err);
//     //                 } else {
//     //                     resolve(results);
//     //                 }
//     //             }
//     //         );
//     //     });

//     //     // AND er.selected_date = DAY(CURDATE())


//     //     console.log("getShops --- ", getShops);

//     //     if (getShops?.length > 0) {

//     //         for (let i = 0; i < getShops.length; i++) {
//     //             const user = getShops[i];
//     //             const { logo, app_install_id, shop_name: shopName, shop_email: shopEmail, email_option, wishlist_id, store_name } = user;

//     //             // insert logs into email_logs
//     //             const saveEmailLogs = database.query(`INSERT INTO email_logs (app_install_id, shop_name, last_sent) VALUES ('${app_install_id}', '${shopName}', NOW())`);

//     //             // get all users of the of selected shopName
//     //             const getUsers = await new Promise((resolve, reject) => {
//     //                 database.query(`SELECT email FROM wishlist_users WHERE shop_name="${shopName}" AND user_type="User";`,
//     //                     (err, results) => {
//     //                         if (err) {
//     //                             reject(err);
//     //                         } else {
//     //                             resolve(results);
//     //                         }
//     //                     }
//     //                 );
//     //             });

//     //             console.log("getUsers --- ", getUsers)

//     //             const shopDomain = shopName;
//     //             const emailData = await queryAsync(`SELECT se.weekly_email_temp, se.sender_name, se.reply_to  FROM ${store_email_temp_table} AS se   JOIN ${email_reminder_table} AS er  ON er.id = se.id  AND er.shop_name = ?`, [shopName]
//     //             );

//     //             const getSmtpDetail = await databaseQuery(`SELECT * FROM email_smtp WHERE shop_name="${shopName}"`);



//     //             if (getUsers?.length > 0) {
//     //                 for (let j = 0; j < getUsers.length; j++) {
//     //                     console.log("outside loop")

//     //                     // if (j < 3) {
//     //                     console.log("inside loop")

//     //                     if (email_option === "monthly") {
//     //                         const userItems = await new Promise((resolve, reject) => {
//     //                             database.query(
//     //                                 `SELECT DISTINCT wi.variant_id, wi.title, wu.email , wu.shop_name as shopName ,wu.store_name as storeName,wi.price, wi.image, wi.handle, wi.variant_id, wi.product_id FROM wishlist_users as wu, wishlist as w ,wishlist_items as wi WHERE wu.shop_name = '${shopName}' AND wu.id = w.wishlist_user_id AND wi.wishlist_id= w.wishlist_id AND wu.email = '${getUsers[j].email}' AND wi.created_date > NOW() - INTERVAL 30 DAY;`,
//     //                                 (err, results) => {
//     //                                     if (err) {
//     //                                         reject(err);
//     //                                     } else {
//     //                                         resolve(results);
//     //                                     }
//     //                                 }
//     //                             );
//     //                         });

//     //                         console.log("userItems  --- ", userItems.length)

//     //                         if (userItems.length > 0) {
//     //                             let customerData = { name: "Customer", email: getUsers[j].email };
//     //                             const emailDatas = JSON.parse(emailData[0].weekly_email_temp);
//     //                             const mailHtml = await userWishlistTableEmailHTML(
//     //                                 userItems,
//     //                                 customerData,
//     //                                 JSON.parse(emailData[0].weekly_email_temp),
//     //                                 app_install_id,
//     //                                 logo,
//     //                                 shopName,
//     //                                 shopDomain,
//     //                                 databaseQuery
//     //                             );
//     //                             const emailRegEx =
//     //                                 /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
//     //                             if (emailRegEx.test(getUsers[j].email)) {

//     //                                 let emailContent = {
//     //                                     from: supportEmail,
//     //                                     to: getUsers[j].email,
//     //                                     subject: emailDatas.emailSubject,
//     //                                     html: mailHtml,
//     //                                     logoResult: logo,
//     //                                     app_install_id: app_install_id,
//     //                                     senderName: emailData[0].sender_name,
//     //                                     storeName: store_name,
//     //                                     replyTo: emailData[0]?.reply_to ? emailData[0]?.reply_to : shopEmail
//     //                                 };
//     //                                 const checkKlaviyoRecordExist = await checkKlaviyoRecord(shopName);
//     //                                 if (user.plan >= 4 && checkKlaviyoRecordExist && checkKlaviyoRecordExist.length > 0 && checkKlaviyoRecordExist[0]?.private_key !== "") {
//     //                                     const checkKlaviyoApiKeyResult = await checkKlaviyoApiKey(checkKlaviyoRecordExist[0]?.private_key);
//     //                                     if (checkKlaviyoApiKeyResult.type === "success") {
//     //                                         await KlaviyoIntegrationEmailRemainderFxn(userItems, checkKlaviyoRecordExist, getUsers[j].email, wishlistReminderKlaviyo);
//     //                                     } else {
//     //                                         await sendEmail22(emailContent, shopName, getSmtpDetail);
//     //                                     }
//     //                                 } else {
//     //                                     await sendEmail22(emailContent, shopName, getSmtpDetail);
//     //                                 }
//     //                             }
//     //                         }
//     //                     }

//     //                     // }
//     //                 }
//     //             }
//     //         }
//     //     }
//     //     res.status(200).send("Weekly wishlist email process completed.");
//     // } catch (error) {
//     //     console.error(error);
//     //     res
//     //         .status(500)
//     //         .send("An error occurred while processing the weekly wishlist.");
//     // }
// };
export const sendMonthlyWishlistToAdmin = async (req, res) => {
    try {
        const selectQuery = `
            SELECT 
                wu.shop_name, 
                er.email_option, 
                wu.email AS shop_email, 
                COUNT(DISTINCT wu.email) AS total_user, 
                COUNT(wi.title) AS total_item
            FROM app_installation AS ai
            JOIN email_reminder AS er ON ai.app_install_id = er.app_install_id
            JOIN wishlist_users AS wu ON ai.shop_name = wu.shop_name
            JOIN wishlist AS wt ON wu.id = wt.wishlist_user_id
            JOIN wishlist_items AS wi ON wt.wishlist_id = wi.wishlist_id
            WHERE er.email_option = "monthly"
            AND ai.active_plan_id > '1'
            AND wi.created_date > NOW() - INTERVAL 7 DAY
            GROUP BY wu.shop_name;
        `;

        const [result] = await database.query(selectQuery);

        if (result.length > 0) {
            for (const store of result) {
                if (store.email_option === "monthly") {
                    const mailHtml = weeklyWishlistUpdateToAdminHTML(store);

                    const emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                    if (emailRegEx.test(store.shop_email)) {
                        const emailContent = {
                            from: supportEmail,
                            to: store.shop_email,
                            subject: "Last week update",
                            html: mailHtml,
                        };
                        await sendEmail(emailContent);
                    }
                }
            }
        }

        res.json({ msg: "Monthly wishlist emails processed successfully" });
    } catch (err) {
        console.error("Error in sendMonthlyWishlistToAdmin:", err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};


// export const sendMonthlyWishlistToUser = async (req, res) => {
//     console.log("API started --------------");

//     try {
//         const getShops = await new Promise((resolve, reject) => {
//             database.query(
//                 `SELECT DISTINCT ai.shop_name, ai.shop_email, er.logo, er.email_option, ai.app_install_id, ai.store_name, ai.active_plan_id AS plan
//          FROM wishlist_users AS wu
//          JOIN app_installation AS ai ON wu.shop_name = ai.shop_name
//          JOIN email_reminder AS er ON ai.app_install_id = er.app_install_id
//          JOIN wishlist AS w ON wu.id = w.wishlist_user_id
//          LEFT JOIN email_logs AS el ON ai.app_install_id = el.app_install_id
//            AND MONTH(el.last_sent) = MONTH(CURDATE())
//            AND YEAR(el.last_sent) = YEAR(CURDATE())
//             WHERE er.email_option = 'monthly'
//            AND er.selected_date = DAY(CURDATE())
//             AND ai.status = "Active"
//            AND ai.active_plan_id > 1
//            AND el.last_sent IS NULL;`,
//                 (err, results) => (err ? reject(err) : resolve(results))
//             );
//         });

//         if (!getShops?.length) {
//             return res.status(200).send("No eligible shops found today.");
//         }

//         for (const user of getShops) {
//             const {
//                 logo,
//                 app_install_id,
//                 shop_name: shopName,
//                 shop_email: shopEmail,
//                 email_option,
//                 store_name,
//                 plan
//             } = user;

//             await queryAsync(
//                 `INSERT INTO email_logs (app_install_id, shop_name, last_sent) VALUES (?, ?, NOW())`,
//                 [app_install_id, shopName]
//             );


//             const getUsers = await new Promise((resolve, reject) => {
//                 database.query(
//                     `SELECT email, email_valid FROM wishlist_users WHERE shop_name = ? AND user_type = 'User' AND email_valid = TRUE`,
//                     [shopName],
//                     (err, results) => (err ? reject(err) : resolve(results))
//                 );
//             });

//             const emailData = await queryAsync(
//                 `SELECT se.weekly_email_temp, se.sender_name, se.reply_to FROM ${store_email_temp_table} AS se
//          JOIN ${email_reminder_table} AS er ON er.id = se.id AND er.shop_name = ?`,
//                 [shopName]
//             );

//             const getSmtpDetail = await queryAsync(`SELECT * FROM email_smtp WHERE shop_name=?`, [shopName]);



//             const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
//             const BATCH_SIZE = 50;
//             const BATCH_DELAY_MS = 1500; // 1.5 seconds

//             for (let i = 0; i < getUsers.length; i += BATCH_SIZE) {
//                 const batch = getUsers.slice(i, i + BATCH_SIZE);

//                 await Promise.all(batch.map(async ({ email }) => {
//                     if (!emailRegex.test(email)) return;

//                     const userItems = await new Promise((resolve, reject) => {
//                         database.query(
//                             `SELECT DISTINCT wi.variant_id, wi.title, wu.email, wu.shop_name as shopName, wu.store_name as storeName, wi.price, wi.image as productImage, wi.handle, wi.product_id
//             FROM wishlist_users AS wu
//             JOIN wishlist AS w ON wu.id = w.wishlist_user_id
//             JOIN wishlist_items AS wi ON wi.wishlist_id = w.wishlist_id
//             WHERE wu.shop_name = ? AND wu.email = ? AND wi.created_date > NOW() - INTERVAL 30 DAY`,
//                             [shopName, email],
//                             (err, results) => (err ? reject(err) : resolve(results))
//                         );
//                     });

//                     if (!userItems.length) return;

//                     const customerData = { name: "Customer", email };
//                     const emailDatas = JSON.parse(emailData[0].weekly_email_temp);

//                     const mailHtml = await userWishlistTableEmailHTML(
//                         userItems,
//                         customerData,
//                         emailDatas,
//                         app_install_id,
//                         logo,
//                         shopName,
//                         shopName,
//                         databaseQuery,
//                         getSmtpDetail
//                     );

//                     const emailContent = {
//                         from: supportEmail,
//                         to: email,
//                         subject: emailDatas.emailSubject,
//                         html: mailHtml,
//                         logoResult: logo,
//                         app_install_id,
//                         senderName: emailData[0].sender_name,
//                         storeName: store_name,
//                         replyTo: emailData[0]?.reply_to || shopEmail
//                     };

//                     try {
//                         const checkKlaviyoRecordExist = await checkKlaviyoRecord(shopName);
//                         const hasKlaviyo =
//                             plan >= 4 && checkKlaviyoRecordExist?.[0]?.private_key?.trim();

//                         if (hasKlaviyo) {
//                             const isValid = await checkKlaviyoApiKey(checkKlaviyoRecordExist[0].private_key);
//                             if (isValid?.type === "success") {
//                                 await KlaviyoIntegrationEmailRemainderFxn(userItems, checkKlaviyoRecordExist, email, wishlistReminderKlaviyo, shopName);
//                                 return;
//                             }
//                         }

//                         await sendEmail22(emailContent, shopName, getSmtpDetail);
//                     } catch (err) {
//                         console.error(`[Email Failed] ${email}:`, err.message);
//                     }
//                 }));

//                 console.log(` Batch ${Math.floor(i / BATCH_SIZE) + 1} sent. Waiting ${BATCH_DELAY_MS}ms...`);
//                 await sleep(BATCH_DELAY_MS);
//             }

//         }

//         res.status(200).send("Monthly wishlist email process completed.");
//     } catch (error) {
//         console.error(error);
//         res
//             .status(500)
//             .send("An error occurred while processing the monthly wishlist.");
//     }
// };
export const sendMonthlyWishlistToUser = async (req, res) => {
    console.log("API started --------------");

    try {
        // Fetch eligible shops for sending monthly emails
        const [getShops] = await database.query(`
            SELECT DISTINCT 
                ai.shop_name, 
                ai.shop_email, 
                er.logo, 
                er.email_option, 
                ai.app_install_id, 
                ai.store_name, 
                ai.active_plan_id AS plan
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
                AND el.last_sent IS NULL;
        `);

        if (!getShops.length) {
            return res.status(200).send("No eligible shops found today.");
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        const BATCH_SIZE = 50;
        const BATCH_DELAY_MS = 1500;

        for (const user of getShops) {
            const { logo, app_install_id, shop_name: shopName, shop_email: shopEmail, store_name, plan } = user;

            // Log that the email batch is being sent
            await database.query(
                `INSERT INTO email_logs (app_install_id, shop_name, last_sent) VALUES (?, ?, NOW())`,
                [app_install_id, shopName]
            );

            // Fetch all valid users for the shop
            const [getUsers] = await database.query(
                `SELECT email FROM wishlist_users WHERE shop_name = ? AND user_type = 'User' AND email_valid = TRUE`,
                [shopName]
            );

            if (!getUsers.length) continue;

            const [emailData] = await database.query(
                `SELECT se.weekly_email_temp, se.sender_name, se.reply_to 
                 FROM ${store_email_temp_table} AS se
                 JOIN ${email_reminder_table} AS er 
                 ON er.id = se.id AND er.shop_name = ?`,
                [shopName]
            );

            const [getSmtpDetail] = await database.query(
                `SELECT * FROM email_smtp WHERE shop_name = ?`,
                [shopName]
            );

            // Send emails in batches
            for (let i = 0; i < getUsers.length; i += BATCH_SIZE) {
                const batch = getUsers.slice(i, i + BATCH_SIZE);

                await Promise.all(batch.map(async ({ email }) => {
                    if (!emailRegex.test(email)) return;

                    const [userItems] = await database.query(
                        `SELECT DISTINCT wi.variant_id, wi.title, wu.email, wu.shop_name as shopName, wu.store_name as storeName, wi.price, wi.image as productImage, wi.handle, wi.product_id
                         FROM wishlist_users AS wu
                         JOIN wishlist AS w ON wu.id = w.wishlist_user_id
                         JOIN wishlist_items AS wi ON wi.wishlist_id = w.wishlist_id
                         WHERE wu.shop_name = ? AND wu.email = ? AND wi.created_date > NOW() - INTERVAL 30 DAY`,
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
                        const checkKlaviyoRecordExist = await checkKlaviyoRecord(shopName);
                        const hasKlaviyo = plan >= 4 && checkKlaviyoRecordExist?.[0]?.private_key?.trim();

                        if (hasKlaviyo) {
                            const isValid = await checkKlaviyoApiKey(checkKlaviyoRecordExist[0].private_key);
                            if (isValid?.type === "success") {
                                await KlaviyoIntegrationEmailRemainderFxn(userItems, checkKlaviyoRecordExist, email, wishlistReminderKlaviyo, shopName);
                                return;
                            }
                        }

                        await sendEmail22(emailContent, shopName, getSmtpDetail);
                    } catch (err) {
                        console.error(`[Email Failed] ${email}:`, err.message);
                    }
                }));

                console.log(` Batch ${Math.floor(i / BATCH_SIZE) + 1} sent. Waiting ${BATCH_DELAY_MS}ms...`);
                await sleep(BATCH_DELAY_MS);
            }
        }

        res.status(200).send("Monthly wishlist email process completed.");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while processing the monthly wishlist.");
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// export const postmarkWebhook = async (req, res) => {
//     const bounce = req.body;

//     if (!bounce || !bounce.Email || !bounce.Type) {
//         return res.status(400).send("Invalid bounce payload");
//     }

//     const email = bounce.Email;
//     const type = bounce.Type;

//     try {
//         if (type === "HardBounce") {
//             console.log(`[HARD BOUNCE] ${email}`);
//             await queryAsync(
//                 `UPDATE wishlist_users SET email_valid = FALSE WHERE email = ?`,
//                 [email]
//             );
//         } else if (type === "SoftBounce") {
//             console.log(`[SOFT BOUNCE] ${email}`);

//             await queryAsync(
//                 `UPDATE wishlist_users SET bounce_count = bounce_count + 1 WHERE email = ?`,
//                 [email]
//             );

//             const rows = await queryAsync(
//                 `SELECT bounce_count FROM wishlist_users WHERE email = ?`,
//                 [email]
//             );

//             const bounceCount = rows?.[0]?.bounce_count ?? 0;

//             if (bounceCount >= 2) {
//                 console.log(`[INVALIDATED] ${email} after ${bounceCount} soft bounces`);
//                 await queryAsync(
//                     `UPDATE wishlist_users SET email_valid = FALSE WHERE email = ?`,
//                     [email]
//                 );
//             }
//         } else {
//             console.log(`[BOUNCE IGNORED] ${type} for ${email}`);
//         }

//         res.sendStatus(200);
//     } catch (err) {
//         console.error("Webhook error:", err);
//         res.sendStatus(500);
//     }
// };


// export const postmarkWebhook = async (req, res) => {
//     const bounce = req.body;

//     if (!bounce || !bounce.Email || !bounce.Type) {
//         return res.status(400).send("Invalid bounce payload");
//     }

//     const email = bounce.Email;
//     const type = bounce.Type;

//     try {
//         if (type === "HardBounce" || type === "SoftBounce") {
//             console.log(`[BOUNCE - ${type}] ${email}`);

//             // Mark the email as invalid immediately, no bounce count
//             await queryAsync(
//                 `UPDATE wishlist_users SET email_valid = FALSE WHERE email = ?`,
//                 [email]
//             );
//         } else {
//             console.log(`[BOUNCE IGNORED] ${type} for ${email}`);
//         }

//         res.sendStatus(200);
//     } catch (err) {
//         console.error("Webhook error:", err);
//         res.sendStatus(500);
//     }
// };
export const postmarkWebhook = async (req, res) => {
    const { Email: email, Type: type } = req.body || {};

    if (!email || !type) {
        return res.status(400).send("Invalid bounce payload");
    }

    try {
        if (type === "HardBounce" || type === "SoftBounce") {
            console.log(`[BOUNCE - ${type}] ${email}`);

            // Mark the email as invalid
            await queryAsync(
                `UPDATE wishlist_users SET email_valid = FALSE WHERE email = ?`,
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
    if (getSmtpDetail.length !== 0 && getSmtpDetail[0].user_name !== "") {

        // console.log("by smtp ----------------")
        let checkSmtp = await sendMailBySmtp(getSmtpDetail, supportEmail, data.senderName, data.storeName, { email: data.to }, data.subject, data.replyTo, data.html, data.logoResult, serverURL, data.app_install_id, shopName);
        if (checkSmtp === false) {
            sendErrorMail = true;
            console.log("error in smtp -- sending mails through postmark ")
            await sendMailByPostMark({ email: data.to }, data.subject, data.html, data.replyTo, data.senderName, data.storeName, supportEmail)
        }

    } else {
        // console.log("by postmark ----------------")
        sendMailByPostMark({ email: data.to }, data.subject, data.html, data.replyTo, data.senderName, data.storeName, supportEmail)
    }

    // if (sendErrorMail === true) {
    //     sendSmtpErrorMail(shopName)
    // }

};


// async function sendEmail22(data, shopName, getSmtpDetail) {
//     // const getSmtpDetail = await databaseQuery(`SELECT * FROM email_smtp WHERE shop_name="${shopName}"`);
//     let transporter;
//     let supportEmail = data.from;
//     if (getSmtpDetail.length !== 0 && getSmtpDetail[0].user_name !== "") {
//         transporter = nodemailer.createTransport({
//             host: getSmtpDetail[0].smtp_server,
//             port: getSmtpDetail[0].port,
//             secure: getSmtpDetail[0].protocol === "SSL",
//             auth: {
//                 user: getSmtpDetail[0].user_name,
//                 pass: getSmtpDetail[0].password,
//             },
//         });

//         supportEmail = getSmtpDetail[0]?.sender_name && getSmtpDetail[0]?.sender_name.trim()
//             ? `"${getSmtpDetail[0]?.sender_name}" <${getSmtpDetail[0]?.from_email}>`
//             : getSmtpDetail[0]?.from_email;

//         let info = await transporter.sendMail({
//             // from: supportEmail,
//             // from: data.senderName && data.senderName.trim() ? `"${data.senderName}" <${data.from}>` : data.from,

//             from: data.senderName && data.senderName.trim() ? `"${data.senderName}" <${supportEmail}>` :
//                 data.storeName ? `"${data.storeName}" <${supportEmail}>` :
//                     `"Wishlist Guru" <${supportEmail}>`,
//             to: data.to,
//             cc: data?.cc || "",
//             subject: data.subject,
//             replyTo: data?.replyTo ? data?.replyTo : undefined,
//             html: data.html,
//             ...(data.logoResult && {
//                 attachments: [
//                     {
//                         filename: data.logoResult,
//                         path: `${serverURL}/uploads/${data.app_install_id}/${data.logoResult}`,
//                         cid: 'wf@logo'
//                     }
//                 ]
//             })
//         });


//     } else {

//         // this place is for to update the brevo code

//         // const attachments = [];
//         // if (data.logoResult) {
//         //     attachments.push({
//         //         filename: data.logoResult,
//         //         url: `${serverURL}/uploads/${data.app_install_id}/${data.logoResult}`,
//         //         cid: 'wf@logo'
//         //     });
//         // }
//         // const payload = {
//         //     sender: {
//         //         name: data.senderName && data.senderName.trim() ? `"${data.senderName}" ` :
//         //             data.storeName ? `"${data.storeName}" ` :
//         //                 `"Wishlist Guru" `,
//         //         email: supportEmail,
//         //     },
//         //     to: [{ email: data.to }],
//         //     subject: data.subject,
//         //     htmlContent: data.html,
//         //     replyTo: { email: data?.replyTo ? data?.replyTo : undefined },
//         // };

//         // if (attachments.length > 0) {
//         //     payload.attachment = attachments;
//         // }

//         // const response = await axios.post(
//         //     "https://api.brevo.com/v3/smtp/email",
//         //     payload,
//         //     {
//         //         headers: {
//         //             "api-key": brevoApiKey,
//         //             "Content-Type": "application/json",
//         //         },
//         //     }
//         // );


//         // ---------- this function will sends the email throughphp server ----------

//         const senderNameFinal =
//             data.senderName && data.senderName.trim()
//                 ? data.senderName.trim()
//                 : data.storeName
//                     ? data.storeName.trim()
//                     : "Wishlist Guru";
//         const fromAddress = `"${senderNameFinal}" <${supportEmail}>`;

//         try {
//             const payload = {
//                 From: fromAddress,
//                 To: data.to,
//                 Subject: data.subject,
//                 HtmlBody: data.html,
//                 MessageStream: "outbound",
//             };
//             if (data?.replyTo && data?.replyTo.trim()) {
//                 payload.ReplyTo = data?.replyTo.trim();
//             }
//             const response = await client.sendEmail(payload);

//             console.log("Email sent successfully:---------------- ", response);
//         } catch (error) {
//             console.error("Error sending email:-------------", error);
//         }

//     }
// };

// export const klaviyoEmailIntegration = async (req, res) => {
//     const { shopName, privateKey, publicKey } = req.body
//     database.query(`SELECT * FROM ${klaviyo_table} WHERE shop_name='${shopName}'`, (err, result) => {
//         if (err) {
//             logger.error(err);
//         }
//         else {
//             if (result.length > 0) {
//                 database.query(`UPDATE klaviyo SET shop_name='${shopName}',private_key='${privateKey}',public_key='${publicKey}' WHERE klaviyo_id=${result[0].klaviyo_id}`, (err, result) => {
//                     if (err) {
//                         logger.error(err);
//                     }
//                     else {
//                         res.send({ msg: "data_updated" })
//                     }
//                 })
//             } else {
//                 database.query(`INSERT INTO  ${klaviyo_table} (shop_name,private_key,public_key) VALUES ('${shopName}','${privateKey}','${publicKey}')`, (err, result) => {
//                     if (err) {
//                         logger.error(err);
//                     }
//                     else {
//                         res.send({ msg: "data_updated" })
//                     }
//                 })
//             }
//         }
//     })
// };
export const klaviyoEmailIntegration = async (req, res) => {
    const { shopName, privateKey, publicKey } = req.body;

    try {
        const [existing] = await queryAsync(
            `SELECT * FROM ${klaviyo_table} WHERE shop_name = ?`,
            [shopName]
        );

        if (existing?.length > 0) {
            await queryAsync(
                `UPDATE ${klaviyo_table} SET private_key = ?, public_key = ? WHERE klaviyo_id = ?`,
                [privateKey, publicKey, existing[0].klaviyo_id]
            );
        } else {
            await queryAsync(
                `INSERT INTO ${klaviyo_table} (shop_name, private_key, public_key) VALUES (?, ?, ?)`,
                [shopName, privateKey, publicKey]
            );
        }

        res.send({ msg: "data_updated" });
    } catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

// export const smtpEmailIntegration = async (req, res) => {
//     const { sender_name, from_email, shopName, smtp_server, user_name, password, port, protocol } = req.body;
//     database.query(`SELECT * FROM email_smtp WHERE shop_name='${shopName}'`, (err, result) => {
//         if (err) {
//             logger.error(err);
//         }
//         else {
//             if (result.length > 0) {
//                 database.query(`UPDATE email_smtp SET shop_name='${shopName}',smtp_server='${smtp_server}',from_email='${from_email}',user_name='${user_name}',password='${password}',port='${port}', protocol='${protocol}',sender_name='${sender_name}' WHERE email_smtp_id=${result[0].email_smtp_id}`, (err, result) => {
//                     if (err) {
//                         logger.error(err);
//                     }
//                     else {
//                         res.send({ msg: "data_updated" })
//                     }
//                 })
//             } else {
//                 database.query(`INSERT INTO email_smtp (shop_name,smtp_server, from_email, user_name, password, port, protocol, sender_name) VALUES ('${shopName}','${smtp_server}','${from_email}','${user_name}','${password}','${port}', '${protocol}', '${sender_name}' )`, (err, result) => {
//                     if (err) {
//                         logger.error(err);
//                     }
//                     else {
//                         res.send({ msg: "data_updated" })
//                     }
//                 })
//             }
//         }
//     })
// };
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
        const [existing] = await queryAsync(
            `SELECT * FROM email_smtp WHERE shop_name = ?`,
            [shopName]
        );

        if (existing?.length > 0) {
            await queryAsync(
                `UPDATE email_smtp 
                 SET smtp_server = ?, from_email = ?, user_name = ?, password = ?, port = ?, protocol = ?, sender_name = ? 
                 WHERE email_smtp_id = ?`,
                [smtp_server, from_email, user_name, password, port, protocol, sender_name, existing[0].email_smtp_id]
            );
        } else {
            await queryAsync(
                `INSERT INTO email_smtp (shop_name, smtp_server, from_email, user_name, password, port, protocol, sender_name) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [shopName, smtp_server, from_email, user_name, password, port, protocol, sender_name]
            );
        }

        res.send({ msg: "data_updated" });
    } catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};


// export const shareWishlistByMail = async (req, res) => {
//     try {
//         const emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
//         if (req.body.customerEmail === "") {
//             const getAdminEmail = await queryAsync(`SELECT shop_email FROM app_installation WHERE shop_name=?`, [req.body.shopName]);
//             req.body.customerEmail = getAdminEmail[0].shop_email;
//         }
//         const checkEmail = emailRegEx.test(req.body.customerEmail);
//         if (checkEmail) {
//             // await sendEmail(emailContent);
//             const getSmtpDetail = await queryAsync(`SELECT * FROM email_smtp WHERE shop_name=?`, [req.body.shopName]);
//             let sendErrorMail = false;

//             const emailContent = {
//                 from: supportEmail,
//                 to: req.body.customerEmail,
//                 subject: req.body.wishlistShareSubject,
//                 html: req.body.wishlistTextEditor,
//                 senderName: getSmtpDetail[0]?.sender_name || "",
//             };
//             if (getSmtpDetail.length !== 0 && getSmtpDetail[0].user_name !== "") {
//                 // console.log("FROM _______ SMTP")
//                 const checkSmtp = await sendSmtpEmail(getSmtpDetail, emailContent, "", "");
//                 if (checkSmtp === false) {
//                     sendErrorMail = true;
//                     await sendEmail(emailContent);
//                     sendSmtpErrorMail(req.body.shopName);
//                 }
//                 res.status(200).json("Email sent successfully");
//             } else {
//                 // console.log("FROM OUR SERVER")
//                 await sendEmail(emailContent);
//                 res.status(200).json("Email sent successfully");
//             }
//         }
//         // res.status(200).send("Email sent successfully");
//         // res.status(200).json("Email sent successfully");

//     } catch (error) {
//         console.error("Error sending email:", error);
//         logger.error(error);
//         res.status(500).send("Internal Server Error");
//     }
// };

// export const shareWishlistByMail = async (req, res) => {
//     try {
//         const emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

//         if (req.body.customerEmail === "") {
//             const getAdminEmail = await queryAsync(`SELECT shop_email FROM app_installation WHERE shop_name=?`, [req.body.shopName]);
//             req.body.customerEmail = getAdminEmail[0].shop_email;
//         }

//         const checkEmail = emailRegEx.test(req.body.customerEmail);
//         if (checkEmail) {
//             const emailContent = {
//                 from: supportEmail,
//                 to: req.body.customerEmail,
//                 subject: req.body.wishlistShareSubject,
//                 html: req.body.wishlistTextEditor,
//             };
//             // await sendEmail(emailContent);

//             const getSmtpDetail = await queryAsync(`SELECT * FROM email_smtp WHERE shop_name=?`, [req.body.shopName]);
//             let sendErrorMail = false;
//             if (getSmtpDetail.length !== 0 && getSmtpDetail[0].user_name !== "") {
//                 // console.log("FROM _______ SMTP")
//                 const checkSmtp = await sendSmtpEmail(getSmtpDetail, emailContent, "", "");
//                 if (checkSmtp === false) {
//                     sendErrorMail = true;
//                     await sendEmail(emailContent);
//                     sendSmtpErrorMail(req.body.shopName);
//                 }
//                 res.status(200).json("Email sent successfully");
//             } else {
//                 // console.log("FROM OUR SERVER")
//                 await sendEmail(emailContent);
//                 res.status(200).json("Email sent successfully");
//             }

//         }
//         // res.status(200).send("Email sent successfully");
//         // res.status(200).json("Email sent successfully");
//     } catch (error) {
//         console.error("Error sending email:", error);
//         logger.error(error);
//         res.status(500).send("Internal Server Error");
//     }
// };

// export const shareWishlistToAdmin = async (req, res) => {
//     database.query(`SELECT * from custom_wishlist_form WHERE shop_name="${req.body.shopName}"`, (err, result) => {
//         if (err) {
//             logger.error(err);
//             res.send({ msg: "no_data", data: [] })
//         }
//         else {
//             res.send({ msg: "get_data", data: result })
//         }
//     })
// };
export const shareWishlistByMail = async (req, res) => {
    try {
        const { shopName, customerEmail, wishlistShareSubject, wishlistTextEditor } = req.body;
        const emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

        let recipientEmail = customerEmail;

        // If customerEmail is empty, fallback to admin email
        if (!recipientEmail || recipientEmail.trim() === "") {
            const getAdminEmail = await queryAsync(
                `SELECT shop_email FROM app_installation WHERE shop_name = ?`,
                [shopName]
            );
            recipientEmail = getAdminEmail?.[0]?.shop_email || "";
        }

        // Validate email
        if (!emailRegEx.test(recipientEmail)) {
            return res.status(400).json({ msg: "Invalid email address" });
        }

        const getSmtpDetail = await queryAsync(
            `SELECT * FROM email_smtp WHERE shop_name = ?`,
            [shopName]
        );

        const emailContent = {
            from: supportEmail,
            to: recipientEmail,
            subject: wishlistShareSubject,
            html: wishlistTextEditor,
            senderName: getSmtpDetail?.[0]?.sender_name || "",
        };

        // Send via SMTP if configured
        if (getSmtpDetail?.length && getSmtpDetail[0].user_name) {
            const smtpSuccess = await sendSmtpEmail(getSmtpDetail, emailContent, "", "");
            if (!smtpSuccess) {
                await sendEmail(emailContent);
                await sendSmtpErrorMail(shopName);
            }
        } else {
            // Fallback to default email
            await sendEmail(emailContent);
        }

        res.status(200).json({ msg: "Email sent successfully" });

    } catch (error) {
        console.error("Error sending email:", error);
        logger.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

// export const shareWishlistToAdmin = async (req, res) => {
//     // ⚠️ Create index (only for development/testing — remove in production)
//     // database.query(`CREATE INDEX IF NOT EXISTS idx_custom_wishlist_shop_name ON custom_wishlist_form(shop_name);`);

//     // Now run the actual query
//     const query = `SELECT * FROM custom_wishlist_form WHERE shop_name = ?`;
//     database.query(query, [req.body.shopName], (err, result) => {
//         if (err) {
//             logger.error(err);
//             res.send({ msg: "no_data", data: [] });
//         } else {
//             res.send({ msg: "get_data", data: result });
//         }
//     });
// };

// export const shareWishlistStats = async (req, res) => {
//     const { shopName, user_id, type, count, fromWhere } = req.body;

//     console.log("ALL --- ", shopName, user_id, type, count, fromWhere);

//     try {
//         const userId = user_id
//         const statesSelectQuery = `SELECT * FROM ${wishlist_shared_stats} WHERE shop_name = ? AND user_id = ?`
//         const statsResult = await queryAsync(statesSelectQuery, [shopName, userId]);

//         // console.log("statsResult -- ", statsResult);

//         if (statsResult.length > 0) {

//             // console.log("Inside if ---- ");

//             let counter = statsResult[0][type] + count;
//             const clicks = statsResult[0]["clicks"] + 1;
//             const whereClause = `${fromWhere === "reload" ? `clicks = ?` : `${type} = ?`}`;
//             // const whereClause1 = `${type} = ?, clicks = ?`;


//             console.log("userId ---- ", userId)

//             const statesUpdatQuery = `UPDATE ${wishlist_shared_stats} SET ${whereClause} WHERE shop_name = ? AND user_id = ?`
//             const statsUpdateResult = await queryAsync(statesUpdatQuery, [fromWhere === "reload" ? clicks : counter, shopName, userId]);

//         } else {

//             // console.log("Inside else ---- ")

//             const statesInsertQuery = `INSERT INTO ${wishlist_shared_stats} (${type}, shop_name, user_id) VALUES (?, ?, ?)`
//             const statsinsertResult = await queryAsync(statesInsertQuery, [count, shopName, userId]);
//         }

//         res.json("success");
//     } catch (err) {
//         console.error(err);
//         logger.error(err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };
export const shareWishlistToAdmin = async (req, res) => {
    try {
        const { shopName } = req.body;

        if (!shopName) {
            return res.status(400).json({ msg: "shopName is required", data: [] });
        }

        const query = `SELECT * FROM custom_wishlist_form WHERE shop_name = ?`;
        const result = await queryAsync(query, [shopName]);

        if (!result.length) {
            return res.status(200).json({ msg: "no_data", data: [] });
        }

        res.status(200).json({ msg: "get_data", data: result });
    } catch (err) {
        console.error("Error fetching custom wishlist:", err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error", data: [] });
    }
};

// export const shareWishlistStats = async (req, res) => {
//     const { shopName, user_id, type, count, fromWhere } = req.body;
//     // console.log("ALL --- ", shopName, user_id, type, count, fromWhere);
//     try {
//         const userId = user_id;

//         if (isNaN(userId) || userId <= 0) {
//             console.warn("⚠️ Invalid user_id received:", user_id);
//             return res.status(400).json({ error: "Invalid user_id received" });
//         }

//         // ✅ Index needed: CREATE INDEX idx_wishlist_stats_shop_user ON wishlist_shared_stats (shop_name, user_id)
//         const selectQuery = `SELECT * FROM ${wishlist_shared_stats} WHERE shop_name = ? AND user_id = ?`;
//         const statsResult = await queryAsync(selectQuery, [shopName, userId]);

//         if (statsResult.length > 0) {
//             let updatedValue = fromWhere === "reload"
//                 ? statsResult[0]["clicks"] + 1
//                 : statsResult[0][type] + count;

//             const updateColumn = fromWhere === "reload" ? "clicks" : type;
//             // 🚀 Dynamically update either `clicks` or the value from `type`
//             const updateQuery = `UPDATE ${wishlist_shared_stats} SET ${updateColumn} = ? WHERE shop_name = ? AND user_id = ?`;
//             await queryAsync(updateQuery, [updatedValue, shopName, userId]);

//         } else {
//             // Insert new row if not exists
//             const insertQuery = `INSERT INTO ${wishlist_shared_stats} (${type}, shop_name, user_id) VALUES (?, ?, ?)`;
//             await queryAsync(insertQuery, [count, shopName, userId]);
//         }

//         res.json("success");

//     } catch (err) {
//         console.error(err);
//         logger.error(err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };


// export const storeLanguagesData = async (req, res) => {
//     const selectQuery = `SELECT s.lang_id FROM ${store_languages_table} AS s INNER JOIN ${store_languages_url_table} AS su WHERE s.lang_id = su.lang_id AND s.shop_name = '${req.body.shopName}' AND su.type = 'default'`;

//     database.query(selectQuery, (err, selectResult) => {
//         if (err) {
//             console.log(err);
//             logger.error(err);
//         } else {
//             if (selectResult.length > 0) {
//                 updateStoreLanguage(req, res, selectResult[0].lang_id);
//             } else {
//                 insertIntoStoreTable(req, res);
//             }
//         }
//     });
// };
export const shareWishlistStats = async (req, res) => {
    const { shopName, user_id, type, count = 1, fromWhere } = req.body;

    try {
        const userId = Number(user_id);
        if (!shopName || isNaN(userId) || userId <= 0) {
            console.warn("⚠️ Invalid input:", req.body);
            return res.status(400).json({ error: "Invalid input data" });
        }

        // ✅ Validate dynamic column name to prevent SQL injection
        const validColumns = ["clicks", "shares", "views"]; // Add all allowed columns here
        const updateColumn = fromWhere === "reload" ? "clicks" : type;
        if (!validColumns.includes(updateColumn)) {
            return res.status(400).json({ error: "Invalid type column" });
        }

        // Use mysql2/promise connection
        const [statsResult] = await database.query(
            `SELECT * FROM ${wishlist_shared_stats} WHERE shop_name = ? AND user_id = ?`,
            [shopName, userId]
        );

        if (statsResult.length > 0) {
            const currentValue = statsResult[0][updateColumn] || 0;
            const updatedValue = fromWhere === "reload" ? currentValue + 1 : currentValue + count;

            await database.query(
                `UPDATE ${wishlist_shared_stats} SET ${updateColumn} = ? WHERE shop_name = ? AND user_id = ?`,
                [updatedValue, shopName, userId]
            );
        } else {
            await database.query(
                `INSERT INTO ${wishlist_shared_stats} (${updateColumn}, shop_name, user_id) VALUES (?, ?, ?)`,
                [fromWhere === "reload" ? 1 : count, shopName, userId]
            );
        }

        res.json({ msg: "success" });

    } catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// export const storeLanguagesData = async (req, res) => {
//   try {
//     const selectQuery = `
//       SELECT s.lang_id 
//       FROM ${store_languages_table} AS s
//       INNER JOIN ${store_languages_url_table} AS su
//       ON s.lang_id = su.lang_id
//       WHERE s.shop_name = ? AND su.type = 'default'
//     `;

//     const [selectResult] = await database.query(selectQuery, [req.body.shopName]);

//     if (selectResult.length > 0) {
//       // If language already exists, update it
//       await updateStoreLanguage(req, res, selectResult[0].lang_id);
//     } else {
//       // If not found, insert a new one
//       await insertIntoStoreTable(req, res);
//     }

//   } catch (err) {
//     console.error("❌ Error in storeLanguagesData:", err);
//     logger.error(err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


// export const premiumStoreLanguagesData = async (req, res) => {
//     const selectQuery = `SELECT lang_id FROM ${store_languages_table} WHERE shop_name = '${req.body.shopName}' AND lang_name = '${req.body.languageName}'`;

//     const insertQueryInTable1 = `INSERT INTO ${store_languages_table} (shop_name, lang_name, translations) VALUES (?, ?, ?)`;

//     const insertQueryInTable2 = `INSERT INTO ${store_languages_url_table} (lang_id, type, url) VALUES (?, ?, ?)`;

//     if (req.body.id === null) {
//         database.query(selectQuery, (err, selectResult) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 if (selectResult.length > 0) {
//                     database.query(
//                         insertQueryInTable2,
//                         [selectResult[0].lang_id, req.body.type, req.body.url],
//                         (err, insertResult2) => {
//                             if (err) {
//                                 console.log(err);
//                                 logger.error(err);
//                             } else {
//                                 res.json({ msg: "data inserted in language table" });
//                             }
//                         }
//                     );
//                 } else {
//                     database.query(
//                         insertQueryInTable1,
//                         [req.body.shopName, req.body.languageName, req.body.translations],
//                         (err, insertResult2) => {
//                             if (err) {
//                                 console.log(err);
//                                 logger.error(err);
//                             } else {
//                                 database.query(
//                                     insertQueryInTable2,
//                                     [insertResult2.insertId, req.body.type, req.body.url],
//                                     (err, insertResult3) => {
//                                         if (err) {
//                                             console.log(err);
//                                             logger.error(err);
//                                         } else {
//                                             res.json({ msg: "data inserted in language table" });
//                                         }
//                                     }
//                                 );
//                             }
//                         }
//                     );
//                 }
//             }
//         });
//     } else {
//         updateStoreLanguage2(req, res, req.body.id);
//     }
// };
export const storeLanguagesData = async (req, res) => {
    const { shopName } = req.body;

    if (!shopName) {
        return res.status(400).json({ error: "shopName is required" });
    }

    try {
        const selectQuery = `
            SELECT s.lang_id
            FROM ${store_languages_table} AS s
            INNER JOIN ${store_languages_url_table} AS su
            ON s.lang_id = su.lang_id
            WHERE s.shop_name = ? AND su.type = 'default'
        `;

        const [selectResult] = await database.query(selectQuery, [shopName]);

        if (selectResult.length > 0) {
            // Language exists, update it
            await updateStoreLanguage(req, res, selectResult[0].lang_id);
        } else {
            // Language not found, insert a new record
            await insertIntoStoreTable(req, res);
        }
    } catch (err) {
        console.error("❌ Error in storeLanguagesData:", err);
        logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// export const premiumStoreLanguagesData = async (req, res) => {
//   try {
//     const { shopName, languageName, translations, type, url, id } = req.body;

//     const selectQuery = `
//       SELECT lang_id 
//       FROM ${store_languages_table} 
//       WHERE shop_name = ? AND lang_name = ?
//     `;

//     const insertQueryInTable1 = `
//       INSERT INTO ${store_languages_table} (shop_name, lang_name, translations) 
//       VALUES (?, ?, ?)
//     `;

//     const insertQueryInTable2 = `
//       INSERT INTO ${store_languages_url_table} (lang_id, type, url) 
//       VALUES (?, ?, ?)
//     `;

//     // ✅ If id is null → handle insert logic
//     if (id === null) {
//       const [selectResult] = await database.query(selectQuery, [shopName, languageName]);

//       if (selectResult.length > 0) {
//         // Language already exists → only insert URL info
//         await database.query(insertQueryInTable2, [selectResult[0].lang_id, type, url]);
//       } else {
//         // Insert new language first, then insert URL info
//         const [insertResult1] = await database.query(insertQueryInTable1, [
//           shopName,
//           languageName,
//           translations,
//         ]);

//         await database.query(insertQueryInTable2, [insertResult1.insertId, type, url]);
//       }

//       res.json({ msg: "Data inserted in language tables successfully" });
//     } else {
//       // ✅ If id exists → update existing language record
//       await updateStoreLanguage2(req, res, id);
//     }

//   } catch (err) {
//     console.error("❌ Error in premiumStoreLanguagesData:", err);
//     logger.error(err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
export const premiumStoreLanguagesData = async (req, res) => {
  try {
    const { shopName, languageName, translations, type, url, id } = req.body;

    if (!shopName || !languageName || !type || !url) {
      return res.status(400).json({ error: "Missing required fields" });
    }

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

    if (id === null) {
      // Check if language already exists
      const [selectResult] = await database.query(selectQuery, [shopName, languageName]);

      if (selectResult.length > 0) {
        // Language exists → insert URL info only
        await database.query(insertQueryInTable2, [selectResult[0].lang_id, type, url]);
      } else {
        // Insert new language first
        const [insertResult1] = await database.query(insertQueryInTable1, [
          shopName,
          languageName,
          translations,
        ]);

        // Insert URL info linked to new language
        await database.query(insertQueryInTable2, [insertResult1.insertId, type, url]);
      }

      res.json({ msg: "Data inserted in language tables successfully" });
    } else {
      // Update existing language record if id exists
      await updateStoreLanguage2(req, res, id);
    }

  } catch (err) {
    console.error("❌ Error in premiumStoreLanguagesData:", err);
    logger.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// async function insertIntoStoreTable(req, res) {
//     try {
//         const escapedTranslations = database.escape(req.body.translations);

//         const insertQuery = `INSERT INTO ${store_languages_table} (shop_name, lang_name, translations) VALUES ('${req.body.shopName}', '${req.body.languageName}', ${escapedTranslations})`;

//         const insertQueryInTable2 = `INSERT INTO ${store_languages_url_table} (lang_id, type, url) VALUES (?, ?, ?)`;

//         database.query(insertQuery, (err, insertResult) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 database.query(
//                     insertQueryInTable2,
//                     [insertResult.insertId, req.body.type, req.body.url],
//                     (err, insertResult2) => {
//                         if (err) {
//                             console.log(err);
//                             logger.error(err);
//                         } else {
//                             res.json({ msg: "data inserted in language table" });
//                         }
//                     }
//                 );
//             }
//         });
//     } catch (error) {
//         console.log(error);
//     }
// }
async function insertIntoStoreTable(req, res) {
  try {
    const { shopName, languageName, translations, type, url } = req.body;

    if (!shopName || !languageName || !type || !url) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert into store_languages table
    const insertQuery = `
      INSERT INTO ${store_languages_table} (shop_name, lang_name, translations) 
      VALUES (?, ?, ?)
    `;
    const [insertResult] = await database.query(insertQuery, [
      shopName,
      languageName,
      translations,
    ]);

    // Insert into store_languages_url table
    const insertQueryInTable2 = `
      INSERT INTO ${store_languages_url_table} (lang_id, type, url) 
      VALUES (?, ?, ?)
    `;
    await database.query(insertQueryInTable2, [
      insertResult.insertId,
      type,
      url,
    ]);

    res.json({ msg: "Data inserted in language tables successfully" });
  } catch (error) {
    console.error("❌ Error in insertIntoStoreTable:", error);
    logger.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


// function updateStoreLanguage(req, res, id) {
//     const escapedTranslations = database.escape(req.body.translations);
//     const updateId = id !== null ? id : req.body.id;
//     let dbQuery;

//     if (req.body.languageName) {
//         dbQuery = `UPDATE ${store_languages_table} SET lang_name = '${req.body.languageName}', translations = ${escapedTranslations} WHERE shop_name = '${req.body.shopName}' AND lang_id = ${updateId}`;
//     } else {
//         dbQuery = `UPDATE ${store_languages_table} SET translations = ${escapedTranslations} WHERE shop_name = '${req.body.shopName}' AND lang_id = ${updateId}`;
//     }

//     database.query(dbQuery, (err, result) => {
//         if (err) {
//             console.log(err);
//             logger.error(err);
//         } else {
//             res.json({ msg: "Data Updated successfully" });
//         }
//     });
// }
async function updateStoreLanguage(req, res, id) {
  try {
    const { shopName, languageName, translations } = req.body;
    const updateId = id !== null ? id : req.body.id;

    if (!shopName || !updateId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let updateQuery;
    let params;

    if (languageName) {
      updateQuery = `
        UPDATE ${store_languages_table} 
        SET lang_name = ?, translations = ? 
        WHERE shop_name = ? AND lang_id = ?
      `;
      params = [languageName, translations, shopName, updateId];
    } else {
      updateQuery = `
        UPDATE ${store_languages_table} 
        SET translations = ? 
        WHERE shop_name = ? AND lang_id = ?
      `;
      params = [translations, shopName, updateId];
    }

    const [result] = await database.query(updateQuery, params);

    res.json({ msg: "Data updated successfully", affectedRows: result.affectedRows });
  } catch (error) {
    console.error("❌ Error in updateStoreLanguage:", error);
    logger.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


// const queryAsync = (query, params) => {
//     return new Promise((resolve, reject) => {
//         database.query(query, params, (err, result) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(result);
//             }
//         });
//     });
// };
const queryAsync = async (query, params = []) => {
  try {
    const [rows] = await database.query(query, params);
    return rows;
  } catch (err) {
    console.error("❌ Database query error:", err.message);
    throw err; // rethrow so caller can handle it
  }
};


// const updateStoreLanguage2 = async (req, res) => {
//     const updateId = req.body.id;
//     const { shopName, languageName, url, type, urlId, translations } = req.body;

//     try {
//         const escapedTranslations = database.escape(translations);

//         const mainSelectQuery = `SELECT s.lang_id FROM ${store_languages_table} AS s INNER JOIN ${store_languages_url_table} AS su ON s.lang_id = su.lang_id WHERE shop_name = ? AND s.lang_id = ?`;
//         const mainResult = await queryAsync(mainSelectQuery, [shopName, updateId]);

//         if (mainResult.length > 1) {
//             const selectQuery = `SELECT s.lang_id FROM ${store_languages_table} AS s INNER JOIN ${store_languages_url_table} AS su ON s.lang_id = su.lang_id WHERE shop_name = ? AND s.lang_name = ? AND su.url_id = ?`;

//             const selectQuery2 = `SELECT s.lang_id FROM ${store_languages_table} AS s INNER JOIN ${store_languages_url_table} AS su ON s.lang_id = su.lang_id WHERE shop_name = ? AND s.lang_name = ?`;

//             const selectResult = await queryAsync(selectQuery, [
//                 shopName,
//                 languageName,
//                 urlId,
//             ]);
//             const selectResult2 = await queryAsync(selectQuery2, [
//                 shopName,
//                 languageName,
//             ]);

//             if (selectResult.length > 0) {
//                 await queryAsync(
//                     `UPDATE ${store_languages_url_table} SET url = ?, type = ?, lang_id = ? WHERE url_id = ?`,
//                     [url, type, updateId, urlId]
//                 );
//                 res.json({ msg: "Data Updated successfully" });
//             } else if (selectResult2.length > 0) {
//                 await queryAsync(
//                     `UPDATE ${store_languages_url_table} SET url = ?, type = ?, lang_id = ? WHERE url_id = ?`,
//                     [url, type, selectResult2[0].lang_id, urlId]
//                 );
//                 res.json({ msg: "Data Updated successfully" });
//             } else {
//                 const insertQuery = `INSERT INTO ${store_languages_table} (lang_name, shop_name, translations) VALUES (?, ?, ${escapedTranslations})`;
//                 const insertResult = await queryAsync(insertQuery, [
//                     languageName,
//                     shopName,
//                 ]);

//                 await queryAsync(
//                     `UPDATE ${store_languages_url_table} SET url = ?, type = ?, lang_id = ? WHERE url_id = ?`,
//                     [url, type, insertResult.insertId, urlId]
//                 );
//                 res.json({ msg: "Data Updated successfully" });
//             }
//         } else {
//             const updateTable1 = `UPDATE ${store_languages_table} SET lang_name = ?, translations = ${escapedTranslations} WHERE shop_name = ? AND lang_id = ?`;
//             await queryAsync(updateTable1, [languageName, shopName, updateId]);

//             await queryAsync(
//                 `UPDATE ${store_languages_url_table} SET url = ?, type = ?, lang_id = ? WHERE url_id = ?`,
//                 [url, type, updateId, urlId]
//             );
//             res.json({ msg: "Data Updated successfully" });
//         }
//     } catch (err) {
//         console.error(err);
//         logger.error(err);
//         res.status(500).json({ msg: "Internal Server Error" });
//     }
// };

// export const getStoreLanguageData = async (req, res) => {
//     const dbQuery = `SELECT * FROM ${store_languages_table} WHERE shop_name = '${req.body.shopName}' AND lang_id = ${req.body.id}`;

//     database.query(dbQuery, (err, result) => {
//         if (err) {
//             console.log(err);
//             logger.error(err);
//         } else {
//             res.json({ data: result });
//         }
//     });
// };
export const updateStoreLanguage2 = async (req, res) => {
    const updateId = req.body.id;
    const { shopName, languageName, url, type, urlId, translations } = req.body;

    try {
        const escapedTranslations = database.escape(translations);

        // Check if language exists for this shop
        const mainSelectQuery = `
            SELECT s.lang_id
            FROM ${store_languages_table} AS s
            INNER JOIN ${store_languages_url_table} AS su ON s.lang_id = su.lang_id
            WHERE s.shop_name = ? AND s.lang_id = ?
        `;
        const mainResult = await queryAsync(mainSelectQuery, [shopName, updateId]);

        if (mainResult.length > 1) {
            // Multiple records → check exact URL match
            const selectQuery = `
                SELECT s.lang_id
                FROM ${store_languages_table} AS s
                INNER JOIN ${store_languages_url_table} AS su ON s.lang_id = su.lang_id
                WHERE s.shop_name = ? AND s.lang_name = ? AND su.url_id = ?
            `;
            const selectQuery2 = `
                SELECT s.lang_id
                FROM ${store_languages_table} AS s
                INNER JOIN ${store_languages_url_table} AS su ON s.lang_id = su.lang_id
                WHERE s.shop_name = ? AND s.lang_name = ?
            `;
            const selectResult = await queryAsync(selectQuery, [shopName, languageName, urlId]);
            const selectResult2 = await queryAsync(selectQuery2, [shopName, languageName]);

            if (selectResult.length > 0) {
                await queryAsync(
                    `UPDATE ${store_languages_url_table} SET url = ?, type = ?, lang_id = ? WHERE url_id = ?`,
                    [url, type, updateId, urlId]
                );
            } else if (selectResult2.length > 0) {
                await queryAsync(
                    `UPDATE ${store_languages_url_table} SET url = ?, type = ?, lang_id = ? WHERE url_id = ?`,
                    [url, type, selectResult2[0].lang_id, urlId]
                );
            } else {
                const insertLangQuery = `
                    INSERT INTO ${store_languages_table} (lang_name, shop_name, translations)
                    VALUES (?, ?, ${escapedTranslations})
                `;
                const insertResult = await queryAsync(insertLangQuery, [languageName, shopName]);

                await queryAsync(
                    `UPDATE ${store_languages_url_table} SET url = ?, type = ?, lang_id = ? WHERE url_id = ?`,
                    [url, type, insertResult.insertId, urlId]
                );
            }
        } else {
            // Single record → update language and URL
            const updateTable1 = `
                UPDATE ${store_languages_table} 
                SET lang_name = ?, translations = ${escapedTranslations}
                WHERE shop_name = ? AND lang_id = ?
            `;
            await queryAsync(updateTable1, [languageName, shopName, updateId]);

            await queryAsync(
                `UPDATE ${store_languages_url_table} SET url = ?, type = ?, lang_id = ? WHERE url_id = ?`,
                [url, type, updateId, urlId]
            );
        }

        res.json({ msg: "Data Updated successfully" });

    } catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};


// export const getStoreLanguageData = async (req, res) => {
//   try {
//     const { shopName, id } = req.body;

//     const dbQuery = `
//       SELECT * 
//       FROM ${store_languages_table} 
//       WHERE shop_name = ? AND lang_id = ?
//     `;

//     const [result] = await database.query(dbQuery, [shopName, id]);

//     res.json({ data: result });
//   } catch (err) {
//     console.error("❌ Error in getStoreLanguageData:", err);
//     logger.error(err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


// export const getStoreLanguageDataUseeff = async (req, res) => {
//     try {
//         let selectQuery;
//         if (req.body.currentPlan < 3) {
//             selectQuery = `SELECT * FROM ${store_languages_table} AS s INNER JOIN ${store_languages_url_table} AS su WHERE s.lang_id = su.lang_id AND s.shop_name = '${req.body.shopName}' AND su.type = "default"`;
//         } else {
//             selectQuery = `SELECT * FROM ${store_languages_table} AS s INNER JOIN ${store_languages_url_table} AS su WHERE s.lang_id = su.lang_id AND s.shop_name = '${req.body.shopName}'`;
//         }

//         database.query(selectQuery, async (err, result) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//                 res.status(500).send("Internal Server Error");
//             } else {
//                 if (result.length !== 0) {
//                     res.json({ data: result });
//                 } else {
//                     const escapedTranslations = database.escape(req.body.translations);

//                     const insertQuery = `INSERT INTO ${store_languages_table} (shop_name, lang_name, translations) VALUES ('${req.body.shopName}', '${req.body.languageName}', ${escapedTranslations})`;

//                     const insertQueryInTable2 = `INSERT INTO ${store_languages_url_table} (lang_id, type, url) VALUES (?, ?, ?)`;

//                     database.query(insertQuery, (err, insertResult) => {
//                         if (err) {
//                             console.log(err);
//                             logger.error(err);
//                         } else {
//                             database.query(
//                                 insertQueryInTable2,
//                                 [insertResult.insertId, req.body.type, req.body.url],
//                                 (err, insertResult2) => {
//                                     if (err) {
//                                         console.log(err);
//                                         logger.error(err);
//                                     } else {
//                                         database.query(selectQuery, (err, insertResult3) => {
//                                             if (err) {
//                                                 console.log(err);
//                                                 logger.error(err);
//                                             } else {
//                                                 res.json({ data: insertResult3 });
//                                             }
//                                         });
//                                     }
//                                 }
//                             );
//                         }
//                     });
//                 }
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         logger.error(error);
//         res.status(500).send("Internal Server Error");
//     }
// };

// export const getStoreLanguage = async (req, res) => {
//     const dbQuery = `SELECT s.translations FROM ${store_languages_table} AS s INNER JOIN ${store_languages_url_table} AS su WHERE s.shop_name = '${req.body.shopName}' AND s.lang_id = su.lang_id AND su.url = '${req.body.url}'`;
//     database.query(dbQuery, (err, result) => {
//         if (err) {
//             console.log(err);
//             logger.error(err);
//         } else {
//             res.json({ data: result });
//         }
//     });
// };
export const getStoreLanguageData = async (req, res) => {
  try {
    const { shopName, id } = req.body;

    if (!shopName || !id) {
      return res.status(400).json({ error: "shopName and id are required" });
    }

    const dbQuery = `
      SELECT * 
      FROM ${store_languages_table} 
      WHERE shop_name = ? AND lang_id = ?
    `;

    const [result] = await database.query(dbQuery, [shopName, id]);

    res.json({ data: result });
  } catch (err) {
    console.error("❌ Error in getStoreLanguageData:", err);
    logger.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// export const getStoreLanguageDataUseeff = async (req, res) => {
//   try {
//     const { currentPlan, shopName, translations, languageName, type, url } = req.body;

//     // Step 1: Choose query based on plan
//     const selectQuery =
//       currentPlan < 3
//         ? `
//           SELECT * 
//           FROM ${store_languages_table} AS s 
//           INNER JOIN ${store_languages_url_table} AS su 
//           ON s.lang_id = su.lang_id 
//           WHERE s.shop_name = ? AND su.type = "default"
//         `
//         : `
//           SELECT * 
//           FROM ${store_languages_table} AS s 
//           INNER JOIN ${store_languages_url_table} AS su 
//           ON s.lang_id = su.lang_id 
//           WHERE s.shop_name = ?
//         `;

//     // Step 2: Run SELECT query
//     const [result] = await database.query(selectQuery, [shopName]);

//     if (result.length !== 0) {
//       // ✅ If data exists, return it
//       return res.json({ data: result });
//     }

//     // Step 3: If no data, insert into store_languages_table
//     const insertLangQuery = `
//       INSERT INTO ${store_languages_table} (shop_name, lang_name, translations)
//       VALUES (?, ?, ?)
//     `;
//     const [insertResult] = await database.query(insertLangQuery, [
//       shopName,
//       languageName,
//       JSON.stringify(translations),
//     ]);

//     // Step 4: Insert corresponding entry into store_languages_url_table
//     const insertUrlQuery = `
//       INSERT INTO ${store_languages_url_table} (lang_id, type, url)
//       VALUES (?, ?, ?)
//     `;
//     await database.query(insertUrlQuery, [insertResult.insertId, type, url]);

//     // Step 5: Fetch and return the newly inserted data
//     const [finalResult] = await database.query(selectQuery, [shopName]);
//     res.json({ data: finalResult });
//   } catch (error) {
//     console.error("❌ Error in getStoreLanguageDataUseeff:", error);
//     logger.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// };


// export const getStoreLanguage = async (req, res) => {
//     // Run index creation (DEV ONLY)
//     // database.query(`CREATE INDEX IF NOT EXISTS idx_store_languages_shop_name ON ${store_languages_table}(shop_name);`);
//     // database.query(`CREATE INDEX IF NOT EXISTS idx_store_languages_lang_id ON ${store_languages_table}(lang_id);`);
//     // database.query(`CREATE INDEX IF NOT EXISTS idx_store_languages_url_lang_id ON ${store_languages_url_table}(lang_id);`);
//     // database.query(`CREATE INDEX IF NOT EXISTS idx_store_languages_url_url ON ${store_languages_url_table}(url);`);

//     if (req.body.shopName === "wishlist-guru.myshopify.com") {
//         console.log("Modal open ----  start")
//     }



//     // Actual query
//     const dbQuery = `
//         SELECT s.translations
//         FROM ${store_languages_table} AS s
//         INNER JOIN ${store_languages_url_table} AS su
//         ON s.lang_id = su.lang_id
//         WHERE s.shop_name = ? AND su.url = ?
//     `;

//     database.query(dbQuery, [req.body.shopName, req.body.url], (err, result) => {
//         if (err) {
//             console.log(err);
//             logger.error(err);
//             res.status(500).json({ error: "Failed to fetch language data" });
//         } else {

//             if (req.body.shopName === "wishlist-guru.myshopify.com") {
//                 console.log("Modal open ----  before sending response")
//             }

//             res.json({ data: result });
//         }
//     });
// };
export const getStoreLanguageDataUseeff = async (req, res) => {
  try {
    const { currentPlan, shopName, translations, languageName, type, url } = req.body;

    if (!shopName) {
      return res.status(400).json({ error: "shopName is required" });
    }

    // Step 1: Choose query based on plan
    const selectQuery =
      currentPlan < 3
        ? `
          SELECT * 
          FROM ${store_languages_table} AS s 
          INNER JOIN ${store_languages_url_table} AS su 
          ON s.lang_id = su.lang_id 
          WHERE s.shop_name = ? AND su.type = "default"
        `
        : `
          SELECT * 
          FROM ${store_languages_table} AS s 
          INNER JOIN ${store_languages_url_table} AS su 
          ON s.lang_id = su.lang_id 
          WHERE s.shop_name = ?
        `;

    // Step 2: Run SELECT query
    const [result] = await database.query(selectQuery, [shopName]);

    if (result.length > 0) {
      return res.json({ data: result });
    }

    // Step 3: If no data, insert into store_languages_table
    const insertLangQuery = `
      INSERT INTO ${store_languages_table} (shop_name, lang_name, translations)
      VALUES (?, ?, ?)
    `;
    const [insertResult] = await database.query(insertLangQuery, [
      shopName,
      languageName || "default",
      JSON.stringify(translations || {}),
    ]);

    // Step 4: Insert corresponding entry into store_languages_url_table
    const insertUrlQuery = `
      INSERT INTO ${store_languages_url_table} (lang_id, type, url)
      VALUES (?, ?, ?)
    `;
    await database.query(insertUrlQuery, [insertResult.insertId, type || "default", url || ""]);

    // Step 5: Fetch and return the newly inserted data
    const [finalResult] = await database.query(selectQuery, [shopName]);
    res.json({ data: finalResult });
  } catch (error) {
    console.error("❌ Error in getStoreLanguageDataUseeff:", error);
    logger.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// export const getStoreLanguage = async (req, res) => {
//   try {
//     const { shopName, url } = req.body;

//     if (shopName === "wishlist-guru.myshopify.com") {
//       console.log("Modal open ---- start");
//     }

//     const dbQuery = `
//       SELECT s.translations
//       FROM ${store_languages_table} AS s
//       INNER JOIN ${store_languages_url_table} AS su
//       ON s.lang_id = su.lang_id
//       WHERE s.shop_name = ? AND su.url = ?
//     `;

//     const [result] = await database.query(dbQuery, [shopName, url]);

//     if (shopName === "wishlist-guru.myshopify.com") {
//       console.log("Modal open ---- before sending response");
//     }

//     res.json({ data: result });
//   } catch (err) {
//     console.error("❌ Error in getStoreLanguage:", err);
//     logger.error(err);
//     res.status(500).json({ error: "Failed to fetch language data" });
//   }
// };
export const getStoreLanguage = async (req, res) => {
  try {
    const { shopName, url } = req.body;

    if (!shopName || !url) {
      return res.status(400).json({ error: "shopName and url are required" });
    }

    // Optional debug for a specific store
    const isDebugStore = shopName === "wishlist-guru.myshopify.com";
    if (isDebugStore) console.log("Modal open ---- start");

    const dbQuery = `
      SELECT s.translations
      FROM ${store_languages_table} AS s
      INNER JOIN ${store_languages_url_table} AS su
      ON s.lang_id = su.lang_id
      WHERE s.shop_name = ? AND su.url = ?
    `;

    const [result] = await database.query(dbQuery, [shopName, url]);

    if (isDebugStore) console.log("Modal open ---- before sending response");

    res.json({ data: result });
  } catch (err) {
    console.error("❌ Error in getStoreLanguage:", err);
    logger.error(err);
    res.status(500).json({ error: "Failed to fetch language data" });
  }
};


// export const deleteStoreLanguageData = async (req, res) => {
//     const selectQuery = `SELECT su.lang_id FROM ${store_languages_url_table} AS su INNER JOIN ${store_languages_table} AS s WHERE shop_name = '${req.body.shopName}' AND s.lang_id = su.lang_id AND s.lang_id = ${req.body.id}`;

//     const deleteFromTable1 = `DELETE FROM ${store_languages_table} WHERE shop_name = ? AND lang_id = ?`;

//     const deleteFromTable2 = `DELETE FROM ${store_languages_url_table} WHERE url_id = ? AND lang_id = ?`;

//     database.query(selectQuery, (err, result) => {
//         if (err) {
//             console.log(err);
//             logger.error(err);
//         } else {
//             if (result.length > 1) {
//                 database.query(
//                     deleteFromTable2,
//                     [req.body.urlId, result[0].lang_id],
//                     (err, result1) => {
//                         if (err) {
//                             console.log(err);
//                             logger.error(err);
//                         } else {
//                             res.json({ msg: "Data deleted successfully" });
//                         }
//                     }
//                 );
//             } else {
//                 database.query(
//                     deleteFromTable2,
//                     [req.body.urlId, result[0].lang_id],
//                     (err, result2) => {
//                         if (err) {
//                             console.log(err);
//                             logger.error(err);
//                         } else {
//                             database.query(
//                                 deleteFromTable1,
//                                 [req.body.shopName, req.body.id],
//                                 (err, result3) => {
//                                     if (err) {
//                                         console.log(err);
//                                         logger.error(err);
//                                     } else {
//                                         res.json({ msg: "Data deleted successfully" });
//                                     }
//                                 }
//                             );
//                         }
//                     }
//                 );
//             }
//         }
//     });
// };
export const deleteStoreLanguageData = async (req, res) => {
  const { shopName, id, urlId } = req.body;

  if (!shopName || !id || !urlId) {
    return res.status(400).json({ error: "shopName, id, and urlId are required" });
  }

  try {
    // Step 1: Get lang_id from the join
    const selectQuery = `
      SELECT su.lang_id 
      FROM ${store_languages_url_table} AS su
      INNER JOIN ${store_languages_table} AS s
      ON s.lang_id = su.lang_id
      WHERE s.shop_name = ? AND s.lang_id = ?
    `;
    const [selectResult] = await database.query(selectQuery, [shopName, id]);

    if (!selectResult.length) {
      return res.status(404).json({ error: "Language data not found" });
    }

    const langId = selectResult[0].lang_id;

    // Step 2: Delete from store_languages_url_table
    const deleteUrlQuery = `DELETE FROM ${store_languages_url_table} WHERE url_id = ? AND lang_id = ?`;
    await database.query(deleteUrlQuery, [urlId, langId]);

    // Step 3: If only one URL left, delete from store_languages_table
    if (selectResult.length <= 1) {
      const deleteLangQuery = `DELETE FROM ${store_languages_table} WHERE shop_name = ? AND lang_id = ?`;
      await database.query(deleteLangQuery, [shopName, id]);
    }

    res.json({ msg: "Data deleted successfully" });

  } catch (err) {
    console.error("❌ Error in deleteStoreLanguageData:", err);
    logger.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const updateStoreLanguageData = async (req, res) => {
    const id = null;
    updateStoreLanguage(req, res, id);
};

export const basicStoreLanguageData = async (req, res) => {
    updateStoreLanguage(req, res, req.body.id);
};

// export const updateDataAppInstallation = async (req, res) => {
//     const getMail = await new Promise((resolve, reject) => {
//         database.query(`SELECT shop_email, customer_email FROM app_installation WHERE shop_name="${req.body.shopName}"`,
//             (err, results) => {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     resolve(results);
//                 }
//             }
//         );
//     });
//     console.log("getMail --- --- ", getMail);

//     let dbQuery;
//     if (req.body.step === "step_1") {
//         let themeName = req.body.themeName.replace(/~/g, "'");
//         dbQuery = `UPDATE ${app_installation_table} SET step_1='${themeName}' WHERE shop_name = '${req.body.shopName}'`;
//         let theme = themeName.split(" -- ");
//         addSetupInBrevo(getMail[0]?.shop_email || "", getMail[0]?.customer_email || "", "THEMENAME", theme[0]);
//     } else if (req.body.step === "step_2") {
//         dbQuery = `UPDATE ${app_installation_table} SET step_2='${req.body.collectionBtn}' WHERE shop_name = '${req.body.shopName}'`;
//     } else {
//         dbQuery = `UPDATE ${app_installation_table} SET step_3='${JSON.stringify(
//             req.body.languages
//         )}', setup_completed='${req.body.setupCompleted}' WHERE shop_name = '${req.body.shopName
//             }'`;
//         addSetupInBrevo(getMail[0]?.shop_email || "", getMail[0]?.customer_email || "", "SETUP_COMPLETE", "TRUE");
//     }

//     database.query(dbQuery, (err, result) => {
//         if (err) {
//             console.log(err);
//             logger.error(err);
//         } else {
//             res.json({ msg: "app installation table updated" });
//         }
//     });
// };
export const updateDataAppInstallation = async (req, res) => {
  try {
    const { shopName, step, themeName, collectionBtn, languages, setupCompleted } = req.body;

    // Step 1: Get shop email and customer email
    const [getMail] = await database.query(
      `SELECT shop_email, customer_email FROM ${app_installation_table} WHERE shop_name = ?`,
      [shopName]
    );

    const shopEmail = getMail[0]?.shop_email || "";
    const customerEmail = getMail[0]?.customer_email || "";

    let updateQuery = "";
    let queryParams = [];

    if (step === "step_1") {
      const sanitizedThemeName = themeName.replace(/~/g, "'");
      updateQuery = `UPDATE ${app_installation_table} SET step_1 = ? WHERE shop_name = ?`;
      queryParams = [sanitizedThemeName, shopName];

      const theme = sanitizedThemeName.split(" -- ");
      addSetupInBrevo(shopEmail, customerEmail, "THEMENAME", theme[0]);
    } else if (step === "step_2") {
      updateQuery = `UPDATE ${app_installation_table} SET step_2 = ? WHERE shop_name = ?`;
      queryParams = [collectionBtn, shopName];
    } else {
      updateQuery = `UPDATE ${app_installation_table} SET step_3 = ?, setup_completed = ? WHERE shop_name = ?`;
      queryParams = [JSON.stringify(languages), setupCompleted, shopName];

      addSetupInBrevo(shopEmail, customerEmail, "SETUP_COMPLETE", "TRUE");
    }

    await database.query(updateQuery, queryParams);

    res.json({ msg: "App installation table updated" });

  } catch (err) {
    console.error("❌ Error in updateDataAppInstallation:", err);
    logger.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// export const appInstallation = async (req, res) => {

//     const nameParts = req.body.currentPlanName.split("/");
//     const currentPlanName = nameParts[0];
//     const oldPanType =
//         currentPlanName === "Free"
//             ? null
//             : currentPlanName === "No plan"
//                 ? null
//                 : nameParts[1] === "EVERY_30_DAYS"
//                     ? "MONTHLY"
//                     : nameParts[1];

//     database.query(
//         `SELECT * FROM ${app_installation_table} WHERE shop_name = '${req.body.shopName}'`,
//         async (err, totalCount) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 if (totalCount.length > 0) {
//                     if (
//                         totalCount.length > 0 &&
//                         req.body.currentPlanId == totalCount[0].active_plan_id
//                     ) {
//                         res.json({ msg: " no plan updated in our database" });
//                     } else {
//                         let storeName = req.body.storeName.replace(/'/g, "~");

//                         if (req?.body?.domain) {
//                             const dataValue = { host: req?.body?.domain }
//                             updateShopDomain(dataValue, req?.body?.shopName);
//                         }

//                         if (req.body.shopEmail === req.body.customerEmail) {
//                             await updatePlanToBrevo(req?.body?.shopEmail, currentPlanName, "Active");
//                         } else {
//                             await updatePlanToBrevo(req?.body?.shopEmail, currentPlanName, "Active");
//                             await updatePlanToBrevo(req?.body?.customerEmail, currentPlanName, "Active");
//                         }

//                         database.query(`UPDATE ${app_installation_table} SET status="Active", active_plan_id='${req.body.currentPlanId}', active_plan_name='${currentPlanName}', store_name='${storeName}', store_type='${req.body.currentPlanName === "Free" ? "live" : req.body.paymentType}', updated_date=NOW()  WHERE shop_name = '${req.body.shopName}'`,
//                             (err, result) => {
//                                 if (err) {
//                                     console.log(err);
//                                     logger.error(err);
//                                 } else {
//                                     if (result.affectedRows > 0) {
//                                         database.query(
//                                             `INSERT INTO ${app_installation_log_table} (app_install_id, plan_id,plan_name, plan_type, promo_code, payment_type) VALUES (${totalCount[0].app_install_id}, '${req.body.currentPlanId}','${currentPlanName}', '${oldPanType}', '${req?.body?.promoCode}', '${req.body.currentPlanName === "Free" ? "live" : req?.body?.paymentType}')`,
//                                             (err, result) => {
//                                                 if (err) {
//                                                     console.log(err);
//                                                     logger.error(err);
//                                                 } else {
//                                                     // herewe are sending the mail to us... if anyone buys the paid plan

//                                                     if (["Basic", "Pro", "Premium"].includes(currentPlanName)) {
//                                                         let emailContent = {
//                                                             from: supportEmail,
//                                                             to: "randeep.webframez@gmail.com",
//                                                             cc: "webframez@gmail.com",
//                                                             subject: `Wishlist Guru – ${currentPlanName} Plan Purchased by ${req.body.shopName}`,
//                                                             html: `Hii.. <br> <br>
//                                                                 We’re pleased to inform you that the ${currentPlanName} Plan of Wishlist Guru has been successfully purchased by the store: <br><br>
//                                                                 Shop Name: ${req?.body?.shopName} <br>
//                                                                 Store URL: ${req?.body?.domain} <br>
//                                                                 Email : ${req.body.shopEmail} <br>
//                                                                 Customer Email: ${req.body.customerEmail} <br><br>
//                                                                 Thank you.
//                                                                 Best regards`,
//                                                         };
//                                                         sendEmail(emailContent);
//                                                     }

//                                                     res.json({ msg: "plan updated in our database" });
//                                                 }
//                                             }
//                                         );
//                                     }
//                                 }
//                             }
//                         );
//                     }
//                 } else {
//                     // ---------------app installation mail sent here---------------
//                     let emailContent = {
//                         from: supportEmail,
//                         to: "webframez@gmail.com",
//                         subject: `Wishlist Guru installed on ${req.body.shopName}`,
//                         html: `Hii..... <br> <br> <br>
//             1. Shop Name: ${req.body.shopName} <br>
//             2. Plan Id : ${req.body.currentPlanId} <br>
//             3. Phone Number : ${req.body.phoneNumber} <br>
//             4. Email : ${req.body.shopEmail} <br>
//             5. Country : ${req.body.country} <br>
//             6. Shop Owner : ${req.body.shopOwner} <br>
//             7. Shop Url : ${req.body?.domain} <br>
//             8. Store name: ${req.body.storeName} <br>
//             9. Plan Name: ${currentPlanName} <br>
//             10. Customer Email: ${req.body.customerEmail} <br>`,
//                     };
//                     sendEmail(emailContent);

//                     let storeCountry = req.body.country.replace(/'/g, "~");
//                     let storeOwner = req.body.shopOwner.replace(/'/g, "~");
//                     let storeName = req.body.storeName.replace(/'/g, "~");

//                     database.query(`INSERT INTO ${app_installation_table} (shop_name, status, active_plan_id, active_plan_name, shop_email, customer_email, shop_phone, country, store_owner, store_name, shopify_plan, store_type) VALUES ('${req.body.shopName}','Active','${req.body.currentPlanId}','${currentPlanName}', '${req.body.shopEmail}', '${req.body.customerEmail}', '${req.body.phoneNumber}', '${storeCountry}', '${storeOwner}', '${storeName}', '${req.body.shopifyPlan}', '${req.body.currentPlanName === "Free" ? "live" : req?.body?.paymentType}')`,
//                         (err, result2) => {
//                             if (err) {
//                                 console.log(err);
//                                 logger.error(err);
//                             } else {
//                                 database.query(
//                                     `INSERT INTO ${app_installation_log_table} (app_install_id, plan_id, plan_name, plan_type, promo_code, payment_type) VALUES (${result2.insertId},'${req.body.currentPlanId}','${currentPlanName}', '${oldPanType}', '${req?.body?.promoCode || null}', '${req.body.currentPlanName === "Free" ? "live" : req?.body?.paymentType}')`,
//                                     (err, result3) => {
//                                         if (err) {
//                                             console.log(err);
//                                             logger.error(err);
//                                         } else {
//                                             // res.json({ msg: "plan created in our database" })
//                                             database.query(
//                                                 `INSERT INTO email_reminder (app_install_id, email_option, selected_date, back_in_stock, low_in_stock, price_drop, shop_name) VALUES (${result2.insertId}, 'turnOff', DAY(CURDATE()), 'no', 'no', 'no', '${req.body.shopName}');`,
//                                                 (err, insertedData) => {
//                                                     if (err) {
//                                                         console.log(err);
//                                                         logger.error(err);
//                                                     } else {
//                                                         res.send({ msg: "plan created in our database" });
//                                                     }
//                                                 }
//                                             );
//                                         }
//                                     }
//                                 );
//                             }
//                         }
//                     );
//                 }
//             }
//         }
//     );
// };



// export const updateProductQuantity = async (req, res) => {
//     database.query(
//         `UPDATE ${product_table} SET quantity=${req.body.quantity} WHERE product_id='${req.body.productId}' AND wishlist_id='${req.body.userId}'  `,
//         (err, result) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 res.json({ msg: "item_quantity_updated" });
//             }
//         }
//     );
// };
export const appInstallation = async (req, res) => {
  try {
    const nameParts = req.body.currentPlanName.split("/");
    const currentPlanName = nameParts[0];
    const oldPlanType =
      currentPlanName === "Free" || currentPlanName === "No plan"
        ? null
        : nameParts[1] === "EVERY_30_DAYS"
        ? "MONTHLY"
        : nameParts[1];

    // 1️⃣ Check if shop already exists
    const [existingShops] = await database.query(
      `SELECT * FROM ${app_installation_table} WHERE shop_name = ?`,
      [req.body.shopName]
    );

    if (existingShops.length > 0) {
      const existingShop = existingShops[0];

      if (req.body.currentPlanId == existingShop.active_plan_id) {
        return res.json({ msg: "No plan updated in our database" });
      }

      // Update domain if provided
      if (req.body.domain) {
        updateShopDomain({ host: req.body.domain }, req.body.shopName);
      }

      // Update plan in Brevo
      if (req.body.shopEmail === req.body.customerEmail) {
        await updatePlanToBrevo(req.body.shopEmail, currentPlanName, "Active");
      } else {
        await updatePlanToBrevo(req.body.shopEmail, currentPlanName, "Active");
        await updatePlanToBrevo(req.body.customerEmail, currentPlanName, "Active");
      }

      // Update app_installation table
      const storeName = req.body.storeName.replace(/'/g, "~");
      await database.query(
        `UPDATE ${app_installation_table} 
         SET status = "Active",
             active_plan_id = ?,
             active_plan_name = ?,
             store_name = ?,
             store_type = ?,
             updated_date = NOW()
         WHERE shop_name = ?`,
        [
          req.body.currentPlanId,
          currentPlanName,
          storeName,
          req.body.currentPlanName === "Free" ? "live" : req.body.paymentType,
          req.body.shopName,
        ]
      );

      // Insert into app_installation_log_table
      await database.query(
        `INSERT INTO ${app_installation_log_table} 
         (app_install_id, plan_id, plan_name, plan_type, promo_code, payment_type) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          existingShop.app_install_id,
          req.body.currentPlanId,
          currentPlanName,
          oldPlanType,
          req.body.promoCode || null,
          req.body.currentPlanName === "Free" ? "live" : req.body.paymentType,
        ]
      );

      // Send email for paid plan purchase
      if (["Basic", "Pro", "Premium"].includes(currentPlanName)) {
        const emailContent = {
          from: supportEmail,
          to: "randeep.webframez@gmail.com",
          cc: "webframez@gmail.com",
          subject: `Wishlist Guru – ${currentPlanName} Plan Purchased by ${req.body.shopName}`,
          html: `Hii.. <br><br>
            We’re pleased to inform you that the ${currentPlanName} Plan of Wishlist Guru has been successfully purchased by the store: <br><br>
            Shop Name: ${req.body.shopName} <br>
            Store URL: ${req.body.domain} <br>
            Email: ${req.body.shopEmail} <br>
            Customer Email: ${req.body.customerEmail} <br><br>
            Thank you.<br>Best regards`,
        };
        sendEmail(emailContent);
      }

      return res.json({ msg: "Plan updated in our database" });

    } else {
      // 2️⃣ Insert new shop record
      const storeCountry = req.body.country.replace(/'/g, "~");
      const storeOwner = req.body.shopOwner.replace(/'/g, "~");
      const storeName = req.body.storeName.replace(/'/g, "~");

      const [insertResult] = await database.query(
        `INSERT INTO ${app_installation_table} 
         (shop_name, status, active_plan_id, active_plan_name, shop_email, customer_email, shop_phone, country, store_owner, store_name, shopify_plan, store_type)
         VALUES (?, "Active", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.shopName,
          req.body.currentPlanId,
          currentPlanName,
          req.body.shopEmail,
          req.body.customerEmail,
          req.body.phoneNumber,
          storeCountry,
          storeOwner,
          storeName,
          req.body.shopifyPlan,
          req.body.currentPlanName === "Free" ? "live" : req.body.paymentType,
        ]
      );

      // Insert log
      await database.query(
        `INSERT INTO ${app_installation_log_table} 
         (app_install_id, plan_id, plan_name, plan_type, promo_code, payment_type)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          insertResult.insertId,
          req.body.currentPlanId,
          currentPlanName,
          oldPlanType,
          req.body.promoCode || null,
          req.body.currentPlanName === "Free" ? "live" : req.body.paymentType,
        ]
      );

      // Insert default email_reminder
      await database.query(
        `INSERT INTO ${email_reminder_table} 
         (app_install_id, email_option, selected_date, back_in_stock, low_in_stock, price_drop, shop_name)
         VALUES (?, 'turnOff', DAY(CURDATE()), 'no', 'no', 'no', ?)`,
        [insertResult.insertId, req.body.shopName]
      );

      // Send installation email
      const emailContent = {
        from: supportEmail,
        to: "webframez@gmail.com",
        subject: `Wishlist Guru installed on ${req.body.shopName}`,
        html: `Hii..... <br><br>
          1. Shop Name: ${req.body.shopName} <br>
          2. Plan Id : ${req.body.currentPlanId} <br>
          3. Phone Number : ${req.body.phoneNumber} <br>
          4. Email : ${req.body.shopEmail} <br>
          5. Country : ${req.body.country} <br>
          6. Shop Owner : ${req.body.shopOwner} <br>
          7. Shop Url : ${req.body.domain} <br>
          8. Store name: ${req.body.storeName} <br>
          9. Plan Name: ${currentPlanName} <br>
          10. Customer Email: ${req.body.customerEmail} <br>`,
      };
      sendEmail(emailContent);

      return res.json({ msg: "Plan created in our database" });
    }

  } catch (err) {
    console.error("❌ Error in appInstallation:", err);
    logger.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// export const updateProductQuantity = async (req, res) => {
//     // Create index for performance (dev/testing only)
//     // database.query(`CREATE INDEX IF NOT EXISTS idx_product_wishlist ON ${product_table}(product_id, wishlist_id);`);

//     const query = `
//         UPDATE ${product_table}
//         SET quantity = ?
//         WHERE product_id = ? AND wishlist_id = ?
//     `;

//     database.query(query, [req.body.quantity, req.body.productId, req.body.userId], (err, result) => {
//         if (err) {
//             console.log(err);
//             logger.error(err);
//             res.status(500).json({ msg: "update_failed" });
//         } else {
//             res.json({ msg: "item_quantity_updated" });
//         }
//     });
// };

// export const updateProductVariant = async (req, res) => {
//     // Create index for performance (dev/testing only)
//     // database.query(`CREATE INDEX IF NOT EXISTS idx_product_wishlist ON ${product_table}(product_id, wishlist_id);`);

//     const query = `
//         UPDATE ${product_table}
//         SET variant_id = ?
//         WHERE product_id = ? AND wishlist_id = ? AND id = ?
//     `;

//     database.query(query, [req.body.newVariant, req.body.productId, req.body.userId, req.body.listId], (err, result) => {
//         if (err) {
//             console.log(err);
//             logger.error(err);
//             res.status(500).json({ msg: "update_failed" });
//         } else {
//             res.json({ msg: "item_variant_updated" });
//         }
//     });
// };
export const updateProductQuantity = async (req, res) => {
  const { quantity, productId, userId } = req.body;

  const query = `
    UPDATE ${product_table}
    SET quantity = ?
    WHERE product_id = ? AND wishlist_id = ?
  `;

  try {
    const [result] = await database.query(query, [quantity, productId, userId]);
    res.json({ msg: "item_quantity_updated" });
  } catch (err) {
    console.error(err);
    logger?.error?.(err);
    res.status(500).json({ msg: "update_failed" });
  }
};


export const updateProductVariant = async (req, res) => {
  try {
    // ✅ Query to update variant
    const query = `
      UPDATE ${product_table}
      SET variant_id = ?
      WHERE product_id = ? AND wishlist_id = ? AND id = ?
    `;

    const [result] = await database.query(query, [
      req.body.newVariant,
      req.body.productId,
      req.body.userId,
      req.body.listId,
    ]);

    res.json({ msg: "item_variant_updated" });
  } catch (err) {
    console.error("❌ Error updating product variant:", err);
    logger.error(err);
    res.status(500).json({ msg: "update_failed" });
  }
};


// export const sendTestEmail = async (req, res) => {

//     try {
//         const { recieverEmail, htmlContent, subject, logoResult, app_install_id, senderName, replyTo, shopName } = req.body;
//         if (recieverEmail) {
//             let emailContent = {
//                 from: supportEmail,
//                 to: recieverEmail,
//                 subject: subject,
//                 html: htmlContent,
//                 logoResult: logoResult,
//                 app_install_id: app_install_id,
//                 senderName: senderName,
//                 replyTo: replyTo
//             };

//             const getSmtpDetail = await queryAsync(`SELECT * FROM email_smtp WHERE shop_name=?`, [shopName]);
//             let sendErrorMail = false;
//             if (getSmtpDetail.length !== 0 && getSmtpDetail[0].user_name !== "") {
//                 // console.log("FROM _______ SMTP")
//                 const checkSmtp = await sendSmtpEmail(getSmtpDetail, emailContent, logoResult, app_install_id);
//                 if (checkSmtp === false) {
//                     sendErrorMail = true;
//                     sendEmail(emailContent);
//                     sendSmtpErrorMail(shopName)
//                 }
//                 res.status(200).json({ message: "Email sent Successfully!" });
//             } else {
//                 // console.log("FROM OUR SERVER")
//                 sendEmail(emailContent);
//                 res.status(200).json({ message: "email sent Successfully!" });
//             }

//             // sendEmail(emailContent);
//             // res.status(200).json({ message: "email sent Successfully!" });
//         } else {
//             res.status(200).json({ message: "Recipcent not found" });
//         }
//     } catch (err) {
//         console.error(err);
//         logger.error(err);
//         res.status(500).json({ msg: "Internal Server Error" });
//     }
// };
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
      shopName,
    } = req.body;

    if (!recieverEmail) {
      return res.status(400).json({ message: "Recipient not found" });
    }

    const emailContent = {
      from: supportEmail,
      to: recieverEmail,
      subject,
      html: htmlContent,
      logoResult,
      app_install_id,
      senderName,
      replyTo,
    };

    // ✅ Get SMTP details
    const [getSmtpDetail] = await database.query(`SELECT * FROM email_smtp WHERE shop_name = ?`, [shopName]);

    let sendErrorMail = false;

    if (getSmtpDetail.length && getSmtpDetail[0].user_name) {
      // Send via SMTP
      const checkSmtp = await sendSmtpEmail(getSmtpDetail, emailContent, logoResult, app_install_id);
      if (!checkSmtp) {
        sendErrorMail = true;
        await sendEmail(emailContent); // fallback to default server
        sendSmtpErrorMail(shopName);
      }
    } else {
      // Send via default server
      await sendEmail(emailContent);
    }

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (err) {
    console.error("❌ Error in sendTestEmail:", err);
    logger.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};


// export const getAllCartItems = async (req, res) => {
//     // console.log("dsssss", `SELECT wt.wishlist_id AS id FROM ${Wishlist_table} AS wt , ${user_table} AS u  WHERE u.shop_name = '${req.body.shopName}' AND u.id = wt.wishlist_user_id AND email='${req.body.customerEmail}'`);
//     const getUserId = database.query(
//         `SELECT wt.wishlist_id AS id FROM ${Wishlist_table} AS wt , ${user_table} AS u  WHERE u.shop_name = '${req.body.shopName}' AND u.id = wt.wishlist_user_id AND email='${req.body.customerEmail}'`,
//         (err, result) => {
//             if (err) {
//                 console.log(err);
//                 logger.error(err);
//             } else {
//                 // @ts-ignore
//                 if (result.length !== 0) {
//                     let wishlistId = result[0].id;
//                     const getAllItems = database.query(
//                         `SELECT * from ${cart_table} WHERE wishlist_id='${wishlistId}'`,
//                         (err, result1) => {
//                             if (err) {
//                                 console.log(err);
//                                 logger.error(err);
//                             } else {
//                                 if (result1.length === 0) {
//                                     res.json({ data: [] });
//                                 } else {
//                                     res.json({ data: result1 });
//                                 }
//                             }
//                         }
//                     );
//                 } else {
//                     res.json({ data: [] });
//                 }
//             }
//         }
//     );
// };

// export const currentAppTheme = async (req, res) => {
//     const session = await shopify.config.sessionStorage.findSessionsByShop(
//         req.query.shopDomain
//     );
//     try {
//         const themeData = await shopify.api.rest.Theme.all({
//             session: session[0],
//         });
//         const getThemeId = themeData.data.find((theme) => theme.role === "main");
//         const getAssestData = await shopify.api.rest.Asset.all({
//             session: session[0],
//             theme_id: getThemeId.id,
//             asset: { key: "config/settings_schema.json" },
//         });
//         let schemaFile = JSON.parse(getAssestData.data[0].value);
//         res.status(200).send({ themeName: schemaFile[0].theme_name });
//     } catch (error) {
//         logger.error(error);
//         res.status(500).json({ error: "An error occurred" });
//     }
// }
export const getAllCartItems = async (req, res) => {
  try {
    const { shopName, customerEmail } = req.body;

    // Step 1: Get wishlist_id for the customer
    const [userWishlist] = await database.query(
      `SELECT wt.wishlist_id AS id 
       FROM ${Wishlist_table} AS wt
       JOIN ${user_table} AS u 
       ON u.id = wt.wishlist_user_id
       WHERE u.shop_name = ? AND u.email = ?`,
      [shopName, customerEmail]
    );

    if (userWishlist.length === 0) {
      return res.json({ data: [] });
    }

    const wishlistId = userWishlist[0].id;

    // Step 2: Get all cart items for that wishlist
    const [cartItems] = await database.query(
      `SELECT * FROM ${cart_table} WHERE wishlist_id = ?`,
      [wishlistId]
    );

    res.json({ data: cartItems.length ? cartItems : [] });

  } catch (err) {
    console.error("❌ Error in getAllCartItems:", err);
    logger.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// export const currentAppTheme = async (req, res) => {
//   try {
//     const { shopDomain } = req.query;

//     if (!shopDomain) {
//       return res.status(400).json({ error: "Missing shopDomain parameter" });
//     }

//     const sessions = await shopify.config.sessionStorage.findSessionsByShop(shopDomain);
//     const session = sessions?.[0];

//     if (!session) {
//       return res.status(404).json({ error: "No active session found for this shop" });
//     }

//     // Fetch all themes
//     const themeData = await shopify.api.rest.Theme.all({ session });
//     const mainTheme = themeData?.data?.find((theme) => theme.role === "main");

//     if (!mainTheme) {
//       return res.status(404).json({ error: "Main theme not found" });
//     }

//     // Fetch theme schema file
//     const assetData = await shopify.api.rest.Asset.all({
//       session,
//       theme_id: mainTheme.id,
//       asset: { key: "config/settings_schema.json" },
//     });

//     const schemaValue = assetData?.data?.[0]?.value;
//     if (!schemaValue) {
//       return res.status(404).json({ error: "Theme schema file not found" });
//     }

//     const schemaFile = JSON.parse(schemaValue);
//     const themeName = schemaFile?.[0]?.theme_name || "Unknown Theme";

//     res.status(200).json({ themeName });
//   } catch (error) {
//     console.error("❌ Error fetching current app theme:", error);
//     logger.error(error);
//     res.status(500).json({ error: "An error occurred while fetching the theme" });
//   }
// };


// export const handleRedirect = async (req, res) => {

//     try {
//         const redirectUrl = req.query.redirectUrl;
//         const data = JSON.parse(decodeURIComponent(req.query.data));
//         const { id, shop_name, user_email, mainToken } = data[0];
//         const decryptedId = decodeToken(id);
//         const decryptedMainToken = decodeToken(mainToken);

//         if (token === decryptedMainToken) {
//             await queryAsync(
//                 `
//         UPDATE ${email_reports_table}
//         SET clicks = clicks + 1
//         WHERE id = ? AND shop_name = ? AND user_email = ?`,
//                 [decryptedId, shop_name, user_email]
//             );
//             res.redirect(redirectUrl);
//         }
//     } catch (error) {
//         console.error("Error handling redirect:", error);
//         res.status(500).json({ msg: "Failed to update data or redirect" });
//     }
// };
export const currentAppTheme = async (req, res) => {
  try {
    const { shopDomain } = req.query;

    if (!shopDomain) {
      return res.status(400).json({ error: "Missing shopDomain parameter" });
    }

    // Get active sessions for the shop
    const sessions = await shopify.config.sessionStorage.findSessionsByShop(shopDomain);
    const session = sessions?.[0];

    if (!session) {
      return res.status(404).json({ error: "No active session found for this shop" });
    }

    // Fetch all themes for the shop
    const themeData = await shopify.api.rest.Theme.all({ session });
    const mainTheme = themeData?.data?.find((theme) => theme.role === "main");

    if (!mainTheme) {
      return res.status(404).json({ error: "Main theme not found" });
    }

    // Fetch the theme's settings schema
    const assetData = await shopify.api.rest.Asset.all({
      session,
      theme_id: mainTheme.id,
      asset: { key: "config/settings_schema.json" },
    });

    const schemaValue = assetData?.data?.[0]?.value;
    if (!schemaValue) {
      return res.status(404).json({ error: "Theme schema file not found" });
    }

    // Parse the schema JSON
    let themeName = "Unknown Theme";
    try {
      const schemaFile = JSON.parse(schemaValue);
      themeName = schemaFile?.[0]?.theme_name || "Unknown Theme";
    } catch (parseError) {
      console.warn("Failed to parse settings_schema.json:", parseError);
    }

    res.status(200).json({ themeName });
  } catch (error) {
    console.error("❌ Error fetching current app theme:", error);
    logger.error(error);
    res.status(500).json({ error: "An error occurred while fetching the theme" });
  }
};


// export const handleRedirect = async (req, res) => {
//   try {
//     const { redirectUrl, data } = req.query;

//     if (!redirectUrl || !data) {
//       return res.status(400).json({ msg: "Missing redirectUrl or data in query" });
//     }

//     // Decode and parse data safely
//     const decodedData = JSON.parse(decodeURIComponent(data));
//     const { id, shop_name, user_email, mainToken } = decodedData[0];

//     if (!id || !shop_name || !user_email || !mainToken) {
//       return res.status(400).json({ msg: "Invalid data structure" });
//     }

//     // Decode encrypted tokens
//     const decryptedId = decodeToken(id);
//     const decryptedMainToken = decodeToken(mainToken);

//     // Validate token before updating
//     if (token !== decryptedMainToken) {
//       return res.status(403).json({ msg: "Invalid or expired token" });
//     }

//     // Update clicks count safely
//     const updateQuery = `
//       UPDATE ${email_reports_table}
//       SET clicks = clicks + 1
//       WHERE id = ? AND shop_name = ? AND user_email = ?
//     `;

//     const [result] = await database.query(updateQuery, [
//       decryptedId,
//       shop_name,
//       user_email,
//     ]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ msg: "Record not found" });
//     }

//     // Redirect user after successful update
//     return res.redirect(redirectUrl);

//   } catch (error) {
//     console.error("❌ Error handling redirect:", error);
//     logger?.error?.(error);
//     res.status(500).json({ msg: "Failed to update data or redirect" });
//   }
// };
export const handleRedirect = async (req, res) => {
  try {
    const { redirectUrl, data } = req.query;

    if (!redirectUrl || !data) {
      return res.status(400).json({ msg: "Missing redirectUrl or data in query" });
    }

    // Decode and parse data safely
    const decodedData = JSON.parse(decodeURIComponent(data));
    const { id, shop_name, user_email, mainToken } = decodedData[0] || {};

    if (!id || !shop_name || !user_email || !mainToken) {
      return res.status(400).json({ msg: "Invalid data structure" });
    }

    // Decode encrypted tokens
    const decryptedId = decodeToken(id);
    const decryptedMainToken = decodeToken(mainToken);

    // Validate token (make sure you have 'token' defined globally or in scope)
    if (token !== decryptedMainToken) {
      return res.status(403).json({ msg: "Invalid or expired token" });
    }

    // Update clicks count
    const updateQuery = `
      UPDATE ${email_reports_table}
      SET clicks = clicks + 1
      WHERE id = ? AND shop_name = ? AND user_email = ?
    `;

    const [result] = await database.query(updateQuery, [
      decryptedId,
      shop_name,
      user_email,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Record not found" });
    }

    // Redirect user
    return res.redirect(redirectUrl);

  } catch (error) {
    console.error("❌ Error handling redirect:", error);
    logger?.error?.(error);
    return res.status(500).json({ msg: "Failed to update data or redirect" });
  }
};


// export const checkPromoCode = async (req, res) => {
//     const { shopName, cuponCode, planName, planType } = req.body;

//     try {
//         const checkPrevPlanQuery = `
//       SELECT ail.app_install_id, ail.plan_name
//       FROM app_installation ai
//       JOIN app_installation_logs ail ON ai.app_install_id = ail.app_install_id
//       WHERE ai.shop_name = ? AND ail.plan_name = ?;
//     `;
//         // const [checkPrevPlan] = await database.promise().query(checkPrevPlanQuery, [shopName, planName]);

//         const getCountry = await new Promise((resolve, reject) => {
//             database.query(`SELECT country FROM app_installation WHERE shop_name="${shopName}"`,
//                 (err, results) => {
//                     if (err) {
//                         reject(err);
//                     } else {
//                         resolve(results);
//                     }
//                 }
//             );
//         });

//         const promoQuery = `SELECT * FROM promo_codes WHERE promo_code = ?;`;
//         const [promoData] = await database.promise().query(promoQuery, [cuponCode]);

//         if (promoData.length === 0) {
//             return res.status(200).send({ msg: "Invalid Promo Code", data: [] });
//         }

//         const promo = promoData[0];
//         let currentDATE = new Date();
//         let errorMessage = null;

//         if (promo.status !== "active") {
//             errorMessage = "Promo code is not active";
//         } else if (
//             promo.check_date === "check" &&
//             (currentDATE < new Date(promo.start_date) ||
//                 currentDATE > new Date(promo.end_date))
//         ) {
//             errorMessage = "Promo code is invalid/expired";
//         }
//         // else if (promo.plan_name !== "all" && planName !== promo.plan_name) {
//         //   errorMessage = `Promo code is only available for ${promo.plan_name} plan`;
//         // }
//         // else if (promo.previous_plan === "check" && checkPrevPlan.length > 0) {
//         //   errorMessage = `Promo code is only available for first-time ${promo.plan_name} plan users.`;
//         // }
//         else if (promo.plan_type !== "none" && planType !== promo.plan_type) {
//             errorMessage = `Promo code is only available for ${promo.plan_type === "ANNUAL" ? "annual" : "monthly"
//                 } plan.`;
//         } else if (promo.store && shopName !== promo.store) {
//             errorMessage = `Promo code is only available for ${promo.store} store.`;
//         }
//         else if (promo.country !== null) {
//             if (promo.country !== getCountry[0].country) {
//                 errorMessage = `Promo code is only available for ${promo.country}`;
//             }
//         }

//         if (errorMessage) {
//             return res.status(200).send({ msg: errorMessage, data: [] });
//         }

//         res.status(200).send({ msg: "promo code added", data: promoData });
//     } catch (err) {
//         console.error("Error:", err);
//         res.status(500).send({ msg: "Server error", error: err });
//     }
// };
export const checkPromoCode = async (req, res) => {
  const { shopName, cuponCode, planName, planType } = req.body;

  try {
    // ✅ 1. Get country directly with promise-based query
    const [countryResult] = await database.query(
      `SELECT country FROM app_installation WHERE shop_name = ?`,
      [shopName]
    );

    if (countryResult.length === 0) {
      return res.status(404).send({ msg: "Shop not found", data: [] });
    }

    const shopCountry = countryResult[0].country;

    // ✅ 2. Fetch promo code
    const [promoData] = await database.query(
      `SELECT * FROM promo_codes WHERE promo_code = ?`,
      [cuponCode]
    );

    if (promoData.length === 0) {
      return res.status(200).send({ msg: "Invalid Promo Code", data: [] });
    }

    const promo = promoData[0];
    const currentDATE = new Date();
    let errorMessage = null;

    // ✅ 3. Validate promo
    if (promo.status !== "active") {
      errorMessage = "Promo code is not active";
    } else if (
      promo.check_date === "check" &&
      (currentDATE < new Date(promo.start_date) ||
        currentDATE > new Date(promo.end_date))
    ) {
      errorMessage = "Promo code is invalid/expired";
    } else if (
      promo.plan_type !== "none" &&
      planType !== promo.plan_type
    ) {
      errorMessage = `Promo code is only available for ${
        promo.plan_type === "ANNUAL" ? "annual" : "monthly"
      } plan.`;
    } else if (promo.store && shopName !== promo.store) {
      errorMessage = `Promo code is only available for ${promo.store} store.`;
    } else if (promo.country && promo.country !== shopCountry) {
      errorMessage = `Promo code is only available for ${promo.country}.`;
    }

    // ✅ 4. Send validation message
    if (errorMessage) {
      return res.status(200).send({ msg: errorMessage, data: [] });
    }

    // ✅ 5. Success
    res.status(200).send({ msg: "Promo code added", data: promoData });
  } catch (err) {
    console.error("❌ Error:", err);
    logger?.error?.(err);
    res.status(500).send({ msg: "Server error", error: err });
  }
};


// export const checkPromoCodePrevPlan = async (req, res) => {
//     const { shopName, planName } = req.body;

//     try {
//         const checkPrevPlanQuery = `
//       SELECT ail.app_install_id, ail.plan_name
//       FROM app_installation ai
//       JOIN app_installation_logs ail ON ai.app_install_id = ail.app_install_id
//       WHERE ai.shop_name = ? AND ail.plan_name = ?;
//     `;
//         const [checkPrevPlan] = await database
//             .promise()
//             .query(checkPrevPlanQuery, [shopName, planName]);

//         res.status(200).send({ msg: "promo code added", data: checkPrevPlan });
//     } catch (err) {
//         console.error("Error:", err);
//         res.status(500).send({ msg: "Server error", error: err });
//     }
// };
export const checkPromoCodePrevPlan = async (req, res) => {
  const { shopName, planName } = req.body;

  try {
    const checkPrevPlanQuery = `
      SELECT ail.app_install_id, ail.plan_name
      FROM app_installation ai
      JOIN app_installation_logs ail ON ai.app_install_id = ail.app_install_id
      WHERE ai.shop_name = ? AND ail.plan_name = ?;
    `;

    const [checkPrevPlan] = await database.query(checkPrevPlanQuery, [shopName, planName]);

    res.status(200).send({
      msg: "promo code added",
      data: checkPrevPlan
    });
  } catch (err) {
    console.error("❌ Error:", err);
    logger?.error?.(err);
    res.status(500).send({ msg: "Server error", error: err });
  }
};


// export const getShareStatsData = async (req, res) => {
//     const { shopName, startDate, endDate, userType, isDates, isType } = req.body;
//     let dateQuery = "";
//     let typeQuery = "";

//     if (isDates) {
//         dateQuery += `AND t1.created_at >= "${startDate}" AND CAST(t1.created_at as DATE) <= "${endDate}"`;
//     }

//     if (isType) {
//         typeQuery += `AND t2.user_type = "${userType}"`;
//     }

//     try {
//         const mainSelectQuery = `SELECT t1.*, t2.user_type, t2.email AS userEmail
//     FROM ${wishlist_shared_stats} AS t1
//     JOIN ${user_table} AS t2 ON t1.user_id = t2.id
//     WHERE t1.shop_name = ? ${dateQuery} ${typeQuery}
//     ORDER BY t1.created_at DESC`;

//         const mainResult = await queryAsync(mainSelectQuery, [shopName]);
//         res.send({ mainResult: mainResult, msg: "date fetched" });
//     } catch (err) {
//         console.error(err);
//         logger.error(err);
//         res.status(500).json({ msg: "Internal Server Error" });
//     }
// };
export const getShareStatsData = async (req, res) => {
  const { shopName, startDate, endDate, userType, isDates, isType } = req.body;
  let dateQuery = "";
  let typeQuery = "";

  if (isDates) {
    dateQuery += ` AND t1.created_at >= ? AND DATE(t1.created_at) <= ?`;
  }

  if (isType) {
    typeQuery += ` AND t2.user_type = ?`;
  }

  try {
    const mainSelectQuery = `
      SELECT t1.*, t2.user_type, t2.email AS userEmail
      FROM ${wishlist_shared_stats} AS t1
      JOIN ${user_table} AS t2 ON t1.user_id = t2.id
      WHERE t1.shop_name = ?
      ${dateQuery}
      ${typeQuery}
      ORDER BY t1.created_at DESC
    `;

    // Dynamically build parameters in order
    const params = [shopName];
    if (isDates) params.push(startDate, endDate);
    if (isType) params.push(userType);

    const [mainResult] = await database.query(mainSelectQuery, params);

    res.status(200).json({ msg: "date fetched", mainResult });
  } catch (err) {
    console.error("❌ Error fetching share stats:", err);
    logger?.error?.(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};


// export const getShareStatsUserData = async (req, res) => {
//     let query = "";
//     let cartQuery = "";
//     let itemQuery = "";
//     if (req.body.checkStatusInItem === true) {
//         query += `AND created_at >= "${req.body.startDate}" AND CAST(created_at as DATE) <= "${req.body.endDate}"`;
//         cartQuery += `AND w.created_at >= "${req.body.startDate}" AND CAST(w.created_at as DATE) <= "${req.body.endDate}"`;
//         itemQuery += `AND w.created_at >= "${req.body.startDate}" AND CAST(w.created_at as DATE) <= "${req.body.endDate}"`;
//     }

//     const userData = await new Promise((resolve, reject) => {
//         database.query(
//             `SELECT * FROM ${user_table} Where shop_name='${req.body.shopName}' AND referral_user_id = ${req.body.userId} ${query}`,
//             (err, result) => {
//                 if (err) {
//                     reject(err);
//                     logger.error(err);
//                 } else {
//                     resolve(result);
//                 }
//             }
//         );
//     });

//     const cartData = await new Promise((resolve, reject) => {
//         database.query(
//             `SELECT * FROM ${cart_table} as w, ${user_table} as u,  ${Wishlist_table} as wt WHERE u.id = wt.wishlist_user_id AND w.wishlist_id = wt.wishlist_id AND u.shop_name='${req.body.shopName}' ${cartQuery} GROUP BY u.id,w.variant_id ORDER BY w.id `,
//             (err, result) => {
//                 if (err) {
//                     reject(err);
//                     logger.error(err);
//                 } else {
//                     resolve(result);
//                 }
//             }
//         );
//     });

//     const wishlistItemData = await new Promise((resolve, reject) => {
//         database.query(
//             `SELECT * FROM ${product_table} as w, ${user_table} as u,  ${Wishlist_table} as wt WHERE u.id = wt.wishlist_user_id AND w.wishlist_id = wt.wishlist_id AND u.shop_name='${req.body.shopName}' AND w.referral_user_id = ${req.body.userId} ${itemQuery} GROUP BY u.id,w.variant_id ORDER BY w.id DESC;`,
//             (err, result) => {
//                 if (err) {
//                     reject(err);
//                     logger.error(err);
//                 } else {
//                     resolve(result);
//                 }
//             }
//         );
//     });

//     let results = [];

//     for (let abItem of userData) {
//         let count = 0;
//         let cartCount = 0;

//         for (let bcItem of wishlistItemData) {
//             if (abItem.id === bcItem.id) {
//                 count++;
//             }
//         }
//         for (let itemData of cartData) {
//             if (abItem.id === itemData.id) {
//                 cartCount++;
//             }
//         }

//         let newItem = {
//             ...abItem,
//             wishlistItemCount: count,
//             cartTableCount: cartCount,
//         };
//         results.push(newItem);
//         // }
//     }

//     res.send({
//         mainResult: results,
//         userData,
//         cartData,
//         wishlistItemData,
//         results,
//     });
// };
export const getShareStatsUserData = async (req, res) => {
  try {
    const { shopName, userId, startDate, endDate, checkStatusInItem } = req.body;

    // ✅ Build dynamic WHERE conditions safely
    let dateFilter = "";
    if (checkStatusInItem) {
      dateFilter = `AND created_at >= ? AND DATE(created_at) <= ?`;
    }

    let dateFilterCart = "";
    let dateFilterItem = "";
    if (checkStatusInItem) {
      dateFilterCart = `AND w.created_at >= ? AND DATE(w.created_at) <= ?`;
      dateFilterItem = `AND w.created_at >= ? AND DATE(w.created_at) <= ?`;
    }

    // ✅ 1. Get user data
    const userQuery = `
      SELECT * FROM ${user_table}
      WHERE shop_name = ? AND referral_user_id = ? ${dateFilter}
    `;

    const userParams = checkStatusInItem ? [shopName, userId, startDate, endDate] : [shopName, userId];
    const [userData] = await database.query(userQuery, userParams);

    // ✅ 2. Get cart data
    const cartQuery = `
      SELECT * FROM ${cart_table} AS w
      JOIN ${Wishlist_table} AS wt ON w.wishlist_id = wt.wishlist_id
      JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
      WHERE u.shop_name = ? ${dateFilterCart}
      GROUP BY u.id, w.variant_id
      ORDER BY w.id
    `;
    const cartParams = checkStatusInItem ? [shopName, startDate, endDate] : [shopName];
    const [cartData] = await database.query(cartQuery, cartParams);

    // ✅ 3. Get wishlist item data
    const wishlistItemQuery = `
      SELECT * FROM ${product_table} AS w
      JOIN ${Wishlist_table} AS wt ON w.wishlist_id = wt.wishlist_id
      JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
      WHERE u.shop_name = ? AND w.referral_user_id = ? ${dateFilterItem}
      GROUP BY u.id, w.variant_id
      ORDER BY w.id DESC
    `;
    const wishlistItemParams = checkStatusInItem
      ? [shopName, userId, startDate, endDate]
      : [shopName, userId];
    const [wishlistItemData] = await database.query(wishlistItemQuery, wishlistItemParams);

    // ✅ 4. Combine counts
    const results = userData.map((user) => {
      const wishlistItemCount = wishlistItemData.filter((item) => item.id === user.id).length;
      const cartTableCount = cartData.filter((item) => item.id === user.id).length;

      return {
        ...user,
        wishlistItemCount,
        cartTableCount,
      };
    });

    // ✅ 5. Send response
    res.status(200).json({
      msg: "User share stats fetched successfully",
      mainResult: results,
      userData,
      cartData,
      wishlistItemData,
      results,
    });
  } catch (err) {
    console.error("❌ Error fetching share stats user data:", err);
    logger?.error?.(err);
    res.status(500).json({ msg: "Internal Server Error", error: err });
  }
};


// export const getShareStatsWishlistItemData = async (req, res) => {
//     let query = "";
//     if (req.body.checkStatusInItem === true) {
//         query += `AND pu.created_at >= "${req.body.startDate}" AND CAST(pu.created_at as DATE) <= "${req.body.endDate}"`;
//     }

//     database.query(
//         `SELECT  *  FROM ${product_table} AS pu , ${Wishlist_table} AS wt , ${user_table} AS u WHERE u.id = wt.wishlist_user_id AND wt.wishlist_id = pu.wishlist_id AND shop_name='${req.body.shopName}' AND pu.referral_user_id = ${req.body.userId} ${query}`,
//         (err, result) => {
//             if (err) {
//                 logger.error(err);
//                 console.log("err", err);
//             } else {
//                 res.send({ mainResult: result });
//             }
//         }
//     );
// };
export const getShareStatsWishlistItemData = async (req, res) => {
  try {
    const { shopName, userId, startDate, endDate, checkStatusInItem } = req.body;

    // ✅ Build dynamic date filter safely
    let dateFilter = "";
    const params = [shopName, userId];

    if (checkStatusInItem) {
      dateFilter = `AND pu.created_at >= ? AND DATE(pu.created_at) <= ?`;
      params.push(startDate, endDate);
    }

    // ✅ Main query (parameterized)
    const query = `
      SELECT *
      FROM ${product_table} AS pu
      JOIN ${Wishlist_table} AS wt ON wt.wishlist_id = pu.wishlist_id
      JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
      WHERE u.shop_name = ?
        AND pu.referral_user_id = ?
        ${dateFilter}
    `;

    // ✅ Execute query
    const [result] = await database.query(query, params);

    // ✅ Return response
    res.status(200).json({ msg: "Wishlist item data fetched", mainResult: result });

  } catch (err) {
    console.error("❌ Error fetching wishlist item data:", err);
    logger?.error?.(err);
    res.status(500).json({ msg: "Internal Server Error", error: err });
  }
};


// export const getRefFromEmail = async (req, res) => {
//     database.query(
//         `SELECT referral_user_id FROM ${user_table} Where id = ${req.body.userId}`,
//         (err, result) => {
//             if (err) {
//                 logger.error(err);
//                 console.log("err", err);
//             } else {
//                 database.query(
//                     `SELECT email FROM ${user_table} Where id = ${result[0].referral_user_id}`,
//                     (err, result) => {
//                         if (err) {
//                             logger.error(err);
//                             console.log("err", err);
//                         } else {
//                             res.send({ email: result[0]?.email || [] });
//                         }
//                     }
//                 );

//             }
//         }
//     );
// };
export const getRefFromEmail = async (req, res) => {
  try {
    const { userId } = req.body;

    // ✅ Step 1: Get referral_user_id safely
    const [referralResult] = await database.query(
      `SELECT referral_user_id FROM ${user_table} WHERE id = ?`,
      [userId]
    );

    if (referralResult.length === 0 || !referralResult[0].referral_user_id) {
      return res.status(404).json({ msg: "Referral user not found", email: null });
    }

    const referralUserId = referralResult[0].referral_user_id;

    // ✅ Step 2: Get email of the referral user
    const [emailResult] = await database.query(
      `SELECT email FROM ${user_table} WHERE id = ?`,
      [referralUserId]
    );

    const email = emailResult.length > 0 ? emailResult[0].email : null;

    // ✅ Step 3: Send response
    res.status(200).json({ msg: "Referral email fetched", email });

  } catch (err) {
    console.error("❌ Error fetching referral email:", err);
    logger?.error?.(err);
    res.status(500).json({ msg: "Internal Server Error", error: err });
  }
};


// export const clearWishlistData = async (req, res) => {
//     database.query(
//         `DELETE pu.*  FROM  ${product_table} as pu , ${Wishlist_table} as wt , ${user_table} as u WHERE u.shop_name="${req.body.shopName}" AND u.id = wt.wishlist_user_id AND wt.wishlist_id = pu.wishlist_id AND u.id= ${req.body.wishlistId}`,
//         (err, result) => {
//             if (err) {
//                 console.log("errr", err);
//             } else {
//                 res.status(200).send({ msg: "deleted" });
//             }
//         }
//     );
// };
export const clearWishlistData = async (req, res) => {
  try {
    const { shopName, wishlistId } = req.body;

    // ✅ Safe, parameterized delete query
    const deleteQuery = `
      DELETE pu
      FROM ${product_table} AS pu
      JOIN ${Wishlist_table} AS wt ON pu.wishlist_id = wt.wishlist_id
      JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
      WHERE u.shop_name = ? AND u.id = ?
    `;

    const [result] = await database.query(deleteQuery, [shopName, wishlistId]);

    // ✅ Send success response
    res.status(200).json({
      msg: "deleted",
      affectedRows: result.affectedRows
    });

  } catch (err) {
    console.error("❌ Error clearing wishlist data:", err);
    logger?.error?.(err);
    res.status(500).json({ msg: "Internal Server Error", error: err });
  }
};


// export const getWishlistUsersData = async (req, res) => {
//     // console.log("res", req.body);
//     let query = "";
//     let cartQuery = "";
//     let itemQuery = "";
//     if (req.body.checkStatusInItem === true) {
//         query += `AND created_at >= "${req.body.startDate}" AND CAST(created_at as DATE) <= "${req.body.endDate}"`;
//         cartQuery += `AND w.created_at >= "${req.body.startDate}" AND CAST(w.created_at as DATE) <= "${req.body.endDate}"`;
//         itemQuery += `AND w.created_at >= "${req.body.startDate}" AND CAST(w.created_at as DATE) <= "${req.body.endDate}"`;
//     }

//     const userData = await new Promise((resolve, reject) => {
//         database.query(
//             `SELECT * FROM ${user_table} Where shop_name='${req.body.shopName}' ${query}`,
//             (err, result) => {
//                 if (err) {
//                     reject(err);
//                     logger.error(err);
//                 } else {
//                     resolve(result);
//                 }
//             }
//         );
//     });

//     const cartData = await new Promise((resolve, reject) => {
//         database.query(
//             `SELECT * FROM ${cart_table} as w, ${user_table} as u,  ${Wishlist_table} as wt WHERE u.id = wt.wishlist_user_id AND w.wishlist_id = wt.wishlist_id AND u.shop_name='${req.body.shopName}' ${cartQuery} GROUP BY u.id,w.variant_id ORDER BY w.id `,
//             (err, result) => {
//                 if (err) {
//                     reject(err);
//                     logger.error(err);
//                 } else {
//                     resolve(result);
//                 }
//             }
//         );
//     });

//     const wishlistItemData = await new Promise((resolve, reject) => {
//         database.query(
//             `SELECT * FROM ${product_table} as w, ${user_table} as u,  ${Wishlist_table} as wt WHERE u.id = wt.wishlist_user_id AND w.wishlist_id = wt.wishlist_id AND u.shop_name='${req.body.shopName}' ${itemQuery} GROUP BY u.id,w.variant_id ORDER BY w.id DESC;`,
//             (err, result) => {
//                 if (err) {
//                     reject(err);
//                     logger.error(err);
//                 } else {
//                     resolve(result);
//                 }
//             }
//         );
//     });

//     let results = [];

//     // Loop through array ab
//     for (let abItem of userData) {
//         let count = 0;
//         let cartCount = 0;

//         // Loop through array bc to count occurrences of abItem.id
//         for (let bcItem of wishlistItemData) {
//             if (abItem.id === bcItem.id) {
//                 count++;
//             }
//         }
//         for (let itemData of cartData) {
//             if (abItem.id === itemData.id) {
//                 cartCount++;
//             }
//         }
//         // If count is greater than 0, add abItem with count to result
//         // if (count > 0) {
//         let newItem = {
//             ...abItem,
//             wishlistItemCount: count,
//             cartTableCount: cartCount,
//         };
//         results.push(newItem);
//         // }
//     }

//     // console.log(results);

//     res.send({
//         mainResult: results,
//         userData,
//         cartData,
//         wishlistItemData,
//         results,
//     });
// };
export const getWishlistUsersData = async (req, res) => {
  try {
    const { shopName, checkStatusInItem, startDate, endDate } = req.body;

    let query = "";
    let cartQuery = "";
    let itemQuery = "";

    // ✅ Build dynamic date filters only if required
    if (checkStatusInItem === true) {
      query = `AND created_at >= ? AND CAST(created_at AS DATE) <= ?`;
      cartQuery = `AND w.created_at >= ? AND CAST(w.created_at AS DATE) <= ?`;
      itemQuery = `AND w.created_at >= ? AND CAST(w.created_at AS DATE) <= ?`;
    }

    // ✅ Query 1: Get all users
    const [userData] = await database.query(
      `SELECT * FROM ${user_table} WHERE shop_name = ? ${checkStatusInItem ? query : ""}`,
      checkStatusInItem ? [shopName, startDate, endDate] : [shopName]
    );

    // ✅ Query 2: Get cart data
    const [cartData] = await database.query(
      `SELECT * 
       FROM ${cart_table} AS w
       JOIN ${Wishlist_table} AS wt ON w.wishlist_id = wt.wishlist_id
       JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
       WHERE u.shop_name = ? ${checkStatusInItem ? cartQuery : ""}
       GROUP BY u.id, w.variant_id
       ORDER BY w.id`,
      checkStatusInItem ? [shopName, startDate, endDate] : [shopName]
    );

    // ✅ Query 3: Get wishlist item data
    const [wishlistItemData] = await database.query(
      `SELECT *
       FROM ${product_table} AS w
       JOIN ${Wishlist_table} AS wt ON w.wishlist_id = wt.wishlist_id
       JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
       WHERE u.shop_name = ? ${checkStatusInItem ? itemQuery : ""}
       GROUP BY u.id, w.variant_id
       ORDER BY w.id DESC`,
      checkStatusInItem ? [shopName, startDate, endDate] : [shopName]
    );

    // ✅ Process results
    const results = userData.map((user) => {
      const wishlistItemCount = wishlistItemData.filter((item) => item.id === user.id).length;
      const cartTableCount = cartData.filter((cart) => cart.id === user.id).length;

      return {
        ...user,
        wishlistItemCount,
        cartTableCount,
      };
    });

    // ✅ Send response
    res.status(200).json({
      mainResult: results,
      userData,
      cartData,
      wishlistItemData,
      results,
    });

  } catch (err) {
    console.error("❌ Error in getWishlistUsersData:", err);
    logger?.error?.(err);
    res.status(500).json({ msg: "Internal Server Error", error: err });
  }
};


// export const removeWishlistDataById = async (req, res) => {
//     const { shopName, wishlistId, userTableId, checkStatusInItem, variantId } =
//         req.body;
//     let query = "";
//     if (checkStatusInItem === true) {
//         query += `AND u.created_at >= "${req.body.startDate}" AND CAST(u.created_at as DATE) <= "${req.body.endDate}"`;
//     }

//     database.query(
//         `DELETE wi FROM ${product_table} wi JOIN ${Wishlist_table} wt ON wi.wishlist_id = wt.wishlist_id JOIN ${user_table} wu ON wt.wishlist_user_id = wu.id WHERE wu.shop_name = "${shopName}" AND wu.id = ${userTableId} AND wi.variant_id = ${variantId}`,
//         async (err, result) => {
//             if (err) {
//                 console.log("err", err);
//             } else {
//                 const productResult = await new Promise((resolve, reject) => {
//                     database.query(
//                         `SELECT wt.wishlist_name, SUM(w.quantity) as total_quantity, w.* FROM ${product_table} as w, ${user_table} as u,  ${Wishlist_table} as wt WHERE u.id = wt.wishlist_user_id AND w.wishlist_id = wt.wishlist_id AND u.shop_name='${shopName}' AND wt.wishlist_user_id = ${userTableId} ${query} GROUP BY w.variant_id ORDER BY w.id DESC;`,
//                         (err, result) => {
//                             if (err) {
//                                 reject(err);
//                                 logger.error(err);
//                             } else {
//                                 resolve(result);
//                             }
//                         }
//                     );
//                 });
//                 res.status(200).send({ productResult: productResult });
//             }
//         }
//     );
// };
export const removeWishlistDataById = async (req, res) => {
  try {
    const {
      shopName,
      wishlistId,
      userTableId,
      checkStatusInItem,
      variantId,
      startDate,
      endDate,
    } = req.body;

    let dateFilter = "";
    const params = [shopName, userTableId, variantId];

    if (checkStatusInItem === true) {
      dateFilter = `AND u.created_at >= ? AND CAST(u.created_at AS DATE) <= ?`;
      params.push(startDate, endDate);
    }

    // ✅ Delete specific wishlist product
    const deleteQuery = `
      DELETE wi 
      FROM ${product_table} wi
      JOIN ${Wishlist_table} wt ON wi.wishlist_id = wt.wishlist_id
      JOIN ${user_table} wu ON wt.wishlist_user_id = wu.id
      WHERE wu.shop_name = ? 
        AND wu.id = ? 
        AND wi.variant_id = ?
      ${dateFilter}
    `;

    const [deleteResult] = await database.query(deleteQuery, params);

    // ✅ Fetch updated product data after deletion
    const selectParams = [shopName, userTableId];
    let selectDateFilter = "";

    if (checkStatusInItem === true) {
      selectDateFilter = `AND u.created_at >= ? AND CAST(u.created_at AS DATE) <= ?`;
      selectParams.push(startDate, endDate);
    }

    const selectQuery = `
      SELECT 
        wt.wishlist_name, 
        SUM(w.quantity) AS total_quantity, 
        w.* 
      FROM ${product_table} AS w
      JOIN ${Wishlist_table} AS wt ON w.wishlist_id = wt.wishlist_id
      JOIN ${user_table} AS u ON wt.wishlist_user_id = u.id
      WHERE 
        u.shop_name = ? 
        AND wt.wishlist_user_id = ?
        ${selectDateFilter}
      GROUP BY w.variant_id 
      ORDER BY w.id DESC;
    `;

    const [productResult] = await database.query(selectQuery, selectParams);

    res.status(200).json({
      msg: "Wishlist item deleted successfully",
      productResult,
    });
  } catch (err) {
    console.error("❌ Error in removeWishlistDataById:", err);
    logger?.error?.(err);
    res.status(500).json({ msg: "Internal Server Error", error: err });
  }
};


// export const getWishlistItemData = async (req, res) => {
//     let query = "";
//     if (req.body.checkStatusInItem === true) {
//         query += `AND pu.created_at >= "${req.body.startDate}" AND CAST(pu.created_at as DATE) <= "${req.body.endDate}"`;
//     }

//     database.query(
//         `SELECT  *  FROM ${product_table} AS pu , ${Wishlist_table} AS wt , ${user_table} AS u WHERE u.id = wt.wishlist_user_id AND wt.wishlist_id = pu.wishlist_id AND shop_name='${req.body.shopName}' ${query}`,
//         (err, result) => {
//             if (err) {
//                 logger.error(err);
//                 console.log("err", err);
//             } else {
//                 res.send({ mainResult: result });
//             }
//         }
//     );
// };
export const getWishlistItemData = async (req, res) => {
  try {
    const { shopName, checkStatusInItem, startDate, endDate } = req.body;

    let dateFilter = "";
    const params = [shopName];

    if (checkStatusInItem === true) {
      dateFilter = `AND pu.created_at >= ? AND CAST(pu.created_at AS DATE) <= ?`;
      params.push(startDate, endDate);
    }

    const query = `
      SELECT pu.*, wt.*, u.*
      FROM ${product_table} AS pu
      JOIN ${Wishlist_table} AS wt ON wt.wishlist_id = pu.wishlist_id
      JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
      WHERE u.shop_name = ?
      ${dateFilter}
    `;

    const [result] = await database.query(query, params);

    res.status(200).json({
      msg: "Wishlist item data fetched successfully",
      mainResult: result,
    });
  } catch (err) {
    console.error("❌ Error in getWishlistItemData:", err);
    logger?.error?.(err);
    res.status(500).json({
      msg: "Internal Server Error",
      error: err,
    });
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

// export const getThemeData = async (req, res) => {
//     const fixedInput1 = fixBase64Padding(req.body.themeName);
//     const themeName = atob(fixedInput1);
//     const fixedInput2 = fixBase64Padding(req.body.filter);
//     const filter = atob(fixedInput2);
//     const customSettings = req.body?.customSettings ? req.body?.customSettings : {
//         gridElement: "",
//         productLink: "",
//         appendIcon: "",
//         appendIconCheck: "",
//         afterIcon: "",
//         buttonPrependBeforeElemnt: ""
//     };

//     try {
//         const themeDetails = detectThemeName(themeName, filter, customSettings);
//         if (themeDetails) {
//             // console.log("*********[Before satatus server Response]**************************" + Date.now())
//             res.status(200).json(themeDetails);
//             // console.log("*********[server Response] after [statu]**************************" + Date.now())
//         } else {
//             res.status(404).send("Theme name not found");
//         }
//     } catch (error) {
//         res.status(500).send("An error occurred while detecting the theme name");
//     }
// };
export const getThemeData = async (req, res) => {
  try {
    const { themeName: encodedThemeName, filter: encodedFilter, customSettings } = req.body;

    if (!encodedThemeName || !encodedFilter) {
      return res.status(400).json({ error: "Missing themeName or filter in request body" });
    }

    // Decode base64-encoded values safely
    const fixedThemeName = fixBase64Padding(encodedThemeName);
    const themeName = atob(fixedThemeName);

    const fixedFilter = fixBase64Padding(encodedFilter);
    const filter = atob(fixedFilter);

    // Use default customSettings if not provided
    const settings = customSettings || {
      gridElement: "",
      productLink: "",
      appendIcon: "",
      appendIconCheck: "",
      afterIcon: "",
      buttonPrependBeforeElemnt: ""
    };

    // Detect theme details
    const themeDetails = detectThemeName(themeName, filter, settings);

    if (!themeDetails) {
      return res.status(404).json({ error: "Theme name not found" });
    }

    // Success
    return res.status(200).json(themeDetails);

  } catch (error) {
    console.error("❌ Error in getThemeData:", error);
    logger?.error?.(error);
    return res.status(500).json({ error: "An error occurred while detecting the theme name" });
  }
};


// export const getWishlistCartData = async (req, res) => {
//     let query = "";
//     if (req.body.checkStatusInItem === true) {
//         query += `AND c.created_at >= "${req.body.startDate}" AND CAST(c.created_at as DATE) <= "${req.body.endDate}"`;
//     }

//     database.query(
//         `SELECT count(c.id) as total_count,  SUM(c.quantity) as total_quantity, c.variant_id ,wt.wishlist_id,wt.wishlist_user_id, u.user_type, u.email , c.*  FROM ${cart_table} as c,${user_table} as u, ${Wishlist_table} as wt WHERE u.id = wt.wishlist_user_id AND wt.wishlist_id = c.wishlist_id AND shop_name='${req.body.shopName}' ${query} GROUP By  c.variant_id, wt.wishlist_user_id ORDER BY c.id DESC`,
//         (err, result) => {
//             if (err) {
//                 logger.error(err);
//                 console.log("err", err);
//             } else {
//                 res.send({ mainResult: result, data: result });
//             }
//         }
//     );
// };
export const getWishlistCartData = async (req, res) => {
  try {
    const { shopName, checkStatusInItem, startDate, endDate } = req.body;

    let dateFilter = "";
    const params = [shopName];

    if (checkStatusInItem === true) {
      dateFilter = `AND c.created_at >= ? AND CAST(c.created_at AS DATE) <= ?`;
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        COUNT(c.id) AS total_count,
        SUM(c.quantity) AS total_quantity,
        c.variant_id,
        wt.wishlist_id,
        wt.wishlist_user_id,
        u.user_type,
        u.email,
        c.*
      FROM ${cart_table} AS c
      JOIN ${Wishlist_table} AS wt ON wt.wishlist_id = c.wishlist_id
      JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
      WHERE u.shop_name = ?
      ${dateFilter}
      GROUP BY c.variant_id, wt.wishlist_user_id
      ORDER BY c.id DESC
    `;

    /*
    const query = `
      SELECT 
        COUNT(c.id) AS total_count,
        SUM(c.quantity) AS total_quantity,
        c.variant_id,
        wt.wishlist_id,
        wt.wishlist_user_id,
        u.user_type,
        u.email,
        c.*
      FROM ${cart_table} AS c
      JOIN ${Wishlist_table} AS wt ON wt.wishlist_id = c.wishlist_id
      JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
      WHERE u.shop_name = ?
      ${dateFilter}
      GROUP BY c.variant_id, wt.wishlist_id, wt.wishlist_user_id, u.user_type, u.email, c.id
      ORDER BY c.id DESC
    `;*/

    const [result] = await database.query(query, params);

    res.status(200).json({
      msg: "Wishlist cart data fetched successfully",
      mainResult: result,
      data: result,
    });
  } catch (err) {
    console.error("❌ Error in getWishlistCartData:", err);
    logger?.error?.(err);
    res.status(500).json({
      msg: "Internal Server Error",
      error: err,
    });
  }
};


// export const getCurrentUserWishlistData = async (req, res) => {
//     try {
//         let lastQuery = "";
//         let query = "";
//         const { startDate, endDate, wishlistId, shopName, checkStatusInItem } =
//             req.body;

//         if (checkStatusInItem === true) {
//             query += `AND w.created_at >= "${startDate}" AND CAST(w.created_at as DATE) <= "${endDate}"`;
//             lastQuery += `AND w.created_at >= "${startDate}" AND CAST(w.created_at as DATE) <= "${endDate}"`;
//         }

//         // Get user data
//         const userResult = await new Promise((resolve, reject) => {
//             database.query(
//                 `SELECT * FROM ${user_table} WHERE id = ${wishlistId} AND shop_name = '${shopName}'`,
//                 (err, result) => {
//                     if (err) {
//                         logger.error(err);
//                         reject(err);
//                     } else {
//                         resolve(result);
//                     }
//                 }
//             );
//         });

//         // Get wishlist data
//         const wishlistData = await new Promise((resolve, reject) => {
//             database.query(
//                 `SELECT wt.wishlist_id AS id, wt.wishlist_name AS name FROM ${Wishlist_table} AS wt , ${user_table} AS u  WHERE u.shop_name = '${shopName}' AND u.id = wt.wishlist_user_id AND u.id = ${wishlistId}`,
//                 (err, result) => {
//                     if (err) {
//                         logger.error(err);
//                         reject(err);
//                     } else {
//                         resolve(result);
//                     }
//                 }
//             );
//         });

//         const mainArr = [{ label: "All", value: "all" }];
//         const optionArray = mainArr.concat(
//             wishlistData.map((dev) => ({
//                 label: capitalizeFirstLetter(dev.name),
//                 value: dev.name,
//             }))
//         );

//         const productResult = await new Promise((resolve, reject) => {
//             database.query(
//                 `SELECT wt.wishlist_name, w.quantity as total_quantity, w.* FROM ${product_table} as w, ${user_table} as u,  ${Wishlist_table} as wt WHERE u.id = wt.wishlist_user_id AND w.wishlist_id = wt.wishlist_id AND u.shop_name='${shopName}' AND wt.wishlist_user_id = ${wishlistId} ${query} ORDER BY w.id DESC;`,
//                 (err, result) => {
//                     if (err) {
//                         logger.error(err);
//                         reject(err);
//                     } else {
//                         resolve(result);
//                     }
//                 }
//             );
//         });

//         // Get cart data
//         const cartData = await new Promise((resolve, reject) => {
//             database.query(
//                 `SELECT wt.wishlist_name, SUM(w.quantity) as total_quantity, w.* FROM ${cart_table} as w, ${user_table} as u,  ${Wishlist_table} as wt WHERE u.id = wt.wishlist_user_id AND w.wishlist_id = wt.wishlist_id AND u.shop_name='${shopName}' AND wt.wishlist_user_id = ${wishlistId} ${lastQuery} GROUP BY w.variant_id ORDER BY w.id DESC;`,
//                 (err, result) => {
//                     if (err) {
//                         logger.error(err);
//                         reject(err);
//                     } else {
//                         resolve(result);
//                     }
//                 }
//             );
//         });

//         //Get Cart Count
//         const cartCount = await new Promise((resolve, reject) => {
//             database.query(
//                 `SELECT wt.wishlist_name, SUM(w.quantity) as total_quantity, w.* FROM ${cart_table} as w, ${user_table} as u,  ${Wishlist_table} as wt WHERE u.id = wt.wishlist_user_id AND w.wishlist_id = wt.wishlist_id AND u.shop_name='${shopName}' AND wt.wishlist_user_id = ${wishlistId} GROUP BY w.variant_id ORDER BY w.id DESC;`,
//                 (err, result) => {
//                     if (err) {
//                         logger.error(err);
//                         reject(err);
//                     } else {
//                         resolve(result);
//                     }
//                 }
//             );
//         });

//         // Get product count
//         const productCount = await new Promise((resolve, reject) => {
//             database.query(
//                 `SELECT wt.wishlist_name, SUM(w.quantity) as total_quantity, w.* FROM ${product_table} as w, ${user_table} as u,  ${Wishlist_table} as wt WHERE u.id = wt.wishlist_user_id AND w.wishlist_id = wt.wishlist_id AND u.shop_name='${shopName}' AND wt.wishlist_user_id = ${wishlistId} GROUP BY w.variant_id, wt.wishlist_name ORDER BY w.id DESC;`,
//                 (err, result) => {
//                     if (err) {
//                         logger.error(err);
//                         reject(err);
//                     } else {
//                         resolve(result);
//                     }
//                 }
//             );
//         });
//         // console.log("productResult",productResult);
//         res.send({
//             productResult,
//             itemCount: productCount,
//             userResult,
//             optionArray,
//             cartData,
//             wishlistData,
//             cartResultCount: cartCount,
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).send("Internal Server Error");
//     }
// };
export const getCurrentUserWishlistData = async (req, res) => {
  try {
    const { startDate, endDate, wishlistId, shopName, checkStatusInItem } = req.body;

    let dateFilter = "";
    let dateFilterCart = "";
    const params = [shopName, wishlistId];

    if (checkStatusInItem === true) {
      dateFilter = `AND w.created_at >= ? AND CAST(w.created_at AS DATE) <= ?`;
      dateFilterCart = `AND w.created_at >= ? AND CAST(w.created_at AS DATE) <= ?`;
      params.push(startDate, endDate);
    }

    // ✅ Get user data
    const [userResult] = await database.query(
      `SELECT * FROM ${user_table} WHERE id = ? AND shop_name = ?`,
      [wishlistId, shopName]
    );

    // ✅ Get wishlist data
    const [wishlistData] = await database.query(
      `SELECT wt.wishlist_id AS id, wt.wishlist_name AS name
       FROM ${Wishlist_table} AS wt
       JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
       WHERE u.shop_name = ? AND u.id = ?`,
      [shopName, wishlistId]
    );

    // ✅ Build options array
    const mainArr = [{ label: "All", value: "all" }];
    const optionArray = mainArr.concat(
      wishlistData.map((item) => ({
        label: capitalizeFirstLetter(item.name),
        value: item.name,
      }))
    );

    // ✅ Get wishlist product data
    const productQueryParams = [shopName, wishlistId];
    if (checkStatusInItem) productQueryParams.push(startDate, endDate);

    const [productResult] = await database.query(
      `SELECT wt.wishlist_name, w.quantity AS total_quantity, w.*
       FROM ${product_table} AS w
       JOIN ${Wishlist_table} AS wt ON w.wishlist_id = wt.wishlist_id
       JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
       WHERE u.shop_name = ? AND wt.wishlist_user_id = ?
       ${dateFilter}
       ORDER BY w.id DESC`,
      productQueryParams
    );

    // ✅ Get cart data
    const cartQueryParams = [shopName, wishlistId];
    if (checkStatusInItem) cartQueryParams.push(startDate, endDate);

    const [cartData] = await database.query(
      `SELECT wt.wishlist_name, SUM(w.quantity) AS total_quantity, w.*
       FROM ${cart_table} AS w
       JOIN ${Wishlist_table} AS wt ON w.wishlist_id = wt.wishlist_id
       JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
       WHERE u.shop_name = ? AND wt.wishlist_user_id = ?
       ${dateFilterCart}
       GROUP BY w.variant_id
       ORDER BY w.id DESC`,
      cartQueryParams
    );

    // ✅ Get cart count
    const [cartCount] = await database.query(
      `SELECT wt.wishlist_name, SUM(w.quantity) AS total_quantity, w.*
       FROM ${cart_table} AS w
       JOIN ${Wishlist_table} AS wt ON w.wishlist_id = wt.wishlist_id
       JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
       WHERE u.shop_name = ? AND wt.wishlist_user_id = ?
       GROUP BY w.variant_id
       ORDER BY w.id DESC`,
      [shopName, wishlistId]
    );

    // ✅ Get product count
    const [productCount] = await database.query(
      `SELECT wt.wishlist_name, SUM(w.quantity) AS total_quantity, w.*
       FROM ${product_table} AS w
       JOIN ${Wishlist_table} AS wt ON w.wishlist_id = wt.wishlist_id
       JOIN ${user_table} AS u ON u.id = wt.wishlist_user_id
       WHERE u.shop_name = ? AND wt.wishlist_user_id = ?
       GROUP BY w.variant_id, wt.wishlist_name
       ORDER BY w.id DESC`,
      [shopName, wishlistId]
    );

    // ✅ Final response
    res.status(200).json({
      msg: "User wishlist data fetched successfully",
      productResult,
      itemCount: productCount,
      userResult,
      optionArray,
      cartData,
      wishlistData,
      cartResultCount: cartCount,
    });
  } catch (error) {
    console.error("❌ Error in getCurrentUserWishlistData:", error);
    logger?.error?.(error);
    res.status(500).json({ msg: "Internal Server Error", error });
  }
};


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// export const cartItemRecord = async (req, res) => {
//     try {
//         const dataArr = req.body;

//         const promises = dataArr.map(async (item) => {
//             // const existingCartItem = await checkCartItem(item);
//             // if (existingCartItem.length > 0) {
//             //   await updateCartItem(item);
//             // } else {

//             const data = { body: item }
//             const newPrice = await getProductPrice(data, res);
//             const updatedItem = {
//                 ...item,
//                 price: newPrice || item.price,
//             };
//             await insertCartItem(updatedItem);

//             // await insertCartItem(item);

//             // }
//         });
//         await Promise.all(promises);
//         res.json({ msg: "Cart items processed" });
//     } catch (error) {
//         console.error(error);
//         logger.error(error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };
export const cartItemRecord = async (req, res) => {
    try {
        const dataArr = req.body;

        if (!Array.isArray(dataArr) || dataArr.length === 0) {
            return res.status(400).json({ error: "No cart data provided" });
        }

        const promises = dataArr.map(async (item) => {
            try {
                const newPrice = await getProductPrice({ body: item }, res);

                const updatedItem = {
                    ...item,
                    price: newPrice ?? item.price, // use nullish coalescing
                };

                await insertCartItem(updatedItem);
            } catch (err) {
                logger.error(`Error processing cart item: ${item.variant_id}`, err);
            }
        });

        await Promise.all(promises);

        res.status(200).json({ msg: "Cart items processed successfully" });
    } catch (error) {
        logger.error("cartItemRecord error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// const insertCartItem = (item) => {
//     const itemTitle = item.title
//         .replace(/\/wg-sgl/g, "'")
//         .replace(/\/wg-dbl/g, '"');

//     return new Promise((resolve, reject) => {
//         const insertCartItemQuery = `INSERT INTO ${cart_table} (wishlist_id, variant_id, product_id, title, price, image, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)`;
//         const values = [
//             item.userId,
//             item.variantId,
//             item.productId,
//             itemTitle,
//             item.price,
//             item.image,
//             item.quantity,
//         ];
//         database.query(insertCartItemQuery, values, (err, result) => {
//             if (err) {
//                 logger.error(err);
//                 reject(err);
//             } else {
//                 resolve(result);
//             }
//         });
//     });
// };



// export const getProductCountData = async (req, res) => {
//     const { customerEmail, currentToken, shopName, productId } = req.body
//     const tokenResult = await new Promise((resolve, reject) => {
//         database.query(`SELECT * FROM ${social_like_table} WHERE email='${currentToken}'`, (err, result) => {
//             if (err) return reject(err);
//             resolve(result);
//         });
//     });

//     const emailResult = await new Promise((resolve, reject) => {
//         database.query(`SELECT * from ${social_like_table} where email='${customerEmail}'`, (err, result) => {
//             if (err) return reject(err);
//             resolve(result);
//         });
//     });


//     if (tokenResult.length > 0) {

//         if (emailResult.length === 0 && customerEmail === "") {
//             database.query(`SELECT COUNT(social_like_id ) AS total_count from ${social_like_table} WHERE shop_name = '${shopName}' AND product_id = ${productId}`, (err, countResult1) => {
//                 if (err) {
//                     console.log("err", err);
//                 } else {
//                     if (countResult1.length > 0) {

//                         res.send({ data: countResult1[0]?.total_count, msg: "getting_data" });
//                     } else {
//                         res.send({ data: countResult1[0]?.total_count, msg: "getting_data" });

//                     }
//                 }
//             })
//         }
//         // ----------------ess email ka db mein record nhi hai---------------------------
//         else if (emailResult.length === 0 && customerEmail !== "") {
//             const updateProduct = (product) => {
//                 return new Promise((resolve, reject) => {
//                     database.query(`UPDATE ${social_like_table} SET email = ? WHERE social_like_id = ?`,
//                         [customerEmail, product.social_like_id],
//                         (err, result) => {
//                             if (err) {
//                                 console.error("Error updating product:", err);
//                                 return reject(err);
//                             }
//                             // console.log("Product updated with ID:", product.social_like_id);
//                             resolve(result);
//                         });
//                 });
//             };

//             await Promise.all(tokenResult.map(updateProduct));

//             try {
//                 const countResult1 = await new Promise((resolve, reject) => {
//                     database.query(`SELECT COUNT(social_like_id ) AS total_count from ${social_like_table} WHERE shop_name = '${shopName}' AND product_id = ${productId}`, (err, result) => {
//                         if (err) {
//                             console.log("Error retrieving data:", err);
//                             return reject(err);
//                         }
//                         resolve(result);
//                     });
//                 });

//                 if (countResult1.length > 0) {
//                     res.send({ data: countResult1[0]?.total_count, msg: "getting_data" });
//                 } else {
//                     res.send({ data: countResult1[0]?.total_count, msg: "getting_data" });

//                 }
//             } catch (err) {
//                 return res.status(500).send("Error retrieving data");
//             }
//         }
//         // ----------------ess email db mein record hai---------------------------
//         else {
//             if (emailResult.length > 0 && customerEmail !== "") {
//                 const matchedProducts = tokenResult.filter(product1 =>
//                     emailResult.some(product2 => product2.product_id === product1.product_id)
//                 );
//                 const unmatchedProducts = tokenResult.filter(product1 =>
//                     !emailResult.some(product2 => product2.product_id === product1.product_id)
//                 );

//                 if (matchedProducts.length > 0) {
//                     const deleteProduct = (product) => {
//                         return new Promise((resolve, reject) => {
//                             database.query(`DELETE FROM ${social_like_table} WHERE social_like_id = ?`, [product.social_like_id], (err, result) => {
//                                 if (err) {
//                                     console.error("Error deleting product:", err);
//                                     return reject(err);
//                                 }
//                                 resolve(result);
//                             });
//                         });
//                     };
//                     await Promise.all(matchedProducts.map(deleteProduct));
//                 } else {
//                     if (unmatchedProducts > 0) {
//                         const updateProduct = (product) => {
//                             return new Promise((resolve, reject) => {
//                                 database.query(`UPDATE ${social_like_table} SET email = ? WHERE social_like_id = ?`,
//                                     [customerEmail, product.social_like_id],
//                                     (err, result) => {
//                                         if (err) {
//                                             console.error("Error updating product:", err);
//                                             return reject(err);
//                                         }
//                                         resolve(result);
//                                     });
//                             });
//                         };

//                         await Promise.all(unmatchedProducts.map(updateProduct));
//                     }
//                 }

//                 try {
//                     const countResult1 = await new Promise((resolve, reject) => {
//                         database.query(`SELECT COUNT(social_like_id ) AS total_count from ${social_like_table} WHERE shop_name = '${shopName}' AND product_id = ${productId}`, (err, result) => {
//                             if (err) {
//                                 console.log("Error retrieving data:", err);
//                                 return reject(err);
//                             }
//                             resolve(result);
//                         });
//                     });

//                     if (countResult1.length > 0) {
//                         res.send({ data: countResult1[0]?.total_count, msg: "getting_data" });
//                     } else {
//                         res.send({ data: countResult1[0]?.total_count, msg: "getting_data" });
//                     }
//                 } catch (err) {
//                     return res.status(500).send("Error retrieving data");
//                 }
//             }
//         }
//     } else {
//         if (emailResult.length > 0) {
//             database.query(`SELECT COUNT(social_like_id ) AS total_count from ${social_like_table} WHERE shop_name = '${shopName}' AND product_id = ${productId}`, (err, countResult1) => {
//                 if (err) {
//                     console.log("err", err);
//                 } else {
//                     if (countResult1.length > 0) {
//                         res.send({ data: countResult1[0]?.total_count, msg: "getting_data" });
//                     } else {
//                         res.send({ data: countResult1[0]?.total_count, msg: "getting_data" });
//                     }
//                 }
//             })
//         } else {
//             database.query(`SELECT COUNT(social_like_id ) AS total_count from ${social_like_table} WHERE shop_name = '${shopName}' AND product_id = ${productId}`, (err, countResult1) => {
//                 if (err) {
//                     console.log("err", err);
//                 } else {
//                     if (countResult1.length > 0) {
//                         res.send({ data: countResult1[0]?.total_count, msg: "getting_data" });
//                     } else {
//                         res.send({ data: countResult1[0]?.total_count, msg: "getting_data" });
//                     }
//                 }
//             })
//         }
//     }
// };
const insertCartItem = async (item) => {
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

    return result; // optional: return result.insertId or result.affectedRows if needed
  } catch (err) {
    logger.error("❌ insertCartItem error:", err);
    throw err; // rethrow so caller can handle it
  }
};


// export const getProductCountData = async (req, res) => {
//   try {
//     const { customerEmail = "", currentToken, shopName, productId } = req.body;

//     const getRows = (query, params = []) =>
//       new Promise((resolve, reject) => {
//         database.query(query, params, (err, result) => {
//           if (err) return reject(err);
//           resolve(result);
//         });
//       });

//     // Fetch records
//     const tokenResult = await getRows(
//       `SELECT * FROM ${social_like_table} WHERE email = ?`,
//       [currentToken]
//     );
//     const emailResult = await getRows(
//       `SELECT * FROM ${social_like_table} WHERE email = ?`,
//       [customerEmail]
//     );

//     // Helper to get total like count
//     const getLikeCount = async () => {
//       const countRows = await getRows(
//         `SELECT COUNT(social_like_id) AS total_count 
//          FROM ${social_like_table} 
//          WHERE shop_name = ? AND product_id = ?`,
//         [shopName, productId]
//       );
//       return countRows[0]?.total_count || 0;
//     };

//     // CASE 1: Token record exists
//     if (tokenResult.length > 0) {
//       // 1A: No email record and no customer email
//       if (emailResult.length === 0 && customerEmail === "") {
//         return res.send({
//           data: await getLikeCount(),
//           msg: "getting_data",
//         });
//       }

//       // 1B: No email record but email provided — update token entries
//       if (emailResult.length === 0 && customerEmail !== "") {
//         const updatePromises = tokenResult.map((row) =>
//           getRows(
//             `UPDATE ${social_like_table} SET email = ? WHERE social_like_id = ?`,
//             [customerEmail, row.social_like_id]
//           )
//         );
//         await Promise.all(updatePromises);
//         return res.send({
//           data: await getLikeCount(),
//           msg: "getting_data",
//         });
//       }

//       // 1C: Email record exists
//       if (emailResult.length > 0 && customerEmail !== "") {
//         const matched = tokenResult.filter((t) =>
//           emailResult.some((e) => e.product_id === t.product_id)
//         );
//         const unmatched = tokenResult.filter(
//           (t) => !emailResult.some((e) => e.product_id === t.product_id)
//         );

//         // Delete matched products (duplicates)
//         if (matched.length > 0) {
//           await Promise.all(
//             matched.map((m) =>
//               getRows(`DELETE FROM ${social_like_table} WHERE social_like_id = ?`, [
//                 m.social_like_id,
//               ])
//             )
//           );
//         }

//         // Update unmatched products (merge token → email)
//         if (unmatched.length > 0) {
//           await Promise.all(
//             unmatched.map((u) =>
//               getRows(
//                 `UPDATE ${social_like_table} SET email = ? WHERE social_like_id = ?`,
//                 [customerEmail, u.social_like_id]
//               )
//             )
//           );
//         }

//         return res.send({
//           data: await getLikeCount(),
//           msg: "getting_data",
//         });
//       }
//     }

//     // CASE 2: Token record doesn’t exist
//     return res.send({
//       data: await getLikeCount(),
//       msg: "getting_data",
//     });
//   } catch (err) {
//     console.error("Error in getProductCountData:", err);
//     logger.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// };
export const getProductCountData = async (req, res) => {
  try {
    const { customerEmail = "", currentToken, shopName, productId } = req.body;

    // Helper to query DB directly (mysql2/promise handles async natively)
    const getRows = async (query, params = []) => {
      const [rows] = await database.query(query, params);
      return rows;
    };

    // Fetch records
    const tokenResult = await getRows(
      `SELECT * FROM ${social_like_table} WHERE email = ?`,
      [currentToken]
    );

    const emailResult = await getRows(
      `SELECT * FROM ${social_like_table} WHERE email = ?`,
      [customerEmail]
    );

    // Helper to get total like count
    const getLikeCount = async () => {
      const [countRows] = await database.query(
        `SELECT COUNT(social_like_id) AS total_count
         FROM ${social_like_table}
         WHERE shop_name = ? AND product_id = ?`,
        [shopName, productId]
      );
      return countRows?.[0]?.total_count || 0;
    };

    // CASE 1: Token record exists
    if (tokenResult.length > 0) {
      // 1A: No email record and no customer email
      if (emailResult.length === 0 && customerEmail === "") {
        return res.send({
          data: await getLikeCount(),
          msg: "getting_data",
        });
      }

      // 1B: No email record but email provided — update token entries
      if (emailResult.length === 0 && customerEmail !== "") {
        await Promise.all(
          tokenResult.map((row) =>
            database.query(
              `UPDATE ${social_like_table} SET email = ? WHERE social_like_id = ?`,
              [customerEmail, row.social_like_id]
            )
          )
        );

        return res.send({
          data: await getLikeCount(),
          msg: "getting_data",
        });
      }

      // 1C: Email record exists
      if (emailResult.length > 0 && customerEmail !== "") {
        const matched = tokenResult.filter((t) =>
          emailResult.some((e) => e.product_id === t.product_id)
        );
        const unmatched = tokenResult.filter(
          (t) => !emailResult.some((e) => e.product_id === t.product_id)
        );

        // Delete matched products (duplicates)
        if (matched.length > 0) {
          await Promise.all(
            matched.map((m) =>
              database.query(
                `DELETE FROM ${social_like_table} WHERE social_like_id = ?`,
                [m.social_like_id]
              )
            )
          );
        }

        // Update unmatched products (merge token → email)
        if (unmatched.length > 0) {
          await Promise.all(
            unmatched.map((u) =>
              database.query(
                `UPDATE ${social_like_table} SET email = ? WHERE social_like_id = ?`,
                [customerEmail, u.social_like_id]
              )
            )
          );
        }

        return res.send({
          data: await getLikeCount(),
          msg: "getting_data",
        });
      }
    }

    // CASE 2: Token record doesn’t exist
    return res.send({
      data: await getLikeCount(),
      msg: "getting_data",
    });
  } catch (err) {
    console.error("❌ Error in getProductCountData:", err);
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

// function databaseQuery(query) {
//     return new Promise((resolve, reject) => {
//         database.query(query, (err, result) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(result);
//             }
//         });
//     });
// }

// do not remove this api in any condition this it the all health checker in case of app stop
// export async function getShopData(shop) {
//   try {
//     const query = `SELECT * FROM ${app_installation_table} WHERE shop_name = ?`;
//     const [rows] = await database.query(query, [shop]);
//     return rows;
//   } catch (err) {
//     throw err;
//   }
// }


export const apiHealthChecker = async (req, res) => {
    res.status(200).send('OK');
};



// function getShopData(shop) {
//     return new Promise((resolve, reject) => {
//         const query = `SELECT * FROM ${app_installation_table} WHERE shop_name = ?`;

//         database.query(query, [shop], (err, result) => {
//             if (err) {
//                 reject(err); // Reject the promise with an error
//             } else {
//                 resolve(result); // Resolve the promise with the result
//             }
//         });
//     });
// }



// ----------------import/add data from csv file and the instruction to use it----------------
// demoURL = http://localhost:5000/save-data-to-sql?store=randeep-singh-webframez.myshopify.com
// permanentDomain should be as store as params
// ------------- this is method number one ---- to import data using product id-------------
export async function getShopData(shop) {
  try {
    const query = `SELECT * FROM ${app_installation_table} WHERE shop_name = ?`;
    const [rows] = await database.query(query, [shop]);
    return rows;
  } catch (err) {
    throw err;
  }
}


// export const saveDataToSql = async (req, res) => {
//     const storeName = req?.query?.store;
//     const session = await getShopData(storeName);
//     const shopifyNodes = new shopifyNode({
//         shopName: storeName,
//         accessToken: session[0].access_token
//     });

//     await fetchAllProducts(shopifyNodes).then((allData) => {

//         // console.log("allData ===== ", allData)

//         // console.log("VVVVV 1111", allData[0])
//         // console.log("VVVVV  2222 ", allData.length)
//         // console.log("VVVVV  3333 ", allData[0].variants.nodes)
//         // console.log("VVVVV  4444 ", allData[0].images.nodes)

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


// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const saveDataToSql = async (req, res) => {
  try {
    const storeName = req?.query?.store;
    const session = await getShopData(storeName);

    const shopifyNodes = new shopifyNode({
      shopName: storeName,
      accessToken: session[0].access_token,
    });

    const allData = await fetchAllProducts(shopifyNodes);
    const allProductArr = allData;

    const rows = [];

    fs.createReadStream("prem.csv")
      .pipe(csv())
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", async () => {
        try {
          for (const [index, row] of rows.entries()) {
            console.log("Processing row:", index, row);

            const findDataWithProductId = allProductArr.find(
              (aa) => Number(aa?.id?.split("/").pop()) === Number(row.product_id)
            );

            if (!findDataWithProductId) continue;

            const emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            const checkEmail = emailRegEx.test(row.email);
            if (!checkEmail) continue;

            const sendData = {
              body: {
                shopName: "premiom-oi.myshopify.com",
                plan: 3,
                guestToken: "",
                customerEmail: row.email,
                productId: findDataWithProductId?.id?.split("/").pop(),
                variantId:
                  row?.variantId ||
                  findDataWithProductId?.variants?.nodes[0]?.id
                    ?.split("/")
                    .pop(),
                price: findDataWithProductId?.variants?.nodes[0]?.price,
                handle: findDataWithProductId?.handle,
                title: findDataWithProductId?.title,
                image: findDataWithProductId.images.nodes[0]?.url,
                quantity: 1,
                storeName: "Premiom-OI",
                language: "https://premiom-oi.pro/",
                wishlistName: ["favourites"],
                wfGetDomain: "https://premiom-oi.pro/",
                specificVariant: null,
                productOption: null,
              },
            };

            // ---- Query user ----
            const [existingUser] = await database.query(
              `SELECT id FROM ${user_table} WHERE shop_name = ? AND email = ?`,
              [sendData.body.shopName, sendData.body.customerEmail]
            );

            let selectedUserId;
            if (existingUser) {
              selectedUserId = existingUser.id;
            } else {
              const [userResult] = await database.query(
                `INSERT INTO ${user_table} (shop_name, email, user_type, store_name, language, referral_user_id)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                  sendData.body.shopName,
                  sendData.body.customerEmail || sendData.body.guestToken,
                  sendData.body.customerEmail ? "User" : "Guest",
                  sendData.body.storeName,
                  sendData.body.language,
                  sendData.body.referral_id || null,
                ]
              );
              selectedUserId = userResult.insertId;

              for (const wishlistName of sendData.body.wishlistName) {
                await database.query(
                  `INSERT INTO ${Wishlist_table} (wishlist_user_id, wishlist_name, update_at, created_at)
                   VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                  [selectedUserId, wishlistName]
                );
              }
            }

            // ---- Get wishlist ----
            const [wishlist] = await database.query(
              `SELECT wishlist_id FROM ${Wishlist_table} WHERE wishlist_user_id = ?`,
              [selectedUserId]
            );
            if (!wishlist) throw new Error("Wishlist not found for the user");

            const wishlistId = wishlist.wishlist_id;

            // ---- Check product ----
            const [existingProduct] = await database.query(
              `SELECT product_id FROM ${product_table} WHERE product_id = ? AND wishlist_id = ?`,
              [sendData.body.productId, wishlistId]
            );

            if (!existingProduct) {
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

              await database.query(
                `UPDATE ${Wishlist_table} SET update_at = CURRENT_TIMESTAMP WHERE wishlist_id = ?`,
                [wishlistId]
              );
            }
          }

          res.status(200).json({ message: "Processing completed successfully." });
        } catch (error) {
          console.error("Error during processing:", error);
          res
            .status(500)
            .json({ message: "An error occurred during processing." });
        }
      });
  } catch (err) {
    console.error("Main error:", err);
    res.status(500).json({ message: "Server error" });
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



// async function fetchAllProducts(client) {
//     let hasNextPage = true;
//     let endCursor = null;
//     let allProducts = [];

//     while (hasNextPage) {
//         try {
//             const result = await client.graphql(`query {
//                 products(first: 100${endCursor ? `, after: "${endCursor}"` : ''}) {
//                   edges {
//                     node {
//                       id
//                       title
//                       handle
//                       options {
//                           name
//                           values
//                       }
//                       variants(first: 100) {
//                         nodes {
//                           id
//                           title
//                           price
//                         }
//                       }
//                       images(first: 100) {
//                         nodes {
//                           id
//                           height
//                           width
//                           url
//                         }
//                       }
//                     }
//                   }
//                   pageInfo {
//                     hasNextPage
//                     endCursor
//                   }
//                 }
//               }`
//             );

//             const productsData = result.products.edges.map(edge => edge.node);
//             allProducts = allProducts.concat(productsData);
//             const { pageInfo } = result.products;
//             hasNextPage = pageInfo.hasNextPage;
//             endCursor = pageInfo.endCursor;

//             // Add a short delay to reduce likelihood of throttling
//             await delay(500); // 0.5 second delay (can increase if needed)

//         } catch (err) {
//             if (err?.extensions?.code === "THROTTLED") {
//                 console.warn("Rate limit hit. Waiting 2 seconds before retrying...");
//                 await delay(2000); // wait and retry
//                 continue; // retry the same request
//             } else {
//                 console.error("Unexpected error:", err);
//                 break; // break the loop if it's a different error
//             }
//         }
//     }

//     return allProducts;
// }




// async function fetchAllProducts(client) {
//     let hasNextPage = true;
//     let endCursor = null;
//     let allProducts = [];

//     while (hasNextPage) {
//         const result = await client.graphql(`query {
//             products(first: 100${endCursor ? `, after: "${endCursor}"` : ''}) {
//               edges {
//                 node {
//                   id
//                   title
//                   handle
//                   options {
//                       name
//                       values
//                   }
//                   variants(first: 100) {
//                     nodes {
//                       id
//                       title
//                       price
//                     }
//                   }
//                   images(first: 100) {
//                     nodes {
//                       id
//                       height
//                       width
//                       url
//                     }
//                   }
//                 }
//               }
//               pageInfo {
//                 hasNextPage
//                 endCursor
//               }
//             }
//           }`
//         );
//         const productsData = result.products.edges.map(edge => edge.node);
//         allProducts = allProducts.concat(productsData);
//         const { pageInfo } = result.products;
//         hasNextPage = pageInfo.hasNextPage;
//         endCursor = pageInfo.endCursor;
//     }

//     return allProducts;
// }



// async function fetchAllProducts(client) {
//     let hasNextPage = true;
//     let endCursor = null;
//     let allProducts = [];

//     while (hasNextPage) {
//         const result = await client.graphql({
//             data: {
//                 query: `query {
//             products(first: 100${endCursor ? `, after: "${endCursor}"` : ''}) {
//               edges {
//                 node {
//                   id
//                   title
//                   handle
//                   options {
//                       name
//                       values
//                   }
//                   variants(first: 100) {
//                     nodes {
//                       id
//                       title
//                       price
//                     }
//                   }
//                   images(first: 100) {
//                     nodes {
//                       id
//                       height
//                       width
//                       url
//                     }
//                   }
//                 }
//               }
//               pageInfo {
//                 hasNextPage
//                 endCursor
//               }
//             }
//           }`}
//         },
//         );
//         const productsData = result.body.data.products.edges.map(edge => edge.node);
//         allProducts = allProducts.concat(productsData);
//         const { pageInfo } = result.body.data.products;
//         hasNextPage = pageInfo.hasNextPage;
//         endCursor = pageInfo.endCursor;
//     }

//     return allProducts;
// }







// -------------this is method number two ---- to import data using file only-------------

// export const saveDataToSql = async (req, res) => {
//   const storeName = req?.query?.store;
//   if (storeName === 'truebrandsretail-dev.myshopify.com') {

//     const rows = [];
//     fs.createReadStream('trueBrandsData.csv').pipe(csv()).on('data', (row) => {
//       rows.push(row);
//     }).on('end', async () => {

//       try {
//         for (const [index, row] of rows.entries()) {

//           const emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
//           const checkEmail = emailRegEx.test(row.email);

//           if (checkEmail === false || row.email === "" || row.email === null || row.email === "null" || row.email === undefined) {
//             continue; // Skip this row
//           }

//           // let sendData = {
//           //   body: {
//           //     shopName: 'randeep-singh-webframez.myshopify.com',
//           //     plan: 4,
//           //     guestToken: '',
//           //     customerEmail: row.email,
//           //     productId: row.product_id,
//           //     variantId: row.variant_id,
//           //     price: row.price,
//           //     handle: row.handle,
//           //     title: row.title,
//           //     image: row.image,
//           //     quantity: row.quantity,
//           //     storeName: 'randeep-singh-webframez',
//           //     language: 'https://randeep-singh-webframez.myshopify.com/',
//           //     wishlistName: ['favourites'],
//           //     wfGetDomain: 'https://randeep-singh-webframez.myshopify.com/'
//           //   }
//           // };


//           // -------for true brands------------

//           let sendData = {
//             body: {
//               shopName: "truebrandsretail-dev.myshopify.com",
//               plan: 2,
//               guestToken: "",
//               customerEmail: row.email,
//               productId: row.product_id,
//               variantId: row.variant_id,
//               price: row.price,
//               handle: row.handle,
//               title: row.title,
//               image: row.image,
//               quantity: row.quantity,
//               storeName: "True Brands",
//               language: "https://truebrands.com/",
//               wishlistName: ["favourites"],
//               wfGetDomain: "https://truebrands.com/"
//             }
//           };

//           // console.log("index --- ", index);
//           // console.log("sendData --- ", sendData);

//           try {
//             // Check if the user exists
//             const userQuery = `SELECT u.id AS id FROM ${user_table} AS u WHERE u.shop_name = ? AND email = ?`;
//             const [existingUser] = await databaseQuery(userQuery, [sendData.body.shopName, sendData.body.customerEmail]);

//             let selectedUserId;

//             if (existingUser) {
//               // Existing user found
//               selectedUserId = existingUser.id;
//             } else {
//               // Insert new user
//               const addUserQuery = `INSERT INTO ${user_table} (shop_name, email, user_type, store_name, language, referral_user_id)
//                                       VALUES (?, ?, ?, ?, ?, ?)`;
//               const userResult = await databaseQuery(addUserQuery, [
//                 sendData.body.shopName,
//                 sendData.body.customerEmail || sendData.body.guestToken,
//                 sendData.body.customerEmail ? "User" : "Guest",
//                 sendData.body.storeName,
//                 sendData.body.language,
//                 sendData.body.referral_id || null,
//               ]);
//               selectedUserId = userResult.insertId;

//               // Add wishlists for the new user
//               for (const wishlistName of sendData.body.wishlistName) {
//                 await databaseQuery(
//                   `INSERT INTO ${Wishlist_table} (wishlist_user_id, wishlist_name, update_at, created_at)
//                      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
//                   [selectedUserId, wishlistName]
//                 );
//               }
//             }

//             // Retrieve wishlist ID for the user
//             const wishlistQuery = `SELECT wishlist_id FROM ${Wishlist_table} WHERE wishlist_user_id = ?`;
//             const [wishlist] = await databaseQuery(wishlistQuery, [selectedUserId]);

//             if (!wishlist) {
//               throw new Error("Wishlist not found for the user");
//             }

//             const wishlistId = wishlist.wishlist_id;

//             // Check if the product exists in the wishlist
//             const productQuery = `SELECT product_id FROM ${product_table} WHERE product_id = ? AND wishlist_id = ?`;
//             const [existingProduct] = await databaseQuery(productQuery, [sendData.body.productId, wishlistId]);

//             if (!existingProduct) {
//               // Add product to the wishlist
//               await databaseQuery(
//                 `INSERT INTO ${product_table} (wishlist_id, variant_id, product_id, referral_user_id, handle, price, title, image, quantity)
//                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//                 [
//                   wishlistId,
//                   sendData.body.variantId,
//                   sendData.body.productId,
//                   sendData.body.referral_id || null,
//                   sendData.body.handle,
//                   sendData.body.price,
//                   sendData.body.title,
//                   sendData.body.image,
//                   sendData.body.quantity,
//                 ]
//               );

//               // Update the wishlist's timestamp
//               await databaseQuery(
//                 `UPDATE ${Wishlist_table} SET update_at = CURRENT_TIMESTAMP WHERE wishlist_id = ?`,
//                 [wishlistId]
//               );
//             }
//           } catch (err) {
//             console.error("Error processing wishlist:", err);
//           }

//         }

//         // Helper function to convert database queries to promises
//         function databaseQuery(query, params) {
//           return new Promise((resolve, reject) => {
//             database.query(query, params, (err, results) => {
//               if (err) return reject(err);
//               resolve(results);
//             });
//           });

//         }

//         res.status(200).json({ message: 'Processing completed successfully.' });
//       } catch (error) {
//         console.error('Error during processing:', error);
//         res.status(500).json({ message: 'An error occurred during processing.' });
//       }
//     })
//   }
// };


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
        const getSmtpDetail = await queryAsync(`SELECT * FROM email_smtp WHERE shop_name = ?`, [shopName]);

        res.status(200).json({
            success: true,
            data: getSmtpDetail
        });

    } catch (error) {
        console.error("Error in getSmtlDetail:", error);
        res
            .status(400)
            .json({
                success: false,
                message: "Failed to retrieve SMTP details.",
                error: error.message
            });

    }
};




// -------------this is for the klaviyo authentication---------------
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











