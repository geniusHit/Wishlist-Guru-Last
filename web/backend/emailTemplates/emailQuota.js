export function emailQuotaReachedFxn(storeOwner, shopName) {
  const splitShopName = shopName.replace('.myshopify.com', '');
  return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style type="text/css">
          body {
              margin: 0;
              padding: 0;
              min-width: 100%;
              width: 100% !important;
              height: 100% !important;
          }
          *, *::before, *::after {
              box-sizing: border-box;
              -webkit-box-sizing: border-box;
          }
          body,
          table,
          td,
          div,
          p,
          a {
              -webkit-font-smoothing: antialiased;
              text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
              -webkit-text-size-adjust: 100%;
              line-height: 100%;
          }
  
          table,
          td {
              border-collapse: collapse !important;
              border-spacing: 0;
          }
  
          img {
              border: 0;
              line-height: 100%;
              outline: none;
              text-decoration: none;
          }
  
          a,
          a:hover {
              color: #127DB3;
          }
  
          .footer a,
          .footer a:hover {
              color: #999999;
          }
          @media screen and (max-width:480px) {
              .content-paragraph a {
                  display: block;
              }
          }
        </style>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
        <title>Wishlist Email Template</title>
        </head>
        <body style="margin: 0; padding: 0; width: 100%; height: 100%; -webkit-font-smoothing: antialiased;text-size-adjust:100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%;background-color:#e0e7ef;color: #000000;">
        <div style="background-color: #e1e1e1;
            background-size: cover;background-repeat: no-repeat;background-position:bottom center;max-width: 700px;margin: 0 auto;">
    
         <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0"
          style="border-collapse: collapse; border-spacing: 0;padding: 0;width:100%;">
              <tr>
                  <td style="padding:15px;border-bottom: 1px dotted #ebe3e3;"><a href="https://wishlist-guru.webframez.com/" target="_blank" style="text-decoration: none;outline: none;	box-shadow: none;display: block;
                      max-width: 200px;margin: 0 auto;"><img src="https://wishlist-guru.myshopify.com/cdn/shop/files/Group-128.png" alt="Wishlist" style="width:100%;"/></a></td>
              </tr>
          </table>
  
          <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0"
          style="border-collapse: collapse; border-spacing: 0;padding: 0;width:100%;">
          <tr><td style="padding-top:50px;padding-bottom:30px;padding-left:15px;padding-right:15px;"><p class="content-paragraph" style="font-size:16px;line-height:26px;color:#222;font-weight:400;font-family:'Poppins', sans-serif;text-align: center;max-width: 520px;margin: 0 auto;"><b style="color: #FF56A5;">Hi ${storeOwner},</b> Your Wishlist GURU app crossed 100% of monthly Email Quota limit, your email services are expired. Now you have to update your plan! <a href="https://admin.shopify.com/store/${splitShopName}/apps/wishlist-guru-2/PricingPlan" target="_blank" style="color: #ff56ad;font-weight: 700;">Click here to update the plan</a></p></td></tr>
          <tr style="padding-top:15px;padding-bottom:50px;padding-left:0px;padding-right:0px;display:flex;max-width: 160px;margin: 0 auto;">
              <td><a href="${shopName}/apps/wg-wishlist" style="text-decoration:none;outline:none;box-shadow:none;display:block;text-transform: uppercase;
                  font-size: 12px;line-height: 14px;background:#7F50A7;padding: 12px 5px 12px;color: #fff;font-weight: 600;font-family: 'Poppins', sans-serif;margin: 0 auto;
              text-align: center;max-width: 160px;min-width: 160px;border-radius:10px;background-image: url(https://cdn.shopify.com/s/files/1/0580/0869/8979/files/wishlist-icon.svg?v=1719902841);background-repeat: no-repeat;background-size: 18px;background-position: 20px 11px;"><span style="width: 18px;margin-right: 5px;display:inline-block;"></span> Go to wishlist</a>
          </td>
          </tr>
          </table>
        </div>
    
          <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0"
          style="border-collapse: collapse; border-spacing: 0;padding: 0;width:100%;max-width:700px;margin:0 auto;background-color:#F8F2FD;">
            <tr>
              <td style="padding-top: 60px;padding-bottom:30px;padding-left:15px;padding-right:15px;"><a href="https://wishlist-guru.webframez.com/" target="_blank" style="text-decoration: none;outline: none;box-shadow: none;display: block;max-width: 200px;margin: 0 auto 10px;"><img src="https://wishlist-guru.myshopify.com/cdn/shop/files/Group-128.png" alt="Wishlist" style="width:100%;"/></a>
              <h3 style="margin: 0 auto 30px;text-align: center;font-size: 15px;line-height: 20px;font-weight: 400;color: #222;font-family: 'Poppins', sans-serif;
              max-width: 500px;">If you have any questions, reply to this email or contact us at support@webframez.com</h3>
              <ul style="margin: 0;padding: 0;list-style: none;display: flex;justify-content: center;align-items: center;margin: 0 auto;width: 180px;">
                <li style="margin-right: 10px;margin-left: 0;"><a href="https://www.facebook.com/webframez" target="_blank" style="text-decoration:none;outline:none;box-shadow:none;color: #222;width: 30px;
                  height: 30px;background-color: #222;display: flex;align-items: center;justify-content: center;	border-radius: 50%;"><img src="https://cdn.shopify.com/s/files/1/0580/0869/8979/files/facebook-icon.png?v=1719841151" /></a></li>
                <li style="margin-right: 10px;margin-left: 0;"><a href="https://www.linkedin.com/company/web-framez-pvt-ltd" target="_blank" style="text-decoration:none;outline:none;box-shadow:none;color: #222;width: 30px;height: 30px;background-color: #222;display: flex;align-items: center;justify-content: center;	border-radius: 50%;"><img src="https://cdn.shopify.com/s/files/1/0580/0869/8979/files/linkdin-icon.png?v=1719841628" /></a></li>
                <li style="margin-right: 10px;margin-left: 0;"><a href="https://www.instagram.com/webframez_official/" target="_blank" style="text-decoration:none;outline:none;box-shadow:none;color: #222;width: 30px;
                  height: 30px;background-color: #222;display: flex;align-items: center;justify-content: center;	border-radius: 50%;"><img src="https://cdn.shopify.com/s/files/1/0580/0869/8979/files/instagram-icon1.png?v=1719842392" /></a></li>
                <li style="margin-left: 0;"><a href="https://www.youtube.com/@webframez" target="_blank" style="text-decoration:none;outline:none;box-shadow:none;color: #222;width: 30px;
                  height: 30px;background-color: #222;display: flex;align-items: center;justify-content: center;	border-radius: 50%;"><img src="https://cdn.shopify.com/s/files/1/0580/0869/8979/files/youtube-icon1.png?v=1719842202" /></a></li>
              </ul>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
}
