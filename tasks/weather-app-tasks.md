# Backlog — Weather App

Fonte: `plans/weather-app-plan.md` e `specs/weather-app-spec.md`. Os caminhos
abaixo são prováveis; adaptar nomes à estrutura existente sem alterar os
contratos. Cada tarefa deve incluir os testes necessários para verificar sua
unidade; as tarefas de teste explícitas ampliam a cobertura entre unidades e
fluxos. A ordem abaixo respeita as dependências indicadas.

A natureza do horário das condições atuais e seu rótulo permanecem abertos na
spec. T-01 depende de evidência e decisão de produto; não impede as tarefas que
não dependem dela. Não considerar concluída a apresentação final desse horário
nem liberar o produto antes de sua resolução.

## Entrega 1 — Fundamentos

### T-01 — Validar a origem e o rótulo do horário
- **Tipo:** Infra
- **Requisitos:** RF-03, RF-10; CA-10.1; RNF-05.
- **Descrição:** confirmar a natureza do horário na documentação do Open-Meteo e obter decisão de produto para o texto pt-BR.
- **Aceite:** referência à documentação oficial e decisão de produto com responsável e data estão registradas; spec e plano usam o mesmo rótulo e CA-10.1 verifica esse rótulo. Sem decisão, a tarefa permanece bloqueada.
- **Dependências:** nenhuma; depende de validação externa de produto.
- **Arquivos prováveis:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`.

### T-02 — Preparar a entrada da aplicação
- **Tipo:** Infra
- **Requisitos:** RNF-01, RNF-06, RNF-07.
- **Descrição:** configurar o ponto de entrada React/Vite e uma tela inicial mínima em pt-BR.
- **Aceite:** a aplicação inicia sem login ou consulta automática; a interface usa pt-BR e carrega em 320 px sem rolagem horizontal; build compila.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`.

### T-34 — Preparar o tema base
- **Tipo:** Infra
- **Requisitos:** RNF-01, RNF-06.
- **Descrição:** preparar os estilos globais e o tema Tailwind e conectá-los ao ponto de entrada.
- **Aceite:** o ponto de entrada importa o CSS global com as diretivas Tailwind necessárias; o build processa o CSS sem erro e as classes responsivas do tema ficam disponíveis.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/styles/`, `src/main.tsx`.

### T-03 — Definir contratos de cidade e estado
- **Tipo:** Data
- **Requisitos:** RF-01, RF-02, RF-06 a RF-08; RNF-04.
- **Descrição:** definir os tipos de cidade, estados assíncronos e erro conforme o plano.
- **Aceite:** TypeScript strict aceita `City` com e sem região/país; `AsyncState` representa `idle`, `loading`, `success`, `empty` e `error`, com dados ou erro nos estados correspondentes.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/types/city.ts`, `src/types/async-state.ts`.

### T-35 — Definir contratos meteorológicos
- **Tipo:** Data
- **Requisitos:** RF-03 a RF-05, RF-10; RNF-04.
- **Descrição:** definir condição, clima atual, previsão, unidade e agregado de estados.
- **Aceite:** TypeScript strict aceita `CurrentWeather` sem campos opcionais e `FiveDayForecast` com cinco dias; dias disponíveis e indisponíveis são distinguíveis sem preencher ausências com zero.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/types/weather.ts`.

### T-04 — Validar o texto de busca
- **Tipo:** Data
- **Requisitos:** RF-01, RF-09; CA-09.1, CA-09.2.
- **Descrição:** criar função pura de remoção de espaços externos e validação de pelo menos dois caracteres não brancos.
- **Aceite:** vazio, apenas espaços e um caractere são inválidos; acentos, hífens e apóstrofos são preservados como texto literal; nomes válidos retornam o texto normalizado.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/lib/search.ts`.

### T-05 — Converter e formatar temperaturas
- **Tipo:** Data
- **Requisitos:** RF-05; CA-05.2 a CA-05.4; RNF-06.
- **Descrição:** implementar conversão pura a partir de Celsius e formatação localizada.
- **Aceite:** 0 °C resulta em 32 °F e 20,3 °C em 68,5 °F; o valor original não é alterado por conversões sucessivas; a saída usa no máximo uma casa decimal e vírgula pt-BR.
- **Dependências:** T-35.
- **Arquivos prováveis:** `src/lib/temperature.ts`.

