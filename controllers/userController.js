const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')


//get all users
//get/users
//access private
const getAllUsers = asyncHandler(async(req,res) => {
    const users = await User.find().select('-password').lean()
    if(!users?.length){
        return res.status(400).json({ message : 'No users found'})
    }
    res.json(users)
})

//create new users
//post/users
//access private
const createNewUser = asyncHandler(async(req,res) => {
    const { username, password , roles} = req.body

    //Confirm data
    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({ message: 'All fields are required'})
    }

    //Check for dublicate
    const dublicate = await User.findOne({ username }).lean().exec()

    if( dublicate){
        return res.status(409).json({message: 'Duplicate username'})
    }

    //Hash password
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const userObject = { username, "password": hashedPwd, roles}

    //Create and store new user
    const user = await User.create(userObject)

    if(user){
        res.status(201).json({ message: `New user ${username} created`})
    }
    else{
        res.status(400).json({ message: 'Invalid user data received'})
    }
})

//update a user
//patch/users
//access private
const updateUser = asyncHandler(async(req,res) => {
    const { id, username, roles, active, password } = req.body

    //confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean'){
        return res.status(400).json({ message: 'All fields are required'})
    }

    const user = await User.findById(id).exec()

    if (!user){
        return res.status(400).json({ message: 'User not found'})
    }

    //Check for dublicate
    const dublicate = await User.findOne({ username }).lean().exec()
    //Allow update to the original user
    if(dublicate && dublicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username'})
    }
    user.username = username
    user.roles = roles
    user.active = active

    if(password) {
        //hash password
        user.password = await bcrypt.hash(password, 10) //salt rounds
    }

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated`})
})

//delete a user
//delete/users
//access private
const deleteUser = asyncHandler(async(req,res) => {
    const { id } = req.body

    if(!id) {
        return res.status(400).json({ message: 'User ID Required'})
    }

    const note = await Note.findOne({ user: id }).lean()
    if(note) {
        return res.status(400).json({ message: 'User has assigned notes'})
    }

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({ message: 'User not found'})
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}