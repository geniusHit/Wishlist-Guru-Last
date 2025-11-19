export default function defaultMetafieldSetup(ownerId) {
    const freePlan = "-999";
    let metafieldArray = [
        {
            key: "language-setting",
            namespace: "wishlist-app",
            ownerId: ownerId,
            type: "single_line_text_field",
            value: JSON.stringify(languageSettingDATA)
        },
        {
            key: "wishlist-button-setting",
            namespace: "wishlist-app",
            ownerId: ownerId,
            type: "single_line_text_field",
            value: JSON.stringify(buttonSettingDATA)
        },
        {
            key: "general-setting",
            namespace: "wishlist-app",
            ownerId: ownerId,
            type: "single_line_text_field",
            value: JSON.stringify(generalSettingDATA)
        },
        {
            key: "advance-setting",
            namespace: "wishlist-app",
            ownerId: ownerId,
            type: "single_line_text_field",
            value: JSON.stringify(advanceSettingDATA)
        }, {
            key: "collection-setting",
            namespace: "wishlist-app",
            ownerId: ownerId,
            type: "single_line_text_field",
            value: JSON.stringify(collectionSettingData)
        },
        {
            key: "current-plan",
            namespace: "wishlist-app",
            ownerId: ownerId,
            type: "single_line_text_field",
            value: freePlan
        },
        {
            key: "inject-code-automatic",
            namespace: "wishlist-app",
            ownerId: ownerId,
            type: "single_line_text_field",
            value: injectData
        },

        {
            key: "installation-setup-guide",
            namespace: "wishlist-app",
            ownerId: ownerId,
            type: "single_line_text_field",
            value: setupGuide
        },
        {
            key: "is-Multi-wishlist",
            namespace: "wishlist-app",
            ownerId: ownerId,
            type: "single_line_text_field",
            value: isMultiWishlist
        },
        {
            key: "is-variant-wishlist",
            namespace: "wishlist-app",
            ownerId: ownerId,
            type: "single_line_text_field",
            value: isMultiVariant
        }

    ];
    return metafieldArray
};

const languageSettingDATA = {
    addToWishlist: "Add to wishlist",
    addedToWishlist: "Remove from Wishlist",
    removeFromWishlist: "Remove from wishlist",
    addToCart: "Move to cart",
    addAllToCart: "Add all items to cart",
    viewCart: "View cart",
    noMoreItem: "Your wishlist is empty",
    addToWishlistNotification: "Item has been added to wishlist",
    removeFromWishlistNotification: "Item has been removed from wishlist",
    shareYourWishlist: "Share",
    alertForRemoveButton: "Item removed from the wishlist",
    alertForAddToCartButton: "Item added to cart",
    modalHeadingText: "Your wishlist",
    textForGridIcon: "View as:",
    sharableLinkModalHeading: "You can share your wishlist through this link..!",
    alertForLinkCopied: "Link copied ",
    sharedPageHeading: "Wishlist Items",
    addToMyWishlist: "Add to my wishlist",
    addToMyCart: "Move to my cart",
    sharedPageItemAdded: "Item added to your wishlist",
    sharedPageAlreadyAdded: "Item already added to your wishlist",
    sharedPageAddToCart: "Item added to your cart",
    shareWishlistByEmailButton: "Share",
    shareWishlistByEmailHeading: "Share",
    shareWishlistByEmailFormButton: "Share List",
    shareWishlistByEmailSuccessMsg: "Your wishlist has been sent",
    shareWishlistSenderName: "Sender Name",
    shareWishlistRecipientsEmail: "Recipients Email",
    shareWishlistMessage: "Message",
    languageSetting: "english",
    textMsgLanguage: "english",
    iconHeading: "Try other sharing options",
    outofStock: "Out of stock",
    loginTextForWishlist: "Wishlist is not saved permanently yet. Please",
    loginTextAnchor: "login",
    orText: "or",
    createAccountAnchor: "create account",
    continueShopping: "Continue Shopping",
    searchBarText: "Search here",
    noFoundSearchText: "No match found",
    poweredByText: "Powered by ",
    quantityText: "Quantity",
    productNotAvailableText: "Product not available",
    quotaLimitAlert: "Wishlist Quota of this store reached its monthly limit, We have notified store owner to upgrade their plan. Sorry for the inconvenience",
    alertAddAllToCart: "All Items are added to cart",
    headerMenuWishlist: "Wishlist",
    isLoginParaText: "You need to login first to create and save your wishlist",
    clearAllWishlist: "Clear Wishlist",
    shareWishlistRecieverName: "Reciever Name",
    shareWishlistMessagePlaceholder: "Write a message here..",

    createWishlistHeading: "Create wishlist",
    createBtn: "Create list",
    saveWishlistBtn: "Save wishlist",
    copyHeading: "Copy to",
    editWishlistHeading: "Edit wishlist Name",
    editBtn: "Update list",
    copyBtn: "Copy",
    deleteMsg: "Are you sure, you want to delete this wishlist",
    deleteYesBtn: "Yes delete",
    deleteNoBtn: "Cancel",
    clearWishlist: "Clear wishlists",
    clearWishlistBtn: "Clear",

    trendingSectionHeading: "You may also like",
    addProductButtonText: "Add Product"

};

