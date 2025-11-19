import axios from "axios";
import { Constants } from "../constants/constant.js";

const { brevoApiKey } = Constants;

export const inactiveStatusToBrevo = async (shop_email) => {
    const API_URL = 'https://api.brevo.com/v3/contacts/{email}';
    const email = encodeURIComponent(shop_email);
    const contactData = {
        attributes: {
            PLANNAME: "null",
            STATUS: "inactive",
        },
    };
    axios.put(API_URL.replace('{email}', email), contactData, {
        headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
        },
    }).then((response) => {
        console.log('Email updating unactive successfully:', response.data);
    }).catch((error) => {
        console.error('Error unactive updating contact:', error.response?.data || error.message);
    });
};

export async function addSetupInBrevo(shopEmail, customerEmail, key, value) {
    if (shopEmail === customerEmail) {
        await updateSetupInBrevo(shopEmail, key, value);
    } else {
        await updateSetupInBrevo(shopEmail, key, value);
        await updateSetupInBrevo(customerEmail, key, value);
    }
};

export const updateSetupInBrevo = async (shop_email, fieldName, fieldValue) => {
    const API_URL = 'https://api.brevo.com/v3/contacts/{email}';
    const email = encodeURIComponent(shop_email);
    // const fieldValue = field;
    const contactData = {
        attributes: {
            [fieldName]: fieldValue,
        },
    };
    axios.put(API_URL.replace('{email}', email), contactData, {
        headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
        },
    }).then((response) => {
        console.log('Email updated successfully:', response.data);
    }).catch((error) => {
        console.error('Error updating contact:', error.response?.data || error.message);
    });
};

export const updatePlanToBrevo = async (shop_email, planName, status) => {
    const API_URL = 'https://api.brevo.com/v3/contacts/{email}';
    const email = encodeURIComponent(shop_email);
    const newPlanName = planName;
    const newStatus = status;
    const contactData = {
        attributes: {
            PLANNAME: newPlanName,
            STATUS: newStatus,
        },
    };
    axios.put(API_URL.replace('{email}', email), contactData, {
        headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
        },
    }).then((response) => {
        console.log('Email updated successfully:', response.data);
    }).catch((error) => {
        console.error('Error updating contact:', error.response?.data || error.message);
    });
};

export const addEmailToBrevo = async (shop_owner, shop_email, shop_domain, brevoData) => {
    const API_URL = 'https://api.brevo.com/v3/contacts';
    const userName = shop_owner.split(" ");
    const contactData = {
        email: shop_email,
        attributes: {
            FIRSTNAME: userName[0],
            LASTNAME: userName[1],
            PLANNAME: "No Plan",
            WEBSITE: shop_domain,
            APPNAME: "Wishlist Guru",
            STATUS: "Active",
            PHONE: brevoData.phone,
            COUNTRY: brevoData.country,
            SHOPIFY_PLAN: brevoData.shopifyPlan,
            DATE: brevoData.date,
            THEMENAME: "--",
            SETUP_COMPLETE: "FALSE",

        },
        listIds: [7],
    };
    axios.post(API_URL, contactData, {
        headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
        },
    }).then((response) => {
        console.log('Email added successfully:', response.data);
    }).catch(async (error) => {
        console.error('Error adding email:', error.response.data);
        if (error?.response?.data?.code === "duplicate_parameter") {
            // await updatePlanToBrevo(shop_email, "No Plan", "Active");
            await reinstallUpdateInBrevo(userName, shop_email, shop_domain, brevoData);
        }
    });
};

export const reinstallUpdateInBrevo = async (userName, shop_email, shop_domain, brevoData) => {
    const API_URL = 'https://api.brevo.com/v3/contacts/{email}';
    const email = encodeURIComponent(shop_email);
    const contactData = {
        attributes: {
            FIRSTNAME: userName[0],
            LASTNAME: userName[1],
            WEBSITE: shop_domain,
            APPNAME: "Wishlist Guru",
            PHONE: brevoData.phone,
            COUNTRY: brevoData.country,
            SHOPIFY_PLAN: brevoData.shopifyPlan,
            // ----old fields----
            PLANNAME: "No Plan",
            STATUS: "Active",
            THEMENAME: "--",
            DATE: new Date(),
            SETUP_COMPLETE: "FALSE",
        },
        listIds: [7]
    };
    axios.put(API_URL.replace('{email}', email), contactData, {
        headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
        },
    }).then((response) => {
        console.log('Email updated successfully:', response.data);
    }).catch((error) => {
        console.error('Error updating contact:', error.response?.data || error.message);
    });
};
