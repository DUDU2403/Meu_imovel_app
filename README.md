# 🏠 Meu Imóvel App

Uma aplicação moderna de marketplace para compra, venda e aluguel de imóveis. Desenvolvida com React (frontend) e Node.js/Express (backend).

## 🎯 Funcionalidades

- ✨ **Buscar Imóveis**: Interface moderna com filtros por tipo (venda/aluguel) e localização
- 📢 **Anunciar Imóveis**: Dashboard com gerenciamento completo de seus anúncios
- 🖼️ **Upload de Fotos**: Integração com Cloudinary para hospedagem de imagens
- 👤 **Gerenciamento de Anúncios**: Editar, deletar e acompanhar seus imóveis
- 📱 **Responsivo**: Design totalmente adaptável para desktop e mobile
- 🎨 **Interface Moderna**: Gradientes, animações e componentes atualizados

## 📋 Pré-requisitos

- Node.js (v16+)
- npm ou yarn
- MongoDB Atlas (conta gratuita)
- Cloudinary (conta gratuita)

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/meu-imovel-app.git
cd meu-imovel-app
```

### 2. Configure o Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env`:
```
MONGO_URI=sua_string_de_conexao_mongodb
PORT=5000
```

Inicie o servidor:
```bash
node server.js
```

### 3. Configure o Frontend

```bash
cd ../frontend
npm install
```

Crie um arquivo `.env`:
```
VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=seu_upload_preset
```

Inicie o desenvolvimento:
```bash
npm run dev
```

## 🌐 Variáveis de Ambiente

### Backend (.env)
- `MONGO_URI`: Sua string de conexão MongoDB Atlas
- `PORT`: Porta do servidor (padrão: 5000)

### Frontend (.env)
- `VITE_CLOUDINARY_CLOUD_NAME`: Seu nome de cloud do Cloudinary
- `VITE_CLOUDINARY_UPLOAD_PRESET`: Seu upload preset do Cloudinary

## 📦 Estrutura do Projeto

```
meu-imovel-app/
├── backend/
│   ├── server.js          # Servidor Express
│   ├── package.json       # Dependências
│   └── .env              # Variáveis de ambiente
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Componente principal
│   │   ├── main.jsx       # Entrada da aplicação
│   │   └── index.css      # Estilos globais
│   ├── package.json       # Dependências
│   ├── vite.config.js     # Configuração Vite
│   ├── tailwind.config.js # Configuração Tailwind
│   └── .env              # Variáveis de ambiente
└── README.md
```

## 🔌 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/imoveis` | Listar todos os imóveis |
| POST | `/imoveis` | Criar novo imóvel |
| PUT | `/imoveis/:id` | Atualizar imóvel |
| DELETE | `/imoveis/:id` | Deletar imóvel |
| POST | `/migrar` | Migrar dados antigos |

## 🛠️ Tecnologias

### Frontend
- React 19.2.4
- Vite 8.0.1
- Tailwind CSS 4.2.2
- Axios (requisições HTTP)
- Lucide React (ícones)

### Backend
- Node.js
- Express 5.2.1
- MongoDB/Mongoose 9.3.1
- CORS habilitado

### Serviços Externos
- MongoDB Atlas (banco de dados)
- Cloudinary (hospedagem de imagens)

## 📱 Uso da Aplicação

### Modo Buscar
- Navegue pelos imóveis disponíveis
- Filtre por tipo (venda/aluguel)
- Pesquise por título ou localização

### Modo Anunciar
- Crie novos anúncios de imóveis
- Edite seus anúncios existentes
- Gerencie seus imóveis
- Delete anúncios quando necessário

## 🚀 Deploy

### Vercel (Frontend)
1. Push seu código para GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Importe seu repositório
4. Configure as variáveis de ambiente
5. Deploy automático a cada push

### Render (Backend)
1. Crie um account em [render.com](https://render.com)
2. Crie um novo Web Service
3. Conecte seu repositório GitHub
4. Configure variáveis de ambiente
5. Deploy automático

### Alternativa: Railway
1. Acesse [railway.app](https://railway.app)
2. Conecte seu GitHub
3. Selecione o repositório e pasta `/backend`
4. Configure variáveis de ambiente
5. Deploy realizado

## 👨‍💻 Autor

Samuel

## 📄 Licença

Este projeto é de código aberto e disponível sob a licença MIT.

## 📞 Suporte

Para dúvidas ou sugestões, abra uma issue no repositório.
