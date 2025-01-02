import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ProductsResolver } from './products/products.resolver';

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            playground: process.env.NODE_ENV !== 'production',
            autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
            context: ({ req }) => ({ req }),
            formatError: (error) => {
                const { message, extensions } = error;
                return {
                    message,
                    extensions: {
                        ...extensions,
                        stacktrace: undefined
                    }
                }
            }
        }),
    ],
    providers: [ProductsResolver],
})
export class GraphqlModule { }
