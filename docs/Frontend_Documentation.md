# Documentação do Frontend

## 1. Introdução

O frontend é uma Single-Page Application (SPA) construída com Next.js 15, React 19 e TypeScript. Ele fornece uma interface de usuário moderna e interativa para os usuários do sistema Conexão Treinamento.

## 2. Estrutura de Diretórios

O código-fonte do frontend está localizado na pasta `web`.

- **`app/`**: Contém as rotas da aplicação, seguindo a convenção do App Router do Next.js. Cada pasta corresponde a um segmento de URL.
- **`components/`**: Contém os componentes React reutilizáveis, organizados por funcionalidade.
  - **`ui/`**: Componentes de UI genéricos e de baixo nível, muitos dos quais são baseados no `shadcn/ui`.
- **`lib/`**: Contém as bibliotecas, helpers e a configuração do cliente de API.
  - **`api-client/`**: Contém o cliente de API gerado automaticamente pelo `openapi-ts`.
- **`hooks/`**: Contém os hooks customizados do React.
- **`styles/`**: Contém os estilos globais.

## 3. Gerenciamento de Estado

O **TanStack Query (React Query)** é usado para gerenciar o estado do servidor (dados da API).

- **Busca de Dados**: O hook `useQuery` é usado para buscar dados da API. Ele gerencia automaticamente o cache, a revalidação em segundo plano e o estado de carregamento/erro.
- **Mutações de Dados**: O hook `useMutation` é usado para criar, atualizar e excluir dados. Ele fornece uma maneira simples de lidar com os efeitos colaterais das mutações, como a invalidação de queries em cache.
- **Configuração**: O cliente do TanStack Query é configurado em `lib/query-client.ts` com opções padrão para `staleTime` e `retry`.

## 4. UI e Estilização

- **Componentes de UI**: A aplicação usa **`shadcn/ui`**, uma coleção de componentes de UI reutilizáveis e acessíveis.
- **Estilização**: O **Tailwind CSS** é usado para a estilização. É um framework CSS utility-first que permite construir designs customizados rapidamente.

## 5. Formulários

- **Gerenciamento de Formulários**: O **React Hook Form** é usado para gerenciar o estado e a validação de formulários.
- **Validação de Schema**: O **Zod** é usado para definir os schemas de validação dos formulários, garantindo que os dados enviados para a API estejam no formato correto.

## 6. Comunicação com a API

- **Cliente de API Tipado**: O `openapi-ts` é usado para gerar um cliente de API TypeScript a partir da especificação OpenAPI do backend. Isso fornece segurança de tipos de ponta a ponta, reduzindo a chance de erros em tempo de execução.
- **Configuração do Cliente**: O cliente de API é configurado em `lib/client.ts`. Ele é configurado para usar a URL da API do ambiente e para incluir automaticamente o JWT de autenticação em cada requisição.

## 7. Roteamento e Autenticação

- **Roteamento**: A aplicação usa o **App Router** do Next.js para o roteamento.
- **Proteção de Rotas**: O componente `AuthGuard` (`app/auth-guard.tsx`) protege as rotas que exigem autenticação. Ele verifica a presença e a validade do JWT no `localStorage` e redireciona o usuário para a página de login, se necessário.
