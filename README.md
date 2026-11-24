# Pokédex Aventura

Aplicação web responsiva para explorar Pokémon, consultar características e habilidades, filtrar por tipo e montar um time de até seis integrantes. O projeto consome a PokéAPI diretamente pelo navegador usando `fetch`, sem back-end e sem bibliotecas JavaScript adicionais (Bootstrap é utilizado apenas como framework CSS e seu bundle oficial para componentes).

## Integrantes
- Nome completo: **Matheus Ferreira Laurintino**
- Matrícula: **202511708**
- (Se houver outros integrantes, adicionar nome completo e matrícula.)

## Links da entrega
- GitHub Pages: **Adicionar após publicar no GitHub Pages**
- Repositório GitHub: **Adicionar após criar o repositório**

## Tecnologias
- HTML5 semântico (`header`, `nav`, `main`, `section`, `footer`)
- CSS3
- JavaScript puro (ES6+, `async/await`, `fetch`)
- Bootstrap 5.3.3 (grid, navbar, botões, formulário, alertas e modal)
- PokéAPI v2

## APIs e endpoints utilizados

| Método | URL | Uso na aplicação |
|---|---|---|
| GET | `https://pokeapi.co/api/v2/pokemon/{id ou nome}` | Pesquisa por nome/número, cartões, tipos, imagens e atributos base |
| GET | `https://pokeapi.co/api/v2/pokemon-species/{id ou nome}` | Complementa a ficha com descrição e classificação da espécie |
| GET | `https://pokeapi.co/api/v2/type/{tipo}` | Filtro por tipo; os Pokémon retornados são exibidos na grade |
| GET | `https://pokeapi.co/api/v2/ability/{nome}` | Consulta a descrição da habilidade selecionada na ficha |

Os quatro caminhos de recurso são distintos e cada resposta tem efeito visível na interface.

## Como executar
1. Extraia o ZIP.
2. Abra `index.html` em um navegador com internet. Para uma execução local mais próxima de hospedagem, também é possível usar a extensão Live Server do VS Code.
3. Pesquise por exemplo `pikachu` ou `25`, filtre pelo seletor de tipo e abra **Detalhes**.
4. Na ficha, clique em uma habilidade para consultar seu efeito.
5. Use **+ Time** para montar uma equipe de até seis Pokémon. O time fica salvo no `localStorage` do navegador.

## Tratamento de falhas implementado
- Campo vazio e entrada inválida são validados antes da requisição.
- Respostas HTTP são verificadas com `response.ok`; erro 404 recebe mensagem específica.
- Falha de conexão/API é capturada com `try/catch` e apresentada na tela.
- Pesquisa sem resultado apresenta aviso.
- Indicador de carregamento aparece durante consultas e o botão de pesquisa/filtro é desativado.
- Botão de pesquisa permite tentar novamente após uma falha.

## Responsividade
O layout usa o grid e componentes do Bootstrap e regras CSS para telas pequenas, médias e grandes. Teste no modo dispositivo do DevTools em aproximadamente 360 px, tablet e desktop.

## Publicação no GitHub Pages
1. Crie um repositório público no GitHub e envie todos os arquivos desta pasta.
2. No repositório, abra **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch `main` e a pasta `/ (root)` e salve.
5. Aguarde a publicação, abra o endereço indicado pelo GitHub Pages e teste em uma janela anônima.
6. Cole o link publicado e o link do repositório na seção **Links da entrega** deste README.

## Vídeo de apresentação
Grave um vídeo de no máximo 5 minutos demonstrando o site publicado, explicando os quatro endpoints e mostrando pelo menos uma falha e a versão responsiva. Consulte `roteiro-video.md`. Coloque o link do vídeo aqui (YouTube não listado ou Drive com acesso liberado): **Adicionar após gravar o vídeo**.

## Créditos
Dados fornecidos pela [PokéAPI](https://pokeapi.co/). Pokémon e seus nomes são marcas de seus respectivos titulares. Projeto acadêmico sem finalidade comercial.
