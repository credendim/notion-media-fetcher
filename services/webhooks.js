import { buscarFilme, buscarDetalhesFilme, extrairInformacoesFilme } from './tmdb.js';
import { buscarPagina, extrairTitulo, atualizarPaginaFilme, adicionarConteudoPagina } from './notion.js';

export function registrarRotaWebhook(app) {
  app.post('/webhooks/notion', async (request, reply) => {
    const corpo = request.body;

    if (corpo.verification_token) {
      app.log.info(`Token de verificação recebido: ${corpo.verification_token}`);
      return reply.status(200).send({ recebido: true });
    }

    // Responde rápido pro Notion, e processa o evento depois.
    reply.status(200).send({ recebido: true });

    if (corpo.type !== 'page.created') {
      return;
    }

    const pageId = corpo.entity.id;

    try {
      const pagina = await buscarPagina(pageId);
      const titulo = extrairTitulo(pagina);

      if (!titulo) {
        app.log.info(`Página ${pageId} criada sem título ainda, ignorando por enquanto.`);
        return;
      }

      app.log.info(`Buscando "${titulo}" na TMDB...`);
      const filme = await buscarFilme(titulo);

      if (!filme) {
        app.log.warn(`Nenhum filme encontrado na TMDB para "${titulo}".`);
        return;
      }

      await atualizarPaginaFilme(pageId, filme);
      app.log.info(`Página ${pageId} atualizada com sucesso com dados de "${filme.title}".`);
    } catch (erro) {
      app.log.error(erro, `Erro ao processar webhook da página ${pageId}`);
    }
  });
}