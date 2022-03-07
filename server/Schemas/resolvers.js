const { AuthenticationError, ReplaceFieldWithFragment } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async ({ user = null, params }) => {
            const foundUser = await User.findOne({
                $or: [{ _id: user ? user._id : params.id }, {username: params.username}]
            });

            if(!foundUser) {
                throw new AuthenticationError('Not logged in');
            }

            return foundUser;
        }
    },

    Mutations: {
        login: async ({ body }) => {
            const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] });

            if(!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(body.password);

            if(!correctPw)
                throw new AuthenticationError('Wrong password');

            const token = signToken(user);

            return { token, user };
        },

        addUser: async ({ body }) => {
            const user = await User.create(body);

            if(!user)
                throw new AuthenticationError('Something went wrong');
            
            const token = signToken(user);
            return { token, user };
        },

        saveBook: async ({ user, body }) => {

            console.log(user);
           try {
               const updatedUser = await User.findOneAndUpdate(
                   { _id: user._id },
                   { $addToSet: { savedBooks: body } },
                   { new: true, runValidators: true }
               );

               return updatedUser;
           } catch(e) {
             console.log(e);
             throw new AuthenticationError('Not logged in');
           }

        },

        removeBook: async ({ user, params }) => {
            if(user) {
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