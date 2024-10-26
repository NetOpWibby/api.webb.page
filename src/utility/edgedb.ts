


/// import

import { createClient } from "edgedb";

/// util

import e from "dbschema";
import type { $expr_Operator } from "dbschema/funcops.ts";



/// export

export const client = createClient({ database: "api" });

export function andOperation(...inputs: $expr_Operator<any, any>[]): $expr_Operator<any, any> | undefined {
  return combineOperation("and", ...inputs);
}

export function orOperation(...inputs: $expr_Operator<any, any>[]): $expr_Operator<any, any> | undefined {
  return combineOperation("or", ...inputs);
}



/// helper

function combineOperation(
  operator: string,
  ...inputs: $expr_Operator<any, any>[]
): $expr_Operator<any, any> | undefined {
  if (inputs.length === 0)
    return undefined;

  if (inputs.length === 1)
    return inputs[0];

  return e.op(
    inputs[0] as $expr_Operator<any, any>,
    operator as never,
    combineOperation(operator, ...inputs.slice(1)) as $expr_Operator<any, any>,
  )
}



/// via https://github.com/edgedb/edgedb-js/discussions/527#discussioncomment-6105799
///
/// USAGE:
/// e.select(e.Foo, () => ({
///   // ...
///   filter: andOp(e.op(foo, "=", bar), e.op(bar, "!==", baz)),
/// })