### T-06 — Traduzir códigos meteorológicos
- **Tipo:** Data
- **Requisitos:** RF-03, RF-04; CA-03.4; RNF-05, RNF-06.
- **Descrição:** mapear códigos WMO conforme a tabela da spec.
- **Aceite:** todos os códigos listados produzem os textos especificados; código desconhecido produz `Condição desconhecida` e código ausente não é convertido em uma condição válida.
- **Dependências:** T-35.
- **Arquivos prováveis:** `src/lib/weather-code.ts`.

### T-07 — Tratar datas civis e fuso da cidade
- **Tipo:** Data
- **Requisitos:** RF-03, RF-04, RF-10; CA-04.1, CA-10.1; RNF-06.
- **Descrição:** definir funções puras de validação de fuso, datas civis e formatação pt-BR.
- **Aceite:** se a data local for 11/11/2026 e a do dispositivo diferir, as datas são 11/11 a 15/11; horário local 23:30 permanece 23:30; fuso inválido é detectado.
- **Dependências:** T-35.
- **Arquivos prováveis:** `src/lib/date-format.ts`.

### T-08 — Testar conversão de temperatura
- **Tipo:** Test
- **Requisitos:** RF-05; CA-05.2 a CA-05.4; RNF-06.
- **Descrição:** testar conversão e formatação de temperaturas com Vitest.
- **Aceite:** testes verificam 0 °C = 32 °F, 20,3 °C = 68,5 °F, retorno ao valor original em Celsius após alternâncias e separador decimal pt-BR, sem rede.
- **Dependências:** T-05.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.

### T-47 — Testar validação da busca
- **Tipo:** Test
- **Requisitos:** RF-01, RF-09; CA-09.1, CA-09.2.
- **Descrição:** testar normalização e validação da busca com Vitest.
- **Aceite:** testes verificam rejeição de campo vazio, espaços e um caractere e preservação de texto com acento, sem rede.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/unit/search.test.ts`.

### T-36 — Testar códigos WMO e datas locais
- **Tipo:** Test
- **Requisitos:** RF-03, RF-04, RF-10; RNF-06.
- **Descrição:** cobrir mapeamento meteorológico e datas civis com Vitest.
- **Aceite:** testes cobrem todos os códigos da tabela, código desconhecido, fusos diferentes e mudança de dia, sem rede.
- **Dependências:** T-06, T-07.
- **Arquivos prováveis:** `tests/unit/weather-code.test.ts`, `tests/unit/date-format.test.ts`.

## Entrega 2 — Integração Open-Meteo

### T-09 — Implementar transporte HTTP comum
- **Tipo:** Data
- **Requisitos:** RF-07, RF-08; CA-07.2 a CA-07.4; RNF-04.
- **Descrição:** centralizar `fetch`, timeout, cancelamento e classificação de falhas.
- **Aceite:** timeout ocorre após dez segundos; rede, HTTP 429, outros HTTP e JSON inválido são distinguíveis; cancelamento por substituição não vira erro visível e não há retry automático.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/services/openMeteoClient.ts`, `src/services/openMeteoTypes.ts`.

### T-10 — Consultar cidades por geocodificação
- **Tipo:** Data
- **Requisitos:** RF-01, RF-02, RF-06, RF-09; CA-01.1, CA-07.5.
- **Descrição:** consultar e normalizar resultados de geocodificação Open-Meteo.
- **Aceite:** URL codifica a busca literal, solicita `count=10` e retorna até dez cidades na ordem da fonte; `results` vazio, nulo ou ausente não é erro; lista de tipo inválido é erro.
- **Dependências:** T-03, T-04, T-09.
- **Arquivos prováveis:** `src/services/geocodingService.ts`, `src/services/openMeteoTypes.ts`.

### T-11 — Consultar condições atuais
- **Tipo:** Data
- **Requisitos:** RF-03, RF-06, RF-07, RF-10; CA-03.1 a CA-03.3.
- **Descrição:** consultar e normalizar os campos atuais, sem depender da chamada diária.
- **Aceite:** usa coordenadas, Celsius, km/h e `timezone=auto`; dados obrigatórios ou fuso ausentes/inválidos tornam o painel indisponível; opcionais ausentes são omitidos e falhas são classificadas.
- **Dependências:** T-35, T-06, T-07, T-09.
- **Arquivos prováveis:** `src/services/weatherService.ts`, `src/services/openMeteoTypes.ts`.

