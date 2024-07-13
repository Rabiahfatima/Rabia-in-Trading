class BlogDto{
    constructor(blog){
        this._id = blog._id;
        this.name = blog.name
        this.author = blog.author
        this.title=blog.title
        this.photo= blog.photoPath
    }
}
module.exports = BlogDto;