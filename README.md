# 🎓 EduControl — Reforço Escolar Tembe

## Credenciais de acesso
- **Utilizador:** admin
- **Senha:** DalvaP2005!

---

## 📁 Estrutura dos ficheiros

```
reforco-tembe/
├── index.html   ← página principal
├── style.css    ← estilos (tema azul/branco)
├── app.js       ← toda a lógica do sistema
└── README.md    ← este ficheiro
```

---

## 🌐 Como colocar o site no ar com o Netlify (passo a passo)

### Opção A — Arrastar e largar (mais fácil, sem conta necessária)

1. Acede a **https://app.netlify.com/drop**
2. Abre a pasta `reforco-tembe` no teu computador
3. Selecciona os 3 ficheiros (`index.html`, `style.css`, `app.js`) e **arrasta-os** para a página do Netlify
4. O Netlify vai gerar um link automático tipo: `https://nome-aleatorio.netlify.app`
5. Pronto — o site está no ar!

### Opção B — Com conta Netlify (recomendado para guardar o site para sempre)

1. Cria uma conta gratuita em **https://netlify.com**
2. Após fazer login, clica em **"Add new site" → "Deploy manually"**
3. Arrasta a pasta `reforco-tembe` inteira para a área indicada
4. O Netlify faz o deploy automático
5. Podes mudar o nome do site em: Site Settings → General → Site name

### Opção C — Via GitHub + Netlify (para actualizações fáceis no futuro)

1. Cria conta no **https://github.com** (gratuito)
2. Cria um repositório novo e carrega os 3 ficheiros
3. No Netlify: "Add new site" → "Import an existing project" → conecta ao GitHub
4. A partir daí, sempre que mudares um ficheiro no GitHub, o site actualiza automaticamente

---

## ⚠️ Nota importante sobre os dados

Os dados dos estudantes são guardados no **localStorage** do browser. Isso significa:
- Os dados ficam guardados no computador onde o site é aberto
- Se abrires noutro computador, os dados não aparecem
- Para partilhar dados entre vários computadores, seria necessário uma base de dados (upgrades futuros)

---

## ✏️ Como editar o site no Visual Studio Code

1. Abre o VS Code
2. Vai a **File → Open Folder** e abre a pasta `reforco-tembe`
3. Edita qualquer ficheiro e guarda (Ctrl+S)
4. Para ver as alterações, podes usar a extensão **"Live Server"** (botão direito no index.html → "Open with Live Server")
5. Quando estiveres satisfeito, faz novo deploy no Netlify

---

## 🔧 Alterações rápidas

| O que queres mudar | Onde mudar |
|---|---|
| Senha do admin | `app.js` linha 2-3 |
| Nome da escola | `index.html` (título e sidebar) |
| Lista de cursos | `index.html` (dentro do `select` com id `inp-curso`) |
| Cores do tema | `style.css` (secção `:root`) |
| Locais disponíveis | `index.html` + `app.js` array `LOCAIS` |
