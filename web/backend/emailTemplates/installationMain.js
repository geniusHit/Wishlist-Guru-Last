export function installationMailFxn(shop_owner) {
    return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mailer</title>
    <link href="https://fonts.googleapis.com/css?family=Poppins:400,500,600,700&display=swap" rel="stylesheet">
    <style>
        
body {
background: #f7faff;
font-family: 'Poppins', Arial, sans-serif;
margin: 0;
padding: 0;
}

        .mail-wrapper {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(46, 123, 230, 0.08);
            padding: 0;     
        }
    .mail-header {
    background: linear-gradient(180deg, #FFF4FF 12.93%, #FEFFF7 100%);
}
        img.mailer-logo {
    width: 192px;
}
       .mail-content .banner {
    text-align: center;
    padding: 30px 0px 0px 0px;
    gap: 25px;
    background-image: url("https://cdn.shopify.com/s/files/1/0643/8374/6245/files/wishlist-banner.png?v=1758788360");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    height: 60%;
    align-items: center;
}
/* .mail-content {
    background: #f4f8ff;
} */

      .main-title h1 {
    font-size: 36px;
    font-weight: 600;
    color: #000;
    margin: 50px 0 0;
    font-family: 'Poppins';
}
.mockup {
    background: linear-gradient(180deg, #FEFEF7 0%, #FEFFF9 100%);
}
        .subtitle {
            font-size: 1.5rem;
            font-weight: 600;
            color: #111;
            margin-bottom: 24px;
        }

        .greeting-section h2, .greeting-section p {
            font-size: 16px;
            font-weight: 500;
            color: #444;
            line-height: 32px;
            text-align: center;
            margin: 0;
        }
     .greeting {
    padding: 45px 120px 20px;
}
        img.mockup-image {
    width: 100%;
}
.features-section {
    padding: 0 0px 32px 0px;
    margin: -8px 0 0;
    background: linear-gradient(180deg,  #FEFFF9 0%, #FFFFFF 100%);
}
.feature-banner {
    margin: -104px 0 0;
}
        .features-section .features-title {
            font-weight: 600;
        }

       .features-title h3 {
    font-size: 36px;
    font-weight: 600;
    line-height: 100%;
    letter-spacing: 0px;
    text-align: center;
    color: #000;
    text-align: center;
    margin: 0 0 30px;
}


.center-btn {
    margin: 0px 0 0 0;
    border: none;
    width: 100%;
    background: transparent;
}

.view-all-features {
    width: 200px;
    height: 40px;
    border-radius: 8px;
    background: #FF56A5;
    color: #fff;
    font-weight: 700;
    font-size: 16px;
    border: none;
    border-radius: 8px;
    text-decoration: none;
    padding: 10px 20px 10px;
}

        .view-documentation {
            background-image: url("https://cdn.shopify.com/s/files/1/0643/8374/6245/files/wishlist-view.jpg?v=1758788424");
            background-size: cover;
            padding: 32px 0 32px 0;
            text-align: center;
            display: grid;
                background-position: center;
            flex-direction: column;
            justify-content: space-between;
            gap: 37px;
        }
      .view-documentation p {
    color: #FFFFFF;
    font-size: 16px;
    font-weight: 400;
    line-height: 25px;
    letter-spacing: 0px;
    margin-bottom: 0px;
    text-align: center;
    padding: 0 190px;
}
   button.view-btn {
    background: #fff;
    color: #000000;
    font-weight: 700;
    font-size: 16px;
    border-radius: 8px;
    padding: 0;
    text-decoration: none;
    transition: background 0.2s, color 0.2s;
    width: 223px;
    height: 40px;
    margin: auto;
    border: none;
}
        button.view-btn a {
    color: #000;
    text-decoration: none;
}


    .footer-info {
    padding: 45px 90px;
}
.footer-info-text {
    font-weight: 400;
    font-style: normal;
    font-size: 16px;
    line-height: 25px;
    letter-spacing: 0px;
    text-align: center;
    margin: 0;
    color: #222;
}
.footer-info-text a {
    color: #3376EB;
    text-decoration: none;
}
.footer-bottom .social-media-link a {
    display: grid;
    justify-content: center;
    align-items: center;
}
        .footer-bottom {
            background-color: #FFD0E6;
            padding: 45px 0px;
        }

       .footer-bottom .social-media-links {
    max-width: 200px;
    margin: auto;
}
.footer-bottom-text {
    padding: 10px 0 0;
}

        .footer-bottom .footer-bottom-text p {
            font-weight: 400;
            font-size: 12px;
            text-align: center;
            line-height: 30px;
            color: #222;
            margin: 0;
        }

/*table-style*/
th.number span {
    padding: 6.5px 9.5px;
    font-family: Poppins;
    font-weight: 700;
    font-size: 20px;
    line-height: 100%;
    color: #fff;
    border-radius: 4px;
}
th.number {
    width: 10%
}
  th.email-head h3 {
    font-family: Poppins;
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    margin: 0 0 0 14px;
    color: #444444;
}
td.email-para p {
    font-family: Poppins;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: #444;
    margin: 16px 0 0;
}
table.feature-table {
    max-width: 600px;
    margin: auto;
    padding: 0 20px 0;
}
table.feature-table .table-link {
    text-decoration:none;
}
td.email-column {
    padding: 0 13px 38px;
        vertical-align: baseline;
}

  
 @media (max-width: 1024px) {
.main-title h1 {
    font-size: 30px;
    margin: 30px 0 0;
}
.greeting {
    padding: 30px 120px 20px;
}
.features-title h3 {
    font-size: 30px;
}

 }
    

        @media (max-width: 900px) {
 .main-title h1 {
    font-size: 27px;
    margin: 20px 0 0;
}
.features-title h3 {
    font-size: 27px;
}
        }
        @media (max-width: 767px) {
.main-title h1 {
    font-size: 18px;
    margin: 10px 0 0;
}
.greeting {
    padding: 20px 20px 10px;
}
.greeting-section h2, .greeting-section p {
    font-size: 14px;
    line-height: 24px;

}
.features-title h3 {
    font-size: 18px;
}


.view-documentation p {
    font-size: 14px;
    line-height: 22px;;
    padding: 0 20px;
}
.footer-info {
    padding: 30px 20px;
}
.footer-info-text {
    font-size: 14px;
    line-height: 23px;;
    color: #222;
}
.footer-bottom .footer-bottom-text p {
    font-size: 12px;
    line-height: 20px;
}
.feature-banner {
    margin: -49px 0 0;
}
.features-section {
    padding: 0 20px 32px 20px;
}

th.email-head h3 {
    font-size: 14px;
}
td.email-column {
    padding: 0 13px 38px;
    display: block;
}
.footer-bottom {
    padding: 25px 20px;
}
img.mailer-logo {
    width: 133px;
}
        }



    </style>
</head>

<body>
    <div class="mail-wrapper">
        <div class="mail-content">
        <div class="mail-header">
          <div class="banner">
            <img class="mailer-logo"
               src="https://cdn.shopify.com/s/files/1/0643/8374/6245/files/wishlist-mailer-logo.png?v=1758788454" alt="">
            <div class="main-title">
                <h1>Simplify Wishlisting, <br>Easy Saves & Better Planning!</h1></div>
            <div class="greeting-section">
                <div class="greeting">
                    <h2>Hi ${shop_owner},</h2>
                    <p>Thanks for Installing Wishlist Guru – your go-to app for 
                        letting customers save, organize, and share wishlists with ease, 
                        full customization, and multi-language support.</p>
                </div>
            </div>
</div>
</div>

            <div class="mockup">
              <img class="mockup-image"
               src="https://cdn.shopify.com/s/files/1/0643/8374/6245/files/wishlist-img.png?v=1758788426" alt="">
            </div>




            <div class="features-section">
                <div class="feature-banner">
                <div class="features-title">
                    <h3>Explore key features</h3></div>
               

<table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="feature-table">

  <!-- Row 1 -->
  <tr class="email-row">
    <td class="email-column">
    <a class="table-link" href="https://wishlist-guru.webframez.com/docs/multi-variant-feature/">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
          <th class="number">
            <span style="background: #FF56A5;">01</span></th>
          <th class="email-head" style="text-align: left;">
            <h3>Multi variant <br>support</h3>
          </th>
        </tr>
        </table>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
            <td class="email-para">
           <p>We have added support for Multiple Variants handling, Now your users can add multiple variants for the same product in their wishlist.</p>
            </td>
        </tr>
      </table>
      </a>
    </td>
    <td class="email-column">
    <a class="table-link" href="https://wishlist-guru.webframez.com/docs/multiple-wishlists-feature/">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
          <th class="number">
            <span style="background: #FF56A5;">02</span></th>
          <th class="email-head" style="text-align: left;">
            <h3>Multi Wishlist <br>Support</h3>
          </th>
        </tr>
        </table>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">

        <tr>
          <td class="email-para">
            <p>Let customers create and manage multiple Wishlists from product or collection pages for a personalized, organized shopping experience.</p>
            </td>
          </tr>
      </table>
      </a>
    </td>
  </tr>

  <!-- Row 2 -->
   <tr class="email-row">
    <td class="email-column">
    <a class="table-link" href="https://wishlist-guru.webframez.com/docs/b2b-solutions/">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
          <th class="number">
            <span style="background: #FF56A5;">03</span>
          </th>
          <th class="email-head" style="text-align: left;">
            <h3>B2B <br>Solutions</h3>
          </th>
        </tr>
        </table>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">

        <tr>
          <td class="email-para">
<p>Easily manage product visibility, pricing, and cart options to provide a personalized shopping experience for your B2B customers.</p>
            </td>
            </tr>
      </table>
      </a>
    </td>
    <td class="email-column">
    <a class="table-link" href="https://wishlist-guru.webframez.com/docs/how-to-add-and-configure-multiple-languages-for-your-store/">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
          <th class="number">
            <span style="background: #FF56A5;">04</span>
          </th>
          <th class="email-head" style="text-align: left;">
            <h3>Multi-Language <br>Support</h3>
          </th>
        </tr>
        </table>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">

                <tr>
          <td class="email-para">
<p>Easily manage and translate your store's content (admin and front end) to offer a personalized shopping experience for customers worldwide.</p>
            </td>
            </tr>

      </table>
      </a>
    </td>
  </tr>

</table>

                <button class="center-btn">
                    <a href="https://wishlist-guru.webframez.com/wishlist-guru-features/" class="main-btn view-all-features" style="color: white;" >VIEW ALL FEATURES</a>
                </button>
            </div>
        </div>
        </div>
       
      
      
            <div class="view-documentation">
                    <p>Visit our documentation for quick tips, FAQs, and detailed step-by-step guides to help you
                    navigate the platform with ease.</p>
                
               <button class="view-btn">
                    <a href="https://wishlist-guru.webframez.com/docs/">VIEW DOCUMENTATION</a>
               </button>
            </div>

            <div class="footer">
            <div class="footer-info">
                <p class="footer-info-text">
                    If you have any questions or encounter any issues, our dedicated support team is here to
                    assist you. Simply reply to this email or reach out to us via<a href="https://tawk.to/chat/668540329d7f358570d68af2/1i1s85i42"> Live Chat</a> or you can also mail us at <a href="mailto:support@webframez.com">support@webframez.com</a>
                </p>
            </div>
            <div class="footer-bottom">
    

 <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="social-media-links">
     <tr>
      <td> <span class="social-media-link">
                     <a href="https://www.instagram.com/webframez_official/"><img src="https://cdn.shopify.com/s/files/1/0643/8374/6245/files/insta.png?v=1758788340" alt=""></a>
                </span></td>
       <td><span class="social-media-link">
                    <a href="https://www.facebook.com/webframez"><img src="https://cdn.shopify.com/s/files/1/0643/8374/6245/files/facebook.png?v=1758788360" alt=""></a>
                </span></td>
        <td> <span class="social-media-link">
                     <a href="https://www.youtube.com/@webframez"><img src="https://cdn.shopify.com/s/files/1/0643/8374/6245/files/youtube.png?v=1758788424" alt=""></a>
                </span></td>

     </tr>
            </table>

                <div class="footer-bottom-text">
                    <p>You are receiving this email because you signed up our newsletters.<br />
                    To no longer receive these emails, unsubscribe here.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`

}
