# UI Icons System

## Генерація іконкового шрифту

### Крок 1: Встановлення залежностей

```bash
cd frontend
npm install
```

### Крок 2: Генерація шрифту

```bash
node generate-icon-font.js
```

Це створить:
- `src/assets/fonts/ui-icons.woff2`
- `src/assets/fonts/ui-icons.woff`
- `src/assets/fonts/ui-icons.ttf`
- `src/assets/fonts/ui-icons.css`

### Крок 3: Додавання нових іконок

1. Додайте SVG файл до `src/assets/icons/`
2. Назва файлу стане назвою іконки (наприклад, `my-icon.svg` → `my-icon`)
3. Запустіть `node generate-icon-font.js` для регенерації шрифту

### Вимоги до SVG файлів

- Розмір viewBox: `0 0 24 24`
- Використовуйте `stroke="currentColor"` для кольору
- Не використовуйте fill (або використовуйте `fill="none"`)
- Всі шляхи повинні бути outline (не stroke)

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
