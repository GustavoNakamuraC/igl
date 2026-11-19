# IGL — Documentação do Projeto (v0.7)

Aplicação web para apoiar o IGL (in-game leader) de um grupo de amigos no CS2: mapas interativos com áreas nomeadas e um catálogo de granadas (lineups).

## 1. Visão geral

- **Objetivo:** consultar e cadastrar granadas e nomear regiões dos mapas do CS2 de forma visual.
- **Usuário:** uso pessoal e único (eu). Sem compartilhamento, sem login e sem multiusuário.
- **Arquitetura:** front-end React (`frontend/`) + **backend Java Spring Boot** (`backend/`). O front só fala com a API REST do backend.
- **Banco de dados:** **Supabase (Postgres, plano free)** é o banco de dados oficial do projeto, acessado pelo backend via JDBC. Todas as informações (regiões, granadas e, no futuro, jogadores e táticas) ficam salvas nele. Para desenvolver sem o Supabase existe um Postgres local via `docker compose`.
- **Migrations:** changesets **Liquibase** no backend, aplicados automaticamente ao subir a aplicação.
- **Configuração:** a conexão com o banco é feita por variáveis no arquivo **`backend/.env.local`** (modelo em `backend/.env.example`), descritas na seção 12.
- **Escopo desta versão (MVP):** seleção de mapa, mapa interativo, regiões nomeadas, cadastro de granadas, filtro por tipo e modal de detalhes.
- **Também implementado (v0.5):** cadastro de jogadores, line atual (filtro de granadas) e granadas com jogadores vinculados, prints e informações adicionais (seção 4.6 a 4.8).
- **Fora do escopo por enquanto:** login, multiusuário, táticas, vídeos, mobile-first (táticas estão nos planos futuros, seção 10).

## 2. Tema visual

- Tema escuro, fundo cinza quase preto (ex.: `#0f1113` / `#14171a`), superfícies em `#1b1f23`, bordas sutis `#2a2f35`.
- Texto principal `#e6e8ea`, secundário `#9aa1a9`.
- Cor de destaque única (sugestão: laranja/âmbar `#f5a623`, remete ao CS).
- Cores por granada (ícone e destaque): Smoke (cinza claro/azulado), Molotov (laranja/vermelho), Flash (amarelo), HE (verde-oliva).
- Todas as cores definidas como variáveis CSS (design tokens) para fácil ajuste.

## 3. Telas

### 3.1 Seleção de mapa (home)

- Grade com 8 cards: **Ancient, Anubis, Cache, Cobblestone, Dust 2, Inferno, Mirage, Nuke**.
- Cada card mostra a imagem/radar do mapa, o nome e o **símbolo do CS2** sobreposto no mapa.
- Hover: leve elevação e borda de destaque. Clique: navega para `/mapa/:slug`.

### 3.2 Tela do mapa

Ao abrir um mapa, a primeira coisa exibida é o mapa em tela cheia (área principal), com:

- **Barra superior:** botão voltar, nome do mapa, botão **“+ Nova granada”**, botão **“Nomear região”**.
- **Painel de filtros:** seleção de tipo de granada.
- **Mapa interativo:** zoom e pan (scroll/arrastar).

## 4. Funcionalidades

### 4.1 Regiões nomeadas
- Modo “Nomear região”: o usuário desenha uma área no mapa (clicando nos pontos de um polígono, fechando ao clicar no primeiro ponto) e informa um nome livre (“Meio”, “L”, “Varanda”).
- Regiões aparecem como áreas translúcidas com o nome (rótulo visível, ligável/desligável).
- Editar nome, editar forma e excluir.
- Região serve também como referência nos cadastros (ex.: ponto de início “Varanda”).

