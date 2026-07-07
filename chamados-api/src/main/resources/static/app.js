// 🌐 CONFIGURAÇÃO DA URL DA SUA API JAVA SPRING BOOT
const API_BASE_URL = 'http://192.168.1.221:8081/api';

// 🔒 CONTROLE DE ACESSO: Verifica se na URL tem "?perfil=tecnico"
const urlParams = new URLSearchParams(window.location.search);
const ehTecnico = urlParams.get('perfil') === 'tecnico';

let chamados = [];
let tecnicos = [];
let filterActive = 'todos';
let pendingAssumirId = null;
let selectedPrio = 'MEDIA';

// ============================================================
// REQUISIÇÕES DA API (FETCH)
// ============================================================

// GET - Buscar setores dinâmicos do Enum do Java
async function carregarSetoresDoEnum() {
  try {
    const res = await fetch(`${API_BASE_URL}/chamados/setores`);
    if (!res.ok) throw new Error('Erro ao buscar setores');

    const listaSetores = await res.json();
    const selectSetor = document.getElementById('f-setor');

    if (selectSetor) {
      selectSetor.innerHTML = '<option value="">Selecione o setor...</option>';
      listaSetores.forEach(setor => {
        const option = document.createElement('option');
        option.value = setor;
        option.textContent = setor.charAt(0) + setor.slice(1).toLowerCase();
        selectSetor.appendChild(option);
      });
    }
  } catch (err) {
    console.error('Erro ao carregar setores dinâmicos:', err);
  }
}

// GET - Buscar equipamentos dinâmicos do Enum do Java (AGORA SEPARADA E CORRETA! 🌟)
async function carregarEquipamentosDoEnum() {
  try {
    const res = await fetch(`${API_BASE_URL}/chamados/equipamentos`);
    if (!res.ok) throw new Error('Erro ao buscar equipamentos');

    const listaEquipamentos = await res.json();
    const selectEquip = document.getElementById('f-equip');

    if (selectEquip) {
      selectEquip.innerHTML = '<option value="">Selecione o equipamento...</option>';
      listaEquipamentos.forEach(equip => {
        const option = document.createElement('option');
        option.value = equip; 
        option.textContent = equip.charAt(0) + equip.slice(1).toLowerCase();
        selectEquip.appendChild(option);
      });
    }
  } catch (err) {
    console.error('Erro ao carregar equipamentos dinâmicos:', err);
  }
}

// GET - Listar todos os chamados
async function carregarChamados() {
  try {
    const res = await fetch(`${API_BASE_URL}/chamados`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    if (!res.ok) throw new Error('Erro ao buscar chamados');
    chamados = await res.json();
    updateBadgeAndCount();
    
    const viewPainel = document.getElementById('view-painel');
    if (viewPainel && viewPainel.classList.contains('active')) {
      renderPainel();
    }
  } catch (err) {
    console.error(err);
    toast('Você não está conectado na rede da ARSAL', true);
  }
}

// GET - Listar técnicos autorizados do banco
async function carregarTecnicos() {
  try {
    const res = await fetch(`${API_BASE_URL}/chamados/tecnicos`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    if (!res.ok) throw new Error('Erro ao buscar técnicos');
    tecnicos = await res.json();
    preencherSelectTecnicos();
    renderTabelaTecnicos();
  } catch (err) {
    console.error('Erro ao conectar com técnicos:', err);
  }
}

// POST - Criar novo chamado
async function criarChamado(chamadoDTO) {
  try {
    const res = await fetch(`${API_BASE_URL}/chamados`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(chamadoDTO)
    });
    if (!res.ok) throw new Error('Erro nas validações do servidor');
    toast('Chamado registrado no banco com sucesso!');
    carregarChamados();
    resetForm();
  } catch (err) {
    toast('Verifique os campos ou se você está na rede da ARSAL.', true);
  }
}

// PUT - Assumir Chamado
async function apiAssumirChamado(id, nomeTecnico) {
  try {
    const res = await fetch(`${API_BASE_URL}/chamados/${id}/assumir`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain',
        'ngrok-skip-browser-warning': 'true'
      },
      body: `"${nomeTecnico}"`
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Erro ao assumir');
    }
    toast(`Chamado assunto por ${nomeTecnico}!`);
    carregarChamados();
  } catch (err) {
    toast('Técnico não cadastrado ou inválido!', true);
  }
}

