# Agent Kit Catalog

> Стильный каталог MCP-серверов, скиллов и плагинов для создания своего ИИ-агента. Открытый код, MIT, Layero-ready.

## 🎯 Что это

Публичный каталог всех компонентов экосистемы Hermes Agent:

- **22 MCP-сервера** — каждый с 4-7 инструментами (114 tools всего)
- **156+ скиллов** — разбиты на тематические группы
- **16 плагинов** — designer, matt-pocock, n8n, llm-ops и другие

Сайт стилизован по современному дизайну (Inter + JetBrains Mono, тёмная тема, glassmorphism, анимации). Без фреймворков — чистый HTML+CSS+JS, грузится мгновенно.

## 🚀 Деплой на Layero

Этот сайт заточен под **Layero** (RU hosting):

1. Push в `main` branch
2. Layero → подключи репозиторий → auto-deploy
3. Готово: `https://yourname-agent-kit-catalog.layero.ru/`

Все последующие правки через `git push` будут автоматически подтягиваться на Layero.

### Локально

```bash
git clone https://github.com/shekelstrong/agent-kit-catalog
cd agent-kit-catalog
open index.html
# или
python3 -m http.server 8000
# затем http://localhost:8000
```

## 📁 Структура

```
agent-kit-catalog/
├── README.md
├── LICENSE (MIT)
├── index.html              # главный файл
├── styles/
│   └── main.css           # все стили (~17 KB)
├── scripts/
│   ├── data.js            # данные 22 MCP + skills + plugins (~20 KB)
│   └── app.js             # логика каталога (~10 KB)
└── .gitignore
```

**Без npm, без сборки, без зависимостей.** Только статические файлы.

## 🎨 Дизайн

- **Dark SaaS theme** — по умолчанию (как на Linear, GitHub, Vercel)
- **Inter + JetBrains Mono** — типографика
- **Градиент hero** — emerald → sky → violet (анимированный)
- **Animated counters** — числа считаются от 0 до финального значения при загрузке
- **Glassmorphism nav** — backdrop-filter blur
- **Card hover** — glow + scale + arrow animation
- **Responsive** — mobile-first, breakpoints 768px
- **Background** — animated radial gradients (медленный pan 30s)

## 🛠 Добавить новый MCP

Открой `scripts/data.js` и добавь объект в массив `MCPS`:

```js
{
  slug: "my-mcp",
  name: "My MCP",
  description: "Что делает.",
  category: "ai",  // freelance | ai | telegram | code | deploy | docs | design | ru-market
  tags: ["ai", "tool"],
  url: "https://github.com/shekelstrong/my-mcp",
  tools: 5,
  stack: "Python 3.11+",
  featured: false,
  install: "git clone ... && pip install -r requirements.txt",
  icon: "🤖",
},
```

## 📋 Категории

| ID | Имя | Кол-во |
|---|---|---|
| `ai` | 🤖 AI-агенты | 5 |
| `freelance` | 💰 Freelance | 4 |
| `telegram` | ✈️ Telegram | 2 |
| `code` | 💻 Code | 3 |
| `deploy` | 🚀 Deploy | 3 |
| `docs` | 📄 Документы | 3 |
| `design` | 🎨 Design | 1 |
| `ru-market` | 🇷🇺 РФ рынок | 1 |
| `skill` | ⚙️ Скиллы | 156+ |
| `plugin` | 🔌 Плагины | 16 |

## 📄 License

MIT © 2026 Vasiliy Nedopekin (shekelstrong)