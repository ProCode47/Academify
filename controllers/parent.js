const { User, Student, Parent, Course, Result, Semester, Comment, Notification } = require('../models')

//Get Parent's Profile Details
const getProfile = async (req, res) => {
    try{
        const parentID = req.user.userID // Assuming userId is stored in the JWT token

        //Find parent by id
        const parent = await Parent.findOne({user : parentID}).populate(['user', 'child']);

        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        // Extract user details
        const { firstName, lastName, email } = parent.user
        const {reg, level} = parent.child

        res.status(200).json({firstName, lastName, email, reg, level})

    } catch (error){
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

//View Childs results
const getResult = async (req,res) =>{
    try {
        const semester = req.params.semester;

        //Find results for semester 
        // const result = await Result.find({}) 
    } catch (error){
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getProfile, 
    getResult
};