### T-12 — Consultar previsão diária
- **Tipo:** Data
- **Requisitos:** RF-04, RF-06, RF-07; CA-04.1 a CA-04.4.
- **Descrição:** consultar a previsão diária e associar registros à data local esperada.
- **Aceite:** usa cinco dias e `timezone=auto`; produz cinco posições por data, preserva dias válidos e omite probabilidade ausente; fuso válido sem registros produz cinco indisponíveis e fuso inválido torna o painel indisponível.
- **Dependências:** T-35, T-06, T-07, T-09.
- **Arquivos prováveis:** `src/services/weatherService.ts`, `src/services/openMeteoTypes.ts`.

### T-13 — Testar transporte HTTP
- **Tipo:** Test
- **Requisitos:** RF-07, RF-08; CA-07.2 a CA-07.4.
- **Descrição:** testar cliente HTTP com `fetch` simulado.
- **Aceite:** testes passam para falha de rede, HTTP 429, outro HTTP malsucedido, timeout aos dez segundos e cancelamento por substituição, sem chamadas reais.
- **Dependências:** T-09.
- **Arquivos prováveis:** `tests/unit/openMeteoClient.test.ts`.

### T-37 — Testar geocodificação
- **Tipo:** Test
- **Requisitos:** RF-01, RF-06, RF-09; CA-01.1, CA-07.5.
- **Descrição:** testar o serviço de busca com respostas simuladas.
- **Aceite:** testes verificam `count=10`, texto codificado, ordem e limite, `results` vazio/nulo/ausente e tipo inválido, sem chamadas reais.
- **Dependências:** T-10.
- **Arquivos prováveis:** `tests/unit/geocodingService.test.ts`.

### T-14 — Testar normalização do clima atual
- **Tipo:** Test
- **Requisitos:** RF-03, RF-06, RF-07; RNF-04.
- **Descrição:** exercitar o serviço atual com respostas completas, parciais e inválidas.
- **Aceite:** testes passam para painel indisponível sem fuso ou campo obrigatório, omissão de campo opcional e erro em estrutura inválida, sem rede.
- **Dependências:** T-11.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.

### T-38 — Testar normalização da previsão
- **Tipo:** Test
- **Requisitos:** RF-04, RF-06, RF-07; RNF-04.
- **Descrição:** exercitar o serviço diário com respostas completas, parciais e inválidas.
- **Aceite:** testes passam para painel indisponível sem fuso, cinco posições indisponíveis sem registros e preservação de dias válidos em resposta parcial, sem rede.
- **Dependências:** T-12.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.

## Entrega 3 — Interface

