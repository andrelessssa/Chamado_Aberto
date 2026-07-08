// 🌐 CONFIGURAÇÃO DA URL DA SUA API JAVA SPRING BOOT (REDE LOCAL)
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
// REQUISIÇÕES DA API (FETCH) - TOTALMENTE SEM NGROK 🧼
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

// GET - Buscar equipamentos dinâmicos do Enum do Java
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
    const res = await fetch(`${API_BASE_URL}/chamados`);
    if (!res.ok) throw new Error('Erro ao buscar chamados');
    
    chamados = await res.json();
    updateBadgeAndCount();
    
    // 📺 COLOQUE AQUI! Atualiza o painel da TV sempre que novos dados chegarem
    atualizarMuralTV();
    
    const viewPainel = document.getElementById('view-painel');
    if (viewPainel && viewPainel.classList.contains('active')) {
      renderPainel();
    }
  } catch (err) {
    console.error(err);
    toast('Você não está conectado na rede da ARSAL ⚠', true);
  }
}

// GET - Listar técnicos autorizados do banco
// 🌟 ATUALIZADO: Buscar técnicos na rota correta do seu novo Controller
async function carregarTecnicos() {
  try {
    const res = await fetch(`${API_BASE_URL}/tecnicos`); // Rota corrigida de /chamados/tecnicos para /tecnicos
    if (!res.ok) throw new Error('Erro ao buscar técnicos');
    tecnicos = await res.json();
    preencherSelectTecnicos();
    renderTabelaTecnicos(); // Atualiza a aba de gerenciamento também!
  } catch (err) {
    console.error('Erro ao conectar com técnicos:', err);
  }
}

