// ===== SUPABASE CONFIG =====
const SUPABASE_URL = 'https://vzkzovpkzqoupbgbwgtu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CaAYIgSEafPrrlRFpUFR3g_TMln7Ftf';
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== CREDENCIAIS =====
const UTILIZADORES = [
  { user: 'Augusto Tembe', pass: '1234567891011', nivel: 'admin' },
  { user: 'atendente',     pass: 'escolar2026',     nivel: 'atendente' }
];

// ===== ESTADO GLOBAL =====
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const LOCAIS = ['Maxaquene', 'Chamanculo', 'Jorge Dimitrov'];
const COR_LOCAIS = {
  'Maxaquene':     '#2196f3',
  'Chamanculo':    '#17a34a',
  'Jorge Dimitrov':'#b45309'
};

let alunos      = [];
let contadorId  = 1;
let nivelActual = '';

// ===== LOGIN =====
function fazerLogin() {
  const user   = document.getElementById('login-user').value.trim();
  const pass   = document.getElementById('login-pass').value;
  const erroEl = document.getElementById('login-erro');

  const conta = UTILIZADORES.find(u => u.user === user && u.pass === pass);

  if (conta) {
    nivelActual = conta.nivel;
    erroEl.style.display = 'none';
    document.getElementById('login-screen').style.display = 'none';
    const app = document.getElementById('app');
    app.style.display   = 'flex';
    app.style.minHeight = '100vh';
    aplicarPermissoes();
    iniciarApp();
  } else {
    erroEl.style.display = 'block';
    document.getElementById('login-pass').value = '';
  }
}

function fazerLogout() {
  if (!confirm('Tem a certeza que deseja sair?')) return;
  nivelActual = '';
  document.getElementById('app').style.display          = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
}

// ===== PERMISSÕES =====
function isAdmin() { return nivelActual === 'admin'; }

function aplicarPermissoes() {
  document.getElementById('admin-nome-sidebar').textContent =
    isAdmin() ? 'Augusto Tembe' : 'Atendente';
  document.getElementById('admin-nivel-sidebar').textContent =
    isAdmin() ? 'Administrador' : 'Atendente';
  document.getElementById('nav-relatorio').style.display =
    isAdmin() ? 'flex' : 'none';
  document.getElementById('card-receita').style.display =
    isAdmin() ? 'flex' : 'none';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-user').focus();
});

async function iniciarApp() {
  document.getElementById('date-now').textContent =
    formatarDataHora(new Date());
  document.getElementById('inp-data').value =
    new Date().toISOString().slice(0, 10);

  mostrarToast('⏳ A carregar dados...', 'success');
  await carregarAlunos();
  atualizarDashboard();
  renderizarTabela();
  renderizarMensalidades();
  if (isAdmin()) renderizarRelatorio();
}

// ===== CARREGAR ALUNOS DO SUPABASE =====
async function carregarAlunos() {
  try {
    const { data, error } = await db.from('alunos').select('*').order('id', { ascending: true });
    if (error) throw error;

    alunos = data.map(a => ({
      ...a,
      mesesPagos: JSON.parse(a.meses_pagos || '[]'),
      valorInscricao: a.valor_inscricao,
    }));

    // Calcular próximo ID
    if (alunos.length > 0) {
      contadorId = Math.max(...alunos.map(a => {
        const partes = a.id_texto ? a.id_texto.split('-') : ['0'];
        return parseInt(partes[partes.length - 1]) || 0;
      })) + 1;
    }
  } catch (err) {
    console.error('Erro ao carregar alunos:', err);
    mostrarToast('❌ Erro ao carregar dados!', 'error');
  }
}

