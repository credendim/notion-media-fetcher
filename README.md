# 🎬 Atualização de dados automática no Notion

Automação que transforma uma simples página do Notion em uma ficha completa de filme, usando dados da API do TMDB.

## 💡 Sobre o projeto

Este projeto nasceu da vontade de organizar uma lista de filmes para assistir no Notion. Depois de montar a base manualmente, percebi que poderia automatizar o preenchimento das informações usando a API do TMDB e os webhooks do Notion.

O fluxo é simples:

1. Você cria uma página em uma base de dados do Notion com o **título do filme**.
2. O Notion dispara um **webhook** avisando que a página foi criada.
3. O servidor recebe o evento, busca o filme na **API do TMDB** e atualiza a página automaticamente.

Tudo isso sem precisar mover um dedo depois de criar a página.

## ✨ Funcionalidades

A automação preenche automaticamente na página do Notion:

- 📌 Capa (poster do filme)
- 📝 Sinopse
- 🎭 Gêneros
- 🎬 Diretor (nome + link para o TMDB)
- ✍️ Roteirista (nome + link para o TMDB)
- 🎭 Os 5 primeiros atores do elenco (nome, foto, personagem e link para o TMDB)
- 📺 Onde assistir (logo dos streamings disponíveis)
- 🔞 Classificação indicativa
- 📅 Ano de lançamento
- ⏱️ Duração
- 🎞️ Trailer
- 🔗 Link da página do filme no TMDB

## 🛠️ Stack

- **[Node.js](https://nodejs.org/)** — runtime
- **[Fastify](https://fastify.dev/)** — framework web
- **[Notion API](https://developers.notion.com/guides/get-started/overview)** — Atomação do Notion
- **[TMDB API](https://www.themoviedb.org/documentation/api)** — dados de filmes

## 📋 Pré-requisitos

- Node.js 18+
- Uma conta e integração criada no [Notion Developers](https://www.notion.so/my-integrations)
- Uma chave de API do [TMDB](https://www.themoviedb.org/settings/api)
- Uma base de dados no Notion compartilhada com a integração

## 🗺️ Como funciona (fluxo detalhado)

1. **Criação da página** — você adiciona uma nova entrada na base de dados do Notion com o título do filme.
2. **Webhook** — o Notion notifica o servidor sobre o evento de criação de página.
3. **Busca no TMDB** — o servidor usa o título para buscar o filme correspondente na API do TMDB.
4. **Coleta de dados** — são obtidos detalhes do filme (créditos, provedores de streaming, trailer, etc.).
5. **Atualização da página** — os dados são formatados e enviados de volta para a página do Notion via API.

## 📌 Roadmap / Possíveis melhorias

- [ ] Suporte a séries de TV, além de filmes
- [ ] Tratamento de casos de título ambíguo (mais de um filme com o mesmo nome)
- [ ] Adicionar lista e busca de jogos
- [ ] Adicionar lista e busca de livros

---

Feito com 🍿 e um pouco de automação.
