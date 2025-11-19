export function unInstallationMailFxn(shop_owner) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>We're Sad to See You Go 💔</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:700,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <style>
        body {
            font-family: 'Poppins', Arial, sans-serif;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: transparent;
            border: 2px solid transparent;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
        }
.mail-header {
    background: linear-gradient(180deg, #FFF4FF 12.93%, #FEFFF7 100%);
}
        .header {
             background-image: url("https://cdn.shopify.com/s/files/1/0643/8374/6245/files/wishlist-banner.png?v=1758788360");
            background-size: 100% 100%;
            text-align: center;
            padding: 32px 0 0 0;
            background-repeat: no-repeat;
        
        }

        .image-holder {
            padding-top: 7px;
        }
        .image-holder img {
            margin: 0 0 20px;
        }

      /* .student-logo {
    position: relative;
    top: 26px;
} */

        p {
            margin: 0px;
        }

        .sad-img {
            width: 160px;
            margin-top: 8px;
        }

        .main {
            color: #fff;
            text-align: center;
        }
   .main .intro-apologise {
    background: #FF56A5;
    text-align: center;
    padding: 61px 0 36px;
    margin: -16px 0 0;
}

     .main .emoji-text {
    font-weight: 600;
    font-size: 36px;
    line-height: 100%;
    letter-spacing: 0px;
    text-align: center;
    margin: 0 0 37px;
}
.main .intro span {
    font-weight: 500;
    font-size: 16px;
    line-height: 30px;
    text-align: center;
}

        .emoji {
            font-size: 1.5rem;
            vertical-align: middle;
        }
.main .intro {
    padding: 0 131px 30px;
}

        .reasons-container {
            padding: 48px 74px;
        }


    .reasons {
    background: transparent;
    color: #222;
}
.reasons  td {
vertical-align: baseline;
}
.image-holder img.logo {
    width: 192px;
}

     .reasons ul {
    list-style: disc inside;
    padding: 0;
    text-align: left;
    margin: 0;
}
.reasons ul li {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 500;
}
.reinstall-section {
    margin: 25px 0 0 0;
    padding: 30px 0 0 0;
    border-top: 2px solid #FF56A5;
}


    .reinstall-section p#ready {
    color: #222;
    font-size: 16px;
    font-weight: 500;
    line-height: 30px;
    margin-bottom: 0px;
    text-align: center;
    padding: 0px 74px;
}


    .reinstall-section p#questions {
    font-weight: 400;
    font-size: 16px;
    line-height: 25px;
    letter-spacing: 0px;
    text-align: center;
    color: #222;
    margin-top: 48px;
    padding: 0 67px;
}

.reinstall-btn {
    display: inline-block;
    border: none;
    background: #FF56A5;
    color: #fff;
    font-weight: 700;
    padding: 0;
    border-radius: 8px;
    width: 175px;
    height: 40px;
    font-size: 16px;
    text-transform: uppercase;
    margin: 31px 0 0;
}
 .reinstall-btn a {
    text-decoration: none;
    color: #fff;
 }
.footer .social-media-link a {
    display: grid;
    justify-content: center;
    align-items: center;
}

        .footer {
    background: #FFD0E6;
    padding: 40px 0px;
    text-align: center;
    color: #222;
}

        .footer-bottom-text p {
            font-size: 12px;
            font-weight: 400;
            line-height: 30px;
            color: #222222;
            margin: 0;
        }

       .footer .social-media-links {
    max-width: 200px;
    margin: auto;
}
    

        .link {
            color: #1a9cf7;
            text-decoration: underline;
        }
.footer-bottom-text {
    padding: 10px 0 0;
}





        @media (max-width: 1024px) {
        .main .emoji-text {
    font-size: 30px;
    margin: 0px 0 22px;
}
.main .intro {
    padding: 0 131px 11px;
}
        }
     @media (max-width: 900px) {

        .main .emoji-text {
    font-size: 27px;
    margin: 0px 0 20px;
        }

        .reinstall-section p#questions {
    margin-top: 38px;
}
}
        @media (max-width: 700px) {
            .main .emoji-text {
    font-size: 18px;
    margin: 0px 0 15px;
}
.main .intro {
    padding: 0 20px 10px;
}
.main .intro span {
    font-size: 14px;
    line-height: 24px;
}
.reasons-container {
    padding: 48px 20px;
}
     .reinstall-section p#ready {
    font-size: 14px;
    line-height: 24px;
    padding: 0 0;
}       
    
