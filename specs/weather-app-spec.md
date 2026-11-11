# Especificação de Produto — Weather App

## Overview

Aplicação web em português do Brasil para pesquisar uma cidade, consultar seu
clima atual e a previsão de hoje e dos quatro dias seguintes, e alternar entre
Celsius e Fahrenheit. O público compreende as três personas do discovery:
pessoa que planeja atividades, viajante e pessoa que decide o que vestir.

A fonte de geocodificação e meteorologia é o Open-Meteo, sem chave de API.
Não há login nem armazenamento de buscas ou preferências no servidor. As
decisões adicionais abaixo são hipóteses de produto para viabilizar esta versão,
não conclusões já validadas com usuários.

## Functional Requirements

- **RF-01 — Pesquisar:** enviar uma busca explícita pelo nome informado, após
  remover espaços externos. Pesquisar globalmente na cobertura do Open-Meteo e
  mostrar até dez resultados retornados, na ordem da fonte. Não há sugestões
  durante a digitação. Uma nova busca válida substitui a lista anterior, mas a
  cidade selecionada e seus dados permanecem até outra seleção.
- **RF-02 — Selecionar:** mostrar nome e, quando disponíveis, região/estado e
  país em cada resultado; exigir seleção explícita, inclusive com um único
  resultado. Selecionar uma cidade inicia a consulta meteorológica e identifica
  a cidade exibida. Não apresentar dados da cidade anterior como da nova.
- **RF-03 — Condições atuais:** apresentar temperatura, condição textual e
  horário de observação local como campos obrigatórios; sensação térmica,
  umidade relativa e velocidade do vento são opcionais. Sem qualquer campo
  obrigatório ou fuso válido, o painel atual fica indisponível. Campos
  opcionais ausentes são omitidos, nunca substituídos por zero.
- **RF-04 — Previsão diária:** apresentar cinco posições para a data atual no
  fuso da cidade e os quatro dias seguintes. Cada posição exige data, condição,
  mínima e máxima; probabilidade máxima de precipitação é opcional. Uma data
  ausente ou um campo obrigatório ausente torna somente a posição desse dia
  indisponível; sem fuso válido, toda a previsão fica indisponível. Não usar
  dados de outras datas para preencher lacunas. Quando muda a data local,
  recalcular as posições com os dados em memória, sem chamada automática;
  indicar como indisponíveis as datas sem dados. Recalcular também ao voltar
  para a página após suspensão. Uma nova seleção permite consultar novamente.
- **RF-05 — Unidade:** iniciar em Celsius e permitir alternar Celsius e
  Fahrenheit para temperatura atual, sensação térmica e mínimas/máximas.
  Converter antes de formatar, com no máximo uma casa decimal e unidade visível.
  Umidade e precipitação usam porcentagem; vento usa km/h. A escolha vale até
  recarregar ou fechar a página, inclusive ao trocar de cidade.
- **RF-06 — Ausência de dados:** informar quando a busca não retorna cidades e
  quando um painel ou dia não tem dados obrigatórios. Preservar dados válidos
  do outro painel e dos demais dias. Ausência de dados não é erro de rede e
  não oferece nova tentativa automática.
- **RF-07 — Carregamento e falhas:** indicar carregamento durante cada busca e
  consulta meteorológica. Informar falhas de rede, resposta HTTP malsucedida,
  limite de requisições, resposta inválida e timeout; encerrar cada chamada
  pendente após dez segundos. JSON malformado, raiz que não seja objeto ou
  estrutura presente com tipo incompatível é falha, mesmo com HTTP bem-sucedido.
  Fuso ausente ou inválido, inclusive com tipo incorreto, torna o painel
  correspondente indisponível, conforme RF-03 e RF-04.
  Em geocodificação, resultados ausentes, nulos ou uma lista vazia significam
  nenhuma cidade; resultados presentes que não sejam lista são falha. Campos
  meteorológicos ausentes ou nulos em estrutura válida seguem RF-06. Anunciar
  mudanças de estado para tecnologias assistivas.
