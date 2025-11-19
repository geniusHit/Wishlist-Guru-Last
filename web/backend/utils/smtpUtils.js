export const getProviderFromSMTP = (smtp_server) => {
    if (smtp_server.includes("sendgrid")) return "sendgrid";
    if (smtp_server.includes("mailgun")) return "mailgun";
    if (smtp_server.includes("postmark")) return "postmark";
    if (smtp_server.includes("email-smtp")) return "aws_ses";
    if (smtp_server.includes("smtp.zoho")) return "zoho";
    if (smtp_server.includes("smtp.office365")) return "outlook";
    if (smtp_server.includes("smtp.yandex")) return "yandex";
    if (smtp_server.includes("elasticemail")) return "elasticemail";
    return "generic";
};

export const isSendGridVerifiedSender = async (apiKey, fromEmail) => {
    try {
        const response = await fetch(
            "https://api.sendgrid.com/v3/verified_senders",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const data = await response.json();
        if (!data.results) throw new Error(data.message);

        const isSameEmail = data.results.some(
            (sender) => sender.from_email.toLowerCase() === fromEmail.toLowerCase()
        );
        return {
            isSameEmail,
            msg: "From email should be the same as registered in smtp server",
        };
    } catch (error) {
        console.error("Error checking SendGrid verified sender:", error);
        return {
            isSameEmail: false,
            msg: error.message || "An error occurred while verifying the sender",
        };
    }
};

export const isMailgunVerifiedSender = async (apiKey, domain, fromEmail) => {
    // try {
    //   const response = await fetch(`https://api.mailgun.net/v3/domains/${domain}`, {
    //     method: "GET",
    //     headers: {
    //       Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`
    //     }
    //   });

    //   const data = await response.json();
    //   if (!data.items) throw new Error(data.message);

    //   const isSameEmail = data.domain.some(item => item.name.toLowerCase() === fromEmail.toLowerCase());
    //   return { isSameEmail, msg: "From email should be the same as registered in smtp server" }
    // } catch (error) {
    //   console.error("Error checking Mailgun verified sender:", error);
    //   return { isSameEmail: false, msg: error.message || "An error occurred while verifying the sender" };
    // }
};

export const isPostmarkVerifiedSender = async (apiKey, fromEmail) => {
    try {
        const response = await fetch("https://api.postmarkapp.com/senders", {
            method: "GET",
            headers: {
                "X-Postmark-Server-Token": apiKey,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        if (!data.Senders)
            throw new Error("Failed to retrieve Postmark verified senders.");

        const isSameEmail = data.Senders.some(
            (sender) => sender.Email.toLowerCase() === fromEmail.toLowerCase()
        );
        return {
            isSameEmail,
            msg: "From email should be the same as registered in smtp server",
        };
    } catch (error) {
        console.error("Error checking Postmark verified sender:", error);
        return {
            isSameEmail: false,
            msg: error.message || "An error occurred while verifying the sender",
        };
    }
};

export const isFromEmailValid = (provider, user_name, from_email) => {
    if (provider === "aws_ses") {
        const isSameEmail = user_name.toLowerCase() === from_email.toLowerCase();
        return {
            isSameEmail,
            msg: "From email should be the same as registered in smtp server",
        };
    }
    if (
        provider === "zoho" ||
        provider === "outlook" ||
        provider === "yandex" ||
        provider === "elasticemail"
    ) {
        const isSameEmail = user_name.toLowerCase() === from_email.toLowerCase();
        return {
            isSameEmail,
            msg: "From email should be the same as registered in smtp server",
        };
    }
    return { isSameEmail: true, msg: "success" };
};