.reinstall-btn {
    margin: 21px 0 0;
}
.reinstall-section p#questions {
    font-size: 14px;
    line-height: 24px;
   margin-top: 38px;
    padding: 0;
}
.footer {
    padding: 35px 20px;
    gap: 15px;
}
.footer-bottom-text {
    font-size: 12px;
    line-height: 21px;
}
    .image-holder img.logo {
            margin: 0 0 15px;
             width: 133px;
        }
        .reasons td {
    display: block;
}
.footer {
            padding: 25px 20px;

        }
        }



    </style>
</head>

<body>
    <div class="container">
        <div class="mail-header">
        <div class="header">
            <div class="image-holder">
                <img src="https://cdn.shopify.com/s/files/1/0643/8374/6245/files/wishlist-mailer-logo.png?v=1758788454" alt="wishlist Guru Logo"  class="logo">
            </div>
            <div class="student-logo">
               <img src="https://cdn.shopify.com/s/files/1/0643/8374/6245/files/wishlist-men.png?v=1758788408" alt="">

            </div>
        </div>
        </div>




        <div class="main">
            <div class="intro-apologise">
                <h1 class="emoji-text">WE’RE SAD TO SEE YOU GO <span class="emoji">💔</span></h1>
                <p class="intro">
                    <span style="width: 100%;">
                        Hi Anjali Sharma, We noticed that you recently removed the Wishlist Guru and we’re really interested in learning more about your decision.
                    </span>
                </p>
                <p class="intro">
                    <span style="width: 100%;">
                        Your feedback is crucial in helping us improve the app and provide a better experience for
                        everyone. Please let us know the reason behind your decision by selecting one of the following
                    </span>
                </p>
            </div>
            <div class="reasons-container">
    

<table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="reasons">
<tr>
    <td>   <ul>
                        <li>The app wasn’t functioning properly</li>
                        <li>Concerns about pricing</li>
                        <li>Switched to another app</li>
                        <li>Closing my store</li>
                    </ul></td>
    <td> <ul>
                       <ul>
                        <li>The setup was too difficult</li>
                        <li>Experienced performance issues</li>
                        <li>Didn’t get enough support</li>
                        <li>Missing features</li>
                        <li>Other (please specify)</li>
                    </ul></td>
</tr>

    </table>



                <div class="reinstall-section">
                    <p id="ready">
                        Ready to jump back in? Reinstalling takes just a click—get started now and pick up right
                        where you left off!
                    </p>
                    <button class="reinstall-btn"><a href="https://apps.shopify.com/wishlist-guru">REINSTALL NOW</a></button>
                    <p id="questions">
                        If you have any questions or encounter any issues, our dedicated support team is here to assist
                        you. Simply reply to this email or reach out to us via
                        <a href="https://tawk.to/chat/668540329d7f358570d68af2/1i1s85i42" class="link">Live Chat</a> or you can also mail us at
                        <a href="mailto:support@webframez.com" class="link">support@webframez.com</a>
                    </p>
                </div>
            </div>

        </div>
        <div class="footer">
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
</body>

