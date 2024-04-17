const { Student, User } = require('../models');

const getStudentByRegNo = async (req, res) => {
    try {
        const regNo = req.params.regNo;

        // Find student by registration number
        const student = await Student.findOne({ registrationNumber: regNo }).populate('user');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Extract user details from populated data
        const { firstName, lastName, email } = student.user;
        console.log({student})

        res.status(200).json({ firstName, lastName, email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getStudentByRegNo
};
