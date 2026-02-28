const router = require('express').Router();
const userService = require('./user.service');
const auth = require('./auth.middleware');


// SIGN UP
router.post('/signup', async (req, res) => {
  try {
    const result = await userService.signUp(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// SIGN IN
router.post('/signin', async (req, res) => {
  try {
    const result = await userService.signIn(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ CHECK COUPON (Protected)
router.get('/coupon', auth, async (req, res) => {
  try {
    const result = await userService.checkCoupon(req.user.userId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// ✅ ALLOT COUPON (Protected)
router.post('/allot-coupon', auth, async (req, res) => {
  try {
    const result = await userService.allotCoupon(req.user.userId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({
    message: 'Authorized',
    user: req.user
  });
});

router.get('/random-target', auth, async (req, res) => {
  try {
    // req.user.id comes from your JWT middleware
    const word = await userService.getRandomWord(req.user.userId);
    res.json({ 
      success: true, 
      word: word.value 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;

