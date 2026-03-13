// Importa a função para fazer requisições à API
import { apiRequest } from "./api.js";
// Importa funções utilitárias (DOM, alertas, validação)
import { $, setText, showAlert, hideAlert, validateEmail } from "./utils.js";

function getLoggedUser() { 
const raw = localStorage.getItem("user"); 
return raw ? JSON.parse(raw) : null; 
}

async function loadUsersFromApi(alertEl) { 
const list = await apiRequest("/api/users"); 
usersCache = list; 
render(usersCache); 
}
// ============================================================
// FUNÇÕES DE ARMAZENAMENTO (Simulação - banco local)
// Quando o backend estiver pronto, estas funções não serão mais necessárias
// ============================================================

/**
 * Carrega a lista de usuários do localStorage
 * Simula uma busca em banco de dados
 * @returns {Array} Lista de usuários ou array vazio se não existir
 */


/**
 * Salva a lista de usuários no localStorage
 * Simula uma gravação em banco de dados
 * @param {Array} users - Lista de usuários a ser salva
 */

// ============================================================
// FUNÇÕES DE RENDERIZAÇÃO (UI)
// Responsáveis por atualizar a tabela de usuários na página
// ============================================================

/**
 * Renderiza a lista de usuários na tabela HTML
 * 
 * @param {Array} users - Lista de usuários a exibir
 */
function render(users) {
  const tbody = $("#usersTbody");
  // Limpa a tabela antes de recarregar
  tbody.innerHTML = "";

  // Itera sobre cada usuário da lista
  users.forEach((u) => {
   const loggedUser = getLoggedUser(); 
    if (loggedUser && loggedUser.profile === "ADMIN") { 
    const btnEdit = document.createElement("button"); 
    btnEdit.className = "btn-ghost"; 
    btnEdit.type = "button"; 
    btnEdit.textContent = "Editar"; 
    btnEdit.addEventListener("click", () => fillForm(u)); 
    const btnToggle = document.createElement("button"); 
    btnToggle.className = "btn-danger"; 
    btnToggle.type = "button"; 
    btnToggle.textContent = u.status === "ACTIVE" ? "Inativar" : "Ativar"; 
    btnToggle.addEventListener("click", () => toggleStatus(u.id, u.status, 
    $("#alertUsers"))); 
    tdActions.appendChild(btnEdit); 
    tdActions.appendChild(btnToggle); 
  }

    // Monta a estrutura HTML da linha com botões de ação
   const td = document.createElement("td"); 
    td.textContent = u.name;

    // PROTEÇÃO CONTRA XSS: Usamos textContent ao invés de innerHTML para textos
    // Isso previne que dados maliciosos (script) sejam executados
    const tds = tr.querySelectorAll("td");
    setText(tds[0], u.name);      // Adiciona o nome do usuário
    setText(tds[1], u.email);     // Adiciona o email do usuário
    tds[2].appendChild(statusBadge);  // Adiciona o badge de status

    // Configura os listeners dos botões de editar e ativar/inativar
    tr.querySelector('[data-action="edit"]').addEventListener("click", () => fillForm(u));
    tr.querySelector('[data-action="toggle"]').addEventListener("click", () => toggleStatus(u.id));

    // Adiciona a linha à tabela
    tbody.appendChild(tr);
  });
}

// ============================================================
// FUNÇÕES DE MANIPULAÇÃO DO FORMULÁRIO
// ============================================================

/**
 * Preenche o formulário com os dados de um usuário
 * Usado quando o usuário clica em "Editar"
 * 
 * @param {object} user - Objeto do usuário com dados
 */
function fillForm(user) {
  $("#userId").value = user.id;
  $("#name").value = user.name;
  $("#email").value = user.email;
  $("#profile").value = user.profile;
  $("#active").value = user.active ? "1" : "0";
  $("#password").value = "";  // Limpa o campo de senha
  $("#password").placeholder = "Deixe em branco para manter a senha";
}

/**
 * Limpa todos os campos do formulário
 * Prepara para criar um novo usuário
 */
function clearForm() {
  $("#userId").value = "";
  $("#name").value = "";
  $("#email").value = "";
  $("#profile").value = "USER";
  $("#active").value = "1";
  $("#password").value = "";
  $("#password").placeholder = "Senha (será criptografada no backend)";
}

/**
 * Alterna o status de um usuário (ATIVO <-> INATIVO)
 * Simula uma operação UPDATE no banco de dados
 * 
 * @param {string} id - ID do usuário
 */