// ===== NAVEGAÇÃO =====
function showPage(id) {
  if (id === 'relatorio' && !isAdmin()) {
    mostrarToast('🔒 Sem permissão para ver relatórios.', 'error');
    return;
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => {
    if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(id))
      b.classList.add('active');
  });
  if (id === 'estudantes')   renderizarTabela();
  if (id === 'mensalidades') renderizarMensalidades();
  if (id === 'relatorio')    renderizarRelatorio();
  if (id === 'dashboard')    atualizarDashboard();
}

// ===== GERAR ID =====
function gerarId() {
  const ano = new Date().getFullYear();
  const num = String(contadorId).padStart(4, '0');
  return `TBE-${ano}-${num}`;
}

// ===== REGISTAR ALUNO =====
async function registarAluno() {
  const nome           = document.getElementById('inp-nome').value.trim();
  const local          = document.getElementById('inp-local').value;
  const curso          = document.getElementById('inp-curso').value;
  const tel            = document.getElementById('inp-tel').value.trim();
  const valorInscricao = parseFloat(document.getElementById('inp-valor-inscricao').value);
  const mensalidade    = parseFloat(document.getElementById('inp-mensalidade').value);
  const data           = document.getElementById('inp-data').value;
  const obs            = document.getElementById('inp-obs').value.trim();

  if (!nome || !local || !curso || !valorInscricao || !mensalidade) {
    mostrarToast('⚠️ Preencha todos os campos obrigatórios!', 'error');
    return;
  }

  const agora = new Date();
  const idTexto = gerarId();
  const idNum   = Date.now();

  const novoAluno = {
    id:             idNum,
    id_texto:       idTexto,
    nome,
    local,
    curso,
    tel,
    valor_inscricao: valorInscricao,
    mensalidade,
    data:           data || agora.toISOString().slice(0, 10),
    hora:           agora.toTimeString().slice(0, 5),
    data_hora:      agora.toISOString(),
    obs,
    meses_pagos:    '[]',
    estado:         'pendente'
  };

  try {
    const { error } = await db.from('alunos').insert([novoAluno]);
    if (error) throw error;

    // Adicionar ao array local
    alunos.push({
      ...novoAluno,
      valorInscricao,
      mesesPagos: []
    });
    contadorId++;

    limparForm();
    atualizarDashboard();
    renderizarTabela();
    renderizarMensalidades();
    mostrarToast('✅ Inscrição registada com sucesso!');
    gerarRecibo({ ...novoAluno, valorInscricao, mesesPagos: [], idTexto });
  } catch (err) {
    console.error('Erro ao registar aluno:', err);
    mostrarToast('❌ Erro ao registar! Tente novamente.', 'error');
  }
}

// ===== RECIBO =====
function gerarRecibo(aluno) {
  const idTexto = aluno.idTexto || aluno.id_texto;
  const valInsc = aluno.valorInscricao || aluno.valor_inscricao;
  const html = `
    <div class="recibo-titulo">🎓 Reforço Escolar — Tembe</div>
    <div class="recibo-sub">Recibo de Inscrição · ${formatarDataHora(new Date(aluno.data_hora || aluno.dataHora))}</div>
    <div class="recibo-linha"><span>ID:</span><strong>${idTexto}</strong></div>
    <div class="recibo-linha"><span>Nome:</span><strong>${aluno.nome}</strong></div>
    <div class="recibo-linha"><span>Local:</span><strong>${aluno.local}</strong></div>
    <div class="recibo-linha"><span>Curso / Classe:</span><strong>${aluno.curso}</strong></div>
    <div class="recibo-linha"><span>Telefone:</span><strong>${aluno.tel || '—'}</strong></div>
    <div class="recibo-linha"><span>Data de Inscrição:</span><strong>${aluno.data}</strong></div>
    <div class="recibo-linha"><span>Hora:</span><strong>${aluno.hora}</strong></div>
    <div class="recibo-linha"><span>Valor de Inscrição:</span><strong>${formatarMt(valInsc)}</strong></div>
    <div class="recibo-linha"><span>Mensalidade Mensal:</span><strong>${formatarMt(aluno.mensalidade)}</strong></div>
    ${aluno.obs ? `<div class="recibo-linha"><span>Obs:</span><strong>${aluno.obs}</strong></div>` : ''}
    <div class="recibo-total"><span>TOTAL PAGO HOJE</span><span>${formatarMt(valInsc)}</span></div>
  `;
  document.getElementById('recibo-conteudo').innerHTML = html;
  document.getElementById('modal-recibo').classList.add('open');
}

