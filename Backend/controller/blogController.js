const Joi = require("joi");
const Blog = require("../models/blog");
const fs = require('fs');
const { BACKEND_SERVER_PATH } = require('../Config/index');
const BlogDto = require("../dto/blog");
const BlogDetailDto = require("../dto/blog-details");
const blogs = require("../models/blog");
const Comment = require("../models/comment");


const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const blogController = {

    async createBlog(req, res, next) {
        // 1. Validate req.body
        const blogBlogSchema = Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            photo: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
        });

        const { error } = blogBlogSchema.validate(req.body);
        if (error) {
            return res.status(401).json({ message: "Error in creating blog" });
        }

        // Extract fields from req.body
        const { title, author, content, photo } = req.body;

        // Read as buffer
        let buffer;
        try {
            buffer = Buffer.from(
                photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
                "base64"
            );
        } catch (error) {
            return next(error);
        }

        // Allocate a random name
        const imagePath = `${Date.now()}-${author}.png`;

        try {
            fs.writeFileSync(`storage/${imagePath}`, buffer);
        } catch (error) {
            return next(error);
        }

        // Create new blog
        let newBlog;
        try {
            newBlog = new Blog({
                title,
                content,
                author,
                photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`
            });

            await newBlog.save();
        } catch (error) {
            return next(error);
        }

        // 4. Return response
        let blogDto = new BlogDto(newBlog);
        return res.status(201).json({ blog: blogDto });
    },
    async readByIdBlog(req, res, next) {
        // Implementation here
        const readByIdBlogScheme = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });
        const {error} = await readByIdBlogScheme.validate(req.params)
        if(error){
            const error={
                status: 401,
            message: "Invalid ID"
            }
            return next(error);
        }

        const {id} = req.params;
        let readByIdBlogResult;

        try{
            readByIdBlogResult =await Blog.findOne({_id: id}).populate("author")
            const resultDto = new BlogDetailDto(readByIdBlogResult)
            return res.status(201).json({ blog: resultDto });

        } catch (error) {
            return next(error);
        }
    },
    async updateBlog(req, res, next) {
        // Validate request body
        const updateBlogSchema = Joi.object({
            title: Joi.string(),
            content: Joi.string(),
            author: Joi.string().regex(mongodbIdPattern),
            id: Joi.string().regex(mongodbIdPattern).required(),
            photo: Joi.string(),
        });
        
        const { error } = updateBlogSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: "Validation Error", details: error.details });
        }
        
        const { title, content, author, id, photo } = req.body;
    
        let blog;
        try {
            blog = await Blog.findById(id);
            if (!blog) {
                return res.status(404).json({ message: "Blog not found" });
            }
        } catch (error) {
            return next(error);
        }
    
        let imagePath;
        if (photo) {
            if (blogs.photoPath) {
                const previousPhoto = blog.photoPath.split("/").pop();
                try {
                    fs.unlinkSync(`storage/${previousPhoto}`);
                } catch (error) {
                    return next(error);
                }
            }
    
            // Read new photo as buffer
            const buffer = Buffer.from(
                photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
                "base64"
            );
    
            // Allocate a random name for the new photo
            imagePath = `${Date.now()}-${author}.png`;
    
            try {
                fs.writeFileSync(`storage/${imagePath}`, buffer);
            } catch (error) {
                return next(error);
            }
        }
    
        const updateData = {
            title,
            content,
        };
    
        if (imagePath) {
            updateData.photoPath = `${BACKEND_SERVER_PATH}/storage/${imagePath}`;
        }
    
        try {
            await Blog.updateOne({ _id: id }, updateData);
            return res.status(200).json({ message: "Blog updated successfully" });
        } catch (error) {
            return next(error);
        }
    },    
    async readBlog(req, res, next) {
        // Implementation here
        try{
            const allBlog = await Blog.find({})
            const allBlogDto = []
            for(let i=0 ; i< allBlog.length; i++){
                const blogDTO = new BlogDto(allBlog[i])  
                allBlogDto.push(blogDTO);
            }
            return res.status(201).json({blogs: allBlogDto});

        } catch (error) {
            return next(error);
        }

    },
    async deleteBlog(req, res, next) {
        // Implementation here
        const deleteBlogSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        })

        const {error} =await deleteBlogSchema.validate(req.body)
        if(error){
            return next(error)
        }

        const {id}= req.body;

        let blogNeedToDelete;
        try{
            blogNeedToDelete = await Blog.findOne({_id: id})
            if(!blogNeedToDelete){
                return res.status(201).json("Blog not found!")
            }
        } catch (error) {
            return next(error);
        }
        try{
         await  Blog.deleteOne(blogNeedToDelete)
         await  Comment.deleteMany({blog: id})
        } catch (error) {
            return next(error);
        }
        return res.status(201).json({message: "Blog deleted!"})

    }

};

module.exports = blogController;
