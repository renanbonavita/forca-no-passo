# Roteiro de gravação — Força no Passo

> Arquivo gerado por `node tools/gerar-roteiro.mjs`. Se mudar exercícios ou frases, gere de novo.

## Padrão técnico

**Vídeos (24):** MP4 (H.264), vertical ou 4:3, 720p, **6 a 10 segundos em loop perfeito** (o fim emenda no começo), **sem som**, até 1,5 MB cada. Sala ou cozinha de casa, fundo claro e liso, luz natural. Cadeira firme **com o encosto encostado na parede**, bancada da pia ou encosto sempre ao alcance, toalha visível. Piso seco, sem tapete solto. Pessoas reais de 60 a 80 anos, de gêneros e corpos variados, com roupa confortável e calçado fechado. Nos movimentos de equilíbrio, a mão **sempre** no apoio. Mostre 2 ou 3 repetições em ritmo controlado. Grave também 1 repetição da **versão mais fácil** (opcional, para uma versão futura).

**Áudios:** MP3 mono, 64–96 kbps, voz calma, clara e acolhedora, um pouco mais lenta, sem tom infantil (sempre a mesma pessoa), **sem trilha**, 0,2 s de silêncio no começo e no fim. Normalize para −16 LUFS. O nome do arquivo tem que ser **exatamente** o indicado.

Depois de gravar: coloque os vídeos em `videos/` e os áudios em `audio/`, mude `"usar_videos": true` e `"usar_mp3": true` no `config.json` e aumente a `VERSAO` no `sw.js`.

## 1. Vídeos dos movimentos