- **RF-08 — Nova tentativa:** permitir repetição manual de busca ou consulta
  meteorológica que falhou, com os mesmos parâmetros e uma chamada por ação.
  Não repetir automaticamente. Uma resposta parcial válida não é falha de
  chamada e não oferece tentativa específica para campos ausentes. Caso atual
  e previsão compartilhem uma chamada, a repetição pode atualizar ambos. Para
  cada busca ou painel afetado, somente a chamada mais recente pode alterar seu
  estado, inclusive em seleções repetidas da mesma cidade. Chamadas para painéis
  independentes não se substituem; resultados de chamadas expiradas são ignorados.
- **RF-09 — Validar entrada:** após remover espaços externos, exigir ao menos
  dois caracteres que não sejam espaços em branco; rejeitar entrada inválida
  com mensagem e sem chamada. Aceitar acentos, apóstrofos, hífens e outros
  caracteres como texto literal, sem interpretá-los como código; a existência
  de correspondência depende da fonte.
- **RF-10 — Atualidade:** mostrar a data e o horário da observação fornecidos
  pela fonte, no fuso da cidade. Não atualizar automaticamente; nova seleção da
  cidade ou repetição de chamada falha faz nova consulta. Identificar Open-Meteo
  como fonte junto aos dados meteorológicos apresentados.

## User Stories

- **US-01:** Como pessoa que planeja atividades, quero pesquisar uma cidade e
  consultar as condições atuais para decidir o que fazer. **RF-01, RF-02,
  RF-03, RF-09.**
- **US-02:** Como viajante, quero escolher uma cidade entre resultados
  identificados por região e país para consultar o destino correto. **RF-01,
  RF-02.**
- **US-03:** Como pessoa que planeja atividades, quero consultar a previsão de
  hoje e dos quatro dias seguintes para planejar minhas atividades. **RF-04.**
- **US-04:** Como pessoa que decide o que vestir, quero alternar a unidade de
  temperatura para interpretar as condições na escala que prefiro. **RF-05.**
- **US-05:** Como viajante, quero saber quando uma cidade ou dados não estão
  disponíveis para entender o resultado da minha consulta. **RF-06, RF-09.**
- **US-06:** Como viajante, quero acompanhar uma consulta e tentar novamente
  após uma falha para recuperar o acesso à previsão. **RF-07, RF-08.**
- **US-07:** Como pessoa que decide o que vestir, quero ver quando as condições
  foram observadas para avaliar a atualidade da informação. **RF-03, RF-10.**

## Acceptance Criteria

Cada critério cobre o requisito indicado; a tabela de rastreabilidade relaciona
os critérios às histórias. Os termos Given, When e Then delimitam os cenários.

### RF-01 — Pesquisar

- **CA-01.1:** Given o texto `  São Paulo  ` e uma resposta com 12 resultados,
  When a pesquisa é enviada, Then a consulta usa `São Paulo` e a lista mostra
  os primeiros dez resultados na ordem retornada.
- **CA-01.2:** Given uma cidade selecionada e seus dados visíveis, When uma
  nova busca válida é enviada, Then a lista anterior é substituída pelo estado
  da nova busca e a cidade e os dados selecionados permanecem até outra seleção.
- **CA-01.3:** Given uma busca A pendente, When uma busca válida B é enviada e
  A responde depois de B, Then apenas o resultado ou erro de B é apresentado.
- **CA-01.4:** Given que o usuário está digitando sem enviar, When o texto muda,
  Then nenhuma consulta de geocodificação é iniciada.

### RF-02 — Selecionar

- **CA-02.1:** Given resultados homônimos com nome, região e país, When a lista
  é apresentada, Then cada opção mostra os campos disponíveis sem inventar os
  ausentes.
- **CA-02.2:** Given uma busca com um ou mais resultados, When nenhum resultado
  foi selecionado, Then nenhuma consulta meteorológica é iniciada para eles.
- **CA-02.3:** Given dados da cidade A visíveis, When o usuário seleciona B,
  Then a interface identifica B, oculta os dados de A e inicia a consulta de B.
- **CA-02.4:** Given uma consulta de A pendente, When B é selecionada e a
  resposta de A chega posteriormente, Then a resposta de A não altera os dados
  ou estados de B.

### RF-03 — Condições atuais