const buttonSettingDATA = {
    wishlistButtonCheck: false,
    type: "icon-text-button",
    iconColor: { filterColor: "brightness(0) saturate(100%) invert(71%) sepia(3%) saturate(0%) hue-rotate(323deg) brightness(97%) contrast(93%)", color: "#ADADAD" },
    iconType: "heart",
    animationType: "none",
    bgColor: "#000000",
    textColor: "#AEAEAE",
    fontSize: {
        value: "15",
        unit: "px"
    },
    buttonTypeRadio: "icon-text-button",
    fontFamily: "",
    fontWeight: "normal",
    borderRadius: {
        value: "0",
        unit: "px"
    },
    paddingTopBottom: {
        value: "8",
        unit: "px"
    },
    paddingLeftRight: {
        value: "10",
        unit: "px"
    },
    marginTopBottom: {
        value: "5",
        unit: "px"
    },
    marginLeftRight: {
        value: "0",
        unit: "px"
    },
    activeBtn: {
        bgColor: "#FF56A5",
        textColor: "#FFFFFF",
        iconColor: { filterColor: "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(166deg) brightness(106%) contrast(103%)", color: "#FFFFFF" },
        border: {
            value: "1",
            unit: "px",
            type: "solid",
            color: "#FF56A5"
        }
    },
    width: {
        value: "100",
        unit: "%"
    },
    border: {
        value: "1",
        unit: "px",
        type: "solid",
        color: "#000000"
    },
    textAlign: "center",
    hover: {
        bgColor: "#FFFFFF",
        textColor: "#000000",
        iconColor: { filterColor: "brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(5%) hue-rotate(296deg) brightness(94%) contrast(101%)", color: "#000000" },
        border: {
            value: "1",
            unit: "px",
            type: "solid",
            color: "#000000"
        }
    },
    iconSize: "medium",
    iconPosition: "left",
    iconSizeValue: 16,
    cartButtonStyle: {
        bgColor: "#FFFFFF",
        textColor: "#000000",
        fontSize: {
            value: "15",
            unit: "px"
        },
        fontFamily: "",
        fontWeight: "normal",
        customCartButton: "false",
        borderRadius: {
            value: "5",
            unit: "px"
        },
        paddingTopBottom: {
            value: "8",
            unit: "px"
        },
        paddingLeftRight: {
            value: "10",
            unit: "px"
        },
        marginTopBottom: {
            value: "07",
            unit: "px"
        },
        marginLeftRight: {
            value: "0",
            unit: "px"
        },
        // width: {
        //     value: "100",
        //     unit: "%"
        // },
        border: {
            value: "1",
            unit: "px",
            type: "solid",
            color: "#000000"
        },
        textAlign: "center",
        hover: {
            bgColor: "#000000",
            textColor: "#FFFFFF",
            iconColor: null,
            border: {
                value: "1",
                unit: "px",
                type: "solid",
                color: "#797979"
            },
            fontSize: {
                value: "15",
                unit: "px"
            }
        }
    },
    showCount: "no"
};