### T-15 — Criar formulário de pesquisa
- **Tipo:** UI
- **Requisitos:** RF-01, RF-09; CA-01.4, CA-09.1, CA-09.2; RNF-02.
- **Descrição:** apresentar entrada rotulada e comando explícito de pesquisa com validação acessível.
- **Aceite:** Enter e botão enviam somente entrada válida; entrada inválida anuncia mensagem e não dispara pesquisa; digitação isolada não consulta a API.
- **Dependências:** T-02, T-04.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`.

### T-16 — Apresentar resultados de cidades
- **Tipo:** UI
- **Requisitos:** RF-02, RF-06; CA-02.1, CA-02.2, CA-06.1; RNF-02.
- **Descrição:** apresentar resultados selecionáveis, contexto geográfico disponível e estado sem resultados.
- **Aceite:** cada opção mostra nome, região e país quando disponíveis, sem inventar valores ausentes; cidade única também exige seleção; seleção funciona por teclado e ausência de resultados é informada.
- **Dependências:** T-02, T-03.
- **Arquivos prováveis:** `src/components/CityResults.tsx`.

### T-17 — Apresentar condições atuais
- **Tipo:** UI
- **Requisitos:** RF-03, RF-06, RF-10; CA-03.1 a CA-03.4, CA-10.1, CA-10.3.
- **Descrição:** apresentar dados atuais, hora local e atribuição da fonte; prever indisponibilidade.
- **Aceite:** temperatura, condição, horário local, unidade e Open-Meteo são exibidos; opcionais ausentes não aparecem como zero; painel indisponível não apresenta dados antigos; rótulo final segue T-01.
- **Dependências:** T-01, T-02, T-35, T-05, T-06, T-07.
- **Arquivos prováveis:** `src/components/CurrentWeatherPanel.tsx`.

### T-18 — Apresentar os cinco dias
- **Tipo:** UI
- **Requisitos:** RF-04, RF-06; CA-04.1 a CA-04.4; RNF-01, RNF-06.
- **Descrição:** renderizar cinco posições com dados e estados de indisponibilidade por dia.
- **Aceite:** cada dia válido mostra data local, condição, mínima e máxima; probabilidade opcional aparece em porcentagem; um dia indisponível não oculta os demais e cinco dias indisponíveis são identificados.
- **Dependências:** T-02, T-35, T-05, T-06, T-07.
- **Arquivos prováveis:** `src/components/ForecastPanel.tsx`.

### T-19 — Criar alternância de unidade
- **Tipo:** UI
- **Requisitos:** RF-05; CA-05.1 a CA-05.6; RNF-02.
- **Descrição:** oferecer controle acessível Celsius/Fahrenheit ligado ao estado de apresentação.
- **Aceite:** o controle identifica a unidade recebida e emite a escolha por teclado ou clique; em teste com componentes simulados, alternar atualiza temperaturas sem chamar o serviço nem alterar vento, umidade ou precipitação.
- **Dependências:** T-02, T-35, T-05.
- **Arquivos prováveis:** `src/components/TemperatureUnitToggle.tsx`.

### T-20 — Criar apresentação de estados assíncronos
- **Tipo:** UI
- **Requisitos:** RF-06 a RF-08; CA-07.1 a CA-07.3; RNF-02.
- **Descrição:** apresentar carregamento, vazio, indisponibilidade e erro com ação de nova tentativa quando aplicável.
- **Aceite:** loading, vazio e erro são visíveis e expostos como estados acessíveis; erro de rede, API ou timeout oferece retry operável por teclado; indisponibilidade não apresenta erro de rede nem retry automático.
- **Dependências:** T-02, T-03.
- **Arquivos prováveis:** `src/components/states/`.

### T-21 — Testar componentes de busca
- **Tipo:** Test
- **Requisitos:** RF-01, RF-02, RF-06, RF-09; RNF-02.
- **Descrição:** testar formulário e resultados com Testing Library.
- **Aceite:** testes verificam mensagem para busca inválida, ausência de chamada durante digitação, mensagem de lista vazia e seleção por teclado de um único resultado, sem rede.
- **Dependências:** T-15, T-16.
- **Arquivos prováveis:** `tests/components/SearchForm.test.tsx`, `tests/components/CityResults.test.tsx`.

### T-39 — Testar painéis meteorológicos
- **Tipo:** Test
- **Requisitos:** RF-03, RF-04, RF-06, RF-10; RNF-06.
- **Descrição:** testar painéis atual e diário com dados simulados.
- **Aceite:** testes verificam fonte e horário local, omissão de opcionais ausentes, cinco datas e preservação de dias válidos quando um dia está indisponível, sem rede.
- **Dependências:** T-17, T-18.
- **Arquivos prováveis:** `tests/components/CurrentWeatherPanel.test.tsx`, `tests/components/ForecastPanel.test.tsx`.

### T-40 — Testar estados assíncronos dos componentes
- **Tipo:** Test
- **Requisitos:** RF-06 a RF-08; CA-07.1 a CA-07.3; RNF-02.
- **Descrição:** testar estados assíncronos com Testing Library e ações simuladas.
- **Aceite:** testes verificam loading, erro, vazio e sucesso; mensagens de estado são acessíveis e retry de erro é operável por teclado, sem rede.
- **Dependências:** T-20.
- **Arquivos prováveis:** `tests/components/AsyncStates.test.tsx`.

### T-48 — Testar o controle de unidade
- **Tipo:** Test
- **Requisitos:** RF-05; CA-05.2, CA-05.3; RNF-02.
- **Descrição:** testar a alternância de unidade com componentes simulados.
- **Aceite:** testes verificam escolha por teclado, valores convertidos e ausência de chamada ao serviço ao alternar, sem rede.
- **Dependências:** T-19.
- **Arquivos prováveis:** `tests/components/TemperatureUnitToggle.test.tsx`.

## Entrega 4 — Orquestração

### T-22 — Orquestrar a busca e a seleção
- **Tipo:** Data
- **Requisitos:** RF-01, RF-02, RF-09; CA-01.2, CA-01.3, CA-02.2, CA-02.3.
- **Descrição:** adicionar ao hook estados de busca e seleção, validação e controle de concorrência.
- **Aceite:** somente busca válida consulta o serviço; a nova busca preserva cidade selecionada; resultado antigo não sobrescreve busca nova; seleção é explícita e oculta dados da cidade anterior.
- **Dependências:** T-03, T-04, T-10.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.

### T-23 — Orquestrar painéis meteorológicos
- **Tipo:** Data
- **Requisitos:** RF-03, RF-04, RF-06, RF-07; CA-02.4, CA-06.2, CA-06.4; RNF-04.
- **Descrição:** iniciar chamadas independentes ao selecionar cidade e manter estados separados por painel.
- **Aceite:** falha ou fuso inválido de uma chamada não oculta dados válidos da outra; respostas de cidade anterior ou chamada substituída, inclusive da mesma cidade, não alteram o estado atual.
- **Dependências:** T-11, T-12, T-22.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.

### T-24 — Repetir consultas com falha
- **Tipo:** Data
- **Requisitos:** RF-07, RF-08; CA-08.1 a CA-08.6; RNF-04.
- **Descrição:** adicionar retry manual por operação e descarte de resposta expirada.
- **Aceite:** cada ação repete uma única chamada com os parâmetros da falha; edição posterior do campo não muda o retry da busca; painel independente é preservado e não ocorre retry automático.
- **Dependências:** T-09, T-22, T-23.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.

### T-25 — Recalcular a previsão na virada local
- **Tipo:** Data
- **Requisitos:** RF-04; CA-04.5, CA-04.6; RNF-06.
- **Descrição:** atualizar a janela diária em memória na virada do fuso da cidade e no retorno de suspensão.
- **Aceite:** após virar de 11/11 para 12/11, mostra 12/11 a 16/11 e marca o dia sem dados indisponível; não envia request; timers e listeners são removidos na troca de cidade e desmontagem.
- **Dependências:** T-07, T-12, T-23.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`, `src/lib/date-format.ts`.

