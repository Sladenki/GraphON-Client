# Требования к серверу для поддержки WebSocket (Socket.IO)

## Эндпоинт Socket.IO

Клиент подключается к Socket.IO серверу по адресу:

- **URL**: `http://localhost:4200/ws` (или `https://` для HTTPS)
- **Путь**: `/ws`
- **Авторизация**: Токен передается в query параметре: `token=<JWT_TOKEN>`
- **Транспорты**: `['websocket', 'polling']`

## Авторизация

1. Сервер должен извлечь токен из query параметра `token` при подключении
2. Валидировать JWT токен
3. Извлечь `userId` из токена
4. Связать Socket.IO соединение с пользователем (`userId`)

## Структура сообщений

### От сервера к клиенту

Сервер должен отправлять события через Socket.IO с именем события `relationship_event`:

```typescript
socket.emit('relationship_event', {
  type: WebSocketEventType,
  data: {
    fromUserId: string,
    toUserId: string,
    timestamp: string,
  },
});
```

Формат данных события:

```typescript
{
  "type": "friend_request_sent" | "friend_request_accepted" | "friend_request_declined" | "friend_removed",
  "data": {
    "fromUserId": "string", // ID пользователя, который выполнил действие
    "toUserId": "string",   // ID пользователя, который должен получить уведомление
    "timestamp"?: "string"  // Опционально: timestamp события
  }
}
```

### Примеры событий

#### 1. Отправка заявки в друзья

Когда пользователь A отправляет заявку пользователю B:

```json
{
  "type": "friend_request_sent",
  "data": {
    "fromUserId": "userA_id",
    "toUserId": "userB_id",
    "timestamp": "2024-01-20T10:30:00Z"
  }
}
```

**Сервер должен отправить это событие пользователю B** (toUserId) через его Socket.IO соединение:

```javascript
socket.to(userBId).emit('relationship_event', {
  type: 'friend_request_sent',
  data: {
    fromUserId: 'userA_id',
    toUserId: 'userB_id',
    timestamp: new Date().toISOString(),
  },
});
```

#### 2. Принятие заявки в друзья

Когда пользователь B принимает заявку от пользователя A:

```json
{
  "type": "friend_request_accepted",
  "data": {
    "fromUserId": "userB_id", // Тот, кто принял (выполнил действие)
    "toUserId": "userA_id", // Тот, кто отправил заявку (получает уведомление)
    "timestamp": "2024-01-20T10:35:00Z"
  }
}
```

**Сервер должен отправить это сообщение пользователю A** (toUserId).

#### 3. Отклонение заявки в друзья

Когда пользователь B отклоняет заявку от пользователя A:

```json
{
  "type": "friend_request_declined",
  "data": {
    "fromUserId": "userB_id",
    "toUserId": "userA_id",
    "timestamp": "2024-01-20T10:36:00Z"
  }
}
```

**Сервер должен отправить это сообщение пользователю A** (toUserId).

#### 4. Удаление из друзей

Когда пользователь A удаляет пользователя B из друзей:

```json
{
  "type": "friend_removed",
  "data": {
    "fromUserId": "userA_id",
    "toUserId": "userB_id",
    "timestamp": "2024-01-20T10:40:00Z"
  }
}
```

**Сервер должен отправить это событие пользователю B** (toUserId).

## Где отправлять события на сервере

### 1. В эндпоинте отправки заявки в друзья

```javascript
// POST /api/relationships/request
async function sendFriendRequest(req, res) {
  const { userId: toUserId } = req.body;
  const fromUserId = req.user._id; // Из токена

  // Сохраняем заявку в БД
  await saveFriendRequest(fromUserId, toUserId);

  // Отправляем Socket.IO событие получателю
  const io = getSocketIOServer();
  io.to(toUserId).emit('relationship_event', {
    type: 'friend_request_sent',
    data: {
      fromUserId,
      toUserId,
      timestamp: new Date().toISOString(),
    },
  });

  res.json({ success: true });
}
```

### 2. В эндпоинте принятия заявки

```javascript
// POST /api/relationships/accept
async function acceptFriendRequest(req, res) {
  const { userId: fromUserId } = req.body; // Тот, кто отправил заявку
  const toUserId = req.user._id; // Тот, кто принимает

  // Обновляем статус в БД
  await updateRelationshipStatus(fromUserId, toUserId, 'accepted');

  // Отправляем Socket.IO событие отправителю заявки
  const io = getSocketIOServer();
  io.to(fromUserId).emit('relationship_event', {
    type: 'friend_request_accepted',
    data: {
      fromUserId: toUserId, // Тот, кто принял (выполнил действие)
      toUserId: fromUserId, // Тот, кто получит уведомление
      timestamp: new Date().toISOString(),
    },
  });

  res.json({ success: true });
}
```

