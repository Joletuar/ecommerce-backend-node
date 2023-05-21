// Obtenemos el token de acceso
const getPaypalBearerToken = async () => {
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET_ID = process.env.PAYPAL_SECRET_ID;

    const base64Token = Buffer.from(
        `${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_ID}`,
        'utf-8'
    ).toString('base64');

    // De esta manera se crea el formato x-www-form-urlencoded
    const body = new URLSearchParams('grant_type=client_credentials');

    try {
        const resp = await fetch(process.env.PAYPAL_OAUTH_URL || '', {
            method: 'POST',
            // Esto se debe enviar siempre en el body
            body,
            // El debe ser de este tipo
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${base64Token}`,
            },
        });

        const data = await resp.json();

        return data.access_token;
    } catch (error) {
        console.log(error);
    }

    return null;
};

module.exports = {
    getPaypalBearerToken,
};
