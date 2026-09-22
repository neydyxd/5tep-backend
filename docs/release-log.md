# Журнал версий и Review

Требование ТЗ: по каждой версии фиксируются дата отправки на Review, версия, результат Review
и краткое описание внесённых изменений. Журнал передаётся заказчику вместе с приложением.

Прогрев на момент передачи — не менее месяца с выпуска 1.0.0. Релизы 2.0.0–4.0.0 выходят в
течение месяца после первого.

| Версия | Сборка | Отправлено на Review | Результат | Что изменилось в продукте |
|---|---|---|---|---|
| 1.0.0 | 1 | — | — | Первый релиз: кольцо из пяти сегментов, запись маршрута, фото-чекпоинты, карточка итога в галерею, план прогулок в календаре |

Результат Review указывается как `approved` или `rejected` с номером пункта App Review
Guidelines; при повторной отправке добавляется отдельная строка с новым номером сборки.

## Наполнение Info.plist по релизам

Ключ разрешения и фоновый режим появляются в `Demo/Info.plist` того релиза, в котором
начинает работать стоящая за ними функция, и дальше остаются. К 4.0.0 в файле весь перечень
ТЗ — 11 разрешений и 4 фоновых режима.

Причина: App Review 2.5.4 — объявленный фоновый режим без использующей его функции и
Usage Description без вызова разрешения читаются ревьюером как незавершённое приложение.
Формулировки не теряются: EN и RU для каждого ключа хранятся в `app.json`, поле
`capabilities[].usage_description`, и переносятся в `Info.plist` в свой релиз.

| Релиз | Добавляется в Info.plist |
|---|---|
| 1.0.0 | `NSLocationWhenInUseUsageDescription`, `NSCameraUsageDescription`, `NSPhotoLibraryAddUsageDescription`, `NSCalendarsUsageDescription`, `NSCalendarsFullAccessUsageDescription` |
| 2.0.0 | `NSMicrophoneUsageDescription`, `NSSpeechRecognitionUsageDescription`, `UIBackgroundModes: fetch` |
| 3.0.0 | `NSFaceIDUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription`, `UIBackgroundModes: audio` |
| 4.0.0 | `NSContactsUsageDescription`, `NSBluetoothAlwaysUsageDescription`, `NSUserTrackingUsageDescription`, `UIBackgroundModes: remote-notification, voip` |

Сверка файла с фактическим кодом релиза:

```
python3 capability_audit.py app.json --plist ../5tep-ios/Demo/Info.plist \
        --ios ../5tep-ios --release <версия>
```

Вместе с новым разрешением обновляется политика конфиденциальности (`docs/privacy-policy.md`
и страница на сайте издателя): состав обрабатываемых данных и раздел App Privacy в
App Store Connect должны совпадать с тем, что версия реально запрашивает.
