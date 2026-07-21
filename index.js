import 'dotenv/config';
import Fastify from 'fastify';
import { buscarFilme, buscarDetalhesFilme, extrairInformacoesFilme } from './services/tmdb.js';
import { buscarPagina, extrairTitulo, atualizarPaginaFilme, adicionarConteudoPagina, criarPaginaFilme } from './services/notion.js';
import { registrarRotaWebhook } from './services/webhooks.js';

const app = Fastify({ logger: true });

registrarRotaWebhook(app);

app.get('/', async () => ({ status: 'Servidor rodando!' }));

app.post('/filmes', async (request, reply) => {
  const { titulo } = request.body;

  if (!titulo) {
    return reply.status(400).send({ erro: 'Envie um "titulo" no corpo da requisição.' });
  }

  try {
    const filme = await buscarFilme(titulo);
    app.log.info({ filme }, 'Resultado da busca TMDB');

    if (!filme) {
      return reply.status(404).send({ erro: 'Filme não encontrado na TMDB.' });
    }

    const detalhes = await buscarDetalhesFilme(filme.id);
    const info = extrairInformacoesFilme(detalhes);

    const pagina = await criarPaginaFilme(filme);
    await adicionarConteudoPagina(pagina.id, detalhes.overview, info);

    return { mensagem: 'Página criada com sucesso!', pagina_id: pagina.id };
  } catch (erro) {
    app.log.error(erro);
    return reply.status(500).send({ erro: erro.message });
  }
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();