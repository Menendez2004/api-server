import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ProductsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
      context: ({ req }) => ({ request: req }),
      formatError: (error) => {
        const { message, extensions } = error;
        return {
          message,
          extensions: {
            ...extensions,
            stacktrace: undefined,
          },
        };
      },
    }),
  ],
})
export class GraphqlModule {}
