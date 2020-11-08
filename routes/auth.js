const router = require('express').Router();
const User = require('../model/User');
const { registerValidation, loginValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


//REGISTER
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
    //Hash the passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //Create a new user
    const user = new User({
        name:req.body.name,
        email:req.body.email,
        password:hashedPassword,
    });
    try {
        const savedUser = await user.save();
        res.status(200).send({user : savedUser.id});
        
    } catch (error) {
        res.status(400).send(error);
        
    }
})

//LOGIN
router.post("/login", async (req, res) =>{
     //Lets Validate the data before we create a user
     const { error } = loginValidation(req.body);
     if(error)
     {
         return res.status(400).send(error.details[0].message);
     }
     //checking if user already exists in the database
    const user = await User.findOne({email:req.body.email});
    if(!user)
    {
        return res.status(400).send('User does not exists');
    }
    //Check if password is correct
    const validPass = await bcrypt.compare(req.body.password,user.password);
    if(!validPass)
    {
        return res.status(400).send('Invalid password');
    }
    //Create and assign a token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);
});
module.exports = router;