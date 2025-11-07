# UI Icons System

## Джерело іконок: Material Symbols (Google)

Проект використовує професійні іконки **Material Symbols** від Google у filled стилі.
- 2,500+ іконок доступні
- Filled формат (оптимізовані для шрифтів)
- Apache 2.0 License (безкоштовно)
- Підтримка від Google

## Генерація іконкового шрифту

### Крок 1: Встановлення залежностей

```bash
cd frontend
npm install
```

Це встановить `@material-symbols/svg-400` та інструменти для генерації шрифтів.

### Крок 2: Генерація шрифту

```bash
node generate-webfont.js
```

Це створить:
- `src/assets/fonts/ui-icons.woff2` (3KB)
- `src/assets/fonts/ui-icons.woff` (3.8KB)
- `src/assets/fonts/ui-icons.ttf` (6.4KB)
- `src/assets/fonts/ui-icons.css`

### Крок 3: Додавання нових іконок

1. Знайдіть іконку на https://fonts.google.com/icons (стиль: Filled)
2. Додайте маппінг у `copy-material-icons.js`
3. Запустіть `node copy-material-icons.js` для копіювання SVG
4. Запустіть `node generate-webfont.js` для регенерації шрифту

### Вимоги до SVG файлів

- **ВАЖЛИВО**: Використовуйте **fill-based** іконки (не stroke!)
- Розмір viewBox: може бути будь-яким (Material Symbols: `0 -960 960 960`)
- Іконки мають бути як `<path d="..."/>` без `stroke` атрибутів
- Material Symbols автоматично відповідають цим вимогам

## Використання іконок

```html
<!-- Використання ui-icon компонента -->
<ui-icon name="refresh" [size]="24"></ui-icon>
<ui-icon name="close" [size]="20" class="custom-class"></ui-icon>

<!-- З анімацією -->
<ui-icon name="spinner" [size]="20" class="spinning"></ui-icon>
```

## Список доступних іконок

1. **Базові іконки:**
   - `refresh` - Оновити
   - `schedule` - Годинник/час
   - `clear` - Очистити (X в колі)
   - `close` - Закрити (X)
   - `error` - Помилка
   - `info` - Інформація
   - `alert-circle` - Попередження

2. **Навігація:**
   - `chevron-down` - Стрілка вниз
   - `arrow_upward` - Стрілка вгору
   - `arrow_downward` - Стрілка вниз

3. **Дії:**
   - `edit` - Редагувати
   - `trash` - Видалити
   - `logout` - Вийти
   - `play_arrow` - Відтворити
   - `filter` - Фільтр

4. **Статуси:**
   - `check_circle` - Успішно
   - `done_all` - Всі виконані
   - `clear_all` - Очистити всі

5. **Графіки та аналітика:**
   - `show_chart` - Показати графік
   - `trending_up` - Зростання
   - `trending_down` - Спад
   - `chart` - Графік
   - `analytics` - Аналітика

6. **Налаштування:**
   - `settings` - Налаштування
   - `tune` - Тонке налаштування

7. **Користувач:**
   - `user` - Користувач
   - `eye` - Показати
   - `eye-off` - Сховати
   - `lock` - Замок

8. **Інші:**
   - `list` - Список
   - `clipboard` - Буфер обміну
   - `spinner` - Завантаження
   - `swap_horiz` - Обмін

## Альтернативний спосіб (без Node.js)

Якщо `generate-icon-font.js` не працює, використайте онлайн сервіс IcoMoon:

1. Відкрийте https://icomoon.io/app/
2. Натисніть "Import Icons"
3. Виберіть всі SVG файли з `src/assets/icons/`
4. Виберіть всі імпортовані іконки
5. Натисніть "Generate Font" внизу
6. Налаштуйте:
   - Font Name: `ui-icons`
   - Class Prefix: `ui-icon-`
7. Завантажте шрифт
8. Скопіюйте файли шрифтів до `src/assets/fonts/`
9. Скопіюйте CSS до `src/assets/fonts/ui-icons.css`
