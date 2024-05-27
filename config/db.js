const mongoose = require('mongoose');
require('dotenv').config();

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.hw3ef8f.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conectou ao banco de dados!');
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
