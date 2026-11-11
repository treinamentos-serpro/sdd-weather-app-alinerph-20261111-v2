# Discovery — Weather App

## Contexto

A empresa solicitou uma aplicação web de previsão do tempo. O briefing inicial
define que usuários devem poder buscar cidades, consultar o clima atual, ver a
previsão de cinco dias, alternar entre Celsius e Fahrenheit e usar a aplicação
em dispositivos móveis. Esta análise organiza o que já é conhecido e destaca
questões ainda pendentes que precisam ser resolvidas ou explicitamente adiadas
antes da especificação detalhada.

### Personas e objetivos

| Persona | Contexto de uso | Objetivo principal | Métrica de sucesso percebida |
| --- | --- | --- | --- |
| Pessoa que planeja atividades | Consulta a previsão no celular ou desktop antes de sair | Saber como estará o tempo nos próximos dias | Encontra a previsão da cidade e do período desejados sem precisar repetir a busca |
| Viajante | Pesquisa cidades de destino, muitas vezes em um dispositivo móvel | Comparar o clima atual e a previsão de um destino | Identifica corretamente a cidade de destino e consulta seus cinco dias de previsão |
| Pessoa que decide o que vestir | Faz uma consulta rápida no celular | Entender as condições do dia e escolher roupas adequadas | Consulta rapidamente a condição atual e a temperatura na unidade que prefere |

## Requisitos Funcionais

Descrevem ações e respostas que o sistema deve oferecer ao usuário.

- **RF-01:** permitir que o usuário pesquise cidades por nome.
- **RF-02:** permitir que o usuário selecione uma cidade entre os resultados da pesquisa.
- **RF-03:** exibir as condições atuais do tempo para a cidade selecionada.
- **RF-04:** exibir a previsão do tempo para cinco dias.
- **RF-05:** permitir alternar a unidade de temperatura entre Celsius e Fahrenheit.
- **RF-06:** informar quando a pesquisa não encontrar cidades ou quando não houver dados meteorológicos disponíveis.
- **RF-07:** apresentar o estado de carregamento e informar quando ocorrer uma falha ao consultar os dados.
- **RF-08:** permitir que o usuário tente novamente uma consulta que falhou.

## Requisitos Não-Funcionais

Descrevem atributos de qualidade e restrições sobre como o sistema deve operar,
em vez de funcionalidades específicas.

- **RNF-01 — Responsividade:** a interface deve manter legibilidade e usabilidade em dispositivos móveis e desktops, em diferentes larguras de tela.
- **RNF-02 — Acessibilidade:** a aplicação deve atender a necessidades de uso por teclado e tecnologias assistivas, com semântica e nomes acessíveis.
- **RNF-03 — Desempenho:** o tempo de resposta das consultas deve ser adequado para uso interativo; o limite mensurável deve ser definido na especificação.
- **RNF-04 — Disponibilidade e resiliência:** falhas temporárias de rede ou do serviço meteorológico não devem comprometer o restante da aplicação, e a recuperação deve ser possível sem reiniciar a aplicação.
- **RNF-05 — Usabilidade e clareza:** informações meteorológicas devem ser apresentadas de forma legível e consistente, com unidades e referências temporais compreensíveis.
- **RNF-06 — Internacionalização (i18n):** a interface deve oferecer conteúdo em português do Brasil (pt-BR), incluindo formatação local de datas e números.

### Revisão da classificação, item a item

Os itens RF-01 a RF-08 são comportamentos ou respostas observáveis do sistema e,
portanto, são requisitos funcionais. Alguns detalham comportamentos necessários
para tornar as funções centrais utilizáveis, mas não foram explicitados no
briefing original.

