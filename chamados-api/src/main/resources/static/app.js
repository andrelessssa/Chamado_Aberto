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
    
    // 📺 Atualiza o painel da TV sempre que novos dados chegarem
    atualizarMuralTV();
    
    // 📊 Preenche os filtros e roda o agrupamento do Relatório Dinâmico!
    if (typeof gerarRelatorioDinamico === 'function') {
       const selS = document.getElementById('rep-setor');
       if (selS && selS.options.length <= 1) {
          const setoresUnicos = [...new Set(chamados.map(c => c.setor).filter(Boolean))];
          setoresUnicos.forEach(s => selS.add(new Option(s, s)));
       }
       const selE = document.getElementById('rep-equip');
       if (selE && selE.options.length <= 1) {
          const equipsUnicos = [...new Set(chamados.map(c => c.equipmento || c.equipamento).filter(Boolean))];
          equipsUnicos.forEach(e => selE.add(new Option(e, e)));
       }
       gerarRelatorioDinamico();
    }
    
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
async function carregarTecnicos() {
  try {
    const res = await fetch(`${API_BASE_URL}/tecnicos`);
    if (!res.ok) throw new Error('Erro ao buscar técnicos');
    tecnicos = await res.json();
    preencherSelectTecnicos();
    renderTabelaTecnicos();
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
    document.getElementById('f-nome-tecnico').value = '';
    await carregarTecnicos();
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
    await carregarTecnicos();
  } catch (err) {
    console.error(err);
    toast('Erro ao remover técnico ou ele está vinculado a um chamado.', true);
  }
}

// POST - Criar novo chamado
async function criarChamado(chamadoDTO) {
  try {
    const res = await fetch(`${API_BASE_URL}/chamados`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chamadoDTO)
    });

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
    toast('Falha na conexão: Verifique se está conectado no Wi-Fi da ARSAL.', true);
  }
}

