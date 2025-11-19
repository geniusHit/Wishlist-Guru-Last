import { AlphaCard, Tabs, Text, Button, TextField, Checkbox, Grid, RadioButton } from '@shopify/polaris';
import React, { useEffect, useState } from 'react';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import Hoodie from '../../assets/rabbit_hoodie.png';
import { priceDropFxn } from '../../../backend/emailTemplates/priceDrop';
import { backInStockFxn } from '../../../backend/emailTemplates/backInStock';
import { limitedStockFxn } from '../../../backend/emailTemplates/limitedStock';
import SkeletonPage1 from '../SkeletonPage1';
import ColorPickerController from '../../hooks/useColorPickerController';
import { useForm } from 'react-hook-form';
import { userWishlistTableFxn } from '../../../backend/emailTemplates/userWishlistTableFxn';
import RangeController from '../../hooks/useRangeController';
import SingleFieldController from '../../hooks/useSingleFieldController';


const EditTemplate = ({ value }) => {
  const { handleSubmit, control, watch, reset, } = useForm();
  const watchColors = watch();
  const [isLoaded, setIsLoaded] = useState(false);
  const [editorStateFirst, setEditorStateFirst] = useState(EditorState.createEmpty());
  const [emailSubject, setEmailSubject] = useState("");
  const [emailSenderName, setEmailSenderName] = useState("");
  const [replyToEmail, setReplyToEmail] = useState("");


  const [addToCartBtn, setAddToCartBtn] = useState("");
  const [shopNowBtn, setShopNowBtn] = useState("");
  const [goToWishlistBtn, setGoToWishlistBtn] = useState("")

  const [editorFooterState, setEditorFooterState] = useState(EditorState.createEmpty());
  const [isLogo, setIsLogo] = useState(false);
  const [bodyContent, setBodyContent] = useState('');
  const [smtpDetail, setSmtpDetail] = useState([]);

  const { tempData, search, file, serverURL, appInstallId, shopData, Swal, myLanguage, loaderGif, headerSave, setHeaderSave, priceDropData, lowStockData, backInStockData, weeklyEmailData, getTemplates } = value;

  const logoResult = file?.name || null;
  const searchParams = new URLSearchParams(search.trim());
  const temp_type = searchParams.get('type');
  const tempId = searchParams.get('temp_id');

  const customer = { name: 'Customer' };
  const productTitle = 'Sample Product';
  const variantId = '123';
  const previousPrice = '$50';
  const updatedPrice = '$30';
  const discountPercentage = '40%';
  const productHandle = 'sample-product';
  const shopDomain = 'your-shop.myshopify.com';
  const shopName = 'your-shop.myshopify.com';
  const imageUrl = Hoodie;
  const admin = "yes";

  useEffect(() => {
    const loadTemplate = async () => {
      const tempValue = await filterTemplate();
      if (tempValue) {
        setEditorStateFirst(htmlToDraftFxn(tempValue.firstRow || ""));
        setEditorFooterState(htmlToDraftFxn(tempValue.footerRow || ""));
        setIsLogo(tempValue.isLogo)
        setEmailSubject(tempValue.emailSubject)
        setAddToCartBtn(tempValue.addToCartBtn)
        setShopNowBtn(tempValue.shopNowBtn)
        setGoToWishlistBtn(tempValue.goToWishlistBtn)

        setEmailSenderName(tempData[0].senderName)
        setReplyToEmail(tempData[0].replyToMail)
        reset({
          headerBgColor: tempValue.headerBgColor,
          contentBgColor: tempValue.contentBgColor,
          contentColor: tempValue.contentColor,
          footerBgColor: tempValue.footerBgColor,
          footerColor: tempValue.footerColor,

          atcTextColor: tempValue.addToCartBtnStyle.textColor,
          atcBgColor: tempValue.addToCartBtnStyle.bgColor,
          atcBorderRadius: tempValue.addToCartBtnStyle.borderRadius,
          atcIcon: tempValue.addToCartBtnStyle.icon,
          snTextColor: tempValue.shopNowBtnStyle.textColor,
          snBgColor: tempValue.shopNowBtnStyle.bgColor,
          snBorderRadius: tempValue.shopNowBtnStyle.borderRadius,
          snIcon: tempValue.shopNowBtnStyle.icon,
          gtwTextColor: tempValue.goToWishlistBtnStyle.textColor,
          gtwBgColor: tempValue.goToWishlistBtnStyle.bgColor,
          gtwBorderRadius: tempValue.goToWishlistBtnStyle.borderRadius,
          gtwIcon: tempValue.goToWishlistBtnStyle.icon,

        })
      }
      await getSmtpDataFromSql(shopData.shopName);
    };
    loadTemplate();
    setIsLoaded(true);


  }, [tempData]);




  async function getSmtpDataFromSql(data) {
    try {
      const response = await fetch(`${serverURL}/get-smtp-detail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopName: data
        }),
      });
      let result = await response.json();

      if (result.success === true) {
        setSmtpDetail(result.data);
      }

    } catch (error) {
      console.log("Err -", error)
    }
  }

  const htmlToDraftFxn = (html) => {
    const blocksFromHtml = htmlToDraft(html);
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    return EditorState.createWithContent(contentState);
  };

  function renderColor(data, color) {
    const colorRegex = /style="[^"]*color:\s*([^";]+);[^"]*"/;
    const matchBody = colorRegex.exec(data);
    const originalColor = matchBody ? matchBody[1] : null;
    const escapeRegExp = (string) => string?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const colorRegexBody = new RegExp(`color:\\s*${escapeRegExp(originalColor)}`, 'gi');
    return data.replace(
      colorRegexBody,
      `color: ${color}`
    );
  }

  useEffect(() => {
    let htmlContent;
    const bodyData = getEditorStateContent(editorStateFirst);
    const footerData = getEditorStateContent(editorFooterState);

    const coloredBodyData = watchColors.contentColor ?
      renderColor(bodyData, watchColors.contentColor) : bodyData;

    const coloredFooterData = watchColors.footerColor ?
      renderColor(footerData, watchColors.footerColor) : footerData;

    const emailData = {
      firstRow: coloredBodyData,
      footerRow: coloredFooterData,
      isLogo: isLogo,
      headerBgColor: watchColors.headerBgColor,
      contentBgColor: watchColors.contentBgColor,
      contentColor: watchColors.contentColor,
      footerBgColor: watchColors.footerBgColor,
      footerColor: watchColors.footerColor,

      addToCartBtn: addToCartBtn,
      shopNowBtn: shopNowBtn,
      goToWishlistBtn: goToWishlistBtn,

      addToCartBtnStyle: {
        textColor: watchColors.atcTextColor,
        bgColor: watchColors.atcBgColor,
        borderRadius: watchColors.atcBorderRadius,
        borderRadiusUnit: watchColors.atcBorderRadiusUnit,
        icon: watchColors.atcIcon,
      },
      shopNowBtnStyle: {
        textColor: watchColors.snTextColor,
        bgColor: watchColors.snBgColor,
        borderRadius: watchColors.snBorderRadius,
        borderRadiusUnit: watchColors.snBorderRadiusUnit,
        icon: watchColors.snIcon,
      },
      goToWishlistBtnStyle: {
        textColor: watchColors.gtwTextColor,
        bgColor: watchColors.gtwBgColor,
        borderRadius: watchColors.gtwBorderRadius,
        borderRadiusUnit: watchColors.gtwBorderRadiusUnit,
        icon: watchColors.gtwIcon
      },

    }
    const dataToParmas = {

    }

    const dataArray = [
      {
        title: productTitle,
        variantId,
        handle: productHandle,
        image: imageUrl,
        price: previousPrice
      },
      {
        title: productTitle,
        variantId,
        handle: productHandle,
        image: imageUrl,
        price: previousPrice
      },
      {
        title: productTitle,
        variantId,
        handle: productHandle,
        image: imageUrl,
        price: previousPrice
      },
    ]

    if (temp_type === "PriceDrop") {
      htmlContent = priceDropFxn(
        customer,
        productTitle,
        variantId,
        previousPrice,
        updatedPrice,
        discountPercentage,
        productHandle,
        shopDomain,
        imageUrl,
        logoResult,
        serverURL,
        appInstallId,
        emailData,
        dataToParmas,
        admin,
        // smtpDetail
      );
    } else if (temp_type === "LowInStock") {
      htmlContent = limitedStockFxn(
        customer,
        productTitle,
        variantId,
        productHandle,
        shopDomain,
        imageUrl,
        logoResult,
        serverURL,
        appInstallId,
        emailData,
        dataToParmas,
        admin,
        // smtpDetail
      );
    } else if (temp_type === "BackInStock") {
      htmlContent = backInStockFxn(
        customer,
        productTitle,
        variantId,
        productHandle,
        shopDomain,
        imageUrl,
        logoResult,
        serverURL,
        appInstallId,
        emailData,
        dataToParmas,
        admin,
        // smtpDetail
      );
    } else {
      htmlContent = userWishlistTableFxn(
        dataArray,
        customer,
        emailData,
        appInstallId,
        logoResult,
        shopDomain,
        serverURL,
        dataToParmas,
        admin,
        // smtpDetail
      )
    }

    const bodyContent = getBodyContent(htmlContent);
    setBodyContent(bodyContent);
  }, [editorStateFirst, editorFooterState, isLogo, watchColors]);

  const getEditorStateContent = (editorState) => {
    const contentState = editorState.getCurrentContent();
    return draftToHtml(convertToRaw(contentState));
  };

  async function filterTemplate() {
    // setEmailSenderName(prevState => prevState = tempData[0].senderName)
    const tempType = tempData.filter(item => item.type === temp_type);
    if (tempType.length === 0) {
      return null;
    }


    // console.log("tempType", tempType)
    switch (temp_type) {
      case 'PriceDrop':
        return tempType[0].price_drop_temp;
      case 'BackInStock':
        return tempType[0].back_in_stock_temp;
      case 'LowInStock':
        return tempType[0].low_in_stock_temp;
      default:
        return tempType[0].weekly_email_temp;
    }
  }

  const resetHandler = async () => {
    try {
      Swal.fire({
        title: myLanguage.swalDeleteHeading,
        text: myLanguage.swalDeleteTextReset,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f54542",
        cancelButtonColor: "#3085d6",
        cancelButtonText: myLanguage.swalButtonCancelText,
        confirmButtonText: myLanguage.swalDeleteConfirmReset,
      }).then(async (result) => {
        if (result.isConfirmed) {
          const tempName = temp_type === "PriceDrop" ? priceDropData : temp_type === "LowInStock" ? lowStockData : temp_type === "BackInStock" ? backInStockData : weeklyEmailData
          await updateData(tempName)
          await getTemplates(shopData)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  async function handleUpdateTemplate(data) {

    const tempName = await filterTemplate();

    const bodyData = getEditorStateContent(editorStateFirst);
    const footerData = getEditorStateContent(editorFooterState);

    const coloredBodyData = watchColors.contentColor ?
      renderColor(bodyData, watchColors.contentColor) : bodyData;

    const coloredFooterData = watchColors.footerColor ?
      renderColor(footerData, watchColors.footerColor) : footerData;

    tempName.firstRow = coloredBodyData;
    tempName.footerRow = coloredFooterData;
    tempName.emailSubject = emailSubject;
    tempName.addToCartBtn = addToCartBtn;
    tempName.shopNowBtn = shopNowBtn;
    tempName.goToWishlistBtn = goToWishlistBtn;

    tempName.addToCartBtnStyle = {
      textColor: data.atcTextColor,
      bgColor: data.atcBgColor,
      // borderColor: data.atcBorderColor,
      borderRadius: data.atcBorderRadius,
      borderRadiusUnit: data.atcBorderRadiusUnit,
      icon: data.atcIcon
    };
    tempName.shopNowBtnStyle = {
      textColor: data.snTextColor,
      bgColor: data.snBgColor,
      // borderColor: data.snBorderColor,
      borderRadius: data.snBorderRadius,
      borderRadiusUnit: data.snBorderRadiusUnit,
      icon: data.snIcon
    };
    tempName.goToWishlistBtnStyle = {
      textColor: data.gtwTextColor,
      bgColor: data.gtwBgColor,
      // borderColor: data.snBorderColor,
      borderRadius: data.gtwBorderRadius,
      borderRadiusUnit: data.gtwBorderRadiusUnit,
      icon: data.gtwIcon
    };

    // tempName.senderName = emailSenderName
    tempName.isLogo = isLogo
    tempName.headerBgColor = data.headerBgColor
    tempName.contentBgColor = data.contentBgColor
    tempName.contentColor = data.contentColor
    tempName.footerBgColor = data.footerBgColor
    tempName.footerColor = data.footerColor
    await updateData(tempName)
  }

  async function updateData(tempName) {
    Swal.fire({
      text: myLanguage.swalWaiting,
      imageUrl: loaderGif,
      showConfirmButton: false,
    });
    try {
      const response = await fetch(`${serverURL}/email-template-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopName: shopData.shopName,
          tempName: JSON.stringify(tempName),
          tempClm: temp_type,
          tempId: tempId,
          // senderName: emailSenderName
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const results = await response.json();
      if (results.msg === "Data Updated") {
        Swal.fire({
          icon: "success",
          title: myLanguage.swalHeading,
          text: myLanguage.swalText
        });
        setHeaderSave(false)
      }

    } catch (error) {
      console.error("Error updating template:", error);
    }
  }

  const getBodyContent = (htmlContent) => {
    const match = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/);
    return match ? match[1] : '';
  };

  const replaceWrappedText1 = (input) => {
    return `<p>${input}</p>`;
  };

  const onEditorStateChange = (editorState) => {
    setEditorStateFirst(editorState)
    setHeaderSave(true)
  }

  const onEditorFooterStateChange = (editorState) => {
    setEditorFooterState(editorState)
    setHeaderSave(true)
  }

  const handleIsLogo = () => {
    setIsLogo(prevState => !prevState);
    setHeaderSave(true)
  };

  const handleChangeEmailSubject = (value) => {
    setEmailSubject(value);
    setHeaderSave(true);
  }

  const handleChangeAddTocartBtn = (value) => {
    setAddToCartBtn(value);
    setHeaderSave(true);
  }

  const handleChangeShopNowBtn = (value) => {
    setShopNowBtn(value);
    setHeaderSave(true);
  }

  const handleChangeGoToWishlistBtn = (value) => {
    setGoToWishlistBtn(value);
    setHeaderSave(true);
  }

  // const handleChangeEmailSenderName = (value) => {
  //   setEmailSenderName(prevState => prevState = value)
  //   setHeaderSave(true)
  // }



  function replaceAnchorHrefs(htmlString) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    const links = tempDiv.querySelectorAll('a');

    links.forEach(link => {
      const span = document.createElement('span');
      span.style.cssText = link.style.cssText;
      span.innerHTML = link.innerHTML;
      link.parentNode.replaceChild(span, link);
    });

    const images = tempDiv.querySelectorAll('img');
    images.forEach(img => {
      if (img.src.endsWith('/assets/rabbit_hoodie.png')) {
        const div = document.createElement('div');
        div.style.width = '100%';
        div.style.height = '180px';

        div.style.display = 'flex';
        div.style.backgroundColor = '#f0f0f0';

        const span = document.createElement('span');
        span.innerText = 'Product Image';
        span.style.margin = 'auto';
        div.appendChild(span);
        img.parentNode.replaceChild(div, img);
      }
    });

    return tempDiv.innerHTML;
  }

  const sendTestEmail = () => {
    let newBodyContent = replaceAnchorHrefs(bodyContent)

    const replacements = {
      'Product Title': "Sample Product",
      'Your Shop Domain': "your-store.myshopify.com"
    };

    let emailSubjectValue = replaceWrappedText(emailSubject, replacements)

    Swal.fire({
      text: myLanguage.sendTestEmail,
      input: "email",
      inputAttributes: {
        autocapitalize: "off",
        placeholder: myLanguage.emailPlaceholder
      },
      showCancelButton: true,
      confirmButtonText: myLanguage.sendButton,
      cancelButtonText: myLanguage.swalButtonCancelText,
      showLoaderOnConfirm: true,
      preConfirm: async (inputValue) => {
        try {
          const response = await fetch(`${serverURL}/send-test-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              recieverEmail: inputValue,
              subject: emailSubjectValue,
              htmlContent: newBodyContent,
              logoResult: logoResult,
              app_install_id: appInstallId,
              senderName: emailSenderName,
              replyTo: replyToEmail,
              shopName: shopData.shopName
            }),
          });

          if (!response.ok) {
            return Swal.showValidationMessage(`
              ${JSON.stringify(await response.json())}
            `);
          }
          return response.json();
        } catch (error) {
          Swal.showValidationMessage(`
            Request failed: ${error}
          `);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: `success`,
          text: myLanguage.emailSentText
        });
      }
    });
  }

  function replaceWrappedText(input, replacements) {
    if (input) {
      return input.replace(/{(.*?)}/g, (match, p1) => {
        const replacementText = replacements[p1] !== undefined ? replacements[p1] : p1;
        return replacementText;
      });
    }
  };

  return (
    !isLoaded ? <SkeletonPage1 />
      :
      <>
        <form onSubmit={handleSubmit(handleUpdateTemplate)}>
          {headerSave ? <div className="header-save wf-edit-header-save"><button type='submit'>{myLanguage.save}</button></div> : ""}

          <div className='wf-edit-template'>
            <div className='wf-edit-template-left'>
              <div className='wf-style-wishbtn'>
                <div className='pb-15'>
                  <Text variant="headingMd" as="h2">{myLanguage.tokenHeading}</Text>
                  <p>{myLanguage.tokenSubHeading}</p>
                </div>

                <div className='pb-15'>
                  <p><span className='keySpan'>{myLanguage.CustomerToken}</span>: <span>{myLanguage.CustomerTokenValue}</span></p>
                  <p><span className='keySpan'>{myLanguage.ProductToken}</span>: <span>{myLanguage.ProductTokenValue}</span></p>
                  <p><span className='keySpan'>{myLanguage.DomainToken}</span>: <span>{myLanguage.DomainTokenValue}</span></p>
                  <p><span className='keySpan'>{myLanguage.LogoToken}</span>: <span>{myLanguage.LogoTokenValue}</span></p>
                  <p><span className='keySpan'>{myLanguage.ProductToken}</span>: <span>{myLanguage.ProductTokenValue}</span></p>
                  <p><span className='keySpan'>{myLanguage.shopButtonToken}</span>: <span>{myLanguage.shopButtonTokenValue}</span></p>
                  <p><span className='keySpan'>{myLanguage.wishlistButtonToken}</span>: <span>{myLanguage.wishlistButtonTokenValue}</span></p>
                </div>
              </div>

              <div className='wf-style-wishbtn'>
                <div className='pb-15'>
                  <Text variant="headingMd" as="h2">{myLanguage.colorHeading}</Text>
                  <p>{myLanguage.colorSubHeading}</p>
                </div>
                <div className='pb-15'>


                  <div className='wf-template-colors'>

                    <ColorPickerController control={control} controllerName='headerBgColor' id='headerBgColor' label={myLanguage.emailHeader} setSaveBar={setHeaderSave} />

                    <ColorPickerController control={control} controllerName='contentBgColor' id='contentBgColor' label={myLanguage.emailContentBG} setSaveBar={setHeaderSave} />

                    <ColorPickerController control={control} controllerName='contentColor' id='contentColor' label={myLanguage.emailContentText} setSaveBar={setHeaderSave} />

                    <ColorPickerController control={control} controllerName='footerBgColor' id='footerBgColor' label={myLanguage.emailFooterBG} setSaveBar={setHeaderSave} />

                    <ColorPickerController control={control} controllerName='footerColor' id='footerColor' label={myLanguage.emailFooterText} setSaveBar={setHeaderSave} />
                  </div>
                </div>
              </div>

              <div className='wf-style-wishbtn'>
                <div className='pb-15'>
                  <Text variant="headingMd" as="h2">{myLanguage.emailSubject}</Text>
                  <p>{myLanguage.emailSubjectSubHeading}</p>
                </div>
                <div className='pb-15'>
                  <TextField
                    value={emailSubject}
                    onChange={handleChangeEmailSubject}
                    autoComplete="off"
                  />
                </div><br />

                <Text variant="headingMd" as="h2">{myLanguage.atcHeading}</Text>
                <div className='wf-template-colors wf-wishlist-range-box'>
                  <TextField
                    value={addToCartBtn}
                    onChange={handleChangeAddTocartBtn}
                    label={myLanguage.atcText}
                    autoComplete="off"
                  />
                  <RangeController control={control} controllerName={`atcBorderRadius`} selectControllerName={`atcBorderRadiusUnit`} label={myLanguage.styleBorderRadius} max={100} setSaveBar={setHeaderSave} unit={"pixel"} />
                  <ColorPickerController control={control} controllerName='atcTextColor' id='atcTextColor' label={myLanguage.atcTextColor} setSaveBar={setHeaderSave} />
                  <ColorPickerController control={control} controllerName='atcBgColor' id='atcBgColor' label={myLanguage.atcBgColor} setSaveBar={setHeaderSave} />
                  {/* <ColorPickerController control={control} controllerName='atcBorderColor' id='atcBorderColor' label="Border color" setSaveBar={setHeaderSave} /> */}
                  <div>
                    <div style={{ paddingBottom: "10px" }}>
                      <h5>{myLanguage.atcShowIcon}</h5>
                    </div>
                    <div style={{ display: "flex", gap: "40px" }}>
                      <SingleFieldController
                        name="atcIcon"
                        control={control}  >
                        {({ field }) =>
                          <RadioButton
                            label={myLanguage.styleHoverYes}
                            value={field.value}
                            // id="yes"
                            checked={field.value === "yes" && true}
                            onChange={() => {
                              field.onChange("yes"),
                                setHeaderSave(true);
                            }}
                          />
                        }
                      </SingleFieldController>

                      <SingleFieldController
                        name="atcIcon"
                        control={control}  >
                        {({ field }) =>
                          <RadioButton
                            label={myLanguage.styleHoverNo}
                            value={field.value}
                            // id="no"
                            checked={field.value === "no" && true}
                            onChange={() => {
                              field.onChange("no"),
                                setHeaderSave(true);
                            }}
                          />
                        }
                      </SingleFieldController>
                    </div>
                  </div>
                </div>

                <br />

                <Text variant="headingMd" as="h2">{myLanguage.snHeading}</Text>
                <div className='wf-template-colors wf-wishlist-range-box'>
                  <TextField
                    value={shopNowBtn}
                    onChange={handleChangeShopNowBtn}
                    autoComplete="off"
                    label={myLanguage.snText}
                  />
                  <RangeController control={control} controllerName={`snBorderRadius`} selectControllerName={`snBorderRadiusUnit`} label={myLanguage.styleBorderRadius} max={100} setSaveBar={setHeaderSave} unit={"pixel"} />
                  <ColorPickerController control={control} controllerName='snTextColor' id='snTextColor' label={myLanguage.atcTextColor} setSaveBar={setHeaderSave} />
                  <ColorPickerController control={control} controllerName='snBgColor' id='snBgColor' label={myLanguage.atcBgColor} setSaveBar={setHeaderSave} />
                  {/* <ColorPickerController control={control} controllerName='snBorderColor' id='snBorderColor' label="Border color" setSaveBar={setHeaderSave} /> */}

                  <div>
                    <div style={{ paddingBottom: "10px" }}>
                      <h5>{myLanguage.atcShowIcon}</h5>
                    </div>
                    <div style={{ display: "flex", gap: "40px" }}>
                      <SingleFieldController
                        name="snIcon"
                        control={control}  >
                        {({ field }) =>
                          <RadioButton
                            label={myLanguage.styleHoverYes}
                            value={field.value}
                            // id="yes"
                            checked={field.value === "yes" && true}
                            onChange={() => {
                              field.onChange("yes"),
                                setHeaderSave(true);
                            }}
                          />
                        }
                      </SingleFieldController>

                      <SingleFieldController
                        name="snIcon"
                        control={control}  >
                        {({ field }) =>
                          <RadioButton
                            label={myLanguage.styleHoverNo}
                            value={field.value}
                            // id="no"
                            checked={field.value === "no" && true}
                            onChange={() => {
                              field.onChange("no"),
                                setHeaderSave(true);
                            }}
                          />
                        }
                      </SingleFieldController>
                    </div>
                  </div>

                </div>

                <br />

                <Text variant="headingMd" as="h2">{myLanguage.gtwHeading}</Text>
                <div className='wf-template-colors wf-wishlist-range-box'>
                  <TextField
                    value={goToWishlistBtn}
                    onChange={handleChangeGoToWishlistBtn}
                    autoComplete="off"
                    label={myLanguage.gtwText}
                  />
                  <RangeController control={control} controllerName={`gtwBorderRadius`} selectControllerName={`gtwBorderRadiusUnit`} label={myLanguage.styleBorderRadius} max={100} setSaveBar={setHeaderSave} unit={"pixel"} />
                  <ColorPickerController control={control} controllerName='gtwTextColor' id='gtwTextColor' label={myLanguage.atcTextColor} setSaveBar={setHeaderSave} />
                  <ColorPickerController control={control} controllerName='gtwBgColor' id='gtwBgColor' label={myLanguage.atcBgColor} setSaveBar={setHeaderSave} />
                  {/* <ColorPickerController control={control} controllerName='gtwBorderColor' id='gtwBorderColor' label="Border color" setSaveBar={setHeaderSave} /> */}

                  <div>
                    <div style={{ paddingBottom: "10px" }}>
                      <h5>{myLanguage.atcShowIcon}</h5>
                    </div>
                    <div style={{ display: "flex", gap: "40px" }}>
                      <SingleFieldController
                        name="gtwIcon"
                        control={control}  >
                        {({ field }) =>
                          <RadioButton
                            label={myLanguage.styleHoverYes}
                            value={field.value}
                            // id="yes"
                            checked={field.value === "yes" && true}
                            onChange={() => {
                              field.onChange("yes"),
                                setHeaderSave(true);
                            }}
                          />
                        }
                      </SingleFieldController>

                      <SingleFieldController
                        name="gtwIcon"
                        control={control}  >
                        {({ field }) =>
                          <RadioButton
                            label={myLanguage.styleHoverNo}
                            value={field.value}
                            // id="no"
                            checked={field.value === "no" && true}
                            onChange={() => {
                              field.onChange("no"),
                                setHeaderSave(true);
                            }}
                          />
                        }
                      </SingleFieldController>
                    </div>
                  </div>

                </div>

              </div>


              {/* <div className='wf-style-wishbtn'>
                <div className='pb-15'>
                  <Text variant="headingMd" as="h2">Sender Name</Text>
                  <p>Please enter the sender name</p>
                </div>

                {console.log("emailSenderName --- ", emailSenderName)}
                <div className='pb-15'>
                  <TextField
                    value={emailSenderName}
                    onChange={handleChangeEmailSenderName}
                    autoComplete="off"
                  />
                </div>
              </div> */}


              <div className='wf-style-wishbtn'>
                <div className='pb-15'>
                  <Text variant="headingMd" as="h2">{myLanguage.emailContent}</Text>
                  <p>{myLanguage.emailContentSubheading}</p>
                </div>
                <div className='wf-template-editor pb-15'>
                  <Editor
                    editorState={editorStateFirst}
                    onEditorStateChange={onEditorStateChange}

                    toolbar={{
                      options: [
                        'inline',
                        'blockType',
                        'fontSize',
                        'fontFamily',
                        'list',
                        'textAlign',
                        'colorPicker',
                        'link',
                        'embedded',
                        'emoji',
                        'remove',
                        'history',
                      ],
                      fontFamily: {
                        options: [
                          'Arial',
                          'Georgia',
                          'Impact',
                          'Tahoma',
                          'Times New Roman',
                          'Verdana',
                          'Courier New',
                          'Montserrat', // ✅ Added Montserrat
                          'Poppins',    // ✅ added
                        ],
                      },
                    }}


                  />
                </div>
              </div>

              <div className='wf-style-wishbtn'>
                <div className='pb-15'>
                  <Text variant="headingMd" as="h2">{myLanguage.FooterContent}</Text>
                  <p>{myLanguage.footerSubheading}</p>
                </div>

                <div className='wf-footerDiv'>
                  <Checkbox
                    id="isLogo"
                    label={myLanguage.displayLogo}
                    checked={isLogo}
                    onChange={handleIsLogo}
                  />
                </div>

                <div className='wf-template-editor pb-15'>
                  <Editor
                    editorState={editorFooterState}
                    onEditorStateChange={onEditorFooterStateChange}

                    toolbar={{
                      options: [
                        'inline',
                        'blockType',
                        'fontSize',
                        'fontFamily',
                        'list',
                        'textAlign',
                        'colorPicker',
                        'link',
                        'embedded',
                        'emoji',
                        'remove',
                        'history',
                      ],
                      fontFamily: {
                        options: [
                          'Arial',
                          'Georgia',
                          'Impact',
                          'Tahoma',
                          'Times New Roman',
                          'Verdana',
                          'Courier New',
                          'Montserrat', // ✅ Added Montserrat
                          'Poppins',    // ✅ added
                        ],
                      },
                    }}

                  />
                </div>
              </div>
            </div>

            <div className='wf-edit-template-left wf-style-wishbtn wf-right'>
              <AlphaCard>
                <div className='pb-15 wf-previewDiv'>
                  <Text variant="headingMd" as="h2">{myLanguage.previewHeadingText}</Text>
                  <div className='editBtn disable-app'>
                    <Button onClick={sendTestEmail}>{myLanguage.sendTestEmail}</Button>
                    <div className='wf-resetButton'><Button onClick={resetHandler}>{myLanguage.resetBtn}</Button></div>
                  </div>
                </div>
                <div dangerouslySetInnerHTML={{ __html: bodyContent }} style={{ pointerEvents: 'none' }} />
              </AlphaCard>
            </div>
          </div>
        </form>
      </>
  );
};

export default EditTemplate;
