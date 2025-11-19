import React from 'react'
import { AlphaCard, Select, Text, TextField } from '@shopify/polaris';
import SingleFieldController from '../../hooks/useSingleFieldController';

const LanguageSwitcher = ({ data }) => {
    const myLanguage = data.myLanguage;
    const control = data.control;
    const setSaveBar = data.setSaveBar;
    const updateLang = data.updateLang;
    const currentPlan = data.currentPlan;
    const languageTypes = data.languageTypes;
    const language_id = data.language_id;

    return (
        <>
            <div className='wf-style-wishbtn'>
                <div style={{ position: "relative" }} id="language-section">
                    <AlphaCard>
                        {
                            language_id === null &&
                            <>
                                <div className='pb-15'>
                                    <Text variant="headingMd" as="h2">{myLanguage.languageMultiHead}</Text>
                                    <p>{myLanguage.languageMultitext}</p>
                                </div>

                                <SingleFieldController name="textMsgLanguage" control={control}  >
                                    {({ field }) => <Select
                                        label={myLanguage.LanguageForTextMessages}
                                        options={languageTypes}
                                        value={field.value}
                                        onChange={(value) => { field.onChange(value); setSaveBar(true); updateLang(value) }}
                                    />}
                                </SingleFieldController>
                            </>
                        }

                        <Text variant="headingMd" as="h2">{myLanguage.productPageMain} </Text>

                        <SingleFieldController name="addToWishlist" control={control} isRequired className='custom-margin'>
                            {({ field }) => <TextField type="text" label={myLanguage.ppHeading1} value={field.value} onChange={(value) => {
                                field.onChange(value);
                                setSaveBar(true);
                            }} />}
                        </SingleFieldController>

                        <SingleFieldController name="addedToWishlist" control={control} isRequired className='custom-margin'>
                            {({ field }) => <TextField type="text" label={myLanguage.ppHeading2} value={field.value} onChange={(value) => {
                                field.onChange(value),
                                    setSaveBar(true);
                            }} />}
                        </SingleFieldController>

                        <SingleFieldController name="addToWishlistNotification" control={control} isRequired className='custom-margin'>
                            {({ field }) => <TextField type="text" label={myLanguage.ppHeading3} value={field.value} onChange={(value) => {
                                field.onChange(value),
                                    setSaveBar(true);
                            }} />}
                        </SingleFieldController>

                        <SingleFieldController name="removeFromWishlistNotification" control={control} isRequired className='custom-margin'>
                            {({ field }) => <TextField type="text" label={myLanguage.ppHeading4} value={field.value} onChange={(value) => {
                                field.onChange(value),
                                    setSaveBar(true);
                            }} />}
                        </SingleFieldController>
                    </AlphaCard>
                </div>
            </div>

            <div className='wf-style-wishbtn'>
                <AlphaCard>
                    <Text variant="headingMd" as="h2">{myLanguage.wishlistModalMain}</Text>

                    <SingleFieldController name="modalHeadingText" control={control} isRequired className='custom-margin' >
                        {({ field }) => <TextField type="text" label={myLanguage.wmHeading1} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="textForGridIcon" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.wmHeading2} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="loginTextForWishlist" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.loginSignupText} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="loginTextAnchor" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.loginTextAnchor} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="orText" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.orText} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="createAccountAnchor" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.createAccountAnchor} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="createAccountEndingText" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label="After create account text" value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>





                    <SingleFieldController name="searchBarText" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.searchHereForModal} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="noFoundSearchText" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.noSearchFoundForModal} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="quantityText" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.quantityTextHeading} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="continueShopping" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.continueShoppingHeading} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="addProductButtonText" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.addProductButtonText} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="outofStock" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.outofStockTEXT} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>


                    {/* <SingleFieldController name="removeFromWishlist" control={control} isRequired className='custom-margin'>
                                        {({ field }) => <TextField type="text" label={myLanguage.wmHeading3} value={field.value} onChange={(value) => {
                                            field.onChange(value),
                                                setSaveBar(true);
                                        }} />}
                                    </SingleFieldController> */}

                    <SingleFieldController name="addToCart" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.wmHeading4} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="noMoreItem" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.wmHeading5} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="shareYourWishlist" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.wmHeading6} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="alertForRemoveButton" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.wmHeading7} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="alertForAddToCartButton" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.wmHeading8} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="viewCart" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.wmHeading9} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="addAllToCart" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.wmHeading10} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="poweredByText" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.poweredByTextForModal} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="productNotAvailableText" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.productNotAvailableHeading} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="quotaLimitAlert" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.quotalimitReached} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="alertAddAllToCart" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.alertForAddAllToCart} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="headerMenuWishlist" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.headerMenuWishlist} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="clearAllWishlist" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.deleteAll} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="clearWishlistToast" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.deleteAllToast} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="isLoginParaText" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.isLoginParaText} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="saleText" control={control} className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.updateSalesText} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="wishlistDescription" control={control} className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.addWishlistDescription} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="shareToAdminButton" control={control} className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.shareWishlistTadmin} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>


                    <SingleFieldController name="downloadCsv" control={control} className='custom-margin'>
                        {({ field }) => <TextField type="text" label={"Update download csv text"} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>





                    <SingleFieldController name="mwCopyError" control={control} className='custom-margin'>
                        {({ field }) => <TextField type="text" label={"Error message for copy multi wishlist"} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>
                    <SingleFieldController name="mwChooseWishlistToSave" control={control} className='custom-margin'>
                        {({ field }) => <TextField type="text" label={"Error message for save multi wishlist"} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>


                    <SingleFieldController name="mwAvailableInAllList" control={control} className='custom-margin'>
                        {({ field }) => <TextField type="text" label={"Error message for copy multi wishlist which is already in all list"} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                </AlphaCard>
            </div>

            <div className='wf-style-wishbtn'>
                <AlphaCard>
                    <Text variant="headingMd" as="h2">{myLanguage.sharableLinkMain}</Text>

                    <SingleFieldController name="sharableLinkModalHeading" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.slHeading1} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="alertForLinkCopied" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.slHeading2} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>
                </AlphaCard>

            </div>

            <div className='wf-style-wishbtn'>
                <AlphaCard>
                    <Text variant="headingMd" as="h2">{myLanguage.sharedWishlistPageMain}</Text>

                    <SingleFieldController name="sharedPageHeading" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.swpHeading1} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="addToMyWishlist" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.swpHeading2} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="addToMyCart" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.swpHeading3} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="sharedPageItemAdded" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.swpHeading4} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="sharedPageAlreadyAdded" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.swpHeading5} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="sharedPageAddToCart" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.swpHeading7} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>
                </AlphaCard>
            </div>

            <div className='wf-style-wishbtn'>
                <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"} `} >
                    <AlphaCard>
                        <Text variant="headingMd" as="h2">{myLanguage.shareWishlistViaEmail}</Text>

                        <SingleFieldController name="shareWishlistByEmailButton" control={control} isRequired className='custom-margin'>
                            {({ field }) => <TextField type="text" label={myLanguage.swveHeading1} value={field.value} onChange={(value) => {
                                field.onChange(value),
                                    setSaveBar(true);
                            }} />}
                        </SingleFieldController>

                        <SingleFieldController name="shareWishlistByEmailHeading" control={control} isRequired className='custom-margin'>
                            {({ field }) => <TextField type="text" label={myLanguage.swveHeading2} value={field.value} onChange={(value) => {
                                field.onChange(value),
                                    setSaveBar(true);
                            }} />}
                        </SingleFieldController>

                        <SingleFieldController name="shareWishlistSenderName" control={control} isRequired className='custom-margin'>
                            {({ field }) => <TextField type="text" label={myLanguage.swveHeading6} value={field.value} onChange={(value) => {
                                field.onChange(value),
                                    setSaveBar(true);
                            }} />}
                        </SingleFieldController>

                        <SingleFieldController name="shareWishlistRecipientsEmail" control={control} isRequired className='custom-margin'>
                            {({ field }) => <TextField type="text" label={myLanguage.swveHeading7} value={field.value} onChange={(value) => {
                                field.onChange(value),
                                    setSaveBar(true);
                            }} />}
                        </SingleFieldController>

                        <SingleFieldController name="shareWishlistMessage" control={control} isRequired className='custom-margin'>
                            {({ field }) => <TextField type="text" label={myLanguage.swveHeading8} value={field.value} onChange={(value) => {
                                field.onChange(value),
                                    setSaveBar(true);
                            }} />}
                        </SingleFieldController>


                        <SingleFieldController name="shareWishlistMessagePlaceholder" control={control} className='custom-margin'>
                            {({ field }) => <TextField type="text" label={myLanguage.swveHeadingPlaceholder} value={field.value} onChange={(value) => {
                                field.onChange(value),
                                    setSaveBar(true);
                            }} />}
                        </SingleFieldController>


                        <SingleFieldController name="shareWishlistByEmailFormButton" control={control} isRequired className='custom-margin'>
                            {({ field }) => <TextField type="text" label={myLanguage.swveHeading3} value={field.value} onChange={(value) => {
                                field.onChange(value),
                                    setSaveBar(true);
                            }} />}
                        </SingleFieldController>

                        <SingleFieldController name="shareWishlistByEmailSuccessMsg" control={control} isRequired className='custom-margin'>
                            {({ field }) => <TextField type="text" label={myLanguage.swveHeading4} value={field.value} onChange={(value) => {
                                field.onChange(value),
                                    setSaveBar(true);
                            }} />}
                        </SingleFieldController>

                        <SingleFieldController name="iconHeading" control={control} isRequired className='custom-margin'>
                            {({ field }) => <TextField type="text" label={myLanguage.iconHeading} value={field.value} onChange={(value) => {
                                field.onChange(value),
                                    setSaveBar(true);
                            }} />}
                        </SingleFieldController>

                        <SingleFieldController name="shareWishlistRecieverName" control={control} isRequired className='custom-margin'>
                            {({ field }) => <TextField type="text" label={myLanguage.shareWishlistRecieverName} value={field.value} onChange={(value) => {
                                field.onChange(value),
                                    setSaveBar(true);
                            }} />}
                        </SingleFieldController>
                    </AlphaCard>
                </div>
            </div>



            <div className='wf-style-wishbtn'>
                <div className={`${currentPlan >= 4 ? "" : "disableEverything under-premium"} `} >
                    <Text variant="headingMd" as="h2">{myLanguage.multiwishlisth1}</Text>

                    <SingleFieldController name="createWishlistHeading" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.createWishlistHeading} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="createBtn" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.createBtn} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>


                    <SingleFieldController name="saveWishlistBtn" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.saveWishlistBtn} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="copyHeading" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.copyHeading} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="copyBtn" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.copyBtn} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="editWishlistHeading" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.editWishlistHeading} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="editBtn" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.editBtn} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="deleteMsg" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.deleteMsg} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="deleteYesBtn" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.deleteYesBtn} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="deleteNoBtn" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.deleteNoBtn} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="clearWishlist" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.clearWishlist} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>

                    <SingleFieldController name="clearWishlistBtn" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.clearWishlistBtn} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>
                </div>
            </div>

            <div className='wf-style-wishbtn'>
                <div className={`${currentPlan >= 3 ? "" : "disableEverything under-premium"} `} >
                    <Text variant="headingMd" as="h2">{myLanguage.trendingSectionMainHeading}</Text>

                    <SingleFieldController name="trendingSectionHeading" control={control} isRequired className='custom-margin'>
                        {({ field }) => <TextField type="text" label={myLanguage.trendingSectionHeading} value={field.value} onChange={(value) => {
                            field.onChange(value),
                                setSaveBar(true);
                        }} />}
                    </SingleFieldController>
                </div>
            </div>

        </>
    )
}

export default LanguageSwitcher