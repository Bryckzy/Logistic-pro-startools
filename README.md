<div align="center">

  # 📦 LogisticsCalc Pro
  ### StarTools Professional Suite

  **A Calculadora Logística de Próxima Geração com Visualização Holográfica 3D**

  <p align="center">
    <img src="https://img.shields.io/badge/Version-2.0.0-FFC72C?style=for-the-badge&logoColor=black&labelColor=121212" alt="Version">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
    <img src="https://img.shields.io/badge/TypeScript-Strong-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  </p>

  ---
</div>

## 🚀 Sobre o Projeto

**LogisticsCalc Pro** não é apenas uma calculadora de pesos e volumes; é uma ferramenta de planejamento visual. Desenvolvida para profissionais de logística, design de embalagens e planejamento operacional, ela transforma números abstratos em modelos 3D interativos em tempo real.

Com uma interface **Industrial Dark Mode** inspirada em painéis de controle futuristas, a aplicação oferece clareza visual, precisão matemática e uma experiência de usuário imersiva.

## ✨ Funcionalidades Principais

### 🖥️ Visualização 3D Imersiva
O coração da aplicação é o **Box3DPreview**, um motor de renderização CSS-3D leve e performático.
*   **Modo Master:** Visualização da caixa de consolidação final.
*   **Modo Exploded (Hierarquia):** Separa visualmente a Unidade, a Inner Box e a Master Box com linhas de cota flutuantes para comparação de escala.
*   **Modo X-Ray (Raio-X):** Um algoritmo de empacotamento (`Bin Packing`) calcula e renderiza a disposição real dos produtos dentro da caixa, utilizando um sistema de cores de alto contraste para diferenciar lotes.

### 🧮 Motor de Cálculo Logístico
*   **Cálculo Bidirecional:** Alternância fluida entre cálculo baseado em **Peso Líquido** (Net) ou **Peso Bruto** (Gross).
*   **Gestão de Tara:** Inclusão automática da tara da embalagem Master.
*   **Suporte a Inner Box:** Lógica condicional para embalagens intermediárias (sub-embalagens).
*   **Cubagem (CBM):** Cálculo automático de metros cúbicos baseado nas dimensões.

### 🎨 UI/UX Premium
*   **Estética Cyber-Industrial:** Paleta de cores em *Matte Black* (#121212) com acentos em *Safety Yellow* (#FFC72C).
*   **Feedback Tátil Visual:** Animações de entrada, brilhos neon e transições suaves.
*   **Interatividade:** Controles de rotação e zoom intuitivos no palco 3D.

## 🛠️ Tecnologias Utilizadas

*   **Core:** React 19 (Hooks, Functional Components).
*   **Estilização:** Tailwind CSS (com uso extensivo de `backdrop-blur`, `gradients` e animações customizadas).
*   **Ícones:** Lucide React.
*   **Linguagem:** TypeScript (Tipagem estrita para `BoxData`, `HierarchyResults` e algoritmos de packing).

## 📦 Instalação e Uso

1.  **Clone o repositório**
    ```bash
    git clone https://github.com/seu-usuario/logisticscalc-pro.git
    ```

2.  **Instale as dependências**
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento**
    ```bash
    npm run dev
    ```

## 📐 Estrutura do Projeto

```text
src/
├── components/
│   ├── Box3DPreview.tsx  # O motor de renderização 3D e lógica de packing
│   ├── InputGroup.tsx    # Componentes de entrada estilizados
│   └── ResultCard.tsx    # Cards de exibição de dados
├── types.ts              # Definições de tipos TypeScript
├── App.tsx               # Layout principal e orquestração de estado
└── index.tsx             # Ponto de entrada
```

## 🎮 Controles do Preview 3D

*   **Clique e Arraste:** Rotaciona a caixa em 3 eixos.
*   **Scroll do Mouse:** Controla o Zoom (Aproximar/Afastar).
*   **Botões de Modo:**
    *   📦 **Master:** Visão externa.
    *   📏 **Exploded:** Visão hierárquica com dimensões.
    *   🧊 **X-Ray:** Visão interna dos produtos empilhados.

---

<div align="center">
  <p>Desenvolvido com precisão para <b>StarTools Professional</b>.</p>
  <p><sub>© 2024 LogisticsCalc Pro Engine. All rights reserved.</sub></p>
</div>