// PUT - Assumir Chamado
async function apiAssumirChamado(id, nomeTecnico) {
  try {
    const res = await fetch(`${API_BASE_URL}/chamados/${id}/assumir`, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
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
    const res = await fetch(`${API_BASE_URL}/chamados/${id}/fechar`, { method: 'PUT' });
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
    const res = await fetch(`${API_BASE_URL}/chamados/${id}/reabrir`, { method: 'PUT' });
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

  // 🗓️ Pega a data de hoje no formato DD/MM/AAAA para comparar
  const hojeTexto = new Date().toLocaleDateString('pt-BR');

  // 🧹 FILTRAGEM INTELIGENTE: Remove os fechados antigos da fila visual
  let data = chamados.filter(c => {
    if (c.status === 'FECHADO') {
      // Verifica se a string da data do chamado contém a data de hoje
      let dataCriacao = c.criadoEm || "";
      return dataCriacao.includes(hojeTexto);
    }
    // Se estiver ABERTO ou ANDAMENTO, mantém sempre na tela!
    return true;
  });

  // Aplica o filtro dos botões do topo (Todos, Abertos, Em andamento, Fechados)
  if (filterActive !== 'todos') {
    data = data.filter(c => c.status === filterActive);
  }

  if (data.length === 0) {
    list.innerHTML = ''; 
    empty.style.display = 'block'; 
    return;
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
  const container = document.getElementById('tec-tbody');
  if (!container) return;
  
  if (tecnicos.length === 0) {
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--txt-dim); grid-column: 1/-1;">Nenhum técnico cadastrado no banco.</div>';
    return;
  }
  
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
    const tabName = btn.getAttribute('data-tab') || btn.dataset.tab;
    const targetView = document.getElementById('view-' + tabName);
    
    if (!targetView) {
      console.error("Erro: Não existe nenhuma div com o ID 'view-" + tabName + "' no seu index.html");
      return;
    }

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    
    btn.classList.add('active');
    targetView.classList.add('active');
    
    if (tabName === 'painel') {
      if (typeof renderPainel === 'function') renderPainel();
    }
    
   if (tabName === 'relatorio') {
      if (typeof carregarTecnicos === 'function') carregarTecnicos();
      if (typeof gerarRelatorioDinamico === 'function') gerarRelatorioDinamico();
    }

    if (tabName === 'mural') {
      if (typeof atualizarMuralTV === 'function') atualizarMuralTV();
    }
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
  const abaGerenciar = document.querySelector('.tab-btn[data-tab="gerenciar"]');
  const abaMural = document.querySelector('.tab-btn[data-tab="mural"]');
  
  if (ehTecnico) {
    if (abaRelatorio) {
      abaRelatorio.style.display = 'inline-flex';
      abaRelatorio.style.alignItems = 'center';
    }
    if (abaGerenciar) {
      abaGerenciar.style.display = 'inline-flex';
      abaGerenciar.style.alignItems = 'center';
    }
    if (abaMural) {
      abaMural.style.display = 'inline-flex';
      abaMural.style.alignItems = 'center';
    }
  } else {
    if (abaRelatorio) abaRelatorio.style.display = 'none';
    if (abaGerenciar) abaGerenciar.style.display = 'none';
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

  const chamadosEmAndamento = chamados.filter(c => c.status === 'ANDAMENTO');
  
  if (chamadosEmAndamento.length > 0) {
    const atual = chamadosEmAndamento[chamadosEmAndamento.length - 1];
    txtNome.innerText = esc(atual.usuarioNome);
    txtSetor.innerText = `SETOR: ${esc(atual.setor)}`;
    txtTecnico.innerHTML = `⚙️ ${esc(atual.tecnicoNome || 'Técnico TI')}`;
  } else {
    txtNome.innerText = "Central Livre";
    txtSetor.innerText = "ARSAL TI";
    txtTecnico.innerText = "Aguardando novo chamado...";
  }

  const chamadosAbertos = chamados.filter(c => c.status === 'ABERTO');
  badgeQtd.innerText = chamadosAbertos.length;

  if (chamadosAbertos.length === 0) {
    listaEspera.innerHTML = '<div style="color: var(--txt-dim); text-align: center; padding: 20px; font-size:0.85rem;">📭 Fila zerada! Tudo em dia.</div>';
    return;
  }

  listaEspera.innerHTML = chamadosAbertos.slice(0, 4).map(c => `
    <div style="background: rgba(255,255,255,0.02); padding: 14px 18px; border-radius: var(--rs); border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong style="color: #fff; display: block; font-size: 0.95rem;">${esc(c.usuarioNome)}</strong>
        <span style="font-size: 0.75rem; color: var(--txt-dim); font-family: var(--mono);">${esc(c.tipoProblema || 'Suporte')}</span>
      </div>
      <span class="badge badge-setor" style="font-size: 0.7rem; font-weight: bold;">${esc(c.setor)}</span>
    </div>
  `).join('');
} // 🌟 FECHAMENTO DA TV REPARADO AQUI!

function gerarRelatorioDinamico() {
  try {
    const selMes = document.getElementById('rep-mes')?.value || 'TODOS';
    const selAno = document.getElementById('rep-ano')?.value || 'TODOS';
    const selSetor = document.getElementById('rep-setor')?.value || 'TODOS';
    const selEquip = document.getElementById('rep-equip')?.value || 'TODOS';

    const listaSetoresDiv = document.getElementById('rep-lista-setores');
    const listaEquipsDiv = document.getElementById('rep-lista-equips');

    if (!listaSetoresDiv || !listaEquipsDiv) return;

    // 1. Filtrar o array de chamados por Período, Setor e Equipamento
    const chamadosFiltrados = (chamados || []).filter(c => {
      let dataTexto = c.criadoEm || "";
      let mesChamado = "—";
      let anoChamado = "—";

      if (dataTexto.includes('/')) {
        const partes = dataTexto.split('/');
        mesChamado = partes[1] ? partes[1].trim() : "—"; 
        if (partes[2]) anoChamado = partes[2].split(',')[0].trim(); 
      }

      const bateMes = (selMes === 'TODOS' || mesChamado === selMes);
      const bateAno = (selAno === 'TODOS' || anoChamado === selAno);
      const bateSetor = (selSetor === 'TODOS' || c.setor === selSetor);
      const bateEquip = (selEquip === 'TODOS' || (c.equipamento || c.equipmento) === selEquip);

      return bateMes && bateAno && bateSetor && bateEquip;
    });

    // 2. Criar os dicionários de agrupamento
    const agrupadoSetor = {};
    const agrupadoEquip = {};

    chamadosFiltrados.forEach(c => {
      const s = c.setor || "NÃO INFORMADO";
      const e = c.equipamento || c.equipmento || "NÃO INFORMADO";
      agrupadoSetor[s] = (agrupadoSetor[s] || 0) + 1;
      agrupadoEquip[e] = (agrupadoEquip[e] || 0) + 1;
    });

    // 🏆 3. Ordenar Setores por quantidade decrescente (O maior em primeiro)
    const setoresOrdenados = Object.entries(agrupadoSetor).sort((a, b) => b[1] - a[1]);

    if (setoresOrdenados.length === 0) {
      listaSetoresDiv.innerHTML = '<div style="color:var(--txt-dim); font-size:0.85rem; text-align:center; padding:10px;">Nenhum registro encontrado.</div>';
    } else {
      listaSetoresDiv.innerHTML = setoresOrdenados.map(([nome, qtd]) => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.01); padding:10px; border-radius:var(--rs); border:1px solid var(--border);">
          <span style="color:#fff; font-weight:500;">🏢 ${nome}</span>
          <span class="tab-badge" style="background:var(--blue);">${qtd}</span>
        </div>
      `).join('');
    }

    // 🏆 4. Ordenar Equipamentos por quantidade decrescente (O campeão em primeiro)
    const equipsOrdenados = Object.entries(agrupadoEquip).sort((a, b) => b[1] - a[1]);

    if (equipsOrdenados.length === 0) {
      listaEquipsDiv.innerHTML = '<div style="color:var(--txt-dim); font-size:0.85rem; text-align:center; padding:10px;">Nenhum registro encontrado.</div>';
    } else {
      listaEquipsDiv.innerHTML = equipsOrdenados.map(([nome, qtd]) => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.01); padding:10px; border-radius:var(--rs); border:1px solid var(--border);">
          <span style="color:#fff; font-weight:500;">💻 ${nome}</span>
          <span class="tab-badge" style="background:var(--amber); color:#000;">${qtd}</span>
        </div>
      `).join('');
    }

  } catch (error) {
    console.error("Erro interno no relatório dinâmico:", error);
  }
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