### 4.2 Granadas no mapa
- Tipos: **Smoke, Molotov/Incendiária, Flash, HE**. (Decoy fica como possível extensão.)
- Cada granada tem **ponto de início** (arremesso) e **ponto final** (onde cai).
- O ponto final é desenhado no mapa com o ícone do tipo (Smoke → fumaça, Molotov → fogo, Flash → clarão, HE → explosão).
- Ao passar o mouse sobre o ícone: destaque (brilho/escala/cursor pointer). Opcional: mostrar a linha ligando início → fim.

### 4.3 Filtro de granadas
- **Lado:** chips **CT** (azul) e **TR** (amarelo), ambos ativos por padrão. Granadas "Ambos" aparecem enquanto qualquer um dos dois estiver ligado. Duplo clique = só aquele lado.
- No mapa, cada ícone tem um anel na cor do lado (metade azul/metade amarelo para "Ambos" ou grupos com lados diferentes).
- Chips/toggles por tipo. Padrão: todos ativos.
- O mapa mostra apenas os pontos dos tipos selecionados.
- Opção “mostrar só um tipo” (clique duplo ou botão “só este”).

### 4.4 Modal de detalhes
- Ao clicar no ícone, abre modal listando **todas as granadas que caem naquele ponto** (granadas com pontos finais próximos são agrupadas; ver regra de agrupamento em 6).
- Cada item mostra:
  - **Tipo**
  - **Ponto de início:** (nome da região/ponto)
  - **Onde cai:** (nome da região/ponto)
  - **Como fazer a granada:** texto livre
- Ações por item: editar e excluir.
- Fechar com `Esc`, clique fora ou botão.

### 4.5 Cadastro de granada
Fluxo:
1. Clicar em **“+ Nova granada”** (entra em modo de cadastro, cursor muda, aparece dica na tela).
2. Clicar no mapa para marcar o **ponto de início**.
3. Clicar no mapa para marcar o **ponto final**.
4. Abre o **modal de cadastro** com os campos:
   - Tipo de granada (obrigatório)
   - Lado: CT, TR ou Ambos (obrigatório)
   - Ponto de início (nome, sugerir região onde o ponto caiu; editável)
   - Onde cai (nome, sugerir região onde o ponto caiu; editável)
   - Como fazer (texto, obrigatório)
5. Salvar → granada aparece no mapa. Cancelar → descarta os pontos marcados.
- `Esc` cancela o modo de cadastro a qualquer momento.

### 4.6 Jogadores
- Página `/jogadores` (link na home e no topo do mapa).
- Cadastro com **nome** (obrigatório), **função principal** e **função secundária** (texto livre com sugestões: IGL, Entry, AWP, Suporte, Lurker…), **informações adicionais**, **cor** (azul, amarelo, verde, laranja, roxo) e **foto** opcional.
- Sem jogadores: aviso "Nenhum jogador cadastrado" com botão para cadastrar.
- Com jogadores: círculos na cor do jogador, com a foto (ou a inicial) e o nome. Clique abre o modal com as informações, quantas granadas sabe por mapa, **Editar** e **Excluir**.
- Excluir um jogador remove só os vínculos dele; as granadas continuam.

### 4.7 Line atual
- Seleção de 0 a 5 jogadores que estão jogando agora (na home, na página de jogadores e, compacta, na barra de filtros do mapa).
- **Nenhum selecionado (padrão):** o mapa mostra todas as granadas.
- **Com seleção:** o mapa mostra apenas granadas vinculadas a pelo menos um jogador da line (granadas sem jogador ficam escondidas). Combina com o filtro por tipo; os contadores dos chips refletem a line.
- A line fica salva no navegador (`localStorage`), não no banco.

### 4.9 Posições
- Para cada mapa e lado (CT/TR), define em quais **regiões nomeadas** cada jogador fica. Uso principal: o setup de CT ("quem segura o A"); também serve para TR ("sempre vai A").
- Um jogador pode ter várias posições no mesmo lado; a mesma combinação jogador + região + lado não se repete.
- Botão **Posições** no mapa: painel lateral com abas CT/TR, cada jogador com as regiões dele (× remove, "+ adicionar" escolhe outra região). Com line selecionada, só aparecem os jogadores da line.
- Com o painel aberto, os avatares aparecem sobre o centro de cada região; passar o mouse num jogador do painel destaca as regiões dele.
- O modal do jogador lista as posições por mapa e lado.
- Excluir uma região ou um jogador apaga as posições ligadas (a confirmação de exclusão da região avisa quantas).

