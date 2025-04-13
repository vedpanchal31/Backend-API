const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOTPEmail = async (email, otp, type = 1) => {
  try {
    const subject =
      type === 1 ? "Email Verification OTP" : "Password Reset OTP";
    const purpose = type === 1 ? "email verification" : "password reset";

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #f8f0ff 0%, #e6d5ff 100%);
              }
              .container {
                max-width: 500px;
                margin: 20px auto;
                padding: 0;
                background: linear-gradient(135deg, #f0e6ff 0%, #e0ccff 100%);
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                overflow: hidden;
                position: relative;
              }
              .container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #6a11cb, #2575fc, #6a11cb);
                background-size: 200% 100%;
                animation: gradient 3s linear infinite;
              }
              @keyframes gradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              .header {
                text-align: center;
                padding: 0;
                background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
                color: white;
                margin: 0;
                position: relative;
              }
              .header h2 {
                margin: 0;
                padding: 20px 0;
                font-size: 22px;
                font-weight: 600;
                letter-spacing: 0.5px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .content {
                padding: 30px 25px;
                text-align: center;
              }
              .otp-box {
                background: linear-gradient(135deg, #ffffff 0%, #f8f0ff 100%);
                border: 2px solid #6a11cb;
                border-radius: 12px;
                padding: 25px;
                text-align: center;
                margin: 25px auto;
                font-size: 36px;
                font-weight: bold;
                letter-spacing: 12px;
                color: #6a11cb;
                box-shadow: 0 6px 16px rgba(106, 17, 203, 0.15);
                max-width: 320px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
              }
              .otp-box::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
                animation: shine 3s infinite;
              }
              @keyframes shine {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              .otp-box:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(106, 17, 203, 0.25);
              }
              .note {
                background-color: rgba(255, 255, 255, 0.95);
                border-left: 4px solid #6a11cb;
                padding: 15px 20px;
                margin: 25px auto;
                font-size: 14px;
                border-radius: 6px;
                max-width: 350px;
                text-align: left;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                transition: transform 0.2s ease;
              }
              .note:hover {
                transform: translateX(5px);
              }
              .footer {
                text-align: center;
                padding: 20px;
                font-size: 12px;
                color: #666;
                border-top: 1px solid rgba(106, 17, 203, 0.15);
                margin-top: 20px;
                background: rgba(255, 255, 255, 0.6);
                backdrop-filter: blur(5px);
              }
              @media only screen and (max-width: 600px) {
                .container {
                  width: 90%;
                  margin: 15px auto;
                }
                .content {
                  padding: 25px 20px;
                }
                .otp-box {
                  font-size: 32px;
                  letter-spacing: 10px;
                  padding: 20px;
                  margin: 20px auto;
                }
                .note {
                  margin: 20px auto;
                  padding: 12px 15px;
                }
                .header h2 {
                  font-size: 20px;
                  padding: 15px 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0; font-size: 20px;">${subject}</h2>
              </div>
              <div class="content">
                <p style="margin: 10px 0;">Your OTP for ${purpose} is:</p>
                <div class="otp-box">${otp}</div>
                <p style="color: #666; font-size: 13px; margin: 10px 0;">This OTP will expire in 2 minutes.</p>
                <div class="note">
                  <strong>Note:</strong> Please do not share this OTP with anyone.
                </div>
              </div>
              <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
};