| # | Arquivo | Movimento | Grupo | O que mostrar | Atenção na gravação |
|---|---|---|---|---|---|
| 1 | `videos/s1-levantar-sentar-apoio.mp4` | **Levantar e sentar com apoio das mãos** (nível 1 · Primeiros passos) | Pernas | Na beirada da cadeira, pés firmes e afastados. Incline o tronco à frente, apoie as mãos nas coxas e fique em pé devagar. Sente de novo com calma, sem se jogar. | Cadeira firme, sem rodinhas, encostada na parede. Levante sempre devagar. Se sentir tontura, fique na cadeira e respire. |
| 2 | `videos/s1-extensao-joelho.mp4` | **Extensão de joelho na cadeira** (nível 1 · Primeiros passos) | Pernas | Na cadeira, costas no encosto, segure as laterais do assento. Estique uma perna até ficar reta, segure 2 segundos e desça devagar. Alterne. | Costas apoiadas. Não trave o joelho com força. |
| 3 | `videos/s1-flexao-parede.mp4` | **Flexão na parede** (nível 1 · Primeiros passos) | Empurrar | Em pé, de frente para a parede, a um braço de distância. Mãos na parede na altura do peito. Dobre os cotovelos aproximando o peito da parede e empurre de volta. | Piso que não escorrega. Corpo em linha reta, sem prender a respiração. |
| 4 | `videos/s1-empurrar-ar.mp4` | **Empurrar à frente, na cadeira** (nível 1 · Primeiros passos) | Empurrar | Na cadeira, costas retas, mãos fechadas na altura do peito. Empurre um braço à frente devagar, volte e troque, como quem empurra uma porta pesada. | Movimento lento e firme. Ombros longe das orelhas. |
| 5 | `videos/s1-ombros-tras.mp4` | **Ombros para trás, na cadeira** (nível 1 · Primeiros passos) | Costas | Na cadeira, braços dobrados ao lado do corpo. Leve os cotovelos para trás aproximando as escápulas, segure 2 segundos e solte. | Pescoço relaxado, sem prender a respiração. |
| 6 | `videos/s1-remada-toalha.mp4` | **Remada com toalha, na cadeira** (nível 1 · Primeiros passos) | Costas | Na cadeira, passe uma toalha por trás das coxas, perto dos joelhos, e segure uma ponta em cada mão. Puxe os cotovelos para trás, segure 3 segundos e solte. | Costas retas. Respire durante o esforço. |
| 7 | `videos/s1-peso-pe-a-pe.mp4` | **Peso de um pé para o outro** (nível 1 · Primeiros passos) | Equilíbrio | Em pé, atrás da cadeira, as duas mãos no encosto. Pés afastados. Passe o peso do corpo devagar para um pé, depois para o outro, como um pêndulo lento. | Apoio firme sempre ao alcance: encosto de uma cadeira encostada na parede ou a bancada da pia. Calçado fechado ou pés descalços, nunca de meia. |
| 8 | `videos/s1-marcha-apoio.mp4` | **Marcha parada com apoio** (nível 1 · Primeiros passos) | Equilíbrio | Em pé, atrás da cadeira, mãos no encosto. Levante um joelho devagar, abaixe, e levante o outro, como quem marcha sem sair do lugar. | Apoio firme sempre ao alcance: encosto de uma cadeira encostada na parede ou a bancada da pia. Calçado fechado ou pés descalços, nunca de meia. |
| 9 | `videos/s2-sentar-devagar.mp4` | **Sentar devagar** (nível 2 · Passo firme) | Pernas | Em pé, de costas para a cadeira. Desça contando até 3 até sentar, empurrando o quadril para trás. Levante com a ajuda das mãos, se precisar. | Cadeira firme, sem rodinhas, encostada na parede. A cadeira tem que estar logo atrás das pernas. Levante sempre devagar. |
| 10 | `videos/s2-ponta-pes-apoio.mp4` | **Ponta dos pés com apoio** (nível 2 · Passo firme) | Pernas | Em pé, atrás da cadeira, mãos no encosto. Suba na ponta dos pés devagar, segure 1 segundo e desça devagar. | Apoio firme sempre ao alcance: encosto de uma cadeira encostada na parede ou a bancada da pia. Calçado fechado ou pés descalços, nunca de meia. |
| 11 | `videos/s2-flexao-parede-pausa.mp4` | **Flexão na parede com pausa** (nível 2 · Passo firme) | Empurrar | Como a flexão na parede, mas pare 2 segundos com o peito perto da parede antes de empurrar. | Piso que não escorrega. Não prenda a respiração na pausa. |
| 12 | `videos/s2-bracos-cima.mp4` | **Braços para cima, na cadeira** (nível 2 · Passo firme) | Empurrar | Na cadeira, costas no encosto, mãos na altura dos ombros. Empurre um braço para cima, devagar, desça e troque. | Sem arquear as costas. Pare se o ombro doer. |
| 13 | `videos/s2-w-parede.mp4` | **"W" na parede** (nível 2 · Passo firme) | Costas | Em pé, costas e cabeça encostadas na parede, pés um passo à frente. Braços em "W", encostados na parede. Aperte as escápulas para baixo, segure 2 segundos e solte. | Movimento pequeno. Pare se sentir dor ou formigamento no ombro. |
| 14 | `videos/s2-abre-fecha-toalha.mp4` | **Abre e fecha com toalha** (nível 2 · Passo firme) | Costas | Na cadeira, braços esticados à frente na altura do peito, segurando uma toalha. Tente afastar as mãos esticando a toalha, apertando as escápulas, e relaxe. | Ombros baixos. Respire durante o esforço. |
| 15 | `videos/s2-pe-frente-pe.mp4` | **Um pé na frente do outro, com apoio** (nível 2 · Passo firme) | Equilíbrio | Em pé, ao lado da bancada da pia ou atrás da cadeira, com as mãos apoiadas. Coloque um pé logo à frente do outro, como numa linha, e fique parado. Na metade do tempo, troque o pé da frente. | Apoio firme sempre ao alcance: encosto de uma cadeira encostada na parede ou a bancada da pia. Calçado fechado ou pés descalços, nunca de meia. Olhe para a frente, não para os pés. Mostre os dois lados. |
| 16 | `videos/s2-calcanhar-ponta.mp4` | **Calcanhar e ponta com apoio** (nível 2 · Passo firme) | Equilíbrio | Em pé, atrás da cadeira, mãos no encosto. Suba na ponta dos pés, desça, e depois levante a ponta dos pés, ficando nos calcanhares. Bem devagar. | Apoio firme sempre ao alcance: encosto de uma cadeira encostada na parede ou a bancada da pia. Calçado fechado ou pés descalços, nunca de meia. |
| 17 | `videos/s3-levantar-sem-maos.mp4` | **Levantar sem as mãos** (nível 3 · Passo forte) | Pernas | Na beirada da cadeira, braços cruzados no peito. Fique em pé sem usar as mãos e sente devagar. | Cadeira firme, sem rodinhas, encostada na parede. Levante sempre devagar. Se faltar firmeza, use as mãos. |
| 18 | `videos/s3-mini-agachamento.mp4` | **Mini agachamento com apoio** (nível 3 · Passo forte) | Pernas | Em pé, atrás da cadeira, mãos no encosto. Leve o quadril um pouco para trás, dobrando os joelhos, como quem vai sentar, e volte. | Apoio firme sempre ao alcance: encosto de uma cadeira encostada na parede ou a bancada da pia. Calçado fechado ou pés descalços, nunca de meia. Desça só até onde for confortável. |
| 19 | `videos/s3-flexao-bancada.mp4` | **Flexão inclinada na bancada** (nível 3 · Passo forte) | Empurrar | Mãos na borda da bancada da pia, pés um passo para trás, corpo reto. Dobre os cotovelos aproximando o peito da bancada e empurre de volta. | Bancada firme e piso seco, que não escorrega. Se não tiver bancada firme, faça na parede. |
| 20 | `videos/s3-flexao-parede-fechada.mp4` | **Flexão fechada na parede** (nível 3 · Passo forte) | Empurrar | Flexão na parede com as mãos próximas uma da outra e os cotovelos rentes ao corpo. | Piso que não escorrega. Ombros longe das orelhas. |
| 21 | `videos/s3-remada-toalha-pes.mp4` | **Remada com toalha nos pés, na cadeira** (nível 3 · Passo forte) | Costas | Na cadeira, pernas esticadas à frente com os calcanhares no chão e a toalha passada na sola dos pés. Puxe as pontas levando os cotovelos para trás, segure 3 segundos e solte. | Costas retas. Respire durante o esforço. |
| 22 | `videos/s3-w-sustentacao.mp4` | **"W" na parede com sustentação** (nível 3 · Passo forte) | Costas | Como o "W" na parede, mas segure as escápulas apertadas por 3 segundos em cada repetição. | Pare se sentir dor no ombro. Não prenda a respiração. |
| 23 | `videos/s3-um-pe-apoio.mp4` | **Equilíbrio em um pé, com apoio** (nível 3 · Passo forte) | Equilíbrio | Em pé, ao lado da cadeira ou da bancada, com as mãos apoiadas. Tire um pé do chão e fique firme. Na metade do tempo, troque o pé. | Apoio firme sempre ao alcance: encosto de uma cadeira encostada na parede ou a bancada da pia. Calçado fechado ou pés descalços, nunca de meia. Mantenha as mãos no apoio o tempo todo. Mostre os dois lados. |
| 24 | `videos/s3-passos-lado.mp4` | **Passos para o lado com apoio** (nível 3 · Passo forte) | Equilíbrio | De frente para a bancada da pia, mãos apoiadas na borda. Dê dois passos para o lado, devagar, e volte. Repita para o outro lado. | Apoio firme sempre ao alcance: encosto de uma cadeira encostada na parede ou a bancada da pia. Calçado fechado ou pés descalços, nunca de meia. Passos curtos, sem cruzar as pernas. |