// PUT - Fechar Chamado
async function apiFecharChamado(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/chamados/${id}/fechar`, {
      method: 'PUT',
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    if (!res.ok) throw new Error();
    toast('Chamado marcado como resolvido ✓');
    carregarChamados();
  } catch (err) {
    toast('Erro ao fechar chamado', true);
  }
}

// PUT - Reabrir Chamado
async function apiReabrirChamado(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/chamados/${id}/reabrir`, {
      method: 'PUT',
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    if (!res.ok) throw new Error();
    toast('Chamado reaberto e devolvido para a fila.', true);
    carregarChamados();
  } catch (err) {
    toast('Erro ao reabrir chamado', true);
  }
}

// ============================================================
// RENDERIZAÇÃO E INTERFACE
// ============================================================
function renderPainel() {
  const list = document.getElementById('chamados-list');
  const empty = document.getElementById('empty-state');
  if (!list || !empty) return;

  let data = chamados;
  if (filterActive !== 'todos') {
    data = chamados.filter(c => c.status === filterActive);
  }

  if (data.length === 0) {
    list.innerHTML = ''; empty.style.display = 'block'; return;
  }
  empty.style.display = 'none';
  list.innerHTML = '';

  data.forEach(c => {
    const div = document.createElement('div');
    div.className = `chamado-card prio-${c.prioridade} status-${c.status}`;
    div.innerHTML = `
    <div class="card-main">
      <h3>${esc(c.usuarioNome)} — Setor: ${esc(c.setor)}</h3>
      <div class="card-meta">
        <span class="badge badge-setor">${esc(c.setor)}</span>
        <span class="badge badge-tipo">${esc(c.titulo)}</span>
        <span class="badge badge-equip">${esc(c.equipmento || c.equipamento)}</span>
        <span class="badge badge-prio-${c.prioridade}">${c.prioridade}</span>
        <span class="badge badge-${c.status}">${c.status}</span>
      </div>
      <div class="card-desc">${esc(c.descricao)}</div>
      <div class="card-footer">
        <span class="card-ts">Aberto em: ${c.criadoEm || '--'}</span>
        ${c.tecnicoId ? `<span class="card-tecnico">ID do Técnico Responsável: ${c.tecnicoId}</span>` : ''}
      </div>
    </div>
    ${ehTecnico ? `
    <div class="card-actions">
      ${c.status === 'ABERTO' ? `<button class="act-btn assumir" onclick="openModalAssumir(${c.id})">Assumir</button>` : ''}
      ${c.status === 'ANDAMENTO' ? `<button class="act-btn fechar" onclick="apiFecharChamado(${c.id})">Resolver</button><button class="act-btn reabrir" onclick="apiReabrirChamado(${c.id})">Reabrir</button>` : ''}
      ${c.status === 'FECHADO' ? `<button class="act-btn reabrir" onclick="apiReabrirChamado(${c.id})">Reabrir</button>` : ''}
    </div>
    ` : ''}
  `;
    list.appendChild(div);
  });
}

function preencherSelectTecnicos() {
  const select = document.getElementById('m-tecnico-select');
  if (!select) return;

  if (tecnicos.length === 0) {
    select.innerHTML = '<option value="">Nenhum técnico no banco...</option>';
    return;
  }

  select.innerHTML = '<option value="">Selecione seu nome...</option>' + 
    tecnicos.map(t => {
      const nomeVisivel = t.nome || (typeof t === 'string' ? t : JSON.stringify(t));
      return `<option value="${nomeVisivel}">${nomeVisivel}</option>`;
    }).join('');
}

function renderTabelaTecnicos() {
  const tbody = document.getElementById('tec-tbody');
  if (!tbody) return;
  if (tecnicos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2">Nenhum cadastrado.</td></tr>';
    return;
  }
  tbody.innerHTML = tecnicos.map(t => `<tr><td>${t.id || '--'}</td><td><strong>${t.nome || t}</strong></td></tr>`).join('');
}

function updateBadgeAndCount() {
  const abertos = chamados.filter(c => c.status === 'ABERTO').length;
  const badge = document.getElementById('badge-abertos');
  const live = document.getElementById('live-count');
  if(badge) badge.textContent = abertos;
  if(live) live.textContent = abertos;
}

// ============================================================
// TRATAMENTO DE EVENTOS DA TELA
// ============================================================

