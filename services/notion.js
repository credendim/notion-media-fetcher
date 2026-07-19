function montarPropriedadesFilme(filme) {
  const capaUrl = filme.backdrop_path
    ? `https://image.tmdb.org/t/p/w500${filme.backdrop_path}`
    : undefined;

  return {
    cover: capaUrl ? { type: 'external', external: { url: capaUrl } } : undefined,
    properties: {
      'Título': {
        title: [{ text: { content: filme.title } }],
      },
      'Categoria': {
        select: { name: 'Filme' },
      },
      'Sinopse': {
        rich_text: [{ text: { content: (filme.overview || '').slice(0, 2000) } }],
      },
      'Ano': {
        number: filme.release_date ? Number(filme.release_date.slice(0, 4)) : null,
      },
      'Nota': {
        number: filme.vote_average ?? null,
      },
      'Status enriquecido': {
        checkbox: true,
      },
    },
  };
}

export async function criarPaginaFilme(filme) {
  const { cover, properties } = montarPropriedadesFilme(filme);

  const resposta = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      ...(cover && { cover }),
      properties,
    }),
  });

  if (!resposta.ok) {
    const erro = await resposta.text();
    throw new Error(`Erro ao criar página no Notion: ${resposta.status} - ${erro}`);
  }

  return resposta.json();
}

export async function atualizarPaginaFilme(pageId, filme) {
  const { cover, properties } = montarPropriedadesFilme(filme);

  const resposta = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...(cover && { cover }),
      properties,
    }),
  });

  if (!resposta.ok) {
    const erro = await resposta.text();
    throw new Error(`Erro ao atualizar página no Notion: ${resposta.status} - ${erro}`);
  }

  return resposta.json();
}

export async function buscarPagina(pageId) {
  const resposta = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
    },
  });

  if (!resposta.ok) {
    const erro = await resposta.text();
    throw new Error(`Erro ao buscar página no Notion: ${resposta.status} - ${erro}`);
  }

  return resposta.json();
}

export function extrairTitulo(pagina) {
  const tituloProp = pagina.properties['Título'];
  return tituloProp?.title?.[0]?.plain_text ?? '';
}

function montarBlocosFilme(detalhes) {
  const blocos = [
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ text: { content: 'Sinopse' } }],
      },
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ text: { content: detalhes.overview || 'Sem sinopse disponível.' } }],
      },
    },
  ];

  if (detalhes.genres && detalhes.genres.length > 0) {
    blocos.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ text: { content: 'Gêneros' } }],
      },
    });

    for (const genero of detalhes.genres) {
      blocos.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ text: { content: genero.name } }],
        },
      });
    }
  }

  return blocos;
}

export async function adicionarConteudoPagina(pageId, detalhes) {
  const blocos = montarBlocosFilme(detalhes);

  const resposta = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ children: blocos }),
  });

  if (!resposta.ok) {
    const erro = await resposta.text();
    throw new Error(`Erro ao adicionar conteúdo na página: ${resposta.status} - ${erro}`);
  }

  return resposta.json();
}