function fecharModal() {
  document.getElementById('modal-recibo').classList.remove('open');
}

// ===== LIMPAR FORM =====
function limparForm() {
  ['inp-nome','inp-tel','inp-valor-inscricao','inp-mensalidade','inp-obs']
    .forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('inp-curso').value = '';
  document.getElementById('inp-local').value = '';
  document.getElementById('inp-data').value  = new Date().toISOString().slice(0, 10);
}

// ===== DASHBOARD =====
function atualizarDashboard() {
  const totalPagos     = alunos.reduce((acc, a) => acc + a.mesesPagos.length, 0);
  const totalPendentes = alunos.filter(a => a.mesesPagos.length === 0).length;
  const receita        = alunos.reduce((acc, a) =>
    acc + (a.valorInscricao || a.valor_inscricao) + (a.mesesPagos.length * a.mensalidade), 0);

  document.getElementById('total-alunos').textContent    = alunos.length;
  document.getElementById('total-pagos').textContent     = totalPagos;
  document.getElementById('total-pendentes').textContent = totalPendentes;
  document.getElementById('total-receita').textContent   = formatarMt(receita);

  const dashLocais = document.getElementById('dash-locais');
  dashLocais.innerHTML = LOCAIS.map(local => {
    const lista        = alunos.filter(a => a.local === local);
    const receitaLocal = isAdmin()
      ? lista.reduce((acc, a) =>
          acc + (a.valorInscricao || a.valor_inscricao) + (a.mesesPagos.length * a.mensalidade), 0)
      : null;
    return `
      <div class="local-card" style="border-left-color:${COR_LOCAIS[local]}">
        <h3>📍 ${local}</h3>
        <div class="local-num" style="color:${COR_LOCAIS[local]}">${lista.length}</div>
        <div class="local-sub">estudantes${isAdmin() ? ' · ' + formatarMt(receitaLocal) : ''}</div>
      </div>
    `;
  }).join('');
}

// ===== TABELA ESTUDANTES =====
function renderizarTabela() {
  const filtroLocal = document.getElementById('filtro-local')
    ? document.getElementById('filtro-local').value : '';
  const busca = (document.getElementById('busca-matricula')
    ? document.getElementById('busca-matricula').value : '').toLowerCase();

  let lista = alunos;
  if (filtroLocal) lista = lista.filter(a => a.local === filtroLocal);
  if (busca)       lista = lista.filter(a =>
    a.nome.toLowerCase().includes(busca) ||
    (a.id_texto || a.idTexto || '').toLowerCase().includes(busca));

  const tbody = document.getElementById('tbody-matriculas');
  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;
      color:var(--text-muted);padding:36px">Nenhum estudante encontrado</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(a => {
    const idTexto = a.id_texto || a.idTexto;
    const valInsc = a.valor_inscricao || a.valorInscricao;
    const btnEliminar = isAdmin()
      ? `<button class="btn-icon danger" onclick="eliminarAluno(${a.id})" title="Eliminar">🗑️</button>`
      : '';
    return `
      <tr>
        <td><code style="color:var(--accent);font-size:0.8rem">${idTexto}</code></td>
        <td><strong>${a.nome}</strong></td>
        <td>${a.curso}</td>
        <td><span style="color:${COR_LOCAIS[a.local]||'#666'};font-weight:600">${a.local}</span></td>
        <td>${a.tel || '—'}</td>
        <td>${formatarMt(valInsc)}</td>
        <td>${formatarMt(a.mensalidade)}</td>
        <td style="font-size:0.8rem;color:var(--text-muted)">${a.data}<br>${a.hora}</td>
        <td>
          <button class="btn-icon" onclick="gerarRecibo(alunos.find(x=>x.id==${a.id}))"
            title="Ver Recibo">🧾</button>
          ${btnEliminar}
        </td>
      </tr>
    `;
  }).join('');
}