// const generalSettingDATA = {
//     notificationCheck: false,
//     wishlistButtonLocationCheck: false,
//     wishlistUiCheck: false,
//     wishlistDisplay: "modal",
//     wlBgColor: "#FFFFFF",
//     wlCrossColor: "#000000",
//     wlPaddingLeftRight: "20",
//     wlPaddingLeftRightUnit: "px",
//     wlPaddingTopBottom: "20",
//     wlPaddingTopBottomUnit: "px",
//     wlTextAlign: "center",
//     wlTextColor: "#000000",
//     wlWidthInput: 100,
//     wlWidthUnit: "%",
//     floatingBgShape: "circleBG",
//     floatingHeartBGcolor: "#FF56A5",
//     floatingHeartIconcolor: "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(8%) hue-rotate(117deg) brightness(102%) contrast(102%)",
//     paidWlbLocation: "",
//     wlbLocation1: false,
//     wlbLocation2: true,
//     wlbLocation3: true,
//     wlbLocationSelect: "floating-heart-bottom-right",
//     paddingTopBottom: "15",
//     paddingTopBottomUnit: "px",
//     bgColor: "#000000",
//     borderInput: "1",
//     borderInputUnit: "px",
//     borderRadius: "10",
//     borderRadiusUnit: "px",
//     borderType: "solid",
//     fontFamily: "",
//     fontSize: 15,
//     fontSizeUnit: "px",
//     marginLeftRight: "0",
//     marginLeftRightUnit: "px",
//     marginTopBottom: "0",
//     marginTopBottomUnit: "px",
//     notificationBorderColor: "#000000",
//     notificationTextType: "text-above",
//     notificationTimer: "2",
//     notificationToastType: "toast-left",
//     notificationToolTipType: "tool-tip-above",
//     notificationType: "toast",
//     paddingLeftRight: "15",
//     paddingLeftRightUnit: "px",
//     textAlign: "center",
//     textColor: "#FFFFFF",
//     // widthUnit: "%",
//     // widthValue: "50",
//     wishlistOrNotification: "show-notification",
//     wishlistShareShowData: "guestuser",
//     buttonTypeShareWishlist: "asButton",
//     notificationTypeOption: "toast-top-right",
//     wishlistRemoveData: "no",
//     wishlistShareEmailSubject: "Wish List from  {wishlist_share_email_customer_name}",
//     wishlistTextEditor: "<p><b>Hello Dear Friend!</b></p><p>{wishlist_share_email_customer_name} filled out this wishlist and asked us to forward it to you. You can simply click on the button below to see it at our online store and easily make your purchase.</p><p style=text-align: center;><a href={wishlist_share_email_wishlist_url} style=background-color: Crimson;border-radius: 5px;color: white;padding: 0.5em;text-decoration: none;target=_blank>Go to wishlist</a></p><p>Message for you:</p><p>{wishlist_share_email_customer_message}</p>",
//     shareWishlistToAdminSubject: "Wish List from  {wishlist_share_email_customer_name}",
//     shareWishlistToAdminTextEditor: "<p><b>Hello Dear Friend!</b></p><p>{wishlist_share_email_customer_name} filled out this wishlist and asked us to forward it to you. You can simply click on the button below to see it at our online store and easily make your purchase.</p><p style=text-align: center;><a href={wishlist_share_email_wishlist_url} style=background-color: Crimson;border-radius: 5px;color: white;padding: 0.5em;text-decoration: none;target=_blank>Go to wishlist</a></p><p>Wishlist at the time of sharing:</p><p>{wishlist_share_email_static_data}</p><p>Message for you:</p><p>{wishlist_share_email_customer_message}</p>",

//     shareBtnIconColor: "brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(237deg) brightness(99%) contrast(100%)",
//     shareBtnIconHoverColor: "brightness(0) saturate(100%) invert(59%) sepia(4%) saturate(0%) hue-rotate(7deg) brightness(96%) contrast(98%)",
//     shareWishBtnfontFamily: "Poppins",
//     shareWishBtnfontSize: "18",
//     shareWishBtnfontSizeUnit: "px",
//     shareWishBtnhoverTextColor: "#919191",
//     shareWishBtntextColor: "#000000",

//     heartIconColor: "#000000",
//     heartIconFilter: "brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(7500%) hue-rotate(157deg) brightness(102%) contrast(100%)",
//     heartIconHeight: 10,
//     heartIconWidth: 25,
//     headerIconType: "outlineHeaderIcon",