### T-26 — Integrar busca e seleção à tela
- **Tipo:** UI
- **Requisitos:** RF-01, RF-02, RF-09; RNF-01, RNF-02, RNF-07.
- **Descrição:** conectar formulário e resultados ao estado de busca e seleção.
- **Aceite:** primeira visita não tem cidade; busca válida apresenta resultados e exige seleção explícita; componentes não acessam rede diretamente.
- **Dependências:** T-15, T-16, T-22.
- **Arquivos prováveis:** `src/App.tsx`.

### T-49 — Integrar a primeira previsão à tela
- **Tipo:** UI
- **Requisitos:** RF-02, RF-04, RF-06 a RF-08; RNF-01, RNF-02.
- **Descrição:** conectar o painel diário e seus estados à cidade selecionada, antes do painel atual.
- **Aceite:** após seleção, a tela identifica a cidade e Open-Meteo e apresenta cinco posições em Celsius, carregamento, indisponibilidade ou erro com retry manual; não apresenta horário ou condições atuais sem T-01. A virada local e a alternância de unidade são concluídas na fatia seguinte.
- **Dependências:** T-18, T-20, T-23, T-24, T-26.
- **Arquivos prováveis:** `src/App.tsx`.

### T-50 — Testar a primeira previsão em navegador
- **Tipo:** Test
- **Requisitos:** RF-02, RF-04, RF-06, RF-07; RNF-01.
- **Descrição:** verificar a primeira fatia meteorológica com respostas simuladas.
- **Aceite:** em viewport de 320 px, teste seleciona uma cidade, observa carregamento e cinco posições da previsão com fonte; uma resposta sem dados obrigatórios mostra indisponibilidade, sem chamadas reais.
- **Dependências:** T-49.
- **Arquivos prováveis:** `tests/e2e/weather-flow.spec.ts`, `tests/e2e/fixtures/`.