- **CA-03.1:** Given uma resposta com todos os campos atuais e fuso válidos,
  When a consulta termina, Then temperatura, condição textual, data e horário
  da observação, sensação térmica, umidade e vento são apresentados para a
  cidade selecionada.
- **CA-03.2:** Given uma resposta com campos obrigatórios e fuso válidos, mas
  sem sensação térmica, umidade ou vento, When a consulta termina, Then os
  campos ausentes são omitidos e os demais são apresentados.
- **CA-03.3:** Given que falta temperatura, condição, horário de observação ou
  fuso válido, When a consulta termina, Then o painel atual informa
  indisponibilidade e não apresenta os demais valores como condições atuais.
- **CA-03.4:** Given códigos meteorológicos 0, 3 e 95, When suas condições
  atuais são apresentadas, Then os textos são, respectivamente, `Céu limpo`,
  `Encoberto` e `Tempestade`; código desconhecido exibe `Condição desconhecida`.

### RF-04 — Previsão diária

- **CA-04.1:** Given que a data na cidade é 11/11/2026 e há cinco dias válidos,
  When a previsão é apresentada, Then as posições são 11/11 a 15/11/2026,
  independentemente da data no dispositivo, com condição, mínima e máxima.
- **CA-04.2:** Given uma previsão com probabilidade de precipitação disponível
  em um dia e ausente em outro, When a previsão é apresentada, Then a primeira
  é exibida em porcentagem e a segunda é omitida.
- **CA-04.3:** Given que um dos cinco dias está ausente ou sem condição,
  mínima ou máxima, When a previsão é apresentada, Then sua posição para a
  data esperada indica indisponibilidade e os demais dias válidos permanecem.
- **CA-04.4:** Given uma resposta sem fuso válido, When a consulta termina,
  Then o painel de previsão informa indisponibilidade, sem atribuir dias ao
  fuso do dispositivo.
- **CA-04.5:** Given previsão de 11/11 a 15/11/2026 em memória, When a data
  local passa para 12/11/2026, Then as posições passam a 12/11 a 16/11, os
  dados de 12/11 a 15/11 permanecem, 16/11 é indisponível e não há nova chamada.
- **CA-04.6:** Given a página suspensa antes da virada de dia local, When ela
  volta a ficar visível após a virada, Then as cinco posições são recalculadas
  pela nova data local sem iniciar consulta automática.

### RF-05 — Unidade

- **CA-05.1:** Given uma página recém-carregada com dados disponíveis, When os
  valores de temperatura são exibidos, Then a unidade inicial é Celsius.
- **CA-05.2:** Given temperatura atual e mínima de 0 °C e sensação térmica e
  máxima de 10 °C, When o usuário escolhe Fahrenheit, Then temperatura atual e
  mínima exibem 32 °F, sensação térmica e máxima exibem 50 °F, e umidade,
  vento e precipitação não mudam.
- **CA-05.3:** Given Fahrenheit selecionado, When o usuário volta a Celsius,
  Then todos os valores de temperatura retornam aos valores originais em
  Celsius, sem acumular arredondamentos das alternâncias anteriores.
- **CA-05.4:** Given uma temperatura de 20,3 °C, When o usuário escolhe
  Fahrenheit, Then o valor é exibido como 68,5 °F, com separador decimal pt-BR.
- **CA-05.5:** Given Fahrenheit selecionado, When o usuário seleciona outra
  cidade e os dados são carregados, Then suas temperaturas são exibidas em °F.
- **CA-05.6:** Given Fahrenheit selecionado, When a página é recarregada,
  Then a unidade selecionada volta a ser Celsius.

### RF-06 — Ausência de dados

- **CA-06.1:** Given uma pesquisa válida sem resultados de geocodificação,
  When a resposta termina, Then a interface informa que nenhuma cidade foi
  encontrada e permite iniciar outra pesquisa.
- **CA-06.2:** Given o painel atual indisponível e previsão válida, When a
  resposta termina, Then a interface informa a indisponibilidade atual e
  mantém a previsão válida visível; o inverso também se aplica.
- **CA-06.3:** Given uma resposta meteorológica sem dados para nenhum painel,
  When a consulta termina, Then ambos informam indisponibilidade sem exibir
  valores anteriores ou zeros no lugar dos ausentes.
