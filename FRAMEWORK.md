# Framework de micro-treinos (Força na Caneta e família)

Este repositório é o **Força na Caneta**, mas o código serve para qualquer app da família, como o Força no Batente (pausa ativa) ou uma versão 60+. Cada produto vive no **próprio repositório** e no **próprio endereço**, copiando o motor e trocando só os arquivos de produto.

## O que é motor e o que é produto

| Tipo | Arquivos | Ao criar um produto novo |
|---|---|---|
| **Motor** (igual em todos) | `app.js`, `js/logica.js`, `sw.js`, `styles.css`, `termos.js`, `tools/`, `tests/` | Copiar sem mudar. Melhorias no motor são feitas aqui e copiadas para os outros |
| **Produto** (muda em cada um) | `config.json`, `exercicios.json`, `clinicas.json`, `index.html` (textos), `termos.html`, `manifest.json`, `icons/`, `img/`, `og-image.png`, `README.md`, `TESTES.md` | Reescrever para o produto |

## O bloco `produto` do `config.json`

```json
"produto": {
  "id": "fnc",                       // letras minúsculas, números e hífen; prefixo do armazenamento
  "nome": "Força na Caneta",
  "prefixo_codigo": "FNC",           // código de recuperação: FNC-15
  "prefixos_aceitos": ["DOSE"],      // prefixos antigos que continuam valendo
  "titulo_lembrete": "Treino Força na Caneta – 5 min",
  "descricao_lembrete": "Hora do treino de 5 minutos! ...",
  "lembretes_padrao": ["8:0"],       // um seletor por horário; ex.: ["10:0", "14:0", "16:0"]
  "duracao": { "aquecimento": 30, "exercicio": 40, "descanso": 20, "desaquecimento": 30,
               "descanso_final": true,   // false = sem descanso depois do último movimento
               "total_segundos": 300 },  // conferido pelos testes
  "niveis": [ { "nivel": 1, "nome": "Esquentando", "de": 1, "ate": 6 }, ... , { "nivel": 3, "nome": "...", "de": 16, "ate": null } ],
  "cores": { "principal": "#FF6B4A", "principal_hover": "#F45D3B", "principal_suave": "#FFF0EA",
             "acento": "#B23A1C", "texto_botao": "#2A1A14" }
}
```

- **`id` precisa ser diferente em cada produto.** Apps no mesmo domínio (ex.: `usuario.github.io/app-1` e `/app-2`) compartilham o armazenamento do navegador. O `id` separa as contagens. O service worker também separa os caches pelo endereço do app.
- **Cores:** confira o contraste. Se a cor principal for escura, use `"texto_botao": "#FFFFFF"`. Rode `node tests/contraste.mjs` com as cores novas.
- **Duração:** as falas programadas ("a seguir", "faltam 10 s", "troca de lado") tocam em momentos **proporcionais** à duração de cada etapa (`momentosDasFalas` em `js/logica.js`). Etapas curtas funcionam. Mesmo assim, deixe pelo menos **10 s de descanso** para dar tempo de trocar de posição.

## Opções extras do `produto` (desligadas por padrão)

| Opção | Exemplo | O que faz |
|---|---|---|
| `nomes_grupos` | `{ "extra": "Equilíbrio" }` | Troca o nome exibido de um grupo (Sobre, ilustrações, roteiro) |
| `escala_fonte` | `1.12` | Aumenta todo o texto em 12% (público 60+) |
| `voz_velocidade` | `0.9` | Voz do celular um pouco mais lenta (1 = normal) |
| `compartilhar` | `true` | Link "Mandar para alguém" no rodapé (compartilhamento do celular ou WhatsApp). Texto em `textos.compartilhar_texto` |
| `teste` | `{ "ativo": true, "segundos": 30, "intervalo_dias": 30 }` | **Teste do mês**: tela `#teste` (sentar e levantar em 30 s, a pessoa informa quantas vezes), histórico em Sobre → Meu progresso (`#sobre/progresso`) e evento `teste_concluido` com a **faixa** do resultado (nunca o número exato). Textos: `teste_chamada`, `teste_instrucao`, `teste_seguranca`, `teste_pergunta` |

## O bloco `textos` (gênero e vocabulário)

`rotulo_sessao` ("Treino" ou "Pausa"), `bora_sub`, `requisitos_inicio`, `segundo_do_dia`, `varios_no_dia` (use `{n}`), `titulo_fim` (use `{rotulo}` e `{n}`), `confirmar_encerrar`, `aquecimento_descricao`, `ultimo_descanso_descricao`, `desaquecimento_descricao`. O que não vier no `config.json` usa o padrão do Força na Caneta.

## Exercícios

O formato é o mesmo de sempre. Para objetos, use **`usa_objeto: true`** e a lista **`frases_objeto`** no `config.json` (garrafa, elástico...). O campo antigo `usa_toalha` e a lista `frases_toalha` continuam funcionando.

## Passo a passo para um produto novo

1. Crie o repositório no GitHub (ex.: `forca-no-batente`).
2. Copie **todo** este repositório para lá.
3. Troque os arquivos de produto (tabela acima). No `index.html`, revise todos os textos (aviso, Sobre, perguntas frequentes), as meta tags, o JSON-LD e o `canonical`.
4. Gere ícones, ilustrações, prévia e roteiro: `node tools/gerar-icones.mjs`, `node tools/gerar-placeholders.mjs`, `node tools/gerar-og.mjs`, `node tools/gerar-roteiro.mjs`.
5. Rode `npm test` e `npm run e2e`. Os dois são genéricos e leem os textos e a duração do `config.json` do produto. Se o produto tiver Teste do mês ou "Mandar para alguém", o e2e testa isso também.
6. Publique no GitHub Pages.
