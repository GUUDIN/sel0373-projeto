const socket = io();

socket.on('pesoAtualizado', function(data) {
  const pesoSpan = document.getElementById(`peso-${data.identifier}`);
  const dataSpan = document.getElementById(`data-${data.identifier}`);
  const valorPeso = typeof data.peso === 'object' ? data.peso.peso : data.peso;
  const dataAtualizacao = typeof data.peso === 'object' 
    ? data.peso.dataAtualizacao 
    : new Date().toISOString();
  if (pesoSpan) pesoSpan.textContent = valorPeso;
  if (dataSpan) dataSpan.textContent = `Atualizado em: ${new Date(dataAtualizacao).toLocaleString("pt-BR")}`;
});

socket.on('novoRegistro', function(registro) {
  console.log("Novo registro recebido via socket:", registro);

  const animalsList = document.querySelector('.animals-list');

  const animalItem = document.createElement('div');
  animalItem.className = 'animal-item';
  animalItem.style.height = '170px';
  animalItem.style.display = 'flex';
  animalItem.style.flexDirection = 'column';
  animalItem.style.justifyContent = 'space-between';
  animalItem.style.padding = '0.75rem';

  animalItem.innerHTML = `
    <div class="animal-main">
      <div class="animal-id">${registro.identifier}</div>
      <div class="animal-status ${registro.allowed === 'sim' ? 'status-allowed' : 'status-denied'}">
        <div class="status-indicator"></div>
        <span class="status-text">${registro.allowed === 'sim' ? 'Permitido' : 'Negado'}</span>
      </div>
    </div>

    <div class="animal-details">
      <div class="detail-row">
        <span class="detail-label">Peso (kg):</span>
        <span class="detail-value" id="peso-${registro.identifier}">
          ${registro.peso || 'Não recebido'}
        </span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Atualizado em:</span>
        <span class="detail-value" id="data-${registro.identifier}">
          ${registro.data ? new Date(registro.data).toLocaleString("pt-BR") : 'Sem registro'}
        </span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Cadastrado por:</span>
        <span class="detail-value">${registro.registradoPor || ''}</span>
      </div>
    </div>

    <div class="animal-actions">
      <form action="/projeto1/delete/${registro.identifier}" method="POST" style="display: inline;">
        <button class="glass-button-danger delete-button" type="submit">Excluir</button>
      </form>
    </div>
  `;

  // Adiciona no topo da lista:
  animalsList.prepend(animalItem);
});


// Intercepta o envio do formulário e usa AJAX
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {
      identifier: formData.get("identifier"),
      allowed: formData.get("allowed"),
    };
    try {
      const res = await fetch("/projeto1/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) form.reset();
      else alert("Erro ao cadastrar");
    } catch {
      alert("Erro inesperado");
    }
  });
});

