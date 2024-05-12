import Users from "../models/UsersModel.js";
import fs from 'fs';
import path from "path";
import crypto from 'crypto';

export const uploadPhoto = async(req, res) => {
    const findUser = await Users.findOne({
        where:{
            uuid:req.params.id
        }
    });

    if(!findUser) return res.status(404).json({msg: "user not found"});

    if(req.files === null) return res.status(404).json({msg: "file not found"});

    const file = req.files.photo;
    // const fileSize = file.data.length;
    const ext = path.extname(file.name);
    // const displayName = file.name;
    const fileName = crypto.randomUUID()+ext;
    const link = `/photos/${fileName}`;
    const allowedType = ['.png','.jpg','.jpeg'];

    //filter file type
    if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "type file not allowed"});

    //delete foto
    if(findUser.image !== null){
        const filePath = `./public/photos/${findUser.image}`;
        if(!fs.existsSync(filePath)){
            console.log('file tidak di temukan');
        }
        else{
            fs.unlinkSync(filePath);
            console.log('file deleted');
        }
        
    }

    file.mv(`./public/photos/${fileName}`, async(err)=>{
        if(err) return res.status(500).json({msg: err.message});
        try {
            await findUser.update({
                image:fileName,
                url_image:link
            });

            return res.status(201).json({msg: "file uploaded"});
        } catch (error) {
            return res.status(500).json({msg: error.message});
        }
    });
}