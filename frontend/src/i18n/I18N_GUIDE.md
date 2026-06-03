# i18n Integration Guide — Setec Dual Language (Khmer / English)

## 1. Install packages

```bash
npm install react-i18next i18next
```

---

## 2. Import i18n in main.tsx

Open `src/main.tsx` and add ONE line at the top:

```tsx
import "./i18n/i18n";          // ← add this
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

## 3. Add Khmer font + badge styles to index.css

Open `src/index.css` and paste the contents of `setec-styles.css`
right after the existing `@import "tailwindcss";` line.

---

## 4. Add LanguageToggle to the header

Open `src/layout/AppHeader.tsx` and add the toggle button:

```tsx
import LanguageToggle from "../components/common/LanguageToggle";

// Inside the header JSX, next to the existing dark mode / notification icons:
<div className="flex items-center gap-3">
  <LanguageToggle />
  {/* ...existing header icons... */}
</div>
```

---

## 5. Using translations in any page/component

```tsx
import { useTranslation } from "react-i18next";

const MyPage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("students.title")}</h1>
      <button>{t("actions.add")}</button>
      <p>{t("messages.loading")}</p>
    </div>
  );
};
```

---

## 6. Translation key reference

| Key | Khmer | English |
|-----|-------|---------|
| `nav.dashboard` | ផ្ទាំងគ្រប់គ្រង | Dashboard |
| `nav.students` | សិស្ស | Students |
| `nav.staff` | បុគ្គលិក | Staff |
| `nav.borrowing` | ការខ្ចី | Borrowing |
| `nav.returns` | ការត្រឡប់ | Returns |
| `nav.history` | ប្រវត្តិ | History |
| `status.borrowed` | កំពុងខ្ចី | Borrowed |
| `status.returned` | បានត្រឡប់ | Returned |
| `status.overdue` | លើសកំណត់ | Overdue |
| `actions.save` | រក្សាទុក | Save |
| `actions.cancel` | បោះបង់ | Cancel |
| `actions.delete` | លុប | Delete |

Full keys are in `src/locales/km.json` and `src/locales/en.json`.

---

## 7. How the font switching works

- When language = **km** → `<html>` gets class `lang-km` → Hanuman font applied globally
- When language = **en** → `<html>` gets class `lang-en` → Outfit font (template default)
- Language preference saved to `localStorage` key `setec-lang`
- Persists across browser sessions automatically
