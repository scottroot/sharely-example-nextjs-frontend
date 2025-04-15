import {driver, isInt} from "./neo4jDriver";


/**
 * Executes a read query on the Neo4j database and formats the result.
 *
 * @param query - The Cypher query string to execute.
 * @param params - An optional object containing query parameters.
 *                 Supports strings, numbers, string arrays, and number arrays.
 * @returns A promise that resolves to an array of formatted records.
 */
export async function graphRead<T=any>(
  query: string,
  params: { [p: string]: string | number | string[] | number[] } = {},
  returnRecords: boolean = false
): Promise<T> {
  // Executes the Cypher query...
  // const { records} = await driver.executeQuery(query, params, {});
  const { records} = await driver.executeQuery(query, params, {});
  if (returnRecords) return records as T;
  // Parses the response into a usable format and return it
  return records.map((r) => {
    const obj = r.toObject();
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, extractProperties(value)])
    );
  }) as T;
}

/**
 * Extracts the properties from a Neo4j node or relationship object.
 *
 * @param value - The value to process.
 * @returns The extracted properties if applicable, otherwise the original value.
 */
function extractProperties(value: any): any {
  if (value && typeof value === "object" && "properties" in value) {
    return convertNeo4jTypes(value.properties);
  }
  return convertNeo4jTypes(value);
}

/**
 * Converts Neo4j-specific data types (e.g., integers) into native JavaScript types.
 *
 * @param obj - The value or object to convert.
 * @returns The converted value or object.
 */
function convertNeo4jTypes(obj: any): any {
  if (isInt(obj)) {
    // Converts Neo4j integer to regular JS number
    return obj.toNumber();
  } else if (Array.isArray(obj)) {
    // Recursively converts array elements
    return obj.map(convertNeo4jTypes);
  } else if (typeof obj === "object" && obj !== null) {
    // Recursively converts object properties
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertNeo4jTypes(value)])
    );
  }
  return obj;
}
