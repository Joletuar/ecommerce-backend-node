const { Schema, model, default: mongoose } = require('mongoose');

const productSchema = new Schema(
    {
        description: { type: String, require: true, default: '' },
        images: [{ type: String, require: true }], // Asi se define elemento de tipo arreglo
        inStock: { type: Number, require: true, default: 0 },
        price: { type: Number, require: true, default: 0 },
        sizes: [
            {
                type: String,
                enum: {
                    values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXL'], // Se declaran los únicos valores permitidos en este campo
                    message: '{VALUE} talla no válida', // Mensaje que retorna si se intenta almacenar algun valor diferente
                },
            },
        ],
        slug: { type: String, require: true, unique: true }, // El unique hace que este valor no se pueda repetir
        tags: [{ type: String }],
        title: { type: String, require: true, default: '' },
        type: {
            type: String,
            enum: {
                values: ['shirts', 'pants', 'hoodies', 'hats'], // Se declaran los únicos valores permitidos en este campo
                message: '{VALUE} no es un tipo válido', // Mensaje que retorna si se intenta almacenar algun valor diferente
            },
            default: 'shirts',
        },
        gender: {
            type: String,
            enum: {
                values: ['men', 'women', 'kid', 'unisex'], // Se declaran los únicos valores permitidos en este campo
                message: '{VALUE} no es un genero válido', // Mensaje que retorna si se intenta almacenar algun valor diferente
            },
            default: 'men',
        },
    },

    { timestamps: true } // Esto hace que se cree automaticamente los campos createdAt y updatedAt
);

// TODO: crear un indice en mongo que nos ayude a conectar 2 campos

productSchema.index({ title: 'text', tags: 'text' }); // Se especifica las columnas y su tipo

const Product = mongoose.models.Product || model('Product', productSchema); // De esta forma verificamos si ya existe el modelo, si lo encuentra devuelve ese, caso contrario crea uno nuevo

module.exports = Product;