### 4.8 Extras da granada
- **Quem sabe fazer:** vínculo com vários jogadores.
- **Prints:** até 10 imagens por granada (ex.: onde ficar e o pixel da mira). Adicionar por arquivo ou colando com Ctrl+V; miniaturas no modal de detalhes, com visualização ampliada (setas navegam, Esc fecha).
- **Informações adicionais:** texto livre opcional.

## 5. Modelo de dados

Coordenadas **normalizadas (0 a 1)** em relação à imagem do mapa, para funcionar em qualquer zoom/tamanho.

```
Map      { slug, name, imageUrl }              // estático (8 mapas)
Region   { id, mapSlug, name, points: [{x,y}] }
Grenade  {
  id, mapSlug,
  type: 'smoke' | 'molotov' | 'flash' | 'he',
  side: 'ct' | 'tr' | 'both',
  start: { x, y, label },
  end:   { x, y, label },
  howTo: string,
  createdAt, updatedAt
}
```

### 5.1 Tabelas no Supabase (Postgres)

```
regions   (id uuid pk, map_slug text, name text, points jsonb,
           created_at, updated_at)
grenades  (id uuid pk, map_slug text,
           type text check in ('smoke','molotov','flash','he'),
           start_x, start_y, start_label,
           end_x,   end_y,   end_label,
           how_to text, created_at, updated_at)
```

```
images          (id uuid pk, content_type text, data bytea, size_bytes int, created_at)
players         (id uuid pk, name text, role text?, notes text?,
                 color text check in ('blue','yellow','green','orange','purple'),
                 photo_id uuid? fk images, created_at, updated_at)
player_grenades (player_id fk players cascade, grenade_id fk grenades cascade, created_at)  -- pk composta
grenade_images  (grenade_id fk grenades cascade, image_id fk images cascade, position int)  -- pk (grenade_id, position)
player_positions (id uuid pk, player_id fk players cascade, region_id fk regions cascade,
                  side text check in ('ct','tr'), created_at)  -- unique (player_id, region_id, side)
players         + secondary_role text?
grenades        + notes text?
                + side text not null default 'both' check in ('ct','tr','both')   -- 0009
```

- **Imagens no banco:** o front reduz e converte para WebP antes de enviar (foto até 512 px, print até 1600 px, qualidade 0,8), o que costuma dar 100 a 250 KB por print. O backend aceita WebP/JPEG/PNG até 2 MB. Imagens são imutáveis (trocar = nova imagem) e são servidas com cache longo. Imagens que deixam de ser usadas são apagadas na hora; uploads abandonados (formulário cancelado) são limpos a cada hora.
- Os 8 mapas continuam estáticos no código (não precisam de tabela).
- Esquema versionado como changesets Liquibase em `backend/src/main/resources/db/changelog/changes/` (um arquivo por mudança, `000N-descricao.xml`, incluídos em ordem pelo `db.changelog-master.xml`). Changeset já aplicado nunca é editado: mudanças novas = arquivo novo.
- O Liquibase roda sozinho no startup do Spring e registra o que já foi aplicado na tabela `databasechangelog`.
- Os planos futuros (seção 10) adicionam tabelas novas; o esquema deve permitir isso sem reescrever as tabelas acima.

## 6. Regras e decisões

