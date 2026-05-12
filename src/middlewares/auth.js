const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // Prototipando rápido: Pega o token do header (você pode mockar isso no Insomnia/Postman)
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(403).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    try {
        // O mock abaixo supõe que o token válido seja "Bearer superadmin_token"
        // Para a apresentação, você pode pular a validação real do JWT e injetar o usuário direto:
        req.usuario = { id: 1, role: req.headers['x-mock-role'] || 'RECEPCAO' }; 
        next();
    } catch (error) {
        res.status(401).json({ erro: 'Token inválido.' });
    }
};

const verificarRole = (rolesPermitidas) => {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidas.includes(req.usuario.role)) {
            return res.status(403).json({ 
                erro: `Acesso negado. Nível exigido: ${rolesPermitidas.join(' ou ')}.` 
            });
        }
        next();
    };
};

module.exports = { verificarToken, verificarRole };