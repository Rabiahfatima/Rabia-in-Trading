class BlogDetailDto{
    constructor(blog){
        this._id = blog._id;
        this.name = blog.name
        this.title=blog.title
        this.photo= blog.photoPath
        this.authorName= blog.author
        this.authorUsername= blog.author
        this.createdAt= blog.createdAt
    }
}
module.exports = BlogDetailDto;