- **CA-06.4:** Given chamadas independentes e previsão válida, When a resposta
  atual não contém fuso válido, Then somente o painel atual fica indisponível
  e a previsão permanece visível; o mesmo vale no sentido inverso.

### RF-07 — Carregamento e falhas

- **CA-07.1:** Given uma busca ou consulta meteorológica iniciada, When a
  resposta ainda está pendente, Then seu estado de carregamento é visível e
  anunciado por tecnologia assistiva.
- **CA-07.2:** Given uma chamada que não terminou, When decorridos dez
  segundos desde seu início, Then ela é encerrada como timeout, o carregamento
  termina e uma mensagem de falha e ação de nova tentativa são apresentadas.
- **CA-07.3:** Given uma chamada com erro de rede, resposta HTTP malsucedida
  ou limite de requisições, When a falha é recebida, Then a interface informa
  a falha na consulta afetada e oferece nova tentativa manual.
- **CA-07.4:** Given HTTP bem-sucedido com JSON malformado, raiz que não é
  objeto ou campo estrutural presente com tipo incompatível, When a resposta é
  processada, Then a consulta afetada informa falha e oferece nova tentativa.
- **CA-07.5:** Given geocodificação com objeto válido e resultados ausentes,
  nulos ou lista vazia, When a resposta é processada, Then a interface informa
  que nenhuma cidade foi encontrada, sem apresentar erro de consulta.

### RF-08 — Nova tentativa

- **CA-08.1:** Given uma busca que falhou para `Recife`, When o usuário aciona
  nova tentativa uma vez, Then uma única chamada é enviada com `Recife`, mesmo
  que o campo tenha sido editado depois da falha.
- **CA-08.2:** Given uma consulta meteorológica que falhou, When o usuário
  aciona nova tentativa, Then a chamada falha é refeita para a cidade ainda
  selecionada; dados válidos de chamada independente permanecem visíveis.
- **CA-08.3:** Given uma nova tentativa, When ela termina com sucesso, Then o
  erro correspondente deixa de ser exibido e o novo resultado é apresentado.
- **CA-08.4:** Given uma chamada que falhou ou uma resposta parcial válida,
  When passam 30 segundos sem o usuário acionar nova tentativa, Then nenhuma
  chamada de repetição é iniciada automaticamente nesse intervalo.
- **CA-08.5:** Given duas consultas sucessivas para o mesmo painel e cidade,
  When a primeira termina depois da segunda, Then o resultado ou erro da
  primeira não altera o estado produzido pela segunda.
- **CA-08.6:** Given uma chamada encerrada por timeout e sua nova tentativa,
  When a resposta da chamada expirada chega, Then ela não altera o estado nem
  os dados da nova tentativa.

### RF-09 — Validar entrada

- **CA-09.1:** Given campo vazio, apenas com espaços ou com menos de dois
  caracteres não brancos após remover espaços externos, When a busca é enviada,
  Then uma mensagem informa o mínimo exigido e nenhuma chamada é iniciada.
- **CA-09.2:** Given uma entrada válida com acento, apóstrofo, hífen ou
  caracteres especiais, When a busca é enviada, Then o texto é transmitido como
  parâmetro literal, sem executar código; o resultado ou ausência dele segue a
  resposta da fonte.

### RF-10 — Atualidade

- **CA-10.1:** Given uma observação de 11/11/2026 às 23:30 no fuso da cidade e
  um dispositivo em outro fuso, When as condições atuais são exibidas, Then a
  data e o horário mostrados são 11/11/2026 e 23:30, identificados como horário
  da observação local.
- **CA-10.2:** Given dados atuais exibidos, When passam dez minutos sem nova
  seleção nem tentativa manual, Then nenhuma atualização periódica é iniciada
  nesse intervalo e o horário de observação permanece associado aos dados.
- **CA-10.3:** Given dados meteorológicos disponíveis para a cidade selecionada,
  When os dados são apresentados, Then a interface identifica Open-Meteo como
  fonte junto a eles.

### Condições meteorológicas

Os códigos WMO da fonte são exibidos em pt-BR conforme a tabela. Um código
ausente torna o campo obrigatório indisponível; código não listado usa
`Condição desconhecida`. A mesma tabela se aplica às condições atuais e diárias.

