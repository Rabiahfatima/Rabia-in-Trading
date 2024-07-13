const Joi = require("joi");
const Comment = require("../models/comment");

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const commentController = {

    async createComment (req, res, next){
        
        // 1. Validate req.body
        const commentSchema = Joi.object({
            text: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            blog: Joi.string().regex(mongodbIdPattern).required()
        });

        const { error } = commentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        // Extract fields from req.body
        const { text, author, blog} = req.body;

        let newComment
        try {
             newComment = new Comment({
                text, author, blog, createdAt: new Date()
            })
            await newComment.save()

            
        } catch (error) {
            return next(error);
        }

        return res.status(201).json({message: "Comment Added!"});
   

    },



    async getComment(req, res, next) {
        // 1. Validate req.params
        const getCommentSchema = Joi.object({
            id: Joi.string().pattern(new RegExp(mongodbIdPattern)).required().messages({
                'string.pattern.base': 'ID must be a valid MongoDB ObjectId.',
                'string.empty': 'ID is required.',
            })
        });

        const { error } = getCommentSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Extract fields from req.params
        const { id } = req.params;

        try {
            const showComment = await Comment.findOne({ _id: id }).populate('author blog').lean();
            if (!showComment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            // Debugging: Log the showComment object
            console.log('showComment:', showComment);

            return res.status(200).json({ data: showComment });
        } catch (error) {
            return next(error);
        }
    },
    async deleteComment (req, res, next){

    }
}

module.exports = commentController;