// ➕ POST - Cadastrar novo técnico no banco
async function apiCadastrarTecnico(nome) {
  try {
    const res = await fetch(`${API_BASE_URL}/tecnicos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nome })
    });
    
    if (!res.ok) throw new Error('Erro ao cadastrar técnico');
    
    toast('Técnico cadastrado com sucesso! 🛡️');
    document.getElementById('f-nome-tecnico').value = ''; // Limpa o input
    await carregarTecnicos(); // Atualiza as listas na tela
  } catch (err) {
    console.error(err);
    toast('Erro ao cadastrar técnico.', true);
  }
}

// ❌ DELETE - Remover técnico do banco pelo ID
async function apiDeletarTecnico(id) {
  if (!confirm('Tem certeza que deseja remover este técnico do sistema?')) return;
  
  try {
    const res = await fetch(`${API_BASE_URL}/tecnicos/${id}`, {
      method: 'DELETE'
    });
    
    if (!res.ok) throw new Error('Erro ao deletar técnico');
    
    toast('Técnico removido com sucesso.');
    await carregarTecnicos(); // Atualiza a tela
  } catch (err) {
    console.error(err);
    toast('Erro ao remover técnico ou ele está vinculado a um chamado.', true);
  }
}

// POST - Criar novo chamado (COM TRATAMENTO DE ERRO DE VALIDAÇÃO 🩺)
async function criarChamado(chamadoDTO) {
  try {
    const res = await fetch(`${API_BASE_URL}/chamados`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chamadoDTO)
    });

    // 🌟 Se o Java recusar por falta de dados (Status 400 ou 500 interno de validação)
    if (res.status === 400 || res.status === 500) {
      toast('Por favor, preencha todos os campos obrigatórios do formulário!', true);
      return;
    }

    if (!res.ok) throw new Error('Erro nas validações do servidor');

    toast('Chamado registrado com sucesso! 🚀');
    carregarChamados();
    resetForm();
  } catch (err) {
    console.error(err);
    // 🌟 Só cai aqui se a rede cair ou o servidor estiver totalmente desligado
    toast('Falha na conexão: Verifique se está conectado no Wi-Fi da ARSAL.', true);
  }
}

// PUT - Assumir Chamado
async function apiAssumirChamado(id, nomeTecnico) {
  try {
    const res = await fetch(`${API_BASE_URL}/chamados/${id}/assumir`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: `"${nomeTecnico}"`
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Erro ao assumir');
    }
    toast(`Chamado assumido por ${nomeTecnico}! 📝`);
    carregarChamados();
  } catch (err) {
    toast('Técnico não cadastrado ou inválido!', true);
  }
}

// PUT - Fechar Chamado
async function apiFecharChamado(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/chamados/${id}/fechar`, {
      method: 'PUT'
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
      method: 'PUT'
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
    
    // 🌟 ADICIONE ISSO AQUI PARA RASTREAR NO NAVEGADOR:
console.log("Chamado vindo do Java:", c);

    // 🌟 AJUSTADO: Usando chamado.tipoProblema para exibir o texto que veio do banco!
    div.innerHTML = `
    <div class="card-main">
      <h3>${esc(c.usuarioNome)} — Setor: ${esc(c.setor)}</h3>
      <div class="card-meta">
        <span class="badge badge-setor">${esc(c.setor)}</span>
        <span class="badge badge-tipo">Chamado #${c.id}</span>
        <span class="badge badge-equip">${esc(c.equipmento || c.equipamento)}</span>
        <span class="badge badge-prio-${c.prioridade}">${c.prioridade}</span>
        <span class="badge badge-${c.status}">${c.status}</span>
      </div>
      <div class="card-desc">${esc(c.tipoProblema)}</div> 
     <div class="card-footer">
        <span class="card-ts">Aberto em: ${c.criadoEm || '--'}</span>
        ${c.status === 'FECHADO' 
          ? `<span class="card-tecnico" style="color: var(--green);">✅ Finalizado por: <strong>${esc(c.tecnico?.nome || c.tecnicoNome || 'TI ARSAL')}</strong></span>`
          : (c.tecnico || c.tecnicoNome)
            ? `<span class="card-tecnico">Responsável: <strong>${esc(c.tecnico?.nome || c.tecnicoNome)}</strong></span>` 
            : '<span class="card-tecnico aguardando">👤 Aguardando Técnico...</span>'
        }
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
  const container = document.getElementById('tec-tbody'); // Mantemos o mesmo ID para não quebrar o HTML
  if (!container) return;
  
  if (tecnicos.length === 0) {
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--txt-dim); grid-column: 1/-1;">Nenhum técnico cadastrado no banco.</div>';
    return;
  }
  
  // 🌟 Renderiza como uma lista de cartões idênticos ao do chamado!
  container.innerHTML = tecnicos.map(t => `
    <div class="chamado-card" style="border-left-color: var(--amber); margin-bottom: 12px; grid-template-columns: 1fr auto;">
      <div class="card-main" style="display: flex; align-items: center;">
        <h3 style="margin-bottom: 0; font-size: 1.05rem;">
          <span>💼</span> ${esc(t.nome)}
        </h3>
      </div>
      <div class="card-actions" style="justify-content: center; height: 100%;">
        <button class="act-btn" style="border-color: var(--rose); color: var(--rose); background: var(--rose-dim); padding: 6px 14px;" 
                onmouseover="this.style.background='var(--rose)'; this.style.color='#0A1118';" 
                onmouseout="this.style.background='var(--rose-dim)'; this.style.color='var(--rose)';"
                onclick="apiDeletarTecnico(${t.id})">
          Excluir
        </button>
      </div>
    </div>
  `).join('');
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

const btnCadastrarTecnico = document.getElementById('btn-cadastrar-tecnico');
if (btnCadastrarTecnico) {
  btnCadastrarTecnico.addEventListener('click', () => {
    const nomeInput = document.getElementById('f-nome-tecnico').value.trim();
    if (!nomeInput) {
      toast('Por favor, digite o nome do técnico!', true);
      return;
    }
    apiCadastrarTecnico(nomeInput);
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
  const abaEstatisticas = document.querySelector('.tab-btn[data-tab="estatisticas"]');
  const abaMural = document.querySelector('.tab-btn[data-tab="mural"]');
  
  if (ehTecnico) {
    if (abaRelatorio) {
      abaRelatorio.style.display = 'inline-flex';
      abaRelatorio.style.alignItems = 'center';
    }
    if (abaEstatisticas) {
      abaEstatisticas.style.display = 'inline-flex';
      abaEstatisticas.style.alignItems = 'center';
    }
    // 📺 🌟 AJUSTADO: Se for técnico, mostra a aba do mural na barra!
    if (abaMural) {
      abaMural.style.display = 'inline-flex';
      abaMural.style.alignItems = 'center';
    }
  } else {
    if (abaRelatorio) abaRelatorio.style.display = 'none';
    if (abaEstatisticas) abaEstatisticas.style.display = 'none';
    // 📺 🌟 AJUSTADO: Se não for técnico, esconde a aba!
    if (abaMural) abaMural.style.display = 'none';
  }
}
function atualizarMuralTV() {
  const txtNome = document.getElementById('mural-atual-nome');
  const txtSetor = document.getElementById('mural-atual-setor');
  const txtTecnico = document.getElementById('mural-atual-tecnico');
  const listaEspera = document.getElementById('mural-lista-espera');
  const badgeQtd = document.getElementById('mural-fila-qtd');

  if (!txtNome || !listaEspera) return;

  // 1. Acha o chamado mais recente que mudou para "ANDAMENTO" (Destaque da TV)
  const chamadosEmAndamento = chamados.filter(c => c.status === 'ANDAMENTO');
  
  if (chamadosEmAndamento.length > 0) {
    // Pega o último que foi assumido
    const atual = chamadosEmAndamento[chamadosEmAndamento.length - 1];
    txtNome.innerText = esc(atual.usuarioNome);
    txtSetor.innerText = `SETOR: ${esc(atual.setor)}`;
    txtTecnico.innerHTML = `⚙️ ${esc(atual.tecnicoNome || 'Técnico TI')}`;
  } else {
    // Se não tiver nenhum em andamento agora
    txtNome.innerText = "Central Livre";
    txtSetor.innerText = "ARSAL TI";
    txtTecnico.innerText = "Aguardando novo chamado...";
  }

  // 2. Filtra os chamados que estão "ABERTO" esperando na fila (Máximo 4 para caber na tela)
  const chamadosAbertos = chamados.filter(c => c.status === 'ABERTO');
  badgeQtd.innerText = chamadosAbertos.length;

  if (chamadosAbertos.length === 0) {
    listaEspera.innerHTML = '<div style="color: var(--txt-dim); text-align: center; padding: 20px; font-size:0.85rem;">📭 Fila zerada! Tudo em dia.</div>';
    return;
  }

  // Renderiza a lista lateral com os nomes e setores estilo painel de senha
  listaEspera.innerHTML = chamadosAbertos.slice(0, 4).map(c => `
    <div style="background: rgba(255,255,255,0.02); padding: 14px 18px; border-radius: var(--rs); border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong style="color: #fff; display: block; font-size: 0.95rem;">${esc(c.usuarioNome)}</strong>
        <span style="font-size: 0.75rem; color: var(--txt-dim); font-family: var(--mono);">${esc(c.tipoProblema || 'Suporte')}</span>
      </div>
      <span class="badge badge-setor" style="font-size: 0.7rem; font-weight: bold;">${esc(c.setor)}</span>
    </div>
  `).join('');
}

// ============================================================
// START (POLLING AUTOMÁTICO DE 4 SEGUNDOS ⏱️)
// ============================================================
updateClock(); 
setInterval(updateClock, 1000);
controlarAbasPorPerfil();

carregarChamados(); 
carregarTecnicos();
setInterval(carregarChamados, 4000); 

carregarSetoresDoEnum();
carregarEquipamentosDoEnum();