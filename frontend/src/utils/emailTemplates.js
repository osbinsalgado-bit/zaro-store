export const welcomeEmailTemplate = (userName, verificationLink) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a ZARO STORE</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
        .content { padding: 20px; text-align: center; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Bienvenido a ZARO STORE!</h1>
        </div>
        <div class="content">
            <h2>Hola ${userName},</h2>
            <p>Te damos la bienvenida a ZARO STORE, donde encontrarás la mejor experiencia de compras en línea.</p>
            <p>Aprovecha nuestros descuentos al máximo y descubre productos exclusivos.</p>
            <p>Para activar tu cuenta y comenzar a disfrutar de todos los beneficios, por favor verifica tu correo electrónico haciendo clic en el botón a continuación:</p>
            <a href="${verificationLink}" class="button">Verificar Correo Electrónico</a>
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p><a href="${verificationLink}">${verificationLink}</a></p>
            <p>¡Gracias por unirte a nosotros!</p>
            <p>El equipo de ZARO STORE</p>
        </div>
        <div class="footer">
            <p>Si no solicitaste esta verificación, ignora este correo.</p>
            <p>&copy; 2026 ZARO STORE. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
`;