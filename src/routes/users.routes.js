const express = require('express');
const mongoose = require('mongoose');

const sharp = require('sharp')

const { findById } = require('../models/user');
const User = require('../models/user');
const auth = require('../middleware/auth')
const { use, route } = require('./tasks.routes');
const multer = require('multer');
const {sendWelcomeEmail,sendByeEmail} = require('../emails/account')
const router = new express.Router();
const upload = multer({
    limits: {
        fileSize: 1000000
    },  
     fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("PLease upload a valid image"))
        }
        cb(undefined, true)
        // cb(new Error("Filw must be a pdf"))
        // cb(undefined, true)

    }
})
router.post('/',async (req,res)=>{
    const user = new User(req.body);
    // try{
    await user.save()
    sendWelcomeEmail(user.email,user.name)
    const token = await user.generateAuthToken();
    res.status(201).send({user,token})
    // }catch(error){res.status(400).send(error)}
})

router.post('/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save();
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/logoutAll',auth,async (req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save();
        res.status(200).send()
    }catch(e){
        res.status(500).send()

    }
})
router.get('/me',auth,(req,res)=>{
    res.send(req.user)
}); 


router.patch('/me',auth,async (req,res)=>{
    const allowedUpdates = ['name','email','password','age'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update);
    })

    if(!isValidOperation){
        return res.status(400).send()
    }
    if (!mongoose.Types.ObjectId.isValid(req.user._id)){
        return res.status(400).send({error: 'Invalid ID!'})
      }
      try{
        // const user = await User.findByIdAndUpdate(req.params.userID,req.body,{new: true, runValidators: true});
        updates.forEach((updateField)=>{
            req.user[updateField] = req.body[updateField]
        })
        req.user.save();

        res.send(req.user)

      }catch(error){
            res.status(400).send(error)
      }
})

router.post('/login',async (req,res)=>{
    // try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        return res.send({user,token});
    // }catch(err){
    //     res.status(400).send(err)
    // }
})
router.post('/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(404).send({error})
});

router.delete('/me/avatar',auth,async(req,res)=>{
    req.user.avatar = undefined;
    await req.user.save()
    res.send()
})
router.delete('/me',auth,async (req,res)=>{
    try{
            // const user = await User.findByIdAndDelete(req.user._id);
            // if(!user){
            //     return res.status(400).send()
            // }
            await req.user.remove();
            sendByeEmail(req.user.email,req.user.name)
            return res.status(200).send(req.user);
    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/:id/avatar',async (req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
            throw new Error()
        }
        //tell the user what type of jfile you are sending back
        res.set('Content-Type','image/png')
        res.send(user.avatar);
    }catch(error){
        res.status(404).send()
    }
})

module.exports = router; 