function toggleStatus(id) {
  const idx = users.findIndex((u) => u.id === id);  // Encontra o usuário
  if (idx === -1) return;  // Se não encontrar, retorna
  users[idx].active = !users[idx].active;  // Inverte o status
  render(users);  // Atualiza a exibição
}



// ============================================================
// FUNÇÃO PRINCIPAL - Inicializa a página de usuários
// ============================================================

/**
 * Inicializa todos os eventos e dados da página de usuários
 * É chamada quando a página carrega
 */
export function initUsersPage() {
  // Captura os elementos HTML da página
  const form = $("#userForm");
  const alertEl = $("#alertUsers");
  const logoutBtn = $("#logoutBtn");
  const searchEl = $("#search");

  // Esconde alertas iniciais
  hideAlert(alertEl);

  // ===== CARREGAMENTO INICIAL =====
  // Carrega e exibe a lista de usuários armazenada
  const users = loadUsers();
  render(users);

  // ===== HANDLER: Formulário de Criar/Editar Usuário =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault();  // Previne reload
    hideAlert(alertEl);  // Limpa alertas anteriores

    // Captura os valores do formulário
    const id = $("#userId").value;
    const name = $("#name").value.trim();
    const email = $("#email").value.trim().toLowerCase();
    const profile = $("#profile").value;  // ADMIN ou USER
    const active = $("#active").value === "1";  // Converte para booleano
    const password = $("#password").value;

    // ===== VALIDAÇÕES =====
    // Valida o nome (mínimo 3 caracteres)
    if (name.length < 3) return showAlert(alertEl, "warn", "Nome deve ter pelo menos 3 caracteres.");
    // Valida o email (formato correto)
    if (!validateEmail(email)) return showAlert(alertEl, "warn", "E-mail inválido.");

    try {
      // ===== INTEGRAÇÃO COM BACKEND (Comentada para educação) =====
      // Quando o backend estiver pronto, descomente:
      // - CREATE: POST /api/users
      // - UPDATE: PUT /api/users/:id
      // Obs: a senha será criptografada no backend (bcrypt), não aqui.
      //
      await apiRequest("/api/users", { 
      method: "POST", 
      body: { name, email, profile, active, password } 
      });

      await apiRequest(`/api/users/${id}/status`, { 
      method: "PATCH", 
      body: { status: "INACTIVE" } 
      });

      if (err.status === 401 || err.status === 403) { 
      setToken(null); 
      window.location.href = "./login.html"; 
      } 
      if (err.status === 409) { 
      showAlert(alertEl, "err", "Já existe usuário com este e-mail."); 
      }

      // ===== SIMULAÇÃO LOCAL (Para fins educacionais) =====
      const list = loadUsers();
      // Verifica se já existe outro usuário com este email
      const exists = list.find((u) => u.email === email && u.id !== id);
      if (exists) throw new Error("Já existe usuário com este e-mail.");

      // Procura pelo índice do usuário (se estiver editando)
      const idx = list.findIndex((u) => u.id === id);
      if (idx >= 0) {
        // ATUALIZAÇÃO: Usuário já existe
        list[idx] = { ...list[idx], name, email, profile, active };
      } else {
        // CRIAÇÃO: Novo usuário
        list.push({ id, name, email, profile, active });
      }

      // Salva a lista atualizada
      saveUsers(list);
      // Recarrega a tabela
      render(list);
      // Limpa o formulário
      clearForm();
      // Mostra mensagem de sucesso
      showAlert(alertEl, "ok", "Usuário salvo com sucesso (simulação).");
    } catch (err) {
      // Se houve erro, mostra a mensagem
      showAlert(alertEl, "err", err.message);
    }
  });

  // ===== HANDLER: Botão Limpar =====
  // Limpa o formulário quando clicado
  $("#btnClear").addEventListener("click", (e) => {
    e.preventDefault();
    clearForm();
    hideAlert(alertEl);
  });

  // ===== HANDLER: Campo de Busca =====
  // Filtra a lista conforme o usuário digita
  searchEl.addEventListener("input", () => {
    const term = searchEl.value.trim().toLowerCase();
    const list = loadUsers();
    // Filtra usuários que contêm o termo no nome OU no email
    const filtered = list.filter((u) =>
      u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
    // Renderiza apenas os usuários filtrados
    render(filtered);
  });

  // ===== HANDLER: Botão Sair (Logout) =====
  // Remove o token e redireciona para login
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");  // Remove autenticação
    window.location.href = "./login.html";  // Redireciona para login
  });
}