### 3. В эндпоинте отклонения заявки

```javascript
// POST /api/relationships/decline
async function declineFriendRequest(req, res) {
  const { userId: fromUserId } = req.body;
  const toUserId = req.user._id;

  await updateRelationshipStatus(fromUserId, toUserId, 'declined');

  const io = getSocketIOServer();
  io.to(fromUserId).emit('relationship_event', {
    type: 'friend_request_declined',
    data: {
      fromUserId: toUserId,
      toUserId: fromUserId,
      timestamp: new Date().toISOString(),
    },
  });

  res.json({ success: true });
}
```

### 4. В эндпоинте удаления из друзей

```javascript
// DELETE /api/relationships/remove
async function removeFriend(req, res) {
  const { userId: toUserId } = req.body;
  const fromUserId = req.user._id;

  await removeRelationship(fromUserId, toUserId);

  const io = getSocketIOServer();
  io.to(toUserId).emit('relationship_event', {
    type: 'friend_removed',
    data: {
      fromUserId,
      toUserId,
      timestamp: new Date().toISOString(),
    },
  });

  res.json({ success: true });
}
```

## Управление Socket.IO соединениями

Сервер должен:

1. **Использовать Socket.IO rooms для группировки соединений по userId**

2. **При подключении**:

   - Валидировать токен из query параметра
   - Извлечь userId из токена
   - Присоединить сокет к комнате с userId: `socket.join(userId)`

3. **При отключении**:

   - Socket.IO автоматически удалит сокет из всех комнат

4. **При отправке события**:
   - Использовать `io.to(userId).emit('relationship_event', event)`
   - Если пользователь не подключен: событие теряется (это нормально, пользователь получит данные при следующей загрузке страницы)

## Пример реализации на Node.js с Socket.IO

```javascript
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const http = require('http');

const server = http.createServer();
const io = new Server(server, {
  path: '/ws',
  cors: {
    origin: '*', // Настройте под ваши нужды
    methods: ['GET', 'POST'],
  },
});

// Middleware для авторизации
io.use((socket, next) => {
  const token = socket.handshake.query.token;

  if (!token) {
    return next(new Error('Token required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id || decoded.userId;
    socket.userId = userId; // Сохраняем userId в объекте socket
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log(`User ${userId} connected`);

  // Присоединяем сокет к комнате с userId
  socket.join(userId);

  socket.on('disconnect', (reason) => {
    console.log(`User ${userId} disconnected: ${reason}`);
  });

  socket.on('error', (error) => {
    console.error(`Socket.IO error for user ${userId}:`, error);
  });
});

// Функция для отправки события пользователю
function sendEventToUser(userId, event) {
  io.to(userId).emit('relationship_event', event);
}

// Использование в эндпоинтах (Express)
async function sendFriendRequest(fromUserId, toUserId) {
  // ... сохранение в БД ...

  // Отправка Socket.IO события
  sendEventToUser(toUserId, {
    type: 'friend_request_sent',
    data: {
      fromUserId,
      toUserId,
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = { io, sendEventToUser };
```

## Важные замечания

1. **Сервер НЕ должен ожидать сообщений от клиента** - клиент только слушает события
2. **Если пользователь не онлайн** - событие теряется, но это нормально, данные синхронизируются при следующей загрузке страницы
3. **Токен должен быть валидным** - если токен истек или невалиден, соединение должно быть отклонено через middleware
4. **Один пользователь может иметь несколько соединений** - если пользователь открыл несколько вкладок, Socket.IO автоматически отправит событие во все комнаты с userId
5. **Сервер должен отправлять события только после успешного сохранения в БД** - чтобы избежать рассинхронизации
6. **Используйте Socket.IO rooms** - это более надежный способ управления соединениями, чем ручное управление Map

## Тестирование

Для тестирования можно использовать Socket.IO клиент в консоли браузера:

```javascript
// В браузере (консоль)
import { io } from 'socket.io-client';

const socket = io('http://localhost:4200/ws', {
  query: { token: 'YOUR_JWT_TOKEN' },
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('Connected');
});

socket.on('relationship_event', (event) => {
  console.log('Received event:', event);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

Или использовать Socket.IO клиент через npm:

```bash
npm install -g socket.io-client
socket.io http://localhost:4200/ws?token=YOUR_TOKEN
```
