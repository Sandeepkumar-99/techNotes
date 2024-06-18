const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')

// @desc Get all Notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async(req, res) =>{
    const notes = await Note.find().select().lean()
    if(!notes?.length){
        return res.status(400).json({message: 'No notes found'})
    }

    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return { username: user.username, ...note }
    }))

    res.json(notesWithUser)

})


// @desc Create new Note
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async(req, res) =>{
    const { user, title, text} = req.body

    if(!user || !title || !text ){
        return res.status(400).json({message:'All fields are required'})
    }

    const duplicate = await Note.findOne({title}).lean().exec()
    
    if(duplicate){
        return res.status(409).json({message:'Note with same title already exists'})
    }

    const noteObject = {user, title, text}
    const note = await Note.create(noteObject)
    
    if(note){
        res.status(201).json({message: `New note with title ${title} is created for user ${user}`})
    }else{
        res.status(400).json({message:'Invalid Data Provided'})
    }
})


// @desc Update note
// @route PATCH /users
// @access Private
const updateNote = asyncHandler(async(req, res) =>{
    const{ id, user , title , text, completed }=req.body


    // confirm the data
    if(!id || !user || !title || !text || typeof completed !== 'boolean'){
        return res.status(400).json({message: 'All Fields are Required'})
    }

    // Find the note by noteID
    const note = await Note.findById(id).exec()
    if(!note){
        return res.status(400).json({message: "Note not found"})
    }

    // Check for the duplicate by title
    const duplicate = await Note.findOne({title}).lean().exec()

    if(duplicate){
        return res.status(409).json({message: 'Title Name already exists'})
    }


    note.id = id
    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()
    res.json({message:`${updatedNote.title} Note has been updated`})
})


// @desc Delete a note
// @route Delete /notes
// @access Private
const deleteNote = asyncHandler(async(req, res) =>{
    const {id} = req.body
    if(!id){
        return res.status(400).json({message: 'Note ID is required'})
    }

    const note = await Note.findById(id).exec()

    if(!note){
        return res.status(400).json({message: 'Note not found'})
    }

    const result = await note.deleteOne()
    reply = `Note with title: ${note.title} has been deleted`
    res.json(reply)
})

module.exports ={
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}