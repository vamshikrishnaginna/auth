const router = require('express').Router();
const User = require('../model/User');
const { registerValidation } = require('../validation');




router.post('/register', async (req,res) => {
    //Lets Validate the data before we create a user
    const { error } = registerValidation(req.body);
    if(error)
    {
        return res.status(400).send(error.details[0].message);
    }
    //checking if user already exists in the database
    const emailExist = await User.findOne({email:req.body.email});
    if(emailExist)
    {
        return res.status(400).send('Email already exists');
    }

    //Create a new user
    const user = new User({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
    });
    try {
        const savedUser = await user.save();
        res.status(200).send(savedUser);
        
    } catch (error) {
        res.status(400).send(error);
        
    }
})

module.exports = router;