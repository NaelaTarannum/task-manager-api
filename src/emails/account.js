const sendgrid = require('@sendgrid/mail');
const sendgridAPIKey = process.env.SENDGRID_API_KEY;
sendgrid.setApiKey(sendgridAPIKey);

const sendWelcomeEmail = (email,name)=>{
    sendgrid.send({
        to: email,
        from: 'naela16@gmail.com',
        subject: 'Hi there',
        text: `Welcome to the app ${name}`
    })
}

const sendByeEmail = (email,name)=>{
    sendgrid.send({
        to: email,
        from: 'naela16@gmail.com',
        subject: 'Sad to see you go :(',
        text: `See ya ${name}`
    })
}

module.exports = {sendWelcomeEmail,sendByeEmail}