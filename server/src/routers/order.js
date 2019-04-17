const express = require('express');

const router = new express.Router();
const Order = require('../models/order');
const auth = require('../middleware/auth');

router.post('/orders', auth, async (req, res) => {
  const { user } = req;
  const order = new Order({
    ...req.body,
    owner: user._id,
  });

  try {
    await order.save();
    res.status(201).send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/orders/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const order = await Order.findOne({ _id, owner: req.user._id });

    if (!order) {
      return res.status(404).send();
    }
    res.send(order);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/orders/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['productName', 'counter', 'status'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({
      error: 'Invalid updates!',
    });
  }

  try {
    const order = await Order.findOne({ _id: req.params.id, owner: req.user._id });

    if (!order) {
      return res.status(404).send();
    }

    updates.forEach(update => order[update] = req.body[update]);
    await order.save();
    res.send(order);
  } catch (e) {
    res.status(400).send();
  }
});

// GET /orders?status=new
// GET /orders?limit=10&skip=10
// GET /orders?sortBy=createdAt:desc
router.get('/orders', auth, async (req, res) => {
  const match = {};
  const sort = {};
  const { status } = req.query;
  const { sortBy } = req.query;
  const { user } = req.user;

  if (status) {
    match.status = status;
  }

  if (sortBy) {
    const parts = sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  try {
    await user.populate({
      path: 'orders',
      match,
      options: {
        limit: parseInt(req.query.limit, 10),
        skip: parseInt(req.query.skip, 10),
        sort,
      },
    }).execPopulate();
    res.send(user.orders);
  } catch (e) {
    res.status(500).send();
  }
});

router.delete('/orders/:id', auth, async (req, res) => {
  const { user } = req;

  try {
    const order = await Order.findByIdAndDelete({ _id: req.params.id, owner: user._id });

    if (!order) {
      res.status(404).send();
    }

    res.send(order);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
