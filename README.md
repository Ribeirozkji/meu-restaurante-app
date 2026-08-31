# Chef's Choice

PROMPT PARA LOVABLE — FRONTEND DE SISTEMA EXCLUSIVO DE UM RESTAURANTE



Crie SOMENTE O FRONTEND de uma aplicação web responsiva para um restaurante/cantina específico.



A aplicação NÃO será um marketplace e NÃO terá múltiplos restaurantes.



Existe apenas um único estabelecimento, que possui:



- Um cardápio digital próprio

- Seus próprios clientes

- Seus próprios pedidos

- Seu próprio estoque

- Seus próprios relatórios

- Seu próprio painel administrativo

- Seu próprio sistema de pagamento PIX



O cliente entra diretamente no sistema desse restaurante para fazer seu pedido.



IMPORTANTE — ESCOPO



Não criar:



- Backend

- Banco de dados

- API real

- Autenticação real

- Sistema multi-restaurante

- Cadastro de vários restaurantes

- Gateway de pagamento real

- Integração fiscal real



Utilize dados mockados e estado local para demonstrar o funcionamento.



O frontend deve ser construído de forma que futuramente possa ser conectado a um backend.



---



1. STACK



Utilizar:



- React

- TypeScript

- Vite

- Tailwind CSS

- React Router

- Lucide React

- Recharts

- Componentes reutilizáveis

- localStorage quando necessário



---



2. IDENTIDADE DO RESTAURANTE



A aplicação deve ter uma identidade visual única e consistente para o restaurante.



Criar uma estrutura centralizada para configurar:



restaurant = {

  name: "Nome do Restaurante",

  logo: "...",

  address: "...",

  phone: "...",

  openingHours: "...",

  pixKey: "..."

}



Utilizar dados fictícios inicialmente.



O nome, logo, endereço e demais informações devem aparecer automaticamente nas páginas em que forem necessárias.



A interface deve dar a sensação de que o cliente está acessando diretamente o sistema oficial do restaurante.



---



3. FLUXO INICIAL



Ao entrar na aplicação, mostrar a identidade do restaurante.



Exemplo:



[LOGO]



Restaurante Sabor da Casa



"Peça sua refeição de forma rápida e fácil."



Botão:



Ver cardápio



Não criar uma tela perguntando qual restaurante o usuário deseja escolher.



Existe somente um restaurante.



---



4. ÁREA DO CLIENTE



Criar as seguintes rotas:



/

 /cardapio

 /produto/:id

 /carrinho

 /checkout

 /pedido/:id

 /perfil

 /enderecos

 /historico



---



5. CARDÁPIO DIGITAL



A página principal deve ser o cardápio digital do restaurante.



No topo:



- Logo

- Nome do restaurante

- Status "Aberto" / "Fechado"

- Horário de funcionamento

- Busca

- Carrinho

- Perfil



Adicionar banner de promoção.



Categorias



Criar categorias relacionadas às refeições:



- Café da manhã

- Lanches

- Almoço

- Jantar

- Bebidas

- Sobremesas

- Promoções



As categorias devem funcionar como filtros.



---



6. PRATOS



Criar cards de produtos contendo:



- Foto

- Nome

- Descrição

- Preço

- Categoria

- Avaliação

- Disponibilidade

- Botão "Adicionar"



Exemplo:



X-Burger Especial



Hambúrguer artesanal, queijo, alface, tomate e molho especial.



R$ 18,90



Ao clicar, abrir detalhes:



- Foto grande

- Nome

- Descrição

- Ingredientes

- Preço

- Adicionais

- Observação

- Quantidade

- Botão "Adicionar ao carrinho"



---



7. CARRINHO



Criar carrinho completo.



Mostrar:



- Produtos

- Foto

- Quantidade

- Preço

- Subtotal

- Taxa de entrega

- Total



Também mostrar endereço de entrega.



---



8. ENDEREÇO E TAXA DE ENTREGA



Criar seção:



Endereço de entrega



O cliente poderá:



- Cadastrar endereço

- Editar endereço

- Excluir endereço

- Selecionar endereço principal



Campos:



- CEP

- Rua

- Número

- Complemento

- Bairro

- Cidade

- Estado

- Referência



---



9. REGRA DE ENTREGA



A regra da aplicação será:



A cada 2 km → + R$ 2,00



Exemplos:



2 km = R$ 2,00



4 km = R$ 4,00



6 km = R$ 6,00



8 km = R$ 8,00



Criar uma função frontend separada para esse cálculo.



Por enquanto usar uma distância simulada.



Exemplo:



Distância estimada

4,3 km



Taxa de entrega

R$ 6,00



Deixar essa função preparada para futuramente receber a distância real de uma API de mapas.



---



10. CHECKOUT



Criar checkout contendo:



Produtos



Lista dos produtos.



Entrega



Endereço selecionado.



Pagamento



Opções:



- PIX