## 2. Áudios de cada movimento (48)

Para cada movimento: uma **apresentação** (tocada no início dos 35 s) e um **"A seguir"** (tocado no descanso anterior).

| Arquivo | Texto |
|---|---|
| `audio/mov-s1-levantar-sentar-apoio.mp3` | Levantar e sentar. Tronco pra frente, mãos nas coxas, e levanta devagar. Senta com calma. |
| `audio/prox-s1-levantar-sentar-apoio.mp3` | A seguir: Levantar e sentar com apoio das mãos. |
| `audio/mov-s1-extensao-joelho.mp3` | Extensão de joelho. Estica a perna, segura dois segundinhos e desce devagar. Alterna. |
| `audio/prox-s1-extensao-joelho.mp3` | A seguir: Extensão de joelho na cadeira. |
| `audio/mov-s1-flexao-parede.mp3` | Flexão na parede. Mãos na altura do peito. Dobra os cotovelos e empurra a parede. Respira! |
| `audio/prox-s1-flexao-parede.mp3` | A seguir: Flexão na parede. |
| `audio/mov-s1-empurrar-ar.mp3` | Empurrar à frente. Empurra devagar, como quem abre uma porta pesada, e volta. Alterna. |
| `audio/prox-s1-empurrar-ar.mp3` | A seguir: Empurrar à frente, na cadeira. |
| `audio/mov-s1-ombros-tras.mp3` | Ombros pra trás. Aperta as escápulas, segura dois segundos e solta. |
| `audio/prox-s1-ombros-tras.mp3` | A seguir: Ombros para trás, na cadeira. |
| `audio/mov-s1-remada-toalha.mp3` | Remada com toalha. Puxa os cotovelos pra trás, segura três segundos e solta. Respira! |
| `audio/prox-s1-remada-toalha.mp3` | A seguir: Remada com toalha, na cadeira. |
| `audio/mov-s1-peso-pe-a-pe.mp3` | Peso de um pé pro outro. Mãos no encosto, passa o peso devagar de um lado pro outro. |
| `audio/prox-s1-peso-pe-a-pe.mp3` | A seguir: Peso de um pé para o outro. |
| `audio/mov-s1-marcha-apoio.mp3` | Marcha com apoio. Mãos no encosto, levanta um joelho de cada vez, devagar. |
| `audio/prox-s1-marcha-apoio.mp3` | A seguir: Marcha parada com apoio. |
| `audio/mov-s2-sentar-devagar.mp3` | Sentar devagar. Desce contando: um, dois, três. Depois levanta devagar, pode usar as mãos. |
| `audio/prox-s2-sentar-devagar.mp3` | A seguir: Sentar devagar. |
| `audio/mov-s2-ponta-pes-apoio.mp3` | Ponta dos pés. Mãos no encosto, sobe devagar, segura e desce com calma. |
| `audio/prox-s2-ponta-pes-apoio.mp3` | A seguir: Ponta dos pés com apoio. |
| `audio/mov-s2-flexao-parede-pausa.mp3` | Flexão na parede com pausa. Desce, segura dois segundos e empurra. |
| `audio/prox-s2-flexao-parede-pausa.mp3` | A seguir: Flexão na parede com pausa. |
| `audio/mov-s2-bracos-cima.mp3` | Braços pra cima. Empurra um braço pro alto, devagar, desce e troca. |
| `audio/prox-s2-bracos-cima.mp3` | A seguir: Braços para cima, na cadeira. |
| `audio/mov-s2-w-parede.mp3` | W na parede. Costas na parede, braços em W. Aperta as escápulas pra baixo, segura e solta. |
| `audio/prox-s2-w-parede.mp3` | A seguir: "W" na parede. |
| `audio/mov-s2-abre-fecha-toalha.mp3` | Abre e fecha com toalha. Estica a toalha como se quisesse rasgar e aperta as costas. |
| `audio/prox-s2-abre-fecha-toalha.mp3` | A seguir: Abre e fecha com toalha. |
| `audio/mov-s2-pe-frente-pe.mp3` | Um pé na frente do outro. Mãos no apoio, olhar pra frente, e fica firme. Na metade, troca. |
| `audio/prox-s2-pe-frente-pe.mp3` | A seguir: Um pé na frente do outro, com apoio. |
| `audio/mov-s2-calcanhar-ponta.mp3` | Calcanhar e ponta. Sobe na ponta, desce, e depois fica nos calcanhares. Devagar e com apoio. |
| `audio/prox-s2-calcanhar-ponta.mp3` | A seguir: Calcanhar e ponta com apoio. |
| `audio/mov-s3-levantar-sem-maos.mp3` | Levantar sem as mãos. Braços cruzados, sobe devagar e senta com calma. |
| `audio/prox-s3-levantar-sem-maos.mp3` | A seguir: Levantar sem as mãos. |
| `audio/mov-s3-mini-agachamento.mp3` | Mini agachamento. Mãos no encosto, quadril pra trás um pouquinho, e sobe. |
| `audio/prox-s3-mini-agachamento.mp3` | A seguir: Mini agachamento com apoio. |
| `audio/mov-s3-flexao-bancada.mp3` | Flexão na bancada. Corpo retinho, peito vai até a bancada e empurra. |
| `audio/prox-s3-flexao-bancada.mp3` | A seguir: Flexão inclinada na bancada. |
| `audio/mov-s3-flexao-parede-fechada.mp3` | Flexão fechada. Mãos pertinho, cotovelos colados no corpo. Desce e empurra. |
| `audio/prox-s3-flexao-parede-fechada.mp3` | A seguir: Flexão fechada na parede. |
| `audio/mov-s3-remada-toalha-pes.mp3` | Remada com toalha nos pés. Puxa os cotovelos pra trás, segura três segundos e solta. |
| `audio/prox-s3-remada-toalha-pes.mp3` | A seguir: Remada com toalha nos pés, na cadeira. |
| `audio/mov-s3-w-sustentacao.mp3` | W com sustentação. Aperta as escápulas e segura três segundos. Respira! |
| `audio/prox-s3-w-sustentacao.mp3` | A seguir: "W" na parede com sustentação. |
| `audio/mov-s3-um-pe-apoio.mp3` | Equilíbrio num pé só. Mãos no apoio, tira um pé do chão e fica firme. Na metade, troca. |
| `audio/prox-s3-um-pe-apoio.mp3` | A seguir: Equilíbrio em um pé, com apoio. |
| `audio/mov-s3-passos-lado.mp3` | Passos pro lado. Mãos na bancada, dois passinhos pro lado e volta. Devagar. |
| `audio/prox-s3-passos-lado.mp3` | A seguir: Passos para o lado com apoio. |

