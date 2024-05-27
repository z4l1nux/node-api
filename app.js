require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/user');

const app = express();

// Config JSON Response
app.use(express.json());

// Public Route
app.get('/', (req, res) => {
    res.status(200).json({ msg: 'Bem vindo a nossa API!' });
});

// Private Route
app.get('/user/:id', checkToken, async (req, res) => {
    const id = req.params.id;
    console.log('User ID from URL:', id);

    try {
        // check if user exists
        const user = await User.findById(id, '-password');
        if (!user) {
            console.log('Usuário não encontrado');
            return res.status(404).json({ msg: 'Usuário não encontrado!' });
        }

        console.log('Usuário encontrado:', user);
        res.status(200).json({ user });
    } catch (err) {
        console.log('Erro ao procurar usuário:', err);
        res.status(500).json({ msg: 'Erro no servidor, tente novamente mais tarde!' });
    }
});

function checkToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Authorization Header:', authHeader);
    console.log('Token:', token);

    if (!token) {
        console.log('Acesso negado: Token não fornecido');
        return res.status(401).json({ msg: 'Acesso negado!' });
    }

    try {
        const secret = process.env.JWT_SECRET;
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                console.log('Erro na verificação do token:', err);
                return res.status(400).json({ msg: 'O Token é inválido!' });
            }
            console.log('Token verificado com sucesso:', decoded);
            req.userId = decoded.id; // Store the decoded user ID in the request
            next();
        });
    } catch (err) {
        console.log('Erro na verificação do token:', err);
        res.status(400).json({ msg: 'O Token é inválido!' });
    }
}

// Register User
app.post('/auth/register', async (req, res) => {
    const { name, email, password, confirmpassword } = req.body;

    // validations
    if (!name) {
        return res.status(422).json({ msg: 'O nome é obrigatório!' });
    }
    if (!email) {
        return res.status(422).json({ msg: 'O email é obrigatório!' });
    }
    if (!password) {
        return res.status(422).json({ msg: 'A senha é obrigatória!' });
    }
    if (password !== confirmpassword) {
        return res.status(422).json({ msg: 'As senhas não conferem!' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email });
    if (userExists) {
        return res.status(422).json({ msg: 'Por favor, utilize outro e-mail!' });
    }

    // Create password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
        name,
        email,
        password: passwordHash,
    });

    try {
        await user.save();
        console.log('Senha criptografada:', user.password);
        res.status(201).json({ msg: 'Usuário criado com sucesso!' });
    } catch (error) {
        res.status(500).json({ msg: 'Erro no servidor, tente novamente mais tarde!' });
    }
});

// Login User
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // validations
    if (!email) {
        return res.status(422).json({ msg: 'O email é obrigatório!' });
    }
    if (!password) {
        return res.status(422).json({ msg: 'A senha é obrigatória!' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(404).json({ msg: 'Usuário não encontrado!' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(422).json({ msg: 'Senha inválida!' });
    }

    // Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET não está definido. Verifique o arquivo .env.');
        return res.status(500).json({ msg: 'Erro no servidor, chave JWT não definida!' });
    }

    // Create token
    const token = jwt.sign(
        {
            id: user._id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1h',
        }
    );

    res.status(200).json({ msg: 'Autenticação realizada com sucesso!', token });
});

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.hw3ef8f.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0`).then(() => {
    app.listen(3000, () => {
        console.log('Conectou ao banco e servidor está rodando na porta 3000!');
    });
}).catch((err) => {
    console.log('Erro ao conectar ao banco de dados:', err);
});