### T-46 — Integrar painéis e unidade à tela
- **Tipo:** UI
- **Requisitos:** RF-03 a RF-08, RF-10; RNF-01, RNF-02, RNF-07.
- **Descrição:** conectar painéis, unidade e recuperação ao estado meteorológico.
- **Aceite:** fluxo usa uma cidade por vez, exibe fonte, começa em Celsius, mantém unidade ao trocar cidade e reinicia ao recarregar; não persiste preferências e componentes não acessam rede diretamente.
- **Dependências:** T-17, T-19, T-25, T-49.
- **Arquivos prováveis:** `src/App.tsx`.

### T-27 — Testar estado de busca e seleção
- **Tipo:** Test
- **Requisitos:** RF-01, RF-02, RF-09; RNF-04.
- **Descrição:** testar busca e seleção no hook com serviços simulados.
- **Aceite:** testes verificam `idle`, `loading`, `success`, `empty` e `error`; resposta de busca anterior não substitui a mais recente e resultado único não é selecionado automaticamente.
- **Dependências:** T-22.
- **Arquivos prováveis:** `tests/hooks/useWeather.test.ts`.

### T-41 — Testar concorrência dos painéis
- **Tipo:** Test
- **Requisitos:** RF-02, RF-03, RF-04, RF-06, RF-07; RNF-04.
- **Descrição:** testar consultas independentes com respostas adiadas.
- **Aceite:** testes verificam que resposta de cidade anterior ou consulta antiga da mesma cidade é ignorada e que falha de um painel preserva o outro válido.
- **Dependências:** T-23.
- **Arquivos prováveis:** `tests/hooks/useWeather.test.ts`.

### T-42 — Testar retry e virada local
- **Tipo:** Test
- **Requisitos:** RF-04, RF-07, RF-08; RNF-04, RNF-06.
- **Descrição:** testar recuperação e calendário do hook com timers controlados.
- **Aceite:** testes verificam uma chamada por retry, descarte da resposta após timeout e datas de 12/11 a 16/11 após virada ou retorno de suspensão, sem consulta automática.
- **Dependências:** T-24, T-25.
- **Arquivos prováveis:** `tests/hooks/useWeather.test.ts`.

## Entrega 5 — Validação e entrega

### T-28 — Testar o fluxo principal em navegador
- **Tipo:** Test
- **Requisitos:** RF-01 a RF-05, RF-09, RF-10; RNF-01, RNF-02.
- **Descrição:** criar E2E com APIs interceptadas para busca, seleção, consulta e troca de unidade.
- **Aceite:** testes exercitam homônimos e resultado único, verificam seleção explícita, cinco dias, fonte, unidade e uso por teclado, inclusive em viewport de 320 px.
- **Dependências:** T-46.
- **Arquivos prováveis:** `tests/e2e/weather-flow.spec.ts`, `tests/e2e/fixtures/`.

### T-29 — Testar falhas de busca em navegador
- **Tipo:** Test
- **Requisitos:** RF-06 a RF-09; CA-06.1, CA-07.1 a CA-07.5, CA-08.1.
- **Descrição:** simular busca vazia, inválida e falha de geocodificação no fluxo E2E.
- **Aceite:** testes verificam mensagem de ausência de cidades, entrada inválida sem request e retry manual com a consulta que falhou, mesmo após editar o campo.
- **Dependências:** T-46.
- **Arquivos prováveis:** `tests/e2e/weather-errors.spec.ts`, `tests/e2e/fixtures/`.

### T-43 — Testar recuperação dos painéis em navegador
- **Tipo:** Test
- **Requisitos:** RF-06 a RF-08; CA-06.2 a CA-06.4, CA-08.2 a CA-08.6.
- **Descrição:** simular timeout e dados meteorológicos parciais no fluxo E2E.
- **Aceite:** testes verificam que erro ou timeout de um painel oferece retry manual e preserva o outro; não há retry automático e resposta tardia não sobrescreve dados atuais.
- **Dependências:** T-46.
- **Arquivos prováveis:** `tests/e2e/weather-errors.spec.ts`, `tests/e2e/fixtures/`.

