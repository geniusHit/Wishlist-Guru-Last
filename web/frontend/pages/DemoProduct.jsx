import React from 'react';
import { Text, Button, ButtonGroup } from '@shopify/polaris';
// import Hoodie from '../assets/curtain.jpg';
import Hoodie from '../assets/rabbit_hoodie.png';


const DemoProducts = ({ watchAllFields, selectedBtn, myLanguage }) => {

    const onlyTextButton = watchAllFields.buttonTypeRadio === "text" || watchAllFields.buttonTypeRadio === "icon-text"
    return (
        <div className='demoProduct'>
            <Text as="h2" variant="headingSm">{myLanguage.previewHeadingText}</Text>
            <div className='demoImgWrapper'>
                <img src={Hoodie} alt="Rabbit Hoodie" />

                <div className={
                    `chooseicon2 ${watchAllFields.pdpIcon === "yes" ? (
                        watchAllFields.pdpIconPosition === "icon-top-right" ? "icon-top-right "
                            : watchAllFields.pdpIconPosition === "icon-top-left" ? "icon-top-left "
                                : watchAllFields.pdpIconPosition === "icon-bottom-left" ? "icon-bottom-left "
                                    : watchAllFields.pdpIconPosition === "icon-bottom-right" ? "icon-bottom-right "
                                        : "") : "displayNone "}
                
                ${watchAllFields.iconType === "heart" ? "heartICON "
                        : watchAllFields.iconType === "star" ? "starICON "
                            : watchAllFields.iconType === "save" ? "saveICON "
                                : ""
                    }`
                }></div>
            </div>


            <div className='demoTitleWrapper'>
                <div className={
                    `chooseicon2
                
                ${watchAllFields.iconBesideTitle === "left" ?
                        (
                            watchAllFields.iconType === "heart" ? "heartICON "
                                : watchAllFields.iconType === "star" ? "starICON "
                                    : watchAllFields.iconType === "save" ? "saveICON "
                                        : "displayNone "
                        )
                        : "displayNone "
                    }
                    
                `
                }></div>

                <Text as="h3" variant="headingXl">{myLanguage.previewProductName}</Text>

                <div className={
                    `chooseicon2
                ${watchAllFields.iconBesideTitle === "right" ?
                        (
                            watchAllFields.iconType === "heart" ? "heartICON "
                                : watchAllFields.iconType === "star" ? "starICON "
                                    : watchAllFields.iconType === "save" ? "saveICON "
                                        : "displayNone "
                        ) :
                        "displayNone "
                    }
                `
                }></div>
            </div>

            <div className='product-price-priv'>{myLanguage.previewProductPrice} 610.99</div>

            <div className='wf-product-color-varition'>
                <Text as='p' variant='body'>{myLanguage.previewProductColor}</Text>

                <ButtonGroup>
                    <Button size='slim'>{myLanguage.ppcValue1}</Button>
                    <Button size='slim'>{myLanguage.ppcValue2}</Button>
                    <Button size='slim'>{myLanguage.ppcValue3}</Button>
                </ButtonGroup>
            </div>

            <div className='demoCartWrapper'>
                <div className={
                    `chooseicon2
                
                ${watchAllFields.iconBesideAddToCart === "left" ?
                        (
                            watchAllFields.iconType === "heart" ? "heartICON "
                                : watchAllFields.iconType === "star" ? "starICON "
                                    : watchAllFields.iconType === "save" ? "saveICON "
                                        : "displayNone ")
                        : "displayNone "
                    }
                    
                `
                }></div>


                <p id='addToCartDemo' className='demoSpans'><Button>add to cart</Button></p>
                <div className={
                    `chooseicon2
                
                ${watchAllFields.iconBesideAddToCart === "right" ?
                        (
                            watchAllFields.iconType === "heart" ? "heartICON "
                                : watchAllFields.iconType === "star" ? "starICON "
                                    : watchAllFields.iconType === "save" ? "saveICON "
                                        : "")
                        : "displayNone "
                    }
                    
                `
                }></div>
            </div>

            <span className="skeleton-div" style={{ display: "flex" }}>
                {watchAllFields.buttonTypeRadio === "text-button" ? selectedBtn.textButtonFxn() : ""}
                {watchAllFields.buttonTypeRadio === "icon-text-button" ? selectedBtn.iconTextButtonFxn("") : ""}
                {watchAllFields.buttonTypeRadio === "text" ? selectedBtn.textFxn() : ""}
                {watchAllFields.buttonTypeRadio === "icon-text" ? selectedBtn.iconTextFxn("") : ""}
                {watchAllFields.buttonTypeRadio === "icon" ? selectedBtn.iconFxn("") : ""}
                {watchAllFields.showCount !== "no" && !onlyTextButton ? <div id='wf-count-demo'>12</div> : ""}
            </span>
        </div>
    )
}

export default DemoProducts;