# Força no Passo 👣

Treino de **força e equilíbrio de 5 minutos** para quem tem **60 anos ou mais**, em casa, com uma cadeira, uma toalha e um apoio firme. É grátis, não tem cadastro, tem voz, legendas e letras grandes, e funciona sem internet.

Ele usa o mesmo framework do [Força na Caneta](https://github.com/renanbonavita/forca-na-caneta). O passo a passo técnico está no `FRAMEWORK.md`.

## O que é diferente dos outros apps da família

| | Força no Passo |
|---|---|
| Objetivo | Autonomia e prevenção de quedas: levantar da cadeira, subir escada, carregar sacola, andar firme |
| Treino | 40 s de aquecimento + 4 × (35 s + 25 s de descanso) + 20 s = **5 min** |
| Grupos | Pernas, empurrar, costas e **equilíbrio**, que entra em todo treino e é sempre feito com apoio |
| Níveis | Primeiros passos (1–8), Passo firme (9–20), Passo forte (21+) |
| Acessibilidade | Letras 12% maiores (`escala_fonte`), voz mais lenta (`voz_velocidade`) |
| **Teste do mês** | Quantas vezes a pessoa senta e levanta em 30 s. Mostra a evolução (Sobre → Meu progresso) e gera números agregados por faixa para os parceiros |
| **Mandar para alguém** | Link no rodapé para o filho ou o neto mandar o app pelo WhatsApp |
| Responsáveis | Educador físico (CREF) **e** fisioterapeuta (CREFITO), no `config.json` |

## Publicar (GitHub Pages)

1. No repositório, abra **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**. Em **Branch**, escolha **main** e **/ (root)**, e clique em **Save**.
3. Em 1 a 3 minutos o app estará em **https://renanbonavita.github.io/forca-no-passo/**

Sempre que mudar algo, aumente a `VERSAO` no `sw.js`.

## O que preencher antes de lançar

No `config.json`:
- `responsavel_tecnico` (nome e CREF) e `responsavel_fisioterapia` (nome e CREFITO);
- `contato_email`;
- `analytics.goatcounter` (crie um código novo no GoatCounter, separado do Força na Caneta);
- `patrocinio` e `elastico`, ou deixe vazios;
- `mostrar_marcadores_de_lugar`: `false` no lançamento.

No `termos.html`: os marcadores `[DATA]`, `[RAZÃO SOCIAL / CNPJ]` e o contador usado.

No `clinicas.json`: troque a "Clínica Exemplo" pelos parceiros reais. O link de cada um é `https://renanbonavita.github.io/forca-no-passo/?c=ID`.

## Como ler os números (GoatCounter)

| Caminho | Significa |
|---|---|
| `evento/treino_concluido/<parceiro>/nivel-1` | Treinos concluídos por nível e parceiro |
| `evento/teste_concluido/<parceiro>/faixa-8-11` | Teste do mês por faixa: `0-7`, `8-11`, `12-15`, `16+` |
| `evento/compartilhar` | Pessoas que mandaram o app para alguém |

Para a **operadora de saúde ou o parceiro**, o relatório mensal mostra treinos concluídos, quantas pessoas chegaram aos níveis 2 e 3 e a distribuição das faixas do Teste do mês ao longo do tempo. Tudo agregado, nunca uma pessoa.

## Testes

```bash
npm test        # lógica, biblioteca de movimentos e contraste das cores
npm run e2e     # fluxo completo no navegador, incluindo Teste do mês e iPhone SE
```

O roteiro de testes no celular está no `TESTES.md`, e os vídeos e áudios a gravar estão no `ROTEIRO-GRAVACAO.md`.

## Checklist antes do lançamento

- [ ] Responsáveis técnicos (CREF e CREFITO) preenchidos e movimentos aprovados por eles
- [ ] Revisão jurídica do aviso e dos termos
- [ ] Busca no INPI de "Força no Passo" (classes 41 e 42)
- [ ] Código do GoatCounter
- [ ] `mostrar_marcadores_de_lugar: false` e clínica `demo` removida
- [ ] Testes do `TESTES.md` com **pessoas de 60+ de verdade**, em pelo menos 1 iPhone e 1 Android
