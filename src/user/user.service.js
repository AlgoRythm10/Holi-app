const prisma = require('../prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper to generate token
function generateToken(user) {
    return jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    );
}

// SIGN UP
exports.signUp = async ({ name, email, password }) => {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
    });

    const token = generateToken(user);

    return {
        message: 'User registered successfully',
        token,
    };
};

// SIGN IN
exports.signIn = async ({ email, password }) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid credentials');

    const token = generateToken(user);

    return {
        message: 'Login successful',
        token,
    };
};

// CHECK COUPON
exports.checkCoupon = async (userId) => {
    const coupon = await prisma.couponDistribution.findUnique({
        where: { userId },
    });

    if (!coupon) {
        return {
            hasCoupon: false,
            couponCode: null,
        };
    }

    return {
        hasCoupon: coupon.hasCoupon,
        couponCode: coupon.couponCode,
    };
};

// ALLOT COUPON
exports.allotCoupon = async (userId) => {
    const existing = await prisma.couponDistribution.findUnique({
        where: { userId },
    });

    if (existing && existing.hasCoupon) {
        return {
            message: 'Coupon already allotted',
            couponCode: existing.couponCode,
        };
    }

    const couponCode = generateCouponCode();

    if (existing) {
        await prisma.couponDistribution.update({
            where: { userId },
            data: {
                hasCoupon: true,
                couponCode,
                distributedAt: new Date(),
            },
        });
    } else {
        await prisma.couponDistribution.create({
            data: {
                userId,
                hasCoupon: true,
                couponCode,
                distributedAt: new Date(),
            },
        });
    }

    return {
        message: 'Coupon allotted successfully',
        couponCode,
    };
};

// SIMPLE COUPON GENERATOR
function generateCouponCode() {
    return 'HOLI-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

//give random word
exports.getRandomWord = async () => {
    // 1. Get the total number of words in the table
    const wordCount = await prisma.word.count();

    if (wordCount === 0) throw new Error('No words found in database');

    // 2. Pick a random index
    const skip = Math.floor(Math.random() * wordCount);

    // 3. Fetch one random word
    const randomWord = await prisma.word.findFirst({
        skip: skip,
        take: 1,
    });

    // 4. (Optional) Track that this user has seen/revealed this word
    // try {
    //   await prisma.userRevealedWord.create({
    //     data: {
    //       userId: userId,
    //       wordId: randomWord.id
    //     }
    //   });
    // } catch (e) {
    //   console.log("Word already tracked for this user or tracking failed.");
    // }
    return {
        word: randomWord.value,
        description: randomWord.description
    };
};
