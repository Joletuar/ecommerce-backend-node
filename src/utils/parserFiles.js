const formidable = require('formidable');
// const fs = require('fs');
const { v2: cloudrinary } = require('cloudinary');

// Cloudinary

cloudrinary.config(process.env.CLOUDINARY_URL || '');

const parserFiles = async (req) => {
    // Analizar el formulario que está llegando
    const form = new formidable.IncomingForm();

    return new Promise((resolve, reject) => {
        form.parse(req, async (err, fields, files) => {
            // console.log({ err, fields, files });

            // Si tenemos un error rechazamos
            if (err) {
                return reject(err);
            }

            const url = await saveFile(files.file);
            resolve(url);
        });
    });
};

const saveFile = async (file) => {
    /**
     * Método para guardar en file system
    
    // Obtener la info del archivo
    const data = fs.readFileSync(file.filepath);
    
    // Escribimos el archivo en nuestro directorio
    fs.writeFileSync(`./public/files/${file.originalFilename}`, data);
    
    // Borramos la data de la carpeta temporal para no llenar el caché
    
    fs.unlinkSync(file.filepath);
    
    return;
    */

    // Subida de la imagene a cloudinary
    const data = await cloudrinary.uploader.upload(file.filepath);
    // console.log(data);

    // Retorname el url público
    const { secure_url } = data;

    return secure_url;
};

module.exports = parserFiles;
