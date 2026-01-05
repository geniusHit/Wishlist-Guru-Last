import express from "express";
import fs from "fs";
import multer from "multer";
import { logoUpload, createSocialLike, createNewWishlist, copyToWishlist, editWishlistName, deleteWishlistName, getMultiWishlistData, createUser, deleteItem, deleteAllItem, getAllItems, saveActiveTheme, getKlaviyoEmailIntegration, getSmtpEmailIntegration, getReportAllItems, getIdFromEmail, getSharedWishlist, addToMyWishlist, getAllUsers, getAllUsersCount, getCurrentPlanSql, deleteUser, adminDataWithDate, apiPlanId, adminTopDataRecentData, adminTopDataWithDates, adminGraphDataMonthly, adminGraphDataYearly, getPlanName, getPlanData, requestFormMain, emailReminderChecksUpdate, getEmailReminderAndStoreLanguage, cleanDbData, getEmailReminderChecks, getEmailTempData, emailTemplateUpdate, saveSenderReceiverName, getEmailReportsData, sendWishlistQuotaLimitMails, sendWeeklyWishlistToAdmin, sendWeeklyWishlistToUser, sendMonthlyWishlistToAdmin, sendMonthlyWishlistToUser, klaviyoEmailIntegration, smtpEmailIntegration, shareWishlistByMail, shareWishlistToAdmin, shareWishlistStats, storeLanguagesData, premiumStoreLanguagesData, getStoreLanguageData, getStoreLanguageDataUseeff, getStoreLanguage, deleteStoreLanguageData, updateStoreLanguageData, basicStoreLanguageData, updateDataAppInstallation, appInstallation, updateProductQuantity, sendTestEmail, getAllCartItems, currentAppTheme, handleRedirect, checkPromoCode, checkPromoCodePrevPlan, getShareStatsData, getShareStatsUserData, getShareStatsWishlistItemData, getRefFromEmail, clearWishlistData, getWishlistUsersData, removeWishlistDataById, getWishlistItemData, getDefaultStoreLang, getThemeData, getWishlistCartData, getCurrentUserWishlistData, cartItemRecord, apiHealthChecker, getProductCountData, saveDataToSql, postmarkWebhook, checkSmtpConnection, getSmtpDetail, klaviyoInstall, klaviyoAuthCallback, updateProductVariant, saveShareWishlistToAdminEmail, getShareWishlistToAdminEmail, getWishlistUsers, sendEmailOnOff } from "../controllers/controllersSql.js";
import { fileURLToPath } from "url";
import path from "path";
import { authenticateToken } from "../jwt/authenticateToken.js";
const routerSql = express.Router();

// Directory where files will be uploaded
// const uploadDir = "/uploads";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "..", "uploads");

// Create upload directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const directoryPath = `${uploadDir}/${req.body.id}`;
            // Check if the directory exists
            if (fs.existsSync(directoryPath)) {
                // Directory exists, delete existing files
                const existingFiles = await fs.promises.readdir(directoryPath);
                await Promise.all(
                    existingFiles.map(async (filename) => {
                        const filePath = path.join(directoryPath, filename);
                        await fs.promises.unlink(filePath);
                    })
                );
            } else {
                // Directory doesn't exist, create it
                await fs.promises.mkdir(directoryPath, { recursive: true });
            }
            cb(null, directoryPath);
        } catch (err) {
            cb(err);
        }
    },
    filename: (req, file, callback) => {
        try {
            const timestamp = Date.now();
            const filenameWithoutExtension = path.parse(file.originalname).name;
            const newFilename = `${filenameWithoutExtension.replace(
                /\s+/g,
                "-"
            )}-${timestamp}${path.extname(file.originalname)}`;
            callback(null, newFilename);
        } catch (error) {
            callback(error);
        }
    },
});
const upload = multer({ storage: storage });

