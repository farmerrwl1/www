// app.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const sequelize = require('./database');
const River = require('./models/River');
const User = require('./models/User');
const FavoriteItem = require('./models/FavoriteItem');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

// Обработка POST-запроса на вход
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.send('<script>alert("Пользователь с таким именем не найден"); window.location.href = "/login";</script>');
      }
      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) {
        return res.send('<script>alert("Неверный пароль"); window.location.href = "/login";</script>');
      }
      req.session.user = user;
      res.redirect('/');
    } catch (error) {
      console.error(error);
      res.status(500).send('Что-то пошло не так на сервере');
    }
  });

// Регистрация пользователя
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const user = await User.create({ username, password: hashedPassword });
    req.session.user = user;
    res.redirect('/');
  } catch (error) {
    res.send('Ошибка при регистрации пользователя');
  }
});


// Выход из системы
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
  });

// Обработка GET-запроса на страницу входа
app.get('/login', (req, res) => {
    res.render('login', { user: req.session.user });
  });
  
  // Обработка GET-запроса на страницу регистрации
  app.get('/register', (req, res) => {
    res.render('register', { user: req.session.user });
  });
  

  // Middleware для проверки аутентификации
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
      next();
    } else {
      res.redirect('/login');
    }
  };
  
  // Защищенный маршрут для добавления реки
app.get('/admin/add', isAuthenticated, (req, res) => {
    res.render('add', { user: req.session.user });
  });

// Вывод списка рек
app.get('/', async (req, res) => {
  try {
    // Проверяем, аутентифицирован ли пользователь
    if (!req.session.user || !req.session.user.id) {
      // Если пользователь не аутентифицирован, выполните необходимые действия, например, перенаправьте на страницу входа
      
      const rivers = await River.findAll();
      res.render('index', { rivers, user: req.session.user });
    } else {
      

      // Получаем список рек
      const rivers = await River.findAll();

      // Получаем избранные реки для текущего пользователя
      const favoriteRivers = await FavoriteItem.findAll({ where: { userId: req.session.user.id } });

      // Рендерим шаблон index.ejs и передаем список рек и избранных рек
      res.render('index', { rivers, favoriteRivers, user: req.session.user });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка сервера');
  }
});





// Создание реки


// Создание реки
app.post('/admin/add', isAuthenticated, async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.send('<script>alert("Доступ запрещен"); window.location.href = "/";</script>');
  }
  const { name, length } = req.body;
  try {
    await River.create({ name, length });
    res.redirect('/');
  } catch (error) {
    res.send('Ошибка при создании реки');
  }
});




// Обработка GET-запроса для отображения формы редактирования реки
app.get('/admin/:id/edit', async (req, res) => {
    if (req.session.user.role !== 'admin') {
      return res.send('<script>alert("Доступ запрещен"); window.location.href = "/";</script>');
    }
    const riverId = req.params.id;
    try {
      const river = await River.findByPk(riverId);
      if (!river) {
        return res.status(404).send('Река не найдена');
      }
      res.render('edit', { river, user: req.session.user }); // передаем user из сессии
    } catch (error) {
      console.error('Ошибка при обработке GET-запроса для редактирования реки:', error);
      res.status(500).send('Ошибка сервера');
    }
  });

// Обработка POST-запроса для обновления реки
app.post('/admin/:id/edit', isAuthenticated, async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.send('<script>alert("Доступ запрещен"); window.location.href = "/";</script>');
  }
  const riverId = req.params.id;
  const { name, length } = req.body;
  try {
    const updatedRiver = await River.findByPk(riverId);
    if (!updatedRiver) {
      return res.status(404).send('Река не найдена');
    }
    updatedRiver.name = name;
    updatedRiver.length = length;
    await updatedRiver.save();
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка сервера');
  }
});

  

// Обработка POST-запроса для удаления реки
app.post('/admin/:id/delete', isAuthenticated, async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.send('<script>alert("Доступ запрещен"); window.location.href = "/";</script>');
  }
  const riverId = req.params.id;
  try {
    await River.destroy({ where: { id: riverId } });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка при удалении реки');
  }
});

// app.js

app.get('/favoriteRivers', async (req, res) => {
  try {
    const userId = req.session.user.id;

    const favoriteRivers = await FavoriteItem.findAll({
      where: { userId },
      include: [{ model: River, as: 'river', attributes: ['id', 'name', 'length'] }]
    });

   
    res.render('favoriteRivers', { favoriteRivers, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка сервера');
  }
});


// Маршрут для добавления реки в избранное
app.post('/favorites/add', isAuthenticated, async (req, res) => {
  const { riverId } = req.body;
  const userId = req.session.user.id;
  try {
    const existingFavorite = await FavoriteItem.findOne({ where: { userId, riverId } });
    if (existingFavorite) {
      return res.send('<script>alert("Река уже добавлена в избранное"); window.location.href = "/";</script>');
    }

    await FavoriteItem.create({ userId, riverId });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    return res.send('<script>alert("Ошибка при добавлении в избранное"); window.location.href = "/";</script>');
  }
});

// Маршрут для удаления реки из избранного
app.post('/favorites/remove', isAuthenticated, async (req, res) => {
  const { riverId } = req.body;
  const userId = req.session.user.id;
  
  try {
    await FavoriteItem.destroy({ where: { userId, riverId } });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка при удалении из избранного');
    return res.send('<script>alert("Ошибка при удалении из избранного"); window.location.href = "/";</script>');
  }
});
app.post('/favoritess/remove', isAuthenticated, async (req, res) => {
  const { riverId } = req.body;
  const userId = req.session.user.id;
  
  try {
    await FavoriteItem.destroy({ where: { userId, riverId } });
    res.redirect('/favoriteRivers');
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка при удалении из избранного');
    return res.send('<script>alert("Ошибка при удалении из избранного"); window.location.href = "/favoriteRivers";</script>');
  }
});

// Обработка ошибки 404 (маршрут не найден)
app.use((req, res, next) => {
    res.status(404).send("Извините, страница не найдена");
  });
  
  // Обработка ошибки 500 (внутренняя ошибка сервера)
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Что-то пошло не так на сервере");
  });
sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
});
