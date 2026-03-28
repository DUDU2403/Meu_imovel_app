const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ BANCO CONECTADO"))
  .catch(err => console.log("❌ ERRO MONGO:", err));

// Molde do Imóvel
const Imovel = mongoose.model('Imovel', new mongoose.Schema({
    titulo: String,
    preco: Number,
    localizacao: String,
    contato: String,
    imagemUrl: String,
    tipo: String, // 'venda' ou 'aluguel'
    anuncianteTipo: String, // 'vendedor' ou 'locador'
    nomeAnunciante: String // Nome da pessoa que está anunciando
}));

// ROTA 1: Buscar todos
app.get('/imoveis', async (req, res) => {
    const imoveis = await Imovel.find();
    res.json(imoveis);
});

// ROTA 2: Criar novo
app.post('/imoveis', async (req, res) => {
    const novo = new Imovel(req.body);
    await novo.save();
    res.json(novo);
});

// ROTA 3: DELETAR (A Peça que faltava!)
app.delete('/imoveis/:id', async (req, res) => {
    try {
        await Imovel.findByIdAndDelete(req.params.id);
        res.json({ message: "Apagado!" });
    } catch (err) {
        res.status(500).send(err);
    }
});

// ROTA 4: ATUALIZAR ANÚNCIO
app.put('/imoveis/:id', async (req, res) => {
    try {
        const atualizado = await Imovel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(atualizado);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(5000, () => console.log("🚀 BACKEND EM: http://localhost:5000"));