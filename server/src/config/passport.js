const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('../lib/prisma'); // เรียกใช้ Prisma

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // e.g. /api/auth/google/callback
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google Profile:', profile.emails[0].value);
        
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const photo = profile.photos[0]?.value;
        const name = profile.displayName;

        // 1. เช็คว่ามี User คนนี้ในระบบหรือยัง (ดูจาก Account ที่ผูกไว้)
        const existingAccount = await prisma.account.findFirst({
          where: {
            provider: 'GOOGLE',
            providerAccountId: googleId,
          },
          include: { user: true },
        });

        if (existingAccount) {
          // ถ้ามีแล้ว -> ส่ง User เดิมกลับไป (Login สำเร็จ)
          return done(null, existingAccount.user);
        }

        // 2. ถ้ายังไม่มี -> เช็คว่ามี Email นี้ในระบบไหม (เผื่อเคยสมัครด้วยวิธีอื่น)
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          // ถ้าไม่มี User เลย -> สร้าง User ใหม่
          user = await prisma.user.create({
            data: {
              email,
              name,
              image: photo,
              role: 'STUDENT', // Default Role
            },
          });
        }

        // 3. ผูก Account Google เข้ากับ User
        await prisma.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider: 'GOOGLE',
            providerAccountId: googleId,
            access_token: accessToken,
            refresh_token: refreshToken,
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize / Deserialize User (ใช้สำหรับ Session cookie)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;