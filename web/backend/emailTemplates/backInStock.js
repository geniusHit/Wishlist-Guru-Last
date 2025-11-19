export function backInStockFxn(customer, productTitle, variantId, productHandle, shopDomain, imageUrl, logoResult, serverURL, app_install_id, emailData, dataToParmas, admin = "no", getSmtpDetail = []) {

  let imgSrc = null
  if (admin === "yes") {
    imgSrc = logoResult
      ? `<a href="${serverURL}/handleRedirect?redirectUrl=https://${shopDomain}&data=${encodeURIComponent(JSON.stringify(dataToParmas))}" target="_blank" style="text-decoration: none;outline: none;box-shadow: none;display: block;max-width: 200px;margin: 0 auto 10px;"><img src="${serverURL}/uploads/${app_install_id}/${logoResult}" alt="Wishlist" style="width:100%;"/></a>`
      : `<a href="${serverURL}/handleRedirect?redirectUrl=https://wishlist-guru.webframez.com&data=${encodeURIComponent(JSON.stringify(dataToParmas))}" target="_blank" style="text-decoration: none;outline: none;box-shadow: none;display: block;max-width: 200px;margin: 0 auto 10px;"><img src="https://wishlist-guru.myshopify.com/cdn/shop/files/Group-128.png" alt="Wishlist" style="width:100%;"/></a>`
  } else {
    imgSrc = logoResult
      ? `<a href="${serverURL}/handleRedirect?redirectUrl=https://${shopDomain}&data=${encodeURIComponent(JSON.stringify(dataToParmas))}" target="_blank" style="text-decoration: none;outline: none;box-shadow: none;display: block;max-width: 200px;margin: 0 auto 10px;"><img src="${(getSmtpDetail.length > 0 && getSmtpDetail[0].user_name !== "") ? `cid:wf@logo` : `${serverURL}/uploads/${app_install_id}/${logoResult}`}" alt="Wishlist" style="width:100%;"/></a>`
      : `<a href="${serverURL}/handleRedirect?redirectUrl=https://wishlist-guru.webframez.com&data=${encodeURIComponent(JSON.stringify(dataToParmas))}" target="_blank" style="text-decoration: none;outline: none;box-shadow: none;display: block;max-width: 200px;margin: 0 auto 10px;"><img src="https://wishlist-guru.myshopify.com/cdn/shop/files/Group-128.png" alt="Wishlist" style="width:100%;"/></a>`
  }

  const replacements = {
    'Customer Email': customer.name,
    'Product Title': productTitle,
    'Logo': "",
    'Your Shop Domain': shopDomain,
    'Product Grid': '',
    'Shop Button': '',
    'Go To Wishlist': '',
    productTitle: productTitle,
    shopDomain: shopDomain,
    productHandle: productHandle,
    variantId: variantId,
    imageUrl: imageUrl,
    imgSrc: imgSrc
  };

  const shopDomainData = `<a href="${serverURL}/handleRedirect?redirectUrl=https://${replacements.shopDomain}&data=${encodeURIComponent(JSON.stringify(dataToParmas))}" target="_blank">${replacements.shopDomain}</a>`

  const logoData = replacements.imgSrc;

  const goToWishlistData = `<a href="${serverURL}/handleRedirect?redirectUrl=https://${replacements.shopDomain}/apps/wg-wishlist&data=${encodeURIComponent(JSON.stringify(dataToParmas))}"     style="text-decoration:none !important; outline:none;box-shadow:none;display:inline-block;text-transform:uppercase;font-size:12px;line-height:14px;background:${emailData?.goToWishlistBtnStyle?.bgColor ? emailData?.goToWishlistBtnStyle?.bgColor : '#7F50A7'};padding:12px 10px;color:${emailData?.goToWishlistBtnStyle?.textColor ? emailData?.goToWishlistBtnStyle?.textColor : '#fff'} !important;font-weight:600;font-family:'Poppins', sans-serif;margin:10px auto;text-align:center;border-radius:${emailData?.goToWishlistBtnStyle?.borderRadius ? `${emailData?.goToWishlistBtnStyle?.borderRadius}px` : '10px'};background-image: ${emailData?.goToWishlistBtnStyle?.icon === "no" ? "url('')" : 'url(https://cdn.shopify.com/s/files/1/0580/0869/8979/files/wishlist-icon.svg?v=1719902841)'};background-repeat:no-repeat;background-size:18px;background-position: 10px;"><span style="color:${emailData?.goToWishlistBtnStyle?.textColor || '#ffffff'} !important; text-decoration:none !important; font-family: Arial, Helvetica, sans-serif;">${emailData?.goToWishlistBtnStyle?.icon === "no" ? "" : '<span style="width:18px;margin-right:5px;display:inline-block;"></span>'} ${emailData?.goToWishlistBtn ? emailData?.goToWishlistBtn : 'Go to wishlist'}</span></a>`

  const shopButton = `<a href="${serverURL}/handleRedirect?redirectUrl=https://${replacements.shopDomain}/products/${replacements.productHandle}?variant=${replacements.variantId}&data=${encodeURIComponent(JSON.stringify(dataToParmas))}" target="_blank" style="text-decoration:none !important;outline:none;box-shadow:none;display:inline-block;text-transform: uppercase;font-size: 12px;line-height: 14px;background:${emailData?.shopNowBtnStyle?.bgColor ? emailData?.shopNowBtnStyle?.bgColor : '#4867A9'};padding: 12px 10px;color: ${emailData?.shopNowBtnStyle?.textColor ? emailData?.shopNowBtnStyle?.textColor : '#fff'} !important;font-weight: 600;font-family: 'Poppins', sans-serif;margin: 25px auto 0;text-align: center;border-radius:${emailData?.shopNowBtnStyle?.borderRadius ? `${emailData?.shopNowBtnStyle?.borderRadius}px` : '10px'};background-image: ${emailData?.shopNowBtnStyle?.icon === "no" ? "url('')" : "url(https://cdn.shopify.com/s/files/1/0580/0869/8979/files/cart-icon.svg?v=1719901933)"};background-repeat: no-repeat;background-size: 18px;background-position: 10px;"><span style="color:${emailData?.shopNowBtnStyle?.textColor || '#ffffff'} !important; text-decoration:none !important; font-family: Arial, Helvetica, sans-serif;">${emailData?.shopNowBtnStyle?.icon === "no" ? "" : '<span style="width: 18px;margin-right: 5px;display:inline-block;"></span>'}${emailData?.shopNowBtn ? emailData?.shopNowBtn : 'Shop Now'}</span></a>`

  const productData = ` <div style="padding:10px;background-color: #fff;border-radius:5px;flex: 1 1 auto;margin: 10px auto;width: 40%;box-shadow: 0px 0px 5px gray !important;"><a href="${serverURL}/handleRedirect?redirectUrl=https://${replacements.shopDomain}/products/${replacements.productHandle}?variant=${replacements.variantId}&data=${encodeURIComponent(JSON.stringify(dataToParmas))}" style="text-decoration:none;outline:none;box-shadow:none;display:block;"><img src="${replacements.imageUrl === '/assets/rabbit_hoodie.png' ? replacements.imageUrl : replacements.imageUrl.startsWith('//') ? `https:${replacements.imageUrl}` : replacements.imageUrl}" alt="Product Image" style="height:180px;width: 100%;object-fit: cover;object-position:center;" /></a>
        <a href="${serverURL}/handleRedirect?redirectUrl=https://${replacements.shopDomain}/products/${replacements.productHandle}&data=${encodeURIComponent(JSON.stringify(dataToParmas))}" style="text-decoration:none;outline:none;box-shadow:none;display:block;"><h2 style="margin:10px 0;font-size: 14px !important;line-height: 18px;
            text-align: center;color: #222;font-weight: 500 !important;font-family: 'Poppins', sans-serif;">${replacements.productTitle}</h2></a>

    ${shopDomain === 'vallila-fi.myshopify.com' ?
      `<a href="${serverURL}/handleRedirect?redirectUrl=https://${replacements.shopDomain}/products/${replacements.productHandle}&data=${encodeURIComponent(JSON.stringify(dataToParmas))}" style="text-decoration:none;outline:none;box-shadow:none;display:grid;text-transform: uppercase;font-size: 12px;line-height: 14px;background:#000000;padding: 12px 5px 12px;color: #fff;font-weight: 600;font-family: 'Poppins', sans-serif;margin: 0 auto;text-align: center;max-width: 150px;border-radius:0px;">
        <span style="width: 18px;margin-right: 5px;display:inline-block;"></span>Lisää ostoskoriin
      </a>`
      :
      `<a href="${serverURL}/handleRedirect?redirectUrl=https://${replacements.shopDomain}/products/${replacements.productHandle}&data=${encodeURIComponent(JSON.stringify(dataToParmas))}" style="text-decoration:none !important;outline:none;box-shadow:none;display:inline-block;text-transform: uppercase;
        font-size: 12px;line-height: 14px;background:${emailData?.addToCartBtnStyle?.bgColor ? emailData?.addToCartBtnStyle?.bgColor : '#4867A9'};padding: 12px 10px;color: ${emailData?.addToCartBtnStyle?.textColor ? emailData?.addToCartBtnStyle?.textColor : '#fff'} !important;font-weight: 600;font-family: 'Poppins', sans-serif;margin: 0 auto; text-align: center;border-radius:${emailData?.addToCartBtnStyle?.borderRadius ? `${emailData?.addToCartBtnStyle?.borderRadius}px` : '10px'};background-image: ${emailData?.addToCartBtnStyle?.icon === "no" ? "url('')" : "url(https://cdn.shopify.com/s/files/1/0580/0869/8979/files/cart-icon.svg?v=1719901933)"};background-repeat: no-repeat;background-size: 18px;background-position: 10px;"><span style="color:${emailData?.addToCartBtnStyle?.textColor || '#ffffff'} !important; text-decoration:none !important; font-family: Arial, Helvetica, sans-serif;">${emailData?.addToCartBtnStyle?.icon === "no" ? "" : '<span style="width: 18px;margin-right: 5px;display:inline-block;"></span>'}${emailData?.addToCartBtn ? emailData?.addToCartBtn : 'Add to cart'}</span></a>`
    }


        </div>`

  const replaceWrappedText = (input, replacements) => {
    if (input) {
      // Initialize result with the input value
      let result = input;

      // Replace {Product Grid} with the provided HTML
      result = result.replace(/{Product Grid}/g, productData);

      // Replace {Logo} with the provided HTML
      result = result.replace(/{Logo}/g, logoData);

      // Replace {Go To Wishlist Button} with the provided HTML
      result = result.replace(/{Go To Wishlist}/g, goToWishlistData);

      // Replace {Shop Button} with the provided HTML
      result = result.replace(/{Shop Button}/g, shopButton);

      //Replace shopDomain
      result = result.replace(/{Your Shop Domain}/g, shopDomainData)

      //Replace empty p tage with <br />
      result = result.replace(/<p>\s*<\/p>/g, '<br />');

      // Replace {text} with styled text
      result = result.replace(/{(.*?)}/g, (match, p1) => {
        const replacementText = replacements[p1] !== undefined ? replacements[p1] : p1;
        return `<b>${replacementText}</b>`;
      });

      // Apply styles to <a> tags, if any
      result = result.replace(/<a\s([^>]*)>/g, '<a $1 style="outline: none; box-shadow: none; color: #4605fa; font-weight: bold;" target="_blank">');
      result = result.replace(/<\/a>/g, '</a>');

      // Apply styles to <h1> tags, if any
      result = result.replace(/<h1([^>]*)>/g, '<h1$1 style="font-size: 32px; font-weight: bold;">');
      result = result.replace(/<\/h1>/g, '</h1>');

      // Apply styles to <h2> tags, if any
      result = result.replace(/<h2([^>]*)>/g, '<h2$1 style="font-size: 24px; font-weight: bold;">');
      result = result.replace(/<\/h2>/g, '</h2>');

      return result;
    } else {
      return "";
    }
  };


  let bodyData = replaceWrappedText(emailData.firstRow, replacements)
  let footerData = replaceWrappedText(emailData.footerRow, replacements)

  function addLineHeightToStyledSpans(html) {
    const spanWithStylesPattern = /(<span[^>]*style="[^"]*)([^"]*")(.*?<\/span>)/g;
    return html.replace(spanWithStylesPattern, (match, p1, p2, p3) => {
      return `${p1}line-height: 26px;${p2}${p3}`;
    });
  }

  bodyData = addLineHeightToStyledSpans(bodyData)
  footerData = addLineHeightToStyledSpans(footerData)

  // <a href="${serverURL}/handleRedirect?redirectUrl=https://wishlist-guru.webframez.com&data=${encodeURIComponent(JSON.stringify(dataToParmas))}" target="_blank" style="text-decoration: none;outline: none;	box-shadow: none;display: block;
  // max-width: 200px;margin: 0 auto;"><img src="${imgSrc}" alt="Wishlist" style="width:100%;"/></a>

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
            box-sizing:border-box;
            -webkit-box-sizing:border-box;
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
                <td style="background:${emailData.headerBgColor ? emailData.headerBgColor : 'transparent'};padding:15px;border-bottom: 1px dotted #ebe3e3;">
                ${imgSrc}
               </td>
            </tr>
        </table>


        <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0"
        style="border-collapse: collapse; border-spacing: 0;padding: 0;width:100%;">
        <tr><td style="background:${emailData.contentBgColor ? emailData.contentBgColor : 'transparent'};padding-top:50px;padding-bottom:50px;padding-left:15px;padding-right:15px;">
        
        <div class="content-paragraph" style="font-size:16px;line-height:26px;color:#222;font-weight:400;font-family:'Poppins', sans-serif;text-align: center;max-width: 520px;margin: 0 auto 25px;">
        
        ${bodyData}
        
        </div>
        </td>
        </tr>
        </table>
      </div>
  
        <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0"
        style="border-collapse: collapse; border-spacing: 0;padding: 0;width:100%;max-width:700px;margin:0 auto;background-color:#F8F2FD;">
          <tr>
            <td style="background:${emailData.footerBgColor ? emailData.footerBgColor : 'transparent'};padding-top:30px;padding-bottom:20px;padding-left:15px;padding-right:15px;">
            ${emailData.isLogo
      ? `${imgSrc}` : ""}

            <div style="margin: 0 auto 30px;text-align: center;font-size: 15px;line-height: 20px;font-weight: 400;color: #222;font-family: 'Poppins', sans-serif;
            max-width: 500px;">
              ${footerData}
            </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
}