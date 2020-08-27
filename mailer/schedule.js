const nodeMailer = require('../config/nodemailer');


// this is another way of exporting a method
exports.newInterview = (interview) => {
    let htmlString = nodeMailer.renderTemplate({ data: interview }, '/schedule.ejs');

    nodeMailer.transporter.sendMail({
        from: 'interview@schedule.in',
        to: comment.user.email,
        subject: "New Interview Scheduled!",
        html: htmlString
    }, (err, info) => {
        if (err) {
            console.log('Error in sending mail', err);
            return;
        }
        return;
    });
}