function filtrarTabela() { renderizarTabela(); }

async function eliminarAluno(id) {
  if (!isAdmin()) {
    mostrarToast('🔒 Sem permissão para eliminar.', 'error');
    return;
  }
  if (!confirm('Tem a certeza que deseja eliminar este estudante?')) return;

  try {
    const { error } = await db.from('alunos').delete().eq('id', id);
    if (error) throw error;

    alunos = alunos.filter(a => a.id !== id);
    renderizarTabela();
    atualizarDashboard();
    renderizarMensalidades();
    mostrarToast('🗑️ Estudante removido');
  } catch (err) {
    console.error('Erro ao eliminar:', err);
    mostrarToast('❌ Erro ao eliminar!', 'error');
  }
}

// ===== MENSALIDADES =====
function renderizarMensalidades() {
  const filtroLocal = document.getElementById('filtro-local-mens')
    ? document.getElementById('filtro-local-mens').value : '';
  const cont = document.getElementById('lista-mensalidades');
  let lista  = filtroLocal ? alunos.filter(a => a.local === filtroLocal) : alunos;

  if (lista.length === 0) {
    cont.innerHTML = `<div class="empty-state">
      <div class="emoji">💸</div><p>Nenhum estudante inscrito ainda.</p></div>`;
    return;
  }

  cont.innerHTML = lista.map(a => {
    const valInsc = a.valor_inscricao || a.valorInscricao;
    const mesesHtml = MESES.map((mes, i) => {
      const pago = a.mesesPagos.includes(i);
      if (pago && !isAdmin()) {
        return `<button class="mes-btn pago bloqueado" disabled
          title="Já pago — só o administrador pode alterar">
          ${mes} 🔒</button>`;
      }
      return `<button class="mes-btn ${pago ? 'pago' : ''}"
        onclick="toggleMes(${a.id}, ${i})"
        title="${pago ? 'Clique para desmarcar' : 'Clique para marcar como pago'}">
        ${mes}</button>`;
    }).join('');

    const totalPago     = a.mesesPagos.length * a.mensalidade + valInsc;
    const totalPendente = (12 - a.mesesPagos.length) * a.mensalidade;
    const idTexto       = a.id_texto || a.idTexto;

    return `
      <div class="mensalidade-card">
        <div class="mc-header">
          <div>
            <div class="mc-nome">${a.nome}</div>
            <div class="mc-matricula">${idTexto}</div>
          </div>
          <div class="mc-valor">${formatarMt(a.mensalidade)}
            <span style="font-size:0.7rem;color:var(--text-muted)">/mês</span>
          </div>
        </div>
        <div class="mc-curso">📚 ${a.curso}</div>
        <span class="mc-local"
          style="background:${COR_LOCAIS[a.local]}18;
                 color:${COR_LOCAIS[a.local]};
                 border-color:${COR_LOCAIS[a.local]}40">
          📍 ${a.local}
        </span>
        <hr class="mc-divider"/>
        <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:8px">
          ${isAdmin()
            ? 'Clique nos meses para marcar/desmarcar:'
            : 'Clique para marcar como pago (🔒 = já pago, só admin pode alterar):'}
        </div>
        <div class="mc-meses">${mesesHtml}</div>
        <div style="font-size:0.8rem;display:flex;gap:16px;margin-bottom:12px;flex-wrap:wrap">
          <span style="color:var(--green);font-weight:600">✅ Pago: ${formatarMt(totalPago)}</span>
          <span style="color:var(--red);font-weight:600">⏳ Pendente: ${formatarMt(totalPendente)}</span>
        </div>
        <div class="mc-actions">
          <button class="btn-icon"
            onclick="gerarRecibo(alunos.find(x=>x.id==${a.id}))">🧾 Recibo</button>
        </div>
      </div>
    `;
  }).join('');
}

