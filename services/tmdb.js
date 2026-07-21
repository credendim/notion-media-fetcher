export async function buscarFilme(titulo) {
  const url = new URL('https://api.themoviedb.org/3/search/movie');
  url.searchParams.set('query', titulo);
  url.searchParams.set('language', 'pt-BR');

  const resposta = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
    },
  });

  if (!resposta.ok) {
    throw new Error(`Erro ao buscar na TMDB: ${resposta.status}`);
  }

  const dados = await resposta.json();
  return dados.results[0] ?? null; // pega o primeiro resultado da busca
}

export async function buscarDetalhesFilme(id) {
  const url = `https://api.themoviedb.org/3/movie/${id}?language=pt-BR&append_to_response=credits,videos,watch/providers,release_dates`;

  const resposta = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
    },
  });

  if (!resposta.ok) {
    throw new Error(`Erro ao buscar detalhes na TMDB: ${resposta.status}`);
  }

  return resposta.json();
}

function gerarSlug(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos (ex: "ã" vira "a")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')     // troca espaços/símbolos por hífen
    .replace(/(^-|-$)/g, '');        // remove hífen sobrando no início/fim
}

function formatarData(dataIso) {
  if (!dataIso) return null;
  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function extrairInformacoesFilme(detalhes) {
  const diretorCru = (detalhes.credits?.crew || []).find((p) => p.job === 'Director');

  const roteiristaCru = (detalhes.credits?.crew || [])
    .find((p) => ['Screenplay', 'Writer', 'Story'].includes(p.job));

  const atores = (detalhes.credits?.cast || []).slice(0, 5).map((pessoa) => ({
    nome: pessoa.name,
    personagem: pessoa.character,
    tmdbUrl: `https://www.themoviedb.org/person/${pessoa.id}`,
    fotoUrl: pessoa.profile_path ? `https://image.tmdb.org/t/p/w200${pessoa.profile_path}` : null,
  }));

  const trailer = (detalhes.videos?.results || [])
    .find((video) => video.type === 'Trailer' && video.site === 'YouTube');

  const provedoresBR = detalhes['watch/providers']?.results?.BR;
  const primeiroProvedor =
    provedoresBR?.flatrate?.[0] || provedoresBR?.rent?.[0] || provedoresBR?.buy?.[0];

  const paisBR = (detalhes.release_dates?.results || []).find((p) => p.iso_3166_1 === 'BR');
  const certificacao = paisBR?.release_dates?.find((r) => r.certification)?.certification;

  return {
    diretor: diretorCru
      ? { nome: diretorCru.name, tmdbUrl: `https://www.themoviedb.org/person/${diretorCru.id}` }
      : null,
    roteirista: roteiristaCru
      ? { nome: roteiristaCru.name, tmdbUrl: `https://www.themoviedb.org/person/${roteiristaCru.id}` }
      : null,
    ondeAssistir: primeiroProvedor
      ? {
          nome: primeiroProvedor.provider_name,
          logoUrl: `https://image.tmdb.org/t/p/w200${primeiroProvedor.logo_path}`,
          link: provedoresBR?.link || null,
        }
      : null,
    classificacaoIndicativa: certificacao || 'Não informado',
    lancamento: formatarData(detalhes.release_date) || 'Indefinido',
    duracao: detalhes.runtime || 'Indefinido',
    generos: (detalhes.genres || []).map((g) => g.name),
    atores,
    capaPath: detalhes.poster_path || null,
    trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
    tmdbUrl: `https://www.themoviedb.org/movie/${detalhes.id}-${gerarSlug(detalhes.original_title)}`,
  };
}