# Генерація іконкового шрифту

## Крок 1: Відкрити IcoMoon App

Перейдіть на https://icomoon.io/app/

## Крок 2: Імпортувати SVG іконки

1. Натисніть **"Import Icons"** (кнопка зверху зліва)
2. Виберіть ВСІ SVG файли з папки `frontend/src/assets/icons/`
3. Всі іконки з'являться в "Your Custom Icons" наборі

## Крок 3: Вибрати всі іконки

1. Натисніть **"Select All"** щоб вибрати всі імпортовані іконки
2. Перев flight that всі 34 іконки вибрані

## Крок 4: Генерувати шрифт

1. Натисніть **"Generate Font"** (кнопка внизу справа)
2. Перевірте назви іконок - вони повинні відповідати назвам файлів:
   - refresh, schedule, clear, close, error, info, alert-circle, plus
   - chevron-down, arrow_upward, arrow_downward
   - edit, trash, logout, play_arrow, filter
   - check_circle, done_all, clear_all
   - show_chart, trending_up, trending_down, chart, analytics
   - settings, tune
   - user, eye, eye-off, lock
   - list, clipboard, spinner, swap_horiz

## Крок 5: Налаштування шрифту

1. Натисніть **"Preferences"** (іконка шестерні зверху)
2. Встановіть:
   - **Font Name**: `ui-icons`
   - **Class Prefix**: `ui-icon-`
   - **CSS Selector**: Use `i` selector
3. Закрийте preferences

## Крок 6: Завантажити шрифт

1. Натисніть **"Download"** (кнопка внизу справа)
2. Розпакуйте завантажений ZIP файл

## Крок 7: Копіювати файли в проект

З розпакованої папки скопіюйте:

1. **Шрифти** → `frontend/src/assets/fonts/`:
   - `fonts/ui-icons.ttf`
   - `fonts/ui-icons.woff`
   - `fonts/ui-icons.woff2`
   - `fonts/ui-icons.eot` (опціонально, для старих браузерів)

2. **CSS** → `frontend/src/assets/fonts/ui-icons.css`:
   - Відкрийте `style.css` з ZIP
   - Скопіюйте весь вміст в `frontend/src/assets/fonts/ui-icons.css`

## Крок 8: Оновити пути в CSS

Відкрийте `frontend/src/assets/fonts/ui-icons.css` і замініть:

```css
src: url('fonts/ui-icons.eot?...');
```

На:

```css
src: url('./ui-icons.eot?...');
```

(Зміните `fonts/` на `./` для всіх шрифтових файлів)

## Крок 9: Імпортувати CSS в styles.scss

Додайте в `frontend/src/styles.scss`:

```scss
@import './assets/fonts/ui-icons.css';
```

## Крок 10: Готово!

Тепер ui-icon компонент буде використовувати шрифт замість SVG.

---

## Автоматична генерація (альтернатива)

Якщо npm працює нормально, можна використати скрипт:

```bash
cd frontend
npm run generate-icons
```

Це запустить fantasticon для генерації шрифту з SVG файлів.