</html>`




  // `
  //     <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  //     <html xmlns="http://www.w3.org/1999/xhtml">
  //     <head>
  //     <meta name="viewport" content="width=device-width, initial-scale=1">
  //     <style type="text/css">
  //      body {
  //           margin: 0;
  //           padding: 0;
  //           min-width: 100%;
  //           width: 100% !important;
  //           height: 100% !important;
  //       }
  //       *, *::before, *::after {
  //           box-sizing:border-box;
  //           -webkit-box-sizing:border-box;
  //       }
  //       body,
  //       table,
  //       td,
  //       div,
  //       p,
  //       a {
  //           -webkit-font-smoothing: antialiased;
  //           text-size-adjust: 100%;
  //           -ms-text-size-adjust: 100%;
  //           -webkit-text-size-adjust: 100%;
  //           line-height: 100%;
  //       }

  //       table,
  //       td {
  //           border-collapse: collapse !important;
  //           border-spacing: 0;
  //       }

  //       img {
  //           border: 0;
  //           line-height: 100%;
  //           outline: none;
  //           text-decoration: none;
  //       }

  //       a,
  //       a:hover {
  //           color: #127DB3;
  //       }

  //       .footer a,
  //       .footer a:hover {
  //           color: #999999;
  //       }
  //     </style>
  //     <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
  //     <title>Wishlist Email Template</title>
  //     </head>
  //     <body style="margin: 0; padding: 0; width: 100%; height: 100%; -webkit-font-smoothing: antialiased;text-size-adjust:100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%;background-color:#e0e7ef;color: #000000;">
  //     <div style="background-color: #e1e1e1;
  //         background-size: cover;background-repeat: no-repeat;background-position:bottom center;max-width: 700px;margin: 0 auto;">

  //     <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0"
  //       style="border-collapse: collapse; border-spacing: 0;padding: 0;width:100%;">
  //           <tr>
  //               <td style="padding:15px;border-bottom: 1px dotted #ebe3e3;"><a href="https://wishlist-guru.webframez.com/" target="_blank" style="text-decoration: none;outline: none;	box-shadow: none;display: block;
  //                   max-width: 200px;margin: 0 auto;"><img src="https://wishlist-guru.myshopify.com/cdn/shop/files/Group-128.png" alt="Wishlist" style="width:100%;"/></a></td>
  //           </tr>
  //       </table>

  //       <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0"
  //       style="border-collapse: collapse; border-spacing: 0;padding: 0;width:100%;">
  //       <tr><td style="padding-top:50px;padding-bottom:30px;padding-left:15px;padding-right:15px;"><p class="content-paragraph" style="font-size:16px;line-height:26px;color:#222;font-weight:400;font-family:'Poppins', sans-serif;text-align: center;max-width: 520px;margin: 0 auto 25px;">Dear <b style="color: #FF56A5;">${shop_owner},</b> 
  //           We are sorry to see that you have uninstalled our Wishlist Guru App. We hope that you will reconsider and give us another chance.We understand that you may have been unhappy with the app for some reason. We would love to hear your feedback so that we can improve the app for future users. Please feel free to email us at <a href="mailto:support@webframez.com" target="_blank" style="color:#ff56ad;font-weight:700;"> support@webframez.com</a> with your suggestions.</p>
  //           <p class="content-paragraph" style="font-size:16px;line-height:26px;color:#222;font-weight:400;font-family:'Poppins', sans-serif;text-align: center;max-width: 520px;margin: 0 auto;">Thank you for your time and consideration.</p>
  //       </td></tr>

  //       </table>
  //     </div>

  //       <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0"
  //       style="border-collapse: collapse; border-spacing: 0;padding: 0;width:100%;max-width:700px;margin:0 auto;background-color:#F8F2FD;">
  //         <tr>
  //           <td style="padding-top: 60px;padding-bottom:30px;padding-left:15px;padding-right:15px;"><a href="https://wishlist-guru.webframez.com/" target="_blank" style="text-decoration: none;outline: none;box-shadow: none;display: block;max-width: 200px;margin: 0 auto 10px;"><img src="https://wishlist-guru.myshopify.com/cdn/shop/files/Group-128.png" alt="Wishlist" style="width:100%;"/></a>
  //           <h3 style="margin: 0 auto 30px;text-align: center;font-size: 15px;line-height: 20px;font-weight: 400;color: #222;font-family: 'Poppins', sans-serif;
  //           max-width: 500px;">If you have any questions, reply to this email or contact us at support@webframez.com</h3>
  //           <ul style="margin: 0;padding: 0;list-style: none;display: flex;justify-content: center;align-items: center;margin: 0 auto;width: 180px;">
  //             <li style="margin-right: 10px;margin-left: 0;"><a href="https://www.facebook.com/webframez" target="_blank" style="text-decoration:none;outline:none;box-shadow:none;color: #222;width: 30px;
  //               height: 30px;background-color: #222;display: flex;align-items: center;justify-content: center;	border-radius: 50%;"><img src="https://cdn.shopify.com/s/files/1/0580/0869/8979/files/facebook-icon.png?v=1719841151" /></a></li>
  //             <li style="margin-right: 10px;margin-left: 0;"><a href="https://www.linkedin.com/company/web-framez-pvt-ltd" target="_blank" style="text-decoration:none;outline:none;box-shadow:none;color: #222;width: 30px;height: 30px;background-color: #222;display: flex;align-items: center;justify-content: center;	border-radius: 50%;"><img src="https://cdn.shopify.com/s/files/1/0580/0869/8979/files/linkdin-icon.png?v=1719841628" /></a></li>
  //             <li style="margin-right: 10px;margin-left: 0;"><a href="https://www.instagram.com/webframez_official/" target="_blank" style="text-decoration:none;outline:none;box-shadow:none;color: #222;width: 30px;
  //               height: 30px;background-color: #222;display: flex;align-items: center;justify-content: center;	border-radius: 50%;"><img src="https://cdn.shopify.com/s/files/1/0580/0869/8979/files/instagram-icon1.png?v=1719842392" /></a></li>
  //             <li style="margin-left: 0;"><a href="https://www.youtube.com/@webframez" target="_blank" style="text-decoration:none;outline:none;box-shadow:none;color: #222;width: 30px;
  //               height: 30px;background-color: #222;display: flex;align-items: center;justify-content: center;	border-radius: 50%;"><img src="https://cdn.shopify.com/s/files/1/0580/0869/8979/files/youtube-icon1.png?v=1719842202" /></a></li>
  //           </ul>
  //           </td>
  //         </tr>
  //       </table>
  //     </body>
  //     </html>
  //   `;
}
