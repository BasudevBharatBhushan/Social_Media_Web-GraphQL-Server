const { AuthenticationError } = require("apollo-server");
const Post = require("../../models/Post"); // For each Query, Mutation or Subscription it has its corresponding resolvers
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 }); //sort in descending order
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createPost(_, args, context) {
      const user = checkAuth(context);
      /* If the code is readable after this then the user is authenticated */

      if (args.body.trim() == "") {
        throw new Error("Post body must not be empty");
      }

      const newPost = new Post({
        body: args.body, //or, body:body
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });
      const post = await newPost.save();
      return post;
    },

    async deletePost(_, { postId }, context) {
      const user = checkAuth(context); //If we want we can destrucute it into const {username} = checkAuth(context);

      try {
        const post = await Post.findById(postId);
        if (user.username === post.username) {
          await post.delete();
          return "Post Deleted Successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