| Item | Classificação | Avaliação |
| --- | --- | --- |
| RF-01 — Pesquisar cidades por nome | Funcional | Classificação correta; corresponde a “buscar cidades”. |
| RF-02 — Selecionar uma cidade nos resultados | Funcional | Classificação correta; é um passo funcional necessário para consultar um local sem ambiguidade. |
| RF-03 — Exibir o clima atual | Funcional | Classificação correta; está explícito no briefing. |
| RF-04 — Exibir a previsão para cinco dias | Funcional | Classificação correta; está explícito, embora a inclusão de hoje ainda dependa da decisão registrada. |
| RF-05 — Alternar Celsius/Fahrenheit | Funcional | Classificação correta; está explícito no briefing. |
| RF-06 — Informar busca sem resultados ou falta de dados | Funcional | Classificação correta; é uma resposta do sistema, inferida para cobrir resultados vazios. |
| RF-07 — Apresentar carregamento e falha de consulta | Funcional | Classificação correta; descreve estados observáveis. Resiliência e disponibilidade que os sustentam são não-funcionais. |
| RF-08 — Permitir nova tentativa | Funcional | Classificação correta; ação funcional inferida para recuperação de falhas. |
| RNF-01 — Responsividade em dispositivos móveis e desktops | Não-funcional | Classificação correta; “usar em dispositivos móveis” é principalmente uma exigência de responsividade e usabilidade. |
| RNF-02 — Acessibilidade | Não-funcional | Requisito adicional recomendável, não declarado no briefing. |
| RNF-03 — Desempenho | Não-funcional | Requisito adicional recomendável; precisa de metas mensuráveis. |
| RNF-04 — Disponibilidade e resiliência | Não-funcional | Requisito adicional recomendável; define a qualidade de operação diante de falhas. |
| RNF-05 — Usabilidade e clareza | Não-funcional | Requisito adicional recomendável; complementa as funções sem descrever uma ação específica. |
| RNF-06 — Idioma e localidade pt-BR | Não-funcional | Classificação correta como qualidade/localização, mas é uma decisão do exercício, não uma exigência do briefing original. |

Não há item funcional classificado incorretamente na lista atual. O principal
ajuste de classificação é tratar a exigência de uso em dispositivos móveis como
responsividade (não como uma nova função de negócio); carregamento, erro e
tentativa novamente continuam funcionais, enquanto disponibilidade e resiliência
são requisitos não-funcionais relacionados.

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Indisponibilidade, lentidão ou limite de requisições do serviço meteorológico | Média | Alto: clima e previsão podem não carregar | Exibir estados de carregamento e erro; permitir nova tentativa e evitar requisições desnecessárias |
| Pesquisa retorna uma cidade ambígua ou incorreta | Média | Alto: o usuário pode consultar o clima do local errado | Mostrar informações suficientes para distinguir resultados, como região e país, e exigir seleção explícita |
| Falha ou instabilidade de conexão do usuário | Média | Médio: consultas podem falhar ou demorar | Tratar timeout e erro de rede com mensagem clara e opção de tentar novamente |
| Datas ou dias da previsão são interpretados incorretamente por diferença de fuso horário | Média | Alto: a previsão pode ser atribuída ao dia errado | Usar o fuso horário associado à localização e validar a apresentação das datas |
| Interface ou controles ficam difíceis de usar em telas pequenas | Média | Médio: fluxos de busca e consulta ficam prejudicados | Projetar e verificar os fluxos em viewport mobile, com controles responsivos e acessíveis |
| A busca ou os dados disponíveis não atendem às localidades prioritárias do público | Média | Alto: usuários não encontram destinos relevantes ou recebem cobertura incompleta | Confirmar mercados e cobertura geográfica esperada; validar exemplos representativos antes de fechar a especificação |
| As personas e os conteúdos propostos não refletem as necessidades reais dos usuários | Média | Médio: pode haver retrabalho de UX e priorização de informações pouco úteis | Tratar as personas como hipóteses e validá-las com stakeholders ou pesquisa com usuários |
| A interface sugere precisão ou atualização maior do que a fonte de dados oferece | Média | Alto: decisões podem ser tomadas com dados antigos, incompletos ou mal interpretados | Definir atualização, horário da observação, atribuição da fonte e apresentação de indisponibilidade |

## Perguntas em Aberto (Open Questions)

As perguntas abaixo ainda precisam de definição de produto; as decisões fixadas
para o exercício estão registradas em **Decisões (Decisions)**.

