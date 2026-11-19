# IGL

Ferramenta pessoal para o IGL do grupo no CS2: mapas interativos com regiões nomeadas e um catálogo de granadas (lineups).

- `frontend/` — React + TypeScript + Vite
- `backend/` — Java 21 + Spring Boot + Liquibase (migrations rodam sozinhas ao subir)
- Banco: Postgres do **Supabase** (ou Postgres local via Docker para desenvolver)
- Especificação: [`docs/especificacao.md`](docs/especificacao.md)

## Pré-requisitos

- Java 21
- Node.js 20+
- Docker (opcional: Postgres local e testes do backend)

## 1. Banco de dados

### Opção A — Supabase (uso real)

1. Crie um projeto em [supabase.com](https://supabase.com) (plano free). Guarde a senha do banco.
2. No painel, clique em **Connect** e copie a connection string do **Session pooler** (porta 5432). Ela tem o formato:
   ```
   postgresql://postgres.abcdefgh:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
   ```
3. Crie `backend/.env.local` a partir do modelo:
   ```bash
   cp backend/.env.example backend/.env.local
   ```
   e preencha separando as partes da connection string:
   ```properties
   DB_URL=jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
   DB_USERNAME=postgres.abcdefgh
   DB_PASSWORD=sua-senha
   ```

Não é preciso rodar SQL no painel: o backend cria as tabelas na primeira vez que sobe.

> Plano free: projetos sem atividade por ~1 semana são pausados. Reative no painel do Supabase (os dados não se perdem).

### Opção B — Postgres local (Docker)

```bash
docker compose up -d
```

```bash
cp backend/.env.example backend/.env.local
```

Os valores padrão do modelo já apontam para esse Postgres (`igl`/`igl` em `localhost:5432`).

## 2. Backend

```bash
cd backend
```

```bash
./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080`. Ao iniciar, o Liquibase aplica os changesets pendentes (veja `Run: N` no log) e registra o histórico na tabela `databasechangelog`.

No Windows, use `mvnw.cmd spring-boot:run`.

### Migrations (Liquibase)

- Master: `backend/src/main/resources/db/changelog/db.changelog-master.xml`
- Changesets: `backend/src/main/resources/db/changelog/changes/000N-descricao.xml` (aplicados em ordem alfabética)
- Para mudar o esquema, crie um **novo** arquivo (ex.: `0005-create-players.xml`). Nunca edite um changeset já aplicado: o Liquibase valida o checksum e recusa subir.
- O Hibernate está em `ddl-auto: validate`: ele só confere se as entidades batem com o esquema criado pelo Liquibase.

### Testes

```bash
./mvnw verify
```

Os testes de integração sobem um Postgres real com Testcontainers (precisa do Docker rodando).

## 3. Frontend

```bash
cd frontend
```

```bash
npm install
```

```bash
npm run dev
```

Abra `http://localhost:5173`. O Vite repassa `/api` para o backend em `http://localhost:8080` (para mudar, crie `frontend/.env.local` com `VITE_API_PROXY_TARGET`, ver `frontend/.env.example`).

Outros comandos: `npm test` (testes de lógica), `npm run build`.

## Imagens dos mapas

Até você fornecer as imagens, o app usa placeholders.

- Radares: coloque `frontend/public/maps/<slug>.png` (imagem quadrada). Slugs: `ancient`, `anubis`, `cache`, `cobblestone`, `dust2`, `inferno`, `mirage`, `nuke`.
- Símbolo do CS2 nos cards: substitua `frontend/public/brand/cs2.svg`.

As coordenadas são guardadas normalizadas (0 a 1), então trocar a imagem por outra do mesmo enquadramento mantém regiões e granadas no lugar.

## Como usar

- **Nomear região:** clique nos pontos do polígono no mapa e feche clicando no primeiro ponto (ou Enter). Backspace desfaz o último ponto, Esc cancela. O botão **Regiões** abre o painel para renomear, editar a forma (arrastar vértices; duplo clique remove um vértice) e excluir.
- **+ Nova granada:** clique onde ela é arremessada e depois onde cai. Os nomes das regiões são sugeridos automaticamente.
- **Filtro:** clique num tipo para ligar/desligar; duplo clique (ou "só este") mostra só aquele tipo.
- **Detalhes:** clique no ícone para ver todas as granadas que caem naquele ponto (pontos a menos de 1,5% da largura do mapa são agrupados), com editar e excluir.
- **Backup:** "Exportar JSON" e "Importar JSON" na tela inicial. Importar substitui todos os dados.
