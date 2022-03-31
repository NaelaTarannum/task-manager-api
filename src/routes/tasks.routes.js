const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Task = require('../models/task');

const router = express.Router();

//tasks?sortBy=createdAt:desc
router.get('/',auth,(req,res)=>{
    const sort = {}
    let isCompleted = undefined;
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]]= parts[1]
    }
    if(req.query.completed){
        isCompleted = req.query.completed === "true"
    Task.find({author: req.user._id,coompleted: isCompleted}).limit(parseInt(req.query.limit) || null).sort(sort).then((tasks)=>res.status(200).send(tasks)).catch((error)=>res.status(500).send(error));

    }
    else{
    Task.find({author: req.user._id}).limit(parseInt(req.query.limit)|| null).sort(sort).then((tasks)=>res.status(200).send(tasks)).catch((error)=>console.log(error));

    }   
})
router.get('/:taskID',auth,async (req,res)=>{
    if (!mongoose.Types.ObjectId.isValid(req.params.taskID)){
        return res.status(400).send({error: 'Invalid ID!'})
      }
      const _id= req.params.taskID;
      try{
            const task = await Task.findOne({
                _id,
                author: req.user._id
            })
            if(!task){
                return res.status(404).send()
            }
            res.send(task)
      }catch(e){
          res.status(500).send()
      }
    Task.findById(req.params.taskID).then((tasks)=>res.status(200).send(tasks)).catch((error)=>res.status(500).send(error));
})
router.post('/',auth,(req,res)=>{
    const task = new Task({
        ...req.body,
        author: req.user._id
    })
    // const task = new Task(req.body);
   task.save().then(()=>{res.send(task)}).catch((error)=>{res.status(400).send(error)}) 
})
router.patch('/:taskID',auth, async(req,res)=>{
    const fields = ["description","coompleted"];
    const sentFields = Object.keys(req.body);
    const valid = sentFields.every((field)=> fields.includes(field));
    if(!valid){
        return res.status(400).send();
    }
    try{
        // const task = await Task.findByIdAndUpdate(req.params.taskID,req.body,{new: true, runValidators: true});
        const task = await Task.findOne({_id:req.params.taskID, author:req.user._id});
      
        //no user
        if (!task){
            return res.status(404).send();
        }
        sentFields.forEach((field)=>{
            task[field] = req.body[field];
        })
        await task.save();
        res.send(task)

      }catch(e){
            res.status(400).send(e)
      }

})

router.delete('/:id',auth,async (req,res)=>{
    try{
            const task = await Task.findOneAndDelete({_id:req.params.id,author: req.user._id});
            if(!task){
                return res.status(400).send()
            }
            return res.status(200).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})
module.exports = router; 