- **Agrupamento no ponto final:** granadas cujo ponto final está a menos de um raio pequeno (ex.: 1,5% da largura do mapa) aparecem sob o mesmo ícone; o modal lista todas.
- **Rótulo automático:** se um ponto cai dentro de uma região nomeada, o nome da região é sugerido como valor padrão.
- **Persistência:** backend Spring Boot (JPA) sobre o Postgres do Supabase. No front, a UI usa stores (Zustand) que chamam repositórios (`regionRepository`, `grenadeRepository`), que são os únicos a chamar a API (`/api/...`).
- **Sem fallback local:** se o backend estiver fora do ar, o front mostra um aviso discreto com "Tentar de novo".
- **API REST:** `GET/POST /api/maps/{slug}/regions`, `PUT/DELETE /api/regions/{id}`, `GET/POST /api/maps/{slug}/grenades`, `PUT/DELETE /api/grenades/{id}`, `GET/POST /api/players`, `PUT/DELETE /api/players/{id}`, `GET /api/players/{id}/grenade-counts`, `GET /api/maps/{slug}/positions`, `GET /api/players/{id}/positions`, `POST /api/positions`, `DELETE /api/positions/{id}`, `POST /api/images` (multipart), `GET /api/images/{id}`, `GET/POST /api/backup`, `GET /api/actuator/health`.
- **Segurança (decisão consciente):** não há login; a API não tem autenticação e é pensada para rodar localmente. No Supabase, as tabelas ficam com RLS ligado **sem políticas**, então a API pública do Supabase (chave `anon`) não lê nem altera nada; só o backend, conectado como dono das tabelas, acessa os dados. Se um dia o site for hospedado, a evolução é adicionar um login simples no backend.
- **Plano free do Supabase:** projetos sem atividade por cerca de uma semana são pausados e precisam ser reativados manualmente no painel. Não há perda de dados, mas o site fica fora do ar até lá.
- **Backup:** botões de exportar/importar tudo em JSON. Versão 2 inclui jogadores, vínculos, imagens (em base64) e posições; a importação aceita arquivos v1 e v2 e substitui tudo.

## 7. Stack sugerida

**Backend (`backend/`)**
- Java 21 + Spring Boot 3.5 (Web, Data JPA, Validation, Actuator), Maven (wrapper `mvnw`)
- **Liquibase** para migrations (changesets XML), aplicadas no startup
- PostgreSQL (Supabase em uso real; Postgres local via Docker em desenvolvimento)
- Testes de integração com Testcontainers (Postgres real)

**Frontend (`frontend/`)**
- React + TypeScript + Vite (proxy `/api` → backend)
- Tailwind CSS (com variáveis CSS para o tema)
- React Router
- Mapa: imagem do radar + SVG/HTML sobrepostos com zoom/pan (`react-zoom-pan-pinch`)
- Zustand para estado
- Vitest para a lógica (agrupamento, point-in-polygon, normalização de coordenadas)
- Estrutura em `src/features/{maps,regions,grenades,backup}`, `src/components`, `src/data`, `src/lib`

## 8. Assets necessários

- 8 imagens de radar/overview dos mapas (`public/maps/<slug>.png`). Imagens e logo do CS2 pertencem à Valve: eu mesmo forneço os arquivos; até lá usar placeholders.
- Logo/símbolo do CS2 (`public/brand/cs2.svg`), usado nos cards.
- Ícones dos tipos de granada (podem ser ícones próprios/SVG genéricos).

## 9. Critérios de aceite do MVP

- [ ] Home com 8 cards de mapa, cada um com o símbolo do CS2.
- [ ] Clicar no card abre o mapa escolhido.
- [ ] Criar, renomear e excluir regiões nomeadas.
- [ ] Cadastrar granada pelo fluxo início → fim → modal.
- [ ] Ícone do tipo no ponto final, com destaque no hover.
- [ ] Filtro por tipo funcionando.
- [ ] Modal lista todas as granadas do ponto com início, destino e como fazer.
- [ ] Editar e excluir granadas.
- [ ] Dados salvos no Supabase e mantidos ao recarregar; exportar/importar JSON.
- [ ] `backend/.env.example` no repositório, `.env.local` ignorado pelo git, e README explicando como configurar o Supabase.
- [ ] Changesets Liquibase no repositório, aplicados automaticamente ao subir o backend.
- [ ] Tema escuro cinza quase preto em todas as telas.

