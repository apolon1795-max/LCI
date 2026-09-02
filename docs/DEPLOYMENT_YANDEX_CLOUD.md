# Развёртывание LCI в Yandex Cloud

Инструкция рассчитана на YDB Serverless + Cloud Functions Node.js 22 и интерфейс с двумя serverless-маршрутами. Текущая проверенная реализация этих маршрутов находится в `api/lead.js` и `api/telegram-relay.js`. Команды содержат шаблоны; секреты в Git не сохраняются.

## 0. Финансовый стоп-контроль

Для работы Yandex Cloud требуется платёжный аккаунт даже при использовании бесплатных лимитов. Перед созданием ресурсов владелец LCI должен принять это условие и включить уведомления о бюджете. Бесплатные лимиты не являются безусловной гарантией нулевого счёта.

Источники: [регистрация и платёжный аккаунт](https://yandex.cloud/ru/docs/getting-started/legal-entity/registration), [бесплатный объём serverless](https://yandex.cloud/ru/docs/billing/concepts/serverless-free-tier).

## 1. Создать YDB и сервисный аккаунт

```bash
yc ydb database create lci-leads --serverless
yc iam service-account create --name lci-lead-function-sa
yc ydb database list
yc iam service-account list
```

Назначить сервисному аккаунту минимальную роль на конкретную БД:

```bash
yc ydb database add-access-binding \
  --id DB_ID \
  --role ydb.editor \
  --service-account-id SERVICE_ACCOUNT_ID
```

Роль нужна функции для автоматического создания таблицы `lci_leads`, чтения повторной заявки и записи лида. Источники: [создание YDB Serverless и управление доступом](https://yandex.cloud/ru/docs/ydb/operations/manage-databases), [состав роли ydb.editor](https://yandex.cloud/ru/docs/ydb/security/).

## 2. Собрать функцию

```bash
cd backend/yandex-function
npm ci
npm test
npm run build
zip -r /tmp/lci-lead-function.zip dist package.json package-lock.json
```

Cloud Functions устанавливает production-зависимости из `package.json` и `package-lock.json`; TypeScript предварительно компилируется в `dist`. Источники: [зависимости Node.js-функций](https://yandex.cloud/en/docs/functions/lang/nodejs/dependencies), [поддерживаемый runtime nodejs22](https://yandex.cloud/ru/docs/functions/concepts/runtime/).

## 3. Создать функцию и версию

```bash
yc serverless function create --name lci-lead-receiver
```

В консоли Yandex Cloud создайте версию функции из `/tmp/lci-lead-function.zip`:

- runtime: `Node.js 22`;
- entrypoint: `dist/index.handler`;
- память: `256 МБ`;
- timeout: `15 секунд`;
- service account: `lci-lead-function-sa`;
- переменные: все нужные значения из `backend/yandex-function/.env.example`, включая URL Telegram-ретранслятора, если прямое соединение с Telegram недоступно;
- `LEAD_STORAGE_MODE` не задавать.

Секреты `TELEGRAM_BOT_TOKEN` и `SMTP_PASSWORD` не публиковать и не сохранять в Git. Функция авторизуется в YDB через метаданные привязанного сервисного аккаунта. Источники: [создание версии функции](https://yandex.cloud/ru/docs/functions/operations/function/version-manage), [официальный сценарий Cloud Functions → YDB](https://yandex.cloud/ru/docs/tutorials/serverless/connect-from-cf-nodejs).

Сделать функцию доступной для браузерной формы:

```bash
yc serverless function allow-unauthenticated-invoke lci-lead-receiver
```

Публичность вызова не означает принятие любых браузерных запросов: код дополнительно проверяет точный `Origin` по `ALLOWED_ORIGINS`. Источник команды: [публичный вызов функции](https://yandex.cloud/ru/docs/functions/operations/function/function-public).

## 4. Настроить интерфейс

Для интерфейса нужна только согласованная прямая ссылка на документ LCI по персональным данным:

```dotenv
VITE_PRIVACY_URL=https://ПРЯМАЯ-СОГЛАСОВАННАЯ-ССЫЛКА-LCI
```

Маршрут формы зафиксирован как `/api/lead`. Серверный маршрут перенаправляет запрос в Yandex Cloud Function и не раскрывает секреты. Если создаётся новая функция, измените `YANDEX_LEAD_ENDPOINT` в окружении хостинга либо резервное значение `DEFAULT_YANDEX_LEAD_ENDPOINT` в `api/lead.js`.

Затем выполните проверки:

```bash
npm ci
npm run check
```

## 5. Опубликовать интерфейс и serverless-маршруты

Подключите репозиторий к хостингу, который поддерживает Vite и Node.js serverless-функции из каталога `api`. Для текущего Vercel-проекта отдельная переменная `VITE_LEAD_ENDPOINT` не нужна. После изменения переменных окружения запустите новую production-сборку.

Для Telegram укажите в Yandex Cloud Function:

```dotenv
TELEGRAM_RELAY_URL=https://АДРЕС-ПРИЛОЖЕНИЯ/api/telegram-relay
```

Ретранслятор получает токен бота только в заголовке запроса функции, проверяет формат токена и разрешает отправку только в зафиксированный чат LCI. Отдельный секрет Vercel для него не требуется.

Статический Object Storage без обратного прокси не подходит для этой версии: на том же домене должны отвечать `/api/lead` и `/api/telegram-relay`. При переносе на другой хостинг сохраните эти два маршрута и обновите `ALLOWED_ORIGINS`, `LCI_PUBLIC_ORIGIN` и `TELEGRAM_RELAY_URL`.

После получения финального origin добавьте его в `ALLOWED_ORIGINS` функции и создайте новую версию функции. Текущий Vercel Hobby предназначен только для демонстрации: коммерческое использование должно соответствовать [условиям Vercel](https://vercel.com/docs/limits/fair-use-guidelines) либо проект нужно перенести на другой совместимый хостинг.

## 6. Контрольный тест

Проверить в браузере полный путь: предмет → цель → филиал → преподаватель → контакты → код. Затем убедиться, что:

1. в таблице `lci_leads` есть ровно одна строка по `lead_id`;
2. код на экране совпадает с `gift_code` в YDB и уведомлении;
3. повтор POST с тем же `lead_id` возвращает `duplicate: true` и не создаёт вторую строку;
4. Telegram/email показывают статус `sent`, а при отключённом канале — `skipped`;
5. запрос с чужим `Origin` получает 403.

До прохождения этого теста не менять публичную ссылку LCI.