## 3. Falas fixas

| Arquivo | Texto | Quando toca |
|---|---|---|
| `audio/aquecimento-1.mp3` | Vamos aquecer! Na cadeira, costas retas. Marcha leve, levantando os joelhos alternados. | Início do aquecimento (0 s) |
| `audio/aquecimento-2.mp3` | Agora gira os ombros pra trás, bem devagar. | Aquecimento, 10 s |
| `audio/aquecimento-3.mp3` | Abre e fecha as mãos. Respira fundo. | Aquecimento, 18 s |
| `audio/cadeira-alerta.mp3` | Cadeira encostada na parede e apoio firme por perto? Então vamos. | Antes de movimento com cadeira |
| `audio/levanta-devagar.mp3` | Levanta devagar. | Ao levantar da cadeira / movimentos de levantar |
| `audio/troca-lado.mp3` | Agora troca de lado. | Metade dos movimentos de um lado só |
| `audio/ultimo-descanso.mp3` | Último descanso! Já já vem o desaquecimento. | Último descanso |
| `audio/desaquecimento-1.mp3` | Desaquecimento. Na cadeira, respira fundo pelo nariz e solta pela boca. | Início do desaquecimento |
| `audio/desaquecimento-2.mp3` | Entrelaça as mãos e estica os braços pra frente, alongando as costas. | Desaquecimento, 10 s |
| `audio/desaquecimento-3.mp3` | Agora levanta devagar. Antes de sair andando, espera um instante em pé, com apoio. | Desaquecimento, 20 s |
| `audio/a-seguir.mp3` | A seguir: | Não precisa gravar sozinho (já entra nos arquivos prox-*) |

