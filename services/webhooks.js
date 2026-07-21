import { buscarFilme, buscarDetalhesFilme, extrairInformacoesFilme } from './tmdb.js';
import { buscarPagina, extrairTitulo, atualizarPaginaFilme, adicionarConteudoPagina } from './notion.js';

const EVENTOS_ACEITOS = ['page.created', 'page.content_updated'];

export function registrarRotaWebhook(app) {
  app.post('/webhooks/notion', async (request, reply) => {
    const corpo = request.body;

    if (corpo.verification_token) {
      app.log.info(`Token de verificação recebido: ${corpo.verification_token}`);
      return reply.status(200).send({ recebido: true });
    }

    reply.status(200).send({ recebido: true });

    if (!EVENTOS_ACEITOS.includes(corpo.type)) {
      return;
    }

    const pageId = corpo.entity.id;

    try {
      const pagina = await buscarPagina(pageId);
      const titulo = extrairTitulo(pagina);

      if (!titulo) {
        app.log.info(`Página ${pageId} ainda sem título, aguardando próximo evento.`);
        return;
      }

      const jaProcessada = pagina.properties['Nota']?.number != null;
      if (jaProcessada) {
        app.log.info(`Página ${pageId} já foi enriquecida antes, ignorando.`);
        return;
      }

      app.log.info(`Buscando "${titulo}" na TMDB...`);
      const filme = await buscarFilme(titulo);

      if (!filme) {
        app.log.warn(`Nenhum filme encontrado na TMDB para "${titulo}".`);
        return;
      }

      const detalhes = await buscarDetalhesFilme(filme.id);
      const info = extrairInformacoesFilme(detalhes);

      await atualizarPaginaFilme(pageId, filme);
      await adicionarConteudoPagina(pageId, detalhes.overview, info);

      app.log.info(`Página ${pageId} atualizada com sucesso com dados de "${filme.title}".`);
    } catch (erro) {
      app.log.error(erro, `Erro ao processar webhook da página ${pageId}`);
    }
  });
}