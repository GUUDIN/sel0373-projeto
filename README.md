# Plataforma IoT Multi-Projetos (SEL0373)

## Visão Geral

Este projeto é uma plataforma web desenvolvida para a disciplina SEL0373, com o objetivo de integrar, monitorar e gerenciar múltiplos projetos IoT baseados em ESP32. A aplicação permite cadastro de usuários, seleção de projetos, comunicação bidirecional via MQTT, dashboards em tempo real e upload de arquivos. O sistema foi projetado para ser didático, modular e facilmente expansível.

---

## Funcionalidades Principais

- **Autenticação de Usuários:** Cadastro, login seguro (hash de senha com bcrypt), seleção de projeto.
- **Projeto 1 – Cadastro de Animais:**  
  - Cadastro e monitoramento de animais via RFID.
  - Visualização em tempo real dos dados recebidos via MQTT.
  - Histórico completo de registros.
- **Projeto 2 – Monitoramento Climático:**  
  - Recebimento de dados ambientais (temperatura, umidade, vento, localização) via MQTT.
  - Dashboard com métricas, gráfico dinâmico e mapa interativo (Leaflet).
  - Histórico dos últimos dados recebidos.
- **Envio de Arquivos:**  
  - Upload de arquivos para dispositivos IoT.
  - Notificação via MQTT após upload.
- **Interface Moderna:**  
  - Design responsivo inspirado em glassmorphism.
  - Experiência de usuário aprimorada com feedback visual e navegação intuitiva.

---

## Arquitetura e Tecnologias

- **Backend:** Node.js, Express, Socket.IO, MongoDB (Mongoose), MQTT (mqtt.js)
- **Frontend:** Pug (template engine), CSS modular (design-system.css, glassmorphism), JavaScript (Chart.js, Leaflet)
- **Comunicação em Tempo Real:**  
  - MQTT para integração com ESP32 e dispositivos IoT.
  - Socket.IO para atualização instantânea dos dashboards.
- **Gerenciamento de Sessão:** express-session + MongoStore

---

## Estrutura de Pastas

- `/routes` – Rotas Express para cada módulo (usuários, projetos, upload)
- `/models` – Modelos Mongoose para persistência dos dados
- `/views` – Templates Pug para renderização dinâmica das páginas
- `/public` – Arquivos estáticos (CSS, JS, imagens)
- `/config` – Configuração centralizada dos projetos
- `/components` – Componentes reutilizáveis (ex: configurações do usuário)

---

## Como Executar Localmente

1. **Pré-requisitos:**  
   - Node.js >= 16  
   - MongoDB em execução local ou remoto  
   - Acesso à internet para dependências externas (CDNs)

2. **Instalação:**  
   ```sh
   git clone https://github.com/seu-usuario/sel0373-projeto.git
   cd sel0373-projeto
   npm install
   ```

3. **Configuração:**  
   - Copie `.env.exemple` para `.env` e ajuste as variáveis (ex: `SESSION_SECRET`, conexão MongoDB).
   - Certifique-se de que o broker MQTT está acessível (por padrão: `mqtt://igbt.eesc.usp.br`).

4. **Execução:**  
   ```sh
   npm start
   ```
   O servidor estará disponível em [http://localhost:6005](http://localhost:6005).

---

## Fluxo de Uso

1. **Cadastro/Login:**  
   - Usuário acessa `/users/register` para criar conta e escolher o projeto.
   - Após login, é redirecionado para o dashboard do projeto selecionado.

2. **Projeto 1:**  
   - Cadastro de animais via formulário.
   - Dados de peso e status recebidos em tempo real via MQTT.
   - Histórico completo acessível.

3. **Projeto 2:**  
   - Dashboard exibe métricas ambientais, gráfico e mapa.
   - Dados recebidos via MQTT e exibidos instantaneamente.

4. **Envio de Arquivos:**  
   - Upload de arquivos via formulário.
   - Notificação MQTT enviada após upload.

---

## Pontos de Destaque para Avaliação

- **Código limpo, modular e comentado.**
- **Segurança:** Hash de senha, sessões protegidas.
- **Responsividade e acessibilidade.**
- **Comunicação em tempo real (MQTT + Socket.IO).**
- **Expansível para novos projetos IoT.**
- **Documentação clara e exemplos de uso.**

---

## Screenshots

> Adicione aqui prints das principais telas para facilitar a avaliação.

---

## Observações Finais

- O projeto foi desenvolvido visando clareza, organização e facilidade de manutenção.
- Qualquer dúvida, sugestão ou bug pode ser reportado via GitHub Issues.

---
