const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
// const { sendWelcomeEmail } = require('../emails/account');

router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    // sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/users/me', auth, async (req, res) => {
  const { user } = req;
  res.send(user);
});

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  const { user } = req;

  if (!isValidOperation) {
    return res.status(400).send({
      error: 'Invalid updates!',
    });
  }

  try {
    updates.forEach(update => user[update] = req.body[update]);
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(400).send();
  }
});

router.delete('/users/me', auth, async (req, res) => {
  const { user } = req;

  try {
    await user.remove();
    res.send(user);
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post('/users/logout', auth, async (req, res) => {
  const { user, token } = req;

  try {
    user.tokens = user.tokens.filter(tkn => tkn.token !== token);
    await user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  const { user } = req;
  try {
    user.tokens = [];
    await user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'));
    }

    cb(undefined, true);
  },
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const { user, file } = req;

  user.avatar = await sharp(file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  await user.save();
  res.send();
}, (error, req, res) => {
  res.status(400).send({ error: error.message });
});

router.delete('/users/me/avatar', auth, async (req, res) => {
  const { user } = req;

  user.avatar = undefined;
  await user.save();
  res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