## 4. Frases sorteadas

O número do arquivo segue a ordem da lista no `config.json` (01 = primeira frase).

### Metade dos movimentos (geral)

| Arquivo | Texto |
|---|---|
| `audio/durante-01.mp3` | Costas retas, ombros relaxados. |
| `audio/durante-02.mp3` | Respira! Não precisa prender o ar. |
| `audio/durante-03.mp3` | Muito bem. Devagar e com controle. |
| `audio/durante-04.mp3` | Cada repetição é força para o dia a dia. |
| `audio/durante-05.mp3` | Força nas pernas é passo firme na rua. |
| `audio/durante-06.mp3` | Isso! Seu corpo agradece. |
| `audio/durante-07.mp3` | Se precisar, use a versão mais fácil. Fazer é o que conta. |
| `audio/durante-08.mp3` | Olhar pra frente, postura firme. |
| `audio/durante-09.mp3` | No seu ritmo. Aqui não tem pressa. |
| `audio/durante-10.mp3` | Mais forte hoje do que ontem. |
| `audio/durante-11.mp3` | Movimento é saúde. Continue assim. |
| `audio/durante-12.mp3` | Barriga firme, respiração solta. |

### Metade dos movimentos de levantar

| Arquivo | Texto |
|---|---|
| `audio/levantar-01.mp3` | Levanta devagar, com calma e firmeza. |
| `audio/levantar-02.mp3` | Senta com controle, sem se jogar. |
| `audio/levantar-03.mp3` | Levantar da cadeira com facilidade é liberdade. |