| Código | Texto | Código | Texto |
| --- | --- | --- | --- |
| 0 | Céu limpo | 1 | Predominantemente limpo |
| 2 | Parcialmente nublado | 3 | Encoberto |
| 45 | Nevoeiro | 48 | Nevoeiro com geada |
| 51 | Garoa fraca | 53 | Garoa moderada |
| 55 | Garoa intensa | 56 | Garoa congelante fraca |
| 57 | Garoa congelante intensa | 61 | Chuva fraca |
| 63 | Chuva moderada | 65 | Chuva intensa |
| 66 | Chuva congelante fraca | 67 | Chuva congelante intensa |
| 71 | Neve fraca | 73 | Neve moderada |
| 75 | Neve intensa | 77 | Grãos de neve |
| 80 | Pancadas de chuva fracas | 81 | Pancadas de chuva moderadas |
| 82 | Pancadas de chuva intensas | 85 | Pancadas de neve fracas |
| 86 | Pancadas de neve intensas | 95 | Tempestade |
| 96 | Tempestade com granizo fraco | 99 | Tempestade com granizo forte |

## Non-Functional Requirements

- **RNF-01 — Responsividade:** nos viewports de 320, 768 e 1280 px de largura,
  os fluxos completos permanecem legíveis e operáveis sem rolagem horizontal da
  página ou corte de conteúdo essencial.
- **RNF-02 — Acessibilidade:** os fluxos da versão atendem WCAG 2.2 nível AA,
  incluindo operação por teclado, foco visível, nomes acessíveis, contraste e
  anúncio de carregamento, erros e resultados.
- **RNF-03 — Desempenho:** o carregamento aparece em até 100 ms após a ação.
  Medir no Chrome estável mais recente, em desktop com viewport 1280 × 720,
  CPU limitada a 4× no DevTools e dados da fonte simulados. Em 100 consultas
  sequenciais, com latência simulada de 100 ms e resposta completa em até quatro
  segundos, o percentil 95 entre ação e resultado visível é de até cinco
  segundos. Cada chamada pendente expira em dez segundos. Registrar sistema,
  hardware e versão do navegador junto ao resultado do teste.
- **RNF-04 — Resiliência:** falhas de chamadas independentes não ocultam dados
  válidos; respostas de chamadas substituídas ou expiradas são ignoradas. A
  recuperação não exige reiniciar a aplicação.
- **RNF-05 — Clareza:** valores têm unidades identificáveis; condições são
  textuais em pt-BR e dados atuais mostram horário local da observação. Códigos
  de condição não reconhecidos são apresentados como `Condição desconhecida`,
  sem inventar uma condição.
- **RNF-06 — Localização:** textos, datas e números seguem pt-BR; datas
  meteorológicas usam o fuso da cidade, inclusive em mudanças de horário local.
- **RNF-07 — Privacidade e acesso:** não exigir login nem persistir buscas ou
  preferências no servidor ou dispositivo. Enviar ao Open-Meteo apenas dados
  necessários à busca e consulta; nenhuma chave de API é exigida do usuário.
- **RNF-08 — Compatibilidade:** suportar as duas versões estáveis mais recentes
  de Chrome, Edge, Firefox e Safari na data da validação, incluindo Safari em
  iOS e Chrome em Android.

## Edge Cases