| Pergunta | Impacto se ficar sem resposta |
| --- | --- |
| Quais públicos e tarefas devem ter prioridade, e como será medido o sucesso para cada um? | As personas atuais são hipóteses; sem prioridade, não há critério claro para resolver conflitos de UX ou avaliar se o produto atende às necessidades. |
| Quais países, regiões ou localidades devem ser pesquisáveis? | A cobertura e os limites da busca ficam indefinidos, podendo excluir usuários ou destinos relevantes. |
| A busca deve aceitar nomes parciais, acentos, grafias alternativas e nomes em outros idiomas? Deve sugerir resultados enquanto o usuário digita? | A experiência, a acessibilidade e o comportamento da busca podem variar, além de gerar consultas desnecessárias. |
| Quantos resultados de busca devem ser exibidos e quais dados os distinguem (por exemplo, região, estado ou país)? | O usuário pode não conseguir encontrar ou distinguir cidades homônimas, sobretudo em telas pequenas. |
| A aplicação deve detectar automaticamente a localização do usuário? Em caso afirmativo, qual alternativa oferecer se a permissão for negada ou indisponível? | Não é possível definir a experiência inicial, o tratamento de permissões e o caminho de recuperação sem acesso à localização. |
| O que deve aparecer antes de uma cidade ser pesquisada ou selecionada: uma tela vazia, uma cidade padrão ou a localização atual? | O primeiro uso fica sem comportamento definido e pode parecer incompleto ou solicitar dados sem contexto. |
| Quais campos devem compor o clima atual além da temperatura (por exemplo, sensação térmica, umidade, vento e condição textual)? | O conteúdo, o espaço necessário na interface e os dados requeridos podem mudar durante a implementação. |
| Com que frequência as condições atuais devem ser atualizadas, e a interface deve mostrar quando os dados foram observados? | Os dados podem parecer desatualizados ou gerar tráfego excessivo; também fica indefinido como comunicar sua atualidade. |
| A previsão diária deve incluir temperaturas mínima e máxima, probabilidade de precipitação, vento ou outros dados? É necessário detalhamento por hora? | O escopo visual e os dados necessários para a previsão permanecem indefinidos, embora o período de cinco dias já esteja decidido. |
| Datas e dias da previsão devem seguir o fuso horário da cidade pesquisada ou o do dispositivo do usuário? | Uma previsão pode aparecer associada ao dia errado, especialmente para cidades em outros fusos. |
| A alternância Celsius/Fahrenheit se aplica apenas à temperatura? Quais unidades devem ser usadas para vento, precipitação e outras medidas? | Os valores podem ser inconsistentes ou incompreensíveis; a decisão de Celsius como unidade inicial não define as demais unidades. |
| A cidade pesquisada e a unidade escolhida devem permanecer após recarregar ou reabrir a aplicação? Se sim, podem ser guardadas apenas no dispositivo? | Sem essa definição, a experiência entre sessões varia e pode haver confusão sobre persistência local versus persistência em servidor. |
| Deve haver cache ou suporte de leitura offline para consultas anteriores? Por quanto tempo os dados em cache seriam considerados válidos? | O comportamento sem conexão e a atualidade dos dados ficam indefinidos, podendo levar a exibir informação antiga como se fosse atual. |
| Quais falhas devem permitir nova tentativa automática ou manual, e após quanto tempo uma consulta deve expirar? | O usuário pode esperar indefinidamente, sofrer tentativas excessivas ou não saber como recuperar a consulta. |
| Como a aplicação deve se comportar quando o serviço Open-Meteo (fonte principal já decidida) estiver indisponível ou limitar requisições: exibir erro com nova tentativa ou recorrer a uma fonte alternativa? | Sem uma política de contingência, a recuperação fica indefinida; uma fonte alternativa também poderia mudar cobertura, precisão ou formato dos dados. |
| Qual é o tempo máximo aceitável para resultados de busca e dados meteorológicos em condições normais? | O requisito de desempenho fica subjetivo e não pode ser verificado de forma consistente. |
| Quais critérios de acessibilidade e combinações de navegador/dispositivo devem ser suportados? | “Acessível” e “mobile” permanecem difíceis de validar sem alvos de conformidade e ambientes definidos. |

## Decisões (Decisions)

