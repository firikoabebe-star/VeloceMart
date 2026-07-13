import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './common/prisma/prisma.module.js';
import { HealthController } from './common/controllers/health.controller.js';
import { ProductsModule } from './products/products.module.js';
import { CartModule } from './cart/cart.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ProductVariantsModule } from './product-variants/product-variants.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { AiModule } from './ai/ai.module.js';
import { UploadModule } from './upload/upload.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('RATE_LIMIT_TTL') ?? 60_000,
            limit: config.get<number>('RATE_LIMIT_LIMIT') ?? 100,
          },
        ],
      }),
    }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    ProductVariantsModule,
    CartModule,
    OrdersModule,
    AiModule,
    UploadModule,
    UsersModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
