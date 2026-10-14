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

4. Por que é importante documentar essas mudanças durante a criação do back-end?

Documentar o projeto enquanto ele está sendo construído traz benefícios fundamentais:

Base para a Apresentação Acadêmica (PI 2): Facilita a explicação clara do código para professores e avaliadores, demonstrando que a aplicação foi desenvolvida com padrões profissionais de mercado (Clean Code e Separation of Concerns).

Facilidade de Manutenção: Se você precisar alterar a porta do servidor, a URL da API ou uma mensagem de erro daqui a algumas semanas, saberá exatamente em qual arquivo centralizado precisa mexer.

Escalabilidade: Qualquer nova tela ou nova rota criada no futuro seguirá o mesmo padrão estruturado, mantendo o projeto limpo e coeso.