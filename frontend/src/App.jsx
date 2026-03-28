import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Home, MapPin, Search, PlusCircle, Trash2, MessageCircle, Camera, Loader2, Star, Heart, Share2, Eye, DollarSign, Users, CheckCircle, BarChart3, TrendingUp, Building2 } from 'lucide-react';

function App() {
  const [imoveis, setImoveis] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [modo, setModo] = useState("buscar"); // 'buscar' ou 'anunciar'
  const [abaAtiva, setAbaAtiva] = useState("todos"); // 'todos', 'venda', 'aluguel'
  const [selecionadoParaEdicao, setSelecionadoParaEdicao] = useState(null);
  const [imovelsSalvos, setImovelsSalvos] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [imoveisDoUsuario, setImoveisDoUsuario] = useState([]);
  const [mostraFormulario, setMostraFormulario] = useState(false);
  
  // Estados para o Formulário
  const [novoImovel, setNovoImovel] = useState({ titulo: "", preco: "", localizacao: "", contato: "", tipo: "venda", anuncianteTipo: "vendedor", nomeAnunciante: "", imagemUrl: "" });
  const [fotoArquivo, setFotoArquivo] = useState(null);

  const carregarImoveis = async () => {
    try {
      const res = await axios.get('http://localhost:5000/imoveis');
      setImoveis(res.data);
      // Carregar imóveis do usuário
      const imoveisUsuarioSalvos = JSON.parse(localStorage.getItem('imoveisUsuario') || '[]');
      const meuImoveis = res.data.filter(i => imoveisUsuarioSalvos.includes(i._id));
      setImoveisDoUsuario(meuImoveis);
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    }
  };

  useEffect(() => { 
    carregarImoveis();
    // Migração automática: atualizar propriedades antigas
    axios.post('http://localhost:5000/migrar').catch(err => console.log("Migração finalizada"));
  }, []);

  const toggleSalvar = (id) => {
    setImovelsSalvos(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const excluir = async (id) => {
    if (window.confirm("Deseja apagar este anúncio permanentemente?")) {
      await axios.delete(`http://localhost:5000/imoveis/${id}`);
      carregarImoveis();
    }
  };

  const filtrados = imoveis.filter(i => {
    const matchBusca = i.titulo.toLowerCase().includes(busca.toLowerCase()) || 
                       i.localizacao.toLowerCase().includes(busca.toLowerCase());
    const matchAba = abaAtiva === "todos" || i.tipo === abaAtiva;
    return matchBusca && matchAba;
  });

  // FUNÇÃO PRINCIPAL: Upload + Cadastro
  const cadastrar = async (e) => {
    e.preventDefault();
    if (!fotoArquivo && !selecionadoParaEdicao) return alert("Por favor, selecione uma foto!");
    if (!novoImovel.nomeAnunciante.trim()) return alert("Por favor, digite seu nome!");
    if (!novoImovel.titulo.trim()) return alert("Por favor, informe o título do imóvel.");
    if (!novoImovel.preco || isNaN(Number(novoImovel.preco))) return alert("Por favor, informe um preço válido.");
    if (!novoImovel.localizacao.trim()) return alert("Por favor, informe a localização.");
    if (!novoImovel.contato.trim()) return alert("Por favor, informe um contato.");

    setCarregando(true);
    try {
      let urlDaFoto = novoImovel.imagemUrl;
      
      if (fotoArquivo) {
        // 1. Upload para o Cloudinary
        const formData = new FormData();
        formData.append("file", fotoArquivo);
        formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        const resCloud = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );
        
        urlDaFoto = resCloud.data.secure_url;
      }

      // 2. Salvar ou Atualizar no Backend
      const dadosImovel = {
        ...novoImovel,
        nomeAnunciante: novoImovel.nomeAnunciante.trim(), // Remove espaços
        imagemUrl: urlDaFoto
      };

      if (selecionadoParaEdicao) {
        await axios.put(`http://localhost:5000/imoveis/${selecionadoParaEdicao}`, dadosImovel);
        alert("🏠 Anúncio atualizado com sucesso!");
      } else {
        const res = await axios.post('http://localhost:5000/imoveis', dadosImovel);
        
        // Salvar ID do imóvel no localStorage
        const imoveisUsuario = JSON.parse(localStorage.getItem('imoveisUsuario') || '[]');
        imoveisUsuario.push(res.data._id);
        localStorage.setItem('imoveisUsuario', JSON.stringify(imoveisUsuario));
        
        alert("🏠 Imóvel cadastrado com sucesso!");
      }

      setSelecionadoParaEdicao(null);
      setNovoImovel({ titulo: "", preco: "", localizacao: "", contato: "", tipo: "venda", anuncianteTipo: "vendedor", nomeAnunciante: "", imagemUrl: "" });
      setFotoArquivo(null);
      setMostraFormulario(false);
      carregarImoveis();
    } catch (err) {
      const mensagem = err.response?.data?.message || err.response?.data || err.message || "Erro desconhecido";
      alert(`Erro ao cadastrar: ${mensagem}`);
      console.error("Erro no cadastro:", err);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      {/* HEADER - Ultra Moderno */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0 cursor-pointer hover:opacity-80 transition">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-2.5 rounded-xl shadow-lg">
              <Home size={28} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">IMÓVEL PRO</h1>
              <p className="text-xs text-slate-500 font-semibold">Seu portal imobiliário</p>
            </div>
          </div>

          {/* Search Bar - Mais Moderno */}
          <div className="hidden md:flex flex-1 max-w-md relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition" size={20} />
            <input 
              placeholder="Buscar por cidade, bairro..." 
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-12 pr-5 py-3 rounded-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium text-slate-700 placeholder-slate-400" 
            />
          </div>

          {/* Mode Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setModo("buscar")}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm whitespace-nowrap ${
                modo === "buscar" 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-300 scale-105" 
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              🔍 Buscar
            </button>
            <button
              onClick={() => setModo("anunciar")}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm whitespace-nowrap ${
                modo === "anunciar" 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-300 scale-105" 
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              ✨ Anunciar
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Buscar..." 
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-sm" 
            />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {modo === "buscar" ? (
          // ===== MODO BUSCAR - Layout Moderno e Preenchido ====
          <>
            {/* Hero Section com Stats */}
            <section className="mb-10 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
              <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black mb-3 leading-tight">Encontre seu Imóvel Ideal</h2>
                <p className="text-lg text-blue-100 mb-8 max-w-2xl leading-relaxed font-medium">Navegue por milhares de propriedades cuidadosamente selecionadas. Filtre por preço, localização e tipo de anúncio.</p>
                <div className="flex flex-wrap gap-8 pt-4 border-t border-white/20">
                  <div>
                    <p className="text-3xl font-black">{imoveis.length}</p>
                    <p className="text-blue-100 text-sm font-semibold">Anúncios Ativos</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black">{imoveis.filter(i => i.tipo === 'venda').length}</p>
                    <p className="text-blue-100 text-sm font-semibold">Para Venda</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black">{imoveis.filter(i => i.tipo === 'aluguel').length}</p>
                    <p className="text-blue-100 text-sm font-semibold">Para Aluguel</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Filtros Modernos */}
            <div className="mb-8 flex flex-wrap gap-3 items-center">
              <button
                onClick={() => setAbaAtiva("todos")}
                className={`px-7 py-3 rounded-xl font-bold transition-all text-sm ${
                  abaAtiva === "todos" 
                    ? "bg-indigo-600 text-white shadow-lg" 
                    : "bg-white text-slate-700 border-2 border-slate-200 hover:border-indigo-300"
                }`}
              >
                📋 Todos ({imoveis.length})
              </button>
              <button
                onClick={() => setAbaAtiva("venda")}
                className={`px-7 py-3 rounded-xl font-bold transition-all text-sm ${
                  abaAtiva === "venda" 
                    ? "bg-emerald-600 text-white shadow-lg" 
                    : "bg-white text-slate-700 border-2 border-slate-200 hover:border-emerald-300"
                }`}
              >
                🏷️ À Venda ({imoveis.filter(i => i.tipo === 'venda').length})
              </button>
              <button
                onClick={() => setAbaAtiva("aluguel")}
                className={`px-7 py-3 rounded-xl font-bold transition-all text-sm ${
                  abaAtiva === "aluguel" 
                    ? "bg-orange-600 text-white shadow-lg" 
                    : "bg-white text-slate-700 border-2 border-slate-200 hover:border-orange-300"
                }`}
              >
                🔑 Aluguel ({imoveis.filter(i => i.tipo === 'aluguel').length})
              </button>
            </div>

            {/* Grid de Imóveis - Muito Melhorado */}
            <section>
              {filtrados.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
                  {filtrados.map(imovel => (
                    <div key={imovel._id} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:-translate-y-2 hover:scale-105">
                      {/* Imagem com Overlay */}
                      <div className="relative h-48 bg-gradient-to-b from-slate-200 to-slate-300 overflow-hidden">
                        <img src={imovel.imagemUrl} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500" alt={imovel.titulo} />
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                          <span className={`px-4 py-2 rounded-full font-black text-xs text-white shadow-lg ${
                            imovel.tipo === 'venda' ? 'bg-emerald-600' : 'bg-orange-600'
                          }`}>
                            {imovel.tipo === 'venda' ? '🏷️ À VENDA' : '🔑 ALUGUEL'}
                          </span>
                          <button 
                            onClick={() => toggleSalvar(imovel._id)}
                            className="bg-white/90 p-2 rounded-full hover:bg-white transition shadow-lg"
                          >
                            <Heart 
                              size={20} 
                              className={imovelsSalvos.includes(imovel._id) ? "fill-red-500 text-red-500" : "text-slate-400"}
                            />
                          </button>
                        </div>

                        {/* Preço Flutuante */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-8">
                          <p className="text-white font-black text-2xl flex items-center gap-1">
                            R$ {Number(imovel.preco).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      {/* Info Box */}
                      <div className="p-5 space-y-4">
                        {/* Título */}
                        <div>
                          <h3 className="font-black text-lg text-slate-800 line-clamp-2 mb-1 group-hover:text-indigo-600 transition">{imovel.titulo}</h3>
                          <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
                            <MapPin size={16} className="text-indigo-500 flex-shrink-0" />
                            <span className="line-clamp-1">{imovel.localizacao}</span>
                          </div>
                        </div>

                        {/* Info Row */}
                        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-2">
                            <Users size={18} className="text-blue-600 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-slate-500 font-semibold">Anunciante</p>
                              <p className="text-sm font-black text-slate-800">{imovel.nomeAnunciante || imovel.contato || 'Não informado'}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${imovel.anuncianteTipo === 'vendedor' ? 'bg-emerald-600' : 'bg-orange-600'}`}>
                            {imovel.anuncianteTipo === 'vendedor' ? '🏷️ Venda' : '🔑 Aluguel'}
                          </span>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex gap-2 pt-2">
                          <a 
                            href={`https://wa.me/${imovel.contato}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-3 rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm active:scale-95"
                          >
                            <MessageCircle size={18} />
                            WhatsApp
                          </a>
                          <button className="flex-1 bg-slate-100 text-slate-700 p-3 rounded-xl font-bold hover:bg-slate-200 transition text-sm">
                            <Eye size={18} className="mx-auto" />
                          </button>
                        </div>

                        {/* Botões de Editar/Deletar - Sempre Visível para imóveis do usuário */}
                        {imoveisDoUsuario.find(i => i._id === imovel._id) && (
                          <div className="flex gap-2 pt-3 border-t border-slate-200">
                            <button 
                              onClick={() => {
                                setSelecionadoParaEdicao(imovel._id);
                                setNovoImovel({
                                  titulo: imovel.titulo,
                                  preco: imovel.preco,
                                  localizacao: imovel.localizacao,
                                  contato: imovel.contato,
                                  tipo: imovel.tipo,
                                  anuncianteTipo: imovel.anuncianteTipo,
                                  nomeAnunciante: imovel.nomeAnunciante,
                                  imagemUrl: imovel.imagemUrl
                                });
                                setFotoArquivo(null);
                                setModo("anunciar");
                              }}
                              className="flex-1 bg-blue-500 text-white p-2 rounded-lg font-bold hover:bg-blue-600 text-xs shadow-md"
                            >
                              ✏️ Editar
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm("Deseja realmente apagar este anúncio permanentemente?")) {
                                  axios.delete(`http://localhost:5000/imoveis/${imovel._id}`).then(() => {
                                    const imoveisUsuario = JSON.parse(localStorage.getItem('imoveisUsuario') || '[]');
                                    const novo = imoveisUsuario.filter(id => id !== imovel._id);
                                    localStorage.setItem('imoveisUsuario', JSON.stringify(novo));
                                    carregarImoveis();
                                    alert("Imóvel deletado com sucesso!");
                                  }).catch(err => {
                                    alert("Erro ao deletar imóvel");
                                    console.error(err);
                                  });
                                }
                              }}
                              className="flex-1 bg-red-100 text-red-600 p-2 rounded-lg font-bold hover:bg-red-200 text-xs shadow-md"
                            >
                              🗑️ Deletar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="col-span-full text-center py-20 bg-gradient-to-b from-slate-50 to-slate-100 rounded-3xl">
                  <div className="text-6xl mb-4">🏠</div>
                  <p className="text-2xl font-black text-slate-400 mb-2">Nenhum anúncio encontrado</p>
                  <p className="text-slate-500 font-medium max-w-md mx-auto">Tente expandir sua busca ou volte em breve para novas listagens.</p>
                </div>
              )}
            </section>
          </>
        ) : (
          // ===== MODO ANUNCIAR - Dashboard + Formulário ====
          <>
            {!mostraFormulario ? (
              // Dashboard de Imóveis do Usuário
              <div className="space-y-8">
                {imoveisDoUsuario.length > 0 ? (
                  <>
                    {/* Header Dashboard */}
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-4xl md:text-5xl font-black mb-2">Meus Imóveis</h2>
                          <p className="text-emerald-100 text-lg font-medium">Gerencie seus anúncios em um só lugar</p>
                        </div>
                        <Building2 size={80} className="opacity-20" />
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/20 backdrop-blur rounded-2xl p-6 border border-white/30">
                          <p className="text-emerald-100 text-sm font-bold mb-2">TOTAL DE ANÚNCIOS</p>
                          <p className="text-5xl font-black">{imoveisDoUsuario.length}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur rounded-2xl p-6 border border-white/30">
                          <p className="text-emerald-100 text-sm font-bold mb-2">🏷️ EM VENDA</p>
                          <p className="text-5xl font-black">{imoveisDoUsuario.filter(i => i.tipo === 'venda').length}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur rounded-2xl p-6 border border-white/30">
                          <p className="text-emerald-100 text-sm font-bold mb-2">🔑 PARA ALUGUEL</p>
                          <p className="text-5xl font-black">{imoveisDoUsuario.filter(i => i.tipo === 'aluguel').length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Botão Criar Novo */}
                    <div className="flex justify-center mb-8">
                      <button
                        onClick={() => {
                          setMostraFormulario(true);
                          setSelecionadoParaEdicao(null);
                          setNovoImovel({ titulo: "", preco: "", localizacao: "", contato: "", tipo: "venda", anuncianteTipo: "vendedor", nomeAnunciante: "", imagemUrl: "" });
                          setFotoArquivo(null);
                        }}
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 transform hover:scale-105"
                      >
                        <PlusCircle size={28} />
                        Publicar Novo Imóvel
                      </button>
                    </div>

                    {/* Grid de Meus Imóveis - Venda */}
                    {imoveisDoUsuario.filter(i => i.tipo === 'venda').length > 0 && (
                      <div>
                        <h3 className="text-3xl font-black mb-6 text-slate-800 flex items-center gap-3">
                          <span className="bg-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg">🏷️</span>
                          Imóveis à Venda
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {imoveisDoUsuario.filter(i => i.tipo === 'venda').map(imovel => (
                            <div key={imovel._id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-emerald-100 group hover:-translate-y-2">
                              <div className="relative h-40 bg-slate-200 overflow-hidden">
                                <img src={imovel.imagemUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={imovel.titulo} />
                                <div className="absolute top-3 right-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-black">VENDA</div>
                              </div>
                              <div className="p-4 space-y-3">
                                <h4 className="font-black text-slate-800 line-clamp-2">{imovel.titulo}</h4>
                                <p className="text-sm text-slate-600 flex items-center gap-1"><MapPin size={14} /> {imovel.localizacao}</p>
                                <p className="text-2xl font-black text-emerald-600">R$ {Number(imovel.preco).toLocaleString('pt-BR')}</p>
                                <div className="flex gap-2 pt-2">
                                  <button 
                                    onClick={() => {
                                      setMostraFormulario(true);
                                      setSelecionadoParaEdicao(imovel._id);
                                      setNovoImovel({
                                        titulo: imovel.titulo,
                                        preco: imovel.preco,
                                        localizacao: imovel.localizacao,
                                        contato: imovel.contato,
                                        tipo: imovel.tipo,
                                        anuncianteTipo: imovel.anuncianteTipo,
                                        nomeAnunciante: imovel.nomeAnunciante,
                                        imagemUrl: imovel.imagemUrl
                                      });
                                      setFotoArquivo(null);
                                    }}
                                    className="flex-1 bg-blue-500 text-white p-2 rounded-lg font-bold hover:bg-blue-600 text-xs"
                                  >
                                    ✏️ Editar
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (window.confirm("Deseja apagar este anúncio?")) {
                                        axios.delete(`${API_BASE}/imoveis/${imovel._id}`);
                                        const imoveisUsuario = JSON.parse(localStorage.getItem('imoveisUsuario') || '[]');
                                        const novo = imoveisUsuario.filter(id => id !== imovel._id);
                                        localStorage.setItem('imoveisUsuario', JSON.stringify(novo));
                                        carregarImoveis();
                                      }
                                    }}
                                    className="flex-1 bg-red-100 text-red-600 p-2 rounded-lg font-bold hover:bg-red-200 text-xs"
                                  >
                                    🗑️ Deletar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grid de Meus Imóveis - Aluguel */}
                    {imoveisDoUsuario.filter(i => i.tipo === 'aluguel').length > 0 && (
                      <div>
                        <h3 className="text-3xl font-black mb-6 text-slate-800 flex items-center gap-3">
                          <span className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg">🔑</span>
                          Imóveis para Aluguel
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {imoveisDoUsuario.filter(i => i.tipo === 'aluguel').map(imovel => (
                            <div key={imovel._id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-orange-100 group hover:-translate-y-2">
                              <div className="relative h-40 bg-slate-200 overflow-hidden">
                                <img src={imovel.imagemUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={imovel.titulo} />
                                <div className="absolute top-3 right-3 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-black">ALUGUEL</div>
                              </div>
                              <div className="p-4 space-y-3">
                                <h4 className="font-black text-slate-800 line-clamp-2">{imovel.titulo}</h4>
                                <p className="text-sm text-slate-600 flex items-center gap-1"><MapPin size={14} /> {imovel.localizacao}</p>
                                <p className="text-2xl font-black text-orange-600">R$ {Number(imovel.preco).toLocaleString('pt-BR')}</p>
                                <div className="flex gap-2 pt-2">
                                  <button 
                                    onClick={() => {
                                      setMostraFormulario(true);
                                      setSelecionadoParaEdicao(imovel._id);
                                      setNovoImovel({
                                        titulo: imovel.titulo,
                                        preco: imovel.preco,
                                        localizacao: imovel.localizacao,
                                        contato: imovel.contato,
                                        tipo: imovel.tipo,
                                        anuncianteTipo: imovel.anuncianteTipo,
                                        nomeAnunciante: imovel.nomeAnunciante,
                                        imagemUrl: imovel.imagemUrl
                                      });
                                      setFotoArquivo(null);
                                    }}
                                    className="flex-1 bg-blue-500 text-white p-2 rounded-lg font-bold hover:bg-blue-600 text-xs"
                                  >
                                    ✏️ Editar
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (window.confirm("Deseja apagar este anúncio?")) {
                                        axios.delete(`http://localhost:5000/imoveis/${imovel._id}`);
                                        const imoveisUsuario = JSON.parse(localStorage.getItem('imoveisUsuario') || '[]');
                                        const novo = imoveisUsuario.filter(id => id !== imovel._id);
                                        localStorage.setItem('imoveisUsuario', JSON.stringify(novo));
                                        carregarImoveis();
                                      }
                                    }}
                                    className="flex-1 bg-red-100 text-red-600 p-2 rounded-lg font-bold hover:bg-red-200 text-xs"
                                  >
                                    🗑️ Deletar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Painel de Boas-vindas quando não há imóveis
                  <div className="flex flex-col items-center justify-center py-20 space-y-8">
                    <div className="text-center space-y-4">
                      <div className="text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text">
                        <Building2 size={120} className="mx-auto text-blue-600" />
                      </div>
                      <h2 className="text-4xl font-black text-slate-800">Comece a Anunciar Agora!</h2>
                      <p className="text-xl text-slate-600 max-w-lg">Publique seus imóveis e alcance milhares de potenciais clientes. É rápido, fácil e completamente grátis!</p>
                    </div>

                    {/* Benefícios */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100 text-center">
                        <div className="text-5xl mb-3">⚡</div>
                        <h3 className="font-black text-lg mb-2">Rápido</h3>
                        <p className="text-sm text-slate-600">Publique em menos de 3 minutos</p>
                      </div>
                      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100 text-center">
                        <div className="text-5xl mb-3">📱</div>
                        <h3 className="font-black text-lg mb-2">Fácil</h3>
                        <p className="text-sm text-slate-600">Interface intuitiva e amigável</p>
                      </div>
                      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100 text-center">
                        <div className="text-5xl mb-3">🎯</div>
                        <h3 className="font-black text-lg mb-2">Eficaz</h3>
                        <p className="text-sm text-slate-600">Chegue a milhares de interessados</p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => {
                        setMostraFormulario(true);
                        setSelecionadoParaEdicao(null);
                        setNovoImovel({ titulo: "", preco: "", localizacao: "", contato: "", tipo: "venda", anuncianteTipo: "vendedor", nomeAnunciante: "", imagemUrl: "" });
                        setFotoArquivo(null);
                      }}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 flex items-center gap-3"
                    >
                      <PlusCircle size={32} />
                      Publicar Meu Primeiro Imóvel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Formulário de Cadastro/Edição
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Esquerda - Info */}
                <div className="lg:col-span-1">
                  <div className="sticky top-28 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl p-8 border-2 border-emerald-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b-3 border-emerald-200">
                      <div className="bg-emerald-600 p-3 rounded-xl">
                        <CheckCircle size={28} className="text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-emerald-700">{selecionadoParaEdicao ? 'Editar Anúncio' : 'Novo Anúncio'}</h3>
                    </div>

                    {/* Steps */}
                    <div className="space-y-4">
                      {[
                        { num: 1, title: "Preencha os dados", desc: "Informações básicas do imóvel" },
                        { num: 2, title: "Envie a foto", desc: "Destacar a propriedade" },
                        { num: 3, title: "Publique agora", desc: "Fique visível para milhares" }
                  ].map(step => (
                    <div key={step.num} className="flex gap-4">
                      <div className="bg-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-black flex-shrink-0 shadow-lg">
                        {step.num}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{step.title}</p>
                        <p className="text-xs text-slate-600 font-medium">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Benefits */}
                <div className="mt-8 pt-8 border-t-2 border-emerald-200 space-y-3">
                      <p className="font-black text-slate-800 text-sm mb-4">🎯 Dicas</p>
                      {["Use descrição claros", "Fotos de qualidade", "Preço competitivo", "Contato sempre ativo"].map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                          {benefit}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMostraFormulario(false);
                        setSelecionadoParaEdicao(null);
                        setNovoImovel({ titulo: "", preco: "", localizacao: "", contato: "", tipo: "venda", anuncianteTipo: "vendedor", nomeAnunciante: "", imagemUrl: "" });
                        setFotoArquivo(null);
                      }}
                      className="w-full mt-6 p-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                    >
                      ← Voltar
                    </button>
                  </div>
                </div>

                {/* Coluna Direita - Formulário */}
                <form onSubmit={cadastrar} className="lg:col-span-2 bg-white rounded-3xl shadow-2xl border-2 border-slate-200 p-8 space-y-6">
                  <h2 className="text-4xl font-black text-slate-800 mb-8">Preencha os detalhes</h2>

                  {/* Título */}
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">1</span> 
                      Título Do Imóvel
                    </label>
                    <input 
                      required 
                      placeholder="Ex: Casa moderna com piscina e garagem..." 
                      className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-medium placeholder-slate-400 text-base" 
                      value={novoImovel.titulo} 
                      onChange={e => setNovoImovel({...novoImovel, titulo: e.target.value})} 
                    />
                    <p className="text-xs text-slate-500 font-medium">Descreva o imóvel de forma atraente</p>
                  </div>

                  {/* Tipo + Anunciante em Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                        Tipo
                      </label>
                      <select 
                        required 
                        className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-800 font-bold" 
                        value={novoImovel.tipo} 
                        onChange={e => setNovoImovel({...novoImovel, tipo: e.target.value})}
                      >
                        <option value="venda">🏷️ À Venda</option>
                        <option value="aluguel">🔑 Para Aluguel</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
                        Anunciante
                      </label>
                      <select 
                        required 
                        className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-slate-800 font-bold" 
                        value={novoImovel.anuncianteTipo} 
                        onChange={e => setNovoImovel({...novoImovel, anuncianteTipo: e.target.value})}
                      >
                        <option value="vendedor">👤 Vendedor</option>
                        <option value="locador">🏢 Locador</option>
                      </select>
                    </div>
                  </div>

                  {/* Nome do Anunciante */}
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs">4</span>
                      Nome/Usuário
                    </label>
                    <input 
                      required 
                      placeholder="Ex: Joaquim Silva" 
                      className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all text-slate-800 font-medium placeholder-slate-400" 
                      value={novoImovel.nomeAnunciante} 
                      onChange={e => setNovoImovel({...novoImovel, nomeAnunciante: e.target.value})} 
                    />
                    <p className="text-xs text-slate-500 font-medium">Como você quer ser chamado</p>
                  </div>

                  {/* Preço */}
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <DollarSign size={18} className="text-green-600" />
                      Preço (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                      <input 
                        required 
                        type="number" 
                        placeholder="450000" 
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all text-slate-800 font-bold" 
                        value={novoImovel.preco} 
                        onChange={e => setNovoImovel({...novoImovel, preco: e.target.value})} 
                      />
                    </div>
                  </div>

                  {/* Localização */}
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <MapPin size={18} className="text-orange-600" />
                      Localização
                    </label>
                    <input 
                      required 
                      placeholder="Ex: São Paulo - Vila Mariana" 
                      className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-slate-800 font-medium placeholder-slate-400" 
                      value={novoImovel.localizacao} 
                      onChange={e => setNovoImovel({...novoImovel, localizacao: e.target.value})} 
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <MessageCircle size={18} className="text-emerald-600" />
                      WhatsApp para Contato
                    </label>
                    <input 
                      required 
                      placeholder="11 98888-7777 (sem espaços)" 
                      className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-800 font-medium placeholder-slate-400" 
                      value={novoImovel.contato} 
                      onChange={e => setNovoImovel({...novoImovel, contato: e.target.value})} 
                    />
                  </div>

                  {/* Upload de Foto - Moderno */}
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Camera size={18} className="text-pink-600" />
                      Foto Principal do Imóvel
                    </label>
                    <div className="relative w-full h-80 border-3 border-dashed border-indigo-300 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50 hover:from-indigo-100 hover:to-blue-100 transition-all cursor-pointer overflow-hidden group shadow-inner">
                      {fotoArquivo ? (
                        <>
                          <img src={URL.createObjectURL(fotoArquivo)} className="w-full h-full object-cover" alt="preview" />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition flex items-center justify-center">
                            <p className="text-white font-black text-center">Clique para trocar a foto</p>
                          </div>
                        </>
                      ) : novoImovel.imagemUrl ? (
                        <>
                          <img src={novoImovel.imagemUrl} className="w-full h-full object-cover" alt="preview" />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition flex items-center justify-center">
                            <p className="text-white font-black text-center">Clique para trocar a foto</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-center">
                            <div className="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                              <Camera size={32} />
                            </div>
                            <p className="text-lg font-black text-indigo-700 mb-1">Clique para enviar foto</p>
                            <p className="text-sm text-indigo-500 font-medium">JPG, PNG ou WebP (máx 5MB)</p>
                          </div>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={e => setFotoArquivo(e.target.files[0])} 
                      />
                    </div>
                  </div>

                  {/* Botão Submit */}
                  <div className="flex gap-3 pt-4">
                    <button 
                      disabled={carregando}
                      className={`flex-1 p-4 rounded-xl font-black text-white shadow-xl transition-all flex justify-center items-center gap-3 text-lg uppercase tracking-wider ${
                        carregando 
                          ? 'bg-slate-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 active:scale-95 hover:shadow-2xl'
                      }`}
                    >
                      {carregando ? <Loader2 className="animate-spin" size={24} /> : (selecionadoParaEdicao ? "💾 Salvar Alterações" : "✨ Publicar Agora")}
                    </button>
                    {selecionadoParaEdicao && (
                      <button 
                        type="button"
                        onClick={() => {
                          setSelecionadoParaEdicao(null);
                          setNovoImovel({ titulo: "", preco: "", localizacao: "", contato: "", tipo: "venda", anuncianteTipo: "vendedor", nomeAnunciante: "", imagemUrl: "" });
                          setFotoArquivo(null);
                          setMostraFormulario(false);
                        }}
                        className="px-6 p-4 rounded-xl font-black text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                      >
                        ✖ Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;