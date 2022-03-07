const { AuthenticationError, ReplaceFieldWithFragment } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                const user = await User.findById(context.user._id);

                return user;
            }

            throw new AuthenticationError('Not logged in');
        }
    },

    Mutations: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if(!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw)
                throw new AuthenticationError('Wrong password');

            const token = signToken(user);

            return { token, user };
        },

        addUser: async (parent, args) => {
            const user = await User.create(args);

            if(!user)
                throw new AuthenticationError('Something went wrong');
            
            const token = signToken(user);

            return { token, user };
        },

        saveBook: async (parent, { book }, context) => {
            console.log(context);

            if(context.user) {
                const newBook = new Book({ book });

                await User.findByIdAndUpdate(context.user._id, { $push: { savedBooks: newBook } });

                return newBook;
            }

            throw new AuthenticationError('Not logged in');
        },

        removeBook: async (parent, { params }, context) => {
            if(context.user) {
                const updateUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { boodId: params.bookId } } },
                    { new: true }
                );

                if(!updateUser)
                    return new AuthenticationError('Could not find this user');

                return updateUser;
            }
        }
    }
};

module.exports = resolvers;