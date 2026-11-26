# Roteiro de testes manuais (Força no Passo, 60+)

> **Importante:** faça estes testes com pelo menos 3 pessoas de 60 anos ou mais, de preferência sem você ajudando. Observe onde elas travam.

## Específico do público 60+
- [ ] A pessoa entende o que fazer na primeira tela sem ajuda.
- [ ] As letras estão confortáveis de ler sem óculos de perto (ou com os óculos que ela usa).
- [ ] A voz está clara e na velocidade certa (nem rápida, nem arrastada).
- [ ] Ela consegue fazer os movimentos de equilíbrio **sempre com uma mão no apoio**.
- [ ] Teste do mês: ela entende a contagem e consegue informar o número com os botões − e +.
- [ ] "Mandar para alguém" abre o WhatsApp (ou o compartilhar) com o texto e o link.
- [ ] Com a fonte do celular no máximo, nada fica cortado.

Os testes automáticos (`npm test` e `npm run e2e`) já conferem: duração de 300 s, sorteio, biblioteca, .ics, código de recuperação, modo clínica, offline, contraste e o fluxo completo em iPhone simulado. **O que só dá para ver no aparelho de verdade** está abaixo. Marque ✅ ou anote o problema.

Antes de testar, abra uma vez `SEU-SITE/?c=demo` para ligar o modo clínica.

## iPhone — Safari
- [ ] Aviso aparece na primeira vez; "Termos de uso" abre e volta.
- [ ] BORA: a **voz fala em português** logo no aquecimento (volume ligado, chave lateral sem o modo silencioso).
- [ ] Legendas aparecem em todas as falas.
- [ ] Bipes nos últimos 3 segundos de cada etapa.
- [ ] **Tela não apaga** durante os 5 minutos (iOS 16.4+). Em versão antiga, aparece "Mantenha a tela ligada".
- [ ] Sair do Safari no meio: o treino **pausa** e continua ao voltar.
- [ ] Pausar, Pular e Versão mais fácil funcionam.
- [ ] Tela final: confete (some com "Reduzir animações" ligado).
- [ ] Rodapé "Lembretes" → escolher horário → "Adicionar à agenda" → abre o Calendário → evento de seg a sex, 5 min.
- [ ] Durante o treino, o gesto/botão **voltar** do celular pergunta se quer encerrar.
- [ ] Legenda e botões ficam sempre visíveis na parte de baixo do treino, sem rolar.

## iPhone — tela de início
- [ ] "Usar sem internet" (topo) abre os passos; seguir os passos instala o ícone **Força no Passo**.
- [ ] Dentro do app instalado, "Usar sem internet" **não** aparece.
- [ ] Abrir pelo ícone: abre sem a barra do Safari.
- [ ] A contagem começou do zero? Se sim, usar "Meu código" (anotado antes) e restaurar.
- [ ] Modo avião + abrir pelo ícone: **funciona offline** e faz um treino completo.

## iPhone — navegadores internos
- [ ] Enviar o link no **WhatsApp** e abrir: o app funciona; "Usar sem internet" orienta abrir no Safari.
- [ ] Abrir o link pela bio/direct do **Instagram**: aparece "Você está no navegador interno do Instagram".

## Android — Chrome
- [ ] Voz em português, legendas e bipes.
- [ ] "Usar sem internet" abre o **pedido de instalação** do Chrome; o ícone aparece.
- [ ] Tela não apaga durante o treino.
- [ ] Offline funciona depois de instalado.
- [ ] "Lembretes" → "Usar o Google Agenda" cria o evento recorrente.

## Código de recuperação
- [ ] Fazer 2 treinos → rodapé "Meu código" mostra FNP-2 → "Copiar link".
- [ ] Abrir o link em outra aba anônima → abre "Meu código" perguntando "Restaurar para o treino 2?" → Sim → Voltar → mostra "Treino nº 3".

## Acessibilidade
- [ ] **VoiceOver** (iPhone: Ajustes → Acessibilidade) lê os botões e as legendas.
- [ ] **TalkBack** (Android) idem.
- [ ] Com a fonte do sistema aumentada, nada fica cortado.
- [ ] Sobre → "Voz e animações": desligar a voz deixa só as legendas; "Reduzir animações" tira o confete.
- [ ] iPhone SE (ou tela pequena): a tela inicial cabe sem rolar.

## Contador de acessos (depois de ligar o GoatCounter)
- [ ] Fazer 1 treino pelo link `?c=demo` → em até 1 minuto aparece `evento/treino_concluido/demo/nivel-1` no painel.
