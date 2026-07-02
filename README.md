# 🛠️ Chamado Aberto - API

Uma API REST profissional desenvolvida em **Java** com **Spring Boot** para o gerenciamento e controle de ordens de serviço e chamados de manutenção de TI da **ARSAL**. O sistema foi desenhado seguindo as melhores práticas de mercado, com arquitetura dividida por camadas e banco de dados na nuvem.

---

## 🚀 Status do Projeto: Em Desenvolvimento 🔄

Atualmente, o projeto está sendo construído seguindo um cronograma rigoroso de cartões de entrega (Tasks).

### 📋 Quadro de Progresso

- [x] **CARTÃO 01:** Configuração do Banco de Dados Relacional na Nuvem (Neon.tech) 🌐
- [x] **CARTÃO 02:** Inicialização do ecossistema Spring Boot & Proteção de Credenciais com `.gitignore` 🛡️
- [x] **CARTÃO 03:** Modelagem de Dados Completa (Entidades `@Entity` e Enums de Negócio) 📐
- [ ] **CARTÃO 04:** Criação da Camada de Persistência (Repositories com Spring Data JPA) 🗄️
- [ ] **CARTÃO 05:** Implementação das Regras de Negócio (Services) ⚙️
- [ ] **CARTÃO 06:** Exposição dos Endpoints da API (Controllers) 🎮

---

## 📂 Organização da Arquitetura (Package by Layer)

O projeto adota a **Arquitetura por Camadas**, o padrão mais aceito e utilizado no ecossistema Java de mercado:

* `enums`: Centraliza os valores fixos do sistema (Prioridades, Status, Setores e Equipamentos) em letras maiúsculas para garantir a consistência dos dados.
* `models`: Contém as entidades mapeadas pelo Hibernate que geram as tabelas automaticamente no banco de dados.
* `repositories`: Interfaces responsáveis pela comunicação direta com o banco PostgreSQL.

---

## 🛠️ Tecnologias e Ferramentas Utilizadas

* **Java 21** & **Spring Boot 3.x** ☕⚡
* **Spring Data JPA** & **Hibernate** (Mapeamento Objeto-Relacional) 🔄
* **PostgreSQL** (Banco de Dados hospedado na nuvem via **Neon.tech**) 🐘🌐
* **Project Lombok** (Escrita de código limpo através de anotações) 🧱
* **Git & GitHub** (Versionamento seguro) 🐙

---

## ⚙️ Como o Projeto Foi Blindado contra Vazamentos

Por questões de segurança cibernética, o arquivo crítico `application.properties` (que contém as chaves e credenciais de acesso ao banco de dados em produção) foi adicionado à árvore de exclusão do arquivo `.gitignore`. Isso garante que nenhuma senha de banco de dados seja exposta publicamente no GitHub. 🔐🛡️
