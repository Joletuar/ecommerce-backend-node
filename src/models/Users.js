const { Schema, model, default: mongoose } = require('mongoose');

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: {
                values: ['admin', 'client', 'super-user', 'SEO'],
                message: '{VALUE} no es un role válido',
                default: 'client',
                required: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.models.User || model('User', userSchema);

module.exports = User;