const btnEnviar = document.getElementById('btn-enviar');
if (btnEnviar) {
  btnEnviar.addEventListener('click', () => {
    const dto = {
      usuarioNome: document.getElementById('f-nome').value.trim(),
      setor: document.getElementById('f-setor').value, 
      equipamento: document.getElementById('f-equip').value,
      titulo: document.getElementById('f-tipo').value.trim(),
      prioridade: selectedPrio,
      descricao: document.getElementById('f-desc').value.trim()
    };
    criarChamado(dto);
  });
}

document.querySelectorAll('#prio-group .pill').forEach(p => {
  p.addEventListener('click', () => {
    document.querySelectorAll('#prio-group .pill').forEach(x => x.className = 'pill');
    selectedPrio = p.dataset.prio;
    p.classList.add('sel-' + selectedPrio);
  });
});

function openModalAssumir(id) {
  pendingAssumirId = id;
  carregarTecnicos();
  const modal = document.getElementById('modal-assumir');
  if (modal) modal.classList.add('open');
}

const btnCancel = document.getElementById('modal-cancel');
if (btnCancel) {
  btnCancel.addEventListener('click', () => {
    document.getElementById('modal-assumir').classList.remove('open');
  });
}

const btnConfirm = document.getElementById('modal-confirm');
if (btnConfirm) {
  btnConfirm.addEventListener('click', () => {
    const nomeTecnico = document.getElementById('m-tecnico-select').value;
    if (!nomeTecnico) return;
    apiAssumirChamado(pendingAssumirId, nomeTecnico);
    document.getElementById('modal-assumir').classList.remove('open');
  });
}

document.querySelectorAll('.filter-btn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    filterActive = b.dataset.filter;
    renderPainel();
  });
});

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('view-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'painel') renderPainel();
    if (btn.dataset.tab === 'relatorio') carregarTecnicos();
  });
});

function esc(s) { return String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function toast(msg, warn = false) {
  const w = document.getElementById('toast-wrap');
  if(!w) return;
  const el = document.createElement('div');
  el.className = 'toast' + (warn ? ' warn' : '');
  el.innerHTML = `<span class="toast-icon">${warn ? '⚠' : '✓'}</span>${msg}`;
  w.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// LÓGICA DO BOTÃO DE PERFIL DO TÉCNICO (COM SENHA 🔒)
const btnModoTecnico = document.getElementById('btn-modo-tecnico');
if (btnModoTecnico) {
  if (ehTecnico) {
    btnModoTecnico.style.color = 'var(--amber)';
    btnModoTecnico.title = 'Modo Técnico Ativo - Clique para Sair';
  }
  btnModoTecnico.addEventListener('click', () => {
    if (ehTecnico) {
      window.location.search = '';
    } else {
      const senhaDigitada = prompt("Digite a senha de administrador da TI:");
      if (senhaDigitada === 'arsalti2026') {
        toast('Acesso autorizado! Carregando painel...', false);
        setTimeout(() => { window.location.search = '?perfil=tecnico'; }, 1000);
      } else if (senhaDigitada !== null) {
        toast('Senha incorreta! Acesso negado.', true);
      }
    }
  });
}

function resetForm() {
  ['f-nome', 'f-desc', 'f-tipo'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  const equip = document.getElementById('f-equip');
  const setor = document.getElementById('f-setor');
  if(equip) equip.value = '';
  if(setor) setor.value = '';
}

function updateClock() { 
  const clk = document.getElementById('live-clock');
  if(clk) clk.textContent = new Date().toLocaleTimeString('pt-BR'); 
}

function controlarAbasPorPerfil() {
  const abaRelatorio = document.querySelector('.tab-btn[data-tab="relatorio"]');
  if (abaRelatorio) {
    if (ehTecnico) {
      abaRelatorio.style.display = 'flex';
    } else {
      abaRelatorio.style.display = 'none';
    }
  }
}

// ============================================================
// START (POLLING AUTOMÁTICO DE 4 SEGUNDOS COPIANDO O BACK)
// ============================================================
updateClock(); 
setInterval(updateClock, 1000);
controlarAbasPorPerfil();

carregarChamados(); 
carregarTecnicos();
setInterval(carregarChamados, 4000); 

carregarSetoresDoEnum();
carregarEquipamentosDoEnum(); // 🌟 ATIVADA AQUI NO START!