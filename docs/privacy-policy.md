# Политика конфиденциальности 5tep

Опубликовано: https://grahamfamilyfoundationinc.org/privacy-policy

Готовый текст для страницы на сайте издателя. Публикуется одной страницей с двумя
языковыми секциями: приложение локализовано на русский и английский, а App Store Connect
принимает один адрес. Тот же адрес указывается в поле Privacy Policy URL версии и
прошит в сборке (`PRIVACY_POLICY_URL` в `Configurations/Demo-*.xcconfig`).

Поля в квадратных скобках заполняются реквизитами юридического лица перед публикацией.

Текст описывает релиз 1.0.0. Начиная с 2.0.0 состав данных меняется (голосовые заметки,
контакты, Bluetooth-устройства, IDFA под ATT) — политика обновляется вместе с релизом,
до отправки версии на Review.

---

## RU

**Политика конфиденциальности приложения 5tep**

Дата вступления в силу: 22 сентября 2026

Оператор персональных данных — Graham Family Foundation, Inc., адрес: 3333 Piedmont Rd NE, Ste 2000, Atlanta, GA 30305-1740, United States
(далее — «мы»). Настоящая политика объясняет, какие данные обрабатывает мобильное
приложение 5tep (далее — «приложение») и что мы с ними делаем.

**1. Приложение работает без аккаунта**

Регистрация не обязательна. В режиме «Продолжить без аккаунта» никакие данные не покидают
устройство, и мы не получаем о вас ничего.

**2. Какие данные мы получаем, если вы создали аккаунт**

- логин, который вы придумали, и пароль — пароль хранится только в виде необратимого
  криптографического хеша (Argon2id), исходный пароль нам недоступен;
- параметры профиля, которые вы указали в онбординге: рост, вес, дневная цель шагов,
  удобное время прогулки, счётчик серии дней;
- IP-адрес запроса — обрабатывается в момент обращения, чтобы ограничить число попыток
  входа, и не сохраняется в нашей базе данных. Он может попадать в служебные журналы
  веб-сервера, которые хранятся не дольше 30 дней.

Основание обработки — ваше согласие, выраженное созданием аккаунта, и исполнение
соглашения об использовании приложения.

**3. Какие данные остаются только на вашем устройстве**

Эти данные мы не получаем и не храним:

- геопозиция и треки прогулок. Доступ к геопозиции запрашивается в момент запуска
  прогулки и используется только во время активной записи — для отрисовки маршрута,
  расчёта дистанции и темпа;
- фотографии-чекпоинты, снятые камерой на маршруте;
- карточка итога прогулки, которую вы сохраняете в галерею по собственному нажатию;
- запланированные прогулки и события, которые приложение создаёт в вашем календаре.

Удаление приложения удаляет все эти данные вместе с ним.

**4. Аналитика**

Приложение использует сервис аналитики AppMetrica (ООО «Яндекс») для статистики
использования: факт открытия экрана и нажатия на элементы интерфейса, версия приложения
и операционной системы, обезличенный идентификатор установки. В аналитику не передаются
маршруты, фотографии, координаты, логин, рост и вес. Условия обработки на стороне
сервиса: https://yandex.ru/legal/confidential/

Рекламные идентификаторы (IDFA) в релизе 1.0.0 не используются, запрос на отслеживание
не показывается.

**5. Кому мы передаём данные**

Никому, кроме указанного выше сервиса аналитики. Мы не продаём данные, не передаём их
рекламным брокерам и не используем для профилирования.

**6. Сколько мы храним данные**

Данные аккаунта — до момента его удаления. После удаления аккаунта запись и профиль
стираются из базы данных без возможности восстановления.

**7. Как удалить свои данные**

В приложении: «Настройки» → «Удалить аккаунт» — удаляет логин и профиль с сервера.
«Настройки» → «Удалить данные на устройстве» — стирает прогулки, маршруты, фотографии
и план. Действия независимы, каждое подтверждается отдельно.

Также вы вправе запросить сведения об обрабатываемых данных, их исправление или удаление,
написав на info@grahamfamilyfoundationinc.org. Ответ — в течение 30 дней.

**8. Защита данных**

Обмен с сервером идёт только по HTTPS. Токен сессии хранится в системном хранилище
Keychain, пароль на устройстве не сохраняется. Число попыток входа ограничено.

**9. Дети**

Приложение не предназначено для детей младше 13 лет, и мы сознательно не собираем их
данные.

**10. Изменения политики**

Актуальная редакция всегда доступна по этому адресу. При существенных изменениях —
например при появлении новых разрешений в очередной версии приложения — мы обновляем
текст и дату вступления в силу до выпуска версии.

Контакт: info@grahamfamilyfoundationinc.org

---

## EN

**5tep Privacy Policy**

Effective date: 22 September 2026

The data controller is Graham Family Foundation, Inc., address: 3333 Piedmont Rd NE, Ste 2000, Atlanta, GA 30305-1740, United States ("we"). This policy explains
what data the 5tep mobile app ("the app") processes and what we do with it.

**1. The app works without an account**

Registration is optional. In "Continue without account" mode no data leaves the device
and we receive nothing about you.

**2. What we receive if you create an account**

- the login you chose and your password — the password is stored only as an irreversible
  cryptographic hash (Argon2id); the original password is not available to us;
- the profile values you entered during onboarding: height, weight, daily step goal,
  preferred walking time, streak counter;
- the IP address of the request — processed at the moment of the request to rate limit
  sign-in attempts and not stored in our database. It may appear in web server logs, which
  are kept for no longer than 30 days.

**3. What stays on your device only**

We neither receive nor store:

- your location and walk tracks. Location access is requested when you start a walk and
  is used only during an active recording — to draw the route and calculate distance and
  pace;
- photo checkpoints taken along the route;
- the walk summary card you choose to save to your photo library;
- planned walks and the events the app creates in your calendar.

Deleting the app removes all of this with it.

**4. Analytics**

The app uses the AppMetrica analytics service (Yandex LLC) for usage statistics: screen
opens and interface taps, app and OS version, an anonymous installation identifier.
Routes, photos, coordinates, login, height and weight are never sent to analytics.
Service terms: https://yandex.com/legal/confidential/

Advertising identifiers (IDFA) are not used in release 1.0.0 and no tracking prompt is
shown.

**5. Sharing**

With no one except the analytics service above. We do not sell data, do not pass it to
data brokers and do not use it for profiling.

**6. Retention**

Account data is kept until you delete the account. After deletion the record and the
profile are erased from the database and cannot be restored.

**7. Deleting your data**

In the app: Settings → Delete account removes your login and profile from the server.
Settings → Delete data on this device erases walks, routes, photos and the plan. The two
actions are independent and each is confirmed separately.

You may also request information about the data we process, its correction or deletion by
writing to info@grahamfamilyfoundationinc.org. We reply within 30 days.

**8. Security**

All communication with the server uses HTTPS. The session token is kept in the system
Keychain; the password is never stored on the device. Sign-in attempts are rate limited.

**9. Children**

The app is not intended for children under 13 and we do not knowingly collect their data.

**10. Changes**

The current version is always available at this address. For material changes — such as
new permissions in a future release — we update the text and the effective date before
that version ships.

Contact: info@grahamfamilyfoundationinc.org
