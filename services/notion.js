// ---------- Blocos "construtores" ----------

function textoRico(conteudo, link) {
  return {
    text: {
      content: conteudo,
      ...(link && { link: { url: link } }),
    },
  };
}

function formatarLista(itens) {
  if (itens.length === 0) return '';
  if (itens.length === 1) return itens[0];

  const todosMenosUltimo = itens.slice(0, -1).join(', ');
  const ultimo = itens[itens.length - 1];
  return `${todosMenosUltimo} e ${ultimo}`;
}

function headingBlock(nivel, texto, link) {
  const tipo = `heading_${nivel}`; // 2, 3 ou 4
  return {
    object: 'block',
    type: tipo,
    [tipo]: { rich_text: [textoRico(texto, link)] },
  };
}

function divider(){
  return {
    object: 'block',
    type: 'divider',
    "divider": {},
  }
}

function paragraphBlock(texto, link) {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: [textoRico(texto, link)] },
  };
}

function calloutComFilhos(icon, cor, tituloCallout, filhos) {
  return {
    object: 'block',
    type: 'callout',
    callout: {
      rich_text: [textoRico(tituloCallout)],
      icon: { type: 'icon', icon: {name: icon}},
      color: 'gray_background',
      children: filhos,
    },
  };
}

function imageBlock(url) {
  return {
    object: 'block',
    type: 'image',
    image: {
      type: 'external',
      external: { url }
    },
  };
}

function videoBlock(url) {
  return {
    object: 'block',
    type: 'video',
    video: { type: 'external', external: { url } },
  };
}

function bookmarkBlock(url) {
  return {
    object: 'block',
    type: 'bookmark',
    bookmark: { url },
  };
}

function columnListBlock(colunas) {
  return {
    object: 'block',
    type: 'column_list',
    column_list: {
      children: colunas.map((coluna) => {
        const blocos = Array.isArray(coluna) ? coluna : coluna.blocos;
        const largura = Array.isArray(coluna) ? undefined : coluna.largura;

        return {
          object: 'block',
          type: 'column',
          column: {
            children: blocos,
            ...(largura !== undefined && { width_ratio: largura }),
          },
        };
      }),
    },
  };
}

// ---------- Propriedades e visual da página (Título, Nota, capa, ícone) ----------

function montarPropriedadesFilme(filme) {
  const capaUrl = filme.backdrop_path
    ? `https://image.tmdb.org/t/p/w500${filme.backdrop_path}`
    : undefined;

  return {
    icon: { type: 'emoji', emoji: '🎬' },
    cover: capaUrl ? { type: 'external', external: { url: capaUrl } } : undefined,
    properties: {
      'Titulo': { title: [{ text: { content: filme.title } }] },
      'Nota': { number: filme.vote_average ?? null },
    },
  };
}

// ---------- Conteúdo da página (blocos) ----------

