const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.register = async (req, res) => {
    const { name, email, password, confirmpassword } = req.body;

    if (!name || !email || !password || password !== confirmpassword) {
        return res.status(400).json({ msg: 'Dados inválidos' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ msg: 'Usuário já existe' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: passwordHash });

    try {
        await user.save();
        res.status(201).json({ msg: 'Usuário registrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ msg: 'Erro no servidor' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Dados inválidos' });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ msg: 'Usuário não encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ msg: 'Senha inválida' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
};