| Caso | Comportamento esperado |
| --- | --- |
| Cidade inexistente | Se a fonte não retornar correspondências, informar que nenhuma cidade foi encontrada e permitir nova busca. |
| Input vazio ou insuficiente | Não chamar o serviço para campo vazio, somente espaços ou menos de dois caracteres não brancos; informar o mínimo. |
| Caracteres especiais | Tratar como texto literal e transmitir com codificação apropriada; não executar conteúdo. A fonte determina as correspondências, inclusive para acentos e grafias alternativas. |
| Falha de API ou rede | Informar a falha da chamada afetada, preservar dados válidos de chamadas independentes e oferecer nova tentativa manual. |
| Timeout | Encerrar a chamada pendente após dez segundos, informar o timeout e oferecer nova tentativa manual. |
| Geocoding sem resultados | Mostrar estado sem resultados, sem selecionar cidade nem iniciar consulta meteorológica para essa busca. |
| Resposta inválida | Tratar JSON malformado, raiz inválida ou estrutura presente com tipo incompatível como falha, com nova tentativa manual. |
| Resposta parcial | Omitir campos opcionais ausentes; marcar painel atual ou posição diária indisponível quando faltar campo obrigatório, preservando dados válidos. Sem fuso válido, o painel correspondente fica indisponível; dados válidos de chamada independente permanecem visíveis. |
| Cidades homônimas | Mostrar região e país quando disponíveis e aguardar seleção explícita; não presumir a cidade. |
| Respostas fora de ordem | Ignorar resultados e erros de chamadas substituídas ou expiradas, inclusive para a mesma cidade e painel. |
| Troca de cidade durante consulta | Ocultar os dados da cidade anterior e identificar a nova seleção; não associar dados antigos à nova cidade. |
| Mudança de dia ou fuso | Recalcular as cinco posições pela data local da cidade, inclusive ao voltar de suspensão; marcar datas sem dados como indisponíveis, sem chamada automática. |
| Código meteorológico desconhecido | Exibir `Condição desconhecida`; ausência do código é campo obrigatório ausente. |
| Primeira visita | Iniciar sem cidade selecionada e sem dados meteorológicos; não solicitar localização automática. |

## Assumptions

- As decisões desta especificação sobre campos, busca, tempos, persistência,
  acessibilidade e suporte são hipóteses adotadas para esta versão e devem ser
  validadas com stakeholders e usuários antes de assumir adequação ao mercado.
- A cobertura e as correspondências são limitadas ao que o Open-Meteo retorna;
  não se garante equivalência entre grafias, idiomas ou formas acentuadas.
- A data de referência é a data atual no fuso informado para a cidade, usando o
  relógio do dispositivo; o relógio do dispositivo é considerado correto.
- A aplicação necessita de conexão para novas consultas. Dados permanecem apenas
  em memória durante a página; recarregar inicia uma sessão sem cidade e com °C.
- As personas são hipóteses do discovery, não resultados de pesquisa validada.

## Risks

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Serviço indisponível, lento ou com limite | Consultas não são concluídas. | Timeout, mensagem e repetição manual; não há provedor alternativo. |
| Cobertura insuficiente ou homônimos indistinguíveis | O destino pode não ser encontrado ou identificado. | Mostrar região e país disponíveis; validar cobertura dos mercados prioritários. |
| Fuso ou relógio incorreto | Observação ou previsão pode ser atribuída ao dia errado. | Usar fuso da cidade, testar mudança de dia e explicitar a dependência do relógio. |
| Dados desatualizados ou parciais | Usuário pode tomar decisão com informação incompleta. | Mostrar horário da observação e indisponibilidade, sem preencher lacunas com zero. |
| Horário tratado como observação instrumental sem confirmação | A interface pode sugerir uma medição que a fonte não fornece. | Validar a natureza do dado e sua rotulagem com a fonte e stakeholders antes da entrega. |
| Personas e metas não validadas | A experiência pode não atender ao público real. | Validar hipóteses e metas com stakeholders e usuários. |

## Out of Scope

- Contas, autenticação, perfis, sincronização e persistência de buscas ou
  preferências, seja no servidor ou no dispositivo.
- Geolocalização automática, solicitação de permissão de localização, mapas,
  radar e seleção por localização do dispositivo.
- Autocomplete, sugestões enquanto digita, busca por voz, histórico, favoritos
  e comparação simultânea de cidades.
- Atualização periódica, tentativas automáticas, alertas e notificações.
- Previsão por hora, períodos além dos cinco dias, qualidade do ar, índice UV,
  poluição e campos não especificados nos requisitos.
- Consulta offline, cache persistente, dados antigos como alternativa a falhas
  e fonte meteorológica alternativa ao Open-Meteo.
- Idiomas além de pt-BR, outras unidades de vento e precipitação e garantia de
  correspondência para grafias alternativas ou nomes em outros idiomas.

## Traceability