//     showPrice: "both users",
//     showQuantity: "both users",
//     showMoveToCart: "both users",

//     floatingHeartIconCountBgcolor: '#000000',
//     floatingHeartIconCountTextcolor: '#FFFFFF',
//     headerHeartIconCountBgcolor: '#000000',
//     headerHeartIconCountTextcolor: '#FFFFFF',

//     copyCheckIcon: true,
//     facebookCheckIcon: true,
//     whatsappCheckIcon: true,
//     instagramCheckIcon: true,
//     telegramCheckIcon: true,
//     linkedinCheckIcon: true,
//     twitterCheckIcon: true,
//     fbMessengerCheckIcon: true,

//     continueShoppingLink: "/collections/all",

//     trendingLayout: "grid",
//     whichProducts: "top products",
//     autoRotaionOrNot: true,
//     navigationArrows: false,
//     navigationDots: true,
//     desktopProducts: 4,
//     mobileProducts: 2,

//     // hideLoginText: false,

// };

const generalSettingDATA = {
    notificationCheck: false,
    wishlistButtonLocationCheck: true,
    wishlistUiCheck: true,
    wishlistDisplay: "modal",
    wlBgColor: "#FFFFFF",
    wlCrossColor: "#000000",
    wlPaddingLeftRight: "20",
    wlPaddingLeftRightUnit: "px",
    wlPaddingTopBottom: "20",
    wlPaddingTopBottomUnit: "px",
    wlTextAlign: "center",
    wlTextColor: {
        filterColor: "brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(7500%) hue-rotate(155deg) brightness(99%) contrast(101%)",
        color: "#000000"
    },
    wlWidthInput: 100,
    wlWidthUnit: "%",
    floatingBgShape: "circleBG",
    floatingHeartBGcolor: "#FF56A5",
    floatingHeartIconcolor: "brightness(0) saturate(100%) invert(100%) sepia(1%) saturate(7500%) hue-rotate(38deg) brightness(108%) contrast(101%)",
    paidWlbLocation: "",
    wlbLocation1: false,
    wlbLocation2: true,
    wlbLocation3: true,
    wlbLocationSelect: "floating-heart-bottom-right",
    paddingTopBottom: "15",
    paddingTopBottomUnit: "px",
    bgColor: "#000000",
    borderInput: "1",
    borderInputUnit: "px",
    borderRadius: "10",
    borderRadiusUnit: "px",
    borderType: "solid",
    fontFamily: "",
    fontSize: 15,
    fontSizeUnit: "px",
    marginLeftRight: "0",
    marginLeftRightUnit: "px",
    marginTopBottom: "0",
    marginTopBottomUnit: "px",
    notificationBorderColor: "#000000",
    notificationTextType: "text-above",
    notificationTimer: "2",
    notificationToastType: "toast-left",
    notificationToolTipType: "tool-tip-above",
    notificationType: "toast",
    paddingLeftRight: "15",
    paddingLeftRightUnit: "px",
    textAlign: "center",
    textColor: "#FFFFFF",
    wishlistOrNotification: "show-notification",
    wishlistShareShowData: "guestuser",
    buttonTypeShareWishlist: "asButton",
    notificationTypeOption: "toast-top-right",
    wishlistRemoveData: "no",
    wishlistShareEmailSubject: "Wish List from  {wishlist_share_email_customer_name}",
    wishlistTextEditor: "<p>Hello <b>{wishlist_share_email_reciever_name}!</b></p><p>{wishlist_share_email_sender_name} filled out this wishlist and asked us to forward it to you. You can simply click on the button below to see it at our online store and easily make your purchase.</p><p style=text-align: center;><a href={wishlist_share_email_wishlist_url} style=background-color: Crimson;border-radius: 5px;color: white;padding: 0.5em;text-decoration: none;target=_blank>Go to wishlist</a></p><p>Message for you:</p><p>{wishlist_share_email_customer_message}</p>",
    shareWishlistToAdminSubject: "Wish List from  {wishlist_share_email_customer_name}",
    shareWishlistToAdminTextEditor: "<p><b>Hello Dear Friend!</b></p><p>{wishlist_share_email_customer_name} filled out this wishlist and asked us to forward it to you. You can simply click on the button below to see it at our online store and easily make your purchase.</p><p style=text-align: center;><a href={wishlist_share_email_wishlist_url} style=background-color: Crimson;border-radius: 5px;color: white;padding: 0.5em;text-decoration: none;target=_blank>Go to wishlist</a></p><p>Wishlist at the time of sharing:</p><p>{wishlist_share_email_static_data}</p><p>Message for you:</p><p>{wishlist_share_email_customer_message}</p>",
    shareBtnIconColor: "brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(38deg) brightness(95%) contrast(100%)",
    shareBtnIconHoverColor: "brightness(0) saturate(100%) invert(59%) sepia(0%) saturate(0%) hue-rotate(208deg) brightness(97%) contrast(95%)",
    shareWishBtnfontFamily: "Poppins",
    shareWishBtnfontSize: "18",
    shareWishBtnfontSizeUnit: "px",
    shareWishBtnhoverTextColor: "#919191",
    shareWishBtntextColor: "#000000",
    heartIconColor: "#000000",
    heartIconFilter: "brightness(0) saturate(100%) invert(0%) sepia(94%) saturate(7500%) hue-rotate(277deg) brightness(94%) contrast(106%)",
    heartIconHeight: 10,
    heartIconWidth: 25,
    headerIconType: "outlineHeaderIcon",
    showPrice: "both users",
    showQuantity: "both users",
    showMoveToCart: "both users",
    floatingHeartIconCountBgcolor: "#000000",
    floatingHeartIconCountTextcolor: "#FFFFFF",
    headerHeartIconCountBgcolor: "#000000",
    headerHeartIconCountTextcolor: "#FFFFFF",
    copyCheckIcon: true,
    facebookCheckIcon: true,
    whatsappCheckIcon: true,
    instagramCheckIcon: true,
    telegramCheckIcon: true,
    linkedinCheckIcon: true,
    twitterCheckIcon: true,
    fbMessengerCheckIcon: true,
    continueShoppingLink: "/collections/all",
    trendingLayout: "grid",
    whichProducts: "top products",
    autoRotaionOrNot: true,
    navigationArrows: false,
    navigationDots: true,
    desktopProducts: 4,
    mobileProducts: 2,
    hideHeaderCounter: "no",
    headerIconPosition: "",
    wlCrossFilter: "brightness(0) saturate(100%) invert(0%) sepia(18%) saturate(4974%) hue-rotate(109deg) brightness(100%) contrast(101%)",
    hideViewAs: "",
    hideGrid: "",
    hideSearch: "",
    wlHeadingFontFamily: "",
    wlHeadingFontWt: "semi-bold",
    wlTextFontFamily: "",
    wlTextFontWt: "normal",
    hideLoginText: "",
    gridAlignment: "center",
    gridBorderRadius: 10,
    gridBgColor: "#FFFFFF",
    gridGap: 10,
    gridImageView: "default",
    gridBorderInput: "00",
    gridBorderType: "solid",
    gridBorderColor: "#FFFFFF",
    showProductOption: "no",
    downloadCsv: "no",
    modalLayerBgColor: "#FAFAFA",
    modalBottomButtonBgColor: "#EEEEEE"
}


const advanceSettingDATA = {
    customCss: "",
    customJs: "",
    jsAfterAddToWishlist: "",
    jsAfterRemoveFromWishlist: "",
    jsAfterItemsLoaded: ""
};

const collectionSettingData = {
    collectionIconType: "heartOutlineSolid",
    iconPosition: "icon-top-right",
    iconSize: "medium",
    iconType: "heart",
    iconDefaultColor: "brightness(0) saturate(100%) invert(51%) sepia(0%) saturate(378%) hue-rotate(261deg) brightness(99%) contrast(93%)",
    iconSelectedColor: "brightness(0) saturate(100%) invert(53%) sepia(66%) saturate(2681%) hue-rotate(301deg) brightness(100%) contrast(102%)",
    iconDefaultBgColor: "#FFFFFF",
    iconSelectedBgColor: "#FFFFFF",

    collectionType: 'iconType',
    quickViewShowAs: 'icon',
    isQuickViewShowOptionImage: 'on-image',
    quickViewShowOptionImage: 'icon-top-left',

    collectionShowCount: "no"

};

const injectData = "automatic";

const setupGuide = "no";

const isMultiWishlist = "no";

const isMultiVariant = "no";

