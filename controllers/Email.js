import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "mail.kopkarla.co.id",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "ara.fa@kopkarla.co.id",
      pass: "Komp4kl4123!@#",
    },
});

export const sendMail = async(req, res) => {
    try {
        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: '"system test" <ara.fa@kopkarla.co.id>', // sender address
            to: "it.dev@kopkarla.co.id", // list of receivers
            subject: "test", // Subject line
            text: "test", // plain text body
            html: "<b>test</b>", // html body
        });

        return res.status(200).json({msg: "success"});
    } catch (error) {
        return res.status(500).json({msg: error});
    }
}