| Tema | Decisão | Justificativa | Pergunta(s) em aberto resolvida(s) |
| --- | --- | --- | --- |
| Fonte de dados | Open-Meteo, sem API key | Evita configurar e distribuir credenciais e oferece geocoding e previsão para o treinamento. | Qual fonte será usada, se exige chave e qual serviço fornece geocoding e previsão. Cobertura geográfica e comportamento de contingência continuam em aberto. |
| Período da previsão | Hoje e os quatro dias seguintes | Mantém cinco dias no total e inclui o dia atual para consultas imediatas e planejamento de curto prazo. | Se “cinco dias” inclui hoje ou corresponde aos cinco dias seguintes. |
| Unidade inicial | Celsius, com opção de alternar para Fahrenheit | É o padrão esperado para o público pt-BR, enquanto a alternância atende quem prefere Fahrenheit. | Qual unidade será exibida inicialmente. A aplicação da alternância a outras medidas continua em aberto. |
| Autenticação | Não exigir login | A consulta do clima não exige uma conta; remover autenticação reduz atrito e escopo sem bloquear as funções centrais. | Se é necessário cadastro ou autenticação para usar as funções centrais. |
| Persistência no servidor | Não armazenar buscas ou preferências em servidor | O app pode funcionar sem backend de usuário, reduzindo complexidade e tratamento de dados pessoais. Persistência local continua em aberto. | Se os dados pessoais ou preferências serão armazenados em servidor. A persistência local e o comportamento entre sessões continuam em aberto. |
| Idioma e localidade | Português do Brasil (pt-BR) | Define os textos e a formatação local de datas e números para o público-alvo do treinamento. | Qual idioma será oferecido e como datas e números serão localizados. |

## Suposições (Assumptions)

### Suposições de trabalho

- O usuário inicia uma pesquisa informando o nome de uma cidade; não se presume uso de geolocalização automática.
- A aplicação depende de uma conexão disponível para buscar dados meteorológicos; comportamento offline permanece em aberto.
- A seleção explícita de um resultado de cidade é preferível a escolher silenciosamente um local quando houver correspondências ambíguas.
- As personas acima são hipóteses iniciais para orientar a descoberta, não resultados de pesquisa com usuários.

## Crítica para iniciar a especificação com segurança

O escopo funcional central está claro, e as decisões de fonte, período, unidade
inicial, autenticação e idioma reduzem incertezas importantes. Ainda assim, a
especificação pode gerar retrabalho se os pontos abaixo forem tratados como
detalhes de implementação sem decisão de produto:

- **Conteúdo e nível de detalhe:** definir quais variáveis compõem o clima atual
	e cada dia da previsão, e se haverá previsão por hora. Isso afeta a seleção de
	dados, a hierarquia visual e o espaço disponível em telas pequenas.
- **Busca e localização:** definir cobertura geográfica, tratamento de acentos e
	grafias alternativas, quantidade de resultados e informação para distinguir
	homônimos. A fonte Open-Meteo não resolve por si só a experiência de seleção.
- **Tempo e atualidade dos dados:** decidir o fuso horário usado para agrupar os
	dias, quando as condições atuais são atualizadas e como mostrar o horário da
	observação. Caso contrário, “hoje” e a atualidade podem ser interpretados de
	maneiras diferentes pelo usuário.
- **Unidades:** esclarecer se Celsius/Fahrenheit altera somente temperatura ou
	também as demais medidas, além de definir unidades de vento e precipitação.
- **Falhas e desempenho:** estabelecer timeout, política de nova tentativa,
	eventual uso de cache, comportamento sem conexão e metas mensuráveis de tempo
	de resposta. Sem isso, critérios de aceitação não são verificáveis.
- **Alvos de qualidade:** definir navegadores e dispositivos suportados e o
	critério de acessibilidade esperado. “Mobile” e “acessível” ainda não delimitam
	um conjunto testável de condições.
- **Primeiro acesso e persistência local:** decidir o que aparece antes da
	primeira busca e se cidade/unidade persistem no dispositivo. As decisões de
	não autenticar e não persistir no servidor não respondem a essas questões.

Antes de iniciar a especificação, recomenda-se priorizar as decisões sobre
campos meteorológicos, busca/desambiguação, fuso horário e critérios verificáveis
de desempenho e acessibilidade. As demais podem ser registradas como escopo
explicitamente adiado, desde que a experiência de primeira utilização e as
falhas tenham comportamento definido.

## Resumo executivo

O discovery define uma aplicação de clima que permite buscar cidades, consultar condições atuais e ver cinco dias de previsão.
Usuários também poderão alternar entre Celsius e Fahrenheit e utilizar o serviço em dispositivos móveis.
Open-Meteo, Celsius como padrão, ausência de login e idioma pt-BR foram definidos para destravar a especificação.
Busca ambígua, conteúdo meteorológico, fuso horário, atualização dos dados e metas de qualidade ainda exigem decisões.
Os principais riscos são indisponibilidade ou cobertura insuficiente dos dados, localização incorreta e uma experiência inadequada em telas pequenas.