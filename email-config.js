// EmailJS Configuration for Contact Form
// To use this, you need to:
// 1. Sign up at https://www.emailjs.com/
// 2. Create a service (Gmail, Outlook, etc.)
// 3. Create an email template
// 4. Get your public key and service/template IDs

// Configuration object - replace with your actual EmailJS credentials
const emailConfig = {
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY', // Get from EmailJS dashboard
    serviceId: 'YOUR_SERVICE_ID',         // Get from EmailJS dashboard
    templateId: 'YOUR_TEMPLATE_ID'        // Get from EmailJS dashboard
};

// Initialize EmailJS (uncomment when ready to use)
// emailjs.init(emailConfig.publicKey);

// Enhanced form submission function with EmailJS integration
async function submitContactFormWithEmailJS(formData) {
    try {
        // Prepare template parameters
        const templateParams = {
            from_name: formData.fullName,
            from_email: formData.email,
            phone: formData.phone,
            message: formData.message,
            to_email: 'info@kakedomtools.org', // Your receiving email
            reply_to: formData.email
        };

        // Send email using EmailJS
        const response = await emailjs.send(
            emailConfig.serviceId,
            emailConfig.templateId,
            templateParams
        );

        console.log('Email sent successfully:', response);
        return response;

    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
}

// Alternative: Formspree integration (simpler setup)
// Just replace the form action with your Formspree endpoint
const formspreeConfig = {
    endpoint: 'https://formspree.io/f/YOUR_FORM_ID' // Get from formspree.io
};

async function submitContactFormWithFormspree(formData) {
    try {
        const response = await fetch(formspreeConfig.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Formspree submission failed:', error);
        throw error;
    }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        emailConfig,
        submitContactFormWithEmailJS,
        submitContactFormWithFormspree
    };
}

/*
SETUP INSTRUCTIONS:

1. EmailJS Setup:
   - Go to https://www.emailjs.com/
   - Create account and verify email
   - Add email service (Gmail recommended)
   - Create email template with these variables:
     * {{from_name}} - sender's name
     * {{from_email}} - sender's email
     * {{phone}} - sender's phone
     * {{message}} - the message content
     * {{to_email}} - your receiving email
   - Get your public key, service ID, and template ID
   - Replace the values in emailConfig above
   - Uncomment the EmailJS script in index.html
   - Replace the submitContactForm function call

2. Formspree Setup (Alternative - Easier):
   - Go to https://formspree.io/
   - Create account
   - Create new form
   - Get your form endpoint URL
   - Replace the endpoint in formspreeConfig above
   - Use submitContactFormWithFormspree instead

3. Custom Backend (Advanced):
   - Create your own API endpoint
   - Handle form data server-side
   - Send emails using your preferred method
   - Update the submitContactForm function

EMAIL TEMPLATE EXAMPLE (for EmailJS):
Subject: New Contact Form Submission from {{from_name}}

Hello,

You have received a new message from your Käkedom Tools website:

Name: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}

Message:
{{message}}

---
This message was sent from the contact form on kakedomtools.org
*/