| User Story | Requisitos funcionais | Acceptance Criteria | RNFs relevantes |
| --- | --- | --- | --- |
| US-01 | RF-01, RF-02, RF-03, RF-09 | CA-01.1 a CA-01.4; CA-02.1 a CA-02.4; CA-03.1 a CA-03.4; CA-09.1 a CA-09.2 | RNF-01 a RNF-08 |
| US-02 | RF-01, RF-02 | CA-01.1 a CA-01.4; CA-02.1 a CA-02.4 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-06, RNF-07, RNF-08 |
| US-03 | RF-04 | CA-04.1 a CA-04.6 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-07, RNF-08 |
| US-04 | RF-05 | CA-05.1 a CA-05.6 | RNF-01, RNF-02, RNF-05, RNF-06, RNF-07, RNF-08 |
| US-05 | RF-06, RF-09 | CA-06.1 a CA-06.4; CA-09.1 a CA-09.2 | RNF-01, RNF-02, RNF-04, RNF-06, RNF-08 |
| US-06 | RF-07, RF-08 | CA-07.1 a CA-07.5; CA-08.1 a CA-08.6 | RNF-01 a RNF-04, RNF-06, RNF-08 |
| US-07 | RF-03, RF-10 | CA-03.1 a CA-03.4; CA-10.1 a CA-10.3 | RNF-01, RNF-02, RNF-05, RNF-06, RNF-08 |

## Review

Problemas identificados na versão anterior e correções aplicadas:

| Tipo | Problema | Correção |
| --- | --- | --- |
| Requisito faltante | Caracteres especiais e nomes alternativos não tinham comportamento definido. | RF-09 trata a entrada como texto literal; a cobertura de grafias depende da fonte. |
| Requisito faltante | A apresentação de código meteorológico desconhecido não estava definida. | RNF-05 e Edge Cases definem uma condição textual desconhecida. |
| Ambiguidade | Faltava definir a experiência durante nova busca e a data de referência da previsão. | RF-01 preserva a cidade selecionada; RF-04 e Assumptions definem data e fuso. |
| Inconsistência | A especificação exigia repetir somente um painel mesmo quando ambos podiam compartilhar uma chamada. | RF-08 define repetição por chamada e preservação de dados de chamadas independentes. |
| Inconsistência | O horário de observação era exigido, mas estava implicitamente entre os campos que poderiam ser omitidos. | RF-03 torna horário obrigatório e define indisponibilidade quando ele falta. |
| Critério fraco | Critérios misturavam afirmações gerais com cenários sem Given/When/Then. | Acceptance Criteria usa cenários objetivos identificados por requisito. |
| Critério incompleto | Dias ausentes, fuso inválido e respostas fora de ordem não tinham resultados suficientemente determinados. | RF-04, CA-04.3, CA-04.4 e CA-02.4 definem os resultados verificáveis. |
| Rastreabilidade ausente | Histórias não apontavam explicitamente para requisitos, critérios e atributos de qualidade. | A tabela Traceability liga cada história aos três conjuntos. |
| Ambiguidade | Virada de dia, respostas inválidas e consultas concorrentes para a mesma cidade não tinham comportamento definido. | RF-04, RF-07 e RF-08 e seus critérios definem os estados e a precedência. |
| Requisito faltante | A atribuição e o mapeamento dos códigos da fonte não estavam definidos. | RF-10, CA-10.3 e a tabela de condições definem a apresentação. |
| Critério fraco | A medição de desempenho não definia ambiente reproduzível. | RNF-03 define navegador, viewport, limitação de CPU e dados simulados. |
| Inconsistência | A regra de fuso em resposta parcial afetava ambos os painéis mesmo em chamadas independentes. | RF-07, CA-06.4 e Edge Cases restringem a indisponibilidade ao painel correspondente. |

## Open Questions

- **Natureza do horário:** o horário das condições atuais fornecido pelo
  Open-Meteo representa uma observação instrumental ou dados de modelo? Qual
  rótulo em pt-BR comunica essa origem sem induzir o usuário a erro? Confirmar
  com a documentação da fonte e stakeholders antes de definir a rotulagem final
  e liberar o produto; até essa decisão, RF-03, RF-10 e CA-10.1 são provisórios.
- Antes de lançamento em produção, validar com stakeholders e usuários a
  prioridade das personas, os mercados e localidades relevantes, a adequação
  dos campos e as metas de qualidade. Essas validações podem alterar o escopo.