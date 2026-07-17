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