function montarBlocosFilme(overview, info) {
  const blocos = [];

  const fatosRapidos = [];

  blocos.push(headingBlock(2, 'Sobre o filme:'));

  const colunaCapa = [
    headingBlock(3, 'Capa:'),
    info.capaPath
      ? imageBlock(`https://image.tmdb.org/t/p/w300${info.capaPath}`)
      : paragraphBlock('Capa não disponível'),
  ];
  const CalloutSinopse = [];
  CalloutSinopse.push(headingBlock(3, 'Sinopse:'));
  CalloutSinopse.push(paragraphBlock(overview || 'Sem sinopse disponível.'));
  if (info.diretor) {
    CalloutSinopse.push(headingBlock(3, 'Diretor:'));
    CalloutSinopse.push(paragraphBlock(info.diretor.nome, info.diretor.tmdbUrl));
  }
  if (info.roteirista) {
    CalloutSinopse.push(headingBlock(3, 'Roteirista:'));
    CalloutSinopse.push(paragraphBlock(info.roteirista.nome, info.roteirista.tmdbUrl));
  }
  const colunaSinopse = [
    calloutComFilhos('description', 'gray_background', '', CalloutSinopse)
  ];
  blocos.push(columnListBlock([{blocos: colunaCapa, largura: 0.30}, {blocos: colunaSinopse, largura: 0.70}]));

  blocos.push(divider());

  blocos.push(headingBlock(2, 'Informações:'));
  const ondeAssistir = [
    headingBlock(3, 'Onde assistir:'),
    info.ondeAssistir?.logoUrl
      ? imageBlock(info.ondeAssistir.logoUrl)
      : paragraphBlock('Não disponível'),
  ];
  console.log('Valor da certificação:', JSON.stringify(info.classificacaoIndicativa));
  const ICONES_CLASSIFICACAO = {
    'L': 'https://raw.githubusercontent.com/credendim/notion-media-fetcher/main/src/img/L.png',
    '10': 'https://raw.githubusercontent.com/credendim/notion-media-fetcher/main/src/img/10.png',
    '12': 'https://raw.githubusercontent.com/credendim/notion-media-fetcher/main/src/img/12.png',
    '14': 'https://raw.githubusercontent.com/credendim/notion-media-fetcher/main/src/img/14.png',
    '16': 'https://raw.githubusercontent.com/credendim/notion-media-fetcher/main/src/img/16.png',
    '18': 'https://raw.githubusercontent.com/credendim/notion-media-fetcher/main/src/img/18.png',
  };
  const urlClassificacao = ICONES_CLASSIFICACAO[info.classificacaoIndicativa];
  const classificação = [
    headingBlock(3, 'Classificação:'),
    urlClassificacao ? imageBlock(urlClassificacao) : paragraphBlock(info.classificacaoIndicativa || 'Não informado'),
  ];
  const calloutLancamento = [];
  calloutLancamento.push(paragraphBlock(`${info.lancamento}`))
  const lancamento = [
    headingBlock(3, 'Lançamento:'),
    calloutComFilhos('calendar', 'gray_background', '', calloutLancamento)
  ];
  const calloutDuracao = [];
  calloutDuracao.push(paragraphBlock(`${info.duracao === 'Indefinido' ? info.duracao : info.duracao + ' min'}`))
  const duracao = [
    headingBlock(3, 'Duração:'),
    calloutComFilhos('alarm clock', 'gray_background', '', calloutDuracao)
  ];

  blocos.push(columnListBlock([{blocos: ondeAssistir, largura: 0.20}, {blocos: classificação, largura: 0.20}, {blocos: lancamento, largura: 0.30}, {blocos: duracao, largura: 0.30}]));

  if (info.generos.length > 0) {
    blocos.push(headingBlock(2, 'Gêneros'));
    blocos.push(paragraphBlock(formatarLista(info.generos)));
  } else {
    blocos.push(headingBlock(2, 'Gêneros'));
    blocos.push(paragraphBlock('Não informado'));
  };

  const primeiroAtor = info.atores[0];
  const segundoAtor = info.atores[1];
  const terceiroAtor = info.atores[2];
  const quartoAtor = info.atores[3];
  const quintoAtor = info.atores[4];

  const blocosPrimeiroAtor = [];
  if (primeiroAtor) {
    if (primeiroAtor.fotoUrl) {
      blocosPrimeiroAtor.push(imageBlock(primeiroAtor.fotoUrl));
    } else {
      blocosPrimeiroAtor.push(paragraphBlock('Foto não disponível'));
    }
    blocosPrimeiroAtor.push(headingBlock(4, primeiroAtor.nome, primeiroAtor.tmdbUrl));
    blocosPrimeiroAtor.push(paragraphBlock(`${primeiroAtor.personagem || 'Não informado'}`));
  }

  const blocosSegundoAtor = [];
  if (segundoAtor) {
    if (segundoAtor.fotoUrl) {
      blocosSegundoAtor.push(imageBlock(segundoAtor.fotoUrl));
    } else {
      blocosSegundoAtor.push(paragraphBlock('Foto não disponível'));
    }
    blocosSegundoAtor.push(headingBlock(4, segundoAtor.nome, segundoAtor.tmdbUrl));
    blocosSegundoAtor.push(paragraphBlock(`${segundoAtor.personagem || 'Não informado'}`));
  }

  const blocosTerceiroAtor = [];
  if (terceiroAtor) {
    if (terceiroAtor.fotoUrl) {
      blocosTerceiroAtor.push(imageBlock(terceiroAtor.fotoUrl));
    } else {
      blocosTerceiroAtor.push(paragraphBlock('Foto não disponível'));
    }
    blocosTerceiroAtor.push(headingBlock(4, terceiroAtor.nome, terceiroAtor.tmdbUrl));
    blocosTerceiroAtor.push(paragraphBlock(`${terceiroAtor.personagem || 'Não informado'}`));
  }

  const blocosQuartoAtor = [];
  if (quartoAtor) {
    if (quartoAtor.fotoUrl) {
      blocosQuartoAtor.push(imageBlock(quartoAtor.fotoUrl));
    } else { 
      blocosQuartoAtor.push(paragraphBlock('Foto não disponível'));
    }
    blocosQuartoAtor.push(headingBlock(4, quartoAtor.nome, quartoAtor.tmdbUrl));
    blocosQuartoAtor.push(paragraphBlock(`${quartoAtor.personagem || 'Não informado'}`));
  }

  const blocosQuintoAtor = [];
  if (quintoAtor) {
    if (quintoAtor.fotoUrl) {
      blocosQuintoAtor.push(imageBlock(quintoAtor.fotoUrl));
    } else {
      blocosQuintoAtor.push(paragraphBlock('Foto não disponível'));
    }
    blocosQuintoAtor.push(headingBlock(4, quintoAtor.nome, quintoAtor.tmdbUrl));
    blocosQuintoAtor.push(paragraphBlock(`${quintoAtor.personagem || 'Não informado'}`));
  }

  blocos.push(columnListBlock([blocosPrimeiroAtor, blocosSegundoAtor, blocosTerceiroAtor, blocosQuartoAtor, blocosQuintoAtor]));

  const calloutTrailer = [];
  if (info.trailerUrl) {
    calloutTrailer.push(headingBlock(2, 'Trailer:'));
    calloutTrailer.push(videoBlock(info.trailerUrl));
  } else {
    calloutTrailer.push(headingBlock(2, 'Trailer:'));
    calloutTrailer.push(paragraphBlock('Trailer não disponível'));
  }

  blocos.push(calloutComFilhos('playback play button', 'gray_background', '', calloutTrailer));

  blocos.push(headingBlock(2, 'Mais informações em: '));
  blocos.push(bookmarkBlock(info.tmdbUrl));

  return blocos;
}

// ---------- Funções que chamam a API do Notion ----------

export async function criarPaginaFilme(filme) {
  const { icon, cover, properties } = montarPropriedadesFilme(filme);

  const resposta = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      icon,
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
  const { icon, cover, properties } = montarPropriedadesFilme(filme);

  const resposta = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      icon,
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

export async function adicionarConteudoPagina(pageId, overview, info) {
  const blocos = montarBlocosFilme(overview, info);

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
  const tituloProp = pagina.properties['Titulo'];
  return tituloProp?.title?.[0]?.plain_text ?? '';
}