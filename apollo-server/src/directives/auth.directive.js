import { SchemaDirectiveVisitor } from 'apollo-server-express';
import { AuthenticationError } from 'apollo-server';
import { defaultFieldResolver } from "graphql";

export class IsAuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function (...args) {
      const context = args[2];
      if (!context.me) {
        throw new AuthenticationError('USER UNAUTHENTICATED');
      }
      const result = await resolve.apply(this, args);
      return result;
    };
  }
}