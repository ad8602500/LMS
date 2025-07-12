import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true, trim: true
    },
    topic: {
        type: String,
        required: true, trim: true
    },
    filePath: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: false
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class', required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School', required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

assignmentSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;