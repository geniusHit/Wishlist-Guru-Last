import express from "express";
import { apiAllThemeData, apiAppTheme, apiProductsCreate, apiWishAppTheme, appMetafieldCreate, appMetafieldDelete, appMetafieldGetAll, appMetafieldGetId, appMetafieldGetOne, getCurrentUserDetail, getShopApi, getShopLocaleLanguage, getThemeDataById, productsCount, reRegisterWebhook, saveDefaultDataForWishlistApp, subscriptionCancel, subscriptionCreate, subscriptionPlanStatus } from "../controllers/controllerMetafield.js";

const routerMetafield = express.Router();

routerMetafield.get("/save-default-data-for-wishlist-app", saveDefaultDataForWishlistApp);
routerMetafield.get("/re-register-webhook", reRegisterWebhook);
routerMetafield.get("/products/count", productsCount);
routerMetafield.get("/app-metafield/get-id", appMetafieldGetId);
routerMetafield.post("/app-metafield/create", appMetafieldCreate);
routerMetafield.get("/app-metafield/get-all", appMetafieldGetAll);
routerMetafield.get("/get-shop-locale-language", getShopLocaleLanguage);
routerMetafield.get("/app-metafield/get-one", appMetafieldGetOne);
routerMetafield.get("/app-metafield/delete", appMetafieldDelete);
routerMetafield.get("/subscription/planstatus", subscriptionPlanStatus);
routerMetafield.get("/getshop", getShopApi);
routerMetafield.post("/subscription/create", subscriptionCreate);
routerMetafield.post("/subscription/cancel", subscriptionCancel);
routerMetafield.get("/get-current-user-detail", getCurrentUserDetail);
routerMetafield.get("/app-theme", apiAppTheme);
routerMetafield.get("/wish-app-theme", apiWishAppTheme);
routerMetafield.get("/all-theme-data", apiAllThemeData);
routerMetafield.get("/get-theme-data-by-id", getThemeDataById);
routerMetafield.get("/products/create", apiProductsCreate);

export default routerMetafield;
