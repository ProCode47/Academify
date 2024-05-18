const { User, Student, Parent, Course, Result, Semester, Comment, Notification } = require('../models')
const authController = require('../controllers/auth');
const bcrypt = require("bcrypt");

//Get Parent's Profile Details
const getProfile = async (req, res) => {
    try{

        const parentID =  req.user._id;

        //Find parent by id
        const parent = await Parent.findOne({user : parentID}).populate([
            {
                path: 'user'
            },
            {
                path: 'children', 
                populate: {
                    path:  'user',
                    model: 'User'
                }
            }
        ]);

        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        // Extract user details
        const profile = {
            firstName: parent.user.firstName,
            lastName: parent.user.lastName,
            email: parent.user.email
            // Add more fields as needed
        };

        const children = parent.children

        if (children){
            res.status(200).json({profile, children})
        }

        res.status(200).json({profile})

    } catch (error){
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const editProfile = async (req, res) => {
    try{
        const parentID = req.user._id;
        const filter = {_id : parentID}

        const {firstName, lastName, password} = req.body

        // Hash password
        let hashedPassword
        if(password){
            hashedPassword = await bcrypt.hash(password, 10);
        }

        //Find parent by id
        const parent = await User.findOne(filter)
        

        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        if (!password){
            parent.firstName = firstName
            parent.lastName = lastName

            await parent.save()

            // Generate token for the updated user
            const updatedUser = await User.findById(parentID);
            const token = authController.generateToken(updatedUser);

            return res.json({ message: "Profile updated successfully", token })
        } 

        parent.firstName = firstName
        parent.lastName = lastName
        parent.password = hashedPassword

        await parent.save()

        // Generate token for the updated user
        const updatedUser = await User.findById(parentID);
        const token = authController.generateToken(updatedUser);

        return res.json({ message: "Password updated successfully", token })

    } catch(error){
        console.error("Error fetching parent profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

//Get Results
const getChildResult = async (req,res) => {
    try{
        const {reg, semesterName, session} = req.body

        const semester = await Semester.findOne({name: semesterName, session: session})

        const student = await Student.findOne({reg: reg})

        if (!semester) {
            return res.status(404).json({ message: 'Semester not found' });
        }

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        const result = await Result.find({student: student._id, semester: semester._id}).populate('course')

        return res.status(200).json({result})
    } catch(error){
        console.error("Error fetching child's result:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

//add child to parent
const addChild = async (req,res) =>{
    try {
        const parentID = req.user._id;

        //Find parent by id
        const parent = await User.findById(parentID)

        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        const {regNo} = req.body
        const filter = {reg: regNo}

        const student = await Student.findOne(filter)

        if (!student){
            return res.status(404).json({ message: 'Student not found' });
        }
         
        Parent.findOneAndUpdate({user : parentID}, {$push: {children: student._id}}, {new: true}, (err)=>{
            if(err){
                console.error(err);
                res.status(500).json({ message: 'Internal server error' })
            } else{
                console.log('Successfull')
                res.status(200).json({  message: 'Child Added Successfully'})
            }
        })

    } catch (error){
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getProfile,
    editProfile,
    addChild,
    getChildResult
};