### T-30 — Testar responsividade e teclado
- **Tipo:** Test
- **Requisitos:** RNF-01, RNF-02; RF-01, RF-02, RF-05 a RF-08.
- **Descrição:** verificar viewports, foco e operação por teclado em navegador.
- **Aceite:** fluxos sem corte ou rolagem horizontal em 320, 768 e 1280 px; foco e nomes acessíveis são verificados.
- **Dependências:** T-46.
- **Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`.

### T-44 — Auditar WCAG e tecnologias assistivas
- **Tipo:** Test
- **Requisitos:** RNF-02; RF-01, RF-02, RF-05 a RF-08.
- **Descrição:** executar auditoria manual WCAG 2.2 AA e verificar anúncios com tecnologia assistiva.
- **Aceite:** registrar navegadores, tecnologias assistivas, fluxos e resultados; busca, seleção, consulta e retry atendem WCAG 2.2 AA, sem não conformidades pendentes para entrega.
- **Dependências:** T-46, T-30.
- **Arquivos prováveis:** `docs/`.

### T-31 — Medir desempenho das consultas
- **Tipo:** Test
- **Requisitos:** RNF-03; RF-07.
- **Descrição:** medir carregamento e tempo de resultado no ambiente definido na spec.
- **Aceite:** registrar navegador, hardware e sistema; com Chrome estável, viewport 1280 × 720, CPU 4×, latência 100 ms e resposta em até 4 s, medir 100 consultas sequenciais: carregamento em até 100 ms e p95 até 5 s; verificar timeout de 10 s.
- **Dependências:** T-46.
- **Arquivos prováveis:** `tests/e2e/performance.spec.ts`, `docs/`.

### T-32 — Configurar testes de navegadores no CI
- **Tipo:** Test
- **Requisitos:** RNF-08; RF-01 a RF-08.
- **Descrição:** configurar e executar os fluxos essenciais nos navegadores disponíveis no CI.
- **Aceite:** os fluxos de T-28, T-29 e T-43 executam nos navegadores configurados no CI; relatório registra navegador, versão, resultado e alvos não executados para validação manual.
- **Dependências:** T-28, T-29, T-43.
- **Arquivos prováveis:** `playwright.config.ts`.

### T-45 — Validar navegadores e dispositivos reais
- **Tipo:** Test
- **Requisitos:** RNF-08; RF-01 a RF-08.
- **Descrição:** validar manualmente os alvos não cobertos no CI, inclusive dispositivos móveis reais.
- **Aceite:** versões e resultados cobrem as duas versões estáveis mais recentes dos navegadores suportados, incluindo Safari iOS e Chrome Android; qualquer alvo sem evidência bloqueia entrega.
- **Dependências:** T-32.
- **Arquivos prováveis:** `docs/`.

### T-33 — Executar os gates de código e entrega
- **Tipo:** Infra
- **Requisitos:** RNF-02, RNF-03, RNF-08; RF-01 a RF-10.
- **Descrição:** executar as verificações obrigatórias e consolidar evidências da versão.
- **Aceite:** `pnpm lint`, `pnpm build`, `pnpm test` e os E2E aplicáveis passam; resultados de T-01, T-30, T-31, T-32, T-44 e T-45 estão registrados; falhas e alvos não validados bloqueiam entrega.
- **Dependências:** T-01, T-08, T-13, T-14, T-21, T-27, T-28, T-29, T-30, T-31, T-32, T-36, T-37, T-38, T-39, T-40, T-41, T-42, T-43, T-44, T-45, T-47, T-48, T-50.
- **Arquivos prováveis:** `docs/`.

## Rastreabilidade funcional

As tarefas de implementação abaixo incluem regras, serviços, interface e
orquestração. Tarefas de teste são listadas separadamente.

| Requisito da spec | Tarefas de implementação | Tarefas de teste |
| --- | --- | --- |
| RF-01 — Pesquisar cidades | T-04, T-10, T-15, T-22, T-26 | T-21, T-27, T-28, T-37, T-47 |
| RF-02 — Selecionar cidade | T-16, T-22, T-23, T-26, T-49 | T-21, T-27, T-28, T-41, T-50 |
| RF-03 — Condições atuais | T-06, T-07, T-11, T-17, T-23, T-46 | T-14, T-28, T-36, T-39, T-41 |
| RF-04 — Previsão diária | T-06, T-07, T-12, T-18, T-23, T-25, T-46, T-49 | T-28, T-36, T-38, T-39, T-41, T-42, T-50 |
| RF-05 — Alternar temperatura | T-05, T-19, T-46 | T-08, T-28, T-48 |
| RF-06 — Informar ausência de dados | T-10, T-11, T-12, T-16, T-17, T-18, T-20, T-23, T-46, T-49 | T-14, T-21, T-29, T-37, T-38, T-39, T-40, T-41, T-43, T-50 |
| RF-07 — Carregamento e falhas | T-09, T-11, T-12, T-20, T-23, T-46, T-49 | T-13, T-14, T-29, T-31, T-38, T-40, T-41, T-43, T-50 |
| RF-08 — Nova tentativa | T-20, T-24, T-46, T-49 | T-13, T-29, T-40, T-42, T-43 |
| RF-09 — Validar pesquisa | T-04, T-10, T-15, T-22, T-26 | T-21, T-27, T-28, T-29, T-37, T-47 |
| RF-10 — Identificar atualidade | T-07, T-11, T-17, T-46 | T-28, T-36, T-39 |

**Lacunas:** nenhum dos dez requisitos funcionais está sem tarefa de
implementação. A rotulagem final do horário em RF-03 e RF-10 depende da decisão
de produto em T-01; enquanto ela não for tomada, T-17 e a entrega permanecem
bloqueadas.

## Prioridade e tamanho

P0 entrega as primeiras fatias utilizáveis; P1 completa o escopo e os gates;
P2 reúne verificação complementar. P, M e G indicam esforço relativo pequeno,
médio e grande, não prazo. Prioridade não substitui dependências: tarefas de
qualquer prioridade continuam necessárias quando exigidas pelo plano ou por
T-33, inclusive as de P2. IDs na mesma linha têm a mesma classificação.

| Prioridade | Tamanho | Tarefas |
| --- | --- | --- |
| P0 | P | T-03, T-04, T-05, T-06, T-07, T-15, T-16, T-18, T-20, T-34, T-35 |
| P0 | M | T-02, T-09, T-10, T-11, T-12, T-22, T-23, T-24, T-26, T-49, T-50 |
| P1 | P | T-01, T-08, T-13, T-14, T-19, T-21, T-27, T-37, T-38, T-40, T-41, T-42, T-47, T-48 |
| P1 | M | T-17, T-25, T-28, T-29, T-30, T-32, T-33, T-39, T-43, T-46 |
| P1 | G | T-31, T-44, T-45 |
| P2 | P | T-36 |

## Fatias verticais

Cada fatia acumula as anteriores. As primeiras são incrementos verificáveis,
não uma liberação de produção incompleta; os gates e o escopo completo continuam
obrigatórios. Dentro de cada fatia, seguir as dependências das tarefas.

1. **Tela inicial:** T-02, T-34. Resultado: aplicação visível, responsiva e sem busca automática.
2. **Busca real:** T-03, T-04, T-09, T-10, T-15, T-16, T-22, T-26; validar com T-13, T-21, T-27, T-37, T-47. Resultado: pesquisar e selecionar uma cidade com dados reais de geocodificação.
3. **Previsão visível:** T-35, T-05, T-06, T-07, T-11, T-12, T-18, T-20, T-23, T-24, T-49, T-50; validar também com T-08, T-14, T-36, T-38, T-40, T-41. Resultado: cinco posições diárias após seleção, com estados e retry. Condições atuais, conversão e virada local ainda não compõem essa fatia.
4. **Fluxo completo:** resolver T-01; executar T-17, T-19, T-25, T-46 e validar com T-28, T-29, T-39, T-42, T-43, T-48. Resultado: condições atuais, alternância e virada local integradas; T-01 continua bloqueada até decisão de produto.
5. **Qualidade e entrega:** T-30, T-31, T-32, T-44, T-45, T-33. Resultado: evidências de responsividade, acessibilidade, desempenho, compatibilidade e gates registrados antes da liberação.