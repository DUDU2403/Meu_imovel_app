import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Users, DollarSign, Building2, Award, ShieldCheck, ShieldOff,
  Trash2, Search, ChevronDown, TrendingUp, UserCheck, Home, BarChart3
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:10000' : 'https://meu-imovel-api.onrender.com');

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtData = (d) => new Date(d).toLocaleDateString('pt-BR');

const PERFIL_LABEL = { corretor: 'Corretor', proprietario: 'Proprietário', comprador: 'Comprador' };
const PERFIL_COLOR = { corretor: 'bg-indigo-100 text-indigo-700', proprietario: 'bg-amber-100 text-amber-700', comprador: 'bg-emerald-100 text-emerald-700' };

export default function AdminPanel({ token }) {
  const [stats, setStats] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('todos');
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('visao-geral');

  const headers = { 'x-auth-token': token };

  const carregar = async () => {
    setCarregando(true);
    try {
      const [statsRes, usuariosRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, { headers }),
        axios.get(`${API_URL}/admin/usuarios`, { headers }),
      ]);
      setStats(statsRes.data);
      setUsuarios(usuariosRes.data);
    } catch {
      alert('Erro ao carregar dados do painel admin.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const toggleAssinatura = async (id, ativa) => {
    try {
      await axios.put(`${API_URL}/admin/usuarios/${id}/assinatura`, { ativa: !ativa }, { headers });
      carregar();
    } catch {
      alert('Erro ao atualizar assinatura.');
    }
  };

  const removerUsuario = async (id, nome) => {
    if (!window.confirm(`Remover o usuário "${nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await axios.delete(`${API_URL}/admin/usuarios/${id}`, { headers });
      carregar();
    } catch {
      alert('Erro ao remover usuário.');
    }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const matchBusca = !busca ||
      u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      u.email?.toLowerCase().includes(busca.toLowerCase()) ||
      u.cpf?.includes(busca) ||
      u.telefone?.includes(busca);
    const matchPerfil = filtroPerfil === 'todos' || u.tipoPerfil === filtroPerfil;
    return matchBusca && matchPerfil;
  });

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = stats ? [
    { label: 'Total de usuários', value: stats.totalUsuarios, icon: Users, color: 'indigo' },
    { label: 'Assinantes Match Pro', value: stats.totalAssinantes, icon: Award, color: 'emerald' },
    { label: 'Receita mensal est.', value: fmt(stats.receitaMensal), icon: DollarSign, color: 'amber' },
    { label: 'Imóveis cadastrados', value: stats.totalImoveis, icon: Building2, color: 'slate' },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Painel Administrativo</h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie usuários e acompanhe métricas da plataforma</p>
        </div>
        <button onClick={carregar} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
          Atualizar
        </button>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: 'visao-geral', label: 'Visão Geral', icon: BarChart3 },
          { id: 'usuarios', label: 'Usuários', icon: Users },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setAbaAtiva(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${abaAtiva === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* VISÃO GERAL */}
      {abaAtiva === 'visao-geral' && stats && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon, color }) => {
              const colors = {
                indigo: 'bg-indigo-50 text-indigo-600',
                emerald: 'bg-emerald-50 text-emerald-600',
                amber: 'bg-amber-50 text-amber-600',
                slate: 'bg-slate-100 text-slate-600'
              };
              return (
                <div key={label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
                    <Icon size={22} />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
                </div>
              );
            })}
          </div>

          {/* Distribuição de perfis */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-5">Distribuição por perfil</h3>
            <div className="space-y-4">
              {[
                { label: 'Corretores', value: stats.totalCorretores, color: 'bg-indigo-500', total: stats.totalUsuarios },
                { label: 'Proprietários', value: stats.totalProprietarios, color: 'bg-amber-500', total: stats.totalUsuarios },
                { label: 'Compradores', value: stats.totalCompradores, color: 'bg-emerald-500', total: stats.totalUsuarios },
              ].map(({ label, value, color, total }) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700">{label}</span>
                      <span className="font-bold text-slate-900">{value} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Taxa de conversão */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Taxa de conversão</p>
              <p className="text-3xl font-black text-slate-900">
                {stats.totalUsuarios > 0 ? Math.round((stats.totalAssinantes / stats.totalUsuarios) * 100) : 0}%
              </p>
              <p className="text-sm text-slate-500 mt-1">Usuários que assinaram o Match Pro</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Média de imóveis por usuário</p>
              <p className="text-3xl font-black text-slate-900">
                {stats.totalUsuarios > 0 ? (stats.totalImoveis / stats.totalUsuarios).toFixed(1) : 0}
              </p>
              <p className="text-sm text-slate-500 mt-1">Anúncios por cadastro ativo</p>
            </div>
          </div>
        </div>
      )}

      {/* USUÁRIOS */}
      {abaAtiva === 'usuarios' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Buscar por nome, e-mail, CPF ou telefone..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all"
              />
            </div>
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
              {['todos', 'corretor', 'proprietario', 'comprador'].map(p => (
                <button key={p} onClick={() => setFiltroPerfil(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filtroPerfil === p ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                  {p === 'todos' ? 'Todos' : PERFIL_LABEL[p]}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-slate-500">
            <span className="font-bold text-slate-900">{usuariosFiltrados.length}</span> usuários encontrados
          </p>

          {/* Tabela */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Usuário</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Contato</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Perfil</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Cadastro</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Match Pro</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((u, i) => (
                    <tr key={u._id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                            {u.nome[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{u.nome}</p>
                            <p className="text-xs text-slate-400">{u.cpf}</p>
                            {u.creci && <p className="text-xs text-indigo-500 font-medium">CRECI: {u.creci}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700">{u.email}</p>
                        <p className="text-xs text-slate-400">{u.telefone}</p>
                        {u.cidade && <p className="text-xs text-slate-400">{u.cidade}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${PERFIL_COLOR[u.tipoPerfil] || 'bg-slate-100 text-slate-600'}`}>
                          {PERFIL_LABEL[u.tipoPerfil] || 'N/A'}
                        </span>
                        {u.imobiliaria && <p className="text-xs text-slate-400 mt-1">{u.imobiliaria}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700">{fmtData(u.createdAt)}</p>
                        {u.experiencia && <p className="text-xs text-slate-400">{u.experiencia} anos exp.</p>}
                      </td>
                      <td className="px-4 py-4">
                        {u.isSubscriptionActive ? (
                          <div>
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                              <ShieldCheck size={13} /> Ativo
                            </span>
                            {u.subscriptionExpires && (
                              <p className="text-[10px] text-slate-400 mt-0.5">até {fmtData(u.subscriptionExpires)}</p>
                            )}
                          </div>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                            <ShieldOff size={13} /> Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleAssinatura(u._id, u.isSubscriptionActive)}
                            title={u.isSubscriptionActive ? 'Desativar assinatura' : 'Ativar assinatura'}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${u.isSubscriptionActive ? 'bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:text-red-500' : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}>
                            {u.isSubscriptionActive ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
                          </button>
                          <button
                            onClick={() => removerUsuario(u._id, u.nome)}
                            title="Remover usuário"
                            className="w-8 h-8 bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-lg flex items-center justify-center transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usuariosFiltrados.length === 0 && (
                <div className="text-center py-12">
                  <Users size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}