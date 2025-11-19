import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Banner, Layout, Page } from "@shopify/polaris";

export default function ExitIframe() {
  const app = useAppBridge();
  const { search } = useLocation();
  const [showWarning, setShowWarning] = useState(false);

  app.loading(true);

  useEffect(() => {
    if (!!app && !!search) {
      const params = new URLSearchParams(search);
      const redirectUri = params.get("redirectUri");
      const url = new URL(decodeURIComponent(redirectUri));

      if (
        [location.hostname, "admin.shopify.com"].includes(url.hostname) ||
        url.hostname.endsWith(".myshopify.com")
      ) {
        window.open(url, "_top");
      } else {
        setShowWarning(true);
      }
    }
  }, [app, search, setShowWarning]);

  return showWarning ? (
    <Page narrowWidth>
      <Layout>
        <Layout.Section>
          <div style={{ marginTop: "100px" }}>
            <Banner title="Redirecting outside of Shopify" status="warning">
              Apps can only use /exitiframe to reach Shopify or the app itself.
            </Banner>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  ) : null;
}













// import { Redirect } from "@shopify/app-bridge/actions";
// import { useAppBridge, Loading } from "@shopify/app-bridge-react";
// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import { Banner, Layout, Page } from "@shopify/polaris";
// import { authenticatedFetch } from "@shopify/app-bridge/utilities";


// export default function ExitIframe() {

//   // alert("I willl stop the appp")

//   const app = useAppBridge();
//   const { search } = useLocation();
//   const [showWarning, setShowWarning] = useState(false);

//   useEffect(async () => {
//     if (!!app && !!search) {
//       const params = new URLSearchParams(search);
//       const redirectUri = params.get("redirectUri");
//       const url = new URL(decodeURIComponent(redirectUri));

//       if (
//         [location.hostname, "admin.shopify.com"].includes(url.hostname) ||
//         url.hostname.endsWith(".myshopify.com")
//       ) {
//         const redirect = Redirect.create(app);

//         redirect.dispatch(
//           Redirect.Action.REMOTE,
//           decodeURIComponent(redirectUri)
//         );

//         // redirect.dispatch(Redirect.Action.APP, '/');

//       } else {
//         setShowWarning(true);
//       }
//     }
//   }, [app, search, setShowWarning]);


//   return showWarning ? (
//     <Page narrowWidth>
//       <Layout>
//         <Layout.Section>
//           <div style={{ marginTop: "100px" }}>
//             <Banner title="Redirecting outside of Shopify" status="warning">
//               Apps can only use /exitiframe to reach Shopify or the app itself.
//             </Banner>
//           </div>
//         </Layout.Section>
//       </Layout>
//     </Page>
//   ) : (
//     <Loading />
//   );
// }









// // ---------------FIRST APPROACH------------


// // import { Redirect } from "@shopify/app-bridge/actions";
// // import { useAppBridge, Loading } from "@shopify/app-bridge-react";
// // import { useEffect } from "react";
// // import { useLocation } from "react-router-dom";

// // export default function ExitIframe() {
// //   const app = useAppBridge();
// //   const { search } = useLocation();

// //   useEffect(() => {
// //     if (!app || !search) return;

// //     const params = new URLSearchParams(search);
// //     const redirectUri = params.get("redirectUri");

// //     if (redirectUri) {
// //       const redirect = Redirect.create(app);
// //       redirect.dispatch(Redirect.Action.REMOTE, decodeURIComponent(redirectUri));
// //     }
// //   }, [app, search]);

// //   return <Loading />;
// // }





// // import { useAppBridge } from "@shopify/app-bridge-react";
// // import { useEffect, useState } from "react";
// // import { useLocation } from "react-router-dom";
// // import { Banner, Layout, Page } from "@shopify/polaris";

// // export default function ExitIframe() {
// //   const app = useAppBridge();
// //   const { search } = useLocation();
// //   const [showWarning, setShowWarning] = useState(false);

// //   app.loading(true);

// //   useEffect(() => {
// //     if (!!app && !!search) {
// //       const params = new URLSearchParams(search);
// //       const redirectUri = params.get("redirectUri");
// //       const url = new URL(decodeURIComponent(redirectUri));

// //       if (
// //         [location.hostname, "admin.shopify.com"].includes(url.hostname) ||
// //         url.hostname.endsWith(".myshopify.com")
// //       ) {
// //         window.open(url, "_top");
// //       } else {
// //         setShowWarning(true);
// //       }
// //     }
// //   }, [app, search, setShowWarning]);

// //   return showWarning ? (
// //     <Page narrowWidth>
// //       <Layout>
// //         <Layout.Section>
// //           <div style={{ marginTop: "100px" }}>
// //             <Banner title="Redirecting outside of Shopify" status="warning">
// //               Apps can only use /exitiframe to reach Shopify or the app itself.
// //             </Banner>
// //           </div>
// //         </Layout.Section>
// //       </Layout>
// //     </Page>
// //   ) : null;
// // }