## 10. Planos futuros

### 10.1 Jogadores e granadas que cada um sabe — implementado na v0.5 (seções 4.6 a 4.8)
- Cadastro de **jogadores** do grupo. Não são usuários do sistema: não há login nem conta, é só um registro (nome/apelido).
- **Vínculo jogador ↔ granada:** marcar quais granadas cada jogador sabe fazer. Uma granada pode ser sabida por vários jogadores, e um jogador sabe várias granadas.
- Usos previstos:
  - No modal da granada, mostrar quem sabe fazê-la.
  - Na página do jogador, listar as granadas que ele sabe, por mapa.
  - Filtro no mapa: “mostrar só as granadas que [jogador] sabe”.
  - Descobrir lacunas: granadas que ninguém sabe fazer, ou o que cada jogador ainda precisa aprender.
- Modelo previsto:

```
players         (id, name, nickname?, created_at)
player_grenades (player_id, grenade_id, created_at)   // pk composta
```

- Opcional depois: nível de domínio por vínculo (ex.: aprendendo, consistente).

### 10.2 Táticas
- Cadastro de **táticas** por mapa e lado (CT/TR), por exemplo execuções em um bomb site.
- Uma tática terá nome, descrição e passos, e poderá referenciar granadas já cadastradas e regiões nomeadas.
- Possível atribuir papéis a jogadores (quem joga qual granada), aproveitando o cadastro de jogadores de 10.1.
- Detalhes (formato dos passos, visualização no mapa) serão definidos quando a funcionalidade for priorizada.

### 10.3 Outras ideias
1. Campos extras de granada: tipo de arremesso (parado, corrida, jump throw), tecla/clique, lado (CT/TR), tags.
2. Imagem/vídeo de referência por granada.
3. Busca por nome de região.
4. Compartilhar com o grupo (hoje fora do escopo; exigiria login e política de acesso).

## 11. Decisões tomadas e perguntas em aberto

**Decidido:**
- Uso local/pessoal, sem compartilhamento e sem login.
- **Supabase é o banco de dados**, acessado por um backend Java Spring Boot e configurado via `backend/.env.local`.
- Migrations com changesets Liquibase, rodando no startup.
- Sem fallback `localStorage`.
- Regiões como polígono livre.
- Imagens dos radares e logo do CS2 fornecidas por mim; placeholders até lá.
- Jogadores e táticas ficam como plano futuro.

**Em aberto:**
- Hospedagem futura (exigiria autenticação na API).

## 12. Variáveis de ambiente (.env)

O projeto usa os arquivos:

| Arquivo | Vai pro git? | Função |
|---|---|---|
| `backend/.env.example` | Sim | Modelo com os nomes das variáveis do backend |
| `backend/.env.local` | **Não** (no `.gitignore`) | Valores reais da conexão com o banco |
| `frontend/.env.example` | Sim | Opcional: endereço do backend para o proxy do Vite |

Variáveis do backend:

```
DB_URL=jdbc:postgresql://<host>:5432/postgres?sslmode=require
DB_USERNAME=postgres.<ref-do-projeto>
DB_PASSWORD=<senha do banco>
```

Regras:
- Os valores vêm do painel do Supabase em **Connect → Session pooler** (ou Project Settings → Database). A connection string `postgresql://usuario:senha@host:5432/postgres` é separada em `DB_URL` (com prefixo `jdbc:` e `?sslmode=require`), `DB_USERNAME` e `DB_PASSWORD`.
- O Spring lê `backend/.env.local` automaticamente (`spring.config.import`). Variáveis de ambiente do sistema têm prioridade.
- A senha do banco fica só no backend; nada de credencial vai para o front-end.
- `.gitignore` contém `.env.local` e `.env*.local`.
- Sem `.env.local`, o backend usa o Postgres local do `docker compose` (`igl`/`igl` em `localhost:5432`).
