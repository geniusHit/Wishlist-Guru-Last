
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import GDPRWebhookHandlers from "./privacy.js";
import cors from "cors";
import bodyParser from "body-parser";
import database from "./backend/connection/database.js";
import { Constants } from "./backend/constants/constant.js";
import crypto from "crypto";
import logger from "./loggerFile.js";
import routerSql from "./backend/routes/routesSql.js";
import routerMetafield from "./backend/routes/routesMetafield.js";
import shopifyCustomPage from "./backend/utils/shopifyCustomPage.js";

const PORT_GRAPH = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const { port, token, serverURL } = Constants;
const PORT_SQL = port;


// const STATIC_PATH = `${process.cwd()}/frontend/dist`;
const STATIC_PATH = `${process.cwd()}/frontend/`;

// --------- sql backend connection --------- 
const app_SQL = express();
app_SQL.options("*", cors());
app_SQL.use(cors());
// app_SQL.use(cors({
//   origin: "http://localhost:3000",
//   methods: ["GET", "POST"],
//   credentials: true,
// }));
app_SQL.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app_SQL.use(bodyParser.json({ limit: "10mb" }));
app_SQL.use(express.static("public"));
app_SQL.use("/uploads", express.static("uploads"));
app_SQL.use("/", routerSql);
// Middleware to get id from the database and attach it to the request
// app_SQL.use("/logo/upload", (req, res, next) => {
//   next();
// });

const app = express();

// const queryAsync = (query, params) => {
//   return new Promise((resolve, reject) => {
//     database.query(query, params, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });
// };
const queryAsync = async (query, params = []) => {
  try {
    const [rows] = await database.query(query, params);
    return rows;
  } catch (err) {
    console.error("❌ Database query error:", err.message);
    throw err; // rethrow so the calling function can handle it
  }
};


// app.use(
//   shopify.config.webhooks.path,
//   bodyParser.raw({ type: "application/json", limit: '10mb' }),
//   async (req, res, next) => {
//     const hmac = req.headers["x-shopify-hmac-sha256"];
//     const genHash = crypto
//       .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
//       .update(req.body, "utf8", "hex")
//       .digest("base64");
//     if (genHash !== hmac) {
//       return res.status(401).send("Couldn't verify incoming Webhook request!");
//     }
//     next();
//   }
// );

app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

// ---------this part makes webhooks at installation---------
app.post(
  shopify.config.webhooks.path,
  // @ts-ignore
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

const addAcessToken = async (req, res, next) => {
  try {
    const shop = res.locals?.shopify?.session?.shop;
    const accessToken = res.locals?.shopify?.session?.accessToken;
    if (!shop || !accessToken) {
      return res.status(401).json({ error: "Invalid session or access token missing" });
    }
    const [tokenRow] = await queryAsync(
      `SELECT access_token FROM app_installation WHERE shop_name = ?`,
      [shop]
    );
    if (!tokenRow || !tokenRow.access_token) {
      await queryAsync(
        `UPDATE app_installation SET access_token = ? WHERE shop_name = ?`,
        [accessToken, shop]
      );
    }
    next();
  } catch (error) {
    logger.error(error);
    console.error("Error in addAcessToken middleware:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

app.use(express.json());

app.use("/", shopifyCustomPage);
app.use("/api", shopify.validateAuthenticatedSession(), addAcessToken, routerMetafield);
app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

// app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
//   return res
//     .status(200)
//     .set("Content-Type", "text/html")
//     .send(readFileSync(join(STATIC_PATH, "index.html")));
// });

app.use("/*", async (req, res, next) => {
  try {
    const shop = req.query.shop;

    // If shop param missing, handle gracefully
    if (!shop) {
      logger.warn("ensureInstalledOnShop skipped - missing shop param", { path: req.path });

      // Option 1: Redirect to install page
      // return res.redirect(`/api/auth?shop=YOUR_FALLBACK_SHOP_NAME.myshopify.com`);

      // Option 2: Return friendly message
      return res.status(400).send("Shop parameter missing in request.");
    }

    // Otherwise, continue normal flow
    return shopify.ensureInstalledOnShop()(req, res, next);
  } catch (error) {
    logger.error("Error in ensureInstalledOnShop middleware:", error);
    res.status(500).send("Internal server error.");
  }
}, async (_req, res) => {
  res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT_GRAPH);
app_SQL.listen(PORT_SQL);




























































// // @ts-check
// import { join } from "path";
// import { readFileSync } from "fs";
// import express from "express";
// import serveStatic from "serve-static";

// import shopify from "./shopify.js";
// import productCreator from "./product-creator.js";
// import PrivacyWebhookHandlers from "./privacy.js";

// const PORT = parseInt(
//   process.env.BACKEND_PORT || process.env.PORT || "3000",
//   10
// );

// const STATIC_PATH =
//   process.env.NODE_ENV === "production"
//     ? `${process.cwd()}/frontend/dist`
//     : `${process.cwd()}/frontend/`;

// const app = express();

// // Set up Shopify authentication and webhook handling
// app.get(shopify.config.auth.path, shopify.auth.begin());
// app.get(
//   shopify.config.auth.callbackPath,
//   shopify.auth.callback(),
//   shopify.redirectToShopifyOrAppRoot()
// );
// app.post(
//   shopify.config.webhooks.path,
//   shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
// );

// // If you are adding routes outside of the /api path, remember to
// // also add a proxy rule for them in web/frontend/vite.config.js

// app.use("/api/*", shopify.validateAuthenticatedSession());

// app.use(express.json());

// app.get("/api/products/count", async (_req, res) => {
//   const client = new shopify.api.clients.Graphql({
//     session: res.locals.shopify.session,
//   });

//   const countData = await client.request(`
//     query shopifyProductCount {
//       productsCount {
//         count
//       }
//     }
//   `);

//   res.status(200).send({ count: countData.data.productsCount.count });
// });

// app.post("/api/products", async (_req, res) => {
//   let status = 200;
//   let error = null;

//   try {
//     await productCreator(res.locals.shopify.session);
//   } catch (e) {
//     console.log(`Failed to process products/create: ${e.message}`);
//     status = 500;
//     error = e.message;
//   }
//   res.status(status).send({ success: status === 200, error });
// });

// app.use(shopify.cspHeaders());
// app.use(serveStatic(STATIC_PATH, { index: false }));

// app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
//   return res
//     .status(200)
//     .set("Content-Type", "text/html")
//     .send(
//       readFileSync(join(STATIC_PATH, "index.html"))
//         .toString()
//         .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
//     );
// });

// app.listen(PORT);