async function toggleMes(id, mesIdx) {
  const aluno = alunos.find(a => a.id === id);
  if (!aluno) return;

  if (aluno.mesesPagos.includes(mesIdx)) {
    if (!isAdmin()) {
      mostrarToast('🔒 Só o administrador pode desmarcar um mês já pago.', 'error');
      return;
    }
    aluno.mesesPagos = aluno.mesesPagos.filter(m => m !== mesIdx);
    mostrarToast(`↩️ ${MESES[mesIdx]} desmarcado`);
  } else {
    aluno.mesesPagos.push(mesIdx);
    mostrarToast(`✅ ${MESES[mesIdx]} marcado como pago!`);
  }

  try {
    const { error } = await db
      .from('alunos')
      .update({ meses_pagos: JSON.stringify(aluno.mesesPagos) })
      .eq('id', id);
    if (error) throw error;

    renderizarMensalidades();
    atualizarDashboard();
  } catch (err) {
    console.error('Erro ao actualizar mês:', err);
    mostrarToast('❌ Erro ao guardar!', 'error');
  }
}

// ===== RELATÓRIO =====
function renderizarRelatorio() {
  if (!isAdmin()) return;

  const filtroLocal = document.getElementById('filtro-local-rel')
    ? document.getElementById('filtro-local-rel').value : '';
  let lista = filtroLocal ? alunos.filter(a => a.local === filtroLocal) : alunos;

  const totalInscritos           = lista.length;
  const totalReceitaInscricoes   = lista.reduce((acc, a) => acc + (a.valor_inscricao || a.valorInscricao), 0);
  const totalReceitaMensalidades = lista.reduce((acc, a) =>
    acc + a.mesesPagos.length * a.mensalidade, 0);
  const totalReceita  = totalReceitaInscricoes + totalReceitaMensalidades;
  const totalPendente = lista.reduce((acc, a) =>
    acc + (12 - a.mesesPagos.length) * a.mensalidade, 0);

  let tabelasHtml = '';
  const locaisParaMostrar = filtroLocal ? [filtroLocal] : LOCAIS;

  locaisParaMostrar.forEach(local => {
    const listaLocal   = lista.filter(a => a.local === local);
    if (listaLocal.length === 0) return;
    const receitaLocal = listaLocal.reduce((acc, a) =>
      acc + (a.valor_inscricao || a.valorInscricao) + (a.mesesPagos.length * a.mensalidade), 0);

    const linhas = listaLocal.map(a => {
      const idTexto = a.id_texto || a.idTexto;
      const valInsc = a.valor_inscricao || a.valorInscricao;
      return `
        <tr>
          <td>${idTexto}</td>
          <td>${a.nome}</td>
          <td>${a.curso}</td>
          <td>${formatarMt(valInsc)}</td>
          <td>${a.mesesPagos.length}/12</td>
          <td>${formatarMt(a.mesesPagos.length * a.mensalidade)}</td>
          <td>${formatarMt((12 - a.mesesPagos.length) * a.mensalidade)}</td>
          <td><span class="badge ${
            a.mesesPagos.length >= 6 ? 'badge-pago' :
            a.mesesPagos.length  > 0 ? 'badge-parcial' : 'badge-pendente'}">
            ${a.mesesPagos.length >= 6 ? 'Em dia' :
              a.mesesPagos.length  > 0 ? 'Parcial' : 'Pendente'}
          </span></td>
        </tr>
      `;
    }).join('');

    tabelasHtml += `
      <div class="rel-local-titulo" style="color:${COR_LOCAIS[local]}">
        📍 ${local} — ${listaLocal.length} estudantes · ${formatarMt(receitaLocal)}
      </div>
      <div class="table-wrap" style="margin-bottom:24px">
        <table>
          <thead><tr>
            <th>ID</th><th>Nome</th><th>Curso</th>
            <th>Inscrição</th><th>Meses</th><th>Pago</th><th>Pendente</th><th>Estado</th>
          </tr></thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    `;
  });

  document.getElementById('relatorio-conteudo').innerHTML = `
    <div class="rel-titulo">📊 Relatório Financeiro${filtroLocal ? ' — ' + filtroLocal : ''}</div>
    <div class="rel-sub">Gerado em ${formatarDataHora(new Date())} · Reforço Escolar Tembe</div>
    <div class="rel-sumario">
      <div class="rel-item"><span>Total Inscritos</span><strong>${totalInscritos}</strong></div>
      <div class="rel-item"><span>Receita Inscrições</span>
        <strong>${formatarMt(totalReceitaInscricoes)}</strong></div>
      <div class="rel-item"><span>Receita Mensalidades</span>
        <strong>${formatarMt(totalReceitaMensalidades)}</strong></div>
      <div class="rel-item"><span>Total Arrecadado</span>
        <strong style="color:var(--accent)">${formatarMt(totalReceita)}</strong></div>
      <div class="rel-item"><span>Total Pendente</span>
        <strong style="color:var(--red)">${formatarMt(totalPendente)}</strong></div>
    </div>
    ${lista.length > 0 ? tabelasHtml :
      `<div class="empty-state"><div class="emoji">📭</div>
       <p>Sem dados para mostrar.</p></div>`}
  `;
}

