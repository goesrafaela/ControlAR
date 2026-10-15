Documentação de Arquitetura e Decisões - ControlAr

1. Visão Geral

Este documento registra as principais decisões arquiteturais tomadas durante a construção e organização do back-end e da integração com o front-end do projeto ControlAr.

2. Por que separar o Front-End do Back-End?

O projeto foi estruturado separando a pasta server/ (back-end em Node.js e Express) da raiz do projeto (front-end com HTML, CSS e JavaScript).

Separação de Responsabilidades: O back-end lida com regras de negócio, conexão com o banco de dados MySQL e rotas da API. O front-end cuida exclusivamente da interface visual.

Organização: Fica muito mais fácil localizar erros ou modificar a interface sem interferir diretamente nas regras do servidor.

3. Por que dividimos as constantes em arquivos separados? (config.js vs constants.js)

Durante o desenvolvimento, separamos as configurações globais em dois mundos diferentes:

config.js (Raiz / Front-End): Fica visível para o navegador e armazena configurações globais do cliente, como a URL base da API (API_BASE_URL). Utiliza o padrão moderno de módulos (import/export).

constants.js (Dentro de server/src/ / Back-End): Fica protegido no servidor Node.js e centraliza mensagens de log, códigos de status HTTP e mensagens de resposta da API. Utiliza o padrão CommonJS (module.exports).

Motivo: O navegador e o servidor rodam em ambientes diferentes. Misturar esses códigos geraria conflitos de compatibilidade e bagunçaria a organização do projeto.

/---------/

###Decisão Arquitetural: Abordagem de Migração Híbrida (Front-End para Back-End REST API).

Estratégia adotada: Preservação das assinaturas de funções e contratos de variáveis globais (U_CLIENTS, U_ORDERS) no front-end.

Justificativa:

Evitar reescrita desnecessária de toda a camada de interface (index.html), mantendo o design e as regras de negócio visuais já validadas.

Substituir a fonte de dados estática/localStorage por chamadas assíncronas (fetch) aos endpoints desenvolvidos em Node.js (/api/clients, /api/users), que por sua vez consultam o banco de dados relacional MySQL.