### Metade dos movimentos com objeto (garrafa, elástico...)

| Arquivo | Texto |
|---|---|
| `audio/objeto-01.mp3` | Segura firme a toalha, sem tensionar o pescoço. |
| `audio/objeto-02.mp3` | Toalha esticada, costas trabalhando. |
| `audio/objeto-03.mp3` | Quem diria que uma toalha ajudava tanto? |

### Faltando 10 s

| Arquivo | Texto |
|---|---|
| `audio/dez-01.mp3` | Mais 10 segundos. Você consegue. |
| `audio/dez-02.mp3` | Só mais 10! Respira. |
| `audio/dez-03.mp3` | Reta final: 10 segundos. |
| `audio/dez-04.mp3` | Dez segundos. Firme e sem pressa. |

### Início do descanso

| Arquivo | Texto |
|---|---|
| `audio/descanso-01.mp3` | Descansa. Respira fundo e solta devagar. |
| `audio/descanso-02.mp3` | Pausa merecida. Um gole de água vai bem. |
| `audio/descanso-03.mp3` | Respira... ombros relaxados. |
| `audio/descanso-04.mp3` | Descanse sentado ou com apoio. |

### Tela final

| Arquivo | Texto |
|---|---|
| `audio/conclusao-01.mp3` | Treino feito! Cinco minutos de força e equilíbrio. |
| `audio/conclusao-02.mp3` | Muito bem! Seu corpo agradece. |
| `audio/conclusao-03.mp3` | Mais firme a cada treino. Parabéns! |
| `audio/conclusao-04.mp3` | Missão cumprida. Até o próximo treino. |
| `audio/conclusao-05.mp3` | Força nas pernas, segurança no passo. |
| `audio/conclusao-06.mp3` | Um treino de cada vez, e a autonomia agradece. |
| `audio/conclusao-07.mp3` | Agora um copo d'água pra fechar bem. |
| `audio/conclusao-08.mp3` | Constância é o segredo. Você está no caminho. |

---

**Total:** 24 vídeos e 92 áudios (48 de movimentos, 10 falas fixas e 34 frases).