routerSql.post("/logo/upload", upload.single("image"), logoUpload);
routerSql.post("/create-social-like", createSocialLike);
routerSql.post("/create-new-wihlist", createNewWishlist);
routerSql.post("/copy-to-wishlist", copyToWishlist);
routerSql.post("/edit-wishlist-name", editWishlistName);
routerSql.post("/delete-wishlist-name", deleteWishlistName);
routerSql.post("/get-multiwishlist-data", getMultiWishlistData);
routerSql.post("/create-user", createUser);
routerSql.post("/delete-item", authenticateToken, deleteItem);
routerSql.post("/delete-all-items", deleteAllItem);
routerSql.post("/get-all-items", getAllItems);
routerSql.post("/save-active-theme", saveActiveTheme);
routerSql.post("/get-klaviyo-email-integration", getKlaviyoEmailIntegration);
routerSql.post("/get-smtp-email-integration", getSmtpEmailIntegration);
routerSql.post("/get-report-all-items", getReportAllItems);
routerSql.post("/get-id-from-email", getIdFromEmail);
routerSql.post("/get-shared-wishlist", getSharedWishlist);
routerSql.post("/add-to-my-wishlist", addToMyWishlist);
routerSql.post("/get-all-users", getAllUsers);
routerSql.post("/get-all-users/count", getAllUsersCount);
routerSql.post("/get-current-plan-sql", getCurrentPlanSql);
routerSql.post("/delete-user", deleteUser);
routerSql.post("/admin-data-with-date", adminDataWithDate);
routerSql.post("/api/PlanId", apiPlanId);
routerSql.post("/admin-top-data-recent-data", adminTopDataRecentData);
routerSql.post("/admin-top-data-with-dates", adminTopDataWithDates);
routerSql.post("/admin-graph-data-monthly", adminGraphDataMonthly);
routerSql.post("/admin-graph-data-yearly", adminGraphDataYearly);
routerSql.post("/get-plan-name", getPlanName);
routerSql.get("/get-plan-data", getPlanData);
routerSql.post("/request-form", requestFormMain);
routerSql.post("/email-reminder-checks-update", emailReminderChecksUpdate);
routerSql.post("/get-email-reminder-and-store-language", getEmailReminderAndStoreLanguage);
routerSql.get("/clean-db-data", cleanDbData);
routerSql.post("/get-email-reminder-checks", getEmailReminderChecks);
routerSql.post("/get-email-temp-data", getEmailTempData);
routerSql.post("/email-template-update", emailTemplateUpdate);
routerSql.post("/save-sender-receiver-name", saveSenderReceiverName);
routerSql.post("/get-email-reports-data", getEmailReportsData);
routerSql.get("/send-wishlist-quota-limit-mails", sendWishlistQuotaLimitMails);
routerSql.get("/send-weekly-wishlist-to-admin", sendWeeklyWishlistToAdmin);
routerSql.get("/send-weekly-wishlist-to-user", sendWeeklyWishlistToUser);
routerSql.get("/send-monthly-wishlist-to-admin", sendMonthlyWishlistToAdmin);
routerSql.get("/send-monthly-wishlist-to-user", sendMonthlyWishlistToUser);
routerSql.post("/klaviyo-email-integration", klaviyoEmailIntegration);
routerSql.post("/smtp-email-integration", smtpEmailIntegration);
routerSql.post("/share-wishlist-by-mail", authenticateToken, shareWishlistByMail);
routerSql.post("/share-wishlist-to-admin", shareWishlistToAdmin);
routerSql.post("/save-share-wishlist-to-admin-email", saveShareWishlistToAdminEmail);
routerSql.post("/get-share-wishlist-to-admin-email", getShareWishlistToAdminEmail);
routerSql.post("/share-wishlist-stats", shareWishlistStats);
routerSql.post("/store-languages-data", storeLanguagesData);
routerSql.post("/premium-store-languages-data", premiumStoreLanguagesData);
routerSql.post("/get-store-language-data", getStoreLanguageData);
routerSql.post("/get-store-language-data-useeff", getStoreLanguageDataUseeff);
routerSql.post("/get-store-language", getStoreLanguage);
routerSql.post("/delete/store-languages-data", deleteStoreLanguageData);
routerSql.post("/update/store-languages-data", updateStoreLanguageData);
routerSql.post("/basic-store-languages-data", basicStoreLanguageData);
routerSql.post("/update-data-app-installation", updateDataAppInstallation);
routerSql.post("/app-installation", appInstallation);
routerSql.post("/update-product-quantity", updateProductQuantity);
routerSql.post("/update-product-variant", updateProductVariant);
routerSql.post("/send-test-email", sendTestEmail);
routerSql.post("/get-all-cart-items", getAllCartItems);
routerSql.get("/current/app-theme", currentAppTheme);
routerSql.get("/handleRedirect", handleRedirect);
routerSql.post("/check-promo-code", checkPromoCode);
routerSql.post("/check-promo-code-prev-plan", checkPromoCodePrevPlan);
routerSql.post("/get-share-stats-data", getShareStatsData);
routerSql.post("/get-share-stats-users-data", getShareStatsUserData);
routerSql.post("/get-share-stats-wishlist-Item-data", getShareStatsWishlistItemData);
routerSql.post("/get-ref-from-email", getRefFromEmail);
routerSql.post("/clear-wishlist-Data", clearWishlistData);
routerSql.post("/get-wishlist-users-data", getWishlistUsersData);
routerSql.post("/remove-wishlist-Data-by-id", removeWishlistDataById);
routerSql.post("/get-wishlist-Item-data", getWishlistItemData);
routerSql.post("/get-default-store-lang", getDefaultStoreLang);
routerSql.post("/get-theme-data", getThemeData);
routerSql.post("/get-wishlist-cart-data", getWishlistCartData);
routerSql.post("/get-current-user-wishlist-data", getCurrentUserWishlistData);
routerSql.post("/cart-item-record", cartItemRecord);
routerSql.post("/get-product-count-data", getProductCountData);
routerSql.get("/save-data-to-sql", saveDataToSql);
routerSql.post("/postmark/bounce-handler", postmarkWebhook);
routerSql.post("/check-smtp-connection", checkSmtpConnection);
routerSql.post("/get-smtp-detail", getSmtpDetail);
routerSql.get("/klaviyo/install", klaviyoInstall);
routerSql.get("/klaviyo/oauth/callback", klaviyoAuthCallback);
routerSql.get("/health", apiHealthChecker);
routerSql.get("/getWishlistUsers", getWishlistUsers)
routerSql.post("/send-email-on-off", sendEmailOnOff)

export default routerSql;