- Dinheiro

- Cartão



---



11. PIX



O PIX será destinado diretamente ao restaurante específico.



Criar uma tela visual de pagamento contendo:



Pague para:



Restaurante Sabor da Casa



Valor:



R$ 42,90



Mostrar:



- QR Code fictício

- Chave PIX fictícia

- Código PIX Copia e Cola

- Botão "Copiar PIX"



Criar botão:



Já realizei o pagamento



Não implementar pagamento real.



---



12. PEDIDO CONCLUÍDO



Depois de confirmar o pedido, mostrar uma tela:



Pedido realizado!



Seu pedido foi enviado para o restaurante.



Código do pedido



PED-20260829-0042



Mostrar:



- Código

- Data

- Horário

- Valor

- Forma de pagamento

- Endereço

- Status



Status:



Pedido recebido



Depois disponibilizar visualmente:



Acompanhar pedido



---



13. HISTÓRICO DO CLIENTE



Criar página:



Meus pedidos



Mostrar todos os pedidos anteriores.



Cada pedido deve mostrar:



- Código

- Data

- Horário

- Produtos

- Total

- Status



Exemplo:



PED-20260828-0018



X-Burger

Coca-Cola

Batata



R$ 38,90



Entregue



---



14. PERFIL DO CLIENTE



Criar perfil contendo:



- Foto/avatar

- Nome

- Telefone

- E-mail

- Endereços

- Histórico



Criar seção:



Meus favoritos / mais pedidos



Mostrar os produtos que o cliente mais costuma pedir.



Exemplo:



X-Burger Especial — 8 pedidos



Coxinha — 6 pedidos



Coca-Cola — 5 pedidos



Isso será baseado nos dados mockados.



---



15. PAINEL DO RESTAURANTE



Criar uma área administrativa exclusiva desse restaurante.



Rotas:



/restaurante

/restaurante/pedidos

/restaurante/cardapio

/restaurante/estoque

/restaurante/clientes

/restaurante/relatorios

/restaurante/configuracoes



Não criar seleção de restaurante.



O painel pertence exclusivamente ao estabelecimento.



---



16. SIDEBAR



Criar sidebar com:



Dashboard



Pedidos



Cardápio



Estoque



Clientes



Relatórios



Configurações



No topo mostrar:



[Logo] Restaurante Sabor da Casa



---



17. DASHBOARD



Criar dashboard profissional.



Cards:



Faturamento



R$ 8.742,50



Pedidos



342



Ticket médio



R$ 25,56



Clientes



218



Produtos vendidos



786



Mostrar comparação com o período anterior.



---



18. GRÁFICOS



Utilizar Recharts.



Criar:



Faturamento



Gráfico de linha.



Filtros:



- Hoje

- 7 dias

- 30 dias

- Este mês

- Mês anterior

- Personalizado



Pedidos por dia



Gráfico de barras.



Categorias mais vendidas



Exemplo:



- Café da manhã

- Lanche

- Almoço

- Jantar

- Bebidas

- Sobremesas



Regiões dos pedidos



Mostrar bairros/regiões onde estão os clientes.



Produtos mais vendidos



Mostrar ranking.



---



19. FECHAMENTO DIÁRIO



Criar uma interface mostrando que os indicadores são organizados por dia.



Simular atualização às:



00:00



Criar histórico:



Data| Pedidos| Faturamento| Ticket Médio

29/08/2026| 82| R$ 2.140,00| R$ 26,10

28/08/2026| 76| R$ 1.982,50| R$ 26,09

27/08/2026| 91| R$ 2.314,00| R$ 25,43



Permitir selecionar dias anteriores.



---



20. PEDIDOS DO RESTAURANTE



Criar tabela de pedidos:



- Código

- Cliente

- Horário

- Produtos

- Total

- Pagamento

- Endereço

- Status



Filtros:



- Todos

- Novos

- Em preparação

- Saiu para entrega

- Entregues

- Cancelados



Ao clicar abrir detalhes completos do pedido.



---



21. CÓDIGO DO PEDIDO



Cada pedido deverá possuir um código exclusivo.



Exemplo:



PED-20260829-0042



Esse código deve funcionar como identificador visual/comprovante do pedido.



Criar página ou modal:



COMPROVANTE DO PEDIDO



PED-20260829-0042



Cliente:



João Silva



Telefone:



(81) 99999-9999



Endereço:



Rua Exemplo, 100



Produtos:



X-Burger × 2



Coca-Cola × 2



Batata × 1



Subtotal:



R$ 48,00



Entrega:



R$ 4,00



Total:



R$ 52,00



Pagamento:



PIX



Status:



Pago



Criar botão:



Imprimir comprovante



A impressão pode ser simulada pelo frontend.



Não criar nota fiscal eletrônica real.



---



22. ESTOQUE



Criar painel de estoque.



Mostrar:



Total de itens



128



Estoque baixo



7



