// prisma/seed.ts
import { PrismaClient, Role, AvailabilityStatus, ListingTier, VerificationStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@femmedirectory.com' },
    update: {},
    create: {
      email: 'admin@femmedirectory.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  })
  console.log('✅ Admin created:', admin.email)

  // Sample model data
  const modelsData = [
    {
      email: 'sofia@example.com',
      displayName: 'Sofia Milano',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      city: 'Dubai',
      citySlug: 'dubai',
      availability: AvailabilityStatus.AVAILABLE,
      listingTier: ListingTier.PREMIUM,
      isVerified: true,
      bio: 'International model based in Dubai. Available for fashion, commercial, and editorial shoots.',
    },
    {
      email: 'elena@example.com',
      displayName: 'Elena Petrova',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      city: 'Dubai',
      citySlug: 'dubai',
      availability: AvailabilityStatus.AVAILABLE,
      listingTier: ListingTier.FREE,
      isVerified: true,
      bio: 'Runway and editorial model. 5 years of experience across Europe and Middle East.',
    },
    {
      email: 'aria@example.com',
      displayName: 'Aria Johnson',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      city: 'Abu Dhabi',
      citySlug: 'abu-dhabi',
      availability: AvailabilityStatus.TRAVELING,
      listingTier: ListingTier.PREMIUM,
      isVerified: false,
      bio: 'Versatile model and content creator. Specializing in luxury brands and lifestyle.',
    },
    {
      email: 'nina@example.com',
      displayName: 'Nina Reyes',
      country: 'United Kingdom',
      countryCode: 'GB',
      city: 'London',
      citySlug: 'london',
      availability: AvailabilityStatus.AVAILABLE,
      listingTier: ListingTier.FREE,
      isVerified: true,
      bio: 'London-based model specializing in high fashion and luxury editorial.',
    },
    {
      email: 'chloe@example.com',
      displayName: 'Chloe Laurent',
      country: 'France',
      countryCode: 'FR',
      city: 'Paris',
      citySlug: 'paris',
      availability: AvailabilityStatus.BUSY,
      listingTier: ListingTier.PREMIUM,
      isVerified: true,
      bio: 'Parisian model with an eye for couture. Worked with leading fashion houses.',
    },
  ]

  for (const modelData of modelsData) {
    const password = await bcrypt.hash('Model@123456', 12)
    const slug = `${modelData.displayName.toLowerCase().replace(/\s+/g, '-')}-${modelData.citySlug}`

    const user = await prisma.user.upsert({
      where: { email: modelData.email },
      update: {},
      create: {
        email: modelData.email,
        password,
        role: Role.MODEL,
        profile: {
          create: {
            displayName: modelData.displayName,
            slug,
            bio: modelData.bio,
            country: modelData.country,
            countryCode: modelData.countryCode,
            city: modelData.city,
            citySlug: modelData.citySlug,
            availability: modelData.availability,
            listingTier: modelData.listingTier,
            isVerified: modelData.isVerified,
            age: Math.floor(Math.random() * 12) + 22,
            premiumExpiresAt: modelData.listingTier === ListingTier.PREMIUM
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              : null,
          },
        },
      },
    })
    console.log('✅ Model created:', modelData.email)
  }

  console.log('🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
