// ======================
// CONFIGURAÇÃO
// ======================
const API_URL = "SUA_URL_DO_WEB_APP_AQUI"; // <<< COLE SUA URL AQUI
let usuarioEmail = null;
let data = [];

let barChart, pieChart;

// ======================
// LOGIN GOOGLE
// ======================
window.onload = () => {
    google.accounts.id.initialize({
        client_id: "1015249953134-nn3vc5i8buuutooscniu90r2tet1596m.apps.googleusercontent.com",
        callback: handleLogin
    });

    google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "filled_blue", size: "large" }
    );
};

function handleLogin(response) {
    const payload = JSON.parse(atob(response.credential.split(".")[1]));
    usuarioEmail = payload.email;

    document.getElementById("loginArea").style.display = "none";
    document.getElementById("app").style.display = "block";

    carregarDados();
}

// ======================
// CARREGAR DADOS DO USUÁRIO
// ======================
async function carregarDados() {
    const r = await fetch(`${API_URL}?email=${usuarioEmail}`);
    const json = await r.json();

    data = json.data.slice(1).map(row => ({
        usuario: row[0],
        nome: row[1],
        qtd: Number(row[2]),
        meta: Number(row[3]),
        tempo: Number(row[4]),
        eficiencia: Number(row[5])
    }));

    atualizarTabela();
}

// ======================
// SALVAR NO SHEETS
// ======================
async function salvarNoSheets(item) {
    item.usuario = usuarioEmail;

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            acao: "add",
            ...item
        })
    });

    carregarDados();
}

// ======================
// REMOVER
// ======================
async function remover(index) {
    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            acao: "delete",
            index
        })
    });

    carregarDados();
}

// ======================
// LIMPAR TODOS
// ======================
async function limparTudo() {
    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            acao: "clear",
            usuario: usuarioEmail
        })
    });

    carregarDados();
}

// ======================
// ATUALIZAR INTERFACE
// ======================
function atualizarTabela() {
    const table = document.getElementById("tableBody");
    table.innerHTML = "";

    data.forEach((item, index) => {
        table.innerHTML += `
        <tr>
           <td>${item.nome}</td>
           <td>${item.qtd}</td>
           <td>${item.meta}</td>
           <td>${item.eficiencia.toFixed(1)}%</td>
           <td>${item.tempo} min</td>
           <td><button class="danger" onclick="remover(${index})">Excluir</button></td>
        </tr>
        `;
    });

    atualizarDashboard();
}

// ======================
// ADICIONAR ATIVIDADE
// ======================
document.getElementById("addBtn").onclick = () => {
    const nome = atividade.value;
    const qtd = Number(quantidade.value);
    const metaVal = Number(meta.value);
    const tempoVal = Number(tempo.value);

    if (!nome || !qtd || !metaVal || !tempoVal)
        return alert("Preencha tudo!");

    const eficiencia = (qtd / metaVal) * 100;

    salvarNoSheets({ nome, qtd, meta: metaVal, tempo: tempoVal, eficiencia });
};

// ======================
// DASHBOARD
// ======================
function atualizarDashboard() {
    const total = data.reduce((s, x) => s + x.eficiencia, 0) / (data.length || 1);

    totalEff.innerText = total.toFixed(1) + "%";
    progressFill.style.width = total + "%";

    atualizarGraficos();
}

// ======================
// GRÁFICOS
// ======================
function atualizarGraficos() {
    const labels = data.map(x => x.nome);
    const producao = data.map(x => x.qtd);

    if (barChart) barChart.destroy();
    if (pieChart) pieChart.destroy();

    barChart = new Chart(barChartEl, {
        type: "bar",
        data: { labels, datasets: [{ data: producao, label: "Produção" }] }
    });

    pieChart = new Chart(pieChartEl, {
        type: "pie",
        data: { labels, datasets: [{ data: producao }] }
    });
}

// ======================
// LIMPAR
// ======================
document.getElementById("clearBtn").onclick = () => {
    if (confirm("Limpar tudo?")) limparTudo();
};
