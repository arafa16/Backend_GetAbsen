import jwt from 'jsonwebtoken';
import Users from '../models/UsersModel.js';
import nodemailer from 'nodemailer';
import argon from 'argon2';

export const sendEmail = async(req, res) => {
    const {email} = req.body;

    const findUser = await Users.findOne({
        where:{
            email:email
        }
    });

    if(!findUser) return res.status(404).json({msg: "email not found"});

    const secret = process.env.SESS_SECRET;

    const token = jwt.sign({id:findUser.uuid},secret,{
        expiresIn: "5m"
    });

    const link = `${process.env.LINK_FRONTEND}/resetPassword/${token}`;

     // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL,
            pass: process.env.MAIL_PASS
        }
    });

    const msg = {
        from: '"Support IT Kopkarla" <no-replay@kopkarla.co.id>',
        to: email,
        subject: "Reset Password",
        text: 
        `click this link for reset your password ${link}`
    };

    try {
        await transporter.sendMail(msg);
        return res.status(200).json({msg: "success, check your email for reset password"});
    } catch (error) {
        return res.status(500).json({msg: error});
    }

}

export const verifyToken = async(req, res) => {
    const {token} = req.params;

    const secret = process.env.SESS_SECRET;

    try {
        const verify = jwt.verify(token, secret);

        const findUser = await Users.findOne({
            where:{
                uuid: verify.id
            },
            attributes:['uuid','name','email','isActive']
        })

        if(!findUser) return res.status(404).json({msg: "user not found"});

        res.status(200).json(findUser);
    } catch (error) {
        res.status(500).json({msg: error});
    }
}

export const resetPassword = async(req, res) => {
    const {token} = req.params;
    const {password, confPassword} = req.body;
    const secret = process.env.SESS_SECRET;

    if(password !== confPassword) return res.status(400).json({msg: "password dosn't match"});

    try {
        const verify = jwt.verify(token, secret);

        const findUser = await Users.findOne({
            where:{
                uuid: verify.id
            }
        });

        console.log(findUser);

        if(!findUser) return res.status(404).json({msg: "user not found"});

        const hashPassword = await argon.hash(password);

        await findUser.update({
            password:hashPassword
        });

        res.status(200).json({msg: "change password success"});
    } catch (error) {
        res.status(500).json(error);
    }
}