Esgotados



3



Tabela:



- Produto

- Categoria

- Quantidade

- Estoque mínimo

- Status



Status:



Normal



Baixo



Crítico



Esgotado



Criar ações:



- Adicionar estoque

- Editar

- Marcar como esgotado



---



23. GERENCIAMENTO DO CARDÁPIO



Criar página para o restaurante controlar os pratos.



Tabela:



- Foto

- Nome

- Categoria

- Preço

- Estoque

- Disponibilidade



Permitir:



Adicionar produto



Editar produto



Excluir produto



Alterar preço



Ativar/desativar produto



---



24. CLIENTES



Criar página de clientes.



Mostrar:



- Avatar

- Nome

- Telefone

- E-mail

- Quantidade de pedidos

- Total gasto

- Último pedido



Ao clicar:



Perfil do cliente



Informações pessoais:



- Nome

- Telefone

- E-mail



Endereço:



- Rua

- Número

- Bairro

- Cidade

- CEP



Histórico:



- Pedidos

- Datas

- Valores

- Produtos



Resumo:



- Total de pedidos

- Total gasto

- Produto mais comprado



Esses dados são fictícios e servem apenas para representar a futura estrutura do sistema.



---



25. CONFIGURAÇÕES DO RESTAURANTE



Criar página:



Configurações



Seções:



Informações do restaurante



- Nome

- Logo

- Endereço

- Telefone

- Horário de funcionamento



Pagamento



- Chave PIX



Entrega



- Regra da taxa por distância



Cardápio



- Categorias

- Produtos



As alterações devem funcionar localmente utilizando estado mockado.



---



26. DESIGN



Criar uma interface moderna, profissional e semelhante a um produto SaaS de delivery.



Características:



- Minimalista

- Clean

- Responsiva

- Boa hierarquia

- Cards arredondados

- Sombras leves

- Tipografia moderna

- Ícones Lucide

- Gráficos bem organizados



Usar:



- Azul como cor principal

- Branco

- Cinza claro

- Cinza escuro

- Verde para sucesso

- Amarelo para atenção

- Vermelho para erro/estoque crítico



---



27. RESPONSIVIDADE



No celular:



- Menu lateral transforma-se em menu mobile

- Dashboard reorganizado verticalmente

- Cards adaptáveis

- Carrinho acessível

- Pedidos em cards

- Botões grandes para toque



No desktop:



- Sidebar fixa

- Dashboard com múltiplas colunas

- Tabelas completas

- Gráficos lado a lado



---



28. MOCK DATA



Criar dados fictícios suficientes para deixar a aplicação parecendo um sistema real:



- 20 pratos

- 10 clientes

- 30 pedidos

- 15 produtos no estoque

- 30 dias de histórico

- Diferentes horários

- Diferentes categorias

- Diferentes bairros

- Diferentes status



Os dados precisam ser coerentes entre si.



Exemplo:



Se um cliente possui 8 pedidos, os pedidos devem aparecer no histórico dele.



Se um produto possui 50 vendas, isso deve refletir nos gráficos.



---



29. INTERAÇÕES



Implementar no frontend:



- Adicionar produto

- Remover produto

- Alterar quantidade

- Criar pedido mockado

- Alterar status

- Alterar preço

- Alterar estoque

- Criar endereço

- Editar endereço

- Excluir endereço

- Pesquisar produtos

- Pesquisar clientes

- Filtrar pedidos

- Filtrar relatórios

- Alterar datas dos gráficos

- Copiar PIX

- Visualizar comprovante



---



30. ARQUITETURA



Organizar o projeto de maneira profissional.



Exemplo:



src/

 ├── components/

 ├── pages/

 │    ├── client/

 │    └── restaurant/

 ├── layouts/

 ├── routes/

 ├── data/

 ├── services/

 ├── hooks/

 ├── types/

 ├── utils/

 └── assets/



Separar claramente:



Cliente



e



Restaurante



Não misturar componentes específicos sem necessidade.



---



31. OBJETIVO FINAL



O sistema deve transmitir a sensação de:



"Este é o aplicativo/site oficial de pedidos deste restaurante."



O fluxo principal do cliente deve ser:



Entrar → Ver cardápio → Escolher refeição → Adicionar ao carrinho → Informar endereço → Calcular entrega → Escolher PIX → Visualizar QR Code → Confirmar pagamento → Receber código do pedido → Acompanhar pedido → Consultar histórico.



O fluxo do restaurante deve ser:



Dashboard → Ver pedidos → Gerenciar pedidos → Consultar faturamento → Analisar vendas → Ver regiões → Gerenciar cardápio → Alterar preços → Controlar estoque → Consultar clientes → Visualizar histórico.



O resultado final deve ser um frontend completo e navegável de um único restaurante, com dados mockados e preparado para futura integração com backend.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ad3f04a7-77d8-4bd7-b923-9c1dc4903a34).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