function imprimirRelatorio() {
  if (!isAdmin()) return;
  window.print();
}

// ===== RETIRADAS =====

let retiradas = [];

function registarRetirada() {

  const valor = parseFloat(document.getElementById('retirada-valor').value);
  const data = document.getElementById('retirada-data').value;
  const motivo = document.getElementById('retirada-motivo').value.trim();

  if (!valor || !data || !motivo) {
    mostrarToast('⚠️ Preencha todos os campos!', 'error');
    return;
  }

  retiradas.push({
    valor,
    data,
    motivo
  });

  renderizarRetiradas();

  document.getElementById('retirada-valor').value = '';
  document.getElementById('retirada-data').value = '';
  document.getElementById('retirada-motivo').value = '';

  mostrarToast('✅ Retirada registada com sucesso!');
}

function renderizarRetiradas() {

  const tbody = document.getElementById('tbody-retiradas');

  if (!tbody) return;

  let total = 0;

  tbody.innerHTML = retiradas.map((r, i) => {

    total += r.valor;

    return `
      <tr>
        <td>${r.data}</td>
        <td>${r.motivo}</td>
        <td>${formatarMt(r.valor)}</td>
        <td>
          <button class="btn-icon danger"
            onclick="eliminarRetirada(${i})">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }).join('');

  const totalEl = document.getElementById('total-retiradas');

  if (totalEl) {
    totalEl.textContent = formatarMt(total);
  }
}

function eliminarRetirada(index) {

  if (!confirm('Eliminar esta retirada?')) return;

  retiradas.splice(index, 1);

  renderizarRetiradas();

  mostrarToast('🗑️ Retirada removida');
}

// ===== UTILITÁRIOS =====
function formatarMt(valor) {
  if (isNaN(valor)) return '0,00 MT';
  return valor.toLocaleString('pt-MZ', { minimumFractionDigits: 2 }) + ' MT';
}

function formatarDataHora(data) {
  return data.toLocaleString('pt-MZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function mostrarToast(msg, tipo = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'toast show' + (tipo === 'error' ? ' error' : '');
  setTimeout(() => { t.className = 'toast'; }, 3500);
}
